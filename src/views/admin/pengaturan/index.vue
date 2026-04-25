<script setup lang="ts">
import { ref, reactive, watch, onMounted, defineAsyncComponent } from 'vue'
import Vertical from '@/layouts/vertical.vue'
import { useLayout } from '@/stores/layout'
import { useSettings } from '@/stores/settings'
import { success } from '@/utils/sweet-alert'
import { Icon } from '@iconify/vue'
import { generateDynamicPalette } from '@/utils/theme'
import { APP_LOCAL_SETTINGS_KEY } from '@/config/constants'

// Lazy load tabs
const AppearanceTab = defineAsyncComponent(() => import('./tabs/AppearanceTab.vue'))
const BusinessTab = defineAsyncComponent(() => import('./tabs/BusinessTab.vue'))
const SecurityTab = defineAsyncComponent(() => import('./tabs/SecurityTab.vue'))
const SystemTab = defineAsyncComponent(() => import('./tabs/SystemTab.vue'))

export interface AppSettings {
  appName: string
  colorPrimary: string
  colorSecondary: string
  sidenavSize: 'default' | 'hover' | 'hover-active' | 'sm' | 'md' | 'offcanvas' | 'hidden'
  theme: 'light' | 'dark'
}

const { setSideNavSize } = useLayout()
const settingsStore = useSettings()

const activeTab = ref('appearance')
const tabs = [
  { id: 'appearance', name: 'Tampilan', icon: 'lucide:monitor-smartphone', description: 'Atur tema, warna brand, dan tata letak sidebar.' },
  { id: 'business', name: 'Profil Perusahaan', icon: 'lucide:building-2', description: 'Kelola identitas, kontak resmi, dan info operasional.' },
  { id: 'system', name: 'Sistem', icon: 'lucide:settings-2', description: 'Kontrol global, mode perbaikan, dan status situs.' },
  { id: 'security', name: 'Keamanan', icon: 'lucide:shield-check', description: 'Perbarui kata sandi akses administrator.' }
]

const settings = reactive<AppSettings>({
  appName: 'Rumah Bejo',
  colorPrimary: '#ea9455',
  colorSecondary: '#ca6d2c',
  sidenavSize: 'hover',
  theme: 'light'
})

// Settings persistence logic

const applyToDOM = (config: AppSettings) => {
  const root = document.documentElement
  setSideNavSize(config.sidenavSize)
  root.setAttribute('data-sidenav-size', config.sidenavSize)

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
  // Instant sync for appName
  settingsStore.business.appName = newSettings.appName
  applyToDOM(newSettings)
}, { deep: true })

onMounted(() => {
  settingsStore.init()
  const storedData = localStorage.getItem(APP_LOCAL_SETTINGS_KEY)
  if (storedData) {
    Object.assign(settings, JSON.parse(storedData))
    applyToDOM(settings)
  }
})

const handleUpdateAppearance = (newData: AppSettings) => {
  Object.assign(settings, newData)
  // applyToDOM will be triggered by the watch(settings)
}

const handleSaveAppearance = (newData?: AppSettings) => {
  if (newData) {
    Object.assign(settings, newData)
  }

  // Sync with global store
  settingsStore.business.appName = settings.appName
  settingsStore.saveBusiness()

  localStorage.setItem(APP_LOCAL_SETTINGS_KEY, JSON.stringify(settings))
  applyToDOM(settings)
  window.dispatchEvent(new Event('app-settings-changed'))
  success("Tampilan berhasil diperbarui")
}

const handleResetAppearance = () => {
  Object.assign(settings, {
    appName: 'Rumah Bejo',
    colorPrimary: '#ea9455',
    colorSecondary: '#ca6d2c',
    sidenavSize: 'hover',
    theme: 'light'
  })
  handleSaveAppearance()
}
</script>

<template>
  <Vertical>
    <div class="p-0 md:p-3 md:pt-1 pb-32">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
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

        <div class="p-4 bg-gradient-to-br from-bejo-50 to-white rounded-2xl text-slate-900 relative overflow-hidden border border-bejo-100 shadow-sm group">
          <Icon icon="lucide:sparkles" class="absolute -right-4 -bottom-4 size-24 text-bejo-600/10 rotate-12 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-0" />
          <div class="relative z-10">
            <div class="flex items-center gap-2 mb-3">
              <div class="size-6 bg-bejo-600 rounded-lg flex items-center justify-center">
                <Icon icon="lucide:sparkles" class="size-3 text-white" />
              </div>
              <h5 class="text-[10px] font-black uppercase tracking-[0.2em] text-bejo-600">Info Sistem</h5>
            </div>
            <p class="text-[10px] text-slate-500 leading-relaxed font-bold">Banyak fitur baru akan hadir. Hubungi admin untuk permintaan fitur khusus.</p>
          </div>
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
              @update="handleUpdateAppearance"
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
