<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import simplebar from 'simplebar-vue'
import logo from '@/assets/images/logo-sm.png'
import user1 from '@/assets/images/user/user-1.jpg'
import user2 from '@/assets/images/user/user-2.jpg'
import user3 from '@/assets/images/user/user-3.jpg'
import user4 from '@/assets/images/user/user-4.jpg'
import avatar10 from '@/assets/images/user/avatar-10.png'
import avatar8 from '@/assets/images/user/avatar-8.png'
import avatar1 from '@/assets/images/user/avatar-1.png'
import avatar5 from '@/assets/images/user/avatar-5.png'
import { RouterLink } from 'vue-router'
import api from '@/services/axios'

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
  console.log(id)
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
  User_Ids: string[]
  Count_Status_Sent: number
  List_Id_Message_Sent: string[]
  Count_Status_Received: number
  List_Id_Message_Received: string[]
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

const fetchData = async () => {
  try {
    const { data } = await api.get('/api/chat/getRooms?user_id=' + localStorage.getItem('no_id') + '&orderby=Last_Message_At', {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    Chats.value = data.Data
    console.log(Chats)
  } catch (err: any) {
    console.error('DATA:', err.response?.data)
    console.error('STATUS:', err.response?.status)
    console.error('MESSAGE:', err.message)
  }
}

onMounted(async () => {
  await fetchData()
})
</script>

<template>
  <div class="lg:border-e border-default-200">
    <div id="hs-offcanvas-left" class="hs-overlay [--auto-close:lg] lg:block lg:translate-x-0 lg:static lg:end-auto lg:bottom-0 w-80 hs-overlay-open:translate-x-0 -translate-x-full transition-all duration-300 transform h-full hidden fixed top-0 start-0 bottom-0 overflow-hidden z-60" role="dialog" tabindex="-1" aria-label="Sidebar">
      <div class="card rounded-none shadow-none relative flex flex-row h-full max-h-full overflow-hidden divide-x divide-default-200">
        <div class="w-80">
          <div class="card-body">
            <div class="mt-5 relative">
              <input type="email" class="ps-11 block w-full form-input form-input-sm" placeholder="Search for...." />
              <div class="absolute inset-y-0 start-0 flex items-center ps-4">
                <Icon icon="lucide:search" class="size-3.5 flex items-center text-default-500"></Icon>
              </div>
            </div>
          </div>
          <simplebar class="lg:h-[calc(100vh-250px)] h-[calc(100vh-125px)]" data-simplebar>
            <div class="px-5 mb-1">
              <p class="mb-1 text-cyan-900 text-sm">Perlu Balasan</p>
            </div>
            <div class="bg-cyan-100">
              <RouterLink to="" v-for="(chat, idx) in Chats" @click="selectChat(chat.Room_Id, chat.Username_Lawan, chat.Telepon_User_Lawan)" class="flex gap-3 py-2 px-4 bg-default-150 cursor-pointer">
                <div class="relative flex items-center justify-center font-semibold rounded-full size-9 bg-default-200 text-default-700">
                  <span v-if="chat.Username_Lawan" class="text-sm">
                    {{ chat.Username_Lawan.charAt(0).toUpperCase() }}
                  </span>
                  <Icon v-else icon="lucide:user" class="size-5 text-default-500" />
                  <span class="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-default-50 rounded-full bg-danger"></span>
                </div>
                <div class="flex-grow">
                  <h6 class="mb-1 text-default-800 font-semibold text-sm">{{ chat.Telepon_User_Lawan }}</h6>
                  <p class="text-xs truncate text-default-500">{{ chat.Last_Message }}</p>
                </div>
                <small class="text-xs text-default-500">{{ getDateChat(chat.Last_Message_At) }}</small>
              </RouterLink>
            </div>
          </simplebar>
        </div>
      </div>
    </div>
  </div>
</template>
