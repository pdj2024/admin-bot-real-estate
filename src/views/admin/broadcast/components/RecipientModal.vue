<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'
import { success, fail, confirm } from '@/utils/sweet-alert'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['close', 'updated'])
const customers = ref<any[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const selectedIds = ref<Set<string>>(new Set())

const fetchCustomers = async () => {
  isLoading.value = true
  try {
    const { data } = await api.get('/api/customer/getAll?orderby=Tgl_Created', {
      headers: { 'X-Jenis-User': 'admin' }
    })
    customers.value = data.Data || []
  } catch {
    console.error('Gagal memuat data customer')
  } finally {
    isLoading.value = false
  }
}

const filteredCustomers = computed(() => {
  if (!searchQuery.value) return customers.value
  const query = searchQuery.value.toLowerCase()
  return customers.value.filter(c => 
    c.Nama_Display?.toLowerCase().includes(query) || 
    c.Email?.toLowerCase().includes(query) ||
    c.Telepon?.toString().includes(query)
  )
})

const selectedCustomers = computed(() => {
  return customers.value.filter(c => selectedIds.value.has(c.No_Id))
})

const isAllSelected = computed(() => {
  return filteredCustomers.value.length > 0 && filteredCustomers.value.every(c => selectedIds.value.has(c.No_Id))
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    filteredCustomers.value.forEach(c => selectedIds.value.delete(c.No_Id))
  } else {
    filteredCustomers.value.forEach(c => selectedIds.value.add(c.No_Id))
  }
}

const toggleSelection = (id: string) => {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
}

const toggleBroadcast = async (item: any) => {
  const newStatus = item.Status_Broadcast === 'aktif' ? 'nonaktif' : 'aktif'
  try {
    await api.put(
      '/api/Customer/update?no_id=' + item.No_Id,
      {
        ...item,
        Status_Broadcast: newStatus,
        Id_Media: item.Id_Media || null
      },
      { headers: { 'X-Jenis-User': 'Customer' } }
    )
    item.Status_Broadcast = newStatus
    success(`Broadcast ${item.Nama_Display} ${newStatus === 'aktif' ? 'diaktifkan' : 'dinonaktifkan'}`)
    emit('updated')
  } catch {
    fail(`Gagal mengubah status broadcast ${item.Nama_Display}`)
  }
}

const handleBatchUpdate = async (status: 'aktif' | 'nonaktif') => {
  const itemsToUpdate = customers.value.filter(c => selectedIds.value.has(c.No_Id))
  if (itemsToUpdate.length === 0) return

  confirm(`Ubah status broadcast untuk ${itemsToUpdate.length} pelanggan terpilih menjadi ${status === 'aktif' ? 'Aktif' : 'Nonaktif'}?`, async () => {
    isLoading.value = true
    let successCount = 0
    let failCount = 0

    for (const item of itemsToUpdate) {
      try {
        await api.put(
          '/api/Customer/update?no_id=' + item.No_Id,
          {
            ...item,
            Status_Broadcast: status,
            Id_Media: item.Id_Media || null
          },
          { headers: { 'X-Jenis-User': 'Customer' } }
        )
        item.Status_Broadcast = status
        successCount++
      } catch {
        failCount++
      }
    }

    if (successCount > 0) success(`Berhasil mengubah ${successCount} status broadcast`)
    if (failCount > 0) fail(`${failCount} status gagal diubah`)
    
    selectedIds.value.clear()
    emit('updated')
    isLoading.value = false
  })
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    fetchCustomers()
    selectedIds.value.clear()
  }
})

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="show" class="fixed inset-0 z-[1050] flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" @click="handleClose"></div>

      <div class="bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl w-full max-w-2xl z-10 overflow-hidden border border-slate-100 animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500 flex flex-col max-h-[85vh]">
        <!-- Modal Header -->
        <div class="relative p-4 sm:p-5 md:p-6 border-b border-slate-50 shrink-0">
          <div class="absolute top-0 right-0 w-48 h-48 bg-bejo-50/50 rounded-full -mr-24 -mt-24 blur-3xl"></div>
          
          <div class="relative flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="size-9 sm:size-10 rounded-xl bg-bejo-500 text-white flex items-center justify-center shadow-lg shadow-bejo-500/20">
                <Icon icon="lucide:users" class="size-5" />
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-black text-slate-900 leading-none">Kelola Penerima</h3>
                <p class="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Pilih pelanggan untuk broadcast</p>
              </div>
            </div>
            <button @click="handleClose" class="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100">
              <Icon icon="lucide:x" class="size-5" />
            </button>
          </div>

          <div class="relative mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div class="relative flex-grow">
              <Icon icon="lucide:search" class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Cari nama, email, atau telepon..." 
                class="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-xs sm:text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 transition-all"
              />
            </div>

            <!-- Select All Checkbox -->
            <button 
              @click="toggleSelectAll"
              class="h-10 px-4 rounded-xl border transition-all flex items-center justify-center sm:justify-start gap-2 font-black text-[10px] sm:text-xs uppercase tracking-widest shrink-0"
              :class="isAllSelected ? 'bg-bejo-500 text-white border-bejo-600' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'"
            >
              <div class="size-4 rounded border flex items-center justify-center" :class="isAllSelected ? 'bg-white border-white text-bejo-500' : 'bg-slate-50 border-slate-200'">
                <Icon v-if="isAllSelected" icon="lucide:check" class="size-3" />
              </div>
              Pilih Semua
            </button>
          </div>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="flex-grow overflow-y-auto p-3 sm:p-4 space-y-2 custom-scrollbar">
          <div v-if="isLoading && customers.length === 0" class="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
            <Icon icon="lucide:loader-2" class="size-10 animate-spin text-bejo-500" />
            <span class="text-sm font-black text-slate-400 uppercase tracking-widest">Memuat Data...</span>
          </div>

          <template v-else>
            <div 
              v-for="customer in filteredCustomers" 
              :key="customer.No_Id"
              class="flex items-center gap-2.5 sm:gap-3.5 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all group min-w-0"
              :class="[
                customer.Status_Broadcast === 'aktif' ? 'bg-bejo-50/30 border-bejo-100' : 'bg-white border-slate-50 hover:border-slate-200',
                selectedIds.has(customer.No_Id) ? 'ring-2 ring-bejo-500/20 border-bejo-200' : ''
              ]"
            >
              <!-- Checkbox -->
              <button 
                @click="toggleSelection(customer.No_Id)"
                class="size-5 rounded border flex items-center justify-center transition-all shrink-0"
                :class="selectedIds.has(customer.No_Id) ? 'bg-bejo-500 border-bejo-600 text-white shadow-lg shadow-bejo-500/20' : 'bg-slate-50 border-slate-200 group-hover:border-bejo-300'"
              >
                <Icon v-if="selectedIds.has(customer.No_Id)" icon="lucide:check" class="size-3" />
              </button>

              <div class="flex-grow flex items-center justify-between min-w-0 gap-2">
                <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div class="size-8 sm:size-9 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center font-black text-xs sm:text-sm uppercase group-hover:bg-bejo-500 group-hover:text-white transition-colors shrink-0">
                    {{ customer.Nama_Display?.charAt(0) || '?' }}
                  </div>
                  <div class="min-w-0">
                    <h6 class="text-xs sm:text-sm font-black text-slate-900 group-hover:text-bejo-600 transition-colors truncate">{{ customer.Nama_Display }}</h6>
                    <p class="text-[10px] sm:text-xs font-bold text-slate-400 mt-0.5 truncate">{{ customer.Email }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-2 sm:gap-4 shrink-0">
                  <span 
                    class="text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border transition-all"
                    :class="customer.Status_Broadcast === 'aktif' ? 'bg-bejo-100 text-bejo-700 border-bejo-200' : 'bg-slate-50 text-slate-400 border-slate-100'"
                  >
                    {{ customer.Status_Broadcast === 'aktif' ? 'Terima' : 'Nonaktif' }}
                  </span>
                  
                  <button 
                    @click="toggleBroadcast(customer)"
                    class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 focus:outline-none shadow-sm"
                    :class="customer.Status_Broadcast === 'aktif' ? 'bg-bejo-500' : 'bg-slate-200'"
                  >
                    <span class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-300 ease-in-out" :class="customer.Status_Broadcast === 'aktif' ? 'translate-x-4' : 'translate-x-0'"></span>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="filteredCustomers.length === 0" class="flex flex-col items-center justify-center py-10 opacity-30">
              <Icon icon="lucide:user-x" class="size-12 mb-2" />
              <span class="text-sm font-black uppercase tracking-widest">Penerima tidak ditemukan</span>
            </div>
          </template>
        </div>

        <!-- Modal Footer -->
        <div class="p-4 sm:p-6 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-4 min-w-0">
            <!-- Batch Actions (Visible only when selected) -->
            <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-4">
              <div v-if="selectedIds.size > 0" class="flex items-center gap-2">
                <button 
                  v-if="selectedCustomers.some(c => c.Status_Broadcast !== 'aktif')"
                  @click="handleBatchUpdate('aktif')"
                  class="h-9 sm:h-10 px-3 sm:px-5 bg-bejo-500 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest shadow-lg shadow-bejo-500/20 hover:bg-bejo-600 transition-all flex items-center gap-1.5 sm:gap-2 active:scale-95 whitespace-nowrap"
                >
                  <Icon icon="lucide:check-circle" class="size-3.5 shrink-0" />
                  Aktifkan ({{ selectedIds.size }})
                </button>
                <button 
                  v-if="selectedCustomers.some(c => c.Status_Broadcast === 'aktif')"
                  @click="handleBatchUpdate('nonaktif')"
                  class="h-9 sm:h-10 px-3 sm:px-5 bg-white border border-slate-200 text-slate-600 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center gap-1.5 sm:gap-2 active:scale-95 whitespace-nowrap"
                >
                  <Icon icon="lucide:x-circle" class="size-3.5 shrink-0" />
                  Nonaktifkan
                </button>
              </div>
              <div v-else class="text-[10px] sm:text-sm font-black text-slate-400 uppercase tracking-widest truncate">
                Total Aktif: <span class="text-bejo-600">{{ customers.filter(c => c.Status_Broadcast === 'aktif').length }}</span>
              </div>
            </Transition>
          </div>

          <button @click="handleClose" class="h-9 sm:h-10 px-5 sm:px-8 text-slate-700 hover:text-slate-900 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all active:scale-95 shrink-0">
            Selesai
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-200 rounded-full;
}
</style>
