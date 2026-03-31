const BASE_URL = "https://ciywuwcwixbvmsezppya.supabase.co/functions/v1/order-crud";
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

// GET /api/orders?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
export const getOrders = async (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams({ limit: 'all' });
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  const url = `${BASE_URL}?${params}`;
  const res = await fetch(url, { headers });
  const data = await handleResponse(res);
  return Array.isArray(data) ? data : (data?.data ?? []);
};

// GET /api/orders?user_id={user_id}&page=1&limit=10
export const getOrdersByUser = async (userId: string, page = 1, limit = 10) => {
  const params = new URLSearchParams({ user_id: userId, page: String(page), limit: String(limit) });
  const url = `${BASE_URL}?${params}`;
  console.log("[getOrdersByUser] Fetching from:", url);
  const res = await fetch(url, { headers });
  const data = await handleResponse(res);
  console.log("[getOrdersByUser] Response:", data);
  return { orders: data?.data ?? [], total: data?.total ?? 0 };
};

// GET /api/orders?seller_id={seller_id}&page=1&limit=10
export const getOrdersBySeller = async (sellerId: string, page = 1, limit = 10) => {
  const params = new URLSearchParams({ seller_id: sellerId, page: String(page), limit: String(limit) });
  const url = `${BASE_URL}?${params}`;
  console.log("[getOrdersBySeller] Fetching from:", url);
  const res = await fetch(url, { headers });
  const data = await handleResponse(res);
  console.log("[getOrdersBySeller] Response:", data);
  return { orders: data?.data ?? [], total: data?.total ?? 0 };
};

// GET /api/orders/:id
export const getOrderById = async (id: string) => {
  const res = await fetch(`${BASE_URL}/${id}`, { headers });
  const data = await handleResponse(res);
  return data?.data ?? data;
};

// PUT /api/orders/:id
export const updateOrder = async (id: string, updates: Record<string, unknown>) => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "PUT", headers, body: JSON.stringify(updates) });
  return handleResponse(res);
};

// DELETE /api/orders/:id
export const deleteOrder = async (id: string) => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE", headers });
  return handleResponse(res);
};
