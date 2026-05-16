<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed, watch, defineAsyncComponent } from 'vue'
import { Icon } from '@iconify/vue'
import { success, fail } from '@/utils/sweet-alert'
import Swal from 'sweetalert2'
import { jsPDF } from 'jspdf'
import api from '@/services/axios'
import ChatBubble from './ChatBubble.vue'
import bgChat from '@/assets/images/background-chat.png'
import bgChatDark from '@/assets/images/background-chat-dark.png'
import simplebar from 'simplebar-vue'
import { type Chat, type PreviewImage, commonEmojis } from './data'
import { type TakeOverPayload } from './SideBar.vue'
import { PROVINCES } from '@/utils/regions'
import { useSettings } from '@/stores/settings'

import { useChatProducts } from '@/composables/admin/useChatProducts'
import { useChatTransfer } from '@/composables/admin/useChatTransfer'
import { useChatAppointments } from '@/composables/admin/useChatAppointments'

const PanelEtalase = defineAsyncComponent(() => import('./panels/PanelEtalase.vue'))
const PanelTukarCS = defineAsyncComponent(() => import('./panels/PanelTukarCS.vue'))
const PanelAppointment = defineAsyncComponent(() => import('./panels/PanelAppointment.vue'))

// Shared across instances to prevent duplicate processing during remounts
const globalProcessingRooms = new Set<string>()

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
const openBrochureSelection = ref(false)
const brochureProductData = ref<any>(null)
const brochureCaption = ref('')
const showBrochureCaptionModal = ref(false)
const isSendingBrochure = ref(false)
const isTakingOver = ref(false)
const isProcessingBatch = ref(false)
const settingsStore = useSettings()

const addEmoji = (emoji: string) => {
  sendChatContent.value += emoji
  chatInputRef.value?.focus()
}



const getBase64ImageFromUrl = async (imageUrl: string, maxWidth = 1024, format = 'image/jpeg'): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (maxWidth / width) * height
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(null)
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL(format, format === 'image/jpeg' ? 0.8 : undefined))
    }
    img.onerror = () => {
      resolve(null)
    }
    img.src = imageUrl
  })
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

