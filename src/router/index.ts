import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'
import { useSettings } from '@/stores/settings'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Auth
    {
      path: '/login',
      name: 'Login',
      meta: {
        title: 'Login',
        guestOnly: true
      },
      component: () => import('@/views/auth/login/index.vue')
    },

    // Guest
    {
      path: '/',
      name: 'Beranda',
      meta: {
        title: 'Beranda',
        requiresAuth: false
      },
      component: () => import('@/views/guest/beranda/index.vue')
    },
    {
      path: '/katalog',
      name: 'Katalog Properti',
      meta: {
        title: 'Katalog Properti',
        requiresAuth: false
      },
      component: () => import('@/views/guest/properti/katalog/index.vue')
    },
    {
      path: '/detail/:slug',
      name: 'Detail properti',
      meta: {
        title: 'Detail Properti',
        requiresAuth: false
      },
      component: () => import('@/views/guest/properti/detail/index.vue')
    },
    {
      path: '/simulasi-kpr',
      name: 'Simulasi KPR',
      meta: {
        title: 'Simulasi KPR',
        requiresAuth: false
      },
      component: () => import('@/views/guest/simulasi-kpr/index.vue')
    },
    {
      path: '/tentang-kami',
      name: 'Tentang Kami',
      meta: {
        title: 'Tentang Kami',
        requiresAuth: false
      },
      component: () => import('@/views/guest/tentang-kami/index.vue')
    },
    {
      path: '/kontak',
      name: 'Kontak',
      meta: {
        title: 'Kontak',
        requiresAuth: false
      },
      component: () => import('@/views/guest/kontak/index.vue')
    },
    {
      path: '/faq',
      name: 'FAQ',
      meta: {
        title: 'FAQ',
        requiresAuth: false
      },
      component: () => import('@/views/guest/faq/index.vue')
    },

    // Role Admin
    {
      path: '/dashboard',
      name: 'Dashboard',
      meta: {
        title: 'Dashboard',
        requiresAuth: true
      },
      component: () => import('@/views/admin/dashboard/index.vue')
    },
    {
      path: '/chat',
      name: 'Chat',
      meta: {
        title: 'Chat',
        requiresAuth: true
      },
      component: () => import('@/views/admin/chat/index.vue')
    },
    {
      path: '/broadcast',
      name: 'Broadcast',
      meta: {
        title: 'Broadcast',
        requiresAuth: true
      },
      component: () => import('@/views/admin/broadcast/index.vue')
    },
    {
      path: '/janji-temu',
      name: 'janji-temu',
      meta: {
        title: 'Janji Temu',
        requiresAuth: true
      },
      component: () => import('@/views/admin/janji-temu/index.vue')
    },
    {
      path: '/properti',
      redirect: '/properti/katalog'
    },
    {
      path: '/properti/katalog',
      name: 'Admin Katalog Properti',
      meta: {
        title: 'Katalog Properti',
        requiresAuth: true
      },
      component: () => import('@/views/admin/properti/katalog/index.vue')
    },
    {
      path: '/properti/detail/:slug',
      name: 'Admin Detail properti',
      meta: {
        title: 'Detail properti',
        requiresAuth: true
      },
      component: () => import('@/views/admin/properti/detail/index.vue')
    },
    {
      path: '/data/admin',
      name: 'Data Admin',
      meta: {
        title: 'Data Admin',
        requiresAuth: true
      },
      component: () => import('@/views/admin/kelola-data/admin/index.vue')
    },
    {
      path: '/data/sales',
      name: 'Data Sales',
      meta: {
        title: 'Data Sales',
        requiresAuth: true
      },
      component: () => import('@/views/admin/kelola-data/sales/index.vue')
    },
    {
      path: '/data/customer',
      name: 'Data Customer',
      meta: {
        title: 'Data Customer',
        requiresAuth: true
      },
      component: () => import('@/views/admin/kelola-data/customer/index.vue')
    },
    {
      path: '/data/wilayah',
      name: 'Data Wilayah',
      meta: {
        title: 'Data Wilayah',
        requiresAuth: true
      },
      component: () => import('@/views/admin/kelola-data/wilayah/index.vue')
    },
    {
      path: '/pengaturan',
      name: 'Pengaturan',
      meta: {
        title: 'Pengaturan',
        requiresAuth: true
      },
      component: () => import('@/views/admin/pengaturan/index.vue')
    },

    // Error Pages
    {
      path: '/403',
      name: 'Forbidden',
      meta: {
        title: 'Akses Dibatalkan',
        requiresAuth: false
      },
      component: () => import('@/views/errors/ForbiddenView.vue')
    },
    {
      path: '/error',
      name: 'ServerError',
      meta: {
        title: 'Sistem Bermasalah',
        requiresAuth: false
      },
      component: () => import('@/views/errors/ServerErrorView.vue')
    },
    {
      path: '/maintenance',
      name: 'Maintenance',
      meta: {
        title: 'Sistem Sedang Diperbaiki',
        requiresAuth: false
      },
      component: () => import('@/views/errors/MaintenanceView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      meta: {
        title: 'Halaman Tidak Ditemukan',
        requiresAuth: false
      },
      component: () => import('@/views/errors/NotFoundView.vue')
    }
  ]
})

