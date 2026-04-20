<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useSettings } from '@/stores/settings'
import { success } from '@/utils/sweet-alert'

const settingsStore = useSettings()

const handleToggleMaintenance = () => {
  settingsStore.saveApp()
  const status = settingsStore.app.isMaintenance ? 'DIPERBAIKI' : 'AKTIF'
  success(`Status sistem sekarang: ${status}`)
}
</script>

<template>
  <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
    <div class="px-8 py-6 border-b border-slate-50 bg-slate-50/50">
      <h4 class="text-sm font-black text-slate-800 uppercase tracking-widest">Kontrol Sistem Global</h4>
    </div>

    <div class="p-8 space-y-8">
      <!-- Maintenance Mode Card -->
      <div 
        class="p-6 rounded-[2rem] border-2 transition-all duration-500"
        :class="settingsStore.app.isMaintenance ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'"
      >
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="flex gap-5">
            <div 
              class="size-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform duration-500"
              :class="settingsStore.app.isMaintenance ? 'bg-amber-500 text-white rotate-12' : 'bg-white text-slate-400 border border-slate-100'"
            >
              <Icon :icon="settingsStore.app.isMaintenance ? 'lucide:hammer' : 'lucide:rocket'" class="size-7" />
            </div>
            <div>
              <h5 class="text-lg font-black text-slate-900 mb-1">Mode Perbaikan (Maintenance)</h5>
              <p class="text-sm text-slate-500 font-medium leading-relaxed max-w-md">
                Aktifkan ini untuk menonaktifkan seluruh akses pengunjung dan menampilkan halaman perbaikan profesional. Admin tetap bisa login & mengelola data.
              </p>
            </div>
          </div>
          
          <label class="relative inline-flex items-center cursor-pointer group">
            <input 
              type="checkbox" 
              v-model="settingsStore.app.isMaintenance" 
              @change="handleToggleMaintenance"
              class="sr-only peer" 
            />
            <div class="w-20 h-10 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-8 after:w-9 after:transition-all peer-checked:bg-bejo-600 shadow-inner group-hover:scale-105 transition-transform"></div>
          </label>
        </div>

        <!-- Warning Message -->
        <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-4" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-4">
          <div v-if="settingsStore.app.isMaintenance" class="mt-6 p-4 bg-white/60 rounded-2xl border border-amber-200/50 flex items-center gap-3">
            <Icon icon="lucide:alert-triangle" class="size-5 text-amber-600 animate-pulse" />
            <span class="text-xs font-black text-amber-900 uppercase tracking-wider">Akses Pengunjung Dinonaktifkan Secara Global</span>
          </div>
        </Transition>
      </div>

      <!-- Bot Automation Card -->
      <div 
        class="p-6 rounded-[2rem] border-2 transition-all duration-500"
        :class="settingsStore.bot.isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'"
      >
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="flex gap-5">
            <div 
              class="size-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform duration-500"
              :class="settingsStore.bot.isActive ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-white text-slate-400 border border-slate-100'"
            >
              <Icon :icon="settingsStore.bot.isActive ? 'lucide:bot' : 'lucide:message-square-off'" class="size-7" />
            </div>
            <div>
              <h5 class="text-lg font-black text-slate-900 mb-1">Aktifkan Bot</h5>
              <p class="text-sm text-slate-500 font-medium leading-relaxed max-w-md">
                Aktifkan asisten otomatis untuk menangani pertanyaan pembeli via WhatsApp.
              </p>
            </div>
          </div>
          
          <label class="relative inline-flex items-center cursor-pointer group">
            <input 
              type="checkbox" 
              v-model="settingsStore.bot.isActive" 
              @change="settingsStore.saveBot()"
              class="sr-only peer" 
            />
            <div class="w-20 h-10 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-8 after:w-9 after:transition-all peer-checked:bg-emerald-600 shadow-inner group-hover:scale-105 transition-transform"></div>
          </label>
        </div>
      </div>

      <div class="bg-bejo-50/50 p-6 rounded-[2rem] border border-bejo-100 flex gap-5">
         <div class="size-12 bg-bejo-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-bejo-600/20">
           <Icon icon="lucide:info" class="size-6" />
         </div>
         <div class="space-y-1">
            <h6 class="text-sm font-black text-bejo-900">Tentang Mode Perbaikan</h6>
            <p class="text-xs text-bejo-700/70 font-medium leading-relaxed">
              Gunakan mode ini saat Anda melakukan pembaruan besar pada database atau struktur situs. Data Anda tetap aman, namun pengunjung tidak akan melihat halaman yang sedang tidak stabil.
            </p>
         </div>
      </div>
    </div>
  </div>
</template>
