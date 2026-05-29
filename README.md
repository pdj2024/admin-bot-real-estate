# Dasbor & Katalog Properti Real Estate Terintegrasi Bot WhatsApp (Vue.js 3 + Vite + TypeScript)

Aplikasi web modern berkinerja tinggi yang dirancang untuk agen real estate. Aplikasi ini memiliki dua fungsionalitas utama: Katalog Publik untuk pengunjung umum (Guest Portal) dilengkapi dengan simulasi KPR interaktif, dan Dasbor Administrator (Admin Portal) untuk pengelolaan data properti, manajemen janji temu, penyiapan brosur otomatis, serta modul Live Chat WhatsApp yang terintegrasi secara *real-time*.

---

## 🛠️ Fitur Utama

Aplikasi ini dibagi menjadi dua portal utama dengan fungsi sebagai berikut:

### 1. Portal Pengunjung (Guest Portal)
*   **Halaman Beranda Dinamis:** Menampilkan visual properti pilihan menggunakan carousel (*Swiper*), properti terbaru, serta fitur pencarian cepat.
*   **Katalog Properti Interaktif:** Pengunjung dapat mencari properti berdasarkan:
    *   Tipe Transaksi (Jual, Sewa, atau keduanya).
    *   Tipe Unit (Rumah, Ruko, Apartemen, Tanah, dll.).
    *   Lokasi kota/wilayah.
    *   Rentang harga minimum dan maksimum.
    *   Spesifikasi unit (jumlah kamar tidur, kamar mandi, lantai, dan garasi/carport).
    *   Urutan pencarian (Terbaru, Termurah, Termahal, Luas Terbesar) menggunakan modul tabel *TanStack Vue Table*.
*   **Detail Properti Lengkap:** Deskripsi terperinci, spesifikasi teknis, sertifikat, daya listrik, foto & video promosi, serta peta lokasi.
*   **Simulasi KPR:** Kalkulator angsuran interaktif yang memungkinkan calon pembeli menggeser nilai harga properti, uang muka (DP), suku bunga, dan jangka waktu pinjaman (tenor) untuk melihat estimasi cicilan per bulan secara instan.
*   **Halaman Informasi Tambahan:** Kontak Agen, Tentang Kami, dan halaman Tanya Jawab (FAQ).

### 2. Portal Administrator (Admin Portal)
*   **Dasbor Analitik (Analytics):** Visualisasi performa penjualan, statistik status properti (Tersedia, Terjual, Tersewa), statistik agen sales, dan pertumbuhan data customer dalam bentuk grafik interaktif menggunakan *ApexCharts*.
*   **WhatsApp Live Chat (Real-time):** Mengobrol secara langsung dengan customer melalui integrasi API WhatsApp Bot yang disinkronkan secara *real-time* via koneksi websocket *SignalR*.
*   **Manajer Broadcast:** Mengirim pesan broadcast massal ke nomor WhatsApp pelanggan berdasarkan template pesan yang dapat disesuaikan.
*   **Kalender Janji Temu (Event Scheduler):** Jadwal survei properti terintegrasi menggunakan *FullCalendar* untuk mempermudah koordinasi waktu kunjungan antara agen sales, admin, dan calon pembeli.
*   **Manajemen Unit Properti (CRUD):**
    *   Menambah, mengubah, dan menghapus unit properti dengan unggahan file gambar dan video secara serentak (*Dropzone*).
    *   Mengubah status tayang (*Status Display*: Aktif, Draft).
    *   Mengubah status properti (*Status Properti*: Tersedia, Terjual, Tersewa) beserta pencatatan nama customer pembeli dan tanggal transaksinya.
*   **Generator Brosur PDF Otomatis:** Membuat brosur cetak resmi untuk setiap unit dalam format PDF secara instan (*jsPDF*), lengkap dengan harga coret promo, badge promosi, ikon fasilitas properti, kontak agen, dan logo bisnis.
*   **Manajemen Data Master (Kelola Data):**
    *   Data Admin, Sales, Customer, Data Wilayah (Provinsi & Kota), Ikon Fasilitas Properti, dan Status Transaksi.
*   **Pengaturan Aplikasi (Settings):** Pengaturan profil bisnis, nomor WhatsApp gateway, konfigurasi brosur bawaan, dan aktivasi **Mode Perbaikan (Maintenance Mode)** secara global.

---

## 💻 Tech Stack & Library Pendukung

Aplikasi ini dibangun menggunakan arsitektur frontend modern dan didukung oleh library-library berikut:

