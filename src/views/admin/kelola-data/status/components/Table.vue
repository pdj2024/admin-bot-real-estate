<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, h, computed } from 'vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'
import { useVueTable, FlexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/vue-table'
import { confirm, success, fail } from '@/utils/sweet-alert'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

interface StatusData {
  No_Id: string
  Nama: string
  Warna: string | null
  Kategori: string
  Status: string
  Keterangan: string | null
}

const items = ref<StatusData[]>([])
const isLoading = ref(false)
const rowSelection = ref<Record<string, boolean>>({})
const emit = defineEmits(['edit', 'success'])

const props = defineProps({
  searchQuery: { type: String, default: '' },
  statusFilter: { type: String, default: '' },
  categoryFilter: { type: String, default: '' }
})

const filteredData = computed(() => {
  let result = items.value
  if (props.categoryFilter) {
    result = result.filter(item => item.Kategori === props.categoryFilter)
  }
  if (props.statusFilter) {
    result = result.filter(item => item.Status === props.statusFilter)
  }
  return result
})

const columns = [
  {
    id: 'select',
    header: ({ table }: any) => h('input', {
      type: 'checkbox',
      checked: table.getIsAllPageRowsSelected(),
      indeterminate: table.getIsSomePageRowsSelected(),
      onChange: table.getToggleAllPageRowsSelectedHandler(),
      class: 'size-4 rounded border-slate-300 text-bejo-600 focus:ring-bejo-500/20 transition-all cursor-pointer'
    }),
    cell: ({ row }: any) => h('input', {
      type: 'checkbox',
      checked: row.getIsSelected(),
      disabled: !row.getCanSelect(),
      onChange: row.getToggleSelectedHandler(),
      class: 'size-4 rounded border-slate-300 text-bejo-600 focus:ring-bejo-500/20 transition-all cursor-pointer'
    }),
    enableSorting: false,
    enableHiding: false,
  },
  { 
    accessorKey: 'Nama', 
    header: 'Nama Status',
    cell: ({ row }: any) => h('div', { class: 'flex items-center gap-3' }, [
      h('div', { 
        class: 'size-3 rounded-full border border-slate-200 shadow-sm', 
        style: { backgroundColor: row.original.Warna || '#e2e8f0' } 
      }),
      h('span', { class: 'font-black text-slate-900 group-hover:text-bejo-600 transition-colors' }, row.original.Nama)
    ])
  },
  { accessorKey: 'Kategori', header: 'Kategori' },
  { accessorKey: 'Warna', header: 'Warna Hex' },
  { accessorKey: 'Status', header: 'Status' },
  { id: 'aksi', header: 'Action', enableSorting: false },
  // Virtual columns
  { accessorKey: 'Keterangan', header: 'Keterangan', meta: { isVirtual: true } },
  { accessorKey: 'No_Id', header: 'ID Status', meta: { isVirtual: true } }
]

const columnVisibility = ref({})

const fetchData = async () => {
  isLoading.value = true
  try {
    const { data } = await api.get('/api/masStatus/getAll')
    if (data.StatusCode === 200) {
      items.value = data.Data
    }
  } catch (err: any) {
    console.error('Gagal memuat data:', err)
  } finally {
    isLoading.value = false
  }
}

const toggleStatus = async (item: StatusData) => {
  const newStatus = item.Status === 'aktif' ? 'nonaktif' : 'aktif'
  try {
    await api.put(`/api/masStatus/update?no_id=${item.No_Id}`, { ...item, Status: newStatus }, { headers: { 'X-Jenis-User': 'admin' } })
    item.Status = newStatus
    success(`Berhasil mengubah status ${item.Nama}`)
    emit('success')
  } catch {
    fail(`Gagal mengubah status ${item.Nama}`)
  }
}

const table = useVueTable({
  get data() { return filteredData.value },
  columns,
  state: {
    get rowSelection() { return rowSelection.value },
    get globalFilter() { return props.searchQuery },
    get columnVisibility() { return columnVisibility.value }
  },
  onRowSelectionChange: (updaterOrValue) => {
    rowSelection.value = typeof updaterOrValue === 'function' ? updaterOrValue(rowSelection.value) : updaterOrValue
  },
  onColumnVisibilityChange: (updaterOrValue) => {
    columnVisibility.value = typeof updaterOrValue === 'function' ? updaterOrValue(columnVisibility.value) : updaterOrValue
  },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getRowId: (row) => row.No_Id,
  initialState: { pagination: { pageSize: 10 } }
})

// Batch Actions
const selectedItems = computed(() => table.getSelectedRowModel().rows.map(r => r.original as StatusData))
const showBatchActivate = computed(() => selectedItems.value.some(item => item.Status !== 'aktif'))
const showBatchDeactivate = computed(() => selectedItems.value.some(item => item.Status === 'aktif'))

const handleBatchUpdate = async (value: 'aktif' | 'nonaktif') => {
  const selectedRows = table.getSelectedRowModel().rows
  if (selectedRows.length === 0) return

  confirm(`Apakah Anda yakin ingin mengubah Status untuk ${selectedRows.length} status terpilih?`, async () => {
    let successCount = 0
    let failCount = 0

    for (const row of selectedRows) {
      const item = row.original
      try {
        await api.put(`/api/masStatus/update?no_id=${item.No_Id}`, 
          { ...item, Status: value }, 
          { headers: { 'X-Jenis-User': 'admin' } }
        )
        item.Status = value
        successCount++
      } catch {
        failCount++
      }
    }

    if (successCount > 0) success(`Berhasil mengubah ${successCount} data status`)
    if (failCount > 0) fail(`${failCount} data gagal diubah`)
    
    table.resetRowSelection()
    emit('success')
  })
}

const handleBatchDelete = async () => {
  const selectedRows = table.getSelectedRowModel().rows
  if (selectedRows.length === 0) return

  confirm(`Apakah Anda yakin ingin menghapus ${selectedRows.length} status terpilih secara permanen?`, async () => {
    let successCount = 0
    let failCount = 0

    for (const row of selectedRows) {
      const item = row.original
      try {
        await api.delete(`/api/masStatus/delete`, { params: { no_id: item.No_Id } })
        successCount++
      } catch {
        failCount++
      }
    }

    if (successCount > 0) success(`Berhasil menghapus ${successCount} data status`)
    if (failCount > 0) fail(`${failCount} data gagal dihapus`)
    
    fetchData()
    table.resetRowSelection()
    emit('success')
  })
}

const getExportData = () => {
  const visibleColumns = table.getVisibleLeafColumns().filter(c => !['select', 'aksi'].includes(c.id))
  const headers = ['No', ...visibleColumns.map(c => (c.columnDef as any).header as string)]
  const rows = table.getRowModel().rows.map((row) => {
    return [
      String(row.index + 1),
      ...visibleColumns.map(col => {
        const value = row.getValue(col.id)
        return value === null || value === undefined ? '' : String(value)
      })
    ]
  })
  return { headers, rows }
}

const exportToExcel = () => {
  const { headers, rows } = getExportData()
  if (rows.length === 0) return fail('Tidak ada data untuk diekspor')
  const wsData = [['DATA LIST STATUS'], [], headers, ...rows]
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data')
  XLSX.writeFile(wb, `list_status_${new Date().toISOString().split('T')[0]}.xlsx`)
  success('Excel berhasil diunduh')
}

const exportToPDF = () => {
  const { headers, rows } = getExportData()
  if (rows.length === 0) return fail('Tidak ada data untuk diekspor')
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('DATA LIST STATUS', 14, 20)
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 30,
    theme: 'striped',
    headStyles: { fillColor: [235, 112, 31] }
  })
  doc.save(`list_status_${new Date().toISOString().split('T')[0]}.pdf`)
  success('PDF berhasil diunduh')
}

