<script setup lang="ts">
import { onMounted, ref, nextTick, computed } from 'vue'
import { isTokenExpired } from '@/services/auth'
import { useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'
import api from '@/services/axios'
import Vertical from '@/layouts/vertical.vue'
import SidebarProduct from './components/SidebarProduct.vue'
import ProductDetails from './components/ProductDetails.vue'
import PageTitle from '@/components/PageTitle.vue'

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
      headers: { 'X-Jenis-User': 'Admin' }
    })
    product.value = data.Data[0]
  } catch (err) {
    console.error(err)
  }
}

const isLoggedIn = computed(() => {
  const token = localStorage.getItem('token')
  const refreshToken = localStorage.getItem('refreshToken')

  const hasTokens = !!token && token !== 'undefined' && !!refreshToken && refreshToken !== 'undefined'

  return hasTokens && !isTokenExpired(token) && route.path.startsWith('/properti/detail')
})

const isAdmin = computed(() => {
  return localStorage.getItem('role_user') == 'admin' && route.path.startsWith('/properti/detail')
})

onMounted(async () => {
  await fetchData()
  nextTick(() => {
    window.HSStaticMethods?.autoInit()
  })
})
</script>

<template>
  <Vertical v-if="isLoggedIn">
    <PageTitle subtitle="Kelola" title="Detail" />
    <div class="grid lg:grid-cols-3 grid-cols-1 gap-5">
      <SidebarProduct :product="product" :isAdmin="isAdmin"/>
      <ProductDetails :product="product" :isAdmin="isAdmin"/>
    </div>
  </Vertical>

  <div v-else class="grid lg:grid-cols-3 grid-cols-1 gap-5 p-10">
      <SidebarProduct :product="product" :isAdmin="isAdmin"/>
      <ProductDetails :product="product" :isAdmin="isAdmin"/>
    </div>
</template>

