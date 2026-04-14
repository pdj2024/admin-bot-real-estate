<template>
  <GuestLayout hideFooter main-class="p-0 overflow-hidden">
    <div class="relative min-h-screen flex items-center justify-center bg-white px-6">
      <!-- Background Massive Typography (Brutalist Effect) -->
      <div class="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden">
        <h1 class="text-[30vw] md:text-[40vw] font-black text-slate-50 leading-none tracking-tighter transform -rotate-12 translate-y-10 scale-110">
          404
        </h1>
      </div>

      <!-- Content -->
      <div class="relative z-10 text-center max-w-2xl">
        <div class="space-y-6 animate-in">
          <span class="inline-block px-4 py-2 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.3em] transform -rotate-1">
            Status: Error
          </span>
          
          <h2 class="text-6xl md:text-8xl font-black text-slate-950 tracking-tighter leading-none italic uppercase">
            HALAMAN <br />
            <span class="text-bejo-600 underline decoration-slate-900/10 underline-offset-8">TIDAK DITEMUKAN</span>
          </h2>
          
          <p class="text-slate-500 font-bold text-lg max-w-md mx-auto leading-relaxed pt-4">
            Oops! Sepertinya rute yang Anda cari tidak tersedia. <br /> Mari kita kembali ke jalur yang benar.
          </p>

          <div class="pt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <RouterLink 
              to="/" 
              class="group relative w-full sm:w-auto overflow-hidden bg-slate-950 text-white px-10 py-5 font-black uppercase tracking-widest text-sm shadow-[8px_8px_0px_0px_rgba(234,148,85,1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <span class="relative z-10 flex items-center justify-center gap-3">
                <Icon icon="lucide:home" class="size-5" />
                Kembali ke Beranda
              </span>
            </RouterLink>

            <button 
              @click="$router.back()"
              class="w-full sm:w-auto px-10 py-5 bg-white border-2 border-slate-950 text-slate-950 font-black uppercase tracking-widest text-sm transition-all hover:bg-slate-50 shadow-[8px_8px_0px_0px_rgba(226,232,240,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              Kembali Sebelumnya
            </button>
          </div>
        </div>
      </div>

      <!-- Accent Decor -->
      <div class="absolute top-1/4 right-10 w-20 h-2 bg-bejo-500 transform rotate-45 hidden lg:block"></div>
      <div class="absolute bottom-1/4 left-10 w-32 h-1 bg-slate-200 hidden lg:block"></div>
    </div>
  </GuestLayout>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import GuestLayout from '@/layouts/guest.vue'
</script>

<style scoped>
.animate-in {
  animation: reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
