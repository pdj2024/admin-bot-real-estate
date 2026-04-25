import re

file_path = 'src/views/admin/chat/components/ChatContent.vue'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace destructuring
text = text.replace(
"""  const { 
    products, isLoadingProducts, searchKatalog, debouncedSearchKatalog, 
    filteredProducts, activeExpandedProductId, fetchProducts, sendProduct 
  } = useChatProducts""",
"""  const { 
    products, isLoadingProducts, searchKatalog, debouncedSearchKatalog, 
    filteredProducts, activeExpandedProductId, fetchProducts, sendProduct,
    facilitiesFilter, regionFilter, priceRangeFilter
  } = useChatProducts"""
)

# Replace Filter binding
old_filter = """      <Filter v-if="openFilter" @close="openFilter = false" ref="filterRef" class="z-[250] bg-white sm:shadow-none fixed left-1/2 bottom-20 -translate-x-1/2 w-[95vw] sm:w-[850px] sm:fixed sm:right-5 sm:bottom-24 sm:left-auto sm:translate-x-0 rounded-[2rem] shadow-2xl p-6 border border-slate-50 max-h-[85vh] overflow-y-auto custom-scrollbar" />"""

new_filter = """      <Filter 
        v-if="openFilter" 
        v-model:facilities="facilitiesFilter"
        v-model:region="regionFilter"
        v-model:priceRange="priceRangeFilter"
        @close="openFilter = false" 
        ref="filterRef" 
        class="z-[250] bg-white sm:shadow-none fixed left-1/2 bottom-20 -translate-x-1/2 w-[95vw] sm:w-[850px] sm:fixed sm:right-5 sm:bottom-24 sm:left-auto sm:translate-x-0 rounded-[2rem] shadow-2xl p-6 border border-slate-50 max-h-[85vh] overflow-y-auto custom-scrollbar" 
      />"""

text = text.replace(old_filter, new_filter)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated script block successfully")
