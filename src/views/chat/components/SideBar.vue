<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import simplebar from 'simplebar-vue'
import { RouterLink } from 'vue-router'
import api from '@/services/axios'

const Chats = ref<Chat[]>([])
const chatsPerluBalasan = ref<Chat[]>([])
const chatsPerluDihandle = ref<Chat[]>([])
const activeTab = ref<'untuk_saya' | 'semua'>('untuk_saya')
const isLoading = ref<boolean>(false)

const emit = defineEmits<{
  (e: 'selectChat', id: string): void
  (e: 'idLawan', id_lawan: string): void
  (e: 'username', username: string): void
  (e: 'phoneNumber', phoneNumber: string): void
  (e: 'changeTab', tab: string): void
}>()

const selectChat = (id: string, idLawan: string, username: string, phoneNumber: string) => {
  emit('selectChat', id)
  emit('idLawan', idLawan)
  emit('username', username)
  emit('phoneNumber', phoneNumber)
  emit('changeTab', activeTab.value)
  closeSidebar()
}

const props = defineProps<{
  activeRoomId: string | ''
  usernameChange: string | ''
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

const forceRefreshToUntukSaya = () => {
  activeTab.value = 'untuk_saya'
  fetchData('untuk_saya')
}

const fetchData = async (tab: 'semua' | 'untuk_saya') => {
  try {
    isLoading.value = true

    if (tab === 'semua') {
      Chats.value = []
      const endpoint = '/api/chat/getRoomsGlobal?orderby=Last_Message_At&orderdir=desc'

      const { data } = await api.get(endpoint, {
        headers: { 'X-Jenis-User': 'Admin' }
      })
      Chats.value = data.Data || []
    } else {
      chatsPerluBalasan.value = []
      chatsPerluDihandle.value = []

      const userId = localStorage.getItem('no_id') || ''
      const endpointBalasan = '/api/chat/getRooms?user_id=' + userId + '&orderby=Last_Message_At'
      const endpointHandle = '/api/chat/getRoomsGlobal?status=aktif&orderby=Last_Message_At&orderdir=asc'

      const [resBalasan, resHandle] = await Promise.all([api.get(endpointBalasan, { headers: { 'X-Jenis-User': 'Admin' } }), api.get(endpointHandle, { headers: { 'X-Jenis-User': 'Admin' } })])

      chatsPerluBalasan.value = resBalasan.data.Data || []
      chatsPerluDihandle.value = resHandle.data.Data || []
    }
  } catch (err: any) {
    console.error('DATA ERROR:', err.response?.data || err.message)
  } finally {
    isLoading.value = false
  }
}

const changeTab = (tab: 'semua' | 'untuk_saya') => {
  if (activeTab.value === tab) return
  activeTab.value = tab
  fetchData(tab)
}

const refreshChatList = () => {
  fetchData(activeTab.value)
}

watch(
  () => props.usernameChange,
  (newVal) => {
    if (newVal && newVal !== '') {
      console.log('Username baru diterima di sidebar:', newVal)
      updateSidebarUI(newVal)
    }
  }
)

const updateSidebarUI = (newName: string) => {
  const updateItem = (chatList: Chat[]) => {
    const index = chatList.findIndex((c) => c.Room_Id === props.activeRoomId)
    if (index !== -1) {
      chatList[index].Username_Lawan = newName
    }
  }

  updateItem(Chats.value)
  updateItem(chatsPerluBalasan.value)
  updateItem(chatsPerluDihandle.value)
}

onMounted(async () => {
  fetchData(activeTab.value)
})

defineExpose({
  forceRefreshToUntukSaya,
  refreshChatList
})
</script>

<template>
  <div class="lg:border-e border-slate-200 bg-white">
    <div id="hs-offcanvas-left" class="hs-overlay [--auto-close:lg] lg:block lg:translate-x-0 lg:static lg:end-auto lg:bottom-0 w-80 hs-overlay-open:translate-x-0 -translate-x-full transition-all duration-300 transform h-full hidden fixed top-0 start-0 bottom-0 overflow-hidden z-60" role="dialog" tabindex="-1" aria-label="Sidebar">
      <div class="card rounded-none shadow-none relative flex flex-row h-full max-h-full overflow-hidden divide-x divide-slate-200 bg-white">
        <div class="w-80 flex flex-col h-full">
          <div class="p-4 border-b border-slate-100 shrink-0 bg-white">
            <div class="relative">
              <input type="text" class="ps-11 block w-full text-sm border-slate-200 rounded-full focus:border-cyan-500 focus:ring-cyan-500" placeholder="Search for...." />
              <div class="absolute inset-y-0 start-0 flex items-center ps-4">
                <Icon icon="lucide:search" class="size-4 text-slate-400"></Icon>
              </div>
            </div>
          </div>

          <simplebar class="flex-grow h-0" data-simplebar>
            <div class="px-4 py-3 flex gap-2 sticky top-0 bg-white/95 backdrop-blur-sm z-20 border-b border-slate-100 shadow-sm">
              <button @click="changeTab('semua')" class="px-5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 border" :class="activeTab === 'semua' ? 'bg-[#cffafe] text-cyan-800 border-transparent' : 'bg-transparent border-slate-200 text-slate-500 hover:bg-slate-50'">Semua</button>
              <button @click="changeTab('untuk_saya')" class="px-5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 border" :class="activeTab === 'untuk_saya' ? 'bg-[#cffafe] text-cyan-800 border-transparent' : 'bg-transparent border-slate-200 text-slate-500 hover:bg-slate-50'">Untuk Saya</button>
            </div>

            <div v-if="isLoading" class="flex flex-col items-center justify-center py-10 text-slate-400">
              <Icon icon="lucide:loader-2" class="size-6 animate-spin mb-2" />
              <span class="text-sm">Memuat obrolan...</span>
            </div>

            <div v-else>
              <div v-if="activeTab === 'semua'">
                <div v-if="Chats.length === 0" class="text-center py-10 text-sm text-slate-400">Tidak ada obrolan ditemukan.</div>
                <div v-else>
                  <RouterLink to="" v-for="(chat, idx) in Chats" :key="'semua-' + idx" @click="selectChat(chat.Room_Id, chat.Id_Lawan, chat.Username_Lawan || chat.Room_Name, chat.Telepon_User_Lawan)" class="flex items-center gap-3 py-3 px-4 bg-white cursor-pointer border-b border-slate-100 hover:bg-[var(--color-bejo-50)] transition-colors group">
                    <div class="relative shrink-0 flex items-center justify-center font-semibold rounded-full size-10 bg-slate-100 text-slate-600 group-hover:bg-white transition-colors">
                      <span v-if="chat.Room_Name" class="text-sm">{{ chat.Username_Lawan.charAt(0).toUpperCase() || chat.Room_Name.charAt(0).toUpperCase() }}</span>
                      <Icon v-else icon="lucide:user" class="size-5 text-slate-400" />
                      <span class="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-[var(--color-bejo-500)]"></span>
                    </div>
                    <div class="flex-grow min-w-0">
                      <div class="flex items-center justify-between gap-2 mb-0.5">
                        <h6 class="text-slate-800 font-bold text-sm truncate uppercase">{{ chat.Username_Lawan.toUpperCase() || chat.Room_Name.toUpperCase() }}</h6>
                        <small class="text-[10px] text-slate-400 shrink-0 font-medium">{{ getDateChat(chat.Last_Message_At) }}</small>
                      </div>
                      <p class="text-xs truncate text-slate-500 leading-relaxed capitalized">{{ chat.Last_Message.replace('_X7#mQ9!vW2_', ' ') }}</p>
                    </div>
                  </RouterLink>
                </div>
              </div>

              <div v-if="activeTab === 'untuk_saya'">
                <div v-if="chatsPerluBalasan.length === 0 && chatsPerluDihandle.length === 0" class="text-center py-10 text-sm text-slate-400">Bagus! Tidak ada antrean pesan saat ini.</div>

                <div v-if="chatsPerluBalasan.length > 0">
                  <div class="px-4 py-2 bg-slate-50 border-y border-slate-200">
                    <p class="text-cyan-700 font-bold text-[11px] uppercase tracking-widest">Perlu Balasan ({{ chatsPerluBalasan.length }})</p>
                  </div>

                  <div class="max-h-[45vh] overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <RouterLink to="" v-for="(chat, idx) in chatsPerluBalasan" :key="'balasan-' + idx" @click="selectChat(chat.Room_Id, chat.Id_Lawan, chat.Username_Lawan || chat.Room_Name, chat.Telepon_User_Lawan)" class="flex items-center gap-3 py-3 px-4 bg-white cursor-pointer border-b border-slate-100 hover:bg-[var(--color-bejo-50)] transition-colors group">
                      <div class="relative shrink-0 flex items-center justify-center font-semibold rounded-full size-10 bg-slate-100 text-slate-600 group-hover:bg-white transition-colors">
                        <span v-if="chat.Username_Lawan" class="text-sm">{{ chat.Username_Lawan.charAt(0).toUpperCase() }}</span>
                        <Icon v-else icon="lucide:user" class="size-5 text-slate-400" />
                        <span class="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-[var(--color-bejo-500)]"></span>
                      </div>
                      <div class="flex-grow min-w-0">
                        <div class="flex items-center justify-between gap-2 mb-0.5">
                          <h6 class="text-slate-800 font-bold text-sm truncate uppercase">{{ chat.Username_Lawan.toUpperCase() || chat.Room_Name.toUpperCase() }}</h6>
                          <small class="text-[10px] text-slate-400 shrink-0 font-medium">{{ getDateChat(chat.Last_Message_At) }}</small>
                        </div>
                        <p class="text-xs truncate text-slate-500 leading-relaxed">{{ chat.Last_Message || 'Hai' }}</p>
                      </div>
                    </RouterLink>
                  </div>
                </div>

                <div v-if="chatsPerluDihandle.length > 0">
                  <div class="px-4 py-2 bg-slate-50 border-y border-slate-200">
                    <p class="text-[var(--text-bejo-800)] font-bold text-[11px] uppercase tracking-widest">Perlu Dihandle ({{ chatsPerluDihandle.length }})</p>
                  </div>

                  <div class="max-h-[45vh] overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[var(--color-bejo-200)] hover:[&::-webkit-scrollbar-thumb]:bg-[var(--color-bejo-300)] [&::-webkit-scrollbar-thumb]:rounded-full">
                    <RouterLink to="" v-for="(chat, idx) in chatsPerluDihandle" :key="'handle-' + idx" @click="selectChat(chat.Room_Id, chat.Id_Lawan, chat.Username_Lawan || chat.Room_Name, chat.Telepon_User_Lawan)" class="flex items-center gap-3 py-3 px-4 bg-white cursor-pointer border-b border-slate-100 hover:bg-[var(--color-bejo-50)] transition-colors group">
                      <div class="relative shrink-0 flex items-center justify-center font-semibold rounded-full size-10 bg-slate-100 text-slate-600 group-hover:bg-white transition-colors">
                        <span v-if="chat.Username_Lawan" class="text-sm">{{ chat.Username_Lawan.charAt(0).toUpperCase() }}</span>
                        <Icon v-else icon="lucide:user" class="size-5 text-slate-400" />
                        <span class="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-[var(--color-bejo-500)]"></span>
                      </div>
                      <div class="flex-grow min-w-0">
                        <div class="flex items-center justify-between gap-2 mb-0.5">
                          <h6 class="text-slate-800 font-bold text-sm truncate uppercase">{{ chat.Username_Lawan.toUpperCase() || chat.Room_Name.toUpperCase() }}</h6>
                          <small class="text-[10px] text-slate-400 shrink-0 font-medium">{{ getDateChat(chat.Last_Message_At) }}</small>
                        </div>
                        <p class="text-xs truncate text-slate-500 leading-relaxed">{{ chat.Last_Message || 'Hai' }}</p>
                      </div>
                    </RouterLink>
                  </div>
                </div>
              </div>
            </div>
          </simplebar>
        </div>
      </div>
    </div>
  </div>
</template>
