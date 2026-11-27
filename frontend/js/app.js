// ==========================================================================
// Lost & Found Telkom University - Logika Frontend (Single Page Application)
// Mendukung Real-Time Bilingual (IND / ENG) & Dark / Light Mode
// ==========================================================================

let currentUser = null;
let currentItems = [];
let currentMyItems = [];
let currentMyClaims = [];
let currentDrawerItemId = null;
let availableCategories = [
  "Elektronik",
  "Kartu/Dokumen",
  "Dompet/Tas",
  "Kunci",
  "Pakaian",
  "Lainnya",
];
let activeFilters = {
  q: "",
  kategori: "",
  tipe: "",
};

// ---------------------------------------------------------------- i18n (IND / ENG)
const I18N = {
  id: {
    login_hero_title: "Barang hilang di kampus? Cek di sini dulu.",
    login_hero_desc:
      "Pasang foto dan lokasi barang yang hilang atau kamu temukan. Laporan langsung tayang, pemilik bisa langsung klaim.",
    login_title: "Masuk",
    login_subtitle:
      "Pakai email kampus (@student.telkomuniversity.ac.id atau @telkomuniversity.ac.id).",
    login_email_label: "Email kampus",
    login_btn: "Masuk",
    login_demo_hint: "Mode demo, tanpa Google Sign-In. Akun admin:",
    nav_home: "Beranda",
    nav_activity: "Aktivitas saya",
    nav_activity_short: "Aktivitas",
    nav_admin: "Kontrol admin",
    nav_admin_short: "Admin",
    nav_logout: "Keluar",
    role_student: "Mahasiswa",
    role_admin: "Admin",
    greeting: "Halo, {name}",
    home_sub: "Barang hilang dan temuan di sekitar kampus.",
    btn_report_item: "Lapor barang",
    search_placeholder: "Cari nama atau ciri barang",
    all_categories: "Semua kategori",
    filter_all: "Semua",
    filter_lost: "Hilang",
    filter_found: "Ditemukan",
    items_count: "{n} barang",
    items_loading: "Memuat daftar barang...",
    items_failed: "Gagal memuat barang.",
    empty_home_title: "Belum ada laporan yang sesuai kriteria.",
    empty_home_sub: "Kamu dapat melaporkan barang lewat tombol Lapor barang.",
    type_found: "Ditemukan",
    type_lost: "Hilang",
    status_open: "Tersedia",
    status_claimed: "Sedang diklaim",
    status_returned: "Sudah kembali",
    drawer_desc_label: "Deskripsi & Ciri Khas",
    drawer_no_desc: "Tidak ada deskripsi tambahan.",
    drawer_loc_label: "Lokasi",
    drawer_date_label: "Tanggal",
    drawer_reporter_label: "Dilaporkan oleh",
    btn_close: "Tutup",
    btn_claim: "Ajukan klaim",
    btn_takedown: "Turunkan laporan",
    btn_delete_report: "Hapus laporan",
    confirm_delete_item: "Yakin ingin menghapus laporan barang ini?",
    toast_item_deleted: "Laporan berhasil dihapus",
    claim_modal_title: "Ajukan Klaim Barang",
    claim_modal_sub: "Anda mengajukan klaim untuk:",
    claim_traits_label: "Sebutkan ciri khas barang milik Anda *",
    claim_traits_ph:
      "Jelaskan secara spesifik detail yang hanya diketahui pemilik (misal: stiker, nomor seri, isi di dalam, goresan tertentu)...",
    claim_pickup_date_label: "Rencana tanggal ambil *",
    claim_pickup_time_label: "Rencana jam ambil *",
    claim_proof_file_label: "File bukti pendukung (opsional)",
    claim_proof_file_hint: "Foto atau PDF (disimpan otomatis ke folder public/claims).",
    btn_remove_file: "Hapus file",
    btn_view_proof_file: "Lihat file bukti",
    toast_file_err: "Gagal memproses file bukti",
    claim_pickup_info: "Rencana pengambilan:",
    claim_pickup_loc_info: "Lokasi pengambilan (Pos Satpam):",
    btn_view_more: "Lihat selengkapnya",
    notif_approved_banner:
      "Klaim Anda telah disetujui admin! Buka tab Klaim Saya untuk melihat lokasi Pos Satpam pengambilan.",
    btn_open_my_claims: "Buka Klaim Saya",
    claim_detail_title: "Detail Pengambilan Barang",
    claim_pickup_ready: "Disetujui — Siap Diambil",
    claim_no_loc: "Pusat Pos Satpam Telkom University (Gerbang Utama)",
    toast_published_found:
      "Laporan dipublikasikan! Harap segera bawa barang temuan ke Pusat Pos Satpam Telkom University (Gerbang Utama).",
    form_found_notice:
      "Barang temuan wajib segera diserahkan ke Pusat Pos Satpam Telkom University (Gerbang Utama) setelah laporan dipublikasikan.",
    found_success_title: "Laporan Berhasil Dipublikasikan",
    found_success_sub: "Terima kasih telah melaporkan barang temuan di kampus.",
    found_success_loc_label: "Arahan Penyetoran Barang:",
    found_success_loc_val:
      "Harap segera bawa dan serahkan barang temuan ini ke Pusat Pos Satpam Telkom University (Gerbang Utama).",
    btn_understood: "Saya Mengerti",
    approve_modal_title: "Setujui Klaim & Lokasi Pengambilan",
    approve_modal_sub:
      "Masukkan deskripsi pos satpam tempat mahasiswa dapat mengambil barang:",
    approve_loc_label: "Deskripsi Lokasi Pos Satpam *",
    approve_loc_ph:
      "Misal: Pos Satpam Gerbang Utama, temui petugas jaga dengan membawa KTM",
    btn_cancel: "Batal",
    btn_send_claim: "Kirim Klaim",
    toast_claim_sent: "Klaim berhasil diajukan! Menunggu verifikasi admin.",
    report_page_title: "Lapor Barang",
    report_page_sub:
      "Isi formulir laporan barang yang hilang atau kamu temukan di kampus.",
    report_type_label: "Jenis laporan",
    report_name_label: "Nama barang",
    report_name_req: "Nama barang *",
    report_name_ph: "Misal: Dompet Kulit Coklat, KTM a.n. Budi",
    report_cat_label: "Kategori",
    report_cat_req: "Kategori *",
    report_date_label: "Tanggal kejadian",
    report_date_req: "Tanggal kejadian *",
    report_loc_label: "Lokasi di kampus",
    report_loc_req: "Lokasi di kampus *",
    report_loc_ph: "Misal: Perpustakaan Lt. 2, Kantin Utama, Lapangan Basket",
    report_desc_label: "Deskripsi & Ciri khas",
    report_desc_ph:
      "Tuliskan warna, kondisi, ciri spesifik untuk memudahkan verifikasi",
    report_photo_label: "Foto barang (opsional)",
    report_photo_required_label: "Foto barang * (wajib untuk barang ditemukan)",
    report_photo_optional_label: "Foto barang (opsional untuk barang hilang)",
    toast_photo_required_found: "Foto barang wajib diunggah untuk laporan barang ditemukan",
    report_photo_hint:
      "Ukuran otomatis dioptimalkan (maks. 800px JPEG) sebelum dikirim.",
    report_photo_modal_hint:
      "Foto disimpan otomatis ke folder public/uploads dan dioptimalkan maks. 800px.",
    btn_remove_photo: "Hapus foto",
    btn_publish: "Publikasikan",
    toast_published: "Laporan berhasil dipublikasikan!",
    toast_photo_err: "Gagal memproses gambar",
    activity_title: "Aktivitas Saya",
    activity_sub:
      "Pantau laporan barang yang pernah kamu buat dan status klaimmu.",
    tab_my_reports: "Laporan Saya",
    tab_my_claims: "Klaim Saya",
    empty_my_reports: "Belum ada laporan yang Anda buat.",
    empty_my_reports_sub: "Lapor barang lewat tombol Lapor barang di Beranda.",
    empty_my_claims: "Belum ada klaim yang Anda ajukan.",
    btn_edit: "Ubah",
    btn_delete: "Hapus",
    claim_pending_label: "Menunggu verifikasi",
    claim_approved_label: "Disetujui (Barang Kembali)",
    claim_rejected_label: "Ditolak",
    claim_submitted_on: "Diajukan pada:",
    claim_traits_by_you: "Ciri khas yang kamu sebutkan:",
    btn_cancel_claim: "Batalkan klaim",
    confirm_cancel_claim: "Batalkan pengajuan klaim ini?",
    toast_claim_canceled: "Pengajuan klaim dibatalkan",
    edit_modal_title: "Ubah Laporan",
    btn_save_changes: "Simpan Perubahan",
    toast_item_updated: "Laporan berhasil diperbarui",
    admin_title: "Kontrol Admin",
    admin_sub:
      "Verifikasi klaim kepemilikan, moderasi laporan, dan kelola data pengguna kampus.",
    stat_pending_claims: "Klaim Menunggu",
    stat_total_items: "Total Laporan",
    stat_active_items: "Tersedia / Diklaim",
    stat_returned_items: "Barang Kembali",
    tab_admin_claims: "Verifikasi Klaim",
    tab_admin_items: "Semua Laporan",
    tab_admin_users: "Kelola Pengguna",
    claim_pending: "Menunggu",
    claim_approved: "Disetujui",
    claim_rejected: "Ditolak",
    empty_admin_claims: "Tidak ada klaim ditemukan.",
    th_item: "Barang",
    th_claimant: "Pengklaim",
    th_proof: "Bukti Ciri",
    th_pickup: "Jadwal Ambil",
    th_status: "Status",
    th_action: "Aksi",
    th_type: "Tipe",
    th_category: "Kategori",
    th_reporter: "Pelapor",
    th_dropoff: "Info Setor",
    th_name: "Nama",
    th_nim: "NIM",
    th_email: "Email",
    th_role: "Role",
    btn_approve: "Setujui",
    btn_reject: "Tolak",
    btn_takedown_short: "Turunkan",
    btn_set_dropoff: "Beri Info Setor",
    btn_edit_dropoff: "Ubah Info Setor",
    dropoff_modal_title: "Instruksi Penyetoran Barang",
    dropoff_modal_sub:
      "Tentukan pos satpam atau lokasi tempat pelapor harus menyetorkan barang:",
    dropoff_label: "Lokasi Pos Satpam / Instruksi Setor *",
    dropoff_ph:
      "Misal: Harap setorkan ke Pos Satpam Gerbang Utama paling lambat pukul 17.00",
    toast_dropoff_saved: "Instruksi setor barang berhasil dikirim ke pelapor!",
    item_dropoff_pill: "Info Setor dari Admin",
    btn_view_dropoff: "Lihat info setor",
    notif_dropoff_banner:
      "Admin telah mengirimkan instruksi tempat setor barang untuk laporan Anda!",
    btn_open_my_reports: "Buka Laporan Saya",
    label_done: "Selesai",
    confirm_approve: "Konfirmasi menyetujui klaim ini?",
    confirm_reject: "Konfirmasi menolak klaim ini?",
    toast_claim_approved: "Klaim disetujui",
    toast_claim_rejected: "Klaim ditolak",
    confirm_takedown: "Turunkan (hapus) laporan ini secara permanen?",
    toast_takedown_ok: "Laporan berhasil diturunkan",
    btn_add_user: "+ Tambah Pengguna",
    add_user_title: "Tambah Pengguna Baru",
    edit_user_title: "Ubah Pengguna",
    label_fullname: "Nama Lengkap *",
    label_campus_email: "Email Kampus *",
    label_role: "Peran (Role)",
    btn_save: "Simpan",
    btn_save_user: "Simpan Pengguna",
    toast_user_added: "Pengguna baru berhasil ditambahkan!",
    toast_user_updated: "Data pengguna diperbarui",
    confirm_delete_user:
      "Hapus pengguna ini beserta semua laporan dan klaim miliknya?",
    toast_user_deleted: "Pengguna berhasil dihapus",
    toast_welcome: "Selamat datang, {name}!",
    toast_logged_out: "Anda telah keluar",
    theme_dark_on: "Mode gelap aktif (klik untuk mode terang)",
    theme_light_on: "Mode terang aktif (klik untuk mode gelap)",
  },
  en: {
    login_hero_title: "Lost something on campus? Check here first.",
    login_hero_desc:
      "Post photos and locations of items you lost or found. Reports go live immediately, and owners can claim right away.",
    login_title: "Sign In",
    login_subtitle:
      "Use your campus email (@student.telkomuniversity.ac.id or @telkomuniversity.ac.id).",
    login_email_label: "Campus email",
    login_btn: "Sign In",
    login_demo_hint: "Demo mode, without Google Sign-In. Admin account:",
    nav_home: "Home",
    nav_activity: "My activity",
    nav_activity_short: "Activity",
    nav_admin: "Admin panel",
    nav_admin_short: "Admin",
    nav_logout: "Log out",
    role_student: "Student",
    role_admin: "Admin",
    greeting: "Hello, {name}",
    home_sub: "Lost and found items around campus.",
    btn_report_item: "Report item",
    search_placeholder: "Search item name or traits",
    all_categories: "All categories",
    filter_all: "All",
    filter_lost: "Lost",
    filter_found: "Found",
    items_count: "{n} items",
    items_loading: "Loading items...",
    items_failed: "Failed to load items.",
    empty_home_title: "No reports match your criteria.",
    empty_home_sub: "You can report an item using the Report item button.",
    type_found: "Found",
    type_lost: "Lost",
    status_open: "Available",
    status_claimed: "Claimed",
    status_returned: "Returned",
    drawer_desc_label: "Description & Traits",
    drawer_no_desc: "No additional description.",
    drawer_loc_label: "Location",
    drawer_date_label: "Date",
    drawer_reporter_label: "Reported by",
    btn_close: "Close",
    btn_claim: "Submit claim",
    btn_takedown: "Remove report",
    btn_delete_report: "Delete report",
    confirm_delete_item: "Are you sure you want to delete this item report?",
    toast_item_deleted: "Report deleted successfully",
    claim_modal_title: "Submit Item Claim",
    claim_modal_sub: "You are submitting a claim for:",
    claim_traits_label: "Describe specific traits of your item *",
    claim_traits_ph:
      "Describe details only the owner would know (e.g., stickers, serial number, contents, scratches)...",
    claim_pickup_date_label: "Preferred pickup date *",
    claim_pickup_time_label: "Preferred pickup time *",
    claim_proof_file_label: "Supporting proof file (optional)",
    claim_proof_file_hint: "Image or PDF (automatically saved to public/claims).",
    btn_remove_file: "Remove file",
    btn_view_proof_file: "View proof file",
    toast_file_err: "Failed to process proof file",
    claim_pickup_info: "Pickup schedule:",
    claim_pickup_loc_info: "Pickup location (Security Post):",
    btn_view_more: "View details",
    notif_approved_banner:
      "Your claim has been approved by admin! Open My Claims tab to see the Security Post pickup location.",
    btn_open_my_claims: "Open My Claims",
    claim_detail_title: "Item Pickup Details",
    claim_pickup_ready: "Approved — Ready for Pickup",
    claim_no_loc: "Telkom University Central Security Post (Main Gate)",
    toast_published_found:
      "Report published! Please bring the found item to the Telkom University Central Security Post (Main Gate).",
    form_found_notice:
      "Found items must be handed over to the Telkom University Central Security Post (Main Gate) after publishing.",
    found_success_title: "Report Published Successfully",
    found_success_sub: "Thank you for reporting a found item on campus.",
    found_success_loc_label: "Item Drop-off Instruction:",
    found_success_loc_val:
      "Please bring and hand over this found item to the Telkom University Central Security Post (Main Gate).",
    btn_understood: "Got It",
    approve_modal_title: "Approve Claim & Pickup Location",
    approve_modal_sub:
      "Enter the security post location where the student can pick up the item:",
    approve_loc_label: "Security Post Location Description *",
    approve_loc_ph:
      "e.g., Main Gate Security Post, meet the guard on duty and bring your Student ID",
    btn_cancel: "Cancel",
    btn_send_claim: "Submit Claim",
    toast_claim_sent: "Claim submitted! Waiting for admin verification.",
    report_page_title: "Report Item",
    report_page_sub:
      "Fill out the form to report an item you lost or found on campus.",
    report_type_label: "Report type",
    report_name_label: "Item name",
    report_name_req: "Item name *",
    report_name_ph: "e.g., Brown Leather Wallet, Student ID Card",
    report_cat_label: "Category",
    report_cat_req: "Category *",
    report_date_label: "Incident date",
    report_date_req: "Incident date *",
    report_loc_label: "Campus location",
    report_loc_ph: "e.g., Library 2nd Floor, Main Canteen, Basketball Court",
    report_loc_req: "Campus location *",
    report_desc_label: "Description & Traits",
    report_desc_ph:
      "Write color, condition, or specific traits to help verification",
    report_photo_label: "Item photo (optional)",
    report_photo_required_label: "Item photo * (required for found items)",
    report_photo_optional_label: "Item photo (optional for lost items)",
    toast_photo_required_found: "Item photo is required when reporting a found item",
    report_photo_hint:
      "Automatically optimized (max 800px JPEG) before sending.",
    report_photo_modal_hint:
      "Photo is automatically saved to public/uploads and optimized up to 800px.",
    btn_remove_photo: "Remove photo",
    btn_publish: "Publish",
    toast_published: "Report published successfully!",
    toast_photo_err: "Failed to process image",
    activity_title: "My Activity",
    activity_sub: "Track item reports you created and the status of your claims.",
    tab_my_reports: "My Reports",
    tab_my_claims: "My Claims",
    empty_my_reports: "You have not created any reports yet.",
    empty_my_reports_sub: "Report an item using the Report item button on Home.",
    empty_my_claims: "You have not submitted any claims yet.",
    btn_edit: "Edit",
    btn_delete: "Delete",
    claim_pending_label: "Pending verification",
    claim_approved_label: "Approved (Returned)",
    claim_rejected_label: "Rejected",
    claim_submitted_on: "Submitted on:",
    claim_traits_by_you: "Traits you described:",
    btn_cancel_claim: "Cancel claim",
    confirm_cancel_claim: "Cancel this claim submission?",
    toast_claim_canceled: "Claim canceled",
    edit_modal_title: "Edit Report",
    btn_save_changes: "Save Changes",
    toast_item_updated: "Report updated successfully",
    admin_title: "Admin Panel",
    admin_sub:
      "Verify ownership claims, moderate reports, and manage campus users.",
    stat_pending_claims: "Pending Claims",
    stat_total_items: "Total Reports",
    stat_active_items: "Open / Claimed",
    stat_returned_items: "Returned Items",
    tab_admin_claims: "Verify Claims",
    tab_admin_items: "All Reports",
    tab_admin_users: "Manage Users",
    claim_pending: "Pending",
    claim_approved: "Approved",
    claim_rejected: "Rejected",
    empty_admin_claims: "No claims found.",
    th_item: "Item",
    th_claimant: "Claimant",
    th_proof: "Proof / Traits",
    th_pickup: "Pickup Schedule",
    th_status: "Status",
    th_action: "Action",
    th_type: "Type",
    th_category: "Category",
    th_reporter: "Reporter",
    th_dropoff: "Drop-off Info",
    th_name: "Name",
    th_nim: "Student ID",
    th_email: "Email",
    th_role: "Role",
    btn_approve: "Approve",
    btn_reject: "Reject",
    btn_takedown_short: "Remove",
    btn_set_dropoff: "Set Drop-off",
    btn_edit_dropoff: "Edit Drop-off",
    dropoff_modal_title: "Item Drop-off Instruction",
    dropoff_modal_sub:
      "Specify the security post or location where the reporter must drop off the item:",
    dropoff_label: "Security Post Location / Drop-off Instruction *",
    dropoff_ph:
      "e.g., Please drop off at the Main Gate Security Post before 5:00 PM",
    toast_dropoff_saved: "Drop-off instruction sent to the reporter!",
    item_dropoff_pill: "Drop-off Info from Admin",
    btn_view_dropoff: "View drop-off info",
    notif_dropoff_banner:
      "Admin has sent drop-off instructions for your reported item!",
    btn_open_my_reports: "Open My Reports",
    label_done: "Done",
    confirm_approve: "Confirm approving this claim?",
    confirm_reject: "Confirm rejecting this claim?",
    toast_claim_approved: "Claim approved",
    toast_claim_rejected: "Claim rejected",
    confirm_takedown: "Permanently remove this report?",
    toast_takedown_ok: "Report removed",
    btn_add_user: "+ Add User",
    add_user_title: "Add New User",
    edit_user_title: "Edit User",
    label_fullname: "Full Name *",
    label_campus_email: "Campus Email *",
    label_role: "Role",
    btn_save: "Save",
    btn_save_user: "Save User",
    toast_user_added: "New user added successfully!",
    toast_user_updated: "User data updated",
    confirm_delete_user:
      "Delete this user along with all their reports and claims?",
    toast_user_deleted: "User deleted successfully",
    toast_welcome: "Welcome, {name}!",
    toast_logged_out: "You have logged out",
    theme_dark_on: "Dark mode on (click for light mode)",
    theme_light_on: "Light mode on (click for dark mode)",
  },
};

