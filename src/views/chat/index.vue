<template>
  <Vertical>
    <div class="card overflow-hidden">
      <div class="flex">
        <SideBar @select-chat="handleSelectChat" />
        <ChatContent :roomId="selectedRoomId" />
      </div>
    </div>
  </Vertical>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Vertical from '@/layouts/vertical.vue'
import PageTitle from '@/components/PageTitle.vue'
import ChatContent from './components/ChatContent.vue'
import SideBar from './components/SideBar.vue'

const selectedRoomId = ref<string | null>(null)

const handleSelectChat = (id: string) => {
  selectedRoomId.value = id
}
</script>
