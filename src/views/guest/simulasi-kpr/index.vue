<template>
  <GuestLayout>
    <div class="mb-10 print:hidden space-y-10">
      
      <!-- Hero Section -->
      <div class="relative overflow-hidden rounded-[3.5rem] bg-white border border-bejo-100 p-12 md:p-16 lg:p-20 shadow-xl shadow-bejo-600/5">
        <!-- Dekorasi Background -->
        <div class="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-bejo-50 via-bejo-50/50 to-transparent"></div>
        <div class="absolute -right-20 -top-20 size-96 bg-gradient-to-br from-bejo-100 via-bejo-200 to-bejo-400 rounded-full blur-3xl opacity-40"></div>
        <div class="absolute right-10 -bottom-20 size-64 bg-gradient-to-tr from-bejo-300 via-bejo-500 to-bejo-700 rounded-full blur-3xl opacity-10"></div>
        
        <div class="relative z-10 text-center px-6 w-full max-w-6xl mx-auto">
          <h1 class="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tight mb-6">
            Simulasikan <br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-bejo-500 via-bejo-700 to-bejo-900">Pinjamanmu!</span>
          </h1>
          <p class="text-slate-500 text-lg sm:text-xl font-medium leading-relaxed max-w-3xl mx-auto">
            Hitung estimasi angsuran rumah impian Anda dengan cepat dan akurat menggunakan fasilitas kalkulator simulasi KPR kami.
          </p>
        </div>
      </div>

      <!-- KPR Calculator Area -->
      <div class="relative overflow-hidden rounded-[3.5rem] bg-white border border-bejo-100 shadow-2xl shadow-bejo-600/10">
        <!-- Mesh Gradient Background -->
        <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div class="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-bejo-50 via-bejo-50/30 to-transparent"></div>
          <div class="absolute -left-20 bottom-0 size-96 bg-gradient-to-tr from-bejo-50 via-bejo-100 to-bejo-200 rounded-full blur-3xl opacity-30"></div>
        </div>
        
        <div class="w-full px-6 py-8 sm:px-12 sm:py-16 grid grid-cols-1 xl:grid-cols-12 gap-10 lg:gap-16 relative z-10">
        
          <!-- Input Form Section -->
          <div class="xl:col-span-7 space-y-6 relative z-10">
            <div class="mb-6">
              <div class="inline-flex items-center gap-2 px-4 py-2 bg-bejo-50 rounded-full text-bejo-600 text-xs font-black uppercase tracking-widest mb-4">
                <Icon icon="lucide:calculator" class="size-4" />
                Calculator
              </div>
              <h2 class="text-3xl font-black text-slate-900 mb-2">Detail Pinjaman</h2>
              <p class="text-slate-500 font-medium text-sm leading-relaxed">Atur parameter di bawah ini untuk melihat simulasi pembiayaan properti Anda secara akurat.</p>
            </div>

            <div class="space-y-6">
              <!-- Harga Properti -->
              <div class="group bg-white rounded-3xl p-6 border border-slate-100 shadow-sm transition-all hover:border-bejo-200">
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1 group-focus-within:text-bejo-600 transition-colors">Harga Properti</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-5 flex items-center justify-center text-slate-400 font-bold text-xl">Rp</span>
                  <input type="text" :value="formatCurrency(propertyPrice)" @input="setPropertyPrice" class="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 pl-14 text-2xl font-black text-slate-900 shadow-inner focus:outline-none focus:ring-4 focus:ring-bejo-500/10 focus:bg-white focus:border-bejo-200 transition-all" placeholder="0" />
                </div>
              </div>

              <!-- Uang Muka -->
              <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6 transition-all hover:border-bejo-200">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Uang Muka (DP)</label>
                  <div class="flex items-center gap-3">
                    <div class="relative w-24">
                      <input type="number" v-model.number="dpPercentage" min="0" max="100" class="w-full bg-bejo-50 border border-bejo-100 rounded-xl px-3 py-2 pr-8 text-sm font-black text-bejo-700 focus:outline-none focus:ring-2 focus:ring-bejo-500/20" />
                      <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-bejo-400 font-black text-[10px]">%</span>
                    </div>
                    <div class="h-6 w-[1px] bg-slate-100 hidden sm:block"></div>
                    <span class="text-sm font-bold text-slate-400">Rp {{ formatCurrencyShort(dpValue) }}</span>
                  </div>
                </div>
                <div class="relative pt-1 px-1">
                  <input type="range" v-model.number="dpPercentage" min="0" max="100" step="1" class="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-bejo-600" />
                  <div class="flex justify-between mt-3 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <!-- Tenor & Suku Bunga (Optimized Row) -->
              <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-8 transition-all hover:border-bejo-200">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <!-- Tenor Control -->
                  <div class="space-y-6">
                    <div class="flex items-center justify-between">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tenor (Waktu)</label>
                      <div class="relative w-28">
                        <input type="number" v-model.number="years" min="1" max="35" class="w-full bg-bejo-50 border border-bejo-100 rounded-xl px-3 py-2 pr-12 text-sm font-black text-bejo-700 focus:outline-none focus:ring-2 focus:ring-bejo-500/20" />
                        <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-bejo-400 font-black text-[10px]">THN</span>
                      </div>
                    </div>
                    <div class="relative pt-1 px-1">
                      <input type="range" v-model.number="years" min="1" max="35" step="1" class="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-bejo-600" />
                      <div class="flex justify-between mt-3 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                        <span>1 Thn</span>
                        <span>15 Thn</span>
                        <span>35 Thn</span>
                      </div>
                    </div>
                  </div>

                  <!-- Suku Bunga Control -->
                  <div class="space-y-4">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Suku Bunga Fixed</label>
                    <div class="relative flex items-center">
                      <input type="number" v-model.number="interestRate" step="0.1" min="0" max="100" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 pr-12 text-lg font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-bejo-500/10 focus:bg-white transition-all" />
                      <span class="absolute right-4 text-slate-400 font-black">%</span>
                    </div>
                    <div class="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                      <Icon icon="lucide:info" class="size-3 text-bejo-400" />
                      <p class="text-[9px] font-bold text-slate-400 leading-tight">
                        Rata-rata suku bunga bank saat ini berkisar antara 3-9%.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Result Section -->
          <div class="xl:col-span-5 flex flex-col justify-start relative z-10">
            <div class="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-bejo-600/10 text-slate-900 relative overflow-hidden h-full flex flex-col border border-bejo-100">
              <!-- Dekorasi -->
              <div class="absolute -right-20 -top-20 size-64 bg-bejo-100 rounded-full blur-[120px] opacity-40 pointer-events-none"></div>
              <div class="absolute -left-20 -bottom-20 size-64 bg-bejo-50 rounded-full blur-[100px] opacity-30 pointer-events-none"></div>
              
              <div class="relative z-10 flex flex-col h-full">
                <div class="flex items-center justify-between mb-8 pb-6 border-b border-bejo-50">
                  <div>
                    <h3 class="text-xl font-black tracking-tight mb-1">Estimasi Angsuran</h3>
                    <p class="text-bejo-600/60 text-xs font-black uppercase tracking-widest">Ringkasan Pembiayaan</p>
                  </div>
                  <div class="p-3 bg-bejo-50 rounded-2xl">
                    <Icon icon="lucide:trending-up" class="size-6 text-bejo-600" />
                  </div>
                </div>

                <!-- Main Result -->
                <div class="mb-10 text-center">
                  <span class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 block">Cicilan Per Bulan</span>
                  <div class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-3">
                    <span class="text-bejo-600 text-2xl mr-1">Rp</span>{{ formatCurrency(Math.round(angsuran)) }}
                  </div>
                  <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-bejo-50 rounded-full border border-bejo-100 text-[10px] font-black text-bejo-700">
                    <Icon icon="lucide:calendar" class="size-3" />
                    Bunga Fixed {{ interestRate }}% Selama Tenor
                  </div>
                </div>
                
                <div class="space-y-8 flex-grow">
                  <!-- Chart Area -->
                  <div class="relative flex flex-col items-center justify-center p-6 bg-bejo-50/30 rounded-3xl border border-bejo-100/50 backdrop-blur-sm">
                    <ApexChart 
                      height="240" 
                      width="100%" 
                      :options="chartOptions" 
                      :series="chartSeries" 
                    />
                    
                    <!-- Legend Custom -->
                    <div class="grid grid-cols-2 gap-4 w-full mt-4">
                      <div class="flex items-center gap-2">
                        <div class="size-2.5 rounded-full bg-bejo-600"></div>
                        <div class="flex flex-col">
                          <span class="text-[9px] font-black text-slate-400 uppercase">Pokok Pinjaman</span>
                          <span class="text-xs font-black text-slate-800">Rp {{ formatCurrencyShort(totalPinjaman) }}</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <div class="size-2.5 rounded-full bg-bejo-200"></div>
                        <div class="flex flex-col">
                          <span class="text-[9px] font-black text-slate-400 uppercase">Total Bunga</span>
                          <span class="text-xs font-black text-slate-800">Rp {{ formatCurrencyShort(totalBunga) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Small Metrics -->
                  <div class="grid grid-cols-2 gap-4">
                    <div class="p-4 bg-white rounded-2xl border border-bejo-100 shadow-sm">
                      <span class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Total Pinjaman</span>
                      <div class="text-sm font-black text-slate-900">Rp {{ formatCurrencyShort(totalPinjaman) }}</div>
                    </div>
                    <div class="p-4 bg-white rounded-2xl border border-bejo-100 shadow-sm">
                      <span class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Masa Tenor</span>
                      <div class="text-sm font-black text-slate-900">{{ years }} Tahun</div>
                    </div>
                  </div>

                  <button @click="handleKprWa" class="w-full bg-bejo-600 hover:bg-bejo-700 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-bejo-600/30 flex items-center justify-center gap-3 active:scale-95 group">
                    <Icon icon="ic:baseline-whatsapp" class="size-6 transition-transform group-hover:scale-110" />
                    Konsultasikan Sekarang
                  </button>
                </div>

                <p class="mt-8 text-[10px] font-bold text-slate-400 leading-relaxed text-center italic">
                  *Simulasi ini hanya perkiraan. Suku bunga dan tenor dapat berubah sewaktu-waktu sesuai kebijakan bank.
                </p>
              </div>
            </div>
          </div>

        </div> <!-- END of Inner Grid Container -->
      </div> <!-- END of KPR Calculator Area -->

      <!-- Persyaratan Section -->
      <div class="bg-white border border-bejo-100/50 rounded-[2.5rem] shadow-xl shadow-bejo-600/5 p-6 sm:p-12 mb-10 overflow-hidden relative">
        <!-- Deco -->
        <div class="absolute -top-24 -right-24 size-48 bg-bejo-50 rounded-full blur-2xl"></div>
        
        <div class="text-center mb-12 max-w-2xl mx-auto relative z-10">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-bejo-50 rounded-full text-bejo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            Requirement
          </div>
          <h2 class="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">Dokumen Pengajuan KPR</h2>
          <p class="text-base text-slate-500 font-medium leading-relaxed">
            Siapkan kelengkapan administrasi Anda untuk mempermudah proses verifikasi oleh tim analis kami.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 relative z-10">
          <!-- Data Pemohon -->
          <div class="bg-slate-50/50 rounded-3xl p-8 border border-slate-100 hover:bg-white hover:border-bejo-100 hover:shadow-xl hover:shadow-bejo-600/5 transition-all group">
            <div class="flex items-center justify-between mb-8">
              <h4 class="text-lg font-black text-slate-800 tracking-tight">Data Pemohon</h4>
              <div class="p-3 bg-white group-hover:bg-bejo-50 rounded-xl text-slate-400 group-hover:text-bejo-600 shadow-sm transition-colors border border-slate-100">
                <Icon icon="lucide:user-circle-2" class="size-6" />
              </div>
            </div>
            <ul class="space-y-4">
              <li v-for="(item, i) in docsPemohon" :key="i" class="flex gap-3 text-sm font-semibold text-slate-600 items-start">
                <div class="mt-1 size-1.5 rounded-full bg-bejo-500 shrink-0"></div>
                <span class="leading-snug">{{ item }}</span>
              </li>
            </ul>
          </div>

          <!-- Data Pekerjaan -->
          <div class="bg-slate-50/50 rounded-3xl p-8 border border-slate-100 hover:bg-white hover:border-bejo-100 hover:shadow-xl hover:shadow-bejo-600/5 transition-all group">
            <div class="flex items-center justify-between mb-8">
              <h4 class="text-lg font-black text-slate-800 tracking-tight">Status Pekerjaan</h4>
              <div class="p-3 bg-white group-hover:bg-bejo-50 rounded-xl text-slate-400 group-hover:text-bejo-600 shadow-sm transition-colors border border-slate-100">
                <Icon icon="lucide:briefcase" class="size-6" />
              </div>
            </div>
            <ul class="space-y-4">
              <li v-for="(item, i) in docsPekerjaan" :key="i" class="flex gap-3 text-sm font-semibold text-slate-600 items-start">
                <div class="mt-1 size-1.5 rounded-full bg-bejo-500 shrink-0"></div>
                <span class="leading-snug">{{ item }}</span>
              </li>
            </ul>
          </div>

          <!-- Data Agunan/Tambahan -->
          <div class="bg-slate-50/50 rounded-3xl p-8 border border-slate-100 hover:bg-white hover:border-bejo-100 hover:shadow-xl hover:shadow-bejo-600/5 transition-all group">
            <div class="flex items-center justify-between mb-8">
              <h4 class="text-lg font-black text-slate-800 tracking-tight">Data Tambahan</h4>
              <div class="p-3 bg-white group-hover:bg-bejo-50 rounded-xl text-slate-400 group-hover:text-bejo-600 shadow-sm transition-colors border border-slate-100">
                <Icon icon="lucide:files" class="size-6" />
              </div>
            </div>
            <ul class="space-y-4">
              <li v-for="(item, i) in docsTambahan" :key="i" class="flex gap-3 text-sm font-semibold text-slate-600 items-start">
                <div class="mt-1 size-1.5 rounded-full bg-bejo-500 shrink-0"></div>
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
import { ref, computed, defineAsyncComponent } from 'vue'
import { Icon } from '@iconify/vue'
import GuestLayout from '@/layouts/guest.vue'
import { useSettings } from '@/stores/settings'

const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'))
const settingsStore = useSettings()

const formatCurrency = (value: number) => {
  if (isNaN(value)) return '0'
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value)
}

const formatCurrencyShort = (value: number) => {
  if (isNaN(value)) return '0'
  if (value >= 1e12) return (value / 1e12).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' Triliun'
  if (value >= 1e9) return (value / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' Miliar'
  if (value >= 1e6) return (value / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' Juta'
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value)
}

const parseNumber = (val: string | number) => {
  if (typeof val === 'number') return val
  return parseInt(String(val).replace(/\D/g, ''), 10) || 0
}

// Simulasi KPR State
const propertyPrice = ref<number>(0)
const dpPercentage = ref<number>(10)
const years = ref<number>(15)
const interestRate = ref<number>(5.5)

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

const angsuran = computed(() => {
  const p = totalPinjaman.value
  const r = (interestRate.value / 100) / 12
  const n = years.value * 12
  
  if (r === 0) return p / (n || 1)
  if (n === 0) return 0
  
  return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
})

// Logika Chart
const totalBunga = computed(() => {
  const totalBayar = angsuran.value * (years.value * 12)
  return Math.max(0, totalBayar - totalPinjaman.value)
})

const chartSeries = computed(() => [
  totalPinjaman.value,
  totalBunga.value
])

const chartOptions = computed(() => ({
  chart: {
    type: 'donut',
    fontFamily: 'Outfit, sans-serif',
    sparkline: {
      enabled: false
    }
  },
  stroke: {
    width: 0,
    lineCap: 'round'
  },
  colors: ['#EA8455', '#fed7aa'],
  labels: ['Pokok Pinjaman', 'Total Bunga'],
  plotOptions: {
    pie: {
      donut: {
        size: '85%',
        labels: {
          show: false
        }
      }
    }
  },
  dataLabels: {
    enabled: false
  },
  legend: {
    show: false
  },
  states: {
    hover: {
      filter: {
        type: 'lighten',
        value: 0.1,
      }
    }
  },
  tooltip: {
    enabled: true,
    theme: 'light',
    style: {
      fontSize: '12px',
      fontFamily: 'Outfit, sans-serif',
    },
    y: {
      formatter: (val: any) => 'Rp ' + formatCurrency(val)
    }
  }
}))

const handleKprWa = () => {
  const defaultGreeting = `Halo Admin ${settingsStore.business.appName}, saya baru saja melakukan simulasi KPR di situs dan ingin berkonsultasi lebih lanjut.`
  const message = `${defaultGreeting}\n\nBerikut simulasi anggaran saya:\n- Harga Properti: Rp ${formatCurrency(propertyPrice.value)}\n- DP / Uang Muka (${dpPercentage.value}%): Rp ${formatCurrency(dpValue.value)}\n- Pinjaman Bank: Rp ${formatCurrency(totalPinjaman.value)}\n- Suku Bunga: ${interestRate.value}%\n- Tenor Waktu: ${years.value} thn\n\n*Estimasi Angsuran:* Rp ${formatCurrency(Math.round(angsuran.value))}/bln\n\nApakah pihak agen bisa membantu merekomendasikan properti yang sesuai dengan anggaran saya?`
  const targetNumber = settingsStore.business.whatsapp || '6287700083370'
  
  window.open(`https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`, '_blank')
}

// Persyaratan Dokumen Data
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
  'Sertifikat Hak Milik (SHM) / SHGB',
  'Fotokopi IMB (Izin Mendirikan Bangunan)',
  'Bukti Pelunasan PBB Tahun Berakhir',
  'Bukti Tanda Jadi / Kuitansi DP Pembelian'
]
</script>

<style scoped>
@reference "@/assets/css/style.css";

/* Hapus up/down arrow dari input number */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}

/* Custom Range Input Styling */
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #EA8455;
  cursor: pointer;
  border: 4px solid white;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  margin-top: -6px;
  transition: all 0.2s ease;
}

input[type=range]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 8px;
  cursor: pointer;
  background: #f1f5f9;
  border-radius: 4px;
}
</style>
