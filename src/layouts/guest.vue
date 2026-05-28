<template>
  <div class="wrapper min-h-screen bg-[#F8F9FA]">
    <template v-if="!hideHeader">
      <div
        v-if="layout.isMobileMenuOpen"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] transition-opacity duration-300 cursor-pointer lg:hidden"
        @click="layoutStore.closeAllMenus()"
      ></div>

      <!-- Mobile Menu Sidebar -->
      <div 
        class="fixed inset-y-0 left-0 z-[1001] w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col lg:hidden"
        :class="layout.isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
      >
        <div class="p-6 pb-4 border-b border-slate-100 flex justify-between items-center">
            <img :src="settingsStore.business.Logo_Company || settingsStore.business.Logo || logo" alt="Logo" class="h-8 w-auto" />
            <button @click="layoutStore.toggleMobileMenu()" class="p-1.5 text-bejo-600 hover:text-bejo-700 bg-bejo-50 hover:bg-bejo-100 rounded-lg transition-colors border border-bejo-100">
              <Icon icon="lucide:x" class="size-4" />
            </button>
        </div>
        <nav class="flex flex-col p-4 gap-2">
          <RouterLink to="/" active-class="bg-bejo-50 text-bejo-600 [&>svg]:text-bejo-500" exact-active-class="bg-bejo-50 text-bejo-600 [&>svg]:text-bejo-500" class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:text-bejo-600 hover:bg-bejo-50 rounded-xl transition-all group">
            <Icon icon="lucide:home" class="size-4 text-slate-400 group-hover:text-bejo-500 transition-colors" /> Beranda
          </RouterLink>
          <RouterLink to="/katalog" active-class="bg-bejo-50 text-bejo-600 [&>svg]:text-bejo-500" class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:text-bejo-600 hover:bg-bejo-50 rounded-xl transition-all group">
            <Icon icon="lucide:building" class="size-4 text-slate-400 group-hover:text-bejo-500 transition-colors" /> Katalog Properti
          </RouterLink>
          <RouterLink to="/simulasi-kpr" active-class="bg-bejo-50 text-bejo-600 [&>svg]:text-bejo-500" class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:text-bejo-600 hover:bg-bejo-50 rounded-xl transition-all group">
            <Icon icon="lucide:calculator" class="size-4 text-slate-400 group-hover:text-bejo-500 transition-colors" /> Simulasi KPR
          </RouterLink>
          <RouterLink v-if="isLoggedIn" to="/dashboard" active-class="bg-bejo-50 text-bejo-600 [&>svg]:text-bejo-500" class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:text-bejo-600 hover:bg-bejo-50 rounded-xl transition-all group">
            <Icon icon="lucide:layout-dashboard" class="size-4 text-slate-400 group-hover:text-bejo-500 transition-colors" /> Dashboard Admin
          </RouterLink>
          <div class="h-px w-full bg-slate-100 my-2"></div>
          <RouterLink to="/tentang-kami" active-class="bg-bejo-50 text-bejo-600 [&>svg]:text-bejo-500" class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:text-bejo-600 hover:bg-bejo-50 rounded-xl transition-all group">
            <Icon icon="lucide:users" class="size-4 text-slate-400 group-hover:text-bejo-500 transition-colors" /> Tentang Kami
          </RouterLink>
          <RouterLink to="/kontak" active-class="bg-bejo-50 text-bejo-600 [&>svg]:text-bejo-500" class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:text-bejo-600 hover:bg-bejo-50 rounded-xl transition-all group">
            <Icon icon="lucide:phone" class="size-4 text-slate-400 group-hover:text-bejo-500 transition-colors" /> Kontak
          </RouterLink>
          <RouterLink to="/faq" active-class="bg-bejo-50 text-bejo-600 [&>svg]:text-bejo-500" class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:text-bejo-600 hover:bg-bejo-50 rounded-xl transition-all group">
            <Icon icon="lucide:help-circle" class="size-4 text-slate-400 group-hover:text-bejo-500 transition-colors" /> FAQ
          </RouterLink>
        </nav>
      </div>
    </template>

    <div class="flex flex-col min-h-screen w-full flex-grow">
      <header v-if="!hideHeader" class="bg-white/80 backdrop-blur-xl border-b border-white/50 sticky top-0 z-[80] shadow-sm shadow-slate-200/50 transition-all duration-300">
        <div class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-bejo-200 to-transparent opacity-50"></div>
        <div class="w-full max-w-[1800px] mx-auto px-5 sm:px-10 lg:px-[50px] h-20 flex items-center justify-between">
          
          <div class="flex items-center gap-3 sm:gap-10">
            <RouterLink to="/" class="shrink-0 group flex items-center gap-2">
              <img :src="settingsStore.business.Logo_Company || settingsStore.business.Logo || logo" alt="Logo" class="h-9 md:h-11 w-auto transition-transform group-hover:scale-105" />
              <span class="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight block">{{ settingsStore.business.appName }}</span>
            </RouterLink>

            <nav class="hidden lg:flex items-center gap-8">
              <RouterLink to="/" active-class="text-bejo-600 [&>span]:scale-x-100" exact-active-class="text-bejo-600 [&>span]:scale-x-100" class="relative text-sm font-bold text-slate-600 hover:text-bejo-600 transition-colors group py-2">
                Beranda
                <span class="absolute inset-x-0 -bottom-1 h-1 bg-bejo-500 rounded-t-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </RouterLink>
              <RouterLink to="/katalog" active-class="text-bejo-600 [&>span]:scale-x-100" :class="route.path.startsWith('/detail/') ? 'text-bejo-600 [&>span]:scale-x-100' : ''" class="relative text-sm font-bold text-slate-600 hover:text-bejo-600 transition-colors group py-2">
                Katalog
                <span class="absolute inset-x-0 -bottom-1 h-1 bg-bejo-500 rounded-t-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" :class="route.path.startsWith('/detail/') ? 'scale-x-100' : ''"></span>
              </RouterLink>
              <RouterLink to="/simulasi-kpr" active-class="text-bejo-600 [&>span]:scale-x-100" class="relative text-sm font-bold text-slate-600 hover:text-bejo-600 transition-colors group py-2">
                Simulasi KPR
                <span class="absolute inset-x-0 -bottom-1 h-1 bg-bejo-500 rounded-t-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </RouterLink>
              <RouterLink to="/tentang-kami" active-class="text-bejo-600 [&>span]:scale-x-100" class="relative text-sm font-bold text-slate-600 hover:text-bejo-600 transition-colors group py-2">
                Tentang Kami
                <span class="absolute inset-x-0 -bottom-1 h-1 bg-bejo-500 rounded-t-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </RouterLink>
              <RouterLink to="/kontak" active-class="text-bejo-600 [&>span]:scale-x-100" class="relative text-sm font-bold text-slate-600 hover:text-bejo-600 transition-colors group py-2">
                Kontak
                <span class="absolute inset-x-0 -bottom-1 h-1 bg-bejo-500 rounded-t-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </RouterLink>
              <RouterLink to="/faq" active-class="text-bejo-600 [&>span]:scale-x-100" class="relative text-sm font-bold text-slate-600 hover:text-bejo-600 transition-colors group py-2">
                FAQ
                <span class="absolute inset-x-0 -bottom-1 h-1 bg-bejo-500 rounded-t-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </RouterLink>
              <RouterLink v-if="isLoggedIn" to="/dashboard" active-class="text-bejo-600 [&>span]:scale-x-100" class="relative text-sm font-bold text-slate-600 hover:text-bejo-600 transition-colors group py-2">
                Dashboard
                <span class="absolute inset-x-0 -bottom-1 h-1 bg-bejo-500 rounded-t-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </RouterLink>
            </nav>
          </div>

          <div class="flex items-center gap-4">
            <template v-if="isLoggedIn">
              <!-- Profile Dropdown -->
              <div class="hs-dropdown relative inline-flex [--placement:bottom-right]">
                <button id="hs-dropdown-profile" type="button" class="hs-dropdown-toggle flex items-center gap-3 px-2 py-1.5 rounded-full bg-white border border-bejo-200 text-bejo-600 hover:bg-bejo-50 hover:shadow-lg hover:shadow-bejo-600/10 transition-all font-bold text-sm group">
                  <div :class="[
                    'size-8 rounded-full flex items-center justify-center ring-2 ring-white group-hover:ring-bejo-100 transition-all overflow-hidden',
                    userAvatar ? 'bg-slate-50' : 'bg-bejo-500 text-white'
                  ]">
                    <img v-if="userAvatar" :src="userAvatar" class="size-full object-cover" />
                    <Icon v-else icon="lucide:user" class="size-4" />
                  </div>
                  <span class="hidden sm:inline">Halo, {{ userName }}</span>
                  <Icon icon="lucide:chevron-down" class="size-4 opacity-50 group-hover:opacity-100 transition-all" />
                </button>

                <div class="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-60 bg-white shadow-2xl rounded-2xl p-2 border border-slate-100 mt-2 z-50 overflow-hidden" aria-labelledby="hs-dropdown-profile">
                  <div class="px-4 py-3 mb-2 bg-bejo-50/50 rounded-xl border border-bejo-100/50 flex items-center gap-3">
                    <div :class="[
                      'size-10 rounded-lg flex items-center justify-center shadow-lg overflow-hidden shrink-0',
                      userAvatar ? 'bg-slate-50 shadow-slate-200/50' : 'bg-bejo-500 text-white shadow-bejo-500/20'
                    ]">
                      <img v-if="userAvatar" :src="userAvatar" class="size-full object-cover" />
                      <Icon v-else icon="lucide:user" class="size-5" />
                    </div>
                    <div class="overflow-hidden">
                      <p class="text-[10px] font-black text-bejo-600 uppercase tracking-widest mb-0.5">Akun Terhubung</p>
                      <p class="text-sm font-black text-slate-900 truncate">{{ userName }}</p>
                      <p class="text-[10px] font-bold text-slate-400">{{ noId }}</p>
                    </div>
                  </div>
                  
                  <div class="space-y-1">
                    <RouterLink to="/dashboard" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-bejo-50 hover:text-bejo-600 transition-all">
                      <Icon icon="lucide:layout-dashboard" class="size-4" />
                      Dasbor Admin
                    </RouterLink>
                    <button @click="handleLogout" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all">
                      <Icon icon="lucide:log-out" class="size-4" />
                      Keluar
                    </button>
                  </div>
                </div>
              </div>
            </template>

            <button @click="layoutStore.toggleMobileMenu()" class="lg:hidden p-2 text-bejo-600 bg-white border border-bejo-100 rounded-xl shadow-sm hover:bg-bejo-50 transition-colors">
              <Icon icon="lucide:menu" class="size-5" />
            </button>
          </div>
        </div>
      </header>



      <main :class="['flex-grow w-full max-w-[1800px] mx-auto px-5 sm:px-10 lg:px-[50px] pt-10 pb-32 md:py-16', mainClass]">
        <slot />
      </main>

      <footer v-if="!hideFooter" class="bg-slate-950 text-slate-400 pt-20 pb-10 border-t-[4px] border-bejo-600 relative overflow-hidden">
        <!-- Background Decor -->
        <div class="absolute -top-40 -left-40 size-80 bg-bejo-600/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div class="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none"></div>

        <div class="w-full max-w-[1800px] mx-auto px-5 sm:px-10 lg:px-[50px]">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
            
            <!-- Company Info -->
            <div class="lg:col-span-4 space-y-6">
              <img :src="settingsStore.business.Logo_Company || settingsStore.business.Logo || logo" alt="Logo" class="h-10 md:h-12 w-auto brightness-0 invert opacity-100 mb-6" />
              <p class="text-sm leading-relaxed max-w-sm text-slate-400 font-medium">
                {{ settingsStore.business.description }}
              </p>
              <!-- Social Media -->
              <div class="flex items-center gap-4 pt-4">
                <a v-if="settingsStore.business.instagram" :href="settingsStore.business.instagram" target="_blank" class="size-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-bejo-600 hover:border-bejo-500 transition-all group">
                  <Icon icon="lucide:instagram" class="size-5 group-hover:scale-110 transition-transform" />
                </a>
                <a v-if="settingsStore.business.facebook" :href="settingsStore.business.facebook" target="_blank" class="size-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-bejo-600 transition-all group">
                  <Icon icon="lucide:facebook" class="size-5 group-hover:scale-110 transition-transform" />
                </a>
                <a v-if="settingsStore.business.twitter" :href="settingsStore.business.twitter" target="_blank" class="size-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-bejo-600 transition-all group">
                  <Icon icon="lucide:twitter" class="size-5 group-hover:scale-110 transition-transform" />
                </a>
                <a v-if="settingsStore.business.tiktok" :href="settingsStore.business.tiktok" target="_blank" class="size-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-bejo-600 transition-all group">
                  <Icon icon="lucide:music" class="size-5 group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>

            <!-- Quick Links -->
            <div class="lg:col-span-2 space-y-6">
              <h4 class="text-white font-black text-sm uppercase tracking-widest">Tautan Cepat</h4>
              <nav class="flex flex-col gap-4">
                <RouterLink to="/" class="text-sm font-bold hover:text-bejo-400 transition-colors">Beranda</RouterLink>
                <RouterLink to="/katalog" class="text-sm font-bold hover:text-bejo-400 transition-colors">Katalog Properti</RouterLink>
                <RouterLink to="/simulasi-kpr" class="text-sm font-bold hover:text-bejo-400 transition-colors">Simulasi KPR</RouterLink>
                <RouterLink to="/tentang-kami" class="text-sm font-bold hover:text-bejo-400 transition-colors">Tentang Kami</RouterLink>
                <RouterLink to="/kontak" class="text-sm font-bold hover:text-bejo-400 transition-colors">Hubungi Kami</RouterLink>
                <RouterLink to="/faq" class="text-sm font-bold hover:text-bejo-400 transition-colors">FAQ (Bantuan)</RouterLink>
              </nav>
            </div>

            <!-- Contact Info -->
            <div class="lg:col-span-3 space-y-6">
              <h4 class="text-white font-black text-sm uppercase tracking-widest">Hubungi Kami</h4>
              <ul class="space-y-5">
                <li class="flex items-start gap-4 group">
                  <div class="size-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-bejo-500 shrink-0">
                    <Icon icon="lucide:map-pin" class="size-5" />
                  </div>
                  <div class="text-sm">
                    <span class="block text-white font-black mb-1">Kantor Pusat</span>
                    <p class="text-slate-400 font-medium leading-relaxed">{{ settingsStore.business.address }}</p>
                  </div>
                </li>
                <li class="flex items-start gap-4 group">
                  <div class="size-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-bejo-500 shrink-0">
                    <Icon icon="lucide:phone" class="size-5" />
                  </div>
                  <div class="text-sm">
                    <span class="block text-white font-black mb-1">Telepon / WA</span>
                    <p class="text-slate-400 font-medium leading-relaxed">{{ settingsStore.business.phone }}</p>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Maps Card -->
            <div class="lg:col-span-3 space-y-6">
              <h4 class="text-white font-black text-sm uppercase tracking-widest">Lokasi Kami</h4>
              <div class="rounded-2xl border border-slate-800 overflow-hidden h-44 bg-slate-900 relative group shadow-2xl">
                <template v-if="settingsStore.business.mapUrl">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameborder="0" 
                    scrolling="no" 
                    marginheight="0" 
                    marginwidth="0" 
                    :src="settingsStore.business.mapUrl.includes('http') 
                      ? settingsStore.business.mapUrl 
                      : `https://maps.google.com/maps?q=${settingsStore.business.mapUrl.replace('Lat:','').replace('Long:','').replace('Lat :','').replace('Long :','')}&t=&z=13&ie=UTF8&iwloc=&output=embed`"
                    class="opacity-60 group-hover:opacity-100 transition-opacity duration-700"
                  ></iframe>
                  <div class="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>
                  <a 
                    :href="settingsStore.business.mapUrl.includes('http') 
                      ? settingsStore.business.mapUrl 
                      : `https://www.google.com/maps?q=${settingsStore.business.mapUrl.replace('Lat:','').replace('Long:','').replace('Lat :','').replace('Long :','')}`" 
                    target="_blank" 
                    class="absolute bottom-3 inset-x-3 text-center"
                  >
                    <!-- <span class="text-[10px] font-black text-white uppercase tracking-widest bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 hover:bg-bejo-600 transition-colors pointer-events-auto">Buka di Google Maps</span> -->
                  </a>
                </template>
                <template v-else>
                  <div class="absolute inset-0 bg-slate-800 flex items-center justify-center">
                    <Icon icon="lucide:map" class="size-12 text-slate-700 opacity-20" />
                  </div>
                </template>
              </div>
            </div>

          </div>

          <!-- Bottom Footer -->
          <div class="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
            <p class="text-sm font-medium">© {{ new Date().getFullYear() }} {{ settingsStore.business.appName || 'Rumah Bejo' }}. All rights reserved.</p>
            <div class="flex items-center flex-wrap justify-center gap-6 text-xs font-bold uppercase tracking-widest text-slate-500">
              <a href="#" class="hover:text-bejo-400 transition-colors">Kebijakan Privasi</a>
              <a href="#" class="hover:text-bejo-400 transition-colors">Syarat & Ketentuan</a>
              <a href="#" class="hover:text-bejo-400 transition-colors">Peta Situs</a>
            </div>
          </div>
        </div>
      </footer>

      <!-- Floating WhatsApp Button -->
      <div v-if="!isDetailRoute" class="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[999] flex flex-col items-end gap-3 group print:hidden">
        <div class="bg-white px-4 py-2 rounded-2xl shadow-premium border border-bejo-100 text-[10px] font-black text-slate-800 uppercase tracking-widest translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none mb-1">
          Butuh Bantuan?
        </div>
        <a 
          :href="'https://wa.me/' + (settingsStore.business.whatsapp || '6287700083370')" 
          target="_blank"
          class="size-14 md:size-18 rounded-[1.8rem] md:rounded-[2.2rem] bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:bg-emerald-600 hover:rotate-12 hover:scale-110 active:scale-95 transition-all duration-500 relative"
        >
          <div class="absolute inset-0 rounded-inherit bg-emerald-500 animate-ping opacity-25 group-hover:opacity-40"></div>
          <Icon icon="ic:baseline-whatsapp" class="size-7 md:size-9 relative z-10" />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useLayout } from '@/stores/layout'
