import { supabase } from "@/integrations/supabase/client";

const ORDER_CRUD_URL = "https://ciywuwcwixbvmsezppya.supabase.co/functions/v1/order-crud";
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const getDashboardStats = async () => {
  const [users, products, orders, categories] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).neq("role", "admin"),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
  ]);
  return {
    totalUsers: users.count ?? 0,
    totalProducts: products.count ?? 0,
    totalOrders: orders.count ?? 0,
    totalCategories: categories.count ?? 0,
  };
};

export const getRecentOrders = async () => {
  const res = await fetch(ORDER_CRUD_URL, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON_KEY}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.message ?? `Request failed: ${res.status}`);
  const data: any[] = Array.isArray(body) ? body : (body?.data ?? []);
  return data.slice(0, 10);
};
