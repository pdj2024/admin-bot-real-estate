<template>
  <GuestLayout hideFooter main-class="p-0 overflow-hidden">
    <div class="relative min-h-screen flex items-center justify-center bg-slate-50 px-6 font-mono">
      <!-- Background Massive Typography -->
      <div class="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden opacity-5">
        <h1 class="text-[30vw] md:text-[40vw] font-black text-slate-900 leading-none tracking-tighter transform">
          500
        </h1>
      </div>

      <!-- Content -->
      <div class="relative z-10 text-center max-w-2xl">
        <div class="space-y-6 animate-in">
          <div class="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.3em]">
            <Icon icon="lucide:terminal" class="size-4 text-bejo-500" />
            Laporan Gangguan Sistem
          </div>
          
          <h2 class="text-5xl md:text-8xl font-black text-slate-950 tracking-tighter leading-none italic uppercase">
            SISTEM <br />
            <span class="text-bejo-600 underline decoration-slate-900/10 underline-offset-[10px]">BERMASALAH</span>
          </h2>
          
          <div class="bg-white border-l-8 border-bejo-600 p-8 text-left shadow-2xl relative overflow-hidden group">
             <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <Icon icon="lucide:cpu" class="size-20" />
             </div>
            <p class="text-slate-900 font-black mb-3 uppercase tracking-widest text-xs">Diagnostic Report:</p>
            <p class="text-slate-500 text-sm leading-relaxed font-bold">
              Terjadi gangguan teknis pada server saat memproses permintaan Anda. Tim teknis kami telah menerima notifikasi otomatis dan sedang melakukan pemulihan sistem.
            </p>
          </div>

          <div class="pt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              @click="reloadPage"
              class="group relative w-full sm:w-auto overflow-hidden bg-bejo-600 text-white px-10 py-5 font-black uppercase tracking-widest text-sm shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <span class="relative z-10 flex items-center justify-center gap-3">
                <Icon icon="lucide:refresh-cw" class="size-5 transition-transform group-hover:rotate-180 duration-700" />
                Muat Ulang Halaman
              </span>
            </button>

            <RouterLink 
              to="/kontak"
              class="w-full sm:w-auto px-10 py-5 bg-white border-2 border-slate-950 text-slate-950 font-black uppercase tracking-widest text-sm transition-all hover:bg-slate-50 shadow-[8px_8px_0px_0px_rgba(226,232,240,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              Laporkan Masalah
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

const reloadPage = () => {
  window.location.reload()
}
</script>

<style scoped>
.animate-in {
  animation: reveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes reveal {
  from {
    opacity: 0;
    filter: blur(10px);
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    filter: blur(0);
    transform: translateY(0);
  }
}
</style>
