import { supabase } from "@/integrations/supabase/client";

// GET /api/notifications
export const getNotifications = async () => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
};

// PUT /api/notifications/:id
export const markNotificationRead = async (id: string) => {
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  if (error) throw error;
};
