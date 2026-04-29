<script setup lang="ts">
import { onMounted, ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/axios'
import Vertical from '@/layouts/vertical.vue'
import SidebarProduct from './components/SidebarProduct.vue'
import ProductDetails from './components/ProductDetails.vue'

import { Icon } from '@iconify/vue'

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

const fetchData = async () => {
  try {
    const { data } = await api.get('/api/realEstate/getAll?slug='+slug, {
      headers: { 'X-Jenis-User': 'admin' }
    })
    product.value = data.Data[0]
  } catch (err) {
    console.error(err)
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
          <ProductDetails :product="product" class="!col-span-1" />
        </div>
      </div>
    </div>
  </Vertical>
</template>

