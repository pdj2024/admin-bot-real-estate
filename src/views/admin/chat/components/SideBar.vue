<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, markRaw, nextTick } from 'vue'

defineOptions({
  inheritAttrs: false
})
import { Icon } from '@iconify/vue'
import api from '@/services/axios'
const audio = markRaw(new Audio('/sounds/Ding.mp3'))

const props = withDefaults(
  defineProps<{
    activeRoomId?: string
    usernameChange?: string
    takeOverStatus?: string[]
  }>(),
  {
    activeRoomId: '',
    usernameChange: '',
    takeOverStatus: () => []
  }
)

const chatsBot = ref<Chat[]>([])
const chatsAktif = ref<Chat[]>([])
const chatsAssign = ref<Chat[]>([])
const roomIdsBot = ref<string[]>([])
const roomIdsAktif = ref<string[]>([])
const roomIdsAssign = ref<string[]>([])
const activeTab = ref<'chat_saya' | 'bot'>('chat_saya')
const isLoading = ref<boolean>(false)
const selectedChatId = ref<string>(props.activeRoomId)

watch(() => props.activeRoomId, (newId) => {
  selectedChatId.value = newId
  if (newId) {
    checkAndEmitActiveChat()
  }
})
const showContextMenu = ref(false)
const showTakeOverButton = ref(false)
const showEndChatButton = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const selectedChatForMenu = ref<Chat | null>(null)
const selectedChatIdx = ref<number>(-1)
const selectedChatGroup = ref<string>('')
const unreadCounts = ref<Record<string, number>>({})
const firstUnreadIds = ref<Record<string, string>>({})
const searchQuery = ref('')

const selectedBotRoomIds = ref<string[]>([])
const selectedAssignRoomIds = ref<string[]>([])
const selectedActiveRoomIds = ref<string[]>([])

const emit = defineEmits<{
  (e: 'selectChat', id: string): void
  (e: 'idLawan', id_lawan: string): void
  (e: 'username', username: string): void
  (e: 'phoneNumber', phoneNumber: string): void
  (e: 'statusBot', status: string): void
  (e: 'changeTab', tab: string): void
  (e: 'allRoomIds', roomIdsBot: string[], roomIdsAktif: string[], roomIdsAssign: string[]): void
  (e: 'lastMessageId', id: string): void
  (e: 'chatTakeOverBatch', payload: TakeOverPayload[]): void
}>()

const selectChat = (idx: number, group: string, id: string, idLawan: string, username: string, phoneNumber: string, statusBot: string) => {
  emit('selectChat', id)
  emit('idLawan', idLawan)
  emit('username', username || '')
  emit('phoneNumber', phoneNumber || '')
  emit('statusBot', statusBot || 'nonaktif')
  emit('changeTab', activeTab.value)
  if (group == 'bot') {
    emit('lastMessageId', chatsBot.value[idx]?.Last_Id_Message_Viewed ?? '')
  }
  closeSidebar()
  selectedChatId.value = id

  // Capture first unread message ID for the divider
  const firstUnreadId = firstUnreadIds.value[id] || ''
  emit('lastMessageId', firstUnreadId)

  // Reset unread count for the selected chat
  unreadCounts.value[id] = 0
  firstUnreadIds.value[id] = ''
  
  const updateCountInList = (list: Chat[]) => {
    const item = list.find(c => c.Room_Id === id)
    if (item) item.New_Message_Count = 0
  }
  updateCountInList(chatsBot.value)
  updateCountInList(chatsAktif.value)
  updateCountInList(chatsAssign.value)
}

const checkAndEmitActiveChat = () => {
  if (!props.activeRoomId) return

  const allChats = [...chatsBot.value, ...chatsAktif.value, ...chatsAssign.value]
  const chat = allChats.find(c => String(c.Room_Id) === String(props.activeRoomId))
  
  if (chat) {
    emit('idLawan', chat.Id_Lawan)
    emit('username', chat.Username_Lawan )
    emit('phoneNumber', chat.Telepon_User_Lawan || '')
    emit('statusBot', chat.Status_Bot || 'nonaktif')
    
    // Sinkronkan selectedChatId lokal
    selectedChatId.value = chat.Room_Id
    
    // Capture first unread message ID for the divider jika baru dibuka
    if (unreadCounts.value[chat.Room_Id] > 0) {
      const firstUnreadId = firstUnreadIds.value[chat.Room_Id] || ''
      emit('lastMessageId', firstUnreadId)
      
      // Reset unread counts
      unreadCounts.value[chat.Room_Id] = 0
      firstUnreadIds.value[chat.Room_Id] = ''
      chat.New_Message_Count = 0
    }
  }
}


export interface Chat {
  Room_Id: string
  Room_Name: string
  Room_Type: string
  Username_User: string
  Id_User: string
  Id_Media_User: string
  No_Id_Media_User: string
  Tipe_User: string
  Telepon_User: string
  Username_Lawan: string
  Id_Lawan: string
  Id_Media_Lawan: string
  No_Id_Media_Lawan: string
  Tipe_User_Lawan: string
  Telepon_User_Lawan: string
  Created_At: string | null
  Last_Message_At: string | Date
  Last_Message: string
  Status: string
  Status_Bot?: string
  User_Ids: string[]
  Count_Status_Sent: number
  List_Id_Message_Sent: string[]
  Count_Status_Received: number
  List_Id_Message_Received: string[]
  Last_Id_Message_Viewed?: string | ''
  New_Message_Count?: number | 0
}

