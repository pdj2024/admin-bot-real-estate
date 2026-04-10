<template>
  <GuestLayout>
    <div class="mb-10 print:hidden space-y-8">
      
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 mb-4 uppercase tracking-widest font-semibold">
        <RouterLink to="/" class="hover:text-bejo-600 transition-colors">Beranda</RouterLink>
        <Icon icon="lucide:chevron-right" class="size-3" />
        <span class="text-slate-800">Kontak Kami</span>
      </nav>

      <!-- Hero Banner -->
      <div class="relative overflow-hidden rounded-[2.5rem] bg-slate-900 mt-4 h-64 sm:h-80 shadow-2xl flex items-center justify-center border border-slate-800">
        <img src="https://images.unsplash.com/photo-1516387938699-a93567ec168e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" alt="Hubungi Kami" class="absolute inset-0 w-full h-full object-cover opacity-20 select-none pointer-events-none mix-blend-luminosity" draggable="false" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        
        <div class="relative z-10 text-center px-6 w-full max-w-4xl mx-auto">
          <span class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-bejo-400 font-bold tracking-widest text-xs uppercase shadow-2xl border border-white/5 mx-auto mb-4">
            <Icon icon="lucide:message-square-more" class="size-4" /> Bantuan & Kemitraan
          </span>
          <h1 class="text-4xl sm:text-5xl lg:text-7xl font-black text-white tracking-tight drop-shadow-2xl mb-4">
            Mari <span class="bg-gradient-to-r from-bejo-400 to-bejo-600 bg-clip-text text-transparent">Terkoneksi</span>
          </h1>
          <p class="text-slate-300 text-sm sm:text-base lg:text-lg font-medium max-w-2xl mx-auto drop-shadow leading-relaxed">
            Tim Rumah Bejo selalu bersiaga membantu Anda mencari properti, menawarkan hunian, atau perihal kerja sama kemitraan.
          </p>
        </div>
      </div>

      <!-- Info Kontak Grid -->
      <div class="grid lg:grid-cols-3 gap-8 relative z-10 -mt-6">
        
        <!-- Alamat -->
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
          <div class="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100">
            <Icon icon="lucide:map-pin" class="size-8 text-indigo-600" />
          </div>
          <h3 class="text-xl font-black text-slate-900 mb-3">Kantor Utama</h3>
          <p class="text-sm font-medium text-slate-500 leading-relaxed mb-6">
            Gedung Bejo Residence Tower 8, Jl. Asia Afrika No.123, SCBD, Jakarta Selatan 12190
          </p>
          <a href="#" class="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            Lihat di Google Maps <Icon icon="lucide:arrow-right" class="size-4" />
          </a>
        </div>

        <!-- WhatsApp -->
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
          <div class="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
            <Icon icon="lucide:phone" class="size-8 text-emerald-600" />
          </div>
          <h3 class="text-xl font-black text-slate-900 mb-3">Layanan Chat</h3>
          <p class="text-sm font-medium text-slate-500 leading-relaxed mb-6">
            Layanan cepat (Fast Response) Senin—Jumat (08:00 - 18:00 WIB). Tersedia khusus Chat WhatsApp.
          </p>
          <a href="https://wa.me/62895353837000" target="_blank" class="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
            +62 895-3538-37000 <Icon icon="lucide:arrow-right" class="size-4" />
          </a>
        </div>

        <!-- Surel -->
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
          <div class="bg-bejo-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-bejo-100">
            <Icon icon="lucide:mail" class="size-8 text-bejo-600" />
          </div>
          <h3 class="text-xl font-black text-slate-900 mb-3">Surat Elektronik</h3>
          <p class="text-sm font-medium text-slate-500 leading-relaxed mb-6">
            Kirimkan pertanyaan resmi, dokumen legalitas, atau penawaran kerja sama investasi ke kotak masuk kami.
          </p>
          <a href="mailto:halo@rumahbejo.com" class="inline-flex items-center gap-2 text-sm font-bold text-bejo-600 hover:text-bejo-700 transition-colors">
            halo@rumahbejo.com <Icon icon="lucide:arrow-right" class="size-4" />
          </a>
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
@reference "@/assets/css/style.css";
</style>
