<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Vertical from '@/layouts/vertical.vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'
import { useSettings } from '@/stores/settings'
import { confirm, success, fail } from '@/utils/sweet-alert'
import RecipientModal from './components/RecipientModal.vue'
import UnitModal from './components/UnitModal.vue'

const message = ref('')
const isRecipientModalOpen = ref(false)
const isUnitModalOpen = ref(false)
const activeTemplateIndex = ref<number | null>(null)
const selectedUnit = ref<any>(null)
const isLoading = ref(false)
const isStopping = ref(false)
const settingsStore = useSettings()

const recipients = ref<any[]>([])
const loadingRecipients = ref(false)
const waStatus = ref<'online' | 'offline'>('online')
const messageInput = ref<HTMLTextAreaElement | null>(null)

const templates = [
  {
    title: 'Galaxy Mall + Unair',
    content: `*Hanya 1 menit ke Galaxy Mall + Unair Kampus C* 
*Rmh Gress 2LT modern kontemporer*
*Rmh Kotak dgn Lebar 9m*
*Sebelah ada lahan kosong bisa utk Parkir Mbl* (Jarang ada) 

Jl.Wisma Permai Barat II/NN-27
⚬ LT 9x15  LB ±195m²
⚬ KT 4+1 KM 3+1
⚬ SHM, IMB Lengkap
⚬ Bisa KPR
⚬ PLN 2200w 
⚬ Carport 2 mobil
⚬ Hadap Utara
⚬ Row 2,5 mobil
⚬ *Harga 3,4M*
• *Free Tandon Atas Stenlis+Pompa dorong*`
  },
  {
    title: 'Scandinavian Kenjeran',
    content: `*'TURUN HARGA !!!'*
*Model Scandinavian*🤩
*Rumah Gress 2Lt sangat dekat raya Kenjeran*
*Posisi rmh Depan Taman/ Fasum*

*Perumahan Gading Pantai V/2*

*Rumah Hook*
⚬ LT 9X10 LB +-120m²
⚬ KT 3+1 KM 3+1
⚬ SHM, IMB Lengkap
⚬ PLN 2200w
⚬ Sanitair TOTO
⚬ Row 2,5 mobil 
⚬ Carport 1 mobil
⚬ Hadap Selatan Barat
⚬ *FREE Tandon Atas Stenlis*
⚬ *Harga ~1,9M~-----> 1,8M*`
  },
  {
    title: 'Mewah Pakuwon City',
    content: `*🔥 HOT LISTING 🔥*
*DIJUAL – RUMAH MEWAH PAKUWON CITY*
*Cluster Virgin Gorda*

*Spesifikasi :*
LT: 12 x 20 (240 m²)
LB: ±400 m²
KT: 4 + 1 ( semua kmr mandi dalam )
KM: 5 + 1
Hadap: Utara
Carport: 3 mobil
Row jalan: 3 mobil *(lega & nyaman)*
Listrik: *5.500 Watt*
Sertifikat: *SHM* *(Bisa KPR)*

*Keunggulan :*
Bangunan besar & layout lega *(tidak banyak sekat)*
Cocok untuk keluarga besar
Lingkungan premium & nyaman di Pakuwon City

*Bonus & Material Premium :*
9 unit AC: *Daikin*
Sanitary: *Kohler*
Shower: *GROHE*
Lantai granit: *QUADRA*
Fasad marmer: *Fagetti*
Canopy WF 300 *(kuat & elegan)*
Tandon air + pompa
💰 *Harga: 8,5 M (nego tipis)*`
  }
]

const fetchRecipients = async () => {
  loadingRecipients.value = true
  try {
    const { data } = await api.get('/api/customer/getAll')
    if (data.StatusCode === 200) {
      recipients.value = data.Data.filter((c: any) => c.Status_Broadcast === 'aktif')
    }
  } catch {
    console.error('Gagal mengambil data penerima')
  } finally {
    loadingRecipients.value = false
  }
}

const selectTemplate = (index: number) => {
  activeTemplateIndex.value = index
  isUnitModalOpen.value = true
}

const openUnitModal = () => {
  if (!message.value.trim()) {
    activeTemplateIndex.value = null
  }
  isUnitModalOpen.value = true
}

