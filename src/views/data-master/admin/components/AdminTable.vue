<template>
  <div class="flex flex-col">
    <div class="overflow-x-auto">
      <div class="min-w-full inline-block align-middle">
        <div class="overflow-hidden">
          <table class="min-w-full divide-y divide-default-200">
            <thead class="bg-default-150">
              <tr class="text-sm font-normal text-default-700 whitespace-nowrap">
                <th class="ps-4 text-start">
                  <input id="checkbox-all" type="checkbox" class="form-checkbox" />
                </th>
                <th scope="col" class="px-3.5 py-3 text-start">User ID</th>
                <th scope="col" class="px-3.5 py-3 text-start">Nama</th>
                <th scope="col" class="px-3.5 py-3 text-start">Email</th>
                <th scope="col" class="px-3.5 py-3 text-start">No HP</th>
                <th scope="col" class="px-3.5 py-3 text-start">Status</th>
                <th scope="col" class="px-3.5 py-3 text-start">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr class="text-default-800 font-normal text-sm whitespace-nowrap" v-for="(item, idx) in users" :key="idx">
                <td class="px-4 py-3">
                  <input id="checkbox-all" type="checkbox" class="form-checkbox" />
                </td>
                <td class="px-3.5 py-3 text-sm text-primary">{{ item.id }}</td>
                <td class="flex py-3 px-3.5 items-center gap-3">
                  <div class="size-10 rounded-full bg-default-200">
                    <img v-if="item.avatar" :src="item.avatar" alt="" class="h-10 rounded-full" />
                    <div v-else class="w-9 h-9 flex items-center justify-center rounded-full bg-default-200 font-semibold">{{ item.initials }}</div>
                  </div>
                  <div>
                    <h6 class="mb-1.5 font-semibold">
                      <RouterLink to="" class="text-default-800">{{ item.name }}</RouterLink>
                    </h6>
                    <p class="text-default-500">{{ item.username }}</p>
                  </div>
                </td>
                <td class="py-3 px-3.5">{{ item.email }}</td>
                <td class="py-3 px-3.5">{{ item.phone }}</td>
                <td class="py-3 px-3.5 text-center">
                  <span class="py-0.5 px-2.5 inline-flex items-center gap-x-1 text-xs font-medium rounded bg-default-200 text-default-600">
                    <Icon :icon="item.status == 'Aktif' ? 'lucide:check-circle-2' : 'lucide:ban'" class="size-3"></Icon>
                    {{ item.status }}
                  </span>
                  <br />
                  <button class="toggle my-1" :class="item.status === 'Aktif' ? 'toggle-active' : ''" @click="toggleStatus(item)"><span class="toggle-circle" :class="item.status === 'Aktif' ? 'translate-x-6' : ''"></span></button>
                </td>
                <td class="py-3 px-3.5 relative">
                  <button
                    :ref="
                      (el) => {
                        dropdownRefs[idx] = el as HTMLElement
                      }
                    "
                    class="btn size-7.5 bg-default-200 hover:bg-default-600 text-default-500"
                    @click.stop="toggleDropdown(idx)"
                  >
                    <Icon icon="lucide:ellipsis" class="size-4" />
                  </button>

                  <div v-if="openDropdown === idx" class="absolute right-0 mt-2 w-36 bg-white shadow-lg rounded-lg p-2 z-[100]">
                    <RouterLink to="" class="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 rounded">
                      <Icon icon="lucide:eye" class="size-3" />
                      Detail
                    </RouterLink>

                    <RouterLink to="" class="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 rounded">
                      <Icon icon="lucide:edit" class="size-3" />
                      Edit
                    </RouterLink>

                    <RouterLink to="" class="flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded">
                      <Icon icon="lucide:trash-2" class="size-3" />
                      Hapus
                    </RouterLink>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="card-footer">
      <p class="text-default-500 text-sm">Showing <b>10</b> of <b>58</b> Results</p>
      <nav class="flex items-center gap-2" aria-label="Pagination">
        <button type="button" class="btn btn-sm border bg-transparent border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10"><Icon icon="lucide:chevron-left" class="size-4 me-1"></Icon> Prev</button>
        <button type="button" class="btn size-7.5 bg-transparent border border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10">1</button>
        <button type="button" class="btn size-7.5 bg-primary text-white">2</button>
        <button type="button" class="btn size-7.5 bg-transparent border border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10">3</button>
        <button type="button" class="btn btn-sm border bg-transparent border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10">
          Next
          <Icon icon="lucide:chevron-right" class="size-4 ms-1"></Icon>
        </button>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.toggle {
  cursor: pointer;
}

