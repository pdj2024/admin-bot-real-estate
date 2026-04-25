<script setup lang="ts">
import { inject } from 'vue'
import { Icon } from '@iconify/vue'
import BaseFormGroup from '@/components/common/BaseFormGroup.vue'

const state = inject<any>('propertyModalState')
if (!state) {
  throw new Error('TabSpesifikasiDetail must be used within a component providing propertyModalState')
}

const { form, panjang, lebar, newAkses, isGeneratingAkses, generateAksesWithAI } = state

const specs = [
  { key: 'Jumlah_Kamar_Tidur', label: 'Jumlah KT', icon: 'lucide:bed' },
  { key: 'Jumlah_Kamar_Mandi', label: 'Jumlah KM', icon: 'lucide:bath' },
  { key: 'Jumlah_Carpot', label: 'Carport', icon: 'lucide:car' },
  { key: 'Daya_Listrik', label: 'Listrik (W)', icon: 'lucide:zap' }
] as const

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

const handleInputCurrency = (event: Event, field: 'Harga_Jual1' | 'Harga_Jual2' | 'Harga_Sewa1' | 'Harga_Sewa2') => {
  const input = event.target as HTMLInputElement
  const numericString = input.value.replace(/\D/g, '')
  if (!numericString) {
    form.value[field] = 0; input.value = ''; return
  }
  const pureNumber = parseInt(numericString, 10)
  form.value[field] = pureNumber
  input.value = formatCurrency(pureNumber)
}

