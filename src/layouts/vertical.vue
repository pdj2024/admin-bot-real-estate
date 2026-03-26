<template>
  <div class="wrapper">
    <MobileMenu v-if="layout.sidenav.size === 'offcanvas'" />
    <SideNav v-else-if="layout.sidenav.size !== 'hidden'" />
    <div class="page-content">
      <Topbar />
      <main :class="mainClass">
        <slot />
      </main>
      <Footer />
    </div>
  </div>

  <Customizer />
</template>

<script setup lang="ts">
import Customizer from '@/layouts/components/customizer/index.vue'
import Footer from '@/layouts/components/footer/index.vue'
import MobileMenu from '@/layouts/components/mobile-menu/index.vue'
import SideNav from '@/layouts/components/sidenav/index.vue'
import Topbar from '@/layouts/components/topbar/index.vue'
import { onMounted, onUnmounted } from 'vue'
import { useLayout } from '@/stores/layout'

// --- Import Logika Auth ---
import {
  startSilentRefresh,
  stopSilentRefresh,
  performRefresh,
  isTokenExpired,
  getToken
} from '@/services/auth'

defineProps<{ mainClass?: string }>()

const layoutStore = useLayout()
const { layout, setSideNavSize } = layoutStore

const handleAppFocus = async () => {
  const token = getToken()
  if (token && isTokenExpired(token)) {
    console.log("Mendeteksi aktivitas/fokus kembali, memperbarui token...")
    await performRefresh()
  }
}

const resize = () => {
  if (window.innerWidth <= 768) {
    setSideNavSize('offcanvas')
  } else {
    setSideNavSize('hover')
    layout.isMobileMenuOpen = false
    document.documentElement.classList.remove('sidenav-enable')
  }
}

onMounted(() => {
  layoutStore.init()
  resize()

  startSilentRefresh()

  window.addEventListener('resize', resize)

  window.addEventListener('focus', handleAppFocus)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      handleAppFocus()
    }
  })
})

onUnmounted(() => {
  stopSilentRefresh()

  window.removeEventListener('resize', resize)
  window.removeEventListener('focus', handleAppFocus)
})
</script>
