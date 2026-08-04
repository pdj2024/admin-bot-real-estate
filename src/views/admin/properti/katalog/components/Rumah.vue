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
const transactionFilter = computed({
  get: () => props.transactionType,
  set: (val) => emit('update:transactionType', val)
})
const selectedItem = ref<Product | null>(null)
const sorting = ref<SortingState>([])
const selectedSort = ref('Terbaru')
const typeFilter = ref('Semua')
const isTypeOpen = ref(false)
const isLoading = ref(true)

const customers = ref<any[]>([])
const showTxModal = ref(false)
const txProduct = ref<any>(null)
const txStatus = ref('Terjual')
const txDate = ref('')
const txCustomerId = ref('')
const txSearchCustomer = ref('')
const isTxCustomerDropdownOpen = ref(false)
const isSavingTx = ref(false)

// Serah Terima State
const showSerahTerimaModal = ref(false)
const serahTerimaProduct = ref<any>(null)
const serahTerimaDate = ref('')
const isSavingSerahTerima = ref(false)


const props = defineProps<{
  searchQuery: string
  facilities: {
    kamarTidur: string
    kamarMandi: string
    carport: string
    lantai: string
    rowJalanMin?: string
    rowJalanMax?: string
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
  transactionType: string
  statusSelection: string
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
  Row_Jalan?: number
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
  Latitude: string
  Longitude: string
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
  getRowId: (row) => row.No_Id,
  initialState: {
    pagination: { pageSize: 12 }
  }
})

// Reset ke halaman pertama saat filter atau pencarian berubah
watch([() => props.searchQuery, transactionFilter, typeFilter, () => props.facilities, () => props.region, () => props.priceRange], () => {
  table.setPageIndex(0)
}, { deep: true })

// Helper to build query parameters
const buildParams = () => {
  const p = new URLSearchParams()
  
  // Default sorting for admin
  p.append('orderby', 'no_id')
  p.append('orderdir', 'asc')

  // Dynamic Filters from Props/State
  if (props.searchQuery) p.append('nama_produk', props.searchQuery)
  if (typeFilter.value && typeFilter.value !== 'Semua') p.append('tipe', typeFilter.value)
  
  // Transaction Type Mapping
  if (transactionFilter.value === 'Jual') {
    p.append('status_transaksi', '["Jual"]')
  } else if (transactionFilter.value === 'Sewa') {
    p.append('status_transaksi', '["Sewa"]')
  } else if (transactionFilter.value === 'Jual & Sewa') {
    p.append('status_transaksi', '["Jual","Sewa"]')
  }

  // Status Properti Mapping
  if (props.statusSelection === 'Draft') {
    p.append('status_display', 'Draft')
  } else if (props.statusSelection === 'Tersedia') {
    p.append('status_display', 'Aktif')
    p.append('status_properti', 'Tersedia')
  } else if (props.statusSelection === 'Terjual') {
    p.append('status_display', 'Aktif')
    p.append('status_properti', 'Terjual')
  } else if (props.statusSelection === 'Tersewa') {
    p.append('status_display', 'Aktif')
    p.append('status_properti', 'Tersewa')
  }

  // Region & Price
  if (props.region.city) {
    const cleanCity = props.region.city.replace(/\b(kota|kabupaten|kab\.|kab)\b/gi, '').replace(/\s+/g, ' ').trim()
    p.append('kota', cleanCity)
  }
  if (props.priceRange.min) p.append('harga_min', props.priceRange.min)
  if (props.priceRange.max) p.append('harga_max', props.priceRange.max)
  if (props.facilities.rowJalanMin) p.append('row_jalan_min', String(props.facilities.rowJalanMin))
  if (props.facilities.rowJalanMax) p.append('row_jalan_max', String(props.facilities.rowJalanMax))
  if (props.facilities.kamarTidur) p.append('jumlah_kamar_tidur_min', String(props.facilities.kamarTidur))
  if (props.facilities.kamarMandi) p.append('jumlah_kamar_mandi_min', String(props.facilities.kamarMandi))
  if (props.facilities.carport) p.append('jumlah_carpot_min', String(props.facilities.carport))
  if (props.facilities.lantai) p.append('jumlah_lantai_min', String(props.facilities.lantai))

  return p.toString()
}

