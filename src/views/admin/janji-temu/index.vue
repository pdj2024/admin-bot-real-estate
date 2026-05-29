<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import { success, fail } from '@/utils/sweet-alert'
import Vertical from '@/layouts/vertical.vue'
import AppointmentStats from './components/AppointmentStats.vue'
import Calendar from './components/Calendar.vue'
import Event from './components/Event.vue'
import ChatWidget from '@/components/ChatWidget.vue'
import api from '@/services/axios'

const calendarRef = ref<InstanceType<typeof Calendar> | null>(null)
const chatWidgetRef = ref<any>(null)
const openAppointment = ref(false)
const isShrinkCalendar = ref(false)
const selectedEvent = ref<any>(null)
const appointmentData = ref<any>(null)
const appointments = ref<any[]>([])
const isLoading = ref(true)

// Responsive Detection
const showAsPopup = ref(false)
const updateView = () => {
  showAsPopup.value = window.innerWidth < 1280 || window.innerHeight < 720
}

// Past Due Notification Modal State
const showPastDueModal = ref(false)
const dontShowToday = ref(false)
const selectedPastDueIds = ref<number[]>([])
const isUpdatingPastDue = ref(false)

const getTodayString = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const pastDueAppointments = computed(() => {
  const todayStr = getTodayString()
  return appointments.value.filter(app => {
    const appDate = app.Tanggal_Janji.split('T')[0]
    return appDate <= todayStr && ['baru', 'dikonfirmasi', 'proses'].includes(app.Status_Progress)
  })
})

const groupedPastDue = computed(() => {
  const groups = {
    baru: [] as any[],
    dikonfirmasi: [] as any[],
    proses: [] as any[]
  }
  pastDueAppointments.value.forEach(app => {
    if (groups[app.Status_Progress as keyof typeof groups]) {
      groups[app.Status_Progress as keyof typeof groups].push(app)
    }
  })
  return groups
})

const fetchAppointments = async () => {
  isLoading.value = true
  try {
    const { data } = await api.get('/api/janjiTemu/getAll?orderby=no_id&orderdir=asc', {
      headers: { 'X-Jenis-User': 'admin' }
    })
    appointments.value = data.Data || []
    
    // Check past due modal visibility after data fetched
    nextTick(() => {
      const todayStr = getTodayString()
      const hideDate = localStorage.getItem('hidePastDueModalDate')
      if (hideDate !== todayStr && pastDueAppointments.value.length > 0) {
        selectedPastDueIds.value = pastDueAppointments.value.map(app => app.No_Id)
        showPastDueModal.value = true
      }
    })
  } catch (error) {
    console.error('Gagal mengambil data janji temu:', error)
  } finally {
    isLoading.value = false
  }
}

const updatePastDueStatus = async () => {
  if (selectedPastDueIds.value.length === 0) return
  isUpdatingPastDue.value = true
  try {
    const selectedApps = pastDueAppointments.value.filter(app => selectedPastDueIds.value.includes(app.No_Id))
    
    await Promise.all(selectedApps.map(async (app) => {
      if (app.Status_Progress === 'baru') {
        const adminId = localStorage.getItem('no_id') || ''
        await api.put(`/api/janjiTemu/confirm?no_id=${app.No_Id}`, { Id_Admin: adminId }, { headers: { 'X-Jenis-User': 'admin' } })
      } else {
        const nextStatus = app.Status_Progress === 'dikonfirmasi' ? 'proses' : 'selesai'
        const payload = {
          ...app,
          Status_Progress: nextStatus,
          Tanggal_Janji: null,
          Waktu_Janji: null,
          Waktu_Selesai: null
        }
        await api.put(`/api/janjiTemu/update?no_id=${app.No_Id}`, payload, { headers: { 'X-Jenis-User': 'admin' } })
      }
    }))
    
    if (dontShowToday.value) {
      localStorage.setItem('hidePastDueModalDate', getTodayString())
    }
    
    showPastDueModal.value = false
    success(`Berhasil memperbarui ${selectedApps.length} janji temu.`)
    fetchAppointments()
  } catch (err) {
    console.error('Failed to update past due appointments:', err)
    fail('Terjadi kesalahan saat memperbarui status janji temu.')
  } finally {
    isUpdatingPastDue.value = false
  }
}

const cancellingAppId = ref<number | null>(null)
const cancelReasonText = ref('')

const startCancelInline = (appId: number) => {
  cancellingAppId.value = appId
  cancelReasonText.value = ''
}

