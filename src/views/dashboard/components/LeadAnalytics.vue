<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { leadOptions, leadSeries } from './data'
import VueApexCharts from 'vue3-apexcharts'
</script>

<template>
  <div class="card bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h4 class="text-lg font-black text-slate-900 leading-tight">Analitik Leads</h4>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Performa Marketing & Kunjungan</p>
      </div>
      <div class="flex gap-2">
        <button class="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-white transition-colors">Bulan Ini</button>
        <button class="p-2 bg-bejo-500/10 rounded-xl text-bejo-600">
           <Icon icon="lucide:download" class="size-4" />
        </button>
      </div>
    </div>

    <div class="-mx-4">
      <VueApexCharts type="area" height="264" :options="leadOptions" :series="leadSeries" />
    </div>

    <div class="mt-6 pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
      <div class="flex items-center gap-3">
        <div class="size-2 rounded-full bg-bejo-500"></div>
        <span class="text-xs font-bold text-slate-600">Total Leads: <span class="text-slate-900">722</span></span>
      </div>
      <div class="flex items-center gap-3">
        <div class="size-2 rounded-full bg-sky-500"></div>
        <span class="text-xs font-bold text-slate-600">Total Visit: <span class="text-slate-900">315</span></span>
      </div>
    </div>
  </div>
</template>
