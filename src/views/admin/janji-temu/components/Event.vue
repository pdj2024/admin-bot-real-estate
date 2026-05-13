<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { jsPDF } from 'jspdf'
import { Icon } from '@iconify/vue'
import Swal from 'sweetalert2'
import { confirm, success, fail } from '@/utils/sweet-alert'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import idLocale from '@fullcalendar/core/locales/id'
import type { CalendarOptions } from '@fullcalendar/core'
import api from '@/services/axios'

const props = defineProps<{ openAppointment: boolean; appointment: any }>()
const emit = defineEmits(['close', 'refresh', 'openChat'])

const productData = ref<any>(null)
const isLoadingProduct = ref(false)
const isSendingBrochure = ref(false)

const getBase64ImageFromUrl = async (imageUrl: string) => {
  try {
    const res = await fetch(imageUrl)
    const blob = await res.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Gagal mengambil gambar:', error)
    return null
  }
}

const sendBrochure = async () => {
  if (!productData.value) return
  
  confirm('Kirim brosur properti ini ke customer?', async () => {
    isSendingBrochure.value = true
    try {
      const doc = new jsPDF('p', 'mm', 'a4')
      const width = doc.internal.pageSize.getWidth()
      const height = doc.internal.pageSize.getHeight()

      doc.setFillColor(202, 109, 44)
      doc.rect(0, 0, width, 60, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(24)
      doc.text('BROCHURE PROPERTI', 20, 25)
      
      doc.setFontSize(14)
      doc.setFont('helvetica', 'normal')
      doc.text('Eksklusif Dari Bejo Bot Properti', 20, 35)

      let imgBase64 = null
      if (productData.value.MediaUrls?.[0]?.ThumbUrl || productData.value.MediaUrls?.[0]?.Id_Media) {
        imgBase64 = await getBase64ImageFromUrl(productData.value.MediaUrls[0].ThumbUrl || productData.value.MediaUrls[0].Id_Media)
      }

      if (imgBase64) {
        doc.addImage(imgBase64 as string, 'JPEG', 20, 70, width - 40, 80, undefined, 'FAST')
      } else {
        doc.setFillColor(241, 245, 249)
        doc.rect(20, 70, width - 40, 80, 'F')
        doc.setTextColor(148, 163, 184)
        doc.text('Gambar tidak tersedia', width/2, 115, { align: 'center' })
      }

      doc.setTextColor(15, 23, 42)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text(productData.value.Nama_Produk, 20, 165)
      
      doc.setTextColor(202, 109, 44)
      doc.setFontSize(16)
      doc.text(`Rp ${formatPrice(productData.value.Harga_Jual2 || productData.value.Harga_Sewa2 || productData.value.Harga_Jual1)}`, 20, 175)

      doc.setTextColor(100, 116, 139)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      let specs = `Tipe: ${productData.value.Tipe}`
      if (productData.value.Jumlah_Kamar_Tidur) specs += ` | KT: ${productData.value.Jumlah_Kamar_Tidur}`
      if (productData.value.Jumlah_Kamar_Mandi) specs += ` | KM: ${productData.value.Jumlah_Kamar_Mandi}`
      if (productData.value.Jumlah_Carpot) specs += ` | Carport: ${productData.value.Jumlah_Carpot}`
      doc.text(specs, 20, 185)

      doc.setTextColor(15, 23, 42)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Lokasi:', 20, 200)
      doc.setFont('helvetica', 'normal')
      doc.text(`${productData.value.Alamat}, ${productData.value.Nama_Kota}`, 20, 207, { maxWidth: width - 40 })

      doc.setFont('helvetica', 'bold')
      doc.text('Tentang Properti:', 20, 225)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(71, 85, 105)
      doc.text(productData.value.Keterangan || 'Tidak ada deskripsi tambahan untuk properti ini.', 20, 232, { maxWidth: width - 40, align: 'justify' })

      doc.setFillColor(15, 23, 42)
      doc.rect(0, height - 30, width, 30, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.text('Hubungi kami untuk informasi lebih lanjut', width/2, height - 15, { align: 'center' })
      doc.text('www.bejobot.id', width/2, height - 10, { align: 'center' })

      const pdfBase64 = doc.output('datauristring')
      
      const phoneNumber = props.appointment.Telepon_Customer || props.appointment.Id_Customer
      let formattedPhone = phoneNumber.replace(/\D/g, '')
      if (formattedPhone.startsWith('0')) formattedPhone = '62' + formattedPhone.substring(1)
      
      await api.post('/api/waha/send-document', {
        PhoneNumber: formattedPhone + '@s.whatsapp.net',
        FileUrl: pdfBase64,
        FileName: `Brosur_${productData.value.Nama_Produk.replace(/\s+/g, '_')}.pdf`,
        Caption: `Halo ${props.appointment.Nama_Customer}, berikut adalah brosur untuk ${productData.value.Nama_Produk}.`
      })

      success('Brosur berhasil dikirim ke WhatsApp Customer')
    } catch (error) {
      console.error('Gagal mengirim brosur:', error)
      fail('Gagal mengirim brosur. Silakan coba lagi.')
    } finally {
      isSendingBrochure.value = false
    }
  })
}

const fetchProductDetails = async () => {
  if (!props.appointment?.Id_Produk) return
  isLoadingProduct.value = true
  try {
    const { data } = await api.get(`/api/realEstate/getAll?no_id=${props.appointment.Id_Produk}`)
    productData.value = data.Data?.[0] || null
  } catch (error) {
    console.error('Gagal mengambil detail produk:', error)
  } finally {
    isLoadingProduct.value = false
  }
}

watch(() => props.appointment?.No_Id, () => {
  fetchProductDetails()
}, { immediate: true })

const formatPrice = (price: number) => {
  if (!price) return 'N/A'
  if (price >= 1000000000) return (price / 1000000000).toFixed(1).replace('.0', '') + ' M'
  if (price >= 1000000) return (price / 1000000).toFixed(1).replace('.0', '') + ' Jt'
  if (price >= 1000) return (price / 1000).toFixed(1).replace('.0', '') + ' Rb'
  return price.toString()
}

const openReschedule = ref(false)
const openRescheduleForm = ref(false)
const selectedDate = ref('')
const startTime = ref('')

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: idLocale,
  height: 'auto',
  selectable: true,
  dateClick: (info) => {
    selectedDate.value = info.dateStr
    openRescheduleForm.value = true
  }
}))

