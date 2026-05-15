<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted, computed } from 'vue'
import Vertical from '@/layouts/vertical.vue'
import { useLayout } from '@/stores/layout'
import { useSettings } from '@/stores/settings'
import { success } from '@/utils/sweet-alert'
import { Icon } from '@iconify/vue'
import { generateDynamicPalette } from '@/utils/theme'
import { APP_LOCAL_SETTINGS_KEY } from '@/config/constants'

import AppearanceTab from './tabs/AppearanceTab.vue'
import BusinessTab from './tabs/BusinessTab.vue'
import AccountTab from './tabs/AccountTab.vue'
import SystemTab from './tabs/SystemTab.vue'
import FaqTab from './tabs/FaqTab.vue'
import BotTab from './tabs/BotTab.vue'

export interface AppSettings {
  colorPrimary: string
  colorSecondary: string
  sidenavSize: 'default' | 'hover' | 'hover-active' | 'sm' | 'md' | 'offcanvas' | 'hidden'
}

const { setSideNavSize } = useLayout()
const settingsStore = useSettings()

const activeTab = ref(localStorage.getItem('settings_active_tab') || 'appearance')
const isDirty = ref(false)

watch(activeTab, (newTab) => {
  localStorage.setItem('settings_active_tab', newTab)
})

const activeComponent = computed(() => {
  switch (activeTab.value) {
    case 'appearance': return AppearanceTab
    case 'business': return BusinessTab
    case 'account': return AccountTab
    case 'system': return SystemTab
    case 'faq': return FaqTab
    case 'bot': return BotTab
    default: return AppearanceTab
  }
})

const tabs = [
  { id: 'appearance', name: 'Tampilan', icon: 'lucide:monitor-smartphone', description: 'Atur tema, warna brand, dan tata letak sidebar.' },
  { id: 'business', name: 'Profil Perusahaan', icon: 'lucide:building-2', description: 'Kelola identitas, kontak resmi, dan info operasional.' },
  { id: 'bot', name: 'AI Bot Setting', icon: 'lucide:bot', description: 'Atur instruksi, gaya bahasa, dan logika cerdas bot.' },
  { id: 'faq', name: 'Manajemen FAQ', icon: 'lucide:help-circle', description: 'Kelola pertanyaan dan jawaban bantuan pelanggan.' },
  { id: 'system', name: 'Sistem', icon: 'lucide:settings-2', description: 'Kontrol global, mode perbaikan, dan status situs.' },
  { id: 'account', name: 'Akun', icon: 'lucide:user-cog', description: 'Kelola profil admin dan kata sandi akses.' }
]

const settings = reactive<AppSettings>({
  colorPrimary: settingsStore.theme.primaryColor,
  colorSecondary: settingsStore.theme.secondaryColor,
  sidenavSize: settingsStore.theme.sidebarType as any
})

// Sync local settings when global store updates (ONLY if user hasn't started editing)
watch(() => settingsStore.theme, (newTheme) => {
  if (isDirty.value) return
  
  settings.colorPrimary = newTheme.primaryColor
  settings.colorSecondary = newTheme.secondaryColor
  settings.sidenavSize = newTheme.sidebarType as any
}, { deep: true })



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

  const dynamicPalette = generateDynamicPalette(config.colorPrimary, config.colorSecondary)
  Object.entries(dynamicPalette).forEach(([shade, hexValue]) => {
    root.style.setProperty(`--color-bejo-${shade}`, hexValue as string)
    root.style.setProperty(`--text-bejo-${shade}`, hexValue as string)
  })
}

watch(settings, (newSettings) => {
  applyToDOM(newSettings)
}, { deep: true })

const handleForceTab = () => {
  const newTab = localStorage.getItem('settings_active_tab') || 'appearance'
  if (activeTab.value !== newTab) {
    activeTab.value = newTab
  }
}

onMounted(async () => {
  window.addEventListener('force-settings-tab', handleForceTab)
  
  await settingsStore.init()
  
  // Auto-migrate old colors to new vibrant orange
  const oldColor = '#CA6D2C'
  const newColor = '#EB701F'
  
  if (settingsStore.theme.secondaryColor === oldColor) {
    settingsStore.theme.secondaryColor = newColor
  }
  if (settingsStore.theme.primaryColor === '#EA8455' || settingsStore.theme.primaryColor === oldColor) {
     settingsStore.theme.primaryColor = newColor
  }

  // Refresh settings from store
  settings.colorPrimary = settingsStore.theme.primaryColor
  settings.colorSecondary = settingsStore.theme.secondaryColor
  settings.sidenavSize = settingsStore.theme.sidebarType as any
  
  applyToDOM(settings)
})

