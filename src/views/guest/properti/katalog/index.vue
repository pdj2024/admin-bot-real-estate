<template>
  <GuestLayout>
    <div class="mb-10 print:hidden space-y-10">
      <div class="relative overflow-hidden rounded-[3.5rem] bg-white border border-bejo-100 p-12 md:p-16 lg:p-20 shadow-premium">
        <!-- Mesh Gradient Background -->
        <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div class="absolute -top-[30%] -right-[10%] size-[600px] bg-bejo-100/40 rounded-full blur-[100px]"></div>
          <div class="absolute bottom-[-20%] left-[10%] size-[500px] bg-bejo-50/50 rounded-full blur-[120px]"></div>
          <div class="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-bejo-50 via-bejo-50/20 to-transparent"></div>
        </div>

        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div class="max-w-3xl space-y-8">
            <h1 class="text-6xl md:text-7xl text-slate-900 tracking-tighter leading-[0.9] font-black">
              Eksplorasi Katalog <br />
              <span class="text-transparent bg-clip-text bg-gradient-to-br from-bejo-500 via-bejo-600 to-bejo-900">{{ settingsStore.business.appName }}</span>
            </h1>
            <p class="text-slate-500 text-xl font-medium leading-relaxed max-w-xl opacity-80">Temukan ribuan unit properti terbaik dengan desain yang elegan, terverifikasi, dan profesional di seluruh Indonesia.</p>
          </div>

          <div class="hidden md:flex items-center justify-end gap-6 lg:gap-8 shrink-0">
            <!-- Box 1: Light Bejo -->
            <div class="flex flex-col items-center justify-center size-32 rounded-[2.5rem] bg-white border border-bejo-100 shadow-premium hover-float group">
              <div class="size-12 rounded-2xl bg-bejo-50 flex items-center justify-center mb-3 group-hover:bg-bejo-600 group-hover:text-white transition-all">
                <Icon icon="lucide:home" class="size-6 text-bejo-600 group-hover:text-white" />
              </div>
              <span class="text-[10px] font-black text-slate-700 uppercase tracking-widest text-center px-1 leading-tight"
                >Unit <br />
                Pilihan</span
              >
            </div>

            <!-- Box 2: White glass -->
            <div class="flex flex-col items-center justify-center size-32 rounded-[2.5rem] bg-white border border-slate-100 shadow-premium hover-float group">
              <div class="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <Icon icon="lucide:shield-check" class="size-6 text-emerald-500 group-hover:text-white" />
              </div>
              <span class="text-[10px] font-black text-slate-700 uppercase tracking-widest text-center px-1 leading-tight"
                >Aman & <br />
                Legal</span
              >
            </div>

            <!-- Box 3: Dark Gradient -->
            <div class="flex flex-col items-center justify-center size-32 rounded-[2.5rem] bg-gradient-to-br from-bejo-600 to-bejo-900 border border-bejo-700 shadow-bejo-premium hover-float group">
              <div class="size-12 rounded-2xl bg-white/20 flex items-center justify-center mb-3 group-hover:bg-white group-hover:text-bejo-600 transition-all">
                <Icon icon="lucide:gem" class="size-6 text-white group-hover:text-bejo-600" />
              </div>
              <span class="text-[10px] font-black text-white uppercase tracking-widest text-center px-1 leading-tight"
                >Kualitas <br />
                Premium</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="grid xl:grid-cols-4 grid-cols-1 gap-8">
        <aside class="xl:col-span-1">
          <Filter v-model:openFilter="isFilterOpen" v-model:searchQuery="searchQuery" v-model:facilities="facilities" v-model:region="region" v-model:priceRange="priceRange" v-model:transactionType="transactionType" :provinces="provinces" :isAdmin="isAdmin" class="xl:sticky xl:top-24" />
        </aside>

        <section class="xl:col-span-3">
          <Rumah @openFilter="toggleFilter" :searchQuery="searchQuery" v-model:selectedType="selectedType" :facilities="facilities" :region="region" :priceRange="priceRange" v-model:transactionType="transactionType" :isAdmin="isAdmin" />
        </section>
      </div>
    </div>
  </GuestLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useSettings } from '@/stores/settings'

const settingsStore = useSettings()

// Import Layout & Components
import GuestLayout from '@/layouts/guest.vue'
import Filter from './components/Filter.vue'
import Rumah from './components/Rumah.vue'

import { PROVINCES } from '@/utils/regions'

const route = useRoute()
const router = useRouter()

// State untuk mengontrol filter-filter
const isFilterOpen = ref(false)
const searchQuery = ref('')
const selectedType = ref('Semua Tipe')
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
const transactionType = ref('Semua Label')

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

onMounted(() => {
  // Handle query params for region
  const queryProv = route.query.province as string
  const queryCity = route.query.city as string
  const queryType = route.query.type as string
  const queryLabel = route.query.label as string
  const queryPriceMin = route.query.priceMin as string
  const queryPriceMax = route.query.priceMax as string

  let hasFilter = false

  if (queryProv) {
    const foundProv = PROVINCES.find((p) => p.name.toLowerCase() === queryProv.toLowerCase())
    if (foundProv) {
      region.value.province = foundProv.name
      region.value.provinceId = foundProv.id
      hasFilter = true
    } else {
      // If not in PROVINCES list, still set the text for loose filtering
      region.value.province = queryProv
      hasFilter = true
    }
  }

  if (queryCity) {
    region.value.city = queryCity
    hasFilter = true
  }

  if (queryType) {
    selectedType.value = queryType
    hasFilter = true
  }

  if (queryLabel) {
    if (queryLabel.toLowerCase() === 'sewa') {
      transactionType.value = 'Sewa Saja'
    } else if (queryLabel.toLowerCase() === 'jual') {
      transactionType.value = 'Jual Saja'
    }
    hasFilter = true
  }

  if (queryPriceMin) {
    priceRange.value.min = queryPriceMin
    hasFilter = true
  }

  if (queryPriceMax) {
    priceRange.value.max = queryPriceMax
    hasFilter = true
  }

  // Handle global search query
  const querySearch = route.query.search as string
  if (querySearch) {
    searchQuery.value = querySearch
    hasFilter = true
  }

  if (hasFilter) {
    // Clear query params to keep URL clean after initial load
    router.replace({ query: {} })
  }
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