export interface TakeOverPayload {
  type: string
  status: boolean
  room: string
  phoneNumber: string
  customerId: string
}

const getDateChat = (date: any) => {
  if (!date) return ''
  const d = new Date(date)
  const today = new Date().setHours(0, 0, 0, 0)
  const target = new Date(d).setHours(0, 0, 0, 0)
  const diffDays = (today - target) / 86400000

  if (diffDays === 0) {
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  if (diffDays === 1) return 'Kemarin'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  }).format(d)
}

const closeSidebar = (): void => {
  const sidebarElement = document.querySelector<HTMLElement>('#hs-offcanvas-left')

  if (sidebarElement && (window as any).HSOverlay) {
    ;(window as any).HSOverlay.close(sidebarElement)
  }
}

const fetchData = async (tab: 'bot' | 'chat_saya', silent: boolean = false) => {
  try {
    if (!silent) isLoading.value = true

    if (tab === 'bot') {
      const endpoint = '/api/chat/getRoomsGlobal?status_bot=aktif&orderby=Last_Message_At&orderdir=desc'

      const { data } = await api.get(endpoint, {
        headers: { 'X-Jenis-User': 'admin' }
      })

      const tempBot: Chat[] = []
      const tempIdsBot: string[] = []

      data.Data.forEach((item: any) => {
        if (!item.Username_Lawan || item.Username_Lawan === '') {
          item.Username_Lawan = item.Telepon_User_Lawan || item.Id_Lawan || item.Room_Id
        }
        
        if (item.Room_Id) {
          tempBot.push(item)
          tempIdsBot.push(item.Room_Id)
        }
      })

      chatsBot.value = tempBot
      roomIdsBot.value = tempIdsBot
    } else {
      const userId = localStorage.getItem('no_id') || ''
      const endpoint = '/api/chat/getRoomsGlobal?status_bot=nonaktif&orderby=Last_Message_At&orderdir=desc'

      const { data } = await api.get(endpoint, {
        headers: { 'X-Jenis-User': 'admin' }
      })

      const tempAktif: Chat[] = []
      const tempAssign: Chat[] = []
      const tempIdsAktif: string[] = []
      const tempIdsAssign: string[] = []

      data.Data.forEach((item: any) => {
        if (item.Status !== 'aktif' || !item.Id_Lawan || !item.Telepon_User_Lawan) return

        if (!item.Username_Lawan || item.Username_Lawan === '') {
          item.Username_Lawan = item.Telepon_User_Lawan || item.Id_Lawan || item.Room_Id
        }
        
        if (item.Room_Id) {
          if (unreadCounts.value[item.Room_Id] !== undefined) {
            item.New_Message_Count = unreadCounts.value[item.Room_Id]
          } else {
            unreadCounts.value[item.Room_Id] = item.New_Message_Count || 0
          }

          const userIds = item.User_Ids || []
          
          if (userIds.includes(userId)) {
            tempAktif.push(item)
            tempIdsAktif.push(item.Room_Id)
          } else {
            tempAssign.push(item)
            tempIdsAssign.push(item.Room_Id)
          }
        }
      })

      chatsAktif.value = tempAktif
      chatsAssign.value = tempAssign
      roomIdsAktif.value = tempIdsAktif
      roomIdsAssign.value = tempIdsAssign
    }
    emit('allRoomIds', roomIdsBot.value, roomIdsAktif.value, roomIdsAssign.value)
    
    // Auto-emit metadata for active room if it exists in the fetched lists
    nextTick(() => {
      checkAndEmitActiveChat()
    })
  } catch (err: any) {
    console.error('DATA ERROR:', err.response?.data || err.message)
  } finally {
    isLoading.value = false
  }
}

const changeTab = (tab: 'bot' | 'chat_saya') => {
  activeTab.value = tab
  
  // Clear all lists to prevent stale data
  chatsBot.value = []
  chatsAktif.value = []
  chatsAssign.value = []
  
  selectedActiveRoomIds.value = []
  selectedBotRoomIds.value = []
  selectedAssignRoomIds.value = []

  fetchData(tab)
  emit('changeTab', tab)
}


