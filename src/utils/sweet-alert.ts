import Swal from "sweetalert2"

export function alertDelete(text: string, callback: () => void) {
  Swal.fire({
    title: "Konfirmasi Segera!",
    html: `Apakah Anda ingin menghapus data milik <b>${text}</b>?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
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
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
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
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
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

export function fail(text: string) {
  let timerInterval: any

  Swal.fire({
    icon: "error",
    title: "Mohon maaf!",
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
