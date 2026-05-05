<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-center bg-white p-4 mb-5 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 gap-4 mb-2">
      <div class="text-sm text-slate-800 font-medium px-2">
        Menampilkan Daftar <span class="text-bejo-600 font-black text-base">{{ table.getFilteredRowModel().rows.length }}</span> Properti
      </div>

      <div class="grid grid-cols-2 sm:flex sm:items-center gap-3 w-full sm:w-auto relative mb-6 sm:mb-0">
        <button @click="$emit('openFilter')" class="lg:hidden flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-bejo-100 rounded-xl bg-bejo-50 text-sm font-bold text-bejo-700 hover:bg-bejo-100 transition-colors"><Icon icon="lucide:filter" class="size-4" /> Filter</button>

        <div id="transaksi-container" class="relative flex-1 sm:flex-none">
          <button @click="isTransaksiOpen = !isTransaksiOpen" class="w-full flex items-center justify-between gap-3 px-4 py-2 border border-bejo-100 rounded-xl bg-white text-sm font-bold hover:bg-bejo-50 hover:border-bejo-200 transition-all text-slate-700">
            <div class="flex items-center gap-2">
              <Icon icon="lucide:tag" class="size-4 text-bejo-600" />
              <span>{{ transactionType }}</span>
            </div>
            <Icon icon="lucide:chevron-down" class="size-4 opacity-50" />
          </button>

          <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <div v-show="isTransaksiOpen" class="absolute right-0 top-full mt-2 z-50 min-w-[180px] bg-white border border-slate-200 shadow-xl shadow-slate-200/50 p-2 rounded-2xl">
              <button @click="handleTransaksi('Semua Label')" class="dropdown-item">Semua Label</button>
              <hr class="my-2 border-slate-100" />
              <button @click="handleTransaksi('Jual Saja')" class="dropdown-item">Jual Saja</button>
              <button @click="handleTransaksi('Sewa Saja')" class="dropdown-item">Sewa Saja</button>
              <button @click="handleTransaksi('Jual & Sewa')" class="dropdown-item">Jual & Sewa</button>
            </div>
          </Transition>
        </div>

        <div id="type-container" class="relative flex-1 sm:flex-none">
          <button @click="isTypeOpen = !isTypeOpen" class="w-full flex items-center justify-between gap-3 px-4 py-2 border border-bejo-100 rounded-xl bg-white text-sm font-bold hover:bg-bejo-50 hover:border-bejo-200 transition-all text-slate-700">
            <div class="flex items-center gap-2">
              <Icon icon="lucide:home" class="size-4 text-bejo-600" />
              <span>{{ selectedType }}</span>
            </div>
            <Icon icon="lucide:chevron-down" class="size-4 opacity-50" />
          </button>

          <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <div v-show="isTypeOpen" class="absolute left-0 sm:right-0 top-full mt-2 z-50 min-w-[180px] max-h-60 overflow-y-auto bg-white border border-slate-200 shadow-xl shadow-slate-200/50 p-2 rounded-2xl custom-scroll">
              <button @click="handleType('Semua Tipe')" class="dropdown-item">Semua Tipe</button>
              <hr class="my-2 border-slate-100" />
              <button v-for="t in propertyTypes" :key="t" @click="handleType(t)" class="dropdown-item flex items-center justify-between">
                {{ t }} <Icon v-if="selectedType === t" icon="lucide:check" class="size-3 text-bejo-600" />
              </button>
            </div>
          </Transition>
        </div>

        <div id="sorting-container" class="relative flex-1 sm:flex-none">
          <button @click="isSortOpen = !isSortOpen" class="w-full flex items-center justify-between gap-3 px-4 py-2 border border-bejo-100 rounded-xl bg-white text-sm font-bold hover:bg-bejo-50 hover:border-bejo-200 transition-all text-slate-700">
            <div class="flex items-center gap-2">
                <Icon icon="lucide:arrow-up-down" class="size-4 text-bejo-600" />
              <span>{{ selectedSort }}</span>
            </div>
            <Icon icon="lucide:chevron-down" class="size-4 opacity-50" />
          </button>

          <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <div v-show="isSortOpen" class="absolute right-0 top-full mt-2 z-50 min-w-[200px] bg-white border border-slate-200 shadow-lg shadow-slate-200/50 p-2 rounded-2xl">
              <button @click="handleSort('Terbaru')" class="dropdown-item">Terbaru</button>
              <button @click="handleSort('Harga Termurah')" class="dropdown-item">Harga Termurah</button>
              <button @click="handleSort('Harga Termahal')" class="dropdown-item">Harga Termahal</button>
              <hr class="my-2 border-slate-100" />
              <button @click="handleSort('Luas Terbesar')" class="dropdown-item">Luas Terbesar</button>
            </div>
          </Transition>
        </div>

        <!-- Top Pagination -->
        <div class="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-100 shadow-sm sm:flex-none flex-1 justify-center">
          <button @click="handlePageChange('prev')" :disabled="!table.getCanPreviousPage()" class="p-1.5 text-slate-500 hover:text-bejo-600 disabled:opacity-30 transition-colors hover:bg-bejo-50 rounded-lg">
            <Icon icon="lucide:chevron-left" class="size-4" />
          </button>
          <div class="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
            {{ table.getState().pagination.pageIndex + 1 }} / {{ table.getPageCount() }}
          </div>
          <button @click="handlePageChange('next')" :disabled="!table.getCanNextPage()" class="p-1.5 text-slate-500 hover:text-bejo-600 disabled:opacity-30 transition-colors hover:bg-bejo-50 rounded-lg">
            <Icon icon="lucide:chevron-right" class="size-4" />
          </button>
        </div>

        <button v-if="isAdmin" @click="$router.push('/admin/properti/tambah')" class="flex items-center justify-center gap-2 px-6 py-2 bg-bejo-600 text-white rounded-xl text-sm font-bold hover:bg-bejo-700 hover:shadow-lg hover:shadow-bejo-600/30 transition-all flex-1 sm:flex-none shadow-md shadow-bejo-600/10">
          <Icon icon="lucide:plus" class="size-4" /> Tambah
        </button>
      </div>
    </div>

    <!-- Floating Filter Button (Mobile Only) -->
    <div class="lg:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-[50] flex justify-center w-full px-4 pointer-events-none">
      <button 
        @click="$emit('openFilter')" 
        class="pointer-events-auto flex items-center gap-2 px-8 py-3.5 bg-slate-900/90 backdrop-blur-xl text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/40 active:scale-95 transition-all border border-white/10"
      >
        <Icon icon="lucide:filter" class="size-4" />
        Saring Properti
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6">
      <template v-if="isLoading">
        <ProductCard v-for="i in 15" :key="i" :product="{}" is-loading />
      </template>
      <template v-else-if="table.getRowModel().rows.length === 0">
        <div class="col-span-full py-20 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
          <div class="size-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
            <Icon icon="lucide:search-x" class="size-12 text-slate-300" />
          </div>
          <h3 class="text-xl font-black text-slate-900 mb-2">Unit Tidak Ditemukan</h3>
          <p class="text-slate-500 text-sm max-w-sm mb-8 font-medium">Coba sesuaikan filter atau kata kunci pencarian Anda untuk menemukan unit lainnya.</p>
          <button 
            @click="resetFilters" 
            class="px-10 py-3.5 bg-white border border-slate-200 text-bejo-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] transition-all shadow-sm hover:bg-bejo-50 hover:border-bejo-200 active:scale-95"
          >
            Atur Ulang Filter
          </button>
        </div>
      </template>
      <template v-else>
        <ProductCard 
          v-for="row in table.getRowModel().rows" 
          :key="row.id" 
          :product="row.original" 
          :is-admin="isAdmin"
          :active-dropdown-id="activeDropdownId"
          @toggle-dropdown="toggleDropdown"
          @update-status="updateStatusTransaksi"
          @delete="deleteProduct"
          @edit="(slug) => $router.push(`/properti/detail/${slug}`)"
        />
      </template>
    </div>

    <div class="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4 pt-6">
      <p class="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Halaman {{ table.getState().pagination.pageIndex + 1 }} dari {{ table.getPageCount() }}</p>
      <nav class="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
        <button @click="handlePageChange('prev')" :disabled="!table.getCanPreviousPage()" class="p-2 text-slate-500 hover:text-bejo-600 disabled:opacity-30 transition-colors hover:bg-bejo-50 rounded-xl"><Icon icon="lucide:chevron-left" class="size-4" /></button>
        <button v-for="n in table.getPageCount()" :key="n" @click="handlePageChange(n - 1)" :class="['size-8 rounded-xl text-xs font-bold transition-all shadow-sm', table.getState().pagination.pageIndex === n - 1 ? 'bg-bejo-600 text-white shadow-bejo-600/40' : 'text-slate-500 bg-white hover:bg-bejo-50 hover:text-bejo-800 border border-transparent']">
          {{ n }}
        </button>
        <button @click="handlePageChange('next')" :disabled="!table.getCanNextPage()" class="p-2 text-slate-500 hover:text-bejo-600 disabled:opacity-30 transition-colors hover:bg-bejo-50 rounded-xl"><Icon icon="lucide:chevron-right" class="size-4" /></button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'
