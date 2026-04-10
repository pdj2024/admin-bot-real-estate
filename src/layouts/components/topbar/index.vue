<template>
  <div class="app-header min-h-topbar-height flex items-center sticky top-0 z-30 bg-(--topbar-background) border-b border-default-200">
    <div class="w-full flex items-center justify-between px-6">
      <div class="flex items-center gap-5">
        <button id="button-toggle-menu" class="hs-overlay btn btn-icon size-8 hover:bg-default-150 rounded" @click="toggleSideNav">
          <Icon icon="lucide:align-left" class="iconify text-xl" />
        </button>
      </div>
      <div class="flex items-center gap-3">
        <ThemeToggler />

        <UserProfile />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import NotificationDropdown from './components/NotificationDropdown.vue'
import ThemeToggler from './components/ThemeToggler.vue'
import UserProfile from './components/UserProfile.vue'
import { useLayout } from '@/stores/layout'

const { layout, setSideNavSize, toggleMobileMenu } = useLayout()

const toggleSideNav = () => {
  const html = document.documentElement
  const currentSize = html.getAttribute('data-sidenav-size')

  if (currentSize === 'offcanvas') {
    toggleMobileMenu()
  } else if (layout.sidenav.size === 'md') {
    setSideNavSize(currentSize === 'md' ? 'sm' : 'md', false)
  } else {
    setSideNavSize(currentSize === 'default' ? 'sm' : 'default')
  }
}
</script>
