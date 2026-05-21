<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { jsPDF } from 'jspdf'
import { Icon } from '@iconify/vue'
import Swal from 'sweetalert2'
import { confirm, success, fail } from '@/utils/sweet-alert'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import idLocale from '@fullcalendar/core/locales/id'
import type { CalendarOptions } from '@fullcalendar/core'
import api from '@/services/axios'

import { useSettings } from '@/stores/settings'

const props = defineProps<{ openAppointment: boolean; appointment: any }>()
const emit = defineEmits(['close', 'refresh', 'openChat'])

const settingsStore = useSettings()
const productData = ref<any>(null)
const isLoadingProduct = ref(false)
const isSendingBrochure = ref(false)

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

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`http://localhost:5000/properti/${productData.value.Slug}`)}`
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
      // Donut Masking Trick for perfect JS PDF circle crop
      doc.addImage(images[1] as string, 'JPEG', centerX - rad, centerY - rad, rad * 2, rad * 2, undefined, 'FAST')
      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(25)
      doc.circle(centerX, centerY, rad + 12, 'S')

      // Rings
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

    // Draw Title line by line for maximum reliability
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
    doc.text(`Tawaran Eksklusif dari ${settingsStore.business.appName}`, col1X, subTitleY)

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
    const pts = productData.value.Akses_Jalan || ['Lokasi strategis Surabaya', 'Desain arsitektur modern', 'Fasilitas premium lengkap', 'Nilai investasi tinggi']
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
      } catch {
        // Fallback
      }
      
      // Cross-compatible mask: Draw a thick white rounded rectangle to hide sharp image corners
      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(4)
      doc.roundedRect(col1X, imgY, 80, 50, 4, 4, 'S')
      
      // Draw the actual thin orange border inside the masked area
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
      { label: 'Tipe', value: productData.value.Tipe || '-' },
      { label: 'Lantai', value: productData.value.Lantai || '-' },
      { label: 'Kamar Tidur', value: productData.value.Jumlah_Kamar_Tidur || '-' },
      { label: 'Kamar Mandi', value: productData.value.Jumlah_Kamar_Mandi || '-' },
      { label: 'Carport', value: productData.value.Jumlah_Carpot || '-' },
      { label: 'Listrik', value: productData.value.Daya_Listrik ? `${productData.value.Daya_Listrik} VA` : '-' }
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
    doc.text(productData.value.Keterangan || 'Unit premium dengan privasi maksimal sekaligus pemandangan kota terbaik.', col2X, 187, { maxWidth: 70, align: 'justify', lineHeightFactor: 1.5 })

    // --- COLUMN 3 ---
    doc.setFillColor(darkOrange)
    doc.roundedRect(col3X + 10, 30, 45, 9, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.text('PENAWARAN TERBATAS', col3X + 32.5, 36, { align: 'center' })

    let pY = 48
    const hasJual = productData.value.Harga_Jual1 > 0 || productData.value.Harga_Jual2 > 0
    const hasSewa = productData.value.Harga_Sewa1 > 0 || productData.value.Harga_Sewa2 > 0
    const isBoth = hasJual && hasSewa

    const drawPriceBlock = (label: string, oldP: number, newP: number, isSewa: boolean) => {
      doc.setFontSize(isBoth ? 8 : 9.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(slateColor)
      doc.text(label, col3X, pY)
      
      let promoOffset = 0
      if (settingsStore.app.viewDiscount && oldP > 0 && newP && newP > 0 && oldP !== newP) {
        doc.setTextColor(156, 163, 175) // Gray-400 for strikethrough
        doc.setFontSize(isBoth ? 8 : 10)
        doc.setFont('helvetica', 'bold')
        const op = `Rp ${formatPrice(oldP)}`
        doc.text(op, col3X, pY + 4.5)
        doc.setDrawColor(239, 68, 68) // Red-500 line
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
      const finalPriceStr = `Rp ${formatPrice(finalPrice)}`
      doc.text(finalPriceStr, col3X, finalPriceY)
      
      const priceWidth = doc.getTextWidth(finalPriceStr)

      if (isSewa) {
        doc.setFontSize(isBoth ? 7 : 8)
        doc.setTextColor(slateColor)
        doc.setFont('helvetica', 'normal')
        doc.text(productData.value.Satuan_Minimal_Sewa ? `/ ${productData.value.Satuan_Minimal_Sewa}` : '/ Tahun', col3X + priceWidth + 2, finalPriceY)
      }

      pY += isBoth ? (15 + promoOffset) : (20 + promoOffset)
    }

    if (hasJual) {
      drawPriceBlock(isBoth ? 'HARGA JUAL:' : 'DENGAN HANYA', productData.value.Harga_Jual1, productData.value.Harga_Jual2, false)
      if (isBoth) {
         doc.setDrawColor(226, 232, 240)
         doc.setLineWidth(0.5)
         doc.line(col3X, pY - 2, col3X + 65, pY - 2)
         pY += 4
      }
    }
    if (hasSewa) drawPriceBlock(isBoth ? 'HARGA SEWA:' : 'DENGAN HANYA', productData.value.Harga_Sewa1, productData.value.Harga_Sewa2, true)

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

    doc.setFillColor('#f97316')
    doc.circle(width, height, 30, 'F')
    doc.setFillColor(255, 255, 255)
    doc.circle(width, height, 15, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('HUBUNGI KAMI SEGERA', col3X - 5, height - 25)
    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'bold')
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(0.3)
    
    // Phone Icon - Centered with text at height - 18
    const waY = height - 18
    doc.roundedRect(col3X - 10.5, waY - 2.25, 2.5, 4.5, 0.5, 0.5, 'S')
    doc.circle(col3X - 9.25, waY, 0.2, 'S')
    doc.text(`WhatsApp: +${settingsStore.business.whatsapp}`, col3X - 5, waY)
    
    // Globe Icon - Centered with text at height - 12
    const webY = height - 12
    doc.circle(col3X - 9.25, webY - 0.7, 2, 'S')
    doc.line(col3X - 11.25, webY - 0.7, col3X - 7.25, webY - 0.7)
    doc.line(col3X - 9.25, webY - 2.7, col3X - 9.25, webY + 1.3)
    doc.text(`Website: wabotui.padajaya.biz.id`, col3X - 5, webY)

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
    await settingsStore.init()
    fetchProductDetails()
  },
  { immediate: true }
)

const formatPrice = (price: number) => {
  if (!price) return 'N/A'
  if (price >= 1000000000) return (price / 1000000000).toFixed(1).replace('.0', '') + ' M'
  if (price >= 1000000) return (price / 1000000).toFixed(1).replace('.0', '') + ' Jt'
  if (price >= 1000) return (price / 1000).toFixed(1).replace('.0', '') + ' Rb'
  return price.toString()
}

const openReschedule = ref(false)
const openRescheduleForm = ref(false)
const selectedDate = ref('')
const startTime = ref('')
const rescheduleReason = ref('Reschedule by Admin')

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: idLocale,
  height: 'auto',
  selectable: true,
  dateClick: (info) => {
    selectedDate.value = info.dateStr
    openRescheduleForm.value = true
  }
}))

const saveReschedule = async () => {
  try {
    await api.put(
      `/api/janjiTemu/reschedule?no_id=${props.appointment.No_Id}`,
      {
        Tanggal_Janji: selectedDate.value,
        Waktu_Janji: startTime.value,
        Waktu_Selesai: null,
        Alasan_Batal: rescheduleReason.value
      },
      {
        headers: { 'X-Jenis-User': 'admin' }
      }
    )
    success('Jadwal berhasil diperbarui')
    openRescheduleForm.value = false
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
      await api.put(`/api/janjiTemu/confirm?no_id=${props.appointment.No_Id}`)
    } else {
      await api.put(`/api/janjiTemu/update-status?no_id=${props.appointment.No_Id}&status_progress=${status}`)
    }
    success(`Status berhasil diperbarui menjadi ${status}`)
    emit('refresh')
    emit('close')
  } catch (error) {
    console.error('Gagal memperbarui status:', error)
    fail('Gagal memperbarui status janji temu')
  }
}

const cancelAppointment = async () => {
  showMoreActions.value = false
  const { value: reason } = await Swal.fire({
    title: 'Batalkan Janji Temu?',
    input: 'textarea',
    inputLabel: 'Masukkan alasan pembatalan',
    inputPlaceholder: 'Contoh: User ganti jadwal atau tidak bisa dihubungi...',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Ya, Batalkan!',
    cancelButtonText: 'Kembali'
  })

  if (reason) {
    try {
      const payload = {
        ...props.appointment,
        Status_Progress: 'batal',
        Alasan_Batal: reason
      }
      await api.put(`/api/janjiTemu/update?no_id=${props.appointment.No_Id}`, payload)
      success('Janji temu telah dibatalkan')
      emit('refresh')
      emit('close')
    } catch (error) {
      console.error('Gagal membatalkan janji temu:', error)
      fail('Gagal membatalkan janji temu')
    }
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
</script>

<template>
  <div v-if="props.openAppointment" class="h-full">
    <div class="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden h-full flex flex-col">
      <div class="relative p-8 pb-14 text-white transition-colors duration-500" :class="props.appointment.Status_Progress === 'batal' ? 'bg-red-500' : 'bg-bejo-500'">
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-white/10"> #{{ props.appointment.No_Tracking }} </span>
            <button @click="copyToClipboard(props.appointment.No_Tracking)" class="text-white/40 hover:text-white transition-colors">
              <Icon icon="lucide:copy" class="size-3" />
            </button>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 bg-white text-bejo-600 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
              {{ props.appointment.Status_Progress }}
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

        <div class="absolute -bottom-7 left-8 right-8 bg-white rounded-3xl p-4 flex items-center justify-between shadow-lg shadow-black/5">
          <div class="flex items-center gap-3">
            <div class="size-9 rounded-xl bg-bejo-600 text-white flex items-center justify-center font-black text-xs">
              {{ (props.appointment.Nama_Customer || 'C').charAt(0) }}
            </div>
            <div class="flex flex-col">
              <span class="text-[9px] font-black text-bejo-400 uppercase tracking-tight">Customer</span>
              <span class="text-[11px] font-black text-slate-900 truncate max-w-[80px]">{{ props.appointment.Nama_Customer || props.appointment.Id_Customer }}</span>
            </div>
          </div>

          <div class="flex flex-col items-center">
            <Icon icon="lucide:users" class="size-4 text-slate-200" />
          </div>

          <div class="flex items-center gap-3 text-right">
            <div class="flex flex-col">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-tight">Admin</span>
              <span class="text-[11px] font-black text-slate-900 truncate max-w-[80px]">{{ props.appointment.Nama_Admin || props.appointment.Id_Admin || 'Admin' }}</span>
            </div>
            <div class="size-9 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center font-black text-xs">
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
                <button @click="openInMaps(props.appointment.Lokasi_Pertemuan)" class="text-[8px] font-black text-bejo-500 hover:text-bejo-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Cari di Maps <Icon icon="lucide:external-link" class="size-2" /></button>
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

          <div v-if="props.appointment.Alasan_Batal" class="p-4 bg-red-50 rounded-2xl border border-red-100">
            <span class="text-[9px] font-black text-red-400 uppercase tracking-widest block mb-1">Alasan Batal</span>
            <p class="text-xs font-bold text-red-600 italic">"{{ props.appointment.Alasan_Batal }}"</p>
          </div>

          <div class="space-y-3">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Unit Properti</span>

            <div v-if="isLoadingProduct" class="h-20 bg-slate-50 rounded-2xl animate-pulse"></div>

            <a v-else-if="productData" :href="`/properti/${productData.Slug}`" target="_blank" class="flex gap-4 p-3 bg-white border border-slate-100 rounded-3xl hover:border-bejo-200 transition-all group cursor-pointer shadow-sm hover:shadow-md">
              <img v-if="productData.MediaUrls?.[0]?.ThumbUrl || productData.MediaUrls?.[0]?.Id_Media" :src="productData.MediaUrls[0].ThumbUrl || productData.MediaUrls[0].Id_Media" class="size-20 rounded-2xl object-cover" />
              <div class="flex-1 min-w-0 flex flex-col justify-center">
                <h4 class="text-xs font-black text-slate-900 truncate group-hover:text-bejo-600 transition-colors">{{ productData.Nama_Produk }}</h4>
                <p class="text-[9px] font-medium text-slate-500 truncate mb-1">
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

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-[9px] font-black text-bejo-600 bg-bejo-50 px-2 py-0.5 rounded">{{ productData.Tipe }}</span>
                    <button @click.stop.prevent="openInMaps(`${productData.Latitude},${productData.Longitude}`, true)" class="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-emerald-100 transition-colors"><Icon icon="lucide:navigation" class="size-2" /> Petunjuk Arah</button>
                  </div>
                  <span class="text-xs font-black text-emerald-600"> Rp {{ formatPrice(productData.Harga_Jual2 || productData.Harga_Sewa2 || productData.Harga_Jual1) }} </span>
                </div>
              </div>
            </a>

            <div v-else class="text-[10px] font-bold text-slate-400 italic px-1">Produk: {{ props.appointment.Nama_Produk }}</div>
          </div>
        </div>
      </div>

      <div class="p-8 bg-white border-t border-slate-100 shrink-0">
        <div class="grid grid-cols-2 gap-3 mb-4">
          <button @click="$emit('openChat', props.appointment.Id_Customer)" class="px-4 py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group">
            <Icon icon="lucide:message-circle" class="size-4 group-hover:scale-110 transition-transform" />
            Hubungi
          </button>
          <button v-if="props.appointment.Status_Progress !== 'batal'" @click="sendBrochure" :disabled="isSendingBrochure || !productData" class="px-4 py-3.5 bg-white hover:bg-bejo-50 text-bejo-600 border-2 border-bejo-100 hover:border-bejo-200 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group disabled:opacity-50">
            <Icon v-if="isSendingBrochure" icon="lucide:loader-2" class="size-4 animate-spin" />
            <Icon v-else icon="lucide:file-text" class="size-4 group-hover:scale-110 transition-transform" />
            Kirim Brosur
          </button>
          <button v-else @click="handleDelete" class="px-4 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
            <Icon icon="lucide:trash-2" class="size-4" />
            Hapus Data
          </button>
        </div>

        <div v-if="props.appointment.Status_Progress !== 'batal'" class="flex items-center gap-3">
          <div class="flex-1">
            <button v-if="props.appointment.Status_Progress === 'baru'" @click="handleUpdateStatus('dikonfirmasi')" class="w-full px-4 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              <Icon icon="lucide:check-circle" class="size-4" />
              Konfirmasi Janji
            </button>
            <button v-else-if="props.appointment.Status_Progress === 'dikonfirmasi'" @click="handleUpdateStatus('proses')" class="w-full px-4 py-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              <Icon icon="lucide:play-circle" class="size-4" />
              Mulai Pertemuan
            </button>
            <button v-else-if="props.appointment.Status_Progress === 'proses'" @click="handleUpdateStatus('selesai')" class="w-full px-4 py-3.5 bg-violet-500 hover:bg-violet-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              <Icon icon="lucide:award" class="size-4" />
              Selesaikan
            </button>
            <div v-else class="w-full py-3.5 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-center border border-emerald-100">Janji Temu Selesai</div>
          </div>

          <div class="relative">
            <button @click="showMoreActions = !showMoreActions" class="size-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all flex items-center justify-center border border-slate-200/50">
              <Icon icon="lucide:more-horizontal" class="size-5" />
            </button>

            <div v-if="showMoreActions" class="absolute bottom-full right-0 mb-4 w-48 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <button
                @click="
                  openReschedule = true;
                  showMoreActions = false;
                "
                class="w-full px-5 py-3.5 text-left text-[11px] font-black text-slate-700 hover:bg-bejo-50 hover:text-bejo-600 transition-colors flex items-center gap-3 border-b border-slate-50"
              >
                <Icon icon="lucide:calendar-clock" class="size-4" />
                Reschedule
              </button>
              <button @click="cancelAppointment" class="w-full px-5 py-3.5 text-left text-[11px] font-black text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3">
                <Icon icon="lucide:ban" class="size-4" />
                Batalkan Janji
              </button>
            </div>
            <div v-if="showMoreActions" @click="showMoreActions = false" class="fixed inset-0 z-40"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="openReschedule" class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
      <div class="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in duration-300">
        <div class="flex justify-between items-center mb-8">
          <h4 class="text-xl font-black text-slate-900">Pilih Jadwal Baru</h4>
          <button @click="openReschedule = false" class="text-slate-400 hover:text-slate-900"><Icon icon="lucide:x" class="size-6" /></button>
        </div>
        <FullCalendar :options="calendarOptions" class="mb-8" />
        <div v-if="openRescheduleForm" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Tanggal</label>
              <input v-model="selectedDate" type="date" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
            </div>
            <div>
              <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Pukul</label>
              <input v-model="startTime" type="time" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Alasan Perubahan Jadwal</label>
            <textarea v-model="rescheduleReason" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold min-h-[80px]" placeholder="Masukkan alasan reschedule..."></textarea>
          </div>
          <button @click="saveReschedule" class="w-full py-4 bg-bejo-500 hover:bg-bejo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-bejo-500/30">Simpan Jadwal Baru</button>
        </div>
      </div>
    </div>
  </div>
</template>