const CAT_EN = {
  Elektronik: "Electronics",
  "Kartu/Dokumen": "ID Card / Documents",
  "Dompet/Tas": "Wallet / Bag",
  Kunci: "Keys",
  Pakaian: "Clothing",
  Lainnya: "Other",
};

function getCurrentLang() {
  return document.documentElement.getAttribute("lang") === "en" ? "en" : "id";
}

function t(key, vars = {}) {
  const lang = getCurrentLang();
  let str = (I18N[lang] && I18N[lang][key]) || I18N.id[key] || key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(`{${k}}`, v);
  }
  return str;
}

function tCat(cat) {
  return getCurrentLang() === "en" ? CAT_EN[cat] || cat : cat;
}

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
    return d.toLocaleDateString(getCurrentLang() === "en" ? "en-US" : "id-ID", {
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

function openDrawer(contentHtml) {
  const backdrop = $("#drawer-backdrop");
  const content = $("#drawer-content");
  content.innerHTML = contentHtml;
  backdrop.hidden = false;
}

function closeDrawer() {
  const backdrop = $("#drawer-backdrop");
  backdrop.hidden = true;
  currentDrawerItemId = null;
  $("#drawer-content").innerHTML = "";
}

window.addEventListener("click", (e) => {
  if (e.target.id === "modal-container") {
    closeModal();
  } else if (e.target.id === "drawer-backdrop") {
    closeDrawer();
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!$("#modal-container").hidden) closeModal();
    else if (!$("#drawer-backdrop").hidden) closeDrawer();
  }
});

function getAvatarBgColor(letter) {
  const colors = [
    "#1e293b",
    "#1e3a5f",
    "#3b1d28",
    "#1e3350",
    "#2d2036",
    "#1a332a",
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

function updateUserUI() {
  if (!currentUser) return;
  $("#user-display-name").textContent = currentUser.nama;
  $("#user-display-role").textContent =
    currentUser.role === "admin" ? t("role_admin") : t("role_student");

  const firstName = currentUser.nama.split(" ")[0];
  $("#greeting-heading").textContent = t("greeting", { name: firstName });
}

function showAppLayout() {
  $("#login-page").hidden = true;
  $("#app").hidden = false;

  updateUserUI();

  const isAdmin = currentUser.role === "admin";
  $$(".admin-only").forEach((el) => {
    el.hidden = !isAdmin;
  });

  refreshActivityNotifications();
  handleRouting();
}

function logout() {
  currentUser = null;
  localStorage.removeItem("lf_user");
  window.location.hash = "";
  showLoginPage();
  showToast(t("toast_logged_out"));
}

// ---------------------------------------------------------------- routing (hash)
function getActivePage() {
  const hash = window.location.hash.replace("#", "") || "beranda";
  return ["beranda", "lapor", "aktivitas", "admin"].includes(hash)
    ? hash
    : "beranda";
}

function handleRouting() {
  if (!currentUser) {
    showLoginPage();
    return;
  }

  const targetPage = getActivePage();

  if (targetPage === "admin" && currentUser.role !== "admin") {
    window.location.hash = "beranda";
    return;
  }

  $$(".nav-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.page === targetPage);
  });
  $$(".mob-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.page === targetPage);
  });

  $$(".page-section").forEach((sec) => {
    sec.hidden = sec.id !== `page-${targetPage}`;
  });

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
    $("#items-count").textContent = t("items_loading");
    const items = await api.listItems(activeFilters);
    currentItems = items;
    renderItemsList(items);
  } catch (err) {
    showToast(err.message, true);
    $("#items-count").textContent = t("items_failed");
  }
}

