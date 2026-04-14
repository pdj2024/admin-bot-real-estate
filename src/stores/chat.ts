import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as signalR from '@microsoft/signalr'

export const useChatStore = defineStore('chat', () => {
  const signalRConnection = ref<signalR.HubConnection | null>(null)
  const roomIdsBot = ref<string[]>([])
  const roomIdsAktif = ref<string[]>([])
  const roomIdsAssign = ref<string[]>([])
  const chats = ref<any[]>([])
  const selectedRoomId = ref<string | null>(null)
  const isConnected = ref(false)

  const currentActiveTab = ref('chat_saya')

  async function initSignalR(options: { skipGlobal?: boolean } = {}) {
    if (signalRConnection.value) return

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

    // 1. Receive Message Listener
    signalRConnection.value.on('ReceiveMessage', (data: any) => {
      console.log('[SignalR] ReceiveMessage:', data)

      if (String(data.roomId) === String(selectedRoomId.value)) {
        const myId = localStorage.getItem('no_id') || ''

        // Update own message status
        if (data.senderId === myId) {
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
        
        const audio = new Audio('/sounds/Ding.mp3')
        audio.play().catch(() => {})
      }
    })

    // 2. Room Created Listener
    signalRConnection.value.on('RoomCreated', (roomId: string) => {
      console.log('🟢 [SignalR] RoomCreated:', roomId)
    })

    // 3. Handover Alert Listener
    signalRConnection.value.on('ReceiveHandoverAlert', (payload: any) => {
      console.log('[SignalR] ReceiveHandoverAlert:', payload)
      if (payload && payload.roomId === selectedRoomId.value) {
        // Handle logic if needed
      }
    })

    // Reconnection Logic
    signalRConnection.value.onreconnected(async () => {
      console.log('[SignalR] Reconnected. Re-joining channels...')
      if (!options.skipGlobal) {
        await joinUserChannel()
        await joinRooms(roomIdsBot.value, roomIdsAktif.value, roomIdsAssign.value)
      }
      if (selectedRoomId.value) {
        await joinRoom(selectedRoomId.value)
      }
    })

    try {
      await signalRConnection.value.start()
      isConnected.value = true
      console.log('[SignalR] Connected')
      
      if (!options.skipGlobal) {
        await joinUserChannel()
        await joinRooms(roomIdsBot.value, roomIdsAktif.value, roomIdsAssign.value)
      }
    } catch (err) {
      console.error('[SignalR] Connection Error:', err)
    }
  }

  async function joinUserChannel() {
    if (signalRConnection.value?.state === signalR.HubConnectionState.Connected) {
      const userId = localStorage.getItem('no_id')
      if (!userId) return
      try {
        await signalRConnection.value.invoke('JoinUserChannel', userId)
        console.log(`[SignalR] Joined User Channel: ${userId}`)
      } catch (err) {
        console.error(`[SignalR] JoinUserChannel Error:`, err)
      }
    }
  }

  async function joinRoom(roomId: string) {
    if (signalRConnection.value?.state === signalR.HubConnectionState.Connected) {
      try {
        await signalRConnection.value.invoke('JoinRoom', roomId)
        console.log(`[SignalR] Joined Room: ${roomId}`)
      } catch (err) {
        console.error(`[SignalR] JoinRoom Error:`, err)
      }
    }
  }

  async function joinRooms(bot: string[], aktif: string[], assign: string[]) {
    if (signalRConnection.value?.state !== signalR.HubConnectionState.Connected) return

    async function joinMultiple(ids: string[]) {
      if (!ids || ids.length === 0) return
      const promises = ids.map(id => signalRConnection.value!.invoke('JoinRoom', id))
      await Promise.allSettled(promises)
    }

    if (currentActiveTab.value === 'bot') {
      await joinMultiple(bot)
    } else {
      await joinMultiple([...aktif, ...assign])
    }
  }

  return {
    signalRConnection,
    roomIdsBot,
    roomIdsAktif,
    roomIdsAssign,
    chats,
    selectedRoomId,
    isConnected,
    currentActiveTab,
    initSignalR,
    joinUserChannel,
    joinRoom,
    joinRooms
  }
})
