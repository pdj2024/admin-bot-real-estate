<template>
  <div 
    class="group flex flex-col h-full rounded-[2.5rem] overflow-hidden border transition-all duration-500 relative bg-white border-slate-100 shadow-xl shadow-slate-200/30" 
    :class="!isLoading ? 'hover:-translate-y-2 hover:shadow-2xl hover:border-bejo-200 hover:shadow-bejo-600/10 cursor-pointer' : ''"
    @click="handleClick"
  >
    <!-- Card Image Header -->
    <div class="relative h-60 overflow-hidden" :class="isLoading ? 'bg-slate-200 animate-pulse' : 'bg-slate-100 p-3'">
      <div v-if="!isLoading" class="w-full h-full rounded-[2rem] overflow-hidden relative">
        <!-- Overlay for Non-Active -->
        <div v-if="product.Status_Display != 'Aktif' && product.Status_Properti != 'Tersedia'" class="absolute inset-0 bg-black/40 backdrop-grayscale-[60%] z-[5] pointer-events-none transition-all duration-500"></div>
        <div v-if="product.Status_Display != 'Aktif' && product.Status_Properti != 'Tersedia'" class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div class="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl transform transition-transform duration-500 group-hover:scale-110">
            <span class="text-sm font-black uppercase tracking-[0.2em] text-white">
              {{ product.Status_Display != 'Aktif' ? 'Nonaktif' : product.Status_Properti }}
            </span>
          </div>
        </div>

        <!-- Main Image -->
        <img v-if="product.MediaUrls && product.MediaUrls.length >= 1" :src="product.MediaUrls[0].Id_Media" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div v-else class="absolute inset-0 bg-slate-200 flex flex-col items-center justify-center">
          <Icon icon="lucide:image" class="size-16 text-slate-400" />
        </div>

        <!-- Gradients -->
        <div class="absolute inset-x-0 bottom-0 min-h-24 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
        <div class="absolute top-0 inset-x-0 min-h-24 bg-gradient-to-b from-slate-900/60 to-transparent"></div>
        
        <!-- Status Badges Top Left -->
        <div class="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <span class="w-fit bg-bejo-600/90 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-lg shadow-md border border-bejo-400">
            {{ product.Status_Display != 'Aktif' ? 'Nonaktif' : product.Status_Properti }}
          </span>
          <div class="flex flex-wrap gap-1.5" v-if="product.Status_Transaksi">
            <span v-for="(trans, i) in product.Status_Transaksi" :key="i" class="bg-black/60 backdrop-blur-md text-bejo-100 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border border-slate-600">
              {{ trans }}
            </span>
          </div>
        </div>

        <!-- Access Road Stickers Bottom Right -->
        <div class="absolute bottom-4 right-4 flex flex-col gap-1.5 items-end z-10" v-if="product.Akses_Jalan">
          <span v-for="(akses, idx) in product.Akses_Jalan.slice(0, 2)" :key="idx" class="bg-white/90 backdrop-blur-md text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-md border-l-4 border-bejo-600 shadow-sm flex items-center gap-1.5">
            <Icon icon="lucide:map-pin" class="size-2.5 text-bejo-600" />
            {{ akses }}
          </span>
        </div>
      </div>
    </div>

    <!-- Card Body -->
    <div class="p-6 flex flex-col flex-1">
      <!-- Location -->
      <div class="flex items-start gap-1.5 text-bejo-600 mb-3" :class="isLoading ? 'opacity-50 grayscale' : ''">
        <Icon icon="lucide:map-pin" class="size-4 mt-0.5" />
        <div class="flex flex-col">
          <span class="text-[11px] font-black uppercase tracking-wider" :class="isLoading ? 'bg-slate-200 text-transparent animate-pulse rounded w-24 mb-1' : 'text-bejo-600'">{{ isLoading ? '.' : (product.Area ? product.Area[0] : '') }}</span>
          <p class="text-[11px] font-bold text-slate-500 line-clamp-1" :class="isLoading ? 'bg-slate-200 text-transparent animate-pulse rounded w-48' : ''">
            <span v-if="!isLoading && !product.Hide_alamat">{{ product.Alamat }}</span>
            <span v-if="!isLoading && product.Area && product.Area[1]"> ({{ product.Area[1] }})</span>
            <span v-if="isLoading">Memuat Detail Lokasi...</span>
          </p>
        </div>
      </div>

      <!-- Title -->
      <h6 class="text-xl text-slate-900 font-black transition-colors line-clamp-2 mb-2 leading-tight" :class="isLoading ? 'text-transparent bg-slate-200 animate-pulse rounded w-full' : 'group-hover:text-bejo-600'">
        <RouterLink v-if="!isLoading && !disableRouting" :to="targetUrl" class="before:absolute before:inset-0">{{ product.Nama_Produk }}</RouterLink>
        <div v-else-if="!isLoading && disableRouting" class="before:absolute before:inset-0">{{ product.Nama_Produk }}</div>
        <span v-else>Memuat Nama Katalog Properti Terbaru</span>
      </h6>

      <!-- Type & Size Info -->
      <p class="text-xs font-semibold text-slate-400 mb-6" :class="isLoading ? 'text-transparent bg-slate-200 animate-pulse rounded w-32' : ''">
        <span v-if="!isLoading">{{ product.Tipe }} &bull; Tipe {{ product.Luas_Bangunan }}</span>
        <span v-else>...</span>
      </p>

      <!-- Specs Grid -->
      <div class="grid grid-cols-2 gap-3 rounded-2xl p-4 mb-5 border border-slate-100 bg-gradient-to-br from-slate-50 to-white/50 shadow-inner">
        <div class="flex items-center gap-2">
          <div class="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0" :class="isLoading ? 'opacity-50 grayscale' : ''">
            <Icon icon="lucide:land-plot" class="size-3.5 text-bejo-600" />
          </div>
          <span class="text-xs font-bold" :class="isLoading ? 'bg-slate-200 text-transparent animate-pulse rounded w-12' : 'text-slate-700'">LT {{ isLoading ? 0 : (product.Luas_Tanah || 0) }} m²</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0" :class="isLoading ? 'opacity-50 grayscale' : ''">
            <Icon icon="lucide:home" class="size-3.5 text-bejo-600" />
          </div>
          <span class="text-xs font-bold" :class="isLoading ? 'bg-slate-200 text-transparent animate-pulse rounded w-12' : 'text-slate-700'">LB {{ isLoading ? 0 : (product.Luas_Bangunan || 0) }} m²</span>
        </div>
        <div class="flex items-center gap-2" v-if="!isLoading">
          <div class="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0">
            <Icon icon="lucide:layers" class="size-3.5 text-bejo-600" />
          </div>
          <span class="text-xs font-bold text-slate-700">{{ product.Jumlah_Lantai || 0 }} Lt</span>
        </div>
        <div class="flex items-center gap-2" v-if="!isLoading">
          <div class="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0">
            <Icon icon="lucide:car" class="size-3.5 text-bejo-600" />
          </div>
          <span class="text-xs font-bold text-slate-700">{{ product.Jumlah_Carpot || 0 }} Mob</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0" :class="isLoading ? 'opacity-50 grayscale' : ''">
            <Icon icon="lucide:bed" class="size-3.5 text-bejo-600" />
          </div>
          <span class="text-xs font-bold" :class="isLoading ? 'bg-slate-200 text-transparent animate-pulse rounded w-8' : 'text-slate-700'">{{ isLoading ? 0 : (product.Jumlah_Kamar_Tidur || 0) }} Kmr</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0" :class="isLoading ? 'opacity-50 grayscale' : ''">
            <Icon icon="lucide:bath" class="size-3.5 text-bejo-600" />
          </div>
          <span class="text-xs font-bold" :class="isLoading ? 'bg-slate-200 text-transparent animate-pulse rounded w-8' : 'text-slate-700'">{{ isLoading ? 0 : (product.Jumlah_Kamar_Mandi || 0) }} Kmr</span>
        </div>
      </div>

      <!-- Pricing Info -->
      <div class="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-3 relative">
        <!-- Rental Price -->
        <div v-if="isLoading || product.Harga_Sewa1 > 0" class="flex flex-col">
          <span class="text-[10px] font-black uppercase tracking-widest mb-0.5" :class="isLoading ? 'bg-slate-200 text-transparent animate-pulse rounded w-16' : 'text-slate-400'">
            Harga Sewa <span v-if="!isLoading && product.Minimal_Sewa"> (min. {{ product.Minimal_Sewa }} {{ product.Satuan_Minimal_Sewa }})</span>
          </span>
          <div class="flex flex-wrap items-baseline gap-2">
            <span class="text-xl font-black" :class="isLoading ? 'bg-slate-200 text-transparent animate-pulse rounded w-32 h-6 mt-1' : 'text-slate-900'">
              {{ isLoading ? '' : formatCurrency(product.Harga_Sewa2 > 0 ? product.Harga_Sewa2 : product.Harga_Sewa1) }}
            </span>
            <div v-if="!isLoading && product.Harga_Sewa2 > 0" class="flex items-center gap-2">
              <span class="relative text-xs text-slate-400 font-bold px-1 line-through decoration-red-500 decoration-2">
                {{ formatCurrency(product.Harga_Sewa1) }}
              </span>
              <span class="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-lg border border-red-100">
                -{{ Math.round(((product.Harga_Sewa1 - product.Harga_Sewa2) / product.Harga_Sewa1) * 100) }}%
              </span>
            </div>
            <span v-if="!isLoading" class="text-[10px] text-slate-400 font-bold ml-1 italic">/ {{ product.Satuan_Minimal_Sewa || 'thn' }}</span>
          </div>
        </div>

        <!-- Sale Price -->
        <div v-if="!isLoading && product.Harga_Jual1 > 0" class="flex flex-col">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Harga Jual</span>
          <div class="flex flex-wrap items-baseline gap-2">
            <span class="text-2xl font-black text-slate-900">
              {{ formatCurrency(product.Harga_Jual2 > 0 ? product.Harga_Jual2 : product.Harga_Jual1) }}
            </span>
            <div v-if="product.Harga_Jual2 > 0" class="flex items-center gap-2">
              <span class="relative text-xs text-slate-400 font-bold px-1 line-through decoration-red-500 decoration-2">
                {{ formatCurrency(product.Harga_Jual1) }}
              </span>
              <span class="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-lg border border-red-100">
                -{{ Math.round(((product.Harga_Jual1 - product.Harga_Jual2) / product.Harga_Jual1) * 100) }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Admin Actions Dropdown -->
        <div v-if="isAdmin && !isLoading" class="absolute bottom-1 right-0 z-20" @click.stop>
          <button @click="$emit('toggleDropdown', product.No_Id)" class="size-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-bejo-600 hover:text-white transition-all shadow-sm">
            <Icon icon="lucide:more-vertical" class="size-5" />
          </button>
          
          <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <div v-show="activeDropdownId === product.No_Id" class="absolute right-0 bottom-12 z-[100] min-w-[200px] bg-white p-2 shadow-2xl border border-slate-200 rounded-2xl">
              <button @click="$emit('updateStatus', product, 'Terjual')" v-if="product.Status_Transaksi?.includes('Jual') && product.Status_Properti != 'Terjual'" class="admin-dropdown-item hover:bg-emerald-50 hover:text-emerald-600">
                <Icon icon="lucide:badge-check" class="size-4" /> Tandai Terjual
              </button>
              <button @click="$emit('updateStatus', product, 'Tersewa')" v-if="product.Status_Transaksi?.includes('Sewa') && product.Status_Properti != 'Tersewa'" class="admin-dropdown-item hover:bg-emerald-50 hover:text-emerald-600">
                <Icon icon="lucide:key" class="size-4" /> Tandai Tersewa
              </button>
              <button @click="$emit('updateStatus', product, 'Tersedia')" v-if="product.Status_Properti != 'Tersedia'" class="admin-dropdown-item hover:bg-bejo-50 hover:text-bejo-600">
                <Icon icon="lucide:rotate-ccw" class="size-4" /> Batal Status
              </button>
              <hr class="my-2 border-slate-100" />
              <button @click="$emit('edit', product.Slug)" class="admin-dropdown-item hover:bg-slate-50 hover:text-slate-900">
                <Icon icon="lucide:pencil" class="size-4" /> Ubah Data
              </button>
              <button @click="$emit('delete', product)" class="admin-dropdown-item text-red-500 hover:bg-red-50">
                <Icon icon="lucide:trash-2" class="size-4" /> Hapus Unit
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  product: any
  isLoading?: boolean
  isAdmin?: boolean
  activeDropdownId?: string | null
  disableRouting?: boolean
}>(), {
  isLoading: false,
  isAdmin: false,
  activeDropdownId: null,
  disableRouting: false
})

const emit = defineEmits(['toggleDropdown', 'updateStatus', 'delete', 'edit', 'click'])

const targetUrl = computed(() => {
  return props.isAdmin ? `/admin/properti/edit/${props.product.Slug}` : `/detail/${props.product.Slug}`
})

const formatCurrency = (value: number) => {
  if (!value) return 'Rp 0'
  if (value >= 1e12) return 'Rp ' + (value / 1e12).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' T'
  if (value >= 1e9) return 'Rp ' + (value / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' M'
  if (value >= 1e6) return 'Rp ' + (value / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' Jt'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

const handleClick = () => {
  if (!props.isLoading) {
    emit('click', props.product.Slug)
  }
}
</script>

<style scoped>
@reference "@/assets/css/style.css";
.admin-dropdown-item {
  @apply w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all rounded-xl text-left;
}
</style>
