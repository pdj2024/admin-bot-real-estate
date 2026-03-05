<template>
  <div class="flex items-center md:justify-between flex-wrap gap-2 mb-2 print:hidden">
    <h4 class="text-default-900 text-lg font-semibold">Operasional</h4>
    <div class="md:flex hidden items-center gap-2 text-sm font-semibold">
      <RouterLink to="" class="btn btn-sm border-0 text-primary/90 hover:text-primary"
        >Kelola
        <Icon icon="lucide:move-right" class="ms-1 size-4"></Icon>
      </RouterLink>
    </div>
  </div>
  <div class="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-5">
    <div class="card pt-2 pb-4">
      <div class="card-header pb-2">
        <div>
          <p class="text-sm text-default-500">Jumlah Admin Aktif</p>
          <h2 class="text-default-1000 font-semibold text-lg"><span data-target="2">2</span></h2>
        </div>
        <div class="flex items-center justify-center rounded-full size-10 bg-primary/10">
          <Icon icon="lucide:headset" class="size-6 text-primary"></Icon>
        </div>
      </div>
      <div class="card-body px-5 pb-0 pt-2">
        <h5 class="text-default-500 font-normal">
          <span class="font-semibold text-lg text-red-600" data-target="2">2</span>&nbsp;Tidak Aktif
        </h5>
      </div>
    </div>
    <div class="card pt-2 pb-4">
      <div class="card-header pb-2">
        <div>
          <p class="text-sm text-default-500">Jumlah Pelanggan Aktif</p>
          <h2 class="text-default-1000 font-semibold text-lg"><span data-target="23">23</span></h2>
        </div>
        <div class="flex items-center justify-center rounded-full size-10 bg-primary/10">
          <Icon icon="lucide:users" class="size-6 text-primary"></Icon>
        </div>
      </div>
      <div class="card-body px-5 pb-0 pt-2">
        <h5 class="text-default-500 font-normal">
          <span class="font-semibold text-lg text-red-600" data-target="4">4</span>&nbsp;Tidak Aktif
        </h5>
      </div>
    </div>
    <div class="card pt-2 pb-4">
      <div class="card-header pb-2">
        <div>
          <p class="text-sm text-default-500">Jumlah Sesi Chat Aktif</p>
          <h2 class="text-default-1000 font-semibold text-lg"><span data-target="12">12</span></h2>
        </div>
        <div class="flex items-center justify-center rounded-full size-10 bg-primary/10">
          <Icon icon="lucide:message-circle-more" class="size-6 text-primary"></Icon>
        </div>
      </div>
      <div class="card-body px-5 pb-0 pt-2">
        <h5 class="text-default-500 font-normal">
          <span class="font-semibold text-lg text-red-600" data-target="2">2</span>&nbsp;Tidak Aktif
        </h5>
      </div>
    </div>
  </div>

  <div class="flex items-center md:justify-between flex-wrap gap-2 mt-6 mb-2 print:hidden">
    <h4 class="text-default-900 text-lg font-semibold">Penjualan</h4>
    <div class="md:flex hidden items-center gap-2 text-sm font-semibold">
      <RouterLink to="" class="btn btn-sm border-0 text-primary/90 hover:text-primary"
        >Kelola
        <Icon icon="lucide:move-right" class="ms-1 size-4"></Icon>
      </RouterLink>
    </div>
  </div>
  <div class="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-5">
    <div class="card">
      <div class="card-body">
        <div class="flex items-center justify-center mx-auto rounded-full size-14 bg-primary/10">
          <Icon icon="lucide:wallet-2" class="size-6 text-primary"></Icon>
        </div>
        <h5 class="mt-4 text-center mb-2 text-default-800 font-semibold text-lg">Rp <span data-target="23.6">23.6</span>&nbsp;Jt</h5>
        <p class="text-center text-sm text-default-500">Total Pendapatan</p>
      </div>
    </div>
    <div class="card">
      <div class="card-body">
        <div class="flex items-center justify-center mx-auto rounded-full size-14 bg-info/10">
          <Icon icon="lucide:package" class="size-6 text-info"></Icon>
        </div>
        <h5 class="mt-4 text-center mb-2 text-default-800 font-semibold text-lg">
          <span data-target="13,461">2.312</span>
        </h5>
        <p class="text-center text-sm text-default-500">Total Pesanan</p>
      </div>
    </div>
    <div class="card">
      <div class="card-body">
        <div class="flex items-center justify-center mx-auto rounded-full size-14 bg-success/10">
          <Icon icon="lucide:truck" class="size-6 text-success"></Icon>
        </div>
        <h5 class="mt-4 text-center mb-2 text-default-800 font-semibold text-lg">
          <span data-target="17,150">350</span>
        </h5>
        <p class="text-center text-sm text-default-500">Pesanan Terkirim</p>
      </div>
    </div>
    <div class="card">
      <div class="card-body">
        <div class="flex items-center justify-center mx-auto rounded-full size-14 bg-danger/10">
          <Icon icon="lucide:package-x" class="size-6 text-danger"></Icon>
        </div>
        <h5 class="mt-4 text-center mb-2 text-default-800 font-semibold text-lg">
          <span data-target="15">15</span>
        </h5>
        <p class="text-center text-sm text-default-500">Pesanan Batal</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
</script>
