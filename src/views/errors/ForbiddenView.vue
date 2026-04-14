<template>
  <GuestLayout hideFooter main-class="p-0 overflow-hidden">
    <div class="relative min-h-screen flex items-center justify-center bg-slate-950 px-6">
      <!-- Background Massive Typography -->
      <div class="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden opacity-10">
        <h1 class="text-[30vw] md:text-[40vw] font-black text-white leading-none tracking-tighter transform rotate-12">
          403
        </h1>
      </div>

      <!-- Content -->
      <div class="relative z-10 text-center max-w-2xl">
        <div class="space-y-6 animate-in">
          <div class="inline-flex items-center gap-2 px-6 py-2 bg-red-600 text-white font-black text-xs uppercase tracking-[0.3em] transform -rotate-1">
            <Icon icon="lucide:shield-alert" class="size-4" />
            Akses Terbatas
          </div>
          
          <h2 class="text-6xl md:text-[10rem] font-black text-white tracking-tighter leading-none italic uppercase">
            AKSES <br />
            <span class="text-red-500 underline decoration-white/10 underline-offset-[12px]">DITOLAK</span>
          </h2>
          
          <p class="text-slate-400 font-bold text-lg max-w-md mx-auto leading-relaxed pt-8">
            Maaf, Anda tidak memiliki otoritas untuk mengakses area ini. Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.
          </p>

          <div class="pt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <RouterLink 
              to="/" 
              class="group relative w-full sm:w-auto overflow-hidden bg-white text-slate-950 px-10 py-5 font-black uppercase tracking-widest text-sm shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <span class="relative z-10 flex items-center justify-center gap-3">
                <Icon icon="lucide:home" class="size-5" />
                Kembali ke Beranda
              </span>
            </RouterLink>

            <RouterLink 
              to="/login"
              class="w-full sm:w-auto px-10 py-5 bg-transparent border-2 border-slate-700 text-white font-black uppercase tracking-widest text-sm transition-all hover:border-white hover:bg-white/5 active:translate-x-1 active:translate-y-1"
            >
              Masuk Akun
            </RouterLink>
          </div>
        </div>
      </div>
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
    transform: scale(0.9) translateY(40px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
