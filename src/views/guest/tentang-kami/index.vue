<script setup lang="ts">
import { Icon } from '@iconify/vue'
import GuestLayout from '@/layouts/guest.vue'
import { useSettings } from '@/stores/settings'

const settingsStore = useSettings()

const workProcesses = [
  {
    title: 'Pencarian Unit',
    desc: 'Cari hunian sesuai preferensi lokasi, budget, dan fasilitas melalui katalog terintegrasi kami.'
  },
  {
    title: 'Konsultasi & Survei',
    desc: 'Tim kami menemani Anda melakukan inspeksi fisik unit secara mendalam sebelum pengambilan keputusan.'
  },
  {
    title: 'Finalisasi Akad',
    desc: 'Proses pengurusan admin, KPR, hingga serah terima kunci yang didampingi oleh analis legalitas.'
  }
]

const teamMembers = [
  {
    name: 'Bpk. Ahmad Bejo',
    role: 'Founder & CEO',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Sarah Wijaya',
    role: 'Real Estate Specialist',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Dimas Pratama',
    role: 'Mortgage Lead',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  }
]
</script>

<template>
  <GuestLayout>
    <div class="mb-10 print:hidden space-y-10">
      
      <!-- Breadcrumb -->

      <!-- Hero Banner -->
      <div class="relative overflow-hidden rounded-[3.5rem] bg-white p-12 md:p-16 lg:p-20 shadow-xl shadow-bejo-600/5 border border-bejo-100">
        <!-- Dekorasi Background -->
        <div class="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-bejo-50 via-bejo-50/50 to-transparent"></div>
        <div class="absolute -right-20 -top-20 size-96 bg-gradient-to-br from-bejo-100 via-bejo-200 to-bejo-400 rounded-full blur-3xl opacity-40"></div>
        <div class="absolute right-10 -bottom-20 size-64 bg-gradient-to-tr from-bejo-300 via-bejo-500 to-bejo-700 rounded-full blur-3xl opacity-10"></div>
        
        <div class="relative z-10 text-center px-6 w-full max-w-4xl mx-auto">

          <h1 class="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tight mb-6">
            Mengenal <span class="text-transparent bg-clip-text bg-gradient-to-r from-bejo-500 via-bejo-700 to-bejo-900">{{ settingsStore.business.appName }}</span>
          </h1>
          <p class="text-slate-500 text-lg sm:text-xl font-medium leading-relaxed max-w-3xl mx-auto line-clamp-3">
            {{ settingsStore.business.description }}
          </p>
        </div>
      </div>

      <!-- Content Misi Visi -->
      <div class="bg-white rounded-[2.5rem] p-8 sm:p-12 lg:p-20 shadow-xl shadow-slate-200/40 border border-slate-100 mt-8 relative overflow-hidden">
        <div class="absolute -top-40 -left-40 size-96 bg-bejo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        
        <div class="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
          <div class="space-y-8">
            <div class="space-y-4">
              <span class="text-bejo-600 font-black uppercase tracking-widest text-xs">Identitas Kami</span>
              <h2 class="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Lebih Dari Sekadar <br class="hidden lg:block" /> Broker Properti
              </h2>
            </div>
            <div class="w-20 h-2 bg-bejo-500 rounded-full"></div>
            
            <div class="space-y-6 text-slate-600 font-medium leading-relaxed text-base md:text-lg">
              <p>
                {{ settingsStore.business.appName }} didirikan dengan satu nilai fundamental: <strong>Kepercayaan Mutlak</strong>. Kami memahami bahwa properti bukan sekadar aset investasi, melainkan tempat di mana masa depan keluarga dibangun.
              </p>
              <p>
                Oleh karena itu, setiap unit dalam katalog kami melalui proses kurasi ketat meliputi pengecekan legalitas sertifikat, kualitas fisik bangunan, hingga kewajaran harga pasar agar Anda mendapatkan nilai terbaik.
              </p>
            </div>
          </div>
          
          <div class="grid grid-cols-1 gap-6">
            <div class="bg-bejo-50/20 border border-bejo-100/50 rounded-[2rem] p-8 flex gap-6 hover:shadow-xl hover:bg-white transition-all duration-300 group">
              <div class="bg-white shadow-sm rounded-2xl size-16 flex items-center justify-center shrink-0 border border-bejo-100 group-hover:bg-bejo-500 group-hover:text-white transition-colors">
                <Icon icon="lucide:target" class="size-8 text-bejo-600 group-hover:text-white" />
              </div>
              <div class="pt-1">
                <h4 class="text-xl font-black text-slate-900 mb-3">Visi Kami</h4>
                <p class="text-sm font-medium text-slate-500 leading-relaxed">
                  Menjadi ekosistem properti digital paling kredibel di Indonesia yang menjembatani impian hunian masyarakat dengan standar keamanan perbankan.
                </p>
              </div>
            </div>

            <div class="bg-bejo-50/20 border border-bejo-100/50 rounded-[2rem] p-8 flex gap-6 hover:shadow-xl hover:bg-white transition-all duration-300 group">
              <div class="bg-white shadow-sm rounded-2xl size-16 flex items-center justify-center shrink-0 border border-bejo-100 group-hover:bg-bejo-500 group-hover:text-white transition-colors">
                <Icon icon="lucide:rocket" class="size-8 text-bejo-600 group-hover:text-white" />
              </div>
              <div class="pt-1">
                <h4 class="text-xl font-black text-slate-900 mb-3">Misi Utama</h4>
                <p class="text-sm font-medium text-slate-500 leading-relaxed">
                  Menyediakan ekosistem jual-beli yang transparan, mempercepat akses kepemilikan melalui simulasi KPR akurat, serta memberikan konsultasi hukum properti gratis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Proses Kerja Step-by-Step -->
      <div class="py-12">
        <div class="text-center mb-16 space-y-4">
          <span class="text-bejo-600 font-black uppercase tracking-widest text-xs">Cara Kami Bekerja</span>
          <h2 class="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Proses Transaksi <span class="text-bejo-500">Antiribet</span></h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
           <!-- Connector Line (Desktop Only) -->
           <div class="absolute top-1/2 left-0 w-full h-px bg-slate-200 -z-0 hidden md:block border-t border-dashed"></div>
           
           <div v-for="(step, i) in workProcesses" :key="i" class="relative z-10 bg-white border border-slate-100 p-8 rounded-[2rem] shadow-lg text-center hover:shadow-2xl transition-all group">
              <div class="size-16 rounded-full bg-bejo-600 text-white flex items-center justify-center mx-auto mb-6 font-black text-2xl group-hover:bg-bejo-500 transition-colors shadow-xl shadow-bejo-600/20">
                 {{ i + 1 }}
              </div>
              <h4 class="text-xl font-black text-slate-900 mb-3">{{ step.title }}</h4>
              <p class="text-sm font-medium text-slate-500 leading-relaxed">{{ step.desc }}</p>
           </div>
        </div>
      </div>

      <!-- Tim Kami Section -->
      <div class="bg-bejo-50/50 rounded-[3rem] p-8 sm:p-16 lg:p-24 border border-bejo-100 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-1/3 h-full bg-bejo-100 blur-[120px] pointer-events-none opacity-50"></div>
        
        <div class="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          <div class="lg:w-1/2 relative z-10">
            <span class="text-bejo-600 font-black text-[10px] uppercase tracking-[0.3em] block mb-4">Di Balik Layar</span>
            <h2 class="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-8">
              Tim Profesional <br class="hidden sm:block" />
              <span class="text-bejo-500">{{ settingsStore.business.appName }}</span>
            </h2>
            <p class="text-lg text-slate-500 font-medium leading-relaxed">
              Kami terdiri dari para ahli properti, analis legalitas, dan pakar finansial yang berdedikasi tinggi bagi kepuasan Anda.
            </p>
          </div>
          <div class="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="(member, i) in teamMembers" :key="i" class="bg-white border border-bejo-100 rounded-3xl p-6 text-center hover:shadow-xl transition-all group">
                 <div class="size-24 rounded-2xl bg-bejo-50 mx-auto mb-5 overflow-hidden border border-bejo-100 group-hover:border-bejo-500 transition-colors">
                    <img :src="member.photo" :alt="member.name" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                 </div>
                 <h5 class="text-lg font-black text-slate-900 mb-1">{{ member.name }}</h5>
                 <p class="text-xs font-bold text-bejo-600 uppercase tracking-widest">{{ member.role }}</p>
              </div>
           </div>
        </div>
      </div>

    </div>
  </GuestLayout>
</template>

<style scoped>
@reference "@/assets/css/style.css";
</style>
