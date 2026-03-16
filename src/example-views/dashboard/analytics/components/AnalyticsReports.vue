<template>
  <div class="card">
    <div class="card-header mb-4">
      <h6 class="card-title">Analytics Reports</h6>
    </div>

    <div class="card-body">
      <VueApexCharts type="line" height="260" :options="analyticschartOptions" :series="analyticsseries" />
    </div>
  </div>
</template>

<script setup lang="ts">
import VueApexCharts from 'vue3-apexcharts'
import { analyticschartOptions, analyticsseries } from './data'
</script>
