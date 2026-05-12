<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, h, computed } from 'vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'
import { useVueTable, FlexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, type VisibilityState } from '@tanstack/vue-table'
import { confirm, success, fail } from '@/utils/sweet-alert'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

interface Customer {
  No_Id: string
  UserName: string
  Nama_Display: string
  Email: string
  Telepon: number
  Kota: string
  Status: string
  Status_Broadcast?: string
  Pernah_Order?: boolean
  Saves?: string[]
  Likes?: string[]
  Device_Token?: string[]
  Tgl_Created?: Date
  Tgl_Nonaktif?: Date | null
  Jumlah_Saves?: number
  Jumlah_Likes?: number
  Id_Media?: string
}

const customers = ref<Customer[]>([])
const isLoading = ref(false)
const rowSelection = ref<Record<string, boolean>>({})
const columnVisibility = ref<VisibilityState>({
  Nama_Display: true,
  Email: true,
  Kota: true,
  Status: true,
  Status_Broadcast: true,
  aksi: true
})
const showSettings = ref(false)

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

const filteredCustomers = computed(() => {
  let result = customers.value
  if (props.statusFilter) {
    result = result.filter(c => c.Status === props.statusFilter)
  }
  return result
})

const emit = defineEmits(['edit', 'success'])

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
  { accessorKey: 'Nama_Display', header: 'Nama' },
  { accessorKey: 'Email', header: 'Kontak' },
  { accessorKey: 'Kota', header: 'Lokasi' },
  { accessorKey: 'Status', header: 'Status' },
  { accessorKey: 'Status_Broadcast', header: 'Broadcast' },
  { id: 'aksi', header: 'Action', enableSorting: false },
  // Virtual columns for sub-data visibility toggles
  { accessorKey: 'No_Id', header: 'ID Pelanggan', meta: { isVirtual: true } },
  { accessorKey: 'Telepon', header: 'Nomor Telepon', meta: { isVirtual: true } }
]

// Helpers
const getInitial = (name: string) => name?.charAt(0).toUpperCase() || '?'

const fetchData = async () => {
  isLoading.value = true
  try {
    const { data } = await api.get('/api/customer/getAll?orderby=Tgl_Created', {
      headers: { 'X-Jenis-User': 'admin' }
    })
    customers.value = data.Data || []
  } catch (err) {
    console.error('Gagal memuat data:', err)
  } finally {
    isLoading.value = false
  }
}

const toggleStatus = async (item: Customer) => {
  const newStatus = item.Status === 'aktif' ? 'nonaktif' : 'aktif'
  const tglNonaktif = newStatus === 'aktif' ? null : new Date()
  
  try {
    await api.put(
      '/api/Customer/update?no_id=' + item.No_Id,
      {
        ...item,
        Status: newStatus,
        Tgl_Nonaktif: tglNonaktif,
        Id_Media: item.Id_Media || null
      },
      { headers: { 'X-Jenis-User': 'Customer' } }
    )
    item.Status = newStatus
    item.Tgl_Nonaktif = tglNonaktif
    success(`Berhasil mengubah status ${item.Nama_Display}`)
    emit('success')
  } catch (err) {
    fail(`Gagal mengubah status ${item.Nama_Display}`)
    console.log(err)
  }
}

const toggleBroadcast = async (item: Customer) => {
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
    success(`Berhasil mengubah status broadcast ${item.Nama_Display}`)
    emit('success')
  } catch (err) {
    fail(`Gagal mengubah status broadcast ${item.Nama_Display}`)
    console.log(err)
  }
}

