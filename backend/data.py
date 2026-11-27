"""
Data hardcoded (tanpa database) untuk Lost & Found Telkom University.
Data disimpan di memori selama server berjalan.
"""

users = [
    {
        "id": 1,
        "nama": "Admin Lost & Found",
        "nim": "-",
        "email": "admin.lostfound@telkomuniversity.ac.id",
        "no_hp": "081200000000",
        "role": "admin",
        "foto": "",
    },
    {
        "id": 2,
        "nama": "Budi Santoso",
        "nim": "1030124001",
        "email": "budi@student.telkomuniversity.ac.id",
        "no_hp": "081211112222",
        "role": "mahasiswa",
        "foto": "",
    },
    {
        "id": 3,
        "nama": "Siti Aminah",
        "nim": "1030124002",
        "email": "siti@student.telkomuniversity.ac.id",
        "no_hp": "081233334444",
        "role": "mahasiswa",
        "foto": "",
    },
    {
        "id": 4,
        "nama": "Rizky Pratama",
        "nim": "1030124003",
        "email": "rizky@student.telkomuniversity.ac.id",
        "no_hp": "081255556666",
        "role": "mahasiswa",
        "foto": "",
    },
]

items = [
    {
        "id": 1,
        "judul": "Charger Laptop Lenovo",
        "kategori": "Elektronik",
        "deskripsi": "Charger 65W ujung bulat, kabel ada lakban hitam.",
        "lokasi": "Perpustakaan",
        "tanggal": "2026-11-22",
        "tipe": "found",  # found / lost
        "status": "claimed",  # open, claimed, returned
        "url_foto": "img/charger.jpg",
        "id_pelapor": 4,  # Rizky
    },
    {
        "id": 2,
        "judul": "Dompet Kulit Coklat",
        "kategori": "Dompet/Tas",
        "deskripsi": "Dompet kulit coklat, ada stiker kucing di dalamnya.",
        "lokasi": "Gedung A Lt. 3",
        "tanggal": "2026-11-24",
        "tipe": "lost",
        "status": "open",
        "url_foto": "img/dompet.jpg",
        "id_pelapor": 2,  # Budi
    },
    {
        "id": 3,
        "judul": "KTM a.n. Andi",
        "kategori": "Kartu/Dokumen",
        "deskripsi": "KTM warna merah, ditemukan di meja kantin.",
        "lokasi": "Kantin Utama",
        "tanggal": "2026-11-20",
        "tipe": "found",
        "status": "open",
        "url_foto": "img/ktm.jpg",
        "id_pelapor": 3,  # Siti
    },
    {
        "id": 4,
        "judul": "Botol Minum Biru",
        "kategori": "Lainnya",
        "deskripsi": "Tumbler biru 750ml merek Tupperware.",
        "lokasi": "Lapangan Basket",
        "tanggal": "2026-11-18",
        "tipe": "found",
        "status": "returned",
        "url_foto": "img/botol.jpg",
        "id_pelapor": 2,  # Budi
    },
]

claims = [
    {
        "id": 1,
        "id_barang": 1,
        "id_pengklaim": 3,  # Siti
        "bukti_ciri": "Kabelnya saya lakban hitam di dekat colokan karena pernah sobek.",
        "status": "pending",  # pending, approved, rejected
        "tanggal_klaim": "2026-11-23",
    },
    {
        "id": 2,
        "id_barang": 4,
        "id_pengklaim": 4,  # Rizky
        "bukti_ciri": "Ada goresan nama 'RZ' di bagian bawah botol.",
        "status": "approved",
        "tanggal_klaim": "2026-11-19",
    },
]

KATEGORI = [
    "Elektronik",
    "Kartu/Dokumen",
    "Dompet/Tas",
    "Kunci",
    "Pakaian",
    "Lainnya",
]
