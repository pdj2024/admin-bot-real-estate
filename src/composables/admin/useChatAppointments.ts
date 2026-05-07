import { ref, computed } from 'vue'
import type { CalendarOptions } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import idLocale from '@fullcalendar/core/locales/id'
import api from '@/services/axios'
import { fail } from '@/utils/sweet-alert'
import { calendarEvents } from '@/views/admin/chat/components/data'

export function useChatAppointments(props: any, sendChat: any) {
  const showAppointmentModal = ref(false)
  const appointmentStage = ref(0)
  
  const appointmentForm = ref({
    namaLengkap: '',
    noTelp: '',
    lokasi: '',
    catatan: '',
    tanggal: '',
    waktu: '',
    properti: '',
    unitId: '',
    mediaId: '',
    mediaUrl: ''
  })

  const bookedDates = computed(() => {
    return calendarEvents.map((ev) => {
      const d = new Date(ev.start)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    })
  })

  const handleSelectUnitForAppointment = (product: any) => {
    appointmentForm.value.properti = product.Nama_Produk
    appointmentForm.value.lokasi = product.Alamat || '-'
    appointmentForm.value.unitId = product.No_Id
    appointmentForm.value.mediaId = product.File_Image[0]
    appointmentForm.value.mediaUrl = product.MediaUrls[0].Id_Media

    appointmentStage.value = 2
    showAppointmentModal.value = true
  }

  const handleCalendarDateClick = (info: { dateStr: string; date: Date }) => {
    const clickedDate = info.dateStr.slice(0, 10)
    if (bookedDates.value.includes(clickedDate)) {
      fail('Tanggal ini sudah ada janji temu. Pilih tanggal lain.')
      return
    }
    appointmentForm.value.tanggal = clickedDate
    if (!appointmentForm.value.waktu) {
      const timeStr = info.dateStr.length > 10 ? info.dateStr.slice(11, 16) : '09:00'
      appointmentForm.value.waktu = timeStr
    }
  }

  const appointmentCalendarOptions = computed<CalendarOptions>(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: 'dayGridMonth',
    locale: idLocale,
    height: '100%',
    selectable: true,
    validRange: {
      start: new Date().toISOString().split('T')[0]
    },
    dateClick: handleCalendarDateClick,
    dayCellClassNames: (arg) => {
      const d = arg.date
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      if (bookedDates.value.includes(key)) return ['fc-day-booked']
      return []
    },
    events: calendarEvents.map((ev) => ({
      title: ev.title,
      start: ev.start,
      backgroundColor: '#94a3b8',
      borderColor: '#94a3b8',
      textColor: '#ffffff',
      extendedProps: ev.extendedProps
    })),
    headerToolbar: { left: 'prev,next today', center: 'title', right: '' },
    eventClick: () => {}
  }))

  const saveNewAppointment = async (setChatContent: (val: string) => void) => {
    const f = appointmentForm.value
    if (!f.namaLengkap.trim()) return fail('Nama lengkap wajib diisi')
    if (!f.tanggal) return fail('Pilih tanggal pada kalender terlebih dahulu')
    if (!f.waktu) return fail('Waktu wajib diisi')

    const dateObj = new Date(f.tanggal)
    const formattedDate = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(dateObj)

    const msg = `Halo Kak ${f.namaLengkap}, salam kenal! 👋\n\n` +
      `Jadwal kunjungannya udah kita amankan nih. Biar nggak lupa, ini ya detailnya:\n\n` +
      `🏢 *${f.properti}*\n` +
      `📍 ${f.lokasi}\n` +
      `📅 ${formattedDate}, jam ${f.waktu} WIB\n` +
      `📝 Catatan dari kakak: ${f.catatan || '-'}\n\n` +
      `Tim kita bakal nunggu di lokasi sesuai jam di atas ya. Kalau misal nanti nyasar atau ada perubahan rencana, chat ke nomor ini aja.\n\n` +
      `See you di lokasi ya, Kak! 🏙️`

    let urlMedia = ''
    const idMedia = f.mediaUrl || ''
    if (idMedia.includes('base64,')) urlMedia = idMedia
    else if (idMedia.startsWith('http')) {
      try {
        const response = await fetch(idMedia)
        const blob = await response.blob()
        urlMedia = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        })
      } catch {
        urlMedia = idMedia
      }
    } else urlMedia = idMedia

    setChatContent(msg)
    showAppointmentModal.value = false
    const idPaket = `${f.unitId}_${f.mediaId}`
    await sendChat('system_image_appointment', msg, undefined, undefined, idPaket, urlMedia)
    const payload = {
      PhoneNumber: props.phoneNumber + '@s.whatsapp.net',
      FileUrl: urlMedia,
      FileName: `product_${f.unitId || 'image'}.jpg`,
      MimeType: 'image/jpeg',
      Caption: msg
    }

    const config = { headers: { 'X-Jenis-User': 'admin' } }
    await api.post('/api/waha/send-image', payload, config)
  }

  return {
    showAppointmentModal,
    appointmentStage,
    appointmentForm,
    appointmentCalendarOptions,
    bookedDates,
    handleSelectUnitForAppointment,
    saveNewAppointment
  }
}
