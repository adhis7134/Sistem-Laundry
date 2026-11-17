# 🧺 Laundry Hub - Sistem Informasi Layanan Laundry

Proyek implementasi aplikasi web **"Sistem Informasi Layanan Laundry"** (Pink Laundry Grand Wisata) berdasarkan rancangan UI/UX Figma, ERD, dan spesifikasi tugas akhir mahasiswa **Universitas Bina Sarana Informatika (UBSI)**.

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi ini dapat langsung dijalankan tanpa perlu instalasi rumit:

### Opsi 1: Klik Ganda File `start.bat` (Paling Praktis)
1. Buka folder `laundry-hub` di File Explorer.
2. Klik ganda pada file **`start.bat`**.
3. Browser Anda (Google Chrome / Edge) akan otomatis terbuka mengarah ke `http://localhost:8080`.

### Opsi 2: Menggunakan Terminal / Command Prompt
```bash
cd "C:\Users\MyBook Hype AMD\.gemini\antigravity\scratch\laundry-hub"
python run_app.py
```
Lalu buka browser di alamat: **`http://localhost:8080`**.

### Opsi 3: Buka Langsung File HTML
Anda juga dapat langsung membuka file `index.html` dengan mengklik ganda atau klik kanan -> *Open with Google Chrome*.

---

## 👥 Akun Pengujian Multi-Role

Pada halaman login, sudah disediakan tombol **"⚡ Klik Cepat Akun Pengujian"** agar penguji / dosen dapat langsung masuk tanpa mengetik manual:

| Role | Username | Password | Deskripsi Fitur Utama |
|---|---|---|---|
| **👑 Admin (Pengelola)** | `admin` | `admin123` | Kelola Semua Pesanan, Ubah Status Pesanan, Kelola Kurir Baru/Aktif, Kelola Master Jenis Layanan & Tarif, Dasbor Laporan & Grafik Pendapatan Harian, Export Laporan ke Excel/CSV, Live Chat Balas Pelanggan. |
| **🛵 Kurir (Driver)** | `taufiq` | `kurir123` | Daftar Tugas Jemput Cucian Kotor & Input Timbangan Berat Aktual (Kg), Daftar Antar Cucian Bersih & Pilihan Metode Pembayaran (Tunai / QRIS / Transfer), Riwayat Pengantaran dengan Filter Tanggal. |
| **👤 Pelanggan (Customer)** | `budi` | `budi123` | Form Pemesanan Antar-Jemput Online Mandiri dari Rumah, Riwayat Cucian & Pelacakan Status Realtime, Lihat & Cetak Struk Digital / Resi Resmi, Live Chat dengan Admin Toko. |

*(Anda juga dapat mendaftarkan akun Customer baru melalui tombol "Register as Customer")*

---

## 📂 Struktur File Project

```text
laundry-hub/
├── index.html          # File antarmuka utama (Single Page App Multi-Role)
├── start.bat           # Launcher praktis 1-klik di Windows
├── run_app.py          # Script server lokal Python (Auto-open browser)
├── database.sql        # Skrip DDL MySQL & Dummy Data untuk pengumpulan XAMPP
├── README.md           # Panduan lengkap penggunaan
├── css/
│   └── style.css       # Desain tema Dark Mode modern sesuai prototipe Figma
└── js/
    ├── data.js         # State management & persistent storage (LocalStorage)
    └── app.js          # Controller logika bisnis, routing role, receipt, chart & chat
```

---

## 📋 Kesesuaian dengan Dokumen Laporan Tugas Akhir

1. **Gambar 3.42 - 3.44 (Customer)**: Registrasi akun, Login, Form pesan laundry antar-jemput.
2. **Gambar 3.45 - 3.46 (Customer)**: Tabel riwayat cucian & pop-up modal Struk Digital resmi dilengkapi tombol Cetak Struk.
3. **Gambar 3.47 (Customer)**: Fitur Live Chat dengan Admin Laundry.
4. **Gambar 3.48 - 3.50 (Kurir)**: Login kurir, antarmuka penjemputan input berat (kg), menu pengantaran dan pemilihan metode bayar, serta riwayat tugas dengan filter tanggal.
5. **Gambar 3.51 - 3.56 (Admin)**: Manajemen seluruh pesanan (*All System Orders*), kelola data master kurir & jenis layanan, dasbor laporan transaksi pendapatan dengan canvas grafik harian dan export ke Excel.
6. **Gambar 3.30 & Tabel 3.1 - 3.6 (Database)**: Skema database relasional lengkap (`admin`, `customer`, `kurir`, `layanan`, `pesanan`, `chat`) tersedia di `database.sql`.
