<script setup lang="ts">
import { onMounted, ref, nextTick, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/axios'
import Guest from '@/layouts/guest.vue'
import SidebarProduct from './components/SidebarProduct.vue'
import ProductDetails from './components/ProductDetails.vue'
import KprSimulation from './components/KprSimulation.vue'
import SuggestedProducts from './components/SuggestedProducts.vue'

const route = useRoute()

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
  Area: string
  Hide_alamat: boolean
  Akses_Jalan: string[]
  File_Image: string[]
  MediaUrls: MediaUrl[]
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

    // 2. Populate suggestions (Must be Aktif, Tersedia, and NOT the current product)
    suggestions.value = data.Data
      .filter((p: Product) => 
        p.Slug !== currentSlug && 
        p.Status_Display === 'Aktif' && 
        p.Status_Properti === 'Tersedia'
      )
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
    <div class="p-10 max-w-[1440px] mx-auto w-full min-h-[60vh]">
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <Icon icon="lucide:loader-2" class="size-12 animate-spin text-bejo-500 mb-4" />
        <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">Memuat Data...</p>
      </div>
      
      <div v-else-if="product" class="grid lg:grid-cols-3 grid-cols-1 gap-5">
        <SidebarProduct :product="product" :isAdmin="isAdmin" />
        <div class="lg:col-span-2 col-span-1 flex flex-col gap-5">
          <ProductDetails :product="product" :isAdmin="isAdmin" class="!col-span-1" />
          <KprSimulation :product="product" />
        </div>
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
