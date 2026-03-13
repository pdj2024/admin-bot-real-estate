<template>
  <div class="w-full border-e border-default-200 rounded">
    <div class="card-body bg-default-100">
      <div class="gap-3 flex justify-between">
        <div class="flex gap-3.5 items-center">
          <button class="lg:hidden size-8 rounded-md flex justify-center items-center bg-default-100" aria-haspopup="dialog" aria-expanded="false" aria-controls="hs-offcanvas-left" data-hs-overlay="#hs-offcanvas-left">
            <Icon icon="lucide:chevrons-left" class="size-4 text-default-500 hover:text-primary"></Icon>
          </button>
          <div class="rounded-full size-10 bg-default-100">
            <img :src="user2" alt="" class="h-10 rounded-full" />
          </div>
          <div>
            <h6 class="text-default-800 mb-1 font-bold text-sm">Budi Galangan</h6>
            <p class="text-xs text-default-500">Hi There! I'm using Whatsapp</p>
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

    <div class="card-body bg-default-100">
      <div class="flex gap-2 items-center" ref="dropdownRef">
        <input type="text" class="form-input w-full" placeholder="Type your message here..." />
        <div ref="containerRef" class="flex items-center gap-2 relative">
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
            <button @click.stop="openEtalase = !openEtalase" class="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-gray-100">
              <Icon icon="lucide:blocks" class="size-4" />
              <span>Pilih Etalase</span>
            </button>
            <button @click.stop="openAppointment = !openAppointment" class="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-gray-100">
              <Icon icon="lucide:clipboard-clock" class="size-4" />
              <span>Buat Janji</span>
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

          <div v-if="openEtalase || openAppointment" ref="etalaseRef" class="z-40 fixed bottom-15 left-1/2 -translate-x-1/2 w-[95vw] sm:w-[850px] sm:bottom-5 sm:right-5 sm:left-auto sm:translate-x-0 bg-white rounded-2xl shadow-2xl p-4 border border-default-100">
            <div class="flex items-center justify-between mb-4 px-2">
              <h4 v-if="openEtalase" class="text-default-900 font-bold text-base">Pilih Etalase</h4>
              <h4 v-if="openAppointment" class="text-default-900 font-bold text-base">Pilih Unit</h4>
              <button v-if="openEtalase" @click.stop="closeEtalase" class="text-default-400 hover:text-default-900 transition-all">
                <Icon icon="lucide:x" class="size-5" />
              </button>
              <button v-if="openAppointment" @click.stop="closeAppointment" class="text-default-400 hover:text-default-900 transition-all">
                <Icon icon="lucide:x" class="size-5" />
              </button>
            </div>

            <div class="px-2">
              <div class="relative mb-3">
                <Icon icon="lucide:search" class="size-4 absolute left-3 top-3 text-default-400" />
                <input type="text" placeholder="Cari produk..." class="w-full bg-default-100 rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>

              <div class="flex flex-wrap items-center gap-2 mb-4">
                <button type="button" @click.stop="openFilter = !openFilter" class="btn-trigger-filter w-full flex justify-center items-center btn btn-sm bg-primary/10 hover:bg-primary/30 text-primary py-2 rounded-xl"><Icon icon="lucide:sliders-horizontal" class="size-4 mr-2" /> Filter</button>
              </div>
            </div>

            <div class="overflow-y-auto max-h-[55vh] px-2 custom-scrollbar">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                <div class="card overflow-hidden group border border-default-100 shadow-sm hover:shadow-md transition-all duration-300" v-for="(item, idx) in catalogues" :key="idx">
                  <div class="card-body p-0 relative overflow-hidden h-36">
                    <img :src="item.image" alt="rumah" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <span class="absolute top-2 start-2 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase"> TERSEDIA </span>
                  </div>

                  <div class="p-3">
                    <div class="flex items-center gap-1 text-primary mb-1">
                      <Icon icon="lucide:map-pin" class="size-3"></Icon>
                      <span class="text-[10px] font-medium uppercase tracking-wider">{{ item.location || 'Surabaya' }}</span>
                    </div>

                    <div>
                      <p class="text-xs font-semibold text-default-400 leading-none mb-1">Tipe {{ item.type || '45' }}</p>
                    </div>

                    <h6 class="text-base text-default-800 font-bold hover:text-primary transition-all mb-3 line-clamp-1">
                      <RouterLink to="">{{ item.name }}</RouterLink>
                    </h6>

                    <div class="grid grid-cols-3 gap-y-2 gap-x-1 border-y border-default-100 py-2 mb-3">
                      <div class="flex items-center gap-1">
                        <Icon icon="lucide:maximize" class="size-3 text-default-400"></Icon>
                        <span class="text-[9px] text-default-600">LB {{ item.buildingSize }}m²</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <Icon icon="lucide:layers" class="size-3 text-default-400"></Icon>
                        <span class="text-[9px] text-default-600">LT {{ item.landSize }}m²</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <Icon icon="lucide:layers" class="size-3 text-default-400"></Icon>
                        <span class="text-[9px] text-default-600">Uk {{ item.floors }} Lt</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <Icon icon="lucide:bed" class="size-3 text-default-400"></Icon>
                        <span class="text-[9px] text-default-600">{{ item.bedrooms }} KT</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <Icon icon="lucide:bath" class="size-3 text-default-400"></Icon>
                        <span class="text-[9px] text-default-600">{{ item.bathrooms }} WC</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <Icon icon="lucide:car" class="size-3 text-default-400"></Icon>
                        <span class="text-[9px] text-default-600">{{ item.car }} CP</span>
                      </div>
                    </div>

                    <div class="flex items-end justify-between gap-2">
                      <div>
                        <p class="text-[9px] text-default-400 leading-none mb-1">Mulai Dari</p>
                        <h5 class="text-sm font-bold text-primary">{{ item.price }}</h5>
                      </div>

                      <div class="hs-dropdown relative inline-flex">
                        <button v-if="openEtalase" type="button" @click="openEtalase = false" class="btn bg-green-500 text-white h-7 inline-flex items-center gap-2 hover:bg-default-200 px-2">
                          <Icon icon="lucide:send" class="size-4 text-white" />
                          Kirim
                        </button>
                        <button v-if="openAppointment" type="button" @click.stop="openAppointmentForm = !openAppointmentForm" class="btn bg-green-500 text-white h-7 inline-flex items-center gap-2 hover:bg-default-200 px-2">
                          <Icon icon="lucide:clipboard-clock" class="size-4 text-white" />
                          Pilih
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="openAppointmentForm" ref="appointmentFormRef" class="z-40 fixed bottom-55 left-1/2 -translate-x-1/2 w-[95vw] sm:w-[350px] sm:bottom-45 sm:right-30 sm:left-auto sm:translate-x-0 bg-white rounded-2xl shadow-2xl p-4 border border-default-100">
            <!-- Header -->
            <div class="flex items-center justify-between mb-4 px-2">
              <h4 class="text-default-900 font-bold text-base">Form Janji Temu</h4>

              <button @click.stop="openAppointmentForm = false" class="text-default-400 hover:text-default-900 transition-all">
                <Icon icon="lucide:x" class="size-5" />
              </button>
            </div>

            <!-- Form -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
              <!-- Nama Customer -->
              <div>
                <label class="text-xs text-default-500 mb-1 block"> Nama Customer </label>
                <input type="text" placeholder="Masukkan nama customer" class="form-input w-full" />
              </div>

              <!-- Nama Sales -->
              <div>
                <label class="text-xs text-default-500 mb-1 block"> Nama Sales </label>
                <input type="text" placeholder="Masukkan nama sales" class="form-input w-full" />
              </div>

              <!-- Tanggal -->
              <button @click.stop="openSchedule = !openSchedule" class="btn bg-blue-500 hover:bg-blue-600 text-white">
                <Icon icon="lucide:calendar-search" class="size-4 text-white"></Icon>
                Pilih Jadwal
              </button>

              <!-- Waktu -->
              <div>
                <label class="text-xs text-default-500 mb-1 block"> Waktu </label>
                <input type="time" class="form-input w-full" />
              </div>
            </div>

            <!-- Action -->
            <div class="flex justify-end gap-2 mt-6 px-2">
              <button @click.stop="openAppointmentForm = !openAppointmentForm" class="btn bg-default-200 hover:bg-default-300 text-default-700">Batal</button>

              <button @click="saveAppointment" class="btn bg-green-500 hover:bg-green-600 text-white">Simpan</button>
            </div>
          </div>

          <div v-if="openSchedule" ref="scheduleRef" class="z-40 fixed bottom-55 left-1/2 -translate-x-1/2 w-[95vw] sm:w-[650px] sm:bottom-5 sm:right-15 sm:left-auto sm:translate-x-0 bg-white rounded-2xl shadow-2xl py-4 border border-default-100">
            <!-- Header -->
            <div class="flex items-center justify-between mb-4 px-6">
              <h4 class="text-default-900 font-bold text-base">Pilih Jadwal</h4>

              <button @click.stop="openSchedule = false" class="text-default-400 hover:text-default-900 transition-all">
                <Icon icon="lucide:x" class="size-5" />
              </button>
            </div>

            <div>
              <div class="card">
                <div class="card-body">
                  <FullCalendar ref="fullCalendarRef" :options="calendarOptions" />
                </div>
              </div>
            </div>
          </div>

          <div v-if="openTukarCS" ref="tukarCSRef" class="z-40 fixed bottom-15 left-1/2 -translate-x-1/2 w-[92vw] max-w-[390px] sm:bottom-2 sm:absolute sm:right-0 sm:left-auto sm:translate-x-0 bg-white rounded-2xl shadow-xl p-4">
            <!-- Header -->
            <div class="flex items-center justify-between mb-4 px-2">
              <h4 class="text-default-900 font-bold text-base">Pilih CS</h4>

              <button @click.stop="openTukarCS = false" class="text-default-400 hover:text-default-900 transition-all">
                <Icon icon="lucide:x" class="size-5" />
              </button>
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

          <Filter v-if="openFilter" @close="openFilter = false" ref="filterRef" class="z-[45] bg-white sm:shadow-none fixed left-1/2 bottom-12 -translate-x-1/2 w-[92vw] max-w-[390px] sm:fixed sm:right-20 sm:bottom-10 sm:left-auto sm:translate-x-0 sm:max-w-[700px] rounded-2xl shadow-xl p-4 max-h-[80vh] overflow-y-auto custom-scrollbar" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { CalendarOptions, EventClickArg } from '@fullcalendar/core'
