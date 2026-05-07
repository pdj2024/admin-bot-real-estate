<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import api from '@/services/axios'
import * as signalR from '@microsoft/signalr'

import Vertical from '@/layouts/vertical.vue'
import ChatContent from './components/ChatContent.vue'
import SideBar from './components/SideBar.vue'
import { type TakeOverPayload } from './components/SideBar.vue'

const selectedRoomId = ref<string | null>(localStorage.getItem('active_room_id'))
const roomIdsBot = ref<string[]>([])
const roomIdsAktif = ref<string[]>([])
const roomIdsAssign = ref<string[]>([])
const selectedUsername = ref<string>(localStorage.getItem('active_username') || '')
const selectedUsernameChange = ref<string>('')
const selectedPhone = ref<string>(localStorage.getItem('active_phone') || '')
const selectedIdLawan = ref<string>(localStorage.getItem('active_id_lawan') || '')
const selectedStatusBot = ref<string>(localStorage.getItem('active_status_bot') || 'nonaktif')
const lastMessageId = ref<string>('')
const takeOverBatch = ref<TakeOverPayload[]>([])
const takeOverSuccess = ref<string[]>([])

const currentActiveTab = ref<string>('chat_saya')

const sidebarRef = ref<any>(null)
const chatContentRef = ref<any>(null)

const chats = ref<any[]>([])
const isLoadingChat = ref(false)
const signalRConnection = ref<signalR.HubConnection | null>(null)
 
const isTakenOver = computed(() => {
  if (!selectedRoomId.value) return false
  return roomIdsAktif.value.includes(selectedRoomId.value)
})

const handleSelectChat = async (id: string) => {
  selectedRoomId.value = id
  localStorage.setItem('active_room_id', id)

  if (signalRConnection.value?.state === signalR.HubConnectionState.Connected) {
    try {
      await signalRConnection.value.invoke('JoinRoom', id)
      console.log(`[SignalR] Berhasil Join ke Room: ${id}`)
    } catch (err) {
      console.error(`[SignalR] Gagal Join ke Room ${id}:`, err)
    }
  } else {
    console.warn('[SignalR] Koneksi belum siap, gagal join room. ID disimpan untuk join otomatis nanti.')
  }
}

const handleIdLawan = (name: string) => {
  selectedIdLawan.value = name
  localStorage.setItem('active_id_lawan', name)
}

const handleUsername = (name: string) => {
  selectedUsername.value = name
  localStorage.setItem('active_username', name)
}

const handlePhone = (phone: string) => {
  selectedPhone.value = phone
  localStorage.setItem('active_phone', phone)
}

const handleStatusBot = (status: string) => {
  selectedStatusBot.value = status
  localStorage.setItem('active_status_bot', status)
}

const handleUsernameChange = (username: string) => {
  selectedUsernameChange.value = username
  if (sidebarRef.value) {
    sidebarRef.value.refreshChatList(undefined, true)
  }
}

const handleTabChange = (tab: string) => {
  currentActiveTab.value = tab
}

const handleClearRoom = () => {
  selectedRoomId.value = null
  selectedUsername.value = ''
  selectedPhone.value = ''
  selectedIdLawan.value = ''
  selectedStatusBot.value = 'nonaktif'
  localStorage.removeItem('active_room_id')
  localStorage.removeItem('active_username')
  localStorage.removeItem('active_phone')
  localStorage.removeItem('active_id_lawan')
  localStorage.removeItem('active_status_bot')
}

// Tambahkan hook untuk menghapus session saat pindah halaman
onBeforeRouteLeave(() => {
  console.log('[Chat] Meninggalkan halaman chat, membersihkan session...')
  handleClearRoom()
})

const handleTakeOver = (status: boolean) => {
  // Pindah tab secara visual saja tanpa re-fetch data, 
  // karena SignalR (refreshChatList) sudah menangani update last message dan perpindahan room antar list
  currentActiveTab.value = status ? 'bot' : 'chat_saya'
  
  // Jika status true (kembali ke bot), tutup room chat dan hapus dari list aktif segera
  if (status === true) {
    if (sidebarRef.value && selectedRoomId.value) {
      sidebarRef.value.removeRoomFromList(selectedRoomId.value)
    }
    handleClearRoom()
  }
}

const handleLastMessage = (id: string) => {
  lastMessageId.value = id
}

const handleChatTakeOverBatch = async (payload: TakeOverPayload[]) => {
  takeOverBatch.value = payload
}

const handleTakeOverStatus = (room: string[]) => {
  takeOverSuccess.value = room
  takeOverBatch.value = []
}

