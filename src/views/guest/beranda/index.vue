<template>
  <GuestLayout main-class="!max-w-none !mx-0 !px-0">
    <!-- Hero Section Beranda -->
    <section class="relative pt-6 pb-6 bg-white">
      <div class="w-full !px-4 sm:!px-8 lg:!px-10">
        <div class="relative overflow-hidden rounded-[2rem] md:rounded-[3.5rem] bg-white border border-bejo-100 shadow-premium px-5 py-8 md:px-24 md:pt-16 md:pb-16 lg:px-32 lg:pt-20 lg:pb-20 flex flex-col justify-center items-center min-h-[75vh]">
          <!-- Mesh Gradient Background -->
          <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div class="absolute -top-[20%] -right-[10%] size-[800px] bg-bejo-100/50 rounded-full blur-[120px] animate-pulse"></div>
            <div class="absolute top-[10%] -left-[15%] size-[600px] bg-bejo-200/30 rounded-full blur-[100px]"></div>
            <div class="absolute bottom-[-10%] left-[20%] size-[700px] bg-bejo-50/60 rounded-full blur-[140px]"></div>
          </div>

          <!-- Pattern -->
          <div class="absolute inset-0 opacity-[0.015] pointer-events-none" style="background-image: url('https://www.transparenttextures.com/patterns/cubes.png')"></div>

          <div class="relative z-10 w-full mx-auto text-center space-y-12">
            <div class="space-y-6">
              <h1 class="text-5xl md:text-8xl lg:text-[9rem] font-black text-slate-900 tracking-tighter leading-[0.85] max-w-7xl mx-auto drop-shadow-sm">
                Wujudkan <br class="hidden sm:block" />
                <span class="relative inline-block py-2">
                  <span class="relative z-10 text-transparent bg-clip-text bg-gradient-to-br from-bejo-500 via-bejo-600 to-bejo-900 animate-gradient-x">Rumah Impian</span>
                  <div class="absolute bottom-4 left-0 right-0 h-6 bg-bejo-100/40 -z-0 rounded-full blur-md"></div>
                </span>
                Anda
              </h1>

              <p class="text-base md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed opacity-80">
                Koleksi properti premium milik <span class="text-slate-900 font-black border-b-2 border-bejo-200">{{ settingsStore.business.appName }}</span>. <br />
                Aman, terverifikasi, dan siap huni langsung dari tangan pertama.
              </p>
            </div>

            <!-- Global Search Bar -->
            <div class="max-w-6xl mx-auto w-full relative z-20 px-4 md:px-0">
              <div class="bg-white/80 backdrop-blur-2xl p-2 md:p-3 rounded-[2.5rem] border border-bejo-100 shadow-2xl shadow-bejo-600/10 flex flex-col md:flex-row items-center gap-2">
                <div class="flex-1 flex items-center gap-4 px-6 w-full">
                  <Icon icon="lucide:search" class="size-6 text-bejo-600 shrink-0" />
                  <input 
                    type="text" 
                    v-model="heroSearch" 
                    @keyup.enter="handleHeroSearch"
                    placeholder="Cari nama properti atau area..." 
                    class="w-full bg-transparent border-none focus:ring-0 text-slate-800 font-bold placeholder:text-slate-400 text-lg py-3"
                  />
                </div>
                
                <div class="h-10 w-px bg-slate-100 hidden md:block"></div>

                <!-- City Filter -->
                <div id="city-select-container" class="w-full md:w-60 px-6 py-2 flex items-center gap-3 group/select relative cursor-pointer">
                  <Icon icon="lucide:map-pin" class="size-5 text-slate-400 group-hover/select:text-bejo-600 transition-colors" />
                  <div @click="isCityDropdownOpen = !isCityDropdownOpen" class="w-full bg-transparent border-none text-slate-800 font-bold text-sm py-2 pr-8 select-none truncate">
                    {{ selectedCity || 'Semua Kota' }}
                  </div>
                  <Icon icon="lucide:chevron-down" class="absolute right-6 size-4 text-slate-400 pointer-events-none transition-transform duration-300" :class="isCityDropdownOpen ? 'rotate-180 text-bejo-600' : ''" />

                  <!-- Custom Dropdown Menu -->
                  <Transition
                    enter-active-class="transition duration-150 ease-out"
                    enter-from-class="transform scale-95 opacity-0 translate-y-2"
                    enter-to-class="transform scale-100 opacity-100 translate-y-0"
                    leave-active-class="transition duration-100 ease-in"
                    leave-from-class="transform scale-100 opacity-100 translate-y-0"
                    leave-to-class="transform scale-95 opacity-0 translate-y-2"
                  >
                    <div v-show="isCityDropdownOpen" class="absolute right-0 bottom-full mb-2 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden z-[100] max-h-60 overflow-y-auto custom-scroll py-2 flex flex-col gap-1.5 w-72 md:w-80">
                      <button 
                        @click.stop="selectCity('')" 
                        class="w-full text-left px-4 py-3 text-xs font-bold rounded-xl transition-all leading-relaxed"
                        :class="!selectedCity ? 'bg-bejo-50 text-bejo-700 font-black' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                      >
                        Semua Kota
                      </button>
                      <button 
                        v-for="city in uniqueCities" 
                        :key="city" 
                        @click.stop="selectCity(city)" 
                        class="w-full text-left px-3 py-1 text-xs font-bold rounded-xl transition-all leading-relaxed"
                        :class="selectedCity === city ? 'bg-bejo-50 text-bejo-700 font-black' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                      >
                        {{ city }}
                      </button>
                    </div>
                  </Transition>
                </div>

                <button @click="handleHeroSearch" class="w-full md:w-auto px-10 py-4 md:py-4.5 bg-bejo-600 hover:bg-bejo-700 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-bejo-600/20 flex items-center justify-center gap-3">
                  Cari Unit
                </button>
              </div>
              <!-- Trending Tags Carousel -->
              <div class="flex items-center justify-center gap-3 mt-6 select-none">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 shrink-0">Populer:</span>
                
                <!-- Prev Button -->
                <button @click="prevTags" class="size-6 rounded-full bg-bejo-50 hover:bg-bejo-600 hover:text-white text-bejo-700 flex items-center justify-center border border-bejo-100 transition-all shrink-0 hover:scale-110 active:scale-90">
                  <Icon icon="lucide:chevron-left" class="size-3" />
                </button>

                <!-- Tags List with Transition -->
                <div class="flex items-center overflow-hidden px-1 h-8">
                  <TransitionGroup 
                    name="list" 
                    tag="div" 
                    class="flex items-center gap-2 relative h-full"
                  >
                    <button 
                      v-for="tag in visibleTags" 
                      :key="tag.label" 
                      @click="tag.action()" 
                      class="px-4 py-1.5 bg-bejo-50 hover:bg-bejo-600 hover:text-white text-bejo-700 text-[10px] font-black rounded-full border border-bejo-100 transition-all uppercase tracking-wider whitespace-nowrap hover:scale-105 active:scale-95 duration-300"
                    >
                      {{ tag.label }}
                    </button>
                  </TransitionGroup>
                </div>

                <!-- Next Button -->
                <button @click="nextTags" class="size-6 rounded-full bg-bejo-50 hover:bg-bejo-600 hover:text-white text-bejo-700 flex items-center justify-center border border-bejo-100 transition-all shrink-0 hover:scale-110 active:scale-90">
                  <Icon icon="lucide:chevron-right" class="size-3" />
                </button>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 hidden md:flex">
              <RouterLink to="/katalog" class="flex items-center gap-3 text-slate-400 hover:text-bejo-600 font-black text-sm uppercase tracking-[0.2em] transition-all group">
                Atau lihat koleksi lengkap
                <Icon icon="lucide:arrow-right" class="size-4 group-hover:translate-x-1 transition-transform" />
              </RouterLink>
            </div>
          </div>

          <!-- Stats Section (Premium Redesign) -->
          <div class="relative z-20 w-full max-w-6xl mt-20 px-4 md:px-0">
            <div class="w-full mx-auto bg-white/60 backdrop-blur-3xl rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-14 shadow-premium border border-white grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative overflow-hidden">
              <!-- Glow Effect inside Stats -->
              <div class="absolute -top-24 -left-24 size-48 bg-bejo-100 rounded-full blur-[80px] opacity-40"></div>
              <div class="absolute -bottom-24 -right-24 size-48 bg-bejo-200 rounded-full blur-[80px] opacity-30"></div>

              <div class="text-center px-6 group relative z-10">
                <div class="size-16 rounded-2xl bg-bejo-50 text-bejo-600 flex items-center justify-center mx-auto mb-6 group-hover:bg-bejo-600 group-hover:text-white transition-all duration-500 shadow-sm border border-bejo-100/50 group-hover:rotate-6 group-hover:scale-110">
                  <Icon icon="lucide:building-2" class="size-7" />
                </div>
                <div class="space-y-1">
                  <h4 class="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter">{{ allProducts.length > 0 ? allProducts.length : '...' }}</h4>
                  <p class="text-[10px] font-black text-bejo-600/80 uppercase tracking-[0.25em]">Unit Eksklusif</p>
                  <div class="h-1 w-8 bg-bejo-100 mx-auto rounded-full mt-2 group-hover:w-16 transition-all duration-500"></div>
                </div>
              </div>

              <div class="text-center px-6 group relative z-10 border-y md:border-y-0 md:border-x border-slate-100/80 py-12 md:py-0">
                <div class="size-16 rounded-2xl bg-bejo-50 text-bejo-600 flex items-center justify-center mx-auto mb-6 group-hover:bg-bejo-600 group-hover:text-white transition-all duration-500 shadow-sm border border-bejo-100/50 group-hover:-rotate-6 group-hover:scale-110">
                  <Icon icon="lucide:shield-check" class="size-7" />
                </div>
                <div class="space-y-1">
                  <h4 class="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter">100 %</h4>
                  <p class="text-[10px] font-black text-bejo-600/80 uppercase tracking-[0.25em]">Data Tervalidasi</p>
                  <div class="h-1 w-8 bg-bejo-100 mx-auto rounded-full mt-2 group-hover:w-16 transition-all duration-500"></div>
                </div>
              </div>

              <div class="text-center px-6 group relative z-10">
                <div class="size-16 rounded-2xl bg-bejo-50 text-bejo-600 flex items-center justify-center mx-auto mb-6 group-hover:bg-bejo-600 group-hover:text-white transition-all duration-500 shadow-sm border border-bejo-100/50 group-hover:rotate-6 group-hover:scale-110">
                  <Icon icon="lucide:map-pin" class="size-7" />
                </div>
                <div class="space-y-1">
                  <h4 class="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter">{{ totalAreas }}</h4>
                  <p class="text-[10px] font-black text-bejo-600/80 uppercase tracking-[0.25em]">Area Strategis</p>
                  <div class="h-1 w-8 bg-bejo-100 mx-auto rounded-full mt-2 group-hover:w-16 transition-all duration-500"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- Highlight Properti Terbaru Section -->
    <section class="pt-12 pb-6 sm:pt-16 sm:pb-10 px-4 bg-[#f7f9fb] relative overflow-hidden">
      <!-- Premium Decor -->
      <div class="absolute -right-40 top-20 size-[600px] bg-bejo-200/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div class="absolute -left-20 bottom-0 size-[400px] bg-bejo-100/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="absolute inset-0 opacity-[0.01] pointer-events-none" style="background-image: url('https://www.transparenttextures.com/patterns/white-diamond.png')"></div>

      <div class="w-full !px-2.5 sm:!px-8 lg:!px-12 relative z-10">
        <div class="flex flex-col md:flex-row justify-between items-end mb-8 gap-8">
          <div class="max-w-2xl space-y-4">
            <span class="text-bejo-600 font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-2">
              <div class="w-8 h-[2px] bg-bejo-500"></div>
              Koleksi Terbaru {{ settingsStore.business.appName }}
            </span>
            <h2 class="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">Unit Pilihan <br />Siap <span class="text-bejo-500">Huni.</span></h2>
          </div>

          <RouterLink to="/katalog" class="group flex items-center gap-3 px-8 py-4 bg-white hover:bg-bejo-600 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest text-bejo-700 transition-all shadow-sm shrink-0 active:scale-95 border border-bejo-100">
            Lihat Semua
            <Icon icon="lucide:arrow-right" class="size-4 group-hover:translate-x-1 transition-transform" />
          </RouterLink>
        </div>

        <!-- Carousel Container -->
        <div class="relative group/carousel">
          <!-- Navigation Controls -->
          <div class="absolute -left-6 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-all duration-500 -translate-x-4 group-hover/carousel:translate-x-0 hidden lg:block">
            <button @click="scroll('left')" class="size-14 rounded-full bg-white border border-slate-100 shadow-xl flex items-center justify-center text-slate-800 hover:bg-bejo-600 hover:text-white transition-all active:scale-90">
              <Icon icon="lucide:chevron-left" class="size-6" />
            </button>
          </div>
          <div class="absolute -right-6 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-all duration-500 translate-x-4 group-hover/carousel:translate-x-0 hidden lg:block">
            <button @click="scroll('right')" class="size-14 rounded-full bg-white border border-slate-100 shadow-xl flex items-center justify-center text-slate-800 hover:bg-bejo-600 hover:text-white transition-all active:scale-90">
              <Icon icon="lucide:chevron-right" class="size-6" />
            </button>
          </div>

          <div ref="scrollContainer" class="flex overflow-x-auto snap-x snap-mandatory gap-8 pb-12 px-6 sm:px-12 md:px-20 custom-scroll scroll-smooth no-scrollbar scroll-pl-6 sm:scroll-pl-12 md:scroll-pl-20">
            <!-- Show Skeletons while loading data -->
            <template v-if="isLoading && displayedProducts.length === 0">
              <ProductCard 
                v-for="i in 4" 
                :key="'skeleton-' + i" 
                :product="{}" 
                is-loading 
                class="snap-start shrink-0 w-[80vw] md:w-[45vw] lg:w-[calc((100%-96px)/4)]" 
              />
            </template>
            
            <!-- Show Actual Cards (Each handles its own shimmer for image loading) -->
            <template v-else>
              <ProductCard 
                v-for="row in displayedProducts" 
                :key="row.id || row.No_Id" 
                :product="row" 
                @select="(product: any) => $router.push(`/detail/${product.Slug}`)"
                class="snap-start shrink-0 w-[80vw] md:w-[40vw] lg:w-[calc((100%-96px)/4)] hover:-translate-y-4 transition-all duration-700"
              />
            </template>
          </div>

          <!-- Pagination Indicator (Desktop Only) -->
          <div class="hidden lg:flex justify-center gap-2 mt-4">
            <div v-for="i in Math.ceil(displayedProducts.length / 1)" :key="i" class="h-1.5 rounded-full bg-slate-200 transition-all duration-300" :class="i === 1 ? 'w-8 bg-bejo-500' : 'w-2'"></div>
          </div>

          <!-- Hint for scrolling (Mobile Only) -->
          <div class="mt-8 flex flex-col items-center gap-3 lg:hidden">
            <div class="flex items-center gap-2">
               <div v-for="i in 3" :key="i" class="size-1.5 rounded-full bg-slate-200" :class="i === 1 ? 'bg-bejo-500 w-4' : ''"></div>
            </div>
            <div class="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
              <Icon icon="lucide:mouse-pointer-2" class="size-3 text-bejo-500 animate-bounce" />
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Geser untuk eksplorasi unit</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Indonesia Map Distribution Section -->
    <IndonesiaMap :properties="allProducts" />

    <!-- Layanan Kami Section -->
    <section class="px-4 py-6 bg-slate-50/30 relative overflow-hidden">
      <div class="w-full !px-2.5 sm:!px-8 lg:!px-12">
        <div class="text-center mb-12 space-y-4">
          <span class="text-bejo-600 font-black uppercase tracking-[0.3em] text-[10px]">Layanan Ekosistem</span>
          <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">Solusi Properti <span class="text-transparent bg-clip-text bg-bejo-600">End-to-End</span></h2>
          <p class="text-slate-500 text-base font-medium max-w-2xl mx-auto opacity-80 leading-relaxed">Kami tidak hanya menjual rumah, kami menciptakan jalan mulus menuju hunian impian Anda dengan layanan lengkap.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="bg-white p-12 rounded-[3.5rem] border border-slate-100 hover:border-bejo-200 shadow-premium hover:shadow-bejo-premium transition-all duration-700 group relative overflow-hidden">
            <div class="absolute -right-6 -top-6 size-32 bg-bejo-50 rounded-full group-hover:scale-150 transition-transform duration-700 -z-0"></div>
            <div class="relative z-10">
              <div class="size-20 rounded-3xl bg-bejo-50 text-bejo-600 flex items-center justify-center mb-10 group-hover:bg-bejo-600 group-hover:text-white transition-all shadow-sm">
                <Icon icon="lucide:house-plus" class="size-10" />
              </div>
              <h3 class="text-3xl font-black text-slate-900 mb-6">Jual & Beli</h3>
              <p class="text-base font-medium text-slate-500 leading-relaxed opacity-80">Tersedia beragam pilihan rumah, ruko, apartemen hingga kavling tanah terbaik.</p>
            </div>
          </div>
          <div class="bg-white p-12 rounded-[3.5rem] border border-slate-100 hover:border-bejo-200 shadow-premium hover:shadow-bejo-premium transition-all duration-700 group relative overflow-hidden">
            <div class="absolute -right-6 -top-6 size-32 bg-bejo-50 rounded-full group-hover:scale-150 transition-transform duration-700 -z-0"></div>
            <div class="relative z-10">
              <div class="size-20 rounded-3xl bg-bejo-50 text-bejo-600 flex items-center justify-center mb-10 group-hover:bg-bejo-600 group-hover:text-white transition-all shadow-sm">
                <Icon icon="lucide:key-round" class="size-10" />
              </div>
              <h3 class="text-3xl font-black text-slate-900 mb-6">Sewa Hunian</h3>
              <p class="text-base font-medium text-slate-500 leading-relaxed opacity-80">Cari kost atau sewa rumah jangka panjang dengan proses kontrak yang transparan.</p>
            </div>
          </div>
          <div class="bg-white p-12 rounded-[3.5rem] border border-slate-100 hover:border-bejo-200 shadow-premium hover:shadow-bejo-premium transition-all duration-700 group relative overflow-hidden">
            <div class="absolute -right-6 -top-6 size-32 bg-bejo-50 rounded-full group-hover:scale-150 transition-transform duration-700 -z-0"></div>
            <div class="relative z-10">
              <div class="size-20 rounded-3xl bg-bejo-50 text-bejo-600 flex items-center justify-center mb-10 group-hover:bg-bejo-600 group-hover:text-white transition-all shadow-sm">
                <Icon icon="lucide:calculator" class="size-10" />
              </div>
              <h3 class="text-3xl font-black text-slate-900 mb-6">Simulasi KPR</h3>
              <p class="text-base font-medium text-slate-500 leading-relaxed opacity-80">Plafon pinjaman dan angsuran bulanan yang disesuaikan dengan profil finansial.</p>
            </div>
          </div>
          <div class="bg-white p-12 rounded-[3.5rem] border border-slate-100 hover:border-bejo-200 shadow-premium hover:shadow-bejo-premium transition-all duration-700 group relative overflow-hidden">
            <div class="absolute -right-6 -top-6 size-32 bg-bejo-50 rounded-full group-hover:scale-150 transition-transform duration-700 -z-0"></div>
            <div class="relative z-10">
              <div class="size-20 rounded-3xl bg-bejo-50 text-bejo-600 flex items-center justify-center mb-10 group-hover:bg-bejo-600 group-hover:text-white transition-all shadow-sm">
                <Icon icon="lucide:shield-check" class="size-10" />
              </div>
              <h3 class="text-3xl font-black text-slate-900 mb-6">Legalitas Aman</h3>
              <p class="text-base font-medium text-slate-500 leading-relaxed opacity-80">Jaminan keamanan dokumen sertifikat (SHM/SHGB) setiap unit properti kami.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Us Section -->
    <section class="py-10 sm:py-16 bg-white relative overflow-hidden">
      <!-- Decor -->
      <div class="absolute -top-40 -left-40 size-[600px] bg-bejo-50/50 rounded-full blur-[120px] pointer-events-none"></div>

      <div class="w-full px-4 sm:px-8 lg:px-12 relative z-10">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div class="relative group">
            <div class="aspect-square rounded-[3.5rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] relative z-10 border-[12px] border-white transition-transform duration-700 group-hover:scale-[1.02]">
              <img :src="randomProduct?.MediaUrls?.[0]?.Url || randomProduct?.MediaUrls?.[0]?.Id_Media || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'" alt="Properties" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            <!-- Decorative elements -->
            <div class="absolute -bottom-8 -right-8 size-48 bg-bejo-500 rounded-[2.5rem] -z-0 opacity-10 animate-pulse"></div>
            <div class="absolute -top-6 -left-6 size-32 bg-slate-900/5 rounded-full -z-0"></div>

            <!-- Floating Property Info (Decoupled Loading) -->
            <div v-if="randomProduct" class="absolute -bottom-6 -left-6 md:-left-12 w-72 md:w-80 bg-white rounded-[2.5rem] z-20 p-6 flex flex-col gap-4 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] border border-slate-100 transform hover:-translate-y-3 transition-all duration-700">
              <div class="flex items-center gap-5">
                <!-- Thumbnail with Shimmer -->
                <div class="size-14 rounded-2xl relative overflow-hidden bg-slate-100 shrink-0 shadow-sm">
                  <div v-if="isLoading || !isRandomProductImageLoaded" class="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-shimmer z-10"></div>
                  <img 
                    v-if="randomProduct.MediaUrls?.[0]"
                    :src="randomProduct?.MediaUrls?.[0]?.Url || randomProduct?.MediaUrls?.[0]?.Id_Media" 
                    class="size-full object-cover transition-opacity duration-500"
                    :class="isRandomProductImageLoaded ? 'opacity-100' : 'opacity-0'"
                    @load="isRandomProductImageLoaded = true"
                    @error="isRandomProductImageLoaded = true"
                  />
                  <div v-else class="size-full flex items-center justify-center bg-bejo-600 text-white" @vue:mounted="isRandomProductImageLoaded = true">
                    <Icon icon="lucide:home" class="size-7" />
                  </div>
                </div>

                <div class="min-w-0 flex-1">
                  <div v-if="isLoading" class="h-5 w-full bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-shimmer rounded-lg mb-1"></div>
                  <span v-else class="block text-base font-black text-slate-900 truncate tracking-tight">{{ randomProduct.Nama_Produk }}</span>
                  
                  <div v-if="isLoading" class="h-3 w-1/2 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-shimmer rounded mb-0.5"></div>
                  <span v-else class="text-[10px] font-black text-bejo-600 uppercase tracking-[0.25em]">{{ randomProduct.Tipe }}</span>
                </div>
              </div>
              <div class="space-y-4 pt-4 border-t border-slate-100/50">
                <div class="flex items-start gap-3">
                  <div v-if="isLoading" class="size-4 bg-slate-100 rounded-full animate-pulse mt-1"></div>
                  <Icon v-else icon="lucide:map-pin" class="size-4 text-slate-400 mt-1 shrink-0" />
                  
                  <div v-if="isLoading" class="space-y-1 flex-1">
                    <div class="h-3 w-full bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-shimmer rounded"></div>
                    <div class="h-3 w-3/4 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-shimmer rounded"></div>
                  </div>
                  <span v-else class="text-[11px] font-bold text-slate-500 leading-relaxed line-clamp-2">
                    {{ randomProduct.Alamat }} 
                    <span v-if="randomProduct.Nama_Kota" class="text-bejo-600 font-black ml-1">• {{ randomProduct.Nama_Kota }}</span>
                  </span>
                </div>

                <div v-if="isLoading" class="h-10 w-full bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-shimmer rounded-2xl"></div>
                <button v-else @click="$router.push(`/detail/${randomProduct.Slug}`)" class="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-bejo-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 group/btn">
                  Lihat Detail Unit
                  <Icon icon="lucide:arrow-right" class="size-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-8">
            <div class="space-y-4">
              <span class="text-bejo-600 font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-3">
                <div class="w-10 h-[2px] bg-bejo-500"></div>
                Kenapa Kami?
              </span>
              <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Mengapa Anda Merasa <br /><span class="relative">
                  <span class="relative z-10 italic">Beruntung</span>
                  <div class="absolute bottom-1 left-0 right-0 h-4 bg-bejo-100 -z-0"></div>
                </span>
                di {{ settingsStore.business.appName }}?
              </h2>
            </div>

            <div class="space-y-6">
              <div class="flex gap-6 group hover-float p-4 rounded-[2rem] hover:bg-slate-50 transition-all duration-500">
                <div class="size-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0 group-hover:bg-bejo-600 group-hover:text-white transition-all duration-700">
                  <Icon icon="lucide:verified" class="size-8 text-bejo-600 group-hover:text-white" />
                </div>
                <div class="space-y-2 pt-1">
                  <h4 class="text-2xl font-black text-slate-900 tracking-tight">100% Data Tervalidasi</h4>
                  <p class="text-sm font-medium text-slate-500 leading-relaxed opacity-80">Semua unit melalui verifikasi lapangan oleh tim {{ settingsStore.business.appName }} untuk menjamin akurasi info 1:1.</p>
                </div>
              </div>
              <div class="flex gap-6 group hover-float p-4 rounded-[2rem] hover:bg-slate-50 transition-all duration-500">
                <div class="size-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0 group-hover:bg-bejo-600 group-hover:text-white transition-all duration-700">
                  <Icon icon="lucide:user-check-2" class="size-8 text-bejo-600 group-hover:text-white" />
                </div>
                <div class="space-y-2 pt-1">
                  <h4 class="text-2xl font-black text-slate-900 tracking-tight">Personal Agent Dedicated</h4>
                  <p class="text-sm font-medium text-slate-500 leading-relaxed opacity-80">Dapatkan asisten pribadi yang siap menemani proses survei unit hingga tanda tangan akad di hadapan Notaris.</p>
                </div>
              </div>
              <div class="flex gap-6 group hover-float p-4 rounded-[2rem] hover:bg-slate-50 transition-all duration-500">
                <div class="size-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0 group-hover:bg-bejo-600 group-hover:text-white transition-all duration-700">
                  <Icon icon="lucide:banknote" class="size-8 text-bejo-600 group-hover:text-white" />
                </div>
                <div class="space-y-2 pt-1">
                  <h4 class="text-2xl font-black text-slate-900 tracking-tight">Investasi Aman & Terjamin</h4>
                  <p class="text-sm font-medium text-slate-500 leading-relaxed opacity-80">Sistem transaksi legal yang diawasi oleh Notaris berpengalaman untuk menjamin keamanan aset dan dana Anda.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </GuestLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import GuestLayout from '@/layouts/guest.vue'
