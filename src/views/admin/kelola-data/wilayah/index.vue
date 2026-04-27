<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Vertical from '@/layouts/vertical.vue'
import { Icon } from '@iconify/vue'
import WilayahModal from './components/WilayahModal.vue'
import { confirm as confirmAlert, success as successAlert, fail as failAlert } from '@/utils/sweet-alert'
import api from '@/services/axios'

// Tab definitions
const tabs = [
  { id: 'kota', label: 'Kota', icon: 'lucide:map-pin' },
  { id: 'area', label: 'Area', icon: 'lucide:map' },
  { id: 'prioritas', label: 'Prioritas', icon: 'lucide:flag' }
]

const activeTab = ref('kota')
const isModalOpen = ref(false)
const selectedItem = ref<any>(null)
const loading = ref(false)
const searchQuery = ref('')

// Real Data
const dataWilayah = ref<any>({
  kota: [],
  area: [],
  prioritas: []
})

const fetchKota = async () => {
  try {
    const { data } = await api.get('/api/kota/getAll')
    if (data.StatusCode === 200) dataWilayah.value.kota = data.Data
  } catch (err) {}
}

const fetchArea = async () => {
  try {
    const { data } = await api.get('/api/area/getAll')
    if (data.StatusCode === 200) dataWilayah.value.area = data.Data
  } catch (err) {}
}

const fetchPrioritas = async () => {
  try {
    const { data } = await api.get('/api/prioritas/getAll')
    if (data.StatusCode === 200) dataWilayah.value.prioritas = data.Data
  } catch (err) {}
}

const fetchAll = async () => {
  loading.value = true
  await Promise.all([fetchKota(), fetchArea(), fetchPrioritas()])
  loading.value = false
}

onMounted(fetchAll)

// Refresh when tab changes if data is empty or to ensure fresh data
watch(activeTab, () => {
  searchQuery.value = ''
})

const currentData = computed(() => {
  const data = dataWilayah.value[activeTab.value as keyof typeof dataWilayah.value] || []
  if (!searchQuery.value) return data
  
  return data.filter((item: any) => 
    item.Nama.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const handleAdd = () => {
  selectedItem.value = null
  isModalOpen.value = true
}

const handleEdit = (item: any) => {
  selectedItem.value = item
  isModalOpen.value = true
}

const handleDelete = (id: string) => {
  confirmAlert(`Ingin menghapus data ${activeTab.value} ini?`, async () => {
    try {
      const endpoint = `/api/${activeTab.value}/delete?no_id=${id}`
      const { data } = await api.delete(endpoint)
      if (data.StatusCode === 200) {
        successAlert('Data berhasil dihapus')
        fetchAll() // Refresh all to keep consistency
      } else {
        failAlert(data.Message || 'Gagal menghapus data')
      }
    } catch (err: any) {
      failAlert(err.response?.data?.Message || 'Terjadi kesalahan sistem')
    }
  })
}

const handleSuccess = () => {
  fetchAll()
}
</script>

<template>
  <Vertical>
    <div class="p-0 md:p-3 md:pt-1 pb-32 space-y-6 md:space-y-8">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight leading-tight">Master Wilayah</h1>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Kelola data geografis dan prioritas area</p>
        </div>
        
        <button 
          @click="handleAdd"
          class="px-6 py-3 bg-bejo-500 hover:bg-bejo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-bejo-500/20 transition-all flex items-center gap-2 active:scale-95"
        >
          <Icon icon="lucide:plus" class="size-4" />
          Tambah {{ tabs.find(t => t.id === activeTab)?.label }}
        </button>
      </div>

      <!-- Tabs Navigation & Search -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-2 p-1.5 bg-slate-100 rounded-3xl w-fit overflow-x-auto max-w-full custom-scrollbar-hide">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap',
              activeTab === tab.id 
                ? 'bg-white text-bejo-600 shadow-sm border border-slate-200' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            ]"
          >
            <Icon :icon="tab.icon" class="size-4" />
            {{ tab.label }}
          </button>
        </div>

        <div class="relative group w-full md:w-72">
          <Icon 
            icon="lucide:search" 
            class="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-bejo-500 transition-colors" 
          />
          <input 
            v-model="searchQuery"
            type="text" 
            :placeholder="`Cari ${tabs.find(t => t.id === activeTab)?.label}...`"
            class="w-full h-12 pl-12 pr-6 bg-white border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest placeholder:text-slate-300 focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all shadow-xl shadow-slate-200/40"
          />
          <button 
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-4 top-1/2 -translate-y-1/2 size-6 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-50 hover:text-slate-600 transition-all"
          >
            <Icon icon="lucide:x" class="size-3.5" />
          </button>
        </div>
      </div>

      <!-- Table Content -->
      <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div class="overflow-x-auto overflow-y-hidden">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50/50 border-b border-slate-50">
                <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-20">No</th>
                <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama {{ tabs.find(t => t.id === activeTab)?.label }}</th>
                <th v-if="activeTab !== 'kota'" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Parent / Lokasi</th>
                <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-48">Deskripsi</th>
                <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="(item, index) in currentData" :key="item.No_Id" class="hover:bg-slate-50/50 transition-colors group">
                <td class="px-8 py-5 text-sm font-black text-slate-400">{{ index + 1 }}</td>
                <td class="px-8 py-5">
                  <div class="flex items-center gap-3">
                    <div class="size-8 rounded-xl bg-bejo-50 flex items-center justify-center text-bejo-500 font-black text-xs">
                      {{ item.Nama ? item.Nama.charAt(0) : '?' }}
                    </div>
                    <span class="text-sm font-black text-slate-900">{{ item.Nama }}</span>
                  </div>
                </td>
                <td v-if="activeTab !== 'kota'" class="px-8 py-5">
                  <span class="text-xs font-bold text-slate-500">
                    {{ activeTab === 'area' ? item.Nama_Kota : item.Name_Area || '-' }}
                  </span>
                </td>
                <td class="px-8 py-5">
                  <span class="text-[11px] font-medium text-slate-400 truncate block max-w-[150px]">{{ item.Deskripsi || '-' }}</span>
                </td>
                <td class="px-8 py-5">
                  <div class="flex items-center justify-end gap-2 outline-none">
                    <button 
                      @click="handleEdit(item)"
                      class="size-9 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-bejo-600 hover:border-bejo-100 hover:bg-bejo-50 transition-all flex items-center justify-center group-hover:shadow-lg group-hover:shadow-bejo-500/10"
                    >
                      <Icon icon="lucide:pencil" class="size-4" />
                    </button>
                    <button 
                      @click="handleDelete(item.No_Id)"
                      class="size-9 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all flex items-center justify-center group-hover:shadow-lg group-hover:shadow-red-500/10"
                    >
                      <Icon icon="lucide:trash-2" class="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="currentData.length === 0 && !loading" class="flex flex-col items-center justify-center py-20 text-center">
          <div class="size-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
            <Icon icon="lucide:inbox" class="size-8 text-slate-200" />
          </div>
          <p class="text-sm font-black text-slate-400 uppercase tracking-widest">Belum ada data</p>
        </div>

        <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-center">
           <Icon icon="lucide:loader-2" class="size-8 text-bejo-500 animate-spin mb-4" />
           <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memuat data...</p>
        </div>
      </div>
    </div>

    <WilayahModal
      :show="isModalOpen"
      :type="activeTab"
      :editData="selectedItem"
      :allData="dataWilayah as any"
      @close="isModalOpen = false"
      @success="handleSuccess"
    />
  </Vertical>
</template>

<style scoped>
.custom-scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.custom-scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
