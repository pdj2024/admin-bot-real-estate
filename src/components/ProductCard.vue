<template>
  <div v-if="isLoading || isAdmin || (product.Status_Display == 'Aktif' && product.Status_Properti == 'Tersedia')" class="group flex flex-col h-full rounded-[2.5rem] border transition-all duration-700 relative bg-white border-slate-100 shadow-premium" :class="!isLoading ? (showSelectButton ? '' : 'hover:-translate-y-3 hover:shadow-bejo-premium hover:border-bejo-200 cursor-pointer') : ''" @click="showSelectButton ? null : handleClick" @contextmenu="isAdmin && !isLoading ? ($event.preventDefault(), $emit('toggleDropdown', product.No_Id)) : null">
    <!-- Card Image Header -->
    <div class="relative h-60 overflow-hidden rounded-t-[2.5rem]" :class="isLoading || !isImageLoaded ? 'bg-slate-100' : 'bg-white p-3 pb-0'">
      <!-- Shimmer effect stays until image is loaded -->
      <div v-if="isLoading || !isImageLoaded" class="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-shimmer z-10"></div>
      
      <div v-if="!isLoading" class="w-full h-full rounded-[2rem] overflow-hidden relative">
        <!-- Overlay for Non-Active -->
        <div v-if="product.Status_Display != 'Aktif' || product.Status_Properti != 'Tersedia'" class="absolute inset-0 bg-black/40 backdrop-grayscale-[60%] z-[20] pointer-events-none transition-all duration-500"></div>
        <div v-if="product.Status_Display != 'Aktif' || product.Status_Properti != 'Tersedia'" class="absolute inset-0 flex items-center justify-center z-25 pointer-events-none">
          <div class="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl transform transition-transform duration-500 group-hover:scale-110">
            <span class="text-sm font-black uppercase tracking-[0.2em] text-white">
              {{ product.Status_Properti != 'Tersedia' ? product.Status_Properti : product.Status_Display }}
            </span>
          </div>
        </div>

        <!-- Main Image/Video with Smooth Transition -->
        <div v-if="product.MediaUrls && product.MediaUrls.length >= 1" class="absolute inset-0">
          <template v-if="product.MediaUrls[0].ContentType?.startsWith('video/')">
             <!-- Video Thumbnail -->
             <div class="size-full relative group-hover:scale-105 transition-transform duration-700">
               <video 
                 :src="product.MediaUrls[0].Url || product.MediaUrls[0].Id_Media" 
                 class="absolute inset-0 w-full h-full object-cover" 
                 preload="metadata" 
                 muted 
                 playsinline
                 @loadeddata="isImageLoaded = true"
                 @error="isImageLoaded = true"
               ></video>
               <div class="absolute inset-0 flex items-center justify-center bg-black/10">
                  <Icon icon="lucide:play" class="size-10 text-white fill-white/20 drop-shadow-lg" />
               </div>
             </div>
          </template>
          <img 
            v-else
            :src="product.MediaUrls[0].Url || product.MediaUrls[0].Id_Media" 
            class="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            :class="isImageLoaded ? 'opacity-100' : 'opacity-0'"
            :loading="lazy ? 'lazy' : 'eager'"
            @load="isImageLoaded = true"
            @error="isImageLoaded = true"
          />
        </div>

        <div v-else class="absolute inset-0 bg-slate-200 flex flex-col items-center justify-center" @vue:mounted="isImageLoaded = true">
          <Icon icon="lucide:image" class="size-16 text-slate-400" />
        </div>

        <!-- Gradients -->
        <div class="absolute inset-x-0 bottom-0 min-h-24 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
        <div class="absolute top-0 inset-x-0 min-h-24 bg-gradient-to-b from-slate-900/60 to-transparent"></div>

        <!-- Status Badges Top Left -->
        <div class="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
          <span v-if="!isLoading" class="w-fit bg-bejo-600/90 backdrop-blur-md text-white text-[9px] uppercase tracking-[0.2em] font-black px-3 py-1.5 rounded-lg border border-white/10 shadow-lg">
            {{ product.Status_Properti }}
          </span>
          <!-- Transaction Type Badge -->
          <span v-if="!isLoading && product.Status_Transaksi" class="w-fit bg-slate-900/80 backdrop-blur-md text-white text-[9px] uppercase tracking-[0.2em] font-black px-3 py-1.5 rounded-lg border border-white/10 shadow-lg">
            <template v-if="product.Status_Transaksi.includes('Jual') && product.Status_Transaksi.includes('Sewa')">
              Jual & Sewa
            </template>
            <template v-else-if="product.Status_Transaksi.includes('Jual')">
              Jual
            </template>
            <template v-else-if="product.Status_Transaksi.includes('Sewa')">
              Sewa
            </template>
          </span>
        </div>

        <!-- Access Road Stickers Bottom Right -->
        <div class="absolute bottom-4 right-4 flex flex-col gap-1.5 items-end z-10" v-if="product.Akses_Jalan">
          <span v-for="(akses, idx) in product.Akses_Jalan.slice(0, 3)" :key="idx" class="glass text-slate-800 text-[9px] font-black px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-2 group/akses">
            <Icon icon="lucide:map-pin" class="size-2.5 text-bejo-600 group-hover/akses:scale-110 transition-transform" />
            {{ akses }}
          </span>
        </div>
      </div>
    </div>

    <!-- Card Body -->
    <div class="p-6 flex flex-col flex-1">
      <!-- Location -->
      <div class="flex items-start gap-1.5 text-bejo-600 mb-3">
        <Icon icon="lucide:map-pin" class="size-4 mt-0.5" />
        <div class="flex flex-col flex-1">
          <div v-if="isLoading" class="h-3 w-24 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-shimmer rounded mb-1"></div>
          <div v-else class="flex items-center justify-between gap-2">
            <span class="text-[10px] font-black uppercase tracking-[0.15em] text-bejo-600 truncate">
              {{ product.Nama_Kota ? product.Nama_Kota : 'Lokasi Tidak Tersedia' }}
            </span>

          </div>
          
          <div v-if="isLoading" class="h-3 w-48 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-shimmer rounded"></div>
          <p v-else class="text-[11px] font-bold text-slate-500 leading-tight">
            <span v-if="!product.Hide_alamat">
              {{ product.Alamat }}
            </span>
            <span v-else class="text-slate-500 font-bold">
              {{ product.Nama_Kota }}{{ product.Nama_Area ? ` (${product.Nama_Area})` : '' }}
            </span>
            <span v-if="product.Nama_Area && !product.Hide_alamat" class="block mt-0.5 font-black text-slate-400 uppercase tracking-widest text-[9px]">Area: {{ product.Nama_Area }}</span>
          </p>
        </div>
      </div>

      <!-- Title -->
      <div v-if="isLoading" class="h-8 w-full bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-shimmer rounded-xl mb-3"></div>
      <h6 v-else class="text-xl md:text-2xl text-slate-900 font-black tracking-tighter transition-colors mb-3 leading-[1.1] line-clamp-2 [text-wrap:pretty]" :class="!showSelectButton ? 'group-hover:text-bejo-600' : ''">
        <RouterLink v-if="!disableRouting" :to="targetUrl" class="before:absolute before:inset-0">{{ product.Nama_Produk }}</RouterLink>
        <div v-else class="before:absolute before:inset-0">{{ product.Nama_Produk }}</div>
      </h6>

      <!-- Type & Size Info -->
      <div v-if="isLoading" class="h-4 w-32 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-shimmer rounded mb-6"></div>
      <p v-else class="text-xs font-semibold text-slate-400 mb-6">
        {{ product.Tipe }} &bull; Tipe {{ product.Luas_Bangunan }}
      </p>

      <!-- Specs Details -->
      <div v-if="!props.hideSpecs" class="mb-4 relative">
        <div v-if="isLoading" class="h-10 w-full bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
        <button v-else-if="collapsibleDetails" type="button" @click.stop="emit('toggleExpand', product.No_Id)" class="flex items-center justify-between w-full px-4 py-2.5 bg-bejo-50/50 hover:bg-bejo-100 rounded-xl border border-bejo-100 transition-all group/expand cursor-pointer relative z-30">
          <span class="text-[10px] font-black uppercase tracking-[0.2em] text-bejo-700 pointer-events-none">Detail Unit</span>
          <Icon :icon="props.isExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="size-4 text-bejo-400 group-hover/expand:text-bejo-600 transition-transform pointer-events-none" />
        </button>

        <Transition 
          enter-active-class="transition-all duration-500 ease-in-out" 
          enter-from-class="max-h-0 opacity-0" 
          enter-to-class="max-h-[800px] opacity-100" 
          leave-active-class="transition-all duration-300 ease-in-out" 
          leave-from-class="max-h-[800px] opacity-100" 
          leave-to-class="max-h-0 opacity-0"
          :disabled="!collapsibleDetails"
        >
          <div v-if="isLoading || !collapsibleDetails || props.isExpanded" 
               :class="collapsibleDetails ? 'absolute top-full left-0 right-0 z-[100] mt-2 bg-white/95 backdrop-blur-xl border border-slate-100 shadow-2xl rounded-3xl' : 'bg-slate-50/50 border border-slate-100 rounded-2xl'"
               @click.stop>
            <div class="grid grid-cols-2 gap-3 p-3 shadow-inner" :class="collapsibleDetails ? 'p-4' : 'p-3'">
              <template v-if="isLoading">
                <div v-for="i in 4" :key="i" class="h-8 w-full bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
              </template>
              <template v-else>
                <div v-if="product.Luas_Tanah != 0" class="flex items-center gap-2">
                  <div class="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0">
                    <Icon icon="lucide:land-plot" class="size-3.5 text-bejo-600" />
                  </div>
                  <span class="text-xs font-bold text-slate-700">LT {{ product.Luas_Tanah || 0 }} m²</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0">
                    <Icon icon="lucide:home" class="size-3.5 text-bejo-600" />
                  </div>
                  <span class="text-xs font-bold text-slate-700">LB {{ product.Luas_Bangunan || 0 }} m²</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0">
                    <Icon icon="lucide:layers" class="size-3.5 text-bejo-600" />
                  </div>
                  <span class="text-xs font-bold text-slate-700">{{ product.Jumlah_Lantai || 0 }} Lt</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0">
                    <Icon icon="lucide:car" class="size-3.5 text-bejo-600" />
                  </div>
                  <span class="text-xs font-bold text-slate-700">{{ product.Jumlah_Carpot || 0 }} Mobil</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0">
                    <Icon icon="lucide:bed" class="size-3.5 text-bejo-600" />
                  </div>
                  <span class="text-xs font-bold text-slate-700">{{ product.Jumlah_Kamar_Tidur || 0 }} KT</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0">
                    <Icon icon="lucide:bath" class="size-3.5 text-bejo-600" />
                  </div>
                  <span class="text-xs font-bold text-slate-700">{{ product.Jumlah_Kamar_Mandi || 0 }} KM</span>
                </div>
              </template>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Pricing Info -->
      <div class="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-3 relative">
        <!-- Rental Price -->
        <div v-if="isLoading || (product.Harga_Sewa1 > 0)" class="flex flex-col">
          <div v-if="isLoading" class="space-y-2">
            <div class="h-2.5 w-16 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-shimmer rounded"></div>
            <div class="h-6 w-32 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
          </div>
          <template v-else>
            <span class="text-[10px] font-black uppercase tracking-widest mb-0.5 text-slate-400">
              Harga Sewa <span v-if="product.Minimal_Sewa || product.minimal_sewa"> (min. {{ product.Minimal_Sewa || product.minimal_sewa }} {{ product.Satuan_Minimal_Sewa }})</span>
            </span>
            <div class="flex flex-wrap items-baseline gap-2">
              <span class="text-2xl font-black tracking-tight text-bejo-600">
                {{ formatCurrency(product.Harga_Sewa2 > 0 ? product.Harga_Sewa2 : product.Harga_Sewa1) }}
              </span>
              <div v-if="product.Harga_Sewa2 > 0 && app.viewDiscount" class="flex items-center gap-2">
                <span class="relative text-xs text-slate-400 font-bold px-1 line-through decoration-slate-300">
                  {{ formatCurrency(product.Harga_Sewa1) }}
                </span>
              </div>
              <span class="text-[10px] text-slate-400 font-black ml-1 uppercase tracking-widest">/ {{ product.Satuan_Minimal_Sewa || 'thn' }}</span>
            </div>
          </template>
        </div>

        <!-- Sale Price -->
        <div v-if="!isLoading && product.Harga_Jual1 > 0" class="flex flex-col">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Harga Jual</span>
          <div class="flex flex-wrap items-baseline gap-2">
            <span class="text-3xl font-black text-slate-900 tracking-tighter">
              {{ formatCurrency(product.Harga_Jual2 > 0 ? product.Harga_Jual2 : product.Harga_Jual1) }}
            </span>
            <div v-if="product.Harga_Jual2 > 0 && app.viewDiscount" class="flex items-center gap-2">
              <span class="relative text-xs text-slate-400 font-bold px-1 line-through decoration-slate-300">
                {{ formatCurrency(product.Harga_Jual1) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Selection Action Button -->
        <div v-if="showSelectButton && !isLoading" class="mt-auto px-1 pb-6 pt-4">
          <button @click.stop="handleClick" class="w-full py-4 bg-bejo-500 hover:bg-bejo-600 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-bejo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
            <Icon icon="lucide:check-circle" class="size-4" />
            Pilih Unit Ini
          </button>
        </div>

        <!-- Admin Actions Dropdown -->
        <div v-if="isAdmin && !isLoading" class="absolute bottom-1 right-0 z-20" @click.stop>
          <button @click="$emit('toggleDropdown', product.No_Id)" class="size-10 flex items-center justify-center rounded-xl bg-bejo-50 text-bejo-600 hover:bg-bejo-600 hover:text-white transition-all shadow-sm border border-bejo-100">
            <Icon icon="lucide:more-vertical" class="size-5" />
          </button>

          <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <div v-show="activeDropdownId === product.No_Id" class="absolute right-0 bottom-12 z-[100] min-w-[200px] bg-white p-2 shadow-2xl border border-slate-200 rounded-2xl">
              <button @click="$emit('updateStatus', product, 'Terjual')" v-if="product.Status_Transaksi?.includes('Jual') && product.Status_Properti != 'Terjual'" class="admin-dropdown-item hover:bg-emerald-50 hover:text-emerald-600"><Icon icon="lucide:badge-check" class="size-4" /> Tandai Terjual</button>
              <button @click="$emit('updateStatus', product, 'Tersewa')" v-if="product.Status_Transaksi?.includes('Sewa') && product.Status_Properti != 'Tersewa'" class="admin-dropdown-item hover:bg-emerald-50 hover:text-emerald-600"><Icon icon="lucide:key" class="size-4" /> Tandai Tersewa</button>
              <button @click="$emit('updateStatus', product, 'Tersedia')" v-if="product.Status_Properti != 'Tersedia'" class="admin-dropdown-item hover:bg-bejo-50 hover:text-bejo-600">
                <Icon icon="lucide:rotate-ccw" class="size-4" /> 
                {{ product.Status_Properti == 'Terjual' ? 'Batal Terjual' : (product.Status_Properti == 'Tersewa' ? 'Batal Tersewa' : 'Batal Status') }}
              </button>
              <hr class="my-2 border-slate-100" />
              <button @click="$emit('updateStatus', product, 'Aktif')" v-if="product.Status_Display == 'Draft' && product.Status_Properti == 'Tersedia'" class="admin-dropdown-item hover:bg-blue-50 hover:text-blue-600"><Icon icon="lucide:eye" class="size-4" /> Tampilkan Produk</button>
              <button @click="$emit('updateStatus', product, 'Draft')" v-if="product.Status_Display == 'Aktif' && product.Status_Properti == 'Tersedia'" class="admin-dropdown-item hover:bg-amber-50 hover:text-amber-600"><Icon icon="lucide:eye-off" class="size-4" /> Jadikan Draft</button>
              <button @click="$emit('edit', product.Slug)" class="admin-dropdown-item hover:bg-slate-50 hover:text-slate-900"><Icon icon="lucide:pencil" class="size-4" /> Ubah Data</button>
              <button @click="$emit('delete', product)" class="admin-dropdown-item text-red-500 hover:bg-red-50"><Icon icon="lucide:trash-2" class="size-4" /> Hapus Unit</button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, onMounted, computed } from 'vue'
import { useSettings } from '@/stores/settings'
import { storeToRefs } from 'pinia'

const settingsStore = useSettings()
const { app } = storeToRefs(settingsStore)
const isImageLoaded = ref(false)

onMounted(() => {
  // Fallback: Jika dalam 10 detik gambar belum load (gagal/lelet), 
  // paksa tutup shimmer agar user tetap bisa melihat konten teks.
  setTimeout(() => {
    isImageLoaded.value = true
  }, 10000)
})

const props = withDefaults(
  defineProps<{
    product: any
    isLoading?: boolean
    isAdmin?: boolean
    activeDropdownId?: string | null
    disableRouting?: boolean
    collapsibleDetails?: boolean
    showSelectButton?: boolean
    isExpanded?: boolean
    hideSpecs?: boolean
    lazy?: boolean
  }>(),
  {
    isLoading: false,
    isAdmin: false,
    activeDropdownId: null,
    disableRouting: false,
    collapsibleDetails: false,
    showSelectButton: false,
    isExpanded: false,
    hideSpecs: false,
    lazy: true
  }
)

const hasMedia = computed(() => props.product?.MediaUrls && props.product.MediaUrls.length > 0)

// Gabungkan status loading data dan loading gambar
const effectivelyLoading = computed(() => {
  if (props.isLoading) return true
  // Jika ada media tapi belum load, tetap anggap loading
  if (hasMedia.value && !isImageLoaded.value) return true
  return false
})

const emit = defineEmits(['toggleDropdown', 'updateStatus', 'delete', 'edit', 'select', 'toggleExpand'])

const targetUrl = computed(() => {
  return props.isAdmin ? `/properti/detail/${props.product.Slug}` : `/detail/${props.product.Slug}`
})

const formatCurrency = (value: number) => {
  if (!value) return 'Rp 0'
  if (value >= 1e12) return 'Rp ' + (value / 1e12).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' T'
  if (value >= 1e9) return 'Rp ' + (value / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' M'
  if (value >= 1e6) return 'Rp ' + (value / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' Jt'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

const handleClick = () => {
  if (!effectivelyLoading.value) {
    emit('select', props.product)
  }
}
</script>

<style scoped>
@reference "@/assets/css/style.css";
.admin-dropdown-item {
  @apply w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all rounded-xl text-left;
}
</style>
