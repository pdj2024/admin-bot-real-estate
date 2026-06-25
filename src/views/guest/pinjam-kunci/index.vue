<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, computed } from 'vue'
import { Icon } from '@iconify/vue'
import Guest from '@/layouts/guest.vue'
import api from '@/services/axios'
import { success } from '@/utils/sweet-alert'

// States
const activeTab = ref('form') // 'form' | 'riwayat'
const isSubmitting = ref(false)
const isLoadingRiwayat = ref(false)
const riwayatData = ref<any[]>([])
const properties = ref<any[]>([])

const filterRiwayat = reactive({
  tanggal_awal: '',
  tanggal_akhir: ''
})

const getTodayDateTime = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const minDateTime = computed(() => getTodayDateTime())

// Form Data
const form = reactive({
  nama: localStorage.getItem('agent_nama') || localStorage.getItem('nama_display') || '',
  nomor: localStorage.getItem('agent_telepon') || localStorage.getItem('user_phone') || '',
  id_produk: '',
  tanggal_pengajuan: getTodayDateTime(),
  estimasi_pengembalian: ''
})

const isFormComplete = computed(() => {
  return form.nama.trim() !== '' && 
         form.nomor.trim() !== '' && 
         form.id_produk !== '' && 
         form.tanggal_pengajuan !== '' && 
         form.estimasi_pengembalian !== ''
})
const errorMessage = ref('')

const agentSession = reactive({
  nama: localStorage.getItem('agent_nama') || localStorage.getItem('nama_display') || '',
  telepon: localStorage.getItem('agent_telepon') || localStorage.getItem('user_phone') || ''
})
const isRecovering = ref(false)
const recoverForm = reactive({ nama: '', nomor: '' })
const recoverError = ref('')

const fetchProperties = async () => {
  try {
    const { data } = await api.get('/api/realEstate/getAll')
    if (data.StatusCode === 200) {
      properties.value = data.Data || []
    }
  } catch (error) {
    console.error('Failed to load properties', error)
  }
}

// Custom Dropdown Logic
const isDropdownOpen = ref(false)
const searchQuery = ref('')
const dropdownRef = ref<HTMLElement | null>(null)
const buttonRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
  if (isDropdownOpen.value) {
    searchQuery.value = ''
  }
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  const isInsideBtn = buttonRef.value && buttonRef.value.contains(target)
  const isInsideMenu = dropdownRef.value && dropdownRef.value.contains(target)

  if (!isInsideBtn && !isInsideMenu) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const filteredProperties = computed(() => {
  if (!searchQuery.value) return properties.value
  const lowerQuery = searchQuery.value.toLowerCase()
  return properties.value.filter((p) => p.Nama_Produk?.toLowerCase().includes(lowerQuery) || p.No_Id?.toLowerCase().includes(lowerQuery))
})

const selectedPropertyData = computed(() => {
  return properties.value.find((p) => p.No_Id === form.id_produk)
})

const selectProperty = (id: string) => {
  form.id_produk = id
  closeDropdown()
}

const checkRiwayat = async () => {
  if (!agentSession.nama || !agentSession.telepon) return

  isLoadingRiwayat.value = true
  try {
    let url = `/api/pinjamKunci/agent/getAll?telepon=${agentSession.telepon}&nama_agent=${agentSession.nama}`
    if (filterRiwayat.tanggal_awal) url += `&tanggal_pengajuan_min=${filterRiwayat.tanggal_awal}`
    if (filterRiwayat.tanggal_akhir) url += `&tanggal_pengajuan_max=${filterRiwayat.tanggal_akhir}`

    const { data } = await api.get(url)
    if (data.StatusCode === 200) {
      riwayatData.value = data.Data || []
    }
  } catch (error) {
    console.error('Gagal memuat riwayat:', error)
  } finally {
    isLoadingRiwayat.value = false
  }
}

