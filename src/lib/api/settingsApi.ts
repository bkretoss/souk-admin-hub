import { supabase } from "@/integrations/supabase/client";

export interface GeneralSettings {
  appName: string;
  supportEmail: string;
  currency: string;
  serviceFee: number;
  enableNotifications: boolean;
  maintenanceMode: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  forcePasswordChange: boolean;
  sessionTimeout: number;
}

export async function fetchSettings<T>(key: string): Promise<T | null> {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    console.error(`[settingsApi] fetchSettings error (key=${key}):`, error);
    throw error;
  }

  return data ? (data.value as T) : null;
}

export async function upsertSettings<T extends Record<string, unknown>>(
  key: string,
  value: T
): Promise<T> {
  const { data, error } = await supabase
    .from("settings")
    .upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    )
    .select("value")
    .single();

  if (error) {
    console.error(`[settingsApi] upsertSettings error (key=${key}):`, error);
    throw error;
  }

  return data.value as T;
}
