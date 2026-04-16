<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { success, fail } from '@/utils/sweet-alert'
import api from '@/services/axios'

interface CompanyProfile {
  No_Id: string
  Nama_Toko: string
  Email: string
  No_Telp: string
  No_Wa_1: string
  No_Wa_2: string
  Alamat_Toko: string
  Hari_Buka: string
  Jam_Buka: string
  Kode_Pos: string
  About: string
  Gmap: string
  Footer: string
}

const isLoading = ref(true)
const isSaving = ref(false)

const form = reactive<CompanyProfile>({
  No_Id: 'comp_1',
  Nama_Toko: '',
  Email: '',
  No_Telp: '',
  No_Wa_1: '',
  No_Wa_2: '',
  Alamat_Toko: '',
  Hari_Buka: '',
  Jam_Buka: '',
  Kode_Pos: '',
  About: '',
  Gmap: '',
  Footer: ''
})

const fetchProfile = async () => {
  try {
    isLoading.value = true
    const { data } = await api.get('/api/company/getAll', {
      params: { no_id: 'comp_1' },
      headers: {
        'X-Jenis-User': 'Admin',
        'Api-Key': 'realestate_key_2024'
      }
    })
    
    if (data.StatusCode === 200 && data.Data.length > 0) {
      Object.assign(form, data.Data[0])
    }
  } catch (err) {
    console.error('Fetch company profile error:', err)
  } finally {
    isLoading.value = false
  }
}

const handleSave = async () => {
  try {
    isSaving.value = true
    
    // Construct payload as per requested format
    const payload = {
      Nama_Toko: form.Nama_Toko,
      Email: form.Email,
      No_Telp: form.No_Telp,
      No_Wa_1: form.No_Wa_1,
      No_Wa_2: form.No_Wa_2 || null, // Ensure null if empty
      Alamat_Toko: form.Alamat_Toko,
      Hari_Buka: form.Hari_Buka,
      Jam_Buka: form.Jam_Buka,
      Kode_Pos: form.Kode_Pos,
      About: form.About || null,
      Gmap: form.Gmap || null,
      Footer: form.Footer || null
    }
    
    const { data } = await api.put('/api/company/update', payload, {
      params: { no_id: 'comp_1' },
      headers: {
        'X-Jenis-User': 'Admin',
        'Api-Key': 'realestate_key_2024'
      }
    })
    
    if (data.StatusCode === 200) {
      success('Profil perusahaan berhasil diperbarui')
      fetchProfile() // Refresh data
    } else {
      fail(data.Message || 'Gagal menyimpan profil')
    }
  } catch (err) {
    console.error('Save company profile error:', err)
    fail('Terjadi kesalahan saat menghubungi server')
  } finally {
    isSaving.value = false
  }
}

onMounted(fetchProfile)
</script>

