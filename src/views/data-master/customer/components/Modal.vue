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
  UserName: '',
  Nama_Display: '',
  Email: '',
  Kota: '',
  Status: 'aktif',
  Pernah_Order: false,
  Saves: [],
  Likes: [],
  Device_Token: [],
  Tgl_Created: '',
  Tgl_Nonaktif: null,
  Jumlah_Saves: 0,
  Jumlah_Likes: 0,
  Id_Media: 'media_1'
})

// Fungsi Reset Form
const resetForm = () => {
  Object.assign(form, {
    No_Id: '',
    UserName: '',
    Nama_Display: '',
    Email: '',
    Kota: '',
    Status: 'aktif',
    Pernah_Order: false,
    Saves: [],
    Likes: [],
    Device_Token: [],
    Tgl_Created: '',
    Tgl_Nonaktif: null,
    Jumlah_Saves: 0,
    Jumlah_Likes: 0,
    Id_Media: null
  })
}

// Pantau perubahan data edit
watch(
  () => props.editData,
  (newVal) => {
    // console.log('Data yang diterima Modal:', newVal)
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

  confirm(`Apakah data customer sudah benar?`, async () => {
    try {
      const url = isEdit ? `/api/customer/update?no_id=${form.No_Id}` : '/api/customer/create'

      const method = isEdit ? 'put' : 'post'

      await api[method](url, form, {
        headers: { 'X-Jenis-User': 'customer' }
      })

      success(isEdit ? 'Berhasil memperbarui data' : 'Berhasil menambah customer')
      emit('success')
      handleClose()
    } catch (err: any) {
      console.log(err)
      console.error(err)
      fail(err.response?.data?.Message || 'Terjadi kesalahan pada server')
    } finally {
      emit('success')
    }
  })
}

const handleClose = () => {
  resetForm()
  emit('close')
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" @click="handleClose"></div>

    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
      <div class="flex items-center justify-between p-4 border-b">
        <h3 class="text-lg font-semibold text-gray-800">
          {{ editData ? 'Edit Data Customer' : 'Tambah Customer Baru' }}
        </h3>
        <button @click="handleClose" class="text-gray-400 hover:text-gray-600 transition-colors">
          <Icon icon="lucide:x" class="size-5" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-5 space-y-4">
        <div v-if="editData">
          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">ID Customer</label>
          <input v-model="form.No_Id" type="text" readonly class="form-input-custom bg-gray-50 text-gray-500 cursor-not-allowed" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input v-model="form.UserName" type="text" required class="form-input-custom" placeholder="Username..." />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama</label>
          <input v-model="form.Nama_Display" type="text" required class="form-input-custom" placeholder="Nama..." />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input v-model="form.Email" type="email" required class="form-input-custom" placeholder="email@mail.com" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Kota</label>
          <input v-model="form.Kota" type="text" required class="form-input-custom" placeholder="Kota..." />
        </div>

        <div class="flex items-center gap-3 pt-4 border-t">
          <button type="button" @click="handleClose" class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Batal</button>
          <button type="submit" :disabled="loading" class="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center">
            <Icon v-if="loading" icon="lucide:loader-2" class="animate-spin size-4 me-2" />
            {{ loading ? 'Memproses...' : editData ? 'Simpan Perubahan' : 'Daftarkan Customer' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.form-input-custom {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all;
}
</style>