const addAkses = () => {
  if (newAkses.value.trim()) {
    form.value.Akses_Jalan.push(newAkses.value.trim())
    newAkses.value = ''
  }
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start scale-in">
    <!-- Left Column: Specs & Dimensi -->
    <div class="space-y-10">
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseFormGroup label="LUAS TANAH (M²)" icon="lucide:land-plot" required>
            <input v-model="form.Luas_Tanah" type="number" class="field-input !pl-10" placeholder="0" />
          </BaseFormGroup>
          <BaseFormGroup label="LUAS BANGUNAN (M²)" icon="lucide:building-2" required>
            <input v-model="form.Luas_Bangunan" type="number" class="field-input !pl-10" placeholder="0" />
          </BaseFormGroup>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseFormGroup label="JUMLAH LANTAI" icon="lucide:layers">
            <input v-model="form.Jumlah_Lantai" type="number" class="field-input !pl-10" placeholder="0" />
          </BaseFormGroup>
          <BaseFormGroup label="DIMENSI (P X L)" icon="lucide:ruler">
            <div class="flex items-center gap-2">
              <input v-model="panjang" placeholder="P" class="field-input text-center !px-2 flex-1" />
              <span class="text-slate-300 font-bold">×</span>
              <input v-model="lebar" placeholder="L" class="field-input text-center !px-2 flex-1" />
            </div>
          </BaseFormGroup>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <BaseFormGroup v-for="s in specs" :key="s.key" :label="s.label.toUpperCase()" :icon="s.icon">
            <input v-model="form[s.key]" type="number" class="field-input !pl-10" placeholder="0" />
          </BaseFormGroup>
        </div>
      </div>
    </div>

    <!-- Right Column: Transaksi & Harga -->
    <div class="space-y-10 lg:pl-10 lg:border-l lg:border-slate-100">
      <div class="space-y-6">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <label class="text-[10px] font-black text-slate-800 uppercase tracking-widest">Opsi Transaksi</label>
          <div class="flex gap-6">
            <label class="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" value="Jual" v-model="form.Status_Transaksi" class="size-4 rounded border-slate-200 text-primary" />
              <span class="text-[10px] font-black text-slate-400 group-hover:text-primary transition-colors uppercase tracking-widest">Jual</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" value="Sewa" v-model="form.Status_Transaksi" class="size-4 rounded border-slate-200 text-primary" />
              <span class="text-[10px] font-black text-slate-400 group-hover:text-primary transition-colors uppercase tracking-widest">Sewa</span>
            </label>
            <label v-if="form.Status_Transaksi.includes('Sewa')" class="flex items-center gap-2 cursor-pointer group scale-in">
              <input type="checkbox" v-model="form.Ada_Minimal_Sewa" class="size-4 rounded border-slate-200 text-primary" />
              <span class="text-[10px] font-black text-slate-400 group-hover:text-primary transition-colors uppercase tracking-widest">Min Sewa</span>
            </label>
          </div>
        </div>

        <div class="space-y-4">
          <!-- Jual Section -->
          <div v-if="form.Status_Transaksi.includes('Jual')" class="grid grid-cols-1 md:grid-cols-2 gap-6 scale-in">
            <BaseFormGroup label="HARGA JUAL AWAL (RP)" icon="lucide:tag" required>
              <input type="text" :value="form.Harga_Jual1 ? formatCurrency(form.Harga_Jual1) : ''" @input="handleInputCurrency($event, 'Harga_Jual1')" class="field-input !pl-10" placeholder="Harga awal" />
            </BaseFormGroup>
            <BaseFormGroup label="HARGA JUAL DISKON (RP)" icon="lucide:percent">
              <input type="text" :value="form.Harga_Jual2 ? formatCurrency(form.Harga_Jual2) : ''" @input="handleInputCurrency($event, 'Harga_Jual2')" class="field-input !pl-10 text-emerald-600 bg-emerald-50/5 border-emerald-100" placeholder="Harga promo" />
            </BaseFormGroup>
          </div>

          <!-- Sewa Section -->
          <div v-if="form.Status_Transaksi.includes('Sewa')" class="space-y-4 scale-in">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseFormGroup label="HARGA SEWA AWAL (RP)" icon="lucide:calendar-check" required>
                <div class="flex items-center gap-2">
                  <input type="text" :value="form.Harga_Sewa1 ? formatCurrency(form.Harga_Sewa1) : ''" @input="handleInputCurrency($event, 'Harga_Sewa1')" class="field-input !pl-10 flex-1" placeholder="Per tahun" />
                  <span class="text-[9px] font-black text-slate-400 uppercase">/ Thn</span>
                </div>
              </BaseFormGroup>
              <BaseFormGroup label="HARGA SEWA PROMO (RP)" icon="lucide:badge-percent">
                <div class="flex items-center gap-2">
                  <input type="text" :value="form.Harga_Sewa2 ? formatCurrency(form.Harga_Sewa2) : ''" @input="handleInputCurrency($event, 'Harga_Sewa2')" class="field-input !pl-10 text-blue-600 bg-blue-50/5 border-blue-100 flex-1" placeholder="Diskon" />
                  <span class="text-[9px] font-black text-slate-400 uppercase">/ Thn</span>
                </div>
              </BaseFormGroup>
            </div>

            <div v-if="form.Ada_Minimal_Sewa" class="grid grid-cols-1 md:grid-cols-2 gap-6 scale-in">
              <BaseFormGroup label="MINIMAL SEWA" icon="lucide:clock">
                <input v-model="form.Minimal_Sewa" type="number" class="field-input !pl-10" />
              </BaseFormGroup>
              <BaseFormGroup label="SATUAN" icon="lucide:timer">
                <select v-model="form.Satuan_Minimal_Sewa" class="field-input !pl-10 appearance-none bg-white">
                  <option value="Bulan">Bulan</option>
                  <option value="Tahun">Tahun</option>
                </select>
              </BaseFormGroup>
            </div>
          </div>

          <BaseFormGroup label="AKSESIBILITAS" icon="lucide:road">
            <div class="flex gap-2">
              <div class="relative flex-1">
                <input v-model="newAkses" @keyup.enter="addAkses" placeholder="Ketik akses (e.g. 5 min ke tol)..." class="field-input !pl-10 w-full" />
                <button 
                  @click="generateAksesWithAI(form.Nama_Produk, form.Alamat)" 
                  type="button" 
                  class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded-lg text-primary transition-all disabled:opacity-50"
                  :title="isGeneratingAkses ? 'Sedang membuat...' : 'Generate AI'"
                  :disabled="isGeneratingAkses || (!form.Nama_Produk && !form.Alamat)"
                >
                  <Icon :icon="isGeneratingAkses ? 'lucide:loader-2' : 'lucide:sparkles'" class="size-4" :class="isGeneratingAkses ? 'animate-spin' : ''" />
                </button>
              </div>
              <button @click="addAkses" type="button" class="size-11 bg-slate-800 text-white rounded-xl shadow-lg hover:bg-black transition-all flex items-center justify-center active:scale-95 shrink-0">
                <Icon icon="lucide:plus" class="size-5" />
              </button>
            </div>
          </BaseFormGroup>
          
          <div class="flex flex-wrap gap-2 -mt-1 mb-4">
            <span v-for="(a, i) in form.Akses_Jalan" :key="i" class="bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-500 px-3 py-1.5 rounded-lg flex items-center gap-2 group hover:border-red-200 hover:bg-red-50 transition-colors">
              {{ a }}
              <Icon @click="form.Akses_Jalan.splice(i, 1)" icon="lucide:x" class="size-3 text-red-500 cursor-pointer" />
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.field-input {
  @apply w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium;
}
.custom-scroll { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
.custom-scroll::-webkit-scrollbar { height: 4px; width: 4px; }
.custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
.scale-in { animation: scale-in 0.2s ease-out; }
@keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

/* Styling untuk New Place Autocomplete Web Component */
#place-autocomplete-container :deep(gmpx-place-autocomplete),
#place-autocomplete-container :deep(gmp-place-autocomplete) {
  --gmpx-autocomplete-menu-background: #ffffff !important;
  --gmpx-autocomplete-menu-color: #1e293b !important;
  --gmpx-autocomplete-prediction-hover-background: #f1f5f9 !important;
  --gmpx-autocomplete-prediction-primary-color: #1e293b !important;
  --gmpx-autocomplete-prediction-secondary-color: #64748b !important;
  color-scheme: light !important;
  background-color: white !important;
  width: 100%;
}

#place-autocomplete-container :deep(gmpx-place-autocomplete::part(list)),
#place-autocomplete-container :deep(gmp-place-autocomplete::part(list)) {
  background-color: white !important;
  color: #1e293b !important;
  border-radius: 1rem;
  border: 1px solid #f1f5f9;
  box-shadow:
    0 20px 25px -5px rgb(0 0 0 / 0.1),
    0 8px 10px -6px rgb(0 0 0 / 0.1);
  margin-top: 0.5rem;
  overflow: hidden;
}

