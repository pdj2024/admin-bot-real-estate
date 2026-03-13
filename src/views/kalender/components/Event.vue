<template>
  <div v-if="props.openAppointment" class="col-span-1">
    <div ref="appointmentRef" class="max-w-sm mx-auto bg-white rounded-2xl shadow-lg border border-default-100 overflow-hidden my-4">
      <div class="bg-indigo-600 px-4 py-3 flex justify-between items-center">
        <h3 class="text-white font-semibold text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Detail Janji Temu
        </h3>
        <button @click.stop="$emit('close')" class="text-white text-sm font-bold hover:text-gray-200">✕</button>
      </div>

      <div class="p-5 space-y-4">
        <div class="flex justify-between items-center border-b border-default-50 pb-3">
          <div>
            <p class="text-[10px] uppercase tracking-wider text-default-400">Tanggal</p>
            <p class="text-sm font-bold text-default-800">
              {{
                new Date(props.appointment.start).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })
              }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-[10px] uppercase tracking-wider text-default-400">Waktu</p>
            <p class="text-sm font-bold text-indigo-600">{{ new Date(props.appointment.start).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }} - {{ new Date(props.appointment.end).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }} WIB</p>
          </div>
        </div>

        <div>
          <p class="text-[10px] uppercase tracking-wider text-default-400 mb-1">Lokasi Unit</p>
          <div class="flex gap-2 items-start">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
            </svg>
            <p class="text-sm text-default-700 leading-relaxed">
              {{ props.appointment.location }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 pt-2">
          <div class="bg-default-50 p-2 rounded-lg">
            <p class="text-[10px] uppercase tracking-wider text-default-400">Customer</p>
            <p class="text-sm font-medium text-default-800">{{ props.appointment.customerName }}</p>
            <p class="text-[12px] text-default-600">{{ props.appointment.customerPhone }}</p>
          </div>
          <div class="bg-default-50 p-2 rounded-lg">
            <p class="text-[10px] uppercase tracking-wider text-default-400">Salesman</p>
            <p class="text-sm font-medium text-default-800">{{ props.appointment.salesName }}</p>
            <p class="text-[12px] text-default-600">{{ props.appointment.salesPhone }}</p>
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex gap-3 items-center">
            <img :src="props.appointment.image" alt="rumah" class="w-20 h-16 object-cover rounded-lg bg-gray-100" />
            <div class="flex-1">
              <p class="text-[10px] uppercase tracking-wider text-default-400 mb-1">Nama Properti</p>
              <p class="text-sm font-medium text-default-800">{{ props.appointment.propertyName }}</p>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 text-xs text-default-700">
            <div class="bg-default-50 p-2 rounded-lg text-center">
              <p class="uppercase tracking-wider text-[10px] text-default-400 mb-1">Tipe</p>
              <p class="font-medium">{{ props.appointment.type }}</p>
            </div>
            <div class="bg-default-50 p-2 rounded-lg text-center">
              <p class="uppercase tracking-wider text-[10px] text-default-400 mb-1">LB / LT</p>
              <p class="font-medium">{{ props.appointment.buildingSize }}m² / {{ props.appointment.landSize }}m²</p>
            </div>
            <div class="bg-default-50 p-2 rounded-lg text-center">
              <p class="uppercase tracking-wider text-[10px] text-default-400 mb-1">Lantai</p>
              <p class="font-medium">{{ props.appointment.floors }} lt</p>
            </div>
            <div class="bg-default-50 p-2 rounded-lg text-center">
              <p class="uppercase tracking-wider text-[10px] text-default-400 mb-1">Carport</p>
              <p class="font-medium">{{ props.appointment.carport }}</p>
            </div>
            <div class="bg-default-50 p-2 rounded-lg text-center">
              <p class="uppercase tracking-wider text-[10px] text-default-400 mb-1">KT</p>
              <p class="font-medium">{{ props.appointment.bedrooms }}</p>
            </div>
            <div class="bg-default-50 p-2 rounded-lg text-center">
              <p class="uppercase tracking-wider text-[10px] text-default-400 mb-1">WC</p>
              <p class="font-medium">{{ props.appointment.bathrooms }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="px-5 py-3 bg-default-50 flex gap-2">
        <button @click="closeModal" class="flex-1 text-xs font-semibold py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition">Batal</button>
        <button @click.stop="openReschedule = true" class="flex-1 text-xs font-semibold py-2 rounded-md border bg-green-500 text-white hover:bg-green-600 transition">Re-Schedule</button>
      </div>
    </div>
  </div>

  <div v-if="openReschedule" ref="rescheduleRef" class="z-40 fixed bottom-30 left-1/2 -translate-x-1/2 w-[95vw] sm:w-[650px] sm:bottom-5 sm:right-95 sm:left-auto sm:translate-x-0 bg-white rounded-2xl shadow-2xl py-4 border border-default-100">
    <div class="flex items-center justify-between mb-4 px-6">
      <h4 class="text-default-900 font-bold text-base">Pilih Jadwal Baru</h4>
      <button @click.stop="openReschedule = false" class="text-default-400 hover:text-default-900 transition-all">
        <Icon icon="lucide:x" class="size-5" />
      </button>
    </div>
    <div class="px-4">
      <FullCalendar ref="fullCalendarRef" :options="calendarOptions" />
    </div>
  </div>

  <div v-if="openRescheduleForm" ref="rescheduleFormRef" class="z-50 fixed bottom-55 left-1/2 -translate-x-1/2 w-[95vw] sm:w-[350px] sm:bottom-30 sm:right-95 sm:left-auto sm:translate-x-0 bg-white rounded-2xl shadow-2xl p-4 border border-default-100">
    <div class="flex items-center justify-between mb-4 px-2">
      <h4 class="text-default-900 font-bold text-base">Form Reschedule</h4>
      <button @click.stop="((openRescheduleForm = false), (isPopup = false))" class="text-default-400 hover:text-default-900 transition-all">
        <Icon icon="lucide:x" class="size-5" />
      </button>
    </div>

    <div class="grid grid-cols-1 gap-4 px-2">
      <div>
        <label class="text-xs text-default-500 mb-1 block"> Nama Customer </label>
        <input type="text" class="form-input w-full bg-gray-50" :value="props.appointment.customerName" disabled />
      </div>
      <div>
        <label class="text-xs text-default-500 mb-1 block"> Nama Salesman </label>
        <input type="text" class="form-input w-full bg-gray-50" :value="props.appointment.salesName" disabled />
      </div>
    </div>
    <div class="grid grid-cols-1 gap-4 px-2">
      <div>
        <label class="text-xs text-default-500 mb-1 block">Tanggal Terpilih</label>
        <input type="date" class="form-input w-full bg-gray-50 cursor-not-allowed" v-model="selectedDate" readonly />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs text-default-500 mb-1 block">Jam Mulai</label>
          <input type="time" v-model="startTime" class="form-input w-full" :class="{ 'border-red-500': scheduleError }" />
        </div>
        <div>
          <label class="text-xs text-default-500 mb-1 block">Jam Selesai</label>
          <input type="time" v-model="endTime" class="form-input w-full" :class="{ 'border-red-500': scheduleError }" />
        </div>
      </div>

      <div v-if="scheduleError" class="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <p class="text-xs text-red-700 font-medium">{{ scheduleError }}</p>
      </div>

      <div v-else-if="startTime && endTime" class="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <p class="text-xs text-green-700 font-medium">Jadwal tersedia untuk dipilih.</p>
      </div>
    </div>

    <div class="flex justify-end gap-2 mt-6 px-2">
      <button @click.stop="((openRescheduleForm = false), (isPopup = false))" class="btn bg-default-200 hover:bg-default-300 text-default-700">Batal</button>
      <button @click="saveReschedule" class="btn bg-green-500 hover:bg-green-600 text-white">Simpan Jadwal</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { confirmCancel, confirm, success, fail } from '@/utils/sweet-alert'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import idLocale from '@fullcalendar/core/locales/id'
import type { CalendarOptions } from '@fullcalendar/core'

// --- STATE ---
const props = defineProps<{ openAppointment: boolean; appointment: any }>()
const emit = defineEmits(['close', 'update'])

const rescheduleRef = ref<HTMLElement | null>(null)
const rescheduleFormRef = ref<HTMLElement | null>(null)
const fullCalendarRef = ref<InstanceType<typeof FullCalendar> | null>(null)

const openReschedule = ref(false)
const openRescheduleForm = ref(false)
const isMobile = ref(false)
const isPopup = ref(false)

const selectedDate = ref('')
const startTime = ref('')
const endTime = ref('')

// --- DATA (Diringkas, sebaiknya pindahkan ke file lain jika terlalu panjang) ---

const calendarEvents = [
  {
    title: 'P. Budi - Griya Asri Residence',
    start: new Date('2026-03-11T12:00:00'),
    end: new Date('2026-03-11T15:00:00'),
    extendedProps: {
      location: 'Jl Hidup Liku-liku, Surabaya',
      customerName: 'Budi Santoso',
      customerPhone: '0873482453534',
      salesName: 'Andi Pratama',
      salesPhone: '081355667788',
      image: 'https://media.dekoruma.com/article/2024/10/30201434/Model-Rumah-Modern-Minimalis.jpg?resize=800%2C600&ssl=1',
      propertyName: 'Griya Asri Residence',
      type: 45,
      buildingSize: 45,
      landSize: 60,
      carport: 1,
      floors: 1,
      bedrooms: 2,
      bathrooms: 1
    }
  },
  {
    title: 'P. Herman - Griya Asri Residence',
    start: new Date('2026-03-11T10:30:00'),
    end: new Date('2026-03-11T12:30:00'),
    extendedProps: {
      location: 'Jl Raya Darmo, Surabaya',
      customerName: 'Herman Wijaya',
      customerPhone: '081233445566',
      salesName: 'Andi Pratama',
      salesPhone: '081355667788',
      image: 'https://cdn1-production-images-kly.akamaized.net/7jfLlyvz6P_0Dh-KvXCFs5tf5jc=/1280x720/smart/filters:quality(75):strip_icc()/kly-media-production/medias/5214975/original/088768800_1746786001-7ba6160f-c619-4160-8633-7f463565afca.jpg',
      propertyName: 'Griya Asri Residence',
      type: 45,
      buildingSize: 45,
      landSize: 72,
      carport: 1,
      floors: 1,
      bedrooms: 2,
      bathrooms: 1
    }
  },
  {
    title: 'P. Siti - Green Lake Residence',
    start: new Date('2026-03-12T09:00:00'),
    end: new Date('2026-03-12T11:00:00'),
    extendedProps: {
      location: 'Jl Ahmad Yani, Surabaya',
      customerName: 'Siti Rahma',
      customerPhone: '081311223344',
      salesName: 'Bima Kurniawan',
      salesPhone: '081355667788',
      image: 'https://static.promediateknologi.id/crop/0x28:1143x716/0x0/webp/photo/p2/239/2025/02/06/desain-rumah-minimalis-tahun-2024-1452919504.jpg',
      propertyName: 'Green Lake Residence',
      type: 60,
      buildingSize: 60,
      landSize: 90,
      carport: 1,
      floors: 2,
      bedrooms: 3,
      bathrooms: 2
    }
  },
  {
    title: 'P. Dodi - Green Lake Residence',
    start: new Date('2026-03-13T13:00:00'),
    end: new Date('2026-03-13T15:00:00'),
    extendedProps: {
      location: 'Jl Ketintang, Surabaya',
      customerName: 'Dodi Kurniawan',
      customerPhone: '082155667788',
      salesName: 'Bima Kurniawan',
      salesPhone: '081355667788',
      image: 'https://sn-studio.id/wp-content/uploads/2025/11/rumah-minimalis-sederhana-pak-joko.jpg',
      propertyName: 'Green Lake Residence',
      type: 70,
      buildingSize: 70,
      landSize: 100,
      carport: 2,
      floors: 2,
      bedrooms: 3,
      bathrooms: 2
    }
  },
  {
    title: 'B. Rina - Bukit Indah Residence',
    start: new Date('2026-03-14T11:00:00'),
    end: new Date('2026-03-14T13:00:00'),
    extendedProps: {
      location: 'Jl Manyar, Surabaya',
      customerName: 'Rina Putri',
      customerPhone: '081299887766',
      salesName: 'Yeni Anggraeni',
      salesPhone: '081355667788',
      image: 'https://www.emporioarchitect.com/img/blog/mengenal-lebih-dekat-mengenai-desain-rumah-minimalis-230622011359661434.jpg',
      propertyName: 'Bukit Indah Residence',
      type: 45,
      buildingSize: 45,
      landSize: 65,
      carport: 1,
      floors: 1,
      bedrooms: 2,
      bathrooms: 1
    }
  },
  {
    title: 'P. Agus - Bukit Indah Residence',
    start: new Date('2026-03-15T15:00:00'),
    end: new Date('2026-03-15T17:00:00'),
    extendedProps: {
      location: 'Jl Merr, Surabaya',
      customerName: 'Agus Salim',
      customerPhone: '082233441122',
      salesName: 'Yeni Anggraeni',
      salesPhone: '081355667788',
      image: 'https://i0.wp.com/www.emporioarchitect.com/upload/portofolio/1280/desain-rumah-modern-2-setengah-lantai-24131022-85791957131022093203-0.jpg',
      propertyName: 'Bukit Indah Residence',
      type: 60,
      buildingSize: 60,
      landSize: 84,
      carport: 1,
      floors: 2,
      bedrooms: 3,
      bathrooms: 2
    }
  },
  {
    title: 'P. Fajar - Grand Taman Residence',
    start: new Date('2026-03-16T09:30:00'),
    end: new Date('2026-03-16T11:30:00'),
    extendedProps: {
      location: 'Jl Ahmad Dahlan, Sidoarjo',
      customerName: 'Fajar Nugroho',
      customerPhone: '087811223344',
      salesName: 'Andi Pratama',
      salesPhone: '081355667788',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWQq8cL70yyFxVkLMaLVPFOXby-Ra7iGQOug&s',
      propertyName: 'Grand Taman Residence',
      type: 50,
      buildingSize: 50,
      landSize: 70,
      carport: 1,
      floors: 1,
      bedrooms: 2,
      bathrooms: 1
    }
  },
  {
    title: 'B. Maya - Grand Taman Residence',
    start: new Date('2026-03-17T14:00:00'),
    end: new Date('2026-03-17T16:00:00'),
    extendedProps: {
      location: 'Jl Taman Sari, Sidoarjo',
      customerName: 'Maya Sari',
      customerPhone: '081266778899',
      salesName: 'Bima Kurniawan',
      salesPhone: '081355667788',
      image: 'https://asset2.morefurniture.id/NEWS/2025/2/Rumah%20Minimalis%20dengan%20Atap%20Skillion%20Ganda.jpg',
      propertyName: 'Grand Taman Residence',
      type: 65,
      buildingSize: 65,
      landSize: 95,
      carport: 2,
      floors: 2,
      bedrooms: 3,
      bathrooms: 2
    }
  },
  {
    title: 'P. Joko - Permata Indah Residence',
    start: new Date('2026-03-18T10:00:00'),
    end: new Date('2026-03-18T12:00:00'),
    extendedProps: {
      location: 'Jl Diponegoro, Surabaya',
      customerName: 'Joko Susilo',
      customerPhone: '081355667788',
      salesName: 'Yeni Anggraeni',
      salesPhone: '081355667788',
      image: 'https://arsitekmasterpiece.co.id/wp-content/uploads/2024/09/Model-Rumah-Minimalis-Sederhana-di-Desa.jpg',
      propertyName: 'Permata Indah Residence',
      type: 45,
      buildingSize: 45,
      landSize: 60,
      carport: 1,
      floors: 1,
      bedrooms: 2,
      bathrooms: 1
    }
  },
  {
    title: 'B. Lina - Permata Indah Residence',
    start: new Date('2026-03-19T16:00:00'),
    end: new Date('2026-03-19T18:00:00'),
    extendedProps: {
      location: 'Jl Rungkut, Surabaya',
      customerName: 'Lina Marlina',
      customerPhone: '082199887766',
      salesName: 'Andi Pratama',
      salesPhone: '081355667788',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwYgootRmQUBlII_rMpvQEM4KOm2D9bkS8dw&s',
      propertyName: 'Permata Indah Residence',
      type: 70,
      buildingSize: 70,
      landSize: 110,
      carport: 2,
      floors: 2,
      bedrooms: 3,
      bathrooms: 2
    }
  }
]

// --- HELPERS ---
const getToday = () => new Date().toLocaleDateString('en-CA')

const isTimeConflict = (d: string, s: string, e: string) => {
  if (!d || !s || !e) return false
  const uS = new Date(`${d}T${s}:00`),
    uE = new Date(`${d}T${e}:00`)
  if (uE <= uS) return true
  return calendarEvents.some((ev) => uS < new Date(ev.end) && uE > new Date(ev.start))
}

// --- LOGIC ---
const scheduleError = computed(() => {
  if (!selectedDate.value || !startTime.value || !endTime.value) return null
  const min = '07:00',
    max = '20:00'
  if (startTime.value < min || endTime.value > max) return `Jam operasional: ${min} - ${max} WIB`
  if (endTime.value <= startTime.value) return 'Jam selesai harus lebih besar'
  if (isTimeConflict(selectedDate.value, startTime.value, endTime.value)) return 'Waktu sudah terisi jadwal lain'
  return null
})

const handleScheduleClick = (rawDate: string | null | undefined) => {
  if (isPopup.value || !rawDate) return
  const datePart = rawDate.split('T')[0]
  if (datePart < getToday()) return fail('Tidak dapat memilih tanggal lampau.')

  selectedDate.value = datePart
  const events = fullCalendarRef.value
    ?.getApi()
    .getEvents()
    .filter((e) => e.start?.toLocaleDateString('en-CA') === datePart)

  if (events?.length) {
    const times = events.map((e) => `${e.start?.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}-${e.end?.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`).join(', ')
    isPopup.value = true
    confirmCancel(
      `${datePart === getToday() ? 'Hari ini' : 'Tanggal ' + datePart} ada jadwal: ${times}. Lanjut?`,
      () => {
        openRescheduleForm.value = true
        isPopup.value = false
      },
      () => {
        isPopup.value = false
      }
    )
  } else {
    openRescheduleForm.value = true
  }
}

const saveReschedule = () => {
  if (scheduleError.value) return fail(scheduleError.value)
  confirm(`Konfirmasi reschedule ke ${selectedDate.value} pkl ${startTime.value}-${endTime.value}?`, () => {
    success('Jadwal diperbarui')
    openRescheduleForm.value = false
    openReschedule.value = true
    emit('close')
  })
}

// --- UI EVENT ---
const handleClickOutside = (e: MouseEvent) => {
  if ((e.target as Element).closest('.swal2-container')) return
  if (!rescheduleRef.value?.contains(e.target as Node) && !rescheduleFormRef.value?.contains(e.target as Node)) {
    if (openRescheduleForm.value) {
      openRescheduleForm.value = false
      isPopup.value = false
    } else if (openReschedule.value) openReschedule.value = false
  }
}

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: 'dayGridMonth',
  locale: idLocale,
  events: calendarEvents,
  headerToolbar: isMobile.value ? { left: 'prev,next', center: 'title' } : { left: 'prev,next,today', center: 'title', right: 'dayGridMonth,timeGridWeek,listWeek' },
  dateClick: (info) => handleScheduleClick(info.dateStr),
  eventClick: (info) => handleScheduleClick(info.event.startStr)
}))

const closeModal = () => {
  confirmCancel(
    'Apakah Anda yakin ingin membatalkan janji temu?',
    () => {
      emit('close')
      success('Pembatalan janji temu berhasil')
    },
    () => {
      emit('close')
    }
  )
}

onMounted(() => {
  isMobile.value = window.innerWidth < 640
  document.addEventListener('click', handleClickOutside)
})
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>
