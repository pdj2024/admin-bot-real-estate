<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Vertical from '@/layouts/vertical.vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'
import { useSettings } from '@/stores/settings'
import { confirm, success, fail } from '@/utils/sweet-alert'
import RecipientModal from './components/RecipientModal.vue'
import UnitModal from './components/UnitModal.vue'

const message = ref('')
const isRecipientModalOpen = ref(false)
const isUnitModalOpen = ref(false)
const activeTemplateIndex = ref<number | null>(null)
const selectedUnit = ref<any>(null)
const showImage = ref(true)
const isLoading = ref(false)
const isStopping = ref(false)
const isBroadcasting = ref(false)
let broadcastTimer: any = null
const settingsStore = useSettings()

const recipients = ref<any[]>([])
const loadingRecipients = ref(false)
const waStatus = ref<'online' | 'offline'>('online')
const messageInput = ref<HTMLTextAreaElement | null>(null)

const templates = [
  {
    title: 'Elite Executive',
    content: `*{{NAMA_PRODUK_UPPER}}*
_{{TAGLINE_DINAMIS}}_

{{KETERANGAN}}

*SPESIFIKASI PREMIUM:*
{{SPEC_LOC}}
{{SPEC_AREA}}
{{SPEC_DIM}}
{{SPEC_BUILD}}
{{SPEC_BED}}
{{SPEC_CAR}}
{{SPEC_POWER}}
{{SPEC_LEGAL}}
{{SPEC_ROW}}

*AKSESIBILITAS STRATEGIS:*
{{LIST_AKSES}}

*PENAWARAN TERBATAS:*
{{PRICE_JUAL_SECTION}}
{{PRICE_SEWA_SECTION}}`
  },
  {
    title: 'Sultan Vibes (Recommended)',
    content: `🚨 *{{TAGLINE_DINAMIS_EMOJI}}* 🤩✨
{{HOOK_TEXT}}

*{{NAMA_PRODUK}}* — {{TIPE_STYLE}} dengan posisi paling favorit: *{{POSISI_UNIT}}* 🌳

{{DESC_PROMO_TEXT}}

🏠 *SPESIFIKASI MANTAP:*
{{SPEC_LOC_EMOJI}}
{{SPEC_AREA_DIM_EMOJI}}
{{SPEC_BUILD_EMOJI}}
{{SPEC_BED_EMOJI}}
{{SPEC_BATH_EMOJI}}
{{SPEC_CAR_EMOJI}}
{{SPEC_POWER_EMOJI}}
{{SPEC_ROW_EMOJI}}
{{SPEC_LEGAL_EMOJI}}

🚗 *AKSES LOKASI SUPER STRATEGIS:*
{{LIST_AKSES_EMOJI}}

{{PRICE_JUAL_EMOJI}}
{{PRICE_SEWA_EMOJI}}

{{CTA_TEXT}}`
  },
  {
    title: 'Hot Listing Sultan',
    content: `🔥 *HOT LISTING! SULTAN WAJIB MERAPAT!* 🔥

{{HOOK_TEXT_3}}

✨ *{{NAMA_PRODUK_UPPER}}* ✨

{{DESC_PROMO_TEXT_3}}

📐 *SPESIFIKASI SULTAN:*
{{SPEC_AREA_DIM_3}}
{{SPEC_LB_3}}
{{SPEC_BED_3}}
{{SPEC_BATH_3}}
{{SPEC_CAR_3}}
{{SPEC_POWER_3}}
{{SPEC_LEGAL_3}}

🎁 *BONUS SUPER UNTUNG:*
{{BONUS_LIST_3}}

🚗 *AKSES JUARA (Serba Dekat!):*
{{LIST_AKSES_EMOJI}}

📍 *Alamat:* {{ALAMAT}}

💸 *PENAWARAN SPESIAL:*
{{PRICE_JUAL_NEGO_3}}
{{PRICE_SEWA_3}}

{{CTA_TEXT_3}}`
  }
]

const fetchRecipients = async () => {
  loadingRecipients.value = true
  try {
    const { data } = await api.get('/api/customer/getAll')
    if (data.StatusCode === 200) {
      recipients.value = data.Data.filter((c: any) => c.Status_Broadcast === 'aktif')
    }
  } catch {
    console.error('Gagal mengambil data penerima')
  } finally {
    loadingRecipients.value = false
  }
}

const selectTemplate = (index: number) => {
  activeTemplateIndex.value = index
  isUnitModalOpen.value = true
}

