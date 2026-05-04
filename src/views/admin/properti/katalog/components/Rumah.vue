<script setup lang="ts">
import { onMounted, ref, nextTick, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'
import Modal from './Modal.vue'
import ProductCard from '@/components/ProductCard.vue'
import { usePropertyFilters } from '@/composables/usePropertyFilters'
import { useVueTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, type SortingState } from '@tanstack/vue-table'
import { confirm, success, fail } from '@/utils/sweet-alert'


const isModalOpen = ref(false)
const isSortOpen = ref(false)
const isTransactionOpen = ref(false)
const activeDropdownId = ref<string | null>(null)
const filter = ref('')
const products = ref<Product[]>([])
const transactionFilter = ref('Semua')
const selectedItem = ref<Product | null>(null)
const sorting = ref<SortingState>([])
const selectedSort = ref('Terbaru')
const typeFilter = ref('Semua')
const isTypeOpen = ref(false)
const isLoading = ref(true)

const props = defineProps<{
  searchQuery: string
  facilities: {
    kamarTidur: string
    kamarMandi: string
    carport: string
    lantai: string
  }
  region: {
    province: string
    city: string
    provinceId: string
  }
  priceRange: {
    min: string
    max: string
  }
}>()

const propertyTypes = ['Rumah', 'Tanah', 'Ruko', 'Apartemen', 'Gudang', 'Villa', 'SOHO', 'Pabrik', 'Perkantoran', 'Hotel', 'Rumah Kos', 'Stand', 'Toko', 'Gedung', 'Condotel', 'Lain-lain']

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
  Area: string[]
  Nama_Kota: string
  Hide_alamat: boolean
  Akses_Jalan: string[]
  File_Image: string[]
  MediaUrls: MediaUrl[]
}

const toggleDropdown = (id: string) => {
  activeDropdownId.value = activeDropdownId.value === id ? null : id
}

const handleTransactionFilter = (type: string) => {
  transactionFilter.value = type
  isTransactionOpen.value = false
}

const handleTypeFilter = (type: string) => {
  typeFilter.value = type
  isTypeOpen.value = false
}

const filteredProducts = usePropertyFilters(
  products,
  computed(() => props.searchQuery),
  transactionFilter,
  typeFilter,
  computed(() => props.facilities),
  computed(() => props.region),
  computed(() => props.priceRange),
  computed(() => true) // isAdmin is true here
)

const isAnyFilterActive = computed(() => {
  const isSearchActive = !!props.searchQuery?.trim()
  const isTransactionActive = transactionFilter.value !== 'Semua'
  const isTypeActive = typeFilter.value !== 'Semua'
  
  const isFacilitiesActive = !!props.facilities && Object.values(props.facilities).some(v => !!v)
  const isRegionActive = !!props.region && (!!props.region.province || !!props.region.city || !!props.region.provinceId)
  const isPriceActive = !!props.priceRange && (!!props.priceRange.min || !!props.priceRange.max)
  
  return isSearchActive || isTransactionActive || isTypeActive || isFacilitiesActive || isRegionActive || isPriceActive
})

const table = useVueTable({
  get data() {
    return filteredProducts.value
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
  autoResetPageIndex: false,
  initialState: {
    pagination: { pageSize: 15 }
  }
})

// Reset ke halaman pertama saat filter atau pencarian berubah
watch([() => props.searchQuery, transactionFilter, typeFilter, () => props.facilities, () => props.region, () => props.priceRange], () => {
  table.setPageIndex(0)
}, { deep: true })

const fetchData = async () => {
  isLoading.value = true
  try {
    const { data } = await api.get('/api/realEstate/getAll', {
      headers: { 'X-Jenis-User': 'admin' }
    })
    products.value = data.Data || []
  } catch (err: any) {
    console.error('FETCH_ERROR:', err.message)
    products.value = []
    if (err.response?.status === 500) {
      fail('Server sedang bermasalah (500). Silakan coba lagi nanti atau hubungi tim IT.')
    } else {
      fail('Gagal mengambil data properti.')
    }
  } finally {
    isLoading.value = false
  }
}

const updateStatusTransaksi = async (product: any, newStatus: string) => {
  confirm(`Apakah Anda yakin ingin mengubah status menjadi ${newStatus}?`, async () => {
    try {
      product.Status_Properti = newStatus
      
      // Auto-set to Draft if Sold or Rented
      if (newStatus === 'Terjual' || newStatus === 'Tersewa') {
        product.Status_Display = 'Draft'
      }

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

const setSort = (type: string) => {
  selectedSort.value = type
  if (type === 'Harga Termurah') sorting.value = [{ id: 'Harga_Jual1', desc: false }]
  else if (type === 'Harga Termahal') sorting.value = [{ id: 'Harga_Jual1', desc: true }]
  else if (type === 'Luas Terbesar') sorting.value = [{ id: 'Luas_Tanah', desc: true }]
  else sorting.value = []
}

const handleSort = (type: string) => {
  setSort(type)
  isSortOpen.value = false
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
      const res = await api.delete('/api/mediacloud/delete-batch', {
        data: { ids: [...data.File_Image] },
        headers: { 'X-Jenis-User': 'admin' }
      })
      const successMedia: string[] = res.data?.Success || []
      if (!data.File_Image.every((id: string) => successMedia.includes(id))) {
        fail('Beberapa gambar gagal dihapus')
        return
      }
      await api.delete(`/api/realEstate/delete?no_id=${data.No_Id}`, {
        headers: { 'X-Jenis-User': 'admin' }
      })
      fetchData()
      success('Berhasil hapus produk')
    } catch (err: any) {
      fail('Gagal menghapus data')
      console.log(err)
    }
  })
}

window.addEventListener('click', (e) => {
  const target = e.target as HTMLElement
  if (!target.closest('.relative')) {
    activeDropdownId.value = null
    isSortOpen.value = false
    isTransactionOpen.value = false
    isTypeOpen.value = false
  }
})

onMounted(async () => {
  await fetchData()
  nextTick(() => {
    window.HSStaticMethods?.autoInit()
  })
})

const emit = defineEmits<{
  (e: 'openFilter'): void
  (e: 'resetFilter'): void
  (e: 'update:searchQuery', value: string): void
  (e: 'update:facilities', value: any): void
  (e: 'update:region', value: any): void
  (e: 'update:priceRange', value: any): void
}>()

const handlePageChange = async (action: 'prev' | 'next' | number) => {
  isLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 300))
  if (action === 'prev') {
    table.previousPage()
  } else if (action === 'next') {
    table.nextPage()
  } else if (typeof action === 'number') {
    table.setPageIndex(action)
  }
  isLoading.value = false
}

