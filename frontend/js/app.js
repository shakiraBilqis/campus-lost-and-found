// Logika halaman Campus Lost & Found.
let currentUser = JSON.parse(localStorage.getItem("lf_user") || "null");
let appConfig = { google_client_id: "", allowed_domains: [], demo_mode: true };

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const formData = (form) => Object.fromEntries(new FormData(form).entries());
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso) =>
  iso ? new Date(iso + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";
const initials = (name) =>
  String(name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

// ------------------------------------------------------------ ikon (SVG garis)
const svg = (d) => `<svg viewBox="0 0 24 24">${d}</svg>`;
const ICON = {
  search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  pin: svg('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'),
  calendar: svg('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
  check: svg('<circle cx="12" cy="12" r="10"/><path d="m8.5 12 2.5 2.5 4.5-5"/>'),
  hand: svg('<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>'),
  box: svg('<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>'),
  inbox: svg('<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>'),
};
const CAT_ICON = {
  "Kartu/Dokumen": svg('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>'),
  "Dompet/Tas": svg('<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>'),
  Elektronik: svg('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/>'),
  Kunci: svg('<circle cx="7.5" cy="15.5" r="4.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>'),
  Pakaian: svg('<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>'),
};
const catIcon = (cat) => `<span class="cat-ic">${CAT_ICON[cat] || ICON.box}</span>`;

function toast(msg, isError = false) {
  const t = $("#toast");
  t.textContent = msg;
  t.className = isError ? "error" : "";
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (t.hidden = true), 3200);
}

async function run(fn) {
  try {
    await fn();
  } catch (e) {
    toast(e.message, true);
  }
}

const badge = (text) => `<span class="badge ${esc(text)}">${esc(text)}</span>`;
const emptyState = (title, sub) => `<div class="empty">${ICON.inbox}<b>${esc(title)}</b>${esc(sub)}</div>`;

// ------------------------------------------------------------ login
function setUser(user) {
  currentUser = user;
  if (user) localStorage.setItem("lf_user", JSON.stringify(user));
  else localStorage.removeItem("lf_user");
}

function renderWho() {
  $("#who-name").textContent = currentUser.nama;
  $("#who-role").textContent = currentUser.role;
  $("#who-avatar").innerHTML = currentUser.foto
    ? `<img src="${esc(currentUser.foto)}" alt="" referrerpolicy="no-referrer">`
    : esc(initials(currentUser.nama));
  $("#greeting").textContent = `Halo, ${currentUser.nama.split(" ")[0]}!`;
}

function showApp() {
  $("#login-page").hidden = !!currentUser;
  $("#app").hidden = !currentUser;
  if (!currentUser) return renderLogin();
  renderWho();
  $$(".admin-only").forEach((el) => (el.hidden = currentUser.role !== "admin"));
  goTo("home");
}

function afterLogin(user) {
  setUser(user);
  showApp();
  if (!user.nim || user.nim === "-" || !user.no_hp) openProfile(true);
}

function renderLogin() {
  const domains = appConfig.allowed_domains.map((d) => "@" + d);
  if (domains.length) $("#domain-hint").textContent = domains.join(" / ");
  $("#google-area").hidden = appConfig.demo_mode;
  $("#demo-area").hidden = !appConfig.demo_mode;
  if (!appConfig.demo_mode) loadGoogleButton();
}

function loadGoogleButton() {
  const render = () => {
    google.accounts.id.initialize({
      client_id: appConfig.google_client_id,
      hd: appConfig.allowed_domains[0], // saran domain di pemilih akun Google
      callback: ({ credential }) => run(async () => afterLogin(await api.loginGoogle(credential))),
    });
    google.accounts.id.renderButton($("#gsi-btn"), {
      theme: "outline", size: "large", shape: "pill", text: "signin_with", width: 320, locale: "id",
    });
  };
  if (window.google?.accounts?.id) return render();
  const s = document.createElement("script");
  s.src = "https://accounts.google.com/gsi/client";
  s.async = true;
  s.onload = render;
  s.onerror = () => toast("Gagal memuat Google Sign-In. Cek koneksi internet.", true);
  document.head.appendChild(s);
}

$("#login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  run(async () => afterLogin(await api.login(formData(e.target).email)));
});

$("#logout").addEventListener("click", () => {
  window.google?.accounts?.id?.disableAutoSelect();
  setUser(null);
  showApp();
});

// ------------------------------------------------------------ profil
function openProfile(firstTime = false) {
  const f = $("#profile-form");
  ["nama", "email", "no_hp"].forEach((k) => (f[k].value = currentUser[k] || ""));
  f.nim.value = currentUser.nim === "-" ? "" : currentUser.nim;
  $("#profile-hint").hidden = !firstTime;
  $("#profile-dialog").showModal();
}
$("#profile-btn").addEventListener("click", () => openProfile(false));
$("#profile-form").addEventListener("submit", (e) => {
  e.preventDefault();
  run(async () => {
    const { nama, nim, no_hp } = formData(e.target);
    setUser(await api.updateUser(currentUser.id, { nama, nim: nim || "-", no_hp }));
    renderWho();
    $("#profile-dialog").close();
    toast("Profil disimpan");
  });
});

// tutup modal: tombol × atau klik di luar kotak
$$("dialog").forEach((d) => {
  d.addEventListener("click", (e) => {
    if (e.target === d || e.target.closest("[data-close]")) d.close();
  });
});

// ------------------------------------------------------------ navigasi
function goTo(page) {
  $$(".page").forEach((p) => (p.hidden = p.id !== `page-${page}`));
  $$(".nav").forEach((b) => b.classList.toggle("active", b.dataset.page === page));
  window.scrollTo({ top: 0 });
  if (page === "home") loadItems(true);
  if (page === "activity") loadActivity();
  if (page === "admin") loadAdmin();
  if (page === "report" && !$("#item-form").edit_id.value) resetItemForm();
}
$$(".nav").forEach((b) => b.addEventListener("click", () => goTo(b.dataset.page)));
$$("[data-goto]").forEach((b) => b.addEventListener("click", () => goTo(b.dataset.goto)));

// ------------------------------------------------------------ beranda
function itemCard(item, withActions = false) {
  const canEdit = currentUser.role === "admin" || item.id_pelapor === currentUser.id;
  return `
    <article class="card item" data-id="${item.id}" data-act="detail">
      <div class="thumb ${esc(item.tipe)}">
        ${item.url_foto ? `<img src="${esc(item.url_foto)}" alt="" loading="lazy" onerror="this.remove()">` : ""}
        ${catIcon(item.kategori)}
        <div class="badges">${badge(item.tipe)} ${badge(item.status)}</div>
      </div>
      <div class="item-body">
        <h3>${esc(item.judul)}</h3>
        <p class="desc">${esc(item.deskripsi) || "Tidak ada deskripsi."}</p>
        <div class="meta">
          <span>${ICON.pin} ${esc(item.lokasi)}</span>
          <span>${ICON.calendar} ${fmtDate(item.tanggal)}</span>
        </div>
        <div class="item-foot">
          <span>${esc(item.kategori)}${item.jumlah_klaim ? ` · ${item.jumlah_klaim} klaim` : ""}</span>
          ${withActions && canEdit ? `<div class="row">
            <button class="btn small" data-act="edit">Edit</button>
            <button class="btn small danger" data-act="delete">Hapus</button></div>` : ""}
        </div>
      </div>
    </article>`;
}

function renderStats(all) {
  const count = (fn) => all.filter(fn).length;
  const stats = [
    ["ic-ink", ICON.box, all.length, "Total laporan"],
    ["ic-red", ICON.search, count((i) => i.tipe === "hilang" && i.status !== "dikembalikan"), "Masih dicari"],
    ["ic-blue", ICON.hand, count((i) => i.tipe === "ditemukan" && i.status !== "dikembalikan"), "Menunggu pemilik"],
    ["ic-green", ICON.check, count((i) => i.status === "dikembalikan"), "Sudah kembali"],
  ];
  $("#stats").innerHTML = stats.map(([cls, ic, n, label]) => `
    <div class="card stat"><span class="stat-ic ${cls}">${ic}</span><div><b>${n}</b><span>${label}</span></div></div>`).join("");
}

async function loadItems(withStats = false) {
  if (withStats) $("#item-grid").innerHTML = '<div class="skeleton"></div>'.repeat(4);
  run(async () => {
    const [items, all] = await Promise.all([
      api.listItems(formData($("#filter-form"))),
      withStats ? api.listItems() : null,
    ]);
    if (all) renderStats(all);
    $("#result-count").textContent = `${items.length} barang ditemukan`;
    $("#item-grid").innerHTML = items.length
      ? items.map((i) => itemCard(i, currentUser.role === "admin")).join("")
      : emptyState("Belum ada barang yang cocok", "Coba ubah kata kunci atau filter.");
  });
}

// filter langsung jalan saat mengetik / memilih
let filterTimer;
$("#filter-form").addEventListener("input", () => {
  clearTimeout(filterTimer);
  filterTimer = setTimeout(() => loadItems(), 250);
});
$("#filter-form").addEventListener("submit", (e) => {
  e.preventDefault();
  loadItems();
});
$("#filter-form").addEventListener("reset", () => setTimeout(() => loadItems()));

// klik pada kartu barang (beranda & aktivitas)
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-act]");
  const card = e.target.closest(".item");
  if (!btn || !card) return;
  const id = Number(card.dataset.id);
  if (btn.dataset.act === "detail") openDetail(id);
  if (btn.dataset.act === "edit") editItem(id);
  if (btn.dataset.act === "delete") deleteItem(id);
});

