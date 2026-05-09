<template>
  <div class="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
    <!-- Search Interface -->
    <div class="relative group w-full lg:w-64">
      <div class="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none transition-colors group-focus-within:text-bejo-500 text-slate-400">
        <Icon icon="lucide:search" class="size-4" />
      </div>
      <input 
        v-model="searchQuery"
        type="text" 
        class="w-full h-11 ps-11 pe-4 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all placeholder:text-slate-400 placeholder:font-black placeholder:uppercase placeholder:tracking-widest" 
        placeholder="Cari Nama / Email..." 
      />
    </div>

    <!-- Status Selector -->
    <div class="relative w-full lg:w-48">
      <select v-model="status" class="w-full h-11 px-4 text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none appearance-none transition-all cursor-pointer">
        <option value="">Semua Status</option>
        <option value="aktif">Aktif</option>
        <option value="non aktif">Non-Aktif</option>
      </select>
      <div class="absolute inset-y-0 end-4 flex items-center pointer-events-none text-slate-400">
        <Icon icon="lucide:chevron-down" class="size-3.5" />
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button type="button" class="h-11 px-4 bg-white border border-dashed border-bejo-200 text-bejo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-bejo-50 hover:border-bejo-500 transition-all flex items-center gap-2 group whitespace-nowrap">
        <Icon icon="lucide:download-cloud" class="size-4 group-hover:-translate-y-0.5 transition-transform" />
        Import Data
      </button>
      
      <button type="button" class="size-11 shrink-0 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-900 border border-slate-100 rounded-xl hover:bg-slate-100 transition-all">
        <Icon icon="lucide:sliders-horizontal" class="size-4" />
      </button>

      <button 
        @click="$emit('add')"
        class="lg:hidden flex-1 h-11 bg-bejo-500 hover:bg-bejo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-bejo-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
      >
        <Icon icon="lucide:user-plus" class="size-4" />
        Tambah
      </button>
    </div>

    <!-- Add Admin Button (Desktop) -->
    <button 
      @click="$emit('add')"
      class="hidden lg:flex px-6 h-11 bg-bejo-500 hover:bg-bejo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-bejo-500/20 transition-all items-center gap-2 active:scale-95 whitespace-nowrap"
    >
      <Icon icon="lucide:user-plus" class="size-4" />
      Tambah Admin
    </button>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'

const emit = defineEmits(['search', 'filterStatus', 'add'])
const searchQuery = ref('')
const status = ref('')

watch(searchQuery, (val) => emit('search', val))
watch(status, (val) => emit('filterStatus', val))
</script>
