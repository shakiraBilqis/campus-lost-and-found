// ==========================================================================
// Lost & Found Telkom University - Logika Frontend (Single Page Application)
// ==========================================================================

let currentUser = null;
let currentItems = [];
let availableCategories = [];
let activeFilters = {
  q: "",
  kategori: "",
  tipe: "",
};

// ---------------------------------------------------------------- utilitas
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(isoStr) {
  if (!isoStr) return "-";
  try {
    const d = new Date(isoStr + "T00:00:00");
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return isoStr;
  }
}

function showToast(message, isError = false) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.className = `toast ${isError ? "error" : ""}`;
  toast.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.hidden = true;
  }, 3200);
}

function openModal(contentHtml) {
  const backdrop = $("#modal-container");
  const content = $("#modal-content");
  content.innerHTML = contentHtml;
  backdrop.hidden = false;
}

function closeModal() {
  const backdrop = $("#modal-container");
  backdrop.hidden = true;
  $("#modal-content").innerHTML = "";
}

// Tutup modal jika klik backdrop di luar card
window.addEventListener("click", (e) => {
  if (e.target.id === "modal-container") {
    closeModal();
  }
});

// Warna latar thumbnail berdasarkan huruf pertama judul (konsisten dengan screenshot)
function getAvatarBgColor(letter) {
  const colors = [
    "#1e293b", // Slate
    "#1e3a5f", // Navy blue (mirip KTM / Botol)
    "#3b1d28", // Maroon / Dark red (mirip Dompet)
    "#1e3350", // Dark indigo (mirip Charger)
    "#2d2036", // Dark purple
    "#1a332a", // Dark green
  ];
  const charCode = (letter || "A").charCodeAt(0);
  return colors[charCode % colors.length];
}

// ---------------------------------------------------------------- otentikasi
function initAuth() {
  try {
    const saved = localStorage.getItem("lf_user");
    if (saved) {
      currentUser = JSON.parse(saved);
    }
  } catch (e) {
    currentUser = null;
  }

  if (currentUser) {
    showAppLayout();
  } else {
    showLoginPage();
  }
}

function showLoginPage() {
  $("#login-page").hidden = false;
  $("#app").hidden = true;
}

function showAppLayout() {
  $("#login-page").hidden = true;
  $("#app").hidden = false;

  // Tampilkan data pengguna
  $("#user-display-name").textContent = currentUser.nama;
  $("#user-display-role").textContent =
    currentUser.role === "admin" ? "Admin" : "Mahasiswa";

  // Greeting di beranda
  const firstName = currentUser.nama.split(" ")[0];
  $("#greeting-heading").textContent = `Halo, ${firstName}`;

  // Tampilkan tab admin jika role admin
  const isAdmin = currentUser.role === "admin";
  $$(".admin-only").forEach((el) => {
    el.hidden = !isAdmin;
  });

  // Navigasi ke halaman sesuai hash atau default ke beranda
  handleRouting();
}

function logout() {
  currentUser = null;
  localStorage.removeItem("lf_user");
  window.location.hash = "";
  showLoginPage();
  showToast("Anda telah keluar");
}

// ---------------------------------------------------------------- routing (hash)
function handleRouting() {
  if (!currentUser) {
    showLoginPage();
    return;
  }

  const hash = window.location.hash.replace("#", "") || "beranda";
  const targetPage = ["beranda", "lapor", "aktivitas", "admin"].includes(hash)
    ? hash
    : "beranda";

  // Proteksi rute admin
  if (targetPage === "admin" && currentUser.role !== "admin") {
    window.location.hash = "beranda";
    return;
  }

  // Update navigasi aktif
  $$(".nav-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.page === targetPage);
  });
  $$(".mob-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.page === targetPage);
  });

  // Tampilkan section halaman
  $$(".page-section").forEach((sec) => {
    sec.hidden = sec.id !== `page-${targetPage}`;
  });

  // Muat data spesifik halaman
  if (targetPage === "beranda") {
    loadItems();
  } else if (targetPage === "lapor") {
    initReportForm();
  } else if (targetPage === "aktivitas") {
    loadUserActivity();
  } else if (targetPage === "admin") {
    loadAdminData();
  }
}