const refreshChatList = (data?: any, silent: boolean = false) => {
  if (data && data.roomId) {
    const formattedDate = data.sentAt ? data.sentAt.substring(0, 19) : ''
    const roomIdStr = String(data.roomId)

    // Update unread logic
    const isRoomOpen = roomIdStr === String(props.activeRoomId)
    const isSystemReply = data.tipeUser === 'admin' || data.tipeUser === 'ai'

    if (isRoomOpen || isSystemReply) {
      unreadCounts.value[roomIdStr] = 0
      firstUnreadIds.value[roomIdStr] = ''
    } else {
      // Catch the first unread message ID when the bubble starts appearing
      if (!unreadCounts.value[roomIdStr] || unreadCounts.value[roomIdStr] === 0) {
        firstUnreadIds.value[roomIdStr] = data.messageId
      }
      unreadCounts.value[roomIdStr] = (unreadCounts.value[roomIdStr] || 0) + 1
    }

    const updateLocalChat = (chatList: Chat[], targetList?: Chat[], targetIds?: string[]) => {
      const index = chatList.findIndex((c) => String(c.Room_Id) === roomIdStr)

      if (index !== -1) {
        const updatedChat = {
          ...chatList[index],
          Last_Message: data.message,
          Last_Message_At: formattedDate,
          New_Message_Count: unreadCounts.value[roomIdStr],
          Status_Bot: data.jenisPesan === 'system_keluar' ? 'aktif' : (data.jenisPesan === 'system_masuk' ? 'nonaktif' : chatList[index].Status_Bot)
        }
        
        chatList.splice(index, 1)
        
        // Jika pesan adalah system_masuk/keluar, pindahkan ke list yang sesuai
        if (targetList && targetIds) {
          targetList.unshift(updatedChat)
          if (!targetIds.includes(roomIdStr)) targetIds.push(roomIdStr)
        } else {
          chatList.unshift(updatedChat)
        }
      }
    }

    // Tentukan target perpindahan berdasarkan jenisPesan
    if (data.jenisPesan === 'system_masuk' || data.jenisPesan === 'system_masuk_tukar') {
      // Pindah dari bot ke aktif
      updateLocalChat(chatsBot.value, chatsAktif.value, roomIdsAktif.value)
      updateLocalChat(chatsAssign.value, chatsAktif.value, roomIdsAktif.value)
    } else if (data.jenisPesan === 'system_keluar' || data.jenisPesan === 'system_keluar_tukar') {
      // Pindah dari aktif ke bot
      updateLocalChat(chatsAktif.value, chatsBot.value, roomIdsBot.value)
    } else {
      // Update biasa di list masing-masing
      updateLocalChat(chatsBot.value)
      updateLocalChat(chatsAktif.value)
      updateLocalChat(chatsAssign.value)
    }

    if (roomIdStr !== String(props.activeRoomId) && !isSystemReply) {
      audio.play().catch((error) => {
        console.error('Gagal memutar audio:', error)
      })
    }
  } else {
    // Jika data tidak ditemukan di list manapun, baru fetch
    fetchData(activeTab.value, silent)
  }
}

const removeRoomFromList = (roomId: string) => {
  chatsBot.value = chatsBot.value.filter(c => c.Room_Id !== roomId)
  chatsAktif.value = chatsAktif.value.filter(c => c.Room_Id !== roomId)
  chatsAssign.value = chatsAssign.value.filter(c => c.Room_Id !== roomId)
}

const formatMessage = (msg: string, maxLength: number = 50) => {
  if (!msg) return ''

  let processedMsg = msg.replace(/\n/g, ' ')

  if (processedMsg.includes('_data:image/')) {
    const caption = processedMsg.split('_data:image/')[0].trim()
    processedMsg = caption ? `🖼️ ${caption}` : `🖼️ Foto`
  } else if (processedMsg.includes('data:image/')) {
    processedMsg = '🖼️ Foto'
  }

  const finalMsg = processedMsg.length > maxLength ? processedMsg.slice(0, maxLength) + '...' : processedMsg

  return finalMsg
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
}

const cleanTooltip = (msg: string) => {
  if (!msg) return ''
  return msg
    .replace('_X7#mQ9!vW2_', ' ') // System tag
    .replace(/_data:image\/.*$/, '🖼️ Foto') // Image base64
    .replace(/\*(.*?)\*/g, '$1') // Bold
    .replace(/_(.*?)_/g, '$1')   // Italic
    .replace(/~(.*?)~/g, '$1')   // Strikethrough
    .replace(/```(.*?)```/gs, '$1') // Monospace
}


const updateSidebarUI = (newName: string) => {
  const updateItem = (chatList: Chat[]) => {
    const index = chatList.findIndex((c) => c.Room_Id === props.activeRoomId)
    if (index !== -1) {
      chatList[index].Username_Lawan = newName
    }
  }

  updateItem(chatsBot.value)
  updateItem(chatsAktif.value)
  updateItem(chatsAssign.value)
}

