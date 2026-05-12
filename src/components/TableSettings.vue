<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  show: Boolean,
  columns: {
    type: Array as () => any[],
    default: () => []
  }
})

const emit = defineEmits(['close', 'update'])

const localVisibility = ref<Record<string, boolean>>({})

watch(() => props.show, (newVal) => {
  if (newVal) {
    const visibility: Record<string, boolean> = {}
    props.columns.forEach(col => {
      const id = col.id || col.accessorKey
      if (id !== 'select' && id !== 'aksi') {
        visibility[id] = col.isVisible !== false
      }
    })
    localVisibility.value = visibility
  }
})

const toggleColumn = (key: string) => {
  localVisibility.value[key] = !localVisibility.value[key]
  emit('update', { ...localVisibility.value })
}
</script>

<template>
  <Transition 
    enter-active-class="transition duration-200 ease-out" 
    enter-from-class="transform scale-95 opacity-0 -translate-y-2" 
    enter-to-class="transform scale-100 opacity-100 translate-y-0" 
    leave-active-class="transition duration-150 ease-in" 
    leave-from-class="transform scale-100 opacity-100 translate-y-0" 
    leave-to-class="transform scale-95 opacity-0 -translate-y-2"
  >
    <div v-if="show" class="absolute right-0 top-full mt-3 w-64 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 rounded-[2rem] p-6 z-[150] animate-in fade-in zoom-in-95 duration-300">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h4 class="text-[11px] font-black text-slate-900 tracking-[0.1em] uppercase">Pengaturan Kolom</h4>
        <button @click="emit('close')" class="text-slate-300 hover:text-slate-900 transition-colors">
          <Icon icon="lucide:x" class="size-4" />
        </button>
      </div>

      <!-- Column List -->
      <div class="space-y-4">
        <div 
          v-for="(isVisible, key) in localVisibility" 
          :key="key"
          class="flex items-center justify-between group"
        >
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors">
            {{ key.replace('_', ' ') }}
          </span>
          
          <!-- Toggle Switch -->
          <button 
            @click="toggleColumn(key)"
            type="button"
            class="relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
            :class="isVisible ? 'bg-bejo-500' : 'bg-slate-200'"
          >
            <span 
              class="pointer-events-none inline-block size-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="isVisible ? 'translate-x-5' : 'translate-x-0'"
            ></span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

