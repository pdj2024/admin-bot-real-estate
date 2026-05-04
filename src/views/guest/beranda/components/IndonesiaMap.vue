<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { Icon } from '@iconify/vue';
import { GOOGLE_MAPS_API_KEY } from '@/config/constants';
import { useSettings } from '@/stores/settings';

const settingsStore = useSettings();

interface Property {
  No_Id: string;
  Nama_Produk: string;
  Alamat: string;
  Nama_Kota?: string;
  [key: string]: any;
}

const props = defineProps<{
  properties: Property[];
}>();

const mapRef = ref<HTMLElement | null>(null);
let map: google.maps.Map | null = null;
let markers: google.maps.Marker[] = [];
let markerClusterer: any = null;

const hoveredProperty = ref<any>(null);
const tooltipPosition = ref({ x: 0, y: 0 });

// Helper to extract coordinates from address string
const extractCoords = (address: string) => {
  if (!address) return null;
  const latMatch = address.match(/Lat:\s*(-?\d+\.\d+)/i);
  const lngMatch = address.match(/Long:\s*(-?\d+\.\d+)/i);
  if (latMatch && lngMatch) {
    return {
      lat: parseFloat(latMatch[1]),
      lng: parseFloat(lngMatch[1])
    };
  }
  return null;
};

const initMap = async () => {
  if (!window.google || !mapRef.value) return;

  try {
    const { Map } = (await google.maps.importLibrary('maps')) as google.maps.MapsLibrary;
    await google.maps.importLibrary('marker');

    const mapOptions: google.maps.MapOptions = {
      center: { lat: -2.5489, lng: 118.0149 },
      zoom: 5,
      disableDefaultUI: true,
      zoomControl: true,
      mapId: 'INDONESIA_MAP_GUEST', // Required for AdvancedMarkerElement
    };

    map = new Map(mapRef.value, mapOptions);

    if (map) {
      // Load Indonesia Highlight
      map.data.loadGeoJson('https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.json');
      map.data.setStyle({
        fillColor: '#f97316',
        fillOpacity: 0.08,
        strokeColor: '#f97316',
        strokeWeight: 0.5,
        clickable: false
      });
    }

    updateMarkers();
  } catch (error) {
    console.error('Error loading Google Maps:', error);
  }
};

const updateMarkers = async () => {
  if (!map || !window.google) return;

  const { AdvancedMarkerElement, PinElement } = (await google.maps.importLibrary('marker')) as google.maps.MarkerLibrary;

  // Clear existing markers and clusterer
  markers.forEach((m: any) => m.map = null);
  markers = [];
  if (markerClusterer) {
    markerClusterer.clearMarkers();
  }

  const validProperties = props.properties
    .map(p => ({ ...p, coords: extractCoords(p.Alamat) }))
    .filter(p => p.coords !== null);

  validProperties.forEach(property => {
    // Create custom pin content
    const pin = new PinElement({
      background: '#f97316',
      borderColor: '#FFFFFF',
      glyphColor: '#FFFFFF',
      scale: 1.2,
    });

    const marker = new AdvancedMarkerElement({
      map,
      position: property.coords!,
      title: property.Nama_Produk,
      content: pin,
    });

    marker.addListener('gmp-click', () => {
      hoveredProperty.value = property;
      // For Advanced Markers, we need a different approach for tooltip position
      // or just rely on the click event coordinate if needed.
      // But we'll keep the current logic if it still works for hovered
    });

    // Hover effect for tooltip
    marker.element.addEventListener('mouseenter', () => {
      hoveredProperty.value = property;
      // Approximate position for tooltip
      const rect = marker.element.getBoundingClientRect();
      const mapRect = mapRef.value?.getBoundingClientRect();
      if (mapRect) {
        tooltipPosition.value = {
          x: rect.left - mapRect.left + rect.width / 2,
          y: rect.top - mapRect.top
        };
      }
    });

    marker.element.addEventListener('mouseleave', () => {
      hoveredProperty.value = null;
    });

    markers.push(marker as any);
  });

  // Initialize MarkerClusterer if markers exist
  if (markers.length > 0 && (window as any).markerClusterer) {
    markerClusterer = new (window as any).markerClusterer.MarkerClusterer({
      map,
      markers,
      renderer: {
        render: ({ count, position }: any) => {
          const pin = new PinElement({
            background: '#f97316',
            borderColor: '#FFFFFF',
            glyphColor: '#FFFFFF',
            scale: 1.5 + Math.min(count / 20, 1),
          });
          
          // Add text label for count
          const label = document.createElement('div');
          label.className = 'flex items-center justify-center text-[10px] font-black text-white absolute inset-0';
          label.innerText = String(count);
          pin.element.appendChild(label);

          return new AdvancedMarkerElement({
            position,
            content: pin,
            zIndex: 1000 + count,
          });
        }
      }
    });
  }
};


