<script setup lang="ts">
import { currentYear } from '@/helpers'
import { useSettings } from '@/stores/settings'
const settingsStore = useSettings()
</script>

<template>
  <footer class="mt-1 footer flex items-center py-5 border-t border-default-200">
    <div class="lg:px-8 px-6 w-full flex md:justify-between justify-center gap-4">
      <div>
        {{ currentYear }}
        © {{ settingsStore.business.appName || 'Rumah Bejo' }}
      </div>
      <div class="md:flex hidden gap-2 item-center md:justify-end">
        <!-- Design &amp; Develop by<RouterLink to="https://themesdesign.in/" target="_blank" class="text-primary">{{ author }}</RouterLink> -->
      </div>
    </div>
  </footer>
</template>
