<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { GOOGLE_MAPS_API_KEY } from '@/config/constants'

const props = withDefaults(defineProps<{
  lat: number
  lng: number
  title?: string
  mapId?: string
  zoom?: number
  height?: string
}>(), {
  title: 'Location',
  mapId: 'GENERIC_MAP',
  zoom: 15,
  height: '400px'
})

const mapContainer = ref<HTMLElement | null>(null)
const isMapLoaded = ref(false)
const isLoading = ref(true)
const loadError = ref<string | null>(null)
let gMap: any = null

const loadGoogleMaps = () => {
  if (typeof window.google?.maps?.importLibrary === 'function') {
    initMap()
    return
  }

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
      e.set('callback', c + '.maps.' + q)
      a.src = `https://maps.${c}apis.com/maps/api/js?` + e
      d[q] = f
      a.onerror = () => (h = n(Error(p + ' could not load.')))
      a.nonce = (m.querySelector('script[nonce]') as any)?.nonce || ''
      m.head.append(a)
    }))

  d[l] = (f: any, ...n: any[]) => r.add(f) && u().then(() => d[l](f, ...n))
  initMap()
}

const initMap = async () => {
  if (!mapContainer.value || !props.lat || !props.lng) return
  
  isLoading.value = true
  loadError.value = null

  try {
    const [libraryMap, libraryMarker] = (await Promise.all([
      google.maps.importLibrary('maps'),
      google.maps.importLibrary('marker')
    ])) as [google.maps.MapsLibrary, google.maps.MarkerLibrary]

    const { Map } = libraryMap
    const { AdvancedMarkerElement } = libraryMarker

    const pos = { lat: props.lat, lng: props.lng }
    
    gMap = new Map(mapContainer.value, {
      center: pos,
      zoom: props.zoom,
      mapId: props.mapId,
      mapTypeControl: false,
      streetViewControl: false
    })

    new AdvancedMarkerElement({
      map: gMap,
      position: pos,
      title: props.title
    })

    isMapLoaded.value = true
  } catch (err: any) {
    console.error('Error initializing product map:', err)
    loadError.value = 'Gagal memuat peta'
  } finally {
    isLoading.value = false
  }
}

watch([() => props.lat, () => props.lng], () => {
  if (props.lat && props.lng) {
    nextTick(() => {
      loadGoogleMaps()
    })
  }
}, { immediate: true })

onMounted(() => {
  if (props.lat && props.lng) {
    loadGoogleMaps()
  }
})
</script>

<template>
  <div class="relative w-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm" :style="{ height: props.height }">
    <div v-show="!loadError" ref="mapContainer" class="w-full h-full grayscale-[20%] contrast-[1.1]"></div>
    
    <!-- Loading Overlay -->
    <div v-if="isLoading && !loadError" class="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center gap-3">
      <div class="size-12 rounded-full border-4 border-slate-200 border-t-bejo-600 animate-spin"></div>
      <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Peta...</span>
    </div>

    <!-- Error Overlay -->
    <div v-if="loadError" class="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div class="size-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
        <Icon icon="lucide:map-pin-off" class="size-8" />
      </div>
      <h4 class="text-sm font-black text-slate-900 mb-1 uppercase tracking-wider">Peta Tidak Tersedia</h4>
      <p class="text-xs font-medium text-slate-500">{{ loadError }}</p>
    </div>
  </div>
</template>