const loadScripts = () => {
  if (window.google && (window as any).markerClusterer) {
    initMap();
    return;
  }

  // Load Google Maps with the new recommended pattern (bootstrap)
  const g = window as any;
  let h: any, a: any;
  const p = "The Google Maps JavaScript API"; const c = "google"; const l = "importLibrary"; const q = "__ib__"; const m = document; const b = g[c] || (g[c] = {}); const d = b.maps || (b.maps = {}); const r = new Set(); const e = new URLSearchParams(); const u = () => h || (h = new Promise(async (f, n) => { await (a = m.createElement("script")); e.set("libraries", [...r].join(",") + ""); for (const k in b) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), b[k]); e.set("callback", c + ".maps." + q); a.src = `https://maps.${c}apis.com/maps/api/js?` + e; d[q] = f; a.onerror = () => h = n(Error(p + " could not load.")); a.nonce = (m as any).querySelector("script[nonce]")?.nonce || ""; m.head.append(a) })); d[l] = (f: any, ...n: any[]) => r.add(f) && u().then(() => d[l](f, ...n));

  // Add the key and other options to the params
  e.set("key", GOOGLE_MAPS_API_KEY);
  e.set("v", "beta");
  e.set("loading", "async");

  initMap();

  // Load MarkerClusterer
  const cScript = document.createElement('script');
  cScript.src = `https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js`;
  cScript.async = true;
  document.head.appendChild(cScript);
};

onMounted(() => loadScripts());
watch(() => props.properties, () => updateMarkers(), { deep: true });
onBeforeUnmount(() => {
  markers.forEach(m => (m as any).map = null);
  if (markerClusterer && typeof markerClusterer.clearMarkers === 'function') markerClusterer.clearMarkers();
  (window as any).initMap = null;
});

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
}
</script>

<template>
  <div class="relative w-full overflow-hidden bg-white pt-8 pb-12 sm:pt-12 sm:pb-24 border-y border-slate-100">
    <div class="max-w-7xl mx-auto px-4 relative z-10">
      <div class="text-center mb-16 space-y-4">

        <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          Properti <span class="text-bejo-500">{{ settingsStore.business.appName }}</span> di Indonesia
        </h2>
        <p class="text-slate-500 font-medium max-w-2xl mx-auto">
          Lihat persebaran unit hunian kami secara real-time. Zoom untuk melihat lokasi lebih detail dan akurat.
        </p>
      </div>

      <div class="relative w-full aspect-[21/9] bg-slate-50 rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden mb-12">
        <div ref="mapRef" class="w-full h-full"></div>

        <!-- Custom Tooltip Overlay -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 translate-y-4 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 translate-y-4 scale-95"
        >
          <div 
            v-if="hoveredProperty"
            class="absolute z-[100] pointer-events-none"
            :style="{ 
              left: `${tooltipPosition.x}px`, 
              top: `${tooltipPosition.y}px`,
              transform: 'translate(-50%, calc(-100% - 30px))'
            }"
          >
            <div class="w-64 bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[1.5rem] p-4 text-left relative">
              <div class="flex items-center gap-3 mb-3">
                <div class="size-10 rounded-2xl flex items-center justify-center bg-bejo-50 text-bejo-600">
                  <Icon icon="lucide:building-2" class="size-6" />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-xs font-black text-slate-900 leading-tight truncate">{{ hoveredProperty.Nama_Produk }}</h4>
                  <p class="text-[9px] font-bold text-slate-400 mt-0.5 truncate">
                    {{ hoveredProperty.Nama_Kota || 'Lokasi Tersedia' }}
                  </p>
                </div>
              </div>
              <div class="space-y-1.5 border-t border-slate-50 pt-3">
                <div class="flex items-center justify-between">
                  <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Harga Mulai</span>
                  <span class="text-[10px] font-black text-bejo-600">{{ formatCurrency(hoveredProperty.Harga_Jual1 || hoveredProperty.Harga_Sewa1) }}</span>
                </div>
                <div class="flex items-center gap-2 mt-2">
                  <div class="flex items-center gap-1 text-[9px] font-bold text-slate-500">
                    <Icon icon="lucide:bed" class="size-3 text-bejo-500" /> {{ hoveredProperty.Jumlah_Kamar_Tidur }}
                  </div>
                  <div class="flex items-center gap-1 text-[9px] font-bold text-slate-500">
                    <Icon icon="lucide:bath" class="size-3 text-bejo-500" /> {{ hoveredProperty.Jumlah_Kamar_Mandi }}
                  </div>
                  <div class="flex items-center gap-1 text-[9px] font-bold text-slate-500">
                    <Icon icon="lucide:maximize" class="size-3 text-bejo-500" /> {{ hoveredProperty.Luas_Tanah }}m²
                  </div>
                </div>
              </div>
              <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-slate-100 rotate-45"></div>
            </div>
          </div>
        </Transition>
      </div>

      <div class="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 px-8">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <Icon icon="lucide:map-pin" class="size-4 text-bejo-600" /> Lokasi Properti
          </div>
          <div class="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <div class="size-3 rounded-full bg-bejo-500 border-2 border-white shadow-sm"></div> Rekap Unit (Cluster)
          </div>
        </div>
        <div class="hidden lg:flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
          <Icon icon="lucide:maximize-2" class="size-3" /> Zoom in untuk melihat lokasi detail tiap unit
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tooltip styling improvements */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
