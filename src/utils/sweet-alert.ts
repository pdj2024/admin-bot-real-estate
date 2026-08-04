import Swal from "sweetalert2"

export function alertDelete(text: string, callback: () => void) {
  Swal.fire({
    title: "Konfirmasi Segera!",
    html: `Apakah Anda ingin menghapus data milik <b>${text}</b>?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#df7730",
    cancelButtonColor: "#4b5563",
    cancelButtonText: "Tidak",
    confirmButtonText: "Ya, hapus!"
  }).then((result) => {
    if (result.isConfirmed) {
      callback()
    }
  })
}

export function confirm(text: string, callback: () => void) {
  Swal.fire({
    title: "Konfirmasi!",
    html: text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#df7730",
    cancelButtonColor: "#4b5563",
    cancelButtonText: "Tidak",
    confirmButtonText: "Ya",
    backdrop: false,
    allowOutsideClick: false,
    focusConfirm: false,
    returnFocus: false
  }).then((result) => {
    if (result.isConfirmed) {
      callback()
    }
  })
}

export function confirmCancel(text: string, success: () => void, fail: () => void) {
  Swal.fire({
    title: "Konfirmasi!",
    html: text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#df7730",
    cancelButtonColor: "#4b5563",
    cancelButtonText: "Tidak",
    confirmButtonText: "Ya",
    backdrop: false,
    allowOutsideClick: false,
    focusConfirm: false,
    returnFocus: false
  }).then((result) => {
    if (result.isConfirmed) {
      success()
    } else{
      fail()
    }
  })
}

export function success(text: string) {
  let timerInterval: any

  Swal.fire({
    icon: "success",
    title: "Berhasil!",
    html: text,
    timer: 2000,
    timerProgressBar: false,
    didOpen: () => {
      Swal.showLoading()
    },
    willClose: () => {
      clearInterval(timerInterval)
    }
  })
}

export function getErrorMessage(err: any, fallback: string = 'Terjadi kesalahan sistem'): string {
  if (!err) return fallback
  if (typeof err === 'string') {
    if (err.includes('Request failed with status code') && fallback && fallback !== 'Terjadi kesalahan sistem') {
      return fallback
    }
    return err
  }

  const data = err.response?.data
  if (data) {
    if (typeof data === 'string' && data.trim() !== '') return data
    if (data.Message && typeof data.Message === 'string') return data.Message
    if (data.message && typeof data.message === 'string') return data.message
    if (data.error && typeof data.error === 'string') return data.error
    if (data.Error && typeof data.Error === 'string') return data.Error
    if (data.detail && typeof data.detail === 'string') return data.detail
    if (data.Data && typeof data.Data === 'string') return data.Data
  }

  if (err.message && typeof err.message === 'string' && !err.message.includes('Request failed with status code')) {
    return err.message
  }

  return fallback
}

export function fail(textOrError: any, fallback: string = 'Terjadi kesalahan sistem') {
  let timerInterval: any
  let displayMessage = ''

  if (typeof textOrError === 'string') {
    if (textOrError.includes('Request failed with status code') && fallback && fallback !== 'Terjadi kesalahan sistem') {
      displayMessage = fallback
    } else if (textOrError.includes('Request failed with status code')) {
      displayMessage = 'Permintaan gagal. Terjadi kesalahan pada server.'
    } else {
      displayMessage = textOrError
    }
  } else {
    displayMessage = getErrorMessage(textOrError, fallback)
  }

  Swal.fire({
    icon: "error",
    title: "Mohon maaf!",
    html: displayMessage,
    timer: 3500,
    timerProgressBar: false,
    didOpen: () => {
      Swal.showLoading()
    },
    willClose: () => {
      clearInterval(timerInterval)
    }
  })
}
