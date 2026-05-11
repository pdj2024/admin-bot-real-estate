<template>
  <GuestLayout hideFooter main-class="p-0 overflow-hidden">
    <div class="relative min-h-screen flex items-center justify-center bg-white px-6 overflow-hidden">
      <!-- Mesh Gradient Background (Identical to Hero) -->
      <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-[20%] -right-[10%] size-[800px] bg-bejo-100/50 rounded-full blur-[120px] animate-pulse"></div>
        <div class="absolute top-[10%] -left-[15%] size-[600px] bg-bejo-200/30 rounded-full blur-[100px]"></div>
        <div class="absolute bottom-[-10%] left-[20%] size-[700px] bg-bejo-50/60 rounded-full blur-[140px]"></div>
      </div>

      <!-- Massive Background Text -->
      <div class="absolute inset-0 flex items-center justify-center select-none pointer-events-none opacity-[0.03]">
        <h1 class="text-[40vw] font-black text-slate-900 leading-none tracking-tighter">404</h1>
      </div>

      <!-- Content -->
      <div class="relative z-10 text-center max-w-7xl mx-auto space-y-12">
        <div class="space-y-6">
          <h1 class="text-6xl md:text-8xl lg:text-[10rem] font-black text-slate-900 tracking-tighter leading-[0.85] drop-shadow-sm">
            Waduh, Kamu <br class="hidden sm:block" />
            <span class="relative inline-block py-2">
              <span class="relative z-10 text-transparent bg-clip-text bg-gradient-to-br from-bejo-400 via-bejo-600 to-bejo-700 animate-gradient-x italic">Tersesat?</span>
              <div class="absolute bottom-4 left-0 right-0 h-6 bg-bejo-100/40 -z-0 rounded-full blur-md"></div>
            </span>
          </h1>
          
          <p class="text-base md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed opacity-80">
            Tenang, <span class="text-slate-900 font-black border-b-2 border-bejo-200">Rumah Rejeki</span> akan membantumu kembali menemukan jalan menuju hunian impian yang tepat.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-6">
          <RouterLink 
            to="/" 
            class="w-full md:w-auto px-10 py-5 bg-bejo-600 hover:bg-bejo-700 text-white rounded-[1.8rem] font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-bejo-600/20 flex items-center justify-center gap-3"
          >
            <Icon icon="lucide:home" class="size-5" />
            Kembali ke Beranda
          </RouterLink>

          <button 
            @click="$router.back()"
            class="w-full md:w-auto px-10 py-5 bg-white border border-bejo-200 text-bejo-700 rounded-[1.8rem] font-black text-sm uppercase tracking-widest transition-all hover:bg-bejo-50 active:scale-95 flex items-center justify-center gap-3"
          >
            Halaman Sebelumnya
          </button>
        </div>
      </div>
    </div>
  </GuestLayout>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import GuestLayout from '@/layouts/guest.vue'
// import { useSettings } from '@/stores/settings'

// const settingsStore = useSettings()
</script>

<style scoped>
.animate-in {
  animation: reveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(60px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
