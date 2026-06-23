<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { Product } from '../index.vue'
import { useSettings } from '@/stores/settings'
import { storeToRefs } from 'pinia'
import PropertySpecsGrid from '@/components/common/PropertySpecsGrid.vue'

const settingsStore = useSettings()
const { app } = storeToRefs(settingsStore)

const props = defineProps<{
  product: Product | null
}>()

const fullAddress = computed(() => {
  if (!props.product) return ''
  
  const kota = props.product.Nama_Kota || ''
  const area = props.product.Nama_Area || ''

  if (props.product.Hide_alamat) {
    return area ? `${kota} (${area})` : kota
  }

  // 1. Clean up street address (split by '_' and take first part)
  const street = props.product.Alamat.split('_')[0].trim()
  
  // 2. Location parts
  const kelurahan = (props.product as any).Kelurahan || ''
  const kecamatan = (props.product as any).Kecamatan || ''

  // Build the string: street, kelurahan, kecamatan, kota (area)
  let result = street
  if (kelurahan) result += `, ${kelurahan}`
  if (kecamatan) result += `, ${kecamatan}`
  if (kota) result += `, ${kota}`
  if (area) result += ` (${area})`
  
  return result
})

const formatCurrency = (value: number) => {
  if (value === undefined || value === null) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

const formatText = (text: string) => {
  if (!text) return ''
  // Escape HTML first to prevent XSS
  const escapedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
  
  // Format WhatsApp styles
  let formatted = escapedText.replace(/\*([^\n]+?)\*/g, '<strong class="font-black">$1</strong>')
  formatted = formatted.replace(/_([^\n]+?)_/g, '<em class="italic">$1</em>')
  formatted = formatted.replace(/~([^\n]+?)~/g, '<del class="line-through opacity-70">$1</del>')

  // Then replace URLs with links (supports http://, https://, and www.)
  const urlRegex = /(https?:\/\/[^\s]+|(?:www\.)[^\s]+)/g
  return formatted.replace(urlRegex, (url) => {
    const href = url.startsWith('http') ? url : `https://${url}`
    return `<a href="${href}" target="_blank" class="text-bejo-600 font-bold hover:underline cursor-pointer">${url}</a>`
  })
}
</script>

<template>
  <div class="lg:col-span-2 col-span-1">
    <div class="card relative transition-all duration-700 border-none shadow-premium bg-white rounded-[2.5rem] overflow-hidden">
      <div class="card-body p-8 md:p-10">
        <!-- Header: Title & Address -->
        <div class="mb-6 border-b border-slate-100 pb-6 relative">
          <!-- Badges -->
          <div v-if="product" class="flex flex-wrap items-center gap-2 mb-5">
            <div v-for="tag in product.Status_Transaksi" :key="tag" class="px-4 py-1 rounded-full bg-bejo-500 text-white text-[9px] font-black uppercase tracking-widest shadow-sm shadow-bejo-500/20">
              {{ tag }}
            </div>
          </div>
          <div v-else class="flex gap-2 mb-5 animate-pulse">
            <div class="h-6 w-16 bg-slate-100 rounded-full"></div>
          </div>

          <h1 class="text-4xl md:text-6xl font-black tracking-tighter mb-4 uppercase leading-[0.85] text-slate-900" :class="!product ? 'text-transparent bg-slate-200 rounded-2xl animate-pulse select-none' : ''">
            {{ product?.Nama_Produk || 'Memuat Nama Properti...' }}
          </h1>
          <div class="flex items-start gap-2" :class="!product ? 'text-transparent bg-slate-200 rounded-lg animate-pulse select-none w-fit' : 'text-slate-500'">
            <Icon icon="lucide:map-pin" class="size-4 mt-1" :class="!product ? 'text-transparent' : 'text-bejo-600'" />
            <span class="text-sm font-bold tracking-tight leading-relaxed">
              {{ fullAddress || 'Memuat detail alamat...' }}
            </span>
          </div>

          <!-- Property Type Badge -->
          <div v-if="product?.Tipe" class="mt-4 px-4 py-1 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest w-fit shadow-sm shadow-slate-900/20">
            {{ product.Tipe }}
          </div>
          <div v-else-if="!product" class="mt-4 h-6 w-20 bg-slate-100 rounded-full animate-pulse"></div>
        </div>

        <!-- Buyer/Tenant Identity Banner if Sold or Rented -->
        <div v-if="product && (product.Status_Properti === 'Terjual' || product.Status_Properti === 'Tersewa')" 
             :class="[
               'mb-8 p-6 border rounded-[2rem] flex flex-col gap-2.5 text-xs font-bold transition-all shadow-sm',
               product.Status_Properti === 'Terjual' 
                 ? 'bg-emerald-50/20 border-emerald-100/50 text-emerald-800' 
                 : 'bg-blue-50/20 border-blue-100/50 text-blue-800'
             ]"
        >
          <div class="flex items-center gap-1.5">
            <span :class="[
              'px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest',
              product.Status_Properti === 'Terjual' 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-blue-100 text-blue-800'
            ]">
              {{ product.Status_Properti }}
            </span>
          </div>
          
          <div class="flex items-center gap-3 mt-1">
            <Icon icon="lucide:user" :class="product.Status_Properti === 'Terjual' ? 'text-emerald-600' : 'text-blue-600'" class="size-4.5" />
            <span class="text-slate-500">
              {{ product.Status_Properti === 'Terjual' ? 'Pembeli' : 'Penyewa' }}: 
              <strong class="text-slate-800 font-extrabold text-sm">{{ product.Nama_Customer || product.Id_Customer || '-' }}</strong>
            </span>
          </div>
          
          <div class="flex items-center gap-3">
            <Icon icon="lucide:calendar" :class="product.Status_Properti === 'Terjual' ? 'text-emerald-600' : 'text-blue-600'" class="size-4.5" />
            <span class="text-slate-500">
              Tanggal Transaksi: 
              <strong class="text-slate-800 font-extrabold text-sm">{{ product.Tanggal_Transaksi ? product.Tanggal_Transaksi.split('T')[0] : '-' }}</strong>
            </span>
          </div>
        </div>

        <!-- Pricing Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div v-show="!product || product?.Status_Transaksi?.includes('Jual')" class="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 relative group overflow-hidden">
            <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2" :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-fit select-none' : ''">Harga Jual</p>
            <h4 class="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span class="font-black text-3xl md:text-4xl text-slate-900 tracking-tighter" :class="!product ? 'text-transparent bg-slate-200 rounded-xl animate-pulse select-none' : ''">
                {{ !product ? formatCurrency(5000000000) : (product?.Harga_Jual2 == 0 ? formatCurrency(product.Harga_Jual1) : formatCurrency(product.Harga_Jual2)) }}
              </span>
              <div v-if="product?.Harga_Jual2 && product?.Harga_Jual2 != 0 && product && app.viewDiscount" class="flex items-center gap-2 mt-1">
                <span class="relative text-xs font-bold text-slate-400 italic px-1 shrink-0">
                  {{ formatCurrency(product?.Harga_Jual1 || 0) }}
                  <span class="absolute inset-x-0 top-1/2 h-[1.2px] bg-slate-300 transform -rotate-2 opacity-100 rounded-full"></span>
                </span>
                <span class="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-lg border border-red-100/50">
                  -{{ Math.round(((product.Harga_Jual1 - product.Harga_Jual2) / product.Harga_Jual1) * 100) }}%
                </span>
              </div>
            </h4>
          </div>

          <div v-show="!product || product?.Status_Transaksi?.includes('Sewa')" class="bg-bejo-50/30 p-6 rounded-3xl border border-bejo-100 relative group overflow-hidden">
            <p class="text-[10px] text-bejo-600 font-black uppercase tracking-widest mb-2" :class="!product ? 'text-transparent bg-slate-200 rounded animate-pulse w-fit select-none' : ''">Harga Sewa</p>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
              <h4 class="font-black text-3xl md:text-4xl text-bejo-600 tracking-tighter" :class="!product ? 'text-transparent bg-slate-200 rounded-xl animate-pulse select-none' : ''">
                {{ !product ? formatCurrency(150000000) : formatCurrency(product?.Harga_Sewa2 == 0 ? product.Harga_Sewa1 : product?.Harga_Sewa2 || 0) }}
              </h4>
              <div v-if="product?.Harga_Sewa2 && product?.Harga_Sewa2 != 0 && product && app.viewDiscount" class="flex items-center gap-2 mt-1">
                <span class="relative text-xs font-bold text-slate-400 italic px-1 shrink-0">
                  {{ formatCurrency(product?.Harga_Sewa1 || 0) }}
                  <span class="absolute inset-x-0 top-1/2 h-[1.2px] bg-slate-300 transform -rotate-2 opacity-100 rounded-full"></span>
                </span>
                <span class="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-lg border border-red-100/50">
                  -{{ Math.round(((product.Harga_Sewa1 - product.Harga_Sewa2) / product.Harga_Sewa1) * 100) }}%
                </span>
              </div>
              <span v-if="product" class="text-xs font-bold text-bejo-600/70 lowercase mt-1 tracking-tight">/ {{ product?.Satuan_Minimal_Sewa || 'Tahun' }}</span>
            </div>
          </div>
        </div>

        <!-- Property Summary -->
        <div class="mb-14">
          <h6 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
             <div class="w-8 h-[2px] bg-slate-200 rounded-full"></div>
             Spesifikasi Properti
          </h6>
          <PropertySpecsGrid :product="product" />
        </div>

        <!-- Description -->
        <div class="mb-14 p-8 md:p-10 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 relative flex flex-col">
          <Icon icon="lucide:quote" class="absolute top-6 right-8 size-16 text-slate-500/5" v-if="product" />
          <h6 class="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
            <div class="w-10 h-[2px] bg-bejo-500 rounded-full"></div>
            Deskripsi Properti
          </h6>
          <p class="text-sm md:text-base font-medium text-slate-700 leading-relaxed whitespace-pre-wrap" :class="!product ? 'text-transparent bg-slate-200 rounded-lg animate-pulse select-none' : ''" v-html="product ? formatText(product.Keterangan) : 'Sedang memuat deskripsi properti...'">
          </p>
        </div>

        <!-- Accessibility -->
        <div class="mb-14" v-if="!product || (product?.Akses_Jalan && product.Akses_Jalan.filter(a => a && a.trim() !== '').length > 0)">
          <h6 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
             <div class="w-8 h-[2px] bg-slate-200 rounded-full"></div>
             Aksesibilitas
          </h6>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 pl-4">
            <template v-if="product">
              <div v-for="(akses, idx) in product?.Akses_Jalan?.filter(a => a && a.trim() !== '')" :key="idx" class="flex items-center gap-4 group">
                <div class="size-2 rounded-full bg-red-500 shadow-lg shadow-red-500/20 group-hover:scale-125 transition-transform"></div>
                <span class="text-sm md:text-base font-bold text-slate-700 tracking-tight">{{ akses }}</span>
              </div>
            </template>
            <template v-else>
              <div v-for="i in 4" :key="i" class="flex items-center gap-4 animate-pulse">
                <div class="size-2 rounded-full bg-slate-200"></div>
                <div class="h-4 w-2/3 bg-slate-100 rounded"></div>
              </div>
            </template>
          </div>
        </div>

        <!-- Additional Info -->
        <div class="mb-6">
          <h6 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
             <div class="w-8 h-[2px] bg-slate-200 rounded-full"></div>
             Informasi Tambahan
          </h6>
          <div class="overflow-hidden border border-slate-100 rounded-3xl">
            <table class="w-full text-sm">
              <tbody class="divide-y divide-slate-100 font-bold italic">
                <tr v-for="item in [
                  { label: 'Daya Listrik', val: product ? (product.Daya_Listrik.toLocaleString('id-ID') + ' Watt') : null },
                  { label: 'Tipe Unit', val: product?.Tipe },
                  { label: 'Sertifikat', val: product?.Jenis_Sertifikat },
                  { label: 'Hadap', val: (product as any)?.Hadap_Rumah || '-' },
                  { label: 'Posisi', val: (product as any)?.Posisi_Properti || '-' },
                  { label: 'Lebar Jalan (Row)', val: product?.Row_Jalan ? (product.Row_Jalan + ' Mobil') : '-' },
                  { label: 'Minimal Sewa', val: (product?.minimal_sewa || (product as any)?.Minimal_Sewa) ? ((product?.minimal_sewa || (product as any)?.Minimal_Sewa) + ' ' + (product?.Satuan_Minimal_Sewa || '')) : '-', show: !product || product?.Status_Transaksi?.includes('Sewa') }
                ].filter(i => i.show !== false)" :key="item.label" class="hover:bg-slate-50 transition-colors">
                  <td class="px-8 py-5 text-slate-500 bg-slate-50/50 w-1/3">{{ item.label }}</td>
                  <td class="px-8 py-5 text-slate-900 not-italic">
                    <span v-if="product">{{ item.val }}</span>
                    <div v-else class="h-4 w-24 bg-slate-100 rounded animate-pulse"></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.shadow-premium {
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.05);
}
</style>
