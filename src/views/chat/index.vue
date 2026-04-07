<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import api from '@/services/axios'
import * as signalR from '@microsoft/signalr'

import Vertical from '@/layouts/vertical.vue'
import PageTitle from '@/components/PageTitle.vue'
import ChatContent from './components/ChatContent.vue'
import SideBar from './components/SideBar.vue'
import { type Catalogue, type CalendarEvent, type Appointment, type Chat, catalogueData, calendarEvents } from './components/data'

const selectedRoomId = ref<string | null>(null)
const selectedUsername = ref<string>('')
const selectedPhone = ref<string>('')
const currentActiveTab = ref<string>('untuk_saya')

const sidebarRef = ref<any>(null)
const chatContentRef = ref<any>(null)

const chats = ref<any[]>([])
const signalRConnection = ref<signalR.HubConnection | null>(null)

const handleSelectChat = async (id: string) => {
  if (selectedRoomId.value && signalRConnection.value?.state === signalR.HubConnectionState.Connected) {
    try {
      await signalRConnection.value.invoke('LeaveRoom', selectedRoomId.value)
    } catch (err) {
      console.warn(`[SignalR] Gagal keluar dari room lama ${selectedRoomId.value}:`, err)
    }
  }

  selectedRoomId.value = id

  if (signalRConnection.value?.state === signalR.HubConnectionState.Connected) {
    try {
      await signalRConnection.value.invoke('JoinRoom', id)
      console.log(`✅ [SignalR] Berhasil Join ke Room: ${id}`)
    } catch (err) {
      console.error(`❌ [SignalR] Gagal Join ke Room ${id}:`, err)
    }
  } else {
    console.warn('⚠️ [SignalR] Koneksi belum siap, gagal join room.')
  }
}

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

signalRConnection.value.on('ReceiveMessage', (data: any) => {

  console.log('📥 [SignalR] Data Diterima:', data);

  if (sidebarRef.value) sidebarRef.value.refreshChatList();

  if (String(data.roomId) === String(selectedRoomId.value)) {
    const myId = localStorage.getItem('no_id') || '';

    if (data.senderId === myId) {
      console.log('♻️ [SignalR] Update status pesan sendiri');
      const pendingChat = chats.value.find(
        (c) => c.Message === data.message && c.Send_Status === 'pending'
      );
      if (pendingChat) {
        pendingChat.Message_Id = data.messageId;
        pendingChat.Send_Status = 'send';
      }
      return;
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
    });

    console.log('✅ [SignalR] Berhasil push ke UI. Total chats:', chats.value.length);
  } else {
    console.warn(`🙈 [SignalR] Pesan diabaikan. Room: ${data.roomId} != Aktif: ${selectedRoomId.value}`);
  }
});

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

  } catch (err) {
    console.error('❌ [SignalR] Connection Error:', err)
  }
}

const fetchChatContent = async (id: string) => {
  try {
    const response = await api.get(`/api/chat/getAll?room_id=${id}`, {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    chats.value = response.data.Data
  } catch (error) {
    console.error('Gagal memuat chat:', error)
  }
}

watch(
  selectedRoomId,
  (newId) => {
    if (newId) {
      fetchChatContent(newId)
    } else {
      chats.value = []
    }
  },
  { immediate: true }
)

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

        <ChatContent ref="chatContentRef" :roomId="selectedRoomId" :username="selectedUsername" :phoneNumber="selectedPhone" :activeTab="currentActiveTab" :chats="chats" @chatTakeOver="handleTakeOver" @clearRoom="handleClearRoom" />
      </div>
    </div>
  </Vertical>
</template>