import type { DateClickArg } from '@fullcalendar/interaction'
import simplebar from 'simplebar-vue'
import user2 from '@/assets/images/user/user-2.jpg'
import Filter from './Filter.vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import idLocale from '@fullcalendar/core/locales/id'

import { confirm, success, fail } from '@/utils/sweet-alert'
import { RouterLink } from 'vue-router'
import ChatBubble from './ChatBubble.vue'

const referensi1 = 'https://media.dekoruma.com/article/2018/09/22102609/Denah-Rumah-Minimalis-Berukuran-Mungi.jpg?resize=1000%2C682&ssl=1'
const referensi2 = 'https://arsiteknawa.co.id/wp-content/uploads/2024/09/Denah-Rumah-3-Kamar-Ukuran-7x10-1.jpg'
const rumah1 = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=600&auto=format&fit=crop'
const rumah2 = 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=600&auto=format&fit=crop'
const rumah3 = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop'

const chatContainer = ref()

// Data Dummy Rumah
const catalogues = ref([
  {
    name: 'Griya Modern Cluster',
    price: '545.000.000',
    location: 'Sidoarjo, Jawa Timur',
    type: '35/60',
    dimensi: '6 x 10 m',
    landSize: 60,
    buildingSize: 35,
    floors: 2,
    bedrooms: 2,
    bathrooms: 1,
    diningRoom: 1,
    car: 1,
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=600&auto=format&fit=crop',
    colorClass: 'indigo'
  },
  {
    name: 'Modern House Emerald',
    price: '785.000.000',
    location: 'Malang, Jawa Timur',
    type: '45/84',
    dimensi: '7 x 12 m',
    landSize: 84,
    buildingSize: 45,
    floors: 1,
    bedrooms: 2,
    bathrooms: 1,
    diningRoom: 1,
    car: 1,
    image: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=600&auto=format&fit=crop',
    colorClass: 'emerald'
  },
  {
    name: 'Premium Skyline Villa',
    price: '1.250.000.000',
    location: 'Surabaya, Jawa Timur',
    type: '70/120',
    dimensi: '8 x 15 m',
    landSize: 120,
    buildingSize: 70,
    floors: 2,
    bedrooms: 3,
    bathrooms: 2,
    diningRoom: 1,
    car: 2,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
    colorClass: 'rose'
  },
  {
    name: 'Griya Modern Cluster',
    price: '545.000.000',
    location: 'Sidoarjo, Jawa Timur',
    type: '35/60',
    dimensi: '6 x 10 m',
    landSize: 60,
    buildingSize: 35,
    floors: 2,
    bedrooms: 2,
    bathrooms: 1,
    diningRoom: 1,
    car: 1,
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=600&auto=format&fit=crop',
    colorClass: 'indigo'
  },
  {
    name: 'Modern House Emerald',
    price: '785.000.000',
    location: 'Malang, Jawa Timur',
    type: '45/84',
    dimensi: '7 x 12 m',
    landSize: 84,
    buildingSize: 45,
    floors: 1,
    bedrooms: 2,
    bathrooms: 1,
    diningRoom: 1,
    car: 1,
    image: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=600&auto=format&fit=crop',
    colorClass: 'emerald'
  },
  {
    name: 'Premium Skyline Villa',
    price: '1.250.000.000',
    location: 'Surabaya, Jawa Timur',
    type: '70/120',
    dimensi: '8 x 15 m',
    landSize: 120,
    buildingSize: 70,
    floors: 2,
    bedrooms: 3,
    bathrooms: 2,
    diningRoom: 1,
    car: 2,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
    colorClass: 'rose'
  }
])

