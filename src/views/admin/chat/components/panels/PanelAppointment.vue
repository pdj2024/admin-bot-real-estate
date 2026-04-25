<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { defineAsyncComponent } from 'vue'

const FullCalendar = defineAsyncComponent(() => import('@fullcalendar/vue3'))

const props = defineProps<{
  showAppointmentModal: boolean
  appointmentForm: any
  appointmentCalendarOptions: any
}>()

const emit = defineEmits<{
  (e: 'update:formTanggal', val: string): void
  (e: 'update:formWaktu', val: string): void
  (e: 'update:formNamaLengkap', val: string): void
  (e: 'update:formNoTelp', val: string): void
  (e: 'update:formCatatan', val: string): void
  (e: 'close'): void
  (e: 'save'): void
}>()
</script>

<template>
  <div v-show="showAppointmentModal" class="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-8">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="emit('close')" />

    <div class="relative w-full max-w-6xl max-h-[94vh] bg-white rounded-[2rem] shadow-2xl shadow-slate-900/20 flex flex-col overflow-hidden z-10 animate-fade-in-up">
      <div class="shrink-0 flex items-center justify-between px-6 md:px-8 py-4 md:py-5 border-b border-slate-100 bg-white">
        <div class="flex items-center gap-3">
          <div class="size-10 rounded-2xl bg-gradient-to-br from-bejo-50 to-bejo-100 flex items-center justify-center text-bejo-600 shadow-sm shadow-bejo-500/10">
            <Icon icon="lucide:calendar-plus" class="size-5" />
          </div>
          <div>
            <h3 class="text-slate-900 font-black text-base md:text-lg tracking-tight leading-none">Buat Janji Temu</h3>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 hidden sm:block">Klik tanggal pada kalender · Abu-abu = sudah ada jadwal</p>
          </div>
        </div>
        <button @click="emit('close')" class="size-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90">
          <Icon icon="lucide:x" class="size-5" />
        </button>
      </div>

      <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_380px] overflow-hidden">
        <!-- Main Calendar Content Right -->
        <div class="overflow-y-auto p-4 md:p-8 bg-white custom-scrollbar flex flex-col">
          <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 border border-slate-200 px-4 py-2 rounded-full"><span class="size-2 rounded-full bg-slate-400 shrink-0"></span>Terisi</span>
              <span class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-bejo-600 bg-bejo-50 border border-bejo-100 px-4 py-2 rounded-full"><span class="size-2 rounded-full bg-bejo-500 shrink-0"></span>Tersedia</span>
            </div>
            <Transition enter-active-class="transition duration-300" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
              <div v-if="appointmentForm.tanggal" class="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-2.5 rounded-2xl shadow-sm">
                <Icon icon="lucide:check-circle" class="size-4" />
                <span class="text-[11px] font-black uppercase tracking-widest">Dipilih: {{ appointmentForm.tanggal }}</span>
              </div>
            </Transition>
          </div>

          <div class="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-900/5 overflow-hidden p-2 md:p-6 transition-all hover:shadow-2xl hover:shadow-slate-900/10">
            <FullCalendar :options="appointmentCalendarOptions" />
          </div>
        </div>
        <!-- Sidebar Form Left -->
        <div class="overflow-y-auto p-5 md:p-7 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/40 custom-scrollbar flex flex-col">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Detail Janji Temu</p>
          <div class="space-y-4 flex-1">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tanggal Terpilih</label>
              <div class="relative">
                <Icon icon="lucide:calendar" class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4" :class="appointmentForm.tanggal ? 'text-bejo-500' : 'text-slate-300'" />
                <input
                  type="text"
                  :value="appointmentForm.tanggal ? new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(appointmentForm.tanggal)) : 'Pilih pada kalender...'"
                  disabled
                  class="w-full rounded-2xl py-3 pl-11 pr-11 text-sm font-bold cursor-not-allowed shadow-inner transition-colors"
                  :class="appointmentForm.tanggal ? 'bg-bejo-50 border border-bejo-200 text-bejo-700' : 'bg-slate-50 border border-slate-100 text-slate-400'"
                />
                <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-75" enter-to-class="opacity-100 scale-100">
                  <span v-if="appointmentForm.tanggal" class="absolute right-3.5 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center bg-bejo-500 rounded-full shadow-lg shadow-bejo-500/20"><Icon icon="lucide:check" class="size-3.5 text-white" /></span>
                </Transition>
              </div>
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Waktu <span class="text-red-400">*</span></label>
              <div class="relative group">
                <Icon icon="lucide:clock" class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 group-focus-within:text-bejo-500 transition-colors" :class="appointmentForm.waktu ? 'text-bejo-500' : 'text-slate-300'" />
                <input type="time" :value="appointmentForm.waktu" @input="emit('update:formWaktu', ($event.target as HTMLInputElement).value)" class="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold focus:bg-white focus:ring-8 focus:ring-bejo-500/5 focus:border-bejo-500 transition-all shadow-inner outline-none" />
              </div>
            </div>
            <div class="h-px bg-slate-100 my-2"></div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block"> Nama Lengkap <span class="text-red-400">*</span> </label>
              <input :value="appointmentForm.namaLengkap" @input="emit('update:formNamaLengkap', ($event.target as HTMLInputElement).value)" type="text" placeholder="Nama lengkap customer..." class="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:ring-8 focus:ring-bejo-500/5 focus:border-bejo-500 transition-all shadow-inner outline-none" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">No. Telepon</label>
              <input :value="appointmentForm.noTelp" @input="emit('update:formNoTelp', ($event.target as HTMLInputElement).value)" type="text" placeholder="Nomor telepon..." class="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:ring-8 focus:ring-bejo-500/5 focus:border-bejo-500 transition-all shadow-inner outline-none" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Properti / Unit</label>
              <input :value="appointmentForm.properti" type="text" disabled class="w-full bg-slate-100 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-500 cursor-not-allowed shadow-inner outline-none" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Lokasi Survey</label>
              <input :value="appointmentForm.lokasi" type="text" disabled class="w-full bg-slate-100 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-500 cursor-not-allowed shadow-inner outline-none" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Catatan Tambahan</label>
              <textarea :value="appointmentForm.catatan" @input="emit('update:formCatatan', ($event.target as HTMLTextAreaElement).value)" placeholder="Catatan khusus..." rows="3" class="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:ring-8 focus:ring-bejo-500/5 focus:border-bejo-500 transition-all shadow-inner outline-none resize-none" />
            </div>
          </div>

          <div class="mt-8 flex gap-3">
            <button @click="emit('close')" class="flex-1 py-4 bg-white border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm">Batal</button>
            <button @click="emit('save')" class="flex-[2] py-4 bg-gradient-to-r from-bejo-500 to-bejo-600 hover:from-bejo-600 hover:to-bejo-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-bejo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2.5">
              <Icon icon="lucide:save" class="size-4" />
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