const fetchCustomers = async () => {
  try {
    const { data } = await api.get('/api/customer/getAll', {
      headers: {
        'X-Jenis-User': 'Admin',
        'Api-Key': 'realestate_key_2024'
      }
    })
    customers.value = data.Data || []
  } catch (err) {
    console.error('Gagal mengambil data customer:', err)
  }
}

const resolveCustomerNames = (rawProducts: any[]) => {
  return rawProducts.map((p: any) => {
    if (p.Id_Customer) {
      const found = customers.value.find((c: any) => c.No_Id === p.Id_Customer)
      if (found) {
        p.Nama_Customer = found.Nama_Display || found.Nama_Customer || found.Nama
      }
    }
    return p
  })
}

const fetchData = async (backgroundRefetch = false) => {
  if (!backgroundRefetch) isLoading.value = true
  try {
    const query = buildParams()
    const { data } = await api.get(`/api/realEstate/getAll?${query}`, {
      headers: { 'X-Jenis-User': 'admin' }
    })
    const rawProducts = data.Data || []
    products.value = resolveCustomerNames(rawProducts)
  } catch (err: any) {
    console.error('FETCH_ERROR:', err.message)
    products.value = []
    if (err.response?.status === 500) {
      fail('Server sedang bermasalah (500). Silakan coba lagi nanti atau hubungi tim IT.')
    } else {
      fail('Gagal mengambil data properti.')
    }
  } finally {
    if (!backgroundRefetch) isLoading.value = false
  }
}

// Watch for filter changes to refetch data
let fetchTimeout: any = null
watch(
  [() => props.searchQuery, transactionFilter, typeFilter, () => props.region.city, () => props.priceRange, () => props.facilities, () => props.statusSelection],
  () => {
    if (fetchTimeout) clearTimeout(fetchTimeout)
    fetchTimeout = setTimeout(() => {
      fetchData()
      table.setPageIndex(0)
    }, 500) // 500ms debounce
  },
  { deep: true }
)

const updateStatusTransaksi = async (product: any, newStatus: string) => {
  const isDisplayStatus = ['Aktif', 'Draft'].includes(newStatus)
  const statusLabel = isDisplayStatus ? 'display' : 'properti'

  if (newStatus === 'Terjual' || newStatus === 'Tersewa') {
    txProduct.value = { ...product }
    txStatus.value = newStatus
    
    // Initialize with current local datetime
    const d = new Date()
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    txDate.value = d.toISOString().slice(0, 16)
    
    txCustomerId.value = product.Id_Customer || ''
    const foundCust = customers.value.find((c: any) => c.No_Id === product.Id_Customer)
    txSearchCustomer.value = foundCust ? foundCust.Nama_Display : ''
    showTxModal.value = true
    activeDropdownId.value = null
    return
  }

  confirm(`Apakah Anda yakin ingin mengubah status ${statusLabel} menjadi ${newStatus}?`, async () => {
    try {
      if (isDisplayStatus) {
        product.Status_Display = newStatus
      } else {
        product.Status_Properti = newStatus
        
        // Auto-set to Draft if Sold or Rented
        if (newStatus === 'Terjual' || newStatus === 'Tersewa') {
          product.Status_Display = 'Draft'
        }
        
        // Nullify fields if status is cancelled (Tersedia)
        if (newStatus === 'Tersedia') {
          product.Id_Customer = ""
          product.Tanggal_Transaksi = null
          product.Serah_Terima = null
        }
      }

      await api.put('/api/realEstate/update?no_id=' + product.No_Id, product, {
        headers: { 'X-Jenis-User': 'admin' }
      })
      fetchData(true)
      activeDropdownId.value = null
    } catch (error) {
      console.error('Gagal mengubah status:', error)
    }
  })
}

