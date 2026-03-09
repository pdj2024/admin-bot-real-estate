<template>
  <Vertical>
    <PageTitle subtitle="Kelola" title="Data Sales" />
    <div class="card">
      <div class="card-header">
        <h6 class="card-title">List Sales</h6>
        <button class="btn btn-sm bg-primary text-white"><Icon icon="lucide:plus" class="size-4 me-1"></Icon>Tambah Sales</button>
      </div>
      <StatusFilterHeader />
      <SalesTable />
    </div>
  </Vertical>
</template>

<script setup lang="ts">
import PageTitle from '@/components/PageTitle.vue'
import Vertical from '@/layouts/vertical.vue'
import StatusFilterHeader from './components/StatusFilterHeader.vue'
import SalesTable from './components/SalesTable.vue'
import { Icon } from '@iconify/vue'
</script>
