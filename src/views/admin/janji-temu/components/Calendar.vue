<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import idLocale from '@fullcalendar/core/locales/id'
import type { CalendarOptions, EventClickArg } from '@fullcalendar/core'
import { ref, onMounted, computed } from 'vue'
import { calendarEvents } from './data'

const isMobile = ref(false)

const emit = defineEmits(['openAppointment'])

const props = defineProps<{
  appointmentOpen?: boolean
}>()

const calendarColClass = computed(() => (props.appointmentOpen ? 'xl:col-span-3' : 'xl:col-span-4'))
const fullCalendarRef = ref<InstanceType<typeof FullCalendar> | null>(null)

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: 'dayGridMonth',
  locale: idLocale,
  height: 'auto',
  contentHeight: 650,
  aspectRatio: 1.8,
  headerToolbar: {
    left: isMobile.value ? 'prev,next' : 'prev,next,today',
    center: 'title',
    right: isMobile.value ? '' : 'dayGridMonth,timeGridWeek,listWeek'
  },
  editable: true,
  selectable: true,
  events: calendarEvents,
  eventClick(info: EventClickArg) {
    refreshCalendar()
    const event = info.event
    const data = event.extendedProps
    emit('openAppointment', { title: event.title, start: event.start!, end: event.end!, ...data })
  }
}))

const refreshCalendar = () => fullCalendarRef.value?.getApi().updateSize()
defineExpose({ refreshCalendar })

onMounted(() => {
  isMobile.value = window.innerWidth < 640
  refreshCalendar()
})
</script>

<template>
  <div :class="calendarColClass" class="h-full transition-all duration-500 min-h-0">
    <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 h-full overflow-hidden">
      <FullCalendar ref="fullCalendarRef" :options="calendarOptions" />
    </div>
  </div>
</template>

<style scoped>
/* FullCalendar Custom Premium Styling */
:deep(.fc) {
  --fc-button-bg-color: #f8fafc;
  --fc-button-border-color: #e2e8f0;
  --fc-button-hover-bg-color: #f1f5f9;
  --fc-button-hover-border-color: #cbd5e1;
  --fc-button-text-color: #475569;
  --fc-button-active-bg-color: #ca6d2c;
  --fc-button-active-border-color: #ca6d2c;
  --fc-border-color: #f1f5f9;
  --fc-today-bg-color: #ca6d2c08;
  --fc-page-bg-color: transparent;
  
  font-family: inherit;
}

:deep(.fc .fc-toolbar-title) {
  font-size: 1.25rem;
  font-weight: 900;
  color: #0f172a;
  text-transform: capitalize;
}

:deep(.fc .fc-button) {
  border-radius: 0.85rem;
  padding: 0.6rem 1rem;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border-width: 1px;
}

:deep(.fc .fc-button-primary:not(:disabled).fc-button-active) {
  color: white;
  box-shadow: 0 10px 15px -3px rgba(202, 109, 44, 0.3);
}

:deep(.fc .fc-button:focus) {
  box-shadow: 0 0 0 3px rgba(202, 109, 44, 0.1) !important;
}

:deep(.fc .fc-col-header-cell) {
  padding: 1rem 0;
  background: #f8fafc50;
}

:deep(.fc .fc-col-header-cell-cushion) {
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #94a3b8;
}

:deep(.fc-daygrid-day-number) {
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  padding: 8px 12px !important;
}

:deep(.fc-daygrid-event) {
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 0.7rem;
  font-weight: 800;
  border: 1px solid #ffedd5;
  background-color: #fff7ed;
  color: #ca6d2c;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

:deep(.fc-v-event) {
  background-color: #fff7ed !important;
  border: 1px solid #ffedd5 !important;
  border-left: 4px solid #ca6d2c !important;
  padding: 4px 6px !important;
  color: #ca6d2c !important;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

:deep(.fc-v-event .fc-event-main) {
  color: #ca6d2c !important;
}

:deep(.fc-timegrid-event-harness) {
  margin-bottom: 2px;
}

:deep(.fc-list-event) {
  cursor: pointer;
}

:deep(.fc-list-event:hover td) {
  background-color: #fff7ed !important;
}

:deep(.fc-list-event-dot) {
  border-color: #ca6d2c !important;
}

:deep(.fc-list-day-cushion) {
  background-color: #f8fafc;
}

:deep(.fc-scrollgrid) {
  border-radius: 1.5rem;
  overflow: hidden;
  border: 1px solid #f1f5f9;
}
</style>
