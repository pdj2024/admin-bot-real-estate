export interface AppSettings {
  theme: 'light' | 'dark'
  sidenavSize: string
  colorPrimary: string
  colorSecondary: string
}

const hexToRgb = (hex: string): number[] => {
  let c = hex.replace('#', '')
  if (c.length === 3) c = c.split('').map(x => x + x).join('')
  const num = parseInt(c, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

const adjustColor = (hex: string, percentage: number): string => {
  const rgb = hexToRgb(hex)
  const w = Math.abs(percentage) / 100
  const targetRgb = percentage > 0 ? [255, 255, 255] : [0, 0, 0]

  const r = Math.round(rgb[0] + (targetRgb[0] - rgb[0]) * w)
  const g = Math.round(rgb[1] + (targetRgb[1] - rgb[1]) * w)
  const b = Math.round(rgb[2] + (targetRgb[2] - rgb[2]) * w)

  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`
}

export const generateDynamicPalette = (baseHex: string) => {
  return {
    50: adjustColor(baseHex, 90),
    100: adjustColor(baseHex, 80),
    200: adjustColor(baseHex, 60),
    300: adjustColor(baseHex, 40),
    400: adjustColor(baseHex, 20),
    500: adjustColor(baseHex, 10),
    600: baseHex,
    700: adjustColor(baseHex, -20),
    800: adjustColor(baseHex, -40),
    900: adjustColor(baseHex, -60),
    1000: adjustColor(baseHex, -80),
  }
}

export const applyToDOM = (config: AppSettings) => {
  const root = document.documentElement

  // (Catatan: Pastikan fungsi setSideNavSize & setTheme di-import jika berada di file lain)
  // setSideNavSize(config.sidenavSize)
  // setTheme(config.theme)

  root.setAttribute('data-sidenav-size', config.sidenavSize)

  if (config.theme === 'dark') {
    root.setAttribute('data-theme', 'dark')
    root.classList.add('dark')
  } else {
    root.setAttribute('data-theme', 'light')
    root.classList.remove('dark')
  }

  root.style.setProperty('--color-primary', config.colorPrimary)
  root.style.setProperty('--color-secondary', config.colorSecondary)
  root.style.setProperty(
    '--background-image-primary-gradient',
    `linear-gradient(135deg, ${config.colorPrimary} 0%, ${config.colorSecondary} 100%)`
  )

  const dynamicPalette = generateDynamicPalette(config.colorPrimary)
  Object.entries(dynamicPalette).forEach(([shade, hexValue]) => {
    root.style.setProperty(`--color-bejo-${shade}`, hexValue)
    root.style.setProperty(`--text-bejo-${shade}`, hexValue)
  })
}
