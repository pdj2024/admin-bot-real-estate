<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, onUpdated, nextTick, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { confirm, success, fail } from '@/utils/sweet-alert'
import type { CalendarOptions, EventClickArg } from '@fullcalendar/core'
import type { DateClickArg } from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/vue3'
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
import Filter from './Filter.vue'
import ProductCard from '@/components/ProductCard.vue'
import { type Chat, type PreviewImage, calendarEvents } from './data'
import { type TakeOverPayload } from './SideBar.vue'

const etalaseRef = ref<HTMLElement | null>(null)
const appointmentFormRef = ref<HTMLElement | null>(null)
const tukarCSRef = ref<HTMLElement | null>(null)
const filterRef = ref<any | null>(null)
const scheduleRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const chatContainer = ref<any>(null)

const openMenu = ref(false)
const openEtalase = ref(false)
const openAppointment = ref(false)
const openAppointmentForm = ref(false)
const openTukarCS = ref(false)
const openFilter = ref(false)
const openSchedule = ref(false)
const isMobile = ref(false)
const changeUsername = ref(false)
const sendChatContent = ref('')
const isSendingImage = ref(false)
const searchKatalog = ref('')
const chatInputRef = ref<HTMLTextAreaElement | null>(null)

const username = defineModel<string>('username')
const bgLightUrl = `url(${bgChat})`
const bgDarkUrl = `url(${bgChatDark})`

const isPreviewMode = computed(() => previewImages.value.length > 0)
const isPreviewOpen = ref(false)
const previewImages = ref<PreviewImage[]>([])
const activeIndex = ref(0)
const activeImage = computed(() => previewImages.value[activeIndex.value])
const addMoreInput = ref<HTMLInputElement | null>(null)

const props = defineProps<{
  roomId: string | null
  idLawan: string
  username: string
  phoneNumber: string
  activeTab: string
  chats: Chat[]
  lastMessageId: string
  takeOverBatch: TakeOverPayload[]
}>()

const emit = defineEmits<{
  (e: 'chatTakeOver'): void
  (e: 'clearRoom'): void
  (e: 'usernameChange', value: string): void
  (e: 'takeOverStatus', value: string[]): void
}>()

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node

  const interactiveRefs = [containerRef.value, etalaseRef.value, appointmentFormRef.value, tukarCSRef.value, scheduleRef.value, filterRef.value?.$el]

  if (interactiveRefs.some((el) => el && el.contains(target))) {
    return
  }

  if (!openFilter.value && !openAppointmentForm.value && !openSchedule.value) {
    openMenu.value = false
    openEtalase.value = false
    openAppointment.value = false
    openTukarCS.value = false
  }
}

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: 'dayGridMonth',
  locale: idLocale,
  height: 'auto',
  contentHeight: 650,
  aspectRatio: 1.8,

  headerToolbar: isMobile.value
    ? {
        left: 'prev,next',
        center: 'title',
        right: ''
      }
    : {
        left: 'prev,next,today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,dayGridDay,listWeek'
      },

  footerToolbar: isMobile.value
    ? {
        center: 'dayGridMonth,timeGridWeek,listWeek'
      }
    : (false as const),
  editable: true,
  selectable: true,
  events: calendarEvents,
  dateClick(info: DateClickArg) {
    if (Array.isArray(info)) {
      fail('Jadwal telah terisi ' + info)
    } else {
      success('berhasil')
    }
  },
  eventClick(info: EventClickArg) {
    const event = info.event
    const data = event.extendedProps
    // console.log(data.customer)
    openSchedule.value = false
  }
}))

const closeEtalase = () => {
  openEtalase.value = !openEtalase.value
  if (openFilter.value == true) {
    openFilter.value = !openFilter.value
  }
}

const handleOpenEtalase = () => {
  openEtalase.value = !openEtalase.value
  if (openEtalase.value) {
    openAppointment.value = false
    openTukarCS.value = false
    openMenu.value = false
  }
}

const handleOpenAppointment = () => {
  openAppointment.value = !openAppointment.value
  if (openAppointment.value) {
    openEtalase.value = false
    openTukarCS.value = false
    openMenu.value = false
  }
}

const handleOpenTukarCS = () => {
  openTukarCS.value = !openTukarCS.value
  if (openTukarCS.value) {
    openEtalase.value = false
    openAppointment.value = false
    openMenu.value = false
  }
}

const products = ref<any[]>([])
const isLoadingProducts = ref(false)
const filteredProducts = computed(() => {
  if (!searchKatalog.value) return products.value
  const query = searchKatalog.value.toLowerCase()
  return products.value.filter((p) => p.Nama_Produk?.toLowerCase().includes(query) || p.Slug?.toLowerCase().includes(query))
})

