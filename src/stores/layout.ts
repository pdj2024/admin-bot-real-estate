import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LayoutThemeType, LayoutType, SideNavType, LayoutDirectionType } from '@/types/layout'
import { useSystemTheme } from '@/composables/useSystemTheme'
import { toggleAttribute } from '@/helpers/layout'

const INIT_STATE: LayoutType = {
  theme: 'light',
  sidenav: {
    size: 'hover',
    color: 'light'
  },
  position: 'ltr-mode',
  isMobileMenuOpen: false
}

export const useLayout = defineStore('layout', () => {
  const layout = ref<LayoutType>({ ...INIT_STATE })
  const systemTheme = useSystemTheme()
  const isCustomizerOpen = ref(false)

  const setSideNavSize = (nSize: SideNavType['size'], persist = true) => {
    toggleAttribute('data-sidenav-size', nSize)

    if (persist && nSize !== 'offcanvas') {
      layout.value.sidenav.size = nSize
    } else {
      layout.value.sidenav.size = nSize
    }

    const html = document.documentElement
    if (nSize === 'offcanvas' && layout.value.isMobileMenuOpen) {
      html.classList.add('sidenav-enable')
    } else if (!layout.value.isMobileMenuOpen) {
      html.classList.remove('sidenav-enable')
    }
  }

  const toggleMobileMenu = () => {
    layout.value.isMobileMenuOpen = !layout.value.isMobileMenuOpen
    const html = document.documentElement
    if (layout.value.isMobileMenuOpen) {
      html.classList.add('sidenav-enable')
    } else {
      html.classList.remove('sidenav-enable')
    }
  }

  const closeAllMenus = () => {
    layout.value.isMobileMenuOpen = false
    document.documentElement.classList.remove('sidenav-enable')

    if (window.innerWidth <= 768) {
      layout.value.sidenav.size = 'offcanvas'
    }
  }

  const init = () => {
    const html = document.documentElement
    layout.value.isMobileMenuOpen = false
    html.classList.remove('sidenav-enable')

    toggleAttribute('data-theme', layout.value.theme)
    toggleAttribute('data-sidenav-color', layout.value.sidenav.color)
    toggleAttribute('data-sidenav-size', layout.value.sidenav.size)
    toggleAttribute('dir', layout.value.position === 'rtl-mode' ? 'rtl' : 'ltr')
  }

  const setTheme = (nTheme: LayoutThemeType) => {
    const res = nTheme === 'system' ? systemTheme.value : nTheme
    toggleAttribute('data-theme', res)
    layout.value.theme = nTheme
  }

  const setPosition = (nPos: LayoutDirectionType) => {
    toggleAttribute('dir', nPos === 'rtl-mode' ? 'rtl' : 'ltr')
    layout.value.position = nPos
  }

  return {
    layout,
    setSideNavSize,
    toggleMobileMenu,
    closeAllMenus,
    setTheme,
    setPosition,
    init,
    isCustomizerOpen
  }
}, {
  persist: {
    pick: ['layout.theme', 'layout.sidenav', 'layout.position']
  }
})