const firstUnreadIndex = computed(() => {
  if (props.activeTab !== 'chat_saya') return -1
  return props.chats.findIndex((chat) => chat.Tipe_User === 'customer' && chat.Send_Status === 'delivered')
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
  namaDisplay?: string
  activeTab: string
  chats: Chat[]
  lastMessageId: string
  takeOverBatch: TakeOverPayload[]
  isLoadingChat?: boolean
  isDark?: boolean
  isTakenOver?: boolean
  statusBot?: string
}>()

const emit = defineEmits<{
  (e: 'chatTakeOver', status: boolean): void
  (e: 'clearRoom'): void
  (e: 'usernameChange', value: string): void
  (e: 'takeOverStatus', value: string[]): void
  (e: 'addChat', value: Chat): void
  (e: 'updateChatStatus', value: { index: number; status: 'send' | 'failed' | 'pending'; id?: string }): void
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

const { products, isLoadingProducts, searchKatalog, filteredProducts, activeExpandedProductId, fetchProducts, sendProduct, facilitiesFilter, regionFilter, priceRangeFilter, transactionTypeFilter, typeFilter } = useChatProducts(props, (t: string, u?: string, r?: string, p?: string, id?: string, url?: string, user?: string) => sendChat(t, u, r, p, id, url, user))

const { showAppointmentModal, appointmentStage, appointmentForm, appointmentCalendarOptions, handleSelectUnitForAppointment, saveNewAppointment, isLoadingAppointments } = useChatAppointments(props, (t: string, u?: string, r?: string, p?: string, id?: string, url?: string, user?: string) => sendChat(t, u, r, p, id, url, user))

const { searchCS, isFetchingAdmins, filteredAdmins, fetchAdmins, handleTransferChat } = useChatTransfer(props, emit, (t: string, u?: string, r?: string, p?: string, id?: string, url?: string, user?: string) => sendChat(t, u, r, p, id, url, user))

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
  appointmentForm.value = { namaLengkap: username.value || '', noTelp: props.phoneNumber, lokasi: '', catatan: '', tanggal: '', waktu: '', properti: '', unitId: '', mediaId: '', mediaUrl: '', Room_Id: props.roomId }
  appointmentStage.value = 1
  openAppointment.value = true
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
  openBrochureSelection.value = false
  searchKatalog.value = ''
}

const handleOpenBrochureSelection = () => {
  openBrochureSelection.value = true
  openMenu.value = false
  fetchProducts()
}

const handleSelectUnitForBrochure = (product: any) => {
  brochureProductData.value = product
  brochureCaption.value = `Halo *${username.value || props.phoneNumber}*,\n\nBerikut adalah brosur digital untuk unit *${product.Nama_Produk}*.\n\nSilakan dipelajari detailnya, jika ada pertanyaan jangan ragu untuk bertanya ya!`
  showBrochureCaptionModal.value = true
  openBrochureSelection.value = false
}

const formatPrice = (price: number) => {
  if (!price) return 'N/A'
  if (price >= 1000000000) return (price / 1000000000).toFixed(1).replace('.0', '') + ' M'
  if (price >= 1000000) return (price / 1000000).toFixed(1).replace('.0', '') + ' Jt'
  if (price >= 1000) return (price / 1000).toFixed(1).replace('.0', '') + ' Rb'
  return price.toString()
}

const generateBrochure = async (product: any) => {
  const doc = new jsPDF({
    orientation: 'l',
    unit: 'mm',
    format: 'a4',
    compress: true
  })
  const width = 297
  const height = 210

  const primaryColor = '#EB701F'
  const darkOrange = '#c2410c'
  const slateColor = '#0f172a'

  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, width, height, 'F')

  const validMedia = (product.MediaUrls || []).filter((m: any) => {
    const url = (m.ThumbUrl || m.Id_Media || '').toLowerCase()
    return !url.endsWith('.mp4') && !url.endsWith('.mov') && !url.endsWith('.avi')
  })

  const mediaToFetch = validMedia.map((m: any) => m.ThumbUrl || m.Id_Media).filter((src: string) => src && !src.startsWith('http') && !src.startsWith('data:'))
  let resolvedUrls: Record<string, string> = {}

  if (mediaToFetch.length > 0) {
    try {
      const { data } = await api.post('/api/mediacloud/read-url-batch', { ids: mediaToFetch }, { headers: { 'X-Jenis-User': 'admin' } })
      resolvedUrls = Object.entries(data?.success || {}).reduce((acc: any, [id, val]: any) => {
        acc[id] = val.Url
        return acc
      }, {})
    } catch {
      //
    }
  }

  const images = []
  for (let i = 0; i < Math.min(validMedia.length, 3); i++) {
    const src = validMedia[i].ThumbUrl || validMedia[i].Id_Media
    const url = resolvedUrls[src] || src
    const img = await getBase64ImageFromUrl(url)
    if (img) images.push(img)
  }

  let logoBase64 = null
  const logoSrc = (settingsStore.business.Logo_Company || settingsStore.business.Id_Logo_Company) as string
  if (logoSrc) {
    let logoUrl = logoSrc
    if (!logoSrc.startsWith('http') && !logoSrc.startsWith('data:')) {
      try {
        const { data } = await api.post('/api/mediacloud/read-url-batch', { ids: [logoSrc] }, { headers: { 'X-Jenis-User': 'admin' } })
        logoUrl = data?.success?.[logoSrc]?.Url || logoSrc
      } catch {}
    }
    logoBase64 = await getBase64ImageFromUrl(logoUrl, 1024, 'image/png')
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`http://localhost:5000/properti/${product.Slug}`)}`
  const qrBase64 = await getBase64ImageFromUrl(qrUrl)

  const drawDots = (x: number, y: number, rows: number, cols: number) => {
    doc.setFillColor(226, 232, 240)
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        doc.circle(x + j * 3.5, y + i * 3.5, 0.6, 'F')
      }
    }
  }

  const col1X = 15
  const col2X = 110
  const col3X = 215

  doc.setFillColor(primaryColor)
  doc.roundedRect(-10, -10, 50, 50, 10, 10, 'F')
  if (logoBase64) {
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(3, 3, 29, 29, 4, 4, 'F')
    doc.addImage(logoBase64 as string, 'PNG', 5, 5, 25, 25)
  }

  // RENDER SECOND IMAGE FIRST! This prevents its white mask from drawing over the text
  const centerX = col2X + 35
  const centerY = 58
  const rad = 35

  drawDots(col2X + 15, 12, 5, 8)

  if (images[1]) {
    doc.addImage(images[1] as string, 'JPEG', centerX - rad, centerY - rad, rad * 2, rad * 2, undefined, 'FAST')
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(25)
    doc.circle(centerX, centerY, rad + 12, 'S')
    doc.setDrawColor(primaryColor)
    doc.setLineWidth(1.5)
    doc.circle(centerX, centerY, rad + 1, 'S')
    doc.setLineWidth(0.8)
    doc.circle(centerX, centerY, rad + 5, 'S')
  }

  doc.setFont('helvetica', 'bold')
  const maxTitleWidth = 90
  let titleFontSize = 26
  doc.setFontSize(titleFontSize)
  const propName = (product.Nama_Produk || 'Properti').toUpperCase()
  let tLines = doc.splitTextToSize(propName, maxTitleWidth)

  if (tLines.length > 2) {
    titleFontSize = 20
    doc.setFontSize(titleFontSize)
    tLines = doc.splitTextToSize(propName, maxTitleWidth)
  }
  if (tLines.length > 3) {
    titleFontSize = 16
    doc.setFontSize(titleFontSize)
    tLines = doc.splitTextToSize(propName, maxTitleWidth)
  }
  if (tLines.length > 4) {
    titleFontSize = 14
    doc.setFontSize(titleFontSize)
    tLines = doc.splitTextToSize(propName, maxTitleWidth)
  }
  if (tLines.length > 5) {
    tLines = tLines.slice(0, 5)
  }

  // Draw Title line by line for maximum reliability
  doc.setTextColor(slateColor)
  let currentTitleY = 55
  const titleLineStep = (titleFontSize * 0.35) + 2
  tLines.forEach((line: string) => {
    doc.text(line, col1X, currentTitleY)
    currentTitleY += titleLineStep
  })

  const subTitleY = currentTitleY + 2

  doc.setFontSize(10)
  doc.setTextColor(primaryColor)
  doc.text(`Tawaran Eksklusif dari ${settingsStore.business.appName}`, col1X, subTitleY)

  const spY = Math.max(80, subTitleY + 12)
  doc.setFillColor(darkOrange)
  doc.roundedRect(col1X, spY, 65, 10, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8.5)
  doc.text('MENGAPA MEMILIH KAMI?', col1X + 32.5, spY + 6.5, { align: 'center' })

  doc.setTextColor(slateColor)
  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'normal')
  let aY = spY + 16
  const pts = product.Akses_Jalan || ['Lokasi strategis Surabaya', 'Desain arsitektur modern', 'Fasilitas premium lengkap', 'Nilai investasi tinggi']
  pts.slice(0, 4).forEach((p: string) => {
    doc.setDrawColor(primaryColor)
    doc.setLineWidth(0.5)
    doc.circle(col1X + 4, aY - 1.5, 2.5, 'S')
    doc.line(col1X + 3, aY - 1.5, col1X + 3.8, aY - 0.5)
    doc.line(col1X + 3.8, aY - 0.5, col1X + 5.5, aY - 2.5)
    const pLines = doc.splitTextToSize(p, 72)
    doc.text(pLines, col1X + 10, aY)
    aY += (pLines.length * 4) + 4
  })

  if (images[0]) {
    const imgY = Math.max(135, aY + 3)
    try {
      doc.addImage(images[0] as string, 'JPEG', col1X, imgY, 80, 50, undefined, 'FAST')
    } catch {
      // Fallback
    }
    
    // Cross-compatible mask: Draw a thick white rounded rectangle to hide sharp image corners
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(4)
    doc.roundedRect(col1X, imgY, 80, 50, 4, 4, 'S')
    
    // Draw the actual thin orange border inside the masked area
    doc.setDrawColor(primaryColor)
    doc.setLineWidth(1)
    doc.roundedRect(col1X, imgY, 80, 50, 4, 4, 'S')
  }

  const fY = 115
  doc.setFillColor(primaryColor)
  doc.roundedRect(col2X + 5, fY, 60, 10, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('FASILITAS LENGKAP', col2X + 35, fY + 6.5, { align: 'center' })

  const details = [
    { label: 'Tipe', value: product.Tipe || '-' },
    { label: 'Lantai', value: product.Lantai || '-' },
    { label: 'Kamar Tidur', value: product.Jumlah_Kamar_Tidur || '-' },
    { label: 'Kamar Mandi', value: product.Jumlah_Kamar_Mandi || '-' },
    { label: 'Carport', value: product.Jumlah_Carpot || '-' },
    { label: 'Listrik', value: product.Daya_Listrik ? `${product.Daya_Listrik} VA` : '-' }
  ].filter(d => !(d.label === 'Lantai' && (d.value === '-' || !d.value)))

  doc.setTextColor(slateColor)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  details.forEach((item, index) => {
    const isRight = index % 2 === 1
    const x = isRight ? col2X + 40 : col2X + 2
    const y = 135 + Math.floor(index / 2) * 10
    
    doc.setFillColor(darkOrange)
    doc.circle(x - 1, y - 1, 1, 'F')
    doc.text(`${item.label}: ${item.value}`, x + 2, y)
  })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('HUNIAN MODERN & STRATEGIS', col2X + 35, 178, { align: 'center' })
  
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8.5)
  doc.setTextColor(primaryColor)
  doc.text('Investasi terbaik di lokasi strategis', col2X + 35, 182, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(slateColor)
  doc.text(product.Keterangan || 'Unit premium dengan privasi maksimal sekaligus pemandangan kota terbaik.', col2X, 187, { maxWidth: 70, align: 'justify', lineHeightFactor: 1.5 })

  doc.setFillColor(darkOrange)
  doc.roundedRect(col3X + 10, 30, 45, 9, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.text('PENAWARAN TERBATAS', col3X + 32.5, 36, { align: 'center' })

  let pY = 48
  const hasJual = product.Harga_Jual1 > 0 || product.Harga_Jual2 > 0
  const hasSewa = product.Harga_Sewa1 > 0 || product.Harga_Sewa2 > 0
  const isBoth = hasJual && hasSewa

  const drawPriceBlock = (label: string, oldP: number, newP: number, isSewa: boolean) => {
    doc.setFontSize(isBoth ? 8 : 9.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(slateColor)
    doc.text(label, col3X, pY)
    
    let promoOffset = 0
    if (settingsStore.app.viewDiscount && oldP > 0 && newP > 0 && oldP !== newP) {
      doc.setTextColor(156, 163, 175) // Gray-400 for strikethrough
      doc.setFontSize(isBoth ? 8 : 10)
      doc.setFont('helvetica', 'bold')
      const op = `Rp ${formatPrice(oldP)}`
      doc.text(op, col3X, pY + 4.5)
      doc.setDrawColor(239, 68, 68) // Red-500 line
      doc.setLineWidth(0.5)
      const tw = doc.getTextWidth(op)
      doc.line(col3X - 1, pY + 3.2, col3X + tw + 1, pY + 3.2)
      
      doc.setFillColor(239, 68, 68)
      doc.roundedRect(col3X + tw + 3, pY + 1, 14, 4, 1, 1, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(isBoth ? 5 : 6)
      doc.text('PROMO', col3X + tw + 10, pY + 3.7, { align: 'center' })
      
      promoOffset = isBoth ? 5.5 : 6.5
    }

    const finalPriceY = pY + (isBoth ? 9 : 11) + promoOffset

    doc.setFontSize(isBoth ? 18 : 24)
    doc.setTextColor(primaryColor)
    doc.setFont('helvetica', 'bold')
    const finalPrice = newP || oldP
    const finalPriceStr = `Rp ${formatPrice(finalPrice)}`
    doc.text(finalPriceStr, col3X, finalPriceY)
    
    const priceWidth = doc.getTextWidth(finalPriceStr)

    if (isSewa) {
      doc.setFontSize(isBoth ? 7 : 8)
      doc.setTextColor(slateColor)
      doc.setFont('helvetica', 'normal')
      doc.text(product.Satuan_Minimal_Sewa ? `/ ${product.Satuan_Minimal_Sewa}` : '/ Tahun', col3X + priceWidth + 2, finalPriceY)
    }

    pY += isBoth ? (15 + promoOffset) : (20 + promoOffset)
  }

  if (hasJual) {
    drawPriceBlock(isBoth ? 'HARGA JUAL:' : 'DENGAN HANYA', product.Harga_Jual1, product.Harga_Jual2, false)
    if (isBoth) {
       doc.setDrawColor(226, 232, 240)
       doc.setLineWidth(0.5)
       doc.line(col3X, pY - 2, col3X + 65, pY - 2)
       pY += 4
    }
  }
  if (hasSewa) drawPriceBlock(isBoth ? 'HARGA SEWA:' : 'DENGAN HANYA', product.Harga_Sewa1, product.Harga_Sewa2, true)

  const finalPY = Math.max(90, pY + 2)
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.5)
  doc.line(col3X, finalPY, col3X + 65, finalPY)
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.text('• UNIT TERBATAS & EKSKLUSIF', col3X, finalPY + 10)
  doc.text('• BEBAS BIAYA SURAT-SURAT', col3X, finalPY + 17)
  drawDots(col3X + 60, finalPY + 5, 6, 4)

  if (qrBase64) {
    doc.addImage(qrBase64 as string, 'PNG', col3X + 15, 120, 35, 35)
    doc.setFontSize(8)
    doc.setTextColor(primaryColor)
    doc.setFont('helvetica', 'bold')
    doc.text('SCAN UNTUK DETAIL UNIT', col3X + 32.5, 162, { align: 'center' })
  }

  doc.setFillColor(primaryColor)
  doc.roundedRect(col3X - 20, height - 45, 120, 60, 10, 10, 'F')
  doc.setFillColor('#f97316')
  doc.circle(width, height, 30, 'F')
  doc.setFillColor(255, 255, 255)
  doc.circle(width, height, 15, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('HUBUNGI KAMI SEGERA', col3X - 5, height - 25)
  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'bold')
  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(0.3)
  
  // Phone Icon - Centered with text at height - 18
  const waY = height - 18
  doc.roundedRect(col3X - 10.5, waY - 2.25, 2.5, 4.5, 0.5, 0.5, 'S')
  doc.circle(col3X - 9.25, waY, 0.2, 'S')
  doc.text(`WhatsApp: +${settingsStore.business.whatsapp}`, col3X - 5, waY)
  
  // Globe Icon - Centered with text at height - 12
  const webY = height - 12
  doc.circle(col3X - 9.25, webY - 0.7, 2, 'S')
  doc.line(col3X - 11.25, webY - 0.7, col3X - 7.25, webY - 0.7)
  doc.line(col3X - 9.25, webY - 2.7, col3X - 9.25, webY + 1.3)
  doc.text(`Website: wabotui.padajaya.biz.id`, col3X - 5, webY)

  // Decorative Blobs
  doc.setGState(new (doc as any).GState({ opacity: 0.1 }))
  doc.setFillColor(primaryColor)
  doc.circle(width * 0.5, height * 0.9, 40, 'F')
  doc.circle(width * 0.1, height * 0.5, 25, 'F')
  doc.circle(width * 0.9, height * 0.2, 30, 'F')
  doc.setGState(new (doc as any).GState({ opacity: 1.0 }))

  return doc
}

const sendBrochureFinal = async () => {
  if (!brochureProductData.value) return

  isSendingBrochure.value = true
  try {
    const doc = await generateBrochure(brochureProductData.value)
    const pdfBase64 = doc.output('datauristring')
    let fPhone = props.phoneNumber.replace(/\D/g, '')
    if (fPhone.startsWith('0')) fPhone = '62' + fPhone.substring(1)

    const fileName = `Brosur_Properti_${brochureProductData.value.Nama_Produk.replace(/\s+/g, '_')}.pdf`

    // 1. Send to WhatsApp via WAHA Gateway
    await api.post(
      '/api/waha/send-document',
      {
        PhoneNumber: fPhone + '@s.whatsapp.net',
        FileUrl: pdfBase64,
        FileName: fileName,
        Caption: brochureCaption.value
      },
      { headers: { 'X-Jenis-User': 'admin' } }
    )

    // 2. Save to Database Chat using the exact format requested
    const now = new Date()
    const sentAt = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 19)
    const myId = localStorage.getItem('no_id') || ''

    // Construct User_Ids for the room
    const userIds = [props.idLawan, 'adm_bot']
    if (myId && !userIds.includes(myId)) userIds.push(myId)

    const payload = {
      Chat: {
        Jenis_Pesan: 'brochure',
        Sent_At: sentAt,
        Sender_Id: myId,
        Tipe_User: 'admin',
        Message: brochureCaption.value,
        Id_Paket: null,
        No_Pesanan: null,
        No_Penawaran: String(brochureProductData.value.No_Id || brochureProductData.value.Id_Paket),
        Send_Status: 'send'
      },
      Room_Id: props.roomId,
      User_Ids: userIds
    }

    const { data } = await api.post('/api/chat/create', payload, { headers: { 'X-Jenis-User': 'Admin' } })

    // 3. Emit event to update local UI immediately
    if (data.StatusCode === 200 && data.Data) {
      // We inject the base64 locally so the Open button works without re-generating
      const newMessage = { ...data.Data, localPdfData: pdfBase64 }
      emit('addChat', newMessage)
    }

    success('Brosur properti berhasil dikirim ke WhatsApp Customer')
    showBrochureCaptionModal.value = false
  } catch (error) {
    console.error('Gagal mengirim brosur:', error)
    fail('Gagal mengirim brosur. Silakan coba lagi.')
  } finally {
    isSendingBrochure.value = false
  }
}

const handleRegenerateBrochure = async (chat: any) => {
  const productId = chat.No_Penawaran
  if (!productId) return

  Swal.fire({
    title: 'Menyiapkan Brosur...',
    text: 'Mohon tunggu sebentar',
    allowOutsideClick: false,
    confirmButtonColor: '#df7730',
    didOpen: () => {
      Swal.showLoading()
    }
  })
  
  let product = products.value.find((p) => String(p.No_Id || p.Id_Paket) === String(productId))
  if (!product) {
    try {
      const { data } = await api.get(`/api/realEstate/getAll?no_id=${productId}`)
      if (data.Data && data.Data.length > 0) {
        product = data.Data[0]
      }
    } catch {
      // Failed to fetch product details
    }
  }

  if (!product) {
    fail('Gagal mengambil data properti untuk brosur')
    return
  }

  try {
    const doc = await generateBrochure(product)
    const fileName = `Brosur_Properti_${product.Nama_Produk.replace(/\s+/g, '_')}.pdf`
    doc.save(fileName)
    Swal.close()
  } catch (error) {
    console.error('Gagal regenerate brosur:', error)
    Swal.close()
    fail('Gagal mengunduh brosur. Silakan coba lagi.')
  }
}

const endChat = () => takeOverChat(true)

const reinitPreline = async () => {
  await nextTick()
  if (window.HSStaticMethods && typeof window.HSStaticMethods.autoInit === 'function') {
    window.HSStaticMethods.autoInit()
  }
}

const openSidebar = (): void => {
  const sidebarElement = document.querySelector<HTMLElement>('#hs-offcanvas-left')
  if (sidebarElement && (window as any).HSOverlay) (window as any).HSOverlay.open(sidebarElement)
}

let cachedScrollEl: Element | null = null
const scrollToBottom = async () => {
  await nextTick()
  const scroll = () => {
    if (cachedScrollEl && typeof (cachedScrollEl as HTMLElement).scrollTo === 'function') {
      const el = cachedScrollEl as HTMLElement
      el.scrollTo({ top: el.scrollHeight + 5000, behavior: 'auto' })
    }
  }

  // Double trigger to ensure we catch layout changes
  requestAnimationFrame(scroll)
  setTimeout(scroll, 50)
  setTimeout(scroll, 200) // Safety for slow image loads
}

const processingMessageIds = new Set<string>()

const markMessagesAsRead = async () => {
  if (props.activeTab !== 'chat_saya' || !props.chats) return

  const messagesToUpdate = props.chats.filter((chat) => chat.Tipe_User === 'customer' && (chat.Send_Status === 'delivered' || chat.Send_Status === 'send') && chat.Message_Id && !processingMessageIds.has(chat.Message_Id))

  if (messagesToUpdate.length === 0) return

  // Mark as processing to avoid redundant calls
  messagesToUpdate.forEach((msg) => processingMessageIds.add(msg.Message_Id))

  try {
    const config = { headers: { 'X-Jenis-User': 'Admin' } }

    // Process individually to avoid one failure blocking others
    await Promise.all(
      messagesToUpdate.map(async (msg) => {
        try {
          await api.put(`/api/chat/update-send-status?message_id=${msg.Message_Id}&send_status=read`, {}, config)
          msg.Send_Status = 'read'
        } catch (error: any) {
          // If 403 (already updated) or 404 (not found), we can consider it "handled" or ignore
          const status = error.response?.status
          const message = error.response?.data?.Message

          if (status === 403 || status === 404 || message?.includes('terbaru')) {
            msg.Send_Status = 'read' // Sync local state even if server says it's already updated
          } else {
            console.warn(`Gagal memperbarui status pesan ${msg.Message_Id}:`, error.message)
          }
        } finally {
          // Remove from processing after a delay to allow prop updates to catch up
          setTimeout(() => {
            processingMessageIds.delete(msg.Message_Id)
          }, 5000)
        }
      })
    )
  } catch (error) {
    console.error('Terjadi kesalahan saat memperbarui status pesan:', error)
  }
}

// Auto mark as read when opening chat
watch(
  () => props.chats,
  (newChats) => {
    if (newChats && newChats.length > 0) {
      markMessagesAsRead()
    }
  },
  { immediate: true }
)

const sendChat = async (type: string, url?: string, targetRoomId?: string, targetPhone?: string, idPaket?: string, mediaUrl?: string, usernameCS?: string) => {
  if (!type.includes('system') && !sendChatContent.value.trim()) return

  const activeRoomId = targetRoomId || props.roomId
  const activePhone = targetPhone || props.phoneNumber
  if (!activeRoomId) return

  const myId = localStorage.getItem('no_id') || ''
  const role = localStorage.getItem('role_user') || ''
  const username = type === 'system_masuk_tukar' ? usernameCS : localStorage.getItem('nama_display')
  const now = new Date()
  const sentAt = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 19)

  const resetInputHeight = () => {
    if (chatInputRef.value) chatInputRef.value.style.height = '40px'
  }

  const currentUserIds: string[] = []

  // 1. Ambil ID Customer (Id Lawan)
  if (props.idLawan) currentUserIds.push(props.idLawan)

  // 2. Ambil ID Bot (Selalu ada di room sesuai contoh user)
  if (!currentUserIds.includes('adm_bot')) currentUserIds.push('adm_bot')

  // 3. Ambil ID Admin saat ini
  if (myId && !currentUserIds.includes(myId)) currentUserIds.push(myId)

  // 4. Sinkronkan dengan User_Ids yang sudah ada di room (jika ada)
  const isCurrentActiveRoom = activeRoomId === props.roomId
  if (isCurrentActiveRoom && props.chats?.length > 0) {
    const lastChat = props.chats[props.chats.length - 1]
    if (lastChat.User_Ids && Array.isArray(lastChat.User_Ids)) {
      lastChat.User_Ids.forEach((id) => {
        if (!currentUserIds.includes(id)) currentUserIds.push(id)
      })
    }
  }

  let formattedPhone = activePhone.replace(/\D/g, '')
  if (formattedPhone.startsWith('0')) formattedPhone = '62' + formattedPhone.substring(1)

  let messageText = ''
  if (type === 'system_masuk' || type === 'system_masuk_tukar') messageText = (username || 'Admin') + '_X7#mQ9!vW2_Bergabung'
  else if (type === 'system_keluar' || type === 'system_keluar_tukar') messageText = (username || 'Admin') + '_X7#mQ9!vW2_Keluar'
  else if (type === 'system_image_brochure') messageText = (username || 'Admin') + '_X7#mQ9!vW2_Mengirim Brosur: ' + url
  else if (type.includes('system') || type.startsWith('brosur_')) messageText = url || ''
  else messageText = sendChatContent.value

  const tempIndex = props.chats.length
  if (isCurrentActiveRoom) {
    emit('addChat', {
      Message: type.includes('system_image') ? url : messageText,
      Sent_At: sentAt,
      Sender_Id: myId,
      Tipe_User: role,
      Jenis_Pesan: type.includes('system') ? type : 'text',
      Send_Status: 'pending',
      Room_Id: activeRoomId,
      User_Ids: currentUserIds,
      Username_User: username || '',
      Telepon_User: myId,
      Media_Url: mediaUrl || ''
    } as unknown as Chat)
    sendChatContent.value = ''
    resetInputHeight()
    scrollToBottom()
  }

  try {
    // Selalu kirim ke WA Gateway (Waha) sesuai instruksi user
    // Kecuali untuk semua tipe system karena sudah dihandle manual atau hanya untuk internal DB
    if (messageText.trim() && !type.includes('system')) {
      await api.post(
        '/api/waha/send-text',
        {
          ChatId: formattedPhone + '@s.whatsapp.net',
          ReplyTo: null,
          Text: messageText.replace('_X7#mQ9!vW2_', ' '),
          LinkPreview: true,
          LinkPreviewHighQuality: false,
          Session: 'session_OtpWaha'
        },
        { headers: { 'X-Jenis-User': 'admin' } }
      )
    }
    const res = await api.post('/api/chat/create', { Chat: { Jenis_Pesan: type.includes('system') ? type : 'text', Sent_At: sentAt, Sender_Id: myId, Tipe_User: role, Message: type.includes('system_image') ? url : messageText, Id_Paket: type == 'system_image_product' ? idPaket : null, No_Pesanan: null, No_Penawaran: type == 'system_image_appointment' ? idPaket : null, Send_Status: 'send' }, Room_Id: activeRoomId, User_Ids: currentUserIds }, { headers: { 'X-Jenis-User': 'admin' } })
    const newMessageId = res.data.Data?.Message_Id
    if (isCurrentActiveRoom) emit('updateChatStatus', { index: tempIndex, status: 'send', id: newMessageId })
    if ((type === 'system_keluar' || type === 'system_masuk_tukar') && isCurrentActiveRoom) emit('clearRoom')

    // Mark previous messages as read after replying
    if (!type.includes('system')) await markMessagesAsRead()
  } catch (error) {
    if (isCurrentActiveRoom) emit('updateChatStatus', { index: tempIndex, status: 'failed' })
    console.error(error)
  }
}

const takeOverChat = async (status: boolean, phoneNumber?: string, roomId?: string, customerId?: string) => {
  const targetRoom = roomId || props.roomId || undefined
  if (!targetRoom) return

  // Global lock to prevent duplicate execution for the same room/status (remount protection)
  const lockKey = `${targetRoom}_${status}`
  if (globalProcessingRooms.has(lockKey) || isTakingOver.value) return

  globalProcessingRooms.add(lockKey)
  const targetPhone = phoneNumber || props.phoneNumber
  const targetCustomerId = customerId || props.idLawan

  isTakingOver.value = true
  try {
    await api.post(
      '/api/chat/toggle-bot',
      {
        customer_phone: targetPhone,
        admin_id: localStorage.getItem('no_id'),
        customer_id: targetCustomerId,
        room_id: targetRoom,
        status_bot: status
      },
      { headers: { 'X-Jenis-User': 'admin' } }
    )

    // 2. Kirim pesan sistem ke database & push ke UI lokal
    const systemType = status === false ? 'system_masuk' : 'system_keluar'
    await sendChat(systemType, undefined, targetRoom, targetPhone)

    emit('chatTakeOver', status)
  } catch (err: any) {
    if (err.response?.data?.Message?.includes('Percakapan ini sudah diambil alih')) fail('Percakapan ini sudah diambil alih Admin lain')
    else fail(status == false ? 'Ambil alih percakapan gagal' : 'Akhiri percakapan gagal')
  } finally {
    isTakingOver.value = false
    // Release global lock after a delay to ensure any SignalR updates or remounts have finished
    setTimeout(() => globalProcessingRooms.delete(lockKey), 5000)
  }
}

const saveUsername = async () => {
  try {
    const config = { headers: { 'X-Jenis-User': 'admin' } }
    const res = await api.get(`/api/customer/getAll?no_id=${props.idLawan}`, config)
    const customerData = res.data.Data[0]
    
    // Only update UserName as requested (the label)
    await api.put(`/api/customer/update?no_id=${props.idLawan}`, { 
      ...customerData, 
      UserName: username.value 
    }, config)
    
    emit('usernameChange', username.value!)
    changeUsername.value = false
    success('Label/Username berhasil diperbarui')
  } catch (err: any) {
    fail(err.response?.data?.Message || err.message || 'Terjadi kesalahan sistem')
  }
}

const chooseImages = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  const newFiles = Array.from(target.files).map((file) => ({ id: crypto.randomUUID(), file: file, url: URL.createObjectURL(file), caption: '' }))
  previewImages.value = newFiles
  activeIndex.value = 0
  isPreviewOpen.value = true
  target.value = ''
}

const triggerAddMore = () => addMoreInput.value?.click()

const createPreviewItems = (fileList: FileList | null): PreviewImage[] => {
  if (!fileList) return []
  return Array.from(fileList).map((file) => ({ id: crypto.randomUUID(), file: file, url: URL.createObjectURL(file), caption: '' }))
}

const handleAddMore = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newImages = createPreviewItems(target.files)
  previewImages.value = [...previewImages.value, ...newImages]
  target.value = ''
  if (newImages.length > 0) activeIndex.value = previewImages.value.length - newImages.length
}

const closePreview = () => {
  previewImages.value.forEach((img) => URL.revokeObjectURL(img.url))
  previewImages.value = []
  activeIndex.value = 0
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
  })
}

const sendImages = async () => {
  if (isSendingImage.value) return
  isSendingImage.value = true
  const config = { headers: { 'X-Jenis-User': 'admin' } }
  try {
    let formattedPhone = props.phoneNumber.replace(/\D/g, '')
    if (formattedPhone.startsWith('0')) formattedPhone = '62' + formattedPhone.substring(1)

    const payloads = await Promise.all(
      previewImages.value.map(async (item) => {
        const base64String = await fileToBase64(item.file)
        return { PhoneNumber: formattedPhone + '@s.whatsapp.net', FileUrl: base64String, FileName: item.file.name, MimeType: item.file.type, Caption: item.caption }
      })
    )
    for (const item of payloads) {
      await api.post('/api/waha/send-image', item, config)
      sendChat('system_image', item.Caption + '_' + item.FileUrl)
    }
    await markMessagesAsRead()
    closePreview()
  } finally {
    isSendingImage.value = false
  }
}

const setInitialFiles = (fileList: FileList) => {
  previewImages.value.forEach((item) => URL.revokeObjectURL(item.url))
  previewImages.value = createPreviewItems(fileList)
}

const removeImage = (index: number) => {
  URL.revokeObjectURL(previewImages.value[index].url)
  previewImages.value.splice(index, 1)
  if (previewImages.value.length === 0) closePreview()
  else if (activeIndex.value >= index) activeIndex.value = Math.max(0, activeIndex.value - 1)
}



watch(
  () => props.roomId,
  (newRoomId, oldRoomId) => {
    if (newRoomId !== oldRoomId) {
      changeUsername.value = false
      previewImages.value = []
      closePreview()
    }
  }
)

const adjustInputHeight = () => {
  const textarea = chatInputRef.value
  if (!textarea) return
  textarea.style.height = 'auto' // Important: reset height to auto to calculate scrollHeight correctly
  const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 150)
  textarea.style.height = `${newHeight}px`
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendChat('text')
  }
}

const initScrollListener = () => {
  setTimeout(() => {
    cachedScrollEl = document.querySelector('#chat-scroll-container .simplebar-content-wrapper')
    if (cachedScrollEl) {
      cachedScrollEl.removeEventListener('scroll', handleScroll)
      cachedScrollEl.addEventListener('scroll', handleScroll)
      handleScroll()
    }
  }, 100)
}

const handleScroll = () => {
  if (!cachedScrollEl) return
  const { scrollTop, scrollHeight, clientHeight } = cachedScrollEl as HTMLElement
  const isAtBottom = scrollHeight - Math.ceil(scrollTop + clientHeight) <= 15
  showScrollToBottom.value = scrollHeight > clientHeight && !isAtBottom
}

watch(
  () => props.chats.length,
  () => {
    scrollToBottom()
    setTimeout(handleScroll, 150)
  },
  { immediate: true }
)

watch(
  () => props.roomId,
  () => {
    cachedScrollEl = null
    showScrollToBottom.value = false
    initScrollListener()
    nextTick(() => reinitPreline())
  },
  { immediate: true }
)

watch(
  () => props.takeOverBatch,
  async (newVal) => {
    if (newVal && newVal.length > 0 && !isProcessingBatch.value) {
      isProcessingBatch.value = true
      // Copy the batch to process and clear the prop in parent immediately
      // This prevents a new instance (remount) from seeing the same batch
      const batchToProcess = [...newVal]
      emit('takeOverStatus', [])

      try {
        const takeOverSuccess: string[] = []
        for (const item of batchToProcess) {
          try {
            await takeOverChat(item.status, item.phoneNumber, item.room, item.customerId)
            takeOverSuccess.push(item.room)
          } catch {
            //
          }
        }
        // Emit final success status if we still have any
        if (takeOverSuccess.length > 0) emit('takeOverStatus', takeOverSuccess)
      } finally {
        isProcessingBatch.value = false
      }
    }
  },
  { deep: true, immediate: true }
)

watch(sendChatContent, () => nextTick(() => adjustInputHeight()))
let chatSearchTimeout: any = null
watch(searchChatQuery, (newVal) => {
  if (chatSearchTimeout) clearTimeout(chatSearchTimeout)
  chatSearchTimeout = setTimeout(() => {
    if (newVal.trim().length >= 2 || newVal.trim().length === 0) {
      handleSearchChat()
    }
  }, 500)
})

onMounted(() => {
  isMobile.value = window.innerWidth < 640
  document.addEventListener('click', handleClickOutside)
  reinitPreline()
  scrollToBottom()
  initScrollListener()
})

onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))

defineExpose({
  takeOverChat,
  setInitialFiles
})
</script>

<template>
  <div class="chat-content-container w-full h-full overflow-hidden">
    <div v-if="roomId" class="w-full h-full flex flex-col bg-white">
      <div class="relative z-20 px-4 py-2 md:px-8 md:py-3.5 border-b border-slate-50 bg-white group">
        <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-bejo-50/50 to-transparent pointer-events-none"></div>
        <div class="absolute -right-20 -top-20 size-64 bg-bejo-100/30 rounded-full blur-3xl pointer-events-none transition-all duration-500 group-hover:scale-125"></div>

        <div ref="searchHeaderRef" class="relative z-10 flex justify-between items-center">
          <div v-if="!isSearchingChat" class="flex gap-2 sm:gap-5 items-center min-w-0 flex-1">
            <button @click="openSidebar" class="lg:hidden size-9 rounded-xl flex justify-center items-center bg-slate-50 hover:bg-bejo-50 text-slate-500 hover:text-bejo-600 transition-all duration-300 shadow-sm shrink-0">
              <Icon icon="lucide:menu" class="size-4"></Icon>
            </button>

            <div class="relative flex-shrink-0 flex items-center justify-center font-black rounded-xl size-8 md:size-10 bg-gradient-to-br from-bejo-50 to-bejo-100/50 text-bejo-600 border border-white shadow-lg shadow-bejo-500/10">
              <span v-if="username" class="text-[10px] md:text-sm tracking-tighter">{{ username.substring(0, 2).toUpperCase() }}</span>
              <Icon v-else icon="lucide:user" class="size-4 md:size-5 text-bejo-300" />
              <span class="absolute -bottom-0.5 -right-0.5 size-2 md:size-3 border-2 border-white rounded-full bg-bejo-500 shadow-lg shadow-bejo-500/20 ring-1 ring-bejo-500/20"></span>
            </div>

            <div class="min-w-0 flex-1 overflow-hidden">
              <div class="flex items-center gap-1.5 mb-0">
                <h6 class="text-slate-900 font-extrabold text-xs md:text-base tracking-tight capitalize leading-tight truncate max-w-[120px] md:max-w-none flex-1 min-w-0">
                  <template v-if="changeUsername">
                    <div class="flex items-center gap-2">
                      <input v-model="username" placeholder="Ubah label..." class="bg-slate-50 border-transparent rounded-xl py-1.5 px-3 text-sm font-bold focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500 focus:bg-white transition-all outline-none border border-slate-100 shadow-inner" />
                      <button @click="saveUsername" class="text-[10px] font-black uppercase tracking-widest bg-bejo-500 text-white px-4 py-2 mt-0.5 rounded-lg shadow-lg shadow-bejo-500/20 hover:scale-105 active:scale-95 transition-all">Simpan</button>
                    </div>
                  </template>
                  <template v-else>
                    <span class="flex items-center gap-2 group/name cursor-pointer" @click="changeUsername = true">
                      <span class="truncate">
                        {{ props.namaDisplay || phoneNumber }}
                        <span v-if="username" class="text-slate-400 font-bold ml-1 text-[10px] md:text-sm">({{ username }})</span>
                      </span>
                      <Icon icon="lucide:pencil" class="size-4 text-slate-300 group-hover/name:text-bejo-500 transition-colors" />
                    </span>
                  </template>
                </h6>
              </div>
              <p v-if="username" class="text-[9px] md:text-xs font-black text-slate-400 uppercase tracking-widest leading-none truncate">{{ phoneNumber }}</p>
            </div>
          </div>

          <div v-else class="flex-1 flex items-center gap-2 sm:gap-4 bg-slate-50/50 p-1 md:p-2 rounded-2xl border border-slate-100 animate-fade-in-right">
            <div class="relative flex-1 group/search">
              <button @click="handleSearchChat" class="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-bejo-600 transition-colors z-10" title="Cari">
                <Icon icon="lucide:search" class="size-4" />
              </button>
              <input v-model="searchChatQuery" ref="searchChatInputRef" type="text" placeholder="Cari dalam obrolan..." class="w-full bg-white border border-slate-200 rounded-xl py-2 md:py-2.5 pl-9 md:pl-11 pr-4 text-xs md:text-sm font-bold focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500 transition-all outline-none" @keydown.enter="handleSearchChat" @keydown.esc="toggleSearchChat" />
            </div>
            <div v-if="searchChatResults.length > 0" class="flex items-center gap-1 shrink-0">
              <span class="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest bg-white border border-slate-100 px-2 md:px-3 py-1.5 md:py-2 rounded-lg"> {{ currentSearchMatch + 1 }} / {{ searchChatResults.length }} </span>
              <div class="flex items-center gap-0.5 md:gap-1">
                <button @click.stop="prevSearchMatch" class="size-8 md:size-10 flex items-center justify-center rounded-lg md:rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-bejo-600 hover:bg-bejo-50 transition-all active:scale-90 shadow-sm"><Icon icon="lucide:chevron-up" class="size-4 md:size-5" /></button>
                <button @click.stop="nextSearchMatch" class="size-8 md:size-10 flex items-center justify-center rounded-lg md:rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-bejo-600 hover:bg-bejo-50 transition-all active:scale-90 shadow-sm"><Icon icon="lucide:chevron-down" class="size-4 md:size-5" /></button>
              </div>
            </div>
            <button @click.stop="toggleSearchChat" class="size-8 md:size-10 flex items-center justify-center rounded-lg md:rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90 shadow-sm"><Icon icon="lucide:x" class="size-4 md:size-5" /></button>
          </div>

          <div v-if="!isSearchingChat" class="flex items-center gap-2 sm:gap-3">
            <button @click.stop="toggleSearchChat" class="size-9 sm:size-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-bejo-600 hover:border-bejo-100 hover:bg-bejo-50 hover:shadow-lg hover:shadow-bejo-500/10 transition-all duration-300 flex items-center justify-center"><Icon icon="lucide:search" class="size-4 sm:size-5"></Icon></button>
            <button v-if="props.isTakenOver" @click="endChat" :disabled="isTakingOver" title="Akhiri Percakapan" class="h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-red-500 border border-red-100 text-white hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed">
              <Icon v-if="isTakingOver" icon="lucide:loader-2" class="size-4 animate-spin"></Icon>
              <Icon v-else icon="lucide:log-out" class="size-4"></Icon>
              <span class="hidden sm:inline text-[10px] font-black uppercase tracking-widest">{{ isTakingOver ? 'Memproses...' : 'Akhiri' }}</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="isPreviewMode" class="flex-grow bg-bejo-50 min-h-0 relative flex flex-col overflow-hidden group">
        <div class="shrink-0 h-14 flex items-center px-4 z-5">
          <button @click="closePreview" :disabled="isSendingImage" class="size-9 flex items-center justify-center rounded-full text-bejo-600 transition-colors bg-white/50 backdrop-blur-sm" :class="isSendingImage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-bejo-300'"><Icon icon="lucide:x" class="size-6"></Icon></button>
        </div>
        <div v-if="activeImage" class="flex-grow flex flex-col min-h-0 h-full mb-2">
          <div class="flex-grow w-full flex items-center justify-center min-h-0 overflow-hidden px-4 md:px-8">
            <img :src="activeImage.url" :alt="'Preview ' + activeIndex" class="w-full h-full max-h-[70vh] object-contain rounded-2xl transition-all duration-300 shadow-sm" />
          </div>
          <div class="shrink-0 w-full px-4 mt-3 mb-1">
            <div class="max-w-2xl mx-auto relative">
              <input v-model="activeImage.caption" type="text" placeholder="Tambahkan keterangan..." class="w-full bg-white/80 backdrop-blur text-bejo-900 text-sm rounded-2xl px-10 py-2.5 border border-bejo-100 focus:ring-0 placeholder:text-bejo-400 shadow-md" />
              <div class="absolute inset-y-0 start-0 flex items-center ps-4 text-bejo-500"><Icon icon="lucide:text-initial" class="size-5"></Icon></div>
            </div>
          </div>
        </div>

        <div v-if="previewImages.length > 0" class="shrink-0 w-full bg-bejo-100 grid grid-cols-[1fr_auto] items-center border-t border-bejo-200">
          <div class="overflow-x-auto minimal-scrollbar w-full">
            <div class="flex items-center gap-4 w-max px-4 py-6">
              <div v-for="(item, index) in previewImages" :key="item.id" @click="activeIndex = index" class="relative size-16 shrink-0 rounded-xl cursor-pointer transition-all duration-300" :class="activeIndex === index ? 'scale-110 ring-4 ring-bejo-500 z-10' : 'ring-2 ring-transparent opacity-80 hover:opacity-100'">
                <img :src="item.url" class="w-full h-full object-cover rounded-lg" />
                <button @click.stop="removeImage(index)" :disabled="isSendingImage" class="absolute -top-2 -right-2 size-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md z-20" :class="isSendingImage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'"><Icon icon="lucide:x" class="size-3.5 stroke-[3]"></Icon></button>
              </div>
              <button @click="triggerAddMore" :disabled="isSendingImage" class="size-16 shrink-0 border-2 border-dashed border-bejo-400 rounded-xl flex flex-col items-center justify-center text-bejo-500 bg-white transition-colors" :class="isSendingImage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-bejo-50'"><Icon icon="lucide:plus" class="size-6" /><span class="text-[9px] font-bold mt-1 uppercase">Tambah</span></button>
            </div>
          </div>
          <div class="px-4 border-l border-bejo-200 h-full flex items-center justify-center">
            <button @click="sendImages" :disabled="isSendingImage" class="bg-bejo-500 hover:bg-bejo-600 text-white rounded-xl px-5 py-3 font-bold flex items-center gap-2 transition-all shadow-md" :class="isSendingImage ? 'opacity-75 cursor-not-allowed' : 'active:scale-95'">
              <span class="hidden sm:inline text-sm">{{ isSendingImage ? 'Mengirim...' : 'Kirim' }}</span
              ><Icon v-if="isSendingImage" icon="lucide:loader-2" class="size-4 animate-spin"></Icon><Icon v-else icon="lucide:send" class="size-4"></Icon>
            </button>
          </div>
        </div>
        <div v-else class="flex-grow flex flex-col items-center justify-center text-bejo-500">
          <Icon icon="lucide:image" class="size-16 mb-4 opacity-30"></Icon>
          <h4 class="font-bold text-bejo-700">Tidak ada gambar</h4>
          <p class="text-xs mt-1">Silahkan pilih gambar kembali</p>
        </div>
        <input type="file" ref="addMoreInput" multiple hidden accept="image/*" @change="handleAddMore" />
      </div>

      <div class="flex-grow min-h-0 relative overflow-hidden" :class="{ hidden: isPreviewMode }">
        <!-- Persistent Background Layer -->
        <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-slate-100">
          <div class="absolute inset-0 bg-slate-100 backdrop-blur-none"></div>
        </div>

        <simplebar id="chat-scroll-container" ref="chatContainer" class="h-full w-full relative z-10 bg-transparent">
          <div class="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/5 pointer-events-none"></div>

          <div v-if="props.isLoadingChat && props.chats.length === 0" class="relative z-10 flex flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
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
                <div class="relative bg-bejo-50 text-bejo-600 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-bejo-100 shadow-sm">Pesan Belum Terbaca</div>
              </div>

              <ChatBubble :id="'chat-message-' + i" :idx="i" :chat="chat" :chats="chats" :lastMessageId="props.lastMessageId" :highlight="searchChatQuery" :isActiveMatch="i === activeSearchChatIndex" :activeMatchIndex="activeSearchMatchIndex" @imageLoaded="scrollToBottom" @regenerateBrochure="handleRegenerateBrochure" />
            </template>
          </div>
        </simplebar>

        <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="transform translate-y-4 opacity-0 scale-95" enter-to-class="transform translate-y-0 opacity-100 scale-100" leave-active-class="transition duration-200 ease-in" leave-from-class="transform translate-y-0 opacity-100 scale-100" leave-to-class="transform translate-y-4 opacity-0 scale-95">
          <button v-if="showScrollToBottom" @click="scrollToBottom" class="absolute bottom-6 left-1/2 -translate-x-1/2 h-10 md:h-12 px-5 rounded-full bg-slate-400/50 backdrop-blur-md shadow-xl shadow-slate-900/10 border border-white/20 flex items-center gap-2 text-white hover:bg-slate-400/70 hover:scale-105 active:scale-95 transition-all z-50 group" title="Geser ke bawah">
            <span class="text-xs md:text-sm font-black uppercase tracking-wider">Scroll</span>
            <Icon icon="lucide:chevron-down" class="size-4 md:size-5 group-hover:animate-bounce" />
            <div class="absolute inset-0 rounded-full bg-white/5 scale-0 group-hover:scale-100 transition-transform duration-500"></div>
          </button>
        </Transition>
      </div>

      <div v-if="!isLoadingChat" class="p-1 md:p-3.5 bg-white border-t border-slate-50" :class="{ hidden: isPreviewMode }">
        <div v-if="!props.isTakenOver" class="w-full">
          <button @click="takeOverChat(false)" :disabled="isTakingOver" class="w-full py-4 bg-bejo-500 hover:bg-bejo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex justify-center items-center gap-3 shadow-xl shadow-bejo-500/20 active:scale-[0.98] transition-all px-8 border-2 border-white/20 disabled:opacity-70 disabled:cursor-not-allowed">
            <Icon v-if="isTakingOver" icon="lucide:loader-2" class="size-5 animate-spin" />
            <Icon v-else icon="lucide:message-square-plus" class="size-5" />
            <span>{{ isTakingOver ? 'Memproses...' : 'Ambil Alih Percakapan' }}</span>
          </button>
        </div>

        <div v-else class="flex gap-1 md:gap-4 items-center bg-white p-1.5 md:p-2.5 pl-2 md:pl-4 transition-all duration-300 border-t border-slate-50 focus-within:bg-slate-50/50 focus-within:rounded-[1.5rem] transition-all">
          <div class="relative" ref="dropdownRef">
            <button @click.stop="openMenu = !openMenu" class="size-9 md:size-11 rounded-xl md:rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-bejo-600 hover:border-bejo-100 hover:shadow-lg hover:shadow-bejo-500/10 transition-all duration-300 flex items-center justify-center">
              <Icon icon="lucide:plus" class="size-5 md:size-6 transition-transform duration-300" :class="{ 'rotate-45': openMenu }"></Icon>
            </button>

            <div v-if="openMenu" class="absolute bottom-[calc(100%+16px)] left-0 min-w-[220px] bg-white shadow-2xl shadow-slate-900/10 border border-slate-50 rounded-[1.5rem] p-2 z-50 transform origin-bottom-left transition-all animate-fade-in-up">
              <button @click.stop="handleOpenEtalase" class="flex items-center gap-3.5 w-full text-left px-4 py-3 hover:bg-bejo-50 text-slate-600 hover:text-bejo-600 rounded-xl text-[13px] font-bold transition-all border-b border-slate-50">
                <div class="size-8 rounded-lg bg-bejo-100 flex items-center justify-center text-bejo-600">
                  <Icon icon="lucide:blocks" class="size-4" />
                </div>
                <span>Pilih Etalase</span>
              </button>
              <button @click.stop="handleOpenBrochureSelection" class="flex items-center gap-3.5 w-full text-left px-4 py-3 hover:bg-bejo-50 text-slate-600 hover:text-bejo-600 rounded-xl text-[13px] font-bold transition-all">
                <div class="size-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                  <Icon icon="lucide:file-text" class="size-4" />
                </div>
                <span>Kirim Brosur</span>
              </button>
              <button @click.stop="handleOpenAppointment" class="flex items-center gap-3.5 w-full text-left px-4 py-3 hover:bg-bejo-50 text-slate-600 hover:text-bejo-600 rounded-xl text-[13px] font-bold transition-all">
                <div class="size-8 rounded-lg bg-bejo-100 flex items-center justify-center text-bejo-600">
                  <Icon icon="lucide:calendar-plus" class="size-4" />
                </div>
                <span>Buat Janji Temu</span>
              </button>
              <div class="h-px bg-slate-50 my-2"></div>
              <button @click.stop="handleOpenTukarCS" class="flex items-center gap-3.5 w-full text-left px-4 py-3 hover:bg-bejo-50 text-slate-600 hover:text-bejo-600 rounded-xl text-[13px] font-bold transition-all">
                <div class="size-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                  <Icon icon="lucide:repeat" class="size-4" />
                </div>
                <span>Alihkan ke CS Lain</span>
              </button>
            </div>
          </div>

          <textarea ref="chatInputRef" v-model="sendChatContent" @keydown="handleKeydown" class="flex-1 min-w-0 bg-transparent border-none focus:ring-0 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-bold px-1 md:px-2 py-[11px] resize-none overflow-y-auto custom-scrollbar transition-all duration-200" placeholder="Tulis pesan..." rows="1" style="height: 40px; min-height: 40px"></textarea>

          <div ref="containerRef" class="flex-shrink-0 flex items-center gap-1 md:gap-3 relative">
            <div class="relative">
              <button @click="showEmojiPicker = !showEmojiPicker" class="size-8 md:size-11 rounded-xl md:rounded-2xl bg-white border border-slate-100 text-slate-400 flex-shrink-0 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-all" :class="{ 'text-bejo-600 border-bejo-200 bg-bejo-50': showEmojiPicker }">
                <Icon icon="lucide:smile" class="size-4.5 md:size-6"></Icon>
              </button>

              <div v-if="showEmojiPicker" class="absolute bottom-[calc(100%+16px)] right-0 w-[280px] md:w-[320px] bg-white shadow-2xl shadow-slate-900/15 border border-slate-50 rounded-[1.5rem] p-3 z-[60] animate-fade-in-up">
                <div class="flex items-center justify-between mb-3 px-1">
                  <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Pilih Emoji</span>
                  <button @click="showEmojiPicker = false" class="text-slate-400 hover:text-slate-600"><Icon icon="lucide:x" class="size-4" /></button>
                </div>
                <div class="grid grid-cols-7 gap-1 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                  <button v-for="emoji in commonEmojis" :key="emoji" @click="addEmoji(emoji)" class="size-8 md:size-9 flex items-center justify-center text-lg md:text-xl hover:bg-slate-50 rounded-lg transition-all active:scale-90 select-none">
                    {{ emoji }}
                  </button>
                </div>
              </div>
            </div>
            <label class="size-8 md:size-11 rounded-xl md:rounded-2xl bg-white border border-slate-100 text-slate-400 flex-shrink-0 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-all">
              <Icon icon="lucide:image" class="size-4.5 md:size-6"></Icon>
              <input type="file" multiple hidden @change="chooseImages" accept="image/*" />
            </label>
            <button @click="sendChat('text')" class="h-8 px-3 md:px-6 rounded-xl md:rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-1.5 md:gap-3 shadow-xl shadow-bejo-500/20 active:scale-95 transition-all flex-shrink-0">
              <span class="hidden md:inline">Kirim</span>
              <Icon icon="lucide:send" class="size-3.5 md:size-4"></Icon>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="relative w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-50/50 overflow-hidden">
      <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px"></div>

      <button @click="openSidebar" class="absolute top-5 left-5 lg:hidden h-10 px-5 gap-2 rounded-xl flex justify-center items-center bg-white border border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50 font-semibold text-slate-700 transition-all z-10 active:scale-95">
        <Icon icon="lucide:menu" class="size-4"></Icon>
        <span class="text-sm">Buka Daftar Pesan</span>
      </button>

      <div class="flex flex-col items-center justify-center text-center p-10 bg-white/80 backdrop-blur-sm rounded-[2rem] border border-white shadow-xl shadow-slate-200/50 max-w-sm z-10 transform transition-all hover:scale-[1.02]">
        <div class="relative mb-6">
          <div class="absolute inset-0 bg-bejo-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div class="size-24 bg-gradient-to-br from-bejo-50 to-bejo-100 border-4 border-white text-bejo-600 rounded-full flex items-center justify-center shadow-lg relative">
            <Icon icon="lucide:message-square-dashed" class="size-10 stroke-[1.5]"></Icon>
          </div>
        </div>
        <h4 class="text-xl font-extrabold text-slate-800 tracking-tight">Mulai Percakapan</h4>
        <p class="text-sm text-slate-500 mt-2.5 leading-relaxed font-medium">Pilih pelanggan dari daftar di samping untuk mulai melihat dan membalas pesan.</p>
      </div>
    </div>
    <Teleport to="body">
      <PanelEtalase
        :openEtalase="openEtalase || openBrochureSelection"
        :isSendingImage="isSendingImage || isSendingBrochure"
        :openAppointment="openAppointment"
        :openBrochureSelection="openBrochureSelection"
        v-model:searchKatalog="searchKatalog"
        v-model:openFilter="openFilter"
        v-model:activeExpandedProductId="activeExpandedProductId"
        v-model:facilitiesFilter="facilitiesFilter"
        v-model:regionFilter="regionFilter"
        v-model:priceRangeFilter="priceRangeFilter"
        v-model:transactionTypeFilter="transactionTypeFilter"
        v-model:typeFilter="typeFilter"
        :provinces="PROVINCES"
        :isLoadingProducts="isLoadingProducts"
        :filteredProducts="filteredProducts"
        @close="closeEtalase"
        @selectUnit="openAppointment ? (handleSelectUnitForAppointment($event), (openAppointment = false)) : openBrochureSelection ? handleSelectUnitForBrochure($event) : sendProduct($event, (val) => (isSendingImage = val), closeEtalase)"
      />

      <!-- Brochure Caption Modal -->
      <div v-if="showBrochureCaptionModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <div class="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-fade-in-up">
          <div class="flex justify-between items-center mb-8">
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                <Icon icon="lucide:file-text" class="size-5" />
              </div>
              <h4 class="text-xl font-black text-slate-900 tracking-tight">Kirim Brosur Eksklusif</h4>
            </div>
            <button @click="showBrochureCaptionModal = false" class="size-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Icon icon="lucide:x" class="size-6" /></button>
          </div>

          <div v-if="brochureProductData" class="flex items-center gap-5 p-5 bg-slate-50/80 border border-slate-100 rounded-3xl mb-8">
            <img :src="brochureProductData.MediaUrls?.[0]?.ThumbUrl || brochureProductData.MediaUrls?.[0]?.Id_Media" class="size-20 rounded-2xl object-cover shadow-sm border-2 border-white" />
            <div>
              <h5 class="font-extrabold text-slate-900 leading-tight mb-1">{{ brochureProductData.Nama_Produk }}</h5>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brosur Digital</p>
            </div>
          </div>

          <div class="space-y-6">
            <div>
              <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 px-1">Keterangan Pesan (WhatsApp)</label>
              <textarea v-model="brochureCaption" class="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-bold min-h-[160px] focus:bg-white focus:ring-8 focus:ring-bejo-500/5 focus:border-bejo-500 transition-all outline-none resize-none" placeholder="Masukkan caption brosur..."></textarea>
            </div>

            <button @click="sendBrochureFinal" :disabled="isSendingBrochure" class="w-full py-5 bg-bejo-500 hover:bg-bejo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-bejo-500/30 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
              <Icon v-if="isSendingBrochure" icon="lucide:loader-2" class="size-5 animate-spin" />
              <Icon v-else icon="lucide:send" class="size-5" />
              <span>{{ isSendingBrochure ? 'Mengirim...' : 'Kirim Brosur Sekarang' }}</span>
            </button>
          </div>
        </div>
      </div>

      <PanelAppointment
        :showAppointmentModal="showAppointmentModal"
        :appointmentForm="appointmentForm"
        :appointmentCalendarOptions="appointmentCalendarOptions"
        :isLoading="isLoadingAppointments"
        @update:formTanggal="(val) => (appointmentForm.tanggal = val)"
        @update:formWaktu="(val) => (appointmentForm.waktu = val)"
        @update:formNamaLengkap="(val) => (appointmentForm.namaLengkap = val)"
        @update:formNoTelp="(val) => (appointmentForm.noTelp = val)"
        @update:formCatatan="(val) => (appointmentForm.catatan = val)"
        @close="showAppointmentModal = false"
        @save="saveNewAppointment((val) => (sendChatContent = val))"
      />

      <PanelTukarCS
        :openTukarCS="openTukarCS"
        v-model:searchCS="searchCS"
        :isFetchingAdmins="isFetchingAdmins"
        :filteredAdmins="filteredAdmins"
        @close="openTukarCS = false"
        @transfer="
          handleTransferChat($event, () => {
            openTukarCS = false
          })
        "
      />
    </Teleport>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.bg-chat {
  background-image: v-bind(bgLightUrl);
  background-size: 400px;
}

:where([data-theme='dark']) .bg-chat {
  background-image: v-bind(bgDarkUrl);
  background-size: 400px;
}

.container {
  background-color: transparent;
}

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

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  @apply bg-transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-200 rounded-full hover:bg-slate-300 transition-colors;
}

.minimal-scrollbar {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: var(--color-bejo-300, #d1d5db) transparent;
}

.minimal-scrollbar::-webkit-scrollbar {
  height: 5px;
}

.minimal-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  margin-inline: 20px;
}

.minimal-scrollbar::-webkit-scrollbar-thumb {
  border-radius: 20px;
  @apply bg-bejo-400;
}

.minimal-scrollbar:active::-webkit-scrollbar-thumb,
.minimal-scrollbar:hover::-webkit-scrollbar-thumb {
  @apply bg-bejo-500;
}

.snap-start {
  scroll-snap-align: start;
}

:deep(.fc-day-booked) {
  background-color: #f8fafc !important;
  cursor: default !important;
  position: relative;
}

:deep(.fc-day-booked::after) {
  content: '';
  position: absolute;
  inset: 2px;
  border-radius: 8px;
  border: 1.5px dashed #cbd5e1;
  pointer-events: none;
}

:deep(.fc-day-booked .fc-daygrid-day-number) {
  color: #94a3b8 !important;
  font-weight: 900;
  text-decoration: line-through;
}
</style>