const saveReschedule = async () => {
  confirm(`Konfirmasi perubahan jadwal ke ${selectedDate.value} pukul ${startTime.value}?`, async () => {
    try {
      await api.put(`/api/janjiTemu/reschedule?no_id=${props.appointment.No_Id}`, {
        Tanggal_Janji: selectedDate.value,
        Waktu_Janji: startTime.value,
        Waktu_Selesai: null,
        Alasan_Batal: 'reschedule by admin'
      }, {
        headers: { 'X-Jenis-User': 'admin' }
      })
      success('Jadwal berhasil diperbarui')
      openRescheduleForm.value = false
      openReschedule.value = false
      emit('refresh')
    } catch {
      fail('Gagal memperbarui jadwal')
    }
  })
}

const showMoreActions = ref(false)

const handleUpdateStatus = async (status: string) => {
  confirm(`Ubah status janji temu menjadi <b>${status}</b>?`, async () => {
    try {
      await api.put(`/api/janjiTemu/update-status?no_id=${props.appointment.No_Id}&status_progress=${status}`)
      success(`Status berhasil diperbarui menjadi ${status}`)
      emit('refresh')
      emit('close')
    } catch (error) {
      console.error('Gagal memperbarui status:', error)
      fail('Gagal memperbarui status janji temu')
    }
  })
}

