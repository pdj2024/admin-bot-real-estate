<script setup lang="ts">
import { ref } from 'vue'
import Vertical from '@/layouts/vertical.vue'
import Filter from './components/Filter.vue'
import Table from './components/Table.vue'
import Modal from './components/Modal.vue'
import { Icon } from '@iconify/vue'

interface Admin {
  No_Id: string
  Email: string
  Nama_User: string
  Role_User: string
  Telepon: string
  Keterangan: string
  Status: string
}

const isModalOpen = ref(false)
const selectedAdmin = ref<Admin | null>(null)
const tableRef = ref()

const refreshTable = () => {
  if (tableRef.value?.fetchData) {
    tableRef.value.fetchData()
  }
}

const openAddModal = () => {
  selectedAdmin.value = null
  isModalOpen.value = true
}

const openEditModal = (admin: any) => {
  selectedAdmin.value = admin
  isModalOpen.value = true
}
</script>

<template>
  <Vertical>
    <div class="p-4 md:p-6 md:pt-4 pb-32 space-y-6 md:space-y-8">
      <!-- Premium Header Section -->
      <div class="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 p-6 md:p-8 shadow-xl shadow-slate-200/40">
        <!-- Ambient Background -->
        <div class="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-bejo-50 via-bejo-50/30 to-transparent"></div>
        <div class="absolute -right-20 -top-20 size-96 bg-gradient-to-br from-bejo-100/40 to-bejo-400/20 rounded-full blur-3xl"></div>

        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div class="max-w-xl">
            <nav class="flex items-center gap-2 text-[10px] text-slate-400 mb-4 uppercase tracking-widest font-black">
              <span>Rumah Bejo</span>
              <Icon icon="lucide:chevron-right" class="size-3" />
              <span>Kelola</span>
              <Icon icon="lucide:chevron-right" class="size-3" />
              <span class="text-bejo-600">Data Admin</span>
            </nav>
            <h1 class="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight mb-4">
              Manajemen <span class="text-bejo-500">Admin</span>
            </h1>
            <p class="text-sm font-bold text-slate-500 leading-relaxed">
              Kelola hak akses dan profil administrator sistem untuk menjaga keamanan dan operasional platform.
            </p>
          </div>

          <div class="flex items-center gap-4 shrink-0">
            <button @click="openAddModal" class="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-bejo-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
              <Icon icon="lucide:plus" class="size-4" />
              Tambah Admin
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content Card -->
      <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
        <div class="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h4 class="text-xl font-black text-slate-900 tracking-tight">Daftar Admin</h4>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
              Data Administrator Aktif di Sistem
            </p>
          </div>
          
          <Filter />
        </div>

        <div class="p-2 md:p-4">
          <Table ref="tableRef" @edit="openEditModal" @success="refreshTable"/>
        </div>
      </div>
    </div>

    <Modal
      :show="isModalOpen"
      :editData="selectedAdmin"
      @close="isModalOpen = false"
      @success="refreshTable"
    />
  </Vertical>
</template>