const joinUserChannel = async () => {
  if (signalRConnection.value?.state === signalR.HubConnectionState.Connected) {
    const userId = localStorage.getItem('no_id')
    if (!userId) return

    try {
      await signalRConnection.value.invoke('JoinUserChannel', userId)
      console.log(`[SignalR] Berhasil Join ke User Channel: ${userId}`)
    } catch (err) {
      console.error(`[SignalR] Gagal Join ke User Channel ${userId}:`, err)
    }
  }
}

const joinRoom = async (bot: any, aktif: any, assign: any) => {
  if (signalRConnection.value?.state !== signalR.HubConnectionState.Connected) {
    console.warn('[SignalR] Koneksi belum siap, gagal join ke daftar room.')
    return
  }

  const idsBot = Array.isArray(bot) ? bot : bot?._value || []
  const idsAktif = Array.isArray(aktif) ? aktif : aktif?._value || []
  const idsAssign = Array.isArray(assign) ? assign : assign?._value || []

  const joinMultipleRooms = async (roomIds: string[]) => {
    if (!roomIds || roomIds.length === 0) return

    const promises = roomIds.map(
      (id) => signalRConnection.value!.invoke('JoinRoom', id)
    )
    await Promise.allSettled(promises)
  }

  if (currentActiveTab.value === 'bot') {
    await joinMultipleRooms(idsBot)
  } else if (currentActiveTab.value === 'chat_saya') {
    await joinMultipleRooms([...idsAktif, ...idsAssign])
  }
}

const handleAllRoomIds = async (bot: any, aktif: any, assign: any) => {
  roomIdsBot.value = Array.isArray(bot) ? bot : bot?._value || []
  roomIdsAktif.value = Array.isArray(aktif) ? aktif : aktif?._value || []
  roomIdsAssign.value = Array.isArray(assign) ? assign : assign?._value || []

  if (signalRConnection.value?.state === signalR.HubConnectionState.Connected) {
    await joinRoom(roomIdsBot.value, roomIdsAktif.value, roomIdsAssign.value)
  }
}

const startSignalR = async () => {
  const token = localStorage.getItem('token') || ''
  const role = localStorage.getItem('role_user') || 'admin'
  const hubUrl = 'https://wabotapi.padajaya.biz.id/api/chathub'

  signalRConnection.value = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => token,
      headers: { 'X-Jenis-User': role },
      transport: signalR.HttpTransportType.LongPolling
    })
    .withAutomaticReconnect()
    .build()

  signalRConnection.value.on('RoomCreated', (roomId) => {
    console.log('🟢 [Event: RoomCreated]', roomId)
    if (sidebarRef.value) sidebarRef.value.refreshChatList()
  })

  signalRConnection.value.on('ReceiveMessage', (data: any) => {
    console.log('[SignalR] Data Diterima:', data)

    if (sidebarRef.value) sidebarRef.value.refreshChatList(data)

    const myId = localStorage.getItem('no_id') || ''
    const playDing = () => {
      const notificationSound = new Audio('/sounds/Ding.mp3')
      notificationSound.play().catch((error) => console.error('Gagal memutar audio:', error))
    }

    if (data.tipeUser === 'customer') {
      playDing()
    }

    if (String(data.roomId) === String(selectedRoomId.value)) {
      if (data.senderId === myId) {
        console.log('[SignalR] Update status pesan sendiri')
        const pendingChat = chats.value.find((c) => c.Message === data.message && c.Send_Status === 'pending')
        if (pendingChat) {
          pendingChat.Message_Id = data.messageId
          pendingChat.Send_Status = 'send'
        }
        return
      }

      chats.value.push({
        Message_Id: data.messageId,
        Room_Id: data.roomId,
        Sender_Id: data.senderId,
        Message: data.message,
        Sent_At: data.sentAt,
        Edited_At: data.editedAt,
        Tipe_User: data.tipeUser,
        Id_Paket: data.idPaket,
        Status: data.status,
        Jenis_Pesan: data.jenisPesan,
        Send_Status: data.sendStatus || 'send'
      })
    }
  })

  signalRConnection.value.on('ReceiveHandoverAlert', (payload) => {
    console.log('[Event: ReceiveHandoverAlert]', payload)
    if (payload && payload.roomId === selectedRoomId.value) {
      handleClearRoom()
      handleTakeOver(true)
    }
  })

  signalRConnection.value.on('GlobalHandoverAlert', (payload) => {
    console.log('[Event: GlobalHandoverAlert]', payload)
    
    // Selalu refresh tab aktif secara silent agar chat room bertambah/hilang secara halus
    if (sidebarRef.value) {
      sidebarRef.value.refreshChatList(undefined, true)
    }

    // Jika room yang sedang dibuka dikembalikan ke bot, tutup room
    const isToBot = payload.adminId === 'adm_bot'
    if (isToBot && payload && payload.roomId === selectedRoomId.value) {
      handleClearRoom()
      handleTakeOver(true)
    }
  })

  signalRConnection.value.onreconnected(async (connectionId) => {
    console.log(`[SignalR] Reconnected otomatis. Connection ID: ${connectionId}`)
    await joinUserChannel()
    await joinRoom(roomIdsBot.value, roomIdsAktif.value, roomIdsAssign.value)
    if (selectedRoomId.value) {
      try {
        await signalRConnection.value!.invoke('JoinRoom', selectedRoomId.value)
        console.log(`[SignalR] Berhasil Re-Join ke Room: ${selectedRoomId.value}`)
      } catch (err) {
        console.error(`[SignalR] Gagal Re-Join ke Room ${selectedRoomId.value}:`, err)
      }
    }
  })

  try {
    await signalRConnection.value.start()
    console.log('[SignalR] Connected via Index')
    await joinUserChannel()
    await joinRoom(roomIdsBot.value, roomIdsAktif.value, roomIdsAssign.value)
    
    // Join kembali ke room yang sedang dibuka (jika ada)
    const savedRoomId = selectedRoomId.value || localStorage.getItem('active_room_id')
    if (savedRoomId) {
      try {
        await signalRConnection.value.invoke('JoinRoom', savedRoomId)
        console.log(`[SignalR] Berhasil Join ke Active Room: ${savedRoomId}`)
      } catch (err) {
        console.warn(`[SignalR] Gagal join ke active room ${savedRoomId}:`, err)
      }
    }
  } catch (err) {
    console.error('[SignalR] Connection Error:', err)
  }
}

