<script setup lang="ts">
import { ref, reactive, watch, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { success, fail } from '@/utils/sweet-alert'
import api from '@/services/axios'
import axios from 'axios'

import { GOOGLE_MAPS_API_KEY, GEMINI_API_KEY } from '@/config/constants'

const newAkses = ref('')
const panjang = ref('')
const lebar = ref('')
const photos = ref<File[]>([])
const extensionsPhotos = ref<string[]>([])
const previewPhotos = ref<any[]>([])
const selectedFiles = ref<File[]>([])
const deletedMediaIds = ref<string[]>([])
const autocompleteInput = ref<HTMLInputElement | null>(null)
const mapContainer = ref<HTMLElement | null>(null)
const isMapLoaded = ref(false)

const isGeocoding = ref(false)
const isLocationSelected = ref(false)
const isLocating = ref(false)
const isDetectingArea = ref(false)

// --- Gemini API State ---
const detectRegionWithAI = async (kecamatan: string, kota: string) => {
  if (!GEMINI_API_KEY || !kecamatan || !kota) return

  isDetectingArea.value = true
  try {
    // 1. Ambil daftar model yang tersedia untuk Key ini
    const listModels = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`)
    const models = listModels.data.models || []
    
    // 2. Filter model yang stabil (hindari preview/experimental jika mungkin)
    const stableModels = models.filter((m: any) => 
      !m.name.toLowerCase().includes('preview') && 
      !m.name.toLowerCase().includes('experimental') &&
      m.supportedGenerationMethods.includes('generateContent')
    )

    // Cari versi Flash di dalam daftar yang stabil
    const bestModel = stableModels.find((m: any) => m.name.includes('1.5-flash')) || 
                    stableModels.find((m: any) => m.name.includes('flash')) ||
                    stableModels[0] || 
                    models[0]

    if (!bestModel) throw new Error('No compatible Gemini models found for this API Key.')

    const modelName = bestModel.name
    console.log('Using Stable Dynamic Model:', modelName)

    const prompt = `Properly categorize the district "${kecamatan}" in "${kota}", Indonesia into one of these regions: Pusat, Utara, Timur, Selatan, Barat, or Kabupaten. Answer with only the region name.`
    
    // 3. Panggil API dengan metode Header seperti contoh cURL Anda
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent`, 
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY
        }
      }
    )

    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    console.log(aiResponse)
    if (aiResponse) {
      // Hilangkan tanda baca jika ada
      const cleanedResponse = aiResponse.replace(/[^\w\s]/gi, '').toLowerCase()

      console.log(cleanedResponse)
      
      // Validasi hasil agar masuk ke salah satu dari preset kita
      const validRegions = ['pusat', 'utara', 'timur', 'selatan', 'barat', 'kabupaten']
      const matched = validRegions.find(r => cleanedResponse.includes(r))
      
      if (matched) {
        // Jika kota bukan Surabaya, kita gabungkan: "Jakarta Selatan"
        // Jika Surabaya, tetap gunakan format "Surabaya Selatan"
        form.value.Area[1] = `${kota.replace(/Kota\s+/i, '')} ${matched.charAt(0).toUpperCase() + matched.slice(1)}`.toLowerCase()
        console.log(form.value.Area[1])
      }
    }
  } catch (error: any) {
    console.error('Gemini AI Detailed Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data, // Ini akan berisi alasan spesifik dari Google
      message: error.message
    })
    isDetectingArea.value = false
  }
}

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    fail('Geolocation tidak didukung oleh browser ini.')
    return
  }

  isLocating.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      const pos = { lat: latitude, lng: longitude }

      nextTick(() => {
        isLocating.value = false
        isLocationSelected.value = true

        if (gMap) gMap.setCenter(pos)
        if (gMarker) gMarker.position = pos

        updateCoords(latitude, longitude)
        geocodePosition(pos)
      })
    },
    (error) => {
      isLocating.value = false
      let msg = 'Gagal mendapatkan lokasi.'
      if (error.code === error.PERMISSION_DENIED) {
        msg = 'Izin lokasi ditolak. Silakan aktifkan izin GPS di browser Anda.'
      }
      fail(msg)
      console.error('Geolocation error:', error)
    },
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  )
}

const currentCoords = reactive({
  lat: -7.2504, // Default Surabaya
  lng: 112.7688
})

let gMap: any = null
let gMarker: any = null
let gAutocomplete: any = null
let gGeocoder: any = null
// --------------------------

const scrollContainer = ref<HTMLElement | null>(null)

const isLoading = ref(false)
const openType = ref(false)
const searchType = ref('')
const dropdownTypeRef = ref<HTMLElement | null>(null)

const openCertificate = ref(false)
const searchCertificate = ref('')
const dropdownCertificateRef = ref<HTMLElement | null>(null)

const props = defineProps<{
  showModal: boolean
  itemData?: any
}>()

const emit = defineEmits(['update:showModal', 'success', 'close'])

interface MediaUrl {
  Url: string | null
  Expired_At: Date
  IsCompressed: false
  ContentType: string
  ThumbUrl: string | null
  Size: number
  Id_Media: string
  No_Id_Media: string
}

interface RealEstateForm {
  No_Id: string
  Nama_Produk: string
  Alamat: string
  Hide_alamat: boolean
  Tipe: string
  Tipe_Ukuran: string
  Jenis_Sertifikat: string
  Luas_Tanah: number
  Luas_Bangunan: number
  Jumlah_Lantai: number
  Jumlah_Kamar_Tidur: number
  Jumlah_Kamar_Mandi: number
  Jumlah_Carpot: number
  Daya_Listrik: number
  Status_Display: string
  Status_Properti: string
  Status_Transaksi: string[]
  Flag_Sewa: 'Ya' | 'Tidak'
  Ada_Minimal_Sewa?: boolean
  Minimal_Sewa: number | null
  Satuan_Minimal_Sewa: 'Bulan' | 'Tahun' | ''
  Harga_Jual1: number
  Harga_Jual2: number
  Harga_Sewa1: number
  Harga_Sewa2: number
  Keterangan: string
  Slug: string
  Area: string[]
  Akses_Jalan: string[]
  File_Image: string[]
  MediaUrls: MediaUrl[]
}

// interface MediaItem {
//   Url: string | null
//   Expired_At: string
//   IsCompressed: boolean
//   ContentType: string
//   ThumbUrl: string | null
//   Size: number
//   Id_Media: string
//   No_Id_Media: string
// }

