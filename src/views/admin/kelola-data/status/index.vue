<script setup lang="ts">
import { ref } from 'vue'
import Vertical from '@/layouts/vertical.vue'
import Filter from './components/Filter.vue'
import Table from './components/Table.vue'
import Modal from './components/Modal.vue'

interface StatusData {
  No_Id: string
  Nama: string
  Warna: string | null
  Kategori: string
  Status: string
  Keterangan: string | null
}

const isModalOpen = ref(false)
const selectedStatus = ref<StatusData | null>(null)
const tableRef = ref()

const searchQuery = ref('')
const categoryFilter = ref('')

const refreshTable = () => {
  if (tableRef.value?.fetchData) {
    tableRef.value.fetchData()
  }
}

const openEditModal = (status: any) => {
  selectedStatus.value = status
  isModalOpen.value = true
}

const openAddModal = () => {
  selectedStatus.value = null
  isModalOpen.value = true
}
</script>

<template>
  <Vertical>
    <div class="px-4 md:px-3 md:pt-1 pb-32 space-y-6 md:space-y-8">
      <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-visible">
        <div class="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h4 class="text-xl font-black text-slate-900 tracking-tight">Master Status</h4>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
              Kelola Status Label & Skema Warna
            </p>
          </div>
          
          <div class="flex flex-col sm:flex-row items-center gap-4">
            <Filter 
              @search="searchQuery = $event"
              @filterCategory="categoryFilter = $event"
              @exportExcel="tableRef?.exportToExcel" 
              @exportPdf="tableRef?.exportToPDF" 
              @print="tableRef?.printData" 
              @updateColumns="tableRef?.updateVisibility" 
              :columns="tableRef?.getColumns()"
            />
            
            <button 
              @click="openAddModal"
              class="h-11 px-6 bg-bejo-600 hover:bg-bejo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-bejo-600/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Icon icon="lucide:plus" class="size-4" />
              Tambah Status
            </button>
          </div>
        </div>

        <div class="p-2 md:p-4">
          <Table 
            ref="tableRef" 
            :searchQuery="searchQuery"
            :categoryFilter="categoryFilter"
            @edit="openEditModal" 
            @success="refreshTable"
          />
        </div>
      </div>
    </div>

    <Modal
      :show="isModalOpen"
      :editData="selectedStatus"
      @close="isModalOpen = false"
      @success="refreshTable"
    />
  </Vertical>
</template>
