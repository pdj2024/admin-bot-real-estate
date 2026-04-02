<script setup lang="ts">
import type { PropType } from 'vue'
import type { AppSettings } from '../index.vue'
const storedData = localStorage.getItem('app_local_settings')
if(storedData){
const config = JSON.parse(storedData)
console.log(config)
}

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

const emit = defineEmits(['save', 'reset'])
</script>

<template>
  <div class="space-y-6">
    <div class="card bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
      <div class="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <h6 class="text-sm font-semibold text-gray-700 uppercase tracking-wider">Identitas & Tema</h6>
      </div>
      <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Nama Aplikasi</label>
          <input v-model="settings.appName" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-opacity-50" :style="{ '--tw-ring-color': settings.colorPrimary }" placeholder="Masukkan nama aplikasi..." />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Mode Warna</label>
          <select v-model="settings.theme" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-opacity-50">
            <option value="light">Terang (Light)</option>
            <option value="dark">Gelap (Dark)</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
      <div class="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <h6 class="text-sm font-semibold text-gray-700 uppercase tracking-wider">Navigasi & Aksen Visual</h6>
      </div>
      <div class="p-6 space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">Tipe Sidebar</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <label v-for="size in ['default', 'hover', 'hover-active', 'sm', 'md', 'offcanvas']" :key="size" class="relative cursor-pointer">
              <input type="radio" v-model="settings.sidenavSize" :value="size" class="peer sr-only" />

              <div
                class="p-3 text-center rounded-lg text-sm font-medium transition-all"
                :class="settings.sidenavSize === size ? 'shadow-lg text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'"
                :style="
                  settings.sidenavSize === size
                    ? {
                        background: `linear-gradient(135deg, ${settings.colorPrimary} 0%, ${settings.colorSecondary} 100%)`,
                        backgroundColor: 'transparent'
                      }
                    : {}
                "
              >
                <span>{{ size.replace('-', ' ') }}</span>
              </div>
            </label>
          </div>
        </div>

        <hr class="border-gray-100" />

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Warna Primary</label>
            <div class="flex items-center gap-4">
              <div class="relative h-12 w-12 rounded-full shadow-inner border border-gray-200 overflow-hidden shrink-0" :style="{ backgroundColor: settings.colorPrimary }">
                <input v-model="settings.colorPrimary" type="color" class="absolute -top-2 -left-2 h-16 w-16 opacity-0 cursor-pointer" />
              </div>
              <div class="text-sm font-mono text-gray-600 bg-gray-50 px-3 py-1.5 border rounded-md uppercase">
                {{ settings.colorPrimary }}
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Warna Secondary</label>
            <div class="flex items-center gap-4">
              <div class="relative h-12 w-12 rounded-full shadow-inner border border-gray-200 overflow-hidden shrink-0" :style="{ backgroundColor: settings.colorSecondary }">
                <input v-model="settings.colorSecondary" type="color" class="absolute -top-2 -left-2 h-16 w-16 opacity-0 cursor-pointer" />
              </div>
              <div class="text-sm font-mono text-gray-600 bg-gray-50 px-3 py-1.5 border rounded-md uppercase">
                {{ settings.colorSecondary }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-4 pt-2">
      <button @click="emit('save')" class="bg-primary px-6 py-2.5 text-white font-medium rounded-lg">Simpan Pengaturan</button>
      <button @click="emit('reset')" class="px-5 py-2.5 text-gray-600 bg-white border border-gray-300 font-medium rounded-lg hover:bg-gray-50 transition-colors">Reset</button>
    </div>
  </div>
</template>

<style scoped>
input,
select {
  transition: all 0.2s ease-in-out;
}
</style>
