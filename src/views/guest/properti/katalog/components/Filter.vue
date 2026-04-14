<template>
  <div ref="filterRef" :class="[!openFilter ? 'hidden lg:block' : 'block']" class="z-[60] fixed inset-x-4 bottom-6 lg:static lg:w-full lg:inset-auto">
    <div class="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h6 class="text-lg font-bold text-slate-800 tracking-tight uppercase">Filter</h6>
          <button @click="$emit('update:searchQuery', '')" class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors underline underline-offset-4 decoration-transparent hover:decoration-red-500">Hapus Semua</button>
        </div>

        <div class="space-y-5">
          <div class="relative group">
            <input 
              :value="searchQuery"
              @input="(e) => $emit('update:searchQuery', (e.target as HTMLInputElement).value)"
              type="text" 
              class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-bejo-500 focus:bg-white transition-all outline-none focus:ring-4 focus:ring-bejo-500/10" 
              placeholder="Cari nama atau lokasi..." 
            />
            <Icon icon="lucide:search" class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-bejo-600 transition-colors" />
          </div>

          <div class="hs-accordion-group space-y-4">

            <div class="hs-accordion active" id="filter-lokasi">
              <button class="hs-accordion-toggle flex items-center justify-between w-full font-semibold text-xs uppercase tracking-widest text-slate-500 pb-2 border-b border-slate-200" aria-expanded="true" aria-controls="content-lokasi">
                Lokasi
                <Icon icon="lucide:chevron-down" class="size-4 hs-accordion-active:rotate-180 transition-transform" />
              </button>
              <div id="content-lokasi" class="hs-accordion-content w-full overflow-hidden transition-[height] duration-300">
                <div class="grid grid-cols-1 gap-2.5 pt-4">
                  <label v-for="loc in ['DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Bali']" :key="loc" class="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" class="size-4 rounded border-slate-300 text-bejo-600 focus:ring-bejo-500/20 transition-all cursor-pointer" />
                    <span class="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{{ loc }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="hs-accordion active" id="filter-harga">
              <button class="hs-accordion-toggle flex items-center justify-between w-full font-semibold text-xs uppercase tracking-widest text-slate-500 pb-2 border-b border-slate-200 mt-2" aria-expanded="true" aria-controls="content-harga">
                Rentang Harga
                <Icon icon="lucide:chevron-down" class="size-4 hs-accordion-active:rotate-180 transition-transform" />
              </button>
              <div id="content-harga" class="hs-accordion-content w-full overflow-hidden transition-[height] duration-300">
                <div class="flex items-center gap-2 pt-4">
                  <div class="relative flex-1">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">Rp</span>
                    <input type="number" class="w-full pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-bejo-500 focus:bg-white transition-all focus:ring-4 focus:ring-bejo-500/10" placeholder="Min" />
                  </div>
                  <span class="text-slate-300 font-bold">-</span>
                  <div class="relative flex-1">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">Rp</span>
                    <input type="number" class="w-full pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-bejo-500 focus:bg-white transition-all focus:ring-4 focus:ring-bejo-500/10" placeholder="Max" />
                  </div>
                </div>
              </div>
            </div>

            <div class="hs-accordion active" id="filter-spek">
              <button class="hs-accordion-toggle flex items-center justify-between w-full font-semibold text-xs uppercase tracking-widest text-slate-500 pb-2 border-b border-slate-200 mt-2" aria-expanded="true" aria-controls="content-spek">
                Kebutuhan Ruang
                <Icon icon="lucide:chevron-down" class="size-4 hs-accordion-active:rotate-180 transition-transform" />
              </button>
              <div id="content-spek" class="hs-accordion-content w-full overflow-hidden transition-[height] duration-300">
                <div class="grid grid-cols-2 gap-3 pt-4">
                  <div class="relative">
                    <Icon icon="lucide:bed" class="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <input type="text" class="w-full pl-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-bejo-500 focus:bg-white transition-all outline-none focus:ring-4 focus:ring-bejo-500/10" placeholder="Kamar Tidur" />
                  </div>
                  <div class="relative">
                    <Icon icon="lucide:bath" class="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <input type="text" class="w-full pl-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-bejo-500 focus:bg-white transition-all outline-none focus:ring-4 focus:ring-bejo-500/10" placeholder="Kamar Mandi" />
                  </div>
                  <div class="relative">
                    <Icon icon="lucide:car" class="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <input type="text" class="w-full pl-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-bejo-500 focus:bg-white transition-all outline-none focus:ring-4 focus:ring-bejo-500/10" placeholder="Mobil (Carpt)" />
                  </div>
                  <div class="relative">
                    <Icon icon="lucide:layers" class="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <input type="text" class="w-full pl-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-bejo-500 focus:bg-white transition-all outline-none focus:ring-4 focus:ring-bejo-500/10" placeholder="Jml Lantai" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div class="mt-8 pt-6 border-t border-slate-200">
          <button class="w-full py-3 bg-bejo-600 text-white rounded-xl font-bold hover:bg-bejo-700 transition-colors uppercase tracking-widest text-xs border border-transparent shadow shadow-bejo-600/20 hover:shadow-lg hover:shadow-bejo-600/40 active:scale-95">
            Terapkan Filter
          </button>

          <button @click="$emit('update:openFilter', false)" class="lg:hidden w-full mt-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest hover:text-slate-700">
            Tutup Filter
          </button>
        </div>
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

// Logika Klik Diluar Filter (Untuk mobile)
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (props.openFilter && filterRef.value) {
    // Abaikan jika yang diklik adalah trigger button dari Rumah.vue
    const isTrigger = target.closest('button') && target.innerText.includes('Filter')
    if (!filterRef.value.contains(target) && !isTrigger) {
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
