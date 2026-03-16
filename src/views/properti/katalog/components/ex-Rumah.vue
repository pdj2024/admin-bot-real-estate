<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { confirm, success, fail } from '@/utils/sweet-alert'
import api from '@/services/axios'
import axios from 'axios'

const newAkses = ref('')
const panjang = ref('')
const lebar = ref('')
const photos = ref<File[]>([])
const previewPhotos = ref<string[]>([])
const provinces = ref<Province[]>([])
const cities = ref<City[]>([])
const dropdownProvinceRef = ref<HTMLElement | null>(null)
const tempProvinceName = ref('')

const openDropdownProvince = ref(false)
const openDropdownCity = ref(false)

const props = defineProps<{
  showModal?: boolean
  itemData?: any
}>()

const emit = defineEmits(['update:showModal', 'success', 'close'])

interface RealEstateForm {
  No_Id: string
  Nama_Produk: string
  Alamat: string
  Hide_alamat: boolean
  Tipe: string
  Tipe_Ukuran: string
  Jenis_Sertifikat: string
  Luas_Tanah: number | null
  Luas_Bangunan: number | null
  Jumlah_Lantai: number
  Jumlah_Kamar_Tidur: number | null
  Jumlah_Kamar_Mandi: number | null
  Jumlah_Carpot: number | null
  Daya_Listrik: number
  Status_Display: string
  Status_Properti: string
  Status_Transaksi: string[]
  Minimal_Sewa: number
  Satuan_Minimal_Sewa: string
  Harga_Jual1: number | null
  Harga_Jual2: number | null
  Harga_Sewa1: number | null
  Harga_Sewa2: number | null
  Keterangan: string
  Slug: string
  Area: string
  Akses_Jalan: string[]
  File_Image: string
}

interface Province {
  id: string
  name: string
}

interface City {
  id: string
  name: string
}

const specs = [
  { key: 'Jumlah_Kamar_Tidur', label: 'Jml Kamar', icon: 'lucide:bed' },
  { key: 'Jumlah_Kamar_Mandi', label: 'Jml KM', icon: 'lucide:bath' },
  { key: 'Jumlah_Carpot', label: 'Carport', icon: 'lucide:car' }
] as const

// --- State Management ---
const defaultForm = (): RealEstateForm => ({
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
  Status_Transaksi: ['Jual'],
  Minimal_Sewa: 0,
  Satuan_Minimal_Sewa: 'Tahun',
  Harga_Jual1: null,
  Harga_Jual2: null,
  Harga_Sewa1: null,
  Harga_Sewa2: null,
  Keterangan: '',
  Slug: '',
  Area: '',
  Akses_Jalan: [],
  File_Image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800'
})

const form = ref<RealEstateForm>(defaultForm())

watch([panjang, lebar], ([newP, newL]) => {
  if (newP || newL) {
    form.value.Tipe_Ukuran = `${newP}x${newL}`
  } else {
    form.value.Tipe_Ukuran = ''
  }
})

watch(
  () => props.showModal,
  (newVal) => {
    if (newVal) {
      if (props.itemData) {
        form.value = { ...props.itemData }

        if (props.itemData.Tipe_Ukuran) {
          const splitUkuran = props.itemData.Tipe_Ukuran.split('x')
          panjang.value = splitUkuran[0] || ''
          lebar.value = splitUkuran[1] || ''
        }

        if (props.itemData.File_Image) {
          const baseUrl = 'http://26.75.164.107:270/'
          const fullImageUrl = props.itemData.File_Image.startsWith('http') ? props.itemData.File_Image : baseUrl + props.itemData.File_Image

          previewPhotos.value = [fullImageUrl]
        } else {
          previewPhotos.value = []
        }
      } else {
        form.value = defaultForm()
        previewPhotos.value = ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800']
        photos.value = []
        panjang.value = ''
        lebar.value = ''
      }
    }
  }
)

