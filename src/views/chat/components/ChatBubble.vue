<template>
  <div v-if="chat.type === 'system'" class="my-3">
    <template v-for="(msg, i) in chat.message" :key="i">
      <div v-if="msg.barrier" class="w-full my-3 flex items-center">
        <div class="flex-grow h-px bg-default-300 shadow-[0_1px_3px_rgba(0,0,0,0.2)]"></div>

        <span class="flex-shrink mx-4 text-default-400 text-sm font-medium"> {{ msg.barrier }} </span>

        <div class="flex-grow h-px bg-default-300 shadow-[0_1px_3px_rgba(0,0,0,0.2)]"></div>
      </div>

      <!-- janji temu -->
      <!-- <div class="max-w-sm mx-auto bg-white rounded-2xl shadow-lg border border-default-100 overflow-hidden my-4">
        <div class="bg-indigo-600 px-4 py-3">
          <h3 class="text-white font-semibold text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Detail Janji Temu
          </h3>
        </div>

        <div class="p-5 space-y-4">
          <div class="flex justify-between items-center border-b border-default-50 pb-3">
            <div>
              <p class="text-[10px] uppercase tracking-wider text-default-400">Tanggal</p>
              <p class="text-sm font-bold text-default-800">Senin, 10 Maret 2026</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] uppercase tracking-wider text-default-400">Waktu</p>
              <p class="text-sm font-bold text-indigo-600">14:00 WIB</p>
            </div>
          </div>

          <div>
            <p class="text-[10px] uppercase tracking-wider text-default-400 mb-1">Lokasi Pertemuan</p>
            <div class="flex gap-2 items-start">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-default-700 leading-relaxed">Kopi Kenangan, Grand City Mall Surabaya, Lantai LG.</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 pt-2">
            <div class="bg-default-50 p-2 rounded-lg">
              <p class="text-[10px] uppercase tracking-wider text-default-400">Customer</p>
              <p class="text-sm font-medium text-default-800">Andi Pratama</p>
            </div>
            <div class="bg-default-50 p-2 rounded-lg">
              <p class="text-[10px] uppercase tracking-wider text-default-400">Salesman</p>
              <p class="text-sm font-medium text-default-800">Budi Santoso</p>
            </div>
          </div>
        </div>

        <div class="px-5 py-3 bg-default-50 flex gap-2">
          <button class="flex-1 text-xs font-semibold py-2 rounded-md border border-default-200 text-default-600 hover:bg-white transition">Re-Schedule</button>
          <button class="flex-1 text-xs font-semibold py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition">Konfirmasi</button>
        </div>
      </div> -->
    </template>
  </div>
  <div v-else class="flex gap-3" :class="chat.type === 'user' ? 'justify-start' : 'justify-end'">
    <!-- Avatar kiri -->
    <div v-if="chat.type === 'user'" class="flex items-end">
      <img :src="chat.avatar" class="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full object-cover flex-shrink-0" />
    </div>

    <!-- Bubble Container -->
    <div class="max-w-[380px] flex flex-col gap-2" :class="chat.type === 'user' ? 'items-start' : 'items-end'">
      <!-- Loop semua bubble -->
      <template v-for="(msg, i) in chat.message" :key="i">
        <!-- Text Bubble -->
        <div v-if="msg.text" class="p-3 rounded-xl text-sm min-w-25" :class="bubbleColor">
          <!-- {{ msg.text }} -->
          <span v-html="msg.text"></span>
          <span v-if="chat.type === 'ai'" class="text-default-400 text-xs">
            <br /><br />
            <div class="border-t border-default-300"></div>
            Dikirim oleh Asisten AI Chat
          </span>
          <p class="text-xs text-end" :class="chat.type === 'ai' ? 'text-default-400' : 'text-white'">
            {{ chat.dateTime }}
          </p>
        </div>

        <!-- Images Bubble -->
        <div
          v-if="msg.images"
          class="grid grid-cols-1 gap-2 justify-end"
          :class="{
            'md:grid-cols-1': msg.images.length === 1,
            'md:grid-cols-2': msg.images.length === 2,
            'md:grid-cols-3': msg.images.length >= 3
          }"
        >
          <div v-for="(img, k) in msg.images" :key="k" class="relative">
            <img :src="img" class="rounded-lg object-cover w-full h-24 cursor-pointer hover:opacity-90" />

            <div class="absolute bottom-1 right-1 text-white text-xs bg-black/50 px-1.5 py-0.5 rounded">{{ chat.dateTime }}</div>
          </div>
        </div>

        <!-- Produk Bubble -->
        <div v-if="msg.product" class="grid grid-cols-1 gap-4 justify-end">
          <div v-for="(product, i) in msg.product" :key="i" class="card max-w-[280px] overflow-hidden group shadow-md border border-default-100 bg-white ml-auto">
            <div class="card-body p-0 relative overflow-hidden h-40">
              <img :src="product.image || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=600'" alt="rumah" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <span class="absolute top-2 start-2 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase"> TERSEDIA </span>
            </div>

            <div class="p-4 text-left">
              <div class="flex items-center gap-1 text-primary mb-1">
                <Icon icon="lucide:map-pin" class="size-3"></Icon>
                <span class="text-[10px] font-medium uppercase tracking-wider">
                  {{ product.location }}
                </span>
              </div>

              <div>
                <p class="text-[10px] font-semibold text-default-400 leading-none mb-1">Tipe {{ product.type }}</p>
              </div>

              <h6 class="text-sm text-default-800 font-bold hover:text-primary transition-all mb-3 line-clamp-1">
                {{ product.name }}
              </h6>

              <div class="grid grid-cols-3 gap-y-2 gap-x-1 border-y border-default-100 py-2 mb-3">
                <div class="flex items-center gap-1">
                  <Icon icon="lucide:maximize" class="size-3 text-default-400"></Icon>
                  <span class="text-[9px] text-default-600">LB {{ product.buildingSize }}m²</span>
                </div>
                <div class="flex items-center gap-1">
                  <Icon icon="lucide:layers" class="size-3 text-default-400"></Icon>
                  <span class="text-[9px] text-default-600">LT {{ product.landSize }}m²</span>
                </div>
                <div class="flex items-center gap-1">
                  <Icon icon="lucide:bed" class="size-3 text-default-400"></Icon>
                  <span class="text-[9px] text-default-600">{{ product.bed }} KT</span>
                </div>
                <div class="flex items-center gap-1 border-t border-default-50 pt-1">
                  <Icon icon="lucide:bath" class="size-3 text-default-400"></Icon>
                  <span class="text-[9px] text-default-600">{{ product.bath }} KM</span>
                </div>
                <div class="flex items-center gap-1 border-t border-default-50 pt-1">
                  <Icon icon="lucide:car" class="size-3 text-default-400"></Icon>
                  <span class="text-[9px] text-default-600">{{ product.car }} CP</span>
                </div>
                <div class="flex items-center gap-1 border-t border-default-50 pt-1">
                  <Icon icon="lucide:layers-2" class="size-3 text-default-400"></Icon>
                  <span class="text-[9px] text-default-600">{{ product.floors }} Lt</span>
                </div>
              </div>

              <div class="flex items-end justify-between gap-2 mt-2">
                <div>
                  <p class="text-[9px] text-default-400 leading-none mb-1">Mulai Dari</p>
                  <h5 class="text-sm font-bold text-primary">Rp {{ product.price }}</h5>
                </div>

                <button class="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-primary hover:text-white transition-all">Detail</button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Avatar kanan -->
    <div v-if="chat.type !== 'user'" class="flex items-end">
      <!-- AI -->
      <div v-if="chat.type === 'ai'" class="relative flex items-center justify-center font-semibold rounded-full size-9 bg-default-200">AI</div>

      <!-- CS -->
      <div v-if="chat.type === 'cs'" class="relative flex items-center justify-center rounded-full size-9 bg-default-200">
        <Icon icon="lucide:headset" class="size-5 text-default-500" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Product {
  name: string
  image: string
  type: string
  buildingSize: number
  landSize: number
  floors: number
  price: string
  location: string
  bed: number
  bath: number
  car: number
}

interface BubbleMessage {
  text?: string
  images?: string[]
  product?: Product[]
  barrier?: string
}

interface Chat {
  type: 'user' | 'ai' | 'cs' | 'system'
  avatar?: string
  message: BubbleMessage[]
  dateTime: string
}

const props = defineProps<{
  chat: Chat
}>()

const bubbleColor = computed(() => {
  if (props.chat.type === 'user') return 'bg-blue-500 text-white'
  if (props.chat.type === 'cs') return 'bg-green-500 text-white'
  return 'bg-default-200 text-default-700'
})
</script>
