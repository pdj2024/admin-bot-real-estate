import router from '@/router'
import { success } from '@/utils/sweet-alert'


export const logout = async () => {
  localStorage.clear()
  await router.push('/login')
  success("Berhasil keluar, sampai jumpa lagi")
}

export const getToken = () => {
  return localStorage.getItem('token')
}

export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken')
}

export const isAuthenticated = () => {
  return !!localStorage.getItem('token')
}
