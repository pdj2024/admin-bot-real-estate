<template>
  <GuestLayout>
    <div class="max-w-4xl mx-auto py-12 px-4">
      <div class="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <!-- Header Section -->
        <div class="p-8 md:p-12 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-bejo-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div class="relative z-10">
            <h1 class="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4 flex items-center gap-4">
              <div class="size-12 rounded-2xl bg-bejo-500 flex items-center justify-center text-white shadow-lg shadow-bejo-500/20">
                <Icon icon="lucide:map-pin" class="size-6" />
              </div>
              Pencarian Alamat Otomatis
            </h1>
            <p class="text-slate-500 font-medium max-w-xl leading-relaxed">
              Gunakan fitur ini untuk mencari lokasi di seluruh Indonesia menggunakan data presisi dari <span class="text-bejo-600 font-bold">OpenStreetMap</span>.
            </p>
          </div>
        </div>

        <div class="p-8 md:p-12">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <!-- Search Section -->
            <div class="space-y-8">
              <div class="space-y-4">
                <label class="text-[11px] font-black uppercase tracking-widest text-slate-400 block ml-1">Cari Lokasi</label>
                <div class="relative group">
                  <Icon icon="lucide:search" class="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-300 group-focus-within:text-bejo-500 transition-colors" />
                  <input 
                    type="text" 
                    v-model="searchQuery"
                    @keyup.enter="searchLocation"
                    placeholder="Contoh: Stasiun Gambir"
                    class="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-4 text-sm font-bold focus:bg-white focus:ring-8 focus:ring-bejo-500/5 focus:border-bejo-500 transition-all shadow-inner outline-none ring-0 appearance-none"
                  />
                  <div class="absolute right-3 top-1/2 -translate-y-1/2">
                    <button 
                      @click="searchLocation" 
                      :disabled="isLoading"
                      class="px-6 py-2 bg-bejo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-bejo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-bejo-600/10 active:scale-95"
                    >
                      <Icon v-if="isLoading" icon="lucide:loader-2" class="size-4 animate-spin" />
                      <span v-else>Cari</span>
                    </button>
                  </div>
                </div>

                <!-- Results List -->
                <Transition
                  enter-active-class="transition duration-300 ease-out"
                  enter-from-class="opacity-0 -translate-y-4"
                  enter-to-class="opacity-100 translate-y-0"
                >
                  <div v-if="searchResults.length > 0" class="mt-4 bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden divide-y divide-slate-50">
                    <div 
                      v-for="result in searchResults" 
                      :key="result.place_id"
                      @click="selectLocation(result)"
                      class="p-5 hover:bg-bejo-50 cursor-pointer transition-all flex gap-4 group"
                    >
                      <div class="size-10 rounded-xl bg-bejo-50 flex-shrink-0 flex items-center justify-center text-bejo-400 group-hover:bg-bejo-500 group-hover:text-white transition-all">
                        <Icon icon="lucide:map-pin" class="size-5" />
                      </div>
                      <div class="flex flex-col gap-0.5">
                        <span class="text-sm font-bold text-slate-700 group-hover:text-bejo-700 transition-colors line-clamp-1">{{ result.display_name }}</span>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest break-all">{{ result.type || 'Location' }}</span>
                      </div>
                    </div>
                  </div>
                </Transition>
                
                <div v-if="!isLoading && searchQuery && searchResults.length === 0" class="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Gunakan kata kunci pencarian yang lebih spesifik</p>
                </div>
              </div>
            </div>

            <!-- Form Section -->
            <div class="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 shadow-inner">
              <div class="space-y-6">
                <div v-for="(val, key) in formFields" :key="key" class="space-y-3">
                  <label class="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{{ val.label }}</label>
                  <div class="relative">
                    <Icon :icon="val.icon" class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                    <input 
                      type="text" 
                      :value="form[key]" 
                      readonly 
                      :placeholder="'Menunggu pilihan...'"
                      class="w-full bg-slate-100/50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-slate-600 focus:outline-none cursor-default transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div v-if="Object.values(form).every(v => !v)" class="pt-4 text-center">
                  <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed italic">
                    Pilih lokasi dari hasil pencarian<br />untuk mengisi detail wilayah di atas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </GuestLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Icon } from '@iconify/vue';
import GuestLayout from '@/layouts/guest.vue';

const searchQuery = ref('');
const searchResults = ref<any[]>([]);
const isLoading = ref(false);

const form = reactive<Record<string, string>>({
  provinsi: '',
  kota: '',
  kecamatan: '',
  kelurahan: '',
});

const formFields = {
  provinsi: { label: 'Provinsi', icon: 'lucide:map' },
  kota: { label: 'Kota / Kabupaten', icon: 'lucide:building-2' },
  kecamatan: { label: 'Kecamatan', icon: 'lucide:navigation-2' },
  kelurahan: { label: 'Kelurahan / Desa', icon: 'lucide:home' },
};

// Fungsi untuk mencari lokasi ke Nominatim API
const searchLocation = async () => {
  if (!searchQuery.value.trim()) return;
  
  isLoading.value = true;
  searchResults.value = [];
  
  try {
    // countrycodes=id untuk membatasi hanya di Indonesia
    // addressdetails=1 untuk mendapatkan pecahan alamat
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery.value)}&format=json&addressdetails=1&countrycodes=id&limit=5`
    );
    const data = await response.json();
    searchResults.value = data;
    console.log(data)
  } catch (error) {
    console.error("Gagal mengambil data:", error);
  } finally {
    isLoading.value = false;
  }
};

// Fungsi saat user memilih salah satu hasil
const selectLocation = (place: any) => {
  const address = place.address;
  
  // Reset form
  form.provinsi = '';
  form.kota = '';
  form.kecamatan = '';
  form.kelurahan = '';

  // Mapping data dari OpenStreetMap ke form kita
  // Nominatim memiliki penamaan yang sedikit berbeda tergantung area
  form.provinsi = address.state || '';
  form.kota = address.city || address.town || address.county || address.municipality || '';
  form.kecamatan = address.suburb || address.district || address.city_district || '';
  form.kelurahan = address.village || address.neighbourhood || address.hamlet || address.quarter || '';

  // Kosongkan hasil pencarian setelah dipilih
  searchResults.value = [];
  searchQuery.value = place.display_name;
};
</script>

<style scoped>
@reference "@/assets/css/style.css";

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  @apply bg-transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-200 rounded-full h-8;
}
</style>
