<template>
  <GuestLayout>

    <div class="mb-10 print:hidden">
      <nav class="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 mb-4 uppercase tracking-widest font-semibold">
        <RouterLink to="/" class="hover:text-bejo-600 transition-colors">Beranda</RouterLink>
        <Icon icon="lucide:chevron-right" class="size-3" />
        <span class="text-slate-800">Katalog Properti</span>
      </nav>

      <div class="relative overflow-hidden rounded-3xl bg-white border border-slate-200 mt-4 p-8 sm:p-12 shadow-sm">
        <!-- Dekorasi Background Ambient gradient menggunakan bejo-100 hingga bejo-1000 -->
        <div class="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-bejo-50 via-bejo-50/50 to-transparent"></div>
        <div class="absolute -right-20 -top-20 size-96 bg-gradient-to-br from-bejo-100 via-bejo-200 to-bejo-400 rounded-full blur-3xl opacity-60"></div>
        <div class="absolute right-10 -bottom-20 size-64 bg-gradient-to-tr from-bejo-300 via-bejo-500 to-bejo-700 rounded-full blur-3xl opacity-30"></div>

        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div class="max-w-2xl">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-[1.1] font-light mb-6">
              Eksplorasi Katalog <br class="hidden sm:block" />
              <span class="font-black text-transparent bg-clip-text bg-gradient-to-r from-bejo-500 via-bejo-700 to-bejo-900">Rumah Bejo</span>
            </h1>
            <p class="text-slate-500 text-lg sm:text-xl font-medium leading-relaxed max-w-xl">
              Temukan ribuan listing properti terbaik dengan desain yang elegan, terverifikasi, dan profesional di seluruh Indonesia.
            </p>
          </div>

          <!-- Bagian kanan yang tadinya kosong kini berisi elemen visual -->
          <div class="hidden md:flex items-center justify-end gap-4 lg:gap-6 shrink-0">
            <!-- Box 1: Light Bejo -->
            <div class="flex flex-col items-center justify-center size-24 lg:size-28 rounded-2xl bg-gradient-to-br from-white to-bejo-50 border border-bejo-100 shadow-xl shadow-bejo-200/40 relative group hover:-translate-y-1 transition-transform">
              <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-bejo-300 to-bejo-500 rounded-t-2xl"></div>
              <span class="text-3xl font-black text-slate-800">1K<span class="text-bejo-600">+</span></span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Listing</span>
            </div>
            
            <!-- Box 2: Dark Bejo -->
            <div class="flex flex-col items-center justify-center size-28 lg:size-32 rounded-3xl bg-gradient-to-br from-bejo-600 via-bejo-700 to-bejo-900 shadow-2xl shadow-bejo-600/40 text-white transform -translate-y-4 hover:-translate-y-6 transition-transform relative overflow-hidden">
               <!-- Highlight -->
              <div class="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent"></div>
              <span class="text-4xl font-black drop-shadow-md">24/7</span>
              <span class="text-[10px] sm:text-xs font-bold text-bejo-200 uppercase tracking-widest mt-2">Dukungan</span>
            </div>
            
            <!-- Box 3: Medium Bejo -->
            <div class="flex flex-col items-center justify-center size-24 lg:size-28 rounded-2xl bg-gradient-to-br from-bejo-50 via-bejo-100 to-bejo-200 border border-bejo-200 shadow-xl shadow-bejo-300/30 group hover:-translate-y-1 transition-transform">
              <Icon icon="lucide:shield-check" class="size-8 text-bejo-600 mb-1" />
              <span class="text-lg font-black text-bejo-900">100%</span>
              <span class="text-[10px] font-bold text-bejo-600/70 uppercase tracking-widest mt-0.5">Aman</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-4 grid-cols-1 gap-8 items-start">

      <aside class="lg:col-span-1">
        <Filter
          v-model:openFilter="isFilterOpen"
          v-model:searchQuery="searchQuery"
          :isAdmin="isAdmin"
          class="lg:sticky lg:top-24 border border-slate-200"
        />
      </aside>

      <section class="lg:col-span-3">
        <Rumah
          @openFilter="toggleFilter"
          :searchQuery="searchQuery"
          :isAdmin="isAdmin"
        />
      </section>

    </div>
  </GuestLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'

// Import Layout & Components
import GuestLayout from '@/layouts/guest.vue'
import Filter from './components/Filter.vue'
import Rumah from './components/Rumah.vue'

const route = useRoute()

// State untuk mengontrol filter di tampilan mobile
const isFilterOpen = ref(false)
const searchQuery = ref('')

const toggleFilter = () => {
  isFilterOpen.value = !isFilterOpen.value
}

/**
 * Logika isAdmin disesuaikan dengan kode asli Anda.
 * Mengecek role dari localStorage dan memastikan berada di path yang benar.
 */
const isAdmin = computed(() => {
  const role = localStorage.getItem('role_user')
  // Path disesuaikan dengan router Anda, contoh: /properti/katalog
  return role === 'admin' && route.path.includes('/properti/katalog')
})

/**
 * Catatan:
 * Logika 'isLoggedIn' dan 'Vertical Layout' (Admin Dashboard)
 * sekarang dikelola secara otomatis oleh 'GuestLayout' melalui sistem slot.
 * Jika Anda ingin membedakan layout secara drastis antara Admin dan Guest,
 * Anda bisa menambahkan v-if pada GuestLayout itu sendiri.
 */
</script>

<style scoped>
@reference "@/assets/css/style.css";
/* Transisi halus saat scroll ke sticky element */
aside {
  transition: all 0.3s ease;
}
</style>
