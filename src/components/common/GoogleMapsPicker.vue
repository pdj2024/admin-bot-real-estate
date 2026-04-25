<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { inject } from 'vue'

const props = defineProps<{
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
  <div class="space-y-4">
    <div class="relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 group">
      <!-- Map Container -->
      <div 
        ref="mapContainer" 
        class="w-full transition-opacity duration-700" 
        :style="{ height: height || '250px' }"
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

    <!-- Map Info Footer -->
    <div class="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
      <div class="p-2 bg-white rounded-lg shadow-sm">
        <Icon icon="lucide:info" class="size-4 text-primary" />
      </div>
      <div class="flex-1">
        <h6 class="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-0.5">Petunjuk Interaksi</h6>
        <p class="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
          Anda dapat menitik lokasi dengan mengeklik peta atau menyeret penanda (marker) yang sudah ada untuk mendapatkan titik koordinat yang presisi.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";
</style>
