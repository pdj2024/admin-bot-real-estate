import type { ApexOptions } from 'apexcharts'

// Chart: Tren Leads vs Kunjungan (LeadAnalytics.vue)
export const leadSeries = [
  {
    name: 'Leads Baru',
    data: [45, 52, 38, 65, 48, 72, 55, 61, 49, 70, 85, 92]
  },
  {
    name: 'Kunjungan Lokasi',
    data: [12, 18, 15, 25, 20, 32, 28, 30, 22, 35, 42, 48]
  }
]

export const leadOptions: ApexOptions = {
  chart: {
    type: 'area',
    height: 300,
    toolbar: { show: false },
    fontFamily: 'inherit'
  },
  stroke: { curve: 'smooth', width: 3 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [20, 100]
    }
  },
  colors: ['#f75211', '#0ea5e9'], // bejo-500, sky-500
  dataLabels: { enabled: false },
  grid: {
    borderColor: '#f1f5f9',
    strokeDashArray: 4,
    padding: { left: 0, right: 0, bottom: 0 }
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#64748b', fontWeight: 600 } }
  },
  yaxis: {
    labels: { style: { colors: '#64748b', fontWeight: 600 } }
  },
  legend: {
    position: 'top',
    horizontalAlign: 'right',
    fontWeight: 700,
    markers: { size: 6 }
  }
}

// Chart: Sebaran Properti (PropertyDistribution.vue)
export const distributionSeries = [44, 32, 24]

export const distributionOptions: ApexOptions = {
  chart: {
    type: 'donut',
    height: 300,
  },
  labels: ['Rumah', 'Apartemen', 'Ruko/Komersial'],
  colors: ['#f75211', '#0ea5e9', '#6366f1'], // bejo-500, sky-500, indigo-500
  legend: {
    position: 'bottom',
    fontWeight: 700,
  },
  plotOptions: {
    pie: {
      donut: {
        size: '75%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total Unit',
            fontSize: '14px',
            fontWeight: 800,
            color: '#64748b',
            formatter: () => '263'
          }
        }
      }
    }
  },
  dataLabels: { enabled: false }
}

// Data: Operasional (OperationalSummary.vue)
export const operationalStats = [
  { 
    label: 'Chat Aktif Hari Ini', 
    value: '18', 
    icon: 'lucide:message-square-more', 
    color: 'bejo',
    trend: '+12% vs kemarin'
  },
  { 
    label: 'Janji Temu Hari Ini', 
    value: '06', 
    icon: 'lucide:calendar-clock', 
    color: 'sky',
    trend: '3 dikonfirmasi'
  },
  { 
    label: 'Total Leads (Bulan Ini)', 
    value: '142', 
    icon: 'lucide:user-plus', 
    color: 'emerald',
    trend: '+24 leads baru'
  }
]

// Data: Inventory (InventoryStatus.vue)
export const inventoryStats = [
  { label: 'Tersedia', value: '24', icon: 'lucide:home', color: 'emerald' },
  { label: 'Terjual', value: '150', icon: 'lucide:award', color: 'bejo' },
  { label: 'Tersewa', value: '89', icon: 'lucide:key', color: 'amber' },
  { label: 'Total Unit', value: '263', icon: 'lucide:layers', color: 'slate' },
]
