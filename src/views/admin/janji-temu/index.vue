<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import { success, fail } from '@/utils/sweet-alert'
import Vertical from '@/layouts/vertical.vue'
import AppointmentStats from './components/AppointmentStats.vue'
import Calendar from './components/Calendar.vue'
import Event from './components/Event.vue'
import ChatWidget from '@/components/ChatWidget.vue'
import CreateAppointmentModal from './components/CreateAppointmentModal.vue'
import api from '@/services/axios'

const calendarRef = ref<InstanceType<typeof Calendar> | null>(null)
const chatWidgetRef = ref<any>(null)
const showCreateModal = ref(false)
const openAppointment = ref(false)
const isShrinkCalendar = ref(false)
const selectedEvent = ref<any>(null)
const appointmentData = ref<any>(null)
const appointments = ref<any[]>([])
const products = ref<any[]>([])
const customers = ref<any[]>([])
const isLoading = ref(true)

const filter = ref({
  id_produk: '',
  id_customer: '',
  status_progress: ''
})

const isDropdownOpen = ref({ produk: false, customer: false, status: false })
const searchDropdown = ref({ produk: '', customer: '', status: '' })
const dropdownStyle = ref({
  produk: { top: '0px', left: '0px', width: '0px' },
  customer: { top: '0px', left: '0px', width: '0px' },
  status: { top: '0px', left: '0px', width: '0px' }
})

const produkBtnRef = ref<HTMLElement | null>(null)
const customerBtnRef = ref<HTMLElement | null>(null)
const statusBtnRef = ref<HTMLElement | null>(null)

const menuRefs = ref({
  produk: null as HTMLElement | null,
  customer: null as HTMLElement | null,
  status: null as HTMLElement | null
})

const updateDropdownStyle = (type: 'produk' | 'customer' | 'status') => {
  const btn = type === 'produk' ? produkBtnRef.value : type === 'customer' ? customerBtnRef.value : statusBtnRef.value;
  if (btn) {
    const rect = btn.getBoundingClientRect()
    dropdownStyle.value[type] = {
      top: `${rect.bottom + 8}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`
    }
  }
}

const toggleDropdown = (type: 'produk' | 'customer' | 'status') => {
  isDropdownOpen.value[type] = !isDropdownOpen.value[type]
  if (type !== 'produk') isDropdownOpen.value.produk = false
  if (type !== 'customer') isDropdownOpen.value.customer = false
  if (type !== 'status') isDropdownOpen.value.status = false

  if (isDropdownOpen.value[type]) {
    nextTick(() => updateDropdownStyle(type))
  }
}

const selectFilter = (type: 'id_produk' | 'id_customer' | 'status_progress', val: string) => {
  filter.value[type] = val
  if (type === 'id_produk') {
    isDropdownOpen.value.produk = false
    searchDropdown.value.produk = ''
  }
  if (type === 'id_customer') {
    isDropdownOpen.value.customer = false
    searchDropdown.value.customer = ''
  }
  if (type === 'status_progress') {
    isDropdownOpen.value.status = false
    searchDropdown.value.status = ''
  }
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  const isInsideBtn = (btn: HTMLElement | null) => btn && btn.contains(target)
  const isInsideMenu = (menu: HTMLElement | null) => menu && menu.contains(target)

  if (!isInsideBtn(produkBtnRef.value) && !isInsideMenu(menuRefs.value.produk)) {
    isDropdownOpen.value.produk = false
  }
  if (!isInsideBtn(customerBtnRef.value) && !isInsideMenu(menuRefs.value.customer)) {
    isDropdownOpen.value.customer = false
  }
  if (!isInsideBtn(statusBtnRef.value) && !isInsideMenu(menuRefs.value.status)) {
    isDropdownOpen.value.status = false
  }
}

const filteredProducts = computed(() => {
  if (!searchDropdown.value.produk) return products.value
  const query = searchDropdown.value.produk.toLowerCase()
  return products.value.filter((p: any) => 
    p.Nama_Produk.toLowerCase().includes(query)
  )
})

const filteredCustomers = computed(() => {
  if (!searchDropdown.value.customer) return customers.value
  const query = searchDropdown.value.customer.toLowerCase()
  return customers.value.filter((c: any) => 
    (c.Nama_Display || c.UserName || c.No_Id).toLowerCase().includes(query)
  )
})

