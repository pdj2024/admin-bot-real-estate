import type { ApexOptions } from 'apexcharts'

// Chart: Tren Prospek vs Kunjungan (ProspectAnalytics.vue)
export const prospectSeries = [
  {
    name: 'Prospek Baru',
    data: [45, 52, 38, 65, 48, 72, 55, 61, 49, 70, 85, 92]
  },
  {
    name: 'Kunjungan Lokasi',
    data: [12, 18, 15, 25, 20, 32, 28, 30, 22, 35, 42, 48]
  }
]

export const prospectOptions: ApexOptions = {
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
  colors: ['var(--color-bejo-500)', 'var(--color-bejo-700)'],
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
  colors: ['var(--color-bejo-500)', 'var(--color-bejo-700)', 'var(--color-bejo-300)'],
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
    color: 'bejo-dark',
    trend: '3 dikonfirmasi'
  },
  { 
    label: 'Total Prospek (Bulan Ini)', 
    value: '142', 
    icon: 'lucide:user-plus', 
    color: 'bejo-soft',
    trend: '+24 prospek baru'
  },
  {
    label: 'Rasio Closing (Bulan Ini)',
    value: '12%',
    icon: 'lucide:target',
    color: 'bejo',
    trend: 'Peringkat Stabil'
  }
]

// Data: Inventory (InventoryStatus.vue)
export const inventoryStats = [
  { label: 'Tersedia', value: '24', icon: 'lucide:home', color: 'bejo-soft' },
  { label: 'Terjual', value: '150', icon: 'lucide:award', color: 'bejo' },
  { label: 'Tersewa', value: '89', icon: 'lucide:key', color: 'bejo-dark' },
  { label: 'Total Unit', value: '263', icon: 'lucide:layers', color: 'slate' },
]

// Data: Management Insights (index.vue)
export const managementInsights = [
  'Efisiensi manajemen adalah kunci pertumbuhan. Pastikan setiap prospek terlayani tepat waktu dan inventori selalu ter-update.',
  'Kepercayaan klien dibangun di atas akurasi data. Selalu perbarui status inventori Anda sesegera mungkin.',
  'Follow-up yang cepat meningkatkan peluang closing hingga 70%. Jangan biarkan prospek menunggu terlalu lama.',
  'Tampilan katalog menentukan ketertarikan pertama. Pastikan deskripsi dan foto unit dalam kondisi terbaik.',
  'Kolaborasi tim yang solid adalah aset terbesar. Bagikan insight antar agen untuk mencapai sukses bersama.',
  'Analisis data hari ini adalah strategi kemenangan hari esok. Gunakan dashboard untuk pengambilan keputusan.',
  'Pelayanan yang personal menciptakan loyalitas. Kenali kebutuhan detail dan spesifik dari setiap calon pembeli.',
  'Kecepatan merespon menentukan pemenang. Jadilah yang pertama memberikan solusi untuk calon klien Anda.',
  'Sistem yang rapi menghemat waktu berharga Anda. Rapikan database prospek untuk follow-up yang lebih terarah.',
  'Inventori yang tak terurus adalah peluang yang hilang. Audit listing Anda secara berkala agar selalu relevan dengan pasar.',
  'Klien tidak hanya membeli properti atau layanan, mereka membeli kepercayaan. Bangun kredibilitas melalui transparansi.',
  'Target besar tidak dicapai sendirian. Delegasikan tugas dan bagi peran dengan tepat untuk hasil yang maksimal.',
  'Kesan pertama tidak bisa diulang. Pastikan setiap unit dan presentasi selalu siap ditampilkan kapan saja.',
  'Menjual adalah tentang mendengarkan. Pahami \'kenapa\' di balik kebutuhan klien, bukan sekadar \'apa\' yang mereka cari.',
  'Penolakan hari ini bisa jadi closing di bulan depan. Tetap jaga komunikasi secara profesional tanpa terlihat memaksa.',
  'Pemahaman pasar adalah senjata utama agen yang sukses. Selalu perbarui wawasan Anda dengan tren harga terkini.',
  'Visibilitas online memperluas jangkauan Anda. Optimalkan setiap platform digital untuk memamerkan inventori terbaik.',
  'Waktu adalah aset yang tak bisa diisi ulang. Prioritaskan prospek berpotensi tinggi tanpa mengabaikan database lainnya.',
  'Negosiasi yang sukses menghasilkan win-win solution. Posisikan diri Anda sebagai konsultan tepercaya, bukan sekadar penjual.',
  'Transaksi selesai bukan berarti hubungan berakhir. Layanan purna jual yang istimewa adalah sumber referral terbaik Anda.',
  'Kondisi pasar selalu dinamis. Fleksibilitas dan kemampuan adaptasi dalam strategi pemasaran adalah kunci untuk bertahan.',
  'Detail kecil seringkali menjadi penentu kesepakatan. Perhatikan kelengkapan dokumen untuk menghindari kendala di detik terakhir.',
  'Visi tanpa eksekusi hanyalah ilusi semata. Pecah target bulanan Anda menjadi rencana aksi harian yang terukur.',
  'Setiap pertanyaan atau keluhan klien adalah panggung untuk membuktikan kualitas Anda. Hadapi dengan solusi, bukan alasan.',
  'Konsistensi mengalahkan upaya intens yang hanya sesaat. Jadikan prospecting sebagai rutinitas harian yang tak terlewatkan.',
  'Jangan hanya bersaing pada harga. Tonjolkan nilai tambah, kenyamanan, dan keunikan dari setiap properti yang Anda kelola.',
  'Evaluasi adalah kunci penyempurnaan. Analisis setiap penolakan untuk meracik strategi penawaran yang lebih tajam di esok hari.'
]
