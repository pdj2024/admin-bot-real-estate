<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { confirm, success, fail } from '@/utils/sweet-alert'
import api from '@/services/axios'
import axios from 'axios'

const newAkses = ref('')
const panjang = ref('')
const lebar = ref('')
const photos = ref<File[]>([])
const extensionsPhotos = ref<string[]>([])
const previewPhotos = ref<string[]>([])
const selectedFiles = ref<File[]>([])
const provinces = ref<Province[]>([])
const cities = ref<City[]>([])
const dropdownProvinceRef = ref<HTMLElement | null>(null)
const dropdownCityRef = ref<HTMLElement | null>(null)
const scrollContainer = ref<HTMLElement | null>(null)

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
  Ada_Minimal_Sewa?: boolean
  Minimal_Sewa: number
  Satuan_Minimal_Sewa: string | null
  Harga_Jual1: number | null
  Harga_Jual2: number | null
  Harga_Sewa1: number | null
  Harga_Sewa2: number | null
  Keterangan: string
  Slug: string
  Area: string
  Akses_Jalan: string[]
  File_Image: string[]
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
  Jenis_Sertifikat: '',
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
  Ada_Minimal_Sewa: false,
  Minimal_Sewa: 0,
  Satuan_Minimal_Sewa: null,
  Harga_Jual1: null,
  Harga_Jual2: null,
  Harga_Sewa1: null,
  Harga_Sewa2: null,
  Keterangan: '',
  Slug: '',
  Area: '',
  Akses_Jalan: [],
  File_Image: []
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
        previewPhotos.value = []
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
    provinces.value = data
  } catch (err) {
    console.error(err)
  }
}

const getCity = async (id: string | number) => {
  try {
    const { data } = await axios.get('https://www.emsifa.com/api-wilayah-indonesia/api/regencies/' + id + '.json')
    cities.value = data
  } catch (err) {
    console.error(err)
  }
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
const scrollToRight = () => {
  if (scrollContainer.value) {
    // Geser scroll ke posisi paling kanan
    scrollContainer.value.scrollTo({
      left: scrollContainer.value.scrollWidth,
      behavior: 'smooth'
    })
  }
}

const handlePhoto = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files) return

  const files = Array.from(target.files)

  files.forEach((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        previewPhotos.value.push(e.target.result)
        extensionsPhotos.value.push(file.name.split('.').pop()?.toLowerCase() || '')
        photos.value.push(file)
        nextTick(() => {
          scrollToRight()
        })
      }
    }
    reader.readAsDataURL(file)
  })

  target.value = ''
}

const removePhoto = (index: number) => {
  photos.value.splice(index, 1)
  extensionsPhotos.value.splice(index, 1)
  previewPhotos.value.splice(index, 1)
  selectedFiles.value.splice(index, 1)
}

watch(
  () => [...form.value.Status_Transaksi],
  (newStatus) => {
    if (!newStatus.includes('Sewa')) {
      form.value.Ada_Minimal_Sewa = false
      form.value.Minimal_Sewa = 0
      form.value.Satuan_Minimal_Sewa = null
    }
  }
)

// --- Logic Slug & Submit ---
watch(
  [() => form.value.Nama_Produk, () => form.value.Luas_Bangunan],

  ([newNama, newLuas]) => {
    if (!newNama) {
      form.value.Slug = ''
      return
    }

    const baseSlug = newNama
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')

    form.value.Slug = `${baseSlug}-${newLuas || 0}`
  },
  { immediate: true }
)

const handleClickOutside = (e: MouseEvent) => {
  if (!dropdownProvinceRef.value?.contains(e.target as Node)) {
    openProvince.value = false
  }
  if (!dropdownCityRef.value?.contains(e.target as Node)) {
    openCity.value = false
  }
}

const uploadImage = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const uploadUrl =
    'https://storage.googleapis.com/real-estate-bot/uploads/adm_1/fb0ec29f-ea5e-44bb-8081-c2ed58e734f0.jpg?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=storage-access%40bejobot.iam.gserviceaccount.com%2F20260316%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260316T075306Z&X-Goog-Expires=86400&X-Goog-SignedHeaders=host&X-Goog-Signature=d09011d482c2dd0fb14dc8972ec646a08a6a889489a3d6be606d74f785383e9bd2b19ee321b4fa3dab4a40b7aa87038f5c5b03911135901eb20bce34ca507f57d9e7c6c0d069a3326c785490b35ae7f422c269a33369fbbb673634861cac6e659b7f6fed43b031899a1cc232358ed2e37a8748e3e0e0e82baba4e327881ba8c894014df32a143c6f64dfe1f1be7f7e666898ba4b5f3bab934601f758f080bdcef9218ff1e913df809a1b76b0696ec3d80a6cbcefb4ede3ab19806343545254b9a8decd3dba4aae4f6cf4d6f4b39d8d9f425337fb3eb8a6d42610237d0f2ce080192ca74896c41db1cbcfa3e25e6fa80dbe43c77cbc598f9ab99b0f422c95a46c'

  try {
    await api.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type
      }
    })

    console.log('Upload berhasil')
  } catch (err) {
    console.error('Upload gagal', err)
  }
}

const reqUploadUrl = async () => {
  const url = '/api/mediacloud/req-upload-url-batch'

  const payload = {
    uploader_id: localStorage.getItem('no_id'),
    extensions: extensionsPhotos.value
  }

  try {
    const { data } = await api.post(url, payload, {
      headers: {
        'X-Jenis-User': 'admin'
      }
    })

    console.log('Response Data:', data)

    return data

  } catch (err) {
    console.error('Request upload URL gagal:', err)
    throw err
  }
}

