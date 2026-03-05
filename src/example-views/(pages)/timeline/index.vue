<template>
  <Vertical>
    <PageTitle subtitle="Components" title="Timeline" />
    <TimeLine />
    <TimelinewithAvatar />
  </Vertical>
</template>

<script setup lang="ts">
import PageTitle from '@/example-components/PageTitle.vue'
import Vertical from '@/example-layouts/vertical.vue'
import TimeLine from './components/TimeLine.vue'
import TimelinewithAvatar from './components/TimelinewithAvatar.vue'
</script>
