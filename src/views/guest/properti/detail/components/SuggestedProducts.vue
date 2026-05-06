<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Product } from '../index.vue'
import ProductCard from '@/components/ProductCard.vue'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  products: Product[],
  isLoading?: boolean
}>()

const router = useRouter()
const scrollContainer = ref<HTMLElement | null>(null)

const goToDetail = (slug: string) => {
  router.push(`/detail/${slug}`)
}

const scroll = (direction: 'left' | 'right') => {
  if (!scrollContainer.value) return
  const scrollAmount = scrollContainer.value.clientWidth
  scrollContainer.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth'
  })
}
</script>

<template>
  <div v-show="products.length > 0 || isLoading" class="mt-10 mb-20 max-w-7xl mx-auto px-4 lg:px-0">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Mungkin Anda Juga Suka</h3>
      
      <!-- Carousel Navigation (Mobile/Tablet Only) -->
      <div class="flex items-center gap-2 lg:hidden">
        <button @click="scroll('left')" class="size-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-bejo-50 hover:text-bejo-600 transition-all shadow-sm">
          <Icon icon="lucide:chevron-left" class="size-4" />
        </button>
        <button @click="scroll('right')" class="size-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-bejo-50 hover:text-bejo-600 transition-all shadow-sm">
          <Icon icon="lucide:chevron-right" class="size-4" />
        </button>
      </div>

      <RouterLink to="/katalog" class="hidden lg:block text-xs font-bold uppercase tracking-widest text-bejo-600 hover:text-bejo-700 hover:underline"> Lihat Semua </RouterLink>
    </div>

    <!-- Container: Grid on LG, Carousel on MD/SM -->
    <div 
      ref="scrollContainer"
      class="flex lg:grid lg:grid-cols-3 gap-6 overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory lg:snap-none no-scrollbar pb-4"
    >
      <template v-if="isLoading">
        <div v-for="i in 3" :key="i" class="min-w-[85%] md:min-w-[45%] lg:min-w-0 snap-center">
          <ProductCard :product="{}" is-loading />
        </div>
      </template>
      <template v-else>
        <div 
          v-for="product in products" 
          :key="product.No_Id" 
          class="min-w-[85%] md:min-w-[45%] lg:min-w-0 snap-center"
        >
          <ProductCard 
            :product="product" 
            @click="goToDetail"
          />
        </div>
      </template>
    </div>
    
    <div class="mt-6 text-center lg:hidden">
      <RouterLink to="/katalog" class="text-xs font-bold uppercase tracking-widest text-bejo-600 hover:text-bejo-700"> Lihat Semua </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
