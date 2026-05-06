<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps<{
  product: any
  isLoading?: boolean
}>()

const specs = [
  { icon: 'lucide:land-plot', label: 'L. Tanah', key: 'Luas_Tanah', suffix: ' m²' },
  { icon: 'lucide:home', label: 'L. Bangunan', key: 'Luas_Bangunan', suffix: ' m²' },
  { icon: 'lucide:layers', label: 'Lantai', key: 'Jumlah_Lantai' },
  { icon: 'lucide:car', label: 'Carport', key: 'Jumlah_Carpot' },
  { icon: 'lucide:bed', label: 'K. Tidur', key: 'Jumlah_Kamar_Tidur' },
  { icon: 'lucide:bath', label: 'K. Mandi', key: 'Jumlah_Kamar_Mandi' }
]
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
    <template v-for="(spec, idx) in specs" :key="idx">
      <div
        v-if="!product || (spec.key !== 'Luas_Tanah' || Number(product.Luas_Tanah) > 0)"
        class="flex flex-col items-center p-5 rounded-3xl border border-slate-50 transition-all hover:bg-slate-50/50 hover:shadow-xl hover:shadow-slate-200/20 bg-white group"
      >
        <div class="p-3 bg-slate-50 rounded-2xl mb-4 shadow-sm border border-slate-50 group-hover:scale-110 group-hover:text-bejo-600 transition-all duration-500" :class="!product ? 'bg-slate-200 border-none animate-pulse' : ''">
          <Icon v-if="product" :icon="spec.icon" class="size-6 text-slate-400 group-hover:text-bejo-600 transition-colors" />
          <div v-else class="size-6 opacity-0"></div>
        </div>
        
        <span class="text-[9px] uppercase font-black mb-1.5 tracking-widest text-center" 
              :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-12 select-none' : 'text-slate-400'">
          {{ spec.label }}
        </span>
        
        <span class="text-sm font-black text-slate-800" 
              :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-16 select-none mt-1' : ''">
          <template v-if="product">
            {{ product[spec.key] || 0 }}{{ spec.suffix || '' }}
          </template>
          <template v-else>Memuat..</template>
        </span>
      </div>
    </template>
  </div>
</template>
