<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useVueTable, FlexRender, getCoreRowModel, getPaginationRowModel } from '@tanstack/vue-table'
import { confirm, success, fail } from '@/utils/sweet-alert'
import api from '@/services/axios'

const props = defineProps<{
  appointments: any[]
  isLoading: boolean
}>()

const expandedRowId = ref<string | null>(null)
const processedAppointments = computed(() => {
  if (!props.appointments) return []

  // Ambil No_Id yang pernah dipakai sebagai Id_Janji_Lama oleh data lain
  const childIds = new Set(props.appointments.map((a) => a.Id_Janji_Lama).filter((id) => id !== null))

  // Hanya tampilkan yang No_Id nya tidak pernah dipakai sebagai Id_Janji_Lama oleh siapapun
  // (Ini berarti dia adalah item terbaru dalam chain-nya)
  return props.appointments.filter((a) => !childIds.has(a.No_Id))
})

const getTimelineChain = (current: any) => {
  if (!current) return []
  const chain: any[] = []

  // Mulai dari item ini, telusuri ke belakang (Id_Janji_Lama)
  let item = current
  const visited = new Set()

  while (item) {
    if (visited.has(item.No_Id)) break // Safety against infinite loops
    visited.add(item.No_Id)
    chain.unshift(item) // Masukkan ke depan agar urutan: lama -> baru

    if (!item.Id_Janji_Lama) break

    const parent = props.appointments.find((a) => a.No_Id === item.Id_Janji_Lama)
    if (!parent) break
    item = parent
  }

  return chain
}

const toggleTimeline = (id: string) => {
  expandedRowId.value = expandedRowId.value === id ? null : id
}

const emit = defineEmits(['refresh'])

