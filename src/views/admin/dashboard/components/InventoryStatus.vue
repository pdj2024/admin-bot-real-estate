<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'

interface StatDetail {
  label: string
  value: string
  icon: string
  color: string
  breakdown: Record<string, number>
}

const stats = ref<StatDetail[]>([
  { label: 'Tersedia', value: '0', icon: 'lucide:home', color: 'bg-bejo-500', breakdown: {} },
  { label: 'Draft', value: '0', icon: 'lucide:file-edit', color: 'bg-bejo-500', breakdown: {} },
  { label: 'Terjual', value: '0', icon: 'lucide:award', color: 'bg-bejo-500', breakdown: {} },
  { label: 'Tersewa', value: '0', icon: 'lucide:key', color: 'bg-bejo-500', breakdown: {} },
  { label: 'Nonaktif', value: '0', icon: 'lucide:eye-off', color: 'bg-bejo-500', breakdown: {} },
])

const expandedIdx = ref<number | null>(null)
const containerRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    expandedIdx.value = null
  }
}

const toggleDetail = (idx: number) => {
  if (expandedIdx.value === idx) expandedIdx.value = null
  else expandedIdx.value = idx
}

const isLoading = ref(true)

const fetchStats = async () => {
  try {
    isLoading.value = true
    const { data } = await api.get('/api/realEstate/getAll', { 
      headers: { 
        'X-Jenis-User': 'Admin',
        'Api-Key': 'realestate_key_2024'
      } 
    })
    const products = data.Data || []
    
    const count: Record<string, { total: number, types: Record<string, number> }> = {
      Tersedia: { total: 0, types: {} },
      Draft: { total: 0, types: {} },
      Terjual: { total: 0, types: {} },
      Tersewa: { total: 0, types: {} },
      Nonaktif: { total: 0, types: {} }
    }

    products.forEach((p: any) => {
      const type = p.Tipe || 'Lainnya'
      const statusProp = p.Status_Properti
      const statusDisp = p.Status_Display
      
      let bucket = ''
      
      if (statusProp === 'Terjual') {
        bucket = 'Terjual'
      } else if (statusProp === 'Tersewa') {
        bucket = 'Tersewa'
      } else if (statusDisp === 'Draft') {
        bucket = 'Draft'
      } else if (statusDisp === 'Nonaktif') {
        bucket = 'Nonaktif'
      } else if (statusProp === 'Tersedia') {
        bucket = 'Tersedia'
      }

      if (bucket && count[bucket]) {
        count[bucket].total++
        count[bucket].types[type] = (count[bucket].types[type] || 0) + 1
      }
    })

    stats.value[0].value = String(count.Tersedia.total)
    stats.value[0].breakdown = count.Tersedia.types
    
    stats.value[1].value = String(count.Draft.total)
    stats.value[1].breakdown = count.Draft.types

    stats.value[2].value = String(count.Terjual.total)
    stats.value[2].breakdown = count.Terjual.types

    stats.value[3].value = String(count.Tersewa.total)
    stats.value[3].breakdown = count.Tersewa.types

    stats.value[4].value = String(count.Nonaktif.total)
    stats.value[4].breakdown = count.Nonaktif.types

  } catch (err) {
    console.error('Fetch inventory stats error:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchStats()
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})

const getColorClass = (color: string) => {
  return `${color} text-white border-transparent shadow-lg shadow-bejo-500/20`
}
</script>

<template>
  <div class="space-y-4 pt-4">
    <div class="flex items-center justify-between px-2">
      <h4 class="text-sm font-black text-slate-900 uppercase tracking-widest">Status Inventori Properti</h4>
    </div>

    <div ref="containerRef" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <template v-if="isLoading">
        <div v-for="i in 5" :key="i" class="flex items-center gap-4 p-5 bg-white rounded-[2rem] border border-slate-100 animate-pulse">
          <div class="size-12 rounded-2xl bg-slate-100"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-12 bg-slate-100 rounded"></div>
            <div class="h-2 w-20 bg-slate-50 rounded"></div>
          </div>
          <div class="size-8 rounded-full bg-slate-50"></div>
        </div>
      </template>

      <div 
        v-else
        v-for="(stat, idx) in stats" 
        :key="idx"
        class="relative flex flex-col bg-white/60 backdrop-blur-md rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/30 transition-all duration-300"
        :class="expandedIdx === idx ? 'ring-2 ring-bejo-500/20 bg-white z-[60]' : 'z-10'"
      >
        <!-- Main Stats Card -->
        <div 
          @click="toggleDetail(idx)"
          class="group flex items-center gap-4 p-5 cursor-pointer hover:bg-white rounded-[2rem] transition-all duration-300"
        >
          <div :class="`size-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110 ${getColorClass(stat.color)}`">
             <Icon :icon="stat.icon" class="size-6" />
          </div>
          <div class="min-w-0 flex-1">
            <h5 class="text-xl font-black text-slate-900 truncate leading-none mb-1">{{ stat.value }}</h5>
            <p class="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 whitespace-nowrap">{{ stat.label }}</p>
          </div>
          <div class="size-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-all">
             <Icon icon="lucide:chevron-down" class="size-4 transition-transform duration-300" :class="expandedIdx === idx ? 'rotate-180' : ''" />
          </div>
        </div>

        <!-- Breakdown Details (Absolute Dropdown) -->
        <div 
          v-show="expandedIdx === idx"
          class="absolute top-[85%] left-0 right-0 p-5 bg-white shadow-2xl rounded-3xl border border-slate-100 space-y-2 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 z-[70]"
        >
          <div v-if="Object.keys(stat.breakdown).length === 0" class="text-[10px] font-bold text-slate-400 uppercase text-center py-2">
            Belum ada data rincian
          </div>
          <div 
            v-for="(count, type) in stat.breakdown" 
            :key="type"
            class="flex items-center justify-between p-2 rounded-xl bg-slate-50/50 border border-slate-100"
          >
            <span class="text-[10px] font-black text-slate-600 uppercase tracking-widest">{{ type }}</span>
            <span class="px-2 py-0.5 rounded-lg bg-slate-900 text-[10px] font-black text-white">{{ count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
