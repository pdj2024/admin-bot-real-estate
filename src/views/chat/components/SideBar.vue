<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import simplebar from 'simplebar-vue'
import logo from '@/assets/images/logo-sm.png'
import user1 from '@/assets/images/user/user-1.jpg'
import user2 from '@/assets/images/user/user-2.jpg'
import user3 from '@/assets/images/user/user-3.jpg'
import user4 from '@/assets/images/user/user-4.jpg'
import avatar10 from '@/assets/images/user/avatar-10.png'
import avatar8 from '@/assets/images/user/avatar-8.png'
import avatar1 from '@/assets/images/user/avatar-1.png'
import avatar5 from '@/assets/images/user/avatar-5.png'
import { RouterLink } from 'vue-router'
import api from '@/services/axios'

const Chats = ref<chat[]>([])

interface chat {
  Room_Id : string
  Room_Name : string
  Room_Type : string
  Username_Lawan : string
  Id_Lawan : string
  ID_Media_Lawan : string
  No_Id_Media_Lawan : string
  Created_At : string | null
  Last_Message_At : Date
  Last_Message : string
  Status : string
  User_Ids : string[]
  Count_Status_Sent : number
  List_Id_Message_Sent : string[]
  Count_Status_Received : number
  List_Id_Message_Received : string[]
}

