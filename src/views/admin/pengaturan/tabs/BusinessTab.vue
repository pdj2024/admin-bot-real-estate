<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick, markRaw, toRaw } from 'vue'
import { Icon } from '@iconify/vue'
import { useSettings } from '@/stores/settings'
import { success, fail } from '@/utils/sweet-alert'
import api from '@/services/axios'
import { GOOGLE_MAPS_API_KEY } from '@/config/constants'

interface CompanyProfile {
  No_Id: string
  Nama_Toko: string
  Email: string
  No_Telp: string
  No_Wa_1: string
  No_Wa_2: string
  Alamat_Toko: string
  Hari_Buka: string
  Jam_Buka: string
  Kode_Pos: string
  About: string
  Gmap: string
  Logo_Company?: string | null
  Id_Logo_Company?: string | null
}

const isLoading = ref(true)
const isSaving = ref(false)
const isUploadingLogo = ref(false)
const logoPreview = ref<string | null>(null)
const logoFile = ref<File | null>(null)

// Operating Days & Hours State
const hariDari = ref('Senin')
const hariSampai = ref('Jumat')
const jamDari = ref('08:00')
const jamSampai = ref('17:00')

const daysList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

// Google Maps State
const mapContainer = ref<HTMLElement | null>(null)
const isMapLoaded = ref(false)
const isLocating = ref(false)
const searchQuery = ref('')
const predictions = ref<any[]>([])
const isPredictionsOpen = ref(false)
const currentCoords = reactive({ lat: -7.2504, lng: 112.7688 })

let gMap: any = null
let gMarker: any = null
let gGeocoder: any = null
let gAutocompleteSessionToken: any = null

const settingsStore = useSettings()

const form = reactive<CompanyProfile>({
  No_Id: 'comp_0001',
  Nama_Toko: '',
  Email: '',
  No_Telp: '',
  No_Wa_1: '',
  No_Wa_2: '',
  Alamat_Toko: '',
  Hari_Buka: '',
  Jam_Buka: '',
  Kode_Pos: '',
  About: '',
  Gmap: '',
  Logo_Company: null,
  Id_Logo_Company: null
})

const fetchProfile = async () => {
  try {
    isLoading.value = true

    // Use store fetch
    await settingsStore.fetchBusinessSettings()

    // Sync store data to local form
    const profile = toRaw(settingsStore.business)
    Object.assign(form, {
      Nama_Toko: profile.appName,
      Email: profile.email,
      No_Telp: profile.phone,
      No_Wa_1: profile.whatsapp,
      No_Wa_2: (profile as any).No_Wa_2 || '',
      Alamat_Toko: profile.address,
      Hari_Buka: (profile as any).Hari_Buka || '',
      Jam_Buka: (profile as any).Jam_Buka || '',
      Kode_Pos: (profile as any).Kode_Pos || '',
      About: profile.description,
      Gmap: profile.mapUrl,
      Logo_Company: profile.Logo_Company || null,
      Id_Logo_Company: profile.Id_Logo_Company || null
    })

    if (form.Logo_Company) {
      logoPreview.value = form.Logo_Company
    }

    // Parse Hari_Buka (e.g. "Senin-Jumat")
    if (form.Hari_Buka && form.Hari_Buka.includes('-')) {
      const split = form.Hari_Buka.split('-')
      hariDari.value = split[0].trim()
      hariSampai.value = split[1].trim()
    }

    // Parse Jam_Buka (e.g. "08.00-16.00")
    if (form.Jam_Buka && form.Jam_Buka.includes('-')) {
      const split = form.Jam_Buka.split('-')
      jamDari.value = split[0].trim().replace('.', ':')
      jamSampai.value = split[1].trim().replace('.', ':')
    }

    // Initialize map with existing Gmap coordinates if available
    if (form.Gmap && form.Gmap.includes(',')) {
      const [lat, lng] = form.Gmap.split(',').map((s) => Number(s.trim()))
      if (!isNaN(lat) && !isNaN(lng)) {
        currentCoords.lat = lat
        currentCoords.lng = lng
      }
    }

    // Load map after form is populated with a slight delay for better performance
    nextTick(() => {
      setTimeout(() => {
        loadGoogleMaps()
      }, 800)
    })
  } catch {
    console.error('Fetch company profile error')
  } finally {
    isLoading.value = false
  }
}