const fetchChatContent = async (id: string) => {
  isLoadingChat.value = true
  try {
    const response = await api.get(`/api/chat/getAll?orderby=sent_at&orderdir=asc&room_id=${id}`, {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    chats.value = response.data.Data
  } catch (error) {
    console.error('Gagal memuat chat:', error)
  } finally {
    isLoadingChat.value = false
  }
}

watch(
  selectedRoomId,
  (newId) => {
    // Clear previous chats immediately to avoid flash of stale content
    chats.value = []
    if (newId) {
      fetchChatContent(newId)
    }
  },
  { immediate: true }
)

const handleUpdateChatStatus = (payload: { index: number; status: 'send' | 'failed' | 'pending' }) => {
  if (chats.value[payload.index]) {
    chats.value[payload.index].Send_Status = payload.status
  }
}

onMounted(() => {
  startSignalR()
})

onBeforeUnmount(() => {
  if (signalRConnection.value) {
    signalRConnection.value.stop()
  }
})
</script>

<template>
  <Vertical>
    <div class="p-0 md:p-2 md:pt-1 md:pb-0 h-full overflow-hidden">
      <!-- Premium Main Container -->
      <div class="bg-white border-0 md:border border-slate-100 shadow-none md:shadow-xl md:shadow-slate-200/40 md:rounded-[2rem] overflow-hidden">
        <div class="flex h-[calc(100vh-180px)] md:h-[calc(100vh-170px)] min-h-[500px]">
          <SideBar 
            ref="sidebarRef" 
            class="shrink-0"
            :activeRoomId="selectedRoomId || ''" 
            :usernameChange="selectedUsernameChange" 
            @selectChat="handleSelectChat" 
            @username="handleUsername" 
            @phoneNumber="handlePhone" 
            @idLawan="handleIdLawan" 
            @changeTab="handleTabChange" 
            @allRoomIds="handleAllRoomIds" 
            @lastMessageId="handleLastMessage" 
            @statusBot="handleStatusBot"
            @chatTakeOverBatch="handleChatTakeOverBatch" 
          />

          <ChatContent 
            ref="chatContentRef" 
            :key="selectedRoomId ?? 'empty'"
            class="flex-1 w-full min-w-0"
            :roomId="selectedRoomId" 
            :idLawan="selectedIdLawan" 
            v-model:username="selectedUsername" 
            :phoneNumber="selectedPhone" 
            :activeTab="currentActiveTab" 
            :chats="chats" 
            :isLoadingChat="isLoadingChat"
            :lastMessageId="lastMessageId" 
            :takeOverBatch="takeOverBatch" 
            :isTakenOver="isTakenOver"
            :statusBot="selectedStatusBot"
            @chatTakeOver="handleTakeOver" 
            @clearRoom="handleClearRoom" 
            @usernameChange="handleUsernameChange" 
            @takeOverStatus="handleTakeOverStatus"
            @addChat="chats.push($event)"
            @updateChatStatus="handleUpdateChatStatus"
          />
        </div>
      </div>
    </div>
  </Vertical>
</template>
