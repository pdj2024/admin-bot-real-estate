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

export const isTokenExpired = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Beri toleransi 30 detik sebelum benar-benar expired
    return (payload.exp * 1000) < (Date.now() + 30000);
  } catch {
    return true;
  }
}

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

      if (!refreshToken) {
        localStorage.clear()
        router.push('/login?expired=true')
        return Promise.reject(error)
      }

      return new Promise((resolve, reject) => {
        const jenisUser = localStorage.getItem('role_user') || 'customer';

        axios.post('http://26.75.164.107:270/api/auth/refresh',
          {
            refreshToken: refreshToken
          },
          {
            headers: { 'X-Jenis-User': jenisUser }
          })
          .then(({ data }) => {
            const responseData = data.Data ? data.Data : data;

            const newToken = responseData.token || responseData.Token;
            const newRefreshToken = responseData.refreshToken || responseData.RefreshToken;

            if (!newToken) {
              throw new Error("Struktur token tidak ditemukan di response API");
            }

            localStorage.setItem('token', newToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }

            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            processQueue(null, newToken);
            resolve(api(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            localStorage.clear();
            router.push('/login?expired=true');
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          })
      })
    }

    return Promise.reject(error)
  }
)

export default api
