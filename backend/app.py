"""
Backend REST API Campus Lost & Found (Python Flask).
Entitas: User, Barang (items), Klaim (claims). Data hardcoded di data.py (tanpa database).

Jalankan:  python app.py   ->  http://localhost:5000
"""
import json
import os
import urllib.error
import urllib.parse
import urllib.request
from datetime import date

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

import data

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend")

app = Flask(__name__, static_folder=None)
CORS(app)  # izinkan frontend dari origin lain memanggil API


# ---------------------------------------------------------------- helper
def next_id(rows):
    return max((r["id"] for r in rows), default=0) + 1


def find(rows, row_id):
    return next((r for r in rows if r["id"] == row_id), None)


def error(msg, code=400):
    return jsonify({"error": msg}), code


def missing_fields(body, fields):
    return [f for f in fields if not str(body.get(f, "")).strip()]


def item_with_relations(item):
    """Gabungkan Barang dengan data User pelapor dan jumlah klaimnya."""
    pelapor = find(data.users, item["id_pelapor"])
    return {
        **item,
        "pelapor": {"id": pelapor["id"], "nama": pelapor["nama"], "no_hp": pelapor["no_hp"]} if pelapor else None,
        "jumlah_klaim": sum(1 for c in data.claims if c["id_barang"] == item["id"]),
    }


def claim_with_relations(claim):
    """Gabungkan Klaim dengan data Barang dan User pengklaim."""
    barang = find(data.items, claim["id_barang"])
    pengklaim = find(data.users, claim["id_pengklaim"])
    return {
        **claim,
        "barang": {"id": barang["id"], "judul": barang["judul"], "status": barang["status"]} if barang else None,
        "pengklaim": {"id": pengklaim["id"], "nama": pengklaim["nama"], "nim": pengklaim["nim"]} if pengklaim else None,
    }


def refresh_item_status(item_id):
    """Status barang mengikuti klaimnya: dikembalikan > diklaim > tersedia."""
    item = find(data.items, item_id)
    if not item:
        return
    statuses = [c["status"] for c in data.claims if c["id_barang"] == item_id]
    if "disetujui" in statuses:
        item["status"] = "dikembalikan"
    elif "menunggu" in statuses:
        item["status"] = "diklaim"
    else:
        item["status"] = "tersedia"


# ---------------------------------------------------------------- auth
# Login hanya untuk akun Google kampus (Telkom University).
#   GOOGLE_CLIENT_ID : OAuth Client ID dari Google Cloud Console. Jika kosong,
#                      aplikasi berjalan di "mode demo" (login cukup ketik email kampus).
#   ALLOWED_DOMAINS  : domain email yang boleh masuk, dipisah koma.
#   ADMIN_EMAILS     : email yang otomatis jadi admin saat login, dipisah koma.
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "").strip()
ALLOWED_DOMAINS = [d.strip().lower() for d in os.environ.get(
    "ALLOWED_DOMAINS", "student.telkomuniversity.ac.id,telkomuniversity.ac.id").split(",") if d.strip()]
ADMIN_EMAILS = {e.strip().lower() for e in os.environ.get("ADMIN_EMAILS", "").split(",") if e.strip()}


def email_allowed(email):
    return "@" in email and email.rsplit("@", 1)[1] in ALLOWED_DOMAINS


def domain_error():
    return error("Gunakan email kampus (" + ", ".join("@" + d for d in ALLOWED_DOMAINS) + ")", 403)


def find_or_create_user(email, nama="", foto=""):
    """Cari user berdasarkan email; buat akun mahasiswa baru jika belum ada."""
    user = next((u for u in data.users if u["email"].lower() == email), None)
    if not user:
        user = {
            "id": next_id(data.users),
            "nama": nama or email.split("@")[0].replace(".", " ").title(),
            "nim": "-",
            "email": email,
            "no_hp": "",
            "role": "mahasiswa",
            "foto": foto,
        }
        data.users.append(user)
    elif foto:
        user["foto"] = foto
    if email in ADMIN_EMAILS:
        user["role"] = "admin"
    return user


