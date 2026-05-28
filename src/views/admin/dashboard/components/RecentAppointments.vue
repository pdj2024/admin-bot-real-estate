<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import api from '@/services/axios'

const router = useRouter()
const isLoading = ref(true)
const appointments = ref<any[]>([])
const expandedRowId = ref<string | null>(null)

// Pagination states
const currentPage = ref(1)
const itemsPerPage = ref(5)

const fetchAppointments = async () => {
  isLoading.value = true
  try {
    const { data } = await api.get('/api/janjiTemu/getAll?tanggal_mulai=2026-01-01&tanggal_selesai=2026-12-31&orderby=no_id&orderdir=desc', {
      headers: { 'X-Jenis-User': 'admin' }
    })
    appointments.value = data.Data || []
  } catch (error) {
    console.error('Gagal mengambil jadwal kunjungan:', error)
  } finally {
    isLoading.value = false
  }
}

const getTimelineChain = (current: any) => {
  if (!current || !appointments.value.length) return []
  const chain: any[] = []
  let item = current
  const visited = new Set()
  while (item) {
    if (visited.has(item.No_Id)) break
    visited.add(item.No_Id)
    chain.unshift(item)
    if (!item.Id_Janji_Lama) break
    const parent = appointments.value.find((a) => a.No_Id === item.Id_Janji_Lama)
    if (!parent) break
    item = parent
  }
  return chain
}

const getStatusConfig = (status: string) => {
  if (status === 'selesai') return { label: 'selesai', css: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
  if (status === 'batal') return { label: 'batal', css: 'bg-red-50 text-red-600 border-red-200' }
  if (status === 'proses') return { label: 'proses', css: 'bg-amber-100 text-amber-900 border-amber-200' }
  if (status === 'dikonfirmasi') return { label: 'dikonfirmasi', css: 'bg-bejo-50 text-bejo-600 border-bejo-200' }
  return { label: 'pengajuan', css: 'bg-blue-50 text-blue-600 border-blue-200' } // 'baru'
}

const getStatusBadgeClass = (status: string) => {
  if (status === 'baru') return 'bg-blue-50 text-blue-700'
  if (status === 'dikonfirmasi') return 'bg-bejo-50 text-bejo-700'
  if (status === 'proses') return 'bg-amber-100 text-amber-900'
  if (status === 'selesai') return 'bg-emerald-50 text-emerald-800'
  return 'bg-red-50 text-red-700' // batal
}

const triggerRect = ref<{ bottom: number, right: number } | null>(null)
const toggleTimeline = (noId: string, event?: MouseEvent) => {
  if (expandedRowId.value === noId) {
    expandedRowId.value = null
    triggerRect.value = null
  } else {
    expandedRowId.value = noId
    if (event && event.currentTarget) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
      triggerRect.value = {
        bottom: rect.bottom + window.scrollY,
        right: rect.right + window.scrollX
      }
    }
  }
}

const navigateToDetail = () => {
  router.push(`/janji-temu`)
}

// Filtering reschedules: if an appointment's No_Id is referenced in any other appointment's Id_Janji_Lama, it's a parent reschedule item and should be hidden.
const filteredAppointments = computed(() => {
  const childIds = appointments.value.map(a => a.Id_Janji_Lama).filter(Boolean)
  return appointments.value.filter(a => !childIds.includes(a.No_Id))
})

const selectedAppointment = computed(() => {
  return appointments.value.find(a => a.No_Id === expandedRowId.value) || null
})

// Pagination computations
const paginatedAppointments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredAppointments.value.slice(start, start + itemsPerPage.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredAppointments.value.length / itemsPerPage.value) || 1
})

const changePage = (page: number) => {
  currentPage.value = page
  expandedRowId.value = null
}

const dropdownRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  if (expandedRowId.value && dropdownRef.value) {
    const target = event.target as HTMLElement
    const clickedButton = target.closest('[title="Riwayat Jadwal"]')
    if (!dropdownRef.value.contains(target) && !clickedButton) {
      expandedRowId.value = null
      triggerRect.value = null
    }
  }
}

const handleScroll = () => {
  if (expandedRowId.value) {
    expandedRowId.value = null
    triggerRect.value = null
  }
}

