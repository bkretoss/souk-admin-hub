import { supabase } from "@/integrations/supabase/client";

// GET /api/users
export const getUsers = async () => {
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

// POST /api/users
export const createUser = async (payload: Record<string, unknown>) => {
  const { data, error } = await supabase.from("profiles").insert([payload]).select().single();
  if (error) throw error;
  return data;
};

// PUT /api/users/:id
export const updateUser = async (id: string, updates: Record<string, unknown>) => {
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
};

// DELETE /api/users/:id
export const deleteUser = async (id: string) => {
  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) throw error;
};
