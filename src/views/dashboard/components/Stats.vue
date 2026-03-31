<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'

// const chats = ref([])

// const fetchData = async () => {
//   try {
//     const { data } = await api.get('/api/chat/getRooms?user_id='+localStorage.getItem('no_id')+'&orderby=Last_Message_At', {
//       headers: { 'X-Jenis-User': 'Admin' }
//     })
//     products.value = data.Data
//   } catch (err: any) {
//     console.error('DATA:', err.response?.data)
//     console.error('STATUS:', err.response?.status)
//     console.error('MESSAGE:', err.message)
//   }
// }

const operasionalData = [
  { label: 'Chat Aktif Hari Ini', value: '12', icon: 'lucide:message-square', bgColor: 'bg-primary/10', iconColor: 'text-primary' },
  { label: 'Janji Temu Hari Ini', value: '5', icon: 'lucide:calendar-clock', bgColor: 'bg-info/10', iconColor: 'text-info' },
  { label: 'Total Agen Properti', value: '52', icon: 'lucide:users', bgColor: 'bg-success/10', iconColor: 'text-success' },
]

const propertyStats = [
  { label: 'Tersedia', value: '24', icon: 'lucide:home', bg: 'bg-emerald-500/10', color: 'text-emerald-500' },
  { label: 'Terjual', value: '150', icon: 'lucide:badge-check', bg: 'bg-blue-500/10', color: 'text-blue-500' },
  { label: 'Tersewa', value: '89', icon: 'lucide:key', bg: 'bg-amber-500/10', color: 'text-amber-500' },
  { label: 'Total Unit', value: '263', icon: 'lucide:layers', bg: 'bg-slate-500/10', color: 'text-slate-500' },
]
</script>

<template>
  <div class="flex items-center justify-between mb-4">
    <h4 class="text-default-900 text-lg font-bold">Ringkasan Operasional</h4>
  </div>
  <div class="grid lg:grid-cols-3 md:grid-cols-3 grid-cols-1 gap-5 mb-8">
    <div v-for="(item, idx) in operasionalData" :key="idx" class="card bg-card border-default-200">
      <div class="card-body p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-default-500 font-medium">{{ item.label }}</p>
            <h2 class="text-2xl font-black text-default-900">{{ item.value }}</h2>
          </div>
          <div :class="`size-12 rounded-xl flex items-center justify-center ${item.bgColor}`">
            <Icon :icon="item.icon" :class="`size-6 ${item.iconColor}`" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <h4 class="text-default-900 text-lg font-bold mb-4">Status Properti</h4>
  <div class="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-5">
    <div v-for="(stat, idx) in propertyStats" :key="idx" class="card border-default-200 bg-card">
      <div class="card-body p-5">
        <div class="flex items-center gap-4">
          <div :class="`size-12 rounded-lg flex items-center justify-center ${stat.bg}`">
            <Icon :icon="stat.icon" :class="`size-6 ${stat.color}`" />
          </div>
          <div>
            <h5 class="text-xl font-black text-default-900">{{ stat.value }}</h5>
            <p class="text-[10px] uppercase font-bold tracking-wider text-default-500">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

