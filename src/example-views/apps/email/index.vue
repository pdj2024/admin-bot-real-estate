<template>
  <Vertical class="overflow-x-hidden">
    <PageTitle subtitle="Apps" title="Mailbox" />
    <div class="grid grid-cols-1">
      <div class="col-span-1">
        <div class="card">
          <div class="flex">
            <SideBar />
            <MailBox />
          </div>
        </div>
      </div>
    </div>
  </Vertical>
</template>

<script setup lang="ts">
import PageTitle from '@/example-components/PageTitle.vue'
import Vertical from '@/example-layouts/vertical.vue'
import SideBar from './components/SideBar.vue'
import MailBox from './components/MailBox.vue'
</script>
