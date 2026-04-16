<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Product } from '../index.vue'
import ProductCard from '@/components/ProductCard.vue'

defineProps<{
  products: Product[],
  isLoading?: boolean
}>()

const router = useRouter()

const goToDetail = (slug: string) => {
  router.push(`/detail/${slug}`)
}
</script>

<template>
  <div v-show="products.length > 0 || isLoading" class="mt-10 mb-20 max-w-7xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-2xl font-extrabold text-slate-900 tracking-tight">Mungkin Anda Juga Suka</h3>
      <RouterLink to="/katalog" class="text-xs font-bold uppercase tracking-widest text-bejo-600 hover:text-bejo-700 hover:underline"> Lihat Semua </RouterLink>
    </div>

    <div class="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
      <template v-if="isLoading">
        <ProductCard v-for="i in 3" :key="i" :product="{}" is-loading />
      </template>
      <template v-else>
        <ProductCard 
          v-for="product in products" 
          :key="product.No_Id" 
          :product="product" 
          @click="goToDetail"
        />
      </template>
    </div>
  </div>
</template>
