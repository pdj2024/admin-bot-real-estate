<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { success, fail, confirm } from '@/utils/sweet-alert'
import api from '@/services/axios'

const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const isLoading = ref(false)

const handleUpdatePassword = async () => {
  if (!form.value.currentPassword || !form.value.newPassword) {
    fail('Semua kolom wajib diisi!')
    return
  }

  if (form.value.newPassword !== form.value.confirmPassword) {
    fail('Konfirmasi kata sandi tidak cocok!')
    return
  }

  confirm('Apakah Anda yakin ingin memperbarui kata sandi administrator?', async () => {
    isLoading.value = true
    try {
      const email = localStorage.getItem('email')
      if (!email) {
        fail('Sesi email tidak ditemukan. Harap login kembali.')
        return
      }

      const { data } = await api.put(
        '/api/admin/change-password',
        {
          Email: email,
          Password_Lama: form.value.currentPassword,
          Password_baru: form.value.newPassword
        },
        { headers: { 'X-Jenis-User': 'admin' } }
      )

      if (data.StatusCode === 200 || data.message?.toLowerCase().includes('berhasil')) {
        success('Kata sandi berhasil diperbarui.')
        form.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
      } else {
        fail(data.message || 'Gagal memperbarui kata sandi. Periksa kembali password lama Anda.')
      }
    } catch (err: any) {
      console.error(err)
      fail(err.response?.data?.message || 'Terjadi kesalahan sistem saat memperbarui kata sandi.')
    } finally {
      isLoading.value = false
    }
  })
}
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
      <div class="px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
        <div class="size-8 rounded-lg bg-bejo-500 flex items-center justify-center text-white shadow-lg shadow-bejo-500/20">
          <Icon icon="lucide:shield-check" class="size-4" />
        </div>
        <h4 class="text-xs font-black text-slate-800 uppercase tracking-widest">Keamanan Akun Admin</h4>
      </div>

      <div class="p-8 space-y-8">
        <div class="bg-bejo-50 p-6 rounded-2xl border border-bejo-100 flex gap-4">
          <Icon icon="lucide:shield-alert" class="size-5 text-bejo-600 shrink-0 mt-0.5" />
          <p class="text-[11px] text-bejo-900 font-bold leading-relaxed uppercase tracking-wide">Pastikan kata sandi baru Anda terdiri dari minimal 8 karakter dengan kombinasi angka dan simbol untuk keamanan maksimal.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="md:col-span-2">
            <label class="label">
              <Icon icon="lucide:lock" class="size-4 text-bejo-500" />
              Kata Sandi Saat Ini
            </label>
            <div class="relative group">
              <Icon icon="lucide:key" class="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-bejo-600 transition-colors" />
              <input v-model="form.currentPassword" type="password" class="field-input !pl-12" placeholder="••••••••" />
            </div>
          </div>

          <div>
            <label class="label">
              <Icon icon="lucide:key-round" class="size-4 text-bejo-600" />
              Kata Sandi Baru
            </label>
            <div class="relative group">
              <Icon icon="lucide:shield" class="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-bejo-600 transition-colors" />
              <input v-model="form.newPassword" type="password" class="field-input !pl-12" placeholder="••••••••" />
            </div>
          </div>

          <div>
            <label class="label">
              <Icon icon="lucide:check-circle" class="size-4 text-bejo-600" />
              Konfirmasi Kata Sandi
            </label>
            <div class="relative group">
              <Icon icon="lucide:shield-check" class="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-bejo-600 transition-colors" />
              <input v-model="form.confirmPassword" type="password" class="field-input !pl-12" placeholder="••••••••" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-end gap-3 pt-4">
      <button 
        :disabled="isLoading" 
        @click="handleUpdatePassword" 
        class="px-10 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
      >
        <Icon v-if="isLoading" icon="lucide:loader-2" class="size-4 animate-spin" />
        <Icon v-else icon="lucide:refresh-cw" class="size-4" />
        {{ isLoading ? 'Memproses...' : 'Perbarui Kata Sandi' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.label {
  @apply flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1;
}

.field-input {
  @apply w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-700 focus:ring-4 focus:ring-green-500/5 focus:border-green-500 outline-none transition-all;
}

.field-input:focus {
  @apply bg-white;
}
</style>
