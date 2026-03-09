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
  <client-only>
    <Customizer />
  </client-only>
</template>

<script setup lang="ts">
import Customizer from '@/layouts/components/customizer/index.vue'
import Footer from '@/layouts/components/footer/index.vue'
import MobileMenu from '@/layouts/components/mobile-menu/index.vue'
import SideNav from '@/layouts/components/sidenav/index.vue'
import Topbar from '@/layouts/components/topbar/index.vue'
import { onMounted, onUnmounted } from 'vue'
import { useLayout } from '@/stores/layout'

const layoutStore = useLayout()
const { layout, setSideNavSize } = layoutStore

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
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
})
</script>
