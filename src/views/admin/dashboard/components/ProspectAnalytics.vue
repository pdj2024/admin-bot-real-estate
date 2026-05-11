<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import { prospectOptions, prospectSeries } from './data'
import VueApexCharts from 'vue3-apexcharts'

const isLoading = ref(true)
const timeFilter = ref('Bulan Ini')
const isDownloading = ref(false)
const showDropdown = ref(false)

const handleDownload = () => {
  isDownloading.value = true
  
  // Simulate creating and downloading a file
  setTimeout(() => {
    const content = "Laporan Analitik Prospek\nRentang: " + timeFilter.value + "\nTotal Prospek: 722\nTotal Visit: 315";
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Prospek_${timeFilter.value.replace(/ /g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    isDownloading.value = false
  }, 1500)
}

const closeDropdown = (e: MouseEvent) => {
  if (!(e.target as HTMLElement).closest('.filter-dropdown')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', closeDropdown)
  setTimeout(() => {
    isLoading.value = false
  }, 1500)
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdown)
})
</script>

<template>
  <div class="card bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 h-full">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h4 class="text-lg font-black text-slate-900 leading-tight">Analitik Prospek</h4>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Performa Marketing & Kunjungan</p>
      </div>
      <div class="flex gap-2">
        <div class="relative filter-dropdown">
          <button 
            @click.stop="showDropdown = !showDropdown"
            class="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-white hover:border-bejo-200 transition-all flex items-center gap-2"
          >
            {{ timeFilter }}
            <Icon icon="lucide:chevron-down" class="size-3" />
          </button>
          <!-- Click-based Dropdown -->
          <div 
            v-if="showDropdown"
            class="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2 z-[50] animate-in fade-in zoom-in-95 duration-200"
          >
            <button 
              v-for="opt in ['Bulan Ini', '3 Bulan Terakhir', 'Tahun Ini']" 
              :key="opt"
              @click="timeFilter = opt; showDropdown = false"
              class="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-bejo-600 hover:bg-bejo-50 rounded-xl transition-all flex items-center justify-between"
            >
              {{ opt }}
              <Icon v-if="timeFilter === opt" icon="lucide:check" class="size-3 text-bejo-600" />
            </button>
          </div>
        </div>
        <button 
          @click="handleDownload"
          :disabled="isDownloading"
          class="p-2 bg-bejo-500 text-white rounded-xl shadow-lg shadow-bejo-500/20 hover:-translate-y-1 transition-all disabled:opacity-50"
        >
           <Icon :icon="isDownloading ? 'lucide:loader-2' : 'lucide:download'" :class="{'animate-spin': isDownloading}" class="size-4" />
        </button>
      </div>
    </div>

    <!-- Skeleton Loader -->
    <div v-if="isLoading" class="animate-pulse">
      <div class="h-[264px] bg-slate-50/50 rounded-3xl flex items-end gap-2 px-4 pb-4">
         <div v-for="i in 12" :key="i" class="flex-1 bg-slate-100 rounded-t-lg" :style="{ height: Math.floor(Math.random() * 60) + 40 + '%' }"></div>
      </div>
      <div class="mt-6 pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
        <div class="h-4 w-32 bg-slate-50 rounded"></div>
        <div class="h-4 w-32 bg-slate-50 rounded ml-auto"></div>
      </div>
    </div>

    <template v-else>
      <div class="-mx-4">
        <VueApexCharts type="area" height="264" :options="prospectOptions" :series="prospectSeries" />
      </div>

      <div class="mt-6 pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
        <div class="flex items-center gap-3">
          <div class="size-2 rounded-full bg-bejo-500"></div>
          <span class="text-xs font-bold text-slate-600">Total Prospek: <span class="text-slate-900">722</span></span>
        </div>
        <div class="flex items-center gap-3">
          <div class="size-2 rounded-full bg-bejo-900"></div>
          <span class="text-xs font-bold text-slate-600">Total Visit: <span class="text-slate-900">315</span></span>
        </div>
      </div>
    </template>
  </div>
</template>
