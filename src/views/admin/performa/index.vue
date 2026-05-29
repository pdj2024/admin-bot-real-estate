<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Vertical from '@/layouts/vertical.vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'
import { success, fail } from '@/utils/sweet-alert'

interface PerformaItem {
  No_Id: number
  Id_Customer: string
  Jml_Chat: number
  Jml_Janji_Temu_Selesai: number
  Jml_Janji_Temu_Batal: number
  Jml_Produk_Transaksi: number
  Last_Updated: string
}

const performaList = ref<PerformaItem[]>([])
const customers = ref<any[]>([])
const isLoading = ref(true)
const isRecalculating = ref(false)

// Search & Pagination States
const searchQuery = ref('')
const sortBy = ref('Jml_Chat')
const sortDir = ref<'asc' | 'desc'>('desc')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const fetchCustomers = async () => {
  try {
    const { data } = await api.get('/api/customer/getAll', {
      headers: {
        'X-Jenis-User': 'Admin',
        'Api-Key': 'realestate_key_2024'
      }
    })
    customers.value = data.Data || []
  } catch (err) {
    console.error('Gagal mengambil data customer:', err)
  }
}

const fetchPerforma = async () => {
  isLoading.value = true
  try {
    const { data } = await api.get('/api/performaCustomer/getAll?orderby=id_customer&orderdir=asc', {
      headers: { 'X-Jenis-User': 'admin' }
    })
    performaList.value = data.Data || []
  } catch (err) {
    console.error('Gagal mengambil data performa:', err)
  } finally {
    isLoading.value = false
  }
}

const handleRecalculate = async () => {
  isRecalculating.value = true
  try {
    await api.post('/api/performaCustomer/recalculate', null, {
      headers: { 'X-Jenis-User': 'admin' }
    })
    success('Kalkulasi ulang performa berhasil diselesaikan.')
    await fetchPerforma()
  } catch (err) {
    console.error('Gagal melakukan recalculate:', err)
    fail('Gagal menghitung ulang performa customer.')
  } finally {
    isRecalculating.value = false
  }
}

// Map customer ID to Name
const customerMap = computed(() => {
  const map: Record<string, string> = {}
  customers.value.forEach(c => {
    map[c.No_Id] = c.Nama_Display || c.UserName || c.No_Id
  })
  return map
})

// Overall last updated based on most recent item
const lastUpdatedOverall = computed(() => {
  if (performaList.value.length === 0) return '-'
  const dates = performaList.value
    .map(p => p.Last_Updated)
    .filter(Boolean)
    .map(d => new Date(d).getTime())
  if (dates.length === 0) return '-'
  const maxTime = Math.max(...dates)
  const d = new Date(maxTime)
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }) + ' WIB'
})

// Client Side Search, Filter, & Sort
const filteredAndSortedList = computed(() => {
  let list = [...performaList.value]

  // Filter search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    list = list.filter(item => {
      const custName = (customerMap.value[item.Id_Customer] || '').toLowerCase()
      const custId = item.Id_Customer.toLowerCase()
      return custName.includes(query) || custId.includes(query)
    })
  }

  // Sort logic
  list.sort((a, b) => {
    let valA: any = a[sortBy.value as keyof PerformaItem]
    let valB: any = b[sortBy.value as keyof PerformaItem]

    if (sortBy.value === 'customer_name') {
      valA = (customerMap.value[a.Id_Customer] || '').toLowerCase()
      valB = (customerMap.value[b.Id_Customer] || '').toLowerCase()
    }

    if (valA === undefined) return 1
    if (valB === undefined) return -1

    if (typeof valA === 'string') {
      return sortDir.value === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
    } else {
      return sortDir.value === 'asc' ? valA - valB : valB - valA
    }
  })

  return list
})

// Paginated view
const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredAndSortedList.value.slice(start, start + itemsPerPage.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredAndSortedList.value.length / itemsPerPage.value) || 1
})

const toggleSort = (field: string) => {
  if (sortBy.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortDir.value = 'desc'
  }
  currentPage.value = 1
}

