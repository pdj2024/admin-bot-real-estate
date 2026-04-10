<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, onUpdated, nextTick, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { confirm, success, fail } from '@/utils/sweet-alert'
import { RouterLink } from 'vue-router'
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
import { type Catalogue, type CalendarEvent, type Appointment, type Chat, type PreviewImage, calendarEvents } from './data'
import { type TakeOverPayload } from './SideBar.vue'

const menuRef = ref<HTMLElement | null>(null)
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

const username = defineModel<string>('username')
// const catalogues = ref<Catalogue[]>(catalogueData)
const events = ref<CalendarEvent[]>(calendarEvents)
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
    : (false as false),
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
  openEtalase.value = !openEtalase
  if (openFilter.value == true) {
    openFilter.value = !openFilter
  }
}

const closeAppointment = () => {
  openAppointment.value = !openAppointment
  if (openFilter.value == true) {
    openFilter.value = !openFilter
  }
  if (openAppointmentForm.value == true) {
    openAppointmentForm.value = !openAppointmentForm
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

const formatRupiah = (price: string | number): string => {
  const number = typeof price === 'string' ? parseInt(price) : price
  return 'Rp ' + number.toLocaleString('id-ID')
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
    if (chatContainer.value) {
      const scrollElement = chatContainer.value.getScrollElement?.() || chatContainer.value.$el?.querySelector('.simplebar-content-wrapper')

      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight + 2000,
          behavior: 'auto'
        })
      }
    }
  }, 100)
}

const sendChat = async (type: string, url?: string, targetRoomId?: string, targetPhone?: string) => {
  if (!type.includes('system') && !sendChatContent.value.trim()) return

  const activeRoomId = targetRoomId || props.roomId
  const activePhone = targetPhone || props.phoneNumber

  if (!activeRoomId) return

  const myId = localStorage.getItem('no_id') || ''
  const role = localStorage.getItem('role_user') || ''
  const username = localStorage.getItem('nama_display') || ''

  const now = new Date()
  const sentAt = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 19)

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
      Telepon_User: myId
    } as unknown as Chat)

    sendChatContent.value = ''
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
          Id_Paket: null,
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
</script>

