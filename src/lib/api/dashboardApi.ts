import { supabase } from "@/integrations/supabase/client";

// GET /api/dashboard/stats
export const getDashboardStats = async () => {
  const [users, products, orders, categories] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
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

// GET /api/dashboard/recent-orders
export const getRecentOrders = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select("*, products(title, price)")
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) throw error;
  return data;
};