.toggle-box {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: transparent;
}

.toggle {
  width: 48px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 999px;
  position: relative;
  transition: all 0.25s;
}

.toggle-active {
  background: #0284c7;
}

.toggle-circle {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 999px;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.25s;
}
</style>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import { RouterLink } from 'vue-router'
import avatar1 from '@/assets/images/user/avatar-1.png'
import avatar2 from '@/assets/images/user/avatar-2.png'
import avatar3 from '@/assets/images/user/avatar-3.png'
import avatar4 from '@/assets/images/user/avatar-4.png'

const openDropdown = ref<number | null>(null)
const dropdownRefs = ref<(HTMLElement | null)[]>([])

interface User {
  id: string
  name: string
  username: string
  email: string
  phone: string
  joined: string
  status: 'Aktif' | 'Non Aktif'
  avatar?: string
  initials?: string
}

const users = ref<User[]>([
  {
    id: '#USR0001',
    name: 'Budi Santoso',
    username: 'budisantoso123',
    email: 'budi.santoso@gmail.com',
    phone: '0812 3456 7890',
    joined: '04 Jan 2023',
    status: 'Aktif',
    avatar: avatar2
  },
  {
    id: '#USR0002',
    name: 'Siti Aisyah',
    username: 'sitiaisyah123',
    email: 'siti.aisyah@gmail.com',
    phone: '0813 5566 7788',
    joined: '18 Jan 2023',
    status: 'Non Aktif',
    avatar: avatar1
  },
  {
    id: '#USR0003',
    name: 'Andi Pratama',
    username: 'andipratama123',
    email: 'andi.pratama@gmail.com',
    phone: '0812 9988 7766',
    joined: '04 Feb 2023',
    status: 'Aktif',
    avatar: avatar2
  },
  {
    id: '#USR0004',
    name: 'Rina Kartika',
    username: 'rinakartika123',
    email: 'rina.kartika@gmail.com',
    phone: '0821 4455 6677',
    joined: '12 Feb 2023',
    status: 'Aktif',
    avatar: avatar3
  },
  {
    id: '#USR0005',
    name: 'Dewi Lestari',
    username: 'dewilestari123',
    email: 'dewi.lestari@gmail.com',
    phone: '0819 2233 4455',
    joined: '28 Feb 2023',
    status: 'Non Aktif',
    avatar: avatar1
  },
  {
    id: '#USR0006',
    name: 'Ahmad Fauzan',
    username: 'ahmadfauzan',
    email: 'ahmad.fauzan@gmail.com',
    phone: '0812 6677 8899',
    joined: '27 Okt 2023',
    status: 'Aktif',
    initials: 'AF'
  },
  {
    id: '#USR0007',
    name: 'Nur Hidayah',
    username: 'nurhhidayah123',
    email: 'nur.hidayah@gmail.com',
    phone: '0822 8899 1122',
    joined: '03 Agu 2023',
    status: 'Non Aktif',
    avatar: avatar2
  },
  {
    id: '#USR0008',
    name: 'Fajar Nugroho',
    username: 'fajarnugroho123',
    email: 'fajar.nugroho@gmail.com',
    phone: '0813 1122 3344',
    joined: '01 Jul 2023',
    status: 'Non Aktif',
    avatar: avatar3
  },
  {
    id: '#USR0009',
    name: 'Rizky Maulana',
    username: 'rizkymaulana123',
    email: 'rizky.maulana@gmail.com',
    phone: '0817 4455 6677',
    joined: '11 Des 2023',
    status: 'Non Aktif',
    initials: 'RM'
  },
  {
    id: '#USR0010',
    name: 'Putri Maharani',
    username: 'putrimaharani123',
    email: 'putri.maharani@gmail.com',
    phone: '0812 7788 9900',
    joined: '11 Des 2023',
    status: 'Non Aktif',
    avatar: avatar4
  }
])

const toggleStatus = (user: User) => {
  user.status = user.status === 'Aktif' ? 'Non Aktif' : 'Aktif'
}

const toggleDropdown = (index: number) => {
  openDropdown.value = openDropdown.value === index ? null : index
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node

  const clickedInside = dropdownRefs.value.some((el) => {
    return el?.contains(target)
  })

  if (!clickedInside) {
    openDropdown.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
