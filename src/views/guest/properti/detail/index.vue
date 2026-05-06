<script setup lang="ts">
import { onMounted, ref, nextTick, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/axios'
import Guest from '@/layouts/guest.vue'
import { Icon } from '@iconify/vue'
import SidebarProduct from './components/SidebarProduct.vue'
import ProductDetails from './components/ProductDetails.vue'
import KprSimulation from './components/KprSimulation.vue'
import SuggestedProducts from './components/SuggestedProducts.vue'
import GoogleMapsViewer from '@/components/common/GoogleMapsViewer.vue'
import CompareModal from '@/components/common/CompareModal.vue'

const showCompareModal = ref(false)

const route = useRoute()

const mapCoords = computed(() => {
  if (!product.value?.Alamat) return null
  console.log('Processing map coordinates from address:', product.value.Alamat)
  
  // Support both "Lat:" and "Latitude:", and "Long:", "Lng:", or "Longitude:"
  const latMatch = product.value.Alamat.match(/(?:Lat|Latitude):\s*([-+]?\d+\.?\d*)/i)
  const lngMatch = product.value.Alamat.match(/(?:Long|Lng|Longitude):\s*([-+]?\d+\.?\d*)/i)
  
  if (latMatch && lngMatch) {
    const coords = {
      lat: parseFloat(latMatch[1]),
      lng: parseFloat(lngMatch[1]) // Fix: Use index 1 for the first capturing group
    }
    console.log('Successfully parsed coordinates:', coords)
    return coords
  }
  
  console.warn('Failed to parse coordinates from address string')
  return null
})

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
  Satuan_Minimal_Sewa: string
  Minimal_Sewa?: string
  Nama_Kota?: string
  Area: string | string[]
  Hide_alamat: boolean
  Akses_Jalan: string[]
  File_Image: string[]
  MediaUrls: MediaUrl[]
  Nama_Area?: string
  Kelurahan?: string
  Kecamatan?: string
}

const product = ref<Product | null>(null)
const suggestions = ref<Product[]>([])
const isLoading = ref(true)

const fetchData = async (currentSlug: string) => {
  isLoading.value = true
  try {
    // Fetch a larger set to ensure we have enough active suggestions
    const { data } = await api.get('/api/realEstate/getAll?limit=20&sort=desc', {
      headers: { 'X-Jenis-User': 'Admin' }
    })

    // 1. Find the main product
    let mainProduct = data.Data.find((p: Product) => p.Slug === currentSlug)
    
    // If not found in the latest 20, fetch specifically by slug
    if (!mainProduct) {
      const { data: exactData } = await api.get('/api/realEstate/getAll?slug=' + currentSlug, {
        headers: { 'X-Jenis-User': 'Admin' }
      })
      mainProduct = exactData.Data[0]
    }
    
    product.value = mainProduct

    // 1.5 Visibility Check for Guest
    const userRole = localStorage.getItem('role_user')
    if (product.value && userRole !== 'admin') {
      if (product.value.Status_Display !== 'Aktif' || product.value.Status_Properti !== 'Tersedia') {
        product.value = null
        isLoading.value = false
        return
      }
    }

    const isJual = product.value?.Status_Transaksi?.includes('Jual')
    const isSewa = product.value?.Status_Transaksi?.includes('Sewa')

    suggestions.value = data.Data
      .filter((p: Product) => {
        if (p.Slug === currentSlug) return false
        if (p.Status_Display !== 'Aktif' || p.Status_Properti !== 'Tersedia') return false
        
        if (isJual && !isSewa) {
          return p.Status_Transaksi?.includes('Jual')
        }
        if (isSewa && !isJual) {
          return p.Status_Transaksi?.includes('Sewa')
        }
        return true
      })
      .slice(0, 3)
      
  } catch (err) {
    console.error('Error fetching product detail:', err)
  } finally {
    isLoading.value = false
  }
}

const isAdmin = computed(() => {
  return localStorage.getItem('role_user') == 'admin' && route.path.startsWith('/properti/detail')
})

// Watch for route changes to refresh data without full page reload
watch(() => route.params.slug, async (newSlug) => {
  if (newSlug) {
    await fetchData(newSlug as string)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

onMounted(async () => {
  await fetchData(route.params.slug as string)
  nextTick(() => {
    window.HSStaticMethods?.autoInit()
  })
})
</script>

<template>
  <Guest>
    <div class="w-full max-w-[1440px] mx-auto !px-4 sm:!px-8 lg:!px-10 py-10 min-h-[60vh]">

      <!-- Skeleton Loading State -->
      <div v-if="isLoading" class="grid lg:grid-cols-3 grid-cols-1 gap-8">
        <!-- Sidebar Skeleton -->
        <div class="flex flex-col gap-6">
          <div class="h-[500px] bg-slate-100 rounded-[2.5rem] animate-pulse"></div>
          <div class="h-32 bg-slate-100 rounded-[2rem] animate-pulse"></div>
        </div>
        <!-- Details Skeleton -->
        <div class="lg:col-span-2 flex flex-col gap-6">
          <div class="h-[600px] bg-slate-100 rounded-[2.5rem] animate-pulse"></div>
          <div class="h-48 bg-slate-100 rounded-[2.5rem] animate-pulse"></div>
        </div>
      </div>
      
      <div v-else-if="product" class="grid lg:grid-cols-12 grid-cols-1 gap-5">
        <SidebarProduct :product="product" :isAdmin="isAdmin" @openCompare="showCompareModal = true" class="lg:col-span-4" />
        <div class="lg:col-span-8 col-span-1 flex flex-col gap-5">
          <ProductDetails :product="product" :isAdmin="isAdmin" class="!col-span-1" />
          
          <!-- Map Section -->
          <div v-if="mapCoords" class="w-full">
            <div class="flex items-center gap-2 mb-4">
              <div class="size-8 bg-bejo-50 rounded-lg flex items-center justify-center border border-bejo-100">
                <Icon icon="lucide:map" class="size-4 text-bejo-600" />
              </div>
              <h3 class="text-sm font-black uppercase tracking-widest text-slate-900">Lokasi Properti</h3>
            </div>
            <GoogleMapsViewer 
              :lat="mapCoords.lat" 
              :lng="mapCoords.lng" 
              :title="product?.Nama_Produk"
              height="400px"
              mapId="MAIN_PRODUCT_MAP"
            />
          </div>

          <KprSimulation :product="product" />
        </div>
        
        <CompareModal :show="showCompareModal" :currentProduct="product" @close="showCompareModal = false" />
      </div>

      <div v-else class="flex flex-col items-center justify-center py-20 text-center">
        <div class="size-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <Icon icon="lucide:search-x" class="size-10 text-slate-300" />
        </div>
        <h2 class="text-3xl font-black text-slate-900 mb-2">Properti Tidak Tersedia</h2>
        <p class="text-slate-500 font-medium max-w-sm mb-8">Maaf, properti yang Anda cari sudah terjual, tidak aktif, atau tidak dapat ditemukan.</p>
        <RouterLink to="/katalog" class="px-8 py-3 bg-bejo-500 text-white rounded-xl font-bold text-sm hover:bg-bejo-600 transition-all shadow-lg shadow-bejo-500/20">
          Kembali ke Katalog
        </RouterLink>
      </div>

      <SuggestedProducts v-if="product" :products="suggestions" :is-loading="isLoading" />
    </div>
  </Guest>
</template>
