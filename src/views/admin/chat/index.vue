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
const selectedNamaDisplay = ref<string>(localStorage.getItem('active_nama_display') || '')
const lastMessageId = ref<string>('')
const takeOverBatch = ref<TakeOverPayload[]>([])
const takeOverSuccess = ref<string[]>([])

const currentActiveTab = ref<'chat_saya' | 'bot'>('chat_saya')

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

const handleNamaDisplay = (name: string) => {
  selectedNamaDisplay.value = name
  localStorage.setItem('active_nama_display', name)
}

const handleUsernameChange = (username: string) => {
  selectedUsernameChange.value = username
  if (sidebarRef.value) {
    sidebarRef.value.refreshChatList(undefined, true)
  }
}

const handleTabChange = (tab: 'chat_saya' | 'bot') => {
  currentActiveTab.value = tab
}

const handleClearRoom = () => {
  selectedRoomId.value = null
  selectedUsername.value = ''
  selectedPhone.value = ''
  selectedIdLawan.value = ''
  selectedStatusBot.value = 'nonaktif'
  selectedNamaDisplay.value = ''
  localStorage.removeItem('active_room_id')
  localStorage.removeItem('active_username')
  localStorage.removeItem('active_phone')
  localStorage.removeItem('active_id_lawan')
  localStorage.removeItem('active_status_bot')
  localStorage.removeItem('active_nama_display')
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

// Cache room IDs yang sudah di-join agar tidak double-join saat switch tab
const joinedRoomIds = new Set<string>()

const joinRoom = async (bot: any, aktif: any, assign: any) => {
  if (signalRConnection.value?.state !== signalR.HubConnectionState.Connected) {
    console.warn('[SignalR] Koneksi belum siap, gagal join ke daftar room.')
    return
  }

  const idsBot = Array.isArray(bot) ? bot : bot?._value || []
  const idsAktif = Array.isArray(aktif) ? aktif : aktif?._value || []
  const idsAssign = Array.isArray(assign) ? assign : assign?._value || []

  const joinNewRoomsOnly = async (roomIds: string[]) => {
    if (!roomIds || roomIds.length === 0) return
    // Hanya join room yang belum pernah di-join sebelumnya
    const newRooms = roomIds.filter(id => !joinedRoomIds.has(id))
    if (newRooms.length === 0) return

    const promises = newRooms.map(id => {
      joinedRoomIds.add(id)
      return signalRConnection.value!.invoke('JoinRoom', id)
    })
    await Promise.allSettled(promises)
  }

  if (currentActiveTab.value === 'bot') {
    await joinNewRoomsOnly(idsBot)
  } else if (currentActiveTab.value === 'chat_saya') {
    await joinNewRoomsOnly([...idsAktif, ...idsAssign])
  }
}

const handleAllRoomIds = async (bot: any, aktif: any, assign: any) => {
  const newBot = Array.isArray(bot) ? bot : bot?._value || []
  const newAktif = Array.isArray(aktif) ? aktif : aktif?._value || []
  const newAssign = Array.isArray(assign) ? assign : assign?._value || []

  // Skip jika IDs sama persis — tidak perlu update state & re-join
  const isSame = (a: string[], b: string[]) => a.length === b.length && a.every((v, i) => v === b[i])
  if (isSame(newBot, roomIdsBot.value) && isSame(newAktif, roomIdsAktif.value) && isSame(newAssign, roomIdsAssign.value)) return

  roomIdsBot.value = newBot
  roomIdsAktif.value = newAktif
  roomIdsAssign.value = newAssign

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
      headers: { 'X-Jenis-User': role }
      // Tidak lock ke LongPolling — biarkan SignalR nego transport terbaik (WebSocket > SSE > LongPolling)
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
        const myChat = chats.value.find((c) => 
          c.Message === data.message && 
          (c.Send_Status === 'pending' || (c.Send_Status === 'send' && !c.Message_Id))
        )
        if (myChat) {
          myChat.Message_Id = data.messageId
          myChat.Send_Status = 'send'
          return
        }
      }

      // Hindari duplikasi pesan sistem yang baru saja di-push secara lokal
      const isDuplicate = chats.value.some((c) => 
        c.Message === data.message && 
        (c.Message_Id === data.messageId || (c.Send_Status === 'pending' && c.Sender_Id === data.senderId))
      )
      
      if (isDuplicate) {
        console.log('[SignalR] Pesan duplikat diabaikan (sudah ada di UI)')
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
    const myId = localStorage.getItem('no_id') || ''
    
    // Normalisasi payload (antisipasi snake_case dari server)
    const roomId = payload.roomId || payload.room_id
    const adminId = payload.adminId || payload.admin_id

    // Jika room yang kita buka diambil alih orang lain (bukan kita), tutup room
    if (payload && adminId !== myId && roomId === selectedRoomId.value) {
      handleClearRoom()
      handleTakeOver(true)
    }

    // Segera hapus dari sidebar jika diambil alih admin lain (bukan saya dan bukan dikembalikan ke bot)
    if (adminId !== myId && adminId !== 'adm_bot') {
      if (sidebarRef.value) {
        sidebarRef.value.removeRoomFromList(roomId)
      }
    }
  })

  signalRConnection.value.on('GlobalHandoverAlert', (payload) => {
    console.log('[Event: GlobalHandoverAlert]', payload)
    
    const myId = localStorage.getItem('no_id') || ''
    
    // Normalisasi payload
    const roomId = payload.roomId || payload.room_id
    const adminId = payload.adminId || payload.admin_id
    
    const isMe = adminId === myId
    const isToBot = adminId === 'adm_bot'

    // Jika diambil alih admin lain (bukan saya dan bukan dikembalikan ke bot)
    if (!isMe && !isToBot) {
      if (sidebarRef.value) {
        sidebarRef.value.removeRoomFromList(roomId)
      }
      // Jika sedang dibuka, tutup
      if (roomId === selectedRoomId.value) {
        handleClearRoom()
        handleTakeOver(true)
      }
    }

    // Jika room yang sedang dibuka dikembalikan ke bot, tutup room
    if (isToBot && roomId === selectedRoomId.value) {
      handleClearRoom()
      handleTakeOver(true)
    }

    // Refresh tab aktif secara silent agar list tetap sinkron
    if (sidebarRef.value) {
      sidebarRef.value.refreshChatList(undefined, true)
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
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      // Hanya hapus jika benar-benar ganti room
      chats.value = []
      fetchChatContent(newId)
    }
  },
  { immediate: true }
)

const handleUpdateChatStatus = (payload: { index: number; status: 'send' | 'failed' | 'pending'; id?: string }) => {
  if (chats.value[payload.index]) {
    chats.value[payload.index].Send_Status = payload.status
    if (payload.id) chats.value[payload.index].Message_Id = payload.id
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
            class="shrink-0 h-full"
            :activeRoomId="selectedRoomId || ''" 
            :usernameChange="selectedUsernameChange" 
            :activeTab="currentActiveTab"
            @selectChat="handleSelectChat" 
            @username="handleUsername" 
            @nama-display="handleNamaDisplay"
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
            :namaDisplay="selectedNamaDisplay"
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
