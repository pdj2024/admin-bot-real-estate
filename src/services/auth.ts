import axios from 'axios'
import api from './axios'
import router from '@/router'
import { success } from '@/utils/sweet-alert'

let refreshInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Cek apakah token sudah expired atau akan expired dalam 1 menit
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Toleransi 60 detik sebelum benar-benar expired
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
    console.log("REFRESH TOKEN AWAL:", refreshToken);
    const { data } = await axios.post('http://26.75.164.107:270/api/auth/refresh', {
      refreshToken: refreshToken
    });

    console.log(data)
    localStorage.setItem('token', data.token);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }

    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

    console.log("Token otomatis diperbarui (Silent Refresh Success)");
  } catch (err) {
    console.error("Gagal memperbarui token secara otomatis", err);
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
