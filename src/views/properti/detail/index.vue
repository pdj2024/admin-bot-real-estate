<script setup lang="ts">
import Vertical from '@/layouts/vertical.vue'
import SidebarProduct from './components/SidebarProduct.vue'
import ProductDetails from './components/ProductDetails.vue'
import PageTitle from '@/components/PageTitle.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const slug = route.params.slug
console.log(slug)
</script>

<template>
  <Vertical>
    <PageTitle subtitle="Kelola" title="Detail" />
    <div class="grid lg:grid-cols-3 grid-cols-1 lg:gap-5">
      <SidebarProduct />
      <ProductDetails />
    </div>
  </Vertical>
</template>

