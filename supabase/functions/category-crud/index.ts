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
    const pathParts = url.pathname.split("/").filter(Boolean);
    const id = pathParts[pathParts.length - 1] !== "category-crud" ? pathParts[pathParts.length - 1] : null;

    // GET /category-crud
    if (req.method === "GET") {
      const { data, error } = await client
        .from("categories")
        .select("id, name, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return json({ success: true, data: data ?? [], total: data?.length ?? 0 });
    }

    // POST /category-crud
    if (req.method === "POST") {
      const body = await req.json();
      if (!body.name?.trim()) return json({ success: false, message: "Name is required" }, 400);
      const { data: existing } = await client.from("categories").select("id").ilike("name", body.name.trim()).maybeSingle();
      if (existing) return json({ success: false, message: "Category name already exists" }, 409);
      const { data, error } = await client.from("categories").insert({ name: body.name.trim() }).select().single();
      if (error) throw error;
      return json({ success: true, data }, 201);
    }

    // PUT /category-crud/:id
    if (req.method === "PUT" && id) {
      const body = await req.json();
      if (!body.name?.trim()) return json({ success: false, message: "Name is required" }, 400);
      const { data: existing } = await client.from("categories").select("id").ilike("name", body.name.trim()).neq("id", id).maybeSingle();
      if (existing) return json({ success: false, message: "Category name already exists" }, 409);
      const { data, error } = await client
        .from("categories")
        .update({ name: body.name.trim() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return json({ success: true, data });
    }

    // DELETE /category-crud/:id
    if (req.method === "DELETE" && id) {
      const { error } = await client.from("categories").delete().eq("id", id);
      if (error) throw error;
      return json({ success: true });
    }

    return json({ success: false, message: "Method not allowed" }, 405);
  } catch (err) {
    console.error("Categories error:", err);
    return json({ success: false, message: err.message || "Internal server error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
