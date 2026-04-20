<template>
  <!-- <div ref="filterRef" :class="[!openFilter ? 'hidden' : 'block']" class="col-span-1 z-[60] fixed bottom-10 left-1/2 -translate-x-1/2 w-[92vw] md:z-[30] max-w-[390px] "> -->
  <div ref="filterRef" :class="[!openFilter ? 'hidden lg:block' : 'block']" class="col-span-1 z-[30] fixed bottom-10 left-1/2 -translate-x-1/2 w-[92vw] max-w-[390px] lg:static lg:translate-x-0 lg:w-full lg:max-w-none">
    <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden p-8">
      <div class="flex items-center justify-between gap-3 mb-6 border-b border-slate-50 pb-4">
        <h6 class="text-lg font-black text-slate-900">Filter</h6>
        <div class="shrink-0">
          <button @click="clearAll" type="button" class="text-[10px] font-black uppercase tracking-widest text-bejo-600 hover:text-bejo-700 transition-colors">Hapus Semua</button>
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
              class="ps-10 py-3 bg-slate-50 border-transparent rounded-xl text-sm w-full focus:bg-white focus:border-bejo-600 focus:ring-4 focus:ring-bejo-600/10 transition-all font-bold placeholder:text-slate-400 placeholder:font-medium" 
              placeholder="Masukkan kata kunci" 
            />
            <div class="absolute inset-y-0 start-0 flex items-center ps-3.5">
              <Icon icon="lucide:search" class="size-4 text-slate-400"></Icon>
            </div>
          </div>
        </div>

        <div class="hs-accordion-group" data-hs-accordion-always-open="">
          <!-- Wilayah Accordion -->
          <div class="hs-accordion active border-b border-slate-50 pb-4" id="filter-regional">
            <button class="hs-accordion-toggle group inline-flex items-center justify-between w-full font-black text-start text-slate-900 rounded-lg text-xs uppercase tracking-widest" aria-expanded="true">
              Wilayah
              <Icon icon="lucide:chevron-down" class="size-4 text-slate-400 hs-accordion-active:rotate-180 transition-transform"></Icon>
            </button>
            <div id="filter-regional-content" :class="[isProvOpen || isCityOpen ? 'overflow-visible' : 'overflow-hidden']" class="hs-accordion-content w-full transition-[height] duration-300" role="region">
              <div class="mt-4 flex gap-4 flex-col">
                <!-- Dropdown Provinsi -->
                <div class="relative w-full" id="prov-dropdown">
                  <button 
                    @click="toggleProv"
                    class="w-full flex items-center justify-between ps-10 py-3 bg-slate-50 border-transparent rounded-xl text-sm transition-all focus:bg-white focus:border-bejo-600 focus:ring-4 focus:ring-bejo-600/10"
                  >
                    <div class="flex items-center gap-2 truncate">
                      <Icon icon="lucide:map" class="size-4 text-slate-400" />
                      <span :class="region.province ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'">
                        {{ region.province || 'Pilih Provinsi' }}
                      </span>
                    </div>
                    <Icon icon="lucide:chevron-down" class="size-4 text-slate-400 transition-transform" :class="isProvOpen ? 'rotate-180' : ''" />
                  </button>

                  <Teleport to="body">
                    <div v-if="isProvOpen" class="fixed z-[9999] bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden" :style="provDropdownStyle">
                    <div class="p-2 border-b border-slate-50 bg-slate-50">
                      <div class="relative">
                        <Icon icon="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input 
                          v-model="searchProv" 
                          type="text" 
                          placeholder="Cari Provinsi..." 
                          class="w-full pl-9 pr-4 py-2 text-sm border-slate-200 rounded-lg outline-none focus:border-bejo-600 transition-all font-medium" 
                          @click.stop 
                        />
                      </div>
                    </div>
                    <div class="p-2 max-h-60 overflow-y-auto custom-scroll min-w-[200px]">
                      <button 
                        type="button"
                        @click.stop="selectProvince('', '')"
                        class="w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-400 hover:bg-slate-50 hover:text-bejo-600 rounded-xl transition-colors"
                      >
                        Semua Provinsi
                      </button>
                      <hr class="my-1 border-slate-50" />
                      <button 
                        v-for="prov in filteredProvinces" 
                        :key="prov.id"
                        type="button"
                        @click.stop="selectProvince(prov.id, prov.name)"
                        class="w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-colors flex items-center justify-between"
                        :class="region.provinceId === prov.id ? 'bg-slate-50 text-bejo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'"
                      >
                        {{ prov.name }}
                        <Icon v-if="region.provinceId === prov.id" icon="lucide:check" class="size-3" />
                      </button>
                      <div v-if="filteredProvinces.length === 0" class="p-4 text-center text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                        Provinsi tidak ditemukan
                      </div>
                    </div>
                    </div>
                  </Teleport>
                </div>

                <!-- Dropdown Kota -->
                <div class="relative w-full" id="city-dropdown">
                  <button 
                    @click="toggleCity"
                    :disabled="!region.provinceId"
                    class="w-full flex items-center justify-between ps-10 py-3 bg-slate-50 border-transparent rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="region.provinceId ? 'focus:bg-white focus:border-bejo-600 focus:ring-4 focus:ring-bejo-600/10' : ''"
                  >
                    <div class="flex items-center gap-2 truncate">
                      <Icon icon="lucide:map-pin" class="size-4 text-slate-400" />
                      <span :class="region.city ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'">
                        {{ region.city || 'Pilih Kota/Kabupaten' }}
                      </span>
                    </div>
                    <Icon icon="lucide:chevron-down" class="size-4 text-slate-400 transition-transform" :class="isCityOpen ? 'rotate-180' : ''" />
                  </button>

                  <Teleport to="body">
                    <div v-if="isCityOpen && region.provinceId" class="fixed z-[9999] bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden" :style="cityDropdownStyle">
                      <div class="p-2 border-b border-slate-50 bg-slate-50">
                        <div class="relative">
                          <Icon icon="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                          <input 
                            v-model="searchCity" 
                            type="text" 
                            placeholder="Cari Kota/Kabupaten..." 
                            class="w-full pl-9 pr-4 py-2 text-sm border-slate-200 rounded-lg outline-none focus:border-bejo-600 transition-all font-medium" 
                            @click.stop 
                          />
                        </div>
                      </div>
                      <div class="p-2 max-h-60 overflow-y-auto custom-scroll min-w-[200px]">
                        <button 
                          type="button"
                          @click.stop="selectCity('')"
                          class="w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-400 hover:bg-slate-50 hover:text-bejo-600 rounded-xl transition-colors"
                        >
                          Semua Kota/Kabupaten
                        </button>
                        <hr class="my-1 border-slate-50" />
                        <button 
                          v-for="city in filteredCities" 
                          :key="city.id"
                          type="button"
                          @click.stop="selectCity(city.name)"
                          class="w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-colors flex items-center justify-between"
                          :class="region.city === city.name ? 'bg-slate-50 text-bejo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'"
                        >
                          {{ city.name }}
                          <Icon v-if="region.city === city.name" icon="lucide:check" class="size-3" />
                        </button>
                        <div v-if="filteredCities.length === 0" class="p-4 text-center text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                          Kota tidak ditemukan
                        </div>
                      </div>
                    </div>
                  </Teleport>
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
                <div class="relative">
                  <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <Icon icon="lucide:bed" class="text-slate-400 size-4"></Icon>
                  </div>
                  <input 
                    :value="facilities.kamarTidur"
                    @input="(e) => handleFacilityInput('kamarTidur', (e.target as HTMLInputElement).value)"
                    type="number" 
                    class="py-2.5 ps-9 pe-3 block w-full bg-slate-50 border-transparent rounded-xl text-xs font-bold focus:bg-white focus:border-bejo-600 focus:ring-4 focus:ring-bejo-600/10 transition-all placeholder:font-medium" 
                    placeholder="Km. Tidur" 
                  />
                </div>
                <div class="relative">
                  <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <Icon icon="lucide:bath" class="text-slate-400 size-4"></Icon>
                  </div>
                  <input 
                    :value="facilities.kamarMandi"
                    @input="(e) => handleFacilityInput('kamarMandi', (e.target as HTMLInputElement).value)"
                    type="number" 
                    class="py-2.5 ps-9 pe-3 block w-full bg-slate-50 border-transparent rounded-xl text-xs font-bold focus:bg-white focus:border-bejo-600 focus:ring-4 focus:ring-bejo-600/10 transition-all placeholder:font-medium" 
                    placeholder="Km. Mandi" 
                  />
                </div>
                <div class="relative">
                  <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <Icon icon="lucide:car" class="text-slate-400 size-4"></Icon>
                  </div>
                  <input 
                    :value="facilities.carport"
                    @input="(e) => handleFacilityInput('carport', (e.target as HTMLInputElement).value)"
                    type="number" 
                    class="py-2.5 ps-9 pe-3 block w-full bg-slate-50 border-transparent rounded-xl text-xs font-bold focus:bg-white focus:border-bejo-600 focus:ring-4 focus:ring-bejo-600/10 transition-all placeholder:font-medium" 
                    placeholder="Carport" 
                  />
                </div>
                <div class="relative">
                  <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <Icon icon="lucide:layers" class="text-slate-400 size-4"></Icon>
                  </div>
                  <input 
                    :value="facilities.lantai"
                    @input="(e) => handleFacilityInput('lantai', (e.target as HTMLInputElement).value)"
                    type="number" 
                    class="py-2.5 ps-9 pe-3 block w-full bg-slate-50 border-transparent rounded-xl text-xs font-bold focus:bg-white focus:border-bejo-600 focus:ring-4 focus:ring-bejo-600/10 transition-all placeholder:font-medium" 
                    placeholder="Lantai" 
                  />
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
                  <input 
                    :value="priceRange.min"
                    @input="(e) => handlePriceInput('min', (e.target as HTMLInputElement).value)"
                    type="number" 
                    class="py-2.5 ps-9 pe-2 block w-full bg-slate-50 border-transparent rounded-xl text-xs font-bold focus:bg-white focus:border-bejo-600 focus:ring-4 focus:ring-bejo-600/10 transition-all" 
                    placeholder="Min" 
                  />
                </div>
                <span class="text-slate-300 font-black">—</span>
                <div class="relative flex-1">
                  <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <span class="text-[10px] text-slate-400 font-black tracking-tighter">IDR</span>
                  </div>
                  <input 
                    :value="priceRange.max"
                    @input="(e) => handlePriceInput('max', (e.target as HTMLInputElement).value)"
                    type="number" 
                    class="py-2.5 ps-9 pe-2 block w-full bg-slate-50 border-transparent rounded-xl text-xs font-bold focus:bg-white focus:border-bejo-600 focus:ring-4 focus:ring-bejo-600/10 transition-all" 
                    placeholder="Max" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <button type="button" @click="$emit('update:openFilter', false)" class="w-full py-4 bg-bejo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-bejo-600/20 hover:bg-bejo-700 hover:scale-[1.02] active:scale-95 transition-all">
          Lihat Hasil
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

