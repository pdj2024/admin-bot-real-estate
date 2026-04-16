<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, onMounted } from 'vue'

const displayName = ref('Admin Properti')

onMounted(() => {
  const storedName = localStorage.getItem('nama_display')
  if (storedName) {
    displayName.value = storedName
  }
})
</script>

<template>
  <div class="relative overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl shadow-slate-900/30 border border-white/5 group">
    <!-- Sophisticated Background Pattern -->
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 24px 24px;"></div>

    <!-- Interactive Parallax Gradients -->
    <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-bejo-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 transition-transform duration-1000 group-hover:translate-x-1/3 group-hover:-translate-y-1/3"></div>
    <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-600/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 transition-transform duration-1000 group-hover:-translate-x-1/3 group-hover:translate-y-1/3"></div>

    <div class="relative z-10 grid grid-cols-1 md:grid-cols-12 items-center">
      <div class="md:col-span-8 p-6 md:p-10">
        <div class="inline-flex items-center gap-2.5 px-3 py-1 bg-bejo-500/10 border border-bejo-500/20 rounded-full mb-6">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-bejo-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-bejo-500"></span>
          </span>
          <span class="text-[9px] font-black uppercase tracking-[0.2em] text-bejo-500">Dashboard Rumah Bejo</span>
        </div>

        <h1 class="text-2xl md:text-4xl font-black text-white leading-tight mb-4">
          Selamat Datang, <br>
          <span class="inline-flex items-center gap-3 mt-1">
            <span class="bg-gradient-to-r from-bejo-400 via-bejo-500 to-amber-500 bg-clip-text text-transparent italic underline-offset-4">
              {{ displayName }}!
            </span>
            <Icon icon="lucide:sparkles" class="size-6 text-amber-400 animate-pulse" />
          </span>
        </h1>
        
        <p class="text-slate-400 font-medium text-base mb-8 max-w-md leading-relaxed">
          Kelola listing, pantau interaksi, dan performa operasional hari ini.
        </p>

        <div class="flex flex-wrap gap-4">
          <RouterLink to="/properti/katalog" class="group/btn flex items-center gap-2.5 px-6 py-3.5 bg-bejo-500 hover:bg-bejo-600 text-white rounded-xl font-black text-xs transition-all shadow-xl shadow-bejo-500/30 hover:-translate-y-1">
            <Icon icon="lucide:layout-grid" class="size-4 transition-transform group-hover/btn:rotate-12" />
            Kelola Katalog
          </RouterLink>
          <RouterLink to="/chat" class="group/btn flex items-center gap-2.5 px-6 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-black text-xs backdrop-blur-md transition-all">
            <Icon icon="lucide:message-circle" class="size-4 transition-transform group-hover/btn:scale-110" />
            Cek Pesanan Chat
          </RouterLink>
        </div>
      </div>

      <div class="md:col-span-4 hidden md:flex justify-center items-center pr-12 relative group">
        <!-- Floating House Visual -->
        <div class="relative animate-float scale-75">
          <div class="absolute inset-0 bg-bejo-500 blur-[60px] opacity-10 scale-150"></div>
          <div class="relative z-10 p-8 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-xl transition-all duration-700 group-hover:rotate-3 group-hover:scale-105 shadow-2xl">
             <Icon icon="lucide:home" class="size-24 text-white/20" />
          </div>
          
          <div class="z-10 absolute -top-3 -right-3 size-12 bg-gradient-to-br from-bejo-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg animate-float-delayed">
             <Icon icon="lucide:key" class="size-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-20px) rotate(2deg); }
}

@keyframes float-delayed {
  0%, 100% { transform: translateY(0) translate(0); }
  50% { transform: translateY(15px) translateX(10px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 7s ease-in-out infinite;
}
</style>
