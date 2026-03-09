<template>
  <div ref="filterRef" :class="[!openFilter ? 'hidden' : 'block']" class="col-span-1 z-[60] fixed bottom-10 left-1/2 -translate-x-1/2 w-[92vw] md:z-[30] max-w-[390px] md:static md:translate-x-0 md:w-full md:max-w-none md:!block">
    <div class="card">
      <div class="card-body">
        <div class="flex items-center justify-between gap-3">
          <h6 class="card-title">Filter</h6>
          <div class="shrink-0">
            <RouterLink to="" class="underline transition-all duration-200 text-default-700 text-sm ease-linear hover:text-primary">Hapus Semua </RouterLink>
          </div>
        </div>
        <div class="mt-4">
          <div class="relative">
            <input type="text" id="hs-leading-icon" name="hs-leading-icon" class="ps-9 form-input form-input-sm w-full" placeholder="Masukkan kata kunci" />
            <div class="absolute inset-y-0 start-0 flex items-center z-20 ps-3">
              <Icon icon="lucide:search" class="size-3.5 text-default-600"></Icon>
            </div>
          </div>
        </div>
        <div class="mt-4">
          <div class="hs-accordion-group" data-hs-accordion-always-open="">
            <div class="hs-accordion active mt-4" id="hs-basic-with-title-and-arrow-stretched-heading-two">
              <button class="hs-accordion-toggle underline inline-flex items-center justify-between gap-x-3 w-full font-semibold text-start text-default-800 rounded-lg disabled:opacity-50 text-sm disabled:pointer-events-none" aria-expanded="true" aria-controls="hs-basic-with-title-and-arrow-stretched-collapse-two">
                Lokasi
                <Icon icon="lucide:chevron-down" class="iconify text-base hs-accordion-active:hidden block"></Icon>
                <Icon icon="lucide:chevron-up" class="iconify text-base hs-accordion-active:block hidden"></Icon>
              </button>
              <div id="hs-basic-with-title-and-arrow-stretched-collapse-two" class="hs-accordion-content w-full overflow-hidden transition-[height] duration-300" role="region" aria-labelledby="hs-basic-with-title-and-arrow-stretched-heading-two">
                <div class="mt-4 flex gap-2 flex-col">
                  <div class="flex gap-2 items-center">
                    <input type="checkbox" class="form-checkbox checked:bg-primary" id="priceAll" />
                    <label for="priceAll" class="text-sm text-default-800 align-middle cursor-pointer"> Semua </label>
                  </div>
                  <div class="flex gap-2 items-center">
                    <input type="checkbox" class="form-checkbox checked:bg-primary" id="price1" />
                    <label for="price1" class="text-sm text-default-800 align-middle cursor-pointer">DKI Jakarta</label>
                  </div>
                  <div class="flex gap-2 items-center">
                    <input type="checkbox" class="form-checkbox checked:bg-primary" id="price2" />
                    <label for="price2" class="text-sm text-default-800 align-middle cursor-pointer">Jawa Barat</label>
                  </div>
                  <div class="flex gap-2 items-center">
                    <input type="checkbox" class="form-checkbox checked:bg-primary" id="price3" />
                    <label for="price3" class="text-sm text-default-800 align-middle cursor-pointer">Jawa Tengah</label>
                  </div>
                  <div class="flex gap-2 items-center">
                    <input type="checkbox" class="form-checkbox checked:bg-primary" id="price4" />
                    <label for="price4" class="text-sm text-default-800 align-middle cursor-pointer">Jawa TImur</label>
                  </div>
                  <div class="flex gap-2 items-center">
                    <input type="checkbox" class="form-checkbox checked:bg-primary" id="price5" />
                    <label for="price5" class="text-sm text-default-800 align-middle cursor-pointer">Bali</label>
                  </div>
                  <div class="flex gap-2 items-center">
                    <input type="checkbox" class="form-checkbox checked:bg-primary" id="price6" />
                    <label for="price6" class="text-sm text-default-800 align-middle cursor-pointer">Sumatra</label>
                  </div>
                  <div class="flex gap-2 items-center">
                    <input type="checkbox" class="form-checkbox checked:bg-primary" id="price7" />
                    <label for="price7" class="text-sm text-default-800 align-middle cursor-pointer">Kalimantan</label>
                  </div>
                </div>
              </div>
            </div>
            <div class="hs-accordion active mt-4" id="hs-property-input-filter">
              <button class="hs-accordion-toggle underline inline-flex items-center justify-between gap-x-3 w-full font-semibold text-start text-default-800 rounded-lg disabled:opacity-50 text-sm disabled:pointer-events-none" aria-expanded="true" aria-controls="property-input-content">
                Fasilitas
                <Icon icon="lucide:chevron-down" class="iconify text-base hs-accordion-active:hidden block"></Icon>
                <Icon icon="lucide:chevron-up" class="iconify text-base hs-accordion-active:block hidden"></Icon>
              </button>
              <div id="property-input-content" class="hs-accordion-content w-full overflow-hidden transition-[height] duration-300" role="region">
                <div class="mt-4 grid grid-cols-2 gap-4">
                  <div class="relative">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                      <Icon icon="lucide:bed" class="text-default-400 text-lg"></Icon>
                    </div>
                    <input type="text" class="py-2 ps-10 pe-3 block w-full bg-transparent border-default-200 rounded-lg text-sm focus:border-primary focus:ring-primary disabled:opacity-50 disabled:pointer-events-none" placeholder="Kamar" />
                  </div>

                  <div class="relative">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                      <Icon icon="lucide:bath" class="text-default-400 text-lg"></Icon>
                    </div>
                    <input type="text" class="py-2 ps-10 pe-3 block w-full bg-transparent border-default-200 rounded-lg text-sm focus:border-primary focus:ring-primary disabled:opacity-50 disabled:pointer-events-none" placeholder="Toilet" />
                  </div>

                  <div class="relative">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                      <Icon icon="lucide:car" class="text-default-400 text-lg"></Icon>
                    </div>
                    <input type="text" class="py-2 ps-10 pe-3 block w-full bg-transparent border-default-200 rounded-lg text-sm focus:border-primary focus:ring-primary disabled:opacity-50 disabled:pointer-events-none" placeholder="Mobil" />
                  </div>

                  <div class="relative">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                      <Icon icon="lucide:layers" class="text-default-400 text-lg"></Icon>
                    </div>
                    <input type="text" class="py-2 ps-10 pe-3 block w-full bg-transparent border-default-200 rounded-lg text-sm focus:border-primary focus:ring-primary disabled:opacity-50 disabled:pointer-events-none" placeholder="Lantai" />
                  </div>
                </div>
              </div>
            </div>
            <div class="hs-accordion active mt-4" id="filter-harga">
              <button class="hs-accordion-toggle underline inline-flex items-center justify-between gap-x-3 w-full font-semibold text-start text-default-800 rounded-lg disabled:opacity-50 text-sm disabled:pointer-events-none focus:text-primary" aria-expanded="true" aria-controls="collapse-harga">
                Harga
                <Icon icon="lucide:chevron-down" class="text-base hs-accordion-active:hidden block"></Icon>
                <Icon icon="lucide:chevron-up" class="text-base hs-accordion-active:block hidden"></Icon>
              </button>

              <div id="collapse-harga" class="hs-accordion-content w-full overflow-hidden transition-[height] duration-300" role="region">
                <div class="mt-4 flex items-center gap-2">
                  <div class="relative flex-1">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                      <span class="text-xs text-default-400 font-medium">Rp</span>
                    </div>
                    <input type="number" class="py-2 ps-9 pe-2 block w-full bg-default-50 border-default-200 rounded-lg text-sm focus:border-primary focus:ring-primary outline-none" placeholder="Min" />
                  </div>

                  <span class="text-default-400">—</span>

                  <div class="relative flex-1">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                      <span class="text-xs text-default-400 font-medium">Rp</span>
                    </div>
                    <input type="number" class="py-2 ps-9 pe-2 block w-full bg-default-50 border-default-200 rounded-lg text-sm focus:border-primary focus:ring-primary outline-none" placeholder="Max" />
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
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { RouterLink } from 'vue-router'
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  openFilter: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:openFilter', value: boolean): void
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
