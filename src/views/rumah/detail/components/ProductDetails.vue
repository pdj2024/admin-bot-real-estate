<template>
  <div class="lg:col-span-2 col-span-1">
    <div class="card">
      <div class="card-body">
        <div class="flex justify-between items-center">
          <span class="px-2.5 py-0.5 text-xs inline-block font-semibold rounded bg-success/10 text-success">Dijual - Primary</span>
          <div class="hs-dropdown relative inline-flex">
            <button type="button" class="hs-dropdown-toggle btn size-7.5 bg-default-200 hover:bg-default-600 text-default-500 hover:text-white" aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown" hs-dropdown-placement="bottom-end">
              <Icon icon="lucide:ellipsis" class="iconify size-4"></Icon>
            </button>
            <div class="hs-dropdown-menu" role="menu">
              <RouterLink class="flex items-center gap-1.5 py-1.5 font-medium px-3 text-sm text-default-500 hover:bg-default-150 rounded" to="">
                <Icon icon="lucide:edit" class="size-3"></Icon>
                Edit Properti
              </RouterLink>
              <RouterLink class="flex items-center gap-1.5 py-1.5 font-medium px-3 text-sm text-default-500 hover:bg-default-150 rounded" to="">
                <Icon icon="lucide:trash-2" class="size-3"></Icon>
                Hapus
              </RouterLink>
            </div>
          </div>
        </div>

        <h5 class="mt-3 mb-1 text-xl text-default-800 font-semibold">Modern Scandinavian House - Citraland Cluster North</h5>
        <ul class="flex flex-wrap text-sm items-center gap-4 mb-5 text-default-500">
          <li class="flex items-center gap-1">
            <Icon icon="lucide:map-pin" class="size-4 text-primary"></Icon>
            <span class="font-medium">Sambikerep, Surabaya Barat</span>
          </li>
          <li>Listing oleh: <RouterLink to="#!" class="font-medium text-primary">Ray White Central</RouterLink></li>
          <li>Diposting: <span class="font-medium text-sm">10 Maret, 2026</span></li>
        </ul>

        <div class="flex flex-wrap items-center gap-3 mb-4 border-b border-dashed border-default-200 pb-4">
          <div class="flex items-center gap-2 text-yellow-500">
            <Icon icon="lucide:star" class="size-4 fill-yellow-500"></Icon>
            <Icon icon="lucide:star" class="size-4 fill-yellow-500"></Icon>
            <Icon icon="lucide:star" class="size-4 fill-yellow-500"></Icon>
            <Icon icon="lucide:star" class="size-4 fill-yellow-500"></Icon>
            <Icon icon="lucide:star" class="size-4 fill-yellow-500"></Icon>
            <div class="text-default-800 text-sm"><h6>(5.0)</h6></div>
          </div>
          <div class="text-default-800 text-sm"><h6>24 Terjual di Area ini</h6></div>
        </div>

        <div class="mb-6">
          <p class="mb-1 text-primary text-sm font-medium italic">Estimasi Cicilan Rp 12jt/bln</p>
          <h4 class="text-default-900 font-bold text-2xl">
            Rp 2.450.000.000
            <small class="font-normal text-base line-through align-middle text-default-500">Rp 2.700.000.000</small>
            <small class="text-success text-base align-middle font-medium ms-2">Diskon 10%</small>
          </h4>
        </div>

        <h6 class="mb-3 text-[15px] font-semibold text-default-800">Spesifikasi Utama</h6>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div class="p-3 border rounded-lg border-default-200 flex flex-col items-center gap-1">
            <Icon icon="lucide:bed" class="size-5 text-primary"></Icon>
            <span class="text-xs text-default-500">K. Tidur</span>
            <span class="font-bold text-default-800">3+1</span>
          </div>
          <div class="p-3 border rounded-lg border-default-200 flex flex-col items-center gap-1">
            <Icon icon="lucide:bath" class="size-5 text-primary"></Icon>
            <span class="text-xs text-default-500">K. Mandi</span>
            <span class="font-bold text-default-800">2+1</span>
          </div>
          <div class="p-3 border rounded-lg border-default-200 flex flex-col items-center gap-1">
            <Icon icon="lucide:maximize" class="size-5 text-primary"></Icon>
            <span class="text-xs text-default-500">L. Tanah</span>
            <span class="font-bold text-default-800">120 m²</span>
          </div>
          <div class="p-3 border rounded-lg border-default-200 flex flex-col items-center gap-1">
            <Icon icon="lucide:home" class="size-5 text-primary"></Icon>
            <span class="text-xs text-default-500">L. Bangun</span>
            <span class="font-bold text-default-800">150 m²</span>
          </div>
        </div>

        <h6 class="mt-5 mb-3 card-title text-success">Promo Khusus Bulan Ini</h6>
        <div class="flex gap-2 flex-col">
          <div class="flex gap-2 items-center">
            <Icon icon="lucide:check-circle-2" class="size-4 text-success"></Icon>
            <div class="text-default-700 text-sm">
              <span class="text-default-800 font-semibold text-sm">Free Biaya KPR:</span> Berlaku untuk Bank BCA & Mandiri.
            </div>
          </div>
          <div class="flex gap-2 items-center">
            <Icon icon="lucide:check-circle-2" class="size-4 text-success"></Icon>
            <div class="text-default-700 text-sm">
              <span class="text-default-800 font-semibold text-sm">Bonus:</span> Smart Home System & 2 Unit AC (Syarat Ketentuan Berlaku).
            </div>
          </div>
        </div>

        <div class="grid lg:grid-cols-2 grid-cols-1 gap-3 my-5">
          <div class="flex items-center gap-4 p-4 border rounded-md border-default-200">
            <Icon icon="lucide:layers" class="size-6 text-primary"></Icon>
            <div class="text-default-700 text-sm">
              <h6 class="text-default-800 font-semibold">Jumlah Lantai</h6>
              <p>2 Lantai</p>
            </div>
          </div>
          <div class="flex items-center gap-4 p-4 border rounded-md border-default-200">
            <Icon icon="lucide:zap" class="size-6 text-primary"></Icon>
            <div class="text-default-700 text-sm">
              <h6 class="text-default-800 font-semibold">Daya Listrik</h6>
              <p>3500 Watt (Token)</p>
            </div>
          </div>
        </div>

        <div class="mt-5">
          <h6 class="card-title mb-3">Deskripsi Properti:</h6>
          <p class="mb-2 text-sm text-default-600">Rumah modern dengan desain Scandinavian yang fungsional di lokasi strategis Surabaya Barat. Pencahayaan alami sangat baik dengan konsep <i>open space</i> dan taman belakang yang asri.</p>
          <p class="text-default-600 text-sm italic"><b>Dekat dengan Fasilitas Umum:</b> 5 Menit ke GWalk Citraland, 10 Menit ke Pakuwon Mall, dan dekat dengan sekolah internasional.</p>
        </div>

        <div class="mt-8">
          <h6 class="card-title mb-3 font-bold underline">Spesifikasi Lengkap:</h6>
          <div class="overflow-x-auto">
            <table class="w-full">
              <tbody>
                <tr class="border-b border-default-100">
                  <th class="px-3 py-2.5 font-semibold text-start text-sm w-64 text-default-500">Tipe Properti</th>
                  <td class="px-3 py-2.5 text-sm text-default-700">Rumah Tinggal</td>
                </tr>
                <tr class="border-b border-default-100">
                  <th class="px-3 py-2.5 font-semibold text-start w-64 text-default-500 text-sm">Sertifikat</th>
                  <td class="px-3 py-2.5 text-sm text-default-700 font-bold">SHM - Sertifikat Hak Milik</td>
                </tr>
                <tr class="border-b border-default-100">
                  <th class="px-3 py-2.5 font-semibold text-start w-64 text-default-500 text-sm">Hadap Rumah</th>
                  <td class="px-3 py-2.5 text-sm text-default-700">Utara</td>
                </tr>
                <tr class="border-b border-default-100">
                  <th class="px-3 py-2.5 font-semibold text-start w-64 text-default-500 text-sm">Garasi / Carport</th>
                  <td class="px-3 py-2.5 text-sm text-default-700">2 Mobil</td>
                </tr>
                <tr class="border-b border-default-100">
                  <th class="px-3 py-2.5 font-semibold text-start w-64 text-default-500 text-sm">Sumber Air</th>
                  <td class="px-3 py-2.5 text-sm text-default-700">PDAM & Tandon Bawah</td>
                </tr>
                <tr>
                  <th class="px-3 py-2.5 font-semibold text-start w-64 text-default-500 text-sm">Tahun Dibangun</th>
                  <td class="px-3 py-2.5 text-sm text-default-700">2024</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <h6 class="mt-8 mb-3 card-title border-t pt-5">Diskusi & Review Unit</h6>
        <div class="grid lg:grid-cols-3 grid-cols-1 gap-5">
          <div class="col-span-1">
            <div class="card-body border border-dashed border-default-200 rounded-md">
              <div class="text-center">
                <h5 class="mb-2 text-base font-semibold text-default-800">Rating Agen</h5>
                <span class="px-3.5 py-1.5 text-default-500 inline-flex gap-3 text-xs font-medium rounded-full border bg-default-100 border-default-200">
                  <span class="flex items-center gap-2 text-yellow-500">
                    <Icon icon="lucide:star" class="size-3 fill-yellow-500"></Icon>
                    <Icon icon="lucide:star" class="size-3 fill-yellow-500"></Icon>
                    <Icon icon="lucide:star" class="size-3 fill-yellow-500"></Icon>
                    <Icon icon="lucide:star" class="size-3 fill-yellow-500"></Icon>
                    <Icon icon="lucide:star" class="size-3 fill-yellow-500"></Icon>
                  </span>
                  (5.0 / 5)
                </span>
                <p class="mt-2 text-[13px] text-default-500">Berdasarkan 120 Transaksi</p>
              </div>
            </div>
          </div>

          <div class="lg:col-span-2 col-span-1">
            <div class="flex justify-between items-center gap-5">
              <h6 class="text-default-800 font-semibold text-[15px]">Pertanyaan Calon Pembeli</h6>
              <button class="text-white btn btn-sm btn-primary">Tanya Agen</button>
            </div>

            <div class="mt-3">
              <div class="flex justify-between items-center gap-5">
                <div class="flex gap-3 items-center">
                  <img :src="avatar2" alt="" class="h-10 rounded-full" />
                  <div>
                    <h6 class="card-title font-semibold text-sm">Andi Wijaya</h6>
                    <p class="text-[12px] text-default-500">14 Jan, 2024</p>
                  </div>
                </div>
              </div>
              <p class="text-default-600 text-sm mt-2 italic">"Apakah unit ini sudah termasuk kanopi untuk carport-nya?"</p>
              <div class="mt-2 pl-4 border-l-2 border-primary/30">
                <p class="text-xs font-semibold text-primary">Respon Agen:</p>
                <p class="text-xs text-default-500">"Halo Pak Andi, untuk unit tipe ini kanopi sudah termasuk dalam paket promo Smart Home."</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card mt-8">
      <div class="card-header border-b border-default-200 px-6 py-4">
        <h4 class="text-lg font-semibold text-default-800 flex items-center gap-2">
          <Icon icon="lucide:message-square" class="size-5 text-primary" />
          Diskusi & Komentar Properti
        </h4>
      </div>

      <div class="card-body p-6">
        <!-- <div class="flex flex-col gap-6 mb-8">
          <div v-for="(comment, index) in mockComments" :key="index" class="flex gap-4">
            <div class="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
              {{ comment.name.charAt(0) }}
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <h6 class="font-bold text-default-800 text-sm">{{ comment.name }}</h6>
                <span class="text-xs text-default-400">{{ comment.date }}</span>
              </div>
              <p class="text-sm text-default-600 leading-relaxed">
                {{ comment.message }}
              </p>
            </div>
          </div>
        </div> -->

        <div class="bg-default-50 p-4 rounded-xl border border-default-200">
          <h6 class="text-sm font-semibold text-default-800 mb-3">Tinggalkan Pesan:</h6>
          <div class="relative">
            <textarea
              rows="3"
              placeholder="Tanyakan detail unit atau negosiasi di sini..."
              class="w-full border border-default-200 rounded-lg p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
            ></textarea>
          </div>
          <div class="flex justify-end mt-3">
            <button
              class="btn bg-primary text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-blue-600 transition-all"
            >
              <Icon icon="lucide:send" class="size-4" />
              Kirim Komentar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import avatar2 from '@/assets/images/user/avatar-2.png'
import { RouterLink } from 'vue-router'
</script>
