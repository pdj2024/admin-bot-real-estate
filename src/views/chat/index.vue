<script setup lang="ts">
import { ref } from 'vue'
import Vertical from '@/layouts/vertical.vue'
import PageTitle from '@/components/PageTitle.vue'
import ChatContent from './components/ChatContent.vue'
import SideBar from './components/SideBar.vue'

const selectedRoomId = ref<string | null>(null)
const selectedUsername = ref<string>('')
const selectedPhone = ref<string>('')

const handleSelectChat = (id: string) => {
  selectedRoomId.value = id
}
const handleUsername = (name: string) => {
  selectedUsername.value = name
}
const handlePhone = (phone: string) => {
  selectedPhone.value = phone
}
</script>

<template>
  <Vertical>
    <PageTitle subtitle="Utama" title="Chat" />

    <div class="card overflow-hidden">
      <div class="flex h-[calc(100vh-180px)] min-h-[500px]">
        <SideBar :active-room-id="selectedRoomId" @select_chat="handleSelectChat" @username="handleUsername" @phone_number="handlePhone" />
        <ChatContent :roomId="selectedRoomId" :username="selectedUsername" :phoneNumber="selectedPhone"/>
      </div>
    </div>
  </Vertical>
</template>
