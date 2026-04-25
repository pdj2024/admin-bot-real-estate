<script setup lang="ts">
import { inject, ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import BaseFormGroup from '@/components/common/BaseFormGroup.vue'
import GoogleMapsPicker from '@/components/common/GoogleMapsPicker.vue'

const state = inject<any>('propertyModalState')
if (!state) {
  throw new Error('TabIdentitasUtama must be used within a component providing propertyModalState')
}

const {
  form,
  previewPhotos,
  handlePhoto,
  removePhoto,
  searchQuery,
  handleSearchInput,
  isPredictionsOpen,
  predictions,
  selectPrediction,
  isDetectingArea,
  isGeocoding,
  aiError,
  detectedKota
} = state

const scrollContainer = ref<HTMLElement | null>(null)

// Dropdown Common State
const dropdownTypeRef = ref<HTMLElement | null>(null)
const dropdownCertRef = ref<HTMLElement | null>(null)
const dropdownWilayahRef = ref<HTMLElement | null>(null)
const dropdownStyles = ref({ type: {}, cert: {}, wilayah: {} })

const isTypeOpen = ref(false)
const types = ['Rumah', 'Tanah', 'Ruko', 'Apartemen', 'Gudang', 'Villa', 'SOHO', 'Pabrik', 'Perkantoran', 'Hotel', 'Rumah Kos', 'Stand', 'Toko', 'Gedung', 'Condotel', 'Lain-lain']

const isCertOpen = ref(false)
const isWilayahOpen = ref(false)

const cardinalDirections = ['Pusat', 'Utara', 'Timur', 'Selatan', 'Barat']
const wilayahOptions = computed(() => {
  const city = detectedKota.value || 'Surabaya'
  return cardinalDirections.map(dir => `${city} ${dir}`)
})

const updateDropdownStyles = (type: 'type' | 'cert' | 'wilayah') => {
  let targetRef = null
  if (type === 'type') targetRef = dropdownTypeRef.value
  else if (type === 'cert') targetRef = dropdownCertRef.value
  else if (type === 'wilayah') targetRef = dropdownWilayahRef.value

  if (targetRef) {
    const rect = (targetRef as any).$el.getBoundingClientRect()
    dropdownStyles.value[type] = {
      top: `${rect.bottom + 8}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`
    }
  }
}

const toggleType = () => {
  isTypeOpen.value = !isTypeOpen.value
  if (isTypeOpen.value) {
    isCertOpen.value = false
    isWilayahOpen.value = false
    nextTick(() => updateDropdownStyles('type'))
  }
}

const toggleCert = () => {
  isCertOpen.value = !isCertOpen.value
  if (isCertOpen.value) {
    isTypeOpen.value = false
    isWilayahOpen.value = false
    nextTick(() => updateDropdownStyles('cert'))
  }
}

const toggleWilayah = () => {
  isWilayahOpen.value = !isWilayahOpen.value
  if (isWilayahOpen.value) {
    isTypeOpen.value = false
    isCertOpen.value = false
    nextTick(() => updateDropdownStyles('wilayah'))
  }
}

const selectType = (type: string) => {
  form.value.Tipe = type
  isTypeOpen.value = false
}

// Certificate Dropdown State
const searchCert = ref('')
const certificates = ['SHM', 'SHGB', 'HGU', 'HP', 'HMRS', 'Girik', 'Petok D', 'AJB', 'PPJB', 'Surat Ijo', 'Strata Title', 'Lainnya']
const filteredCertificates = computed(() => {
  if (!searchCert.value) return certificates
  return certificates.filter((c) => c.toLowerCase().includes(searchCert.value.toLowerCase()))
})

const selectCertificate = (type: string) => {
  form.value.Jenis_Sertifikat = type
  searchCert.value = ''
  isCertOpen.value = false
}

const selectWilayah = (val: string) => {
  form.value.Area[1] = val
  isWilayahOpen.value = false
}

const onPhotoChange = (event: Event) => {
  handlePhoto(event, scrollContainer.value)
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownTypeRef.value && !(dropdownTypeRef.value as any).$el.contains(event.target as Node)) isTypeOpen.value = false
  if (dropdownCertRef.value && !(dropdownCertRef.value as any).$el.contains(event.target as Node)) isCertOpen.value = false
  if (dropdownWilayahRef.value && !(dropdownWilayahRef.value as any).$el.contains(event.target as Node)) isWilayahOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start scale-in">
    <div class="space-y-8 flex flex-col">
      <div class="field">
        <label class="label mb-2">STATUS KATALOG</label>
        <div class="toggle-box">
          <div>
            <span class="text-xs font-bold text-slate-700 block">{{ form.Status_Display === 'Aktif' ? 'Aktif' : 'Tidak Aktif' }}</span>
            <span class="text-[10px] font-medium mt-0.5 block" :class="form.Status_Display === 'Aktif' ? 'text-primary' : 'text-slate-400'">
              {{ form.Status_Display === 'Aktif' ? 'Properti ini dapat dilihat oleh tamu' : 'Properti disembunyikan dari katalog' }}
            </span>
          </div>
          <button type="button" class="toggle shrink-0" :class="{ 'toggle-active': form.Status_Display === 'Aktif' }" @click="form.Status_Display = form.Status_Display === 'Aktif' ? 'Nonaktif' : 'Aktif'">
            <span class="toggle-circle" :class="{ 'translate-x-6': form.Status_Display === 'Aktif' }"></span>
          </button>
        </div>
      </div>

      <div class="space-y-3 mb-2">
        <label class="label block text-xs">GALERI GAMBAR PRODUK</label>
        <div ref="scrollContainer" class="preview-container flex flex-nowrap gap-4 overflow-x-auto pb-4 custom-scroll">
          <template v-if="previewPhotos.length >= 1">
            <div v-for="(img, i) in previewPhotos" :key="i" class="preview-box relative size-28 flex-shrink-0">
              <img :src="img.Url || img.Id_Media" class="size-full object-cover rounded-2xl border border-slate-200 shadow-sm" />
              <button @click="removePhoto(i)" type="button" class="absolute top-2 right-2 size-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors border-2 border-white">
                <Icon icon="lucide:x" class="size-3" />
              </button>
            </div>
          </template>

          <label class="size-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-shrink-0 flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-primary/50 transition-all text-slate-400 group">
            <Icon icon="lucide:plus" class="size-6 group-hover:text-primary transition-colors" />
            <span class="text-[10px] font-bold mt-1 group-hover:text-primary">TAMBAH</span>
            <input type="file" multiple hidden @change="onPhotoChange" accept="image/*,video/*" />
          </label>

          <div v-if="!previewPhotos.length" class="flex items-center h-24 px-6 border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 text-[10px] font-bold uppercase tracking-widest italic bg-slate-50/30">Belum ada foto terpilih</div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseFormGroup label="TIPE PROPERTI" icon="lucide:building-2" required ref="dropdownTypeRef">
            <button @click="toggleType" type="button" class="field-input h-11 !pl-9 flex items-center justify-between group">
              <span class="font-bold" :class="form.Tipe ? 'text-slate-700' : 'text-slate-300'">{{ form.Tipe || 'Pilih Tipe' }}</span>
              <Icon icon="lucide:chevron-down" class="size-4 text-slate-400 group-hover:text-primary transition-transform" :class="isTypeOpen ? 'rotate-180' : ''" />
            </button>
            <Teleport to="body">
              <div v-if="isTypeOpen" class="fixed z-[1000] bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden scale-in" :style="dropdownStyles.type">
                <div class="max-h-60 overflow-y-auto p-2 custom-scroll flex flex-col min-w-[200px]">
                  <button v-for="t in types" :key="t" @click="selectType(t)" type="button" class="group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all hover:bg-slate-50 hover:text-primary">
                    {{ t }}
                    <Icon v-if="form.Tipe === t" icon="lucide:check" class="size-4 text-primary" />
                  </button>
                </div>
              </div>
            </Teleport>
          </BaseFormGroup>

          <BaseFormGroup label="JENIS SERTIFIKAT" icon="lucide:shield-check" required ref="dropdownCertRef">
            <button @click="toggleCert" type="button" class="field-input h-11 !pl-9 flex items-center justify-between group">
              <span class="font-bold" :class="form.Jenis_Sertifikat ? 'text-slate-700' : 'text-slate-300'">{{ form.Jenis_Sertifikat || 'Pilih Sertifikat' }}</span>
              <Icon icon="lucide:chevron-down" class="size-4 text-slate-400 group-hover:text-primary transition-transform" :class="isCertOpen ? 'rotate-180' : ''" />
            </button>
            <Teleport to="body">
              <div v-if="isCertOpen" class="fixed z-[1000] bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden scale-in" :style="dropdownStyles.cert">
                <div class="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                  <div class="relative">
                    <Icon icon="lucide:search" class="absolute left-0 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <input v-model="searchCert" placeholder="Cari sertifikat..." class="w-full bg-transparent pl-6 border-none text-[10px] font-bold focus:ring-0 placeholder:text-slate-400 text-slate-700" />
                  </div>
                </div>
                <div class="max-h-60 overflow-y-auto p-2 custom-scroll flex flex-col min-w-[200px]">
                  <button v-for="s in filteredCertificates" :key="s" @click="selectCertificate(s)" type="button" class="group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all hover:bg-slate-50 hover:text-primary">
                    {{ s }}
                    <Icon v-if="form.Jenis_Sertifikat === s" icon="lucide:check" class="size-4 text-primary" />
                  </button>
                </div>
              </div>
            </Teleport>
          </BaseFormGroup>
        </div>

        <BaseFormGroup label="NAMA PROPERTI" icon="lucide:home" required>
          <input v-model="form.Nama_Produk" placeholder="Contoh: The Sapphire Sky Mansion" class="field-input !pl-10" />
        </BaseFormGroup>

        <BaseFormGroup label="URL SLUG" icon="lucide:link">
          <input v-model="form.Slug" readonly class="field-input !pl-10 bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed" />
        </BaseFormGroup>
        
        <BaseFormGroup label="DESKRIPSI PROPERTI" icon="lucide:text-quote" align-icon="top">
          <div class="relative">
            <textarea v-model="form.Keterangan" maxlength="200" rows="6" class="field-input !pl-10 pt-3 resize-none leading-relaxed" placeholder="Ceritakan kelebihan unit ini..."></textarea>
            <div class="absolute bottom-3 right-3 text-[9px] font-black text-slate-400 bg-white/80 px-2 py-1 rounded-md backdrop-blur-sm border border-slate-100">
              {{ form.Keterangan?.length || 0 }}/200
            </div>
          </div>
        </BaseFormGroup>
      </div>
    </div>

    <div class="space-y-8 flex flex-col lg:pl-10 lg:border-l lg:border-slate-100">
      <div class="space-y-6 text-slate-800">
        <div class="flex items-center justify-between mb-1">
          <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">Lokasi & Peta <span class="text-red-500">*</span></label>
          <label class="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">
            <input type="checkbox" v-model="form.Hide_alamat" class="size-3.5 rounded border-slate-200 text-primary" />
            Sembunyikan Alamat?
          </label>
        </div>

        <div class="space-y-4">
          <!-- Search Place -->
          <BaseFormGroup icon="lucide:search">
            <input v-model="searchQuery" @input="handleSearchInput" @focus="isPredictionsOpen = predictions.length > 0" placeholder="Cari lokasi properti..." class="field-input h-11 !pl-10" />
            
            <!-- Search Results Dropdown -->
            <div v-if="isPredictionsOpen && predictions.length" class="absolute top-full left-0 mt-2 w-full z-[100] bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden scale-in">
              <div class="max-h-60 overflow-y-auto p-2 custom-scroll flex flex-col">
                <button v-for="p in predictions" :key="p.placeId" @mousedown="selectPrediction(p)" type="button" class="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors rounded-lg group">
                  <div class="flex items-start gap-3">
                    <Icon icon="lucide:map-pin" class="size-4 mt-0.5 text-slate-400 group-hover:text-primary transition-colors" />
                    <div class="flex-1">
                      <span class="text-xs font-black text-slate-700 block leading-tight">{{ p.mainText }}</span>
                      <span class="text-[10px] font-bold text-slate-400 block mt-0.5" v-if="p.secondaryText">{{ p.secondaryText }}</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </BaseFormGroup>

          <GoogleMapsPicker />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseFormGroup label="WILAYAH (KOTA/KAB)" icon="lucide:map" ref="dropdownWilayahRef">
              <div class="relative group">
                <button @click="toggleWilayah" type="button" class="field-input h-11 !pl-10 flex items-center justify-between" :class="aiError ? 'border-red-200 bg-red-50/30' : 'bg-slate-50 border-slate-100'">
                  <span class="font-bold text-slate-700 truncate mr-2">{{ form.Area[1] || 'Pilih Wilayah...' }}</span>
                  <div class="flex items-center gap-2 shrink-0">
                    <Icon v-if="aiError" icon="lucide:alert-circle" class="size-3.5 text-red-500" />
                    <Icon icon="lucide:chevron-down" class="size-4 text-slate-400 group-hover:text-primary transition-transform" :class="isWilayahOpen ? 'rotate-180' : ''" />
                  </div>
                </button>
                
                <div v-if="isDetectingArea" class="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Icon icon="lucide:loader-2" class="size-3 animate-spin text-primary" />
                  <span class="text-[8px] font-black text-primary animate-pulse">AI</span>
                </div>

                <Teleport to="body">
                  <div v-if="isWilayahOpen" class="fixed z-[1000] bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden scale-in" :style="dropdownStyles.wilayah">
                    <div class="p-2 border-b border-slate-50 bg-slate-50/50">
                      <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Pilih Manual ({{ detectedKota || 'Kota' }})</span>
                    </div>
                    <div class="max-h-60 overflow-y-auto p-2 custom-scroll flex flex-col min-w-[200px]">
                      <button v-for="w in wilayahOptions" :key="w" @click="selectWilayah(w)" type="button" class="group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all hover:bg-slate-50 hover:text-primary">
                        {{ w }}
                        <Icon v-if="form.Area[1] === w" icon="lucide:check" class="size-4 text-primary" />
                      </button>
                    </div>
                  </div>
                </Teleport>
              </div>
            </BaseFormGroup>
            
            <BaseFormGroup label="KECAMATAN, KELURAHAN" icon="lucide:navigation">
              <div class="relative">
                <input v-model="form.Area[0]" placeholder="..." class="field-input !pl-10 h-11" />
                <div v-if="isGeocoding" class="absolute right-3 top-1/2 -translate-y-1/2">
                  <Icon icon="lucide:loader-2" class="size-3 animate-spin text-slate-400" />
                </div>
              </div>
            </BaseFormGroup>
          </div>

          <BaseFormGroup label="ALAMAT DETAIL" icon="lucide:map-pin" align-icon="top">
            <textarea v-model="form.Alamat" rows="2" class="field-input !pl-10 pt-2.5 resize-none leading-relaxed" placeholder="Nama jalan, nomor rumah, blok..."></textarea>
          </BaseFormGroup>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.label { @apply block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1; }
.field { @apply space-y-1.5; }
.field-input {
  @apply w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium;
}
.custom-scroll { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
.custom-scroll::-webkit-scrollbar { height: 4px; width: 4px; }
.custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
.toggle-box { @apply w-full flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50/50; }
.toggle { @apply w-12 h-6 bg-slate-200 rounded-full relative transition-all duration-300; }
.toggle-active { @apply bg-primary; }
.toggle-circle { @apply absolute top-1 left-1 size-4 bg-card rounded-full transition-all duration-300 shadow-sm; }
.scale-in { animation: scale-in 0.2s ease-out; }
@keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>