const specs = [
  { key: 'Jumlah_Kamar_Tidur', label: 'Jml Kamar', icon: 'lucide:bed' },
  { key: 'Jumlah_Kamar_Mandi', label: 'Jml KM', icon: 'lucide:bath' },
  { key: 'Jumlah_Carpot', label: 'Carport', icon: 'lucide:car' },
  { key: 'Daya_Listrik', label: 'Daya Listrik (W)' }
] as const

// --- State Management ---
const defaultForm = (): RealEstateForm => ({
  No_Id: '',
  Nama_Produk: '',
  Alamat: '',
  Hide_alamat: false,
  Tipe: 'Rumah',
  Tipe_Ukuran: '',
  Jenis_Sertifikat: '',
  Luas_Tanah: 0,
  Luas_Bangunan: 0,
  Jumlah_Lantai: 0,
  Jumlah_Kamar_Tidur: 0,
  Jumlah_Kamar_Mandi: 0,
  Jumlah_Carpot: 0,
  Daya_Listrik: 0,
  Status_Display: 'Aktif',
  Status_Properti: 'Tersedia',
  Status_Transaksi: ['Jual'],
  Flag_Sewa: 'Tidak',
  Ada_Minimal_Sewa: false,
  Minimal_Sewa: 0,
  Satuan_Minimal_Sewa: 'Tahun',
  Harga_Jual1: 0,
  Harga_Jual2: 0,
  Harga_Sewa1: 0,
  Harga_Sewa2: 0,
  Keterangan: '',
  Slug: '',
  Area: ['', '', ''],
  Akses_Jalan: [],
  File_Image: [],
  MediaUrls: []
})

const form = ref<RealEstateForm>(defaultForm())

watch([panjang, lebar], ([newP, newL]) => {
  if (newP || newL) {
    form.value.Tipe_Ukuran = `${newP}x${newL}`
  } else {
    form.value.Tipe_Ukuran = ''
  }
})

watch(
  () => props.showModal,
  (newVal) => {
    if (newVal) {
      // Clear all photo-related state on every modal opening
      photos.value = []
      extensionsPhotos.value = []
      selectedFiles.value = []
      previewPhotos.value = []
      deletedMediaIds.value = []

      if (props.itemData) {
        // Deep copy the item data to avoid mutating props or shared refs
        form.value = JSON.parse(JSON.stringify(props.itemData))

        // Trigger map centering for edit mode
        nextTick(() => {
          if (form.value.Area[0] || form.value.Alamat) {
            geocodeExistingAddress()
          }
        })

        if (props.itemData.Tipe_Ukuran) {
          const splitUkuran = props.itemData.Tipe_Ukuran.split('x')
          panjang.value = splitUkuran[0] || ''
          lebar.value = splitUkuran[1] || ''
        }

        // Initialize preview from existing MediaUrls
        if (props.itemData.File_Image && props.itemData.MediaUrls) {
          previewPhotos.value = [...props.itemData.MediaUrls]
        }

        if (props.itemData.Minimal_Sewa != null && props.itemData.Minimal_Sewa > 0) {
          form.value.Ada_Minimal_Sewa = true
        } else {
          form.value.Ada_Minimal_Sewa = false
        }
      } else {
        form.value = defaultForm()
        previewPhotos.value = []
        photos.value = []
        panjang.value = ''
        lebar.value = ''
        isLocationSelected.value = false
      }

      // Map visibility based on Area[2] coordinate existence
      if (form.value.Area[2] && form.value.Area[2] !== '') {
        isLocationSelected.value = true
        // Parse coordinates and update map center early
        const [lat, lng] = form.value.Area[2].split(',').map(Number)
        if (!isNaN(lat) && !isNaN(lng)) {
          currentCoords.lat = lat
          currentCoords.lng = lng
        }
      } else {
        isLocationSelected.value = false
      }

      // Trigger map centering/geocoding if needed
      nextTick(() => {
        if (isLocationSelected.value || form.value.Area[0] || form.value.Alamat) {
          geocodeExistingAddress()
        }
      })
    }
  }
)

const propertyTypes = ['Rumah', 'Tanah', 'Ruko', 'Apartemen', 'Gudang', 'Villa', 'SOHO', 'Pabrik', 'Perkantoran', 'Hotel', 'Rumah Kos', 'Stand', 'Toko', 'Gedung', 'Condotel', 'Lain-lain']

const filteredTypes = computed(() => {
  return propertyTypes.filter((t) => t.toLowerCase().includes(searchType.value.toLowerCase()))
})

const certificateTypes = ['SHM', 'SHGB', 'HGU', 'HP', 'HMRS', 'Girik', 'Petok D', 'AJB', 'PPJB', 'Surat Ijo', 'Strata Title', 'Lainnya']

const filteredCertificates = computed(() => {
  return certificateTypes.filter((t) => t.toLowerCase().includes(searchCertificate.value.toLowerCase()))
})

// --- Dynamic Area Options ---
const currentCity = computed(() => {
  if (!form.value.Area[0]) return ''
  const parts = form.value.Area[0].split(',').map((p) => p.trim())
  // Biasanya Kota ada di bagian ke-3 (Kelurahan, Kecamatan, KOTA, Provinsi)
  // Tapi kita cari yang mengandung kata "Kota" atau "Kabupaten" atau ambil yang ke-3 dari belakang
  if (parts.length >= 3) return parts[parts.length - 2] // Misal: ["A", "B", "Surabaya", "Jawa Timur"] -> Surabaya
  return parts[0]
})

const areaOptions = computed(() => {
  const city = currentCity.value
  const directions = ['Pusat', 'Utara', 'Timur', 'Selatan', 'Barat']
  let options = directions

  if (city) {
    options = directions.map((dir) => `${city} ${dir}`)
  }

  // Penting: Jika data dari database (form.Area[1]) tidak ada di list arah mata angin,
  // masukkan ke list agar bisa ditampilkan/diedit (misal: "Kemang", "Canggu")
  const existingArea = form.value.Area[1]
  if (existingArea && !options.some((opt) => opt.toLowerCase() === existingArea.toLowerCase())) {
    // Gunakan format asli dari DB namun pastikan Kapital di awal kata untuk tampilan
    const formatted = existingArea
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
    options.push(formatted)
  }

  return options
})

