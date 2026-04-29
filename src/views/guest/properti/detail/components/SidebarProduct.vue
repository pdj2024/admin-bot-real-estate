<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useSettings } from '@/stores/settings'
import type { Product } from '../index.vue'

const settingsStore = useSettings()

const props = defineProps<{
  product: Product | null
  isAdmin: boolean
}>()

const currentIndex = ref(0)
const videoMap = ref<Record<string, boolean>>({})
const isVideoLoading = ref(false)
let timer: any = null

const nextSlide = (isAuto = false) => {
  const totalMedia = props.product?.MediaUrls?.length || 0
  if (totalMedia <= 1) return
  if (isAuto && videoMap.value[currentMediaUrl.value]) {
    return
  }
  currentIndex.value = (currentIndex.value + 1 + totalMedia) % totalMedia
  resetTimer()
}

const prevSlide = () => {
  const totalMedia = props.product?.MediaUrls?.length || 0
  if (totalMedia <= 1) return
  currentIndex.value = (currentIndex.value - 1 + totalMedia) % totalMedia
  resetTimer()
}

const goToSlide = (i: number) => {
  currentIndex.value = i
  resetTimer()
}

const preloadNextMedia = (index: number) => {
  const nextIndex = (index + 1) % (props.product?.MediaUrls?.length || 1)
  const nextUrl = props.product?.MediaUrls?.[nextIndex]?.Id_Media

  if (nextUrl) {
    const isVideo = checkMediaType(nextUrl)
    if (isVideo) {
      const video = document.createElement('video')
      video.src = nextUrl
      video.preload = 'auto'
    } else {
      const img = new Image()
      img.src = nextUrl
    }
  }
}

const handleVideoEnded = () => {
  const totalMedia = props.product?.MediaUrls?.length || 0
  if (totalMedia <= 1) return
  currentIndex.value = (currentIndex.value + 1) % totalMedia

  resetTimer()
}

let startX = 0
let isDragging = false

const handleDragStart = (e: TouchEvent | MouseEvent) => {
  isDragging = true
  startX = e instanceof TouchEvent ? e.touches[0].clientX : e.clientX
}

const handleDragEnd = (e: TouchEvent | MouseEvent) => {
  if (!isDragging) return
  isDragging = false
  const endX = e instanceof TouchEvent ? e.changedTouches[0].clientX : e.clientX
  const diff = startX - endX
  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      nextSlide(false)
    } else {
      prevSlide()
    }
  }
}

const handleWaContact = () => {
  const url = window.location.href
  const text = `Halo Admin, saya tertarik untuk menanyakan lebih lanjut mengenai properti *${props.product?.Nama_Produk}*\n\n${url}`
  const targetNumber = settingsStore.business.whatsapp || '62895353837000'

  window.open(`https://wa.me/${targetNumber}?text=${encodeURIComponent(text)}`, '_blank')
}

const startTimer = () => {
  timer = setInterval(() => nextSlide(true), 5000)
}
const resetTimer = () => {
  clearInterval(timer)
  startTimer()
}

const shareProduct = async () => {
  const shareData = {
    title: props.product?.Nama_Produk || 'Lihat properti ini',
    text: `Cek ${props.product?.Nama_Produk} di area ${props.product?.Area}.`,
    url: window.location.href
  }
  try {
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(shareData.url)
      alert('Tautan berhasil disalin ke clipboard!')
    }
  } catch (err) {
    console.error('Gagal membagikan:', err)
  }
}

const checkMediaType = (url: string) => {
  if (!url) return false
  return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url)
}

const currentMediaUrl = computed(() => {
  return props.product?.MediaUrls?.[currentIndex.value]?.Id_Media || ''
})

watch(
  () => props.product?.MediaUrls,
  (mediaList) => {
    if (!mediaList) return
    mediaList.forEach((item) => {
      const url = item.Id_Media
      if (url) {
        videoMap.value[url] = checkMediaType(url)
      }
    })
  },
  { immediate: true }
)

watch(
  currentIndex,
  (newIndex) => {
    preloadNextMedia(newIndex)
    if (videoMap.value[currentMediaUrl.value]) {
      isVideoLoading.value = true
    } else {
      // Let image load event fire, default to loading
      isVideoLoading.value = true
    }
  },
  { immediate: true }
)

const isLightboxOpen = ref(false)