import ProductCard from '@/components/ProductCard.vue'
import { usePropertyFilters } from '@/composables/usePropertyFilters'
import { useVueTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, type SortingState } from '@tanstack/vue-table'
import { confirm, success, fail } from '@/utils/sweet-alert'

const $router = useRouter()
const isLoading = ref(true)
const isSortOpen = ref(false)
const activeDropdownId = ref<string | null>(null)
const filter = ref('')
const products = ref<Product[]>([])
const sorting = ref<SortingState>([])
const selectedSort = ref('Terbaru')
const isTransaksiOpen = ref(false)
const isTypeOpen = ref(false)
const selectedType = ref('Semua Tipe')

const props = defineProps<{
  isAdmin: boolean
  searchQuery: string
  transactionType: string
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

const emit = defineEmits<{
  (e: 'openFilter'): void
  (e: 'update:transactionType', value: string): void
}>()

const propertyTypes = ['Rumah', 'Tanah', 'Ruko', 'Apartemen', 'Gudang', 'Villa', 'SOHO', 'Pabrik', 'Perkantoran', 'Hotel', 'Rumah Kos', 'Stand', 'Toko', 'Gedung', 'Condotel', 'Lain-lain']

const resetFilters = () => {
  emit('update:transactionType', 'Semua Label')
  selectedType.value = 'Semua Tipe'
  selectedSort.value = 'Terbaru'
  sorting.value = []
  // Jika filter adalah state internal, reset juga
  filter.value = ''
  // Mengirim event reset ke parent jika perlu menyingkronkan searchQuery di GuestLayout
  // Tapi untuk saat ini cukup reset state internal
}

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
  Nama_Kota: string
  Hide_alamat: boolean
  Akses_Jalan: string[]
  File_Image: string[]
  MediaUrls: MediaUrl[]
}

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

