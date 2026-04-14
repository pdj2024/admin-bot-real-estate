<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import Auth from '@/layouts/auth.vue'
import { success, fail } from '@/utils/sweet-alert'
import { ref, onMounted } from 'vue'
import api from '@/services/axios'

const router = useRouter()
const route = useRoute()

const form = ref({
  Email: '',
  Password: ''
})

const handleLogin = async () => {
  try {
    const { data } = await api.post('/api/auth/login', {
      Jenis_User: 'admin',
      Email: form.value.Email,
      Password: form.value.Password
    })

    if (data.StatusCode === 200) {
      localStorage.setItem('no_id', data.No_Id)
      localStorage.setItem('nama_display', data.Nama_Display)
      localStorage.setItem('role_user', data.Role_User)
      localStorage.setItem('token', data.token)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('email', form.value.Email)

      localStorage.setItem(
        'user',
        JSON.stringify({
          id: data.No_Id,
          name: data.Nama_Display,
          role: data.Role_User
        })
      )

      const greeting = route.query.redirect as string == null? 'Hai ' + data.Nama_Display + '! Selamat datang' : 'Hai ' + data.Nama_Display + '! Selamat datang kembali'
      success(greeting)

      console.log(route.query.redirect as string == null)

      const redirectPath = (route.query.redirect as string) || '/dashboard'
      router.push(redirectPath)
    } else {
      fail('Email atau Password yang Anda masukkan salah')
    }
  } catch (err) {
    console.log(err)
    fail('Email atau Password yang Anda masukkan salah')
  }
}

onMounted(() => {
  if (route.query.expired) {
    fail('Harap login terlebih dahulu')
  }
})
</script>

<template>
  <Auth>
    <div class="space-y-2 mb-10">
      <h3 class="text-3xl font-black text-slate-900 tracking-tight">Selamat Datang</h3>
      <p class="text-slate-500 font-medium">Masuk ke dashboard untuk mengelola properti Anda.</p>
    </div>

    <form @submit.prevent="handleLogin" class="text-left space-y-6">
      <!-- Email Input -->
      <div class="space-y-2">
        <label for="email" class="block text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Email Adress</label>
        <div class="relative group">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-bejo-500 transition-colors">
            <Icon icon="lucide:mail" class="size-5" />
          </div>
          <input 
            type="email" 
            id="email" 
            v-model="form.Email" 
            placeholder="nama@email.com"
            class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500 transition-all outline-none font-medium"
            required
          />
        </div>
      </div>

      <!-- Password Input -->
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
            type="password" 
            id="Password" 
            v-model="form.Password" 
            placeholder="••••••••"
            class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-bejo-500/10 focus:border-bejo-500 transition-all outline-none font-medium"
            required
          />
        </div>
      </div>

      <!-- Remember Me -->
      <label class="flex items-center gap-3 cursor-pointer group w-fit ml-1">
        <div class="relative flex items-center">
          <input type="checkbox" class="peer sr-only" />
          <div class="size-5 bg-slate-100 border-2 border-slate-200 rounded-md peer-checked:bg-bejo-500 peer-checked:border-bejo-500 transition-all"></div>
          <Icon icon="lucide:check" class="absolute size-3.5 text-white scale-0 peer-checked:scale-100 transition-transform left-0.5" />
        </div>
        <span class="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Ingat Saya</span>
      </label>

      <!-- Submit Button -->
      <button 
        type="submit" 
        class="w-full py-4 bg-bejo-500 hover:bg-bejo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-bejo-500/30 hover:shadow-bejo-600/40 transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
      >
        Masuk Sekarang
        <Icon icon="lucide:arrow-right" class="size-5" />
      </button>

      <!-- Divider -->
      <div class="relative flex items-center py-4">
        <div class="flex-grow border-t border-slate-100"></div>
        <span class="flex-shrink mx-4 text-xs font-black text-slate-400 uppercase tracking-widest">Atau masuk dengan</span>
        <div class="flex-grow border-t border-slate-100"></div>
      </div>

      <!-- Social Login -->
      <div class="grid grid-cols-2 gap-4">
        <button type="button" class="flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-bold text-slate-700">
          <Icon icon="logos:google-icon" class="size-5" />
          Google
        </button>
        <button type="button" class="flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-bold text-slate-700">
          <Icon icon="logos:apple" class="size-5" />
          Apple
        </button>
      </div>
    </form>
  </Auth>
</template>
