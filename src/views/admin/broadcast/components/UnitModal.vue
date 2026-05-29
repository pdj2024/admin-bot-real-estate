<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['close', 'selected'])
const units = ref<any[]>([])
const isLoading = ref(false)
const searchQuery = ref('')

const fetchUnits = async () => {
  isLoading.value = true
  try {
    const { data } = await api.get('/api/realEstate/getAll?status_display=Aktif&status_properti=Tersedia&orderby=no_id&orderdir=asc', {
      headers: { 'X-Jenis-User': 'admin' }
    })
    units.value = data.Data || []
  } catch (err) {
    console.error('Gagal memuat data unit:', err)
  } finally {
    isLoading.value = false
  }
}

const filteredUnits = computed(() => {
  if (!searchQuery.value) return units.value
  const query = searchQuery.value.toLowerCase()
  return units.value.filter(u => 
    u.Nama_Produk?.toLowerCase().includes(query) || 
    u.Nama_Kota?.toLowerCase().includes(query) ||
    u.Alamat?.toLowerCase().includes(query)
  )
})

const selectUnit = (unit: any) => {
  emit('selected', unit)
  searchQuery.value = ''
}

watch(() => props.show, (newVal) => {
  if (newVal) fetchUnits()
})

const handleClose = () => {
  emit('close')
}

const formatPrice = (price: number) => {
  if (!price) return '-'
  if (price >= 1000000000) {
    const val = price / 1000000000
    const rounded = Math.round(val * 100) / 100
    return rounded.toString() + ' M'
  }
  if (price >= 1000000) {
    const val = price / 1000000
    const rounded = Math.round(val * 100) / 100
    return rounded.toString() + ' Jt'
  }
  return price.toLocaleString('id-ID')
}
</script>

<template>
  <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" @click="handleClose"></div>

      <div class="bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl w-full max-w-2xl z-10 overflow-hidden border border-slate-100 animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500 flex flex-col max-h-[85vh]">
        <!-- Modal Header -->
        <div class="relative p-4 sm:p-5 border-b border-slate-50 shrink-0">
          <div class="absolute top-0 right-0 w-48 h-48 bg-bejo-50/50 rounded-full -mr-24 -mt-24 blur-3xl"></div>
          
          <div class="relative flex items-center justify-between">
            <div class="flex items-center gap-3 min-w-0">
              <div class="size-9 rounded-xl bg-bejo-500 text-white flex items-center justify-center shadow-lg shadow-bejo-500/20 shrink-0">
                <Icon icon="lucide:home" class="size-5 shrink-0" />
              </div>
              <div class="space-y-0.5 min-w-0">
                <div class="flex flex-wrap items-center gap-1.5">
                  <h3 class="text-base sm:text-lg font-black text-slate-900 leading-none">Pilih Unit Properti</h3>
                  <span class="text-[9px] sm:text-[10px] font-black text-bejo-600 bg-bejo-50 border border-bejo-100 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">Langkah 2 dari 3</span>
                </div>
                <p class="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mt-1 truncate">Pilih unit untuk dimasukkan ke dalam pesan</p>
              </div>
            </div>
            <button @click="handleClose" class="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100 shrink-0">
              <Icon icon="lucide:x" class="size-5 shrink-0" />
            </button>
          </div>

          <div class="relative mt-4">
            <Icon icon="lucide:search" class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Cari nama unit, kota, atau alamat..." 
              class="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-xs sm:text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 transition-all"
            />
          </div>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="flex-grow overflow-y-auto p-3 sm:p-4 space-y-2 custom-scrollbar">
          <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
            <Icon icon="lucide:loader-2" class="size-10 animate-spin text-bejo-500" />
            <span class="text-sm font-black text-slate-400 uppercase tracking-widest">Memuat Data Unit...</span>
          </div>

          <template v-else>
            <div 
              v-for="unit in filteredUnits" 
              :key="unit.No_Id"
              @click="selectUnit(unit)"
              class="group flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-50 bg-white hover:bg-bejo-50 hover:border-bejo-100 transition-all cursor-pointer active:scale-[0.98] gap-2 min-w-0"
            >
              <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div class="size-10 sm:size-12 rounded-lg sm:rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-50">
                   <img v-if="unit.MediaUrls?.[0]?.Url || unit.MediaUrls?.[0]?.Id_Media?.startsWith('http')" 
                        :src="unit.MediaUrls[0].Url || unit.MediaUrls[0].Id_Media" 
                        class="w-full h-full object-cover transition-transform group-hover:scale-110" />
                   <div v-else class="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                      <Icon icon="lucide:image" class="size-4 sm:size-5" />
                   </div>
                </div>
                <div class="space-y-0.5 min-w-0">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <h6 class="text-xs sm:text-sm font-black text-slate-900 group-hover:text-bejo-600 transition-colors truncate">{{ unit.Nama_Produk }}</h6>
                    <span v-if="unit.Tipe" class="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-slate-200/50 group-hover:bg-white group-hover:border-bejo-200 group-hover:text-bejo-600 transition-all shrink-0">
                      {{ unit.Tipe }}
                    </span>
                  </div>
                  <div class="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-400 truncate">
                    <Icon icon="lucide:map-pin" class="size-3 text-bejo-500 shrink-0" />
                    {{ unit.Nama_Kota }}
                  </div>
                  <div class="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mt-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span v-if="unit.Harga_Jual1 > 0" class="text-[10px] sm:text-xs font-black text-bejo-600 uppercase">
                        Jual: {{ formatPrice(unit.Harga_Jual2 || unit.Harga_Jual1) }}
                      </span>
                      <span v-if="unit.Harga_Sewa1 > 0" class="text-[10px] sm:text-xs font-black text-slate-500 uppercase md:border-l md:border-slate-200 md:pl-2">
                        Sewa: {{ formatPrice(unit.Harga_Sewa2 || unit.Harga_Sewa1) }}
                      </span>
                    </div>
                    <span class="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-tighter md:border-l md:border-slate-200 md:pl-2 shrink-0">
                      {{ unit.Luas_Tanah }}m² / {{ unit.Luas_Bangunan }}m²
                    </span>
                  </div>
                </div>
              </div>

              <div class="size-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-bejo-500 group-hover:text-white transition-all shadow-sm shrink-0">
                <Icon icon="lucide:chevron-right" class="size-4 sm:size-5" />
              </div>
            </div>

            <div v-if="filteredUnits.length === 0" class="flex flex-col items-center justify-center py-10 opacity-30">
              <Icon icon="lucide:search-x" class="size-12 mb-2" />
              <span class="text-sm font-black uppercase tracking-widest">Unit tidak ditemukan</span>
            </div>
          </template>
        </div>

        <!-- Modal Footer -->
        <div class="p-4 sm:p-6 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between shrink-0">
          <button @click="selectUnit(null)" class="h-9 sm:h-10 px-4 sm:px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all active:scale-95 whitespace-nowrap">
            Tanpa Unit / Lompati
          </button>
          <button @click="handleClose" class="h-9 sm:h-10 px-6 sm:px-8 text-slate-500 hover:text-slate-900 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all active:scale-95 shrink-0">
            Batal
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
