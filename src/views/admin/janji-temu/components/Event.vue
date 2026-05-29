<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { jsPDF } from 'jspdf'
import { Icon } from '@iconify/vue'
import { confirm, success, fail } from '@/utils/sweet-alert'
import api from '@/services/axios'

import { useSettings } from '@/stores/settings'

const props = defineProps<{ openAppointment: boolean; appointment: any; appointments: any[] }>()
const emit = defineEmits(['close', 'refresh', 'openChat'])

const settingsStore = useSettings()
const productData = ref<any>(null)
const isLoadingProduct = ref(false)
const isSendingBrochure = ref(false)
const isCancelling = ref(false)
const cancelReason = ref('')

const getTimelineChain = (current: any) => {
  if (!current || !props.appointments) return []
  const chain: any[] = []
  let item = current
  const visited = new Set()
  while (item) {
    if (visited.has(item.No_Id)) break
    visited.add(item.No_Id)
    chain.unshift(item)
    if (!item.Id_Janji_Lama) break
    const parent = props.appointments.find((a) => a.No_Id === item.Id_Janji_Lama)
    if (!parent) break
    item = parent
  }
  return chain
}

const timelineChain = computed(() => getTimelineChain(props.appointment))
const showTimelineDropdown = ref(false)
const triggerRect = ref<DOMRect | null>(null)
const timelineButtonRef = ref<HTMLElement | null>(null)

const dropdownStyle = computed(() => {
  if (!triggerRect.value) return {}

  const rect = triggerRect.value
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  // Default positioning (below the button)
  const top = rect.bottom + 6
  let left = rect.right - 288 // 288px is the width of the popover (w-72)

  // On mobile screens, keep the popup within horizontal viewport boundaries
  if (window.innerWidth < 640) {
    const popoverWidth = 288
    left = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, rect.left + rect.width / 2 - popoverWidth / 2))
  }

  // If not enough space below, render above the button
  if (spaceBelow < 320 && spaceAbove > spaceBelow) {
    return {
      bottom: `${window.innerHeight - rect.top + 6}px`,
      left: `${left}px`,
      maxHeight: `${Math.max(150, Math.min(320, spaceAbove - 20))}px`
    }
  }

  return {
    top: `${top}px`,
    left: `${left}px`,
    maxHeight: `${Math.max(150, Math.min(320, spaceBelow - 20))}px`
  }
})

const updateDropdownPosition = () => {
  if (showTimelineDropdown.value && timelineButtonRef.value) {
    triggerRect.value = timelineButtonRef.value.getBoundingClientRect()
  }
}

const toggleTimelineDropdown = () => {
  showTimelineDropdown.value = !showTimelineDropdown.value
  if (showTimelineDropdown.value && timelineButtonRef.value) {
    triggerRect.value = timelineButtonRef.value.getBoundingClientRect()
  } else {
    triggerRect.value = null
  }
}

const headerBgClass = computed(() => {
  const status = props.appointment?.Status_Progress
  if (status === 'batal') return 'bg-red-500'
  if (status === 'selesai') return 'bg-emerald-700' // Dark Green (emerald-700)
  if (status === 'proses') return 'bg-amber-800' // Brown (amber-800)
  if (status === 'dikonfirmasi') return 'bg-bejo-500' // Orange Bejo (bejo-500)
  return 'bg-blue-500' // 'baru' / default
})

const statusBadgeClass = computed(() => {
  const status = props.appointment?.Status_Progress
  if (status === 'batal') return 'text-red-600'
  if (status === 'selesai') return 'text-emerald-800' // Dark Green (emerald-800)
  if (status === 'proses') return 'text-amber-900' // Brown (amber-900)
  if (status === 'dikonfirmasi') return 'text-bejo-600' // Orange Bejo (bejo-600)
  return 'text-blue-600'
})

const getStatusLabel = (status: string) => {
  if (status === 'baru') return 'pengajuan'
  if (status === 'selesai') return 'selesai'
  return status
}

const getBase64ImageFromUrl = async (imageUrl: string, maxWidth = 1024, format = 'image/jpeg'): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (maxWidth / width) * height
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(null)
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL(format, format === 'image/jpeg' ? 0.8 : undefined))
    }
    img.onerror = () => {
      resolve(null)
    }
    img.src = imageUrl
  })
}

