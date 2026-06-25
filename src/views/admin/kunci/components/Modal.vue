<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'
import { success, fail } from '@/utils/sweet-alert'

const props = defineProps<{
  show: boolean
  editData: any | null
}>()

const emit = defineEmits(['close', 'success'])

const isSaving = ref(false)
const isProdukOpen = ref(false)
const produkSearch = ref('')
const products = ref<any[]>([])

const form = reactive({
  Id_Produk: '',
  Nama_Kunci: '',
  Status: 'aktif'
})

const fetchProducts = async () => {
  try {
    const { data } = await api.get('/api/realEstate/getAll', { headers: { 'X-Jenis-User': 'admin' } })
    products.value = data.Data || []
  } catch (e) {
    console.error('Failed to fetch products', e)
  }
}

const filteredProducts = computed(() => {
  if (!produkSearch.value) return products.value
  return products.value.filter(p => 
    p.Nama_Produk.toLowerCase().includes(produkSearch.value.toLowerCase())
  )
})

const selectProduk = (val: string) => {
  form.Id_Produk = val
  isProdukOpen.value = false
  produkSearch.value = ''
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.produk-dropdown')) isProdukOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  fetchProducts()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.editData) {
      Object.assign(form, {
        Id_Produk: props.editData.Id_Produk || '',
        Nama_Kunci: props.editData.Nama_Kunci || '',
        Status: props.editData.Status || 'aktif'
      })
    } else {
      resetForm()
    }
  }
})

const resetForm = () => {
  Object.assign(form, {
    Id_Produk: '',
    Nama_Kunci: '',
    Status: 'aktif'
  })
}

