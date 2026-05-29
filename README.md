# Dasbor & Katalog Properti Real Estate Terintegrasi Bot WhatsApp (Vue.js 3 + Vite + TypeScript)

Sebuah aplikasi web modern berkinerja tinggi yang dirancang khusus untuk operasional agen _real estate_. Aplikasi ini terbagi menjadi dua portal utama: **Katalog Publik** untuk pengunjung umum yang dilengkapi simulasi KPR interaktif, dan **Dasbor Administrator** untuk pengelolaan data properti, penyiapan brosur otomatis, serta layanan _Live Chat_ WhatsApp yang terintegrasi secara _real-time_.

---

## 🛠️ Fitur Utama

Aplikasi ini dibagi menjadi dua portal utama dengan fungsi sebagai berikut:

### 1. Portal Pengunjung (Guest Portal)

- **Halaman Beranda Dinamis:** Menampilkan visual properti pilihan menggunakan carousel (_Swiper_), properti terbaru, serta fitur pencarian cepat.
- **Katalog Properti Interaktif:** Pengunjung dapat mencari properti berdasarkan:
  - Tipe Transaksi (Jual, Sewa, atau keduanya).
  - Tipe Unit (Rumah, Ruko, Apartemen, Tanah, dll.).
  - Lokasi kota/wilayah.
  - Rentang harga minimum dan maksimum.
  - Spesifikasi unit (jumlah kamar tidur, kamar mandi, lantai, dan garasi/carport).
  - Urutan pencarian (Terbaru, Termurah, Termahal, Luas Terbesar) dengan tampilan tabel data yang cepat dan interaktif (_powered by TanStack Vue Table_).
- **Detail Properti Lengkap:** Deskripsi terperinci, spesifikasi teknis, sertifikat, daya listrik, foto & video promosi, serta peta lokasi.
- **Simulasi KPR:** Kalkulator angsuran interaktif yang memungkinkan calon pembeli menggeser nilai harga properti, uang muka (DP), suku bunga, dan jangka waktu pinjaman (tenor) untuk melihat estimasi cicilan per bulan secara instan.
- **Halaman Informasi Tambahan:** Kontak Agen, Tentang Kami, dan halaman Tanya Jawab (FAQ).

### 2. Portal Administrator (Admin Portal)

- **Dasbor Analitik (Analytics):** Visualisasi performa penjualan, statistik status properti (Tersedia, Terjual, Tersewa), statistik agen sales, dan pertumbuhan data customer dalam bentuk grafik visual yang interaktif (_powered by ApexCharts_).
- **Live Chat Pelanggan (Real-time):** Berkomunikasi langsung dengan customer melalui integrasi API WhatsApp Bot yang disinkronkan secara _real-time_ via koneksi websocket _SignalR_.
- **Manajer Broadcast:** Mengirim pesan broadcast massal ke nomor WhatsApp pelanggan berdasarkan template pesan yang dapat disesuaikan.
- **Kalender Janji Temu (Event Scheduler):** Jadwal survei properti terintegrasi menggunakan _FullCalendar_ untuk mempermudah koordinasi waktu kunjungan antara agen sales, admin, dan calon pembeli.
- **Kelola Data Properti:** Memudahkan admin untuk menambah, mengedit, dan menghapus unit properti dengan fitur:
  - Unggahan file gambar dan video secara serentak (_Dropzone_).
  - Mengubah status tayang (_Status Display_: Aktif, Draft).
  - Mengubah status properti (_Status Properti_: Tersedia, Terjual, Tersewa) beserta pencatatan nama customer pembeli dan tanggal transaksinya.
- **Generator Brosur PDF Otomatis:** Membuat brosur cetak resmi untuk setiap unit dalam format PDF secara instan (_jsPDF_), lengkap dengan harga promo, badge promosi, ikon fasilitas properti, kontak agen, dan logo bisnis.
- **Manajemen Data Master:**
  - Data Admin, Sales, Customer, Data Wilayah (Provinsi & Kota), Ikon Fasilitas Properti, dan Status Transaksi.