const sendBrochure = async () => {
  if (!productData.value) return

  isSendingBrochure.value = true
  try {
    const doc = new jsPDF({
      orientation: 'l',
      unit: 'mm',
      format: 'a4',
      compress: true
    })
    const width = 297
    const height = 210

    const primaryColor = '#EB701F'
    const darkOrange = '#c2410c'
    const slateColor = '#0f172a'

    doc.setFillColor(255, 255, 255)
    doc.rect(0, 0, width, height, 'F')

    const validMedia = (productData.value.MediaUrls || []).filter((m: any) => {
      const url = (m.ThumbUrl || m.Id_Media || '').toLowerCase()
      return !url.endsWith('.mp4') && !url.endsWith('.mov') && !url.endsWith('.avi')
    })

    // Resolve Media IDs to URLs if needed
    const mediaToFetch = validMedia.map((m: any) => m.ThumbUrl || m.Id_Media).filter((src: string) => src && !src.startsWith('http') && !src.startsWith('data:'))
    let resolvedUrls: Record<string, string> = {}

    if (mediaToFetch.length > 0) {
      try {
        const { data } = await api.post('/api/mediacloud/read-url-batch', { ids: mediaToFetch }, { headers: { 'X-Jenis-User': 'admin' } })
        resolvedUrls = Object.entries(data?.success || {}).reduce((acc: any, [id, val]: any) => {
          acc[id] = val.Url
          return acc
        }, {})
      } catch (err) {
        console.error('Failed to resolve media URLs:', err)
      }
    }

    const images = []
    for (let i = 0; i < Math.min(validMedia.length, 3); i++) {
      const src = validMedia[i].ThumbUrl || validMedia[i].Id_Media
      const url = resolvedUrls[src] || src
      const img = await getBase64ImageFromUrl(url)
      if (img) images.push(img)
    }

    let logoBase64 = null
    const logoSrc = (settingsStore.business.Logo_Company || settingsStore.business.Id_Logo_Company) as string
    if (logoSrc) {
      let logoUrl = logoSrc
      if (!logoSrc.startsWith('http') && !logoSrc.startsWith('data:')) {
        try {
          const { data } = await api.post('/api/mediacloud/read-url-batch', { ids: [logoSrc] }, { headers: { 'X-Jenis-User': 'admin' } })
          logoUrl = data?.success?.[logoSrc]?.Url || logoSrc
        } catch {}
      }
      logoBase64 = await getBase64ImageFromUrl(logoUrl, 1024, 'image/png')
    }

    const currentUrl = `https://wabotui.padajaya.biz.id/detail/${productData.value.Slug}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}`
    const qrBase64 = await getBase64ImageFromUrl(qrUrl)

    // Helpers
    const drawDots = (x: number, y: number, rows: number, cols: number) => {
      doc.setFillColor(226, 232, 240)
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          doc.circle(x + j * 3.5, y + i * 3.5, 0.6, 'F')
        }
      }
    }

    const col1X = 15
    const col2X = 110
    const col3X = 215

    // --- COLUMN 1 ---
    doc.setFillColor(primaryColor)
    doc.roundedRect(-10, -10, 50, 50, 10, 10, 'F')

    // Logo container
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(3, 3, 29, 29, 4, 4, 'F')

    if (logoBase64) {
      doc.addImage(logoBase64 as string, 'PNG', 5, 5, 25, 25)
    } else {
      // Draw home icon
      doc.setDrawColor(212, 175, 55) // #d4af37 (Gold)
      doc.setLineWidth(0.8)
      doc.line(9, 17, 17.5, 9.5)
      doc.line(17.5, 9.5, 26, 17)
      doc.line(11, 16.5, 11, 25)
      doc.line(11, 25, 24, 25)
      doc.line(24, 25, 24, 16.5)

      // Fallback text (appName/company name abbreviated or initials)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(212, 175, 55)
      const appName = settingsStore.business.appName || 'RUMAH BEJO'
      const dispText = appName.length > 8 ? appName.substring(0, 7) + '.' : appName
      doc.text(dispText.toUpperCase(), 17.5, 28, { align: 'center' })
    }

    // --- COLUMN 2 IMAGE (RENDERED FIRST TO PREVENT WHITE MASK OVERLAP) ---
    const centerX = col2X + 35
    const centerY = 58
    const rad = 35

    drawDots(125, 12, 6, 9) // match top dots grid: width 28, height 17.5 at (125, 12)

    if (images[1]) {
      doc.addImage(images[1] as string, 'JPEG', centerX - rad, centerY - rad, rad * 2, rad * 2, undefined, 'FAST')
      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(25)
      doc.circle(centerX, centerY, rad + 12, 'S')

      doc.setDrawColor(primaryColor)
      doc.setLineWidth(1.5)
      doc.circle(centerX, centerY, rad + 1.75, 'S') // HTML: left -1.75mm offset
      doc.setLineWidth(0.8)
      doc.circle(centerX, centerY, rad + 5.4, 'S') // HTML: left -5.4mm offset
    }

    doc.setFont('helvetica', 'bold')
    const maxTitleWidth = 90
    let titleFontSize = 26
    doc.setFontSize(titleFontSize)
    const propName = (productData.value.Nama_Produk || 'Properti').toUpperCase()
    let tLines = doc.splitTextToSize(propName, maxTitleWidth)

    if (tLines.length > 2) {
      titleFontSize = 20
      doc.setFontSize(titleFontSize)
      tLines = doc.splitTextToSize(propName, maxTitleWidth)
    }
    if (tLines.length > 3) {
      titleFontSize = 16
      doc.setFontSize(titleFontSize)
      tLines = doc.splitTextToSize(propName, maxTitleWidth)
    }
    if (tLines.length > 4) {
      titleFontSize = 14
      doc.setFontSize(titleFontSize)
      tLines = doc.splitTextToSize(propName, maxTitleWidth)
    }
    if (tLines.length > 5) {
      tLines = tLines.slice(0, 5)
    }

    doc.setTextColor(slateColor)
    let currentTitleY = 55
    const titleLineStep = titleFontSize * 0.35 + 2
    tLines.forEach((line: string) => {
      doc.text(line, col1X, currentTitleY)
      currentTitleY += titleLineStep
    })

    const subTitleY = currentTitleY + 2
    doc.setFontSize(10)
    doc.setTextColor(primaryColor)
    doc.text(`Tawaran Eksklusif dari ${settingsStore.business.appName || 'Rumah Rejeki'}`, col1X, subTitleY)

    const spY = Math.max(80, subTitleY + 12)
    doc.setFillColor(darkOrange)
    doc.roundedRect(col1X, spY, 65, 10, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8.5)
    doc.text('MENGAPA MEMILIH KAMI?', col1X + 32.5, spY + 6.5, { align: 'center' })

    doc.setTextColor(slateColor)
    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'normal')
    let aY = spY + 16
    const pts = productData.value.Akses_Jalan || ['3 Menit ke Pondok Indah Mall', '5 Menit ke RS Pondok Indah', '10 Menit ke Tol JORR', '5 Menit ke Jakarta Intercultural School']
    pts.slice(0, 4).forEach((p: string) => {
      // Circle
      doc.setDrawColor(primaryColor)
      doc.setLineWidth(0.5)
      doc.circle(col1X + 4, aY - 1.5, 2.5, 'S')

      // Checkmark: path starts relative to box
      doc.line(col1X + 3, aY - 1.5, col1X + 3.8, aY - 0.75)
      doc.line(col1X + 3.8, aY - 0.75, col1X + 5, aY - 2.25)

      const pLines = doc.splitTextToSize(p, 72)
      doc.text(pLines, col1X + 10, aY)
      aY += pLines.length * 3.5 + 3.5 // margin-bottom: 3.5mm in HTML
    })

    const imgY = Math.max(135, aY)

    // Outer white container with orange border
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(primaryColor)
    doc.setLineWidth(1)
    doc.roundedRect(col1X, imgY, 80, 50, 4, 4, 'FD')

    if (images[0]) {
      try {
        // Image is inset by 2.5mm inside the 80x50 border
        doc.addImage(images[0] as string, 'JPEG', col1X + 2.5, imgY + 2.5, 75, 45, undefined, 'FAST')

        // Mask image sharp corners to give a border-radius: 2mm effect
        doc.setDrawColor(255, 255, 255)
        doc.setLineWidth(3) // 3mm border width to overlap edges
        doc.roundedRect(col1X + 2.5, imgY + 2.5, 75, 45, 2, 2, 'S')
      } catch {}
    }

    // --- COLUMN 2 CONTENT ---
    const fY = 115
    doc.setFillColor(primaryColor)
    doc.roundedRect(115, fY, 60, 10, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.text('FASILITAS LENGKAP', 145, fY + 6.5, { align: 'center' })

    const details = [
      { label: 'Tipe', value: productData.value.Tipe || '-' },
      { label: 'Lantai', value: productData.value.Jumlah_Lantai || '-' },
      { label: 'Kamar Tidur', value: productData.value.Jumlah_Kamar_Tidur || '-' },
      { label: 'Kamar Mandi', value: productData.value.Jumlah_Kamar_Mandi || '-' },
      { label: 'Carport', value: productData.value.Jumlah_Carpot || '-' },
      { label: 'Listrik', value: productData.value.Daya_Listrik ? `${productData.value.Daya_Listrik} VA` : '-' }
    ].filter((d) => !(d.label === 'Lantai' && (d.value === '-' || !d.value)))

    details.forEach((item, index) => {
      const isRight = index % 2 === 1
      const xCircle = isRight ? 150 : 112
      const xText = isRight ? 154 : 116
      const y = 135 + Math.floor(index / 2) * 10

      doc.setFillColor(darkOrange)
      doc.circle(xCircle, y - 1.2, 1, 'F') // 1mm radius dot

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(slateColor)
      doc.text(`${item.label}: ${item.value}`, xText, y)
    })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('HUNIAN MODERN & STRATEGIS', col2X + 35, 178, { align: 'center' })

    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8.5)
    doc.setTextColor(primaryColor)
    doc.text('Investasi terbaik di lokasi strategis', col2X + 35, 182, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(slateColor)
    doc.text(productData.value.Keterangan || 'Mansion megah bergaya arsitektur klasik Eropa yang dilengkapi kolam renang pribadi dan interior mewah berlapis marmer Italia.', col2X, 187, { maxWidth: 70, align: 'justify', lineHeightFactor: 1.45 })

    // --- COLUMN 3 ---
    doc.setFillColor(darkOrange)
    doc.roundedRect(225, 30, 45, 9, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.text('PENAWARAN TERBATAS', 247.5, 36, { align: 'center' })

    let pY = 48
    const hasJual = productData.value.Harga_Jual1 > 0 || productData.value.Harga_Jual2 > 0
    const hasSewa = productData.value.Harga_Sewa1 > 0 || productData.value.Harga_Sewa2 > 0
    const isBoth = hasJual && hasSewa

    if (isBoth) {
      // --- DUAL PRICE LAYOUT ---
      // 1. HARGA JUAL
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(slateColor)
      doc.text('HARGA JUAL:', col3X, pY)

      pY += 3.5
      const oldJual = productData.value.Harga_Jual1
      const finalJual = productData.value.Harga_Jual2
      const hasPromoJual = settingsStore.app.viewDiscount && oldJual > 0 && finalJual && finalJual > 0 && oldJual !== finalJual

      if (hasPromoJual) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor('#9ca3af') // Gray-400
        const opStr = `Rp ${formatPrice(oldJual)}`
        doc.text(opStr, col3X, pY)

        // Strikethrough
        const tw = doc.getTextWidth(opStr)
        doc.setDrawColor('#000000')
        doc.setLineWidth(0.4)
        doc.line(col3X - 0.5, pY - 1, col3X + tw + 0.5, pY - 1)

        // Promo Badge
        doc.setFillColor('#cbd5e1') // bg-slate-300
        doc.roundedRect(col3X + tw + 2, pY - 3, 11, 4, 0.8, 0.8, 'F')
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(6)
        doc.text('PROMO', col3X + tw + 7.5, pY - 0.2, { align: 'center' })

        pY += 6.5
      } else {
        pY += 1.5
      }

      // Final Price Jual
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(primaryColor)
      doc.text(`Rp ${formatPrice(hasPromoJual ? finalJual : oldJual)}`, col3X, pY)

      pY += 5

      // Divider 1
      doc.setDrawColor('#e2e8f0')
      doc.setLineWidth(0.5)
      doc.line(col3X, pY, col3X + 65, pY)

      pY += 5

      // 2. HARGA SEWA
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(slateColor)
      doc.text('HARGA SEWA:', col3X, pY)

      pY += 3.5
      const oldSewa = productData.value.Harga_Sewa1
      const finalSewa = productData.value.Harga_Sewa2
      const hasPromoSewa = settingsStore.app.viewDiscount && oldSewa > 0 && finalSewa && finalSewa > 0 && oldSewa !== finalSewa

      if (hasPromoSewa) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor('#9ca3af') // Gray-400
        const opStr = `Rp ${formatPrice(oldSewa)}`
        doc.text(opStr, col3X, pY)

        // Strikethrough
        const tw = doc.getTextWidth(opStr)
        doc.setDrawColor('#000000')
        doc.setLineWidth(0.4)
        doc.line(col3X - 0.5, pY - 1, col3X + tw + 0.5, pY - 1)

        // Promo Badge
        doc.setFillColor('#cbd5e1') // bg-slate-300
        doc.roundedRect(col3X + tw + 2, pY - 3, 11, 4, 0.8, 0.8, 'F')
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(6)
        doc.text('PROMO', col3X + tw + 7.5, pY - 0.2, { align: 'center' })

        pY += 6.5
      } else {
        pY += 1.5
      }

      // Final Price Sewa
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(primaryColor)
      const fsStr = `Rp ${formatPrice(hasPromoSewa ? finalSewa : oldSewa)}`
      doc.text(fsStr, col3X, pY)

      const fsWidth = doc.getTextWidth(fsStr)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(slateColor)
      doc.text(productData.value.Satuan_Minimal_Sewa ? `/ ${productData.value.Satuan_Minimal_Sewa}` : '/ Tahun', col3X + fsWidth + 2, pY)

      pY += 5

      // Divider 2
      doc.setDrawColor('#e2e8f0')
      doc.setLineWidth(0.5)
      doc.line(col3X, pY, col3X + 65, pY)

      pY += 7
    } else {
      // --- SINGLE PRICE LAYOUT ---
      const label = 'DENGAN HANYA'
      const oldP = hasJual ? productData.value.Harga_Jual1 : productData.value.Harga_Sewa1
      const finalP = hasJual ? productData.value.Harga_Jual2 : productData.value.Harga_Sewa2
      const isSewa = hasSewa

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      doc.setTextColor(slateColor)
      doc.text(label, col3X, pY)

      pY += 4.5

      const hasPromo = settingsStore.app.viewDiscount && oldP > 0 && finalP && finalP > 0 && oldP !== finalP

      if (hasPromo) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor('#9ca3af') // Gray-400
        const opStr = `Rp ${formatPrice(oldP)}`
        doc.text(opStr, col3X, pY)

        // Strikethrough
        const tw = doc.getTextWidth(opStr)
        doc.setDrawColor('#000000')
        doc.setLineWidth(0.4)
        doc.line(col3X - 0.5, pY - 1, col3X + tw + 0.5, pY - 1)

        // Promo Badge
        doc.setFillColor('#cbd5e1') // bg-slate-300
        doc.roundedRect(col3X + tw + 2, pY - 3, 11, 4, 0.8, 0.8, 'F')
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(6)
        doc.text('PROMO', col3X + tw + 7.5, pY - 0.2, { align: 'center' })

        pY += 9.5
      } else {
        pY += 1.5
      }

      // Final Price
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(24)
      doc.setTextColor(primaryColor)
      const finalPStr = `Rp ${formatPrice(hasPromo ? finalP : oldP)}`
      doc.text(finalPStr, col3X, pY)

      if (isSewa) {
        const fsWidth = doc.getTextWidth(finalPStr)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(slateColor)
        doc.text(productData.value.Satuan_Minimal_Sewa ? `/ ${productData.value.Satuan_Minimal_Sewa}` : '/ Tahun', col3X + fsWidth + 2, pY - 1)
      }

      pY += 18

      // Divider
      doc.setDrawColor('#e2e8f0')
      doc.setLineWidth(0.5)
      doc.line(col3X, pY, col3X + 65, pY)

      pY += 7
    }

    doc.setTextColor('#64748b')
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.text('• UNIT TERBATAS & EKSKLUSIF', col3X, pY)
    doc.text('• BEBAS BIAYA SURAT-SURAT', col3X, pY + 6.5)

    drawDots(275, 95, 7, 5) // match right dots grid: width 14, height 21 at (275, 95)

    if (qrBase64) {
      doc.addImage(qrBase64 as string, 'PNG', 230, 120, 35, 35)
      doc.setFontSize(8)
      doc.setTextColor(primaryColor)
      doc.setFont('helvetica', 'bold')
      doc.text('SCAN UNTUK DETAIL UNIT', 247.5, 160, { align: 'center' })
    }

    doc.setFillColor(primaryColor)
    doc.roundedRect(195, height - 45, 120, 60, 10, 10, 'F')
    doc.setFillColor('#f97316')
    doc.circle(width, height, 30, 'F')
    doc.setFillColor(255, 255, 255)
    doc.circle(width, height, 15, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('HUBUNGI KAMI SEGERA', 210, height - 26.2)
    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'bold')

    let waNum = String(settingsStore.business.whatsapp || '')
    if (waNum && !waNum.startsWith('+')) {
      waNum = '+' + waNum
    }
    const waY = height - 19.4
    doc.text(`WhatsApp: ${waNum}`, 210, waY)
    const webY = height - 14.6
    doc.text(`Website: wabotui.padajaya.biz.id`, 210, webY)

    // Decorative Blobs
    doc.setGState(new (doc as any).GState({ opacity: 0.1 }))
    doc.setFillColor(primaryColor)
    doc.circle(width * 0.5, height * 0.9, 40, 'F')
    doc.circle(width * 0.1, height * 0.5, 25, 'F')
    doc.circle(width * 0.9, height * 0.2, 30, 'F')
    doc.setGState(new (doc as any).GState({ opacity: 1.0 }))

    const pdfBase64 = doc.output('datauristring')
    const phoneNumber = props.appointment.Telepon_Customer || props.appointment.Id_Customer
    let fPhone = phoneNumber.replace(/\D/g, '')
    if (fPhone.startsWith('0')) fPhone = '62' + fPhone.substring(1)

    const brochureCaption = `Halo *${props.appointment.Nama_Display_Customer || props.appointment.Nama_Customer}*,\n\nBerikut adalah brosur digital untuk unit *${productData.value.Nama_Produk}*.\n\nMengingatkan kembali, janji temu Bapak/Ibu dijadwalkan pada:\n🗓️ *${new Date(props.appointment.Tanggal_Janji).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}*\n⏰ *${props.appointment.Waktu_Janji} WIB*\n\nSampai jumpa di lokasi!`

    await api.post('/api/waha/send-document', {
      PhoneNumber: fPhone + '@s.whatsapp.net',
      FileUrl: pdfBase64,
      FileName: `Brosur_Properti_${productData.value.Nama_Produk.replace(/\s+/g, '_')}.pdf`,
      Caption: brochureCaption
    })

    // Simpan log ke DB Chat agar muncul di history
    try {
      const myId = localStorage.getItem('no_id') || ''
      const now = new Date()
      const sentAt = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 19)

      const userIds = [props.appointment.Id_Customer, 'adm_bot']
      if (myId && !userIds.includes(myId)) userIds.push(myId)

      const payload = {
        Chat: {
          Jenis_Pesan: 'brochure',
          Sent_At: sentAt,
          Sender_Id: myId,
          Tipe_User: 'admin',
          Message: brochureCaption,
          Id_Paket: null,
          No_Pesanan: null,
          No_Penawaran: String(productData.value.No_Id || productData.value.Id_Paket),
          Send_Status: 'send'
        },
        Room_Id: props.appointment.Room_Id || '',
        User_Ids: userIds
      }

      await api.post('/api/chat/create', payload, { headers: { 'X-Jenis-User': 'Admin' } })
    } catch (err) {
      console.warn('Gagal mencatat log brosur ke DB Chat:', err)
    }
    success('Brosur properti berhasil dikirim ke WhatsApp Customer')
  } catch (error) {
    console.error('Gagal mengirim brosur:', error)
    fail('Gagal mengirim brosur. Silakan coba lagi.')
  } finally {
    isSendingBrochure.value = false
  }
}

