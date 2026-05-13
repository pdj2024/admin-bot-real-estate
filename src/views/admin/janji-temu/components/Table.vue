<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useVueTable, FlexRender, getCoreRowModel, getPaginationRowModel } from '@tanstack/vue-table'
import { confirm, success, fail } from '@/utils/sweet-alert'
import api from '@/services/axios'

const props = defineProps<{
  appointments: any[]
  isLoading: boolean
}>()

const emit = defineEmits(['refresh'])

const handleUpdateStatus = async (item: any, newStatus: string) => {
  confirm(`Ubah status progress menjadi ${newStatus}?`, async () => {
    try {
      const payload = { ...item, Status_Progress: newStatus }
      await api.put(`/api/janjiTemu/update?no_id=${item.No_Id}`, payload, {
        headers: { 'X-Jenis-User': 'admin' }
      })
      success('Status berhasil diperbarui')
      emit('refresh')
    } catch {
      fail('Gagal memperbarui status')
    }
  })
}

const columns = [
  { accessorKey: 'No_Tracking', header: 'No. Tracking' },
  { accessorKey: 'Id_Customer', header: 'Calon Pembeli' },
  { accessorKey: 'Id_Produk', header: 'Produk' },
  { accessorKey: 'Tanggal_Janji', header: 'Rencana Kunjungan' },
  { accessorKey: 'Status_Progress', header: 'Status' },
  { id: 'aksi', header: 'Aksi' }
]

const table = useVueTable({
  get data() {
    return props.appointments
  },
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: { pagination: { pageSize: 5 } }
})

const isExportOpen = ref(false)

const exportToExcel = async () => {
  const { utils, writeFile } = await import('xlsx')
  
  const dataToExport = props.appointments.map(item => ({
    'ID': item.No_Id,
    'Tracking': item.No_Tracking,
    'Customer': item.Id_Customer,
    'Admin': item.Id_Admin,
    'Produk': item.Id_Produk,
    'Tipe': item.Tipe_Pertemuan,
    'Tanggal': item.Tanggal_Janji,
    'Waktu': item.Waktu_Janji,
    'Lokasi': item.Lokasi_Pertemuan,
    'Status': item.Status_Progress
  }))

  const worksheet = utils.json_to_sheet(dataToExport)
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, 'Appointments')
  
  writeFile(workbook, `Janji-Temu-${new Date().toISOString().split('T')[0]}.xlsx`)
  isExportOpen.value = false
}

const exportToPDF = async () => {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  
  const doc = new jsPDF()
  
  doc.setFontSize(18)
  doc.text('Laporan Permintaan Janji Temu', 14, 22)
  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 30)

  const tableData = props.appointments.map(item => [
    item.No_Id,
    item.Id_Customer,
    item.Id_Produk,
    `${item.Tanggal_Janji.split('T')[0]} ${item.Waktu_Janji}`,
    item.Status_Progress,
    item.Tipe_Pertemuan
  ])

  const primaryColorHex = getComputedStyle(document.documentElement).getPropertyValue('--color-bejo-500').trim() || '#ca6d2c'
  
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [202, 109, 44]
  }

  autoTable(doc, {
    startY: 35,
    head: [['ID', 'Customer', 'Product', 'Schedule', 'Status', 'Type']],
    body: tableData,
    headStyles: { fillColor: hexToRgb(primaryColorHex) }, 
    theme: 'grid'
  })

  doc.save(`Janji-Temu-${new Date().toISOString().split('T')[0]}.pdf`)
  isExportOpen.value = false
}

if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.export-container')) {
      isExportOpen.value = false
    }
  })
}
</script>

