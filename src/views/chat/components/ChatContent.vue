<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed, watch, defineAsyncComponent } from 'vue'
import { Icon } from '@iconify/vue'
import { confirm, success, fail } from '@/utils/sweet-alert'
import type { CalendarOptions } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import idLocale from '@fullcalendar/core/locales/id'
import api from '@/services/axios'
import ChatBubble from './ChatBubble.vue'
import bgChat from '@/assets/images/background-chat.png'
import bgChatDark from '@/assets/images/background-chat-dark.png'
import simplebar from 'simplebar-vue'
import { type Chat, type PreviewImage, calendarEvents, commonEmojis } from './data'
import { type TakeOverPayload } from './SideBar.vue'

// Lazy-load heavy UI components — only fetched when the user opens that panel
const FullCalendar = defineAsyncComponent(() => import('@fullcalendar/vue3'))
const Filter = defineAsyncComponent(() => import('./Filter.vue'))
const ProductCard = defineAsyncComponent(() => import('@/components/ProductCard.vue'))

const etalaseRef = ref<HTMLElement | null>(null)
const tukarCSRef = ref<HTMLElement | null>(null)
const filterRef = ref<any | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const chatContainer = ref<any>(null)
const searchHeaderRef = ref<HTMLElement | null>(null)
const showScrollToBottom = ref(false)

const openMenu = ref(false)
const openEtalase = ref(false)
const openAppointment = ref(false)
const openTukarCS = ref(false)
const openFilter = ref(false)
const showAppointmentModal = ref(false)

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

const appointmentStage = ref(0)