const handleSave = async () => {
  if (!form.Id_Produk) return fail('Properti wajib dipilih!')
  if (!form.Nama_Kunci) return fail('Nama kunci wajib diisi!')
  
  isSaving.value = true
  try {
    const payload = { ...form }
    let res
    if (props.editData) {
      res = await api.put(`/api/masterKunci/update?no_id=${props.editData.No_Id}`, payload, { headers: { 'X-Jenis-User': 'admin' } })
    } else {
      res = await api.post('/api/masterKunci/create', payload, { headers: { 'X-Jenis-User': 'admin' } })
    }

    if (res.data.StatusCode === 200) {
      success(props.editData ? 'Kunci berhasil diperbarui' : 'Kunci berhasil ditambahkan')
      emit('success')
      emit('close')
    } else {
      fail(res.data.Message || 'Terjadi kesalahan')
    }
  } catch (error: any) {
    fail(error.response?.data?.Message || 'Gagal menyimpan data kunci')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[1050] flex items-center justify-center p-4 sm:p-6">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="emit('close')"></div>
      
      <div class="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-visible animate-in zoom-in-95 duration-300">
        <!-- Header -->
        <div class="px-8 py-6 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white/50 backdrop-blur-xl z-10 rounded-t-[2.5rem]">
          <div class="flex items-center gap-4">
            <div class="size-12 rounded-2xl bg-bejo-50 text-bejo-500 flex items-center justify-center border border-bejo-100 shadow-inner">
              <Icon :icon="editData ? 'lucide:pencil' : 'lucide:plus'" class="size-6" />
            </div>
            <div>
              <h3 class="text-xl font-black text-slate-800 tracking-tight">{{ editData ? 'Edit Master Kunci' : 'Tambah Master Kunci' }}</h3>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Lengkapi form di bawah ini</p>
            </div>
          </div>
          <button @click="emit('close')" class="size-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-rose-500 transition-colors">
            <Icon icon="lucide:x" class="size-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-8 space-y-6">
          <div class="grid grid-cols-1 gap-6">
            <!-- Properti (Dropdown) -->
            <div class="space-y-2 produk-dropdown relative">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Properti <span class="text-red-500">*</span></label>
              <button 
                @click="isProdukOpen = !isProdukOpen"
                type="button"
                class="w-full h-12 px-4 flex items-center justify-between bg-slate-50 border rounded-xl text-sm font-bold transition-all focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50"
                :class="isProdukOpen ? 'border-bejo-500/50 text-slate-700' : 'border-slate-100 text-slate-600 hover:border-slate-300'"
              >
                <div class="flex items-center gap-3">
                  <Icon icon="lucide:building" class="size-5 text-slate-400" />
                  <span class="truncate">{{ form.Id_Produk ? (products.find(p => p.No_Id === form.Id_Produk)?.Nama_Produk || 'PILIH PROPERTI') : 'PILIH PROPERTI' }}</span>
                </div>
                <Icon icon="lucide:chevron-down" class="size-4 text-slate-400 transition-transform" :class="{ 'rotate-180': isProdukOpen }" />
              </button>

              <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <div v-show="isProdukOpen" class="absolute left-0 top-full mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[130] flex flex-col max-h-[250px]">
                  <div class="p-2 border-b border-slate-50 shrink-0">
                    <div class="relative">
                      <Icon icon="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <input 
                        v-model="produkSearch"
                        type="text" 
                        class="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-bejo-500/50"
                        placeholder="Cari properti..."
                      />
                    </div>
                  </div>
                  <div class="overflow-y-auto custom-scrollbar flex-1 p-2">
                    <button 
                      v-for="opt in filteredProducts" 
                      :key="opt.No_Id"
                      @click="selectProduk(opt.No_Id)"
                      class="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all text-left"
                      :class="form.Id_Produk === opt.No_Id ? 'bg-bejo-50 text-bejo-600' : 'text-slate-600 hover:bg-slate-50'"
                    >
                      <Icon icon="lucide:building" class="size-4 shrink-0" :class="form.Id_Produk === opt.No_Id ? 'text-bejo-500' : 'text-slate-400'" />
                      <span class="truncate">{{ opt.Nama_Produk }}</span>
                      <Icon v-if="form.Id_Produk === opt.No_Id" icon="lucide:check" class="size-4 ml-auto text-bejo-500 shrink-0" />
                    </button>
                    <div v-if="filteredProducts.length === 0" class="px-4 py-6 text-center text-xs font-black uppercase tracking-widest text-slate-400">
                      Tidak Ditemukan
                    </div>
                  </div>
                </div>
              </Transition>
            </div>

            <div class="space-y-2 relative">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Kunci <span class="text-red-500">*</span></label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                  <Icon icon="lucide:key" class="size-5" />
                </div>
                <input 
                  v-model="form.Nama_Kunci"
                  type="text" 
                  class="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all font-bold text-slate-700 text-sm placeholder:text-slate-300 placeholder:font-medium"
                  placeholder="Contoh: Kunci Utama B-02"
                />
              </div>
            </div>

            <!-- Status -->
            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
              <div class="flex items-center gap-3 h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl group transition-all" :class="{ 'border-bejo-500/30 bg-bejo-50/10': form.Status === 'aktif' }">
                <span class="text-[10px] font-black uppercase tracking-widest transition-colors" :class="form.Status === 'aktif' ? 'text-bejo-600' : 'text-slate-400'">
                  {{ form.Status === 'aktif' ? 'Aktif' : 'Nonaktif' }}
                </span>
                <label class="relative inline-flex items-center cursor-pointer ml-auto">
                  <input 
                    type="checkbox" 
                    :checked="form.Status === 'aktif'" 
                    @change="form.Status = ($event.target as any).checked ? 'aktif' : 'nonaktif'" 
                    class="sr-only peer"
                  >
                  <div class="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-bejo-500 shadow-inner"></div>
                </label>
              </div>
            </div>

          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-slate-50 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0 rounded-b-[2.5rem]">
          <button @click="emit('close')" type="button" class="px-6 h-12 bg-white hover:bg-slate-100 text-slate-500 rounded-xl font-bold transition-colors shadow-sm border border-slate-200">
            Batal
          </button>
          <button @click="handleSave" :disabled="isSaving" type="button" class="px-8 h-12 bg-bejo-500 hover:bg-bejo-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-bejo-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
            <Icon v-if="isSaving" icon="lucide:loader-2" class="size-5 animate-spin" />
            <Icon v-else icon="lucide:save" class="size-5" />
            <span>{{ isSaving ? 'Menyimpan...' : 'Simpan' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
