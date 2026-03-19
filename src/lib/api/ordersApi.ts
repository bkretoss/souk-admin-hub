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
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  const url = params.toString() ? `${BASE_URL}?${params}` : BASE_URL;
  const res = await fetch(url, { headers });
  const data = await handleResponse(res);
  return Array.isArray(data) ? data : (data?.data ?? []);
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
