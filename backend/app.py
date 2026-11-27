"""
Backend REST API Lost & Found Telkom University (Python Flask).
Arsitektur tanpa database: data tersimpan di memori (backend/data.py).
Mendukung otorisasi sederhana via header X-User-Id, CORS, limit payload, dan health check.
"""

import base64
from datetime import date
import json
import os
import re
import uuid

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

import data

# ---------------------------------------------------------------- inisialisasi aplikasi
app = Flask(__name__, static_folder=None)

# Konfigurasi via environment variable
PORT = int(os.environ.get("PORT", 5000))
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024  # Maksimal payload 2 MB

# Konfigurasi CORS
if ALLOWED_ORIGIN == "*":
    CORS(app)
else:
    CORS(app, origins=[ALLOWED_ORIGIN])

FRONTEND_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "frontend"
)
PUBLIC_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "public"
)
UPLOAD_DIR = os.path.join(PUBLIC_DIR, "uploads")
CLAIM_UPLOAD_DIR = os.path.join(PUBLIC_DIR, "claims")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CLAIM_UPLOAD_DIR, exist_ok=True)

ALLOWED_DOMAINS = [
    "student.telkomuniversity.ac.id",
    "telkomuniversity.ac.id",
]
ADMIN_EMAIL = "admin.lostfound@telkomuniversity.ac.id"
CENTRAL_SECURITY_POST = "Pusat Pos Satpam Telkom University (Gerbang Utama)"


# ---------------------------------------------------------------- helper & utilitas
def next_id(collection):
    return max((item["id"] for item in collection), default=0) + 1


def find(collection, item_id):
    try:
        target_id = int(item_id)
    except (ValueError, TypeError):
        return None
    return next((item for item in collection if item["id"] == target_id), None)


def error(message, status_code=400):
    return jsonify({"error": message}), status_code


def save_uploaded_photo(url_foto):
    """Jika url_foto berupa data URL base64, simpan ke folder public/uploads dan kembalikan path publiknya."""
    if not url_foto or not isinstance(url_foto, str):
        return ""
    match = re.match(r"^data:image/(png|jpeg|jpg|webp);base64,(.+)$", url_foto.strip(), re.IGNORECASE)
    if not match:
        return url_foto.strip()
    ext = match.group(1).lower()
    if ext == "jpeg":
        ext = "jpg"
    try:
        img_bytes = base64.b64decode(match.group(2))
    except Exception:
        return ""
    filename = f"item_{uuid.uuid4().hex[:12]}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(img_bytes)
    return f"public/uploads/{filename}"