const handleUnitSelected = (unit: any) => {
  selectedUnit.value = unit
  isUnitModalOpen.value = false

  const isNoTemplate = activeTemplateIndex.value === null
  const templateText = !isNoTemplate ? templates[activeTemplateIndex.value!].content : ''
  
  // Logic for Status Header (No Template only)
  const statusLabels = Array.isArray(unit.Status_Transaksi) ? unit.Status_Transaksi : [unit.Status_Transaksi]
  const statusHeader = statusLabels.map((s: string) => s.toLowerCase() === 'jual' ? 'DIJUAL' : 'DISEWAKAN').join(' / ')
  const header = isNoTemplate ? `*${statusHeader} PROPERTI*` : `*DETAIL LENGKAP PROPERTI:*`

  // Akses Jalan as List
  const aksesList = Array.isArray(unit.Akses_Jalan) && unit.Akses_Jalan.length > 0
    ? `⚬ Akses Jalan:\n${unit.Akses_Jalan.map((a: string) => `  - ${a}`).join('\n')}`
    : `⚬ Akses Jalan: ${unit.Akses_Jalan || '-'}`

  // Logic for Dual Pricing with Strikethrough
  const priceLines = []
  const viewDiscount = settingsStore.app.viewDiscount

  if (unit.Harga_Jual1 > 0) {
    const p1 = unit.Harga_Jual1
    const p2 = unit.Harga_Jual2 > 0 ? unit.Harga_Jual2 : p1
    const strikethrough = (viewDiscount && unit.Harga_Jual2 > 0) ? `~${formatPrice(p1)}~ ` : ""
    priceLines.push(`💰 *Harga Jual: ${strikethrough}${formatPrice(p2)}*`)
  }

  if (unit.Harga_Sewa1 > 0) {
    const p1 = unit.Harga_Sewa1
    const p2 = unit.Harga_Sewa2 > 0 ? unit.Harga_Sewa2 : p1
    const strikethrough = (viewDiscount && unit.Harga_Sewa2 > 0) ? `~${formatPrice(p1)}~ ` : ""
    const unitSewa = unit.Satuan_Minimal_Sewa ? ` / ${unit.Satuan_Minimal_Sewa}` : ""
    const minSewa = unit.Minimal_Sewa ? ` (Min. ${unit.Minimal_Sewa} ${unit.Satuan_Minimal_Sewa || 'Bulan'})` : ""
    priceLines.push(`🏷 *Harga Sewa: ${strikethrough}${formatPrice(p2)}${unitSewa}${minSewa}*`)
  }
  const priceDisplay = priceLines.join('\n')

  const unitInfoBody = unit ? `${header}
🏠 *${unit.Nama_Produk}*
📍 ${unit.Alamat || '-'}
🏢 ${unit.Nama_Kota || '-'}

⚬ Tipe: ${unit.Tipe || '-'}
⚬ Dimensi: ${unit.Tipe_Ukuran || '-'}
⚬ Luas Tanah: ${unit.Luas_Tanah}m²
⚬ Luas Bangunan: ${unit.Luas_Bangunan}m²
⚬ Lantai: ${unit.Jumlah_Lantai || 1} Lantai
⚬ KT: ${unit.Jumlah_Kamar_Tidur} | KM: ${unit.Jumlah_Kamar_Mandi}
⚬ Carport: ${unit.Jumlah_Carpot || 0} Mobil
⚬ Listrik: ${unit.Daya_Listrik || '-'} Watt
⚬ Sertifikat: ${unit.Jenis_Sertifikat || '-'}
${aksesList}

${!isNoTemplate ? `✅ *Status Transaksi:* ${statusLabels.join(' / ')}\n` : ''}${priceDisplay}

📝 *Keterangan:*
${unit.Keterangan || '-'}` : ''
  
  const separator = (templateText && unitInfoBody) ? '\n\n' : ''
  message.value = templateText + separator + unitInfoBody
  // Re-focus after selection
  setTimeout(() => messageInput.value?.focus(), 100)
}

const formatPrice = (price: number) => {
  if (!price) return '-'
  if (price >= 1000000000) {
    const v = price / 1000000000
    return (v % 1 === 0 ? v.toString() : v.toFixed(1)) + ' M'
  }
  if (price >= 1000000) {
    const v = price / 1000000
    return (v % 1 === 0 ? v.toString() : v.toFixed(1)) + ' Jt'
  }
  return price.toLocaleString('id-ID')
}

