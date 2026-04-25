<script setup lang="ts">
import type { PropType } from 'vue'
import type { AppSettings } from '../index.vue'
import SettingsForm from '../components/SettingsForm.vue'
import SettingsPreview from '../components/SettingsPreview.vue'

defineProps({
  settings: {
    type: Object as PropType<AppSettings>,
    required: true
  }
})

const emit = defineEmits(['save', 'reset', 'update'])
</script>

<template>
  <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
    <div class="xl:col-span-7">
      <SettingsForm 
        :settings="settings" 
        @save="(data: AppSettings) => emit('save', data)" 
        @reset="emit('reset')" 
        @update="(data: AppSettings) => emit('update', data)"
      />
    </div>
    <div class="xl:col-span-5 hidden xl:block sticky top-24">
      <div class="mb-4">
        <h5 class="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">Live Preview</h5>
        <p class="text-[10px] text-slate-500 font-medium">Lihat bagaimana perubahan Anda memengaruhi antarmuka Admin secara langsung.</p>
      </div>
      <SettingsPreview :settings="settings" />
    </div>
  </div>
</template>
