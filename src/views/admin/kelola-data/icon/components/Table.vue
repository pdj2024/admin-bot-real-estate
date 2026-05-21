<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, h, computed } from 'vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'
import { useVueTable, FlexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/vue-table'
import { confirm, success, fail } from '@/utils/sweet-alert'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

interface IconData {
  No_Id: string
  Nama: string
  Kode: string | null
  Tipe: string
  Status: string
  Keterangan: string | null
}

const items = ref<IconData[]>([])
const isLoading = ref(false)
const rowSelection = ref<Record<string, boolean>>({})
const emit = defineEmits(['edit', 'success'])

const props = defineProps({
  searchQuery: { type: String, default: '' },
  statusFilter: { type: String, default: '' }
})

const filteredData = computed(() => {
  let result = items.value
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
    id: 'preview', 
    header: 'Preview',
    cell: ({ row }: any) => {
      const item = row.original
      return h('div', { class: 'size-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-bejo-600 shadow-sm group-hover:scale-110 transition-transform duration-500' }, [
        item.Tipe === 'class' ? h('i', { class: item.Nama + ' text-xl' }) :
        item.Tipe === 'svg' ? h('div', { innerHTML: item.Kode || '', class: 'size-6 flex items-center justify-center' }) :
        item.Tipe === 'url' ? h('img', { src: item.Nama, class: 'size-6 object-contain' }) :
        h(Icon, { icon: item.Nama.includes(':') ? item.Nama : `lucide:${item.Nama}`, class: 'size-6' })
      ])
    }
  },
  { accessorKey: 'Nama', header: 'Nama Icon' },
  { accessorKey: 'Tipe', header: 'Tipe' },
  { accessorKey: 'Status', header: 'Status' },
  { id: 'aksi', header: 'Action', enableSorting: false },
  // Virtual columns for sub-data visibility toggles
  { accessorKey: 'Keterangan', header: 'Keterangan', meta: { isVirtual: true } },
  { accessorKey: 'No_Id', header: 'ID Icon', meta: { isVirtual: true } }
]

const columnVisibility = ref({})

const fetchData = async () => {
  isLoading.value = true
  try {
    const { data } = await api.get('/api/masIcon/getAll')
    if (data.StatusCode === 200) {
      items.value = data.Data
    }
  } catch (err: any) {
    console.error('Gagal memuat data:', err)
  } finally {
    isLoading.value = false
  }
}

const toggleStatus = async (item: IconData) => {
  const newStatus = item.Status === 'aktif' ? 'nonaktif' : 'aktif'
  try {
    await api.put(`/api/masIcon/update?no_id=${item.No_Id}`, { ...item, Status: newStatus }, { headers: { 'X-Jenis-User': 'admin' } })
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
const selectedItems = computed(() => table.getSelectedRowModel().rows.map(r => r.original as IconData))
const showBatchActivate = computed(() => selectedItems.value.some(item => item.Status !== 'aktif'))
const showBatchDeactivate = computed(() => selectedItems.value.some(item => item.Status === 'aktif'))

const handleBatchUpdate = async (value: 'aktif' | 'nonaktif') => {
  const selectedRows = table.getSelectedRowModel().rows
  if (selectedRows.length === 0) return

  confirm(`Apakah Anda yakin ingin mengubah Status untuk ${selectedRows.length} icon terpilih?`, async () => {
    let successCount = 0
    let failCount = 0

    for (const row of selectedRows) {
      const item = row.original
      try {
        await api.put(`/api/masIcon/update?no_id=${item.No_Id}`, 
          { ...item, Status: value }, 
          { headers: { 'X-Jenis-User': 'admin' } }
        )
        item.Status = value
        successCount++
      } catch {
        failCount++
      }
    }

    if (successCount > 0) success(`Berhasil mengubah ${successCount} data icon`)
    if (failCount > 0) fail(`${failCount} data gagal diubah`)
    
    table.resetRowSelection()
    emit('success')
  })
}

const handleBatchDelete = async () => {
  const selectedRows = table.getSelectedRowModel().rows
  if (selectedRows.length === 0) return

  confirm(`Apakah Anda yakin ingin menghapus ${selectedRows.length} icon terpilih secara permanen?`, async () => {
    let successCount = 0
    let failCount = 0

    for (const row of selectedRows) {
      const item = row.original
      try {
        await api.delete('/api/masIcon/delete', { params: { no_id: item.No_Id } })
        successCount++
      } catch {
        failCount++
      }
    }

    if (successCount > 0) success(`Berhasil menghapus ${successCount} data icon`)
    if (failCount > 0) fail(`${failCount} data gagal dihapus`)
    
    fetchData()
    table.resetRowSelection()
    emit('success')
  })
}

// Actions for Export
const getExportData = () => {
  const visibleColumns = table.getVisibleLeafColumns().filter(c => !['select', 'aksi', 'preview'].includes(c.id))
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

  const wsData = [['DATA LIST ICON'], [], headers, ...rows]
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data')
  XLSX.writeFile(wb, `list_icon_${new Date().toISOString().split('T')[0]}.xlsx`)
  success('Excel berhasil diunduh')
}

const exportToPDF = () => {
  const { headers, rows } = getExportData()
  if (rows.length === 0) return fail('Tidak ada data untuk diekspor')

  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('DATA LIST ICON', 14, 20)
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 30,
    theme: 'striped',
    headStyles: { fillColor: [235, 112, 31] }
  })
  doc.save(`list_icon_${new Date().toISOString().split('T')[0]}.pdf`)
  success('PDF berhasil diunduh')
}

const printData = () => {
  const { headers, rows } = getExportData()
  if (rows.length === 0) return fail('Tidak ada data untuk dicetak')

  const printWindow = window.open('', '_blank')
  if (!printWindow) return fail('Gagal membuka jendela cetak')

  const html = `
    <html>
      <head>
        <title>Cetak Data List Icon</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
          .header { margin-bottom: 30px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: 900; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: -0.025em; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #f97316; color: white; text-align: left; padding: 12px 15px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; }
          td { padding: 12px 15px; border-bottom: 1px solid #f1f5f9; font-size: 11px; font-weight: 500; }
          tr:nth-child(even) { background: #f8fafc; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">Data List Icon</h1>
        </div>
        <table>
          <thead>
            <tr>${headers.map(h => '<th>' + h + '</th>').join('')}</tr>
          </thead>
          <tbody>
            ${rows.map(r => '<tr>' + r.map(v => '<td>' + v + '</td>').join('') + '</tr>').join('')}
          </tbody>
        </table>
        <script>
          window.onload = () => {
            window.print();
            window.onafterprint = () => window.close();
          }
        <\/script>
      </body>
    </html>
  `
  printWindow.document.write(html)
  printWindow.document.close()
}

const updateVisibility = (visibility: any) => {
  columnVisibility.value = visibility
}

defineExpose({ 
  fetchData, 
  exportToExcel, 
  exportToPDF, 
  printData, 
  updateVisibility,
  getColumns: () => table.getAllLeafColumns().filter(c => !['select', 'aksi', 'preview'].includes(c.id)).map(c => ({
    id: c.id,
    label: (c.columnDef as any).header as string,
    isVisible: c.getIsVisible()
  }))
})



const handleDelete = (item: IconData) => {
  confirm(`Ingin menghapus icon ${item.Nama}?`, async () => {
    try {
      await api.delete('/api/masIcon/delete', { params: { no_id: item.No_Id } })
      success('Icon berhasil dihapus')
      fetchData()
      emit('success')
    } catch (err: any) {
      fail(err.response?.data?.Message || 'Gagal menghapus data')
    }
  })
}

onMounted(() => {
  fetchData()
})

onBeforeUnmount(() => {
})
</script>

<template>
  <div class="flex flex-col relative">
    <!-- Batch Action Bar -->
    <Transition name="slide-up">
      <div v-if="Object.keys(rowSelection).length > 0" class="absolute -top-24 left-0 right-0 z-50 px-6 py-4 bg-white/80 backdrop-blur-md border border-bejo-100 rounded-3xl shadow-2xl shadow-bejo-500/10 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
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

    <div class="lg:overflow-visible relative">
      <div v-if="isLoading && items.length > 0" class="absolute inset-0 z-10 bg-white/40 backdrop-blur-[1px] flex items-start justify-center pt-20 transition-all duration-300">
        <div class="bg-white px-4 py-2 rounded-2xl shadow-xl border border-bejo-100 flex items-center gap-3 animate-in fade-in zoom-in-95">
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
                :class="header.column.id === 'select' ? 'pl-4 pr-0 w-8' : (header.column.id === 'preview' ? 'pl-3 pr-6' : 'px-6')"
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

              <td v-if="table.getColumn('preview')?.getIsVisible()" class="pl-3 pr-6 py-5">
                <FlexRender :render="table.getColumn('preview')!.columnDef.cell" :props="row.getVisibleCells().find(c => c.column.id === 'preview')?.getContext()" />
              </td>

              <td v-if="table.getColumn('Nama')?.getIsVisible()" class="px-6 py-5">
                <div class="flex flex-col gap-0.5">
                  <span class="font-black text-slate-900 tracking-tight group-hover:text-bejo-600 transition-colors">{{ row.original.Nama }}</span>
                  <div class="flex items-center gap-2">
                    <span v-if="table.getColumn('No_Id')?.getIsVisible()" class="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">ID: {{ row.original.No_Id }}</span>
                    <span v-if="row.original.Keterangan && table.getColumn('Keterangan')?.getIsVisible()" class="text-[10px] text-slate-400 italic font-medium truncate max-w-[150px]">"{{ row.original.Keterangan }}"</span>
                  </div>
                </div>
              </td>

              <td v-if="table.getColumn('Tipe')?.getIsVisible()" class="px-6 py-5">
                <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-200/50">
                  {{ row.original.Tipe }}
                </span>
              </td>

              <td v-if="table.getColumn('Status')?.getIsVisible()" class="px-6 py-5">
                <div class="flex items-center gap-3">
                  <div 
                    class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border"
                    :class="row.original.Status === 'aktif' ? 'bg-bejo-50 text-bejo-600 border-bejo-100 shadow-sm shadow-bejo-500/10' : 'bg-slate-50 text-slate-400 border-slate-100'"
                  >
                    {{ row.original.Status === 'aktif' ? 'Aktif' : 'Nonaktif' }}
                  </div>
                  <button 
                    @click="toggleStatus(row.original)"
                    class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 focus:outline-none"
                    :class="row.original.Status === 'aktif' ? 'bg-bejo-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-slate-200'"
                  >
                    <span class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition duration-300 ease-in-out" :class="row.original.Status === 'aktif' ? 'translate-x-4' : 'translate-x-0'"></span>
                  </button>
                </div>
              </td>

              <td v-if="table.getColumn('aksi')?.getIsVisible()" class="px-6 py-5">
                <div class="flex items-center gap-2">
                  <button @click="emit('edit', row.original)" class="h-9 px-3 rounded-xl bg-slate-50 hover:bg-bejo-500 hover:text-white border border-slate-100 text-slate-500 transition-all flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-wider active:scale-95">
                    <Icon icon="lucide:pencil" class="size-3.5" />
                    Edit
                  </button>
                  <button @click="handleDelete(row.original)" class="h-9 px-3 rounded-xl bg-red-50 hover:bg-red-500 hover:text-white border border-red-100/50 text-red-500 transition-all flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-wider active:scale-95">
                    <Icon icon="lucide:trash-2" class="size-3.5" />
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="px-6 py-5 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Menampilkan 
          <span class="text-slate-900 font-black">{{ table.getRowModel().rows.length }}</span> 
          dari 
          <span class="text-slate-900 font-black">{{ items.length }}</span> 
          Data
        </div>
        <select 
          :value="table.getState().pagination.pageSize" 
          @change="e => table.setPageSize(Number((e.target as HTMLSelectElement).value))"
          class="h-8 min-w-[70px] px-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg outline-none cursor-pointer hover:border-bejo-500 transition-all shadow-sm"
        >
          <option v-for="size in [10, 25, 50]" :key="size" :value="size">{{ size }}</option>
        </select>
      </div>

      <div class="flex items-center gap-2">
        <button @click="table.previousPage()" :disabled="!table.getCanPreviousPage()" class="btn-pagination">
          <Icon icon="lucide:chevron-left" class="size-4" />
        </button>
        <div class="flex items-center gap-1">
          <button v-for="n in table.getPageCount()" :key="n" @click="table.setPageIndex(n - 1)" class="btn-pagination-num" :class="{ active: table.getState().pagination.pageIndex === n - 1 }">
            {{ n }}
          </button>
        </div>
        <button @click="table.nextPage()" :disabled="!table.getCanNextPage()" class="btn-pagination">
          <Icon icon="lucide:chevron-right" class="size-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";
.btn-pagination { @apply size-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed; }
.btn-pagination-num { @apply size-9 flex items-center justify-center rounded-xl text-xs font-black text-slate-400 hover:bg-slate-50 transition-all; }
.btn-pagination-num.active { @apply bg-bejo-500 text-white shadow-lg shadow-bejo-500/20; }
.dropdown-item { @apply flex items-center gap-3 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 rounded-xl transition-all hover:bg-slate-50; }
.btn-batch { @apply flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all; }
.custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-slate-100 rounded-full; }

.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(20px); opacity: 0; }
</style>
