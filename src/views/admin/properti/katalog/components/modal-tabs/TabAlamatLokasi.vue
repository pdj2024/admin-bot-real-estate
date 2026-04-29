<script setup lang="ts">
import { inject, ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import BaseFormGroup from '@/components/common/BaseFormGroup.vue'
import GoogleMapsPicker from '@/components/common/GoogleMapsPicker.vue'
import WilayahModal from '@/views/admin/kelola-data/wilayah/components/WilayahModal.vue'

const state = inject<any>('propertyModalState')
if (!state) {
  throw new Error('TabAlamatLokasi must be used within a component providing propertyModalState')
}

const {
  form,
  searchQuery,
  handleSearchInput,
  isPredictionsOpen,
  predictions,
  selectPrediction,
  isGeocoding,
  cities,
  areas,
  priorities,
  isWilayahModalOpen,
  wilayahModalType,
  wilayahModalParentId,
  openWilayahModal: openModal,
  handleWilayahSuccess,
  fetchCities,
  fetchPriorities,
  virtualPriorities,
  virtualCities,
  virtualAreas: globalVirtualAreas
} = state

// Dropdown State
const dropdownKotaRef = ref<HTMLElement | null>(null)
const dropdownAreaRef = ref<HTMLElement | null>(null)
const dropdownPrioRef = ref<HTMLElement | null>(null)
const menuKotaRef = ref<HTMLElement | null>(null)
const menuAreaRef = ref<HTMLElement | null>(null)
const menuPrioRef = ref<HTMLElement | null>(null)
const dropdownStyles = ref({ kota: {}, area: {}, prio: {} })

const isKotaOpen = ref(false)
const isAreaOpen = ref(false)
const isPrioOpen = ref(false)

const openWilayahModal = (type: 'kota' | 'area' | 'prioritas') => {
  isKotaOpen.value = false
  isAreaOpen.value = false
  isPrioOpen.value = false
  
  let parentId = null
  if (type === 'area') parentId = form.value.Id_Kota
  if (type === 'prioritas') parentId = form.value.Id_Area  
  openModal(type, parentId)
}

const searchKota = ref('')
const searchArea = ref('')
const searchPrio = ref('')

const selectedCityName = computed(() => {
  if (!form.value.Id_Kota) return ''
  const city = cities.value.find((c: any) => c.No_Id === form.value.Id_Kota || c.No_Id_Kota === form.value.Id_Kota)
  if (city) return (city.Nama || city.Name || '').split(',')[0].trim()
  const vCity = virtualCities.value.find((c: any) => c.No_Id === form.value.Id_Kota)
  return vCity ? (vCity.Nama || vCity.Name || '').split(',')[0].trim() : ''
})

const cardinalDirections = ['Pusat', 'Utara', 'Timur', 'Selatan', 'Barat']
const virtualAreas = computed(() => {
  const city = selectedCityName.value
  if (!city) return []
  return cardinalDirections.map(dir => ({
    Nama: `${city} ${dir}`,
    isVirtual: true,
    No_Id: `virtual-${dir}`
  }))
})

const filteredCities = computed(() => {
  const list = Array.isArray(cities.value) ? cities.value : []
  let result = list.filter((c: any) => (c.Nama || c.Name) && (String(c.Nama || c.Name).trim() !== ''))
  
  // Add virtual cities
  const virtuals = virtualCities.value.filter((v: any) => 
    !result.some(r => (r.Nama || r.Name).toLowerCase() === v.Nama.toLowerCase())
  )
  result = [...result, ...virtuals]

  if (!searchKota.value) return result
  return result.filter((c: any) => 
    String(c.Nama || c.Name).toLowerCase().includes(searchKota.value.toLowerCase())
  )
})

const filteredAreas = computed(() => {
  const list = Array.isArray(areas.value) ? areas.value : []
  let result = list.filter((a: any) => (a.Nama || a.Name) && (String(a.Nama || a.Name).trim() !== ''))
  
  if (form.value.Id_Kota) {
    result = result.filter((a: any) => a.Id_Kota === form.value.Id_Kota)
    
    // Tambahkan area virtual yang belum ada di database
    const localVirtuals = virtualAreas.value.filter(v => 
      !result.some(r => (r.Nama || r.Name).toLowerCase() === v.Nama.toLowerCase())
    )
    const injectedVirtuals = globalVirtualAreas.value.filter((v: any) => 
      v.Id_Kota === form.value.Id_Kota && !result.some(r => (r.Nama || r.Name).toLowerCase() === v.Nama.toLowerCase()) && !localVirtuals.some(lv => lv.Nama.toLowerCase() === v.Nama.toLowerCase())
    )
    result = [...result, ...localVirtuals, ...injectedVirtuals]
  }

  if (!searchArea.value) return result
  return result.filter((a: any) => 
    String(a.Nama || a.Name).toLowerCase().includes(searchArea.value.toLowerCase())
  )
})

const filteredPriorities = computed(() => {
  const list = Array.isArray(priorities.value) ? priorities.value : []
  let result = list.filter((p: any) => (p.Nama || p.Name) && (String(p.Nama || p.Name).trim() !== ''))
  
  if (form.value.Id_Area) {
    result = result.filter((p: any) => p.Id_Area === form.value.Id_Area)
    
    // Add local virtual priorities for this area
    const virtuals = virtualPriorities.value.filter(v => v.Id_Parent === form.value.Id_Area)
    result = [...result, ...virtuals]
  }

  if (!searchPrio.value) return result
  return result.filter((p: any) => 
    String(p.Nama || p.Name).toLowerCase().includes(searchPrio.value.toLowerCase())
  )
})

const updateDropdownStyles = (type: 'kota' | 'area' | 'prio') => {
  let targetRef = null
  if (type === 'kota') targetRef = dropdownKotaRef.value
  else if (type === 'area') targetRef = dropdownAreaRef.value
  else if (type === 'prio') targetRef = dropdownPrioRef.value

  if (targetRef) {
    const rect = (targetRef as any).$el.getBoundingClientRect()
    dropdownStyles.value[type] = {
      top: `${rect.bottom + 8}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`
    }
  }
}

const toggleKota = () => {
  isKotaOpen.value = !isKotaOpen.value
  if (isKotaOpen.value) {
    isAreaOpen.value = false; isPrioOpen.value = false
    nextTick(() => updateDropdownStyles('kota'))
  }
}

const toggleArea = () => {
  isAreaOpen.value = !isAreaOpen.value
  if (isAreaOpen.value) {
    isKotaOpen.value = false; isPrioOpen.value = false
    nextTick(() => updateDropdownStyles('area'))
  }
}

const togglePrio = () => {
  isPrioOpen.value = !isPrioOpen.value
  if (isPrioOpen.value) {
    isKotaOpen.value = false; isAreaOpen.value = false
    nextTick(() => updateDropdownStyles('prio'))
  }
}

const selectKota = (c: any) => {
  form.value.Id_Kota = c.No_Id || c.No_Id_Kota
  form.value.Id_Area = ''
  form.value._isVirtualArea = false
  isKotaOpen.value = false
}

const selectArea = (a: any) => {
  if (a.isVirtual) {
    form.value.Id_Area = a.Nama
    form.value._isVirtualArea = true
  } else {
    form.value.Id_Area = a.No_Id || a.No_Id_Area
    form.value._isVirtualArea = false
  }
  form.value.Id_Prioritas = ''
  isAreaOpen.value = false
}

const selectPrio = (p: any) => {
  form.value.Id_Prioritas = p.No_Id || p.No_Id_Prioritas
  isPrioOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  if (dropdownKotaRef.value && !(dropdownKotaRef.value as any).$el.contains(target) && !menuKotaRef.value?.contains(target)) {
    isKotaOpen.value = false
  }
  if (dropdownAreaRef.value && !(dropdownAreaRef.value as any).$el.contains(target) && !menuAreaRef.value?.contains(target)) {
    isAreaOpen.value = false
  }
  if (dropdownPrioRef.value && !(dropdownPrioRef.value as any).$el.contains(target) && !menuPrioRef.value?.contains(target)) {
    isPrioOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch scale-in h-full">
    <!-- LEFT COLUMN: MAP & SEARCH -->
    <div class="space-y-6 flex flex-col h-full">
      <div class="flex items-center justify-between mb-1 shrink-0">
        <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">Peta Properti <span class="text-red-500">*</span></label>
        <label class="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-slate-400 hover:text-primary transition-colors tracking-widest">
          <input type="checkbox" v-model="form.Hide_alamat" class="size-3.5 rounded border-slate-200 text-primary" />
          Sembunyikan Alamat?
        </label>
      </div>

      <div class="space-y-4 flex-1 flex flex-col min-h-[400px]">
        <BaseFormGroup icon="lucide:search" class="shrink-0">
          <input v-model="searchQuery" @input="handleSearchInput" @focus="isPredictionsOpen = predictions.length > 0" placeholder="Cari titik lokasi..." class="field-input h-10 !pl-10" />
          <div v-if="isPredictionsOpen && predictions.length" class="absolute top-full left-0 mt-2 w-full z-[100] bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden scale-in">
            <div class="max-h-60 overflow-y-auto p-2 custom-scroll flex flex-col">
              <button v-for="p in predictions" :key="p.placeId" @mousedown="selectPrediction(p)" type="button" class="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors rounded-lg group">
                <div class="flex items-start gap-3">
                  <Icon icon="lucide:map-pin" class="size-4 mt-0.5 text-slate-400 group-hover:text-primary transition-colors" />
                  <div class="flex-1">
                    <span class="text-xs font-black text-slate-700 block leading-tight">{{ p.mainText }}</span>
                    <span class="text-[10px] font-bold text-slate-400 block mt-0.5" v-if="p.secondaryText">{{ p.secondaryText }}</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </BaseFormGroup>

        <GoogleMapsPicker class="flex-1" />
      </div>
    </div>

    <!-- RIGHT COLUMN: WILAYAH & ALAMAT -->
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BaseFormGroup label="KOTA / KABUPATEN" icon="lucide:building" required ref="dropdownKotaRef">
          <button @click="toggleKota" type="button" class="field-input h-10 !pl-9 flex items-center justify-between group">
            <span class="text-xs font-bold truncate pr-2" :class="form.Id_Kota ? 'text-slate-700' : 'text-slate-300'">
              <template v-if="form.Id_Kota">
                {{ selectedCityName || 'Pilih Kota' }}
              </template>
              <template v-else>Pilih Kota</template>
            </span>
            <Icon icon="lucide:chevron-down" class="size-3.5 text-slate-400 group-hover:text-primary transition-transform" :class="isKotaOpen ? 'rotate-180' : ''" />
          </button>
          <Teleport to="body">
            <div v-if="isKotaOpen" ref="menuKotaRef" class="fixed z-[1000] bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden scale-in" :style="dropdownStyles.kota">
              <div class="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                <div class="relative">
                  <Icon icon="lucide:search" class="absolute left-0 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                  <input v-model="searchKota" placeholder="CARI KOTA..." class="w-full bg-transparent pl-6 border-none text-[10px] font-black focus:ring-0 placeholder:text-slate-400 text-slate-700 uppercase tracking-widest" />
                </div>
              </div>
              <div class="max-h-48 overflow-y-auto p-2 custom-scroll flex flex-col">
                <template v-if="filteredCities.length">
                  <button v-for="c in filteredCities" :key="c.No_Id" @click="selectKota(c)" type="button" class="group flex items-center justify-between px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-bejo-50 hover:text-bejo-600">
                    {{ c.Nama || c.Name }}
                    <Icon v-if="form.Id_Kota && (form.Id_Kota === c.No_Id || form.Id_Kota === c.No_Id_Kota)" icon="lucide:check" class="size-4 text-bejo-600" />
                  </button>
                </template>
                <div v-else class="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <Icon icon="lucide:search-x" class="size-8 text-slate-200 mb-2" />
                  <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Data tidak ditemukan</span>
                </div>
              </div>
              <div class="px-2 py-2 border-t bg-slate-50/30">
                <button @click="openWilayahModal('kota')" class="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-[9px] font-black hover:bg-primary-dark transition-all shadow-sm">
                  <Icon icon="lucide:plus-circle" class="size-3" />
                  TAMBAH KOTA BARU
                </button>
              </div>
            </div>
          </Teleport>
        </BaseFormGroup>

        <BaseFormGroup label="AREA" icon="lucide:layers" required ref="dropdownAreaRef" :class="{ 'opacity-60': !form.Id_Kota }">
          <button @click="toggleArea" type="button" class="field-input h-10 !pl-9 flex items-center justify-between group bg-white border-slate-200" :disabled="!form.Id_Kota" :class="{ 'cursor-not-allowed bg-slate-50 border-slate-100': !form.Id_Kota }">
            <span class="text-xs font-bold truncate pr-2" :class="form.Id_Area ? 'text-slate-700' : 'text-slate-300'">
              <template v-if="form.Id_Area">
                {{ filteredAreas.find(a => a.No_Id === form.Id_Area || a.No_Id_Area === form.Id_Area)?.Nama || 
                   filteredAreas.find(a => a.No_Id === form.Id_Area || a.No_Id_Area === form.Id_Area)?.Name || 
                   (form._isVirtualArea ? form.Id_Area : 'Pilih Area') }}
              </template>
              <template v-else>Pilih Area</template>
            </span>
            <Icon icon="lucide:chevron-down" class="size-3.5 text-slate-400 group-hover:text-primary transition-transform" :class="[isAreaOpen ? 'rotate-180' : '', !form.Id_Kota ? 'opacity-30' : '']" />
          </button>


          <Teleport to="body">
            <div v-if="isAreaOpen" ref="menuAreaRef" class="fixed z-[1000] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden scale-in" :style="dropdownStyles.area">
              <div class="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                <div class="relative">
                  <Icon icon="lucide:search" class="absolute left-0 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                  <input v-model="searchArea" placeholder="CARI AREA..." class="w-full bg-transparent pl-6 border-none text-[10px] font-black focus:ring-0 placeholder:text-slate-400 text-slate-700 uppercase tracking-widest" />
                </div>
              </div>
              <div class="max-h-48 overflow-y-auto p-2 custom-scroll flex flex-col">
                <template v-if="filteredAreas.length">
                  <button v-for="a in filteredAreas" :key="a.No_Id || a.No_Id_Area" @click="selectArea(a)" type="button" class="group flex items-center justify-between px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-bejo-50 hover:text-bejo-600">
                    {{ a.Nama || a.Name }}
                    <Icon v-if="form.Id_Area && (form.Id_Area === a.No_Id || form.Id_Area === a.No_Id_Area || (a.isVirtual && form.Id_Area === a.Nama))" icon="lucide:check" class="size-4 text-bejo-600" />
                  </button>
                </template>
                <div v-else class="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <Icon icon="lucide:map-pin-off" class="size-8 text-slate-200 mb-2" />
                  <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Area tidak ditemukan</span>
                </div>
              </div>
              <div class="px-2 py-2 border-t bg-slate-50/30">
                <button @click="openWilayahModal('area')" class="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-[9px] font-black hover:bg-primary-dark transition-all shadow-sm">
                  <Icon icon="lucide:plus-circle" class="size-3" />
                  TAMBAH AREA BARU
                </button>
              </div>
            </div>
          </Teleport>
        </BaseFormGroup>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BaseFormGroup label="KECAMATAN" icon="lucide:navigation">
          <div class="relative">
            <input v-model="form.Kecamatan" placeholder="Isi kecamatan..." class="field-input h-10 !pl-10" />
            <div v-if="isGeocoding" class="absolute right-3 top-1/2 -translate-y-1/2">
              <Icon icon="lucide:loader-2" class="size-3 animate-spin text-slate-400" />
            </div>
          </div>
        </BaseFormGroup>

        <BaseFormGroup label="KELURAHAN" icon="lucide:map">
          <div class="relative">
            <input v-model="form.Kelurahan" placeholder="Isi kelurahan..." class="field-input h-10 !pl-10" />
          </div>
        </BaseFormGroup>
      </div>

      <BaseFormGroup label="PRIORITAS / KAWASAN" icon="lucide:star" required ref="dropdownPrioRef" :class="{ 'opacity-60': !form.Id_Area }">
        <button @click="togglePrio" type="button" class="field-input h-10 !pl-9 flex items-center justify-between group bg-white border-slate-200" :disabled="!form.Id_Area" :class="{ 'cursor-not-allowed bg-slate-50 border-slate-100': !form.Id_Area }">
          <span class="text-xs font-bold truncate pr-2" :class="form.Id_Prioritas ? 'text-slate-700' : 'text-slate-300'">
            <template v-if="form.Id_Prioritas">
              {{ filteredPriorities.find(p => p.No_Id === form.Id_Prioritas || p.No_Id_Prioritas === form.Id_Prioritas)?.Nama || 
                 filteredPriorities.find(p => p.No_Id === form.Id_Prioritas || p.No_Id_Prioritas === form.Id_Prioritas)?.Name || 
                 'Pilih Kawasan' }}
            </template>
            <template v-else>Pilih Kawasan</template>
          </span>
          <Icon icon="lucide:chevron-down" class="size-3.5 text-slate-400 group-hover:text-primary transition-transform" :class="[isPrioOpen ? 'rotate-180' : '', !form.Id_Area ? 'opacity-30' : '']" />
        </button>
        <Teleport to="body">
          <div v-if="isPrioOpen" ref="menuPrioRef" class="fixed z-[1000] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden scale-in" :style="dropdownStyles.prio">
            <div class="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
              <div class="relative">
                <Icon icon="lucide:search" class="absolute left-0 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                <input v-model="searchPrio" placeholder="CARI KAWASAN..." class="w-full bg-transparent pl-6 border-none text-[10px] font-black focus:ring-0 placeholder:text-slate-400 text-slate-700 uppercase tracking-widest" />
              </div>
            </div>
            <div class="max-h-48 overflow-y-auto p-2 custom-scroll flex flex-col">
              <template v-if="filteredPriorities.length">
                  <button v-for="p in filteredPriorities" :key="p.No_Id || p.No_Id_Prioritas" @click="selectPrio(p)" type="button" class="group flex items-center justify-between px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-bejo-50 hover:text-bejo-600">
                    {{ p.Nama || p.Name }}
                    <Icon v-if="form.Id_Prioritas && (form.Id_Prioritas === p.No_Id || form.Id_Prioritas === p.No_Id_Prioritas || (p.isVirtual && form.Id_Prioritas === p.Nama))" icon="lucide:check" class="size-4 text-bejo-600" />
                  </button>
              </template>
              <div v-else class="flex flex-col items-center justify-center py-8 px-4 text-center">
                <Icon icon="lucide:star-off" class="size-8 text-slate-200 mb-2" />
                <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Kawasan tidak ditemukan</span>
              </div>
            </div>
            <div class="px-2 py-2 border-t bg-slate-50/30">
              <button @click="openWilayahModal('prioritas')" class="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-[9px] font-black hover:bg-primary-dark transition-all shadow-sm">
                <Icon icon="lucide:plus-circle" class="size-3" />
                TAMBAH KAWASAN BARU
              </button>
            </div>
          </div>
        </Teleport>
      </BaseFormGroup>

      <BaseFormGroup label="ALAMAT LENGKAP" icon="lucide:map-pin" align-icon="top">
        <textarea v-model="form.Alamat" rows="3" class="field-input !pl-10 pt-2.5 resize-none leading-relaxed" placeholder="Nama jalan, nomor rumah, blok..."></textarea>
      </BaseFormGroup>
    </div>

    <!-- Wilayah Creation Modal -->
    <WilayahModal 
      :show="isWilayahModalOpen"
      :type="wilayahModalType"
      :parentId="wilayahModalParentId"
      :parentName="wilayahModalType === 'area' ? selectedCityName : (areas.find(a => a.No_Id === form.Id_Area || a.No_Id_Area === form.Id_Area)?.Nama || form.Id_Area)"
      :contextId="form.Id_Kota"
      :allData="{ kota: cities, area: areas }"
      :virtual="true"
      @close="isWilayahModalOpen = false"
      @success="handleWilayahSuccess"
    />
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.label { @apply block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1; }
.field-input {
  @apply w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium;
}
.custom-scroll { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
.custom-scroll::-webkit-scrollbar { height: 4px; width: 4px; }
.custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
.scale-in { animation: scale-in 0.2s ease-out; }
@keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>
