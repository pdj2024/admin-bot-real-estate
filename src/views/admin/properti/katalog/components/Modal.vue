<script setup lang="ts">
import { ref, watch, provide, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import TabIdentitasUtama from './modal-tabs/TabIdentitasUtama.vue'
import TabSpesifikasiDetail from './modal-tabs/TabSpesifikasiDetail.vue'
import { usePropertyModal } from '@/composables/admin/usePropertyModal'

const props = defineProps<{
  showModal: boolean
  itemData?: any
}>()

const emit = defineEmits(['update:showModal', 'success', 'close'])

const handleClose = () => {
  emit('update:showModal', false)
  emit('close')
}

// Instantiate the composable state
const modalState = usePropertyModal(emit, handleClose)

// Provide to all children tabs
provide('propertyModalState', modalState)

const { form, isLoading, initData, loadGoogleMaps } = modalState
const activeTab = ref<'utama' | 'detail'>('utama')

// Watch for modal trigger
watch(
  () => props.showModal,
  (newVal) => {
    if (newVal) {
      activeTab.value = 'utama'
      initData(props.itemData)
    }
  }
)

onMounted(() => {
  loadGoogleMaps()
})
</script>

<template>
  <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-show="showModal" class="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="bg-card w-full max-w-7xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div class="flex flex-col border-b bg-card">
          <div class="flex justify-between items-center px-8 py-3">
            <h2 class="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">{{ form.No_Id ? 'Edit' : 'Tambah' }} Properti</h2>
            <button @click="handleClose" class="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all active:scale-95">
              <Icon icon="lucide:x" class="size-6" />
            </button>
          </div>

          <!-- Tab Navigation Bar -->
          <div class="flex px-8 gap-0 border-t border-slate-50 bg-slate-50/30">
            <button @click="activeTab = 'utama'" class="flex-1 lg:flex-none lg:w-48 pt-4 pb-3.5 text-[10px] font-black uppercase tracking-widest transition-all relative group" :class="activeTab === 'utama' ? 'text-primary' : 'text-slate-400 hover:text-slate-500'">
              <div class="flex items-center justify-center gap-2">
                <Icon icon="lucide:home" class="size-3.5" :class="activeTab === 'utama' ? 'text-primary' : 'text-slate-400'" />
                <span>Identitas Utama</span>
              </div>
              <div class="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full transition-all duration-300 transform" :class="activeTab === 'utama' ? 'scale-x-75 opacity-100' : 'scale-x-0 opacity-0'"></div>
            </button>
            <button @click="activeTab = 'detail'" class="flex-1 lg:flex-none lg:w-48 pt-4 pb-3.5 text-[10px] font-black uppercase tracking-widest transition-all relative group" :class="activeTab === 'detail' ? 'text-primary' : 'text-slate-400 hover:text-slate-500'">
              <div class="flex items-center justify-center gap-2">
                <Icon icon="lucide:file-text" class="size-3.5" :class="activeTab === 'detail' ? 'text-primary' : 'text-slate-400'" />
                <span>Spesifikasi Detail</span>
              </div>
              <div class="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full transition-all duration-300 transform" :class="activeTab === 'detail' ? 'scale-x-75 opacity-100' : 'scale-x-0 opacity-0'"></div>
            </button>
          </div>
        </div>

        <div class="px-8 py-8 overflow-y-auto flex-1 custom-scroll bg-slate-50/10 relative">
          <!-- TAB 1: IDENTITAS UTAMA -->
          <TabIdentitasUtama v-show="activeTab === 'utama'" />

          <!-- TAB 2: SPESIFIKASI DETAIL -->
          <TabSpesifikasiDetail v-show="activeTab === 'detail'" />
        </div>

        <div class="px-8 py-6 border-t flex justify-between items-center bg-white">
          <button @click="activeTab = 'utama'" v-if="activeTab === 'detail'" class="px-6 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-all flex items-center gap-2 group"><Icon icon="lucide:arrow-left" class="size-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Utama</button>
          <div v-else></div>

          <div class="flex gap-4 items-center">
            <button @click="handleClose" class="px-7 py-3 text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all">Batal</button>

            <button @click="activeTab = 'detail'" v-if="activeTab === 'utama'" class="px-9 py-3 bg-slate-100 text-slate-600 text-xs font-black rounded-2xl transition-all hover:bg-slate-200 active:scale-95 flex items-center gap-2 group">Lanjut Spesifikasi <Icon icon="lucide:chevron-right" class="size-4 group-hover:translate-x-1 transition-transform" /></button>

            <button v-else :disabled="isLoading" @click="modalState.submitForm" class="px-10 py-3 bg-primary text-white text-xs font-black rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.03] active:scale-95 flex items-center gap-2">
              <Icon v-if="isLoading" icon="lucide:loader-2" class="size-4 animate-spin" />
              <Icon v-else icon="lucide:save" class="size-4" />
              {{ isLoading ? 'Sedang Menyimpan...' : 'Simpan Properti' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.label {
  @apply block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1;
}
.field {
  @apply space-y-1.5;
}
.inactive {
  @apply opacity-50 pointer-events-none grayscale;
}
.field-icon {
  @apply absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none;
}
.field-input {
  @apply w-full border border-slate-200 rounded-xl py-1.5 pl-9 pr-4 text-sm bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none;
}
.preview-delete {
  @apply absolute top-1 right-1 bg-red-500 text-white rounded-full size-4 flex items-center justify-center text-xs shadow-lg;
}
.dropdown-item {
  @apply w-full text-left px-4 py-2 text-sm hover:bg-slate-100 rounded-lg whitespace-normal;
}
.dropdown-item:hover {
  @apply bg-slate-50 text-primary font-semibold;
}
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}
.custom-scroll::-webkit-scrollbar {
  height: 4px;
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 20px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
.search-container {
  @apply sticky top-0 z-10 bg-card p-4 border-b border-slate-100;
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
  border: none !important;
  outline: none !important;
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
