<template>
  <aside id="app-menu" class="app-menu">
    <RouterLink to="/dashboard" class="logo-box sticky top-0 flex min-h-topbar-height items-center justify-start ps-5 pe-4 backdrop-blur-xs">
      <div class="flex items-center gap-2.5 w-full overflow-hidden">
        <img :src="logo" class="h-7 w-auto shrink-0" alt="Logo Icon" />
        <span class="font-bold text-[14px] text-gray-800 truncate transition-colors duration-300">
          {{ appName }}
        </span>
      </div>
    </RouterLink>

    <div class="absolute top-0 end-5 flex h-topbar items-center justify">
      <button id="button-hover-toggle" type="button" @click="toggleSidebar">
        <Icon icon="tabler:circle" class="iconify size-5 pointer-events-none" />
      </button>
    </div>

    <div class="relative min-h-0 flex-grow">
      <simplebar class="size-full" data-simplebar>
        <AppMenu />
      </simplebar>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import logo from '@/assets/images/logo-sm.png'
import { useLayout } from '@/stores/layout'
import AppMenu from './components/AppMenu.vue'
import simplebar from 'simplebar-vue'
import { RouterLink } from 'vue-router'

const { layout, setSideNavSize } = useLayout()
const appName = ref('Rumah Bejo')
const STORAGE_KEY = 'app_local_settings'


const loadAppName = () => {
  const storedData = localStorage.getItem(STORAGE_KEY)
  if (storedData) {
    const config = JSON.parse(storedData)
    if (config.appName) {
      appName.value = config.appName
    }
  }
}

watch(() => layout.sidenav.size, (newSize) => {
  console.log('Size berubah, menjalankan loadAppName...');
  loadAppName();
});

onMounted(() => {
  loadAppName()
  window.addEventListener('app-settings-changed', loadAppName)
})

onUnmounted(() => {
  window.removeEventListener('app-settings-changed', loadAppName)
})

const toggleSidebar = () => {
  if (window.innerWidth <= 576) return

  const newSize = layout.sidenav.size === 'hover-active' ? 'hover' : 'hover-active'
  setSideNavSize(newSize)

  const storedData = localStorage.getItem(STORAGE_KEY)
  if (storedData) {
    const config = JSON.parse(storedData)
    config.sidenavSize = newSize
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    window.dispatchEvent(new Event('app-settings-changed'))
  }
}
</script>
