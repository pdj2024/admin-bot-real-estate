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

const updateStatusTransaksi = async (product: any, newStatus: string) => {
  confirm(`Apakah Anda yakin ingin mengubah status menjadi ${newStatus}?`, async () => {
    try {
      if (newStatus === 'Tersedia') {
        product.Status_Display = 'Aktif'
      } else {
        product.Status_Display = 'Nonaktif'
      }
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
      // console.error('Error:', err.response?.data || err.Message)
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
          Tambah Properti
        </button>
      </div>
    </div>

    <button type="button" @click="$emit('openFilter')" class="lg:hidden w-full flex justify-center items-center btn btn-sm bg-primary/10 hover:bg-primary/20 text-primary py-3 rounded-xl mb-5"><Icon icon="lucide:sliders-horizontal" class="size-4 mr-2" /> Filter Pencarian</button>

    <div class="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
      <div v-for="row in table.getRowModel().rows" :key="row.id" class="card group flex flex-col h-full rounded-2xl overflow-hidden border transition-all duration-500 hover:-translate-y-1 relative" :class="row.original.Status_Display != 'Aktif' || row.original.Status_Properti != 'Tersedia' ? 'bg-slate-50 border-slate-200 opacity-75 grayscale-[30%] hover:grayscale-0' : 'bg-white border-slate-100 hover:border-primary/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]'">
        <div v-if="row.original.Status_Display != 'Aktif' || row.original.Status_Properti != 'Tersedia'" class="absolute inset-0 z-50 bg-slate-900/5 pointer-events-none"></div>

        <div class="relative h-60 overflow-hidden" :class="row.original.Status_Display != 'Aktif' || row.original.Status_Properti != 'Tersedia' ? 'grayscale' : ''">
          <img v-if="row.original.MediaUrls.length >= 1" :src="row.original.MediaUrls[0].Id_Media" alt="rumah" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />

          <div v-if="row.original.MediaUrls.length == 0" class="w-full h-full bg-slate-100 flex flex-col items-center justify-center transition-transform duration-700 group-hover:scale-105">
            <Icon icon="lucide:image" class="size-16 text-slate-300 group-hover:text-primary/50 transition-colors" />
            <span class="text-xs text-slate-400 mt-2 font-medium">Belum ada foto</span>
          </div>

          <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

          <!-- <div v-if="row.original.Status_Display != 'Aktif' || row.original.Status_Properti != 'Tersedia'" class="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div class="bg-red-500/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-lg border border-red-400/50 shadow-xl transform -rotate-12">
              <span class="text-xs font-black tracking-[0.2em] uppercase">{{ row.original.Status_Properti != 'Tersedia' ? row.original.Status_Properti : row.original.Status_Display }}</span>
            </div>
          </div> -->

          <div v-if="row.original && (row.original.Status_Display !== 'Aktif' || row.original.Status_Properti !== 'Tersedia')" class="absolute inset-0 flex items-center justify-center z-30 pointer-events-none p-6">
            <div class="text-white px-2 py-1 rounded-sm transform -rotate-6 font-black tracking-[0.15em] uppercase italic text-xs md:text-sm backdrop-blur-md bg-black/40 shadow-lg border border-white/10 select-none">
              {{ row.original.Status_Properti != 'Tersedia' ? row.original.Status_Properti : row.original.Status_Display }}
            </div>
          </div>

          <div class="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <div>
              <span class="backdrop-blur-sm text-white text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md shadow-sm" :class="row.original.Status_Display != 'Aktif' || row.original.Status_Properti != 'Tersedia' ? 'bg-slate-500/90' : 'bg-emerald-500/90'">
                {{ row.original.Status_Properti }}
              </span>
            </div>
            <div class="flex flex-wrap gap-1.5 max-w-[80%]">
              <span v-for="(trans, i) in row.original.Status_Transaksi" :key="i" class="backdrop-blur-sm text-white text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md shadow-sm" :class="row.original.Status_Display != 'Aktif' || row.original.Status_Properti != 'Tersedia' ? 'bg-slate-600/90' : 'bg-indigo-600/90'">
                {{ trans }}
              </span>
            </div>
          </div>

          <div class="absolute bottom-4 right-4 flex flex-col gap-1.5 items-end z-10">
            <span v-for="(akses, idx) in row.original.Akses_Jalan.slice(0, 3)" :key="idx" class="bg-white/95 backdrop-blur-md text-slate-700 text-[10px] font-semibold px-2.5 py-1 rounded-md border-l-4 shadow-sm flex items-center gap-1.5" :class="row.original.Status_Display != 'Aktif' || row.original.Status_Properti != 'Tersedia' ? 'border-slate-400' : 'border-primary'">
              <Icon icon="lucide:map-pin" class="size-2.5" :class="row.original.Status_Display != 'Aktif' || row.original.Status_Properti != 'Tersedia' ? 'text-slate-400' : 'text-primary'" />
              {{ akses }}
            </span>
          </div>
        </div>

        <div class="p-5 flex flex-col flex-1">
          <div class="flex items-start gap-1.5 text-primary mb-3" :class="row.original.Hide_alamat ? 'mb-4' : ''">
            <Icon icon="lucide:map-pin" class="size-4 mt-0.5 flex-shrink-0" :class="row.original.Status_Display != 'Aktif' || row.original.Status_Properti != 'Tersedia' ? 'text-slate-400' : ''" />
            <div class="flex flex-col">
              <span class="text-[11px] font-bold uppercase tracking-wider" :class="row.original.Status_Display != 'Aktif' || row.original.Status_Properti != 'Tersedia' ? 'text-slate-500' : ''">{{ row.original.Area }}</span>
              <p v-if="!row.original.Hide_alamat" class="text-[10px] font-medium text-slate-500 line-clamp-1 mt-0.5">{{ row.original.Alamat }}</p>
            </div>
          </div>

          <h6 class="text-lg text-slate-900 font-extrabold transition-colors line-clamp-1 mb-1 leading-tight" :class="row.original.Status_Display != 'Aktif' || row.original.Status_Properti != 'Tersedia' ? 'text-slate-600' : 'group-hover:text-primary'">
            <RouterLink :to="`/properti/detail/${row.original.Slug}`">{{ row.original.Nama_Produk }}</RouterLink>
          </h6>

          <p class="text-[13px] font-medium text-slate-500 leading-none mb-4">
            {{ row.original.Tipe }} &bull; Tipe {{ row.original.Luas_Bangunan }} <span class="opacity-70">[Uk {{ row.original.Tipe_Ukuran }}]</span>
          </p>

          <div class="grid grid-cols-2 gap-4 rounded-xl p-3 mb-5 border" :class="row.original.Status_Display != 'Aktif' || row.original.Status_Properti != 'Tersedia' ? 'bg-slate-100 border-slate-200' : 'bg-slate-50 border-slate-100'">
            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:home" class="size-4 text-slate-400" /> <span class="text-xs font-semibold text-slate-600">LB {{ row.original.Luas_Bangunan }}<span class="text-[10px]">m²</span></span>
            </div>
            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:land-plot" class="size-4 text-slate-400" /> <span class="text-xs font-semibold text-slate-600">LT {{ row.original.Luas_Tanah }}<span class="text-[10px]">m²</span></span>
            </div>
            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:bed" class="size-4 text-slate-400" /> <span class="text-xs font-semibold text-slate-600">{{ row.original.Jumlah_Kamar_Tidur }} K.Tidur</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:bath" class="size-4 text-slate-400" /> <span class="text-xs font-semibold text-slate-600">{{ row.original.Jumlah_Kamar_Mandi }} K.Mandi</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:car" class="size-4 text-slate-400" /> <span class="text-xs font-semibold text-slate-600">{{ row.original.Jumlah_Carpot }} Mobil</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:layers" class="size-4 text-slate-400" /> <span class="text-xs font-semibold text-slate-600">{{ row.original.Jumlah_Lantai }} Lantai</span>
            </div>
          </div>

          <div class="mt-auto pt-4 border-t flex items-end justify-between gap-3" :class="row.original.Status_Display != 'Aktif' || row.original.Status_Properti != 'Tersedia' ? 'border-slate-200' : 'border-slate-100'">
            <div class="flex flex-col gap-1.5 w-full">
              <div v-if="row.original.Harga_Sewa1 > 0" class="flex flex-col">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                  Harga Sewa
                  <span v-if="row.original.Minimal_Sewa != 0 && row.original.Satuan_Minimal_Sewa != ''">(Min. {{ row.original.Minimal_Sewa }} {{ row.original.Satuan_Minimal_Sewa }})</span>
                </span>

                <div class="flex flex-col gap-0.5">
                  <div class="flex items-end gap-1.5">
                    <span :class="['font-bold tracking-tight', row.original.Status_Display != 'Aktif' || row.original.Status_Properti != 'Tersedia' ? 'text-slate-400 font-medium' : 'text-slate-800 text-base font-black']">
                      {{ formatCurrency(row.original.Harga_Sewa2 > 0 ? row.original.Harga_Sewa2 : row.original.Harga_Sewa1) }}
                    </span>

                    <span v-if="row.original.Harga_Sewa2 > 0" class="text-[11px] text-slate-400 line-through mb-0.5 decoration-slate-300">
                      {{ formatCurrency(row.original.Harga_Sewa1) }}
                    </span>

                    <span class="text-[10px] text-slate-500 font-medium mb-0.5 lowercase italic"> /{{ row.original.Satuan_Minimal_Sewa || 'thn' }} </span>
                  </div>

                  <div v-if="row.original.Harga_Sewa2 > 0" class="flex">
                    <span class="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase tracking-tighter"> Promo Hemat </span>
                  </div>
                </div>
              </div>

              <div v-if="row.original.Harga_Jual1 > 0 && row.original.Harga_Sewa1 > 0" class="w-full h-px my-0.5" :class="row.original.Status_Display != 'Aktif' || row.original.Status_Properti != 'Tersedia' ? 'bg-slate-200' : 'bg-slate-100'"></div>

              <div v-if="row.original.Harga_Jual1 > 0" class="flex flex-col">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Harga Jual</span>
                <div v-if="row.original.Harga_Jual2 > 0" class="flex items-center gap-2 flex-wrap">
                  <span class="text-base font-black leading-none" :class="row.original.Status_Display != 'Aktif' || row.original.Status_Properti != 'Tersedia' ? 'text-slate-600' : 'text-primary'">{{ formatCurrency(row.original.Harga_Jual2) }}</span>
                  <span class="text-[11px] text-red-400 line-through font-medium">{{ formatCurrency(row.original.Harga_Jual1) }}</span>
                </div>
                <span v-else class="text-base font-black leading-none" :class="row.original.Status_Display != 'Aktif' || row.original.Status_Properti != 'Tersedia' ? 'text-slate-600' : 'text-primary'">{{ formatCurrency(row.original.Harga_Jual1) }}</span>
              </div>
            </div>
          </div>

          <div class="mt-3 flex items-end justify-between gap-3">
            <div class="flex flex-col gap-1.5 w-full"></div>
            <div class="relative flex-shrink-0 z-10">
              <button type="button" @click.stop="toggleDropdown(row.id)" class="size-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm relative z-20">
                <Icon icon="lucide:more-vertical" class="size-5" />
              </button>

              <div v-show="activeDropdownId === row.id" class="absolute right-0 bottom-12 z-[100] min-w-[180px] bg-white p-1.5 shadow-xl border border-slate-100 rounded-xl" role="menu">
                <button @click="updateStatusTransaksi(row.original, 'Terjual')" v-if="row.original.Status_Transaksi.includes('Jual') && row.original.Status_Properti != 'Terjual'" class="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Icon icon="lucide:badge-check" class="size-4" /> Sudah Terjual</button>
                <button @click="updateStatusTransaksi(row.original, 'Tersedia')" v-if="row.original.Status_Transaksi.includes('Jual') && row.original.Status_Properti === 'Terjual'" class="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Icon icon="lucide:circle-x" class="size-4" /> Batal Terjual</button>
                <button @click="updateStatusTransaksi(row.original, 'Tersewa')" v-if="row.original.Status_Transaksi.includes('Sewa') && row.original.Status_Properti != 'Tersewa'" class="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Icon icon="lucide:key" class="size-4" /> Sudah Tersewa</button>
                <button @click="updateStatusTransaksi(row.original, 'Tersedia')" v-if="row.original.Status_Transaksi.includes('Sewa') && row.original.Status_Properti === 'Tersewa'" class="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Icon icon="lucide:circle-x" class="size-4" /> Batal Tersewa</button>
                <button @click="openEditModal(row.original)" class="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"><Icon icon="lucide:pencil" class="size-4" /> Edit</button>
                <button @click="deleteProduct(row.original)" class="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-0.5"><Icon icon="lucide:trash-2" class="size-4" /> Hapus</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap md:justify-between justify-center items-center gap-4 mt-10 pb-10">
      <p class="text-default-500 text-sm">
        Menampilkan <b>{{ table.getFilteredRowModel().rows.length != 0 ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 : '0' }}</b> sampai <b>{{ Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length) }}</b> dari <b>{{ table.getFilteredRowModel().rows.length }}</b> data
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

    <Modal v-model:showModal="isModalOpen" :itemData="selectedItem" @success="fetchData" @close="console.log('tutup')" />
  </div>
</template>
