const BASE_URL = "https://ciywuwcwixbvmsezppya.supabase.co/functions/v1/location-crud";
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

export const getLocations = async () => {
  const res = await fetch(BASE_URL, { headers });
  const data = await handleResponse(res);
  return Array.isArray(data) ? data : (data?.data ?? []);
};

export const createLocation = async (payload: { name: string; country: string | null; is_active?: boolean }) => {
  const res = await fetch(BASE_URL, { method: "POST", headers, body: JSON.stringify(payload) });
  return handleResponse(res);
};

export const updateLocation = async (id: string, updates: { name: string; country: string | null; is_active?: boolean }) => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "PUT", headers, body: JSON.stringify(updates) });
  return handleResponse(res);
};

export const updateLocationStatus = async (id: string, is_active: boolean) => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "PUT", headers, body: JSON.stringify({ is_active }) });
  return handleResponse(res);
};

export const deleteLocation = async (id: string) => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE", headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Delete failed: ${res.status}`);
  }
};
