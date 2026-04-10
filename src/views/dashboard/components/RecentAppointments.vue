<script setup lang="ts">
import { Icon } from '@iconify/vue'
const recentVisits = [
  { agent: 'Budi Pratama', email: 'budi@rumahbejo.com', unit: 'Griya Asri Cluster A-12', time: 'Besok, 10:00 AM', status: 'Dikonfirmasi', statusClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  { agent: 'Siti Aminah', email: 'siti@rumahbejo.com', unit: 'Apartemen Skyview B-05', time: '12 Apr, 14:30 PM', status: 'Menunggu', statusClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  { agent: 'Andi Wijaya', email: 'andi@rumahbejo.com', unit: 'Ruko Central Park No. 8', time: '13 Apr, 09:00 AM', status: 'Dikonfirmasi', statusClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  { agent: 'Dewi Lestari', email: 'dewi@rumahbejo.com', unit: 'Griya Asri Cluster C-02', time: '14 Apr, 16:00 PM', status: 'Dibatalkan', statusClass: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
]
</script>

<template>
  <div class="card bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
    <div class="p-8 border-b border-slate-50 flex justify-between items-center">
      <div>
        <h4 class="text-lg font-black text-slate-900 leading-tight">Jadwal Kunjungan Lokasi</h4>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Agenda Site Visit Mendatang</p>
      </div>
      <button class="px-5 py-2.5 bg-slate-50 hover:bg-bejo-50 text-slate-600 hover:text-bejo-600 text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-slate-100 hover:border-bejo-200">
        Lihat Semua
      </button>
    </div>
    
    <div class="overflow-x-auto">
      <table class="min-w-full">
        <thead>
          <tr class="bg-slate-50/50 border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <th class="px-8 py-5 text-left">Agen Properti</th>
            <th class="px-8 py-5 text-left">Unit Properti</th>
            <th class="px-8 py-5 text-left">Waktu Kunjungan</th>
            <th class="px-8 py-5 text-center">Status</th>
            <th class="px-8 py-5 text-right font-black">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="(visit, idx) in recentVisits" :key="idx" class="group hover:bg-slate-50/50 transition-all cursor-pointer">
            <td class="px-8 py-6">
              <div class="flex items-center gap-4">
                <div class="size-10 rounded-2xl bg-gradient-to-br from-bejo-400 to-bejo-600 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-bejo-500/20">
                  {{ visit.agent.split(' ').map(n => n[0]).join('') }}
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-sm font-black text-slate-900 truncate">{{ visit.agent }}</span>
                  <span class="text-[10px] font-bold text-slate-400 truncate">{{ visit.email }}</span>
                </div>
              </div>
            </td>
            <td class="px-8 py-6">
              <div class="flex flex-col">
                <span class="text-sm font-black text-slate-700">{{ visit.unit }}</span>
                <span class="text-[10px] font-bold text-bejo-500 uppercase tracking-widest">Residensial</span>
              </div>
            </td>
            <td class="px-8 py-6">
              <div class="flex items-center gap-2 text-slate-600">
                <Icon icon="lucide:clock" class="size-4 text-slate-300" />
                <span class="text-sm font-bold">{{ visit.time }}</span>
              </div>
            </td>
            <td class="px-8 py-6 text-center">
              <span :class="`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${visit.statusClass}`">
                {{ visit.status }}
              </span>
            </td>
            <td class="px-8 py-6 text-right">
              <button class="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-bejo-600 hover:bg-bejo-50 transition-all">
                 <Icon icon="lucide:arrow-right" class="size-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>


