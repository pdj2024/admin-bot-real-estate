<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'

const props = defineProps<{
  show: boolean
  currentProduct: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const isLoading = ref(false)
const allProducts = ref<any[]>([])
const searchQuery = ref('')
const selectedCompareProduct = ref<any | null>(null)
const isDropdownOpen = ref(false)

const fetchAllProducts = async () => {
  if (allProducts.value.length > 0) return
  isLoading.value = true
  try {
    const { data } = await api.get('/api/realEstate/getAll')
    // Filter out the current product from comparison options
    allProducts.value = (data || []).filter(
      (p: any) => p.No_Id !== props.currentProduct?.No_Id && p.Status_Display === 'Aktif'
    )
  } catch (error) {
    console.error('Failed to fetch comparison products:', error)
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      fetchAllProducts()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      selectedCompareProduct.value = null
      searchQuery.value = ''
    }
  }
)

const filteredProducts = computed(() => {
  if (!searchQuery.value) return allProducts.value
  return allProducts.value.filter(
    (p: any) =>
      p.Nama_Produk?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.Alamat?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.Tipe?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const selectProduct = (product: any) => {
  selectedCompareProduct.value = product
  isDropdownOpen.value = false
  searchQuery.value = ''
}

const formatCurrency = (value: number) => {
  if (!value) return 'Rp 0'
  if (value >= 1000000000) {
    return `Rp ${(value / 1000000000).toFixed(1)} M`
  }
  if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)} Jt`
  }
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

const getProductImage = (product: any) => {
  if (product?.Media_Url && product.Media_Url.length > 0) {
    return product.Media_Url[0].Url || product.Media_Url[0].ThumbUrl
  }
  return '/placeholder-property.jpg'
}

const compareAttributes = computed(() => {
  if (!props.currentProduct) return []
  const p1 = props.currentProduct
  const p2 = selectedCompareProduct.value

  const getPriceLabel = (p: any) => {
    if (!p) return '-'
    const isSewa = p.Status_Transaksi?.includes('Sewa')
    const isJual = p.Status_Transaksi?.includes('Jual')
    
    if (isJual && p.Harga_Jual1 > 0) {
      return formatCurrency(p.Harga_Jual1)
    }
    if (isSewa && p.Harga_Sewa1 > 0) {
      return `${formatCurrency(p.Harga_Sewa1)} / ${p.Satuan_Minimal_Sewa || 'Tahun'}`
    }
    return '-'
  }

  return [
    {
      label: 'Harga Utama',
      val1: getPriceLabel(p1),
      val2: getPriceLabel(p2),
    },
    {
      label: 'Tipe Properti',
      val1: p1.Tipe || '-',
      val2: p2?.Tipe || '-',
    },
    {
      label: 'Luas Tanah',
      val1: p1.Luas_Tanah ? `${p1.Luas_Tanah} m²` : '-',
      val2: p2?.Luas_Tanah ? `${p2.Luas_Tanah} m²` : '-',
    },
    {
      label: 'Luas Bangunan',
      val1: p1.Luas_Bangunan ? `${p1.Luas_Bangunan} m²` : '-',
      val2: p2?.Luas_Bangunan ? `${p2.Luas_Bangunan} m²` : '-',
    },
    {
      label: 'Jumlah Lantai',
      val1: p1.Jumlah_Lantai || '-',
      val2: p2?.Jumlah_Lantai || '-',
    },
    {
      label: 'Kamar Tidur',
      val1: p1.Jumlah_Kamar_Tidur || '-',
      val2: p2?.Jumlah_Kamar_Tidur || '-',
    },
    {
      label: 'Kamar Mandi',
      val1: p1.Jumlah_Kamar_Mandi || '-',
      val2: p2?.Jumlah_Kamar_Mandi || '-',
    },
    {
      label: 'Carpot',
      val1: p1.Jumlah_Carpot || '-',
      val2: p2?.Jumlah_Carpot || '-',
    },
    {
      label: 'Daya Listrik',
      val1: p1.Daya_Listrik ? `${p1.Daya_Listrik} Watt` : '-',
      val2: p2?.Daya_Listrik ? `${p2.Daya_Listrik} Watt` : '-',
    },
    {
      label: 'Sertifikat',
      val1: p1.Jenis_Sertifikat || '-',
      val2: p2?.Jenis_Sertifikat || '-',
    }
  ]
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-100 transform transition-all flex flex-col max-h-[90vh]">
          
          <!-- Header -->
          <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-bejo-50 flex items-center justify-center text-bejo-600 border border-bejo-100 shadow-sm">
                <Icon icon="lucide:arrow-left-right" class="size-5" />
              </div>
              <div>
                <h3 class="text-xl font-black text-slate-800 tracking-tight uppercase">Bandingkan Properti</h3>
                <p class="text-slate-400 font-semibold text-xs tracking-wider uppercase">Analisis kelayakan aset berdampingan</p>
              </div>
            </div>
            <button @click="emit('close')" class="p-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-xl text-slate-400 transition-colors shadow-sm">
              <Icon icon="lucide:x" class="size-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto flex-grow custom-scroll">
            
            <!-- Selector dropdown for second product -->
            <div class="mb-8 max-w-lg mx-auto relative">
              <label class="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2">Pilih Properti Pembanding</label>
              <div class="relative">
                <button 
                  @click="isDropdownOpen = !isDropdownOpen"
                  class="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:border-bejo-600 focus:bg-white transition-all outline-none focus:ring-4 focus:ring-bejo-600/10 shadow-sm"
                >
                  <span :class="selectedCompareProduct ? 'text-slate-800 font-bold' : 'text-slate-400'">
                    {{ selectedCompareProduct?.Nama_Produk || 'Cari properti lain...' }}
                  </span>
                  <Icon icon="lucide:chevron-down" class="size-5 text-slate-400 transition-transform" :class="isDropdownOpen ? 'rotate-180' : ''" />
                </button>

                <!-- Dropdown panel -->
                <div v-if="isDropdownOpen" class="absolute z-10 inset-x-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden scale-in max-h-72 flex flex-col">
                  <div class="p-3 bg-slate-50 border-b border-slate-100">
                    <div class="relative">
                      <Icon icon="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <input 
                        v-model="searchQuery"
                        type="text" 
                        placeholder="Cari nama, tipe, atau lokasi..." 
                        class="w-full pl-9 pr-4 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl outline-none focus:border-bejo-600 transition-all shadow-inner bg-white" 
                      />
                    </div>
                  </div>
                  <div class="overflow-y-auto custom-scroll p-2 flex-grow">
                    <div v-if="isLoading" class="p-4 text-center text-xs font-bold text-slate-400 animate-pulse tracking-widest uppercase">
                      Memuat Data...
                    </div>
                    <template v-else-if="filteredProducts.length">
                      <button 
                        v-for="p in filteredProducts" 
                        :key="p.No_Id"
                        @click="selectProduct(p)"
                        class="w-full flex items-center gap-3 p-3 text-left rounded-xl hover:bg-slate-50 transition-colors group"
                      >
                        <img :src="getProductImage(p)" class="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                        <div class="truncate">
                          <h6 class="text-sm font-bold text-slate-800 truncate">{{ p.Nama_Produk }}</h6>
                          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mt-0.5">{{ p.Tipe }} &bull; {{ p.Alamat }}</span>
                        </div>
                      </button>
                    </template>
                    <div v-else class="p-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Properti tidak ditemukan
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Comparison Grid -->
            <div class="grid grid-cols-1 md:grid-cols-7 gap-6 items-stretch">
              
              <!-- Left: Current Property -->
              <div class="md:col-span-3 bg-white border border-slate-100 rounded-[2rem] p-5 shadow-xl shadow-slate-400/5 flex flex-col items-center text-center">
                <img :src="getProductImage(currentProduct)" class="w-full h-48 rounded-2xl object-cover shadow-md mb-4" />
                <span class="px-3 py-1 bg-bejo-50 text-bejo-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-bejo-100 mb-2 shadow-sm">Properti Sekarang</span>
                <h4 class="text-lg font-black text-slate-800 line-clamp-2 leading-snug">{{ currentProduct?.Nama_Produk }}</h4>
                <p class="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">{{ currentProduct?.Alamat }}</p>
              </div>

              <!-- Center vs Divider -->
              <div class="md:col-span-1 flex flex-row md:flex-col items-center justify-center">
                <div class="w-full md:w-[1px] h-[1px] md:h-full bg-slate-100 flex-grow"></div>
                <div class="size-12 rounded-full bg-gradient-to-br from-bejo-500 to-bejo-700 text-white font-black text-sm flex items-center justify-center shadow-xl shadow-bejo-600/30 my-4 shrink-0">VS</div>
                <div class="w-full md:w-[1px] h-[1px] md:h-full bg-slate-100 flex-grow"></div>
              </div>

              <!-- Right: Compared Property -->
              <div class="md:col-span-3 bg-white border border-slate-100 rounded-[2rem] p-5 shadow-xl shadow-slate-400/5 flex flex-col items-center text-center justify-center">
                <template v-if="selectedCompareProduct">
                  <img :src="getProductImage(selectedCompareProduct)" class="w-full h-48 rounded-2xl object-cover shadow-md mb-4" />
                  <span class="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-200 mb-2 shadow-sm">Pembanding</span>
                  <h4 class="text-lg font-black text-slate-800 line-clamp-2 leading-snug">{{ selectedCompareProduct?.Nama_Produk }}</h4>
                  <p class="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">{{ selectedCompareProduct?.Alamat }}</p>
                </template>
                <div v-else class="flex flex-col items-center justify-center p-10 text-slate-300">
                  <Icon icon="lucide:plus" class="size-12 stroke-1 animate-pulse mb-3" />
                  <span class="text-xs font-bold uppercase tracking-widest">Silakan Pilih<br/>Aset Pembanding</span>
                </div>
              </div>

            </div>

            <!-- Side-by-Side Table -->
            <div class="mt-8 border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <tr>
                    <th class="px-6 py-4">Metrik</th>
                    <th class="px-6 py-4 text-center text-bejo-600 bg-bejo-50/30">Properti A</th>
                    <th class="px-6 py-4 text-center">Properti B</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50 text-slate-700 font-semibold">
                  <tr v-for="attr in compareAttributes" :key="attr.label" class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-3.5 text-xs text-slate-400 uppercase font-black tracking-wider bg-slate-50/20">{{ attr.label }}</td>
                    <td class="px-6 py-3.5 text-center text-sm font-bold text-slate-800 bg-bejo-50/10">{{ attr.val1 }}</td>
                    <td class="px-6 py-3.5 text-center text-sm font-bold" :class="selectedCompareProduct ? 'text-slate-800' : 'text-slate-300'">{{ attr.val2 }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          <!-- Footer -->
          <div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
            <button @click="emit('close')" class="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-300 transition-colors">
              Tutup
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 20px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