const handleSave = async () => {
  try {
    isSaving.value = true

    // Construct joined values
    const joinedHari = `${hariDari.value}-${hariSampai.value}`
    const joinedJam = `${jamDari.value.replace(':', '.')}-${jamSampai.value.replace(':', '.')}`

    const payload = {
      Nama_Toko: form.Nama_Toko,
      Email: form.Email,
      No_Telp: form.No_Telp || null,
      No_Wa_1: form.No_Wa_1,
      No_Wa_2: form.No_Wa_2 || null,
      Alamat_Toko: form.Alamat_Toko,
      Hari_Buka: joinedHari,
      Jam_Buka: joinedJam,
      Kode_Pos: form.Kode_Pos,
      About: form.About || null,
      Gmap: form.Gmap || null,
      Logo_Company: form.Id_Logo_Company
    }

    const { data } = await api.put('/api/company/update', payload, {
      params: { no_id: 'comp_0001' },
      headers: { 'X-Jenis-User': 'Admin' }
    })

    if (data.StatusCode === 200) {
      success('Profil perusahaan berhasil diperbarui')
      fetchProfile()
    } else {
      fail(data.Message || 'Gagal menyimpan profil')
    }
  } catch {
    console.error('Save company profile error')
    fail('Terjadi kesalahan saat menghubungi server')
  } finally {
    isSaving.value = false
  }
}

const triggerLogoUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e: any) => {
    const file = e.target.files[0]
    if (file) {
      logoFile.value = file
      logoPreview.value = URL.createObjectURL(file)
      handleLogoUpload(file)
    }
  }
  input.click()
}

const handleLogoUpload = async (file: File) => {
  const oldMediaId = form.Id_Logo_Company
  try {
    isUploadingLogo.value = true
    
    // 1. Get Signed URL
    const extension = file.name.split('.').pop()?.toLowerCase() || ''
    const { data: reqData } = await api.post('/api/mediacloud/req-upload-url-batch', {
      uploader_id: localStorage.getItem('no_id') || 'adm_1',
      extensions: [extension]
    }, {
      headers: { 'X-Jenis-User': 'Admin' }
    })

    const uploadInfo = reqData[0]
    
    // 2. Upload Binary to GCS
    await fetch(uploadInfo.UploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type }
    })

    // 3. Confirm Upload
    const { data: confirmData } = await api.post('/api/mediacloud/confirm-upload-batch', {
      files: [{
        uploader_id: localStorage.getItem('no_id') || 'adm_1',
        fileName: file.name,
        objectName: uploadInfo.ObjectName,
        original_size: file.size,
        content_type: file.type
      }]
    }, {
      headers: { 'X-Jenis-User': 'Admin' }
    })

    const mediaId = confirmData.MediaIds[0]

    // 4. Save to Profile
    const payload = {
      Logo_Company: mediaId
    }

    await api.put('/api/company/update', payload, {
      params: { no_id: 'comp_0001' },
      headers: { 'X-Jenis-User': 'Admin' }
    })

    form.Id_Logo_Company = mediaId
    success('Logo perusahaan berhasil diperbarui')
    
    // Cleanup: Delete old logo from cloud
    if (oldMediaId) {
      api.delete('/api/mediacloud/delete-batch', {
        data: { ids: [oldMediaId] },
        headers: { 'X-Jenis-User': 'Admin' }
      }).catch(e => console.error('Error deleting old logo:', e))
    }

    await fetchProfile()
  } catch (err) {
    console.error('Logo upload error:', err)
    fail('Gagal mengunggah logo')
  } finally {
    isUploadingLogo.value = false
  }
}

// Google Maps Logic
const loadGoogleMaps = () => {
  if (typeof window.google?.maps?.importLibrary === 'function') {
    initMap()
    return
  }
  const g: any = window
  let h: any
  let a: any
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
      e.set('callback', c + '.maps.' + q)
      e.set('loading', 'async')
      a.src = `https://maps.${c}apis.com/maps/api/js?` + e
      d[q] = f
      a.onerror = () => (h = n(Error('Maps could not load.')))
      m.head.append(a)
    }))
  d[l] = (f: any, ...n: any[]) => r.add(f) && u().then(() => d[l](f, ...n))
  initMap()
}

