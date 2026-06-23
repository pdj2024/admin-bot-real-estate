<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import type { Product } from '../index.vue'
import { downloadBrochure } from '@/utils/propertyBrochure'
import { useSettings } from '@/stores/settings'
import { success, fail } from '@/utils/sweet-alert'

const router = useRouter()
const props = defineProps<{
  product: Product | null
  isAdmin?: boolean
}>()

const goToCatalogByArea = () => {
  if (!props.product) return
  
  let cityName = props.product.Nama_Kota || ''
  let provinceName = (props.product as any).Nama_Provinsi || (props.product as any).Provinsi || ''

  // Logic: If city contains a comma (e.g., "Surabaya, Jawa Timur"), split it
  if (cityName.includes(',')) {
    const parts = cityName.split(',')
    cityName = parts[0].trim()
    if (!provinceName) {
      provinceName = parts[1].trim()
    }
  }

  router.push({
    path: '/katalog',
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

defineEmits(['openCompare', 'openLightbox'])

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

const handleShare = () => {
  if (!props.product) return
  const url = window.location.origin + '/properti/detail/' + props.product.Slug
  navigator.clipboard.writeText(url)
  alert('Link properti berhasil disalin!')
}

const handleWhatsApp = () => {
  if (!props.product) return
  const message = `Halo, saya tertarik dengan properti "${props.product.Nama_Produk}" yang saya lihat di website. Bisa minta info lebih lanjut?%0A%0AUrl: ${window.location.origin}/properti/detail/${props.product.Slug}`
  window.open(`https://wa.me/6281234567890?text=${message}`, '_blank')
}

const settingsStore = useSettings()
const isDownloading = ref(false)
const handleDownload = async () => {
  if (!props.product || isDownloading.value) return
  isDownloading.value = true
  
  const res = await downloadBrochure(props.product, settingsStore.business, settingsStore.app)
  if (res) {
    success('Brosur berhasil diunduh')
  } else {
    fail('Gagal mengunduh brosur')
  }
  isDownloading.value = false
}
</script>

<template>
  <div class="flex flex-col gap-5 lg:sticky lg:top-28 h-fit z-20">
    <!-- Back Button -->
    <div class="flex items-center">
      <router-link 
        to="/katalog" 
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
                class="size-full object-cover cursor-pointer" 
                controls 
                autoplay 
                muted 
                loop
                @click="$emit('openLightbox', activeMediaIndex)"
              ></video>
            </template>
            <template v-else-if="currentMedia?.type === 'image'">
              <img 
                :src="currentMedia.url!" 
                class="size-full object-cover transition-transform duration-700 group-hover/main:scale-110 cursor-pointer" 
                :alt="product?.Nama_Produk" 
                @click="$emit('openLightbox', activeMediaIndex)"
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
        <div v-if="product && product.Status_Properti != 'Tersedia'" class="absolute inset-0 bg-black/40 backdrop-grayscale-[60%] z-[15] pointer-events-none transition-all duration-500"></div>

        <!-- Status Badges Overlay -->
        <div v-if="product && product.Status_Properti !== 'Tersedia'" class="absolute top-6 left-6 z-10">
          <div class="px-6 py-2 rounded-full bg-slate-900/90 backdrop-blur-md border border-white/10 shadow-2xl flex items-center justify-center animate-in fade-in zoom-in duration-500">
             <span class="text-[11px] font-black uppercase tracking-[0.2em] text-white">{{ product.Status_Properti }}</span>
          </div>
        </div>

        <!-- Large Centered Status Badge (Terjual/Tersewa) -->
        <div v-if="product && product.Status_Properti !== 'Tersedia'" class="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div class="px-8 py-3 rounded-[1.5rem] bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-2xl animate-in zoom-in fade-in duration-500 scale-125">
             <span class="text-sm font-black uppercase tracking-[0.2em] text-white">
               {{ product.Status_Properti }}
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

    <!-- Actions -->
    <div class="card bg-white rounded-3xl p-6 shadow-premium border-none space-y-6">
       <!-- Area Context -->
       <div v-if="product?.Nama_Kota" class="flex items-center justify-between gap-4 p-4 bg-bejo-50/50 rounded-2xl border border-bejo-100 group hover:bg-bejo-50 transition-all duration-300">
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

       <div class="grid grid-cols-1 gap-3">
          <!-- Contact Button - Hidden if already Sold/Rented -->
          <button v-if="product?.Status_Properti === 'Tersedia'" @click="handleWhatsApp" class="w-full h-14 bg-green-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all active:scale-95 flex items-center justify-center gap-3">
             <Icon icon="ic:baseline-whatsapp" class="size-6" />
             Hubungi Kami
          </button>

          <!-- Secondary Actions -->
          <div class="grid grid-cols-2 gap-3">
             <button @click="$emit('openCompare')" class="h-12 bg-bejo-50 text-bejo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-bejo-100 hover:bg-bejo-600 hover:text-white transition-all flex items-center justify-center gap-2">
                <Icon icon="lucide:git-compare" class="size-4" />
                Bandingkan
             </button>
             <button @click="handleShare" class="h-12 bg-slate-50 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                <Icon icon="lucide:share-2" class="size-4" />
                Bagikan
             </button>
          </div>

          <button @click="handleDownload" :disabled="isDownloading" class="w-full h-12 bg-bejo-50 text-bejo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-bejo-100 hover:bg-bejo-600 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50">
             <Icon v-if="isDownloading" icon="lucide:loader-2" class="size-4 animate-spin" />
             <Icon v-else icon="lucide:file-down" class="size-4" />
             Unduh Brosur Digital
          </button>
       </div>

       <!-- Disclaimer -->
       <div class="mt-6 pt-6 border-t border-slate-50">
          <p class="text-[9px] font-bold text-slate-400 text-center leading-relaxed">
             Dengan menghubungi kami, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi kami.
          </p>
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
