<script setup lang="ts">
import { onMounted, ref, nextTick, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'
import api from '@/services/axios'
import Guest from '@/layouts/guest.vue'
import SidebarProduct from './components/SidebarProduct.vue'
import ProductDetails from './components/ProductDetails.vue'
import KprSimulation from './components/KprSimulation.vue'
import SuggestedProducts from './components/SuggestedProducts.vue'

const route = useRoute()
const slug = route.params.slug

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
    <div class="px-4 py-8 md:p-10 max-w-[1440px] mx-auto w-full">
      <nav class="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 mb-4 uppercase tracking-widest font-semibold">
        <RouterLink to="/" class="hover:text-bejo-600 transition-colors">Beranda</RouterLink>
        <Icon icon="lucide:chevron-right" class="size-3" />
        <span class="text-slate-800">Detail Properti</span>
      </nav>
      <!-- <PageTitle subtitle="Kelola" title="Detail" v-if="isAdmin" /> -->
      <div class="grid lg:grid-cols-3 grid-cols-1 gap-5">
        <SidebarProduct :product="product" :isAdmin="isAdmin" />
        <div class="lg:col-span-2 col-span-1 flex flex-col gap-5">
          <ProductDetails :product="product" :isAdmin="isAdmin" class="!col-span-1" />
          <KprSimulation :product="product" />
        </div>
      </div>

      <SuggestedProducts :products="suggestions" :is-loading="isLoading" />
    </div>
  </Guest>
</template>