// --- Google Maps Integration Logic ---
const loadGoogleMaps = () => {
  // Jika sudah ada, langsung init
  if (typeof window.google?.maps?.importLibrary === 'function') {
    initMap()
    return
  }

  // Buat loader ala dokumentasi resmi Google Maps
  const g: any = window
  let h: any, a: any
  const p = 'The Google Maps JavaScript API'
  const c = 'google'
  const l = 'importLibrary'
  const q = '__ib__'
  const m = document
  const b: any = g[c] || (g[c] = {})
  const d = b.maps || (b.maps = {})
  const r = new Set()
  const e = new URLSearchParams()

  const u = () =>
    h ||
    (h = new Promise(async (f, n) => {
      await (a = m.createElement('script'))
      e.set('libraries', [...r].join(','))
      e.set('key', GOOGLE_MAPS_API_KEY)
      e.set('v', 'beta')
      e.set('language', 'id')
      e.set('region', 'ID')
      e.set('callback', c + '.maps.' + q) // CRITICAL: Signal Google to resolve the promise
      a.src = `https://maps.${c}apis.com/maps/api/js?` + e
      d[q] = f
      a.onerror = () => (h = n(Error(p + ' could not load.')))
      a.nonce = (m.querySelector('script[nonce]') as any)?.nonce || ''
      m.head.append(a)
    }))

  d[l] = (f: any, ...n: any[]) => r.add(f) && u().then(() => d[l](f, ...n))

  // Jalankan inisialisasi
  initMap()
}

const initMap = async () => {
  if (!mapContainer.value || gMap) return

  try {
    const [libraryMap, libraryMarker, libraryPlaces] = (await Promise.all([google.maps.importLibrary('maps'), google.maps.importLibrary('marker'), google.maps.importLibrary('places')])) as [google.maps.MapsLibrary, google.maps.MarkerLibrary, google.maps.PlacesLibrary]

    const { Map } = libraryMap
    const { AdvancedMarkerElement } = libraryMarker
    const { Autocomplete } = libraryPlaces

    gGeocoder = new google.maps.Geocoder()

    gMap = new Map(mapContainer.value, {
      center: currentCoords,
      zoom: 15,
      mapId: 'DEMO_MAP_ID',
      mapTypeControl: false,
      streetViewControl: false
    })

    // Resolve loading state as soon as Map is ready
    isMapLoaded.value = true

    gMarker = new AdvancedMarkerElement({
      map: gMap,
      position: currentCoords,
      gmpDraggable: true,
      title: 'Lokasi Properti'
    })

    if (autocompleteInput.value) {
      gAutocomplete = new Autocomplete(autocompleteInput.value, {
        fields: ['address_components', 'geometry', 'formatted_address'],
        componentRestrictions: { country: 'id' }
      })

      gAutocomplete.addListener('place_changed', () => {
        const place = gAutocomplete.getPlace()

        if (!place.geometry || !place.geometry.location) return
        
        const loc = place.geometry.location
        gMap.setCenter(loc)
        gMarker.position = { lat: loc.lat(), lng: loc.lng() }
        updateCoords(loc.lat(), loc.lng())

        nextTick(() => {
          // Tetap gunakan parseAddressComponents yang baru karena support long_name
          parseAddressComponents(place.address_components || [])
          isLocationSelected.value = true
        })
      })
    }

    gMarker.addListener('dragend', () => {
      const pos = gMarker.position
      if (pos) {
        updateCoords(pos.lat, pos.lng)
        geocodePosition(pos)
      }
    })

    gMap.addListener('click', (event: any) => {
      if (event.latLng) {
        const lat = event.latLng.lat()
        const lng = event.latLng.lng()
        gMarker.position = { lat, lng }
        updateCoords(lat, lng)
        geocodePosition({ lat, lng })
        isLocationSelected.value = true
      }
    })
  } catch (error) {
    console.error('Gagal inisialisasi Google Maps:', error)
  }
}

