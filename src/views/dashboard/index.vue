<template>
  <Vertical>
    <PageTitle subtitle="Dashboard" title="Property Management Overview" />

    <Transition name="fade" mode="out-in">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-8 space-y-6">
          <WelcomeCard />
          <Stats />
          <RecentAppointments />
        </div>

        <div class="lg:col-span-4 space-y-6">
          <OrderStats title="Statistik Properti" />
          <TrafficResources title="Sumber Leads" />
          <CustomerService title="Tim Pemasaran" />
        </div>
      </div>
    </Transition>
  </Vertical>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import PageTitle from '@/components/PageTitle.vue'
import Vertical from '@/layouts/vertical.vue'
import CustomerService from './components/CustomerService.vue'
import RecentAppointments from './components/RecentAppointments.vue'
import Stats from './components/Stats.vue'
import TrafficResources from './components/TrafficResources.vue'
import WelcomeCard from './components/WelcomeCard.vue'
import Audience from './components/Audience.vue'
import OrderStats from './components/OrderStat.vue'
import SalesMonth from './components/SalesMonth.vue'
import LeadConversion from './components/LeadConversion.vue'
import SellingProduct from './components/SellingProduct.vue'
</script>
