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
  if (price >= 1000000000) return (price / 1000000000).toFixed(1).replace('.0', '') + ' M'
  if (price >= 1000000) return (price / 1000000).toFixed(1).replace('.0', '') + ' Jt'
  if (price >= 1000) return (price / 1000).toFixed(1).replace('.0', '') + ' Rb'
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

    const currentUrl = window.location.origin + '/properti/detail/' + product.Slug
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
    if (logoBase64) {
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(3, 3, 29, 29, 4, 4, 'F')
      doc.addImage(logoBase64 as string, 'PNG', 5, 5, 25, 25)
    }

    // --- COLUMN 2 IMAGE (RENDERED FIRST TO PREVENT WHITE MASK OVERLAP) ---
    const centerX = col2X + 35
    const centerY = 58
    const rad = 35

    drawDots(col2X + 15, 12, 5, 8)

    if (images[1]) {
      doc.addImage(images[1] as string, 'JPEG', centerX - rad, centerY - rad, rad * 2, rad * 2, undefined, 'FAST')
      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(25)
      doc.circle(centerX, centerY, rad + 12, 'S')

      doc.setDrawColor(primaryColor)
      doc.setLineWidth(1.5)
      doc.circle(centerX, centerY, rad + 1, 'S')
      doc.setLineWidth(0.8)
      doc.circle(centerX, centerY, rad + 5, 'S')
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
    const titleLineStep = (titleFontSize * 0.35) + 2
    tLines.forEach((line: string) => {
      doc.text(line, col1X, currentTitleY)
      currentTitleY += titleLineStep
    })

    const subTitleY = currentTitleY + 2
    doc.setFontSize(10)
    doc.setTextColor(primaryColor)
    doc.text(`Tawaran Eksklusif dari ${businessSettings.appName || 'Kami'}`, col1X, subTitleY)

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
    const pts = product.Akses_Jalan || ['Lokasi strategis & akses mudah', 'Desain arsitektur modern', 'Fasilitas premium lengkap', 'Nilai investasi tinggi']
    pts.slice(0, 4).forEach((p: string) => {
      doc.setDrawColor(primaryColor)
      doc.setLineWidth(0.5)
      doc.circle(col1X + 4, aY - 1.5, 2.5, 'S')
      doc.line(col1X + 3, aY - 1.5, col1X + 3.8, aY - 0.5)
      doc.line(col1X + 3.8, aY - 0.5, col1X + 5.5, aY - 2.5)
      const pLines = doc.splitTextToSize(p, 72)
      doc.text(pLines, col1X + 10, aY)
      aY += (pLines.length * 4) + 4
    })

    if (images[0]) {
      const imgY = Math.max(135, aY + 3)
      try {
        doc.addImage(images[0] as string, 'JPEG', col1X, imgY, 80, 50, undefined, 'FAST')
      } catch {}
      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(4)
      doc.roundedRect(col1X, imgY, 80, 50, 4, 4, 'S')
      doc.setDrawColor(primaryColor)
      doc.setLineWidth(1)
      doc.roundedRect(col1X, imgY, 80, 50, 4, 4, 'S')
    }

    // --- COLUMN 2 CONTENT ---
    const fY = 115
    doc.setFillColor(primaryColor)
    doc.roundedRect(col2X + 5, fY, 60, 10, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.text('FASILITAS LENGKAP', col2X + 35, fY + 6.5, { align: 'center' })

    const details = [
      { label: 'Tipe', value: product.Tipe || '-' },
      { label: 'Lantai', value: product.Jumlah_Lantai || '-' },
      { label: 'Kamar Tidur', value: product.Jumlah_Kamar_Tidur || '-' },
      { label: 'Kamar Mandi', value: product.Jumlah_Kamar_Mandi || '-' },
      { label: 'Carport', value: product.Jumlah_Carpot || '-' },
      { label: 'Listrik', value: product.Daya_Listrik ? `${product.Daya_Listrik} VA` : '-' }
    ].filter(d => !(d.label === 'Lantai' && (d.value === '-' || !d.value)))

    doc.setTextColor(slateColor)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    details.forEach((item, index) => {
      const isRight = index % 2 === 1
      const x = isRight ? col2X + 40 : col2X + 2
      const y = 135 + Math.floor(index / 2) * 10
      doc.setFillColor(darkOrange)
      doc.circle(x - 1, y - 1, 1, 'F')
      doc.text(`${item.label}: ${item.value}`, x + 2, y)
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
    doc.text(product.Keterangan || 'Unit premium dengan privasi maksimal sekaligus pemandangan kota terbaik.', col2X, 187, { maxWidth: 70, align: 'justify', lineHeightFactor: 1.5 })

    // --- COLUMN 3 ---
    doc.setFillColor(darkOrange)
    doc.roundedRect(col3X + 10, 30, 45, 9, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.text('PENAWARAN TERBATAS', col3X + 32.5, 36, { align: 'center' })

    let pY = 48
    const hasJual = product.Harga_Jual1 > 0 || product.Harga_Jual2 > 0
    const hasSewa = product.Harga_Sewa1 > 0 || product.Harga_Sewa2 > 0
    const isBoth = hasJual && hasSewa

    const drawPriceBlock = (label: string, oldP: number, newP: number, isSewa: boolean) => {
      doc.setFontSize(isBoth ? 8 : 9.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(slateColor)
      doc.text(label, col3X, pY)
      
      let promoOffset = 0
      if (appSettings.viewDiscount && oldP > 0 && newP && newP > 0 && oldP !== newP) {
        doc.setTextColor(156, 163, 175)
        doc.setFontSize(isBoth ? 8 : 10)
        doc.setFont('helvetica', 'bold')
        const op = `Rp ${formatPriceShort(oldP)}`
        doc.text(op, col3X, pY + 4.5)
        doc.setDrawColor(239, 68, 68)
        doc.setLineWidth(0.5)
        const tw = doc.getTextWidth(op)
        doc.line(col3X - 1, pY + 3.2, col3X + tw + 1, pY + 3.2)
        doc.setFillColor(239, 68, 68)
        doc.roundedRect(col3X + tw + 3, pY + 1, 14, 4, 1, 1, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(isBoth ? 5 : 6)
        doc.text('PROMO', col3X + tw + 10, pY + 3.7, { align: 'center' })
        promoOffset = isBoth ? 5.5 : 6.5
      }

      const finalPriceY = pY + (isBoth ? 9 : 11) + promoOffset
      doc.setFontSize(isBoth ? 18 : 24)
      doc.setTextColor(primaryColor)
      doc.setFont('helvetica', 'bold')
      const finalPrice = newP || oldP
      const finalPriceStr = `Rp ${formatPriceShort(finalPrice)}`
      doc.text(finalPriceStr, col3X, finalPriceY)
      const priceWidth = doc.getTextWidth(finalPriceStr)

      if (isSewa) {
        doc.setFontSize(isBoth ? 7 : 8)
        doc.setTextColor(slateColor)
        doc.setFont('helvetica', 'normal')
        doc.text(product.Satuan_Minimal_Sewa ? `/ ${product.Satuan_Minimal_Sewa}` : '/ Tahun', col3X + priceWidth + 2, finalPriceY)
      }
      pY += isBoth ? (15 + promoOffset) : (20 + promoOffset)
    }

    if (hasJual) {
      drawPriceBlock(isBoth ? 'HARGA JUAL:' : 'DENGAN HANYA', product.Harga_Jual1, product.Harga_Jual2, false)
      if (isBoth) {
         doc.setDrawColor(226, 232, 240)
         doc.setLineWidth(0.5)
         doc.line(col3X, pY - 2, col3X + 65, pY - 2)
         pY += 4
      }
    }
    if (hasSewa) drawPriceBlock(isBoth ? 'HARGA SEWA:' : 'DENGAN HANYA', product.Harga_Sewa1, product.Harga_Sewa2, true)

    const finalPY = Math.max(90, pY + 2)
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.5)
    doc.line(col3X, finalPY, col3X + 65, finalPY)

    doc.setTextColor(100, 116, 139)
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.text('• UNIT TERBATAS & EKSKLUSIF', col3X, finalPY + 10)
    doc.text('• BEBAS BIAYA SURAT-SURAT', col3X, finalPY + 17)

    drawDots(col3X + 60, finalPY + 5, 6, 4)

    if (qrBase64) {
      doc.addImage(qrBase64 as string, 'PNG', col3X + 15, 120, 35, 35)
      doc.setFontSize(8)
      doc.setTextColor(primaryColor)
      doc.setFont('helvetica', 'bold')
      doc.text('SCAN UNTUK DETAIL UNIT', col3X + 32.5, 162, { align: 'center' })
    }

    doc.setFillColor(primaryColor)
    doc.roundedRect(col3X - 20, height - 45, 120, 60, 10, 10, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('HUBUNGI KAMI SEGERA', col3X - 5, height - 25)
    doc.setFontSize(9.5)
    
    const waY = height - 18
    doc.text(`WhatsApp: +${businessSettings.whatsapp || '-'}`, col3X - 5, waY)
    const webY = height - 12
    doc.text(`Website: ${window.location.host}`, col3X - 5, webY)

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
