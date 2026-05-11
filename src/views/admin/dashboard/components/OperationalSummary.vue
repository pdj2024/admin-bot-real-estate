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
  { label: 'Total Admin', value: 0, subLabel: 'Admin Nonaktif', subValue: 0, icon: 'lucide:headset' },
  { label: 'Total Pelanggan', value: 0, subLabel: 'User Nonaktif', subValue: 0, icon: 'lucide:user' },
  { label: 'Properti Aktif', value: 0, subLabel: 'Draft / Nonaktif', subValue: 0, icon: 'lucide:home' },
  { label: 'Tipe Properti', value: 0, subLabel: 'Kategori Jenis', subValue: 'Varian', icon: 'lucide:layers' },
  { label: 'Wilayah (Kota)', value: 0, subLabel: 'Cakupan Kota', subValue: 'Kota', icon: 'lucide:map-pin' },
  { label: 'Area / Lokasi', value: 0, subLabel: 'Titik Lokasi', subValue: 'Area', icon: 'lucide:map' },
  { label: 'FAQ Bot', value: 0, subLabel: 'Bantuan Bot', subValue: 'Konten', icon: 'lucide:help-circle' },
  { label: 'Bot Prompt', value: 0, subLabel: 'Instruksi AI', subValue: 'Prompt', icon: 'lucide:bot' },
])

const isLoading = ref(true)

const fetchData = async () => {
  try {
    isLoading.value = true
    const [resAdmin, resCust, resProp, resKota, resArea, resFaq, resPrompt] = await Promise.all([
      api.get('/api/admin/getAll', { headers: { 'X-Jenis-User': 'Admin', 'Api-Key': 'realestate_key_2024' } }).catch(() => ({ data: { Data: [] } })),
      api.get('/api/customer/getAll', { headers: { 'X-Jenis-User': 'Admin', 'Api-Key': 'realestate_key_2024' } }).catch(() => ({ data: { Data: [] } })),
      api.get('/api/realEstate/getAll', { headers: { 'X-Jenis-User': 'Admin', 'Api-Key': 'realestate_key_2024' } }).catch(() => ({ data: { Data: [] } })),
      api.get('/api/kota/getAll').catch(() => ({ data: { Data: [] } })),
      api.get('/api/area/getAll').catch(() => ({ data: { Data: [] } })),
      api.get('/api/faq/getAll').catch(() => ({ data: { Data: [] } })),
      api.get('/api/botPrompt/getAll', { headers: { 'X-Jenis-User': 'Admin', 'Api-Key': 'realestate_key_2024' } }).catch(() => ({ data: { Data: [] } })),
    ])

    const admins = resAdmin.data.Data || []
    const customers = resCust.data.Data || []
    const properties = resProp.data.Data || []
    const categories = [...new Set(properties.map((p: any) => p.Tipe))].filter(Boolean)

    // Assign Values
    stats.value[0].value = admins.length
    stats.value[0].subValue = admins.filter((a: any) => a.Status_User === 'Nonaktif').length
    
    stats.value[1].value = customers.length
    stats.value[1].subValue = customers.filter((c: any) => c.Status_User === 'Nonaktif').length

    stats.value[2].value = properties.filter((p: any) => p.Status_Display === 'Aktif').length
    stats.value[2].subValue = properties.filter((p: any) => p.Status_Display === 'Draft' || p.Status_Display === 'Nonaktif').length

    stats.value[3].value = categories.length
    stats.value[4].value = (resKota.data.Data || []).length
    stats.value[5].value = (resArea.data.Data || []).length
    stats.value[6].value = (resFaq.data.Data || []).length
    stats.value[7].value = (resPrompt.data.Data || []).length
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
        <div v-for="i in 8" :key="i" class="bg-white rounded-[2rem] p-6 border border-slate-50 animate-pulse h-32"></div>
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
