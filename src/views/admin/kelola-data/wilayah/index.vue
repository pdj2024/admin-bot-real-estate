<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Vertical from '@/layouts/vertical.vue'
import { Icon } from '@iconify/vue'
import WilayahModal from './components/WilayahModal.vue'
import { confirm as confirmAlert, success as successAlert, fail as failAlert } from '@/utils/sweet-alert'
import api from '@/services/axios'

const isModalOpen = ref(false)
const modalType = ref<'kota' | 'area' | 'prioritas'>('kota')
const modalParentId = ref<string | null>(null)
const selectedItem = ref<any>(null)
const loading = ref(false)
const searchQuery = ref('')

// Expansion state
const expandedCities = ref<Set<string>>(new Set())
const expandedAreas = ref<Set<string>>(new Set())

const toggleCity = (id: string) => {
  if (expandedCities.value.has(id)) expandedCities.value.delete(id)
  else expandedCities.value.add(id)
}

const toggleArea = (id: string) => {
  if (expandedAreas.value.has(id)) expandedAreas.value.delete(id)
  else expandedAreas.value.add(id)
}

const isMatchingQuery = (text: string) => {
  if (!searchQuery.value) return false
  return text.toLowerCase().includes(searchQuery.value.toLowerCase())
}

import { watch } from 'vue'
watch(searchQuery, (newQuery) => {
  expandedCities.value.clear()
  expandedAreas.value.clear()
  if (!newQuery) return
  
  const q = newQuery.toLowerCase()
  
  dataWilayah.value.kota.forEach((c: any) => {
    const cityId = c.No_Id || c.No_Id_Kota
    const cityAreas = dataWilayah.value.area.filter((a: any) => a.Id_Kota === cityId)
    let expandCity = false
    
    cityAreas.forEach((a: any) => {
      const areaId = a.No_Id || a.No_Id_Area
      const areaMatches = a.Nama.toLowerCase().includes(q)
      const areaPriorities = dataWilayah.value.prioritas.filter((p: any) => p.Id_Area === areaId)
      const hasMatchingPriority = areaPriorities.some((p: any) => p.Nama.toLowerCase().includes(q))
      
      if (areaMatches || hasMatchingPriority) {
        expandCity = true
      }
      if (hasMatchingPriority) {
        expandedAreas.value.add(areaId)
      }
    })
    
    if (expandCity) {
      expandedCities.value.add(cityId)
    }
  })
})

// Data
const dataWilayah = ref<any>({
  kota: [],
  area: [],
  prioritas: []
})

const fetchKota = async () => {
  const { data } = await api.get('/api/kota/getAll')
  if (data.StatusCode === 200) dataWilayah.value.kota = data.Data
}

const fetchArea = async () => {
  const { data } = await api.get('/api/area/getAll')
  if (data.StatusCode === 200) dataWilayah.value.area = data.Data
}

const fetchPrioritas = async () => {
  const { data } = await api.get('/api/prioritas/getAll')
  if (data.StatusCode === 200) dataWilayah.value.prioritas = data.Data
}

const fetchAll = async () => {
  loading.value = true
  await Promise.all([fetchKota(), fetchArea(), fetchPrioritas()])
  loading.value = false
}

onMounted(fetchAll)

const handleAdd = (type: 'kota' | 'area' | 'prioritas', parentId: string | null = null) => {
  modalType.value = type
  modalParentId.value = parentId
  selectedItem.value = null
  isModalOpen.value = true
}

const handleEdit = (type: 'kota' | 'area' | 'prioritas', item: any) => {
  modalType.value = type
  selectedItem.value = item
  isModalOpen.value = true
}

const handleDelete = (type: string, id: string) => {
  confirmAlert(`Ingin menghapus data ${type} ini?`, async () => {
    try {
      const endpoint = `/api/${type}/delete?no_id=${id}`
      const { data } = await api.delete(endpoint)
      if (data.StatusCode === 200) {
        successAlert('Data berhasil dihapus')
        fetchAll()
      } else {
        failAlert(data.Message || 'Gagal menghapus data')
      }
    } catch (err: any) {
      failAlert(err.response?.data?.Message || 'Terjadi kesalahan sistem')
    }
  })
}