// ------------------------------------------------------------ detail + ajukan klaim
async function openDetail(id) {
  run(async () => {
    const item = await api.getItem(id);
    const myPending = item.klaim.some((c) => c.id_pengklaim === currentUser.id && c.status === "menunggu");
    const isMine = item.id_pelapor === currentUser.id;
    const canClaim = item.status !== "dikembalikan" && !isMine && !myPending;
    let claimPart = "";
    if (canClaim) {
      claimPart = `
        <form id="claim-form" class="claim-box">
          <h3>${item.tipe === "ditemukan" ? "Ini barang kamu?" : "Kamu menemukan barang ini?"}</h3>
          <p class="muted small">Sebutkan ciri khas yang hanya diketahui pemilik. Admin akan memverifikasi klaimmu.</p>
          <div class="stack">
            <textarea name="bukti_ciri" rows="3" required placeholder="mis. ada stiker kucing di bagian dalam"></textarea>
            <div class="row end"><button class="btn primary" type="submit">Kirim klaim</button></div>
          </div>
        </form>`;
    } else if (isMine) {
      claimPart = `<p class="info-line">Ini laporan kamu sendiri.</p>`;
    } else if (myPending) {
      claimPart = `<p class="info-line">Klaim kamu untuk barang ini sedang menunggu verifikasi admin.</p>`;
    } else if (item.status === "dikembalikan") {
      claimPart = `<p class="info-line">Barang ini sudah dikembalikan ke pemiliknya.</p>`;
    }
    $("#detail-body").innerHTML = `
      <div class="detail-hero thumb ${esc(item.tipe)}">
        ${item.url_foto ? `<img src="${esc(item.url_foto)}" alt="" onerror="this.remove()">` : ""}
        ${catIcon(item.kategori)}
      </div>
      <div class="detail-content">
        <div class="row">${badge(item.tipe)} ${badge(item.status)}</div>
        <h2>${esc(item.judul)}</h2>
        <p>${esc(item.deskripsi) || "<span class='muted'>Tidak ada deskripsi.</span>"}</p>
        <dl class="detail-grid">
          <div><dt>Kategori</dt><dd>${esc(item.kategori)}</dd></div>
          <div><dt>Tanggal</dt><dd>${fmtDate(item.tanggal)}</dd></div>
          <div><dt>Lokasi</dt><dd>${esc(item.lokasi)}</dd></div>
          <div><dt>Pelapor</dt><dd>${esc(item.pelapor?.nama)}<br><span class="muted small">${esc(item.pelapor?.no_hp || "-")}</span></dd></div>
        </dl>
        ${claimPart}
      </div>`;
    $("#detail-dialog").showModal();

    $("#claim-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      run(async () => {
        await api.createClaim({ id_barang: id, id_pengklaim: currentUser.id, bukti_ciri: formData(e.target).bukti_ciri });
        $("#detail-dialog").close();
        toast("Klaim terkirim, menunggu verifikasi admin");
        loadItems(true);
      });
    });
  });
}

