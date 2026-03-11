<template>
  <Vertical>
    <PageTitle subtitle="Menu Utama" title="Kalender" />
    <div class="grid lg:grid-cols-4 gap-3">
      <Calendar ref="calendarRef" :appointmentOpen="openAppointment" @openAppointment="openAppointmentHandler" class="w-full"/>
      <Event :openAppointment="openAppointment" :eventDetail="selectedEvent" :appointment="appointmentData" @close="closeAppointment" />
    </div>
  </Vertical>
</template>

<script setup lang="ts">
import PageTitle from '@/components/PageTitle.vue'
import Vertical from '@/layouts/vertical.vue'
import Calendar from './components/Calendar.vue'
import Event from './components/Event.vue'
import { ref, nextTick } from 'vue'

const openAppointment = ref(false)
const appointmentData = ref<any>(null)
const selectedEvent = ref<any>(null)
const calendarRef = ref<InstanceType<typeof Calendar> | null>(null)

const openAppointmentHandler = (data: any) => {
  appointmentData.value = data
  openAppointment.value = true
  nextTick(() => {
    calendarRef.value?.refreshCalendar()
  })
}

const closeAppointment = () => {
  openAppointment.value = false
  nextTick(() => {
    calendarRef.value?.refreshCalendar()
  })
}
</script>
