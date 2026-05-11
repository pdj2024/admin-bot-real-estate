<template>
  <aside id="app-menu" class="app-menu">
    <RouterLink to="/dashboard" class="logo-box sticky top-0 flex min-h-topbar-height items-center justify-center w-full backdrop-blur-xs">
      <div class="flex items-center gap-2.5 overflow-hidden">
        <img :src="settingsStore.business.Logo || logo" class="h-7 w-auto shrink-0" alt="Logo Icon" />
        <span class="logo-lg font-bold text-[14px] text-gray-800 truncate transition-colors duration-300">
          {{ settingsStore.business.appName }}
        </span>
      </div>
    </RouterLink>

    <!-- <div class="absolute top-0 end-5 flex h-topbar items-center justify">
      <button id="button-hover-toggle" type="button" @click="toggleSidebar">
        <Icon icon="tabler:circle" class="iconify size-5 pointer-events-none" />
      </button>
    </div> -->

    <div class="relative min-h-0 flex-grow">
      <simplebar class="size-full" data-simplebar>
        <AppMenu />
      </simplebar>
    </div>
  </aside>
</template>

<script setup lang="ts">
import logo from '@/assets/images/logo-sm.png'
import { useSettings } from '@/stores/settings'
import AppMenu from './components/AppMenu.vue'
import simplebar from 'simplebar-vue'

const settingsStore = useSettings()

// settingsStore.init() removed to prevent redundant API calls and UI resets during live preview
</script>
