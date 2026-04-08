import api from './axios'
import router from '@/router'

export const isTokenExpired = (token: string | null): boolean => {
  if (!token || token === 'undefined') return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return (payload.exp * 1000) < (Date.now() + 30000);
  } catch {
    return true;
  }
}

export const logout = async () => {
  localStorage.clear();
  await router.push('/login');
}
