import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
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
    const id = pathParts[pathParts.length - 1] !== "content-crud" ? pathParts[pathParts.length - 1] : null;

    // GET /content-crud
    if (req.method === "GET") {
      if (id) {
        // GET /content-crud/:id  — fetch single page by id or slug
        const isUuid = /^[0-9a-f-]{36}$/.test(id);
        const query = isUuid
          ? client.from("cms_pages").select("*").eq("id", id).single()
          : client.from("cms_pages").select("*").eq("slug", id).eq("status", "published").single();
        const { data, error } = await query;
        if (error) throw error;
        return json({ success: true, data });
      }
      const { data, error } = await client
        .from("cms_pages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return json({ success: true, data: data ?? [], total: data?.length ?? 0 });
    }

    // POST /content-crud
    if (req.method === "POST") {
      const body = await req.json();
      if (!body.title?.trim()) return json({ success: false, message: "Title is required" }, 400);
      if (!body.slug?.trim()) return json({ success: false, message: "Slug is required" }, 400);

      const { data: existingSlug } = await client.from("cms_pages").select("id").eq("slug", body.slug.trim()).maybeSingle();
      if (existingSlug) return json({ success: false, message: "Slug already exists" }, 409);

      const { data: existingTitle } = await client.from("cms_pages").select("id").ilike("title", body.title.trim()).maybeSingle();
      if (existingTitle) return json({ success: false, message: "Content with this title already exists" }, 409);

      const { data, error } = await client.from("cms_pages").insert({
        title: body.title.trim(),
        slug: body.slug.trim(),
        content: body.content ?? "",
        status: body.status ?? "draft",
      }).select().single();
      if (error) throw error;
      return json({ success: true, data }, 201);
    }

    // PUT /content-crud/:id
    if (req.method === "PUT" && id) {
      const body = await req.json();
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

      // Full update (title + slug provided)
      if (body.title !== undefined || body.slug !== undefined) {
        if (!body.title?.trim()) return json({ success: false, message: "Title is required" }, 400);
        if (!body.slug?.trim()) return json({ success: false, message: "Slug is required" }, 400);
        const { data: existingSlug } = await client.from("cms_pages").select("id").eq("slug", body.slug.trim()).neq("id", id).maybeSingle();
        if (existingSlug) return json({ success: false, message: "Slug already exists" }, 409);

        const { data: existingTitle } = await client.from("cms_pages").select("id").ilike("title", body.title.trim()).neq("id", id).maybeSingle();
        if (existingTitle) return json({ success: false, message: "Content with this title already exists" }, 409);

        updates.title = body.title.trim();
        updates.slug = body.slug.trim();
        updates.content = body.content ?? "";
      }

      if (body.status !== undefined) updates.status = body.status;

      const { data, error } = await client.from("cms_pages").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return json({ success: true, data });
    }

    // PATCH /content-crud/:id  — status-only update
    if (req.method === "PATCH" && id) {
      const body = await req.json();
      if (!body.status || !["draft", "published"].includes(body.status)) {
        return json({ success: false, message: "Invalid status value" }, 400);
      }
      const { data, error } = await client
        .from("cms_pages")
        .update({ status: body.status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return json({ success: true, data });
    }

    // DELETE /content-crud/:id
    if (req.method === "DELETE" && id) {
      const { error } = await client.from("cms_pages").delete().eq("id", id);
      if (error) throw error;
      return json({ success: true });
    }

    return json({ success: false, message: "Method not allowed" }, 405);
  } catch (err) {
    console.error("Content CRUD error:", err);
    return json({ success: false, message: err.message || "Internal server error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
