import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const client = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    const id = lastPart !== "sub-category-crud" ? lastPart : null;

    // GET /sub-category-crud
    if (req.method === "GET" && !id) {
      const { data, error } = await client
        .from("sub_categories")
        .select("id, name, category_id, created_at, categories(id, name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return json({ success: true, data: data ?? [], total: data?.length ?? 0 });
    }

    // GET /sub-category-crud/:id
    if (req.method === "GET" && id) {
      const { data, error } = await client
        .from("sub_categories")
        .select("id, name, category_id, created_at, categories(id, name)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return json({ success: true, data });
    }

    // POST /sub-category-crud
    if (req.method === "POST") {
      const body = await req.json();
      if (!body.name?.trim()) return json({ success: false, message: "Name is required" }, 400);
      if (!body.category_id) return json({ success: false, message: "Category is required" }, 400);

      const { data: dupName } = await client
        .from("sub_categories")
        .select("id")
        .eq("category_id", body.category_id)
        .ilike("name", body.name.trim())
        .maybeSingle();
      if (dupName) return json({ success: false, message: "Sub-category name already exists under this category" }, 409);

      const { data, error } = await client
        .from("sub_categories")
        .insert({ name: body.name.trim(), category_id: body.category_id })
        .select("id, name, category_id, created_at, categories(id, name)")
        .single();
      if (error) throw error;
      return json({ success: true, data }, 201);
    }

    // PUT /sub-category-crud/:id
    if (req.method === "PUT" && id) {
      const body = await req.json();
      if (!body.name?.trim()) return json({ success: false, message: "Name is required" }, 400);
      if (!body.category_id) return json({ success: false, message: "Category is required" }, 400);

      const { data: dupName } = await client
        .from("sub_categories")
        .select("id")
        .eq("category_id", body.category_id)
        .ilike("name", body.name.trim())
        .neq("id", id)
        .maybeSingle();
      if (dupName) return json({ success: false, message: "Sub-category name already exists under this category" }, 409);

      const { data, error } = await client
        .from("sub_categories")
        .update({ name: body.name.trim(), category_id: body.category_id })
        .eq("id", id)
        .select("id, name, category_id, created_at, categories(id, name)")
        .single();
      if (error) throw error;
      return json({ success: true, data });
    }

    // DELETE /sub-category-crud/:id
    if (req.method === "DELETE" && id) {
      const { error } = await client.from("sub_categories").delete().eq("id", id);
      if (error) throw error;
      return json({ success: true });
    }

    return json({ success: false, message: "Method not allowed" }, 405);
  } catch (err) {
    console.error("Sub-categories error:", err);
    return json({ success: false, message: err.message || "Internal server error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