const openUnitModal = () => {
  if (!message.value.trim()) {
    activeTemplateIndex.value = null
  }
  isUnitModalOpen.value = true
}

const handleUnitSelected = (unit: any) => {
  selectedUnit.value = unit
  isUnitModalOpen.value = false

  const isNoTemplate = activeTemplateIndex.value === null
  let templateText = !isNoTemplate ? templates[activeTemplateIndex.value!].content : ''

  // Common Data Resolution
  const viewDiscount = settingsStore.app.viewDiscount
  const formatFullPrice = (p: number) => `Rp ${p.toLocaleString('id-ID')}`
  const formatShortPrice = (p: number) => formatPrice(p)

  // Harga Jual Section
  const hargaJual1 = unit.Harga_Jual1
  const hargaJual2 = unit.Harga_Jual2 || hargaJual1
  const isJualDiskon = viewDiscount && unit.Harga_Jual2 > 0 && unit.Harga_Jual1 !== unit.Harga_Jual2
  const priceJualSection = hargaJual1 > 0 
    ? `💰 *Harga Jual:* *${formatFullPrice(hargaJual2)}*${isJualDiskon ? ` ~* (Harga Normal: Rp ${formatShortPrice(hargaJual1)})*~` : ''}` 
    : ''

  // Harga Sewa Section
  const hargaSewa1 = unit.Harga_Sewa1
  const hargaSewa2 = unit.Harga_Sewa2 || hargaSewa1
  const isSewaDiskon = viewDiscount && unit.Harga_Sewa2 > 0 && unit.Harga_Sewa1 !== unit.Harga_Sewa2
  const unitSewa = unit.Satuan_Minimal_Sewa ? ` / ${unit.Satuan_Minimal_Sewa}` : ""
  const minSewa = unit.Minimal_Sewa ? ` *(Min. Sewa ${unit.Minimal_Sewa} ${unit.Satuan_Minimal_Sewa || 'Tahun'})*` : ""
  const priceSewaSection = hargaSewa1 > 0 
    ? `🏷 *Harga Sewa:* *${formatFullPrice(hargaSewa2)}${unitSewa}*${isSewaDiskon ? ` ~* (Harga Normal: Rp ${formatShortPrice(hargaSewa1)})*~` : ''}${minSewa}` 
    : ''

  const alamat = [unit.Alamat, unit.Nama_Kota].filter(x => x && x !== '-').join(', ') || '-'
  const aksesArray = Array.isArray(unit.Akses_Jalan) ? unit.Akses_Jalan : (unit.Akses_Jalan && unit.Akses_Jalan !== '-' ? [unit.Akses_Jalan] : [])
  const listAkses = aksesArray.map((a: string) => `• ${a}`).join('\n') || '• Lokasi Strategis & Akses Mudah'

  const size = (unit.Tipe_Ukuran || '').split('x')
  const hasDimensi = size.length === 2 && size[0].trim() !== '0' && size[1].trim() !== '0'
  
  const cert = unit.Jenis_Sertifikat || 'SHM'
  const certDetail = cert + (cert.toLowerCase().includes('shm') ? ' & IMB (Lengkap & Valid, Mendukung KPR)' : '')

  const replacers: Record<string, string> = {
    '{{NAMA_PRODUK}}': unit.Nama_Produk || '-',
    '{{NAMA_PRODUK_UPPER}}': (unit.Nama_Produk || '-').toUpperCase(),
    '{{TAGLINE_DINAMIS}}': `Hunian Eksklusif Modern Kontemporer dengan Sentuhan Kemewahan`,
    '{{TAGLINE_DINAMIS_EMOJI}}': isJualDiskon ? 'TURUN HARGA GILA-GILAAN!!!' : 'PENAWARAN UNIT TERBAIK!!!',
    '{{HOOK_TEXT}}': 'Mimpimu punya hunian impian kini bisa jadi nyata! 🏰',
    '{{TIPE_STYLE}}': `${unit.Tipe || 'Properti'} ${unit.Jumlah_Lantai > 0 ? unit.Jumlah_Lantai + ' Lantai' : ''} Modern Kontemporer`,
    '{{POSISI_UNIT}}': 'Lokasi Strategis & Lingkungan Nyaman',
    '{{DESC_PROMO_TEXT}}': `Bayangin pulang beraktivitas langsung disambut kenyamanan hunian premium 💎 dengan desain yang mengutamakan privasi dan gaya hidup modern. ${hasDimensi ? 'Dimensinya super lebar, bener-bener definisi hunian idaman! 👑' : ''}`,
    '{{KETERANGAN}}': unit.Keterangan || '-',
    '{{AKSES_UTAMA}}': aksesArray[0] || 'Lokasi Strategis',
    '{{CTA_TEXT}}': 'Unit langka dengan posisi emas seperti ini jarang banget lewat lho! Siapa cepat dia dapat. Yuk, jadwalkan *private viewing* kamu sekarang juga sebelum keduluan yang lain! 👇📲',
    
    // SPEC LINE WRAPPERS (Empty data = Empty line)
    '{{SPEC_LOC}}': unit.Alamat ? `• Lokasi: ${alamat}` : '',
    '{{SPEC_LOC_EMOJI}}': unit.Alamat ? `📍 *Lokasi:* ${alamat}` : '',
    '{{SPEC_AREA}}': (unit.Luas_Tanah > 0 || unit.Luas_Bangunan > 0) ? `• Luas Tanah: ${unit.Luas_Tanah} m² | Luas Bangunan: ± ${unit.Luas_Bangunan} m²` : '',
    '{{SPEC_AREA_SIMPLE}}': (unit.Luas_Tanah > 0 || unit.Luas_Bangunan > 0) ? `⚬ LT ${unit.Luas_Tanah}m² / LB ±${unit.Luas_Bangunan}m²` : '',
    '{{SPEC_AREA_DIM_EMOJI}}': (unit.Luas_Tanah > 0) ? `📐 *Luas Tanah:* ${unit.Luas_Tanah} m² ${hasDimensi ? `(Dimensi lega ${unit.Tipe_Ukuran} m)` : ''}` : '',
    '{{SPEC_DIM}}': hasDimensi ? `• Dimensi: ${unit.Tipe_Ukuran} m` : '',
    '{{SPEC_DIM_SIMPLE}}': hasDimensi ? `⚬ Dimensi: ${unit.Tipe_Ukuran}` : '',
    '{{SPEC_BUILD}}': `• Bangunan: ${unit.Jumlah_Lantai > 0 ? unit.Jumlah_Lantai : '1'} Lantai (Kondisi ${unit.Status_Properti || 'Siap Huni'})`,
    '{{SPEC_BUILD_EMOJI}}': unit.Luas_Bangunan > 0 ? `🏗️ *Luas Bangunan:* ± ${unit.Luas_Bangunan} m²` : '',
    '{{SPEC_BED}}': (unit.Jumlah_Kamar_Tidur > 0 || unit.Jumlah_Kamar_Mandi > 0) ? `• Kamar Tidur: ${unit.Jumlah_Kamar_Tidur} | Kamar Mandi: ${unit.Jumlah_Kamar_Mandi}` : '',
    '{{SPEC_BED_SIMPLE}}': (unit.Jumlah_Kamar_Tidur > 0 || unit.Jumlah_Kamar_Mandi > 0) ? `⚬ KT ${unit.Jumlah_Kamar_Tidur} / KM ${unit.Jumlah_Kamar_Mandi}` : '',
    '{{SPEC_BED_DETAIL}}': (unit.Jumlah_Kamar_Tidur > 0 || unit.Jumlah_Kamar_Mandi > 0) ? `⚬ KT: ${unit.Jumlah_Kamar_Tidur} | KM: ${unit.Jumlah_Kamar_Mandi}` : '',
    '{{SPEC_BED_EMOJI}}': unit.Jumlah_Kamar_Tidur > 0 ? `🛏️ *Kamar Tidur:* ${unit.Jumlah_Kamar_Tidur} Nyaman & Luas` : '',
    '{{SPEC_BATH_EMOJI}}': unit.Jumlah_Kamar_Mandi > 0 ? `🛁 *Kamar Mandi:* ${unit.Jumlah_Kamar_Mandi} (Dilengkapi Sanitair Mewah 🚽)` : '',
    '{{SPEC_CAR}}': unit.Jumlah_Carpot > 0 ? `• Kapasitas Carport: ${unit.Jumlah_Carpot} Mobil` : '',
    '{{SPEC_CAR_SIMPLE}}': unit.Jumlah_Carpot > 0 ? `⚬ Carport ${unit.Jumlah_Carpot} mobil` : '',
    '{{SPEC_CAR_EMOJI}}': unit.Jumlah_Carpot > 0 ? `🚘 *Carport:* Muat ${unit.Jumlah_Carpot} Mobil!` : '',
    '{{SPEC_POWER}}': (unit.Daya_Listrik && unit.Daya_Listrik !== '0') ? `• Daya Listrik: ${unit.Daya_Listrik} Watt` : '',
    '{{SPEC_POWER_SIMPLE}}': (unit.Daya_Listrik && unit.Daya_Listrik !== '0') ? `⚬ Listrik ${unit.Daya_Listrik}W` : '',
    '{{SPEC_POWER_EMOJI}}': (unit.Daya_Listrik && unit.Daya_Listrik !== '0') ? `⚡ *Listrik:* ${unit.Daya_Listrik} Watt (Bebas nyalain AC & fasilitas rumah!)` : '',
    '{{SPEC_LEGAL}}': `• Legalitas: ${certDetail}`,
    '{{SPEC_LEGAL_SIMPLE}}': `⚬ ${cert}`,
    '{{SPEC_LEGAL_KPR}}': `⚬ Sertifikat: ${cert} (Bisa KPR)`,
    '{{SPEC_LEGAL_EMOJI}}': `📜 *Legalitas:* ${certDetail}`,
    '{{SPEC_ROW}}': `• Akses Lingkungan: Row Jalan Lebar (Kapasitas 2,5 Mobil)`,
    '{{SPEC_ROW_EMOJI}}': `🛣️ *Row Jalan:* Lebar banget, masuk 2,5 mobil 🚙🚗`,
    '{{SPEC_HADAP}}': unit.Hadap ? `⚬ Hadap ${unit.Hadap}` : '',
    '{{SPEC_SANITARY}}': '⚬ Sanitair TOTO',
    '{{SPEC_LB_SIMPLE}}': unit.Luas_Bangunan > 0 ? `⚬ LB: ±${unit.Luas_Bangunan} m²` : '',
    '{{SPEC_ENVIRONMENT}}': '⚬ Lingkungan premium & nyaman',
    
    // TEMPLATE 3 SPECIFIC
    '{{HOOK_TEXT_3}}': 'Cari hunian super mewah yang aksesnya serba dekat dan udah siap huni? Ini dia jawabannya!',
    '{{DESC_PROMO_TEXT_3}}': `Bayangin punya hunian megah ${unit.Jumlah_Lantai > 0 ? unit.Jumlah_Lantai + ' lantai' : ''} berdesain modern, interior elegan, plus fasilitas yang bikin betah! 🏰💎 Lingkungannya bener-bener premium, tenang, dan pastinya aman. Tinggal bawa koper aja!`,
    '{{SPEC_AREA_DIM_3}}': unit.Luas_Tanah > 0 ? `• *Luas Tanah:* ${unit.Luas_Tanah}m² ${hasDimensi ? `(Dimensi super lega ${unit.Tipe_Ukuran} m)` : ''}` : '',
    '{{SPEC_LB_3}}': unit.Luas_Bangunan > 0 ? `• *Luas Bangunan:* ±${unit.Luas_Bangunan} m² ${unit.Jumlah_Lantai > 0 ? `(${unit.Jumlah_Lantai} Lantai)` : ''}` : '',
    '{{SPEC_BED_3}}': unit.Jumlah_Kamar_Tidur > 0 ? `• *Kamar Tidur:* ${unit.Jumlah_Kamar_Tidur} ruangan super nyaman` : '',
    '{{SPEC_BATH_3}}': unit.Jumlah_Kamar_Mandi > 0 ? `• *Kamar Mandi:* ${unit.Jumlah_Kamar_Mandi}` : '',
    '{{SPEC_CAR_3}}': unit.Jumlah_Carpot > 0 ? `• *Carport:* Muat ${unit.Jumlah_Carpot} mobil kesayanganmu 🚘` : '',
    '{{SPEC_POWER_3}}': (unit.Daya_Listrik && unit.Daya_Listrik !== '0') ? `• *Listrik:* ${unit.Daya_Listrik} Watt (Bebas nyalain apa aja aman jaya!)` : '',
    '{{SPEC_LEGAL_3}}': `• *Sertifikat:* ${certDetail}`,
    '{{BONUS_LIST_3}}': '✅ *Free* 9 Unit AC Daikin (Rumah auto adem! ❄️)\n✅ Tandon air + Pompa udah terpasang rapi.',
    '{{PRICE_JUAL_NEGO_3}}': hargaJual1 > 0 ? `💰 *Harga Jual: ${formatFullPrice(hargaJual2)}* *(Masih bisa Nego Tipis lho! 😉)*` : '',
    '{{PRICE_SEWA_3}}': hargaSewa1 > 0 ? `🏷️ *Harga Sewa: ${formatFullPrice(hargaSewa2)}${unitSewa}* *(Min. sewa ${unit.Minimal_Sewa || '1'} ${unit.Satuan_Minimal_Sewa || 'Tahun'})*` : '',
    '{{CTA_TEXT_3}}': 'Kapan lagi dapet *hot deal* rumah mewah plus fasilitas komplit kayak gini? Yuk buruan janjian survei sekarang juga sebelum *sold out* disamber orang! Langsung *chat* ya! 👇📲',
    
    '{{LIST_AKSES}}': listAkses,
    '{{LIST_AKSES_EMOJI}}': aksesArray.map((a: string) => `🛍️ ${a}`).join('\n') || '🛍️ Lokasi Sangat Strategis',
    '{{ALAMAT}}': alamat,
    '{{PRICE_JUAL_SECTION}}': priceJualSection,
    '{{PRICE_SEWA_SECTION}}': priceSewaSection,
    '{{PRICE_JUAL_EMOJI}}': hargaJual1 > 0 ? `💸 *HARGA JUAL:* *${formatFullPrice(hargaJual2)}* ${isJualDiskon ? '*(Best Deal, Turun Harga!)*' : ''}` : '',
    '{{PRICE_SEWA_EMOJI}}': hargaSewa1 > 0 ? `🏷️ *OPSI SEWA:* *${formatFullPrice(hargaSewa2)}${unitSewa}* *(Cocok buat ekspatriat/pebisnis)*` : '',
    '{{PRICE_JUAL_PROMO_SIMPLE}}': hargaJual1 > 0 ? `⚬ Jual: ${isJualDiskon ? `~${formatShortPrice(hargaJual1)}~ ${formatShortPrice(hargaJual2)}` : formatShortPrice(hargaJual2)}` : '',
    '{{PRICE_SEWA_PROMO_SIMPLE}}': hargaSewa1 > 0 ? `⚬ Sewa: ${(isSewaDiskon ? `~${formatShortPrice(hargaSewa1)}~ ${formatShortPrice(hargaSewa2)}` : formatShortPrice(hargaSewa2)) + unitSewa + minSewa}` : '',
    
    '{{BONUS_LIST_SECTION}}': '⚬ 9 unit AC Daikin, Tandon air + pompa',
    '{{STYLE_PROPERTI}}': unit.Tipe || 'Minimalis',
    '{{TAGLINE_PROMO}}': isJualDiskon ? 'TURUN HARGA !!!' : 'PROMO TERBATAS',
    '{{HARGA_JUAL_NEGO}}': `${formatShortPrice(hargaJual2)} (nego tipis)`
  }

  // Apply Replacements to template text
  if (!isNoTemplate) {
    Object.keys(replacers).forEach(key => {
      const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      templateText = templateText.replace(regex, replacers[key])
    })
    
    // ADVANCED POST-PROCESSING (Maximum Flexibility)
    templateText = templateText
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        // Remove empty bullet points or label-only lines
        const clean = line.replace(/[•⚬💰🏷🏠📍📝*]/g, '').trim()
        if (!clean) return false
        // Remove lines that ended up being just a label without data
        if (line.endsWith(':') || line.endsWith('–') || line.endsWith('—')) return false
        return true
      })
      .join('\n')

    // Normalize Spacing (Double newlines only for section separators)
    templateText = templateText
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  // Generate the standard "DETAIL LENGKAP PROPERTI" section (Automatic Body)
  const props = []
  if (unit.Tipe && unit.Tipe !== '-') props.push(`⚬ Tipe: ${unit.Tipe}`)
  if (hasDimensi) props.push(`⚬ Dimensi: ${unit.Tipe_Ukuran}`)
  if (unit.Luas_Tanah > 0) props.push(`⚬ Luas Tanah: ${unit.Luas_Tanah}m²`)
  if (unit.Luas_Bangunan > 0) props.push(`⚬ Luas Bangunan: ${unit.Luas_Bangunan}m²`)
  if (unit.Jumlah_Lantai > 0) props.push(`⚬ Lantai: ${unit.Jumlah_Lantai} Lantai`)
  if (unit.Jumlah_Kamar_Tidur > 0 || unit.Jumlah_Kamar_Mandi > 0) {
    props.push(`⚬ KT: ${unit.Jumlah_Kamar_Tidur} | KM: ${unit.Jumlah_Kamar_Mandi}`)
  }
  if (unit.Jumlah_Carpot > 0) props.push(`⚬ Carport: ${unit.Jumlah_Carpot} Mobil`)
  if (unit.Daya_Listrik && unit.Daya_Listrik !== '0') props.push(`⚬ Listrik: ${unit.Daya_Listrik} Watt`)
  if (unit.Jenis_Sertifikat) props.push(`⚬ Sertifikat: ${unit.Jenis_Sertifikat}`)
  if (aksesArray.length > 0) props.push(`⚬ Akses Jalan:\n${aksesArray.map((a: string) => `  - ${a}`).join('\n')}`)

  const propsDisplay = props.join('\n')

  const statusLabels = Array.isArray(unit.Status_Transaksi) ? unit.Status_Transaksi : [unit.Status_Transaksi]
  const statusHeader = statusLabels.map((s: string) => s.toLowerCase() === 'jual' ? 'DIJUAL' : 'DISEWAKAN').join(' / ')
  const header = isNoTemplate ? `*${statusHeader} PROPERTI*` : `*DETAIL LENGKAP PROPERTI:*`

  // Automatic Header Price Display
  const headerPrices = []
  if (unit.Harga_Jual1 > 0) headerPrices.push(`💰 *Harga Jual: ${formatFullPrice(hargaJual2)}*`)
  if (unit.Harga_Sewa1 > 0) headerPrices.push(`🏷 *Harga Sewa: ${formatFullPrice(hargaSewa2)}${unitSewa}*`)
  const headerPriceDisplay = headerPrices.join('\n')

  const unitInfoBody = `\n${header}
🏠 *${unit.Nama_Produk}*
📍 ${alamat}

${propsDisplay}

${headerPriceDisplay}

📝 *Keterangan:*
${unit.Keterangan || '-'}`
  
  // Assemble final message: If template selected, use template. If not, use auto-body.
  message.value = isNoTemplate ? unitInfoBody : templateText
  
  // Re-focus after selection
  setTimeout(() => messageInput.value?.focus(), 100)
}