- **Pengaturan Aplikasi (Settings):** Pengaturan profil bisnis, nomor WhatsApp gateway, konfigurasi brosur bawaan, dan aktivasi **Mode Perbaikan (Maintenance Mode)** secara global.

---

## 💻 Tech Stack & Library Pendukung

Aplikasi ini dibangun menggunakan arsitektur frontend modern dan didukung oleh library-library berikut:

- **Framework Utama:** [Vue.js 3](https://vuejs.org/) (Composition API, `<script setup>`)
- **Alat Build:** [Vite 7](https://vite.dev/) untuk proses bundel cepat dan modul HMR.
- **Bahasa:** [TypeScript](https://www.typescriptlang.org/) untuk keamanan tipe data (_type safety_).
- **Gaya & Antarmuka (UI/UX):**
  - [Tailwind CSS v4](https://tailwindcss.com/) dengan compiler baru `@tailwindcss/vite` untuk optimasi build CSS.
  - [Preline UI](https://preline.co/) untuk komponen navigasi, dropdown, modal, dan elemen form siap pakai.
  - [Iconify](https://iconify.design/) sebagai penyedia ribuan ikon vektor secara dinamis (seperti ikon `lucide`).
- **Manajemen State:** [Pinia](https://pinia.vuejs.org/) dengan bantuan plugin `pinia-plugin-persistedstate` agar data pengaturan dan otentikasi tetap tersimpan di penyimpanan browser (LocalStorage).
- **Navigasi:** [Vue Router 4](https://router.vuejs.org/)
- **Sinkronisasi Real-Time:** [@microsoft/signalr](https://learn.microsoft.com/en-us/aspnet/core/signalr/introduction) untuk mendengarkan pesan masuk baru pada modul obrolan tanpa perlu memuat ulang halaman.
- **Penyusunan PDF:** [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable).

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
│   ├── types/           # Deklarasi interface dan tipe data TypeScript (Interface CRUD)
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

Pastikan Anda sudah menginstal **Node.js** versi `^20.19.0` atau `>=22.12.0` serta _package manager_ seperti `npm` atau `yarn`.

### Langkah-langkah:

1.  **Kloning Repositori:**

```bash
git clone https://github.com/pdj2024/admin-bot-real-estate.git
cd admin-bot-real-estate
```

2.  **Instalasi Dependensi:**

```bash
npm install
```

3.  **Jalankan Server Pengembangan (Localhost):**

```bash
npm run dev
```
    Setelah server berjalan, Anda dapat mengakses aplikasi melalui peramban di alamat yang tertera (biasanya `http://localhost:5173`).

4.  **Build untuk Production:**
    Perintah ini akan melakukan pengecekan tipe TypeScript dan melakukan kompilasi file aset menjadi bundle yang telah dioptimasi di dalam folder `/dist`:

```bash
npm run build
```

5.  **Linting Kode:**
    Untuk mendeteksi kesalahan sintaksis dan memperbaikinya secara otomatis berdasarkan standar aturan ESLint:

```bash
npm run lint
```

6.  **Formatting Kode:**
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

---

## 🌍 Panduan Deployment (Linux / Nginx)

Karena aplikasi ini menggunakan **Vue Router** dengan *History Mode*, konfigurasi server web diperlukan agar rute tidak mengembalikan *error* 404 saat halaman di- *refresh*.

Berikut adalah contoh konfigurasi blok server dasar untuk **Nginx** di sistem Linux:

1. Pastikan Anda sudah menjalankan perintah `npm run build` dan memindahkan isi dari folder `/dist` ke direktori web Anda (contoh: `/var/www/html/wabotui`).
2. Buat/edit file konfigurasi Nginx:

```nginx
server {
    listen 80;
    server_name domain-anda.com;

    root /var/www/html/wabotui;
    index index.html;

    location / {
        # Memastikan Vue Router menangani routing secara mandiri
        try_files $uri $uri/ /index.html;
    }

    # Opsional: Pengaturan cache untuk aset statis
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public";
    }
}
```
3. Mulai ulang Nginx: `sudo systemctl restart nginx`.