function renderItemsList(items) {
  const container = $("#items-container");
  $("#items-count").textContent = t("items_count", { n: items.length });

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>${escapeHtml(t("empty_home_title"))}</p>
        <p class="mt-1" style="color: var(--text-dim); font-size: 0.85rem;">
          ${escapeHtml(t("empty_home_sub"))}
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = items
    .map((item) => {
      const firstLetter = (item.judul || "?").charAt(0).toUpperCase();
      const bgColor = getAvatarBgColor(item.judul);

      let statusLabel = t("status_open");
      let statusClass = "status-open";
      if (item.status === "claimed" || item.status === "diklaim") {
        statusLabel = t("status_claimed");
        statusClass = "status-claimed";
      } else if (item.status === "returned" || item.status === "dikembalikan") {
        statusLabel = t("status_returned");
        statusClass = "status-returned";
      }

      const isFound = item.tipe === "found" || item.tipe === "ditemukan";
      const typeLabel = isFound ? t("type_found") : t("type_lost");
      const typeClass = isFound ? "found" : "lost";

      const thumbHtml = item.url_foto
        ? `<img src="${escapeHtml(item.url_foto)}" alt="${escapeHtml(item.judul)}">`
        : `<span>${firstLetter}</span>`;

      return `
        <article class="item-row" data-id="${item.id}" tabindex="0" role="button" aria-label="${escapeHtml(item.judul)}">
          <div class="item-thumb" style="background-color: ${bgColor};">
            ${thumbHtml}
          </div>
          <div class="item-body">
            <h2 class="item-title">${escapeHtml(item.judul)}</h2>
            <p class="item-desc">${escapeHtml(item.deskripsi || t("drawer_no_desc"))}</p>
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

// ---------------------------------------------------------------- detail item (Right Drawer) & klaim modal
async function showItemDetail(itemId) {
  try {
    const item = await api.getItem(itemId);
    currentDrawerItemId = itemId;
    const isOwner = currentUser && item.id_pelapor === currentUser.id;
    const isAdmin = currentUser && currentUser.role === "admin";
    const canClaim =
      currentUser &&
      !isOwner &&
      item.status !== "returned" &&
      item.status !== "dikembalikan";

    const isFound = item.tipe === "found" || item.tipe === "ditemukan";
    const typeLabel = isFound ? t("type_found") : t("type_lost");
    const typeClass = isFound ? "found" : "lost";

    let statusLabel = t("status_open");
    let statusClass = "status-open";
    if (item.status === "claimed" || item.status === "diklaim") {
      statusLabel = t("status_claimed");
      statusClass = "status-claimed";
    } else if (item.status === "returned" || item.status === "dikembalikan") {
      statusLabel = t("status_returned");
      statusClass = "status-returned";
    }

    const firstLetter = (item.judul || "?").charAt(0).toUpperCase();
    const bgColor = getAvatarBgColor(item.judul);

    const photoHtml = item.url_foto
      ? `<div class="drawer-photo-wrap">
           <img src="${escapeHtml(item.url_foto)}" alt="${escapeHtml(item.judul)}">
         </div>`
      : `<div class="drawer-photo-wrap">
           <div class="drawer-photo-placeholder" style="background-color: ${bgColor};">${firstLetter}</div>
         </div>`;

    let actionButtons = "";
    if (canClaim) {
      actionButtons += `
        <button type="button" class="btn btn-primary" id="btn-open-claim" data-id="${item.id}">
          ${escapeHtml(t("btn_claim"))}
        </button>
      `;
    }
    if (isOwner || isAdmin) {
      actionButtons += `
        <button type="button" class="btn btn-danger btn-sm" id="btn-delete-item" data-id="${item.id}">
          ${escapeHtml(isAdmin ? t("btn_takedown") : t("btn_delete_report"))}
        </button>
      `;
    }

    const drawerHtml = `
      <div class="drawer-header">
        <h2 class="drawer-title">${escapeHtml(item.judul)}</h2>
        <button type="button" class="modal-close" onclick="closeDrawer()" aria-label="${escapeHtml(t("btn_close"))}">&times;</button>
      </div>

      ${photoHtml}

      <div class="drawer-badges">
        <span class="badge-type ${typeClass}">${typeLabel}</span>
        <div class="status-indicator ${statusClass}">
          <span class="status-dot"></span>
          <span>${statusLabel}</span>
        </div>
        <span class="drawer-category">${escapeHtml(tCat(item.kategori))}</span>
      </div>

      <div class="drawer-meta-list">
        <div class="drawer-meta-row">
          <span class="drawer-meta-label">${escapeHtml(t("drawer_desc_label"))}</span>
          <span class="drawer-meta-value">${escapeHtml(item.deskripsi || t("drawer_no_desc"))}</span>
        </div>
        <div class="drawer-meta-row">
          <span class="drawer-meta-label">${escapeHtml(t("drawer_loc_label"))}</span>
          <span class="drawer-meta-value">${escapeHtml(item.lokasi)}</span>
        </div>
        <div class="drawer-meta-row">
          <span class="drawer-meta-label">${escapeHtml(t("drawer_date_label"))}</span>
          <span class="drawer-meta-value">${formatDate(item.tanggal)}</span>
        </div>
        ${item.pelapor
        ? `<div class="drawer-meta-row">
                 <span class="drawer-meta-label">${escapeHtml(t("drawer_reporter_label"))}</span>
                 <span class="drawer-meta-value">${escapeHtml(item.pelapor.nama)} (${escapeHtml(item.pelapor.nim || "-")})</span>
               </div>`
        : ""
      }
      </div>

      <div class="drawer-actions">
        <button type="button" class="btn btn-secondary" onclick="closeDrawer()">${escapeHtml(t("btn_close"))}</button>
        ${actionButtons}
      </div>
    `;

    openDrawer(drawerHtml);

    const claimBtn = $("#btn-open-claim");
    if (claimBtn) {
      claimBtn.addEventListener("click", () => {
        closeDrawer();
        openClaimForm(item);
      });
    }

    const deleteBtn = $("#btn-delete-item");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        if (!confirm(t("confirm_delete_item"))) return;
        try {
          await api.deleteItem(item.id);
          showToast(t("toast_item_deleted"));
          closeDrawer();
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

function openClaimForm(item) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const modalHtml = `
    <div class="modal-header">
      <h2 class="modal-title">${escapeHtml(t("claim_modal_title"))}</h2>
      <button type="button" class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.25rem;">
      ${escapeHtml(t("claim_modal_sub"))} <strong>${escapeHtml(item.judul)}</strong> (${escapeHtml(item.lokasi)})
    </p>
    <form id="claim-submit-form">
      <div class="form-group">
        <label for="claim-ciri">${escapeHtml(t("claim_traits_label"))}</label>
        <textarea id="claim-ciri" name="bukti_ciri" rows="4" required
          placeholder="${escapeHtml(t("claim_traits_ph"))}"></textarea>
      </div>
      <div class="form-row">
        <div class="form-group flex-1">
          <label for="claim-tanggal-ambil">${escapeHtml(t("claim_pickup_date_label"))}</label>
          <input type="date" id="claim-tanggal-ambil" name="tanggal_ambil" value="${todayStr}" required>
        </div>
        <div class="form-group flex-1">
          <label for="claim-jam-ambil">${escapeHtml(t("claim_pickup_time_label"))}</label>
          <input type="time" id="claim-jam-ambil" name="jam_ambil" value="10:00" required>
        </div>
      </div>
      <div class="form-group">
        <label for="claim-proof-file">${escapeHtml(t("claim_proof_file_label"))}</label>
        <div class="photo-upload-area">
          <input type="file" id="claim-proof-file" accept="image/*,.pdf">
          <div class="photo-hint">${escapeHtml(t("claim_proof_file_hint"))}</div>
          <div id="claim-file-preview-wrap" class="photo-preview-wrap" hidden>
            <img id="claim-file-preview-img" src="" alt="Preview" hidden>
            <span id="claim-file-preview-name" style="font-size: 0.85rem; font-weight: 600;" hidden></span>
            <button type="button" id="claim-btn-remove-file" class="btn btn-secondary btn-sm">${escapeHtml(t("btn_remove_file"))}</button>
          </div>
        </div>
        <input type="hidden" id="claim-bukti-file" value="">
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">${escapeHtml(t("btn_cancel"))}</button>
        <button type="submit" class="btn btn-primary">${escapeHtml(t("btn_send_claim"))}</button>
      </div>
    </form>
  `;

  openModal(modalHtml);

  const fileInput = $("#claim-proof-file");
  const previewWrap = $("#claim-file-preview-wrap");
  const previewImg = $("#claim-file-preview-img");
  const previewName = $("#claim-file-preview-name");
  const hiddenFileInput = $("#claim-bukti-file");
  const removeFileBtn = $("#claim-btn-remove-file");

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (file.type.startsWith("image/")) {
        const base64Data = await compressAndConvertImage(file);
        hiddenFileInput.value = base64Data;
        previewImg.src = base64Data;
        previewImg.hidden = false;
        previewName.hidden = true;
        previewWrap.hidden = false;
      } else {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        hiddenFileInput.value = dataUrl;
        previewImg.hidden = true;
        previewName.textContent = file.name;
        previewName.hidden = false;
        previewWrap.hidden = false;
      }
    } catch (err) {
      showToast(t("toast_file_err"), true);
    }
  });

  removeFileBtn.addEventListener("click", () => {
    fileInput.value = "";
    hiddenFileInput.value = "";
    previewImg.src = "";
    previewImg.hidden = true;
    previewName.textContent = "";
    previewName.hidden = true;
    previewWrap.hidden = true;
  });

  $("#claim-submit-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const ciri = $("#claim-ciri").value.trim();
    const tanggalAmbil = $("#claim-tanggal-ambil").value;
    const jamAmbil = $("#claim-jam-ambil").value;
    const buktiFile = hiddenFileInput.value;
    if (!ciri) return;

    try {
      await api.createClaim({
        id_barang: item.id,
        id_pengklaim: currentUser.id,
        bukti_ciri: ciri,
        tanggal_ambil: tanggalAmbil,
        jam_ambil: jamAmbil,
        bukti_file: buktiFile,
      });
      showToast(t("toast_claim_sent"));
      closeModal();
      loadItems();
    } catch (err) {
      showToast(err.message, true);
    }
  });
}

// ---------------------------------------------------------------- modal lapor barang cepat
function openReportModal() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const catOptions = availableCategories
    .map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(tCat(c))}</option>`)
    .join("");

  const modalHtml = `
    <div class="modal-header">
      <h2 class="modal-title">${escapeHtml(t("btn_report_item"))}</h2>
      <button type="button" class="modal-close" onclick="closeModal()" aria-label="${escapeHtml(t("btn_close"))}">&times;</button>
    </div>
    <form id="modal-report-form">
      <div class="form-group">
        <label>${escapeHtml(t("report_type_label"))}</label>
        <div class="segmented-control w-full" id="modal-tipe-segmented">
          <button type="button" class="seg-btn active" data-val="found">${escapeHtml(t("filter_found"))}</button>
          <button type="button" class="seg-btn" data-val="lost">${escapeHtml(t("filter_lost"))}</button>
        </div>
        <input type="hidden" id="modal-report-tipe" value="found">
      </div>

      <div class="form-group">
        <label for="modal-report-judul">${escapeHtml(t("report_name_req"))}</label>
        <input type="text" id="modal-report-judul" required placeholder="${escapeHtml(t("report_name_ph"))}">
      </div>

      <div class="form-row">
        <div class="form-group flex-1">
          <label for="modal-report-kategori">${escapeHtml(t("report_cat_req"))}</label>
          <select id="modal-report-kategori" required>${catOptions}</select>
        </div>
        <div class="form-group flex-1">
          <label for="modal-report-tanggal">${escapeHtml(t("report_date_req"))}</label>
          <input type="date" id="modal-report-tanggal" value="${todayStr}" required>
        </div>
      </div>

      <div class="form-group">
        <label for="modal-report-lokasi">${escapeHtml(t("report_loc_req"))}</label>
        <input type="text" id="modal-report-lokasi" required placeholder="${escapeHtml(t("report_loc_ph"))}">
      </div>

      <div class="form-group">
        <label for="modal-report-deskripsi">${escapeHtml(t("report_desc_label"))}</label>
        <textarea id="modal-report-deskripsi" rows="3" placeholder="${escapeHtml(t("report_desc_ph"))}"></textarea>
      </div>

      <div class="form-group">
        <label for="modal-photo-input" id="modal-photo-label">${escapeHtml(t("report_photo_required_label"))}</label>
        <div class="photo-upload-area">
          <input type="file" id="modal-photo-input" accept="image/*">
          <div class="photo-hint">${escapeHtml(t("report_photo_modal_hint"))}</div>
          <div id="modal-photo-preview-wrap" class="photo-preview-wrap" hidden>
            <img id="modal-photo-preview-img" src="" alt="Preview">
            <button type="button" id="modal-btn-remove-photo" class="btn btn-secondary btn-sm">${escapeHtml(t("btn_remove_photo"))}</button>
          </div>
        </div>
        <input type="hidden" id="modal-report-url-foto" value="">
      </div>

      <div id="modal-found-notice" class="pickup-highlight-box" style="margin-top: 0.75rem; margin-bottom: 0; font-size: 0.85rem;">
        ${escapeHtml(t("form_found_notice"))}
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.25rem;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">${escapeHtml(t("btn_cancel"))}</button>
        <button type="submit" class="btn btn-primary">${escapeHtml(t("btn_publish"))}</button>
      </div>
    </form>
  `;

  openModal(modalHtml);

  const seg = $("#modal-tipe-segmented");
  seg.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      seg.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      $("#modal-report-tipe").value = btn.dataset.val;
      const photoLbl = $("#modal-photo-label");
      if (photoLbl) {
        photoLbl.textContent =
          btn.dataset.val === "found"
            ? t("report_photo_required_label")
            : t("report_photo_optional_label");
      }
      const foundNotice = $("#modal-found-notice");
      if (foundNotice) {
        foundNotice.hidden = btn.dataset.val !== "found";
      }
    });
  });

  const photoInput = $("#modal-photo-input");
  const previewWrap = $("#modal-photo-preview-wrap");
  const previewImg = $("#modal-photo-preview-img");
  const urlFotoInput = $("#modal-report-url-foto");
  const removeBtn = $("#modal-btn-remove-photo");

  photoInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64Data = await compressAndConvertImage(file);
      urlFotoInput.value = base64Data;
      previewImg.src = base64Data;
      previewWrap.hidden = false;
    } catch (err) {
      showToast(t("toast_photo_err"), true);
    }
  });

  removeBtn.addEventListener("click", () => {
    photoInput.value = "";
    urlFotoInput.value = "";
    previewImg.src = "";
    previewWrap.hidden = true;
  });

  $("#modal-report-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const tipeVal = $("#modal-report-tipe").value;
    if (tipeVal === "found" && !urlFotoInput.value) {
      showToast(t("toast_photo_required_found"), true);
      return;
    }

    const payload = {
      tipe: tipeVal,
      judul: $("#modal-report-judul").value.trim(),
      kategori: $("#modal-report-kategori").value,
      tanggal: $("#modal-report-tanggal").value,
      lokasi: $("#modal-report-lokasi").value.trim(),
      deskripsi: $("#modal-report-deskripsi").value.trim(),
      url_foto: urlFotoInput.value,
      id_pelapor: currentUser.id,
    };

    try {
      const created = await api.createItem(payload);
      closeModal();
      loadItems();
      refreshActivityNotifications();
      if (tipeVal === "found") {
        openFoundSuccessModal(created);
      } else {
        showToast(t("toast_published"));
      }
    } catch (err) {
      showToast(err.message, true);
    }
  });
}