const menuRef = ref<HTMLElement | null>(null)
const etalaseRef = ref<HTMLElement | null>(null)
const appointmentFormRef = ref<HTMLElement | null>(null)
const tukarCSRef = ref<HTMLElement | null>(null)
const filterRef = ref<any | null>(null)
const scheduleRef = ref<HTMLElement | null>(null)

const openMenu = ref(false)
const openEtalase = ref(false)
const openAppointment = ref(false)
const openAppointmentForm = ref(false)
const openTukarCS = ref(false)
const openFilter = ref(false)
const openSchedule = ref(false)
const isMobile = ref(false)

const containerRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node

  // List semua refs yang jika diklik TIDAK boleh menutup menu/modal
  const interactiveRefs = [
    containerRef.value,
    etalaseRef.value,
    appointmentFormRef.value,
    tukarCSRef.value,
    scheduleRef.value,
    filterRef.value?.$el // Untuk komponen Filter.vue
  ]

  // Jika klik terjadi di salah satu area di atas, jangan lakukan apa-apa
  if (interactiveRefs.some((el) => el && el.contains(target))) {
    return
  }

  // Jika klik di luar semua area tersebut, tutup semua popup yang bersifat "overlay"
  // Namun, kita beri pengecekan agar tidak menutup modal jika modal lain sedang terbuka
  if (!openFilter.value && !openAppointmentForm.value && !openSchedule.value) {
    openMenu.value = false
    openEtalase.value = false
    openAppointment.value = false
    openTukarCS.value = false
  }
}