const initMap = async () => {
  if (!mapContainer.value) return
  try {
    const [libraryMap, libraryMarker] = (await Promise.all([google.maps.importLibrary('maps'), google.maps.importLibrary('marker'), google.maps.importLibrary('places')])) as any[]

    gGeocoder = markRaw(new google.maps.Geocoder())
    const initialPos = { ...currentCoords }

    gMap = markRaw(
      new libraryMap.Map(mapContainer.value, {
        center: initialPos,
        zoom: 15,
        mapId: 'COMPANY_LOCATION_MAP',
        mapTypeControl: false,
        streetViewControl: false
      })
    )

    isMapLoaded.value = true
    gMarker = markRaw(new libraryMarker.AdvancedMarkerElement({ map: gMap, position: initialPos, gmpDraggable: true }))

    const { AutocompleteSessionToken } = (await google.maps.importLibrary('places')) as any
    gAutocompleteSessionToken = new AutocompleteSessionToken()

    gMarker.addListener('dragend', () => {
      if (gMarker.position) {
        updateCoords(gMarker.position.lat, gMarker.position.lng)
      }
    })

    gMap.addListener('gmp-click', (e: any) => {
      if (e.latLng) {
        const lat = e.latLng.lat()
        const lng = e.latLng.lng()
        gMarker.position = { lat, lng }
        updateCoords(lat, lng)
      }
    })
  } catch (err) {
    console.error('Error initializing map:', err)
  }
}

const updateCoords = (lat: number, lng: number) => {
  currentCoords.lat = lat
  currentCoords.lng = lng
  form.Gmap = `${lat.toFixed(6)},${lng.toFixed(6)}`
}

const handleSearchInput = async () => {
  if (!searchQuery.value) {
    predictions.value = []
    isPredictionsOpen.value = false
    return
  }
  try {
    const { AutocompleteSuggestion } = (await google.maps.importLibrary('places')) as any
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
    const suggestion = toRaw(mappedPrediction.raw)
    searchQuery.value = mappedPrediction.mainText
    isPredictionsOpen.value = false
    const place = suggestion.placePrediction.toPlace()
    await place.fetchFields({ fields: ['location'] })
    if (place.location) {
      gMap?.setCenter(place.location)
      gMap?.setZoom(17)
      if (gMarker) gMarker.position = place.location
      updateCoords(place.location.lat(), place.location.lng())
    }
  } catch {}
}

const getCurrentLocation = () => {
  if (!navigator.geolocation) return fail('Geolocation tidak didukung')
  isLocating.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const pos = { lat: position.coords.latitude, lng: position.coords.longitude }
      isLocating.value = false
      if (gMap) gMap.setCenter(pos)
      if (gMarker) gMarker.position = pos
      updateCoords(pos.lat, pos.lng)
    },
    () => {
      isLocating.value = false
      fail('Gagal mendapat lokasi')
    }
  )
}

onUnmounted(() => {
  if (gMap) gMap = null
  if (gMarker) gMarker = null
  if (gGeocoder) gGeocoder = null
  if (gAutocompleteSessionToken) gAutocompleteSessionToken = null
})

onMounted(() => {
  fetchProfile()
})
</script>

