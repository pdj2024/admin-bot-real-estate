<script setup lang="ts">
import { inject, ref } from 'vue'
import { Icon } from '@iconify/vue'
import BaseFormGroup from '@/components/common/BaseFormGroup.vue'
import { GOOGLE_DRIVE_API_KEY } from '@/config/constants'

const state = inject<any>('propertyModalState')
if (!state) {
  throw new Error('TabMedia must be used within a component providing propertyModalState')
}

const { form, mediaImage, mediaDenah, media3d, mediaDrive } = state



const extractFolderId = (url: string): string | null => {
  const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

// Drive Link Inputs
const driveLinkInput = ref('')
const isImportingDrive = ref(false)

const importDriveFile = async (id: string, name: string) => {
  const url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${GOOGLE_DRIVE_API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to download from Drive')
  const blob = await res.blob()
  const file = new File([blob], name, { type: blob.type || 'image/jpeg' })
  
  return new Promise<void>((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        mediaDrive.previewPhotos.value.push({ 
          Id_Media: e.target.result, 
          No_Id_Media: 'new_upload', 
          Url: null, 
          Expired_At: '', 
          IsCompressed: false, 
          ContentType: file.type, 
          ThumbUrl: null, 
          Size: file.size 
        })
        mediaDrive.photos.value.push(file)
        resolve()
      }
    }
    reader.readAsDataURL(file)
  })
}

