import { ref, computed, watch } from 'vue'
import api from '@/services/axios'
import { fail } from '@/utils/sweet-alert'
import { usePropertyFilters, type FacilitiesFilter, type RegionFilter, type PriceRangeFilter } from '../usePropertyFilters'

export function useChatProducts(props: any, sendChat: any) {
  const products = ref<any[]>([])
  const isLoadingProducts = ref(false)
  const searchKatalog = ref('')
  const debouncedSearchKatalog = ref('')
  const activeExpandedProductId = ref<string | null>(null)
  
  let katalogTimeout: any = null

  watch(searchKatalog, (newVal) => {
    if (katalogTimeout) clearTimeout(katalogTimeout)
    katalogTimeout = setTimeout(() => {
      debouncedSearchKatalog.value = newVal
    }, 500)
  })

  const facilitiesFilter = ref<FacilitiesFilter>({ kamarTidur: '', kamarMandi: '', carport: '', lantai: '' })
  const regionFilter = ref<RegionFilter>({ province: '', city: '' })
  const priceRangeFilter = ref<PriceRangeFilter>({ min: '', max: '' })

  // Use central filter composable
  const filteredProducts = usePropertyFilters(
    products, 
    debouncedSearchKatalog, 
    undefined, 
    undefined, 
    facilitiesFilter, 
    regionFilter, 
    priceRangeFilter
  )

  const fetchProducts = async () => {
    if (products.value.length > 0) return
    isLoadingProducts.value = true
    try {
      const { data } = await api.get('/api/realEstate/getAll', { headers: { 'X-Jenis-User': 'Admin' } })
      products.value = data.Data
    } catch (err) {
      console.error('Fetch products error:', err)
    } finally {
      isLoadingProducts.value = false
    }
  }

  const sendProduct = async (product: any, setSendingState: (state: boolean) => void, closeEtalase: () => void) => {
    setSendingState(true)
    const config = { headers: { 'X-Jenis-User': 'admin' } }
    
    try {
      const formatCurrency = (val: number) => (!val ? 'Rp 0' : 'Rp ' + val.toLocaleString('id-ID'))
      let template = `🏡 *${product.Nama_Produk}*\n`
      const category = product.Tipe
      const location = product.Area && product.Area.length ? product.Area.join(', ') : ''
      template += `🏷️ ${category} | ${location}\n`

      const isSewa = product.Status_Transaksi && product.Status_Transaksi.includes('Sewa')
      const hargaType = isSewa ? 'Sewa' : 'Jual'
      const hargaValue = hargaType === 'Sewa' ? (product.Harga_Sewa2 == 0 ? product.Harga_Sewa1 : product.Harga_Sewa1) : product.Harga_Jual2 == 0 ? product.Harga_Jual1 : product.Harga_Jual1

      template += `💰 *Harga ${hargaType}: ${formatCurrency(hargaValue)}*\n\n`
      template += `📐 LT: ${product.Luas_Tanah || 0} m² | LB: ${product.Luas_Bangunan || 0} m²\n`
      template += `🛌 KT: ${product.Kamar_Tidur || 0} | 🚿 KM: ${product.Kamar_Mandi || 0}\n`
      if (product.Akses_Jalan && product.Akses_Jalan.length) template += `🛣️ Akses: ${product.Akses_Jalan.join(' | ')}\n`
      template += `📄 Legalitas: ${product.Jenis_Sertifikat || 'SHM'}\n\n📝 *Deskripsi:*\n${product.Keterangan || ''}`

      let urlMedia = ''
      if (product.MediaUrls && product.MediaUrls.length > 0) {
        const idMedia = product.MediaUrls[0].Id_Media || ''
        if (idMedia.includes('base64,')) urlMedia = idMedia
        else if (idMedia.startsWith('http')) {
          try {
            const response = await fetch(idMedia)
            const blob = await response.blob()
            urlMedia = await new Promise((resolve) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result as string)
              reader.readAsDataURL(blob)
            })
          } catch {
            urlMedia = idMedia
          }
        } else urlMedia = idMedia
      }

      if (!urlMedia) {
        setSendingState(false)
        return fail('Properti tidak memiliki gambar base64 valid')
      }

      let formattedPhone = props.phoneNumber.replace(/\D/g, '')
      if (formattedPhone.startsWith('0')) formattedPhone = '62' + formattedPhone.substring(1)

      const payload = {
        PhoneNumber: formattedPhone + '@s.whatsapp.net',
        FileUrl: urlMedia,
        FileName: `product_${product.No_Id || 'image'}.jpg`,
        MimeType: 'image/jpeg',
        Caption: template
      }

      await api.post('/api/waha/send-image', payload, config)

      const mediaName = product.File_Image?.[0] || 'img'
      const idPaket = `${product.No_Id}_${mediaName}`

      await sendChat('system_image_product', template, undefined, undefined, idPaket, urlMedia)

      closeEtalase()
    } catch {
      fail('Gagal mengirim properti ke WhatsApp')
    } finally {
      setSendingState(false)
    }
  }

  return {
    products,
    isLoadingProducts,
    searchKatalog,
    debouncedSearchKatalog,
    filteredProducts,
    activeExpandedProductId,
    facilitiesFilter,
    regionFilter,
    priceRangeFilter,
    fetchProducts,
    sendProduct
  }
}
