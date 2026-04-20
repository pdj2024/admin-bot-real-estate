<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { prospectOptions, prospectSeries } from './data'
import VueApexCharts from 'vue3-apexcharts'

const isLoading = ref(true)

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 1500)
})
</script>

<template>
  <div class="card bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h4 class="text-lg font-black text-slate-900 leading-tight">Analitik Prospek</h4>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Performa Marketing & Kunjungan</p>
      </div>
      <div class="flex gap-2">
        <button class="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-white transition-colors">Bulan Ini</button>
        <button class="p-2 bg-bejo-500/10 rounded-xl text-bejo-600">
           <Icon icon="lucide:download" class="size-4" />
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
          <div class="size-2 rounded-full bg-sky-500"></div>
          <span class="text-xs font-bold text-slate-600">Total Visit: <span class="text-slate-900">315</span></span>
        </div>
      </div>
    </template>
  </div>
</template>
