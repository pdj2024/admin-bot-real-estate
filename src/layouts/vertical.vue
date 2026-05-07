<template>
  <div class="wrapper">
    <div v-if="layout.isMobileMenuOpen" class="fixed inset-0 bg-gray-900/50 z-40 transition-opacity duration-300 cursor-pointer" @click="layoutStore.closeAllMenus"></div>

    <MobileMenu v-if="layout.sidenav.size === 'offcanvas'" :key="'mobile-' + layout.sidenav.size" />

    <SideNav v-else-if="layout.sidenav.size !== 'hidden'" :key="'desktop-' + layout.sidenav.size" />

    <div class="page-content">
      <Topbar />
      <main :class="mainClass">
        <slot />
      </main>
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useLayout } from '@/stores/layout'
import { useSettings } from '@/stores/settings'
import { storeToRefs } from 'pinia'
import Footer from '@/layouts/components/footer/index.vue'
import MobileMenu from '@/layouts/components/mobile-menu/index.vue'
import SideNav from '@/layouts/components/sidenav/index.vue'
import Topbar from '@/layouts/components/topbar/index.vue'

import { APP_LOCAL_SETTINGS_KEY } from '@/config/constants'

defineProps<{ mainClass?: string }>()

const layoutStore = useLayout()
const settingsStore = useSettings()
const { layout } = storeToRefs(layoutStore)
const { setSideNavSize } = layoutStore

const resize = () => {
  if (window.innerWidth <= 768) {
    setSideNavSize('offcanvas')
  } else {
    const storedData = localStorage.getItem(APP_LOCAL_SETTINGS_KEY)
    if (storedData) {
      const config = JSON.parse(storedData)
      if (config.sidenavSize) {
        setSideNavSize(config.sidenavSize)
      }
    } else {
      setSideNavSize(layout.value.sidenav.size)
    }
  }
}

onMounted(() => {
  layoutStore.init()
  settingsStore.init()
  setTimeout(() => {
    resize()
  }, 100)

  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
})
</script>
