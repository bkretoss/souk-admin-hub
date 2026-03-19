import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const client = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    // GET /setting?key=general — fetch settings by key
    if (req.method === "GET") {
      if (!key) return json({ success: false, message: "key query param is required" }, 400);
      const { data, error } = await client
        .from("settings")
        .select("*")
        .eq("key", key)
        .maybeSingle();
      if (error) throw error;
      return json({ success: true, data });
    }

    // POST /setting — upsert settings { key, value }
    if (req.method === "POST") {
      const body = await req.json();
      if (!body.key) return json({ success: false, message: "key is required" }, 400);
      if (body.value === undefined) return json({ success: false, message: "value is required" }, 400);

      const { data, error } = await client
        .from("settings")
        .upsert(
          { key: body.key, value: body.value, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        )
        .select()
        .single();
      if (error) throw error;
      return json({ success: true, data });
    }

    return json({ success: false, message: "Method not allowed" }, 405);
  } catch (err) {
    console.error("Settings error:", err);
    return json({ success: false, message: err.message || "Internal server error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
