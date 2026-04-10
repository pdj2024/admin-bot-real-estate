<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'
import { useVueTable, FlexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/vue-table'
import { confirm, success, fail } from '@/utils/sweet-alert'

interface Admin {
  No_Id: string
  Email: string
  Nama_User: string
  Role_User: string
  Keterangan: string
  Status: string
  Id_Media?: string
}

const admins = ref<Admin[]>([])
const isLoading = ref(false)
const filter = ref('')
const openDropdownId = ref<string | null>(null)
const emit = defineEmits(['edit', 'success'])

const columns = [
  { accessorKey: 'Nama_User', header: 'Nama' },
  { accessorKey: 'Email', header: 'Email' },
  { accessorKey: 'Status', header: 'Status' },
  { id: 'aksi', header: 'Action', enableSorting: false }
]

// Helpers
const getInitial = (name: string) => name?.charAt(0).toUpperCase() || '?'

const fetchData = async () => {
  isLoading.value = true
  try {
    const { data } = await api.get('/api/admin/getAll', {
      headers: { 'X-Jenis-User': 'admin' }
    })
    admins.value = data.Data
  } catch (err) {
    console.error('Gagal memuat data:', err)
  } finally {
    isLoading.value = false
  }
}

const toggleStatus = async (item: Admin) => {
  const newStatus = item.Status === 'aktif' ? 'non aktif' : 'aktif'
  try {
    await api.put(`/api/admin/update?no_id=${item.No_Id}`, { ...item, Status: newStatus, Id_Media: item.Id_Media || null }, { headers: { 'X-Jenis-User': 'admin' } })
    item.Status = newStatus // Update local state for instant feedback
    success(`Berhasil mengubah status ${item.Nama_User}`)
    emit('success')
  } catch (err) {
    fail(`Gagal mengubah status ${item.Nama_User}`)
  }
}

const table = useVueTable({
  get data() {
    return admins.value
  },
  columns,
  state: {
    get globalFilter() {
      return filter.value
    }
  },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  initialState: { pagination: { pageSize: 5 } }
})

const toggleDropdown = (id: string) => {
  openDropdownId.value = openDropdownId.value === id ? null : id
}

const handleClickOutside = (event: MouseEvent) => {
  if (!(event.target as HTMLElement).closest('.action-menu')) {
    openDropdownId.value = null
  }
}

const handleDelete = async (admin: Admin) => {
  confirm(`Ingin menghapus data admin milik ${admin.Nama_User}?`, async () => {
    try {
      await api.delete(`/api/admin/delete?no_id=${admin.No_Id}`, {
        headers: { 'X-Jenis-User': 'admin' }
      })
      success('Hapus data admin berhasil')
      fetchData() // Refresh data
      emit('success')
    } catch (err: any) {
      fail(err.response?.data?.Message || 'Terjadi kesalahan pada server')
    }
  })
}

defineExpose({ fetchData })

onMounted(() => {
  fetchData()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="flex flex-col">
    <div class="overflow-x-auto lg:overflow-visible">
      <table class="min-w-full divide-y divide-slate-100">
        <thead>
          <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <th v-for="header in headerGroup.headers" :key="header.id" class="px-6 py-5 text-start text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-50">
          <tr v-if="isLoading">
            <td colspan="4" class="py-24 text-center">
              <div class="flex flex-col items-center gap-3">
                <div class="size-12 rounded-2xl bg-bejo-50 flex items-center justify-center">
                  <Icon icon="lucide:loader-2" class="animate-spin size-6 text-bejo-500" />
                </div>
                <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Memuat Data Admin...</span>
              </div>
            </td>
          </tr>

          <tr v-else-if="table.getRowModel().rows.length === 0">
            <td colspan="4" class="py-20 text-center">
              <div class="flex flex-col items-center gap-3 opacity-40">
                <Icon icon="lucide:database-zap" class="size-12 text-slate-300" />
                <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Tidak ada data ditemukan</span>
              </div>
            </td>
          </tr>

          <tr v-for="row in table.getRowModel().rows" :key="row.id" class="hover:bg-slate-50/50 transition-all duration-300 group">
            <td class="px-6 py-5">
              <div class="flex items-center gap-4">
                <div class="size-12 rounded-2xl bg-gradient-to-br from-bejo-500 to-bejo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-bejo-500/20 group-hover:scale-110 transition-transform duration-500">
                  {{ getInitial(row.original.Nama_User) }}
                </div>
                <div class="flex flex-col gap-0.5">
                  <span class="font-black text-slate-900 tracking-tight group-hover:text-bejo-600 transition-colors">{{ row.original.Nama_User }}</span>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">ID: {{ row.original.No_Id }}</span>
                  </div>
                </div>
              </div>
            </td>

            <td class="px-6 py-5">
              <div class="flex items-center gap-2 text-slate-600 font-bold text-sm">
                <Icon icon="lucide:mail" class="size-4 text-slate-400" />
                {{ row.original.Email }}
              </div>
            </td>

            <td class="px-6 py-5">
              <div class="flex items-center gap-4">
                <span class="text-[10px] uppercase font-black tracking-[0.1em] transition-all min-w-[60px]" :class="row.original.Status === 'aktif' ? 'text-bejo-500' : 'text-slate-300'">
                  {{ row.original.Status === 'aktif' ? 'Aktif' : 'Non-Aktif' }}
                </span>
                <button 
                  @click="toggleStatus(row.original)"
                  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-bejo-500/20"
                  :class="row.original.Status === 'aktif' ? 'bg-bejo-500' : 'bg-slate-200'"
                >
                  <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" :class="row.original.Status === 'aktif' ? 'translate-x-5' : 'translate-x-0'"></span>
                </button>
              </div>
            </td>

            <td class="px-6 py-5 relative action-menu">
              <button @click.stop="toggleDropdown(row.original.No_Id)" class="size-10 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200">
                <Icon icon="lucide:more-vertical" class="size-5" />
              </button>

              <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <div v-if="openDropdownId === row.original.No_Id" class="absolute right-6 mt-2 w-48 bg-white shadow-2xl border border-slate-100 rounded-2xl p-2 z-[100]">
                  <button @click="emit('edit', row.original)" class="dropdown-item w-full">
                    <Icon icon="lucide:pencil" class="size-4" /> 
                    Edit Data
                  </button>
                  <div class="my-1.5 border-t border-slate-50"></div>
                  <button @click="handleDelete(row.original)" class="dropdown-item w-full text-red-500 hover:bg-red-50 hover:text-red-600">
                    <Icon icon="lucide:trash-2" class="size-4" /> 
                    Hapus Admin
                  </button>
                </div>
              </Transition>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="px-6 py-5 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        Menampilkan 
        <span class="text-slate-900 font-black">{{ table.getRowModel().rows.length }}</span> 
        dari 
        <span class="text-slate-900 font-black">{{ admins.length }}</span> 
        Data Admin
      </div>

      <div class="flex items-center gap-2">
        <button @click="table.previousPage()" :disabled="!table.getCanPreviousPage()" class="btn-pagination">
          <Icon icon="lucide:chevron-left" class="size-4" />
        </button>

        <div class="flex items-center gap-1">
          <button 
            v-for="n in table.getPageCount()" 
            :key="n" 
            @click="table.setPageIndex(n - 1)" 
            class="btn-pagination-num"
            :class="table.getState().pagination.pageIndex === n - 1 ? 'active' : ''"
          >
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
</style>
