<template>
  <Vertical>
    <PageTitle subtitle="Menu Utama" title="Chat" />

    <div class="card overflow-hidden">
      <div class="flex">
        <SideBar />
        <Contact />
      </div>
    </div>
  </Vertical>
</template>

<script setup lang="ts">
import Vertical from '@/layouts/vertical.vue'
import PageTitle from '@/components/PageTitle.vue'
import Contact from './components/ChatContent.vue'
import SideBar from './components/SideBar.vue'
</script>
