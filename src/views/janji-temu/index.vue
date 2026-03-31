<script setup lang="ts">
import { ref, nextTick } from 'vue'
import Vertical from '@/layouts/vertical.vue'
import PageTitle from '@/components/PageTitle.vue'
import Calendar from './components/Calendar.vue' // Sesuaikan path Anda
import Event from './components/Event.vue'       // Sesuaikan path Anda
import Table from './components/Table.vue'       // Sesuaikan path Anda

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
    <PageTitle subtitle="Menu Utama" title="Janji Temu" />
    
    <div class="grid lg:grid-cols-4 gap-4 items-start transition-all duration-300">
      
      <Calendar 
        ref="calendarRef" 
        :appointmentOpen="openAppointment" 
        @openAppointment="openAppointmentHandler" 
      />
      
      <Event 
        v-show="openAppointment"
        class="lg:col-span-1 w-full"
        :openAppointment="openAppointment" 
        :eventDetail="selectedEvent" 
        :appointment="appointmentData" 
        @close="closeAppointment" 
      />
      
    </div>

    <div class="card mt-6">
      <div class="px-6 py-4 border-b border-default-200">
        <h4 class="text-base font-bold text-default-900">Permintaan Janji Temu</h4>
      </div>
      
      <div class="card-body">
        <Table />
      </div>
    </div>
    
  </Vertical>
</template>