const formatPrice = (price: number) => {
  if (!price) return '-'
  if (price >= 1000000000) {
    const v = price / 1000000000
    return (v % 1 === 0 ? v.toString() : v.toFixed(1)) + ' M'
  }
  if (price >= 1000000) {
    const v = price / 1000000
    return (v % 1 === 0 ? v.toString() : v.toFixed(1)) + ' Jt'
  }
  return price.toLocaleString('id-ID')
}

const handleSend = async () => {
  if (!message.value.trim() && !selectedUnit.value) return fail('Silakan masukkan pesan atau pilih unit terlebih dahulu')
  if (recipients.value.length === 0) return fail('Belum ada penerima yang aktif untuk broadcast')

  confirm(`Kirim broadcast ke ${recipients.value.length} penerima?`, async () => {
    isLoading.value = true
    try {
      const payload: any = {
        Pesan: message.value.trim() ? message.value : null
      }
      if (selectedUnit.value && selectedUnit.value.No_Id && showImage.value) {
        payload.Id_Produk = selectedUnit.value.No_Id
      } else {
        payload.Id_Produk = null
      }

      const { data } = await api.post('/api/broadcast/send-all', payload)
      if (data.StatusCode === 200) {
        success(data.Message || 'Broadcast sedang berjalan')

        // Parse "Estimasi selesai: X menit"
        const match = data.Message?.match(/Estimasi selesai: (\d+) menit/)
        if (match) {
          const minutes = parseInt(match[1])
          isBroadcasting.value = true

          if (broadcastTimer) clearTimeout(broadcastTimer)
          broadcastTimer = setTimeout(
            () => {
              isBroadcasting.value = false
              broadcastTimer = null
            },
            minutes * 60 * 1000
          )
        }
      } else {
        fail(data.Message || 'Gagal mengirim broadcast')
      }
    } catch (err: any) {
      fail(err.response?.data?.Message || 'Terjadi kesalahan sistem')
    } finally {
      isLoading.value = false
    }
  })
}