const selectTxCustomer = (customer: any) => {
  txCustomerId.value = customer.No_Id
  txSearchCustomer.value = customer.Nama_Display
  isTxCustomerDropdownOpen.value = false
}

const filteredTxCustomers = computed(() => {
  if (!txSearchCustomer.value) return customers.value
  const query = txSearchCustomer.value.toLowerCase()
  return customers.value.filter((c: any) => {
    return (
      c.Nama_Display?.toLowerCase().includes(query) ||
      c.UserName?.toLowerCase().includes(query) ||
      c.Email?.toLowerCase().includes(query)
    )
  })
})

const submitTransaction = async () => {
  if (!txProduct.value) return
  if (!txCustomerId.value) {
    fail('Silakan pilih customer terlebih dahulu.')
    return
  }
  if (!txDate.value) {
    fail('Silakan pilih tanggal transaksi.')
    return
  }

  isSavingTx.value = true
  try {
    const updatedProduct = { ...txProduct.value }
    updatedProduct.Status_Properti = txStatus.value
    updatedProduct.Status_Display = 'Draft'
    updatedProduct.Id_Customer = txCustomerId.value

    let formattedDate = txDate.value
    if (formattedDate.length === 16) {
      formattedDate = formattedDate + ':00Z'
    } else if (formattedDate.length === 10) {
      formattedDate = formattedDate + 'T00:00:00Z'
    } else if (!formattedDate.endsWith('Z')) {
      formattedDate = formattedDate + 'Z'
    }
    updatedProduct.Tanggal_Transaksi = formattedDate

    await api.put('/api/realEstate/update?no_id=' + updatedProduct.No_Id, updatedProduct, {
      headers: { 'X-Jenis-User': 'admin' }
    })
    showTxModal.value = false
    success(`Transaksi berhasil dicatat`)
    await fetchData(true)
  } catch (error) {
    console.error('Gagal menyimpan transaksi:', error)
    fail('Gagal menyimpan detail transaksi.')
  } finally {
    isSavingTx.value = false
  }
}

const openSerahTerimaModal = (product: any) => {
  serahTerimaProduct.value = { ...product }
  // default to current date if not set
  if (product.Serah_Terima) {
    if (product.Serah_Terima.includes('/')) {
      const rawDate = product.Serah_Terima.split(' ')[0].split('/')
      if (rawDate.length === 3) {
        // 07/01/2026 -> 2026-01-07
        serahTerimaDate.value = `${rawDate[2]}-${rawDate[1]}-${rawDate[0]}T00:00`
      } else {
        serahTerimaDate.value = product.Serah_Terima.slice(0, 16)
      }
    } else {
      serahTerimaDate.value = product.Serah_Terima.slice(0, 16)
    }
  } else {
    const d = new Date()
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    serahTerimaDate.value = d.toISOString().slice(0, 16)
  }
  showSerahTerimaModal.value = true
}