<template>
  <div v-if="roomId" class="w-full h-full flex flex-col bg-white">
    <div class="flex justify-between items-center px-5 py-3 border-b border-default-200 bg-white z-10">
      <div class="flex gap-3.5 items-center">
        <button @click="openSidebar" class="lg:hidden size-8 rounded-md flex justify-center items-center bg-default-100 hover:bg-default-200 transition-colors">
          <Icon icon="lucide:between-horizontal-end" class="size-4 text-default-600"></Icon>
        </button>

        <div class="relative flex items-center justify-center font-bold rounded-full size-10 bg-primary/10 text-primary">
          <span v-if="username" class="text-sm">
            {{ username.substring(0, 2).toUpperCase() }}
          </span>
          <Icon v-else icon="lucide:user" class="size-5" />
        </div>

        <div>
          <h6 class="text-default-900 mb-0.5 font-bold text-base capitalize flex items-center gap-2">
            <span v-if="changeUsername" class="flex items-center gap-2">
              <!-- <input v-model="username" type="text" class="border rounded px-1 text-sm font-normal normal-case" placeholder="Username..." /> -->
              <input v-model="username" placeholder="Username..." class="w-full border border-slate-200 rounded-xl py-2 pl-3 pr-3 text-sm bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none" />
              <button @click="saveUsername" class="text-xs bg-primary text-white px-3 py-2 rounded">simpan</button>
            </span>

            <span v-else class="flex items-center gap-1 cursor-pointer" @click="changeUsername = true">
              {{ username || phoneNumber }}
              <div class="group relative inline-block">
                <Icon icon="lucide:pencil" class="size-4 text-default-600 inline cursor-pointer"></Icon>
                <span class="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute top-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap"> Ubah nama kontak </span>
              </div>
            </span>
          </h6>
          <p v-if="username" class="text-xs font-medium text-default-500">{{ phoneNumber }}</p>
        </div>
      </div>

      <div class="flex gap-2">
        <button class="btn rounded-full size-9 bg-default-100 text-default-600 hover:bg-primary/10 hover:text-primary transition-all">
          <Icon icon="lucide:search" class="size-4"></Icon>
        </button>
      </div>
    </div>

    <div v-if="isPreviewMode" class="flex-grow bg-bejo-50 min-h-0 relative flex flex-col overflow-hidden group">
      <div class="shrink-0 h-14 flex items-center px-4 z-5">
        <button @click="closePreview" class="size-9 flex items-center justify-center rounded-full text-bejo-600 hover:bg-bejo-300 transition-colors bg-white/50 backdrop-blur-sm">
          <Icon icon="lucide:x" class="size-6"></Icon>
        </button>
      </div>

      <div v-if="activeImage" class="flex-grow flex flex-col min-h-0 h-full mb-2">
        <div class="flex-grow w-full flex items-center justify-center min-h-0 overflow-hidden px-0 sm:px-2">
          <img :src="activeImage.url" :alt="'Preview ' + activeIndex" class="w-full h-full max-h-[75vh] object-contain rounded-xl transition-all duration-300" />
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

              <button @click.stop="removeImage(index)" class="absolute -top-2 -right-2 size-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md z-20 hover:bg-red-600">
                <Icon icon="lucide:x" class="size-3.5 stroke-[3]"></Icon>
              </button>
            </div>

            <button @click="triggerAddMore" class="size-16 shrink-0 border-2 border-dashed border-bejo-400 rounded-xl flex flex-col items-center justify-center text-bejo-500 bg-white hover:bg-bejo-50 transition-colors">
              <Icon icon="lucide:plus" class="size-6" />
              <span class="text-[9px] font-bold mt-1 uppercase">Tambah</span>
            </button>
          </div>
        </div>

        <div class="px-4 border-l border-bejo-200 h-full flex items-center justify-center">
          <button @click="sendImages" class="bg-green-500 hover:bg-green-600 text-white rounded-xl px-5 py-3 font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md">
            <span class="hidden sm:inline text-sm">Kirim</span>
            <Icon icon="lucide:send" class="size-4"></Icon>
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

    <simplebar ref="chatContainer" class="flex-grow bg-repeat bg-center h-0 container bg-chat" :class="{ hidden: isPreviewMode }">
      <div class="flex flex-col gap-4 px-5 py-6">
        <ChatBubble v-for="(chat, i) in chats" :key="i" :idx="i" :chat="chat" :chats="chats" :lastMessageId="props.lastMessageId" />
      </div>
    </simplebar>

    <div class="p-3 bg-white border-t border-default-200" :class="{ hidden: isPreviewMode }">
      <div v-if="activeTab != 'bot'" class="flex gap-2 items-center bg-default-50 border border-default-200 p-2 rounded-2xl focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
        <div class="relative" ref="dropdownRef">
          <button @click.stop="openMenu = !openMenu" class="btn rounded-xl size-10 bg-transparent text-default-500 hover:bg-default-200 hover:text-default-800 transition-colors">
            <Icon icon="lucide:plus" class="size-5"></Icon>
          </button>

          <div v-if="openMenu" class="absolute bottom-[calc(100%+12px)] left-0 min-w-48 bg-white shadow-xl border border-default-100 rounded-xl p-2 z-50 transform origin-bottom-left transition-all">
            <button @click.stop="openEtalase = !openEtalase" class="flex items-center gap-3 w-full text-left px-3 py-2.5 hover:bg-default-50 rounded-lg text-sm text-default-700 transition-colors">
              <Icon icon="lucide:blocks" class="size-4 text-primary" />
              <span>Pilih Etalase</span>
            </button>
            <button @click.stop="openAppointment = !openAppointment" class="flex items-center gap-3 w-full text-left px-3 py-2.5 hover:bg-default-50 rounded-lg text-sm text-default-700 transition-colors">
              <Icon icon="lucide:clipboard-clock" class="size-4 text-primary" />
              <span>Buat Janji</span>
            </button>
            <button @click.stop="openTukarCS = !openTukarCS" class="flex items-center gap-3 w-full text-left px-3 py-2.5 hover:bg-default-50 rounded-lg text-sm text-default-700 transition-colors">
              <Icon icon="lucide:arrow-right-left" class="size-4 text-primary" />
              <span>Tukar CS</span>
            </button>
            <div class="h-px bg-default-100 my-1"></div>
            <button @click="endChat" class="flex items-center gap-3 w-full text-left px-3 py-2.5 hover:bg-danger/10 text-danger rounded-lg text-sm transition-colors">
              <Icon icon="lucide:message-circle-x" class="size-4" />
              <span>Akhiri Percakapan</span>
            </button>
          </div>
        </div>

        <input type="text" v-model="sendChatContent" @keyup.enter="sendChat('text')" class="flex-grow bg-transparent border-none focus:ring-0 text-sm px-2 w-full" placeholder="Ketik pesan di sini..." />

        <div ref="containerRef" class="flex items-center gap-2 relative">
          <label class="btn size-9 rounded-xl bg-transparent text-default-500 hover:bg-default-200 hover:text-default-800">
            <Icon icon="lucide:image" class="size-4"></Icon>
            <input type="file" multiple hidden @change="chooseImages" accept="image/*" />
          </label>
          <button @click="sendChat('text')" class="btn rounded-xl px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium flex items-center gap-2 transition-colors">
            <span class="hidden sm:inline text-sm">Kirim</span>
            <Icon icon="lucide:send" class="size-4"></Icon>
          </button>
        </div>
      </div>

      <div v-else class="w-full">
        <button @click="takeOverChat(false)" class="w-full py-3.5 bg-bejo-500 hover:bg-bejo-600 text-white font-semibold rounded-xl flex justify-center items-center gap-2 shadow-sm transition-colors">
          <Icon icon="lucide:message-circle-plus" class="size-5" />
          <span>Ambil Alih Percakapan</span>
        </button>
      </div>

      <div v-if="openEtalase || openAppointment" ref="etalaseRef" class="z-[60] fixed bottom-20 left-1/2 -translate-x-1/2 w-[95vw] sm:w-[850px] sm:bottom-24 sm:right-5 sm:left-auto sm:translate-x-0 bg-white rounded-2xl shadow-2xl p-4 border border-default-100">
        <div class="flex items-center justify-between mb-4 px-2">
          <h4 v-if="openEtalase" class="text-default-900 font-bold text-base">Pilih Etalase</h4>
          <h4 v-if="openAppointment" class="text-default-900 font-bold text-base">Pilih Unit</h4>
          <button v-if="openEtalase" @click.stop="closeEtalase" class="text-default-400 hover:text-default-900 transition-all">
            <Icon icon="lucide:x" class="size-5" />
          </button>
          <button v-if="openAppointment" @click.stop="closeAppointment" class="text-default-400 hover:text-default-900 transition-all">
            <Icon icon="lucide:x" class="size-5" />
          </button>
        </div>

        <div class="px-2">
          <div class="relative mb-3">
            <Icon icon="lucide:search" class="size-4 absolute left-3 top-3 text-default-400" />
            <input type="text" placeholder="Cari produk..." class="w-full bg-default-100 rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div class="flex flex-wrap items-center gap-2 mb-4">
            <button type="button" @click.stop="openFilter = !openFilter" class="btn-trigger-filter w-full flex justify-center items-center btn btn-sm bg-primary/10 hover:bg-primary/30 text-primary py-2 rounded-xl"><Icon icon="lucide:sliders-horizontal" class="size-4 mr-2" /> Filter</button>
          </div>
        </div>

        <div class="overflow-y-auto max-h-[55vh] px-2 custom-scrollbar">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            <!-- <div class="card overflow-hidden group border border-default-100 shadow-sm hover:shadow-md transition-all duration-300" v-for="(item, idx) in catalogues" :key="idx">
              <div class="card-body p-0 relative overflow-hidden h-36">
                <img :src="item.image" alt="rumah" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <span class="absolute top-2 start-2 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase"> TERSEDIA </span>
              </div>
              <div class="p-3">
                <div class="flex items-center gap-1 text-primary mb-1">
                  <Icon icon="lucide:map-pin" class="size-3"></Icon>
                  <span class="text-[10px] font-medium uppercase tracking-wider">{{ item.location || 'Surabaya' }}</span>
                </div>
                <div>
                  <p class="text-xs font-semibold text-default-400 leading-none mb-1">Tipe {{ item.type || '45' }}</p>
                </div>
                <h6 class="text-base text-default-800 font-bold hover:text-primary transition-all mb-3 line-clamp-1">
                  <RouterLink to="">{{ item.name }}</RouterLink>
                </h6>
                <div class="grid grid-cols-3 gap-y-2 gap-x-1 border-y border-default-100 py-2 mb-3">
                  <div class="flex items-center gap-1">
                    <Icon icon="lucide:maximize" class="size-3 text-default-400"></Icon><span class="text-[9px] text-default-600">LB {{ item.buildingSize }}m²</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <Icon icon="lucide:layers" class="size-3 text-default-400"></Icon><span class="text-[9px] text-default-600">LT {{ item.landSize }}m²</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <Icon icon="lucide:layers" class="size-3 text-default-400"></Icon><span class="text-[9px] text-default-600">Uk {{ item.floors }} Lt</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <Icon icon="lucide:bed" class="size-3 text-default-400"></Icon><span class="text-[9px] text-default-600">{{ item.bedrooms }} KT</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <Icon icon="lucide:bath" class="size-3 text-default-400"></Icon><span class="text-[9px] text-default-600">{{ item.bathrooms }} WC</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <Icon icon="lucide:car" class="size-3 text-default-400"></Icon><span class="text-[9px] text-default-600">{{ item.car }} CP</span>
                  </div>
                </div>
                <div class="flex items-end justify-between gap-2">
                  <div>
                    <p class="text-[9px] text-default-400 leading-none mb-1">Mulai Dari</p>
                    <h5 class="text-sm font-bold text-primary">{{ item.price }}</h5>
                  </div>
                  <div class="hs-dropdown relative inline-flex">
                    <button v-if="openEtalase" type="button" @click="openEtalase = false" class="btn bg-green-500 text-white h-7 inline-flex items-center gap-2 hover:bg-green-600 px-3 rounded-lg">
                      <Icon icon="lucide:send" class="size-3.5" />
                      <span class="text-xs">Kirim</span>
                    </button>
                    <button v-if="openAppointment" type="button" @click.stop="openAppointmentForm = !openAppointmentForm" class="btn bg-green-500 text-white h-7 inline-flex items-center gap-2 hover:bg-green-600 px-3 rounded-lg">
                      <Icon icon="lucide:clipboard-clock" class="size-3.5" />
                      <span class="text-xs">Pilih</span>
                    </button>
                  </div>
                </div>
              </div>
            </div> -->
          </div>
        </div>
      </div>

      <div v-if="openAppointmentForm" ref="appointmentFormRef" class="z-[65] fixed bottom-55 left-1/2 -translate-x-1/2 w-[95vw] sm:w-[350px] sm:bottom-45 sm:right-30 sm:left-auto sm:translate-x-0 bg-white rounded-2xl shadow-2xl p-4 border border-default-100">
        <div class="flex items-center justify-between mb-4 px-2">
          <h4 class="text-default-900 font-bold text-base">Form Janji Temu</h4>
          <button @click.stop="openAppointmentForm = false" class="text-default-400 hover:text-default-900 transition-all">
            <Icon icon="lucide:x" class="size-5" />
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
          <div>
            <label class="text-xs text-default-500 mb-1 block"> Nama Customer </label>
            <input type="text" placeholder="Masukkan nama customer" class="form-input w-full" />
          </div>
          <div>
            <label class="text-xs text-default-500 mb-1 block"> Nama Sales </label>
            <input type="text" placeholder="Masukkan nama sales" class="form-input w-full" />
          </div>
          <button @click.stop="openSchedule = !openSchedule" class="btn bg-primary hover:bg-primary-dark text-white rounded-lg"><Icon icon="lucide:calendar-search" class="size-4"></Icon> Pilih Jadwal</button>
          <div>
            <label class="text-xs text-default-500 mb-1 block"> Waktu </label>
            <input type="time" class="form-input w-full" />
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6 px-2">
          <button @click.stop="openAppointmentForm = false" class="btn bg-default-100 hover:bg-default-200 text-default-700 rounded-lg">Batal</button>
          <button @click="saveAppointment" class="btn bg-green-500 hover:bg-green-600 text-white rounded-lg">Simpan</button>
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

      <div v-if="openTukarCS" ref="tukarCSRef" class="z-[60] fixed bottom-20 left-1/2 -translate-x-1/2 w-[92vw] max-w-[390px] sm:bottom-24 sm:right-5 sm:left-auto sm:translate-x-0 bg-white rounded-2xl shadow-xl p-4 border border-default-100">
        <div class="flex items-center justify-between mb-4 px-2">
          <h4 class="text-default-900 font-bold text-base">Pilih CS</h4>
          <button @click.stop="openTukarCS = false" class="text-default-400 hover:text-default-900 transition-all">
            <Icon icon="lucide:x" class="size-5" />
          </button>
        </div>
        <div class="relative mb-3">
          <Icon icon="lucide:search" class="size-4 absolute left-3 top-3 text-default-400" />
          <input type="text" placeholder="Cari CS..." class="w-full bg-default-100 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div class="max-h-72 overflow-y-auto custom-scrollbar">
          <div class="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-default-50 cursor-pointer transition-colors">
            <span class="text-sm font-medium text-default-700">Yeni Anggraeni</span>
            <button @click="tukarCS('Yeni Anggraeni')" class="flex items-center justify-center bg-white border border-default-200 hover:border-green-500 hover:bg-green-500 hover:text-white text-default-400 size-7 rounded-lg shadow-sm transition-all">
              <Icon icon="lucide:check" class="size-3.5" />
            </button>
          </div>
          <div class="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-default-50 cursor-pointer transition-colors">
            <span class="text-sm font-medium text-default-700">Bima Kurniawan</span>
            <button @click="tukarCS('Bima Kurniawan')" class="flex items-center justify-center bg-white border border-default-200 hover:border-green-500 hover:bg-green-500 hover:text-white text-default-400 size-7 rounded-lg shadow-sm transition-all">
              <Icon icon="lucide:check" class="size-3.5" />
            </button>
          </div>
          <div class="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-default-50 cursor-pointer transition-colors">
            <span class="text-sm font-medium text-default-700">Bobi Sanjaya</span>
            <button @click="tukarCS('Bobi Sanjaya')" class="flex items-center justify-center bg-white border border-default-200 hover:border-green-500 hover:bg-green-500 hover:text-white text-default-400 size-7 rounded-lg shadow-sm transition-all">
              <Icon icon="lucide:check" class="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      <Filter v-if="openFilter" @close="openFilter = false" ref="filterRef" class="z-[75] bg-white sm:shadow-none fixed left-1/2 bottom-12 -translate-x-1/2 w-[92vw] max-w-[390px] sm:fixed sm:right-20 sm:bottom-10 sm:left-auto sm:translate-x-0 sm:max-w-[700px] rounded-2xl shadow-xl p-4 max-h-[80vh] overflow-y-auto custom-scrollbar" />
    </div>
  </div>

  <div v-else class="relative w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-50/50 overflow-hidden">
    
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>

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
