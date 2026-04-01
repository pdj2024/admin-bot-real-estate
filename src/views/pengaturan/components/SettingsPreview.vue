<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { AppSettings } from '../index.vue'

const props = defineProps({
  settings: {
    type: Object as PropType<AppSettings>,
    required: true
  }
})

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

    if (newVal === 'hidden' || newVal === 'offcanvas') {
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

  if (size === 'hidden') return isToggledOpen.value ? 'var(--spacing-sidenav-width)' : '0px'
  if (size === 'offcanvas') return isToggledOpen.value ? 'var(--spacing-sidenav-width)' : '0px'
  if (size === 'hover') return isHovered.value ? 'var(--spacing-sidenav-width)' : 'var(--spacing-sidenav-width-sm)'
  if (size === 'hover-active') return 'var(--spacing-sidenav-width)'
  if (size === 'sm' || size === 'compact') return `var(--spacing-sidenav-width-${size})`

  return isToggledOpen.value ? 'var(--spacing-sidenav-width)' : '0px'
})

// 4. Kelas Posisi Sidebar (Relative atau Absolute/Menumpuk)
const sidebarPositionClass = computed(() => {
  const size = effectiveSize.value
  if (size === 'hover' && isHovered.value) return 'absolute inset-y-0 left-0 z-40 shadow-[4px_0_24px_rgba(0,0,0,0.06)]'
  if (size === 'offcanvas' && isToggledOpen.value) return 'absolute inset-y-0 left-0 z-40 shadow-2xl'

  return 'relative z-20'
})

const showBackdrop = computed(() => {
  return effectiveSize.value === 'offcanvas' && isToggledOpen.value
})

const toggleBurger = () => {
  isToggledOpen.value = !isToggledOpen.value
}

const togglePin = () => {
  if (['hover', 'hover-active'].includes(props.settings.sidenavSize)) {
    isPinned.value = !isPinned.value
  }
}

const gradientStyle = computed(() => {
  return `linear-gradient(135deg, ${props.settings.colorPrimary} 0%, ${props.settings.colorSecondary} 100%)`
})
</script>

