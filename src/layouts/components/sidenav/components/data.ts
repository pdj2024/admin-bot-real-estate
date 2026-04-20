import type { MenuItemType } from '@/types/layout'

export const menuItems: MenuItemType[] = [
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
  {
    key: 'chat',
    label: 'Chat',
    icon: 'lucide:messages-square',
    url: '/chat'
  },
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
    url: '/properti/katalog'
  },
  {
    key: 'data',
    label: 'Data',
    icon: 'lucide:workflow',
    children: [
      { key: 'data-admin', label: 'Admin', url: '/data/admin'},
      { key: 'data-sales', label: 'Sales', url: '/data/sales' },
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