const table = useVueTable({
  get data() { return filteredCustomers.value },
  columns,
  state: {
    get globalFilter() { return props.searchQuery },
    get rowSelection() { return rowSelection.value },
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

const selectedItems = computed(() => table.getSelectedRowModel().rows.map(r => r.original as Customer))
const showBatchActivate = computed(() => selectedItems.value.some(item => item.Status !== 'aktif'))
const showBatchDeactivate = computed(() => selectedItems.value.some(item => item.Status === 'aktif'))
const showBatchBroadcastOn = computed(() => selectedItems.value.some(item => item.Status_Broadcast !== 'aktif'))
const showBatchBroadcastOff = computed(() => selectedItems.value.some(item => item.Status_Broadcast === 'aktif'))

const handleBatchUpdate = async (type: 'Status' | 'Status_Broadcast', value: string) => {
  const selectedRows = table.getSelectedRowModel().rows
  if (selectedRows.length === 0) return

  confirm(`Apakah Anda yakin ingin mengubah ${type === 'Status' ? 'Status' : 'Broadcast'} untuk ${selectedRows.length} customer terpilih?`, async () => {
    let successCount = 0
    let failCount = 0

    for (const row of selectedRows) {
      const item = row.original
      try {
        const payload: any = { ...item, [type]: value }
        if (type === 'Status') {
          payload.Tgl_Nonaktif = value === 'aktif' ? null : new Date()
        }
        payload.Id_Media = item.Id_Media || null

        await api.put(
          '/api/Customer/update?no_id=' + item.No_Id,
          payload,
          { headers: { 'X-Jenis-User': 'Customer' } }
        )
        
        // Update local state directly
        if (type === 'Status') {
          item.Status = value
          item.Tgl_Nonaktif = value === 'aktif' ? null : new Date()
        } else {
          item.Status_Broadcast = value
        }
        
        successCount++
      } catch (err) {
        failCount++
        console.error(`Gagal update No_Id: ${item.No_Id}`, err)
      }
    }

    if (successCount > 0) success(`Berhasil mengubah ${successCount} data customer`)
    if (failCount > 0) fail(`${failCount} data gagal diubah`)
    
    table.resetRowSelection()
    emit('success')
  })
}

const handleBatchDelete = async () => {
  const selectedRows = table.getSelectedRowModel().rows
  if (selectedRows.length === 0) return

  confirm(`Apakah Anda yakin ingin menghapus ${selectedRows.length} customer terpilih secara permanen?`, async () => {
    let successCount = 0
    let failCount = 0

    for (const row of selectedRows) {
      const item = row.original
      try {
        await api.delete(`/api/Customer/delete?no_id=${item.No_Id}`, {
          headers: { 'X-Jenis-User': 'Customer' }
        })
        successCount++
      } catch (err) {
        failCount++
        console.error(`Gagal menghapus No_Id: ${item.No_Id}`, err)
      }
    }

    if (successCount > 0) success(`Berhasil menghapus ${successCount} data customer`)
    if (failCount > 0) fail(`${failCount} data gagal dihapus`)
    
    fetchData()
    table.resetRowSelection()
    emit('success')
  })
}

const getExportData = () => {
  const visibleColumns = table.getVisibleLeafColumns().filter(c => !['select', 'aksi', 'select-checkbox'].includes(c.id))
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
    ['DATA CUSTOMER'],
    [`Dicetak pada: ${date}`],
    [`Dicetak oleh: ${adminName}`],
    [],
    headers,
    ...rows
  ]

  const ws = XLSX.utils.aoa_to_sheet(wsData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data')

  XLSX.writeFile(wb, `customer_export_${new Date().toISOString().split('T')[0]}.xlsx`)
  success('Excel berhasil diunduh')
}

const exportToPDF = () => {
  const { headers, rows } = getExportData()
  const { adminName, date } = getMetadata()
  if (rows.length === 0) return fail('Tidak ada data untuk diekspor')

  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(18)
  doc.text('DATA CUSTOMER', 14, 20)
  
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

  doc.save(`customer_export_${new Date().toISOString().split('T')[0]}.pdf`)
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
        <title>Cetak Data Customer</title>
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
          <h1 class="title">Data Customer</h1>
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

const handleDelete = async (customer: Customer) => {
  confirm(`Ingin menghapus data customer milik ${customer.Nama_Display}?`, async () => {
    try {
      await api.delete(`/api/Customer/delete?no_id=${customer.No_Id}`, {
        headers: { 'X-Jenis-User': 'Customer' }
      })
      success('Hapus data customer berhasil')
      fetchData()
      emit('success')
    } catch (err: any) {
      fail(err.response?.data?.Message || 'Terjadi kesalahan pada server')
    }
  })
}

const updateVisibility = (visibility: any) => {
  columnVisibility.value = visibility
}

defineExpose({ 
  fetchData, 
  exportToExcel, 
  exportToPDF, 
  printData, 
  getColumns: () => table.getAllLeafColumns().filter(c => c.id !== 'select' && c.id !== 'aksi' && c.id !== 'select-checkbox').map(c => ({
    id: c.id,
    label: (c.columnDef as any).header as string,
    isVisible: c.getIsVisible()
  })),
  updateVisibility 
})

onMounted(() => {
  fetchData()
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
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
          <button v-if="showBatchActivate" @click="handleBatchUpdate('Status', 'aktif')" class="btn-batch bg-bejo-50 text-bejo-600 hover:bg-bejo-500 hover:text-white border-bejo-100">
            <Icon icon="lucide:check-circle" class="size-3.5" />
            Aktifkan Status
          </button>
          <button v-if="showBatchDeactivate" @click="handleBatchUpdate('Status', 'nonaktif')" class="btn-batch bg-slate-50 text-slate-500 hover:bg-slate-900 hover:text-white border-slate-100">
            <Icon icon="lucide:x-circle" class="size-3.5" />
            Nonaktifkan Status
          </button>
          <button v-if="showBatchBroadcastOn" @click="handleBatchUpdate('Status_Broadcast', 'aktif')" class="btn-batch bg-bejo-50 text-bejo-600 hover:bg-bejo-500 hover:text-white border-bejo-100">
            <Icon icon="lucide:radio" class="size-3.5" />
            Terima Broadcast
          </button>
          <button v-if="showBatchBroadcastOff" @click="handleBatchUpdate('Status_Broadcast', 'nonaktif')" class="btn-batch bg-slate-50 text-slate-500 hover:bg-slate-900 hover:text-white border-slate-100">
            <Icon icon="lucide:radio-off" class="size-3.5" />
            Stop Broadcast
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
      <!-- Background Loading Indicator (No Flicker) -->
      <div v-if="isLoading && customers.length > 0" class="absolute inset-0 z-10 bg-white/40 backdrop-blur-[1px] flex items-start justify-center pt-20 transition-all duration-300">
        <div class="bg-white px-4 py-2 rounded-2xl shadow-xl border border-bejo-100 flex items-center gap-3 animate-in fade-in zoom-in-95">
          <Icon icon="lucide:loader-2" class="animate-spin size-4 text-bejo-500" />
          <span class="text-[10px] font-black text-slate-600 uppercase tracking-widest">Sinkronisasi...</span>
        </div>
      </div>

      <div class="max-h-[600px] overflow-auto">
        <table class="min-w-full divide-y divide-slate-100 border-separate border-spacing-0">
          <thead class="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm">
            <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
              <th v-for="header in headerGroup.headers.filter(h => !(h.column.columnDef.meta as any)?.isVirtual)" :key="header.id" 
                class="py-5 text-start text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100"
                :class="header.column.id === 'select' ? 'pl-4 pr-0 w-8' : (header.column.id === 'Nama_Display' ? 'pl-3 pr-6' : 'px-6')"
              >
                <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
              </th>
            </tr>
          </thead>

        <tbody class="divide-y divide-slate-50">
          <!-- Full Page Loading (Initial only) -->
          <tr v-if="isLoading && customers.length === 0">
            <td colspan="7" class="py-24 text-center">
              <div class="flex flex-col items-center gap-3">
                <div class="size-12 rounded-2xl bg-bejo-50 flex items-center justify-center">
                  <Icon icon="lucide:loader-2" class="animate-spin size-6 text-bejo-500" />
                </div>
                <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Memuat Data Customer...</span>
              </div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-else-if="table.getRowModel().rows.length === 0">
            <td colspan="7" class="py-20 text-center">
              <div class="flex flex-col items-center gap-3 opacity-40">
                <Icon icon="lucide:users" class="size-12 text-slate-300" />
                <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Tidak ada customer ditemukan</span>
              </div>
            </td>
          </tr>

          <!-- Data Rows -->
          <tr v-else v-for="row in table.getRowModel().rows" :key="row.id" class="hover:bg-slate-50/50 transition-all duration-300 group" :class="{ 'bg-bejo-50/30': row.getIsSelected() }">
            <td class="pl-4 pr-0 py-5">
              <FlexRender v-if="table.getColumn('select')" :render="table.getColumn('select')!.columnDef.cell" :props="row.getVisibleCells().find(c => c.column.id === 'select')?.getContext()" />
            </td>

            <td v-if="table.getColumn('Nama_Display')?.getIsVisible()" class="pl-3 pr-6 py-5">
              <div class="flex items-center gap-4">
                <div class="size-12 rounded-2xl bg-gradient-to-br from-bejo-500 to-bejo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-bejo-500/20 group-hover:scale-110 transition-transform duration-500">
                  {{ getInitial(row.original.Nama_Display) }}
                </div>
                <div class="flex flex-col gap-0.5">
                  <span class="font-black text-slate-900 tracking-tight group-hover:text-bejo-600 transition-colors">{{ row.original.Nama_Display }}</span>
                  <span v-if="table.getColumn('No_Id')?.getIsVisible()" class="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase tracking-wider w-fit">ID: {{ row.original.No_Id }}</span>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">@{{ row.original.UserName }}</span>
                  </div>
                </div>
              </div>
            </td>

            <td v-if="table.getColumn('Email')?.getIsVisible()" class="px-6 py-5">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2 text-slate-600 font-bold text-sm">
                  <Icon icon="lucide:mail" class="size-3.5 text-slate-400" />
                  {{ row.original.Email }}
                </div>
                <div v-if="row.original.Telepon && table.getColumn('Telepon')?.getIsVisible()" class="flex items-center gap-2 text-slate-500 font-bold text-[11px]">
                  <Icon icon="lucide:phone" class="size-3.5 text-slate-300" />
                  {{ row.original.Telepon }}
                </div>
              </div>
            </td>

            <td v-if="table.getColumn('Kota')?.getIsVisible()" class="px-6 py-5">
              <div v-if="row.original.Kota" class="flex items-center gap-2 text-slate-600 font-bold text-xs">
                <Icon icon="lucide:map-pin" class="size-3.5 text-bejo-500" />
                {{ row.original.Kota }}
              </div>
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

            <td v-if="table.getColumn('Status_Broadcast')?.getIsVisible()" class="px-6 py-5">
              <div class="flex items-center gap-3">
                <div 
                  class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border"
                  :class="row.original.Status_Broadcast === 'aktif' ? 'bg-bejo-50 text-bejo-600 border-bejo-100 shadow-sm shadow-bejo-500/10' : 'bg-slate-50 text-slate-400 border-slate-100'"
                >
                  {{ row.original.Status_Broadcast === 'aktif' ? 'Aktif' : 'Nonaktif' }}
                </div>
                <button 
                  @click="toggleBroadcast(row.original)"
                  class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 focus:outline-none"
                  :class="row.original.Status_Broadcast === 'aktif' ? 'bg-bejo-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-slate-200'"
                >
                  <span class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition duration-300 ease-in-out" :class="row.original.Status_Broadcast === 'aktif' ? 'translate-x-4' : 'translate-x-0'"></span>
                </button>
              </div>
            </td>

            <td v-if="table.getColumn('aksi')?.getIsVisible()" class="px-6 py-5 relative action-menu">
              <button @click.stop="toggleDropdown($event, row.original.No_Id)" class="size-10 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200">
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
                  <div v-if="openDropdownId === row.original.No_Id" 
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
    </div>

    <!-- Pagination -->
    <div class="px-6 py-5 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Menampilkan 
          <span class="text-slate-900 font-black">{{ table.getRowModel().rows.length }}</span> 
          dari 
          <span class="text-slate-900 font-black">{{ customers.length }}</span> 
          Customer
        </div>

        <div class="flex items-center gap-2">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menampilkan:</span>
          <select 
            :value="table.getState().pagination.pageSize" 
            @change="e => {
              const val = (e.target as HTMLSelectElement).value
              table.setPageSize(val === 'all' ? customers.length : Number(val))
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

.dropdown-item {
  @apply flex items-center gap-3 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 rounded-xl transition-all hover:bg-slate-50;
}

.btn-batch {
  @apply flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>

<style scoped>
@reference "@/assets/css/style.css";

/* SAKLAR (TOGGLE) */
.toggle {
  @apply w-[50px] h-6 bg-gray-200 rounded-full relative transition-all duration-300 cursor-pointer outline-none border-none;
}
.toggle-active {
  @apply bg-primary;
}
.toggle-circle {
  @apply size-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform duration-300 shadow-sm;
}

/* PAGINATION BUTTONS */
.btn-nav {
  @apply size-8 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-600
         transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed;
}

/* DROPDOWN ITEM */
.dropdown-item {
  @apply flex items-center gap-2 px-3 py-2 text-xs text-gray-700 rounded transition-colors hover:bg-gray-50;
}

/* Menghindari dropdown terpotong jika table overflow */
.action-menu {
  @apply static sm:relative;
}
</style>
