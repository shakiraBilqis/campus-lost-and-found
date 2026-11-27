# Campus Lost & Found

Aplikasi web untuk melaporkan barang hilang/temuan di kampus, mencari barang, dan mengajukan klaim yang diverifikasi admin.
Tugas 9 – CAK3EAB3 Komputasi Awan dan Terdistribusi.

- **Frontend:** HTML, CSS, JavaScript (fetch ke REST API) — folder `frontend/`
- **Backend:** Python Flask REST API — folder `backend/`
- **Tanpa database:** semua data di-hardcode sebagai list of dict di `backend/data.py` (hilang/reset saat server restart)

## Struktur folder

```
campus-lost-and-found/
├── backend/
│   ├── app.py            # REST API (CRUD User, Barang, Klaim) + menyajikan frontend
│   ├── data.py           # data hardcoded (JSON/dict)
│   └── requirements.txt
├── frontend/
│   ├── index.html        # Login, Beranda, Lapor Barang, Aktivitas Saya, Admin
│   ├── css/style.css
│   └── js/
│       ├── config.js     # alamat backend (API_BASE)
│       ├── api.js        # fungsi pemanggil API
│       └── app.js        # logika halaman
└── README.md
```

## Menjalankan di laptop

```bash
cd campus-lost-and-found
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
python backend/app.py
```

Buka http://localhost:5000

> Di macOS port 5000 biasanya dipakai AirPlay Receiver. Jalankan di port lain:
> `PORT=5001 python backend/app.py` lalu buka http://localhost:5001

## Login dengan akun Google kampus

Hanya email kampus yang bisa masuk (default: `@student.telkomuniversity.ac.id` dan
`@telkomuniversity.ac.id`). Akun baru otomatis dibuat saat pertama kali login.

**Mode demo** (default, tanpa konfigurasi): cukup ketik email kampus di halaman login.
Akun contoh: `budi@student.telkomuniversity.ac.id`, admin: `admin.lostfound@telkomuniversity.ac.id`.

**Mengaktifkan Google Sign-In:**

1. Buka https://console.cloud.google.com → buat project.
2. *APIs & Services → OAuth consent screen* → isi nama aplikasi & email (tipe **External**).
3. *APIs & Services → Credentials → Create credentials → OAuth client ID* → tipe **Web application**.
4. Di **Authorized JavaScript origins** tambahkan alamat aplikasi, mis. `http://localhost:5001`
   (untuk server online Google mewajibkan **HTTPS**, kecuali `localhost`).
5. Salin **Client ID**, lalu jalankan server:

```bash
GOOGLE_CLIENT_ID="xxxx.apps.googleusercontent.com" \
ADMIN_EMAILS="emailkamu@student.telkomuniversity.ac.id" \
PORT=5001 python backend/app.py
```

| Variabel | Fungsi |
|---|---|
| `GOOGLE_CLIENT_ID` | Client ID OAuth. Jika diisi, login email biasa dimatikan dan wajib lewat Google |
| `ALLOWED_DOMAINS` | Domain email yang boleh masuk, pisah koma |
| `ADMIN_EMAILS` | Email yang otomatis jadi admin saat login, pisah koma |

## Entitas

| Entitas | Atribut |
|---|---|
| User | id, nama, nim, email, no_hp, role (mahasiswa/admin) |
| Barang | id, judul, kategori, deskripsi, lokasi, tanggal, tipe (hilang/ditemukan), status (tersedia/diklaim/dikembalikan), url_foto, id_pelapor |
| Klaim | id, id_barang, id_pengklaim, bukti_ciri, status (menunggu/disetujui/ditolak), tanggal_klaim |

## Daftar endpoint API

| Method | Endpoint | Fungsi | Entitas |
|---|---|---|---|
| GET | /api/config | Konfigurasi login (client ID, domain) | – |
| POST | /api/auth/google | Login Google (verifikasi ID token + domain kampus) | User |
| POST | /api/login | Login email (mode demo saja) | User |
| GET / POST | /api/users | Lihat semua / tambah user | User |
| GET / PUT / DELETE | /api/users/&lt;id&gt; | Detail / ubah / hapus user | User |
| GET | /api/users/&lt;id&gt;/activity | Aktivitas Saya (laporan + klaim) | User, Barang, Klaim |
| GET | /api/items?tipe=&kategori=&lokasi=&tanggal=&q= | Cari & filter barang | Barang, User |
| POST | /api/items | Lapor barang | Barang, User |
| GET / PUT / DELETE | /api/items/&lt;id&gt; | Detail / edit / hapus laporan (pelapor atau admin) | Barang, User |
| GET / POST | /api/claims | Lihat / ajukan klaim (barang jadi "diklaim") | Klaim, Barang, User |
| GET / PUT / DELETE | /api/claims/&lt;id&gt; | Detail / edit bukti / batalkan klaim yang menunggu | Klaim |
| POST | /api/claims/&lt;id&gt;/verify | Admin setujui/tolak (disetujui → barang "dikembalikan") | Klaim, Barang, User |
| GET | /api/categories | Daftar kategori | – |

## Deploy ke AWS EC2 (ringkas)

1. **Launch instance** di EC2: Amazon Linux 2023 atau Ubuntu, tipe `t2.micro`/`t3.micro` (free tier), buat key pair.
2. **Security group:** buka inbound port `22` (SSH, dari IP kamu) dan `5000` (Custom TCP, 0.0.0.0/0).
3. Upload proyek dan jalankan:
   ```bash
   scp -i key.pem -r campus-lost-and-found ec2-user@<PUBLIC_IP>:~
   ssh -i key.pem ec2-user@<PUBLIC_IP>
   cd campus-lost-and-found
   python3 -m venv .venv && source .venv/bin/activate
   pip install -r backend/requirements.txt
   nohup python backend/app.py > app.log 2>&1 &
   ```
   (di Ubuntu user-nya `ubuntu`, dan mungkin perlu `sudo apt install python3-venv` dulu)
4. Buka `http://<PUBLIC_IP>:5000`.

Kalau frontend dan backend di-deploy terpisah (misalnya frontend di S3 static website), ubah `API_BASE` di `frontend/js/config.js` menjadi alamat backend.

> Catatan: karena data disimpan di memori, setiap instance punya datanya sendiri. Saat nanti memakai beberapa instance di belakang load balancer, data antar-instance tidak tersinkron — ini wajar sesuai ketentuan "tanpa database".