const statusOptions = [
  { value: 'baru', label: 'Baru' },
  { value: 'dikonfirmasi', label: 'Dikonfirmasi' },
  { value: 'proses', label: 'Proses' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'batal', label: 'Batal' }
]

const filteredStatus = computed(() => {
  if (!searchDropdown.value.status) return statusOptions
  const query = searchDropdown.value.status.toLowerCase()
  return statusOptions.filter((s: any) => 
    s.label.toLowerCase().includes(query)
  )
})

const handleScroll = () => {
  if (isDropdownOpen.value.produk) updateDropdownStyle('produk')
  if (isDropdownOpen.value.customer) updateDropdownStyle('customer')
  if (isDropdownOpen.value.status) updateDropdownStyle('status')
}

// Responsive Detection
const showAsPopup = ref(false)
const updateView = () => {
  showAsPopup.value = window.innerWidth < 1280 || window.innerHeight < 720
}

// Past Due Notification Modal State
const showPastDueModal = ref(false)
const dontShowToday = ref(false)
const selectedPastDueIds = ref<number[]>([])
const isUpdatingPastDue = ref(false)

const getTodayString = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const pastDueAppointments = computed(() => {
  const todayStr = getTodayString()
  return appointments.value.filter(app => {
    const appDate = app.Tanggal_Janji.split('T')[0]
    return appDate <= todayStr && ['baru', 'dikonfirmasi', 'proses'].includes(app.Status_Progress)
  })
})

const groupedPastDue = computed(() => {
  const groups = {
    baru: [] as any[],
    dikonfirmasi: [] as any[],
    proses: [] as any[]
  }
  pastDueAppointments.value.forEach(app => {
    if (groups[app.Status_Progress as keyof typeof groups]) {
      groups[app.Status_Progress as keyof typeof groups].push(app)
    }
  })
  return groups
})

const fetchAppointments = async () => {
  isLoading.value = true
  try {
    let url = '/api/janjiTemu/getAll?orderby=no_id&orderdir=asc'
    if (filter.value.id_produk) url += `&id_produk=${filter.value.id_produk}`
    if (filter.value.id_customer) url += `&id_customer=${filter.value.id_customer}`
    if (filter.value.status_progress) url += `&status_progress=${filter.value.status_progress}`

    const { data } = await api.get(url, {
      headers: { 'X-Jenis-User': 'admin' }
    })
    appointments.value = data.Data || []
    
    // Check past due modal visibility after data fetched
    nextTick(() => {
      const todayStr = getTodayString()
      const hideDate = localStorage.getItem('hidePastDueModalDate')
      if (hideDate !== todayStr && pastDueAppointments.value.length > 0) {
        selectedPastDueIds.value = pastDueAppointments.value.map(app => app.No_Id)
        showPastDueModal.value = true
      }
    })
  } catch (error) {
    console.error('Gagal mengambil data janji temu:', error)
  } finally {
    isLoading.value = false
  }
}

const updatePastDueStatus = async () => {
  if (selectedPastDueIds.value.length === 0) return
  isUpdatingPastDue.value = true
  try {
    const selectedApps = pastDueAppointments.value.filter(app => selectedPastDueIds.value.includes(app.No_Id))
    
    await Promise.all(selectedApps.map(async (app) => {
      if (app.Status_Progress === 'baru') {
        const adminId = localStorage.getItem('no_id') || ''
        await api.put(`/api/janjiTemu/confirm?no_id=${app.No_Id}`, { Id_Admin: adminId }, { headers: { 'X-Jenis-User': 'admin' } })
      } else {
        const nextStatus = app.Status_Progress === 'dikonfirmasi' ? 'proses' : 'selesai'
        const payload = {
          ...app,
          Status_Progress: nextStatus,
          Tanggal_Janji: null,
          Waktu_Janji: null,
          Waktu_Selesai: null
        }
        await api.put(`/api/janjiTemu/update?no_id=${app.No_Id}`, payload, { headers: { 'X-Jenis-User': 'admin' } })
      }
    }))
    
    if (dontShowToday.value) {
      localStorage.setItem('hidePastDueModalDate', getTodayString())
    }
    
    showPastDueModal.value = false
    success(`Berhasil memperbarui ${selectedApps.length} janji temu.`)
    fetchAppointments()
  } catch (err) {
    console.error('Failed to update past due appointments:', err)
    fail('Terjadi kesalahan saat memperbarui status janji temu.')
  } finally {
    isUpdatingPastDue.value = false
  }
}