onUnmounted(() => {
  window.removeEventListener('force-settings-tab', handleForceTab)
})

const handleUpdateAppearance = (newData: AppSettings) => {
  isDirty.value = true
  Object.assign(settings, newData)
  applyToDOM(settings)
}

const handleSaveAppearance = async (newData?: AppSettings) => {
  if (newData) {
    Object.assign(settings, newData)
  }

  // Sync with global store
  settingsStore.theme.primaryColor = settings.colorPrimary
  settingsStore.theme.secondaryColor = settings.colorSecondary
  settingsStore.theme.sidebarType = settings.sidenavSize
  
  settingsStore.saveBusiness()
  settingsStore.saveTheme()

  // Sync with API
  await settingsStore.updateDefaultSettings({
    Sidebar_Type: settings.sidenavSize,
    Primary_Color: settings.colorPrimary,
    Secondary_Color: settings.colorSecondary
  })

  localStorage.setItem(APP_LOCAL_SETTINGS_KEY, JSON.stringify(settings))
  applyToDOM(settings)
  window.dispatchEvent(new Event('app-settings-changed'))
  isDirty.value = false
  success("Tampilan berhasil diperbarui")
}

const handleResetAppearance = async () => {
  const defaults = {
    colorPrimary: '#EF8C4C',
    colorSecondary: '#EB701F',
    sidenavSize: 'hover' as const
  }
  Object.assign(settings, defaults)
  await handleSaveAppearance()
}
</script>

<template>
  <Vertical>
    <div class="p-0 md:p-3 md:pt-1 pb-32">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Left Sidebar Navigation (Sticky) -->
      <div class="lg:col-span-3 space-y-2 lg:sticky lg:top-24 self-start">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-2">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left group mb-1 last:mb-0"
            :class="activeTab === tab.id ? 'text-white shadow-lg shadow-bejo-500/20' : 'text-slate-500 hover:bg-slate-50'"
            :style="activeTab === tab.id ? { background: 'var(--background-image-primary-gradient)' } : {}"
          >
            <div class="size-10 rounded-xl flex items-center justify-center transition-all shrink-0" :class="activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-bejo-100 group-hover:text-bejo-600'">
              <Icon :icon="tab.icon" class="size-5" />
            </div>
            <div class="flex-1 min-w-0">
              <span class="block text-[13px] font-black leading-tight">{{ tab.name }}</span>
              <span class="block text-[10px] font-bold opacity-60 leading-tight mt-0.5 truncate" v-if="activeTab === tab.id">{{ tab.description }}</span>
            </div>
            <Icon v-if="activeTab === tab.id" icon="lucide:chevron-right" class="size-3.5 opacity-40 shrink-0" />
          </button>
        </div>

        <div class="p-4 bg-gradient-to-br from-bejo-50 to-white rounded-2xl text-slate-900 relative overflow-hidden border border-bejo-100 shadow-sm group">
          <Icon icon="lucide:sparkles" class="absolute -right-4 -bottom-4 size-24 text-bejo-600/10 rotate-12 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-0" />
          <div class="relative z-10">
            <div class="flex items-center gap-2 mb-2">
              <div class="size-5 bg-bejo-600 rounded-lg flex items-center justify-center">
                <Icon icon="lucide:sparkles" class="size-2.5 text-white" />
              </div>
              <h5 class="text-[9px] font-black uppercase tracking-[0.2em] text-bejo-600">Info Sistem</h5>
            </div>
            <p class="text-[10px] text-slate-500 leading-relaxed font-bold">Banyak fitur baru akan hadir segera.</p>
          </div>
        </div>
      </div>

      <!-- Right Content Area -->
      <div class="lg:col-span-9">
        <Transition mode="out-in" enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-2">
          <component 
            :is="activeComponent" 
            :key="activeTab"
            :settings="settings"
            @save="handleSaveAppearance"
            @reset="handleResetAppearance"
            @update="handleUpdateAppearance"
          />
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
