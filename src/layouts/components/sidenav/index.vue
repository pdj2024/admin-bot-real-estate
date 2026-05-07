<template>
  <aside id="app-menu" class="app-menu">
    <RouterLink to="/dashboard" class="logo-box sticky top-0 flex min-h-topbar-height items-center justify-start ps-5 pe-4 backdrop-blur-xs">
      <div class="flex items-center gap-2.5 w-full overflow-hidden">
        <img :src="settingsStore.business.Logo || logo" class="h-7 w-auto shrink-0" alt="Logo Icon" />
        <span class="font-bold text-[14px] text-gray-800 truncate transition-colors duration-300">
          {{ settingsStore.business.appName }}
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
import { onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import logo from '@/assets/images/logo-sm.png'
import { useLayout } from '@/stores/layout'
import { useSettings } from '@/stores/settings'
import AppMenu from './components/AppMenu.vue'
import simplebar from 'simplebar-vue'
import { APP_LOCAL_SETTINGS_KEY } from '@/config/constants'

const { layout, setSideNavSize } = useLayout()
const settingsStore = useSettings()

onMounted(() => {
  settingsStore.init()
})

const toggleSidebar = () => {
  if (window.innerWidth <= 576) return

  const newSize = layout.sidenav.size === 'hover-active' ? 'hover' : 'hover-active'
  setSideNavSize(newSize)

  const storedData = localStorage.getItem(APP_LOCAL_SETTINGS_KEY)
  if (storedData) {
    const config = JSON.parse(storedData)
    config.sidenavSize = newSize
    localStorage.setItem(APP_LOCAL_SETTINGS_KEY, JSON.stringify(config))
    window.dispatchEvent(new Event('app-settings-changed'))
  }
}
</script>
