<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import TableSettings from '@/components/TableSettings.vue'

defineProps({
  columns: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['search', 'filterStatus', 'add', 'exportExcel', 'exportPdf', 'print', 'setting', 'updateColumns'])
const searchQuery = ref('')
const status = ref('')
const area = ref('')
const isStatusOpen = ref(false)
const isExportOpen = ref(false)
const isSettingsOpen = ref(false)

const statusOptions = [
  { label: 'SEMUA STATUS', value: '' },
  { label: 'AKTIF', value: 'aktif' },
  { label: 'NONAKTIF', value: 'non aktif' }
]

const selectStatus = (option: any) => {
  status.value = option.value
  isStatusOpen.value = false
  emit('filterStatus', option.value)
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.status-dropdown')) isStatusOpen.value = false
  if (!target.closest('.export-dropdown')) isExportOpen.value = false
  if (!target.closest('.settings-wrapper')) isSettingsOpen.value = false
}

watch(searchQuery, (val) => emit('search', val))

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
    <!-- Search Interface -->
    <div class="relative group w-full lg:w-64">
      <div class="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none transition-colors group-focus-within:text-bejo-500 text-slate-400">
        <Icon icon="lucide:search" class="size-4" />
      </div>
      <input 
        v-model="searchQuery"
        type="text" 
        class="w-full h-11 ps-11 pe-4 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all placeholder:text-slate-400 placeholder:font-black placeholder:uppercase placeholder:tracking-widest" 
        placeholder="Cari Sales / Agent..." 
      />
    </div>

    <!-- Area Selector -->
    <div class="relative w-full lg:w-48 group">
      <div class="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-slate-400 group-focus-within:text-bejo-500 transition-colors">
        <Icon icon="lucide:map-pin" class="size-3.5" />
      </div>
      <select v-model="area" class="w-full h-11 pl-11 pr-10 text-[10px] font-black uppercase tracking-widest text-slate-600 bg-white border border-slate-100 rounded-xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none appearance-none transition-all cursor-pointer shadow-sm">
        <option value="">Semua Area</option>
        <option>Jakarta</option>
        <option>Bandung</option>
        <option>Yogyakarta</option>
        <option>Malang</option>
        <option>Bogor</option>
        <option>Solo</option>
      </select>
      <div class="absolute inset-y-0 end-4 flex items-center pointer-events-none text-slate-300">
        <Icon icon="lucide:chevron-down" class="size-3.5" />
      </div>
    </div>

    <!-- Status Selector (Custom) -->
    <div class="relative w-full lg:w-40 status-dropdown">
      <button 
        @click="isStatusOpen = !isStatusOpen"
        type="button"
        class="w-full h-11 px-4 flex items-center justify-between bg-white border border-bejo-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-bejo-500 transition-all shadow-sm shadow-bejo-500/5"
      >
        <span>{{ statusOptions.find(o => o.value === status)?.label || 'STATUS' }}</span>
        <Icon icon="lucide:chevron-down" class="size-3.5 transition-transform" :class="{ 'rotate-180': isStatusOpen }" />
      </button>

      <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
        <div v-show="isStatusOpen" class="absolute left-0 top-full mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[130] p-1">
          <button 
            v-for="opt in statusOptions" 
            :key="opt.value"
            @click="selectStatus(opt)"
            class="w-full flex items-center px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all text-left"
            :class="status === opt.value ? 'bg-bejo-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'"
          >
            {{ opt.label }}
          </button>
        </div>
      </Transition>
    </div>

    <div class="flex items-center gap-3 flex-1 lg:flex-none">
      <!-- Export Dropdown -->
      <div class="relative export-dropdown flex-1 lg:flex-none">
        <button 
          @click="isExportOpen = !isExportOpen"
          type="button" 
          class="w-full h-11 px-4 bg-white border border-dashed border-bejo-200 text-bejo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-bejo-50 hover:border-bejo-500 transition-all flex items-center justify-center gap-2 group whitespace-nowrap"
        >
          <Icon icon="lucide:download-cloud" class="size-4 group-hover:-translate-y-0.5 transition-transform" />
          Export
        </button>

        <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
          <div v-show="isExportOpen" class="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[130] p-1">
            <button @click="emit('exportExcel'); isExportOpen = false" class="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
              <div class="size-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <Icon icon="lucide:file-spreadsheet" class="size-4" />
              </div>
              Excel Format
            </button>
            <button @click="emit('exportPdf'); isExportOpen = false" class="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
              <div class="size-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                <Icon icon="lucide:file-type" class="size-4" />
              </div>
              PDF Format
            </button>
            <button @click="emit('print'); isExportOpen = false" class="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 rounded-xl transition-all border-t border-slate-50 mt-1 pt-2">
              <div class="size-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <Icon icon="lucide:printer" class="size-4" />
              </div>
              Print List
            </button>
          </div>
        </Transition>
      </div>
      
      <!-- Settings wrapper -->
      <div class="relative settings-wrapper flex-none">
        <button 
          @click="isSettingsOpen = !isSettingsOpen"
          type="button" 
          class="size-11 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-bejo-600 border border-slate-100 rounded-xl hover:bg-bejo-50 hover:border-bejo-200 transition-all shadow-sm group"
        >
          <Icon icon="lucide:sliders-horizontal" class="size-4 group-hover:rotate-180 transition-transform duration-500" />
        </button>

        <TableSettings 
          :show="isSettingsOpen" 
          :columns="columns"
          @close="isSettingsOpen = false"
          @update="emit('updateColumns', $event)"
        />
      </div>
    </div>
  </div>
</template>
