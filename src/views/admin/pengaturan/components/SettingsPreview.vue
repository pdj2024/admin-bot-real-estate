<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { AppSettings } from '../index.vue'
import { useSettings } from '@/stores/settings'

const props = defineProps({
  settings: {
    type: Object as PropType<AppSettings>,
    required: true
  }
})

const settingsStore = useSettings()

const isHovered = ref(false)
const isToggledOpen = ref(true)
const isPinned = ref(false)

watch(
  () => props.settings.sidenavSize,
  (newVal) => {
    if (newVal === 'hover-active') {
      isPinned.value = true
    } else if (newVal === 'hover') {
      isPinned.value = false
    } else {
      isPinned.value = false
    }

    if (newVal === 'offcanvas') {
      isToggledOpen.value = false
    } else {
      isToggledOpen.value = true
    }
  },
  { immediate: true }
)

const effectiveSize = computed(() => {
  if (['hover', 'hover-active'].includes(props.settings.sidenavSize)) {
    return isPinned.value ? 'hover-active' : 'hover'
  }
  return props.settings.sidenavSize
})

const showBurger = computed(() => {
  return !['hover', 'hover-active'].includes(effectiveSize.value)
})

const sidebarWidth = computed(() => {
  const size = effectiveSize.value

  if (size === 'hidden') return isToggledOpen.value ? '60px' : '0px'
  if (size === 'offcanvas') return isToggledOpen.value ? '60px' : '0px'
  if (size === 'hover') return isHovered.value ? '60px' : '20px'
  if (size === 'hover-active') return '60px'
  if (size === 'sm') return `30px`

  return isToggledOpen.value ? '60px' : '0px'
})

// 4. Kelas Posisi Sidebar (Relative atau Absolute/Menumpuk)
const sidebarPositionClass = computed(() => {
  const size = effectiveSize.value
  if (size === 'hover' && isHovered.value) return 'absolute inset-y-0 left-0 z-40 shadow-2xl'
  if (size === 'offcanvas' && isToggledOpen.value) return 'absolute inset-y-0 left-0 z-40 shadow-2xl'

  return 'relative z-20'
})

const showBackdrop = computed(() => {
  return effectiveSize.value === 'offcanvas' && isToggledOpen.value
})

const toggleBurger = () => {
  isToggledOpen.value = !isToggledOpen.value
}

const gradientStyle = computed(() => {
  return `linear-gradient(135deg, ${props.settings.colorPrimary} 0%, ${props.settings.colorSecondary} 100%)`
})
</script>