const submitSerahTerima = async () => {
  if (!serahTerimaProduct.value || !serahTerimaDate.value) return
  isSavingSerahTerima.value = true
  try {
    const updatedProduct = { ...serahTerimaProduct.value }
    let formattedDate = serahTerimaDate.value
    if (formattedDate.length === 16) {
      formattedDate = formattedDate + ':00Z'
    } else if (formattedDate.length === 10) {
      formattedDate = formattedDate + 'T00:00:00Z'
    } else if (!formattedDate.endsWith('Z')) {
      formattedDate = formattedDate + 'Z'
    }
    updatedProduct.Serah_Terima = formattedDate

    await api.put('/api/realEstate/update?no_id=' + updatedProduct.No_Id, updatedProduct, {
      headers: { 'X-Jenis-User': 'admin' }
    })
    showSerahTerimaModal.value = false
    success(`Tanggal Serah Terima berhasil dicatat`)
    await fetchData(true)
  } catch (error) {
    console.error('Gagal menyimpan serah terima:', error)
    fail('Gagal menyimpan tanggal serah terima.')
  } finally {
    isSavingSerahTerima.value = false
  }
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
      const imageIds: string[] = []
      const collectIds = (list: any) => {
        if (Array.isArray(list)) {
          list.forEach((id: any) => {
            if (id && typeof id === 'string' && id.trim() !== '') imageIds.push(id.trim())
          })
        } else if (typeof list === 'string' && list.trim() !== '') {
          imageIds.push(list.trim())
        }
      }

      collectIds(data.File_Image)
      collectIds((data as any).Id_Media_Denah)
      collectIds((data as any).Id_Media_3d)
      collectIds((data as any).Id_Media_Drive)
      collectIds((data as any).Id_Media_Thumbnail)

      if (Array.isArray(data.MediaUrls)) {
        data.MediaUrls.forEach((m: any) => {
          const id = m?.Id_Media || m?.No_Id_Media
          if (id && typeof id === 'string' && id.trim() !== '') imageIds.push(id.trim())
        })
      }

      const uniqueImageIds = [...new Set(imageIds)]

      if (uniqueImageIds.length > 0) {
        const res = await api.delete('/api/mediacloud/delete-batch', {
          data: { ids: uniqueImageIds },
          headers: { 'X-Jenis-User': 'admin' }
        })
        const successMedia: string[] = res.data?.Success || []
        if (!uniqueImageIds.every((id: string) => successMedia.includes(id))) {
          fail('Beberapa gambar gagal dihapus')
          return
        }
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
    isTxCustomerDropdownOpen.value = false
  }
})

