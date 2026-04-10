<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { distributionOptions, distributionSeries } from './data'
import VueApexCharts from 'vue3-apexcharts'
</script>

<template>
  <div class="card bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h4 class="text-lg font-black text-slate-900 leading-tight">Portofolio Unit</h4>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Sebaran Berdasarkan Tipe</p>
      </div>
      <button class="size-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
         <Icon icon="lucide:pie-chart" class="size-5" />
      </button>
    </div>

    <div class="flex items-center justify-center -mx-4">
      <VueApexCharts type="donut" height="240" :options="distributionOptions" :series="distributionSeries" />
    </div>
  </div>
</template>