const fetchProductDetails = async () => {
  if (!props.appointment?.Id_Produk) return
  isLoadingProduct.value = true
  try {
    const { data } = await api.get(`/api/realEstate/getAll?no_id=${props.appointment.Id_Produk}`)
    productData.value = data.Data?.[0] || null
  } catch (error) {
    console.error('Gagal mengambil detail produk:', error)
  } finally {
    isLoadingProduct.value = false
  }
}

watch(
  () => props.appointment?.No_Id,
  async () => {
    isCancelling.value = false
    cancelReason.value = ''
    await settingsStore.init()
    fetchProductDetails()
  },
  { immediate: true }
)

const formatPrice = (price: number) => {
  if (!price) return 'N/A'
  if (price >= 1000000000) {
    const val = price / 1000000000
    const rounded = Math.round(val * 100) / 100
    return rounded.toString() + ' M'
  }
  if (price >= 1000000) {
    const val = price / 1000000
    const rounded = Math.round(val * 100) / 100
    return rounded.toString() + ' Jt'
  }
  if (price >= 1000) {
    const val = price / 1000
    const rounded = Math.round(val * 100) / 100
    return rounded.toString() + ' Rb'
  }
  return price.toString()
}

const openReschedule = ref(false)
const selectedDate = ref('')
const startTime = ref('')
const endTime = ref('')
const rescheduleReason = ref('Reschedule by Admin')

