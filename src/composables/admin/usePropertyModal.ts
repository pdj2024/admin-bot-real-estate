import { ref, watch, nextTick } from 'vue'
import { success, fail } from '@/utils/sweet-alert'
import api from '@/services/axios'
import { usePropertyLocation } from './usePropertyLocation'
import { usePropertyMedia } from './usePropertyMedia'

// TypeScript Interfaces
export interface MediaUrl {
  Url: string | null
  Expired_At: Date | string
  IsCompressed: boolean
  ContentType: string
  ThumbUrl: string | null
  Size: number
  Id_Media: string
  No_Id_Media: string
}

export interface RealEstateForm {
  No_Id: string
  Nama_Produk: string
  Alamat: string
  Hide_alamat: boolean
  Tipe: string
  Tipe_Ukuran: string
  Jenis_Sertifikat: string
  Luas_Tanah: number
  Luas_Bangunan: number
  Jumlah_Lantai: number
  Jumlah_Kamar_Tidur: number
  Jumlah_Kamar_Mandi: number
  Jumlah_Carpot: number
  Daya_Listrik: number
  Status_Display: string
  Status_Properti: string
  Status_Transaksi: string[]
  Flag_Sewa: 'Ya' | 'Tidak'
  Ada_Minimal_Sewa?: boolean
  Minimal_Sewa: number | null
  Satuan_Minimal_Sewa: 'Bulan' | 'Tahun' | ''
  Harga_Jual1: number
  Harga_Jual2: number
  Harga_Sewa1: number
  Harga_Sewa2: number
  Keterangan: string
  Slug: string
  Latitude?: string
  Longitude?: string
  Link_Maps?: string
  Area: string[]
  Akses_Jalan: string[]
  File_Image: string[]
  MediaUrls: MediaUrl[]
  Kecamatan: string
  Kelurahan: string
  Id_Kota: string
  Id_Area: string
  Id_Prioritas: string
}

