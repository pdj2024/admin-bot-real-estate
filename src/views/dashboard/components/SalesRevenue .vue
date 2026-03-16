<template>
  <div class="lg:col-span-2 col-span-1 mt-5">
    <div class="card">
      <div class="card-header">
        <h6 class="card-title">Ringkasan Penjualan</h6>
        <div class="relative">
          <input ref="inputRef" type="text" data-provider="flatpickr" data-date-format="d M, Y" data-range-date="true" placeholder="Pilih Tanggal" class="form-input form-input-sm ps-9" />
          <div class="absolute inset-y-0 start-0 flex items-center ps-3">
            <Icon icon="lucide:calendar-range" class="size-4 text-default-500"></Icon>
          </div>
        </div>
      </div>
      <div class="card-body">
        <div class="grid md:grid-cols-4 grid-cols-1 mb-3 gap-4">
          <div class="col-span-1">
            <div class="flex items-center gap-3">
              <div class="btn size-12 bg-secondary/10">
                <Icon icon="lucide:bar-chart" class="text-secondary size-6"></Icon>
              </div>
              <div>
                <p class="mb-1.5 text-default-500 text-sm">Total Penjualan</p>
                <h5 class="text-base font-semibold text-default-800">Rp&nbsp;<span data-target="23.450.000">23.450.000</span></h5>
              </div>
            </div>
          </div>
          <div class="col-span-1">
            <div class="flex items-center gap-3">
              <div class="btn size-12 bg-success/10">
                <Icon icon="lucide:trending-up" class="text-success size-6"></Icon>
              </div>
              <div>
                <p class="mb-1.5 text-default-500 text-sm">Total Keuntungan</p>
                <h5 class="text-base font-semibold text-default-800">Rp&nbsp;<span data-target="3.720.000">3.720.000</span></h5>
              </div>
            </div>
          </div>
        </div>

        <VueApexCharts type="bar" height="310" :options="salesOptions" :series="salesseries" />
      </div>
    </div>
  </div>
</template>

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