<template>
  <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
    <div class="p-8 border-b border-slate-50 flex items-center justify-between">
       <div>
          <h4 class="text-lg font-black text-slate-900">Permintaan Janji Temu</h4>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Antrean Website & WhatsApp Bot</p>
       </div>
       
       <div class="relative export-container">
          <button 
            @click="isExportOpen = !isExportOpen"
            class="px-6 py-2.5 bg-bejo-500 hover:bg-bejo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-bejo-500/20 active:scale-95 flex items-center gap-2"
          >
            Export Data
            <Icon icon="lucide:chevron-down" class="size-4 transition-transform" :class="{ 'rotate-180': isExportOpen }" />
          </button>
          
          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <div v-show="isExportOpen" class="absolute right-0 top-full mt-2 z-50 min-w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 animate-in slide-in-from-top-2 duration-200">
              <button 
                @click="exportToExcel"
                class="w-full text-left rounded-xl p-3 hover:bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest transition-colors flex items-center gap-3"
              >
                <div class="size-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Icon icon="lucide:file-spreadsheet" class="size-4" />
                </div>
                Excel (.xlsx)
              </button>
              
              <button 
                @click="exportToPDF"
                class="w-full text-left rounded-xl p-3 hover:bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest transition-colors flex items-center gap-3"
              >
                <div class="size-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                  <Icon icon="lucide:file-text" class="size-4" />
                </div>
                PDF Document
              </button>
            </div>
          </Transition>
       </div>
    </div>

    <div v-if="props.isLoading" class="p-20 flex flex-col items-center justify-center gap-4 text-slate-400">
       <Icon icon="lucide:loader-2" class="size-10 animate-spin" />
       <p class="text-xs font-black uppercase tracking-widest">Memuat Data...</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead class="bg-slate-50/50">
          <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <th v-for="header in headerGroup.headers" :key="header.id" class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-50">
          <tr v-for="row in table.getRowModel().rows" :key="row.id" class="hover:bg-slate-50/30 transition-colors group">
            <!-- Tracking -->
            <td class="px-8 py-6">
              <span class="text-[10px] font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">#{{ row.original.No_Tracking }}</span>
            </td>

            <!-- Customer -->
            <td class="px-8 py-6">
              <div class="flex items-center gap-4">
                <div class="size-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-lg">
                  {{ row.original.Id_Customer.charAt(0) }}
                </div>
                <div>
                  <div class="text-sm font-black text-slate-900">{{ row.original.Id_Customer }}</div>
                  <div class="text-[10px] font-bold text-slate-500">ID Customer</div>
                </div>
              </div>
            </td>

            <!-- Product -->
            <td class="px-8 py-6">
               <div class="text-sm font-black text-slate-700">{{ row.original.Id_Produk }}</div>
               <span class="px-2 py-0.5 bg-bejo-50 text-[9px] font-black text-bejo-600 rounded uppercase tracking-tighter capitalize">{{ row.original.Tipe_Pertemuan }}</span>
            </td>

            <!-- Date/Time -->
            <td class="px-8 py-6">
               <div class="flex items-center gap-2 text-slate-900">
                  <Icon icon="lucide:calendar" class="size-4 text-bejo-500" />
                  <span class="text-sm font-bold">{{ row.original.Tanggal_Janji.split('T')[0] }}</span>
               </div>
               <div class="flex items-center gap-2 text-slate-400 mt-1">
                  <Icon icon="lucide:clock" class="size-3.5" />
                  <span class="text-xs font-medium">{{ row.original.Waktu_Janji }} WIB</span>
               </div>
            </td>

            <!-- Status -->
            <td class="px-8 py-6">
               <span 
                class="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5"
                :class="{
                  'bg-bejo-50 text-bejo-700': row.original.Status_Progress === 'baru',
                  'bg-emerald-100 text-emerald-700': row.original.Status_Progress === 'selesai',
                  'bg-red-100 text-red-700': row.original.Status_Progress === 'batal',
                  'bg-blue-100 text-blue-700': row.original.Status_Progress === 'proses',
                  'bg-violet-100 text-violet-700': row.original.Status_Progress === 'dikonfirmasi',
                }"
               >
                  <div class="size-1.5 rounded-full" :class="{
                    'bg-bejo-500': row.original.Status_Progress === 'baru',
                    'bg-emerald-500': row.original.Status_Progress === 'selesai',
                    'bg-red-500': row.original.Status_Progress === 'batal',
                    'bg-blue-500': row.original.Status_Progress === 'proses',
                    'bg-violet-500': row.original.Status_Progress === 'dikonfirmasi',
                  }"></div>
                  {{ row.original.Status_Progress }}
               </span>
            </td>

            <!-- Aksi -->
            <td class="px-8 py-6">
               <div v-if="row.original.Status_Progress === 'baru'" class="flex items-center gap-2">
                  <button @click="handleUpdateStatus(row.original, 'dikonfirmasi')" class="size-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all group-hover:bg-white shadow-sm">
                     <Icon icon="lucide:check-circle" class="size-5" />
                  </button>
                  <button @click="handleUpdateStatus(row.original, 'batal')" class="size-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-all group-hover:bg-white shadow-sm">
                     <Icon icon="lucide:x-circle" class="size-5" />
                  </button>
               </div>
               <div v-else class="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
                  No Actions
               </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
       <span class="text-xs font-bold text-slate-400">Total <span class="text-slate-900">{{ props.appointments.length }}</span> Janji Temu</span>
       <div class="flex items-center gap-2">
          <button @click="table.previousPage()" :disabled="!table.getCanPreviousPage()" class="size-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all disabled:opacity-50">
             <Icon icon="lucide:chevron-left" class="size-4" />
          </button>
          <div class="px-4 text-xs font-black text-slate-900">
            {{ table.getState().pagination.pageIndex + 1 }} / {{ table.getPageCount() }}
          </div>
          <button @click="table.nextPage()" :disabled="!table.getCanNextPage()" class="size-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all disabled:opacity-50">
             <Icon icon="lucide:chevron-right" class="size-4" />
          </button>
       </div>
    </div>
  </div>
</template>
