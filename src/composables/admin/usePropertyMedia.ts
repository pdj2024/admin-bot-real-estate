import { ref, nextTick } from 'vue'
import axios from 'axios'
import api from '@/services/axios'

export function usePropertyMedia(form: any, fieldKey = 'File_Image') {
  const photos = ref<File[]>([])
  const extensionsPhotos = ref<string[]>([])
  const previewPhotos = ref<any[]>([])
  const selectedFiles = ref<File[]>([])
  const deletedMediaIds = ref<string[]>([])

  const isCompressing = ref(false)
  const currentCompressionIndex = ref(0)
  const totalVideosToCompress = ref(0)

  const compressVideo = async (file: File): Promise<File> => {
    // Only compress if video is larger than 4MB
    if (file.size <= 4 * 1024 * 1024) return file

    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.muted = true
      video.volume = 0
      const reader = new FileReader()

      reader.onload = (e) => {
        video.src = e.target?.result as string
        video.onloadedmetadata = () => {
          const stream = (video as any).captureStream ? (video as any).captureStream() : (video as any).mozCaptureStream()
          const supportedMimeTypes = [
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm',
            'video/mp4'
          ]
          const mimeType = supportedMimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || ''
          
          const recorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: 1500000 // Target ~1.5 Mbps
          })

          const chunks: Blob[] = []
          recorder.ondataavailable = (e) => chunks.push(e.data)
          recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' })
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webm", {
              type: 'video/webm'
            })
            resolve(compressedFile)
          }

          video.currentTime = 0
          video.playbackRate = 4.0 // Speed up compression 4x
          video.play().catch(err => console.warn('Video play failed during compression:', err))
          recorder.start()
          
          video.onended = () => {
            recorder.stop()
            video.src = ''
          }
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handlePhoto = async (event: Event, scrollContainer: any) => {
    const target = event.target as HTMLInputElement
    if (!target.files) return
    const fileArray = Array.from(target.files)
    
    // No immediate compression here anymore as requested
    for (const file of fileArray) {
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
    }
    
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
      if (form.value[fieldKey]) {
        const idIndex = form.value[fieldKey].indexOf(idToRemove)
        if (idIndex !== -1) {
          form.value[fieldKey].splice(idIndex, 1)
          if (idToRemove && photoToRemove.Id_Media) {
            deletedMediaIds.value.push(idToRemove)
          }
        }
      }
    }
    previewPhotos.value.splice(index, 1)
  }

  const loadExistingMedia = async (ids: string[]) => {
    previewPhotos.value = []
    if (!ids || ids.length === 0) return
    try {
      const { data } = await api.post('/api/mediacloud/read-url-batch', { ids }, {
        headers: { 'X-Jenis-User': 'admin' }
      })
      
      const failedIds = data.failed || []
      const successIds = data.success ? Object.keys(data.success) : []
      
      if (failedIds.length > 0 && form.value[fieldKey]) {
        form.value[fieldKey] = form.value[fieldKey].filter((id: string) => !failedIds.includes(id))
      }

      if (data.success) {
        previewPhotos.value = successIds.map(id => {
          const resolved = data.success[id]
          return {
            Id_Media: resolved?.Url || id,
            No_Id_Media: id,
            Url: resolved?.Url || null,
            ContentType: resolved?.ContentType || 'image/jpeg',
            Size: resolved?.Size || 0
          }
        })
      }
    } catch (err) {
      console.error('Failed to load existing GCS previews:', err)
    }
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
    
    // Process compression here just before upload
    isCompressing.value = true
    const videos = photos.value.filter(f => f.type.startsWith('video/') && f.size > 4 * 1024 * 1024)
    totalVideosToCompress.value = videos.length
    currentCompressionIndex.value = 0

    const processedPhotos: File[] = []
    const processedExtensions: string[] = []

    try {
      for (const file of photos.value) {
        if (file.type.startsWith('video/') && file.size > 4 * 1024 * 1024) {
          try {
            currentCompressionIndex.value++
            const compressed = await compressVideo(file)
            processedPhotos.push(compressed)
            processedExtensions.push(compressed.name.split('.').pop()?.toLowerCase() || '')
          } catch (error) {
            console.error('Video compression failed during upload:', error)
            processedPhotos.push(file)
            processedExtensions.push(file.name.split('.').pop()?.toLowerCase() || '')
          }
        } else {
          processedPhotos.push(file)
          processedExtensions.push(file.name.split('.').pop()?.toLowerCase() || '')
        }
      }
    } finally {
      isCompressing.value = false
    }

    const uploadTickets = await reqUploadUrlBatch(processedExtensions)
    const validProcessCount = Math.min(uploadTickets.length, processedPhotos.length)
    const activePhotos = processedPhotos.slice(0, validProcessCount)
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

  const reqUploadUrlBatch = async (extensions: string[]) => {
    const { data } = await api.post('/api/mediacloud/req-upload-url-batch', { 
      uploader_id: localStorage.getItem('no_id'), 
      extensions: extensions 
    }, { headers: { 'X-Jenis-User': 'admin' } })
    return data
  }

  const clearDeletedMedia = async () => {
    if (deletedMediaIds.value.length) {
      try {
        const { data } = await api.post('/api/mediacloud/read-url-batch', { ids: deletedMediaIds.value }, {
          headers: { 'X-Jenis-User': 'admin' }
        })
        
        const successIds = data.success ? Object.keys(data.success) : []
        
        if (successIds.length > 0) {
          await api.delete('/api/mediacloud/delete-batch', {
            data: { ids: successIds },
            headers: { 'X-Jenis-User': 'admin' }
          })
        }
      } catch (err) {
        console.error('Failed to read or delete batch media:', err)
      } finally {
        deletedMediaIds.value = []
      }
    }
  }

  return {
    isCompressing,
    currentCompressionIndex,
    totalVideosToCompress,
    photos,
    previewPhotos,
    handlePhoto,
    removePhoto,
    loadExistingMedia,
    uploadAllMedia,
    clearDeletedMedia,
    deletedMediaIds
  }
}
