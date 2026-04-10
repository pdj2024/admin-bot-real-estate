<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { inventoryStats } from './data'

const getColorClass = (color: string) => {
  const map: Record<string, string> = {
    bejo: 'text-bejo-600 bg-bejo-500/10',
    sky: 'text-sky-600 bg-sky-500/10',
    emerald: 'text-emerald-600 bg-emerald-500/10',
    amber: 'text-amber-600 bg-amber-500/10',
    slate: 'text-slate-600 bg-slate-500/10',
  }
  return map[color] || map.bejo
}
</script>

<template>
  <div class="space-y-4 pt-4">
    <div class="flex items-center justify-between px-2">
      <h4 class="text-sm font-black text-slate-900 uppercase tracking-widest">Status Inventori Properti</h4>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div 
        v-for="(stat, idx) in inventoryStats" 
        :key="idx"
        class="group flex items-center gap-4 bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-slate-100 shadow-lg shadow-slate-200/30 hover:bg-white hover:shadow-xl transition-all duration-300"
      >
        <div :class="`size-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${getColorClass(stat.color)}`">
           <Icon :icon="stat.icon" class="size-6" />
        </div>
        <div class="min-w-0">
          <h5 class="text-xl font-black text-slate-900 truncate leading-none mb-1">{{ stat.value }}</h5>
          <p class="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 whitespace-nowrap">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
