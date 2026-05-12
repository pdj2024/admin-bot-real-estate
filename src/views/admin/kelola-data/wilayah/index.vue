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
const selectedIds = ref<Record<string, { type: string, item: any }>>({})
const isAllSelected = computed(() => {
  const totalItems = dataWilayah.value.kota.length + dataWilayah.value.area.length + dataWilayah.value.prioritas.length
  if (totalItems === 0) return false
  return Object.keys(selectedIds.value).length === totalItems
})

const isSomeSelected = computed(() => {
  const selectedCount = Object.keys(selectedIds.value).length
  return selectedCount > 0 && !isAllSelected.value
})

const toggleAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = {}
  } else {
    const newSelected: Record<string, any> = {}
    dataWilayah.value.kota.forEach((item: any) => {
      const id = item.No_Id || item.No_Id_Kota
      newSelected[`kota:${id}`] = { type: 'kota', item }
    })
    dataWilayah.value.area.forEach((item: any) => {
      const id = item.No_Id || item.No_Id_Area
      newSelected[`area:${id}`] = { type: 'area', item }
    })
    dataWilayah.value.prioritas.forEach((item: any) => {
      const id = item.No_Id || item.No_Id_Prioritas
      newSelected[`prioritas:${id}`] = { type: 'prioritas', item }
    })
    selectedIds.value = newSelected
  }
}

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

const toggleSelection = (type: string, item: any) => {
  const id = item.No_Id || item.No_Id_Kota || item.No_Id_Area || item.No_Id_Prioritas
  const key = `${type}:${id}`
  const isCurrentlySelected = !!selectedIds.value[key]
  const select = !isCurrentlySelected

  const updateItem = (t: string, itm: any, s: boolean) => {
    const itmId = itm.No_Id || itm.No_Id_Kota || itm.No_Id_Area || itm.No_Id_Prioritas
    const itmKey = `${t}:${itmId}`
    if (s) {
      selectedIds.value[itmKey] = { type: t, item: itm }
    } else {
      delete selectedIds.value[itmKey]
    }
  }

  updateItem(type, item, select)

  // Children logic
  if (type === 'kota') {
    const cityAreas = dataWilayah.value.area.filter((a: any) => a.Id_Kota === id)
    cityAreas.forEach((a: any) => {
      const areaId = a.No_Id || a.No_Id_Area
      updateItem('area', a, select)
      const areaPriorities = dataWilayah.value.prioritas.filter((p: any) => p.Id_Area === areaId)
      areaPriorities.forEach((p: any) => updateItem('prioritas', p, select))
    })
  } else if (type === 'area') {
    const areaPriorities = dataWilayah.value.prioritas.filter((p: any) => p.Id_Area === id)
    areaPriorities.forEach((p: any) => updateItem('prioritas', p, select))
  }
}

const isSelected = (type: string, item: any) => {
  const id = item.No_Id || item.No_Id_Kota || item.No_Id_Area || item.No_Id_Prioritas
  return !!selectedIds.value[`${type}:${id}`]
}

const showBatchActivate = computed(() => Object.values(selectedIds.value).some(x => x.item.Status !== 'aktif'))
const showBatchDeactivate = computed(() => Object.values(selectedIds.value).some(x => x.item.Status === 'aktif'))

const handleBatchUpdate = async (value: 'aktif' | 'nonaktif') => {
  const items = Object.values(selectedIds.value)
  if (items.length === 0) return

  confirmAlert(`Apakah Anda yakin ingin mengubah status ${items.length} wilayah terpilih menjadi ${value === 'aktif' ? 'Aktif' : 'Nonaktif'}?`, async () => {
    // Sort to handle parent levels first to optimize cascading (though toggleStatus handles it)
    const sorted = [...items].sort((a, b) => {
      const levels: any = { kota: 0, area: 1, prioritas: 2 }
      return levels[a.type] - levels[b.type]
    })

    for (const { type, item } of sorted) {
      await toggleStatus(type as any, item, value)
    }
    
    selectedIds.value = {}
    successAlert('Berhasil memperbarui status wilayah')
  })
}

