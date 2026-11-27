// Pembungkus fetch untuk memanggil REST API backend.
// Mendukung header X-User-Id untuk otorisasi sederhana.

async function request(method, path, body) {
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("lf_user") || "null");
  } catch (e) {
    currentUser = null;
  }

  const headers = {};
  if (body) {
    headers["Content-Type"] = "application/json";
  }
  if (currentUser && currentUser.id) {
    headers["X-User-Id"] = String(currentUser.id);
  }

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || `Request gagal (${res.status})`);
  }
  return json;
}

const api = {
  health: () => request("GET", "/health"),
  config: () => request("GET", "/api/config"),
  login: (email) => request("POST", "/api/login", { email }),

  // User CRUD
  listUsers: () => request("GET", "/api/users"),
  getUser: (id) => request("GET", `/api/users/${id}`),
  createUser: (userData) => request("POST", "/api/users", userData),
  updateUser: (id, userData) => request("PUT", `/api/users/${id}`, userData),
  deleteUser: (id) => request("DELETE", `/api/users/${id}`),
  activity: (id) => request("GET", `/api/users/${id}/activity`),

  // Item (Barang) CRUD
  categories: () => request("GET", "/api/categories"),
  listItems: (filters = {}) => {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(filters)) {
      if (val !== undefined && val !== null && val !== "") {
        params.append(key, val);
      }
    }
    const qs = params.toString();
    return request("GET", `/api/items${qs ? "?" + qs : ""}`);
  },
  getItem: (id) => request("GET", `/api/items/${id}`),
  createItem: (itemData) => request("POST", "/api/items", itemData),
  updateItem: (id, itemData) => request("PUT", `/api/items/${id}`, itemData),
  deleteItem: (id) => request("DELETE", `/api/items/${id}`),

  // Claim (Klaim) CRUD
  listClaims: (filters = {}) => {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(filters)) {
      if (val !== undefined && val !== null && val !== "") {
        params.append(key, val);
      }
    }
    const qs = params.toString();
    return request("GET", `/api/claims${qs ? "?" + qs : ""}`);
  },
  getClaim: (id) => request("GET", `/api/claims/${id}`),
  createClaim: (claimData) => request("POST", "/api/claims", claimData),
  updateClaim: (id, claimData) => request("PUT", `/api/claims/${id}`, claimData),
  deleteClaim: (id) => request("DELETE", `/api/claims/${id}`),
  verifyClaim: (id, status) => request("PUT", `/api/claims/${id}`, { status }),
};
