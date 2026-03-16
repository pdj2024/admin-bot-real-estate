<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
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

const openProvince = ref(false)
const openCity = ref(false)
const selectedProvinceId = ref('')
const selectedProvinceName = ref('')
const selectedCityName = ref('')
const searchProvince = ref('')
const searchCity = ref('')

const props = defineProps<{
  showModal: boolean
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

const filteredProvinces = computed(() => {
  return provinces.value.filter((p) => p.name.toLowerCase().includes(searchProvince.value.toLowerCase()))
})

// Filter Kota berdasarkan input search
const filteredCities = computed(() => {
  return cities.value.filter((c) => c.name.toLowerCase().includes(searchCity.value.toLowerCase()))
})

// Reset search saat pilih provinsi
const selectProvince = async (p: Province) => {
  form.value.Area = `, ${p.name}`
  searchProvince.value = '' // Reset search
  cities.value = []
  await getCity(p.id)
  openProvince.value = false
  openCity.value = true
}

const selectCity = (c: City) => {
  const parts = form.value.Area.split(',')
  const provinceName = parts.length > 1 ? parts[1].trim() : parts[0].trim()
  form.value.Area = `${c.name}, ${provinceName}`
  searchCity.value = '' // Reset search
  openCity.value = false
}
const getProvince = async () => {
  try {
    const { data } = await axios.get('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
    console.log(data)
    provinces.value = data
  } catch (err) {
    console.error(err)
  }
}

const getCity = async (id) => {
  try {
    const { data } = await axios.get('https://www.emsifa.com/api-wilayah-indonesia/api/regencies/' + id + '.json')
    console.log(data)
    cities.value = data
  } catch (err) {
    console.error(err)
  }
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
    openProvince.value = false
  }
}

onMounted(async () => {
  await getProvince()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div v-if="showModal" class="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div class="bg-white w-full max-w-5xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
      <div class="flex justify-between items-center p-5 border-b">
        <h2 class="text-xl font-extrabold text-slate-800">{{ form.No_Id ? 'Edit' : 'Tambah' }} Properti</h2>
        <button @click="$emit('update:showModal', false)" class="p-2 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500">
          <Icon icon="lucide:x" class="size-6" />
        </button>
      </div>

      <div class="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="space-y-5">
          <div class="grid grid-cols-2 gap-3">
            <div class="preview-container flex flex-wrap gap-2">
              <div v-for="(img, i) in previewPhotos" :key="i" class="preview-box relative size-24">
                <img :src="img" class="size-full object-cover rounded-xl border" />
                <button @click="removePhoto(i)" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full size-5 text-[10px] shadow-lg">✕</button>
              </div>
              <div v-if="!previewPhotos.length" class="size-24 border-2 border-dashed rounded-xl flex items-center justify-center text-slate-300">
                <Icon icon="lucide:image" class="size-8" />
              </div>
            </div>
            <label class="border-2 border-dashed border-primary/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-all h-24">
              <Icon icon="lucide:upload-cloud" class="size-6 text-primary" />
              <span class="text-[10px] font-bold text-primary mt-1">TAMBAH FOTO</span>
              <input type="file" multiple hidden @change="handlePhoto" accept="image/*" />
            </label>
          </div>

          <div class="relative">
            <Icon icon="lucide:house" class="field-icon" />
            <input v-model="form.Nama_Produk" placeholder="Griya Asri..." class="field-input" />
          </div>

          <div class="field" ref="dropdownRef">
            <label class="label">Area & Alamat</label>
            <div class="space-y-2">
              <div class="grid grid-cols-2 gap-2">
                <div class="relative">
                  <div @click.stop="openProvince = !openProvince" class="field-input cursor-pointer truncate flex justify-between items-center">
                    <span>{{ form.Area.split(',').pop()?.trim() || 'Pilih Provinsi' }}</span>
                    <Icon icon="lucide:chevron-down" class="size-4 text-slate-400" />
                  </div>

                  <div v-if="openProvince" class="fixed sm:absolute inset-x-4 bottom-10 sm:inset-x-auto sm:top-full sm:bottom-auto sm:mt-2 z-[1000] sm:w-[220px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
                    <div class="p-4 border-b bg-slate-50">
                      <div class="relative">
                        <Icon icon="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input v-model="searchProvince" type="text" placeholder="Cari Provinsi..." class="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" @click.stop />
                      </div>
                    </div>
                    <div class="max-h-60 overflow-y-auto p-2 custom-scroll flex flex-col">
                      <button v-for="p in filteredProvinces" :key="p.id" @click="selectProvince(p)" type="button" class="dropdown-item text-left w-full">
                        {{ p.name }}
                      </button>
                    </div>
                  </div>
                </div>

                <div class="relative">
                  <div @click.stop="cities.length && (openCity = !openCity)" class="field-input cursor-pointer truncate flex justify-between items-center" :class="!cities.length && 'bg-slate-50 opacity-50 cursor-not-allowed'">
                    <span>{{ form.Area.split(',')[0]?.trim() || 'Pilih Kota' }}</span>
                    <Icon icon="lucide:chevron-down" class="size-4 text-slate-400" />
                  </div>

                  <div v-if="openCity" class="fixed sm:absolute inset-x-4 bottom-10 sm:inset-x-auto sm:top-full sm:bottom-auto sm:mt-2 z-[1000] sm:w-[270px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
                    <div class="p-4 border-b bg-slate-50">
                      <div class="relative">
                        <Icon icon="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input v-model="searchCity" type="text" placeholder="Cari Kota/Kabupaten..." class="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" @click.stop />
                      </div>
                    </div>
                    <div class="max-h-60 overflow-y-auto p-2 custom-scroll flex flex-col">
                      <button v-for="c in filteredCities" :key="c.id" @click="selectCity(c)" type="button" class="dropdown-item text-left w-full">
                        {{ c.name }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="relative">
                <Icon icon="lucide:map-pin" class="field-icon" />
                <input v-model="form.Alamat" placeholder="Detail jalan, no rumah..." class="field-input" />
              </div>
            </div>
          </div>

          <div class="bg-slate-50 p-4 rounded-2xl space-y-4 border border-slate-100">
            <div class="flex items-center gap-4 border-b border-slate-200 pb-2">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opsi Transaksi</span>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 text-xs font-bold cursor-pointer"><input type="checkbox" value="Jual" v-model="form.Status_Transaksi" class="accent-primary" /> JUAL</label>
                <label class="flex items-center gap-2 text-xs font-bold cursor-pointer"><input type="checkbox" value="Sewa" v-model="form.Status_Transaksi" class="accent-primary" /> SEWA</label>
              </div>
            </div>

            <div v-if="form.Status_Transaksi.includes('Jual')" class="grid grid-cols-2 gap-3">
              <div class="field">
                <label class="label !text-slate-500">Harga Jual Normal (Rp)</label>
                <input v-model="form.Harga_Jual1" type="number" class="field-input !pl-4" placeholder="Harga awal" />
              </div>
              <div class="field">
                <label class="label !text-emerald-600">Harga Jual Diskon (Rp)</label>
                <input v-model="form.Harga_Jual2" type="number" class="field-input !pl-4 border-emerald-200 focus:border-emerald-500" placeholder="Setelah diskon" />
              </div>
            </div>

            <div v-if="form.Status_Transaksi.includes('Sewa')" class="grid grid-cols-2 gap-3">
              <div class="field">
                <label class="label !text-slate-500">Harga Sewa Normal (Rp)</label>
                <input v-model="form.Harga_Sewa1" type="number" class="field-input !pl-4" placeholder="Harga awal" />
              </div>
              <div class="field">
                <label class="label !text-blue-600">Harga Sewa Diskon (Rp)</label>
                <input v-model="form.Harga_Sewa2" type="number" class="field-input !pl-4 border-blue-200 focus:border-blue-500" placeholder="Setelah diskon" />
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div class="field">
              <label class="label">Sertifikat</label>
              <select v-model="form.Jenis_Sertifikat" class="field-input !pl-4">
                <option>SHM</option>
                <option>SHGB</option>
                <option>Lainnya</option>
              </select>
            </div>
            <div class="field">
              <label class="label">Dimensi (P x L)</label>
              <div class="flex gap-2 items-center">
                <input v-model="panjang" placeholder="P" type="number" class="field-input !pl-2 text-center" />
                <span class="text-slate-300">x</span>
                <input v-model="lebar" placeholder="L" type="number" class="field-input !pl-2 text-center" />
              </div>
            </div>
            <div class="field"><label class="label">Luas Tanah (m²)</label><input v-model="form.Luas_Tanah" type="number" class="field-input !pl-4" /></div>
            <div class="field"><label class="label">Luas Bangunan (m²)</label><input v-model="form.Luas_Bangunan" type="number" class="field-input !pl-4" /></div>
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div v-for="s in specs" :key="s.key" class="field">
              <label class="label">{{ s.label }}</label>
              <input v-model="form[s.key as keyof RealEstateForm]" type="number" class="field-input !pl-4" />
            </div>
          </div>

          <div class="field">
            <label class="label">Aksesibilitas (Contoh: 5 min ke Tol)</label>
            <div class="flex gap-2">
              <input v-model="newAkses" @keyup.enter="addAkses" placeholder="Ketik akses..." class="field-input !pl-4" />
              <button @click="addAkses" class="bg-slate-800 text-white px-3 rounded-xl"><Icon icon="lucide:plus" /></button>
            </div>
            <div class="flex flex-wrap gap-2 mt-2">
              <span v-for="(a, i) in form.Akses_Jalan" :key="i" class="bg-white border text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1"> {{ a }} <Icon @click="form.Akses_Jalan.splice(i, 1)" icon="lucide:x" class="text-red-500 cursor-pointer" /> </span>
            </div>
          </div>

          <div class="field">
            <label class="label">Keterangan</label>
            <textarea v-model="form.Keterangan" class="field-input !pl-4 h-32 pt-2 resize-none" placeholder="Ceritakan keunggulan properti..."></textarea>
          </div>
        </div>
      </div>

      <div class="p-5 border-t flex justify-end gap-3 bg-slate-50/50">
        <button @click="$emit('update:showModal', false)" class="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-white rounded-xl transition-all">Batal</button>
        <button @click="submitForm" class="px-8 py-2.5 bg-primary text-white text-sm font-black rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">SIMPAN KATALOG</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.label {
  @apply block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1 tracking-widest;
}
.dropdown-item {
  @apply w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg text-left whitespace-normal break-words;
}
.dropdown-item:hover {
  @apply bg-slate-50 text-primary font-semibold;
}
.custom-scroll {
  scrollbar-gutter: stable;
}
.custom-scroll::-webkit-scrollbar {
  width: 5px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.field-input {
  @apply w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none;
}
.search-container {
  @apply sticky top-0 z-10 bg-white p-4 border-b border-slate-100;
}
</style>
