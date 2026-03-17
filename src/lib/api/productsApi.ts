import { supabase } from "@/integrations/supabase/client";

// GET /api/products
export const getProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

// POST /api/products
export const createProduct = async (product: Record<string, unknown>) => {
  const { data, error } = await supabase.from("products").insert([product]).select().single();
  if (error) throw error;
  return data;
};

// PUT /api/products/:id
export const updateProduct = async (id: string, updates: Record<string, unknown>) => {
  const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
};

// DELETE /api/products/:id
export const deleteProduct = async (id: string) => {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
};
