<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'
import GuestLayout from '@/layouts/guest.vue'
import { useSettings } from '@/stores/settings'

const settingsStore = useSettings()

interface FAQ {
  No_Id: string
  Kode: string
  Judul: string
  Deskripsi: string
  Status: string
}

const faqs = ref<FAQ[]>([])
const isLoading = ref(true)
const activeFaq = ref<string | null>(null)
const searchQuery = ref('')

const fetchFaqs = async () => {
  try {
    isLoading.value = true
    const { data } = await api.get('/api/faq/getAll')
    if (data.StatusCode === 200) {
      faqs.value = data.Data.filter((f: FAQ) => f.Status === 'aktif')
    }
  } catch (err) {
    console.error('Fetch FAQ error:', err)
  } finally {
    isLoading.value = false
  }
}

const filteredFaqs = computed(() => {
  if (!searchQuery.value) return faqs.value
  const query = searchQuery.value.toLowerCase()
  return faqs.value.filter(faq => 
    faq.Judul.toLowerCase().includes(query) || 
    faq.Deskripsi.toLowerCase().includes(query)
  )
})

const toggleFaq = (id: string) => {
  activeFaq.value = activeFaq.value === id ? null : id
}

onMounted(() => {
  fetchFaqs()
})
</script>

<template>
  <GuestLayout>
    <div class="min-h-screen bg-slate-50/30 relative overflow-hidden">
      <!-- Background Decorations -->
      <div class="absolute top-0 right-0 w-1/2 h-screen bg-gradient-to-l from-bejo-50/30 via-transparent to-transparent pointer-events-none"></div>
      <div class="absolute -right-20 -top-20 size-[500px] bg-gradient-to-br from-bejo-100/40 via-bejo-200/20 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none"></div>
      <div class="absolute -left-20 top-1/2 size-96 bg-gradient-to-tr from-bejo-50/40 to-transparent rounded-full blur-3xl opacity-30 pointer-events-none"></div>

      <div class="container mx-auto px-4 py-16 md:py-24 relative z-10 max-w-5xl">
        <!-- Header Section -->
        <div class="flex flex-col items-center text-center mb-16">

          
          <h1 class="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1]">
            Ada yang bisa kami <br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-bejo-500 via-bejo-700 to-bejo-900">Bantu Jawaban?</span>
          </h1>

          <p class="text-slate-500 text-lg font-medium max-w-2xl mb-12 leading-relaxed">
            Temukan informasi lengkap mengenai layanan {{ settingsStore.business.appName }}. Kami merangkum pertanyaan yang paling sering diajukan untuk memudahkan Anda.
          </p>

          <!-- Search Bar -->
          <div class="w-full max-w-2xl relative group">
            <div class="absolute inset-0 bg-bejo-500/20 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            <div class="relative bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex items-center p-2 focus-within:border-bejo-500 transition-all">
              <div class="size-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-focus-within:text-bejo-500 transition-colors shrink-0 ml-1">
                <Icon icon="lucide:search" class="size-5" />
              </div>
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Cari topik atau pertanyaan..."
                class="flex-1 bg-transparent border-none outline-none px-4 py-2 text-slate-700 font-bold placeholder:text-slate-400 placeholder:font-medium"
              />
              <button 
                v-if="searchQuery"
                @click="searchQuery = ''"
                class="size-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors mr-1"
              >
                <Icon icon="lucide:x" class="size-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- FAQ Grid -->
        <div class="grid gap-4 md:gap-6">
          <!-- Loading State -->
          <template v-if="isLoading">
            <div v-for="i in 5" :key="i" class="bg-white rounded-[2rem] p-6 border border-slate-100 animate-pulse">
              <div class="flex items-center gap-4">
                <div class="size-12 bg-slate-100 rounded-2xl"></div>
                <div class="h-4 bg-slate-100 rounded w-1/3"></div>
              </div>
            </div>
          </template>

          <!-- Empty State -->
          <div v-else-if="filteredFaqs.length === 0" class="text-center py-24 bg-white/60 backdrop-blur-md rounded-[3rem] border border-slate-200/50 shadow-xl shadow-slate-200/20">
            <div class="size-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-300">
              <Icon icon="lucide:search-x" class="size-12" />
            </div>
            <h3 class="text-xl font-black text-slate-900 mb-2">Tidak Menemukan Hasil</h3>
            <p class="text-slate-500 font-medium max-w-xs mx-auto">Maaf, kami tidak menemukan jawaban untuk "{{ searchQuery }}". Coba kata kunci lain.</p>
          </div>

          <!-- FAQ Items -->
          <div 
            v-for="faq in filteredFaqs" 
            :key="faq.No_Id"
            class="group bg-white rounded-[2rem] border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-bejo-500/10 hover:border-bejo-300 transition-all duration-500 overflow-hidden"
            :class="{ 'ring-2 ring-bejo-500/20 border-bejo-400 shadow-xl shadow-bejo-500/10': activeFaq === faq.No_Id }"
          >
            <button 
              @click="toggleFaq(faq.No_Id)"
              class="w-full px-8 py-6 flex items-center justify-between text-left gap-6"
            >
              <div class="flex items-center gap-6">
                <div 
                  class="size-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500"
                  :class="activeFaq === faq.No_Id ? 'bg-bejo-600 text-white shadow-lg shadow-bejo-600/40 rotate-12 scale-110' : 'bg-slate-100 text-slate-500 group-hover:bg-bejo-50 group-hover:text-bejo-600'"
                >
                  <span class="text-xs font-black uppercase tracking-tighter">{{ faq.Kode.replace('FAQ', '') }}</span>
                </div>
                <h3 class="font-black text-slate-800 text-base md:text-xl tracking-tight leading-tight group-hover:text-bejo-700 transition-colors">{{ faq.Judul }}</h3>
              </div>
              <div 
                class="size-10 rounded-full flex items-center justify-center transition-all duration-500 shrink-0"
                :class="activeFaq === faq.No_Id ? 'bg-bejo-100 text-bejo-600 rotate-180' : 'bg-slate-50 text-slate-400 group-hover:text-slate-800 group-hover:bg-slate-100'"
              >
                <Icon icon="lucide:chevron-down" class="size-6" />
              </div>
            </button>

            <div 
              class="grid transition-all duration-500 ease-in-out"
              :style="{ gridTemplateRows: activeFaq === faq.No_Id ? '1fr' : '0fr' }"
            >
              <div class="overflow-hidden">
                <div class="px-8 pb-8 pt-0">
                  <div class="p-6 bg-slate-50/80 rounded-[1.5rem] border border-slate-200/50 text-slate-600 text-sm md:text-base font-medium leading-relaxed ml-0 md:ml-20">
                    {{ faq.Deskripsi }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Support CTA -->
        <div class="mt-24">
          <div class="bg-slate-900 rounded-[3rem] p-8 md:p-16 text-center relative overflow-hidden shadow-2xl shadow-slate-900/40 group">
            <!-- Background Elements -->
            <div class="absolute top-0 right-0 w-1/2 h-full bg-bejo-600 opacity-20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:opacity-40 transition-opacity duration-1000"></div>
            <div class="absolute bottom-0 left-0 size-64 bg-bejo-400 opacity-10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
            
            <div class="relative z-10 flex flex-col items-center">
              <div class="size-20 bg-bejo-600 rounded-[2rem] flex items-center justify-center text-white mb-8 shadow-xl shadow-bejo-600/30">
                <Icon icon="lucide:message-square" class="size-10" />
              </div>
              
              <h2 class="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">Masih butuh jawaban khusus?</h2>
              <p class="text-slate-400 text-lg font-medium max-w-xl mb-12">
                Jangan ragu untuk berkonsultasi langsung dengan tim ahli kami. Kami siap membantu Anda menemukan hunian impian 24/7.
              </p>
              
              <div class="flex flex-col sm:flex-row items-center gap-4">
                <a 
                  :href="'https://wa.me/' + (settingsStore.business.whatsapp || '62895353837000')"
                  target="_blank"
                  class="flex items-center gap-3 px-10 py-5 bg-bejo-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-bejo-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-bejo-600/40"
                >
                  <Icon icon="logos:whatsapp-icon" class="size-6 brightness-0 invert" />
                  Hubungi Via WhatsApp
                </a>
                <RouterLink 
                  to="/kontak"
                  class="flex items-center gap-3 px-10 py-5 bg-white/10 text-white border border-white/20 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-white hover:text-slate-900 hover:scale-105 active:scale-95 transition-all backdrop-blur-sm"
                >
                  Lihat Kontak Lengkap
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </GuestLayout>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.container {
  max-width: 1140px;
}

/* Custom Scrollbar for the input */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
