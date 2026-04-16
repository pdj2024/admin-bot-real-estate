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

const randomInsight = ref('')

onMounted(() => {
  const randomIndex = Math.floor(Math.random() * managementInsights.length)
  randomInsight.value = managementInsights[randomIndex]
})
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
          <ProspectAnalytics />
          <RecentAppointments />
        </div>

        <!-- Right Insights Column -->
        <div class="xl:col-span-4 space-y-4 md:space-y-6">
          <!-- Insight Card -->
          <div class="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-7 text-white shadow-2xl shadow-slate-900/20 group">
            <!-- Background Decorative Pattern -->
            <Icon icon="lucide:sparkles" class="absolute -right-6 -bottom-6 size-32 text-white/5 rotate-12 transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-0" />

            <div class="relative z-10">
              <div class="inline-flex items-center gap-2 mb-4">
                <h5 class="text-[10px] font-black uppercase tracking-[0.2em] text-bejo-500">💡 Insight Hari Ini</h5>
              </div>
              
              <p class="text-slate-400 text-sm font-medium leading-relaxed mb-6">
                "{{ randomInsight || 'Memuat insight strategis...' }}"
              </p>

              <div class="flex items-center justify-between pt-4 border-t border-white/5">
                 <span class="text-[9px] font-black uppercase tracking-widest text-slate-500">Analisis AI Rumah Bejo</span>
                 <Icon icon="lucide:arrow-right" class="size-4 text-slate-700 group-hover:text-bejo-500 transition-colors" />
              </div>
            </div>
          </div>

          <PropertyDistribution />

          <AgentPerformance />
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
