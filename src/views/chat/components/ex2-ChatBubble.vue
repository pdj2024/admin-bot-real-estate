<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Chat {
  Message_Id: string
  Room_Id: string
  Sender_Id: string
  Tipe_User: string
  Message: string
  Jenis_Pesan: string
  Id_Paket: string | null
  No_Pesanan: string | null
  Sent_At: Date | string
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

const isCustomer = computed(() => props.chat.Tipe_User === 'customer')

const bubbleStyle = computed(() => {
  switch (props.chat.Tipe_User) {
    case 'customer':
      return 'bg-bejo-100 border border-default-200 text-default-900 shadow-sm rounded-bl-none'
    case 'admin':
    case 'cs':
      return 'bg-emerald-50 text-default-900 shadow-sm rounded-br-none'
    case 'ai':
      return 'bg-white border border-amber-200 text-amber-900 shadow-sm rounded-br-none'
    default:
      return 'bg-default-100 text-default-700 rounded-br-none'
  }
})

const timeColor = computed(() => {
  if (props.chat.Tipe_User === 'ai') return 'text-amber-600/80'
  return 'text-default-400'
})

const isNewDate = computed(() => {
  if (props.idx === 0) return true
  
  const prevDate = new Date(props.chats[props.idx - 1].Sent_At).setHours(0, 0, 0, 0)
  const currDate = new Date(props.chat.Sent_At).setHours(0, 0, 0, 0)
  
  return prevDate !== currDate
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
  <div class="flex flex-col w-full">
    
    <div v-if="isNewDate" class="w-full my-6 flex items-center justify-center">
      <div class="flex-grow max-w-[40px] h-px bg-default-200"></div>
      <span class="mx-3 px-3 py-1 bg-white/80 backdrop-blur-sm border border-default-200 rounded-full text-default-500 text-[11px] font-medium shadow-sm">
        {{ getDateChat(chat.Sent_At) }}
      </span>
      <div class="flex-grow max-w-[40px] h-px bg-default-200"></div>
    </div>

    <div class="flex gap-2.5 w-full mt-2" :class="isCustomer ? 'justify-start' : 'justify-end'">
      
      <div v-if="isCustomer" class="flex items-end flex-shrink-0">
        <div class="relative flex items-center justify-center rounded-full size-8 bg-default-200 text-default-600 border border-white shadow-sm">
          <Icon icon="lucide:user" class="size-4" />
        </div>
      </div>

      <div class="flex flex-col gap-1 max-w-[85%] lg:max-w-[65%]" :class="isCustomer ? 'items-start' : 'items-end'">
        
        <div v-if="chat.Message" class="p-3.5 rounded-2xl text-sm relative" :class="bubbleStyle">
          
          <span class="break-words leading-relaxed" v-html="chat.Message"></span>

          <div v-if="chat.Tipe_User === 'ai'" class="mt-2 pt-2 border-t border-amber-200/60 flex items-center gap-1.5 text-[10px] font-medium text-amber-700">
            <Icon icon="lucide:bot" class="size-3.5" />
            Asisten AI Chat
          </div>

          <div class="flex justify-end items-center mt-1 gap-1 text-[10px] font-medium" :class="timeColor">
            {{ new Date(chat.Sent_At).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
            <Icon v-if="!isCustomer" icon="lucide:check-check" class="size-3" />
          </div>

        </div>
      </div>

      <div v-if="!isCustomer" class="flex items-end flex-shrink-0">
        
        <div v-if="chat.Tipe_User === 'admin' || chat.Tipe_User === 'cs'" class="relative flex items-center justify-center rounded-full size-8 bg-primary/10 text-primary border border-white shadow-sm">
          <Icon icon="lucide:headset" class="size-4" />
        </div>

        <div v-else-if="chat.Tipe_User === 'ai'" class="relative flex items-center justify-center rounded-full size-8 bg-amber-100 text-amber-600 border border-white shadow-sm font-bold text-[10px]">
          AI
        </div>

      </div>

    </div>
  </div>
</template>