const cancelCancelInline = () => {
  cancellingAppId.value = null
  cancelReasonText.value = ''
}

const submitCancelInline = async (app: any) => {
  if (!cancelReasonText.value.trim()) return
  try {
    const payload = {
      ...app,
      Status_Progress: 'batal',
      Alasan_Batal: cancelReasonText.value,
      Tanggal_Janji: null,
      Waktu_Janji: null,
      Waktu_Selesai: null
    }
    await api.put(`/api/janjiTemu/update?no_id=${app.No_Id}`, payload, { headers: { 'X-Jenis-User': 'admin' } })
    
    selectedPastDueIds.value = selectedPastDueIds.value.filter(id => id !== app.No_Id)
    cancellingAppId.value = null
    cancelReasonText.value = ''
    success('Janji temu telah dibatalkan.')
    fetchAppointments()
  } catch (error) {
    console.error('Gagal membatalkan janji temu:', error)
    fail('Gagal membatalkan janji temu.')
  }
}

const isAllGroupSelected = (status: string) => {
  const groupItems = groupedPastDue.value[status as keyof typeof groupedPastDue.value] || []
  if (groupItems.length === 0) return false
  return groupItems.every(item => selectedPastDueIds.value.includes(item.No_Id))
}

const toggleSelectAllGroup = (status: string) => {
  const groupItems = groupedPastDue.value[status as keyof typeof groupedPastDue.value] || []
  const groupIds = groupItems.map(item => item.No_Id)
  const allSelected = isAllGroupSelected(status)
  
  if (allSelected) {
    selectedPastDueIds.value = selectedPastDueIds.value.filter(id => !groupIds.includes(id))
  } else {
    const otherIds = selectedPastDueIds.value.filter(id => !groupIds.includes(id))
    selectedPastDueIds.value = [...otherIds, ...groupIds]
  }
}

const closePastDueModal = () => {
  if (dontShowToday.value) {
    localStorage.setItem('hidePastDueModalDate', getTodayString())
  }
  showPastDueModal.value = false
}

onMounted(() => {
  updateView()
  window.addEventListener('resize', updateView)
  fetchAppointments()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateView)
})

const handleOpenChat = (customerId: string) => {
  if (chatWidgetRef.value) {
    chatWidgetRef.value.openForCustomer(customerId)
  }
}

const openAppointmentHandler = (data: any) => {
  selectedEvent.value = data
  appointmentData.value = data
  openAppointment.value = true
  isShrinkCalendar.value = true
  nextTick(() => {
    calendarRef.value?.refreshCalendar()
  })
}

const closeAppointment = () => {
  openAppointment.value = false
  setTimeout(() => {
    isShrinkCalendar.value = false
    nextTick(() => {
      calendarRef.value?.refreshCalendar()
    })
  }, 400)

  setTimeout(() => {
    selectedEvent.value = null
  }, 500)
}

const handleRefresh = () => {
  fetchAppointments()
  closeAppointment()
}
</script>

