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
  Media_Url?: string
  Username_User?: string
  Nama_Display_User?: string
}

const props = defineProps<{
  chat: Chat
  chats: Chat[]
  idx: number
  lastMessageId: string
  highlight?: string
  isActiveMatch?: boolean
  activeMatchIndex?: number
}>()

defineEmits(['imageLoaded'])

const isMe = computed(() => {
  const role = (props.chat.Tipe_User || '').toLowerCase()
  return role === 'admin' || role === 'ai' || role === 'cs'
})

const isCustomer = computed(() => !isMe.value)

const bubbleStyle = computed(() => {
  switch (props.chat.Tipe_User) {
    case 'customer':
      return 'bubble-customer bg-bejo-50 border border-slate-100 text-slate-800 shadow-sm rounded-2xl rounded-bl-none'
    case 'admin':
    case 'cs':
      return 'bubble-admin bg-bejo-100 text-slate-800 shadow-sm rounded-2xl rounded-br-none'
    case 'ai':
      return 'bubble-ai bg-white border border-amber-200 text-amber-900 shadow-xl shadow-amber-500/10 rounded-2xl rounded-br-none ring-1 ring-amber-100'
    default:
      return 'bubble-default bg-slate-100 text-slate-600 rounded-2xl rounded-bl-none'
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

const cleanMsg = computed(() => {
  const msg = props.chat.Message || ''
  return msg.includes('_data:image/') ? msg.split('_data:image/')[0] : msg
})

const formattedMsg = computed(() => {
  const msg = cleanMsg.value
  if (!msg) return ''

  let formatted = msg
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')

  if (props.highlight && props.highlight.trim()) {
    try {
      const escapedQuery = props.highlight.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`(${escapedQuery})`, 'gi')
      let matchCounter = 0
      formatted = formatted.replace(regex, (match) => {
        const currentMatchIdx = matchCounter++
        const isThisMatchActive = props.isActiveMatch && props.activeMatchIndex === currentMatchIdx
        const highlightClass = isThisMatchActive ? 'bg-bejo-300 text-white rounded-md px-1 font-bold shadow-md shadow-bejo-500/20 ring-2 ring-bejo-500 ring-offset-1 transform scale-110 inline-block' : 'bg-amber-200 text-slate-900 rounded-md px-1'
        const matchId = `match-${props.idx}-${currentMatchIdx}`
        return `<span id="${matchId}" class="${highlightClass}">${match}</span>`
      })
    } catch (e) {
      console.error('Highlight regex error:', e)
    }
  }
  return formatted
})

// === LOGIKA GAMBAR DIBUAT LEBIH BERSIH ===
const imageSource = computed(() => {
  if (imageUrl.value) return imageUrl.value
  if (props.chat.Media_Url) return props.chat.Media_Url
  const msg = props.chat.Message || ''
  if (msg.includes('_data:image/')) {
    return 'data:image/' + msg.split('_data:image/')[1]
  }
  return ''
})

const getMediaId = (paket?: string) => {
  if (!paket) return ''
  const parts = paket.split('_')
  if (parts.length <= 2) return parts[parts.length - 1]
  return parts.slice(2).join('_')
}

const getImageUrl = async (paket?: string) => {
  const id = getMediaId(paket)
  if (!id) return
  try {
    const { data } = await api.post('/api/mediacloud/read-url-batch', { ids: [id] }, { headers: { 'X-Jenis-User': 'admin' } })
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
watch(
  () => props.chat.No_Penawaran,
  (val) => {
    if (val) getImageUrl(val)
  },
  { immediate: true }
)

const showImagePreview = ref(false)
</script>

<template>
  <div class="flex flex-col w-full animate-fade-in-up">
    <!-- Image Preview Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="showImagePreview" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10" @click="showImagePreview = false">
          <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
          <div class="relative max-w-full max-h-full overflow-hidden rounded-2xl shadow-2xl animate-zoom-in" @click.stop>
            <button @click="showImagePreview = false" class="absolute top-4 right-4 size-10 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md flex items-center justify-center transition-all z-10">
              <Icon icon="lucide:x" class="size-6" />
            </button>
            <img :src="imageSource" class="max-w-full max-h-[90vh] object-contain shadow-2xl" />
          </div>
        </div>
      </Transition>
    </Teleport>
    <div v-if="isNewDate" class="w-full my-5 flex items-center justify-center sticky top-2 z-10">
      <span class="divider-tanggal px-4 py-1.5 bg-white/70 backdrop-blur-md border border-white/50 rounded-full text-slate-500 text-[10px] font-extrabold shadow-sm uppercase tracking-widest transition-colors">
        {{ getDateChat(chat.Sent_At) }}
      </span>
    </div>

    <div v-if="chat.Message && chat.Message.includes('_X7#mQ9!vW2_')" class="w-full my-6 flex justify-center px-4">
      <div class="flex flex-col items-center justify-center text-center px-6 py-2.5 bg-slate-50/80 backdrop-blur-md border border-slate-100 rounded-2xl shadow-sm max-w-[85%] transition-all hover:bg-white hover:shadow-md group">
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-70 group-hover:opacity-100 transition-opacity">
          {{ new Date(chat.Sent_At).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
        </span>
        <span class="text-[11px] font-black text-slate-600 leading-snug tracking-tight">
          {{ (chat.Message || '').replace('_X7#mQ9!vW2_', ' ') }}
        </span>
      </div>
    </div>

    <div v-if="!chat.Message || !chat.Message.includes('_X7#mQ9!vW2_')" class="flex gap-2 md:gap-4 w-full mt-2 group px-2 md:px-4" :class="isMe ? 'justify-end' : 'justify-start'">
      <div v-if="isCustomer" class="hidden md:flex items-end flex-shrink-0 mb-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
        <div class="avatar-customer relative flex items-center justify-center rounded-xl size-8 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 border-2 border-white shadow-sm">
          <Icon icon="lucide:user" class="size-4.5" />
        </div>
      </div>

      <div class="flex flex-col max-w-[85%] md:max-w-[70%]" :class="isMe ? 'items-end' : 'items-start'">
        <div class="px-3 py-1.5 md:px-4 md:py-2.5 rounded-2xl text-[13px] md:text-sm relative transition-all duration-300 hover:shadow-xl" :class="[bubbleStyle, isMe ? 'hover:translate-x-1' : 'hover:-translate-x-1']">
          <div v-if="imageSource" class="mb-3 overflow-hidden rounded-xl border border-black/5 shadow-inner bg-slate-50/50">
            <img :src="imageSource" @load="$emit('imageLoaded')" @click="showImagePreview = true" class="w-full h-auto object-cover max-h-72 hover:scale-105 transition-transform duration-500 cursor-pointer" />
          </div>

          <span v-if="chat.Message" class="block break-words leading-relaxed tracking-tight" v-html="formattedMsg"></span>

          <div v-if="chat.Tipe_User === 'admin' && chat.Sender_Id === 'adm_bot'" class="ai-indicator mt-3 pt-2 border-t border-amber-200/40 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-700">
            <div class="size-4 bg-amber-500 rounded-md flex items-center justify-center text-white">
              <Icon icon="lucide:bot" class="size-3" />
            </div>
            Asisten AI
          </div>

          <div class="flex justify-end items-center mt-2.5 gap-1.5 text-[9px] font-black uppercase tracking-widest opacity-70" :class="timeColor">
            {{ new Date(chat.Sent_At).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}

            <template v-if="!isCustomer">
              <Icon v-if="chat.Send_Status === 'pending'" icon="lucide:clock" class="size-3" />
              <Icon v-else-if="chat.Send_Status === 'failed'" icon="lucide:circle-alert" class="size-3 text-red-500" />
              <Icon v-else icon="lucide:check-check" class="size-3 text-default-600" />
            </template>
          </div>
        </div>
      </div>
      <div v-if="!isCustomer && !(chat.Message || '').includes('_X7#mQ9!vW2_')" class="hidden md:flex items-end self-end h-fit flex-shrink-0 mb-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 relative group/avatar z-[100]">
        <!-- Admin/AI Name Hover Modal -->
        <div class="absolute bottom-full right-0 mb-3 opacity-0 group-hover/avatar:opacity-100 pointer-events-none transition-all duration-300 transform group-hover/avatar:-translate-y-1 z-[110]">
          <div class="bg-white/90 backdrop-blur-xl border border-white shadow-2xl rounded-2xl p-4 min-w-[180px] shadow-bejo-500/10 scale-90 group-hover/avatar:scale-100 transition-transform origin-bottom-right">
            <div class="flex items-center gap-3 mb-2">
              <div v-once class="size-10 rounded-xl flex items-center justify-center text-white shadow-lg" :class="chat.Sender_Id === 'adm_bot' ? 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-amber-500/20' : 'bg-gradient-to-br from-cyan-400 to-cyan-500 shadow-cyan-500/20'">
                <Icon :icon="chat.Sender_Id === 'adm_bot' ? 'lucide:bot' : 'lucide:headset'" class="size-5" />
              </div>
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{{ chat.Sender_Id === 'adm_bot' ? 'AI Assistant' : 'Admin Agent' }}</p>
                <h5 class="text-xs font-black text-slate-800 leading-none">{{ chat.Sender_Id === 'adm_bot' ? 'Sistem' : 'Admin' }}</h5>
              </div>
            </div>
            <div class="flex items-center gap-1.5 pt-2 border-t border-slate-100">
              <span class="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span class="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Online & Aktif</span>
            </div>
            <!-- Arrow -->
            <div class="absolute -bottom-1.5 right-2.5 w-3 h-3 bg-white/90 border-r border-b border-white rotate-45"></div>
          </div>
        </div>

        <div v-if="chat.Tipe_User === 'admin' && chat.Sender_Id != 'adm_bot'" class="avatar-admin relative flex items-center justify-center rounded-xl size-8 bg-gradient-to-br from-cyan-400 to-cyan-500 text-white border-2 border-white shadow-lg shadow-cyan-500/20">
          <Icon icon="lucide:headset" class="size-4" />
        </div>
        <div v-else-if="chat.Tipe_User === 'admin' && chat.Sender_Id === 'adm_bot'" class="avatar-ai relative flex items-center justify-center rounded-xl size-8 bg-gradient-to-br from-amber-400 to-amber-500 text-white border-2 border-white shadow-lg shadow-amber-500/20 font-black text-[10px] tracking-tighter">AI</div>
      </div>
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
