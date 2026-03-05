<template>
  <div class="w-full border-e border-default-200 rounded">
    <div class="card-body">
      <div class="gap-3 flex justify-between">
        <div class="flex gap-3.5 items-center">
          <button class="lg:hidden size-8 rounded-md flex justify-center items-center bg-default-100" aria-haspopup="dialog" aria-expanded="false" aria-controls="hs-offcanvas-left" data-hs-overlay="#hs-offcanvas-left">
            <Icon icon="lucide:chevrons-left" class="size-4 text-default-500 hover:text-primary"></Icon>
          </button>
          <div class="rounded-full size-10 bg-default-100">
            <div class="relative flex items-center justify-center font-semibold rounded-full size-9 bg-default-200">
              <img :src="user2" alt="" class="rounded-full w-9 h-9" />
              <span class="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-default-50 rounded-full bg-danger"></span>
            </div>
          </div>
          <div>
            <h6 class="text-default-800 mb-1 font-bold text-sm">Budi Galangan</h6>
            <p class="text-xs text-default-500">Hy There! I'm using Whatsapp</p>
          </div>
        </div>
        <div class="flex gap-3">
          <button class="btn rounded-full size-9 hover:bg-primary/10 hover:text-primary transition-all">
            <Icon icon="lucide:search" class="size-5"></Icon>
          </button>
        </div>
      </div>
    </div>
    <div class="border-t border-default-200"></div>
    <!-- <chatContent /> -->
    <simplebar ref="chatContainer" class="h-[calc(100vh-340px)]">
      <div class="flex flex-col gap-5 px-5 py-3">
        <ChatBubble v-for="(chat, i) in chats" :key="i" :chat="chat" />
      </div>
    </simplebar>
    <div class="border-t border-default-200"></div>

    <div class="card-body">
      <div class="flex gap-2 items-center" ref="dropdownRef">
        <input type="text" class="form-input w-full" placeholder="Type your message here..." />
        <div class="flex items-center gap-2 relative">
          <button class="btn size-9 bg-primary/10 text-primary hover:bg-primary hover:text-white">
            <Icon icon="lucide:image" class="size-4"></Icon>
          </button>

          <button @click.stop="openMenu = !openMenu" class="btn size-9 bg-danger/10 text-danger hover:bg-danger hover:text-white">
            <Icon icon="lucide:menu" class="size-4"></Icon>
          </button>

          <button class="btn bg-green-500 hover:bg-green-600 text-white">
            <Icon icon="lucide:send" class="size-4"></Icon>
            Kirim
          </button>

          <!-- menu -->
          <div v-if="openMenu" class="absolute bottom-12 right-0 min-w-45 bg-white shadow-lg rounded-lg p-2">
            <button @click.stop="openProduk = !openProduk" class="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-gray-100">
              <Icon icon="lucide:package-search" class="size-4" />
              <span>Pilih Produk</span>
            </button>
            <button @click.stop="openProdukTransaksi = !openProdukTransaksi" class="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-gray-100">
              <Icon icon="lucide:shopping-cart" class="size-4" />
              <span>Buat Transaksi</span>
            </button>
            <button @click.stop="openTukarCS = !openTukarCS" class="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-gray-100">
              <Icon icon="lucide:arrow-right-left" class="size-4" />
              <span>Tukar CS</span>
            </button>
            <button @click="endChat" class="bg-red-500 text-white flex items-center gap-2 w-full text-left px-3 py-2">
              <Icon icon="lucide:message-circle-x" class="size-4" />
              <span>Akhiri Percakapan</span>
            </button>
          </div>

          <div v-if="openProduk" class="fixed bottom-15 left-1/2 -translate-x-1/2 w-[92vw] max-w-[390px] sm:bottom-2 sm:absolute sm:right-0 sm:left-auto sm:translate-x-0 bg-white rounded-2xl shadow-xl p-4">
            <!-- Search -->
            <div class="items-center text-center">
              <span class="text-default-400 text-sm">Pilih Produk</span>
            </div>
            <div class="relative mb-4 mt-2">
              <Icon icon="lucide:search" class="size-4 absolute left-3 top-3 text-gray-400" />

              <input type="text" placeholder="Cari produk..." class="w-full bg-gray-100 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            <!-- Produk Grid -->
            <div class="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1 p-2">
              <!-- Produk 1 -->
              <div class="group relative bg-white rounded-xl p-2 hover:bg-gray-100 transition cursor-pointer">
                <img :src="pasir1" class="w-full h-24 object-cover rounded-lg" />

                <button class="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition">
                  <Icon icon="lucide:plus" class="size-4" />
                </button>

                <div class="mt-2">
                  <h6 class="text-xs font-semibold text-gray-800 line-clamp-2">Pasir Biasa</h6>

                  <p class="text-green-600 font-bold text-xs mt-1">Rp 200.000</p>
                </div>
              </div>

              <!-- Produk 2 -->
              <div class="group relative bg-white rounded-xl p-2 hover:bg-gray-100 transition cursor-pointer">
                <img :src="pasir2" class="w-full h-24 object-cover rounded-lg" />

                <button class="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition">
                  <Icon icon="lucide:plus" class="size-4" />
                </button>

                <div class="mt-2">
                  <h6 class="text-xs font-semibold text-gray-800 line-clamp-2">Pasir Merah</h6>

                  <p class="text-green-600 font-bold text-xs mt-1">Rp 250.000</p>
                </div>
              </div>

              <!-- Produk 3 -->
              <div class="group relative bg-white rounded-xl p-2 hover:bg-gray-100 transition cursor-pointer">
                <img :src="pasir3" class="w-full h-24 object-cover rounded-lg" />

                <button class="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition">
                  <Icon icon="lucide:plus" class="size-4" />
                </button>

                <div class="mt-2">
                  <h6 class="text-xs font-semibold text-gray-800 line-clamp-2">Pasir Lumajang</h6>

                  <p class="text-green-600 font-bold text-xs mt-1">Rp 320.000</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="openProdukTransaksi" class="fixed bottom-15 left-1/2 -translate-x-1/2 w-[92vw] max-w-[390px] sm:bottom-2 sm:absolute sm:right-0 sm:left-auto sm:translate-x-0 bg-white rounded-2xl shadow-xl p-4">
            <!-- Search -->
            <div class="items-center text-center">
              <span class="text-default-400 text-sm">Pilih Produk</span>
            </div>
            <div class="relative mb-4 mt-2">
              <Icon icon="lucide:search" class="size-4 absolute left-3 top-3 text-gray-400" />

              <input type="text" placeholder="Cari produk..." class="w-full bg-gray-100 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            <!-- Produk Grid -->
            <div class="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1 p-2">
              <!-- Produk 1 -->
              <div class="group relative bg-white rounded-xl p-2 hover:bg-gray-100 transition cursor-pointer">
                <img :src="pasir1" class="w-full h-24 object-cover rounded-lg" />

                <div class="absolute top-2 right-2 flex items-center bg-white rounded-full shadow px-1 py-0.5 gap-1">
                  <button @click.stop="changeQty($event, -1)" class="bg-red-500 text-white rounded-full p-1">
                    <Icon icon="lucide:minus" class="size-3" />
                  </button>

                  <span class="qty text-xs font-semibold min-w-[14px] text-center">0</span>

                  <button @click.stop="changeQty($event, 1)" class="bg-green-500 text-white rounded-full p-1">
                    <Icon icon="lucide:plus" class="size-3" />
                  </button>
                </div>

                <div class="mt-2">
                  <h6 class="text-xs font-semibold text-gray-800 line-clamp-2">Pasir Biasa</h6>

                  <p class="text-green-600 font-bold text-xs mt-1">Rp 200.000</p>
                </div>
              </div>

              <!-- Produk 2 -->
              <div class="group relative bg-white rounded-xl p-2 hover:bg-gray-100 transition cursor-pointer">
                <img :src="pasir2" class="w-full h-24 object-cover rounded-lg" />

                <div class="absolute top-2 right-2 flex items-center bg-white rounded-full shadow px-1 py-0.5 gap-1">
                  <button @click.stop="changeQty($event, -1)" class="bg-red-500 text-white rounded-full p-1">
                    <Icon icon="lucide:minus" class="size-3" />
                  </button>

                  <span class="qty text-xs font-semibold min-w-[14px] text-center">0</span>

                  <button @click.stop="changeQty($event, 1)" class="bg-green-500 text-white rounded-full p-1">
                    <Icon icon="lucide:plus" class="size-3" />
                  </button>
                </div>

                <div class="mt-2">
                  <h6 class="text-xs font-semibold text-gray-800 line-clamp-2">Pasir Merah</h6>

                  <p class="text-green-600 font-bold text-xs mt-1">Rp 250.000</p>
                </div>
              </div>

              <!-- Produk 3 -->
              <div class="group relative bg-white rounded-xl p-2 hover:bg-gray-100 transition cursor-pointer">
                <img :src="pasir3" class="w-full h-24 object-cover rounded-lg" />

                <div class="absolute top-2 right-2 flex items-center bg-white rounded-full shadow px-1 py-0.5 gap-1">
                  <button @click.stop="changeQty($event, -1)" class="bg-red-500 text-white rounded-full p-1">
                    <Icon icon="lucide:minus" class="size-3" />
                  </button>

                  <span class="qty text-xs font-semibold min-w-[14px] text-center">0</span>

                  <button @click.stop="changeQty($event, 1)" class="bg-green-500 text-white rounded-full p-1">
                    <Icon icon="lucide:plus" class="size-3" />
                  </button>
                </div>

                <div class="mt-2">
                  <h6 class="text-xs font-semibold text-gray-800 line-clamp-2">Pasir Lumajang</h6>

                  <p class="text-green-600 font-bold text-xs mt-1">Rp 320.000</p>
                </div>
              </div>
            </div>
            <div class="border-t border-default-200 -mx-2 my-1"></div>
            <div class="py-2">Total : Rp 20.000</div>
            <div>
              <button class="bg-green-500 text-white hover:bg-green-600 rounded-xl w-full px-3 py-2">
                <div class="flex items-center justify-center gap-2">
                  <Icon icon="lucide:shopping-cart" class="size-4" />
                  <span>Checkout</span>
                </div>
              </button>
            </div>
          </div>

          <div v-if="openTukarCS" class="fixed bottom-15 left-1/2 -translate-x-1/2 w-[92vw] max-w-[390px] sm:bottom-2 sm:absolute sm:right-0 sm:left-auto sm:translate-x-0 bg-white rounded-2xl shadow-xl p-4">
            <!-- Title -->
            <div class="text-center mb-2">
              <span class="text-default-400 text-sm">Pilih CS</span>
            </div>

            <!-- Search -->
            <div class="relative mb-3">
              <Icon icon="lucide:search" class="size-4 absolute left-3 top-3 text-gray-400" />

              <input type="text" placeholder="Cari CS..." class="w-full bg-gray-100 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            <!-- List CS -->
            <div class="max-h-72 overflow-y-auto">
              <!-- CS 1 -->
              <div class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                <span class="text-sm font-medium text-gray-700"> Yeni Anggraeni </span>

                <button @click="tukarCS('Yeni Anggraeni')" class="flex items-center justify-center bg-white hover:bg-green-500 hover:text-white text-green-500 p-2 rounded-lg shadow-sm transition cursor-pointer">
                  <Icon icon="lucide:check" class="size-3" />
                </button>
              </div>

              <!-- CS 2 -->
              <div class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                <span class="text-sm font-medium text-gray-700"> Bima Kurniawan </span>

                <button @click="tukarCS('Bima Kurniawan')" class="flex items-center justify-center bg-white hover:bg-green-500 hover:text-white text-green-500 p-2 rounded-lg shadow-sm transition cursor-pointer">
                  <Icon icon="lucide:check" class="size-3" />
                </button>
              </div>

              <!-- CS 3 -->
              <div class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                <span class="text-sm font-medium text-gray-700"> Bobi Sanjaya </span>

                <button @click="tukarCS('Bobi Sanjaya')" class="flex items-center justify-center bg-white hover:bg-green-500 hover:text-white text-green-500 p-2 rounded-lg shadow-sm transition cursor-pointer">
                  <Icon icon="lucide:check" class="size-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import simplebar from 'simplebar-vue'
