<template>
  <GuestLayout>
    <div class="max-w-6xl mx-auto py-12 px-4">
      <div class="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <!-- Header Section -->
        <div class="p-8 md:p-12 bg-gradient-to-br from-indigo-50 to-white border-b border-slate-100 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div class="relative z-10">
            <h1 class="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4 flex items-center gap-4">
              <div class="size-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Icon icon="lucide:map" class="size-6" />
              </div>
              Google Maps Address Picker
            </h1>
            <p class="text-slate-500 font-medium max-w-xl leading-relaxed">
              Pencarian alamat presisi menggunakan <span class="text-indigo-600 font-bold">Google Maps 2025 API</span> dengan fitur sinkronisasi peta otomatis.
            </p>
          </div>
        </div>

        <div class="p-8 md:p-12">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left: Search & Map -->
            <div class="lg:col-span-2 space-y-6">
              <div class="space-y-4">
                <label class="text-[11px] font-black uppercase tracking-widest text-slate-400 block ml-1">Cari Lokasi (Autocomplete)</label>
                <div class="relative group">
                  <Icon icon="lucide:search" class="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                  <!-- Gunakan div pembungkus untuk mencegah Vue memanipulasi elemen yang dikuasai Google -->
                  <div v-once>
                    <input 
                      ref="autocompleteInput"
                      type="text" 
                      placeholder="Ketik alamat atau nama tempat..."
                      class="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-4 text-sm font-bold focus:bg-white focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner outline-none ring-0 appearance-none"
                    />
                  </div>
                </div>
              </div>

              <!-- Map Container -->
              <div class="relative group">
                <!-- Gunakan v-once agar Vue tidak mencoba merender ulang container peta -->
                <div 
                  v-once
                  ref="mapContainer" 
                  class="w-full h-[400px] bg-slate-100 rounded-[2rem] border-4 border-white shadow-xl overflow-hidden relative"
                >
                </div>
                
                <div v-if="!isMapLoaded" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-10 text-center p-6 rounded-[2rem]">
                  <Icon icon="lucide:loader-2" class="size-8 animate-spin text-indigo-500 mb-4" />
                  <p class="text-sm font-bold text-slate-400 uppercase tracking-widest">Memuat Google Maps...</p>
                </div>

                <div class="absolute bottom-6 left-6 right-6 pointer-events-none">
                  <div class="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white shadow-lg flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="size-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Icon icon="lucide:crosshair" class="size-4" />
                      </div>
                      <span class="text-[10px] font-black uppercase tracking-widest text-slate-600">Geser pin untuk akurasi</span>
                    </div>
                    <div class="text-[10px] font-black text-slate-400">
                      LAT: {{ currentCoords.lat.toFixed(6) }} | LNG: {{ currentCoords.lng.toFixed(6) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Result Form -->
            <div class="space-y-6">
              <div class="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 shadow-inner h-full relative">
                <!-- Geocoding Loader Overlay -->
                <div v-if="isGeocoding" class="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-[2rem] transition-all duration-300">
                  <Icon icon="lucide:loader-2" class="size-6 animate-spin text-indigo-500 mb-2" />
                  <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Mengambil Alamat...</span>
                </div>

                <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
                  <Icon icon="lucide:file-text" class="size-4 text-indigo-500" />
                  Detail Wilayah
                </h3>
                
                <div class="space-y-6">
                  <div v-for="(val, key) in formFields" :key="key" class="space-y-3">
                    <label class="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{{ val.label }}</label>
                    <div class="relative">
                      <Icon :icon="val.icon" class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                      <input 
                        type="text" 
                        :value="form[key]" 
                        readonly 
                        :placeholder="'Menunggu data peta...'"
                        class="w-full bg-slate-100/50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-600 focus:outline-none cursor-default transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div class="space-y-3">
                    <label class="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Alamat Lengkap</label>
                    <div class="relative">
                      <Icon icon="lucide:map-pin" class="absolute left-4 top-4 size-4 text-slate-300" />
                      <textarea 
                        v-model="form.fullAddress" 
                        readonly
                        rows="3"
                        placeholder="Detail alamat akan muncul di sini..."
                        class="w-full bg-slate-100/50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-600 focus:outline-none cursor-default transition-all shadow-sm resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div v-if="!isFormFilled" class="pt-8 text-center">
                  <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed italic">
                    Gunakan pencarian atau geser pin<br />untuk mengisi data otomatis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </GuestLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue';
import { Icon } from '@iconify/vue';
import GuestLayout from '@/layouts/guest.vue';

// --- CONFIGURATION ---
const GOOGLE_MAPS_API_KEY = 'AIzaSyBdyGDdRYgwuUvSCv1jEKmosLnxCnbnM4c';

const autocompleteInput = ref<HTMLInputElement | null>(null);
const mapContainer = ref<HTMLElement | null>(null);
const isMapLoaded = ref(false);

const currentCoords = reactive({
  lat: -6.2088, // Default Jakarta
  lng: 106.8456
});

const form = reactive<Record<string, string>>({
  provinsi: '',
  kota: '',
  kecamatan: '',
  kelurahan: '',
  fullAddress: ''
});

const formFields = {
  provinsi: { label: 'Provinsi', icon: 'lucide:map' },
  kota: { label: 'Kota / Kabupaten', icon: 'lucide:building-2' },
  kecamatan: { label: 'Kecamatan', icon: 'lucide:navigation-2' },
  kelurahan: { label: 'Kelurahan / Desa', icon: 'lucide:home' },
};

const isFormFilled = computed(() => Object.values(form).some(v => !!v));

// Refs for Google objects (non-reactive to avoid Vue cycle issues)
let gMap: any = null;
let gMarker: any = null;
let gAutocomplete: any = null;
let gGeocoder: any = null;

const loadGoogleMaps = () => {
  // Jika sudah ada, langsung init
  if (typeof window.google?.maps?.importLibrary === 'function') {
    initMap();
    return;
  }

  // Buat loader ala dokumentasi resmi Google Maps
  const g: any = window;
  let h: any, a: any;
  const p = "The Google Maps JavaScript API";
  const c = "google";
  const l = "importLibrary";
  const q = "__ib__";
  const m = document;
  const b: any = g[c] || (g[c] = {});
  const d = b.maps || (b.maps = {});
  const r = new Set();
  const e = new URLSearchParams();
  
  const u = () => h || (h = new Promise(async (f, n) => {
    await (a = m.createElement("script"));
    e.set("libraries", [...r].join(","));
    e.set("key", GOOGLE_MAPS_API_KEY);
    e.set("v", "beta"); // Menggunakan v=beta untuk fitur terbaru
    e.set("loading", "async");
    a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
    d[q] = f;
    a.onerror = () => h = n(Error(p + " could not load."));
    a.nonce = (m.querySelector("script[nonce]") as any)?.nonce || "";
    m.head.append(a);
  }));

  d[l] = (f: any, ...n: any[]) => r.add(f) && u().then(() => d[l](f, ...n));

  // Jalankan inisialisasi
  initMap();
};

const initMap = async () => {
  if (!mapContainer.value) return;

  try {
    // Memuat library yang dibutuhkan menggunakan importLibrary
    const libraryMap = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
    const libraryMarker = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
    const libraryPlaces = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
    
    const { Map } = libraryMap;
    const { AdvancedMarkerElement } = libraryMarker;
    const { Autocomplete } = libraryPlaces;
    
    gGeocoder = new google.maps.Geocoder();

    // 1. Initialize Map
    gMap = new Map(mapContainer.value, {
      center: currentCoords,
      zoom: 15,
      mapId: 'DEMO_MAP_ID',
      mapTypeControl: false,
      streetViewControl: false,
    });

    // 2. Initialize Marker
    gMarker = new AdvancedMarkerElement({
      map: gMap,
      position: currentCoords,
      gmpDraggable: true,
      title: "Target Lokasi"
    });

    // 3. Initialize Autocomplete
    if (autocompleteInput.value) {
      gAutocomplete = new Autocomplete(autocompleteInput.value, {
        componentRestrictions: { country: 'id' },
        fields: ['address_components', 'geometry', 'name', 'formatted_address']
      });

      gAutocomplete.addListener('place_changed', onPlaceChanged);
    }

    // 4. Marker Events
    // Drag: Update coordinates display in real-time
    gMarker.addListener('drag', () => {
      const pos = gMarker.position;
      if (pos) {
        const lat = typeof pos.lat === 'function' ? pos.lat() : pos.lat;
        const lng = typeof pos.lng === 'function' ? pos.lng() : pos.lng;
        updateCoords(lat, lng);
      }
    });

    // Dragend: Trigger Geocoding
    gMarker.addListener('dragend', () => {
      const pos = gMarker.position;
      if (pos) {
        const lat = typeof pos.lat === 'function' ? pos.lat() : pos.lat;
        const lng = typeof pos.lng === 'function' ? pos.lng() : pos.lng;
        updateCoords(lat, lng);
        geocodePosition({ lat, lng });
      }
    });

    // Map Click: Move Marker & Geocode
    gMap.addListener('gmp-click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        gMarker.position = newPos;
        updateCoords(newPos.lat, newPos.lng);
        geocodePosition(newPos);
      }
    });

    isMapLoaded.value = true;
  } catch (error) {
    console.error("Gagal inisialisasi Google Maps:", error);
  }
};

