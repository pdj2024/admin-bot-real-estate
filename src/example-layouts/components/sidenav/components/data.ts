import type { MenuItemType } from '@/types/layout'

export const menuItems: MenuItemType[] = [
  {
    key: 'overview-title',
    label: 'Overview',
    isTitle: true
  },
  {
    key: 'dashboards',
    label: 'Dashboards',
    icon: 'lucide:monitor-dot',
    children: [
      { key: 'analytics', label: 'Analytics', url: '/example/dashboard/analytics' },
      { key: 'ecommerce', label: 'Ecommerce', url: '/example/dashboard/ecommerce' },
      { key: 'email', label: 'Email', url: '/example/dashboard/email' },
      { key: 'hr', label: 'HR', url: '/example/dashboard/hr' }
    ]
  },
  {
    key: 'landing',
    label: 'Landing Page',
    icon: 'lucide:picture-in-picture-2',
    children: [
      { key: 'one-page', label: 'One Page', url: '/example/landing/one-page' },
      { key: 'product', label: 'Product', url: '/example/landing/product' }
    ]
  },
  {
    key: 'apps-title',
    label: 'Apps',
    isTitle: true
  },
  {
    key: 'chat',
    label: 'Chat',
    icon: 'lucide:messages-square',
    url: '/example/apps/chat'
  },
  {
    key: 'calendar',
    label: 'Calendar',
    icon: 'lucide:calendar-1',
    url: '/example/apps/calendar'
  },
  {
    key: 'email',
    label: 'Email',
    icon: 'lucide:mail',
    url: '/example/apps/email'
  },
  {
    key: 'notes',
    label: 'Notes',
    icon: 'lucide:clipboard-list',
    url: '/example/apps/notes'
  },
  {
    key: 'ecommerce',
    label: 'Ecommerce',
    icon: 'lucide:shopping-bag',
    children: [
      { key: 'product', label: 'Products', url: '/example/ecommerce/product' },
      { key: 'product-grid', label: 'Products Grid', url: '/example/ecommerce/product-grid' },
      { key: 'product-detail', label: 'Product Details', url: '/example/ecommerce/product-detail' },
      { key: 'cart', label: 'Shopping Cart', url: '/example/ecommerce/cart' },
      { key: 'checkout', label: 'Checkout', url: '/example/ecommerce/checkout' },
      { key: 'product-add', label: 'Add Products', url: '/example/ecommerce/product-add' },
      { key: 'order', label: 'Orders', url: '/example/ecommerce/order' },
      { key: 'order-detail', label: 'Order Details', url: '/example/ecommerce/order-detail' },
      { key: 'sellers', label: 'Sellers', url: '/example/ecommerce/sellers' }
    ]
  },
  {
    key: 'hr-management',
    label: 'HR Management',
    icon: 'lucide:circuit-board',
    children: [
      { key: 'employee', label: 'Employee List', url: '/example/hr-management/employee' },
      { key: 'holidays', label: 'Holidays', url: '/example/hr-management/holidays' },
      {
        key: 'leave-manage',
        label: 'Leave Manage',
        parentKey: 'hr-management',
        children: [
          { key: 'leave-employee', label: 'By Employee', url: '/example/hr-management/leave-employee' },
          { key: 'add-employee', label: 'Add Leave(Employee)', url: '/example/hr-management/add-employee' },
          { key: 'leave-hr', label: 'By HR', url: '/example/hr-management/leave-hr' },
          { key: 'add-hr', label: 'Add Leave(HR)', url: '/example/hr-management/add-hr' }
        ]
      },
      {
        key: 'attendance',
        label: 'Attendance',
        parentKey: 'hr-management',
        children: [
          { key: 'attendance', label: 'Attendance(HR)', url: '/example/hr-management/attendance' },
          { key: 'attendance-main', label: 'Main Attendance', url: '/example/hr-management/attendance-main' }
        ]
      },
      { key: 'department', label: 'Department', url: '/example/hr-management/department' },
      {
        key: 'sales',
        label: 'Sales',
        parentKey: 'hr-management',
        children: [
          { key: 'estimates', label: 'Estimates', url: '/example/hr-management/estimates' },
          { key: 'payments', label: 'Payments', url: '/example/hr-management/payments' },
          { key: 'expenses', label: 'Expenses', url: '/example/hr-management/expenses' }
        ]
      },
      {
        key: 'sales',
        label: 'Payroll',
        parentKey: 'hr-management',
        children: [
          { key: 'employee-salary', label: 'Employee Salary', url: '/example/hr-management/employee-salary' },
          { key: 'payslip', label: 'Payslip', url: '/example/hr-management/payslip' },
          { key: 'create-payslip', label: 'Create Payslip', url: '/example/hr-management/create-payslip' }
        ]
      }
    ]
  },
  {
    key: 'invoice',
    label: 'Invoice',
    icon: 'lucide:file-text',
    children: [
      { key: 'overview', label: 'Overview', url: '/example/invoice/overview' },
      { key: 'list', label: 'List Invoice', url: '/example/invoice/list' },
      { key: 'add', label: 'Add Invoice', url: '/example/invoice/add' }
    ]
  },
  {
    key: 'users',
    label: 'Users',
    icon: 'lucide:square-user-round',
    children: [
      { key: 'list', label: 'List View', url: '/example/user/list' },
      { key: 'grid', label: 'Grid View', url: '/example/user/grid' }
    ]
  },
  {
    key: 'extra-title',
    label: 'Extra',
    isTitle: true
  },
  {
    key: 'pages',
    label: 'Pages',
    icon: 'lucide:codesandbox',
    children: [
      { key: 'starter', label: 'Starter Page', url: '/example/starter' },
      { key: 'pricing', label: 'Pricing', url: '/example/pricing' },
      { key: 'faqs', label: 'FAQ', url: '/example/faqs' },
      { key: 'maintenance', label: 'Maintenance', url: '/example/maintenance' },
      { key: 'timeline', label: 'Timeline', url: '/example/timeline' },
      { key: 'coming-soon', label: 'Coming Soon', url: '/example/coming-soon' },
      { key: 'error', label: '404', url: '/example/error' },
      { key: 'offline', label: 'Offline', url: '/example/offline' }
    ]
  },
  {
    key: 'basic-auth',
    label: 'Basic Auth',
    icon: 'lucide:lock',
    children: [
      { key: 'login', label: 'Login', url: '/example/basic-auth/login' },
      { key: 'register', label: 'Register', url: '/example/basic-auth/register' },
      { key: 'verify-email', label: 'Verify Email', url: '/example/basic-auth/verify-email' },
      { key: 'two-steps', label: 'Two Steps', url: '/example/basic-auth/two-steps' },
      { key: 'logout', label: 'Logout', url: '/example/basic-auth/logout' },
      { key: 'reset-pass', label: 'Reset Password', url: '/example/basic-auth/reset-pass' },
      { key: 'create-pass', label: 'Create Password', url: '/example/basic-auth/create-pass' }
    ]
  },
  {
    key: 'cover-auth',
    label: 'Cover Auth',
    icon: 'lucide:shield-check',
    children: [
      { key: 'login', label: 'Login', url: '/example/cover-auth/login' },
      { key: 'register', label: 'Register', url: '/example/cover-auth/register' },
      { key: 'verify-email', label: 'Verify Email', url: '/example/cover-auth/verify-email' },
      { key: 'two-steps', label: 'Two Steps', url: '/example/cover-auth/two-steps' },
      { key: 'logout', label: 'Logout', url: '/example/cover-auth/logout' },
      { key: 'reset-pass', label: 'Reset Password', url: '/example/cover-auth/reset-pass' },
      { key: 'create-pass', label: 'Create Password', url: '/example/cover-auth/create-pass' }
    ]
  },
  {
    key: 'boxed-auth',
    label: 'Boxed Auth',
    icon: 'lucide:package',
    children: [
      { key: 'login', label: 'Login', url: '/example/boxed-auth/login' },
      { key: 'register', label: 'Register', url: '/example/boxed-auth/register' },
      { key: 'verify-email', label: 'Verify Email', url: '/example/boxed-auth/verify-email' },
      { key: 'two-steps', label: 'Two Steps', url: '/example/boxed-auth/two-steps' },
      { key: 'logout', label: 'Logout', url: '/example/boxed-auth/logout' },
      { key: 'reset-pass', label: 'Reset Password', url: '/example/boxed-auth/reset-pass' },
      { key: 'create-pass', label: 'Create Password', url: '/example/boxed-auth/create-pass' }
    ]
  },
  {
    key: 'modern-auth',
    label: 'Modern Auth',
    icon: 'lucide:fingerprint',
    children: [
      { key: 'login', label: 'Login', url: '/example/mordern-auth/login' },
      { key: 'register', label: 'Register', url: '/example/mordern-auth/register' },
      { key: 'verify-email', label: 'Verify Email', url: '/example/mordern-auth/verify-email' },
      { key: 'two-steps', label: 'Two Steps', url: '/example/mordern-auth/two-steps' },
      { key: 'logout', label: 'Logout', url: '/example/mordern-auth/logout' },
      { key: 'reset-pass', label: 'Reset Password', url: '/example/mordern-auth/reset-pass' },
      { key: 'create-pass', label: 'Create Password', url: '/example/mordern-auth/create-pass' }
    ]
  },
  {
    key: 'layouts',
    label: 'Layouts',
    icon: 'lucide:layout-panel-left',
    children: [
      { key: 'hover-sidenav', label: 'Hover Sidenav', url: '/example/layout/hover-sidebar' },
      { key: 'hover-active-sideba', label: 'Hover Active Sidenav', url: '/example/layout/hover-active-sidebar' },
      { key: 'small-sidebar', label: 'Small Sidenav', url: '/example/layout/small-sidebar' },
      { key: 'compact-sidenav', label: 'Compact Sidenav', url: '/example/layout/compact-sidebar' },
      { key: 'offcanvas-sidenav', label: 'Offcanvas Sidenav', url: '/example/layout/offcavas-sidebar' },
      { key: 'hidden-sidenav', label: 'Hidden Sidenav', url: '/example/layout/hidden-sidebar' },
      { key: 'dark-sidenav', label: 'Dark Sidenav', url: '/example/layout/dark-sidebar' },
      { key: 'dark-mode', label: 'Dark Mode', url: '/example/layout/dark-mode' },
      { key: 'rtl-mode', label: 'RTL Mode', url: '/example/layout/rtl-mode' }
    ]
  },
  {
    key: 'multi-level',
    label: 'Multi Level',
    icon: 'lucide:share-2',
    children: [
      { key: 'item-1', label: 'Item 1', url: '' },
      { key: 'item-2', label: 'Item 2', url: '' }
    ]
  }
]
