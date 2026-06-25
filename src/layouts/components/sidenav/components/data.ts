import type { MenuItemType } from '@/types/layout'

export const menuItems: MenuItemType[] = [
  {
    key: 'beranda',
    label: 'Beranda Guest',
    icon: 'lucide:home',
    url: '/'
  },
  {
    key: 'menu-utama-title',
    label: 'Menu Utama',
    isTitle: true
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'lucide:layout-dashboard',
    url: '/dashboard'
  },
  // Next Update
  // {
  //   key: 'performa',
  //   label: 'Performa',
  //   icon: 'lucide:line-chart',
  //   url: '/performa'
  // },
  // {
  //   key: 'chat',
  //   label: 'Chat',
  //   icon: 'lucide:messages-square',
  //   url: '/chat'
  // },
  // {
  //   key: 'broadcast',
  //   label: 'Broadcast',
  //   icon: 'lucide:megaphone',
  //   url: '/broadcast'
  // },
  {
    key: 'janji-temu',
    label: 'Janji Temu',
    icon: 'lucide:calendar-days',
    url: '/janji-temu'
  },
  {
    key: 'kelola-title',
    label: 'Kelola',
    isTitle: true
  },
  {
    key: 'properti',
    label: 'Properti',
    icon: 'lucide:blocks',
    url: '/properti'
  },
  {
    key: 'kunci',
    label: 'Kunci',
    icon: 'lucide:key',
    url: '/kunci'
  },
  {
    key: 'data',
    label: 'Data',
    icon: 'lucide:workflow',
    children: [
      // Next Update
      // { key: 'data-icon', label: 'Icon', url: '/data/icon' },
      // { key: 'data-status', label: 'Status', url: '/data/status' },
      { key: 'data-admin', label: 'Admin', url: '/data/admin'},
      // { key: 'data-sales', label: 'Sales', url: '/data/sales' },
      { key: 'data-customer', label: 'Customer', url: '/data/customer' },
      { key: 'data-wilayah', label: 'Wilayah', url: '/data/wilayah' },
    ]
  },
  {
    key: 'pengaturan',
    label: 'Pengaturan',
    icon: 'lucide:settings-2',
    url: '/pengaturan'
  },
]
