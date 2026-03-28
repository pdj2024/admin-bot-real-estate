<script setup lang="ts">
import { Icon } from '@iconify/vue'
import avatar4 from '@/assets/images/user/avatar-4.png'
import avatar2 from '@/assets/images/user/avatar-2.png'
import avatar3 from '@/assets/images/user/avatar-3.png'
import avatar5 from '@/assets/images/user/avatar-5.png'
import { RouterLink } from 'vue-router'

// Data dummy yang disesuaikan untuk Properti
const topLeads = [
  { name: 'Urrie Arthur', email: 'arthur@email.com', avatar: avatar2, interest: 'Griya Asri A1', value: 'Rp 1.2 M' },
  { name: 'Natalie Christy', email: 'natalie@email.com', avatar: avatar3, interest: 'Apartemen Sky', value: 'Rp 850 Jt' },
  { name: 'Laurie Jackson', email: 'jackson@email.com', avatar: avatar4, interest: 'Villa Ubud', value: 'Rp 3.4 M' },
  { name: 'Michael Torres', email: 'torres@email.com', avatar: avatar5, interest: 'Mansion Hills', value: 'Rp 5.2 M' },
]
</script>

<template>
  <div class="card bg-card border-default-200">
    <div class="card-header flex justify-between items-center border-b border-default-100">
      <h6 class="card-title text-default-900 font-bold">Peforma Agen Properti</h6>
      <div class="hs-dropdown relative inline-flex">
        <button type="button" class="hs-dropdown-toggle btn size-8 text-default-500 hover:bg-default-100 rounded-lg transition-all">
          <Icon icon="lucide:more-vertical" class="size-5"></Icon>
        </button>
        <div class="hs-dropdown-menu hidden z-50 bg-card border border-default-150 shadow-xl rounded-xl p-1" role="menu">
          <RouterLink class="flex items-center gap-2 py-2 px-3 text-xs font-bold text-default-600 hover:bg-default-50 rounded-lg" to="">Laporan Mingguan</RouterLink>
          <RouterLink class="flex items-center gap-2 py-2 px-3 text-xs font-bold text-default-600 hover:bg-default-50 rounded-lg" to="">Laporan Bulanan</RouterLink>
        </div>
      </div>
    </div>
    
    <div class="card-body">
      <div class="mb-6">
        <div class="flex items-center justify-between mb-2">
          <p class="text-default-500 text-xs font-bold uppercase tracking-wider">Target Unit Terjual</p>
          <span class="text-primary font-black text-sm">65%</span>
        </div>
        <div class="w-full h-2 rounded-full bg-default-100 overflow-hidden">
          <div class="h-full bg-primary rounded-full transition-all duration-1000" style="width: 65%"></div>
        </div>
        <div class="flex items-center gap-2 mt-4 p-3 bg-default-50/50 rounded-xl border border-default-100">
          <Icon icon="lucide:trending-up" class="size-5 text-success"></Icon>
          <p class="text-xs text-default-600 font-medium">
            Bulan ini: <span class="font-bold text-default-900">14 Unit Terkonfirmasi</span>
          </p>
        </div>
      </div>

      <div>
        <h6 class="mb-4 text-default-900 text-sm font-black uppercase tracking-widest">Transaksi Agen Terbanyak</h6>
        <div class="space-y-4">
          <div v-for="(lead, idx) in topLeads" :key="idx" 
               class="flex items-center justify-between group cursor-pointer p-2 hover:bg-default-50 rounded-xl transition-all">
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-full border-2 border-default-200 p-0.5 group-hover:border-primary transition-colors">
                <img :src="lead.avatar" alt="avatar" class="size-full rounded-full object-cover" />
              </div>
              <div class="flex flex-col">
                <h6 class="font-bold text-default-800 text-sm leading-tight mb-0.5">{{ lead.name }}</h6>
                <p class="text-[10px] text-primary font-bold uppercase tracking-tighter">{{ lead.interest }}</p>
              </div>
            </div>
            <div class="text-right">
              <h6 class="font-black text-default-900 text-xs">{{ lead.value }}</h6>
              <p class="text-[9px] text-default-400 font-medium">Potential Value</p>
            </div>
          </div>
        </div>
      </div>

      <button class="w-full mt-6 py-2.5 bg-default-100 text-default-700 text-xs font-black rounded-xl hover:bg-primary hover:text-white transition-all">
        LIHAT SEMUA LEADS
      </button>
    </div>
  </div>
</template>