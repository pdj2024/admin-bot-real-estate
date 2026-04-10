<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import type { Product } from '../index.vue'
import ProductCard from '@/components/ProductCard.vue'

defineProps<{
  products: Product[],
  isLoading?: boolean
}>()

const router = useRouter()

const formatCurrency = (value: number) => {
  if (value >= 1e12) return 'Rp ' + (value / 1e12).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' T'
  if (value >= 1e9) return 'Rp ' + (value / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' M'
  if (value >= 1e6) return 'Rp ' + (value / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' Jt'
  if (value >= 1e3) return 'Rp ' + (value / 1e3).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' Rb'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

const goToDetail = (slug: string) => {
  router.push(`/detail/${slug}`).then(() => {
    window.location.reload()
  })
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
