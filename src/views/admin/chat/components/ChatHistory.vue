<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed, watch } from 'vue'
import simplebar from 'simplebar-vue'
import { Icon } from '@iconify/vue'
import ChatBubble from './ChatBubble.vue'
import api from '@/services/axios'
import { type Chat } from './data'

const props = defineProps<{
  chats: Chat[]
  isLoadingChat?: boolean
  lastMessageId: string
  highlight?: string
  activeSearchChatIndex?: number
  activeMatchIndex?: number
  activeTab?: string
  roomId: string | null
}>()

// const emit = defineEmits<{
//   (e: 'regenerateBrochure', chat: Chat): void
// }>()

const showScrollToBottom = ref(false)
const newMessagesCount = ref(0)
const scrollEl = ref<HTMLElement | null>(null)
const mediaUrlCache = ref<Record<string, string>>({})

const firstUnreadIndex = computed(() => {
  if (props.activeTab !== 'chat_saya') return -1
  return props.chats.findIndex((chat) => chat.Tipe_User === 'customer' && chat.Send_Status === 'delivered')
})

const getScrollElement = (): HTMLElement | null => {
  if (scrollEl.value) return scrollEl.value
  const el = document.querySelector('#chat-scroll-container .simplebar-content-wrapper')
  if (el) {
    scrollEl.value = el as HTMLElement
  }
  return scrollEl.value
}

const handleScroll = () => {
  const el = getScrollElement()
  if (!el) return
  const { scrollTop, scrollHeight, clientHeight } = el
  
  // Show button if user has scrolled up by more than 300px
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight
  showScrollToBottom.value = distanceFromBottom > 300

  // Reset new messages badge count when scrolled to the bottom
  if (!showScrollToBottom.value) {
    newMessagesCount.value = 0
  }
}

const initScrollListener = () => {
  nextTick(() => {
    setTimeout(() => {
      const el = getScrollElement()
      if (el) {
        el.removeEventListener('scroll', handleScroll)
        el.addEventListener('scroll', handleScroll)
        handleScroll()
      }
    }, 100)
  })
}

const scrollToBottom = async () => {
  await nextTick()
  const scroll = () => {
    const el = getScrollElement()
    if (el && typeof el.scrollTo === 'function') {
      el.scrollTo({ top: el.scrollHeight + 5000, behavior: 'auto' })
    }
  }

  // Double trigger to ensure we catch layout changes
  requestAnimationFrame(scroll)
  setTimeout(scroll, 50)
  setTimeout(scroll, 200) // Safety for slow image loads
}

const scrollToElement = (chatIndex: number) => {
  const chatElementId = `chat-message-${chatIndex}`
  const chatElement = document.getElementById(chatElementId)
  const el = getScrollElement()
  if (chatElement && el) {
    const containerHeight = el.clientHeight
    const elementTop = chatElement.offsetTop
    const scrollToPosition = elementTop - containerHeight / 2 + chatElement.clientHeight / 2
    el.scrollTo({ top: scrollToPosition, behavior: 'smooth' })
  }
}

// Helper to extract media ID from package/brochure field
const getMediaId = (paket?: string | null) => {
  if (!paket) return ''
  if (paket.startsWith('media_')) return paket
  const idx = paket.indexOf('media_')
  if (idx !== -1) {
    return paket.substring(idx)
  }
  return paket
}

// Batch resolver for brochure/package media URLs
const resolveMediaUrls = async (chatsList: Chat[]) => {
  if (!chatsList || chatsList.length === 0) return

  const mediaIds = new Set<string>()
  chatsList.forEach((chat) => {
    if (chat.Id_Paket) {
      const id = getMediaId(chat.Id_Paket)
      if (id && !mediaUrlCache.value[id]) {
        mediaIds.add(id)
      }
    }
    if (chat.No_Penawaran) {
      const id = getMediaId(chat.No_Penawaran)
      if (id && !mediaUrlCache.value[id]) {
        mediaIds.add(id)
      }
    }
  })

  const idsArray = Array.from(mediaIds)
  if (idsArray.length === 0) return

  try {
    const { data } = await api.post(
      '/api/mediacloud/read-url-batch',
      { ids: idsArray },
      { headers: { 'X-Jenis-User': 'admin' } }
    )

    if (data?.success) {
      Object.entries(data.success).forEach(([id, val]: any) => {
        if (val?.Url) {
          mediaUrlCache.value[id] = val.Url
        }
      })
    }
  } catch (err) {
    console.error('Failed to batch resolve media URLs:', err)
  }
}

const getResolvedImageUrl = (chat: Chat) => {
  if (chat.Media_Url) return chat.Media_Url
  
  // Inline Base64
  const msg = chat.Message || ''
  if (msg.includes('_data:image/')) {
    return 'data:image/' + msg.split('_data:image/')[1]
  }

  // GCS Cache
  if (chat.Id_Paket) {
    const id = getMediaId(chat.Id_Paket)
    if (mediaUrlCache.value[id]) return mediaUrlCache.value[id]
  }
  if (chat.No_Penawaran) {
    const id = getMediaId(chat.No_Penawaran)
    if (mediaUrlCache.value[id]) return mediaUrlCache.value[id]
  }

  return ''
}

// Watchers
watch(
  () => props.chats,
  (newChats) => {
    if (newChats && newChats.length > 0) {
      resolveMediaUrls(newChats)
    }
  },
  { immediate: true, deep: false }
)

