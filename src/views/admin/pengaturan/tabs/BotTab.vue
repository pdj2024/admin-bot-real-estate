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

const cancelEdit = () => {
  editingId.value = null
}

const fetchPrompts = async () => {
  try {
    isLoading.value = true
    const { data } = await api.get('/api/botPrompt/getAll?orderby=no_id&orderdir=desc', {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    if (data.StatusCode === 200) {
      prompts.value = data.Data
      if (prompts.value.length > 0 && !expandedId.value) {
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

const saveInlineEdit = async (prompt: BotPrompt) => {
  try {
    savingId.value = prompt.No_Id
    const payload = {
      Id_Company: prompt.Id_Company,
      Prompt_Type: prompt.Prompt_Type,
      Prompt_Text: prompt.Prompt_Text,
      Status: prompt.Status
    }
    const { data } = await api.put(`/api/botPrompt/update?no_id=${prompt.No_Id}`, payload, {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    if (data.StatusCode === 200) {
      success('Prompt berhasil diperbarui')
      editingId.value = null
    }
  } catch {
    fail('Gagal memperbarui prompt')
  } finally {
    savingId.value = null
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
      <div class="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div class="flex items-center gap-3">
          <div class="size-8 rounded-lg bg-bejo-500 flex items-center justify-center text-white shadow-lg shadow-bejo-500/20">
            <Icon icon="lucide:bot" class="size-4" />
          </div>
          <h4 class="text-xs font-black text-slate-800 uppercase tracking-widest">Konfigurasi Prompt AI Bot</h4>
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
            :class="expandedId === prompt.No_Id ? 'border-bejo-500/50 shadow-xl shadow-bejo-500/5' : 'border-slate-100 hover:border-bejo-500/20 hover:bg-slate-50/30'"
          >
            <!-- Accordion Trigger -->
            <div 
              @click="toggleAccordion(prompt.No_Id)"
              class="px-6 py-5 flex items-center justify-between cursor-pointer select-none group"
            >
              <div class="flex items-center gap-4 flex-1 min-w-0">
                <div class="size-8 rounded-xl flex items-center justify-center transition-all shrink-0" 
                  :class="expandedId === prompt.No_Id ? 'bg-bejo-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-bejo-100 group-hover:text-bejo-500'"
                >
                  <Icon icon="lucide:file-text" class="size-4" />
                </div>
                <div class="flex-1 min-w-0">
                  <span class="block text-[13px] font-black uppercase tracking-widest text-slate-800 leading-none">{{ prompt.Prompt_Type.replace(/_/g, ' ') }}</span>
                  <div class="max-w-[200px] sm:max-w-md" v-if="expandedId !== prompt.No_Id">
                    <span class="block text-[10px] font-bold text-slate-400 truncate mt-1.5">{{ prompt.Prompt_Text || 'Tidak ada deskripsi' }}</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <!-- Status Toggle -->
                <button 
                  @click.stop="toggleStatus(prompt)"
                  class="relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-sm"
                  :class="prompt.Status === 'aktif' ? 'bg-bejo-500' : 'bg-slate-300'"
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
                  :class="{ 'rotate-180 text-bejo-500': expandedId === prompt.No_Id }" 
                />
              </div>
            </div>

            <!-- Accordion Content -->
            <div 
              v-show="expandedId === prompt.No_Id"
              class="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <div class="bg-slate-50 rounded-2xl p-6 relative group/content">
                <template v-if="editingId === prompt.No_Id">
                  <textarea 
                    v-model="prompt.Prompt_Text"
                    rows="10"
                    class="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-[13px] font-bold text-slate-700 focus:ring-4 focus:ring-green-500/5 focus:border-green-500 outline-none transition-all resize-none leading-relaxed mb-4 custom-scroll"
                    placeholder="Tulis instruksi bot di sini..."
                  ></textarea>
                  
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 text-slate-400 italic">
                      <Icon icon="lucide:info" class="size-4" />
                      <span class="text-[10px] font-bold uppercase tracking-widest">Instruksi akan langsung diterapkan ke bot</span>
                    </div>
                    
                    <div class="flex items-center gap-3">
                      <button 
                        @click="cancelEdit"
                        class="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        Batal
                      </button>
                      <button 
                        @click="saveInlineEdit(prompt)"
                        :disabled="savingId === prompt.No_Id"
                        class="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                      >
                        <Icon v-if="savingId === prompt.No_Id" icon="lucide:loader-2" class="size-3 animate-spin" />
                        <Icon v-else icon="lucide:save" class="size-3" />
                        {{ savingId === prompt.No_Id ? 'Memproses...' : 'Perbarui Instruksi' }}
                      </button>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="relative group/view">
                    <div class="absolute top-0 right-0">
                      <button 
                        @click="startEdit(prompt.No_Id)"
                        class="size-8 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-bejo-500 hover:border-bejo-500/20 flex items-center justify-center transition-all shadow-sm active:scale-90"
                      >
                        <Icon icon="lucide:pencil" class="size-4" />
                      </button>
                    </div>
                    <div class="pr-10">
                      <pre class="text-[12px] font-bold text-slate-600 whitespace-pre-wrap leading-relaxed font-sans">{{ prompt.Prompt_Text || '(Kosong)' }}</pre>
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

.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
