<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'
import VueApexCharts from 'vue3-apexcharts'
import { distributionOptions as baseOptions } from './data'

const typeColorMap: Record<string, string> = {
  'Rumah': '#df7a24',      // bejo-500
  'Tanah': '#a75526',      // bejo-700
  'Ruko': '#6b371f',       // bejo-900
  'Apartemen': '#f2b26e',  // bejo-300
  'Gudang': '#f8d0a5',     // bejo-200
  'Villa': '#fce8d4',      // bejo-100
  'SOHO': '#fef5ed',       // bejo-50
  'Pabrik': '#4a2414',     // bejo-950
  'Perkantoran': '#3b1d0e',// bejo-1000
  'Hotel': '#ea8e3e',      // bejo-400
  'Rumah Kos': '#fbe0c3',  // bejo-150 (approx)
  'Stand': '#fdf2e9',      // bejo-25 (approx)
  'Toko': '#ffffff',       
  'Gedung': '#30180b',     
  'Condotel': '#854323',   // bejo-800
  'Lain-lain': '#ca6d2c'   // bejo-600
}

const propertyTypes = Object.keys(typeColorMap)

const series = ref<number[]>([])
const labels = ref<string[]>([])
const chartColors = ref<string[]>([])
const totalUnit = ref(0)

const chartOptions = computed(() => ({
  ...baseOptions,
  labels: labels.value,
  colors: chartColors.value,
  plotOptions: {
    ...baseOptions.plotOptions,
    pie: {
      ...baseOptions.plotOptions?.pie,
      donut: {
        ...baseOptions.plotOptions?.pie?.donut,
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '14px',
            fontWeight: '900',
            color: '#64748b',
            offsetY: -10
          },
          value: {
            show: true,
            fontSize: '28px',
            fontWeight: '900',
            color: '#0f172a',
            offsetY: 10,
            formatter: (val: string) => val
          },
          total: {
            show: true,
            label: 'Total Unit',
            fontSize: '12px',
            fontWeight: '900',
            color: '#64748b',
            formatter: () => String(totalUnit.value)
          }
        }
      }
    }
  },
  legend: {
    ...baseOptions.legend,
    show: true,
    position: 'bottom',
    horizontalAlign: 'center',
    markers: {
      radius: 12
    },
    itemMargin: {
      horizontal: 10,
      vertical: 5
    }
  }
}))

const isLoading = ref(true)

const fetchData = async () => {
  try {
    isLoading.value = true
    const { data } = await api.get('/api/realEstate/getAll', { 
      headers: { 
        'X-Jenis-User': 'Admin',
        'Api-Key': 'realestate_key_2024'
      } 
    })
    const products = data.Data || []
    totalUnit.value = products.length

    const counts: Record<string, number> = {}
    propertyTypes.forEach(type => counts[type] = 0)

    products.forEach((p: any) => {
      const tipe = p.Tipe
      if (counts[tipe] !== undefined) {
        counts[tipe]++
      } else {
        counts['Lain-lain']++
      }
    })

    // Filter only types that have at least 1 unit
    const activeTypes = propertyTypes.filter(type => counts[type] > 0)
    
    labels.value = activeTypes
    series.value = activeTypes.map(type => counts[type])
    chartColors.value = activeTypes.map(type => typeColorMap[type])
  } catch (err) {
    console.error('Fetch distribution data error:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="card bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 min-h-[460px]">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h4 class="text-lg font-black text-slate-900 leading-tight">Portofolio Unit</h4>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Sebaran Berdasarkan Tipe</p>
      </div>
      <button class="size-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
         <Icon icon="lucide:pie-chart" class="size-5" />
      </button>
    </div>

    <!-- Skeleton Loader -->
    <div v-if="isLoading" class="flex flex-col items-center animate-pulse">
      <div class="relative size-[240px] rounded-full border-[30px] border-slate-50 flex items-center justify-center">
         <div class="space-y-2 text-center">
            <div class="h-4 w-16 bg-slate-50 rounded mx-auto"></div>
            <div class="h-8 w-12 bg-slate-100 rounded mx-auto"></div>
         </div>
      </div>
      <div class="mt-12 grid grid-cols-2 gap-x-8 gap-y-4 w-full px-4">
        <div v-for="i in 6" :key="i" class="flex items-center gap-3">
          <div class="size-3 rounded-full bg-slate-100"></div>
          <div class="h-3 w-20 bg-slate-50 rounded"></div>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center">
      <div class="flex items-center justify-center -mx-4">
        <VueApexCharts type="donut" height="240" :options="chartOptions" :series="series" />
      </div>
    </div>
  </div>
</template>
