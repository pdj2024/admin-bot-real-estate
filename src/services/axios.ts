import axios from 'axios'
import router from '@/router'
import { isTokenExpired } from '@/utils/token'

const baseURL = 'https://wabotapi.padajaya.biz.id'

const api = axios.create({
  baseURL: baseURL,
  headers: { 'Content-Type': 'application/json' }
})

let isRefreshing = false
let failedQueue: any[] = []

/**
 * Process the queue of requests waiting for a new token.
 */
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

/**
 * Perform the actual token refresh call.
 */
const performRefresh = async () => {
  const refreshToken = localStorage.getItem('refreshToken')
  const roleUser = localStorage.getItem('role_user') || 'admin'
  
  if (!refreshToken) throw new Error('Refresh token missing')

  try {
    const { data } = await axios.post(`${baseURL}/api/auth/refresh`, 
      { refreshToken, Jenis_User: roleUser }, // Kirim di body juga agar aman
      { headers: { 'X-Jenis-User': roleUser } }
    )

    const resData = data.Data || data
    const newToken = resData.token || resData.Token
    const newRefresh = resData.refreshToken || resData.RefreshToken

    if (!newToken) throw new Error('Invalid Token Response')

    localStorage.setItem('token', newToken)
    if (newRefresh) localStorage.setItem('refreshToken', newRefresh)

    return newToken
  } catch (err: any) {
    // Hanya hapus session jika server merespon dengan kegagalan autentikasi
    if (err.response?.status === 401 || err.response?.status === 403) {
      console.error('Refresh token expired or invalid')
      localStorage.clear()
      router.push({ path: '/login', query: { expired: '1' } })
    }
    throw err
  }
}

// Request Interceptor: Proactive Refresh
api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('token')

  // Cek secara proaktif jika token akan habis
  if (token && isTokenExpired(token)) {
    const refreshToken = localStorage.getItem('refreshToken')
    
    if (refreshToken && !isRefreshing) {
      isRefreshing = true
      try {
        const newToken = await performRefresh()
        processQueue(null, newToken)
        token = newToken
      } catch (err) {
        processQueue(err, null)
      } finally {
        isRefreshing = false
      }
    } else if (isRefreshing) {
      // Jika sedang me-refresh, tunggu sampai selesai
      try {
        token = await new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
      } catch (err) {
        // Biarkan request berlanjut (akan tertangkap 401 di response)
      }
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => Promise.reject(error))

// Response Interceptor: Reactive Refresh (Safety Net)
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

      try {
        const newToken = await performRefresh()
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api