const addDriveLink = async () => {
  const link = driveLinkInput.value.trim()
  if (!link) return

  const folderId = extractFolderId(link)
  const fileId = !folderId ? (link.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1] || link.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1]) : null

  if (!folderId && !fileId) {
    alert('Format link tidak dikenali. Gunakan link file atau folder Google Drive.')
    return
  }

  isImportingDrive.value = true
  try {
    if (folderId) {
      // Fetch folder contents
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=%27${folderId}%27+in+parents+and+mimeType+contains+%27image/%27&key=${GOOGLE_DRIVE_API_KEY}&fields=files(id,name,mimeType)&pageSize=100`
      )
      const data = await res.json()
      if (data.files?.length) {
        for (const file of data.files) {
          await importDriveFile(file.id, file.name)
        }
      } else {
        alert('Folder kosong, tidak dapat diakses, atau tidak berisi gambar.')
      }
    } else if (fileId) {
      await importDriveFile(fileId, `drive_${fileId}.jpg`)
    }
    driveLinkInput.value = ''
  } catch (err) {
    console.error('Drive import error:', err)
    alert('Gagal mengunduh file dari Google Drive. Pastikan file/folder dapat diakses publik (Siapa saja yang memiliki link).')
  } finally {
    isImportingDrive.value = false
  }
}



const onPhotoChange = (event: Event) => {
  mediaImage.handlePhoto(event, null)
}

const onDenahChange = (event: Event) => {
  mediaDenah.handlePhoto(event, null)
}

const onThreeDChange = (event: Event) => {
  media3d.handlePhoto(event, null)
}
</script>

<template>
  <div class="space-y-8 scale-in pb-10">
    <!-- 1. Galeri Denah Rumah -->
    <div class="space-y-3 pt-4 border-t border-slate-100">
      <label class="label block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">DENAH PROPERTI</label>
      <div class="relative">
        <div class="preview-container flex flex-wrap gap-4">
          <div v-for="(img, i) in mediaDenah.previewPhotos.value" :key="i" class="preview-box relative size-28 flex-shrink-0 group/img rounded-2xl overflow-hidden border-2 transition-all duration-200 shadow-sm"
            :class="form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_denah_${i}`) ? 'border-amber-400 shadow-amber-200' : 'border-slate-200'"
          >
            <img :src="img.Url || img.Id_Media" class="size-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
            <!-- Thumbnail Button -->
            <button
              type="button"
              @click="form.Id_Media_Thumbnail = form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_denah_${i}`) ? '' : (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_denah_${i}`)"
              class="absolute top-2 left-2 p-1.5 bg-white/90 backdrop-blur-xs rounded-xl shadow-md border border-slate-100 hover:scale-110 transition-all"
              :title="form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_denah_${i}`) ? 'Thumbnail Utama' : 'Jadikan Thumbnail'"
            >
              <Icon
                :icon="form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_denah_${i}`) ? 'mdi:star' : 'mdi:star-outline'"
                class="size-4 transition-colors"
                :class="form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_denah_${i}`) ? 'text-amber-500' : 'text-slate-300'"
              />
            </button>
            <button @click="mediaDenah.removePhoto(i)" type="button" class="absolute top-2 right-2 size-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all border-2 border-white scale-0 group-hover/img:scale-100">
              <Icon icon="lucide:x" class="size-3.5" />
            </button>
          </div>

          <label class="size-28 border-2 border-dashed border-slate-200 rounded-2xl flex flex-shrink-0 flex-col items-center justify-center cursor-pointer hover:bg-bejo-50/50 hover:border-bejo-300 transition-all text-slate-400 group/add">
            <Icon icon="lucide:plus" class="size-6 group-hover/add:text-bejo-600 transition-colors" />
            <span class="text-[9px] font-black mt-1 group-hover/add:text-bejo-600 uppercase tracking-widest">Tambah</span>
            <input type="file" multiple hidden @change="onDenahChange" accept="image/*" />
          </label>
        </div>
      </div>
    </div>

    <!-- 2. Galeri Gambar 3D -->
    <div class="space-y-3 pt-4 border-t border-slate-100">
      <label class="label block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">VISUALISASI 3D</label>
      <div class="relative">
        <div class="preview-container flex flex-wrap gap-4">
          <div v-for="(img, i) in media3d.previewPhotos.value" :key="i" class="preview-box relative size-28 flex-shrink-0 group/img rounded-2xl overflow-hidden border-2 transition-all duration-200 shadow-sm"
            :class="form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_3d_${i}`) ? 'border-amber-400 shadow-amber-200' : 'border-slate-200'"
          >
            <img :src="img.Url || img.Id_Media" class="size-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
            <!-- Thumbnail Button -->
            <button
              type="button"
              @click="form.Id_Media_Thumbnail = form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_3d_${i}`) ? '' : (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_3d_${i}`)"
              class="absolute top-2 left-2 p-1.5 bg-white/90 backdrop-blur-xs rounded-xl shadow-md border border-slate-100 hover:scale-110 transition-all"
              :title="form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_3d_${i}`) ? 'Thumbnail Utama' : 'Jadikan Thumbnail'"
            >
              <Icon
                :icon="form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_3d_${i}`) ? 'mdi:star' : 'mdi:star-outline'"
                class="size-4 transition-colors"
                :class="form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_3d_${i}`) ? 'text-amber-500' : 'text-slate-300'"
              />
            </button>
            <button @click="media3d.removePhoto(i)" type="button" class="absolute top-2 right-2 size-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all border-2 border-white scale-0 group-hover/img:scale-100">
              <Icon icon="lucide:x" class="size-3.5" />
            </button>
          </div>

          <label class="size-28 border-2 border-dashed border-slate-200 rounded-2xl flex flex-shrink-0 flex-col items-center justify-center cursor-pointer hover:bg-bejo-50/50 hover:border-bejo-300 transition-all text-slate-400 group/add">
            <Icon icon="lucide:plus" class="size-6 group-hover/add:text-bejo-600 transition-colors" />
            <span class="text-[9px] font-black mt-1 group-hover/add:text-bejo-600 uppercase tracking-widest">Tambah</span>
            <input type="file" multiple hidden @change="onThreeDChange" accept="image/*" />
          </label>
        </div>
      </div>
    </div>

     <!-- 3. Galeri Gambar Produk -->
    <div class="space-y-3">
      <label class="label block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Foto</label>
      <div class="relative">
        <div class="preview-container flex flex-wrap gap-4">
          <div v-for="(img, i) in mediaImage.previewPhotos.value" :key="i" class="preview-box relative size-28 flex-shrink-0 group/img rounded-2xl overflow-hidden border-2 transition-all duration-200 shadow-sm"
            :class="form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_img_${i}`) ? 'border-amber-400 shadow-amber-200' : 'border-slate-200'"
          >
            <video v-if="img.ContentType?.startsWith('video/')" :src="`${img.Url || img.Id_Media}#t=0.001`" class="size-full object-cover" preload="metadata" playsinline muted></video>
            <img v-else :src="img.Url || img.Id_Media" class="size-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
            
            <!-- Set as Thumbnail (Star Button) -->
            <button 
              type="button" 
              @click="form.Id_Media_Thumbnail = form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_img_${i}`) ? '' : (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_img_${i}`)"
              class="absolute top-2 left-2 p-1.5 bg-white/90 backdrop-blur-xs rounded-xl shadow-md border border-slate-100 hover:scale-110 transition-all"
              :title="form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_img_${i}`) ? 'Thumbnail Utama' : 'Jadikan Thumbnail'"
            >
              <Icon 
                :icon="form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_img_${i}`) ? 'mdi:star' : 'mdi:star-outline'" 
                class="size-4 transition-colors"
                :class="form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_img_${i}`) ? 'text-amber-500' : 'text-slate-300'" 
              />
            </button>

            <!-- Delete Photo -->
            <button @click="mediaImage.removePhoto(i)" type="button" class="absolute top-2 right-2 size-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all border-2 border-white scale-0 group-hover/img:scale-100">
              <Icon icon="lucide:x" class="size-3.5" />
            </button>
          </div>

          <label class="size-28 border-2 border-dashed border-slate-200 rounded-2xl flex flex-shrink-0 flex-col items-center justify-center cursor-pointer hover:bg-bejo-50/50 hover:border-bejo-300 transition-all text-slate-400 group/add">
            <Icon icon="lucide:plus" class="size-6 group-hover/add:text-bejo-600 transition-colors" />
            <span class="text-[9px] font-black mt-1 group-hover/add:text-bejo-600 uppercase tracking-widest">Tambah</span>
            <input type="file" multiple hidden @change="onPhotoChange" accept="image/*,video/*" />
          </label>
        </div>
      </div>
    </div>

    <!-- 4. Google Drive Links -->
    <div class="space-y-4 pt-4 border-t border-slate-100">
        <BaseFormGroup label="TAUTAN DOKUMEN GOOGLE DRIVE (AKAN DIUNDUH KE GCS)">
          <div class="flex items-center space-x-2">
            <div class="relative flex-grow">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Icon icon="lucide:link" class="size-5" />
              </div>
              <input 
                v-model="driveLinkInput"
                type="text" 
                placeholder="Link file atau folder Google Drive (otomatis diunduh ke galeri foto)..." 
                class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all placeholder:text-slate-300"
                @keyup.enter="addDriveLink"
                :disabled="isImportingDrive"
              />
            </div>
            <button 
              @click="addDriveLink" 
              type="button" 
              :disabled="!driveLinkInput.trim() || isImportingDrive"
              class="flex-shrink-0 bg-slate-900 text-white p-2.5 rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center min-w-[44px]"
            >
              <Icon v-if="isImportingDrive" icon="lucide:loader-2" class="size-5 animate-spin" />
              <Icon v-else icon="lucide:plus" class="size-5" />
            </button>
          </div>
        </BaseFormGroup>

      <!-- Drive Files Preview Grid -->
      <div v-if="mediaDrive.previewPhotos.value?.length" class="relative mt-4">
        <div class="preview-container flex flex-wrap gap-4">
          <div v-for="(img, i) in mediaDrive.previewPhotos.value" :key="i" class="preview-box relative size-28 flex-shrink-0 group/img rounded-2xl overflow-hidden border-2 transition-all duration-200 shadow-sm"
            :class="form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_drive_${i}`) ? 'border-amber-400 shadow-amber-200' : 'border-slate-200'"
          >
            <img :src="img.Url || img.Id_Media" class="size-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
            <!-- Thumbnail Button -->
            <button
              type="button"
              @click="form.Id_Media_Thumbnail = form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_drive_${i}`) ? '' : (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_drive_${i}`)"
              class="absolute top-2 left-2 p-1.5 bg-white/90 backdrop-blur-xs rounded-xl shadow-md border border-slate-100 hover:scale-110 transition-all"
              :title="form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_drive_${i}`) ? 'Thumbnail Utama' : 'Jadikan Thumbnail'"
            >
              <Icon
                :icon="form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_drive_${i}`) ? 'mdi:star' : 'mdi:star-outline'"
                class="size-4 transition-colors"
                :class="form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_drive_${i}`) ? 'text-amber-500' : 'text-slate-300'"
              />
            </button>
            <button @click="mediaDrive.removePhoto(i)" type="button" class="absolute top-2 right-2 size-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all border-2 border-white scale-0 group-hover/img:scale-100">
              <Icon icon="lucide:x" class="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/style.css";

.label {
  @apply block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1;
}
.field-input {
  @apply w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium;
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
</style>
