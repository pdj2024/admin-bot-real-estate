import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Real
    {
      path: '/',
      redirect: '/dashboard/'
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      meta: {
        title: 'Dashboard'
      },
      component: () => import('@/views/dashboard/index.vue')
    },
    {
      path: '/chat',
      name: 'Chat',
      meta: {
        title: 'Chat'
      },
      component: () => import('@/views/chat/index.vue')
    },

    // Example
    {
      path: '/example',
      redirect: '/example/dashboard/ecommerce'
    },
    {
      path: '/example/dashboard/ecommerce',
      name: 'Example Dashboard Ecommerce',
      meta: {
        title: 'Example Dashboard Ecommerce'
      },
      component: () => import('@/example-views/dashboard/ecommerce/index.vue')
    },
    {
      path: '/example/dashboard/analytics',
      name: 'Example Dashboard Analytics',
      meta: {
        title: 'Example Dashboard Analytics'
      },
      component: () => import('@/example-views/dashboard/analytics/index.vue')
    },
    {
      path: '/example/dashboard/email',
      name: 'Example Dashboard Email',
      meta: {
        title: 'Example Dashboard Email'
      },
      component: () => import('@/example-views/dashboard/email/index.vue')
    },
    {
      path: '/example/dashboard/hr',
      name: 'Example Dashboard Hr',
      meta: {
        title: 'Example Dashboard Hr'
      },
      component: () => import('@/example-views/dashboard/hr/index.vue')
    },
    {
      path: '/example/landing/one-page',
      name: 'Example Landing One page',
      meta: {
        title: 'Example Dashboard Hr'
      },
      component: () => import('@/example-views/landing/one-page/index.vue')
    },
    {
      path: '/example/landing/product',
      name: 'Example Landing Product',
      meta: {
        title: 'Example Landing Product'
      },
      component: () => import('@/example-views/landing/product/index.vue')
    },
    {
      path: '/example/apps/chat',
      name: 'Example Chat',
      meta: {
        title: 'Example Chat'
      },
      component: () => import('@/example-views/apps/chat/index.vue')
    },
    {
      path: '/example/apps/calendar',
      name: 'Example Calendar',
      meta: {
        title: 'Example Calendar'
      },
      component: () => import('@/example-views/apps/calendar/index.vue')
    },
    {
      path: '/example/apps/email',
      name: 'Example Email',
      meta: {
        title: 'Example Email'
      },
      component: () => import('@/example-views/apps/email/index.vue')
    },
    {
      path: '/example/apps/notes',
      name: 'Example Notes',
      meta: {
        title: 'Example Notes'
      },
      component: () => import('@/example-views/apps/notes/index.vue')
    },
    {
      path: '/example/ecommerce/product',
      name: 'Example Products',
      meta: {
        title: 'Example Products'
      },
      component: () => import('@/example-views/ecommerce/product/index.vue')
    },
    {
      path: '/example/ecommerce/product-grid',
      name: 'Example Products Grid',
      meta: {
        title: 'Example Products Grid'
      },
      component: () => import('@/example-views/ecommerce/product-grid/index.vue')
    },
    {
      path: '/example/ecommerce/product-detail',
      name: 'Example Product Details',
      meta: {
        title: 'Example Product Details'
      },
      component: () => import('@/example-views/ecommerce/product-detail/index.vue')
    },
    {
      path: '/example/ecommerce/cart',
      name: 'Example Product Cart',
      meta: {
        title: 'Example Product Cart'
      },
      component: () => import('@/example-views/ecommerce/cart/index.vue')
    },
    {
      path: '/example/ecommerce/checkout',
      name: 'Example Product Checkout',
      meta: {
        title: 'Example Product Checkout'
      },
      component: () => import('@/example-views/ecommerce/checkout/index.vue')
    },
    {
      path: '/example/ecommerce/product-add',
      name: 'Example Add Products',
      meta: {
        title: 'Example Add Products'
      },
      component: () => import('@/example-views/ecommerce/product-add/index.vue')
    },
    {
      path: '/example/ecommerce/order',
      name: 'Example Order',
      meta: {
        title: 'Example Order'
      },
      component: () => import('@/example-views/ecommerce/order/index.vue')
    },
    {
      path: '/example/ecommerce/order-detail',
      name: 'Example Order Detail',
      meta: {
        title: 'Example Order Detail'
      },
      component: () => import('@/example-views/ecommerce/order-detail/index.vue')
    },
    {
      path: '/example/ecommerce/sellers',
      name: 'Example Sellers',
      meta: {
        title: 'Example Sellers'
      },
      component: () => import('@/example-views/ecommerce/sellers/index.vue')
    },
    {
      path: '/example/hr-management/employee',
      name: 'Example Employee List',
      meta: {
        title: 'Example Employee List'
      },
      component: () => import('@/example-views/hr-management/employee/index.vue')
    },
    {
      path: '/example/hr-management/holidays',
      name: 'Example Holidays',
      meta: {
        title: 'Example Holidays'
      },
      component: () => import('@/example-views/hr-management/holidays/index.vue')
    },
    {
      path: '/example/hr-management/leave-employee',
      name: 'Example By Employee',
      meta: {
        title: 'Example By Employee'
      },
      component: () => import('@/example-views/hr-management/(leave-manage)/leave-employee/index.vue')
    },
    {
      path: '/example/hr-management/add-employee',
      name: 'Example Add Leave(Employee)',
      meta: {
        title: 'Example Add Leave(Employee)'
      },
      component: () => import('@/example-views/hr-management/(leave-manage)/add-employee/index.vue')
    },
    {
      path: '/example/hr-management/leave-hr',
      name: 'Example By HR',
      meta: {
        title: 'Example By HR'
      },
      component: () => import('@/example-views/hr-management/(leave-manage)/leave-hr/index.vue')
    },
    {
      path: '/example/hr-management/add-hr',
      name: 'Example Add Leave(HR)',
      meta: {
        title: 'Example Add Leave(HR)'
      },
      component: () => import('@/example-views/hr-management/(leave-manage)/add-hr/index.vue')
    },
    {
      path: '/example/hr-management/attendance',
      name: 'Example Attendance(HR)',
      meta: {
        title: 'Example Attendance(HR)'
      },
      component: () => import('@/example-views/hr-management/(attendance)/attendance/index.vue')
    },
    {
      path: '/example/hr-management/attendance-main',
      name: 'Example Attendance Main',
      meta: {
        title: 'Example Attendance Main'
      },
      component: () => import('@/example-views/hr-management/(attendance)/attendance-main/index.vue')
    },
    {
      path: '/example/hr-management/department',
      name: 'Example Department',
      meta: {
        title: 'Example Department'
      },
      component: () => import('@/example-views/hr-management/department/index.vue')
    },
    {
      path: '/example/hr-management/estimates',
      name: 'Example Estimates',
      meta: {
        title: 'Example Estimates'
      },
      component: () => import('@/example-views/hr-management/(sales)/estimates/index.vue')
    },
    {
      path: '/example/hr-management/payments',
      name: 'Example Payments',
      meta: {
        title: 'Example Payments'
      },
      component: () => import('@/example-views/hr-management/(sales)/payments/index.vue')
    },
    {
      path: '/example/hr-management/expenses',
      name: 'Example Expenses',
      meta: {
        title: 'Example Expenses'
      },
      component: () => import('@/example-views/hr-management/(sales)/expenses/index.vue')
    },
    {
      path: '/example/hr-management/employee-salary',
      name: 'Example Employee Salary',
      meta: {
        title: 'Example Employee Salary'
      },
      component: () => import('@/example-views/hr-management/(payroll)/employee-salary/index.vue')
    },
    {
      path: '/example/hr-management/payslip',
      name: 'Example Payslip',
      meta: {
        title: 'Example Payslip'
      },
      component: () => import('@/example-views/hr-management/(payroll)/payslip/index.vue')
    },
    {
      path: '/example/hr-management/create-payslip',
      name: 'Example Create Payslip',
      meta: {
        title: 'Example Create Payslip'
      },
      component: () => import('@/example-views/hr-management/(payroll)/create-payslip/index.vue')
    },
    {
      path: '/example/invoice/overview',
      name: 'Example Overview',
      meta: {
        title: 'Example Overview'
      },
      component: () => import('@/example-views/invoice/overview/index.vue')
    },
    {
      path: '/example/invoice/list',
      name: 'Example List Invoice',
      meta: {
        title: 'Example List Invoice'
      },
      component: () => import('@/example-views/invoice/list/index.vue')
    },
    {
      path: '/example/invoice/add',
      name: 'Example Add Invoice',
      meta: {
        title: 'Example Add Invoice'
      },
      component: () => import('@/example-views/invoice/add/index.vue')
    },
    {
      path: '/example/user/list',
      name: 'Example List View',
      meta: {
        title: 'Example List View'
      },
      component: () => import('@/example-views/user/list/index.vue')
    },
    {
      path: '/example/user/grid',
      name: 'Example Grid View',
      meta: {
        title: 'Example Grid View'
      },
      component: () => import('@/example-views/user/grid/index.vue')
    },
    {
      path: '/example/starter',
      name: 'Example Starter Page',
      meta: {
        title: 'Example Starter Page'
      },
      component: () => import('@/example-views/(pages)/starter/index.vue')
    },
    {
      path: '/example/pricing',
      name: 'Example Pricing',
      meta: {
        title: 'Example Pricing'
      },
      component: () => import('@/example-views/(pages)/pricing/index.vue')
    },
    {
      path: '/example/faqs',
      name: 'Example Faq',
      meta: {
        title: 'Example Faq'
      },
      component: () => import('@/example-views/(pages)/faqs/index.vue')
    },
    {
      path: '/example/maintenance',
      name: 'Example Maintenance',
      meta: {
        title: 'Example Maintenance'
      },
      component: () => import('@/example-views/(pages)/maintenance/index.vue')
    },
    {
      path: '/example/timeline',
      name: 'Example Timeline',
      meta: {
        title: 'Example Timeline'
      },
      component: () => import('@/example-views/(pages)/timeline/index.vue')
    },
    {
      path: '/example/coming-soon',
      name: 'Example Coming Soon',
      meta: {
        title: 'Example Coming Soon'
      },
      component: () => import('@/example-views/(pages)/coming-soon/index.vue')
    },
    {
      path: '/example/error',
      name: 'Example Error',
      meta: {
        title: 'Example Error'
      },
      component: () => import('@/example-views/(pages)/error/index.vue')
    },
    {
      path: '/example/offline',
      name: 'Example Offline',
      meta: {
        title: 'Example Offline'
      },
      component: () => import('@/example-views/(pages)/offline/index.vue')
    },
    {
      path: '/example/basic-auth/login',
      name: 'Example Basic Login',
      meta: {
        title: 'Example Basic Login'
      },
      component: () => import('@/example-views/(auth)/basic-auth/login/index.vue')
    },
    {
      path: '/example/basic-auth/register',
      name: 'Example Basic Register',
      meta: {
        title: 'Example Basic Register'
      },
      component: () => import('@/example-views/(auth)/basic-auth/register/index.vue')
    },
    {
      path: '/example/basic-auth/verify-email',
      name: 'Example Basic Verify-Email',
      meta: {
        title: 'Example Basic Verify-Email'
      },
      component: () => import('@/example-views/(auth)/basic-auth/verify-email/index.vue')
    },
    {
      path: '/example/basic-auth/two-steps',
      name: 'Example Basic Two Steps',
      meta: {
        title: 'Example Basic Two Steps'
      },
      component: () => import('@/example-views/(auth)/basic-auth/two-steps/index.vue')
    },
    {
      path: '/example/basic-auth/logout',
      name: 'Example Basic Logout',
      meta: {
        title: 'Example Basic Logout'
      },
      component: () => import('@/example-views/(auth)/basic-auth/logout/index.vue')
    },
    {
      path: '/example/basic-auth/reset-pass',
      name: 'Example Reset Password',
      meta: {
        title: 'Example Reset Password'
      },
      component: () => import('@/example-views/(auth)/basic-auth/reset-pass/index.vue')
    },
    {
      path: '/example/basic-auth/create-pass',
      name: 'Example Create Password',
      meta: {
        title: 'Example Create Password'
      },
      component: () => import('@/example-views/(auth)/basic-auth/create-pass/index.vue')
    },
    {
      path: '/example/cover-auth/login',
      name: 'Example Cover Login',
      meta: {
        title: 'Example Cover Login'
      },
      component: () => import('@/example-views/(auth)/cover-auth/login/index.vue')
    },
    {
      path: '/example/cover-auth/register',
      name: 'Example Cover Resgister',
      meta: {
        title: 'Example Cover Resgister'
      },
      component: () => import('@/example-views/(auth)/cover-auth/register/index.vue')
    },
    {
      path: '/example/cover-auth/verify-email',
      name: 'Example Cover Verify Email',
      meta: {
        title: 'Example Cover Verify Email'
      },
      component: () => import('@/example-views/(auth)/cover-auth/verify-email/index.vue')
    },
    {
      path: '/example/cover-auth/two-steps',
      name: 'Example Cover Two Steps',
      meta: {
        title: 'Example Cover Two Steps'
      },
      component: () => import('@/example-views/(auth)/cover-auth/two-steps/index.vue')
    },
    {
      path: '/example/cover-auth/logout',
      name: 'Example Cover Logout',
      meta: {
        title: 'Example Cover Logout'
      },
      component: () => import('@/example-views/(auth)/cover-auth/logout/index.vue')
    },
    {
      path: '/example/cover-auth/reset-pass',
      name: 'Example Cover Reset PassWord',
      meta: {
        title: 'Example Cover Reset PassWord'
      },
      component: () => import('@/example-views/(auth)/cover-auth/reset-pass/index.vue')
    },
    {
      path: '/example/cover-auth/create-pass',
      name: 'Example Cover Create PassWord',
      meta: {
        title: 'Example Cover Reset PassWord'
      },
      component: () => import('@/example-views/(auth)/cover-auth/create-pass/index.vue')
    },
    {
      path: '/example/boxed-auth/login',
      name: 'Example Boxed Login',
      meta: {
        title: 'Example Boxed Login'
      },
      component: () => import('@/example-views/(auth)/boxed-auth/login/index.vue')
    },
    {
      path: '/example/boxed-auth/register',
      name: 'Example Boxed Register',
      meta: {
        title: 'Example Boxed Register'
      },
      component: () => import('@/example-views/(auth)/boxed-auth/register/index.vue')
    },
    {
      path: '/example/boxed-auth/verify-email',
      name: 'Example Boxed Verify Email',
      meta: {
        title: 'Example Boxed Verify Email'
      },
      component: () => import('@/example-views/(auth)/boxed-auth/verify-email/index.vue')
    },
    {
      path: '/example/boxed-auth/two-steps',
      name: 'Example Boxed Two Steps',
      meta: {
        title: 'Example Boxed Two Steps'
      },
      component: () => import('@/example-views/(auth)/boxed-auth/two-steps/index.vue')
    },
    {
      path: '/example/boxed-auth/logout',
      name: 'Example Boxed Logout',
      meta: {
        title: 'Example Boxed Logout'
      },
      component: () => import('@/example-views/(auth)/boxed-auth/logout/index.vue')
    },
    {
      path: '/example/boxed-auth/reset-pass',
      name: 'Example Boxed Reset Password',
      meta: {
        title: 'Example Reset Password'
      },
      component: () => import('@/example-views/(auth)/boxed-auth/reset-pass/index.vue')
    },
    {
      path: '/example/boxed-auth/create-pass',
      name: 'Example Boxed Create Password',
      meta: {
        title: 'Example Create Password'
      },
      component: () => import('@/example-views/(auth)/boxed-auth/create-pass/index.vue')
    },
    {
      path: '/example/mordern-auth/login',
      name: 'Example Mordern Login',
      meta: {
        title: 'Example Mordern Login'
      },
      component: () => import('@/example-views/(auth)/mordern-auth/login/index.vue')
    },
    {
      path: '/example/mordern-auth/register',
      name: 'Example Mordern Register',
      meta: {
        title: 'Example Mordern Register'
      },
      component: () => import('@/example-views/(auth)/mordern-auth/register/index.vue')
    },
    {
      path: '/example/mordern-auth/verify-email',
      name: 'Example Mordern Verify Email',
      meta: {
        title: 'Example Mordern Verify Email'
      },
      component: () => import('@/example-views/(auth)/mordern-auth/verify-email/index.vue')
    },
    {
      path: '/example/mordern-auth/two-steps',
      name: 'Example Mordern Two Steps',
      meta: {
        title: 'Example Two Steps'
      },
      component: () => import('@/example-views/(auth)/mordern-auth/two-steps/index.vue')
    },
    {
      path: '/example/mordern-auth/logout',
      name: 'Example Mordern Two Logout',
      meta: {
        title: 'Example Two Logout'
      },
      component: () => import('@/example-views/(auth)/mordern-auth/logout/index.vue')
    },
    {
      path: '/example/mordern-auth/reset-pass',
      name: 'Example Mordern Reset Pass',
      meta: {
        title: 'Example Reset Pass'
      },
      component: () => import('@/example-views/(auth)/mordern-auth/reset-pass/index.vue')
    },
    {
      path: '/example/mordern-auth/create-pass',
      name: 'Example Mordern Create Password',
      meta: {
        title: 'Example Create Password'
      },
      component: () => import('@/example-views/(auth)/mordern-auth/create-pass/index.vue')
    },
    {
      path: '/example/layout/hover-sidebar',
      name: 'Example Hover Sidenav',
      meta: {
        title: 'Example Hover Sidenav'
      },
      component: () => import('@/example-views/layout/hover-sidebar/index.vue')
    },
    {
      path: '/example/layout/hover-active-sidebar',
      name: 'Example Hover Active Sidenav',
      meta: {
        title: 'Example Hover Active Sidenav'
      },
      component: () => import('@/example-views/layout/hover-active-sidebar/index.vue')
    },
    {
      path: '/example/layout/small-sidebar',
      name: 'Example Small Sidenav',
      meta: {
        title: 'Example Small Sidenav'
      },
      component: () => import('@/example-views/layout/small-sidebar/index.vue')
    },
    {
      path: '/example/layout/compact-sidebar',
      name: 'Example Compact Sidebar',
      meta: {
        title: 'Example Compact Sidebar'
      },
      component: () => import('@/example-views/layout/compact-sidebar/index.vue')
    },
    {
      path: '/example/layout/offcavas-sidebar',
      name: 'Example Offcanvas SideBar',
      meta: {
        title: 'Example Offcanvas Sidebar'
      },
      component: () => import('@/example-views/layout/offcavas-sidebar/index.vue')
    },
    {
      path: '/example/layout/hidden-sidebar',
      name: 'Example Hidden SideBar',
      meta: {
        title: 'Example Hidden SideBar'
      },
      component: () => import('@/example-views/layout/hidden-sidebar/index.vue')
    },
    {
      path: '/example/layout/dark-sidebar',
      name: 'Example Dark SideBar',
      meta: {
        title: 'Example Dark SideBar'
      },
      component: () => import('@/example-views/layout/dark-sidebar/index.vue')
    },
    {
      path: '/example/layout/dark-mode',
      name: 'Example Dark Mode',
      meta: {
        title: 'Example Dark Mode'
      },
      component: () => import('@/example-views/layout/dark-mode/index.vue')
    },
    {
      path: '/example/layout/rtl-mode',
      name: 'Example Rtl Mode',
      meta: {
        title: 'Example Rtl Mode'
      },
      component: () => import('@/example-views/layout/rtl-mode/index.vue')
    }
  ]
})

export default router
