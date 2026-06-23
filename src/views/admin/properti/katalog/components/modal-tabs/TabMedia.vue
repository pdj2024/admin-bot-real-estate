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
        mediaImage.previewPhotos.value.push({ 
          Id_Media: e.target.result, 
          No_Id_Media: 'new_upload', 
          Url: null, 
          Expired_At: '', 
          IsCompressed: false, 
          ContentType: file.type, 
          ThumbUrl: null, 
          Size: file.size 
        })
        mediaImage.photos.value.push(file)
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
        `https://www.googleapis.com/drive/v3/files?q=%27${folderId}%27+in+parents+and+mimeType+contains+%27image/%27+and+trashed=false&key=${GOOGLE_DRIVE_API_KEY}&fields=files(id,name,mimeType)&pageSize=100`
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



const onDenahChange = (event: Event) => {
  mediaDenah.handlePhoto(event, null)
}

const onThreeDChange = (event: Event) => {
  media3d.handlePhoto(event, null)
}

const moveToCategory = (index: number, source: 'image' | 'denah' | '3d', target: 'image' | 'denah' | '3d') => {
  const mediaMap = { image: mediaImage, denah: mediaDenah, '3d': media3d }
  const fieldMap = { image: 'File_Image', denah: 'Id_Media_Denah', '3d': 'Id_Media_3d' }
  
  const sourceMedia = mediaMap[source]
  const targetMedia = mediaMap[target]
  const sourceField = fieldMap[source] as keyof typeof form.value
  const targetField = fieldMap[target] as keyof typeof form.value

  const photo = sourceMedia.previewPhotos.value[index]
  if (!photo) return
  
  if (photo.No_Id_Media === 'new_upload') {
    let currentNewUploadCount = 0
    for (let i = 0; i < index; i++) {
      if (sourceMedia.previewPhotos.value[i].No_Id_Media === 'new_upload') currentNewUploadCount++
    }
    const fileIndex = currentNewUploadCount
    const file = sourceMedia.photos.value[fileIndex]
    
    targetMedia.previewPhotos.value.push({...photo})
    targetMedia.photos.value.push(file)
    
    sourceMedia.photos.value.splice(fileIndex, 1)
  } else {
    const id = photo.No_Id_Media
    targetMedia.previewPhotos.value.push({...photo})
    
    if (!form.value[targetField]) (form.value[targetField] as string[]) = []
    ;(form.value[targetField] as string[]).push(id)
    
    if (form.value[sourceField]) {
      const arr = form.value[sourceField] as string[]
      const idIndex = arr.indexOf(id)
      if (idIndex !== -1) {
        arr.splice(idIndex, 1)
      }
    }
  }
  sourceMedia.previewPhotos.value.splice(index, 1)
}

const movingMenuOpen = ref<number | null>(null)

const isSelectionMode = ref(false)
const selectedIndices = ref<number[]>([])

const toggleSelectionMode = () => {
  isSelectionMode.value = !isSelectionMode.value
  selectedIndices.value = []
  movingMenuOpen.value = null
}

const toggleSelectImage = (index: number) => {
  if (!isSelectionMode.value) return
  const pos = selectedIndices.value.indexOf(index)
  if (pos === -1) selectedIndices.value.push(index)
  else selectedIndices.value.splice(pos, 1)
}

const moveBatchToCategory = (target: 'denah' | '3d') => {
  if (!selectedIndices.value.length) return
  const sorted = [...selectedIndices.value].sort((a, b) => b - a)
  sorted.forEach(idx => moveToCategory(idx, 'image', target))
  toggleSelectionMode()
}

const deleteBatch = () => {
  if (!selectedIndices.value.length) return
  const sorted = [...selectedIndices.value].sort((a, b) => b - a)
  sorted.forEach(idx => mediaImage.removePhoto(idx))
  toggleSelectionMode()
}
</script>

