<template>
  <GuestLayout>
    <div class="mb-10 print:hidden space-y-10">
      

      <!-- Hero Section -->
      <div class="relative overflow-hidden rounded-[3rem] bg-white mt-4 h-72 sm:h-80 lg:h-96 shadow-xl shadow-bejo-600/5 flex items-center justify-center border border-bejo-100 uppercase tracking-widest font-semibold mt-10">
        <!-- Dekorasi Background -->
        <div class="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-bejo-50 via-bejo-50/50 to-transparent"></div>
        <div class="absolute -right-20 -top-20 size-96 bg-gradient-to-br from-bejo-100 via-bejo-200 to-bejo-400 rounded-full blur-3xl opacity-40"></div>
        <div class="absolute right-10 -bottom-20 size-64 bg-gradient-to-tr from-bejo-300 via-bejo-500 to-bejo-700 rounded-full blur-3xl opacity-10"></div>
        
        <div class="relative z-10 text-center px-6 w-full max-w-4xl mx-auto">
          <h1 class="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tight mb-6">
            Simulasikan <br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-bejo-500 via-bejo-700 to-bejo-900">Pinjamanmu!</span>
          </h1>
          <p class="text-slate-500 text-lg sm:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
            Hitung estimasi angsuran rumah impian Anda dengan cepat dan akurat menggunakan fasilitas kalkulator simulasi KPR kami.
          </p>
        </div>
      </div>

      <!-- KPR Calculator Area -->
      <div class="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-bejo-400 via-bejo-500 to-bejo-600 shadow-2xl shadow-bejo-600/30">
        <!-- Decoration Geometric Elements -->
        <div class="absolute -top-40 -right-40 size-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-40 -left-40 size-96 bg-black/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div class="max-w-6xl mx-auto px-6 py-10 sm:px-12 sm:py-16 grid grid-cols-1 xl:grid-cols-12 gap-10 lg:gap-16 relative z-10">
        
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
          <div class="bg-white rounded-[2rem] p-5 sm:p-8 shadow-2xl shadow-bejo-600/10 w-full flex flex-col border border-bejo-100 relative overflow-hidden mb-5">
            <div class="absolute top-0 right-0 size-32 bg-bejo-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            
            <h3 class="text-xl font-black text-slate-900 mb-8 pb-4 border-b border-bejo-50">Hasil Simulasi KPR</h3>
            
            <div class="space-y-8 relative z-10">
              <div>
                <span class="text-[10px] font-black uppercase tracking-widest text-bejo-600 mb-2 block">Estimasi Angsuran / Bulan</span>
                <div class="text-4xl sm:text-5xl font-black text-slate-900 flex items-baseline gap-2">
                  <span class="text-2xl text-bejo-500">Rp</span> {{ formatCurrencyShort(angsuran) }}
                </div>
              </div>
              
              <div class="pt-6 border-t border-bejo-50">
                <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Total Pinjaman Bank</span>
                <div class="text-2xl font-black text-slate-700">
                  Rp {{ formatCurrency(totalPinjaman) }}
                </div>
              </div>
            </div>
            
            <button @click="handleKprWa" class="mt-10 w-full bg-bejo-500 hover:bg-bejo-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-bejo-500/20 flex items-center justify-center gap-3 active:scale-95 group">
              <Icon icon="ic:baseline-whatsapp" class="size-6 transition-transform group-hover:scale-110" />
              Tanya kami
            </button>
          </div>

          <div class="bg-bejo-50/50 border border-bejo-100/50 rounded-2xl p-5 relative overflow-hidden">
            <p class="text-[10px] font-bold text-bejo-700/70 leading-relaxed text-center italic relative z-10">
              *Hasil dari simulasi angsuran KPR ini <span class="text-bejo-600">tidak mengikat</span> dan hanyalah perkiraan indikatif masa periode suku bunga tetap (fixed rate). Info rincian detail silakan hubungi agen.
            </p>
          </div>
        </div>

        </div>
      </div>

      <!-- Persyaratan Section -->
      <div class="bg-white border border-bejo-100/50 rounded-[2.5rem] shadow-xl shadow-bejo-600/5 p-6 sm:p-12 mb-10 overflow-hidden relative">
        <!-- Deco -->
        <div class="absolute -top-24 -right-24 size-48 bg-bejo-50 rounded-full blur-2xl"></div>
        
        <div class="text-center mb-12 max-w-2xl mx-auto relative z-10">

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
  const defaultGreeting = `Halo Admin ${settingsStore.business.appName}, saya baru saja melakukan simulasi KPR di situs dan ingin berkonsultasi lebih lanjut.`
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