const calendarEvents = [
  {
    title: 'P. Budi - Griya Asri Residence',
    start: new Date('2026-03-10T12:00:00'),
    extendedProps: {
      time: '12:00',
      location: 'Jl Hidup Liku-liku, Surabaya',
      customer: 'Budi Santoso',
      customer_phone: '0873482453534',
      salesman: 'Andi Pratama',
      salesman_phone: '081355667788',
      picture: 'https://media.dekoruma.com/article/2024/10/30201434/Model-Rumah-Modern-Minimalis.jpg?resize=800%2C600&ssl=1',
      property: 'Griya Asri Residence',
      type: 45,
      lb: 45,
      lt: 60,
      carport: 1,
      jmlLt: 1,
      kt: 2,
      wc: 1
    }
  },
  {
    title: 'P. Herman - Griya Asri Residence',
    start: new Date('2026-03-11T10:30:00'),
    extendedProps: {
      time: '10:30',
      location: 'Jl Raya Darmo, Surabaya',
      customer: 'Herman Wijaya',
      customer_phone: '081233445566',
      salesman: 'Andi Pratama',
      salesman_phone: '081355667788',
      picture: 'https://cdn1-production-images-kly.akamaized.net/7jfLlyvz6P_0Dh-KvXCFs5tf5jc=/1280x720/smart/filters:quality(75):strip_icc()/kly-media-production/medias/5214975/original/088768800_1746786001-7ba6160f-c619-4160-8633-7f463565afca.jpg',
      property: 'Griya Asri Residence',
      type: 45,
      lb: 45,
      lt: 72,
      carport: 1,
      jmlLt: 1,
      kt: 2,
      wc: 1
    }
  },
  {
    title: 'P. Siti - Green Lake Residence',
    start: new Date('2026-03-12T09:00:00'),
    extendedProps: {
      time: '09:00',
      location: 'Jl Ahmad Yani, Surabaya',
      customer: 'Siti Rahma',
      customer_phone: '081311223344',
      salesman: 'Bima Kurniawan',
      salesman_phone: '081355667788',
      picture: 'https://static.promediateknologi.id/crop/0x28:1143x716/0x0/webp/photo/p2/239/2025/02/06/desain-rumah-minimalis-tahun-2024-1452919504.jpg',
      property: 'Green Lake Residence',
      type: 60,
      lb: 60,
      lt: 90,
      carport: 1,
      jmlLt: 2,
      kt: 3,
      wc: 2
    }
  },
  {
    title: 'P. Dodi - Green Lake Residence',
    start: new Date('2026-03-13T13:00:00'),
    extendedProps: {
      time: '13:00',
      location: 'Jl Ketintang, Surabaya',
      customer: 'Dodi Kurniawan',
      customer_phone: '082155667788',
      salesman: 'Bima Kurniawan',
      salesman_phone: '081355667788',
      picture: 'https://sn-studio.id/wp-content/uploads/2025/11/rumah-minimalis-sederhana-pak-joko.jpg',
      property: 'Green Lake Residence',
      type: 70,
      lb: 70,
      lt: 100,
      carport: 2,
      jmlLt: 2,
      kt: 3,
      wc: 2
    }
  },
  {
    title: 'B. Rina - Bukit Indah Residence',
    start: new Date('2026-03-14T11:00:00'),
    extendedProps: {
      time: '11:00',
      location: 'Jl Manyar, Surabaya',
      customer: 'Rina Putri',
      customer_phone: '081299887766',
      salesman: 'Yeni Anggraeni',
      salesman_phone: '081355667788',
      picture: 'https://www.emporioarchitect.com/img/blog/mengenal-lebih-dekat-mengenai-desain-rumah-minimalis-230622011359661434.jpg',
      property: 'Bukit Indah Residence',
      type: 45,
      lb: 45,
      lt: 65,
      carport: 1,
      jmlLt: 1,
      kt: 2,
      wc: 1
    }
  },
  {
    title: 'P. Agus - Bukit Indah Residence',
    start: new Date('2026-03-15T15:00:00'),
    extendedProps: {
      time: '15:00',
      location: 'Jl Merr, Surabaya',
      customer: 'Agus Salim',
      customer_phone: '082233441122',
      salesman: 'Yeni Anggraeni',
      salesman_phone: '081355667788',
      picture: 'https://i0.wp.com/www.emporioarchitect.com/upload/portofolio/1280/desain-rumah-modern-2-setengah-lantai-24131022-85791957131022093203-0.jpg',
      property: 'Bukit Indah Residence',
      type: 60,
      lb: 60,
      lt: 84,
      carport: 1,
      jmlLt: 2,
      kt: 3,
      wc: 2
    }
  },
  {
    title: 'P. Fajar - Grand Taman Residence',
    start: new Date('2026-03-16T09:30:00'),
    extendedProps: {
      time: '09:30',
      location: 'Jl Ahmad Dahlan, Sidoarjo',
      customer: 'Fajar Nugroho',
      customer_phone: '087811223344',
      salesman: 'Andi Pratama',
      salesman_phone: '081355667788',
      picture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWQq8cL70yyFxVkLMaLVPFOXby-Ra7iGQOug&s',
      property: 'Grand Taman Residence',
      type: 50,
      lb: 50,
      lt: 70,
      carport: 1,
      jmlLt: 1,
      kt: 2,
      wc: 1
    }
  },
  {
    title: 'B. Maya - Grand Taman Residence',
    start: new Date('2026-03-17T14:00:00'),
    extendedProps: {
      time: '14:00',
      location: 'Jl Taman Sari, Sidoarjo',
      customer: 'Maya Sari',
      customer_phone: '081266778899',
      salesman: 'Bima Kurniawan',
      salesman_phone: '081355667788',
      picture: 'https://asset2.morefurniture.id/NEWS/2025/2/Rumah%20Minimalis%20dengan%20Atap%20Skillion%20Ganda.jpg',
      property: 'Grand Taman Residence',
      type: 65,
      lb: 65,
      lt: 95,
      carport: 2,
      jmlLt: 2,
      kt: 3,
      wc: 2
    }
  },
  {
    title: 'P. Joko - Permata Indah Residence',
    start: new Date('2026-03-18T10:00:00'),
    extendedProps: {
      time: '10:00',
      location: 'Jl Diponegoro, Surabaya',
      customer: 'Joko Susilo',
      customer_phone: '081355667788',
      salesman: 'Yeni Anggraeni',
      salesman_phone: '081355667788',
      picture: 'https://arsitekmasterpiece.co.id/wp-content/uploads/2024/09/Model-Rumah-Minimalis-Sederhana-di-Desa.jpg',
      property: 'Permata Indah Residence',
      type: 45,
      lb: 45,
      lt: 60,
      carport: 1,
      jmlLt: 1,
      kt: 2,
      wc: 1
    }
  },
  {
    title: 'B. Lina - Permata Indah Residence',
    start: new Date('2026-03-19T16:00:00'),
    extendedProps: {
      time: '16:00',
      location: 'Jl Rungkut, Surabaya',
      customer: 'Lina Marlina',
      customer_phone: '082199887766',
      salesman: 'Andi Pratama',
      salesman_phone: '081355667788',
      picture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwYgootRmQUBlII_rMpvQEM4KOm2D9bkS8dw&s',
      property: 'Permata Indah Residence',
      type: 70,
      lb: 70,
      lt: 110,
      carport: 2,
      jmlLt: 2,
      kt: 3,
      wc: 2
    }
  }
]

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: 'dayGridMonth',
  locale: idLocale,
  height: 'auto',
  contentHeight: 650,
  aspectRatio: 1.8,

  headerToolbar: isMobile.value
    ? {
        left: 'prev,next',
        center: 'title',
        right: ''
      }
    : {
        left: 'prev,next,today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,dayGridDay,listWeek'
      },

  footerToolbar: isMobile.value
    ? {
        center: 'dayGridMonth,timeGridWeek,listWeek'
      }
    : (false as false),
  editable: true,
  selectable: true,
  events: calendarEvents,
  dateClick(info: DateClickArg) {
    if (Array.isArray(info)) {
      fail('Jadwal telah terisi ' + info)
    } else {
      success('berhasil')
    }
  },
  eventClick(info: EventClickArg) {
    const event = info.event
    const data = event.extendedProps
    console.log(data.customer)
    openSchedule.value = false
  }
}))