// ------------------------------------------------------------ lapor / edit barang
function resetItemForm() {
  const f = $("#item-form");
  f.reset();
  f.edit_id.value = "";
  f.tanggal.value = today();
  $("#report-title").textContent = "Lapor Barang";
  $("#cancel-edit").hidden = true;
}

async function editItem(id) {
  run(async () => {
    const item = await api.getItem(id);
    const f = $("#item-form");
    f.edit_id.value = item.id;
    ["judul", "kategori", "deskripsi", "lokasi", "tanggal", "url_foto"].forEach((k) => (f[k].value = item[k]));
    f.querySelector(`[name=tipe][value=${item.tipe}]`).checked = true;
    $("#report-title").textContent = "Edit Laporan";
    $("#cancel-edit").hidden = false;
    goTo("report");
  });
}

async function deleteItem(id) {
  if (!confirm("Hapus laporan ini? Klaim terkait juga ikut terhapus.")) return;
  run(async () => {
    await api.deleteItem(id, currentUser.id);
    toast("Laporan dihapus");
    if (!$("#page-home").hidden) loadItems(true);
    if (!$("#page-activity").hidden) loadActivity();
  });
}

$("#cancel-edit").addEventListener("click", () => {
  resetItemForm();
  goTo("activity");
});

$("#item-form").addEventListener("submit", (e) => {
  e.preventDefault();
  run(async () => {
    const body = formData(e.target);
    const id = body.edit_id;
    delete body.edit_id;
    if (id) {
      await api.updateItem(id, { ...body, id_user: currentUser.id });
      toast("Laporan diperbarui");
    } else {
      await api.createItem({ ...body, id_pelapor: currentUser.id });
      toast("Laporan berhasil dibuat");
    }
    resetItemForm();
    goTo("home");
  });
});

