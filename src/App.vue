<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLayout } from './stores/layout'
import { useSettings } from './stores/settings'
import { logout } from './services/auth'
import { applyToDOM } from '@/utils/theme'

const { init: initLayout, setSideNavSize } = useLayout()
const settingsStore = useSettings()
const router = useRouter()
const route = useRoute()

const initTheme = () => {
  const storedData = localStorage.getItem('app_local_settings')
  if (storedData) {
    const config = JSON.parse(storedData)
    applyToDOM(config)
    if (config.sidenavSize) {
      setSideNavSize(config.sidenavSize)
    }
  }
}

const checkMaintenanceRedirect = (isMaintenance: boolean) => {
  // Admin routes (requiresAuth) are always accessible — skip entirely.
  // The router guard handles auth for those pages independently.
  if (route.meta.requiresAuth === true) return

  if (isMaintenance) {
    // Only redirect public guest pages to maintenance.
    const isMaintenancePage = route.name === 'Maintenance'
    const isLoginPage = route.name === 'Login'
    if (!isMaintenancePage && !isLoginPage) {
      router.push({ name: 'Maintenance' })
    }
  } else {
    // Maintenance OFF: send user away from maintenance page
    if (route.name === 'Maintenance') {
      router.push({ name: 'Beranda' })
    }
  }
}

// Watch for internal store changes (same tab)
watch(() => settingsStore.app.isMaintenance, (val) => {
  checkMaintenanceRedirect(val)
})

onMounted(() => {
  settingsStore.init()
  initLayout()
  initTheme()

  // Listen for internal app settings changes
  window.addEventListener('app-settings-changed', initTheme)

  // Listen for storage changes (cross-tab)
  window.addEventListener('storage', (event) => {
    if (event.key === 'app_global_status') {
      settingsStore.init() // Refresh store from localStorage
    }

    if (event.key === 'app_local_settings') {
      initTheme()
    }
    
    // Multi-tab logout sync: only redirect if we are on an authenticated route
    if (event.key === 'token' && event.newValue === null && route.meta.requiresAuth) {
      logout(false)
    }
  })
})
</script>
