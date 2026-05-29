import { computed, type Ref, type ComputedRef } from 'vue'

export interface FacilitiesFilter {
  kamarTidur: string | number
  kamarMandi: string | number
  carport: string | number
  lantai: string | number
  rowJalanMin?: string | number
  rowJalanMax?: string | number
}

export interface RegionFilter {
  province: string
  city: string
  provinceId?: string
}

export interface PriceRangeFilter {
  min: string | number
  max: string | number
}

const cleanLocationText = (str: any) => {
  if (!str) return ''
  return String(str)
    .toLowerCase()
    .replace(/\b(kota|kabupaten|kab\.|kab)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function usePropertyFilters(
  products: Ref<any[]>,
  searchQuery: Ref<string>,
  transactionFilter?: Ref<string>,
  typeFilter?: Ref<string>,
  facilitiesFilter?: Ref<FacilitiesFilter>,
  regionFilter?: Ref<RegionFilter>,
  priceRangeFilter?: Ref<PriceRangeFilter>,
  isAdmin?: ComputedRef<boolean> | Ref<boolean>
): ComputedRef<any[]> {
  return computed(() => {
    let result = products.value

    // 0. Base Status Filter (Guest only shows Aktif & Tersedia)
    if (!isAdmin?.value) {
      result = result.filter(p => p.Status_Display === 'Aktif' && p.Status_Properti === 'Tersedia')
    }

    // 1. Text Search
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (p) =>
          (p.Nama_Produk?.toLowerCase() || '').includes(q) ||
          (p.Alamat?.toLowerCase() || '').includes(q) ||
          (p.Slug?.toLowerCase() || '').includes(q) ||
          (p.Akses_Jalan?.some((akses: any) => String(akses).toLowerCase().includes(q)))
      )
    }

    // 2. Transaction Filter
    if (transactionFilter && transactionFilter.value && transactionFilter.value !== 'Semua' && transactionFilter.value !== 'Semua Label') {
      const val = transactionFilter.value
      if (val === 'Jual Saja') {
        result = result.filter((p) => p.Status_Transaksi?.includes('Jual') && !p.Status_Transaksi?.includes('Sewa'))
      } else if (val === 'Sewa Saja') {
        result = result.filter((p) => !p.Status_Transaksi?.includes('Jual') && p.Status_Transaksi?.includes('Sewa'))
      } else if (val === 'Jual & Sewa') {
        result = result.filter((p) => p.Status_Transaksi?.includes('Jual') && p.Status_Transaksi?.includes('Sewa'))
      } else {
        // Fallback for Admin/Chat which uses pure labels like 'Jual' or 'Sewa'
        result = result.filter((p) => p.Status_Transaksi && p.Status_Transaksi.includes(val))
      }
    }

    // 3. Type Filter
    if (typeFilter && typeFilter.value && typeFilter.value !== 'Semua' && typeFilter.value !== 'Semua Tipe') {
      result = result.filter((p) => p.Tipe === typeFilter.value)
    }

    // 4. Facilities Filter
    if (facilitiesFilter && facilitiesFilter.value) {
      if (facilitiesFilter.value.kamarTidur) {
        result = result.filter((p) => (p.Jumlah_Kamar_Tidur || 0) >= Number(facilitiesFilter.value.kamarTidur))
      }
      if (facilitiesFilter.value.kamarMandi) {
        result = result.filter((p) => (p.Jumlah_Kamar_Mandi || 0) >= Number(facilitiesFilter.value.kamarMandi))
      }
      if (facilitiesFilter.value.carport) {
        result = result.filter((p) => (p.Jumlah_Carpot || 0) >= Number(facilitiesFilter.value.carport))
      }
      if (facilitiesFilter.value.lantai) {
        result = result.filter((p) => (p.Jumlah_Lantai || 0) >= Number(facilitiesFilter.value.lantai))
      }
      if (facilitiesFilter.value.rowJalanMin) {
        result = result.filter((p) => (p.Row_Jalan || 0) >= Number(facilitiesFilter.value.rowJalanMin))
      }
      if (facilitiesFilter.value.rowJalanMax) {
        result = result.filter((p) => (p.Row_Jalan || 0) <= Number(facilitiesFilter.value.rowJalanMax))
      }
    }

    // 5. Region Filter
    if (regionFilter && regionFilter.value) {
      if (regionFilter.value.province) {
        const prov = cleanLocationText(regionFilter.value.province)
        result = result.filter((p) => {
          const areaStr = Array.isArray(p.Area) ? p.Area.join(', ') : p.Area || ''
          const locationStr = cleanLocationText(`${p.Nama_Kota || ''} ${areaStr} ${p.Alamat || ''}`)
          return locationStr.includes(prov) || prov.includes(locationStr)
        })
      }
      if (regionFilter.value.city) {
        const city = cleanLocationText(regionFilter.value.city)
        result = result.filter((p) => {
          const areaStr = Array.isArray(p.Area) ? p.Area.join(', ') : p.Area || ''
          const locationStr = cleanLocationText(`${p.Nama_Kota || ''} ${areaStr} ${p.Alamat || ''}`)
          return locationStr.includes(city) || city.includes(locationStr)
        })
      }
    }

    // 6. Price Filter
    if (priceRangeFilter && priceRangeFilter.value) {
      if (priceRangeFilter.value.min) {
        const min = Number(priceRangeFilter.value.min)
        result = result.filter((p) => {
          const price = (p.Harga_Jual1 > 0 ? p.Harga_Jual1 : p.Harga_Sewa1) || 0
          return price >= min
        })
      }
      if (priceRangeFilter.value.max) {
        const max = Number(priceRangeFilter.value.max)
        result = result.filter((p) => {
          const price = (p.Harga_Jual1 > 0 ? p.Harga_Jual1 : p.Harga_Sewa1) || 0
          return price <= max
        })
      }
    }

    return result
  })
}
