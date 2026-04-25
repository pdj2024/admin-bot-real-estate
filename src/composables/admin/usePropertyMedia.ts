import { ref, nextTick } from 'vue'
import axios from 'axios'
import api from '@/services/axios'

export function usePropertyMedia(form: any) {
  const photos = ref<File[]>([])
  const extensionsPhotos = ref<string[]>([])
  const previewPhotos = ref<any[]>([])
  const selectedFiles = ref<File[]>([])
  const deletedMediaIds = ref<string[]>([])

  const handlePhoto = (event: Event, scrollContainer: any) => {
    const target = event.target as HTMLInputElement
    if (!target.files) return
    const fileArray = Array.from(target.files)
    fileArray.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          previewPhotos.value.push({ 
            Id_Media: e.target.result, 
            No_Id_Media: 'new_upload', 
            Url: null, 
            Expired_At: '', 
            IsCompressed: false, 
            ContentType: file.type, 
            ThumbUrl: null, 
            Size: file.size 
          })
          extensionsPhotos.value.push(file.name.split('.').pop()?.toLowerCase() || '')
          photos.value.push(file)
          if(scrollContainer) {
            nextTick(() => {
              scrollContainer.scrollTo({ left: scrollContainer.scrollWidth, behavior: 'smooth' })
            })
          }
        }
      }
      reader.readAsDataURL(file)
    })
    target.value = ''
  }

  const removePhoto = (index: number) => {
    const photoToRemove = previewPhotos.value[index]
    if (photoToRemove.No_Id_Media === 'new_upload') {
      let currentNewUploadCount = 0
      for (let i = 0; i < index; i++) {
        if (previewPhotos.value[i].No_Id_Media === 'new_upload') currentNewUploadCount++
      }
      const newUploadIndex = currentNewUploadCount
      
      photos.value.splice(newUploadIndex, 1)
      extensionsPhotos.value.splice(newUploadIndex, 1)
      selectedFiles.value.splice(newUploadIndex, 1)
    } else {
      const idToRemove = photoToRemove.No_Id_Media
      if (form.value.File_Image) {
        const idIndex = form.value.File_Image.indexOf(idToRemove)
        if (idIndex !== -1) {
          form.value.File_Image.splice(idIndex, 1)
          deletedMediaIds.value.push(idToRemove)
        }
      }
    }
    previewPhotos.value.splice(index, 1)
  }

  const reqUploadUrl = async () => {
    const { data } = await api.post('/api/mediacloud/req-upload-url-batch', { 
      uploader_id: localStorage.getItem('no_id'), 
      extensions: extensionsPhotos.value 
    }, { headers: { 'X-Jenis-User': 'admin' } })
    return data
  }

  const sendMedia = async (uploadUrl: string, media: File) => {
    const response = await axios.put(uploadUrl, media, { 
      headers: { 'Content-Type': media.type } 
    })
    return response.data
  }

  const confirmMediaBatch = async (filesMetadata: any[]) => {
    const { data } = await api.post('/api/mediacloud/confirm-upload-batch', { 
      files: filesMetadata 
    }, { headers: { 'X-Jenis-User': 'admin' } })
    return data.MediaIds
  }

  const uploadAllMedia = async () => {
    if (photos.value.length === 0) return []
    
    const uploadTickets = await reqUploadUrl()
    const validProcessCount = Math.min(uploadTickets.length, photos.value.length)
    const activePhotos = photos.value.slice(0, validProcessCount)
    const activeTickets = uploadTickets.slice(0, validProcessCount)
    
    await Promise.all(activeTickets.map((t: any, i: number) => sendMedia(t.UploadUrl, activePhotos[i])))
    
    const finalMediaIds = await confirmMediaBatch(activeTickets.map((t: any, i: number) => ({
      id_kategori: null, 
      uploader_id: localStorage.getItem('no_id'), 
      fileName: activePhotos[i].name, 
      objectName: t.ObjectName, 
      original_size: activePhotos[i].size, 
      content_type: activePhotos[i].type
    })))
    
    return finalMediaIds
  }

  const clearDeletedMedia = async () => {
    if (deletedMediaIds.value.length) {
      api.post('/api/mediacloud/delete-batch', { ids: deletedMediaIds.value }).catch(() => {})
      deletedMediaIds.value = []
    }
  }

  return {
    photos,
    previewPhotos,
    handlePhoto,
    removePhoto,
    uploadAllMedia,
    clearDeletedMedia,
    deletedMediaIds
  }
}
