import { supabase } from "@/integrations/supabase/client";
import { getUsers } from "@/lib/api/usersApi";
import { getOrders } from "@/lib/api/ordersApi";

const ORDER_CRUD_URL = "https://ciywuwcwixbvmsezppya.supabase.co/functions/v1/order-crud";
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const getDashboardStats = async () => {
  const [users, products, orders, categories] = await Promise.all([
    getUsers(),
    supabase.from("products").select("id", { count: "exact", head: true }),
    getOrders(),
    supabase.from("categories").select("id", { count: "exact", head: true }),
  ]);
  return {
    totalUsers: Array.isArray(users) ? users.length : 0,
    totalProducts: products.count ?? 0,
    totalOrders: Array.isArray(orders) ? orders.length : 0,
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