const handleBatchDelete = async () => {
  const items = Object.values(selectedIds.value)
  if (items.length === 0) return

  confirmAlert(`Apakah Anda yakin ingin menghapus ${items.length} wilayah terpilih? Tindakan ini tidak dapat dibatalkan.`, async () => {
    loading.value = true
    try {
      // Sort in reverse order (prioritas -> area -> kota)
      const sorted = [...items].sort((a, b) => {
        const levels: any = { kota: 0, area: 1, prioritas: 2 }
        return levels[b.type] - levels[a.type]
      })

      for (const { type, item } of sorted) {
        const id = item.No_Id || item.No_Id_Kota || item.No_Id_Area || item.No_Id_Prioritas
        await api.delete(`/api/${type}/delete?no_id=${id}`)
      }
      
      selectedIds.value = {}
      successAlert('Berhasil menghapus wilayah terpilih')
      fetchAll()
    } catch (err: any) {
      failAlert(err.response?.data?.Message || 'Terjadi kesalahan saat menghapus data')
    } finally {
      loading.value = false
    }
  })
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

const currentPage = ref(0)
const pageSize = ref(10)

const paginatedData = computed(() => {
  const start = currentPage.value * pageSize.value
  const end = start + pageSize.value
  return hierarchicalData.value.slice(start, end)
})

const pageCount = computed(() => Math.ceil(hierarchicalData.value.length / pageSize.value))

const setPageSize = (size: number) => {
  pageSize.value = size
  currentPage.value = 0
}
</script>

<template>
  <Vertical>
    <div class="px-4 md:px-3 md:pt-1 pb-32 space-y-6 md:space-y-8">

      <!-- Main Content Card -->
      <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden relative">
        <!-- Batch Action Bar -->
        <Transition name="slide-up">
          <div v-if="Object.keys(selectedIds).length > 0" class="absolute top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 bg-white/80 backdrop-blur-md border border-bejo-100 rounded-3xl shadow-2xl shadow-bejo-500/10 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
            <div class="flex items-center gap-3 pr-4 border-r border-slate-100">
              <div class="size-10 rounded-xl bg-bejo-500 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-bejo-500/20">
                {{ Object.keys(selectedIds).length }}
              </div>
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Item Terpilih</span>
            </div>
            
            <div class="flex flex-wrap items-center gap-2">
              <button v-if="showBatchActivate" @click="handleBatchUpdate('aktif')" class="btn-batch bg-bejo-50 text-bejo-600 hover:bg-bejo-500 hover:text-white border-bejo-100">
                <Icon icon="lucide:check-circle" class="size-3.5" />
                Aktifkan Status
              </button>
              <button v-if="showBatchDeactivate" @click="handleBatchUpdate('nonaktif')" class="btn-batch bg-slate-50 text-slate-500 hover:bg-slate-900 hover:text-white border-slate-100">
                <Icon icon="lucide:x-circle" class="size-3.5" />
                Nonaktifkan Status
              </button>
              <button @click="handleBatchDelete" class="btn-batch bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border-red-100">
                <Icon icon="lucide:trash-2" class="size-3.5" />
                Hapus Data
              </button>
            </div>

            <button @click="selectedIds = {}" class="ml-auto flex items-center gap-2 px-4 py-2 text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-all">
              <Icon icon="lucide:rotate-ccw" class="size-3.5" />
              Batal
            </button>
          </div>
        </Transition>

        <!-- Header Section -->
        <div class="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h4 class="text-xl font-black text-slate-900 tracking-tight">Wilayah</h4>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Kelola hierarki geografis (Kota > Area > Kawasan)</p>
          </div>
          
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div class="relative group w-full md:w-64">
              <Icon icon="lucide:search" class="absolute left-4 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input v-model="searchQuery" placeholder="CARI WILAYAH..." class="w-full h-11 pl-10 pr-4 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all shadow-sm" />
            </div>
            <button @click="handleAdd('kota')" class="h-11 px-6 bg-bejo-500 hover:bg-bejo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-bejo-500/20 transition-all flex items-center justify-center gap-2 active:scale-95">
              <Icon icon="lucide:plus" class="size-3.5" />
              TAMBAH KOTA
            </button>
          </div>
        </div>
        <div class="lg:overflow-visible relative">
          <!-- Background Loading Indicator (No Flicker) -->
          <div v-if="loading && dataWilayah.kota.length > 0" class="absolute inset-0 z-10 bg-white/40 backdrop-blur-[1px] flex items-start justify-center pt-20 transition-all duration-300">
            <div class="bg-white px-4 py-2 rounded-2xl shadow-xl border border-bejo-100 flex items-center gap-3 animate-in fade-in zoom-in-95">
              <Icon icon="lucide:loader-2" class="animate-spin size-4 text-bejo-500" />
              <span class="text-[10px] font-black text-slate-600 uppercase tracking-widest">Sinkronisasi...</span>
            </div>
          </div>
          
          <div class="max-h-[600px] overflow-auto">
            <!-- Table Header -->
            <div class="grid bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 px-4 md:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] shadow-sm" style="grid-template-columns: 40px 1fr 1fr 200px;">
              <div class="flex justify-center">
                <input 
                  type="checkbox" 
                  :checked="isAllSelected" 
                  :indeterminate="isSomeSelected"
                  @change="toggleAll"
                  class="size-4 rounded border-slate-300 text-bejo-600 focus:ring-bejo-500/20 transition-all cursor-pointer" 
                />
              </div>
              <div class="flex items-center pl-2">
                <span>Nama Wilayah</span>
              </div>
              <div>Deskripsi</div>
              <div class="text-right pr-4">Aksi</div>
            </div>

            <!-- City List (Level 1) -->
            <div v-if="paginatedData.length > 0" class="divide-y divide-slate-50 border-separate border-spacing-0">
            <div v-for="city in paginatedData" :key="city._id" class="flex flex-col">
              <!-- City Row -->
              <div class="grid px-4 md:px-8 py-4 items-center hover:bg-slate-50/50 transition-colors group" style="grid-template-columns: 40px 1fr 1fr 200px;">
                <div class="flex justify-center">
                  <input type="checkbox" :checked="isSelected('kota', city)" @change="toggleSelection('kota', city)" class="size-4 rounded border-slate-300 text-bejo-600 focus:ring-bejo-500/20 transition-all cursor-pointer" />
                </div>
                
                <div class="flex items-center gap-3 pl-2 cursor-pointer select-none" @click="toggleCity(city._id)" :class="{ 'opacity-40 grayscale': !city._isActive }">
                  <button class="size-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-bejo-50 hover:text-bejo-600 transition-all pointer-events-none">
                    <Icon :icon="expandedCities.has(city._id) ? 'lucide:chevron-down' : 'lucide:chevron-right'" class="size-3.5" />
                  </button>
                  <div class="size-8 rounded-xl bg-bejo-50 flex items-center justify-center text-bejo-500 font-black text-xs">K</div>
                  <span class="text-sm font-black text-slate-900 hover:text-bejo-600 transition-colors" :class="{ 'bg-yellow-100 px-1.5 py-0.5 rounded-md text-yellow-900': isMatchingQuery(city.Nama) }">{{ city.Nama }}</span>
                </div>
                <div class="text-[11px] font-medium text-slate-400 truncate pr-4" :class="{ 'opacity-40 grayscale': !city._isActive }">{{ city.Deskripsi || '-' }}</div>
                <div class="flex justify-end items-center gap-2 pr-4">
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
                  <div class="grid pl-4 md:pl-8 pr-8 py-3 items-center hover:bg-white transition-colors group" style="grid-template-columns: 40px 1fr 1fr 200px;">
                    <div class="flex justify-center">
                      <input type="checkbox" :checked="isSelected('area', area)" @change="toggleSelection('area', area)" class="size-3.5 rounded border-slate-300 text-bejo-600 focus:ring-bejo-500/20 transition-all cursor-pointer" />
                    </div>
                    
                    <div class="flex items-center gap-3 pl-8 cursor-pointer select-none" @click="toggleArea(area._id)" :class="{ 'opacity-40 grayscale': !area._isActive }">
                      <button class="size-5 rounded-md bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-bejo-600 transition-all pointer-events-none">
                        <Icon :icon="expandedAreas.has(area._id) ? 'lucide:chevron-down' : 'lucide:chevron-right'" class="size-3" />
                      </button>
                      <div class="size-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 font-black text-[10px]">A</div>
                      <span class="text-xs font-bold text-slate-700 hover:text-bejo-600 transition-colors" :class="{ 'bg-yellow-100 px-1.5 py-0.5 rounded-md text-yellow-900': isMatchingQuery(area.Nama) }">{{ area.Nama }}</span>
                    </div>
                    
                    <div class="flex items-center gap-3" :class="{ 'opacity-40 grayscale': !area._isActive }">
                      <div class="text-[10px] font-medium text-slate-400 truncate max-w-[120px]">{{ area.Deskripsi || '-' }}</div>
                    </div>
                    <div class="flex justify-end items-center gap-1.5 pr-4">
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
                    <div v-for="prio in area._priorities" :key="prio.No_Id || prio.No_Id_Prioritas" class="grid pl-4 md:pl-8 pr-8 py-2.5 items-center hover:bg-slate-50/30 transition-colors group" style="grid-template-columns: 40px 1fr 1fr 200px;">
                      <div class="flex justify-center">
                        <input type="checkbox" :checked="isSelected('prioritas', prio)" @change="toggleSelection('prioritas', prio)" class="size-3 rounded border-slate-300 text-bejo-600 focus:ring-bejo-500/20 transition-all cursor-pointer" />
                      </div>
                      
                      <div class="flex items-center gap-3 pl-16" :class="{ 'opacity-40 grayscale': !prio._isActive }">
                        <div class="size-6 rounded-md bg-rose-50 flex items-center justify-center text-rose-500 font-black text-[9px]">P</div>
                        <span class="text-[11px] font-semibold text-slate-600" :class="{ 'bg-yellow-100 px-1.5 py-0.5 rounded-md text-yellow-900': isMatchingQuery(prio.Nama) }">{{ prio.Nama }}</span>
                      </div>
                      <div class="text-[9px] font-medium text-slate-400 truncate pr-4" :class="{ 'opacity-40 grayscale': !prio._isActive }">{{ prio.Deskripsi || '-' }}</div>
                      <div class="flex justify-end items-center gap-1.5 pr-4">
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

          <!-- Full Page Loading (Initial only) -->
          <div v-if="loading && dataWilayah.kota.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
             <Icon icon="lucide:loader-2" class="size-8 text-bejo-500 animate-spin mb-4" />
             <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memuat data wilayah...</p>
          </div>
        </div>
      </div>

      <!-- Pagination -->
        <div v-if="hierarchicalData.length > 0" class="px-6 py-5 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Menampilkan 
              <span class="text-slate-900 font-black">{{ paginatedData.length }}</span> 
              dari 
              <span class="text-slate-900 font-black">{{ hierarchicalData.length }}</span> 
              Kota
            </div>

            <div class="flex items-center gap-2">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menampilkan:</span>
              <select 
                :value="pageSize" 
                @change="e => setPageSize((e.target as HTMLSelectElement).value === 'all' ? hierarchicalData.length : Number((e.target as HTMLSelectElement).value))"
                class="h-8 min-w-[70px] px-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg outline-none cursor-pointer hover:border-bejo-500 transition-all shadow-sm"
              >
                <option v-for="size in [10, 25, 50, 100]" :key="size" :value="size">{{ size }}</option>
                <option value="all">Semua</option>
              </select>
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button @click="currentPage--" :disabled="currentPage === 0" class="btn-pagination">
              <Icon icon="lucide:chevron-left" class="size-4" />
            </button>

            <div class="flex items-center gap-1">
              <button v-for="n in pageCount" :key="n" @click="currentPage = n - 1" class="btn-pagination-num" :class="currentPage === n - 1 ? 'active' : ''">
                {{ n }}
              </button>
            </div>

            <button @click="currentPage++" :disabled="currentPage >= pageCount - 1" class="btn-pagination">
              <Icon icon="lucide:chevron-right" class="size-4" />
            </button>
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

@reference "@/assets/css/style.css";

.btn-pagination {
  @apply size-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400
         transition-all hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed;
}

.btn-pagination-num {
  @apply size-9 flex items-center justify-center rounded-xl text-xs font-black text-slate-400 hover:bg-slate-50 transition-all;
}

.btn-pagination-num.active {
  @apply bg-bejo-500 text-white shadow-lg shadow-bejo-500/20;
}

.btn-batch {
  @apply flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
