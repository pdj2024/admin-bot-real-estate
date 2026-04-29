<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { inject } from 'vue'

defineProps<{
  height?: string
}>()

const state = inject<any>('propertyModalState')
if (!state) {
  throw new Error('GoogleMapsPicker must be used within a component providing propertyModalState')
}

const { 
  mapContainer, 
  isMapLoaded, 
  isLocationSelected, 
  isLocating, 
  getCurrentLocation 
} = state
</script>

<template>
  <div class="relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 group flex flex-col h-full w-full">
    <!-- Map Container -->
    <div 
      ref="mapContainer" 
      class="w-full flex-1 block transition-opacity duration-700 min-h-[350px]" 
      :style="{ height: height || '100%' }"
      :class="isMapLoaded ? 'opacity-100' : 'opacity-0'"
    ></div>

    <!-- Loading Overlay -->
    <div v-if="!isMapLoaded" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-10">
      <div class="relative">
        <Icon icon="lucide:map" class="size-10 text-slate-200" />
        <Icon icon="lucide:loader-2" class="absolute inset-0 size-10 animate-spin text-primary opacity-60" />
      </div>
      <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Inisialisasi Peta...</span>
    </div>

    <!-- Geolocation Button -->
    <button 
      @click="getCurrentLocation"
      type="button"
      class="absolute bottom-6 right-6 p-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl shadow-xl border border-slate-100 transition-all active:scale-90 flex items-center gap-2 group z-20"
      :disabled="isLocating"
    >
      <Icon :icon="isLocating ? 'lucide:loader-2' : 'lucide:locate-fixed'" 
            class="size-5 transition-colors"
            :class="[isLocating ? 'animate-spin text-primary' : 'text-slate-400 group-hover:text-primary']" />
      <span class="text-[10px] font-black uppercase tracking-widest">{{ isLocating ? 'Mencari...' : 'Lokasi Saya' }}</span>
    </button>

    <!-- Selection Indicator -->
    <div 
      v-if="!isLocationSelected && isMapLoaded" 
      class="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/5 backdrop-blur-[1px]"
    >
      <div class="bg-white/90 px-5 py-3 rounded-2xl shadow-lg border border-white/50 flex flex-col items-center gap-1 animate-bounce">
        <Icon icon="lucide:mouse-pointer-2" class="size-5 text-primary" />
        <span class="text-[9px] font-black text-slate-800 uppercase tracking-widest">Klik pada peta untuk memilih lokasi</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";
</style>
