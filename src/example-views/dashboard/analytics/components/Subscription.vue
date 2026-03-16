<template>
  <div class="card">
    <div class="card-header">
      <h6 class="card-title">Subscription Distribution</h6>
    </div>
    <div class="card-body">
      <VueApexCharts type="donut" height="290" :options="subscriptionDistributionOptions" :series="subscriptionDistributionseries" />
    </div>
  </div>
</template>

<script setup lang="ts">
import VueApexCharts from 'vue3-apexcharts'
import { subscriptionDistributionOptions, subscriptionDistributionseries } from './data'
</script>
