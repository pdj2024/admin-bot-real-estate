<template>
  <div :class="calendarColClass">
    <div class="card">
      <div class="card-body">
        <FullCalendar ref="fullCalendarRef" :options="calendarOptions" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.fc {
  max-width: 100%;
}

.fc-toolbar-title {
  font-size: 16px;
}

.fc-daygrid-day-frame {
  min-height: 90px;
}

@media (max-width: 640px) {
  .fc-toolbar {
    flex-wrap: wrap;
    gap: 6px;
  }
}
</style>

<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import idLocale from '@fullcalendar/core/locales/id'
import type { CalendarOptions, EventClickArg } from '@fullcalendar/core'
import type { DateClickArg } from '@fullcalendar/interaction'
import { ref, onMounted, computed } from 'vue'
import { success } from '@/utils/sweet-alert'

const isMobile = ref(false)

const emit = defineEmits<{
  (
    e: 'openAppointment',
    data: {
      title: string
      start: Date
      end: Date
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
      carport: number
      floors: number
      bedrooms: number
      bathrooms: number
    }
  ): void
}>()

// props untuk dynamic col-span
const props = defineProps<{
  appointmentOpen?: boolean
}>()

const calendarColClass = computed(() => (props.appointmentOpen ? 'lg:col-span-3' : 'lg:col-span-4'))

const fullCalendarRef = ref<InstanceType<typeof FullCalendar> | null>(null)

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
  eventClick(info: EventClickArg) {
    refreshCalendar()
    const event = info.event
    const data = event.extendedProps

    emit('openAppointment', {
      title: event.title,
      start: event.start!,
      end: event.end!,
      location: data.location,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      salesName: data.salesName,
      salesPhone: data.salesPhone,
      image: data.image,
      propertyName: data.propertyName,
      type: data.type,
      buildingSize: data.buildingSize,
      landSize: data.landSize,
      carport: data.carport,
      floors: data.floors,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms
    })
  },
  eventDidMount: (info) => {
    const event = info.event
    const data = event.extendedProps
    console.log(info.event)
    info.el.setAttribute('title', info.event.title)
  }
}))

// gunakan defineExpose untuk parent bisa memanggil fungsi refresh
const refreshCalendar = () => {
  fullCalendarRef.value?.getApi().updateSize()
}
defineExpose({ refreshCalendar })

onMounted(() => {
  isMobile.value = window.innerWidth < 640
  refreshCalendar()
})
</script>
