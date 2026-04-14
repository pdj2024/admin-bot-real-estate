<script setup lang="ts">
import { ref, reactive, watch, onMounted, defineAsyncComponent } from 'vue'
import Vertical from '@/layouts/vertical.vue'
import { useLayout } from '@/stores/layout'
import { useSettings } from '@/stores/settings'
import { success } from '@/utils/sweet-alert'
import { Icon } from '@iconify/vue'
import { generateDynamicPalette } from '@/utils/theme'

// Lazy load tabs
const AppearanceTab = defineAsyncComponent(() => import('./tabs/AppearanceTab.vue'))
const BusinessTab = defineAsyncComponent(() => import('./tabs/BusinessTab.vue'))
const SecurityTab = defineAsyncComponent(() => import('./tabs/SecurityTab.vue'))
const SystemTab = defineAsyncComponent(() => import('./tabs/SystemTab.vue'))

export interface AppSettings {
  appName: string
  theme: 'light' | 'dark'
  colorPrimary: string
  colorSecondary: string
  sidenavSize: 'default' | 'hover' | 'hover-active' | 'sm' | 'md' | 'offcanvas' | 'hidden'
}

const { setSideNavSize, setTheme } = useLayout()
const settingsStore = useSettings()

const activeTab = ref('appearance')
const tabs = [
  { id: 'appearance', name: 'Tampilan', icon: 'lucide:monitor-smartphone', description: 'Atur tema, warna brand, dan tata letak sidebar.' },
  { id: 'business', name: 'Identitas Bisnis', icon: 'lucide:building-2', description: 'Kelola info perusahaan, kontak, dan media sosial.' },
  { id: 'system', name: 'Sistem', icon: 'lucide:settings-2', description: 'Kontrol global, mode perbaikan, dan status situs.' },
  { id: 'security', name: 'Keamanan', icon: 'lucide:shield-check', description: 'Perbarui kata sandi akses administrator.' }
]

const settings = reactive<AppSettings>({
  appName: 'Rumah Bejo',
  theme: 'light',
  colorPrimary: '#ea9455',
  colorSecondary: '#ca6d2c',
  sidenavSize: 'hover'
})

const STORAGE_KEY = 'app_local_settings'

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

  const dynamicPalette = generateDynamicPalette(config.colorPrimary)
  Object.entries(dynamicPalette).forEach(([shade, hexValue]) => {
    root.style.setProperty(`--color-bejo-${shade}`, hexValue as string)
    root.style.setProperty(`--text-bejo-${shade}`, hexValue as string)
  })
}

watch(settings, (newSettings) => {
  applyToDOM(newSettings)
}, { deep: true })

onMounted(() => {
  settingsStore.init()
  const storedData = localStorage.getItem(STORAGE_KEY)
  if (storedData) {
    Object.assign(settings, JSON.parse(storedData))
    applyToDOM(settings)
  }
})

const handleSaveAppearance = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  applyToDOM(settings)
  window.dispatchEvent(new Event('app-settings-changed'))
  success("Tampilan berhasil diperbarui")
}

const handleResetAppearance = () => {
  Object.assign(settings, {
    appName: 'Rumah Bejo',
    theme: 'light',
    colorPrimary: '#ea9455',
    colorSecondary: '#ca6d2c',
    sidenavSize: 'hover'
  })
  handleSaveAppearance()
}
</script>

<template>
  <Vertical>
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20 items-start">
      
      <!-- Left Sidebar Navigation -->
      <div class="lg:col-span-3 space-y-2">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-2">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-left group"
            :class="activeTab === tab.id ? 'bg-bejo-50 text-bejo-600' : 'text-slate-500 hover:bg-slate-50'"
          >
            <div class="size-10 rounded-xl flex items-center justify-center transition-all" :class="activeTab === tab.id ? 'bg-bejo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-bejo-100 group-hover:text-bejo-600'">
              <Icon :icon="tab.icon" class="size-5" />
            </div>
            <div class="flex-1">
              <span class="block text-sm font-black">{{ tab.name }}</span>
              <span class="block text-[10px] font-medium opacity-60 leading-tight" v-if="activeTab === tab.id">{{ tab.description }}</span>
            </div>
            <Icon v-if="activeTab === tab.id" icon="lucide:chevron-right" class="size-4 opacity-50" />
          </button>
        </div>

        <div class="p-4 bg-slate-900 rounded-2xl text-white relative overflow-hidden">
          <Icon icon="lucide:sparkles" class="absolute -right-4 -bottom-4 size-24 opacity-10 rotate-12" />
          <h5 class="text-xs font-black uppercase tracking-widest mb-2 text-bejo-400">Info Sistem</h5>
          <p class="text-[10px] text-slate-400 leading-relaxed font-medium">Banyak fitur baru akan hadir. Hubungi admin untuk permintaan fitur khusus.</p>
        </div>
      </div>

      <!-- Right Content Area -->
      <div class="lg:col-span-9">
        <Transition mode="out-in" enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-2">
          <div :key="activeTab">
            <AppearanceTab 
              v-if="activeTab === 'appearance'" 
              :settings="settings" 
              @save="handleSaveAppearance" 
              @reset="handleResetAppearance" 
            />
            <BusinessTab 
              v-else-if="activeTab === 'business'" 
            />
            <SecurityTab 
              v-else-if="activeTab === 'security'" 
            />
            <SystemTab 
              v-else-if="activeTab === 'system'" 
            />
          </div>
        </Transition>
      </div>

    </div>
  </Vertical>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