<template>
  <div>
    <div class="border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 transition-all duration-500 flex flex-col h-[520px] bg-slate-50">
      <!-- Browser Header -->
      <div class="bg-white px-5 py-4 flex items-center gap-2 border-b border-slate-50">
        <div class="flex gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full bg-red-400"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
        </div>
        <div class="mx-auto bg-slate-50 rounded-lg px-4 py-1 text-[8px] font-black text-slate-300 uppercase tracking-widest border border-slate-100/50 flex items-center gap-2">
          <Icon icon="lucide:lock" class="size-2 text-slate-300" />
          {{ settingsStore.business.appName || 'Admin Panel' }}
        </div>
      </div>

      <div class="flex flex-1 overflow-hidden relative">
        <!-- Sidebar Backdrop -->
        <transition enter-active-class="transition-opacity duration-300" leave-active-class="transition-opacity duration-300" enter-from-class="opacity-0" leave-to-class="opacity-0">
          <div v-if="showBackdrop" @click="toggleBurger" class="absolute inset-0 bg-slate-900/60 z-30 backdrop-blur-[2px] cursor-pointer"></div>
        </transition>

        <!-- Sidebar Simulator -->
        <div
          @mouseenter="isHovered = true"
          @mouseleave="isHovered = false"
          class="h-full border-r flex flex-col py-6 overflow-hidden transition-all duration-300 ease-in-out shrink-0 border-slate-100"
          :class="[sidebarPositionClass]"
          :style="{
            width: sidebarWidth,
            backgroundColor: '#ffffff'
          }"
        >
          <div class="px-4 mb-8 flex items-center justify-between whitespace-nowrap overflow-hidden">
            <div class="flex items-center gap-3">
              <div class="size-7 rounded-xl shrink-0 shadow-lg" :style="{ background: gradientStyle }"></div>
              <span class="font-black text-[12px] truncate transition-opacity duration-200 text-slate-800 uppercase tracking-widest" :class="sidebarWidth === '20px' ? 'opacity-0' : 'opacity-100'">
                Bejo
              </span>
            </div>
          </div>

          <div class="space-y-3 px-3">
            <div class="h-10 rounded-2xl flex items-center px-4 gap-3 shadow-md shadow-bejo-500/10" :style="{ backgroundColor: `${settings.colorPrimary}15`, color: settings.colorPrimary }">
              <div class="w-4 h-4 rounded-lg shrink-0 bg-current opacity-80"></div>
              <div class="h-1.5 w-20 rounded bg-current opacity-40" v-if="sidebarWidth !== '20px'"></div>
            </div>
            <div v-for="i in 3" :key="i" class="h-10 rounded-2xl flex items-center px-4 gap-3 hover:bg-slate-50 transition-colors">
              <div class="w-4 h-4 rounded-lg shrink-0 bg-slate-200"></div>
              <div class="h-1 w-24 rounded bg-slate-100" v-if="sidebarWidth !== '20px'"></div>
            </div>
          </div>
        </div>

        <!-- Content Simulator -->
        <div class="flex-1 flex flex-col min-w-0 bg-slate-50 relative z-10">
          <header class="h-16 border-b flex items-center px-6 justify-between shrink-0 bg-white border-slate-50 shadow-sm shadow-slate-200/20">
            <div class="flex items-center gap-4">
               <div v-if="showBurger" class="size-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                <Icon icon="lucide:menu" class="size-4" />
               </div>
               <div class="h-2 w-32 bg-slate-50 rounded-full border border-slate-100"></div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-12 h-4 rounded bg-slate-50 border border-slate-100"></div>
              <div class="w-8 h-8 rounded-2xl bg-slate-100 shadow-inner"></div>
            </div>
          </header>

          <div class="p-8 flex flex-col gap-6 overflow-y-auto">
            <div class="grid grid-cols-2 gap-4">
              <div class="h-28 rounded-[1.5rem] border p-6 flex flex-col justify-between border-slate-100 shadow-sm bg-white hover:-translate-y-1 transition-transform">
                <div class="h-1.5 w-1/2 bg-slate-50 rounded-full"></div>
                <div class="h-6 w-3/4 rounded-xl shadow-lg shadow-bejo-500/10" :style="{ background: gradientStyle }"></div>
              </div>

              <div class="h-28 rounded-[1.5rem] border p-6 flex flex-col justify-between border-slate-100 shadow-sm bg-white opacity-60">
                <div class="h-1.5 w-1/2 bg-slate-50 rounded-full"></div>
                <div class="h-6 w-1/2 bg-slate-50 rounded-xl"></div>
              </div>
            </div>

            <div class="flex-1 min-h-[140px] rounded-[1.5rem] border p-8 flex flex-col gap-4 border-slate-100 shadow-sm bg-white relative">
              <div class="h-3 w-1/4 bg-slate-50 rounded-full mb-2"></div>
              <div v-for="i in 3" :key="i" class="h-1.5 w-full bg-slate-50/50 rounded-full" :style="{ width: i === 3 ? '70%' : '100%' }"></div>

              <div class="mt-auto pt-6 flex justify-end">
                <div class="h-10 w-28 rounded-2xl shadow-xl shadow-bejo-500/10" :style="{ background: gradientStyle }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";
</style>