// ------------------------------------------------------------ aktivitas saya
async function loadActivity() {
  if (!currentUser) return;
  run(async () => {
    const act = await api.activity(currentUser.id);
    $("#my-items").innerHTML = act.laporan.length
      ? act.laporan.map((i) => itemCard(i, true)).join("")
      : emptyState("Kamu belum membuat laporan", "Laporan barang hilang atau temuan kamu akan muncul di sini.");
    $("#my-claims").innerHTML = act.klaim.length
      ? act.klaim.map((c) => `
        <tr>
          <td><b>${esc(c.barang?.judul)}</b></td>
          <td class="clip">${esc(c.bukti_ciri)}</td>
          <td>${fmtDate(c.tanggal_klaim)}</td>
          <td>${badge(c.status)}</td>
          <td class="actions">${c.status === "menunggu" ? `
            <button class="btn small" onclick="editClaim(${c.id}, this)">Edit</button>
            <button class="btn small danger" onclick="cancelClaim(${c.id})">Batalkan</button>` : ""}</td>
        </tr>`).join("")
      : `<tr class="muted-row"><td colspan="5">Belum ada klaim.</td></tr>`;
  });
}

function editClaim(id, btn) {
  const current = btn.closest("tr").children[1].textContent;
  const bukti = prompt("Ubah bukti ciri barang:", current);
  if (!bukti) return;
  run(async () => {
    await api.updateClaim(id, { bukti_ciri: bukti });
    toast("Klaim diperbarui");
    loadActivity();
  });
}

function cancelClaim(id) {
  if (!confirm("Batalkan klaim ini?")) return;
  run(async () => {
    await api.deleteClaim(id);
    toast("Klaim dibatalkan");
    loadActivity();
  });
}

