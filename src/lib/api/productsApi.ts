import { supabase } from "@/integrations/supabase/client";

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
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Product[];
};

export const createProduct = async (payload: Record<string, unknown>): Promise<Product> => {
  const { data, error } = await supabase.from("products").insert([payload]).select("*, categories(name)").single();
  if (error) throw error;
  return data as Product;
};

export const updateProduct = async (id: string, updates: Record<string, unknown>): Promise<Product> => {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select("*, categories(name)")
    .single();
  if (error) throw error;
  return data as Product;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
};