const handleTransaksi = (type: string) => {
  emit('update:transactionType', type)
  isTransaksiOpen.value = false
}

const handleType = (type: string) => {
  selectedType.value = type
  isTypeOpen.value = false
}

// Reset ke halaman pertama saat filter atau pencarian berubah
watch([() => props.searchQuery, () => props.transactionType, selectedType, () => props.facilities, () => props.region, () => props.priceRange], () => {
  table.setPageIndex(0)
}, { deep: true })

const filteredProducts = usePropertyFilters(
  products,
  computed(() => props.searchQuery),
  computed(() => props.transactionType),
  selectedType,
  computed(() => props.facilities),
  computed(() => props.region),
  computed(() => props.priceRange),
  computed(() => props.isAdmin)
)

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
  initialState: {
    pagination: { pageSize: 15 }
  }
})

const fetchData = async () => {
  isLoading.value = true
  try {
    const { data } = await api.get('/api/realEstate/getAll', {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    products.value = data.Data
  } catch (err: any) {
    console.error('DATA:', err.response?.data)
  } finally {
    isLoading.value = false
  }
}

const toggleDropdown = (id: string) => {
  activeDropdownId.value = activeDropdownId.value === id ? null : id
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

const deleteProduct = async (data: Product) => {
  confirm('Apakah Anda ingin menghapus data ini?', async () => {
    try {
      const res = await api.delete('/api/mediacloud/delete-batch', {
        data: { ids: [...data.File_Image] },
        headers: { 'X-Jenis-User': 'admin' }
      })
      const successMedia: string[] = res.data?.Success || []
      const semuaTerhapus = data.File_Image.every((id: string) => successMedia.includes(id))

      if (!semuaTerhapus) {
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

// Click outside logic
window.addEventListener('click', (e) => {
  if (!(e.target as Element).closest('.group')) activeDropdownId.value = null
  const target = e.target as HTMLElement
  if (!target.closest('#sorting-container')) {
    isSortOpen.value = false
  }
  if (!target.closest('#transaksi-container')) {
    isTransaksiOpen.value = false
  }
  if (!target.closest('#type-container')) {
    isTypeOpen.value = false
  }
})

onMounted(async () => {
  await fetchData()
  nextTick(() => {
    window.HSStaticMethods?.autoInit()
  })
})
</script>

<style scoped>
@reference "@/assets/css/style.css";
.dropdown-item {
  @apply w-full text-left p-2 hover:bg-bejo-50 hover:text-bejo-700 text-sm font-semibold text-slate-700 transition-colors rounded-none;
}
.admin-dropdown-item {
  @apply w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-bejo-50 hover:text-bejo-700 transition-colors text-left rounded-none;
}
</style>
