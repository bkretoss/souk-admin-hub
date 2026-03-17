const BASE_URL = "https://ciywuwcwixbvmsezppya.supabase.co/functions/v1/category-crud";
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

export const getCategories = async () => {
  const res = await fetch(BASE_URL, { headers });
  const data = await handleResponse(res);
  return Array.isArray(data) ? data : (data?.data ?? []);
};

export const createCategory = async (payload: { name: string }) => {
  const res = await fetch(BASE_URL, { method: "POST", headers, body: JSON.stringify(payload) });
  return handleResponse(res);
};

export const updateCategory = async (id: string, updates: { name: string }) => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "PUT", headers, body: JSON.stringify(updates) });
  return handleResponse(res);
};

export const deleteCategory = async (id: string) => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE", headers });
  return handleResponse(res);
};
