import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import api from '@/services/axios'
import { applyToDOM } from '@/utils/theme'

export interface BusinessSettings {
  appName: string
  description: string
  address: string
  phone: string
  whatsapp: string
  email: string
  instagram: string
  facebook: string
  twitter: string
  tiktok: string
  mapUrl: string
  Logo?: string
}

export interface BotSettings {
  isActive: boolean
}

const DEFAULT_BUSINESS: BusinessSettings = {
  appName: 'Rumah Bejo',
  description: 'Rumah Bejo adalah platform properti premium yang berkomitmen memberikan pengalaman transaksi hunian paling aman, transparan, dan profesional di Indonesia.',
  address: 'Jl. Asia Afrika No.123, SCBD, Jakarta Selatan 12190',
  phone: '6287700083370',
  whatsapp: '6287700083370',
  email: 'info@rumahbejo.com',
  instagram: 'https://www.instagram.com/rumahbejo99/',
  facebook: '#',
  twitter: '#',
  tiktok: '#',
  mapUrl: 'https://goo.gl/maps/example'
}

const DEFAULT_BOT: BotSettings = {
  isActive: true
}

export interface ThemeSettings {
  sidebarType: string
  primaryColor: string
  secondaryColor: string
}

const DEFAULT_THEME: ThemeSettings = {
  sidebarType: 'hover',
  primaryColor: '#EF8C4C',
  secondaryColor: '#EB701F'
}

export interface AppSettings {
  isMaintenance: boolean
}

const DEFAULT_APP: AppSettings = {
  isMaintenance: false
}

export const useSettings = defineStore('settings', () => {
  const business = reactive<BusinessSettings>({ ...DEFAULT_BUSINESS })
  const bot = reactive<BotSettings>({ ...DEFAULT_BOT })
  const app = reactive<AppSettings>({ ...DEFAULT_APP })
  const theme = reactive<ThemeSettings>({ ...DEFAULT_THEME })

  const isLoading = ref(false)

  const isInitialized = ref(false)

  const fetchBusinessSettings = async () => {
    try {
      isLoading.value = true
      const { data } = await api.get('/api/company/getAll', {
        params: { no_id: 'comp_0001' },
        headers: {
          'X-Jenis-User': 'Admin'
        }
      })

      if (data.StatusCode === 200 && data.Data.length > 0) {
        const profile = data.Data[0]
        business.appName = profile.Nama_Toko || business.appName
        business.description = profile.About || business.description
        business.address = profile.Alamat_Toko || business.address
        business.phone = profile.No_Telp || business.phone
        business.whatsapp = profile.No_Wa_1 || business.whatsapp
        business.email = profile.Email || business.email
        business.mapUrl = profile.Gmap || business.mapUrl

        Object.assign(business, profile)
        saveBusiness()
      }
    } catch (err) {
      console.error('Fetch global business settings error:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchDefaultSettings = async () => {
    try {
      const { data } = await api.get('/api/nilaiDefault/getAll?id_company=comp_0001', {
        params: { id_company: 'comp_0001' },
        headers: { 'X-Jenis-User': 'Admin' }
      })

      if (data.StatusCode === 200 && data.Data.length > 0) {
        const defaults = data.Data[0]
        app.isMaintenance = defaults.Is_Maintenance
        bot.isActive = defaults.Bot_Active
        theme.sidebarType = defaults.Sidebar_Type || theme.sidebarType
        theme.primaryColor = (defaults.Primary_Color || theme.primaryColor).toUpperCase()
        theme.secondaryColor = (defaults.Secondary_Color || theme.secondaryColor).toUpperCase()

        saveApp()
        saveBot()
        saveTheme()

        // Apply colors and sidebar size from API
        applyToDOM({
          sidenavSize: theme.sidebarType,
          colorPrimary: theme.primaryColor,
          colorSecondary: theme.secondaryColor
        })
      }
    } catch (err) {
      console.error('Fetch default settings error:', err)
    }
  }

  const updateDefaultSettings = async (updates: any) => {
    try {
      const payload = {
        Id_Company: 'comp_0001',
        ...updates
      }
      await api.put('/api/nilaiDefault/update', payload, {
        params: { id_company: 'comp_0001' },
        headers: { 'X-Jenis-User': 'Admin' }
      })
    } catch (err) {
      console.error('Update default settings error:', err)
    }
  }

  const applyThemeColors = () => {
    document.documentElement.style.setProperty('--primary-color', theme.primaryColor)
    document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor)
  }

  // Initialize store
  const init = async (force = false) => {
    // 1. Load from localStorage first (for instant UI)
    if (!isInitialized.value) {
      const storedBusiness = localStorage.getItem('business_settings')
      if (storedBusiness) {
        Object.assign(business, JSON.parse(storedBusiness))
      }

      const storedBot = localStorage.getItem('bot_settings')
      if (storedBot) {
        Object.assign(bot, JSON.parse(storedBot))
      }

      const storedApp = localStorage.getItem('app_global_status')
      if (storedApp) {
        Object.assign(app, JSON.parse(storedApp))
      }

      const storedTheme = localStorage.getItem('theme_settings')
      if (storedTheme) {
        Object.assign(theme, JSON.parse(storedTheme))
        applyThemeColors()
      }
    }

    // 2. Fetch strategy: Only fetch if not initialized or forced
    if (!isInitialized.value || force) {
      await Promise.all([fetchBusinessSettings(), fetchDefaultSettings()])
      isInitialized.value = true
    }
  }

  const saveBusiness = () => {
    localStorage.setItem('business_settings', JSON.stringify(business))
  }

  const saveBot = () => {
    localStorage.setItem('bot_settings', JSON.stringify(bot))
  }

  const saveApp = () => {
    localStorage.setItem('app_global_status', JSON.stringify(app))
  }

  const saveTheme = () => {
    localStorage.setItem('theme_settings', JSON.stringify(theme))
  }

  const resetBusiness = () => {
    Object.assign(business, DEFAULT_BUSINESS)
    saveBusiness()
  }

  return {
    business,
    bot,
    app,
    theme,
    isLoading,
    init,
    fetchBusinessSettings,
    fetchDefaultSettings,
    updateDefaultSettings,
    saveBusiness,
    saveBot,
    saveApp,
    saveTheme,
    applyThemeColors,
    resetBusiness
  }
})
