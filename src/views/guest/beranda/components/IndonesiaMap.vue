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

const displayProvinces = computed(() => {
  const groups: Record<string, { count: number; x: number; y: number; names: string[]; originalName: string; isActive: boolean }> = {};
  
  // 1. Initialize all provinces from PROVINCE_COORDINATES as inactive
  Object.keys(PROVINCE_COORDINATES).forEach(key => {
    groups[key] = {
      count: 0,
      x: PROVINCE_COORDINATES[key].x,
      y: PROVINCE_COORDINATES[key].y,
      names: [],
      originalName: key,
      isActive: false
    };
  });

  // 2. Map properties to provinces
  props.properties.forEach(item => {
    const areaString = (item.Area && item.Area[0]) ? item.Area[0] : null;
    let provinceName = null;

    if (areaString) {
      const parts = areaString.split(',').map(p => p.trim());
      if (parts.length > 0) {
        provinceName = parts[parts.length - 1];
      }
    }
    
    if (provinceName) {
      const normalizedName = provinceName.toLowerCase();
      const provinceKeys = Object.keys(PROVINCE_COORDINATES).sort((a, b) => b.length - a.length);

      const foundKey = provinceKeys.find(key => {
        const lowerKey = key.toLowerCase();
        return normalizedName === lowerKey || normalizedName.includes(lowerKey);
      });

      if (foundKey) {
        if (!groups[foundKey]) {
           // Fallback if somehow key was missing from initial loop
           groups[foundKey] = { count: 0, x: PROVINCE_COORDINATES[foundKey].x, y: PROVINCE_COORDINATES[foundKey].y, names: [], originalName: foundKey, isActive: true };
        }
        groups[foundKey].count++;
        groups[foundKey].isActive = true;
        if (groups[foundKey].names.length < 5) {
          groups[foundKey].names.push(item.Nama_Produk);
        }
      }
    }
  });
  
  return Object.values(groups).filter(p => p.isActive);
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
  <div class="relative w-full overflow-hidden bg-white pt-30 pb-12  sm:pt-45 sm:pb-24 border-y border-slate-100">
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
      <div class="relative w-full bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-visible mb-12 group/map select-none">
        
        <!-- Map Content Wrapper -->
        <div class="relative w-full">
          <!-- The Image Map - Block display to lock container height -->
          <img 
            src="/images/Peta%20Indonesia.png" 
            alt="Peta Indonesia" 
            class="w-full h-auto block opacity-90 transition-all duration-700 group-hover/map:scale-[1.01] pointer-events-none"
          />

          <!-- Interactive Layer (Absolute Inset to Match Image Pixels Exactly) -->
          <div class="absolute inset-0 z-10 pointer-events-none">
            <div 
              v-for="province in displayProvinces" 
              :key="province.originalName"
              class="absolute pointer-events-auto group/pin transition-all duration-300"
              :class="[
                hoveredProvince?.originalName === province.originalName ? 'z-50 scale-110' : 'z-20',
                province.isActive ? 'opacity-100' : 'opacity-40 hover:opacity-100'
              ]"
              :style="{ 
                left: `${province.x}%`, 
                top: `${province.y}%`,
                transform: 'translate(-50%, -50%)'
              }"
              @mouseenter="handleMouseEnter(province)"
              @mouseleave="handleMouseLeave"
            >
              <!-- Invisible Larger Hitbox (Hit area optimization) -->
              <div class="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 size-10 bg-transparent cursor-pointer z-0"></div>
              
              <!-- Pulse Animation (Only for Active) -->
              <div v-if="province.isActive" class="absolute inset-0 size-8 -m-2 bg-bejo-500/20 rounded-full animate-ping pointer-events-none"></div>
              
              <!-- Pin Marker -->
              <div class="relative cursor-pointer z-10 flex items-center justify-center">
                <div 
                  class="size-3.5 rounded-full border-2 border-white shadow-lg transition-all duration-300 group-hover/pin:scale-125"
                  :class="province.isActive ? 'bg-bejo-500 group-hover/pin:bg-slate-900' : 'bg-slate-300 group-hover/pin:bg-slate-500'"
                >
                </div>
                
                <!-- Label (Visible on hover) -->
                <span class="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black uppercase tracking-widest text-white bg-slate-900/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-xl opacity-0 group-hover/pin:opacity-100 transition-all duration-300 translate-y-2 group-hover/pin:translate-y-0">
                  {{ province.originalName }}
                </span>
              </div>
            </div>

            <!-- Single Decoupled Tooltip (Sync position with hovered pin) -->
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 translate-y-4 scale-95"
              enter-to-class="opacity-100 translate-y-0 scale-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0 scale-100"
              leave-to-class="opacity-0 translate-y-4 scale-95"
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
                <div class="size-10 rounded-2xl flex items-center justify-center" :class="hoveredProvince.isActive ? 'bg-bejo-50 text-bejo-600' : 'bg-slate-50 text-slate-400'">
                  <Icon icon="lucide:map-pin" class="size-6" />
                </div>
                <div>
                  <h4 class="text-xs font-black text-slate-900 leading-tight">{{ hoveredProvince.originalName }}</h4>
                  <p class="text-[10px] font-bold" :class="hoveredProvince.isActive ? 'text-bejo-600' : 'text-slate-400'">
                    {{ hoveredProvince.isActive ? `${hoveredProvince.count} Unit Tersedia` : 'Area Pengembangan' }}
                  </p>
                </div>
              </div>
              <div v-if="hoveredProvince.isActive" class="space-y-1.5 border-t border-slate-50 pt-3">
                <p v-for="name in hoveredProvince.names" :key="name" class="text-[10px] text-slate-500 font-medium truncate flex items-center gap-2">
                  <span class="size-1 rounded-full bg-bejo-500/50"></span> {{ name }}
                </p>
                <p v-if="hoveredProvince.count > 5" class="text-[9px] text-slate-400 italic font-medium pl-3">
                  + {{ hoveredProvince.count - 5 }} unit lainnya
                </p>
              </div>
              <div v-else class="border-t border-slate-50 pt-3 text-[10px] text-slate-400 italic font-medium">
                Belum ada properti aktif di provinsi ini.
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
            <span class="size-3 rounded-full bg-bejo-500 border-2 border-white shadow-sm"></span> Area Unit Properti
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