*   **Framework Utama:** [Vue.js 3](https://vuejs.org/) (Composition API, `<script setup>`)
*   **Alat Build:** [Vite 7](https://vite.dev/) untuk proses bundel cepat dan modul HMR.
*   **Bahasa:** [TypeScript](https://www.typescriptlang.org/) untuk keamanan tipe data (*type safety*).
*   **Gaya & Antarmuka (UI/UX):**
    *   [Tailwind CSS v4](https://tailwindcss.com/) dengan compiler baru `@tailwindcss/vite` untuk optimasi build CSS.
    *   [Preline UI](https://preline.co/) untuk komponen navigasi, dropdown, modal, dan elemen form siap pakai.
    *   [Iconify](https://iconify.design/) sebagai penyedia ribuan ikon vektor secara dinamis (seperti ikon `lucide`).
*   **Manajemen State:** [Pinia](https://pinia.vuejs.org/) dengan bantuan plugin `pinia-plugin-persistedstate` agar data pengaturan dan otentikasi tetap tersimpan di penyimpanan browser (LocalStorage).
*   **Navigasi:** [Vue Router 4](https://router.vuejs.org/)
*   **Sinkronisasi Real-Time:** [@microsoft/signalr](https://learn.microsoft.com/en-us/aspnet/core/signalr/introduction) untuk mendengarkan pesan masuk baru pada modul obrolan tanpa perlu memuat ulang halaman.
*   **Penyusunan PDF:** [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable).

---

## 📁 Struktur Folder Proyek

Berikut adalah gambaran ringkas struktur direktori utama di dalam proyek:

```bash
wa-bot-vue/
├── .agent/              # Konfigurasi asisten AI & skrip otomatisasi
├── public/              # Aset statis publik (favicon, logo awal)
├── src/
│   ├── assets/          # Aset desain, font, dan file styling global (style.css)
│   ├── components/      # Komponen Vue yang dapat digunakan kembali (shared components)
│   │   ├── ProductCard.vue   # Card unit properti dengan badge Akses Jalan
│   │   └── common/           # Komponen utilitas penunjang (seperti modul perbandingan properti)
│   ├── composables/     # Logika reaktif Vue yang diekstrak (contoh: usePropertyFilters.ts)
│   ├── config/          # Definisi konstanta konfigurasi global aplikasi
│   ├── layouts/         # Layout halaman (AdminLayout, GuestLayout, BlankLayout untuk login)
│   ├── router/          # Pengaturan rute navigasi dan logika penjaga rute (Route Guards)
│   ├── services/        # Klien HTTP (Axios) untuk komunikasi dengan REST API
│   ├── stores/          # State management (Pinia) seperti settings.ts untuk konfigurasi global
│   ├── types/           # Deklarasi interface dan tipe data TypeScript
│   ├── utils/           # Fungsi utilitas (format mata uang, generator PDF brosur)
│   └── views/           # Halaman tampilan aplikasi:
│       ├── admin/       # Fitur dasbor admin (chat, broadcast, janji temu, kelola-data, properti)
│       ├── guest/       # Fitur sisi pengunjung (beranda, katalog, simulasi-kpr, faq, kontak)
│       ├── auth/        # Halaman masuk (login)
│       └── errors/      # Tampilan error (403, 404, 500, Maintenance)
├── index.html           # File template HTML utama
├── vite.config.ts       # Konfigurasi build Vite 7 & Tailwind CSS v4
├── tsconfig.json        # Pengaturan TypeScript compiler
└── package.json         # Metadata proyek, daftar skrip perintah, dan pustaka dependensi
```

---

## ⚙️ Konfigurasi Environment (`.env`)

Buat file `.env` di direktori utama proyek untuk mendefinisikan URL API backend dan WebSocket SignalR Anda:

```env
# URL REST API Backend
VITE_API_BASE_URL=https://wabotapi.padajaya.biz.id

# URL SignalR Hub untuk Live Chat WhatsApp
VITE_SIGNALR_HUB_URL=https://wabotapi.padajaya.biz.id/chatHub
```

---

## 🚀 Langkah Instalasi & Pengoperasian

Ikuti petunjuk di bawah ini untuk menjalankan proyek ini di lingkungan lokal Anda:

### Prasyarat
Pastikan Anda sudah menginstal **Node.js** versi `^20.19.0` atau `>=22.12.0` serta manajer paket seperti `npm` atau `yarn`.

### Langkah-langkah:

1.  **Kloning Repositori:**
    ```bash
    git clone https://github.com/pdj2024/admin-bot-real-estate.git
    cd admin-bot-real-estate
    ```

2.  **Instal Dependensi Pustaka:**
    ```bash
    npm install
    ```

3.  **Jalankan Server Pengembangan (Lokal):**
    ```bash
    npm run dev
    ```
    Setelah server berjalan, Anda dapat mengakses aplikasi melalui peramban di alamat yang tertera (biasanya `http://localhost:5173`).

4.  **Kompilasi untuk Kebutuhan Produksi:**
    Perintah ini akan melakukan pengecekan tipe TypeScript dan melakukan kompilasi file aset menjadi bundle yang telah dioptimasi di dalam folder `/dist`:
    ```bash
    npm run build
    ```

5.  **Pengecekan Kode (Linting):**
    Untuk mendeteksi kesalahan sintaksis dan memperbaikinya secara otomatis berdasarkan standar aturan ESLint:
    ```bash
    npm run lint
    ```

6.  **Merapikan Format Kode (Formatting):**
    Merapikan spasi dan struktur baris kode menggunakan Prettier di seluruh folder `src`:
    ```bash
    npm run format
    ```

---

## 🔒 Keamanan Rute & Mode Perbaikan (Route Guards)

Sistem routing (`src/router/index.ts`) dilengkapi dengan pengontrol alur otomatis:
*   **Proteksi Halaman Admin (`requiresAuth`):** Rute admin secara otomatis memeriksa ketersediaan token akses. Jika tidak valid atau kosong, pengguna akan diarahkan ke halaman `/login`.
*   **Pembaruan Token Otomatis (*Auto Token Refresh*):** Sebelum memasuki halaman admin pertama kali, sistem akan mengirimkan permintaan ke API backend `/api/auth/refresh` untuk memperbarui token kedaluwarsa secara mulus tanpa mengganggu pengguna.
*   **Mode Perbaikan (*Maintenance Mode*):** 
    *   Jika status aplikasi diatur ke mode perbaikan oleh administrator, semua pengunjung umum (guest) yang mengakses halaman publik akan otomatis dialihkan ke halaman khusus `/maintenance`.
    *   Administrator yang sudah masuk ke sistem tetap diizinkan mengakses katalog publik dan dasbor untuk melakukan pemantauan atau perubahan data.
