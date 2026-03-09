<template>
  <!-- Modal Event -->
  <div v-if="props.openAppointment" class="col-span-1">
    <div ref="appointmentRef" class="max-w-sm mx-auto bg-white rounded-2xl shadow-lg border border-default-100 overflow-hidden my-4">
      <!-- HEADER DENGAN TOMBOL X -->
      <div class="bg-indigo-600 px-4 py-3 flex justify-between items-center">
        <h3 class="text-white font-semibold text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Detail Janji Temu
        </h3>

        <!-- Tombol X -->
        <button @click="closeModal" class="text-white text-sm font-bold hover:text-gray-200">✕</button>
      </div>

      <!-- BODY -->
      <div class="p-5 space-y-4">
        <!-- Tanggal & Waktu -->
        <div class="flex justify-between items-center border-b border-default-50 pb-3">
          <div>
            <p class="text-[10px] uppercase tracking-wider text-default-400">Tanggal</p>
            <p class="text-sm font-bold text-default-800">Selasa, 10 Maret 2026</p>
          </div>
          <div class="text-right">
            <p class="text-[10px] uppercase tracking-wider text-default-400">Waktu</p>
            <p class="text-sm font-bold text-indigo-600">14:00 WIB</p>
          </div>
        </div>

        <!-- Lokasi -->
        <div>
          <p class="text-[10px] uppercase tracking-wider text-default-400 mb-1">Lokasi Unit</p>
          <div class="flex gap-2 items-start">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
            </svg>
            <p class="text-sm text-default-700 leading-relaxed">Kopi Kenangan, Grand City Mall Surabaya, Lantai LG.</p>
          </div>
        </div>

        <!-- Customer & Salesman -->
        <div class="grid grid-cols-2 gap-4 pt-2">
          <div class="bg-default-50 p-2 rounded-lg">
            <p class="text-[10px] uppercase tracking-wider text-default-400">Customer</p>
            <p class="text-sm font-medium text-default-800">Budi Santoso</p>
          </div>
          <div class="bg-default-50 p-2 rounded-lg">
            <p class="text-[10px] uppercase tracking-wider text-default-400">Salesman</p>
            <p class="text-sm font-medium text-default-800">Andi Pratama</p>
          </div>
        </div>

        <!-- Properti -->
        <div class="space-y-3">
          <div class="flex gap-3 items-center">
            <img :src="house" alt="rumah" class="w-20 h-16 object-cover rounded-lg" />
            <div class="flex-1">
              <p class="text-[10px] uppercase tracking-wider text-default-400 mb-1">Nama Properti</p>
              <p class="text-sm font-medium text-default-800">Griya Asri Residence</p>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 text-xs text-default-700">
            <div class="bg-default-50 p-2 rounded-lg text-center">
              <p class="uppercase tracking-wider text-[10px] text-default-400 mb-1">Tipe</p>
              <p class="font-medium">45</p>
            </div>
            <div class="bg-default-50 p-2 rounded-lg text-center">
              <p class="uppercase tracking-wider text-[10px] text-default-400 mb-1">LB / LT</p>
              <p class="font-medium">45m² / 60m²</p>
            </div>
            <div class="bg-default-50 p-2 rounded-lg text-center">
              <p class="uppercase tracking-wider text-[10px] text-default-400 mb-1">Carport</p>
              <p class="font-medium">1 Mobil</p>
            </div>
            <div class="bg-default-50 p-2 rounded-lg text-center">
              <p class="uppercase tracking-wider text-[10px] text-default-400 mb-1">Jml Lantai</p>
              <p class="font-medium">1</p>
            </div>
            <div class="bg-default-50 p-2 rounded-lg text-center">
              <p class="uppercase tracking-wider text-[10px] text-default-400 mb-1">KT</p>
              <p class="font-medium">2</p>
            </div>
            <div class="bg-default-50 p-2 rounded-lg text-center">
              <p class="uppercase tracking-wider text-[10px] text-default-400 mb-1">WC</p>
              <p class="font-medium">1</p>
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="px-5 py-3 bg-default-50 flex gap-2">
        <button @click="closeModal" class="flex-1 text-xs font-semibold py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition">Batal</button>
        <button class="flex-1 text-xs font-semibold py-2 rounded-md border bg-green-500 text-white hover:bg-green-600 transition">Re-Schedule</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const house =
  'data:image/jpeg;base64,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'

const props = defineProps<{
  openAppointment: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const appointmentRef = ref<HTMLElement | null>(null)

// Hanya menutup modal saat tombol close / batal diklik
const closeModal = () => {
  emit('close')
}
</script>
