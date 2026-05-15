<script setup lang="ts">
import { ref } from 'vue'
import { PROVINCES } from '@/utils/regions'
import Vertical from '@/layouts/vertical.vue'
import Filter from './components/Filter.vue'
import Rumah from './components/Rumah.vue'

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
const transactionType = ref('Semua')
const rumahRef = ref<any>(null)

const toggleFilter = () => {
  isFilterOpen.value = !isFilterOpen.value
}

const provinces = ref<any[]>(PROVINCES)

import { useRoute, useRouter } from 'vue-router'
import { onMounted } from 'vue'

const route = useRoute()
const router = useRouter()

onMounted(() => {
  // Handle query params for region
  const queryProv = route.query.province as string
  const queryCity = route.query.city as string
  
  let hasFilter = false
  
  if (queryProv) {
    const foundProv = PROVINCES.find(p => p.name.toLowerCase() === queryProv.toLowerCase())
    if (foundProv) {
      region.value.province = foundProv.name
      region.value.provinceId = foundProv.id
      hasFilter = true
    } else {
      region.value.province = queryProv
      hasFilter = true
    }
  }

  if (queryCity) {
    region.value.city = queryCity
    hasFilter = true
  }

  if (hasFilter) {
    // Clear query params to keep URL clean after initial load
    router.replace({ query: {} })
  }
})

</script>

<template>
  <Vertical>
    <div class="px-4 py-0 md:p-3 md:pt-1 pb-32 space-y-6 md:space-y-8">
      <!-- Main Catalog Content -->
      <div class="grid xl:grid-cols-4 grid-cols-1 gap-6 md:gap-8">
        <aside class="xl:col-span-1">
          <Filter 
            v-model:openFilter="isFilterOpen" 
            v-model:searchQuery="searchQuery"
            v-model:facilities="facilities"
            v-model:region="region"
            v-model:priceRange="priceRange"
            v-model:transactionType="transactionType"
            :provinces="provinces"
            class="xl:sticky xl:top-24"
          />
        </aside>
        
        <section class="xl:col-span-3">
          <Rumah 
            ref="rumahRef"
            v-model:searchQuery="searchQuery"
            v-model:facilities="facilities"
            v-model:region="region"
            v-model:priceRange="priceRange"
            v-model:transactionType="transactionType"
            @openFilter="toggleFilter" 
            @resetFilter="() => {
              searchQuery = '';
              facilities = { kamarTidur: '', kamarMandi: '', carport: '', lantai: '' };
              region = { province: '', city: '', provinceId: '' };
              priceRange = { min: '', max: '' };
              transactionType = 'Semua';
            }"
          />
        </section>
      </div>
    </div>
  </Vertical>
</template>

<style scoped>
@reference "@/assets/css/style.css";
</style>
