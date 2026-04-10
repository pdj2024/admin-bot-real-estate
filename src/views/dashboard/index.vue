<script setup lang="ts">
import Vertical from '@/layouts/vertical.vue'
import GreetingsBanner from './components/GreetingsBanner.vue'
import OperationalSummary from './components/OperationalSummary.vue'
import InventoryStatus from './components/InventoryStatus.vue'
import LeadAnalytics from './components/LeadAnalytics.vue'
import PropertyDistribution from './components/PropertyDistribution.vue'
import RecentAppointments from './components/RecentAppointments.vue'
</script>

<template>
  <Vertical>
    <div class="p-4 md:p-6 md:pt-4 pb-32 space-y-4 md:space-y-6">
      <!-- Welcome Section -->
      <GreetingsBanner />

      <!-- Stats Grid -->
      <div class="space-y-4 md:space-y-6">
        <OperationalSummary />
        <InventoryStatus />
      </div>

      <!-- Main Dashboard Grid -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6">
        <!-- Left Analysis Column -->
        <div class="xl:col-span-8 space-y-4 md:space-y-6">
          <LeadAnalytics />
          <RecentAppointments />
        </div>

        <!-- Right Insights Column -->
        <div class="xl:col-span-4 space-y-4 md:space-y-6">
          <PropertyDistribution />
          
          <!-- Quick Tip Card -->
          <div class="bg-gradient-to-br from-bejo-500 to-bejo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-bejo-500/30">
            <h5 class="text-lg font-black mb-3">Tips Hari Ini! 💡</h5>
            <p class="text-bejo-50 text-sm font-medium leading-relaxed mb-6">
              Listing dengan foto kualitas tinggi terbukti meningkatkan minat calon pembeli hingga 40%. Pastikan properti terbaru Anda sudah memiliki foto terbaik!
            </p>
            <button class="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
              Pelajari Teknik Foto
            </button>
          </div>
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
