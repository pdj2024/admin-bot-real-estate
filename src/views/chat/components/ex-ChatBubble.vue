<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'

const imageUrl = ref<string>('')

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
  lastMessageId: string
}>()

const isCustomer = computed(() => props.chat.Tipe_User === 'customer')

const bubbleStyle = computed(() => {
  switch (props.chat.Tipe_User) {
    case 'customer':
      return 'bubble-customer bg-bejo-100 border border-default-200 text-default-900 shadow-sm rounded-bl-none'
    case 'admin':
    case 'cs':
      return 'bubble-admin bg-amber-100 text-default-900 shadow-sm rounded-br-none'
    case 'ai':
      return 'bubble-ai bg-white border border-amber-200 text-amber-900 shadow-sm rounded-br-none'
    default:
      return 'bubble-default bg-default-100 text-default-700 rounded-br-none'
  }
})

const timeColor = computed(() => {
  if (props.chat.Tipe_User === 'ai') return 'time-color-ai text-amber-600/80'
  return 'time-color-default text-default-400'
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

const formatMessage = (msg: string) => {
  if (!msg) return ''

  return (
    msg
      // escape HTML
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

      // bold: *text*
      .replace(/\*(.*?)\*/g, '<strong>$1</strong>')

      // newline
      .replace(/\n/g, '<br>')
  )
}

const getMediaId = (paket?: string) => {
  return paket?.split('_').slice(2).join('_') || ''
}

const getImageUrl = async (paket?: string) => {
  const id = getMediaId(paket)
  if (!id) return

  try {
    const { data } = await api.post(
      '/api/mediacloud/read-url-batch',
      {
        ids: [id]
      },
      {
        headers: { 'X-Jenis-User': 'admin' }
      }
    )

    imageUrl.value = data?.success?.[id]?.Url || ''
  } catch (err: any) {
    console.error('ERROR:', err)
  }
}

watch(
  () => props.chat.Id_Paket,
  (val) => {
    if (val) getImageUrl(val)
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex flex-col w-full animate-fade-in-up">
    <div v-if="isNewDate" class="w-full my-5 flex items-center justify-center sticky top-2 z-10">
      <span class="divider-tanggal px-4 py-1.5 bg-white/70 backdrop-blur-md border border-white/50 rounded-full text-slate-500 text-[10px] font-extrabold shadow-sm uppercase tracking-widest transition-colors">
        {{ getDateChat(chat.Sent_At) }}
      </span>
    </div>

    <div v-if="chat.Message.includes('_X7#mQ9!vW2_')" class="w-full my-4 flex justify-center px-4">
      <div class="flex flex-col items-center justify-center text-center px-5 py-2 bg-slate-100/80 backdrop-blur-sm border border-slate-200/50 rounded-full shadow-sm max-w-[85%] sm:max-w-md transition-all hover:bg-white/90">
        <span class="text-[9px] font-bold text-slate-400 tracking-wider mb-0.5">
          {{ new Date(chat.Sent_At).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
        </span>
        <span class="text-[11px] font-bold text-slate-600 capitalize leading-snug">
          {{ (chat.Message || '').replace('_X7#mQ9!vW2_', ' ') }}
        </span>
      </div>
    </div>

    <div class="flex gap-3 w-full mt-1.5 group" :class="isCustomer ? 'justify-start' : 'justify-end'">
      <div v-if="isCustomer" class="flex items-end flex-shrink-0 mb-1 opacity-80 group-hover:opacity-100 transition-opacity">
        <div class="avatar-customer relative flex items-center justify-center rounded-full size-7 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 border border-white shadow-sm">
          <Icon icon="lucide:user" class="size-4" />
        </div>
      </div>

      <div class="flex flex-col max-w-[85%] lg:max-w-[70%]" :class="isCustomer ? 'items-start' : 'items-end'">
        <div v-if="!chat.Message.includes('_X7#mQ9!vW2_')" class="px-3.5 py-2.5 rounded-2xl text-sm relative transition-all hover:shadow-md max-w-xs" :class="bubbleStyle">
          <div v-if="chat.Id_Paket != null || chat.Message.includes('_data:image/')" class="mb-2 overflow-hidden rounded-xl border border-black/5">
            <img v-if="imageUrl || chat.Message.includes('_data:image/')" :src="chat.Message.includes('_data:image/') ? 'data:image/' + chat.Message.split('_data:image/')[1] : imageUrl" class="w-full h-auto object-cover max-h-64 hover:scale-105 transition-transform duration-300 cursor-pointer" />
          </div>

          <span v-if="chat.Message" class="block break-words leading-relaxed" v-html="formatMessage(chat.Message.includes('_data:image/') ? chat.Message.split('_data:image/')[0] : chat.Message)"></span>

          <div v-if="chat.Tipe_User === 'admin' && chat.Sender_Id === 'adm_bot'" class="ai-indicator mt-2 pt-1.5 border-t border-amber-200/60 flex items-center gap-1.5 text-[10px] font-semibold text-amber-700">
            <Icon icon="lucide:bot" class="size-3.5" />
            Asisten AI
          </div>

          <div class="flex justify-end items-center mt-1.5 gap-1 text-[9px] font-bold tracking-wide" :class="timeColor">
            {{ new Date(chat.Sent_At).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}

            <template v-if="!isCustomer">
              <Icon v-if="chat.Send_Status === 'pending'" icon="lucide:clock" class="size-3 opacity-70" />
              <Icon v-else-if="chat.Send_Status === 'failed'" icon="lucide:circle-alert" class="size-3 text-red-500" />
              <Icon v-else icon="lucide:check-check" class="size-3" />
            </template>
          </div>
        </div>
      </div>

      <div v-if="!isCustomer && !chat.Message.includes('_X7#mQ9!vW2_')" class="flex items-end flex-shrink-0 mb-1 opacity-80 group-hover:opacity-100 transition-opacity">
        <div v-if="chat.Tipe_User === 'admin' && chat.Sender_Id != 'adm_bot'" class="avatar-admin relative flex items-center justify-center rounded-full size-7 bg-gradient-to-br from-cyan-50 to-cyan-100 text-cyan-600 border border-white shadow-sm">
          <Icon icon="lucide:headset" class="size-3.5" />
        </div>
        <div v-else-if="chat.Tipe_User === 'admin' && chat.Sender_Id === 'adm_bot'" class="avatar-ai relative flex items-center justify-center rounded-full size-7 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 border border-white shadow-sm font-bold text-[9px]">AI</div>
      </div>
    </div>

    <div v-if="chat.Message_Id == props.lastMessageId" class="w-full my-6 flex items-center justify-center relative">
      <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-red-200/50 border-dashed"></div></div>
      <span class="relative px-4 py-1 bg-red-50 text-red-500 border border-red-100 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wider"> Pesan Belum Terbaca </span>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.animate-fade-in-up {
  animation: fadeInUp 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(15px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

:where([data-theme='dark']) .divider-tanggal {
  @apply bg-zinc-900/80 border-zinc-700 text-zinc-400;
}
:where([data-theme='dark']) .avatar-customer {
  @apply bg-zinc-800 text-zinc-400 border-zinc-900;
}
:where([data-theme='dark']) .avatar-admin {
  @apply bg-emerald-900/40 text-emerald-400 border-zinc-900;
}
:where([data-theme='dark']) .avatar-ai {
  @apply bg-amber-900/40 text-amber-400 border-zinc-900;
}
:where([data-theme='dark']) .bubble-customer {
  @apply bg-zinc-800 border-zinc-700 text-zinc-200 shadow-none;
}
:where([data-theme='dark']) .bubble-admin {
  @apply bg-emerald-900 text-emerald-50 border border-emerald-800/50 shadow-none;
}
:where([data-theme='dark']) .bubble-ai {
  @apply bg-zinc-900 border-amber-700/50 text-amber-100 shadow-none;
}
:where([data-theme='dark']) .bubble-default {
  @apply bg-zinc-800 text-zinc-300 shadow-none;
}
:where([data-theme='dark']) .ai-indicator {
  @apply border-amber-700/50 text-amber-400;
}
:where([data-theme='dark']) .time-color-ai {
  @apply text-amber-500/80;
}
:where([data-theme='dark']) .time-color-default {
  @apply text-zinc-400;
}
</style>
