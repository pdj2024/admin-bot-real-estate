<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'
import { success, fail } from '@/utils/sweet-alert'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'refresh'])

const today = new Date().toISOString().split('T')[0]

const form = ref({
  Id_Customer: '',
  Id_Produk: '',
  Tanggal_Janji: today,
  Waktu_Janji: '',
  Waktu_Selesai: '',
  Tipe_Pertemuan: 'offline',
  Lokasi_Pertemuan: '',
  Keterangan: '',
  Estimasi_Pengembalian: ''
})

const minEstimasiPengembalian = computed(() => {
  if (form.value.Tanggal_Janji) {
    return `${form.value.Tanggal_Janji}T00:00`
  }
  return `${today}T00:00`
})

const selectedKey = ref('')

const customers = ref<any[]>([])
const products = ref<any[]>([])
const keys = ref<any[]>([])
const isLoading = ref(false)
const isLoadingKeys = ref(false)

const closeModal = () => {
  emit('update:modelValue', false)
  resetForm()
}

const resetForm = () => {
  form.value = {
    Id_Customer: '',
    Id_Produk: '',
    Tanggal_Janji: today,
    Waktu_Janji: '',
    Waktu_Selesai: '',
    Tipe_Pertemuan: 'offline',
    Lokasi_Pertemuan: '',
    Keterangan: '',
    Estimasi_Pengembalian: ''
  }
  selectedKey.value = ''
  keys.value = []
  searchDropdown.value.customer = ''
  searchDropdown.value.produk = ''
}

const isDropdownOpen = ref({ customer: false, produk: false, tipePertemuan: false })
const searchDropdown = ref({ customer: '', produk: '' })

const dropdownStyle = ref({
  customer: { top: '0px', left: '0px', width: '0px' },
  produk: { top: '0px', left: '0px', width: '0px' },
  tipePertemuan: { top: '0px', left: '0px', width: '0px' }
})

const customerBtnRef = ref<HTMLElement | null>(null)
const produkBtnRef = ref<HTMLElement | null>(null)
const tipePertemuanBtnRef = ref<HTMLElement | null>(null)

const menuRefs = ref({
  customer: null as HTMLElement | null,
  produk: null as HTMLElement | null,
  tipePertemuan: null as HTMLElement | null
})

import { computed, onUnmounted, nextTick } from 'vue'

const updateDropdownStyle = (type: 'customer' | 'produk' | 'tipePertemuan') => {
  const btn = type === 'customer' ? customerBtnRef.value : type === 'produk' ? produkBtnRef.value : tipePertemuanBtnRef.value;
  if (btn) {
    const rect = btn.getBoundingClientRect()
    dropdownStyle.value[type] = {
      top: `${rect.bottom + 8}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`
    }
  }
}

const toggleDropdown = (type: 'customer' | 'produk' | 'tipePertemuan') => {
  isDropdownOpen.value[type] = !isDropdownOpen.value[type]
  if (type !== 'customer') isDropdownOpen.value.customer = false
  if (type !== 'produk') isDropdownOpen.value.produk = false
  if (type !== 'tipePertemuan') isDropdownOpen.value.tipePertemuan = false

  if (isDropdownOpen.value[type]) {
    nextTick(() => updateDropdownStyle(type))
  }
}

const selectCustomer = (id: string) => {
  form.value.Id_Customer = id
  isDropdownOpen.value.customer = false
  searchDropdown.value.customer = ''
}

const selectProduk = (id: string) => {
  form.value.Id_Produk = id
  isDropdownOpen.value.produk = false
  searchDropdown.value.produk = ''
}

const selectTipePertemuan = (val: string) => {
  form.value.Tipe_Pertemuan = val
  isDropdownOpen.value.tipePertemuan = false
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  
  const isInsideBtn = (btn: HTMLElement | null) => btn && btn.contains(target)
  const isInsideMenu = (menu: HTMLElement | null) => menu && menu.contains(target)

  if (!isInsideBtn(customerBtnRef.value) && !isInsideMenu(menuRefs.value.customer)) {
    isDropdownOpen.value.customer = false
  }
  if (!isInsideBtn(produkBtnRef.value) && !isInsideMenu(menuRefs.value.produk)) {
    isDropdownOpen.value.produk = false
  }
  if (!isInsideBtn(tipePertemuanBtnRef.value) && !isInsideMenu(menuRefs.value.tipePertemuan)) {
    isDropdownOpen.value.tipePertemuan = false
  }
}

