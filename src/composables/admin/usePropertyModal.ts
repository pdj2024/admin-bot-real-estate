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
  Latitude: string
  Longitude: string
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
  _isVirtualArea?: boolean
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
  const virtualCities = ref<any[]>([])
  const virtualAreas = ref<any[]>([])
  const virtualPriorities = ref<any[]>([])
  const wilayahModalParentId = ref('')

  // Wilayah Modal State
  const isWilayahModalOpen = ref(false)
  const wilayahModalType = ref('kota')

  const openWilayahModal = (type: string, parentId?: string) => {
    wilayahModalType.value = type
    wilayahModalParentId.value = parentId || ''
    isWilayahModalOpen.value = true
  }

  const fetchCities = async () => {
    try {
      const { data } = await api.get('/api/kota/getAll')
      if (data.StatusCode === 200) cities.value = data.Data
    } catch {}
  }

  const fetchAreas = async () => {
    try {
      const { data } = await api.get('/api/area/getAll')
      if (data.StatusCode === 200) areas.value = data.Data
    } catch {}
  }

  const fetchPriorities = async () => {
    try {
      const { data } = await api.get('/api/prioritas/getAll')
      if (data.StatusCode === 200) priorities.value = data.Data
    } catch {}
  }

  const createCity = async (name: string) => {
    if (!name) return null
    try {
      const payload = {
        Nama: name,
        Deskripsi: null
      }
      const { data } = await api.post('/api/kota/create', payload)
      if (data.StatusCode === 200 && data.Data) {
        await fetchCities()
        return data.Data.No_Id || data.Data.No_Id_Kota
      }
    } catch (err: any) {
      const status = err.response?.status || err.response?.data?.StatusCode
      if (status !== 409) {
        console.error('Failed to create city:', err)
      }
    }
    
    // Fallback: fetch and find by name if already exists or creation failed
    await fetchCities()
    const existing = cities.value.find(c => (c.Nama || '').toLowerCase() === name.toLowerCase())
    return existing ? (existing.No_Id || existing.No_Id_Kota) : null
  }

  const createArea = async (name: string, idKota?: string) => {
    if (!name) return null
    try {
      const payload = {
        Nama: name,
        Deskripsi: null,
        Id_Kota: idKota || ''
      }
      const { data } = await api.post('/api/area/create', payload)
      if (data.StatusCode === 200 && data.Data) {
        await fetchAreas()
        return data.Data.No_Id || data.Data.No_Id_Area
      }
    } catch (err: any) {
      const status = err.response?.status || err.response?.data?.StatusCode
      if (status !== 409) {
        console.error('Failed to create area:', err)
      }
    }
    
    // Fallback: fetch and find by name if already exists or creation failed
    await fetchAreas()
    const existing = areas.value.find(a => 
      (a.Nama || '').toLowerCase() === name.toLowerCase() && 
      (!idKota || a.Id_Kota === idKota)
    )
    return existing ? (existing.No_Id || existing.No_Id_Area) : null
  }

  const createPriority = async (name: string, idArea?: string, desc?: string) => {
    if (!name) return null
    try {
      const payload = {
        Nama: name,
        Deskripsi: desc || '',
        Id_Area: idArea || ''
      }
      const { data } = await api.post('/api/prioritas/create', payload)
      if (data.StatusCode === 200 && data.Data) {
        await fetchPriorities()
        return data.Data.No_Id || data.Data.No_Id_Prioritas
      }
    } catch (err: any) {
      const status = err.response?.status || err.response?.data?.StatusCode
      if (status !== 409) {
        console.error('Failed to create priority:', err)
      }
    }
    
    // Fallback: fetch and find by name if already exists or creation failed
    await fetchPriorities()
    const existing = priorities.value.find(p => 
      (p.Nama || '').toLowerCase() === name.toLowerCase() && 
      (!idArea || p.Id_Area === idArea)
    )
    return existing ? (existing.No_Id || existing.No_Id_Prioritas) : null
  }

  const handleWilayahSuccess = async (newData: any) => {
    if (wilayahModalType.value === 'kota') {
      if (newData?.isVirtual) {
        virtualCities.value.push(newData)
        form.value.Id_Kota = newData.No_Id
      } else {
        await fetchCities()
        if (newData) form.value.Id_Kota = newData.No_Id || newData.No_Id_Kota
      }
    } else if (wilayahModalType.value === 'area') {
      if (newData?.isVirtual) {
        virtualAreas.value.push({
          ...newData,
          Id_Kota: wilayahModalParentId.value
        })
        form.value.Id_Area = newData.No_Id
        form.value._isVirtualArea = true
      } else {
        await fetchAreas()
        if (newData) form.value.Id_Area = newData.No_Id || newData.No_Id_Area
      }
    } else if (wilayahModalType.value === 'prioritas') {
      if (newData?.isVirtual) {
        // Add to virtual list
        virtualPriorities.value.push({
          ...newData,
          Id_Area: wilayahModalParentId.value // Keep track of parent
        })
        form.value.Id_Prioritas = newData.No_Id
      } else {
        await fetchPriorities()
        if (newData) form.value.Id_Prioritas = newData.No_Id || newData.No_Id_Prioritas
      }
    }
    isWilayahModalOpen.value = false
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
    Latitude: '',
    Longitude: '',
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
      
      // 1. Detect location prioritizing Latitude and Longitude fields
      if (itemData.Latitude && itemData.Longitude) {
        location.isLocationSelected.value = true
        location.currentCoords.lat = parseFloat(itemData.Latitude)
        location.currentCoords.lng = parseFloat(itemData.Longitude)
      } else {
        // Fallback to legacy address parsing
        const latMatch = itemData.Alamat ? itemData.Alamat.match(/(?:Lat|Latitude):\s*([-+]?\d+\.?\d*)/i) : null
        const lngMatch = itemData.Alamat ? itemData.Alamat.match(/(?:Long|Lng|Longitude):\s*([-+]?\d+\.?\d*)/i) : null
        
        if (latMatch && lngMatch) {
          location.isLocationSelected.value = true
          location.currentCoords.lat = parseFloat(latMatch[1])
          location.currentCoords.lng = parseFloat(lngMatch[1])
        } else if (form.value.Area && form.value.Area[2] && form.value.Area[2].includes(',')) {
          // 2. Check Area[2] as tertiary source
          const [lat, lng] = form.value.Area[2].split(',').map(Number)
          if (!isNaN(lat) && !isNaN(lng)) {
            location.isLocationSelected.value = true
            location.currentCoords.lat = lat
            location.currentCoords.lng = lng
          }
        }
      }

      // Strip technical Lat/Long details from Alamat for a cleaner UI during edit
      if (form.value.Alamat) {
        form.value.Alamat = form.value.Alamat.split(', Lat:')[0].split('_Lat:')[0].trim()
      }

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
    } else if (form.value.Latitude && form.value.Longitude) {
      location.isLocationSelected.value = true
      location.currentCoords.lat = parseFloat(form.value.Latitude)
      location.currentCoords.lng = parseFloat(form.value.Longitude)
    } else if (form.value.Alamat) {
      const latMatch = form.value.Alamat.match(/(?:Lat|Latitude):\s*([-+]?\d+\.?\d*)/i)
      const lngMatch = form.value.Alamat.match(/(?:Long|Lng|Longitude):\s*([-+]?\d+\.?\d*)/i)
      if (latMatch && lngMatch) {
        location.isLocationSelected.value = true
        location.currentCoords.lat = parseFloat(latMatch[1])
        location.currentCoords.lng = parseFloat(lngMatch[1])
      }
    }

    nextTick(() => {
      location.geocodeExistingAddress()
    })
  }

  const submitForm = async (mode?: 'active' | 'draft') => {
    if (isLoading.value) return
    
    const targetStatus = mode === 'active' ? 'Aktif' : mode === 'draft' ? 'Draft' : form.value.Status_Display
    const isStrict = targetStatus === 'Aktif'
    
    if (isStrict) {
      const required = [form.value.Nama_Produk, form.value.Tipe, form.value.Jenis_Sertifikat, form.value.Status_Transaksi?.length, form.value.Id_Kota, form.value.Luas_Bangunan]
      const isEmpty = (v: any) => v === null || v === undefined || v === ''
      if (required.some(isEmpty)) return fail('Lengkapi semua field wajib (bintang merah) untuk mengaktifkan properti!')
      if (form.value.Status_Transaksi?.includes('Jual') && !form.value.Harga_Jual1) return fail('Harga Jual harus diisi!')
      if (form.value.Status_Transaksi?.includes('Sewa') && !form.value.Harga_Sewa1) return fail('Harga Sewa harus diisi!')
    } else {
      // Minimal validation for draft
      if (!form.value.Nama_Produk) return fail('Minimal isi Nama Properti untuk menyimpan sebagai draft!')
    }

    isLoading.value = true
    try {
      const isEdit = !!form.value.No_Id
      const targetUrl = isEdit ? `/api/realEstate/update?no_id=${form.value.No_Id}` : '/api/realEstate/create'
      
      // Handle Media Uploads
      const newMediaIds = await media.uploadAllMedia()
      
      // 1. Check if Kota is virtual
      let finalKotaId = form.value.Id_Kota
      if (finalKotaId) {
        const isRealKota = cities.value.some((c: any) => c.No_Id === finalKotaId || c.No_Id_Kota === finalKotaId)
        if (!isRealKota) {
          const virtualKota = virtualCities.value.find(c => c.No_Id === finalKotaId)
          const kotaName = virtualKota ? virtualKota.Nama : finalKotaId
          const createdKotaId = await createCity(kotaName)
          if (!createdKotaId) throw new Error('Gagal membuat kota otomatis')
          finalKotaId = createdKotaId
          form.value.Id_Kota = finalKotaId
        }
      }

      // 2. Check if Area is virtual
      let finalAreaId = form.value.Id_Area
      if (finalAreaId) {
        const isRealArea = areas.value.some((a: any) => a.No_Id === finalAreaId || a.No_Id_Area === finalAreaId)
        if (!isRealArea) {
          const virtualArea = virtualAreas.value.find(a => a.No_Id === finalAreaId)
          let areaName = virtualArea ? virtualArea.Nama : finalAreaId
          if (String(areaName).startsWith('virtual-')) {
            areaName = String(areaName).replace('virtual-', '')
          }
          const createdAreaId = await createArea(areaName, finalKotaId)
          if (!createdAreaId) throw new Error('Gagal membuat area otomatis')
          finalAreaId = createdAreaId
          form.value.Id_Area = finalAreaId
        }
      }

      // 3. Check if Priority is virtual
      let finalPrioId = form.value.Id_Prioritas
      if (finalPrioId) {
        const isRealPrio = priorities.value.some((p: any) => p.No_Id === finalPrioId || p.No_Id_Prioritas === finalPrioId)
        if (!isRealPrio) {
          const virtualPrio = virtualPriorities.value.find(p => p.No_Id === finalPrioId)
          let prioName = virtualPrio ? virtualPrio.Nama : finalPrioId
          if (String(prioName).startsWith('virtual-')) {
            prioName = String(prioName).replace('virtual-', '')
          }
          
          const createdPrioId = await createPriority(prioName, finalAreaId, virtualPrio?.Deskripsi)
          if (!createdPrioId) throw new Error('Gagal membuat prioritas otomatis')
          finalPrioId = createdPrioId
          form.value.Id_Prioritas = finalPrioId
        }
      }
      // 4. Final coordinates handling
      const currentLat = location.isLocationSelected.value ? String(location.currentCoords.lat) : ''
      const currentLng = location.isLocationSelected.value ? String(location.currentCoords.lng) : ''

      const payload = { 
        ...form.value, 
        Status_Display: targetStatus,
        Alamat: form.value.Alamat.split(', Lat:')[0].split('_Lat:')[0].trim(),
        Latitude: currentLat,
        Longitude: currentLng,
        Id_Area: finalAreaId,
        Id_Prioritas: finalPrioId,
        Luas_Tanah: String(form.value.Luas_Tanah || '0'),
        Luas_Bangunan: String(form.value.Luas_Bangunan || '0'),
        Jumlah_Lantai: String(form.value.Jumlah_Lantai || '0'),
        Jumlah_Kamar_Tidur: String(form.value.Jumlah_Kamar_Tidur || '0'),
        Jumlah_Kamar_Mandi: String(form.value.Jumlah_Kamar_Mandi || '0'),
        Jumlah_Carpot: String(form.value.Jumlah_Carpot || '0'),
        Daya_Listrik: String(form.value.Daya_Listrik || '0'),
        File_Image: [...new Set([...(form.value.File_Image || []), ...newMediaIds])], 
        Flag_Sewa: form.value.Status_Transaksi?.includes('Sewa') ? 'Ya' : 'Tidak' 
      }
      
      delete (payload as any).MediaUrls
      delete (payload as any)._isVirtualArea
      if (!isEdit) delete (payload as any).No_Id

      await api[isEdit ? 'put' : 'post'](targetUrl, payload, { headers: { 'X-Jenis-User': 'admin' } })
      
      // Cleanup deleted media
      await media.clearDeletedMedia()
      
      success(isEdit ? 'Properti diperbarui' : 'Properti ditambah')
      form.value.Status_Display = targetStatus
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
    virtualCities,
    virtualAreas,
    virtualPriorities,
    wilayahModalParentId,
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
    handleWilayahSuccess,
    // Expose sub-composable members for template access
    ...location,
    ...media
  }
}
