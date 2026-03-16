<script setup lang="ts">
import { onMounted, ref, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'
import Modal from './Modal.vue' // Impor modal baru kamu
import { useVueTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, type SortingState } from '@tanstack/vue-table'

const isModalOpen = ref(false)
const isSortOpen = ref(false)
const activeDropdownId = ref<string | null>(null)
const filter = ref('')
const products = ref<Product[]>([])
const selectedItem = ref<Product | null>(null)
const sorting = ref<SortingState>([])
const selectedSort = ref('Terbaru')

export interface Product {
  No_Id: string
  Nama_Produk: string
  Alamat: string
  Email: string
  Tipe: string
  Tipe_Ukuran: string
  Jenis_Sertifikat: string
  Luas_Tanah: number
  Luas_Bangunan: number
  Jumlah_Lantai: number
  Jumlah_Kamar_Tidur: number
  Jumlah_Kamar_Mandi: number
  Jumlah_Carpot: number
  Daya_Listrik: number
  Status_Display: string
  Status_Properti: string
  Status_Transaksi: string[]
  minimal_sewa: number
  Harga_Jual1: number
  Harga_Jual2: number
  Harga_Jual3: number
  Harga_Sewa1: number
  Harga_Sewa2: number
  Harga_Sewa3: number
  Keterangan: string
  Slug: string
  Flag_Sewa: string
  Satuan_Minimal_Sewa: string
  Area: string
  Hide_alamat: boolean
  Akses_Jalan: string[]
  File_Image: string
}

const setSort = (type: string) => {
  selectedSort.value = type

  if (type === 'Harga Termurah') {
    sorting.value = [{ id: 'Harga_Jual1', desc: false }]
  } else if (type === 'Harga Termahal') {
    sorting.value = [{ id: 'Harga_Jual1', desc: true }]
  } else if (type === 'Luas Terbesar') {
    sorting.value = [{ id: 'Luas_Tanah', desc: true }]
  } else {
    sorting.value = []
  }
}

const handleSort = (type: string) => {
  setSort(type) // Memanggil fungsi sorting yang sudah kita buat sebelumnya
  isSortOpen.value = false // TUTUP dropdown setelah klik
}

const table = useVueTable({
  get data() {
    return products.value
  },
  columns: [
    { accessorKey: 'Nama_Produk', header: 'Properti' },
    { accessorKey: 'Tipe', header: 'Tipe' },
    { accessorKey: 'Luas_Tanah', header: 'Luas' },
    { accessorKey: 'Harga_Jual1', header: 'Harga' },
    { accessorKey: 'Status_Properti', header: 'Status' }
  ],
  state: {
    get globalFilter() {
      return filter.value
    },
    get sorting() {
      return sorting.value
    }
  },
  onSortingChange: (updaterOrValue) => {
    sorting.value = typeof updaterOrValue === 'function' ? updaterOrValue(sorting.value) : updaterOrValue
  },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  initialState: {
    pagination: { pageSize: 6 }
  }
})

const fetchData = async () => {
  try {
    const { data } = await api.get('/api/realEstate/getAll', {
      headers: { 'X-Jenis-User': 'Customer' }
    })
    products.value = data.Data
  } catch (err) {
    console.error(err)
  }
}

// const columns = [
//   { accessorKey: 'Nama_Produk', header: 'Properti' },
//   { accessorKey: 'Tipe', header: 'Tipe' },
//   { accessorKey: 'Luas_Tanah', header: 'Luas (LT/LB)' },
//   { accessorKey: 'Harga_Jual1', header: 'Harga_Jual1' },
//   { accessorKey: 'Status_Properti', header: 'Status' },
//   { id: 'aksi', header: 'Aksi', enableSorting: false }
// ]

// const table = useVueTable({
//   get data() {
//     return products.value
//   },
//   columns,
//   state: {
//     get globalFilter() {
//       return filter.value
//     }
//   },
//   getCoreRowModel: getCoreRowModel(),
//   getPaginationRowModel: getPaginationRowModel(),
//   getSortedRowModel: getSortedRowModel(),
//   getFilteredRowModel: getFilteredRowModel(),
//   initialState: {
//     pagination: { pageSize: 6 }
//   }
// })

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

const toggleDropdown = (id: string) => {
  activeDropdownId.value = activeDropdownId.value === id ? null : id
}

const openAddModal = () => {
  selectedItem.value = null
  isModalOpen.value = true
}

const openEditModal = (data: Product) => {
  selectedItem.value = { ...data }
  isModalOpen.value = true
}

window.addEventListener('click', (e) => {
  if (!(e.target as Element).closest('.relative')) activeDropdownId.value = null
  const target = e.target as HTMLElement
  if (!target.closest('#sorting-container')) {
    isSortOpen.value = false
  }
})

onMounted(async () => {
  await fetchData()
  nextTick(() => {
    window.HSStaticMethods?.autoInit()
  })
})
</script>

<template>
  <div class="lg:col-span-3 col-span-1">
    <div class="flex items-center md:justify-between flex-wrap gap-4 mb-6 print:hidden">
      <div>
        <p class="text-default-500 text-sm">
          Menampilkan <span class="font-bold text-default-900">{{ table.getFilteredRowModel().rows.length }}</span> Properti
        </p>
      </div>

      <div class="flex items-center gap-3">
        <div id="sorting-container" class="relative inline-flex">
          <button type="button" @click="isSortOpen = !isSortOpen" class="btn btn-sm bg-white border border-default-200 text-default-700 hover:bg-default-50 transition-all">
            <Icon icon="lucide:arrow-up-down" class="size-3.5 me-2" />
            Urutkan: <span class="text-primary ms-1 font-bold">{{ selectedSort }}</span>
          </button>
          <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <div v-show="isSortOpen" class="absolute right-0 top-full mt-2 z-50 min-w-40 bg-white border border-default-100 rounded-xl shadow-xl p-2 animate-in fade-in zoom-in duration-200">
              <button @click="handleSort('Terbaru')" class="dropdown-item w-full text-left rounded-lg p-2 hover:bg-slate-50 text-sm">Terbaru</button>
              <button @click="handleSort('Harga Termurah')" class="dropdown-item w-full text-left rounded-lg p-2 hover:bg-slate-50 text-sm">Harga Termurah</button>
              <button @click="handleSort('Harga Termahal')" class="dropdown-item w-full text-left rounded-lg p-2 hover:bg-slate-50 text-sm">Harga Termahal</button>

              <hr class="my-2 border-default-100" />

              <button @click="handleSort('Luas Terbesar')" class="dropdown-item w-full text-left rounded-lg p-2 hover:bg-slate-50 text-sm">Luas Terbesar</button>
            </div>
          </Transition>
        </div>

        <button @click="openAddModal" class="btn btn-sm bg-primary text-white hover:bg-primary-600 shadow-md shadow-primary/20">
          <Icon icon="lucide:plus" class="size-4 me-1" />
          Tambah Rumah
        </button>
      </div>
    </div>

    <button type="button" @click="$emit('openFilter')" class="lg:hidden w-full flex justify-center items-center btn btn-sm bg-primary/10 hover:bg-primary/20 text-primary py-3 rounded-xl mb-5"><Icon icon="lucide:sliders-horizontal" class="size-4 mr-2" /> Filter Pencarian</button>

    <div class="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
      <div v-for="row in table.getRowModel().rows" :key="row.id" class="card group flex flex-col h-full overflow-hidden border border-default-100 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
        <div class="relative h-56 overflow-hidden">
          <img :src="row.original.File_Image" alt="rumah" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

          <div class="absolute top-3 left-3 flex flex-col gap-2">
            <div>
              <span class="bg-emerald-500 text-white text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded shadow-lg">{{ row.original.Status_Properti }}</span>
            </div>
            <div class="flex gap-1">
              <span v-for="(trans, i) in row.original.Status_Transaksi" :key="i" class="bg-indigo-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded shadow-lg">{{ trans }}</span>
            </div>
          </div>

          <div class="absolute bottom-3 right-3 flex flex-col gap-1 items-end">
            <span v-for="(akses, idx) in row.original.Akses_Jalan.slice(0, 3)" :key="idx" class="bg-white/90 backdrop-blur-md text-default-800 text-[10px] font-bold px-2 py-0.5 rounded-sm border-l-2 border-primary shadow-sm">
              {{ akses }}
            </span>
          </div>
        </div>

        <div class="p-4">
          <div class="flex items-center gap-1 text-primary" :class="row.original.Hide_alamat ? 'mb-3' : ''">
            <Icon icon="lucide:map-pin" class="size-3"></Icon>
            <span class="text-[10px] font-bold uppercase tracking-wider">{{ row.original.Area }}</span>
          </div>
          <p v-if="!row.original.Hide_alamat" class="text-[11px] font-medium uppercase tracking-wider text-default-500 mb-2">{{ row.original.Alamat }}</p>
          <h6 class="text-base text-default-900 font-bold hover:text-primary transition-colors line-clamp-1 mb-1">
            <RouterLink :to="`/properti/detail/${row.original.Slug}`">{{ row.original.Nama_Produk }}</RouterLink>
          </h6>
          <p class="text-xs font-semibold text-default-400 leading-none mb-3">{{ row.original.Tipe }} Tipe {{ row.original.Luas_Bangunan + ' [Uk ' + row.original.Tipe_Ukuran + ']' }}</p>
          <div class="grid lg :grid-cols-3 grid-cols-2 gap-y-3 gap-x-2 border-y border-default-100 py-3 mb-4">
            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:building" class="size-3.5 text-default-400"></Icon> <span class="text-xs text-default-600">LB {{ row.original.Luas_Bangunan }}m²</span>
            </div>

            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:land-plot" class="size-3.5 text-default-400"></Icon> <span class="text-xs text-default-600">LT {{ row.original.Luas_Tanah }}m²</span>
            </div>

            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:bed" class="size-3.5 text-default-400"></Icon> <span class="text-xs text-default-600">{{ row.original.Jumlah_Kamar_Tidur }} Kamar</span>
            </div>

            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:bath" class="size-3.5 text-default-400"></Icon> <span class="text-xs text-default-600">{{ row.original.Jumlah_Kamar_Mandi }} WC</span>
            </div>

            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:car" class="size-3.5 text-default-400"></Icon> <span class="text-xs text-default-600">{{ row.original.Jumlah_Carpot }} Mobil</span>
            </div>

            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:layers" class="size-3.5 text-default-400"></Icon> <span class="text-xs text-default-600">{{ row.original.Jumlah_Lantai }} Lantai</span>
            </div>
          </div>

          <div class="mt-auto pt-2">
            <div class="flex items-center justify-between gap-2">
              <div class="flex flex-col min-h-[65px] justify-center">
                <div v-if="row.original.Harga_Jual1 > 0" class="mb-1">
                  <div v-if="row.original.Harga_Jual2 > 0">
                    <span class="text-[9px] text-red-500 line-through block leading-none">{{ formatCurrency(row.original.Harga_Jual1) }}</span>
                    <span class="text-sm font-extrabold text-primary leading-tight">{{ formatCurrency(row.original.Harga_Jual2) }}</span>
                  </div>
                  <span v-else class="text-sm font-extrabold text-primary leading-tight">{{ formatCurrency(row.original.Harga_Jual1) }}</span>
                </div>

                <div v-if="row.original.Harga_Sewa1 > 0" :class="{ 'mt-1 pt-1 border-t border-dashed border-default-200': row.original.Harga_Jual1 > 0 }">
                  <span class="text-[9px] text-default-400 block leading-none">Sewa /{{ row.original.Satuan_Minimal_Sewa || 'Thn' }}</span>
                  <span class="font-bold text-default-700" :class="row.original.Harga_Jual1 > 0 ? 'text-xs' : 'text-sm font-extrabold text-primary'">
                    {{ formatCurrency(row.original.Harga_Sewa2 > 0 ? row.original.Harga_Sewa2 : row.original.Harga_Sewa1) }}
                  </span>
                </div>
              </div>

              <div class="relative flex-shrink-0">
                <button type="button" @click.stop="toggleDropdown(row.id)" class="size-8 flex items-center justify-center rounded-full bg-default-100 text-default-600 hover:bg-primary hover:text-white transition-all shadow-sm">
                  <Icon icon="lucide:more-vertical" class="size-4" />
                </button>

                <div v-show="activeDropdownId === row.id" class="absolute right-0 bottom-10 z-[100] min-w-32 bg-white p-1 shadow-2xl border border-default-100 rounded-lg" role="menu">
                  <button @click="openEditModal(row.original)" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-default-600 hover:bg-default-50 rounded"><Icon icon="lucide:edit-3" class="size-3.5" /> Edit</button>
                  <button class="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded"><Icon icon="lucide:trash-2" class="size-3.5" /> Hapus</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap md:justify-between justify-center items-center gap-4 mt-10 pb-10">
      <p class="text-default-500 text-sm">
        Menampilkan <b>{{ table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 }}</b> sampai <b>{{ Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length) }}</b> dari <b>{{ table.getFilteredRowModel().rows.length }}</b> data
      </p>

      <nav class="flex items-center gap-1.5">
        <button @click="table.previousPage()" :disabled="!table.getCanPreviousPage()" class="btn btn-sm px-3 bg-white border border-default-200 disabled:opacity-50">Prev</button>

        <div v-if="table.getPageCount() > 0" class="flex items-center gap-1">
          <div v-if="table.getPageCount() <= 6" class="flex gap-1">
            <button v-for="n in table.getPageCount()" :key="n" @click="table.setPageIndex(n - 1)" class="btn size-8" :class="table.getState().pagination.pageIndex === n - 1 ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white border border-default-200 text-default-600 hover:border-primary hover:text-primary'">
              {{ n }}
            </button>
          </div>

          <div v-else class="flex gap-1">
            <button v-for="n in 3" :key="n" @click="table.setPageIndex(n - 1)" class="btn size-8" :class="table.getState().pagination.pageIndex === n - 1 ? 'bg-primary text-white' : 'bg-white border'">
              {{ n }}
            </button>

            <button class="btn size-8 bg-white border border-default-200 text-default-600 cursor-default" disabled>...</button>

            <button v-for="n in [2, 1, 0]" :key="n" @click="table.setPageIndex(table.getPageCount() - 1 - n)" class="btn size-8" :class="table.getState().pagination.pageIndex === table.getPageCount() - 1 - n ? 'bg-primary text-white' : 'bg-white border'">
              {{ table.getPageCount() - n }}
            </button>
          </div>
        </div>

        <button @click="table.nextPage()" :disabled="!table.getCanNextPage()" class="btn btn-sm px-3 bg-white border border-default-200 disabled:opacity-50">Next</button>
      </nav>
    </div>

    <Modal v-model:showModal="isModalOpen" :itemData="selectedItem" @success="fetchData" @close="console.log('tutup')"/>
  </div>
</template>
