<script setup lang="ts">
import { computed, ref } from 'vue';
import { Icon } from '@iconify/vue';

import { PROVINCE_COORDINATES } from './data';

interface Property {
  No_Id: string;
  Nama_Produk: string;
  Area: string[];
  [key: string]: any;
}

const props = defineProps<{
  properties: Property[];
}>();

const groupedProperties = computed(() => {
  const groups: Record<string, { count: number; x: number; y: number; names: string[]; originalName: string }> = {};
  
  props.properties.forEach(item => {
    // Correct parsing: take the first item of Area array (rawName)
    // then split by comma to get the Province part (e.g., "Kota Surabaya, Jawa Timur" -> "Jawa Timur")
    const areaString = (item.Area && item.Area[0]) ? item.Area[0] : null;
    let provinceName = null;

    if (areaString) {
      if (areaString.includes(',')) {
        // Split by comma and take the second part (the province)
        provinceName = areaString.split(',')[1].trim();
      } else {
        // Fallback or skip if no comma? For now, if no comma, use the whole string
        provinceName = areaString.trim();
      }
    }
    
    if (provinceName) {
      const normalizedName = provinceName.toLowerCase();
      // Get all province names, sorted by length descending to match more specific names first (e.g., 'Kepulauan Riau' before 'Riau')
      const provinceKeys = Object.keys(PROVINCE_COORDINATES).sort((a, b) => b.length - a.length);

      let foundKey = provinceKeys.find(key => {
        const lowerKey = key.toLowerCase();
        // Check for exact match or if the detected province name contains the key
        return normalizedName === lowerKey || normalizedName.includes(lowerKey);
      });

      if (foundKey) {
        if (!groups[foundKey]) {
          groups[foundKey] = {
            count: 0,
            x: PROVINCE_COORDINATES[foundKey].x,
            y: PROVINCE_COORDINATES[foundKey].y,
            names: [],
            originalName: provinceName // Show "Jawa Timur" not "Kota Surabaya, Jawa Timur"
          };
        }
        groups[foundKey].count++;
        if (groups[foundKey].names.length < 5) {
          groups[foundKey].names.push(item.Nama_Produk);
        }
      }
    }
  });
  
  return Object.values(groups);
});

const hoveredProvince = ref<any>(null);

const handleMouseEnter = (province: any) => {
  hoveredProvince.value = province;
};

const handleMouseLeave = () => {
  hoveredProvince.value = null;
};
</script>

<template>
  <div class="relative w-full overflow-hidden bg-white py-24 sm:py-32 border-y border-slate-100">
    <div class="max-w-7xl mx-auto px-4 relative z-10">
      <div class="text-center mb-16 space-y-4">
        <span class="inline-flex items-center gap-2 px-3 py-1 bg-bejo-500/10 border border-bejo-500/20 rounded-full text-bejo-600 text-xs font-black uppercase tracking-widest">
          <Icon icon="lucide:map" class="size-3" /> Peta Properti
        </span>
        <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          Properti <span class="text-bejo-500">Rumah Bejo</span> di Indonesia
        </h2>
        <p class="text-slate-500 font-medium max-w-2xl mx-auto">
          Lihat persebaran unit hunian kami di seluruh provinsi. Kami hadir untuk membantu Anda menemukan rumah impian di lokasi terbaik.
        </p>
      </div>

      <!-- Map Container (Relative wrapper with background and padding) -->
      <div class="relative w-full aspect-[5596/2024] bg-white rounded-[3rem] border border-slate-100 shadow-xl p-2 md:p-4 group/map select-none overflow-visible">
        
        <!-- Map Content Wrapper (Ensures pins and image stay aligned and unclipped) -->
        <div class="relative w-full h-full">
          <!-- The Image Map -->
          <img 
            src="/images/Peta%20Indonesia.png" 
            alt="Peta Indonesia" 
            class="w-full h-full object-contain opacity-90 transition-all duration-700 group-hover/map:scale-[1.01] pointer-events-none"
          />

          <!-- Interactive Layer (Pins & Tooltips - No Overflow Hidden) -->
          <div class="absolute inset-0 z-10">
            <div class="absolute inset-0 pointer-events-none">
              <div 
                v-for="province in groupedProperties" 
                :key="province.originalName"
                class="absolute pointer-events-auto"
                :style="{ 
                  left: `${province.x}%`, 
                  top: `${province.y}%`,
                  transform: 'translate(-50%, -50%)'
                }"
                @mouseenter="handleMouseEnter(province)"
                @mouseleave="handleMouseLeave"
              >
                <!-- Pulse Animation -->
                <div class="absolute inset-0 size-8 -m-3 bg-bejo-500/20 rounded-full animate-ping"></div>
                
                <!-- Pin Marker -->
                <div class="relative group cursor-pointer">
                  <div class="size-4 bg-white border-2 border-bejo-500 rounded-full shadow-lg transition-transform duration-300 group-hover:scale-125">
                    <div class="absolute inset-0.5 bg-bejo-500 rounded-full"></div>
                  </div>
                  
                  <!-- Label -->
                  <span class="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black text-slate-800 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    {{ province.originalName }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Single Decoupled Tooltip (Accessible outside wrapper) -->
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 translate-y-2 scale-95"
              enter-to-class="opacity-100 translate-y-0 scale-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0 scale-100"
              leave-to-class="opacity-0 translate-y-2 scale-95"
            >
              <div 
                v-if="hoveredProvince"
                class="absolute z-[100] pointer-events-none"
                :style="{ 
                  left: `${hoveredProvince.x}%`, 
                  top: `${hoveredProvince.y}%`,
                  transform: 'translate(-50%, calc(-100% - 20px))' 
                }"
              >
              <div class="w-64 bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[1.5rem] p-4 text-left">
              <div class="flex items-center gap-3 mb-3">
                <div class="size-10 rounded-2xl bg-bejo-50 flex items-center justify-center text-bejo-600">
                  <Icon icon="lucide:map-pin" class="size-6" />
                </div>
                <div>
                  <h4 class="text-xs font-black text-slate-900 leading-tight">{{ hoveredProvince.originalName }}</h4>
                  <p class="text-[10px] font-bold text-bejo-600">{{ hoveredProvince.count }} Unit Tersedia</p>
                </div>
              </div>
              <div class="space-y-1.5 border-t border-slate-50 pt-3">
                <p v-for="name in hoveredProvince.names" :key="name" class="text-[10px] text-slate-500 font-medium truncate flex items-center gap-2">
                  <span class="size-1 rounded-full bg-bejo-500/50"></span> {{ name }}
                </p>
                <p v-if="hoveredProvince.count > 5" class="text-[9px] text-slate-400 italic font-medium pl-3">
                  + {{ hoveredProvince.count - 5 }} unit lainnya
                </p>
              </div>
              <!-- Arrow bottom -->
              <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 border-b border-r border-slate-100 rotate-45"></div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>

      <!-- Info Footer -->
      <div class="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 px-8">
        <div class="flex items-center gap-4 text-slate-400 text-xs font-medium">
          <div class="flex items-center gap-2">
            <span class="size-3 rounded-full bg-bejo-500 border-2 border-white shadow-sm"></span> Area Listing
          </div>
          <div class="flex items-center gap-2">
            <span class="size-3 rounded-full bg-slate-200 border-2 border-white shadow-sm"></span> Area Pengembangan
          </div>
        </div>
        
        <div class="hidden lg:flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
          <Icon icon="lucide:info" class="size-3" /> Pin dikelompokkan berdasarkan provinsi untuk kemudahan visual
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-ping {
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2.5);
    opacity: 0;
  }
}
</style>
