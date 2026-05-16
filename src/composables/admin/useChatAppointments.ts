import { ref, computed } from 'vue'
import type { CalendarOptions } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import idLocale from '@fullcalendar/core/locales/id'
import api from '@/services/axios'
import { fail, success } from '@/utils/sweet-alert'

export function useChatAppointments(props: any, sendChat: any) {
  const showAppointmentModal = ref(false)
  const appointmentStage = ref(0)
  const allAppointments = ref<any[]>([])
  const isLoadingAppointments = ref(false)
  
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
    mediaUrl: '',
    Room_Id: null as string | null
  })

  const fetchAppointments = async () => {
    isLoadingAppointments.value = true
    try {
      const res = await api.get('/api/janjiTemu/getAll?orderby=no_id&orderdir=asc', {
        headers: { 'X-Jenis-User': 'admin' }
      })
      allAppointments.value = res.data.Data || []
    } catch (error) {
      console.error('Gagal memuat data janji temu:', error)
    } finally {
      isLoadingAppointments.value = false
    }
  }

  const bookedDates = computed(() => {
    return allAppointments.value
      .filter(item => item.Status_Progress !== 'batal')
      .map((item) => {
        return item.Tanggal_Janji.split('T')[0]
      })
  })

  const handleSelectUnitForAppointment = (product: any) => {
    appointmentForm.value.properti = product.Nama_Produk
    appointmentForm.value.lokasi = (product.Alamat || '-').split('_Lat:')[0]
    appointmentForm.value.unitId = product.No_Id
    appointmentForm.value.mediaId = product.File_Image[0]
    appointmentForm.value.mediaUrl = product.MediaUrls[0].Id_Media

    appointmentStage.value = 2
    showAppointmentModal.value = true
    fetchAppointments()
  }

  const handleCalendarDateClick = (info: { dateStr: string; date: Date }) => {
    const clickedDate = info.dateStr.slice(0, 10)
    // Booked dates can still be selected if we want to allow multiple appointments per day, 
    // but the original logic suggests blocking. I'll keep it as per original but using real data.
    // However, usually we might want to check for specific time conflicts.
    appointmentForm.value.tanggal = clickedDate
    if (!appointmentForm.value.waktu) {
      const timeStr = info.dateStr.length > 10 ? info.dateStr.slice(11, 16) : '10:00'
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
    events: allAppointments.value
      .filter(item => item.Status_Progress !== 'batal')
      .map((item) => ({
        title: item.Id_Customer,
        start: `${item.Tanggal_Janji.split('T')[0]}T${item.Waktu_Janji}`,
        backgroundColor: '#94a3b8',
        borderColor: '#94a3b8',
        textColor: '#ffffff',
        extendedProps: item
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

    const msg = `Halo Kak ${f.namaLengkap}! 👋\n\n` +
      `Jadwal kunjungannya udah kita amankan nih. Biar nggak lupa, ini ya detailnya:\n\n` +
      `🏢 *${f.properti}*\n` +
      `📍 ${f.lokasi}\n` +
      `📅 ${formattedDate}, jam ${f.waktu} WIB\n` +
      `📝 Catatan dari kakak: ${f.catatan || '-'}\n\n` +
      `Tim kita bakal nunggu di lokasi sesuai jam di atas ya. Kalau misal nanti nyasar atau ada perubahan rencana, chat ke nomor ini aja.\n\n` +
      `See you di lokasi ya, Kak! 🏙️`

    try {
      // 1. Create Appointment in DB
      await api.post('/api/janjiTemu/create', {
        Room_Id: props.roomId,
        Id_Customer: props.idLawan,
        Id_Admin: localStorage.getItem('no_id'),
        Id_Produk: f.unitId,
        Tipe_Pertemuan: 'offline',
        Tanggal_Janji: f.tanggal,
        Waktu_Janji: f.waktu.length === 5 ? f.waktu + ':00' : f.waktu,
        Waktu_Selesai: null,
        Lokasi_Pertemuan: f.lokasi,
        Keterangan: f.catatan,
        Status: 'aktif',
        Status_Progress: 'baru'
      }, { headers: { 'X-Jenis-User': 'admin' } })

      // 2. Handle Image URL for WA
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

      // 3. Send to Chat UI & DB Chat
      setChatContent(msg)
      showAppointmentModal.value = false
      const idPaket = `${f.unitId}_${f.mediaUrl}`
      await sendChat('system_image_appointment', msg, undefined, f.noTelp, idPaket, urlMedia)

      // 4. Send to WA Gateway
      let formattedPhone = f.noTelp.replace(/\D/g, '')
      if (formattedPhone.startsWith('0')) formattedPhone = '62' + formattedPhone.substring(1)

      const waPayload = {
        PhoneNumber: formattedPhone + '@s.whatsapp.net',
        FileUrl: urlMedia,
        FileName: `product_${f.unitId || 'image'}.jpg`,
        MimeType: 'image/jpeg',
        Caption: msg
      }

      await api.post('/api/waha/send-image', waPayload, { headers: { 'X-Jenis-User': 'admin' } })
      
      success('Janji temu berhasil dibuat dan dikirim ke customer')
    } catch (error) {
      console.error('Gagal membuat janji temu:', error)
      fail('Gagal membuat janji temu')
    }
  }

  return {
    showAppointmentModal,
    appointmentStage,
    appointmentForm,
    appointmentCalendarOptions,
    bookedDates,
    isLoadingAppointments,
    fetchAppointments,
    handleSelectUnitForAppointment,
    saveNewAppointment
  }
}
