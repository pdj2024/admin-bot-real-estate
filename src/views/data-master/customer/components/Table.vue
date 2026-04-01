<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import { RouterLink } from 'vue-router'
import api from '@/services/axios'
import { useVueTable, FlexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/vue-table'
import { confirm, success, fail } from '@/utils/sweet-alert'

interface Customer {
  No_Id: string
  UserName: string
  Nama_Display: string
  Email: string
  Telepon: number
  Kota: string
  Status: string
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
const filter = ref('')
const openDropdownId = ref<string | null>(null)
const emit = defineEmits(['edit', 'success'])
const columns = [
  { accessorKey: 'Nama_Display', header: 'Nama' },
  { accessorKey: 'Email', header: 'Email' },
  { accessorKey: 'Telepon', header: 'Telepon' },
  { accessorKey: 'Kota', header: 'Kota' },
  { accessorKey: 'Status', header: 'Status' },
  { id: 'aksi', header: 'Action', enableSorting: false }
]

const toggleStatus = async (item: Customer) => {
  item.Status = item.Status === 'aktif' ? 'non aktif' : 'aktif'
  item.Tgl_Nonaktif = item.Status === 'aktif' ? null : new Date()
  try {
    await api.put(
      '/api/Customer/update?no_id=' + item.No_Id,
      {
        UserName: item.UserName,
        Nama_Display: item.Nama_Display,
        Email: item.Email,
        Kota: item.Kota,
        Status: item.Status,
        Pernah_Order: item.Pernah_Order,
        Saves: item.Saves,
        Likes: item.Likes,
        Device_Token: item.Device_Token,
        Tgl_Created: item.Tgl_Created,
        Tgl_Nonaktif: item.Tgl_Nonaktif,
        Jumlah_Saves: item.Jumlah_Saves,
        Jumlah_Likes: item.Jumlah_Likes,
        Id_Media: item.Id_Media ? item.Id_Media : null
      },
      {
        headers: { 'X-Jenis-User': 'Customer' }
      }
    )
    success(`Berhasil mengubah status ${item.Nama_Display}`)
    console.log(item)
  } catch (err) {
    console.error('Gagal mengubah status:', err)
    fail(`Gagal mengubah mengubah status ${item.Nama_Display}`)
  } finally {
    emit('success')
  }
}

const toggleDropdown = (id: string) => {
  openDropdownId.value = openDropdownId.value === id ? null : id
}

const handleClickOutside = (event: MouseEvent) => {
  if (!(event.target as HTMLElement).closest('.action-menu')) {
    openDropdownId.value = null
  }
}

const table = useVueTable({
  get data() {
    return customers.value
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
  initialState: {
    pagination: { pageSize: 5 }
  }
})

const fetchData = async () => {
  try {
    const { data } = await api.get('/api/customer/getAll?orderby=Tgl_Created', {
      headers: { 'X-Jenis-User': 'admin' }
    })
    customers.value = data.Data
    console.log(customers)
  } catch (err) {
    console.error('Gagal memuat data:', err)
  }
}

const handleEdit = (Customer: Customer) => {
  emit('edit', Customer)
}

const handleDelete = async (Customer: Customer) => {
  confirm(`Ingin menghapus data Customer milik ${Customer.Nama_Display}?`, async () => {
    try {
      const url = `/api/Customer/delete?no_id=${Customer.No_Id}`

      await api.delete(url, {
        headers: { 'X-Jenis-User': 'Customer' }
      })

      success('Hapus data Customer berhasil')
    } catch (err: any) {
      console.error(err)
      fail(err.response?.data?.Message || 'Terjadi kesalahan pada server')
    } finally {
      emit('success')
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
  <div class="flex flex-col rounded-xl border border-default-200 bg-card shadow-sm">
    <div class="overflow-x-auto lg:overflow-visible">
      <table class="min-w-full divide-y divide-default-200">
        <thead class="bg-gray-50">
          <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <th v-for="header in headerGroup.headers" :key="header.id" class="px-4 py-3 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-if="table.getRowModel().rows.length === 0">
            <td colspan="5" class="py-12 text-center text-gray-500 text-sm">Tidak ada data customer ditemukan.</td>
          </tr>

          <tr v-for="row in table.getRowModel().rows" :key="row.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 flex items-center gap-3">
              <div class="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                {{ row.original.Nama_Display.charAt(0).toUpperCase() }}
              </div>
              <div class="flex flex-col">
                <span class="font-semibold text-gray-900 leading-tight">{{ row.original.Nama_Display }}</span>
                <span class="text-xs text-gray-500">{{ row.original.UserName }}</span>
              </div>
            </td>

            <td class="px-4 py-3 text-sm text-gray-600">
              {{ row.original.Email }}
            </td>

            <td class="px-4 py-3 text-sm text-gray-600">
              {{ row.original.Telepon }}
            </td>

            <td class="px-4 py-3 text-sm text-gray-600">
              {{ row.original.Kota }}
            </td>

            <td class="px-4 py-3">
              <div class="flex flex-col items-center gap-1.5">
                <span class="text-[10px] uppercase font-bold tracking-tight" :class="row.original.Status === 'aktif' ? 'text-primary' : 'text-gray-400'">
                  {{ row.original.Status }}
                </span>
                <button class="toggle" :class="{ 'toggle-active': row.original.Status === 'aktif' }" @click="toggleStatus(row.original)" aria-label="Toggle Status">
                  <span class="toggle-circle" :class="{ 'translate-x-6': row.original.Status === 'aktif' }"></span>
                </button>
              </div>
            </td>

            <td class="px-4 py-3 relative action-menu">
              <button class="size-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500" @click.stop="toggleDropdown(row.original.No_Id)">
                <Icon icon="lucide:ellipsis" class="size-5" />
              </button>

              <div v-if="openDropdownId === row.original.No_Id" class="fixed right-4 mt-1 w-40 bg-white shadow-lg border border-gray-100 rounded-lg p-1 z-50">
                <!-- <RouterLink :to="`/Customer/${row.original.No_Id}`" class="dropdown-item"> <Icon icon="lucide:eye" class="size-4" /> Detail </RouterLink> -->
                <button @click="handleEdit(row.original)" class="dropdown-item w-full text-left"><Icon icon="lucide:edit" class="size-4" /> Edit</button>
                <div class="my-1 border-t border-gray-100"></div>
                <button @click="handleDelete(row.original)" class="dropdown-item w-full text-left text-red-600 hover:bg-red-50 hover:text-red-700"><Icon icon="lucide:trash-2" class="size-4" /> Hapus</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
      <p class="text-xs text-gray-500">
        Menampilkan <b>{{ table.getRowModel().rows.length }}</b> dari <b>{{ customers.length }}</b> Customer
      </p>

      <div class="flex items-center gap-1">
        <button @click="table.previousPage()" :disabled="!table.getCanPreviousPage()" class="btn-nav">
          <Icon icon="lucide:chevron-left" class="size-4" />
        </button>

        <div class="flex items-center gap-1 mx-2">
          <span class="text-xs font-medium text-gray-700"> Hal. {{ table.getState().pagination.pageIndex + 1 }} / {{ table.getPageCount() }} </span>
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