function openFoundSuccessModal(item) {
  const modalHtml = `
    <div class="modal-header">
      <h2 class="modal-title">${escapeHtml(t("found_success_title"))}</h2>
      <button type="button" class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <p style="font-size: 0.92rem; color: var(--text-muted); margin-bottom: 1rem;">
      ${escapeHtml(t("found_success_sub"))} <strong>(${escapeHtml(item ? item.judul : "")})</strong>
    </p>
    <div class="pickup-highlight-box">
      <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-green); margin-bottom: 0.3rem;">
        ${escapeHtml(t("found_success_loc_label"))}
      </div>
      <div style="font-size: 0.95rem; font-weight: 600; color: var(--text-strong); line-height: 1.5;">
        ${escapeHtml(t("found_success_loc_val"))}
      </div>
    </div>
    <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
      <button type="button" class="btn btn-primary" onclick="closeModal()">${escapeHtml(t("btn_understood"))}</button>
    </div>
  `;
  openModal(modalHtml);
}

// ---------------------------------------------------------------- lapor barang form (halaman #lapor)
function populateCategorySelects() {
  const catFilter = $("#kategori-filter");
  if (catFilter) {
    const prevVal = catFilter.value;
    catFilter.innerHTML = `<option value="">${escapeHtml(t("all_categories"))}</option>`;
    availableCategories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = tCat(cat);
      catFilter.appendChild(opt);
    });
    catFilter.value = prevVal;
  }

  const reportSelect = $("#report-kategori");
  if (reportSelect) {
    const prevRep = reportSelect.value;
    reportSelect.innerHTML = availableCategories
      .map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(tCat(c))}</option>`)
      .join("");
    if (prevRep) reportSelect.value = prevRep;
  }
}

async function initReportForm() {
  populateCategorySelects();
  $("#report-tanggal").value = new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------- notifikasi aktivitas saya
function getSeenClaimIds() {
  if (!currentUser) return [];
  try {
    return JSON.parse(localStorage.getItem(`lf_seen_claims_${currentUser.id}`) || "[]");
  } catch (e) {
    return [];
  }
}

function getSeenDropoffIds() {
  if (!currentUser) return [];
  try {
    return JSON.parse(localStorage.getItem(`lf_seen_dropoffs_${currentUser.id}`) || "[]");
  } catch (e) {
    return [];
  }
}

function markClaimSeen(claimId) {
  if (!currentUser) return;
  const seen = getSeenClaimIds();
  if (!seen.includes(claimId)) {
    seen.push(claimId);
    localStorage.setItem(`lf_seen_claims_${currentUser.id}`, JSON.stringify(seen));
  }
  updateNotifBadges(currentMyClaims, currentMyItems);
}

function markDropoffSeen(itemId) {
  if (!currentUser) return;
  const seen = getSeenDropoffIds();
  if (!seen.includes(itemId)) {
    seen.push(itemId);
    localStorage.setItem(`lf_seen_dropoffs_${currentUser.id}`, JSON.stringify(seen));
  }
  updateNotifBadges(currentMyClaims, currentMyItems);
}

function updateNotifBadges(claims, items = []) {
  const seenClaims = getSeenClaimIds();
  const approvedClaims = (claims || []).filter(
    (c) => c.status === "approved" || c.status === "disetujui"
  );
  const unreadClaims = approvedClaims.filter((c) => !seenClaims.includes(c.id)).length;

  const seenDropoffs = getSeenDropoffIds();
  const dropoffItems = (items || []).filter(
    (i) => i.lokasi_setor && i.lokasi_setor.trim() !== ""
  );
  const unreadDropoffs = dropoffItems.filter((i) => !seenDropoffs.includes(i.id)).length;

  const totalUnread = unreadClaims + unreadDropoffs;

  $$(".activity-notif-badge").forEach((badge) => {
    badge.textContent = totalUnread;
    badge.hidden = totalUnread === 0;
  });

  const banner = $("#activity-notif-banner");
  if (banner) {
    if (unreadClaims > 0 || unreadDropoffs > 0) {
      banner.hidden = false;
      const msg =
        unreadDropoffs > 0 && unreadClaims === 0
          ? t("notif_dropoff_banner")
          : t("notif_approved_banner");
      const btnText =
        unreadDropoffs > 0 && unreadClaims === 0
          ? t("btn_open_my_reports")
          : t("btn_open_my_claims");
      const targetTab =
        unreadDropoffs > 0 && unreadClaims === 0 ? "my-items" : "my-claims";

      banner.innerHTML = `
        <span><strong>${escapeHtml(msg)}</strong></span>
        <button type="button" class="btn btn-primary btn-sm" id="btn-jump-notif">${escapeHtml(btnText)}</button>
      `;
      const jumpBtn = $("#btn-jump-notif");
      if (jumpBtn) {
        jumpBtn.addEventListener("click", () => {
          const tabBtn = $(`#page-aktivitas .subtab-btn[data-subtab="${targetTab}"]`);
          if (tabBtn) tabBtn.click();
        });
      }
    } else {
      banner.hidden = true;
      banner.innerHTML = "";
    }
  }
}

