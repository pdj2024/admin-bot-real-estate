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
const previewPhotos = ref<MediaItem[]>([])
const selectedFiles = ref<File[]>([])
const mediaIdsLists = ref<string[]>([])
const provinces = ref<Province[]>([])
const cities = ref<City[]>([])
const dropdownProvinceRef = ref<HTMLElement | null>(null)
const dropdownCityRef = ref<HTMLElement | null>(null)
const scrollContainer = ref<HTMLElement | null>(null)

const isLoading = ref(false)
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

interface MediaUrl {
  Url: string | null
  Expired_At: Date
  IsCompressed: false
  ContentType: string
  ThumbUrl: string | null
  Size: number
  Id_Media: string
}

interface RealEstateForm {
  No_Id: string
  Nama_Produk: string
  Alamat: string
  Hide_alamat: boolean
  Tipe: string
  Tipe_Ukuran: string
  Jenis_Sertifikat: string
  Luas_Tanah: number
  Luas_Bangunan: number
  Jumlah_Lantai: number
  Jumlah_Kamar_Tidur: number
  Jumlah_Kamar_Mandi: number
  Jumlah_Carpot: number
  Daya_Listrik: number
  Status_Display: string
  Status_Properti: string
  Status_Transaksi: string[]
  Flag_Sewa: 'Ya' | 'Tidak'
  Ada_Minimal_Sewa?: boolean
  Minimal_Sewa: number | null
  Satuan_Minimal_Sewa: 'Bulan' | 'Tahun' | ''
  Harga_Jual1: number
  Harga_Jual2: number
  Harga_Sewa1: number
  Harga_Sewa2: number
  Keterangan: string
  Slug: string
  Area: string
  Akses_Jalan: string[]
  File_Image: string[]
  MediaUrls: MediaUrl[]
}

interface Province {
  id: string
  name: string
}

interface City {
  id: string
  name: string
}

interface UploadTicket {
  ExpireAt: Date
  ObjectName: string
  UploadUrl: string
}

interface MediaItem {
  Url: string | null
  Expired_At: string
  IsCompressed: boolean
  ContentType: string
  ThumbUrl: string | null
  Size: number
  Id_Media: string
  No_Id_Media: string
}

