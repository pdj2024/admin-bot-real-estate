<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { defineAsyncComponent } from 'vue'

const ProductCard = defineAsyncComponent(() => import('@/components/ProductCard.vue'))

const props = defineProps<{
  openEtalase: boolean
  isSendingImage: boolean
  openAppointment: boolean
  searchKatalog: string
  openFilter: boolean
  isLoadingProducts: boolean
  filteredProducts: any[]
  activeExpandedProductId: string | null
}>()

const emit = defineEmits<{
  (e: 'update:searchKatalog', val: string): void
  (e: 'update:openFilter', val: boolean): void
  (e: 'update:activeExpandedProductId', val: string | null): void
  (e: 'close'): void
  (e: 'selectUnit', product: any): void
}>()
</script>

<template>
  <div v-show="openEtalase || openAppointment" class="fixed inset-0 z-[150] flex items-center justify-center p-3 md:p-8">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="emit('close')" />

    <div class="relative w-full max-w-[1044px] max-h-[90vh] bg-white rounded-[2rem] shadow-2xl p-6 md:p-8 border border-slate-50 overflow-hidden flex flex-col z-10 animate-fade-in-up">
      <div v-if="isSendingImage && openEtalase" class="absolute inset-0 z-[100] bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center">
        <div class="size-16 relative mb-4">
          <div class="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-bejo-500 rounded-full border-t-transparent animate-spin"></div>
          <Icon icon="lucide:send" class="size-6 text-bejo-500 absolute top-1/2 left-1/2 -translate-x-[40%] -translate-y-[40%]" />
        </div>
        <h4 class="text-lg font-black text-slate-800 tracking-tight">Harap Tunggu...</h4>
        <p class="text-xs font-bold text-slate-500 text-center max-w-[250px] mt-1.5 leading-relaxed">Sistem sedang merangkai dan mengirim detail properti ke pelanggan Anda.</p>
      </div>

      <div class="flex items-center justify-between mb-6 px-2 shrink-0">
        <div class="flex items-center gap-3">
          <div class="size-10 rounded-2xl bg-gradient-to-br from-bejo-50 to-bejo-100 flex items-center justify-center text-bejo-600">
            <Icon :icon="openAppointment ? 'lucide:calendar-search' : 'lucide:blocks'" class="size-5" />
          </div>
          <div>
            <h4 class="text-slate-900 font-extrabold text-lg tracking-tight">{{ openAppointment ? 'Pilih Unit untuk Janji Temu' : 'Pilih Etalase' }}</h4>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Pilih unit untuk melanjutkan</p>
          </div>
        </div>
        <button @click.stop="emit('close')" class="size-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
          <Icon icon="lucide:x" class="size-5" />
        </button>
      </div>

      <div class="px-2 shrink-0">
        <div class="relative mb-4 group">
          <Icon icon="lucide:search" class="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-bejo-500 transition-colors" />
          <input type="text" :value="searchKatalog" @input="emit('update:searchKatalog', ($event.target as HTMLInputElement).value)" placeholder="Cari unit atau katalog..." class="w-full bg-slate-50 border-transparent rounded-2xl py-3 pl-11 pr-4 text-sm font-bold focus:bg-white focus:ring-8 focus:ring-bejo-500/5 focus:border-bejo-500 transition-all duration-300 shadow-inner" />
        </div>
        <div class="flex flex-wrap items-center gap-3 mb-6">
          <button type="button" @click.stop="emit('update:openFilter', !openFilter)" class="btn-trigger-filter flex-1 flex justify-center items-center py-3 bg-bejo-50 hover:bg-bejo-100 text-bejo-600 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all shadow-sm"><Icon icon="lucide:sliders-horizontal" class="size-4 mr-2" /> Filter Pencarian</button>
        </div>
      </div>

      <div class="overflow-y-auto px-2 custom-scrollbar flex-1 min-h-0">
        <div v-if="isLoadingProducts" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
          <ProductCard v-for="i in 3" :key="'loading-' + i" :product="{}" is-loading />
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
          <ProductCard v-for="product in filteredProducts" :key="product.No_Id" :product="product" :disable-routing="true" :collapsible-details="true" :show-select-button="true" :is-expanded="activeExpandedProductId === product.No_Id" @toggle-expand="emit('update:activeExpandedProductId', $event === activeExpandedProductId ? null : $event)" @select="emit('selectUnit', $event)" />
        </div>
      </div>
    </div>
  </div>
</template>
