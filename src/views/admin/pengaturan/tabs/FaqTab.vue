<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { success, fail, confirm } from '@/utils/sweet-alert'
import api from '@/services/axios'

interface FAQ {
  No_Id: string
  Kode: string
  Judul: string
  Deskripsi: string
  Status: string
  isNew?: boolean
}

const faqs = ref<FAQ[]>([])
const isFaqLoading = ref(false)
const expandedId = ref<string | null>(null)
const editingId = ref<string | null>(null)
const savingId = ref<string | null>(null)

const toggleAccordion = (id: string) => {
  if (expandedId.value === id) {
    expandedId.value = null
    editingId.value = null
  } else {
    expandedId.value = id
    editingId.value = null
  }
}

const startEdit = (id: string) => {
  editingId.value = id
}

const cancelEdit = (faq: FAQ) => {
  if (faq.isNew) {
    faqs.value = faqs.value.filter(f => f.No_Id !== faq.No_Id)
    expandedId.value = null
  }
  editingId.value = null
}

const fetchFaqs = async () => {
  try {
    isFaqLoading.value = true
    const { data } = await api.get('/api/faq/getAll')
    if (data.StatusCode === 200) {
      faqs.value = data.Data
      if (faqs.value.length > 0 && !expandedId.value) {
        expandedId.value = faqs.value[0].No_Id
      }
    }
  } catch {
    console.error('Fetch FAQ error')
  } finally {
    isFaqLoading.value = false
  }
}

const toggleFaqStatus = async (faq: FAQ) => {
  const newStatus = faq.Status === 'aktif' ? 'nonaktif' : 'aktif'
  try {
    const payload = { ...faq, Status: newStatus }
    const { data } = await api.put(`/api/faq/update?no_id=${faq.No_Id}`, payload, { 
      headers: { 'X-Jenis-User': 'Admin' } 
    })
    if (data.StatusCode === 200) {
      faq.Status = newStatus
    }
  } catch {
    console.error('Gagal mengubah status FAQ')
  }
}

const addNewFaq = () => {
  const newFaq: FAQ = {
    No_Id: 'temp-' + Date.now(),
    Kode: `FAQ${String(faqs.value.length + 1).padStart(3, '0')}`,
    Judul: '',
    Deskripsi: '',
    Status: 'aktif',
    isNew: true
  }
  faqs.value.unshift(newFaq)
  expandedId.value = newFaq.No_Id
  editingId.value = newFaq.No_Id
}

const handleSaveFaq = async (faq: FAQ) => {
  if (!faq.Judul || !faq.Deskripsi) return fail('Harap isi judul dan deskripsi')
  
  try {
    savingId.value = faq.No_Id
    const payload = { ...faq }
    let res;
    
    if (faq.isNew) {
      res = await api.post('/api/faq/create', payload, { headers: { 'X-Jenis-User': 'Admin' } })
    } else {
      res = await api.put(`/api/faq/update?no_id=${faq.No_Id}`, payload, { headers: { 'X-Jenis-User': 'Admin' } })
    }
    
    if (res.data.StatusCode === 200) {
      success(`FAQ berhasil ${faq.isNew ? 'ditambahkan' : 'diperbarui'}`)
      editingId.value = null
      if (faq.isNew) {
        fetchFaqs() // Refresh to get real ID
      }
    }
  } catch {
    fail('Gagal menyimpan FAQ')
  } finally {
    savingId.value = null
  }
}

const handleDeleteFaq = (faq: FAQ) => {
  if (faq.isNew) {
    faqs.value = faqs.value.filter(f => f.No_Id !== faq.No_Id)
    if (expandedId.value === faq.No_Id) expandedId.value = null
    return
  }

  confirm('Apakah Anda yakin ingin menghapus FAQ ini?', async () => {
    try {
      const { data } = await api.delete(`/api/faq/delete?no_id=${faq.No_Id}`, { headers: { 'X-Jenis-User': 'Admin' } })
      if (data.StatusCode === 200) {
        success('FAQ berhasil dihapus')
        fetchFaqs()
      }
    } catch {
      fail('Gagal menghapus FAQ')
    }
  })
}

