<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps<{
  openTukarCS: boolean
  searchCS: string
  isFetchingAdmins: boolean
  filteredAdmins: any[]
}>()

const emit = defineEmits<{
  (e: 'update:searchCS', val: string): void
  (e: 'close'): void
  (e: 'transfer', admin: any): void
}>()
</script>

<template>
  <div v-show="openTukarCS" class="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-8">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="emit('close')" />

    <div class="relative w-full max-w-[390px] bg-white/95 backdrop-blur-md rounded-[2rem] shadow-2xl p-6 border border-slate-50 animate-fade-in-up">
      <div class="flex items-center justify-between mb-6 px-2">
        <h4 class="text-slate-900 font-extrabold text-lg tracking-tight">Alihkan ke CS Lain</h4>
        <button @click.stop="emit('close')" class="size-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 transition-all">
          <Icon icon="lucide:x" class="size-5" />
        </button>
      </div>
      <div class="relative mb-5 group">
        <Icon icon="lucide:search" class="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-bejo-500 transition-colors" />
        <input :value="searchCS" @input="emit('update:searchCS', ($event.target as HTMLInputElement).value)" type="text" placeholder="Cari nama CS..." class="w-full bg-slate-50 border-transparent rounded-2xl py-3 pl-11 pr-4 text-sm font-bold focus:bg-white focus:ring-8 focus:ring-bejo-500/5 focus:border-bejo-500 transition-all shadow-inner" />
      </div>
      <div class="max-h-72 overflow-y-auto custom-scrollbar space-y-2 pr-1 min-h-[100px] relative">
        <div v-if="isFetchingAdmins" class="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
          <Icon icon="lucide:loader-2" class="size-8 text-bejo-500 animate-spin" />
        </div>

        <div v-for="admin in filteredAdmins" :key="admin.No_Id" @click="emit('transfer', admin)" class="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-100 group">
          <div class="flex items-center gap-3">
            <div class="size-9 rounded-xl bg-gradient-to-br from-bejo-50 to-bejo-100 flex items-center justify-center text-bejo-600 font-black text-xs">
              {{ admin.Nama_User.substring(0, 2).toUpperCase() }}
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-bold text-slate-700">{{ admin.Nama_User }}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ admin.Role }}</span>
            </div>
          </div>
          <button class="flex items-center justify-center bg-white border border-slate-200 text-slate-400 size-9 rounded-xl shadow-sm group-hover:bg-bejo-500 group-hover:text-white group-hover:border-bejo-500 transition-all active:scale-90">
            <Icon icon="lucide:check" class="size-4" />
          </button>
        </div>

        <div v-if="filteredAdmins && filteredAdmins.length === 0 && !isFetchingAdmins" class="flex flex-col items-center justify-center py-8 gap-2 text-slate-400">
          <Icon icon="lucide:moon" class="size-8 text-slate-300" />
          <p class="text-xs font-bold text-slate-400 text-center">Tidak ada CS yang sedang bertugas saat ini</p>
          <p class="text-[10px] text-slate-300 font-medium text-center">Silakan coba lagi di jam kerja</p>
        </div>
      </div>
    </div>
  </div>
</template>
