<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { operationalStats } from './data'

const isLoading = ref(true)

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 1200)
})

const getColorClass = (color: string) => {
  const map: Record<string, string> = {
    bejo: 'bg-bejo-500/10 text-bejo-600 border-bejo-500/20 shadow-bejo-500/5',
    'bejo-dark': 'bg-bejo-900/10 text-bejo-900 border-bejo-900/20 shadow-bejo-900/5',
    'bejo-soft': 'bg-bejo-100 text-bejo-700 border-bejo-200 shadow-bejo-600/5',
    slate: 'bg-slate-500/10 text-slate-600 border-slate-500/20 shadow-slate-500/5',
  }
  return map[color] || map.bejo
}

const getIconBg = (color: string) => {
  const map: Record<string, string> = {
    bejo: 'bg-bejo-500',
    'bejo-dark': 'bg-bejo-900',
    'bejo-soft': 'bg-bejo-400',
    slate: 'bg-slate-600',
  }
  return map[color] || map.bejo
}

const getGlowColor = (color: string) => {
  const map: Record<string, string> = {
    bejo: 'group-hover:shadow-bejo-500/20',
    'bejo-dark': 'group-hover:shadow-bejo-900/20',
    'bejo-soft': 'group-hover:shadow-bejo-400/20',
    slate: 'group-hover:shadow-slate-500/20',
  }
  return map[color] || map.bejo
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between px-2">
      <div class="flex items-center gap-3">
        <div class="size-8 rounded-lg bg-bejo-600 flex items-center justify-center text-white shadow-lg shadow-bejo-600/20">
          <Icon icon="lucide:activity" class="size-4" />
        </div>
        <h4 class="text-sm font-black text-slate-900 uppercase tracking-[0.1em]">Ringkasan Operasional</h4>
      </div>
      <button class="p-2 hover:bg-slate-100 rounded-xl transition-colors">
        <Icon icon="lucide:settings-2" class="size-4 text-slate-400" />
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Skeleton State -->
      <template v-if="isLoading">
        <div v-for="i in 4" :key="i" class="bg-white rounded-[2.2rem] p-7 border border-slate-100 animate-pulse">
          <div class="flex items-start justify-between mb-6">
            <div class="size-14 rounded-2xl bg-slate-100"></div>
            <div class="text-right space-y-2">
               <div class="h-8 w-16 bg-slate-100 rounded ml-auto"></div>
               <div class="h-4 w-20 bg-slate-50 rounded-full ml-auto"></div>
            </div>
          </div>
          <div class="space-y-3">
            <div class="h-3 w-24 bg-slate-50 rounded"></div>
            <div class="h-1.5 w-full bg-slate-50 rounded-full"></div>
          </div>
        </div>
      </template>

      <!-- Content -->
      <div 
        v-else
        v-for="(item, idx) in operationalStats" 
        :key="idx"
        class="group relative overflow-hidden bg-white rounded-[2.2rem] p-7 border border-slate-100 shadow-xl shadow-slate-200/40 transition-all duration-500 cursor-pointer"
        :class="getGlowColor(item.color)"
      >
        <div class="flex items-start justify-between mb-6">
          <div :class="`size-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${getIconBg(item.color)}`">
            <Icon :icon="item.icon" class="size-7" />
          </div>
          <div class="text-right">
            <h2 class="text-4xl font-black text-slate-900 tracking-tight mb-1">{{ item.value }}</h2>
            <div :class="`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border transition-all duration-500 ${getColorClass(item.color)}`">
               <Icon icon="lucide:arrow-up-right" class="size-3" />
               {{ item.trend }}
            </div>
          </div>
        </div>
        
        <div class="relative z-10">
          <div class="flex justify-between items-end mb-2">
            <p class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{{ item.label }}</p>
            <span class="text-[10px] font-black text-slate-900">75%</span>
          </div>
          <div class="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
             <div 
               class="h-full transition-all duration-1000 relative" 
               :class="getIconBg(item.color)"
               :style="{ width: '75%' }"
             >
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
             </div>
          </div>
        </div>

        <!-- Decorative Subtle Background Icon -->
        <Icon :icon="item.icon" class="absolute -bottom-4 -right-4 size-24 text-slate-50 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0" />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
</style>
