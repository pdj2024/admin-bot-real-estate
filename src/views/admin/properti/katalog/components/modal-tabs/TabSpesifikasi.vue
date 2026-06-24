<script setup lang="ts">
import { inject, ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import BaseFormGroup from '@/components/common/BaseFormGroup.vue'

const state = inject<any>('propertyModalState')
if (!state) {
  throw new Error('TabSpesifikasi must be used within a component providing propertyModalState')
}

const { form, panjang, lebar, newAkses } = state

const specs = [
  { key: 'Jumlah_Carpot', label: 'Carport', icon: 'lucide:car' },
  { key: 'Row_Jalan', label: 'Row Jalan (Mobil)', icon: 'lucide:road' },
  { key: 'Daya_Listrik', label: 'Listrik (W)', icon: 'lucide:zap' }
] as const

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

const handleInputCurrency = (event: Event, field: 'Harga_Jual1' | 'Harga_Jual2' | 'Harga_Sewa1' | 'Harga_Sewa2') => {
  const input = event.target as HTMLInputElement
  const numericString = input.value.replace(/\D/g, '')
  if (!numericString) {
    form.value[field] = 0
    input.value = ''
    return
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

// Dropdowns State
const dropdownHadapRef = ref<HTMLElement | null>(null)
const dropdownPosisiRef = ref<HTMLElement | null>(null)
const dropdownSatuanRef = ref<HTMLElement | null>(null)

const menuHadapRef = ref<HTMLElement | null>(null)
const menuPosisiRef = ref<HTMLElement | null>(null)
const menuSatuanRef = ref<HTMLElement | null>(null)

const dropdownStyles = ref({ hadap: {}, posisi: {}, satuan: {} })

const isHadapOpen = ref(false)
const isPosisiOpen = ref(false)
const isSatuanOpen = ref(false)

const searchHadap = ref('')
const searchPosisi = ref('')

const hadapOptions = [
  { value: 'Utara', label: 'Utara' },
  { value: 'Timur', label: 'Timur' },
  { value: 'Selatan', label: 'Selatan' },
  { value: 'Barat', label: 'Barat' },
  { value: 'Timur Laut', label: 'Timur Laut' },
  { value: 'Tenggara', label: 'Tenggara' },
  { value: 'Barat Daya', label: 'Barat Daya' },
  { value: 'Barat Laut', label: 'Barat Laut' }
]

const posisiOptions = [
  { value: 'Normal', label: 'Normal' },
  { value: 'Hook', label: 'Hook' },
  { value: 'Tusuk Sate', label: 'Tusuk Sate' }
]

const satuanOptions = [
  { value: 'Bulan', label: 'Bulan' },
  { value: 'Tahun', label: 'Tahun' }
]

const filteredHadapOptions = computed(() => {
  if (!searchHadap.value) return hadapOptions
  return hadapOptions.filter(o => o.label.toLowerCase().includes(searchHadap.value.toLowerCase()))
})

const filteredPosisiOptions = computed(() => {
  if (!searchPosisi.value) return posisiOptions
  return posisiOptions.filter(o => o.label.toLowerCase().includes(searchPosisi.value.toLowerCase()))
})

const updateDropdownStyles = (type: 'hadap' | 'posisi' | 'satuan') => {
  let targetRef = null
  if (type === 'hadap') targetRef = dropdownHadapRef.value
  else if (type === 'posisi') targetRef = dropdownPosisiRef.value
  else if (type === 'satuan') targetRef = dropdownSatuanRef.value

  if (targetRef) {
    const rect = (targetRef as any).$el.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const dropdownHeight = 240 // estimated max height
    
    if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
      // Buka ke atas
      dropdownStyles.value[type] = {
        bottom: `${window.innerHeight - rect.top + 8}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        top: 'auto'
      }
    } else {
      // Buka ke bawah
      dropdownStyles.value[type] = {
        top: `${rect.bottom + 8}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        bottom: 'auto'
      }
    }
  }
}

const toggleHadap = () => {
  isHadapOpen.value = !isHadapOpen.value
  if (isHadapOpen.value) {
    isPosisiOpen.value = false
    isSatuanOpen.value = false
    nextTick(() => updateDropdownStyles('hadap'))
  }
}

const togglePosisi = () => {
  isPosisiOpen.value = !isPosisiOpen.value
  if (isPosisiOpen.value) {
    isHadapOpen.value = false
    isSatuanOpen.value = false
    nextTick(() => updateDropdownStyles('posisi'))
  }
}

const toggleSatuan = () => {
  isSatuanOpen.value = !isSatuanOpen.value
  if (isSatuanOpen.value) {
    isHadapOpen.value = false
    isPosisiOpen.value = false
    nextTick(() => updateDropdownStyles('satuan'))
  }
}

const selectHadap = (value: string) => {
  form.value.Hadap_Rumah = value
  searchHadap.value = ''
  isHadapOpen.value = false
}

const selectPosisi = (value: string) => {
  form.value.Posisi_Properti = value
  searchPosisi.value = ''
  isPosisiOpen.value = false
}

const selectSatuan = (value: string) => {
  form.value.Satuan_Minimal_Sewa = value as any
  isSatuanOpen.value = false
}

const getHadapLabel = (value: string) => {
  const opt = hadapOptions.find(o => o.value === value)
  return opt ? opt.label : ''
}

const getPosisiLabel = (value: string) => {
  const opt = posisiOptions.find(o => o.value === value)
  return opt ? opt.label : ''
}

const getSatuanLabel = (value: string) => {
  const opt = satuanOptions.find(o => o.value === value)
  return opt ? opt.label : ''
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  if (dropdownHadapRef.value && !(dropdownHadapRef.value as any).$el.contains(target) && !menuHadapRef.value?.contains(target)) {
    isHadapOpen.value = false
  }
  if (dropdownPosisiRef.value && !(dropdownPosisiRef.value as any).$el.contains(target) && !menuPosisiRef.value?.contains(target)) {
    isPosisiOpen.value = false
  }
  if (dropdownSatuanRef.value && !(dropdownSatuanRef.value as any).$el.contains(target) && !menuSatuanRef.value?.contains(target)) {
    isSatuanOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="space-y-8 scale-in pb-10">
    <div class="space-y-8">
      <div class="space-y-6">
        <div class="flex items-center gap-10 pb-2 border-b border-slate-100">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opsi Transaksi</label>
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
              <input type="text" :value="form.Harga_Jual1 ? formatCurrency(form.Harga_Jual1) : ''" @input="handleInputCurrency($event, 'Harga_Jual1')" class="field-input !pl-11" placeholder="Harga awal" />
            </BaseFormGroup>
            <BaseFormGroup label="HARGA JUAL DISKON (RP)" icon="lucide:percent">
              <input type="text" :value="form.Harga_Jual2 ? formatCurrency(form.Harga_Jual2) : ''" @input="handleInputCurrency($event, 'Harga_Jual2')" class="field-input !pl-11 text-emerald-600 bg-emerald-50/5 border-emerald-100" placeholder="Harga promo" />
            </BaseFormGroup>
          </div>

          <!-- Sewa Section -->
          <div v-if="form.Status_Transaksi.includes('Sewa')" class="space-y-4 scale-in">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseFormGroup label="HARGA SEWA AWAL (RP)" icon="lucide:calendar-check" required>
                <div class="flex items-center gap-2">
                  <input type="text" :value="form.Harga_Sewa1 ? formatCurrency(form.Harga_Sewa1) : ''" @input="handleInputCurrency($event, 'Harga_Sewa1')" class="field-input !pl-11 flex-1" placeholder="Harga sewa" />
                  <span class="text-[9px] font-black text-slate-400 uppercase">/ {{ form.Satuan_Minimal_Sewa === 'Bulan' ? 'BLN' : 'THN' }}</span>
                </div>
              </BaseFormGroup>
              <BaseFormGroup label="HARGA SEWA PROMO (RP)" icon="lucide:badge-percent">
                <div class="flex items-center gap-2">
                  <input type="text" :value="form.Harga_Sewa2 ? formatCurrency(form.Harga_Sewa2) : ''" @input="handleInputCurrency($event, 'Harga_Sewa2')" class="field-input !pl-11 text-blue-600 bg-blue-50/5 border-blue-100 flex-1" placeholder="Diskon" />
                  <span class="text-[9px] font-black text-slate-400 uppercase">/ {{ form.Satuan_Minimal_Sewa === 'Bulan' ? 'BLN' : 'THN' }}</span>
                </div>
              </BaseFormGroup>
            </div>

            <div v-if="form.Ada_Minimal_Sewa" class="grid grid-cols-1 md:grid-cols-2 gap-6 scale-in">
              <BaseFormGroup label="MINIMAL SEWA" icon="lucide:clock">
                <input v-model="form.Minimal_Sewa" type="number" class="field-input !pl-11" />
              </BaseFormGroup>
              <BaseFormGroup label="SATUAN" icon="lucide:timer" ref="dropdownSatuanRef">
                <button @click="toggleSatuan" type="button" class="field-input h-11 !pl-11 flex items-center justify-between group bg-white border-slate-200">
                  <span class="text-xs font-bold" :class="form.Satuan_Minimal_Sewa ? 'text-slate-700' : 'text-slate-300'">
                    {{ form.Satuan_Minimal_Sewa ? getSatuanLabel(form.Satuan_Minimal_Sewa) : 'Pilih Satuan' }}
                  </span>
                  <Icon icon="lucide:chevron-down" class="size-4 text-slate-400 group-hover:text-bejo-600 transition-transform" :class="isSatuanOpen ? 'rotate-180' : ''" />
                </button>
                <Teleport to="body">
                  <div v-if="isSatuanOpen" ref="menuSatuanRef" class="fixed z-[1000] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden scale-in" :style="dropdownStyles.satuan">
                    <div class="max-h-60 overflow-y-auto custom-scroll py-1">
                      <button v-for="opt in satuanOptions" :key="opt.value" @click="selectSatuan(opt.value)" type="button" class="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between uppercase tracking-wide">
                        <span>{{ opt.label }}</span>
                        <Icon v-if="form.Satuan_Minimal_Sewa === opt.value" icon="lucide:check" class="size-4 text-bejo-600" />
                      </button>
                    </div>
                  </div>
                </Teleport>
              </BaseFormGroup>
            </div>
          </div>

          <BaseFormGroup label="AKSESIBILITAS" icon="lucide:road">
            <div class="flex gap-2">
              <div class="relative flex-1">
                <input v-model="newAkses" @keyup.enter="addAkses" placeholder="Ketik akses (e.g. 5 min ke tol)..." class="field-input !pl-11 w-full" />
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
      <div class="space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseFormGroup label="LUAS TANAH (M²)" icon="lucide:land-plot" required>
            <input v-model="form.Luas_Tanah" type="number" class="field-input !pl-11" placeholder="0" />
          </BaseFormGroup>
          <BaseFormGroup label="LUAS BANGUNAN (M²)" icon="lucide:building-2" required>
            <input v-model="form.Luas_Bangunan" type="number" class="field-input !pl-11" placeholder="0" />
          </BaseFormGroup>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseFormGroup label="JUMLAH LANTAI" icon="lucide:layers">
            <input v-model="form.Jumlah_Lantai" type="number" class="field-input !pl-11" placeholder="0" />
          </BaseFormGroup>
          <BaseFormGroup label="DIMENSI (L X P)" icon="lucide:ruler">
            <div class="flex items-center gap-2">
              <input v-model="lebar" placeholder="L" class="field-input text-center !px-2 flex-1" />
              <span class="text-slate-300 font-bold">×</span>
              <input v-model="panjang" placeholder="P" class="field-input text-center !px-2 flex-1" />
            </div>
          </BaseFormGroup>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseFormGroup label="ARAH HADAP" icon="lucide:compass" ref="dropdownHadapRef">
            <button @click="toggleHadap" type="button" class="field-input h-11 !pl-11 flex items-center justify-between group bg-white border-slate-200">
              <span class="text-xs font-bold" :class="form.Hadap_Rumah ? 'text-slate-700' : 'text-slate-300'">
                {{ form.Hadap_Rumah ? getHadapLabel(form.Hadap_Rumah) : 'Pilih Arah Hadap' }}
              </span>
              <Icon icon="lucide:chevron-down" class="size-4 text-slate-400 group-hover:text-bejo-600 transition-transform" :class="isHadapOpen ? 'rotate-180' : ''" />
            </button>
            <Teleport to="body">
              <div v-if="isHadapOpen" ref="menuHadapRef" class="fixed z-[1000] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden scale-in" :style="dropdownStyles.hadap">
                <div class="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                  <div class="relative">
                    <Icon icon="lucide:search" class="absolute left-0 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <input v-model="searchHadap" placeholder="CARI ARAH HADAP..." class="w-full bg-transparent pl-6 border-none text-[10px] font-black focus:ring-0 placeholder:text-slate-400 text-slate-700 uppercase tracking-widest" />
                  </div>
                </div>
                <div class="max-h-60 overflow-y-auto custom-scroll py-1">
                  <button v-for="opt in filteredHadapOptions" :key="opt.value" @click="selectHadap(opt.value)" type="button" class="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between uppercase tracking-wide">
                    <span>{{ opt.label }}</span>
                    <Icon v-if="form.Hadap_Rumah === opt.value" icon="lucide:check" class="size-4 text-bejo-600" />
                  </button>
                </div>
              </div>
            </Teleport>
          </BaseFormGroup>
          <BaseFormGroup label="POSISI PROPERTI" icon="lucide:layers-2" ref="dropdownPosisiRef">
            <button @click="togglePosisi" type="button" class="field-input h-11 !pl-11 flex items-center justify-between group bg-white border-slate-200">
              <span class="text-xs font-bold" :class="form.Posisi_Properti ? 'text-slate-700' : 'text-slate-300'">
                {{ form.Posisi_Properti ? getPosisiLabel(form.Posisi_Properti) : 'Pilih Posisi' }}
              </span>
              <Icon icon="lucide:chevron-down" class="size-4 text-slate-400 group-hover:text-bejo-600 transition-transform" :class="isPosisiOpen ? 'rotate-180' : ''" />
            </button>
            <Teleport to="body">
              <div v-if="isPosisiOpen" ref="menuPosisiRef" class="fixed z-[1000] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden scale-in" :style="dropdownStyles.posisi">
                <div class="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                  <div class="relative">
                    <Icon icon="lucide:search" class="absolute left-0 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <input v-model="searchPosisi" placeholder="CARI POSISI..." class="w-full bg-transparent pl-6 border-none text-[10px] font-black focus:ring-0 placeholder:text-slate-400 text-slate-700 uppercase tracking-widest" />
                  </div>
                </div>
                <div class="max-h-60 overflow-y-auto custom-scroll py-1">
                  <button v-for="opt in filteredPosisiOptions" :key="opt.value" @click="selectPosisi(opt.value)" type="button" class="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between uppercase tracking-wide">
                    <span>{{ opt.label }}</span>
                    <Icon v-if="form.Posisi_Properti === opt.value" icon="lucide:check" class="size-4 text-bejo-600" />
                  </button>
                </div>
              </div>
            </Teleport>
          </BaseFormGroup>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <BaseFormGroup label="JUMLAH KT" icon="lucide:bed">
            <div class="flex items-center gap-2 pl-[38px] relative">
              <Icon icon="lucide:bed" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input v-model="form.Jumlah_Kamar_Tidur" type="number" class="field-input text-center !px-2 flex-1" placeholder="Utama" />
              <span class="text-slate-300 font-bold">+</span>
              <input v-model="form.Jumlah_Kamar_Tidur_Tambahan" type="number" class="field-input text-center !px-2 flex-1" placeholder="Tambahan" />
            </div>
          </BaseFormGroup>
          <BaseFormGroup label="JUMLAH KM" icon="lucide:bath">
            <div class="flex items-center gap-2 pl-[38px] relative">
              <Icon icon="lucide:bath" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input v-model="form.Jumlah_Kamar_Mandi" type="number" class="field-input text-center !px-2 flex-1" placeholder="Utama" />
              <span class="text-slate-300 font-bold">+</span>
              <input v-model="form.Jumlah_Kamar_Mandi_Tambahan" type="number" class="field-input text-center !px-2 flex-1" placeholder="Tambahan" />
            </div>
          </BaseFormGroup>
          <BaseFormGroup v-for="s in specs" :key="s.key" :label="s.label.toUpperCase()" :icon="s.icon">
            <input v-model="form[s.key]" type="number" :step="s.key === 'Row_Jalan' ? '0.1' : '1'" class="field-input !pl-11" :placeholder="s.key === 'Row_Jalan' ? '0.0' : '0'" />
          </BaseFormGroup>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

/* Hide number input spin buttons */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}

.label {
  @apply block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1;
}

.field-input {
  @apply w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium;
}
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}
.custom-scroll::-webkit-scrollbar {
  height: 4px;
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 20px;
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
  border-color: var(--color-bejo-600) !important;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-bejo-600) 10%, transparent) !important;
}

#place-autocomplete-container :deep(input:focus) {
  background-color: white !important;
  border-color: var(--color-bejo-600) !important;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-bejo-600) 10%, transparent) !important;
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
