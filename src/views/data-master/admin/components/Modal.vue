<script setup lang="ts">
import { ref, watch, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'
import { confirm, fail, success } from '@/utils/sweet-alert'

const props = defineProps<{
  show: boolean
  editData?: any | null
}>()

const emit = defineEmits(['close', 'success'])
const loading = ref(false)

const form = reactive({
  No_Id: '',
  Nama_User: '',
  Email: '',
  Keterangan: '',
  Role_User: 'admin',
  Status: 'aktif',
  Id_Media: 'media_1'
})

// Fungsi Reset Form
const resetForm = () => {
  Object.assign(form, {
    No_Id: '',
    Nama_User: '',
    Email: '',
    Keterangan: '',
    Role_User: 'admin',
    Status: 'aktif',
    Id_Media: null
  })
}

// Pantau perubahan data edit
watch(
  () => props.editData,
  (newVal) => {
    if (newVal) {
      Object.assign(form, newVal)
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

const handleSubmit = async () => {
  const isEdit = !!props.editData
  loading.value = true

  confirm(`Apakah data admin sudah benar?`, async () => {
    try {
      const url = isEdit ? `/api/admin/update?no_id=${form.No_Id}` : '/api/admin/create'
      const method = isEdit ? 'put' : 'post'

      await api[method](url, form, {
        headers: { 'X-Jenis-User': 'Admin' }
      })

      success(isEdit ? 'Berhasil memperbarui data' : 'Berhasil menambah admin')
      emit('success')
      handleClose()
    } catch (err: any) {
      const detailError = err.response?.data?.Message || err.response?.data?.message || err.response?.data?.error || err.message
      fail(`Akses Ditolak: ${detailError}`)
    } finally {
      loading.value = false
    }
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
        <!-- Modal Header -->
        <div class="relative p-6 border-b border-slate-50">
          <div class="absolute top-0 right-0 w-32 h-32 bg-bejo-50/50 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          
          <div class="relative flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-2xl bg-bejo-500 text-white flex items-center justify-center">
                <Icon :icon="editData ? 'lucide:user-cog' : 'lucide:user-plus'" class="size-5" />
              </div>
              <div>
                <h3 class="text-lg font-black text-slate-900 leading-none">
                  {{ editData ? 'Edit Admin' : 'Tambah Admin' }}
                </h3>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {{ editData ? 'Perbarui data administrator' : 'Daftarkan administrator baru' }}
                </p>
              </div>
            </div>
            <button @click="handleClose" class="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all">
              <Icon icon="lucide:x" class="size-5" />
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <form @submit.prevent="handleSubmit" class="p-6 md:p-8 space-y-6">
          <div v-if="editData" class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">ID Admin</label>
            <div class="h-12 w-full px-4 flex items-center bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-400 select-none">
              {{ form.No_Id }}
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Nama Lengkap</label>
            <input v-model="form.Nama_User" type="text" required class="form-input-premium" placeholder="Misal: Ahmad Fauzi" />
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Alamat Email</label>
            <div class="relative group">
              <Icon icon="lucide:mail" class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-bejo-500 transition-colors" />
              <input v-model="form.Email" type="email" required class="form-input-premium ps-11" placeholder="admin@rumahbejo.com" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Keterangan Tambahan</label>
            <textarea v-model="form.Keterangan" rows="3" class="form-input-premium resize-none" placeholder="Catatan singkat..."></textarea>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center gap-3 pt-6 border-t border-slate-50">
            <button type="button" @click="handleClose" class="flex-1 h-12 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
              Batal
            </button>
            <button type="submit" :disabled="loading" class="flex-[2] h-12 bg-bejo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-bejo-500/20 hover:bg-bejo-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:scale-100">
              <Icon v-if="loading" icon="lucide:loader-2" class="animate-spin size-4" />
              {{ loading ? 'Memproses...' : editData ? 'Simpan' : 'Daftarkan' }}
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
         focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all
         placeholder:text-slate-300 placeholder:font-bold placeholder:uppercase placeholder:tracking-widest;
}
</style>
