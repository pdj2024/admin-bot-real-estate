<template>
  <div class="card border sm:border-none max-h-[85vh] sm:max-h-none">
    <div class="card-body p-4 sm:p-5">
      <div class="flex items-center justify-between gap-3 mb-4 sm:mb-6">
        <h6 class="text-base font-bold text-default-800">Filter Pencarian</h6>
        <button type="button" class="underline text-sm text-primary hover:text-primary-600 transition-all">Hapus Semua</button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-start">
        <div class="space-y-3 sm:space-y-6">
          <div>
            <label class="block text-xs font-semibold text-default-600 mb-1.5 sm:mb-2">Kata Kunci</label>
            <div class="relative">
              <span class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <Icon icon="lucide:search" class="size-4 text-default-400" />
              </span>
              <input type="text" class="py-2 sm:py-2.5 ps-10 pe-4 block w-full bg-default-50 border-default-200 rounded-xl text-sm focus:border-primary focus:ring-primary outline-none" placeholder="Cari properti..." />
            </div>
          </div>

          <div class="hs-accordion active" id="filter-lokasi">
            <button class="hs-accordion-toggle py-2 sm:py-3 inline-flex items-center justify-between gap-x-3 w-full font-bold text-start text-default-800 text-sm" aria-expanded="true">Lokasi</button>
            <div class="hs-accordion-content w-full overflow-hidden transition-[height] duration-300" role="region">
              <div class="py-2 grid grid-cols-2 sm:flex sm:flex-col gap-2 sm:gap-3">
                <label v-for="loc in ['Semua', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Bali']" :key="loc" class="flex gap-2 sm:gap-3 items-center cursor-pointer">
                  <input type="checkbox" class="rounded bg-white border-blue-500 text-blue-500 focus:ring-blue-200 form-checkbox transition-all size-4" />
                  <span class="text-xs sm:text-sm text-default-700 whitespace-nowrap">
                    {{ loc }}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-3 sm:space-y-6 sm:border-s sm:ps-6 border-default-100">
          <div class="hs-accordion active" id="filter-fasilitas">
            <button class="hs-accordion-toggle py-2 sm:py-3 inline-flex items-center justify-between gap-x-3 w-full font-bold text-start text-default-800 text-sm" aria-expanded="true">Fasilitas Minimal</button>
            <div class="hs-accordion-content w-full overflow-hidden transition-[height] duration-300" role="region">
              <div class="py-2 sm:py-4 grid grid-cols-2 gap-2 sm:gap-3">
                <div
                  v-for="fasil in [
                    { i: 'bed', p: 'Kamar' },
                    { i: 'bath', p: 'Toilet' },
                    { i: 'car', p: 'Parkir' },
                    { i: 'layers', p: 'Lantai' }
                  ]"
                  :key="fasil.p"
                  class="relative"
                >
                  <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <Icon :icon="'lucide:' + fasil.i" class="text-default-400 text-sm sm:text-base" />
                  </div>
                  <input type="number" class="py-1.5 sm:py-2 ps-9 sm:ps-10 pe-3 block w-full bg-default-50 border-default-200 rounded-lg text-xs sm:text-sm focus:border-primary focus:ring-primary" :placeholder="fasil.p" />
                </div>
              </div>
            </div>
          </div>

          <div class="hs-accordion active" id="filter-harga">
            <button class="hs-accordion-toggle py-2 sm:py-3 inline-flex items-center justify-between gap-x-3 w-full font-bold text-start text-default-800 text-sm" aria-expanded="true">Rentang Harga</button>
            <div class="hs-accordion-content w-full overflow-hidden transition-[height] duration-300" role="region">
              <div class="py-2 sm:py-4 flex items-center gap-2">
                <div class="relative flex-1">
                  <span class="absolute inset-y-0 start-0 flex items-center ps-2 sm:ps-3 pointer-events-none text-[10px] sm:text-xs text-default-400">Rp</span>
                  <input type="number" class="py-1.5 sm:py-2 ps-7 sm:ps-9 pe-2 block w-full bg-default-50 border-default-200 rounded-lg text-xs sm:text-sm focus:border-primary focus:ring-primary" placeholder="Min" />
                </div>
                <span class="text-default-400 text-xs">—</span>
                <div class="relative flex-1">
                  <span class="absolute inset-y-0 start-0 flex items-center ps-2 sm:ps-3 pointer-events-none text-[10px] sm:text-xs text-default-400">Rp</span>
                  <input type="number" class="py-1.5 sm:py-2 ps-7 sm:ps-9 pe-2 block w-full bg-default-50 border-default-200 rounded-lg text-xs sm:text-sm focus:border-primary focus:ring-primary" placeholder="Max" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 sm:mt-8 border-t border-default-100 pt-4">
        <button class="w-full py-2.5 sm:py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-primary-600 transition-all text-sm sm:text-base">Terapkan Filter</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
</script>
