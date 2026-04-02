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
    <div class="mt-8 text-center">
      <h3 class="mb-4 text-xl font-semibold text-primary">Sistem Dashboard Real Estate</h3>
      <p class="text-base text-default-500">Masuk untuk melanjutkan</p>
    </div>
    <form class="text-left w-full mt-10">
      <div class="mb-4">
        <label for="email" class="block font-medium text-default-900 text-sm mb-2">Email</label>
        <input type="text" id="email" name="email" v-model="form.Email" class="form-input" placeholder="Masukkan Email" style="padding: 0 12px" />
      </div>
      <div class="mb-4">
        <RouterLink to="" class="text-primary font-medium text-sm mb-2 float-end">Lupa Password ?</RouterLink>
        <label for="Password" class="block font-medium text-default-900 text-sm mb-2">Password</label>
        <input type="password" id="Password" name="password" v-model="form.Password" class="form-input" placeholder="Masukkan Password" style="padding: 0 12px" />
      </div>
      <div class="flex items-center gap-2 mb-4">
        <input id="checkbox-1" type="checkbox" class="form-checkbox" />
        <label class="text-default-900 text-sm font-medium" for="checkbox-1">Ingat Saya</label>
      </div>
      <div class="mt-10 text-center">
        <button type="button" @click="handleLogin()" class="btn bg-primary text-white w-full">Masuk</button>
      </div>
      <div class="my-9 relative text-center before:absolute before:top-2.5 before:left-0 before:border-t before:border-t-default-200 before:w-full before:h-0.5 before:right-0 before:-z-0">
        <h4 class="relative z-1 py-0.5 px-2 inline-block font-medium text-default-600 bg-card">Masuk dengan metode</h4>
      </div>
      <div class="flex w-full justify-center items-center gap-2">
        <RouterLink to="" class="btn border border-default-200 flex-grow hover:bg-default-150 shadow-sm hover:text-default-800">
          <Icon icon="logos:google-icon" class="iconify-color"></Icon>
          Google
        </RouterLink>
        <RouterLink to="" class="btn border border-default-200 flex-grow hover:bg-default-150 shadow-sm hover:text-default-800">
          <Icon icon="logos:apple" class="iconify text-mono"></Icon>
          Apple
        </RouterLink>
      </div>
      <!-- <div class="mt-10 text-center">
        <p class="text-base text-default-500">
          Don't have an Account ?
          <RouterLink to="/basic-auth/register" class="font-semibold underline hover:text-primary transition duration-200">SignUp</RouterLink>
        </p>
      </div> -->
    </form>
  </Auth>
</template>