const saveReschedule = async () => {
  try {
    await api.put(
      `/api/janjiTemu/reschedule?no_id=${props.appointment.No_Id}`,
      {
        Tanggal_Janji: selectedDate.value,
        Waktu_Janji: startTime.value,
        Waktu_Selesai: endTime.value || null,
        Alasan_Batal: rescheduleReason.value
      },
      {
        headers: { 'X-Jenis-User': 'admin' }
      }
    )
    success('Jadwal berhasil diperbarui')
    openReschedule.value = false
    rescheduleReason.value = 'Reschedule by Admin'
    emit('refresh')
  } catch {
    fail('Gagal memperbarui jadwal')
  }
}

const showMoreActions = ref(false)

const handleUpdateStatus = async (status: string) => {
  try {
    if (status === 'dikonfirmasi') {
      const adminId = localStorage.getItem('no_id') || ''
      await api.put(`/api/janjiTemu/confirm?no_id=${props.appointment.No_Id}`, { Id_Admin: adminId })
    } else {
      const payload = {
        ...props.appointment,
        Status_Progress: status,
        Tanggal_Janji: null,
        Waktu_Janji: null,
        Waktu_Mulai: null,
        Waktu_Selesai: null
      }
      await api.put(`/api/janjiTemu/update?no_id=${props.appointment.No_Id}`, payload)
    }
    success(`Status berhasil diperbarui menjadi ${status}`)
    emit('refresh')
    emit('close')
  } catch (error) {
    console.error('Gagal memperbarui status:', error)
    fail('Gagal memperbarui status janji temu')
  }
}

