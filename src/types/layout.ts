export type LayoutThemeType = 'light'

export type SideNavType = {
  size: 'default' | 'hover' | 'hover-active' | 'sm' | 'md' | 'mobile' | 'hidden' | 'offcanvas'
  color: 'light'
}

export type LayoutDirectionType = 'ltr-mode' | 'rtl-mode'

export type LayoutType = {
  theme: LayoutThemeType
  sidenav: SideNavType
  position: LayoutDirectionType
  isMobileMenuOpen: boolean
}

export type MenuItemType = {
  key: string
  label: string
  isTitle?: boolean
  icon?: string
  url?: string
  badge?: {
    variant: string
    text: string
  }
  parentKey?: string
  target?: string
  isDisabled?: boolean
  isSpecial?: boolean
  children?: MenuItemType[]
}
