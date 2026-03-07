<template>
  <div class="lg:col-span-3 col-span-1">
    <div class="flex flex-wrap items-center gap-2">
      <p class="text-default-700 text-sm mr-2">
        Menampilkan <b>{{ catalogues.length }}</b> produk
      </p>
      <button type="button" @click="$emit('openFilter')" class="btn-trigger-filter md:hidden w-full flex justify-center items-center btn btn-sm bg-primary/10 hover:bg-primary/30 text-primary py-2 rounded-xl"><Icon icon="lucide:sliders-horizontal" class="size-4 mr-2" /> Filter</button>
    </div>
    <div class="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 mt-5">
      <div class="card overflow-hidden group" v-for="(item, idx) in catalogues" :key="idx">
        <div class="card-body p-0 relative overflow-hidden">
          <img :src="item.image" alt="rumah" class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110" />
          <span class="absolute top-3 start-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded"> TERSEDIA </span>
        </div>

        <div class="p-4">
          <div class="flex items-center gap-1 text-primary mb-1">
            <Icon icon="lucide:map-pin" class="size-3"></Icon>
            <span class="text-[11px] font-medium uppercase tracking-wider">{{ item.location || 'Surabaya Timur' }}</span>
          </div>
          <div>
            <p class="text-xs font-semibold text-default-400 leading-none mb-1">Tipe {{ item.type || '45' }}</p>
          </div>

          <h6 class="text-base text-default-800 font-bold hover:text-primary transition-all mb-3 line-clamp-1">
            <RouterLink to="">{{ item.name }}</RouterLink>
          </h6>

          <div class="grid grid-cols-3 gap-y-3 gap-x-2 border-y border-default-100 py-3 mb-4">
            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:maximize" class="size-3.5 text-default-400"></Icon>
              <span class="text-xs text-default-600">LB {{ item.buildingSize }}m²</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:layers" class="size-3.5 text-default-400"></Icon>
              <span class="text-xs text-default-600">LT {{ item.landSize }}m²</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:bed" class="size-3.5 text-default-400"></Icon>
              <span class="text-xs text-default-600">{{ item.bedrooms }} Kamar</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:bath" class="size-3.5 text-default-400"></Icon>
              <span class="text-xs text-default-600">{{ item.bathrooms }} WC</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:car" class="size-3.5 text-default-400"></Icon>
              <span class="text-xs text-default-600">{{ item.carport }} Mobil</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:layers" class="size-3.5 text-default-400"></Icon>
              <span class="text-xs text-default-600">{{ item.floors || 1 }} Lantai</span>
            </div>
          </div>

          <div class="flex items-end justify-between gap-2 mt-4">
            <div>
              <p class="text-[10px] text-default-400 leading-none mb-1">Mulai Dari</p>
              <h5 class="text-lg font-bold text-primary">
                {{ item.price }}
              </h5>
            </div>

            <div class="hs-dropdown relative inline-flex">
              <button type="button" class="hs-dropdown-toggle btn size-9 bg-default-200 hover:bg-default-600 text-default-500 hover:text-white" aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown" hs-dropdown-placement="bottom-end">
                <Icon icon="lucide:ellipsis" class="iconify size-4"></Icon>
              </button>
              <div class="hs-dropdown-menu" role="menu">
                <RouterLink class="flex items-center gap-1.5 py-1.5 font-medium px-3 text-default-500 hover:bg-default-150 rounded" to="">
                  <Icon icon="lucide:eye" class="size-3"></Icon>
                  Overview
                </RouterLink>
                <RouterLink class="flex items-center gap-1.5 py-1.5 font-medium px-3 text-default-500 hover:bg-default-150 rounded" to="">
                  <Icon icon="lucide:edit" class="size-3"></Icon>
                  Edit
                </RouterLink>
                <RouterLink class="flex items-center gap-1.5 py-1.5 font-medium px-3 text-default-500 hover:bg-default-150 rounded" to="">
                  <Icon icon="lucide:trash-2" class="size-3"></Icon>
                  Delete
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-wrap md:justify-between justify-center md:gap-0 gap-4 mt-5">
      <p class="text-default-500 text-sm">Showing <b>07</b> of <b>19</b> Results</p>
      <nav class="flex items-center gap-2" aria-label="Pagination">
        <button type="button" class="btn btn-sm border bg-transparent border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10"><Icon icon="lucide:chevron-left" class="size-4 me-1"></Icon> Prev</button>
        <button type="button" class="btn size-7.5 bg-transparent border border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10">1</button>
        <button type="button" class="btn size-7.5 bg-primary text-white">2</button>
        <button type="button" class="btn size-7.5 bg-transparent border border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10">3</button>
        <button type="button" class="btn btn-sm border bg-transparent border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10">
          Next
          <Icon icon="lucide:chevron-right" class="size-4 ms-1"></Icon>
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue' // Tambahkan ini
import { Icon } from '@iconify/vue'
import { catalogues } from './data'
import { RouterLink } from 'vue-router'
import { type IStaticMethods } from 'preline/preline'

// Deklarasi agar TS tidak error
declare global {
  interface Window {
    HSStaticMethods: IStaticMethods
  }
}

const emit = defineEmits<{
  (e: 'openFilter'): void
}>()

onMounted(() => {
  setTimeout(() => {
    if (window.HSStaticMethods) {
      window.HSStaticMethods.autoInit()
    }
  }, 100)
})
</script>
