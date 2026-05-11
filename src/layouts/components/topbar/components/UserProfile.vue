<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { RouterLink } from 'vue-router'
import { logout } from '@/services/auth'
import { confirm } from '@/utils/sweet-alert'

const namaDisplay = ref(localStorage.getItem('nama_display') || '');
const noId = ref(localStorage.getItem('no_id') || '');

const handleLogout = () => {
  confirm('Apakah Anda ingin keluar?', () => {
    logout(true)
  })
}
</script>

<template>
  <div class="topbar-item hs-dropdown relative inline-flex [--placement:bottom-right]">
    <button id="hs-dropdown-with-icons" type="button" class="hs-dropdown-toggle flex items-center gap-3 px-2 py-1.5 rounded-full hover:bg-default-100 transition-all group">
      <div class="size-9 rounded-full bg-bejo-500 flex items-center justify-center text-white ring-2 ring-white shadow-sm group-hover:scale-105 transition-transform">
        <Icon icon="lucide:headset" class="size-5" />
      </div>
      <div class="hidden md:flex flex-col items-start leading-none text-left">
        <span class="text-xs font-black text-default-900">{{ namaDisplay }}</span>
        <span class="text-[10px] font-bold text-default-400 mt-0.5 uppercase tracking-tighter">Administrator</span>
      </div>
      <Icon icon="lucide:chevron-down" class="size-4 text-default-400 group-hover:text-default-900 transition-colors ml-1" />
    </button>

    <div class="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-64 bg-white shadow-2xl rounded-2xl p-2 border border-default-100 mt-2 z-[1000] overflow-hidden" aria-labelledby="hs-dropdown-with-icons">
      <!-- Profile Header -->
      <div class="px-4 py-4 mb-2 bg-bejo-50/50 rounded-xl border border-bejo-100/50">
        <p class="text-[10px] font-black text-bejo-600 uppercase tracking-widest mb-3">Akun Administrator</p>
        <div class="flex items-center gap-3">
          <div class="relative">
            <div class="size-12 rounded-xl bg-bejo-500 flex items-center justify-center text-white shadow-lg shadow-bejo-500/20">
               <Icon icon="lucide:headset" class="size-6" />
            </div>
            <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div class="overflow-hidden">
            <h6 class="text-sm font-black text-default-900 truncate">{{ namaDisplay }}</h6>
            <p class="text-[10px] font-bold text-default-400 uppercase tracking-tight">{{ noId }}</p>
          </div>
        </div>
      </div>
      
      <!-- Menu Items -->
      <div class="space-y-1">
        <RouterLink to="/pengaturan" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-default-600 hover:bg-bejo-50 hover:text-bejo-600 transition-all group">
          <div class="size-8 rounded-lg bg-default-50 flex items-center justify-center group-hover:bg-bejo-100 transition-colors">
            <Icon icon="lucide:user-cog" class="size-4" />
          </div>
          Pengaturan Akun
        </RouterLink>

        <div class="h-px bg-default-100 mx-2 my-1"></div>

        <button @click="handleLogout" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all group">
          <div class="size-8 rounded-lg bg-red-50 flex items-center justify-center transition-colors">
            <Icon icon="lucide:log-out" class="size-4" />
          </div>
          Keluar
        </button>
      </div>
    </div>
  </div>
</template>
