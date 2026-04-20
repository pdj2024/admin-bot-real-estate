<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import PageTitle from '@/components/PageTitle.vue'
import Vertical from '@/layouts/vertical.vue'
import SettingsForm from './components/SettingsForm.vue'
import SettingsPreview from './components/SettingsPreview.vue'
import { useLayout } from '@/stores/layout'
import { success } from '@/utils/sweet-alert'
const { setTheme } = useLayout()

export interface AppSettings {
  appName: string
  theme: 'light' | 'dark'
  colorPrimary: string
  colorSecondary: string
  sidenavSize: 'default' | 'hover' | 'hover-active' | 'sm' | 'md' | 'offcanvas'
}

const settings = reactive<AppSettings>({
  appName: 'Rumah Bejo',
  theme: 'light',
  colorPrimary: '#ea9455',
  colorSecondary: '#ca6d2c',
  sidenavSize: 'default'
})

const isSaved = ref(false)
const STORAGE_KEY = 'app_local_settings'

const { setSideNavSize } = useLayout()

const applyToDOM = (config: AppSettings) => {
  const root = document.documentElement

  setSideNavSize(config.sidenavSize)

  root.setAttribute('data-sidenav-size', config.sidenavSize)

  if (config.theme === 'dark') {
    root.setAttribute('data-theme', 'dark')
    root.classList.add('dark')
    setTheme('dark')
  } else {
    root.setAttribute('data-theme', 'light')
    root.classList.remove('dark')
    setTheme('light')
  }

  root.style.setProperty('--color-primary', config.colorPrimary)
  root.style.setProperty('--color-secondary', config.colorSecondary)
  root.style.setProperty(
    '--background-image-primary-gradient',
    `linear-gradient(135deg, ${config.colorPrimary} 0%, ${config.colorSecondary} 100%)`
  )
}

onMounted(() => {
  const storedData = localStorage.getItem(STORAGE_KEY)
  if (storedData) {
    Object.assign(settings, JSON.parse(storedData))
    applyToDOM(settings)
  }
})

const handleSave = (reset: boolean) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  applyToDOM(settings)
  window.dispatchEvent(new Event('app-settings-changed'))

  success(reset == false ? "Update tampilan berhasil" : "Reset tampilan berhasil")
}

const handleReset = () => {
  Object.assign(settings, {
    appName: 'Rumah Bejo',
    theme: 'light',
    colorPrimary: '#ea9455',
    colorSecondary: '#ca6d2c',
    sidenavSize: 'hover'
  })
  handleSave(true)
}
</script>

<template>
  <Vertical>
    <PageTitle subtitle="Kelola" title="Pengaturan Tampilan" />

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10">
      <div class="lg:col-span-7">
        <SettingsForm
          :settings="settings"
          :isSaved="isSaved"
          @save="handleSave(false)"
          @reset="handleReset"
        />
      </div>
      <div class="lg:col-span-5">
        <SettingsPreview :settings="settings" />
      </div>
    </div>
  </Vertical>
</template>
