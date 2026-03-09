<template>
  <Vertical>
    <PageTitle subtitle="Menu Utama" title="Kalender" />
    <div class="grid lg:grid-cols-4 gap-3">
      <Calendar @openAppointment="openAppointment = true" />
      <Event :openAppointment="openAppointment" @close="openAppointment = false" />
    </div>
  </Vertical>
</template>

<script setup lang="ts">
import PageTitle from '@/components/PageTitle.vue'
import Vertical from '@/layouts/vertical.vue'
import Calendar from './components/Calendar.vue'
import Event from './components/Event.vue'
import { ref } from 'vue'

const openAppointment = ref(false)
</script>