<template>
  <Vertical>
    <div class="p-4 md:p-3 md:pt-1 pb-24 space-y-4">
      <!-- Title Section Removed -->

      <!-- Stats Overview -->
      <AppointmentStats :appointments="appointments" />
      
      <!-- Calendar & Detail Section -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <!-- Main Calendar -->
        <Calendar 
          ref="calendarRef" 
          :appointments="appointments"
          :appointmentOpen="isShrinkCalendar && !showAsPopup" 
          @openAppointment="openAppointmentHandler" 
        />
        
        <!-- Desktop Quick Detail Panel -->
        <div v-if="openAppointment && !showAsPopup" class="lg:col-span-4 xl:col-span-3 h-full min-h-0">
          <Transition name="slide-fade">
             <Event 
               :openAppointment="openAppointment" 
               :appointment="appointmentData" 
               :appointments="appointments"
               class="h-full"
               @close="closeAppointment" 
               @refresh="handleRefresh"
               @openChat="handleOpenChat"
             />
          </Transition>
        </div>
      </div>

      <!-- Mobile & Tablet Modal Detail -->
      <Transition name="fade">
        <div v-if="openAppointment && showAsPopup" class="fixed inset-0 z-[1050] flex items-center justify-center p-4 md:p-10">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md shadow-2xl" @click="closeAppointment"></div>
          <div class="relative w-full max-w-lg h-[85vh] animate-in zoom-in-95 duration-300">
            <Event 
              :openAppointment="openAppointment" 
              :appointment="appointmentData" 
              :appointments="appointments"
              class="h-full"
              @close="closeAppointment" 
              @refresh="handleRefresh"
              @openChat="handleOpenChat"
            />
          </div>
        </div>
      </Transition>
    </div>

    <!-- Past Due Appointments Pop-up Modal -->
    <Transition name="fade">
      <div v-if="showPastDueModal" class="fixed inset-0 z-[1060] flex items-center justify-center p-3 sm:p-4 md:p-6">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" @click="closePastDueModal"></div>
        <div class="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300">
          
          <!-- Header -->
          <div class="flex justify-between items-start mb-4 sm:mb-6 shrink-0">
            <div>
              <h3 class="text-base sm:text-xl md:text-2xl font-black text-slate-900 flex items-center gap-1.5 sm:gap-2">
                <Icon icon="lucide:alert-circle" class="size-5 sm:size-6 md:size-7 text-amber-500 shrink-0" />
                Konfirmasi Jadwal Terlewat
              </h3>
              <p class="text-[10px] sm:text-xs font-bold text-slate-400 mt-0.5 sm:mt-1"> Perbarui janji temu yang telah terlewat</p>
            </div>
            <button @click="closePastDueModal" class="size-8 sm:size-9 rounded-lg sm:rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors shrink-0">
              <Icon icon="lucide:x" class="size-5" />
            </button>
          </div>

          <!-- Body (Scrollable Container) -->
          <div class="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-4 sm:space-y-6 mb-4 sm:mb-6">
            
            <!-- Group: BARU -->
            <div v-if="groupedPastDue.baru.length > 0" class="space-y-2 sm:space-y-3">
              <div class="flex items-center justify-between px-1 gap-2 flex-wrap">
                <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span class="text-[9px] sm:text-[11px] font-black text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg">Status: Pengajuan (Baru)</span>
                  <span class="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-400">Tahap berikutnya: Konfirmasi</span>
                </div>
                <label class="flex items-center gap-1.5 cursor-pointer text-[10px] sm:text-xs font-bold text-slate-500">
                  <input type="checkbox" :checked="isAllGroupSelected('baru')" @change="toggleSelectAllGroup('baru')" class="size-3.5 sm:size-4 rounded text-blue-500 focus:ring-blue-400 border-slate-200" />
                  Pilih Semua
                </label>
              </div>
              <div class="divide-y divide-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50/30">
                <div v-for="app in groupedPastDue.baru" :key="app.No_Id" class="hover:bg-white transition-colors">
                   <div class="flex items-center justify-between gap-2.5 p-3 sm:p-4">
                     <label class="flex items-center gap-2.5 sm:gap-3.5 flex-1 cursor-pointer min-w-0">
                       <input type="checkbox" :value="app.No_Id" v-model="selectedPastDueIds" class="size-4 sm:size-5 rounded text-blue-500 focus:ring-blue-400 border-slate-250 shrink-0" />
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                           <span class="text-xs sm:text-sm md:text-base font-black text-slate-800">{{ app.Nama_Customer || app.Id_Customer }}</span>
                           <span class="text-[8px] sm:text-[10px] font-mono text-slate-450 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded font-bold">#{{ app.No_Tracking }}</span>
                        </div>
                        <p class="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-500 truncate mt-0.5 sm:mt-1">{{ app.Nama_Produk }}</p>
                        <p class="text-[10px] sm:text-xs font-bold text-red-500/90 mt-1 flex items-center gap-1 sm:gap-1.5">
                          <Icon icon="lucide:calendar" class="size-3.5 shrink-0" />
                          {{ app.Tanggal_Janji.split('T')[0] }} • {{ app.Waktu_Janji }} WIB
                        </p>
                      </div>
                    </label>
                    <button v-if="cancellingAppId !== app.No_Id" @click.stop="startCancelInline(app.No_Id)" class="px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1">
                      <Icon icon="lucide:ban" class="size-3.5 shrink-0" />
                      Batal
                    </button>
                  </div>
                  
                  <!-- Inline Cancellation Form -->
                  <div v-if="cancellingAppId === app.No_Id" class="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 space-y-2 sm:space-y-3 bg-red-50/10 border-t border-slate-50">
                    <div class="space-y-1">
                      <label class="text-[9px] sm:text-[10px] font-black text-red-500 uppercase tracking-wider block">Alasan Pembatalan (Wajib)</label>
                      <textarea 
                        v-model="cancelReasonText" 
                        class="w-full px-3 py-2 bg-white border border-slate-200 focus:border-red-400 focus:ring-red-400 rounded-xl text-xs font-bold min-h-[60px]" 
                        placeholder="Masukkan alasan pembatalan..."
                      ></textarea>
                    </div>
                    <div class="flex items-center gap-2 justify-end">
                      <button @click="cancelCancelInline" class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-colors">
                        Kembali
                      </button>
                      <button 
                        @click="submitCancelInline(app)" 
                        :disabled="!cancelReasonText.trim()"
                        class="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                      >
                        Ya, Batalkan!
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Group: DIKONFIRMASI -->
            <div v-if="groupedPastDue.dikonfirmasi.length > 0" class="space-y-2 sm:space-y-3">
              <div class="flex items-center justify-between px-1 gap-2 flex-wrap">
                <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span class="text-[9px] sm:text-[11px] font-black text-bejo-600 uppercase tracking-wider bg-bejo-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg">Status: Dikonfirmasi</span>
                  <span class="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-400">Tahap berikutnya: Mulai Pertemuan</span>
                </div>
                <label class="flex items-center gap-1.5 cursor-pointer text-[10px] sm:text-xs font-bold text-slate-500">
                  <input type="checkbox" :checked="isAllGroupSelected('dikonfirmasi')" @change="toggleSelectAllGroup('dikonfirmasi')" class="size-3.5 sm:size-4 rounded text-bejo-500 focus:ring-bejo-400 border-slate-200" />
                  Pilih Semua
                </label>
              </div>
              <div class="divide-y divide-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50/30">
                <div v-for="app in groupedPastDue.dikonfirmasi" :key="app.No_Id" class="hover:bg-white transition-colors">
                  <div class="flex items-center justify-between gap-2.5 p-3 sm:p-4">
                    <label class="flex items-center gap-2.5 sm:gap-3.5 flex-1 cursor-pointer min-w-0">
                      <input type="checkbox" :value="app.No_Id" v-model="selectedPastDueIds" class="size-4 sm:size-5 rounded text-bejo-500 focus:ring-bejo-400 border-slate-250 shrink-0" />
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                           <span class="text-xs sm:text-sm md:text-base font-black text-slate-800">{{ app.Nama_Customer || app.Id_Customer }}</span>
                           <span class="text-[8px] sm:text-[10px] font-mono text-slate-450 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded font-bold">#{{ app.No_Tracking }}</span>
                        </div>
                        <p class="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-500 truncate mt-0.5 sm:mt-1">{{ app.Nama_Produk }}</p>
                        <p class="text-[10px] sm:text-xs font-bold text-red-500/90 mt-1 flex items-center gap-1 sm:gap-1.5">
                          <Icon icon="lucide:calendar" class="size-3.5 shrink-0" />
                          {{ app.Tanggal_Janji.split('T')[0] }} • {{ app.Waktu_Janji }} WIB
                        </p>
                      </div>
                    </label>
                    <button v-if="cancellingAppId !== app.No_Id" @click.stop="startCancelInline(app.No_Id)" class="px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1">
                      <Icon icon="lucide:ban" class="size-3.5 shrink-0" />
                      Batal
                    </button>
                  </div>
                  
                  <!-- Inline Cancellation Form -->
                  <div v-if="cancellingAppId === app.No_Id" class="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 space-y-2 sm:space-y-3 bg-red-50/10 border-t border-slate-50">
                    <div class="space-y-1">
                      <label class="text-[9px] sm:text-[10px] font-black text-red-500 uppercase tracking-wider block">Alasan Pembatalan (Wajib)</label>
                      <textarea 
                        v-model="cancelReasonText" 
                        class="w-full px-3 py-2 bg-white border border-slate-200 focus:border-red-400 focus:ring-red-400 rounded-xl text-xs font-bold min-h-[60px]" 
                        placeholder="Masukkan alasan pembatalan..."
                      ></textarea>
                    </div>
                    <div class="flex items-center gap-2 justify-end">
                      <button @click="cancelCancelInline" class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-colors">
                        Kembali
                      </button>
                      <button 
                        @click="submitCancelInline(app)" 
                        :disabled="!cancelReasonText.trim()"
                        class="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                      >
                        Ya, Batalkan!
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Group: PROSES -->
            <div v-if="groupedPastDue.proses.length > 0" class="space-y-2 sm:space-y-3">
              <div class="flex items-center justify-between px-1 gap-2 flex-wrap">
                <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span class="text-[9px] sm:text-[11px] font-black text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg">Status: Mulai Pertemuan (Proses)</span>
                  <span class="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-400">Tahap berikutnya: Selesai</span>
                </div>
                <label class="flex items-center gap-1.5 cursor-pointer text-[10px] sm:text-xs font-bold text-slate-500">
                  <input type="checkbox" :checked="isAllGroupSelected('proses')" @change="toggleSelectAllGroup('proses')" class="size-3.5 sm:size-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-200" />
                  Pilih Semua
                </label>
              </div>
              <div class="divide-y divide-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50/30">
                <div v-for="app in groupedPastDue.proses" :key="app.No_Id" class="hover:bg-white transition-colors">
                  <div class="flex items-center justify-between gap-2.5 p-3 sm:p-4">
                    <label class="flex items-center gap-2.5 sm:gap-3.5 flex-1 cursor-pointer min-w-0">
                      <input type="checkbox" :value="app.No_Id" v-model="selectedPastDueIds" class="size-4 sm:size-5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-250 shrink-0" />
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                           <span class="text-xs sm:text-sm md:text-base font-black text-slate-800">{{ app.Nama_Customer || app.Id_Customer }}</span>
                           <span class="text-[8px] sm:text-[10px] font-mono text-slate-450 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded font-bold">#{{ app.No_Tracking }}</span>
                        </div>
                        <p class="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-500 truncate mt-0.5 sm:mt-1">{{ app.Nama_Produk }}</p>
                        <p class="text-[10px] sm:text-xs font-bold text-red-500/90 mt-1 flex items-center gap-1 sm:gap-1.5">
                          <Icon icon="lucide:calendar" class="size-3.5 shrink-0" />
                          {{ app.Tanggal_Janji.split('T')[0] }} • {{ app.Waktu_Janji }} WIB
                        </p>
                      </div>
                    </label>
                    <button v-if="cancellingAppId !== app.No_Id" @click.stop="startCancelInline(app.No_Id)" class="px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1">
                      <Icon icon="lucide:ban" class="size-3.5 shrink-0" />
                      Batal
                    </button>
                  </div>
                  
                  <!-- Inline Cancellation Form -->
                  <div v-if="cancellingAppId === app.No_Id" class="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 space-y-2 sm:space-y-3 bg-red-50/10 border-t border-slate-50">
                    <div class="space-y-1">
                      <label class="text-[9px] sm:text-[10px] font-black text-red-500 uppercase tracking-wider block">Alasan Pembatalan (Wajib)</label>
                      <textarea 
                        v-model="cancelReasonText" 
                        class="w-full px-3 py-2 bg-white border border-slate-200 focus:border-red-400 focus:ring-red-400 rounded-xl text-xs font-bold min-h-[60px]" 
                        placeholder="Masukkan alasan pembatalan..."
                      ></textarea>
                    </div>
                    <div class="flex items-center gap-2 justify-end">
                      <button @click="cancelCancelInline" class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-colors">
                        Kembali
                      </button>
                      <button 
                        @click="submitCancelInline(app)" 
                        :disabled="!cancelReasonText.trim()"
                        class="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                      >
                        Ya, Batalkan!
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div class="border-t border-slate-100 pt-3 sm:pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 shrink-0">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="dontShowToday" class="size-4 sm:size-4.5 rounded text-slate-600 focus:ring-slate-500 border-slate-200" />
              <span class="text-[10px] sm:text-xs font-bold text-slate-500 select-none">Jangan tampilkan hari ini</span>
            </label>
            <div class="flex items-center gap-2.5 sm:gap-3 justify-end">
              <button @click="closePastDueModal" class="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors">
                Tutup
              </button>
              <button @click="updatePastDueStatus" :disabled="selectedPastDueIds.length === 0 || isUpdatingPastDue" class="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-bejo-500 hover:bg-bejo-600 text-white rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-1.5 sm:gap-2 disabled:opacity-50 shadow-lg shadow-bejo-500/10">
                <Icon v-if="isUpdatingPastDue" icon="lucide:loader-2" class="size-3.5 animate-spin" />
                <Icon v-else icon="lucide:check-circle" class="size-3.5" />
                Update Status ({{ selectedPastDueIds.length }})
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>

    <ChatWidget ref="chatWidgetRef" />
  </Vertical>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.4s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(30px);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes zoom-in {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-in {
  animation: zoom-in 0.3s ease-out forwards;
}
</style>