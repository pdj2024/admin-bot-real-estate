<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import idLocale from '@fullcalendar/core/locales/id'
import type { CalendarOptions, EventClickArg } from '@fullcalendar/core'
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

const isMobile = ref(false)
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const emit = defineEmits(['openAppointment'])

const props = defineProps<{
  appointmentOpen?: boolean
  appointments: any[]
}>()

const calendarEvents = computed(() => {
  return props.appointments.map(item => {
    // Determine color based on Status_Progress
    let color = '#3b82f6' // Blue for 'baru' (pengajuan)
    if (item.Status_Progress === 'selesai') color = '#047857' // Dark Green (emerald-700)
    if (item.Status_Progress === 'batal') color = '#ef4444' // Red
    if (item.Status_Progress === 'proses') color = '#78350f' // Brown (amber-900)
    if (item.Status_Progress === 'dikonfirmasi') color = '#ef8c4c' // Orange Bejo (bejo-500)
    
    let className = 'event-baru'
    if (item.Status_Progress === 'selesai') className = 'event-selesai'
    else if (item.Status_Progress === 'batal') className = 'event-batal'
    else if (item.Status_Progress === 'proses') className = 'event-proses'
    else if (item.Status_Progress === 'dikonfirmasi') className = 'event-dikonfirmasi'

    return {
      id: item.No_Id,
      title: (item.Status_Progress === 'batal' ? ' [BATAL] ' : '') + (item.Nama_Customer || item.Id_Customer), // We might need to join data or the API might provide it
      start: `${item.Tanggal_Janji.split('T')[0]}T${item.Waktu_Janji}`,
      end: item.Waktu_Selesai ? `${item.Tanggal_Janji.split('T')[0]}T${item.Waktu_Selesai}` : undefined,
      color: color,
      classNames: [className],
      extendedProps: {
        ...item
      }
    }
  })
})

