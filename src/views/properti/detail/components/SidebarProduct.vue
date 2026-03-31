<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import type { Product } from '../index.vue'

const props = defineProps<{
  product: Product | null
}>()

const currentIndex = ref(0)
let timer: any = null

const nextSlide = () => {
  const totalImages = props.product?.MediaUrls?.length || 0
  if (totalImages > 0) {
    currentIndex.value = currentIndex.value >= totalImages - 1 ? 0 : currentIndex.value + 1
  }
  resetTimer()
}

const prevSlide = () => {
  const totalImages = props.product?.MediaUrls?.length || 0
  if (totalImages > 0) {
    currentIndex.value = currentIndex.value <= 0 ? totalImages - 1 : currentIndex.value - 1
  }
  resetTimer()
}

const goToSlide = (i: number) => {
  currentIndex.value = i
  resetTimer()
}

let startX = 0
const handleTouchStart = (e: TouchEvent) => {
  startX = e.touches[0].clientX
}
const handleTouchEnd = (e: TouchEvent) => {
  const endX = e.changedTouches[0].clientX
  const diff = startX - endX
  if (Math.abs(diff) > 50) {
    diff > 0 ? nextSlide() : prevSlide()
  }
}

const startTimer = () => {
  timer = setInterval(nextSlide, 5000)
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
    console.error('Batal membagikan atau terjadi kesalahan:', err)
  }
}

onMounted(() => startTimer())
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div class="col-span-1">
    <div class="sticky top-24">
      <div class="mb-5">
        <RouterLink to="/properti/katalog" class="inline-flex items-center text-xs font-bold uppercase tracking-widest text-default-500 hover:text-primary transition-all group">
          <Icon icon="lucide:arrow-left" class="size-4 me-2 transition-transform group-hover:-translate-x-1" />
          Kembali ke Katalog
        </RouterLink>
      </div>

      <div class="card mb-4 border-none shadow-sm bg-white overflow-hidden rounded-xl">
        <div class="card-body p-4 relative">
          <div class="relative overflow-hidden mb-4 rounded-lg h-[350px] md:h-[420px] group bg-default-50 shadow-inner" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
            <div v-if="product && (product.Status_Display !== 'Aktif' || product.Status_Properti !== 'Tersedia')" class="absolute inset-0 bg-black/40 backdrop-grayscale-[60%] z-[5] pointer-events-none transition-all duration-500"></div>

            <div v-if="product && (product.Status_Display !== 'Aktif' || product.Status_Properti !== 'Tersedia')" class="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
              <div class="px-2 py-1 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl transform transition-transform duration-500 group-hover:scale-110">
                <span class="text-xs md:text-sm font-black uppercase tracking-widest text-white/90">
                  {{ product.Status_Display !== 'Aktif' ? 'Nonaktif' : product.Status_Properti }}
                </span>
              </div>
            </div>

            <div class="h-full w-full transition-all duration-700 ease-out group-hover:scale-105">
              <img :src="product?.MediaUrls[currentIndex]?.Id_Media" class="w-full h-full object-cover" alt="Property Image" />
            </div>

            <button @click="prevSlide" class="absolute left-3 top-1/2 -translate-y-1/2 size-11 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-lg text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-primary hover:border-primary">
              <Icon icon="lucide:chevron-left" class="size-6"></Icon>
            </button>
            <button @click="nextSlide" class="absolute right-3 top-1/2 -translate-y-1/2 size-11 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-lg text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-primary hover:border-primary">
              <Icon icon="lucide:chevron-right" class="size-6"></Icon>
            </button>

            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <button v-for="(_, index) in product?.MediaUrls.length" :key="index" @click="goToSlide(index)" class="size-1.5 rounded-full transition-all duration-300" :class="currentIndex === index ? 'bg-primary w-5' : 'bg-white/50'"></button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 relative">
            <a href="#" class="flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm tracking-wide transition-all shadow-sm bg-primary text-white hover:bg-primary-600 hover:shadow-primary/20">
              <Icon icon="lucide:headset" class="size-4"></Icon>
              Hubungi Kami
            </a>

            <button type="button" @click.prevent="shareProduct" class="flex w-full items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm tracking-wide transition-all shadow-sm border border-default-200 text-default-700 hover:bg-default-50 hover:border-default-300">
              <Icon icon="lucide:share-2" class="size-4"></Icon>
              Bagikan
            </button>
          </div>
        </div>
      </div>

      <div class="card border-none shadow-sm bg-white rounded-xl overflow-hidden transition-all duration-500">
        <div class="p-4 flex justify-between items-center">
          <div class="flex items-center gap-2 text-default-600">
            <div class="bg-primary/10 p-1.5 rounded-md">
              <Icon icon="lucide:map-pin" class="size-4 text-primary"></Icon>
            </div>
            <span class="text-sm font-bold tracking-tighter">{{ product?.Area || 'Lokasi Terdaftar' }}</span>
          </div>
          <button class="text-[12px] font-black text-primary hover:text-primary-700 tracking-widest border-b border-primary/20">Lihat Area</button>
        </div>
      </div>
    </div>
  </div>
</template>