const toggleStatus = async (type: 'kota' | 'area' | 'prioritas', item: any, forceStatus?: string) => {
  const newStatus = forceStatus || (item.Status === 'aktif' ? 'nonaktif' : 'aktif')
  const itemId = item.No_Id || item.No_Id_Kota || item.No_Id_Area || item.No_Id_Prioritas
  
  try {
    const payload: any = {
      Nama: item.Nama,
      Deskripsi: item.Deskripsi || null,
      status: newStatus // Using lowercase 'status' as per user request
    }
    
    if (type === 'area') payload.Id_Kota = item.Id_Kota
    if (type === 'prioritas') payload.Id_Area = item.Id_Area || null
    
    const { data } = await api.put(`/api/${type}/update?no_id=${itemId}`, payload, {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    
    if (data.StatusCode === 200) {
      // Update source of truth to trigger computed property reactivity
      const sourceList = dataWilayah.value[type]
      const originalItem = sourceList.find((x: any) => (x.No_Id || x.No_Id_Kota || x.No_Id_Area || x.No_Id_Prioritas) === itemId)
      if (originalItem) {
        originalItem.Status = newStatus
      }

      // Cascading Status: If parent status changes, children follow (both for active and non-active)
      if (type === 'kota') {
        const children = dataWilayah.value.area.filter((a: any) => a.Id_Kota === itemId)
        for (const child of children) {
          if (child.Status !== newStatus) await toggleStatus('area', child, newStatus)
        }
      } else if (type === 'area') {
        const children = dataWilayah.value.prioritas.filter((p: any) => p.Id_Area === itemId)
        for (const child of children) {
          if (child.Status !== newStatus) await toggleStatus('prioritas', child, newStatus)
        }
      }
    }
  } catch (err) {
    console.error(`Gagal mengubah status ${type}:`, err)
  }
}

// Nested structure for rendering
const hierarchicalData = computed(() => {
  let cities = [...dataWilayah.value.kota]
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    cities = cities.filter(c => 
      c.Nama.toLowerCase().includes(q) ||
      dataWilayah.value.area.some((a: any) => 
        (a.Id_Kota === (c.No_Id || c.No_Id_Kota)) && 
        (a.Nama.toLowerCase().includes(q) || 
         dataWilayah.value.prioritas.some((p: any) => (p.Id_Area === (a.No_Id || a.No_Id_Area)) && p.Nama.toLowerCase().includes(q)))
      )
    )
  }

  return cities.map(city => {
    const cityId = city.No_Id || city.No_Id_Kota
    const isCityActive = city.Status !== 'nonaktif'
    const cityAreas = dataWilayah.value.area.filter((a: any) => a.Id_Kota === cityId)
    
    return {
      ...city,
      _id: cityId,
      _isActive: isCityActive,
      _areas: cityAreas.map((area: any) => {
        const areaId = area.No_Id || area.No_Id_Area
        const isAreaActive = isCityActive && area.Status !== 'nonaktif'
        return {
          ...area,
          _id: areaId,
          _isActive: isAreaActive,
          _priorities: dataWilayah.value.prioritas.filter((p: any) => p.Id_Area === areaId).map((prio: any) => ({
            ...prio,
            _isActive: isAreaActive && prio.Status !== 'nonaktif'
          }))
        }
      })
    }
  })
})
</script>

<template>
  <Vertical>
    <div class="p-0 md:p-3 md:pt-1 pb-32 space-y-6 md:space-y-8">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight leading-tight">Wilayah</h1>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Kelola hierarki geografis (Kota > Area > Kawasan)</p>
        </div>
        
        <div class="flex items-center gap-3">
          <div class="relative group w-64">
            <Icon icon="lucide:search" class="absolute left-4 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <input v-model="searchQuery" placeholder="CARI WILAYAH..." class="w-full h-10 pl-10 pr-4 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all shadow-sm" />
          </div>
          <button @click="handleAdd('kota')" class="h-10 px-6 bg-bejo-500 hover:bg-bejo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-bejo-500/20 transition-all flex items-center gap-2 active:scale-95">
            <Icon icon="lucide:plus" class="size-3.5" />
            TAMBAH KOTA
          </button>
        </div>
      </div>

      <!-- Hierarchical List -->
      <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div class="min-w-full">
          <!-- Table Header -->
          <div class="grid grid-cols-12 bg-slate-50/50 border-b border-slate-50 px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <div class="col-span-6">Nama Wilayah</div>
            <div class="col-span-3">Deskripsi</div>
            <div class="col-span-3 text-right pr-4">Aksi</div>
          </div>

          <!-- City List (Level 1) -->
          <div v-if="hierarchicalData.length > 0" class="divide-y divide-slate-50">
            <div v-for="city in hierarchicalData" :key="city._id" class="flex flex-col">
              <!-- City Row -->
              <div class="grid grid-cols-12 px-8 py-4 items-center hover:bg-slate-50/50 transition-colors group">
                <div class="col-span-6 flex items-center gap-4 cursor-pointer select-none" @click="toggleCity(city._id)" :class="{ 'opacity-40 grayscale': !city._isActive }">
                  <button class="size-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-bejo-50 hover:text-bejo-600 transition-all pointer-events-none">
                    <Icon :icon="expandedCities.has(city._id) ? 'lucide:chevron-down' : 'lucide:chevron-right'" class="size-3.5" />
                  </button>
                  <div class="size-8 rounded-xl bg-bejo-50 flex items-center justify-center text-bejo-500 font-black text-xs">K</div>
                  <span class="text-sm font-black text-slate-900 hover:text-bejo-600 transition-colors" :class="{ 'bg-yellow-100 px-1.5 py-0.5 rounded-md text-yellow-900': isMatchingQuery(city.Nama) }">{{ city.Nama }}</span>
                </div>
                <div class="col-span-3 text-[11px] font-medium text-slate-400 truncate pr-4" :class="{ 'opacity-40 grayscale': !city._isActive }">{{ city.Deskripsi || '-' }}</div>
                <div class="col-span-3 flex justify-end items-center gap-2 pr-4">
                  <!-- Toggle Kota Status -->
                  <button 
                    @click.stop="toggleStatus('kota', city)"
                    class="relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-sm mr-2"
                    :class="city.Status === 'aktif' ? 'bg-bejo-600' : 'bg-slate-300'"
                  >
                    <span class="sr-only">Toggle City Status</span>
                    <span
                      aria-hidden="true"
                      class="pointer-events-none inline-block size-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                      :class="city.Status === 'aktif' ? 'translate-x-4' : 'translate-x-0'"
                    />
                  </button>

                  <button @click="handleAdd('area', city._id)" title="Tambah Area" class="size-8 rounded-lg bg-bejo-50 text-bejo-600 flex items-center justify-center hover:bg-bejo-600 hover:text-white transition-all border border-bejo-100">
                    <Icon icon="lucide:plus" class="size-3.5" />
                  </button>
                  <button @click="handleEdit('kota', city)" class="size-8 rounded-lg bg-slate-100 text-slate-600 hover:text-bejo-600 hover:bg-bejo-50 transition-all flex items-center justify-center">
                    <Icon icon="lucide:pencil" class="size-3.5" />
                  </button>
                  <button @click="handleDelete('kota', city._id)" class="size-8 rounded-lg bg-slate-100 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center">
                    <Icon icon="lucide:trash-2" class="size-3.5" />
                  </button>
                </div>
              </div>

              <!-- Area List (Level 2) -->
              <div v-if="expandedCities.has(city._id)" class="bg-slate-50/30 divide-y divide-slate-100">
                <div v-for="area in city._areas" :key="area._id" class="flex flex-col">
                  <!-- Area Row -->
                  <div class="grid grid-cols-12 pl-20 pr-8 py-3 items-center hover:bg-white transition-colors group">
                    <div class="col-span-6 flex items-center gap-3 cursor-pointer select-none" @click="toggleArea(area._id)" :class="{ 'opacity-40 grayscale': !area._isActive }">
                      <button class="size-5 rounded-md bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-bejo-600 transition-all pointer-events-none">
                        <Icon :icon="expandedAreas.has(area._id) ? 'lucide:chevron-down' : 'lucide:chevron-right'" class="size-3" />
                      </button>
                      <div class="size-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 font-black text-[10px]">A</div>
                      <span class="text-xs font-bold text-slate-700 hover:text-bejo-600 transition-colors" :class="{ 'bg-yellow-100 px-1.5 py-0.5 rounded-md text-yellow-900': isMatchingQuery(area.Nama) }">{{ area.Nama }}</span>
                    </div>
                    
                    <div class="col-span-3 flex items-center gap-3" :class="{ 'opacity-40 grayscale': !area._isActive }">
                      <div class="text-[10px] font-medium text-slate-400 truncate max-w-[120px]">{{ area.Deskripsi || '-' }}</div>
                    </div>
                    <div class="col-span-3 flex justify-end items-center gap-1.5 pr-4">
                      <!-- Toggle Area Status -->
                      <button 
                        @click.stop="toggleStatus('area', area)"
                        class="relative inline-flex h-3.5 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-sm mr-1.5"
                        :class="area.Status === 'aktif' ? 'bg-bejo-600' : 'bg-slate-300'"
                      >
                        <span class="sr-only">Toggle Area Status</span>
                        <span
                          aria-hidden="true"
                          class="pointer-events-none inline-block size-2.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                          :class="area.Status === 'aktif' ? 'translate-x-3.5' : 'translate-x-0'"
                        />
                      </button>

                      <button @click="handleAdd('prioritas', area._id)" title="Tambah Kawasan" class="size-7 rounded-lg bg-stone-50 text-stone-600 flex items-center justify-center hover:bg-stone-600 hover:text-white transition-all border border-stone-100">
                        <Icon icon="lucide:plus" class="size-3" />
                      </button>
                      <button @click="handleEdit('area', area)" class="size-7 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-bejo-600 hover:bg-bejo-50 transition-all flex items-center justify-center">
                        <Icon icon="lucide:pencil" class="size-3" />
                      </button>
                      <button @click="handleDelete('area', area._id)" class="size-7 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center">
                        <Icon icon="lucide:trash-2" class="size-3" />
                      </button>
                    </div>
                  </div>

                  <!-- Priority List (Level 3) -->
                  <div v-if="expandedAreas.has(area._id)" class="bg-white divide-y divide-slate-50">
                    <div v-for="prio in area._priorities" :key="prio.No_Id || prio.No_Id_Prioritas" class="grid grid-cols-12 pl-32 pr-8 py-2.5 items-center hover:bg-slate-50/30 transition-colors group">
                      <div class="col-span-6 flex items-center gap-3" :class="{ 'opacity-40 grayscale': !prio._isActive }">
                        <div class="size-6 rounded-md bg-rose-50 flex items-center justify-center text-rose-500 font-black text-[9px]">P</div>
                        <span class="text-[11px] font-semibold text-slate-600" :class="{ 'bg-yellow-100 px-1.5 py-0.5 rounded-md text-yellow-900': isMatchingQuery(prio.Nama) }">{{ prio.Nama }}</span>
                      </div>
                      <div class="col-span-3 text-[9px] font-medium text-slate-400 truncate pr-4" :class="{ 'opacity-40 grayscale': !prio._isActive }">{{ prio.Deskripsi || '-' }}</div>
                      <div class="col-span-3 flex justify-end items-center gap-1.5 pr-4">
                        <!-- Toggle Prioritas Status -->
                        <button 
                          @click.stop="toggleStatus('prioritas', prio)"
                          class="relative inline-flex h-3 w-6 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-sm mr-1"
                          :class="prio.Status === 'aktif' ? 'bg-bejo-600' : 'bg-slate-300'"
                        >
                          <span class="sr-only">Toggle Priority Status</span>
                          <span
                            aria-hidden="true"
                            class="pointer-events-none inline-block size-2 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                            :class="prio.Status === 'aktif' ? 'translate-x-3' : 'translate-x-0'"
                          />
                        </button>

                        <button @click="handleEdit('prioritas', prio)" class="size-6 rounded-md bg-slate-100 text-slate-500 hover:text-bejo-600 transition-all flex items-center justify-center">
                          <Icon icon="lucide:pencil" class="size-3" />
                        </button>
                        <button @click="handleDelete('prioritas', prio.No_Id || prio.No_Id_Prioritas)" class="size-6 rounded-md bg-slate-100 text-slate-500 hover:text-red-600 transition-all flex items-center justify-center">
                          <Icon icon="lucide:trash-2" class="size-3" />
                        </button>
                      </div>
                    </div>
                    <!-- Empty State for Level 3 -->
                    <div v-if="area._priorities.length === 0" class="pl-32 py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Belum ada prioritas</div>
                  </div>
                </div>
                <!-- Empty State for Level 2 -->
                <div v-if="city._areas.length === 0" class="pl-20 py-6 text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Belum ada area</div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="!loading" class="flex flex-col items-center justify-center py-20 text-center">
            <div class="size-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
              <Icon icon="lucide:inbox" class="size-8 text-slate-200" />
            </div>
            <p class="text-sm font-black text-slate-400 uppercase tracking-widest">Wilayah tidak ditemukan</p>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-center">
             <Icon icon="lucide:loader-2" class="size-8 text-bejo-500 animate-spin mb-4" />
             <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memuat data wilayah...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Reusing WilayahModal -->
    <WilayahModal
      :show="isModalOpen"
      :type="modalType"
      :editData="selectedItem"
      :parentId="modalParentId"
      :allData="dataWilayah"
      @close="isModalOpen = false"
      @success="fetchAll"
    />
  </Vertical>
</template>

<style scoped>
.scale-in { animation: scale-in 0.2s ease-out; }
@keyframes scale-in { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
</style>
