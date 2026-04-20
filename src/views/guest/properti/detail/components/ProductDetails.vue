<script setup lang="ts">
import { onMounted, ref, watch, nextTick, computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { Product } from '../index.vue'

import { GOOGLE_MAPS_API_KEY } from '@/config/constants'

const props = defineProps<{
  product: Product | null
  isAdmin: boolean
}>()

const mapContainer = ref<HTMLElement | null>(null)
const isMapLoaded = ref(false)
let gMap: any = null

const formattedArea = computed(() => {
  if (!props.product?.Area?.[0]) return ''
  const parts = props.product.Area[0].split(',').map(s => s.trim())
  if (parts.length >= 2) {
    return parts.slice(-2).join(', ')
  }
  return props.product.Area[0]
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

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
  if (!mapContainer.value || !props.product?.Area?.[2]) return
  const coords = props.product.Area[2].split(',')
  if (coords.length < 2) return
  
  const lat = parseFloat(coords[0])
  const lng = parseFloat(coords[1])
  if (isNaN(lat) || isNaN(lng)) return

  try {
    const [libraryMap, libraryMarker] = (await Promise.all([
      google.maps.importLibrary('maps'),
      google.maps.importLibrary('marker')
    ])) as [google.maps.MapsLibrary, google.maps.MarkerLibrary]

    const { Map } = libraryMap
    const { AdvancedMarkerElement } = libraryMarker

    const pos = { lat, lng }
    
    gMap = new Map(mapContainer.value, {
      center: pos,
      zoom: 15,
      mapId: 'PRODUCT_DETAIL_MAP',
      mapTypeControl: false,
      streetViewControl: false
    })

    new AdvancedMarkerElement({
      map: gMap,
      position: pos,
      title: props.product.Nama_Produk
    })

    isMapLoaded.value = true
  } catch (err) {
    console.error('Error initializing product map:', err)
  }
}

watch(() => props.product, (newProd) => {
  if (newProd?.Area?.[2]) {
    nextTick(() => {
      loadGoogleMaps()
    })
  }
}, { immediate: true })

onMounted(() => {
  if (props.product?.Area?.[2]) {
    loadGoogleMaps()
  }
})
</script>

<template>
  <div class="lg:col-span-2 col-span-1">
    <div class="card relative transition-all duration-500 border-none shadow-sm hover:shadow-md bg-white rounded-xl overflow-hidden">
      <div class="card-body p-6">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-2">
            <template v-for="(transaksi, index) in product?.Status_Transaksi" :key="index">
              <span class="px-3 py-1 text-[11px] uppercase tracking-wider font-bold rounded-xl bg-bejo-50 text-bejo-600 border border-bejo-200">
                {{ transaksi }}
              </span>
            </template>
          </div>
        </div>

        <div class="mb-6 border-b border-slate-100 pb-6 relative">
          <h5 class="text-3xl font-extrabold tracking-tight mb-2 uppercase leading-tight" :class="!product ? 'text-transparent bg-slate-200 rounded-xl animate-pulse select-none w-fit' : 'text-slate-900'">
            {{ product?.Nama_Produk || 'Memuat Nama Properti Disini...' }}
          </h5>
          <div class="flex items-center gap-2" :class="!product ? 'text-transparent bg-slate-200 rounded-lg animate-pulse select-none w-fit' : 'text-slate-500'">
            <Icon icon="lucide:map-pin" class="size-4" :class="!product ? 'text-transparent' : 'text-bejo-600'" />
            <span class="text-sm font-semibold">
              {{ product?.Alamat || 'Memuat alamat jalan...' }}
              <span v-if="formattedArea">, {{ formattedArea }}</span>
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div v-show="!product || product?.Status_Transaksi?.includes('Jual')" class="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5" :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-fit select-none' : ''">Harga Jual</p>
            <h4 class="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span class="font-extrabold text-3xl" :class="!product ? 'text-transparent bg-slate-200 rounded-xl animate-pulse select-none' : 'text-slate-900'">
                {{ !product ? formatCurrency(5000000000) : (product?.Harga_Jual2 == 0 ? formatCurrency(product.Harga_Jual1) : formatCurrency(product.Harga_Jual2)) }}
              </span>
              <div v-if="product?.Harga_Jual2 != 0 && product" class="flex items-center gap-2 mt-1">
                <span class="relative text-sm font-bold text-slate-400 italic px-1 shrink-0">
                  {{ formatCurrency(product?.Harga_Jual1 || 0) }}
                  <span class="absolute inset-x-0 top-1/2 h-[1.5px] bg-red-500 transform -rotate-[10deg] opacity-80 rounded-full"></span>
                </span>
                <span class="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-md border border-red-100/50">
                  -{{ Math.round(((product.Harga_Jual1 - product.Harga_Jual2) / product.Harga_Jual1) * 100) }}%
                </span>
              </div>
            </h4>
          </div>

          <div v-show="!product || product?.Status_Transaksi?.includes('Sewa')" class="bg-bejo-50 p-5 rounded-2xl border border-bejo-100">
            <p class="text-[10px] text-bejo-700 font-bold uppercase tracking-widest mb-1.5" :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-fit select-none' : ''">Harga Sewa</p>
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h4 class="font-extrabold text-3xl" :class="!product ? 'text-transparent bg-slate-200 rounded-xl animate-pulse select-none' : 'text-bejo-600'">
                {{ !product ? formatCurrency(150000000) : formatCurrency(product?.Harga_Sewa2 == 0 ? product.Harga_Sewa1 : product?.Harga_Sewa2 || 0) }}
              </h4>
              <div v-if="product?.Harga_Sewa2 != 0 && product" class="flex items-center gap-2 mt-1">
                <span class="relative text-sm font-bold text-slate-400 italic px-1 shrink-0">
                  {{ formatCurrency(product?.Harga_Sewa1 || 0) }}
                  <span class="absolute inset-x-0 top-1/2 h-[1.5px] bg-red-500 transform -rotate-[10deg] opacity-80 rounded-full"></span>
                </span>
                <span class="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-md border border-red-100/50">
                  -{{ Math.round(((product.Harga_Sewa1 - product.Harga_Sewa2) / product.Harga_Sewa1) * 100) }}%
                </span>
              </div>
              <span v-if="product" class="text-xs font-bold text-bejo-600/70 lowercase mt-1">/ {{ product?.Satuan_Minimal_Sewa || 'Tahun' }}</span>
            </div>
          </div>
        </div>

        <div class="mb-10">
          <h6 class="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-3"><span class="w-8 h-[2px] bg-slate-300 rounded-full"></span> RINGKASAN PROPERTI</h6>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div
              v-for="(spec, idx) in [
                { icon: 'lucide:land-plot', label: 'L. Tanah', val: product?.Luas_Tanah + ' m²' },
                { icon: 'lucide:home', label: 'L. Bangunan', val: product?.Luas_Bangunan + ' m²' },
                { icon: 'lucide:layers', label: 'Lantai', val: product?.Jumlah_Lantai },
                { icon: 'lucide:car', label: 'Carport', val: product?.Jumlah_Carpot },
                { icon: 'lucide:bed', label: 'K. Tidur', val: product?.Jumlah_Kamar_Tidur },
                { icon: 'lucide:bath', label: 'K. Mandi', val: product?.Jumlah_Kamar_Mandi }
              ]"
              :key="idx"
              class="flex flex-col items-center py-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50"
            >
              <div class="p-2.5 bg-white rounded-xl mb-2 shadow-sm border border-slate-100" :class="!product ? 'bg-slate-200 border-none animate-pulse *:opacity-0' : ''">
                <Icon :icon="spec.icon" class="size-5 text-bejo-600" />
              </div>
              <span class="text-[9px] uppercase font-black mb-0.5" :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-fit select-none shrink-0' : 'text-slate-400'">{{ spec.label }}</span>
              <span class="text-sm font-extrabold" :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-max select-none shrink-0 mt-1' : 'text-slate-800'">{{ !product ? 'Memuat.. ' : spec.val }}</span>
            </div>
          </div>
        </div>

        <div class="mb-10 p-6 bg-slate-50/50 rounded-2xl border-s-[6px] border-bejo-500 relative flex flex-col">
          <Icon icon="lucide:quote" class="absolute top-4 right-4 size-8 text-slate-200 opacity-50" v-if="product" />
          <h6 class="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-3" :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-max select-none shrink-0' : ''">Deskripsi Lengkap</h6>
          <p class="text-sm leading-relaxed font-medium" :class="!product ? 'text-transparent bg-slate-200 rounded-lg animate-pulse select-none' : 'text-slate-600'">{{ product?.Keterangan || 'Sedang memuat deskripsi lengkap tentang properti ini. Hal ini mungkin membutuhkan sedikit waktu untuk menyelesaikan rendering dari peladen web server dan jaringan internet Anda yang stabil.' }}</p>
        </div>

        <div class="mt-10 mb-10">
          <h6 class="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4" :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-max select-none shrink-0' : ''">Aksesibilitas</h6>
          <div class="overflow-hidden border border-slate-100 rounded-2xl">
            <table class="w-full text-sm">
              <tbody class="divide-y divide-slate-100">
                <template v-if="product">
                  <tr v-for="(akses, idx) in product?.Akses_Jalan" :key="idx" class="hover:bg-slate-50/80 transition-colors group">
                    <td class="px-5 py-3.5 text-slate-700 font-bold flex items-center gap-3">
                      <span class="size-2 rounded-full bg-bejo-300 group-hover:bg-bejo-600 transition-colors"></span>
                      {{ akses }}
                    </td>
                  </tr>

                  <tr v-if="!product?.Akses_Jalan || product.Akses_Jalan.length === 0">
                    <td class="px-5 py-5 text-slate-400 font-bold italic text-center">Informasi akses jalan tidak tersedia</td>
                  </tr>
                </template>
                <template v-else>
                  <tr v-for="i in 3" :key="i" class="bg-slate-50/30">
                    <td class="px-5 py-3.5 flex items-center gap-3">
                       <div class="size-2 rounded-full bg-slate-200 animate-pulse"></div>
                       <span class="text-transparent bg-slate-200 rounded animate-pulse select-none w-1/3">Loading</span>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
        <div class="mt-10">
          <h6 class="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4" :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-max select-none shrink-0' : ''">Informasi Tambahan</h6>
          <div class="overflow-hidden border border-slate-100 rounded-2xl">
            <table class="w-full text-sm">
              <tbody class="divide-y divide-slate-100">
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="px-6 py-4 font-bold bg-slate-50/50 w-1/3 italic" :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-max select-none shrink-0' : 'text-slate-500'">Daya Listrik</td>
                  <td class="px-6 py-4 font-bold"><span :class="!product ? 'text-transparent bg-slate-300 rounded animate-pulse select-none shrink-0' : 'text-slate-800'">{{ !product ? 'Memuat..' : product?.Daya_Listrik.toLocaleString('id-ID') + ' Watt' }}</span></td>
                </tr>
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="px-6 py-4 font-bold bg-slate-50/50 w-1/3 italic" :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-max select-none shrink-0' : 'text-slate-500'">Tipe Unit</td>
                  <td class="px-6 py-4 font-bold"><span :class="!product ? 'text-transparent bg-slate-300 rounded animate-pulse select-none shrink-0' : 'text-slate-800'">{{ product?.Tipe || 'Memuat..' }}</span></td>
                </tr>
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="px-6 py-4 font-bold bg-slate-50/50 w-1/3 italic" :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-max select-none shrink-0' : 'text-slate-500'">Sertifikat</td>
                  <td class="px-6 py-4 font-bold"><span :class="!product ? 'text-transparent bg-slate-300 rounded animate-pulse select-none shrink-0' : 'text-slate-800'">{{ product?.Jenis_Sertifikat || 'Memuat..' }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-if="product?.Area?.[2]" class="mt-10 pt-10 border-t border-slate-100">
          <h6 class="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-3">
            <span class="w-8 h-[2px] bg-bejo-500 rounded-full"></span> LOKASI PROPERTI
          </h6>
          <div class="relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 group">
            <div ref="mapContainer" class="w-full h-64 md:h-80 transition-opacity duration-700" :class="isMapLoaded ? 'opacity-100' : 'opacity-0'"></div>
            <div v-if="!isMapLoaded" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-50">
              <Icon icon="lucide:loader-2" class="size-8 animate-spin text-bejo-600 mb-2" />
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memuat Peta Lokasi...</span>
            </div>
          </div>
          <p class="mt-3 text-[10px] font-bold text-slate-400 italic flex items-center gap-1.5">
            <Icon icon="lucide:info" class="size-3" />
            Klik dan geser peta untuk melihat area sekitar properti
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
