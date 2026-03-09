<template>
  <Vertical>
    <PageTitle subtitle="Kelola" title="Katalog" />
    <div class="grid lg:grid-cols-4 grid-cols-1 gap-5">
      <Filter v-model:openFilter="isFilterOpen" />

      <Rumah class="lg:col-span-3" @openFilter="isFilterOpen = !isFilterOpen" />
    </div>
  </Vertical>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PageTitle from '@/components/PageTitle.vue'
import Vertical from '@/layouts/vertical.vue'
import Filter from './components/Filter.vue'
import Rumah from './components/Rumah.vue'

const isFilterOpen = ref(false)
</script>
