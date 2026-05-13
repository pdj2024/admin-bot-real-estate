<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { confirm, success, fail } from '@/utils/sweet-alert'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import idLocale from '@fullcalendar/core/locales/id'
import type { CalendarOptions } from '@fullcalendar/core'
import api from '@/services/axios'

const props = defineProps<{ openAppointment: boolean; appointment: any }>()
const emit = defineEmits(['close', 'refresh', 'openChat'])

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

const saveReschedule = async () => {
  confirm(`Konfirmasi perubahan jadwal ke ${selectedDate.value} pukul ${startTime.value}?`, async () => {
    try {
      await api.put(`/api/janjiTemu/reschedule?no_id=${props.appointment.No_Id}`, {
        Tanggal_Janji: selectedDate.value,
        Waktu_Janji: startTime.value,
        Waktu_Selesai: null,
        Alasan_Batal: 'reschedule by admin'
      }, {
        headers: { 'X-Jenis-User': 'admin' }
      })
      success('Jadwal berhasil diperbarui')
      openRescheduleForm.value = false
      openReschedule.value = false
      emit('refresh')
    } catch {
      fail('Gagal memperbarui jadwal')
    }
  })
}

const handleUpdateStatus = async (newStatus: string) => {
  confirm(`Ubah status progress menjadi ${newStatus}?`, async () => {
    try {
      const payload = { ...props.appointment, Status_Progress: newStatus }
      await api.put(`/api/janjiTemu/update?no_id=${props.appointment.No_Id}`, payload, {
        headers: { 'X-Jenis-User': 'admin' }
      })
      success('Status berhasil diperbarui')
      emit('refresh')
    } catch {
      fail('Gagal memperbarui status')
    }
  })
}

const handleDelete = async () => {
  confirm('Apakah Anda yakin ingin menghapus janji temu ini?', async () => {
    try {
      await api.delete(`/api/janjiTemu/delete?no_id=${props.appointment.No_Id}`, {
        headers: { 'X-Jenis-User': 'admin' }
      })
      success('Janji temu berhasil dihapus')
      emit('refresh')
    } catch {
      fail('Gagal menghapus janji temu')
    }
  })
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
          <!-- Status Badge -->
          <div class="flex justify-center">
            <span 
              class="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm"
              :class="{
                'bg-bejo-50 text-bejo-600 border border-bejo-100': props.appointment.Status_Progress === 'baru',
                'bg-violet-50 text-violet-600 border border-violet-100': props.appointment.Status_Progress === 'dikonfirmasi',
                'bg-blue-50 text-blue-600 border border-blue-100': props.appointment.Status_Progress === 'proses',
                'bg-emerald-50 text-emerald-600 border border-emerald-100': props.appointment.Status_Progress === 'selesai',
                'bg-red-50 text-red-600 border border-red-100': props.appointment.Status_Progress === 'batal',
              }"
            >
              <div class="size-1.5 rounded-full" :class="{
                'bg-bejo-500': props.appointment.Status_Progress === 'baru',
                'bg-violet-500': props.appointment.Status_Progress === 'dikonfirmasi',
                'bg-blue-500': props.appointment.Status_Progress === 'proses',
                'bg-emerald-500': props.appointment.Status_Progress === 'selesai',
                'bg-red-500': props.appointment.Status_Progress === 'batal',
              }"></div>
              {{ props.appointment.Status_Progress }}
            </span>
          </div>

          <!-- Date/Time Segment -->
          <div class="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
            <div class="space-y-1">
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Jadwal Kunjungan</span>
              <div class="text-sm font-black text-slate-900">
                 {{ new Date(props.appointment.Tanggal_Janji).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }) }}
              </div>
            </div>
            <div class="text-right space-y-1">
               <span class="text-[10px] font-black uppercase tracking-widest text-bejo-500">Waktu</span>
               <div class="text-sm font-black text-bejo-600">
                  {{ props.appointment.Waktu_Janji }} WIB
               </div>
            </div>
          </div>

          <!-- Info List -->
          <div class="space-y-6">
            <div>
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Lokasi</span>
              <div class="flex items-start gap-3">
                <Icon icon="lucide:map-pin" class="size-4 text-bejo-500 shrink-0 mt-0.5" />
                <span class="text-sm font-bold text-slate-700">{{ props.appointment.Lokasi_Pertemuan }}</span>
              </div>
            </div>

            <div>
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Tipe Pertemuan</span>
              <div class="flex items-center gap-3">
                <Icon :icon="props.appointment.Tipe_Pertemuan === 'online' ? 'lucide:video' : 'lucide:users'" class="size-4 text-bejo-500" />
                <span class="text-sm font-bold text-slate-700 capitalize">{{ props.appointment.Tipe_Pertemuan }}</span>
              </div>
            </div>

            <div v-if="props.appointment.Alasan_Batal">
              <span class="text-[10px] font-black uppercase tracking-widest text-red-400 block mb-2">Alasan Batal</span>
              <p class="text-sm font-bold text-red-600 italic">"{{ props.appointment.Alasan_Batal }}"</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions (Pinned at Bottom) -->
      <div class="p-8 bg-slate-50/50 border-t border-slate-100 space-y-3 shrink-0">
         <button @click="$emit('openChat', props.appointment.Id_Customer)" class="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm group">
            <Icon icon="lucide:message-circle" class="size-4 group-hover:scale-110 transition-transform" />
            Hubungi Customer
         </button>
         
         <div class="grid grid-cols-2 gap-3">
            <template v-if="props.appointment.Status_Progress === 'baru'">
              <button @click="handleUpdateStatus('dikonfirmasi')" class="px-3 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10">
                 Konfirmasi
              </button>
              <button @click="openReschedule = true" class="px-3 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-slate-900/10">
                 Reschedule
              </button>
            </template>

            <template v-else-if="props.appointment.Status_Progress === 'dikonfirmasi'">
              <button @click="handleUpdateStatus('proses')" class="px-3 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/10">
                 Mulai Proses
              </button>
              <button @click="handleUpdateStatus('batal')" class="px-3 py-3 bg-white border border-slate-200 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                 Batalkan
              </button>
            </template>

            <template v-else-if="props.appointment.Status_Progress === 'proses'">
              <button @click="handleUpdateStatus('selesai')" class="px-3 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10">
                 Selesaikan
              </button>
            </template>

            <template v-else>
              <button @click="handleDelete" class="col-span-2 px-3 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                 Hapus Data
              </button>
            </template>
         </div>
      </div>
    </div>

    <!-- Reschedule Overlay -->
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
