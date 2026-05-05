<script setup lang="ts">
import { Icon } from '@iconify/vue'

const stats = [
  { label: 'Janji Temu Hari Ini', value: '06', icon: 'lucide:calendar-check', color: 'bejo' },
  { label: 'Menunggu Konfirmasi', value: '08', icon: 'lucide:clock', color: 'bejo-soft' },
  { label: 'Total Janji Temu (Bulan Ini)', value: '124', icon: 'lucide:users', color: 'bejo-dark' },
]

const getIconBg = (color: string) => {
  const map: Record<string, string> = {
    bejo: 'bg-bejo-500',
    'bejo-soft': 'bg-bejo-400',
    'bejo-dark': 'bg-bejo-900',
  }
  return map[color] || map.bejo
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div 
      v-for="(item, idx) in stats" 
      :key="idx"
      class="group bg-white rounded-3xl p-4 border border-slate-100 shadow-lg shadow-slate-200/30 transition-all duration-300"
    >
      <div class="flex items-center gap-4">
        <div :class="`size-10 rounded-xl flex items-center justify-center text-white shadow-md transition-transform group-hover:rotate-6 ${getIconBg(item.color)}`">
           <Icon :icon="item.icon" class="size-5" />
        </div>
        <div>
          <h2 class="text-xl font-black text-slate-900 leading-none mb-1">{{ item.value }}</h2>
          <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">{{ item.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