export function usePropertyModal(emit: any, handleCloseFn: () => void) {
  const newAkses = ref('')
  const panjang = ref('')
  const lebar = ref('')
  const isLoading = ref(false)
  
  // Wilayah Data
  const cities = ref<any[]>([])
  const areas = ref<any[]>([])
  const priorities = ref<any[]>([])

  // Wilayah Modal State
  const isWilayahModalOpen = ref(false)
  const wilayahModalType = ref('kota')

  const openWilayahModal = (type: string) => {
    wilayahModalType.value = type
    isWilayahModalOpen.value = true
  }

  const fetchCities = async () => {
    try {
      const { data } = await api.get('/api/kota/getAll')
      if (data.StatusCode === 200) cities.value = data.Data
    } catch (err) {}
  }

  const fetchAreas = async () => {
    try {
      const { data } = await api.get('/api/area/getAll')
      if (data.StatusCode === 200) areas.value = data.Data
    } catch (err) {}
  }

  const fetchPriorities = async () => {
    try {
      const { data } = await api.get('/api/prioritas/getAll')
      if (data.StatusCode === 200) priorities.value = data.Data
    } catch (err) {}
  }

  const createCity = async (name: string) => {
    if (!name) return null
    try {
      const payload = {
        Name: name,
        Description: null
      }
      const { data } = await api.post('/api/kota/create', payload)
      if (data.StatusCode === 200) {
        await fetchCities()
        return data.Data.No_Id || data.Data.No_Id_Kota
      }
    } catch (err) {
      // If fails (maybe already exists but not matched), try to fetch and find again
      await fetchCities()
    }
    return null
  }

  const initWilayah = () => {
    fetchCities()
    fetchAreas()
    fetchPriorities()
  }
  
  const defaultForm = (): RealEstateForm => ({
    No_Id: '',
    Nama_Produk: '',
    Alamat: '',
    Hide_alamat: false,
    Tipe: 'Rumah',
    Tipe_Ukuran: '',
    Jenis_Sertifikat: '',
    Luas_Tanah: 0,
    Luas_Bangunan: 0,
    Jumlah_Lantai: 0,
    Jumlah_Kamar_Tidur: 0,
    Jumlah_Kamar_Mandi: 0,
    Jumlah_Carpot: 0,
    Daya_Listrik: 0,
    Status_Display: 'Aktif',
    Status_Properti: 'Tersedia',
    Status_Transaksi: ['Jual'],
    Flag_Sewa: 'Tidak',
    Ada_Minimal_Sewa: false,
    Minimal_Sewa: 0,
    Satuan_Minimal_Sewa: 'Tahun',
    Harga_Jual1: 0,
    Harga_Jual2: 0,
    Harga_Sewa1: 0,
    Harga_Sewa2: 0,
    Keterangan: '',
    Slug: '',
    Area: ['', '', ''],
    Akses_Jalan: [],
    File_Image: [],
    MediaUrls: [],
    Kecamatan: '',
    Kelurahan: '',
    Id_Kota: '',
    Id_Area: '',
    Id_Prioritas: ''
  })

  const form = ref<RealEstateForm>(defaultForm())
  
  // Domain sub-composables
  const location = usePropertyLocation(form, { 
    cities,
    createCity
  })
  const media = usePropertyMedia(form)

  // Watchers
  watch([panjang, lebar], ([newP, newL]) => {
    form.value.Tipe_Ukuran = (newP || newL) ? `${newP}x${newL}` : ''
  })

  watch(
    () => [...form.value.Status_Transaksi],
    (newStatus) => {
      if (!newStatus.includes('Sewa')) {
        form.value.Ada_Minimal_Sewa = false
        form.value.Minimal_Sewa = 0
        form.value.Satuan_Minimal_Sewa = ''
      }
    }
  )

  watch(
    () => form.value.Status_Properti,
    (newStatus) => {
      if (newStatus === 'Terjual' || newStatus === 'Tersewa') {
        form.value.Status_Display = 'Draft'
      }
    }
  )

  watch(
    () => [form.value.Tipe, form.value.Nama_Produk, form.value.Luas_Bangunan],
    ([newTipe, newNama, newLuas]) => {
      if (!newNama) {
        form.value.Slug = ''
        return
      }
      const baseSlug = String(newNama)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
      form.value.Slug = `${String(newTipe).toLowerCase()}-${baseSlug}-${newLuas || 0}`
    },
    { immediate: true }
  )

  const initData = (itemData?: any) => {
    media.photos.value = []
    media.previewPhotos.value = []
    media.deletedMediaIds.value = []
    location.searchQuery.value = ''

    if (itemData) {
      form.value = JSON.parse(JSON.stringify(itemData))
      
      nextTick(() => {
        location.geocodeExistingAddress()
      })

      if (itemData.Tipe_Ukuran) {
        const splitUkuran = itemData.Tipe_Ukuran.split('x')
        panjang.value = splitUkuran[0] || ''
        lebar.value = splitUkuran[1] || ''
      }

      if (itemData.MediaUrls) {
        media.previewPhotos.value = [...itemData.MediaUrls]
      }

      form.value.Ada_Minimal_Sewa = !!(itemData.Minimal_Sewa && itemData.Minimal_Sewa > 0)
      
      // Ensure Area exists if missing from itemData
      if (!form.value.Area) {
        form.value.Area = ['', '', '']
      }
    } else {
      form.value = defaultForm()
      panjang.value = ''
      lebar.value = ''
      location.isLocationSelected.value = false
    }

    if (form.value.Area && form.value.Area[2]) {
      location.isLocationSelected.value = true
      const [lat, lng] = form.value.Area[2].split(',').map(Number)
      if (!isNaN(lat) && !isNaN(lng)) {
        location.currentCoords.lat = lat
        location.currentCoords.lng = lng
      }
    }

    nextTick(() => {
      location.geocodeExistingAddress()
    })
  }

  const submitForm = async () => {
    if (isLoading.value) return
    
    // Validation
    const required = [form.value.Nama_Produk, form.value.Tipe, form.value.Jenis_Sertifikat, form.value.Status_Transaksi?.length, form.value.Area[0], form.value.Luas_Bangunan]
    if (required.some((v) => !v)) return fail('Lengkapi semua field wajib (bintang merah)!')
    if (form.value.Status_Transaksi?.includes('Jual') && !form.value.Harga_Jual1) return fail('Harga Jual harus diisi!')
    if (form.value.Status_Transaksi?.includes('Sewa') && !form.value.Harga_Sewa1) return fail('Harga Sewa harus diisi!')

    isLoading.value = true
    try {
      const isEdit = !!form.value.No_Id
      const targetUrl = isEdit ? `/api/realEstate/update?no_id=${form.value.No_Id}` : '/api/realEstate/create'
      
      // Handle Media Uploads
      const newMediaIds = await media.uploadAllMedia()
      
      const payload = { 
        ...form.value, 
        File_Image: [...new Set([...(form.value.File_Image || []), ...newMediaIds])], 
        Flag_Sewa: form.value.Status_Transaksi?.includes('Sewa') ? 'Ya' : 'Tidak' 
      }
      
      delete (payload as any).MediaUrls
      if (!isEdit) delete (payload as any).No_Id

      await api[isEdit ? 'put' : 'post'](targetUrl, payload, { headers: { 'X-Jenis-User': 'admin' } })
      
      // Cleanup deleted media
      await media.clearDeletedMedia()
      
      success(isEdit ? 'Properti diperbarui' : 'Properti ditambah')
      emit('success')
      handleCloseFn()
    } catch (err: any) {
      fail(err.response?.data?.message || err.message || 'Gagal menyimpan')
    } finally {
      isLoading.value = false
    }
  }

  return {
    form,
    newAkses,
    panjang,
    lebar,
    isLoading,
    cities,
    areas,
    priorities,
    isWilayahModalOpen,
    wilayahModalType,
    initData,
    submitForm,
    initWilayah,
    fetchCities,
    fetchAreas,
    fetchPriorities,
    createCity,
    openWilayahModal,
    // Expose sub-composable members for template access
    ...location,
    ...media
  }
}