<template>
  <div class="sticky top-6">
    <h6 class="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Live Preview Tampilan</h6>

    <div class="border border-gray-200 rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors duration-300 flex flex-col h-[500px]" :class="settings.theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-[#f8f9fa]'">
      <div class="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200" :class="settings.theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''">
        <div class="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
        <div class="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
        <div class="w-3 h-3 rounded-full bg-[#27c93f]"></div>
      </div>

      <div class="flex flex-1 overflow-hidden relative">
        <transition enter-active-class="transition-opacity duration-300" leave-active-class="transition-opacity duration-300" enter-from-class="opacity-0" leave-to-class="opacity-0">
          <div v-if="showBackdrop" @click="toggleBurger" class="absolute inset-0 bg-slate-900/40 z-30 backdrop-blur-[2px] cursor-pointer"></div>
        </transition>

        <div v-show="sidebarPositionClass.includes('absolute')" class="shrink-0 transition-all duration-300 hidden md:block" :style="{ width: effectiveSize === 'hover' ? 'var(--spacing-sidenav-width-sm)' : '0px' }"></div>

        <div
          @mouseenter="isHovered = true"
          @mouseleave="isHovered = false"
          class="h-full border-r flex flex-col py-4 overflow-hidden transition-all duration-300 ease-in-out shrink-0"
          :class="[settings.theme === 'dark' ? 'border-gray-700' : 'border-gray-200', sidebarPositionClass]"
          :style="{
            width: sidebarWidth,
            backgroundColor: settings.theme === 'dark' ? '#1b1718' : '#ffffff'
          }"
        >
          <div class="px-4 mb-6 flex items-center justify-between whitespace-nowrap overflow-hidden">
            <div class="flex items-center gap-3">
              <div class="w-7 h-7 rounded shrink-0 shadow-sm" :style="{ background: gradientStyle }"></div>
              <span class="font-bold text-[15px] truncate transition-opacity duration-200" :class="[settings.theme === 'dark' ? 'text-white' : 'text-gray-800', sidebarWidth === 'var(--spacing-sidenav-width-sm)' || sidebarWidth === 'var(--spacing-sidenav-width-md)' ? 'opacity-0' : 'opacity-100']">
                {{ settings.appName || 'Nama Aplikasi' }}
              </span>
            </div>

            <button v-if="['hover', 'hover-active'].includes(props.settings.sidenavSize)" @click="togglePin" class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all" :class="isPinned ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400'" :style="isPinned ? { borderColor: settings.colorPrimary } : {}">
              <div class="w-2.5 h-2.5 rounded-full transition-colors" :style="isPinned ? { backgroundColor: settings.colorPrimary } : { backgroundColor: 'transparent', border: '2px solid #cbd5e1' }"></div>
            </button>
          </div>

          <div class="space-y-2 px-3">
            <div class="h-9 rounded-lg flex items-center px-3 gap-3" :style="{ backgroundColor: `${settings.colorPrimary}15`, color: settings.colorPrimary }">
              <div class="w-4 h-4 rounded-sm shrink-0 bg-current opacity-80"></div>
              <div class="h-2 w-20 rounded bg-current opacity-80 whitespace-nowrap" :class="sidebarWidth === 'var(--spacing-sidenav-width-sm)' ? 'opacity-0' : 'opacity-100'"></div>
            </div>
            <div class="h-9 rounded-lg flex items-center px-3 gap-3" :class="settings.theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'">
              <div class="w-4 h-4 rounded-sm shrink-0 bg-gray-300" :class="settings.theme === 'dark' ? 'bg-gray-600' : ''"></div>
              <div class="h-2 w-24 rounded bg-gray-300 transition-opacity" :class="[settings.theme === 'dark' ? 'bg-gray-600' : '', sidebarWidth === 'var(--spacing-sidenav-width-sm)' ? 'opacity-0' : 'opacity-100']"></div>
            </div>
          </div>
        </div>

        <div class="flex-1 flex flex-col min-w-0 bg-slate-50/50 relative z-10" :class="settings.theme === 'dark' ? 'bg-gray-900' : ''">
          <header class="h-14 border-b flex items-center px-4 justify-between shrink-0 transition-colors" :class="settings.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'" :style="{ backgroundColor: settings.theme === 'dark' ? '#1b1718' : '#ffffff' }">
            <button v-if="showBurger" @click="toggleBurger" class="p-1.5 rounded-md hover:bg-gray-100 transition-colors" :class="settings.theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>
            <div v-else class="w-8"></div>
            <div class="flex items-center gap-3">
              <div class="w-20 h-6 rounded bg-gray-100" :class="settings.theme === 'dark' ? 'bg-gray-700' : ''"></div>
              <div class="w-7 h-7 rounded-full bg-gray-100" :class="settings.theme === 'dark' ? 'bg-gray-600' : ''"></div>
            </div>
          </header>

          <div class="p-6 flex flex-col gap-5 overflow-y-auto">
            <div class="grid grid-cols-2 gap-4">
              <div class="h-24 rounded-xl border p-4 flex flex-col justify-between" :class="settings.theme === 'dark' ? 'border-gray-700' : 'border-gray-100 shadow-sm'" :style="{ backgroundColor: settings.theme === 'dark' ? '#1f2937' : '#ffffff' }">
                <div class="h-2 w-1/2 bg-gray-100 rounded" :class="settings.theme === 'dark' ? 'bg-gray-600' : ''"></div>
                <div class="h-5 w-3/4 rounded shadow-sm" :style="{ background: gradientStyle }"></div>
              </div>

              <div class="h-24 rounded-xl border p-4 flex flex-col justify-between" :class="settings.theme === 'dark' ? 'border-gray-700' : 'border-gray-100 shadow-sm'" :style="{ backgroundColor: settings.theme === 'dark' ? '#1f2937' : '#ffffff' }">
                <div class="h-2 w-1/2 bg-gray-100 rounded" :class="settings.theme === 'dark' ? 'bg-gray-600' : ''"></div>
                <div class="h-5 w-1/2 bg-gray-100 rounded" :class="settings.theme === 'dark' ? 'bg-gray-600' : ''"></div>
              </div>
            </div>

            <div class="flex-1 min-h-[120px] rounded-xl border p-5 flex flex-col gap-3" :class="settings.theme === 'dark' ? 'border-gray-700' : 'border-gray-100 shadow-sm'" :style="{ backgroundColor: settings.theme === 'dark' ? '#1f2937' : '#ffffff' }">
              <div class="h-3 w-1/4 bg-gray-100 rounded mb-3" :class="settings.theme === 'dark' ? 'bg-gray-600' : ''"></div>
              <div class="h-2 w-full bg-gray-100 rounded" :class="settings.theme === 'dark' ? 'bg-gray-700' : ''"></div>
              <div class="h-2 w-full bg-gray-100 rounded" :class="settings.theme === 'dark' ? 'bg-gray-700' : ''"></div>
              <div class="h-2 w-3/4 bg-gray-100 rounded" :class="settings.theme === 'dark' ? 'bg-gray-700' : ''"></div>

              <div class="mt-auto pt-4 flex justify-end">
                <div class="h-8 w-24 rounded shadow-sm" :style="{ background: gradientStyle }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
