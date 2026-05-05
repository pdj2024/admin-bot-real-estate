<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import Vertical from '@/layouts/vertical.vue'
import AppointmentStats from './components/AppointmentStats.vue'
import Calendar from './components/Calendar.vue'
import Event from './components/Event.vue'
import Table from './components/Table.vue'
import ChatWidget from '@/components/ChatWidget.vue'

const calendarRef = ref<InstanceType<typeof Calendar> | null>(null)
const chatWidgetRef = ref<any>(null)
const openAppointment = ref(false)
const isShrinkCalendar = ref(false)
const selectedEvent = ref<any>(null)
const appointmentData = ref<any>(null)

// Responsive Detection
const showAsPopup = ref(false)
const updateView = () => {
  showAsPopup.value = window.innerWidth < 1280 // Tablets and Mobile are below XL
}

onMounted(() => {
  updateView()
  window.addEventListener('resize', updateView)
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
  // 1. Tutup detail janji dahulu (Fade Out)
  openAppointment.value = false
  
  // 2. Barulah div calendar stretch full wide setelah fade out selesai
  setTimeout(() => {
    isShrinkCalendar.value = false
    nextTick(() => {
      calendarRef.value?.refreshCalendar()
    })
  }, 400) // Delay sedikit lebih lama dari durasi slide-fade-leave (300ms)

  setTimeout(() => {
    selectedEvent.value = null
  }, 500)
}
</script>

<template>
  <Vertical>
    <div class="p-0 md:p-3 md:pt-1 pb-24 space-y-4">
      <!-- Minimalist Header -->
      <div class="flex items-center justify-between border-b border-slate-50 pb-2">
        <div>
          <h1 class="text-lg font-black text-slate-900 tracking-tight leading-tight">Janji Temu</h1>
          <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Manajemen Jadwal & Konsultasi</p>
        </div>
      </div>

      <!-- Stats Overview -->
      <AppointmentStats />
      
      <!-- Calendar & Detail Section -->
      <div class="grid grid-cols-1 xl:grid-cols-4 gap-10 items-stretch">
        <!-- Main Calendar -->
        <Calendar 
          ref="calendarRef" 
          :appointmentOpen="isShrinkCalendar && !showAsPopup" 
          @openAppointment="openAppointmentHandler" 
        />
        
        <!-- Desktop Quick Detail Panel -->
        <div class="xl:col-span-1 h-full min-h-0">
          <Transition name="slide-fade">
             <Event 
               v-if="openAppointment && !showAsPopup"
               :openAppointment="openAppointment" 
               :appointment="appointmentData" 
               class="h-full"
               @close="closeAppointment" 
               @openChat="handleOpenChat"
             />
          </Transition>
        </div>
      </div>

      <!-- Mobile & Tablet Modal Detail -->
      <Transition name="fade">
        <div v-if="openAppointment && showAsPopup" class="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm shadow-2xl" @click="closeAppointment"></div>
          <div class="relative w-full max-w-lg h-[85vh] animate-in zoom-in-95 duration-300">
            <Event 
              :openAppointment="openAppointment" 
              :appointment="appointmentData" 
              class="h-full"
              @close="closeAppointment" 
              @openChat="handleOpenChat"
            />
          </div>
        </div>
      </Transition>

      <!-- Request Table Section -->
      <div class="pt-10">
        <Table />
      </div>
    </div>
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