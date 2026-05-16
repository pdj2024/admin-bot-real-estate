<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'
import { success, fail } from '@/utils/sweet-alert'

const props = defineProps<{
  show: boolean
  editData: any | null
}>()

const emit = defineEmits(['close', 'success'])

const isSaving = ref(false)
const isTipeOpen = ref(false)
const tipeSearch = ref('')
const form = reactive({
  Nama: '',
  Kode: '',
  Tipe: 'class',
  Status: 'aktif',
  Keterangan: ''
})

const tipeOptions = [
  { label: 'LUCIDE / ICONIFY', value: 'iconify', icon: 'lucide:smile' },
  { label: 'CSS CLASS', value: 'class', icon: 'lucide:code-2' },
  { label: 'SVG CODE', value: 'svg', icon: 'lucide:file-code-2' },
  { label: 'IMAGE URL', value: 'url', icon: 'lucide:image' }
]

const filteredTipeOptions = computed(() => {
  if (!tipeSearch.value) return tipeOptions
  return tipeOptions.filter(opt => 
    opt.label.toLowerCase().includes(tipeSearch.value.toLowerCase())
  )
})

const selectTipe = (val: string) => {
  form.Tipe = val
  isTipeOpen.value = false
  tipeSearch.value = ''
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.tipe-dropdown')) isTipeOpen.value = false
}

import { onMounted, onBeforeUnmount, computed } from 'vue'

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.editData) {
      Object.assign(form, {
        Nama: props.editData.Nama || '',
        Kode: props.editData.Kode || '',
        Tipe: props.editData.Tipe || 'class',
        Status: props.editData.Status || 'aktif',
        Keterangan: props.editData.Keterangan || ''
      })
    } else {
      resetForm()
    }
  }
})

const resetForm = () => {
  Object.assign(form, {
    Nama: '',
    Kode: '',
    Tipe: 'class',
    Status: 'aktif',
    Keterangan: ''
  })
}