const printData = () => {
  window.print()
}

const updateVisibility = (visibility: any) => {
  columnVisibility.value = visibility
}

defineExpose({ 
  fetchData, exportToExcel, exportToPDF, printData, updateVisibility,
  getColumns: () => table.getAllLeafColumns().filter(c => !['select', 'aksi'].includes(c.id)).map(c => ({
    id: c.id,
    label: (c.columnDef as any).header as string,
    isVisible: c.getIsVisible()
  }))
})



const handleDelete = (item: StatusData) => {
  confirm(`Ingin menghapus status ${item.Nama}?`, async () => {
    try {
      await api.delete('/api/masStatus/delete', { params: { no_id: item.No_Id } })
      success('Status berhasil dihapus')
      fetchData()
      emit('success')
    } catch (err: any) {
      fail(err.response?.data?.Message || 'Gagal menghapus data')
    }
  })
}

const activeDropdownRowId = ref<string | null>(null)
const toggleRowDropdown = (rowId: string) => {
  activeDropdownRowId.value = activeDropdownRowId.value === rowId ? null : rowId
}
const closeDropdown = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.action-dropdown-btn') && !target.closest('.action-dropdown-menu')) {
    activeDropdownRowId.value = null
  }
}

onMounted(() => {
  fetchData()
  document.addEventListener('click', closeDropdown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<template>
  <div class="flex flex-col relative">
    <!-- Batch Action Bar -->
    <Transition name="slide-up">
      <div v-if="Object.keys(rowSelection).length > 0" class="absolute -top-28 md:-top-24 left-0 right-0 z-50 px-4 py-3 md:px-6 md:py-4 bg-white/90 backdrop-blur-md border border-bejo-100 rounded-3xl shadow-2xl shadow-bejo-500/10 flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-4 animate-in fade-in slide-in-from-top-4">
        <div class="flex items-center gap-3 pr-4 border-r border-slate-100">
          <div class="size-10 rounded-xl bg-bejo-500 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-bejo-500/20">
            {{ Object.keys(rowSelection).length }}
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
            Hapus
          </button>
        </div>

        <button @click="table.resetRowSelection()" class="ml-auto flex items-center gap-2 px-4 py-2 text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-all">
          <Icon icon="lucide:rotate-ccw" class="size-3.5" />
          Batal
        </button>
      </div>
    </Transition>

    <div class="w-full overflow-hidden overflow-x-auto relative">
      <div v-if="isLoading && items.length > 0" class="absolute inset-0 z-10 bg-white/40 backdrop-blur-[1px] flex items-start justify-center pt-20">
        <div class="bg-white px-4 py-2 rounded-2xl shadow-xl border border-bejo-100 flex items-center gap-3">
          <Icon icon="lucide:loader-2" class="animate-spin size-4 text-bejo-500" />
          <span class="text-[10px] font-black text-slate-600 uppercase tracking-widest">Sinkronisasi...</span>
        </div>
      </div>

      <div class="max-h-[600px] overflow-auto custom-scrollbar">
        <table class="min-w-full divide-y divide-slate-100 border-separate border-spacing-0">
          <thead class="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm">
            <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
              <th v-for="header in headerGroup.headers.filter(h => !(h.column.columnDef.meta as any)?.isVirtual)" :key="header.id" 
                class="py-5 text-start text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100"
                :class="header.column.id === 'select' ? 'pl-4 pr-0 w-8' : 'px-6'"
              >
                <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-50">
            <tr v-if="isLoading && items.length === 0">
              <td colspan="6" class="py-24 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="size-12 rounded-2xl bg-bejo-50 flex items-center justify-center">
                    <Icon icon="lucide:loader-2" class="animate-spin size-6 text-bejo-500" />
                  </div>
                  <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Memuat Data...</span>
                </div>
              </td>
            </tr>

            <tr v-else-if="table.getRowModel().rows.length === 0">
              <td colspan="6" class="py-20 text-center">
                <div class="flex flex-col items-center gap-3 opacity-40">
                  <Icon icon="lucide:database-zap" class="size-12 text-slate-300" />
                  <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Tidak ada data ditemukan</span>
                </div>
              </td>
            </tr>

            <tr v-else v-for="row in table.getRowModel().rows" :key="row.id" class="hover:bg-slate-50/50 transition-all duration-300 group" :class="{ 'bg-bejo-50/30': row.getIsSelected() }">
              <td v-if="table.getColumn('select')?.getIsVisible()" class="pl-4 pr-0 py-5">
                <FlexRender v-if="table.getColumn('select')" :render="table.getColumn('select')!.columnDef.cell" :props="row.getVisibleCells().find(c => c.column.id === 'select')?.getContext()" />
              </td>

              <td v-if="table.getColumn('Nama')?.getIsVisible()" class="px-6 py-5">
                <FlexRender :render="table.getColumn('Nama')!.columnDef.cell" :props="row.getVisibleCells().find(c => c.column.id === 'Nama')?.getContext()" />
                <div v-if="table.getColumn('No_Id')?.getIsVisible()" class="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1 ml-6">ID: {{ row.original.No_Id }}</div>
              </td>

              <td v-if="table.getColumn('Kategori')?.getIsVisible()" class="px-6 py-5">
                <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-200/50">
                  {{ row.original.Kategori }}
                </span>
              </td>

              <td v-if="table.getColumn('Warna')?.getIsVisible()" class="px-6 py-5">
                <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{{ row.original.Warna || '-' }}</span>
              </td>

              <td v-if="table.getColumn('Status')?.getIsVisible()" class="px-6 py-5">
                <div class="flex items-center gap-3">
                  <div class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border" :class="row.original.Status === 'aktif' ? 'bg-bejo-50 text-bejo-600 border-bejo-100 shadow-sm shadow-bejo-500/10' : 'bg-slate-50 text-slate-400 border-slate-100'">
                    {{ row.original.Status === 'aktif' ? 'Aktif' : 'Nonaktif' }}
                  </div>
                  <button @click="toggleStatus(row.original)" class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 focus:outline-none" :class="row.original.Status === 'aktif' ? 'bg-bejo-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-slate-200'">
                    <span class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition duration-300 ease-in-out" :class="row.original.Status === 'aktif' ? 'translate-x-4' : 'translate-x-0'"></span>
                  </button>
                </div>
              </td>

            <td v-if="table.getColumn('aksi')?.getIsVisible()" class="px-6 py-5">
              <!-- Desktop Actions -->
              <div class="hidden md:flex items-center justify-end gap-2">
                <button @click="emit('edit', row.original)" class="h-9 px-3 rounded-xl bg-slate-50 hover:bg-bejo-500 hover:text-white border border-slate-100 text-slate-500 transition-all flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-wider active:scale-95">
                  <Icon icon="lucide:pencil" class="size-3.5" />
                  Edit
                </button>
                <button @click="handleDelete(row.original)" class="h-9 px-3 rounded-xl bg-red-50 hover:bg-red-500 hover:text-white border border-red-100/50 text-red-500 transition-all flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-wider active:scale-95">
                  <Icon icon="lucide:trash-2" class="size-3.5" />
                  Hapus
                </button>
              </div>

              <!-- Mobile Actions (Three Dots Dropdown) -->
              <div class="md:hidden relative flex justify-end">
                <button @click.stop="toggleRowDropdown(row.original.No_Id)" class="action-dropdown-btn size-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center border border-slate-200/60 text-slate-500 active:scale-95 transition-all">
                  <Icon icon="lucide:more-vertical" class="size-4" />
                </button>

                <!-- Dropdown Menu -->
                <div v-if="activeDropdownRowId === row.original.No_Id" class="action-dropdown-menu absolute right-0 mt-10 w-32 bg-white border border-slate-100 rounded-2xl shadow-xl z-[120] py-2 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                  <button @click="emit('edit', row.original); activeDropdownRowId = null" class="w-full px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-600 hover:bg-bejo-50 hover:text-bejo-600 flex items-center gap-2 transition-colors">
                    <Icon icon="lucide:pencil" class="size-3.5" />
                    Edit
                  </button>
                  <div class="h-px bg-slate-50 my-1"></div>
                  <button @click="handleDelete(row.original); activeDropdownRowId = null" class="w-full px-4 py-2 text-xs font-black uppercase tracking-wider text-red-500 hover:bg-red-55 flex items-center gap-2 transition-colors">
                    <Icon icon="lucide:trash-2" class="size-3.5" />
                    Hapus
                  </button>
                </div>
              </div>
            </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="px-6 py-5 border-t border-slate-50 flex flex-col lg:flex-row items-center justify-between gap-4">
      <div class="flex flex-wrap items-center justify-center lg:justify-start gap-4 lg:gap-6">
        <div class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Menampilkan <span class="text-slate-900 font-black">{{ table.getRowModel().rows.length }}</span> dari <span class="text-slate-900 font-black">{{ items.length }}</span> Data
        </div>
        <select :value="table.getState().pagination.pageSize" @change="e => table.setPageSize(Number((e.target as HTMLSelectElement).value))" class="h-8 min-w-[70px] px-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg outline-none cursor-pointer hover:border-bejo-500 shadow-sm">
          <option v-for="size in [10, 25, 50]" :key="size" :value="size">{{ size }}</option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <button @click="table.previousPage()" :disabled="!table.getCanPreviousPage()" class="btn-pagination"><Icon icon="lucide:chevron-left" class="size-4" /></button>
        <button v-for="n in table.getPageCount()" :key="n" @click="table.setPageIndex(n - 1)" class="btn-pagination-num" :class="{ active: table.getState().pagination.pageIndex === n - 1 }">{{ n }}</button>
        <button @click="table.nextPage()" :disabled="!table.getCanNextPage()" class="btn-pagination"><Icon icon="lucide:chevron-right" class="size-4" /></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";
.btn-pagination { @apply size-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-30; }
.btn-pagination-num { @apply size-9 flex items-center justify-center rounded-xl text-xs font-black text-slate-400 hover:bg-slate-50; }
.btn-pagination-num.active { @apply bg-bejo-500 text-white shadow-lg shadow-bejo-500/20; }
.dropdown-item { @apply flex items-center gap-3 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 rounded-xl hover:bg-slate-50; }
.btn-batch { @apply flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all; }
.custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-slate-100 rounded-full; }

.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(20px); opacity: 0; }
</style>
