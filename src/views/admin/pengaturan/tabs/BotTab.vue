<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { success, fail } from '@/utils/sweet-alert'
import api from '@/services/axios'

interface BotPrompt {
  No_Id: string
  Prompt_Type: string
  Prompt_Text: string
  Id_Company: string
  Status: string
}

const prompts = ref<BotPrompt[]>([])
const isLoading = ref(false)
const expandedId = ref<string | null>(null)

// Modal State
const isModalOpen = ref(false)
const editingPrompt = ref<BotPrompt | null>(null)
const editValue = ref('')
const isSaving = ref(false)

const toggleAccordion = (id: string) => {
  if (expandedId.value === id) {
    expandedId.value = null
  } else {
    expandedId.value = id
  }
}

const fetchPrompts = async () => {
  try {
    isLoading.value = true
    const { data } = await api.get('/api/botPrompt/getAll?orderby=no_id&orderdir=desc', {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    if (data.StatusCode === 200) {
      prompts.value = data.Data
      // Expand first one by default if any
      if (prompts.value.length > 0) {
        expandedId.value = prompts.value[0].No_Id
      }
    }
  } catch (error) {
    console.error('Fetch Prompts error:', error)
  } finally {
    isLoading.value = false
  }
}

const toggleStatus = async (prompt: BotPrompt) => {
  const newStatus = prompt.Status === 'aktif' ? 'nonaktif' : 'aktif'
  try {
    const payload = {
      Id_Company: prompt.Id_Company,
      Prompt_Type: prompt.Prompt_Type,
      Prompt_Text: prompt.Prompt_Text,
      Status: newStatus
    }
    const { data } = await api.put(`/api/botPrompt/update?no_id=${prompt.No_Id}`, payload, {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    if (data.StatusCode === 200) {
      prompt.Status = newStatus
    }
  } catch (error) {
    console.error('Toggle status error:', error)
  }
}

const openEditModal = (prompt: BotPrompt) => {
  editingPrompt.value = prompt
  editValue.value = prompt.Prompt_Text || ''
  isModalOpen.value = true
}

const closeEditModal = () => {
  isModalOpen.value = false
  editingPrompt.value = null
  editValue.value = ''
}

const saveEdit = async () => {
  if (!editingPrompt.value) return
  
  try {
    isSaving.value = true
    const prompt = editingPrompt.value
    const payload = {
      Id_Company: prompt.Id_Company,
      Prompt_Type: prompt.Prompt_Type,
      Prompt_Text: editValue.value,
      Status: prompt.Status
    }
    const { data } = await api.put(`/api/botPrompt/update?no_id=${prompt.No_Id}`, payload, {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    if (data.StatusCode === 200) {
      const target = prompts.value.find(p => p.No_Id === prompt.No_Id)
      if (target) target.Prompt_Text = editValue.value
      success('Prompt berhasil diperbarui')
      closeEditModal()
    }
  } catch {
    fail('Gagal memperbarui prompt')
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  fetchPrompts()
})
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px]">
      <!-- Tab Header -->
      <div class="px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="size-10 rounded-2xl bg-bejo-600 flex items-center justify-center text-white shadow-lg shadow-bejo-600/20">
            <Icon icon="lucide:bot" class="size-5" />
          </div>
          <div>
            <h4 class="text-sm font-black text-slate-800 uppercase tracking-widest leading-none">Konfigurasi Prompt AI Bot</h4>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">Atur instruksi sistem dan gaya komunikasi bot</p>
          </div>
        </div>
      </div>
      
      <div class="p-4 md:p-8">
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 text-slate-400">
          <Icon icon="lucide:loader-2" class="size-10 animate-spin mb-4" />
          <span class="text-[10px] font-black uppercase tracking-widest">Sinkronisasi Prompt...</span>
        </div>
        
        <div v-else class="space-y-3">
          <div v-for="prompt in prompts" :key="prompt.No_Id" 
            class="bg-white border rounded-[1.5rem] transition-all duration-300 overflow-hidden"
            :class="expandedId === prompt.No_Id ? 'border-bejo-200 shadow-xl shadow-bejo-600/5' : 'border-slate-100 hover:border-bejo-100 hover:bg-slate-50/30'"
          >
            <!-- Accordion Trigger -->
            <div 
              @click="toggleAccordion(prompt.No_Id)"
              class="px-6 py-5 flex items-center justify-between cursor-pointer select-none group"
            >
              <div class="flex items-center gap-4 flex-1 min-w-0">
                <div class="size-8 rounded-xl flex items-center justify-center transition-all shrink-0" 
                  :class="expandedId === prompt.No_Id ? 'bg-bejo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-bejo-100 group-hover:text-bejo-600'"
                >
                  <Icon icon="lucide:file-text" class="size-4" />
                </div>
                <div class="flex-1 min-w-0">
                  <span class="block text-[11px] font-black uppercase tracking-widest text-slate-800">{{ prompt.Prompt_Type.replace(/_/g, ' ') }}</span>
                  <span class="block text-[10px] font-bold text-slate-400 truncate mt-0.5" v-if="expandedId !== prompt.No_Id">{{ prompt.Prompt_Text || 'Tidak ada deskripsi' }}</span>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <!-- Status Toggle -->
                <button 
                  @click.stop="toggleStatus(prompt)"
                  class="relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-sm"
                  :class="prompt.Status === 'aktif' ? 'bg-green-500' : 'bg-slate-300'"
                >
                  <span class="sr-only">Toggle Status</span>
                  <span
                    aria-hidden="true"
                    class="pointer-events-none inline-block size-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="prompt.Status === 'aktif' ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>

                <Icon 
                  icon="lucide:chevron-down" 
                  class="size-5 text-slate-300 transition-transform duration-300" 
                  :class="{ 'rotate-180 text-bejo-600': expandedId === prompt.No_Id }" 
                />
              </div>
            </div>

            <!-- Accordion Content -->
            <div 
              v-show="expandedId === prompt.No_Id"
              class="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <div class="bg-slate-50 rounded-2xl p-6 relative group/content">
                <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/content:opacity-100 transition-all">
                   <button 
                    @click="openEditModal(prompt)"
                    class="size-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-bejo-600 hover:border-bejo-200 transition-all shadow-sm active:scale-95 flex items-center justify-center"
                   >
                    <Icon icon="lucide:pencil" class="size-4" />
                   </button>
                </div>
                
                <pre class="text-[11px] font-bold text-slate-600 whitespace-pre-wrap leading-relaxed font-sans">{{ prompt.Prompt_Text || '(Kosong)' }}</pre>
                
                <div class="mt-6 flex justify-end">
                  <button 
                    @click="openEditModal(prompt)"
                    class="px-5 py-2 bg-bejo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-bejo-600/20 hover:bg-bejo-700 transition-all active:scale-95"
                  >
                    Perbarui Instruksi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <Transition 
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isModalOpen" class="fixed inset-0 z-[1200] flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" @click="closeEditModal"></div>
        
        <div class="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-300">
          <div class="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="size-12 rounded-2xl bg-bejo-100 text-bejo-600 flex items-center justify-center">
                <Icon icon="lucide:file-edit" class="size-6" />
              </div>
              <div>
                <h3 class="text-lg font-black text-slate-800 uppercase tracking-widest leading-none">Edit {{ editingPrompt?.Prompt_Type.replace(/_/g, ' ') }}</h3>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">Modifikasi instruksi kecerdasan buatan</p>
              </div>
            </div>
            <button @click="closeEditModal" class="size-10 rounded-xl hover:bg-slate-50 text-slate-400 transition-all flex items-center justify-center">
              <Icon icon="lucide:x" class="size-6" />
            </button>
          </div>
          
          <div class="p-10">
            <div class="bg-slate-50 rounded-3xl p-1 border border-slate-100 focus-within:border-bejo-200 focus-within:ring-8 focus-within:ring-bejo-600/5 transition-all">
              <textarea 
                v-model="editValue" 
                rows="12" 
                class="w-full bg-transparent border-none px-6 py-6 text-sm font-bold text-slate-700 focus:ring-0 resize-none leading-relaxed"
                placeholder="Tulis instruksi mendalam untuk bot di sini..."
              ></textarea>
            </div>
            
            <div class="mt-10 flex items-center justify-between">
              <div class="flex items-center gap-2 text-slate-400 italic">
                <Icon icon="lucide:info" class="size-4" />
                <span class="text-[10px] font-bold uppercase tracking-widest">Instruksi akan langsung diterapkan ke bot</span>
              </div>
              
              <div class="flex gap-3">
                <button @click="closeEditModal" class="px-8 py-3 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">Batal</button>
                <button 
                  @click="() => saveEdit()" 
                  :disabled="isSaving"
                  class="px-10 py-3 bg-bejo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-bejo-600/25 hover:bg-bejo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  <Icon v-if="isSaving" icon="lucide:loader-2" class="size-4 animate-spin" />
                  <Icon v-else icon="lucide:save" class="size-4" />
                  {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

pre {
  font-family: inherit;
}

.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>


<style scoped>
@reference "@/assets/css/style.css";

pre {
  font-family: inherit;
}
</style>
