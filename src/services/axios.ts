import axios from 'axios'
import router from '@/router'
import { isTokenExpired } from '@/utils/token'

const baseURL = 'https://wabotapi.padajaya.biz.id'

const api = axios.create({
  baseURL: baseURL,
  headers: { 'Content-Type': 'application/json' }
})

// --- SINGLETON REFRESH PROMISE ---
// Menghindari race condition: hanya satu proses refresh yang boleh berjalan
let refreshPromise: Promise<string | null> | null = null

/**
 * Melakukan pemanggilan API refresh token.
 */
const performRefresh = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refreshToken')
  const roleUser = localStorage.getItem('role_user') || 'admin'
  
  if (!refreshToken) throw new Error('Refresh token missing')

  try {
    const { data } = await axios.post(`${baseURL}/api/auth/refresh`, 
      { refreshToken, Jenis_User: roleUser }, 
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
    // Hanya logout jika server mengembalikan 401/403 (Token benar-benar mati)
    if (err.response?.status === 401 || err.response?.status === 403) {
      console.error('Session expired: Refresh token is invalid')
      localStorage.clear()
      router.push({ path: '/login', query: { expired: '1' } })
    }
    // Jika error jaringan atau 500, biarkan sesi tetap ada tapi lempar error agar request gagal
    throw err
  }
}

// Global Reusable Refresh Logic
const getOrStartRefresh = (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

// Request Interceptor: Proactive Refresh
api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('token')

  if (token && isTokenExpired(token)) {
    try {
      // Cek apakah tab lain sudah me-refresh token baru
      const possiblyNewToken = localStorage.getItem('token')
      if (possiblyNewToken && !isTokenExpired(possiblyNewToken)) {
         token = possiblyNewToken
      } else {
         token = await getOrStartRefresh()
      }
    } catch (err: any) {
      console.log(err)
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => Promise.reject(error))

// Response Interceptor: Reactive Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const newToken = await getOrStartRefresh()
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        }
      } catch (err) {
        return Promise.reject(err)
      }
    }
    return Promise.reject(error)
  }
)

export default api