<template>
  <div class="space-y-6">
    <div v-if="isLoading" class="space-y-6 animate-pulse">
      <div v-for="i in 3" :key="i" class="h-64 bg-white rounded-[2rem] border border-slate-100"></div>
    </div>

    <template v-else>
      <!-- Identitas Utama -->
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div class="flex items-center gap-3">
            <div class="size-8 rounded-lg bg-bejo-600 flex items-center justify-center text-white shadow-lg shadow-bejo-600/20">
              <Icon icon="lucide:building-2" class="size-4" />
            </div>
            <h4 class="text-xs font-black text-slate-800 uppercase tracking-widest">Identitas Dasar</h4>
          </div>
        </div>
        
        <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama Perusahaan / Bisnis</label>
            <input 
              v-model="form.Nama_Toko" 
              type="text" 
              class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-bejo-600/5 focus:border-bejo-600 outline-none transition-all"
              placeholder="Masukkan nama bisnis..."
            />
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Resmi</label>
            <input 
              v-model="form.Email" 
              type="email" 
              class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-bejo-600/5 focus:border-bejo-600 outline-none transition-all"
              placeholder="email@perusahaan.com"
            />
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Telepon Kantor (No_Telp)</label>
            <input 
              v-model="form.No_Telp" 
              type="text" 
              class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-bejo-600/5 focus:border-bejo-600 outline-none transition-all"
              placeholder="021-XXXXX"
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Deskripsi Singkat Footer</label>
            <input 
              v-model="form.Footer" 
              type="text" 
              class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-bejo-600/5 focus:border-bejo-600 outline-none transition-all"
              placeholder="Teks yang akan muncul di footer situs..."
            />
          </div>
        </div>
      </div>

      <!-- WhatsApp & Support -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div class="px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
             <Icon icon="logos:whatsapp-icon" class="size-5" />
             <h4 class="text-xs font-black text-slate-800 uppercase tracking-widest">WhatsApp Sales</h4>
          </div>
          <div class="p-8 space-y-4">
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">WhatsApp Utama (Tanpa +)</label>
              <input v-model="form.No_Wa_1" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-bejo-600 outline-none transition-all" placeholder="628123..." />
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">WhatsApp Opsional</label>
              <input v-model="form.No_Wa_2" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-bejo-600 outline-none transition-all" placeholder="628123..." />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden text-center flex flex-col items-center justify-center p-8 bg-gradient-to-br from-white to-slate-50">
           <div class="size-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Icon icon="lucide:message-square-plus" class="size-8" />
           </div>
           <h5 class="text-sm font-black text-slate-900 mb-2">Sinkronisasi Chat</h5>
           <p class="text-[10px] text-slate-500 font-bold leading-relaxed px-4">Pastikan nomor WhatsApp yang Anda masukkan valid untuk integrasi otomatis ke sistem chatbot.</p>
        </div>
      </div>

      <!-- Lokasi & Operasional -->
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
            <div class="size-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-lg shadow-sky-600/20">
              <Icon icon="lucide:map-pin" class="size-4" />
            </div>
            <h4 class="text-xs font-black text-slate-800 uppercase tracking-widest">Lokasi & Jam Operasional</h4>
        </div>
        <div class="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="md:col-span-2">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Alamat Lengkap</label>
            <input v-model="form.Alamat_Toko" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-sky-600 outline-none transition-all" placeholder="Jalan raya..." />
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Kode Pos</label>
            <input v-model="form.Kode_Pos" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-sky-600 outline-none transition-all" placeholder="12345" />
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Hari Operasional</label>
            <input v-model="form.Hari_Buka" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-sky-600 outline-none transition-all" placeholder="Senin - Sabtu" />
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Jam Operasional</label>
            <input v-model="form.Jam_Buka" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-sky-600 outline-none transition-all" placeholder="08:00 - 17:00" />
          </div>
          <div class="md:col-span-3">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Peta (Google Maps Embed Link / URL)</label>
            <input v-model="form.Gmap" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-sky-600 outline-none transition-all" placeholder="https://maps.google.com/..." />
          </div>
        </div>
      </div>

      <!-- Tentang Kami -->
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-8 py-5 border-b border-slate-50 bg-slate-50/50">
           <h4 class="text-xs font-black text-slate-800 uppercase tracking-widest">Tentang Perusahaan</h4>
        </div>
        <div class="p-8">
          <textarea 
            v-model="form.About" 
            rows="5" 
            class="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-bejo-600/5 focus:border-bejo-600 transition-all resize-none leading-relaxed"
            placeholder="Tuliskan detail visi, misi, atau profil singkat perusahaan Anda di sini..."
          ></textarea>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3 pt-6">
        <button @click="fetchProfile" class="px-6 py-3 text-sm font-black text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest">Batalkan</button>
        <button 
          @click="handleSave" 
          :disabled="isSaving"
          class="flex items-center gap-3 px-10 py-4 bg-bejo-600 text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-bejo-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon v-if="isSaving" icon="lucide:loader-2" class="size-5 animate-spin" />
          {{ isSaving ? 'Menyimpan...' : 'Simpan Profil Perusahaan' }}
        </button>
      </div>
    </template>
  </div>
</template>
