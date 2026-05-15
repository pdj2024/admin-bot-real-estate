<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'
import { fail, success, confirm } from '@/utils/sweet-alert'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const props = defineProps({
  searchQuery: { type: String, default: '' },
  categoryFilter: { type: String, default: '' }
})

const emit = defineEmits(['edit', 'success'])

const items = ref<any[]>([])
const isLoading = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)

const columns = ref([
  { key: 'Nama', label: 'NAMA STATUS', visible: true },
  { key: 'Warna', label: 'WARNA', visible: true },
  { key: 'Kategori', label: 'KATEGORI', visible: true },
  { key: 'Status', label: 'STATUS', visible: true },
  { key: 'Keterangan', label: 'KETERANGAN', visible: true },
  { key: 'action', label: 'ACTION', visible: true }
])

const fetchData = async () => {
  isLoading.value = true
  try {
    const { data } = await api.get('/api/masStatus/getAll')
    if (data.StatusCode === 200) {
      items.value = data.Data
    }
  } catch (err: any) {
    fail(err.response?.data?.Message || 'Gagal mengambil data status')
  } finally {
    isLoading.value = false
  }
}

const filteredData = computed(() => {
  return items.value.filter(item => {
    const matchesSearch = item.Nama.toLowerCase().includes(props.searchQuery.toLowerCase())
    const matchesCategory = props.categoryFilter === '' || item.Kategori === props.categoryFilter
    return matchesSearch && matchesCategory
  })
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredData.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage.value))

const handleDelete = (id: string) => {
  confirm('Hapus status ini?', async () => {
    try {
      const { data } = await api.delete('/api/masStatus/delete', { params: { no_id: id } })
      if (data.StatusCode === 200) {
        success('Status berhasil dihapus')
        fetchData()
      }
    } catch (err: any) {
      fail(err.response?.data?.Message || 'Gagal menghapus status')
    }
  })
}

// Table functions for Filter.vue
const getColumns = () => columns.value
const updateVisibility = (newCols: any[]) => { columns.value = newCols }

const exportToExcel = () => {
  const data = filteredData.value.map(item => ({
    'Nama Status': item.Nama,
    'Warna': item.Warna,
    'Kategori': item.Kategori,
    'Status': item.Status,
    'Keterangan': item.Keterangan
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Statuses')
  XLSX.writeFile(wb, 'master_statuses.xlsx')
}

const exportToPDF = () => {
  const doc = new jsPDF()
  doc.text('Master Statuses List', 14, 15)
  autoTable(doc, {
    startY: 20,
    head: [['Nama Status', 'Kategori', 'Status', 'Warna']],
    body: filteredData.value.map(item => [item.Nama, item.Kategori, item.Status, item.Warna || '-']),
  })
  doc.save('master_statuses.pdf')
}

const printData = () => {
  window.print()
}

onMounted(fetchData)

defineExpose({ fetchData, getColumns, updateVisibility, exportToExcel, exportToPDF, printData })
</script>

<template>
  <div class="overflow-x-auto custom-scrollbar">
    <table class="w-full text-left border-separate border-spacing-y-2">
      <thead>
        <tr class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <th v-for="col in columns.filter(c => c.visible)" :key="col.key" class="px-6 py-4">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody v-if="isLoading">
        <tr v-for="i in 5" :key="i" class="animate-pulse">
          <td v-for="col in columns.filter(c => c.visible)" :key="col.key" class="px-6 py-4">
            <div class="h-8 bg-slate-100 rounded-lg w-full"></div>
          </td>
        </tr>
      </tbody>
      <tbody v-else-if="paginatedData.length > 0">
        <tr v-for="item in paginatedData" :key="item.No_Id" class="group transition-all">
          <td v-if="columns.find(c => c.key === 'Nama')?.visible" class="px-6 py-4 bg-slate-50 group-hover:bg-bejo-50/30 first:rounded-l-2xl transition-colors">
            <span class="text-xs font-black text-slate-700">{{ item.Nama }}</span>
          </td>

          <td v-if="columns.find(c => c.key === 'Warna')?.visible" class="px-6 py-4 bg-slate-50 group-hover:bg-bejo-50/30 transition-colors">
            <div class="flex items-center gap-3">
              <div class="size-4 rounded-full border border-slate-200" :style="{ backgroundColor: item.Warna || '#e2e8f0' }"></div>
              <span class="text-[10px] font-mono font-bold text-slate-400">{{ item.Warna || '-' }}</span>
            </div>
          </td>

          <td v-if="columns.find(c => c.key === 'Kategori')?.visible" class="px-6 py-4 bg-slate-50 group-hover:bg-bejo-50/30 transition-colors">
            <span class="px-2.5 py-1 rounded-lg bg-slate-200/50 text-[9px] font-black uppercase tracking-widest text-slate-500">
              {{ item.Kategori }}
            </span>
          </td>

          <td v-if="columns.find(c => c.key === 'Status')?.visible" class="px-6 py-4 bg-slate-50 group-hover:bg-bejo-50/30 transition-colors">
            <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm"
              :class="item.Status === 'aktif' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-400 text-white shadow-slate-400/20'">
              {{ item.Status || 'aktif' }}
            </span>
          </td>

          <td v-if="columns.find(c => c.key === 'Keterangan')?.visible" class="px-6 py-4 bg-slate-50 group-hover:bg-bejo-50/30 transition-colors">
            <span class="text-[10px] font-bold text-slate-400 italic">{{ item.Keterangan || '-' }}</span>
          </td>

          <td v-if="columns.find(c => c.key === 'action')?.visible" class="px-6 py-4 bg-slate-50 group-hover:bg-bejo-50/30 last:rounded-r-2xl transition-colors">
            <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="emit('edit', item)" class="size-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm">
                <Icon icon="lucide:edit-3" class="size-3.5" />
              </button>
              <button @click="handleDelete(item.No_Id)" class="size-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                <Icon icon="lucide:trash-2" class="size-3.5" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td :colspan="columns.length" class="px-6 py-20 text-center">
            <div class="flex flex-col items-center gap-3">
              <div class="size-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                <Icon icon="lucide:package-open" class="size-8" />
              </div>
              <p class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Data Tidak Ditemukan</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Pagination -->
  <div v-if="totalPages > 1" class="mt-8 flex items-center justify-between px-4">
    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
      Menampilkan {{ paginatedData.length }} dari {{ filteredData.length }} data
    </p>
    <div class="flex items-center gap-2">
      <button 
        @click="currentPage--" 
        :disabled="currentPage === 1"
        class="size-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-all"
      >
        <Icon icon="lucide:chevron-left" class="size-4" />
      </button>
      <div class="flex items-center gap-1">
        <button 
          v-for="p in totalPages" :key="p"
          @click="currentPage = p"
          class="size-8 rounded-lg text-[10px] font-black transition-all"
          :class="currentPage === p ? 'bg-bejo-600 text-white shadow-lg shadow-bejo-600/20' : 'text-slate-400 hover:bg-slate-50'"
        >
          {{ p }}
        </button>
      </div>
      <button 
        @click="currentPage++" 
        :disabled="currentPage === totalPages"
        class="size-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-all"
      >
        <Icon icon="lucide:chevron-right" class="size-4" />
      </button>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";
.custom-scrollbar::-webkit-scrollbar { height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-slate-100 rounded-full; }
</style>
