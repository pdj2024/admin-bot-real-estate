<template>
  <div class="lg:col-span-3 col-span-1">
    <div class="items-center">
      <div class="flex items-center md:justify-between flex-wrap gap-2 mb-4 print:hidden">
        <div class="w-full md:w-auto">
          <p class="text-default-700 text-sm mb-2 md:mb-0">
            Menampilkan <b>{{ catalogues.length }}</b> rumah
          </p>

          <div class="hs-dropdown relative inline-flex w-full md:w-auto text-default-900 text-lg font-semibold">
            <button type="button" class="hs-dropdown-toggle inline-flex items-center justify-between w-full md:w-auto btn btn-sm bg-transparent border border-primary text-primary transition-all duration-300 hover:bg-primary hover:text-white" aria-haspopup="true" aria-expanded="false">
              Sort by:
              <b class="font-medium ms-1">{{ selectedSort }}</b>
              <Icon icon="lucide:chevron-down" class="size-4 ms-2" />
            </button>

            <div class="hs-dropdown-menu hidden transition-[opacity,margin] duration-300 opacity-0 min-w-40 md:min-w-[160px] card z-30 mt-2 p-2 text-sm" role="menu">
              <button class="dropdown-item" @click="setSort('Newest')">Newest</button>

              <button class="dropdown-item" @click="setSort('Lowest Price')">Lowest Price</button>

              <button class="dropdown-item" @click="setSort('Highest Price')">Highest Price</button>

              <hr class="border-t border-default-200 my-2 -mx-2" />

              <button class="dropdown-item" @click="setSort('Largest Area')">Largest Area</button>

              <button class="dropdown-item" @click="setSort('Smallest Area')">Smallest Area</button>
            </div>
          </div>
        </div>

        <nav class="w-full md:w-auto md:flex items-center gap-2 text-sm font-semibold mt-2 md:mt-0">
          <button @click="showModal = true" class="inline-flex items-center justify-center w-full md:w-auto gap-2 bg-primary text-white px-3 py-2 rounded-lg hover:bg-blue-600 font-semibold">
            <Icon icon="lucide:house-plus" class="size-4" />
            Tambah Rumah
          </button>
        </nav>
      </div>
      <button type="button" @click="$emit('openFilter')" class="btn-trigger-filter lg:hidden w-full flex justify-center items-center btn btn-sm bg-primary/10 hover:bg-primary/30 text-primary py-2 rounded-xl"><Icon icon="lucide:sliders-horizontal" class="size-4 mr-2" /> Filter</button>
    </div>
    <div class="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 mt-5">
      <div class="card overflow-hidden group" v-for="(item, idx) in catalogues" :key="idx">
        <div class="card-body p-0 relative overflow-hidden">
          <img :src="item.image" alt="rumah" class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110" />
          <span class="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded"> TERSEDIA </span>
          <span class="absolute bottom-17 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded"> Akses Bandara ± 27 min</span>
          <span class="absolute bottom-10 right-3 bg-amber-600 text-white text-[10px] font-bold px-2 py-1 rounded"> Akses tol ± 10 min</span>
          <span class="absolute bottom-3 right-3 bg-cyan-600 text-white text-[10px] font-bold px-2 py-1 rounded"> Akses rumah sakit ± 5 min</span>
        </div>

        <div class="p-4">
          <div class="flex items-center gap-1 text-primary">
            <Icon icon="lucide:map-pin" class="size-3"></Icon>
            <span class="text-[11px] font-medium uppercase tracking-wider">{{ item.location || 'Surabaya Timur' }}</span>
          </div>
            <p class="text-[11px] font-medium uppercase tracking-wider text-default-500 mb-2">Jl. Ini Hanya Sementara</p>


          <h6 class="text-base text-default-800 font-bold hover:text-primary transition-all mb-1 line-clamp-1">
            <RouterLink to="">{{ item.name }}</RouterLink>
          </h6>
            <p class="text-xs font-semibold text-default-400 leading-none mb-1">Tipe {{ item.type || '45' }}</p>


          <div class="grid lg:grid-cols-3 grid-cols-2 gap-y-3 gap-x-2 border-y border-default-100 py-3 mb-4">
            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:building" class="size-3.5 text-default-400"></Icon>
              <span class="text-xs text-default-600">LB {{ item.buildingSize }}m²</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:land-plot" class="size-3.5 text-default-400"></Icon>
              <span class="text-xs text-default-600">LT {{ item.landSize }}m²</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:bed" class="size-3.5 text-default-400"></Icon>
              <span class="text-xs text-default-600">{{ item.bedrooms }} Kamar</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:bath" class="size-3.5 text-default-400"></Icon>
              <span class="text-xs text-default-600">{{ item.bathrooms }} WC</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:car" class="size-3.5 text-default-400"></Icon>
              <span class="text-xs text-default-600">{{ item.carport }} Mobil</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:layers" class="size-3.5 text-default-400"></Icon>
              <span class="text-xs text-default-600">{{ item.floors || 1 }} Lantai</span>
            </div>
          </div>

          <div class="flex items-end justify-between gap-2 mt-4">
            <div>
              <p class="text-[10px] text-default-400 leading-none mb-1">Mulai Dari</p>
              <h5 class="text-lg font-bold text-primary">
                {{ item.price }}
              </h5>
            </div>

            <div class="hs-dropdown relative inline-flex">
              <button type="button" class="hs-dropdown-toggle btn size-9 bg-default-200 hover:bg-default-600 text-default-500 hover:text-white" aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown" hs-dropdown-placement="bottom-end">
                <Icon icon="lucide:ellipsis" class="iconify size-4"></Icon>
              </button>
              <div class="hs-dropdown-menu" role="menu">
                <RouterLink class="w-full flex items-center gap-1.5 py-1.5 font-medium px-3 text-default-500 hover:bg-default-150 rounded" to="/katalog/detail">
                  <Icon icon="lucide:eye" class="size-3"></Icon>
                  Overview
                </RouterLink>
                <button class="w-full flex items-center gap-1.5 py-1.5 font-medium px-3 text-default-500 hover:bg-default-150 rounded" @click="showModal = true">
                  <Icon icon="lucide:edit" class="size-3"></Icon>
                  Edit
                </button>
                <button class="w-full flex items-center gap-1.5 py-1.5 font-medium px-3 text-default-500 hover:bg-default-150 rounded" @click="remove">
                  <Icon icon="lucide:trash-2" class="size-3"></Icon>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-wrap md:justify-between justify-center md:gap-0 gap-4 mt-5">
      <p class="text-default-500 text-sm">Showing <b>07</b> of <b>19</b> Results</p>
      <nav class="flex items-center gap-2" aria-label="Pagination">
        <button type="button" class="btn btn-sm border bg-transparent border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10"><Icon icon="lucide:chevron-left" class="size-4 me-1"></Icon> Prev</button>
        <button type="button" class="btn size-7.5 bg-transparent border border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10">1</button>
        <button type="button" class="btn size-7.5 bg-primary text-white">2</button>
        <button type="button" class="btn size-7.5 bg-transparent border border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10">3</button>
        <button type="button" class="btn btn-sm border bg-transparent border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10">
          Next
          <Icon icon="lucide:chevron-right" class="size-4 ms-1"></Icon>
        </button>
      </nav>
    </div>
  </div>

  <!-- MODAL -->
  <div v-if="showModal" class="fixed inset-0 z-[999] flex items-center justify-center bg-black/40" @click.self="showModal = false">
    <div class="bg-white w-full max-w-4xl rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center p-4 border-b">
        <h2 class="text-lg font-semibold">Tambah Rumah</h2>
        <button @click="showModal = false">
          <Icon icon="lucide:x" />
        </button>
      </div>

      <div class="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-3">
            <div class="field w-35">
              <div v-for="(img, index) in previewPhotos" :key="index" class="preview-box">
                <img :src="img" class="preview-img" />

                <button @click="removePhoto(index)" class="preview-delete">✕</button>
              </div>

              <div v-if="previewPhotos.length === 0" class="preview-box flex items-center justify-center">
                <img src="https://cdn-icons-png.flaticon.com/512/685/685655.png" class="w-12 opacity-40" />
              </div>
            </div>

            <label class="upload-box">
              <Icon icon="lucide:upload" class="size-5" />
              <span>Upload Foto Rumah</span>
              <input type="file" multiple @change="handlePhoto" />
            </label>
          </div>

          <div class="field">
            <Icon icon="lucide:home" class="field-icon" />

            <input v-model="form.nama" placeholder="Nama Properti" class="field-input" />
          </div>

          <div class="field">
            <Icon icon="lucide:map-pin" class="field-icon" />
            <input v-model="form.alamat" placeholder="Alamat" class="field-input" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="field">
              <Icon icon="lucide:banknote" class="field-icon" />
              <input v-model="form.harga_jual.harga_1" type="number" placeholder="Harga Jual Awal" class="field-input" />
            </div>

            <div class="field">
              <Icon icon="lucide:banknote" class="field-icon" />
              <input v-model="form.harga_jual.harga_2" type="number" placeholder="Harga Jual Diskon" class="field-input" />
            </div>

            <div class="field">
              <Icon icon="lucide:banknote" class="field-icon" />
              <input v-model="form.harga_sewa.harga_1" type="number" placeholder="Harga Sewa Awal" class="field-input" />
            </div>

            <div class="field">
              <Icon icon="lucide:banknote" class="field-icon" />
              <input v-model="form.harga_sewa.harga_2" type="number" placeholder="Harga Sewa Diskon" class="field-input" />
            </div>
          </div>
          <div class="toggle-box w-full col-span-2">
            <span class="flex items-center gap-2 text-sm">
              <Icon icon="lucide:power" />
              Status Display
            </span>

            <button @click="form.status_display = form.status_display === 'aktif' ? 'nonaktif' : 'aktif'" class="toggle" :class="form.status_display === 'aktif' ? 'toggle-active' : ''">
              <span class="toggle-circle" :class="form.status_display === 'aktif' ? 'translate-x-6' : ''"></span>
            </button>
          </div>

          <div class="field col-span-2">
            <Icon icon="lucide:repeat" class="field-icon" />

            <div class="field-input flex items-center gap-4">
              <span class="text-sm text-gray-500 mr-2"> Jenis Transaksi </span>

              <label class="flex items-center gap-1 text-sm cursor-pointer">
                <input type="checkbox" value="jual" v-model="form.status_transaksi" class="rounded border-gray-300" />
                Jual
              </label>

              <label class="flex items-center gap-1 text-sm cursor-pointer">
                <input type="checkbox" value="sewa" v-model="form.status_transaksi" class="rounded border-gray-300" />
                Sewa
              </label>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 items-start">
          <div class="hs-dropdown relative w-full">
            <button type="button" class="hs-dropdown-toggle field-input flex items-center">
              <Icon icon="lucide:file-text" class="field-icon" />

              <span class="flex-1 text-left">
                {{ form.sertifikat || 'Sertifikat' }}
              </span>

              <Icon icon="lucide:chevron-down" class="size-4 ml-auto" />
            </button>

            <div class="hs-dropdown-menu hidden mt-2 min-w-[120px] card p-2 text-sm z-50">
              <button class="dropdown-item w-full" @click="form.sertifikat = 'SHM'">SHM</button>

              <button class="dropdown-item w-full" @click="form.sertifikat = 'SHGB'">SHGB</button>
            </div>
          </div>

          <div class="field">
            <Icon icon="lucide:land-plot" class="field-icon" />
            <input v-model="form.spesifikasi.luas_tanah" type="number" placeholder="Luas Tanah" class="field-input" />
          </div>

          <div class="field">
            <Icon icon="lucide:building" class="field-icon" />
            <input v-model="form.spesifikasi.luas_bangunan" type="number" placeholder="Luas Bangunan" class="field-input" />
          </div>

          <div class="field">
            <Icon icon="lucide:bed" class="field-icon" />
            <input v-model="form.spesifikasi.kamar_tidur" type="number" placeholder="Kamar" class="field-input" />
          </div>

          <div class="field">
            <Icon icon="lucide:bath" class="field-icon" />
            <input v-model="form.spesifikasi.kamar_mandi" type="number" placeholder="WC" class="field-input" />
          </div>

          <div class="field">
            <Icon icon="lucide:car" class="field-icon" />
            <input v-model="form.spesifikasi.carport" type="number" placeholder="Carport" class="field-input" />
          </div>

          <div class="field">
            <Icon icon="lucide:zap" class="field-icon" />
            <input v-model="form.spesifikasi.listrik" type="number" placeholder="Listrik" class="field-input" />
          </div>

          <div class="field">
            <Icon icon="lucide:layers-3" class="field-icon" />
            <input v-model="form.spesifikasi.lantai" type="number" placeholder="Jumlah Lantai" class="field-input" />
          </div>

          <div class="field col-span-2">
            <Icon icon="lucide:info" class="field-icon" />

            <textarea v-model="form.keterangan" name="keterangan" placeholder="Keterangan" class="field-input resize-none h-48"></textarea>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 p-4 border-t">
        <button @click="showModal = false" class="px-4 py-2 border rounded-lg">Batal</button>

        <button @click="submitForm" class="px-4 py-2 bg-primary text-white rounded-lg">Simpan</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type='checkbox'] {
  accent-color: #3b82f6;
}

