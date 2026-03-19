import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const client = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    // Extract optional /:id from path
    const pathParts = url.pathname.split("/").filter(Boolean);
    const id = pathParts[pathParts.length - 1] !== "location-crud" ? pathParts[pathParts.length - 1] : null;

    // GET /location-crud
    if (req.method === "GET") {
      const country = url.searchParams.get("country") || "UAE";
      const activeParam = url.searchParams.get("active");
      let query = client
        .from("locations")
        .select("id, name, country, is_active, created_at")
        // .eq("country", country)
        .order("name", { ascending: true });
      if (activeParam !== "false") query = query.eq("is_active", true);
      const { data, error } = await query;
      if (error) throw error;
      return json({ success: true, data: data ?? [], total: data?.length ?? 0, country });
    }

    // POST /location-crud
    if (req.method === "POST") {
      const body = await req.json();
      const { data: existing } = await client.from("locations").select("id").ilike("name", body.name).maybeSingle();
      if (existing) return json({ success: false, message: "Location name already exists" }, 409);
      const { data, error } = await client
        .from("locations")
        .insert({ name: body.name, country: body.country ?? "UAE", is_active: body.is_active ?? true })
        .select()
        .single();
      if (error) throw error;
      return json({ success: true, data }, 201);
    }

    // PUT /location-crud/:id
    if (req.method === "PUT" && id) {
      const body = await req.json();
      const updates: Record<string, unknown> = {};
      if (body.name !== undefined) updates.name = body.name;
      if (body.country !== undefined) updates.country = body.country;
      if (body.is_active !== undefined) updates.is_active = body.is_active;
      if (updates.name !== undefined) {
        const { data: existing } = await client
          .from("locations")
          .select("id")
          .ilike("name", updates.name as string)
          .neq("id", id)
          .maybeSingle();
        if (existing) return json({ success: false, message: "Location name already exists" }, 409);
      }
      const { data, error } = await client.from("locations").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return json({ success: true, data });
    }

    // DELETE /location-crud/:id
    if (req.method === "DELETE" && id) {
      const { error } = await client.from("locations").delete().eq("id", id);
      if (error) throw error;
      return json({ success: true });
    }

    return json({ success: false, message: "Method not allowed" }, 405);
  } catch (err) {
    console.error("Locations error:", err);
    return json({ success: false, message: err.message || "Internal server error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
