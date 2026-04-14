<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLayout } from './stores/layout'
import { useSettings } from './stores/settings'

const { init: initLayout } = useLayout()
const settingsStore = useSettings()
const router = useRouter()
const route = useRoute()

const checkMaintenanceRedirect = (isMaintenance: boolean) => {
  if (isMaintenance) {
    // If maintenance ON: redirect guest pages to /maintenance
    const isMaintenancePage = route.name === 'Maintenance'
    const isLoginPage = route.name === 'Login'
    const isAdminRoute = route.meta.requiresAuth === true

    if (!isMaintenancePage && !isLoginPage && !isAdminRoute) {
      router.push({ name: 'Maintenance' })
    }
  } else {
    // If maintenance OFF: if current on maintenance page, redirect home
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

  // Listen for storage changes (cross-tab)
  window.addEventListener('storage', (event) => {
    if (event.key === 'app_global_status') {
      settingsStore.init() // Refresh store from localStorage
    }
  })

  const storedData = localStorage.getItem('app_local_settings')
  if (storedData) {
    const config = JSON.parse(storedData)
    const root = document.documentElement

    if (config.theme === 'dark') {
      root.setAttribute('data-theme', 'dark')
      root.classList.add('dark')
    }

    root.setAttribute('data-sidenav-size', config.sidenavSize)
    root.style.setProperty('--color-primary', config.colorPrimary)
    root.style.setProperty('--color-secondary', config.colorSecondary)
    root.style.setProperty(
      '--background-image-primary-gradient',
      `linear-gradient(135deg, ${config.colorPrimary} 0%, ${config.colorSecondary} 100%)`
    )
  }
})
</script>
