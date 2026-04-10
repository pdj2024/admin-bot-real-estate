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
      <!-- Premium Header Section -->
      <div class="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 p-6 md:p-8 shadow-xl shadow-slate-200/40">
        <!-- Ambient Background -->
        <div class="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-bejo-50 via-bejo-50/30 to-transparent"></div>
        <div class="absolute -right-20 -top-20 size-96 bg-gradient-to-br from-bejo-100/40 to-bejo-400/20 rounded-full blur-3xl"></div>

        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div class="max-w-xl">
            <h1 class="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight mb-4">
              Kelola <span class="text-bejo-500">Aset Properti</span>
            </h1>
            <p class="text-sm font-bold text-slate-500 leading-relaxed">
              Pantau, tambah, dan perbarui unit properti Anda dengan mudah dalam satu dashboard pusat yang terintegrasi.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-4 shrink-0">
             <!-- Stats Mini Card -->
             <div class="px-6 py-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-lg flex items-center gap-4 group">
                <div class="size-12 rounded-xl bg-bejo-500 flex items-center justify-center text-white shadow-lg shadow-bejo-500/30 group-hover:scale-110 transition-transform">
                  <Icon icon="lucide:home" class="size-6" />
                </div>
                <div>
                   <div class="text-xl font-black text-slate-900 mt-0.5">248</div>
                   <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Unit</div>
                </div>
             </div>

          </div>
        </div>
      </div>

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