const cancelAppointment = () => {
  showMoreActions.value = false
  isCancelling.value = true
  cancelReason.value = ''
}

const submitCancellation = async () => {
  if (!cancelReason.value.trim()) return
  try {
    const payload = {
      ...props.appointment,
      Status_Progress: 'batal',
      Alasan_Batal: cancelReason.value,
      Tanggal_Janji: null,
      Waktu_Janji: null,
      Waktu_Selesai: null
    }
    await api.put(`/api/janjiTemu/update?no_id=${props.appointment.No_Id}`, payload)
    success('Janji temu telah dibatalkan')
    isCancelling.value = false
    cancelReason.value = ''
    emit('refresh')
    emit('close')
  } catch (error) {
    console.error('Gagal membatalkan janji temu:', error)
    fail('Gagal membatalkan janji temu')
  }
}

const handleDelete = async () => {
  confirm('Apakah Anda yakin ingin menghapus janji temu ini?', async () => {
    try {
      await api.delete(`/api/janjiTemu/delete?no_id=${props.appointment.No_Id}`, {
        headers: { 'X-Jenis-User': 'admin' }
      })
      success('Janji temu berhasil dihapus')
      emit('refresh')
      emit('close')
    } catch {
      fail('Gagal menghapus janji temu')
    }
  })
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  success('Berhasil disalin ke clipboard')
}