const fetchProducts = async () => {
  if (products.value.length > 0) return
  isLoadingProducts.value = true
  try {
    const { data } = await api.get('/api/realEstate/getAll', {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    products.value = data.Data
  } catch (err) {
    console.error('Fetch products error:', err)
  } finally {
    isLoadingProducts.value = false
  }
}

watch(openEtalase, (newVal) => {
  if (newVal) fetchProducts()
})

const sendProduct = async (product: any) => {
  if (isSendingImage.value) return
  isSendingImage.value = true

  const config = { headers: { 'X-Jenis-User': 'admin' } }

  try {
    const formatCurrency = (val: number) => {
      if (!val) return 'Rp 0'
      return 'Rp ' + val.toLocaleString('id-ID')
    }

    let template = `🏡 *${product.Nama_Produk}*\n`

    const category = product.Tipe
    const location = product.Area && product.Area.length ? product.Area.join(', ') : ''
    template += `🏷️ ${category} | ${location}\n`

    const isSewa = product.Status_Transaksi && product.Status_Transaksi.includes('Sewa')
    const hargaType = isSewa ? 'Sewa' : 'Jual'
    let hargaValue = 0

    if(hargaType == "Sewa"){
      hargaValue = product.Harga_Sewa2 == 0 ? product.Harga_Sewa1 : product.Harga_Sewa1
    }else{
      hargaValue = product.Harga_Jual2 == 0 ? product.Harga_Jual1 : product.Harga_Jual1
    }

    template += `💰 *Harga ${hargaType}: ${formatCurrency(hargaValue)}*\n\n`

    template += `📐 LT: ${product.Luas_Tanah || 0} m² | LB: ${product.Luas_Bangunan || 0} m²\n`
    template += `🛌 KT: ${product.Kamar_Tidur || 0} | 🚿 KM: ${product.Kamar_Mandi || 0}\n`

    if (product.Akses_Jalan && product.Akses_Jalan.length) {
      template += `🛣️ Akses: ${product.Akses_Jalan.join(' | ')}\n`
    }

    template += `📄 Legalitas: ${product.Jenis_Sertifikat || 'SHM'}\n`

    template += `\n📝 *Deskripsi:*\n${product.Keterangan || ''}`

    let urlMedia = ''

    if (product.MediaUrls && product.MediaUrls.length > 0) {
      const idMedia = product.MediaUrls[0].Id_Media || ''

      if (idMedia.includes('base64,')) {
        urlMedia = idMedia
      } else if (idMedia.startsWith('http')) {
        try {
          const response = await fetch(idMedia)
          const blob = await response.blob()

          urlMedia = await new Promise((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.readAsDataURL(blob)
          })
        } catch (error) {
          console.error('Gagal mengambil gambar dari URL:', error)
          urlMedia = idMedia
        }
      } else {
        urlMedia = idMedia
      }
    }

    if (!urlMedia) {
      fail('Properti tidak memiliki gambar base64 valid')
      return
    }

    let formattedPhone = props.phoneNumber.replace(/\D/g, '')
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.substring(1)
    }

    const payload = {
      PhoneNumber: formattedPhone + '@s.whatsapp.net',
      FileUrl: urlMedia,
      FileName: `product_${product.No_Id || 'image'}.jpg`,
      MimeType: 'image/jpeg',
      Caption: template
    }

    await api.post('/api/waha/send-image', payload, config)

    // Create the ID for media cloud fetching (ex: prd_2_media_130)
    const mediaName = product.File_Image?.[0] || 'img'
    const idPaket = `${product.No_Id}_${mediaName}`

    // Now just send the template text with idPaket handling the image fetching
    await sendChat('system_image', template, undefined, undefined, idPaket, urlMedia)
    openEtalase.value = false
  } catch (err) {
    console.error('Terjadi kesalahan saat mengirim gambar properti:', err)
    fail('Gagal mengirim properti ke WhatsApp')
  } finally {
    isSendingImage.value = false
  }
}

const closeAppointment = () => {
  openAppointment.value = !openAppointment.value
  if (openFilter.value == true) {
    openFilter.value = !openFilter.value
  }
  if (openAppointmentForm.value == true) {
    openAppointmentForm.value = !openAppointmentForm.value
  }
}

const saveAppointment = () => {
  confirm('Apakah isian data sudah benar?', () => {
    openAppointmentForm.value = false
    openAppointment.value = false
    success('Berhasil membuat janji temu')
  })
}

const endChat = () => {
  takeOverChat(true)
}

const tukarCS = (text: string) => {
  confirm('Ingin mengalihkan percakapan kepada CS ' + text + '?', () => {
    success('Berhasil mengalihkan chat ke CS ' + text)
  })
}

const reinitPreline = async () => {
  await nextTick()
  if (window.HSStaticMethods && typeof window.HSStaticMethods.autoInit === 'function') {
    window.HSStaticMethods.autoInit()
  }
}

const openSidebar = (): void => {
  const sidebarElement = document.querySelector<HTMLElement>('#hs-offcanvas-left')
  if (sidebarElement && (window as any).HSOverlay) {
    ;(window as any).HSOverlay.open(sidebarElement)
  } else {
    console.warn('Sidebar atau Preline HSOverlay tidak ditemukan')
  }
}

const scrollToBottom = async () => {
  await nextTick()

  setTimeout(() => {
    // Gunakan ID spesifik agar tidak terbentur dengan simplebar di komponen lain (misal sidebar)
    const scrollElement = document.querySelector('#chat-scroll-container .simplebar-content-wrapper')

    if (scrollElement) {
      requestAnimationFrame(() => {
        if (typeof scrollElement.scrollTo === 'function') {
          scrollElement.scrollTo({
            top: scrollElement.scrollHeight + 5000,
            behavior: 'auto'
          })
        }
        scrollElement.scrollTop = scrollElement.scrollHeight + 5000
      })
    }
  }, 100)
}

const sendChat = async (type: string, url?: string, targetRoomId?: string, targetPhone?: string, idPaket?: string, mediaUrl?: string) => {
  if (!type.includes('system') && !sendChatContent.value.trim()) return

  const activeRoomId = targetRoomId || props.roomId
  const activePhone = targetPhone || props.phoneNumber

  if (!activeRoomId) return

  const myId = localStorage.getItem('no_id') || ''
  const role = localStorage.getItem('role_user') || ''
  const username = localStorage.getItem('nama_display') || ''

  const now = new Date()
  const sentAt = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 19)

  const resetInputHeight = () => {
    if (chatInputRef.value) {
      chatInputRef.value.style.height = '40px'
    }
  }

  let currentUserIds: string[] = [myId]

  const isCurrentActiveRoom = activeRoomId === props.roomId

  if (isCurrentActiveRoom && props.chats && props.chats.length > 0) {
    const lastChat = props.chats[props.chats.length - 1]
    if (lastChat.User_Ids && Array.isArray(lastChat.User_Ids)) {
      currentUserIds = [...lastChat.User_Ids]
    }
  }

  if (myId && !currentUserIds.includes(myId)) {
    currentUserIds.push(myId)
  }

  let formattedPhone = activePhone.replace(/\D/g, '')
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '62' + formattedPhone.substring(1)
  }

  let messageText = ''
  if (type === 'system_masuk') {
    messageText = username + '_X7#mQ9!vW2_Bergabung'
  } else if (type === 'system_keluar') {
    messageText = username + '_X7#mQ9!vW2_Keluar'
  } else {
    messageText = sendChatContent.value
  }

  const tempIndex = props.chats.length

  if (isCurrentActiveRoom) {
    props.chats.push({
      Message: type == 'system_image' ? url : messageText,
      Sent_At: sentAt,
      Sender_Id: myId,
      Tipe_User: role,
      Jenis_Pesan: type.includes('system') ? type : 'text',
      Send_Status: 'pending',
      Room_Id: activeRoomId,
      User_Ids: currentUserIds,
      Username_User: username,
      Telepon_User: myId,
      Media_Url: mediaUrl || ''
    } as unknown as Chat)

    sendChatContent.value = ''
    resetInputHeight()
    scrollToBottom()
  }

  try {
    if (!type.includes('system')) {
      await api.post(
        '/api/waha/send-text',
        {
          ChatId: formattedPhone + '@s.whatsapp.net',
          ReplyTo: null,
          Text: messageText,
          LinkPreview: true,
          LinkPreviewHighQuality: false,
          Session: 'session_OtpWaha'
        },
        { headers: { 'X-Jenis-User': 'admin' } }
      )
    }

    await api.post(
      '/api/chat/create',
      {
        Chat: {
          Jenis_Pesan: type.includes('system') ? type : 'text',
          Sent_At: sentAt,
          Sender_Id: myId,
          Tipe_User: role,
          Message: type == 'system_image' ? url : messageText,
          Id_Paket: idPaket || null,
          No_Pesanan: null,
          No_Penawaran: null,
          Send_Status: 'send'
        },
        Room_Id: activeRoomId,
        User_Ids: currentUserIds
      },
      { headers: { 'X-Jenis-User': 'admin' } }
    )

    if (isCurrentActiveRoom && props.chats[tempIndex]) {
      props.chats[tempIndex].Send_Status = 'send'
    }

    if (type === 'system_keluar' && isCurrentActiveRoom) {
      emit('clearRoom')
    }
  } catch (err: any) {
    console.error('Gagal mengirim chat:', err.response?.data || err.message)

    if (isCurrentActiveRoom && props.chats[tempIndex]) {
      props.chats[tempIndex].Send_Status = 'failed'
    }
  }
}

