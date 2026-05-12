<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, h, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useVueTable, FlexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/vue-table'
import { confirm, success, fail } from '@/utils/sweet-alert'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

interface Sales {
  id: string
  name: string
  username: string
  area: string
  email: string
  phone: string
  joined: string
  status: 'Aktif' | 'Nonaktif'
  avatar?: string
  initials?: string
}

const emit = defineEmits(['edit', 'success'])
const rowSelection = ref<Record<string, boolean>>({})
const columnVisibility = ref({})

const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  statusFilter: {
    type: String,
    default: ''
  }
})

const filteredSales = computed(() => {
  let result = salesList.value
  if (props.statusFilter) {
    result = result.filter(s => s.status.toLowerCase() === props.statusFilter.toLowerCase())
  }
  return result
})
  
const salesList = ref<Sales[]>([
  { id: '#USR0011', name: 'Agus Saputra', username: 'agussaputra', area: 'Yogyakarta', email: 'agus.saputra@gmail.com', phone: '0813 2345 6789', joined: '05 Jan 2023', status: 'Aktif' },
  { id: '#USR0012', name: 'Maya Sari', username: 'mayasari', area: 'Malang', email: 'maya.sari@gmail.com', phone: '0821 3344 5566', joined: '14 Jan 2023', status: 'Aktif' },
  { id: '#USR0013', name: 'Hendra Wijaya', username: 'hendrawijaya', area: 'Bogor', email: 'hendra.wijaya@gmail.com', phone: '0815 6677 8899', joined: '22 Feb 2023', status: 'Nonaktif' },
  { id: '#USR0014', name: 'Lina Marlina', username: 'linamarlina', area: 'Tasikmalaya', email: 'lina.marlina@gmail.com', phone: '0812 9988 1122', joined: '10 Mar 2023', status: 'Aktif' },
  { id: '#USR0015', name: 'Rudi Hartono', username: 'rudihartono', area: 'Solo', email: 'rudi.hartono@gmail.com', phone: '0822 4455 6677', joined: '18 Mar 2023', status: 'Nonaktif' }
])

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
  { accessorKey: 'name', header: 'Sales Agent' },
  { accessorKey: 'area', header: 'Area' },
  { accessorKey: 'email', header: 'Kontak' },
  { accessorKey: 'status', header: 'Status' },
  { id: 'aksi', header: 'Action', enableSorting: false },
  // Virtual columns for sub-data visibility toggles
  { accessorKey: 'id', header: 'ID Sales', meta: { isVirtual: true } },
  { accessorKey: 'phone', header: 'Nomor Telepon', meta: { isVirtual: true } }
]

const table = useVueTable({
  get data() { return filteredSales.value },
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
  getRowId: (row) => row.id,
  initialState: { pagination: { pageSize: 10 } }
})

// Helpers
const getInitial = (name: string) => name?.charAt(0).toUpperCase() || '?'

const toggleStatus = (item: Sales) => {
  item.status = item.status === 'Aktif' ? 'Nonaktif' : 'Aktif'
}

const openDropdownId = ref<string | null>(null)
const dropdownPosition = ref({ top: 0, left: 0 })

const toggleDropdown = (event: MouseEvent, id: string) => {
  if (openDropdownId.value === id) {
    openDropdownId.value = null
  } else {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    dropdownPosition.value = { 
      top: rect.bottom + 8,
      left: rect.right - 224
    }
    openDropdownId.value = id
  }
}

const handleScroll = () => {
  if (openDropdownId.value) openDropdownId.value = null
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.action-menu')) {
    openDropdownId.value = null
  }
  if (!target.closest('.settings-menu') && !target.closest('.btn-settings-trigger')) {
    showSettings.value = false
  }
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

