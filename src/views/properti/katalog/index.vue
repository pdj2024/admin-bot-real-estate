<template>
  <Vertical v-if="isLoggedIn">
    <PageTitle subtitle="Kelola" title="Katalog" />
    <div class="grid lg:grid-cols-4 grid-cols-1 gap-5">
      <Filter v-model:openFilter="isFilterOpen" :isAdmin="isAdmin" class="md:z-[30] z-[60] fixed bottom-10 left-1/2 -translate-x-1/2 w-[92vw] max-w-[390px] lg:static lg:translate-x-0 lg:w-full lg:max-w-none" />
      <Rumah class="lg:col-span-3" @openFilter="isFilterOpen = !isFilterOpen" :isAdmin="isAdmin" />
    </div>
  </Vertical>

  <div v-else class="grid lg:grid-cols-4 grid-cols-1 gap-5 p-10">
    <Filter v-model:openFilter="isFilterOpen" :isAdmin="isAdmin" class="md:z-[30] z-[60] fixed bottom-10 left-1/2 -translate-x-1/2 w-[92vw] max-w-[390px] lg:static lg:translate-x-0 lg:w-full lg:max-w-none" />
    <Rumah class="lg:col-span-3" @openFilter="isFilterOpen = !isFilterOpen" :isAdmin="isAdmin" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { isTokenExpired } from '@/services/axios'
import { useRoute } from 'vue-router'

import PageTitle from '@/components/PageTitle.vue'
import Vertical from '@/layouts/vertical.vue'
import Filter from './components/Filter.vue'
import Rumah from './components/Rumah.vue'

const route = useRoute()
const isFilterOpen = ref(false)

const isLoggedIn = computed(() => {
  const token = localStorage.getItem('token')
  const refreshToken = localStorage.getItem('refreshToken')

  const hasTokens = !!token && token !== 'undefined' && !!refreshToken && refreshToken !== 'undefined'

  return hasTokens && !isTokenExpired(token) && route.path == '/properti/katalog'
})

const isAdmin = computed(() => {
  return localStorage.getItem('role_user') == 'admin' && route.path == '/properti/katalog'
})
</script>
