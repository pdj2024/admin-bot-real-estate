<script setup lang="ts">
import { inject, ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import BaseFormGroup from '@/components/common/BaseFormGroup.vue'
import { success, fail } from '@/utils/sweet-alert'
import Swal from 'sweetalert2'

const state = inject<any>('propertyModalState')
if (!state) {
  throw new Error('TabKunci must be used within a component providing propertyModalState')
}

const { form, kunciList, pendingKunci, submitKunci, removeKunci, isLoading } = state

const newKunciName = ref('')
const isSubmitting = ref(false)

const handleAddKunci = async () => {
  if (!newKunciName.value.trim()) {
    fail('Nama Kunci wajib diisi')
    return
  }
  
  isSubmitting.value = true
  try {
    if (form.value.No_Id) {
      // Edit mode, direct hit API
      await submitKunci(newKunciName.value.trim(), 'aktif', false)
    } else {
      // Create mode, add to pending
      pendingKunci.value.push({
        Nama_Kunci: newKunciName.value.trim(),
        Status: 'aktif'
      })
    }
    newKunciName.value = ''
  } catch (err) {
    // Error handled in composable
  } finally {
    isSubmitting.value = false
  }
}

const handleToggleStatus = async (kunci: any, isPending: boolean, index: number) => {
  const newStatus = kunci.Status === 'aktif' ? 'nonaktif' : 'aktif'
  
  if (isPending) {
    pendingKunci.value[index].Status = newStatus
  } else {
    try {
      await submitKunci(kunci.Nama_Kunci, newStatus, true, kunci.No_Id)
    } catch (err) {
      // Revert on fail
      kunci.Status = kunci.Status === 'aktif' ? 'nonaktif' : 'aktif'
    }
  }
}

const handleDeleteKunci = async (kunci: any, isPending: boolean, index: number) => {
  if (isPending) {
    pendingKunci.value.splice(index, 1)
  } else {
    const result = await Swal.fire({
      title: 'Hapus Kunci?',
      text: `Apakah Anda yakin ingin menghapus kunci "${kunci.Nama_Kunci}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    })

    if (result.isConfirmed) {
      try {
        await removeKunci(kunci.No_Id)
      } catch (err) {
        // Handled in composable
      }
    }
  }
}

const allKunci = computed(() => {
  const list = []
  if (kunciList.value) {
    list.push(...kunciList.value.map((k: any) => ({ ...k, isPending: false })))
  }
  if (pendingKunci.value) {
    list.push(...pendingKunci.value.map((k: any, index: number) => ({ ...k, isPending: true, pendingIndex: index })))
  }
  return list
})
</script>

<template>
  <div class="space-y-8 scale-in pb-10">
    <div class="space-y-6">
      <!-- Form Tambah Kunci -->
      <div>
        <label class="text-[10px] font-black text-slate-900 uppercase tracking-widest block mb-1 ml-1">TAMBAH KUNCI BARU</label>
        <div class="flex flex-col md:flex-row gap-4 items-end">
          <BaseFormGroup label="NAMA KUNCI" icon="lucide:key" required class="flex-1">
            <input v-model="newKunciName" @keyup.enter="handleAddKunci" placeholder="Contoh: Kunci Utama, Kunci Samping..." class="field-input !pl-11 bg-white" />
          </BaseFormGroup>
          <button @click="handleAddKunci" :disabled="!newKunciName.trim() || isSubmitting || isLoading" class="flex-shrink-0 bg-slate-900 text-white size-11 rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center">
            <Icon v-if="isSubmitting || isLoading" icon="lucide:loader-2" class="size-5 animate-spin shrink-0" />
            <Icon v-else icon="lucide:plus" class="size-5 shrink-0" />
          </button>
        </div>
      </div>

      <!-- List Kunci -->
      <div class="space-y-3">
        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 ml-1">DAFTAR KUNCI</label>
        
        <div v-if="allKunci.length === 0" class="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
          <Icon icon="lucide:key-round" class="size-10 text-slate-300 mx-auto mb-3" />
          <p class="text-xs font-bold text-slate-500">Belum ada kunci yang ditambahkan</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TransitionGroup name="list">
            <div v-for="(k, idx) in allKunci" :key="k.No_Id || idx" class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-bejo-200 transition-colors relative overflow-hidden">
              <div v-if="k.isPending" class="absolute top-0 right-0 bg-amber-100 text-amber-600 text-[8px] font-black px-2 py-0.5 rounded-bl-lg">PENDING</div>
              
              <div class="flex items-center gap-4">
                <div class="size-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-bejo-50 group-hover:text-bejo-600 group-hover:border-bejo-100 transition-colors shrink-0">
                  <Icon icon="lucide:key" class="size-5" />
                </div>
                <div>
                  <h5 class="text-sm font-bold text-slate-700">{{ k.Nama_Kunci }}</h5>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-[9px] font-black uppercase tracking-widest" :class="k.Status === 'aktif' ? 'text-emerald-500' : 'text-slate-400'">{{ k.Status }}</span>
                    <span v-if="k.Nama_Agent_Terakhir" class="text-[9px] font-bold text-slate-400">&bull; Last By: {{ k.Nama_Agent_Terakhir }}</span>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-3">
                <!-- Toggle Status -->
                <button v-if="form.No_Id" type="button" class="toggle shrink-0 scale-75 origin-right" :class="{ 'toggle-active': k.Status === 'aktif' }" @click="handleToggleStatus(k, k.isPending, k.pendingIndex)">
                  <span class="toggle-circle" :class="{ 'translate-x-6': k.Status === 'aktif' }"></span>
                </button>
                
                <div v-if="form.No_Id" class="w-px h-6 bg-slate-100"></div>
                
                <!-- Delete Button -->
                <button @click="handleDeleteKunci(k, k.isPending, k.pendingIndex)" class="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Hapus Kunci">
                  <Icon icon="lucide:trash-2" class="size-4" />
                </button>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.field-input {
  @apply w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium;
}
.toggle-box {
  @apply w-full flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50/50;
}
.toggle {
  @apply w-12 h-6 bg-slate-200 rounded-full relative transition-all duration-300;
}
.toggle-active {
  @apply bg-primary;
}
.toggle-circle {
  @apply absolute top-1 left-1 size-4 bg-card rounded-full transition-all duration-300 shadow-sm;
  border: none !important;
  outline: none !important;
}
.scale-in {
  animation: scale-in 0.2s ease-out;
}
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