const bookedDates = computed(() => {
  return calendarEvents.map((ev) => {
    const d = new Date(ev.start)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
})
const isMobile = ref(false)
const changeUsername = ref(false)
const sendChatContent = ref('')
const isSendingImage = ref(false)
const searchKatalog = ref('')
const debouncedSearchKatalog = ref('')
const activeExpandedProductId = ref<string | null>(null)
let katalogTimeout: any = null

watch(searchKatalog, (newVal) => {
  if (katalogTimeout) clearTimeout(katalogTimeout)
  katalogTimeout = setTimeout(() => {
    debouncedSearchKatalog.value = newVal
  }, 500)
})

const chatInputRef = ref<HTMLTextAreaElement | null>(null)
const adminsList = ref<any[]>([])
const searchCS = ref('')
const isFetchingAdmins = ref(false)
const isSearchingChat = ref(false)
const searchChatQuery = ref('')
const searchChatResults = ref<{ chatIndex: number; matchIndex: number }[]>([])
const currentSearchMatch = ref(-1)
const searchChatInputRef = ref<HTMLInputElement | null>(null)
const showEmojiPicker = ref(false)

const addEmoji = (emoji: string) => {
  sendChatContent.value += emoji
  chatInputRef.value?.focus()
}

const username = defineModel<string>('username')
const bgLightUrl = `url(${bgChat})`
const bgDarkUrl = `url(${bgChatDark})`

const isPreviewMode = computed(() => previewImages.value.length > 0)
const activeSearchChatIndex = computed(() => {
  if (currentSearchMatch.value === -1 || searchChatResults.value.length === 0) return -1
  return searchChatResults.value[currentSearchMatch.value].chatIndex
})
const activeSearchMatchIndex = computed(() => {
  if (currentSearchMatch.value === -1 || searchChatResults.value.length === 0) return -1
  return searchChatResults.value[currentSearchMatch.value].matchIndex
})
const isPreviewOpen = ref(false)
const previewImages = ref<PreviewImage[]>([])
const activeIndex = ref(0)
const activeImage = computed(() => previewImages.value[activeIndex.value])
const addMoreInput = ref<HTMLInputElement | null>(null)

const props = defineProps<{
  roomId: string | null
  idLawan: string
  phoneNumber: string
  activeTab: string
  chats: Chat[]
  lastMessageId: string
  takeOverBatch: TakeOverPayload[]
  isLoadingChat?: boolean
}>()

const emit = defineEmits<{
  (e: 'chatTakeOver'): void
  (e: 'clearRoom'): void
  (e: 'usernameChange', value: string): void
  (e: 'takeOverStatus', value: string[]): void
  (e: 'addChat', value: Chat): void
  (e: 'updateChatStatus', value: { index: number; status: 'send' | 'failed' | 'pending' }): void
}>()

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node

  if (isSearchingChat.value && searchHeaderRef.value && !searchHeaderRef.value.contains(target)) {
    const isSearchToggle = (target as HTMLElement).closest('button[title="Cari dalam obrolan"]')
    if (!isSearchToggle) toggleSearchChat()
  }

  const interactiveRefs = [containerRef.value, etalaseRef.value, tukarCSRef.value, filterRef.value?.$el, searchHeaderRef.value]

  if (interactiveRefs.some((el) => el && el.contains(target))) return

  openMenu.value = false
  openEtalase.value = false
  openTukarCS.value = false
  showEmojiPicker.value = false
}

const closeEtalase = () => {
  openEtalase.value = false
  openAppointment.value = false
  openFilter.value = false
}

const handleOpenEtalase = () => {
  appointmentStage.value = 0
  openEtalase.value = true
  openAppointment.value = false
  openTukarCS.value = false
  openMenu.value = false
}

const handleOpenAppointment = () => {
  appointmentStage.value = 1
  openAppointment.value = true
  openEtalase.value = false
  openMenu.value = false

  appointmentForm.value = {
    namaLengkap: username.value ?? '',
    noTelp: props.phoneNumber ?? '',
    lokasi: '',
    catatan: '',
    tanggal: '',
    waktu: '',
    properti: '',
    unitId: '',
    mediaId: '',
    mediaUrl: ''
  }
}

const handleSelectUnitForAppointment = (product: any) => {
  appointmentForm.value.properti = product.Nama_Produk
  appointmentForm.value.lokasi = product.Alamat || '-'
  appointmentForm.value.unitId = product.No_Id
  appointmentForm.value.mediaId = product.File_Image[0]
  appointmentForm.value.mediaUrl = product.MediaUrls[0].Id_Media

  openAppointment.value = false
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
  height: 'auto',
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

const saveNewAppointment = async () => {
  const f = appointmentForm.value
  console.log(appointmentForm.value)
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

  sendChatContent.value = msg
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

const handleOpenTukarCS = () => {
  openTukarCS.value = !openTukarCS.value
  if (openTukarCS.value) {
    openEtalase.value = false
    openAppointment.value = false
    openMenu.value = false
    fetchAdmins()
  }
}

const fetchAdmins = async () => {
  isFetchingAdmins.value = true
  try {
    const res = await api.get('/api/admin/getAll?orderby=Tgl_Created&orderdir=desc', { headers: { 'X-Jenis-User': 'admin' } })
    adminsList.value = res.data.Data || []
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

const handleTransferChat = (targetAdmin: any) => {
  confirm(`Alihkan percakapan ke ${targetAdmin.Nama_User}?`, async () => {
    const myId = localStorage.getItem('no_id')
    let formattedPhone = props.phoneNumber.replace(/\D/g, '')
    if (formattedPhone.startsWith('0')) formattedPhone = '62' + formattedPhone.substring(1)

    try {
      await api.post('/api/chat/toggle-bot', { customer_phone: formattedPhone, admin_id: myId, status_bot: true }, { headers: { 'X-Jenis-User': 'admin' } })
      await sendChat('system_keluar_tukar', undefined, props.roomId!, formattedPhone)
      await api.post('/api/chat/toggle-bot', { customer_phone: formattedPhone, admin_id: targetAdmin.No_Id, status_bot: false }, { headers: { 'X-Jenis-User': 'admin' } })
      await sendChat('system_masuk_tukar', undefined, props.roomId!, formattedPhone, undefined, undefined, targetAdmin.Nama_User)

      success(`Berhasil mengalihkan ke ${targetAdmin.Nama_User}`)
      openTukarCS.value = false
      emit('clearRoom')
    } catch (err: any) {
      const errorMessage = err.response?.data?.Message || ''
      if (errorMessage.includes('sudah diambil alih')) fail('Gagal: Percakapan ini sudah dialihkan')
      else fail('Gagal mengalihkan percakapan')
    }
  })
}

const toggleSearchChat = async () => {
  isSearchingChat.value = !isSearchingChat.value
  if (isSearchingChat.value) {
    await nextTick()
    searchChatInputRef.value?.focus()
  } else {
    searchChatQuery.value = ''
    searchChatResults.value = []
    currentSearchMatch.value = -1
  }
}

const handleSearchChat = () => {
  if (!searchChatQuery.value.trim()) {
    searchChatResults.value = []
    currentSearchMatch.value = -1
    return
  }
  const query = searchChatQuery.value.toLowerCase()
  const results: { chatIndex: number; matchIndex: number }[] = []

  props.chats.forEach((c, i) => {
    let msg = (c.Message as string) || ''
    if (msg.includes('_data:image/')) msg = msg.split('_data:image/')[0]
    const searchString = msg.toLowerCase()
    let pos = searchString.indexOf(query)
    let occurrenceIdx = 0

    while (pos !== -1) {
      results.push({ chatIndex: i, matchIndex: occurrenceIdx })
      occurrenceIdx++
      pos = searchString.indexOf(query, pos + query.length)
    }
  })

  searchChatResults.value = results
  if (searchChatResults.value.length > 0) {
    if (currentSearchMatch.value === -1 || currentSearchMatch.value >= searchChatResults.value.length) currentSearchMatch.value = 0
    scrollToMatch(searchChatResults.value[currentSearchMatch.value])
  } else currentSearchMatch.value = -1
}

const nextSearchMatch = async () => {
  if (searchChatResults.value.length === 0) return
  currentSearchMatch.value = (currentSearchMatch.value + 1) % searchChatResults.value.length
  await nextTick()
  scrollToMatch(searchChatResults.value[currentSearchMatch.value])
}

const prevSearchMatch = async () => {
  if (searchChatResults.value.length === 0) return
  currentSearchMatch.value = (currentSearchMatch.value - 1 + searchChatResults.value.length) % searchChatResults.value.length
  await nextTick()
  scrollToMatch(searchChatResults.value[currentSearchMatch.value])
}

const scrollToMatch = (res: { chatIndex: number; matchIndex: number }) => {
  setTimeout(() => {
    const matchId = `match-${res.chatIndex}-${res.matchIndex}`
    const el = document.getElementById(matchId) || document.getElementById(`chat-message-${res.chatIndex}`)
    if (!el) return
    const scrollEl = (cachedScrollEl as HTMLElement) ?? document.querySelector<HTMLElement>('#chat-scroll-container .simplebar-content-wrapper')
    if (scrollEl) {
      const elRect = el.getBoundingClientRect()
      const containerRect = scrollEl.getBoundingClientRect()
      const targetScrollTop = scrollEl.scrollTop + (elRect.top - containerRect.top) - containerRect.height / 2 + elRect.height / 2
      scrollEl.scrollTo({ top: targetScrollTop, behavior: 'smooth' })
    } else el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 150)
}

const products = ref<any[]>([])
const isLoadingProducts = ref(false)
const filteredProducts = computed(() => {
  if (!debouncedSearchKatalog.value) return products.value
  const query = debouncedSearchKatalog.value.toLowerCase()
  return products.value.filter((p) => p.Nama_Produk?.toLowerCase().includes(query) || p.Slug?.toLowerCase().includes(query))
})

const fetchProducts = async () => {
  if (products.value.length > 0) return
  isLoadingProducts.value = true
  try {
    const { data } = await api.get('/api/realEstate/getAll', { headers: { 'X-Jenis-User': 'Admin' } })
    products.value = data.Data
  } catch (err) {
    console.error('Fetch products error:', err)
  } finally {
    isLoadingProducts.value = false
  }
}

watch([openEtalase, openAppointment], ([newEtalase, newAppointment]) => {
  if (newEtalase || newAppointment) {
    if (products.value.length === 0) isLoadingProducts.value = true
    fetchProducts()
  }
})

const sendProduct = async (product: any) => {
  if (isSendingImage.value) return
  isSendingImage.value = true

  const config = { headers: { 'X-Jenis-User': 'admin' } }
  try {
    const formatCurrency = (val: number) => (!val ? 'Rp 0' : 'Rp ' + val.toLocaleString('id-ID'))
    let template = `🏡 *${product.Nama_Produk}*\n`
    const category = product.Tipe
    const location = product.Area && product.Area.length ? product.Area.join(', ') : ''
    template += `🏷️ ${category} | ${location}\n`

    const isSewa = product.Status_Transaksi && product.Status_Transaksi.includes('Sewa')
    const hargaType = isSewa ? 'Sewa' : 'Jual'
    const hargaValue = hargaType == 'Sewa' ? (product.Harga_Sewa2 == 0 ? product.Harga_Sewa1 : product.Harga_Sewa1) : product.Harga_Jual2 == 0 ? product.Harga_Jual1 : product.Harga_Jual1

    template += `💰 *Harga ${hargaType}: ${formatCurrency(hargaValue)}*\n\n`
    template += `📐 LT: ${product.Luas_Tanah || 0} m² | LB: ${product.Luas_Bangunan || 0} m²\n`
    template += `🛌 KT: ${product.Kamar_Tidur || 0} | 🚿 KM: ${product.Kamar_Mandi || 0}\n`
    if (product.Akses_Jalan && product.Akses_Jalan.length) template += `🛣️ Akses: ${product.Akses_Jalan.join(' | ')}\n`
    template += `📄 Legalitas: ${product.Jenis_Sertifikat || 'SHM'}\n\n📝 *Deskripsi:*\n${product.Keterangan || ''}`

    let urlMedia = ''
    if (product.MediaUrls && product.MediaUrls.length > 0) {
      const idMedia = product.MediaUrls[0].Id_Media || ''
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
    }

    if (!urlMedia) return fail('Properti tidak memiliki gambar base64 valid')

    let formattedPhone = props.phoneNumber.replace(/\D/g, '')
    if (formattedPhone.startsWith('0')) formattedPhone = '62' + formattedPhone.substring(1)

    console.log('mengirim_gambar')
    const payload = {
      PhoneNumber: formattedPhone + '@s.whatsapp.net',
      FileUrl: urlMedia,
      FileName: `product_${product.No_Id || 'image'}.jpg`,
      MimeType: 'image/jpeg',
      Caption: template
    }

    await api.post('/api/waha/send-image', payload, config)

    const mediaName = product.File_Image?.[0] || 'img'
    const idPaket = `${product.No_Id}_${mediaName}`

    await sendChat('system_image_product', template, undefined, undefined, idPaket, urlMedia)

    openEtalase.value = false
  } catch {
    fail('Gagal mengirim properti ke WhatsApp')
  } finally {
    isSendingImage.value = false
  }
}

const endChat = () => takeOverChat(true)

const reinitPreline = async () => {
  await nextTick()
  if (window.HSStaticMethods && typeof window.HSStaticMethods.autoInit === 'function') {
    window.HSStaticMethods.autoInit()
  }
}

const openSidebar = (): void => {
  const sidebarElement = document.querySelector<HTMLElement>('#hs-offcanvas-left')
  if (sidebarElement && (window as any).HSOverlay) (window as any).HSOverlay.open(sidebarElement)
}

let cachedScrollEl: Element | null = null
const scrollToBottom = async () => {
  await nextTick()
  const scroll = () => {
    if (cachedScrollEl && typeof (cachedScrollEl as HTMLElement).scrollTo === 'function') {
      const el = cachedScrollEl as HTMLElement
      el.scrollTo({ top: el.scrollHeight + 5000, behavior: 'auto' })
    }
  }

  // Double trigger to ensure we catch layout changes
  requestAnimationFrame(scroll)
  setTimeout(scroll, 50)
  setTimeout(scroll, 200) // Safety for slow image loads
}

const sendChat = async (type: string, url?: string, targetRoomId?: string, targetPhone?: string, idPaket?: string, mediaUrl?: string, usernameCS?: string) => {
  if (!type.includes('system') && !sendChatContent.value.trim()) return

  const activeRoomId = targetRoomId || props.roomId
  const activePhone = targetPhone || props.phoneNumber
  if (!activeRoomId) return

  const myId = localStorage.getItem('no_id') || ''
  const role = localStorage.getItem('role_user') || ''
  const username = type === 'system_masuk_tukar' ? usernameCS : localStorage.getItem('nama_display')
  const now = new Date()
  const sentAt = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 19)

  const resetInputHeight = () => {
    if (chatInputRef.value) chatInputRef.value.style.height = '40px'
  }

  let currentUserIds: string[] = [myId]
  const isCurrentActiveRoom = activeRoomId === props.roomId
  if (isCurrentActiveRoom && props.chats?.length > 0) {
    const lastChat = props.chats[props.chats.length - 1]
    if (lastChat.User_Ids && Array.isArray(lastChat.User_Ids)) currentUserIds = [...lastChat.User_Ids]
  }
  if (myId && !currentUserIds.includes(myId)) currentUserIds.push(myId)

  let formattedPhone = activePhone.replace(/\D/g, '')
  if (formattedPhone.startsWith('0')) formattedPhone = '62' + formattedPhone.substring(1)

  let messageText = ''
  if (type === 'system_masuk' || type === 'system_masuk_tukar') messageText = username + '_X7#mQ9!vW2_Bergabung'
  else if (type === 'system_keluar' || type === 'system_keluar_tukar') messageText = username + '_X7#mQ9!vW2_Keluar'
  else messageText = sendChatContent.value

  const tempIndex = props.chats.length
  if (isCurrentActiveRoom) {
    emit('addChat', {
      Message: type.includes('system_image') ? url : messageText,
      Sent_At: sentAt,
      Sender_Id: myId,
      Tipe_User: role,
      Jenis_Pesan: type.includes('system') ? type : 'text',
      Send_Status: 'pending',
      Room_Id: activeRoomId,
      User_Ids: currentUserIds,
      Username_User: username || '',
      Telepon_User: myId,
      Media_Url: mediaUrl || ''
    } as unknown as Chat)
    sendChatContent.value = ''
    resetInputHeight()
    scrollToBottom()
  }

  try {
    if (!type.includes('system')) {
      await api.post('/api/waha/send-text', { ChatId: formattedPhone + '@s.whatsapp.net', ReplyTo: null, Text: messageText, LinkPreview: true, LinkPreviewHighQuality: false, Session: 'session_OtpWaha' }, { headers: { 'X-Jenis-User': 'admin' } })
    }
    await api.post('/api/chat/create', { Chat: { Jenis_Pesan: type.includes('system') ? type : 'text', Sent_At: sentAt, Sender_Id: myId, Tipe_User: role, Message: type.includes('system_image') ? url : messageText, Id_Paket: type == 'system_image_product' ? idPaket : null, No_Pesanan: null, No_Penawaran: type == 'system_image_appointment' ? idPaket : null, Send_Status: 'send' }, Room_Id: activeRoomId, User_Ids: currentUserIds }, { headers: { 'X-Jenis-User': 'admin' } })
    if (isCurrentActiveRoom) emit('updateChatStatus', { index: tempIndex, status: 'send' })
    if ((type === 'system_keluar' || type === 'system_masuk_tukar') && isCurrentActiveRoom) emit('clearRoom')
  } catch (err: any) {
    if (isCurrentActiveRoom) emit('updateChatStatus', { index: tempIndex, status: 'failed' })

    // Mengambil pesan utama
    const errorMessage = err?.message || 'Terjadi kesalahan yang tidak diketahui'
    console.log('Pesan Error:', errorMessage)

    // Mengambil detail lengkap beserta baris kodenya (Stack Trace)
    const errorStack = err?.stack
    console.log('Detail Stack:', errorStack)
  }
}

const takeOverChat = async (status: boolean, phoneNumber?: string, roomId?: string) => {
  const targetPhone = phoneNumber || props.phoneNumber
  const targetRoom = roomId || props.roomId || undefined
  try {
    await api.post('/api/chat/toggle-bot', { customer_phone: targetPhone, admin_id: localStorage.getItem('no_id'), status_bot: status }, { headers: { 'X-Jenis-User': 'admin' } })
    if (status == false) await sendChat('system_masuk', undefined, targetRoom, targetPhone)
    else await sendChat('system_keluar', undefined, targetRoom, targetPhone)
    emit('chatTakeOver')
  } catch (err: any) {
    if (err.response?.data?.Message?.includes('Percakapan ini sudah diambil alih')) fail('Percakapan ini sudah diambil alih Admin lain')
    else fail(status == false ? 'Ambil alih percakapan gagal' : 'Akhiri percakapan gagal')
  }
}

const saveUsername = async () => {
  try {
    const config = { headers: { 'X-Jenis-User': 'admin' } }
    const res = await api.get(`/api/customer/getAll?no_id=${props.idLawan}`, config)
    const customerData = res.data.Data[0]
    await api.put(`/api/customer/update?no_id=${props.idLawan}`, { ...customerData, UserName: username.value }, config)
    emit('usernameChange', username.value!)
    changeUsername.value = false
  } catch (err: any) {
    alert(err.response?.data?.Message || err.message || 'Terjadi kesalahan sistem')
  }
}

const chooseImages = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  const newFiles = Array.from(target.files).map((file) => ({ id: crypto.randomUUID(), file: file, url: URL.createObjectURL(file), caption: '' }))
  previewImages.value = newFiles
  activeIndex.value = 0
  isPreviewOpen.value = true
  target.value = ''
}

const triggerAddMore = () => addMoreInput.value?.click()

const createPreviewItems = (fileList: FileList | null): PreviewImage[] => {
  if (!fileList) return []
  return Array.from(fileList).map((file) => ({ id: crypto.randomUUID(), file: file, url: URL.createObjectURL(file), caption: '' }))
}

const handleAddMore = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newImages = createPreviewItems(target.files)
  previewImages.value = [...previewImages.value, ...newImages]
  target.value = ''
  if (newImages.length > 0) activeIndex.value = previewImages.value.length - newImages.length
}

const closePreview = () => {
  previewImages.value.forEach((img) => URL.revokeObjectURL(img.url))
  previewImages.value = []
  activeIndex.value = 0
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
  })
}

const sendImages = async () => {
  if (isSendingImage.value) return
  isSendingImage.value = true
  const config = { headers: { 'X-Jenis-User': 'admin' } }
  try {
    const payloads = await Promise.all(
      previewImages.value.map(async (item) => {
        const base64String = await fileToBase64(item.file)
        return { PhoneNumber: props.phoneNumber + '@s.whatsapp.net', FileUrl: base64String, FileName: item.file.name, MimeType: item.file.type, Caption: item.caption }
      })
    )
    for (const item of payloads) {
      await api.post('/api/waha/send-image', item, config)
      sendChat('system_image', item.Caption + '_' + item.FileUrl)
    }
    closePreview()
  } finally {
    isSendingImage.value = false
  }
}

const setInitialFiles = (fileList: FileList) => {
  previewImages.value.forEach((item) => URL.revokeObjectURL(item.url))
  previewImages.value = createPreviewItems(fileList)
}

const removeImage = (index: number) => {
  URL.revokeObjectURL(previewImages.value[index].url)
  previewImages.value.splice(index, 1)
  if (previewImages.value.length === 0) closePreview()
  else if (activeIndex.value >= index) activeIndex.value = Math.max(0, activeIndex.value - 1)
}

defineExpose({ setInitialFiles })

watch(
  () => props.roomId,
  (newRoomId, oldRoomId) => {
    if (newRoomId !== oldRoomId) {
      changeUsername.value = false
      previewImages.value = []
      closePreview()
    }
  }
)

const adjustInputHeight = () => {
  const textarea = chatInputRef.value
  if (!textarea) return
  textarea.style.height = 'auto' // Important: reset height to auto to calculate scrollHeight correctly
  const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 150)
  textarea.style.height = `${newHeight}px`
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendChat('text')
  }
}

