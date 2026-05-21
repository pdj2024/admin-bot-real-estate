<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Vertical from '@/layouts/vertical.vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'
import { useSettings } from '@/stores/settings'
import { useChatStore } from '@/stores/chat'
import { confirm, success, fail } from '@/utils/sweet-alert'
import RecipientModal from './components/RecipientModal.vue'
import UnitModal from './components/UnitModal.vue'

const selectedMediaIds = ref<string[]>([])

const toggleMediaSelection = (noIdMedia: string) => {
  if (!noIdMedia) return
  const index = selectedMediaIds.value.indexOf(noIdMedia)
  if (index > -1) {
    selectedMediaIds.value.splice(index, 1)
  } else {
    selectedMediaIds.value.push(noIdMedia)
  }
}

const selectedUnit = ref<any>(null)



const previewMediaList = computed(() => {
  if (!selectedUnit.value || !selectedUnit.value.MediaUrls || !selectedUnit.value.MediaUrls.length) return []
  if (selectedMediaIds.value.length === 0) {
    return [selectedUnit.value.MediaUrls[0]]
  }
  return selectedUnit.value.MediaUrls.filter((m: any) => selectedMediaIds.value.includes(m.No_Id_Media))
})

const resetBroadcast = () => {
  activeTemplateIndex.value = null
  message.value = ''
  selectedUnit.value = null
  selectedMediaIds.value = []
  currentStep.value = 1
}

const currentStep = ref(1) // Flow Steps: 1, 2, 3
const message = ref('')
const isRecipientModalOpen = ref(false)
const isUnitModalOpen = ref(false)
const activeTemplateIndex = ref<number | null>(null)
const previewTemplateIndex = ref<number | null>(1) // Default to template 2 (Sultan Vibes) for preview
const showImage = ref(true)
const isLoading = ref(false)
const isStopping = ref(false)
const isBroadcasting = ref(false)
let broadcastTimer: any = null
const settingsStore = useSettings()
const chatStore = useChatStore()

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



const defaultUnitPreviewText = `*DIJUAL / DISEWAKAN PROPERTI*
🏠 *[Nama Properti]*
📍 Jalan Raya Boulevard, Kota [Nama Kota]

⚬ Tipe: Rumah
⚬ Dimensi: 8x15 m
⚬ Luas Tanah: 120 m²
⚬ Luas Bangunan: 150 m²
⚬ Lantai: 2 Lantai
⚬ KT: 3 | KM: 2
⚬ Carport: 2 Mobil
⚬ Listrik: 2200 Watt
⚬ Sertifikat: SHM
⚬ Akses Jalan: Row Jalan Lebar (2 Mobil)

💰 *Harga Jual: Rp 1.500.000.000*

📝 *Keterangan:*
Rumah mewah siap huni di lokasi strategis.`

const getPreviewContent = () => {
  if (previewTemplateIndex.value === null) {
    return defaultUnitPreviewText
  }
  return templates[previewTemplateIndex.value].content
}

const formatTemplatePreview = (content: string | null) => {
  if (!content) return ''
  // Escape HTML characters
  let escaped = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Highlight {{PLACEHOLDER}} tags with beautiful orange/bejo badges
  escaped = escaped.replace(/\{\{([^}]+)\}\}/g, (_, name) => {
    return `<span class="inline-block px-1.5 py-0.5 text-[10px] md:text-[11px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded mx-0.5 leading-none shrink-0 align-middle my-0.5">${name}</span>`
  })

  // Format *bold* as <strong>bold</strong>
  escaped = escaped.replace(/\*([^*]+)\*/g, '<strong class="font-bold">$1</strong>')

  // Format _italic_ as <em>italic</em>
  escaped = escaped.replace(/_([^_]+)_/g, '<em class="italic">$1</em>')

  // Format ~strikethrough~ as <del>strikethrough</del>
  escaped = escaped.replace(/~([^~]+)~/g, '<del class="line-through">$1</del>')

  // Convert newlines to br tags
  return escaped.replace(/\n/g, '<br>')
}

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

const selectTemplate = (index: number | null) => {
  activeTemplateIndex.value = index
  if (selectedUnit.value) {
    // If unit is already selected, re-apply the formatting and stay in Step 3
    handleUnitSelected(selectedUnit.value)
  } else {
    // Transition to Step 2
    currentStep.value = 2
    isUnitModalOpen.value = true
  }
}

const openUnitModal = () => {
  isUnitModalOpen.value = true
}

