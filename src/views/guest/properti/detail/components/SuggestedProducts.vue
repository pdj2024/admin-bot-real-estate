<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import type { Product } from '../index.vue'

defineProps<{
  products: Product[],
  isLoading?: boolean
}>()

const router = useRouter()

const formatCurrency = (value: number) => {
  if (value >= 1e12) return 'Rp ' + (value / 1e12).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' T'
  if (value >= 1e9) return 'Rp ' + (value / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' M'
  if (value >= 1e6) return 'Rp ' + (value / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' Jt'
  if (value >= 1e3) return 'Rp ' + (value / 1e3).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' Rb'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

const goToDetail = (slug: string) => {
  router.push(`/detail/${slug}`).then(() => {
    window.location.reload()
  })
}
</script>

<template>
  <div v-show="products.length > 0 || isLoading" class="mt-10 mb-20 max-w-7xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-2xl font-extrabold text-slate-900 tracking-tight">Mungkin Anda Juga Suka</h3>
      <RouterLink to="/katalog" class="text-xs font-bold uppercase tracking-widest text-bejo-600 hover:text-bejo-700 hover:underline"> Lihat Semua </RouterLink>
    </div>

    <div class="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
      <div v-for="(product, idx) in (isLoading ? [{}, {}, {}] as any : products)" :key="product.No_Id || idx" @click="!isLoading && goToDetail(product.Slug)" class="cursor-pointer group flex flex-col h-full rounded-[2rem] overflow-hidden border transition-all duration-500 relative bg-white border-slate-100 shadow-xl shadow-slate-200/30" :class="!isLoading ? 'hover:-translate-y-2 hover:shadow-2xl hover:border-bejo-200 hover:shadow-bejo-600/10' : ''">
        <div class="relative h-60 overflow-hidden">
          <div v-if="product?.Status_Display && product.Status_Display != 'Aktif' && product.Status_Properti != 'Tersedia'" class="absolute inset-0 bg-black/40 backdrop-grayscale-[60%] z-[5] pointer-events-none transition-all duration-500"></div>

          <div v-if="product?.Status_Display && product.Status_Display != 'Aktif' && product.Status_Properti != 'Tersedia'" class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div class="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl transform transition-transform duration-500 group-hover:scale-110">
              <span class="text-sm font-black uppercase tracking-[0.2em] text-white">
                {{ product.Status_Display != 'Aktif' ? 'Nonaktif' : product.Status_Properti }}
              </span>
            </div>
          </div>

          <div class="absolute inset-x-0 bottom-0 min-h-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-[1] pointer-events-none" v-if="!isLoading"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" v-if="!isLoading"></div>

          <div class="absolute top-4 left-4 flex flex-col gap-2 z-10" v-if="!isLoading && product?.Status_Properti">
            <span class="w-fit bg-bejo-600/70 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md shadow-md border border-bejo-300/40">
              {{ product.Status_Display != 'Aktif' ? 'Nonaktif' : product.Status_Properti }}
            </span>
          </div>

          <div class="absolute top-4 right-4 flex flex-wrap gap-1.5 justify-end w-40 z-10" v-if="!isLoading">
            <span v-for="transaksi in product.Status_Transaksi" :key="transaksi" class="bg-black/40 backdrop-blur-md text-white/90 text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded-md border border-white/20 shadow-sm">
              {{ transaksi }}
            </span>
          </div>

          <div class="h-full w-full transition-all duration-700 ease-out will-change-transform" :class="isLoading ? 'bg-slate-200 animate-pulse' : 'group-hover:scale-110 bg-slate-100'">
            <img v-if="product?.MediaUrls?.length > 0" :src="product.MediaUrls[0].Id_Media || undefined" class="w-full h-full object-cover" :alt="product.Nama_Produk" loading="lazy" />
          </div>

          <div class="absolute bottom-4 left-4 right-4 z-[2] text-white drop-shadow-md">
            <h5 class="text-lg font-extrabold tracking-tight mb-1 truncate" :class="isLoading ? 'text-transparent bg-slate-300 rounded animate-pulse w-3/4 select-none' : ''">{{ product?.Nama_Produk || 'Memuat Data...' }}</h5>
            <span class="text-xs font-bold text-white/80 opacity-90 truncate" :class="isLoading ? 'text-transparent bg-slate-300 rounded animate-pulse w-1/4 select-none inline-block' : ''">{{ product?.Tipe || '...' }}</span>
          </div>
        </div>

        <div class="p-5 flex flex-col flex-1">
          <div class="flex items-start gap-1.5 text-bejo-600 mb-2" :class="isLoading ? 'opacity-50 grayscale' : ''">
            <Icon icon="lucide:map-pin" class="size-3.5 mt-0.5" />
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-500 truncate" :class="isLoading ? 'text-transparent bg-slate-200 rounded animate-pulse w-1/3 select-none' : ''">{{ product?.Area?.[0] || 'Memuat...' }}</p>
          </div>
          <h4 class="text-md font-extrabold text-slate-900 mb-4 line-clamp-1 transition-colors" :class="isLoading ? 'text-transparent bg-slate-200 rounded animate-pulse w-full select-none' : 'group-hover:text-bejo-600'">{{ product?.Alamat || 'Memuat Detail Alamat...' }}</h4>

          <div class="grid grid-cols-3 gap-2 mb-4 bg-slate-50 border border-slate-100/50 p-2.5 rounded-2xl relative overflow-hidden transition-colors" :class="!isLoading ? 'group-hover:bg-bejo-50/30 group-hover:border-bejo-100' : ''">
            <div class="flex flex-col items-center">
              <div class="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 mb-1.5 md:mb-1 shrink-0" :class="isLoading ? 'opacity-50 grayscale' : ''">
                <Icon icon="lucide:land-plot" class="size-3.5 md:size-4 text-bejo-600" />
              </div>
              <span class="text-[9px] md:text-xs font-bold text-center" :class="isLoading ? 'text-transparent bg-slate-200 rounded animate-pulse w-full select-none' : 'text-slate-700'">{{ product?.Luas_Tanah || '0' }} m²</span>
            </div>

            <div class="flex flex-col items-center border-l border-slate-200">
              <div class="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 mb-1.5 md:mb-1 shrink-0" :class="isLoading ? 'opacity-50 grayscale' : ''">
                <Icon icon="lucide:home" class="size-3.5 md:size-4 text-bejo-600" />
              </div>
              <span class="text-[9px] md:text-xs font-bold text-center" :class="isLoading ? 'text-transparent bg-slate-200 rounded animate-pulse w-full select-none' : 'text-slate-700'">{{ product?.Luas_Bangunan || '0' }} m²</span>
            </div>

            <div class="flex flex-col items-center border-l border-slate-200">
              <div class="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 mb-1.5 md:mb-1 shrink-0" :class="isLoading ? 'opacity-50 grayscale' : ''">
                <Icon icon="lucide:bed" class="size-3.5 md:size-4 text-bejo-600" />
              </div>
              <span class="text-[9px] md:text-xs font-bold text-center" :class="isLoading ? 'text-transparent bg-slate-200 rounded animate-pulse w-full select-none' : 'text-slate-700'">{{ product?.Jumlah_Kamar_Tidur || '0' }} K.Tidur</span>
            </div>
          </div>

          <div class="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2 relative">
            <div v-show="isLoading || product?.Harga_Sewa1 > 0" class="flex flex-col flex-wrap">
              <span class="text-[9px] font-black uppercase tracking-widest mb-0.5" :class="isLoading ? 'text-transparent bg-slate-200 rounded animate-pulse w-1/4 select-none' : 'text-slate-400'"> Harga Sewa </span>
              <div class="flex flex-wrap items-baseline gap-1.5">
                <span class="text-base font-black" :class="isLoading ? 'text-transparent bg-slate-200 rounded animate-pulse w-1/2 select-none inline-block mt-1' : 'text-slate-900'">
                  {{ formatCurrency(product?.Harga_Sewa2 > 0 ? product.Harga_Sewa2 : product?.Harga_Sewa1 || 240000000) }}
                </span>
                <div v-if="!isLoading && product?.Harga_Sewa2 > 0" class="flex items-center gap-1.5">
                  <span class="relative text-[10px] text-slate-400 font-bold px-1 shrink-0 break-all leading-tight mt-0.5">
                    {{ formatCurrency(product.Harga_Sewa1) }}
                    <span class="absolute inset-x-0 top-1/2 h-[1.5px] bg-red-500 transform -rotate-[10deg] opacity-80 rounded-full"></span>
                  </span>
                  <span class="bg-red-50 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded-md leading-none border border-red-100/50 mt-0.5"> -{{ Math.round(((product.Harga_Sewa1 - product.Harga_Sewa2) / product.Harga_Sewa1) * 100) }}% </span>
                </div>
                <span v-if="!isLoading" class="text-[10px] text-slate-400 italic">/{{ product?.Satuan_Minimal_Sewa || 'thn' }}</span>
              </div>
            </div>

            <div v-show="!isLoading && product?.Harga_Jual1 > 0" class="flex flex-col flex-wrap">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Harga Jual</span>
              <div class="flex flex-wrap items-baseline gap-1.5">
                <span class="text-lg font-black text-slate-900">
                  {{ formatCurrency(product?.Harga_Jual2 > 0 ? product?.Harga_Jual2 : product?.Harga_Jual1) }}
                </span>
                <div v-if="!isLoading && product?.Harga_Jual2 > 0" class="flex items-center gap-1.5">
                  <span class="relative text-[10px] text-slate-400 font-bold px-1 shrink-0 break-all leading-tight mt-0.5">
                    {{ formatCurrency(product.Harga_Jual1) }}
                    <span class="absolute inset-x-0 top-1/2 h-[1.5px] bg-red-500 transform -rotate-[10deg] opacity-80 rounded-full"></span>
                  </span>
                  <span class="bg-red-50 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded-md leading-none border border-red-100/50 mt-0.5"> -{{ Math.round(((product.Harga_Jual1 - product.Harga_Jual2) / product.Harga_Jual1) * 100) }}% </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