const handleSave = async () => {
  if (!form.Nama) return fail('Nama icon wajib diisi!')
  
  isSaving.value = true
  try {
    const payload = { ...form }
    let res
    if (props.editData) {
      res = await api.put('/api/masIcon/update', payload, { params: { no_id: props.editData.No_Id } })
    } else {
      res = await api.post('/api/masIcon/create', payload)
    }

    if (res.data.StatusCode === 200) {
      success(props.editData ? 'Icon berhasil diperbarui' : 'Icon berhasil ditambahkan')
      emit('success')
      emit('close')
    } else {
      fail(res.data.Message || 'Terjadi kesalahan')
    }
  } catch (err: any) {
    fail(err.response?.data?.Message || 'Terjadi kesalahan sistem')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="show" class="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="emit('close')"></div>

      <!-- Modal Content -->
      <div class="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <!-- Header -->
        <div class="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div class="flex items-center gap-4">
            <div class="size-10 rounded-xl bg-bejo-600 flex items-center justify-center text-white shadow-lg shadow-bejo-600/20">
              <Icon :icon="editData ? 'lucide:edit-3' : 'lucide:plus'" class="size-5" />
            </div>
            <div>
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">{{ editData ? 'Edit Icon' : 'Tambah Icon Baru' }}</h3>
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Konfigurasi Icon Aplikasi</p>
            </div>
          </div>
          <button @click="emit('close')" class="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white hover:text-red-500 transition-all">
            <Icon icon="lucide:x" class="size-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-8 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Nama -->
            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Icon / Class / URL</label>
              <input 
                v-model="form.Nama"
                type="text" 
                class="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all font-bold text-slate-700 text-sm"
                placeholder="Misal: home, user, fa fa-home, atau URL gambar"
              />
            </div>

            <!-- Tipe -->
            <div class="space-y-2 relative tipe-dropdown">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipe Icon</label>
              <button 
                @click="isTipeOpen = !isTipeOpen"
                type="button"
                class="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all flex items-center justify-between group"
                :class="{ 'ring-4 ring-bejo-500/10 border-bejo-500/50': isTipeOpen }"
              >
                <div class="flex items-center gap-3">
                  <div class="size-6 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-bejo-600 shadow-sm">
                    <Icon :icon="tipeOptions.find(o => o.value === form.Tipe)?.icon || 'lucide:help-circle'" class="size-3.5" />
                  </div>
                  <span class="font-bold text-slate-700 text-sm">{{ tipeOptions.find(o => o.value === form.Tipe)?.label }}</span>
                </div>
                <Icon icon="lucide:chevron-down" class="size-4 text-slate-400 transition-transform duration-300" :class="{ 'rotate-180': isTipeOpen }" />
              </button>

              <!-- Dropdown Menu -->
              <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-100 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <div v-if="isTipeOpen" class="absolute left-0 top-full mt-2 w-full bg-white border border-slate-100 rounded-3xl shadow-2xl z-[160] overflow-hidden p-2">
                  <div class="relative mb-2 px-2 pt-2">
                    <Icon icon="lucide:search" class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                    <input 
                      v-model="tipeSearch"
                      type="text" 
                      class="w-full h-11 ps-10 pe-4 bg-slate-50 border border-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:ring-2 focus:ring-bejo-500/10 transition-all"
                      placeholder="CARI TIPE..."
                      @click.stop
                    />
                  </div>
                  <div class="max-h-60 overflow-y-auto custom-scrollbar">
                    <button 
                      v-for="opt in filteredTipeOptions" :key="opt.value"
                      @click="selectTipe(opt.value)"
                      type="button"
                      class="w-full px-4 py-3.5 flex items-center justify-between rounded-2xl transition-all group/item"
                      :class="form.Tipe === opt.value ? 'bg-bejo-50/50' : 'hover:bg-slate-50'"
                    >
                      <div class="flex items-center gap-3">
                        <div class="size-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover/item:text-bejo-600 transition-colors shadow-sm">
                          <Icon :icon="opt.icon" class="size-4" />
                        </div>
                        <span class="text-[10px] font-black uppercase tracking-widest transition-colors" :class="form.Tipe === opt.value ? 'text-bejo-600' : 'text-slate-600 group-hover/item:text-slate-900'">
                          {{ opt.label }}
                        </span>
                      </div>
                      <Icon v-if="form.Tipe === opt.value" icon="lucide:check" class="size-4 text-bejo-600" />
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Kode (SVG Only) -->
          <div v-if="form.Tipe === 'svg'" class="space-y-2 animate-in slide-in-from-top-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kode SVG</label>
            <textarea 
              v-model="form.Kode"
              rows="4"
              class="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all font-mono text-xs text-slate-700"
              placeholder="<svg>...</svg>"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <!-- Keterangan -->
            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Keterangan</label>
              <input 
                v-model="form.Keterangan"
                type="text" 
                class="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all font-bold text-slate-700 text-sm"
                placeholder="Catatan singkat..."
              />
            </div>
          </div>

          <!-- Live Preview Box -->
          <div class="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Live Preview</p>
            <div class="flex items-center justify-center">
              <div class="size-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-bejo-600 shadow-sm">
                <template v-if="form.Tipe === 'class'">
                  <i :class="form.Nama" class="text-3xl"></i>
                </template>
                <template v-else-if="form.Tipe === 'svg'">
                  <div v-html="form.Kode" class="size-10 flex items-center justify-center"></div>
                </template>
                <template v-else-if="form.Tipe === 'url'">
                  <img :src="form.Nama" class="size-10 object-contain" />
                </template>
                <template v-else>
                  <Icon :icon="form.Nama.includes(':') ? form.Nama : `lucide:${form.Nama}`" class="size-10" />
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-8 py-6 border-t border-slate-50 bg-slate-50/30 flex items-center justify-end gap-4">
          <button @click="emit('close')" class="px-6 py-3 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all">
            Batal
          </button>
          <button 
            @click="handleSave"
            :disabled="isSaving"
            class="px-8 py-3 bg-bejo-600 hover:bg-bejo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-bejo-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Icon v-if="isSaving" icon="lucide:loader-2" class="size-4 animate-spin" />
            {{ isSaving ? 'Menyimpan...' : 'Simpan Icon' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
