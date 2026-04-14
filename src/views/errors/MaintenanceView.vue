<script setup lang="ts">
import { Icon } from '@iconify/vue'
import GuestLayout from '@/layouts/guest.vue'
import { useSettings } from '@/stores/settings'

const settingsStore = useSettings()

const handleWaContact = () => {
  const targetNumber = settingsStore.business.whatsapp || '62895353837000'
  const message = 'Halo Admin Rumah Bejo, saya melihat situs sedang dalam perbaikan. Saya ingin menanyakan perihal properti...'
  window.open(`https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`, '_blank')
}
</script>

<template>
  <GuestLayout hideHeader hideFooter main-class="!py-0">
    <div class="h-screen sm:h-[100dvh] flex items-center justify-center p-6 sm:p-12 overflow-hidden relative bg-white">
      <!-- Background Clutter -->
      <div class="absolute inset-0 z-0 opacity-[0.03] pointer-events-none select-none overflow-hidden">
         <div class="absolute top-0 right-0 text-[15rem] font-black leading-none translate-x-1/4 -translate-y-1/4 uppercase">Repair</div>
         <div class="absolute bottom-0 left-0 text-[10rem] font-black leading-none -translate-x-1/4 translate-y-1/4 uppercase">Maintenance</div>
      </div>

      <div class="relative z-10 w-full max-w-4xl">
        <div class="flex flex-col items-center text-center">
          <!-- Massive Warning Icon -->
          <div class="mb-8 relative">
             <div class="absolute inset-0 bg-bejo-500 blur-3xl opacity-20 animate-pulse"></div>
             <div class="size-20 sm:size-28 bg-slate-900 text-bejo-500 rounded-[2rem] flex items-center justify-center relative z-10 border border-slate-800 shadow-2xl rotate-3">
                <Icon icon="lucide:hammer" class="size-10 sm:size-14 animate-bounce" />
             </div>
          </div>

          <!-- Brutalist Typography -->
          <h1 class="text-5xl sm:text-7xl lg:text-[8rem] font-black text-slate-900 tracking-tighter leading-[0.8] mb-6 uppercase italic">
            DALAM <br /> 
            <span class="text-bejo-600">PERBAIKAN</span>
          </h1>
          
          <div class="h-2 w-full max-w-xs bg-slate-900 mb-6"></div>

          <p class="text-slate-500 font-bold text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            Mohon maaf atas ketidaknyamanannya. Saat ini sistem kami sedang dalam tahap peningkatan kualitas layanan. Kami akan segera kembali!
          </p>

          <!-- Interaction -->
          <div class="pt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              @click="handleWaContact"
              class="group relative px-8 py-4 bg-white text-slate-900 rounded-none font-black text-base uppercase tracking-widest hover:text-white transition-all flex items-center gap-4 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] active:translate-x-1 active:translate-y-1 active:shadow-none border-2 border-slate-900"
            >
              <div class="absolute inset-0 bg-slate-900 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span class="relative z-10 flex items-center gap-3">
                <Icon icon="logos:whatsapp-icon" class="size-6" />
                 Hubungi Kami via WhatsApp
              </span>
            </button>
            
            <div class="flex items-center gap-3 text-slate-400 font-black uppercase tracking-[0.2em] text-xs">
               <div class="size-2 bg-bejo-500 rounded-full animate-ping"></div>
               Status: Dikerjakan
            </div>
          </div>
        </div>
      </div>
    </div>
  </GuestLayout>
</template>

<style scoped>
@reference "@/assets/css/style.css";

h1 {
  text-shadow: 4px 4px 0px #F1F5F9;
}
</style>