def save_claim_proof(data_url):
    """Simpan file bukti klaim (gambar atau PDF) ke folder public/claims."""
    if not data_url or not isinstance(data_url, str):
        return ""
    match = re.match(
        r"^data:(?:image/(png|jpeg|jpg|webp)|application/(pdf));base64,(.+)$",
        data_url.strip(),
        re.IGNORECASE,
    )
    if not match:
        return data_url.strip() if data_url.strip().startswith("public/") else ""
    ext = (match.group(1) or match.group(2)).lower()
    if ext == "jpeg":
        ext = "jpg"
    try:
        file_bytes = base64.b64decode(match.group(3))
    except Exception:
        return ""
    filename = f"claim_{uuid.uuid4().hex[:12]}.{ext}"
    filepath = os.path.join(CLAIM_UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(file_bytes)
    return f"public/claims/{filename}"


def get_current_user():
    """Mengambil user aktif dari header X-User-Id (atau query/body id_user sebagai fallback)."""
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        user_id = request.args.get("id_user")
    if not user_id and request.is_json:
        user_id = (request.get_json(silent=True) or {}).get("id_user")
    if user_id:
        return find(data.users, user_id)
    return None


def item_with_relations(item):
    """Menggabungkan entitas Item dengan User pelapor dan jumlah klaim."""
    pelapor = find(data.users, item.get("id_pelapor"))
    claims_for_item = [
        c for c in data.claims if c.get("id_barang") == item["id"]
    ]
    return {
        **item,
        "pelapor": (
            {
                "id": pelapor["id"],
                "nama": pelapor["nama"],
                "nim": pelapor.get("nim", "-"),
                "email": pelapor["email"],
                "no_hp": pelapor.get("no_hp", ""),
            }
            if pelapor
            else None
        ),
        "jumlah_klaim": len(claims_for_item),
    }


def claim_with_relations(claim):
    """Menggabungkan entitas Claim dengan Item dan User pengklaim."""
    item = find(data.items, claim.get("id_barang"))
    pengklaim = find(data.users, claim.get("id_pengklaim"))
    return {
        **claim,
        "barang": (
            {
                "id": item["id"],
                "judul": item["judul"],
                "tipe": item["tipe"],
                "status": item["status"],
                "kategori": item["kategori"],
                "lokasi": item["lokasi"],
                "tanggal": item["tanggal"],
                "url_foto": item.get("url_foto", ""),
            }
            if item
            else None
        ),
        "pengklaim": (
            {
                "id": pengklaim["id"],
                "nama": pengklaim["nama"],
                "nim": pengklaim.get("nim", "-"),
                "email": pengklaim["email"],
                "no_hp": pengklaim.get("no_hp", ""),
            }
            if pengklaim
            else None
        ),
    }


def refresh_item_status(item_id):
    """
    Sinkronisasi status barang berdasarkan klaimnya:
    - returned: jika ada klaim yang disetujui (approved)
    - claimed: jika ada klaim yang menunggu (pending)
    - open: jika tidak ada klaim aktif
    """
    item = find(data.items, item_id)
    if not item:
        return
    statuses = [c["status"] for c in data.claims if c["id_barang"] == item_id]
    if "approved" in statuses or "disetujui" in statuses:
        item["status"] = "returned"
    elif "pending" in statuses or "menunggu" in statuses:
        item["status"] = "claimed"
    else:
        item["status"] = "open"


# ---------------------------------------------------------------- health check
@app.get("/health")
def health():
    return jsonify(
        {
            "status": "ok",
            "service": "lost-and-found-api",
            "timestamp": date.today().isoformat(),
        }
    ), 200


# ---------------------------------------------------------------- autentikasi (login)
@app.post("/api/login")
def login():
    """
    Login mode demo dengan email kampus Telkom University.
    Jika email belum ada, otomatis membuat akun mahasiswa baru.
    """
    body = request.get_json(silent=True) or {}
    email = str(body.get("email", "")).strip().lower()

    if not email or "@" not in email:
        return error("Email wajib diisi dengan format yang benar", 400)

    domain = email.rsplit("@", 1)[1]
    if domain not in ALLOWED_DOMAINS:
        return error(
            f"Gunakan email kampus (@{' atau @'.join(ALLOWED_DOMAINS)})", 403
        )

    # Cari user atau buat baru
    user = next((u for u in data.users if u["email"].lower() == email), None)
    if not user:
        is_admin = email == ADMIN_EMAIL
        nama_otomatis = email.split("@")[0].replace(".", " ").title()
        user = {
            "id": next_id(data.users),
            "nama": "Admin Lost & Found" if is_admin else nama_otomatis,
            "nim": "-" if is_admin else f"10301{len(data.users)+1:04d}",
            "email": email,
            "no_hp": "",
            "role": "admin" if is_admin else "mahasiswa",
            "foto": "",
        }
        data.users.append(user)

    return jsonify(user), 200


@app.get("/api/config")
def get_config():
    return jsonify(
        {
            "allowed_domains": ALLOWED_DOMAINS,
            "admin_email": ADMIN_EMAIL,
            "categories": data.KATEGORI,
        }
    )


# ---------------------------------------------------------------- USER CRUD
@app.get("/api/users")
def list_users():
    return jsonify(data.users), 200


@app.get("/api/users/<int:user_id>")
def get_user(user_id):
    user = find(data.users, user_id)
    if not user:
        return error("Pengguna tidak ditemukan", 404)
    return jsonify(user), 200


@app.post("/api/users")
def create_user():
    """Hanya admin yang boleh membuat pengguna secara manual."""
    actor = get_current_user()
    if not actor or actor.get("role") != "admin":
        return error("Hanya admin yang berhak mengelola pengguna", 403)

    body = request.get_json(silent=True) or {}
    nama = str(body.get("nama", "")).strip()
    email = str(body.get("email", "")).strip().lower()

    if not nama or not email:
        return error("Nama dan email wajib diisi", 400)

    if any(u["email"].lower() == email for u in data.users):
        return error("Email sudah terdaftar", 400)

    role = body.get("role", "mahasiswa")
    if role not in ("mahasiswa", "admin"):
        role = "mahasiswa"

    user = {
        "id": next_id(data.users),
        "nama": nama,
        "nim": body.get("nim", "-"),
        "email": email,
        "no_hp": body.get("no_hp", ""),
        "role": role,
        "foto": body.get("foto", ""),
    }
    data.users.append(user)
    return jsonify(user), 201


@app.put("/api/users/<int:user_id>")
def update_user(user_id):
    """Admin dapat mengedit user siapa saja; mahasiswa hanya profil dirinya sendiri."""
    actor = get_current_user()
    target_user = find(data.users, user_id)
    if not target_user:
        return error("Pengguna tidak ditemukan", 404)

    if not actor or (
        actor.get("role") != "admin" and actor["id"] != target_user["id"]
    ):
        return error("Tidak memiliki izin mengubah data pengguna ini", 403)

    body = request.get_json(silent=True) or {}
    for key in ("nama", "nim", "no_hp"):
        if key in body:
            target_user[key] = str(body[key]).strip()

    # Hanya admin yang boleh mengubah role atau email
    if actor.get("role") == "admin":
        if "role" in body and body["role"] in ("mahasiswa", "admin"):
            target_user["role"] = body["role"]
        if "email" in body:
            new_email = str(body["email"]).strip().lower()
            if (
                new_email != target_user["email"]
                and not any(u["email"].lower() == new_email for u in data.users)
                and "@" in new_email
            ):
                target_user["email"] = new_email

    return jsonify(target_user), 200


@app.delete("/api/users/<int:user_id>")
def delete_user(user_id):
    """Hapus pengguna (khusus admin). Menghapus pula laporan & klaim miliknya."""
    actor = get_current_user()
    if not actor or actor.get("role") != "admin":
        return error("Hanya admin yang boleh menghapus pengguna", 403)

    target_user = find(data.users, user_id)
    if not target_user:
        return error("Pengguna tidak ditemukan", 404)

    if target_user["email"] == ADMIN_EMAIL:
        return error("Akun admin utama tidak boleh dihapus", 400)

    # Hapus semua klaim pengklaim
    data.claims[:] = [c for c in data.claims if c["id_pengklaim"] != user_id]

    # Hapus semua barang yang dilaporkan user ini beserta klaim barangnya
    own_item_ids = {i["id"] for i in data.items if i["id_pelapor"] == user_id}
    data.claims[:] = [
        c for c in data.claims if c["id_barang"] not in own_item_ids
    ]
    data.items[:] = [i for i in data.items if i["id_pelapor"] != user_id]

    data.users.remove(target_user)

    for item in data.items:
        refresh_item_status(item["id"])

    return jsonify({"message": "Pengguna berhasil dihapus"}), 200


@app.get("/api/users/<int:user_id>/activity")
def user_activity(user_id):
    """Aktivitas saya: laporan yang dibuat dan klaim yang diajukan oleh user."""
    target_user = find(data.users, user_id)
    if not target_user:
        return error("Pengguna tidak ditemukan", 404)

    my_items = [
        item_with_relations(i)
        for i in data.items
        if i["id_pelapor"] == user_id
    ]
    my_claims = [
        claim_with_relations(c)
        for c in data.claims
        if c["id_pengklaim"] == user_id
    ]

    return jsonify(
        {
            "user": target_user,
            "laporan": my_items,
            "klaim": my_claims,
        }
    ), 200


# ---------------------------------------------------------------- ITEM (BARANG) CRUD
@app.get("/api/categories")
def list_categories():
    return jsonify(data.KATEGORI), 200


@app.get("/api/items")
def list_items():
    result = list(data.items)
    tipe = request.args.get("tipe", "").lower()
    kategori = request.args.get("kategori", "").strip()
    status = request.args.get("status", "").lower()
    q = request.args.get("q", "").strip().lower()

    # Normalisasi tipe
    if tipe in ("hilang", "lost"):
        result = [i for i in result if i["tipe"] in ("hilang", "lost")]
    elif tipe in ("ditemukan", "found"):
        result = [i for i in result if i["tipe"] in ("ditemukan", "found")]

    # Normalisasi status
    if status:
        if status in ("tersedia", "open"):
            result = [i for i in result if i["status"] in ("tersedia", "open")]
        elif status in ("diklaim", "claimed"):
            result = [
                i for i in result if i["status"] in ("diklaim", "claimed")
            ]
        elif status in ("dikembalikan", "returned"):
            result = [
                i for i in result if i["status"] in ("dikembalikan", "returned")
            ]

    # Filter kategori
    if kategori and kategori != "Semua kategori":
        result = [i for i in result if i["kategori"] == kategori]

    # Pencarian teks (judul, deskripsi, lokasi)
    if q:
        result = [
            i
            for i in result
            if q in i["judul"].lower()
            or q in i.get("deskripsi", "").lower()
            or q in i.get("lokasi", "").lower()
        ]

    # Urutkan berdasarkan tanggal terbaru
    result.sort(key=lambda i: i.get("tanggal", ""), reverse=True)
    return jsonify([item_with_relations(i) for i in result]), 200


@app.get("/api/items/<int:item_id>")
def get_item(item_id):
    item = find(data.items, item_id)
    if not item:
        return error("Barang tidak ditemukan", 404)

    result = item_with_relations(item)
    # Sertakan riwayat klaim barang
    result["klaim"] = [
        claim_with_relations(c)
        for c in data.claims
        if c["id_barang"] == item_id
    ]
    return jsonify(result), 200


@app.post("/api/items")
def create_item():
    """Semua pengguna yang login boleh melapor barang dan upload foto."""
    actor = get_current_user()
    body = request.get_json(silent=True) or {}

    pelapor_id = body.get("id_pelapor")
    if not pelapor_id and actor:
        pelapor_id = actor["id"]

    pelapor = find(data.users, pelapor_id)
    if not pelapor:
        return error(
            "Identitas pelapor tidak valid. Silakan login kembali.", 401
        )

    # Validasi field wajib
    judul = str(body.get("judul", "")).strip()
    kategori = str(body.get("kategori", "")).strip()
    lokasi = str(body.get("lokasi", "")).strip()
    tanggal = str(body.get("tanggal", "")).strip() or date.today().isoformat()
    tipe = str(body.get("tipe", "")).strip().lower()

    if not judul or not kategori or not lokasi:
        return error("Judul, kategori, dan lokasi wajib diisi", 400)

    if tipe not in ("lost", "found", "hilang", "ditemukan"):
        return error("Tipe harus 'hilang'/'lost' atau 'ditemukan'/'found'", 400)

    # Normalisasi tipe ke 'lost' / 'found'
    norm_tipe = "lost" if tipe in ("lost", "hilang") else "found"
    saved_photo = save_uploaded_photo(body.get("url_foto", ""))

    if norm_tipe == "found" and not saved_photo:
        return error("Laporan barang ditemukan wajib menyertakan foto", 400)

    item = {
        "id": next_id(data.items),
        "judul": judul,
        "kategori": (
            kategori if kategori in data.KATEGORI else data.KATEGORI[0]
        ),
        "deskripsi": str(body.get("deskripsi", "")).strip(),
        "lokasi": lokasi,
        "tanggal": tanggal,
        "tipe": norm_tipe,
        "status": "open",  # Laporan baru langsung open (Tersedia)
        "url_foto": saved_photo,
        "id_pelapor": pelapor["id"],
        "lokasi_setor": CENTRAL_SECURITY_POST if norm_tipe == "found" else "",
    }
    data.items.append(item)
    return jsonify(item_with_relations(item)), 201


@app.put("/api/items/<int:item_id>")
def update_item(item_id):
    """PUT hanya boleh oleh pemilik laporan atau admin."""
    actor = get_current_user()
    item = find(data.items, item_id)
    if not item:
        return error("Barang tidak ditemukan", 404)

    if not actor or (
        actor.get("role") != "admin" and actor["id"] != item["id_pelapor"]
    ):
        return error(
            "Hanya pemilik laporan atau admin yang boleh mengubah barang ini",
            403,
        )

    body = request.get_json(silent=True) or {}
    for key in ("judul", "kategori", "deskripsi", "lokasi", "tanggal"):
        if key in body:
            item[key] = body[key]
    if "url_foto" in body:
        item["url_foto"] = save_uploaded_photo(body["url_foto"])

    if "tipe" in body:
        t = str(body["tipe"]).lower()
        if t in ("lost", "hilang"):
            item["tipe"] = "lost"
        elif t in ("found", "ditemukan"):
            item["tipe"] = "found"

    if (
        "status" in body
        and actor.get("role") == "admin"
        and body["status"] in ("open", "claimed", "returned")
    ):
        item["status"] = body["status"]

    if "lokasi_setor" in body and actor.get("role") == "admin":
        item["lokasi_setor"] = str(body["lokasi_setor"]).strip()

    return jsonify(item_with_relations(item)), 200


@app.delete("/api/items/<int:item_id>")
def delete_item(item_id):
    """DELETE hanya boleh oleh pemilik laporan atau admin (menurunkan laporan tidak pantas)."""
    actor = get_current_user()
    item = find(data.items, item_id)
    if not item:
        return error("Barang tidak ditemukan", 404)

    if not actor or (
        actor.get("role") != "admin" and actor["id"] != item["id_pelapor"]
    ):
        return error(
            "Hanya pemilik laporan atau admin yang boleh menghapus barang ini",
            403,
        )

    # Hapus klaim terkait barang ini
    data.claims[:] = [c for c in data.claims if c["id_barang"] != item_id]
    data.items.remove(item)

    return jsonify({"message": "Laporan barang berhasil dihapus"}), 200


# ---------------------------------------------------------------- CLAIM (KLAIM) CRUD
@app.get("/api/claims")
def list_claims():
    result = list(data.claims)
    item_id = request.args.get("id_barang")
    user_id = request.args.get("id_pengklaim")
    status = request.args.get("status")

    if item_id:
        result = [c for c in result if c["id_barang"] == int(item_id)]
    if user_id:
        result = [c for c in result if c["id_pengklaim"] == int(user_id)]
    if status:
        norm_status = status.lower()
        if norm_status in ("pending", "menunggu"):
            result = [
                c for c in result if c["status"] in ("pending", "menunggu")
            ]
        elif norm_status in ("approved", "disetujui"):
            result = [
                c for c in result if c["status"] in ("approved", "disetujui")
            ]
        elif norm_status in ("rejected", "ditolak"):
            result = [
                c for c in result if c["status"] in ("rejected", "ditolak")
            ]

    result.sort(key=lambda c: c.get("tanggal_klaim", ""), reverse=True)
    return jsonify([claim_with_relations(c) for c in result]), 200


@app.get("/api/claims/<int:claim_id>")
def get_claim(claim_id):
    claim = find(data.claims, claim_id)
    if not claim:
        return error("Klaim tidak ditemukan", 404)
    return jsonify(claim_with_relations(claim)), 200


@app.post("/api/claims")
def create_claim():
    """
    Mahasiswa mengajukan klaim atas barang:
    - Pengguna tidak boleh mengklaim barang miliknya sendiri.
    - Barang yang sedang claimed atau returned tidak bisa diklaim lagi.
    - Status barang otomatis menjadi claimed.
    """
    actor = get_current_user()
    body = request.get_json(silent=True) or {}

    pengklaim_id = body.get("id_pengklaim")
    if not pengklaim_id and actor:
        pengklaim_id = actor["id"]

    pengklaim = find(data.users, pengklaim_id)
    if not pengklaim:
        return error("Identitas pengklaim tidak valid", 401)

    item_id = body.get("id_barang")
    bukti_ciri = str(body.get("bukti_ciri", "")).strip()

    if not item_id or not bukti_ciri:
        return error("Barang dan bukti ciri khas wajib diisi", 400)

    item = find(data.items, item_id)
    if not item:
        return error("Barang yang hendak diklaim tidak ditemukan", 404)

    # Aturan bisnis penting
    if item["id_pelapor"] == pengklaim["id"]:
        return error("Anda tidak boleh mengklaim barang yang Anda laporkan sendiri", 400)

    if item["status"] in ("returned", "dikembalikan"):
        return error("Barang ini sudah dikembalikan kepada pemiliknya", 400)

    # Cek duplikasi klaim pending
    if any(
        c["id_barang"] == item["id"]
        and c["id_pengklaim"] == pengklaim["id"]
        and c["status"] in ("pending", "menunggu")
        for c in data.claims
    ):
        return error("Anda sudah memiliki pengajuan klaim aktif untuk barang ini", 400)

    tanggal_ambil = str(body.get("tanggal_ambil", "")).strip()
    jam_ambil = str(body.get("jam_ambil", "")).strip()
    bukti_file = save_claim_proof(body.get("bukti_file", ""))

    claim = {
        "id": next_id(data.claims),
        "id_barang": item["id"],
        "id_pengklaim": pengklaim["id"],
        "bukti_ciri": bukti_ciri,
        "status": "pending",
        "tanggal_klaim": date.today().isoformat(),
        "tanggal_ambil": tanggal_ambil,
        "jam_ambil": jam_ambil,
        "lokasi_ambil": "",
        "bukti_file": bukti_file,
    }
    data.claims.append(claim)

    # Status barang menjadi claimed
    item["status"] = "claimed"

    return jsonify(claim_with_relations(claim)), 201


@app.put("/api/claims/<int:claim_id>")
def update_or_verify_claim(claim_id):
    """
    PUT /api/claims/<id>:
    - Jika memuat field 'status' (approved/rejected): verifikasi klaim KHUSUS ADMIN.
    - Jika memuat 'bukti_ciri': pengklaim dapat memperbarui selama masih pending.
    """
    actor = get_current_user()
    claim = find(data.claims, claim_id)
    if not claim:
        return error("Klaim tidak ditemukan", 404)

    body = request.get_json(silent=True) or {}

    # Kasus 1: Verifikasi oleh Admin
    if "status" in body:
        if not actor or actor.get("role") != "admin":
            return error("Hanya admin yang berhak menyetujui atau menolak klaim", 403)

        new_status = str(body["status"]).strip().lower()
        if new_status in ("approved", "disetujui"):
            new_status = "approved"
        elif new_status in ("rejected", "ditolak"):
            new_status = "rejected"
        else:
            return error("Status klaim harus 'approved' atau 'rejected'", 400)

        claim["status"] = new_status
        item = find(data.items, claim["id_barang"])

        if new_status == "approved":
            claim["lokasi_ambil"] = str(body.get("lokasi_ambil", "")).strip() or CENTRAL_SECURITY_POST
            # Barang menjadi returned
            if item:
                item["status"] = "returned"
            # Tolak otomatis klaim lain yang masih pending untuk barang yang sama
            for other in data.claims:
                if (
                    other["id_barang"] == claim["id_barang"]
                    and other["id"] != claim["id"]
                    and other["status"] in ("pending", "menunggu")
                ):
                    other["status"] = "rejected"
        else:
            # Jika ditolak, cek apakah masih ada klaim pending lain
            refresh_item_status(claim["id_barang"])

        return jsonify(claim_with_relations(claim)), 200

    # Kasus 2: Edit bukti ciri oleh pengklaim
    if "bukti_ciri" in body:
        if not actor or (
            actor.get("role") != "admin" and actor["id"] != claim["id_pengklaim"]
        ):
            return error("Hanya pengklaim yang boleh mengubah bukti ciri", 403)

        if claim["status"] not in ("pending", "menunggu"):
            return error("Klaim yang sudah diverifikasi tidak dapat diubah", 400)

        claim["bukti_ciri"] = str(body["bukti_ciri"]).strip()
        return jsonify(claim_with_relations(claim)), 200

    return error("Tidak ada data yang diperbarui", 400)


@app.delete("/api/claims/<int:claim_id>")
def delete_claim(claim_id):
    """Batalkan klaim (hanya pengklaim atau admin)."""
    actor = get_current_user()
    claim = find(data.claims, claim_id)
    if not claim:
        return error("Klaim tidak ditemukan", 404)

    if not actor or (
        actor.get("role") != "admin" and actor["id"] != claim["id_pengklaim"]
    ):
        return error("Tidak memiliki izin membatalkan klaim ini", 403)

    data.claims.remove(claim)
    refresh_item_status(claim["id_barang"])

    return jsonify({"message": "Klaim berhasil dibatalkan"}), 200


# ---------------------------------------------------------------- penyajian frontend statis & public uploads
@app.get("/")
def serve_index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.get("/favicon.ico")
def serve_favicon():
    return "", 204


@app.get("/public/<path:path>")
def serve_public(path):
    return send_from_directory(PUBLIC_DIR, path)


@app.get("/<path:path>")
def serve_static(path):
    return send_from_directory(FRONTEND_DIR, path)


# ---------------------------------------------------------------- entrypoint
if __name__ == "__main__":
    print(f"Lost & Found Server running on http://127.0.0.1:{PORT}")
    app.run(
        host="0.0.0.0",
        port=PORT,
        debug=os.environ.get("FLASK_DEBUG") == "1",
    )
