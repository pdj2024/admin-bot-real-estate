<script setup lang="ts">
import { useSettings } from '@/stores/settings'
import { Icon } from '@iconify/vue'
import { success } from '@/utils/sweet-alert'

const settingsStore = useSettings()
const { business } = settingsStore

const handleSave = () => {
  settingsStore.saveBusiness()
  success('Informasi bisnis berhasil diperbarui. Halaman guest akan segera sinkron.')
}
</script>

<template>
  <div class="space-y-6">
    <!-- General Info -->
    <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
      <div class="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div class="flex items-center gap-3">
          <div class="size-8 rounded-lg bg-bejo-600 flex items-center justify-center text-white shadow-lg shadow-bejo-600/20">
            <Icon icon="lucide:building-2" class="size-4" />
          </div>
          <h4 class="text-sm font-black text-slate-800 uppercase tracking-widest">Identitas Perusahaan</h4>
        </div>
      </div>
      
      <div class="p-8 space-y-6">
        <div>
          <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Deskripsi Bisnis (Footer)</label>
          <textarea 
            v-model="business.description" 
            rows="3" 
            class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-bejo-600/10 focus:border-bejo-600 transition-all resize-none"
            placeholder="Tuliskan sekilas tentang bisnis Anda..."
          ></textarea>
        </div>

        <div>
          <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Alamat Kantor Pusat</label>
          <div class="relative">
            <Icon icon="lucide:map-pin" class="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input 
              v-model="business.address" 
              type="text" 
              class="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-bejo-600/10 focus:border-bejo-600 transition-all"
              placeholder="Jl. Contoh No. 123..."
            />
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Link Google Maps</label>
          <div class="relative">
            <Icon icon="lucide:map" class="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input 
              v-model="business.mapUrl" 
              type="text" 
              class="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-bejo-600/10 focus:border-bejo-600 transition-all"
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Contact & Social Media -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-8 py-5 border-b border-slate-50 bg-slate-50/50">
          <h4 class="text-sm font-black text-slate-800 uppercase tracking-widest">Kontak Resmi</h4>
        </div>
        <div class="p-8 space-y-4">
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">WhatsApp (Tanpa +)</label>
            <input v-model="business.whatsapp" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-bejo-600 outline-none" placeholder="628123..." />
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Telepon Tampilan</label>
            <input v-model="business.phone" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-bejo-600 outline-none" placeholder="+62 8..." />
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Bisnis</label>
            <input v-model="business.email" type="email" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-bejo-600 outline-none" placeholder="info@company.com" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-8 py-5 border-b border-slate-50 bg-slate-50/50">
          <h4 class="text-sm font-black text-slate-800 uppercase tracking-widest">Sosial Media</h4>
        </div>
        <div class="p-8 space-y-4">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
              <Icon icon="lucide:instagram" class="size-5" />
            </div>
            <input v-model="business.instagram" type="text" class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-pink-500 outline-none" placeholder="Link Instagram" />
          </div>
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Icon icon="lucide:facebook" class="size-5" />
            </div>
            <input v-model="business.facebook" type="text" class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-blue-500 outline-none" placeholder="Link Facebook" />
          </div>
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Icon icon="lucide:twitter" class="size-5" />
            </div>
            <input v-model="business.twitter" type="text" class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-slate-900 outline-none" placeholder="Link Twitter/X" />
          </div>
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
              <Icon icon="lucide:music" class="size-5" />
            </div>
            <input v-model="business.tiktok" type="text" class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-black outline-none" placeholder="Link TikTok" />
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-3 pt-6">
      <button @click="settingsStore.resetBusiness" class="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Reset Default</button>
      <button @click="handleSave" class="px-10 py-3.5 bg-bejo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-bejo-600/20 hover:scale-[1.02] transition-all">Simpan Perubahan Bisnis</button>
    </div>
  </div>
</template>
