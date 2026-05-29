<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useSettings } from '@/stores/settings'
import { success, fail } from '@/utils/sweet-alert'
import api from '@/services/axios'

const settingsStore = useSettings()
const isProcessing = ref(false)

// WA Bot Logic
const wahaStatus = ref<any>(null)
const qrImage = ref<string | null>(null)
const isFetchingStatus = ref(false)
const isLoggingOut = ref(false)
let statusInterval: any = null

const isGatewayActive = computed(() => {
  const s = wahaStatus.value?.status?.toUpperCase()
  return s === 'WORKING' || s === 'SCAN_QR_CODE' || s === 'STARTING'
})

const fetchWahaStatus = async () => {
  try {
    isFetchingStatus.value = true
    const { data } = await api.get('/api/waha/status', {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    if (data.Success) {
      wahaStatus.value = data.Data
      const status = data.Data.status?.toUpperCase()
      
      if (status === 'WORKING') {
        qrImage.value = null
      } else if (status === 'SCAN_QR_CODE') {
        fetchQrCode()
      } else {
        qrImage.value = null
      }
    }
  } catch (err) {
    console.error('Fetch WA status error:', err)
  } finally {
    isFetchingStatus.value = false
  }
}

const fetchQrCode = async () => {
  try {
    const { data } = await api.get('/api/waha/qr', {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    if (data.Success && data.Data) {
      qrImage.value = `data:${data.Data.mimetype};base64,${data.Data.data}`
    }
  } catch (err) {
    console.error('Fetch WA QR error:', err)
  }
}

const handleToggleMaintenance = async () => {
  try {
    isProcessing.value = true
    await settingsStore.updateDefaultSettings({ 
      Is_Maintenance: settingsStore.app.isMaintenance 
    })
    settingsStore.saveApp()
    const status = settingsStore.app.isMaintenance ? 'DIPERBAIKI' : 'AKTIF'
    success(`Status sistem sekarang: ${status}`)
  } catch {
    settingsStore.app.isMaintenance = !settingsStore.app.isMaintenance
    fail('Gagal memperbarui status perbaikan')
  } finally {
    isProcessing.value = false
  }
}

const handleToggleDiscount = async () => {
  try {
    isProcessing.value = true
    await settingsStore.updateDefaultSettings({ 
      View_Nilai_Diskon: settingsStore.app.viewDiscount 
    })
    settingsStore.saveApp()
    success(`Tampilan harga diskon berhasil ${settingsStore.app.viewDiscount ? 'diaktifkan' : 'dinonaktifkan'}`)
  } catch {
    settingsStore.app.viewDiscount = !settingsStore.app.viewDiscount
    fail('Gagal memperbarui pengaturan harga diskon')
  } finally {
    isProcessing.value = false
  }
}

const handleToggleBot = async () => {
  const targetState = settingsStore.bot.isActive
  try {
    isProcessing.value = true
    
    // Update default settings only
    await settingsStore.updateDefaultSettings({ 
      Bot_Active: targetState 
    })
    
    settingsStore.saveBot()
    success(`Fitur Bot berhasil ${targetState ? 'diaktifkan' : 'dinonaktifkan'}`)
  } catch (err) {
    settingsStore.bot.isActive = !targetState
    console.error('Toggle bot error:', err)
    fail('Gagal memperbarui pengaturan bot')
  } finally {
    isProcessing.value = false
  }
}

const handleToggleGateway = async () => {
  const targetState = !isGatewayActive.value
  
  try {
    isProcessing.value = true
    let endpoint = ''
    if (targetState) {
      const status = wahaStatus.value?.status?.toUpperCase()
      endpoint = status === 'FAILED' ? '/api/waha/restart' : '/api/waha/start'
    } else {
      endpoint = '/api/waha/stop'
    }
    
    const { data } = await api.post(endpoint, {}, {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    
    if (data.Success) {
      success(`Gateway WhatsApp berhasil ${targetState ? 'dijalankan' : 'dihentikan'}`)
      // Wait a bit then fetch status
      setTimeout(fetchWahaStatus, 2000)
    } else {
      fail(data.Message || 'Gagal mengubah status Gateway')
    }
  } catch (err) {
    console.error('Toggle gateway error:', err)
    fail('Terjadi kesalahan saat menghubungi server gateway')
  } finally {
    isProcessing.value = false
  }
}

const handleWahaLogout = async () => {
  try {
    isLoggingOut.value = true
    const { data } = await api.post('/api/waha/logout', {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    if (data.Success) {
      success('Berhasil keluar dari WhatsApp')
      fetchWahaStatus()
      qrImage.value = null
    }
  } catch (err) {
    console.error('WA logout error:', err)
    fail('Gagal logout')
  } finally {
    isLoggingOut.value = false
  }
}

onMounted(() => {
  fetchWahaStatus()
  statusInterval = setInterval(fetchWahaStatus, 5000)
})

onUnmounted(() => {
  if (statusInterval) clearInterval(statusInterval)
})
</script>

<template>
  <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
    <div class="px-4 sm:px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <div class="flex items-center gap-3 min-w-0">
            <div class="size-8 rounded-lg bg-bejo-500 flex items-center justify-center text-white shadow-lg shadow-bejo-500/20 shrink-0">
              <Icon icon="lucide:settings-2" class="size-4" />
            </div>
            <h4 class="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest truncate">Pengaturan Sistem</h4>
          </div>
        </div>
    <div class="px-4 sm:px-8 pb-8 space-y-6">
      <!-- WA Gateway Card -->
      <div 
        class="p-6 rounded-[2rem] border-2 transition-all duration-500"
        :class="isGatewayActive ? 'bg-bejo-50 border-bejo-200' : 'bg-slate-50 border-slate-100'"
      >
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-start gap-3 sm:gap-5 min-w-0">
            <div 
              class="size-12 sm:size-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform duration-500"
              :class="isGatewayActive ? 'bg-bejo-500 text-white shadow-bejo-500/20' : 'bg-white text-slate-400 border border-slate-100'"
            >
              <Icon icon="lucide:radio" class="size-6 sm:size-7" :class="{ 'animate-pulse': wahaStatus?.status === 'WORKING' }" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <h5 class="text-sm sm:text-base font-black text-slate-900 leading-tight">WhatsApp Gateway</h5>
                <span 
                  class="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest shrink-0"
                  :class="wahaStatus?.status === 'WORKING' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'"
                >
                  {{ wahaStatus?.status === 'WORKING' ? 'Online' : 'Offline' }}
                </span>
              </div>
              <p class="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed">
                Layanan penghubung sistem dengan server WhatsApp (WAHA Service).
              </p>
            </div>
          </div>
          
          <div class="shrink-0">
            <label class="relative inline-flex items-center cursor-pointer group" :class="{ 'opacity-50 pointer-events-none': isProcessing }">
              <input 
                type="checkbox" 
                :checked="isGatewayActive"
                @change="handleToggleGateway"
                class="sr-only peer" 
              />
              <div class="w-14 h-7 sm:w-20 sm:h-10 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] sm:after:top-[4px] after:start-[2px] sm:after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 sm:after:h-8 after:w-6 sm:after:w-9 after:transition-all peer-checked:bg-green-500 shadow-inner group-hover:scale-105 transition-transform"></div>
              <div v-if="isProcessing" class="absolute inset-0 flex items-center justify-center">
                 <Icon icon="lucide:loader-2" class="size-4 animate-spin text-white z-10" />
              </div>
            </label>
          </div>
        </div>

        <!-- Connection Detail (QR/Session) -->
        <Transition enter-active-class="transition duration-500 ease-out" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
          <div v-if="isGatewayActive || qrImage" class="mt-8 pt-8 border-t border-slate-100/50">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Left: QR/Status -->
              <div class="space-y-6">
                <div v-if="wahaStatus?.status === 'WORKING'" class="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100">
                  <div class="flex items-center gap-4 flex-1 min-w-0 w-full">
                    <div class="size-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                      <Icon icon="lucide:user-check" class="size-6 text-emerald-600" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <h6 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">Sesi Aktif</h6>
                      <p class="text-sm font-black text-slate-800 truncate">{{ wahaStatus.me?.pushName || 'WhatsApp Bot' }}</p>
                      <p class="text-xs font-bold text-slate-500 mt-0.5">{{ wahaStatus.me?.id?.split('@')[0] }}</p>
                    </div>
                  </div>
                  <button 
                    @click="handleWahaLogout" 
                    :disabled="isLoggingOut"
                    class="w-full sm:w-auto px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2 shrink-0"
                  >
                    <Icon v-if="isLoggingOut" icon="lucide:loader-2" class="animate-spin size-3" />
                    Logout
                  </button>
                </div>

                <div v-else class="flex flex-col items-center justify-center py-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <div v-if="qrImage" class="space-y-4 flex flex-col items-center">
                    <div class="relative p-4 bg-white border border-slate-100 rounded-3xl shadow-xl">
                      <img :src="qrImage" alt="WA QR Code" class="size-48" />
                      <div v-if="isFetchingStatus" class="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-[1px]">
                        <Icon icon="lucide:loader-2" class="size-8 animate-spin text-bejo-500" />
                      </div>
                    </div>
                    <div class="text-center px-4">
                      <p class="text-sm font-black text-slate-800">Scan QR Code</p>
                      <p class="text-xs text-slate-500 font-bold mt-1 max-w-[200px]">Buka WhatsApp > Perangkat Tertaut > Tautkan Perangkat</p>
                    </div>
                  </div>
                  <div v-else class="py-8 flex flex-col items-center">
                    <div class="size-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
                      <Icon icon="lucide:loader-2" class="size-8 animate-spin" />
                    </div>
                    <p class="text-sm font-black text-slate-800">Menyiapkan QR Code...</p>
                  </div>
                </div>
              </div>

              <!-- Right: Info -->
              <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                <div class="absolute -right-4 -top-4 size-24 bg-bejo-50 rounded-full blur-2xl group-hover:bg-bejo-100 transition-colors"></div>
                <div class="relative">
                  <h6 class="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Icon icon="lucide:zap" class="size-4 text-bejo-500" />
                    Keunggulan Gateway
                  </h6>
                  <ul class="space-y-3">
                    <li v-for="(item, i) in ['Respon Katalog Otomatis', 'Notifikasi Chat ke Admin', 'Auto-sinkronisasi Kontak']" :key="i" class="flex items-center gap-2">
                      <Icon icon="lucide:check-circle-2" class="size-3.5 text-emerald-500" />
                      <span class="text-xs font-bold text-slate-600">{{ item }}</span>
                    </li>
                  </ul>
                  <p class="mt-4 text-xs text-slate-400 font-medium leading-relaxed italic">
                    * Pastikan nomor WA Anda memiliki koneksi internet yang stabil untuk menjaga status "Online".
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Bot Automation Card -->
      <div 
        class="p-6 rounded-[2rem] border-2 transition-all duration-500"
        :class="settingsStore.bot.isActive ? 'bg-bejo-50 border-bejo-200' : 'bg-slate-50 border-slate-100'"
      >
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-start gap-3 sm:gap-5 min-w-0">
            <div 
              class="size-12 sm:size-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform duration-500"
              :class="settingsStore.bot.isActive ? 'bg-emerald-500 text-white shadow-bejo-500/20' : 'bg-white text-slate-400 border border-slate-100'"
            >
              <Icon :icon="settingsStore.bot.isActive ? 'lucide:bot' : 'lucide:message-square-off'" class="size-6 sm:size-7" />
            </div>
            <div class="min-w-0 flex-1">
              <h5 class="text-sm sm:text-base font-black text-slate-900 mb-1 leading-tight">Aktifkan Bot</h5>
              <p class="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed">
                Aktifkan asisten otomatis untuk menangani pertanyaan pembeli via WhatsApp secara cerdas.
              </p>
            </div>
          </div>
          
          <div class="shrink-0">
            <label class="relative inline-flex items-center cursor-pointer group" :class="{ 'opacity-50 pointer-events-none': isProcessing }">
              <input 
                type="checkbox" 
                v-model="settingsStore.bot.isActive" 
                @change="handleToggleBot"
                class="sr-only peer" 
              />
              <div class="w-14 h-7 sm:w-20 sm:h-10 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] sm:after:top-[4px] after:start-[2px] sm:after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 sm:after:h-8 after:w-6 sm:after:w-9 after:transition-all peer-checked:bg-green-500 shadow-inner group-hover:scale-105 transition-transform"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Maintenance Mode Card -->
      <div 
        class="p-6 rounded-[2rem] border-2 transition-all duration-500"
        :class="settingsStore.app.isMaintenance ? 'bg-bejo-50 border-bejo-200' : 'bg-slate-50 border-slate-100'"
      >
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-start gap-3 sm:gap-5 min-w-0">
            <div 
              class="size-12 sm:size-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform duration-500"
              :class="settingsStore.app.isMaintenance ? 'bg-bejo-500 text-white rotate-12' : 'bg-white text-slate-400 border border-slate-100'"
            >
              <Icon :icon="settingsStore.app.isMaintenance ? 'lucide:hammer' : 'lucide:rocket'" class="size-6 sm:size-7" />
            </div>
            <div class="min-w-0 flex-1">
              <h5 class="text-sm sm:text-base font-black text-slate-900 mb-1 leading-tight">Mode Perbaikan (Maintenance)</h5>
              <p class="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed">
                Aktifkan ini untuk menonaktifkan seluruh akses pengunjung dan menampilkan halaman perbaikan profesional. Admin tetap bisa login & mengelola data.
              </p>
            </div>
          </div>
          
          <div class="shrink-0">
            <label class="relative inline-flex items-center cursor-pointer group">
              <input 
                type="checkbox" 
                v-model="settingsStore.app.isMaintenance" 
                @change="handleToggleMaintenance"
                class="sr-only peer" 
              />
              <div class="w-14 h-7 sm:w-20 sm:h-10 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] sm:after:top-[4px] after:start-[2px] sm:after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 sm:after:h-8 after:w-6 sm:after:w-9 after:transition-all peer-checked:bg-green-500 shadow-inner group-hover:scale-105 transition-transform"></div>
            </label>
          </div>
        </div>

        <!-- Warning Message -->
        <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-4" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-4">
          <div v-if="settingsStore.app.isMaintenance" class="mt-6 p-4 bg-white/60 rounded-2xl border border-bejo-200/50 flex items-center gap-3">
            <Icon icon="lucide:alert-triangle" class="size-5 text-bejo-500 animate-pulse" />
            <span class="text-xs font-black text-bejo-900 uppercase tracking-wider">Akses Pengunjung Dinonaktifkan Secara Global</span>
          </div>
        </Transition>
      </div>

      <!-- Discount Price Card -->
      <div 
        class="p-6 rounded-[2rem] border-2 transition-all duration-500"
        :class="settingsStore.app.viewDiscount ? 'bg-bejo-50 border-bejo-200' : 'bg-slate-50 border-slate-100'"
      >
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-start gap-3 sm:gap-5 min-w-0">
            <div 
              class="size-12 sm:size-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform duration-500"
              :class="settingsStore.app.viewDiscount ? 'bg-bejo-500 text-white shadow-bejo-500/20' : 'bg-white text-slate-400 border border-slate-100'"
            >
              <Icon icon="lucide:tag" class="size-6 sm:size-7" />
            </div>
            <div class="min-w-0 flex-1">
              <h5 class="text-sm sm:text-base font-black text-slate-900 mb-1 leading-tight">Tampilkan Harga Sebelum Diskon</h5>
              <p class="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed">
                Jika diaktifkan, sistem akan menampilkan harga asli yang dicoret di samping harga promo.
              </p>
            </div>
          </div>
          
          <div class="shrink-0">
            <label class="relative inline-flex items-center cursor-pointer group" :class="{ 'opacity-50 pointer-events-none': isProcessing }">
              <input 
                type="checkbox" 
                v-model="settingsStore.app.viewDiscount" 
                @change="handleToggleDiscount"
                class="sr-only peer" 
              />
              <div class="w-14 h-7 sm:w-20 sm:h-10 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] sm:after:top-[4px] after:start-[2px] sm:after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 sm:after:h-8 after:w-6 sm:after:w-9 after:transition-all peer-checked:bg-green-500 shadow-inner group-hover:scale-105 transition-transform"></div>
            </label>
          </div>
        </div>
      </div>

      <div class="bg-bejo-50/50 p-6 rounded-[2rem] border border-bejo-100 flex gap-5">
         <div class="size-12 bg-bejo-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-bejo-500/20">
           <Icon icon="lucide:info" class="size-6" />
         </div>
         <div class="space-y-1">
            <h6 class="text-sm font-black text-bejo-900">Tentang Mode Perbaikan</h6>
            <p class="text-xs text-bejo-700/70 font-bold leading-relaxed">
              Gunakan mode ini saat Anda melakukan pembaruan besar pada database atau struktur situs. Data Anda tetap aman, namun pengunjung tidak akan melihat halaman yang sedang tidak stabil.
            </p>
         </div>
      </div>
    </div>
  </div>
</template>