onMounted(() => {
  fetchAppointments()
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="card bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
    <div class="p-8 border-b border-slate-50 flex justify-between items-center">
      <div>
        <h4 class="text-lg font-black text-slate-900 leading-tight">Jadwal Kunjungan Lokasi</h4>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Agenda survei properti</p>
      </div>
      <RouterLink 
        to="/janji-temu"
        class="px-5 py-2.5 bg-slate-55 hover:bg-bejo-50 text-slate-600 hover:text-bejo-600 text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-slate-100 hover:border-bejo-200"
      >
        Lihat Semua
      </RouterLink>
    </div>
    
    <div class="overflow-x-auto">
      <table class="min-w-full border-collapse">
        <thead>
          <tr class="bg-slate-50/50 border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <th class="px-8 py-5 text-left">Customer / Pemohon</th>
            <th class="px-8 py-5 text-left">Unit Properti</th>
            <th class="px-8 py-5 text-left">Admin Penanggungjawab</th>
            <th class="px-8 py-5 text-left">Waktu Kunjungan</th>
            <th class="px-8 py-5 text-center">Status</th>
            <th class="px-8 py-5 text-right font-black">Aksi</th>
          </tr>
        </thead>
        <tbody v-if="isLoading">
          <tr v-for="i in 4" :key="i" class="animate-pulse">
            <td class="px-8 py-6">
              <div class="flex items-center gap-4">
                <div class="size-10 rounded-2xl bg-slate-100"></div>
                <div class="space-y-2">
                  <div class="h-3 w-28 bg-slate-100 rounded"></div>
                  <div class="h-2 w-20 bg-slate-50 rounded"></div>
                </div>
              </div>
            </td>
            <td class="px-8 py-6">
              <div class="space-y-2">
                <div class="h-3 w-32 bg-slate-100 rounded"></div>
                <div class="h-2 w-16 bg-slate-50 rounded"></div>
              </div>
            </td>
            <td class="px-8 py-6">
              <div class="h-3 w-24 bg-slate-50 rounded"></div>
            </td>
            <td class="px-8 py-6">
              <div class="h-3 w-24 bg-slate-50 rounded"></div>
            </td>
            <td class="px-8 py-6 flex justify-center">
              <div class="h-6 w-20 bg-slate-50 rounded-xl"></div>
            </td>
            <td class="px-8 py-6 text-right">
              <div class="size-10 bg-slate-50 rounded-xl ml-auto"></div>
            </td>
          </tr>
        </tbody>
        <tbody v-else class="divide-y divide-slate-50">
          <template v-for="visit in paginatedAppointments" :key="visit.No_Id">
            <tr 
              @click="toggleTimeline(visit.No_Id)"
              class="group hover:bg-slate-50/40 transition-all cursor-pointer"
              :class="{'bg-slate-50/20': expandedRowId === visit.No_Id}"
            >
              <!-- Customer Column -->
              <td class="px-8 py-6">
                <div class="flex items-center gap-4">
                  <!-- Bejo Colored Logo Container -->
                  <div class="size-10 rounded-2xl bg-bejo-500 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-bejo-500/20 transition-all duration-300 group-hover:scale-105">
                    {{ (visit.Nama_Customer || visit.Id_Customer || 'C').substring(0, 2).toUpperCase() }}
                  </div>
                  <div class="flex flex-col min-w-0">
                    <span class="text-sm font-black text-slate-900 truncate">{{ visit.Nama_Customer || visit.Id_Customer }}</span>
                    <span class="text-[10px] font-bold text-slate-400 truncate">{{ visit.Telepon_Customer }}</span>
                  </div>
                </div>
              </td>
              <!-- Property Column -->
              <td class="px-8 py-6">
                <div class="flex flex-col">
                  <span class="text-sm font-black text-slate-700">{{ visit.Nama_Produk }}</span>
                  <span class="text-[10px] font-mono text-slate-450 bg-slate-100 px-2 py-0.5 rounded font-bold w-fit mt-1">#{{ visit.No_Tracking }}</span>
                </div>
              </td>
              <!-- Admin Column -->
              <td class="px-8 py-6">
                <div class="flex items-center gap-3">
                  <div class="size-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase border border-slate-200">
                    {{ (visit.Nama_Admin || 'B').substring(0, 1).toUpperCase() }}
                  </div>
                  <span class="text-xs font-bold text-slate-600">{{ visit.Nama_Admin || 'Menunggu Konfirmasi' }}</span>
                </div>
              </td>
              <!-- Schedule Column -->
              <td class="px-8 py-6">
                <div class="flex items-center gap-2 text-slate-600">
                  <Icon icon="lucide:calendar" class="size-4 text-slate-350" />
                  <span class="text-xs font-bold">{{ visit.Tanggal_Janji.split('T')[0] }} • {{ visit.Waktu_Janji }} WIB</span>
                </div>
              </td>
              <!-- Status Column -->
              <td class="px-8 py-6 text-center">
                <span :class="`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusConfig(visit.Status_Progress).css}`">
                  {{ getStatusConfig(visit.Status_Progress).label }}
                </span>
              </td>
              <!-- Actions -->
              <td class="px-8 py-6 text-right relative" @click.stop>
                <div class="flex items-center gap-2 justify-end">
                  <button 
                    @click="toggleTimeline(visit.No_Id, $event)"
                    class="p-2.5 bg-slate-50 text-slate-400 hover:text-bejo-600 hover:bg-bejo-50 border border-slate-200 shadow-sm rounded-xl transition-all relative z-[10]"
                    :class="{'text-bejo-600 bg-bejo-50 border-bejo-200': expandedRowId === visit.No_Id}"
                    title="Riwayat Jadwal"
                  >
                     <Icon icon="lucide:history" class="size-4" />
                  </button>
                  <button 
                    @click="navigateToDetail()"
                    class="p-2.5 bg-slate-50 text-slate-400 hover:text-bejo-600 hover:bg-bejo-50 border border-slate-200 shadow-sm rounded-xl transition-all"
                    title="Detail Janji Temu"
                  >
                     <Icon icon="lucide:arrow-right" class="size-4" />
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Pagination Controls -->
    <div v-if="filteredAppointments.length > 0" class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-8 py-5 border-t border-slate-50">
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-slate-500">Tampilkan</span>
        <select 
          v-model="itemsPerPage" 
          @change="changePage(1)"
          class="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 outline-none cursor-pointer focus:border-bejo-400"
        >
          <option :value="5">5 baris</option>
          <option :value="10">10 baris</option>
          <option :value="20">20 baris</option>
        </select>
        <span class="text-xs font-bold text-slate-500">dari {{ filteredAppointments.length }} data</span>
      </div>

      <div class="flex items-center gap-1.5">
        <button 
          @click="changePage(Math.max(1, currentPage - 1))"
          :disabled="currentPage === 1"
          class="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-xl text-slate-600 disabled:opacity-50 disabled:hover:bg-slate-50 transition-colors"
        >
          <Icon icon="lucide:chevron-left" class="size-4" />
        </button>
        
        <button 
          v-for="p in totalPages" 
          :key="p"
          @click="changePage(p)"
          class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all"
          :class="currentPage === p ? 'bg-bejo-500 text-white shadow-md shadow-bejo-500/10' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/50'"
        >
          {{ p }}
        </button>

        <button 
          @click="changePage(Math.min(totalPages, currentPage + 1))"
          :disabled="currentPage === totalPages"
          class="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-xl text-slate-600 disabled:opacity-50 disabled:hover:bg-slate-50 transition-colors"
        >
          <Icon icon="lucide:chevron-right" class="size-4" />
        </button>
      </div>
    </div>

    <!-- Modal Teleport for Timeline Dropdown outside the table layout positioned below button -->
    <Teleport to="body">
      <div v-if="expandedRowId && selectedAppointment && triggerRect" 
        ref="dropdownRef"
        class="absolute bg-white rounded-2xl shadow-2xl p-5 z-[1060] border border-slate-100 w-80 text-left animate-in fade-in slide-in-from-top-1 duration-150"
        :style="{
          top: `${triggerRect.bottom + 6}px`,
          left: `${triggerRect.right - 304}px`
        }"
      >
        <span class="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-4 border-b border-slate-150 pb-2">Riwayat Reschedule</span>
        
        <div class="relative pl-4 space-y-4">
          <!-- Vertical Axis Line -->
          <div class="absolute left-[3.5px] top-1.5 bottom-1.5 w-0.5 bg-slate-100"></div>
          
          <div v-for="item in getTimelineChain(selectedAppointment)" :key="item.No_Id" class="relative">
            <!-- Dot Point -->
            <div class="absolute left-[-18.5px] top-4.5 size-2.5 rounded-full bg-white border-2 flex items-center justify-center transition-all duration-300 z-10" :class="item.No_Id === selectedAppointment.No_Id ? 'border-bejo-500 scale-110 shadow shadow-bejo-500/20' : 'border-slate-300'">
              <div class="size-1 rounded-full" :class="item.No_Id === selectedAppointment.No_Id ? 'bg-bejo-500' : 'bg-slate-350'"></div>
            </div>

            <!-- Content Card Details (Similar styling to Event.vue for clean premium look) -->
            <div class="p-3 rounded-xl border text-xs font-bold transition-all" :class="item.No_Id === selectedAppointment.No_Id ? 'bg-bejo-50/20 border-bejo-100' : 'bg-slate-50 border-slate-100 text-slate-650'">
              <div class="flex justify-between items-center gap-1.5 mb-1.5 flex-wrap">
                <span class="text-[10px] font-mono font-black text-slate-400">#{{ item.No_Tracking }}</span>
                <span class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider font-mono shrink-0" :class="getStatusBadgeClass(item.Status_Progress)">
                  {{ getStatusConfig(item.Status_Progress).label }}
                </span>
              </div>
              <p class="text-[12px] font-black text-slate-800 flex items-center gap-1.5">
                <span>🗓️</span> {{ item.Tanggal_Janji.split('T')[0] }}
              </p>
              <p class="text-[11px] font-bold text-slate-500 mt-1 flex items-center gap-1.5">
                <span>⏰</span> {{ item.Waktu_Janji }} WIB
              </p>
              <div v-if="item.Alasan_Batal" class="mt-2 pt-2 border-t border-red-150 text-[10px] font-bold text-red-650 bg-red-50/10 p-1.5 rounded-lg">
                <span class="text-[8px] font-black uppercase tracking-wider block text-red-500 mb-0.5">Alasan:</span>
                <span class="italic">"{{ item.Alasan_Batal }}"</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>