const geocodeExistingAddress = () => {
  if (!gGeocoder) return

  // Prioritize coordinates from Area[2]
  if (form.value.Area[2] && form.value.Area[2].includes(',')) {
    const [lat, lng] = form.value.Area[2].split(',').map(Number)
    if (!isNaN(lat) && !isNaN(lng)) {
      const pos = { lat, lng }
      currentCoords.lat = lat
      currentCoords.lng = lng
      if (gMap) gMap.setCenter(pos)
      if (gMarker) gMarker.position = pos
      return // Coordinate takes priority, stop here
    }
  }

  const targetAddress = form.value.Area[0] || form.value.Alamat
  if (!targetAddress) return

  gGeocoder.geocode({ address: targetAddress }, (results: any, status: any) => {
    if (status === 'OK' && results[0]) {
      const pos = results[0].geometry.location
      currentCoords.lat = pos.lat()
      currentCoords.lng = pos.lng()

      if (gMap) gMap.setCenter(pos)
      if (gMarker) gMarker.position = pos
      // Also update Area[2] if it was empty
      updateCoords(pos.lat(), pos.lng())
    }
  })
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

const cleanKecamatan = (val: string) => {
  if (!val) return ''
  return val.replace(/^(Kecamatan|Kec\.|Kec)\s+/i, '').trim()
}

const SURABAYA_REGIONS: Record<string, string[]> = {
  'Surabaya Pusat': ['Tegalsari', 'Simokerto', 'Genteng', 'Bubutan'],
  'Surabaya Timur': ['Gubeng', 'Gunung Anyar', 'Sukolilo', 'Tambaksari', 'Mulyorejo', 'Rungkut', 'Tenggilis Mejoyo'],
  'Surabaya Barat': ['Benowo', 'Pakal', 'Asemrowo', 'Sukomanunggal', 'Tandes', 'Sambikerep', 'Lakarsantri'],
  'Surabaya Utara': ['Bulak', 'Kenjeran', 'Semampir', 'Pabean Cantian', 'Krembangan'],
  'Surabaya Selatan': ['Wonokromo', 'Wonocolo', 'Wiyung', 'Karang Pilang', 'Jambangan', 'Gayungan', 'Dukuh Pakis', 'Sawahan']
}

const parseAddressComponents = (components: google.maps.GeocoderAddressComponent[]) => {
  let provinsi = ''
  let kota = ''
  let kecamatan = ''
  let kelurahan = ''
  let rute = ''
  let nomorRumah = ''
  let building = ''
  let neighborhood = ''
  let rt = ''
  let rw = ''
  let unit = ''

  components.forEach((c) => {
    const types = c.types
    // Handle both old (long_name) and new (longText) API formats
    const name = ((c as any).longText || c.long_name || '').trim()

    if (types.includes('administrative_area_level_1')) {
      provinsi = name
    } else if (types.includes('administrative_area_level_2')) {
      kota = name
    } else if (types.includes('administrative_area_level_3') || (types.includes('locality') && !kecamatan)) {
      kecamatan = cleanKecamatan(name)
    } else if (types.includes('administrative_area_level_4') || types.includes('sublocality_level_1')) {
      kelurahan = name
    } else if (types.includes('route')) {
      rute = rute != '' ? rute + ' ' + name.replace(/jalan\.|Jalan\./gi, 'Jl.') : name.replace(/jalan\.|Jalan\./gi, 'Jl.')
    } else if (types.includes('street_number')) {
      nomorRumah = 'No. ' + name.replace(/No\./i, '').trim()
    } else if (types.includes('subpremise')) {
      unit = name
    } else if (types.includes('premise') || types.includes('point_of_interest') || types.includes('establishment')) {
      building = name
    } else if (types.includes('neighborhood') || types.includes('sublocality_level_2')) {
      neighborhood = name
    } else if (types.includes('administrative_area_level_7')) {
      rw = name
    } else if (types.includes('administrative_area_level_6')) {
      rt = name
    }
  })

  if (!kota) {
    const locality = components.find((c) => c.types.includes('locality'))
    if (locality) kota = locality.long_name.trim()
  }

  // Normalize Special Regions (DKI, DIY) & Kabupaten
  const normalizeRegion = (text: string) => {
    return (
      text
        .replace(/Daerah Khusus Ibukota/gi, 'DKI')
        .replace(/Daerah Istimewa/gi, 'DIY')
        .replace(/\bKabupaten\b/gi, 'Kab.')
        // English-to-Indonesian Mapping (Failsafe)
        .replace(/Riau Islands/gi, 'Kepulauan Riau')
        .replace(/Batam City/gi, 'Kota Batam')
        .trim()
    )
  }

  provinsi = normalizeRegion(provinsi)
  kota = normalizeRegion(kota)

  const normalizeAddress = (text: string) => {
    if (!text) return ''
    return text
      .replace(/\bJalan\b/gi, 'Jl.')
      .replace(/\bNomor\b/gi, 'No.')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // Surabaya Region Detection
  let detectedRegion = ''
  if (kota.toLowerCase().includes('surabaya') && kecamatan) {
    for (const [region, districts] of Object.entries(SURABAYA_REGIONS)) {
      if (districts.some((d) => kecamatan.toLowerCase().includes(d.toLowerCase()))) {
        detectedRegion = region
        break
      }
    }
  }

  // Area[0]: Full Administrative Hierarchy
  form.value.Area[0] = [kelurahan, kecamatan, kota, provinsi].filter(Boolean).join(', ')
  
  // Area[1]: Region Logic
  if (detectedRegion) {
    form.value.Area[1] = detectedRegion.toLowerCase()
  } else if (kecamatan && kota && GEMINI_API_KEY) {
    // Jika bukan Surabaya atau tidak terdeteksi manual, gunakan AI
    detectRegionWithAI(kecamatan, kota)
  } else {
    form.value.Area[1] = ''
  }

  // Set Alamat to Street/Building/Neighborhood Info if route is available
  if (rute) {
    const streetAndNumber = unit != rt || unit != rw ? [rute, nomorRumah].filter(Boolean).join(' ') : [rute, nomorRumah, unit].filter(Boolean).join(' ')
    const rt_rw = [rt ? `RT.${rt}` : '', rw ? `RW.${rw}` : ''].filter(Boolean).join('/')
    const streetInfo = [building, streetAndNumber, rt_rw, neighborhood].filter(Boolean).join(', ')
    form.value.Alamat = normalizeAddress(streetInfo)
  } else {
    form.value.Alamat = ''
  }
}

const selectType = (type: string) => {
  form.value.Tipe = type
  searchType.value = ''
  openType.value = false
}

const selectCertificate = (type: string) => {
  form.value.Jenis_Sertifikat = type
  searchCertificate.value = ''
  openCertificate.value = false
}

const addAkses = () => {
  if (newAkses.value.trim()) {
    form.value.Akses_Jalan.push(newAkses.value.trim())
    newAkses.value = ''
  }
}

const scrollToRight = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTo({
      left: scrollContainer.value.scrollWidth,
      behavior: 'smooth'
    })
  }
}

const handlePhoto = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files) return

  const files = Array.from(target.files)

  files.forEach((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        previewPhotos.value.push({
          Id_Media: e.target.result,
          No_Id_Media: 'new_upload',
          Url: null,
          Expired_At: '',
          IsCompressed: false,
          ContentType: file.type,
          ThumbUrl: null,
          Size: file.size
        })

        extensionsPhotos.value.push(file.name.split('.').pop()?.toLowerCase() || '')
        photos.value.push(file)

        nextTick(() => {
          scrollToRight()
        })
      }
    }
    reader.readAsDataURL(file)
  })

  target.value = ''
}

const removePhoto = (index: number) => {
  const photoToRemove = previewPhotos.value[index]

  if (photoToRemove.No_Id_Media === 'new_upload') {
    let newUploadIndex = -1
    let currentNewUploadCount = 0

    for (let i = 0; i < index; i++) {
      if (previewPhotos.value[i].No_Id_Media === 'new_upload') {
        currentNewUploadCount++
      }
    }
    newUploadIndex = currentNewUploadCount

    if (newUploadIndex !== -1) {
      photos.value.splice(newUploadIndex, 1)
      extensionsPhotos.value.splice(newUploadIndex, 1)
      selectedFiles.value.splice(newUploadIndex, 1)
    }
  } else {
    const idToRemove = photoToRemove.No_Id_Media
    if (form.value.File_Image) {
      const idIndex = form.value.File_Image.indexOf(idToRemove)
      if (idIndex !== -1) {
        form.value.File_Image.splice(idIndex, 1)
        deletedMediaIds.value.push(idToRemove)
      }
    }
  }

  previewPhotos.value.splice(index, 1)
}

watch(
  () => [...form.value.Status_Transaksi],
  (newStatus) => {
    if (!newStatus.includes('Sewa')) {
      form.value.Ada_Minimal_Sewa = false
      form.value.Minimal_Sewa = 0
      form.value.Satuan_Minimal_Sewa = ''
    }
  }
)

watch(
  [() => form.value.Tipe, () => form.value.Nama_Produk, () => form.value.Luas_Bangunan],
  ([newTipe, newNama, newLuas]) => {
    if (!newNama) {
      form.value.Slug = ''
      return
    }

    const baseSlug = newNama
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')

    form.value.Slug = `${newTipe.toLowerCase()}-${baseSlug}-${newLuas || 0}`
  },
  { immediate: true }
)

const handleClickOutside = (e: MouseEvent) => {
  if (!dropdownTypeRef.value?.contains(e.target as Node)) {
    openType.value = false
  }
  if (!dropdownCertificateRef.value?.contains(e.target as Node)) {
    openCertificate.value = false
  }
}

const reqUploadUrl = async () => {
  const url = '/api/mediacloud/req-upload-url-batch'
  const payload = {
    uploader_id: localStorage.getItem('no_id'),
    extensions: extensionsPhotos.value
  }

  try {
    const { data } = await api.post(url, payload, {
      headers: { 'X-Jenis-User': 'admin' }
    })
    return data
  } catch (err) {
    console.error('Request upload URL gagal:', err)
    throw err
  }
}

