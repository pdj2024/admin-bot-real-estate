import { ref, reactive, nextTick, markRaw, toRaw } from 'vue'
import axios from 'axios'
import { GOOGLE_MAPS_API_KEY, GEMINI_API_KEY } from '@/config/constants'
import { fail } from '@/utils/sweet-alert'

// Global cache to persist across composable re-initializations during the session
const aiRegionCache = new Map<string, string>()

export function usePropertyLocation(form: any) {
  const mapContainer = ref<HTMLElement | null>(null)
  const isMapLoaded = ref(false)
  const isGeocoding = ref(false)
  const isLocationSelected = ref(false)
  const isLocating = ref(false)
  const isDetectingArea = ref(false)
  const aiDetectedResult = ref('')
  const lastAICallKey = ref('')
  const aiError = ref(false)
  const detectedKota = ref('')
  const isGeneratingAkses = ref(false)

  const currentCoords = reactive({
    lat: -7.2504,
    lng: 112.7688
  })

  // Global variables that should not be ref
  let gMap: any = null
  let gMarker: any = null
  let gGeocoder: any = null
  let gAutocompleteSessionToken: any = null
  let aiDebounceTimer: any = null

  const predictions = ref<any[]>([])
  const searchQuery = ref('')
  const isPredictionsOpen = ref(false)

  const normalizeRegionLabel = (text: string) => {
    if (!text) return ''
    return text.replace(/Daerah Khusus Ibukota/gi, 'DKI').replace(/Daerah Istimewa/gi, 'DI').replace(/\bKabupaten\b/gi, 'Kab.').trim()
  }

  const cleanKecamatan = (val: string) => {
    if (!val) return ''
    return val.replace(/^(Kecamatan|Kec\.|Kec)\s+/i, '').trim()
  }

  const detectRegionWithAI = async (kecamatan: string, kota: string) => {
    if (!GEMINI_API_KEY || !kecamatan || !kota) return
    const currentKey = `${kecamatan}-${kota}`.toLowerCase().trim()
    
    // 1. Check Global Session Cache first
    if (aiRegionCache.has(currentKey)) {
      const cached = aiRegionCache.get(currentKey)
      if (cached) {
        const cleanKota = kota.replace(/Kota\s+|Kabupaten\s+|Kab\.\s+/i, '').trim()
        form.value.Area[1] = `${cleanKota} ${cached}`
        lastAICallKey.value = currentKey
        aiError.value = false
        return
      }
    }

    if (currentKey === lastAICallKey.value) return
    
    isDetectingArea.value = true
    aiError.value = false

    if (aiDebounceTimer) clearTimeout(aiDebounceTimer)
    
    aiDebounceTimer = setTimeout(async () => {
      try {
        const modelName = 'gemini-2.0-flash'
        const prompt = `Properly categorize the district "${kecamatan}" in "${kota}", Indonesia into one of these regions: Pusat, Utara, Timur, Selatan, Barat, or Kabupaten. Answer with only the region name.`
        
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`,
          { contents: [{ parts: [{ text: prompt }] }] },
          { headers: { 'Content-Type': 'application/json', 'X-goog-api-key': GEMINI_API_KEY } }
        )

        const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
        if (aiResponse) {
          const cleanedResponse = aiResponse.replace(/[^\w\s]/gi, '').toLowerCase()
          const validRegions = ['pusat', 'utara', 'timur', 'selatan', 'barat', 'kabupaten']
          const matched = validRegions.find((r) => cleanedResponse.includes(r))
          
          if (matched) {
            const regionLabel = matched.charAt(0).toUpperCase() + matched.slice(1)
            const cleanKota = kota.replace(/Kota\s+|Kabupaten\s+|Kab\.\s+/i, '').trim()
            
            // Store in cache
            aiRegionCache.set(currentKey, regionLabel)
            
            form.value.Area[1] = `${cleanKota} ${regionLabel}`
            lastAICallKey.value = currentKey
            aiError.value = false
          }
        }
      } catch (err: any) {
        if (err.response?.status === 429) {
          console.warn('AI Rate Limit (Gemini) - Silakan pilih manual')
        } else {
          console.warn('AI Region Detection Failed:', err.message)
        }
        aiError.value = true
      } finally {
        isDetectingArea.value = false
        aiDebounceTimer = null
      }
    }, 1500) // Increase to 1.5s for safety
  }

  const generateAksesWithAI = async (namaProduk: string, alamat: string) => {
    if (!GEMINI_API_KEY || !namaProduk || !alamat) return
    isGeneratingAkses.value = true
    
    try {
      const modelName = 'gemini-2.0-flash'
      const prompt = `Berikan daftar 4-5 poin aksesibilitas populer (mall, pintu tol, kampus, rumah sakit, bandara, atau stasiun) untuk properti bernama "${namaProduk}" yang berlokasi di "${alamat}". Berikan estimasi waktu tempuh dalam menit berkendara. Balas HANYA dengan poin-poinnya saja tanpa penjelasan. Contoh format:
      5 Menit ke Galaxy Mall
      7 Menit ke Pintu Tol Kertajaya
      10 Menit ke Kampus ITS`

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { headers: { 'Content-Type': 'application/json', 'X-goog-api-key': GEMINI_API_KEY } }
      )

      const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      if (aiResponse) {
        const lines = aiResponse.split('\n').map((l: string) => l.replace(/^[-*•]\s+/, '').trim()).filter(Boolean)
        lines.forEach((line: string) => {
          if (!form.value.Akses_Jalan.includes(line)) {
            form.value.Akses_Jalan.push(line)
          }
        })
      }
    } catch (err: any) {
      console.warn('AI Accessibility Generation Failed:', err.message)
      fail('Gagal membuat daftar akses otomatis')
    } finally {
      isGeneratingAkses.value = false
    }
  }

  const cleanKotaName = (val: string) => {
    if (!val) return ''
    return val.replace(/Kota\s+|Kabupaten\s+|Kab\.\s+/i, '').trim()
  }

  const parseAddressComponents = (components: any[], displayName: string | null = null) => {
    let provinsi = '', kota = '', kecamatan = '', kelurahan = '', rute = '', nomorRumah = '', building = '', subVillage = ''
    components.forEach((c, index) => {
      const types = c.types
      const name = (c.longText || c.long_name || '').trim()
      if (types.length === 0 && index === 0 && !building) building = name
      if (types.includes('administrative_area_level_1')) provinsi = normalizeRegionLabel(name)
      else if (types.includes('administrative_area_level_2')) kota = normalizeRegionLabel(name)
      else if (types.includes('administrative_area_level_3') || (types.includes('locality') && !kecamatan)) kecamatan = cleanKecamatan(name)
      else if (types.includes('administrative_area_level_4') || types.includes('sublocality_level_1')) kelurahan = name
      else if (types.includes('administrative_area_level_5')) subVillage = name
      else if (types.includes('route')) rute = name.replace(/jalan(\.|\b)/gi, 'Jl.').replace(/\s+/g, ' ').trim()
      else if (types.includes('street_number')) nomorRumah = 'No. ' + name.replace(/No\./i, '').trim()
      else if (types.includes('premise') || types.includes('point_of_interest')) building = name
    })

    if (!kota) {
      const locality = components.find((c) => c.types.includes('locality'))
      if (locality) kota = normalizeRegionLabel(locality.long_name)
    }

    detectedKota.value = cleanKotaName(kota)
    form.value.Area[0] = [kelurahan, kecamatan, kota, provinsi].filter(Boolean).join(', ')
    if (kecamatan && kota) detectRegionWithAI(kecamatan, kota)

    let formattedSubVillage = subVillage.trim()
    if (formattedSubVillage && !formattedSubVillage.toLowerCase().includes('dusun')) formattedSubVillage = `Dusun ${formattedSubVillage}`
    const streetAndNumber = [rute, nomorRumah].filter(Boolean).join(' ')
    const addressDetails = [streetAndNumber, formattedSubVillage].filter(Boolean).join(', ')
    const buildingName = (displayName || building || '').trim().split(',')[0].trim()

    const finalParts = []
    if (buildingName && !streetAndNumber.includes(buildingName) && !formattedSubVillage.includes(buildingName)) {
      finalParts.push(buildingName)
    }
    if (addressDetails) finalParts.push(addressDetails)
    form.value.Alamat = finalParts.join(', ')
  }

  const updateCoords = (lat: number, lng: number) => {
    nextTick(() => {
      currentCoords.lat = lat
      currentCoords.lng = lng
      form.value.Area[2] = `${lat},${lng}`
    })
  }

  const geocodePosition = (pos: any) => {
    if (!gGeocoder) return
    const lat = typeof pos.lat === 'function' ? pos.lat() : pos.lat
    const lng = typeof pos.lng === 'function' ? pos.lng() : pos.lng
    isGeocoding.value = true
    gGeocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      nextTick(() => {
        isGeocoding.value = false
        if (status === 'OK' && results && results[0]) {
          isLocationSelected.value = true
          parseAddressComponents(results[0].address_components)
        }
      })
    })
  }

  const loadGoogleMaps = () => {
    if (typeof window.google?.maps?.importLibrary === 'function') {
      initMap(); return
    }
    const g: any = window; let h: any; let a: any; const c = 'google'; const l = 'importLibrary'; const q = '__ib__'
    const m = document; const b: any = g[c] || (g[c] = {}); const d = b.maps || (b.maps = {}); const r = new Set(); const e = new URLSearchParams()
    const u = () => h || (h = new Promise(async (f, n) => {
      await (a = m.createElement('script')); e.set('libraries', [...r].join(',')); e.set('key', GOOGLE_MAPS_API_KEY)
      e.set('v', 'beta'); e.set('language', 'id'); e.set('region', 'ID'); e.set('callback', c + '.maps.' + q)
      a.src = `https://maps.${c}apis.com/maps/api/js?` + e; d[q] = f; a.onerror = () => (h = n(Error('Maps could not load.')))
      m.head.append(a)
    }))
    d[l] = (f: any, ...n: any[]) => r.add(f) && u().then(() => d[l](f, ...n))
    initMap()
  }

  const initMap = async () => {
    if (!mapContainer.value) return
    if (gMap) gMap = null
    try {
      const [libraryMap, libraryMarker] = await Promise.all([
        google.maps.importLibrary('maps'), 
        google.maps.importLibrary('marker'), 
        google.maps.importLibrary('places')
      ]) as any[]
      gGeocoder = new google.maps.Geocoder()
      let initialPos = { ...currentCoords }
      if (form.value.Area[2] && form.value.Area[2].includes(',')) {
        const [lat, lng] = form.value.Area[2].split(',').map(Number)
        if (!isNaN(lat) && !isNaN(lng)) initialPos = { lat, lng }
      }
      gMap = new libraryMap.Map(mapContainer.value, { 
        center: initialPos, 
        zoom: 15, 
        mapId: 'PROPERTY_PICKER_MAP', 
        mapTypeControl: false, 
        streetViewControl: false 
      })
      isMapLoaded.value = true
      gMarker = new libraryMarker.AdvancedMarkerElement({ map: gMap, position: initialPos, gmpDraggable: true })
      
      const { AutocompleteSessionToken } = await google.maps.importLibrary('places') as any
      gAutocompleteSessionToken = new AutocompleteSessionToken()

      gMarker.addListener('dragend', () => { 
        if (gMarker.position) { 
          updateCoords(gMarker.position.lat, gMarker.position.lng); 
          geocodePosition(gMarker.position) 
        }
      })
      
      gMap.addListener('click', (e: any) => { 
        if (e.latLng) { 
          const lat = e.latLng.lat(); const lng = e.latLng.lng(); 
          gMarker.position = {lat, lng}; 
          updateCoords(lat, lng); 
          geocodePosition({lat, lng}); 
          isLocationSelected.value = true 
        }
      })
    } catch (err) {
      console.error('Error initializing map picker:', err)
    }
  }

  const geocodeExistingAddress = () => {
    if (!gGeocoder) return
    if (form.value.Area[2] && form.value.Area[2].includes(',')) {
      const [lat, lng] = form.value.Area[2].split(',').map(Number)
      if (!isNaN(lat) && !isNaN(lng)) {
        currentCoords.lat = lat; currentCoords.lng = lng
        if (gMap) gMap.setCenter({ lat, lng })
        if (gMarker) gMarker.position = { lat, lng }
        return
      }
    }
    const targetAddress = form.value.Area[0] || form.value.Alamat
    if (!targetAddress) return
    gGeocoder.geocode({ address: targetAddress }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const pos = results[0].geometry.location
        currentCoords.lat = pos.lat(); currentCoords.lng = pos.lng()
        if (gMap) gMap.setCenter(pos)
        if (gMarker) gMarker.position = pos
        updateCoords(pos.lat(), pos.lng())
      }
    })
  }

  const handleSearchInput = async () => {
    if (!searchQuery.value) { predictions.value = []; isPredictionsOpen.value = false; return }
    try {
      if (!gAutocompleteSessionToken) {
        const { AutocompleteSessionToken } = await google.maps.importLibrary('places') as any
        gAutocompleteSessionToken = new AutocompleteSessionToken()
      }
      const { AutocompleteSuggestion } = await google.maps.importLibrary('places') as any
      const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({ 
        input: searchQuery.value, 
        sessionToken: gAutocompleteSessionToken, 
        includedRegionCodes: ['id'] 
      })
      if (suggestions && suggestions.length) {
        predictions.value = suggestions.map((s: any) => ({
          placeId: s.placePrediction?.placeId,
          mainText: s.placePrediction?.text?.text || s.placePrediction?.text,
          secondaryText: s.placePrediction?.secondaryText?.text,
          raw: markRaw(s)
        }))
        isPredictionsOpen.value = true
      }
    } catch {}
  }

  const selectPrediction = async (mappedPrediction: any) => {
    try {
      form.value.Area[1] = ''
      const suggestion = toRaw(mappedPrediction.raw)
      searchQuery.value = mappedPrediction.mainText
      isPredictionsOpen.value = false
      const place = suggestion.placePrediction.toPlace()
      await place.fetchFields({ fields: ['location', 'addressComponents', 'formattedAddress'] })
      if (place.location) {
        isLocationSelected.value = true
        gMap?.setCenter(place.location)
        gMap?.setZoom(17)
        if (gMarker) gMarker.position = place.location
        form.value.Link_Maps = `https://www.google.com/maps?q=${place.location.lat()},${place.location.lng()}`
        form.value.Alamat = place.formattedAddress || ''
        if (place.addressComponents) parseAddressComponents(place.addressComponents)
      }
    } catch {}
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return fail('Geolocation tidak didukung')
    isLocating.value = true
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = { lat: position.coords.latitude, lng: position.coords.longitude }
        nextTick(() => {
          isLocating.value = false
          isLocationSelected.value = true
          if (gMap) gMap.setCenter(pos)
          if (gMarker) gMarker.position = pos
          updateCoords(pos.lat, pos.lng)
          geocodePosition(pos)
        })
      },
      (err) => { isLocating.value = false; fail('Gagal mendapat lokasi') }
    )
  }

  return {
    mapContainer,
    isMapLoaded,
    isLocationSelected,
    isLocating,
    isDetectingArea,
    isGeneratingAkses,
    aiError,
    detectedKota,
    searchQuery,
    predictions,
    isPredictionsOpen,
    currentCoords,
    loadGoogleMaps,
    handleSearchInput,
    selectPrediction,
    getCurrentLocation,
    geocodeExistingAddress,
    generateAksesWithAI
  }
}
