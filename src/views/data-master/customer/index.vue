<script setup lang="ts">
import { ref } from 'vue'
import PageTitle from '@/components/PageTitle.vue'
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
    <PageTitle subtitle="Kelola" title="Data Customer" />
    <div class="card">
      <div class="card-header flex justify-between items-center">
        <h6 class="card-title">List Customer</h6>
      </div>

      <Filter />

      <Table ref="tableRef" @edit="openEditModal" @success="refreshTable"/>
    </div>

    <Modal
      :show="isModalOpen"
      :editData="selectedAdmin"
      @close="isModalOpen = false"
      @success="refreshTable"
    />
  </Vertical>
</template>
