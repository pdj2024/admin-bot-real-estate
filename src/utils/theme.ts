export interface AppSettings {
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

export const generateDynamicPalette = (primary: string, secondary: string) => {
  return {
    50: adjustColor(primary, 95),
    100: adjustColor(primary, 90),
    200: adjustColor(primary, 70),
    300: secondary, // Secondary Color patokan bejo-300
    400: adjustColor(primary, 30),
    500: primary,   // Primary Color patokan bejo-500
    600: adjustColor(primary, -15),
    700: adjustColor(primary, -30),
    800: adjustColor(primary, -45),
    900: adjustColor(primary, -60),
    1000: adjustColor(primary, -80),
  }
}

export const applyToDOM = (config: AppSettings) => {
  const root = document.documentElement

  root.setAttribute('data-sidenav-size', config.sidenavSize)

  root.style.setProperty('--color-primary', config.colorPrimary)
  root.style.setProperty('--color-secondary', config.colorSecondary)
  root.style.setProperty(
    '--background-image-primary-gradient',
    `linear-gradient(135deg, ${config.colorPrimary} 0%, ${config.colorSecondary} 100%)`
  )

  const dynamicPalette = generateDynamicPalette(config.colorPrimary, config.colorSecondary)
  Object.entries(dynamicPalette).forEach(([shade, hexValue]) => {
    root.style.setProperty(`--color-bejo-${shade}`, hexValue)
    root.style.setProperty(`--text-bejo-${shade}`, hexValue)
  })
}