const cancelAppointment = async () => {
  showMoreActions.value = false
  const { value: reason } = await Swal.fire({
    title: 'Batalkan Janji Temu?',
    input: 'textarea',
    inputLabel: 'Masukkan alasan pembatalan',
    inputPlaceholder: 'Contoh: User ganti jadwal atau tidak bisa dihubungi...',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Ya, Batalkan!',
    cancelButtonText: 'Kembali',
  })

  if (reason) {
    try {
      const payload = {
        ...props.appointment,
        Status_Progress: 'batal',
        Alasan_Batal: reason
      }
      await api.put(`/api/janjiTemu/update?no_id=${props.appointment.No_Id}`, payload)
      success('Janji temu telah dibatalkan')
      emit('refresh')
      emit('close')
    } catch (error) {
      console.error('Gagal membatalkan janji temu:', error)
      fail('Gagal membatalkan janji temu')
    }
  }
}

const handleDelete = async () => {
  confirm('Apakah Anda yakin ingin menghapus janji temu ini?', async () => {
    try {
      await api.delete(`/api/janjiTemu/delete?no_id=${props.appointment.No_Id}`, {
        headers: { 'X-Jenis-User': 'admin' }
      })
      success('Janji temu berhasil dihapus')
      emit('refresh')
      emit('close')
    } catch {
      fail('Gagal menghapus janji temu')
    }
  })
}
</script>