const handleUnitSelected = (unit: any) => {
  selectedUnit.value = unit
  selectedMediaIds.value = [] // Reset media selection when a new unit is chosen
  isUnitModalOpen.value = false
  currentStep.value = 3 // Move to Step 3

  if (!unit) {
    activeTemplateIndex.value = null
    message.value = ''
    setTimeout(() => messageInput.value?.focus(), 100)
    return
  }

  const isNoTemplate = activeTemplateIndex.value === null
  let templateText = !isNoTemplate ? templates[activeTemplateIndex.value!].content : ''

  // Common Data Resolution
  const viewDiscount = settingsStore.app.viewDiscount
  const formatFullPrice = (p: number) => `Rp ${p.toLocaleString('id-ID')}`
  const formatShortPrice = (p: number) => formatPrice(p)

  // Harga Jual Section (Safe against null/0 for discount)
  const hargaJual1 = unit.Harga_Jual1
  const hargaJual2 = unit.Harga_Jual2 || hargaJual1
  const isJualDiskon = viewDiscount && unit.Harga_Jual2 && unit.Harga_Jual2 > 0 && unit.Harga_Jual1 !== unit.Harga_Jual2
  const priceJualSection = hargaJual1 > 0 ? `💰 *Harga Jual:* *${formatFullPrice(hargaJual2)}*${isJualDiskon ? ` ~* (Harga Normal: Rp ${formatShortPrice(hargaJual1)})*~` : ''}` : ''

  // Harga Sewa Section (Safe against null/0 for discount)
  const hargaSewa1 = unit.Harga_Sewa1
  const hargaSewa2 = unit.Harga_Sewa2 || hargaSewa1
  const isSewaDiskon = viewDiscount && unit.Harga_Sewa2 && unit.Harga_Sewa2 > 0 && unit.Harga_Sewa1 !== unit.Harga_Sewa2
  const unitSewa = unit.Satuan_Minimal_Sewa ? ` / ${unit.Satuan_Minimal_Sewa}` : ''
  const minSewa = unit.Minimal_Sewa ? ` *(Min. Sewa ${unit.Minimal_Sewa} ${unit.Satuan_Minimal_Sewa || 'Tahun'})*` : ''
  const priceSewaSection = hargaSewa1 > 0 ? `🏷 *Harga Sewa:* *${formatFullPrice(hargaSewa2)}${unitSewa}*${isSewaDiskon ? ` ~* (Harga Normal: Rp ${formatShortPrice(hargaSewa1)})*~` : ''}${minSewa}` : ''

  const alamat = [unit.Alamat, unit.Nama_Kota].filter((x) => x && x !== '-').join(', ') || '-'
  const aksesArray = Array.isArray(unit.Akses_Jalan) ? unit.Akses_Jalan : unit.Akses_Jalan && unit.Akses_Jalan !== '-' ? [unit.Akses_Jalan] : []
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

    // SPEC LINE WRAPPERS
    '{{SPEC_LOC}}': unit.Alamat ? `• Lokasi: ${alamat}` : '',
    '{{SPEC_LOC_EMOJI}}': unit.Alamat ? `📍 *Lokasi:* ${alamat}` : '',
    '{{SPEC_AREA}}': unit.Luas_Tanah > 0 || unit.Luas_Bangunan > 0 ? `• Luas Tanah: ${unit.Luas_Tanah} m² | Luas Bangunan: ± ${unit.Luas_Bangunan} m²` : '',
    '{{SPEC_AREA_SIMPLE}}': unit.Luas_Tanah > 0 || unit.Luas_Bangunan > 0 ? `⚬ LT ${unit.Luas_Tanah}m² / LB ±${unit.Luas_Bangunan}m²` : '',
    '{{SPEC_AREA_DIM_EMOJI}}': unit.Luas_Tanah > 0 ? `📐 *Luas Tanah:* ${unit.Luas_Tanah} m² ${hasDimensi ? `(Dimensi lega ${unit.Tipe_Ukuran} m)` : ''}` : '',
    '{{SPEC_DIM}}': hasDimensi ? `• Dimensi: ${unit.Tipe_Ukuran} m` : '',
    '{{SPEC_DIM_SIMPLE}}': hasDimensi ? `⚬ Dimensi: ${unit.Tipe_Ukuran}` : '',
    '{{SPEC_BUILD}}': `• Bangunan: ${unit.Jumlah_Lantai > 0 ? unit.Jumlah_Lantai : '1'} Lantai (Kondisi ${unit.Status_Properti || 'Siap Huni'})`,
    '{{SPEC_BUILD_EMOJI}}': unit.Luas_Bangunan > 0 ? `🏗️ *Luas Bangunan:* ± ${unit.Luas_Bangunan} m²` : '',
    '{{SPEC_BED}}': unit.Jumlah_Kamar_Tidur > 0 || unit.Jumlah_Kamar_Mandi > 0 ? `• Kamar Tidur: ${unit.Jumlah_Kamar_Tidur} | Kamar Mandi: ${unit.Jumlah_Kamar_Mandi}` : '',
    '{{SPEC_BED_SIMPLE}}': unit.Jumlah_Kamar_Tidur > 0 || unit.Jumlah_Kamar_Mandi > 0 ? `⚬ KT ${unit.Jumlah_Kamar_Tidur} / KM ${unit.Jumlah_Kamar_Mandi}` : '',
    '{{SPEC_BED_DETAIL}}': unit.Jumlah_Kamar_Tidur > 0 || unit.Jumlah_Kamar_Mandi > 0 ? `⚬ KT: ${unit.Jumlah_Kamar_Tidur} | KM: ${unit.Jumlah_Kamar_Mandi}` : '',
    '{{SPEC_BED_EMOJI}}': unit.Jumlah_Kamar_Tidur > 0 ? `🛏️ *Kamar Tidur:* ${unit.Jumlah_Kamar_Tidur} Nyaman & Luas` : '',
    '{{SPEC_BATH_EMOJI}}': unit.Jumlah_Kamar_Mandi > 0 ? `🛁 *Kamar Mandi:* ${unit.Jumlah_Kamar_Mandi} (Dilengkapi Sanitair Mewah 🚽)` : '',
    '{{SPEC_CAR}}': unit.Jumlah_Carpot > 0 ? `• Kapasitas Carport: ${unit.Jumlah_Carpot} Mobil` : '',
    '{{SPEC_CAR_SIMPLE}}': unit.Jumlah_Carpot > 0 ? `⚬ Carport ${unit.Jumlah_Carpot} mobil` : '',
    '{{SPEC_CAR_EMOJI}}': unit.Jumlah_Carpot > 0 ? `🚘 *Carport:* Muat ${unit.Jumlah_Carpot} Mobil!` : '',
    '{{SPEC_POWER}}': unit.Daya_Listrik && unit.Daya_Listrik !== '0' ? `• Daya Listrik: ${unit.Daya_Listrik} Watt` : '',
    '{{SPEC_POWER_SIMPLE}}': unit.Daya_Listrik && unit.Daya_Listrik !== '0' ? `⚬ Listrik ${unit.Daya_Listrik}W` : '',
    '{{SPEC_POWER_EMOJI}}': unit.Daya_Listrik && unit.Daya_Listrik !== '0' ? `⚡ *Listrik:* ${unit.Daya_Listrik} Watt (Bebas nyalain AC & fasilitas rumah!)` : '',
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
    '{{SPEC_POWER_3}}': unit.Daya_Listrik && unit.Daya_Listrik !== '0' ? `• *Listrik:* ${unit.Daya_Listrik} Watt (Bebas nyalain apa aja aman jaya!)` : '',
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
    Object.keys(replacers).forEach((key) => {
      const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      templateText = templateText.replace(regex, replacers[key])
    })

    // ADVANCED POST-PROCESSING
    templateText = templateText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => {
        const clean = line.replace(/[•⚬💰🏷🏠📍📝*]/g, '').trim()
        if (!clean) return false
        if (line.endsWith(':') || line.endsWith('–') || line.endsWith('—')) return false
        return true
      })
      .join('\n')

    templateText = templateText.replace(/\n{3,}/g, '\n\n').trim()
  }

  // Generate standard "DETAIL LENGKAP PROPERTI"
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
  const statusHeader = statusLabels.map((s: string) => (s.toLowerCase() === 'jual' ? 'DIJUAL' : 'DISEWAKAN')).join(' / ')
  const header = isNoTemplate ? `*${statusHeader} PROPERTI*` : `*DETAIL LENGKAP PROPERTI:*`

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

  message.value = isNoTemplate ? unitInfoBody : templateText

  setTimeout(() => messageInput.value?.focus(), 100)
}