def verify_google_token(credential):
    """Verifikasi ID token Google lewat endpoint tokeninfo; kembalikan payload atau None."""
    url = "https://oauth2.googleapis.com/tokeninfo?" + urllib.parse.urlencode({"id_token": credential})
    try:
        with urllib.request.urlopen(url, timeout=10) as res:
            info = json.load(res)
    except (urllib.error.URLError, ValueError):
        return None
    if info.get("aud") != GOOGLE_CLIENT_ID:
        return None
    if info.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
        return None
    if str(info.get("email_verified")).lower() != "true":
        return None
    return info


@app.get("/api/config")
def public_config():
    return jsonify({
        "google_client_id": GOOGLE_CLIENT_ID,
        "allowed_domains": ALLOWED_DOMAINS,
        "demo_mode": not GOOGLE_CLIENT_ID,
    })


@app.post("/api/auth/google")
def login_google():
    if not GOOGLE_CLIENT_ID:
        return error("Login Google belum dikonfigurasi (GOOGLE_CLIENT_ID kosong)", 503)
    credential = (request.get_json(silent=True) or {}).get("credential", "")
    info = verify_google_token(credential) if credential else None
    if not info:
        return error("Token Google tidak valid, coba masuk lagi", 401)
    email = info["email"].lower()
    if not email_allowed(email):
        return domain_error()
    return jsonify(find_or_create_user(email, info.get("name", ""), info.get("picture", "")))


@app.post("/api/login")
def login():
    """Mode demo: login cukup dengan email kampus. Dimatikan jika Google login aktif."""
    if GOOGLE_CLIENT_ID:
        return error("Silakan masuk dengan akun Google kampus", 403)
    email = (request.get_json(silent=True) or {}).get("email", "").strip().lower()
    if not email_allowed(email):
        return domain_error()
    return jsonify(find_or_create_user(email))


# ---------------------------------------------------------------- USER CRUD
@app.get("/api/users")
def list_users():
    return jsonify(data.users)


@app.post("/api/users")
def create_user():
    body = request.get_json(silent=True) or {}
    missing = missing_fields(body, ["nama", "email"])
    if missing:
        return error(f"Field wajib diisi: {', '.join(missing)}")
    if any(u["email"].lower() == body["email"].lower() for u in data.users):
        return error("Email sudah terdaftar")
    user = {
        "id": next_id(data.users),
        "nama": body["nama"],
        "nim": body.get("nim", "-"),
        "email": body["email"],
        "no_hp": body.get("no_hp", ""),
        "role": body.get("role", "mahasiswa") if body.get("role") in ("mahasiswa", "admin") else "mahasiswa",
        "foto": "",
    }
    data.users.append(user)
    return jsonify(user), 201


@app.get("/api/users/<int:user_id>")
def get_user(user_id):
    user = find(data.users, user_id)
    return jsonify(user) if user else error("User tidak ditemukan", 404)


@app.put("/api/users/<int:user_id>")
def update_user(user_id):
    user = find(data.users, user_id)
    if not user:
        return error("User tidak ditemukan", 404)
    body = request.get_json(silent=True) or {}
    for field in ("nama", "nim", "email", "no_hp"):
        if field in body:
            user[field] = body[field]
    if body.get("role") in ("mahasiswa", "admin"):
        user["role"] = body["role"]
    return jsonify(user)


@app.delete("/api/users/<int:user_id>")
def delete_user(user_id):
    user = find(data.users, user_id)
    if not user:
        return error("User tidak ditemukan", 404)
    # hapus juga laporan & klaim milik user agar data tetap konsisten
    own_item_ids = {i["id"] for i in data.items if i["id_pelapor"] == user_id}
    data.claims[:] = [c for c in data.claims
                      if c["id_pengklaim"] != user_id and c["id_barang"] not in own_item_ids]
    data.items[:] = [i for i in data.items if i["id_pelapor"] != user_id]
    data.users.remove(user)
    for item in data.items:
        refresh_item_status(item["id"])
    return jsonify({"message": "User dihapus"})


@app.get("/api/users/<int:user_id>/activity")
def user_activity(user_id):
    """Fitur 'Aktivitas Saya' (User + Barang + Klaim)."""
    user = find(data.users, user_id)
    if not user:
        return error("User tidak ditemukan", 404)
    return jsonify({
        "user": user,
        "laporan": [item_with_relations(i) for i in data.items if i["id_pelapor"] == user_id],
        "klaim": [claim_with_relations(c) for c in data.claims if c["id_pengklaim"] == user_id],
    })


