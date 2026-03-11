<template>
  <!-- Modal Event -->
  <div v-if="props.openAppointment" class="col-span-1">
    <div ref="appointmentRef" class="max-w-sm mx-auto bg-white rounded-2xl shadow-lg border border-default-100 overflow-hidden my-4">
      <!-- HEADER DENGAN TOMBOL X -->
      <div class="bg-indigo-600 px-4 py-3 flex justify-between items-center">
        <h3 class="text-white font-semibold text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Detail Janji Temu
        </h3>

        <!-- Tombol X -->
        <button @click.stop="$emit('close')" class="text-white text-sm font-bold hover:text-gray-200">✕</button>
      </div>

      <!-- BODY -->
      <div class="p-5 space-y-4">
        <!-- Tanggal & Waktu -->
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
            <p class="text-sm font-bold text-indigo-600">{{ props.appointment.time }} WIB</p>
          </div>
        </div>

        <!-- Lokasi -->
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

        <!-- Customer & Salesman -->
        <div class="grid grid-cols-2 gap-4 pt-2">
          <div class="bg-default-50 p-2 rounded-lg">
            <p class="text-[10px] uppercase tracking-wider text-default-400">Customer</p>
            <p class="text-sm font-medium text-default-800">{{ props.appointment.customer }}</p>
            <p class="text-[12px] text-default-800">{{ props.appointment.customer_phone }}</p>
          </div>
          <div class="bg-default-50 p-2 rounded-lg">
            <p class="text-[10px] uppercase tracking-wider text-default-400">Salesman</p>
            <p class="text-sm font-medium text-default-800">{{ props.appointment.salesman }}</p>
            <p class="text-[12px] text-default-800">{{ props.appointment.salesman_phone }}</p>
          </div>
        </div>

        <!-- Properti -->
        <div class="space-y-3">
          <div class="flex gap-3 items-center">
            <img :src="props.appointment.picture" alt="rumah" class="w-20 h-16 object-cover rounded-lg" />
            <div class="flex-1">
              <p class="text-[10px] uppercase tracking-wider text-default-400 mb-1">Nama Properti</p>
              <p class="text-sm font-medium text-default-800">{{ props.appointment.property }}</p>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 text-xs text-default-700">
            <div class="bg-default-50 p-2 rounded-lg text-center">
              <p class="uppercase tracking-wider text-[10px] text-default-400 mb-1">Tipe</p>
              <p class="font-medium">{{ props.appointment.type }}</p>
            </div>
            <div class="bg-default-50 p-2 rounded-lg text-center">
              <p class="uppercase tracking-wider text-[10px] text-default-400 mb-1">LB / LT</p>
              <p class="font-medium">{{ props.appointment.lb }}m² / {{ props.appointment.lt }}m²</p>
            </div>
            <div class="bg-default-50 p-2 rounded-lg text-center">
              <p class="uppercase tracking-wider text-[10px] text-default-400 mb-1">Jml Lantai</p>
              <p class="font-medium">{{ props.appointment.jmlLt }} lt</p>
            </div>
            <div class="bg-default-50 p-2 rounded-lg text-center">
              <p class="uppercase tracking-wider text-[10px] text-default-400 mb-1">Carport</p>
              <p class="font-medium">{{ props.appointment.carport }}</p>
            </div>
            <div class="bg-default-50 p-2 rounded-lg text-center">
              <p class="uppercase tracking-wider text-[10px] text-default-400 mb-1">KT</p>
              <p class="font-medium">{{ props.appointment.kt }}</p>
            </div>
            <div class="bg-default-50 p-2 rounded-lg text-center">
              <p class="uppercase tracking-wider text-[10px] text-default-400 mb-1">WC</p>
              <p class="font-medium">{{ props.appointment.wc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="px-5 py-3 bg-default-50 flex gap-2">
        <button @click="closeModal" class="flex-1 text-xs font-semibold py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition">Batal</button>
        <button @click.stop="openReschedule = true" class="flex-1 text-xs font-semibold py-2 rounded-md border bg-green-500 text-white hover:bg-green-600 transition">Re-Schedule</button>
      </div>
    </div>
  </div>

  <div v-if="openReschedule" ref="rescheduleRef" class="z-40 fixed bottom-10 left-1/2 -translate-x-1/2 w-[95vw] sm:w-[650px] sm:bottom-5 sm:right-15 sm:left-auto sm:translate-x-0 bg-white rounded-2xl shadow-2xl py-4 border border-default-100">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4 px-6">
      <h4 class="text-default-900 font-bold text-base">Pilih Jadwal</h4>

      <button @click.stop="openReschedule = false" class="text-default-400 hover:text-default-900 transition-all">
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

  <div v-if="openRescheduleForm" ref="rescheduleFormRef" class="z-50 fixed bottom-55 left-1/2 -translate-x-1/2 w-[95vw] sm:w-[350px] sm:bottom-25 sm:right-15 sm:left-auto sm:translate-x-0 bg-white rounded-2xl shadow-2xl p-4 border border-default-100">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4 px-2">
      <h4 class="text-default-900 font-bold text-base">Form Reschedule</h4>

      <button @click.stop="openRescheduleForm = false" class="text-default-400 hover:text-default-900 transition-all">
        <Icon icon="lucide:x" class="size-5" />
      </button>
    </div>

    <!-- Form -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
      <!-- Nama Customer -->
      <div>
        <label class="text-xs text-default-500 mb-1 block"> Nama Customer </label>
        <input type="text" placeholder="Masukkan nama customer" class="form-input w-full" :value="props.appointment.customer" disabled />
      </div>

      <!-- Nama Sales -->
      <div>
        <label class="text-xs text-default-500 mb-1 block"> Nama Salesman </label>
        <input type="text" placeholder="Masukkan nama sales" class="form-input w-full" :value="props.appointment.salesman" disabled />
      </div>

      <!-- Tanggal -->
      <div>
        <label class="text-xs text-default-500 mb-1 block">Tanggal</label>
        <input type="date" class="form-input w-full" :value="new Date(props.appointment.start).toISOString().slice(0, 10)" />
      </div>

      <!-- Waktu -->
      <div>
        <label class="text-xs text-default-500 mb-1 block"> Waktu </label>
        <input type="time" class="form-input w-full" :value="props.appointment.time" />
      </div>
    </div>

    <!-- Action -->
    <div class="flex justify-end gap-2 mt-6 px-2">
      <button @click.stop="openReschedule = false" class="btn bg-default-200 hover:bg-default-300 text-default-700">Batal</button>

      <button @click="saveReschedule" class="btn bg-green-500 hover:bg-green-600 text-white">Simpan</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { confirmCancel, confirm, success, fail } from '@/utils/sweet-alert'
import { onBeforeUnmount, onMounted, ref, computed, nextTick } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import idLocale from '@fullcalendar/core/locales/id'
import type { CalendarOptions, EventClickArg, CalendarApi, EventApi } from '@fullcalendar/core'
import type { DateClickArg } from '@fullcalendar/interaction'

const rescheduleFormRef = ref<HTMLElement | null>(null)
const rescheduleRef = ref<HTMLElement | null>(null)
const fullCalendarRef = ref<InstanceType<typeof FullCalendar> | null>(null)
const openReschedule = ref(false)
const openRescheduleForm = ref(false)
const isMobile = ref(false)

const props = defineProps<{
  openAppointment: boolean
  appointment: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

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

const saveReschedule = () => {
  confirm('Apakah Anda yakin ingin mengubah jadwal janji temu?', () => {
    openRescheduleForm.value = false
    openReschedule.value = false

    success('Ubah jadwal janji temu berhasil')
  })
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Element

  if (target.closest('.swal2-container')) return

  const clickedInsideCalendar = rescheduleRef.value?.contains(target)
  const clickedInsideForm = rescheduleFormRef.value?.contains(target)

  if (!clickedInsideCalendar && !clickedInsideForm) {
    if (openRescheduleForm.value) {
      openRescheduleForm.value = false
    } else if (openReschedule.value) {
      openReschedule.value = false
    }
  }
}

const calendarEvents = [
  {
    title: 'P. Budi - Griya Asri Residence',
    start: new Date('2026-03-11T12:00:00'),
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
    const calendarApi = fullCalendarRef.value?.getApi()
    if (!calendarApi) return

    const events = calendarApi.getEvents()
    const clickedDate = info.dateStr

    const eventOnDate = events.filter((event) => {
      return event.start?.toISOString().slice(0, 10) === clickedDate
    })

    if (eventOnDate.length > 0) {
      const times = eventOnDate.map((event) =>
        event.start?.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        })
      )

      confirmCancel(
        `Ada ${eventOnDate.length} jadwal di hari yang sama pada jam ${times.join(', ')}`,
        () => {
          nextTick(() => {
            openReschedule.value = true
            openRescheduleForm.value = true
          })
        },
        () => {
          nextTick(() => {
            openReschedule.value = true
            fail('Silahkan pilih tanggal dan waktu lain')
          })
        }
      )
    } else {
      openReschedule.value = true
      openRescheduleForm.value = true
    }
  },
  eventClick(info: EventClickArg) {
    const calendarApi = fullCalendarRef.value?.getApi()
    if (!calendarApi) return

    const events = calendarApi.getEvents()
    const clickedDate = info.event.startStr

    const eventOnDate = events.filter((event) => {
      return event.start?.toISOString().slice(0, 10) === clickedDate
    })

    if (eventOnDate.length > 0) {
      const times = eventOnDate.map((event) =>
        event.start?.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        })
      )

      confirmCancel(
        `Ada ${eventOnDate.length} jadwal di hari yang sama pada jam ${times.join(', ')}`,
        () => {
          nextTick(() => {
            openReschedule.value = true
            openRescheduleForm.value = true
          })
        },
        () => {
          nextTick(() => {
            openReschedule.value = true
            fail('Silahkan pilih tanggal dan waktu lain')
          })
        }
      )
    } else {
      openReschedule.value = true
      openRescheduleForm.value = true
    }
  }
}))

onMounted(() => {
  isMobile.value = window.innerWidth < 640
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