const handleUnitModalClose = () => {
  isUnitModalOpen.value = false
  if (!selectedUnit.value) {
    currentStep.value = 1
  }
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
  if (!message.value.trim() && !selectedUnit.value) {
    return fail('Silakan masukkan pesan atau pilih unit terlebih dahulu')
  }
  if (recipients.value.length === 0) return fail('Belum ada penerima yang aktif untuk broadcast')

  confirm(`Kirim broadcast ke ${recipients.value.length} penerima?`, async () => {
    isLoading.value = true
    try {
      const payload: any = {
        Pesan: message.value.trim() ? message.value : null,
        Id_Produk: (selectedUnit.value && showImage.value) ? selectedUnit.value.No_Id : null,
        Id_Media: (selectedUnit.value && showImage.value && selectedMediaIds.value.length > 0) ? selectedMediaIds.value : null,
        PhoneNumbers: null,
        SendToAll: true
      }

      const { data } = await api.post('/api/broadcast/send', payload)
      if (data.StatusCode === 200) {
        success(data.Message || 'Broadcast sedang berjalan')
        isBroadcasting.value = true
        selectedMediaIds.value = []

        // Parse "Estimasi selesai: X menit"
        const match = data.Message?.match(/Estimasi selesai: (\d+) menit/)
        const minutes = match ? parseInt(match[1]) : 5 // Default to 5 minutes fallback

        if (broadcastTimer) clearTimeout(broadcastTimer)
        broadcastTimer = setTimeout(
          () => {
            isBroadcasting.value = false
            broadcastTimer = null
          },
          minutes * 60 * 1000
        )
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
  if (!message.value.trim() && !selectedUnit.value) {
    return fail('Silakan masukkan pesan atau pilih unit terlebih dahulu')
  }

  const adminPhone = localStorage.getItem('user_phone') || localStorage.getItem('no_wa') || localStorage.getItem('phone') || ''
  if (!adminPhone) {
    return fail('Nomor WhatsApp admin tidak ditemukan di local storage')
  }

  confirm(`Kirim test broadcast ke nomor Anda (${adminPhone})?`, async () => {
    isLoading.value = true
    try {
      const payload: any = {
        Pesan: message.value.trim() ? message.value : null,
        Id_Produk: (selectedUnit.value && showImage.value) ? selectedUnit.value.No_Id : null,
        Id_Media: (selectedUnit.value && showImage.value && selectedMediaIds.value.length > 0) ? selectedMediaIds.value : null,
        PhoneNumbers: [adminPhone],
        SendToAll: false
      }

      const { data } = await api.post('/api/broadcast/send', payload)
      if (data.StatusCode === 200) {
        success('Pesan test berhasil dikirim')
        selectedMediaIds.value = []
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

// SignalR global broadcast alert listener
const handleBroadcastAlert = (alert: any) => {
  console.log('[SignalR] GlobalBroadcastAlert received:', alert)
  isBroadcasting.value = false
  if (broadcastTimer) {
    clearTimeout(broadcastTimer)
    broadcastTimer = null
  }
}

onMounted(async () => {
  fetchRecipients()
  setTimeout(() => messageInput.value?.focus(), 500)

  // Initialize SignalR and bind GlobalBroadcastAlert listener
  await chatStore.initSignalR()
  if (chatStore.signalRConnection) {
    chatStore.signalRConnection.on('GlobalBroadcastAlert', handleBroadcastAlert)
  }
})

onUnmounted(() => {
  if (chatStore.signalRConnection) {
    chatStore.signalRConnection.off('GlobalBroadcastAlert', handleBroadcastAlert)
  }
  if (broadcastTimer) {
    clearTimeout(broadcastTimer)
  }
})
</script>

<template>
  <Vertical>
    <div class="px-4 md:px-3 md:pt-0 pb-2 h-[calc(100vh-theme(spacing.topbar-height)-0.5rem)] flex flex-col overflow-hidden">
      <!-- Steps 1 & 2: Select Template (Split layout with Live WhatsApp Mockup) -->
      <div v-if="currentStep === 1 || currentStep === 2" class="flex-grow flex flex-col py-6 max-w-6xl mx-auto w-full min-h-0 overflow-y-auto custom-scrollbar">
        <div class="text-center mb-6 shrink-0">
          <span class="text-xs md:text-sm font-black text-bejo-600 bg-bejo-50 border border-bejo-100 px-4 py-1.5 rounded-full uppercase tracking-[0.25em]">Langkah 1 dari 3</span>
          <h2 class="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mt-3 uppercase">Pilih Template Pesan</h2>
          <p class="text-sm md:text-base text-slate-400 font-bold uppercase tracking-wider mt-1">Pilih desain format pesan broadcast properti Anda</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full px-4 flex-grow items-start">
          <!-- Left: Template Selector List (width: 5 cols on lg) -->
          <div class="lg:col-span-5 flex flex-col gap-4">
            <!-- Header for template choices -->
            <div class="flex items-center gap-2 mb-1">
              <Icon icon="lucide:list-filter" class="size-4 text-bejo-500" />
              <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Daftar Pilihan Template</span>
            </div>

            <!-- Templates List Stack -->
            <div class="space-y-3">
              <div v-for="(tpl, idx) in templates" :key="idx" @click="previewTemplateIndex = idx" class="bg-white border rounded-2xl p-4 transition-all duration-300 cursor-pointer group flex flex-col text-left hover:scale-[1.01]" :class="previewTemplateIndex === idx ? 'border-bejo-500 ring-2 ring-bejo-500/10 shadow-lg shadow-bejo-500/5' : 'border-slate-100 hover:border-bejo-200'">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md" :class="previewTemplateIndex === idx ? 'bg-bejo-50 text-bejo-600' : 'bg-slate-50 text-slate-400 group-hover:text-bejo-500'"> Template {{ idx + 1 }} </span>
                    <span v-if="idx === 1" class="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded uppercase tracking-wider">Recommended</span>
                  </div>
                  <div class="size-6 rounded-lg border flex items-center justify-center transition-colors shadow-sm" :class="previewTemplateIndex === idx ? 'bg-bejo-50 border-bejo-200 text-bejo-600' : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:text-bejo-500'">
                    <Icon :icon="previewTemplateIndex === idx ? 'lucide:check-circle-2' : 'lucide:circle'" class="size-3.5" />
                  </div>
                </div>
                <h4 class="text-sm md:text-base font-black text-slate-800 uppercase tracking-tight leading-snug" :class="previewTemplateIndex === idx ? 'text-bejo-600' : 'group-hover:text-bejo-600'">
                  {{ tpl.title }}
                </h4>
              </div>

              <!-- Tanpa Template Selector -->
              <div @click="previewTemplateIndex = null" class="bg-white border rounded-2xl p-4 transition-all duration-300 cursor-pointer group flex flex-col text-left hover:scale-[1.01]" :class="previewTemplateIndex === null ? 'border-bejo-500 ring-2 ring-bejo-500/10 shadow-lg shadow-bejo-500/5' : 'border-slate-100 hover:border-bejo-200'">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md" :class="previewTemplateIndex === null ? 'bg-bejo-50 text-bejo-600' : 'bg-slate-50 text-slate-400 group-hover:text-bejo-500'"> Format Dasar </span>
                  <div class="size-6 rounded-lg border flex items-center justify-center transition-colors shadow-sm" :class="previewTemplateIndex === null ? 'bg-bejo-50 border-bejo-200 text-bejo-600' : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:text-bejo-500'">
                    <Icon :icon="previewTemplateIndex === null ? 'lucide:check-circle-2' : 'lucide:circle'" class="size-3.5" />
                  </div>
                </div>
                <h4 class="text-sm md:text-base font-black text-slate-800 uppercase tracking-tight leading-snug" :class="previewTemplateIndex === null ? 'text-bejo-600' : 'group-hover:text-bejo-600'">Tanpa Template</h4>
              </div>
            </div>
          </div>

          <!-- Right: WhatsApp Mockup Live Preview (width: 7 cols on lg) -->
          <div class="lg:col-span-7 flex flex-col bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden">
            <!-- Simulated WhatsApp Header -->
            <div class="bg-[#f0f2f5] px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="size-9 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-black text-xs shadow-inner">WA</div>
                <div>
                  <h5 class="text-xs font-black text-slate-800 tracking-wide uppercase">Pratinjau Broadcast WA</h5>
                  <div class="flex items-center gap-1 mt-0.5">
                    <span class="size-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Simulasi Live</span>
                  </div>
                </div>
              </div>
              <div class="flex gap-3 text-slate-400">
                <Icon icon="lucide:phone" class="size-4" />
                <Icon icon="lucide:video" class="size-4" />
                <Icon icon="lucide:more-vertical" class="size-4" />
              </div>
            </div>

            <!-- WhatsApp Chat Message Container -->
            <div class="bg-[#efeae2] p-5 relative min-h-[360px] max-h-[440px] overflow-y-auto custom-scrollbar flex flex-col justify-start">
              <!-- Pattern overlay -->
              <div class="absolute inset-0 opacity-5 pointer-events-none" style="background-image: radial-gradient(circle, #000 1px, transparent 1px); background-size: 16px 16px"></div>

              <!-- WhatsApp Message Bubble -->
              <div class="relative bg-[#d9fdd3] text-[#111b21] rounded-2xl rounded-tr-none px-4 py-3 shadow-md border border-[#d1f4cc] self-end max-w-[85%] text-left select-text z-10 animate-fade-in">
                <!-- Content rendering formatted template -->
                <div v-html="formatTemplatePreview(getPreviewContent())" class="text-xs md:text-sm leading-relaxed whitespace-pre-wrap text-slate-800"></div>

                <!-- Chat tail -->
                <div class="absolute top-0 right-0 transform translate-x-[45%] w-0 h-0 border-[6px] border-transparent border-l-[#d9fdd3] border-t-[#d9fdd3]"></div>

                <!-- Metadata time/check status -->
                <div class="text-right text-[9px] text-slate-400/80 mt-1 flex items-center justify-end gap-1 select-none font-medium font-mono">
                  <span>12:00</span>
                  <Icon icon="lucide:check-check" class="size-3 text-[#53bdeb]" />
                </div>
              </div>
            </div>

            <!-- Action Area / Confirm Selection button below WhatsApp mockup -->
            <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-slate-400">
                <Icon icon="lucide:sparkles" class="size-4 text-bejo-500 animate-pulse" />
                <span class="text-[10px] font-black uppercase tracking-widest">Sesuai dengan WA Client</span>
              </div>
              <button @click="selectTemplate(previewTemplateIndex)" class="px-6 py-3 bg-bejo-500 hover:bg-bejo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-bejo-500/20 transition-all flex items-center gap-2 active:scale-95">
                Gunakan Template & Lanjut
                <Icon icon="lucide:arrow-right" class="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Split Layout 2/3 (Input Message) + 1/3 (Live WA Mockup) -->
      <div v-else-if="currentStep === 3" class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 flex-grow min-h-0">
        <!-- Left Side: Message Input Area (2/3) -->
        <div class="lg:col-span-2 flex flex-col min-h-0">
          <div class="bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden flex flex-col h-full">
            <div class="p-5 md:p-6 flex-grow flex flex-col space-y-3 min-h-0">
              <div class="flex items-center justify-between shrink-0">
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-black text-bejo-600 bg-bejo-50 border border-bejo-100 px-2.5 py-1 rounded-md uppercase tracking-wider">Langkah 3 dari 3</span>
                    <span class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Pesan Broadcast</span>
                  </div>
                  <div class="h-4 w-px bg-slate-100"></div>
                  <div class="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100">
                    <div class="size-1.5 rounded-full" :class="waStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'"></div>
                    <span class="text-[10px] font-black uppercase tracking-widest" :class="waStatus === 'online' ? 'text-green-600' : 'text-red-600'"> WA GATEWAY: {{ waStatus }} </span>
                  </div>
                </div>
                <div class="flex items-center gap-6">
                  <label v-if="selectedUnit" class="flex items-center gap-2.5 cursor-pointer group">
                    <span class="text-xs font-black text-slate-400 group-hover:text-bejo-600 uppercase tracking-widest transition-colors">Sertakan Gambar Produk?</span>
                    <div class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" v-model="showImage" class="sr-only peer" />
                      <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-bejo-500 shadow-inner"></div>
                    </div>
                  </label>
                  <button @click="openUnitModal" class="text-xs font-black text-bejo-600 hover:text-bejo-700 uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                    <Icon icon="lucide:home" class="size-3.5" />
                    {{ selectedUnit ? 'Ganti Unit' : 'Pilih Unit' }}
                  </button>
                </div>
              </div>

              <!-- Message Editor Toolbar -->
              <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 shrink-0">
                <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 shrink-0">Ganti Template:</span>
                  <button v-for="(tpl, idx) in templates" :key="idx" @click="selectTemplate(idx)" class="px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all shrink-0" :class="activeTemplateIndex === idx ? 'bg-bejo-500 text-white border-bejo-500 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-bejo-300 hover:text-bejo-600'">Tpl {{ idx + 1 }}</button>
                  <button @click="selectTemplate(null)" class="px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all shrink-0" :class="activeTemplateIndex === null ? 'bg-bejo-500 text-white border-bejo-500 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-bejo-300 hover:text-bejo-600'">Dasar</button>
                </div>

                <!-- Clean/Reset & Unit Info -->
                <div class="flex items-center gap-3 sm:ml-auto">
                  <span v-if="selectedUnit" class="text-[10px] font-bold text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/50 truncate max-w-[150px]"> 🏠 {{ selectedUnit.Nama_Produk }} </span>
                  <button
                    @click="resetBroadcast"
                    class="px-3 py-1.5 text-[10px] font-black text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl border border-slate-200 hover:border-red-100 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Icon icon="lucide:arrow-left" class="size-3" />
                    Kembali
                  </button>
                </div>
              </div>

              <textarea ref="messageInput" v-model="message" placeholder="Tulis pesan Anda di sini atau sesuaikan pesan hasil template..." class="flex-grow w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all resize-none leading-relaxed custom-scrollbar"></textarea>

              <!-- Product Image Selection Section -->
              <div class="space-y-2 shrink-0">
                <div class="flex items-center justify-between">
                  <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pilih Gambar dari Unit/Produk (Kosong = Kirim Gambar Pertama)</label>
                  <span v-if="selectedUnit && selectedMediaIds.length > 0" class="text-[9px] font-bold text-bejo-600 bg-bejo-50 border border-bejo-100 px-2 py-0.5 rounded uppercase tracking-wider">{{ selectedMediaIds.length }} Terpilih</span>
                </div>
                <div class="relative">
                  <!-- Container for Media List -->
                  <div class="flex flex-nowrap gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    <template v-if="selectedUnit && showImage && selectedUnit.MediaUrls?.length > 0">
                      <div v-for="media in selectedUnit.MediaUrls" :key="media.No_Id_Media" @click="toggleMediaSelection(media.No_Id_Media)" class="relative size-20 flex-shrink-0 group/img cursor-pointer rounded-2xl overflow-hidden border transition-all hover:scale-105" :class="selectedMediaIds.includes(media.No_Id_Media) ? 'border-bejo-500 ring-2 ring-bejo-500/20 shadow-md' : 'border-slate-200 hover:border-bejo-300'">
                        <!-- Video/Image Thumbnail -->
                        <div v-if="media.ContentType?.startsWith('video/')" class="size-full bg-slate-100">
                          <video :src="`${media.Url || media.Id_Media}#t=0.001`" class="size-full object-cover" preload="metadata" playsinline muted></video>
                          <div class="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                            <Icon icon="lucide:play" class="size-4 text-white fill-white/20" />
                          </div>
                        </div>
                        <img v-else :src="media.Url || media.Id_Media" class="size-full object-cover" />
                        
                        <!-- Check Badge/Overlay -->
                        <div class="absolute top-1.5 right-1.5 size-5 rounded-full flex items-center justify-center transition-all shadow-md" :class="selectedMediaIds.includes(media.No_Id_Media) ? 'bg-bejo-500 text-white' : 'bg-black/30 text-white/70 hover:bg-black/50'">
                          <Icon :icon="selectedMediaIds.includes(media.No_Id_Media) ? 'lucide:check' : 'lucide:circle'" class="size-3" />
                        </div>
                      </div>
                    </template>
                    
                    <!-- States: Not selected, disabled, empty -->
                    <div v-else-if="!selectedUnit" class="flex-grow flex items-center h-20 px-4 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-[10px] font-black uppercase tracking-widest italic bg-slate-50/30 gap-2">
                      <Icon icon="lucide:home" class="size-4 text-slate-300" />
                      Pilih unit terlebih dahulu untuk menyertakan gambar produk
                    </div>
                    <div v-else-if="!showImage" class="flex-grow flex items-center h-20 px-4 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-[10px] font-black uppercase tracking-widest italic bg-slate-50/30 gap-2">
                      <Icon icon="lucide:eye-off" class="size-4 text-slate-300" />
                      Sertakan Gambar Produk dinonaktifkan
                    </div>
                    <div v-else class="flex-grow flex items-center h-20 px-4 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-[10px] font-black uppercase tracking-widest italic bg-slate-50/30 gap-2">
                      <Icon icon="lucide:image-off" class="size-4 text-slate-300" />
                      Unit ini tidak memiliki foto/media
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row items-center gap-3 pt-3 shrink-0">
                <!-- Send/Stop Toggle Button -->
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

                <button @click="isRecipientModalOpen = true" class="sm:ml-auto h-11 px-5 bg-slate-50 hover:bg-bejo-50 border border-slate-100 hover:border-bejo-200 text-slate-600 hover:text-bejo-600 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 active:scale-95">
                  <div class="flex items-center gap-1.5">
                    <div class="size-2 rounded-full" :class="recipients.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-300'"></div>
                    <span class="text-[10px] font-bold">{{ recipients.length }} Penerima Aktif</span>
                  </div>
                  <div class="w-px h-4 bg-slate-200"></div>
                  <Icon icon="lucide:users" class="size-3.5" />
                  Kelola
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Live WA Mockup & Tips (1/3) -->
        <div class="flex flex-col gap-4 min-h-0">
          <!-- WhatsApp Live Mockup -->
          <div class="bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden flex flex-col flex-grow min-h-0">
            <!-- Simulated WhatsApp Header -->
            <div class="bg-[#f0f2f5] px-4 py-3 border-b border-slate-200/80 flex items-center justify-between shrink-0">
              <div class="flex items-center gap-3">
                <div class="size-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-black text-[10px] shadow-inner">WA</div>
                <div>
                  <h5 class="text-[10px] font-black text-slate-800 tracking-wide uppercase">Hasil Broadcast WA</h5>
                  <div class="flex items-center gap-1 mt-0.5">
                    <span class="size-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Preview</span>
                  </div>
                </div>
              </div>
              <div class="flex gap-2 text-slate-400">
                <Icon icon="lucide:phone" class="size-3.5" />
                <Icon icon="lucide:video" class="size-3.5" />
              </div>
            </div>

            <!-- WhatsApp Chat Message Container -->
            <div class="bg-[#efeae2] p-4 relative flex-grow overflow-y-auto custom-scrollbar flex flex-col justify-start min-h-[220px] space-y-3">
              <!-- Pattern overlay -->
              <div class="absolute inset-0 opacity-5 pointer-events-none" style="background-image: radial-gradient(circle, #000 1px, transparent 1px); background-size: 16px 16px"></div>

              <!-- 1. Gambar/Video Produk Bubble (1 bubble per gambar) -->
              <template v-if="showImage && selectedUnit && previewMediaList.length > 0">
                <div v-for="(img, idx) in previewMediaList" :key="idx" class="relative bg-[#d9fdd3] text-[#111b21] rounded-2xl rounded-tr-none p-1.5 shadow-md border border-[#d1f4cc] self-end max-w-[90%] text-left select-text z-10">
                  <div class="rounded-xl overflow-hidden border border-[#b4e6ad] max-w-full">
                    <video v-if="img.ContentType?.startsWith('video/')" :src="img.Url || img.Id_Media" class="w-full max-h-48 object-cover" preload="metadata" muted></video>
                    <img v-else :src="img.Url || img.Id_Media" class="w-full max-h-48 object-cover" />
                  </div>
                  <!-- Chat tail -->
                  <div class="absolute top-0 right-0 transform translate-x-[45%] w-0 h-0 border-[6px] border-transparent border-l-[#d9fdd3] border-t-[#d9fdd3]"></div>
                  <!-- Metadata time/check status -->
                  <div class="text-right text-[8px] text-slate-400/80 mt-1 mr-1.5 pb-0.5 flex items-center justify-end gap-1 select-none font-medium font-mono">
                    <span>12:00</span>
                    <Icon icon="lucide:check-check" class="size-3 text-[#53bdeb]" />
                  </div>
                </div>
              </template>

              <!-- 2. Isi Pesan Bubble (Last) -->
              <div v-if="message.trim()" class="relative bg-[#d9fdd3] text-[#111b21] rounded-2xl rounded-tr-none px-3.5 py-2.5 shadow-md border border-[#d1f4cc] self-end max-w-[90%] text-left select-text z-10">
                <div v-html="formatTemplatePreview(message)" class="text-xs leading-relaxed whitespace-pre-wrap text-slate-800"></div>
                <!-- Chat tail -->
                <div class="absolute top-0 right-0 transform translate-x-[45%] w-0 h-0 border-[6px] border-transparent border-l-[#d9fdd3] border-t-[#d9fdd3]"></div>
                <!-- Metadata time/check status -->
                <div class="text-right text-[8px] text-slate-400/80 mt-1 flex items-center justify-end gap-1 select-none font-medium font-mono">
                  <span>12:00</span>
                  <Icon icon="lucide:check-check" class="size-3 text-[#53bdeb]" />
                </div>
              </div>

              <!-- Empty State Placeholder -->
              <div v-if="!message.trim() && !(showImage && selectedUnit && previewMediaList.length > 0)" class="m-auto text-center p-4">
                <Icon icon="lucide:message-square-dashed" class="size-8 text-slate-300 mx-auto mb-2" />
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tulis pesan untuk melihat pratinjau live</p>
              </div>
            </div>
          </div>

          <!-- Tips Card -->
          <div class="p-6 bg-gradient-to-br from-bejo-50 to-white rounded-2xl text-slate-900 relative overflow-hidden border border-bejo-100 shadow-sm group">
            <Icon icon="lucide:sparkles" class="absolute -right-4 -bottom-4 size-24 text-bejo-600/10 rotate-12 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-0" />
            <div class="relative z-10">
              <div class="flex items-center gap-2 mb-2">
                <div class="size-5 bg-bejo-600 rounded-lg flex items-center justify-center">
                  <Icon icon="lucide:sparkles" class="size-2.5 text-white" />
                </div>
                <h5 class="text-xs font-black uppercase tracking-[0.2em] text-bejo-600">Tips Broadcast</h5>
              </div>
              <p class="text-[13px] text-slate-500 leading-relaxed font-bold">Banyak fitur baru akan hadir segera.</p>
              <ul class="space-y-2 relative z-10 text-[13px] text-slate-500 leading-relaxed font-bold">
                <li class="flex gap-2">
                  <Icon icon="lucide:check-circle-2" class="size-3 text-bejo-200 shrink-0 mt-0.5" />
                  Pastikan nomor WhatsApp Server dalam keadaan online.
                </li>
                <li class="flex gap-2">
                  <Icon icon="lucide:check-circle-2" class="size-3 text-bejo-200 shrink-0 mt-0.5" />
                  Gunakan template yang menarik untuk meningkatkan respon.
                </li>
                <li class="flex gap-2">
                  <Icon icon="lucide:check-circle-2" class="size-3 text-bejo-200 shrink-0 mt-0.5" />
                  Jangan mengirim pesan terlalu sering untuk menghindari spam.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <RecipientModal :show="isRecipientModalOpen" @close="isRecipientModalOpen = false" @updated="fetchRecipients" />

    <UnitModal :show="isUnitModalOpen" @close="handleUnitModalClose" @selected="handleUnitSelected" />
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
