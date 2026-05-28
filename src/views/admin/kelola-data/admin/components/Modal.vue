<script setup lang="ts">
import { ref, watch, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import api from '@/services/axios'
import { confirm, success, fail } from '@/utils/sweet-alert'

const props = defineProps<{
  show: boolean
  editData?: any | null
}>()

const emit = defineEmits(['close', 'success'])
const loading = ref(false)
const loadingSchedules = ref(false)

const form = reactive({
  No_Id: '',
  Nama_User: '',
  Email: '',
  Telepon: '',
  Keterangan: '',
  Max_Janji_Per_Hari: 3,
  Role_User: 'admin',
  Status: 'aktif',
  Id_Media: null as string | null,  // berisi No_Id_Media (ID media, bukan URL)
  Password: ''
})

// URL avatar untuk ditampilkan (diambil dari Id_Media pada response GET)
const avatarUrl = ref<string | null>(null)

const scheduleForm = ref<any[]>([])

const days = [
  { name: 'Senin', num: 1 },
  { name: 'Selasa', num: 2 },
  { name: 'Rabu', num: 3 },
  { name: 'Kamis', num: 4 },
  { name: 'Jumat', num: 5 },
  { name: 'Sabtu', num: 6 },
  { name: 'Minggu', num: 7 }
]

const initDefaultSchedules = () => {
  scheduleForm.value = days.map(d => reactive({
    No_Id: null,
    Hari: d.num,
    Jam_Mulai: '08:00',
    Jam_Selesai: d.num >= 6 ? '14:00' : '17:00',  // Sabtu pendek, Minggu libur
    Is_Libur: d.num === 7  // Minggu libur by default
  }))
}

const resetForm = () => {
  Object.assign(form, {
    No_Id: '',
    Nama_User: '',
    Email: '',
    Telepon: '',
    Keterangan: '',
    Max_Janji_Per_Hari: 3,
    Role_User: 'admin',
    Status: 'aktif',
    Id_Media: null,
    Password: ''
  })
  avatarUrl.value = null
  initDefaultSchedules()
}

const getScheduleState = (dayNum: number) => {
  let found = scheduleForm.value.find(s => s.Hari === dayNum)
  if (!found) {
    found = reactive({
      No_Id: null,
      Hari: dayNum,
      Jam_Mulai: '08:00',
      Jam_Selesai: '17:00',
      Is_Libur: false
    })
    scheduleForm.value.push(found)
  }
  return found
}

const toggleDayLibur = (dayNum: number) => {
  const sched = getScheduleState(dayNum)
  sched.Is_Libur = !sched.Is_Libur
}

const fetchAdminSchedules = async (adminId: string) => {
  loadingSchedules.value = true
  try {
    const { data } = await api.get('/api/admin/jadwal/getAll?orderby=no_id&orderdir=desc', {
      headers: { 'X-Jenis-User': 'Admin' }
    })
    const list = data.Data || []
    const filtered = list.filter((s: any) => s.Id_Admin === adminId)
    
    scheduleForm.value = []
    days.forEach(d => {
      const match = filtered.find((s: any) => s.Hari === d.num)
      if (match) {
        scheduleForm.value.push(reactive({
          No_Id: match.No_Id,
          Hari: d.num,
          Jam_Mulai: match.Jam_Mulai ? match.Jam_Mulai.slice(0, 5) : '08:00',
          Jam_Selesai: match.Jam_Selesai ? match.Jam_Selesai.slice(0, 5) : '17:00',
          Is_Libur: match.Is_Libur === true || match.Is_Libur === 'true' || match.Is_Libur === 1
        }))
      } else {
        scheduleForm.value.push(reactive({
          No_Id: null,
          Hari: d.num,
          Jam_Mulai: '08:00',
          Jam_Selesai: '17:00',
          Is_Libur: false
        }))
      }
    })
  } catch (error) {
    console.error('Gagal mengambil jadwal kerja admin:', error)
  } finally {
    loadingSchedules.value = false
  }
}


watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      if (props.editData) {
        Object.assign(form, props.editData)
        // Id_Media di payload PUT harus berisi No_Id_Media (bukan URL)
        form.Id_Media = props.editData.No_Id_Media || null
        // Simpan URL untuk display avatar
        avatarUrl.value = props.editData.Id_Media || null
        fetchAdminSchedules(props.editData.No_Id)
      } else {
        resetForm()
      }
    }
  },
  { immediate: true }
)