const initScrollListener = () => {
  setTimeout(() => {
    cachedScrollEl = document.querySelector('#chat-scroll-container .simplebar-content-wrapper')
    if (cachedScrollEl) {
      cachedScrollEl.removeEventListener('scroll', handleScroll)
      cachedScrollEl.addEventListener('scroll', handleScroll)
      handleScroll()
    }
  }, 100)
}

const handleScroll = () => {
  if (!cachedScrollEl) return
  const { scrollTop, scrollHeight, clientHeight } = cachedScrollEl as HTMLElement
  const isAtBottom = scrollHeight - Math.ceil(scrollTop + clientHeight) <= 15
  showScrollToBottom.value = scrollHeight > clientHeight && !isAtBottom
}

watch(
  () => props.chats.length,
  () => {
    scrollToBottom()
    setTimeout(handleScroll, 150)
  },
  { immediate: true }
)

watch(
  () => props.roomId,
  () => {
    cachedScrollEl = null
    showScrollToBottom.value = false
    initScrollListener()
    nextTick(() => reinitPreline())
  },
  { immediate: true }
)

watch(
  () => props.takeOverBatch,
  async (newVal) => {
    if (newVal && newVal.length > 0) {
      const takeOverSuccess: string[] = []
      for (const [, item] of newVal.entries()) {
        try {
          await takeOverChat(item.status, item.phoneNumber, item.room)
          takeOverSuccess.push(item.room)
        } catch {}
      }
      emit('takeOverStatus', takeOverSuccess)
    }
  },
  { deep: true }
)

