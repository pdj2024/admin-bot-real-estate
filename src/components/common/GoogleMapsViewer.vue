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
  if (typeof window.google?.maps?.Map === 'function') {
    initMap()
    return
  }

  const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')
  if (existingScript) {
    if (typeof window.google?.maps?.Map === 'function') {
      initMap()
    } else {
      existingScript.addEventListener('load', () => initMap())
      existingScript.addEventListener('error', () => {
        isLoading.value = false
        loadError.value = 'Gagal memuat SDK Google Maps'
      })
    }
    return
  }

  const m = document
  const b = 'google'
  const e = new URLSearchParams()
  e.set('key', GOOGLE_MAPS_API_KEY)
  e.set('language', 'id')
  e.set('region', 'ID')
  e.set('libraries', 'marker')
  e.set('loading', 'async')
  e.set('callback', 'initMaps')
  
  // Define dummy callback
  if (!(window as any).initMaps) {
    (window as any).initMaps = () => {}
  }
  
  const script = m.createElement('script')
  script.src = `https://maps.${b}apis.com/maps/api/js?` + e
  script.async = true
  script.defer = true
  script.onload = () => initMap()
  script.onerror = () => {
    isLoading.value = false
    loadError.value = 'Gagal memuat SDK Google Maps'
  }
  m.head.append(script)

  // Safety timeout for loading
  setTimeout(() => {
    if (isLoading.value && !loadError.value && !isMapLoaded.value) {
      isLoading.value = false
      loadError.value = 'Waktu muat habis. Silakan periksa koneksi internet atau kunci API Anda.'
    }
  }, 10000)
}

const initMap = async () => {
  if (!mapContainer.value) {
    console.warn('Map container ref is missing during initMap')
    return
  }
  
  if (!props.lat || !props.lng) {
    console.warn('Invalid coordinates provided to GoogleMapsViewer:', { lat: props.lat, lng: props.lng })
    isLoading.value = false
    return
  }
  
  console.log('Initializing map at:', { lat: props.lat, lng: props.lng })
  isLoading.value = true
  loadError.value = null

  try {
    let retryCount = 0
    while (typeof window.google?.maps?.Map !== 'function' && retryCount < 30) {
      await new Promise(resolve => setTimeout(resolve, 200))
      retryCount++
    }

    if (typeof window.google?.maps?.Map !== 'function') {
      throw new Error('SDK Google Maps tidak tersedia setelah menunggu')
    }

    const pos = { lat: Number(props.lat), lng: Number(props.lng) }
    
    // Modern loading pattern
    const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

    gMap = new Map(mapContainer.value, {
      center: pos,
      zoom: props.zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      mapId: props.mapId || 'GENERIC_MAP_ID', // Required for AdvancedMarker
      gestureHandling: 'cooperative'
    })

    console.log('Map instance created successfully')

    new AdvancedMarkerElement({
      position: pos,
      map: gMap,
      title: props.title,
    })

    console.log('Advanced Marker added to map at:', pos)
    isMapLoaded.value = true
  } catch (err: any) {
    console.error('CRITICAL: Error initializing map:', err)
    loadError.value = err.message || 'Gagal menginisialisasi peta'
  } finally {
    isLoading.value = false
  }
}

watch([() => props.lat, () => props.lng], ([newLat, newLng]) => {
  console.log('Coordinates changed, re-loading map...', { lat: newLat, lng: newLng })
  if (newLat && newLng) {
    nextTick(() => {
      loadGoogleMaps()
    })
  } else {
    isLoading.value = false
  }
}, { immediate: true })

onMounted(() => {
  console.log('GoogleMapsViewer mounted with props:', { lat: props.lat, lng: props.lng })
  if (props.lat && props.lng) {
    loadGoogleMaps()
  } else {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="relative w-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm" :style="{ height: props.height }">
    <div v-show="!loadError" ref="mapContainer" class="w-full h-full grayscale-[10%] contrast-[1.05]"></div>
    
    <!-- Loading Overlay -->
    <div v-if="isLoading && !loadError" class="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center gap-4">
      <div class="relative size-14">
        <div class="absolute inset-0 rounded-full border-4 border-slate-100"></div>
        <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-bejo-500 animate-spin"></div>
      </div>
      <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sinkronisasi Lokasi...</span>
    </div>

    <!-- Error Overlay -->
    <div v-if="loadError" class="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
      <div class="size-16 bg-red-50 rounded-2xl flex items-center justify-center mb-5 text-red-500 border border-red-100">
        <Icon icon="lucide:map-pin-off" class="size-8" />
      </div>
      <h4 class="text-sm font-black text-slate-900 mb-2 uppercase tracking-wider">Peta Tidak Tersedia</h4>
      <p class="text-xs font-medium text-slate-500 max-w-[200px] leading-relaxed mb-6">{{ loadError }}</p>
      
      <button @click="loadGoogleMaps" class="px-5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
        Coba Lagi
      </button>
    </div>
  </div>
</template>
