// Pembungkus fetch untuk memanggil REST API backend.
async function request(method, path, body) {
  const res = await fetch(API_BASE + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Request gagal (${res.status})`);
  return json;
}

const api = {
  config: () => request("GET", "/api/config"),
  login: (email) => request("POST", "/api/login", { email }),
  loginGoogle: (credential) => request("POST", "/api/auth/google", { credential }),

  // User
  listUsers: () => request("GET", "/api/users"),
  getUser: (id) => request("GET", `/api/users/${id}`),
  createUser: (u) => request("POST", "/api/users", u),
  updateUser: (id, u) => request("PUT", `/api/users/${id}`, u),
  deleteUser: (id) => request("DELETE", `/api/users/${id}`),
  activity: (id) => request("GET", `/api/users/${id}/activity`),

  // Barang
  categories: () => request("GET", "/api/categories"),
  listItems: (filters = {}) => {
    const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();
    return request("GET", `/api/items${qs ? "?" + qs : ""}`);
  },
  getItem: (id) => request("GET", `/api/items/${id}`),
  createItem: (i) => request("POST", "/api/items", i),
  updateItem: (id, i) => request("PUT", `/api/items/${id}`, i),
  deleteItem: (id, idUser) => request("DELETE", `/api/items/${id}?id_user=${idUser}`),

  // Klaim
  listClaims: (filters = {}) => {
    const qs = new URLSearchParams(filters).toString();
    return request("GET", `/api/claims${qs ? "?" + qs : ""}`);
  },
  createClaim: (c) => request("POST", "/api/claims", c),
  updateClaim: (id, c) => request("PUT", `/api/claims/${id}`, c),
  deleteClaim: (id) => request("DELETE", `/api/claims/${id}`),
  verifyClaim: (id, status, idAdmin) =>
    request("POST", `/api/claims/${id}/verify`, { status, id_admin: idAdmin }),
};
