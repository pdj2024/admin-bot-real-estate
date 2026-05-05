<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { Product } from '../index.vue'
import GoogleMapsViewer from '@/components/common/GoogleMapsViewer.vue'
import PropertySpecsGrid from '@/components/common/PropertySpecsGrid.vue'

const props = defineProps<{
  product: Product | null
  isAdmin: boolean
}>()

const formattedArea = computed(() => {
  if (!props.product?.Area?.[0]) return ''
  const parts = props.product.Area[0].split(',').map(s => s.trim())
  if (parts.length >= 2) {
    return parts.slice(-2).join(', ')
  }
  return props.product.Area[0]
})

const coords = computed(() => {
  if (!props.product?.Area?.[2]) return null
  const parts = props.product.Area[2].split(',')
  if (parts.length < 2) return null
  const lat = parseFloat(parts[0])
  const lng = parseFloat(parts[1])
  return isNaN(lat) || isNaN(lng) ? null : { lat, lng }
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}
</script>

<template>
  <div class="lg:col-span-2 col-span-1">
    <div class="card relative transition-all duration-700 border-none shadow-premium bg-white rounded-[2.5rem] overflow-hidden">
      <div class="card-body p-6">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-3">
          </div>
        </div>

        <div class="mb-6 border-b border-slate-100 pb-6 relative">
          <h5 class="text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase leading-[0.9]" :class="!product ? 'text-transparent bg-slate-200 rounded-2xl animate-pulse select-none w-fit' : 'text-slate-900'">
            {{ product?.Nama_Produk || 'Memuat Nama Properti Disini...' }}
          </h5>
          <div class="flex items-center gap-2" :class="!product ? 'text-transparent bg-slate-200 rounded-lg animate-pulse select-none w-fit' : 'text-slate-500'">
            <Icon icon="lucide:map-pin" class="size-4" :class="!product ? 'text-transparent' : 'text-bejo-600'" />
            <span class="text-sm font-semibold">
              {{ product?.Alamat.split(',')[0]+", "+product?.Nama_Kota || 'Memuat alamat jalan...' }}
              <span v-if="formattedArea">, {{ formattedArea }}</span>
            </span>
          </div>
        </div>
        

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div v-show="!product || product?.Status_Transaksi?.includes('Jual')" class="bg-bejo-50/30 p-5 rounded-2xl border border-bejo-100/50">
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
          <PropertySpecsGrid :product="product" />
        </div>

        <div class="mb-10 p-8 bg-bejo-50/40 rounded-[2rem] border-l-[8px] border-bejo-500 relative flex flex-col group hover:bg-bejo-50 transition-colors duration-500">
          <Icon icon="lucide:quote" class="absolute top-6 right-8 size-12 text-bejo-200/40 group-hover:scale-110 transition-transform" v-if="product" />
          <h6 class="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3">
            <div class="w-10 h-[2px] bg-bejo-500 rounded-full"></div>
            Deskripsi Lengkap
          </h6>
          <p class="text-base leading-relaxed font-medium" :class="!product ? 'text-transparent bg-slate-200 rounded-lg animate-pulse select-none' : 'text-slate-600'">{{ product?.Keterangan || 'Sedang memuat deskripsi lengkap tentang properti ini...' }}</p>
        </div>

        <div class="mt-10 mb-10">
          <h6 class="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4" :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-max select-none shrink-0' : ''">Aksesibilitas</h6>
          <div class="overflow-hidden border border-slate-100 rounded-2xl">
            <table class="w-full text-sm">
              <tbody class="divide-y divide-slate-100">
                <template v-if="product">
                  <tr v-for="(akses, idx) in product?.Akses_Jalan" :key="idx" class="hover:bg-bejo-50/50 transition-colors group">
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
                <tr class="hover:bg-bejo-50/50 transition-colors">
                  <td class="px-6 py-4 font-bold bg-bejo-50/30 w-1/3 italic" :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-max select-none shrink-0' : 'text-slate-500'">Daya Listrik</td>
                  <td class="px-6 py-4 font-bold"><span :class="!product ? 'text-transparent bg-slate-300 rounded animate-pulse select-none shrink-0' : 'text-slate-800'">{{ !product ? 'Memuat..' : product?.Daya_Listrik.toLocaleString('id-ID') + ' Watt' }}</span></td>
                </tr>
                <tr class="hover:bg-bejo-50/50 transition-colors">
                  <td class="px-6 py-4 font-bold bg-bejo-50/30 w-1/3 italic" :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-max select-none shrink-0' : 'text-slate-500'">Tipe Unit</td>
                  <td class="px-6 py-4 font-bold"><span :class="!product ? 'text-transparent bg-slate-300 rounded animate-pulse select-none shrink-0' : 'text-slate-800'">{{ product?.Tipe || 'Memuat..' }}</span></td>
                </tr>
                <tr class="hover:bg-bejo-50/50 transition-colors">
                  <td class="px-6 py-4 font-bold bg-bejo-50/30 w-1/3 italic" :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-max select-none shrink-0' : 'text-slate-500'">Sertifikat</td>
                  <td class="px-6 py-4 font-bold"><span :class="!product ? 'text-transparent bg-slate-300 rounded animate-pulse select-none shrink-0' : 'text-slate-800'">{{ product?.Jenis_Sertifikat || 'Memuat..' }}</span></td>
                </tr>
                <tr v-if="!product || product?.Status_Transaksi?.includes('Sewa')" class="hover:bg-bejo-50/50 transition-colors">
                  <td class="px-6 py-4 font-bold bg-bejo-50/30 w-1/3 italic" :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-max select-none shrink-0' : 'text-slate-500'">Minimal Sewa</td>
                  <td class="px-6 py-4 font-bold"><span :class="!product ? 'text-transparent bg-slate-300 rounded animate-pulse select-none shrink-0' : 'text-slate-800'">{{ !product ? 'Memuat..' : ((product?.minimal_sewa || (product as any)?.Minimal_Sewa) ? ((product.minimal_sewa || (product as any).Minimal_Sewa) + ' ' + product.Satuan_Minimal_Sewa) : '-') }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-if="coords" class="mt-10 pt-10 border-t border-slate-100">
          <h6 class="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-3">
            <span class="w-8 h-[2px] bg-bejo-500 rounded-full"></span> LOKASI PROPERTI
          </h6>
          <GoogleMapsViewer 
            :lat="coords.lat" 
            :lng="coords.lng" 
            :title="product?.Nama_Produk" 
            mapId="GUEST_PRODUCT_DETAIL_MAP" 
            height="350px"
          />
          <p class="mt-3 text-[10px] font-bold text-slate-400 italic flex items-center gap-1.5">
            <Icon icon="lucide:info" class="size-3" />
            Klik dan geser peta untuk melihat area sekitar properti
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
