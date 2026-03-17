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
    const id = lastPart !== "order-crud" ? lastPart : null;

    const enrichWithBuyer = async (orders: any[]) => {
      if (!orders.length) return orders;
      const buyerIds = [...new Set(orders.map((o: any) => o.buyer_id))];
      const { data: profiles } = await client
        .from("profiles")
        .select("user_id, first_name, last_name, email")
        .in("user_id", buyerIds);
      const profileMap = Object.fromEntries((profiles ?? []).map((p: any) => [p.user_id, p]));
      return orders.map((o: any) => ({ ...o, profile: profileMap[o.buyer_id] ?? null }));
    };

    // GET /order-crud or GET /order-crud/:id

    if (req.method === "GET") {
      const { data, error } = await client
        .from("orders")
        .select("id, status, created_at, delivery_price, delivery_type, buyer_id, products!orders_product_id_fkey(title, price)")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const buyerIds = [...new Set((data ?? []).map((o: any) => o.buyer_id))];
      const { data: profiles } = await client
        .from("profiles")
        .select("user_id, first_name, last_name, email")
        .in("user_id", buyerIds);
      const profileMap = Object.fromEntries((profiles ?? []).map((p: any) => [p.user_id, p]));

      const mapped = (data ?? []).map((o: any) => ({
        id: o.id,
        status: o.status,
        created_at: o.created_at,
        delivery_price: o.delivery_price,
        delivery_type: o.delivery_type,
        product: o.products ? { name: o.products.title, price: o.products.price } : null,
        user: profileMap[o.buyer_id] ?? null,
      }));
      return json({ success: true, data: mapped, total: mapped.length });
    }

    // if (req.method === "GET") {
    //   if (id) {
    //     const { data, error } = await client.from("orders").select("status").eq("id", id).single();
    //     if (error) throw error;
    //     const [enriched] = await enrichWithBuyer([data]);
    //     return json({ success: true, data: enriched });
    //   }
    //   const { data, error } = await client.from("orders").select("status").order("created_at", { ascending: false });
    //   if (error) throw error;
    //   const enriched = await enrichWithBuyer(data ?? []);
    //   return json({ success: true, data: enriched, total: enriched.length });
    // }

    // POST /order-crud
    if (req.method === "POST") {
      const body = await req.json();
      const required = ["buyer_id", "seller_id", "product_id", "shipping_address"];
      for (const field of required) {
        if (!body[field]) return json({ success: false, message: `${field} is required` }, 400);
      }
      const { data, error } = await client
        .from("orders")
        .insert({
          buyer_id: body.buyer_id,
          seller_id: body.seller_id,
          product_id: body.product_id,
          shipping_address: body.shipping_address,
          delivery_type: body.delivery_type ?? "standard",
          delivery_price: body.delivery_price ?? 0,
          status: body.status ?? "pending",
        })
        .select()
        .single();
      if (error) throw error;
      return json({ success: true, data }, 201);
    }

    // PUT /order-crud/:id
    if (req.method === "PUT" && id) {
      const body = await req.json();
      const allowed = ["status", "delivery_type", "delivery_price", "shipping_address"];
      const updates: Record<string, unknown> = {};
      for (const key of allowed) {
        if (body[key] !== undefined) updates[key] = body[key];
      }
      if (Object.keys(updates).length === 0) return json({ success: false, message: "No valid fields to update" }, 400);
      const { data, error } = await client.from("orders").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return json({ success: true, data });
    }

    // DELETE /order-crud/:id
    if (req.method === "DELETE" && id) {
      const { error } = await client.from("orders").delete().eq("id", id);
      if (error) throw error;
      return json({ success: true });
    }

    return json({ success: false, message: "Method not allowed" }, 405);
  } catch (err) {
    console.error("Orders error:", err);
    return json({ success: false, message: err.message || "Internal server error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
