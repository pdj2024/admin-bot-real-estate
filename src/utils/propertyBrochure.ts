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

    let pY = 48
    const hasJual = product.Harga_Jual1 > 0 || product.Harga_Jual2 > 0
    const hasSewa = product.Harga_Sewa1 > 0 || product.Harga_Sewa2 > 0
    const isBoth = hasJual && hasSewa

    if (isBoth) {
      // --- DUAL PRICE LAYOUT ---
      // 1. HARGA JUAL
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(slateColor)
      doc.text('HARGA JUAL:', col3X, pY)
      
      pY += 3.5
      const oldJual = product.Harga_Jual1
      const finalJual = product.Harga_Jual2
      const hasPromoJual = appSettings.viewDiscount && oldJual > 0 && finalJual && finalJual > 0 && oldJual !== finalJual
      
      if (hasPromoJual) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor('#9ca3af') // Gray-400
        const opStr = `Rp ${formatPriceShort(oldJual)}`
        doc.text(opStr, col3X, pY)
        
        // Strikethrough
        const tw = doc.getTextWidth(opStr)
        doc.setDrawColor('#ef4444')
        doc.setLineWidth(0.4)
        doc.line(col3X - 0.5, pY - 1, col3X + tw + 0.5, pY - 1)
        
        // Promo Badge
        doc.setFillColor('#ef4444')
        doc.roundedRect(col3X + tw + 2, pY - 3, 11, 4, 0.8, 0.8, 'F')
        doc.setTextColor(255, 255, 255)
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
      doc.text(`Rp ${formatPriceShort(finalJual || oldJual)}`, col3X, pY)
      
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
      const oldSewa = product.Harga_Sewa1
      const finalSewa = product.Harga_Sewa2
      const hasPromoSewa = appSettings.viewDiscount && oldSewa > 0 && finalSewa && finalSewa > 0 && oldSewa !== finalSewa
      
      if (hasPromoSewa) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor('#9ca3af') // Gray-400
        const opStr = `Rp ${formatPriceShort(oldSewa)}`
        doc.text(opStr, col3X, pY)
        
        // Strikethrough
        const tw = doc.getTextWidth(opStr)
        doc.setDrawColor('#ef4444')
        doc.setLineWidth(0.4)
        doc.line(col3X - 0.5, pY - 1, col3X + tw + 0.5, pY - 1)
        
        // Promo Badge
        doc.setFillColor('#ef4444')
        doc.roundedRect(col3X + tw + 2, pY - 3, 11, 4, 0.8, 0.8, 'F')
        doc.setTextColor(255, 255, 255)
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
      const finalSewaVal = finalSewa || oldSewa
      const fsStr = `Rp ${formatPriceShort(finalSewaVal)}`
      doc.text(fsStr, col3X, pY)
      
      const fsWidth = doc.getTextWidth(fsStr)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(slateColor)
      doc.text(product.Satuan_Minimal_Sewa ? `/ ${product.Satuan_Minimal_Sewa}` : '/ Tahun', col3X + fsWidth + 2, pY)
      
      pY += 5
      
      // Divider 2
      doc.setDrawColor('#e2e8f0')
      doc.setLineWidth(0.5)
      doc.line(col3X, pY, col3X + 65, pY)
      
      pY += 7
    } else {
      // --- SINGLE PRICE LAYOUT ---
      const label = 'DENGAN HANYA'
      const oldP = hasJual ? product.Harga_Jual1 : product.Harga_Sewa1
      const finalP = hasJual ? product.Harga_Jual2 : product.Harga_Sewa2
      const isSewa = hasSewa
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      doc.setTextColor(slateColor)
      doc.text(label, col3X, pY)
      
      pY += 4.5
      
      const hasPromo = appSettings.viewDiscount && oldP > 0 && finalP && finalP > 0 && oldP !== finalP
      
      if (hasPromo) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor('#9ca3af') // Gray-400
        const opStr = `Rp ${formatPriceShort(oldP)}`
        doc.text(opStr, col3X, pY)
        
        // Strikethrough
        const tw = doc.getTextWidth(opStr)
        doc.setDrawColor('#ef4444')
        doc.setLineWidth(0.4)
        doc.line(col3X - 0.5, pY - 1, col3X + tw + 0.5, pY - 1)
        
        // Promo Badge
        doc.setFillColor('#ef4444')
        doc.roundedRect(col3X + tw + 2, pY - 3, 11, 4, 0.8, 0.8, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(6)
        doc.text('PROMO', col3X + tw + 7.5, pY - 0.2, { align: 'center' })
        
        pY += 6.5
      } else {
        pY += 1.5
      }
      
      // Final Price
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(24)
      doc.setTextColor(primaryColor)
      const finalPStr = `Rp ${formatPriceShort(finalP || oldP)}`
      doc.text(finalPStr, col3X, pY)
      
      if (isSewa) {
        const fsWidth = doc.getTextWidth(finalPStr)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(slateColor)
        doc.text(product.Satuan_Minimal_Sewa ? `/ ${product.Satuan_Minimal_Sewa}` : '/ Tahun', col3X + fsWidth + 2, pY - 1)
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
