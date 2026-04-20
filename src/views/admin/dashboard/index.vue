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
    <div class="p-0 md:p-3 md:pt-1 pb-32 space-y-4 md:space-y-6">
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
          <!-- Insight Card (Redesigned) -->
          <div class="relative overflow-hidden bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-xl shadow-slate-200/50 group hover:shadow-2xl transition-all duration-700">
            <!-- Background Decorative Patterns -->
            <div class="absolute -top-12 -right-12 size-48 bg-bejo-50/50 rounded-full blur-3xl pointer-events-none transition-transform duration-1000 group-hover:scale-150"></div>
            <Icon icon="lucide:sparkles" class="absolute -right-4 -bottom-4 size-24 text-bejo-500/10 rotate-12 transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-0" />

            <div class="relative z-10">
              <div class="inline-flex items-center gap-2 mb-6">
                <div class="size-8 bg-bejo-100 rounded-xl flex items-center justify-center">
                  <Icon icon="lucide:lightbulb" class="size-4 text-bejo-600" />
                </div>
                <h5 class="text-[10px] font-black uppercase tracking-[0.2em] text-bejo-600">Insight Hari Ini</h5>
              </div>
              
              <p class="text-slate-700 text-base font-bold leading-relaxed mb-8 italic">
                "{{ randomInsight || 'Memuat insight strategis...' }}"
              </p>

              <div class="flex items-center justify-between pt-5 border-t border-slate-50">
                 <div class="flex flex-col">
                   <span class="text-[9px] font-black uppercase tracking-[0.2em] text-bejo-500 mb-0.5">Analisis AI</span>
                   <span class="text-[8px] font-bold text-slate-400">Rumah Bejo Intelligence Core</span>
                 </div>
                 <button class="size-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-bejo-600 group-hover:text-white transition-all shadow-sm">
                   <Icon icon="lucide:arrow-right" class="size-4" />
                 </button>
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