let isTokenRefreshed = false

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')
  const refreshToken = localStorage.getItem('refreshToken')
  const hasTokens = !!token && token !== 'undefined' && !!refreshToken && refreshToken !== 'undefined'

  // PRIORITY 1: Auth check — runs first, unconditionally.
  // Unauthenticated users always go to /login, never to /maintenance.
  if (to.meta.requiresAuth) {
    if (!hasTokens) {
      return next({ name: 'Login', query: { redirect: to.fullPath } })
    }

    // Refresh token proactively on first load
    if (!isTokenRefreshed) {
      isTokenRefreshed = true
      try {
        const baseURL = 'https://wabotapi.padajaya.biz.id'
        const roleUser = localStorage.getItem('role_user') || 'admin'

        const { data } = await axios.post(`${baseURL}/api/auth/refresh`, { refreshToken }, { headers: { 'X-Jenis-User': roleUser } })

        const resData = data.Data || data
        const newToken = resData.token || resData.Token
        const newRefresh = resData.refreshToken || resData.RefreshToken

        if (newToken) {
          localStorage.setItem('token', newToken)
          if (newRefresh) localStorage.setItem('refreshToken', newRefresh)
        } else {
          throw new Error('Invalid Token')
        }
      } catch (err) {
        console.error('Refresh token failed on initial admin access:', err)
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        return next({ name: 'Login', query: { redirect: to.fullPath } })
      }
    }

    return next()
  }

  // PRIORITY 2: Redirect authenticated user away from login page.
  if (to.name === 'Login' && hasTokens) {
    return next({ name: 'Dashboard' })
  }

  // PRIORITY 3: Maintenance mode — only applies to public (guest) pages.
  // Admin routes already handled above. Login page is excluded.
  const storedApp = localStorage.getItem('app_global_status')
  const isMaintenance = storedApp ? JSON.parse(storedApp).isMaintenance : false

  if (isMaintenance) {
    const isMaintenancePage = to.name === 'Maintenance'
    const isLoginPage = to.name === 'Login'

    // IF user is logged in AND trying to access maintenance page -> Send to Beranda (bypass)
    if (hasTokens && isMaintenancePage) {
      return next({ name: 'Beranda' })
    }

    // IF user is NOT logged in AND trying to access a non-maintenance public page -> Redirect to maintenance
    if (!hasTokens && !isMaintenancePage && !isLoginPage) {
      return next({ name: 'Maintenance' })
    }
  } else {
    // Maintenance OFF: prevent direct access to /maintenance
    if (to.name === 'Maintenance') {
      return next({ name: 'Beranda' })
    }
  }

  next()
})

router.afterEach((to) => {
  // If navigating to a guest page (requiresAuth: false or undefined)
  if (!to.meta.requiresAuth) {
    const settingsStore = useSettings()
    // Trigger background fetch for guest pages every time they navigate
    settingsStore.fetchBusinessSettings()
    settingsStore.fetchDefaultSettings()
  }
})

export default router
