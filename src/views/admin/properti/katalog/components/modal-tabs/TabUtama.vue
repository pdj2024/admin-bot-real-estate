<script setup lang="ts">
import { inject, ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import BaseFormGroup from '@/components/common/BaseFormGroup.vue'

const state = inject<any>('propertyModalState')
if (!state) {
  throw new Error('TabUtama must be used within a component providing propertyModalState')
}

const { form } = state

const dropdownTypeRef = ref<HTMLElement | null>(null)
const dropdownCertRef = ref<HTMLElement | null>(null)
const menuTypeRef = ref<HTMLElement | null>(null)
const menuCertRef = ref<HTMLElement | null>(null)
const dropdownStyles = ref({ type: {}, cert: {} })

const isTypeOpen = ref(false)
const searchType = ref('')
const types = ['Rumah', 'Tanah', 'Ruko', 'Apartemen', 'Gudang', 'Villa', 'SOHO', 'Pabrik', 'Perkantoran', 'Hotel', 'Rumah Kos', 'Stand', 'Toko', 'Gedung', 'Condotel', 'Lain-lain']
const filteredTypes = computed(() => {
  if (!searchType.value) return types
  return types.filter((t) => t.toLowerCase().includes(searchType.value.toLowerCase()))
})

const isCertOpen = ref(false)

const updateDropdownStyles = (type: 'type' | 'cert') => {
  let targetRef = null
  if (type === 'type') targetRef = dropdownTypeRef.value
  else if (type === 'cert') targetRef = dropdownCertRef.value

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
    nextTick(() => updateDropdownStyles('type'))
  }
}

const toggleCert = () => {
  isCertOpen.value = !isCertOpen.value
  if (isCertOpen.value) {
    isTypeOpen.value = false
    nextTick(() => updateDropdownStyles('cert'))
  }
}

