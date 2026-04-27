<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Vertical from '@/layouts/vertical.vue'
import GreetingsBanner from './components/GreetingsBanner.vue'
import OperationalSummary from './components/OperationalSummary.vue'
import InventoryStatus from './components/InventoryStatus.vue'
import ProspectAnalytics from './components/ProspectAnalytics.vue'
import PropertyDistribution from './components/PropertyDistribution.vue'
import RecentAppointments from './components/RecentAppointments.vue'
import AgentPerformance from './components/AgentPerformance.vue'
import { managementInsights } from './components/data'

const isLoading = ref(false)
</script>

<template>
  <Vertical>
    <div class="p-0 md:p-3 md:pt-1 pb-32 space-y-6 md:space-y-8">
      <!-- Welcome Section -->
      <GreetingsBanner />

      <!-- High-Level Stats -->
      <div class="space-y-6">
        <OperationalSummary />
        <InventoryStatus />
      </div>

      <!-- Main Analytical Section -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div class="xl:col-span-8 flex flex-col">
          <ProspectAnalytics class="h-full" />
        </div>
        <div class="xl:col-span-4 flex flex-col">
          <PropertyDistribution class="h-full" />
        </div>
      </div>

      <!-- Operational Detail Section -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div class="xl:col-span-8 flex flex-col">
          <RecentAppointments class="h-full" />
        </div>
        <div class="xl:col-span-4 flex flex-col">
          <AgentPerformance class="h-full" />
        </div>
      </div>
    </div>
  </Vertical>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