onMounted(async () => {
  await fetchCustomers()
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
  (e: 'update:transactionType', value: string): void
  (e: 'update:statusSelection', value: string): void
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
    <div class="sticky top-[72px] lg:top-20 z-40 flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 print:hidden border-b border-slate-50 pb-6 bg-white/90 backdrop-blur-md -mx-4 px-4 py-4 rounded-b-2xl shadow-sm shadow-slate-100/50">
      <div>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
          Ditemukan <span class="text-bejo-600">{{ table.getFilteredRowModel().rows.length }}</span> Properti Tersedia
        </p>
      </div>

      <div class="flex flex-col sm:flex-row sm:flex-wrap items-center gap-3 w-full lg:w-auto">
        <!-- Row 1: Filter, Transaction, Type -->
        <div class="grid grid-cols-4 gap-2 w-full sm:w-auto sm:flex sm:items-center sm:gap-3">
          <button type="button" @click="emit('openFilter')" class="xl:hidden px-4 py-2.5 bg-bejo-600 text-white rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider hover:bg-bejo-700 transition-all shadow-md shadow-bejo-600/20 flex items-center justify-center gap-1.5 btn-trigger-filter min-w-[80px]">
            <Icon icon="lucide:filter" class="size-4" />
            Filter
          </button>

          <div class="relative inline-flex">
            <button type="button" @click="isTransactionOpen = !isTransactionOpen" class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-[11px] font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm uppercase tracking-wider truncate">
              <Icon icon="lucide:tag" class="size-4 me-1.5 inline text-bejo-600" />
              {{ transactionFilter }}
            </button>
            <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
              <div v-show="isTransactionOpen" class="absolute right-0 top-full mt-2 z-50 min-w-40 bg-white border border-slate-100 rounded-2xl shadow-2xl p-2">
                <button @click="handleTransactionFilter('Semua')" class="w-full text-left rounded-xl p-3 hover:bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest transition-colors flex items-center justify-between">Semua <Icon v-if="transactionFilter === 'Semua'" icon="lucide:check" class="size-3 text-bejo-600" /></button>
                <button @click="handleTransactionFilter('Jual')" class="w-full text-left rounded-xl p-3 hover:bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest transition-colors flex items-center justify-between">Jual Saja <Icon v-if="transactionFilter === 'Jual'" icon="lucide:check" class="size-3 text-bejo-600" /></button>
                <button @click="handleTransactionFilter('Sewa')" class="w-full text-left rounded-xl p-3 hover:bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest transition-colors flex items-center justify-between">Sewa Saja <Icon v-if="transactionFilter === 'Sewa'" icon="lucide:check" class="size-3 text-bejo-600" /></button>
                <button @click="handleTransactionFilter('Jual & Sewa')" class="w-full text-left rounded-xl p-3 hover:bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest transition-colors flex items-center justify-between">Jual & Sewa <Icon v-if="transactionFilter === 'Jual & Sewa'" icon="lucide:check" class="size-3 text-bejo-600" /></button>
              </div>
            </Transition>
          </div>

          <div class="relative inline-flex">
            <button type="button" @click="isTypeOpen = !isTypeOpen" class="w-full px-2 sm:px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-[11px] font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm uppercase tracking-wider truncate">
              <Icon icon="lucide:home" class="size-3.5 me-1.5 inline text-bejo-600" />
              {{ typeFilter === 'Semua' ? 'Semua Tipe' : typeFilter }}
            </button>
            <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
              <div v-show="isTypeOpen" class="absolute right-0 top-full mt-2 z-50 min-w-48 max-h-60 overflow-y-auto bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 custom-scroll">
                <button @click="handleTypeFilter('Semua')" class="w-full text-left rounded-xl p-3 hover:bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest transition-colors flex items-center justify-between">Semua Tipe <Icon v-if="typeFilter === 'Semua'" icon="lucide:check" class="size-3 text-bejo-600" /></button>
                <button v-for="t in propertyTypes" :key="t" @click="handleTypeFilter(t)" class="w-full text-left rounded-xl p-3 hover:bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest transition-colors flex items-center justify-between">{{ t }} <Icon v-if="typeFilter === t" icon="lucide:check" class="size-3 text-bejo-600" /></button>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Row 2: Sort, Pagination, Add Unit -->
        <div class="grid grid-cols-3 gap-2 w-full sm:w-auto sm:flex sm:items-center sm:gap-3">
          <div class="relative inline-flex">
            <button type="button" @click="isSortOpen = !isSortOpen" class="w-full px-2 sm:px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-[11px] font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm uppercase tracking-wider truncate">
              <Icon icon="lucide:arrow-up-down" class="size-3.5 me-1.5 inline text-bejo-600" />
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

          <div class="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm justify-center">
            <button @click="handlePageChange('prev')" :disabled="!table.getCanPreviousPage()" class="p-1 px-1.5 text-[9px] sm:text-[10px] font-black text-slate-500 hover:text-bejo-600 disabled:opacity-30 transition-colors hover:bg-slate-50 rounded-lg uppercase tracking-wider">
              Prev
            </button>
            <div class="px-1 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap border-x border-slate-100">
              {{ table.getState().pagination.pageIndex + 1 }}/{{ table.getPageCount() }}
            </div>
            <button @click="handlePageChange('next')" :disabled="!table.getCanNextPage()" class="p-1 px-1.5 text-[9px] sm:text-[10px] font-black text-slate-500 hover:text-bejo-600 disabled:opacity-30 transition-colors hover:bg-slate-50 rounded-lg uppercase tracking-wider">
              Next
            </button>
          </div>

          <button @click="openAddModal" class="px-2 sm:px-5 py-2.5 bg-bejo-600 text-white rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-bejo-700 hover:shadow-lg hover:shadow-bejo-600/30 transition-all flex items-center justify-center gap-1.5">
            <Icon icon="lucide:plus" class="size-3.5" />
            Properti
          </button>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      <ProductCard v-for="i in 15" :key="i" :product="{}" is-loading />
    </div>

    <div v-else-if="table.getFilteredRowModel().rows.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
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
        @serahTerima="openSerahTerimaModal"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200 text-center px-6">
      <div class="size-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
        <Icon icon="lucide:search-x" class="size-12 text-slate-300" />
      </div>
      <h3 class="text-xl font-black text-slate-900 mb-2">Unit Tidak Ditemukan</h3>
      <p class="text-slate-500 text-sm max-w-sm mb-8 font-medium">Coba sesuaikan filter atau kata kunci pencarian Anda untuk menemukan unit lainnya.</p>
      <button 
        v-if="isAnyFilterActive"
        @click="handleReset"
        class="px-10 py-3.5 bg-white border border-slate-200 text-bejo-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] transition-all shadow-sm hover:bg-bejo-50 hover:border-bejo-200 active:scale-95 flex items-center gap-2"
      >
        Atur Ulang Filter
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

    <!-- Modal Detail Transaksi (Terjual / Tersewa) -->
    <Transition 
      enter-active-class="transition duration-300 ease-out" 
      enter-from-class="opacity-0" 
      enter-to-class="opacity-100" 
      leave-active-class="transition duration-200 ease-in" 
      leave-from-class="opacity-100" 
      leave-to-class="opacity-0"
    >
      <div v-show="showTxModal" class="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div class="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-50 flex flex-col z-10 animate-fade-in-up">
          <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white rounded-t-[2.5rem]">
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-2xl bg-gradient-to-br from-bejo-50 to-bejo-100 flex items-center justify-center text-bejo-600 shadow-sm border border-bejo-100/50">
                <Icon :icon="txStatus === 'Terjual' ? 'lucide:badge-check' : 'lucide:key'" class="size-5" />
              </div>
              <div>
                <h3 class="text-slate-900 font-extrabold text-base tracking-tight leading-tight">Detail Transaksi {{ txStatus }}</h3>
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Simpan informasi penjualan/penyewaan</p>
              </div>
            </div>
            <button @click="showTxModal = false" class="size-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100 shadow-sm active:scale-95">
              <Icon icon="lucide:x" class="size-5" />
            </button>
          </div>

          <div class="px-6 py-6 space-y-4 bg-slate-50/10">
            <!-- Info Unit -->
            <div v-if="txProduct" class="p-3.5 bg-bejo-50/30 border border-bejo-100/50 rounded-2xl">
              <span class="text-[9px] font-black text-bejo-600 uppercase tracking-wider block mb-1">Unit Properti</span>
              <span class="font-extrabold text-slate-800 text-sm block leading-snug">{{ txProduct.Nama_Produk }}</span>
              <span class="text-xs font-semibold text-slate-400 block mt-0.5">{{ txProduct.Alamat }}</span>
            </div>

            <!-- Pilih Customer (Searchable Dropdown) -->
            <div class="space-y-1.5 relative">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Customer</label>
              <div class="relative">
                <input 
                  type="text" 
                  v-model="txSearchCustomer" 
                  placeholder="Cari nama/username customer..." 
                  class="w-full border border-slate-200 rounded-xl py-2.5 pl-10 pr-10 text-xs font-bold text-slate-700 bg-white focus:ring-4 focus:ring-bejo-600/10 focus:border-bejo-600 transition-all outline-none"
                  @focus="isTxCustomerDropdownOpen = true"
                />
                <Icon icon="lucide:user" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none" />
                
                <button 
                  v-if="txCustomerId" 
                  type="button"
                  @click="txCustomerId = ''; txSearchCustomer = ''"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                >
                  <Icon icon="lucide:x" class="size-4" />
                </button>
                <button 
                  v-else
                  type="button"
                  @click.stop="isTxCustomerDropdownOpen = !isTxCustomerDropdownOpen"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <Icon :icon="isTxCustomerDropdownOpen ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="size-4" />
                </button>
              </div>

              <!-- Customer Dropdown List -->
              <Transition
                enter-active-class="transition duration-100 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in"
                leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0"
              >
                <div 
                  v-show="isTxCustomerDropdownOpen" 
                  class="absolute z-[1000] left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-48 overflow-y-auto custom-scroll p-1.5"
                >
                  <div v-if="filteredTxCustomers.length === 0" class="p-3 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                    Customer tidak ditemukan
                  </div>
                  <button
                    v-for="c in filteredTxCustomers"
                    :key="c.No_Id"
                    type="button"
                    @click="selectTxCustomer(c)"
                    class="w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-700 rounded-xl hover:bg-bejo-50 hover:text-bejo-600 transition-all flex items-center justify-between"
                    :class="txCustomerId === c.No_Id ? 'bg-bejo-50 text-bejo-600' : ''"
                  >
                    <div class="flex flex-col">
                      <span>{{ c.Nama_Display }}</span>
                      <span class="text-[9px] text-slate-400 font-semibold mt-0.5">@{{ c.UserName }} | {{ c.Email }}</span>
                    </div>
                    <Icon v-if="txCustomerId === c.No_Id" icon="lucide:check" class="size-4 text-bejo-600" />
                  </button>
                </div>
              </Transition>
            </div>

            <!-- Tanggal Transaksi -->
            <div class="space-y-1.5">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Transaksi</label>
              <div class="relative">
                <input 
                  type="datetime-local" 
                  v-model="txDate" 
                  class="w-full border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-700 bg-white focus:ring-4 focus:ring-bejo-600/10 focus:border-bejo-600 transition-all outline-none"
                />
                <Icon icon="lucide:calendar" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none" />
              </div>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-[2.5rem]">
            <button @click="showTxModal = false" class="px-5 py-2.5 text-xs font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors">Batal</button>
            <button 
              :disabled="isSavingTx || !txCustomerId || !txDate" 
              @click="submitTransaction" 
              class="px-6 py-2.5 bg-bejo-600 hover:bg-bejo-700 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-lg shadow-bejo-600/20 active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest"
            >
              <Icon v-if="isSavingTx" icon="lucide:loader-2" class="size-4 animate-spin" />
              <Icon v-else icon="lucide:save" class="size-4" />
              {{ isSavingTx ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal Serah Terima Unit -->
    <Transition 
      enter-active-class="transition duration-300 ease-out" 
      enter-from-class="opacity-0" 
      enter-to-class="opacity-100" 
      leave-active-class="transition duration-200 ease-in" 
      leave-from-class="opacity-100" 
      leave-to-class="opacity-0"
    >
      <div v-show="showSerahTerimaModal" class="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div class="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-slate-50 flex flex-col z-10 animate-fade-in-up">
          <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white rounded-t-[2.5rem]">
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-2xl bg-gradient-to-br from-bejo-50 to-bejo-100 flex items-center justify-center text-bejo-600 shadow-sm border border-bejo-100/50">
                <Icon icon="lucide:handshake" class="size-5" />
              </div>
              <div>
                <h3 class="text-slate-900 font-extrabold text-base tracking-tight leading-tight">Serah Terima Unit</h3>
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Atur Tanggal Serah Terima</p>
              </div>
            </div>
            <button @click="showSerahTerimaModal = false" class="size-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100 shadow-sm active:scale-95">
              <Icon icon="lucide:x" class="size-4" />
            </button>
          </div>

          <div class="p-6 bg-slate-50/50 flex flex-col gap-6">
            <div v-if="serahTerimaProduct" class="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Unit Properti</div>
              <div class="font-bold text-slate-800 text-sm mb-0.5">{{ serahTerimaProduct.Nama_Produk }}</div>
              <div class="text-xs text-slate-500 line-clamp-1">{{ serahTerimaProduct.Alamat }}</div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Serah Terima</label>
              <div class="relative">
                <input 
                  type="datetime-local" 
                  v-model="serahTerimaDate" 
                  class="w-full border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-700 bg-white focus:ring-4 focus:ring-bejo-600/10 focus:border-bejo-600 transition-all outline-none"
                />
                <Icon icon="lucide:calendar" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none" />
              </div>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-[2.5rem]">
            <button @click="showSerahTerimaModal = false" class="px-5 py-2.5 text-xs font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors">Batal</button>
            <button 
              :disabled="isSavingSerahTerima || !serahTerimaDate" 
              @click="submitSerahTerima" 
              class="px-6 py-2.5 bg-bejo-600 hover:bg-bejo-700 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-lg shadow-bejo-600/20 active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest"
            >
              <Icon v-if="isSavingSerahTerima" icon="lucide:loader-2" class="size-4 animate-spin" />
              <Icon v-else icon="lucide:save" class="size-4" />
              {{ isSavingSerahTerima ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

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
