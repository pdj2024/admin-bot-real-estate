<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Icon } from '@iconify/vue'
import SideBar from '@/views/chat/components/SideBar.vue'
import ChatContent from '@/views/chat/components/ChatContent.vue'
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
const chats = computed(() => chatStore.chats)

const closeChat = () => {
  isOpen.value = false
  isFocusedMode.value = false
  isSessionTakenOver.value = false
}

const fetchChatContent = async (id: string) => {
  try {
    const response = await api.get(`/api/chat/getAll?room_id=${id}`, {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    chatStore.chats = response.data.Data
  } catch (error) {
    console.error('Gagal memuat chat:', error)
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

const handleTakeOver = async () => {
  try {
    await api.post('/api/chat/toggle-bot', {
      customer_phone: selectedPhone.value,
      admin_id: localStorage.getItem('no_id'),
      status_bot: false
    }, { headers: { 'X-Jenis-User': 'Admin' } })
    
    // Play sound
    const audio = new Audio('/sounds/Ding.mp3')
    audio.play().catch(() => {})
    
    // Robust SignalR Join Sequence
    if (!chatStore.isConnected) await chatStore.initSignalR()
    await chatStore.joinUserChannel()
    if (selectedRoomId.value) {
      await chatStore.joinRoom(selectedRoomId.value)
    }
    
    isSessionTakenOver.value = true
  } catch (err) {
    console.error('Gagal ambil alih:', err)
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
          <div v-if="isFocusedMode" class="shrink-0 px-6 py-4 bg-white border-b border-slate-100 flex items-center gap-4">
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
              @clearRoom="handleClearRoom"
              @toggleFocused="isFocusedMode = true"
            />
            
            <!-- Take Over Overlay -->
            <Transition name="fade">
              <div v-if="selectedRoomId && !isSessionTakenOver" class="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                <div class="size-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-6 shadow-2xl animate-bounce-subtle">
                  <Icon icon="lucide:message-square-plus" class="size-10 text-bejo-500" />
                </div>
                <h4 class="text-white text-xl font-black mb-3">Ambil Alih Percakapan</h4>
                <p class="text-white/70 text-sm mb-8 max-w-xs">Pesan customer saat ini sedang ditangani Bot atau belum terhubung dengan Anda.</p>
                <button 
                  @click="handleTakeOver"
                  class="px-8 py-4 bg-bejo-500 hover:bg-bejo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-bejo-500/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                >
                  <Icon icon="lucide:hand" class="size-5" />
                  Mulai Chat Sekarang
                </button>
              </div>
            </Transition>

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