const updateCoords = (lat: number, lng: number) => {
  // Selalu gunakan nextTick saat mengubah state dari callback luar
  nextTick(() => {
    currentCoords.lat = lat;
    currentCoords.lng = lng;
  });
};

const onPlaceChanged = () => {
  const place = gAutocomplete.getPlace();
  console.log("Selected Place Object:", place);
  
  if (!place.geometry || !place.geometry.location) return;

  const location = place.geometry.location;
  
  // Move Map & Marker
  gMap.setCenter(location);
  gMarker.position = location;
  
  updateCoords(location.lat(), location.lng());

  // Update Form
  nextTick(() => {
    parseAddressComponents(place.address_components || []);
    form.fullAddress = place.formatted_address || '';
  });
};

const isGeocoding = ref(false);

const geocodePosition = (pos: any) => {
  if (!gGeocoder) return;
  
  isGeocoding.value = true;
  gGeocoder.geocode({ location: pos }, (results: any, status: any) => {
    console.log("Geocoding Status:", status);
    console.log("Geocoding Results:", results);
    
    nextTick(() => {
      isGeocoding.value = false;
      if (status === 'OK' && results && results[0]) {
        parseAddressComponents(results[0].address_components);
        form.fullAddress = results[0].formatted_address;
      }
    });
  });
};

const parseAddressComponents = (components: google.maps.GeocoderAddressComponent[]) => {
  form.provinsi = '';
  form.kota = '';
  form.kecamatan = '';
  form.kelurahan = '';

  console.log("Parsing Address Components:", components);

  components.forEach(c => {
    const types = c.types;
    if (types.includes('administrative_area_level_1')) {
      form.provinsi = c.long_name;
    } 
    else if (types.includes('administrative_area_level_2')) {
      form.kota = c.long_name;
    }
    else if (types.includes('administrative_area_level_3') || (types.includes('locality') && !form.kecamatan)) {
      form.kecamatan = c.long_name;
    }
    else if (types.includes('administrative_area_level_4') || types.includes('sublocality_level_1')) {
      form.kelurahan = c.long_name;
    }
  });

  // Fallback Kota (Jakarta special case)
  if (!form.kota) {
    const locality = components.find(c => c.types.includes('locality'));
    if (locality) form.kota = locality.long_name;
  }
};

onMounted(() => {
  loadGoogleMaps();
});
</script>

<style scoped>
@reference "@/assets/css/style.css";

/* Marker styling context */
.gm-style-iw {
  @apply rounded-2xl p-0 overflow-hidden shadow-2xl;
}
</style>
