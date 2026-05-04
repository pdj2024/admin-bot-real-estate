<script setup lang="ts">
import { onMounted, ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/axios'
import Vertical from '@/layouts/vertical.vue'
import SidebarProduct from './components/SidebarProduct.vue'
import ProductDetails from './components/ProductDetails.vue'
import GoogleMapsViewer from '@/components/common/GoogleMapsViewer.vue'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'


const route = useRoute()
const slug = route.params.slug

const product = ref<Product | null>(null)
const isLoading = ref(true)

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
  Nama_Kota?: string
  Area: string
  Hide_alamat: boolean
  Akses_Jalan: string[]
  File_Image: string[]
  MediaUrls: MediaUrl[]
}


const fetchData = async () => {
  isLoading.value = true
  try {
    const { data } = await api.get('/api/realEstate/getAll?slug='+slug, {
      headers: { 'X-Jenis-User': 'admin' }
    })
    product.value = data.Data[0]
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
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
    <div class="p-0 md:p-3 md:pt-1 pb-32 max-w-[1440px] mx-auto w-full">

      <div class="grid lg:grid-cols-3 grid-cols-1 gap-5">
        <SidebarProduct :product="product" />
        <div class="lg:col-span-2 col-span-1 flex flex-col gap-5">
          <ProductDetails :product="product" :isAdmin="true" class="!col-span-1" />
          
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
              mapId="ADMIN_MAIN_PRODUCT_MAP"
            />
          </div>
        </div>
      </div>
    </div>
  </Vertical>
</template>

