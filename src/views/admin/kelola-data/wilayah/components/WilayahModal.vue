<script setup lang="ts">
import { ref, watch, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { success, fail } from '@/utils/sweet-alert'
import api from '@/services/axios'

const props = defineProps<{
  show: boolean
  type: string
  parentId?: string | null
  parentName?: string | null
  contextId?: string | null // NEW: e.g. Id_Kota when creating Prioritas under virtual Area
  editData?: any | null
  allData: any
  virtual?: boolean // NEW: if true, don't hit API, just emit success with virtual data
}>()

const emit = defineEmits(['close', 'success'])
const loading = ref(false)
const form = reactive({
  id: '',
  nama: '',
  deskripsi: '',
  parentId: '', // Generic parent ID (Id_Kota or Id_Area)
  status: 'aktif'
})

// Custom Dropdown State
const isDropdownOpen = ref(false)
const searchDropdown = ref('')
const dropdownRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const dropdownStyle = ref({})

const resetForm = () => {
  Object.assign(form, {
    id: '',
    nama: '',
    deskripsi: '',
    parentId: props.parentId || '',
    status: 'aktif'
  })
  searchDropdown.value = ''
}

const title = computed(() => {
  const label = props.type.charAt(0).toUpperCase() + props.type.slice(1)
  return props.editData ? `Edit ${label}` : `Tambah ${label}`
})

const parentLabel = computed(() => {
  switch (props.type) {
    case 'area': return 'Kota'
    case 'prioritas': return 'Area'
    default: return ''
  }
})

const parentOptions = computed(() => {
  let list: any[] = []
  switch (props.type) {
    case 'area': list = [...props.allData.kota]; break
    case 'prioritas': list = [...props.allData.area]; break
    default: list = []; break
  }

  // If we have a parentName/Id passed from outside that is NOT in the list, 
  // add it as a temporary/virtual option so it shows up in the dropdown
  if (props.show && (props.parentId || props.parentName)) {
    const exists = list.some((opt: any) => 
      (props.parentId && (opt.No_Id === props.parentId || opt.No_Id_Kota === props.parentId || opt.No_Id_Area === props.parentId)) ||
      (props.parentName && String(opt.Nama || opt.Name || '').toLowerCase() === String(props.parentName).toLowerCase())
    )
    
    if (!exists && props.parentName) {
      list.push({
        No_Id: props.parentId || `virtual-${props.parentName}`,
        Nama: props.parentName,
        isVirtual: true
      })
    }
  }

  return list
})

const filteredOptions = computed(() => {
  if (!searchDropdown.value) return parentOptions.value
  return parentOptions.value.filter((opt: any) => 
    opt.Nama.toLowerCase().includes(searchDropdown.value.toLowerCase())
  )
})

watch(
  () => props.show,
  (isShown) => {
    if (isShown) {
      if (props.editData) {
        Object.assign(form, {
          id: props.editData.No_Id || props.editData.id,
          nama: props.editData.Nama || props.editData.nama,
          deskripsi: props.editData.Deskripsi || props.editData.deskripsi || '',
          parentId: props.editData.Id_Kota || props.editData.Id_Area || '',
          status: props.editData.Status || 'aktif'
        })
      } else if (props.parentId || props.parentName) {
        // Try to match by ID first
        let match = parentOptions.value.find((opt: any) => 
          (props.parentId && (opt.No_Id === props.parentId || opt.No_Id_Kota === props.parentId || opt.No_Id_Area === props.parentId))
        )
        
        // Fallback: Match by Name if ID failed or not provided
        if (!match && props.parentName) {
          match = parentOptions.value.find((opt: any) => 
            String(opt.Nama || opt.Name || '').toLowerCase().includes(String(props.parentName).toLowerCase())
          )
        }
        
        if (match) {
          form.parentId = match.No_Id || match.No_Id_Kota || match.No_Id_Area
        } else {
          form.parentId = props.parentId || ''
        }
      } else {
        resetForm()
      }
    }
  },
  { immediate: true }
)

// Add a watch on parentOptions to re-sync if data arrives late
watch(
  () => parentOptions.value,
  (newList) => {
    if (props.show && (props.parentId || props.parentName) && !form.parentId) {
       let match = newList.find((opt: any) => 
          (props.parentId && (opt.No_Id === props.parentId || opt.No_Id_Kota === props.parentId || opt.No_Id_Area === props.parentId))
       )
       
       if (!match && props.parentName) {
         match = newList.find((opt: any) => 
           String(opt.Nama || opt.Name || '').toLowerCase().includes(String(props.parentName).toLowerCase())
         )
       }

       if (match) {
         form.parentId = match.No_Id || match.No_Id_Kota || match.No_Id_Area
       }
    }
  },
  { deep: true }
)

const updateDropdownStyle = () => {
  if (dropdownRef.value) {
    const rect = dropdownRef.value.getBoundingClientRect()
    dropdownStyle.value = {
      top: `${rect.bottom + 8}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`
    }
  }
}

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
  if (isDropdownOpen.value) {
    nextTick(updateDropdownStyle)
  }
}

