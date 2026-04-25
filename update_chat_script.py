import re

file_path = 'src/views/admin/chat/components/ChatContent.vue'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_script_top = """<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed, watch, defineAsyncComponent } from 'vue'
import { Icon } from '@iconify/vue'
import { fail } from '@/utils/sweet-alert'
import api from '@/services/axios'
import ChatBubble from './ChatBubble.vue'
import bgChat from '@/assets/images/background-chat.png'
import bgChatDark from '@/assets/images/background-chat-dark.png'
import simplebar from 'simplebar-vue'
import { type Chat, type PreviewImage, commonEmojis } from './data'
import { type TakeOverPayload } from './SideBar.vue'

import { useChatProducts } from '@/composables/admin/useChatProducts'
import { useChatTransfer } from '@/composables/admin/useChatTransfer'
import { useChatAppointments } from '@/composables/admin/useChatAppointments'

const PanelEtalase = defineAsyncComponent(() => import('./panels/PanelEtalase.vue'))
const PanelTukarCS = defineAsyncComponent(() => import('./panels/PanelTukarCS.vue'))
const PanelAppointment = defineAsyncComponent(() => import('./panels/PanelAppointment.vue'))
const Filter = defineAsyncComponent(() => import('./Filter.vue'))

const etalaseRef = ref<HTMLElement | null>(null)
const tukarCSRef = ref<HTMLElement | null>(null)
const filterRef = ref<any | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const chatContainer = ref<any>(null)
const searchHeaderRef = ref<HTMLElement | null>(null)
const showScrollToBottom = ref(false)

const openMenu = ref(false)
const openEtalase = ref(false)
const openAppointment = ref(false)
const openTukarCS = ref(false)
const openFilter = ref(false)

const isMobile = ref(false)
const changeUsername = ref(false)
const sendChatContent = ref('')
const isSendingImage = ref(false)

const chatInputRef = ref<HTMLTextAreaElement | null>(null)
const isSearchingChat = ref(false)
const searchChatQuery = ref('')
const searchChatResults = ref<{ chatIndex: number; matchIndex: number }[]>([])
const currentSearchMatch = ref(-1)
const searchChatInputRef = ref<HTMLInputElement | null>(null)
const showEmojiPicker = ref(false)

const addEmoji = (emoji: string) => {
  sendChatContent.value += emoji
  chatInputRef.value?.focus()
}

const username = defineModel<string>('username')
const bgLightUrl = `url(${bgChat})`
const bgDarkUrl = `url(${bgChatDark})`

const isPreviewMode = computed(() => previewImages.value.length > 0)
const activeSearchChatIndex = computed(() => {
  if (currentSearchMatch.value === -1 || searchChatResults.value.length === 0) return -1
  return searchChatResults.value[currentSearchMatch.value].chatIndex
})
const activeSearchMatchIndex = computed(() => {
  if (currentSearchMatch.value === -1 || searchChatResults.value.length === 0) return -1
  return searchChatResults.value[currentSearchMatch.value].matchIndex
})
const isPreviewOpen = ref(false)
const previewImages = ref<PreviewImage[]>([])
const activeIndex = ref(0)
const activeImage = computed(() => previewImages.value[activeIndex.value])
const addMoreInput = ref<HTMLInputElement | null>(null)

const props = defineProps<{
  roomId: string | null
  idLawan: string
  phoneNumber: string
  activeTab: string
  chats: Chat[]
  lastMessageId: string
  takeOverBatch: TakeOverPayload[]
  isLoadingChat?: boolean
  isDark?: boolean
}>()

const emit = defineEmits<{
  (e: 'chatTakeOver'): void
  (e: 'clearRoom'): void
  (e: 'usernameChange', value: string): void
  (e: 'takeOverStatus', value: string[]): void
  (e: 'addChat', value: Chat): void
  (e: 'updateChatStatus', value: { index: number; status: 'send' | 'failed' | 'pending' }): void
}>()

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node

  if (isSearchingChat.value && searchHeaderRef.value && !searchHeaderRef.value.contains(target)) {
    const isSearchToggle = (target as HTMLElement).closest('button[title="Cari dalam obrolan"]')
    if (!isSearchToggle) toggleSearchChat()
  }

  const interactiveRefs = [containerRef.value, etalaseRef.value, tukarCSRef.value, filterRef.value?.$el, searchHeaderRef.value]

  const isClickInside = interactiveRefs.some((ref) => {
    if (!ref) return false
    return ref.contains(target)
  })

  const isFilterTrigger = (target as HTMLElement).closest('.btn-trigger-filter')
  const isDatePicker = (target as HTMLElement).closest('.dp__menu') || (target as HTMLElement).closest('.dp__outer_menu_wrap')
  const isSweetAlert = (target as HTMLElement).closest('.swal2-container')

  if (!isClickInside && !isFilterTrigger && !isDatePicker && !isSweetAlert) {
    openMenu.value = false
    showEmojiPicker.value = false

    if (openFilter.value) {
      openFilter.value = false
      return
    }

    if (openAppointment.value) openAppointment.value = false
    if (openEtalase.value && !isSendingImage.value) openEtalase.value = false
    if (openTukarCS.value) openTukarCS.value = false
  }
}

const toggleSearchChat = () => {
  isSearchingChat.value = !isSearchingChat.value
  if (!isSearchingChat.value) {
    searchChatQuery.value = ''
    searchChatResults.value = []
    currentSearchMatch.value = -1
  } else {
    nextTick(() => searchChatInputRef.value?.focus())
  }
}

const handleSearchChat = () => {
  if (!searchChatQuery.value.trim() || searchChatQuery.value.length < 2) {
    searchChatResults.value = []
    currentSearchMatch.value = -1
    return
  }

  const results: { chatIndex: number; matchIndex: number }[] = []
  const query = searchChatQuery.value.toLowerCase()

  props.chats.forEach((chat, chatIndex) => {
    if (chat.Message && chat.Jenis_Pesan === 'text') {
      const matchIndex = chat.Message.toLowerCase().indexOf(query)
      if (matchIndex !== -1) results.push({ chatIndex, matchIndex })
    }
  })

  searchChatResults.value = results
  if (results.length > 0) {
    currentSearchMatch.value = results.length - 1
    scrollToSearchMatch()
  } else currentSearchMatch.value = -1
}

const scrollToSearchMatch = () => {
  if (searchChatResults.value.length === 0 || currentSearchMatch.value === -1) return
  nextTick(() => {
    const chatIndex = searchChatResults.value[currentSearchMatch.value].chatIndex
    const chatElementId = `chat-message-${chatIndex}`
    const chatElement = document.getElementById(chatElementId)

    if (chatElement && cachedScrollEl) {
      const containerHeight = (cachedScrollEl as HTMLElement).clientHeight
      const elementTop = chatElement.offsetTop
      const scrollToPosition = elementTop - containerHeight / 2 + chatElement.clientHeight / 2
      if (typeof (cachedScrollEl as HTMLElement).scrollTo === 'function') {
        ;(cachedScrollEl as HTMLElement).scrollTo({ top: scrollToPosition, behavior: 'smooth' })
      }
    }
  })
}

const nextSearchMatch = () => {
  if (searchChatResults.value.length > 0) {
    currentSearchMatch.value = (currentSearchMatch.value + 1) % searchChatResults.value.length
    scrollToSearchMatch()
  }
}

const prevSearchMatch = () => {
  if (searchChatResults.value.length > 0) {
    currentSearchMatch.value = (currentSearchMatch.value - 1 + searchChatResults.value.length) % searchChatResults.value.length
    scrollToSearchMatch()
  }
}

const { 
  products, isLoadingProducts, searchKatalog, debouncedSearchKatalog, 
  filteredProducts, activeExpandedProductId, fetchProducts, sendProduct 
} = useChatProducts(props, (...args: any[]) => sendChat(...args as any))

const { 
  showAppointmentModal, appointmentStage, appointmentForm, 
  appointmentCalendarOptions, bookedDates, handleSelectUnitForAppointment, saveNewAppointment 
} = useChatAppointments(props, (...args: any[]) => sendChat(...args as any))

const { 
  adminsList, searchCS, isFetchingAdmins, filteredAdmins, fetchAdmins, handleTransferChat 
} = useChatTransfer(props, emit, (...args: any[]) => sendChat(...args as any))

watch(openEtalase, (n) => {
  if (n) {
    if (products.value.length === 0) fetchProducts()
    searchKatalog.value = ''
  }
})

watch(openTukarCS, (n) => {
  if (n) {
    fetchAdmins()
    searchCS.value = ''
  }
})

const handleOpenAppointment = () => {
  appointmentForm.value = { namaLengkap: '', noTelp: '', lokasi: '', catatan: '', tanggal: '', waktu: '', properti: '', unitId: '', mediaId: '', mediaUrl: '' }
  appointmentStage.value = 1
  showAppointmentModal.value = true
  fetchProducts()
  openMenu.value = false
}

const handleOpenEtalase = () => {
  openEtalase.value = true
  openMenu.value = false
}

const handleOpenTukarCS = () => {
  openTukarCS.value = true
  openMenu.value = false
}

const closeEtalase = () => {
  openEtalase.value = false
  openAppointment.value = false
  searchKatalog.value = ''
}

const endChat = () => takeOverChat(true)
"""

pattern = re.compile(r'<script setup lang="ts">.*?const endChat = \(\) => takeOverChat\(true\)', re.DOTALL)
new_content = pattern.sub(new_script_top.replace('\\', '\\\\'), content, count=1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated script block successfully")