import user2 from '@/assets/images/user/user-2.jpg'
import chatContent from './ChatContent.vue'

import { confirm, success, fail } from '@/utils/sweet-alert'
import { RouterLink } from 'vue-router'
import ChatBubble from './ChatBubble.vue'

const rumah1 =
  'data:image/jpeg;base64,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'
const rumah2 =
  'data:image/jpeg;base64,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'
const pasir1 =
  'data:image/jpeg;base64,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'
const pasir2 =
  'data:image/jpeg;base64,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'
const pasir3 =
  'data:image/jpeg;base64,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'

const openMenu = ref(false)
const openProduk = ref(false)
const openProdukTransaksi = ref(false)
const openTukarCS = ref(false)
const chatContainer = ref()

const changeQty = (event: Event, val: number) => {
  const btn = event.currentTarget as HTMLElement
  const container = btn.parentElement
  if (!container) return

  const qty = container.querySelector('.qty') as HTMLElement
  let v = parseInt(qty.innerText)

  v += val
  if (v < 0) v = 0

  qty.innerText = String(v)
}

const dropdownRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  if (!dropdownRef.value) return

  if (!dropdownRef.value.contains(event.target as Node)) {
    openMenu.value = false
  }

  if (!dropdownRef.value.contains(event.target as Node)) {
    openProduk.value = false
  }

  if (!dropdownRef.value.contains(event.target as Node)) {
    openTukarCS.value = false
  }

  if (!dropdownRef.value.contains(event.target as Node)) {
    openProdukTransaksi.value = false
  }
}

