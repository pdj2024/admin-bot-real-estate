<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-center bg-white p-4 mb-5 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 gap-4 mb-2">
      <div class="text-sm text-slate-800 font-medium px-2">
        Tampil <span class="text-bejo-600 font-black text-base">{{ table.getFilteredRowModel().rows.length }}</span> Properti Ditemukan
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto relative">
        <button @click="$emit('openFilter')" class="lg:hidden flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm font-bold text-slate-700"><Icon icon="lucide:filter" class="size-4" /> Filter</button>

        <div id="transaksi-container" class="relative flex-1 sm:flex-none">
          <button @click="isTransaksiOpen = !isTransaksiOpen" class="w-full flex items-center justify-between gap-3 px-4 py-2 border border-slate-200 rounded-xl bg-white text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-700">
            <div class="flex items-center gap-2">
              <Icon icon="lucide:tag" class="size-4 text-bejo-500" />
              <span>{{ selectedTransaksi }}</span>
            </div>
            <Icon icon="lucide:chevron-down" class="size-4 opacity-50" />
          </button>

          <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <div v-show="isTransaksiOpen" class="absolute right-0 sm:left-0 sm:right-auto top-full mt-2 z-50 min-w-[180px] bg-white border border-slate-200 shadow-lg shadow-slate-200/50 p-2 rounded-2xl">
              <button @click="handleTransaksi('Semua Label')" class="dropdown-item">Semua Label</button>
              <hr class="my-2 border-slate-100" />
              <button @click="handleTransaksi('Jual Saja')" class="dropdown-item">Jual Saja</button>
              <button @click="handleTransaksi('Sewa Saja')" class="dropdown-item">Sewa Saja</button>
              <button @click="handleTransaksi('Jual & Sewa')" class="dropdown-item">Jual & Sewa</button>
            </div>
          </Transition>
        </div>

        <div id="sorting-container" class="relative flex-1 sm:flex-none">
          <button @click="isSortOpen = !isSortOpen" class="w-full flex items-center justify-between gap-3 px-4 py-2 border border-slate-200 rounded-xl bg-white text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-700">
            <div class="flex items-center gap-2">
              <Icon icon="lucide:arrow-up-down" class="size-4 text-bejo-500" />
              <span>{{ selectedSort }}</span>
            </div>
            <Icon icon="lucide:chevron-down" class="size-4 opacity-50" />
          </button>

          <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <div v-show="isSortOpen" class="absolute right-0 top-full mt-2 z-50 min-w-[200px] bg-white border border-slate-200 shadow-lg shadow-slate-200/50 p-2 rounded-2xl">
              <button @click="handleSort('Terbaru')" class="dropdown-item">Terbaru</button>
              <button @click="handleSort('Harga Termurah')" class="dropdown-item">Harga Termurah</button>
              <button @click="handleSort('Harga Termahal')" class="dropdown-item">Harga Termahal</button>
              <hr class="my-2 border-slate-100" />
              <button @click="handleSort('Luas Terbesar')" class="dropdown-item">Luas Terbesar</button>
            </div>
          </Transition>
        </div>

        <button v-if="isAdmin" @click="$router.push('/admin/properti/tambah')" class="flex items-center justify-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-bejo-600 hover:shadow-lg hover:shadow-bejo-600/30 transition-all flex-1 sm:flex-none"><Icon icon="lucide:plus" class="size-4" /> Tambah</button>
      </div>
    </div>

    <div class="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
      <div v-for="(row, idx) in (isLoading ? Array.from({length: 6}).map(() => ({ original: {} })) as any : table.getRowModel().rows)" :key="row.id || idx" class="group flex flex-col h-full rounded-[2rem] overflow-hidden border transition-all duration-500 relative bg-white border-slate-100 shadow-xl shadow-slate-200/30" :class="!isLoading ? 'hover:-translate-y-2 hover:shadow-2xl hover:border-bejo-200 hover:shadow-bejo-600/10 cursor-pointer' : ''">
        <div class="relative h-60 overflow-hidden" :class="isLoading ? 'bg-slate-200 animate-pulse' : 'bg-slate-100'">
          <div v-if="row.original?.Status_Display && row.original.Status_Display != 'Aktif' && row.original.Status_Properti != 'Tersedia'" class="absolute inset-0 bg-black/40 backdrop-grayscale-[60%] z-[5] pointer-events-none transition-all duration-500"></div>

          <div v-if="row.original?.Status_Display && row.original.Status_Display != 'Aktif' && row.original.Status_Properti != 'Tersedia'" class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div class="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl transform transition-transform duration-500 group-hover:scale-110">
              <span class="text-sm font-black uppercase tracking-[0.2em] text-white">
                {{ row.original.Status_Display != 'Aktif' ? 'Nonaktif' : row.original.Status_Properti }}
              </span>
            </div>
          </div>

          <img v-if="row.original?.MediaUrls && row.original.MediaUrls.length >= 1" :src="row.original.MediaUrls[0].Id_Media" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div v-else-if="!isLoading" class="w-full h-full bg-slate-100 flex flex-col items-center justify-center">
            <Icon icon="lucide:image" class="size-16 text-slate-300" />
          </div>

          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" v-if="!isLoading"></div>

          <div class="absolute top-4 left-4 flex flex-col gap-2 z-10" v-if="!isLoading && row.original?.Status_Properti">
            <span class="w-fit bg-bejo-600/70 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md shadow-md border border-bejo-300/40">
              {{ row.original.Status_Display != 'Aktif' ? 'Nonaktif' : row.original.Status_Properti }}
            </span>

            <div class="flex flex-wrap gap-1.5" v-if="row.original?.Status_Transaksi">
              <span v-for="(trans, i) in row.original.Status_Transaksi" :key="i" class="bg-black/50 backdrop-blur-md text-bejo-100 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border border-bejo-700/60 shadow-sm">
                {{ trans }}
              </span>
            </div>
          </div>

          <div class="absolute bottom-4 right-4 flex flex-col gap-1.5 items-end z-10" v-if="!isLoading && row.original?.Akses_Jalan">
            <span v-for="(akses, idx) in row.original.Akses_Jalan.slice(0, 2)" :key="idx" class="bg-white/90 backdrop-blur-md text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-md border-l-4 border-bejo-600 shadow-sm flex items-center gap-1.5">
              <Icon icon="lucide:map-pin" class="size-2.5 text-bejo-600" />
              {{ akses }}
            </span>
          </div>
        </div>
        <div class="p-5 flex flex-col flex-1">
          <div class="flex items-start gap-1.5 text-bejo-600 mb-2" :class="isLoading ? 'opacity-50 grayscale' : ''">
            <Icon icon="lucide:map-pin" class="size-3.5 mt-0.5" />
            <div class="flex flex-col">
              <span class="text-[11px] font-bold uppercase tracking-wider" :class="isLoading ? 'bg-slate-200 text-transparent animate-pulse rounded select-none w-1/3 mb-1' : 'text-bejo-600'">{{ !isLoading ? (row.original.Area ? row.original.Area[0] : '') : 'Area' }}</span>
              <p class="text-[10px] font-medium line-clamp-1" :class="isLoading ? 'bg-slate-200 text-transparent animate-pulse rounded select-none w-[80%]' : 'text-slate-500'">
                <span v-if="!row.original.Hide_alamat">{{
                  (row.original.Alamat || '')
                    .split(' ')
                    .filter(
                      (kata) =>
                        !(row.original.Area && row.original.Area[0] ? row.original.Area[0] : '')
                          .toLowerCase()
                          .replace(/[^a-z0-9\s]/g, '')
                          .split(/\s+/)
                          .includes(kata.toLowerCase().replace(/[^a-z0-9]/g, ''))
                    )
                    .join(' ')
                    .replace(/[,.\s]+$/, '')
                }}</span>
                <span v-if="!isLoading && row.original?.Area && row.original.Area[1]"> ({{ row.original.Area[1] }})</span>
                <span v-if="isLoading">Memuat Detail Alamat Lanjutan..</span>
              </p>
            </div>
          </div>

          <h6 class="text-lg font-black transition-colors line-clamp-1 mb-1 leading-tight" :class="isLoading ? 'text-transparent bg-slate-200 animate-pulse rounded select-none w-full' : 'group-hover:text-bejo-600 text-slate-900'">
            <RouterLink v-if="!isLoading" :to="isAdmin ? `/properti/detail/${row.original.Slug}` : `/detail/${row.original.Slug}`">{{ row.original.Nama_Produk }}</RouterLink>
            <span v-else>Memuat Nama Katalog Properti Terbaru</span>
          </h6>

          <p class="text-[12px] font-medium mb-4" :class="isLoading ? 'text-transparent bg-slate-200 animate-pulse rounded select-none w-2/3' : 'text-slate-400'">
            {{ !isLoading ? row.original.Tipe : 'Tipe' }} &bull; Tipe {{ !isLoading ? row.original.Luas_Bangunan : 0 }} <span class="opacity-70" v-if="!isLoading && row.original.Tipe_Ukuran">[{{ row.original.Tipe_Ukuran }}]</span>
          </p>

          <div class="grid grid-cols-2 gap-3 rounded-2xl p-4 mb-5 border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100/50 shadow-inner">
            <div class="flex items-center gap-2">
              <div class="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0" :class="isLoading ? 'opacity-50 grayscale' : ''">
                <Icon icon="lucide:land-plot" class="size-3.5 text-bejo-600" />
              </div>
              <span class="text-xs font-bold" :class="isLoading ? 'bg-slate-200 text-transparent animate-pulse rounded select-none w-1/2' : 'text-slate-700'">LT {{ row.original.Luas_Tanah || 0 }} m²</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0" :class="isLoading ? 'opacity-50 grayscale' : ''">
                <Icon icon="lucide:home" class="size-3.5 text-bejo-600" />
              </div>
              <span class="text-xs font-bold" :class="isLoading ? 'bg-slate-200 text-transparent animate-pulse rounded select-none w-1/2' : 'text-slate-700'">LB {{ row.original.Luas_Bangunan || 0 }} m²</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0" :class="isLoading ? 'opacity-50 grayscale' : ''">
                <Icon icon="lucide:layers" class="size-3.5 text-bejo-600" />
              </div>
              <span class="text-xs font-bold" :class="isLoading ? 'bg-slate-200 text-transparent animate-pulse rounded select-none w-1/2' : 'text-slate-700'">{{ row.original.Jumlah_Lantai || 0 }} Lt</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0" :class="isLoading ? 'opacity-50 grayscale' : ''">
                <Icon icon="lucide:car" class="size-3.5 text-bejo-600" />
              </div>
              <span class="text-xs font-bold" :class="isLoading ? 'bg-slate-200 text-transparent animate-pulse rounded select-none w-1/2' : 'text-slate-700'">{{ row.original.Jumlah_Carpot || 0 }} Mob</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0" :class="isLoading ? 'opacity-50 grayscale' : ''">
                <Icon icon="lucide:bed" class="size-3.5 text-bejo-600" />
              </div>
              <span class="text-xs font-bold" :class="isLoading ? 'bg-slate-200 text-transparent animate-pulse rounded select-none w-1/2' : 'text-slate-700'">{{ row.original.Jumlah_Kamar_Tidur || 0 }} Kmr</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0" :class="isLoading ? 'opacity-50 grayscale' : ''">
                <Icon icon="lucide:bath" class="size-3.5 text-bejo-600" />
              </div>
              <span class="text-xs font-bold" :class="isLoading ? 'bg-slate-200 text-transparent animate-pulse rounded select-none w-1/2' : 'text-slate-700'">{{ row.original.Jumlah_Kamar_Mandi || 0 }} Kmr</span>
            </div>
          </div>

          <div class="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2 relative">
            <div v-show="isLoading || row.original?.Harga_Sewa1 > 0" class="flex flex-col flex-wrap">
              <span class="text-[9px] font-black uppercase tracking-widest mb-0.5" :class="isLoading ? 'bg-slate-200 text-transparent animate-pulse rounded select-none w-1/4' : 'text-slate-400'">
                Harga Sewa
                <span v-if="!isLoading && row.original.Minimal_Sewa && row.original.Minimal_Sewa > 0">(min. {{ row.original.Minimal_Sewa + ' ' + row.original.Satuan_Minimal_Sewa }})</span>
              </span>
              <div class="flex flex-wrap items-baseline gap-1.5">
                <span class="text-base font-black" :class="isLoading ? 'bg-slate-200 text-transparent animate-pulse rounded select-none w-[60%] inline-block mt-0.5' : 'text-slate-900'">
                  {{ formatCurrency(row.original?.Harga_Sewa2 > 0 ? row.original.Harga_Sewa2 : (row.original?.Harga_Sewa1 || 240000000)) }}
                </span>
                <div v-if="!isLoading && row.original.Harga_Sewa2 > 0" class="flex items-center gap-1.5">
                  <span class="relative text-[10px] text-slate-400 font-bold px-1 shrink-0 break-all leading-tight mt-0.5">
                    {{ formatCurrency(row.original.Harga_Sewa1) }}
                    <span class="absolute inset-x-0 top-1/2 h-[1.5px] bg-red-500 transform -rotate-[10deg] opacity-80 rounded-full"></span>
                  </span>
                  <span class="bg-red-50 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded-md leading-none border border-red-100/50 mt-0.5">
                    -{{ Math.round(((row.original.Harga_Sewa1 - row.original.Harga_Sewa2) / row.original.Harga_Sewa1) * 100) }}%
                  </span>
                </div>
                <span class="text-[10px] text-slate-400 italic" v-if="!isLoading">/{{ row.original.Satuan_Minimal_Sewa || 'thn' }}</span>
              </div>
            </div>

            <div v-show="!isLoading && row.original?.Harga_Jual1 > 0" class="flex flex-col flex-wrap">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Harga Jual</span>
              <div class="flex flex-wrap items-baseline gap-1.5">
                <span class="text-lg font-black text-slate-900">
                  {{ formatCurrency(row.original.Harga_Jual2 > 0 ? row.original.Harga_Jual2 : row.original.Harga_Jual1) }}
                </span>
                <div v-if="!isLoading && row.original.Harga_Jual2 > 0" class="flex items-center gap-1.5">
                  <span class="relative text-[10px] text-slate-400 font-bold px-1 shrink-0 break-all leading-tight mt-0.5">
                    {{ formatCurrency(row.original.Harga_Jual1) }}
                    <span class="absolute inset-x-0 top-1/2 h-[1.5px] bg-red-500 transform -rotate-[10deg] opacity-80 rounded-full"></span>
                  </span>
                  <span class="bg-red-50 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded-md leading-none border border-red-100/50 mt-0.5">
                    -{{ Math.round(((row.original.Harga_Jual1 - row.original.Harga_Jual2) / row.original.Harga_Jual1) * 100) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="isAdmin && !isLoading" class="absolute bottom-5 right-5 z-20">
            <button type="button" @click.stop="toggleDropdown(row.id)" class="size-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-bejo-600 hover:text-white transition-all">
              <Icon icon="lucide:more-vertical" class="size-5" />
            </button>
            <div v-show="activeDropdownId === row.id" class="absolute right-0 bottom-11 z-[100] min-w-[180px] bg-white p-1.5 shadow-2xl border border-slate-200 rounded-xl animate-in slide-in-from-bottom-2 duration-200">
              <button @click="updateStatusTransaksi(row.original, 'Terjual')" v-if="row.original.Status_Transaksi.includes('Jual') && row.original.Status_Properti != 'Terjual'" class="admin-dropdown-item hover:bg-emerald-50 hover:text-emerald-600"><Icon icon="lucide:badge-check" class="size-4" /> Sudah Terjual</button>
              <button @click="updateStatusTransaksi(row.original, 'Tersewa')" v-if="row.original.Status_Transaksi.includes('Sewa') && row.original.Status_Properti != 'Tersewa'" class="admin-dropdown-item hover:bg-emerald-50 hover:text-emerald-600"><Icon icon="lucide:key" class="size-4" /> Sudah Tersewa</button>
              <button @click="updateStatusTransaksi(row.original, 'Tersedia')" v-if="row.original.Status_Transaksi.includes('Jual') && row.original.Status_Properti == 'Terjual'" class="admin-dropdown-item hover:bg-emerald-50 hover:text-emerald-600"><Icon icon="lucide:badge-check" class="size-4" /> Batal Terjual</button>
              <button @click="updateStatusTransaksi(row.original, 'Tersedia')" v-if="row.original.Status_Transaksi.includes('Sewa') && row.original.Status_Properti == 'Tersewa'" class="admin-dropdown-item hover:bg-emerald-50 hover:text-emerald-600"><Icon icon="lucide:key" class="size-4" /> Batal Tersewa</button>
              <hr class="my-1 border-slate-100" />
              <button @click="$router.push('/admin/properti/edit/'+row.original.Slug)" class="admin-dropdown-item hover:bg-bejo-50 hover:text-bejo-600"><Icon icon="lucide:pencil" class="size-4" /> Edit</button>
              <button @click="deleteProduct(row.original)" class="admin-dropdown-item text-red-500 hover:bg-red-50"><Icon icon="lucide:trash-2" class="size-4" /> Hapus</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4 pt-6">
      <p class="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Halaman {{ table.getState().pagination.pageIndex + 1 }} dari {{ table.getPageCount() }}</p>
      <nav class="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
        <button @click="table.previousPage()" :disabled="!table.getCanPreviousPage()" class="p-2 text-slate-500 hover:text-bejo-600 disabled:opacity-30 transition-colors hover:bg-slate-50 rounded-xl"><Icon icon="lucide:chevron-left" class="size-4" /></button>
        <button v-for="n in table.getPageCount()" :key="n" @click="table.setPageIndex(n - 1)" :class="['size-8 rounded-xl text-xs font-bold transition-all shadow-sm', table.getState().pagination.pageIndex === n - 1 ? 'bg-bejo-600 text-white shadow-bejo-600/40' : 'text-slate-500 bg-white hover:bg-slate-50 hover:text-slate-800 border border-transparent']">
          {{ n }}
        </button>
        <button @click="table.nextPage()" :disabled="!table.getCanNextPage()" class="p-2 text-slate-500 hover:text-bejo-600 disabled:opacity-30 transition-colors hover:bg-slate-50 rounded-xl"><Icon icon="lucide:chevron-right" class="size-4" /></button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'
import { useVueTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, type SortingState } from '@tanstack/vue-table'
import { confirm, success, fail } from '@/utils/sweet-alert'

const $router = useRouter()
const isLoading = ref(true)
const isSortOpen = ref(false)
const activeDropdownId = ref<string | null>(null)
const filter = ref('')
const products = ref<Product[]>([])
const sorting = ref<SortingState>([])
const selectedSort = ref('Terbaru')
const isTransaksiOpen = ref(false)
const selectedTransaksi = ref('Semua Label')

const props = defineProps<{
  isAdmin: boolean
}>()

interface MediaUrl {
  Url: string | null
  Expired_At: Date
  IsCompressed: false
  ContentType: string
  ThumbUrl: string | null
  Size: number
  Id_Media: string
}

export interface Product {
  No_Id: string
  Nama_Produk: string
  Alamat: string
  Email: string
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
  minimal_sewa: number
  Harga_Jual1: number
  Harga_Jual2: number
  Harga_Jual3: number
  Harga_Sewa1: number
  Harga_Sewa2: number
  Harga_Sewa3: number
  Keterangan: string
  Slug: string
  Flag_Sewa: string
  Minimal_Sewa: number | null
  Satuan_Minimal_Sewa: string
  Area: string
  Hide_alamat: boolean
  Akses_Jalan: string[]
  File_Image: string[]
  MediaUrls: MediaUrl[]
}

const setSort = (type: string) => {
  selectedSort.value = type

  if (type === 'Harga Termurah') {
    sorting.value = [{ id: 'Harga_Jual1', desc: false }]
  } else if (type === 'Harga Termahal') {
    sorting.value = [{ id: 'Harga_Jual1', desc: true }]
  } else if (type === 'Luas Terbesar') {
    sorting.value = [{ id: 'Luas_Tanah', desc: true }]
  } else {
    sorting.value = []
  }
}

const handleSort = (type: string) => {
  setSort(type)
  isSortOpen.value = false
}

const handleTransaksi = (type: string) => {
  selectedTransaksi.value = type
  isTransaksiOpen.value = false
}

const filteredProducts = computed(() => {
  if (selectedTransaksi.value === 'Jual Saja') {
    return products.value.filter(p => p.Status_Transaksi?.includes('Jual') && !p.Status_Transaksi?.includes('Sewa'))
  } else if (selectedTransaksi.value === 'Sewa Saja') {
    return products.value.filter(p => !p.Status_Transaksi?.includes('Jual') && p.Status_Transaksi?.includes('Sewa'))
  } else if (selectedTransaksi.value === 'Jual & Sewa') {
    return products.value.filter(p => p.Status_Transaksi?.includes('Jual') && p.Status_Transaksi?.includes('Sewa'))
  }
  return products.value
})

const table = useVueTable({
  get data() {
    return filteredProducts.value
  },
  columns: [
    { accessorKey: 'Nama_Produk', header: 'Properti' },
    { accessorKey: 'Tipe', header: 'Tipe' },
    { accessorKey: 'Luas_Tanah', header: 'Luas' },
    { accessorKey: 'Harga_Jual1', header: 'Harga' },
    { accessorKey: 'Status_Properti', header: 'Status' }
  ],
  state: {
    get globalFilter() {
      return filter.value
    },
    get sorting() {
      return sorting.value
    }
  },
  onSortingChange: (updaterOrValue) => {
    sorting.value = typeof updaterOrValue === 'function' ? updaterOrValue(sorting.value) : updaterOrValue
  },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  initialState: {
    pagination: { pageSize: 6 }
  }
})

const fetchData = async () => {
  isLoading.value = true
  try {
    const { data } = await api.get('/api/realEstate/getAll', {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    products.value = data.Data
  } catch (err: any) {
    console.error('DATA:', err.response?.data)
  } finally {
    isLoading.value = false
  }
}

const formatCurrency = (value: number) => {
  if (value >= 1e12) return 'Rp ' + (value / 1e12).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' T'
  if (value >= 1e9) return 'Rp ' + (value / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' M'
  if (value >= 1e6) return 'Rp ' + (value / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' Jt'
  if (value >= 1e3) return 'Rp ' + (value / 1e3).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' Rb'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

const toggleDropdown = (id: string) => {
  activeDropdownId.value = activeDropdownId.value === id ? null : id
}

const updateStatusTransaksi = async (product: any, newStatus: string) => {
  confirm(`Apakah Anda yakin ingin mengubah status menjadi ${newStatus}?`, async () => {
    try {
      product.Status_Properti = newStatus
      await api.put('/api/realEstate/update?no_id=' + product.No_Id, product, {
        headers: { 'X-Jenis-User': 'admin' }
      })
      fetchData()
      activeDropdownId.value = null
    } catch (error) {
      console.error('Gagal mengubah status:', error)
    }
  })
}

const deleteProduct = async (data: Product) => {
  confirm('Apakah Anda ingin menghapus data ini?', async () => {
    try {
      const res = await api.delete('/api/mediacloud/delete-batch', {
        data: { ids: [...data.File_Image] },
        headers: { 'X-Jenis-User': 'admin' }
      })
      const successMedia: string[] = res.data?.Success || []
      const semuaTerhapus = data.File_Image.every((id: string) => successMedia.includes(id))

      if (!semuaTerhapus) {
        fail('Beberapa gambar gagal dihapus')
        return
      }

      await api.delete(`/api/realEstate/delete?no_id=${data.No_Id}`, {
        headers: { 'X-Jenis-User': 'admin' }
      })

      fetchData()
      success('Berhasil hapus produk')
    } catch (err: any) {
      fail('Gagal menghapus data')
    }
  })
}

// Click outside logic
window.addEventListener('click', (e) => {
  if (!(e.target as Element).closest('.group')) activeDropdownId.value = null
  const target = e.target as HTMLElement
  if (!target.closest('#sorting-container')) {
    isSortOpen.value = false
  }
  if (!target.closest('#transaksi-container')) {
    isTransaksiOpen.value = false
  }
})

onMounted(async () => {
  await fetchData()
  nextTick(() => {
    window.HSStaticMethods?.autoInit()
  })
})
</script>

<style scoped>
@reference "@/assets/css/style.css";
.dropdown-item {
  @apply w-full text-left p-2 hover:bg-slate-50 hover:text-bejo-700 text-sm font-semibold text-slate-700 transition-colors rounded-none;
}
.admin-dropdown-item {
  @apply w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors text-left rounded-none;
}
</style>
