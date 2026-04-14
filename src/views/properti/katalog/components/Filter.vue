<template>
  <!-- <div ref="filterRef" :class="[!openFilter ? 'hidden' : 'block']" class="col-span-1 z-[60] fixed bottom-10 left-1/2 -translate-x-1/2 w-[92vw] md:z-[30] max-w-[390px] "> -->
  <div ref="filterRef" :class="[!openFilter ? 'hidden lg:block' : 'block']" class="col-span-1 z-[30] fixed bottom-10 left-1/2 -translate-x-1/2 w-[92vw] max-w-[390px] lg:static lg:translate-x-0 lg:w-full lg:max-w-none">
    <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden p-8">
      <div class="flex items-center justify-between gap-3 mb-6 border-b border-slate-50 pb-4">
        <h6 class="text-lg font-black text-slate-900">Filter</h6>
        <div class="shrink-0">
          <button @click="emit('update:searchQuery', '')" type="button" class="text-[10px] font-black uppercase tracking-widest text-bejo-600 hover:text-bejo-700 transition-colors">Hapus Semua</button>
        </div>
      </div>

      <div class="space-y-6">
        <!-- Search -->
        <div>
          <div class="relative">
            <input 
              :value="searchQuery"
              @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
              type="text" 
              class="ps-10 py-3 bg-slate-50 border-transparent rounded-xl text-sm w-full focus:bg-white focus:border-bejo-500 focus:ring-4 focus:ring-bejo-500/10 transition-all font-bold placeholder:text-slate-400 placeholder:font-medium" 
              placeholder="Masukkan kata kunci" 
            />
            <div class="absolute inset-y-0 start-0 flex items-center ps-3.5">
              <Icon icon="lucide:search" class="size-4 text-slate-400"></Icon>
            </div>
          </div>
        </div>

        <div class="hs-accordion-group" data-hs-accordion-always-open="">
          <!-- Lokasi Accordion -->
          <div class="hs-accordion active border-b border-slate-50 pb-4" id="filter-lokasi">
            <button class="hs-accordion-toggle group inline-flex items-center justify-between w-full font-black text-start text-slate-900 rounded-lg text-xs uppercase tracking-widest" aria-expanded="true">
              Lokasi
              <Icon icon="lucide:chevron-down" class="size-4 text-slate-400 hs-accordion-active:rotate-180 transition-transform"></Icon>
            </button>
            <div id="filter-lokasi-content" class="hs-accordion-content w-full overflow-hidden transition-[height] duration-300" role="region">
              <div class="mt-4 flex gap-3 flex-col">
                <div v-for="loc in ['Semua', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Bali', 'Sumatra', 'Kalimantan']" :key="loc" class="flex gap-3 items-center group cursor-pointer">
                  <input type="checkbox" class="size-4 rounded-md border-slate-200 text-bejo-500 focus:ring-bejo-500/20" :id="'loc-'+loc" />
                  <label :for="'loc-'+loc" class="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors cursor-pointer">{{ loc }}</label>
                </div>
              </div>
            </div>
          </div>

          <!-- Fasilitas Accordion -->
          <div class="hs-accordion active border-b border-slate-50 py-4" id="filter-fasilitas">
            <button class="hs-accordion-toggle group inline-flex items-center justify-between w-full font-black text-start text-slate-900 rounded-lg text-xs uppercase tracking-widest" aria-expanded="true">
              Fasilitas
              <Icon icon="lucide:chevron-down" class="size-4 text-slate-400 hs-accordion-active:rotate-180 transition-transform"></Icon>
            </button>
            <div id="filter-fasilitas-content" class="hs-accordion-content w-full overflow-hidden transition-[height] duration-300" role="region">
              <div class="mt-4 grid grid-cols-2 gap-3">
                <div v-for="spec in [{icon: 'lucide:bed', label: 'Kamar'}, {icon: 'lucide:bath', label: 'Toilet'}, {icon: 'lucide:car', label: 'Mobil'}, {icon: 'lucide:layers', label: 'Lantai'}]" :key="spec.label" class="relative">
                  <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <Icon :icon="spec.icon" class="text-slate-400 size-4"></Icon>
                  </div>
                  <input type="text" class="py-2.5 ps-9 pe-3 block w-full bg-slate-50 border-transparent rounded-xl text-xs font-bold focus:bg-white focus:border-bejo-500 focus:ring-4 focus:ring-bejo-500/10 transition-all placeholder:font-medium" :placeholder="spec.label" />
                </div>
              </div>
            </div>
          </div>

          <!-- Harga Accordion -->
          <div class="hs-accordion active pt-4" id="filter-harga">
            <button class="hs-accordion-toggle group inline-flex items-center justify-between w-full font-black text-start text-slate-900 rounded-lg text-xs uppercase tracking-widest" aria-expanded="true">
              Harga
              <Icon icon="lucide:chevron-down" class="size-4 text-slate-400 hs-accordion-active:rotate-180 transition-transform"></Icon>
            </button>
            <div id="filter-harga-content" class="hs-accordion-content w-full overflow-hidden transition-[height] duration-300" role="region">
              <div class="mt-4 flex items-center gap-2">
                <div class="relative flex-1">
                  <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <span class="text-[10px] text-slate-400 font-black tracking-tighter">IDR</span>
                  </div>
                  <input type="number" class="py-2.5 ps-9 pe-2 block w-full bg-slate-50 border-transparent rounded-xl text-xs font-bold focus:bg-white focus:border-bejo-500 focus:ring-4 focus:ring-bejo-500/10 transition-all" placeholder="Min" />
                </div>
                <span class="text-slate-300 font-black">—</span>
                <div class="relative flex-1">
                  <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <span class="text-[10px] text-slate-400 font-black tracking-tighter">IDR</span>
                  </div>
                  <input type="number" class="py-2.5 ps-9 pe-2 block w-full bg-slate-50 border-transparent rounded-xl text-xs font-bold focus:bg-white focus:border-bejo-500 focus:ring-4 focus:ring-bejo-500/10 transition-all" placeholder="Max" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <button class="w-full py-4 bg-bejo-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-bejo-500/20 hover:bg-bejo-600 hover:scale-[1.02] active:scale-95 transition-all">
          Terapkan Filter
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  openFilter: boolean
  searchQuery: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:openFilter', value: boolean): void
  (e: 'update:searchQuery', value: string): void
}>()

const filterRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement

  if (props.openFilter && filterRef.value) {
    const clickedOutside = !filterRef.value.contains(target)
    const notTriggerButton = !target.closest('.btn-trigger-filter')

    if (clickedOutside && notTriggerButton) {
      emit('update:openFilter', false)
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
