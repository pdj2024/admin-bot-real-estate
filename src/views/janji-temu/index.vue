<script setup lang="ts">
import { ref, nextTick } from 'vue'
import Vertical from '@/layouts/vertical.vue'
import AppointmentStats from './components/AppointmentStats.vue'
import Calendar from './components/Calendar.vue'
import Event from './components/Event.vue'
import Table from './components/Table.vue'

const calendarRef = ref<InstanceType<typeof Calendar> | null>(null)
const openAppointment = ref(false)
const selectedEvent = ref<any>(null)
const appointmentData = ref<any>(null)

const openAppointmentHandler = (data: any) => {
  selectedEvent.value = data
  appointmentData.value = data
  openAppointment.value = true
  nextTick(() => {
    calendarRef.value?.refreshCalendar()
  })
}

const closeAppointment = () => {
  openAppointment.value = false
  setTimeout(() => {
    selectedEvent.value = null
  }, 300)
  nextTick(() => {
    calendarRef.value?.refreshCalendar()
  })
}
</script>

<template>
  <Vertical>
    <div class="p-4 md:p-6 pb-24 space-y-4">
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
      <div class="grid grid-cols-1 xl:grid-cols-4 gap-10 items-start">
        <!-- Main Calendar -->
        <Calendar 
          ref="calendarRef" 
          :appointmentOpen="openAppointment" 
          @openAppointment="openAppointmentHandler" 
        />
        
        <!-- Quick Detail Panel (Floating or Static depends on screen) -->
        <Transition name="slide-fade">
          <Event 
            v-if="openAppointment"
            :openAppointment="openAppointment" 
            :appointment="appointmentData" 
            @close="closeAppointment" 
          />
        </Transition>
      </div>

      <!-- Request Table Section -->
      <div class="pt-10">
        <Table />
      </div>
    </div>
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
</style>