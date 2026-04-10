import { createRouter, createWebHistory } from 'vue-router'
import { isTokenExpired } from '@/services/auth';

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
      redirect: '/katalog',
      meta: {
        requiresAuth: false
      }
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


    // Role Admin
    {
      path: '/dashboard',
      name: 'Dashboard',
      meta: {
        title: 'Dashboard',
        requiresAuth: true
      },
      component: () => import('@/views/dashboard/index.vue')
    },
    {
      path: '/chat',
      name: 'Chat',
      meta: {
        title: 'Chat',
        requiresAuth: true
      },
      component: () => import('@/views/chat/index.vue')
    },
    {
      path: '/janji-temu',
      name: 'janji-temu',
      meta: {
        title: 'Janji Temu',
        requiresAuth: true
      },
      component: () => import('@/views/janji-temu/index.vue')
    },
    {
      path: '/properti/katalog',
      name: 'Admin Katalog Properti',
      meta: {
        title: 'Katalog Properti',
        requiresAuth: true
      },
      component: () => import('@/views/properti/katalog/index.vue')
    },
    {
      path: '/properti/detail/:slug',
      name: 'Admin Detail properti',
      meta: {
        title: 'Detail properti',
        requiresAuth: true
      },
      component: () => import('@/views/properti/detail/index.vue')
    },
    {
      path: '/data/admin',
      name: 'Data Admin',
      meta: {
        title: 'Data Admin',
        requiresAuth: true
      },
      component: () => import('@/views/data-master/admin/index.vue')
    },
    {
      path: '/data/sales',
      name: 'Data Sales',
      meta: {
        title: 'Data Sales',
        requiresAuth: true
      },
      component: () => import('@/views/data-master/sales/index.vue')
    },
    {
      path: '/data/customer',
      name: 'Data Customer',
      meta: {
        title: 'Data Customer',
        requiresAuth: true
      },
      component: () => import('@/views/data-master/customer/index.vue')
    },
    {
      path: '/pengaturan',
      name: 'Pengaturan',
      meta: {
        title: 'Pengaturan',
        requiresAuth: true
      },
      component: () => import('@/views/pengaturan/index.vue')
    },
  ]
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');

  const hasTokens = !!token && token !== 'undefined' && !!refreshToken && refreshToken !== 'undefined';

  if (to.path === '/login' && hasTokens && !isTokenExpired(token)) {
    return next({ name: 'Dashboard' });
  }

  if (to.meta.requiresAuth) {
    if (!hasTokens) {
      return next({ name: 'Login', query: { redirect: to.fullPath } });
    }
    next();
  } else {
    next();
  }
});

export default router
