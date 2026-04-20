<template>
  <div class="flex flex-wrap items-center gap-4">
    <!-- Search Interface -->
    <div class="relative group min-w-[240px]">
      <div class="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none transition-colors group-focus-within:text-bejo-500 text-slate-400">
        <Icon icon="lucide:search" class="size-4" />
      </div>
      <input 
        type="text" 
        class="w-full h-11 ps-11 pe-4 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all placeholder:text-slate-400 placeholder:font-black placeholder:uppercase placeholder:tracking-widest" 
        placeholder="Cari Sales / Agent..." 
      />
    </div>

    <!-- Area Selector -->
    <div class="relative min-w-[160px]">
      <select class="w-full h-11 px-4 text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none appearance-none transition-all cursor-pointer">
        <option selected disabled>Pilih Area</option>
        <option>Semua Area</option>
        <option>Jakarta</option>
        <option>Bandung</option>
        <option>Yogyakarta</option>
      </select>
      <div class="absolute inset-y-0 end-4 flex items-center pointer-events-none text-slate-400">
        <Icon icon="lucide:map-pin" class="size-3.5" />
      </div>
    </div>

    <div class="flex items-center gap-2 ms-auto">
      <button type="button" class="h-11 px-4 bg-white border border-dashed border-bejo-200 text-bejo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-bejo-50 hover:border-bejo-500 transition-all flex items-center gap-2 group">
        <Icon icon="lucide:file-text" class="size-4 group-hover:-translate-y-0.5 transition-transform" />
        Laporan Performa
      </button>
      
      <button type="button" class="size-11 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-900 border border-slate-100 rounded-xl hover:bg-slate-100 transition-all">
        <Icon icon="lucide:sliders-horizontal" class="size-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
</script>