// ------------------------------------------------------------ admin
async function loadAdmin() {
  if (currentUser?.role !== "admin") return;
  run(async () => {
    const [claims, users] = await Promise.all([api.listClaims(), api.listUsers()]);
    claims.sort((a, b) => (a.status === "menunggu" ? -1 : 1) - (b.status === "menunggu" ? -1 : 1));
    const pending = claims.filter((c) => c.status === "menunggu").length;
    $("#pending-count").textContent = pending ? `${pending} menunggu` : "";
    $("#admin-claims").innerHTML = claims.length
      ? claims.map((c) => `
        <tr>
          <td><b>${esc(c.barang?.judul)}</b></td>
          <td>${esc(c.pengklaim?.nama)}<span class="sub">${esc(c.pengklaim?.nim)}</span></td>
          <td class="clip">${esc(c.bukti_ciri)}</td>
          <td>${fmtDate(c.tanggal_klaim)}</td>
          <td>${badge(c.status)}</td>
          <td class="actions">${c.status === "menunggu" ? `
            <button class="btn small primary" onclick="verify(${c.id}, 'disetujui')">Setujui</button>
            <button class="btn small danger" onclick="verify(${c.id}, 'ditolak')">Tolak</button>` : ""}</td>
        </tr>`).join("")
      : `<tr class="muted-row"><td colspan="6">Belum ada klaim.</td></tr>`;

    $("#admin-users").innerHTML = users.map((u) => `
      <tr>
        <td><b>${esc(u.nama)}</b></td><td>${esc(u.nim)}</td><td>${esc(u.email)}</td>
        <td>${esc(u.no_hp || "-")}</td><td>${badge(u.role)}</td>
        <td class="actions">
          <button class="btn small" onclick='fillUser(${JSON.stringify(u).replace(/'/g, "&#39;")})'>Edit</button>
          ${u.id !== currentUser.id ? `<button class="btn small danger" onclick="removeUser(${u.id})">Hapus</button>` : ""}
        </td>
      </tr>`).join("");
  });
}

function verify(id, status) {
  run(async () => {
    await api.verifyClaim(id, status, currentUser.id);
    toast(status === "disetujui" ? "Klaim disetujui, barang ditandai dikembalikan" : "Klaim ditolak");
    loadAdmin();
  });
}

function fillUser(u) {
  const f = $("#user-form");
  f.edit_id.value = u.id;
  ["nama", "nim", "email", "no_hp", "role"].forEach((k) => (f[k].value = u[k]));
  f.scrollIntoView({ behavior: "smooth", block: "center" });
}

function removeUser(id) {
  if (!confirm("Hapus user ini beserta laporan dan klaimnya?")) return;
  run(async () => {
    await api.deleteUser(id);
    toast("User dihapus");
    loadAdmin();
  });
}

$("#user-form").addEventListener("submit", (e) => {
  e.preventDefault();
  run(async () => {
    const body = formData(e.target);
    const id = body.edit_id;
    delete body.edit_id;
    if (id) await api.updateUser(id, body);
    else await api.createUser(body);
    e.target.reset();
    e.target.edit_id.value = "";
    toast("User disimpan");
    loadAdmin();
  });
});
$("#user-form").addEventListener("reset", (e) => (e.target.edit_id.value = ""));

// ------------------------------------------------------------ init
(async function init() {
  try {
    const [cfg, cats] = await Promise.all([api.config(), api.categories()]);
    appConfig = cfg;
    $$(".kategori-select").forEach((sel) => {
      sel.insertAdjacentHTML("beforeend", cats.map((c) => `<option>${esc(c)}</option>`).join(""));
    });
    // sesi lama: pastikan user masih ada di server (data reset saat server restart)
    if (currentUser) {
      const fresh = await api.getUser(currentUser.id).catch(() => null);
      setUser(fresh && fresh.email === currentUser.email ? fresh : null);
    }
  } catch {
    toast("Backend tidak bisa dihubungi. Pastikan server Flask berjalan.", true);
  }
  showApp();
})();