const sendMedia = async (uploadUrl: string, media: File) => {
  if (!media || !(media instanceof File)) return null
  try {
    const response = await axios.put(uploadUrl, media, {
      headers: { 'Content-Type': media.type }
    })
    return response.data
  } catch (err) {
    console.error('Gagal mengunggah biner ke Google Cloud:', err)
    throw err
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

const handleInputCurrency = (event: Event, field: 'Harga_Jual1' | 'Harga_Jual2' | 'Harga_Sewa1' | 'Harga_Sewa2') => {
  const input = event.target as HTMLInputElement
  const numericString = input.value.replace(/\D/g, '')
  if (!numericString) {
    form.value[field] = 0
    input.value = ''
    return
  }
  const pureNumber = parseInt(numericString, 10)
  form.value[field] = pureNumber
  input.value = formatCurrency(pureNumber)
}

const confirmMediaBatch = async (filesMetadata: any[]) => {
  try {
    const url = '/api/mediacloud/confirm-upload-batch'
    const { data } = await api.post(
      url,
      { files: filesMetadata },
      {
        headers: { 'X-Jenis-User': 'admin' }
      }
    )
    return data.MediaIds
  } catch (err) {
    console.error('Gagal konfirmasi batch:', err)
    throw err
  }
}

const submitForm = async () => {
  if (isLoading.value) return

  // Basic Validation
  const requiredFields = [
    { field: form.value.Nama_Produk, label: 'Nama Properti' },
    { field: form.value.Tipe, label: 'Tipe Properti' },
    { field: form.value.Jenis_Sertifikat, label: 'Jenis Sertifikat' },
    { field: form.value.Status_Transaksi?.length, label: 'Status Transaksi' },
    { field: form.value.Area[0], label: 'Lokasi (Peta)' },
    // { field: form.value.Alamat, label: 'Alamat Detail' },
    { field: form.value.Luas_Bangunan, label: 'Luas Bangunan' }
  ]

  for (const item of requiredFields) {
    if (!item.field) {
      fail(`${item.label} harus diisi!`)
      return
    }
  }

  // Conditional Price Validation
  if (form.value.Status_Transaksi?.includes('Jual') && !form.value.Harga_Jual1) {
    fail('Harga Jual harus diisi!')
    return
  }
  if (form.value.Status_Transaksi?.includes('Sewa') && !form.value.Harga_Sewa1) {
    fail('Harga Sewa harus diisi!')
    return
  }

  if (form.value.Keterangan && form.value.Keterangan.length > 250) {
    fail('Keterangan tidak boleh lebih dari 250 karakter!')
    return
  }

  // Normalize Address & Area before saving
  const normalizeText = (text: string) => {
    return text
      .replace(/\bJalan\b/gi, 'Jl.')
      .replace(/\bNomor\b/gi, 'No.')
      .replace(/\bKabupaten\b/gi, 'Kab.')
      .replace(/Daerah Khusus Ibukota/gi, 'DKI')
      .replace(/Daerah Istimewa/gi, 'DIY')
      .replace(/\s+/g, ' ')
      .trim()
  }

  if (form.value.Alamat) {
    form.value.Alamat = normalizeText(form.value.Alamat)
  }
  if (form.value.Area && form.value.Area[0]) {
    form.value.Area[0] = normalizeText(form.value.Area[0])
  }

  const isEdit = !!form.value.No_Id
  isLoading.value = true

  try {
    const targetUrl = isEdit ? `/api/realEstate/update?no_id=${form.value.No_Id}` : '/api/realEstate/create'
    let finalMediaIds: string[] = []

    if (photos.value && photos.value.length > 0) {
      const uploadTickets = await reqUploadUrl()
      const validProcessCount = Math.min(uploadTickets.length, photos.value.length)
      const activePhotos = photos.value.slice(0, validProcessCount)
      const activeTickets = uploadTickets.slice(0, validProcessCount)

      await Promise.all(activeTickets.map((ticket: any, index: number) => sendMedia(ticket.UploadUrl, activePhotos[index])))

      const resIds = await confirmMediaBatch(
        activeTickets.map((ticket: any, index: number) => ({
          id_kategori: null,
          uploader_id: localStorage.getItem('no_id'),
          fileName: activePhotos[index].name,
          objectName: ticket.ObjectName,
          original_size: activePhotos[index].size,
          content_type: activePhotos[index].type
        }))
      )
      finalMediaIds = resIds
    }

    const combinedPhotos = [...new Set([...(form.value.File_Image || []), ...finalMediaIds])]
    const payload = {
      ...form.value,
      File_Image: combinedPhotos,
      Flag_Sewa: form.value.Status_Transaksi?.includes('Sewa') ? 'Ya' : 'Tidak'
    }

    const cleanPayload = { ...payload }
    delete (cleanPayload as any).MediaUrls
    if (!isEdit && !cleanPayload.No_Id) delete (cleanPayload as any).No_Id

    await api[isEdit ? 'put' : 'post'](targetUrl, cleanPayload, {
      headers: { 'X-Jenis-User': 'admin' }
    })

    if (deletedMediaIds.value.length > 0) {
      try {
        await api.post('/api/mediacloud/delete-batch', { ids: deletedMediaIds.value })
      } catch (delErr) {
        console.error('Failed to cleanup GCS images:', delErr)
      }
    }

    success(isEdit ? 'Berhasil memperbarui properti' : 'Berhasil menambah properti')
    emit('success')
    handleClose()
  } catch (err: any) {
    const serverMsg = err.response?.data?.message || err.response?.data?.Message || err.response?.data?.error || err.response?.data?.ExceptionMessage || (typeof err.response?.data === 'string' ? err.response.data : null)
    fail(serverMsg || err.message || 'Gagal menyimpan data.')
  } finally {
    isLoading.value = false
  }
}

const handleClose = () => {
  if (autocompleteInput.value) {
    autocompleteInput.value.value = ''
  }
  emit('update:showModal', false)
}

onMounted(async () => {
  loadGoogleMaps()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-show="showModal" class="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="bg-card w-full max-w-7xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div class="flex justify-between items-center px-8 py-4 border-b">
          <h2 class="text-lg font-black text-default-900">{{ form.No_Id ? 'Edit' : 'Tambah' }} Properti</h2>
          <button @click="handleClose" class="p-1.5 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-colors">
            <Icon icon="lucide:x" class="size-5" />
          </button>
        </div>

        <div class="px-8 py-5 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4">
          <div class="space-y-4">
            <div class="field" v-if="form.No_Id">
              <div class="toggle-box mt-2">
                <span class="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase"> <Icon icon="lucide:power" /> {{ form.Status_Display }} </span>
                <button @click="form.Status_Display = form.Status_Display === 'Aktif' ? 'Nonaktif' : 'Aktif'" class="toggle" :class="form.Status_Display === 'Aktif' ? 'toggle-active' : ''">
                  <span class="toggle-circle" :class="form.Status_Display === 'Aktif' ? 'translate-x-6' : ''"></span>
                </button>
              </div>
            </div>
            <div class="col-span-2 space-y-2 !mb-3">
              <label class="label block">Gambar Produk</label>
              <div ref="scrollContainer" class="preview-container flex flex-nowrap gap-3 overflow-x-auto pb-2 custom-scroll">
                <template v-if="previewPhotos.length >= 1">
                  <div v-for="(img, i) in previewPhotos" :key="i" class="preview-box relative size-24 flex-shrink-0">
                    <img :src="img.Id_Media" class="size-full object-cover rounded-xl border border-slate-200" />
                    <button @click="removePhoto(i)" class="preview-delete">✕</button>
                  </div>
                </template>

                <label class="size-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-shrink-0 flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-primary/50 transition-all text-slate-400 group">
                  <Icon icon="lucide:plus" class="size-6 group-hover:text-primary transition-colors" />
                  <span class="text-[10px] font-bold mt-1 group-hover:text-primary">TAMBAH</span>
                  <input type="file" multiple hidden @change="handlePhoto" accept="image/*,video/*" />
                </label>

                <div v-if="!previewPhotos.length" class="flex-shrink-0 text-slate-500 text-[10px] italic flex items-center px-2">Belum ada foto terpilih</div>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="field" ref="dropdownTypeRef">
                <label class="label">Tipe Properti <span class="text-red-500">*</span></label>
                <div class="relative">
                  <div @click.stop="openType = !openType" class="field-input cursor-pointer truncate flex justify-between items-center !pl-4">
                    <span>{{ form.Tipe || 'Pilih Tipe' }}</span>
                    <Icon icon="lucide:chevron-down" class="size-4 text-slate-400" />
                  </div>

                  <div v-if="openType" class="absolute top-full left-0 mt-1 w-full min-w-[200px] max-h-62 z-[9999] bg-card rounded-2xl shadow-2xl border border-slate-200 flex flex-col">
                    <div class="px-4 py-2 border-b bg-slate-50">
                      <div class="relative">
                        <Icon icon="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input v-model="searchType" type="text" placeholder="Cari Tipe..." class="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" @click.stop />
                      </div>
                    </div>
                    <div class="max-h-60 overflow-y-auto p-2 custom-scroll flex flex-col">
                      <button v-for="t in filteredTypes" :key="t" @click="selectType(t)" type="button" class="dropdown-item text-left w-full">
                        {{ t }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="md:col-span-2 field">
                <label class="label">Nama Properti <span class="text-red-500">*</span></label>
                <div class="relative">
                  <Icon icon="lucide:house" class="field-icon" />
                  <input v-model="form.Nama_Produk" placeholder="Contoh: The Sapphire Sky Mansion" class="field-input w-full" />
                </div>
              </div>
            </div>

            <div class="field">
              <label class="label flex justify-between">
                <span>Lokasi & Peta <span class="text-red-500">*</span></span>
                <label class="flex items-center gap-1 cursor-pointer text-[10px] text-slate-500">
                  <input type="checkbox" v-model="form.Hide_alamat" class="size-3 rounded form-checkbox" />
                  Sembunyikan Alamat?
                </label>
              </label>
              <div class="space-y-4">
                <div id="place-autocomplete-container" class="relative group">
                  <Icon icon="lucide:search" class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-primary transition-colors z-20" />
                  <input ref="autocompleteInput" type="text" placeholder="Cari Lokasi / Keyword..." class="field-input !pl-10 font-bold" />
                </div>

                <div class="relative rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner group">
                  <!-- Map Container -->
                  <div v-show="isLocationSelected" ref="mapContainer" class="w-full h-44 bg-slate-50 relative"></div>

                  <!-- Placeholder when no location -->
                  <div v-if="!isLocationSelected" class="w-full h-44 bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                    <div class="size-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                      <Icon icon="lucide:map-pin" class="size-6 text-slate-400" />
                    </div>
                    <div class="text-xs font-bold text-slate-500 uppercase tracking-widest leading-tight flex flex-col items-center justify-center gap-2">
                      <div class="flex items-center gap-1">
                        <span>Gunakan pencarian atau klik</span>
                        <Icon icon="lucide:crosshair" class="size-3 text-primary" />
                      </div>
                      <span>untuk mendapatkan lokasi properti</span>
                    </div>
                  </div>

                  <!-- Loader when Map exists but loading -->
                  <div v-if="isLocationSelected && !isMapLoaded" class="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center">
                    <Icon icon="lucide:loader-2" class="size-6 animate-spin text-primary" />
                    <span class="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">Memuat Peta...</span>
                  </div>

                  <!-- GPS Button -->
                  <button @click.stop="getCurrentLocation" type="button" class="absolute bottom-3 right-3 z-20 size-9 bg-white rounded-xl shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-primary transition-all active:scale-95 group" :disabled="isLocating" title="Dapatkan Lokasi Saya">
                    <Icon v-if="!isLocating" icon="lucide:crosshair" class="size-5" />
                    <Icon v-else icon="lucide:loader-2" class="size-5 animate-spin" />
                  </button>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div class="field">
                    <label class="label !ml-0 font-bold !text-slate-400">Lokasi <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <Icon icon="lucide:map" class="field-icon" />
                      <input v-model="form.Area[0]" placeholder="Kelurahan, Kecamatan, Kota, Provinsi" class="field-input" />
                    </div>
                  </div>

                  <div class="field">
                    <label class="label !ml-0 font-bold !text-slate-400">Area</label>
                    <div class="relative">
                      <Icon icon="lucide:navigation-2" class="field-icon" />
                      <select v-model="form.Area[1]" class="field-input !pl-9 cursor-pointer">
                        <option value="" disabled>Pilih Area</option>
                        <option v-for="opt in areaOptions" :key="opt" :value="opt.toLowerCase()">
                          {{ opt }}
                        </option>
                      </select>
                      
                      <!-- AI Loading Overlay -->
                      <div v-if="isDetectingArea" class="absolute inset-y-0 right-0 left-9 bg-white/80 backdrop-blur-[1px] flex items-center px-3 rounded-r-xl z-20">
                        <Icon icon="lucide:loader-2" class="size-3.5 animate-spin text-primary mr-2" />
                        <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">AI Detecting...</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="relative">
                  <div v-if="isGeocoding" class="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                    <Icon icon="lucide:loader-2" class="size-4 animate-spin text-primary mr-2" />
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Geocoding...</span>
                  </div>
                  <label class="label !ml-0 font-bold !text-slate-400">Detail Alamat<span class="text-red-500">*</span></label>
                  <Icon icon="lucide:map-pin" class="field-icon" />
                  <textarea v-model="form.Alamat" placeholder="Detail jalan, no rumah..." class="field-input !pl-9 pt-2.5 min-h-[80px] resize-none" rows="2"></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-4 h-full">
            <div class="bg-default-50 p-4 rounded-2xl space-y-4 border border-slate-100">
              <div class="flex items-center gap-4 border-b border-slate-200 pb-2">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opsi Transaksi</span>
                <div class="flex gap-4">
                  <label class="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input type="checkbox" value="Jual" v-model="form.Status_Transaksi" class="form-checkbox" />
                    JUAL
                  </label>

                  <label class="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input type="checkbox" value="Sewa" v-model="form.Status_Transaksi" class="form-checkbox" />
                    SEWA
                  </label>

                  <label v-if="form.Status_Transaksi.includes('Sewa')" class="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input type="checkbox" v-model="form.Ada_Minimal_Sewa" class="form-checkbox" />
                    MIN SEWA
                  </label>
                </div>
              </div>

              <div v-if="form.Status_Transaksi.includes('Jual')" class="grid grid-cols-2 gap-3">
                <div class="field">
                  <label class="label !text-slate-500">Harga Jual Normal (Rp) <span v-if="form.Status_Transaksi?.includes('Jual')" class="text-red-500">*</span></label>
                  <input type="text" :value="form.Harga_Jual1 ? formatCurrency(form.Harga_Jual1) : ''" @input="handleInputCurrency($event, 'Harga_Jual1')" class="field-input !pl-4" placeholder="Harga awal" />
                </div>

                <div class="field">
                  <label class="label !text-bejo-600">Harga Jual Diskon (Rp)</label>
                  <input type="text" :value="form.Harga_Jual2 ? formatCurrency(form.Harga_Jual2) : ''" @input="handleInputCurrency($event, 'Harga_Jual2')" class="field-input !pl-4 focus:border-emerald-500" :class="form.Harga_Jual2 > 0 && form.Harga_Jual2 >= form.Harga_Jual1 ? '!border-red-500 focus:!border-red-500' : 'border-emerald-200'" placeholder="Setelah diskon" />
                  <span v-if="form.Harga_Jual2 > 0 && form.Harga_Jual2 >= form.Harga_Jual1" class="text-xs text-red-500 mt-1 inline-block font-medium"> ⚠️ Harga diskon harus lebih kecil dari harga normal. </span>
                </div>
              </div>

              <div v-if="form.Status_Transaksi.includes('Sewa')" class="grid grid-cols-2 gap-3 mt-3">
                <div class="field">
                  <label class="label !text-slate-500">Harga Sewa Normal (Rp) <span v-if="form.Status_Transaksi?.includes('Sewa')" class="text-red-500">*</span></label>

                  <div class="flex items-center gap-2">
                    <input type="text" :value="form.Harga_Sewa1 ? formatCurrency(form.Harga_Sewa1) : ''" @input="handleInputCurrency($event, 'Harga_Sewa1')" class="field-input !pl-4 w-full" placeholder="Harga awal" />
                    <span class="text-slate-500 font-medium whitespace-nowrap">/{{ form.Satuan_Minimal_Sewa || 'Tahun' }}</span>
                  </div>
                </div>

                <div class="field">
                  <label class="label !text-bejo-600">Harga Sewa Diskon (Rp)</label>
                  <div class="flex items-center gap-2">
                    <input type="text" :value="form.Harga_Sewa2 ? formatCurrency(form.Harga_Sewa2) : ''" @input="handleInputCurrency($event, 'Harga_Sewa2')" class="field-input !pl-4 focus:border-blue-500" :class="form.Harga_Sewa2 > 0 && form.Harga_Sewa2 >= form.Harga_Sewa1 ? '!border-red-500 focus:!border-red-500' : 'border-blue-200'" placeholder="Setelah diskon" />
                    <span class="text-slate-500 font-medium whitespace-nowrap">/{{ form.Satuan_Minimal_Sewa || 'Tahun' }}</span>
                  </div>
                  <span v-if="form.Harga_Sewa2 > 0 && form.Harga_Sewa2 >= form.Harga_Sewa1" class="text-xs text-red-500 mt-1 inline-block font-medium"> ⚠️ Harga diskon sewa harus lebih kecil dari harga sewa normal. </span>
                </div>
              </div>

              <div v-if="form.Ada_Minimal_Sewa" class="grid grid-cols-2 gap-3">
                <div class="field">
                  <label class="label !text-slate-500">Minimal Sewa</label>
                  <input v-model="form.Minimal_Sewa" type="number" class="field-input !pl-4" min="0" placeholder="Minimal sewa" />
                </div>
                <div class="field">
                  <label class="label !text-slate-600">Satuan</label>
                  <select v-model="form.Satuan_Minimal_Sewa" class="field-input !pl-4">
                    <option value="Bulan">Bulan</option>
                    <option value="Tahun" selected>Tahun</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="field">
              <label class="label"> Url Slug </label>
              <div class="relative">
                <Icon icon="lucide:link-2" class="field-icon" />
                <input v-model="form.Slug" class="field-input" readonly />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="field" ref="dropdownCertificateRef">
                <label class="label">Sertifikat</label>
                <div class="relative">
                  <div @click.stop="openCertificate = !openCertificate" class="field-input cursor-pointer truncate flex justify-between items-center !pl-4">
                    <span>{{ form.Jenis_Sertifikat || 'Pilih Sertifikat' }}</span>
                    <Icon icon="lucide:chevron-down" class="size-4 text-slate-400" />
                  </div>

                  <div v-if="openCertificate" class="absolute top-full left-0 mt-1 w-full min-w-[200px] max-h-62 z-[9999] bg-card rounded-2xl shadow-2xl border border-slate-200 flex flex-col">
                    <div class="px-4 py-2 border-b bg-slate-50">
                      <div class="relative">
                        <Icon icon="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input v-model="searchCertificate" type="text" placeholder="Cari Sertifikat..." class="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" @click.stop />
                      </div>
                    </div>
                    <div class="max-h-60 overflow-y-auto p-2 custom-scroll flex flex-col">
                      <button v-for="t in filteredCertificates" :key="t" @click="selectCertificate(t)" type="button" class="dropdown-item text-left w-full">
                        {{ t }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="field">
                <label class="label">Dimensi (P x L)</label>
                <div class="flex gap-2 items-center">
                  <input v-model="panjang" placeholder="P" type="number" class="field-input !pl-2 text-center" />
                  <span class="text-slate-300">x</span>
                  <input v-model="lebar" placeholder="L" type="number" class="field-input !pl-2 text-center" />
                </div>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <div class="field">
                <label class="label">Luas Tanah (m²) <span class="text-red-500">*</span></label
                ><input v-model="form.Luas_Tanah" type="number" class="field-input !pl-4" />
              </div>
              <div class="field">
                <label class="label">Luas Bangunan (m²) <span class="text-red-500">*</span></label
                ><input v-model="form.Luas_Bangunan" type="number" class="field-input !pl-4" />
              </div>
              <div class="field"><label class="label">Jumlah Lantai</label><input v-model="form.Jumlah_Lantai" type="number" class="field-input !pl-4" /></div>
            </div>
            <div class="grid grid-cols-4 gap-2">
              <div v-for="s in specs" :key="s.key" class="field">
                <label class="label">{{ s.label }}</label>
                <input v-model="form[s.key as keyof RealEstateForm]" type="number" class="field-input !pl-4" />
              </div>
            </div>

            <div class="field">
              <label class="label">Aksesibilitas (Contoh: 5 min ke Tol)</label>
              <div class="flex gap-2">
                <input v-model="newAkses" @keyup.enter="addAkses" placeholder="Ketik akses..." class="field-input !pl-4" />
                <button @click="addAkses" class="bg-slate-800 text-white px-3 rounded-xl"><Icon icon="lucide:plus" /></button>
              </div>
              <div class="flex flex-wrap gap-2 mt-2">
                <span v-for="(a, i) in form.Akses_Jalan" :key="i" class="bg-card border text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1"> {{ a }} <Icon @click="form.Akses_Jalan.splice(i, 1)" icon="lucide:x" class="text-red-500 cursor-pointer" /> </span>
              </div>
            </div>

            <div class="field flex flex-col flex-1">
              <div class="flex justify-between items-center mb-1.5">
                <label class="label !mb-0">Keterangan</label>
                <span class="text-[10px] font-bold" :class="(form.Keterangan?.length || 0) > 250 ? 'text-red-500' : 'text-slate-400'"> {{ form.Keterangan?.length || 0 }}/250 </span>
              </div>
              <textarea v-model="form.Keterangan" maxlength="250" class="field-input !pl-4 pt-2 resize-none flex-1 w-full" placeholder="Ceritakan keunggulan properti..."></textarea>
              <p v-if="(form.Keterangan?.length || 0) >= 250" class="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-wider">⚠️ Batas maksimum 250 karakter tercapai</p>
            </div>
          </div>
        </div>

        <div class="px-8 py-4 border-t flex justify-end gap-3 bg-default-50/50">
          <button @click="handleClose" class="px-6 py-2 text-sm font-bold text-slate-500 hover:bg-card rounded-xl transition-all">Batal</button>
          <button :disabled="isLoading" @click="submitForm" class="px-8 py-2 bg-primary text-white text-sm font-black rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
            <span v-if="isLoading">Sedang Mengunggah...</span>
            <span v-else>Simpan Data</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.label {
  @apply block text-[10px] font-black text-slate-500 uppercase mb-1 ml-1 tracking-widest;
}
.field {
  @apply text-slate-500;
}
.inactive {
  @apply opacity-50 pointer-events-none grayscale;
}
.field-icon {
  @apply absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none;
}
.field-input {
  @apply w-full border border-slate-200 rounded-xl py-1.5 pl-9 pr-4 text-sm bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none;
}
.preview-delete {
  @apply absolute top-1 right-1 bg-red-500 text-white rounded-full size-4 flex items-center justify-center text-xs shadow-lg;
}
.dropdown-item {
  @apply w-full text-left px-4 py-2 text-sm hover:bg-slate-100 rounded-lg whitespace-normal;
}
.dropdown-item:hover {
  @apply bg-slate-50 text-primary font-semibold;
}
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}
.custom-scroll::-webkit-scrollbar {
  height: 4px;
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 20px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
.search-container {
  @apply sticky top-0 z-10 bg-card p-4 border-b border-slate-100;
}
.toggle-box {
  @apply w-full flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50/50;
}
.toggle {
  @apply w-12 h-6 bg-slate-200 rounded-full relative transition-all duration-300;
}
.toggle-active {
  @apply bg-primary;
}
.toggle-circle {
  @apply absolute top-1 left-1 size-4 bg-card rounded-full transition-all duration-300 shadow-sm;
  border: none !important;
  outline: none !important;
}

/* Styling untuk New Place Autocomplete Web Component */
#place-autocomplete-container :deep(gmpx-place-autocomplete-element),
#place-autocomplete-container :deep(gmp-place-autocomplete) {
  width: 100%;
}

#place-autocomplete-container :deep(input) {
  width: 100% !important;
  background-color: #f8fafc !important; /* slate-50 */
  border: 2px solid #f1f5f9 !important; /* slate-100 */
  border-radius: 0.75rem !important; /* rounded-xl */
  padding-top: 0.625rem !important;
  padding-bottom: 0.625rem !important;
  padding-left: 2.5rem !important; /* Space for search icon */
  padding-right: 1rem !important;
  font-size: 0.875rem !important;
  font-weight: 700 !important;
  transition: all 0.2s !important;
  outline: none !important;
}

#place-autocomplete-container :deep(input:focus) {
  background-color: white !important;
  border-color: var(--p-primary) !important;
  box-shadow: 0 0 0 4px rgba(var(--p-primary-rgb), 0.1) !important;
}

/* Google Maps Autocomplete Dropdown Optimization */
.pac-container {
  z-index: 10000 !important;
  border-radius: 1rem !important;
  border: 1px solid #f1f5f9 !important;
  box-shadow:
    0 20px 25px -5px rgb(0 0 0 / 0.1),
    0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
  margin-top: 0.5rem !important;
  font-family: inherit !important;
}

.pac-item {
  padding: 0.75rem 1rem !important;
  border-top: 1px solid #f1f5f9 !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
}

.pac-item:first-child {
  border-top: none !important;
}

.pac-item:hover {
  background-color: #f8fafc !important;
}

.pac-icon {
  margin-right: 0.75rem !important;
}

.pac-item-query {
  font-size: 0.875rem !important;
  color: #1e293b !important;
  font-weight: 600 !important;
}

.pac-matched {
  color: var(--p-primary) !important;
}
</style>
