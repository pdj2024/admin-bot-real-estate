<template>
  <div class="col-span-1">
    <div class="card mb-6 bg-card border-default-200">
      <div class="card-header border-b border-default-100 flex justify-between items-center">
        <h6 class="card-title text-default-900 font-bold text-sm uppercase tracking-wider">Sumber Calon Pembeli</h6>
        <RouterLink to="" class="text-[10px] font-black text-primary uppercase hover:underline flex items-center gap-1">
          Analitik
          <Icon icon="lucide:move-right" class="size-3"></Icon>
        </RouterLink>
      </div>
      <div class="card-body">
        <div class="grid md:grid-cols-12 grid-cols-1 items-center">
          <div class="md:col-span-7 col-span-1">
            <VueApexCharts type="radialBar" height="220" :options="initTrafficResources" :series="initTrafficResourceseries" />
          </div>
          <div class="md:col-span-5 col-span-1">
            <div class="flex flex-col gap-4">
              <div class="flex flex-col">
                <div class="flex items-center gap-2 mb-1">
                  <div class="bg-sky-500 size-2 rounded-full"></div>
                  <p class="text-[11px] font-bold text-default-600 uppercase">Iklan Berbayar</p>
                </div>
                <h4 class="text-sm font-black text-default-900 ml-4">44%</h4>
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-2 mb-1">
                  <div class="bg-yellow-500 size-2 rounded-full"></div>
                  <p class="text-[11px] font-bold text-default-600 uppercase">Media Sosial</p>
                </div>
                <h4 class="text-sm font-black text-default-900 ml-4">34%</h4>
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-2 mb-1">
                  <div class="bg-emerald-500 size-2 rounded-full"></div>
                  <p class="text-[11px] font-bold text-default-600 uppercase">Organik/SEO</p>
                </div>
                <h4 class="text-sm font-black text-default-900 ml-4">22%</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card bg-card border-default-200">
      <div class="card-body p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-[10px] font-bold text-default-500 uppercase tracking-widest mb-1">Capaian Closing</p>
            <h5 class="text-2xl text-default-900 font-black">
              1,596 <span class="text-xs font-medium text-default-400">/ 2.0k Unit</span>
            </h5>
          </div>
          <div class="text-right">
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-danger/10 text-danger border border-danger/20">
              <Icon icon="lucide:trending-down" class="size-3"></Icon>
              6.8%
            </span>
          </div>
        </div>
        
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <p class="text-xs font-bold text-default-600 uppercase">Progres Tahunan</p>
            <h6 class="text-xs font-black text-primary">85%</h6>
          </div>
          <div class="w-full bg-default-100 rounded-full h-2 overflow-hidden">
            <div class="bg-primary h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(43,127,255,0.4)]" style="width: 85%"></div>
          </div>
          <p class="text-[10px] text-default-400 italic">Dibutuhkan 404 unit lagi untuk mencapai target Q4</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { initTrafficResources, initTrafficResourceseries } from './data'
import VueApexCharts from 'vue3-apexcharts'
import { RouterLink } from 'vue-router'
</script>