const handleSend = async () => {
  if (!message.value.trim()) return fail('Silakan masukkan pesan terlebih dahulu')
  if (recipients.value.length === 0) return fail('Belum ada penerima yang aktif untuk broadcast')

  confirm(`Kirim broadcast ke ${recipients.value.length} penerima?`, async () => {
    isLoading.value = true
    try {
      const { data } = await api.post('/api/broadcast/send-all', {
        Pesan: message.value
      })
      if (data.StatusCode === 200) {
        success('Broadcast sedang berjalan')
      } else {
        fail(data.Message || 'Gagal mengirim broadcast')
      }
    } catch (err: any) {
      fail(err.response?.data?.Message || 'Terjadi kesalahan sistem')
    } finally {
      isLoading.value = false
    }
  })
}

const handleStop = async () => {
  confirm('Hentikan proses broadcast yang sedang berjalan?', async () => {
    isStopping.value = true
    try {
      const { data } = await api.post('/api/broadcast/stop')
      if (data.StatusCode === 200) {
        success('Broadcast berhasil dihentikan')
      } else {
        fail(data.Message || 'Gagal menghentikan broadcast')
      }
    } catch (err: any) {
      fail(err.response?.data?.Message || 'Terjadi kesalahan sistem')
    } finally {
      isStopping.value = false
    }
  })
}

onMounted(() => {
  fetchRecipients()
  setTimeout(() => messageInput.value?.focus(), 500)
})
</script>

