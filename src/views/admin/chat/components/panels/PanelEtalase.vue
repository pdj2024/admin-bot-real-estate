<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { defineAsyncComponent } from 'vue'

const ProductCard = defineAsyncComponent(() => import('@/components/ProductCard.vue'))

defineProps<{
  openEtalase: boolean,
  isSendingImage: boolean,
  openAppointment: boolean,
  openFilter: boolean,
  isLoadingProducts: boolean,
  filteredProducts: any[],
  activeExpandedProductId: string | null,
  openBrochureSelection: boolean,
  // Filter Props
  facilitiesFilter: any,
  regionFilter: any,
  priceRangeFilter: any,
  transactionTypeFilter: string,
  typeFilter: string,
  provinces: any[],
  searchKatalog: string
}>()

const emit = defineEmits<{
  (e: 'update:searchKatalog', val: string): void
  (e: 'update:openFilter', val: boolean): void
  (e: 'update:activeExpandedProductId', val: string | null): void
  (e: 'update:facilitiesFilter', val: any): void
  (e: 'update:regionFilter', val: any): void
  (e: 'update:priceRangeFilter', val: any): void
  (e: 'update:transactionTypeFilter', val: string): void
  (e: 'update:typeFilter', val: string): void
  (e: 'close'): void
  (e: 'selectUnit', product: any): void
}>()

const Filter = defineAsyncComponent(() => import('@/views/admin/properti/katalog/components/Filter.vue'))
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
            <Icon :icon="openAppointment ? 'lucide:calendar-search' : (openBrochureSelection ? 'lucide:file-text' : 'lucide:blocks')" class="size-5" />
          </div>
          <div>
            <h4 class="text-slate-900 font-extrabold text-lg tracking-tight">
              {{ openAppointment ? 'Pilih Unit untuk Janji Temu' : (openBrochureSelection ? 'Kirim Brosur Digital' : 'Pilih Etalase') }}
            </h4>
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
          
          <div class="flex flex-col gap-3 mb-6">
            <button 
              type="button" 
              @click.stop="emit('update:openFilter', !openFilter)" 
              class="btn-trigger-filter w-full flex justify-center items-center py-3 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all shadow-sm"
              :class="openFilter ? 'bg-bejo-600 text-white shadow-lg shadow-bejo-600/20' : 'bg-bejo-50 hover:bg-bejo-100 text-bejo-600'"
            >
              <Icon :icon="openFilter ? 'lucide:chevron-up' : 'lucide:sliders-horizontal'" class="size-4 mr-2" /> 
              {{ openFilter ? 'Tutup Filter' : 'Filter Pencarian' }}
            </button>

            <!-- Inline Filter Section -->
            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="transform -translate-y-4 opacity-0"
              enter-to-class="transform translate-y-0 opacity-100"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="transform translate-y-0 opacity-100"
              leave-to-class="transform -translate-y-4 opacity-0"
            >
              <div v-if="openFilter" class="w-full rounded-[2rem] border border-slate-100 bg-white shadow-inner p-1">
                <Filter 
                  :openFilter="true"
                  :inline="true"
                  :compact="true"
                  :hideSearch="true"
                  :facilities="facilitiesFilter"
                  :region="regionFilter"
                  :priceRange="priceRangeFilter"
                  :transactionType="transactionTypeFilter"
                  :propertyType="typeFilter"
                  :provinces="provinces"
                  @update:facilities="emit('update:facilitiesFilter', $event)"
                  @update:region="emit('update:regionFilter', $event)"
                  @update:priceRange="emit('update:priceRangeFilter', $event)"
                  @update:transactionType="emit('update:transactionTypeFilter', $event)"
                  @update:propertyType="emit('update:typeFilter', $event)"
                  @update:openFilter="emit('update:openFilter', $event)"
                />
              </div>
            </Transition>
          </div>
        </div>

      <div class="overflow-y-auto px-2 custom-scrollbar flex-1 min-h-0">
        <div v-if="isLoadingProducts" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
          <ProductCard v-for="i in 3" :key="'loading-' + i" :product="{}" is-loading />
        </div>
        <div v-else-if="filteredProducts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
          <ProductCard v-for="product in filteredProducts" :key="product.No_Id" :product="product" :disable-routing="true" :collapsible-details="true" :show-select-button="true" :is-expanded="activeExpandedProductId === product.No_Id" @toggle-expand="emit('update:activeExpandedProductId', $event === activeExpandedProductId ? null : $event)" @select="emit('selectUnit', $event)" />
        </div>
        <div v-else class="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
          <div class="size-20 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
            <Icon icon="lucide:search-x" class="size-10 text-slate-300" />
          </div>
          <h4 class="text-slate-800 font-extrabold text-lg">Unit Tidak Ditemukan</h4>
          <p class="text-slate-500 text-sm font-medium mt-1 text-center max-w-[300px]">Coba sesuaikan filter atau kata kunci pencarian Anda untuk menemukan unit lainnya.</p>
          <button @click="emit('update:openFilter', true)" class="mt-6 px-8 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-bejo-600 uppercase tracking-widest hover:bg-bejo-50 hover:border-bejo-200 transition-all active:scale-95 shadow-sm">Atur Ulang Filter</button>
        </div>
      </div>
    </div>
  </div>
</template>