<template>
  <div class="space-y-6">
    <div v-if="isLoading" class="space-y-6 animate-pulse">
      <div v-for="i in 3" :key="i" class="h-64 bg-white rounded-[2rem] border border-slate-100"></div>
    </div>

    <template v-else>
      <!-- Identitas Utama -->
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-4 sm:px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <div class="flex items-center gap-3 min-w-0">
            <div class="size-8 rounded-lg bg-bejo-500 flex items-center justify-center text-white shadow-lg shadow-bejo-500/20 shrink-0">
              <Icon icon="lucide:building-2" class="size-4" />
            </div>
            <h4 class="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest truncate">Pengaturan Profil Perusahaan</h4>
          </div>
        </div>

        <div class="p-8 space-y-8">
          <!-- Logo Upload -->
          <div class="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-slate-50">
            <div class="relative group cursor-pointer" @click="triggerLogoUpload">
              <div class="size-32 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-bejo-500 group-hover:bg-bejo-50/30">
                <template v-if="logoPreview">
                  <img :src="logoPreview" class="size-full object-contain p-2" />
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Icon icon="lucide:camera" class="size-6" />
                  </div>
                </template>
                <template v-else>
                  <Icon icon="lucide:image-plus" class="size-8 text-slate-300 mb-2 group-hover:text-bejo-500" />
                  <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-bejo-600">Logo Perusahaan</span>
                </template>
              </div>
              <div v-if="isUploadingLogo" class="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-[2.5rem] flex items-center justify-center z-10">
                <Icon icon="lucide:loader-2" class="size-6 animate-spin text-bejo-500" />
              </div>
            </div>
            
            <div class="flex-1 space-y-2 text-center md:text-left">
              <h5 class="text-lg font-black text-slate-900">Logo</h5>
              <p class="text-sm text-slate-500 font-medium leading-relaxed max-w-sm">
                Gunakan logo berformat PNG atau JPG dengan latar belakang transparan/putih untuk hasil terbaik di seluruh platform.
              </p>
              <button @click="triggerLogoUpload" class="text-xs font-black text-bejo-600 uppercase tracking-widest hover:text-bejo-700 flex items-center gap-2 mx-auto md:mx-0">
                Ganti Logo
                <Icon icon="lucide:arrow-right" class="size-3" />
              </button>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <label class="label">
                <Icon icon="lucide:id-card" class="size-4 text-bejo-500" />
                Nama Bisnis
              </label>
              <input v-model="form.Nama_Toko" type="text" class="field-input" placeholder="Masukkan nama bisnis..." />
            </div>
            <div>
              <label class="label">
                <Icon icon="lucide:mail" class="size-4 text-bejo-500" />
                Email Resmi
              </label>
              <input v-model="form.Email" type="email" class="field-input" placeholder="email@perusahaan.com" />
            </div>
            <div>
              <label class="label">
                <Icon icon="lucide:phone" class="size-4 text-bejo-500" />
                Telepon Kantor
              </label>
              <input v-model="form.No_Telp" type="text" class="field-input" placeholder="021-XXXXX" />
            </div>
            <div>
              <label class="label">
                <Icon icon="lucide:message-circle" class="size-4 text-bejo-500" />
                WhatsApp Utama
              </label>
              <input v-model="form.No_Wa_1" type="text" class="field-input" placeholder="628XXXXXXXXX" />
            </div>
            <div>
              <label class="label">
                <Icon icon="lucide:message-circle" class="size-4 text-slate-400" />
                WhatsApp Opsional
              </label>
              <input v-model="form.No_Wa_2" type="text" class="field-input" placeholder="628XXXXXXXXX" />
            </div>
          </div>

          <div class="pt-6 border-t border-slate-50">
            <label class="label mb-3">
              <Icon icon="lucide:text-quote" class="size-4 text-bejo-500" />
              Tentang Bisnis
            </label>
            <textarea v-model="form.About" rows="4" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-base font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-green-500/5 focus:border-green-500 transition-all resize-none leading-relaxed" placeholder="Tuliskan detail visi, misi, atau profil singkat bisnis Anda..."></textarea>
          </div>
        </div>
      </div>

      <!-- Lokasi & Operasional -->
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
          <div class="size-8 rounded-lg bg-bejo-500 flex items-center justify-center text-white shadow-lg shadow-bejo-500/20">
            <Icon icon="lucide:map-pin" class="size-4" />
          </div>
          <h4 class="text-sm font-black text-slate-800 uppercase tracking-widest">Lokasi & Jam Operasional</h4>
        </div>

        <div class="p-8 space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-2">
              <label class="label">
                <Icon icon="lucide:map" class="size-4 text-bejo-500" />
                Alamat Lengkap
              </label>
              <input v-model="form.Alamat_Toko" type="text" class="field-input" placeholder="Jalan raya..." />
            </div>
            <div>
              <label class="label">
                <Icon icon="lucide:map-pinned" class="size-4 text-bejo-500" />
                Kode Pos
              </label>
              <input v-model="form.Kode_Pos" type="text" class="field-input" placeholder="12345" />
            </div>
          </div>

          <!-- Days & Hours -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-4">
              <label class="label">
                <Icon icon="lucide:calendar-days" class="size-4 text-bejo-500" />
                Hari Operasional
              </label>
              <div class="flex items-center gap-3">
                <div class="flex-1">
                  <select v-model="hariDari" class="field-input !py-3">
                    <option v-for="day in daysList" :key="day" :value="day">{{ day }}</option>
                  </select>
                </div>
                <span class="text-xs font-black text-slate-300 uppercase">s/d</span>
                <div class="flex-1">
                  <select v-model="hariSampai" class="field-input !py-3">
                    <option v-for="day in daysList" :key="day" :value="day">{{ day }}</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <label class="label">
                <Icon icon="lucide:clock" class="size-4 text-bejo-500" />
                Jam Operasional
              </label>
              <div class="flex items-center gap-3">
                <div class="flex-1 relative">
                  <Icon icon="lucide:play" class="absolute right-4 top-1/2 -translate-y-1/2 size-3 text-slate-300 pointer-events-none" />
                  <input v-model="jamDari" type="time" class="field-input !py-3 pr-10" />
                </div>
                <span class="text-xs font-black text-slate-300 uppercase">s/d</span>
                <div class="flex-1 relative">
                  <Icon icon="lucide:square" class="absolute right-4 top-1/2 -translate-y-1/2 size-3 text-slate-300 pointer-events-none" />
                  <input v-model="jamSampai" type="time" class="field-input !py-3 pr-10" />
                </div>
              </div>
            </div>
          </div>

          <!-- Map Section -->
          <div class="space-y-4 pt-4 border-t border-slate-50">
            <div class="flex items-center justify-between">
              <label class="label !mb-0">
                <Icon icon="lucide:navigation" class="size-4 text-bejo-500" />
                Koordinat Lokasi (Peta)
              </label>
              <div class="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 font-mono">
                {{ form.Gmap || 'Belum dipilih' }}
              </div>
            </div>

            <!-- Search Bar -->
            <div class="relative">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Icon icon="lucide:search" class="size-4" />
              </div>
              <input v-model="searchQuery" @input="handleSearchInput" @focus="isPredictionsOpen = predictions.length > 0" placeholder="Cari lokasi ..." class="field-input !pl-11 !py-3.5 h-12" />

              <!-- Predictions Dropdown -->
              <div v-if="isPredictionsOpen && predictions.length" class="absolute top-full left-0 mt-2 w-full z-[100] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                <div class="max-h-60 overflow-y-auto p-2 flex flex-col">
                  <button v-for="p in predictions" :key="p.placeId" @mousedown="selectPrediction(p)" type="button" class="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors rounded-xl group">
                    <div class="flex items-start gap-3">
                      <Icon icon="lucide:map-pin" class="size-4 mt-0.5 text-slate-400 group-hover:text-bejo-500" />
                      <div class="flex-1">
                        <span class="text-sm font-black text-slate-700 block leading-tight">{{ p.mainText }}</span>
                        <span class="text-xs font-bold text-slate-400 block mt-0.5" v-if="p.secondaryText">{{ p.secondaryText }}</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <!-- Map Container -->
            <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 shadow-inner group bg-slate-50 min-h-[400px]">
              <div ref="mapContainer" class="w-full h-[400px] transition-opacity duration-700" :class="isMapLoaded ? 'opacity-100' : 'opacity-0'"></div>

              <!-- Loading Overlay -->
              <div v-if="!isMapLoaded" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-10">
                <Icon icon="lucide:loader-2" class="size-10 animate-spin text-bejo-500/40" />
                <span class="text-xs font-black text-slate-400 uppercase tracking-widest mt-4">Memuat Peta...</span>
              </div>

              <!-- Geolocation Button -->
              <button @click="getCurrentLocation" type="button" class="absolute bottom-6 right-6 p-3 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl shadow-xl border border-slate-100 transition-all active:scale-90 flex items-center gap-2 group z-20" :disabled="isLocating">
                <Icon :icon="isLocating ? 'lucide:loader-2' : 'lucide:locate-fixed'" class="size-5" :class="isLocating ? 'animate-spin text-bejo-500' : 'text-slate-400 group-hover:text-bejo-500'" />
                <span class="text-xs font-black uppercase tracking-widest">{{ isLocating ? 'Mencari...' : 'Gunakan Lokasi Saat Ini' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end items-center gap-3 pt-4">
        <button 
          :disabled="isSaving" 
          @click="handleSave" 
          class="px-10 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-base shadow-xl shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <Icon v-if="isSaving" icon="lucide:loader-2" class="size-4 animate-spin" />
          <Icon v-else icon="lucide:save" class="size-4" />
          {{ isSaving ? 'Memproses...' : 'Simpan Pengaturan Bisnis' }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.label {
  @apply flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest mb-2 ml-1;
}
.field-input {
  @apply w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-base font-bold text-slate-700 focus:ring-4 focus:ring-green-500/5 focus:border-green-500 outline-none transition-all;
}
.field-input:focus {
  @apply bg-white;
}
</style>