# ---------------------------------------------------------------- BARANG CRUD
@app.get("/api/items")
def list_items():
    result = data.items
    tipe = request.args.get("tipe")
    kategori = request.args.get("kategori")
    lokasi = request.args.get("lokasi", "").lower()
    tanggal = request.args.get("tanggal")
    status = request.args.get("status")
    q = request.args.get("q", "").lower()
    if tipe:
        result = [i for i in result if i["tipe"] == tipe]
    if kategori:
        result = [i for i in result if i["kategori"] == kategori]
    if lokasi:
        result = [i for i in result if lokasi in i["lokasi"].lower()]
    if tanggal:
        result = [i for i in result if i["tanggal"] == tanggal]
    if status:
        result = [i for i in result if i["status"] == status]
    if q:
        result = [i for i in result if q in i["judul"].lower() or q in i["deskripsi"].lower()]
    result = sorted(result, key=lambda i: i["tanggal"], reverse=True)
    return jsonify([item_with_relations(i) for i in result])


@app.get("/api/categories")
def list_categories():
    return jsonify(data.KATEGORI)


@app.post("/api/items")
def create_item():
    body = request.get_json(silent=True) or {}
    missing = missing_fields(body, ["judul", "kategori", "lokasi", "tanggal", "tipe", "id_pelapor"])
    if missing:
        return error(f"Field wajib diisi: {', '.join(missing)}")
    if body["tipe"] not in ("hilang", "ditemukan"):
        return error("Tipe harus 'hilang' atau 'ditemukan'")
    if not find(data.users, int(body["id_pelapor"])):
        return error("Pelapor tidak ditemukan", 404)
    item = {
        "id": next_id(data.items),
        "judul": body["judul"],
        "kategori": body["kategori"],
        "deskripsi": body.get("deskripsi", ""),
        "lokasi": body["lokasi"],
        "tanggal": body["tanggal"],
        "tipe": body["tipe"],
        "status": "tersedia",
        "url_foto": body.get("url_foto", ""),
        "id_pelapor": int(body["id_pelapor"]),
    }
    data.items.append(item)
    return jsonify(item_with_relations(item)), 201


@app.get("/api/items/<int:item_id>")
def get_item(item_id):
    item = find(data.items, item_id)
    if not item:
        return error("Barang tidak ditemukan", 404)
    result = item_with_relations(item)
    result["klaim"] = [claim_with_relations(c) for c in data.claims if c["id_barang"] == item_id]
    return jsonify(result)


@app.put("/api/items/<int:item_id>")
def update_item(item_id):
    """Edit laporan: hanya pelapor atau admin (dikirim lewat field id_user)."""
    item = find(data.items, item_id)
    if not item:
        return error("Barang tidak ditemukan", 404)
    body = request.get_json(silent=True) or {}
    actor = find(data.users, int(body.get("id_user", 0) or 0))
    if not actor or (actor["role"] != "admin" and actor["id"] != item["id_pelapor"]):
        return error("Hanya pelapor atau admin yang boleh mengubah laporan", 403)
    for field in ("judul", "kategori", "deskripsi", "lokasi", "tanggal", "url_foto"):
        if field in body:
            item[field] = body[field]
    if body.get("tipe") in ("hilang", "ditemukan"):
        item["tipe"] = body["tipe"]
    return jsonify(item_with_relations(item))


@app.delete("/api/items/<int:item_id>")
def delete_item(item_id):
    item = find(data.items, item_id)
    if not item:
        return error("Barang tidak ditemukan", 404)
    actor = find(data.users, int(request.args.get("id_user", 0) or 0))
    if not actor or (actor["role"] != "admin" and actor["id"] != item["id_pelapor"]):
        return error("Hanya pelapor atau admin yang boleh menghapus laporan", 403)
    data.claims[:] = [c for c in data.claims if c["id_barang"] != item_id]
    data.items.remove(item)
    return jsonify({"message": "Laporan dihapus"})


# ---------------------------------------------------------------- KLAIM CRUD
@app.get("/api/claims")
def list_claims():
    result = data.claims
    for field in ("id_barang", "id_pengklaim"):
        if request.args.get(field):
            result = [c for c in result if c[field] == int(request.args[field])]
    if request.args.get("status"):
        result = [c for c in result if c["status"] == request.args["status"]]
    return jsonify([claim_with_relations(c) for c in result])


