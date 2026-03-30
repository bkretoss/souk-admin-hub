const BASE_URL = "https://ciywuwcwixbvmsezppya.supabase.co/functions/v1/sub-category-crud";
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

export const getSubCategories = async () => {
  const res = await fetch(BASE_URL, { headers });
  const data = await handleResponse(res);
  return Array.isArray(data) ? data : (data?.data ?? []);
};

export interface SubCategoryPayload {
  name: string;
  category_id: string;
}

export const createSubCategory = async (payload: SubCategoryPayload) => {
  const res = await fetch(BASE_URL, { method: "POST", headers, body: JSON.stringify(payload) });
  return handleResponse(res);
};

export const updateSubCategory = async (id: string, payload: SubCategoryPayload) => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "PUT", headers, body: JSON.stringify(payload) });
  return handleResponse(res);
};

export const deleteSubCategory = async (id: string) => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE", headers });
  return handleResponse(res);
};
