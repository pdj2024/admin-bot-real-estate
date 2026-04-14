<template>
  <GuestLayout main-class="max-w-none">
    <!-- Hero Section Beranda -->
    <section class="relative min-h-[90vh] flex flex-col justify-center items-center py-20 mt-0 overflow-hidden bg-slate-900 border-b-[8px] border-bejo-500">
      <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" alt="Rumah Mewah" class="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity select-none pointer-events-none" draggable="false" />
      <div class="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-900"></div>
      
      <div class="relative z-10 w-full mx-auto text-center space-y-8 !px-2.5 sm:!px-8 lg:!px-12">
        <span class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-bejo-400 font-bold tracking-widest text-xs uppercase shadow-2xl border border-white/5 mx-auto">
          <Icon icon="lucide:sparkles" class="size-4" /> Solusi Properti Terbaik
        </span>
        <h1 class="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white tracking-tighter leading-[1.1] drop-shadow-2xl">
          Wujudkan <br class="hidden sm:block" />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-bejo-400 via-bejo-500 to-bejo-600">Rumah Impian</span> Anda.
        </h1>
        <p class="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-md">
          Eksplorasi ribuan properti premium di seluruh Indonesia. Dari hunian minimalis hingga apartemen mewah, semua ada di Rumah Bejo.
        </p>
        
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <RouterLink to="/katalog" class="w-full sm:w-auto px-8 py-4 bg-bejo-500 hover:bg-bejo-600 text-white rounded-2xl font-black text-base lg:text-lg transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-bejo-500/40 flex justify-center items-center gap-3">
            Eksplorasi Katalog
            <Icon icon="lucide:arrow-right" class="size-5" />
          </RouterLink>
          <RouterLink to="/simulasi-kpr" class="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-base lg:text-lg transition-all hover:-translate-y-1 flex justify-center items-center gap-3">
            <Icon icon="lucide:calculator" class="size-5" />
            Hitung Simulasi KPR
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Stats Floating Bottom -->
    <div class="relative z-20 !px-2.5 -mt-16 sm:-mt-20">
      <div class="w-full mx-auto bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-white grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 !px-2.5 sm:!px-8 lg:!px-12">
        <div class="text-center px-4">
          <h4 class="text-4xl lg:text-5xl font-black text-slate-900 mb-2">1,2k<span class="text-bejo-500">+</span></h4>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Listing Terverifikasi</p>
        </div>
        <div class="text-center px-4">
          <h4 class="text-4xl lg:text-5xl font-black text-slate-900 mb-2">480<span class="text-bejo-500">+</span></h4>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Klien Puas</p>
        </div>
        <div class="text-center px-4">
          <h4 class="text-4xl lg:text-5xl font-black text-slate-900 mb-2">15<span class="text-bejo-500">+</span></h4>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mitra Perbankan</p>
        </div>
      </div>
    </div>

    <!-- Layanan Kami Section -->
    <section class="py-24 sm:py-32 px-4 bg-white relative overflow-hidden">
      <div class="w-full !px-2.5 sm:!px-8 lg:!px-12">
        <div class="text-center mb-16 space-y-4">
          <span class="text-bejo-600 font-black uppercase tracking-widest text-xs">Layanan Ekosistem</span>
          <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Solusi Properti <span class="text-bejo-500">End-to-End</span></h2>
          <p class="text-slate-500 font-medium max-w-2xl mx-auto">Kami tidak hanya menjual rumah, kami menciptakan jalan mulus menuju hunian impian Anda dengan layanan lengkap.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div class="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 hover:border-bejo-200 hover:bg-white hover:shadow-2xl hover:shadow-bejo-600/10 transition-all duration-300 group">
            <div class="size-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-bejo-600 mb-6 group-hover:bg-bejo-500 group-hover:text-white transition-all">
              <Icon icon="lucide:house-plus" class="size-7" />
            </div>
            <h3 class="text-xl font-black text-slate-900 mb-3">Jual & Beli</h3>
            <p class="text-sm font-medium text-slate-500 leading-relaxed">Listing beragam pilihan rumah, ruko, apartemen hingga kavling tanah terbaik.</p>
          </div>
          <div class="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 hover:border-bejo-200 hover:bg-white hover:shadow-2xl hover:shadow-bejo-600/10 transition-all duration-300 group">
            <div class="size-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-bejo-600 mb-6 group-hover:bg-bejo-500 group-hover:text-white transition-all">
              <Icon icon="lucide:key-round" class="size-7" />
            </div>
            <h3 class="text-xl font-black text-slate-900 mb-3">Sewa Hunian</h3>
            <p class="text-sm font-medium text-slate-500 leading-relaxed">Cari kost atau sewa rumah jangka panjang dengan proses kontrak yang transparan.</p>
          </div>
          <div class="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 hover:border-bejo-200 hover:bg-white hover:shadow-2xl hover:shadow-bejo-600/10 transition-all duration-300 group">
            <div class="size-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-bejo-600 mb-6 group-hover:bg-bejo-500 group-hover:text-white transition-all">
              <Icon icon="lucide:calculator" class="size-7" />
            </div>
            <h3 class="text-xl font-black text-slate-900 mb-3">Simulasi KPR</h3>
            <p class="text-sm font-medium text-slate-500 leading-relaxed">Plafon pinjaman dan angsuran bulanan yang disesuaikan dengan profil finansial.</p>
          </div>
          <div class="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 hover:border-bejo-200 hover:bg-white hover:shadow-2xl hover:shadow-bejo-600/10 transition-all duration-300 group">
            <div class="size-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-bejo-600 mb-6 group-hover:bg-bejo-500 group-hover:text-white transition-all">
              <Icon icon="lucide:shield-check" class="size-7" />
            </div>
            <h3 class="text-xl font-black text-slate-900 mb-3">Legalitas Aman</h3>
            <p class="text-sm font-medium text-slate-500 leading-relaxed">Jaminan keamanan dokumen sertifikat (SHM/SHGB) setiap unit properti kami.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Us Section -->
    <section class="py-24 sm:py-32 bg-slate-50 border-y border-slate-200 relative overflow-hidden">
      <!-- Decor -->
      <div class="absolute -top-40 -left-40 size-96 bg-bejo-400 opacity-10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div class="w-full px-2.5 sm:px-8 lg:px-12 relative z-10">
        <div class="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div class="relative">
             <div class="aspect-square rounded-[3rem] overflow-hidden shadow-2xl relative z-10 border-[12px] border-white">
               <img src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Properties" class="w-full h-full object-cover" />
             </div>
             <div class="absolute -bottom-10 -right-10 w-64 aspect-square bg-bejo-500 rounded-3xl -z-0 opacity-20 animate-pulse"></div>
             <div class="absolute -top-10 -left-10 w-40 aspect-video bg-slate-900 rounded-2xl z-20 p-6 flex items-center gap-4 text-white shadow-2xl">
                <Icon icon="lucide:star" class="size-8 text-bejo-400 fill-bejo-400" />
                <div>
                   <span class="block text-xl font-black">4.9/5</span>
                   <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">User Rating</span>
                </div>
             </div>
          </div>

          <div class="space-y-10">
            <div class="space-y-4">
              <span class="text-bejo-600 font-black uppercase tracking-widest text-xs">Keunggulan Utama</span>
              <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">Mengapa Anda Merasa <span class="bg-bejo-100 px-2 rounded-lg italic">Beruntung</span> di Rumah Bejo?</h2>
            </div>
            
            <div class="space-y-8">
               <div class="flex gap-6 group">
                  <div class="size-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 group-hover:bg-bejo-50 transition-colors">
                    <Icon icon="lucide:verified" class="size-8 text-bejo-600" />
                  </div>
                  <div class="space-y-2 pt-1">
                    <h4 class="text-xl font-black text-slate-900">100% Data Tervalidasi</h4>
                    <p class="text-slate-500 font-medium leading-relaxed">Semua listing melalui verifikasi lapangan oleh tim Rumah Bejo untuk menjamin akurasi info 1:1.</p>
                  </div>
               </div>
               <div class="flex gap-6 group">
                  <div class="size-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 group-hover:bg-bejo-50 transition-colors">
                    <Icon icon="lucide:user-check-2" class="size-8 text-bejo-600" />
                  </div>
                  <div class="space-y-2 pt-1">
                    <h4 class="text-xl font-black text-slate-900">Personal Agent Dedicated</h4>
                    <p class="text-slate-500 font-medium leading-relaxed">Dapatkan asisten pribadi yang siap menemani proses survei unit hingga tanda tangan akad di hadapan Notaris.</p>
                  </div>
               </div>
               <div class="flex gap-6 group">
                  <div class="size-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 group-hover:bg-bejo-50 transition-colors">
                    <Icon icon="lucide:banknote" class="size-8 text-bejo-600" />
                  </div>
                  <div class="space-y-2 pt-1">
                    <h4 class="text-xl font-black text-slate-900">Negosiasi Tanpa Ribet</h4>
                    <p class="text-slate-500 font-medium leading-relaxed">Sistem bid transparan yang mempertemukan harga ekspektasi pembeli dan penjual secara adil & objektif.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Highlight Properti Terbaru Section -->
    <section class="py-24 sm:py-32 px-4 bg-white relative overflow-hidden">
      <!-- Decor -->
      <div class="absolute -right-40 top-20 size-96 bg-bejo-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
      
      <div class="w-full !px-2.5 sm:!px-8 lg:!px-12">
        <div class="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
          <div class="max-w-2xl">
            <span class="text-bejo-600 font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-2">
              <Icon icon="lucide:flame" class="size-4" /> Listing Eksklusif
            </span>
            <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Properti Terbaru <br />Untuk Anda
            </h2>
          </div>
          
          <RouterLink to="/katalog" class="group flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 hover:border-bejo-600 rounded-xl font-bold text-slate-700 hover:text-bejo-600 transition-colors shrink-0">
            Lihat Semua Properti
            <Icon icon="lucide:arrow-right" class="size-4 group-hover:translate-x-1 transition-transform" />
          </RouterLink>
        </div>

        <!-- Skeleton Form saat Fetching -->
        <div v-if="isLoading" class="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 relative z-10">
          <ProductCard v-for="i in 3" :key="i" :product="{}" is-loading />
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[2000px]:grid-cols-4 gap-8 relative z-10">
          <ProductCard 
            v-for="row in displayedProducts" 
            :key="row.id || row.No_Id" 
            :product="row" 
            @click="(slug) => $router.push(`/detail/${slug}`)"
          />
        </div>
      </div>
    </section>

  </GuestLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import GuestLayout from '@/layouts/guest.vue'
