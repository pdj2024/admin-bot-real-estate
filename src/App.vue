<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useLayout } from './stores/layout'

const { init } = useLayout()

onMounted(() => {
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
  init()
})
</script>