window.addEventListener("hashchange", handleRouting);

// ---------------------------------------------------------------- gambar (client-side resize)
function compressAndConvertImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 800;
        const maxHeight = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Kualitas JPEG 0.8
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------------------------------------------------------------- beranda (items list)
async function loadItems() {
  try {
    $("#items-count").textContent = "Memuat daftar barang...";
    const items = await api.listItems(activeFilters);
    currentItems = items;
    renderItemsList(items);
  } catch (err) {
    showToast(err.message, true);
    $("#items-count").textContent = "Gagal memuat barang.";
  }
}

function renderItemsList(items) {
  const container = $("#items-container");
  $("#items-count").textContent = `${items.length} barang`;

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Belum ada laporan yang sesuai kriteria.</p>
        <p class="mt-1" style="color: var(--text-dim); font-size: 0.85rem;">
          Kamu dapat melaporkan barang lewat menu Lapor Barang di samping.
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = items
    .map((item) => {
      const firstLetter = (item.judul || "?").charAt(0).toUpperCase();
      const bgColor = getAvatarBgColor(item.judul);

      // Status barang: open (Tersedia), claimed (Sedang diklaim), returned (Sudah kembali)
      let statusLabel = "Tersedia";
      let statusClass = "status-open";
      if (item.status === "claimed" || item.status === "diklaim") {
        statusLabel = "Sedang diklaim";
        statusClass = "status-claimed";
      } else if (item.status === "returned" || item.status === "dikembalikan") {
        statusLabel = "Sudah kembali";
        statusClass = "status-returned";
      }

      // Tipe: found (Ditemukan) / lost (Hilang)
      const isFound = item.tipe === "found" || item.tipe === "ditemukan";
      const typeLabel = isFound ? "Ditemukan" : "Hilang";
      const typeClass = isFound ? "found" : "lost";

      const thumbHtml = item.url_foto
        ? `<img src="${escapeHtml(item.url_foto)}" alt="${escapeHtml(item.judul)}">`
        : `<span>${firstLetter}</span>`;

      return `
        <article class="item-row" data-id="${item.id}" tabindex="0" role="button" aria-label="Lihat rincian ${escapeHtml(item.judul)}">
          <div class="item-thumb" style="background-color: ${bgColor};">
            ${thumbHtml}
          </div>
          <div class="item-body">
            <h2 class="item-title">${escapeHtml(item.judul)}</h2>
            <p class="item-desc">${escapeHtml(item.deskripsi || "Tidak ada rincian tambahan.")}</p>
            <div class="item-meta">
              ${escapeHtml(item.lokasi)}, ${formatDate(item.tanggal)}
            </div>
          </div>
          <div class="item-status-group">
            <span class="badge-type ${typeClass}">${typeLabel}</span>
            <div class="status-indicator ${statusClass}">
              <span class="status-dot"></span>
              <span>${statusLabel}</span>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  // Event listener klik item untuk buka modal detail
  container.querySelectorAll(".item-row").forEach((el) => {
    const itemId = parseInt(el.dataset.id, 10);
    el.addEventListener("click", () => showItemDetail(itemId));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        showItemDetail(itemId);
      }
    });
  });
}

// ---------------------------------------------------------------- detail item & klaim modal
async function showItemDetail(itemId) {
  try {
    const item = await api.getItem(itemId);
    const isOwner = currentUser && item.id_pelapor === currentUser.id;
    const isAdmin = currentUser && currentUser.role === "admin";
    const canClaim =
      currentUser &&
      !isOwner &&
      (item.status === "open" || item.status === "tersedia");

    const isFound = item.tipe === "found" || item.tipe === "ditemukan";
    const typeLabel = isFound ? "Ditemukan" : "Hilang";
    const typeClass = isFound ? "found" : "lost";

    let statusLabel = "Tersedia";
    let statusClass = "status-open";
    if (item.status === "claimed" || item.status === "diklaim") {
      statusLabel = "Sedang diklaim";
      statusClass = "status-claimed";
    } else if (item.status === "returned" || item.status === "dikembalikan") {
      statusLabel = "Sudah kembali";
      statusClass = "status-returned";
    }

    const photoHtml = item.url_foto
      ? `<div style="margin-bottom: 1.25rem; text-align: center;">
           <img src="${escapeHtml(item.url_foto)}" alt="" style="max-width: 100%; max-height: 280px; border-radius: var(--radius); border: 1px solid var(--border-line);">
         </div>`
      : "";

    const pelaporInfo = item.pelapor
      ? `<div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">
           Dilaporkan oleh: <strong>${escapeHtml(item.pelapor.nama)}</strong> (${escapeHtml(item.pelapor.nim || "-")})
         </div>`
      : "";

    let actionButtons = "";
    if (canClaim) {
      actionButtons += `
        <button type="button" class="btn btn-primary" id="btn-open-claim" data-id="${item.id}">
          Ajukan klaim
        </button>
      `;
    }
    if (isOwner || isAdmin) {
      actionButtons += `
        <button type="button" class="btn btn-danger btn-sm" id="btn-delete-item" data-id="${item.id}">
          ${isAdmin ? "Turunkan laporan" : "Hapus laporan"}
        </button>
      `;
    }

    const modalHtml = `
      <div class="modal-header">
        <h2 class="modal-title">${escapeHtml(item.judul)}</h2>
        <button type="button" class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      ${photoHtml}
      <div style="display: flex; gap: 0.75rem; margin-bottom: 1rem; align-items: center;">
        <span class="badge-type ${typeClass}">${typeLabel}</span>
        <div class="status-indicator ${statusClass}">
          <span class="status-dot"></span>
          <span>${statusLabel}</span>
        </div>
        <span style="font-size: 0.82rem; color: var(--text-dim); margin-left: auto;">
          Kategori: ${escapeHtml(item.kategori)}
        </span>
      </div>
      <div style="background-color: #12161c; padding: 1rem; border-radius: var(--radius); margin-bottom: 1.25rem;">
        <div style="font-size: 0.85rem; color: var(--text-dim); margin-bottom: 0.35rem;">Deskripsi & Ciri:</div>
        <p style="font-size: 0.95rem; line-height: 1.5;">${escapeHtml(item.deskripsi || "Tidak ada deskripsi.")}</p>
        <div style="margin-top: 0.75rem; font-size: 0.85rem; color: var(--text-muted);">
          Lokasi: <strong>${escapeHtml(item.lokasi)}</strong> &bull; Tanggal: ${formatDate(item.tanggal)}
        </div>
        ${pelaporInfo}
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Tutup</button>
        ${actionButtons}
      </div>
    `;

    openModal(modalHtml);

    // Bind event tombol aksi di modal
    const claimBtn = $("#btn-open-claim");
    if (claimBtn) {
      claimBtn.addEventListener("click", () => openClaimForm(item));
    }

    const deleteBtn = $("#btn-delete-item");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        if (!confirm("Yakin ingin menghapus laporan barang ini?")) return;
        try {
          await api.deleteItem(item.id);
          showToast("Laporan berhasil dihapus");
          closeModal();
          loadItems();
        } catch (err) {
          showToast(err.message, true);
        }
      });
    }
  } catch (err) {
    showToast(err.message, true);
  }
}

// Modal Form Pengajuan Klaim
function openClaimForm(item) {
  const modalHtml = `
    <div class="modal-header">
      <h2 class="modal-title">Ajukan Klaim Barang</h2>
      <button type="button" class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.25rem;">
      Anda mengajukan klaim untuk: <strong>${escapeHtml(item.judul)}</strong> (${escapeHtml(item.lokasi)})
    </p>
    <form id="claim-submit-form">
      <div class="form-group">
        <label for="claim-ciri">Sebutkan ciri khas barang milik Anda *</label>
        <textarea id="claim-ciri" name="bukti_ciri" rows="4" required
          placeholder="Jelaskan secara spesifik detail yang hanya diketahui pemilik (misal: stiker, nomor seri, isi di dalam, goresan tertentu)..."></textarea>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-primary">Kirim Klaim</button>
      </div>
    </form>
  `;

  openModal(modalHtml);

  $("#claim-submit-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const ciri = $("#claim-ciri").value.trim();
    if (!ciri) return;

    try {
      await api.createClaim({
        id_barang: item.id,
        bukti_ciri: ciri,
      });
      showToast("Klaim berhasil diajukan! Menunggu verifikasi admin.");
      closeModal();
      loadItems();
    } catch (err) {
      showToast(err.message, true);
    }
  });
}

// ---------------------------------------------------------------- lapor barang form
async function initReportForm() {
  const select = $("#report-kategori");
  if (select.children.length <= 1) {
    select.innerHTML = availableCategories
      .map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`)
      .join("");
  }
  $("#report-tanggal").value = new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------- aktivitas saya
async function loadUserActivity() {
  if (!currentUser) return;
  try {
    const act = await api.activity(currentUser.id);

    // 1. Render Laporan Saya
    $("#my-items-count").textContent = act.laporan ? act.laporan.length : 0;
    const itemsContainer = $("#my-items-list");

    if (!act.laporan || act.laporan.length === 0) {
      itemsContainer.innerHTML = `
        <div class="empty-state">
          <p>Belum ada laporan yang Anda buat.</p>
          <p style="color: var(--text-dim); margin-top: 0.35rem;">
            Lapor barang lewat menu Lapor Barang di samping.
          </p>
        </div>
      `;
    } else {
      itemsContainer.innerHTML = act.laporan
        .map((item) => {
          let statusLabel = "Tersedia";
          let statusClass = "status-open";
          if (item.status === "claimed" || item.status === "diklaim") {
            statusLabel = "Sedang diklaim";
            statusClass = "status-claimed";
          } else if (item.status === "returned" || item.status === "dikembalikan") {
            statusLabel = "Sudah kembali";
            statusClass = "status-returned";
          }

          const isFound = item.tipe === "found" || item.tipe === "ditemukan";
          const typeLabel = isFound ? "Ditemukan" : "Hilang";
          const typeClass = isFound ? "found" : "lost";

          return `
            <div class="item-row" style="cursor: default;">
              <div class="item-thumb" style="background-color: ${getAvatarBgColor(item.judul)};">
                ${item.url_foto ? `<img src="${escapeHtml(item.url_foto)}" alt="">` : `<span>${(item.judul || "?").charAt(0).toUpperCase()}</span>`}
              </div>
              <div class="item-body">
                <h3 class="item-title">${escapeHtml(item.judul)}</h3>
                <p class="item-desc">${escapeHtml(item.deskripsi || "-")}</p>
                <div class="item-meta">${escapeHtml(item.lokasi)}, ${formatDate(item.tanggal)}</div>
              </div>
              <div class="item-status-group">
                <span class="badge-type ${typeClass}">${typeLabel}</span>
                <div class="status-indicator ${statusClass}">
                  <span class="status-dot"></span>
                  <span>${statusLabel}</span>
                </div>
                <div style="margin-top: 0.4rem; display: flex; gap: 0.4rem;">
                  <button type="button" class="btn btn-secondary btn-sm" onclick="openEditItemModal(${item.id})">Ubah</button>
                  <button type="button" class="btn btn-danger btn-sm" onclick="deleteMyItem(${item.id})">Hapus</button>
                </div>
              </div>
            </div>
          `;
        })
        .join("");
    }

    // 2. Render Klaim Saya
    $("#my-claims-count").textContent = act.klaim ? act.klaim.length : 0;
    const claimsContainer = $("#my-claims-list");

    if (!act.klaim || act.klaim.length === 0) {
      claimsContainer.innerHTML = `
        <div class="empty-state">
          <p>Belum ada klaim yang Anda ajukan.</p>
        </div>
      `;
    } else {
      claimsContainer.innerHTML = act.klaim
        .map((claim) => {
          let stLabel = "Menunggu verifikasi";
          let stColor = "var(--color-yellow)";
          if (claim.status === "approved" || claim.status === "disetujui") {
            stLabel = "Disetujui (Barang Kembali)";
            stColor = "var(--color-green)";
          } else if (claim.status === "rejected" || claim.status === "ditolak") {
            stLabel = "Ditolak";
            stColor = "var(--color-grey)";
          }

          const barangJudul = claim.barang ? claim.barang.judul : "Barang";

          return `
            <div class="claim-card">
              <div class="claim-card-header">
                <div>
                  <div class="claim-card-title">${escapeHtml(barangJudul)}</div>
                  <div style="font-size: 0.78rem; color: var(--text-dim);">
                    Diajukan pada: ${formatDate(claim.tanggal_klaim)}
                  </div>
                </div>
                <span style="font-size: 0.82rem; font-weight: 600; color: ${stColor};">
                  ● ${stLabel}
                </span>
              </div>
              <div class="claim-card-desc">
                <strong>Ciri khas yang kamu sebutkan:</strong><br>
                ${escapeHtml(claim.bukti_ciri)}
              </div>
              ${
                claim.status === "pending" || claim.status === "menunggu"
                  ? `<div style="text-align: right;">
                       <button type="button" class="btn btn-secondary btn-sm" onclick="cancelClaim(${claim.id})">Batalkan klaim</button>
                     </div>`
                  : ""
              }
            </div>
          `;
        })
        .join("");
    }
  } catch (err) {
    showToast(err.message, true);
  }
}

async function deleteMyItem(itemId) {
  if (!confirm("Apakah Anda yakin ingin menghapus laporan ini?")) return;
  try {
    await api.deleteItem(itemId);
    showToast("Laporan berhasil dihapus");
    loadUserActivity();
  } catch (err) {
    showToast(err.message, true);
  }
}

async function cancelClaim(claimId) {
  if (!confirm("Batalkan pengajuan klaim ini?")) return;
  try {
    await api.deleteClaim(claimId);
    showToast("Pengajuan klaim dibatalkan");
    loadUserActivity();
  } catch (err) {
    showToast(err.message, true);
  }
}

function openEditItemModal(itemId) {
  const item = currentItems.find((i) => i.id === itemId);
  if (!item) return;

  const modalHtml = `
    <div class="modal-header">
      <h2 class="modal-title">Ubah Laporan</h2>
      <button type="button" class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <form id="edit-item-form">
      <div class="form-group">
        <label>Nama barang</label>
        <input type="text" id="edit-judul" value="${escapeHtml(item.judul)}" required>
      </div>
      <div class="form-group">
        <label>Lokasi</label>
        <input type="text" id="edit-lokasi" value="${escapeHtml(item.lokasi)}" required>
      </div>
      <div class="form-group">
        <label>Deskripsi</label>
        <textarea id="edit-deskripsi" rows="3">${escapeHtml(item.deskripsi || "")}</textarea>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
      </div>
    </form>
  `;
  openModal(modalHtml);

  $("#edit-item-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await api.updateItem(item.id, {
        judul: $("#edit-judul").value.trim(),
        lokasi: $("#edit-lokasi").value.trim(),
        deskripsi: $("#edit-deskripsi").value.trim(),
      });
      showToast("Laporan berhasil diperbarui");
      closeModal();
      loadUserActivity();
      loadItems();
    } catch (err) {
      showToast(err.message, true);
    }
  });
}

