<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'

interface Agent {
  No_Id: string
  Nama_Display: string
  stats: {
    totalJanjiTemu: number
    berhasil: number
    terjual: number
    tersewa: number
    prospekPercent: number
    trend: 'up' | 'down' | 'stable'
  }
}

const agents = ref<Agent[]>([])
const isLoading = ref(true)

const fetchAgents = async () => {
  try {
    const { data } = await api.get('/api/customer/getAll', {
      headers: {
        'X-Jenis-User': 'Admin',
        'Api-Key': 'realestate_key_2024'
      }
    })
    
    // Original customer data from API
    const rawData = data.Data || []
    
    // Map to Agents and generate dummy stats for demonstration
    agents.value = rawData.map((item: any) => {
      // Dummy data generation
      const total = Math.floor(Math.random() * 50) + 10
      const berhasil = Math.floor(Math.random() * total)
      const terjual = Math.floor(Math.random() * berhasil * 0.4)
      const tersewa = Math.floor(Math.random() * (berhasil - terjual) * 0.3)
      const trends: Agent['stats']['trend'][] = ['up', 'down', 'stable']
      
      return {
        No_Id: item.No_Id,
        Nama_Display: item.Nama_Display || item.UserName,
        stats: {
          totalJanjiTemu: total,
          berhasil: berhasil,
          terjual: terjual,
          tersewa: tersewa,
          prospekPercent: Math.round((berhasil / total) * 100),
          trend: trends[Math.floor(Math.random() * trends.length)]
        }
      }
    })
  } catch (err) {
    console.error('Fetch agents error:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchAgents)
</script>

<template>
  <div class="card bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group/card">
    <!-- Sophisticated Decoration -->
    <div class="absolute -top-12 -right-12 size-48 bg-bejo-50/50 rounded-full blur-3xl pointer-events-none transition-transform duration-1000 group-hover/card:scale-150"></div>

    <div class="flex items-center justify-between mb-10 relative z-10">
      <div class="flex items-center gap-4">
        <div class="size-12 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
           <Icon icon="lucide:bar-chart-3" class="size-6" />
        </div>
        <div>
          <h4 class="text-xl font-black text-slate-900 leading-tight">Performa Agen</h4>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Efektivitas & Prospeksitas Agent</p>
        </div>
      </div>
      <button class="size-10 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
         <Icon icon="lucide:maximize-2" class="size-4" />
      </button>
    </div>

    <div class="relative z-10">
      <table class="w-full border-separate border-spacing-0">
        <thead>
          <tr class="text-left">
            <th class="pl-0 pr-4 pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] transition-colors group-hover/card:text-bejo-500">Nama Lister</th>
            <th class="px-4 pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right transition-colors group-hover/card:text-bejo-500">Prospek</th>
          </tr>
        </thead>
        <tbody v-if="!isLoading" class="divide-y divide-slate-50">
          <tr v-for="agent in agents" :key="agent.No_Id" class="group relative hover:bg-slate-50/80 transition-all duration-300">
            <td class="relative pl-0 pr-4 py-5 transition-all">
              <!-- Row Hover Indicator (Inside TD) -->
              <div class="absolute left-[-16px] top-4 bottom-4 w-1 bg-gradient-to-b from-bejo-500 to-bejo-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_10px_rgba(247,82,17,0.5)]"></div>

              <div class="flex items-center gap-4">
                <div class="size-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-xs uppercase shadow-inner border border-slate-100 group-hover:bg-white group-hover:text-bejo-600 group-hover:border-bejo-100 group-hover:shadow-lg group-hover:shadow-bejo-500/10 transition-all duration-500">
                  {{ agent.Nama_Display.substring(0, 2) }}
                </div>
                <div>
                    <span class="text-sm font-black text-slate-800 block leading-none mb-1 group-hover:text-bejo-600 transition-colors uppercase">{{ agent.Nama_Display }}</span>
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Lister Aktif</span>
                </div>
              </div>
            </td>
            <td class="px-4 py-5 text-right">
              <div class="flex items-center justify-end gap-3">
                 <div class="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100/50 group-hover:bg-white group-hover:border-slate-200 transition-colors">
                    <Icon v-if="agent.stats.trend === 'up'" icon="lucide:trending-up" class="size-3.5 text-emerald-500" />
                    <Icon v-else-if="agent.stats.trend === 'down'" icon="lucide:trending-down" class="size-3.5 text-amber-500" />
                    <Icon v-else icon="lucide:minus" class="size-3.5 text-slate-300" />
                    <span class="text-xs font-black" :class="agent.stats.prospekPercent > 50 ? 'text-emerald-700' : 'text-amber-700'">
                        {{ agent.stats.prospekPercent }}%
                    </span>
                 </div>
                 <div class="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                    <div class="h-full transition-all duration-1000" :class="agent.stats.prospekPercent > 50 ? 'bg-emerald-500' : 'bg-amber-500'" :style="{ width: agent.stats.prospekPercent + '%' }"></div>
                 </div>
              </div>
              
              <!-- Absolute Hover Popup -->
              <div class="invisible group-hover:visible absolute right-12 top-0 mt-0 z-[100] w-80 p-7 bg-white/95 backdrop-blur-xl text-slate-900 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(15,23,42,0.2)] border border-slate-100/50 animate-in fade-in zoom-in-95 slide-in-from-right-4 duration-300 pointer-events-none">
                <div class="flex items-center gap-4 mb-6">
                  <div class="size-11 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
                    <Icon icon="lucide:user-check" class="size-5" />
                  </div>
                  <div class="text-left">
                    <h6 class="text-base font-black truncate leading-none mb-1 uppercase">{{ agent.Nama_Display }}</h6>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detail Performa Akumulatif</span>
                  </div>
                </div>

                <div class="space-y-4">
                  <div class="flex justify-between items-center bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                    <div class="flex items-center gap-3">
                        <Icon icon="lucide:calendar-range" class="size-4 text-slate-400" />
                        <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Janji Temu</span>
                    </div>
                    <span class="text-base font-black text-slate-900">{{ agent.stats.totalJanjiTemu }}</span>
                  </div>

                  <div class="grid grid-cols-3 gap-3">
                    <div class="p-4 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                        <span class="block text-[8px] font-black uppercase text-emerald-500 mb-2">Berhasil</span>
                        <span class="text-sm font-black text-emerald-700">{{ agent.stats.berhasil }}</span>
                    </div>
                    <div class="p-4 rounded-3xl bg-bejo-500/5 border border-bejo-500/10 text-center">
                        <span class="block text-[8px] font-black uppercase text-bejo-500 mb-2">Terjual</span>
                        <span class="text-sm font-black text-bejo-700">{{ agent.stats.terjual }}</span>
                    </div>
                    <div class="p-4 rounded-3xl bg-sky-500/5 border border-sky-500/10 text-center">
                        <span class="block text-[8px] font-black uppercase text-sky-500 mb-2">Tersewa</span>
                        <span class="text-sm font-black text-sky-700">{{ agent.stats.tersewa }}</span>
                    </div>
                  </div>
                </div>

                <div class="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                   <div class="flex items-center gap-2">
                       <div class="size-2 rounded-full bg-bejo-500 animate-pulse"></div>
                       <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Prospek</span>
                   </div>
                   <span class="text-sm font-black text-bejo-600">{{ agent.stats.prospekPercent }}%</span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Skeleton Loader -->
        <tbody v-else>
          <tr v-for="i in 5" :key="i" class="animate-pulse">
            <td class="pl-0 pr-4 py-5 font-bold">
              <div class="flex items-center gap-4">
                <div class="size-10 rounded-2xl bg-slate-100"></div>
                <div class="space-y-2">
                  <div class="h-3 w-24 bg-slate-100 rounded"></div>
                  <div class="h-2 w-16 bg-slate-50 rounded"></div>
                </div>
              </div>
            </td>
            <td class="px-4 py-5">
              <div class="flex items-center justify-end gap-3">
                <div class="h-6 w-12 bg-slate-100 rounded-lg"></div>
                <div class="h-1.5 w-16 bg-slate-50 rounded-full"></div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="!isLoading && agents.length === 0" class="py-16 text-center">
        <div class="size-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Icon icon="lucide:users-2" class="size-8 text-slate-200" />
        </div>
        <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Data lister belum tersedia</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.divide-y > :not([hidden]) ~ :not([hidden]) {
  border-top-width: 1px;
}

.shadow-3xl {
    box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.15);
}
</style>

<style scoped>
.divide-y > :not([hidden]) ~ :not([hidden]) {
  border-top-width: 1px;
}
</style>
