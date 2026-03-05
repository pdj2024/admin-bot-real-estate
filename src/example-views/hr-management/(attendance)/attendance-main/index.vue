<template>
  <Vertical>
    <PageTitle subtitle="Menu" title="Main Attendance" />
    <Stat />
    <Table />
  </Vertical>
</template>

<script setup lang="ts">
import PageTitle from '@/example-components/PageTitle.vue'
import Vertical from '@/example-layouts/vertical.vue'
import Stat from './components/Stat.vue'
import Table from './components/Table.vue'
</script>