const handleTest = async () => {
  if (!message.value.trim() && !selectedUnit.value) return fail('Silakan masukkan pesan atau pilih unit terlebih dahulu')

  const adminPhone = localStorage.getItem('user_phone') || localStorage.getItem('no_wa') || localStorage.getItem('phone') || ''
  if (!adminPhone) {
    return fail('Nomor WhatsApp admin tidak ditemukan di local storage')
  }

  confirm(`Kirim test broadcast ke nomor Anda (${adminPhone})?`, async () => {
    isLoading.value = true
    try {
      const payload: any = {
        Pesan: message.value.trim() ? message.value : null,
        PhoneNumbers: [adminPhone]
      }
      if (selectedUnit.value && selectedUnit.value.No_Id && showImage.value) {
        payload.Id_Produk = selectedUnit.value.No_Id
      } else {
        payload.Id_Produk = null
      }

      const { data } = await api.post('/api/broadcast/send-selected', payload)
      if (data.StatusCode === 200) {
        success('Pesan test berhasil dikirim')
      } else {
        fail(data.Message || 'Gagal mengirim test broadcast')
      }
    } catch (err: any) {
      fail(err.response?.data?.Message || 'Terjadi kesalahan sistem')
    } finally {
      isLoading.value = false
    }
  })
}

