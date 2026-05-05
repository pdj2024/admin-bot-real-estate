<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { success, fail, confirm } from '@/utils/sweet-alert'
import api from '@/services/axios'

interface FAQ {
  No_Id: string
  Kode: string
  Judul: string
  Deskripsi: string
  Status: string
}

const faqs = ref<FAQ[]>([])
const isFaqLoading = ref(false)
const showFaqModal = ref(false)
const isEditingFaq = ref(false)
const currentFaq = reactive<FAQ>({
  No_Id: '',
  Kode: '',
  Judul: '',
  Deskripsi: '',
  Status: 'aktif'
})

const fetchFaqs = async () => {
  try {
    isFaqLoading.value = true
    const { data } = await api.get('/api/faq/getAll')
    if (data.StatusCode === 200) {
      faqs.value = data.Data
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
    // Silent fail or handle locally without popup
    console.error('Gagal mengubah status FAQ')
  }
}

const openFaqModal = (faq?: FAQ) => {
  if (faq) {
    isEditingFaq.value = true
    Object.assign(currentFaq, faq)
  } else {
    isEditingFaq.value = false
    Object.assign(currentFaq, {
      No_Id: '',
      Kode: `FAQ${String(faqs.value.length + 1).padStart(3, '0')}`,
      Judul: '',
      Deskripsi: '',
      Status: 'aktif'
    })
  }
  showFaqModal.value = true
}

const handleSaveFaq = async () => {
  if (!currentFaq.Judul || !currentFaq.Deskripsi) return fail('Harap isi judul dan deskripsi')
  
  try {
    const payload = { ...currentFaq }
    let res;
    
    if (isEditingFaq.value) {
      res = await api.put(`/api/faq/update?no_id=${currentFaq.No_Id}`, payload, { headers: { 'X-Jenis-User': 'Admin' } })
    } else {
      res = await api.post('/api/faq/create', payload, { headers: { 'X-Jenis-User': 'Admin' } })
    }
    
    if (res.data.StatusCode === 200) {
      success(`FAQ berhasil ${isEditingFaq.value ? 'diperbarui' : 'ditambahkan'}`)
      showFaqModal.value = false
      fetchFaqs()
    }
  } catch {
    fail('Gagal menyimpan FAQ')
  }
}

const handleDeleteFaq = (id: string) => {
  confirm('Apakah Anda yakin ingin menghapus FAQ ini?', async () => {
    try {
      const { data } = await api.delete(`/api/faq/delete?no_id=${id}`, { headers: { 'X-Jenis-User': 'Admin' } })
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
    <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
      <div class="px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="size-8 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Icon icon="lucide:help-circle" class="size-4" />
          </div>
          <h4 class="text-xs font-black text-slate-800 uppercase tracking-widest">Manajemen FAQ (Bantuan)</h4>
        </div>
        <button 
          @click="openFaqModal()"
          class="px-5 py-2.5 bg-bejo-600 hover:bg-bejo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-bejo-600/20"
        >
          <Icon icon="lucide:plus" class="size-3.5" />
          Tambah FAQ
        </button>
      </div>
      
      <div class="p-8">
        <div v-if="isFaqLoading" class="flex flex-col items-center justify-center py-12 text-slate-400">
          <Icon icon="lucide:loader-2" class="size-10 animate-spin mb-4" />
          <span class="text-xs font-black uppercase tracking-widest">Memuat FAQ...</span>
        </div>
        
        <div v-else-if="faqs.length === 0" class="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Icon icon="lucide:message-square-dashed" class="size-12 text-slate-300 mx-auto mb-4" />
          <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Belum ada FAQ yang dibuat</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="faq in faqs" :key="faq.No_Id" class="p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] group hover:bg-white hover:border-bejo-200 transition-all duration-300">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="px-2.5 py-1 bg-bejo-100 text-bejo-700 rounded-lg text-[10px] font-black uppercase tracking-tighter">{{ faq.Kode }}</div>
                
                <!-- Proper Toggle Switch -->
                <button 
                  @click.stop="toggleFaqStatus(faq)"
                  class="relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-bejo-600 focus:ring-offset-2 shadow-sm"
                  :class="faq.Status === 'aktif' ? 'bg-bejo-600' : 'bg-slate-300'"
                >
                  <span class="sr-only">Toggle Status</span>
                  <span
                    aria-hidden="true"
                    class="pointer-events-none inline-block size-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="faq.Status === 'aktif' ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
                <span class="text-[10px] font-black uppercase tracking-tighter" :class="faq.Status === 'aktif' ? 'text-bejo-600' : 'text-slate-400'">{{ faq.Status }}</span>
              </div>
              
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button @click="openFaqModal(faq)" class="size-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-bejo-600 hover:border-bejo-200 transition-colors shadow-sm">
                  <Icon icon="lucide:edit-3" class="size-4" />
                </button>
                <button @click="handleDeleteFaq(faq.No_Id)" class="size-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm">
                  <Icon icon="lucide:trash-2" class="size-4" />
                </button>
              </div>
            </div>
            
            <h5 class="text-sm font-black text-slate-800 mb-2 leading-tight">{{ faq.Judul }}</h5>
            <p class="text-[11px] font-medium text-slate-400 line-clamp-2 leading-relaxed">{{ faq.Deskripsi }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- FAQ Modal -->
    <Transition name="fade">
      <div v-if="showFaqModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <div class="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
          <div class="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-xl bg-bejo-600 flex items-center justify-center text-white shadow-lg shadow-bejo-600/20">
                <Icon :icon="isEditingFaq ? 'lucide:edit-3' : 'lucide:plus'" class="size-5" />
              </div>
              <div>
                <h4 class="text-sm font-black text-slate-800 uppercase tracking-widest">{{ isEditingFaq ? 'Edit FAQ' : 'Tambah FAQ Baru' }}</h4>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Lengkapi detail pertanyaan bantuan</p>
              </div>
            </div>
            <button @click="showFaqModal = false" class="size-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
              <Icon icon="lucide:x" class="size-5" />
            </button>
          </div>

          <div class="p-8 space-y-6">
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-1">
                <label class="label">Kode FAQ</label>
                <input v-model="currentFaq.Kode" type="text" class="field-input" placeholder="e.g. FAQ001" readonly />
              </div>
              <div class="col-span-1">
                <label class="label">Status</label>
                <select v-model="currentFaq.Status" class="field-input">
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Non-Aktif</option>
                </select>
              </div>
            </div>

            <div>
              <label class="label">Judul / Pertanyaan</label>
              <input v-model="currentFaq.Judul" type="text" class="field-input" placeholder="Apa yang ingin Anda tanyakan?" />
            </div>

            <div>
              <label class="label">Deskripsi / Jawaban</label>
              <textarea 
                v-model="currentFaq.Deskripsi" 
                rows="5" 
                class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-bejo-600/5 focus:border-bejo-600 transition-all resize-none leading-relaxed"
                placeholder="Berikan jawaban lengkap di sini..."
              ></textarea>
            </div>
          </div>

          <div class="px-8 py-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-end gap-3">
            <button @click="showFaqModal = false" class="px-6 py-3 text-[10px] font-black text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest">Batal</button>
            <button @click="handleSaveFaq" class="px-8 py-3 bg-bejo-600 hover:bg-bejo-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-bejo-600/20 active:scale-95">
              {{ isEditingFaq ? 'Simpan Perubahan' : 'Tambahkan FAQ' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.label { @apply flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1; }
.field-input {
  @apply w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-bejo-600/5 focus:border-bejo-600 outline-none transition-all;
}
.field-input:focus {
  @apply bg-white;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
