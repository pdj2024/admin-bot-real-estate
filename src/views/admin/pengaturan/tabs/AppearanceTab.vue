<script setup lang="ts">
import type { PropType } from 'vue'
import type { AppSettings } from '../index.vue'
import SettingsForm from '../components/SettingsForm.vue'
import SettingsPreview from '../components/SettingsPreview.vue'
import { Icon } from '@iconify/vue'

defineProps({
  settings: {
    type: Object as PropType<AppSettings>,
    required: true
  }
})

const emit = defineEmits(['save', 'reset', 'update'])
</script>

<template>
  <div class="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
    <div class="xl:col-span-7">
      <SettingsForm 
        :settings="settings" 
        @save="(data: AppSettings) => emit('save', data)" 
        @reset="emit('reset')" 
        @update="(data: AppSettings) => emit('update', data)"
      />
    </div>
    
    <div class="xl:col-span-5 hidden xl:block sticky top-24">
      <div class="mb-6 pl-4 border-l-4 border-bejo-500">
        <div class="flex items-center gap-2 mb-1">
          <Icon icon="lucide:eye" class="size-4 text-bejo-500" />
          <h5 class="text-base font-black text-slate-800 uppercase tracking-widest">Live Preview</h5>
        </div>
        <p class="text-sm text-slate-400 font-bold uppercase tracking-wider">Pantau perubahan antarmuka secara real-time</p>
      </div>
      
      <SettingsPreview :settings="settings" />
    </div>
  </div>
</template>