const getMetadata = () => {
  const adminName = localStorage.getItem('nama_display') || 'Administrator'
  const date = new Date().toLocaleString('id-ID', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
  return { adminName, date }
}

const exportToExcel = () => {
  const { headers, rows } = getExportData()
  const { adminName, date } = getMetadata()
  if (rows.length === 0) return fail('Tidak ada data untuk diekspor')

  const wsData = [
    ['DATA SALES AGENT'],
    [`Dicetak pada: ${date}`],
    [`Dicetak oleh: ${adminName}`],
    [],
    headers,
    ...rows
  ]

  const ws = XLSX.utils.aoa_to_sheet(wsData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data')

  XLSX.writeFile(wb, `sales_export_${new Date().toISOString().split('T')[0]}.xlsx`)
  success('Excel berhasil diunduh')
}

const exportToPDF = () => {
  const { headers, rows } = getExportData()
  const { adminName, date } = getMetadata()
  if (rows.length === 0) return fail('Tidak ada data untuk diekspor')

  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(18)
  doc.text('DATA SALES AGENT', 14, 20)
  
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`Dicetak pada: ${date}`, 14, 28)
  doc.text(`Dicetak oleh: ${adminName}`, 14, 33)
  
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 40,
    theme: 'striped',
    headStyles: { fillColor: [249, 115, 22], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    columnStyles: { 0: { cellWidth: 10 } } // No column width
  })

  doc.save(`sales_export_${new Date().toISOString().split('T')[0]}.pdf`)
  success('PDF berhasil diunduh')
}

