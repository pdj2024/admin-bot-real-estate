<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'

interface Sales {
  id: string
  name: string
  username: string
  area: string
  email: string
  phone: string
  joined: string
  status: 'Aktif' | 'Non Aktif'
  avatar?: string
  initials?: string
}

const emit = defineEmits(['edit', 'success'])
const openDropdownId = ref<string | null>(null)
  
const salesList = ref<Sales[]>([
  { id: '#USR0011', name: 'Agus Saputra', username: 'agussaputra', area: 'Yogyakarta', email: 'agus.saputra@gmail.com', phone: '0813 2345 6789', joined: '05 Jan 2023', status: 'Aktif' },
  { id: '#USR0012', name: 'Maya Sari', username: 'mayasari', area: 'Malang', email: 'maya.sari@gmail.com', phone: '0821 3344 5566', joined: '14 Jan 2023', status: 'Aktif' },
  { id: '#USR0013', name: 'Hendra Wijaya', username: 'hendrawijaya', area: 'Bogor', email: 'hendra.wijaya@gmail.com', phone: '0815 6677 8899', joined: '22 Feb 2023', status: 'Non Aktif' },
  { id: '#USR0014', name: 'Lina Marlina', username: 'linamarlina', area: 'Tasikmalaya', email: 'lina.marlina@gmail.com', phone: '0812 9988 1122', joined: '10 Mar 2023', status: 'Aktif' },
  { id: '#USR0015', name: 'Rudi Hartono', username: 'rudihartono', area: 'Solo', email: 'rudi.hartono@gmail.com', phone: '0822 4455 6677', joined: '18 Mar 2023', status: 'Non Aktif' }
])

// Helpers
const getInitial = (name: string) => name?.charAt(0).toUpperCase() || '?'

const toggleStatus = (item: Sales) => {
  item.status = item.status === 'Aktif' ? 'Non Aktif' : 'Aktif'
}

const toggleDropdown = (id: string) => {
  openDropdownId.value = openDropdownId.value === id ? null : id
}

const handleClickOutside = (event: MouseEvent) => {
  if (!(event.target as HTMLElement).closest('.action-menu')) {
    openDropdownId.value = null
  }
}

const fetchData = () => {
  // Sementara mock data dari original SalesTable.vue
}

defineExpose({ fetchData })

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="flex flex-col">
    <div class="overflow-x-auto lg:overflow-visible">
      <table class="min-w-full divide-y divide-slate-100">
        <thead>
          <tr class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <th class="px-6 py-5 text-start">Sales Agent</th>
            <th class="px-6 py-5 text-start">Area</th>
            <th class="px-6 py-5 text-start">Kontak</th>
            <th class="px-6 py-5 text-start">Status</th>
            <th class="px-6 py-5 text-start">Action</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-50">
          <tr v-for="item in salesList" :key="item.id" class="hover:bg-slate-50/50 transition-all duration-300 group">
            <td class="px-6 py-5">
              <div class="flex items-center gap-4">
                <div class="size-12 rounded-2xl bg-gradient-to-br from-bejo-500 to-bejo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-bejo-500/20 group-hover:scale-110 transition-transform duration-500">
                  {{ getInitial(item.name) }}
                </div>
                <div class="flex flex-col gap-0.5">
                  <span class="font-black text-slate-900 tracking-tight group-hover:text-bejo-600 transition-colors">{{ item.name }}</span>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">{{ item.id }}</span>
                  </div>
                </div>
              </div>
            </td>

            <td class="px-6 py-5">
              <div class="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-widest">
                <Icon icon="lucide:map-pin" class="size-3.5 text-bejo-500" />
                {{ item.area }}
              </div>
            </td>

            <td class="px-6 py-5">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2 text-slate-600 font-bold text-sm">
                  <Icon icon="lucide:mail" class="size-3.5 text-slate-400" />
                  {{ item.email }}
                </div>
                <div class="flex items-center gap-2 text-slate-500 font-medium text-xs">
                  <Icon icon="lucide:phone" class="size-3.5 text-slate-300" />
                  {{ item.phone }}
                </div>
              </div>
            </td>

            <td class="px-6 py-5">
              <div class="flex items-center gap-4">
                <span class="text-[10px] uppercase font-black tracking-[0.1em] transition-all min-w-[60px]" :class="item.status === 'Aktif' ? 'text-bejo-500' : 'text-slate-300'">
                  {{ item.status }}
                </span>
                <button 
                  @click="toggleStatus(item)"
                  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-bejo-500/20"
                  :class="item.status === 'Aktif' ? 'bg-bejo-500' : 'bg-slate-200'"
                >
                  <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" :class="item.status === 'Aktif' ? 'translate-x-5' : 'translate-x-0'"></span>
                </button>
              </div>
            </td>

            <td class="px-6 py-5 relative action-menu">
              <button @click.stop="toggleDropdown(item.id)" class="size-10 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200">
                <Icon icon="lucide:more-vertical" class="size-5" />
              </button>

              <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <div v-if="openDropdownId === item.id" class="absolute right-6 mt-2 w-48 bg-white shadow-2xl border border-slate-100 rounded-2xl p-2 z-[100]">
                  <button @click="emit('edit', item)" class="dropdown-item w-full">
                    <Icon icon="lucide:pencil" class="size-4" /> 
                    Edit Data
                  </button>
                  <div class="my-1.5 border-t border-slate-50"></div>
                  <button class="dropdown-item w-full text-red-500 hover:bg-red-50 hover:text-red-600">
                    <Icon icon="lucide:trash-2" class="size-4" /> 
                    Hapus Sales
                  </button>
                </div>
              </Transition>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Mock -->
    <div class="px-6 py-5 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        Menampilkan 
        <span class="text-slate-900 font-black">5</span> 
        dari 
        <span class="text-slate-900 font-black">{{ salesList.length }}</span> 
        Sales
      </div>

      <div class="flex items-center gap-2">
        <button disabled class="btn-pagination">
          <Icon icon="lucide:chevron-left" class="size-4" />
        </button>
        <div class="flex items-center gap-1">
          <button class="btn-pagination-num active">1</button>
        </div>
        <button disabled class="btn-pagination">
          <Icon icon="lucide:chevron-right" class="size-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.btn-pagination {
  @apply size-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400
         transition-all hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed;
}

.btn-pagination-num {
  @apply size-9 flex items-center justify-center rounded-xl text-xs font-black text-slate-400 hover:bg-slate-50 transition-all;
}

.btn-pagination-num.active {
  @apply bg-bejo-500 text-white shadow-lg shadow-bejo-500/20;
}

.dropdown-item {
  @apply flex items-center gap-3 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 rounded-xl transition-all hover:bg-slate-50;
}
</style>
