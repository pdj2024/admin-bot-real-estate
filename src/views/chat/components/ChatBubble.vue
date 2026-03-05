<template>
  <div v-if="chat.type === 'system'" class="my-3">
    <template v-for="(msg, i) in chat.message" :key="i">
      <div v-if="msg.barrier" class="w-full my-3 flex items-center">
        <div class="flex-grow h-px bg-default-300 shadow-[0_1px_3px_rgba(0,0,0,0.2)]"></div>

        <span class="flex-shrink mx-4 text-default-400 text-sm font-medium"> {{ msg.barrier }} </span>

        <div class="flex-grow h-px bg-default-300 shadow-[0_1px_3px_rgba(0,0,0,0.2)]"></div>
      </div>
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

            <!-- waktu di pojok kanan bawah gambar -->
            <div class="absolute bottom-1 right-1 text-white text-xs bg-black/50 px-1.5 py-0.5 rounded">{{ chat.dateTime }}</div>
          </div>
        </div>

        <!-- Produk Bubble -->
        <div
          v-if="msg.product"
          class="grid grid-cols-1 gap-2 justify-end"
          :class="{
            'md:grid-cols-1': msg.product.length === 1,
            'md:grid-cols-2': msg.product.length === 2,
            'md:grid-cols-3': msg.product.length >= 3
          }"
        >
          <div v-for="(product, k) in msg.product" :key="k">
            <div class="card p-2 relative hover:bg-gray-100">
              <img :src="product.image" class="w-full h-28 object-cover rounded-lg mb-3" />
              <h6 class="text-sm font-semibold text-default-800 line-clamp-2">
                {{ product.name }}
              </h6>
              <p class="text-primary font-bold mt-1">
                {{ product.price }}
              </p>
              <div class="absolute bottom-1 right-1 text-white text-xs bg-black/50 px-1.5 py-0.5 rounded">
                {{ chat.dateTime }}
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
  image: string
  name: string
  price: string
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
