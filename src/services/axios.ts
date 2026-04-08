import axios from 'axios'
import router from '@/router'
import { logout } from './auth';

const baseURL = 'https://wabotapi.padajaya.biz.id'

const api = axios.create({
  baseURL: baseURL,
  headers: { 'Content-Type': 'application/json' }
})

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, (error) => Promise.reject(error))

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
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
      const jenisUser = localStorage.getItem('role_user') || 'admin'

      return new Promise((resolve, reject) => {
        console.log('refreshtoken')
        axios.post(`${baseURL}/api/auth/refresh`,
          { refreshToken },
          { headers: { 'X-Jenis-User': jenisUser } }
        )
          .then(({ data }) => {
            const resData = data.Data || data
            const newToken = resData.token || resData.Token
            const newRefresh = resData.refreshToken || resData.RefreshToken

            if (!newToken) throw new Error("Invalid Token Response")

            localStorage.setItem('token', newToken)
            if (newRefresh) localStorage.setItem('refreshToken', newRefresh)

            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
            originalRequest.headers.Authorization = `Bearer ${newToken}`

            processQueue(null, newToken)
            resolve(api(originalRequest))
          })
          .catch((err) => {
            // 1. Ekstrak pesan error yang paling detail
            const errorStatus = err.response?.status; // Contoh: 400, 401, 500
            const errorMessage = err.response?.data?.Message || err.response?.data?.error || err.message;
            const errorDetail = err.response?.data || 'No extra details';

            // 2. Log ke konsol dengan format yang mudah dibaca
            console.error('--- REFRESH TOKEN FAILED ---');
            console.error(`Status: ${errorStatus}`);
            console.error(`Message: ${errorMessage}`);
            console.error('Full Detail:', errorDetail);

            // 3. Jalankan pembersihan
            processQueue(err, null);
            localStorage.clear();

            // 4. Arahkan ke login dengan menyertakan alasan error di URL (opsional)
            // Ini berguna agar di halaman login Anda bisa menampilkan pesan "Sesi Anda habis: [pesan]"
            logout(false)

            reject(err);
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
