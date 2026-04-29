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
const rumahRef = ref<any>(null)

const toggleFilter = () => {
  isFilterOpen.value = !isFilterOpen.value
}

const provinces = ref<any[]>(PROVINCES)

</script>

<template>
  <Vertical>
    <div class="p-0 md:p-3 md:pt-1 pb-32 space-y-6 md:space-y-8">
      <!-- Main Catalog Content -->
      <div class="grid lg:grid-cols-4 grid-cols-1 gap-6 md:gap-8">
        <aside class="lg:col-span-1">
          <Filter 
            v-model:openFilter="isFilterOpen" 
            v-model:searchQuery="searchQuery"
            v-model:facilities="facilities"
            v-model:region="region"
            v-model:priceRange="priceRange"
            :provinces="provinces"
            class="lg:sticky lg:top-24"
          />
        </aside>
        
        <section class="lg:col-span-3">
          <Rumah 
            ref="rumahRef"
            v-model:searchQuery="searchQuery"
            v-model:facilities="facilities"
            v-model:region="region"
            v-model:priceRange="priceRange"
            @openFilter="toggleFilter" 
            @resetFilter="() => {
              searchQuery = '';
              facilities = { kamarTidur: '', kamarMandi: '', carport: '', lantai: '' };
              region = { province: '', city: '', provinceId: '' };
              priceRange = { min: '', max: '' };
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