const takeOverChat = async (status: boolean, phoneNumber?: string, roomId?: string) => {
  const targetPhone = phoneNumber || props.phoneNumber
  const targetRoom = roomId || props.roomId || undefined

  try {
    await api.post(
      '/api/chat/toggle-bot',
      {
        customer_phone: targetPhone,
        admin_id: localStorage.getItem('no_id'),
        status_bot: status
      },
      { headers: { 'X-Jenis-User': 'admin' } }
    )

    if (status == false) {
      await sendChat('system_masuk', undefined, targetRoom, targetPhone)
    } else {
      await sendChat('system_keluar', undefined, targetRoom, targetPhone)
    }

    emit('chatTakeOver')
  } catch (err: any) {
    const errorMessage = err.response?.data?.Message || ''
    if (errorMessage.includes('Percakapan ini sudah diambil alih')) {
      fail('Percakapan ini sudah diambil alih Admin lain')
      emit('chatTakeOver')
    } else {
      fail('Ambil alih percakapan gagal')
      console.error('Error take over:', err.response?.data || err.message)
    }
  }
}

const saveUsername = async () => {
  try {
    const config = { headers: { 'X-Jenis-User': 'admin' } }
    const url = `/api/customer/getAll?no_id=${props.idLawan}`

    const res = await api.get(url, config)

    const customerData = res.data.Data[0]

    await api.put(
      `/api/customer/update?no_id=${props.idLawan}`,
      {
        ...customerData,
        UserName: username.value
      },
      config
    )
    emit('usernameChange', username.value!)
    changeUsername.value = false
  } catch (err: any) {
    const errorMsg = err.response?.data?.Message || err.message || 'Terjadi kesalahan sistem'
    console.error('Error Detail:', errorMsg)
    alert(errorMsg)
  }
}

