<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { AppSettings } from '../index.vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  settings: {
    type: Object as PropType<AppSettings>,
    required: true
  },
  isSaved: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'reset', 'update'])

const form = ref<any>({ ...props.settings })

watch(() => props.settings, (newVal) => {
  form.value = { ...newVal }
}, { deep: true })

const handleSave = () => {
  emit('save', form.value)
}

watch(form, (newVal) => {
  emit('update', newVal)
}, { deep: true })
</script>

<template>
  <div class="space-y-6">
    <div class="card bg-white shadow-sm rounded-[2rem] border border-slate-100 overflow-hidden">
      <div class="px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="size-8 rounded-lg bg-bejo-500 flex items-center justify-center text-white shadow-lg shadow-bejo-500/20">
              <Icon icon="lucide:monitor-smartphone" class="size-4" />
            </div>
            <h4 class="text-sm font-black text-slate-800 uppercase tracking-widest">Pengaturan Tampilan</h4>
          </div>
        </div>
      
      <div class="p-8 space-y-8">
        <div>
          <label class="label mb-4">
            <Icon icon="lucide:sidebar" class="size-4 text-bejo-500" />
            Tipe Sidebar
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <label v-for="size in ['default', 'hover', 'offcanvas']" :key="size" class="relative cursor-pointer group">
              <input type="radio" v-model="form.sidenavSize" :value="size" class="peer sr-only" />

              <div
                class="p-3 text-center rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2"
                :class="form.sidenavSize === size 
                  ? 'border-bejo-500 text-white shadow-xl shadow-bejo-500/20' 
                  : 'border-slate-100 text-slate-400 bg-slate-50 hover:border-bejo-500/50 group-hover:bg-white'"
                :style="
                  form.sidenavSize === size
                    ? {
                        background: `linear-gradient(135deg, ${form.colorPrimary} 0%, ${form.colorSecondary} 100%)`,
                        borderColor: 'transparent'
                      }
                    : {}
                "
              >
                <span>{{ size.replace('-', ' ') }}</span>
              </div>
              <div v-if="form.sidenavSize === size" class="absolute -top-1.5 -right-1.5 size-5 bg-white rounded-full flex items-center justify-center shadow-md border border-bejo-500 z-10">
                <Icon icon="lucide:check" class="size-3 text-bejo-500" />
              </div>
            </label>
          </div>
        </div>

        <div class="pt-8 border-t border-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <label class="label mb-4">
              <Icon icon="lucide:palette" class="size-4 text-bejo-500" />
              Warna Primary
            </label>
            <div class="flex items-center gap-4">
              <div class="relative h-12 w-12 rounded-xl shadow-md border-2 border-white ring-1 ring-slate-100 overflow-hidden shrink-0" :style="{ backgroundColor: form.colorPrimary }">
                <input v-model="form.colorPrimary" type="color" class="absolute -top-2 -left-2 h-20 w-20 opacity-0 cursor-pointer" />
              </div>
              <div class="flex-1">
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Hex Code</div>
                <input v-model="form.colorPrimary" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 uppercase font-mono focus:ring-4 focus:ring-green-500/5 focus:border-green-500 outline-none transition-all" />
              </div>
            </div>
          </div>

          <div>
            <label class="label mb-4">
              <Icon icon="lucide:swatch-book" class="size-4 text-bejo-500" />
              Warna Secondary
            </label>
            <div class="flex items-center gap-4">
              <div class="relative h-12 w-12 rounded-xl shadow-md border-2 border-white ring-1 ring-slate-100 overflow-hidden shrink-0" :style="{ backgroundColor: form.colorSecondary }">
                <input v-model="form.colorSecondary" type="color" class="absolute -top-2 -left-2 h-20 w-20 opacity-0 cursor-pointer" />
              </div>
              <div class="flex-1">
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Hex Code</div>
                <input v-model="form.colorSecondary" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 uppercase font-mono focus:ring-4 focus:ring-green-500/5 focus:border-green-500 outline-none transition-all" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3 pt-4">
      <button 
        @click="handleSave" 
        class="bg-green-500 hover:bg-green-600 px-6 py-3 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-green-500/20 active:scale-95 transition-all flex items-center gap-2"
      >
        <Icon icon="lucide:save" class="size-4" />
        Simpan Pengaturan
      </button>
      <button 
        @click="emit('reset')" 
        class="px-5 py-3 text-slate-500 hover:text-slate-800 text-xs font-black uppercase tracking-widest transition-colors"
      >
        Reset Default
      </button>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.label {
  @apply flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest;
}

input {
  transition: all 0.2s ease-in-out;
}
</style>

<style scoped>
input,
select {
  transition: all 0.2s ease-in-out;
}
</style>
