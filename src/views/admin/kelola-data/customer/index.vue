<script setup lang="ts">
import { ref } from 'vue'
import Vertical from '@/layouts/vertical.vue'
import Filter from './components/Filter.vue'
import Table from './components/Table.vue'
import Modal from './components/Modal.vue'

interface Customer {
  No_Id: string
  Email: string
  Nama_User: string
  Role_User: string
  Telepon: string
  Keterangan: string
  Status: string
}

const isModalOpen = ref(false)
const selectedCustomer = ref<Customer | null>(null)
const tableRef = ref()

const searchQuery = ref('')
const statusFilter = ref('')

const refreshTable = () => {
  if (tableRef.value?.fetchData) {
    tableRef.value.fetchData()
  }
}

const openEditModal = (customer: any) => {
  selectedCustomer.value = customer
  isModalOpen.value = true
}
</script>

<template>
  <Vertical>
    <div class="px-4 md:px-3 md:pt-1 pb-32 space-y-6 md:space-y-8">
      <!-- Main Content Card -->
      <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-visible">
        <div class="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h4 class="text-xl font-black text-slate-900 tracking-tight">List Customer</h4>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
              Data Seluruh Pelanggan Terdaftar
            </p>
          </div>
          
          <Filter 
            @search="searchQuery = $event"
            @filterStatus="statusFilter = $event"
            @exportExcel="tableRef?.exportToExcel" 
            @exportPdf="tableRef?.exportToPDF" 
            @print="tableRef?.printData" 
            @updateColumns="tableRef?.updateVisibility" 
            :columns="tableRef?.getColumns()"
          />
        </div>

        <div class="p-2 md:p-4">
          <Table 
            ref="tableRef" 
            :searchQuery="searchQuery"
            :statusFilter="statusFilter"
            @edit="openEditModal" 
            @success="refreshTable"
          />
        </div>
      </div>
    </div>

    <Modal
      :show="isModalOpen"
      :editData="selectedCustomer"
      @close="isModalOpen = false"
      @success="refreshTable"
    />
  </Vertical>
</template>
