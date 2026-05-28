<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'

interface StatCard {
  label: string
  value: number
  subLabel: string
  subValue: string | number
  icon: string
}

const stats = ref<StatCard[]>([
  { label: 'Total Admin', value: 0, subLabel: 'Aktif / Nonaktif', subValue: '0 / 0', icon: 'lucide:headset' },
  { label: 'Total Pelanggan', value: 0, subLabel: 'Aktif / Nonaktif', subValue: '0 / 0', icon: 'lucide:user' },
  { label: 'Total Chat', value: 0, subLabel: 'Bot / Chat Saya', subValue: '0 / 0', icon: 'lucide:message-square' },
  { label: 'Total Wilayah', value: 0, subLabel: 'Cakupan Wilayah', subValue: 'Kota', icon: 'lucide:map-pin' },
])

const isLoading = ref(true)

const fetchData = async () => {
  try {
    isLoading.value = true
    const [resAdmin, resCust, resChatBot, resChatSaya, resKota] = await Promise.all([
      api.get('/api/admin/getAll', { headers: { 'X-Jenis-User': 'Admin', 'Api-Key': 'realestate_key_2024' } }).catch(() => ({ data: { Data: [] } })),
      api.get('/api/customer/getAll', { headers: { 'X-Jenis-User': 'Admin', 'Api-Key': 'realestate_key_2024' } }).catch(() => ({ data: { Data: [] } })),
      api.get('/api/chat/getRoomsGlobal?status_bot=aktif', { headers: { 'X-Jenis-User': 'admin' } }).catch(() => ({ data: { Data: [] } })),
      api.get('/api/chat/getRoomsGlobal?status_bot=nonaktif', { headers: { 'X-Jenis-User': 'admin' } }).catch(() => ({ data: { Data: [] } })),
      api.get('/api/kota/getAll').catch(() => ({ data: { Data: [] } })),
    ])

    const admins = resAdmin.data.Data || []
    const customers = resCust.data.Data || []
    const chatBot = resChatBot.data.Data || []
    const chatSaya = resChatSaya.data.Data || []

    // 1. Admin Stats
    stats.value[0].value = admins.length
    const adminAktif = admins.filter((a: any) => a.Status?.toLowerCase() === 'aktif').length
    const adminNon = admins.length - adminAktif
    stats.value[0].subValue = `${adminAktif} / ${adminNon}`
    
    // 2. Customer Stats
    stats.value[1].value = customers.length
    const custAktif = customers.filter((c: any) => c.Status?.toLowerCase() === 'aktif').length
    const custNon = customers.length - custAktif
    stats.value[1].subValue = `${custAktif} / ${custNon}`

    // 3. Chat Stats
    const userId = localStorage.getItem('no_id') || ''
    const activeBotRooms = chatBot.filter((item: any) => item.Room_Id).length
    const activeChatSayaRooms = chatSaya.filter((item: any) => {
      if (item.Status !== 'aktif' || !item.Id_Lawan || !item.Telepon_User_Lawan) return false
      const userIds = item.User_Ids || []
      return userIds.includes(userId)
    }).length

    stats.value[2].value = activeBotRooms + activeChatSayaRooms
    stats.value[2].subValue = `${activeBotRooms} / ${activeChatSayaRooms}`

    // 4. Wilayah Stats
    stats.value[3].value = (resKota.data.Data || []).length
  } catch (err) {
    console.error('Operational Summary Error:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)
const emit = defineEmits(['open-settings'])
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between px-2">
      <div class="flex items-center gap-3">
        <div class="size-10 rounded-2xl bg-bejo-500 flex items-center justify-center text-white shadow-lg shadow-bejo-500/20">
          <Icon icon="lucide:layout-dashboard" class="size-5" />
        </div>
        <h4 class="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Ringkasan Operasional</h4>
      </div>
      <button @click="emit('open-settings')" class="p-2 hover:bg-slate-100 rounded-xl transition-colors">
        <Icon icon="lucide:settings-2" class="size-4 text-slate-400" />
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <template v-if="isLoading">
        <div v-for="i in 4" :key="i" class="bg-white rounded-[2rem] p-6 border border-slate-50 animate-pulse h-32"></div>
      </template>

      <div 
        v-else
        v-for="(item, idx) in stats" 
        :key="idx"
        class="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/30 transition-all duration-500 group flex flex-col justify-between h-full min-h-[140px] cursor-pointer"
      >
        <div class="flex justify-between items-start w-full">
          <div class="space-y-1">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ item.label }}</p>
            <h2 class="text-4xl font-black text-slate-900 tracking-tighter leading-none">{{ item.value }}</h2>
          </div>
          <div class="size-12 rounded-2xl bg-bejo-500 flex items-center justify-center text-white shadow-lg shadow-bejo-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
            <Icon :icon="item.icon" class="size-6" />
          </div>
        </div>
        
        <div class="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{{ item.subLabel }}</span>
          <span class="text-[11px] font-black text-emerald-600">{{ item.subValue }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
