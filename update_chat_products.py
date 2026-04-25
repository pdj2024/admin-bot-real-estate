import re

file_path = 'src/composables/admin/useChatProducts.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add import
text = text.replace("import { fail } from '@/utils/sweet-alert'", "import { fail } from '@/utils/sweet-alert'\nimport { usePropertyFilters, type FacilitiesFilter, type RegionFilter, type PriceRangeFilter } from '../usePropertyFilters'")

# 2. Remove redundant interfaces
text = re.sub(r'export interface FacilitiesFilter {.*?}\n\nexport interface RegionFilter {.*?}\n\nexport interface PriceRangeFilter {.*?}\n\n', '', text, flags=re.DOTALL)

# 3. Replace the computed property
old_computed = """  const filteredProducts = computed(() => {
    let result = products.value

    // 1. Text Search
    if (debouncedSearchKatalog.value) {
      const query = debouncedSearchKatalog.value.toLowerCase()
      result = result.filter((p) => p.Nama_Produk?.toLowerCase().includes(query) || p.Slug?.toLowerCase().includes(query) || p.Alamat?.toLowerCase().includes(query))
    }

    // 2. Facilities Filter
    if (facilitiesFilter.value.kamarTidur) result = result.filter(p => (p.Jumlah_Kamar_Tidur || 0) >= Number(facilitiesFilter.value.kamarTidur))
    if (facilitiesFilter.value.kamarMandi) result = result.filter(p => (p.Jumlah_Kamar_Mandi || 0) >= Number(facilitiesFilter.value.kamarMandi))
    if (facilitiesFilter.value.carport) result = result.filter(p => (p.Jumlah_Carpot || 0) >= Number(facilitiesFilter.value.carport))
    if (facilitiesFilter.value.lantai) result = result.filter(p => (p.Jumlah_Lantai || 0) >= Number(facilitiesFilter.value.lantai))

    // 3. Region Filter
    if (regionFilter.value.province) {
      const prov = regionFilter.value.province.toLowerCase()
      result = result.filter(p => {
        const areaStr = String(Array.isArray(p.Area) ? (p.Area[0] || '') : (p.Area || ''))
        return areaStr.toLowerCase().includes(prov)
      })
    }
    if (regionFilter.value.city) {
      const city = regionFilter.value.city.toLowerCase()
      result = result.filter(p => {
        const areaStr = String(Array.isArray(p.Area) ? (p.Area[0] || '') : (p.Area || ''))
        return areaStr.toLowerCase().includes(city)
      })
    }

    // 4. Price Filter
    if (priceRangeFilter.value.min) {
      const min = Number(priceRangeFilter.value.min)
      result = result.filter(p => {
        const price = (p.Harga_Jual1 > 0 ? p.Harga_Jual1 : p.Harga_Sewa1) || 0
        return price >= min
      })
    }
    if (priceRangeFilter.value.max) {
      const max = Number(priceRangeFilter.value.max)
      result = result.filter(p => {
        const price = (p.Harga_Jual1 > 0 ? p.Harga_Jual1 : p.Harga_Sewa1) || 0
        return price <= max
      })
    }

    return result
  })"""

new_computed = """  // Use central filter composable
  const filteredProducts = usePropertyFilters(
    products, 
    debouncedSearchKatalog, 
    undefined, 
    undefined, 
    facilitiesFilter, 
    regionFilter, 
    priceRangeFilter
  )"""

text = text.replace(old_computed, new_computed)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated useChatProducts.ts successfully")
