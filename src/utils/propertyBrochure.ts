import { jsPDF } from 'jspdf'
import api from '@/services/axios'

/**
 * Utility to generate a premium property brochure PDF
 */

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

const formatPriceShort = (price: number) => {
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
const drawPriceBlock = (
  doc: jsPDF,
  label: string,
  harga1: number,
  harga2: number,
  isSewa: boolean,
  satuanSewa: string,
  showPromo: boolean,
  startX: number,
  startY: number,
  isSingle: boolean
): number => {
  let y = startY

  // Label Harga
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(isSingle ? 9.5 : 8)
  doc.setTextColor(71, 85, 105) // slate-600 (softer color)
  doc.text(label.toUpperCase(), startX, y)
  y += 5.5

  const hasDiscount = harga2 > 0 && harga1 > 0 && harga2 !== harga1
  const hasPromo = showPromo && hasDiscount

  let displayPrice = harga1
  if (hasPromo) {
    displayPrice = harga2
  } else {
    if (!showPromo) {
      if (harga2 !== 0 && harga2 !== null && harga2 > 0) {
        displayPrice = harga2
      } else {
        displayPrice = harga1
      }
    } else {
      displayPrice = harga1
    }
  }

  if (hasPromo) {
    // 1. Old Price (Strikethrough)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor('#9ca3af') // Gray-400
    const opStr = `Rp ${formatPriceShort(harga1)}`
    doc.text(opStr, startX, y)

    const tw = doc.getTextWidth(opStr)

    // Black strikethrough line
    doc.setDrawColor('#000000')
    doc.setLineWidth(0.4)
    doc.line(startX - 0.5, y - 1, startX + tw + 0.5, y - 1)

    // 2. Promo Badge (Solid grey background, black text)
    const badgeW = 11
    const badgeH = 4
    const badgeX = startX + tw + 2
    const badgeY = y - 3

    doc.setFillColor('#cbd5e1') // bg-slate-300
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 0.8, 0.8, 'F')

    doc.setTextColor(0, 0, 0) // black text
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6)
    doc.text('PROMO', badgeX + badgeW / 2, y - 0.2, { align: 'center' })

    y += isSingle ? 9.5 : 6.5
  }

  // 3. Final Price
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(isSingle ? 22 : 17)
  doc.setTextColor(235, 112, 31) // #EB701F (primaryColor)
  
  const priceStr = `Rp ${formatPriceShort(displayPrice)}`
  doc.text(priceStr, startX, y)

  if (isSewa) {
    const pw = doc.getTextWidth(priceStr)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(71, 85, 105) // slate-600
    doc.text(satuanSewa || '/ Tahun', startX + pw + 2.5, y)
  }

  // Update Y coordinate after drawing this block
  y += isSingle ? 11 : 8.5
  return y
}

export const downloadBrochure = async (product: any, businessSettings: any, appSettings: any) => {
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

    const validMedia = (product.MediaUrls || []).filter((m: any) => {
      const url = (m.ThumbUrl || m.Id_Media || '').toLowerCase()
      return !url.endsWith('.mp4') && !url.endsWith('.mov') && !url.endsWith('.avi')
    })

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
    const logoSrc = (businessSettings.Logo_Company || businessSettings.Id_Logo_Company) as string
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

    const currentUrl = `https://wabotui.padajaya.biz.id/detail/${product.Slug}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}`
    const qrBase64 = await getBase64ImageFromUrl(qrUrl)

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
      const appName = businessSettings.appName || 'RUMAH BEJO'
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
    const propName = (product.Nama_Produk || 'Properti').toUpperCase()
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
    doc.text(`Tawaran Eksklusif dari ${businessSettings.appName || 'Rumah Rejeki'}`, col1X, subTitleY)

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
    const pts = product.Akses_Jalan || ['3 Menit ke Pondok Indah Mall', '5 Menit ke RS Pondok Indah', '10 Menit ke Tol JORR', '5 Menit ke Jakarta Intercultural School']
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
      { label: 'Tipe', value: product.Tipe || '-' },
      { label: 'Lantai', value: product.Jumlah_Lantai || '-' },
      { label: 'Kamar Tidur', value: product.Jumlah_Kamar_Tidur || '-' },
      { label: 'Kamar Mandi', value: product.Jumlah_Kamar_Mandi || '-' },
      { label: 'Carport', value: product.Jumlah_Carpot || '-' },
      { label: 'Listrik', value: product.Daya_Listrik ? `${product.Daya_Listrik} VA` : '-' }
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
    doc.text(product.Keterangan || 'Mansion megah bergaya arsitektur klasik Eropa yang dilengkapi kolam renang pribadi dan interior mewah berlapis marmer Italia.', col2X, 187, { maxWidth: 70, align: 'justify', lineHeightFactor: 1.45 })

    // --- COLUMN 3 ---
    doc.setFillColor(darkOrange)
    doc.roundedRect(225, 30, 45, 9, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.text('PENAWARAN TERBATAS', 247.5, 36, { align: 'center' })

    const showPromoFlag = !!(appSettings.View_Nilai_Diskon ?? appSettings.viewDiscount)
    const hasJual = product.Harga_Jual1 > 0 || product.Harga_Jual2 > 0
    const hasSewa = product.Harga_Sewa1 > 0 || product.Harga_Sewa2 > 0
    const isBoth = hasJual && hasSewa

    let pY = 48

    if (isBoth) {
      // ── DUAL: Jual + Sewa ────────────────────────────────────────────────
      pY = drawPriceBlock(doc, 'HARGA JUAL:', product.Harga_Jual1, product.Harga_Jual2, false, '', showPromoFlag, col3X, pY, false)

      // Divider (margin-top: 2mm, margin-bottom: 2mm)
      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.5)
      doc.line(col3X, pY - 2, col3X + 65, pY - 2)
      pY += 3

      pY = drawPriceBlock(doc, 'HARGA SEWA:', product.Harga_Sewa1, product.Harga_Sewa2, true, product.Satuan_Minimal_Sewa ? `/ ${product.Satuan_Minimal_Sewa}` : '/ Tahun', showPromoFlag, col3X, pY, false)

      // Divider (margin-top: 4mm)
      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.5)
      doc.line(col3X, pY, col3X + 65, pY)
      pY += 8
    } else {
      // ── SINGLE: Jual only or Sewa only ───────────────────────────────────
      const label = 'DENGAN HANYA'
      const oldP = hasJual ? product.Harga_Jual1 : product.Harga_Sewa1
      const finalP = hasJual ? product.Harga_Jual2 : product.Harga_Sewa2
      const isSewaType = hasSewa

      pY = drawPriceBlock(doc, label, oldP, finalP, isSewaType, product.Satuan_Minimal_Sewa ? `/ ${product.Satuan_Minimal_Sewa}` : '/ Tahun', showPromoFlag, col3X, pY, true)

      // Divider (margin-top: 15mm)
      pY += 6
      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.5)
      doc.line(col3X, pY, col3X + 65, pY)
      pY += 8
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

    let waNum = String(businessSettings.whatsapp || '')
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

    doc.save(`Brosur_Properti_${(product.Nama_Produk || 'Unit').replace(/\s+/g, '_')}.pdf`)
    return true
  } catch (error) {
    console.error('Download brochure error:', error)
    return false
  }
}
