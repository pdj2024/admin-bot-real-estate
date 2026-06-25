<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps<{
  product: any
  isLoading?: boolean
}>()

const specs: { icon: string, label: string, key: string, suffix: string, additionalKey?: string, format?: boolean }[] = [
  { icon: 'lucide:land-plot', label: 'Luas Tanah', key: 'Luas_Tanah', suffix: ' m²' },
  { icon: 'lucide:home', label: 'Luas Bangunan', key: 'Luas_Bangunan', suffix: ' m²' },
  { icon: 'lucide:bed', label: 'Kamar Tidur', key: 'Jumlah_Kamar_Tidur', additionalKey: 'Jumlah_Kamar_Tidur_Tambahan', suffix: ' KT' },
  { icon: 'lucide:bath', label: 'Kamar Mandi', key: 'Jumlah_Kamar_Mandi', additionalKey: 'Jumlah_Kamar_Mandi_Tambahan', suffix: ' KM' },
  { icon: 'lucide:layers', label: 'Lantai', key: 'Jumlah_Lantai', suffix: ' Lt' },
  { icon: 'lucide:car', label: 'Carport', key: 'Jumlah_Carpot', suffix: ' Mobil' },
  { icon: 'lucide:road', label: 'Row Jalan', key: 'Row_Jalan', suffix: ' Mobil' }
]
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
    <template v-for="(spec, idx) in specs" :key="idx">
      <div
        v-if="!product || ((spec.key !== 'Luas_Tanah' || Number(product.Luas_Tanah) > 0) && (spec.key !== 'Row_Jalan' || (product.Row_Jalan && Number(product.Row_Jalan) > 0)) && (spec.key !== 'Daya_Listrik' || (product.Daya_Listrik && Number(product.Daya_Listrik) > 0)))"
        class="flex flex-col items-center p-5 rounded-3xl border border-slate-50 transition-all hover:bg-slate-50/50 hover:shadow-xl hover:shadow-slate-200/20 bg-white group"
      >
        <div class="p-3 bg-slate-50 rounded-2xl mb-4 shadow-sm border border-slate-50 group-hover:scale-110 group-hover:text-bejo-600 transition-all duration-500" :class="!product ? 'bg-slate-200 border-none animate-pulse' : ''">
          <Icon v-if="product" :icon="spec.icon" class="size-6 text-slate-400 group-hover:text-bejo-600 transition-colors" />
          <div v-else class="size-6 opacity-0"></div>
        </div>
        
        <span class="text-[9px] uppercase font-black mb-1.5 tracking-widest text-center whitespace-nowrap" 
              :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-12 select-none' : 'text-slate-400'">
          {{ spec.label }}
        </span>
        
        <span class="text-sm font-black text-slate-800" 
              :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-16 select-none mt-1' : ''">
          <template v-if="product">
            {{ spec.format ? Number(product[spec.key] || 0).toLocaleString('id-ID') : (product[spec.key] || 0) }}{{ spec.additionalKey && Number(product[spec.additionalKey]) > 0 ? `+${product[spec.additionalKey]}` : '' }}{{ spec.suffix || '' }}
          </template>
          <template v-else>Memuat..</template>
        </span>
      </div>
    </template>
  </div>
</template>
