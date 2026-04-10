<template>
  <div class="wrapper min-h-screen bg-[#F8F9FA]">
    <div
      v-if="layout.isMobileMenuOpen"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] transition-opacity duration-300 cursor-pointer lg:hidden"
      @click="layoutStore.closeAllMenus()"
    ></div>

    <!-- Mobile Menu Sidebar -->
    <div 
      class="fixed inset-y-0 left-0 z-[100] w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col lg:hidden"
      :class="layout.isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="p-6 pb-4 border-b border-slate-100 flex justify-between items-center">
          <img :src="logo" alt="Logo" class="h-8 w-auto" />
          <button @click="layoutStore.toggleMobileMenu()" class="p-1.5 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
            <Icon icon="lucide:x" class="size-4" />
          </button>
      </div>
      <nav class="flex flex-col p-4 gap-1.5">
        <a href="/katalog" class="px-4 py-3 text-sm font-bold text-slate-700 hover:text-bejo-600 hover:bg-bejo-50 rounded-xl transition-all">Katalog</a>
        <a href="#" class="px-4 py-3 text-sm font-bold text-slate-700 hover:text-bejo-600 hover:bg-bejo-50 rounded-xl transition-all">Simulasi KPR</a>
      </nav>
    </div>

    <div class="flex flex-col min-h-screen w-full flex-grow">
      <header class="bg-white border-b border-gray-200 sticky top-0 z-[100] shadow-sm">
        <div class="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <div class="flex items-center gap-8">
            <RouterLink to="/" class="shrink-0">
              <img :src="logo" alt="Logo" class="h-8 md:h-10 w-auto" />
            </RouterLink>

            <nav class="hidden lg:flex items-center gap-6">
              <a href="/katalog" class="text-sm font-bold text-gray-700 hover:text-primary transition-all">Katalog</a>
              <a href="/simulasi-kpr" class="text-sm font-bold text-gray-700 hover:text-primary transition-all">Simulasi KPR</a>
            </nav>
          </div>

          <div class="flex items-center gap-3">
            <a href="/login" class="size-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <Icon icon="lucide:user" class="size-5 text-gray-600" />
            </a>

            <button @click="layoutStore.toggleMobileMenu()" class="lg:hidden p-2 text-gray-700">
              <Icon icon="lucide:menu" class="size-6" />
            </button>
          </div>
        </div>
      </header>



      <main :class="['flex-grow container mx-auto max-w-7xl px-4 py-6', mainClass]">
        <slot />
      </main>

      <footer class="bg-gradient-to-b from-slate-900 to-slate-950 text-slate-400 pt-16 pb-8 mt-auto border-t-[4px] border-bejo-600">
        <div class="container mx-auto max-w-7xl px-4 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <img :src="logo" alt="Logo" class="h-8 md:h-10 w-auto brightness-0 invert opacity-90" />
            <div class="h-8 w-px bg-slate-700"></div>
            <p class="text-sm font-medium">© 2026 Rumah Bejo. All rights reserved.</p>
          </div>
          <div class="flex items-center flex-wrap justify-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
            <a href="#" class="hover:text-bejo-400 transition-colors">Kebijakan Privasi</a>
            <span class="size-1.5 rounded-full bg-slate-700 hidden sm:block"></span>
            <a href="#" class="hover:text-bejo-400 transition-colors">Syarat & Ketentuan</a>
            <span class="size-1.5 rounded-full bg-slate-700 hidden sm:block"></span>
            <a href="#" class="hover:text-bejo-400 transition-colors">Bantuan</a>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useLayout } from '@/stores/layout'
import { storeToRefs } from 'pinia'
import { Icon } from '@iconify/vue'
import logo from '@/assets/images/logo-sm.png'
defineProps<{ mainClass?: string }>()

const layoutStore = useLayout()
const { layout } = storeToRefs(layoutStore)
const { setSideNavSize } = layoutStore

const resize = () => {
  if (window.innerWidth <= 1024) { // Biasanya mobile/tablet sampai 1024px
    setSideNavSize('offcanvas')
  } else {
    setSideNavSize('hover') // atau 'default' sesuai INIT_STATE Anda
  }
}

onMounted(() => {
  layoutStore.init()
  resize()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
})
</script>
