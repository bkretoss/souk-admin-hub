const BASE_URL = "https://ciywuwcwixbvmsezppya.supabase.co/functions/v1/user-crud";
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const headers: HeadersInit = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${ANON_KEY}`,
};

const handleResponse = async (res: Response) => {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.message ?? `Request failed: ${res.status}`);
  return body;
};

// GET /api/users (excludes Admin role — also enforced on backend)
export const getUsers = async () => {
  const res = await fetch(`${BASE_URL}?role!=Admin`, { headers });
  const data = await handleResponse(res);
  const list = Array.isArray(data) ? data : (data?.data ?? []);
  // Client-side safety net: strip any admin that slips through
  return list.filter((u: Record<string, unknown>) => String(u.role ?? "").toLowerCase() !== "admin");
};

// POST /api/users
export const createUser = async (payload: Record<string, unknown>) => {
  const res = await fetch(BASE_URL, { method: "POST", headers, body: JSON.stringify(payload) });
  return handleResponse(res);
};

// PUT /api/users/:id
export const updateUser = async (id: string, updates: Record<string, unknown>) => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "PUT", headers, body: JSON.stringify(updates) });
  return handleResponse(res);
};

// DELETE /api/users/:id
export const deleteUser = async (id: string) => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE", headers });
  return handleResponse(res);
};