onMounted(() => {
  fetchFaqs()
})
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px]">
      <div class="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div class="flex items-center gap-3">
          <div class="size-8 rounded-lg bg-bejo-500 flex items-center justify-center text-white shadow-lg shadow-bejo-500/20">
            <Icon icon="lucide:help-circle" class="size-4" />
          </div>
          <h4 class="text-xs font-black text-slate-800 uppercase tracking-widest">Manajemen FAQ (Bantuan)</h4>
        </div>
        <button 
          @click="addNewFaq"
          class="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-500/20"
        >
          <Icon icon="lucide:plus" class="size-3.5" />
          Tambah FAQ
        </button>
      </div>
      
      <div class="p-4 md:p-8">
        <div v-if="isFaqLoading" class="flex flex-col items-center justify-center py-20 text-slate-400">
          <Icon icon="lucide:loader-2" class="size-10 animate-spin mb-4" />
          <span class="text-[10px] font-black uppercase tracking-widest">Memuat FAQ...</span>
        </div>
        
        <div v-else-if="faqs.length === 0" class="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
          <Icon icon="lucide:message-square-dashed" class="size-12 text-slate-300 mx-auto mb-4" />
          <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Belum ada FAQ yang dibuat</p>
        </div>

        <div v-else class="space-y-3">
          <div v-for="faq in faqs" :key="faq.No_Id" 
            class="bg-white border rounded-[1.5rem] transition-all duration-300 overflow-hidden"
            :class="expandedId === faq.No_Id ? 'border-bejo-200 shadow-xl shadow-bejo-500/5' : 'border-slate-100 hover:border-bejo-200 hover:bg-slate-50/30'"
          >
            <!-- Accordion Trigger -->
            <div 
              @click="toggleAccordion(faq.No_Id)"
              class="px-6 py-5 flex items-center justify-between cursor-pointer select-none group"
            >
              <div class="flex items-center gap-4 flex-1 min-w-0">
                <div class="size-8 rounded-xl flex items-center justify-center transition-all shrink-0" 
                  :class="expandedId === faq.No_Id ? 'bg-bejo-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-bejo-100 group-hover:text-bejo-500'"
                >
                  <Icon icon="lucide:file-question" class="size-4" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-tighter">{{ faq.Kode }}</span>
                    <span class="text-[13px] font-black text-slate-800 leading-none truncate block max-w-[200px] sm:max-w-md">{{ faq.Judul || '(Judul Kosong)' }}</span>
                  </div>
                  <span class="block text-[10px] font-bold text-slate-400 truncate" v-if="expandedId !== faq.No_Id">{{ faq.Deskripsi || 'Tidak ada deskripsi' }}</span>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <!-- Status Toggle -->
                <button 
                  @click.stop="toggleFaqStatus(faq)"
                  class="relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-sm"
                  :class="faq.Status === 'aktif' ? 'bg-green-500' : 'bg-slate-300'"
                >
                  <span class="sr-only">Toggle Status</span>
                  <span
                    aria-hidden="true"
                    class="pointer-events-none inline-block size-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="faq.Status === 'aktif' ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>

                <Icon 
                  icon="lucide:chevron-down" 
                  class="size-5 text-slate-300 transition-transform duration-300" 
                  :class="{ 'rotate-180 text-bejo-500': expandedId === faq.No_Id }" 
                />
              </div>
            </div>

            <!-- Accordion Content -->
            <div 
              v-show="expandedId === faq.No_Id"
              class="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <div class="bg-slate-50 rounded-2xl p-6 relative">
                <template v-if="editingId === faq.No_Id">
                  <div class="space-y-4">
                    <div>
                      <label class="label">Judul / Pertanyaan</label>
                      <input 
                        v-model="faq.Judul" 
                        type="text" 
                        class="field-input" 
                        placeholder="Apa yang ingin Anda tanyakan?" 
                      />
                    </div>

                    <div>
                      <label class="label">Deskripsi / Jawaban</label>
                      <textarea 
                        v-model="faq.Deskripsi" 
                        rows="6" 
                        class="w-full bg-white border border-slate-200 rounded-xl px-6 py-4 text-[13px] font-bold text-slate-700 focus:ring-4 focus:ring-green-500/5 focus:border-green-500 outline-none transition-all resize-none leading-relaxed custom-scroll"
                        placeholder="Berikan jawaban lengkap di sini..."
                      ></textarea>
                    </div>

                    <div class="flex items-center justify-end gap-3">
                      <button 
                        @click="cancelEdit(faq)"
                        class="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        Batal
                      </button>
                      <button 
                        @click="handleSaveFaq(faq)"
                        :disabled="savingId === faq.No_Id"
                        class="px-8 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                      >
                        <Icon v-if="savingId === faq.No_Id" icon="lucide:loader-2" class="size-3.5 animate-spin" />
                        <Icon v-else icon="lucide:save" class="size-3.5" />
                        {{ savingId === faq.No_Id ? 'Memproses...' : (faq.isNew ? 'Tambah FAQ' : 'Simpan Perubahan') }}
                      </button>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="relative group/view">
                    <div class="absolute top-0 right-0 flex gap-2">
                      <button 
                        @click="startEdit(faq.No_Id)"
                        class="size-8 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-green-600 hover:border-green-200 flex items-center justify-center transition-all shadow-sm active:scale-90"
                      >
                        <Icon icon="lucide:pencil" class="size-4" />
                      </button>
                      <button 
                        @click="handleDeleteFaq(faq)"
                        class="size-8 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-200 flex items-center justify-center transition-all shadow-sm active:scale-90"
                      >
                        <Icon icon="lucide:trash-2" class="size-4" />
                      </button>
                    </div>
                    
                    <div class="pr-20 space-y-4">
                      <div>
                        <h5 class="text-sm font-black text-slate-800 uppercase tracking-wide">{{ faq.Judul || '(Judul Kosong)' }}</h5>
                      </div>
                      <div>
                        <pre class="text-[12px] font-bold text-slate-600 whitespace-pre-wrap leading-relaxed font-sans">{{ faq.Deskripsi || '(Deskripsi Kosong)' }}</pre>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.label { @apply flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1; }
.field-input {
  @apply w-full bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-[13px] font-bold text-slate-700 focus:ring-4 focus:ring-green-500/5 focus:border-green-500 outline-none transition-all;
}

.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
