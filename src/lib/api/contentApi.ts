const BASE_URL = "https://ciywuwcwixbvmsezppya.supabase.co/functions/v1/content-crud";
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const headers: HeadersInit = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${ANON_KEY}`,
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Request failed: ${res.status}`);
  }
  return res.json();
};

export const getContents = async () => {
  const res = await fetch(BASE_URL, { headers });
  const data = await handleResponse(res);
  return Array.isArray(data) ? data : (data?.data ?? []);
};

export const createContent = async (payload: {
  title: string;
  slug: string;
  content: string;
  status: string;
}) => {
  const res = await fetch(BASE_URL, { method: "POST", headers, body: JSON.stringify(payload) });
  return handleResponse(res);
};

export const updateContent = async (
  id: string,
  updates: { title: string; slug: string; content: string; status: string },
) => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "PUT", headers, body: JSON.stringify(updates) });
  return handleResponse(res);
};

export const updateContentStatus = async (id: string, status: string) => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "PATCH", headers, body: JSON.stringify({ status }) });
  return handleResponse(res);
};

export const deleteContent = async (id: string) => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE", headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Delete failed: ${res.status}`);
  }
};