const getProvince = async () => {
  try {
    const { data } = await axios.get('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
    // Emsifa API mengembalikan array langsung
    provinces.value = data
  } catch (err) {
    console.error('Gagal ambil provinsi:', err)
  }
}

const handleProvinceClick = async (province: Province) => {
  tempProvinceName.value = province.name
  await getCity(province.id)
  openDropdownProvince.value = false
  openDropdownCity.value = true // Otomatis buka dropdown kota setelah pilih provinsi
}

const getCity = async (id: string) => {
  try {
    const { data } = await axios.get(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${id}.json`)
    cities.value = data
  } catch (err) {
    console.error('Gagal ambil kota:', err)
  }
}

const setArea = (city: City) => {
  // Menggabungkan Kota dan Provinsi ke dalam form.Area
  form.value.Area = `${city.name}, ${tempProvinceName.value}`
  openDropdownCity.value = false
}

const submitForm = async () => {
  const isEdit = !!form.value.No_Id
  const url = isEdit ? `/api/realEstate/update/${form.value.No_Id}` : '/api/realEstate/create'
  const method = isEdit ? 'put' : 'post'

  confirm(`Apakah Anda yakin ingin ${isEdit ? 'mengubah' : 'menambah'} data ini?`, async () => {
    try {
      await api[method](url, form.value)

      success(`Data berhasil ${isEdit ? 'diperbarui' : 'disimpan'}!`)
      emit('success') // Refresh tabel di parent
      emit('update:showModal', false) // Tutup modal
    } catch (err) {
      fail('Terjadi kesalahan saat menyimpan data.')
    }
  })
}

const handleCancel = () => {
  emit('update:showModal', false)
  emit('close')
}

const addAkses = () => {
  if (newAkses.value.trim()) {
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

const handleClickOutside = (e: MouseEvent) => {
  if (!dropdownProvinceRef.value?.contains(e.target as Node)) {
    openDropdownProvince.value = false
  }
}

onMounted(async () => {
  await getProvince()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
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

            <div class="grid grid-cols-2 gap-3 w-full">
              <div class="fiel">
                <div class="relative flex-shrink-0">
                  <div class="relative" @click="openDropdownProvince = !openDropdownProvince">
                    <Icon icon="lucide:map-pin" class="field-icon" />
                    <input v-model="form.Area" placeholder="Area..." class="field-input" />
                  </div>

                  <div v-show="openDropdownProvince" ref="dropdownProvinceRef" class="absolute left-0 bottom-12 z-[100] min-w-[200px] bg-white shadow-2xl border border-slate-200 rounded-xl p-2 max-h-60 overflow-y-auto custom-scroll">
                    <p class="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase">Pilih Provinsi</p>

                    <button v-for="province in provinces" :key="province.id" type="button" @click="handleProvinceClick(province)" class="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded-lg transition-colors capitalize">
                      {{ province.name.toLowerCase() }}
                    </button>
                  </div>

                  <div v-show="openDropdownCity" ref="dropdownCityRef" class="absolute left-0 bottom-12 z-[100] min-w-[200px] bg-white shadow-2xl border border-slate-200 rounded-xl p-2 max-h-60 overflow-y-auto custom-scroll">
                    <p class="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase">Pilih Kota/Kabupaten</p>

                    <button v-for="city in cities" :key="city.id" type="button" @click="setArea(city)" class="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded-lg transition-colors capitalize">
                      {{ city.name.toLowerCase() }}
                    </button>
                  </div>
                </div>
              </div>
              <div class="field">
                <div class="relative">
                  <Icon icon="lucide:map-pin" class="field-icon" />
                  <input v-model="form.Alamat" placeholder="Alamat unit..." class="field-input" />
                </div>
              </div>
            </div>
          </div>

          <div class="field w-full">
            <label class="label">Slug</label>
            <div class="relative">
              <Icon icon="lucide:link-2" class="field-icon" />
              <input v-model="form.Slug" placeholder="Contoh: Griya Asri Residence" class="field-input" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
            <div class="col-span-2 flex items-center gap-4 mb-2">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Harga</span>
              <div class="flex gap-3">
                <label class="flex items-center gap-1.5 text-xs font-bold cursor-pointer"><input type="checkbox" value="Jual" v-model="form.Status_Transaksi" /> Jual</label>
                <label class="flex items-center gap-1.5 text-xs font-bold cursor-pointer"><input type="checkbox" value="Sewa" v-model="form.Status_Transaksi" /> Sewa</label>
              </div>
            </div>

            <template v-if="form.Status_Transaksi.includes('Jual')">
              <div class="field">
                <label class="label !text-emerald-600">Jual Normal</label>
                <input v-model="form.Harga_Jual1" type="number" class="field-input !pl-4" placeholder="Rp" />
              </div>
              <div class="field">
                <label class="label !text-emerald-600">Jual Diskon</label>
                <input v-model="form.Harga_Jual2" type="number" class="field-input !pl-4" placeholder="Rp" />
              </div>
            </template>

            <template v-if="form.Status_Transaksi.includes('Sewa')">
              <div class="field">
                <label class="label !text-blue-600">Sewa Normal</label>
                <input v-model="form.Harga_Sewa1" type="number" class="field-input !pl-4" placeholder="Rp" />
              </div>
              <div class="field">
                <label class="label !text-blue-600">Sewa Diskon</label>
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
              <label class="label">Ukuran (P x L)</label>
              <div class="flex items-center gap-2">
                <div class="relative flex-1">
                  <input v-model="panjang" type="number" placeholder="P" class="field-input !pl-4 text-center" />
                </div>

                <span class="text-slate-400 font-bold">x</span>

                <div class="relative flex-1">
                  <input v-model="lebar" type="number" placeholder="L" class="field-input !pl-4 text-center" />
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 w-full">
            <div class="field" v-for="spec in specs" :key="spec.key">
              <label class="label">{{ spec.label }}</label>
              <input v-model="form[spec.key as keyof RealEstateForm]" type="number" class="field-input !pl-4" />
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
            <textarea v-model="form.Keterangan" placeholder="Keunggulan properti..." class="field-input !pl-4 resize-none h-42 pt-2"></textarea>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 p-5 border-t bg-gray-50/50">
        <button @click="handleCancel" class="px-6 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">Batal</button>
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
