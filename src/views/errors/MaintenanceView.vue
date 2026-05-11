<script setup lang="ts">
import { Icon } from '@iconify/vue'
import GuestLayout from '@/layouts/guest.vue'
import { useSettings } from '@/stores/settings'

const settingsStore = useSettings()

const handleWaContact = () => {
  const targetNumber = settingsStore.business.whatsapp || '6287700083370'
  const message = 'Halo Admin Rumah Bejo, saya melihat situs sedang dalam perbaikan. Saya ingin menanyakan perihal properti...'
  window.open(`https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`, '_blank')
}
</script>

<template>
  <GuestLayout hideHeader hideFooter main-class="!py-0">
    <div class="h-screen sm:h-[100dvh] flex items-center justify-center p-6 sm:p-12 overflow-hidden relative bg-white">
      <!-- Mesh Gradient Background (Identical to Hero) -->
      <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-[20%] -right-[10%] size-[800px] bg-bejo-100/50 rounded-full blur-[120px] animate-pulse"></div>
        <div class="absolute top-[10%] -left-[15%] size-[600px] bg-bejo-200/30 rounded-full blur-[100px]"></div>
        <div class="absolute bottom-[-10%] left-[20%] size-[700px] bg-bejo-50/60 rounded-full blur-[140px]"></div>
      </div>

      <!-- Massive Background Text -->
      <div class="absolute inset-0 flex items-center justify-center select-none pointer-events-none opacity-[0.03]">
         <div class="text-[20vw] font-black text-slate-900 leading-none uppercase tracking-tighter">REPAIR</div>
      </div>

      <div class="relative z-10 w-full max-w-7xl mx-auto">
        <div class="flex flex-col items-center text-center space-y-12">
          <!-- Title Section -->
          <div class="space-y-6">
            <h1 class="text-6xl md:text-8xl lg:text-[10rem] font-black text-slate-900 tracking-tighter leading-[0.85] drop-shadow-sm uppercase italic">
              SEDANG <br class="hidden sm:block" /> 
              <span class="relative inline-block py-2">
                <span class="relative z-10 text-transparent bg-clip-text bg-gradient-to-br from-bejo-400 via-bejo-600 to-bejo-700 animate-gradient-x">BERBENAH</span>
                <div class="absolute bottom-4 left-0 right-0 h-6 bg-bejo-100/40 -z-0 rounded-full blur-md"></div>
              </span>
            </h1>
          </div>
          
          <p class="text-base md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed opacity-80">
            Kami sedang berbenah untuk meningkatkan kualitas layanan dan memberikan kepuasan yang lebih tinggi bagi Anda. <br /> 
            <span class="text-slate-900 font-black border-b-2 border-bejo-200">Mohon tunggu sebentar ya!</span>
          </p>

          <!-- Interaction -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <button 
              @click="handleWaContact"
              class="w-full md:w-auto px-10 py-5 bg-bejo-600 hover:bg-bejo-700 text-white rounded-[1.8rem] font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-bejo-600/20 flex items-center justify-center gap-3"
            >
              <Icon icon="logos:whatsapp-icon" class="size-5" />
              Tanya Admin via WhatsApp
            </button>
            
            <RouterLink to="/" class="text-slate-400 hover:text-bejo-600 font-black uppercase tracking-[0.2em] text-[10px] transition-colors bg-white px-8 py-5 border border-bejo-100 rounded-[1.8rem] hover:bg-bejo-50">
               Kembali Nanti
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </GuestLayout>
</template>

<style scoped>
@reference "@/assets/css/style.css";
</style>