// ---------------------------------------------------------------- kontrol admin
async function loadAdminData() {
  if (!currentUser || currentUser.role !== "admin") return;
  loadAdminClaims();
  loadAdminItems();
  loadAdminUsers();
}

async function loadAdminClaims(statusFilter = "") {
  try {
    const claims = await api.listClaims({ status: statusFilter });
    const container = $("#admin-claims-container");

    if (!claims || claims.length === 0) {
      container.innerHTML = `<div class="empty-state"><p>Tidak ada klaim ditemukan.</p></div>`;
      return;
    }

    container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Barang</th>
            <th>Pengklaim</th>
            <th>Bukti Ciri</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${claims
            .map((c) => {
              const isPending =
                c.status === "pending" || c.status === "menunggu";
              const bJudul = c.barang ? c.barang.judul : "-";
              const pNama = c.pengklaim ? `${c.pengklaim.nama} (${c.pengklaim.nim || "-"})` : "-";

              return `
                <tr>
                  <td><strong>${escapeHtml(bJudul)}</strong></td>
                  <td>${escapeHtml(pNama)}</td>
                  <td style="max-width: 250px;">${escapeHtml(c.bukti_ciri)}</td>
                  <td>
                    <span style="font-weight: 600; color: ${
                      isPending
                        ? "var(--color-yellow)"
                        : c.status === "approved" || c.status === "disetujui"
                        ? "var(--color-green)"
                        : "var(--color-grey)"
                    };">
                      ${escapeHtml(c.status)}
                    </span>
                  </td>
                  <td>
                    ${
                      isPending
                        ? `<div class="table-actions">
                             <button type="button" class="btn btn-primary btn-sm" onclick="verifyAdminClaim(${c.id}, 'approved')">Setujui</button>
                             <button type="button" class="btn btn-secondary btn-sm" onclick="verifyAdminClaim(${c.id}, 'rejected')">Tolak</button>
                           </div>`
                        : `<span style="color: var(--text-dim); font-size: 0.8rem;">Selesai</span>`
                    }
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    `;
  } catch (err) {
    showToast(err.message, true);
  }
}

async function verifyAdminClaim(claimId, status) {
  const actionText = status === "approved" ? "menyetujui" : "menolak";
  if (!confirm(`Konfirmasi ${actionText} klaim ini?`)) return;

  try {
    await api.verifyClaim(claimId, status);
    showToast(`Klaim berhasil di-${status}`);
    loadAdminClaims();
    loadItems();
  } catch (err) {
    showToast(err.message, true);
  }
}

async function loadAdminItems() {
  try {
    const items = await api.listItems();
    const container = $("#admin-items-container");

    container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Barang</th>
            <th>Tipe</th>
            <th>Kategori</th>
            <th>Pelapor</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map((item) => {
              const pelaporNama = item.pelapor ? item.pelapor.nama : "-";
              return `
                <tr>
                  <td><strong>${escapeHtml(item.judul)}</strong><br><small style="color: var(--text-dim);">${escapeHtml(item.lokasi)}</small></td>
                  <td><span class="badge-type ${item.tipe}">${item.tipe === "lost" ? "Hilang" : "Ditemukan"}</span></td>
                  <td>${escapeHtml(item.kategori)}</td>
                  <td>${escapeHtml(pelaporNama)}</td>
                  <td>${escapeHtml(item.status)}</td>
                  <td>
                    <button type="button" class="btn btn-danger btn-sm" onclick="adminDeleteItem(${item.id})">Turunkan</button>
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    `;
  } catch (err) {
    showToast(err.message, true);
  }
}

async function adminDeleteItem(itemId) {
  if (!confirm("Turunkan (hapus) laporan ini secara permanen?")) return;
  try {
    await api.deleteItem(itemId);
    showToast("Laporan berhasil diturunkan");
    loadAdminItems();
    loadItems();
  } catch (err) {
    showToast(err.message, true);
  }
}

async function loadAdminUsers() {
  try {
    const users = await api.listUsers();
    const container = $("#admin-users-container");

    container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>NIM</th>
            <th>Email</th>
            <th>Role</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${users
            .map((u) => {
              return `
                <tr>
                  <td><strong>${escapeHtml(u.nama)}</strong></td>
                  <td>${escapeHtml(u.nim || "-")}</td>
                  <td>${escapeHtml(u.email)}</td>
                  <td>${escapeHtml(u.role)}</td>
                  <td>
                    <div class="table-actions">
                      <button type="button" class="btn btn-secondary btn-sm" onclick="openEditUserModal(${u.id})">Ubah</button>
                      ${
                        u.email !== "admin.lostfound@telkomuniversity.ac.id"
                          ? `<button type="button" class="btn btn-danger btn-sm" onclick="adminDeleteUser(${u.id})">Hapus</button>`
                          : ""
                      }
                    </div>
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    `;
  } catch (err) {
    showToast(err.message, true);
  }
}

async function adminDeleteUser(userId) {
  if (!confirm("Hapus pengguna ini beserta semua laporan dan klaim miliknya?")) return;
  try {
    await api.deleteUser(userId);
    showToast("Pengguna berhasil dihapus");
    loadAdminUsers();
  } catch (err) {
    showToast(err.message, true);
  }
}

function openEditUserModal(userId) {
  api.getUser(userId).then((user) => {
    const modalHtml = `
      <div class="modal-header">
        <h2 class="modal-title">Ubah Pengguna</h2>
        <button type="button" class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <form id="edit-user-form">
        <div class="form-group">
          <label>Nama</label>
          <input type="text" id="edit-user-nama" value="${escapeHtml(user.nama)}" required>
        </div>
        <div class="form-group">
          <label>NIM</label>
          <input type="text" id="edit-user-nim" value="${escapeHtml(user.nim || "")}">
        </div>
        <div class="form-group">
          <label>Role</label>
          <select id="edit-user-role">
            <option value="mahasiswa" ${user.role === "mahasiswa" ? "selected" : ""}>Mahasiswa</option>
            <option value="admin" ${user.role === "admin" ? "selected" : ""}>Admin</option>
          </select>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan</button>
        </div>
      </form>
    `;
    openModal(modalHtml);

    $("#edit-user-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        await api.updateUser(user.id, {
          nama: $("#edit-user-nama").value.trim(),
          nim: $("#edit-user-nim").value.trim(),
          role: $("#edit-user-role").value,
        });
        showToast("Data pengguna diperbarui");
        closeModal();
        loadAdminUsers();
      } catch (err) {
        showToast(err.message, true);
      }
    });
  });
}

// ---------------------------------------------------------------- inisialisasi awal event listeners
document.addEventListener("DOMContentLoaded", async () => {
  // Load config & categories
  try {
    const conf = await api.config();
    availableCategories = conf.categories || [
      "Elektronik",
      "Kartu/Dokumen",
      "Dompet/Tas",
      "Kunci",
      "Pakaian",
      "Lainnya",
    ];

    // Populate category dropdown di filter beranda
    const catSelect = $("#kategori-filter");
    if (catSelect) {
      availableCategories.forEach((cat) => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        catSelect.appendChild(opt);
      });
    }
  } catch (e) {
    console.warn("Gagal memuat konfigurasi awal:", e);
  }

  initAuth();

  // 1. Login Form Submit
  const loginForm = $("#login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = $("#login-email").value.trim();
      if (!email) return;

      try {
        const user = await api.login(email);
        currentUser = user;
        localStorage.setItem("lf_user", JSON.stringify(user));
        showToast(`Selamat datang, ${user.nama}!`);
        showAppLayout();
        window.location.hash = "beranda";
      } catch (err) {
        showToast(err.message, true);
      }
    });
  }

  // 2. Logout Button
  const logoutBtn = $("#logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
  const mobLogoutBtn = $("#mob-logout-btn");
  if (mobLogoutBtn) mobLogoutBtn.addEventListener("click", logout);

  // 3. Search & Filter Input di Beranda
  const searchInput = $("#search-input");
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        activeFilters.q = e.target.value.trim();
        loadItems();
      }, 300);
    });
  }

  const kategoriFilter = $("#kategori-filter");
  if (kategoriFilter) {
    kategoriFilter.addEventListener("change", (e) => {
      activeFilters.kategori = e.target.value;
      loadItems();
    });
  }

  // Segmented Type Filter (Semua, Hilang, Ditemukan)
  const tipeSegmented = $("#tipe-segmented");
  if (tipeSegmented) {
    tipeSegmented.querySelectorAll(".seg-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        tipeSegmented.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeFilters.tipe = btn.dataset.val;
        loadItems();
      });
    });
  }

  // 4. Form Lapor Barang
  const formTipeSegmented = $("#form-tipe-segmented");
  if (formTipeSegmented) {
    formTipeSegmented.querySelectorAll(".seg-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        formTipeSegmented.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        $("#report-tipe").value = btn.dataset.val;
      });
    });
  }

  // Foto upload di form lapor
  const photoInput = $("#report-photo-input");
  const photoPreviewWrap = $("#photo-preview-wrap");
  const photoPreviewImg = $("#photo-preview-img");
  const reportUrlFoto = $("#report-url-foto");
  const btnRemovePhoto = $("#btn-remove-photo");

  if (photoInput) {
    photoInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const base64Data = await compressAndConvertImage(file);
        reportUrlFoto.value = base64Data;
        photoPreviewImg.src = base64Data;
        photoPreviewWrap.hidden = false;
      } catch (err) {
        showToast("Gagal memproses gambar", true);
      }
    });
  }

  if (btnRemovePhoto) {
    btnRemovePhoto.addEventListener("click", () => {
      photoInput.value = "";
      reportUrlFoto.value = "";
      photoPreviewImg.src = "";
      photoPreviewWrap.hidden = true;
    });
  }

  const reportForm = $("#report-form");
  if (reportForm) {
    reportForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        tipe: $("#report-tipe").value,
        judul: $("#report-judul").value.trim(),
        kategori: $("#report-kategori").value,
        tanggal: $("#report-tanggal").value,
        lokasi: $("#report-lokasi").value.trim(),
        deskripsi: $("#report-deskripsi").value.trim(),
        url_foto: $("#report-url-foto").value,
        id_pelapor: currentUser.id,
      };

      try {
        await api.createItem(payload);
        showToast("Laporan berhasil dipublikasikan!");
        reportForm.reset();
        if (btnRemovePhoto) btnRemovePhoto.click();
        window.location.hash = "beranda";
      } catch (err) {
        showToast(err.message, true);
      }
    });
  }

  // 5. Subtab navigation di Aktivitas Saya
  $$("#page-aktivitas .subtab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$("#page-aktivitas .subtab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const targetSubtab = btn.dataset.subtab;
      $("#subtab-my-items").hidden = targetSubtab !== "my-items";
      $("#subtab-my-claims").hidden = targetSubtab !== "my-claims";
    });
  });

  // 6. Subtab navigation di Kontrol Admin
  $$("#page-admin .subtab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$("#page-admin .subtab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.dataset.subtab;
      $("#subtab-admin-claims").hidden = target !== "admin-claims";
      $("#subtab-admin-items").hidden = target !== "admin-items";
      $("#subtab-admin-users").hidden = target !== "admin-users";
    });
  });

  // Filter status klaim admin
  const adminClaimFilter = $("#admin-claim-filter");
  if (adminClaimFilter) {
    adminClaimFilter.querySelectorAll(".seg-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        adminClaimFilter.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        loadAdminClaims(btn.dataset.val);
      });
    });
  }

  // Tambah pengguna oleh admin
  const btnAddUser = $("#btn-add-user");
  if (btnAddUser) {
    btnAddUser.addEventListener("click", () => {
      const modalHtml = `
        <div class="modal-header">
          <h2 class="modal-title">Tambah Pengguna Baru</h2>
          <button type="button" class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <form id="add-user-form">
          <div class="form-group">
            <label>Nama Lengkap *</label>
            <input type="text" id="add-user-nama" required placeholder="Misal: Ahmad Zaky">
          </div>
          <div class="form-group">
            <label>Email Kampus *</label>
            <input type="email" id="add-user-email" required placeholder="zaky@student.telkomuniversity.ac.id">
          </div>
          <div class="form-group">
            <label>NIM</label>
            <input type="text" id="add-user-nim" placeholder="1030124999">
          </div>
          <div class="form-group">
            <label>Peran (Role)</label>
            <select id="add-user-role">
              <option value="mahasiswa">Mahasiswa</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Batal</button>
            <button type="submit" class="btn btn-primary">Simpan Pengguna</button>
          </div>
        </form>
      `;
      openModal(modalHtml);

      $("#add-user-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
          await api.createUser({
            nama: $("#add-user-nama").value.trim(),
            email: $("#add-user-email").value.trim().lower(),
            nim: $("#add-user-nim").value.trim() || "-",
            role: $("#add-user-role").value,
          });
          showToast("Pengguna baru berhasil ditambahkan!");
          closeModal();
          loadAdminUsers();
        } catch (err) {
          showToast(err.message, true);
        }
      });
    });
  }
});