const recoverUuidData = async () => {
  recoverError.value = ''
  if (!recoverForm.nama.trim() || !recoverForm.nomor.trim()) {
    recoverError.value = 'Nama dan nomor telepon wajib diisi!'
    return
  }

  isRecovering.value = true
  try {
    const { data } = await api.get(`/api/pinjamKunci/agent/getAll?telepon=${recoverForm.nomor}&nama_agent=${recoverForm.nama}`)

    if (data.StatusCode === 200 && data.Data && data.Data.length > 0) {
      agentSession.nama = recoverForm.nama
      agentSession.telepon = recoverForm.nomor
      localStorage.setItem('agent_nama', agentSession.nama)
      localStorage.setItem('agent_telepon', agentSession.telepon)

      riwayatData.value = data.Data
    } else {
      recoverError.value = 'Data tidak ditemukan.'
    }
  } catch (error: any) {
    console.error('Gagal mencari riwayat', error)
    if (error.response?.data?.Message) {
      recoverError.value = error.response.data.Message
    } else {
      recoverError.value = 'Terjadi kesalahan atau data tidak ditemukan.'
    }
  } finally {
    isRecovering.value = false
  }
}

const logout = () => {
  agentSession.nama = ''
  agentSession.telepon = ''
  localStorage.removeItem('agent_nama')
  localStorage.removeItem('agent_telepon')
  riwayatData.value = []
}

const submitPinjamKunci = async () => {
  errorMessage.value = ''

  // 1. GATEKEEPER: Validasi input
  if (!form.nama.trim() || !form.nomor.trim()) {
    errorMessage.value = 'Nama dan nomor telepon wajib diisi untuk verifikasi!'
    return
  }
  if (!form.id_produk) {
    errorMessage.value = 'Silakan pilih properti terlebih dahulu.'
    return
  }
  if (!form.tanggal_pengajuan || !form.estimasi_pengembalian) {
    errorMessage.value = 'Tanggal pinjam dan estimasi kembali wajib diisi.'
    return
  }

  // 2. KIRIM DATA KE API
  isSubmitting.value = true
  const payload = {
    nama_agent: form.nama,
    telepon: form.nomor,
    id_produk: form.id_produk,
    tanggal_pengajuan: form.tanggal_pengajuan,
    estimasi_pengembalian: form.estimasi_pengembalian
  }

  try {
    await api.post('/api/pinjamKunci/agent/create', payload)

    success('Permintaan pinjam kunci berhasil dikirim!')

    // Save session
    agentSession.nama = form.nama
    agentSession.telepon = form.nomor
    localStorage.setItem('agent_nama', agentSession.nama)
    localStorage.setItem('agent_telepon', agentSession.telepon)

    // Reset Form
    form.nama = ''
    form.nomor = ''
    form.id_produk = ''
    form.tanggal_pengajuan = ''
    form.estimasi_pengembalian = ''

    // Beralih ke tab riwayat
    activeTab.value = 'riwayat'
    checkRiwayat()
  } catch (error: any) {
    console.error('Gagal mengirim request', error)
    // Jika backend mereturn error verifikasi nama & nomor tidak cocok
    if (error.response?.data?.Message) {
      errorMessage.value = error.response.data.Message
    } else {
      errorMessage.value = 'Terjadi kesalahan pada server. Pastikan data Anda terdaftar.'
    }
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchProperties()
  if (agentSession.nama && agentSession.telepon) {
    checkRiwayat()
  }
})
</script>

