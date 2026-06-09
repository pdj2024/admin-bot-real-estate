<template>
  <div class="relative min-h-screen w-full flex justify-center items-center py-10 px-4 overflow-hidden bg-slate-900">
    <!-- Background Property Image -->
    <div class="absolute inset-0 z-0">
      <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" alt="Background Property" class="w-full h-full object-cover opacity-50 select-none pointer-events-none" />
      <div class="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/70 to-bejo-950/50"></div>
    </div>

    <!-- Auth Card Container -->
    <div class="relative z-10 w-full max-w-[480px] animate-in fade-in zoom-in duration-700">
      <div class="bg-white/95 backdrop-blur-xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
        <div class="px-8 py-12 md:px-12 md:py-16 text-center">
          <RouterLink to="/" class="inline-flex items-center gap-3 mb-8 group">
            <img :src="settingsStore.business.Logo_Company || settingsStore.business.Logo || logo" alt="Logo" class="h-10 group-hover:scale-110 transition-transform" />
            <span class="text-2xl font-black text-slate-900 tracking-tighter">{{ settingsStore.business.appName || 'Rumah Bejo' }}</span>
          </RouterLink>
          
          <slot />

          <!-- Footer & Back Button -->
          <div class="mt-12 space-y-6">
            <RouterLink to="/" class="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-bejo-600 transition-colors">
              <Icon icon="lucide:arrow-left" class="size-4" />
              Kembali ke Beranda
            </RouterLink>
            
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pt-6 border-t border-slate-50">
              © {{ new Date().getFullYear() }} {{ settingsStore.business.appName || 'Rumah Bejo' }}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { RouterLink } from 'vue-router'
import logo from '@/assets/images/logo-sm.png'
import { useSettings } from '@/stores/settings'

const settingsStore = useSettings()

onMounted(() => {
  settingsStore.init()
})
</script>
