<script setup lang="ts">
import { ref } from 'vue'
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
const rumahRef = ref<any>(null)

const toggleFilter = () => {
  isFilterOpen.value = !isFilterOpen.value
}
</script>

<template>
  <Vertical>
    <div class="p-0 md:p-3 md:pt-1 pb-32 space-y-6 md:space-y-8">
      <!-- Main Catalog Content -->
      <div class="grid lg:grid-cols-4 grid-cols-1 gap-6 md:gap-8 items-start">
        <aside class="lg:col-span-1">
          <Filter 
            v-model:openFilter="isFilterOpen" 
            v-model:searchQuery="searchQuery"
            v-model:facilities="facilities"
            class="lg:sticky lg:top-24"
          />
        </aside>
        
        <section class="lg:col-span-3">
          <Rumah 
            ref="rumahRef"
            :searchQuery="searchQuery"
            :facilities="facilities"
            @openFilter="toggleFilter" 
          />
        </section>
      </div>
    </div>
  </Vertical>
</template>

<style scoped>
@reference "@/assets/css/style.css";
</style>
