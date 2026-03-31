<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import simplebar from 'simplebar-vue'
import { RouterLink } from 'vue-router'
import api from '@/services/axios'

// Tambahkan props untuk menerima ID chat yang sedang aktif
const props = defineProps<{
  activeRoomId: string | null
}>()

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
  User_Ids: string[]
  Count_Status_Sent: number
  List_Id_Message_Sent: string[]
  Count_Status_Received: number
  List_Id_Message_Received: string[]
}

const Chats = ref<Chat[]>([])

const emit = defineEmits<{
  (e: 'select_chat', id: string): void
  (e: 'username', username: string): void
  (e: 'phone_number', phoneNumber: string): void
}>()

const selectChat = (id: string, username: string, phoneNumber: string) => {
  emit('select_chat', id)
  emit('username', username)
  emit('phone_number', phoneNumber)
  closeSidebar()
}

const getDateChat = (date: any) => {
  if (!date) return ''
  const d = new Date(date)
  const today = new Date().setHours(0, 0, 0, 0)
  const target = new Date(d).setHours(0, 0, 0, 0)
  
  // PERBAIKAN: Gunakan Math.round agar pembagian hari konsisten
  const diffDays = Math.round((today - target) / 86400000)

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

const fetchData = async () => {
  try {
    const { data } = await api.get('/api/chat/getRooms?user_id=' + localStorage.getItem('no_id') + '&orderby=Last_Message_At', {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    Chats.value = data.Data
  } catch (err: any) {
    console.error('ERROR DATA:', err)
  }
}

onMounted(async () => {
  await fetchData()
})
</script>

<template>
  <div class="lg:border-e border-default-200">
    <div id="hs-offcanvas-left" class="hs-overlay [--auto-close:lg] lg:block lg:translate-x-0 lg:static lg:end-auto lg:bottom-0 w-80 hs-overlay-open:translate-x-0 -translate-x-full transition-all duration-300 transform h-full hidden fixed top-0 start-0 bottom-0 overflow-hidden z-60" role="dialog" tabindex="-1" aria-label="Sidebar">
      <div class="bg-white relative flex flex-col h-full overflow-hidden">
        
        <div class="p-4 border-b border-default-100">
          <div class="relative">
            <input type="text" class="ps-10 block w-full form-input form-input-sm bg-default-100 rounded-lg border-none" placeholder="Cari pesan..." />
            <div class="absolute inset-y-0 start-0 flex items-center ps-3">
              <Icon icon="lucide:search" class="size-4 text-default-400"></Icon>
            </div>
          </div>
        </div>

        <simplebar class="h-full" data-simplebar>
          <div class="px-4 py-2 border-b border-default-100">
            <p class="text-xs font-semibold text-primary uppercase tracking-wider">Perlu Balasan</p>
          </div>
          
          <div class="flex flex-col">
            <div 
              v-for="(chat, idx) in Chats" 
              :key="idx" 
              @click="selectChat(chat.Room_Id, chat.Username_Lawan, chat.Telepon_User_Lawan)" 
              class="flex gap-3 py-3 px-4 cursor-pointer transition-all border-b border-default-50"
              :class="activeRoomId === chat.Room_Id ? 'bg-primary/5 border-r-4 border-r-primary' : 'hover:bg-default-50 bg-white'"
            >
              <div class="relative flex-shrink-0 flex items-center justify-center font-bold rounded-full size-10 text-white"
                   :class="activeRoomId === chat.Room_Id ? 'bg-primary' : 'bg-default-300'">
                <span v-if="chat.Username_Lawan" class="text-sm">
                  {{ chat.Username_Lawan.substring(0, 2).toUpperCase() }}
                </span>
                <Icon v-else icon="lucide:user" class="size-5" />
                <span class="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full bg-danger"></span>
              </div>
              
              <div class="flex-grow min-w-0">
                <div class="flex justify-between items-center mb-0.5">
                  <h6 class="text-default-900 font-semibold text-sm truncate pr-2">
                    {{ chat.Username_Lawan || chat.Telepon_User_Lawan }}
                  </h6>
                  <small class="text-[10px] text-default-400 whitespace-nowrap">{{ getDateChat(chat.Last_Message_At) }}</small>
                </div>
                <p class="text-xs truncate" :class="activeRoomId === chat.Room_Id ? 'text-default-700 font-medium' : 'text-default-500'">
                  {{ chat.Last_Message }}
                </p>
              </div>
            </div>
          </div>
        </simplebar>

      </div>
    </div>
  </div>
</template>