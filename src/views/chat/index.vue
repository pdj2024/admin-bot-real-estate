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

<template>
  <Vertical>
    <PageTitle subtitle="Menu Utama" title="Chat" />

    <div class="card overflow-hidden">
  <div class="flex h-[80vh] items-stretch">
    <SideBar @select-chat="handleSelectChat" class="w-1/3 border-e" />
    <ChatContent :roomId="selectedRoomId" class="ms-3 flex-grow" />
  </div>
</div>
  </Vertical>
</template>

