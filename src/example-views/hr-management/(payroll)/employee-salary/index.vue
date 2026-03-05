<template>
  <Vertical>
    <PageTitle subtitle="Menu" title="Employee Salary" />
    <SalaryCard />
    <SalaryTable />
  </Vertical>
</template>

<script setup lang="ts">
import PageTitle from '@/example-components/PageTitle.vue'
import Vertical from '@/example-layouts/vertical.vue'
import SalaryCard from './components/SalaryCard.vue'
import SalaryTable from './components/SalaryTable.vue'
</script>
