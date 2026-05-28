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
const properties = ref<any[]>([])

const getMonthIndex = (dateStr: string) => {
  if (!dateStr) return -1
  const parts = dateStr.split('T')[0].split('-')
  if (parts.length < 2) return -1
  const month = parseInt(parts[1], 10)
  return month - 1 // 0-11
}

const monthlySoldData = computed(() => {
  const counts = Array(12).fill(0)
  properties.value.forEach(item => {
    if (item.Status_Properti?.toLowerCase() === 'terjual') {
      const idx = getMonthIndex(item.Tanggal_Transaksi)
      if (idx >= 0 && idx < 12) {
        counts[idx]++
      }
    }
  })
  return counts
})

const monthlyRentedData = computed(() => {
  const counts = Array(12).fill(0)
  properties.value.forEach(item => {
    if (item.Status_Properti?.toLowerCase() === 'tersewa') {
      const idx = getMonthIndex(item.Tanggal_Transaksi)
      if (idx >= 0 && idx < 12) {
        counts[idx]++
      }
    }
  })
  return counts
})

const totalSold = computed(() => monthlySoldData.value.reduce((a, b) => a + b, 0))
const totalRented = computed(() => monthlyRentedData.value.reduce((a, b) => a + b, 0))

const fetchTransactionData = async () => {
  isLoading.value = true
  try {
    const { data } = await api.get(`/api/realEstate/getAll?tanggal_transaksi_min=${props.startDate}&tanggal_transaksi_max=${props.endDate}&orderby=no_id&orderdir=asc`, {
      headers: { 'X-Jenis-User': 'admin' }
    })
    properties.value = data.Data || []
  } catch (error) {
    console.error('Gagal mengambil data analitik transaksi:', error)
  } finally {
    isLoading.value = false
  }
}

watch(() => [props.startDate, props.endDate], fetchTransactionData)

const series = computed(() => [
  {
    name: 'Terjual',
    data: monthlySoldData.value
  },
  {
    name: 'Tersewa',
    data: monthlyRentedData.value
  }
])

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    height: 280,
    toolbar: { show: false },
    fontFamily: 'inherit'
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 6,
      borderRadiusApplication: 'end'
    }
  },
  stroke: { show: true, width: 2, colors: ['transparent'] },
  colors: ['#ef8c4c', '#3b82f6'], // Bejo Orange (Terjual) & Premium Blue (Tersewa)
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
  },
  tooltip: {
    y: {
      formatter: (val) => `${val} Unit`
    }
  }
}))

onMounted(fetchTransactionData)
</script>

<template>
  <div class="card bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 h-full">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h4 class="text-lg font-black text-slate-900 leading-tight">Analisis Transaksi Properti</h4>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Grafik Properti Terjual dan Tersewa (2026)</p>
      </div>
    </div>

    <!-- Skeleton Loader -->
    <div v-if="isLoading" class="animate-pulse">
      <div class="h-[264px] bg-slate-50/50 rounded-3xl flex items-end gap-2 px-4 pb-4">
         <div v-for="i in 12" :key="i" class="flex-1 bg-slate-100 rounded-t-lg" :style="{ height: Math.floor(Math.random() * 60) + 40 + '%' }"></div>
      </div>
      <div class="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
        <div class="h-4 w-32 bg-slate-50 rounded"></div>
        <div class="h-4 w-32 bg-slate-50 rounded ml-auto"></div>
      </div>
    </div>

    <template v-else>
      <div class="-mx-4">
        <VueApexCharts type="bar" height="264" :options="chartOptions" :series="series" />
      </div>

      <div class="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
        <div class="flex items-center gap-3">
          <div class="size-2.5 rounded-full bg-[#ef8c4c]"></div>
          <span class="text-xs font-black text-slate-500 uppercase tracking-wide">Total Terjual: <span class="text-slate-900 font-bold ml-1">{{ totalSold }}</span></span>
        </div>
        <div class="flex items-center gap-3 justify-end">
          <div class="size-2.5 rounded-full bg-[#3b82f6]"></div>
          <span class="text-xs font-black text-slate-500 uppercase tracking-wide">Total Tersewa: <span class="text-slate-900 font-bold ml-1">{{ totalRented }}</span></span>
        </div>
      </div>
    </template>
  </div>
</template>
