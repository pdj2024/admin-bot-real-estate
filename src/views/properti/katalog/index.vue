<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import Vertical from '@/layouts/vertical.vue'
import Filter from './components/Filter.vue'
import Rumah from './components/Rumah.vue'

const isFilterOpen = ref(false)
const rumahRef = ref<any>(null)

const toggleFilter = () => {
  isFilterOpen.value = !isFilterOpen.value
}

const openAddModal = () => {
  rumahRef.value?.openAddModal()
}
</script>

<template>
  <Vertical>
    <div class="p-4 md:p-6 md:pt-4 pb-32 space-y-6 md:space-y-8">
      <!-- Main Catalog Content -->
      <div class="grid lg:grid-cols-4 grid-cols-1 gap-6 md:gap-8 items-start">
        <aside class="lg:col-span-1">
          <Filter 
            v-model:openFilter="isFilterOpen" 
            class="lg:sticky lg:top-24"
          />
        </aside>
        
        <section class="lg:col-span-3">
          <Rumah 
            ref="rumahRef"
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
