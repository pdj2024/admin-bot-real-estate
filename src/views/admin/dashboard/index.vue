<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Vertical from '@/layouts/vertical.vue'
import GreetingsBanner from './components/GreetingsBanner.vue'
import OperationalSummary from './components/OperationalSummary.vue'
import InventoryStatus from './components/InventoryStatus.vue'
import ProspectAnalytics from './components/ProspectAnalytics.vue'
import PropertyDistribution from './components/PropertyDistribution.vue'
import RecentAppointments from './components/RecentAppointments.vue'
import AgentPerformance from './components/AgentPerformance.vue'
import { Icon } from '@iconify/vue'

const showSettings = ref(false)
const sections = ref({
  greetings: false,
  operationalSummary: true,
  inventoryStatus: true,
  analytics: true,
  recentAppointments: true,
  agentPerformance: true
})

onMounted(() => {
  const saved = localStorage.getItem('dashboard_layout')
  if (saved) {
    sections.value = { ...sections.value, ...JSON.parse(saved) }
  }
})

watch(sections, (newVal) => {
  localStorage.setItem('dashboard_layout', JSON.stringify(newVal))
}, { deep: true })
</script>

<template>
  <Vertical>
    <div class="p-0 md:p-3 md:pt-1 pb-32 space-y-6 md:space-y-8 relative">
      <!-- Welcome Section -->
      <GreetingsBanner v-if="sections.greetings" @open-settings="showSettings = true" />

      <!-- High-Level Stats -->
      <div v-if="sections.operationalSummary || sections.inventoryStatus" class="space-y-6">
        <OperationalSummary v-if="sections.operationalSummary" @open-settings="showSettings = true" />
        <InventoryStatus v-if="sections.inventoryStatus" />
      </div>

      <!-- Main Analytical Section -->
      <div v-if="sections.analytics" class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div class="xl:col-span-8 flex flex-col">
          <ProspectAnalytics class="h-full" />
        </div>
        <div class="xl:col-span-4 flex flex-col">
          <PropertyDistribution class="h-full" />
        </div>
      </div>

      <!-- Operational Detail Section -->
      <div v-if="sections.recentAppointments || sections.agentPerformance" class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div v-if="sections.recentAppointments" :class="sections.agentPerformance ? 'xl:col-span-8' : 'xl:col-span-12'" class="flex flex-col">
          <RecentAppointments class="h-full" />
        </div>
        <div v-if="sections.agentPerformance" :class="sections.recentAppointments ? 'xl:col-span-4' : 'xl:col-span-12'" class="flex flex-col">
          <AgentPerformance class="h-full" />
        </div>
      </div>

      <!-- Layout Settings Button (Floating) -->
      <button 
        @click="showSettings = true"
        class="fixed bottom-10 right-10 z-[100] size-14 bg-white border border-slate-200 rounded-full shadow-2xl flex items-center justify-center text-slate-600 hover:text-bejo-600 hover:border-bejo-200 transition-all group"
      >
        <Icon icon="lucide:settings-2" class="size-6 transition-transform group-hover:rotate-90" />
      </button>

      <!-- Settings Modal -->
      <div v-if="showSettings" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-md" @click="showSettings = false"></div>
        <div class="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div class="p-8 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 class="text-xl font-black text-slate-900">Kustomisasi Dashboard</h3>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Atur tampilan yang Anda inginkan</p>
            </div>
            <button @click="showSettings = false" class="size-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors">
              <Icon icon="lucide:x" class="size-5" />
            </button>
          </div>

          <div class="p-8 space-y-4">
            <div v-for="(val, key) in sections" :key="key" class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div class="flex items-center gap-4">
                <div class="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-bejo-600 shadow-sm">
                  <Icon :icon="key === 'analytics' ? 'lucide:bar-chart-3' : key === 'greetings' ? 'lucide:sparkles' : 'lucide:layers'" class="size-5" />
                </div>
                <div>
                  <p class="text-sm font-black text-slate-700 capitalize">{{ key.replace(/([A-Z])/g, ' $1') }}</p>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Tampilkan di Halaman Utama</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="sections[key]" class="sr-only peer">
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bejo-500"></div>
              </label>
            </div>
          </div>

          <div class="p-8 bg-slate-50/50 border-t border-slate-100 text-center">
            <button @click="showSettings = false" class="px-10 py-3.5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:-translate-y-1 transition-all">
              Selesai & Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  </Vertical>
</template>

<style scoped>
.animate-in {
  animation-duration: 0.3s;
}
</style>
