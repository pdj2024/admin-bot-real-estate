<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import Auth from '@/layouts/auth.vue'
import { success, fail } from '@/utils/sweet-alert'
import { ref, onMounted, computed } from 'vue'
import api from '@/services/axios'

const router = useRouter()
const route = useRoute()

const form = ref({
  Email: '',
  Password: ''
})
const rememberMe = ref(true)
const showQuickLogin = ref(false)
const savedAccount = ref<any>(null)

const lastLoginFormatted = computed(() => {
  if (!savedAccount.value?.timestamp) return ''
  const date = new Date(savedAccount.value.timestamp)
  return new Intl.DateTimeFormat('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit',
    day: 'numeric',
    month: 'short'
  }).format(date)
})

const handleLogin = async (isQuick = false) => {
  try {
    const loginPayload = isQuick ? {
      Jenis_User: 'admin',
      Email: savedAccount.value.email,
      Password: savedAccount.value.password
    } : {
      Jenis_User: 'admin',
      Email: form.value.Email,
      Password: form.value.Password
    }

    const { data } = await api.post('/api/auth/login', loginPayload)

    if (data.StatusCode === 200) {
      localStorage.setItem('no_id', data.No_Id)
      localStorage.setItem('nama_display', data.Nama_Display)
      localStorage.setItem('role_user', data.Role_User)
      const resData = data.Data || data
      localStorage.setItem('token', resData.token || resData.Token)
      localStorage.setItem('refreshToken', resData.refreshToken || resData.RefreshToken)
      localStorage.setItem('email', loginPayload.Email)

      localStorage.setItem('user', JSON.stringify({
        id: data.No_Id,
        name: data.Nama_Display,
        role: data.Role_User
      }))

      // Quick Login / Remember Me logic
      if (rememberMe.value || isQuick) {
        localStorage.setItem('quick_login_data', JSON.stringify({
          name: data.Nama_Display,
          email: loginPayload.Email,
          password: loginPayload.Password,
          timestamp: Date.now()
        }))
      } else {
        localStorage.removeItem('quick_login_data')
      }

      success(`Halo ${data.Nama_Display}! Selamat datang kembali`)
      const redirectPath = (route.query.redirect as string) || '/dashboard'
      router.push(redirectPath)
    } else {
      fail('Email atau Password salah')
    }
  } catch (err) {
    fail('Login gagal, silakan periksa kredensial Anda')
  }
}

onMounted(() => {
  if (route.query.expired) fail('Harap login terlebih dahulu')

  const quickData = localStorage.getItem('quick_login_data')
  if (quickData) {
    const parsed = JSON.parse(quickData)
    const now = Date.now()
    const twentyFourHours = 24 * 60 * 60 * 1000
    
    if (now - parsed.timestamp < twentyFourHours) {
      savedAccount.value = parsed
      showQuickLogin.value = true
    } else {
      localStorage.removeItem('quick_login_data')
    }
  }
})
</script>

<template>
  <Auth>
    <div class="space-y-2 mb-6 sm:mb-10 text-center sm:text-left">
      <h3 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
        {{ showQuickLogin ? 'Masuk Cepat' : 'Selamat Datang' }}
      </h3>
      <p class="text-sm sm:text-base text-slate-500 font-medium">
        {{ showQuickLogin ? 'Klik profil Anda untuk masuk instan.' : 'Masuk ke dashboard untuk mengelola properti Anda.' }}
      </p>
    </div>

    <!-- Quick Login UI -->
    <div v-if="showQuickLogin" class="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div class="p-6 bg-bejo-50/50 border border-bejo-100 rounded-[2.5rem] flex flex-col items-center text-center group">
        <div class="relative mb-4">
          <div class="size-20 bg-white rounded-full flex items-center justify-center text-3xl font-black text-bejo-600 shadow-xl border-4 border-white ring-4 ring-bejo-50 transition-transform group-hover:scale-105">
            {{ savedAccount.name?.charAt(0).toUpperCase() }}
          </div>
          <div class="absolute bottom-0 right-0 size-6 bg-emerald-500 border-4 border-white rounded-full"></div>
        </div>
        
        <h4 class="text-lg font-black text-slate-900 mb-1">{{ savedAccount.name }}</h4>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
          Terakhir masuk: <span class="text-bejo-600">{{ lastLoginFormatted }}</span>
        </p>

        <button 
          @click="handleLogin(true)"
          class="w-full py-4 bg-bejo-500 hover:bg-bejo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-bejo-500/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
        >
          Masuk Sekarang
          <Icon icon="lucide:arrow-right" class="size-5" />
        </button>
      </div>

      <button 
        @click="showQuickLogin = false"
        class="w-full text-center text-xs font-black text-slate-400 uppercase tracking-widest hover:text-bejo-600 transition-colors"
      >
        Gunakan Akun Lain
      </button>
    </div>

    <!-- Standard Login Form -->
    <form v-else @submit.prevent="handleLogin(false)" class="text-left space-y-6">
      <div class="space-y-2">
        <label for="email" class="block text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Email Adress</label>
        <div class="relative group">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-bejo-500 transition-colors">
            <Icon icon="lucide:mail" class="size-5" />
          </div>
          <input 
            type="email" id="email" v-model="form.Email" placeholder="nama@email.com"
            class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500 transition-all outline-none font-medium"
            required
          />
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex justify-between items-center px-1">
          <label for="Password" class="block text-sm font-black text-slate-700 uppercase tracking-widest">Password</label>
          <RouterLink to="" class="text-xs font-bold text-bejo-600 hover:text-bejo-700">Lupa Password?</RouterLink>
        </div>
        <div class="relative group">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-bejo-500 transition-colors">
            <Icon icon="lucide:lock" class="size-5" />
          </div>
          <input 
            type="password" id="Password" v-model="form.Password" placeholder="••••••••"
            class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500 transition-all outline-none font-medium"
            required
          />
        </div>
      </div>

      <label class="flex items-center gap-3 cursor-pointer group w-fit ml-1">
        <div class="relative flex items-center">
          <input type="checkbox" v-model="rememberMe" class="peer sr-only" />
          <div class="size-5 bg-slate-100 border-2 border-slate-200 rounded-md peer-checked:bg-bejo-500 peer-checked:border-bejo-500 transition-all"></div>
          <Icon icon="lucide:check" class="absolute size-3.5 text-white scale-0 peer-checked:scale-100 transition-transform left-0.5" />
        </div>
        <span class="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Ingat Saya</span>
      </label>

      <button 
        type="submit" 
        class="w-full py-3.5 sm:py-4 bg-bejo-500 hover:bg-bejo-600 text-white rounded-2xl font-black text-base sm:text-lg shadow-xl shadow-bejo-500/30 hover:shadow-bejo-600/40 transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
      >
        Masuk Sekarang
        <Icon icon="lucide:arrow-right" class="size-5" />
      </button>
    </form>
  </Auth>
</template>
