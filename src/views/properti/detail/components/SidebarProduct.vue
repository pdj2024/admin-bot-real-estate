<template>
  <div class="col-span-1">
    <div class="sticky top-24">
      <div class="card mb-5">
        <div class="card-body">
          <div class="relative overflow-hidden mb-5 rounded-md h-[350px] md:h-[450px] group bg-default-100" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
            <div class="h-full transition-all duration-500 ease-in-out">
              <img :src="propertyImages[currentIndex]" class="w-full h-full object-cover" alt="Property Image" />
            </div>

            <button @click="prevSlide" class="absolute left-2 top-1/2 -translate-y-1/2 size-10 sm:flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all hidden md:flex z-10 hover:bg-white/40">
              <Icon icon="lucide:chevron-left" class="size-6"></Icon>
            </button>

            <button @click="nextSlide" class="absolute right-2 top-1/2 -translate-y-1/2 size-10 sm:flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all hidden md:flex z-10 hover:bg-white/40">
              <Icon icon="lucide:chevron-right" class="size-6"></Icon>
            </button>

            <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              <button v-for="(_, index) in propertyImages.length" :key="index" @click="goToSlide(index)" class="size-1.5 rounded-full transition-all" :class="currentIndex === index ? 'bg-primary w-4' : 'bg-white/60'"></button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <a href="https://wa.me/yournumber" class="bg-danger hover:bg-danger-600 text-white rounded-md py-3 flex items-center justify-center gap-2 font-semibold transition-all shadow-sm">
              <Icon icon="lucide:phone" class="size-5"></Icon>
              Hubungi Penjual
            </a>
            <a href="https://wa.me/yournumber" class="bg-white hover:bg-gray-200 rounded-md py-3 flex items-center justify-center gap-2 font-semibold transition-all shadow-sm">
              <Icon icon="lucide:share-2" class="size-5"></Icon>
              Bagikan
            </a>
          </div>
        </div>
      </div>

      <div class="card overflow-hidden">
        <div class="p-4 bg-default-50 border-b border-default-200 flex justify-between items-center">
          <div class="flex items-center gap-2">
            <div class="size-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">RW</div>
            <div>
              <h6 class="font-bold text-default-800 leading-none">Maya</h6>
              <p class="text-[11px] text-default-500 mt-1 uppercase font-semibold">Admin 2</p>
            </div>
          </div>
          <div class="flex items-center text-yellow-500 text-sm font-bold"><Icon icon="lucide:star" class="size-4 fill-yellow-500 mr-1"></Icon> 4.8</div>
        </div>
        <div class="p-4 flex justify-between items-center">
          <span class="text-xs text-default-500 flex items-center gap-1"> <Icon icon="lucide:map-pin" class="size-3.5"></Icon> Surabaya Barat </span>
          <button class="text-xs font-bold text-primary hover:underline uppercase">Lihat Profil</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'

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