async function refreshActivityNotifications() {
  if (!currentUser) return;
  try {
    const act = await api.activity(currentUser.id);
    currentMyItems = act.laporan || [];
    currentMyClaims = act.klaim || [];
    updateNotifBadges(currentMyClaims, currentMyItems);
  } catch (e) {
    // Abaikan error background notification
  }
}

// ---------------------------------------------------------------- aktivitas saya
async function loadUserActivity() {
  if (!currentUser) return;
  try {
    const act = await api.activity(currentUser.id);
    currentMyItems = act.laporan || [];
    currentMyClaims = act.klaim || [];
    updateNotifBadges(currentMyClaims, currentMyItems);

    $("#my-items-count").textContent = act.laporan ? act.laporan.length : 0;
    const itemsContainer = $("#my-items-list");

    if (!act.laporan || act.laporan.length === 0) {
      itemsContainer.innerHTML = `
        <div class="empty-state">
          <p>${escapeHtml(t("empty_my_reports"))}</p>
          <p style="color: var(--text-dim); margin-top: 0.35rem;">
            ${escapeHtml(t("empty_my_reports_sub"))}
          </p>
        </div>
      `;
    } else {
      itemsContainer.innerHTML = act.laporan
        .map((item) => {
          let statusLabel = t("status_open");
          let statusClass = "status-open";
          if (item.status === "claimed" || item.status === "diklaim") {
            statusLabel = t("status_claimed");
            statusClass = "status-claimed";
          } else if (item.status === "returned" || item.status === "dikembalikan") {
            statusLabel = t("status_returned");
            statusClass = "status-returned";
          }

          const isFound = item.tipe === "found" || item.tipe === "ditemukan";
          const typeLabel = isFound ? t("type_found") : t("type_lost");
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
                <div style="margin-top: 0.4rem; display: flex; gap: 0.4rem; flex-wrap: wrap; justify-content: flex-end;">
                  ${
                    item.lokasi_setor
                      ? `<button type="button" class="btn btn-primary btn-sm" onclick="openDropoffDetailModal(${item.id})">${escapeHtml(t("btn_view_dropoff"))}</button>`
                      : ""
                  }
                  <button type="button" class="btn btn-secondary btn-sm" onclick="openEditItemModal(${item.id})">${escapeHtml(t("btn_edit"))}</button>
                  <button type="button" class="btn btn-danger btn-sm" onclick="deleteMyItem(${item.id})">${escapeHtml(t("btn_delete"))}</button>
                </div>
              </div>
            </div>
          `;
        })
        .join("");
    }

    $("#my-claims-count").textContent = act.klaim ? act.klaim.length : 0;
    const claimsContainer = $("#my-claims-list");

    if (!act.klaim || act.klaim.length === 0) {
      claimsContainer.innerHTML = `
        <div class="empty-state">
          <p>${escapeHtml(t("empty_my_claims"))}</p>
        </div>
      `;
    } else {
      claimsContainer.innerHTML = act.klaim
        .map((claim) => {
          const isApproved =
            claim.status === "approved" || claim.status === "disetujui";
          const isPending =
            claim.status === "pending" || claim.status === "menunggu";

          let stBadgeHtml = `<span style="font-size: 0.82rem; font-weight: 600; color: ${claim.status === "rejected" || claim.status === "ditolak"
            ? "var(--color-grey)"
            : "var(--color-yellow)"
            };">● ${escapeHtml(
              claim.status === "rejected" || claim.status === "ditolak"
                ? t("claim_rejected_label")
                : t("claim_pending_label")
            )}</span>`;

          if (isApproved) {
            stBadgeHtml = `<span class="claim-approved-pill">● ${escapeHtml(t("claim_approved_label"))}</span>`;
          }

          const barangJudul = claim.barang ? claim.barang.judul : "-";

          return `
            <div class="claim-card">
              <div class="claim-card-header">
                <div>
                  <div class="claim-card-title">${escapeHtml(barangJudul)}</div>
                  <div style="font-size: 0.78rem; color: var(--text-dim);">
                    ${escapeHtml(t("claim_submitted_on"))} ${formatDate(claim.tanggal_klaim)}
                  </div>
                </div>
                ${stBadgeHtml}
              </div>
              <div class="claim-card-desc">
                <strong>${escapeHtml(t("claim_traits_by_you"))}</strong><br>
                ${escapeHtml(claim.bukti_ciri)}
                ${claim.tanggal_ambil || claim.jam_ambil
              ? `<div style="margin-top: 0.45rem; font-size: 0.8rem; color: var(--text-dim);">
                         <strong>${escapeHtml(t("claim_pickup_info"))}</strong> ${claim.tanggal_ambil ? formatDate(claim.tanggal_ambil) : "-"} ${claim.jam_ambil ? `(${escapeHtml(claim.jam_ambil)})` : ""}
                       </div>`
              : ""
            }
                ${claim.bukti_file
              ? `<div style="margin-top: 0.35rem;">
                         <a href="${escapeHtml(claim.bukti_file)}" target="_blank" rel="noopener" style="color: var(--color-blue); font-size: 0.8rem; font-weight: 600; text-decoration: underline;">${escapeHtml(t("btn_view_proof_file"))}</a>
                       </div>`
              : ""
            }
              </div>
              <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
                ${isApproved
              ? `<button type="button" class="btn btn-primary btn-sm" onclick="openClaimDetailModal(${claim.id})">${escapeHtml(t("btn_view_more"))}</button>`
              : ""
            }
                ${isPending
              ? `<button type="button" class="btn btn-secondary btn-sm" onclick="cancelClaim(${claim.id})">${escapeHtml(t("btn_cancel_claim"))}</button>`
              : ""
            }
              </div>
            </div>
          `;
        })
        .join("");
    }
  } catch (err) {
    showToast(err.message, true);
  }
}

function openClaimDetailModal(claimId) {
  const claim = currentMyClaims.find((c) => c.id === claimId);
  if (!claim) return;

  markClaimSeen(claimId);

  const barangJudul = claim.barang ? claim.barang.judul : "-";
  const lokasiPos = claim.lokasi_ambil || t("claim_no_loc");

  const modalHtml = `
    <div class="modal-header">
      <h2 class="modal-title">${escapeHtml(t("claim_detail_title"))}</h2>
      <button type="button" class="modal-close" onclick="closeModal()">&times;</button>
    </div>

    <div style="margin-bottom: 1rem;">
      <div style="font-size: 1.05rem; font-weight: 700; color: var(--text-strong); margin-bottom: 0.35rem;">
        ${escapeHtml(barangJudul)}
      </div>
      <span class="claim-approved-pill">● ${escapeHtml(t("claim_pickup_ready"))}</span>
    </div>

    <div class="pickup-highlight-box">
      <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-green); margin-bottom: 0.25rem;">
        ${escapeHtml(t("claim_pickup_loc_info"))}
      </div>
      <div style="font-size: 0.95rem; font-weight: 600; color: var(--text-strong); line-height: 1.45;">
        ${escapeHtml(lokasiPos)}
      </div>
    </div>

    <div class="detail-box">
      <div style="font-size: 0.82rem; color: var(--text-dim); margin-bottom: 0.25rem;">
        ${escapeHtml(t("claim_pickup_info"))}
      </div>
      <div style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.75rem;">
        ${claim.tanggal_ambil ? formatDate(claim.tanggal_ambil) : "-"} ${claim.jam_ambil ? `(${escapeHtml(claim.jam_ambil)})` : ""}
      </div>
      <div style="font-size: 0.82rem; color: var(--text-dim); margin-bottom: 0.25rem;">
        ${escapeHtml(t("claim_traits_by_you"))}
      </div>
      <div style="font-size: 0.9rem;">
        ${escapeHtml(claim.bukti_ciri)}
      </div>
    </div>

    <div style="display: flex; justify-content: flex-end;">
      <button type="button" class="btn btn-primary" onclick="closeModal()">${escapeHtml(t("btn_close"))}</button>
    </div>
  `;

  openModal(modalHtml);
}

function openDropoffDetailModal(itemId) {
  const item = currentMyItems.find((i) => i.id === itemId);
  if (!item) return;

  markDropoffSeen(itemId);

  const modalHtml = `
    <div class="modal-header">
      <h2 class="modal-title">${escapeHtml(t("dropoff_modal_title"))}</h2>
      <button type="button" class="modal-close" onclick="closeModal()">&times;</button>
    </div>

    <div style="margin-bottom: 1rem;">
      <div style="font-size: 1.05rem; font-weight: 700; color: var(--text-strong); margin-bottom: 0.35rem;">
        ${escapeHtml(item.judul)}
      </div>
      <span class="claim-approved-pill">● ${escapeHtml(t("item_dropoff_pill"))}</span>
    </div>

    <div class="pickup-highlight-box">
      <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-green); margin-bottom: 0.25rem;">
        ${escapeHtml(t("dropoff_label").replace(" *", ""))}
      </div>
      <div style="font-size: 0.95rem; font-weight: 600; color: var(--text-strong); line-height: 1.45;">
        ${escapeHtml(item.lokasi_setor)}
      </div>
    </div>

    <div style="display: flex; justify-content: flex-end;">
      <button type="button" class="btn btn-primary" onclick="closeModal()">${escapeHtml(t("btn_close"))}</button>
    </div>
  `;

  openModal(modalHtml);
}

async function deleteMyItem(itemId) {
  if (!confirm(t("confirm_delete_item"))) return;
  try {
    await api.deleteItem(itemId);
    showToast(t("toast_item_deleted"));
    loadUserActivity();
  } catch (err) {
    showToast(err.message, true);
  }
}

async function cancelClaim(claimId) {
  if (!confirm(t("confirm_cancel_claim"))) return;
  try {
    await api.deleteClaim(claimId);
    showToast(t("toast_claim_canceled"));
    loadUserActivity();
  } catch (err) {
    showToast(err.message, true);
  }
}

async function openEditItemModal(itemId) {
  let item = currentItems.find((i) => i.id === itemId);
  if (!item) {
    try {
      item = await api.getItem(itemId);
    } catch (err) {
      showToast(err.message, true);
      return;
    }
  }

  const catOptions = availableCategories
    .map((c) => `<option value="${escapeHtml(c)}" ${item.kategori === c ? "selected" : ""}>${escapeHtml(tCat(c))}</option>`)
    .join("");
  const isLost = item.tipe === "lost" || item.tipe === "hilang";

  const modalHtml = `
    <div class="modal-header">
      <h2 class="modal-title">${escapeHtml(t("edit_modal_title"))}</h2>
      <button type="button" class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <form id="edit-item-form">
      <div class="form-group">
        <label>${escapeHtml(t("report_type_label"))}</label>
        <select id="edit-tipe">
          <option value="found" ${!isLost ? "selected" : ""}>${escapeHtml(t("filter_found"))}</option>
          <option value="lost" ${isLost ? "selected" : ""}>${escapeHtml(t("filter_lost"))}</option>
        </select>
      </div>
      <div class="form-group">
        <label>${escapeHtml(t("report_name_req"))}</label>
        <input type="text" id="edit-judul" value="${escapeHtml(item.judul)}" required>
      </div>
      <div class="form-row">
        <div class="form-group flex-1">
          <label>${escapeHtml(t("report_cat_label"))}</label>
          <select id="edit-kategori">${catOptions}</select>
        </div>
        <div class="form-group flex-1">
          <label>${escapeHtml(t("report_date_label"))}</label>
          <input type="date" id="edit-tanggal" value="${escapeHtml(item.tanggal || "")}" required>
        </div>
      </div>
      <div class="form-group">
        <label>${escapeHtml(t("report_loc_req"))}</label>
        <input type="text" id="edit-lokasi" value="${escapeHtml(item.lokasi)}" required>
      </div>
      <div class="form-group">
        <label>${escapeHtml(t("report_desc_label"))}</label>
        <textarea id="edit-deskripsi" rows="3">${escapeHtml(item.deskripsi || "")}</textarea>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">${escapeHtml(t("btn_cancel"))}</button>
        <button type="submit" class="btn btn-primary">${escapeHtml(t("btn_save_changes"))}</button>
      </div>
    </form>
  `;
  openModal(modalHtml);

  $("#edit-item-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await api.updateItem(item.id, {
        id_user: currentUser.id,
        tipe: $("#edit-tipe").value,
        judul: $("#edit-judul").value.trim(),
        kategori: $("#edit-kategori").value,
        tanggal: $("#edit-tanggal").value,
        lokasi: $("#edit-lokasi").value.trim(),
        deskripsi: $("#edit-deskripsi").value.trim(),
      });
      showToast(t("toast_item_updated"));
      closeModal();
      loadUserActivity();
      loadItems();
    } catch (err) {
      showToast(err.message, true);
    }
  });
}

// ---------------------------------------------------------------- kontrol admin
async function loadAdminStats() {
  const container = $("#admin-stats");
  if (!container) return;
  try {
    const [items, claims] = await Promise.all([api.listItems(), api.listClaims()]);
    const pendingClaims = claims.filter(
      (c) => c.status === "pending" || c.status === "menunggu"
    ).length;
    const totalItems = items.length;
    const returnedItems = items.filter(
      (i) => i.status === "returned" || i.status === "dikembalikan"
    ).length;
    const activeItems = totalItems - returnedItems;

    container.innerHTML = `
      <div class="stat-card">
        <span class="stat-value" style="color: var(--color-yellow);">${pendingClaims}</span>
        <span class="stat-label">${escapeHtml(t("stat_pending_claims"))}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${totalItems}</span>
        <span class="stat-label">${escapeHtml(t("stat_total_items"))}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value" style="color: var(--color-blue);">${activeItems}</span>
        <span class="stat-label">${escapeHtml(t("stat_active_items"))}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value" style="color: var(--color-green);">${returnedItems}</span>
        <span class="stat-label">${escapeHtml(t("stat_returned_items"))}</span>
      </div>
    `;
  } catch (e) {
    // Abaikan error statistik
  }
}

async function loadAdminData() {
  if (!currentUser || currentUser.role !== "admin") return;
  loadAdminStats();
  loadAdminClaims();
  loadAdminItems();
  loadAdminUsers();
}

async function loadAdminClaims(statusFilter = "") {
  try {
    const claims = await api.listClaims({ status: statusFilter });
    const container = $("#admin-claims-container");

    if (!claims || claims.length === 0) {
      container.innerHTML = `<div class="empty-state"><p>${escapeHtml(t("empty_admin_claims"))}</p></div>`;
      return;
    }

    container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>${escapeHtml(t("th_item"))}</th>
            <th>${escapeHtml(t("th_claimant"))}</th>
            <th>${escapeHtml(t("th_proof"))}</th>
            <th>${escapeHtml(t("th_pickup"))}</th>
            <th>${escapeHtml(t("th_status"))}</th>
            <th>${escapeHtml(t("th_action"))}</th>
          </tr>
        </thead>
        <tbody>
          ${claims
        .map((c) => {
          const isPending =
            c.status === "pending" || c.status === "menunggu";
          const bJudul = c.barang ? c.barang.judul : "-";
          const pNama = c.pengklaim ? `${c.pengklaim.nama} (${c.pengklaim.nim || "-"})` : "-";
          const pickupInfo = c.tanggal_ambil || c.jam_ambil || c.lokasi_ambil
            ? `${c.tanggal_ambil ? formatDate(c.tanggal_ambil) : "-"} ${c.jam_ambil ? `(${escapeHtml(c.jam_ambil)})` : ""}${c.lokasi_ambil
              ? `<br><small style="color: var(--color-green); font-weight: 600;">${escapeHtml(c.lokasi_ambil)}</small>`
              : ""
            }`
            : "-";

          let stText = t("claim_pending");
          let stColor = "var(--color-yellow)";
          if (c.status === "approved" || c.status === "disetujui") {
            stText = t("claim_approved");
            stColor = "var(--color-green)";
          } else if (c.status === "rejected" || c.status === "ditolak") {
            stText = t("claim_rejected");
            stColor = "var(--color-grey)";
          }

          const proofFileLink = c.bukti_file
            ? `<div style="margin-top: 0.35rem;"><a href="${escapeHtml(c.bukti_file)}" target="_blank" rel="noopener" style="color: var(--color-blue); font-size: 0.8rem; font-weight: 600; text-decoration: underline;">${escapeHtml(t("btn_view_proof_file"))}</a></div>`
            : "";

          return `
                <tr>
                  <td><strong>${escapeHtml(bJudul)}</strong></td>
                  <td>${escapeHtml(pNama)}</td>
                  <td style="max-width: 240px;">${escapeHtml(c.bukti_ciri)}${proofFileLink}</td>
                  <td>${pickupInfo}</td>
                  <td>
                    <span style="font-weight: 600; color: ${stColor};">
                      ${escapeHtml(stText)}
                    </span>
                  </td>
                  <td>
                    ${isPending
              ? `<div class="table-actions">
                             <button type="button" class="btn btn-primary btn-sm" onclick="verifyAdminClaim(${c.id}, 'approved')">${escapeHtml(t("btn_approve"))}</button>
                             <button type="button" class="btn btn-secondary btn-sm" onclick="verifyAdminClaim(${c.id}, 'rejected')">${escapeHtml(t("btn_reject"))}</button>
                           </div>`
              : `<span style="color: var(--text-dim); font-size: 0.8rem;">${escapeHtml(t("label_done"))}</span>`
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
  const msg = status === "approved" ? t("confirm_approve") : t("confirm_reject");
  if (!confirm(msg)) return;

  try {
    await api.verifyClaim(claimId, status);
    showToast(status === "approved" ? t("toast_claim_approved") : t("toast_claim_rejected"));
    loadAdminStats();
    loadAdminClaims();
    loadItems();
  } catch (err) {
    showToast(err.message, true);
  }
}

