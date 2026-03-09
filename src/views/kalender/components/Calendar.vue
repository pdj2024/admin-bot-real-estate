<template>
  <div :class="calendarColClass">
    <div class="card">
      <div class="card-body">
        <div id="calendar"></div>
        <FullCalendar :options="calendarOptions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg } from '@fullcalendar/core'
import idLocale from '@fullcalendar/core/locales/id'

const emit = defineEmits<{
  (e: 'openAppointment'): void
}>()

// Props dari parent
const props = defineProps<{
  openAppointment: boolean
}>()

// Col class otomatis berubah
const calendarColClass = computed(() => {
  return props.openAppointment ? 'lg:col-span-3' : 'lg:col-span-4'
})

const calendarEvents = [
  { title: 'P. Budi - Griya Asri Residence', start: '2026-03-10T12:00:00', classNames: ['text-warning'] },
  { title: 'P. Hari - Griya Asri Residence', start: '2026-03-11T12:00:00', classNames: ['text-warning'] }
]

const calendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: 'dayGridMonth',
  locale: idLocale,
  headerToolbar: {
    left: 'prev,next,today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,dayGridDay,listWeek'
  },
  editable: true,
  selectable: true,
  events: calendarEvents,
  eventClick(info: EventClickArg) {
    const event = info.event
    alert(`Klik event: ${event.title} pada tanggal ${event.start?.toLocaleDateString('id-ID')}`)
    emit('openAppointment')
  }
}
</script>