const closeEtalase = () => {
  openEtalase.value = !openEtalase
  if (openFilter.value == true) {
    openFilter.value = !openFilter
  }
}

const closeAppointment = () => {
  openAppointment.value = !openAppointment
  if (openFilter.value == true) {
    openFilter.value = !openFilter
  }
  if (openAppointmentForm.value == true) {
    openAppointmentForm.value = !openAppointmentForm
  }
}

const saveAppointment = () => {
  confirm('Apakah isian data sudah benar?', () => {
    openAppointmentForm.value = false
    openAppointment.value = false
    success('Berhasil membuat janji temu')
  })
}

const endChat = () => {
  confirm('Ingin mengakhiri percakapan Budi?', () => {
    success('Berhasil mengakhiri percakapan')
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

interface Appointment {
  date: string
  time: string
  location: string
  customerName: string
  customerPhone: string
  salesName: string
  salesPhone: string
  image: string
  propertyName: string
  type: number
  buildingSize: number
  landSize: number
  floors: number
  carport: number
  bed: number
  bath: number
}

interface BubbleMessage {
  text?: string
  images?: string[]
  product?: Product[]
  barrier?: string
  appointment?: Appointment[]
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
        text: 'Hi saya ingin mencari rumah, apa bisa dibantu rumah yang cocok untuk saya?'
      }
    ],
    dateTime: '16.20'
  },
  {
    type: 'ai',
    message: [
      {
        text: 'Hi! Anda datang di waktu yang tepat. Silahkan deskripsikan rumah yang Anda cari'
      }
    ],
    dateTime: '16.22'
  },
  {
    type: 'user',
    avatar: user2,
    message: [
      {
        text: 'Saya butuh rumah yang cocok untuk keluarga kecil'
      },
      {
        images: [referensi1, referensi2]
      },
      {
        text: 'Berisi 3 kamar untuk 4 orang dan usahakan memiliki 2 kamar mandi'
      },
      {
        text: 'Kalau ada yang dekat masjid dan taman'
      }
    ],
    dateTime: '16.24'
  },
  {
    type: 'ai',
    message: [
      {
        text: 'Baik, saya mengerti kendala yang kamu alami. Berikut saya sarankan beberapa pilihan rumah yang mungkin sesuai dengan keinginan Anda'
      },
      {
        product: [
          {
            image: rumah1,
            name: 'Griya Modern Cluster',
            location: 'Sidoarjo, Jawa Timur',
            type: '36',
            buildingSize: 36,
            landSize: 60,
            bed: 2,
            bath: 1,
            car: 1,
            floors: 1,
            price: formatRupiah(545000000)
          },
          {
            image: rumah2,
            name: 'Modern House Emerald',
            location: 'Malang, Jawa Timur',
            type: '45',
            buildingSize: 45,
            landSize: 84,
            bed: 2,
            bath: 1,
            car: 1,
            floors: 1,
            price: formatRupiah(785000000)
          },
          {
            image: rumah3,
            name: 'Premium Skyline Villa',
            location: 'Surabaya, Jawa Timur',
            type: '70',
            buildingSize: 70,
            landSize: 120,
            bed: 3,
            bath: 2,
            car: 2,
            floors: 2,
            price: formatRupiah(1250000000)
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
        text: 'Mohon maaf atas kendala yang bapak alami, bisa disampaikan kriteria rumah yang ingin Bapak cari?'
      }
    ],
    dateTime: '16.42'
  },
  {
    type: 'user',
    avatar: user2,
    message: [
      {
        text: 'Saya ingin Saya mau cari rumah yang cocok untuk 4 orang dengan 3 kamar dan 2 toilet, kalau bisa yang dekat dengan masjid dan kamar mandi'
      }
    ],
    dateTime: '16.44'
  },
  {
    type: 'cs',
    message: [
      {
        text: 'Mohon maaf sebelumnya dengan siapa saya bicara?'
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
        text: 'Baik Bapak Budi, menjawab persoalan bapak. Kami ada referensi unit yang cocok dengan kriteria Bapak, berlokasi di Surabaya dan merupakan prumahan elit di surabaya timur.'
      },
      {
        product: [
          {
            image: rumah3,
            name: 'Premium Skyline Villa',
            location: 'Surabaya, Jawa Timur',
            type: '70',
            buildingSize: 70,
            landSize: 120,
            bed: 3,
            bath: 2,
            car: 2,
            floors: 2,
            price: formatRupiah(1250000000)
          }
        ]
      },
      {
        text: 'Bagaimana bapak, tertarik dengan unitnya? Atau Bapak ingin lihat lebih detail terkait unit kami?'
      }
    ],
    dateTime: '16.46'
  },
  {
    type: 'user',
    avatar: user2,
    message: [
      {
        text: 'Ya, sepertinya menarik. Bisakah saya lihat unitnya?'
      }
    ],
    dateTime: '16.49'
  },
  {
    type: 'cs',
    message: [
      {
        text: 'Wah tentu sangat bisa, Bapak tinggal sebutkan bersedia untuk visit langung ke unit kami kapan dan akan saya buatkan jadwalnya'
      }
    ],
    dateTime: '16.52'
  },
  {
    type: 'user',
    avatar: user2,
    message: [
      {
        text: 'Tanggal 30 Februari, bisa mbak?'
      }
    ],
    dateTime: '16.54'
  },
  {
    type: 'cs',
    message: [
      {
        text: 'Baik Bapak, saya konfirmasi kembali untuk detail visit unit telah saya buatkan A/N Bapak Budi dan akan dilayani oleh tim sales kami Bapak Andi, dengan detail sebagai berikut. Apakah ada perubahan?'
      },
      {
        appointment: [
          {
            date: 'Kamis, 30 Februari 2026',
            time: '13:00',
            location: 'Jl. Kertajaya Indah no. 32, Surabaya',
            customerName: 'Budi Susanto',
            customerPhone: '0873849242934',
            salesName: 'Andi Permata',
            salesPhone: '0898372844223',
            image: 'https://media.dekoruma.com/article/2024/10/30201434/Model-Rumah-Modern-Minimalis.jpg?resize=800%2C600&ssl=1',
            propertyName: 'Green Lake Residence',
            type: 60,
            buildingSize: 60,
            landSize: 90,
            floors: 2,
            carport: 1,
            bed: 3,
            bath: 2
          }
        ]
      }
    ],
    dateTime: '16.56'
  },
  {
    type: 'user',
    avatar: user2,
    message: [
      {
        text: 'Tidak mbak, sudah benar'
      }
    ],
    dateTime: '16.58'
  },
  {
    type: 'cs',
    message: [
      {
        text: 'Baik Bapak Budi terima kasih atas konfirmasinya. Adakah hal lain yang ingin Bapak tanyakan?'
      }
    ],
    dateTime: '17.00'
  },
  {
    type: 'user',
    avatar: user2,
    message: [
      {
        text: 'Tidak ada mbak, sudah terjawab'
      }
    ],
    dateTime: '17.02'
  },
  {
    type: 'cs',
    message: [
      {
        text: 'Baik Bapak Budi jika tidak ada pertanyaan, terima kasih telah menghubungi kami. Jika ada hal lain yang dibutuhkan di kemudian hari, jangan ragu untuk menghubungi kami kembali. Selamat beraktivitas'
      }
    ],
    dateTime: '17.04'
  },
  {
    type: 'system',
    message: [
      {
        barrier: 'Obrolan dengan CS Maya berakhir'
      }
    ],
    dateTime: '17.05'
  },
  {
    type: 'user',
    avatar: user2,
    message: [
      {
        text: 'Baik, terima kasih mbak'
      }
    ],
    dateTime: '17.06'
  },
  {
    type: 'ai',
    message: [
      {
        text: 'Dengan senang hati'
      }
    ],
    dateTime: '17.06'
  }
])

onMounted(() => {
  isMobile.value = window.innerWidth < 640
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
