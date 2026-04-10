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
  <div class="relative overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl shadow-slate-900/20 border border-white/5 group">
    <!-- Decorative Gradients -->
    <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-bejo-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
    <div class="absolute bottom-0 left-0 w-[300px] h-[300px] bg-sky-600/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

    <div class="relative z-10 grid grid-cols-1 md:grid-cols-12 items-center">
      <div class="md:col-span-8 p-6 md:p-8">
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-bejo-500/10 border border-bejo-500/20 rounded-full mb-6">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-bejo-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-bejo-500"></span>
          </span>
          <span class="text-[10px] font-black uppercase tracking-widest text-bejo-500">Dashboard Real Estate</span>
        </div>

        <h1 class="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
          Selamat Datang, <br>
          <span class="bg-gradient-to-r from-bejo-400 to-bejo-600 bg-clip-text text-transparent italic">{{ displayName }}! 🏠</span>
        </h1>
        
        <p class="text-slate-400 font-medium text-base mb-10 max-w-md">
          Kelola listing, pantau interaksi pelanggan, dan jadwalkan kunjungan lokasi hari ini dengan lebih efisien.
        </p>

        <div class="flex flex-wrap gap-4">
          <RouterLink to="/properti/katalog" class="flex items-center gap-2 px-6 py-3.5 bg-bejo-500 hover:bg-bejo-600 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-bejo-500/30 hover:-translate-y-1">
            <Icon icon="lucide:blocks" class="size-5" />
            Kelola Katalog
          </RouterLink>
          <RouterLink to="/chat" class="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-sm backdrop-blur-md transition-all">
            <Icon icon="lucide:message-square" class="size-5" />
            Cek Pesanan Chat
          </RouterLink>
        </div>
      </div>

      <div class="md:col-span-4 hidden md:flex justify-center items-center pr-12 relative h-full group">
        <!-- Visual Element -->
        <div class="relative">
          <div class="absolute inset-0 bg-bejo-500 blur-3xl opacity-20 scale-125"></div>
          <Icon icon="lucide:home" class="size-48 text-white/10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6" />
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div class="size-16 rounded-2xl bg-white shadow-2xl flex items-center justify-center mb-2">
               <Icon icon="lucide:building-2" class="size-8 text-bejo-500" />
            </div>
            <div class="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
               <span class="text-[10px] font-black text-white uppercase tracking-tighter">Premium System</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