import api from '@/services/axios'
import ProductCard from '@/components/ProductCard.vue'

interface ProductPreview {
  id?: string
  No_Id: string
  Nama_Produk: string
  Slug: string
  Alamat: string
  Tipe: string
  Area: string[]
  Status_Display: string
  Status_Properti: string
  Status_Transaksi: string[]
  Luas_Tanah: number
  Luas_Bangunan: number
  Jumlah_Kamar_Tidur: number
  Jumlah_Kamar_Mandi: number
  Harga_Jual1: number
  Harga_Jual2: number
  Harga_Sewa1: number
  Hide_alamat: boolean
  MediaUrls: { Id_Media: string }[]
}

const isLoading = ref(true)
const displayedProducts = ref<ProductPreview[]>([])

const formatCurrency = (value: number) => {
  if (!value) return '0'
  if (value >= 1e12) return 'Rp ' + (value / 1e12).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' T'
  if (value >= 1e9) return 'Rp ' + (value / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' M'
  if (value >= 1e6) return 'Rp ' + (value / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' Jt'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

const fetchData = async () => {
  try {
    const { data } = await api.get('/api/realEstate/getAll', {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    
    if (data && data.Data) {
      // Ambil hanya 3 terbaru. Anggap saja Data sudah sorted newest first
      displayedProducts.value = data.Data.slice(0, 3)
    }
  } catch (error) {
    console.error('Gagal mengambil katalog prop:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
@reference "@/assets/css/style.css";
/* Override bg body kalau perlu untuk landing page spesifik */
</style>
