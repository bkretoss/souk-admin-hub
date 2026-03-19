const BASE_URL = "https://ciywuwcwixbvmsezppya.supabase.co/functions/v1/product-crud";
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

export type Product = {
  id: string;
  title: string;
  brand: string | null;
  price: number;
  condition: string | null;
  is_sold: boolean;
  category_id: string;
  description: string | null;
  images: string[] | null;
  location: string | null;
  size: string | null;
  color: string | null;
  material: string | null;
  service_fee_percentage: number;
  seller_id: string;
  created_at: string;
  updated_at: string;
  categories?: { name: string } | null;
};

export const getProducts = async (): Promise<Product[]> => {
  const res = await fetch(BASE_URL, { headers });
  const data = await handleResponse(res);
  return Array.isArray(data) ? data : (data?.data ?? []);
};

export const createProduct = async (payload: Record<string, unknown>): Promise<Product> => {
  const res = await fetch(BASE_URL, { method: "POST", headers, body: JSON.stringify(payload) });
  const data = await handleResponse(res);
  return data?.data ?? data;
};

export const updateProduct = async (id: string, updates: Record<string, unknown>): Promise<Product> => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "PUT", headers, body: JSON.stringify(updates) });
  const data = await handleResponse(res);
  return data?.data ?? data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE", headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Delete failed: ${res.status}`);
  }
};