<template>
  <div class="space-y-8 scale-in pb-10">
    
    <!-- 1. Google Drive Links -->
    <div class="space-y-4 pt-4 border-t border-slate-100">
        <BaseFormGroup>
          <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Foto/Folder Drive</label>
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

    </div>
     <!-- 2. Galeri Gambar Produk -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-0">Foto Lainnya</label>
        <button v-if="mediaImage.previewPhotos.value.length > 0" @click="toggleSelectionMode" type="button" class="text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors uppercase tracking-widest" :class="isSelectionMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'">
          {{ isSelectionMode ? 'Batal Pilih' : 'Pilih Beberapa' }}
        </button>
      </div>

      <!-- Batch Actions Toolbar -->
      <div v-if="isSelectionMode && selectedIndices.length > 0" class="flex items-center gap-2 p-2 bg-bejo-50 border border-bejo-100 rounded-xl scale-in">
        <span class="text-xs font-bold text-bejo-700 px-2">{{ selectedIndices.length }} Dipilih</span>
        <div class="flex-1"></div>
        <button @click="moveBatchToCategory('denah')" type="button" class="text-[9px] font-black bg-white text-bejo-600 px-3 py-2 rounded-lg border border-bejo-200 hover:bg-bejo-600 hover:text-white transition-all uppercase tracking-widest">Ke Denah</button>
        <button @click="moveBatchToCategory('3d')" type="button" class="text-[9px] font-black bg-white text-bejo-600 px-3 py-2 rounded-lg border border-bejo-200 hover:bg-bejo-600 hover:text-white transition-all uppercase tracking-widest">Ke 3D</button>
        <button @click="deleteBatch" type="button" class="text-[9px] font-black bg-red-50 text-red-600 px-3 py-2 rounded-lg border border-red-100 hover:bg-red-500 hover:text-white transition-all ml-1 uppercase tracking-widest">Hapus</button>
      </div>

      <div class="relative">
        <div class="preview-container flex flex-wrap gap-4">
          <div v-for="(img, i) in mediaImage.previewPhotos.value" :key="i" 
               class="preview-box relative size-28 flex-shrink-0 group/img rounded-2xl overflow-hidden border-2 transition-all duration-200 shadow-sm"
               :class="[
                 form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_img_${i}`) && !isSelectionMode ? 'border-amber-400 shadow-amber-200' : 'border-slate-200',
                 isSelectionMode ? 'cursor-pointer' : '',
                 selectedIndices.includes(i) ? 'border-bejo-500 ring-2 ring-bejo-200' : ''
               ]"
               @click="toggleSelectImage(i)"
          >
            <video v-if="img.ContentType?.startsWith('video/')" :src="`${img.Url || img.Id_Media}#t=0.001`" class="size-full object-cover" preload="metadata" playsinline muted></video>
            <img v-else :src="img.Url || img.Id_Media" class="size-full object-cover transition-transform duration-500" :class="isSelectionMode ? '' : 'group-hover/img:scale-105'" />
            
            <!-- Selection Overlay -->
            <div v-if="isSelectionMode" class="absolute inset-0 bg-black/10 z-10 transition-colors" :class="selectedIndices.includes(i) ? 'bg-bejo-500/10' : ''"></div>
            <div v-if="isSelectionMode" class="absolute top-2 left-2 z-20 size-5 rounded-md border-2 flex items-center justify-center transition-colors" :class="selectedIndices.includes(i) ? 'bg-bejo-500 border-bejo-500' : 'border-white bg-black/20'">
              <Icon v-if="selectedIndices.includes(i)" icon="lucide:check" class="size-3 text-white" />
            </div>

            <!-- Set as Thumbnail (Star Button) -->
            <button v-if="!isSelectionMode"
              type="button" 
              @click.stop="form.Id_Media_Thumbnail = form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_img_${i}`) ? '' : (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_img_${i}`)"
              class="absolute top-2 left-2 p-1.5 bg-white/90 backdrop-blur-xs rounded-xl shadow-md border border-slate-100 hover:scale-110 transition-all z-10"
              :title="form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_img_${i}`) ? 'Thumbnail Utama' : 'Jadikan Thumbnail'"
            >
              <Icon 
                :icon="form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_img_${i}`) ? 'mdi:star' : 'mdi:star-outline'" 
                class="size-4 transition-colors"
                :class="form.Id_Media_Thumbnail === (img.No_Id_Media !== 'new_upload' ? img.No_Id_Media : `local_img_${i}`) ? 'text-amber-500' : 'text-slate-300'" 
              />
            </button>

            <!-- Delete Photo -->
            <button v-if="!isSelectionMode" @click.stop="mediaImage.removePhoto(i)" type="button" class="absolute top-2 right-2 size-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all border-2 border-white scale-0 group-hover/img:scale-100 z-10">
              <Icon icon="lucide:x" class="size-3.5" />
            </button>
            <!-- Move To Denah/3D Buttons -->
            <div v-if="!isSelectionMode" class="absolute bottom-1.5 left-1.5 right-1.5 flex gap-1 z-10 opacity-0 group-hover/img:opacity-100 transition-all duration-300 translate-y-2 group-hover/img:translate-y-0">
              <button @click.stop="moveToCategory(i, 'image', 'denah')" type="button" class="flex-1 bg-white/90 backdrop-blur-xs text-[8px] font-black py-1.5 rounded-lg text-slate-600 hover:text-bejo-600 hover:bg-white text-center shadow-md border border-white/50">DENAH</button>
              <button @click.stop="moveToCategory(i, 'image', '3d')" type="button" class="flex-1 bg-white/90 backdrop-blur-xs text-[8px] font-black py-1.5 rounded-lg text-slate-600 hover:text-bejo-600 hover:bg-white text-center shadow-md border border-white/50">3D</button>
            </div>
          </div>

          <label class="size-28 border-2 border-dashed border-slate-200 rounded-2xl flex flex-shrink-0 flex-col items-center justify-center cursor-pointer hover:bg-bejo-50/50 hover:border-bejo-300 transition-all text-slate-400 group/add">
            <Icon icon="lucide:plus" class="size-6 group-hover/add:text-bejo-600 transition-colors" />
            <span class="text-[9px] font-black mt-1 group-hover/add:text-bejo-600 uppercase tracking-widest">Tambah</span>
            <input type="file" multiple hidden @change="(e) => mediaImage.handlePhoto(e, null)" accept="image/*,video/*" />
          </label>
        </div>
      </div>
    </div>
    
    <!-- 3. Galeri Denah Rumah -->
    <div class="space-y-3 pt-4 border-t border-slate-100">
      <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">DENAH PROPERTI</label>
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
            <button @click="mediaDenah.removePhoto(i)" type="button" class="absolute top-2 right-2 size-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all border-2 border-white scale-0 group-hover/img:scale-100 z-10">
              <Icon icon="lucide:x" class="size-3.5" />
            </button>
            <!-- Move Buttons -->
            <div class="absolute bottom-1.5 left-1.5 right-1.5 flex gap-1 z-10 opacity-0 group-hover/img:opacity-100 transition-all duration-300 translate-y-2 group-hover/img:translate-y-0">
              <button @click.stop="moveToCategory(i, 'denah', 'image')" type="button" class="flex-1 bg-white/90 backdrop-blur-xs text-[8px] font-black py-1.5 rounded-lg text-slate-600 hover:text-bejo-600 hover:bg-white text-center shadow-md border border-white/50">LAINNYA</button>
              <button @click.stop="moveToCategory(i, 'denah', '3d')" type="button" class="flex-1 bg-white/90 backdrop-blur-xs text-[8px] font-black py-1.5 rounded-lg text-slate-600 hover:text-bejo-600 hover:bg-white text-center shadow-md border border-white/50">3D</button>
            </div>
          </div>

          <label class="size-28 border-2 border-dashed border-slate-200 rounded-2xl flex flex-shrink-0 flex-col items-center justify-center cursor-pointer hover:bg-bejo-50/50 hover:border-bejo-300 transition-all text-slate-400 group/add">
            <Icon icon="lucide:plus" class="size-6 group-hover/add:text-bejo-600 transition-colors" />
            <span class="text-[9px] font-black mt-1 group-hover/add:text-bejo-600 uppercase tracking-widest">Tambah</span>
            <input type="file" multiple hidden @change="onDenahChange" accept="image/*" />
          </label>
        </div>
      </div>
    </div>

    <!-- 4. Galeri Gambar 3D -->
    <div class="space-y-3 pt-4 border-t border-slate-100">
      <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">VISUALISASI 3D</label>
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
            <button @click="media3d.removePhoto(i)" type="button" class="absolute top-2 right-2 size-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all border-2 border-white scale-0 group-hover/img:scale-100 z-10">
              <Icon icon="lucide:x" class="size-3.5" />
            </button>
            <!-- Move Buttons -->
            <div class="absolute bottom-1.5 left-1.5 right-1.5 flex gap-1 z-10 opacity-0 group-hover/img:opacity-100 transition-all duration-300 translate-y-2 group-hover/img:translate-y-0">
              <button @click.stop="moveToCategory(i, '3d', 'image')" type="button" class="flex-1 bg-white/90 backdrop-blur-xs text-[8px] font-black py-1.5 rounded-lg text-slate-600 hover:text-bejo-600 hover:bg-white text-center shadow-md border border-white/50">LAINNYA</button>
              <button @click.stop="moveToCategory(i, '3d', 'denah')" type="button" class="flex-1 bg-white/90 backdrop-blur-xs text-[8px] font-black py-1.5 rounded-lg text-slate-600 hover:text-bejo-600 hover:bg-white text-center shadow-md border border-white/50">DENAH</button>
            </div>
          </div>

          <label class="size-28 border-2 border-dashed border-slate-200 rounded-2xl flex flex-shrink-0 flex-col items-center justify-center cursor-pointer hover:bg-bejo-50/50 hover:border-bejo-300 transition-all text-slate-400 group/add">
            <Icon icon="lucide:plus" class="size-6 group-hover/add:text-bejo-600 transition-colors" />
            <span class="text-[9px] font-black mt-1 group-hover/add:text-bejo-600 uppercase tracking-widest">Tambah</span>
            <input type="file" multiple hidden @change="onThreeDChange" accept="image/*" />
          </label>
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