const endChat = () => {
  confirm('Ingin mengakhiri percakapan Budi', () => {
    success('Berhasil mengakhiri chat')
  })
}

const tukarCS = (text: string) => {
  confirm('Ingin mengalihkan percakapan kepada CS ' + text + '?', () => {
    success('Berhasil mengalihkan chat ke CS ' + text)
  })
}

const formatRupiah = (price: string | number): string => {
  const number = typeof price === 'string' ? parseInt(price) : price
  return 'Rp ' + number.toLocaleString('id-ID')
}

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

const chats = ref<Chat[]>([
  {
    type: 'user',
    avatar: user2,
    message: [
      {
        text: 'Apakah disini tersedia pasir bangunan?'
      }
    ],
    dateTime: '16.20'
  },
  {
    type: 'ai',
    message: [
      {
        text: 'Hi! Anda datang di waktu yang tepat. Silahkan deskripsikan produk yang Anda cari'
      }
    ],
    dateTime: '16.22'
  },
  {
    type: 'user',
    avatar: user2,
    message: [
      {
        text: 'Saya butuh pasir yang cocok untuk kebutuhan cor dak'
      },
      {
        images: [rumah1, rumah2]
      },
      {
        text: 'Rencananya untuk 2 lantai'
      },
      {
        text: 'Kira-kira pasir apa yang cocok?'
      }
    ],
    dateTime: '16.24'
  },
  {
    type: 'ai',
    message: [
      {
        text: 'Baik, saya mengerti kendala yang kamu alami. Berikut saya sarankan beberapa pilihan produk yang mungkin cocok untuk kebutuhan Anda'
      },
      {
        product: [
          {
            image: pasir1,
            name: 'Pasir Biasa',
            price: formatRupiah(200000)
          },
          {
            image: pasir2,
            name: 'Pasir Merah',
            price: formatRupiah(250000)
          },
          {
            image: pasir3,
            name: 'Pasir Lumajang',
            price: formatRupiah(320000)
          }
        ]
      }
    ],
    dateTime: '16.28'
  },
  {
    type: 'user',
    avatar: user2,
    message: [
      {
        text: 'Wah pilihan yang banyak sekali, saya jadi bingung 😭'
      }
    ],
    dateTime: '16.32'
  },
  {
    type: 'ai',
    message: [
      {
        text: 'Mohon maaf atas kendala yang bapak alami, mau saya sambungkan ke customer service kami?'
      }
    ],
    dateTime: '16.34'
  },
  {
    type: 'user',
    avatar: user2,
    message: [
      {
        text: 'Ya silahkan'
      }
    ],
    dateTime: '16.36'
  },
  {
    type: 'ai',
    message: [
      {
        text: 'Mohon menunggu, Anda sedang dalam antrian customer service ke-9'
      }
    ],
    dateTime: '16.38'
  },
  {
    type: 'system',
    message: [
      {
        barrier: 'Tersambung dengan CS Maya'
      }
    ],
    dateTime: '16.38'
  },
  {
    type: 'cs',
    message: [
      {
        text: 'Selamat siang, terima kasih telah menunggu. Dengan Maya disini, ada yang bisa saya bantu?<br><br>-Maya'
      }
    ],
    dateTime: '16.42'
  },
  {
    type: 'user',
    avatar: user2,
    message: [
      {
        text: 'Saya ingin menanyakan pasir yang cocok untuk cor dak 2 lantai pakai pasir apa ya?'
      }
    ],
    dateTime: '16.44'
  },
  {
    type: 'cs',
    message: [
      {
        text: 'Mohon maaf sebelumnya dengan siapa saya bicara?<br><br>-Maya'
      }
    ],
    dateTime: '16.45'
  },
  {
    type: 'user',
    avatar: user2,
    message: [
      {
        text: 'Budi'
      }
    ],
    dateTime: '16.45'
  },
  {
    type: 'cs',
    message: [
      {
        text: 'Baik Bapak Budi, menjawab persoalan bapak. Kami menyarankan menggunakan pasir lumajang karena terkenal kuat dan tahan cuaca. Berikut untuk etalase produknya'
      },
      {
        product: [
          {
            image: pasir3,
            name: 'Pasir Lumajang',
            price: formatRupiah(320000)
          }
        ]
      },
      {
        text: 'Bagaimana bapak, apakah ada yang masih dirasa membingungkan?<br><br>-Maya'
      }
    ],
    dateTime: '16.46'
  },
  {
    type: 'user',
    avatar: user2,
    message: [
      {
        text: 'Baik, saya pesan 2 truk'
      }
    ],
    dateTime: '16.49'
  },
  {
    type: 'cs',
    message: [
      {
        text: 'Baik Bapak segera diproses. Adalagi yang ingin bapak tanyakan?'
      },
      {
        text: 'Jika tidak izin mengakhiri sesi obrolan saat ini<br><br>-Maya'
      }
    ],
    dateTime: '16.52'
  },
  {
    type: 'user',
    avatar: user2,
    message: [
      {
        text: 'Tidak, mbak'
      }
    ],
    dateTime: '16.54'
  },
  {
    type: 'cs',
    message: [
      {
        text: 'Baik Bapak Budi terima kasih atas kepercayaan Anda berbelanja di toko kami. Kami selalu hadir untuk melayani Anda. Jika ada hal lain yang dibutuhkan di kemudian hari, jangan ragu untuk menghubungi kami kembali. Selamat beraktivitas<br><br>-Maya'
      }
    ],
    dateTime: '16.56'
  },
  {
    type: 'system',
    message: [
      {
        barrier: 'Obrolan dengan CS Maya berakhir'
      }
    ],
    dateTime: '16.38'
  },
  {
    type: 'user',
    avatar: user2,
    message: [
      {
        text: 'Baik, terima kasih mbak'
      }
    ],
    dateTime: '17.00'
  },
  {
    type: 'ai',
    message: [
      {
        text: 'Dengan senang hati'
      },
    ],
    dateTime: '17.00'
  },
])

onMounted(() => {
  document.addEventListener('click', handleClickOutside)

  nextTick(() => {
    const scrollEl = chatContainer.value?.$el?.querySelector('.simplebar-content-wrapper')

    if (scrollEl) {
      scrollEl.scrollTop = scrollEl.scrollHeight
    }
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
