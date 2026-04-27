<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { managementInsights } from './data'

const displayName = ref('Admin Properti')
const randomInsight = ref('')

onMounted(() => {
  const storedName = localStorage.getItem('nama_display')
  if (storedName) {
    displayName.value = storedName
  }
  
  const randomIndex = Math.floor(Math.random() * managementInsights.length)
  randomInsight.value = managementInsights[randomIndex]
})
</script>

<template>
  <div class="relative overflow-hidden rounded-[2.5rem] bg-white shadow-xl shadow-slate-200/50 border border-slate-100 group">
    <!-- Sophisticated Background Pattern -->
    <div class="absolute inset-0 opacity-[0.05] pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>

    <!-- Interactive Parallax Gradients -->
    <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-bejo-100/40 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 transition-transform duration-1000 group-hover:translate-x-1/3 group-hover:-translate-y-1/3"></div>
    <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-bejo-50/30 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 transition-transform duration-1000 group-hover:-translate-x-1/3 group-hover:translate-y-1/3"></div>

    <div class="relative z-10 grid grid-cols-1 md:grid-cols-12 items-center">
      <div class="md:col-span-8 p-6 md:p-10">
        <div class="inline-flex items-center gap-2.5 px-3 py-1 bg-bejo-50 border border-bejo-100 rounded-full mb-6">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-bejo-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-bejo-500"></span>
          </span>
          <span class="text-[9px] font-black uppercase tracking-[0.2em] text-bejo-600">Dashboard Rumah Bejo</span>
        </div>

        <h1 class="text-2xl md:text-4xl font-black text-slate-900 leading-tight mb-4">
          Selamat Datang, <br>
          <span class="inline-flex items-center gap-3 mt-1">
            <span class="bg-gradient-to-r from-bejo-500 via-bejo-700 to-bejo-900 bg-clip-text text-transparent italic underline-offset-4">
              {{ displayName }}!
            </span>
            <Icon icon="lucide:sparkles" class="size-6 text-bejo-500 animate-pulse" />
          </span>
        </h1>
        

        <!-- Dynamic Insight Section -->
        <div class="mb-8 p-4 bg-bejo-50/50 border border-bejo-100 rounded-2xl max-w-2xl group/insight">
          <div class="flex gap-3">
            <div class="shrink-0 size-8 bg-white rounded-lg shadow-sm border border-bejo-100 flex items-center justify-center">
              <Icon icon="lucide:sparkles" class="size-4 text-bejo-500" />
            </div>
            <div class="space-y-1">
              <div class="text-[9px] font-black uppercase tracking-widest text-bejo-600 flex items-center gap-2">
                Insight
                <span class="size-1 bg-bejo-300 rounded-full"></span>
                <span class="text-[8px] font-bold text-bejo-400 capitalize tracking-normal">Analisis AI</span>
              </div>
              <p class="text-xs font-bold text-slate-700 italic leading-relaxed">
                "{{ randomInsight || 'Memuat insight...' }}"
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-4">
          <RouterLink to="/properti/katalog" class="group/btn flex items-center gap-2.5 px-6 py-3.5 bg-bejo-500 hover:bg-bejo-600 text-white rounded-xl font-black text-xs transition-all shadow-xl shadow-bejo-500/20 hover:-translate-y-1">
            <Icon icon="lucide:layout-grid" class="size-4 transition-transform group-hover/btn:rotate-12" />
            Kelola Katalog
          </RouterLink>
          <RouterLink to="/chat" class="group/btn flex items-center gap-2.5 px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-black text-xs transition-all shadow-lg shadow-slate-200/50 hover:-translate-y-1">
            <Icon icon="lucide:message-circle" class="size-4 text-bejo-600 transition-transform group-hover/btn:scale-110" />
            Cek Pesanan Chat
          </RouterLink>
        </div>
      </div>

      <div class="md:col-span-4 hidden md:flex justify-center items-center pr-12 relative group">
        <!-- Floating House Visual -->
        <div class="relative scale-75">
          <div class="absolute inset-0 bg-bejo-500 blur-[80px] opacity-20 scale-150"></div>
          <div class="relative z-10 p-8 bg-white border border-bejo-100 rounded-[3rem] shadow-2xl transition-all duration-700 group-hover:rotate-3 group-hover:scale-105">
             <Icon icon="lucide:house" class="size-24 text-bejo-100" />
             <Icon icon="lucide:house" class="size-24 text-bejo-500 absolute inset-0 m-auto opacity-20" />
          </div>
          
          <div class="z-10 absolute -top-3 -right-3 size-12 bg-gradient-to-br from-bejo-500 to-bejo-700 rounded-xl flex items-center justify-center shadow-lg">
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
