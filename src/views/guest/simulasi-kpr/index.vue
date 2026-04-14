<template>
  <GuestLayout>
    <div class="mb-10 print:hidden space-y-8">
      
      <nav class="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 mb-4 uppercase tracking-widest font-semibold">
        <RouterLink to="/" class="hover:text-bejo-600 transition-colors">Beranda</RouterLink>
        <Icon icon="lucide:chevron-right" class="size-3" />
        <span class="text-slate-800">Simulasi KPR</span>
      </nav>

      <!-- Hero Section -->
      <div class="relative overflow-hidden rounded-[2.5rem] bg-slate-900 mt-4 h-72 sm:h-80 lg:h-96 shadow-2xl flex items-center justify-center border border-slate-800">
        <!-- Dekorasi Background -->
        <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" alt="KPR Illustration" class="absolute inset-0 w-full h-full object-cover opacity-20 select-none pointer-events-none mix-blend-luminosity" draggable="false" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-transparent to-transparent"></div>
        
        <div class="relative z-10 text-center px-6 w-full max-w-4xl mx-auto">
          <h1 class="text-4xl sm:text-5xl lg:text-7xl font-black text-white tracking-tight drop-shadow-2xl mb-6">
            Simulasikan <span class="bg-gradient-to-r from-bejo-400 to-bejo-600 bg-clip-text text-transparent">Pinjamanmu!</span>
          </h1>
          <p class="text-slate-300 text-sm sm:text-base lg:text-lg font-medium max-w-2xl mx-auto drop-shadow leading-relaxed">
            Hitung estimasi angsuran rumah impian Anda dengan cepat dan akurat menggunakan fasilitas kalkulator simulasi KPR kami.
          </p>
        </div>
      </div>

      <!-- KPR Calculator Area -->
      <div class="bg-gradient-to-br from-bejo-400 via-bejo-500 to-bejo-600 rounded-[2.5rem] p-6 sm:p-12 shadow-2xl shadow-bejo-600/30 grid grid-cols-1 xl:grid-cols-12 gap-10 lg:gap-14 relative overflow-hidden">
        
        <!-- Decoration Geometric Elements -->
        <div class="absolute -top-40 -right-40 size-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-40 -left-40 size-96 bg-black/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/20 to-transparent pointer-events-none hidden xl:block"></div>
        
        <!-- Input Form Section -->
        <div class="xl:col-span-7 space-y-6 relative z-10">
          <div class="mb-8">
            <h2 class="text-2xl font-black text-white drop-shadow-sm mb-2 flex items-center gap-3">
              <Icon icon="lucide:calculator" class="size-6 text-bejo-50" />
              Detail Pinjaman
            </h2>
            <p class="text-bejo-50 font-medium text-sm">Silakan ubah angka di bawah ini sesuai dengan profil kemampuan finansial Anda.</p>
          </div>

          <!-- Harga Properti -->
          <div class="bg-bejo-700/30 p-2 rounded-2xl backdrop-blur-sm border border-bejo-100/10">
            <label class="block text-[10px] font-black text-bejo-50 uppercase tracking-widest px-3 pt-2 mb-1">Harga Properti</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-4 flex items-center justify-center text-slate-800 font-bold">Rp</span>
              <input type="text" :value="formatCurrency(propertyPrice)" @input="setPropertyPrice" class="w-full bg-white border-0 rounded-xl px-4 py-3.5 pl-12 text-lg sm:text-xl font-black text-slate-900 shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50 transition-all hover:-translate-y-0.5" placeholder="0" />
            </div>
          </div>

          <!-- Uang Muka -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div class="col-span-1 bg-bejo-700/30 p-2 rounded-2xl backdrop-blur-sm border border-bejo-100/10">
              <label class="block text-[10px] font-black text-bejo-50 uppercase tracking-widest px-3 pt-2 mb-1">Uang Muka (%)</label>
              <div class="relative">
                <input type="number" v-model.number="dpPercentage" min="0" max="100" class="w-full bg-white border-0 rounded-xl px-4 py-3.5 pr-10 text-lg font-black text-center text-slate-900 shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50 transition-all hover:-translate-y-0.5" />
                <span class="absolute inset-y-0 right-4 flex items-center justify-center text-slate-400 font-black">%</span>
              </div>
            </div>
            <div class="col-span-1 md:col-span-2 bg-bejo-700/30 p-2 rounded-2xl backdrop-blur-sm border border-bejo-100/10">
              <label class="block text-[10px] font-black text-bejo-50 uppercase tracking-widest px-3 pt-2 mb-1">Nominal Uang Muka</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-4 flex items-center justify-center text-slate-800 font-bold">Rp</span>
                <input type="text" :value="formatCurrency(dpValue)" @input="setDpValueFromInput" class="w-full bg-white border-0 rounded-xl px-4 py-3.5 pl-12 text-lg font-black text-slate-900 shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50 text-left md:text-right transition-all hover:-translate-y-0.5" />
              </div>
            </div>
          </div>

          <!-- Pinjaman & Suku Bunga -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div class="bg-bejo-700/30 p-2 rounded-2xl backdrop-blur-sm border border-bejo-100/10">
              <label class="block text-[10px] font-black text-bejo-50 uppercase tracking-widest px-3 pt-2 mb-1">Tenor (Waktu)</label>
              <div class="relative">
                <input type="number" v-model.number="years" min="1" max="35" class="w-full bg-white border-0 rounded-xl px-4 py-3.5 pr-20 text-lg font-black text-slate-900 shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50 text-center transition-all hover:-translate-y-0.5" />
                <span class="absolute inset-y-0 right-1.5 top-1.5 bottom-1.5 flex items-center justify-center text-slate-600 font-bold bg-slate-100 px-3 rounded-lg text-xs border border-slate-200 shadow-sm pointer-events-none">Tahun</span>
              </div>
            </div>
            <div class="bg-bejo-700/30 p-2 rounded-2xl backdrop-blur-sm border border-bejo-100/10">
              <label class="block text-[10px] font-black text-bejo-50 uppercase tracking-widest px-3 pt-2 mb-1">Suku Bunga Fixed</label>
              <div class="relative">
                <input type="number" v-model.number="interestRate" step="0.1" min="0" max="100" class="w-full bg-white border-0 rounded-xl px-4 py-3.5 pr-12 text-lg font-black text-slate-900 shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50 text-center transition-all hover:-translate-y-0.5" />
                <span class="absolute inset-y-0 right-1.5 top-1.5 bottom-1.5 flex items-center justify-center text-slate-600 font-bold bg-slate-100 px-3 rounded-lg text-xs border border-slate-200 shadow-sm pointer-events-none">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Result Section -->
        <div class="xl:col-span-5 flex flex-col justify-center relative z-10 mt-6 xl:mt-0">
          <div class="bg-slate-900 rounded-[2rem] p-5 sm:p-8 shadow-2xl w-full flex flex-col border border-white/10 relative overflow-hidden mb-5">
            <div class="absolute top-0 right-0 size-32 bg-bejo-600 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
            
            <h3 class="text-xl font-black text-white mb-8 pb-4 border-b border-white/10">Hasil Simulasi KPR</h3>
            
            <div class="grid grid-cols-1 gap-6 mb-8">
              <div class="flex flex-col">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Estimasi Angsuran / Bulan</span>
                <div class="flex items-baseline gap-2">
                  <span class="text-bejo-400 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight drop-shadow-md">Rp {{ formatCurrencyShort(angsuran) }}</span>
                </div>
              </div>
              <div class="flex flex-col pt-6 border-t border-white/5">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                  <Icon icon="lucide:safe" class="size-3.5" /> Total Pinjaman Bank
                </span>
                <span class="text-white text-xl sm:text-2xl font-black">Rp {{ formatCurrencyShort(totalPinjaman) }}</span>
              </div>
            </div>

            <button @click="handleKprWa" class="w-full px-6 py-4 bg-bejo-500 hover:bg-bejo-600 text-white rounded-2xl font-black text-base transition-all hover:shadow-xl hover:shadow-bejo-500/40 flex justify-center items-center gap-2 group hover:-translate-y-1 mt-auto focus:ring-4 focus:ring-bejo-500/50">
              <Icon icon="lucide:message-circle" class="size-5" />
              Konsultasikan Melalui WhatsApp
              <Icon icon="lucide:arrow-right" class="size-4 group-hover:translate-x-1 transition-transform opacity-60" />
            </button>
          </div>
          
          <div class="flex gap-3 bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <Icon icon="lucide:info" class="size-5 text-white shrink-0 mt-0.5" />
            <p class="text-xs text-white font-medium leading-relaxed drop-shadow-sm">
              *Hasil dari simulasi angsuran KPR ini <strong>tidak mengikat</strong> dan hanyalah perkiraan indikatif masa periode suku bunga tetap (fixed rate). Info rincian detail silakan hubungi agen.
            </p>
          </div>
        </div>

      </div>

      <!-- Persyaratan Section -->
      <div class="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/40 p-6 sm:p-12 mb-10 overflow-hidden relative">
        <!-- Deco -->
        <div class="absolute -top-24 -right-24 size-48 bg-slate-50 rounded-full blur-2xl"></div>
        
        <div class="text-center mb-12 max-w-2xl mx-auto relative z-10">
          <span class="inline-flex items-center gap-2 px-3 py-1 bg-bejo-50 text-bejo-600 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-bejo-100">
            <Icon icon="lucide:folder-check" class="size-3.5" /> Persiapan Berkas
          </span>
          <h2 class="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">Dokumen Pengajuan KPR</h2>
          <p class="text-base text-slate-500 font-medium leading-relaxed">
            Siapkan kelengkapan administrasi Anda sebelum mengajukan KPR agar tim kami dapat memprosesnya dengan sangat cepat demi mewujudkan kepemilikan Anda.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 relative z-10">
          <!-- Data Pemohon -->
          <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg shadow-slate-200/50 hover:-translate-y-1 transition-transform group">
            <div class="flex items-center justify-between mb-8">
              <h4 class="text-lg font-black text-slate-800 tracking-tight">Data Pemohon</h4>
              <div class="p-3 bg-slate-50 group-hover:bg-bejo-50 rounded-xl text-slate-400 group-hover:text-bejo-600 transition-colors">
                <Icon icon="lucide:user-circle-2" class="size-6" />
              </div>
            </div>
            <ul class="space-y-4">
              <li v-for="(item, i) in docsPemohon" :key="i" class="flex gap-3 text-sm font-semibold text-slate-600 items-start">
                <Icon icon="lucide:check-square" class="size-5 text-emerald-500 shrink-0" />
                <span class="leading-snug">{{ item }}</span>
              </li>
            </ul>
          </div>

          <!-- Data Pekerjaan -->
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg shadow-slate-200/50 hover:-translate-y-1 transition-transform group">
            <div class="flex items-center justify-between mb-8">
              <h4 class="text-lg font-black text-slate-800 tracking-tight">Status Pekerjaan</h4>
              <div class="p-3 bg-slate-50 group-hover:bg-bejo-50 rounded-xl text-slate-400 group-hover:text-bejo-600 transition-colors">
                <Icon icon="lucide:briefcase" class="size-6" />
              </div>
            </div>
            <ul class="space-y-4">
              <li v-for="(item, i) in docsPekerjaan" :key="i" class="flex gap-3 text-sm font-semibold text-slate-600 items-start">
                <Icon icon="lucide:check-square" class="size-5 text-emerald-500 shrink-0" />
                <span class="leading-snug">{{ item }}</span>
              </li>
            </ul>
          </div>

          <!-- Data Agunan/Tambahan -->
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg shadow-slate-200/50 hover:-translate-y-1 transition-transform group">
            <div class="flex items-center justify-between mb-8">
              <h4 class="text-lg font-black text-slate-800 tracking-tight">Data Tambahan</h4>
              <div class="p-3 bg-slate-50 group-hover:bg-bejo-50 rounded-xl text-slate-400 group-hover:text-bejo-600 transition-colors">
                <Icon icon="lucide:files" class="size-6" />
              </div>
            </div>
            <ul class="space-y-4">
              <li v-for="(item, i) in docsTambahan" :key="i" class="flex gap-3 text-sm font-semibold text-slate-600 items-start">
                <Icon icon="lucide:check-square" class="size-5 text-emerald-500 shrink-0" />
                <span class="leading-snug">{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
    </div>
  </GuestLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import GuestLayout from '@/layouts/guest.vue'
import { useSettings } from '@/stores/settings'

const settingsStore = useSettings()

const formatCurrency = (value: number) => {
  if (isNaN(value)) return '0'
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value)
}