const openLightbox = () => {
  isLightboxOpen.value = true
  document.body.style.overflow = 'hidden' // Prevent scroll
  resetTimer() // Stop carousel auto-play
}

const closeLightbox = () => {
  isLightboxOpen.value = false
  document.body.style.overflow = '' // Restore scroll
  startTimer()
}

// Global Keyboard Listener for Esc key
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isLightboxOpen.value) {
    closeLightbox()
  } else if (isLightboxOpen.value) {
    if (e.key === 'ArrowRight') nextSlide(false)
    if (e.key === 'ArrowLeft') prevSlide()
  }
}

const formattedArea = computed(() => {
  if (!props.product?.Area?.[0]) return ''
  const parts = props.product.Area[0].split(',').map((s) => s.trim())
  if (parts.length >= 2) {
    return parts.slice(-2).join(', ')
  }
  return props.product.Area[0]
})

onMounted(() => {
  startTimer()
  window.addEventListener('keydown', handleKeyDown)
})
onUnmounted(() => {
  clearInterval(timer)
  window.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="col-span-1">
    <div class="sticky top-24">
      <div class="mb-5">
        <RouterLink :to="isAdmin ? '/properti/katalog' : '/katalog'" class="inline-flex items-center text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-bejo-600 transition-all group">
          <Icon icon="lucide:arrow-left" class="size-4 me-2 transition-transform group-hover:-translate-x-1" />
          Kembali ke Katalog
        </RouterLink>
      </div>

      <div class="card mb-4 border-none shadow-sm bg-white overflow-hidden rounded-xl">
        <div class="card-body p-4 relative">
          <!-- Main Carousel -->
          <div class="relative overflow-hidden mb-4 rounded-lg h-[350px] md:h-[420px] group bg-default-50 shadow-inner cursor-zoom-in active:cursor-grabbing" @mousedown="handleDragStart" @mouseup="handleDragEnd" @mouseleave="handleDragEnd" @touchstart="handleDragStart" @touchend="handleDragEnd">
            <!-- Label Status -->
            <div v-if="product && (product.Status_Display !== 'Aktif' || product.Status_Properti !== 'Tersedia')" class="absolute inset-0 bg-black/40 backdrop-grayscale-[60%] z-[5] pointer-events-none transition-all duration-500"></div>
            <div v-if="product && (product.Status_Display !== 'Aktif' || product.Status_Properti !== 'Tersedia')" class="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
              <div class="px-2 py-1 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl transform transition-transform duration-500 group-hover:scale-110">
                <span class="text-xs md:text-sm font-black uppercase tracking-widest text-white/90">
                  {{ product.Status_Properti != 'Tersedia' ? product.Status_Properti : product.Status_Display }}
                </span>
              </div>
            </div>

            <!-- Media Content -->
            <div @click="openLightbox" class="h-full w-full transition-all duration-700 ease-out group-hover:scale-105 will-change-transform transform-gpu relative">
              <div v-if="isVideoLoading" class="absolute inset-0 flex items-center justify-center bg-slate-100 z-20">
                <Icon icon="lucide:loader-2" class="size-8 text-bejo-500 animate-spin" />
              </div>

              <video v-if="videoMap[currentMediaUrl]" :key="currentMediaUrl" :src="currentMediaUrl" class="w-full h-full object-cover" autoplay muted playsinline preload="auto" @ended="handleVideoEnded" @waiting="isVideoLoading = true" @playing="isVideoLoading = false" @loadeddata="isVideoLoading = false" @canplay="isVideoLoading = false" :loop="false"></video>

              <img v-else-if="videoMap[currentMediaUrl] === false" :key="currentMediaUrl + 'img'" :src="currentMediaUrl" class="w-full h-full object-cover select-none" loading="eager" @load="isVideoLoading = false" draggable="false" />

              <div v-else class="w-full h-full bg-gray-200 animate-pulse"></div>
            </div>

            <!-- Navigation Buttons -->
            <button @click.stop="prevSlide" class="absolute left-3 top-1/2 -translate-y-1/2 size-11 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-lg text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-bejo-600 hover:border-bejo-600">
              <Icon icon="lucide:chevron-left" class="size-6"></Icon>
            </button>
            <button @click.stop="nextSlide(false)" class="absolute right-3 top-1/2 -translate-y-1/2 size-11 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-lg text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-bejo-600 hover:border-bejo-600">
              <Icon icon="lucide:chevron-right" class="size-6"></Icon>
            </button>

            <!-- Indicators -->
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <button v-for="(_, index) in product?.MediaUrls?.length" :key="index" @click.stop="goToSlide(index)" class="size-1.5 rounded-full transition-all duration-300" :class="currentIndex === index ? 'bg-bejo-500 w-5' : 'bg-white/50'"></button>
            </div>
          </div>

          <div class="grid gap-3 relative" :class="isAdmin ? 'grid-cols-1' : 'grid-cols-2'">
            <button v-if="!isAdmin" @click="handleWaContact" class="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md bg-bejo-600 text-white hover:bg-bejo-700 hover:shadow-bejo-600/30">
              <Icon icon="lucide:headset" class="size-4" />
              Hubungi Kami
            </button>
            <button type="button" @click.prevent="shareProduct" class="flex w-full items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-sm border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300">
              <Icon icon="lucide:share-2" class="size-4" />
              Bagikan
            </button>
          </div>
        </div>
      </div>

      <div class="card border-none shadow-sm bg-white rounded-xl overflow-hidden transition-all duration-500 mb-3">
        <div class="p-4 flex justify-between items-center">
          <div class="flex items-center gap-2 text-slate-600">
            <div class="bg-bejo-50 p-1.5 rounded-lg border border-bejo-100" :class="!product ? 'bg-slate-200 border-none animate-pulse *:opacity-0' : ''">
              <Icon icon="lucide:map-pin" class="size-4 text-bejo-600" />
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-bold tracking-tight" :class="!product ? 'text-transparent bg-slate-200 animate-pulse select-none rounded w-fit' : ''">
                {{ !product ? 'Memuat area...' : formattedArea }}
              </span>
            </div>
          </div>
          <button class="text-[11px] font-black uppercase tracking-widest border-b px-1 pb-0.5" :class="!product ? 'text-transparent bg-slate-200 border-none animate-pulse select-none rounded' : 'text-bejo-600 hover:text-bejo-800 border-bejo-600/30'">Lihat Area</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Media Lightbox (Full Screen) -->
  <Teleport to="body">
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="isLightboxOpen" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl">
        <!-- Close Button -->
        <button @click="closeLightbox" class="absolute top-6 right-6 z-[10000] size-14 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-bejo-600 transition-all">
          <Icon icon="lucide:x" class="size-7" />
        </button>

        <!-- Navigation -->
        <button @click="prevSlide" class="absolute left-6 top-1/2 -translate-y-1/2 z-[10000] size-16 flex items-center justify-center rounded-full bg-white/5 text-white backdrop-blur-md border border-white/10 hover:bg-bejo-600 transition-all group">
          <Icon icon="lucide:chevron-left" class="size-10 group-hover:-translate-x-1 transition-transform" />
        </button>
        <button @click="nextSlide(false)" class="absolute right-6 top-1/2 -translate-y-1/2 z-[10000] size-16 flex items-center justify-center rounded-full bg-white/5 text-white backdrop-blur-md border border-white/10 hover:bg-bejo-600 transition-all group">
          <Icon icon="lucide:chevron-right" class="size-10 group-hover:translate-x-1 transition-transform" />
        </button>

        <!-- Media Display -->
        <Transition mode="out-in" enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
          <div :key="currentMediaUrl" class="w-full h-full flex items-center justify-center p-12 lg:p-24">
            <video v-if="videoMap[currentMediaUrl]" :src="currentMediaUrl" class="max-h-full max-w-full rounded-2xl shadow-2xl" controls autoplay></video>
            <img v-else :src="currentMediaUrl" class="max-h-full max-w-full rounded-2xl shadow-2xl object-contain select-none" content="no-referrer" />
          </div>
        </Transition>

        <!-- Status & Indicators -->
        <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-[10000]">
          <div class="px-5 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-white font-black uppercase tracking-[0.3em] text-[10px]">{{ currentIndex + 1 }} / {{ product?.MediaUrls?.length }}</div>
          <div class="flex gap-2.5">
            <button v-for="(_, index) in product?.MediaUrls?.length" :key="index" @click="goToSlide(index)" class="size-2 rounded-full transition-all duration-300 shadow-sm" :class="currentIndex === index ? 'bg-bejo-500 w-8' : 'bg-white/30 hover:bg-white/50'"></button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
video,
img {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
