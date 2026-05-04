import { ref, reactive, nextTick, markRaw, toRaw } from 'vue'
import { GOOGLE_MAPS_API_KEY } from '@/config/constants'
import { fail } from '@/utils/sweet-alert'

export function usePropertyLocation(form: any, deps?: { cities: any, createCity: (name: string) => Promise<any> }) {
  const mapContainer = ref<HTMLElement | null>(null)
  const isMapLoaded = ref(false)
  const isGeocoding = ref(false)
  const isLocationSelected = ref(false)
  const isLocating = ref(false)
  const detectedKota = ref('')

  const currentCoords = reactive({
    lat: -7.2504,
    lng: 112.7688
  })

  // Global variables that should not be ref
  let gMap: any = null
  let gMarker: any = null
  let gGeocoder: any = null
  let gAutocompleteSessionToken: any = null

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

  const cleanKotaName = (val: string) => {
    if (!val) return ''
    return val.replace(/Kota\s+|Kabupaten\s+|Kab\.\s+/i, '').trim()
  }

  const extractCoordsFromAddress = (address: string) => {
    if (!address) return null
    const latMatch = address.match(/Lat:\s*(-?\d+\.\d+)/i)
    const lngMatch = address.match(/Long:\s*(-?\d+\.\d+)/i)
    if (latMatch && lngMatch) {
      return { lat: parseFloat(latMatch[1]), lng: parseFloat(lngMatch[1]) }
    }
    return null
  }

  const parseAddressComponents = async (components: any[], displayName: string | null = null) => {
    let provinsi = '', kota = '', kecamatan = '', kelurahan = '', rute = '', nomorRumah = '', building = '', subVillage = ''
    
    components.forEach((c, index) => {
      // Handle both object format { types, long_name } and array format [ long_name, short_name, types ]
      const types = Array.isArray(c) ? (c[2] || []) : (c.types || [])
      const name = Array.isArray(c) ? (String(c[0] || '').trim()) : (String(c.longText || c.long_name || '').trim())
      
      if (!types || types.length === 0) {
        if (index === 0 && !building) building = name
        return
      }

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
      const locality = components.find((c) => {
        const types = Array.isArray(c) ? (c[2] || []) : (c.types || [])
        return types.includes('locality')
      })
      if (locality) {
        const name = Array.isArray(locality) ? locality[0] : locality.long_name
        kota = normalizeRegionLabel(name)
      }
    }

    const cleanK = cleanKotaName(kota)
    detectedKota.value = cleanK
    form.value.Area[0] = [kelurahan, kecamatan, kota, provinsi].filter(Boolean).join(', ')
    form.value.Area[1] = [cleanK, provinsi].filter(Boolean).join(', ') // Suggested City, Province format
    form.value.Kecamatan = kecamatan
    form.value.Kelurahan = kelurahan

    // NEW: Sync with City Dropdown if exists
    if (deps && cleanK && provinsi) {
      const targetCityFull = `${cleanK}, ${provinsi}`
      const citiesList = Array.isArray(deps.cities) ? deps.cities : (deps.cities?.value || [])
      
      // 1. Try exact match (City, Province)
      let matched = citiesList.find((c: any) => 
        (c.Nama || c.Name || '').toLowerCase().trim() === targetCityFull.toLowerCase().trim()
      )
      
      // 2. Fallback to just City name match
      if (!matched) {
        matched = citiesList.find((c: any) => 
          (c.Nama || c.Name || '').toLowerCase().trim() === cleanK.toLowerCase().trim() ||
          (c.Nama || c.Name || '').toLowerCase().trim().startsWith(cleanK.toLowerCase().trim() + ',')
        )
      }
      
      if (matched) {
        form.value.Id_Kota = matched.No_Id || matched.No_Id_Kota
      } else {
        // Automatically create city if not found
        const newId = await deps.createCity(targetCityFull)
        if (newId) {
          // After creation, update Id_Kota
          form.value.Id_Kota = newId
          
          // Double check match in the now-updated list to be safe
          const updatedList = Array.isArray(deps.cities) ? deps.cities : (deps.cities?.value || [])
          const doubleCheck = updatedList.find((c: any) => 
            (c.No_Id === newId || c.No_Id_Kota === newId)
          )
          if (doubleCheck) {
             form.value.Id_Kota = doubleCheck.No_Id || doubleCheck.No_Id_Kota
          }
        }
      }
    }

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
      e.set('v', 'beta'); e.set('language', 'id'); e.set('region', 'ID'); e.set('callback', c + '.maps.' + q); e.set('loading', 'async')
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
      const coordsFromAlamat = extractCoordsFromAddress(form.value.Alamat)
      
      if (form.value.Area[2] && form.value.Area[2].includes(',')) {
        const [lat, lng] = form.value.Area[2].split(',').map(Number)
        if (!isNaN(lat) && !isNaN(lng)) initialPos = { lat, lng }
      } else if (coordsFromAlamat) {
        initialPos = coordsFromAlamat
      }
      gMap = markRaw(new libraryMap.Map(mapContainer.value, { 
        center: initialPos, 
        zoom: 15, 
        mapId: 'PROPERTY_PICKER_MAP', 
        mapTypeControl: false, 
        streetViewControl: false,
        gestureHandling: 'greedy'
      }))
      isMapLoaded.value = true
      gMarker = markRaw(new libraryMarker.AdvancedMarkerElement({ 
        map: gMap, 
        position: initialPos, 
        gmpDraggable: true 
      }))
      
      const { AutocompleteSessionToken } = await google.maps.importLibrary('places') as any
      gAutocompleteSessionToken = markRaw(new AutocompleteSessionToken())

      gMarker.addListener('dragend', () => { 
        if (gMarker.position) { 
          updateCoords(gMarker.position.lat, gMarker.position.lng); 
          geocodePosition(gMarker.position) 
        }
      })
      
      gMap.addListener('gmp-click', (e: any) => { 
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
    const coordsFromAlamat = extractCoordsFromAddress(form.value.Alamat)

    if (form.value.Area[2] && form.value.Area[2].includes(',')) {
      const [lat, lng] = form.value.Area[2].split(',').map(Number)
      if (!isNaN(lat) && !isNaN(lng)) {
        currentCoords.lat = lat; currentCoords.lng = lng
        if (gMap) gMap.setCenter({ lat, lng })
        if (gMarker) gMarker.position = { lat, lng }
        return
      }
    } else if (coordsFromAlamat) {
      const { lat, lng } = coordsFromAlamat
      currentCoords.lat = lat; currentCoords.lng = lng
      if (gMap) gMap.setCenter({ lat, lng })
      if (gMarker) gMarker.position = { lat, lng }
      isLocationSelected.value = true
      return
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
    if (typeof google === 'undefined' || !google.maps) {
      // Library not ready yet, will be triggered again by watcher or input
      return
    }
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
      () => { isLocating.value = false; fail('Gagal mendapat lokasi') }
    )
  }

  return {
    mapContainer,
    isMapLoaded,
    isLocationSelected,
    isLocating,
    detectedKota,
    searchQuery,
    predictions,
    isPredictionsOpen,
    currentCoords,
    loadGoogleMaps,
    handleSearchInput,
    selectPrediction,
    getCurrentLocation,
    geocodeExistingAddress
  }
}
