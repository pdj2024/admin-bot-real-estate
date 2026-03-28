<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { RouterLink } from 'vue-router'
import api from '@/services/axios'
import { 
  useVueTable, 
  FlexRender, 
  getCoreRowModel, 
  getPaginationRowModel, 
  getSortedRowModel, 
  getFilteredRowModel 
} from '@tanstack/vue-table'
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
    await api.put(`/api/admin/update?no_id=${item.No_Id}`, 
      { ...item, Status: newStatus, Id_Media: item.Id_Media || null },
      { headers: { 'X-Jenis-User': 'admin' } }
    )
    item.Status = newStatus // Update local state for instant feedback
    success(`Berhasil mengubah status ${item.Nama_User}`)
    emit('success')
  } catch (err) {
    fail(`Gagal mengubah status ${item.Nama_User}`)
  }
}

const table = useVueTable({
  get data() { return admins.value },
  columns,
  state: {
    get globalFilter() { return filter.value }
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
  <div class="flex flex-col rounded-xl border border-default-200 bg-card shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-default-200">
        <thead class="bg-default-50">
          <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <th v-for="header in headerGroup.headers" :key="header.id" 
                class="px-5 py-4 text-start text-xs font-bold text-default-600 uppercase tracking-wider">
              <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-default-200">
          <tr v-if="isLoading">
            <td colspan="4" class="py-20 text-center text-default-500">
              <div class="flex justify-center items-center gap-2">
                <Icon icon="lucide:loader-2" class="animate-spin size-5" />
                <span>Memuat data...</span>
              </div>
            </td>
          </tr>

          <tr v-else-if="table.getRowModel().rows.length === 0">
            <td colspan="4" class="py-16 text-center text-default-400 text-sm italic">
              Tidak ada data admin ditemukan.
            </td>
          </tr>

          <tr v-for="row in table.getRowModel().rows" :key="row.id" 
              class="hover:bg-default-50/50 transition-colors group">
            
            <td class="px-5 py-4 flex items-center gap-3">
              <div class="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
                {{ getInitial(row.original.Nama_User) }}
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-default-900 leading-tight">{{ row.original.Nama_User }}</span>
                <span class="text-xs text-default-500 font-medium">ID: {{ row.original.No_Id }}</span>
              </div>
            </td>

            <td class="px-5 py-4 text-sm text-default-600 font-medium">
              {{ row.original.Email }}
            </td>

            <td class="px-5 py-4">
              <div class="flex flex-col items-center gap-2">
                <span class="text-[10px] uppercase font-black tracking-widest transition-colors" 
                      :class="row.original.Status === 'aktif' ? 'text-primary' : 'text-default-400'">
                  {{ row.original.Status }}
                </span>
                <button class="toggle" 
                        :class="{ 'toggle-active': row.original.Status === 'aktif' }" 
                        @click="toggleStatus(row.original)">
                  <span class="toggle-circle" :class="{ 'translate-x-6': row.original.Status === 'aktif' }"></span>
                </button>
              </div>
            </td>

            <td class="px-5 py-4 relative action-menu">
              <button class="size-9 rounded-lg flex items-center justify-center hover:bg-default-100 transition-all text-default-500 hover:text-default-900 border border-transparent hover:border-default-200" 
                      @click.stop="toggleDropdown(row.original.No_Id)">
                <Icon icon="lucide:more-horizontal" class="size-5" />
              </button>

              <div v-if="openDropdownId === row.original.No_Id" 
                   class="absolute right-5 mt-2 w-44 bg-card shadow-xl border border-default-200 rounded-xl p-1.5 z-[100] animate-in fade-in zoom-in duration-150">
                <RouterLink :to="`/admin/${row.original.No_Id}`" class="dropdown-item"> 
                  <Icon icon="lucide:eye" class="size-4" /> Detail Admin
                </RouterLink>
                <button @click="emit('edit', row.original)" class="dropdown-item w-full">
                  <Icon icon="lucide:edit-3" class="size-4" /> Edit Data
                </button>
                <div class="my-1.5 border-t border-default-100"></div>
                <button @click="handleDelete(row.original)" class="dropdown-item w-full text-red-500 hover:bg-red-500/10 hover:text-red-600">
                  <Icon icon="lucide:trash-2" class="size-4" /> Hapus Admin
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="px-5 py-4 bg-default-50/50 border-t border-default-200 flex items-center justify-between">
      <p class="text-xs text-default-500 font-medium">
        Menampilkan <span class="text-default-900 font-bold">{{ table.getRowModel().rows.length }}</span> dari <span class="text-default-900 font-bold">{{ admins.length }}</span> Admin
      </p>

      <div class="flex items-center gap-2">
        <button @click="table.previousPage()" :disabled="!table.getCanPreviousPage()" class="btn-nav">
          <Icon icon="lucide:chevron-left" class="size-4" />
        </button>

        <div class="px-3 py-1 bg-default-100 rounded-md">
          <span class="text-xs font-bold text-default-700"> 
            {{ table.getState().pagination.pageIndex + 1 }} / {{ table.getPageCount() }} 
          </span>
        </div>

        <button @click="table.nextPage()" :disabled="!table.getCanNextPage()" class="btn-nav">
          <Icon icon="lucide:chevron-right" class="size-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.toggle {
  @apply w-[54px] h-7 bg-default-200 rounded-full relative transition-all duration-300 cursor-pointer border-none shadow-inner;
}
.toggle-active { @apply bg-primary; }
.toggle-circle {
  @apply size-5.5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform duration-300 shadow-md;
}

.btn-nav {
  @apply size-8 flex items-center justify-center rounded-lg border border-default-300 bg-card text-default-600
         transition-all hover:bg-default-100 hover:text-default-900 disabled:opacity-30 disabled:cursor-not-allowed;
}

.dropdown-item {
  @apply flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-default-700 rounded-lg transition-colors hover:bg-default-100;
}

.action-menu { @apply relative; }
</style>