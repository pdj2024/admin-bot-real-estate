<script setup lang="ts">
import { ref, computed } from 'vue'
import Vertical from '@/layouts/vertical.vue'
import { Icon } from '@iconify/vue'
import WilayahModal from './components/WilayahModal.vue'
import { confirm as confirmAlert, success as successAlert } from '@/utils/sweet-alert'

// Tab definitions
const tabs = [
  { id: 'kota', label: 'Kota', icon: 'lucide:map-pin' },
  { id: 'area', label: 'Area', icon: 'lucide:map' },
  { id: 'kecamatan', label: 'Kecamatan', icon: 'lucide:navigation' },
  { id: 'kelurahan', label: 'Kelurahan', icon: 'lucide:home' },
  { id: 'prioritas', label: 'Prioritas', icon: 'lucide:flag' }
]

const activeTab = ref('kota')
const isModalOpen = ref(false)
const selectedItem = ref<any>(null)

// Dummy Data
const dummyData = ref({
  kota: [
    { id: 'k1', nama: 'Surabaya' },
    { id: 'k2', nama: 'Sidoarjo' },
    { id: 'k3', nama: 'Gresik' }
  ],
  area: [
    { id: 'a1', nama: 'Surabaya Barat', kotaId: 'k1' },
    { id: 'a2', nama: 'Surabaya Timur', kotaId: 'k1' },
    { id: 'a3', nama: 'Surabaya Pusat', kotaId: 'k1' },
    { id: 'a4', nama: 'Waru', kotaId: 'k2' }
  ],
  kecamatan: [
    { id: 'kec1', nama: 'Sambikerep', areaId: 'a1' },
    { id: 'kec2', nama: 'Lakarsantri', areaId: 'a1' },
    { id: 'kec3', nama: 'Gubeng', areaId: 'a2' },
    { id: 'kec4', nama: 'Mulyorejo', areaId: 'a3' }
  ],
  kelurahan: [
    { id: 'kel1', nama: 'Lontar', kecamatanId: 'kec1' },
    { id: 'kel2', nama: 'Made', kecamatanId: 'kec1' },
    { id: 'kel3', nama: 'Citraland', kecamatanId: 'kec2' },
    { id: 'kel4', nama: 'Airlangga', kecamatanId: 'kec3' }
  ],
  prioritas: [
    { id: 'p1', nama: 'High Priority (Surabaya Barat)', areaId: 'a1', level: 'High' },
    { id: 'p2', nama: 'Medium Priority (Surabaya Timur)', areaId: 'a2', level: 'Medium' },
    { id: 'p3', nama: 'Low Priority (Surabaya Pusat)', areaId: 'a3', level: 'Low' }
  ]
})

const currentData = computed(() => {
  const data = dummyData.value[activeTab.value as keyof typeof dummyData.value] || []
  
  // Enhancement: Add parent names for better context in table
  return data.map((item: any) => {
    let parentName = ''
    if (activeTab.value === 'area') {
      parentName = dummyData.value.kota.find(k => k.id === item.kotaId)?.nama || ''
    } else if (activeTab.value === 'kecamatan') {
      parentName = dummyData.value.area.find(a => a.id === item.areaId)?.nama || ''
    } else if (activeTab.value === 'kelurahan') {
      parentName = dummyData.value.kecamatan.find(k => k.id === item.kecamatanId)?.nama || ''
    } else if (activeTab.value === 'prioritas') {
      parentName = dummyData.value.area.find(a => a.id === item.areaId)?.nama || ''
    }
    return { ...item, parentName }
  })
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
  confirmAlert(`Ingin menghapus data ${activeTab.value} ini?`, () => {
    const list = (dummyData.value as any)[activeTab.value];
    (dummyData.value as any)[activeTab.value] = list.filter((i: any) => i.id !== id)
    successAlert('Data berhasil dihapus')
  })
}

const handleSuccess = ({ type, data, isEdit }: { type: string, data: any, isEdit: boolean }) => {
  const list = (dummyData.value as any)[type]
  if (isEdit) {
    const index = list.findIndex((i: any) => i.id === data.id)
    if (index !== -1) list[index] = data
  } else {
    data.id = `${type.charAt(0)}${Math.floor(Math.random() * 1000)}`
    list.push(data)
  }
}
</script>

<template>
  <Vertical>
    <div class="p-4 md:p-6 md:pt-4 pb-32 space-y-6 md:space-y-8">
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

      <!-- Tabs Navigation -->
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

      <!-- Table Content -->
      <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50/50 border-b border-slate-50">
                <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-20">No</th>
                <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama {{ tabs.find(t => t.id === activeTab)?.label }}</th>
                <th v-if="activeTab !== 'kota'" class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Parent / Lokasi</th>
                <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="(item, index) in currentData" :key="item.id" class="hover:bg-slate-50/50 transition-colors group">
                <td class="px-8 py-5 text-sm font-black text-slate-400">{{ index + 1 }}</td>
                <td class="px-8 py-5">
                  <div class="flex items-center gap-3">
                    <div class="size-8 rounded-xl bg-bejo-50 flex items-center justify-center text-bejo-500 font-black text-xs">
                      {{ item.nama.charAt(0) }}
                    </div>
                    <span class="text-sm font-black text-slate-900">{{ item.nama }}</span>
                    <span v-if="item.level" class="text-[9px] font-black bg-bejo-100 text-bejo-600 px-2 py-0.5 rounded-full uppercase tracking-widest">{{ item.level }}</span>
                  </div>
                </td>
                <td v-if="activeTab !== 'kota'" class="px-8 py-5">
                  <span class="text-xs font-bold text-slate-500">{{ item.parentName || '-' }}</span>
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
                      @click="handleDelete(item.id)"
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
        <div v-if="currentData.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
          <div class="size-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
            <Icon icon="lucide:inbox" class="size-8 text-slate-200" />
          </div>
          <p class="text-sm font-black text-slate-400 uppercase tracking-widest">Belum ada data</p>
        </div>
      </div>
    </div>

    <WilayahModal
      :show="isModalOpen"
      :type="activeTab"
      :editData="selectedItem"
      :allData="dummyData as any"
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
