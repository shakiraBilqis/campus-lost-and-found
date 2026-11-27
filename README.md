# Lost & Found Telkom University

Aplikasi web pencatatan barang hilang dan temuan di lingkungan kampus Telkom University. Dibuat sebagai pemenuhan tugas mata kuliah **Komputasi Awan dan Terdistribusi**.

---

## 📋 Daftar Isi
1. [Fitur & Aturan Bisnis](#-fitur--aturan-bisnis)
2. [Arsitektur & Struktur Folder](#-arsitektur--struktur-folder)
3. [Daftar Endpoint REST API](#-daftar-endpoint-rest-api)
4. [Cara Menjalankan di Komputer Lokal](#-cara-menjalankan-di-komputer-lokal)
   - [Windows (PowerShell)](#a-windows-powershell)
   - [macOS / Linux](#b-macos--linux)
   - [Menggunakan Docker](#c-menggunakan-docker)
5. [Panduan Deployment ke AWS EC2](#-panduan-deployment-ke-aws-ec2)
6. [Tabel Fitur & Entitas](#-tabel-fitur--entitas)

---

## 💡 Fitur & Aturan Bisnis

1. **Semua pengguna kampus yang login** boleh melaporkan barang (hilang/ditemukan) dan mengunggah foto. Laporan langsung tampil di beranda **tanpa perlu persetujuan admin**.
2. **Admin tidak membuat laporan**. Admin hanya bertindak sebagai pengontrol:
   - Menyetujui (*approve*) atau menolak (*reject*) klaim kepemilikan.
   - Menurunkan (*delete*) laporan yang tidak pantas atau melanggar aturan.
   - Mengelola data pengguna (CRUD Pengguna).
3. **Login Kampus (Mode Demo)**:
   - Menggunakan email domain kampus: `@student.telkomuniversity.ac.id` atau `@telkomuniversity.ac.id`.
   - Akun baru otomatis dibuat pada saat pertama kali login.
   - Email admin khusus: `admin.lostfound@telkomuniversity.ac.id`.
4. **Siklus Status Barang**:
   - `open` (*Tersedia*): Baru dilaporkan dan siap diklaim.
   - `claimed` (*Sedang diklaim*): Ada klaim masuk yang menunggu verifikasi admin.
   - `returned` (*Sudah kembali*): Klaim telah disetujui admin dan barang dikembalikan ke pemiliknya.
5. **Siklus Status Klaim**:
   - `pending` (*Menunggu*): Klaim baru diajukan oleh mahasiswa lain (status barang berubah jadi `claimed`).
   - `approved` (*Disetujui*): Klaim diterima admin (status barang berubah jadi `returned`).
   - `rejected` (*Ditolak*): Klaim ditolak admin (status barang kembali `open`).
6. **Integritas Klaim**:
   - Pengguna **tidak boleh** mengklaim barang yang dilaporkannya sendiri.
   - Barang yang sedang `claimed` atau sudah `returned` **tidak dapat diklaim lagi**.
7. **Optimasi Foto Sisi Klien**:
   - Foto diperkecil langsung di browser menggunakan HTML5 Canvas (maksimal 800px, kompresi JPEG 0.8) dan dikirim sebagai data URL Base64 di dalam payload JSON.
   - Backend membatasi ukuran maksimal payload request hingga 2 MB.

---

## 📁 Arsitektur & Struktur Folder

Aplikasi dirancang dengan pemisahan tegas antara antarmuka (Frontend) dan logika bisnis (Backend REST API), tanpa menggunakan database eksternal (seluruh data tersimpan di memori sebagai *seed data* Python):

```text
campus-lost-and-found/
├── backend/
│   ├── app.py              # REST API Flask, CORS, otorisasi X-User-Id, serving frontend
│   ├── data.py             # Seed data in-memory (Users, Items, Claims, Kategori)
│   ├── requirements.txt    # Dependensi backend (Flask, Flask-CORS)
│   └── test_api.py         # Unit testing untuk validasi endpoint & aturan bisnis
├── frontend/
│   ├── css/
│   │   └── style.css       # Desain sistem konsisten (Schibsted Grotesk, 6px radius, dark theme)
│   ├── js/
│   │   ├── api.js          # Client fetch API wrapper (otomatis menyertakan X-User-Id)
│   │   ├── app.js          # SPA Controller, routing hash, manipulasi DOM, canvas resize
│   │   └── config.js       # Konfigurasi alamat backend (otomatis port-aware)
│   └── index.html          # Halaman Single Page Application (Login, Beranda, Lapor, Aktivitas, Admin)
├── Dockerfile              # Containerization image berbasis python:3.13-slim
└── README.md               # Dokumentasi lengkap proyek
```

---

## 🔌 Daftar Endpoint REST API

Semua request yang membutuhkan otorisasi membaca identitas pengguna melalui header HTTP **`X-User-Id`**.

| Method | Endpoint | Deskripsi | Otorisasi |
|---|---|---|---|
| `GET` | `/health` | Health check endpoint untuk Load Balancer AWS | Publik |
| `POST` | `/api/login` | Login mode demo email kampus (auto register) | Publik |
| `GET` | `/api/config` | Informasi konfigurasi domain & kategori | Publik |
| `GET` | `/api/items` | Daftar barang (filter `q`, `tipe`, `kategori`, `status`) | Publik / User |
| `POST` | `/api/items` | Melaporkan barang baru | User Login |
| `GET` | `/api/items/<id>` | Detail barang beserta riwayat klaim | User Login |
| `PUT` | `/api/items/<id>` | Mengubah data laporan barang | Pelapor / Admin |
| `DELETE` | `/api/items/<id>` | Menghapus / menurunkan laporan barang | Pelapor / Admin |
| `GET` | `/api/claims` | Daftar seluruh klaim (filter status, id_barang) | User / Admin |
| `POST` | `/api/claims` | Mengajukan klaim barang | Mahasiswa |
| `GET` | `/api/claims/<id>` | Detail satu klaim | User / Admin |
| `PUT` | `/api/claims/<id>` | Verifikasi klaim (`approved`/`rejected`) atau edit bukti | Khusus Admin |
| `DELETE` | `/api/claims/<id>` | Membatalkan klaim yang masih pending | Pengklaim / Admin |
| `GET` | `/api/users` | Daftar semua pengguna terdaftar | Admin |
| `POST` | `/api/users` | Menambahkan pengguna baru | Khusus Admin |
| `GET` | `/api/users/<id>` | Detail pengguna | User / Admin |
| `PUT` | `/api/users/<id>` | Mengubah informasi pengguna | Akun Terkait / Admin |
| `DELETE` | `/api/users/<id>` | Menghapus akun pengguna | Khusus Admin |
| `GET` | `/api/users/<id>/activity` | Mengambil laporan & klaim milik user tertentu | Akun Terkait |

---

## 💻 Cara Menjalankan di Komputer Lokal

### A. Windows (PowerShell)

1. Buka PowerShell dan masuk ke folder proyek:
   ```powershell
   cd D:\campus-lost-and-found
   ```

2. Buat virtual environment dan install dependensi:
   ```powershell
   # Buat venv baru
   py -m venv .venv

   # Install requirement
   .\.venv\Scripts\pip install -r backend/requirements.txt
   ```

3. Jalankan server aplikasi:
   ```powershell
   # Jika port 5000 diblokir oleh Windows NAT/Hyper-V, gunakan port 5001:
   $env:PORT="5001"
   .\.venv\Scripts\python backend/app.py
   ```

4. Buka browser: **`http://localhost:5001`**

---

### B. macOS / Linux

1. Buka terminal:
   ```bash
   cd campus-lost-and-found
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r backend/requirements.txt
   ```

2. Jalankan server:
   ```bash
   PORT=5000 python backend/app.py
   ```

3. Buka browser: **`http://localhost:5000`**

---

### C. Menggunakan Docker

1. Build image Docker:
   ```bash
   docker build -t lost-and-found-telkom .
   ```

2. Jalankan container:
   ```bash
   docker run -d -p 5000:5000 --name lostfound-app lost-and-found-telkom
   ```

3. Buka di browser: **`http://localhost:5000`**

---

## ☁️ Panduan Deployment ke AWS EC2

Langkah demi langkah menyiapkan instance EC2 di AWS untuk men-deploy aplikasi ini:

### 1. Peluncuran Instance EC2
- Buka AWS Management Console -> **EC2** -> **Launch Instance**.
- **Nama Instance**: `lost-and-found-server`.
- **AMI (Amazon Machine Image)**: `Ubuntu Server 24.04 LTS` (64-bit x86).
- **Instance Type**: `t2.micro` (Free tier eligible) atau `t3.micro`.
- **Key pair**: Buat atau pilih key pair yang sudah ada (misal `my-key.pem`).

### 2. Konfigurasi Security Group (Firewall)
Pastikan inbound rules mengizinkan port berikut:
| Type | Protocol | Port Range | Source | Keterangan |
|---|---|---|---|---|
| SSH | TCP | `22` | My IP / Anywhere (`0.0.0.0/0`) | Akses terminal remote |
| Custom TCP | TCP | `5000` | Anywhere (`0.0.0.0/0`) | Port aplikasi Flask |
| HTTP | TCP | `80` | Anywhere (`0.0.0.0/0`) | (Opsional jika pakai Reverse Proxy Nginx) |

### 3. Koneksi ke Instance lewat SSH
Buka terminal di komputer lokal:
```bash
chmod 400 my-key.pem
ssh -i "my-key.pem" ubuntu@<PUBLIC-IP-EC2>
```

### 4. Instalasi Docker di EC2
Jalankan perintah berikut di dalam terminal EC2:
```bash
# Update repository sistem
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io git
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu

# Keluar dan masuk kembali agar perubahan grup docker aktif
exit
```
Login kembali:
```bash
ssh -i "my-key.pem" ubuntu@<PUBLIC-IP-EC2>
```

### 5. Clone Repository & Jalankan Container
```bash
# Clone repository proyek dari GitHub
git clone https://github.com/<username>/campus-lost-and-found.git
cd campus-lost-and-found

# Build Docker image
docker build -t lostfound-telkom .

# Jalankan container di background dengan auto-restart
docker run -d \
  --name lostfound-service \
  -p 5000:5000 \
  --restart unless-stopped \
  -e PORT=5000 \
  -e ALLOWED_ORIGIN="*" \
  lostfound-telkom
```

### 6. Pengujian & Verifikasi
- Health check:
  ```bash
  curl -i http://localhost:5000/health
  ```
- Buka browser publik:
  **`http://<PUBLIC-IP-EC2>:5000`**

---

## 📊 Tabel Fitur & Entitas

| Fitur | Deskripsi | Entitas Terlibat |
|---|---|---|
| **Login Kampus Demo** | Autentikasi berbasis email domain Telkom University tanpa password dengan registrasi otomatis. | `User` |
| **Pencarian & Filter Barang** | Memfilter laporan berdasarkan kata kunci teks, kategori, jenis (Hilang/Ditemukan), dan status ketersediaan. | `Item` |
| **Lapor Barang Baru** | Mengunggah laporan kehilangan atau penemuan barang beserta kompresi foto otomatis di klien. | `Item`, `User` |
| **Pengajuan Klaim Barang** | Mahasiswa mengajukan klaim atas barang temuan dengan mendeskripsikan ciri khusus yang hanya diketahui pemilik. Mengubah status barang menjadi `claimed`. | `Claim`, `Item`, `User` |
| **Verifikasi Klaim oleh Admin** | Admin memvalidasi bukti ciri kepemilikan. Jika disetujui, status barang otomatis berubah menjadi `returned` dan klaim lain untuk barang tersebut ditolak secara otomatis. | `Claim`, `Item`, `User` |
| **Aktivitas Saya** | Menampilkan seluruh laporan yang dibuat serta histori pengajuan klaim oleh akun mahasiswa yang aktif. | `User`, `Item`, `Claim` |
| **Moderasi Laporan oleh Admin** | Admin menurunkan/menghapus laporan yang tidak pantas beserta seluruh data klaim yang melekat padanya. | `Item`, `Claim`, `User` |
| **Manajemen Pengguna (CRUD)** | Admin dapat melihat, menambah, mengubah role/data, dan menghapus pengguna kampus. | `User`, `Item`, `Claim` |
| **Health Check Load Balancer** | Endpoint `GET /health` untuk memonitor kesehatan instance di AWS ALB / Target Group. | Sistem API |