const saveSchedules = async (adminId: string) => {
  try {
    for (const sched of scheduleForm.value) {
      const payload = {
        Id_Admin: adminId,
        Hari: sched.Hari,
        Jam_Mulai: sched.Jam_Mulai || '08:00',
        Jam_Selesai: sched.Jam_Selesai || '17:00',
        Is_Libur: sched.Is_Libur
      }
      if (sched.No_Id) {
        await api.put(`/api/admin/jadwal/update?no_id=${sched.No_Id}`, payload, {
          headers: { 'X-Jenis-User': 'Admin' }
        })
      } else {
        await api.post(`/api/admin/jadwal/create`, payload, {
          headers: { 'X-Jenis-User': 'Admin' }
        })
      }
    }
  } catch (error) {
    console.error('Gagal menyimpan jadwal kerja:', error)
    throw error
  }
}

const handleSubmit = async () => {
  const isEdit = !!props.editData
  loading.value = true

  confirm(`Apakah data admin sudah benar?`, async () => {
    try {
      const url = isEdit ? `/api/admin/update?no_id=${form.No_Id}` : '/api/admin/create'
      const method = isEdit ? 'put' : 'post'

      const payload = { ...form }
      if (isEdit) {
        delete (payload as any).Password
        delete (payload as any).No_Id
      }

      const response = await api[method](url, payload, {
        headers: { 'X-Jenis-User': 'Admin' }
      })

      if (isEdit) {
        await saveSchedules(form.No_Id)
      } else {
        // Ambil No_Id admin baru dari response untuk simpan jadwal otomatis
        const newAdminId = response.data?.No_Id || response.data?.Data?.No_Id
        if (newAdminId && scheduleForm.value.length > 0) {
          await saveSchedules(newAdminId)
        }
      }

      success(isEdit ? 'Berhasil memperbarui data' : 'Berhasil menambah admin & jadwal kerja')
      emit('success')
      handleClose()
    } catch (err: any) {
      const detailError = err.response?.data?.Message || err.response?.data?.message || err.response?.data?.error || err.message
      fail(`Akses Ditolak: ${detailError}`)
    } finally {
      loading.value = false
    }
  })
}

const handleClose = () => {
  resetForm()
  emit('close')
}
</script>

