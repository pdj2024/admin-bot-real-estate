<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { success, fail, confirm } from '@/utils/sweet-alert'
import api from '@/services/axios'

const formProfile = reactive({
  Email: '',
  Nama_User: '',
  Telepon: '',
  Role_User: 'admin',
  Keterangan: '',
  Max_Janji_Per_Hari: 3,
  Status: 'aktif',
  Id_Media: null as string | null
})

const formPassword = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const isLoadingProfile = ref(true)
const isSavingProfile = ref(false)
const isLoadingPassword = ref(false)
const isUploadingPhoto = ref(false)
const photoPreview = ref<string | null>(null)
const currentAdminId = ref(localStorage.getItem('no_id') || 'adm_1')

const resolveMediaUrl = async (id: string) => {
  if (!id) return null
  try {
    const { data } = await api.post('/api/mediacloud/read-url-batch', {
      ids: [id]
    }, {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    return data.success?.[id]?.Url || null
  } catch (err) {
    console.error('Resolve media error:', err)
    return null
  }
}

const urlToBase64 = async (url: string) => {
  if (!url || url.startsWith('data:')) return url
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise<string | null>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (err) {
    console.error('Base64 conversion error:', err)
    return null
  }
}

const fetchProfile = async () => {
  isLoadingProfile.value = true
  try {
    const { data } = await api.get('/api/admin/getAll', {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    if (data.StatusCode === 200 && data.Data) {
      const myProfile = data.Data.find((a: any) => a.No_Id === currentAdminId.value)
      if (myProfile) {
        Object.assign(formProfile, {
          Email: myProfile.Email || '',
          Nama_User: myProfile.Nama_User || '',
          Telepon: myProfile.Telepon || '',
          Role_User: myProfile.Role_User || 'admin',
          Keterangan: myProfile.Keterangan || '',
          Max_Janji_Per_Hari: myProfile.Max_Janji_Per_Hari || 3,
          Status: myProfile.Status || 'aktif',
          Id_Media: myProfile.No_Id_Media || null
        })
        
        if (myProfile.Id_Media) {
           photoPreview.value = myProfile.Id_Media
           const b64 = await urlToBase64(myProfile.Id_Media)
           if (b64) {
             localStorage.setItem('user_avatar', b64)
             window.dispatchEvent(new Event('profile-updated'))
           }
        } else if (myProfile.ThumbUrl) {
           photoPreview.value = myProfile.ThumbUrl
        } else if (myProfile.Url_Media) {
           photoPreview.value = myProfile.Url_Media
        }
      }
    }
  } catch (err: any) {
    console.error('Fetch profile error:', err)
  } finally {
    isLoadingProfile.value = false
  }
}

const handleUpdateProfile = async () => {
  confirm('Simpan perubahan profil Anda?', async () => {
    isSavingProfile.value = true
    try {
      const payload = {
        Email: formProfile.Email,
        Nama_User: formProfile.Nama_User,
        Telepon: formProfile.Telepon,
        Role_User: formProfile.Role_User,
        Keterangan: formProfile.Keterangan,
        Max_Janji_Per_Hari: formProfile.Max_Janji_Per_Hari,
        Status: formProfile.Status,
        Id_Media: formProfile.Id_Media
      }

      const { data } = await api.put('/api/admin/update', payload, {
        params: { no_id: currentAdminId.value },
        headers: { 'X-Jenis-User': 'Admin' }
      })

      if (data.StatusCode === 200) {
        success('Profil berhasil diperbarui')
        localStorage.setItem('nama_display', formProfile.Nama_User)
        window.dispatchEvent(new Event('profile-updated'))
      } else {
        fail(data.Message || 'Gagal menyimpan profil')
      }
    } catch (err: any) {
      fail(err.response?.data?.Message || 'Terjadi kesalahan sistem')
    } finally {
      isSavingProfile.value = false
    }
  })
}

const triggerPhotoUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e: any) => {
    const file = e.target.files[0]
    if (file) {
      photoPreview.value = URL.createObjectURL(file)
      handlePhotoUpload(file)
    }
  }
  input.click()
}

const handlePhotoUpload = async (file: File) => {
  const oldMediaId = formProfile.Id_Media
  try {
    isUploadingPhoto.value = true
    
    // 1. Get Signed URL
    const extension = file.name.split('.').pop()?.toLowerCase() || ''
    const { data: reqData } = await api.post('/api/mediacloud/req-upload-url-batch', {
      uploader_id: currentAdminId.value,
      extensions: [extension]
    }, {
      headers: { 'X-Jenis-User': 'Admin' }
    })

    const uploadInfo = reqData[0]
    
    // 2. Upload Binary to GCS
    await fetch(uploadInfo.UploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type }
    })

    // 3. Confirm Upload
    const { data: confirmData } = await api.post('/api/mediacloud/confirm-upload-batch', {
      files: [{
        uploader_id: currentAdminId.value,
        fileName: file.name,
        objectName: uploadInfo.ObjectName,
        original_size: file.size,
        content_type: file.type
      }]
    }, {
      headers: { 'X-Jenis-User': 'Admin' }
    })

    const mediaId = confirmData.MediaIds[0]

    // 4. Save to Profile
    const payload = {
        Email: formProfile.Email,
        Nama_User: formProfile.Nama_User,
        Telepon: formProfile.Telepon,
        Role_User: formProfile.Role_User,
        Keterangan: formProfile.Keterangan,
        Max_Janji_Per_Hari: formProfile.Max_Janji_Per_Hari,
        Status: formProfile.Status,
        Id_Media: mediaId
    }

    await api.put('/api/admin/update', payload, {
      params: { no_id: currentAdminId.value },
      headers: { 'X-Jenis-User': 'Admin' }
    })

    formProfile.Id_Media = mediaId
    
    // The update API might return the new signed URL in the future, 
    // but for now we still resolve it once after upload to get the preview URL
    const resolvedUrl = await resolveMediaUrl(mediaId)
    if (resolvedUrl) {
      photoPreview.value = resolvedUrl
      const b64 = await urlToBase64(resolvedUrl)
      if (b64) {
        localStorage.setItem('user_avatar', b64)
        window.dispatchEvent(new Event('profile-updated'))
      }
    }
    
    success('Foto profil berhasil diperbarui')
    
    // Cleanup: Delete old media from cloud
    if (oldMediaId) {
      api.delete('/api/mediacloud/delete-batch', {
        data: { ids: [oldMediaId] },
        headers: { 'X-Jenis-User': 'Admin' }
      }).catch(e => console.error('Error deleting old media:', e))
    }
  } catch (err) {
    console.error('Photo upload error:', err)
    fail('Gagal mengunggah foto profil')
  } finally {
    isUploadingPhoto.value = false
  }
}