const handleReset = () => {
  emit('resetFilter')
}

defineExpose({ openAddModal })
</script>

<template>
  <div class="lg:col-span-3 col-span-1">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 print:hidden border-b border-slate-50 pb-6">
      <div>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
          Ditemukan <span class="text-bejo-600">{{ table.getFilteredRowModel().rows.length }}</span> Properti Tersedia
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2 sm:gap-3">
        <button type="button" @click="emit('openFilter')" class="lg:hidden px-4 py-2.5 bg-bejo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-bejo-700 transition-all shadow-md shadow-bejo-600/20 flex items-center gap-2 btn-trigger-filter">
          <Icon icon="lucide:settings-2" class="size-3.5" />
          Filter
        </button>

        <div class="relative inline-flex">
          <button type="button" @click="isTransactionOpen = !isTransactionOpen" class="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm uppercase tracking-wider">
            <Icon icon="lucide:filter" class="size-3.5 me-2 inline text-bejo-600" />
            {{ transactionFilter }}
          </button>
          <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <div v-show="isTransactionOpen" class="absolute right-0 top-full mt-2 z-50 min-w-40 bg-white border border-slate-100 rounded-2xl shadow-2xl p-2">
              <button @click="handleTransactionFilter('Semua')" class="w-full text-left rounded-xl p-3 hover:bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest transition-colors flex items-center justify-between">Semua <Icon v-if="transactionFilter === 'Semua'" icon="lucide:check" class="size-3 text-bejo-600" /></button>
              <button @click="handleTransactionFilter('Jual')" class="w-full text-left rounded-xl p-3 hover:bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest transition-colors flex items-center justify-between">Jual Saja <Icon v-if="transactionFilter === 'Jual'" icon="lucide:check" class="size-3 text-bejo-600" /></button>
              <button @click="handleTransactionFilter('Sewa')" class="w-full text-left rounded-xl p-3 hover:bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest transition-colors flex items-center justify-between">Sewa Saja <Icon v-if="transactionFilter === 'Sewa'" icon="lucide:check" class="size-3 text-bejo-600" /></button>
            </div>
          </Transition>
        </div>

        <div class="relative inline-flex">
          <button type="button" @click="isTypeOpen = !isTypeOpen" class="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm uppercase tracking-wider">
            <Icon icon="lucide:home" class="size-3.5 me-2 inline text-bejo-600" />
            {{ typeFilter === 'Semua' ? 'Semua Tipe' : typeFilter }}
          </button>
          <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <div v-show="isTypeOpen" class="absolute right-0 top-full mt-2 z-50 min-w-48 max-h-60 overflow-y-auto bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 custom-scroll">
              <button @click="handleTypeFilter('Semua')" class="w-full text-left rounded-xl p-3 hover:bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest transition-colors flex items-center justify-between">Semua Tipe <Icon v-if="typeFilter === 'Semua'" icon="lucide:check" class="size-3 text-bejo-600" /></button>
              <button v-for="t in propertyTypes" :key="t" @click="handleTypeFilter(t)" class="w-full text-left rounded-xl p-3 hover:bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest transition-colors flex items-center justify-between">{{ t }} <Icon v-if="typeFilter === t" icon="lucide:check" class="size-3 text-bejo-600" /></button>
            </div>
          </Transition>
        </div>

        <div class="relative inline-flex">
          <button type="button" @click="isSortOpen = !isSortOpen" class="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm uppercase tracking-wider">
            <Icon icon="lucide:arrow-up-down" class="size-3.5 me-2 inline text-bejo-600" />
            Urutkan
          </button>
          <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <div v-show="isSortOpen" class="absolute right-0 top-full mt-2 z-50 min-w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl p-2">
              <button @click="handleSort('Terbaru')" class="w-full text-left rounded-xl p-3 hover:bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest transition-colors flex items-center justify-between">Terbaru <Icon v-if="selectedSort === 'Terbaru'" icon="lucide:check" class="size-3 text-bejo-600" /></button>
              <button @click="handleSort('Harga Termurah')" class="w-full text-left rounded-xl p-3 hover:bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest transition-colors flex items-center justify-between">Harga Termurah <Icon v-if="selectedSort === 'Harga Termurah'" icon="lucide:check" class="size-3 text-bejo-600" /></button>
              <button @click="handleSort('Harga Termahal')" class="w-full text-left rounded-xl p-3 hover:bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest transition-colors flex items-center justify-between">Harga Termahal <Icon v-if="selectedSort === 'Harga Termahal'" icon="lucide:check" class="size-3 text-bejo-600" /></button>
            </div>
          </Transition>
        </div>

        <div class="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm sm:flex-none flex-1 justify-center">
          <button @click="handlePageChange('prev')" :disabled="!table.getCanPreviousPage()" class="p-1 px-2 text-[10px] font-black text-slate-500 hover:text-bejo-600 disabled:opacity-30 transition-colors hover:bg-slate-50 rounded-lg uppercase tracking-wider">
            Prev
          </button>
          <div class="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap border-x border-slate-100">
            {{ table.getState().pagination.pageIndex + 1 }} / {{ table.getPageCount() }}
          </div>
          <button @click="handlePageChange('next')" :disabled="!table.getCanNextPage()" class="p-1 px-2 text-[10px] font-black text-slate-500 hover:text-bejo-600 disabled:opacity-30 transition-colors hover:bg-slate-50 rounded-lg uppercase tracking-wider">
            Next
          </button>
        </div>

        <button @click="openAddModal" class="px-5 py-2.5 bg-bejo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-bejo-700 hover:shadow-lg hover:shadow-bejo-600/30 transition-all flex items-center gap-2">
          <Icon icon="lucide:plus" class="size-3.5" />
          Tambah Unit
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6">
      <ProductCard v-for="i in 15" :key="i" :product="{}" is-loading />
    </div>

    <div v-else-if="table.getFilteredRowModel().rows.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6">
      <ProductCard 
        v-for="row in table.getRowModel().rows" 
        :key="row.id" 
        :product="row.original"
        :isAdmin="true"
        :activeDropdownId="activeDropdownId"
        @toggleDropdown="toggleDropdown"
        @updateStatus="updateStatusTransaksi"
        @edit="openEditModal(row.original)"
        @delete="deleteProduct"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 text-center px-6">
      <div class="size-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
        <Icon icon="lucide:search-x" class="size-12 text-slate-300" />
      </div>
      <h3 class="text-xl font-black text-slate-900 mb-2">Properti Tidak Ditemukan</h3>
      <p class="text-slate-500 text-sm max-w-sm mb-8 font-medium">Maaf, kami tidak menemukan properti yang sesuai dengan kriteria filter Anda. Silakan coba hapus beberapa filter atau gunakan kata kunci lain.</p>
      <button 
        v-if="isAnyFilterActive"
        @click="handleReset"
        class="px-8 py-3 bg-[#ca6d2c] hover:bg-[#b05d24] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-[#ca6d2c]/20 active:scale-95 flex items-center gap-2"
      >
        <Icon icon="lucide:rotate-ccw" class="size-4" />
        Hapus Semua Filter
      </button>
    </div>

    <div class="flex flex-wrap md:justify-between justify-center items-center gap-4 mt-10 pb-10 border-t border-default-100 pt-6">
      <p class="text-default-500 text-xs">
        Menampilkan <b>{{ table.getFilteredRowModel().rows.length != 0 ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 : '0' }}</b> - <b>{{ Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length) }}</b> dari <b>{{ table.getFilteredRowModel().rows.length }}</b>
      </p>

      <nav class="flex items-center gap-1">
        <button @click="handlePageChange('prev')" :disabled="!table.getCanPreviousPage()" class="btn-pagination">Prev</button>
        <button v-for="n in table.getPageCount()" :key="n" @click="handlePageChange(n - 1)" class="btn-pagination-num" :class="table.getState().pagination.pageIndex === n - 1 ? 'active' : ''">
          {{ n }}
        </button>
        <button @click="handlePageChange('next')" :disabled="!table.getCanNextPage()" class="btn-pagination">Next</button>
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
