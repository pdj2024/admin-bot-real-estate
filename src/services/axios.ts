import axios from 'axios'
import router from '@/router'

const api = axios.create({
  baseURL: 'http://26.75.164.107:270',
  headers: {
    'Content-Type': 'application/json'
  }
})

// --- Logic Refresh Token ---
let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Cek jika error 401 dan bukan request ke login/refresh itu sendiri
    if (error.response?.status === 401 && !originalRequest._retry) {

      if (isRefreshing) {
        // Jika sedang proses refresh, masukkan request ini ke antrean
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')

      // Jika tidak ada refreshToken di storage, langsung tendang ke login
      if (!refreshToken) {
        localStorage.clear()
        router.push('/login?expired=true')
        return Promise.reject(error)
      }

      return new Promise((resolve, reject) => {
        // Gunakan axios instance biasa (bukan 'api') agar tidak kena interceptor rante
        axios.post('http://26.75.164.107:270/api/auth/refresh', {
          refreshToken: refreshToken // Sesuai permintaan body kamu
        })
        .then(({ data }) => {
          // Asumsi backend mengembalikan { token: '...', refreshToken: '...' }
          localStorage.setItem('token', data.token)
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken)
          }

          // Update header Authorization untuk request selanjutnya
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
          originalRequest.headers.Authorization = `Bearer ${data.token}`

          processQueue(null, data.token)
          resolve(api(originalRequest))
        })
        .catch((err) => {
          // Jika refresh token juga expired (gagal refresh)
          processQueue(err, null)
          localStorage.clear()
          router.push('/login?expired=true')
          reject(err)
        })
        .finally(() => {
          isRefreshing = false
        })
      })
    }

    return Promise.reject(error)
  }
)

export default api
