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
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
    <div
      v-for="(spec, idx) in specs"
      :key="idx"
      class="flex flex-col items-center py-4 sm:py-5 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 bg-white"
    >
      <div class="p-2.5 sm:p-3 bg-slate-50 rounded-xl mb-2 sm:mb-3 shadow-sm border border-slate-50" :class="!product ? 'bg-slate-200 border-none animate-pulse' : ''">
        <Icon v-if="product" :icon="spec.icon" class="size-5 sm:size-6 text-bejo-600" />
        <div v-else class="size-5 sm:size-6 opacity-0"></div>
      </div>
      
      <span class="text-[9px] uppercase font-black mb-0.5 sm:mb-1" 
            :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-12 select-none' : 'text-slate-400'">
        {{ spec.label }}
      </span>
      
      <span class="text-sm font-extrabold" 
            :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-16 select-none mt-1' : 'text-slate-800'">
        <template v-if="product">
          {{ product[spec.key] || 0 }}{{ spec.suffix || '' }}
        </template>
        <template v-else>Memuat..</template>
      </span>
    </div>
  </div>
</template>