// Export options
const showExportDropdown = ref(false)
const exportData = (type: 'csv' | 'txt') => {
  showExportDropdown.value = false
  const headers = ['ID Customer', 'Nama Customer', 'Jumlah Chat', 'Selesai', 'Batal', 'Produk Transaksi', 'Terakhir Diupdate']
  const rows = filteredAndSortedList.value.map(item => [
    item.Id_Customer,
    customerMap.value[item.Id_Customer] || item.Id_Customer,
    item.Jml_Chat,
    item.Jml_Janji_Temu_Selesai,
    item.Jml_Janji_Temu_Batal,
    item.Jml_Produk_Transaksi,
    item.Last_Updated
  ])

  let content = ''
  if (type === 'csv') {
    content = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n')
  } else {
    content = `LAPORAN PERFORMA CUSTOMER\nExported: ${new Date().toLocaleString()}\n\n` + 
      rows.map(r => `Customer: ${r[1]} (${r[0]})\n - Chat: ${r[2]}\n - Janji Selesai: ${r[3]}\n - Janji Batal: ${r[4]}\n - Transaksi: ${r[5]}\n - Update: ${r[6]}\n`).join('\n')
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `performa_customer_${new Date().toISOString().split('T')[0]}.${type}`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(async () => {
  await Promise.all([fetchCustomers(), fetchPerforma()])
})
</script>

<template>
  <Vertical>
    <div class="p-4 md:p-3 md:pt-1 pb-24 space-y-4">
      
      <!-- Action Panel & Filters -->
      <div class="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <!-- Search Bar -->
          <div class="relative w-full lg:max-w-xs shrink-0">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Icon icon="lucide:search" class="size-4" />
            </span>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari Customer..."
              class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 placeholder:text-slate-450 outline-none focus:border-bejo-400 focus:ring-1 focus:ring-bejo-400 transition-all"
            />
          </div>

          <!-- Dynamic Row Wrapper: Row 2 at 900px, splits into Row 2 & 3 under 625px -->
          <div class="flex flex-col min-[625px]:flex-row min-[625px]:items-center lg:justify-end gap-4 w-full flex-1">
            <!-- Last Updated Stamp -->
            <div class="bg-slate-50/60 border border-slate-100 rounded-xl px-3 py-2 flex flex-wrap items-center gap-2 self-start min-[625px]:self-auto max-w-full">
              <Icon icon="lucide:clock" class="size-4 text-bejo-600 shrink-0" />
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Terakhir Diupdate:</span>
              <span class="text-xs font-bold text-slate-700 break-all">{{ lastUpdatedOverall }}</span>
            </div>

            <!-- Buttons Panel -->
            <div class="flex flex-wrap items-center gap-3 self-start min-[625px]:self-auto w-full min-[625px]:w-auto">
              <!-- Recalculate Button -->
              <button 
                @click="handleRecalculate" 
                :disabled="isRecalculating"
                class="px-5 py-2.5 bg-bejo-500 hover:bg-bejo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-bejo-500/10 shrink-0 min-[380px]:whitespace-nowrap whitespace-normal text-left min-[380px]:text-center max-w-full"
              >
                <Icon v-if="isRecalculating" icon="lucide:loader-2" class="size-4 animate-spin" />
                <Icon v-else icon="lucide:calculator" class="size-4" />
                Hitung Ulang Performa
              </button>

              <!-- Export Button Dropdown -->
              <div class="relative">
                <button 
                  @click="showExportDropdown = !showExportDropdown"
                  class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 min-[380px]:whitespace-nowrap whitespace-normal text-left"
                >
                  <Icon icon="lucide:share" class="size-4" />
                  Ekspor
                  <Icon icon="lucide:chevron-down" class="size-3" />
                </button>
                <div 
                  v-if="showExportDropdown"
                  class="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 z-[90] animate-in fade-in zoom-in-95 duration-150"
                >
                  <button @click="exportData('csv')" class="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-bejo-600 rounded-xl transition-all flex items-center gap-2">
                    <Icon icon="lucide:file-spreadsheet" class="size-4" />
                    Format CSV
                  </button>
                  <button @click="exportData('txt')" class="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-bejo-600 rounded-xl transition-all flex items-center gap-2">
                    <Icon icon="lucide:file-text" class="size-4" />
                    Format TXT Laporan
                  </button>
                </div>
                <div v-if="showExportDropdown" @click="showExportDropdown = false" class="fixed inset-0 z-40"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Table View -->
        <div class="overflow-x-auto border border-slate-100 rounded-3xl">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] select-none">
                <th @click="toggleSort('Id_Customer')" class="px-6 py-4.5 text-left cursor-pointer hover:bg-slate-50/80 transition-colors">
                  <div class="flex items-center gap-1">
                    ID Customer
                    <Icon v-if="sortBy === 'Id_Customer'" :icon="sortDir === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="size-3" />
                  </div>
                </th>
                <th @click="toggleSort('customer_name')" class="px-6 py-4.5 text-left cursor-pointer hover:bg-slate-50/80 transition-colors">
                  <div class="flex items-center gap-1">
                    Nama Customer
                    <Icon v-if="sortBy === 'customer_name'" :icon="sortDir === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="size-3" />
                  </div>
                </th>
                <th @click="toggleSort('Jml_Chat')" class="px-6 py-4.5 text-center cursor-pointer hover:bg-slate-50/80 transition-colors">
                  <div class="flex items-center gap-1 justify-center">
                    Jumlah Chat
                    <Icon v-if="sortBy === 'Jml_Chat'" :icon="sortDir === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="size-3" />
                  </div>
                </th>
                <th @click="toggleSort('Jml_Janji_Temu_Selesai')" class="px-6 py-4.5 text-center cursor-pointer hover:bg-slate-50/80 transition-colors">
                  <div class="flex items-center gap-1 justify-center">
                    Pertemuan Selesai
                    <Icon v-if="sortBy === 'Jml_Janji_Temu_Selesai'" :icon="sortDir === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="size-3" />
                  </div>
                </th>
                <th @click="toggleSort('Jml_Janji_Temu_Batal')" class="px-6 py-4.5 text-center cursor-pointer hover:bg-slate-50/80 transition-colors">
                  <div class="flex items-center gap-1 justify-center">
                    Janji Batal
                    <Icon v-if="sortBy === 'Jml_Janji_Temu_Batal'" :icon="sortDir === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="size-3" />
                  </div>
                </th>
                <th @click="toggleSort('Jml_Produk_Transaksi')" class="px-6 py-4.5 text-center cursor-pointer hover:bg-slate-50/80 transition-colors">
                  <div class="flex items-center gap-1 justify-center">
                    Transaksi Unit
                    <Icon v-if="sortBy === 'Jml_Produk_Transaksi'" :icon="sortDir === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="size-3" />
                  </div>
                </th>
                <th @click="toggleSort('Last_Updated')" class="px-6 py-4.5 text-right cursor-pointer hover:bg-slate-50/80 transition-colors">
                  <div class="flex items-center gap-1 justify-end">
                    Diupdate Pada
                    <Icon v-if="sortBy === 'Last_Updated'" :icon="sortDir === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="size-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody v-if="isLoading">
              <tr v-for="i in 5" :key="i" class="animate-pulse">
                <td v-for="j in 7" :key="j" class="px-6 py-5">
                  <div class="h-3 bg-slate-100 rounded w-20 mx-auto" :class="{'ml-0': j <= 2, 'mr-0': j === 7}"></div>
                </td>
              </tr>
            </tbody>
            <tbody v-else class="divide-y divide-slate-50">
              <tr 
                v-for="item in paginatedList" 
                :key="item.No_Id"
                class="hover:bg-slate-50/30 transition-colors"
              >
                <td class="px-6 py-4.5 text-xs font-mono font-black text-slate-400">
                  {{ item.Id_Customer }}
                </td>
                <td class="px-6 py-4.5 text-sm font-black text-slate-800">
                  {{ customerMap[item.Id_Customer] || item.Id_Customer }}
                </td>
                <td class="px-6 py-4.5 text-center text-xs font-bold text-slate-600">
                  <div class="flex items-center justify-center gap-1.5">
                    <Icon icon="lucide:messages-square" class="size-3.5 text-bejo-400" />
                    <span>{{ item.Jml_Chat }}</span>
                  </div>
                </td>
                <td class="px-6 py-4.5 text-center">
                  <span class="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-50 text-emerald-600 border border-emerald-100 inline-flex items-center gap-1">
                    <Icon icon="lucide:check-circle" class="size-3" />
                    {{ item.Jml_Janji_Temu_Selesai }}
                  </span>
                </td>
                <td class="px-6 py-4.5 text-center">
                  <span class="px-2.5 py-1 rounded-lg text-xs font-black bg-red-50 text-red-600 border border-red-100 inline-flex items-center gap-1">
                    <Icon icon="lucide:ban" class="size-3" />
                    {{ item.Jml_Janji_Temu_Batal }}
                  </span>
                </td>
                <td class="px-6 py-4.5 text-center">
                  <span class="px-2.5 py-1 rounded-lg text-xs font-black bg-violet-50 text-violet-600 border border-violet-100 inline-flex items-center gap-1">
                    <Icon icon="lucide:award" class="size-3" />
                    {{ item.Jml_Produk_Transaksi }}
                  </span>
                </td>
                <td class="px-6 py-4.5 text-right text-xs font-bold text-slate-500">
                  {{ new Date(item.Last_Updated).toTimeString().split(' ')[0] }}
                  <span class="block text-[9px] text-slate-400 mt-0.5">{{ new Date(item.Last_Updated).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }}</span>
                </td>
              </tr>
              <tr v-if="filteredAndSortedList.length === 0">
                <td colspan="7" class="py-16 text-center">
                  <div class="size-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <Icon icon="lucide:user-x" class="size-8 text-slate-200" />
                  </div>
                  <p class="text-xs font-black text-slate-450 uppercase tracking-widest">Customer tidak ditemukan</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div v-if="filteredAndSortedList.length > 0" class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-50">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-500">Tampilkan</span>
            <select 
              v-model="itemsPerPage" 
              @change="currentPage = 1"
              class="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 outline-none cursor-pointer focus:border-bejo-400"
            >
              <option :value="5">5 baris</option>
              <option :value="10">10 baris</option>
              <option :value="25">25 baris</option>
              <option :value="50">50 baris</option>
            </select>
            <span class="text-xs font-bold text-slate-500">dari {{ filteredAndSortedList.length }} data</span>
          </div>

          <div class="flex items-center gap-1.5">
            <button 
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-xl text-slate-600 disabled:opacity-50 disabled:hover:bg-slate-50 transition-colors"
            >
              <Icon icon="lucide:chevron-left" class="size-4" />
            </button>
            
            <button 
              v-for="p in totalPages" 
              :key="p"
              @click="currentPage = p"
              class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all"
              :class="currentPage === p ? 'bg-bejo-500 text-white shadow-md shadow-bejo-500/10' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/50'"
            >
              {{ p }}
            </button>

            <button 
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-xl text-slate-600 disabled:opacity-50 disabled:hover:bg-slate-50 transition-colors"
            >
              <Icon icon="lucide:chevron-right" class="size-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  </Vertical>
</template>