const printData = () => {
  const { headers, rows } = getExportData()
  const { adminName, date } = getMetadata()
  if (rows.length === 0) return fail('Tidak ada data untuk dicetak')

  const printWindow = window.open('', '_blank')
  if (!printWindow) return fail('Gagal membuka jendela cetak')

  const html = `
    <html>
      <head>
        <title>Cetak Data Sales Agent</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
          .header { margin-bottom: 30px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: 900; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: -0.025em; }
          .meta { font-size: 11px; color: #64748b; margin-top: 8px; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #f97316; color: white; text-align: left; padding: 12px 15px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; }
          td { padding: 12px 15px; border-bottom: 1px solid #f1f5f9; font-size: 11px; font-weight: 500; }
          tr:nth-child(even) { background: #f8fafc; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">Data Sales Agent</h1>
          <div class="meta">Dicetak pada: ${date}</div>
          <div class="meta">Dicetak oleh: ${adminName}</div>
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

const getColumns = () => {
  return table.getAllColumns().filter(c => c.getCanHide()).map(c => ({
    id: c.id,
    label: c.columnDef.header as string,
    isVisible: c.getIsVisible()
  }))
}

const fetchData = () => {
  // Sementara mock data
}

const handleDelete = async (sales: Sales) => {
  confirm(`Ingin menghapus data sales milik ${sales.name}?`, async () => {
    // API logic here
    success('Hapus data sales berhasil')
    emit('success')
  })
}

const handleBatchDelete = async () => {
  const selectedRows = table.getSelectedRowModel().rows
  if (selectedRows.length === 0) return
  confirm(`Apakah Anda yakin ingin menghapus ${selectedRows.length} sales terpilih secara permanen?`, async () => {
    success(`Berhasil menghapus ${selectedRows.length} data sales`)
    table.resetRowSelection()
    emit('success')
  })
}

defineExpose({ fetchData, exportToExcel, exportToPDF, printData, updateVisibility, getColumns })

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
})
</script>

<template>
    <div class="max-h-[600px] overflow-auto relative scrollbar-hide border-b border-slate-100">
      <!-- Batch Actions -->
      <div v-if="table.getSelectedRowModel().rows.length > 0" class="sticky top-0 z-[110] flex items-center px-6 py-3 bg-white/95 backdrop-blur-md border-b border-bejo-100 gap-4 animate-in slide-in-from-top duration-300">
        <div class="flex items-center gap-2 px-3 py-1.5 bg-bejo-50 rounded-lg border border-bejo-100">
          <Icon icon="lucide:check-square" class="size-4 text-bejo-600" />
          <span class="text-[11px] font-black text-bejo-900 uppercase tracking-wider">{{ table.getSelectedRowModel().rows.length }} Sales Terpilih</span>
        </div>
        
        <div class="h-4 w-px bg-slate-200"></div>

        <div class="flex items-center gap-2">
          <button @click="handleBatchDelete" class="btn-batch bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border-red-100">
            <Icon icon="lucide:trash-2" class="size-3.5" />
            Hapus
          </button>
        </div>

        <button @click="table.resetRowSelection()" class="ml-auto flex items-center gap-2 px-4 py-2 text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-all">
          Batal Pilih
        </button>
      </div>

      <table class="min-w-full divide-y divide-slate-100">
        <thead class="sticky top-0 z-[100] bg-white/95 backdrop-blur-md shadow-sm">
          <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id" class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <th v-for="header in headerGroup.headers.filter(h => !(h.column.columnDef.meta as any)?.isVirtual)" :key="header.id" 
                class="px-6 py-5 text-start"
                :class="{ 'w-10': header.id === 'select' }">
              <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-50">
          <tr v-for="row in table.getRowModel().rows" :key="row.id" class="hover:bg-slate-50/50 transition-all duration-300 group">
            <td v-if="table.getColumn('select')" class="px-6 py-5">
              <FlexRender :render="table.getColumn('select').columnDef.cell" :props="row.getVisibleCells().find(c => c.column.id === 'select')?.getContext()" />
            </td>
            <td v-if="table.getColumn('name')?.getIsVisible()" class="px-6 py-5">
              <div class="flex items-center gap-4">
                <div class="size-12 rounded-2xl bg-gradient-to-br from-bejo-500 to-bejo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-bejo-500/20 group-hover:scale-110 transition-transform duration-500">
                  {{ getInitial(row.original.name) }}
                </div>
                <div class="flex flex-col gap-0.5">
                  <span class="font-black text-slate-900 tracking-tight group-hover:text-bejo-600 transition-colors">{{ row.original.name }}</span>
                  <div class="flex items-center gap-2">
                    <span v-if="table.getColumn('id').getIsVisible()" class="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">ID: {{ row.original.id }}</span>
                    <span class="text-[10px] bg-bejo-50 text-bejo-600 px-1.5 py-0.5 rounded font-black uppercase tracking-wider border border-bejo-100">@{{ row.original.username }}</span>
                  </div>
                </div>
              </div>
            </td>

            <td v-if="table.getColumn('area')?.getIsVisible()" class="px-6 py-5">
              <div class="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-widest">
                <Icon icon="lucide:map-pin" class="size-3.5 text-bejo-500" />
                {{ row.original.area }}
              </div>
            </td>

            <td v-if="table.getColumn('email')?.getIsVisible()" class="px-6 py-5">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2 text-slate-600 font-bold text-sm">
                  <Icon icon="lucide:mail" class="size-3.5 text-slate-400" />
                  {{ row.original.email }}
                </div>
                <div v-if="row.original.phone && table.getColumn('phone').getIsVisible()" class="flex items-center gap-2 text-slate-500 font-bold text-[11px]">
                  <Icon icon="lucide:phone" class="size-3.5 text-slate-300" />
                  {{ row.original.phone }}
                </div>
              </div>
            </td>

            <td v-if="table.getColumn('status')?.getIsVisible()" class="px-6 py-5">
              <div class="flex items-center gap-3">
                <div 
                  class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border"
                  :class="row.original.status === 'Aktif' ? 'bg-bejo-50 text-bejo-600 border-bejo-100 shadow-sm shadow-bejo-500/10' : 'bg-slate-50 text-slate-400 border-slate-100'"
                >
                  {{ row.original.status === 'Aktif' ? 'Aktif' : 'Nonaktif' }}
                </div>
                <button 
                  @click="toggleStatus(row.original)"
                  class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 focus:outline-none"
                  :class="row.original.status === 'Aktif' ? 'bg-bejo-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-slate-200'"
                >
                  <span class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition duration-300 ease-in-out" :class="row.original.status === 'Aktif' ? 'translate-x-4' : 'translate-x-0'"></span>
                </button>
              </div>
            </td>

            <td class="px-6 py-5 relative action-menu">
              <button @click.stop="toggleDropdown($event, row.original.id)" class="size-10 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200">
                <Icon icon="lucide:more-vertical" class="size-5" />
              </button>
              <Teleport to="body">
                <Transition 
                  enter-active-class="transition duration-100 ease-out" 
                  enter-from-class="transform scale-95 opacity-0 -translate-y-2" 
                  enter-to-class="transform scale-100 opacity-100 translate-y-0" 
                  leave-active-class="transition duration-75 ease-in" 
                  leave-from-class="transform scale-100 opacity-100 translate-y-0" 
                  leave-to-class="transform scale-95 opacity-0 -translate-y-2"
                >
                  <div v-if="openDropdownId === row.original.id" 
                    class="fixed w-56 bg-white shadow-2xl border border-slate-100 rounded-2xl p-2 z-[999] origin-top-right"
                    :style="{ 
                      top: `${dropdownPosition.top}px`, 
                      left: `${dropdownPosition.left}px` 
                    }"
                  >
                    <button @click="emit('edit', row.original); openDropdownId = null" class="dropdown-item w-full group/item">
                      <div class="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:bg-bejo-500 group-hover/item:text-white transition-all">
                        <Icon icon="lucide:pencil" class="size-4" /> 
                      </div>
                      <span class="group-hover/item:text-slate-900 transition-colors">Edit Data</span>
                    </button>
                    <div class="my-1.5 border-t border-slate-50/50 mx-2"></div>
                    <button @click="handleDelete(row.original); openDropdownId = null" class="dropdown-item w-full group/item text-red-500 hover:bg-red-50">
                      <div class="size-8 rounded-lg bg-red-50 flex items-center justify-center text-red-400 group-hover/item:bg-red-500 group-hover/item:text-white transition-all">
                        <Icon icon="lucide:trash-2" class="size-4" /> 
                      </div>
                      <span class="font-black">Hapus</span>
                    </button>
                  </div>
                </Transition>
              </Teleport>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="px-6 py-5 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Menampilkan 
          <span class="text-slate-900 font-black">{{ table.getRowModel().rows.length }}</span> 
          dari 
          <span class="text-slate-900 font-black">{{ salesList.length }}</span> 
          Sales
        </div>

        <div class="flex items-center gap-2">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menampilkan:</span>
          <select 
            :value="table.getState().pagination.pageSize" 
            @change="e => {
              const val = (e.target as HTMLSelectElement).value
              table.setPageSize(val === 'all' ? salesList.length : Number(val))
            }"
            class="h-8 min-w-[70px] px-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg outline-none cursor-pointer hover:border-bejo-500 transition-all shadow-sm"
          >
            <option v-for="size in [10, 25, 50, 100]" :key="size" :value="size">{{ size }}</option>
            <option value="all">Semua</option>
          </select>
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button @click="table.previousPage()" :disabled="!table.getCanPreviousPage()" class="btn-pagination">
          <Icon icon="lucide:chevron-left" class="size-4" />
        </button>
        <div class="flex items-center gap-1">
          <button v-for="n in table.getPageCount()" :key="n" @click="table.setPageIndex(n - 1)" class="btn-pagination-num" :class="table.getState().pagination.pageIndex === n - 1 ? 'active' : ''">
            {{ n }}
          </button>
        </div>
        <button @click="table.nextPage()" :disabled="!table.getCanNextPage()" class="btn-pagination">
          <Icon icon="lucide:chevron-right" class="size-4" />
        </button>
      </div>
    </div>
</template>

<style scoped>
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
  @apply h-8 px-3 rounded-lg border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-sm;
}
</style>
