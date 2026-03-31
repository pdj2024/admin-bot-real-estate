<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Product {
  name: string
  image: string
  type: string
  buildingSize: number
  landSize: number
  floors: number
  price: string
  location: string
  bed: number
  bath: number
  car: number
}

interface Appointment {
  date: string
  time: string
  location: string
  customerName: string
  customerPhone: string
  salesName: string
  salesPhone: string
  image: string
  propertyName: string
  type: number
  buildingSize: number
  landSize: number
  floors: number
  carport: number
  bed: number
  bath: number
}

interface Chat {
  Message_Id: string
  Room_Id: string
  Sender_Id: string
  Tipe_User: string
  Message: string
  Jenis_Pesan: string
  Id_Paket: string | null
  No_Pesanan: string | null
  Sent_At: Date
  Edited_At?: Date | null
  User_Ids: string[]
  Room_Type: string
  Status: string
  Send_Status: string
  No_Penawaran: string
  Receiver_Ids: string[]
}

const props = defineProps<{
  chat: Chat
  chats: Chat[]
  idx: number
}>()

const bubbleColor = computed(() => {
  if (props.chat.Tipe_User === 'customer') return 'bg-bejo-300 text-default-900'
  if (props.chat.Tipe_User === 'admin') return 'bg-green-500 text-white'
  return 'bg-default-200 text-default-700'
})

const getDateChat = (date: any): string => {
  if (!date) return ''
  const d = new Date(date)

  const today = new Date().setHours(0, 0, 0, 0)
  const target = new Date(d).setHours(0, 0, 0, 0)

  const diffDays = Math.round((today - target) / 86400000)

  if (diffDays === 0) return 'Hari ini'
  if (diffDays === 1) return 'Kemarin'

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(d)
}
</script>

<template>
  <div v-if="idx == 0 || chats[idx - 1].Sent_At != chats[idx].Sent_At" class="w-full my-3 flex items-center">
    <div class="flex-grow h-px bg-default-300 shadow-[0_1px_3px_rgba(0,0,0,0.2)]"></div>
    <span class="flex-shrink mx-4 text-default-400 text-sm font-medium"> {{ getDateChat(chat.Sent_At) }} </span>
    <div class="flex-grow h-px bg-default-300 shadow-[0_1px_3px_rgba(0,0,0,0.2)]"></div>
  </div>
  <!-- ------ -->
  <div class="flex gap-3 justify-end">
    <div class="max-w-[380px] flex flex-col gap-2" :class="chat.Tipe_User === 'customer' ? 'items-start' : 'items-end'">
      <div v-if="chat.Message" class="p-3 rounded-xl text-sm min-w-25" :class="bubbleColor">
        <span v-html="chat.Message"></span>
        <span class="text-default-900 text-xs">
          <br /><br />
          <div class="border-t border-default-300"></div>
          Dikirim oleh Asisten AI Chat
        </span>
        <p class="text-xs text-end" :class="chat.Tipe_User === 'ai' ? 'text-default-400' : 'text-default-600 mt-2'">
          {{ new Date(chat.Sent_At).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
        </p>
      </div>
    </div>

    <div class="flex items-end">
      <div class="relative flex items-center justify-center font-semibold rounded-full size-9 bg-default-200">AI</div>
    </div>
  </div>
  <!-- ------ -->
  <div class="flex gap-3 justify-end">
    <div class="max-w-[380px] flex flex-col gap-2" :class="chat.Tipe_User === 'customer' ? 'items-start' : 'items-end'">
      <div v-if="chat.Message" class="p-3 rounded-xl text-sm min-w-25" :class="bubbleColor">
        <span v-html="chat.Message"></span>
        <p class="text-xs text-end" :class="chat.Tipe_User === 'ai' ? 'text-default-400' : 'text-default-600 mt-2'">
          {{ new Date(chat.Sent_At).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
        </p>
      </div>
    </div>

    <div class="flex items-end">
      <div class="relative flex items-center justify-center rounded-full size-9 bg-default-200">
        <Icon icon="lucide:headset" class="size-5 text-default-500" />
      </div>
    </div>
  </div>
  <!-- ------ -->
  <div class="flex gap-3" :class="chat.Tipe_User === 'customer' ? 'justify-start' : 'justify-end'">
    <div v-if="chat.Tipe_User === 'customer'" class="flex items-end">
      <div class="relative flex items-center justify-center rounded-full size-9 bg-default-200">
        <Icon icon="lucide:user" class="size-5 text-default-500" />
      </div>
    </div>

    <div class="max-w-[380px] flex flex-col gap-2" :class="chat.Tipe_User === 'customer' ? 'items-start' : 'items-end'">
      <div v-if="chat.Message" class="p-3 rounded-xl text-sm min-w-25" :class="bubbleColor">
        <span v-html="chat.Message"></span>
        <span v-if="chat.Tipe_User === 'ai'" class="text-default-400 text-xs">
          <br /><br />
          <div class="border-t border-default-300"></div>
          Dikirim oleh Asisten AI Chat
        </span>
        <p class="text-xs text-end" :class="chat.Tipe_User === 'ai' ? 'text-default-400' : 'text-default-600 mt-2'">
          {{ new Date(chat.Sent_At).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
        </p>
      </div>
    </div>

    <div v-if="chat.Tipe_User != 'customer'" class="flex items-end">
      <div v-if="chat.Tipe_User === 'ai'" class="relative flex items-center justify-center font-semibold rounded-full size-9 bg-default-200">AI</div>

      <div v-if="chat.Tipe_User === 'cs'" class="relative flex items-center justify-center rounded-full size-9 bg-default-200">
        <Icon icon="lucide:headset" class="size-5 text-default-500" />
      </div>
    </div>
  </div>
</template>