const openInMaps = (query: string, isCoord = false) => {
  const url = isCoord ? `https://www.google.com/maps?q=${query}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
  window.open(url, '_blank')
}
const dropdownRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  if (showTimelineDropdown.value && dropdownRef.value) {
    const target = event.target as HTMLElement
    const insideButton = timelineButtonRef.value && timelineButtonRef.value.contains(target)
    if (!dropdownRef.value.contains(target) && !insideButton) {
      showTimelineDropdown.value = false
      triggerRect.value = null
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', updateDropdownPosition)
  document.addEventListener('scroll', updateDropdownPosition, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', updateDropdownPosition)
  document.removeEventListener('scroll', updateDropdownPosition, true)
})
</script>

<template>
  <div v-if="props.openAppointment" class="h-full">
    <div class="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden h-full flex flex-col">
      <div class="relative p-8 pb-14 text-white transition-colors duration-500" :class="headerBgClass">
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-white/10"> #{{ props.appointment.No_Tracking }} </span>
            <button @click="copyToClipboard(props.appointment.No_Tracking)" class="text-white/40 hover:text-white transition-colors">
              <Icon icon="lucide:copy" class="size-3" />
            </button>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 bg-white rounded-full text-[9px] font-black uppercase tracking-[0.2em]" :class="statusBadgeClass">
              {{ getStatusLabel(props.appointment.Status_Progress) }}
            </span>
            <button @click="$emit('close')" class="size-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/5">
              <Icon icon="lucide:x" class="size-4" />
            </button>
          </div>
        </div>

        <div class="text-center">
          <div class="text-3xl font-black mb-1">
            {{ new Date(props.appointment.Tanggal_Janji).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }) }}
          </div>
          <p class="text-xs font-bold text-white/70 uppercase tracking-widest">{{ new Date(props.appointment.Tanggal_Janji).toLocaleDateString('id-ID', { weekday: 'long' }) }} • {{ props.appointment.Waktu_Janji }} WIB</p>
        </div>

        <div class="absolute -bottom-7 left-4 right-4 bg-white rounded-2xl p-3 flex items-center justify-between shadow-lg shadow-black/5 border border-slate-100/50">
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <div class="size-8 rounded-lg bg-bejo-600 text-white flex items-center justify-center font-black text-xs shrink-0">
              {{ (props.appointment.Nama_Customer || 'C').charAt(0) }}
            </div>
            <div class="flex flex-col min-w-0 flex-1">
              <span class="text-[8px] font-black text-bejo-400 uppercase tracking-tight">Customer</span>
              <span class="text-[10px] font-black text-slate-900 truncate" :title="props.appointment.Nama_Customer || props.appointment.Id_Customer">{{ props.appointment.Nama_Customer || props.appointment.Id_Customer }}</span>
            </div>
          </div>

          <div class="flex flex-col items-center px-1.5 shrink-0">
            <Icon icon="lucide:users" class="size-3.5 text-slate-300" />
          </div>

          <div class="flex items-center gap-2 text-right min-w-0 flex-1 justify-end">
            <div class="flex flex-col min-w-0 flex-1">
              <span class="text-[8px] font-black text-slate-400 uppercase tracking-tight">Admin</span>
              <span class="text-[10px] font-black text-slate-900 truncate" :title="props.appointment.Nama_Admin || props.appointment.Id_Admin || 'Admin'">{{ props.appointment.Nama_Admin || props.appointment.Id_Admin || 'Admin' }}</span>
            </div>
            <div class="size-8 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center font-black text-xs shrink-0">
              {{ (props.appointment.Nama_Admin || 'A').charAt(0) }}
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar pt-10">
        <div class="px-8 pb-8 space-y-6">
          <div class="grid grid-cols-2 gap-3">
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
              <div class="flex justify-between items-center mb-2">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Lokasi</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon icon="lucide:map-pin" class="size-3.5 text-bejo-500" />
                <span class="text-xs font-black text-slate-700 truncate">{{ props.appointment.Lokasi_Pertemuan }}</span>
              </div>
            </div>
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tipe</span>
              <div class="flex items-center gap-2">
                <Icon :icon="props.appointment.Tipe_Pertemuan === 'online' ? 'lucide:video' : 'lucide:users'" class="size-3.5 text-bejo-500" />
                <span class="text-xs font-black text-slate-700 capitalize">{{ props.appointment.Tipe_Pertemuan }}</span>
              </div>
            </div>
          </div>

          <div v-if="props.appointment.Keterangan" class="p-4 bg-amber-50/40 rounded-2xl border border-amber-100/60">
            <span class="text-[9px] font-black text-amber-600 uppercase tracking-widest block mb-1">Catatan Pertemuan</span>
            <p class="text-xs font-bold text-slate-700">"{{ props.appointment.Keterangan }}"</p>
          </div>

          <div v-if="props.appointment.Alasan_Batal" class="p-4 bg-red-50 rounded-2xl border border-red-100">
            <span class="text-[9px] font-black text-red-400 uppercase tracking-widest block mb-1">Alasan Batal</span>
            <p class="text-xs font-bold text-red-600 italic">"{{ props.appointment.Alasan_Batal }}"</p>
          </div>

          <div class="space-y-3">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Unit Properti</span>

            <div v-if="isLoadingProduct" class="h-20 bg-slate-50 rounded-2xl animate-pulse"></div>

            <a v-else-if="productData" :href="`/properti/${productData.Slug}`" target="_blank" class="flex gap-4 p-3 bg-white border border-slate-100 rounded-3xl hover:border-bejo-200 transition-all group cursor-pointer shadow-sm hover:shadow-md">
              <img v-if="productData.MediaUrls?.[0]?.ThumbUrl || productData.MediaUrls?.[0]?.Id_Media" :src="productData.MediaUrls[0].ThumbUrl || productData.MediaUrls[0].Id_Media" class="size-20 rounded-2xl object-cover shrink-0" />
              <div class="flex-1 min-w-0 flex flex-col justify-center">
                <h4 class="text-xs font-black text-slate-900 truncate group-hover:text-bejo-600 transition-colors">{{ productData.Nama_Produk }}</h4>
                <p class="text-[9px] font-medium text-slate-500 truncate mb-1.5">
                  {{ productData.Alamat }}<span v-if="productData.Nama_Kota">, {{ productData.Nama_Kota }}</span>
                </p>

                <div class="flex items-center gap-3 text-slate-400 mb-2">
                  <div v-if="productData.Jumlah_Kamar_Tidur" class="flex items-center gap-1">
                    <Icon icon="lucide:bed" class="size-3" />
                    <span class="text-[9px] font-bold">{{ productData.Jumlah_Kamar_Tidur }}</span>
                  </div>
                  <div v-if="productData.Jumlah_Kamar_Mandi" class="flex items-center gap-1">
                    <Icon icon="lucide:bath" class="size-3" />
                    <span class="text-[9px] font-bold">{{ productData.Jumlah_Kamar_Mandi }}</span>
                  </div>
                  <div v-if="productData.Jumlah_Carpot" class="flex items-center gap-1">
                    <Icon icon="lucide:car" class="size-3" />
                    <span class="text-[9px] font-bold">{{ productData.Jumlah_Carpot }}</span>
                  </div>
                </div>

                <div class="flex flex-col gap-1.5 mt-0.5">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-black text-emerald-600 whitespace-nowrap"> Rp {{ formatPrice(productData.Harga_Jual2 || productData.Harga_Sewa2 || productData.Harga_Jual1) }} </span>
                    <span class="text-[9px] font-black text-bejo-600 bg-bejo-50 px-2 py-0.5 rounded shrink-0">{{ productData.Tipe }}</span>
                  </div>
                  <button @click.stop.prevent="openInMaps(`${productData.Latitude},${productData.Longitude}`, true)" class="w-full text-center text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded flex items-center justify-center gap-1 hover:bg-emerald-100 transition-colors shrink-0"><Icon icon="lucide:navigation" class="size-2.5" /> Petunjuk Arah</button>
                </div>
              </div>
            </a>

            <div v-else class="text-[10px] font-bold text-slate-400 italic px-1">Produk: {{ props.appointment.Nama_Produk }}</div>
            <!-- Timeline Riwayat Janji Temu (Floating Dropdown) -->
            <div v-if="timelineChain.length > 1" class="relative pt-4 border-t border-slate-100 flex justify-between items-center">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1"> Status Jadwal </span>
              <div class="relative">
                <button ref="timelineButtonRef" @click="toggleTimelineDropdown()" class="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm" :class="{ 'bg-bejo-50 border-bejo-200 text-bejo-600': showTimelineDropdown }">
                  <Icon icon="lucide:clipboard-list" class="size-3.5" :class="showTimelineDropdown ? 'text-bejo-500' : 'text-slate-500'" />
                  Riwayat ({{ timelineChain.length }}x)
                  <Icon icon="lucide:chevron-down" class="size-3 transition-transform" :class="{ 'rotate-180': showTimelineDropdown }" />
                </button>

                <!-- Dropdown Content (Floating Popover - Teleported to avoid clipping) -->
                <Teleport to="body">
                  <div v-if="showTimelineDropdown && triggerRect" ref="dropdownRef" class="absolute bg-white rounded-2xl shadow-2xl border border-slate-100 p-4.5 z-[1060] w-72 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200 text-left" :style="dropdownStyle">
                    <span class="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-3 border-b border-slate-100 pb-2">Riwayat Reschedule</span>
                    <div class="relative pl-4 border-l border-slate-100 ml-1.5 space-y-4">
                      <div v-for="item in timelineChain" :key="item.No_Id" class="relative">
                        <!-- Dot -->
                        <div class="absolute -left-[21px] top-1 size-2.5 rounded-full border bg-white flex items-center justify-center z-10" :class="item.No_Id === props.appointment.No_Id ? 'border-bejo-500' : 'border-slate-300'">
                          <div class="size-1.5 rounded-full" :class="item.No_Id === props.appointment.No_Id ? 'bg-bejo-500 font-bold' : 'bg-slate-350'"></div>
                        </div>

                        <div class="p-3 rounded-xl border text-xs font-bold" :class="item.No_Id === props.appointment.No_Id ? 'bg-bejo-50/20 border-bejo-100' : 'bg-slate-50 border-slate-100 text-slate-600'">
                          <div class="flex justify-between items-center gap-1.5 mb-1.5 flex-wrap">
                            <span class="text-[10px] font-mono font-black text-slate-450">#{{ item.No_Tracking }}</span>
                            <span
                              class="px-1.5 py-0.5 rounded-[4px] text-[9px] font-black uppercase tracking-wider font-mono shrink-0"
                              :class="{
                                'bg-blue-50 text-blue-700': item.Status_Progress === 'baru',
                                'bg-bejo-50 text-bejo-700': item.Status_Progress === 'dikonfirmasi',
                                'bg-amber-100 text-amber-900': item.Status_Progress === 'proses',
                                'bg-emerald-50 text-emerald-800': item.Status_Progress === 'selesai',
                                'bg-red-50 text-red-700': item.Status_Progress === 'batal'
                              }"
                            >
                              {{ item.Status_Progress }}
                            </span>
                          </div>

                          <div class="flex flex-col gap-1 mt-1 text-xs text-slate-600">
                            <div class="flex items-center gap-1.5">
                              <Icon icon="lucide:calendar" class="size-3.5 text-slate-400" />
                              <span>{{ item.Tanggal_Janji.split('T')[0] }}</span>
                            </div>
                            <div class="flex items-center gap-1.5">
                              <Icon icon="lucide:clock" class="size-3.5 text-slate-400" />
                              <span>{{ item.Waktu_Janji }} WIB</span>
                            </div>
                          </div>

                          <div v-if="item.Alasan_Batal" class="mt-2 p-2 bg-red-50/50 rounded border border-red-100/50 text-[10.5px] font-bold text-red-650 italic leading-snug">"{{ item.Alasan_Batal }}"</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Teleport>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-6 bg-white border-t border-slate-100 shrink-0">
        <div v-if="isCancelling" class="space-y-4 animate-in fade-in duration-200">
          <div class="text-center space-y-1">
            <h4 class="text-lg font-black text-slate-800">Batalkan Janji Temu?</h4>
            <p class="text-xs font-bold text-slate-400">Masukkan alasan pembatalan</p>
          </div>
          <textarea v-model="cancelReason" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-400 focus:ring-red-400 rounded-2xl text-xs font-bold min-h-[90px] text-slate-700 outline-none transition-all placeholder:text-slate-350" placeholder="Contoh: User ganti jadwal atau tidak bisa dihubungi..."></textarea>
          <div class="flex items-center gap-3">
            <button @click="isCancelling = false" class="flex-1 py-3 bg-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors">Kembali</button>
            <button @click="submitCancellation" :disabled="!cancelReason.trim()" class="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-50">Ya, Batalkan!</button>
          </div>
        </div>

        <div v-else>
          <div class="grid grid-cols-2 gap-2 mb-3">
            <button @click="$emit('openChat', props.appointment.Id_Customer)" class="px-2 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 group whitespace-nowrap">
              <Icon icon="lucide:message-circle" class="size-3.5 group-hover:scale-110 transition-transform shrink-0" />
              Hubungi
            </button>
            <button v-if="props.appointment.Status_Progress !== 'batal'" @click="sendBrochure" :disabled="isSendingBrochure || !productData" class="px-2 py-2.5 bg-white hover:bg-bejo-50 text-bejo-600 border-2 border-bejo-100 hover:border-bejo-200 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 group disabled:opacity-50 whitespace-nowrap">
              <Icon v-if="isSendingBrochure" icon="lucide:loader-2" class="size-3.5 animate-spin shrink-0" />
              <Icon v-else icon="lucide:file-text" class="size-3.5 group-hover:scale-110 transition-transform shrink-0" />
              Kirim Brosur
            </button>
            <button v-else @click="handleDelete" class="px-2 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 whitespace-nowrap">
              <Icon icon="lucide:trash-2" class="size-3.5 shrink-0" />
              Hapus Data
            </button>
          </div>

          <div v-if="props.appointment.Status_Progress !== 'batal'" class="flex items-center gap-2.5">
            <div class="flex-1">
              <button v-if="props.appointment.Status_Progress === 'baru'" @click="handleUpdateStatus('dikonfirmasi')" class="w-full px-3.5 py-2.5 bg-bejo-500 hover:bg-bejo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                <Icon icon="lucide:check-circle" class="size-3.5" />
                Konfirmasi Janji
              </button>
              <button v-else-if="props.appointment.Status_Progress === 'dikonfirmasi'" @click="handleUpdateStatus('proses')" class="w-full px-3.5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                <Icon icon="lucide:play-circle" class="size-3.5" />
                Mulai Pertemuan
              </button>
              <button v-else-if="props.appointment.Status_Progress === 'proses'" @click="handleUpdateStatus('selesai')" class="w-full px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                <Icon icon="lucide:award" class="size-3.5" />
                Selesaikan
              </button>
              <div v-else class="w-full py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-center border border-emerald-100">Janji Temu Selesai</div>
            </div>

            <div v-if="props.appointment.Status_Progress !== 'selesai' && props.appointment.Status_Progress !== 'batal'" class="relative">
              <button @click="showMoreActions = !showMoreActions" class="size-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all flex items-center justify-center border border-slate-200/50">
                <Icon icon="lucide:more-horizontal" class="size-4.5" />
              </button>

              <div v-if="showMoreActions" class="absolute bottom-full right-0 mb-3 w-44 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <button @click="((selectedDate = props.appointment.Tanggal_Janji ? props.appointment.Tanggal_Janji.split('T')[0] : ''), (startTime = props.appointment.Waktu_Janji || ''), (endTime = props.appointment.Waktu_Selesai || ''), (openReschedule = true), (showMoreActions = false))" class="w-full px-4 py-2.5 text-left text-[11px] font-black text-slate-700 hover:bg-bejo-50 hover:text-bejo-600 transition-colors flex items-center gap-2.5 border-b border-slate-50">
                  <Icon icon="lucide:calendar-clock" class="size-3.5" />
                  Reschedule
                </button>
                <button @click="cancelAppointment" class="w-full px-4 py-2.5 text-left text-[11px] font-black text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2.5">
                  <Icon icon="lucide:ban" class="size-3.5" />
                  Batalkan Janji
                </button>
              </div>
              <div v-if="showMoreActions" @click="showMoreActions = false" class="fixed inset-0 z-40"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="openReschedule" class="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md">
      <div class="bg-white rounded-[2.5rem] w-full max-w-lg p-6 md:p-10 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
        <div class="flex justify-between items-center mb-6 shrink-0">
          <h4 class="text-xl font-black text-slate-900">Pilih Jadwal Baru</h4>
          <button @click="openReschedule = false" class="text-slate-400 hover:text-slate-900 transition-colors"><Icon icon="lucide:x" class="size-6" /></button>
        </div>
        <div class="flex-1 overflow-y-auto pr-1.5 custom-scrollbar space-y-6">
          <div class="space-y-6">
            <!-- Tanggal -->
            <div>
              <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Tanggal</label>
              <div class="relative">
                <input v-model="selectedDate" type="date" class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-bejo-500/20 focus:border-bejo-500 outline-none transition-all" />
                <Icon icon="lucide:calendar" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none" />
              </div>
            </div>

            <!-- Waktu Mulai & Waktu Selesai -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Waktu Mulai</label>
                <div class="relative">
                  <input v-model="startTime" type="time" class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-bejo-500/20 focus:border-bejo-500 outline-none transition-all" />
                  <Icon icon="lucide:clock" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none" />
                </div>
              </div>
              <div>
                <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Waktu Selesai</label>
                <div class="relative">
                  <input v-model="endTime" type="time" class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-bejo-500/20 focus:border-bejo-500 outline-none transition-all" />
                  <Icon icon="lucide:clock" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none" />
                </div>
              </div>
            </div>

            <!-- Alasan Perubahan Jadwal -->
            <div>
              <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Alasan Perubahan Jadwal</label>
              <textarea v-model="rescheduleReason" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold min-h-[80px] focus:ring-2 focus:ring-bejo-500/20 focus:border-bejo-500 outline-none transition-all" placeholder="Masukkan alasan reschedule..."></textarea>
            </div>
            <button @click="saveReschedule" class="w-full py-4 bg-bejo-500 hover:bg-bejo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-bejo-500/30 transition-all active:scale-[0.98]">Simpan Jadwal Baru</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