const chooseImages = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const newFiles = Array.from(target.files).map((file) => ({
    id: crypto.randomUUID(),
    file: file,
    url: URL.createObjectURL(file),
    caption: ''
  }))

  previewImages.value = newFiles
  activeIndex.value = 0

  isPreviewOpen.value = true

  target.value = ''
}

const triggerAddMore = () => {
  addMoreInput.value?.click()
}

const createPreviewItems = (fileList: FileList | null): PreviewImage[] => {
  if (!fileList) return []

  return Array.from(fileList).map((file) => ({
    id: crypto.randomUUID(),
    file: file,
    url: URL.createObjectURL(file),
    caption: ''
  }))
}

const handleAddMore = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newImages = createPreviewItems(target.files)

  previewImages.value = [...previewImages.value, ...newImages]
  target.value = ''
  if (newImages.length > 0) {
    activeIndex.value = previewImages.value.length - newImages.length
  }
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
  // console.log('Mengirim data gambar beserta caption:')

  try {
    const payloads = await Promise.all(
      previewImages.value.map(async (item) => {
        const base64String = await fileToBase64(item.file)

        return {
          PhoneNumber: props.phoneNumber + '@s.whatsapp.net',
          FileUrl: base64String,
          FileName: item.file.name,
          MimeType: item.file.type,
          Caption: item.caption
        }
      })
    )

    for (const item of payloads) {
      await api.post('/api/waha/send-image', item, config)
      sendChat('system_image', item.Caption + '_' + item.FileUrl)
    }

    closePreview()
  } catch (error) {
    console.error('Terjadi kesalahan saat mengirim gambar:', error)
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
  if (previewImages.value.length === 0) {
    closePreview()
  } else if (activeIndex.value >= index) {
    activeIndex.value = Math.max(0, activeIndex.value - 1)
  }
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

watch(
  () => props.chats,
  () => {
    scrollToBottom()
  },
  { deep: true, immediate: true }
)

watch(
  () => props.takeOverBatch,
  async (newVal) => {
    if (newVal && newVal.length > 0) {
      const takeOverSuccess: string[] = []

      for (const [idx, item] of newVal.entries()) {
        try {
          await takeOverChat(item.status, item.phoneNumber, item.room)
          takeOverSuccess.push(item.room)
        } catch (err: any) {
          console.error(`Gagal batch untuk room ${item.room}:`, err)
        }
      }

      emit('takeOverStatus', takeOverSuccess)
    }
  },
  { deep: true }
)

onMounted(() => {
  isMobile.value = window.innerWidth < 640
  document.addEventListener('click', handleClickOutside)
  reinitPreline()
  scrollToBottom()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

onUpdated(() => {
  reinitPreline()
})

const adjustInputHeight = () => {
  const textarea = chatInputRef.value
  if (!textarea) return

  textarea.style.height = '40px'
  const newHeight = Math.min(textarea.scrollHeight, 150)
  textarea.style.height = `${newHeight}px`
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendChat('text')
  }
}

watch(sendChatContent, () => {
  nextTick(() => {
    adjustInputHeight()
  })
})
</script>

<template>
  <div v-if="roomId" class="w-full h-full flex flex-col bg-white">
    <!-- Header: Premium Profile Section -->
    <div class="relative z-20 px-4 py-3 md:px-8 md:py-5 border-b border-slate-50 bg-white group">
      <!-- Ambient Background Decoration -->
      <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-bejo-50/50 to-transparent pointer-events-none"></div>
      <div class="absolute -right-20 -top-20 size-64 bg-bejo-100/30 rounded-full blur-3xl pointer-events-none transition-all duration-500 group-hover:scale-125"></div>

      <div class="relative z-10 flex justify-between items-center">
        <div class="flex gap-2 sm:gap-5 items-center min-w-0">
          <button @click="openSidebar" class="lg:hidden size-9 rounded-xl flex justify-center items-center bg-slate-50 hover:bg-bejo-50 text-slate-500 hover:text-bejo-600 transition-all duration-300 shadow-sm shrink-0">
            <Icon icon="lucide:menu" class="size-4"></Icon>
          </button>

          <div class="relative flex-shrink-0 flex items-center justify-center font-black rounded-2xl size-10 md:size-14 bg-gradient-to-br from-bejo-50 to-bejo-100/50 text-bejo-600 border border-white shadow-xl shadow-bejo-500/10">
            <span v-if="username" class="text-sm md:text-lg tracking-tighter">
              {{ username.substring(0, 2).toUpperCase() }}
            </span>
            <Icon v-else icon="lucide:user" class="size-5 md:size-7 text-bejo-300" />
            <span class="absolute -bottom-1 -right-1 size-2.5 md:size-4 border-2 border-white rounded-full bg-green-500 shadow-lg shadow-green-500/20 ring-1 ring-green-500/20"></span>
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

        <div class="flex items-center gap-2 sm:gap-3">
          <button class="size-9 sm:size-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-bejo-600 hover:border-bejo-100 hover:bg-bejo-50 hover:shadow-lg hover:shadow-bejo-500/10 transition-all duration-300 flex items-center justify-center">
            <Icon icon="lucide:search" class="size-4 sm:size-5"></Icon>
          </button>
          <button class="size-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-200 hover:shadow-sm transition-all duration-300 flex items-center justify-center">
            <Icon icon="lucide:more-vertical" class="size-5"></Icon>
          </button>
        </div>
      </div>
    </div>

    <div v-if="isPreviewMode" class="flex-grow bg-bejo-50 min-h-0 relative flex flex-col overflow-hidden group">
      <div class="shrink-0 h-14 flex items-center px-4 z-5">
        <button @click="closePreview" :disabled="isSendingImage" class="size-9 flex items-center justify-center rounded-full text-bejo-600 transition-colors bg-white/50 backdrop-blur-sm" :class="isSendingImage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-bejo-300'">
          <Icon icon="lucide:x" class="size-6"></Icon>
        </button>
      </div>

      <div v-if="activeImage" class="flex-grow flex flex-col min-h-0 h-full mb-2">
        <div class="flex-grow w-full flex items-center justify-center min-h-0 overflow-hidden px-4 md:px-8">
          <img :src="activeImage.url" :alt="'Preview ' + activeIndex" class="w-full h-full max-h-[70vh] object-contain rounded-2xl transition-all duration-300 shadow-sm" />
        </div>

        <div class="shrink-0 w-full px-4 mt-3 mb-1">
          <div class="max-w-2xl mx-auto relative">
            <input v-model="activeImage.caption" type="text" placeholder="Tambahkan keterangan..." class="w-full bg-white/80 backdrop-blur text-bejo-900 text-sm rounded-2xl px-10 py-2.5 border border-bejo-100 focus:ring-0 placeholder:text-bejo-400 shadow-md" />
            <div class="absolute inset-y-0 start-0 flex items-center ps-4 text-bejo-500">
              <Icon icon="lucide:text-initial" class="size-5"></Icon>
            </div>
          </div>
        </div>
      </div>

      <div v-if="previewImages.length > 0" class="shrink-0 w-full bg-bejo-100 grid grid-cols-[1fr_auto] items-center border-t border-bejo-200">
        <div class="overflow-x-auto minimal-scrollbar w-full">
          <div class="flex items-center gap-4 w-max px-4 py-6">
            <div v-for="(item, index) in previewImages" :key="item.id" @click="activeIndex = index" class="relative size-16 shrink-0 rounded-xl cursor-pointer transition-all duration-300" :class="activeIndex === index ? 'scale-110 ring-4 ring-bejo-500 z-10' : 'ring-2 ring-transparent opacity-80 hover:opacity-100'">
              <img :src="item.url" class="w-full h-full object-cover rounded-lg" />

              <button @click.stop="removeImage(index)" :disabled="isSendingImage" class="absolute -top-2 -right-2 size-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md z-20" :class="isSendingImage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'">
                <Icon icon="lucide:x" class="size-3.5 stroke-[3]"></Icon>
              </button>
            </div>

            <button @click="triggerAddMore" :disabled="isSendingImage" class="size-16 shrink-0 border-2 border-dashed border-bejo-400 rounded-xl flex flex-col items-center justify-center text-bejo-500 bg-white transition-colors" :class="isSendingImage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-bejo-50'">
              <Icon icon="lucide:plus" class="size-6" />
              <span class="text-[9px] font-bold mt-1 uppercase">Tambah</span>
            </button>
          </div>
        </div>

        <div class="px-4 border-l border-bejo-200 h-full flex items-center justify-center">
          <button @click="sendImages" :disabled="isSendingImage" class="bg-green-500 hover:bg-green-600 text-white rounded-xl px-5 py-3 font-bold flex items-center gap-2 transition-all shadow-md" :class="isSendingImage ? 'opacity-75 cursor-not-allowed' : 'active:scale-95'">
            <span class="hidden sm:inline text-sm">{{ isSendingImage ? 'Mengirim...' : 'Kirim' }}</span>
            <Icon v-if="isSendingImage" icon="lucide:loader-2" class="size-4 animate-spin"></Icon>
            <Icon v-else icon="lucide:send" class="size-4"></Icon>
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

    <simplebar id="chat-scroll-container" ref="chatContainer" class="flex-grow bg-slate-50 relative h-0 container bg-chat/5" :class="{ hidden: isPreviewMode }">
      <!-- Ambient Overlay for Chat Board -->
      <div class="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>

      <div class="relative z-10 flex flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
        <ChatBubble v-for="(chat, i) in chats" :key="i" :idx="i" :chat="chat" :chats="chats" :lastMessageId="props.lastMessageId" @imageLoaded="scrollToBottom" />
      </div>
    </simplebar>

    <div class="p-1 md:p-6 bg-white border-t border-slate-50" :class="{ hidden: isPreviewMode }">
      <div v-if="activeTab != 'bot'" class="flex gap-1 md:gap-4 items-center bg-slate-50 p-1.5 md:p-2.5 pl-2 md:pl-4 rounded-xl md:rounded-[1.5rem] border border-transparent focus-within:border-bejo-500/20 focus-within:bg-white focus-within:ring-8 focus-within:ring-bejo-500/5 focus-within:shadow-xl focus-within:shadow-bejo-500/5 transition-all duration-300">
        <div class="relative" ref="dropdownRef">
          <button @click.stop="openMenu = !openMenu" class="size-9 md:size-11 rounded-xl md:rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-bejo-600 hover:border-bejo-100 hover:shadow-lg hover:shadow-bejo-500/10 transition-all duration-300 flex items-center justify-center">
            <Icon icon="lucide:plus" class="size-5 md:size-6 transition-transform duration-300" :class="{ 'rotate-45': openMenu }"></Icon>
          </button>

          <div v-if="openMenu" class="absolute bottom-[calc(100%+16px)] left-0 min-w-[220px] bg-white shadow-2xl shadow-slate-900/10 border border-slate-50 rounded-[1.5rem] p-2 z-50 transform origin-bottom-left transition-all animate-fade-in-up">
            <button
              @click.stop="handleOpenEtalase"
              class="flex items-center gap-3.5 w-full text-left px-4 py-3 hover:bg-bejo-50 text-slate-600 hover:text-bejo-600 rounded-xl text-[13px] font-bold transition-all"
            >
              <div class="size-8 rounded-lg bg-bejo-100 flex items-center justify-center text-bejo-600">
                <Icon icon="lucide:blocks" class="size-4" />
              </div>
              <span>Pilih Etalase</span>
            </button>
            <button
              @click.stop="handleOpenAppointment"
              class="flex items-center gap-3.5 w-full text-left px-4 py-3 hover:bg-bejo-50 text-slate-600 hover:text-bejo-600 rounded-xl text-[13px] font-bold transition-all"
            >
              <div class="size-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <Icon icon="lucide:calendar-plus" class="size-4" />
              </div>
              <span>Buat Janji Temu</span>
            </button>
            <button
              @click.stop="handleOpenTukarCS"
              class="flex items-center gap-3.5 w-full text-left px-4 py-3 hover:bg-bejo-50 text-slate-600 hover:text-bejo-600 rounded-xl text-[13px] font-bold transition-all"
            >
              <div class="size-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                <Icon icon="lucide:repeat" class="size-4" />
              </div>
              <span>Alihkan ke CS Lain</span>
            </button>
            <div class="h-px bg-slate-50 my-2"></div>
            <button @click="endChat" class="flex items-center gap-3.5 w-full text-left px-4 py-3 hover:bg-red-50 text-red-500 rounded-xl text-[13px] font-bold transition-all">
              <div class="size-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                <Icon icon="lucide:log-out" class="size-4" />
              </div>
              <span>Akhiri Percakapan</span>
            </button>
          </div>
        </div>

        <textarea
          ref="chatInputRef"
          v-model="sendChatContent"
          @keydown="handleKeydown"
          class="flex-1 min-w-0 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-bold px-1 md:px-2 py-2 resize-none overflow-y-auto custom-scrollbar transition-all duration-200"
          placeholder="Tulis pesan..."
          rows="1"
          style="height: 40px; min-height: 40px;"
        ></textarea>

        <div ref="containerRef" class="flex-shrink-0 flex items-center gap-1 md:gap-3 relative">
          <label class="size-8 md:size-11 rounded-xl md:rounded-2xl bg-white border border-slate-100 text-slate-400 flex-shrink-0 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-all">
            <Icon icon="lucide:image" class="size-4.5 md:size-6"></Icon>
            <input type="file" multiple hidden @change="chooseImages" accept="image/*" />
          </label>
          <button @click="sendChat('text')" class="h-8 px-3 md:px-6 rounded-xl md:rounded-2xl bg-bejo-500 hover:bg-bejo-600 text-white font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-1.5 md:gap-3 shadow-xl shadow-bejo-500/20 active:scale-95 transition-all flex-shrink-0">
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

      <div v-if="openEtalase || openAppointment" ref="etalaseRef" class="z-[60] fixed bottom-20 left-1/2 -translate-x-1/2 w-[95vw] sm:w-[1000px] xl:w-[1100px] sm:bottom-24 sm:right-5 sm:left-auto sm:translate-x-0 bg-white/95 backdrop-blur-md rounded-[2rem] shadow-2xl p-6 border border-slate-50 overflow-hidden">
        
        <!-- Loading Overlay Send Product -->
        <div v-if="isSendingImage && openEtalase" class="absolute inset-0 z-[100] bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in-up">
          <div class="size-16 relative mb-4">
            <div class="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-bejo-500 rounded-full border-t-transparent animate-spin"></div>
            <Icon icon="lucide:send" class="size-6 text-bejo-500 absolute top-1/2 left-1/2 -translate-x-[40%] -translate-y-[40%]" />
          </div>
          <h4 class="text-lg font-black text-slate-800 tracking-tight">Harap Tunggu...</h4>
          <p class="text-xs font-bold text-slate-500 text-center max-w-[250px] mt-1.5 leading-relaxed">Sistem sedang merangkai dan mengirim detail properti ke pelanggan Anda.</p>
        </div>

        <div class="flex items-center justify-between mb-6 px-2">
          <h4 v-if="openEtalase" class="text-slate-900 font-extrabold text-lg tracking-tight">Pilih Etalase</h4>
          <h4 v-if="openAppointment" class="text-slate-900 font-extrabold text-lg tracking-tight">Pilih Unit Properti</h4>
          <button v-if="openEtalase" @click.stop="closeEtalase" class="size-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
            <Icon icon="lucide:x" class="size-5" />
          </button>
          <button v-if="openAppointment" @click.stop="closeAppointment" class="size-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
            <Icon icon="lucide:x" class="size-5" />
          </button>
        </div>

        <div class="px-2">
          <div class="relative mb-4 group">
            <Icon icon="lucide:search" class="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-bejo-500 transition-colors" />
            <input type="text" v-model="searchKatalog" placeholder="Cari unit atau katalog..." class="w-full bg-slate-50 border-transparent rounded-2xl py-3 pl-11 pr-4 text-sm font-bold focus:bg-white focus:ring-8 focus:ring-bejo-500/5 focus:border-bejo-500 transition-all duration-300 shadow-inner" />
          </div>
          <div class="flex flex-wrap items-center gap-3 mb-6">
            <button type="button" @click.stop="openFilter = !openFilter" class="btn-trigger-filter w-full flex justify-center items-center py-3 bg-bejo-50 hover:bg-bejo-100 text-bejo-600 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all shadow-sm"><Icon icon="lucide:sliders-horizontal" class="size-4 mr-2" /> Filter Pencarian</button>
          </div>
        </div>

        <div class="overflow-y-auto max-h-[55vh] px-2 custom-scrollbar">
          <div v-if="isLoadingProducts" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            <ProductCard v-for="i in 3" :key="'loading-' + i" :product="{}" is-loading />
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            <ProductCard v-for="product in filteredProducts" :key="product.No_Id" :product="product" :disable-routing="true" @click="sendProduct(product)" />
          </div>
        </div>
      </div>

      <div v-if="openAppointmentForm" ref="appointmentFormRef" class="z-[65] fixed bottom-55 left-1/2 -translate-x-1/2 w-[95vw] sm:w-[380px] sm:bottom-45 sm:right-30 sm:left-auto sm:translate-x-0 bg-white rounded-[2rem] shadow-2xl p-6 border border-slate-50 animate-fade-in-up">
        <div class="flex items-center justify-between mb-6 px-2">
          <h4 class="text-slate-900 font-extrabold text-lg tracking-tight">Form Janji Temu</h4>
          <button @click.stop="openAppointmentForm = false" class="size-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:text-red-500 transition-all">
            <Icon icon="lucide:x" class="size-5" />
          </button>
        </div>
        <div class="space-y-4 px-2">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block"> Nama Customer </label>
            <input type="text" placeholder="Nama customer..." class="w-full bg-slate-50 border-slate-100 rounded-xl py-2.5 px-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500 transition-all shadow-inner" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block"> Nama Sales </label>
            <input type="text" placeholder="Nama sales..." class="w-full bg-slate-50 border-slate-100 rounded-xl py-2.5 px-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500 transition-all shadow-inner" />
          </div>
          <button @click.stop="openSchedule = !openSchedule" class="w-full py-3 bg-bejo-50 hover:bg-bejo-100 text-bejo-600 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-bejo-200"><Icon icon="lucide:calendar" class="size-4" /> Pilih Jadwal</button>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block"> Waktu </label>
            <input type="time" class="w-full bg-slate-50 border-slate-100 rounded-xl py-2.5 px-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500 transition-all shadow-inner" />
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-8 px-2">
          <button @click.stop="openAppointmentForm = false" class="px-5 py-2.5 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all">Batal</button>
          <button @click="saveAppointment" class="px-6 py-2.5 bg-bejo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-bejo-500/20 hover:bg-bejo-600 transition-all">Simpan</button>
        </div>
      </div>

      <div v-if="openSchedule" ref="scheduleRef" class="z-[70] fixed bottom-55 left-1/2 -translate-x-1/2 w-[95vw] sm:w-[650px] sm:bottom-5 sm:right-15 sm:left-auto sm:translate-x-0 bg-white rounded-2xl shadow-2xl py-4 border border-default-100">
        <div class="flex items-center justify-between mb-4 px-6">
          <h4 class="text-default-900 font-bold text-base">Pilih Jadwal</h4>
          <button @click.stop="openSchedule = false" class="text-default-400 hover:text-default-900 transition-all">
            <Icon icon="lucide:x" class="size-5" />
          </button>
        </div>
        <div class="px-2">
          <div class="card border border-default-100 shadow-none">
            <div class="card-body">
              <FullCalendar ref="fullCalendarRef" :options="calendarOptions" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="openTukarCS" ref="tukarCSRef" class="z-[60] fixed bottom-20 left-1/2 -translate-x-1/2 w-[92vw] max-w-[390px] sm:bottom-24 sm:right-5 sm:left-auto sm:translate-x-0 bg-white/95 backdrop-blur-md rounded-[2rem] shadow-2xl p-6 border border-slate-50 animate-fade-in-up">
        <div class="flex items-center justify-between mb-6 px-2">
          <h4 class="text-slate-900 font-extrabold text-lg tracking-tight">Alihkan ke CS Lain</h4>
          <button @click.stop="openTukarCS = false" class="size-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 transition-all">
            <Icon icon="lucide:x" class="size-5" />
          </button>
        </div>
        <div class="relative mb-5 group">
          <Icon icon="lucide:search" class="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-bejo-500 transition-colors" />
          <input type="text" placeholder="Cari nama CS..." class="w-full bg-slate-50 border-transparent rounded-2xl py-3 pl-11 pr-4 text-sm font-bold focus:bg-white focus:ring-8 focus:ring-bejo-500/5 focus:border-bejo-500 transition-all shadow-inner" />
        </div>
        <div class="max-h-72 overflow-y-auto custom-scrollbar space-y-2 pr-1">
          <div class="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-100 group">
            <div class="flex items-center gap-3">
              <div class="size-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-black text-xs">YA</div>
              <span class="text-sm font-bold text-slate-700">Yeni Anggraeni</span>
            </div>
            <button @click="tukarCS('Yeni Anggraeni')" class="flex items-center justify-center bg-white border border-slate-200 text-slate-400 size-9 rounded-xl shadow-sm hover:bg-bejo-500 hover:text-white hover:border-bejo-500 transition-all active:scale-90">
              <Icon icon="lucide:check" class="size-4" />
            </button>
          </div>
          <div class="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-100 group">
            <div class="flex items-center gap-3">
              <div class="size-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-black text-xs">BK</div>
              <span class="text-sm font-bold text-slate-700">Bima Kurniawan</span>
            </div>
            <button @click="tukarCS('Bima Kurniawan')" class="flex items-center justify-center bg-white border border-slate-200 text-slate-400 size-9 rounded-xl shadow-sm hover:bg-bejo-500 hover:text-white hover:border-bejo-500 transition-all active:scale-90">
              <Icon icon="lucide:check" class="size-4" />
            </button>
          </div>
          <div class="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-100 group">
            <div class="flex items-center gap-3">
              <div class="size-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-black text-xs">BS</div>
              <span class="text-sm font-bold text-slate-700">Bobi Sanjaya</span>
            </div>
            <button @click="tukarCS('Bobi Sanjaya')" class="flex items-center justify-center bg-white border border-slate-200 text-slate-400 size-9 rounded-xl shadow-sm hover:bg-bejo-500 hover:text-white hover:border-bejo-500 transition-all active:scale-90">
              <Icon icon="lucide:check" class="size-4" />
            </button>
          </div>
        </div>
      </div>

      <Filter v-if="openFilter" @close="openFilter = false" ref="filterRef" class="z-[75] bg-white sm:shadow-none fixed left-1/2 bottom-20 -translate-x-1/2 w-[95vw] sm:w-[850px] sm:fixed sm:right-5 sm:bottom-24 sm:left-auto sm:translate-x-0 rounded-[2rem] shadow-2xl p-6 border border-slate-50 max-h-[85vh] overflow-y-auto custom-scrollbar" />
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

.minimal-scrollbar {
  -webkit-overflow-scrolling: touch; /* Optimasi swipe iOS */
  scrollbar-width: thin; /* Untuk Firefox */
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
</style>
