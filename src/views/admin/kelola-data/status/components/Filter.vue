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

const emit = defineEmits(['search', 'filterCategory', 'exportExcel', 'exportPdf', 'print', 'updateColumns'])
const searchQuery = ref('')
const category = ref('')
const isCategoryOpen = ref(false)
const isExportOpen = ref(false)
const isSettingsOpen = ref(false)

const categoryOptions = [
  { label: 'SEMUA KATEGORI', value: '' },
  { label: 'PRODUK', value: 'produk' },
  { label: 'CUSTOMER', value: 'customer' },
  { label: 'TRANSAKSI', value: 'transaksi' },
  { label: 'UMUM', value: 'umum' }
]

const selectCategory = (option: any) => {
  category.value = option.value
  isCategoryOpen.value = false
  emit('filterCategory', option.value)
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.category-dropdown')) isCategoryOpen.value = false
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
  <div class="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 flex-grow">
    <div class="relative group flex-grow lg:max-w-xs">
      <div class="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none transition-colors group-focus-within:text-bejo-500 text-slate-400">
        <Icon icon="lucide:search" class="size-4" />
      </div>
      <input 
        v-model="searchQuery"
        type="text" 
        class="w-full h-11 ps-11 pe-4 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all placeholder:text-slate-400 placeholder:font-black placeholder:uppercase placeholder:tracking-widest" 
        placeholder="Cari Nama Status..." 
      />
    </div>

    <div class="relative w-full lg:w-48 category-dropdown">
      <button 
        @click="isCategoryOpen = !isCategoryOpen"
        type="button"
        class="w-full h-11 px-4 flex items-center justify-between bg-white border border-bejo-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-bejo-500 transition-all shadow-sm shadow-bejo-500/5"
      >
        <span>{{ categoryOptions.find(o => o.value === category)?.label || 'PILIH KATEGORI' }}</span>
        <Icon icon="lucide:chevron-down" class="size-3.5 transition-transform" :class="{ 'rotate-180': isCategoryOpen }" />
      </button>

      <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
        <div v-show="isCategoryOpen" class="absolute left-0 top-full mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[130] p-1">
          <button 
            v-for="opt in categoryOptions" 
            :key="opt.value"
            @click="selectCategory(opt)"
            class="w-full flex items-center px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all text-left"
            :class="category === opt.value ? 'bg-bejo-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'"
          >
            {{ opt.label }}
          </button>
        </div>
      </Transition>
    </div>

    <div class="flex items-center gap-3">
      <div class="relative export-dropdown flex-1 lg:flex-none">
        <button 
          @click="isExportOpen = !isExportOpen"
          type="button" 
          class="w-full h-11 px-4 bg-white border border-dashed border-bejo-200 text-bejo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-bejo-50 hover:border-bejo-500 transition-all flex items-center justify-center gap-2 group whitespace-nowrap"
        >
          <Icon icon="lucide:download-cloud" class="size-4 group-hover:-translate-y-0.5 transition-transform" />
          Export
          <Icon icon="lucide:chevron-down" class="size-3 transition-transform" :class="{ 'rotate-180': isExportOpen }" />
        </button>

        <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
          <div v-show="isExportOpen" class="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 z-[120]">
            <button @click="emit('exportExcel'); isExportOpen = false" class="dropdown-item">
              <Icon icon="lucide:file-spreadsheet" class="size-4 text-emerald-500" />
              Excel Format
            </button>
            <button @click="emit('exportPdf'); isExportOpen = false" class="dropdown-item">
              <Icon icon="lucide:file-type-2" class="size-4 text-red-500" />
              PDF Format
            </button>
            <div class="my-1.5 border-t border-slate-50"></div>
            <button @click="emit('print'); isExportOpen = false" class="dropdown-item">
              <Icon icon="lucide:printer" class="size-4 text-slate-500" />
              Print List
            </button>
          </div>
        </Transition>
      </div>
      
      <div class="relative settings-wrapper">
        <button 
          @click="isSettingsOpen = !isSettingsOpen" 
          type="button" 
          class="size-11 shrink-0 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-900 border border-slate-100 rounded-xl hover:bg-slate-100 transition-all"
        >
          <Icon icon="lucide:sliders-horizontal" class="size-4" />
        </button>

        <TableSettings
          :show="isSettingsOpen"
          :columns="columns"
          @close="isSettingsOpen = false"
          @update="$emit('updateColumns', $event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";
.dropdown-item {
  @apply w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 rounded-xl transition-all hover:bg-slate-50 text-left;
}
</style>
