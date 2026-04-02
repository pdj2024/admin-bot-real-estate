import api from './axios'
import router from '@/router'
import { success, fail } from '@/utils/sweet-alert'

let refreshInterval: ReturnType<typeof setInterval> | null = null;
let isRefreshing = false;

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return (payload.exp * 1000) < (Date.now() + 60000);
  } catch {
    return true;
  }
}

export const logout = async (isManual: boolean = true) => {
  stopSilentRefresh();
  const currentPath = router.currentRoute.value.fullPath;

  // Bersihkan semua
  localStorage.clear();

  if (isManual) {
    await router.push('/login');
    success("Berhasil keluar, sampai jumpa lagi");
  } else {
    // Simpan path asal agar setelah login balik lagi ke sini
    await router.push({
      path: '/login',
      query: { redirect: currentPath }
    });
    fail("Sesi habis, harap login kembali");
  }
}

export const getToken = () => localStorage.getItem('token');
export const getRefreshToken = () => localStorage.getItem('refreshToken');

export const performRefresh = async () => {
  if (isRefreshing) return; // Cegah double call
  isRefreshing = true;

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    isRefreshing = false;
    return logout(false);
  }

  try {
    const { data } = await api.post('/api/auth/refresh',
      { refreshToken },
      { headers: { 'X-Jenis-User': 'admin' } }
    );

    const responseData = data.Data || data;
    const newToken = responseData.token || responseData.Token;
    const newRefreshToken = responseData.refreshToken || responseData.RefreshToken;

    if (!newToken) throw new Error("Token format invalid");

    localStorage.setItem('token', newToken);
    if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

    console.log("Token diperbarui otomatis");
    return newToken;
  } catch (err: any) {
    console.error("Refresh Token Gagal:", err.message);
    logout(false);
    throw err;
  } finally {
    isRefreshing = false;
  }
}

export const setupAxiosInterceptors = () => {
  api.interceptors.request.use(async (config) => {
    const token = getToken();
    if (token && isTokenExpired(token) && !config.url?.includes('/refresh')) {
      const newToken = await performRefresh();
      if (newToken) config.headers.Authorization = `Bearer ${newToken}`;
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => Promise.reject(error));
};

export const startSilentRefresh = () => {
  if (refreshInterval) clearInterval(refreshInterval);

  refreshInterval = setInterval(async () => {
    const token = getToken();
    if (token && isTokenExpired(token)) {
      await performRefresh();
    }
  }, 30000);
};

export const stopSilentRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};