watch(sendChatContent, () => nextTick(() => adjustInputHeight()))
let chatSearchTimeout: any = null
watch(searchChatQuery, (newVal) => {
  if (chatSearchTimeout) clearTimeout(chatSearchTimeout)
  chatSearchTimeout = setTimeout(() => {
    if (newVal.trim().length >= 2 || newVal.trim().length === 0) {
      handleSearchChat()
    }
  }, 500)
})

onMounted(() => {
  isMobile.value = window.innerWidth < 640
  document.addEventListener('click', handleClickOutside)
  reinitPreline()
  scrollToBottom()
  initScrollListener()
})

onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div class="chat-content-container w-full h-full overflow-hidden">
    <div v-if="roomId" class="w-full h-full flex flex-col bg-white">
      <div class="relative z-20 px-4 py-3 md:px-8 md:py-5 border-b border-slate-50 bg-white group">
        <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-bejo-50/50 to-transparent pointer-events-none"></div>
        <div class="absolute -right-20 -top-20 size-64 bg-bejo-100/30 rounded-full blur-3xl pointer-events-none transition-all duration-500 group-hover:scale-125"></div>

        <div ref="searchHeaderRef" class="relative z-10 flex justify-between items-center">
          <div v-if="!isSearchingChat" class="flex gap-2 sm:gap-5 items-center min-w-0 flex-1">
            <button @click="openSidebar" class="lg:hidden size-9 rounded-xl flex justify-center items-center bg-slate-50 hover:bg-bejo-50 text-slate-500 hover:text-bejo-600 transition-all duration-300 shadow-sm shrink-0">
              <Icon icon="lucide:menu" class="size-4"></Icon>
            </button>

            <div class="relative flex-shrink-0 flex items-center justify-center font-black rounded-2xl size-10 md:size-14 bg-gradient-to-br from-bejo-50 to-bejo-100/50 text-bejo-600 border border-white shadow-xl shadow-bejo-500/10">
              <span v-if="username" class="text-sm md:text-lg tracking-tighter">{{ username.substring(0, 2).toUpperCase() }}</span>
              <Icon v-else icon="lucide:user" class="size-5 md:size-7 text-bejo-300" />
              <span class="absolute -bottom-1 -right-1 size-2.5 md:size-4 border-2 border-white rounded-full bg-bejo-500 shadow-lg shadow-bejo-500/20 ring-1 ring-bejo-500/20"></span>
            </div>

            <div class="min-w-0 flex-1 overflow-hidden">
              <div class="flex items-center gap-1.5 mb-0 md:mb-1">
                <h6 class="text-slate-900 font-black text-xs md:text-xl tracking-tight capitalize leading-tight truncate max-w-[120px] md:max-w-none flex-1 min-w-0">
                  <template v-if="changeUsername">
                    <div class="flex items-center gap-2">
                      <input v-model="username" placeholder="Ubah nama..." class="bg-slate-50 border-transparent rounded-xl py-1.5 px-3 text-sm font-bold focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500 focus:bg-white transition-all outline-none border border-slate-100 shadow-inner" />
                      <button @click="saveUsername" class="text-[10px] font-black uppercase tracking-widest bg-bejo-500 text-white px-4 py-2 mt-0.5 rounded-lg shadow-lg shadow-bejo-500/20 hover:scale-105 active:scale-95 transition-all">Simpan</button>
                    </div>
                  </template>
                  <template v-else>
                    <span class="flex items-center gap-2 group/name cursor-pointer" @click="changeUsername = true">
                      {{ username || phoneNumber }}
                      <Icon icon="lucide:pencil" class="size-4 text-slate-300 group-hover/name:text-bejo-500 transition-colors" />
                    </span>
                  </template>
                </h6>
              </div>
              <p v-if="username" class="text-[9px] md:text-xs font-black text-slate-400 uppercase tracking-widest leading-none truncate">{{ phoneNumber }}</p>
            </div>
          </div>

          <div v-else class="flex-1 flex items-center gap-2 sm:gap-4 bg-slate-50/50 p-1 md:p-2 rounded-2xl border border-slate-100 animate-fade-in-right">
            <div class="relative flex-1 group/search">
              <button @click="handleSearchChat" class="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-bejo-600 transition-colors z-10" title="Cari">
                <Icon icon="lucide:search" class="size-4" />
              </button>
              <input v-model="searchChatQuery" ref="searchChatInputRef" type="text" placeholder="Cari dalam obrolan..." class="w-full bg-white border border-slate-200 rounded-xl py-2 md:py-2.5 pl-9 md:pl-11 pr-4 text-xs md:text-sm font-bold focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500 transition-all outline-none" @keydown.enter="handleSearchChat" @keydown.esc="toggleSearchChat" />
            </div>
            <div v-if="searchChatResults.length > 0" class="flex items-center gap-1 shrink-0">
              <span class="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest bg-white border border-slate-100 px-2 md:px-3 py-1.5 md:py-2 rounded-lg"> {{ currentSearchMatch + 1 }} / {{ searchChatResults.length }} </span>
              <div class="flex items-center gap-0.5 md:gap-1">
                <button @click.stop="prevSearchMatch" class="size-8 md:size-10 flex items-center justify-center rounded-lg md:rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-bejo-600 hover:bg-bejo-50 transition-all active:scale-90 shadow-sm"><Icon icon="lucide:chevron-up" class="size-4 md:size-5" /></button>
                <button @click.stop="nextSearchMatch" class="size-8 md:size-10 flex items-center justify-center rounded-lg md:rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-bejo-600 hover:bg-bejo-50 transition-all active:scale-90 shadow-sm"><Icon icon="lucide:chevron-down" class="size-4 md:size-5" /></button>
              </div>
            </div>
            <button @click.stop="toggleSearchChat" class="size-8 md:size-10 flex items-center justify-center rounded-lg md:rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90 shadow-sm"><Icon icon="lucide:x" class="size-4 md:size-5" /></button>
          </div>

          <div v-if="!isSearchingChat" class="flex items-center gap-2 sm:gap-3">
            <button @click.stop="toggleSearchChat" class="size-9 sm:size-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-bejo-600 hover:border-bejo-100 hover:bg-bejo-50 hover:shadow-lg hover:shadow-bejo-500/10 transition-all duration-300 flex items-center justify-center"><Icon icon="lucide:search" class="size-4 sm:size-5"></Icon></button>
            <button v-if="props.activeTab == 'chat_saya'" @click="endChat" title="Akhiri Percakapan" class="h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-red-500 border border-red-100 text-white hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 flex items-center justify-center gap-2 group"><Icon icon="lucide:log-out" class="size-4"></Icon><span class="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Akhiri</span></button>
          </div>
        </div>
      </div>

      <div v-if="isPreviewMode" class="flex-grow bg-bejo-50 min-h-0 relative flex flex-col overflow-hidden group">
        <div class="shrink-0 h-14 flex items-center px-4 z-5">
          <button @click="closePreview" :disabled="isSendingImage" class="size-9 flex items-center justify-center rounded-full text-bejo-600 transition-colors bg-white/50 backdrop-blur-sm" :class="isSendingImage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-bejo-300'"><Icon icon="lucide:x" class="size-6"></Icon></button>
        </div>
        <div v-if="activeImage" class="flex-grow flex flex-col min-h-0 h-full mb-2">
          <div class="flex-grow w-full flex items-center justify-center min-h-0 overflow-hidden px-4 md:px-8">
            <img :src="activeImage.url" :alt="'Preview ' + activeIndex" class="w-full h-full max-h-[70vh] object-contain rounded-2xl transition-all duration-300 shadow-sm" />
          </div>
          <div class="shrink-0 w-full px-4 mt-3 mb-1">
            <div class="max-w-2xl mx-auto relative">
              <input v-model="activeImage.caption" type="text" placeholder="Tambahkan keterangan..." class="w-full bg-white/80 backdrop-blur text-bejo-900 text-sm rounded-2xl px-10 py-2.5 border border-bejo-100 focus:ring-0 placeholder:text-bejo-400 shadow-md" />
              <div class="absolute inset-y-0 start-0 flex items-center ps-4 text-bejo-500"><Icon icon="lucide:text-initial" class="size-5"></Icon></div>
            </div>
          </div>
        </div>

        <div v-if="previewImages.length > 0" class="shrink-0 w-full bg-bejo-100 grid grid-cols-[1fr_auto] items-center border-t border-bejo-200">
          <div class="overflow-x-auto minimal-scrollbar w-full">
            <div class="flex items-center gap-4 w-max px-4 py-6">
              <div v-for="(item, index) in previewImages" :key="item.id" @click="activeIndex = index" class="relative size-16 shrink-0 rounded-xl cursor-pointer transition-all duration-300" :class="activeIndex === index ? 'scale-110 ring-4 ring-bejo-500 z-10' : 'ring-2 ring-transparent opacity-80 hover:opacity-100'">
                <img :src="item.url" class="w-full h-full object-cover rounded-lg" />
                <button @click.stop="removeImage(index)" :disabled="isSendingImage" class="absolute -top-2 -right-2 size-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md z-20" :class="isSendingImage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'"><Icon icon="lucide:x" class="size-3.5 stroke-[3]"></Icon></button>
              </div>
              <button @click="triggerAddMore" :disabled="isSendingImage" class="size-16 shrink-0 border-2 border-dashed border-bejo-400 rounded-xl flex flex-col items-center justify-center text-bejo-500 bg-white transition-colors" :class="isSendingImage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-bejo-50'"><Icon icon="lucide:plus" class="size-6" /><span class="text-[9px] font-bold mt-1 uppercase">Tambah</span></button>
            </div>
          </div>
          <div class="px-4 border-l border-bejo-200 h-full flex items-center justify-center">
            <button @click="sendImages" :disabled="isSendingImage" class="bg-bejo-500 hover:bg-bejo-600 text-white rounded-xl px-5 py-3 font-bold flex items-center gap-2 transition-all shadow-md" :class="isSendingImage ? 'opacity-75 cursor-not-allowed' : 'active:scale-95'">
              <span class="hidden sm:inline text-sm">{{ isSendingImage ? 'Mengirim...' : 'Kirim' }}</span
              ><Icon v-if="isSendingImage" icon="lucide:loader-2" class="size-4 animate-spin"></Icon><Icon v-else icon="lucide:send" class="size-4"></Icon>
            </button>
          </div>
        </div>
        <div v-else class="flex-grow flex flex-col items-center justify-center text-bejo-500">
          <Icon icon="lucide:image" class="size-16 mb-4 opacity-30"></Icon>
          <h4 class="font-bold text-bejo-700">Tidak ada gambar</h4>
          <p class="text-xs mt-1">Silahkan pilih gambar kembali</p>
        </div>
        <input type="file" ref="addMoreInput" multiple hidden accept="image/*" @change="handleAddMore" />
      </div>

      <div class="flex-grow min-h-0 relative overflow-hidden" :class="{ hidden: isPreviewMode }">
        <!-- Persistent Background Layer -->
        <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img :src="props.isDark ? bgChatDark : bgChat" class="w-full h-full object-cover opacity-15 grayscale-[20%] contrast-125" alt="" />
        </div>

        <simplebar id="chat-scroll-container" ref="chatContainer" class="h-full w-full relative z-10 bg-transparent">
          <div class="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/10 pointer-events-none"></div>

          <div v-if="props.isLoadingChat" class="relative z-10 flex flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
            <div v-for="n in 5" :key="n" class="flex w-full" :class="n % 2 === 0 ? 'justify-end' : 'justify-start'">
              <div class="flex flex-col gap-2" :class="n % 2 === 0 ? 'items-end' : 'items-start'" style="max-width: 65%">
                <div class="h-10 rounded-2xl bg-slate-200 animate-pulse" :style="{ width: 40 + ((n * 17) % 45) + '%', minWidth: '120px' }"></div>
                <div class="h-3 w-12 rounded-full bg-slate-100 animate-pulse"></div>
              </div>
            </div>
          </div>

          <div v-else class="relative z-10 flex flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
            <ChatBubble v-for="(chat, i) in chats" :id="'chat-message-' + i" :key="i" :idx="i" :chat="chat" :chats="chats" :lastMessageId="props.lastMessageId" :highlight="searchChatQuery" :isActiveMatch="i === activeSearchChatIndex" :activeMatchIndex="activeSearchMatchIndex" @imageLoaded="scrollToBottom" />
          </div>
        </simplebar>

        <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="transform translate-y-4 opacity-0 scale-95" enter-to-class="transform translate-y-0 opacity-100 scale-100" leave-active-class="transition duration-200 ease-in" leave-from-class="transform translate-y-0 opacity-100 scale-100" leave-to-class="transform translate-y-4 opacity-0 scale-95">
          <button v-if="showScrollToBottom" @click="scrollToBottom" class="absolute bottom-6 left-1/2 -translate-x-1/2 h-10 md:h-12 px-5 rounded-full bg-slate-400/50 backdrop-blur-md shadow-xl shadow-slate-900/10 border border-white/20 flex items-center gap-2 text-white hover:bg-slate-400/70 hover:scale-105 active:scale-95 transition-all z-50 group" title="Geser ke bawah">
            <span class="text-xs md:text-sm font-black uppercase tracking-wider">Scroll</span>
            <Icon icon="lucide:chevron-down" class="size-4 md:size-5 group-hover:animate-bounce" />
            <div class="absolute inset-0 rounded-full bg-white/5 scale-0 group-hover:scale-100 transition-transform duration-500"></div>
          </button>
        </Transition>
      </div>

      <div v-if="!isLoadingChat" class="p-1 md:p-6 bg-white border-t border-slate-50" :class="{ hidden: isPreviewMode }">
        <div v-if="activeTab != 'bot'" class="flex gap-1 md:gap-4 items-center bg-slate-50 p-1.5 md:p-2.5 pl-2 md:pl-4 rounded-xl md:rounded-[1.5rem] border border-transparent focus-within:border-bejo-500/20 focus-within:bg-white focus-within:ring-8 focus-within:ring-bejo-500/5 focus-within:shadow-xl focus-within:shadow-bejo-500/5 transition-all duration-300">
          <div class="relative" ref="dropdownRef">
            <button @click.stop="openMenu = !openMenu" class="size-9 md:size-11 rounded-xl md:rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-bejo-600 hover:border-bejo-100 hover:shadow-lg hover:shadow-bejo-500/10 transition-all duration-300 flex items-center justify-center">
              <Icon icon="lucide:plus" class="size-5 md:size-6 transition-transform duration-300" :class="{ 'rotate-45': openMenu }"></Icon>
            </button>

            <div v-if="openMenu" class="absolute bottom-[calc(100%+16px)] left-0 min-w-[220px] bg-white shadow-2xl shadow-slate-900/10 border border-slate-50 rounded-[1.5rem] p-2 z-50 transform origin-bottom-left transition-all animate-fade-in-up">
              <button @click.stop="handleOpenEtalase" class="flex items-center gap-3.5 w-full text-left px-4 py-3 hover:bg-bejo-50 text-slate-600 hover:text-bejo-600 rounded-xl text-[13px] font-bold transition-all">
                <div class="size-8 rounded-lg bg-bejo-100 flex items-center justify-center text-bejo-600">
                  <Icon icon="lucide:blocks" class="size-4" />
                </div>
                <span>Pilih Etalase</span>
              </button>
              <button @click.stop="handleOpenAppointment" class="flex items-center gap-3.5 w-full text-left px-4 py-3 hover:bg-bejo-50 text-slate-600 hover:text-bejo-600 rounded-xl text-[13px] font-bold transition-all">
                <div class="size-8 rounded-lg bg-bejo-100 flex items-center justify-center text-bejo-600">
                  <Icon icon="lucide:calendar-plus" class="size-4" />
                </div>
                <span>Buat Janji Temu</span>
              </button>
              <div class="h-px bg-slate-50 my-2"></div>
              <button @click.stop="handleOpenTukarCS" class="flex items-center gap-3.5 w-full text-left px-4 py-3 hover:bg-bejo-50 text-slate-600 hover:text-bejo-600 rounded-xl text-[13px] font-bold transition-all">
                <div class="size-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                  <Icon icon="lucide:repeat" class="size-4" />
                </div>
                <span>Alihkan ke CS Lain</span>
              </button>
            </div>
          </div>

          <textarea ref="chatInputRef" v-model="sendChatContent" @keydown="handleKeydown" class="flex-1 min-w-0 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-bold px-1 md:px-2 py-[11px] resize-none overflow-y-auto custom-scrollbar transition-all duration-200" placeholder="Tulis pesan..." rows="1" style="height: 40px; min-height: 40px"></textarea>

          <div ref="containerRef" class="flex-shrink-0 flex items-center gap-1 md:gap-3 relative">
            <div class="relative">
              <button @click="showEmojiPicker = !showEmojiPicker" class="size-8 md:size-11 rounded-xl md:rounded-2xl bg-white border border-slate-100 text-slate-400 flex-shrink-0 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-all" :class="{ 'text-bejo-600 border-bejo-200 bg-bejo-50': showEmojiPicker }">
                <Icon icon="lucide:smile" class="size-4.5 md:size-6"></Icon>
              </button>

              <div v-if="showEmojiPicker" class="absolute bottom-[calc(100%+16px)] right-0 w-[280px] md:w-[320px] bg-white shadow-2xl shadow-slate-900/15 border border-slate-50 rounded-[1.5rem] p-3 z-[60] animate-fade-in-up">
                <div class="flex items-center justify-between mb-3 px-1">
                  <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Pilih Emoji</span>
                  <button @click="showEmojiPicker = false" class="text-slate-400 hover:text-slate-600"><Icon icon="lucide:x" class="size-4" /></button>
                </div>
                <div class="grid grid-cols-7 gap-1 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                  <button v-for="emoji in commonEmojis" :key="emoji" @click="addEmoji(emoji)" class="size-8 md:size-9 flex items-center justify-center text-lg md:text-xl hover:bg-slate-50 rounded-lg transition-all active:scale-90 select-none">
                    {{ emoji }}
                  </button>
                </div>
              </div>
            </div>
            <label class="size-8 md:size-11 rounded-xl md:rounded-2xl bg-white border border-slate-100 text-slate-400 flex-shrink-0 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-all">
              <Icon icon="lucide:image" class="size-4.5 md:size-6"></Icon>
              <input type="file" multiple hidden @change="chooseImages" accept="image/*" />
            </label>
            <button @click="sendChat('text')" class="h-8 px-3 md:px-6 rounded-xl md:rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-1.5 md:gap-3 shadow-xl shadow-bejo-500/20 active:scale-95 transition-all flex-shrink-0">
              <span class="hidden md:inline">Kirim</span>
              <Icon icon="lucide:send" class="size-3.5 md:size-4"></Icon>
            </button>
          </div>
        </div>

        <div v-else class="w-full">
          <button @click="takeOverChat(false)" class="w-full py-4 sm:py-4.5 bg-gradient-to-r from-bejo-500 to-bejo-600 hover:from-bejo-600 hover:to-bejo-700 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-2xl sm:rounded-[1.5rem] flex justify-center items-center gap-2 sm:gap-3 shadow-xl shadow-bejo-500/20 active:scale-[0.98] transition-all px-4">
            <Icon icon="lucide:message-square-plus" class="size-4 sm:size-5" />
            <span class="hidden xs:inline">Ambil Alih Percakapan</span>
            <span class="inline xs:hidden">Ambil Alih</span>
          </button>
        </div>
      </div>
    </div>
    <div v-else class="relative w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-50/50 overflow-hidden">
      <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px"></div>

      <button @click="openSidebar" class="absolute top-5 left-5 lg:hidden h-10 px-5 gap-2 rounded-xl flex justify-center items-center bg-white border border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50 font-semibold text-slate-700 transition-all z-10 active:scale-95">
        <Icon icon="lucide:menu" class="size-4"></Icon>
        <span class="text-sm">Buka Daftar Pesan</span>
      </button>

      <div class="flex flex-col items-center justify-center text-center p-10 bg-white/80 backdrop-blur-sm rounded-[2rem] border border-white shadow-xl shadow-slate-200/50 max-w-sm z-10 transform transition-all hover:scale-[1.02]">
        <div class="relative mb-6">
          <div class="absolute inset-0 bg-bejo-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div class="size-24 bg-gradient-to-br from-bejo-50 to-bejo-100 border-4 border-white text-bejo-600 rounded-full flex items-center justify-center shadow-lg relative">
            <Icon icon="lucide:message-square-dashed" class="size-10 stroke-[1.5]"></Icon>
          </div>
        </div>
        <h4 class="text-xl font-extrabold text-slate-800 tracking-tight">Mulai Percakapan</h4>
        <p class="text-sm text-slate-500 mt-2.5 leading-relaxed font-medium">Pilih pelanggan dari daftar di samping untuk mulai melihat dan membalas pesan.</p>
      </div>
    </div>
    <Teleport to="body">
      <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
        <div v-if="openEtalase || openAppointment" class="fixed inset-0 z-[150] flex items-center justify-center p-3 md:p-8">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="closeEtalase" />

          <div ref="etalaseRef" class="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-[2rem] shadow-2xl p-6 md:p-8 border border-slate-50 overflow-hidden flex flex-col z-10 animate-fade-in-up">
            <div v-if="isSendingImage && openEtalase" class="absolute inset-0 z-[100] bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center">
              <div class="size-16 relative mb-4">
                <div class="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-bejo-500 rounded-full border-t-transparent animate-spin"></div>
                <Icon icon="lucide:send" class="size-6 text-bejo-500 absolute top-1/2 left-1/2 -translate-x-[40%] -translate-y-[40%]" />
              </div>
              <h4 class="text-lg font-black text-slate-800 tracking-tight">Harap Tunggu...</h4>
              <p class="text-xs font-bold text-slate-500 text-center max-w-[250px] mt-1.5 leading-relaxed">Sistem sedang merangkai dan mengirim detail properti ke pelanggan Anda.</p>
            </div>

            <div class="flex items-center justify-between mb-6 px-2 shrink-0">
              <div class="flex items-center gap-3">
                <div class="size-10 rounded-2xl bg-gradient-to-br from-bejo-50 to-bejo-100 flex items-center justify-center text-bejo-600">
                  <Icon :icon="openAppointment ? 'lucide:calendar-search' : 'lucide:blocks'" class="size-5" />
                </div>
                <div>
                  <h4 class="text-slate-900 font-extrabold text-lg tracking-tight">{{ openAppointment ? 'Pilih Unit untuk Janji Temu' : 'Pilih Etalase' }}</h4>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Pilih unit untuk melanjutkan</p>
                </div>
              </div>
              <button @click.stop="closeEtalase" class="size-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                <Icon icon="lucide:x" class="size-5" />
              </button>
            </div>

            <div class="px-2 shrink-0">
              <div class="relative mb-4 group">
                <Icon icon="lucide:search" class="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-bejo-500 transition-colors" />
                <input type="text" v-model="searchKatalog" placeholder="Cari unit atau katalog..." class="w-full bg-slate-50 border-transparent rounded-2xl py-3 pl-11 pr-4 text-sm font-bold focus:bg-white focus:ring-8 focus:ring-bejo-500/5 focus:border-bejo-500 transition-all duration-300 shadow-inner" />
              </div>
              <div class="flex flex-wrap items-center gap-3 mb-6">
                <button type="button" @click.stop="openFilter = !openFilter" class="btn-trigger-filter flex-1 flex justify-center items-center py-3 bg-bejo-50 hover:bg-bejo-100 text-bejo-600 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all shadow-sm"><Icon icon="lucide:sliders-horizontal" class="size-4 mr-2" /> Filter Pencarian</button>
              </div>
            </div>

            <div class="overflow-y-auto px-2 custom-scrollbar flex-1 min-h-0">
              <div v-if="isLoadingProducts" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                <ProductCard v-for="i in 3" :key="'loading-' + i" :product="{}" is-loading />
              </div>
              <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                <ProductCard v-for="product in filteredProducts" :key="product.No_Id" :product="product" :disable-routing="true" :collapsible-details="true" :show-select-button="true" :is-expanded="activeExpandedProductId === product.No_Id" @toggle-expand="activeExpandedProductId = ($event === activeExpandedProductId ? null : $event)" @select="openAppointment ? handleSelectUnitForAppointment($event) : sendProduct($event)" />
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
        <div v-if="showAppointmentModal" class="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-8">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="showAppointmentModal = false" />

          <div class="relative w-full max-w-6xl max-h-[94vh] bg-white rounded-[2rem] shadow-2xl shadow-slate-900/20 flex flex-col overflow-hidden z-10 animate-fade-in-up">
            <div class="shrink-0 flex items-center justify-between px-6 md:px-8 py-4 md:py-5 border-b border-slate-100 bg-white">
              <div class="flex items-center gap-3">
                <div class="size-10 rounded-2xl bg-gradient-to-br from-bejo-50 to-bejo-100 flex items-center justify-center text-bejo-600 shadow-sm shadow-bejo-500/10">
                  <Icon icon="lucide:calendar-plus" class="size-5" />
                </div>
                <div>
                  <h3 class="text-slate-900 font-black text-base md:text-lg tracking-tight leading-none">Buat Janji Temu</h3>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 hidden sm:block">Klik tanggal pada kalender · Abu-abu = sudah ada jadwal</p>
                </div>
              </div>
              <button @click="showAppointmentModal = false" class="size-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90">
                <Icon icon="lucide:x" class="size-5" />
              </button>
            </div>

            <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[380px_1fr] overflow-hidden">
              <!-- Sidebar Form Left -->
              <div class="overflow-y-auto p-5 md:p-7 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/40 custom-scrollbar flex flex-col">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Detail Janji Temu</p>
                <div class="space-y-4 flex-1">
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tanggal Terpilih</label>
                    <div class="relative">
                      <Icon icon="lucide:calendar" class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4" :class="appointmentForm.tanggal ? 'text-bejo-500' : 'text-slate-300'" />
                      <input
                        type="text"
                        :value="appointmentForm.tanggal ? new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(appointmentForm.tanggal)) : 'Pilih pada kalender...'"
                        disabled
                        class="w-full rounded-2xl py-3 pl-11 pr-11 text-sm font-bold cursor-not-allowed shadow-inner transition-colors"
                        :class="appointmentForm.tanggal ? 'bg-bejo-50 border border-bejo-200 text-bejo-700' : 'bg-slate-50 border border-slate-100 text-slate-400'"
                      />
                      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-75" enter-to-class="opacity-100 scale-100">
                        <span v-if="appointmentForm.tanggal" class="absolute right-3.5 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center bg-bejo-500 rounded-full shadow-lg shadow-bejo-500/20"><Icon icon="lucide:check" class="size-3.5 text-white" /></span>
                      </Transition>
                    </div>
                  </div>
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Waktu <span class="text-red-400">*</span></label>
                    <div class="relative group">
                      <Icon icon="lucide:clock" class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 group-focus-within:text-bejo-500 transition-colors" :class="appointmentForm.waktu ? 'text-bejo-500' : 'text-slate-300'" />
                      <input type="time" v-model="appointmentForm.waktu" class="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold focus:bg-white focus:ring-8 focus:ring-bejo-500/5 focus:border-bejo-500 transition-all shadow-inner outline-none" />
                    </div>
                  </div>
                  <div class="h-px bg-slate-100 my-2"></div>
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block"> Nama Lengkap <span class="text-red-400">*</span> </label>
                    <input v-model="appointmentForm.namaLengkap" type="text" placeholder="Nama lengkap customer..." class="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:ring-8 focus:ring-bejo-500/5 focus:border-bejo-500 transition-all shadow-inner outline-none" />
                  </div>
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">No. Telepon</label>
                    <input v-model="appointmentForm.noTelp" type="text" placeholder="Nomor telepon..." class="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:ring-8 focus:ring-bejo-500/5 focus:border-bejo-500 transition-all shadow-inner outline-none" />
                  </div>
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Properti / Unit</label>
                    <input v-model="appointmentForm.properti" type="text" disabled class="w-full bg-slate-100 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-500 cursor-not-allowed shadow-inner outline-none" />
                  </div>
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Lokasi Survey</label>
                    <input v-model="appointmentForm.lokasi" type="text" disabled class="w-full bg-slate-100 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-500 cursor-not-allowed shadow-inner outline-none" />
                  </div>
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Catatan Tambahan</label>
                    <textarea v-model="appointmentForm.catatan" placeholder="Catatan khusus..." rows="3" class="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:ring-8 focus:ring-bejo-500/5 focus:border-bejo-500 transition-all shadow-inner outline-none resize-none" />
                  </div>
                </div>

                <div class="mt-8 flex gap-3">
                  <button @click="showAppointmentModal = false" class="flex-1 py-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm">Batal</button>
                  <button @click="saveNewAppointment" class="flex-[2] py-4 bg-gradient-to-r from-bejo-500 to-bejo-600 hover:from-bejo-600 hover:to-bejo-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-bejo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2.5">
                    <Icon icon="lucide:save" class="size-4" />
                    Simpan
                  </button>
                </div>
              </div>

              <!-- Main Calendar Content Right -->
              <div class="overflow-y-auto p-4 md:p-8 bg-white custom-scrollbar flex flex-col">
                <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 border border-slate-200 px-4 py-2 rounded-full"><span class="size-2 rounded-full bg-slate-400 shrink-0"></span>Terisi</span>
                    <span class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-bejo-600 bg-bejo-50 border border-bejo-100 px-4 py-2 rounded-full"><span class="size-2 rounded-full bg-bejo-500 shrink-0"></span>Tersedia</span>
                  </div>
                  <Transition enter-active-class="transition duration-300" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
                    <div v-if="appointmentForm.tanggal" class="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-2.5 rounded-2xl shadow-sm">
                      <Icon icon="lucide:check-circle" class="size-4" />
                      <span class="text-[11px] font-black uppercase tracking-widest">Dipilih: {{ appointmentForm.tanggal }}</span>
                    </div>
                  </Transition>
                </div>

                <div class="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-900/5 overflow-hidden p-2 md:p-6 transition-all hover:shadow-2xl hover:shadow-slate-900/10">
                  <FullCalendar :options="appointmentCalendarOptions" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
        <div v-if="openTukarCS" class="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-8">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="openTukarCS = false" />

          <div ref="tukarCSRef" class="relative w-full max-w-[390px] bg-white/95 backdrop-blur-md rounded-[2rem] shadow-2xl p-6 border border-slate-50 animate-fade-in-up">
            <div class="flex items-center justify-between mb-6 px-2">
              <h4 class="text-slate-900 font-extrabold text-lg tracking-tight">Alihkan ke CS Lain</h4>
              <button @click.stop="openTukarCS = false" class="size-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 transition-all">
                <Icon icon="lucide:x" class="size-5" />
              </button>
            </div>
            <div class="relative mb-5 group">
              <Icon icon="lucide:search" class="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-bejo-500 transition-colors" />
              <input v-model="searchCS" type="text" placeholder="Cari nama CS..." class="w-full bg-slate-50 border-transparent rounded-2xl py-3 pl-11 pr-4 text-sm font-bold focus:bg-white focus:ring-8 focus:ring-bejo-500/5 focus:border-bejo-500 transition-all shadow-inner" />
            </div>
            <div class="max-h-72 overflow-y-auto custom-scrollbar space-y-2 pr-1 min-h-[100px] relative">
              <div v-if="isFetchingAdmins" class="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                <Icon icon="lucide:loader-2" class="size-8 text-bejo-500 animate-spin" />
              </div>

              <div v-for="admin in filteredAdmins" :key="admin.No_Id" @click="handleTransferChat(admin)" class="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-100 group">
                <div class="flex items-center gap-3">
                  <div class="size-9 rounded-xl bg-gradient-to-br from-bejo-50 to-bejo-100 flex items-center justify-center text-bejo-600 font-black text-xs">
                    {{ admin.Nama_User.substring(0, 2).toUpperCase() }}
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-slate-700">{{ admin.Nama_User }}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ admin.Role }}</span>
                  </div>
                </div>
                <button class="flex items-center justify-center bg-white border border-slate-200 text-slate-400 size-9 rounded-xl shadow-sm group-hover:bg-bejo-500 group-hover:text-white group-hover:border-bejo-500 transition-all active:scale-90">
                  <Icon icon="lucide:check" class="size-4" />
                </button>
              </div>

              <div v-if="filteredAdmins && filteredAdmins.length === 0 && !isFetchingAdmins" class="flex flex-col items-center justify-center py-8 text-slate-400"></div>
            </div>
          </div>
        </div>
      </Transition>

      <Filter v-if="openFilter" @close="openFilter = false" ref="filterRef" class="z-[250] bg-white sm:shadow-none fixed left-1/2 bottom-20 -translate-x-1/2 w-[95vw] sm:w-[850px] sm:fixed sm:right-5 sm:bottom-24 sm:left-auto sm:translate-x-0 rounded-[2rem] shadow-2xl p-6 border border-slate-50 max-h-[85vh] overflow-y-auto custom-scrollbar" />
    </Teleport>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.bg-chat {
  background-image: v-bind(bgLightUrl);
  background-size: 400px;
}

