<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { confirmCancel, confirm, success } from '@/utils/sweet-alert'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import idLocale from '@fullcalendar/core/locales/id'
import type { CalendarOptions } from '@fullcalendar/core'

const props = defineProps<{ openAppointment: boolean; appointment: any }>()
const emit = defineEmits(['close', 'update', 'openChat'])

const openReschedule = ref(false)
const openRescheduleForm = ref(false)
const selectedDate = ref('')
const startTime = ref('')

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: idLocale,
  height: 'auto',
  selectable: true,
  dateClick: (info) => {
    selectedDate.value = info.dateStr
    openRescheduleForm.value = true
  }
}))

const saveReschedule = () => {
  confirm(`Konfirmasi perubahan jadwal ke ${selectedDate.value}?`, () => {
    success('Jadwal berhasil diperbarui')
    openRescheduleForm.value = false
    openReschedule.value = false
    emit('close')
  })
}

const closeModal = () => {
  confirmCancel('Batalkan janji temu ini?', () => {
    emit('close')
    success('Janji temu dibatalkan')
  }, () => {})
}
</script>

<template>
  <div v-if="props.openAppointment" class="h-full">
    <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/60 overflow-hidden h-full flex flex-col">
      <!-- Header -->
      <div class="bg-slate-900 p-6 flex justify-between items-center text-white shrink-0">
        <div class="flex items-center gap-3">
          <div class="size-10 rounded-xl bg-bejo-500/20 flex items-center justify-center border border-bejo-500/30">
            <Icon icon="lucide:calendar-check" class="size-6 text-bejo-400" />
          </div>
          <h3 class="font-black text-sm uppercase tracking-widest">Detail Janji</h3>
        </div>
        <button @click="$emit('close')" class="size-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
          <Icon icon="lucide:x" class="size-5" />
        </button>
      </div>

      <!-- Scrollable Content Area -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div class="p-8 space-y-8">
          <!-- Date/Time Segment -->
          <div class="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
            <div class="space-y-1">
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Jadwal Kunjungan</span>
              <div class="text-sm font-black text-slate-900">
                 {{ new Date(props.appointment.start).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }) }}
              </div>
            </div>
            <div class="text-right space-y-1">
               <span class="text-[10px] font-black uppercase tracking-widest text-bejo-500">Waktu</span>
               <div class="text-sm font-black text-bejo-600">
                  {{ new Date(props.appointment.start).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }} WIB
               </div>
            </div>
          </div>

          <!-- Property Card -->
          <div class="space-y-4">
            <div class="flex items-center gap-4">
               <img :src="props.appointment.image" class="size-20 rounded-2xl object-cover shadow-lg" />
               <div class="min-w-0">
                  <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Unit Properti</span>
                  <h4 class="text-sm font-black text-slate-900 truncate">{{ props.appointment.propertyName }}</h4>
                  <div class="flex items-center gap-1.5 mt-1">
                     <Icon icon="lucide:map-pin" class="size-3 text-bejo-500" />
                     <span class="text-[10px] font-bold text-slate-500 truncate">{{ props.appointment.location }}</span>
                  </div>
               </div>
            </div>
          </div>

          <!-- Agent -->
          <div class="pt-6 border-t border-slate-50">
             <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Agen Pendamping</span>
             <div class="flex items-center gap-4 p-4 bg-bejo-50/50 rounded-2xl border border-bejo-100">
                <div class="size-10 rounded-xl bg-bejo-500 flex items-center justify-center font-black text-white shadow-lg shadow-bejo-500/20">
                   {{ props.appointment.salesName.charAt(0) }}
                </div>
                <div class="min-w-0">
                   <div class="text-sm font-black text-slate-900 truncate">{{ props.appointment.salesName }}</div>
                   <div class="text-[10px] font-bold text-slate-500">{{ props.appointment.salesPhone }}</div>
                </div>
             </div>
          </div>

          <!-- Specs -->
          <div class="grid grid-cols-2 gap-3">
             <div class="p-3 bg-slate-50 rounded-2xl text-center border border-slate-100">
                <span class="text-[9px] font-black uppercase tracking-wider text-slate-400">LT / LB</span>
                <div class="text-xs font-black text-slate-800">{{ props.appointment.landSize }} / {{ props.appointment.buildingSize }} m²</div>
             </div>
             <div class="p-3 bg-slate-50 rounded-2xl text-center border border-slate-100">
                <span class="text-[9px] font-black uppercase tracking-wider text-slate-400">Kamar</span>
                <div class="text-xs font-black text-slate-800">{{ props.appointment.bedrooms }} KT / {{ props.appointment.bathrooms }} KM</div>
             </div>
          </div>
        </div>
      </div>

      <!-- Actions (Pinned at Bottom) -->
      <div class="p-8 bg-slate-50/50 border-t border-slate-100 space-y-3 shrink-0">
         <button @click="$emit('openChat', props.appointment.customerId)" class="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm group">
            <Icon icon="lucide:message-circle" class="size-4 group-hover:scale-110 transition-transform" />
            Hubungi Kami
         </button>
         <div class="grid grid-cols-2 gap-3">
            <button @click="closeModal" class="px-3 py-3 bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
               Batalkan
            </button>
            <button @click="openReschedule = true" class="px-3 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-slate-900/10">
               Reschedule
            </button>
         </div>
      </div>
    </div>

    <!-- Reschedule Overlay (Simple version for now) -->
    <div v-if="openReschedule" class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
       <div class="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in duration-300">
          <div class="flex justify-between items-center mb-8">
             <h4 class="text-xl font-black text-slate-900">Pilih Jadwal Baru</h4>
             <button @click="openReschedule = false" class="text-slate-400 hover:text-slate-900"><Icon icon="lucide:x" class="size-6" /></button>
          </div>
          <FullCalendar :options="calendarOptions" class="mb-8" />
          <div v-if="openRescheduleForm" class="space-y-6">
             <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Tanggal</label>
                  <input v-model="selectedDate" type="date" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                </div>
                <div>
                  <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Pukul</label>
                  <input v-model="startTime" type="time" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                </div>
             </div>
             <button @click="saveReschedule" class="w-full py-4 bg-bejo-500 hover:bg-bejo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-bejo-500/30">
                Simpan Jadwal Baru
             </button>
          </div>
       </div>
    </div>
  </div>
</template>