function openApproveClaimModal(claimId) {
  const modalHtml = `
    <div class="modal-header">
      <h2 class="modal-title">${escapeHtml(t("approve_modal_title"))}</h2>
      <button type="button" class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">
      ${escapeHtml(t("approve_modal_sub"))}
    </p>
    <form id="approve-claim-form">
      <div class="form-group">
        <label for="approve-lokasi-ambil">${escapeHtml(t("approve_loc_label"))}</label>
        <textarea id="approve-lokasi-ambil" rows="3" required
          placeholder="${escapeHtml(t("approve_loc_ph"))}"></textarea>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">${escapeHtml(t("btn_cancel"))}</button>
        <button type="submit" class="btn btn-primary">${escapeHtml(t("btn_approve"))}</button>
      </div>
    </form>
  `;

  openModal(modalHtml);

  $("#approve-claim-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const lokasiAmbil = $("#approve-lokasi-ambil").value.trim();
    if (!lokasiAmbil) return;

    try {
      await api.verifyClaim(claimId, "approved", lokasiAmbil);
      showToast(t("toast_claim_approved"));
      closeModal();
      loadAdminStats();
      loadAdminClaims();
      loadItems();
    } catch (err) {
      showToast(err.message, true);
    }
  });
}

async function loadAdminItems() {
  try {
    const items = await api.listItems();
    const container = $("#admin-items-container");

    container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>${escapeHtml(t("th_item"))}</th>
            <th>${escapeHtml(t("th_type"))}</th>
            <th>${escapeHtml(t("th_category"))}</th>
            <th>${escapeHtml(t("th_reporter"))}</th>
            <th>${escapeHtml(t("th_dropoff"))}</th>
            <th>${escapeHtml(t("th_status"))}</th>
            <th>${escapeHtml(t("th_action"))}</th>
          </tr>
        </thead>
        <tbody>
          ${items
        .map((item) => {
          const pelaporNama = item.pelapor ? item.pelapor.nama : "-";
          const isLost = item.tipe === "lost" || item.tipe === "hilang";
          let stLabel = t("status_open");
          if (item.status === "claimed" || item.status === "diklaim") stLabel = t("status_claimed");
          else if (item.status === "returned" || item.status === "dikembalikan") stLabel = t("status_returned");

          const dropoffCell = item.lokasi_setor
            ? `<span style="color: var(--color-green); font-size: 0.82rem; font-weight: 600;">${escapeHtml(item.lokasi_setor)}</span>`
            : `<span style="color: var(--text-dim); font-size: 0.8rem;">-</span>`;

          return `
                <tr>
                  <td><strong>${escapeHtml(item.judul)}</strong><br><small style="color: var(--text-dim);">${escapeHtml(item.lokasi)}</small></td>
                  <td><span class="badge-type ${isLost ? "lost" : "found"}">${escapeHtml(isLost ? t("type_lost") : t("type_found"))}</span></td>
                  <td>${escapeHtml(tCat(item.kategori))}</td>
                  <td>${escapeHtml(pelaporNama)}</td>
                  <td style="max-width: 200px;">${dropoffCell}</td>
                  <td>${escapeHtml(stLabel)}</td>
                  <td>
                    <button type="button" class="btn btn-danger btn-sm" onclick="adminDeleteItem(${item.id})">${escapeHtml(t("btn_takedown_short"))}</button>
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

async function openAdminDropoffModal(itemId) {
  let item;
  try {
    item = await api.getItem(itemId);
  } catch (err) {
    showToast(err.message, true);
    return;
  }

  const modalHtml = `
    <div class="modal-header">
      <h2 class="modal-title">${escapeHtml(t("dropoff_modal_title"))}</h2>
      <button type="button" class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">
      ${escapeHtml(t("dropoff_modal_sub"))}<br>
      <strong>${escapeHtml(item.judul)}</strong> (${escapeHtml(item.pelapor ? item.pelapor.nama : "-")})
    </p>
    <form id="admin-dropoff-form">
      <div class="form-group">
        <label for="admin-lokasi-setor">${escapeHtml(t("dropoff_label"))}</label>
        <textarea id="admin-lokasi-setor" rows="3" required
          placeholder="${escapeHtml(t("dropoff_ph"))}">${escapeHtml(item.lokasi_setor || "")}</textarea>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">${escapeHtml(t("btn_cancel"))}</button>
        <button type="submit" class="btn btn-primary">${escapeHtml(t("btn_save"))}</button>
      </div>
    </form>
  `;

  openModal(modalHtml);

  $("#admin-dropoff-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const lokasiSetor = $("#admin-lokasi-setor").value.trim();
    if (!lokasiSetor) return;

    try {
      await api.updateItem(itemId, {
        id_user: currentUser.id,
        lokasi_setor: lokasiSetor,
      });
      showToast(t("toast_dropoff_saved"));
      closeModal();
      loadAdminItems();
      loadItems();
    } catch (err) {
      showToast(err.message, true);
    }
  });
}

async function adminDeleteItem(itemId) {
  if (!confirm(t("confirm_takedown"))) return;
  try {
    await api.deleteItem(itemId);
    showToast(t("toast_takedown_ok"));
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
            <th>${escapeHtml(t("th_name"))}</th>
            <th>${escapeHtml(t("th_nim"))}</th>
            <th>${escapeHtml(t("th_email"))}</th>
            <th>${escapeHtml(t("th_role"))}</th>
            <th>${escapeHtml(t("th_action"))}</th>
          </tr>
        </thead>
        <tbody>
          ${users
        .map((u) => {
          const roleLabel = u.role === "admin" ? t("role_admin") : t("role_student");
          return `
                <tr>
                  <td><strong>${escapeHtml(u.nama)}</strong></td>
                  <td>${escapeHtml(u.nim || "-")}</td>
                  <td>${escapeHtml(u.email)}</td>
                  <td>${escapeHtml(roleLabel)}</td>
                  <td>
                    <div class="table-actions">
                      <button type="button" class="btn btn-secondary btn-sm" onclick="openEditUserModal(${u.id})">${escapeHtml(t("btn_edit"))}</button>
                      ${u.email !== "admin.lostfound@telkomuniversity.ac.id"
              ? `<button type="button" class="btn btn-danger btn-sm" onclick="adminDeleteUser(${u.id})">${escapeHtml(t("btn_delete"))}</button>`
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
  if (!confirm(t("confirm_delete_user"))) return;
  try {
    await api.deleteUser(userId);
    showToast(t("toast_user_deleted"));
    loadAdminUsers();
  } catch (err) {
    showToast(err.message, true);
  }
}

function openEditUserModal(userId) {
  api.getUser(userId).then((user) => {
    const modalHtml = `
      <div class="modal-header">
        <h2 class="modal-title">${escapeHtml(t("edit_user_title"))}</h2>
        <button type="button" class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <form id="edit-user-form">
        <div class="form-group">
          <label>${escapeHtml(t("th_name"))}</label>
          <input type="text" id="edit-user-nama" value="${escapeHtml(user.nama)}" required>
        </div>
        <div class="form-group">
          <label>${escapeHtml(t("th_nim"))}</label>
          <input type="text" id="edit-user-nim" value="${escapeHtml(user.nim || "")}">
        </div>
        <div class="form-group">
          <label>${escapeHtml(t("label_role"))}</label>
          <select id="edit-user-role">
            <option value="mahasiswa" ${user.role === "mahasiswa" ? "selected" : ""}>${escapeHtml(t("role_student"))}</option>
            <option value="admin" ${user.role === "admin" ? "selected" : ""}>${escapeHtml(t("role_admin"))}</option>
          </select>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">${escapeHtml(t("btn_cancel"))}</button>
          <button type="submit" class="btn btn-primary">${escapeHtml(t("btn_save"))}</button>
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
        showToast(t("toast_user_updated"));
        closeModal();
        loadAdminUsers();
      } catch (err) {
        showToast(err.message, true);
      }
    });
  });
}

// ---------------------------------------------------------------- tema (dark / light mode on-off switch)
const SUN_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
const MOON_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;

function getCurrentTheme() {
  return document.documentElement.getAttribute("data-theme") || "dark";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("lf_theme", theme);
  const isDark = theme === "dark";
  const label = isDark ? t("theme_dark_on") : t("theme_light_on");
  const icon = isDark ? MOON_ICON : SUN_ICON;

  $$("[data-theme-toggle]").forEach((btn) => {
    btn.setAttribute("aria-checked", isDark ? "true" : "false");
    btn.setAttribute("aria-label", label);
    btn.setAttribute("title", label);
    const iconSlot = btn.querySelector(".theme-switch-icon");
    if (iconSlot) iconSlot.innerHTML = icon;
  });
}

function initTheme() {
  applyTheme(getCurrentTheme());
  $$("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyTheme(getCurrentTheme() === "dark" ? "light" : "dark");
    });
  });
}

// ---------------------------------------------------------------- bahasa realtime (IND / ENG)
function applyLanguage(lang) {
  const safeLang = lang === "en" ? "en" : "id";
  document.documentElement.setAttribute("lang", safeLang);
  localStorage.setItem("lf_lang", safeLang);

  // Update tombol IND / ENG
  $$("[data-lang-toggle]").forEach((btn) => {
    btn.querySelectorAll("[data-lang-opt]").forEach((opt) => {
      opt.classList.toggle("active", opt.dataset.langOpt === safeLang);
    });
  });

  // Terjemahkan semua elemen statis dengan data-i18n
  $$("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });

  // Terjemahkan semua placeholder
  $$("[data-i18n-placeholder]").forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    el.setAttribute("placeholder", t(key));
  });

  // Update opsi kategori, user info, dan label tema
  populateCategorySelects();
  updateUserUI();
  applyTheme(getCurrentTheme());

  // Re-render konten dinamis halaman aktif secara real-time
  if (currentUser) {
    const page = getActivePage();
    if (page === "beranda") {
      renderItemsList(currentItems);
    } else if (page === "aktivitas") {
      loadUserActivity();
    } else if (page === "admin") {
      loadAdminData();
    }
    if (currentDrawerItemId && !$("#drawer-backdrop").hidden) {
      showItemDetail(currentDrawerItemId);
    }
  }
}

function initLanguage() {
  applyLanguage(getCurrentLang());
  $$("[data-lang-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyLanguage(getCurrentLang() === "id" ? "en" : "id");
    });
  });
}

// ---------------------------------------------------------------- inisialisasi awal event listeners
document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initLanguage();

  try {
    const conf = await api.config();
    if (conf.categories && conf.categories.length) {
      availableCategories = conf.categories;
    }
  } catch (e) {
    console.warn("Gagal memuat konfigurasi awal:", e);
  }
  populateCategorySelects();

  initAuth();

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
        showToast(t("toast_welcome", { name: user.nama }));
        showAppLayout();
        window.location.hash = "beranda";
      } catch (err) {
        showToast(err.message, true);
      }
    });
  }

  const logoutBtn = $("#logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
  const mobLogoutBtn = $("#mob-logout-btn");
  if (mobLogoutBtn) mobLogoutBtn.addEventListener("click", logout);

  const quickReportBtn = $("#btn-quick-report");
  if (quickReportBtn) {
    quickReportBtn.addEventListener("click", openReportModal);
  }

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

  const formTipeSegmented = $("#form-tipe-segmented");
  if (formTipeSegmented) {
    formTipeSegmented.querySelectorAll(".seg-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        formTipeSegmented.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        $("#report-tipe").value = btn.dataset.val;
        const pagePhotoLbl = $("#report-photo-label");
        if (pagePhotoLbl) {
          pagePhotoLbl.textContent =
            btn.dataset.val === "found"
              ? t("report_photo_required_label")
              : t("report_photo_optional_label");
        }
      });
    });
  }

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
        showToast(t("toast_photo_err"), true);
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
      const tipeVal = $("#report-tipe").value;
      const fotoVal = $("#report-url-foto").value;
      if (tipeVal === "found" && !fotoVal) {
        showToast(t("toast_photo_required_found"), true);
        return;
      }

      const payload = {
        tipe: tipeVal,
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
        showToast(
          tipeVal === "found" ? t("toast_published_found") : t("toast_published")
        );
        reportForm.reset();
        if (btnRemovePhoto) btnRemovePhoto.click();
        refreshActivityNotifications();
        window.location.hash = "beranda";
      } catch (err) {
        showToast(err.message, true);
      }
    });
  }

  $$("#page-aktivitas .subtab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$("#page-aktivitas .subtab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const targetSubtab = btn.dataset.subtab;
      $("#subtab-my-items").hidden = targetSubtab !== "my-items";
      $("#subtab-my-claims").hidden = targetSubtab !== "my-claims";
    });
  });

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

  const btnAddUser = $("#btn-add-user");
  if (btnAddUser) {
    btnAddUser.addEventListener("click", () => {
      const modalHtml = `
        <div class="modal-header">
          <h2 class="modal-title">${escapeHtml(t("add_user_title"))}</h2>
          <button type="button" class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <form id="add-user-form">
          <div class="form-group">
            <label>${escapeHtml(t("label_fullname"))}</label>
            <input type="text" id="add-user-nama" required placeholder="Ahmad Zaky">
          </div>
          <div class="form-group">
            <label>${escapeHtml(t("label_campus_email"))}</label>
            <input type="email" id="add-user-email" required placeholder="zaky@student.telkomuniversity.ac.id">
          </div>
          <div class="form-group">
            <label>${escapeHtml(t("th_nim"))}</label>
            <input type="text" id="add-user-nim" placeholder="1030124999">
          </div>
          <div class="form-group">
            <label>${escapeHtml(t("label_role"))}</label>
            <select id="add-user-role">
              <option value="mahasiswa">${escapeHtml(t("role_student"))}</option>
              <option value="admin">${escapeHtml(t("role_admin"))}</option>
            </select>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">${escapeHtml(t("btn_cancel"))}</button>
            <button type="submit" class="btn btn-primary">${escapeHtml(t("btn_save_user"))}</button>
          </div>
        </form>
      `;
      openModal(modalHtml);

      $("#add-user-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
          await api.createUser({
            nama: $("#add-user-nama").value.trim(),
            email: $("#add-user-email").value.trim().toLowerCase(),
            nim: $("#add-user-nim").value.trim() || "-",
            role: $("#add-user-role").value,
          });
          showToast(t("toast_user_added"));
          closeModal();
          loadAdminUsers();
        } catch (err) {
          showToast(err.message, true);
        }
      });
    });
  }
});
