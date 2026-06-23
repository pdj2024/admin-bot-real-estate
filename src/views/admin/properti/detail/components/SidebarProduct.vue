<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import type { Product } from '../index.vue'

const router = useRouter()
const props = defineProps<{
  product: Product | null
}>()

const activeMediaIndex = ref(0)

// Touch Swipe Handler
const touchStartX = ref(0)
const touchEndX = ref(0)

const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.changedTouches[0].screenX
}

const handleTouchEnd = (e: TouchEvent) => {
  touchEndX.value = e.changedTouches[0].screenX
  handleSwipe()
}

const handleSwipe = () => {
  if (media.value.length <= 1) return
  const swipeThreshold = 50
  const diffX = touchEndX.value - touchStartX.value
  
  if (Math.abs(diffX) > swipeThreshold) {
    if (diffX > 0) {
      activeMediaIndex.value = (activeMediaIndex.value - 1 + media.value.length) % media.value.length
    } else {
      activeMediaIndex.value = (activeMediaIndex.value + 1) % media.value.length
    }
  }
}

const media = computed(() => {
  if (!props.product?.MediaUrls) return []
  
  // Filter unique No_Id_Media to avoid duplicates
  const uniqueMedia = []
  const seen = new Set()
  
  for (const m of props.product.MediaUrls) {
    if (!seen.has(m.No_Id_Media)) {
      seen.add(m.No_Id_Media)
      uniqueMedia.push(m)
    }
  }

  return uniqueMedia.map(m => ({
    url: m.Url || m.Id_Media, // Fallback to Id_Media if Url is missing
    type: m.ContentType?.startsWith('video/') ? 'video' : 'image',
    thumb: m.ThumbUrl || m.Url || m.Id_Media
  }))
})

const currentMedia = computed(() => media.value[activeMediaIndex.value] || null)

const goToCatalogByArea = () => {
  if (!props.product) return
  
  let cityName = props.product.Nama_Kota || ''
  let provinceName = (props.product as any).Nama_Provinsi || (props.product as any).Provinsi || ''

  if (cityName.includes(',')) {
    const parts = cityName.split(',')
    cityName = parts[0].trim()
    if (!provinceName) provinceName = parts[1].trim()
  }

  router.push({
    path: '/properti/katalog',
    query: {
      province: provinceName,
      city: cityName
    }
  })
}

const displayArea = computed(() => {
  if (!props.product) return ''
  let cityName = props.product.Nama_Kota || ''
  let provinceName = (props.product as any).Nama_Provinsi || (props.product as any).Provinsi || ''
  
  if (cityName.includes(',')) {
    const parts = cityName.split(',')
    cityName = parts[0].trim()
    if (!provinceName) provinceName = parts[1].trim()
  }
  
  return provinceName ? `${cityName}, ${provinceName}` : cityName
})

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'delete'): void
}>()

const handleShare = () => {
  if (!props.product) return
  const url = window.location.origin + '/properti/' + props.product.Slug
  navigator.clipboard.writeText(url)
  alert('Link properti berhasil disalin!')
}
</script>

