<template>
  <GuestLayout>
    <div class="mb-10 print:hidden space-y-10">
      <div class="relative overflow-hidden rounded-3xl bg-white border border-slate-200 mt-10 p-8 sm:p-12 shadow-sm">
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
              Temukan ribuan unit properti terbaik dengan desain yang elegan, terverifikasi, dan profesional di seluruh Indonesia.
            </p>
          </div>

          <div class="hidden md:flex items-center justify-end gap-4 lg:gap-6 shrink-0">
            <!-- Box 1: Light Bejo -->
            <div class="flex flex-col items-center justify-center size-24 lg:size-28 rounded-2xl bg-gradient-to-br from-white to-bejo-50 border border-bejo-100 shadow-xl shadow-bejo-200/40 relative group hover:-translate-y-1 transition-transform">
              <Icon icon="lucide:home" class="size-6 lg:size-7 text-bejo-600 mb-2" />
              <span class="text-[10px] font-black text-bejo-800 uppercase tracking-widest text-center px-1 leading-tight">Unit <br /> Pilihan</span>
            </div>
            
            <!-- Box 2: White glass -->
            <div class="flex flex-col items-center justify-center size-24 lg:size-28 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/20 relative group hover:-translate-y-1 transition-transform">
              <Icon icon="lucide:shield-check" class="size-6 lg:size-7 text-emerald-500 mb-2" />
              <span class="text-[10px] font-black text-slate-700 uppercase tracking-widest text-center px-1 leading-tight">Aman & <br /> Legal</span>
            </div>

            <!-- Box 3: Dark Gradient -->
            <div class="flex flex-col items-center justify-center size-24 lg:size-28 rounded-2xl bg-gradient-to-br from-bejo-500 to-bejo-700 border border-bejo-400 shadow-xl shadow-bejo-600/30 relative group hover:-translate-y-1 transition-transform">
              <Icon icon="lucide:gem" class="size-6 lg:size-7 text-white mb-2" />
              <span class="text-[10px] font-black text-white uppercase tracking-widest text-center px-1 leading-tight">Kualitas <br /> Premium</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid lg:grid-cols-4 grid-cols-1 gap-8 items-start">

        <aside class="lg:col-span-1">
          <Filter
            v-model:openFilter="isFilterOpen"
            v-model:searchQuery="searchQuery"
            v-model:facilities="facilities"
            v-model:region="region"
            v-model:priceRange="priceRange"
            :provinces="provinces"
            :isAdmin="isAdmin"
            class="lg:sticky lg:top-24 border border-slate-200"
          />
        </aside>

        <section class="lg:col-span-3">
          <Rumah
            @openFilter="toggleFilter"
            :searchQuery="searchQuery"
            :facilities="facilities"
            :region="region"
            :priceRange="priceRange"
            :isAdmin="isAdmin"
          />
        </section>

      </div>
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

import { PROVINCES } from '@/utils/regions'

const route = useRoute()

// State untuk mengontrol filter-filter
const isFilterOpen = ref(false)
const searchQuery = ref('')
const facilities = ref({
  kamarTidur: '',
  kamarMandi: '',
  carport: '',
  lantai: ''
})
const region = ref({
  province: '',
  city: '',
  provinceId: ''
})
const priceRange = ref({
  min: '',
  max: ''
})

const provinces = ref<any[]>(PROVINCES)

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
