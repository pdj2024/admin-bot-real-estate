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
      console.log(email)
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
      <div class="px-8 py-5 border-b border-slate-50 bg-slate-50/50">
        <h4 class="text-sm font-black text-slate-800 uppercase tracking-widest">Keamanan Akun Admin</h4>
      </div>

      <div class="p-8 space-y-6">
        <div class="bg-red-50 p-6 rounded-2xl border border-red-100 flex gap-4">
          <Icon icon="lucide:shield-alert" class="size-5 text-red-600 shrink-0 mt-0.5" />
          <p class="text-xs text-red-800 font-medium leading-relaxed">Pastikan kata sandi baru Anda terdiri dari minimal 8 karakter dengan kombinasi angka dan simbol untuk keamanan maksimal.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Kata Sandi Saat Ini</label>
            <div class="relative">
              <Icon icon="lucide:lock" class="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
              <input v-model="form.currentPassword" type="password" class="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-sm font-medium focus:border-bejo-600 outline-none" placeholder="••••••••" />
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Kata Sandi Baru</label>
            <div class="relative">
              <Icon icon="lucide:key-round" class="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
              <input v-model="form.newPassword" type="password" class="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-sm font-medium focus:border-bejo-600 outline-none" placeholder="••••••••" />
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Konfirmasi Kata Sandi</label>
            <div class="relative">
              <Icon icon="lucide:check-circle" class="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
              <input v-model="form.confirmPassword" type="password" class="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-sm font-medium focus:border-bejo-600 outline-none" placeholder="••••••••" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-end gap-3 pt-6">
      <button :disabled="isLoading" @click="handleUpdatePassword" class="px-10 py-3.5 bg-red-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-red-600/20 hover:scale-[1.02] transition-all disabled:opacity-50">
        <span v-if="isLoading">Memproses...</span>
        <span v-else>Perbarui Kata Sandi</span>
      </button>
    </div>
  </div>
</template>