#place-autocomplete-container :deep(gmpx-place-autocomplete::part(prediction)),
#place-autocomplete-container :deep(gmp-place-autocomplete::part(prediction)) {
  background-color: white !important;
  color: #1e293b !important;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f8fafc;
  cursor: pointer;
}

#place-autocomplete-container :deep(gmpx-place-autocomplete::part(input)),
#place-autocomplete-container :deep(gmp-place-autocomplete::part(input)) {
  width: 100% !important;
  background-color: white !important;
  color: #1e293b !important;
  color-scheme: light !important;
  border: 2px solid #f1f5f9 !important;
  border-radius: 0.75rem !important;
  padding-top: 0.625rem !important;
  padding-bottom: 0.625rem !important;
  padding-left: 2.75rem !important;
  padding-right: 1rem !important;
  font-size: 0.875rem !important;
  font-weight: 700 !important;
  transition: all 0.2s !important;
  outline: none !important;
}

#place-autocomplete-container :deep(gmpx-place-autocomplete::part(input):focus),
#place-autocomplete-container :deep(gmp-place-autocomplete::part(input):focus) {
  background-color: white !important;
  border-color: #f59e0b !important; /* Bejo Orange/Amber */
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1) !important;
}

#place-autocomplete-container :deep(input:focus) {
  background-color: white !important;
  border-color: #f59e0b !important;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1) !important;
}

/* Google Maps Autocomplete Dropdown Optimization */
.pac-container {
  z-index: 10000 !important;
  border-radius: 1rem !important;
  border: 1px solid #f1f5f9 !important;
  box-shadow:
    0 20px 25px -5px rgb(0 0 0 / 0.1),
    0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
  margin-top: 0.5rem !important;
  font-family: inherit !important;
}

.pac-item {
  padding: 0.75rem 1rem !important;
  border-top: 1px solid #f1f5f9 !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
}

.pac-item:first-child {
  border-top: none !important;
}

.pac-item:hover {
  background-color: #f8fafc !important;
}

.pac-icon {
  margin-right: 0.75rem !important;
}

.pac-item-query {
  font-size: 0.875rem !important;
  color: #1e293b !important;
  font-weight: 600 !important;
}

.pac-matched {
  color: var(--p-primary) !important;
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.scale-in {
  animation: scale-in 0.2s ease-out;
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
