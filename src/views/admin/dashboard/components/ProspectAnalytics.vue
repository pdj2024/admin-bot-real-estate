<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import api from '@/services/axios'
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'

const props = withDefaults(
  defineProps<{
    startDate?: string
    endDate?: string
  }>(),
  {
    startDate: '2026-01-01',
    endDate: '2026-12-31'
  }
)

const isLoading = ref(true)

const newAppointments = ref<any[]>([])
const finishedAppointments = ref<any[]>([])

const getMonthIndex = (dateStr: string) => {
  if (!dateStr) return -1
  const parts = dateStr.split('T')[0].split('-')
  if (parts.length < 2) return -1
  const month = parseInt(parts[1], 10)
  return month - 1 // 0-11
}

const monthlyNewData = computed(() => {
  const counts = Array(12).fill(0)
  newAppointments.value.forEach(item => {
    const idx = getMonthIndex(item.Tanggal_Janji)
    if (idx >= 0 && idx < 12) {
      counts[idx]++
    }
  })
  return counts
})

const monthlyFinishedData = computed(() => {
  const counts = Array(12).fill(0)
  finishedAppointments.value.forEach(item => {
    const idx = getMonthIndex(item.Tanggal_Janji)
    if (idx >= 0 && idx < 12) {
      counts[idx]++
    }
  })
  return counts
})

const fetchAnalyticsData = async () => {
  isLoading.value = true
  try {
    const [resNew, resFinished] = await Promise.all([
      api.get(`/api/janjiTemu/getAll?tanggal_mulai=${props.startDate}&tanggal_selesai=${props.endDate}&status_progress=baru&orderby=no_id&orderdir=desc`, {
        headers: { 'X-Jenis-User': 'admin' }
      }),
      api.get(`/api/janjiTemu/getAll?tanggal_mulai=${props.startDate}&tanggal_selesai=${props.endDate}&status_progress=selesai&orderby=no_id&orderdir=desc`, {
        headers: { 'X-Jenis-User': 'admin' }
      })
    ])
    newAppointments.value = resNew.data.Data || []
    finishedAppointments.value = resFinished.data.Data || []
  } catch (error) {
    console.error('Gagal mengambil data analitik kunjungan:', error)
  } finally {
    isLoading.value = false
  }
}

watch(() => [props.startDate, props.endDate], fetchAnalyticsData)

const series = computed(() => [
  {
    name: 'Janji Temu Baru',
    data: monthlyNewData.value
  },
  {
    name: 'Kunjungan Selesai',
    data: monthlyFinishedData.value
  }
])

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'area',
    height: 280,
    toolbar: { show: false },
    fontFamily: 'inherit'
  },
  stroke: { curve: 'smooth', width: 3 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.35,
      opacityTo: 0.02,
      stops: [20, 100]
    }
  },
  colors: ['#ef8c4c', '#6366f1'], // Brand Bejo Orange & Premium Indigo
  dataLabels: { enabled: false },
  grid: {
    borderColor: '#f1f5f9',
    strokeDashArray: 4,
    padding: { left: 10, right: 10, bottom: 0 }
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#94a3b8', fontWeight: 600 } }
  },
  yaxis: {
    labels: { style: { colors: '#94a3b8', fontWeight: 600 } }
  },
  legend: {
    position: 'top',
    horizontalAlign: 'right',
    fontWeight: 700,
    markers: { size: 6 }
  }
}))

onMounted(fetchAnalyticsData)
</script>

<template>
  <div class="card bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 h-full">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h4 class="text-lg font-black text-slate-900 leading-tight">Analitik Kunjungan</h4>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Grafik Kunjungan Baru dan Selesai</p>
      </div>
    </div>

    <!-- Skeleton Loader -->
    <div v-if="isLoading" class="animate-pulse">
      <div class="h-[264px] bg-slate-50/50 rounded-3xl flex items-end gap-2 px-4 pb-4">
         <div v-for="i in 12" :key="i" class="flex-1 bg-slate-100 rounded-t-lg" :style="{ height: Math.floor(Math.random() * 60) + 40 + '%' }"></div>
      </div>
      <div class="mt-6 pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
        <div class="h-4 w-32 bg-slate-50 rounded"></div>
        <div class="h-4 w-32 bg-slate-50 rounded ml-auto"></div>
      </div>
    </div>

    <template v-else>
      <div class="-mx-4">
        <VueApexCharts type="area" height="264" :options="chartOptions" :series="series" />
      </div>

      <div class="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
        <div class="flex items-center gap-3">
          <div class="size-2.5 rounded-full bg-[#ef8c4c]"></div>
          <span class="text-xs font-black text-slate-500 uppercase tracking-wide">Total Janji Temu Baru: <span class="text-slate-900 font-bold ml-1">{{ newAppointments.length }}</span></span>
        </div>
        <div class="flex items-center gap-3 justify-end">
          <div class="size-2.5 rounded-full bg-[#6366f1]"></div>
          <span class="text-xs font-black text-slate-500 uppercase tracking-wide">Total Kunjungan Selesai: <span class="text-slate-900 font-bold ml-1">{{ finishedAppointments.length }}</span></span>
        </div>
      </div>
    </template>
  </div>
</template>
