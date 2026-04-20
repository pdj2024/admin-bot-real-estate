<script setup lang="ts">
import { ref, watch, reactive, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { confirm, success } from '@/utils/sweet-alert'

const props = defineProps<{
  show: boolean
  type: string
  editData?: any | null
  allData: any
}>()

const emit = defineEmits(['close', 'success'])
const loading = ref(false)

const form = reactive({
  id: '',
  nama: '',
  parentId: '', // Generic parent ID
  level: 'Medium' // For Prioritas
})

const resetForm = () => {
  Object.assign(form, {
    id: '',
    nama: '',
    parentId: '',
    level: 'Medium'
  })
}

watch(
  () => props.editData,
  (newVal) => {
    if (newVal) {
      Object.assign(form, {
        id: newVal.id,
        nama: newVal.nama,
        parentId: newVal.kotaId || newVal.areaId || newVal.kecamatanId || '',
        level: newVal.level || 'Medium'
      })
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

const title = computed(() => {
  const label = props.type.charAt(0).toUpperCase() + props.type.slice(1)
  return props.editData ? `Edit ${label}` : `Tambah ${label}`
})

const parentLabel = computed(() => {
  switch (props.type) {
    case 'area': return 'Kota'
    case 'kecamatan': return 'Area'
    case 'kelurahan': return 'Kecamatan'
    case 'prioritas': return 'Area'
    default: return ''
  }
})

const parentOptions = computed(() => {
  switch (props.type) {
    case 'area': return props.allData.kota
    case 'kecamatan': return props.allData.area
    case 'kelurahan': return props.allData.kecamatan
    case 'prioritas': return props.allData.area
    default: return []
  }
})

const handleSubmit = () => {
  loading.value = true
  
  confirm(`Apakah data ${props.type} sudah benar?`, () => {
    // Simulate API call
    setTimeout(() => {
      const result = { ...form }
      
      // Map parentId back to specific keys based on type
      if (props.type === 'area') (result as any).kotaId = form.parentId
      if (props.type === 'kecamatan') (result as any).areaId = form.parentId
      if (props.type === 'kelurahan') (result as any).kecamatanId = form.parentId
      if (props.type === 'prioritas') (result as any).areaId = form.parentId

      emit('success', { type: props.type, data: result, isEdit: !!props.editData })
      success(props.editData ? 'Berhasil memperbarui data' : 'Berhasil menambah data')
      loading.value = false
      handleClose()
    }, 500)
  })
}

const handleClose = () => {
  resetForm()
  emit('close')
}
</script>

<template>
  <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" @click="handleClose"></div>

      <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md z-10 overflow-hidden border border-slate-100 animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500">
        <!-- Header -->
        <div class="relative p-6 border-b border-slate-50">
          <div class="absolute top-0 right-0 w-32 h-32 bg-bejo-50/50 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          
          <div class="relative flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-2xl bg-bejo-500 text-white flex items-center justify-center">
                <Icon :icon="editData ? 'lucide:pencil' : 'lucide:plus'" class="size-5" />
              </div>
              <div>
                <h3 class="text-lg font-black text-slate-900 leading-none">{{ title }}</h3>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  Master Data Geografis
                </p>
              </div>
            </div>
            <button @click="handleClose" class="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all">
              <Icon icon="lucide:x" class="size-5" />
            </button>
          </div>
        </div>

        <!-- Body -->
        <form @submit.prevent="handleSubmit" class="p-6 md:p-8 space-y-6">
          <!-- Parent Selection (if applicable) -->
          <div v-if="parentLabel" class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Pilih {{ parentLabel }}</label>
            <select v-model="form.parentId" required class="form-input-premium appearance-none">
              <option value="" disabled>Pilih {{ parentLabel }}...</option>
              <option v-for="opt in parentOptions" :key="opt.id" :value="opt.id">{{ opt.nama }}</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Nama {{ type }}</label>
            <input v-model="form.nama" type="text" required class="form-input-premium" :placeholder="`Misal: ${type === 'kota' ? 'Surabaya' : 'Sambikerep'}`" />
          </div>

          <!-- Priority Level (only for Priority type) -->
          <div v-if="type === 'prioritas'" class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Level Prioritas</label>
            <select v-model="form.level" required class="form-input-premium appearance-none">
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center gap-3 pt-6 border-t border-slate-50">
            <button type="button" @click="handleClose" class="flex-1 h-12 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
              Batal
            </button>
            <button type="submit" :disabled="loading" class="flex-[2] h-12 bg-bejo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-bejo-500/20 hover:bg-bejo-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              <Icon v-if="loading" icon="lucide:loader-2" class="animate-spin size-4" />
              {{ loading ? 'Memproses...' : editData ? 'Simpan' : 'Tambah' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.form-input-premium {
  @apply w-full h-12 px-4 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl 
         focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all;
}
</style>