const filteredCustomers = computed(() => {
  if (!searchDropdown.value.customer) return customers.value
  const query = searchDropdown.value.customer.toLowerCase()
  return customers.value.filter((c: any) => 
    (c.Nama_Display || c.UserName || c.No_Id).toLowerCase().includes(query)
  )
})

const filteredProducts = computed(() => {
  if (!searchDropdown.value.produk) return products.value
  const query = searchDropdown.value.produk.toLowerCase()
  return products.value.filter((p: any) => 
    p.Nama_Produk.toLowerCase().includes(query)
  )
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(() => form.value.Tanggal_Janji, () => {
  form.value.Estimasi_Pengembalian = ''
})

watch(() => form.value.Waktu_Janji, () => {
  form.value.Waktu_Selesai = ''
})

const fetchData = async () => {
  try {
    const [custRes, prodRes] = await Promise.all([
      api.get('/api/customer/getAll', { headers: { 'X-Jenis-User': 'admin' } }),
      api.get('/api/realEstate/getAll', { headers: { 'X-Jenis-User': 'admin' } })
    ])
    customers.value = custRes.data.Data || []
    products.value = prodRes.data.Data || []
  } catch (error) {
    console.error('Gagal mengambil data referensi', error)
  }
}

const fetchKeys = async () => {
  if (!form.value.Id_Produk || !form.value.Tanggal_Janji || !form.value.Estimasi_Pengembalian) {
    keys.value = []
    selectedKey.value = ''
    return
  }
  isLoadingKeys.value = true
  try {
    const waktuAwal = form.value.Waktu_Janji ? (form.value.Waktu_Janji.length === 5 ? form.value.Waktu_Janji + ':00' : form.value.Waktu_Janji) : '00:00:00'
    const tglAwal = `${form.value.Tanggal_Janji}T${waktuAwal}`
    const tglAkhir = form.value.Estimasi_Pengembalian

    const [keysRes, borrowRes] = await Promise.all([
      api.get(`/api/masterKunci/getAll?id_produk=${form.value.Id_Produk}`, { headers: { 'X-Jenis-User': 'admin' } }),
      api.get(`/api/pinjamKunci/getAll?tanggal_pengajuan_max=${tglAkhir}&estimasi_pengembalian_min=${tglAwal}&id_produk=${form.value.Id_Produk}`, { headers: { 'X-Jenis-User': 'admin' } })
    ])
    
    let allKeys = keysRes.data.Data || []
    allKeys = allKeys.filter((k: any) => k.Id_Produk === form.value.Id_Produk)
    
    const borrowedData = borrowRes.data.Data || []
    const activeBorrows = borrowedData.filter((b: any) => b.Status_Progress !== 'dikembalikan' && b.Status_Progress !== 'batal')
    
    keys.value = allKeys.map((k: any) => {
      const borrowInfo = activeBorrows.find((b: any) => b.Id_Kunci === k.No_Id)
      if (borrowInfo) {
        return {
          ...k,
          Estimasi_Pengembalian: borrowInfo.Estimasi_Pengembalian,
          Nama_Agent_Terakhir: borrowInfo.Nama_Agent || borrowInfo.Id_Agent,
          Is_Disabled: true
        }
      }
      return {
        ...k,
        Estimasi_Pengembalian: null,
        Nama_Agent_Terakhir: null,
        Is_Disabled: false
      }
    })
    
    selectedKey.value = ''
  } catch (error) {
    console.error('Gagal mengambil data kunci', error)
  } finally {
    isLoadingKeys.value = false
  }
}

watch([
  () => form.value.Id_Produk,
  () => form.value.Tanggal_Janji,
  () => form.value.Estimasi_Pengembalian
], () => {
  fetchKeys()
})

watch(() => props.modelValue, (val) => {
  if (val) {
    fetchData()
  }
})

const submitForm = async () => {
  if (!form.value.Id_Customer || !form.value.Id_Produk || !form.value.Tanggal_Janji || !form.value.Waktu_Janji) {
    return fail('Harap lengkapi semua field wajib')
  }

  isLoading.value = true
  try {
    const adminId = localStorage.getItem('no_id') || 'adm_01'
    
    const appointmentPayload = {
      Room_Id: null,
      Id_Customer: form.value.Id_Customer,
      Id_Admin: adminId,
      Id_Produk: form.value.Id_Produk,
      Tipe_Pertemuan: form.value.Tipe_Pertemuan,
      Tanggal_Janji: form.value.Tanggal_Janji,
      Waktu_Janji: form.value.Waktu_Janji.length === 5 ? form.value.Waktu_Janji + ':00' : form.value.Waktu_Janji,
      Waktu_Selesai: form.value.Waktu_Selesai ? (form.value.Waktu_Selesai.length === 5 ? form.value.Waktu_Selesai + ':00' : form.value.Waktu_Selesai) : null,
      Lokasi_Pertemuan: form.value.Lokasi_Pertemuan,
      Keterangan: form.value.Keterangan || null,
      Status: 'aktif',
      Status_Progress: 'baru',
      Id_Janji_Lama: null,
      Alasan_Batal: null
    }

    const appointmentRes = await api.post('/api/janjiTemu/create', appointmentPayload, { headers: { 'X-Jenis-User': 'admin' } })

    // 2. Create Key Borrowing if selected
    if (selectedKey.value) {
      const createdAppointmentId = appointmentRes.data?.NewId || null
      
      const keyPayload = {
        Id_Agent: form.value.Id_Customer,
        Id_Kunci: selectedKey.value,
        Id_Janji_Temu: createdAppointmentId,
        Tanggal_Pengajuan: `${form.value.Tanggal_Janji}T${form.value.Waktu_Janji}`,
        Tanggal_Diambil: null,
        Tanggal_Dikembalikan: null,
        Estimasi_Pengembalian: form.value.Estimasi_Pengembalian || null,
        Status: 'aktif',
        Status_Progress: 'konfirmasi',
        Keterangan: form.value.Keterangan || null
      }
      await api.post('/api/pinjamKunci/create', keyPayload, { headers: { 'X-Jenis-User': 'admin' } })
    }

    success('Berhasil membuat janji temu' + (selectedKey.value ? ' dan pengajuan pinjam kunci' : ''))
    emit('refresh')
    closeModal()
  } catch (error: any) {
    console.error('Gagal membuat janji temu:', error)
    if (error.response && error.response.data && error.response.data.Message) {
      fail(error.response.data.Message)
    } else {
      fail('Gagal membuat janji temu')
    }
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date)
}

</script>

<template>
  <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="modelValue" class="fixed inset-0 z-[1050] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-500 overflow-hidden">
        
        <!-- Header -->
        <div class="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div class="flex items-center gap-4">
            <div class="size-10 rounded-xl bg-bejo-600 flex items-center justify-center text-white shadow-lg shadow-bejo-600/20">
              <Icon icon="lucide:calendar-plus" class="size-5" />
            </div>
            <div>
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">Tambah Janji Temu</h3>
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Konfigurasi Jadwal Pertemuan Baru</p>
            </div>
          </div>
          <button @click="closeModal" class="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white hover:text-red-500 transition-all shrink-0">
            <Icon icon="lucide:x" class="size-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-8 overflow-y-auto custom-scrollbar">
          <div class="flex flex-col md:flex-row gap-8 h-full">
            
            <!-- Kiri: Form Janji Temu -->
            <div class="flex-1 space-y-6 transition-all duration-300">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div class="space-y-2 relative">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer <span class="text-red-500">*</span></label>
                  <button type="button" ref="customerBtnRef" @click="toggleDropdown('customer')" class="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all font-bold text-slate-700 text-sm flex items-center justify-between group">
                    <span class="truncate" :class="form.Id_Customer ? 'text-slate-700' : 'text-slate-400'">
                      {{ customers.find(c => c.No_Id === form.Id_Customer)?.Nama_Display || customers.find(c => c.No_Id === form.Id_Customer)?.UserName || customers.find(c => c.No_Id === form.Id_Customer)?.No_Id || '- PILIH -' }}
                    </span>
                    <Icon icon="lucide:chevron-down" class="text-slate-400 size-4 transition-transform" :class="{'rotate-180 text-bejo-500': isDropdownOpen.customer}" />
                  </button>

                  <Teleport to="body">
                    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95 -translate-y-2" enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 -translate-y-2">
                      <div v-if="isDropdownOpen.customer" :ref="(el) => menuRefs.customer = el as HTMLElement" class="fixed z-[1200] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden" :style="dropdownStyle.customer">
                        <div class="p-3 border-b border-slate-50 bg-slate-50/50 relative">
                          <Icon icon="lucide:search" class="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                          <input type="text" v-model="searchDropdown.customer" placeholder="Cari Customer..." class="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-bejo-500 focus:ring-2 focus:ring-bejo-500/20 transition-all" />
                        </div>
                        <div class="max-h-60 overflow-y-auto custom-scrollbar p-2">
                          <template v-if="filteredCustomers.length > 0">
                            <button type="button" v-for="c in filteredCustomers" :key="c.No_Id" @click="selectCustomer(c.No_Id)" class="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-bejo-50 hover:text-bejo-600 transition-colors text-left text-xs font-black uppercase tracking-widest text-slate-600">
                              <span class="truncate">{{ c.Nama_Display || c.UserName || c.No_Id }}</span>
                              <Icon v-if="form.Id_Customer === c.No_Id" icon="lucide:check" class="size-4 text-bejo-500 shrink-0" />
                            </button>
                          </template>
                          <div v-else class="py-8 text-center flex flex-col items-center">
                            <Icon icon="lucide:search-x" class="size-8 text-slate-200 mb-2" />
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer tidak ditemukan</span>
                          </div>
                        </div>
                      </div>
                    </Transition>
                  </Teleport>
                </div>

                <div class="space-y-2 relative">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Properti <span class="text-red-500">*</span></label>
                  <button type="button" ref="produkBtnRef" @click="toggleDropdown('produk')" class="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all font-bold text-slate-700 text-sm flex items-center justify-between group">
                    <span class="truncate" :class="form.Id_Produk ? 'text-slate-700' : 'text-slate-400'">
                      {{ products.find(p => p.No_Id === form.Id_Produk)?.Nama_Produk || '- PILIH -' }}
                    </span>
                    <Icon icon="lucide:chevron-down" class="text-slate-400 size-4 transition-transform" :class="{'rotate-180 text-bejo-500': isDropdownOpen.produk}" />
                  </button>

                  <Teleport to="body">
                    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95 -translate-y-2" enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 -translate-y-2">
                      <div v-if="isDropdownOpen.produk" :ref="(el) => menuRefs.produk = el as HTMLElement" class="fixed z-[1200] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden" :style="dropdownStyle.produk">
                        <div class="p-3 border-b border-slate-50 bg-slate-50/50 relative">
                          <Icon icon="lucide:search" class="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                          <input type="text" v-model="searchDropdown.produk" placeholder="Cari Produk / Properti..." class="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-bejo-500 focus:ring-2 focus:ring-bejo-500/20 transition-all" />
                        </div>
                        <div class="max-h-60 overflow-y-auto custom-scrollbar p-2">
                          <template v-if="filteredProducts.length > 0">
                            <button type="button" v-for="p in filteredProducts" :key="p.No_Id" @click="selectProduk(p.No_Id)" class="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-bejo-50 hover:text-bejo-600 transition-colors text-left text-xs font-black uppercase tracking-widest text-slate-600">
                              <span class="truncate">{{ p.Nama_Produk }}</span>
                              <Icon v-if="form.Id_Produk === p.No_Id" icon="lucide:check" class="size-4 text-bejo-500 shrink-0" />
                            </button>
                          </template>
                          <div v-else class="py-8 text-center flex flex-col items-center">
                            <Icon icon="lucide:search-x" class="size-8 text-slate-200 mb-2" />
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Produk tidak ditemukan</span>
                          </div>
                        </div>
                      </div>
                    </Transition>
                  </Teleport>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal <span class="text-red-500">*</span></label>
                  <div class="relative group">
                    <input type="date" v-model="form.Tanggal_Janji" :min="today" class="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all font-bold text-slate-700 text-sm appearance-none" />
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Waktu Mulai <span class="text-red-500">*</span></label>
                  <div class="relative group">
                    <input type="time" v-model="form.Waktu_Janji" class="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all font-bold text-slate-700 text-sm appearance-none" />
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Waktu Selesai</label>
                  <div class="relative group">
                    <input type="time" v-model="form.Waktu_Selesai" :min="form.Waktu_Janji" class="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all font-bold text-slate-700 text-sm appearance-none" />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div class="space-y-2 relative">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipe Pertemuan <span class="text-red-500">*</span></label>
                  <button type="button" ref="tipePertemuanBtnRef" @click="toggleDropdown('tipePertemuan')" class="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all font-bold text-sm flex items-center justify-between group" :class="form.Tipe_Pertemuan ? 'text-slate-700' : 'text-slate-400'">
                    <span class="truncate">
                      {{ form.Tipe_Pertemuan === 'offline' ? 'Offline / Tatap Muka' : (form.Tipe_Pertemuan === 'online' ? 'Online / Virtual' : 'PILIH TIPE PERTEMUAN') }}
                    </span>
                    <Icon icon="lucide:chevron-down" class="text-slate-400 size-4 transition-transform" :class="{'rotate-180 text-bejo-500': isDropdownOpen.tipePertemuan}" />
                  </button>

                  <Teleport to="body">
                    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95 -translate-y-2" enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 -translate-y-2">
                      <div v-if="isDropdownOpen.tipePertemuan" :ref="(el) => menuRefs.tipePertemuan = el as HTMLElement" class="fixed z-[1200] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden py-2" :style="dropdownStyle.tipePertemuan">
                        <button type="button" @click="selectTipePertemuan('offline')" class="w-full flex items-center justify-between px-4 py-3 hover:bg-bejo-50 hover:text-bejo-600 transition-colors text-left text-xs font-black uppercase tracking-widest text-slate-600">
                          <span class="truncate">Offline / Tatap Muka</span>
                          <Icon v-if="form.Tipe_Pertemuan === 'offline'" icon="lucide:check" class="size-4 text-bejo-500 shrink-0" />
                        </button>
                        <button type="button" @click="selectTipePertemuan('online')" class="w-full flex items-center justify-between px-4 py-3 hover:bg-bejo-50 hover:text-bejo-600 transition-colors text-left text-xs font-black uppercase tracking-widest text-slate-600">
                          <span class="truncate">Online / Virtual</span>
                          <Icon v-if="form.Tipe_Pertemuan === 'online'" icon="lucide:check" class="size-4 text-bejo-500 shrink-0" />
                        </button>
                      </div>
                    </Transition>
                  </Teleport>
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lokasi Pertemuan</label>
                  <input type="text" v-model="form.Lokasi_Pertemuan" placeholder="Misal: Properti / Zoom Link" class="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all font-bold text-slate-700 text-sm" />
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Keterangan</label>
                <textarea v-model="form.Keterangan" rows="3" placeholder="Catatan tambahan..." class="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all font-bold text-slate-700 text-sm resize-none"></textarea>
              </div>
            </div>

            <!-- Kanan: List Kunci -->
            <div class="w-full md:w-[320px] shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-8 md:pt-0 md:pl-8 flex flex-col">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-sm border border-amber-500/20">
                    <Icon icon="lucide:key" class="size-4" />
                  </div>
                  <div>
                    <h4 class="text-xs font-black text-slate-900 uppercase tracking-widest">Pilih Unit Kunci</h4>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Pilih unit kunci yang tersedia</p>
                  </div>
                </div>
                <div v-if="isLoadingKeys">
                  <Icon icon="lucide:loader-2" class="size-4 animate-spin text-slate-400" />
                </div>
              </div>
              
              <div v-if="!form.Id_Produk" class="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 border-dashed mb-auto">
                <Icon icon="lucide:building" class="size-8 mx-auto mb-2 text-slate-300" />
                Pilih Properti Terlebih Dahulu
              </div>
              <div v-else-if="!form.Tanggal_Janji || !form.Estimasi_Pengembalian" class="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 border-dashed mb-auto">
                <Icon icon="lucide:calendar-clock" class="size-8 mx-auto mb-2 text-slate-300" />
                Lengkapi Tanggal & Estimasi Pengembalian
              </div>
              <div v-else-if="!isLoadingKeys && keys.length === 0" class="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 border-dashed mb-auto">
                <Icon icon="lucide:key-round" class="size-8 mx-auto mb-2 text-slate-300" />
                Belum Ada Kunci Tersedia
              </div>
              <div v-else-if="!isLoadingKeys" class="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 mb-4">
                <label v-for="k in keys" :key="k.No_Id" 
                  class="relative flex items-center p-4 border rounded-2xl cursor-pointer transition-all group"
                  :class="[
                    k.Is_Disabled 
                      ? 'border-slate-100 bg-slate-50 opacity-75 cursor-not-allowed' 
                      : selectedKey === k.No_Id 
                        ? 'border-bejo-500/50 bg-bejo-50/50 ring-4 ring-bejo-500/10 shadow-sm' 
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                  ]"
                  :title="k.Is_Disabled ? `Sedang dibawa agent ${k.Nama_Agent_Terakhir || '-'} (Estimasi: ${formatDate(k.Estimasi_Pengembalian)})` : ''"
                >
                  <input 
                    type="radio" 
                    name="kunci_radio" 
                    :value="k.No_Id" 
                    v-model="selectedKey" 
                    :disabled="k.Is_Disabled"
                    class="sr-only"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1.5">
                      <span class="text-xs font-black uppercase tracking-widest transition-colors truncate" :class="[k.Is_Disabled ? 'text-slate-400' : selectedKey === k.No_Id ? 'text-bejo-600' : 'text-slate-700 group-hover:text-slate-900']">
                        {{ k.Nama_Kunci }}
                      </span>
                      <span v-if="k.Is_Disabled" class="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-amber-100 text-amber-700 border border-amber-200 shrink-0 ml-2">
                        DIPINJAM
                      </span>
                    </div>
                    <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{{ k.Nama_Produk || products.find(p => p.No_Id === form.Id_Produk)?.Nama_Produk }}</p>
                    
                    <p v-if="k.Is_Disabled" class="text-[9px] font-bold text-amber-600 mt-2 flex items-center gap-1 bg-amber-50 p-1.5 rounded-lg border border-amber-100/50">
                      <Icon icon="lucide:user" class="size-3 shrink-0" />
                      <span class="truncate">{{ k.Nama_Agent_Terakhir || 'Agent' }} ({{ formatDate(k.Estimasi_Pengembalian) }})</span>
                    </p>
                  </div>
                  
                  <div v-if="!k.Is_Disabled && selectedKey === k.No_Id" class="absolute top-4 right-4 text-bejo-600">
                    <Icon icon="lucide:check-circle-2" class="size-5" />
                  </div>
                </label>
              </div>

              <!-- Input Estimasi Pengembalian Kunci -->
              <div v-if="form.Id_Produk" class="mt-auto pt-4 border-t border-slate-100 shrink-0">
                <label class="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1 block mb-2">Estimasi Pengembalian <span class="text-red-500">*</span></label>
                <div class="relative group">
                  <input type="datetime-local" :min="minEstimasiPengembalian" v-model="form.Estimasi_Pengembalian" class="w-full h-11 px-4 bg-amber-50/50 border border-amber-100 rounded-xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 outline-none transition-all font-bold text-slate-700 text-xs appearance-none" />
                </div>
              </div>

            </div>
            
          </div>
        </div>

        <!-- Footer -->
        <div class="px-8 py-6 border-t border-slate-50 bg-slate-50/30 flex items-center justify-end gap-4 shrink-0">
          <button @click="closeModal" type="button" class="px-6 py-3 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all">
            Batal
          </button>
          <button @click="submitForm" type="button" :disabled="isLoading" class="px-8 py-3 bg-bejo-600 hover:bg-bejo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-bejo-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
            <Icon v-if="isLoading" icon="lucide:loader-2" class="size-4 animate-spin" />
            <Icon v-else icon="lucide:save" class="size-4" />
            {{ isLoading ? 'Menyimpan...' : 'Simpan Janji Temu' }}
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
@keyframes zoom-in {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-in {
  animation: zoom-in 0.3s ease-out forwards;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