<template>
  <Vertical>
    <div class="px-4 md:px-3 md:pt-0 pb-2 h-[calc(100vh-theme(spacing.topbar-height)-0.5rem)] flex flex-col overflow-hidden">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 flex-grow min-h-0">
        <!-- Message Input Area (2/3) -->
        <div class="lg:col-span-2 flex flex-col min-h-0">
          <div class="bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden flex flex-col h-full">
            <div class="p-5 md:p-6 flex-grow flex flex-col space-y-3 min-h-0">
              <div class="flex items-center justify-between shrink-0">
                <div class="flex items-center gap-4">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pesan Broadcast</span>
                  <div class="h-4 w-px bg-slate-100"></div>
                  <div class="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100">
                    <div class="size-1.5 rounded-full" :class="waStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'"></div>
                    <span class="text-[9px] font-black uppercase tracking-widest" :class="waStatus === 'online' ? 'text-green-600' : 'text-red-600'">
                      WA GATEWAY: {{ waStatus }}
                    </span>
                  </div>
                </div>
                <button @click="openUnitModal" class="text-[10px] font-black text-bejo-600 hover:text-bejo-700 uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                  <Icon icon="lucide:home" class="size-3.5" />
                  {{ selectedUnit ? 'Ganti Unit' : 'Pilih Unit' }}
                </button>
              </div>

              <textarea 
                ref="messageInput"
                v-model="message"
                placeholder="Tulis pesan Anda di sini atau pilih template di samping..."
                class="flex-grow w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all resize-none leading-relaxed custom-scrollbar"
              ></textarea>
              <div class="flex flex-col sm:flex-row items-center gap-3 pt-3 shrink-0">
                <button 
                  @click="handleSend"
                  :disabled="isLoading || !message.trim() || recipients.length === 0"
                  class="w-full sm:w-auto h-11 px-8 bg-bejo-500 hover:bg-bejo-600 disabled:bg-slate-200 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-bejo-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Icon v-if="isLoading" icon="lucide:loader-2" class="size-4 animate-spin" />
                  <Icon v-else icon="lucide:send" class="size-4" />
                  Kirim Sekarang
                </button>
                <button 
                  @click="handleStop"
                  :disabled="isStopping"
                  class="w-full sm:w-auto h-11 px-6 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Icon v-if="isStopping" icon="lucide:loader-2" class="size-4 animate-spin" />
                  <Icon v-else icon="lucide:stop-circle" class="size-4" />
                  Hentikan Proses
                </button>
                <button 
                  @click="isRecipientModalOpen = true"
                  class="sm:ml-auto h-11 px-5 bg-slate-50 hover:bg-bejo-50 border border-slate-100 hover:border-bejo-200 text-slate-600 hover:text-bejo-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 active:scale-95"
                >
                  <div class="flex items-center gap-1.5">
                    <div class="size-2 rounded-full" :class="recipients.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-300'"></div>
                    <span>{{ recipients.length }} Penerima Aktif</span>
                  </div>
                  <div class="w-px h-4 bg-slate-200"></div>
                  <Icon icon="lucide:users" class="size-3.5" />
                  Kelola
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Templates Side Area (1/3) -->
        <div class="flex flex-col gap-4 min-h-0">
          <div class="bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/40 p-5 md:p-6 space-y-4 flex flex-col flex-grow min-h-0">
            <div class="shrink-0">
              <h5 class="text-sm font-black text-slate-900 uppercase tracking-widest">Template Pesan</h5>
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Pilih template untuk mempercepat broadcast</p>
            </div>

            <div class="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-grow">
              <button 
                v-for="(tpl, idx) in templates" 
                :key="idx"
                @click="selectTemplate(idx)"
                class="w-full text-left p-4 rounded-2xl border transition-all group hover:scale-[1.01] active:scale-95"
                :class="activeTemplateIndex === idx ? 'bg-bejo-50 border-bejo-200 ring-2 ring-bejo-500/10' : 'bg-slate-50/50 border-slate-100 hover:border-bejo-200 hover:bg-bejo-50/30'"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[10px] font-black uppercase tracking-widest transition-colors" :class="activeTemplateIndex === idx ? 'text-bejo-600' : 'text-slate-400 group-hover:text-bejo-500'">Template {{ idx + 1 }}</span>
                  <div class="size-6 rounded-lg bg-white border flex items-center justify-center text-slate-400 group-hover:text-bejo-500 transition-colors shadow-sm">
                    <Icon icon="lucide:copy" class="size-3" />
                  </div>
                </div>
                <h6 class="text-xs font-black text-slate-700 group-hover:text-slate-900 transition-colors">{{ tpl.title }}</h6>
                <p class="text-[10px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">{{ tpl.content }}</p>
              </button>
            </div>

            <button 
              @click="() => { activeTemplateIndex = null; message = ''; selectedUnit = null; }"
              class="w-full py-3 text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-all border border-transparent hover:border-red-100 hover:bg-red-50 rounded-xl flex items-center justify-center gap-2 shrink-0"
            >
              <Icon icon="lucide:rotate-ccw" class="size-3.5" />
              Reset Pesan
            </button>
          </div>

          <!-- Tips Card -->
          <div class="bg-bejo-600 rounded-3xl p-5 md:p-6 text-white relative overflow-hidden group shadow-xl shadow-bejo-600/20 shrink-0">
            <Icon icon="lucide:sparkles" class="absolute -right-2 -bottom-2 size-24 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            <h5 class="text-sm font-black uppercase tracking-widest mb-3 relative z-10 text-white">Tips Broadcast</h5>
            <ul class="space-y-3 relative z-10">
              <li class="flex gap-3 text-[10px] text-white/90 leading-relaxed font-medium">
                <Icon icon="lucide:check-circle-2" class="size-3.5 text-bejo-200 shrink-0" />
                Pastikan nomor WhatsApp Server dalam keadaan online.
              </li>
              <li class="flex gap-3 text-[10px] text-white/90 leading-relaxed font-medium">
                <Icon icon="lucide:check-circle-2" class="size-3.5 text-bejo-200 shrink-0" />
                Gunakan template yang menarik untuk meningkatkan respon.
              </li>
              <li class="flex gap-3 text-[10px] text-white/90 leading-relaxed font-medium">
                <Icon icon="lucide:check-circle-2" class="size-3.5 text-bejo-200 shrink-0" />
                Jangan mengirim pesan terlalu sering untuk menghindari spam.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <!-- Modals -->
    <RecipientModal 
      :show="isRecipientModalOpen" 
      @close="isRecipientModalOpen = false" 
      @updated="fetchRecipients"
    />
    
    <UnitModal 
      :show="isUnitModalOpen" 
      @close="isUnitModalOpen = false" 
      @selected="handleUnitSelected"
    />
  </Vertical>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-200 rounded-full;
}
</style>
