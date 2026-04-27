<template>
  <GuestLayout>
    <div class="mb-10 print:hidden space-y-10">
      
      <!-- Breadcrumb -->

      <!-- Hero Banner -->
      <div class="relative overflow-hidden rounded-[3rem] bg-white mt-4 h-64 sm:h-80 shadow-xl shadow-bejo-600/5 flex items-center justify-center border border-bejo-100 mt-10">
        <!-- Dekorasi Background -->
        <div class="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-bejo-50 via-bejo-50/50 to-transparent"></div>
        <div class="absolute -right-20 -top-20 size-96 bg-gradient-to-br from-bejo-100 via-bejo-200 to-bejo-400 rounded-full blur-3xl opacity-40"></div>
        <div class="absolute right-10 -bottom-20 size-64 bg-gradient-to-tr from-bejo-300 via-bejo-500 to-bejo-700 rounded-full blur-3xl opacity-10"></div>
        
        <div class="relative z-10 text-center px-6 w-full max-w-4xl mx-auto">
          <span class="inline-flex items-center gap-2 px-4 py-2 bg-bejo-50 rounded-full text-bejo-600 font-bold tracking-widest text-xs uppercase shadow-sm border border-bejo-100 mx-auto mb-4">
            <Icon icon="lucide:message-square" class="size-4" /> Bantuan & Kemitraan
          </span>
          <h1 class="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tight mb-6">
            Temukan Kami <span class="text-transparent bg-clip-text bg-gradient-to-r from-bejo-500 via-bejo-700 to-bejo-900">Di Sini</span>
          </h1>
          <p class="text-slate-500 text-lg sm:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
            Tim Rumah Bejo selalu bersiaga membantu Anda mencari properti, menawarkan hunian, atau perihal kerja sama kemitraan.
          </p>
        </div>
      </div>

      <!-- Info Kontak Grid -->
      <div class="grid lg:grid-cols-3 gap-8 relative z-10 mt-8">
        
        <!-- Alamat -->
        <div class="bg-white rounded-[2.5rem] p-8 border border-bejo-100 shadow-xl shadow-bejo-600/5 hover:-translate-y-2 transition-transform duration-300 group">
          <div class="bg-bejo-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-bejo-100 group-hover:bg-bejo-500 group-hover:text-white transition-all">
            <Icon icon="lucide:map-pin" class="size-8 text-bejo-600 group-hover:text-white" />
          </div>
          <h3 class="text-xl font-black text-slate-900 mb-3">Kantor Utama</h3>
          <p class="text-sm font-medium text-slate-500 leading-relaxed mb-6">
            {{ settingsStore.business.address || 'Alamat Kantor Pusat Rumah Bejo' }}
          </p>
          <a :href="settingsStore.business.mapUrl" target="_blank" class="inline-flex items-center gap-2 text-sm font-bold text-bejo-600 hover:text-bejo-700 transition-colors">
            Lihat di Google Maps <Icon icon="lucide:arrow-right" class="size-4" />
          </a>
        </div>

        <!-- WhatsApp -->
        <div class="bg-white rounded-[2.5rem] p-8 border border-bejo-100 shadow-xl shadow-bejo-600/5 hover:-translate-y-2 transition-transform duration-300 group">
          <div class="bg-bejo-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-bejo-100 group-hover:bg-bejo-500 group-hover:text-white transition-all">
            <Icon icon="lucide:phone" class="size-8 text-bejo-600 group-hover:text-white" />
          </div>
          <h3 class="text-xl font-black text-slate-900 mb-3">Layanan Chat</h3>
          <p class="text-sm font-medium text-slate-500 leading-relaxed mb-6">
            Layanan cepat (Fast Response) {{ settingsStore.business.Hari_Buka || 'Senin—Jumat' }} ({{ settingsStore.business.Jam_Buka || '08:00 - 18:00 WIB' }}). Tersedia khusus Chat WhatsApp.
          </p>
          <a :href="'https://wa.me/' + (settingsStore.business.whatsapp || '62895353837000')" target="_blank" class="inline-flex items-center gap-2 text-sm font-bold text-bejo-600 hover:text-bejo-700 transition-colors">
            {{ settingsStore.business.phone || '+62 895-3538-37000' }} <Icon icon="lucide:arrow-right" class="size-4" />
          </a>
        </div>

        <!-- Surel -->
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
          <div class="bg-bejo-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-bejo-100">
            <Icon icon="lucide:mail" class="size-8 text-bejo-600" />
          </div>
          <h3 class="text-xl font-black text-slate-900 mb-3">Email</h3>
          <p class="text-sm font-medium text-slate-500 leading-relaxed mb-6">
            Kirimkan pertanyaan resmi, dokumen legalitas, atau penawaran kerja sama investasi ke kotak masuk kami.
          </p>
          <a :href="'mailto:' + (settingsStore.business.email || 'halo@rumahbejo.com')" class="inline-flex items-center gap-2 text-sm font-bold text-bejo-600 hover:text-bejo-700 transition-colors">
            {{ settingsStore.business.email || 'halo@rumahbejo.com' }} <Icon icon="lucide:arrow-right" class="size-4" />
          </a>
        </div>

      </div>

    </div>
  </GuestLayout>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import GuestLayout from '@/layouts/guest.vue'
import { useSettings } from '@/stores/settings'

const settingsStore = useSettings()
</script>

<style scoped>
@reference "@/assets/css/style.css";
</style>
