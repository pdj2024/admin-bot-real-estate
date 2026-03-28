<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { orders } from './data'
import { RouterLink } from 'vue-router'
const recentVisits = [
  { customer: 'Budi Santoso', property: 'Griya Asri C2', date: '28 Mar 2026, 10:00', status: 'Dikonfirmasi', statusClass: 'bg-success/10 text-success' },
  { customer: 'Siti Aminah', property: 'Apartemen Skyview', date: '29 Mar 2026, 14:30', status: 'Menunggu', statusClass: 'bg-warning/10 text-warning' },
]
</script>

<template>
  <div class="card bg-card border-default-200">
    <div class="card-header border-b border-default-200 flex justify-between items-center">
      <h6 class="card-title font-bold">Jadwal Kunjungan Lokasi</h6>
      <button class="text-primary text-xs font-bold">Lihat Semua</button>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-default-200">
        <thead class="bg-default-50">
          <tr class="text-[11px] font-bold text-default-500 uppercase tracking-wider">
            <th class="px-6 py-4 text-left">Agen Properti</th>
            <th class="px-6 py-4 text-left">Unit Properti</th>
            <th class="px-6 py-4 text-left">Waktu Kunjungan</th>
            <th class="px-4 py-4 text-center">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-default-200">
          <tr v-for="i in 5" :key="i" class="hover:bg-default-50/50 transition-colors">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="size-8 rounded-full bg-default-200 flex items-center justify-center font-bold text-default-600 text-xs">BP</div>
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-default-900">Budi Pratama</span>
                  <span class="text-[10px] text-default-400">budi@email.com</span>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-default-600">Griya Asri Cluster A-12</td>
            <td class="px-6 py-4 text-sm text-default-600">Besok, 10:00 AM</td>
            <td class="px-4 py-4 text-center">
              <span class="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-info/10 text-info border border-info/20">Dikonfirmasi</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>


