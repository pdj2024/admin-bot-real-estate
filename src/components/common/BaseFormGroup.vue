<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps<{
  label?: string
  icon?: string
  required?: boolean
  error?: string
  innerClass?: string
  alignIcon?: 'center' | 'top'
}>()
</script>

<template>
  <div class="field space-y-1.5">
    <label v-if="label" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 shrink-0">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <div :class="['relative group', innerClass]">
      <Icon v-if="icon" :icon="icon" 
            :class="[
              'absolute left-3 text-slate-400 size-4 pointer-events-none group-focus-within:text-primary transition-colors z-10 transform',
              alignIcon === 'top' ? 'top-4' : 'top-1/2 -translate-y-1/2'
            ]" />
      
      <slot>
        <!-- Default input fallback if needed -->
      </slot>
      
      <div v-if="error" class="text-[10px] font-bold text-red-500 mt-1 ml-1 animate-fadeIn shrink-0">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

/* Shared input styles for injection if needed */
:deep(.field-input) {
  @apply w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium;
}

:deep(.field-input-icon) {
  @apply pl-10;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
</style>