:where([data-theme='dark']) .bg-chat {
  background-image: v-bind(bgDarkUrl);
  background-size: 400px;
}

.container {
  background-image: linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), v-bind(bgLightUrl);
  background-size: cover;
  background-position: center;
}

:deep(.simplebar-scrollbar::before) {
  background-color: var(--color-slate-400, #94a3b8) !important;
  opacity: 0.8 !important;
  border-radius: 10px !important;
  width: 6px !important;
  right: 2px !important;
}

:deep(.simplebar-track.simplebar-vertical) {
  width: 10px !important;
  background-color: transparent !important;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  @apply bg-transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-200 rounded-full hover:bg-slate-300 transition-colors;
}

.minimal-scrollbar {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: var(--color-bejo-300, #d1d5db) transparent;
}

.minimal-scrollbar::-webkit-scrollbar {
  height: 5px;
}

.minimal-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  margin-inline: 20px;
}

.minimal-scrollbar::-webkit-scrollbar-thumb {
  border-radius: 20px;
  @apply bg-bejo-400;
}

.minimal-scrollbar:active::-webkit-scrollbar-thumb,
.minimal-scrollbar:hover::-webkit-scrollbar-thumb {
  @apply bg-bejo-500;
}

.snap-start {
  scroll-snap-align: start;
}

:deep(.fc-day-booked) {
  background-color: #f8fafc !important;
  cursor: not-allowed !important;
  position: relative;
}

:deep(.fc-day-booked::after) {
  content: '';
  position: absolute;
  inset: 2px;
  border-radius: 8px;
  border: 1.5px dashed #cbd5e1;
  pointer-events: none;
}

:deep(.fc-day-booked .fc-daygrid-day-number) {
  color: #94a3b8 !important;
  font-weight: 900;
  text-decoration: line-through;
}
</style>
