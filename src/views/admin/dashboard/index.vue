<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Vertical from '@/layouts/vertical.vue'
import GreetingsBanner from './components/GreetingsBanner.vue'
import OperationalSummary from './components/OperationalSummary.vue'
import InventoryStatus from './components/InventoryStatus.vue'
import ProspectAnalytics from './components/ProspectAnalytics.vue'
import TransactionAnalytics from './components/TransactionAnalytics.vue'
import RecentAppointments from './components/RecentAppointments.vue'
import { Icon } from '@iconify/vue'

const showSettings = ref(false)

// Date Filter States
const startDate = ref('2026-01-01')
const endDate = ref('2026-12-31')

const filterStartDate = ref('2026-01-01')
const filterEndDate = ref('2026-12-31')

const handleFilterSearch = () => {
  startDate.value = filterStartDate.value
  endDate.value = filterEndDate.value
}
const sections = ref({
  greetings: false,
  operationalSummary: true,
  inventoryStatus: true,
  analytics: true,
  recentAppointments: true
})

onMounted(() => {
  const saved = localStorage.getItem('dashboard_layout')
  if (saved) {
    const parsed = JSON.parse(saved)
    delete parsed.agentPerformance // ensure old property is removed
    sections.value = { ...sections.value, ...parsed }
  }
})

watch(sections, (newVal) => {
  // Ensure agentPerformance is not saved
  const copy = { ...newVal } as any
  delete copy.agentPerformance
  localStorage.setItem('dashboard_layout', JSON.stringify(copy))
}, { deep: true })

const getSectionLabel = (key: string) => {
  const map: Record<string, string> = {
    greetings: 'Sambutan Utama (Greetings)',
    operationalSummary: 'Ringkasan Operasional',
    inventoryStatus: 'Status Portofolio',
    analytics: 'Analitik Prospek',
    recentAppointments: 'Jadwal Kunjungan Lokasi'
  }
  return map[key] || key
}
</script>

<template>
  <Vertical>
    <div class="p-4 md:p-3 md:pt-1 pb-32 space-y-6 md:space-y-8 relative">
      <!-- Welcome Section -->
      <GreetingsBanner v-if="sections.greetings" @open-settings="showSettings = true" />

      <!-- Ringkasan Operasional Section -->
      <div v-if="sections.operationalSummary">
        <OperationalSummary @open-settings="showSettings = true" />
      </div>

      <!-- Status Portofolio Section -->
      <div v-if="sections.inventoryStatus">
        <InventoryStatus />
      </div>

      <!-- Date Filter Panel -->
      <div v-if="sections.analytics" class="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 class="text-sm font-black text-slate-800 uppercase tracking-wider">Filter Analitik & Transaksi</h4>
          <p class="text-xs font-bold text-slate-400 mt-0.5">Pilih rentang tanggal untuk memperbarui data grafik</p>
        </div>
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-xs font-black text-slate-450 uppercase tracking-wider">Mulai:</span>
            <input 
              v-model="filterStartDate" 
              type="date" 
              class="px-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bejo-400 focus:ring-1 focus:ring-bejo-400"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-black text-slate-450 uppercase tracking-wider">Selesai:</span>
            <input 
              v-model="filterEndDate" 
              type="date" 
              class="px-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-bejo-400 focus:ring-1 focus:ring-bejo-400"
            />
          </div>
          <button 
            @click="handleFilterSearch"
            class="px-5 py-2.5 bg-bejo-500 hover:bg-bejo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-bejo-500/10"
          >
            <Icon icon="lucide:search" class="size-4" />
            Cari
          </button>
        </div>
      </div>

      <!-- Main Analytical Section -->
      <div v-if="sections.analytics" class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div class="xl:col-span-6 flex flex-col">
          <ProspectAnalytics :startDate="startDate" :endDate="endDate" class="h-full" />
        </div>
        <div class="xl:col-span-6 flex flex-col">
          <TransactionAnalytics :startDate="startDate" :endDate="endDate" class="h-full" />
        </div>
      </div>

      <!-- Operational Detail Section -->
      <div v-if="sections.recentAppointments" class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div class="xl:col-span-12 flex flex-col">
          <RecentAppointments class="h-full" />
        </div>
      </div>

      <!-- Layout Settings Button (Floating) -->
      <button 
        @click="showSettings = true"
        class="fixed bottom-10 right-10 z-[100] size-14 bg-bejo-500 hover:bg-bejo-600 rounded-full shadow-2xl shadow-bejo-500/20 flex items-center justify-center text-white border border-bejo-600/10 transition-all group"
      >
        <Icon icon="lucide:settings-2" class="size-6 transition-transform group-hover:rotate-90" />
      </button>

      <!-- Settings Modal -->
      <div v-if="showSettings" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-md" @click="showSettings = false"></div>
        <div class="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-300">
          <!-- Header (Fixed) -->
          <div class="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div>
              <h3 class="text-xl font-black text-slate-900">Kustomisasi Dashboard</h3>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Atur tampilan yang Anda inginkan</p>
            </div>
            <button @click="showSettings = false" class="size-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors">
              <Icon icon="lucide:x" class="size-5" />
            </button>
          </div>

          <!-- Body (Scrollable) -->
          <div class="p-8 space-y-4 overflow-y-auto custom-scrollbar flex-1 max-h-[50vh]">
            <div v-for="(val, key) in sections" :key="key" class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div class="flex items-center gap-4">
                <div class="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-bejo-600 shadow-sm">
                  <Icon :icon="key === 'analytics' ? 'lucide:bar-chart-3' : key === 'greetings' ? 'lucide:sparkles' : 'lucide:layers'" class="size-5" />
                </div>
                <div>
                  <p class="text-sm font-black text-slate-700">{{ getSectionLabel(key) }}</p>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Tampilkan di Halaman Utama</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="sections[key]" class="sr-only peer">
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bejo-500"></div>
              </label>
            </div>
          </div>

          <!-- Footer (Fixed) -->
          <div class="p-8 bg-slate-50/50 border-t border-slate-100 text-center shrink-0">
            <button @click="showSettings = false" class="px-10 py-3.5 bg-bejo-500 hover:bg-bejo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-bejo-500/20 hover:-translate-y-1 transition-all">
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
