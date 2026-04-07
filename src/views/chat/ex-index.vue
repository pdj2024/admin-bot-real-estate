<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as signalR from '@microsoft/signalr' // 1. Import SignalR
import Vertical from '@/layouts/vertical.vue'
import PageTitle from '@/components/PageTitle.vue'
import ChatContent from './components/ChatContent.vue'
import SideBar from './components/SideBar.vue'

const selectedRoomId = ref<string | null>(null)
const selectedUsername = ref<string>('')
const selectedPhone = ref<string>('')
const currentActiveTab = ref<string>('untuk_saya')

const sidebarRef = ref<any>(null)
const chatContentRef = ref<any>(null)

const signalRConnection = ref<signalR.HubConnection | null>(null)

// Mengubah menjadi async dan menambahkan fungsi Invoke JoinRoom
const handleSelectChat = async (id: string) => {
  // (Opsional) Keluar dari room sebelumnya agar tidak dobel menerima pesan dari room lama
  if (selectedRoomId.value && signalRConnection.value?.state === signalR.HubConnectionState.Connected) {
    try {
      await signalRConnection.value.invoke('LeaveRoom', selectedRoomId.value)
    } catch (err) {
      console.warn(`[SignalR] Gagal keluar dari room lama ${selectedRoomId.value}:`, err)
    }
  }

  // Set ID room yang baru dipilih
  selectedRoomId.value = id

  // Beritahu Server SignalR untuk Join ke Room yang baru
  if (signalRConnection.value?.state === signalR.HubConnectionState.Connected) {
    try {
      // Baris ini akan otomatis diubah SignalR menjadi format JSON yang kita pakai di Postman tadi
      await signalRConnection.value.invoke('JoinRoom', id)
      console.log(`✅ [SignalR] Berhasil Join ke Room: ${id}`)
    } catch (err) {
      console.error(`❌ [SignalR] Gagal Join ke Room ${id}:`, err)
    }
  } else {
    console.warn('⚠️ [SignalR] Koneksi belum siap, gagal join room.')
  }
}
// ------------------------------

const handleUsername = (name: string) => {
  selectedUsername.value = name
}
const handlePhone = (phone: string) => {
  selectedPhone.value = phone
}
const handleTabChange = (tab: string) => {
  currentActiveTab.value = tab
}

const handleClearRoom = () => {
  selectedRoomId.value = null
  selectedUsername.value = ''
  selectedPhone.value = ''
}

const handleTakeOver = () => {
  currentActiveTab.value = 'untuk_saya'
  if (sidebarRef.value) sidebarRef.value.forceRefreshToUntukSaya()
}

const startSignalR = async () => {
  const token = localStorage.getItem('token') || ''
  const role = localStorage.getItem('role_user') || 'admin'
  // Opsional: Jika Anda punya ID User di localstorage untuk JoinUserChannel seperti di Blazor
  // const userId = localStorage.getItem('userId') || ''

  const hubUrl = 'https://wabotapi.padajaya.biz.id/api/chathub'

  signalRConnection.value = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => token,
      headers: {
        'X-Jenis-User': role
      },
      transport: signalR.HttpTransportType.LongPolling
    })
    .withAutomaticReconnect()
    .build()

  signalRConnection.value.on('RoomCreated', (roomId, createdAt) => {
    console.log('🟢 [Event: RoomCreated]', roomId)
    if (sidebarRef.value) sidebarRef.value.refreshChatList()
  })

  // Catatan: Pastikan format parameter ini cocok dengan format yang dikirim backend Anda.
  // Jika backend mengirim Object DTO (seperti di Blazor), ini mungkin perlu diubah menjadi 1 parameter saja.
  signalRConnection.value.on('ReceiveMessage', (messageId, roomId, senderId, message, sentAt, editedAt, tipeUser, idPaket, status, jenisPesan, sendStatus) => {
    console.log('🔵 [Event: ReceiveMessage] Pesan masuk:', message)
    if (sidebarRef.value) sidebarRef.value.refreshChatList()

    if (chatContentRef.value) {
      chatContentRef.value.handleIncomingMessage(messageId, roomId, senderId, message, sentAt, editedAt, tipeUser, idPaket, status, jenisPesan, sendStatus)
    }
  })

  signalRConnection.value.on('ReceiveHandoverAlert', (payload, cancellationToken) => {
    console.log('🔴 [Event: ReceiveHandoverAlert]', payload)
    if (payload && payload.roomId === selectedRoomId.value) {
      handleClearRoom()
      handleTakeOver()
    }
  })

  try {
    await signalRConnection.value.start()
    console.log('✅ [SignalR] Connected via Index')

    // Jika backend butuh JoinUserChannel di awal (seperti di Blazor), aktifkan kode di bawah:
    // if (userId) {
    //   await signalRConnection.value.invoke('JoinUserChannel', userId)
    //   console.log('✅ [SignalR] Joined User Channel:', userId)
    // }

  } catch (err) {
    console.error('❌ [SignalR] Connection Error:', err)
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
    <PageTitle subtitle="Utama" title="Chat" />

    <div class="card overflow-hidden">
      <div class="flex h-[calc(100vh-180px)] min-h-[500px]">
        <SideBar ref="sidebarRef" :active-room-id="selectedRoomId" @select_chat="handleSelectChat" @username="handleUsername" @phone_number="handlePhone" @change_tab="handleTabChange" />

        <ChatContent ref="chatContentRef" :roomId="selectedRoomId" :username="selectedUsername" :phoneNumber="selectedPhone" :activeTab="currentActiveTab" @chatTakeOver="handleTakeOver" @clearRoom="handleClearRoom" />
      </div>
    </div>
  </Vertical>
</template>
