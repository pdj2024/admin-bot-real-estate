import axios from 'axios'
import router from '@/router'
import { isTokenExpired } from '@/utils/token'
import { API_BASE_URL } from '@/config/constants'

const baseURL = API_BASE_URL

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
  
  if (!refreshToken || refreshToken === 'undefined') {
    handleLogout()
    throw new Error('Refresh token missing')
  }

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
    console.error('Session expired: Refresh token failed', err)
    handleLogout()
    throw err
  }
}

/**
 * Centralized logout and redirect
 */
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('no_id')
  localStorage.removeItem('nama_display')
  localStorage.removeItem('role_user')
  localStorage.removeItem('user')
  localStorage.removeItem('user_avatar')
  localStorage.removeItem('user_phone')
  localStorage.removeItem('email')
  localStorage.removeItem('nama_user')
  localStorage.removeItem('keterangan')
  localStorage.removeItem('max_janji_per_hari')
  localStorage.removeItem('status')
  localStorage.removeItem('tgl_created')
  localStorage.removeItem('no_id_media')
  localStorage.removeItem('user_detail')
  
  // Force redirect to login if requiring auth
  if (router.currentRoute.value.meta.requiresAuth || router.currentRoute.value.name === 'Login' || window.location.pathname.startsWith('/chat') || window.location.pathname.startsWith('/dashboard')) {
    window.location.href = `/login?expired=1&redirect=${encodeURIComponent(window.location.pathname)}`
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

  if (token && token !== 'undefined' && isTokenExpired(token)) {
    try {
      const possiblyNewToken = localStorage.getItem('token')
      if (possiblyNewToken && possiblyNewToken !== 'undefined' && !isTokenExpired(possiblyNewToken)) {
         token = possiblyNewToken
      } else {
         token = await getOrStartRefresh()
      }
    } catch (err) {
      handleLogout()
      return Promise.reject(err)
    }
  }

  if (token && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token}`
  }

  const roleUser = localStorage.getItem('role_user')
  if (roleUser) {
    config.headers['X-Jenis-User'] = roleUser
  }

  return config
}, (error) => {
  return Promise.reject(error)
})

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
        handleLogout()
        return Promise.reject(err)
      }
    }
    
    if (error.response?.status === 401 || error.response?.status === 403) {
       handleLogout()
    }

    return Promise.reject(error)
  }
)

export default api
