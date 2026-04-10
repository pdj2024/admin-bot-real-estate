<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { operationalStats } from './data'

const getColorClass = (color: string) => {
  const map: Record<string, string> = {
    bejo: 'bg-bejo-500/10 text-bejo-600 border-bejo-500/20 shadow-bejo-500/5',
    sky: 'bg-sky-500/10 text-sky-600 border-sky-500/20 shadow-sky-500/5',
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-emerald-500/5',
  }
  return map[color] || map.bejo
}

const getIconBg = (color: string) => {
  const map: Record<string, string> = {
    bejo: 'bg-bejo-500',
    sky: 'bg-sky-500',
    emerald: 'bg-emerald-500',
  }
  return map[color] || map.bejo
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between px-2">
      <h4 class="text-sm font-black text-slate-900 uppercase tracking-widest">Ringkasan Operasional</h4>
      <Icon icon="lucide:more-horizontal" class="size-5 text-slate-400" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div 
        v-for="(item, idx) in operationalStats" 
        :key="idx"
        class="group relative overflow-hidden bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300"
      >
        <div class="flex items-start justify-between mb-4">
          <div :class="`size-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${getIconBg(item.color)}`">
            <Icon :icon="item.icon" class="size-6" />
          </div>
          <div class="text-right">
            <h2 class="text-3xl font-black text-slate-900 tracking-tight">{{ item.value }}</h2>
            <div :class="`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getColorClass(item.color)}`">
              {{ item.trend }}
            </div>
          </div>
        </div>
        
        <div>
          <p class="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">{{ item.label }}</p>
          <div class="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
             <div 
               class="h-full transition-all duration-1000" 
               :class="getIconBg(item.color)"
               :style="{ width: '65%' }"
             ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