watch(
  () => props.chats.length,
  (newLength, oldLength) => {
    if (newLength === 0) {
      newMessagesCount.value = 0
      showScrollToBottom.value = false
      return
    }

    if (!oldLength || oldLength === 0) {
      // Initial load: scroll to bottom, clear counts
      newMessagesCount.value = 0
      scrollToBottom()
      return
    }

    const lastChat = props.chats[newLength - 1]
    const myId = localStorage.getItem('no_id') || ''
    const isSentByMe = String(lastChat.Sender_Id) === String(myId)

    if (isSentByMe) {
      scrollToBottom()
      newMessagesCount.value = 0
    } else {
      if (showScrollToBottom.value) {
        newMessagesCount.value++
      } else {
        scrollToBottom()
        newMessagesCount.value = 0
      }
    }
  }
)

watch(
  () => props.roomId,
  () => {
    scrollEl.value = null
    showScrollToBottom.value = false
    newMessagesCount.value = 0
    initScrollListener()
  },
  { immediate: true }
)

onMounted(() => {
  initScrollListener()
})

onBeforeUnmount(() => {
  if (scrollEl.value) {
    scrollEl.value.removeEventListener('scroll', handleScroll)
  }
})

defineExpose({
  scrollToBottom,
  scrollToElement
})
</script>

<template>
  <div class="flex-grow min-h-0 relative overflow-hidden">
    <!-- Persistent Background Layer -->
    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-slate-100">
      <div class="absolute inset-0 bg-slate-100 backdrop-blur-none"></div>
    </div>

    <simplebar id="chat-scroll-container" class="h-full w-full relative z-10 bg-transparent">
      <div class="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/5 pointer-events-none"></div>

      <div v-if="isLoadingChat && chats.length === 0" class="relative z-10 flex flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
        <div v-for="n in 8" :key="n" class="flex w-full" :class="n % 2 === 0 ? 'justify-end' : 'justify-start'">
          <div class="flex flex-col gap-2" :class="n % 2 === 0 ? 'items-end' : 'items-start'" style="max-width: 65%">
            <div class="h-12 rounded-2xl bg-slate-200/60 animate-pulse border border-slate-100 shadow-sm" :style="{ width: 40 + ((n * 13) % 45) + '%', minWidth: '140px' }"></div>
            <div class="h-3 w-16 rounded-full bg-slate-100 animate-pulse"></div>
          </div>
        </div>
      </div>

      <div v-else class="relative z-10 flex flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6">
        <template v-for="(chat, i) in chats" :key="chat.Message_Id || i">
          <!-- Unread Messages Divider -->
          <div v-if="i === firstUnreadIndex" class="flex items-center justify-center my-6 relative py-2 px-10">
            <div class="absolute inset-x-0 h-px bg-bejo-200/50"></div>
            <div class="relative bg-bejo-50 text-bejo-600 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-bejo-100 shadow-sm">
              Pesan Belum Terbaca
            </div>
          </div>

          <ChatBubble
            :id="'chat-message-' + i"
            :idx="i"
            :chat="chat"
            :chats="chats"
            :lastMessageId="lastMessageId"
            :highlight="highlight"
            :isActiveMatch="i === activeSearchChatIndex"
            :activeMatchIndex="activeMatchIndex"
            :resolvedImageUrl="getResolvedImageUrl(chat)"
            @imageLoaded="scrollToBottom"
            @regenerateBrochure="$emit('regenerateBrochure', chat)"
          />
        </template>
      </div>
    </simplebar>

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-4 opacity-0 scale-95"
      enter-to-class="transform translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100 scale-100"
      leave-to-class="transform translate-y-4 opacity-0 scale-95"
    >
      <button
        v-if="showScrollToBottom"
        @click="scrollToBottom"
        class="absolute bottom-6 left-1/2 -translate-x-1/2 h-10 md:h-12 px-5 rounded-full bg-slate-400/50 backdrop-blur-md shadow-xl shadow-slate-900/10 border border-white/20 flex items-center gap-2 text-white hover:bg-slate-400/70 hover:scale-105 active:scale-95 transition-all z-50 group"
        title="Geser ke bawah"
      >
        <span class="text-xs md:text-sm font-black uppercase tracking-wider">Scroll</span>
        <Icon icon="lucide:chevron-down" class="size-4 md:size-5 group-hover:animate-bounce" />
        <div class="absolute inset-0 rounded-full bg-white/5 scale-0 group-hover:scale-100 transition-transform duration-500"></div>
        <!-- Badge count at top right corner -->
        <div
          v-if="newMessagesCount > 0"
          class="absolute -top-2.5 -right-2.5 bg-red-500 text-white text-[10px] font-black h-5 min-w-5 px-1 flex items-center justify-center rounded-full border-2 border-white shadow-lg animate-scale-in"
        >
          {{ newMessagesCount }}
        </div>
      </button>
    </Transition>
  </div>
</template>

<style scoped>
:deep(.simplebar-scrollbar::before) {
  background-color: var(--color-slate-400, #94a3b8) !important;
  opacity: 0.8 !important;
  border-radius: 10px !important;
  width: 6px !important;
  right: 2px !important;
}

:deep(.simplebar-track.simplebar-vertical) {
  width: 10px !important;
  background-color: transparent !important;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scale-in {
  animation: scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
</style>
