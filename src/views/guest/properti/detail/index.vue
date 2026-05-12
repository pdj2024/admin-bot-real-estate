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
const showLightbox = ref(false)
const lightboxIndex = ref(0)
const showStickyCTA = ref(false)

const route = useRoute()

const handleScroll = () => {
  // Show sticky CTA after scrolling 400px
  showStickyCTA.value = window.scrollY > 400
}

const handleWhatsApp = () => {
  if (!product.value) return
  const message = `Halo, saya tertarik dengan properti "${product.value.Nama_Produk}" yang saya lihat di website. Bisa minta info lebih lanjut?%0A%0AUrl: ${window.location.origin}/properti/detail/${product.value.Slug}`
  window.open(`https://wa.me/6281234567890?text=${message}`, '_blank')
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

const mapCoords = computed(() => {
  if (!product.value) return null
  
  // Prioritize explicit Latitude and Longitude fields
  if (product.value.Latitude && product.value.Longitude) {
    const lat = parseFloat(product.value.Latitude)
    const lng = parseFloat(product.value.Longitude)
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng }
    }
  }

  // Fallback to legacy address parsing
  if (!product.value.Alamat) return null
  
  // Support both "Lat:" and "Latitude:", and "Long:", "Lng:", or "Longitude:"
  const latMatch = product.value.Alamat.match(/(?:Lat|Latitude):\s*([-+]?\d+\.?\d*)/i)
  const lngMatch = product.value.Alamat.match(/(?:Long|Lng|Longitude):\s*([-+]?\d+\.?\d*)/i)
  
  if (latMatch && lngMatch) {
    return {
      lat: parseFloat(latMatch[1]),
      lng: parseFloat(lngMatch[1])
    }
  }
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
  Latitude: string
  Longitude: string
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
  Nama_Provinsi?: string
}

const product = ref<Product | null>(null)
const suggestions = ref<Product[]>([])
const isLoading = ref(true)

const fetchData = async (currentSlug: string) => {
  isLoading.value = true
  try {
    // Fetch a larger set to ensure we have enough active suggestions
    const { data } = await api.get('/api/realEstate/getAll?status_display=aktif&status_properti=Tersedia&orderby=no_id&orderdir=asc', {
      headers: { 'X-Jenis-User': 'Admin' }
    })

    // 1. Find the main product
    let mainProduct = data.Data.find((p: Product) => p.Slug === currentSlug)
    
    // If not found in the latest 20, fetch specifically by slug
    if (!mainProduct) {
      const { data: exactData } = await api.get('/api/realEstate/getAll?status_display=aktif&status_properti=Tersedia&slug=' + currentSlug, {
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
  window.addEventListener('scroll', handleScroll)
  nextTick(() => {
    if (window.HSStaticMethods?.autoInit) {
      window.HSStaticMethods.autoInit()
    }
  })
})

import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
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
        <SidebarProduct 
          :product="product" 
          :isAdmin="isAdmin" 
          @openCompare="showCompareModal = true" 
          @openLightbox="(idx) => { lightboxIndex = idx; showLightbox = true }"
          class="lg:col-span-4" 
        />
        <div class="lg:col-span-8 col-span-1 flex flex-col gap-5">
          <ProductDetails :product="product" :isAdmin="isAdmin" class="!col-span-1" />
          
          <!-- Map Section -->
          <div v-if="mapCoords && !product.Hide_alamat" class="w-full">
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

        <!-- Sticky Mobile CTA -->
        <Transition name="slide-up">
          <div v-if="showStickyCTA && product && product.Status_Properti === 'Tersedia'" class="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] p-4 z-[90] flex items-center justify-between gap-4">
            <div class="min-w-0 flex-1">
              <h4 class="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{{ product.Nama_Produk }}</h4>
              <p class="text-bejo-600 font-black text-base tracking-tighter">
                {{ product.Harga_Jual2 != 0 ? formatCurrency(product.Harga_Jual2) : (product.Harga_Sewa2 != 0 ? formatCurrency(product.Harga_Sewa2) : formatCurrency(product.Harga_Jual1 || product.Harga_Sewa1)) }}
              </p>
            </div>
            <button @click="handleWhatsApp" class="bg-green-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-500/20 active:scale-95 transition-all shrink-0">
              <Icon icon="ic:baseline-whatsapp" class="size-5" />
              Hubungi
            </button>
          </div>
        </Transition>

        <!-- Lightbox Modal -->
        <Transition name="fade">
          <div v-if="showLightbox && product" class="fixed inset-0 z-[2000] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-10">
            <button @click="showLightbox = false" class="absolute top-6 right-6 size-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all">
              <Icon icon="lucide:x" class="size-6" />
            </button>
            
            <div class="relative w-full max-w-6xl aspect-[4/3] md:aspect-video flex items-center justify-center group">
              <!-- Navigation -->
              <button 
                v-if="product.MediaUrls.length > 1"
                @click="lightboxIndex = (lightboxIndex - 1 + product.MediaUrls.length) % product.MediaUrls.length"
                class="absolute left-4 top-1/2 -translate-y-1/2 size-12 bg-white/10 hover:bg-white text-white hover:text-bejo-600 rounded-full flex items-center justify-center transition-all z-10 opacity-0 group-hover:opacity-100"
              >
                <Icon icon="lucide:chevron-left" class="size-6" />
              </button>
              <button 
                v-if="product.MediaUrls.length > 1"
                @click="lightboxIndex = (lightboxIndex + 1) % product.MediaUrls.length"
                class="absolute right-4 top-1/2 -translate-y-1/2 size-12 bg-white/10 hover:bg-white text-white hover:text-bejo-600 rounded-full flex items-center justify-center transition-all z-10 opacity-0 group-hover:opacity-100"
              >
                <Icon icon="lucide:chevron-right" class="size-6" />
              </button>

              <Transition name="fade" mode="out-in">
                <div :key="lightboxIndex" class="size-full flex items-center justify-center">
                  <img 
                    v-if="!product.MediaUrls[lightboxIndex].ContentType?.startsWith('video/')"
                    :src="product.MediaUrls[lightboxIndex].Url || product.MediaUrls[lightboxIndex].Id_Media" 
                    class="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                  />
                  <video 
                    v-else
                    :src="product.MediaUrls[lightboxIndex].Url || product.MediaUrls[lightboxIndex].Id_Media"
                    class="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                    controls
                    autoplay
                  ></video>
                </div>
              </Transition>
            </div>

            <!-- Thumbnail Strip -->
            <div class="mt-8 flex gap-2 overflow-x-auto max-w-full pb-4 px-4 no-scrollbar">
              <button 
                v-for="(m, i) in product.MediaUrls" 
                :key="i"
                @click="lightboxIndex = i"
                class="size-16 rounded-xl overflow-hidden border-2 transition-all shrink-0"
                :class="lightboxIndex === i ? 'border-bejo-500 scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'"
              >
                <img :src="m.ThumbUrl || m.Url || m.Id_Media" class="size-full object-cover" />
              </button>
            </div>
          </div>
        </Transition>
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

<style scoped>
@reference "@/assets/css/style.css";

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
