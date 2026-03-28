<script setup lang="ts">
import { Icon } from '@iconify/vue'
import dashboard from '@/assets/images/dashboard.png'
</script>

<template>
  <div class="card-body relative overflow-hidden bg-zinc-900 rounded-xl mb-5 shadow-lg border border-white/5">
    <div class="relative z-10 grid grid-cols-12 items-center p-4">
      <div class="lg:col-span-8 col-span-12">
        <h5 class="mb-3 text-2xl font-bold text-white">Selamat Datang, Admin Properti! 🏠</h5>
        <p class="mb-6 text-white/70 text-base max-w-md leading-relaxed">
          Kelola listing, pantau interaksi pelanggan, dan jadwalkan janji temu hari ini dengan lebih mudah.
        </p>
        <div class="flex gap-3">
           <RouterLink to="/katalog" class="btn bg-primary-gradient text-white border-0 shadow-lg shadow-primary/20">
            <Icon icon="lucide:layout-grid" class="me-2 size-4" /> Kelola Katalog
          </RouterLink>
          <RouterLink to="/chat" class="btn bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border-0">
            <Icon icon="lucide:message-square" class="me-2 size-4" /> Chat Pelanggan
          </RouterLink>
        </div>
      </div>
      <div class="col-span-4 ms-auto lg:block hidden animate-bounce-slow">
        <img :src="dashboard" alt="Property Dashboard" class="h-44 object-contain" />
      </div>
    </div>
    </div>
</template>

<style scoped>
.bg-primary-gradient {
  background: linear-gradient(135deg, #f28e4a 0%, #df7730 45%, #89491e 100%);
}
.animate-bounce-slow {
  animation: bounce 3s infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>


