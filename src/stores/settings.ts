import { defineStore } from 'pinia'
import { reactive } from 'vue'

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
}

export interface BotSettings {
  isActive: boolean
}

const DEFAULT_BUSINESS: BusinessSettings = {
  appName: 'Rumah Bejo',
  description: 'Rumah Bejo adalah platform properti premium yang berkomitmen memberikan pengalaman transaksi hunian paling aman, transparan, dan profesional di Indonesia.',
  address: 'Jl. Asia Afrika No.123, SCBD, Jakarta Selatan 12190',
  phone: '+62 895-3538-37000',
  whatsapp: '62895353837000',
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

  // Initialize from localStorage
  const init = () => {
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

  const resetBusiness = () => {
    Object.assign(business, DEFAULT_BUSINESS)
    saveBusiness()
  }

  return {
    business,
    bot,
    app,
    init,
    saveBusiness,
    saveBot,
    saveApp,
    resetBusiness
  }
})
