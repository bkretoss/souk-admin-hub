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
    const lastPart = pathParts[pathParts.length - 1];
    const id = lastPart !== "product-crud" ? lastPart : null;

    // GET /product-crud — fetch all products with category and sub-category name
    if (req.method === "GET") {
      const { data, error } = await client
        .from("products")
        .select("*, categories(name), sub_categories(id, name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return json({ success: true, data: data ?? [], total: data?.length ?? 0 });
    }

    // POST /product-crud — create product
    if (req.method === "POST") {
      const body = await req.json();
      if (!body.title?.trim()) return json({ success: false, message: "Product name is required" }, 400);
      if (body.title.trim().length < 2) return json({ success: false, message: "Product name must be at least 2 characters" }, 400);
      if (!body.price || isNaN(Number(body.price)) || Number(body.price) <= 0)
        return json({ success: false, message: "Price must be a valid positive number" }, 400);
      if (!body.category_id) return json({ success: false, message: "Category is required" }, 400);
      if (!body.seller_id) return json({ success: false, message: "Seller is required" }, 400);

      // Unique title check
      const { data: existing } = await client
        .from("products")
        .select("id")
        .ilike("title", body.title.trim())
        .maybeSingle();
      if (existing) return json({ success: false, message: "Product name already exists" }, 409);

      const { data, error } = await client
        .from("products")
        .insert({
          title: body.title.trim(),
          brand: body.brand?.trim() || null,
          price: Number(body.price),
          condition: body.condition ?? "new",
          category_id: body.category_id,
          sub_category_id: body.sub_category_id || null,
          description: body.description?.trim() || null,
          is_sold: body.is_sold ?? false,
          seller_id: body.seller_id,
          images: body.images ?? null,
          location: body.location?.trim() || null,
          size: body.size?.trim() || null,
          color: body.color?.trim() || null,
          material: body.material?.trim() || null,
          service_fee_percentage: body.service_fee_percentage ?? 0,
        })
        .select("*, categories(name), sub_categories(id, name)")
        .single();
      if (error) throw error;
      return json({ success: true, data }, 201);
    }

    // PUT /product-crud/:id — update product
    if (req.method === "PUT" && id) {
      const body = await req.json();
      const allowed = [
        "title", "brand", "price", "condition", "category_id", "sub_category_id",
        "description", "is_sold", "images", "location", "size", "color",
        "material", "service_fee_percentage",
      ];
      const updates: Record<string, unknown> = {};
      for (const key of allowed) {
        if (body[key] !== undefined) updates[key] = body[key];
      }
      if (updates.title !== undefined) {
        const titleStr = String(updates.title).trim();
        if (!titleStr) return json({ success: false, message: "Product name cannot be empty" }, 400);
        if (titleStr.length < 2) return json({ success: false, message: "Product name must be at least 2 characters" }, 400);
        // Unique title check (exclude current product)
        const { data: existing } = await client
          .from("products")
          .select("id")
          .ilike("title", titleStr)
          .neq("id", id)
          .maybeSingle();
        if (existing) return json({ success: false, message: "Product name already exists" }, 409);
        updates.title = titleStr;
      }
      if (updates.price !== undefined && (isNaN(Number(updates.price)) || Number(updates.price) <= 0))
        return json({ success: false, message: "Price must be a valid positive number" }, 400);
      if (Object.keys(updates).length === 0) return json({ success: false, message: "No valid fields to update" }, 400);

      const { data, error } = await client
        .from("products")
        .update(updates)
        .eq("id", id)
        .select("*, categories(name), sub_categories(id, name)")
        .single();
      if (error) throw error;
      return json({ success: true, data });
    }

    // DELETE /product-crud/:id — delete product
    if (req.method === "DELETE" && id) {
      const { error } = await client.from("products").delete().eq("id", id);
      if (error) throw error;
      return json({ success: true });
    }

    return json({ success: false, message: "Method not allowed" }, 405);
  } catch (err) {
    console.error("Products error:", err);
    return json({ success: false, message: err.message || "Internal server error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
