<script setup lang="ts">
import { onMounted, ref, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'
import Modal from './Modal.vue' // Impor modal baru kamu
import { useVueTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, type SortingState } from '@tanstack/vue-table'
import { confirm, success, fail } from '@/utils/sweet-alert'

const isModalOpen = ref(false)
const isSortOpen = ref(false)
const activeDropdownId = ref<string | null>(null)
const filter = ref('')
const products = ref<Product[]>([])
const selectedItem = ref<Product | null>(null)
const sorting = ref<SortingState>([])
const selectedSort = ref('Terbaru')

interface MediaUrl {
  Url: string | null
  Expired_At: Date
  IsCompressed: false
  ContentType: string
  ThumbUrl: string | null
  Size: number
  Id_Media: string
}

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
  Minimal_Sewa: number | null
  Satuan_Minimal_Sewa: string
  Area: string
  Hide_alamat: boolean
  Akses_Jalan: string[]
  File_Image: string[]
  MediaUrls: MediaUrl[]
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
  setSort(type)
  isSortOpen.value = false
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
      headers: { 'X-Jenis-User': 'Admin' }
    })
    products.value = data.Data
  } catch (err: any) {
    console.error('DATA:', err.response?.data)
    console.error('STATUS:', err.response?.status)
    console.error('MESSAGE:', err.message)
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

const toggleDropdown = (id: string) => {
  activeDropdownId.value = activeDropdownId.value === id ? null : id
}

const updateStatusTransaksi = async (product: any, newStatus: string) => {
  confirm(`Apakah Anda yakin ingin mengubah status menjadi ${newStatus}?`, async () => {
    try {
      product.Status_Properti = newStatus
      await api.put('/api/realEstate/update?no_id=' + product.No_Id, product, {
        headers: { 'X-Jenis-User': 'admin' }
      })
      fetchData()
      activeDropdownId.value = null
    } catch (error) {
      console.error('Gagal mengubah status:', error)
    }
  })
}

const openAddModal = () => {
  selectedItem.value = null
  isModalOpen.value = true
}

const openEditModal = (data: Product) => {
  selectedItem.value = { ...data }
  isModalOpen.value = true
}

const deleteProduct = async (data: Product) => {
  confirm('Apakah Anda ingin menghapus data ini?', async () => {
    try {
      // hapus media dulu
      const res = await api.delete('/api/mediacloud/delete-batch', {
        data: {
          ids: [...data.File_Image]
        },
        headers: {
          'X-Jenis-User': 'admin'
        }
      })

      const successMedia: string[] = res.data?.Success || []

      // cek apakah semua File_Image berhasil dihapus
      const semuaTerhapus = data.File_Image.every((id: string) => successMedia.includes(id))

      if (!semuaTerhapus) {
        fail('Beberapa gambar gagal dihapus')
        return
      }

      // lanjut hapus produk
      await api.delete(`/api/realEstate/delete?no_id=${data.No_Id}`, {
        headers: {
          'X-Jenis-User': 'admin'
        }
      })

      fetchData
      success('Berhasil hapus produk')
    } catch (err: any) {
      console.log(err.message)
      fail('Gagal menghapus data')
    }
  })
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
          <button type="button" @click="isSortOpen = !isSortOpen" class="btn btn-sm bg-card border border-default-200 text-default-700 hover:bg-default-50 transition-all">
            <Icon icon="lucide:arrow-up-down" class="size-3.5 me-2" />
            Urutkan: <span class="text-primary ms-1 font-bold">{{ selectedSort }}</span>
          </button>
          <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <div v-show="isSortOpen" class="absolute right-0 top-full mt-2 z-50 min-w-40 bg-card border border-default-100 rounded-xl shadow-xl p-2 animate-in fade-in zoom-in duration-200">
              <button @click="handleSort('Terbaru')" class="dropdown-item w-full text-left rounded-lg p-2 hover:bg-default-100 text-sm text-default-700">Terbaru</button>
              <button @click="handleSort('Harga Termurah')" class="dropdown-item w-full text-left rounded-lg p-2 hover:bg-default-100 text-sm text-default-700">Harga Termurah</button>
              <button @click="handleSort('Harga Termahal')" class="dropdown-item w-full text-left rounded-lg p-2 hover:bg-default-100 text-sm text-default-700">Harga Termahal</button>
              <hr class="my-2 border-default-100" />
              <button @click="handleSort('Luas Terbesar')" class="dropdown-item w-full text-left rounded-lg p-2 hover:bg-default-100 text-sm text-default-700">Luas Terbesar</button>
            </div>
          </Transition>
        </div>

        <button @click="openAddModal" class="btn btn-sm bg-primary-gradient text-white hover:bg-primary-800 shadow-md shadow-primary/20">
          <Icon icon="lucide:plus" class="size-4 me-1" />
          Tambah Properti
        </button>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
      <div v-for="row in table.getRowModel().rows" :key="row.id" class="card group flex flex-col h-full rounded-2xl overflow-hidden border transition-all duration-500 hover:-translate-y-1 relative bg-card border-default-150 hover:border-primary/30 hover:shadow-lg">
        <div class="relative h-60 overflow-hidden">
          <div v-if="row.original.Status_Display != 'Aktif' || row.original.Status_Properti != 'Tersedia'" class="absolute inset-0 bg-black/40 backdrop-grayscale-[60%] z-[5] pointer-events-none transition-all duration-500"></div>

          <div v-if="row.original.Status_Display != 'Aktif' || row.original.Status_Properti != 'Tersedia'" class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div class="px-2 py-1 bg-black/20 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl transform transition-transform duration-500 group-hover:scale-110">
              <span class="text-md font-black uppercase tracking-widest text-white/90">
                {{ row.original.Status_Display != 'Aktif' ? 'Nonaktif' : row.original.Status_Properti }}
              </span>
            </div>
          </div>

          <img v-if="row.original.MediaUrls.length >= 1" :src="row.original.MediaUrls[0].Id_Media" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div v-else class="w-full h-full bg-default-100 flex flex-col items-center justify-center">
            <Icon icon="lucide:image" class="size-16 text-default-300" />
          </div>

          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

          <div class="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <span class="w-fit bg-bejo-600/70 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md shadow-md border border-bejo-300/40">
              {{ row.original.Status_Display != 'Aktif' ? 'Nonaktif' : row.original.Status_Properti }}
            </span>

            <div class="flex flex-wrap gap-1.5">
              <span v-for="(trans, i) in row.original.Status_Transaksi" :key="i" class="bg-black/50 backdrop-blur-md text-bejo-100 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border border-bejo-700/60 shadow-sm">
                {{ trans }}
              </span>
            </div>
          </div>

          <div class="absolute bottom-4 right-4 flex flex-col gap-1.5 items-end z-10">
            <span v-for="(akses, idx) in row.original.Akses_Jalan.slice(0, 2)" :key="idx" class="bg-card/90 backdrop-blur-md text-default-700 text-[10px] font-bold px-2.5 py-1 rounded-md border-l-4 border-primary shadow-sm flex items-center gap-1.5">
              <Icon icon="lucide:map-pin" class="size-2.5 text-primary" />
              {{ akses }}
            </span>
          </div>
        </div>

        <div class="p-5 flex flex-col flex-1">
          <div class="flex items-start gap-1.5 text-primary mb-2">
            <Icon icon="lucide:map-pin" class="size-3.5 mt-0.5" />
            <div class="flex flex-col">
              <span class="text-[11px] font-bold uppercase tracking-wider text-primary">{{ row.original.Area[0] }}</span>
              <p class="text-[10px] font-medium text-default-500 line-clamp-1">
                <span v-if="!row.original.Hide_alamat">{{
                  (row.original.Alamat || '')
                    .split(' ')
                    .filter(
                      (kata) =>
                        !(row.original.Area[0] || '')
                          .toLowerCase()
                          .replace(/[^a-z0-9\s]/g, '')
                          .split(/\s+/)
                          .includes(kata.toLowerCase().replace(/[^a-z0-9]/g, ''))
                    )
                    .join(' ')
                    .replace(/[,.\s]+$/, '')
                }}</span>
                <span v-if="row.original.Area[1]"> ({{ row.original.Area[1] }})</span>
              </p>
            </div>
          </div>

          <h6 class="text-lg text-default-900 font-black transition-colors line-clamp-1 mb-1 leading-tight group-hover:text-primary">
            <RouterLink :to="`/properti/detail/${row.original.Slug}`">{{ row.original.Nama_Produk }}</RouterLink>
          </h6>

          <p class="text-[12px] font-medium text-default-400 mb-4">
            {{ row.original.Tipe }} &bull; Tipe {{ row.original.Luas_Bangunan }} <span class="opacity-70">[{{ row.original.Tipe_Ukuran }}]</span>
          </p>

          <div class="grid grid-cols-2 gap-3 rounded-xl p-3 mb-5 border border-default-100 bg-default-50/50">
            <div class="flex items-center gap-2">
              <Icon icon="lucide:land-plot" class="size-3.5 text-default-400" />
              <span class="text-xs font-bold text-default-600">LT {{ row.original.Luas_Tanah }} m²</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon icon="lucide:home" class="size-3.5 text-default-400" />
              <span class="text-xs font-bold text-default-600">LB {{ row.original.Luas_Bangunan }} m²</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon icon="lucide:layers" class="size-3.5 text-default-400" />
              <span class="text-xs font-bold text-default-600">{{ row.original.Jumlah_Lantai }} Lantai</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon icon="lucide:car" class="size-3.5 text-default-400" />
              <span class="text-xs font-bold text-default-600">{{ row.original.Jumlah_Carpot }} Mobil</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon icon="lucide:bed" class="size-3.5 text-default-400" />
              <span class="text-xs font-bold text-default-600">{{ row.original.Jumlah_Kamar_Tidur }} Kamar</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon icon="lucide:bath" class="size-3.5 text-default-400" />
              <span class="text-xs font-bold text-default-600">{{ row.original.Jumlah_Kamar_Mandi }} Kamar</span>
            </div>
          </div>

          <div class="mt-auto pt-4 border-t border-default-100 flex flex-col gap-2">
            <div v-if="row.original.Harga_Sewa1 > 0" class="flex flex-col">
              <span class="text-[9px] font-black text-default-400 uppercase tracking-widest mb-0.5">
                Harga Sewa
                <span v-if="row.original.Minimal_Sewa && row.original.Minimal_Sewa > 0">(min. {{ row.original.Minimal_Sewa + ' ' + row.original.Satuan_Minimal_Sewa }})</span>
              </span>
              <div class="flex items-baseline gap-1.5">
                <span class="text-base font-black text-default-900">
                  {{ formatCurrency(row.original.Harga_Sewa2 > 0 ? row.original.Harga_Sewa2 : row.original.Harga_Sewa1) }}
                </span>
                <span v-if="row.original.Harga_Sewa2 > 0" class="text-[10px] text-red-500 line-through">
                  {{ formatCurrency(row.original.Harga_Sewa1) }}
                </span>
                <span class="text-[10px] text-default-400 italic">/{{ row.original.Satuan_Minimal_Sewa || 'thn' }}</span>
              </div>
            </div>

            <div v-if="row.original.Harga_Jual1 > 0" class="flex flex-col">
              <span class="text-[9px] font-black text-default-400 uppercase tracking-widest mb-0.5">Harga Jual</span>
              <div class="flex items-baseline gap-1.5">
                <span class="text-lg font-black text-default-900">{{ formatCurrency(row.original.Harga_Jual2 > 0 ? row.original.Harga_Jual2 : row.original.Harga_Jual1) }}</span>
                <span v-if="row.original.Harga_Jual2 > 0" class="text-[10px] text-red-500 line-through">{{ formatCurrency(row.original.Harga_Jual1) }}</span>
              </div>
            </div>
          </div>

          <div class="absolute bottom-5 right-5 z-20">
            <button type="button" @click.stop="toggleDropdown(row.id)" class="size-9 flex items-center justify-center rounded-xl bg-default-100 text-default-600 hover:bg-primary hover:text-white transition-all">
              <Icon icon="lucide:more-vertical" class="size-5" />
            </button>
            <div v-show="activeDropdownId === row.id" class="absolute right-0 bottom-11 z-[100] min-w-[180px] bg-card p-1.5 shadow-2xl border border-default-100 rounded-xl animate-in slide-in-from-bottom-2 duration-200">
              <button @click="updateStatusTransaksi(row.original, 'Terjual')" v-if="row.original.Status_Transaksi.includes('Jual') && row.original.Status_Properti != 'Terjual'" class="dropdown-item-custom hover:bg-emerald-500/10 hover:text-emerald-500"><Icon icon="lucide:badge-check" class="size-4" /> Sudah Terjual</button>
              <button @click="updateStatusTransaksi(row.original, 'Tersewa')" v-if="row.original.Status_Transaksi.includes('Sewa') && row.original.Status_Properti != 'Tersewa'" class="dropdown-item-custom hover:bg-emerald-500/10 hover:text-emerald-500"><Icon icon="lucide:key" class="size-4" /> Sudah Tersewa</button>
              <button @click="updateStatusTransaksi(row.original, 'Tersedia')" v-if="row.original.Status_Transaksi.includes('Jual') && row.original.Status_Properti == 'Terjual'" class="dropdown-item-custom hover:bg-emerald-500/10 hover:text-emerald-500"><Icon icon="lucide:badge-check" class="size-4" /> Batal Terjual</button>
              <button @click="updateStatusTransaksi(row.original, 'Tersedia')" v-if="row.original.Status_Transaksi.includes('Sewa') && row.original.Status_Properti == 'Tersewa'" class="dropdown-item-custom hover:bg-emerald-500/10 hover:text-emerald-500"><Icon icon="lucide:key" class="size-4" /> Batal Tersewa</button>
              <button @click="openEditModal(row.original)" class="dropdown-item-custom hover:bg-primary/10 hover:text-primary"><Icon icon="lucide:pencil" class="size-4" /> Edit</button>
              <button @click="deleteProduct(row.original)" class="dropdown-item-custom text-red-500 hover:bg-red-500/10"><Icon icon="lucide:trash-2" class="size-4" /> Hapus</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap md:justify-between justify-center items-center gap-4 mt-10 pb-10 border-t border-default-100 pt-6">
      <p class="text-default-500 text-xs">
        Menampilkan <b>{{ table.getFilteredRowModel().rows.length != 0 ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 : '0' }}</b> - <b>{{ Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length) }}</b> dari <b>{{ table.getFilteredRowModel().rows.length }}</b>
      </p>

      <nav class="flex items-center gap-1">
        <button @click="table.previousPage()" :disabled="!table.getCanPreviousPage()" class="btn-pagination">Prev</button>
        <button v-for="n in table.getPageCount()" :key="n" @click="table.setPageIndex(n - 1)" class="btn-pagination-num" :class="table.getState().pagination.pageIndex === n - 1 ? 'active' : ''">
          {{ n }}
        </button>
        <button @click="table.nextPage()" :disabled="!table.getCanNextPage()" class="btn-pagination">Next</button>
      </nav>
    </div>

    <Modal v-model:showModal="isModalOpen" :itemData="selectedItem" @success="fetchData" />
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.dropdown-item-custom {
  @apply w-full flex items-center gap-2.5 px-3 py-2 text-sm font-bold text-default-600 rounded-lg transition-colors text-left;
}

.btn-pagination {
  @apply px-3 py-1.5 text-xs font-bold bg-card border border-default-200 text-default-600 rounded-lg disabled:opacity-30 hover:bg-default-50 transition-all;
}

.btn-pagination-num {
  @apply size-8 flex items-center justify-center text-xs font-bold rounded-lg border border-default-200 bg-card text-default-600 hover:border-primary hover:text-primary transition-all;
}

.btn-pagination-num.active {
  @apply bg-primary text-white border-primary shadow-md shadow-primary/20;
}

:where([data-theme='dark']) .card {
  @apply bg-zinc-900 border-zinc-800 shadow-none;
}

:where([data-theme='dark']) .card:hover {
  @apply border-primary/50 bg-zinc-800/50;
}
</style>
