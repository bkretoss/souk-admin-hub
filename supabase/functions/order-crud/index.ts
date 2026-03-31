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

    // GET /order-crud or GET /order-crud/:id or GET /order-crud?user_id=...

    if (req.method === "GET") {
      // Fetch single order by ID
      if (id) {
        const { data: orderData, error: orderError } = await client
          .from("orders")
          .select("id, status, created_at, updated_at, delivery_price, delivery_type, buyer_id, seller_id, product_id, shipping_address, products!orders_product_id_fkey(id, title, price, description)")
          .eq("id", id)
          .single();

        if (orderError) {
          if (orderError.code === "PGRST116") {
            return json({ success: false, message: "Order not found" }, 404);
          }
          throw orderError;
        }

        // Fetch buyer profile
        const { data: buyerProfile } = await client
          .from("profiles")
          .select("user_id, first_name, last_name, email, phone_number, created_at, is_active")
          .eq("user_id", orderData.buyer_id)
          .single();

        // Format the response
        const formattedOrder = {
          id: orderData.id,
          status: orderData.status,
          created_at: orderData.created_at,
          updated_at: orderData.updated_at,
          delivery_price: orderData.delivery_price,
          delivery_type: orderData.delivery_type,
          buyer_id: orderData.buyer_id,
          seller_id: orderData.seller_id,
          product_id: orderData.product_id,
          shipping_address: orderData.shipping_address,
          product: orderData.products ? {
            id: orderData.products.id,
            name: orderData.products.title,
            price: orderData.products.price,
            description: orderData.products.description,
          } : null,
          buyer: buyerProfile ? {
            user_id: buyerProfile.user_id,
            first_name: buyerProfile.first_name,
            last_name: buyerProfile.last_name,
            email: buyerProfile.email,
            phone_number: buyerProfile.phone_number,
            created_at: buyerProfile.created_at,
            is_active: buyerProfile.is_active,
          } : null,
        };

        return json({ success: true, data: formattedOrder });
      }

      // Fetch orders filtered by user or all orders
      const userId = url.searchParams.get("user_id");
      const sellerId = url.searchParams.get("seller_id");
      const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
      const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "10")));
      const offset = (page - 1) * limit;

      let countQuery = client.from("orders").select("id", { count: "exact", head: true });
      let dataQuery = client
        .from("orders")
        .select("id, status, created_at, delivery_price, delivery_type, buyer_id, seller_id, products!orders_product_id_fkey(title, price)")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (userId) { countQuery = countQuery.eq("buyer_id", userId); dataQuery = dataQuery.eq("buyer_id", userId); }
      if (sellerId) { countQuery = countQuery.eq("seller_id", sellerId); dataQuery = dataQuery.eq("seller_id", sellerId); }

      const [{ count }, { data, error }] = await Promise.all([countQuery, dataQuery]);
      if (error) throw error;

      // Fetch all unique buyer and seller IDs
      const buyerIds = [...new Set((data ?? []).map((o: any) => o.buyer_id))];
      const sellerIds = [...new Set((data ?? []).map((o: any) => o.seller_id))];
      const allProfileIds = [...new Set([...buyerIds, ...sellerIds])];

      const profileMap: Record<string, any> = {};
      if (allProfileIds.length) {
        const { data: profiles } = await client
          .from("profiles")
          .select("user_id, first_name, last_name, email")
          .in("user_id", allProfileIds);
        (profiles ?? []).forEach((p: any) => { profileMap[p.user_id] = p; });
      }

      const mapped = (data ?? []).map((o: any) => ({
        id: o.id,
        status: o.status,
        created_at: o.created_at,
        delivery_price: o.delivery_price,
        delivery_type: o.delivery_type,
        buyer_id: o.buyer_id,
        seller_id: o.seller_id,
        product: o.products ? { name: o.products.title, price: o.products.price } : null,
        buyer: profileMap[o.buyer_id] ?? null,
        seller: profileMap[o.seller_id] ?? null,
      }));
      return json({ success: true, data: mapped, total: count ?? 0 });
    }

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
