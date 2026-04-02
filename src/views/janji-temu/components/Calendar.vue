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
import { calendarEvents } from './data'

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
/* CSS bawaan Anda */
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

/* Targetkan tombol FullCalendar dari dalam file kalender ini */
:deep(.fc-button-primary) {
  background-color: var(--color-bejo-500) !important;
  border-color: var(--color-bejo-500) !important;
  color: var(--text-bejo-50, #ffffff) !important;
  text-transform: capitalize; /* Opsional: agar teks tombol lebih rapi */
}

:deep(.fc-button-primary:hover) {
  background-color: var(--color-bejo-600, #0369a1) !important;
  border-color: var(--color-bejo-600, #0369a1) !important;
}

:deep(.fc-button-primary:not(:disabled).fc-button-active),
:deep(.fc-button-primary:not(:disabled):active) {
  background-color: var(--color-bejo-700, #075985) !important;
  border-color: var(--color-bejo-700, #075985) !important;
}
</style>
