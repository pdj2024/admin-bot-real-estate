<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useSettings } from '@/stores/settings'
import type { Product } from '../index.vue'

const settingsStore = useSettings()

const props = defineProps<{
  product: Product | null
}>()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value)
}

const formatCurrencyShort = (value: number) => {
  if (value >= 1e12) return 'Rp ' + (value / 1e12).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' T'
  if (value >= 1e9) return 'Rp ' + (value / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' M'
  if (value >= 1e6) return 'Rp ' + (value / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' Jt'
  if (value >= 1e3) return 'Rp ' + (value / 1e3).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' Rb'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

const propertyPrice = computed(() => {
  if (!props.product) return 0
  if (props.product.Harga_Jual2 > 0) return props.product.Harga_Jual2
  if (props.product.Harga_Jual1 > 0) return props.product.Harga_Jual1
  return props.product.Harga_Sewa1 || 0
})

const dpPercentage = ref(0)
const years = ref(0)
const interestRate = ref(0)

const dpValue = computed({
  get: () => {
    return Math.round(propertyPrice.value * (dpPercentage.value / 100))
  },
  set: (val) => {
    // If user changes the exact DP absolute, update percentage
    let p = (val / propertyPrice.value) * 100
    if (p > 100) p = 100
    if (p < 0) p = 0
    dpPercentage.value = Math.round(p)
  }
})

const parseNumber = (val: string | number) => {
  if (typeof val === 'number') return val
  return parseInt(val.replace(/\D/g, ''), 10) || 0
}

const setDpValueFromInput = (e: Event) => {
    const val = parseNumber((e.target as HTMLInputElement).value)
    dpValue.value = val
}

const angsuran = computed(() => {
  const p = propertyPrice.value - dpValue.value
  if (p <= 0) return 0
  const r = (interestRate.value / 100) / 12
  const n = years.value * 12
  
  if (r === 0) return p / n
  
  const pmt = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
  return Math.round(pmt)
})

const handleKprWa = () => {
  const url = window.location.href
  const defaultGreeting = `Halo Admin ${settingsStore.business.appName}, saya sedang melihat properti "${props.product?.Nama_Produk}" dan ingin berkonsultasi mengenai simulasi KPR yang baru saja saya lakukan di situs.`
  const message = `${defaultGreeting}\n\nEstimasi saya:\n- Harga: ${formatCurrencyShort(propertyPrice.value)}\n- DP (${dpPercentage.value}%): Rp ${formatCurrency(dpValue.value)}\n- Tenor: ${years.value} thn\n- Angsuran: Rp ${formatCurrency(angsuran.value)}/bln\n\nBerikut tautan propertinya: ${url}`
  const targetNumber = settingsStore.business.whatsapp || '6287700083370'
  
  window.open(`https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`, '_blank')
}
</script>

<template>
  <div v-if="!product || product?.Status_Transaksi?.includes('Jual')" class="card border-none shadow-sm bg-white rounded-2xl overflow-hidden mb-8">
    <div class="card-body p-6 md:p-8">
      <div class="flex items-center gap-3 mb-6">
        <div class="bg-bejo-50 p-2.5 rounded-xl border border-bejo-100">
          <Icon icon="lucide:calculator" class="size-6 text-bejo-600" />
        </div>
        <div>
          <h3 class="text-2xl font-extrabold tracking-tight text-slate-900 leading-none">Simulasi Cicilan KPR</h3>
          <p class="text-sm text-slate-500 font-medium mt-1">Hitung estimasi angsuran yang pas untuk dompet Anda.</p>
        </div>
      </div>

      <div class="space-y-5 border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
        <!-- Harga Properti -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
          <span class="text-sm font-semibold text-slate-600">Harga Properti (Rp)</span>
          <div class="text-lg font-black text-slate-900 justify-end md:text-right flex items-center">
            {{ formatCurrencyShort(propertyPrice) }}
          </div>
        </div>

        <hr class="border-slate-100 border-dashed" />

        <!-- Uang Muka -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
          <span class="text-sm font-semibold text-slate-600">Uang Muka (Rp)</span>
          <div class="flex items-center gap-3">
            <div class="relative w-1/3">
              <input type="number" v-model.number="dpPercentage" class="w-full text-right bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-bejo-500 focus:border-bejo-500 pr-10 hover:border-slate-300 transition-colors" min="0" max="100" />
              <span class="absolute inset-y-0 right-4 flex items-center text-slate-400 font-bold">%</span>
            </div>
            <div class="relative w-2/3">
              <span class="absolute inset-y-0 left-4 flex items-center text-slate-400 font-bold">Rp</span>
              <input type="text" :value="formatCurrency(dpValue)" @input="setDpValueFromInput" class="w-full text-right bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-bejo-500 focus:border-bejo-500 hover:border-slate-300 transition-colors" />
            </div>
          </div>
        </div>

        <!-- Jangka Waktu -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
          <span class="text-sm font-semibold text-slate-600">Jangka Waktu</span>
          <div class="relative">
            <input type="number" v-model.number="years" class="w-full text-right bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-bejo-500 focus:border-bejo-500 pr-16 hover:border-slate-300 transition-colors" min="1" max="30" />
            <span class="absolute inset-y-0 right-4 flex items-center text-slate-500 font-bold bg-white pl-2">tahun</span>
          </div>
        </div>

        <!-- Suku Bunga -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
          <span class="text-sm font-semibold text-slate-600">Suku Bunga</span>
          <div class="relative">
            <input type="number" v-model.number="interestRate" step="0.1" class="w-full text-right bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-bejo-500 focus:border-bejo-500 pr-10 hover:border-slate-300 transition-colors" min="0" max="100" />
            <span class="absolute inset-y-0 right-4 flex items-center text-slate-400 font-bold">%</span>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-r from-bejo-600 to-bejo-700 p-6 md:p-8 rounded-[2.5rem] mt-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl shadow-bejo-600/30 border border-white/10">
        <Icon icon="lucide:calculator" class="absolute -right-6 -bottom-6 size-40 text-white/10" />
        
        <div class="relative z-10 w-full md:w-auto">
          <p class="text-[10px] text-white/70 font-black uppercase tracking-[0.2em] mb-2">Estimasi Angsuran</p>
          <div class="flex items-baseline gap-2 flex-wrap">
            <span class="text-white font-black text-2xl md:text-3xl lg:text-4xl">Rp {{ formatCurrency(angsuran) }}</span>
            <span class="text-[10px] font-bold text-white/60 uppercase tracking-widest">/ bulan</span>
          </div>
        </div>

        <button @click="handleKprWa" class="relative z-10 w-full md:w-auto shrink-0 flex items-center justify-center gap-3 px-8 py-4 bg-white text-bejo-700 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-bejo-50 hover:-translate-y-1 transition-all active:scale-95 group">
          <Icon icon="ic:baseline-whatsapp" class="size-6 text-bejo-600 transition-transform group-hover:scale-110" />
          Konsultasi KPR
        </button>
      </div>
    </div>
  </div>
</template>