<template>
  <Guest>
    <div class="mb-10 print:hidden space-y-10">
      <!-- Hero Section -->
      <div class="relative overflow-hidden rounded-[2rem] md:rounded-[3.5rem] bg-white border border-bejo-100 px-4 py-8 md:p-16 shadow-xl shadow-bejo-600/5 mt-4">
        <!-- Dekorasi Background -->
        <div class="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-bejo-50 via-bejo-50/50 to-transparent"></div>
        <div class="absolute -right-20 -top-20 size-96 bg-gradient-to-br from-bejo-100 via-bejo-200 to-bejo-400 rounded-full blur-3xl opacity-40"></div>
        <div class="absolute right-10 -bottom-20 size-64 bg-gradient-to-tr from-bejo-300 via-bejo-500 to-bejo-700 rounded-full blur-3xl opacity-10"></div>

        <div class="relative z-10 text-center px-4 w-full max-w-4xl mx-auto">
          <h1 class="text-3xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tight mb-3 md:mb-6">Layanan <span class="text-transparent bg-clip-text bg-gradient-to-r from-bejo-500 via-bejo-700 to-bejo-900">Pinjam Kunci</span></h1>
          <p class="text-slate-500 text-sm md:text-xl font-medium leading-relaxed max-w-3xl mx-auto">Fitur khusus bagi Agent untuk melakukan permintaan peminjaman kunci properti secara mandiri.</p>

          <!-- Tab Navigation -->
          <div class="flex items-center justify-center gap-4 mt-8">
            <button @click="activeTab = 'form'" class="px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all" :class="activeTab === 'form' ? 'bg-bejo-500 text-white shadow-lg shadow-bejo-500/30' : 'bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 shadow-sm border border-slate-100'">Formulir Peminjaman</button>
            <button @click="activeTab = 'riwayat'" class="px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2" :class="activeTab === 'riwayat' ? 'bg-bejo-500 text-white shadow-lg shadow-bejo-500/30' : 'bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 shadow-sm border border-slate-100'">
              Kunci Saya
              <span v-if="riwayatData.length > 0" class="size-5 rounded-full flex items-center justify-center text-[10px]" :class="activeTab === 'riwayat' ? 'bg-bejo-500 text-white' : 'bg-slate-200 text-slate-600'">
                {{ riwayatData.length }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="relative rounded-[2rem] md:rounded-[3.5rem] bg-white border border-bejo-100 shadow-2xl shadow-bejo-600/10">
        <!-- Mesh Gradient Background -->
        <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-[2rem] md:rounded-[3.5rem]">
          <div class="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-bejo-50 via-bejo-50/30 to-transparent"></div>
          <div class="absolute -left-20 bottom-0 size-96 bg-gradient-to-tr from-bejo-50 via-bejo-100 to-bejo-200 rounded-full blur-3xl opacity-30"></div>
        </div>

        <div class="w-full relative z-10">
          <!-- Tab: Form Pinjam -->
          <Transition name="fade" mode="out-in">
            <div v-if="activeTab === 'form'" class="p-8 sm:p-12">
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                <!-- Kiri: Info & Syarat -->
                <div class="lg:col-span-1 space-y-6">
                  <h3 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{{ agentSession.nama ? 'Detail Peminjaman' : 'Verifikasi Agent' }}</h3>
                  <p class="text-sm text-slate-500 font-medium leading-relaxed">Pinjam kunci dapat dilakukan dari sini. {{ agentSession.nama ? `Anda masuk sebagai ${agentSession.nama}. Lengkapi detail properti dan jadwal peminjaman.` : 'Sistem akan mencocokkan Nama dan Nomor Telepon Anda dengan data yang terdaftar pada sistem (Customer/Agent). Pastikan data yang dimasukkan akurat untuk mempermudah proses verifikasi.' }}</p>

                  <div class="bg-amber-50 border border-amber-100 rounded-3xl p-6 shadow-sm">
                    <div class="flex items-start gap-4">
                      <div class="size-10 rounded-full bg-amber-100/50 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon icon="lucide:info" class="size-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 class="text-sm font-black text-amber-900 tracking-tight mb-2">Informasi Penting</h4>
                        <ul class="text-xs font-medium text-amber-700/80 space-y-2.5 list-disc pl-4 leading-relaxed">
                          <li>Pengambilan kunci dilakukan langsung di kantor.</li>
                          <li>Wajib menunjukkan kartu identitas saat pengambilan.</li>
                          <li>Keterlambatan pengembalian dapat mempengaruhi reputasi peminjaman Anda selanjutnya.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Kanan: Form Input -->
                <div class="lg:col-span-2 space-y-6 bg-slate-50/50 rounded-3xl p-6 md:p-8 border border-slate-100 backdrop-blur-sm">
                  <!-- Identitas -->
                  <div v-if="!agentSession.nama" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="group bg-white rounded-2xl p-4 border border-slate-100 shadow-sm transition-all hover:border-bejo-200">
                      <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-bejo-600 transition-colors">Nama Lengkap <span class="text-red-500">*</span></label>
                      <input v-model="form.nama" type="text" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black text-slate-900 shadow-inner focus:outline-none focus:ring-4 focus:ring-bejo-500/10 focus:bg-white focus:border-bejo-200 transition-all placeholder:text-slate-300 placeholder:font-medium disabled:opacity-60 disabled:bg-slate-100 disabled:cursor-not-allowed" placeholder="Masukkan nama terdaftar Anda" :disabled="!!agentSession.nama" />
                    </div>

                    <div class="group bg-white rounded-2xl p-4 border border-slate-100 shadow-sm transition-all hover:border-bejo-200">
                      <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-bejo-600 transition-colors">Nomor Telepon (628xxx)<span class="text-red-500">*</span></label>
                      <input v-model="form.nomor" type="tel" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black text-slate-900 shadow-inner focus:outline-none focus:ring-4 focus:ring-bejo-500/10 focus:bg-white focus:border-bejo-200 transition-all placeholder:text-slate-300 placeholder:font-medium disabled:opacity-60 disabled:bg-slate-100 disabled:cursor-not-allowed" placeholder="Contoh: 6281234567890" :disabled="!!agentSession.telepon" />
                    </div>
                  </div>

                  <!-- Detail Pinjaman -->
                  <div class="space-y-5">
                    <div class="group bg-white rounded-2xl p-4 border border-slate-100 shadow-sm transition-all hover:border-bejo-200 relative">
                      <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-bejo-600 transition-colors">Pilih Properti <span class="text-red-500">*</span></label>
                      <div class="relative">
                        <Icon icon="lucide:building" class="absolute left-4 top-1/2 -translate-y-1/2 size-4" :class="form.id_produk ? 'text-slate-700' : 'text-slate-400'" />
                        <button type="button" ref="buttonRef" @click="toggleDropdown" class="w-full bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 py-3 text-sm font-black text-left shadow-inner focus:outline-none focus:ring-4 focus:ring-bejo-500/10 focus:bg-white focus:border-bejo-200 transition-all flex items-center justify-between" :class="form.id_produk ? 'text-slate-900' : 'text-slate-400'">
                          <span class="truncate">{{ form.id_produk ? properties.find((p) => p.No_Id === form.id_produk)?.Nama_Produk || form.id_produk : 'Pilih Properti' }}</span>
                          <Icon icon="lucide:chevron-down" class="size-4 transition-transform" :class="{ 'rotate-180 text-bejo-500': isDropdownOpen }" />
                        </button>
                      </div>

                      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95 -translate-y-2" enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 -translate-y-2">
                        <div v-if="isDropdownOpen" ref="dropdownRef" class="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[300px]">
                          <div class="p-2 border-b border-slate-100 shrink-0 relative">
                            <Icon icon="lucide:search" class="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <input type="text" v-model="searchQuery" placeholder="Cari properti..." class="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-bejo-500/20 focus:border-bejo-500/50 outline-none transition-all font-bold text-slate-700 text-xs" />
                          </div>
                          <div class="overflow-y-auto custom-scrollbar flex-1 p-2">
                            <button v-for="p in filteredProperties" :key="p.No_Id" type="button" @click="selectProperty(p.No_Id)" class="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-bejo-50 hover:text-bejo-600 transition-colors text-left text-xs font-bold text-slate-600 mb-1">
                              <span class="truncate">{{ p.Nama_Produk }}</span>
                              <Icon v-if="form.id_produk === p.No_Id" icon="lucide:check" class="size-4 text-bejo-500 shrink-0" />
                            </button>
                            <div v-if="filteredProperties.length === 0" class="px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-slate-400">Tidak Ditemukan</div>
                          </div>
                        </div>
                      </Transition>

                      <!-- Property Summary -->
                      <Transition name="fade">
                        <div v-if="selectedPropertyData" class="mt-4 flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                          <div class="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-slate-200 border border-slate-100 shadow-sm">
                             <img v-if="selectedPropertyData.MediaUrls && selectedPropertyData.MediaUrls.length > 0 && (selectedPropertyData.MediaUrls[0].Url || selectedPropertyData.MediaUrls[0].Id_Media)" :src="selectedPropertyData.MediaUrls[0].Url || selectedPropertyData.MediaUrls[0].Id_Media" class="w-full h-full object-cover" />
                             <div v-else class="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100"><Icon icon="lucide:image" class="size-6" /></div>
                          </div>
                          <div class="flex-1 min-w-0">
                            <h4 class="text-xs sm:text-sm font-black text-slate-800 truncate mb-1">{{ selectedPropertyData.Nama_Produk }}</h4>
                            <p class="text-[10px] sm:text-[11px] font-bold text-slate-500 truncate mb-2">{{ selectedPropertyData.Alamat || 'Alamat tidak tersedia' }}</p>
                            <div class="flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-600">
                              <div class="flex items-center gap-1.5"><Icon icon="lucide:bed-double" class="size-3.5 text-slate-400" />{{ selectedPropertyData.Jumlah_Kamar_Tidur || 0 }}{{ selectedPropertyData.Jumlah_Kamar_Tidur_Tambahan ? '+' + selectedPropertyData.Jumlah_Kamar_Tidur_Tambahan : '' }}</div>
                              <div class="flex items-center gap-1.5"><Icon icon="lucide:bath" class="size-3.5 text-slate-400" />{{ selectedPropertyData.Jumlah_Kamar_Mandi || 0 }}{{ selectedPropertyData.Jumlah_Kamar_Mandi_Tambahan ? '+' + selectedPropertyData.Jumlah_Kamar_Mandi_Tambahan : '' }}</div>
                              <div class="flex items-center gap-1.5"><Icon icon="lucide:maximize" class="size-3.5 text-slate-400" />LT: {{ selectedPropertyData.Luas_Tanah || '-' }} m&sup2;</div>
                              <div class="flex items-center gap-1.5"><Icon icon="lucide:home" class="size-3.5 text-slate-400" />LB: {{ selectedPropertyData.Luas_Bangunan || '-' }} m&sup2;</div>
                            </div>
                          </div>
                        </div>
                      </Transition>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div class="group bg-white rounded-2xl p-4 border border-slate-100 shadow-sm transition-all hover:border-bejo-200">
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-bejo-600 transition-colors">Tanggal Pinjam <span class="text-red-500">*</span></label>
                        <input v-model="form.tanggal_pengajuan" :min="minDateTime" type="datetime-local" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-3 text-xs sm:text-sm font-black text-slate-900 shadow-inner focus:outline-none focus:ring-4 focus:ring-bejo-500/10 focus:bg-white focus:border-bejo-200 transition-all" />
                      </div>
                      <div class="group bg-white rounded-2xl p-4 border border-slate-100 shadow-sm transition-all hover:border-bejo-200">
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-bejo-600 transition-colors">Estimasi Pengembalian <span class="text-red-500">*</span></label>
                        <input v-model="form.estimasi_pengembalian" :min="minDateTime" type="datetime-local" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-3 text-xs sm:text-sm font-black text-slate-900 shadow-inner focus:outline-none focus:ring-4 focus:ring-bejo-500/10 focus:bg-white focus:border-bejo-200 transition-all" />
                      </div>
                    </div>
                  </div>

                  <!-- Error Alert -->
                  <div v-if="errorMessage" class="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-start gap-3 border border-red-100">
                    <Icon icon="lucide:alert-circle" class="size-4 shrink-0 mt-0.5" />
                    <span>{{ errorMessage }}</span>
                  </div>

                  <!-- Submit Button -->
                  <button @click="submitPinjamKunci" :disabled="isSubmitting || !isFormComplete" class="w-full py-4 bg-bejo-500 hover:bg-bejo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-bejo-500/30 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95">
                    <Icon v-if="isSubmitting" icon="lucide:loader-2" class="size-5 animate-spin" />
                    <Icon v-else icon="lucide:send" class="size-5" />
                    <span>{{ isSubmitting ? 'Memproses...' : 'Ajukan Peminjaman Kunci' }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Tab: Riwayat Kunci -->
            <div v-else-if="activeTab === 'riwayat'" class="p-8 sm:p-12 min-h-[400px]">
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                <!-- Kiri: Filter & Info -->
                <div class="lg:col-span-1 space-y-6">
                  <div v-if="!agentSession.nama || !agentSession.telepon">
                    <h3 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-3">Cari Data Peminjaman</h3>
                    <p class="text-sm font-medium text-slate-500 leading-relaxed mb-6">Masukkan nama dan nomor telepon terdaftar Anda untuk melihat dan mengelola riwayat peminjaman kunci.</p>

                    <div class="space-y-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                      <div class="group bg-white rounded-2xl p-4 border border-slate-100 shadow-sm transition-all hover:border-bejo-200">
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-bejo-600 transition-colors">Nama Lengkap <span class="text-red-500">*</span></label>
                        <input v-model="recoverForm.nama" type="text" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black text-slate-900 shadow-inner focus:outline-none focus:ring-4 focus:ring-bejo-500/10 focus:bg-white focus:border-bejo-200 transition-all placeholder:text-slate-300" placeholder="Masukkan nama terdaftar" />
                      </div>

                      <div class="group bg-white rounded-2xl p-4 border border-slate-100 shadow-sm transition-all hover:border-bejo-200">
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-bejo-600 transition-colors">Nomor Telepon (628xxxx) <span class="text-red-500">*</span></label>
                        <input v-model="recoverForm.nomor" type="tel" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black text-slate-900 shadow-inner focus:outline-none focus:ring-4 focus:ring-bejo-500/10 focus:bg-white focus:border-bejo-200 transition-all placeholder:text-slate-300" placeholder="Contoh: 081234567890" />
                      </div>

                      <!-- Error Alert -->
                      <div v-if="recoverError" class="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-start gap-3 border border-red-100">
                        <Icon icon="lucide:alert-circle" class="size-4 shrink-0 mt-0.5" />
                        <span>{{ recoverError }}</span>
                      </div>

                      <button @click="recoverUuidData" :disabled="isRecovering" class="w-full mt-2 py-4 bg-bejo-500 hover:bg-bejo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-bejo-900/20 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95">
                        <Icon v-if="isRecovering" icon="lucide:loader-2" class="size-5 animate-spin" />
                        <Icon v-else icon="lucide:search" class="size-5" />
                        <span>{{ isRecovering ? 'Mencari...' : 'Cari Riwayat Saya' }}</span>
                      </button>
                    </div>
                  </div>
                  <div v-else>
                    <div>
                      <h3 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-3">Riwayat Peminjaman</h3>
                      <p class="text-sm font-medium text-slate-500 leading-relaxed mb-6">Daftar riwayat kunci properti yang pernah Anda handle. Gunakan filter di bawah untuk memilah riwayat.</p>

                      <!-- Filter Form -->
                      <div class="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 space-y-4">
                        <div class="space-y-1.5">
                          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Awal</label>
                          <input type="date" v-model="filterRiwayat.tanggal_awal" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-bejo-500/20 focus:border-bejo-500 outline-none transition-all" />
                        </div>
                        <div class="space-y-1.5">
                          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Akhir</label>
                          <input type="date" v-model="filterRiwayat.tanggal_akhir" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-bejo-500/20 focus:border-bejo-500 outline-none transition-all" />
                        </div>
                        <button @click="checkRiwayat" class="w-full py-2.5 bg-bejo-500 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-bejo-600 transition-colors mt-2 shadow-md shadow-bejo-500/20 active:scale-95 flex items-center justify-center gap-2"><Icon icon="lucide:filter" class="size-3.5" /> Terapkan Filter</button>
                      </div>

                      <div class="bg-amber-50 border border-amber-100 rounded-3xl p-6 shadow-sm mt-6">
                        <div class="flex items-start gap-4">
                          <div class="size-10 rounded-full bg-amber-100/50 flex items-center justify-center shrink-0 mt-0.5">
                            <Icon icon="lucide:info" class="size-5 text-amber-600" />
                          </div>
                          <div>
                            <h4 class="text-sm font-black text-amber-900 tracking-tight mb-2">Informasi Penting</h4>
                            <ul class="text-xs font-medium text-amber-700/80 space-y-2.5 list-disc pl-4 leading-relaxed">
                              <li>Pengambilan kunci dilakukan langsung di kantor.</li>
                              <li>Wajib menunjukkan kartu identitas saat pengambilan.</li>
                              <li>Keterlambatan pengembalian dapat mempengaruhi reputasi peminjaman Anda selanjutnya.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Kanan: Riwayat Data -->
                <div class="lg:col-span-2 space-y-4 bg-slate-50/50 rounded-3xl p-6 md:p-8 border border-slate-100 backdrop-blur-sm">
                  <div v-if="agentSession.nama" class="flex flex-col sm:flex-row sm:items-center justify-between bg-white shadow-sm p-4 rounded-[2rem] border border-slate-100 mb-2 gap-4">
                    <div class="text-xs font-bold text-slate-500 pl-2">
                      Riwayat dari <span class="text-bejo-600 font-black">{{ agentSession.nama }}</span>
                    </div>
                    <div class="flex items-center gap-2 w-full sm:w-auto">
                      <button @click="checkRiwayat" :disabled="isLoadingRiwayat" class="flex-1 sm:flex-none justify-center px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm disabled:opacity-50">
                        <Icon icon="lucide:refresh-cw" class="size-3.5" :class="{ 'animate-spin': isLoadingRiwayat }" />
                        Refresh
                      </button>
                      <button @click="logout" class="flex-1 sm:flex-none justify-center px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-100 shadow-sm flex items-center gap-2">
                        <Icon icon="lucide:log-out" class="size-3.5" />
                        Ganti Akun
                      </button>
                    </div>
                  </div>

                  <div v-if="isLoadingRiwayat" class="flex flex-col items-center justify-center h-[300px] text-slate-400">
                    <Icon icon="lucide:loader-2" class="size-8 animate-spin mb-4 text-bejo-500" />
                    <span class="text-sm font-bold tracking-wide">Memuat daftar kunci Anda...</span>
                  </div>

                  <div v-else-if="!agentSession.nama || !agentSession.telepon" class="flex flex-col items-center justify-center h-[300px] text-center">
                    <div class="size-24 bg-white rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
                      <Icon icon="lucide:lock" class="size-10 text-slate-300" />
                    </div>
                    <h3 class="text-xl font-black text-slate-800 tracking-tight mb-2">Belum Ada Sesi</h3>
                    <p class="text-sm font-medium text-slate-500 max-w-md">Silakan lengkapi pencarian data Anda pada formulir di samping untuk melihat riwayat peminjaman kunci.</p>
                  </div>

                  <div v-else-if="riwayatData.length === 0" class="flex flex-col items-center justify-center h-[300px] text-center">
                    <div class="size-24 bg-white rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
                      <Icon icon="lucide:key-round" class="size-10 text-slate-300" />
                    </div>
                    <h3 class="text-xl font-black text-slate-800 tracking-tight mb-2">Belum Ada Riwayat</h3>
                    <p class="text-sm font-medium text-slate-500 max-w-md">Anda belum memiliki riwayat peminjaman kunci. Silakan isi formulir peminjaman jika Anda ingin meminjam kunci properti.</p>
                    <button @click="activeTab = 'form'" class="mt-6 px-8 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-sm">Buka Formulir Peminjaman</button>
                  </div>

                  <div v-else class="space-y-4 max-h-[600px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
                    <div v-for="(item, idx) in riwayatData" :key="idx" class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-6 group">
                      <div class="flex items-start gap-5">
                        <div class="size-14 rounded-2xl bg-bejo-50 text-bejo-500 flex items-center justify-center shrink-0 border border-bejo-100 group-hover:scale-110 transition-transform">
                          <Icon icon="lucide:key" class="size-6" />
                        </div>
                        <div>
                          <h4 class="text-lg font-black text-slate-800 tracking-tight mb-1">{{ item.Nama_Kunci || 'Kunci Properti' }}</h4>
                          <p class="text-xs font-bold text-slate-500">{{ item.Nama_Produk || item.Id_Produk }}</p>

                          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-[11px] text-slate-500 font-medium bg-slate-50 px-3 py-2 rounded-xl">
                            <div class="flex items-center gap-1.5">
                              <Icon icon="lucide:calendar-clock" class="size-4 text-slate-400" />
                              <span><strong class="text-slate-600">Tgl Pengajuan:</strong> {{ item.Tanggal_Pengajuan?.replace('T', ' ') || '-' }}</span>
                            </div>
                            <div class="hidden sm:block w-px h-3 bg-slate-200"></div>
                            <div class="flex items-center gap-1.5">
                              <Icon icon="lucide:history" class="size-4 text-slate-400" />
                              <span><strong class="text-slate-600">Kembalikan Sebelum:</strong> {{ item.Estimasi_Pengembalian?.replace('T', ' ') || '-' }}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-50">
                        <span
                          class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm"
                          :class="{
                            'bg-blue-50 text-blue-600 border border-blue-100': item.Status_Progress === 'baru',
                            'bg-amber-50 text-amber-600 border border-amber-100': item.Status_Progress === 'konfirmasi',
                            'bg-purple-50 text-purple-600 border border-purple-100': item.Status_Progress === 'diambil',
                            'bg-emerald-50 text-emerald-600 border border-emerald-100': item.Status_Progress === 'dikembalikan',
                            'bg-rose-50 text-rose-600 border border-rose-100': item.Status_Progress === 'batal' || item.Status_Progress === 'ditolak',
                            'bg-slate-50 text-slate-500 border border-slate-100': !item.Status_Progress
                          }"
                        >
                          {{ item.Status_Progress || 'PROSES' }}
                        </span>
                        <span class="text-[10px] font-bold text-slate-400"
                          >ID: <span class="text-slate-600 font-black">{{ item.No_Tracking || '-' }}</span></span
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </Guest>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