<template>
  <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" @click="handleClose"></div>

      <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md lg:max-w-5xl max-h-[85vh] md:max-h-[90vh] z-10 overflow-hidden border border-slate-100 flex flex-col transition-all animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500">
        <!-- Modal Header -->
        <div class="relative p-6 border-b border-slate-50 bg-white shrink-0">
          <div class="absolute top-0 right-0 w-32 h-32 bg-bejo-50/50 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          
          <div class="relative flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-2xl bg-bejo-500 text-white flex items-center justify-center">
                <Icon :icon="editData ? 'lucide:user-cog' : 'lucide:user-plus'" class="size-5" />
              </div>
              <div>
                <h3 class="text-lg font-black text-slate-900 leading-none">
                  {{ editData ? 'Edit Admin' : 'Tambah Admin' }}
                </h3>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {{ editData ? 'Perbarui data administrator' : 'Daftarkan administrator baru' }}
                </p>
              </div>
            </div>
            <button @click="handleClose" class="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all">
              <Icon icon="lucide:x" class="size-5" />
            </button>
          </div>
        </div>

        <!-- Modal Body & Footer Wrapper -->
        <form @submit.prevent="handleSubmit" class="flex-1 min-h-0 flex flex-col p-6 md:p-8 bg-white">
          <!-- Scrollable Content Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto pr-1.5 custom-scrollbar flex-1 mb-6">
            <!-- Left Side: Profile -->
            <div class="space-y-6">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 border-b border-slate-50 pb-2">Profil Admin</p>
              
              <div v-if="editData" class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">ID Admin</label>
                <div class="h-12 w-full px-4 flex items-center bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-400 select-none">
                  {{ form.No_Id }}
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Nama Lengkap</label>
                <input v-model="form.Nama_User" type="text" required class="form-input-premium" placeholder="Misal: Ahmad Syahroni" />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Alamat Email</label>
                  <div class="relative group">
                    <Icon icon="lucide:mail" class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-bejo-500 transition-colors" />
                    <input v-model="form.Email" type="email" required class="form-input-premium !ps-11" placeholder="admin@rumahbejo.com" />
                  </div>
                </div>
                
                <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Nomor Telepon</label>
                  <div class="relative group">
                    <Icon icon="lucide:phone" class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-bejo-500 transition-colors" />
                    <input v-model="form.Telepon" type="tel" required class="form-input-premium !ps-11" placeholder="62812..." />
                  </div>
                </div>
              </div>
              
              <div class="grid grid-cols-1" :class="!editData ? 'md:grid-cols-2 gap-4' : ''">
                <div v-if="!editData" class="space-y-1.5">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Password</label>
                  <div class="relative group">
                    <Icon icon="lucide:lock" class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-bejo-500 transition-colors" />
                    <input v-model="form.Password" type="password" required class="form-input-premium !ps-11" placeholder="••••••••" />
                  </div>
                </div>

                <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Max Janji / Hari</label>
                  <div class="relative group">
                    <Icon icon="lucide:calendar-check" class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-bejo-500 transition-colors" />
                    <input v-model="form.Max_Janji_Per_Hari" type="number" required min="1" class="form-input-premium !ps-11" placeholder="Misal: 3" />
                  </div>
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Keterangan Tambahan</label>
                <textarea v-model="form.Keterangan" rows="3" class="form-input-premium resize-none" placeholder="Catatan singkat..."></textarea>
              </div>
            </div>

            <!-- Right Side: Work Schedule -->
            <div class="space-y-6 lg:border-l lg:border-slate-100 lg:pl-8">
              <div class="flex items-center justify-between border-b border-slate-50 pb-2">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Jadwal Kerja</p>
                <span class="text-[8px] font-black text-bejo-600 bg-bejo-50 px-2 py-0.5 rounded">Hari & Jam Kerja</span>
              </div>

              <!-- Loader for schedules -->
              <div v-if="loadingSchedules" class="py-24 flex flex-col items-center justify-center gap-3">
                <Icon icon="lucide:loader-2" class="animate-spin size-8 text-bejo-500" />
                <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Memuat Jadwal Kerja...</span>
              </div>

              <div v-else-if="editData" class="space-y-3">
                <div v-for="day in days" :key="day.num" class="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-3">
                  <!-- Day Label -->
                  <div class="w-18 shrink-0">
                    <span class="text-xs font-black text-slate-700 block">{{ day.name }}</span>
                    <span class="text-[9px] font-black uppercase tracking-wider" :class="getScheduleState(day.num).Is_Libur ? 'text-red-500' : 'text-bejo-600'">
                      {{ getScheduleState(day.num).Is_Libur ? 'Libur' : 'Masuk' }}
                    </span>
                  </div>
                  
                  <!-- Switch for Is_Libur -->
                  <button 
                    type="button" 
                    @click="toggleDayLibur(day.num)"
                    class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 focus:outline-none"
                    :class="!getScheduleState(day.num).Is_Libur ? 'bg-bejo-500 shadow-[0_0_10px_rgba(235,112,31,0.2)]' : 'bg-slate-200'"
                  >
                    <span class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-300 ease-in-out" :class="!getScheduleState(day.num).Is_Libur ? 'translate-x-4' : 'translate-x-0'"></span>
                  </button>
                  
                  <!-- Time inputs (Hidden/disabled if Libur) -->
                  <div class="flex items-center gap-2 flex-1 justify-end" v-show="!getScheduleState(day.num).Is_Libur">
                    <input 
                      type="time" 
                      v-model="getScheduleState(day.num).Jam_Mulai" 
                      class="px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 w-22 text-center outline-none focus:border-bejo-500 focus:ring-4 focus:ring-bejo-500/10 transition-all" 
                    />
                    <span class="text-slate-350 font-black text-xs">-</span>
                    <input 
                      type="time" 
                      v-model="getScheduleState(day.num).Jam_Selesai" 
                      class="px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 w-22 text-center outline-none focus:border-bejo-500 focus:ring-4 focus:ring-bejo-500/10 transition-all" 
                    />
                  </div>
                  <div class="text-right text-xs font-black text-slate-400 pr-4 flex-1 uppercase tracking-widest" v-show="getScheduleState(day.num).Is_Libur">
                    Libur
                  </div>
                </div>
              </div>

              <!-- Schedule Form for New Admin -->
              <div v-else class="space-y-3">
                <div class="flex items-center gap-2 mb-3 px-1">
                  <Icon icon="lucide:info" class="size-3.5 text-bejo-500 shrink-0" />
                  <p class="text-[10px] font-bold text-slate-400 leading-relaxed">Jadwal ini akan disimpan otomatis setelah admin didaftarkan.</p>
                </div>
                <div v-for="day in days" :key="day.num" class="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-3">
                  <!-- Day Label -->
                  <div class="w-18 shrink-0">
                    <span class="text-xs font-black text-slate-700 block">{{ day.name }}</span>
                    <span class="text-[9px] font-black uppercase tracking-wider" :class="getScheduleState(day.num).Is_Libur ? 'text-red-500' : 'text-bejo-600'">
                      {{ getScheduleState(day.num).Is_Libur ? 'Libur' : 'Masuk' }}
                    </span>
                  </div>

                  <!-- Switch for Is_Libur -->
                  <button
                    type="button"
                    @click="toggleDayLibur(day.num)"
                    class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 focus:outline-none"
                    :class="!getScheduleState(day.num).Is_Libur ? 'bg-bejo-500 shadow-[0_0_10px_rgba(235,112,31,0.2)]' : 'bg-slate-200'"
                  >
                    <span class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-300 ease-in-out" :class="!getScheduleState(day.num).Is_Libur ? 'translate-x-4' : 'translate-x-0'"></span>
                  </button>

                  <!-- Time inputs -->
                  <div class="flex items-center gap-2 flex-1 justify-end" v-show="!getScheduleState(day.num).Is_Libur">
                    <input
                      type="time"
                      v-model="getScheduleState(day.num).Jam_Mulai"
                      class="px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 w-22 text-center outline-none focus:border-bejo-500 focus:ring-4 focus:ring-bejo-500/10 transition-all"
                    />
                    <span class="text-slate-350 font-black text-xs">-</span>
                    <input
                      type="time"
                      v-model="getScheduleState(day.num).Jam_Selesai"
                      class="px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 w-22 text-center outline-none focus:border-bejo-500 focus:ring-4 focus:ring-bejo-500/10 transition-all"
                    />
                  </div>
                  <div class="text-right text-xs font-black text-slate-400 pr-4 flex-1 uppercase tracking-widest" v-show="getScheduleState(day.num).Is_Libur">
                    Libur
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions (Sticky at bottom) -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 bg-white shrink-0">
            <button type="button" @click="handleClose" class="px-6 h-12 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-all">
              Batal
            </button>
            <button type="submit" :disabled="loading" class="px-10 h-12 bg-bejo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-bejo-500/20 hover:bg-bejo-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:scale-100">
              <Icon v-if="loading" icon="lucide:loader-2" class="animate-spin size-4" />
              {{ loading ? 'Memproses...' : editData ? 'Simpan' : 'Daftarkan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.form-input-premium {
  @apply w-full h-12 px-4 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl 
         focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500/50 outline-none transition-all
         placeholder:text-slate-300 placeholder:font-bold placeholder:uppercase placeholder:tracking-widest;
}
.custom-scrollbar {
  scrollbar-width: thin;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 20px;
}
</style>
