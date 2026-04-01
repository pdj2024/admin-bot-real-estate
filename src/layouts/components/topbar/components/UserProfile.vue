<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { RouterLink, useRouter } from 'vue-router'
import { logout } from '@/services/auth'
import { confirm, success } from '@/utils/sweet-alert'

const router = useRouter()

const namaDisplay = ref(localStorage.getItem('nama_display') || '');
const roleUser = ref(localStorage.getItem('role_user') || '');

const handleLogout = () => {
  confirm('Apakah Anda ingin keluar?', () => {
    logout(true)
  })
}
</script>

<template>
  <div class="topbar-item hs-dropdown relative inline-flex">
    <button class="cursor-pointer flex items-center justify-center text-sm font-semibold rounded-full size-10 bg-default-200" aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown">
      <!-- <img :src="avatar1" alt="user-image" class="hs-dropdown-toggle rounded-full size-9.5" /> -->
      <Icon icon="lucide:headset" class="size-7 rounded flex items-center text-default-500"></Icon>
    </button>
    <div class="hs-dropdown-menu min-w-48" role="menu" aria-orientation="vertical" aria-labelledby="hs-dropdown-with-icons">
      <div class="p-2">
        <h6 class="mb-2 text-default-500">Hai, Selamat Datang</h6>
        <RouterLink to="" class="flex gap-3">
          <div class="relative inline-block">
            <RouterLink to="" class="flex items-center justify-center text-sm font-semibold rounded-full size-10 bg-default-200">
              <!-- <img :src="avatar1" alt="" class="size-12 rounded" /> -->
              <Icon icon="lucide:headset" class="size-7 rounded flex items-center text-default-500"></Icon>
            </RouterLink>
            <span class="-top-1 -end-1 absolute w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h6 class="mb-1 text-sm font-semibold text-default-800">{{ namaDisplay }}</h6>
            <p class="text-default-500">{{ roleUser }}</p>
          </div>
        </RouterLink>
      </div>
      <div class="border-t border-t-default-200 -mx-2 my-2"></div>
      <div class="flex flex-col gap-y-1">
        <RouterLink @click="handleLogout()" class="flex items-center gap-x-3.5 py-1.5 font-medium px-3 text-default-600 hover:bg-default-150 rounded" to="">
          <Icon icon="lucide:log-out" class="size-4"></Icon>
          Keluar
        </RouterLink>
      </div>
    </div>
  </div>
</template>
