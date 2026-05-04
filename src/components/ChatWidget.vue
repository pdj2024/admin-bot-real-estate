<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Icon } from '@iconify/vue'
import SideBar from '@/views/admin/chat/components/SideBar.vue'
import ChatContent from '@/views/admin/chat/components/ChatContent.vue'
import { useChatStore } from '@/stores/chat'
import api from '@/services/axios'

const chatStore = useChatStore()
const isOpen = ref(false)
const selectedRoomId = computed({
  get: () => chatStore.selectedRoomId,
  set: (val) => chatStore.selectedRoomId = val
})
const selectedUsername = ref('')
const selectedPhone = ref('')
const selectedIdLawan = ref('')
const lastMessageId = ref('')
const activeTab = ref('chat_saya')
const takeOverBatch = ref<any[]>([])
const isFocusedMode = ref(false)
const isSessionTakenOver = ref(false)
const isLoadingChat = ref(false)
const chats = computed(() => chatStore.chats)

const closeChat = () => {
  isOpen.value = false
  isFocusedMode.value = false
  isSessionTakenOver.value = false
}

const fetchChatContent = async (id: string) => {
  isLoadingChat.value = true
  try {
    const response = await api.get(`/api/chat/getAll?orderby=sent_at&orderdir=asc&room_id=${id}`, {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    chatStore.chats = response.data.Data
  } finally {
    isLoadingChat.value = false
  }
}

const openForCustomer = async (customerId: string) => {
  isOpen.value = true
  isFocusedMode.value = true
  isSessionTakenOver.value = false
  
  // 1. Init SignalR in focused mode (skip global channels)
  if (!chatStore.isConnected) {
    await chatStore.initSignalR({ skipGlobal: true })
  }

  try {
    // 2. Resolve Room ID via customerId
    const resRooms = await api.get(`/api/chat/getRoomsGlobal?user_id=${customerId}`, {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    
    if (resRooms.data.Data && resRooms.data.Data.length > 0) {
      const room = resRooms.data.Data[0]
      selectedRoomId.value = room.Room_Id
      selectedUsername.value = room.Username_Lawan || room.Room_Name
      selectedPhone.value = room.Telepon_User_Lawan
      selectedIdLawan.value = room.Id_Lawan

      // 3. Load history
      await fetchChatContent(room.Room_Id)
      
      // 4. Join the specific SignalR room
      await chatStore.joinRoom(room.Room_Id)
    } else {
      console.warn('Room tidak ditemukan untuk customer:', customerId)
    }
  } catch (err) {
    console.error('Gagal membuka chat customer:', err)
  }
}

watch(selectedRoomId, (newId) => {
  if (newId) {
    fetchChatContent(newId)
    chatStore.joinRoom(newId)
  } else {
    chatStore.chats = []
  }
})


//   }
// }

const handleSelectChat = (id: string) => {
  selectedRoomId.value = id
}

const handleUsername = (name: string) => {
  selectedUsername.value = name
}

const handlePhone = (phone: string) => {
  selectedPhone.value = phone
}

const handleIdLawan = (id: string) => {
  selectedIdLawan.value = id
}

const handleClearRoom = () => {
  selectedRoomId.value = null
  closeChat()
}

const handleUpdateChatStatus = (payload: { index: number; status: 'send' | 'failed' | 'pending' }) => {
  if (chatStore.chats[payload.index]) {
    chatStore.chats[payload.index].Send_Status = payload.status
  }
}

defineExpose({
  openForCustomer
})
</script>

<template>
  <div class="fixed bottom-6 right-6 z-[999] hidden lg:block">
    <!-- Chat Window Container -->
    <Transition name="chat-window">
      <div 
        v-if="isOpen"
        class="absolute bottom-20 right-0 w-[800px] h-[600px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 flex overflow-hidden origin-bottom-right"
      >
        <!-- Mini Sidebar -->
        <!-- Mini Sidebar -->
        <SideBar 
          v-if="!isFocusedMode"
          class="w-80 shrink-0 border-r border-slate-50"
          :activeRoomId="selectedRoomId || ''"
          @selectChat="handleSelectChat"
          @username="handleUsername"
          @phoneNumber="handlePhone"
          @idLawan="handleIdLawan"
          @changeTab="(tab) => activeTab = tab"
        />

        <!-- Chat Area -->
        <div class="flex-1 flex flex-col bg-slate-50 relative min-w-0">
          <!-- General Close Button -->
          <button @click="closeChat" class="absolute top-4 right-4 z-[60] size-10 rounded-2xl bg-white/80 backdrop-blur shadow-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all">
            <Icon icon="lucide:x" class="size-6" />
          </button>

          <!-- Focus Mode Header -->
          <div v-if="isFocusedMode" class="shrink-0 px-6 py-2.5 bg-white border-b border-slate-100 flex items-center gap-4">
            <!-- Removed 'Back' button to keep it restricted to focused customer -->
            <h5 class="text-sm font-black text-slate-900 uppercase tracking-tighter">Percakapan Customer</h5>
          </div>

          <div class="flex-1 flex flex-col relative min-h-0">
            <ChatContent 
              v-if="selectedRoomId"
              :roomId="selectedRoomId"
              :username="selectedUsername"
              :phoneNumber="selectedPhone"
              :idLawan="selectedIdLawan"
              :chats="chats"
              :activeTab="activeTab"
              :lastMessageId="lastMessageId"
              :takeOverBatch="takeOverBatch"
              :isFocused="isFocusedMode"
              :isTakenOver="isSessionTakenOver"
              :isLoadingChat="isLoadingChat"
              @clearRoom="handleClearRoom"
              @toggleFocused="isFocusedMode = true"
              @addChat="chatStore.chats.push($event)"
              @updateChatStatus="handleUpdateChatStatus"
            />
            

            <div v-if="!selectedRoomId" class="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <div class="size-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
                <Icon icon="lucide:message-square" class="size-10 text-slate-300" />
              </div>
              <h4 class="text-slate-900 font-black text-lg mb-2">Pilih Obrolan</h4>
              <p class="text-sm">Klik pada salah satu chat di samping untuk mulai membalas pesan.</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.chat-window-enter-active,
.chat-window-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.chat-window-enter-from,
.chat-window-leave-to {
  opacity: 0;
  transform: scale(0.5) translate(30px, 30px);
  filter: blur(10px);
}

.animate-bounce-subtle {
  animation: bounce-subtle 3s infinite;
}

@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

/* Scrollbar styling for widget */
:deep(.simplebar-track.vertical) {
  width: 6px;
}
:deep(.simplebar-thumb) {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
