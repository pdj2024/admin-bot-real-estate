<template>
  <GuestLayout main-class="max-w-none">
    <!-- Hero Section Beranda -->
    <section class="relative pt-10 pb-10 bg-white">
      <div class="w-full !px-4 sm:!px-8 lg:!px-10">
        <div class="relative overflow-hidden rounded-[3.5rem] bg-white border border-bejo-100 shadow-premium px-8 pt-8 pb-48 md:px-24 md:pt-24 md:pb-64 lg:px-32 lg:pt-32 lg:pb-80 flex flex-col justify-center items-center min-h-[90vh]">
          <!-- Mesh Gradient Background -->
          <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div class="absolute -top-[20%] -right-[10%] size-[800px] bg-bejo-100/50 rounded-full blur-[120px] animate-pulse"></div>
            <div class="absolute top-[10%] -left-[15%] size-[600px] bg-bejo-200/30 rounded-full blur-[100px]"></div>
            <div class="absolute bottom-[-10%] left-[20%] size-[700px] bg-bejo-50/60 rounded-full blur-[140px]"></div>
          </div>

          <!-- Pattern -->
          <div class="absolute inset-0 opacity-[0.015] pointer-events-none" style="background-image: url('https://www.transparenttextures.com/patterns/cubes.png')"></div>

          <div class="relative z-10 w-full mx-auto text-center space-y-12">
            <div class="space-y-6">
              <h1 class="text-5xl md:text-8xl lg:text-[9rem] font-black text-slate-900 tracking-tighter leading-[0.85] max-w-7xl mx-auto drop-shadow-sm">
                Wujudkan <br class="hidden sm:block" />
                <span class="relative inline-block py-2">
                  <span class="relative z-10 text-transparent bg-clip-text bg-gradient-to-br from-bejo-500 via-bejo-600 to-bejo-900 animate-gradient-x">Rumah Impian</span>
                  <div class="absolute bottom-4 left-0 right-0 h-6 bg-bejo-100/40 -z-0 rounded-full blur-md"></div>
                </span>
                Anda.
              </h1>

              <p class="text-base md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed opacity-80">
                Koleksi properti premium milik <span class="text-slate-900 font-black border-b-2 border-bejo-200">{{ settingsStore.business.appName }}</span>. <br />
                Aman, terverifikasi, dan siap huni langsung dari tangan pertama.
              </p>
            </div>

            <!-- Global Search Bar -->
            <div class="max-w-5xl mx-auto w-full relative z-20 px-4 md:px-0">
              <div class="bg-white/80 backdrop-blur-2xl p-2 md:p-4 rounded-[2.5rem] border border-bejo-100 shadow-2xl shadow-bejo-600/10 flex flex-col md:flex-row items-center gap-4">
                <div class="flex-1 flex items-center gap-4 px-6 w-full">
                  <Icon icon="lucide:search" class="size-6 text-bejo-600 shrink-0" />
                  <input 
                    type="text" 
                    v-model="heroSearch" 
                    @keyup.enter="handleHeroSearch"
                    placeholder="Cari lokasi atau nama properti..." 
                    class="w-full bg-transparent border-none focus:ring-0 text-slate-800 font-bold placeholder:text-slate-400 text-lg md:text-xl py-3"
                  />
                </div>
                <button @click="handleHeroSearch" class="w-full md:w-auto px-10 py-4 md:py-5 bg-bejo-600 hover:bg-bejo-700 text-white rounded-[1.8rem] font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-bejo-600/20 flex items-center justify-center gap-3">
                  <Icon icon="lucide:search" class="size-5" />
                  Cari Unit
                </button>
              </div>
              <!-- Trending Tags -->
              <div class="flex flex-wrap items-center justify-center gap-3 mt-6">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Populer:</span>
                <button @click="quickSearch('Rumah')" class="px-4 py-1.5 bg-bejo-50 hover:bg-bejo-600 hover:text-white text-bejo-700 text-[10px] font-black rounded-full border border-bejo-100 transition-all uppercase tracking-wider">Rumah</button>
                <button @click="quickSearch('Apartemen')" class="px-4 py-1.5 bg-bejo-50 hover:bg-bejo-600 hover:text-white text-bejo-700 text-[10px] font-black rounded-full border border-bejo-100 transition-all uppercase tracking-wider">Apartemen</button>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 hidden md:flex">
              <RouterLink to="/katalog" class="flex items-center gap-3 text-slate-400 hover:text-bejo-600 font-black text-sm uppercase tracking-[0.2em] transition-all group">
                Atau lihat koleksi lengkap
                <Icon icon="lucide:arrow-right" class="size-4 group-hover:translate-x-1 transition-transform" />
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Floating Bottom -->
    <div class="relative z-20 !px-4 sm:!px-12 lg:!px-20 -mt-40 md:-mt-56 lg:-mt-64">
      <div class="w-full mx-auto glass backdrop-blur-3xl rounded-[4rem] p-10 md:p-14 shadow-premium border border-white/60 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100/50">
        <div class="text-center px-6 group hover-float">
          <div class="text-bejo-600 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-3 group-hover:translate-y-0 scale-150">
            <Icon icon="lucide:building-2" class="size-6 mx-auto" />
          </div>
          <h4 class="text-6xl lg:text-7xl font-black text-slate-900 mb-2 tracking-tighter">1,2k<span class="text-bejo-600">.</span></h4>
          <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Unit Eksklusif</p>
        </div>
        <div class="text-center px-6 group hover-float">
          <div class="text-bejo-600 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-3 group-hover:translate-y-0 scale-150">
            <Icon icon="lucide:shield-check" class="size-6 mx-auto" />
          </div>
          <h4 class="text-6xl lg:text-7xl font-black text-slate-900 mb-2 tracking-tighter">100<span class="text-bejo-600">%</span></h4>
          <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Pemilik Langsung</p>
        </div>
        <div class="text-center px-6 group hover-float">
          <div class="text-bejo-600 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-3 group-hover:translate-y-0 scale-150">
            <Icon icon="lucide:map-pin" class="size-6 mx-auto" />
          </div>
          <h4 class="text-6xl lg:text-7xl font-black text-slate-900 mb-2 tracking-tighter">15<span class="text-bejo-600">.</span></h4>
          <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Area Strategis</p>
        </div>
      </div>
    </div>

    <!-- Highlight Properti Terbaru Section -->
    <section class="pt-32 pb-5 sm:pt-40 sm:pb-10 px-4 bg-[#f7f9fb] relative overflow-hidden">
      <!-- Decor -->
      <div class="absolute -right-40 top-20 size-96 bg-bejo-200/30 rounded-full blur-3xl pointer-events-none"></div>

      <div class="w-full !px-2.5 sm:!px-8 lg:!px-12">
        <div class="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 relative z-10">
          <div class="max-w-2xl space-y-4">
            <span class="text-bejo-600 font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-2">
              <div class="w-8 h-[2px] bg-bejo-500"></div>
              Koleksi Terbaru {{ settingsStore.business.appName }}
            </span>
            <h2 class="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">Unit Pilihan <br />Siap <span class="text-bejo-500">Huni.</span></h2>
          </div>

          <RouterLink to="/katalog" class="group flex items-center gap-3 px-8 py-4 bg-bejo-50 hover:bg-bejo-600 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest text-bejo-700 transition-all shadow-sm shrink-0 active:scale-95 border border-bejo-100">
            Lihat Semua
            <Icon icon="lucide:arrow-right" class="size-4 group-hover:translate-x-1 transition-transform" />
          </RouterLink>
        </div>

        <!-- Skeleton Form saat Fetching -->
        <div v-if="isLoading" class="flex overflow-x-auto snap-x snap-mandatory gap-8 pb-12 custom-scroll scroll-smooth">
          <ProductCard v-for="i in 4" :key="i" :product="{}" is-loading class="snap-center shrink-0 w-[85vw] md:w-[45vw] lg:w-[calc((100%-96px)/4)]" />
        </div>

        <!-- Carousel Container -->
        <div v-else class="relative group/carousel">
          <!-- Gradient Overlays for Edge Fading -->
          <div class="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#f7f9fb] to-transparent z-10 pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-700"></div>
          <div class="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#f7f9fb] to-transparent z-10 pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-700"></div>

          <!-- Navigation Controls -->
          <div class="absolute -left-4 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-all duration-500 -translate-x-4 group-hover/carousel:translate-x-0 hidden lg:block">
            <button @click="scroll('left')" class="size-14 rounded-full bg-white/90 backdrop-blur-md border border-slate-100 shadow-2xl flex items-center justify-center text-slate-800 hover:bg-bejo-600 hover:text-white transition-all active:scale-90 shadow-bejo-600/5">
              <Icon icon="lucide:chevron-left" class="size-6" />
            </button>
          </div>
          <div class="absolute -right-4 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-all duration-500 translate-x-4 group-hover/carousel:translate-x-0 hidden lg:block">
            <button @click="scroll('right')" class="size-14 rounded-full bg-white/90 backdrop-blur-md border border-slate-100 shadow-2xl flex items-center justify-center text-slate-800 hover:bg-bejo-600 hover:text-white transition-all active:scale-90 shadow-bejo-600/5">
              <Icon icon="lucide:chevron-right" class="size-6" />
            </button>
          </div>

          <div ref="scrollContainer" class="flex overflow-x-auto snap-x snap-mandatory gap-8 pb-12 px-4 md:px-0 custom-scroll scroll-smooth no-scrollbar">
            <ProductCard 
              v-for="row in displayedProducts" 
              :key="row.id || row.No_Id" 
              :product="row" 
              @select="(product: any) => $router.push(`/detail/${product.Slug}`)"
              class="snap-center shrink-0 w-[85vw] md:w-[45vw] lg:w-[calc((100%-96px)/4)] hover:-translate-y-4 transition-all duration-700"
            />
          </div>

          <!-- Hint for scrolling (Mobile Only) -->
          <div class="mt-4 flex justify-center items-center gap-2 lg:hidden">
            <div class="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full bg-bejo-500 w-1/3 animate-scroll-hint"></div>
            </div>
            <span class="text-[8px] font-black text-slate-300 uppercase tracking-widest">Geser untuk melihat lainnya</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Indonesia Map Distribution Section -->
    <IndonesiaMap :properties="allProducts" />

    <!-- Layanan Kami Section -->
    <section class="px-4 py-20 bg-slate-50/30 relative overflow-hidden">
      <div class="w-full !px-2.5 sm:!px-8 lg:!px-12">
        <div class="text-center mb-20 space-y-4">
          <span class="text-bejo-600 font-black uppercase tracking-[0.3em] text-[10px]">Layanan Ekosistem</span>
          <h2 class="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">Solusi Properti <span class="text-transparent bg-clip-text bg-gradient-to-r from-bejo-500 to-bejo-700">End-to-End</span></h2>
          <p class="text-slate-500 text-lg font-medium max-w-2xl mx-auto opacity-80 leading-relaxed">Kami tidak hanya menjual rumah, kami menciptakan jalan mulus menuju hunian impian Anda dengan layanan lengkap.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="bg-white p-12 rounded-[3.5rem] border border-slate-100 hover:border-bejo-200 shadow-premium hover:shadow-bejo-premium transition-all duration-700 group relative overflow-hidden">
            <div class="absolute -right-6 -top-6 size-32 bg-bejo-50 rounded-full group-hover:scale-150 transition-transform duration-700 -z-0"></div>
            <div class="relative z-10">
              <div class="size-20 rounded-3xl bg-bejo-50 text-bejo-600 flex items-center justify-center mb-10 group-hover:bg-bejo-600 group-hover:text-white transition-all shadow-sm">
                <Icon icon="lucide:house-plus" class="size-10" />
              </div>
              <h3 class="text-3xl font-black text-slate-900 mb-6">Jual & Beli</h3>
              <p class="text-base font-medium text-slate-500 leading-relaxed opacity-80">Tersedia beragam pilihan rumah, ruko, apartemen hingga kavling tanah terbaik.</p>
            </div>
          </div>
          <div class="bg-white p-12 rounded-[3.5rem] border border-slate-100 hover:border-bejo-200 shadow-premium hover:shadow-bejo-premium transition-all duration-700 group relative overflow-hidden">
            <div class="absolute -right-6 -top-6 size-32 bg-bejo-50 rounded-full group-hover:scale-150 transition-transform duration-700 -z-0"></div>
            <div class="relative z-10">
              <div class="size-20 rounded-3xl bg-bejo-50 text-bejo-600 flex items-center justify-center mb-10 group-hover:bg-bejo-600 group-hover:text-white transition-all shadow-sm">
                <Icon icon="lucide:key-round" class="size-10" />
              </div>
              <h3 class="text-3xl font-black text-slate-900 mb-6">Sewa Hunian</h3>
              <p class="text-base font-medium text-slate-500 leading-relaxed opacity-80">Cari kost atau sewa rumah jangka panjang dengan proses kontrak yang transparan.</p>
            </div>
          </div>
          <div class="bg-white p-12 rounded-[3.5rem] border border-slate-100 hover:border-bejo-200 shadow-premium hover:shadow-bejo-premium transition-all duration-700 group relative overflow-hidden">
            <div class="absolute -right-6 -top-6 size-32 bg-bejo-50 rounded-full group-hover:scale-150 transition-transform duration-700 -z-0"></div>
            <div class="relative z-10">
              <div class="size-20 rounded-3xl bg-bejo-50 text-bejo-600 flex items-center justify-center mb-10 group-hover:bg-bejo-600 group-hover:text-white transition-all shadow-sm">
                <Icon icon="lucide:calculator" class="size-10" />
              </div>
              <h3 class="text-3xl font-black text-slate-900 mb-6">Simulasi KPR</h3>
              <p class="text-base font-medium text-slate-500 leading-relaxed opacity-80">Plafon pinjaman dan angsuran bulanan yang disesuaikan dengan profil finansial.</p>
            </div>
          </div>
          <div class="bg-white p-12 rounded-[3.5rem] border border-slate-100 hover:border-bejo-200 shadow-premium hover:shadow-bejo-premium transition-all duration-700 group relative overflow-hidden">
            <div class="absolute -right-6 -top-6 size-32 bg-bejo-50 rounded-full group-hover:scale-150 transition-transform duration-700 -z-0"></div>
            <div class="relative z-10">
              <div class="size-20 rounded-3xl bg-bejo-50 text-bejo-600 flex items-center justify-center mb-10 group-hover:bg-bejo-600 group-hover:text-white transition-all shadow-sm">
                <Icon icon="lucide:shield-check" class="size-10" />
              </div>
              <h3 class="text-3xl font-black text-slate-900 mb-6">Legalitas Aman</h3>
              <p class="text-base font-medium text-slate-500 leading-relaxed opacity-80">Jaminan keamanan dokumen sertifikat (SHM/SHGB) setiap unit properti kami.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Us Section -->
    <section class="py-20 sm:py-32 bg-white relative overflow-hidden">
      <!-- Decor -->
      <div class="absolute -top-40 -left-40 size-[600px] bg-bejo-50/50 rounded-full blur-[120px] pointer-events-none"></div>

      <div class="w-full px-4 sm:px-8 lg:px-12 relative z-10">
        <div class="grid lg:grid-cols-2 gap-20 lg:gap-32 items-center">
          <div class="relative group">
            <div class="aspect-square rounded-[4rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] relative z-10 border-[16px] border-white transition-transform duration-700 group-hover:scale-[1.02]">
              <img :src="randomProduct?.MediaUrls?.[0]?.Id_Media || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'" alt="Properties" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            <!-- Decorative elements -->
            <div class="absolute -bottom-12 -right-12 w-64 aspect-square bg-bejo-500 rounded-[3rem] -z-0 opacity-10 animate-pulse"></div>
            <div class="absolute -top-8 -left-8 size-40 bg-slate-900/5 rounded-full -z-0"></div>

            <!-- Floating Property Info -->
            <div v-if="randomProduct" class="absolute -bottom-6 -left-6 md:-left-12 w-72 md:w-80 glass backdrop-blur-3xl rounded-[2.5rem] z-20 p-8 flex flex-col gap-6 shadow-premium border border-white/60 transform hover:-translate-y-3 transition-all duration-700">
              <div class="flex items-center gap-5">
                <div class="size-14 rounded-2xl bg-bejo-600 text-white flex items-center justify-center shadow-bejo-premium">
                  <Icon icon="lucide:home" class="size-7" />
                </div>
                <div class="min-w-0">
                  <span class="block text-base font-black text-slate-900 truncate tracking-tight">{{ randomProduct.Nama_Produk }}</span>
                  <span class="text-[10px] font-black text-bejo-600 uppercase tracking-[0.25em]">{{ randomProduct.Tipe }}</span>
                </div>
              </div>
              <div class="space-y-4 pt-4 border-t border-slate-100/50">
                <div class="flex items-start gap-3">
                  <Icon icon="lucide:map-pin" class="size-4 text-slate-400 mt-1" />
                  <span class="text-[11px] font-bold text-slate-500 leading-relaxed line-clamp-2">{{ randomProduct.Alamat.split('Lat:')[0].trim() }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                    <Icon icon="lucide:map" class="size-3.5 text-slate-400" />
                    <span class="text-[10px] font-black text-slate-700 uppercase tracking-widest">{{ randomProduct.Nama_Kota || 'Lokasi Terjamin' }}</span>
                  </div>
                  <RouterLink :to="`/detail/${randomProduct.Slug}`" class="text-[10px] font-black text-bejo-600 uppercase tracking-widest hover:text-bejo-800 flex items-center gap-2 group/link">
                    Detail
                    <Icon icon="lucide:chevron-right" class="size-4 group-hover/link:translate-x-1 transition-transform" />
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-12">
            <div class="space-y-6">
              <span class="text-bejo-600 font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-3">
                <div class="w-10 h-[2px] bg-bejo-500"></div>
                Kenapa Kami?
              </span>
              <h2 class="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Mengapa Anda Merasa <br /><span class="relative">
                  <span class="relative z-10 italic">Beruntung</span>
                  <div class="absolute bottom-1 left-0 right-0 h-4 bg-bejo-100 -z-0"></div>
                </span>
                di {{ settingsStore.business.appName }}?
              </h2>
            </div>

            <div class="space-y-12">
              <div class="flex gap-10 group hover-float">
                <div class="size-24 rounded-[2rem] bg-white border border-slate-100 shadow-premium flex items-center justify-center shrink-0 group-hover:bg-bejo-600 group-hover:text-white transition-all duration-700">
                  <Icon icon="lucide:verified" class="size-12 text-bejo-600 group-hover:text-white" />
                </div>
                <div class="space-y-4 pt-3">
                  <h4 class="text-3xl font-black text-slate-900 tracking-tight">100% Data Tervalidasi</h4>
                  <p class="text-base font-medium text-slate-500 leading-relaxed opacity-80">Semua unit melalui verifikasi lapangan oleh tim {{ settingsStore.business.appName }} untuk menjamin akurasi info 1:1.</p>
                </div>
              </div>
              <div class="flex gap-10 group hover-float">
                <div class="size-24 rounded-[2rem] bg-white border border-slate-100 shadow-premium flex items-center justify-center shrink-0 group-hover:bg-bejo-600 group-hover:text-white transition-all duration-700">
                  <Icon icon="lucide:user-check-2" class="size-12 text-bejo-600 group-hover:text-white" />
                </div>
                <div class="space-y-4 pt-3">
                  <h4 class="text-3xl font-black text-slate-900 tracking-tight">Personal Agent Dedicated</h4>
                  <p class="text-base font-medium text-slate-500 leading-relaxed opacity-80">Dapatkan asisten pribadi yang siap menemani proses survei unit hingga tanda tangan akad di hadapan Notaris.</p>
                </div>
              </div>
              <div class="flex gap-10 group hover-float">
                <div class="size-24 rounded-[2rem] bg-white border border-slate-100 shadow-premium flex items-center justify-center shrink-0 group-hover:bg-bejo-600 group-hover:text-white transition-all duration-700">
                  <Icon icon="lucide:banknote" class="size-12 text-bejo-600 group-hover:text-white" />
                </div>
                <div class="space-y-4 pt-3">
                  <h4 class="text-3xl font-black text-slate-900 tracking-tight">Investasi Aman & Terjamin</h4>
                  <p class="text-base font-medium text-slate-500 leading-relaxed opacity-80">Sistem transaksi legal yang diawasi oleh Notaris berpengalaman untuk menjamin keamanan aset dan dana Anda.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </GuestLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import GuestLayout from '@/layouts/guest.vue'
import api from '@/services/axios'
import ProductCard from '@/components/ProductCard.vue'
import IndonesiaMap from './components/IndonesiaMap.vue'
import { useSettings } from '@/stores/settings'

const scrollContainer = ref<HTMLElement | null>(null)

const scroll = (direction: 'left' | 'right') => {
  if (!scrollContainer.value) return
  const container = scrollContainer.value
  const cardWidth = container.querySelector('.shrink-0')?.clientWidth || 300
  const gap = 32 // gap-8
  const scrollAmount = cardWidth + gap

  const currentScroll = container.scrollLeft
  const maxScroll = container.scrollWidth - container.clientWidth

  if (direction === 'right') {
    // If we are at the end, jump back to start
    if (Math.ceil(currentScroll + container.clientWidth) >= container.scrollWidth - 10) {
      container.scrollTo({ left: 0, behavior: 'smooth' })
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  } else {
    // If we are at the start, jump to end
    if (currentScroll <= 10) {
      container.scrollTo({ left: maxScroll, behavior: 'smooth' })
    } else {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    }
  }
}

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
  Nama_Kota?: string
  Hide_alamat: boolean
  MediaUrls: { Id_Media: string }[]
}

const settingsStore = useSettings()
const router = useRouter()
const isLoading = ref(true)
const displayedProducts = ref<ProductPreview[]>([])
const allProducts = ref<ProductPreview[]>([])

const heroSearch = ref('')

const handleHeroSearch = () => {
  if (heroSearch.value.trim()) {
    router.push({
      path: '/katalog',
      query: { search: heroSearch.value.trim() }
    })
  } else {
    router.push('/katalog')
  }
}

const quickSearch = (tag: string) => {
  router.push({
    path: '/katalog',
    query: { search: tag }
  })
}

// Logic for random product in Why Us section
const randomProduct = computed(() => {
  if (allProducts.value.length === 0) return null
  return allProducts.value[Math.floor(Math.random() * allProducts.value.length)]
})

const fetchData = async () => {
  try {
    const { data } = await api.get('/api/realEstate/getAll', {
      headers: {
        'X-Jenis-User': 'Admin',
        'Api-Key': 'realestate_key_2024'
      }
    })

    if (data && data.Data) {
      const actualData = data.Data || []
      allProducts.value = actualData

      // Filter Aktif & Tersedia
      const validProducts = actualData.filter((p: any) => p.Status_Display === 'Aktif' && p.Status_Properti === 'Tersedia')

      // Get up to 8 products for a richer carousel
      const products = validProducts.slice(0, 8)

      // Pastikan tampil minimal 4 (tambah mock jika kurang)
      if (products.length < 4) {
        const mockItems = [
          {
            No_Id: 'mock_pakuwon_1',
            Nama_Produk: 'Pakuwon Waterplace Residence',
            Slug: 'pakuwon-waterplace-residence',
            Alamat: 'Tower A, Lantai 15 (surabaya selatan)',
            Tipe: 'Apartemen',
            Luas_Bangunan: 56,
            Area: ['Kelurahan, Kecamatan, Kota Surabaya, Jawa Timur', 'Surabaya Selatan'],
            Status_Display: 'Aktif',
            Status_Properti: 'Tersedia',
            Status_Transaksi: ['Sewa'],
            Harga_Sewa1: 80000000,
            Harga_Sewa2: 55000000,
            Satuan_Minimal_Sewa: 'Tahun',
            Jumlah_Kamar_Tidur: 2,
            Jumlah_Kamar_Mandi: 1,
            Akses_Jalan: ['10 Menit ke Tol Satelit', '5 Menit ke National Hospital'],
            MediaUrls: [{ Id_Media: 'https://images.unsplash.com/photo-1545324418-f1d3ac1ef739?auto=format&fit=crop&q=80&w=800' }]
          },
          {
            No_Id: 'mock_graha_1',
            Nama_Produk: 'Graha Famili Modern Mansion',
            Slug: 'graha-famili-modern-mansion',
            Alamat: 'Blok AA, Cluster Luxury Park',
            Tipe: 'Rumah',
            Luas_Bangunan: 250,
            Area: ['Kelurahan, Kecamatan, Kota Surabaya, Jawa Timur', 'Surabaya Barat'],
            Status_Display: 'Aktif',
            Status_Properti: 'Tersedia',
            Status_Transaksi: ['Jual'],
            Harga_Jual1: 5200000000,
            Harga_Jual2: 4900000000,
            Jumlah_Kamar_Tidur: 4,
            Jumlah_Kamar_Mandi: 3,
            Akses_Jalan: ['Dekat National Hospital', 'Area Komersial Walk-in'],
            MediaUrls: [{ Id_Media: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800' }]
          },
          {
            No_Id: 'mock_rosebay_1',
            Nama_Produk: 'The Rosebay Low-Rise Condo',
            Slug: 'the-rosebay-low-rise-condo',
            Alamat: 'Graha Famili, Surabaya Barat',
            Tipe: 'Apartemen',
            Luas_Bangunan: 120,
            Area: ['Kelurahan, Kecamatan, Kota Surabaya, Jawa Timur', 'Surabaya Barat'],
            Status_Display: 'Aktif',
            Status_Properti: 'Tersedia',
            Status_Transaksi: ['Jual', 'Sewa'],
            Harga_Jual1: 2800000000,
            Harga_Jual2: 0,
            Harga_Sewa1: 150000000,
            Satuan_Minimal_Sewa: 'Tahun',
            Jumlah_Kamar_Tidur: 2,
            Jumlah_Kamar_Mandi: 2,
            Akses_Jalan: ['Langsung ke Lapangan Golf', 'Privasi Tinggi'],
            MediaUrls: [{ Id_Media: 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&q=80&w=800' }]
          },
          {
            No_Id: 'mock_ciputra_1',
            Nama_Produk: 'Ciputra World Sky Loft',
            Slug: 'ciputra-world-sky-loft',
            Alamat: 'CBD Ciputra World, Surabaya Pusat',
            Tipe: 'Apartemen',
            Luas_Bangunan: 85,
            Area: ['Kelurahan, Kecamatan, Kota Surabaya, Jawa Timur', 'Surabaya Pusat'],
            Status_Display: 'Aktif',
            Status_Properti: 'Tersedia',
            Status_Transaksi: ['Sewa'],
            Harga_Sewa1: 120000000,
            Harga_Sewa2: 105000000,
            Satuan_Minimal_Sewa: 'Tahun',
            Jumlah_Kamar_Tidur: 1,
            Jumlah_Kamar_Mandi: 1,
            Akses_Jalan: ['Koneksi Mall Direct', 'Pusat Kota'],
            MediaUrls: [{ Id_Media: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800' }]
          }
        ]

        let i = 0
        while (products.length < 4 && i < mockItems.length) {
          const mock = mockItems[i]
          if (!products.some((p: ProductPreview) => p.Nama_Produk === mock.Nama_Produk)) {
            products.push(mock as any)
          }
          i++
        }
      }

      displayedProducts.value = products
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

.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #f1f5f9 transparent;
}
.custom-scroll::-webkit-scrollbar {
  height: 6px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #f1f5f9;
  border-radius: 20px;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes scroll-hint {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(200%);
  }
  100% {
    transform: translateX(-100%);
  }
}
.animate-scroll-hint {
  animation: scroll-hint 3s infinite ease-in-out;
}
</style>