const handleUpdatePassword = async () => {
  if (!formPassword.value.currentPassword || !formPassword.value.newPassword) {
    fail('Semua kolom wajib diisi!')
    return
  }

  if (formPassword.value.newPassword !== formPassword.value.confirmPassword) {
    fail('Konfirmasi kata sandi tidak cocok!')
    return
  }

  confirm('Apakah Anda yakin ingin memperbarui kata sandi Anda?', async () => {
    isLoadingPassword.value = true
    try {
      const email = localStorage.getItem('email') || formProfile.Email
      if (!email) {
        fail('Sesi email tidak ditemukan. Harap login kembali.')
        return
      }

      const { data } = await api.put(
        '/api/admin/change-password',
        {
          Email: email,
          Password_Lama: formPassword.value.currentPassword,
          Password_baru: formPassword.value.newPassword
        },
        { headers: { 'X-Jenis-User': 'admin' } }
      )

      if (data.StatusCode === 200 || data.message?.toLowerCase().includes('berhasil')) {
        success('Kata sandi berhasil diperbarui.')
        formPassword.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
      } else {
        fail(data.message || 'Gagal memperbarui kata sandi. Periksa kembali password lama Anda.')
      }
    } catch (err: any) {
      console.error(err)
      fail(err, 'Terjadi kesalahan sistem saat memperbarui kata sandi.')
    } finally {
      isLoadingPassword.value = false
    }
  })
}