const handleUpdateStatus = async (item: any, newStatus: string) => {
  confirm(`Ubah status progress menjadi ${newStatus}?`, async () => {
    try {
      if (newStatus === 'dikonfirmasi') {
        const adminId = localStorage.getItem('no_id') || ''
        await api.put(
          `/api/janjiTemu/confirm?no_id=${item.No_Id}`,
          { Id_Admin: adminId },
          {
            headers: { 'X-Jenis-User': 'admin' }
          }
        )
      } else {
        const payload = {
          ...item,
          Status_Progress: newStatus,
          Tanggal_Janji: null,
          Waktu_Janji: null,
          Waktu_Selesai: null
        }
        await api.put(`/api/janjiTemu/update?no_id=${item.No_Id}`, payload, {
          headers: { 'X-Jenis-User': 'admin' }
        })
      }
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
    return processedAppointments.value
  },
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: { pagination: { pageSize: 5 } }
})

const isExportOpen = ref(false)

const exportToExcel = async () => {
  const { utils, writeFile } = await import('xlsx')

  const dataToExport = props.appointments.map((item) => ({
    ID: item.No_Id,
    Tracking: item.No_Tracking,
    Customer: item.Nama_Customer || item.Id_Customer,
    Admin: item.Nama_Admin || item.Id_Admin,
    Produk: item.Nama_Produk || item.Id_Produk,
    Tipe: item.Tipe_Pertemuan,
    Tanggal: item.Tanggal_Janji,
    Waktu: item.Waktu_Janji,
    Lokasi: item.Lokasi_Pertemuan,
    Status: item.Status_Progress,
    'Riwayat (Chain)': getTimelineChain(item)
      .map((c) => `#${c.No_Tracking} [${c.Status_Progress}]`)
      .join(' -> ')
  }))

  const worksheet = utils.json_to_sheet(dataToExport)
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, 'Appointments')

  writeFile(workbook, `Janji-Temu-${new Date().toISOString().split('T')[0]}.xlsx`)
  isExportOpen.value = false
  success('Data berhasil diexport ke Excel')
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

  const tableData = props.appointments.map((item) => {
    const chain = getTimelineChain(item)
    const historyCount = chain.length > 1 ? ` (Riwayat: ${chain.length}x)` : ''
    return [item.No_Id, (item.Nama_Customer || item.Id_Customer) + historyCount, item.Nama_Produk || item.Id_Produk, `${item.Tanggal_Janji.split('T')[0]} ${item.Waktu_Janji}`, item.Status_Progress, item.Tipe_Pertemuan]
  })

  const primaryColorHex = getComputedStyle(document.documentElement).getPropertyValue('--color-bejo-500').trim() || '#ca6d2c'

  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [202, 109, 44]
  }

  autoTable(doc, {
    startY: 35,
    head: [['ID', 'Customer', 'Product', 'Schedule', 'Status', 'Type']],
    body: tableData,
    headStyles: { fillColor: hexToRgb(primaryColorHex) },
    theme: 'grid',
    styles: { fontSize: 8 }
  })

  // Add Timeline Details if any
  const appsWithHistory = props.appointments.filter((a) => a.Id_Janji_Lama)
  if (appsWithHistory.length > 0) {
    doc.addPage()
    doc.setFontSize(14)
    doc.text('Detil Riwayat Janji Temu (Timeline)', 14, 20)

    let currentY = 30
    appsWithHistory.forEach((app) => {
      const chain = getTimelineChain(app)
      // Only process the latest one in the chain to avoid duplicates in the PDF list
      if (app.No_Id !== chain[chain.length - 1].No_Id) return

      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(`Alur Janji: ${app.Nama_Customer} - ${app.Nama_Produk}`, 14, currentY)
      currentY += 7

      chain.forEach((c, idx) => {
        const dateStr = `${c.Tanggal_Janji.split('T')[0]} ${c.Waktu_Janji}`
        const statusStr = c.Status_Progress.toUpperCase()
        const bullet = idx === chain.length - 1 ? '●' : '○'

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.text(`${bullet} ${dateStr} [${statusStr}] - Tracking: #${c.No_Tracking}`, 20, currentY)
        currentY += 5
        if (c.Alasan_Batal) {
          doc.setFont('helvetica', 'italic')
          doc.text(`   Alasan: ${c.Alasan_Batal}`, 20, currentY)
          currentY += 5
        }
      })
      currentY += 10

      if (currentY > 270) {
        doc.addPage()
        currentY = 20
      }
    })
  }

  doc.save(`Janji-Temu-${new Date().toISOString().split('T')[0]}.pdf`)
  isExportOpen.value = false
  success('Data berhasil diexport ke PDF')
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
        <button @click="isExportOpen = !isExportOpen" class="px-6 py-2.5 bg-bejo-500 hover:bg-bejo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-bejo-500/20 active:scale-95 flex items-center gap-2">
          Export Data
          <Icon icon="lucide:chevron-down" class="size-4 transition-transform" :class="{ 'rotate-180': isExportOpen }" />
        </button>

        <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
          <div v-show="isExportOpen" class="absolute right-0 top-full mt-2 z-50 min-w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 animate-in slide-in-from-top-2 duration-200">
            <button @click="exportToExcel" class="w-full text-left rounded-xl p-3 hover:bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest transition-colors flex items-center gap-3">
              <div class="size-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Icon icon="lucide:file-spreadsheet" class="size-4" />
              </div>
              Excel (.xlsx)
            </button>

            <button @click="exportToPDF" class="w-full text-left rounded-xl p-3 hover:bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest transition-colors flex items-center gap-3">
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
            <th v-for="header in headerGroup.headers" :key="header.id" class="px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-50">
          <template v-for="row in table.getRowModel().rows" :key="row.id">
            <tr
              class="hover:bg-slate-50/30 transition-colors group"
              :class="{
                'bg-bejo-50/50': expandedRowId === row.original.No_Id,
                'cursor-pointer': row.original.Id_Janji_Lama
              }"
              @click="row.original.Id_Janji_Lama ? toggleTimeline(row.original.No_Id) : null"
            >
              <!-- Tracking -->
              <td class="px-8 py-6">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">#{{ row.original.No_Tracking }}</span>
                  <Icon v-if="row.original.Id_Janji_Lama" icon="lucide:clipboard-list" class="size-4 text-bejo-500" />
                </div>
              </td>

              <!-- Customer -->
              <td class="px-8 py-6">
                <div class="flex items-center gap-4">
                  <div class="size-10 rounded-xl bg-bejo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {{ row.original.Id_Customer.charAt(0) }}
                  </div>
                  <div>
                    <div class="text-base font-bold text-slate-900">{{ row.original.Nama_Customer || row.original.Id_Customer }}</div>
                    <div class="text-xs font-medium text-slate-500 mt-0.5">{{ row.original.Id_Customer }}</div>
                  </div>
                </div>
              </td>

              <!-- Product -->
              <td class="px-8 py-6">
                <div class="text-base font-bold text-slate-800">{{ row.original.Nama_Produk || row.original.Id_Produk }}</div>
                <div class="flex items-center gap-2 mt-0.5">
                  <span class="text-xs font-medium text-slate-500 uppercase tracking-tight">{{ row.original.Id_Produk }}</span>
                  <span class="px-2 py-0.5 bg-bejo-50 text-xs font-bold text-bejo-600 rounded uppercase tracking-wider capitalize">{{ row.original.Tipe_Pertemuan }}</span>
                </div>
              </td>

              <!-- Date/Time -->
              <td class="px-8 py-6">
                <div class="flex items-center gap-2 text-slate-900">
                  <Icon icon="lucide:calendar" class="size-4 text-bejo-500" />
                  <span class="text-base font-bold">{{ row.original.Tanggal_Janji.split('T')[0] }}</span>
                </div>
                <div class="flex items-center gap-2 text-slate-500 mt-1">
                  <Icon icon="lucide:clock" class="size-4" />
                  <span class="text-sm font-medium">{{ row.original.Waktu_Janji }} WIB</span>
                </div>
              </td>

              <!-- Status -->
              <td class="px-8 py-6">
                <span
                  class="px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 font-mono"
                  :class="{
                    'bg-blue-50 text-blue-700': row.original.Status_Progress === 'baru',
                    'bg-bejo-50 text-bejo-700': row.original.Status_Progress === 'dikonfirmasi',
                    'bg-amber-100 text-amber-900': row.original.Status_Progress === 'proses',
                    'bg-emerald-50 text-emerald-800': row.original.Status_Progress === 'selesai',
                    'bg-red-50 text-red-700': row.original.Status_Progress === 'batal'
                  }"
                >
                  <div
                    class="size-2 rounded-full shrink-0"
                    :class="{
                      'bg-blue-500': row.original.Status_Progress === 'baru',
                      'bg-bejo-500': row.original.Status_Progress === 'dikonfirmasi',
                      'bg-amber-800': row.original.Status_Progress === 'proses',
                      'bg-emerald-600': row.original.Status_Progress === 'selesai',
                      'bg-red-500': row.original.Status_Progress === 'batal'
                    }"
                  ></div>
                  {{ row.original.Status_Progress }}
                </span>
                <div v-if="row.original.Status_Progress === 'batal' && row.original.Alasan_Batal" class="mt-1.5 text-xs font-medium text-red-500 leading-snug max-w-[160px]">Ket: {{ row.original.Alasan_Batal }}</div>
              </td>

              <!-- Aksi -->
              <td class="px-8 py-6">
                <div v-if="row.original.Status_Progress === 'baru'" class="flex items-center gap-2">
                  <button @click.stop="handleUpdateStatus(row.original, 'dikonfirmasi')" class="size-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-white transition-all shadow-sm" title="Konfirmasi">
                    <Icon icon="lucide:check-circle" class="size-5" />
                  </button>
                  <button @click.stop="handleUpdateStatus(row.original, 'batal')" class="size-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-white transition-all shadow-sm" title="Batal">
                    <Icon icon="lucide:x-circle" class="size-5" />
                  </button>
                </div>
                <div v-else class="flex items-center gap-2">
                  <div class="text-xs font-medium text-slate-400 italic">No Actions</div>
                  <Icon v-if="row.original.Id_Janji_Lama" icon="lucide:chevron-down" class="size-4 text-slate-400 transition-transform duration-300" :class="{ 'rotate-180': expandedRowId === row.original.No_Id }" />
                </div>
              </td>
            </tr>

            <!-- Timeline Expansion -->
            <tr v-if="expandedRowId === row.original.No_Id">
              <td colspan="6" class="px-8 py-6 bg-slate-50/80 border-b border-slate-100">
                <div class="max-w-full overflow-hidden">
                  <div class="flex items-center gap-3 mb-6 pl-2">
                    <div class="size-10 rounded-2xl bg-bejo-100 flex items-center justify-center text-bejo-600 shrink-0 shadow-sm">
                      <Icon icon="lucide:git-pull-request" class="size-5" />
                    </div>
                    <div>
                      <h5 class="text-base font-bold text-slate-900 tracking-wide">Riwayat & Timeline Janji Temu</h5>
                      <p class="text-xs font-medium text-slate-500 mt-0.5">Melacak perubahan jadwal dari awal hingga akhir</p>
                    </div>
                  </div>

                  <!-- Timeline Horizontal Scrollable -->
                  <div class="overflow-x-auto custom-scrollbar pb-6 pt-2 pl-2">
                    <div class="flex items-stretch gap-6 relative min-w-max py-2">
                      <!-- Horizontal Center Line -->
                      <div class="absolute top-1/2 left-4 right-4 h-1 bg-gradient-to-r from-bejo-500 via-slate-200 to-slate-200 -translate-y-1/2 z-0"></div>

                      <div v-for="(item, idx) in getTimelineChain(row.original)" :key="item.No_Id" class="w-[260px] shrink-0 grid relative z-10 group/item" style="grid-template-rows: 1fr 32px 1fr">
                        <!-- Top Slot (Row 1) -->
                        <div class="flex flex-col justify-end pb-3">
                          <div v-if="idx % 2 === 0" class="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/40 transition-all duration-300 group-hover/item:shadow-xl group-hover/item:border-bejo-200">
                            <div class="flex items-center justify-between gap-2 mb-2.5">
                              <span class="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 font-mono">#{{ item.No_Tracking }}</span>
                              <span
                                class="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider font-mono"
                                :class="{
                                  'bg-blue-50 text-blue-700': item.Status_Progress === 'baru',
                                  'bg-bejo-50 text-bejo-700': item.Status_Progress === 'dikonfirmasi',
                                  'bg-amber-100 text-amber-900': item.Status_Progress === 'proses',
                                  'bg-emerald-50 text-emerald-800': item.Status_Progress === 'selesai',
                                  'bg-red-50 text-red-700': item.Status_Progress === 'batal'
                                }"
                              >
                                {{ item.Status_Progress }}
                              </span>
                            </div>

                            <div class="flex flex-col gap-1.5 text-xs font-medium text-slate-600">
                              <div class="flex items-center gap-2">
                                <Icon icon="lucide:calendar" class="size-3.5 text-slate-400 shrink-0" />
                                <span>{{ item.Tanggal_Janji.split('T')[0] }}</span>
                              </div>
                              <div class="flex items-center gap-2">
                                <Icon icon="lucide:clock" class="size-3.5 text-slate-400 shrink-0" />
                                <span>{{ item.Waktu_Janji }} WIB</span>
                              </div>
                            </div>

                            <div v-if="item.Alasan_Batal" class="flex items-start gap-2 bg-red-50/60 p-2.5 rounded-xl border border-red-100 mt-2.5">
                              <Icon icon="lucide:info" class="size-3.5 text-red-500 mt-0.5 shrink-0" />
                              <p class="text-xs font-medium text-red-600 leading-snug">"{{ item.Alasan_Batal }}"</p>
                            </div>

                            <div v-if="item.No_Id === row.original.No_Id" class="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                              <div class="size-2 rounded-full bg-bejo-500 animate-pulse shrink-0"></div>
                              <span class="text-xs font-bold text-bejo-600">Janji temu saat ini</span>
                            </div>
                          </div>
                        </div>

                        <!-- Center Dot / Pin (Row 2) -->
                        <div class="flex items-center justify-center relative">
                          <div class="relative size-5 rounded-full border-4 border-white shadow-md z-20 transition-all duration-300" :class="item.No_Id === row.original.No_Id ? 'bg-bejo-500 ring-4 ring-bejo-100 scale-125' : 'bg-slate-300 group-hover/item:bg-slate-400 group-hover/item:scale-110'"></div>
                        </div>

                        <!-- Bottom Slot (Row 3) -->
                        <div class="flex flex-col justify-start pt-3">
                          <div v-if="idx % 2 === 1" class="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/40 transition-all duration-300 group-hover/item:shadow-xl group-hover/item:border-bejo-200">
                            <div class="flex items-center justify-between gap-2 mb-2.5">
                              <span class="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 font-mono">#{{ item.No_Tracking }}</span>
                              <span
                                class="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider font-mono"
                                :class="{
                                  'bg-blue-50 text-blue-700': item.Status_Progress === 'baru',
                                  'bg-bejo-50 text-bejo-700': item.Status_Progress === 'dikonfirmasi',
                                  'bg-amber-100 text-amber-900': item.Status_Progress === 'proses',
                                  'bg-emerald-50 text-emerald-800': item.Status_Progress === 'selesai',
                                  'bg-red-50 text-red-700': item.Status_Progress === 'batal'
                                }"
                              >
                                {{ item.Status_Progress }}
                              </span>
                            </div>

                            <div class="flex flex-col gap-1.5 text-xs font-medium text-slate-600">
                              <div class="flex items-center gap-2">
                                <Icon icon="lucide:calendar" class="size-3.5 text-slate-400 shrink-0" />
                                <span>{{ item.Tanggal_Janji.split('T')[0] }}</span>
                              </div>
                              <div class="flex items-center gap-2">
                                <Icon icon="lucide:clock" class="size-3.5 text-slate-400 shrink-0" />
                                <span>{{ item.Waktu_Janji }} WIB</span>
                              </div>
                            </div>

                            <div v-if="item.Alasan_Batal" class="flex items-start gap-2 bg-red-50/60 p-2.5 rounded-xl border border-red-100 mt-2.5">
                              <Icon icon="lucide:info" class="size-3.5 text-red-500 mt-0.5 shrink-0" />
                              <p class="text-xs font-medium text-red-600 leading-snug">"{{ item.Alasan_Batal }}"</p>
                            </div>

                            <div v-if="item.No_Id === row.original.No_Id" class="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                              <div class="size-2 rounded-full bg-bejo-500 animate-pulse shrink-0"></div>
                              <span class="text-xs font-bold text-bejo-600">Janji temu saat ini</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
      <span class="text-sm font-bold text-slate-400"
        >Total <span class="text-slate-900">{{ processedAppointments.length }}</span> Janji Temu (Terbaru)</span
      >
      <div class="flex items-center gap-2">
        <button @click="table.previousPage()" :disabled="!table.getCanPreviousPage()" class="size-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all disabled:opacity-50">
          <Icon icon="lucide:chevron-left" class="size-4" />
        </button>
        <div class="px-4 text-sm font-black text-slate-900">{{ table.getState().pagination.pageIndex + 1 }} / {{ table.getPageCount() }}</div>
        <button @click="table.nextPage()" :disabled="!table.getCanNextPage()" class="size-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all disabled:opacity-50">
          <Icon icon="lucide:chevron-right" class="size-4" />
        </button>
      </div>
    </div>
  </div>
</template>