@app.post("/api/claims")
def create_claim():
    """Fitur 'Ajukan Klaim' (Klaim + Barang + User)."""
    body = request.get_json(silent=True) or {}
    missing = missing_fields(body, ["id_barang", "id_pengklaim", "bukti_ciri"])
    if missing:
        return error(f"Field wajib diisi: {', '.join(missing)}")
    item = find(data.items, int(body["id_barang"]))
    user = find(data.users, int(body["id_pengklaim"]))
    if not item or not user:
        return error("Barang atau user tidak ditemukan", 404)
    if item["status"] == "dikembalikan":
        return error("Barang sudah dikembalikan ke pemiliknya")
    if item["id_pelapor"] == user["id"]:
        return error("Tidak bisa mengklaim laporan sendiri")
    if any(c["id_barang"] == item["id"] and c["id_pengklaim"] == user["id"] and c["status"] == "menunggu"
           for c in data.claims):
        return error("Kamu sudah punya klaim yang menunggu untuk barang ini")
    claim = {
        "id": next_id(data.claims),
        "id_barang": item["id"],
        "id_pengklaim": user["id"],
        "bukti_ciri": body["bukti_ciri"],
        "status": "menunggu",
        "tanggal_klaim": date.today().isoformat(),
    }
    data.claims.append(claim)
    refresh_item_status(item["id"])  # -> "diklaim"
    return jsonify(claim_with_relations(claim)), 201


@app.get("/api/claims/<int:claim_id>")
def get_claim(claim_id):
    claim = find(data.claims, claim_id)
    return jsonify(claim_with_relations(claim)) if claim else error("Klaim tidak ditemukan", 404)


@app.put("/api/claims/<int:claim_id>")
def update_claim(claim_id):
    """Pengklaim mengubah bukti ciri selama klaim masih 'menunggu'."""
    claim = find(data.claims, claim_id)
    if not claim:
        return error("Klaim tidak ditemukan", 404)
    if claim["status"] != "menunggu":
        return error("Klaim yang sudah diverifikasi tidak bisa diubah")
    body = request.get_json(silent=True) or {}
    if not str(body.get("bukti_ciri", "")).strip():
        return error("Bukti ciri tidak boleh kosong")
    claim["bukti_ciri"] = body["bukti_ciri"]
    return jsonify(claim_with_relations(claim))


@app.delete("/api/claims/<int:claim_id>")
def delete_claim(claim_id):
    """Batalkan klaim yang masih menunggu."""
    claim = find(data.claims, claim_id)
    if not claim:
        return error("Klaim tidak ditemukan", 404)
    if claim["status"] != "menunggu":
        return error("Klaim yang sudah diverifikasi tidak bisa dibatalkan")
    data.claims.remove(claim)
    refresh_item_status(claim["id_barang"])
    return jsonify({"message": "Klaim dibatalkan"})


@app.post("/api/claims/<int:claim_id>/verify")
def verify_claim(claim_id):
    """Fitur 'Verifikasi Klaim' oleh admin (Klaim + Barang + User)."""
    claim = find(data.claims, claim_id)
    if not claim:
        return error("Klaim tidak ditemukan", 404)
    body = request.get_json(silent=True) or {}
    admin = find(data.users, int(body.get("id_admin", 0) or 0))
    if not admin or admin["role"] != "admin":
        return error("Hanya admin yang boleh memverifikasi klaim", 403)
    if body.get("status") not in ("disetujui", "ditolak"):
        return error("Status harus 'disetujui' atau 'ditolak'")
    if claim["status"] != "menunggu":
        return error("Klaim sudah diverifikasi sebelumnya")
    claim["status"] = body["status"]
    if claim["status"] == "disetujui":
        # klaim lain untuk barang yang sama otomatis ditolak
        for other in data.claims:
            if other["id_barang"] == claim["id_barang"] and other["id"] != claim["id"] and other["status"] == "menunggu":
                other["status"] = "ditolak"
    refresh_item_status(claim["id_barang"])
    return jsonify(claim_with_relations(claim))


# ---------------------------------------------------------------- frontend statis
@app.get("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.get("/<path:path>")
def static_files(path):
    return send_from_directory(FRONTEND_DIR, path)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG") == "1")