const loadingSchedules = ref(false)
const scheduleList = ref<any[]>([])

const days = [
  { name: 'Senin', num: 1 },
  { name: 'Selasa', num: 2 },
  { name: 'Rabu', num: 3 },
  { name: 'Kamis', num: 4 },
  { name: 'Jumat', num: 5 },
  { name: 'Sabtu', num: 6 },
  { name: 'Minggu', num: 7 }
]

const fetchSchedules = async () => {
  loadingSchedules.value = true
  try {
    const { data } = await api.get('/api/admin/jadwal/getAll?orderby=no_id&orderdir=desc', {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    const list = data.Data || []
    const filtered = list.filter((s: any) => s.Id_Admin === currentAdminId.value)
    
    scheduleList.value = []
    days.forEach(d => {
      const match = filtered.find((s: any) => s.Hari === d.num)
      if (match) {
        scheduleList.value.push({
          Hari: d.name,
          Jam_Mulai: match.Jam_Mulai ? match.Jam_Mulai.slice(0, 5) : '08:00',
          Jam_Selesai: match.Jam_Selesai ? match.Jam_Selesai.slice(0, 5) : '17:00',
          Is_Libur: match.Is_Libur === true || match.Is_Libur === 'true' || match.Is_Libur === 1
        })
      } else {
        scheduleList.value.push({
          Hari: d.name,
          Jam_Mulai: '08:00',
          Jam_Selesai: '17:00',
          Is_Libur: d.num === 7
        })
      }
    })
  } catch (error) {
    console.error('Gagal mengambil jadwal kerja admin:', error)
  } finally {
    loadingSchedules.value = false
  }
}

onMounted(() => {
  fetchProfile()
  fetchSchedules()
})
</script>

<template>
  <div class="space-y-6">
    <div v-if="isLoadingProfile" class="space-y-6 animate-pulse">
      <div class="h-64 bg-white rounded-[2rem] border border-slate-100"></div>
      <div class="h-64 bg-white rounded-[2rem] border border-slate-100"></div>
    </div>
    
    <template v-else>
      <!-- PROFIL AKUN ADMIN -->
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-4 sm:px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <div class="flex items-center gap-3 min-w-0">
            <div class="size-8 rounded-lg bg-bejo-500 flex items-center justify-center text-white shadow-lg shadow-bejo-500/20 shrink-0">
              <Icon icon="lucide:user-cog" class="size-4" />
            </div>
            <h4 class="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest truncate">Akun Saya</h4>
          </div>
        </div>

        <div class="p-8 space-y-8">
          <!-- Foto Profil -->
          <div class="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-slate-50">
            <div class="relative group cursor-pointer shrink-0" @click="triggerPhotoUpload">
              <div class="size-32 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-bejo-500 group-hover:bg-bejo-50/30">
                <template v-if="photoPreview">
                  <img :src="photoPreview" class="size-full object-cover" />
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Icon icon="lucide:camera" class="size-6" />
                  </div>
                </template>
                <template v-else>
                  <Icon icon="lucide:image-plus" class="size-8 text-slate-300 mb-2 group-hover:text-bejo-500" />
                  <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-bejo-600">Foto Profil</span>
                </template>
              </div>
              <div v-if="isUploadingPhoto" class="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-[2rem] flex items-center justify-center z-10">
                <Icon icon="lucide:loader-2" class="size-6 animate-spin text-bejo-500" />
              </div>
            </div>
            
            <div class="flex-1 space-y-2 text-center md:text-left">
              <h5 class="text-lg font-black text-slate-900">Foto Profil</h5>
              <p class="text-sm text-slate-500 font-medium leading-relaxed max-w-sm">
                Gunakan foto asli Anda berformat PNG atau JPG untuk memudahkan komunikasi antar tim dan pelanggan.
              </p>
              <button @click="triggerPhotoUpload" class="text-xs font-black text-bejo-600 uppercase tracking-widest hover:text-bejo-700 flex items-center gap-2 mx-auto md:mx-0">
                Ubah Foto Profil
                <Icon icon="lucide:arrow-right" class="size-3" />
              </button>
            </div>
          </div>

          <!-- Form Edit Profil -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <label class="label">
                <Icon icon="lucide:id-card" class="size-4 text-bejo-500" />
                Nama Lengkap
              </label>
              <input v-model="formProfile.Nama_User" type="text" class="field-input" placeholder="Masukkan nama..." />
            </div>
            
            <div>
              <label class="label">
                <Icon icon="lucide:mail" class="size-4 text-bejo-500" />
                Alamat Email
              </label>
              <input v-model="formProfile.Email" type="email" class="field-input" placeholder="email@contoh.com" />
            </div>

            <div>
              <label class="label">
                <Icon icon="lucide:phone" class="size-4 text-bejo-500" />
                Nomor Telepon
              </label>
              <input v-model="formProfile.Telepon" type="text" class="field-input" placeholder="62812XXXXXX" />
            </div>

            <!-- Field Read Only Sesuai Request User -->
            <div>
              <label class="label">
                <Icon icon="lucide:shield" class="size-4 text-slate-400" />
                Peran (Role)
              </label>
              <input :value="formProfile.Role_User" type="text" class="field-input bg-slate-100 text-slate-400 cursor-not-allowed select-none" readonly />
            </div>

            <div>
              <label class="label">
                <Icon icon="lucide:activity" class="size-4 text-slate-400" />
                Status Akun
              </label>
              <input :value="formProfile.Status" type="text" class="field-input bg-slate-100 text-slate-400 cursor-not-allowed select-none capitalize" readonly />
            </div>

            <div class="md:col-span-2">
              <label class="label">
                <Icon icon="lucide:calendar-clock" class="size-4 text-slate-400" />
                Maksimal Janji Temu Per Hari
              </label>
              <input :value="formProfile.Max_Janji_Per_Hari" type="number" class="field-input bg-slate-100 text-slate-400 cursor-not-allowed select-none" readonly />
            </div>
            
            <div class="md:col-span-2">
              <label class="label">
                <Icon icon="lucide:text-quote" class="size-4 text-bejo-500" />
                Keterangan
              </label>
              <textarea v-model="formProfile.Keterangan" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-green-500/5 focus:border-green-500 transition-all resize-none leading-relaxed custom-scrollbar" placeholder="Keterangan opsional..."></textarea>
            </div>
          </div>
          
          <div class="flex items-center justify-end pt-2">
            <button 
              :disabled="isSavingProfile" 
              @click="handleUpdateProfile" 
              class="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-green-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Icon v-if="isSavingProfile" icon="lucide:loader-2" class="size-4 animate-spin" />
              <Icon v-else icon="lucide:save" class="size-4" />
              {{ isSavingProfile ? 'Menyimpan...' : 'Simpan Profil' }}
            </button>
          </div>
        </div>
      </div>

      <!-- JADWAL & JAM KERJA -->
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-4 sm:px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <div class="flex items-center gap-3 min-w-0">
            <div class="size-8 rounded-lg bg-bejo-500 flex items-center justify-center text-white shadow-lg shadow-bejo-500/20 shrink-0">
              <Icon icon="lucide:calendar-range" class="size-4" />
            </div>
            <h4 class="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest truncate">Jadwal & Jam Kerja</h4>
          </div>
        </div>

        <div class="p-8 space-y-6">
          <div v-if="loadingSchedules" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            <div v-for="i in 7" :key="i" class="h-20 bg-slate-50 rounded-2xl border border-slate-100"></div>
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="sched in scheduleList" 
              :key="sched.Hari"
              class="p-5 border rounded-2xl transition-all duration-300 flex items-center justify-between"
              :class="sched.Is_Libur ? 'bg-red-50/10 border-red-100' : 'bg-slate-50/40 border-slate-100 hover:border-bejo-100 hover:bg-white hover:shadow-md hover:shadow-slate-100'"
            >
              <div class="flex flex-col gap-1">
                <span class="text-sm font-black text-slate-800">{{ sched.Hari }}</span>
                <span class="text-xs font-bold" :class="sched.Is_Libur ? 'text-red-500' : 'text-slate-500'">
                  <template v-if="sched.Is_Libur">Libur</template>
                  <template v-else>{{ sched.Jam_Mulai }} — {{ sched.Jam_Selesai }} WIB</template>
                </span>
              </div>
              <div 
                class="size-8 rounded-lg flex items-center justify-center border shadow-sm"
                :class="sched.Is_Libur ? 'bg-red-50 border-red-100 text-red-500' : 'bg-green-50 border-green-100 text-green-600'"
              >
                <Icon :icon="sched.Is_Libur ? 'lucide:calendar-x' : 'lucide:calendar-check'" class="size-4.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- KEAMANAN & PASSWORD -->
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-4 sm:px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3 min-w-0">
          <div class="size-8 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 shrink-0">
            <Icon icon="lucide:shield-alert" class="size-4" />
          </div>
          <h4 class="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest truncate">Keamanan & Ganti Sandi</h4>
        </div>

        <div class="p-8 space-y-8">
          <div class="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 flex gap-4">
            <Icon icon="lucide:info" class="size-5 text-orange-600 shrink-0 mt-0.5" />
            <p class="text-[13px] text-orange-900 font-bold leading-relaxed uppercase tracking-wide">Pastikan kata sandi baru Anda terdiri dari minimal 8 karakter dengan kombinasi angka dan simbol untuk keamanan maksimal.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="md:col-span-2">
              <label class="label">
                <Icon icon="lucide:lock" class="size-4 text-orange-500" />
                Kata Sandi Saat Ini
              </label>
              <div class="relative group">
                <Icon icon="lucide:key" class="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                <input v-model="formPassword.currentPassword" :type="showCurrentPassword ? 'text' : 'password'" class="field-input !pl-12 !pr-12 focus:!border-orange-500 focus:!ring-orange-500/5" placeholder="••••••••" />
                <button 
                  type="button" 
                  @click="showCurrentPassword = !showCurrentPassword"
                  class="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors"
                >
                  <Icon :icon="showCurrentPassword ? 'lucide:eye-off' : 'lucide:eye'" class="size-4.5" />
                </button>
              </div>
            </div>

            <div>
              <label class="label">
                <Icon icon="lucide:key-round" class="size-4 text-orange-500" />
                Kata Sandi Baru
              </label>
              <div class="relative group">
                <Icon icon="lucide:shield" class="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                <input v-model="formPassword.newPassword" :type="showNewPassword ? 'text' : 'password'" class="field-input !pl-12 !pr-12 focus:!border-orange-500 focus:!ring-orange-500/5" placeholder="••••••••" />
                <button 
                  type="button" 
                  @click="showNewPassword = !showNewPassword"
                  class="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors"
                >
                  <Icon :icon="showNewPassword ? 'lucide:eye-off' : 'lucide:eye'" class="size-4.5" />
                </button>
              </div>
            </div>

            <div>
              <label class="label">
                <Icon icon="lucide:check-circle" class="size-4 text-orange-500" />
                Konfirmasi Kata Sandi
              </label>
              <div class="relative group">
                <Icon icon="lucide:shield-check" class="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                <input v-model="formPassword.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" class="field-input !pl-12 !pr-12 focus:!border-orange-500 focus:!ring-orange-500/5" placeholder="••••••••" />
                <button 
                  type="button" 
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors"
                >
                  <Icon :icon="showConfirmPassword ? 'lucide:eye-off' : 'lucide:eye'" class="size-4.5" />
                </button>
              </div>
            </div>
          </div>
          
          <div class="flex items-center justify-end pt-2">
            <button 
              :disabled="isLoadingPassword" 
              @click="handleUpdatePassword" 
              class="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-green-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Icon v-if="isLoadingPassword" icon="lucide:loader-2" class="size-4 animate-spin" />
              <Icon v-else icon="lucide:refresh-cw" class="size-4" />
              {{ isLoadingPassword ? 'Memproses...' : 'Perbarui Kata Sandi' }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.label {
  @apply flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest mb-2 ml-1;
}

.field-input {
  @apply w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-700 focus:ring-4 focus:ring-green-500/5 focus:border-green-500 outline-none transition-all;
}

.field-input:focus {
  @apply bg-white;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 20px;
}
</style>
