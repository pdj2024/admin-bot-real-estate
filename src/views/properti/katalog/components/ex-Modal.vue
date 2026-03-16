<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { confirm, success, fail } from '@/utils/sweet-alert'
import api from '@/services/axios'

const props = defineProps<{
  showModal: boolean
  itemData?: any
}>()

const emit = defineEmits(['update:showModal', 'success', 'close'])

// --- State Management ---
const defaultForm = () => ({
  No_Id: '',
  Nama_Produk: '',
  Alamat: '',
  Hide_alamat: false,
  Tipe: 'Rumah',
  Tipe_Ukuran: '',
  Jenis_Sertifikat: 'SHM',
  Luas_Tanah: null,
  Luas_Bangunan: null,
  Jumlah_Lantai: 1,
  Jumlah_Kamar_Tidur: null,
  Jumlah_Kamar_Mandi: null,
  Jumlah_Carpot: null,
  Daya_Listrik: 1300,
  Status_Display: 'Aktif',
  Status_Properti: 'Tersedia',
  Status_Transaksi: ['Jual'], // Default Array
  Minimal_Sewa: 0,
  Satuan_Minimal_Sewa: 'Tahun',
  Harga_Jual1: null,
  Harga_Jual2: null,
  Harga_Sewa1: null,
  Harga_Sewa2: null,
  Keterangan: '',
  Slug: '',
  Area: '',
  Akses_Jalan: [] as string[],
  File_Image: ''
})

const form = ref(defaultForm())
const newAkses = ref('') // State untuk input teks akses jalan
const photos = ref<File[]>([])
const previewPhotos = ref<string[]>([])

watch(
  () => props.showModal,
  (newVal) => {
    if (newVal) {
      if (props.itemData) {
        // MODE EDIT: Isi form dengan data yang ada
        form.value = { ...props.itemData }

        // --- TAMBAHKAN LOGIKA INI ---
        // Jika data yang diedit punya gambar, masukkan ke array preview
        if (props.itemData.File_Image) {
          previewPhotos.value = [props.itemData.File_Image]
        } else {
          previewPhotos.value = []
        }
        // ----------------------------
      } else {
        // MODE TAMBAH: Reset form & preview jadi kosong
        form.value = defaultForm()
        previewPhotos.value = [] // Pastikan preview bersih saat tambah baru
        photos.value = [] // Pastikan file upload bersih
      }
    }
  }
)

const submitForm = async () => {
  const isEdit = !!form.value.No_Id // Cek apakah data punya ID (berarti edit)
  const url = isEdit ? `/api/realEstate/update/${form.value.No_Id}` : '/api/realEstate/create'
  const method = isEdit ? 'put' : 'post'

  confirm(`Apakah Anda yakin ingin ${isEdit ? 'mengubah' : 'menambah'} data ini?`, async () => {
    try {
      // Jika Anda mengirim File/Gambar, gunakan FormData.
      // Jika JSON biasa, cukup kirim form.value
      await api[method](url, form.value)

      success(`Data berhasil ${isEdit ? 'diperbarui' : 'disimpan'}!`)
      emit('success') // Refresh tabel di parent
      emit('update:showModal', false) // Tutup modal
    } catch (err) {
      fail('Terjadi kesalahan saat menyimpan data.')
    }
  })
}

const addAkses = () => {
  if (newAkses.value.trim()) {
    // Memastikan format konsisten: Akses [Tempat] ± [Waktu] min
    form.value.Akses_Jalan.push(newAkses.value.trim())
    newAkses.value = ''
  }
}

const removeAkses = (index: number) => {
  form.value.Akses_Jalan.splice(index, 1)
}

// --- Logic Foto ---
const handlePhoto = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files) return
  const files = Array.from(input.files)
  photos.value = files
  previewPhotos.value = files.map((file) => URL.createObjectURL(file))
}

const removePhoto = (index: number) => {
  previewPhotos.value.splice(index, 1)
  photos.value.splice(index, 1)
}