import api from '@/services/axios'
import ProductCard from '@/components/ProductCard.vue'
import IndonesiaMap from './components/IndonesiaMap.vue'
import { useSettings } from '@/stores/settings'

const isCityDropdownOpen = ref(false)
const selectCity = (city: string) => {
  selectedCity.value = city
  isCityDropdownOpen.value = false
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('#city-select-container')) {
    isCityDropdownOpen.value = false
  }
}

const scrollContainer = ref<HTMLElement | null>(null)

const scroll = (direction: 'left' | 'right') => {
  if (!scrollContainer.value) return
  const container = scrollContainer.value
  const card = container.querySelector('.shrink-0')
  if (!card) return

  const cardWidth = card.clientWidth
  const gap = 32 // gap-8 sesuai class Tailwind
  const scrollAmount = cardWidth + gap

  if (direction === 'right') {
    const isAtEnd = Math.ceil(container.scrollLeft + container.clientWidth) >= container.scrollWidth - 10
    if (isAtEnd) {
      container.scrollTo({ left: 0, behavior: 'smooth' })
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  } else {
    const isAtStart = container.scrollLeft <= 10
    if (isAtStart) {
      container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' })
    } else {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    }
  }
}

interface ProductPreview {
  id?: string
  No_Id: string
  Nama_Produk: string
  Slug: string
  Alamat: string
  Tipe: string
  Area: string[]
  Status_Display: string
  Status_Properti: string
  Status_Transaksi: string[]
  Luas_Tanah: number
  Luas_Bangunan: number
  Jumlah_Kamar_Tidur: number
  Jumlah_Kamar_Mandi: number
  Harga_Jual1: number
  Harga_Jual2: number
  Harga_Sewa1: number
  Nama_Kota?: string
  Hide_alamat: boolean
  MediaUrls: { Id_Media: string; Url?: string }[]
}

const settingsStore = useSettings()
const router = useRouter()
const isLoading = ref(true)
const displayedProducts = ref<ProductPreview[]>([])
const allProducts = ref<ProductPreview[]>([])
const totalAreas = computed(() => {
  const cities = allProducts.value.map(p => p.Nama_Kota).filter(Boolean)
  return new Set(cities).size || 0
})
const isRandomProductImageLoaded = ref(false)

const heroSearch = ref('')
const selectedCity = ref('')
const uniqueCities = computed<string[]>(() => {
  const cities = allProducts.value.map(p => p.Nama_Kota).filter((c): c is string => !!c)
  return Array.from(new Set(cities)).sort()
})

const popularTags = [
  { label: 'Rumah', action: () => routeToKatalog({ type: 'Rumah' }) },
  { label: 'Apartemen', action: () => routeToKatalog({ type: 'Apartemen' }) },
  { label: 'Sewa', action: () => routeToKatalog({ label: 'Sewa' }) },
  { label: 'Jual', action: () => routeToKatalog({ label: 'Jual' }) },
  { label: 'Under 2M', action: () => routeToKatalog({ priceMax: '2000000000' }) },
  { label: 'Mewah', action: () => routeToKatalog({ priceMin: '5000000000' }) }
]

const activeTagIndex = ref(0)
const visibleTags = computed(() => {
  const result = []
  for (let i = 0; i < 3; i++) {
    const idx = (activeTagIndex.value + i) % popularTags.length
    result.push(popularTags[idx])
  }
  return result
})

const nextTags = () => {
  activeTagIndex.value = (activeTagIndex.value + 1) % popularTags.length
}

const prevTags = () => {
  activeTagIndex.value = (activeTagIndex.value - 1 + popularTags.length) % popularTags.length
}

let tagInterval: any = null

const handleHeroSearch = () => {
  const query: any = {}
  if (heroSearch.value.trim()) query.search = heroSearch.value.trim()
  
  if (selectedCity.value) {
    const parts = selectedCity.value.split(',')
    if (parts.length > 1) {
      query.city = parts[0].trim()
      query.province = parts[1].trim()
    } else {
      query.city = selectedCity.value
    }
  }
  
  router.push({
    path: '/katalog',
    query: query
  })
}

const routeToKatalog = (filterParams: { type?: string, label?: string, priceMin?: string, priceMax?: string }) => {
  router.push({
    path: '/katalog',
    query: filterParams
  })
}

// Logic for random product in Why Us section
const randomProduct = computed(() => {
  if (allProducts.value.length === 0) return null
  // Gunakan jam sekarang untuk mendapatkan index acak yang stabil per jam
  const hour = new Date().getHours()
  return allProducts.value[hour % allProducts.value.length]
})


const fetchData = async () => {
  isLoading.value = true
  try {
    const { data } = await api.get('/api/realEstate/getAll', {
      headers: {
        'X-Jenis-User': 'Admin',
        'Api-Key': 'realestate_key_2024'
      }
    })

    if (data && data.Data) {
      const actualData = data.Data || []
      allProducts.value = actualData

      // Filter Aktif & Tersedia
      const validProducts = actualData.filter((p: any) => p.Status_Display === 'Aktif' && p.Status_Properti === 'Tersedia')

      // Get up to 8 products for a richer carousel
      const products = validProducts.slice(0, 8)

      // Pastikan tampil minimal 4 (tambah mock jika kurang)
      if (products.length < 4) {
        const mockItems = [
          {
            No_Id: 'mock_pakuwon_1',
            Nama_Produk: 'Pakuwon Waterplace Residence',
            Slug: 'pakuwon-waterplace-residence',
            Alamat: 'Tower A, Lantai 15 (surabaya selatan)',
            Tipe: 'Apartemen',
            Luas_Bangunan: 56,
            Area: ['Kelurahan, Kecamatan, Kota Surabaya, Jawa Timur', 'Surabaya Selatan'],
            Status_Display: 'Aktif',
            Status_Properti: 'Tersedia',
            Status_Transaksi: ['Sewa'],
            Harga_Sewa1: 80000000,
            Harga_Sewa2: 55000000,
            Satuan_Minimal_Sewa: 'Tahun',
            Jumlah_Kamar_Tidur: 2,
            Jumlah_Kamar_Mandi: 1,
            Akses_Jalan: ['10 Menit ke Tol Satelit', '5 Menit ke National Hospital'],
            MediaUrls: [{ Id_Media: 'https://images.unsplash.com/photo-1545324418-f1d3ac1ef739?auto=format&fit=crop&q=80&w=800' }]
          },
          {
            No_Id: 'mock_graha_1',
            Nama_Produk: 'Graha Famili Modern Mansion',
            Slug: 'graha-famili-modern-mansion',
            Alamat: 'Blok AA, Cluster Luxury Park',
            Tipe: 'Rumah',
            Luas_Bangunan: 250,
            Area: ['Kelurahan, Kecamatan, Kota Surabaya, Jawa Timur', 'Surabaya Barat'],
            Status_Display: 'Aktif',
            Status_Properti: 'Tersedia',
            Status_Transaksi: ['Jual'],
            Harga_Jual1: 5200000000,
            Harga_Jual2: 4900000000,
            Jumlah_Kamar_Tidur: 4,
            Jumlah_Kamar_Mandi: 3,
            Akses_Jalan: ['Dekat National Hospital', 'Area Komersial Walk-in'],
            MediaUrls: [{ Id_Media: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800' }]
          },
          {
            No_Id: 'mock_rosebay_1',
            Nama_Produk: 'The Rosebay Low-Rise Condo',
            Slug: 'the-rosebay-low-rise-condo',
            Alamat: 'Graha Famili, Surabaya Barat',
            Tipe: 'Apartemen',
            Luas_Bangunan: 120,
            Area: ['Kelurahan, Kecamatan, Kota Surabaya, Jawa Timur', 'Surabaya Barat'],
            Status_Display: 'Aktif',
            Status_Properti: 'Tersedia',
            Status_Transaksi: ['Jual', 'Sewa'],
            Harga_Jual1: 2800000000,
            Harga_Jual2: 0,
            Harga_Sewa1: 150000000,
            Satuan_Minimal_Sewa: 'Tahun',
            Jumlah_Kamar_Tidur: 2,
            Jumlah_Kamar_Mandi: 2,
            Akses_Jalan: ['Langsung ke Lapangan Golf', 'Privasi Tinggi'],
            MediaUrls: [{ Id_Media: 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&q=80&w=800' }]
          },
          {
            No_Id: 'mock_ciputra_1',
            Nama_Produk: 'Ciputra World Sky Loft',
            Slug: 'ciputra-world-sky-loft',
            Alamat: 'CBD Ciputra World, Surabaya Pusat',
            Tipe: 'Apartemen',
            Luas_Bangunan: 85,
            Area: ['Kelurahan, Kecamatan, Kota Surabaya, Jawa Timur', 'Surabaya Pusat'],
            Status_Display: 'Aktif',
            Status_Properti: 'Tersedia',
            Status_Transaksi: ['Sewa'],
            Harga_Sewa1: 120000000,
            Harga_Sewa2: 105000000,
            Satuan_Minimal_Sewa: 'Tahun',
            Jumlah_Kamar_Tidur: 1,
            Jumlah_Kamar_Mandi: 1,
            Akses_Jalan: ['Koneksi Mall Direct', 'Pusat Kota'],
            MediaUrls: [{ Id_Media: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800' }]
          }
        ]

        let i = 0
        while (products.length < 4 && i < mockItems.length) {
          const mock = mockItems[i]
          if (!products.some((p: ProductPreview) => p.Nama_Produk === mock.Nama_Produk)) {
            products.push(mock as any)
          }
          i++
        }
      }

      displayedProducts.value = products
    }
  } catch (error) {
    console.error('Gagal mengambil katalog prop:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchData()
  window.addEventListener('click', handleClickOutside)
  tagInterval = setInterval(nextTags, 4000)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside)
  if (tagInterval) clearInterval(tagInterval)
})
</script>

<style scoped>
@reference "@/assets/css/style.css";

/* List Transition for Carousel Tags */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.list-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.9);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.9);
}
.list-leave-active {
  position: absolute;
}
.list-move {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #f1f5f9 transparent;
}
.custom-scroll::-webkit-scrollbar {
  height: 6px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #f1f5f9;
  border-radius: 20px;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.select-no-arrow {
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  appearance: none !important;
}
.select-no-arrow::-ms-expand {
  display: none !important;
}

@keyframes scroll-hint {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(200%);
  }
  100% {
    transform: translateX(-100%);
  }
}
.animate-scroll-hint {
  animation: scroll-hint 3s infinite ease-in-out;
}
</style>
