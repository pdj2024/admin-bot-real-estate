<template>
  <div class="flex items-center md:justify-between flex-wrap gap-2 mb-4 print:hidden">
    <h4 class="text-default-900 text-lg font-semibold">{{ title }}</h4>

  </div>
</template>

<script setup lang="ts">

type PropsType = {
  title: string
  subtitle?: string
}

defineProps<PropsType>()
</script>
