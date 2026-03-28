<script setup lang="ts">
import { Icon } from '@iconify/vue'
import VueApexCharts from 'vue3-apexcharts'
import { salesOptions, salesseries } from './data'
import { useFlatpickr } from '@/composables/useFlatpickr'

const { inputRef } = useFlatpickr({
  mode: 'range',
  dateFormat: 'd M, Y'
})
</script>

<template>
  <div class="card lg:col-span-2">
    <div class="card-header flex justify-between items-center border-b border-default-200">
      <h6 class="card-title text-default-900 font-bold">Analisis Konversi Listing</h6>
      <div class="flex gap-2">
        <select class="form-input form-input-sm bg-default-50 border-default-200 rounded-lg text-xs">
          <option>7 Hari Terakhir</option>
          <option>30 Hari Terakhir</option>
        </select>
      </div>
    </div>
    <div class="card-body">
      <div class="grid md:grid-cols-2 gap-6 mb-6">
        <div class="p-4 bg-default-50 rounded-xl border border-default-100">
          <p class="text-default-500 text-xs font-bold uppercase mb-1">Total Unit Terjual/Sewa</p>
          <h4 class="text-2xl font-black text-default-900">245 <span class="text-xs text-success font-normal">+12% bln ini</span></h4>
        </div>
        <div class="p-4 bg-default-50 rounded-xl border border-default-100">
          <p class="text-default-500 text-xs font-bold uppercase mb-1">Rasio Janji Temu</p>
          <h4 class="text-2xl font-black text-default-900">68% <span class="text-xs text-info font-normal">Sangat Baik</span></h4>
        </div>
      </div>
      <VueApexCharts type="area" height="300" :options="chartOptions" :series="chartSeries" />
    </div>
  </div>
</template>