const specs = [
  { key: 'Jumlah_Kamar_Tidur', label: 'Jml Kamar', icon: 'lucide:bed' },
  { key: 'Jumlah_Kamar_Mandi', label: 'Jml KM', icon: 'lucide:bath' },
  { key: 'Jumlah_Carpot', label: 'Carport', icon: 'lucide:car' },
  { key: 'Daya_Listrik', label: 'Daya Listrik (W)' }
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
  Luas_Tanah: 0,
  Luas_Bangunan: 0,
  Jumlah_Lantai: 0,
  Jumlah_Kamar_Tidur: 0,
  Jumlah_Kamar_Mandi: 0,
  Jumlah_Carpot: 0,
  Daya_Listrik: 0,
  Status_Display: 'Aktif',
  Status_Properti: 'Tersedia',
  Status_Transaksi: ['Jual'],
  Flag_Sewa: 'Tidak',
  Ada_Minimal_Sewa: false,
  Minimal_Sewa: 0,
  Satuan_Minimal_Sewa: 'Tahun',
  Harga_Jual1: 0,
  Harga_Jual2: 0,
  Harga_Sewa1: 0,
  Harga_Sewa2: 0,
  Keterangan: '',
  Slug: '',
  Area: '',
  Akses_Jalan: [],
  File_Image: [],
  MediaUrls: []
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
      console.log('Masuk')
      if (props.itemData) {
        form.value = { ...props.itemData }

        if (props.itemData.Tipe_Ukuran) {
          const splitUkuran = props.itemData.Tipe_Ukuran.split('x')
          panjang.value = splitUkuran[0] || ''
          lebar.value = splitUkuran[1] || ''
        }

        if (props.itemData.File_Image) {
          console.log(props.itemData.MediaUrls)
          previewPhotos.value = props.itemData.MediaUrls
        } else {
          previewPhotos.value = []
        }

        if (props.itemData.Minimal_Sewa != null && props.itemData.Minimal_Sewa > 0) {
          form.value.Ada_Minimal_Sewa = true
        } else {
          form.value.Ada_Minimal_Sewa = false
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
    const { data } = await axios.get('/region/provinces.json')
    provinces.value = data
  } catch (err) {
    console.error(err)
  }
}

const getCity = async (id: string | number) => {
  try {
    const { data } = await axios.get('/region/regencies/' + id + '.json')
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
        previewPhotos.value.push({
          Id_Media: e.target.result,
          No_Id_Media: 'new_upload',
          Url: null,
          Expired_At: '',
          IsCompressed: false,
          ContentType: file.type,
          ThumbUrl: null,
          Size: file.size
        })

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
  form.value.File_Image?.splice(index, 1)
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
      form.value.Satuan_Minimal_Sewa = ''
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

    form.value.Slug = `${form.value.Tipe.toLowerCase()}-${baseSlug}-${newLuas || 0}`
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
    return data
  } catch (err) {
    console.error('Request upload URL gagal:', err)
    throw err
  }
}

const sendMedia = async (uploadUrl: string, media: File) => {
  if (!media || !(media instanceof File)) {
    console.error('sendMedia: Objek media tidak valid atau undefined')
    return null
  }

  try {
    const response = await axios.put(uploadUrl, media, {
      headers: {
        'Content-Type': media.type // Aman sekarang
      }
    })
    return response.data
  } catch (err) {
    console.log('Detail Media Error:', media)
    console.error('Gagal mengunggah biner ke Google Cloud:', err)
    throw err
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

const handleInputCurrency = (event: Event, field: 'Harga_Jual1' | 'Harga_Jual2' | 'Harga_Sewa1' | 'Harga_Sewa2') => {
  const input = event.target as HTMLInputElement

  const numericString = input.value.replace(/\D/g, '')

  if (!numericString) {
    form.value[field] = 0
    input.value = ''
    return
  }

  const pureNumber = parseInt(numericString, 10)

  form.value[field] = pureNumber

  input.value = formatCurrency(pureNumber)
}

const confirmMediaBatch = async (filesMetadata: any[]) => {
  try {
    const url = '/api/mediacloud/confirm-upload-batch'
    const { data } = await api.post(
      url,
      { files: filesMetadata },
      {
        headers: { 'X-Jenis-User': 'admin' }
      }
    )
    console.log(data)
    return data.MediaIds
  } catch (err) {
    console.error('Gagal konfirmasi batch:', err)
    throw err
  }
}

const submitForm = async () => {
  if (isLoading.value) return

  const isEdit = !!form.value.No_Id

  confirm(`Apakah Anda yakin ingin ${isEdit ? 'mengubah' : 'menambah'} data ini?`, async () => {
    isLoading.value = true

    try {
      const targetUrl = isEdit ? `/api/realEstate/update?no_id=${form.value.No_Id}` : '/api/realEstate/create'
      let finalMediaIds: string[] = []

      if (photos.value && photos.value.length > 0) {
        const uploadTickets = await reqUploadUrl()

        const validProcessCount = Math.min(uploadTickets.length, photos.value.length)
        const activePhotos = photos.value.slice(0, validProcessCount)
        const activeTickets = uploadTickets.slice(0, validProcessCount)

        await Promise.all(activeTickets.map((ticket: any, index: number) => sendMedia(ticket.UploadUrl, activePhotos[index])))

        const resIds = await confirmMediaBatch(
          activeTickets.map((ticket: any, index: number) => ({
            id_kategori: null,
            uploader_id: localStorage.getItem('no_id'),
            fileName: activePhotos[index].name,
            objectName: ticket.ObjectName,
            original_size: activePhotos[index].size,
            content_type: activePhotos[index].type
          }))
        )

        finalMediaIds = resIds
      }

      const combinedPhotos = [...new Set([...(form.value.File_Image || []), ...finalMediaIds])]

      const payload = {
        ...form.value,
        File_Image: combinedPhotos,
        Flag_Sewa: form.value.Status_Transaksi?.includes('Sewa') ? 'Ya' : 'Tidak'
      }

      const { MediaUrls, ...cleanPayload } = payload

      console.log('FINAL PAYLOAD:', cleanPayload)

      await api[isEdit ? 'put' : 'post'](targetUrl, cleanPayload, {
        headers: { 'X-Jenis-User': 'admin' }
      })

      success(`Data berhasil disimpan!`)
      emit('success')
      emit('update:showModal', false)
    } catch (err: any) {
      console.error('Submit Error:', err)
      fail(err.response?.data?.message || err.message || 'Gagal menyimpan data.')
    } finally {
      isLoading.value = false
    }
  })
}

onMounted(async () => {
  await getProvince()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <Transition 
    enter-active-class="transition duration-300 ease-out" 
    enter-from-class="opacity-0" 
    enter-to-class="opacity-100" 
    leave-active-class="transition duration-200 ease-in" 
    leave-from-class="opacity-100" 
    leave-to-class="opacity-0"
  >
  <div v-if="showModal" class="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div class="bg-card w-full max-w-5xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
      <div class="flex justify-between items-center p-5 border-b">
        <h2 class="text-xl font-extrabold text-default-900">{{ form.No_Id ? 'Edit' : 'Tambah' }} Properti</h2>
        <button @click="$emit('update:showModal', false)" class="p-2 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500">
          <Icon icon="lucide:x" class="size-6" />
        </button>
      </div>

      <div class="px-6 py-3 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="space-y-5">
          <div class="field" v-if="form.No_Id && form.Status_Properti == 'Tersedia'">
            <div class="toggle-box mt-2">
              <span class="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase"> <Icon icon="lucide:power" /> {{ form.Status_Display }} </span>
              <button @click="form.Status_Display = form.Status_Display === 'Aktif' ? 'Nonaktif' : 'Aktif'" class="toggle" :class="form.Status_Display === 'Aktif' ? 'toggle-active' : ''">
                <span class="toggle-circle" :class="form.Status_Display === 'Aktif' ? 'translate-x-6' : ''"></span>
              </button>
            </div>
          </div>
          <div class="col-span-2 space-y-2 !mb-3" :class="form.Status_Display === 'Aktif' ? '' : 'inactive'">
            <label class="label block" :class="form.Status_Display === 'Aktif' ? '' : 'inactive'">Gambar Produk</label>
            <div ref="scrollContainer" class="preview-container flex flex-nowrap gap-3 overflow-x-auto pb-2 custom-scroll">
              <div v-if="previewPhotos.length >= 1" v-for="(img, i) in previewPhotos" :key="i" class="preview-box relative size-24 flex-shrink-0">
                <img :src="img.Id_Media" class="size-full object-cover rounded-xl border border-slate-200" />
                <button @click="removePhoto(i)" class="preview-delete">✕</button>
              </div>

              <label class="size-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-shrink-0 flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-primary/50 transition-all text-slate-400 group">
                <Icon icon="lucide:plus" class="size-6 group-hover:text-primary transition-colors" />
                <span class="text-[10px] font-bold mt-1 group-hover:text-primary">TAMBAH</span>
                <input type="file" multiple hidden @change="handlePhoto" accept="image/*" />
              </label>

              <div v-if="!previewPhotos.length" class="flex-shrink-0 text-slate-500 text-[10px] italic flex items-center px-2">Belum ada foto terpilih</div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="field" :class="{ inactive: form.Status_Display !== 'Aktif' }">
              <label class="label">Tipe Properti</label>
              <div class="relative">
                <select v-model="form.Tipe" class="field-input !pl-4 w-full appearance-none">
                  <option value="Rumah">Rumah</option>
                  <option value="Apartemen">Apartemen</option>
                  <option value="Villa">Villa</option>
                  <option value="Mansion">Mansion</option>
                </select>
                <Icon icon="lucide:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none text-slate-400" />
              </div>
            </div>

            <div class="md:col-span-2 field" :class="{ inactive: form.Status_Display !== 'Aktif' }">
              <label class="label">Nama Properti</label>
              <div class="relative">
                <Icon icon="lucide:house" class="field-icon" />
                <input v-model="form.Nama_Produk" placeholder="Contoh: The Sapphire Sky Mansion" class="field-input w-full" />
              </div>
            </div>
          </div>

          <div class="field" ref="dropdownRef" :class="form.Status_Display === 'Aktif' ? '' : 'inactive'">
            <label class="label flex justify-between">
              Area & Alamat
              <label class="flex items-center gap-1 cursor-pointer text-[10px] text-slate-500">
                <input type="checkbox" v-model="form.Hide_alamat" class="size-3 rounded form-checkbox" />
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

                  <div v-if="openProvince" class="absolute bottom-full left-0 mb-1 w-full max-w-[420px] max-h-62 z-[9999] bg-card rounded-2xl shadow-2xl border border-slate-200 flex flex-col">
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

                  <div v-if="openCity" class="absolute bottom-full left-0 mb-1 w-full max-w-[420px] max-h-62 z-[9999] bg-card rounded-2xl shadow-2xl border border-slate-200 flex flex-col">
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

          <div class="bg-default-50 p-4 rounded-2xl space-y-4 border border-slate-100" :class="form.Status_Display === 'Aktif' ? '' : 'inactive'">
            <div class="flex items-center gap-4 border-b border-slate-200 pb-2">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opsi Transaksi</span>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input type="checkbox" value="Jual" v-model="form.Status_Transaksi" class="form-checkbox" />
                  JUAL
                </label>

                <label class="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input type="checkbox" value="Sewa" v-model="form.Status_Transaksi" class="form-checkbox" />
                  SEWA
                </label>

                <label v-if="form.Status_Transaksi.includes('Sewa')" class="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input type="checkbox" v-model="form.Ada_Minimal_Sewa" class="form-checkbox" />
                  MIN SEWA
                </label>
              </div>
            </div>

            <div v-if="form.Status_Transaksi.includes('Jual')" class="grid grid-cols-2 gap-3">
              <div class="field" :class="form.Status_Display === 'Aktif' ? '' : 'inactive'">
                <label class="label !text-slate-500">Harga Jual Normal (Rp)</label>
                <input type="text" :value="form.Harga_Jual1 ? formatCurrency(form.Harga_Jual1) : ''" @input="handleInputCurrency($event, 'Harga_Jual1')" class="field-input !pl-4" placeholder="Harga awal" />
              </div>

              <div class="field" :class="form.Status_Display === 'Aktif' ? '' : 'inactive'">
                <label class="label !text-bejo-600">Harga Jual Diskon (Rp)</label>
                <input type="text" :value="form.Harga_Jual2 ? formatCurrency(form.Harga_Jual2) : ''" @input="handleInputCurrency($event, 'Harga_Jual2')" class="field-input !pl-4 focus:border-emerald-500" :class="form.Harga_Jual2 > 0 && form.Harga_Jual2 >= form.Harga_Jual1 ? '!border-red-500 focus:!border-red-500' : 'border-emerald-200'" placeholder="Setelah diskon" />
                <span v-if="form.Harga_Jual2 > 0 && form.Harga_Jual2 >= form.Harga_Jual1" class="text-xs text-red-500 mt-1 inline-block font-medium"> ⚠️ Harga diskon harus lebih kecil dari harga normal. </span>
              </div>
            </div>

            <div v-if="form.Status_Transaksi.includes('Sewa')" class="grid grid-cols-2 gap-3 mt-3">
              <div class="field" :class="form.Status_Display === 'Aktif' ? '' : 'inactive'">
                <label class="label !text-slate-500">Harga Sewa Normal (Rp)</label>

                <div class="flex items-center gap-2">
                  <input type="text" :value="form.Harga_Sewa1 ? formatCurrency(form.Harga_Sewa1) : ''" @input="handleInputCurrency($event, 'Harga_Sewa1')" class="field-input !pl-4 w-full" placeholder="Harga awal" />
                  <span class="text-slate-500 font-medium whitespace-nowrap">/{{ form.Satuan_Minimal_Sewa || 'Tahun' }}</span>
                </div>
              </div>

              <div class="field" :class="form.Status_Display === 'Aktif' ? '' : 'inactive'">
                <label class="label !text-bejo-600">Harga Sewa Diskon (Rp)</label>
                <div class="flex items-center gap-2">
                  <input type="text" :value="form.Harga_Sewa2 ? formatCurrency(form.Harga_Sewa2) : ''" @input="handleInputCurrency($event, 'Harga_Sewa2')" class="field-input !pl-4 focus:border-blue-500" :class="form.Harga_Sewa2 > 0 && form.Harga_Sewa2 >= form.Harga_Sewa1 ? '!border-red-500 focus:!border-red-500' : 'border-blue-200'" placeholder="Setelah diskon" />
                  <span class="text-slate-500 font-medium whitespace-nowrap">/{{ form.Satuan_Minimal_Sewa || 'Tahun' }}</span>
                </div>
                <span v-if="form.Harga_Sewa2 > 0 && form.Harga_Sewa2 >= form.Harga_Sewa1" class="text-xs text-red-500 mt-1 inline-block font-medium"> ⚠️ Harga diskon sewa harus lebih kecil dari harga sewa normal. </span>
              </div>
            </div>

            <div v-if="form.Ada_Minimal_Sewa" class="grid grid-cols-2 gap-3">
              <div class="field" :class="form.Status_Display === 'Aktif' ? '' : 'inactive'">
                <label class="label !text-slate-500">Minimal Sewa</label>
                <input v-model="form.Minimal_Sewa" type="number" class="field-input !pl-4" min="0" placeholder="Minimal sewa" />
              </div>
              <div class="field" :class="form.Status_Display === 'Aktif' ? '' : 'inactive'">
                <label class="label !text-slate-600">Satuan</label>
                <select v-model="form.Satuan_Minimal_Sewa" class="field-input !pl-4">
                  <option value="Bulan">Bulan</option>
                  <option value="Tahun" selected>Tahun</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-4 h-full" :class="form.Status_Display === 'Aktif' ? '' : 'inactive'">
          <div class="field">
            <label class="label"> Url Slug </label>
            <div class="relative">
              <Icon icon="lucide:link-2" class="field-icon" />
              <input v-model="form.Slug" class="field-input" readonly />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="field" :class="form.Status_Display === 'Aktif' ? '' : 'inactive'">
              <label class="label">Sertifikat</label>
              <select v-model="form.Jenis_Sertifikat" class="field-input !pl-4">
                <option value="SHM">SHM</option>
                <option value="SHGB">SHGB</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div class="field" :class="form.Status_Display === 'Aktif' ? '' : 'inactive'">
              <label class="label">Dimensi (P x L)</label>
              <div class="flex gap-2 items-center">
                <input v-model="panjang" placeholder="P" type="number" class="field-input !pl-2 text-center" />
                <span class="text-slate-300">x</span>
                <input v-model="lebar" placeholder="L" type="number" class="field-input !pl-2 text-center" />
              </div>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div class="field" :class="form.Status_Display === 'Aktif' ? '' : 'inactive'"><label class="label">Luas Tanah (m²)</label><input v-model="form.Luas_Tanah" type="number" class="field-input !pl-4" /></div>
            <div class="field" :class="form.Status_Display === 'Aktif' ? '' : 'inactive'"><label class="label">Luas Bangunan (m²)</label><input v-model="form.Luas_Bangunan" type="number" class="field-input !pl-4" /></div>
            <div class="field" :class="form.Status_Display === 'Aktif' ? '' : 'inactive'"><label class="label">Jumlah Lantai</label><input v-model="form.Jumlah_Lantai" type="number" class="field-input !pl-4" /></div>
          </div>
          <div class="grid grid-cols-4 gap-2">
            <div v-for="s in specs" :key="s.key" class="field">
              <label class="label">{{ s.label }}</label>
              <input v-model="form[s.key as keyof RealEstateForm]" type="number" class="field-input !pl-4" />
            </div>
          </div>

          <div class="field" :class="form.Status_Display === 'Aktif' ? '' : 'inactive'">
            <label class="label">Aksesibilitas (Contoh: 5 min ke Tol)</label>
            <div class="flex gap-2">
              <input v-model="newAkses" @keyup.enter="addAkses" placeholder="Ketik akses..." class="field-input !pl-4" />
              <button @click="addAkses" class="bg-slate-800 text-white px-3 rounded-xl"><Icon icon="lucide:plus" /></button>
            </div>
            <div class="flex flex-wrap gap-2 mt-2">
              <span v-for="(a, i) in form.Akses_Jalan" :key="i" class="bg-card border text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1"> {{ a }} <Icon @click="form.Akses_Jalan.splice(i, 1)" icon="lucide:x" class="text-red-500 cursor-pointer" /> </span>
            </div>
          </div>

          <div class="field flex flex-col flex-1" :class="form.Status_Display === 'Aktif' ? '' : 'inactive'">
            <label class="label">Keterangan</label>
            <textarea v-model="form.Keterangan" class="field-input !pl-4 pt-2 resize-none flex-1 w-full" placeholder="Ceritakan keunggulan properti..."></textarea>
          </div>
        </div>
      </div>

      <div class="p-5 border-t flex justify-end gap-3 bg-default-50/50">
        <button @click="$emit('update:showModal', false)" class="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-card rounded-xl transition-all">Batal</button>
        <button :disabled="isLoading" @click="submitForm" class="px-8 py-2.5 bg-primary text-white text-sm font-black rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
          <span v-if="isLoading">Sedang Mengunggah...</span>
          <span v-else>Simpan Data</span>
        </button>
      </div>
    </div>
  </div>
  </Transition>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.label {
  @apply block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5 ml-1 tracking-wider;
}
.field {
  @apply text-slate-500;
}
.inactive {
  @apply opacity-50 pointer-events-none grayscale;
}
.field-icon {
  @apply absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none;
}
.field-input {
  @apply w-full border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none;
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
}
</style>
