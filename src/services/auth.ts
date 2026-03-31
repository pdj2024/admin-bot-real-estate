import axios from 'axios'
import api from './axios'
import router from '@/router'
import { success } from '@/utils/sweet-alert'

let refreshInterval: ReturnType<typeof setInterval> | null = null;

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return (payload.exp * 1000) < (Date.now() + 60000);
  } catch {
    return true;
  }
}

export const logout = async () => {
  stopSilentRefresh();
  localStorage.clear();
  await router.push('/login');
  success("Berhasil keluar, sampai jumpa lagi");
}

export const getToken = () => localStorage.getItem('token');
export const getRefreshToken = () => localStorage.getItem('refreshToken');
export const isAuthenticated = () => !!localStorage.getItem('token');

export const performRefresh = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return;

  try {
    console.log("Melakukan refresh token secara otomatis")
    const { data } = await api.post('/api/auth/refresh', {
      refreshToken: refreshToken
    }, {
      headers: { 'X-Jenis-User': 'Admin' }
    });

    const responseData = data.Data ? data.Data : data;
    const newToken = responseData.token || responseData.Token;
    const newRefreshToken = responseData.refreshToken || responseData.RefreshToken;

    if (!newToken) throw new Error("Token gagal di-parse");

    localStorage.setItem('token', newToken);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
      console.log("Berhasil mendapatkan token secara otomatis")

    }

    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  } catch (err: any) {
    console.error("Gagal memperbarui token:", err.message);

    if (err.response && err.response.data) {
      console.error("Detail isi error 400 dari server:", err.response.data);
    }

    if (err.response && (err.response.status === 400 || err.response.status === 401)) {
      console.warn("Sesi benar-benar mati, memaksa pengguna keluar.");
      logout();
    }
  }
}
export const startSilentRefresh = () => {
  if (refreshInterval) clearInterval(refreshInterval);

  refreshInterval = setInterval(async () => {
    const token = getToken();
    if (token && isTokenExpired(token)) {
      await performRefresh();
    }
  }, 60000);
};

export const stopSilentRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};