// --- Logic Slug & Submit ---
watch(
  () => form.value.Nama_Produk,
  (val) => {
    if (!val) return
    const baseSlug = val
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
    form.value.Slug = `${baseSlug}-${form.value.Luas_Bangunan || 0}`
  }
)
</script>

<template>
  <div v-if="showModal" class="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" @click.self="$emit('update:showModal', false)">
    <div class="bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
      <div class="flex justify-between items-center p-5 border-b bg-gray-50/50">
        <h2 class="text-xl font-extrabold text-slate-800">{{ form.No_Id ? 'Edit Properti' : 'Tambah Properti' }}</h2>
        <button @click="$emit('update:showModal', false)" class="hover:bg-red-100 p-2 rounded-full transition-colors text-slate-500 hover:text-red-600">
          <Icon icon="lucide:x" class="size-6" />
        </button>
      </div>
      <div class="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="flex flex-col gap-5">
          <div class="grid grid-cols-2 gap-3 items-center">
            <div class="field">
              <div v-for="(img, index) in previewPhotos" :key="index" class="preview-box">
                <img :src="img" class="preview-img" />
                <button @click="removePhoto(index)" class="preview-delete">✕</button>
              </div>
              <div v-if="previewPhotos.length === 0" class="preview-box flex items-center justify-center border-2 border-dashed border-slate-200">
                <Icon icon="lucide:image" class="size-10 text-slate-300" />
              </div>
            </div>
            <label class="upload-box border-2 border-dashed border-primary/40 hover:bg-primary/5 transition-all cursor-pointer rounded-xl h-full flex flex-col items-center justify-center">
              <Icon icon="lucide:upload-cloud" class="size-6 text-primary mb-2" />
              <span class="text-xs font-bold text-primary">Upload Foto</span>
              <input type="file" multiple @change="handlePhoto" class="hidden" />
            </label>
          </div>

          <div class="field">
            <label class="label">Nama Properti</label>
            <div class="relative">
              <Icon icon="lucide:home" class="field-icon" />
              <input v-model="form.Nama_Produk" placeholder="Contoh: Griya Asri Residence" class="field-input" />
            </div>
          </div>

          <div class="field">
            <label class="label flex justify-between">
              Alamat Lengkap
              <label class="flex items-center gap-1 cursor-pointer text-[10px] text-slate-500">
                <input type="checkbox" v-model="form.Hide_alamat" class="size-3 rounded" />
                Sembunyikan Alamat?
              </label>
            </label>
            <div class="relative">
              <Icon icon="lucide:map-pin" class="field-icon" />
              <input v-model="form.Alamat" placeholder="Alamat unit..." class="field-input" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
            <div class="col-span-2 flex items-center gap-4 mb-2">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Transaksi</span>
              <div class="flex gap-3">
                <label class="flex items-center gap-1.5 text-xs font-bold cursor-pointer"><input type="checkbox" value="Jual" v-model="form.Status_Transaksi" /> Jual</label>
                <label class="flex items-center gap-1.5 text-xs font-bold cursor-pointer"><input type="checkbox" value="Sewa" v-model="form.Status_Transaksi" /> Sewa</label>
              </div>
            </div>

            <template v-if="form.Status_Transaksi.includes('Jual')">
              <div class="field">
                <label class="label !text-emerald-600">Harga Jual Normal</label>
                <input v-model="form.Harga_Jual1" type="number" class="field-input !pl-4" placeholder="Rp" />
              </div>
              <div class="field">
                <label class="label !text-emerald-600">Harga Jual Diskon</label>
                <input v-model="form.Harga_Jual2" type="number" class="field-input !pl-4" placeholder="Rp" />
              </div>
            </template>

            <template v-if="form.Status_Transaksi.includes('Sewa')">
              <div class="field">
                <label class="label !text-blue-600">Harga Sewa Normal</label>
                <input v-model="form.Harga_Sewa1" type="number" class="field-input !pl-4" placeholder="Rp" />
              </div>
              <div class="field">
                <label class="label !text-blue-600">Harga Sewa Diskon</label>
                <input v-model="form.Harga_Sewa2" type="number" class="field-input !pl-4" placeholder="Rp" />
              </div>
            </template>
          </div>
        </div>

        <div class="flex flex-col gap-4 items-start">
          <div class="grid grid-cols-2 gap-3 w-full">
            <div class="field">
              <label class="label">Sertifikat</label>
              <select v-model="form.Jenis_Sertifikat" class="field-input !pl-4">
                <option value="SHM">SHM</option>
                <option value="SHGB">SHGB</option>
                <option value="SHU">SHU</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div class="field">
              <label class="label">Luas Tanah (m²)</label>
              <input v-model="form.Luas_Tanah" type="number" class="field-input !pl-4" />
            </div>
            <div class="field">
              <label class="label">Luas Bangunan (m²)</label>
              <input v-model="form.Luas_Bangunan" type="number" class="field-input !pl-4" />
            </div>
            <div class="field">
              <label class="label">Tipe Ukuran</label>
              <input v-model="form.Tipe_Ukuran" placeholder="8x12" class="field-input !pl-4" />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 w-full">
            <div
              class="field"
              v-for="spec in [
                { key: 'Jumlah_Kamar_Tidur', label: 'Kamar', icon: 'lucide:bed' },
                { key: 'Jumlah_Kamar_Mandi', label: 'WC', icon: 'lucide:bath' },
                { key: 'Jumlah_Carpot', label: 'Mobil', icon: 'lucide:car' }
              ]"
              :key="spec.key"
            >
              <label class="label">{{ spec.label }}</label>
              <input v-model="form[spec.key]" type="number" class="field-input !pl-4" />
            </div>
          </div>

          <div class="field w-full">
            <label class="label">Akses Fasilitas (Gunakan ± dan min)</label>
            <div class="flex gap-2">
              <input v-model="newAkses" @keyup.enter="addAkses" placeholder="Akses bandara ±20 min" class="field-input !pl-4" />
              <button @click="addAkses" class="bg-slate-800 text-white px-3 rounded-lg flex items-center"><Icon icon="lucide:plus" /></button>
            </div>
            <div class="flex flex-wrap gap-2 mt-2">
              <span v-for="(item, i) in form.Akses_Jalan" :key="i" class="bg-slate-100 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 border"> {{ item }} <Icon @click="removeAkses(i)" icon="lucide:x" class="cursor-pointer text-red-500" /> </span>
            </div>
          </div>

          <div class="toggle-box mt-2">
            <span class="flex items-center gap-2 text-xs font-bold text-slate-600"> <Icon icon="lucide:power" /> Status Display Katalog </span>
            <button @click="form.Status_Display = form.Status_Display === 'Aktif' ? 'Nonaktif' : 'Aktif'" class="toggle" :class="form.Status_Display === 'Aktif' ? 'toggle-active' : ''">
              <span class="toggle-circle" :class="form.Status_Display === 'Aktif' ? 'translate-x-6' : ''"></span>
            </button>
          </div>

          <div class="field w-full">
            <label class="label">Keterangan</label>
            <textarea v-model="form.Keterangan" placeholder="Keunggulan properti..." class="field-input !pl-4 resize-none h-24 pt-2"></textarea>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 p-5 border-t bg-gray-50/50">
        <button @click="$emit('update:showModal', false, 'close')" class="px-6 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">Batal</button>
        <button @click="submitForm" class="px-8 py-2 bg-primary text-white text-sm font-extrabold rounded-xl shadow-lg shadow-primary/30 hover:shadow-none transition-all">Simpan Katalog</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.label {
  @apply block text-[11px] font-extrabold text-slate-400 uppercase mb-1.5 ml-1 tracking-wider;
}

.field-icon {
  @apply absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none;
}

.field-input {
  @apply w-full border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none;
}

.preview-box {
  @apply relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-50;
}

.preview-img {
  @apply w-full h-full object-cover;
}

.preview-delete {
  @apply absolute top-2 right-2 bg-red-500 text-white rounded-full size-6 flex items-center justify-center text-xs shadow-lg;
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
  @apply absolute top-1 left-1 size-4 bg-white rounded-full transition-all duration-300 shadow-sm;
}
</style>
