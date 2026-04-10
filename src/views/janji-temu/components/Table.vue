<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useVueTable, FlexRender, getCoreRowModel, getPaginationRowModel } from '@tanstack/vue-table'

// Mock Data for Appointments Request
const appointmentRequests = ref([
  { id: '1', customer: 'Lina Marlina', email: 'lina@gmail.com', phone: '08123456789', property: 'Griya Asri Cluster A-12', date: '2026-04-12', time: '10:00', status: 'pending' },
  { id: '2', customer: 'Budi Santoso', email: 'budi@yahoo.com', phone: '08778899001', property: 'Apartemen Skyview B-05', date: '2026-04-12', time: '14:30', status: 'confirmed' },
  { id: '3', customer: 'Siti Aminah', email: 'siti@gmail.com', phone: '08212233441', property: 'Ruko Central Park No. 8', date: '2026-04-13', time: '09:00', status: 'pending' },
  { id: '4', customer: 'Andi Wijaya', email: 'andi@outlook.com', phone: '08112233445', property: 'Griya Asri Cluster C-02', date: '2026-04-14', time: '16:00', status: 'cancelled' },
])

const columns = [
  { accessorKey: 'customer', header: 'Calon Pembeli' },
  { accessorKey: 'property', header: 'Unit Properti' },
  { accessorKey: 'date', header: 'Rencana Kunjungan' },
  { accessorKey: 'status', header: 'Status' },
  { id: 'aksi', header: 'Aksi' }
]

const table = useVueTable({
  data: appointmentRequests.value,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: { pagination: { pageSize: 5 } }
})
</script>

<template>
  <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
    <div class="p-8 border-b border-slate-50 flex items-center justify-between">
       <div>
          <h4 class="text-lg font-black text-slate-900">Permintaan Janji Temu</h4>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Antrean Website & WhatsApp Bot</p>
       </div>
       <button class="px-6 py-2.5 bg-bejo-500 hover:bg-bejo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-bejo-500/20">
          Export Data
       </button>
    </div>

    <div class="overflow-x-auto">
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
            <!-- Customer -->
            <td class="px-8 py-6">
              <div class="flex items-center gap-4">
                <div class="size-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-lg">
                  {{ row.original.customer.charAt(0) }}
                </div>
                <div>
                  <div class="text-sm font-black text-slate-900">{{ row.original.customer }}</div>
                  <div class="text-[10px] font-bold text-slate-500">{{ row.original.phone }}</div>
                </div>
              </div>
            </td>

            <!-- Property -->
            <td class="px-8 py-6">
               <div class="text-sm font-black text-slate-700">{{ row.original.property }}</div>
               <span class="px-2 py-0.5 bg-slate-100 text-[9px] font-black text-slate-500 rounded uppercase tracking-tighter">Residensial</span>
            </td>

            <!-- Date/Time -->
            <td class="px-8 py-6">
               <div class="flex items-center gap-2 text-slate-900">
                  <Icon icon="lucide:calendar" class="size-4 text-bejo-500" />
                  <span class="text-sm font-bold">{{ row.original.date }}</span>
               </div>
               <div class="flex items-center gap-2 text-slate-400 mt-1">
                  <Icon icon="lucide:clock" class="size-3.5" />
                  <span class="text-xs font-medium">{{ row.original.time }} WIB</span>
               </div>
            </td>

            <!-- Status -->
            <td class="px-8 py-6">
               <span 
                class="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5"
                :class="{
                  'bg-amber-100 text-amber-700': row.original.status === 'pending',
                  'bg-emerald-100 text-emerald-700': row.original.status === 'confirmed',
                  'bg-red-100 text-red-700': row.original.status === 'cancelled',
                }"
               >
                  <div class="size-1.5 rounded-full" :class="{
                    'bg-amber-500': row.original.status === 'pending',
                    'bg-emerald-500': row.original.status === 'confirmed',
                    'bg-red-500': row.original.status === 'cancelled',
                  }"></div>
                  {{ row.original.status }}
               </span>
            </td>

            <!-- Aksi -->
            <td class="px-8 py-6">
               <div class="flex items-center gap-2">
                  <button class="size-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-bejo-500 hover:border-bejo-200 transition-all group-hover:bg-white shadow-sm">
                     <Icon icon="lucide:check-circle" class="size-5" />
                  </button>
                  <button class="size-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-all group-hover:bg-white shadow-sm">
                     <Icon icon="lucide:x-circle" class="size-5" />
                  </button>
               </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
       <span class="text-xs font-bold text-slate-400">Menampilkan <span class="text-slate-900">4</span> Permintaan Teratas</span>
       <div class="flex items-center gap-2">
          <button class="size-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all disabled:opacity-50" disabled>
             <Icon icon="lucide:chevron-left" class="size-4" />
          </button>
          <button class="size-9 rounded-xl bg-bejo-500 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-bejo-500/20">1</button>
          <button class="size-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
             <Icon icon="lucide:chevron-right" class="size-4" />
          </button>
       </div>
    </div>
  </div>
</template>