const toggleBotStatus = async (chat: Chat) => {
  const newStatusBot = chat.Status_Bot === 'aktif' ? 'nonaktif' : 'aktif'
  try {
    const payload = {
      Status: chat.Status,
      Status_Bot: newStatusBot,
      Last_Message: null,
      User_Ids: chat.User_Ids
    }
    const { data } = await api.put(`/api/chat/update-room?room_id=${chat.Room_Id}`, payload, {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    if (data.StatusCode === 200) {
      chat.Status_Bot = newStatusBot
      
      // Refresh list after small delay to reflect the tab changes if needed
      setTimeout(() => fetchData(activeTab.value), 500)
    }
  } catch {
    console.error('Gagal memperbarui status bot')
  }
}

const openContextMenu = (event: MouseEvent, chat: Chat, group: string, idx: number) => {
  selectedChatForMenu.value = chat
  selectedChatGroup.value = group
  selectedChatIdx.value = idx

  contextMenuPosition.value = {
    x: event.clientX,
    y: event.clientY
  }

  if (group == 'bot' || group == 'assign') {
    showContextMenu.value = true
    showTakeOverButton.value = true
    showEndChatButton.value = false
  } else if (group == 'aktif') {
    showContextMenu.value = true
    showTakeOverButton.value = false
    showEndChatButton.value = true
  }
}

const closeContextMenu = () => {
  showContextMenu.value = false
  selectedChatForMenu.value = null
}

const handleViewConversation = () => {
  const chat = selectedChatForMenu.value
  if (chat) {
    selectChat(
      selectedChatIdx.value, 
      selectedChatGroup.value, 
      chat.Room_Id, 
      chat.Id_Lawan, 
      chat.Username_Lawan, 
      chat.Telepon_User_Lawan, 
      chat.Status_Bot || 'nonaktif'
    )
  }
  closeContextMenu()
}

const handleEndConversation = () => {
  const chat = selectedChatForMenu.value

  if (chat) {
    const dataEndChat: TakeOverPayload[] = [
      {
        type: 'system_keluar',
        status: true,
        room: chat.Room_Id,
        phoneNumber: chat.Telepon_User_Lawan,
        customerId: chat.Id_Lawan
      }
    ]

    emit('chatTakeOverBatch', dataEndChat)
  }
  closeContextMenu()
}

const handleTakeOverConversation = () => {
  const chat = selectedChatForMenu.value

  if (chat) {
    const dataTakeOverChat: TakeOverPayload[] = [
      {
        type: 'system_masuk',
        status: false,
        room: chat.Room_Id,
        phoneNumber: chat.Telepon_User_Lawan,
        customerId: chat.Id_Lawan
      }
    ]
    emit('chatTakeOverBatch', dataTakeOverChat)
    
    // Langsung buka chatnya agar admin tidak perlu klik dua kali
    selectChat(
      selectedChatIdx.value, 
      selectedChatGroup.value, 
      chat.Room_Id, 
      chat.Id_Lawan, 
      chat.Username_Lawan, 
      chat.Telepon_User_Lawan, 
      chat.Status_Bot || 'nonaktif'
    )
  }
  closeContextMenu()
}

const handleBatchEndActive = () => {
  if (selectedActiveRoomIds.value.length === 0) return

  const dataEndChat: TakeOverPayload[] = chatsAktif.value
    .filter(c => selectedActiveRoomIds.value.includes(c.Room_Id))
    .map((chat) => {
      return {
        type: 'system_keluar',
        status: true,
        room: chat.Room_Id,
        phoneNumber: chat.Telepon_User_Lawan,
        customerId: chat.Id_Lawan
      }
    })

  emit('chatTakeOverBatch', dataEndChat)
  selectedActiveRoomIds.value = []
}

const handleBatchTakeOverBot = () => {
  if (selectedBotRoomIds.value.length === 0) return

  const dataTakeOverChat: TakeOverPayload[] = chatsBot.value
    .filter(c => selectedBotRoomIds.value.includes(c.Room_Id))
    .map((chat) => {
      return {
        type: 'system_masuk',
        status: false,
        room: chat.Room_Id,
        phoneNumber: chat.Telepon_User_Lawan,
        customerId: chat.Id_Lawan
      }
    })

  emit('chatTakeOverBatch', dataTakeOverChat)
  selectedBotRoomIds.value = []
}

const handleBatchTakeOverAssign = () => {
  if (selectedAssignRoomIds.value.length === 0) return

  const dataTakeOverChat: TakeOverPayload[] = chatsAssign.value
    .filter(c => selectedAssignRoomIds.value.includes(c.Room_Id))
    .map((chat) => {
      return {
        type: 'system_masuk',
        status: false,
        room: chat.Room_Id,
        phoneNumber: chat.Telepon_User_Lawan,
        customerId: chat.Id_Lawan
      }
    })

  emit('chatTakeOverBatch', dataTakeOverChat)

  selectedAssignRoomIds.value = []
}

const isAllBotChatsSelected = computed({
  get: () => {
    const list = filteredChatsBot.value
    return list.length > 0 && list.every(c => selectedBotRoomIds.value.includes(c.Room_Id))
  },
  set: (value) => {
    const list = filteredChatsBot.value
    if (value) {
      const toAdd = list.filter(c => !selectedBotRoomIds.value.includes(c.Room_Id)).map(c => c.Room_Id)
      selectedBotRoomIds.value = [...selectedBotRoomIds.value, ...toAdd]
    } else {
      selectedBotRoomIds.value = selectedBotRoomIds.value.filter(id => !list.some(c => c.Room_Id === id))
    }
  }
})

const isAllAssignChatsSelected = computed({
  get: () => {
    const list = filteredChatsAssign.value
    return list.length > 0 && list.every(c => selectedAssignRoomIds.value.includes(c.Room_Id))
  },
  set: (value) => {
    const list = filteredChatsAssign.value
    if (value) {
      const toAdd = list.filter(c => !selectedAssignRoomIds.value.includes(c.Room_Id)).map(c => c.Room_Id)
      selectedAssignRoomIds.value = [...selectedAssignRoomIds.value, ...toAdd]
    } else {
      selectedAssignRoomIds.value = selectedAssignRoomIds.value.filter(id => !list.some(c => c.Room_Id === id))
    }
  }
})

const isAllActiveChatsSelected = computed({
  get: () => {
    const list = filteredChatsAktif.value
    return list.length > 0 && list.every(c => selectedActiveRoomIds.value.includes(c.Room_Id))
  },
  set: (value) => {
    const list = filteredChatsAktif.value
    if (value) {
      const toAdd = list.filter(c => !selectedActiveRoomIds.value.includes(c.Room_Id)).map(c => c.Room_Id)
      selectedActiveRoomIds.value = [...selectedActiveRoomIds.value, ...toAdd]
    } else {
      selectedActiveRoomIds.value = selectedActiveRoomIds.value.filter(id => !list.some(c => c.Room_Id === id))
    }
  }
})

const filterList = (list: Chat[]) => {
  if (!searchQuery.value.trim()) return list
  const query = searchQuery.value.toLowerCase()
  return list.filter(chat => 
    (chat.Username_Lawan || '').toLowerCase().includes(query) ||
    (chat.Telepon_User_Lawan || '').toLowerCase().includes(query)
  )
}

const filteredChatsBot = computed(() => filterList(chatsBot.value))
const filteredChatsAktif = computed(() => filterList(chatsAktif.value))
const filteredChatsAssign = computed(() => filterList(chatsAssign.value))

watch(
  () => props.usernameChange,
  (newVal) => {
    if (newVal && newVal !== '') {
      updateSidebarUI(newVal)
    }
  }
)

watch(
  () => props.takeOverStatus,
  (newVal) => {
    if (newVal && newVal.length > 0) {
      chatsBot.value = chatsBot.value.filter((chat) => !newVal.includes(chat.Room_Id))
      chatsAktif.value = chatsAktif.value.filter((chat) => !newVal.includes(chat.Room_Id))
      chatsAssign.value = chatsAssign.value.filter((chat) => !newVal.includes(chat.Room_Id))
    }
  }
)

onMounted(async () => {
  fetchData(activeTab.value)
  emit('changeTab', activeTab.value)
  window.addEventListener('click', closeContextMenu)
  nextTick(() => {
    window.HSStaticMethods?.autoInit()
  })
})

onUnmounted(() => {
  window.removeEventListener('click', closeContextMenu)
})

defineExpose({
  refreshChatList,
  changeTab,
  removeRoomFromList
})
</script>

<template>
  <div class="sidebar-container h-full" v-bind="$attrs">
    <div class="lg:border-e border-slate-200 bg-white h-full flex flex-col">
    <div id="hs-offcanvas-left" class="hs-overlay [--auto-close:lg] lg:block lg:translate-x-0 lg:static lg:end-auto lg:bottom-0 w-80 hs-overlay-open:translate-x-0 -translate-x-full transition-all duration-300 transform h-full hidden fixed top-0 start-0 bottom-0 overflow-hidden z-30" role="dialog" tabindex="-1" aria-label="Sidebar">
      <div class="card rounded-none shadow-none relative flex flex-row h-full max-h-full overflow-hidden divide-x divide-slate-200 bg-white">
        <div class="w-80 flex flex-col h-full">
          <div class="px-4 py-3 border-b border-slate-50 shrink-0 bg-white">
            <div class="relative group">
              <input 
                v-model="searchQuery"
                type="text" 
                class="ps-10 block w-full text-xs bg-slate-50 border-transparent rounded-xl focus:border-bejo-500 focus:ring-4 focus:ring-bejo-500/10 focus:bg-white transition-all duration-300" 
                placeholder="Cari obrolan..." 
              />
              <div class="absolute inset-y-0 start-0 flex items-center ps-4">
                <Icon icon="lucide:search" class="size-4 text-slate-400 group-focus-within:text-bejo-500 transition-colors"></Icon>
              </div>
            </div>
          </div>

          <div class="flex flex-col flex-grow min-h-0 overflow-hidden">
            <div class="px-4 py-2.5 flex gap-2.5 sticky top-0 bg-white/95 backdrop-blur-md z-20 border-b border-slate-50 shrink-0">
              <button 
                @click="changeTab('bot')" 
                class="flex-1 px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 border shadow-sm" 
                :class="activeTab === 'bot' ? 'bg-bejo-500 text-white border-bejo-500 shadow-bejo-500/20' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600'"
              >
                Bot
              </button>
              <button 
                @click="changeTab('chat_saya')" 
                class="flex-1 px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 border shadow-sm" 
                :class="activeTab === 'chat_saya' ? 'bg-bejo-500 text-white border-bejo-500 shadow-bejo-500/20' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600'"
              >
                Chat Saya
              </button>
            </div>

            <div v-if="isLoading" class="flex flex-col items-center justify-center py-10 text-slate-400">
              <Icon icon="lucide:loader-2" class="size-6 animate-spin mb-2" />
              <span class="text-sm">Memuat obrolan...</span>
            </div>

            <div v-else class="flex flex-col flex-1 min-h-0">
              <div v-if="activeTab === 'bot'" class="flex flex-col flex-1 min-h-0 relative">
                <div v-if="filteredChatsBot.length === 0" class="text-center py-10 text-sm text-slate-400">Tidak ada obrolan ditemukan.</div>

                <div v-if="filteredChatsBot.length > 0" class="px-4 py-1.5 bg-slate-50 border-b border-slate-200 shrink-0 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <input type="checkbox" v-model="isAllBotChatsSelected" class="w-4 h-4 rounded form-checkbox cursor-pointer accent-bejo-600" title="Pilih Semua Bot" />
                    <p class="text-default-700 font-bold text-[11px] uppercase tracking-widest">Bot ({{ filteredChatsBot.length }})</p>
                  </div>

                  <button v-if="selectedBotRoomIds.length > 0" @click="handleBatchTakeOverBot" class="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-[var(--color-bejo-700)] bg-[var(--color-bejo-100)] hover:bg-[var(--color-bejo-200)] border border-[var(--color-bejo-300)] rounded transition-colors shadow-sm">
                    <Icon icon="lucide:message-square-plus" class="size-3.5" />
                    Ambil Alih {{ selectedBotRoomIds.length > 1 ? selectedBotRoomIds.length : '' }} Chat
                  </button>
                </div>

                <div v-if="filteredChatsBot.length > 0" class="flex-1 min-h-0 overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <div
                      v-for="(chat, idx) in filteredChatsBot"
                      :key="chat.Room_Id"
                      v-memo="[chat.Room_Id, chat.Last_Message_At, chat.Last_Message, chat.New_Message_Count, selectedChatId === chat.Room_Id, selectedBotRoomIds.includes(chat.Room_Id)]"
                      @click="selectChat(idx, 'bot', chat.Room_Id, chat.Id_Lawan, chat.Username_Lawan, chat.Telepon_User_Lawan, chat.Status_Bot || 'aktif')"
                      @contextmenu.prevent="openContextMenu($event, chat, 'bot', idx)"
                      class="relative flex items-center gap-3 py-3 px-4 bg-white cursor-pointer border-b border-slate-50 hover:bg-slate-50/80 transition-all duration-300 group"
                      :class="{
                        'bg-bejo-50/30 before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-bejo-500 before:rounded-r-full': selectedChatId === chat.Room_Id
                      }"
                    >
                      <div class="shrink-0 flex items-center">
                        <input @click.stop type="checkbox" :value="chat.Room_Id" v-model="selectedBotRoomIds" class="size-4.5 rounded-lg border-slate-200 text-bejo-500 focus:ring-bejo-500/20 cursor-pointer transition-all" />
                      </div>

                      <div class="relative shrink-0 flex items-center justify-center font-black rounded-2xl size-10 bg-gradient-to-br from-bejo-50 to-bejo-100/50 text-bejo-600 border border-white shadow-sm group-hover:scale-105 transition-all duration-300">
                        <span v-if="chat.Username_Lawan" class="text-xs tracking-tighter">{{ chat.Username_Lawan?.charAt(0).toUpperCase() }}</span>
                        <Icon v-else icon="lucide:user" class="size-5 text-bejo-300" />
                        <span class="absolute -bottom-1 -right-1 size-3.5 border-2 border-white rounded-full bg-bejo-500 shadow-sm shadow-green-500/20"></span>
                      </div>

                      <div class="flex-grow min-w-0">
                        <div class="flex items-center justify-between gap-2 mb-1">
                          <h6 class="text-slate-900 font-black text-sm truncate tracking-tight">
                            {{ chat.Username_Lawan }}
                          </h6>
                          <span class="text-[9px] font-black text-slate-400 shrink-0 uppercase tracking-tighter">
                            {{ getDateChat(chat.Last_Message_At) }}
                          </span>
                        </div>

                        <div class="flex items-center justify-between gap-2">
                          <p 
                            class="text-[11px] font-bold truncate text-slate-500 leading-none" 
                            :title="cleanTooltip(chat.Last_Message)"
                            v-html="formatMessage(chat.Last_Message.replace('_X7#mQ9!vW2_', ' '))"
                          ></p>

                          <div class="flex items-center gap-2">
                            <!-- Quick Bot Toggle -->
                            <button 
                              @click.stop="toggleBotStatus(chat)"
                              class="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all border"
                              :class="chat.Status_Bot === 'aktif' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-slate-50 border-slate-100 text-slate-400'"
                              :title="chat.Status_Bot === 'aktif' ? 'Bot Aktif (Klik untuk Ambil Alih)' : 'Bot Nonaktif (Klik untuk Serahkan ke Bot)'"
                            >
                              <Icon :icon="chat.Status_Bot === 'aktif' ? 'lucide:bot' : 'lucide:user-cog'" class="size-3" />
                              <span class="text-[8px] font-black uppercase tracking-tighter">{{ chat.Status_Bot === 'aktif' ? 'Bot' : 'Admin' }}</span>
                            </button>

                            <div v-if="chat.New_Message_Count! > 0" class="grid place-items-center min-w-[20px] h-[20px] px-1 text-[9px] font-black text-white bg-red-500 rounded-full shrink-0 shadow-lg shadow-red-500/30 ring-2 ring-white leading-none animate-bounce-subtle">
                              {{ chat.New_Message_Count! > 99 ? '99+' : chat.New_Message_Count }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                </div>
              </div>

              <div v-if="activeTab === 'chat_saya'" class="flex flex-col flex-1 min-h-0">
                <div v-if="filteredChatsAktif.length === 0 && filteredChatsAssign.length === 0" class="text-center py-10 text-sm text-slate-400">
                  {{ searchQuery ? 'Tidak ada obrolan yang cocok dengan pencarian.' : 'Bagus! Tidak ada antrean pesan saat ini.' }}
                </div>

                <div v-if="filteredChatsAssign.length > 0" class="flex flex-col shrink-0">
                  <div class="px-4 py-2 bg-slate-50 border-y border-slate-200 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <input type="checkbox" v-model="isAllAssignChatsSelected" class="w-4 h-4 rounded form-checkbox cursor-pointer accent-bejo-600" title="Pilih Semua Unassigned" />
                      <p class="text-[var(--text-bejo-800)] font-bold text-[11px] uppercase tracking-widest">Belum Di-Assign ({{ filteredChatsAssign.length }})</p>
                    </div>

                    <button v-if="selectedAssignRoomIds.length > 0" @click="handleBatchTakeOverAssign" class="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-[var(--color-bejo-700)] bg-[var(--color-bejo-100)] hover:bg-[var(--color-bejo-200)] border border-[var(--color-bejo-300)] rounded transition-colors shadow-sm">
                      <Icon icon="lucide:message-square-plus" class="size-3.5" />
                      <!-- Ambil Alih {{ selectedAssignRoomIds.length > 1 ? selectedAssignRoomIds.length : '' }} Chat -->
                      Ambil Alih Chat
                    </button>
                  </div>

                  <div class="max-h-[200px] overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <div
                      v-for="(chat, idx) in filteredChatsAssign.slice().reverse()"
                      :key="chat.Room_Id"
                      v-memo="[chat.Room_Id, chat.Last_Message_At, chat.Last_Message, chat.New_Message_Count, selectedChatId === chat.Room_Id, selectedAssignRoomIds.includes(chat.Room_Id)]"
                      @click="selectChat(idx, 'chat_saya', chat.Room_Id, chat.Id_Lawan, chat.Username_Lawan, chat.Telepon_User_Lawan, chat.Status_Bot || 'nonaktif')"
                      @contextmenu.prevent="openContextMenu($event, chat, 'assign', idx)"
                      class="relative flex items-center gap-3 py-3 px-4 bg-white cursor-pointer border-b border-slate-50 hover:bg-slate-50/80 transition-all duration-300 group"
                      :class="{
                        'bg-bejo-50/30 before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-bejo-500 before:rounded-r-full': selectedChatId === chat.Room_Id
                      }"
                    >
                      <div class="shrink-0 flex items-center">
                        <input @click.stop type="checkbox" :value="chat.Room_Id" v-model="selectedAssignRoomIds" class="size-4.5 rounded-lg border-slate-200 text-bejo-500 focus:ring-bejo-500/20 cursor-pointer transition-all" />
                      </div>

                      <div class="relative shrink-0 flex items-center justify-center font-black rounded-2xl size-10 bg-gradient-to-br from-slate-100 to-slate-200/50 text-slate-600 border border-white shadow-sm group-hover:scale-105 transition-all duration-300">
                        <span v-if="chat.Username_Lawan" class="text-xs tracking-tighter">{{ chat.Username_Lawan.charAt(0).toUpperCase() }}</span>
                        <Icon v-else icon="lucide:user" class="size-5 text-slate-300" />
                        <span class="absolute -bottom-1 -right-1 size-3.5 border-2 border-white rounded-full bg-slate-300 shadow-sm"></span>
                      </div>

                      <div class="flex-grow min-w-0">
                        <div class="flex items-center justify-between gap-2 mb-1">
                          <h6 class="text-slate-900 font-black text-sm truncate tracking-tight">
                            {{ chat.Username_Lawan }}
                          </h6>
                          <span class="text-[9px] font-black text-slate-400 shrink-0 uppercase tracking-tighter">
                            {{ getDateChat(chat.Last_Message_At) }}
                          </span>
                        </div>

                        <div class="flex items-center justify-between gap-2">
                          <p 
                            class="text-[11px] font-bold truncate text-slate-500 leading-none" 
                            :title="cleanTooltip(chat.Last_Message)"
                            v-html="formatMessage(chat.Last_Message.replace('_X7#mQ9!vW2_', ' '))"
                          ></p>

                          <div class="flex items-center gap-2">
                            <!-- Quick Bot Toggle -->
                            <button 
                              @click.stop="toggleBotStatus(chat)"
                              class="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all border"
                              :class="chat.Status_Bot === 'aktif' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-slate-50 border-slate-100 text-slate-400'"
                              :title="chat.Status_Bot === 'aktif' ? 'Bot Aktif' : 'Menunggu Admin'"
                            >
                              <Icon :icon="chat.Status_Bot === 'aktif' ? 'lucide:bot' : 'lucide:clock'" class="size-3" />
                              <span class="text-[8px] font-black uppercase tracking-tighter">{{ chat.Status_Bot === 'aktif' ? 'Bot' : 'Menunggu' }}</span>
                            </button>

                            <div v-if="chat.New_Message_Count! > 0" class="grid place-items-center min-w-[20px] h-[20px] px-1 text-[9px] font-black text-white bg-red-500 rounded-full shrink-0 shadow-lg shadow-red-500/30 ring-2 ring-white leading-none animate-bounce-subtle">
                              {{ chat.New_Message_Count! > 99 ? '99+' : chat.New_Message_Count }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="filteredChatsAktif.length > 0" class="flex flex-col flex-1 min-h-0 relative">
                  <div class="px-4 py-2 bg-slate-50 border-y border-slate-200 shrink-0 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <input type="checkbox" v-model="isAllActiveChatsSelected" class="w-4 h-4 rounded form-checkbox cursor-pointer accent-bejo-600" title="Pilih Semua Aktif" />
                      <p class="text-default-700 font-bold text-[11px] uppercase tracking-widest">Chat Aktif({{ filteredChatsAktif.length }})</p>
                    </div>

                    <button v-if="selectedActiveRoomIds.length > 0" @click="handleBatchEndActive" class="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 rounded transition-colors shadow-sm">
                      <Icon icon="lucide:message-square-x" class="size-3.5" />
                      Akhiri {{ selectedActiveRoomIds.length > 1 ? selectedActiveRoomIds.length : '' }} Chat
                    </button>
                  </div>

                  <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <div
                      v-for="(chat, idx) in filteredChatsAktif"
                      :key="chat.Room_Id"
                      v-memo="[chat.Room_Id, chat.Last_Message_At, chat.Last_Message, chat.New_Message_Count, selectedChatId === chat.Room_Id, selectedActiveRoomIds.includes(chat.Room_Id)]"
                      @click="selectChat(idx, 'chat_saya', chat.Room_Id, chat.Id_Lawan, chat.Username_Lawan, chat.Telepon_User_Lawan, chat.Status_Bot || 'nonaktif')"
                      @contextmenu.prevent="openContextMenu($event, chat, 'aktif', idx)"
                      class="relative flex items-center gap-3 py-3 px-4 bg-white cursor-pointer border-b border-slate-50 hover:bg-slate-50/80 transition-all duration-300 group"
                      :class="{
                        'bg-bejo-50/30 before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-bejo-500 before:rounded-r-full': selectedChatId === chat.Room_Id
                      }"
                    >
                      <div class="shrink-0 flex items-center">
                        <input @click.stop type="checkbox" :value="chat.Room_Id" v-model="selectedActiveRoomIds" class="size-4.5 rounded-lg border-slate-200 text-bejo-500 focus:ring-bejo-500/20 cursor-pointer transition-all" />
                      </div>

                      <div class="relative shrink-0 flex items-center justify-center font-black rounded-2xl size-10 bg-gradient-to-br from-bejo-50 to-bejo-100/50 text-bejo-600 border border-white shadow-sm group-hover:scale-105 transition-all duration-300">
                        <span v-if="chat.Username_Lawan" class="text-xs tracking-tighter">{{ chat.Username_Lawan.charAt(0).toUpperCase() }}</span>
                        <Icon v-else icon="lucide:user" class="size-5 text-bejo-300" />
                        <span class="absolute -bottom-1 -right-1 size-3.5 border-2 border-white rounded-full bg-bejo-500 shadow-sm shadow-green-500/20"></span>
                      </div>

                      <div class="flex-grow min-w-0">
                        <div class="flex items-center justify-between gap-2 mb-1">
                          <h6 class="text-slate-900 font-black text-sm truncate tracking-tight">
                            {{ chat.Username_Lawan }}
                          </h6>
                          <span class="text-[9px] font-black text-slate-400 shrink-0 uppercase tracking-tighter">
                            {{ getDateChat(chat.Last_Message_At) }}
                          </span>
                        </div>

                        <div class="flex items-center justify-between gap-2">
                          <p 
                            class="text-[11px] font-bold truncate text-slate-500 leading-none" 
                            :title="cleanTooltip(chat.Last_Message)"
                            v-html="formatMessage(chat.Last_Message.replace('_X7#mQ9!vW2_', ' '))"
                          ></p>

                          <div class="flex items-center gap-2">
                            <!-- Quick Bot Toggle -->
                            <button 
                              @click.stop="toggleBotStatus(chat)"
                              class="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all border"
                              :class="chat.Status_Bot === 'aktif' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-slate-50 border-slate-100 text-slate-400'"
                              :title="chat.Status_Bot === 'aktif' ? 'Bot Aktif' : 'Admin Aktif'"
                            >
                              <Icon :icon="chat.Status_Bot === 'aktif' ? 'lucide:bot' : 'lucide:user-cog'" class="size-3" />
                              <span class="text-[8px] font-black uppercase tracking-tighter">{{ chat.Status_Bot === 'aktif' ? 'Bot' : 'Admin' }}</span>
                            </button>

                            <div v-if="chat.New_Message_Count! > 0" class="grid place-items-center min-w-[20px] h-[20px] px-1 text-[9px] font-black text-white bg-red-500 rounded-full shrink-0 shadow-lg shadow-red-500/30 ring-2 ring-white leading-none animate-bounce-subtle">
                              {{ chat.New_Message_Count! > 99 ? '99+' : chat.New_Message_Count }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

  <div
    v-if="showContextMenu"
    class="fixed z-61 min-w-[200px] bg-white border border-slate-200 rounded-lg shadow-xl p-1.5 select-none"
    :style="{
      top: `${contextMenuPosition.y}px`,
      left: `${contextMenuPosition.x}px`
    }"
  >
    <div class="px-3 py-1.5 mb-1.5 border-b border-slate-100">
      <p class="text-xs font-semibold text-slate-700 truncate">
        {{ selectedChatForMenu?.Username_Lawan || selectedChatForMenu?.Room_Name || 'Menu Chat' }}
      </p>
    </div>

    <button @click="handleViewConversation" class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-100 transition-colors">
      <Icon icon="lucide:message-square-more" class="size-5 text-slate-400" />
      Lihat Percakapan
    </button>

    <button v-if="showEndChatButton" @click="handleEndConversation" class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 transition-colors">
      <Icon icon="lucide:message-square-x" class="size-5 text-red-500" />
      Akhiri Percakapan
    </button>

    <button v-if="showTakeOverButton" @click="handleTakeOverConversation" class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--color-bejo-600)] rounded-md hover:bg-[var(--color-bejo-50)] transition-colors">
      <Icon icon="lucide:message-square-plus" class="size-5 text-[var(--color-bejo-500)]" />
      Ambil Alih Percakapan
    </button>
  </div>
</template>