.field {
  position: relative;
}

.field-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  width: 16px;
  pointer-events: none;
  opacity: 0.7;
  font-size: 14px;
}

.field-input {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 12px;
  padding-left: 36px;
  font-size: 14px;
  background: white;
}

.field-input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

.dropdown-item {
  display: block;
  text-align: left;
  padding: 6px 10px;
  border-radius: 6px;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.upload-box {
  /* border: 1px dashed #d1d5db;
  border-radius: 10px; */
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
}

.upload-box input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.preview-box {
  position: relative;
  width: 100%;
  aspect-ratio: 1/1;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview-delete {
  position: absolute;
  top: 4px;
  right: 4px;
  background: red;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
}

.toggle-box {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between; /* kiri kanan */
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: transparent;
}

.toggle {
  width: 48px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 999px;
  position: relative;
  transition: all 0.25s;
}

.toggle-active {
  background: #2b7fff;
}

.toggle-circle {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 999px;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.25s;
}
</style>

<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { RouterLink } from 'vue-router'
import { catalogues } from './data'
import { type IStaticMethods } from 'preline/preline'
import { confirm, success } from '@/utils/sweet-alert'

const showModal = ref<boolean>(false)
const selectedSort = ref('Newest')

type Transaksi = 'jual' | 'sewa'
type StatusDisplay = 'aktif' | 'nonaktif'
type StatusProperti = 'tersedia' | 'terjual' | 'tersewa'
type Sertifikat = 'SHM' | 'SHGB' | null

const setSort = (sort: string) => {
  selectedSort.value = sort
}

interface PropertyForm {
  nama: string
  alamat: string
  tipe: string
  tipe_bangunan: string
  sertifikat: Sertifikat

  spesifikasi: {
    luas_tanah: number | null
    luas_bangunan: number | null
    lantai: number | null
    kamar_tidur: number | null
    kamar_mandi: number | null
    carport: number | null
    listrik: number | null
  }

  status_display: StatusDisplay
  status_properti: StatusProperti
  status_transaksi: Transaksi[]

  minimal_sewa: number | null

  harga_jual: {
    harga_1: number | null
    harga_2: number | null
  }

  harga_sewa: {
    harga_1: number | null
    harga_2: number | null
  }

  keterangan: string
  slug: string
}

const defaultForm = (): PropertyForm => ({
  nama: '',
  alamat: '',
  tipe: '',
  tipe_bangunan: '',
  sertifikat: null,

  spesifikasi: {
    luas_tanah: null,
    luas_bangunan: null,
    lantai: null,
    kamar_tidur: null,
    kamar_mandi: null,
    carport: null,
    listrik: null
  },

  status_display: 'aktif',
  status_properti: 'tersedia',
  status_transaksi: [],

  minimal_sewa: null,

  harga_jual: {
    harga_1: null,
    harga_2: null
  },

  harga_sewa: {
    harga_1: null,
    harga_2: null
  },

  keterangan: '',
  slug: ''
})

const form = ref<PropertyForm>(defaultForm())

const resetForm = () => {
  form.value = defaultForm()
  photos.value = []
  previewPhotos.value = []
}

const photos = ref<File[]>([])
const previewPhotos = ref<string[]>([])

const handlePhoto = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files

  if (!files) return

  photos.value = Array.from(files)

  previewPhotos.value = photos.value.map((file) => URL.createObjectURL(file))
}

const removePhoto = (index: number) => {
  previewPhotos.value.splice(index, 1)
  photos.value.splice(index, 1)
}

const submitForm = () => {
  confirm('Apakah Anda yakin isian sudah benar?', () => {
    console.log('FORM DATA:', form.value)
    console.log('PHOTOS:', photos.value)

    resetForm()
    showModal.value = false
    success('Data berhasil terkirim')
  })
}

const remove = () => {
  confirm('Apakah Anda yakin ingin menghapus rumah ini?', () => {
    success('Data rumah berhasil dihapus')
  })
}

watch(
  () => form.value.nama,
  (val) => {
    if (!val) return

    form.value.slug = val
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-+/g, '-')
  }
)

watch(showModal, async (val) => {
  if (!val) return

  await nextTick()
  window.HSStaticMethods?.autoInit()
})

declare global {
  interface Window {
    HSStaticMethods: IStaticMethods
  }
}

const emit = defineEmits<{
  (e: 'openFilter'): void
}>()

watch(showModal, async (val) => {
  if (!val) return
  await nextTick()
  window.HSStaticMethods?.autoInit()
})

onMounted(async () => {
  await nextTick()

  setTimeout(() => {
    if (window.HSStaticMethods) {
      window.HSStaticMethods.autoInit()
    }
  }, 100)
})
</script>