<template>
  <div v-if="props.openAppointment" class="h-full">
    <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/60 overflow-hidden h-full flex flex-col">
      <div 
        class="relative p-8 pb-14 text-white transition-colors duration-500"
        :class="props.appointment.Status_Progress === 'batal' ? 'bg-red-500' : 'bg-bejo-500'"
      >
        <div class="flex justify-between items-center mb-6">
          <span 
            class="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10"
          >
            {{ props.appointment.Status_Progress }}
          </span>
          <button @click="$emit('close')" class="size-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
            <Icon icon="lucide:x" class="size-5" />
          </button>
        </div>

        <div class="text-center">
          <div class="text-3xl font-black mb-1">
            {{ new Date(props.appointment.Tanggal_Janji).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }) }}
          </div>
          <p class="text-xs font-bold text-white/70 uppercase tracking-widest">
            {{ new Date(props.appointment.Tanggal_Janji).toLocaleDateString('id-ID', { weekday: 'long' }) }} • {{ props.appointment.Waktu_Janji }} WIB
          </p>
        </div>

        <div class="absolute -bottom-7 left-8 right-8 bg-white rounded-3xl shadow-xl shadow-bejo-900/10 border border-slate-100 p-4 flex items-center justify-between">
           <div class="flex items-center gap-3">
              <div class="size-9 rounded-xl bg-bejo-600 text-white flex items-center justify-center font-black text-xs">
                {{ (props.appointment.Nama_Customer || 'C').charAt(0) }}
              </div>
              <div class="flex flex-col">
                <span class="text-[9px] font-black text-bejo-400 uppercase tracking-tight">Customer</span>
                <span class="text-[11px] font-black text-slate-900 truncate max-w-[80px]">{{ props.appointment.Nama_Customer || props.appointment.Id_Customer }}</span>
              </div>
           </div>
           
           <div class="flex flex-col items-center">
              <Icon icon="lucide:users" class="size-4 text-slate-200" />
           </div>

           <div class="flex items-center gap-3 text-right">
              <div class="flex flex-col">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-tight">Admin</span>
                <span class="text-[11px] font-black text-slate-900 truncate max-w-[80px]">{{ props.appointment.Nama_Admin || props.appointment.Id_Admin || 'Admin' }}</span>
              </div>
              <div class="size-9 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center font-black text-xs">
                {{ (props.appointment.Nama_Admin || 'A').charAt(0) }}
              </div>
           </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar pt-10">
        <div class="px-8 pb-8 space-y-6">
          <div class="grid grid-cols-2 gap-3">
             <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Lokasi</span>
                <div class="flex items-center gap-2">
                   <Icon icon="lucide:map-pin" class="size-3.5 text-bejo-500" />
                   <span class="text-xs font-black text-slate-700 truncate">{{ props.appointment.Lokasi_Pertemuan }}</span>
                </div>
             </div>
             <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tipe</span>
                <div class="flex items-center gap-2">
                   <Icon :icon="props.appointment.Tipe_Pertemuan === 'online' ? 'lucide:video' : 'lucide:users'" class="size-3.5 text-bejo-500" />
                   <span class="text-xs font-black text-slate-700 capitalize">{{ props.appointment.Tipe_Pertemuan }}</span>
                </div>
             </div>
          </div>

          <div v-if="props.appointment.Alasan_Batal" class="p-4 bg-red-50 rounded-2xl border border-red-100">
             <span class="text-[9px] font-black text-red-400 uppercase tracking-widest block mb-1">Alasan Batal</span>
             <p class="text-xs font-bold text-red-600 italic">"{{ props.appointment.Alasan_Batal }}"</p>
          </div>

          <div class="space-y-3">
             <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Unit Properti</span>
             
             <div v-if="isLoadingProduct" class="h-20 bg-slate-50 rounded-2xl animate-pulse"></div>
             
             <a 
                v-else-if="productData" 
                :href="`/property/${productData.Slug}`" 
                target="_blank"
                class="flex gap-4 p-3 bg-white border border-slate-100 rounded-3xl hover:border-bejo-200 transition-all group cursor-pointer shadow-sm hover:shadow-md"
             >
                <img 
                   v-if="productData.MediaUrls?.[0]?.ThumbUrl || productData.MediaUrls?.[0]?.Id_Media"
                   :src="productData.MediaUrls[0].ThumbUrl || productData.MediaUrls[0].Id_Media" 
                   class="size-20 rounded-2xl object-cover"
                />
                <div class="flex-1 min-w-0 flex flex-col justify-center">
                   <h4 class="text-xs font-black text-slate-900 truncate group-hover:text-bejo-600 transition-colors">{{ productData.Nama_Produk }}</h4>
                   <p class="text-[9px] font-medium text-slate-500 truncate mb-1">
                      {{ productData.Alamat }}<span v-if="productData.Nama_Kota">, {{ productData.Nama_Kota }}</span>
                   </p>
                   
                   <div class="flex items-center gap-3 text-slate-400 mb-2">
                      <div v-if="productData.Jumlah_Kamar_Tidur" class="flex items-center gap-1">
                         <Icon icon="lucide:bed" class="size-3" />
                         <span class="text-[9px] font-bold">{{ productData.Jumlah_Kamar_Tidur }}</span>
                      </div>
                      <div v-if="productData.Jumlah_Kamar_Mandi" class="flex items-center gap-1">
                         <Icon icon="lucide:bath" class="size-3" />
                         <span class="text-[9px] font-bold">{{ productData.Jumlah_Kamar_Mandi }}</span>
                      </div>
                      <div v-if="productData.Jumlah_Carpot" class="flex items-center gap-1">
                         <Icon icon="lucide:car" class="size-3" />
                         <span class="text-[9px] font-bold">{{ productData.Jumlah_Carpot }}</span>
                      </div>
                   </div>

                   <div class="flex items-center justify-between">
                      <span class="text-[9px] font-black text-bejo-600 bg-bejo-50 px-2 py-0.5 rounded">{{ productData.Tipe }}</span>
                      <span class="text-xs font-black text-emerald-600">
                         Rp {{ formatPrice(productData.Harga_Jual2 || productData.Harga_Sewa2 || productData.Harga_Jual1) }}
                      </span>
                   </div>
                </div>
             </a>
             
             <div v-else class="text-[10px] font-bold text-slate-400 italic px-1">Produk: {{ props.appointment.Nama_Produk }}</div>
          </div>
        </div>
      </div>      <div class="p-8 bg-white border-t border-slate-100 shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
          <!-- Top Row: Hubungi & Brosur -->
          <div class="grid grid-cols-2 gap-3 mb-4">
             <button @click="$emit('openChat', props.appointment.Id_Customer)" class="px-4 py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/10 group">
               <Icon icon="lucide:message-circle" class="size-4 group-hover:scale-110 transition-transform" />
               Hubungi
            </button>
            <button 
               v-if="props.appointment.Status_Progress !== 'batal'"
               @click="sendBrochure" 
               :disabled="isSendingBrochure || !productData"
               class="px-4 py-3.5 bg-bejo-500 hover:bg-bejo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-bejo-500/10 group disabled:opacity-50"
            >
               <Icon v-if="isSendingBrochure" icon="lucide:loader-2" class="size-4 animate-spin" />
               <Icon v-else icon="lucide:file-text" class="size-4 group-hover:scale-110 transition-transform" />
               Kirim Brosur
            </button>
            <button 
               v-else 
               @click="handleDelete" 
               class="px-4 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
            >
               <Icon icon="lucide:trash-2" class="size-4" />
               Hapus Data
            </button>
          </div>
          
          <!-- Bottom Row: Primary Action & More Actions -->
          <div v-if="props.appointment.Status_Progress !== 'batal'" class="flex items-center gap-3">
             <!-- Primary Step Button -->
             <div class="flex-1">
                <button 
                   v-if="props.appointment.Status_Progress === 'baru'"
                   @click="handleUpdateStatus('dikonfirmasi')" 
                   class="w-full px-4 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
                >
                   <Icon icon="lucide:check-circle" class="size-4" />
                   Konfirmasi Janji
                </button>
                <button 
                   v-else-if="props.appointment.Status_Progress === 'dikonfirmasi'"
                   @click="handleUpdateStatus('proses')" 
                   class="w-full px-4 py-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2"
                >
                   <Icon icon="lucide:play-circle" class="size-4" />
                   Mulai Pertemuan
                </button>
                <button 
                   v-else-if="props.appointment.Status_Progress === 'proses'"
                   @click="handleUpdateStatus('selesai')" 
                   class="w-full px-4 py-3.5 bg-violet-500 hover:bg-violet-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-violet-500/10 flex items-center justify-center gap-2"
                >
                   <Icon icon="lucide:award" class="size-4" />
                   Selesaikan
                </button>
                <div v-else class="w-full py-3.5 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-center border border-emerald-100">
                   Janji Temu Selesai
                </div>
             </div>

             <!-- More Actions Button (Three Dots) -->
             <div class="relative">
                <button 
                   @click="showMoreActions = !showMoreActions"
                   class="size-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all flex items-center justify-center border border-slate-200/50"
                >
                   <Icon icon="lucide:more-horizontal" class="size-5" />
                </button>
                
                <!-- Dropdown Menu -->
                <div 
                   v-if="showMoreActions"
                   class="absolute bottom-full right-0 mb-4 w-48 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
                >
                   <button 
                      @click="openReschedule = true; showMoreActions = false" 
                      class="w-full px-5 py-3.5 text-left text-[11px] font-black text-slate-700 hover:bg-bejo-50 hover:text-bejo-600 transition-colors flex items-center gap-3 border-b border-slate-50"
                   >
                      <Icon icon="lucide:calendar-clock" class="size-4" />
                      Reschedule
                   </button>
                   <button 
                      @click="cancelAppointment" 
                      class="w-full px-5 py-3.5 text-left text-[11px] font-black text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3"
                   >
                      <Icon icon="lucide:ban" class="size-4" />
                      Batalkan Janji
                   </button>
                </div>

                <!-- Backdrop to close dropdown -->
                <div v-if="showMoreActions" @click="showMoreActions = false" class="fixed inset-0 z-40"></div>
             </div>
          </div>
      </div>v>
    </div>

    <!-- Reschedule Overlay -->
    <div v-if="openReschedule" class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-bejo-900/40 backdrop-blur-sm">
       <div class="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in duration-300">
          <div class="flex justify-between items-center mb-8">
             <h4 class="text-xl font-black text-slate-900">Pilih Jadwal Baru</h4>
             <button @click="openReschedule = false" class="text-slate-400 hover:text-slate-900"><Icon icon="lucide:x" class="size-6" /></button>
          </div>
          <FullCalendar :options="calendarOptions" class="mb-8" />
          <div v-if="openRescheduleForm" class="space-y-6">
             <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Tanggal</label>
                  <input v-model="selectedDate" type="date" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                </div>
                <div>
                  <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Pukul</label>
                  <input v-model="startTime" type="time" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                </div>
             </div>
             <button @click="saveReschedule" class="w-full py-4 bg-bejo-500 hover:bg-bejo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-bejo-500/30">
                Simpan Jadwal Baru
             </button>
          </div>
       </div>
    </div>
  </div>
</template>
