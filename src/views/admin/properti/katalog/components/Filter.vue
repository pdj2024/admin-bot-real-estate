<template>
  <div>
    <!-- Backdrop for Mobile -->
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="openFilter" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] xl:hidden" @click="$emit('update:openFilter', false)"></div>
    </Transition>

    <div ref="filterRef" @click.stop :class="[
      !openFilter ? 'opacity-0 scale-95 xl:opacity-100 xl:scale-100 hidden xl:block pointer-events-none xl:pointer-events-auto' : 'opacity-100 scale-100 block',
      inline ? 'w-full' : (compact ? 'z-[250] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] sm:w-[450px]' : 'z-[210] fixed xl:static xl:w-full xl:inset-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 xl:translate-x-0 xl:translate-y-0 w-[95vw] sm:w-[500px] xl:w-full transition-all duration-300 ease-out')
    ]">
      <div :class="[
        inline ? 'bg-white/50 rounded-[2rem] border border-slate-200 shadow-inner' : 'bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-900/10'
      ]" class="overflow-hidden max-h-[90vh] xl:max-h-none flex flex-col">
        <!-- Modal Close Button -->
        <div v-if="!inline && !compact" class="flex justify-end p-4 xl:hidden pb-0">
          <button @click.stop="$emit('update:openFilter', false)" class="size-8 rounded-full bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center">
            <Icon icon="lucide:x" class="size-4" />
          </button>
        </div>

        <div :class="[compact || inline ? 'p-4' : 'p-6']" class="overflow-y-auto custom-scroll lg:overflow-visible">
        <div v-if="compact && !inline" class="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-2xl bg-bejo-50 flex items-center justify-center text-bejo-600">
              <Icon icon="lucide:filter" class="size-5" />
            </div>
            <div>
              <h6 class="text-base font-bold text-slate-800 leading-tight">Filter Pencarian</h6>
              <p class="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Sesuaikan hasil pencarian</p>
            </div>
          </div>
          <button @click.stop="$emit('update:openFilter', false)" class="size-10 rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center">
            <Icon icon="lucide:x" class="size-5" />
          </button>
        </div>

        <div v-if="!compact" class="flex items-center justify-between mb-6">
          <h6 class="text-lg font-bold text-slate-800 tracking-tight uppercase">Filter</h6>
          <button @click="clearAll" class="text-[10px] font-semibold text-bejo-600 uppercase tracking-widest hover:text-red-500 transition-colors underline underline-offset-4 decoration-transparent hover:decoration-red-500">Hapus Semua</button>
        </div>

        <div :class="compact ? 'space-y-3' : 'space-y-5'">
          <div v-if="!hideSearch" class="relative group">
            <input 
              :value="searchQuery"
              @input="(e) => $emit('update:searchQuery', (e.target as HTMLInputElement).value)"
              type="text" 
              class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-bejo-600 focus:bg-white transition-all outline-none focus:ring-4 focus:ring-bejo-600/10" 
              placeholder="Cari nama, lokasi, atau akses..." 
            />
            <Icon icon="lucide:search" class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-bejo-600 transition-colors" />
          </div>

          <div class="hs-accordion-group" :class="compact ? 'space-y-2' : 'space-y-4'">
            <div class="hs-accordion active" id="filter-transaksi">
              <button class="hs-accordion-toggle flex items-center justify-between w-full font-semibold text-xs uppercase tracking-widest text-slate-500 pb-2 border-b border-slate-200" aria-expanded="true" aria-controls="content-transaksi">
                Tipe Transaksi
                <Icon icon="lucide:chevron-down" class="size-4 hs-accordion-active:rotate-180 transition-transform" />
              </button>
              <div id="content-transaksi" class="hs-accordion-content w-full overflow-hidden transition-[height] duration-300">
                <div class="grid grid-cols-2 gap-2" :class="compact ? 'pt-2' : 'pt-4'">
                  <button 
                    v-for="type in ['Semua', 'Jual', 'Sewa']" 
                    :key="type"
                    @click="$emit('update:transactionType', type)"
                    class="rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border text-center"
                    :class="[
                      transactionType === type 
                        ? 'bg-bejo-600 text-white border-bejo-600 shadow-lg shadow-bejo-600/20' 
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-bejo-300 hover:bg-bejo-50 hover:text-bejo-600',
                      compact ? 'px-2 py-1.5' : 'px-3 py-2.5'
                    ]"
                  >
                    {{ type === 'Semua' ? 'Semua' : (type === 'Jual' ? 'Jual Saja' : (type === 'Sewa' ? 'Sewa Saja' : type)) }}
                  </button>
                </div>
              </div>
            <div class="hs-accordion active" id="filter-status">
              <button class="hs-accordion-toggle flex items-center justify-between w-full font-semibold text-xs uppercase tracking-widest text-slate-500 pb-2 border-b border-slate-200 mt-2" aria-expanded="true" aria-controls="content-status">
                Status Properti
                <Icon icon="lucide:chevron-down" class="size-4 hs-accordion-active:rotate-180 transition-transform" />
              </button>
              <div id="content-status" class="hs-accordion-content w-full overflow-hidden transition-[height] duration-300">
                <div class="grid grid-cols-2 gap-2 pt-4">
                  <button 
                    v-for="status in ['Semua', 'Tersedia', 'Terjual', 'Tersewa', 'Draft']" 
                    :key="status"
                    @click="$emit('update:statusSelection', status)"
                    class="rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border text-center px-3 py-2.5"
                    :class="[
                      statusSelection === status 
                        ? 'bg-bejo-600 text-white border-bejo-600 shadow-lg shadow-bejo-600/20' 
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-bejo-300 hover:bg-bejo-50 hover:text-bejo-600'
                    ]"
                  >
                    {{ status }}
                  </button>
                </div>
              </div>
            </div>

            <div class="hs-accordion active" id="filter-tipe">
              <button class="hs-accordion-toggle flex items-center justify-between w-full font-semibold text-xs uppercase tracking-widest text-slate-500 pb-2 border-b border-slate-200" aria-expanded="true" aria-controls="content-tipe">
                Tipe Properti
                <Icon icon="lucide:chevron-down" class="size-4 hs-accordion-active:rotate-180 transition-transform" />
              </button>
              <div id="content-tipe" class="hs-accordion-content w-full transition-[height] duration-300" :class="[isTypeOpen ? 'overflow-visible' : 'overflow-hidden']">
                <div class="space-y-3 pt-4">
                  <div class="relative w-full" id="type-dropdown">
                    <button 
                      @click="toggleType"
                      class="w-full flex items-center justify-between pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 transition-all outline-none focus:border-bejo-600 focus:bg-white focus:ring-4 focus:ring-bejo-600/10"
                    >
                      <div class="flex items-center gap-2 truncate">
                        <Icon icon="lucide:home" class="size-4 text-slate-400" />
                        <span :class="propertyType && propertyType !== 'Semua' ? 'text-slate-800 font-bold' : 'text-slate-400'">
                          {{ propertyType === 'Semua' ? 'Pilih Tipe Properti' : propertyType }}
                        </span>
                      </div>
                      <Icon icon="lucide:chevron-down" class="size-4 text-slate-400 transition-transform" :class="isTypeOpen ? 'rotate-180' : ''" />
                    </button>

                    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95 -translate-y-2" enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 -translate-y-2">
                      <div v-if="isTypeOpen" class="absolute left-0 right-0 top-[calc(100%+4px)] z-[9999] bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden">
                        <div class="p-2 border-b bg-slate-50">
                          <div class="relative">
                            <Icon icon="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <input 
                              v-model="searchType" 
                              type="text" 
                              placeholder="Cari Tipe..." 
                              class="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-bejo-600 transition-all" 
                              @click.stop 
                            />
                          </div>
                        </div>
                        <div class="max-h-[220px] overflow-y-auto custom-scrollbar p-1">
                          <button 
                            v-for="type in filteredPropertyTypes" 
                            :key="type"
                            @click="$emit('update:propertyType', type); isTypeOpen = false"
                            class="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between group"
                            :class="propertyType === type ? 'bg-bejo-50 text-bejo-600' : 'text-slate-600 hover:bg-slate-50'"
                          >
                            <span>{{ type }}</span>
                            <Icon v-if="propertyType === type" icon="lucide:check" class="size-4" />
                          </button>
                          <div v-if="filteredPropertyTypes.length === 0" class="p-4 text-center text-slate-400 text-xs">
                            Tidak ditemukan
                          </div>
                        </div>
                      </div>
                    </Transition>
                  </div>
                </div>
              </div>
            </div>

            <div class="hs-accordion active" id="filter-regional">
              <button class="hs-accordion-toggle flex items-center justify-between w-full font-semibold text-xs uppercase tracking-widest text-slate-500 pb-2 border-b border-slate-200" aria-expanded="true" aria-controls="content-regional">
                Wilayah
                <Icon icon="lucide:chevron-down" class="size-4 hs-accordion-active:rotate-180 transition-transform" />
              </button>
              <div id="content-regional" :class="[isProvOpen || isCityOpen ? 'overflow-visible' : 'overflow-hidden']" class="hs-accordion-content w-full transition-[height] duration-300">
                <div class="space-y-3 pt-4">
                  <!-- Dropdown Provinsi -->
                  <div class="relative w-full" id="prov-dropdown">
                    <button 
                      @click="toggleProv"
                      class="w-full flex items-center justify-between pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 transition-all outline-none focus:border-bejo-600 focus:bg-white focus:ring-4 focus:ring-bejo-600/10"
                    >
                      <div class="flex items-center gap-2 truncate">
                        <Icon icon="lucide:map" class="size-4 text-slate-400" />
                        <span :class="region.province ? 'text-slate-800 font-bold' : 'text-slate-400'">
                          {{ region.province || 'Pilih Provinsi' }}
                        </span>
                      </div>
                      <Icon icon="lucide:chevron-down" class="size-4 text-slate-400 transition-transform" :class="isProvOpen ? 'rotate-180' : ''" />
                    </button>

                    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95 -translate-y-2" enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 -translate-y-2">
                      <div v-if="isProvOpen" class="absolute left-0 right-0 top-[calc(100%+4px)] z-[9999] bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden">
                        <div class="p-2 border-b bg-slate-50">
                          <div class="relative">
                            <Icon icon="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <input 
                              v-model="searchProv" 
                              type="text" 
                              placeholder="Cari Provinsi..." 
                              class="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-bejo-600 transition-all" 
                              @click.stop 
                            />
                          </div>
                        </div>
                        <div class="p-2 max-h-60 overflow-y-auto custom-scroll min-w-[200px]">
                          <button 
                            type="button"
                            @click.stop="selectProvince('', '')"
                            class="w-full text-left px-4 py-2 text-sm font-semibold text-slate-400 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-colors"
                          >
                            Semua Provinsi
                          </button>
                          <hr class="my-1 border-slate-100" />
                          <button 
                            v-for="prov in filteredProvinces" 
                            :key="prov.id"
                            type="button"
                            @click.stop="selectProvince(prov.id, prov.name)"
                            class="w-full text-left px-4 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center justify-between"
                            :class="region.provinceId === prov.id ? 'bg-slate-50 text-bejo-600' : 'text-slate-700 hover:bg-slate-50'"
                          >
                            {{ prov.name }}
                            <Icon v-if="region.provinceId === prov.id" icon="lucide:check" class="size-3" />
                          </button>
                          <div v-if="filteredProvinces.length === 0" class="p-4 text-center text-xs text-slate-400 font-medium">
                            Provinsi tidak ditemukan
                          </div>
                        </div>
                      </div>
                    </Transition>
                  </div>

                  <!-- Dropdown Kota -->
                  <div class="relative w-full" id="city-dropdown">
                    <button 
                      @click="toggleCity"
                      :disabled="!region.provinceId"
                      class="w-full flex items-center justify-between pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      :class="region.provinceId ? 'focus:border-bejo-600 focus:bg-white focus:ring-4 focus:ring-bejo-600/10' : ''"
                    >
                      <div class="flex items-center gap-2 truncate">
                        <Icon icon="lucide:map-pin" class="size-4 text-slate-400" />
                        <span :class="region.city ? 'text-slate-800 font-bold' : 'text-slate-400'">
                          {{ region.city || 'Pilih Kota/Kabupaten' }}
                        </span>
                      </div>
                      <Icon icon="lucide:chevron-down" class="size-4 text-slate-400 transition-transform" :class="isCityOpen ? 'rotate-180' : ''" />
                    </button>

                    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95 -translate-y-2" enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 -translate-y-2">
                      <div v-if="isCityOpen && region.provinceId" class="absolute left-0 right-0 top-[calc(100%+4px)] z-[9999] bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden">
                        <div class="p-2 border-b bg-slate-50">
                          <div class="relative">
                            <Icon icon="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <input 
                              v-model="searchCity" 
                              type="text" 
                              placeholder="Cari Kota/Kabupaten..." 
                              class="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-bejo-600 transition-all font-medium" 
                              @click.stop 
                            />
                          </div>
                        </div>
                        <div class="p-2 max-h-60 overflow-y-auto custom-scroll min-w-[200px]">
                          <button 
                            type="button"
                            @click.stop="selectCity('')"
                            class="w-full text-left px-4 py-2 text-sm font-semibold text-slate-400 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-colors"
                          >
                            Semua Kota/Kabupaten
                          </button>
                          <hr class="my-1 border-slate-100" />
                          <button 
                            v-for="city in filteredCities" 
                            :key="city.id"
                            type="button"
                            @click.stop="selectCity(city.name)"
                            class="w-full text-left px-4 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center justify-between"
                            :class="region.city === city.name ? 'bg-slate-50 text-bejo-600' : 'text-slate-700 hover:bg-slate-50'"
                          >
                            {{ city.name }}
                            <Icon v-if="region.city === city.name" icon="lucide:check" class="size-3" />
                          </button>
                          <div v-if="filteredCities.length === 0" class="p-4 text-center text-xs text-slate-400 font-medium">
                            Kota tidak ditemukan
                          </div>
                        </div>
                      </div>
                    </Transition>
                  </div>
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
                    <input 
                      :value="formatDisplayName(priceRange.min)"
                      @input="(e) => handlePriceInput('min', (e.target as HTMLInputElement).value)"
                      type="text" 
                      class="w-full pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-bejo-600 focus:bg-white transition-all focus:ring-4 focus:ring-bejo-600/10 placeholder:font-medium text-slate-700" 
                      placeholder="Min" 
                    />
                  </div>
                  <span class="text-slate-300 font-bold">-</span>
                  <div class="relative flex-1">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">Rp</span>
                    <input 
                      :value="formatDisplayName(priceRange.max)"
                      @input="(e) => handlePriceInput('max', (e.target as HTMLInputElement).value)"
                      type="text" 
                      class="w-full pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-bejo-600 focus:bg-white transition-all focus:ring-4 focus:ring-bejo-600/10 placeholder:font-medium text-slate-700" 
                      placeholder="Max" 
                    />
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
                    <input 
                      :value="facilities.kamarTidur"
                      @input="(e) => handleFacilityInput('kamarTidur', (e.target as HTMLInputElement).value)"
                      type="number" 
                      class="w-full pl-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-bejo-600 focus:bg-white transition-all outline-none focus:ring-4 focus:ring-bejo-600/10" 
                      placeholder="Km. Tidur" 
                    />
                  </div>
                  <div class="relative">
                    <Icon icon="lucide:bath" class="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <input 
                      :value="facilities.kamarMandi"
                      @input="(e) => handleFacilityInput('kamarMandi', (e.target as HTMLInputElement).value)"
                      type="number" 
                      class="w-full pl-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-bejo-600 focus:bg-white transition-all outline-none focus:ring-4 focus:ring-bejo-600/10" 
                      placeholder="Km. Mandi" 
                    />
                  </div>
                  <div class="relative">
                    <Icon icon="lucide:car" class="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <input 
                      :value="facilities.carport"
                      @input="(e) => handleFacilityInput('carport', (e.target as HTMLInputElement).value)"
                      type="number" 
                      class="w-full pl-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-bejo-600 focus:bg-white transition-all outline-none focus:ring-4 focus:ring-bejo-600/10" 
                      placeholder="Carport" 
                    />
                  </div>
                  <div class="relative">
                    <Icon icon="lucide:layers" class="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <input 
                      :value="facilities.lantai"
                      @input="(e) => handleFacilityInput('lantai', (e.target as HTMLInputElement).value)"
                      type="number" 
                      class="w-full pl-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-bejo-600 focus:bg-white transition-all outline-none focus:ring-4 focus:ring-bejo-600/10" 
                      placeholder="Lantai" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="hs-accordion active" id="filter-row-jalan">
              <button class="hs-accordion-toggle flex items-center justify-between w-full font-semibold text-xs uppercase tracking-widest text-slate-500 pb-2 border-b border-slate-200 mt-2" aria-expanded="true" aria-controls="content-row-jalan">
                Lebar Jalan (Row Jalan)
                <Icon icon="lucide:chevron-down" class="size-4 hs-accordion-active:rotate-180 transition-transform" />
              </button>
              <div id="content-row-jalan" class="hs-accordion-content w-full overflow-hidden transition-[height] duration-300">
                <div class="flex items-center gap-2 pt-4">
                  <div class="relative flex-1">
                    <Icon icon="lucide:road" class="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <input 
                      :value="facilities.rowJalanMin"
                      @input="(e) => handleFacilityInput('rowJalanMin', (e.target as HTMLInputElement).value)"
                      type="number" 
                      step="0.1"
                      class="w-full pl-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-bejo-600 focus:bg-white transition-all outline-none focus:ring-4 focus:ring-bejo-600/10 placeholder:font-medium text-slate-700" 
                      placeholder="Min (Mbl)" 
                    />
                  </div>
                  <span class="text-slate-300 font-bold">-</span>
                  <div class="relative flex-1">
                    <Icon icon="lucide:road" class="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <input 
                      :value="facilities.rowJalanMax"
                      @input="(e) => handleFacilityInput('rowJalanMax', (e.target as HTMLInputElement).value)"
                      type="number" 
                      step="0.1"
                      class="w-full pl-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-bejo-600 focus:bg-white transition-all outline-none focus:ring-4 focus:ring-bejo-600/10 placeholder:font-medium text-slate-700" 
                      placeholder="Max (Mbl)" 
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div class="mt-8 pt-6 border-t border-slate-200 flex gap-3">
          <button v-if="compact" @click="clearAll" class="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl font-bold hover:bg-slate-100 transition-colors uppercase tracking-widest text-[10px] border border-slate-200 active:scale-95 text-center">
            Reset
          </button>
          <button @click.stop="$emit('update:openFilter', false)" class="py-3 bg-bejo-600 text-white rounded-xl font-bold hover:bg-bejo-700 transition-colors uppercase tracking-widest text-xs border border-transparent shadow shadow-bejo-600/20 hover:shadow-lg hover:shadow-bejo-600/40 active:scale-95 text-center" :class="compact ? 'flex-[2]' : 'w-full'">
            Lihat Hasil
          </button>
        </div>
      </div>
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
    kamarTidur: string | number
    kamarMandi: string | number
    carport: string | number
    lantai: string | number
    rowJalanMin?: string | number
    rowJalanMax?: string | number
  }
  region: {
    province: string
    city: string
    provinceId?: string
  }
  priceRange: {
    min: string | number
    max: string | number
  }
  transactionType?: string
  statusSelection?: string
  propertyType?: string
  provinces: any[]
  hideSearch?: boolean
  compact?: boolean
  inline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  transactionType: 'Semua',
  statusSelection: 'Semua',
  propertyType: 'Semua',
  compact: false,
  inline: false
})
const emit = defineEmits<{ 
  (e: 'update:openFilter', value: boolean): void 
  (e: 'update:searchQuery', value: string): void
  (e: 'update:facilities', value: Props['facilities']): void
  (e: 'update:region', value: Props['region']): void
  (e: 'update:priceRange', value: Props['priceRange']): void
  (e: 'update:transactionType', value: string): void
  (e: 'update:statusSelection', value: string): void
  (e: 'update:propertyType', value: string): void
  (e: 'update:priceRange', value: Props['priceRange']): void
  (e: 'update:transactionType', value: string): void
  (e: 'update:propertyType', value: string): void
}>()