const cancellingAppId = ref<number | null>(null)
const cancelReasonText = ref('')

const startCancelInline = (appId: number) => {
  cancellingAppId.value = appId
  cancelReasonText.value = ''
}

const cancelCancelInline = () => {
  cancellingAppId.value = null
  cancelReasonText.value = ''
}

const submitCancelInline = async (app: any) => {
  if (!cancelReasonText.value.trim()) return
  try {
    const payload = {
      ...app,
      Status_Progress: 'batal',
      Alasan_Batal: cancelReasonText.value,
      Tanggal_Janji: null,
      Waktu_Janji: null,
      Waktu_Selesai: null
    }
    await api.put(`/api/janjiTemu/update?no_id=${app.No_Id}`, payload, { headers: { 'X-Jenis-User': 'admin' } })
    
    selectedPastDueIds.value = selectedPastDueIds.value.filter(id => id !== app.No_Id)
    cancellingAppId.value = null
    cancelReasonText.value = ''
    success('Janji temu telah dibatalkan.')
    fetchAppointments()
  } catch (error) {
    console.error('Gagal membatalkan janji temu:', error)
    fail('Gagal membatalkan janji temu.')
  }
}

const isAllGroupSelected = (status: string) => {
  const groupItems = groupedPastDue.value[status as keyof typeof groupedPastDue.value] || []
  if (groupItems.length === 0) return false
  return groupItems.every(item => selectedPastDueIds.value.includes(item.No_Id))
}

const toggleSelectAllGroup = (status: string) => {
  const groupItems = groupedPastDue.value[status as keyof typeof groupedPastDue.value] || []
  const groupIds = groupItems.map(item => item.No_Id)
  const allSelected = isAllGroupSelected(status)
  
  if (allSelected) {
    selectedPastDueIds.value = selectedPastDueIds.value.filter(id => !groupIds.includes(id))
  } else {
    const otherIds = selectedPastDueIds.value.filter(id => !groupIds.includes(id))
    selectedPastDueIds.value = [...otherIds, ...groupIds]
  }
}

const closePastDueModal = () => {
  if (dontShowToday.value) {
    localStorage.setItem('hidePastDueModalDate', getTodayString())
  }
  showPastDueModal.value = false
}

const fetchFilterOptions = async () => {
  try {
    const [prodRes, custRes] = await Promise.all([
      api.get('/api/realEstate/getAll', { headers: { 'X-Jenis-User': 'admin' } }),
      api.get('/api/customer/getAll', { headers: { 'X-Jenis-User': 'admin' } })
    ])
    products.value = prodRes.data.Data || []
    customers.value = custRes.data.Data || []
  } catch (err) {
    console.error('Gagal mengambil opsi filter:', err)
  }
}

const applyFilter = () => {
  fetchAppointments()
}

const resetFilter = () => {
  filter.value = { id_produk: '', id_customer: '', status_progress: '' }
  fetchAppointments()
}

onMounted(() => {
  updateView()
  window.addEventListener('resize', updateView)
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
  fetchFilterOptions()
  fetchAppointments()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateView)
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
})

const handleOpenChat = (customerId: string) => {
  if (chatWidgetRef.value) {
    chatWidgetRef.value.openForCustomer(customerId)
  }
}

const openAppointmentHandler = (data: any) => {
  selectedEvent.value = data
  appointmentData.value = data
  openAppointment.value = true
  isShrinkCalendar.value = true
  nextTick(() => {
    calendarRef.value?.refreshCalendar()
  })
}

const closeAppointment = () => {
  openAppointment.value = false
  setTimeout(() => {
    isShrinkCalendar.value = false
    nextTick(() => {
      calendarRef.value?.refreshCalendar()
    })
  }, 400)

  setTimeout(() => {
    selectedEvent.value = null
  }, 500)
}

const handleRefresh = () => {
  fetchAppointments()
  closeAppointment()
}
</script>