const selectType = (type: string) => {
  form.value.Tipe = type
  searchType.value = ''
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

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node

  // Check if click is outside trigger AND outside teleported menu
  if (dropdownTypeRef.value && !(dropdownTypeRef.value as any).$el.contains(target) && !menuTypeRef.value?.contains(target)) {
    isTypeOpen.value = false
  }
  if (dropdownCertRef.value && !(dropdownCertRef.value as any).$el.contains(target) && !menuCertRef.value?.contains(target)) {
    isCertOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
const currentHost = window.location.host
</script>

<template>
  <div class="grid grid-cols-1 gap-8 items-stretch h-full">
    <div class="space-y-6">
      <!-- Sembunyikan toggle draft jika sudah Terjual/Tersewa -->
      <div v-if="form.No_Id && form.Status_Properti !== 'Terjual' && form.Status_Properti !== 'Tersewa'" class="field">
        <label class="label mb-2">TAMPILKAN KATALOG</label>
        <div class="toggle-box">
          <div>
            <span class="text-xs font-black text-slate-700 block uppercase tracking-wide">{{ form.Status_Display == 'Aktif' ? 'Tampil' : 'Draft' }}</span>
            <span class="text-[10px] font-bold mt-0.5 block" :class="form.Status_Display === 'Aktif' ? 'text-bejo-600' : 'text-slate-400'">
              {{ form.Status_Display === 'Aktif' ? 'Properti ini dapat dilihat oleh publik' : 'Properti disimpan sebagai draft' }}
            </span>
          </div>
          <button type="button" class="toggle shrink-0" :class="{ 'toggle-active': form.Status_Display === 'Aktif' }" @click="form.Status_Display = form.Status_Display === 'Aktif' ? 'Draft' : 'Aktif'">
            <span class="toggle-circle" :class="{ 'translate-x-6': form.Status_Display === 'Aktif' }"></span>
          </button>
        </div>
      </div>

      <div class="space-y-1">
        <BaseFormGroup label="NAMA PROPERTI" icon="lucide:home" required>
          <input v-model="form.Nama_Produk" placeholder="Contoh: The Sapphire Sky Mansion" class="field-input h-11 !pl-11 bg-white border-slate-200" />
        </BaseFormGroup>
        <div class="flex items-center gap-2 ml-1">
          <span class="text-xs font-black text-slate-400 uppercase tracking-widest">URL:</span>
          <span class="text-xs font-bold text-slate-500 truncate lowercase italic opacity-80">{{ currentHost }}/{{ form.Slug || '-' }}</span>
        </div>
      </div>
      <div class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseFormGroup label="TIPE PROPERTI" icon="lucide:building-2" required ref="dropdownTypeRef">
            <button @click="toggleType" type="button" class="field-input h-11 !pl-11 flex items-center justify-between group bg-white border-slate-200">
              <span class="text-xs font-bold" :class="form.Tipe ? 'text-slate-700' : 'text-slate-300'">{{ form.Tipe || 'Pilih Tipe' }}</span>
              <Icon icon="lucide:chevron-down" class="size-4 text-slate-400 group-hover:text-bejo-600 transition-transform" :class="isTypeOpen ? 'rotate-180' : ''" />
            </button>
            <Teleport to="body">
              <div v-if="isTypeOpen" ref="menuTypeRef" class="fixed z-[1000] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden scale-in" :style="dropdownStyles.type">
                <div class="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                  <div class="relative">
                    <Icon icon="lucide:search" class="absolute left-0 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <input v-model="searchType" placeholder="CARI TIPE..." class="w-full bg-transparent pl-6 border-none text-[10px] font-black focus:ring-0 placeholder:text-slate-400 text-slate-700 uppercase tracking-widest" />
                  </div>
                </div>
                <div class="max-h-60 overflow-y-auto p-2 custom-scroll flex flex-col min-w-[200px]">
                  <button v-for="t in filteredTypes" :key="t" @click="selectType(t)" type="button" class="group flex items-center justify-between px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-bejo-50 hover:text-bejo-600">
                    {{ t }}
                    <Icon v-if="form.Tipe === t" icon="lucide:check" class="size-4 text-bejo-600" />
                  </button>
                </div>
              </div>
            </Teleport>
          </BaseFormGroup>

          <BaseFormGroup label="JENIS SERTIFIKAT" icon="lucide:shield-check" required ref="dropdownCertRef">
            <button @click="toggleCert" type="button" class="field-input h-11 !pl-11 flex items-center justify-between group bg-white border-slate-200">
              <span class="text-xs font-bold" :class="form.Jenis_Sertifikat ? 'text-slate-700' : 'text-slate-300'">{{ form.Jenis_Sertifikat || 'Pilih Sertifikat' }}</span>
              <Icon icon="lucide:chevron-down" class="size-4 text-slate-400 group-hover:text-bejo-600 transition-transform" :class="isCertOpen ? 'rotate-180' : ''" />
            </button>
            <Teleport to="body">
              <div v-if="isCertOpen" ref="menuCertRef" class="fixed z-[1000] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden scale-in" :style="dropdownStyles.cert">
                <div class="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                  <div class="relative">
                    <Icon icon="lucide:search" class="absolute left-0 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <input v-model="searchCert" placeholder="CARI SERTIFIKAT..." class="w-full bg-transparent pl-6 border-none text-[10px] font-black focus:ring-0 placeholder:text-slate-400 text-slate-700 uppercase tracking-widest" />
                  </div>
                </div>
                <div class="max-h-60 overflow-y-auto p-2 custom-scroll flex flex-col min-w-[200px]">
                  <button v-for="s in filteredCertificates" :key="s" @click="selectCertificate(s)" type="button" class="group flex items-center justify-between px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-bejo-50 hover:text-bejo-600">
                    {{ s }}
                    <Icon v-if="form.Jenis_Sertifikat === s" icon="lucide:check" class="size-4 text-bejo-600" />
                  </button>
                </div>
              </div>
            </Teleport>
          </BaseFormGroup>
        </div>
      </div>

      <BaseFormGroup label="DESKRIPSI PROPERTI" icon="lucide:text-quote" align-icon="top" class="flex-1 flex flex-col" inner-class="h-full flex-1 flex flex-col">
        <div class="relative flex-1 min-h-[150px] flex flex-col h-full">
          <textarea v-model="form.Keterangan" maxlength="200" class="field-input flex-1 !pl-11 pt-4 resize-none leading-relaxed bg-white border-slate-200 text-sm font-medium" placeholder="Ceritakan keunggulan dan detail unit ini..."></textarea>
          <div class="absolute bottom-4 right-4 text-[9px] font-black text-slate-400 bg-white shadow-sm border border-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">{{ form.Keterangan?.length || 0 }} <span class="text-slate-300">/</span> 200</div>
        </div>
      </BaseFormGroup>

      <!-- Galeri Gambar Produk moved to TabMedia -->
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.label {
  @apply block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1;
}
.field {
  @apply space-y-1.5;
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
.toggle-box {
  @apply w-full flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50/50;
}
.toggle {
  @apply w-12 h-6 bg-slate-200 rounded-full relative transition-all duration-300;
}
.toggle-active {
  @apply bg-primary;
}
.toggle-circle {
  @apply absolute top-1 left-1 size-4 bg-card rounded-full transition-all duration-300 shadow-sm;
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
