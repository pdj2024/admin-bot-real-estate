<script setup lang="ts">
import { onMounted, ref, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/axios'
import Vertical from '@/layouts/vertical.vue'
import SidebarProduct from './components/SidebarProduct.vue'
import ProductDetails from './components/ProductDetails.vue'
import GoogleMapsViewer from '@/components/common/GoogleMapsViewer.vue'
import Modal from '../katalog/components/Modal.vue'
import { Icon } from '@iconify/vue'
import { confirm, success, fail } from '@/utils/sweet-alert'

const route = useRoute()
const router = useRouter()
const slug = route.params.slug

const product = ref<Product | null>(null)
const isLoading = ref(true)
const isModalOpen = ref(false)
const selectedItem = ref<Product | null>(null)
const showLightbox = ref(false)
const lightboxIndex = ref(0)

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

  // Check Area field (often contains coordinates as JSON string or array element)
  if (product.value.Area) {
    try {
      const areaArr = typeof product.value.Area === 'string' ? JSON.parse(product.value.Area) : product.value.Area
      if (Array.isArray(areaArr) && areaArr[2]) {
        const [lat, lng] = areaArr[2].split(',').map(Number)
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng }
        }
      }
    } catch {}
  }

  // Fallback to legacy address parsing
  if (!product.value.Alamat) return null
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
  No_Id_Media?: string
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
  Satuan_Minimal_Sewa: string
  Nama_Kota?: string
  Area: string
  Hide_alamat: boolean
  Akses_Jalan: string[]
  File_Image: string[]
  MediaUrls?: MediaUrl[]
  Created_By?: string | null
  Nama_Area?: string
  Kelurahan?: string
  Kecamatan?: string
  Id_Customer?: string
  Nama_Customer?: string
  Tanggal_Transaksi?: string
}

const fetchData = async () => {
  isLoading.value = true
  try {
    const { data } = await api.get('/api/realEstate/getAll?slug=' + slug, {
      headers: { 'X-Jenis-User': 'admin' }
    })
    const mainProduct = data.Data[0]
    
    // Resolve customer name if Id_Customer exists
    if (mainProduct && mainProduct.Id_Customer) {
      try {
        const { data: custData } = await api.get('/api/customer/getAll', {
          headers: {
            'X-Jenis-User': 'Admin',
            'Api-Key': 'realestate_key_2024'
          }
        })
        const found = (custData.Data || []).find((c: any) => c.No_Id === mainProduct.Id_Customer)
        if (found) {
          mainProduct.Nama_Customer = found.Nama_Display || found.Nama_Customer || found.Nama
        }
      } catch (err) {
        console.error('Gagal mengambil customer info:', err)
      }
    }

    product.value = mainProduct
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const openEditModal = () => {
  if (!product.value) return
  selectedItem.value = { ...product.value }
  isModalOpen.value = true
}

const handleDelete = async () => {
  if (!product.value) return
  const data = product.value
  
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
      
      success('Berhasil hapus produk')
      router.push('/properti/katalog')
    } catch (err: any) {
      fail('Gagal menghapus data')
      console.error(err)
    }
  })
}

onMounted(async () => {
  await fetchData()
  nextTick(() => {
    window.HSStaticMethods?.autoInit()
  })
})
</script>

<template>
  <Vertical>
    <div class="p-4 md:p-3 py-10 pb-32 max-w-[1440px] mx-auto w-full">

      <div class="grid lg:grid-cols-12 grid-cols-1 gap-5">
        <SidebarProduct 
          :product="product" 
          @edit="openEditModal" 
          @delete="handleDelete" 
          @openLightbox="(idx) => { lightboxIndex = idx; showLightbox = true }"
          class="lg:col-span-4"
        />
        <div class="lg:col-span-8 col-span-1 flex flex-col gap-5">
          <ProductDetails :product="product" :isAdmin="true" class="!col-span-1" />
          
          <!-- Map Section -->
          <div v-if="mapCoords && product && !product.Hide_alamat" class="w-full">
            <div class="flex items-center justify-between gap-4 mb-4">
              <div class="flex items-center gap-2">
                <div class="size-8 bg-bejo-50 rounded-lg flex items-center justify-center border border-bejo-100">
                  <Icon icon="lucide:map" class="size-4 text-bejo-600" />
                </div>
                <h3 class="text-sm font-black uppercase tracking-widest text-slate-900">Lokasi Properti</h3>
              </div>
              <a 
                :href="`https://www.google.com/maps/dir/?api=1&destination=${mapCoords.lat},${mapCoords.lng}`" 
                target="_blank"
                class="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-slate-900/20 shrink-0"
              >
                <Icon icon="lucide:navigation" class="size-4" />
                Arahkan Saya
              </a>
            </div>
            <GoogleMapsViewer 
              :lat="mapCoords.lat" 
              :lng="mapCoords.lng" 
              :title="product?.Nama_Produk"
              height="400px"
              mapId="ADMIN_MAIN_PRODUCT_MAP"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <Modal 
      v-model:showModal="isModalOpen" 
      :itemData="selectedItem" 
      @success="fetchData" 
    />

    <!-- Lightbox Modal -->
    <Transition name="fade">
      <div v-if="showLightbox && product && product.MediaUrls" class="fixed inset-0 z-[2000] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-10">
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
      </div>
    </Transition>
  </Vertical>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
