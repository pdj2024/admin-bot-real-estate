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
  if (route.meta.requiresAuth === true) return

  // Authenticated users (Admins) can also view guest pages during maintenance.
  const token = localStorage.getItem('token')
  const hasToken = !!token && token !== 'undefined'
  
  if (hasToken) {
    // If logged in admin is somehow on maintenance page, send to Beranda
    if (route.name === 'Maintenance') {
      router.push({ name: 'Beranda' })
    }
    return
  }

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

// Dynamic Browser Title & Favicon
watch([() => settingsStore.business.appName, () => route.path], ([newName]) => {
  const pageTitle = route.meta.title ? `${route.meta.title} | ` : ''
  const appName = newName || 'Rumah Rejeki'
  document.title = `${pageTitle}${appName}`
}, { immediate: true })

watch(() => settingsStore.business.Logo_Company, (newLogo) => {
  const link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link')
  link.type = 'image/x-icon'
  link.rel = 'icon'
  link.href = newLogo || '/favicon.ico'
  document.getElementsByTagName('head')[0].appendChild(link)
}, { immediate: true })

// Global Sync: Fetch latest settings on every route change as requested
watch(() => route.path, async () => {
  await settingsStore.init()
})

onMounted(async () => {
  await settingsStore.init()
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