const fetchData = async () => {
  try {
    const { data } = await api.get('/api/chat/getRooms?orderby=Last_Message_At', {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    Chats.value = data.Data
    console.log(Chats)
  } catch (err: any) {
    console.error('DATA:', err.response?.data)
    console.error('STATUS:', err.response?.status)
    console.error('MESSAGE:', err.message)
  }
}

onMounted(async () => {
  await fetchData()
})
</script>

<template>
  <div class="lg:border-e border-default-200">
    <div id="hs-offcanvas-left" class="hs-overlay [--auto-close:lg] lg:block lg:translate-x-0 lg:static lg:end-auto lg:bottom-0 w-80 hs-overlay-open:translate-x-0 -translate-x-full transition-all duration-300 transform h-full hidden fixed top-0 start-0 bottom-0 overflow-hidden z-60" role="dialog" tabindex="-1" aria-label="Sidebar">
      <div class="card rounded-none shadow-none relative flex flex-row h-full max-h-full overflow-hidden divide-x divide-default-200">
        <div class="w-80">
          <div class="card-body">
            <div class="mt-5 relative">
              <input type="email" class="ps-11 block w-full form-input form-input-sm" placeholder="Search for...." />
              <div class="absolute inset-y-0 start-0 flex items-center ps-4">
                <Icon icon="lucide:search" class="size-3.5 flex items-center text-default-500"></Icon>
              </div>
            </div>
          </div>
          <simplebar class="lg:h-[calc(100vh-310px)] h-[calc(100vh-125px)]" data-simplebar>
            <div class="px-5 mb-1">
              <p class="mb-1 text-cyan-900 text-sm">Perlu Balasan</p>
            </div>
            <div class="bg-cyan-100">
              <RouterLink to="" v-for="(chat, idx) in Chats"  class="flex gap-3 py-2 px-4 bg-default-150">
                <div class="relative flex items-center justify-center font-semibold rounded-full size-9 bg-default-200">
                  <img :src="user2" alt="" class="rounded-full w-9 h-9" />
                  <span class="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-default-50 rounded-full bg-danger"></span>
                </div>
                <div class="flex-grow">
                  <h6 class="mb-1 text-default-800 font-semibold text-sm">{{ chat.User_Ids }}</h6>
                  <p class="text-xs truncate text-default-500">Baik, terima kasih mbak</p>
                </div>
                <small class="text-xs text-default-500">02:57 PM</small>
              </RouterLink>
              <!-- <RouterLink to="" class="flex gap-3 py-2 px-4 bg-cyan-300">
                <div class="relative flex items-center justify-center font-semibold rounded-full size-9 bg-default-200">
                  <img :src="user2" alt="" class="rounded-full w-9 h-9" />
                  <span class="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-default-50 rounded-full bg-danger"></span>
                </div>
                <div class="flex-grow">
                  <h6 class="mb-1 text-default-800 font-semibold text-sm">Budi Galangan</h6>
                  <p class="text-xs truncate text-default-500">Baik, terima kasih mbak</p>
                </div>
                <small class="text-xs text-default-500">02:57 PM</small>
              </RouterLink>
              <RouterLink to="" class="flex gap-3 py-2 px-4 hover:bg-default-150">
                <div class="relative flex items-center justify-center font-semibold rounded-full size-9 bg-default-200">
                  <img :src="avatar5" alt="" class="rounded-full w-9 h-9" />
                  <span class="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-default-50 rounded-full bg-green-500"></span>
                </div>
                <div class="flex-grow">
                  <h6 class="mb-1 text-default-800 font-semibold text-sm">Yanti Warung</h6>
                  <p class="text-xs truncate text-default-500">Saya ingin gula pasir 1 ton ...</p>
                </div>
                <small class="text-xs text-default-500">2min ago</small>
              </RouterLink>
              <RouterLink to="" class="flex gap-3 py-2 px-4 hover:bg-default-150">
                <div class="relative flex items-center justify-center font-semibold rounded-full size-9 bg-default-200">
                  <img :src="avatar1" alt="" class="rounded-full w-9 h-9" />
                  <span class="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-default-50 rounded-full bg-green-500"></span>
                </div>
                <div class="flex-grow">
                  <h6 class="mb-1 text-default-800 font-semibold text-sm">Yuda Katering</h6>
                  <p class="text-xs truncate text-default-500">Apa sudah ada barangnya?</p>
                </div>
                <small class="text-xs text-default-500">Yesterday</small>
              </RouterLink> -->
            </div>
            <div class="px-5 pt-2">
              <p class="mb-1 text-default-500 text-sm">Riwayat Percakapan</p>
            </div>
            <div class="bg-default-100">
              <RouterLink to="" class="flex gap-3 py-2 px-4 hover:bg-default-150">
                <div class="relative flex items-center justify-center font-semibold rounded-full size-9 bg-default-200">
                  <img :src="user1" alt="" class="rounded-full w-9 h-9" />
                  <span class="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-default-50 rounded-full bg-default-500"></span>
                </div>
                <div class="">
                  <h6 class="mb-1 text-default-800 font-semibold text-sm">Mama Burhan</h6>
                  <p class="text-xs truncate text-default-500">Hi There! I'm using Whatsapp</p>
                </div>
              </RouterLink>
              <RouterLink to="" class="flex gap-3 py-2 px-4 hover:bg-default-150">
                <div class="relative flex items-center justify-center font-semibold rounded-full size-9 bg-default-200">
                  <img :src="avatar5" alt="" class="rounded-full w-9 h-9" />
                  <span class="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-default-50 rounded-full bg-danger"></span>
                </div>
                <div class="">
                  <h6 class="mb-1 text-default-800 font-semibold text-sm">Mita Jubaedah</h6>
                  <p class="text-xs truncate text-default-500">Hi There! I'm using Whatsapp</p>
                </div>
              </RouterLink>
              <RouterLink to="" class="flex gap-3 py-2 px-4 hover:bg-default-150">
                <div class="relative flex items-center justify-center font-semibold rounded-full size-9 bg-default-200">
                  RD
                  <span class="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-default-50 rounded-full bg-green-500"></span>
                </div>
                <div class="">
                  <h6 class="mb-1 text-default-800 font-semibold text-sm">Ronald D'Clincton</h6>
                  <p class="text-xs truncate text-default-500">Hi There! I'm using Whatsapp</p>
                </div>
              </RouterLink>
              <RouterLink to="" class="flex gap-3 py-2 px-4 hover:bg-default-150">
                <div class="relative flex items-center justify-center font-semibold rounded-full size-9 bg-default-200">
                  <img :src="user3" alt="" class="rounded-full w-9 h-9" />
                  <span class="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-default-50 rounded-full bg-default-950"></span>
                </div>
                <div class="">
                  <h6 class="mb-1 text-default-800 font-semibold text-sm">Jaqueline Hammes</h6>
                  <p class="text-xs truncate text-default-500">Angular Developer</p>
                </div>
              </RouterLink>
              <RouterLink to="" class="flex gap-3 py-2 px-4 hover:bg-default-150">
                <div class="relative flex items-center justify-center font-semibold rounded-full size-9 bg-default-200">
                  <img :src="avatar8" alt="" class="rounded-full w-9 h-9" />
                  <span class="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-default-50 rounded-full bg-default-950"></span>
                </div>
                <div class="">
                  <h6 class="mb-1 text-default-800 font-semibold text-sm">Andrea Pesina</h6>
                  <p class="text-xs truncate text-default-500">Laravel Developer</p>
                </div>
              </RouterLink>
              <RouterLink to="" class="flex gap-3 py-2 px-4 hover:bg-default-150">
                <div class="relative flex items-center justify-center font-semibold rounded-full size-9 bg-default-200">
                  <img :src="avatar10" alt="" class="rounded-full w-9 h-9" />
                  <span class="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-default-50 rounded-full bg-green-500"></span>
                </div>
                <div class="">
                  <h6 class="mb-1 text-default-800 font-semibold text-sm">Bernard Pereira</h6>
                  <p class="text-xs truncate text-default-500">Web Designer</p>
                </div>
              </RouterLink>
              <RouterLink to="" class="flex gap-3 py-2 px-4 hover:bg-default-150">
                <div class="relative flex items-center justify-center font-semibold rounded-full size-9 bg-default-200">
                  <img :src="user4" alt="" class="rounded-full w-9 h-9" />
                  <span class="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-default-50 rounded-full bg-default-950"></span>
                </div>
                <div class="">
                  <h6 class="mb-1 text-default-800 font-semibold text-sm">William Jones</h6>
                  <p class="text-xs truncate text-default-500">Project Manager</p>
                </div>
              </RouterLink>
              <RouterLink to="" class="flex gap-3 py-2 px-4 hover:bg-default-150">
                <div class="relative flex items-center justify-center font-semibold rounded-full size-9 bg-default-200">
                  <img :src="user2" alt="" class="rounded-full w-9 h-9" />
                  <span class="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-default-50 rounded-full bg-default-500"></span>
                </div>
                <div class="">
                  <h6 class="mb-1 text-default-800 font-semibold text-sm">Aurore Maggio</h6>
                  <p class="text-xs truncate text-default-500">React Developer</p>
                </div>
              </RouterLink>
              <RouterLink to="" class="flex gap-3 py-2 px-4 hover:bg-default-150">
                <div class="relative flex items-center justify-center font-semibold rounded-full size-9 bg-default-200">
                  LP
                  <span class="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-default-50 rounded-full bg-green-500"></span>
                </div>
                <div class="">
                  <h6 class="mb-1 text-default-800 font-semibold text-sm">Mark Walton</h6>
                  <p class="text-xs truncate text-default-500">UI / UX Designer</p>
                </div>
              </RouterLink>
            </div>
          </simplebar>
        </div>
      </div>
    </div>
  </div>
</template>
