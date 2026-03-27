<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import type { Product } from '../index.vue'

defineProps<{
  product: Product | null
}>()

const propertyImages = [
  'https://cpanel-blog.smsperkasa.com/wp-content/uploads/2024/08/Rumah-dengan-Pintu-Kayu-Besar-min-1024x1024.png',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXjgXfMWMKSFVuYwVigFxclgv927Kmb4LBDg&s',
  'https://cdn0-production-images-kly.akamaized.net/7x_hjv7tRV0CpDxrItZkZye-xq0=/500x500/smart/filters:quality(75):strip_icc()/kly-media-production/medias/5385959/original/055496800_1760949483-desain_rumah_1_lantai_sederhana__4_.jpg',
  'https://www.emporioarchitect.com/img/blog/ide-desain-rumah-mewah-untuk-anda-130125013838148646.jpg',
  'https://static.promediateknologi.id/crop/0x28:1143x716/0x0/webp/photo/p2/239/2025/02/06/desain-rumah-minimalis-tahun-2024-1452919504.jpg'
]

const currentIndex = ref(0)
let timer: any = null

// --- Navigasi ---
const nextSlide = () => {
  currentIndex.value = currentIndex.value >= propertyImages.length - 1 ? 0 : currentIndex.value + 1
  resetTimer()
}

const prevSlide = () => {
  currentIndex.value = currentIndex.value <= 0 ? propertyImages.length - 1 : currentIndex.value - 1
  resetTimer()
}

const goToSlide = (i: number) => {
  currentIndex.value = i
  resetTimer()
}

// --- Swipe Logic Mobile ---
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

// --- Timer Auto-Slide ---
const startTimer = () => {
  timer = setInterval(nextSlide, 5000)
}
const resetTimer = () => {
  clearInterval(timer)
  startTimer()
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
            <div v-if="product && (product.Status_Display !== 'Aktif' || product.Status_Properti !== 'Tersedia')" class="absolute inset-0 flex items-center justify-center z-30 pointer-events-none p-6">
              <div class="text-white px-6 py-3 rounded-xl transform -rotate-6 font-black tracking-[0.15em] uppercase italic text-xl md:text-2xl backdrop-blur-md bg-black/40 shadow-2xl border border-white/10 select-none">
                {{ product.Status_Properti != 'Tersedia' ? product.Status_Properti : product.Status_Display }}
              </div>
            </div>

            <div v-if="product && (product.Status_Display !== 'Aktif' || product.Status_Properti !== 'Tersedia')" class="absolute inset-0 z-20 bg-white/10 backdrop-blur-[1px] cursor-not-allowed"></div>

            <div :class="['h-full w-full transition-all duration-700 ease-out', product && (product.Status_Display !== 'Aktif' || product.Status_Properti !== 'Tersedia') ? 'grayscale opacity-60' : 'group-hover:scale-105']">
              <img :src="product?.MediaUrls[currentIndex].Id_Media" class="w-full h-full object-cover" alt="Property Image" />
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
            <div v-if="product && (product.Status_Display !== 'Aktif' || product.Status_Properti !== 'Tersedia')" class="absolute inset-0 z-10 cursor-not-allowed"></div>

            <a href="#" :class="['flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm tracking-wide transition-all shadow-sm', product && (product.Status_Display !== 'Aktif' || product.Status_Properti !== 'Tersedia') ? 'bg-default-100 text-default-400' : 'bg-primary text-white hover:bg-primary-600 hover:shadow-primary/20']">
              <Icon icon="lucide:headset" class="size-4"></Icon>
              Hubungi Agen
            </a>

            <a href="#" :class="['flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm tracking-wide transition-all shadow-sm border', product && (product.Status_Display !== 'Aktif' || product.Status_Properti !== 'Tersedia') ? 'border-default-100 text-default-300' : 'border-default-200 text-default-700 hover:bg-default-50 hover:border-default-300']">
              <Icon icon="lucide:share-2" class="size-4"></Icon>
              Bagikan
            </a>
          </div>
        </div>
      </div>

      <div :class="['card border-none shadow-sm bg-white rounded-xl overflow-hidden transition-all duration-500', product && (product.Status_Display !== 'Aktif' || product.Status_Properti !== 'Tersedia') ? 'grayscale opacity-60' : '']">
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
