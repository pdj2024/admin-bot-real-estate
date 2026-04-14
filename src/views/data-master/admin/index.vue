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
      <!-- Main Content Card -->
      <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
        <div class="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h4 class="text-xl font-black text-slate-900 tracking-tight">Daftar Admin</h4>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
              Data Administrator Aktif di Sistem
            </p>
          </div>
          
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Filter />
            <button 
              @click="openAddModal"
              class="px-6 h-11 bg-bejo-500 hover:bg-bejo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-bejo-500/20 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap"
            >
              <Icon icon="lucide:user-plus" class="size-4" />
              Tambah Admin
            </button>
          </div>
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
