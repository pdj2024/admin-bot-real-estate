<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'
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
    const key = m.Url || m.Id_Media
    if (!seen.has(key)) {
      seen.add(key)
      uniqueMedia.push(m)
    }
  }

  const getOrderIndex = (noIdMedia: string) => {
    if (!props.product) return 99999
    if (props.product.Id_Media_Thumbnail === noIdMedia) return 0
    
    let idx = props.product.Id_Media_3d?.indexOf(noIdMedia)
    if (idx !== undefined && idx !== -1) return 100 + idx
    
    idx = props.product.Id_Media_Denah?.indexOf(noIdMedia)
    if (idx !== undefined && idx !== -1) return 200 + idx
    
    idx = props.product.File_Image?.indexOf(noIdMedia)
    if (idx !== undefined && idx !== -1) return 300 + idx
    
    return 99999
  }

  uniqueMedia.sort((a, b) => getOrderIndex(a.No_Id_Media || '') - getOrderIndex(b.No_Id_Media || ''))

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
  (e: 'openLightbox', index: number, mediaArray: any[]): void
}>()

const handleShare = () => {
  if (!props.product) return
  const url = window.location.origin + '/properti/' + props.product.Slug
  navigator.clipboard.writeText(url)
  alert('Link properti berhasil disalin!')
}

const lastKeyPositions = ref<any[]>([])
const isKeyDropdownOpen = ref(false)

const fetchLastKeyPositions = async () => {
  if (!props.product?.No_Id) return
  try {
    const { data } = await api.get(`/api/pinjamKunci/getAll?orderby=Tanggal_Pengajuan&id_produk=${props.product.No_Id}`)
    
    if (data.Data && Array.isArray(data.Data)) {
      const sorted = [...data.Data].sort((a, b) => new Date(b.Tanggal_Pengajuan).getTime() - new Date(a.Tanggal_Pengajuan).getTime())
      const uniqueKeys = new Map()
      for (const item of sorted) {
        if (!uniqueKeys.has(item.Id_Kunci)) {
          uniqueKeys.set(item.Id_Kunci, item)
        }
      }
      lastKeyPositions.value = Array.from(uniqueKeys.values())
    }
  } catch (err) {
    console.error('Failed to fetch key positions:', err)
  }
}

watch(() => props.product?.No_Id, (newId) => {
  if (newId) fetchLastKeyPositions()
}, { immediate: true })
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
    <div v-if="media.length > 0 || !product" class="card bg-white rounded-[2.5rem] overflow-hidden shadow-premium border-none relative group/main">
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
                class="size-full object-cover cursor-pointer" 
                controls 
                autoplay 
                muted 
                loop
                @click="emit('openLightbox', activeMediaIndex, media)"
                referrerpolicy="no-referrer"
              ></video>
            </template>
            <template v-else-if="currentMedia?.type === 'image'">
              <img 
                :src="currentMedia.url!" 
                class="size-full object-cover transition-transform duration-700 group-hover/main:scale-110 cursor-pointer" 
                :alt="product?.Nama_Produk" 
                @click="emit('openLightbox', activeMediaIndex, media)"
                referrerpolicy="no-referrer"
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
               referrerpolicy="no-referrer"
            ></video>
            <img v-else :src="item.thumb!" class="size-full object-cover" referrerpolicy="no-referrer" />
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

       <div class="flex items-center justify-between">
         <h6 class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Icon icon="lucide:lock" class="size-3" />
            Kontrol Admin
         </h6>
         <button @click="handleShare" class="size-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-bejo-50 hover:text-bejo-600 transition-colors border border-slate-100" title="Bagikan Link">
            <Icon icon="lucide:share-2" class="size-4" />
         </button>
       </div>
       <div class="grid grid-cols-1 gap-3">
          <!-- Custom Link -->
          <a v-if="product?.Link" :href="product.Link" target="_blank" rel="noopener noreferrer" class="w-full h-12 px-4 bg-bejo-50 text-bejo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-bejo-100 hover:bg-bejo-600 hover:text-white transition-all flex items-center justify-start gap-3 disabled:opacity-50">
             <Icon icon="lucide:external-link" class="size-4 shrink-0" />
             <span class="truncate">{{ product?.Link_Caption ? 'Lihat ' + product.Link_Caption : product.Link }}</span>
          </a>

          <!-- Created By -->
          <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <div class="flex items-center gap-3">
                <div class="size-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 text-slate-400">
                   <Icon icon="lucide:user-circle" class="size-5" />
                </div>
                <div>
                   <span class="block text-xs font-black text-slate-900 uppercase tracking-wide">Dibuat Oleh</span>
                   <span class="block text-[10px] font-bold text-slate-400">
                      {{ (product as any)?.Nama_Admin ? `${(product as any).Nama_Admin} (${product?.Created_By})` : (product?.Created_By || '-') }}
                   </span>
                </div>
             </div>
          </div>

          <!-- Posisi Kunci Terakhir -->
          <div v-if="lastKeyPositions.length > 0" class="border border-slate-100 rounded-2xl bg-slate-50 overflow-hidden">
             <button @click="isKeyDropdownOpen = !isKeyDropdownOpen" class="flex items-center justify-between w-full p-4 hover:bg-slate-100 transition-colors">
                <div class="flex items-center gap-3">
                   <div class="size-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 text-slate-400">
                      <Icon icon="lucide:key" class="size-5" />
                   </div>
                   <div class="text-left">
                      <span class="block text-xs font-black text-slate-900 uppercase tracking-wide">Posisi Kunci</span>
                      <span class="block text-[10px] font-bold text-slate-400">{{ lastKeyPositions.length }} Kunci Tercatat</span>
                   </div>
                </div>
                <Icon icon="lucide:chevron-down" class="size-4 text-slate-400 transition-transform duration-300" :class="isKeyDropdownOpen ? 'rotate-180' : ''" />
             </button>
             <div v-show="isKeyDropdownOpen" class="px-4 pb-4">
                <div class="flex flex-col gap-2 pt-2 border-t border-slate-200/60">
                   <div v-for="kunci in lastKeyPositions" :key="kunci.Id_Kunci" class="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
                      <div class="size-8 bg-bejo-50 rounded-lg shrink-0 flex items-center justify-center text-bejo-600 mt-0.5">
                         <Icon icon="lucide:key" class="size-4" />
                      </div>
                      <div class="flex-1 min-w-0">
                         <div class="flex justify-between items-start gap-2">
                           <span class="block text-xs font-black text-slate-900 truncate">{{ kunci.Nama_Kunci }}</span>
                           <span class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" 
                                 :class="kunci.Status_Progress === 'dikembalikan' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'">
                              {{ kunci.Status_Progress }}
                           </span>
                         </div>
                         <span class="block text-[10px] font-bold text-slate-500 mt-1 truncate">
                            Oleh <span class="text-bejo-600">{{ kunci.Nama_Agent }}</span>
                         </span>
                         <span class="block text-[9px] font-semibold text-slate-400 mt-0.5">{{ new Date(kunci.Tanggal_Pengajuan).toLocaleString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'}) }}</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

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