const submitForm = async () => {
  const isEdit = !!form.value.No_Id
  const url = isEdit ? `/api/realEstate/update/${form.value.No_Id}` : '/api/realEstate/create'
  const method = isEdit ? 'put' : 'post'

  confirm(`Apakah Anda yakin ingin ${isEdit ? 'mengubah' : 'menambah'} data ini?`, async () => {
    // try {
    //   await api[method](url, form.value)

    //   success(`Data berhasil ${isEdit ? 'diperbarui' : 'disimpan'}!`)
    //   emit('success') // Refresh tabel di parent
    //   emit('update:showModal', false) // Tutup modal
    // } catch (err) {
    //   fail('Terjadi kesalahan saat menyimpan data.')
    // }
    reqUploadUrl
    console.log(form.value)
  })
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

      <div class="px-6 py-3 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="space-y-5">
          <div class="col-span-2 space-y-2 !mb-3">
            <label class="label block">Detail Gambar</label>

            <div ref="scrollContainer" class="preview-container flex flex-nowrap gap-3 overflow-x-auto pb-2 custom-scroll">
              <div v-for="(img, i) in previewPhotos" :key="i" class="preview-box relative size-24 flex-shrink-0">
                <img :src="img" class="size-full object-cover rounded-xl border border-slate-200" />
                <button @click="removePhoto(i)" class="preview-delete">✕</button>
              </div>

              <label class="size-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-shrink-0 flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-primary/50 transition-all text-slate-400 group">
                <Icon icon="lucide:plus" class="size-6 group-hover:text-primary transition-colors" />
                <span class="text-[10px] font-bold mt-1 group-hover:text-primary">TAMBAH</span>
                <input type="file" multiple hidden @change="handlePhoto" accept="image/*" />
              </label>

              <div v-if="!previewPhotos.length" class="flex-shrink-0 text-slate-300 text-[10px] italic flex items-center px-2">Belum ada foto terpilih</div>
            </div>
          </div>
          <div class="field">
            <label class="label flex justify-between"> Nama Properti </label>
            <div class="relative">
              <Icon icon="lucide:house" class="field-icon" />
              <input v-model="form.Nama_Produk" placeholder="Nama Perumahan, Apartement, Resort" class="field-input" />
            </div>
          </div>

          <div class="field" ref="dropdownRef">
            <label class="label flex justify-between">
              Area & Alamat
              <label class="flex items-center gap-1 cursor-pointer text-[10px] text-slate-500">
                <input type="checkbox" v-model="form.Hide_alamat" class="size-3 rounded" />
                Sembunyikan Alamat?
              </label>
            </label>
            <div class="space-y-2">
              <div class="grid grid-cols-2 gap-2">
                <div class="relative">
                  <div @click.stop="openProvince = !openProvince" class="field-input cursor-pointer truncate flex justify-between items-center">
                    <span>{{ form.Area.split(',').pop()?.trim() || 'Pilih Provinsi' }}</span>
                    <Icon icon="lucide:chevron-down" class="size-4 text-slate-400" />
                  </div>

                  <div v-if="openProvince" class="absolute bottom-full left-0 mb-1 w-full max-w-[420px] max-h-62 z-[9999] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col">
                    <div class="px-4 py-2 border-b bg-slate-50">
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

                  <div v-if="openCity" class="absolute bottom-full left-0 mb-1 w-full max-w-[420px] max-h-62 z-[9999] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col">
                    <div class="px-4 py-2 border-b bg-slate-50">
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
                <label class="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input type="checkbox" value="Jual" v-model="form.Status_Transaksi" class="accent-primary" />
                  JUAL
                </label>

                <label class="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input type="checkbox" value="Sewa" v-model="form.Status_Transaksi" class="accent-primary" />
                  SEWA
                </label>

                <label v-if="form.Status_Transaksi.includes('Sewa')" class="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input type="checkbox" value="Minimal_Sewa" v-model="form.Ada_Minimal_Sewa" class="accent-primary" />
                  MIN SEWA
                </label>
              </div>
            </div>

            <div v-if="form.Status_Transaksi.includes('Jual')" class="grid grid-cols-2 gap-3">
              <div class="field">
                <label class="label !text-slate-500">Harga Jual Normal (Rp)</label>
                <input v-model="form.Harga_Jual1" type="number" class="field-input !pl-4" placeholder="Harga awal" />
              </div>
              <div class="field">
                <label class="label !text-blue-600">Harga Jual Diskon (Rp)</label>
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

            <div v-if="form.Ada_Minimal_Sewa" class="grid grid-cols-2 gap-3">
              <div class="field">
                <label class="label !text-slate-500">Minimal Sewa</label>
                <input v-model="form.Minimal_Sewa" type="number" class="field-input !pl-4" placeholder="Minimal sewa" />
              </div>
              <div class="field">
                <label class="label !text-slate-600">Satuan</label>
                <select v-model="form.Satuan_Minimal_Sewa" class="field-input !pl-4">
                  <option value="Bulan">Bulan</option>
                  <option value="Tahun">Tahun</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="field">
            <label class="label"> Url Slug </label>
            <div class="relative">
              <Icon icon="lucide:link-2" class="field-icon" />
              <input v-model="form.Slug" class="field-input" readonly />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="field">
              <label class="label">Sertifikat</label>
              <select v-model="form.Jenis_Sertifikat" class="field-input !pl-4">
                <option value="SHM">SHM</option>
                <option value="SHGB">SHGB</option>
                <option value="Lainnya">Lainnya</option>
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
            <textarea v-model="form.Keterangan" class="field-input !pl-4 h-18 pt-2 resize-none" placeholder="Ceritakan keunggulan properti..."></textarea>
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
  @apply sticky top-0 z-10 bg-white p-4 border-b border-slate-100;
}
</style>
