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

  // --- CUSTOMIZER STATE & ACTIONS (Ditambahkan kembali) ---
  const isCustomizerOpen = ref(false)
  const toggleCustomizer = () => {
    isCustomizerOpen.value = !isCustomizerOpen.value
  }
  const customizer = { isCustomizerOpen, toggleCustomizer }

  const setSideNavColor = (nColor: SideNavType['color'], persist = true) => {
    toggleAttribute('data-sidenav-color', nColor)
    if (persist) layout.value.sidenav = { ...layout.value.sidenav, color: nColor }
  }

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

  // --- RESET ACTION (Ditambahkan kembali) ---
  const reset = () => {
    setTheme(INIT_STATE.theme)
    setSideNavColor(INIT_STATE.sidenav.color)
    setSideNavSize(INIT_STATE.sidenav.size)
    setPosition(INIT_STATE.position)
  }

  return {
    layout,
    setSideNavColor,
    setSideNavSize,
    toggleMobileMenu,
    closeAllMenus,
    setTheme,
    setPosition,
    init,
    isCustomizerOpen,
    customizer, // Di-return agar index.vue tidak error
    reset       // Di-return agar index.vue tidak error
  }
}, {
  persist: {
    pick: ['layout.theme', 'layout.sidenav', 'layout.position']
  }
})