const formatCurrencyShort = (value: number) => {
  if (isNaN(value)) return '0'
  if (value >= 1e12) return (value / 1e12).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' Triliun'
  if (value >= 1e9) return (value / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' Miliar'
  if (value >= 1e6) return (value / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' Juta'
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value)
}

const parseNumber = (val: string | number) => {
  if (typeof val === 'number') return val
  return parseInt(String(val).replace(/\D/g, ''), 10) || 0
}

// Simulasi KPR State
const propertyPrice = ref<number>(850000000)
const dpPercentage = ref<number>(15)
const years = ref<number>(15)
const interestRate = ref<number>(5.0)

const totalPinjaman = computed(() => {
  return Math.max(0, propertyPrice.value - dpValue.value)
})

const dpValue = computed({
  get: () => {
    return Math.round(propertyPrice.value * (dpPercentage.value / 100))
  },
  set: (val) => {
    let p = (val / propertyPrice.value) * 100
    if (p > 100) p = 100
    if (p < 0) p = 0
    dpPercentage.value = Math.round(p * 100) / 100
  }
})

const setPropertyPrice = (e: Event) => {
  const val = parseNumber((e.target as HTMLInputElement).value)
  propertyPrice.value = val
}

const setDpValueFromInput = (e: Event) => {
  const val = parseNumber((e.target as HTMLInputElement).value)
  dpValue.value = val
}

const angsuran = computed(() => {
  const p = totalPinjaman.value
  if (p <= 0) return 0
  const r = (interestRate.value / 100) / 12
  const n = years.value * 12
  
  if (r === 0) return p / n
  
  const pmt = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
  return Math.round(pmt)
})

const handleKprWa = () => {
  const defaultGreeting = 'Halo Admin Rumah Bejo, saya baru saja melakukan simulasi KPR di situs dan ingin berkonsultasi lebih lanjut.'
  const message = `${defaultGreeting}\n\nBerikut simulasi anggaran saya:\n- Harga Properti: Rp ${formatCurrency(propertyPrice.value)}\n- DP / Uang Muka (${dpPercentage.value}%): Rp ${formatCurrency(dpValue.value)}\n- Pinjaman Bank: Rp ${formatCurrency(totalPinjaman.value)}\n- Suku Bunga: ${interestRate.value}%\n- Tenor Waktu: ${years.value} thn\n\n*Estimasi Angsuran:* Rp ${formatCurrency(angsuran.value)}/bln\n\nApakah pihak agen bisa membantu merekomendasikan properti yang sesuai dengan anggaran saya?`
  const targetNumber = settingsStore.business.whatsapp || '62895353837000'
  
  window.open(`https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`, '_blank')
}

// Persyaratan Dokumen Dummmy Data
const docsPemohon = [
  'KTP Suami & Istri Asli / Fotokopi',
  'Kartu Keluarga (KK) Elektronik',
  'NPWP Pribadi Pemohon',
  'Akta Nikah / Akta Cerai',
  'Pas Foto Warna Suami & Istri (3x4)'
]
const docsPekerjaan = [
  'Slip Gaji Asli Lengkap (3 Bulan Terakhir)',
  'Surat Keterangan Kerja Resmi dari HRD',
  'Mutasi Rekening Koran (3 Bulan Terakhir)',
  'Laporan SPT PPh 21 Terakhir'
]
const docsTambahan = [
  'Sertifikat Hal Milik (SHM) / SHGB',
  'Fotokopi IMB (Izin Mendirikan Bangunan)',
  'Bukti Pelunasan PBB Tahun Berakhir',
  'Bukti Tanda Jadi / Kuitansi DP Pembelian'
]
</script>

<style scoped>
@reference "@/assets/css/style.css";
/* Hapus up/down arrow dari input number khusus Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