const calendarColClass = computed(() => (props.appointmentOpen ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'))
const fullCalendarRef = ref<InstanceType<typeof FullCalendar> | null>(null)

const calendarOptions = computed<CalendarOptions>(() => {
  const width = windowWidth.value
  let aspect = 1.8
  let defaultView = 'dayGridMonth'
  
  if (width < 640) {
    aspect = 0.85 // Taller on mobile portrait
    defaultView = 'listWeek' // List view is vastly superior on compact mobile
  } else if (width < 1024) {
    aspect = 1.25 // Tablet portrait
    defaultView = 'dayGridMonth'
  }

  return {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: defaultView,
    locale: idLocale,
    height: 'auto',
    aspectRatio: aspect,
    headerToolbar: {
      left: width < 768 ? 'prev,next' : 'prev,next,today',
      center: 'title',
      right: width < 768 ? 'dayGridMonth,listWeek' : 'dayGridMonth,timeGridWeek,listWeek'
    },
    editable: true,
    selectable: true,
    dayMaxEvents: width < 640 ? 2 : 3,
    events: calendarEvents.value,
    eventClick(info: EventClickArg) {
      refreshCalendar()
      const event = info.event
      const data = event.extendedProps
      emit('openAppointment', data)
    }
  }
})

const refreshCalendar = () => fullCalendarRef.value?.getApi().updateSize()
defineExpose({ refreshCalendar })

const handleResize = () => {
  windowWidth.value = window.innerWidth
  isMobile.value = window.innerWidth < 768
  refreshCalendar()
}

onMounted(() => {
  windowWidth.value = window.innerWidth
  isMobile.value = window.innerWidth < 768
  window.addEventListener('resize', handleResize)
  setTimeout(() => {
    refreshCalendar()
  }, 100)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div :class="calendarColClass" class="h-full transition-all duration-500 min-h-0">
    <div class="bg-white rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-200/50 h-full overflow-hidden">
      <FullCalendar ref="fullCalendarRef" :options="calendarOptions" />
      
      <!-- Color Legend for Status Categories -->
      <div class="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-3">
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori Status:</span>
        <div class="flex flex-wrap gap-2.5">
          <!-- Baru -->
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold bg-[#eff6ff] border border-[#bfdbfe] text-[#1d4ed8]">
            <span class="size-2 rounded-full bg-[#3b82f6]"></span>
            Baru
          </div>
          <!-- Dikonfirmasi -->
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold bg-[#fef8f4] border border-[#fbe2d2] text-[#c95d18]">
            <span class="size-2 rounded-full bg-[#ef8c4c]"></span>
            Dikonfirmasi
          </div>
          <!-- Proses -->
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold bg-[#fef3c7] border border-[#fde68a] text-[#78350f]">
            <span class="size-2 rounded-full bg-[#92400e]"></span>
            Proses
          </div>
          <!-- Selesai -->
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46]">
            <span class="size-2 rounded-full bg-[#047857]"></span>
            Selesai
          </div>
          <!-- Batal -->
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c]">
            <span class="size-2 rounded-full bg-[#ef4444]"></span>
            Batal
          </div>
        </div>
      </div>
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
  --fc-button-active-bg-color: var(--color-bejo-500);
  --fc-button-active-border-color: var(--color-bejo-500);
  --fc-border-color: #f1f5f9;
  --fc-today-bg-color: color-mix(in srgb, var(--color-bejo-500) 5%, transparent);
  --fc-page-bg-color: transparent;
  
  font-family: inherit;
}

:deep(.fc-header-toolbar) {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.75rem !important;
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
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border-width: 1px;
}

:deep(.fc .fc-button-primary:not(:disabled).fc-button-active) {
  color: white;
  box-shadow: 0 10px 15px -3px color-mix(in srgb, var(--color-bejo-500) 30%, transparent);
}

:deep(.fc .fc-button:focus) {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-bejo-500) 10%, transparent) !important;
}

:deep(.fc .fc-col-header-cell) {
  padding: 1rem 0;
  background: #f8fafc50;
}

:deep(.fc .fc-col-header-cell-cushion) {
  font-size: 0.8rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #94a3b8;
}

:deep(.fc-daygrid-day-number) {
  font-size: 0.9rem;
  font-weight: 700;
  color: #64748b;
  padding: 8px 12px !important;
}

:deep(.fc-daygrid-event) {
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 0.8rem;
  font-weight: 800;
  border: 1px solid var(--color-bejo-100);
  background-color: var(--color-bejo-50);
  color: var(--color-bejo-600);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

:deep(.fc-v-event) {
  background-color: var(--color-bejo-50) !important;
  border: 1px solid var(--color-bejo-100) !important;
  border-left: 4px solid var(--color-bejo-500) !important;
  padding: 4px 6px !important;
  color: var(--color-bejo-600) !important;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

:deep(.fc-v-event .fc-event-main) {
  color: var(--color-bejo-600) !important;
}

:deep(.fc-timegrid-event-harness) {
  margin-bottom: 2px;
}

:deep(.fc-list-event) {
  cursor: pointer;
}

:deep(.fc-list-event:hover td) {
  background-color: var(--color-bejo-50) !important;
}

:deep(.fc-list-event-dot) {
  border-color: var(--color-bejo-500) !important;
}

:deep(.fc-list-day-cushion) {
  background-color: #f8fafc;
}

:deep(.fc-scrollgrid) {
  border-radius: 1.5rem;
  overflow: hidden;
  border: 1px solid #f1f5f9;
}

/* Event Status: baru (Blue for pengajuan) */
:deep(.event-baru) {
  background-color: #eff6ff !important;
  border-color: #bfdbfe !important;
  color: #1d4ed8 !important;
}
:deep(.event-baru.fc-v-event) {
  border-left: 4px solid #3b82f6 !important;
}
:deep(.event-baru .fc-event-main), :deep(.event-baru .fc-event-title) {
  color: #1d4ed8 !important;
}
:deep(.fc-list-event.event-baru:hover td) {
  background-color: #eff6ff !important;
}
:deep(.fc-list-event.event-baru .fc-list-event-dot) {
  border-color: #3b82f6 !important;
}

/* Event Status: dikonfirmasi (Orange Bejo) */
:deep(.event-dikonfirmasi) {
  background-color: #fef8f4 !important;
  border-color: #fbe2d2 !important;
  color: #c95d18 !important;
}
:deep(.event-dikonfirmasi.fc-v-event) {
  border-left: 4px solid #ef8c4c !important;
}
:deep(.event-dikonfirmasi .fc-event-main), :deep(.event-dikonfirmasi .fc-event-title) {
  color: #c95d18 !important;
}
:deep(.fc-list-event.event-dikonfirmasi:hover td) {
  background-color: #fef8f4 !important;
}
:deep(.fc-list-event.event-dikonfirmasi .fc-list-event-dot) {
  border-color: #ef8c4c !important;
}

/* Event Status: proses (Brown) */
:deep(.event-proses) {
  background-color: #fef3c7 !important;
  border-color: #fde68a !important;
  color: #78350f !important;
}
:deep(.event-proses.fc-v-event) {
  border-left: 4px solid #92400e !important;
}
:deep(.event-proses .fc-event-main), :deep(.event-proses .fc-event-title) {
  color: #78350f !important;
}
:deep(.fc-list-event.event-proses:hover td) {
  background-color: #fef3c7 !important;
}
:deep(.fc-list-event.event-proses .fc-list-event-dot) {
  border-color: #78350f !important;
}

/* Event Status: selesai (Dark Green) */
:deep(.event-selesai) {
  background-color: #ecfdf5 !important;
  border-color: #a7f3d0 !important;
  color: #065f46 !important;
}
:deep(.event-selesai.fc-v-event) {
  border-left: 4px solid #047857 !important;
}
:deep(.event-selesai .fc-event-main), :deep(.event-selesai .fc-event-title) {
  color: #065f46 !important;
}
:deep(.fc-list-event.event-selesai:hover td) {
  background-color: #ecfdf5 !important;
}
:deep(.fc-list-event.event-selesai .fc-list-event-dot) {
  border-color: #047857 !important;
}

/* Event Status: batal (Red) */
:deep(.event-batal) {
  background-color: #fef2f2 !important;
  border-color: #fecaca !important;
  color: #b91c1c !important;
}
:deep(.event-batal.fc-v-event) {
  border-left: 4px solid #ef4444 !important;
}
:deep(.event-batal .fc-event-main), :deep(.event-batal .fc-event-title) {
  color: #b91c1c !important;
}
:deep(.fc-list-event.event-batal:hover td) {
  background-color: #fef2f2 !important;
}
:deep(.fc-list-event.event-batal .fc-list-event-dot) {
  border-color: #ef4444 !important;
}

/* Popover More Link Styling */
:deep(.fc-daygrid-more-link) {
  font-size: 0.75rem !important;
  font-weight: 800 !important;
  color: var(--color-bejo-600) !important;
  background-color: var(--color-bejo-50) !important;
  padding: 2px 6px !important;
  border-radius: 6px !important;
  transition: all 0.2s ease !important;
  margin-top: 2px !important;
  display: inline-block !important;
}

:deep(.fc-daygrid-more-link:hover) {
  background-color: var(--color-bejo-100) !important;
  color: var(--color-bejo-700) !important;
  text-decoration: none !important;
}

/* Popover Container Styling */
:deep(.fc-more-popover) {
  border-radius: 24px !important;
  overflow: hidden !important;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
  border: 1px solid #f1f5f9 !important;
  background: #ffffff !important;
  z-index: 50 !important;
}

:deep(.fc-more-popover .fc-popover-header) {
  background: #f8fafc !important;
  padding: 12px 16px !important;
  border-bottom: 1px solid #e2e8f0 !important;
}

:deep(.fc-more-popover .fc-popover-title) {
  font-size: 0.875rem !important;
  font-weight: 800 !important;
  color: #0f172a !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
}

:deep(.fc-more-popover .fc-popover-close) {
  color: #64748b !important;
  opacity: 0.7 !important;
  transition: all 0.2s !important;
}

:deep(.fc-more-popover .fc-popover-close:hover) {
  opacity: 1 !important;
  color: #0f172a !important;
}

:deep(.fc-more-popover .fc-popover-body) {
  padding: 16px !important;
  background: #ffffff !important;
  max-height: 280px !important;
  overflow-y: auto !important;
}

/* Space out events in the popover */
:deep(.fc-more-popover .fc-popover-body .fc-daygrid-event) {
  margin-bottom: 8px !important;
  padding: 6px 10px !important;
}

:deep(.fc-more-popover .fc-popover-body .fc-daygrid-event:last-child) {
  margin-bottom: 0 !important;
}

/* ==========================================================================
   Responsive Overrides for Mobile (412x861) and Tablet Viewports
   ========================================================================== */
@media (max-width: 768px) {
  /* Dynamic Grid layout for header to prevent overlapping/clashing */
  :deep(.fc-header-toolbar) {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    grid-template-areas: 
      "title title"
      "nav views" !important;
    gap: 10px !important;
    margin-bottom: 1.25rem !important;
  }
  
  :deep(.fc-toolbar-chunk:nth-child(1)) {
    grid-area: nav;
    justify-self: start;
    display: flex;
    gap: 4px;
  }
  
  :deep(.fc-toolbar-chunk:nth-child(2)) {
    grid-area: title;
    justify-self: center;
    margin-bottom: 2px;
  }
  
  :deep(.fc-toolbar-chunk:nth-child(3)) {
    grid-area: views;
    justify-self: end;
    display: flex;
    gap: 4px;
  }

  :deep(.fc .fc-toolbar-title) {
    font-size: 1.05rem !important;
  }

  :deep(.fc .fc-button) {
    padding: 0.4rem 0.75rem !important;
    font-size: 0.75rem !important;
    border-radius: 0.65rem !important;
  }

  :deep(.fc-col-header-cell) {
    padding: 0.5rem 0 !important;
  }

  :deep(.fc-col-header-cell-cushion) {
    font-size: 0.7rem !important;
    letter-spacing: 0.05em !important;
  }

  :deep(.fc-daygrid-day-number) {
    font-size: 0.75rem !important;
    padding: 4px 6px !important;
  }

  :deep(.fc-daygrid-event) {
    padding: 2px 4px !important;
    font-size: 0.65rem !important;
    border-radius: 4px !important;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  
  /* Scrollable/Clean FullCalendar scrollgrid wrapper */
  :deep(.fc-scrollgrid) {
    border-radius: 1rem !important;
  }
}

@media (max-width: 480px) {
  :deep(.fc-header-toolbar) {
    gap: 8px !important;
  }
  
  :deep(.fc .fc-toolbar-title) {
    font-size: 0.95rem !important;
  }
  
  :deep(.fc .fc-button) {
    padding: 0.35rem 0.6rem !important;
    font-size: 0.7rem !important;
    border-radius: 0.5rem !important;
  }
}
</style>
