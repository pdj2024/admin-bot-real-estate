import { ref, computed } from 'vue'
import api from '@/services/axios'
import { confirm, success, fail } from '@/utils/sweet-alert'

/** Konversi getDay() JS ke format API (1=Senin ... 7=Minggu) */
const getTodayHari = (): number => {
  const jsDay = new Date().getDay() // 0=Minggu, 1=Senin, ..., 6=Sabtu
  return jsDay === 0 ? 7 : jsDay
}

/** Cek apakah jam sekarang dalam rentang jam_mulai – jam_selesai (format "HH:MM:SS" atau "HH:MM") */
const isNowInRange = (jamMulai: string, jamSelesai: string): boolean => {
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }

  return nowMinutes >= toMinutes(jamMulai) && nowMinutes <= toMinutes(jamSelesai)
}

export function useChatTransfer(props: any, emit: any, sendChat: any) {
  const adminsList = ref<any[]>([])
  const searchCS = ref('')
  const isFetchingAdmins = ref(false)

  const fetchAdmins = async () => {
    isFetchingAdmins.value = true
    try {
      const hari = getTodayHari()

      // 1. Ambil jadwal kerja hari ini
      const jadwalRes = await api.get(
        `/api/admin/jadwal/getAll?hari=${hari}&orderby=no_id&orderdir=desc`,
        { headers: { 'X-Jenis-User': 'admin' } }
      )
      const jadwalList: any[] = jadwalRes.data.Data || []

      // 2. Filter hanya yang masuk & jam sekarang dalam rentang kerja
      const activeAdminIds = new Set(
        jadwalList
          .filter(j => !j.Is_Libur && isNowInRange(j.Jam_Mulai, j.Jam_Selesai))
          .map(j => j.Id_Admin)
      )

      // 3. Ambil semua data admin
      const adminRes = await api.get(
        '/api/admin/getAll?orderby=Tgl_Created&orderdir=desc',
        { headers: { 'X-Jenis-User': 'admin' } }
      )
      const allAdmins: any[] = adminRes.data.Data || []

      // 4. Hanya tampilkan admin yang sedang bertugas saat ini
      adminsList.value = allAdmins.filter(a => activeAdminIds.has(a.No_Id))
    } catch {
      fail('Gagal mengambil data admin')
    } finally {
      isFetchingAdmins.value = false
    }
  }

  const filteredAdmins = computed(() => {
    const myId = localStorage.getItem('no_id')
    let list = adminsList.value || []
    if (myId) list = list.filter((admin) => String(admin.No_Id) !== String(myId))
    if (!searchCS.value) return list
    return list.filter((admin) => (admin.Nama_User || '').toLowerCase().includes(searchCS.value.toLowerCase()))
  })

  const handleTransferChat = (targetAdmin: any, closePanels: () => void) => {
    confirm(`Alihkan percakapan ke ${targetAdmin.Nama_User}?`, async () => {
      const myId = localStorage.getItem('no_id')
      let formattedPhone = props.phoneNumber.replace(/\D/g, '')
      if (formattedPhone.startsWith('0')) formattedPhone = '62' + formattedPhone.substring(1)

      try {
        await api.post('/api/chat/toggle-bot', { 
          customer_phone: formattedPhone, 
          admin_id: myId, 
          customer_id: props.idLawan,
          room_id: props.roomId,
          status_bot: true 
        }, { headers: { 'X-Jenis-User': 'admin' } })
        await sendChat('system_keluar_tukar', undefined, props.roomId!, formattedPhone)
        await api.post('/api/chat/toggle-bot', { 
          customer_phone: formattedPhone, 
          admin_id: targetAdmin.No_Id, 
          customer_id: props.idLawan,
          room_id: props.roomId,
          status_bot: false 
        }, { headers: { 'X-Jenis-User': 'admin' } })
        await sendChat('system_masuk_tukar', undefined, props.roomId!, formattedPhone, undefined, undefined, targetAdmin.Nama_User)

        success(`Berhasil mengalihkan ke ${targetAdmin.Nama_User}`)
        closePanels()
        emit('clearRoom')
      } catch (err: any) {
        const errorMessage = err.response?.data?.Message || ''
        if (errorMessage.includes('sudah diambil alih')) fail('Gagal: Percakapan ini sudah dialihkan')
        else fail('Gagal mengalihkan percakapan')
      }
    })
  }

  return {
    adminsList,
    searchCS,
    isFetchingAdmins,
    filteredAdmins,
    fetchAdmins,
    handleTransferChat
  }
}