interface Props {
  openFilter: boolean
  searchQuery: string
  facilities: {
    kamarTidur: string
    kamarMandi: string
    carport: string
    lantai: string
  }
  region: {
    province: string
    city: string
    provinceId: string
  }
  priceRange: {
    min: string
    max: string
  }
  provinces: any[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:openFilter', value: boolean): void
  (e: 'update:searchQuery', value: string): void
  (e: 'update:facilities', value: Props['facilities']): void
  (e: 'update:region', value: Props['region']): void
  (e: 'update:priceRange', value: Props['priceRange']): void
}>()

const handleFacilityInput = (key: keyof Props['facilities'], value: string) => {
  emit('update:facilities', {
    ...props.facilities,
    [key]: value
  })
}

const isProvOpen = ref(false)
const isCityOpen = ref(false)
const searchProv = ref('')
const searchCity = ref('')
const regencies = ref<any[]>([])

const filteredProvinces = computed(() => {
  if (!searchProv.value) return props.provinces
  return props.provinces.filter(p => 
    p.name.toLowerCase().includes(searchProv.value.toLowerCase())
  )
})

const filteredCities = computed(() => {
  if (!searchCity.value) return regencies.value
  return regencies.value.filter(c => 
    c.name.toLowerCase().includes(searchCity.value.toLowerCase())
  )
})

const provDropdownStyle = ref({})
const cityDropdownStyle = ref({})

const toggleProv = () => {
  isProvOpen.value = !isProvOpen.value
  if (isProvOpen.value) {
    searchProv.value = ''
    isCityOpen.value = false
    const trigger = document.getElementById('prov-dropdown')?.getBoundingClientRect()
    if (trigger) {
      provDropdownStyle.value = {
        top: `${trigger.bottom + 8}px`,
        left: `${trigger.left}px`,
        width: `${trigger.width}px`
      }
    }
  }
}

const toggleCity = () => {
  if (!props.region.provinceId) return
  isCityOpen.value = !isCityOpen.value
  if (isCityOpen.value) {
    searchCity.value = ''
    isProvOpen.value = false
    const trigger = document.getElementById('city-dropdown')?.getBoundingClientRect()
    if (trigger) {
      cityDropdownStyle.value = {
        top: `${trigger.bottom + 8}px`,
        left: `${trigger.left}px`,
        width: `${trigger.width}px`
      }
    }
  }
}

const selectProvince = async (id: string, name: string) => {
  isProvOpen.value = false
  emit('update:region', { provinceId: id, province: name, city: '' })
  if (id) {
    try {
      const res = await fetch(`/region/regencies/${id}.json`)
      regencies.value = await res.json()
    } catch (err) {
      console.error('Error fetching regencies:', err)
    }
  } else {
    regencies.value = []
  }
}

const selectCity = (name: string) => {
  isCityOpen.value = false
  emit('update:region', { ...props.region, city: name })
}

const handlePriceInput = (key: 'min' | 'max', value: string) => {
  emit('update:priceRange', {
    ...props.priceRange,
    [key]: value
  })
}

const clearAll = () => {
  emit('update:searchQuery', '')
  emit('update:facilities', {
    kamarTidur: '',
    kamarMandi: '',
    carport: '',
    lantai: ''
  })
  emit('update:region', { province: '', city: '', provinceId: '' })
  emit('update:priceRange', { min: '', max: '' })
}


const filterRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement

  // Close region dropdowns on click outside
  if (!target.closest('#prov-dropdown')) isProvOpen.value = false
  if (!target.closest('#city-dropdown')) isCityOpen.value = false

  if (props.openFilter && filterRef.value) {
    const clickedOutside = !filterRef.value.contains(target)
    const notTriggerButton = !target.closest('.btn-trigger-filter')

    if (clickedOutside && notTriggerButton) {
      emit('update:openFilter', false)
    }
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
