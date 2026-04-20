import { createRouter, createWebHistory } from 'vue-router'

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
        title: 'Detail properti',
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
      path: '/test',
      name: 'Test Address',
      meta: {
        title: 'Test Pencarian Alamat',
        requiresAuth: false
      },
      component: () => import('@/views/guest/test/index.vue')
    },
    {
      path: '/test2',
      name: 'Test Address Google',
      meta: {
        title: 'Test Google Maps Address Picker',
        requiresAuth: false
      },
      component: () => import('@/views/guest/test2/index.vue')
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
      path: '/janji-temu',
      name: 'janji-temu',
      meta: {
        title: 'Janji Temu',
        requiresAuth: true
      },
      component: () => import('@/views/admin/janji-temu/index.vue')
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
    },
  ]
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const refreshToken = localStorage.getItem('refreshToken')
  const hasTokens =
    !!token && token !== 'undefined' && !!refreshToken && refreshToken !== 'undefined'

  // PRIORITY 1: Auth check — runs first, unconditionally.
  // Unauthenticated users always go to /login, never to /maintenance.
  if (to.meta.requiresAuth) {
    if (!hasTokens) {
      return next({ name: 'Login', query: { redirect: to.fullPath } })
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
    if (!isMaintenancePage && !isLoginPage) {
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

export default router