<template>
  <div class="flex flex-col gap-5 lg:sticky lg:top-24 h-fit z-20">
    <!-- Back Button -->
    <div class="flex items-center">
      <router-link 
        to="/properti/katalog" 
        class="group flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-bejo-200 hover:bg-bejo-50 transition-all text-slate-500 hover:text-bejo-600 w-fit"
      >
        <Icon icon="lucide:arrow-left" class="size-4 group-hover:-translate-x-1 transition-transform" />
        <span class="text-[10px] font-black uppercase tracking-widest">Kembali ke Katalog</span>
      </router-link>
    </div>

    <!-- Media Showcase -->
    <div class="card bg-white rounded-[2.5rem] overflow-hidden shadow-premium border-none relative group/main">
      <!-- Main Display -->
      <div 
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
        class="aspect-[4/3] relative bg-slate-100 overflow-hidden"
      >
          <div class="size-full">
            <template v-if="!product">
              <div class="size-full animate-pulse bg-slate-200"></div>
            </template>
            <template v-else-if="currentMedia?.type === 'video'">
              <video 
                :src="currentMedia.url!" 
                class="size-full object-cover" 
                controls 
                autoplay 
                muted 
                loop
              ></video>
            </template>
            <template v-else-if="currentMedia?.type === 'image'">
              <img 
                :src="currentMedia.url!" 
                class="size-full object-cover transition-transform duration-700 group-hover/main:scale-110" 
                :alt="product?.Nama_Produk" 
              />
            </template>
            <template v-else>
               <div class="size-full flex items-center justify-center text-slate-300">
                  <Icon icon="lucide:image-off" class="size-12" />
               </div>
            </template>
          </div>

        <!-- Navigation Buttons -->
        <div v-if="media.length > 1" class="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-0 group-hover/main:opacity-100 transition-opacity z-20 pointer-events-none">
          <button 
            @click.stop="activeMediaIndex = (activeMediaIndex - 1 + media.length) % media.length" 
            class="size-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-bejo-600 transition-all pointer-events-auto border border-white/10"
          >
            <Icon icon="lucide:chevron-left" class="size-6" />
          </button>
          <button 
            @click.stop="activeMediaIndex = (activeMediaIndex + 1) % media.length" 
            class="size-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-bejo-600 transition-all pointer-events-auto border border-white/10"
          >
            <Icon icon="lucide:chevron-right" class="size-6" />
          </button>
        </div>
        
        <!-- Darkening Overlay for Non-Available Status (Match Catalog Style) -->
        <div v-if="product && (product.Status_Display != 'Aktif' || product.Status_Properti != 'Tersedia')" class="absolute inset-0 bg-black/40 backdrop-grayscale-[60%] z-[15] pointer-events-none transition-all duration-500"></div>

        <!-- Status Badges Overlay -->
        <div v-if="product" class="absolute top-6 left-6 z-10">
          <!-- Priority 1: Finalized Status (Terjual/Tersewa) -->
          <div v-if="product.Status_Properti !== 'Tersedia'" class="px-6 py-2 rounded-full bg-slate-900/90 backdrop-blur-md border border-white/10 shadow-2xl flex items-center justify-center animate-in fade-in zoom-in duration-500">
             <span class="text-[11px] font-black uppercase tracking-[0.2em] text-white">{{ product.Status_Properti }}</span>
          </div>

          <!-- Priority 2: Availability & Display Status (Draft/Aktif) -->
          <template v-else>
            <div v-if="product.Status_Display === 'Draft'" class="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-2">
              <div class="size-2 rounded-full bg-slate-400"></div>
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-900">Draft</span>
            </div>
            <div v-else class="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-2">
              <div class="size-2 rounded-full bg-green-500 animate-pulse"></div>
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-900">Aktif</span>
            </div>
          </template>
        </div>

        <!-- Large Centered Status Badge (Terjual/Tersewa/Draft) -->
        <div v-if="product && (product.Status_Properti !== 'Tersedia' || product.Status_Display === 'Draft')" class="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div class="px-8 py-3 rounded-[1.5rem] bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-2xl animate-in zoom-in fade-in duration-500 scale-125">
             <span class="text-sm font-black uppercase tracking-[0.2em] text-white">
               {{ product.Status_Properti !== 'Tersedia' ? product.Status_Properti : product.Status_Display }}
             </span>
          </div>
        </div>

        <!-- Media Counter -->
        <div v-if="media.length > 1" class="absolute bottom-6 right-6 px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[10px] font-black text-white uppercase tracking-widest">
           {{ activeMediaIndex + 1 }} / {{ media.length }}
        </div>
      </div>

      <!-- Thumbnails -->
      <div v-if="media.length > 1" class="p-4 bg-white border-t border-slate-50">
        <div class="flex gap-2 overflow-x-auto pb-2 custom-scroll">
          <button 
            v-for="(item, index) in media" 
            :key="index"
            @click="activeMediaIndex = index"
            class="relative size-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all"
            :class="activeMediaIndex === index ? 'border-bejo-500 scale-95 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'"
          >
            <video 
               v-if="item.type === 'video'" 
               :src="`${item.url}#t=0.001`" 
               class="size-full object-cover" 
               preload="metadata" 
               playsinline
            ></video>
            <img v-else :src="item.thumb!" class="size-full object-cover" />
            <div v-if="item.type === 'video'" class="absolute inset-0 flex items-center justify-center bg-black/20">
               <Icon icon="lucide:play" class="size-4 text-white fill-white/20" />
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Admin Actions -->
    <div class="card bg-white rounded-3xl p-6 shadow-premium border-none space-y-6">
       <!-- Area Context -->
       <div v-if="product?.Nama_Kota" class="flex items-center justify-between gap-4 p-4 bg-bejo-50/50 rounded-2xl border border-bejo-100 group/area hover:bg-bejo-50 transition-all duration-300">
          <div class="flex flex-col gap-1 min-w-0">
             <div class="flex items-center gap-2">
                <div class="size-2 rounded-full bg-bejo-500 animate-pulse"></div>
                <span class="text-[10px] font-black uppercase tracking-[0.15em] text-bejo-700 truncate">
                  Area {{ displayArea }}
                </span>
             </div>
          </div>
          <button 
            @click="goToCatalogByArea"
            class="flex items-center gap-2 text-bejo-600 hover:text-bejo-700 transition-colors group/btn shrink-0"
          >
            <span class="text-[9px] font-black uppercase tracking-[0.2em] border-b-2 border-bejo-200 group-hover/btn:border-bejo-600 transition-all">Lihat Area</span>
            <Icon icon="lucide:arrow-right" class="size-3 group-hover/btn:translate-x-1 transition-transform" />
          </button>
       </div>

       <h6 class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Icon icon="lucide:lock" class="size-3" />
          Kontrol Admin
       </h6>
       <div class="grid grid-cols-1 gap-3">
          <!-- Created By -->
          <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <div class="flex items-center gap-3">
                <div class="size-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 text-slate-400">
                   <Icon icon="lucide:user-circle" class="size-5" />
                </div>
                <div>
                   <span class="block text-xs font-black text-slate-900 uppercase tracking-wide">Dibuat Oleh</span>
                   <span class="block text-[10px] font-bold text-slate-400">{{ product?.Created_By || '-' }}</span>
                </div>
             </div>
          </div>

          <!-- Share Link -->
          <button @click="handleShare" class="flex items-center justify-between p-4 bg-slate-50 hover:bg-bejo-50 rounded-2xl transition-all group border border-slate-100 hover:border-bejo-200">
             <div class="flex items-center gap-3">
                <div class="size-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:border-bejo-200 group-hover:text-bejo-600">
                   <Icon icon="lucide:share-2" class="size-5" />
                </div>
                <div>
                   <span class="block text-xs font-black text-slate-900 uppercase tracking-wide">Bagikan Link</span>
                   <span class="block text-[10px] font-bold text-slate-400">Salin URL properti</span>
                </div>
             </div>
             <Icon icon="lucide:chevron-right" class="size-4 text-slate-300 group-hover:text-bejo-600 group-hover:translate-x-1 transition-all" />
          </button>

          <div class="flex items-center gap-3 mt-2">
             <button 
               @click="emit('edit')"
               class="flex-1 h-12 bg-bejo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-bejo-500/20 hover:bg-bejo-600 transition-all active:scale-95 flex items-center justify-center gap-2"
             >
                <Icon icon="lucide:edit" class="size-4" />
                Edit Properti
             </button>
             <button 
               @click="emit('delete')"
               class="size-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-100"
             >
                <Icon icon="lucide:trash-2" class="size-5" />
             </button>
          </div>
       </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.shadow-premium {
  box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.08);
}

.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

.custom-scroll::-webkit-scrollbar {
  height: 4px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