<template>
  <Vertical>
    <div class="p-4 md:p-3 md:pt-1 pb-24 space-y-4">
      <!-- Header with Add Button -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl md:text-2xl font-black text-slate-800">Janji Temu</h2>
          <p class="text-sm text-slate-500 font-medium">Kelola jadwal pertemuan dengan customer</p>
        </div>
        <button @click="showCreateModal = true" class="px-4 py-2 bg-bejo-500 hover:bg-bejo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-bejo-500/20">
          <Icon icon="lucide:plus" class="size-5" />
          Tambah Janji Temu
        </button>
      </div>

      <!-- Stats Overview -->
      <AppointmentStats :appointments="appointments" />
      
      <!-- Filters -->
      <div class="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-4 items-end">
        <div class="flex-1 min-w-[200px] space-y-1 relative">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Properti</label>
          <button type="button" ref="produkBtnRef" @click="toggleDropdown('produk')" class="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all font-bold text-sm flex items-center justify-between group" :class="filter.id_produk ? 'text-slate-700' : 'text-slate-400'">
            <span class="truncate">
              {{ filter.id_produk ? (products.find((p: any) => p.No_Id === filter.id_produk)?.Nama_Produk || filter.id_produk) : 'Semua' }}
            </span>
            <Icon icon="lucide:chevron-down" class="text-slate-400 size-4 transition-transform" :class="{'rotate-180 text-bejo-500': isDropdownOpen.produk}" />
          </button>
          
          <Teleport to="body">
            <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95 -translate-y-2" enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 -translate-y-2">
              <div v-if="isDropdownOpen.produk" :ref="(el) => menuRefs.produk = el as HTMLElement" class="fixed z-[1200] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[300px]" :style="dropdownStyle.produk">
                <div class="p-2 border-b border-slate-100 shrink-0 relative">
                  <Icon icon="lucide:search" class="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input type="text" v-model="searchDropdown.produk" placeholder="Cari produk..." class="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-bejo-500/20 focus:border-bejo-500/50 outline-none transition-all font-bold text-slate-700 text-xs" />
                </div>
                <div class="overflow-y-auto custom-scrollbar flex-1 p-2">
                  <button type="button" @click="selectFilter('id_produk', '')" class="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-bejo-50 hover:text-bejo-600 transition-colors text-left text-xs font-bold text-slate-600 mb-1">
                    <span class="truncate">Semua Produk</span>
                    <Icon v-if="filter.id_produk === ''" icon="lucide:check" class="size-4 text-bejo-500 shrink-0" />
                  </button>
                  <button v-for="p in filteredProducts" :key="p.No_Id" type="button" @click="selectFilter('id_produk', p.No_Id)" class="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-bejo-50 hover:text-bejo-600 transition-colors text-left text-xs font-bold text-slate-600">
                    <span class="truncate">{{ p.Nama_Produk }}</span>
                    <Icon v-if="filter.id_produk === p.No_Id" icon="lucide:check" class="size-4 text-bejo-500 shrink-0" />
                  </button>
                  <div v-if="filteredProducts.length === 0" class="px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-slate-400">
                    Tidak Ditemukan
                  </div>
                </div>
              </div>
            </Transition>
          </Teleport>
        </div>

        <div class="flex-1 min-w-[200px] space-y-1 relative">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer</label>
          <button type="button" ref="customerBtnRef" @click="toggleDropdown('customer')" class="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all font-bold text-sm flex items-center justify-between group" :class="filter.id_customer ? 'text-slate-700' : 'text-slate-400'">
            <span class="truncate">
              {{ filter.id_customer ? (customers.find((c: any) => c.No_Id === filter.id_customer)?.Nama_Display || filter.id_customer) : 'Semua' }}
            </span>
            <Icon icon="lucide:chevron-down" class="text-slate-400 size-4 transition-transform" :class="{'rotate-180 text-bejo-500': isDropdownOpen.customer}" />
          </button>
          
          <Teleport to="body">
            <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95 -translate-y-2" enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 -translate-y-2">
              <div v-if="isDropdownOpen.customer" :ref="(el) => menuRefs.customer = el as HTMLElement" class="fixed z-[1200] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[300px]" :style="dropdownStyle.customer">
                <div class="p-2 border-b border-slate-100 shrink-0 relative">
                  <Icon icon="lucide:search" class="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input type="text" v-model="searchDropdown.customer" placeholder="Cari customer..." class="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-bejo-500/20 focus:border-bejo-500/50 outline-none transition-all font-bold text-slate-700 text-xs" />
                </div>
                <div class="overflow-y-auto custom-scrollbar flex-1 p-2">
                  <button type="button" @click="selectFilter('id_customer', '')" class="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-bejo-50 hover:text-bejo-600 transition-colors text-left text-xs font-bold text-slate-600 mb-1">
                    <span class="truncate">Semua Customer</span>
                    <Icon v-if="filter.id_customer === ''" icon="lucide:check" class="size-4 text-bejo-500 shrink-0" />
                  </button>
                  <button v-for="c in filteredCustomers" :key="c.No_Id" type="button" @click="selectFilter('id_customer', c.No_Id)" class="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-bejo-50 hover:text-bejo-600 transition-colors text-left text-xs font-bold text-slate-600">
                    <span class="truncate">{{ c.Nama_Display || c.UserName }}</span>
                    <Icon v-if="filter.id_customer === c.No_Id" icon="lucide:check" class="size-4 text-bejo-500 shrink-0" />
                  </button>
                  <div v-if="filteredCustomers.length === 0" class="px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-slate-400">
                    Tidak Ditemukan
                  </div>
                </div>
              </div>
            </Transition>
          </Teleport>
        </div>

        <div class="flex-1 min-w-[200px] space-y-1 relative">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Progress</label>
          <button type="button" ref="statusBtnRef" @click="toggleDropdown('status')" class="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all font-bold text-sm flex items-center justify-between group" :class="filter.status_progress ? 'text-slate-700' : 'text-slate-400'">
            <span class="truncate">
              {{ filter.status_progress ? statusOptions.find(s => s.value === filter.status_progress)?.label : 'Semua' }}
            </span>
            <Icon icon="lucide:chevron-down" class="text-slate-400 size-4 transition-transform" :class="{'rotate-180 text-bejo-500': isDropdownOpen.status}" />
          </button>
          
          <Teleport to="body">
            <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95 -translate-y-2" enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 -translate-y-2">
              <div v-if="isDropdownOpen.status" :ref="(el) => menuRefs.status = el as HTMLElement" class="fixed z-[1200] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[300px]" :style="dropdownStyle.status">
                <div class="p-2 border-b border-slate-100 shrink-0 relative">
                  <Icon icon="lucide:search" class="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input type="text" v-model="searchDropdown.status" placeholder="Cari status..." class="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-bejo-500/20 focus:border-bejo-500/50 outline-none transition-all font-bold text-slate-700 text-xs" />
                </div>
                <div class="overflow-y-auto custom-scrollbar flex-1 p-2">
                  <button type="button" @click="selectFilter('status_progress', '')" class="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-bejo-50 hover:text-bejo-600 transition-colors text-left text-xs font-bold text-slate-600 mb-1">
                    <span class="truncate">Semua Status</span>
                    <Icon v-if="filter.status_progress === ''" icon="lucide:check" class="size-4 text-bejo-500 shrink-0" />
                  </button>
                  <button v-for="s in filteredStatus" :key="s.value" type="button" @click="selectFilter('status_progress', s.value)" class="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-bejo-50 hover:text-bejo-600 transition-colors text-left text-xs font-bold text-slate-600">
                    <span class="truncate">{{ s.label }}</span>
                    <Icon v-if="filter.status_progress === s.value" icon="lucide:check" class="size-4 text-bejo-500 shrink-0" />
                  </button>
                  <div v-if="filteredStatus.length === 0" class="px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-slate-400">
                    Tidak Ditemukan
                  </div>
                </div>
              </div>
            </Transition>
          </Teleport>
        </div>

        <div class="w-full md:w-auto shrink-0 flex gap-2">
          <button @click="applyFilter" class="px-6 h-11 bg-bejo-500 hover:bg-bejo-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-bejo-500/20">
            GO
          </button>
          <button @click="resetFilter" class="px-6 h-11 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors">
            Reset
          </button>
        </div>
      </div>
      
      <!-- Calendar & Detail Section -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <!-- Main Calendar -->
        <Calendar 
          ref="calendarRef" 
          :appointments="appointments"
          :appointmentOpen="isShrinkCalendar && !showAsPopup" 
          @openAppointment="openAppointmentHandler" 
        />
        
        <!-- Desktop Quick Detail Panel -->
        <div v-if="openAppointment && !showAsPopup" class="lg:col-span-4 xl:col-span-3 h-full min-h-0">
          <Transition name="slide-fade">
             <Event 
               :openAppointment="openAppointment" 
               :appointment="appointmentData" 
               :appointments="appointments"
               class="h-full"
               @close="closeAppointment" 
               @refresh="handleRefresh"
               @openChat="handleOpenChat"
             />
          </Transition>
        </div>
      </div>

      <!-- Mobile & Tablet Modal Detail -->
      <Transition name="fade">
        <div v-if="openAppointment && showAsPopup" class="fixed inset-0 z-[1050] flex items-center justify-center p-4 md:p-10">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md shadow-2xl" @click="closeAppointment"></div>
          <div class="relative w-full max-w-lg h-[85vh] animate-in zoom-in-95 duration-300">
            <Event 
              :openAppointment="openAppointment" 
              :appointment="appointmentData" 
              :appointments="appointments"
              class="h-full"
              @close="closeAppointment" 
              @refresh="handleRefresh"
              @openChat="handleOpenChat"
            />
          </div>
        </div>
      </Transition>
    </div>

    <!-- Past Due Appointments Pop-up Modal -->
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showPastDueModal" class="fixed inset-0 z-[1060] flex items-center justify-center p-4 md:p-6">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closePastDueModal"></div>
        <div class="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300">
          
          <!-- Header -->
          <div class="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 shrink-0">
            <div class="flex items-center gap-4">
              <div class="size-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                <Icon icon="lucide:alert-circle" class="size-5" />
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">Konfirmasi Jadwal Terlewat</h3>
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Perbarui janji temu yang telah terlewat</p>
              </div>
            </div>
            <button @click="closePastDueModal" class="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white hover:text-red-500 transition-all shrink-0">
              <Icon icon="lucide:x" class="size-5" />
            </button>
          </div>

          <!-- Body (Scrollable Container) -->
          <div class="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
            
            <!-- Group: BARU -->
            <div v-if="groupedPastDue.baru.length > 0" class="space-y-2 sm:space-y-3">
              <div class="flex items-center justify-between px-1 gap-2 flex-wrap">
                <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span class="text-[9px] sm:text-[11px] font-black text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg">Status: Pengajuan (Baru)</span>
                  <span class="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-400">Tahap berikutnya: Konfirmasi</span>
                </div>
                <label class="flex items-center gap-1.5 cursor-pointer text-[10px] sm:text-xs font-bold text-slate-500">
                  <input type="checkbox" :checked="isAllGroupSelected('baru')" @change="toggleSelectAllGroup('baru')" class="size-3.5 sm:size-4 rounded text-blue-500 focus:ring-blue-400 border-slate-200" />
                  Pilih Semua
                </label>
              </div>
              <div class="divide-y divide-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50/30">
                <div v-for="app in groupedPastDue.baru" :key="app.No_Id" class="hover:bg-white transition-colors">
                   <div class="flex items-center justify-between gap-2.5 p-3 sm:p-4">
                     <label class="flex items-center gap-2.5 sm:gap-3.5 flex-1 cursor-pointer min-w-0">
                       <input type="checkbox" :value="app.No_Id" v-model="selectedPastDueIds" class="size-4 sm:size-5 rounded text-blue-500 focus:ring-blue-400 border-slate-250 shrink-0" />
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                           <span class="text-xs sm:text-sm md:text-base font-black text-slate-800">{{ app.Nama_Customer || app.Id_Customer }}</span>
                           <span class="text-[8px] sm:text-[10px] font-mono text-slate-450 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded font-bold">#{{ app.No_Tracking }}</span>
                        </div>
                        <p class="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-500 truncate mt-0.5 sm:mt-1">{{ app.Nama_Produk }}</p>
                        <p class="text-[10px] sm:text-xs font-bold text-red-500/90 mt-1 flex items-center gap-1 sm:gap-1.5">
                          <Icon icon="lucide:calendar" class="size-3.5 shrink-0" />
                          {{ app.Tanggal_Janji.split('T')[0] }} • {{ app.Waktu_Janji }} WIB
                        </p>
                      </div>
                    </label>
                    <button v-if="cancellingAppId !== app.No_Id" @click.stop="startCancelInline(app.No_Id)" class="px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1">
                      <Icon icon="lucide:ban" class="size-3.5 shrink-0" />
                      Batal
                    </button>
                  </div>
                  
                  <!-- Inline Cancellation Form -->
                  <div v-if="cancellingAppId === app.No_Id" class="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 space-y-2 sm:space-y-3 bg-red-50/10 border-t border-slate-50">
                    <div class="space-y-1">
                      <label class="text-[9px] sm:text-[10px] font-black text-red-500 uppercase tracking-wider block">Alasan Pembatalan (Wajib)</label>
                      <textarea 
                        v-model="cancelReasonText" 
                        class="w-full px-3 py-2 bg-white border border-slate-200 focus:border-red-400 focus:ring-red-400 rounded-xl text-xs font-bold min-h-[60px]" 
                        placeholder="Masukkan alasan pembatalan..."
                      ></textarea>
                    </div>
                    <div class="flex items-center gap-2 justify-end">
                      <button @click="cancelCancelInline" class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-colors">
                        Kembali
                      </button>
                      <button 
                        @click="submitCancelInline(app)" 
                        :disabled="!cancelReasonText.trim()"
                        class="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                      >
                        Ya, Batalkan!
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Group: DIKONFIRMASI -->
            <div v-if="groupedPastDue.dikonfirmasi.length > 0" class="space-y-2 sm:space-y-3">
              <div class="flex items-center justify-between px-1 gap-2 flex-wrap">
                <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span class="text-[9px] sm:text-[11px] font-black text-bejo-600 uppercase tracking-wider bg-bejo-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg">Status: Dikonfirmasi</span>
                  <span class="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-400">Tahap berikutnya: Mulai Pertemuan</span>
                </div>
                <label class="flex items-center gap-1.5 cursor-pointer text-[10px] sm:text-xs font-bold text-slate-500">
                  <input type="checkbox" :checked="isAllGroupSelected('dikonfirmasi')" @change="toggleSelectAllGroup('dikonfirmasi')" class="size-3.5 sm:size-4 rounded text-bejo-500 focus:ring-bejo-400 border-slate-200" />
                  Pilih Semua
                </label>
              </div>
              <div class="divide-y divide-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50/30">
                <div v-for="app in groupedPastDue.dikonfirmasi" :key="app.No_Id" class="hover:bg-white transition-colors">
                  <div class="flex items-center justify-between gap-2.5 p-3 sm:p-4">
                    <label class="flex items-center gap-2.5 sm:gap-3.5 flex-1 cursor-pointer min-w-0">
                      <input type="checkbox" :value="app.No_Id" v-model="selectedPastDueIds" class="size-4 sm:size-5 rounded text-bejo-500 focus:ring-bejo-400 border-slate-250 shrink-0" />
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                           <span class="text-xs sm:text-sm md:text-base font-black text-slate-800">{{ app.Nama_Customer || app.Id_Customer }}</span>
                           <span class="text-[8px] sm:text-[10px] font-mono text-slate-450 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded font-bold">#{{ app.No_Tracking }}</span>
                        </div>
                        <p class="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-500 truncate mt-0.5 sm:mt-1">{{ app.Nama_Produk }}</p>
                        <p class="text-[10px] sm:text-xs font-bold text-red-500/90 mt-1 flex items-center gap-1 sm:gap-1.5">
                          <Icon icon="lucide:calendar" class="size-3.5 shrink-0" />
                          {{ app.Tanggal_Janji.split('T')[0] }} • {{ app.Waktu_Janji }} WIB
                        </p>
                      </div>
                    </label>
                    <button v-if="cancellingAppId !== app.No_Id" @click.stop="startCancelInline(app.No_Id)" class="px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1">
                      <Icon icon="lucide:ban" class="size-3.5 shrink-0" />
                      Batal
                    </button>
                  </div>
                  
                  <!-- Inline Cancellation Form -->
                  <div v-if="cancellingAppId === app.No_Id" class="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 space-y-2 sm:space-y-3 bg-red-50/10 border-t border-slate-50">
                    <div class="space-y-1">
                      <label class="text-[9px] sm:text-[10px] font-black text-red-500 uppercase tracking-wider block">Alasan Pembatalan (Wajib)</label>
                      <textarea 
                        v-model="cancelReasonText" 
                        class="w-full px-3 py-2 bg-white border border-slate-200 focus:border-red-400 focus:ring-red-400 rounded-xl text-xs font-bold min-h-[60px]" 
                        placeholder="Masukkan alasan pembatalan..."
                      ></textarea>
                    </div>
                    <div class="flex items-center gap-2 justify-end">
                      <button @click="cancelCancelInline" class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-colors">
                        Kembali
                      </button>
                      <button 
                        @click="submitCancelInline(app)" 
                        :disabled="!cancelReasonText.trim()"
                        class="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                      >
                        Ya, Batalkan!
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Group: PROSES -->
            <div v-if="groupedPastDue.proses.length > 0" class="space-y-2 sm:space-y-3">
              <div class="flex items-center justify-between px-1 gap-2 flex-wrap">
                <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span class="text-[9px] sm:text-[11px] font-black text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg">Status: Mulai Pertemuan (Proses)</span>
                  <span class="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-400">Tahap berikutnya: Selesai</span>
                </div>
                <label class="flex items-center gap-1.5 cursor-pointer text-[10px] sm:text-xs font-bold text-slate-500">
                  <input type="checkbox" :checked="isAllGroupSelected('proses')" @change="toggleSelectAllGroup('proses')" class="size-3.5 sm:size-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-200" />
                  Pilih Semua
                </label>
              </div>
              <div class="divide-y divide-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50/30">
                <div v-for="app in groupedPastDue.proses" :key="app.No_Id" class="hover:bg-white transition-colors">
                  <div class="flex items-center justify-between gap-2.5 p-3 sm:p-4">
                    <label class="flex items-center gap-2.5 sm:gap-3.5 flex-1 cursor-pointer min-w-0">
                      <input type="checkbox" :value="app.No_Id" v-model="selectedPastDueIds" class="size-4 sm:size-5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-250 shrink-0" />
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                           <span class="text-xs sm:text-sm md:text-base font-black text-slate-800">{{ app.Nama_Customer || app.Id_Customer }}</span>
                           <span class="text-[8px] sm:text-[10px] font-mono text-slate-450 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded font-bold">#{{ app.No_Tracking }}</span>
                        </div>
                        <p class="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-500 truncate mt-0.5 sm:mt-1">{{ app.Nama_Produk }}</p>
                        <p class="text-[10px] sm:text-xs font-bold text-red-500/90 mt-1 flex items-center gap-1 sm:gap-1.5">
                          <Icon icon="lucide:calendar" class="size-3.5 shrink-0" />
                          {{ app.Tanggal_Janji.split('T')[0] }} • {{ app.Waktu_Janji }} WIB
                        </p>
                      </div>
                    </label>
                    <button v-if="cancellingAppId !== app.No_Id" @click.stop="startCancelInline(app.No_Id)" class="px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1">
                      <Icon icon="lucide:ban" class="size-3.5 shrink-0" />
                      Batal
                    </button>
                  </div>
                  
                  <!-- Inline Cancellation Form -->
                  <div v-if="cancellingAppId === app.No_Id" class="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 space-y-2 sm:space-y-3 bg-red-50/10 border-t border-slate-50">
                    <div class="space-y-1">
                      <label class="text-[9px] sm:text-[10px] font-black text-red-500 uppercase tracking-wider block">Alasan Pembatalan (Wajib)</label>
                      <textarea 
                        v-model="cancelReasonText" 
                        class="w-full px-3 py-2 bg-white border border-slate-200 focus:border-red-400 focus:ring-red-400 rounded-xl text-xs font-bold min-h-[60px]" 
                        placeholder="Masukkan alasan pembatalan..."
                      ></textarea>
                    </div>
                    <div class="flex items-center gap-2 justify-end">
                      <button @click="cancelCancelInline" class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-colors">
                        Kembali
                      </button>
                      <button 
                        @click="submitCancelInline(app)" 
                        :disabled="!cancelReasonText.trim()"
                        class="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                      >
                        Ya, Batalkan!
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div class="px-8 py-6 border-t border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
            <label class="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" v-model="dontShowToday" class="size-4 rounded border-slate-200 text-bejo-500 focus:ring-bejo-500/20 transition-all" />
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Jangan tampilkan hari ini</span>
            </label>
            <div class="flex items-center gap-4 justify-end">
              <button @click="closePastDueModal" class="px-6 py-3 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all">
                Tutup
              </button>
              <button @click="updatePastDueStatus" :disabled="selectedPastDueIds.length === 0 || isUpdatingPastDue" class="px-8 py-3 bg-bejo-600 hover:bg-bejo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-bejo-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                <Icon v-if="isUpdatingPastDue" icon="lucide:loader-2" class="size-4 animate-spin" />
                <Icon v-else icon="lucide:check-circle" class="size-4" />
                Update Status ({{ selectedPastDueIds.length }})
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>

    <CreateAppointmentModal v-model="showCreateModal" @refresh="fetchAppointments" />
    <ChatWidget ref="chatWidgetRef" />
  </Vertical>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.4s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(30px);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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
</style>