const selectOption = (opt: any) => {
  form.parentId = opt.No_Id || opt.No_Id_Kota || opt.No_Id_Area
  isDropdownOpen.value = false
  searchDropdown.value = ''
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  if (dropdownRef.value && !dropdownRef.value.contains(target) && menuRef.value && !menuRef.value.contains(target)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleSubmit = async () => {
  if (!form.nama) return fail('Nama harus diisi!')
  if ((props.type === 'area' || props.type === 'prioritas') && !form.parentId) {
    return fail(`Pilih ${parentLabel.value} terlebih dahulu!`)
  }

  // Auto-prepend city name for direction-only area names
  if (props.type === 'area') {
    const directionWords = ['timur', 'utara', 'barat', 'selatan', 'pusat']
    const trimmedInput = form.nama.trim()
    if (directionWords.includes(trimmedInput.toLowerCase())) {
      const selectedParent = parentOptions.value.find((opt: any) => 
        (opt.No_Id === form.parentId || opt.No_Id_Kota === form.parentId)
      )
      if (selectedParent) {
        // Ambil nama kota sebelum koma (contoh: "Surabaya, Jawa Timur" -> "Surabaya")
        const cityName = (selectedParent.Nama || selectedParent.Name || '').split(',')[0].trim()
        
        // Cek apakah nama kota sudah mengandung arah
        const cityHasDirection = directionWords.some(word => 
          cityName.toLowerCase().includes(word)
        )
        
        const direction = trimmedInput.charAt(0).toUpperCase() + trimmedInput.slice(1).toLowerCase()
        
        if (cityHasDirection) {
          form.nama = `${cityName} bag. ${direction}`
        } else {
          form.nama = `${cityName} ${direction}`
        }
      }
    }
  }

  loading.value = true
  try {
    const isEdit = !!props.editData
    
    // If virtual mode is on, just emit and close
    if (props.virtual && !isEdit) {
      const virtualItem = {
        Nama: form.nama,
        Deskripsi: form.deskripsi,
        isVirtual: true,
        No_Id: `virtual-${Date.now()}`,
        Id_Parent: form.parentId
      }
      emit('success', virtualItem)
      handleClose()
      return
    }

    // Handle Virtual Parent Creation
    // If creating Prioritas and parentId is not a real ID (e.g. "virtual-Utara" or just a name), create the Area first
    let finalParentId = form.parentId
    const isVirtualParent = !isEdit && props.type === 'prioritas' && (
      form.parentId.startsWith('virtual-') || 
      !props.allData.area.some((a: any) => (a.No_Id === form.parentId || a.No_Id_Area === form.parentId))
    )

    if (isVirtualParent) {
      // Find the name from options (it might be our temporary virtual option)
      const selectedParent = parentOptions.value.find((opt: any) => 
        (opt.No_Id === form.parentId || opt.No_Id_Area === form.parentId || opt.Nama === form.parentId)
      )
      const areaName = selectedParent?.Nama || props.parentName || form.parentId
      
      if (!areaName || areaName.startsWith('virtual-')) throw new Error('Nama Area tidak valid untuk pembuatan otomatis')
      if (!props.contextId) throw new Error('ID Kota diperlukan untuk membuat Area baru')

      const { data: areaData } = await api.post('/api/area/create', {
        Nama: areaName,
        Deskripsi: '',
        Id_Kota: props.contextId
      })

      if (areaData.StatusCode === 200) {
        finalParentId = areaData.Data.No_Id || areaData.Data.No_Id_Area
      } else {
        throw new Error(areaData.Message || 'Gagal membuat Area induk')
      }
    }

    const endpoint = `/api/${props.type}/${isEdit ? 'update' : 'create'}${isEdit ? `?no_id=${form.id}` : ''}`
    
    const payload: any = {
      Nama: form.nama,
      Deskripsi: form.deskripsi || null
    }

    if (props.type === 'area') payload.Id_Kota = finalParentId || null
    if (props.type === 'prioritas') payload.Id_Area = finalParentId || null
    
    // Send status for all types
    payload.status = form.status

    const { data } = await api[isEdit ? 'put' : 'post'](endpoint, payload)
    
    if (data.StatusCode === 200) {
      success(isEdit ? 'Berhasil memperbarui data' : 'Berhasil menambah data')
      emit('success', data.Data)
      handleClose()
    } else {
      fail(data.Message || 'Gagal menyimpan data')
    }
  } catch (err: any) {
    fail(err.response?.data?.Message || err.message || 'Terjadi kesalahan sistem')
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  resetForm()
  emit('close')
}
</script>

<template>
  <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="show" class="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" @click="handleClose"></div>

      <div class="bg-card w-full max-w-lg rounded-2xl shadow-2xl z-10 overflow-hidden border border-slate-100 animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500 flex flex-col">
        <!-- Header -->
        <div class="flex flex-col border-b bg-card">
          <div class="flex justify-between items-center px-8 py-3">
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-2xl bg-bejo-500 text-white flex items-center justify-center shadow-lg shadow-bejo-500/20">
                <Icon :icon="editData ? 'lucide:pencil' : 'lucide:plus'" class="size-5" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-800 tracking-tight leading-none">{{ title }}</h3>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  Master Data Geografis
                </p>
              </div>
            </div>
            <button @click="handleClose" class="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all active:scale-95">
              <Icon icon="lucide:x" class="size-6" />
            </button>
          </div>
        </div>

        <!-- Body -->
        <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto">
          <div class="px-8 py-8 space-y-6">
            <!-- Parent Selection (if applicable) -->
            <div v-if="parentLabel" class="space-y-1.5" ref="dropdownRef">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Pilih {{ parentLabel }} <span class="text-red-500">*</span></label>
              <div class="relative group">
                <Icon :icon="type === 'area' ? 'lucide:building' : 'lucide:layers'" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none group-focus-within:text-primary transition-colors z-10" />
                <button 
                  @click="toggleDropdown" 
                  type="button" 
                  class="field-input h-11 !pl-11 flex items-center justify-between group bg-white"
                >
                  <span class="truncate text-xs font-bold" :class="form.parentId ? 'text-slate-700' : 'text-slate-300'">
                    {{ parentOptions.find((opt: any) => opt.No_Id === form.parentId || opt.No_Id_Kota === form.parentId || opt.No_Id_Area === form.parentId || opt.Nama === form.parentId)?.Nama || `Pilih ${parentLabel}...` }}
                  </span>
                  <Icon icon="lucide:chevron-down" class="size-4 text-slate-400 group-hover:text-bejo-500 transition-transform" :class="isDropdownOpen ? 'rotate-180' : ''" />
                </button>
              </div>

              <Teleport to="body">
                <div v-if="isDropdownOpen" ref="menuRef" class="fixed z-[1200] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden scale-in" :style="dropdownStyle">
                  <div class="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                    <div class="relative">
                      <Icon icon="lucide:search" class="absolute left-0 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                      <input v-model="searchDropdown" :placeholder="`CARI ${parentLabel.toUpperCase()}...`" class="w-full bg-transparent pl-6 border-none text-[10px] font-black focus:ring-0 placeholder:text-slate-400 text-slate-700 uppercase tracking-widest" />
                    </div>
                  </div>
                  <div class="max-h-60 overflow-y-auto p-2 custom-scroll flex flex-col min-w-[200px]">
                    <template v-if="filteredOptions.length">
                      <button 
                        v-for="opt in filteredOptions" 
                        :key="opt.No_Id || opt.No_Id_Kota || opt.No_Id_Area" 
                        @click="selectOption(opt)" 
                        type="button" 
                        class="group flex items-center justify-between px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-bejo-50 hover:text-primary"
                      >
                        {{ opt.Nama }}
                        <Icon v-if="form.parentId === (opt.No_Id || opt.No_Id_Kota || opt.No_Id_Area)" icon="lucide:check" class="size-4 text-bejo-500" />
                      </button>
                    </template>
                    <div v-else class="flex flex-col items-center justify-center py-8 px-4 text-center">
                      <Icon icon="lucide:search-x" class="size-8 text-slate-200 mb-2" />
                      <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Data tidak ditemukan</span>
                    </div>
                  </div>
                </div>
              </Teleport>
            </div>

            <div class="space-y-1.5">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nama {{ type }} <span class="text-red-500">*</span></label>
              <div class="relative group">
                <Icon icon="lucide:map-pin" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none group-focus-within:text-primary transition-colors z-10" />
                <input v-model="form.nama" type="text" required class="field-input h-11 !pl-11" :placeholder="`Misal: ${type === 'kota' ? 'Surabaya, Jawa Timur' : 'Sambikerep'}`" />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Deskripsi</label>
              <div class="relative group">
                <Icon icon="lucide:file-text" class="absolute left-3 top-4 text-slate-400 size-4 pointer-events-none group-focus-within:text-primary transition-colors z-10" />
                <textarea v-model="form.deskripsi" rows="3" class="field-input !h-auto py-3 !pl-11 resize-none leading-relaxed" placeholder="Tambahkan keterangan tambahan..."></textarea>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Status</label>
              <div class="relative group">
                <Icon icon="lucide:check-circle" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none group-focus-within:text-bejo-500 transition-colors z-10" />
                <select v-model="form.status" class="field-input h-11 !pl-11 appearance-none bg-white">
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Non-Aktif</option>
                </select>
                <Icon icon="lucide:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none" />
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-8 py-6 border-t flex justify-between items-center bg-white">
            <button type="button" @click="handleClose" class="px-8 py-3 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">
              Batal
            </button>
            <button type="submit" :disabled="loading" class="px-10 py-3 bg-bejo-500 text-white text-xs font-black rounded-2xl shadow-xl shadow-bejo-500/20 transition-all hover:scale-[1.03] active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:scale-100">
              <Icon v-if="loading" icon="lucide:loader-2" class="animate-spin size-4" />
              <Icon v-else icon="lucide:save" class="size-4" />
              {{ loading ? 'Memproses...' : editData ? 'Simpan Perubahan' : `Tambah ${type}` }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.field-input {
  @apply w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm bg-card focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium;
}

.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}
.custom-scroll::-webkit-scrollbar {
  height: 4px;
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 20px;
}
.scale-in {
  animation: scale-in 0.2s ease-out;
}
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
