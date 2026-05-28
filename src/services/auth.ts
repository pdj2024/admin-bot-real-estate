import router from '@/router'
import { fail, success } from '@/utils/sweet-alert'
import { isTokenExpired as checkExpired } from '@/utils/token'

export const isTokenExpired = checkExpired

export const logout = async (isManual: boolean) => {
  localStorage.removeItem('no_id');
  localStorage.removeItem('nama_display');
  localStorage.removeItem('role_user');
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('user_avatar');
  localStorage.removeItem('user_phone');
  localStorage.removeItem('email');
  localStorage.removeItem('nama_user');
  localStorage.removeItem('keterangan');
  localStorage.removeItem('max_janji_per_hari');
  localStorage.removeItem('status');
  localStorage.removeItem('tgl_created');
  localStorage.removeItem('no_id_media');
  localStorage.removeItem('user_detail');

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
