<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { Product } from '../index.vue'
import PropertySpecsGrid from '@/components/common/PropertySpecsGrid.vue'

const props = defineProps<{
  product: Product | null
  isAdmin: boolean
}>()

const fullAddress = computed(() => {
  if (!props.product) return ''
  
  // 1. Clean up street address (split by '_' and take first part)
  const street = props.product.Alamat.split('_')[0].trim()
  
  // 2. Location parts
  const kelurahan = (props.product as any).Kelurahan || ''
  const kecamatan = (props.product as any).Kecamatan || ''
  const kota = props.product.Nama_Kota || ''
  const area = props.product.Nama_Area || ''

  // Build the string: street, kelurahan, kecamatan, kota (area)
  let result = street
  if (kelurahan) result += `, ${kelurahan}`
  if (kecamatan) result += `, ${kecamatan}`
  if (kota) result += `, ${kota}`
  if (area) result += ` (${area})`
  
  return result
})


const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}
</script>

<template>
  <div class="lg:col-span-2 col-span-1">
    <div class="card relative transition-all duration-700 border-none shadow-premium bg-white rounded-[2.5rem] overflow-hidden">
      <div class="card-body p-8 md:p-10">
        <!-- Header: Title & Address -->
        <div class="mb-10 border-b border-slate-100 pb-10 relative">
          <!-- Badges -->
          <div v-if="product" class="flex flex-wrap items-center gap-2 mb-5">
            <div v-for="tag in product.Status_Transaksi" :key="tag" class="px-4 py-1 rounded-full bg-bejo-500 text-white text-[9px] font-black uppercase tracking-widest shadow-sm shadow-bejo-500/20">
              {{ tag }}
            </div>
          </div>
          <div v-else class="flex gap-2 mb-5 animate-pulse">
            <div class="h-6 w-16 bg-slate-100 rounded-full"></div>
          </div>

          <h1 class="text-4xl md:text-6xl font-black tracking-tighter mb-4 uppercase leading-[0.85] text-slate-900" :class="!product ? 'text-transparent bg-slate-200 rounded-2xl animate-pulse select-none' : ''">
            {{ product?.Nama_Produk || 'Memuat Nama Properti...' }}
          </h1>
          <div class="flex items-start gap-2" :class="!product ? 'text-transparent bg-slate-200 rounded-lg animate-pulse select-none w-fit' : 'text-slate-500'">
            <Icon icon="lucide:map-pin" class="size-4 mt-1" :class="!product ? 'text-transparent' : 'text-bejo-600'" />
            <span class="text-sm font-bold tracking-tight leading-relaxed">
              {{ fullAddress || 'Memuat detail alamat...' }}
            </span>
          </div>

          <!-- Property Type Badge -->
          <div v-if="product?.Tipe" class="mt-4 px-4 py-1 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest w-fit shadow-sm shadow-slate-900/20">
            {{ product.Tipe }}
          </div>
          <div v-else-if="!product" class="mt-4 h-6 w-20 bg-slate-100 rounded-full animate-pulse"></div>
        </div>

        <!-- Pricing Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div v-show="!product || product?.Status_Transaksi?.includes('Jual')" class="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 relative group overflow-hidden">
            <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Icon icon="lucide:badge-dollar-sign" class="size-16" />
            </div>
            <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2" :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-fit select-none' : ''">Harga Jual</p>
            <h4 class="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span class="font-black text-3xl md:text-4xl text-slate-900 tracking-tighter" :class="!product ? 'text-transparent bg-slate-200 rounded-xl animate-pulse select-none' : ''">
                {{ !product ? formatCurrency(5000000000) : (product?.Harga_Jual2 == 0 ? formatCurrency(product.Harga_Jual1) : formatCurrency(product.Harga_Jual2)) }}
              </span>
              <div v-if="product?.Harga_Jual2 != 0 && product" class="flex items-center gap-2 mt-1">
                <span class="relative text-xs font-bold text-slate-400 italic px-1 shrink-0">
                  {{ formatCurrency(product?.Harga_Jual1 || 0) }}
                  <span class="absolute inset-x-0 top-1/2 h-[1.5px] bg-red-500 transform -rotate-[10deg] opacity-80 rounded-full"></span>
                </span>
                <span class="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-lg border border-red-100/50">
                  -{{ Math.round(((product.Harga_Jual1 - product.Harga_Jual2) / product.Harga_Jual1) * 100) }}%
                </span>
              </div>
            </h4>
          </div>

          <div v-show="!product || product?.Status_Transaksi?.includes('Sewa')" class="bg-bejo-50/30 p-6 rounded-3xl border border-bejo-100 relative group overflow-hidden">
            <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Icon icon="lucide:key-round" class="size-16 text-bejo-600" />
            </div>
            <p class="text-[10px] text-bejo-600 font-black uppercase tracking-widest mb-2" :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-fit select-none' : ''">Harga Sewa</p>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
              <h4 class="font-black text-3xl md:text-4xl text-bejo-600 tracking-tighter" :class="!product ? 'text-transparent bg-slate-200 rounded-xl animate-pulse select-none' : ''">
                {{ !product ? formatCurrency(150000000) : formatCurrency(product?.Harga_Sewa2 == 0 ? product.Harga_Sewa1 : product?.Harga_Sewa2 || 0) }}
              </h4>
              <div v-if="product?.Harga_Sewa2 != 0 && product" class="flex items-center gap-2 mt-1">
                <span class="relative text-xs font-bold text-slate-400 italic px-1 shrink-0">
                  {{ formatCurrency(product?.Harga_Sewa1 || 0) }}
                  <span class="absolute inset-x-0 top-1/2 h-[1.5px] bg-red-500 transform -rotate-[10deg] opacity-80 rounded-full"></span>
                </span>
                <span class="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-lg border border-red-100/50">
                  -{{ Math.round(((product.Harga_Sewa1 - product.Harga_Sewa2) / product.Harga_Sewa1) * 100) }}%
                </span>
              </div>
              <span v-if="product" class="text-xs font-bold text-bejo-600/70 lowercase mt-1 tracking-tight">/ {{ product?.Satuan_Minimal_Sewa || 'Tahun' }}</span>
            </div>
          </div>
        </div>

        <!-- Property Summary -->
        <div class="mb-14">
          <h6 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
             <div class="w-8 h-[2px] bg-slate-200 rounded-full"></div>
             Ringkasan Properti
          </h6>
          <PropertySpecsGrid :product="product" />
        </div>

        <!-- Description -->
        <div class="mb-14 p-8 md:p-10 bg-bejo-50/20 rounded-[2.5rem] border border-bejo-100/50 relative flex flex-col group hover:bg-bejo-50/40 transition-colors duration-500">
          <Icon icon="lucide:quote" class="absolute top-6 right-8 size-16 text-bejo-500/5 group-hover:scale-110 transition-transform" v-if="product" />
          <h6 class="text-[10px] font-black text-bejo-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
            <div class="w-10 h-[2px] bg-bejo-500 rounded-full"></div>
            Deskripsi Lengkap
          </h6>
          <p class="text-base md:text-lg leading-relaxed font-medium text-slate-600" :class="!product ? 'text-transparent bg-slate-200 rounded-lg animate-pulse select-none' : ''">
            {{ product?.Keterangan || 'Sedang memuat deskripsi lengkap tentang properti ini...' }}
          </p>
        </div>

        <!-- Accessibility -->
        <div class="mb-14">
          <h6 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
             <div class="w-8 h-[2px] bg-slate-200 rounded-full"></div>
             Aksesibilitas
          </h6>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 pl-4">
            <template v-if="product">
              <div v-for="(akses, idx) in product?.Akses_Jalan" :key="idx" class="flex items-center gap-4 group">
                <div class="size-2 rounded-full bg-red-500 shadow-lg shadow-red-500/20 group-hover:scale-125 transition-transform"></div>
                <span class="text-sm md:text-base font-bold text-slate-700 tracking-tight">{{ akses }}</span>
              </div>
              <div v-if="!product?.Akses_Jalan || product.Akses_Jalan.length === 0" class="text-sm font-bold text-slate-400 italic">
                Informasi akses jalan tidak tersedia
              </div>
            </template>
            <template v-else>
              <div v-for="i in 4" :key="i" class="flex items-center gap-4 animate-pulse">
                <div class="size-2 rounded-full bg-slate-200"></div>
                <div class="h-4 w-2/3 bg-slate-100 rounded"></div>
              </div>
            </template>
          </div>
        </div>

        <!-- Additional Info -->
        <div class="mb-6">
          <h6 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
             <div class="w-8 h-[2px] bg-slate-200 rounded-full"></div>
             Informasi Tambahan
          </h6>
          <div class="overflow-hidden border border-slate-100 rounded-3xl">
            <table class="w-full text-sm">
              <tbody class="divide-y divide-slate-100 font-bold">
                <tr v-for="item in [
                  { label: 'Daya Listrik', val: product ? (product.Daya_Listrik.toLocaleString('id-ID') + ' Watt') : null },
                  { label: 'Tipe Unit', val: product?.Tipe },
                  { label: 'Sertifikat', val: product?.Jenis_Sertifikat },
                  { label: 'Minimal Sewa', val: (product?.minimal_sewa || (product as any)?.Minimal_Sewa) ? ((product?.minimal_sewa || (product as any)?.Minimal_Sewa) + ' ' + (product?.Satuan_Minimal_Sewa || '')) : '-', show: !product || product?.Status_Transaksi?.includes('Sewa') }
                ].filter(i => i.show !== false)" :key="item.label" class="hover:bg-slate-50 transition-colors">
                  <td class="px-8 py-5 text-slate-500 bg-slate-50/50 w-1/3 italic">{{ item.label }}</td>
                  <td class="px-8 py-5 text-slate-900">
                    <span v-if="product">{{ item.val }}</span>
                    <div v-else class="h-4 w-24 bg-slate-100 rounded animate-pulse"></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.shadow-premium {
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.05);
}
</style>