const handleFacilityInput = (key: keyof Props['facilities'], value: string) => {
  emit('update:facilities', {
    ...props.facilities,
    [key]: value
  })
}

const isProvOpen = ref(false)
const isCityOpen = ref(false)
const isTypeOpen = ref(false)
const searchProv = ref('')
const searchCity = ref('')
const searchType = ref('')
const regencies = ref<any[]>([])
const propertyTypes = ['Semua', 'Rumah', 'Tanah', 'Ruko', 'Apartemen', 'Gudang', 'Villa', 'SOHO', 'Pabrik', 'Perkantoran', 'Hotel', 'Rumah Kos', 'Stand', 'Toko', 'Gedung', 'Condotel', 'Lain-lain']

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

const filteredPropertyTypes = computed(() => {
  if (!searchType.value) return propertyTypes
  const q = searchType.value.toLowerCase()
  return propertyTypes.filter(t => t.toLowerCase().includes(q))
})

const provDropdownStyle = ref({})
const cityDropdownStyle = ref({})
const typeDropdownStyle = ref({})

const toggleProv = () => {
  isProvOpen.value = !isProvOpen.value
  if (isProvOpen.value) {
    searchProv.value = ''
    isCityOpen.value = false
    isTypeOpen.value = false
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
    isTypeOpen.value = false
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

const toggleType = () => {
  isTypeOpen.value = !isTypeOpen.value
  if (isTypeOpen.value) {
    searchType.value = ''
    isProvOpen.value = false
    isCityOpen.value = false
    const trigger = document.getElementById('type-dropdown')?.getBoundingClientRect()
    if (trigger) {
      typeDropdownStyle.value = {
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

const formatDisplayName = (val: string | number) => {
  if (val === undefined || val === null || val === '') return ''
  const sVal = String(val)
  const num = parseInt(sVal.replace(/\D/g, ''))
  if (isNaN(num)) return ''
  return new Intl.NumberFormat('id-ID').format(num)
}

const handlePriceInput = (key: 'min' | 'max', value: string) => {
  const rawValue = value.replace(/\D/g, '')
  emit('update:priceRange', {
    ...props.priceRange,
    [key]: rawValue
  })
}

const clearAll = () => {
  emit('update:searchQuery', '')
  emit('update:facilities', {
    kamarTidur: '',
    kamarMandi: '',
    carport: '',
    lantai: '',
    rowJalanMin: '',
    rowJalanMax: ''
  })
  emit('update:region', { province: '', city: '', provinceId: '' })
  emit('update:priceRange', { min: '', max: '' })
  emit('update:transactionType', 'Semua')
  emit('update:propertyType', 'Semua')
}

const filterRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  
  // Close dropdowns on click outside
  if (!target.closest('#prov-dropdown')) isProvOpen.value = false
  if (!target.closest('#city-dropdown')) isCityOpen.value = false
  if (!target.closest('#type-dropdown')) isTypeOpen.value = false

  if (props.openFilter && filterRef.value) {
    // Abaikan jika yang diklik adalah trigger button dari Rumah.vue
    const isTrigger = target.closest('.btn-trigger-filter')
    if (!filterRef.value.contains(target) && !isTrigger) {
      emit('update:openFilter', false)
    }
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  
  // Fetch regencies if provinceId is already set (from query params)
  if (props.region.provinceId) {
    try {
      const res = await fetch(`/region/regencies/${props.region.provinceId}.json`)
      regencies.value = await res.json()
    } catch (err) {
      console.error('Error fetching regencies on mount:', err)
    }
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