const handleStop = async () => {
  confirm('Hentikan proses broadcast yang sedang berjalan?', async () => {
    isStopping.value = true
    try {
      const { data } = await api.post('/api/broadcast/stop')
      if (data.StatusCode === 200) {
        success('Broadcast berhasil dihentikan')
        isBroadcasting.value = false
        if (broadcastTimer) {
          clearTimeout(broadcastTimer)
          broadcastTimer = null
        }
      } else {
        fail(data.Message || 'Gagal menghentikan broadcast')
      }
    } catch (err: any) {
      fail(err.response?.data?.Message || 'Terjadi kesalahan sistem')
    } finally {
      isStopping.value = false
    }
  })
}

onMounted(() => {
  fetchRecipients()
  setTimeout(() => messageInput.value?.focus(), 500)
})
</script>

<template>
  <Vertical>
    <div class="px-4 md:px-3 md:pt-0 pb-2 h-[calc(100vh-theme(spacing.topbar-height)-0.5rem)] flex flex-col overflow-hidden">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 flex-grow min-h-0">
        <!-- Message Input Area (2/3) -->
        <div class="lg:col-span-2 flex flex-col min-h-0">
          <div class="bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden flex flex-col h-full">
            <div class="p-5 md:p-6 flex-grow flex flex-col space-y-3 min-h-0">
              <div class="flex items-center justify-between shrink-0">
                <div class="flex items-center gap-4">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pesan Broadcast</span>
                  <div class="h-4 w-px bg-slate-100"></div>
                  <div class="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100">
                    <div class="size-1.5 rounded-full" :class="waStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'"></div>
                    <span class="text-[9px] font-black uppercase tracking-widest" :class="waStatus === 'online' ? 'text-green-600' : 'text-red-600'"> WA GATEWAY: {{ waStatus }} </span>
                  </div>
                </div>
                <div class="flex items-center gap-6">
                  <label class="flex items-center gap-2.5 cursor-pointer group">
                    <span class="text-[10px] font-black text-slate-400 group-hover:text-bejo-600 uppercase tracking-widest transition-colors">Sertakan Gambar?</span>
                    <div class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" v-model="showImage" class="sr-only peer" />
                      <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-bejo-500 shadow-inner"></div>
                    </div>
                  </label>
                  <button @click="openUnitModal" class="text-[10px] font-black text-bejo-600 hover:text-bejo-700 uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                    <Icon icon="lucide:home" class="size-3.5" />
                    {{ selectedUnit ? 'Ganti Unit' : 'Pilih Unit' }}
                  </button>
                </div>
              </div>

              <textarea ref="messageInput" v-model="message" placeholder="Tulis pesan Anda di sini atau pilih template di samping..." class="flex-grow w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all resize-none leading-relaxed custom-scrollbar"></textarea>
              <div class="flex flex-col sm:flex-row items-center gap-3 pt-3 shrink-0">
                <button v-if="!isBroadcasting" @click="handleSend" :disabled="isLoading || (!message.trim() && !selectedUnit) || recipients.length === 0" class="w-full sm:w-auto h-11 px-8 bg-bejo-500 hover:bg-bejo-600 disabled:bg-slate-200 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-bejo-500/20 transition-all flex items-center justify-center gap-2 active:scale-95">
                  <Icon v-if="isLoading" icon="lucide:loader-2" class="size-4 animate-spin" />
                  <Icon v-else icon="lucide:send" class="size-4" />
                  Kirim Sekarang
                </button>
                <button v-else @click="handleStop" :disabled="isStopping" class="w-full sm:w-auto h-11 px-8 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 active:scale-95">
                  <Icon v-if="isStopping" icon="lucide:loader-2" class="size-4 animate-spin" />
                  <Icon v-else icon="lucide:stop-circle" class="size-4" />
                  Hentikan
                </button>
                <button @click="handleTest" :disabled="isLoading || isBroadcasting || (!message.trim() && !selectedUnit)" class="w-full sm:w-auto h-11 px-6 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95">
                  <Icon v-if="isLoading" icon="lucide:loader-2" class="size-4 animate-spin" />
                  <Icon v-else icon="lucide:smartphone" class="size-4" />
                  Test (Ke Saya)
                </button>
                <button @click="isRecipientModalOpen = true" class="sm:ml-auto h-11 px-5 bg-slate-50 hover:bg-bejo-50 border border-slate-100 hover:border-bejo-200 text-slate-600 hover:text-bejo-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 active:scale-95">
                  <div class="flex items-center gap-1.5">
                    <div class="size-2 rounded-full" :class="recipients.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-300'"></div>
                    <span>{{ recipients.length }} Penerima Aktif</span>
                  </div>
                  <div class="w-px h-4 bg-slate-200"></div>
                  <Icon icon="lucide:users" class="size-3.5" />
                  Kelola
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Templates Side Area (1/3) -->
        <div class="flex flex-col gap-4 min-h-0">
          <div class="bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/40 p-5 md:p-6 space-y-4 flex flex-col flex-grow min-h-0">
            <div class="shrink-0">
              <h5 class="text-sm font-black text-slate-900 uppercase tracking-widest">Template Pesan</h5>
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Pilih template untuk mempercepat broadcast</p>
            </div>

            <div class="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-grow">
              <button v-for="(tpl, idx) in templates" :key="idx" @click="selectTemplate(idx)" class="w-full text-left p-4 rounded-2xl border transition-all group hover:scale-[1.01] active:scale-95" :class="activeTemplateIndex === idx ? 'bg-bejo-50 border-bejo-200 ring-2 ring-bejo-500/10' : 'bg-slate-50/50 border-slate-100 hover:border-bejo-200 hover:bg-bejo-50/30'">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[10px] font-black uppercase tracking-widest transition-colors" :class="activeTemplateIndex === idx ? 'text-bejo-600' : 'text-slate-400 group-hover:text-bejo-500'">Template {{ idx + 1 }}</span>
                  <div class="size-6 rounded-lg bg-white border flex items-center justify-center text-slate-400 group-hover:text-bejo-500 transition-colors shadow-sm">
                    <Icon icon="lucide:copy" class="size-3" />
                  </div>
                </div>
                <h6 class="text-xs font-black text-slate-700 group-hover:text-slate-900 transition-colors">{{ tpl.title }}</h6>
                <p class="text-[10px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">{{ tpl.content }}</p>
              </button>
            </div>

            <button
              @click="
                () => {
                  activeTemplateIndex = null
                  message = ''
                  selectedUnit = null
                }
              "
              class="w-full py-3 text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-all border border-transparent hover:border-red-100 hover:bg-red-50 rounded-xl flex items-center justify-center gap-2 shrink-0"
            >
              <Icon icon="lucide:eraser" class="size-3.5" />
              Kosongkan Pesan
            </button>
          </div>

          <!-- Tips Card -->
          <div class="bg-bejo-600 rounded-3xl p-5 md:p-6 text-white relative overflow-hidden group shadow-xl shadow-bejo-600/20 shrink-0">
            <Icon icon="lucide:sparkles" class="absolute -right-2 -bottom-2 size-24 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            <h5 class="text-sm font-black uppercase tracking-widest mb-3 relative z-10 text-white">Tips Broadcast</h5>
            <ul class="space-y-3 relative z-10">
              <li class="flex gap-3 text-[10px] text-white/90 leading-relaxed font-medium">
                <Icon icon="lucide:check-circle-2" class="size-3.5 text-bejo-200 shrink-0" />
                Pastikan nomor WhatsApp Server dalam keadaan online.
              </li>
              <li class="flex gap-3 text-[10px] text-white/90 leading-relaxed font-medium">
                <Icon icon="lucide:check-circle-2" class="size-3.5 text-bejo-200 shrink-0" />
                Gunakan template yang menarik untuk meningkatkan respon.
              </li>
              <li class="flex gap-3 text-[10px] text-white/90 leading-relaxed font-medium">
                <Icon icon="lucide:check-circle-2" class="size-3.5 text-bejo-200 shrink-0" />
                Jangan mengirim pesan terlalu sering untuk menghindari spam.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <!-- Modals -->
    <RecipientModal :show="isRecipientModalOpen" @close="isRecipientModalOpen = false" @updated="fetchRecipients" />

    <UnitModal :show="isUnitModalOpen" @close="isUnitModalOpen = false" @selected="handleUnitSelected" />
  </Vertical>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-200 rounded-full;
}
</style>
