import api from './axios'
import router from '@/router'
import { fail, success } from '@/utils/sweet-alert';

export const isTokenExpired = (token: string | null): boolean => {
  if (!token || token === 'undefined') return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return (payload.exp * 1000) < (Date.now() + 30000);
  } catch {
    return true;
  }
}

export const logout = async (isManual: boolean) => {
  localStorage.removeItem('no_id');
  localStorage.removeItem('nama_display');
  localStorage.removeItem('role_user');
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');

  const currentPath = router.currentRoute.value.fullPath;
  if (isManual) {
    await router.push('/login');
    success("Berhasil keluar, sampai jumpa lagi");
  } else {
    await router.push({
      path: '/login',
      query: { redirect: currentPath }
    });
    fail("Sesi habis, harap login kembali");
  }
}