import { useSettings } from '@/stores/settings'
import { storeToRefs } from 'pinia'
import { Icon } from '@iconify/vue'
import logo from '@/assets/images/logo-sm.png'
import { logout } from '@/services/auth'
import { confirm } from '@/utils/sweet-alert'
import { useRoute } from 'vue-router'

defineProps<{ 
  mainClass?: string,
  hideHeader?: boolean,
  hideFooter?: boolean
}>()

const layoutStore = useLayout()
const settingsStore = useSettings()
const { layout } = storeToRefs(layoutStore)
const route = useRoute()
const isDetailRoute = computed(() => {
  return route.path.includes('/properti/detail/') || route.name === 'property-detail' || route.path.includes('/detail/')
})
const { setSideNavSize } = layoutStore

const isLoggedIn = ref(false)
const userName = ref('')
const noId = ref('')
const userAvatar = ref('')

const handleLogout = () => {
  confirm('Apakah Anda ingin keluar dari sesi ini?', () => {
    logout(true)
  })
}

const resize = () => {
  if (window.innerWidth <= 1024) { // Biasanya mobile/tablet sampai 1024px
    setSideNavSize('offcanvas')
  } else {
    setSideNavSize('hover') // atau 'default' sesuai INIT_STATE Anda
  }
}

onMounted(() => {
  layoutStore.init()
  settingsStore.init()
  
  // Check login session
  const token = localStorage.getItem('token')
  const name = localStorage.getItem('nama_display')
  const idValue = localStorage.getItem('no_id')
  if (token && token !== 'undefined') {
    isLoggedIn.value = true
    userName.value = name || 'User'
    noId.value = idValue || '-'
    userAvatar.value = localStorage.getItem('user_avatar') || ''
    
    // Initialize Preline for the dropdown
    nextTick(() => {
      if (window.HSStaticMethods?.autoInit) {
        window.HSStaticMethods.autoInit()
      }
    })
  }

  resize()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
})
</script>
