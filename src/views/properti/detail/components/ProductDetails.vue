<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { RouterLink, useRouter } from 'vue-router'
import type { Product } from '../index.vue'

defineProps<{
  product: Product | null
  isAdmin: boolean
}>()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}
</script>

<template>
  <div class="lg:col-span-2 col-span-1">
    <div class="card relative transition-all duration-500 border-none shadow-sm hover:shadow-md bg-white rounded-xl overflow-hidden">
      <div class="card-body p-6">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-2">
            <template v-for="(transaksi, index) in product?.Status_Transaksi" :key="index">
              <span class="px-3 py-1 text-[11px] uppercase tracking-wider font-bold rounded-full bg-primary/10 text-primary border border-primary/20">
                {{ transaksi }}
              </span>
            </template>
          </div>
        </div>

        <div class="mb-6">
          <h5 class="text-2xl text-default-900 font-bold tracking-tight mb-2 uppercase leading-tight">
            {{ product?.Nama_Produk }}
          </h5>
          <div class="flex items-center gap-2 text-default-500">
            <Icon icon="lucide:map-pin" class="size-4 text-primary" />
            <span class="text-sm font-medium">
              {{ product?.Alamat }}
              <span v-if="product?.Area[1] != null"> ({{ product?.Area[1] }}) </span>
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div v-if="product?.Status_Transaksi.includes('Jual')" class="bg-default-50 p-4 rounded-xl border border-default-100">
            <p class="text-[10px] text-default-500 font-bold uppercase tracking-widest mb-1">Harga Jual</p>
            <h4 class="text-primary font-extrabold text-2xl flex items-baseline gap-2">
              {{ product?.Harga_Jual2 == 0 ? formatCurrency(product.Harga_Jual1) : formatCurrency(product.Harga_Jual2) }}
              <span v-if="product?.Harga_Jual2 != 0" class="text-sm font-medium line-through text-default-400 italic">
                {{ formatCurrency(product?.Harga_Jual1 || 0) }}
              </span>
            </h4>
          </div>

          <div v-if="product?.Status_Transaksi.includes('Sewa')" class="bg-primary/5 p-4 rounded-xl border border-primary/10">
            <p class="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">Harga Sewa</p>
            <h4 class="text-primary font-extrabold text-2xl">
              {{ formatCurrency(product?.Harga_Sewa1 || 0) }}
              <span class="text-xs font-medium text-default-500 lowercase">/ {{ product?.Satuan_Minimal_Sewa || 'Tahun' }}</span>
            </h4>
          </div>
        </div>

        <div class="mb-8">
          <h6 class="text-xs font-bold text-default-800 uppercase tracking-widest mb-4 flex items-center gap-2"><span class="w-8 h-[1.5px] bg-primary"></span> Ringkasan Properti</h6>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div
              v-for="(spec, idx) in [
                { icon: 'lucide:land-plot', label: 'L. Tanah', val: product?.Luas_Tanah + ' m²' },
                { icon: 'lucide:home', label: 'L. Bangunan', val: product?.Luas_Bangunan + ' m²' },
                { icon: 'lucide:layers', label: 'Lantai', val: product?.Jumlah_Lantai },
                { icon: 'lucide:bed', label: 'K. Tidur', val: product?.Jumlah_Kamar_Tidur },
                { icon: 'lucide:bath', label: 'K. Mandi', val: product?.Jumlah_Kamar_Mandi },
                { icon: 'lucide:car', label: 'Carport', val: product?.Jumlah_Carpot }
              ]"
              :key="idx"
              class="flex flex-col items-center py-3 rounded-lg border border-default-100 hover:bg-default-50 transition-colors"
            >
              <Icon :icon="spec.icon" class="size-4 text-primary mb-1.5" />
              <span class="text-[9px] uppercase font-bold text-default-400">{{ spec.label }}</span>
              <span class="text-sm font-bold text-default-800">{{ spec.val }}</span>
            </div>
          </div>
        </div>

        <div class="mb-8 p-5 bg-default-50/50 rounded-xl border-s-4 border-primary">
          <h6 class="text-xs font-bold text-default-800 uppercase tracking-widest mb-2">Deskripsi Lengkap</h6>
          <p class="text-sm text-default-600 leading-relaxed">{{ product?.Keterangan }}</p>
        </div>

        <div class="mt-10">
          <h6 class="text-xs font-bold text-default-800 uppercase tracking-widest mb-4">Akses</h6>
          <div class="overflow-hidden border border-default-100 rounded-xl">
            <table class="w-full text-sm">
              <tbody class="divide-y divide-default-100">
                <tr v-for="(akses, idx) in product?.Akses_Jalan" :key="idx" class="hover:bg-default-50/50 transition-colors group">
                  <td class="px-5 py-3 text-default-800 flex items-center gap-3">
                    <span class="size-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors"></span>
                    {{ akses }}
                  </td>
                </tr>

                <tr v-if="!product?.Akses_Jalan || product.Akses_Jalan.length === 0">
                  <td class="px-5 py-4 text-default-400 italic text-center">Informasi akses jalan tidak tersedia</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="mt-10">
          <h6 class="text-xs font-bold text-default-800 uppercase tracking-widest mb-4">Informasi Tambahan</h6>
          <div class="overflow-hidden border border-default-100 rounded-xl">
            <table class="w-full text-sm">
              <tbody class="divide-y divide-default-100">
                <tr class="hover:bg-default-50/50 transition-colors">
                  <td class="px-5 py-3 font-semibold text-default-500 bg-default-50/30 w-1/3 italic">Daya Listrik</td>
                  <td class="px-5 py-3 text-default-800">{{ product?.Daya_Listrik.toLocaleString('id-ID') }} Watt</td>
                </tr>
                <tr class="hover:bg-default-50/50 transition-colors">
                  <td class="px-5 py-3 font-semibold text-default-500 bg-default-50/30 w-1/3 italic">Tipe Unit</td>
                  <td class="px-5 py-3 text-default-800">{{ product?.Tipe }}</td>
                </tr>
                <tr class="hover:bg-default-50/50 transition-colors">
                  <td class="px-5 py-3 font-semibold text-default-500 bg-default-50/30 w-1/3 italic">Sertifikat</td>
                  <td class="px-5 py-3 text-primary font-bold">{{ product?.Jenis_Sertifikat }}</td>
                </tr>
                <tr v-if="product?.minimal_sewa && product?.minimal_sewa > 0" class="hover:bg-default-50/50 transition-colors">
                  <td class="px-5 py-3 font-semibold text-default-500 bg-default-50/30 w-1/3 italic">Minimal Sewa</td>
                  <td class="px-5 py-3 text-default-800 font-medium">{{ product?.minimal_sewa }} {{ product?.Satuan_Minimal_Sewa }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
