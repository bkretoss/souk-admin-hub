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
    const id = lastPart !== "user-crud" ? lastPart : null;

    // GET /user-crud
    if (req.method === "GET") {
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .neq("role", "admin")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return json({ success: true, data: data ?? [], total: data?.length ?? 0 });
    }

    // POST /user-crud
    if (req.method === "POST") {
      const body = await req.json();
      const required = ["first_name", "last_name", "email", "phone_number", "date_of_birth", "country_code"];
      for (const field of required) {
        if (!body[field]) return json({ success: false, message: `${field} is required` }, 400);
      }
      const { data, error } = await client
        .from("profiles")
        .insert({
          first_name: body.first_name,
          last_name: body.last_name,
          email: body.email,
          phone_number: body.phone_number,
          username: body.username ?? null,
          role: body.role ?? "user",
          date_of_birth: body.date_of_birth,
          country_code: body.country_code,
          gender: body.gender ?? null,
          user_id: crypto.randomUUID(),
        })
        .select()
        .single();
      if (error) throw error;
      return json({ success: true, data }, 201);
    }

    // PUT /user-crud/:id
    if (req.method === "PUT" && id) {
      const body = await req.json();
      const allowed = ["first_name", "last_name", "phone_number", "username", "role", "gender"];
      const updates: Record<string, unknown> = {};
      for (const key of allowed) {
        if (body[key] !== undefined) updates[key] = body[key];
      }
      if (Object.keys(updates).length === 0) return json({ success: false, message: "No valid fields to update" }, 400);
      const { data, error } = await client.from("profiles").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return json({ success: true, data });
    }

    // DELETE /user-crud/:id
    if (req.method === "DELETE" && id) {
      const { error } = await client.from("profiles").delete().eq("id", id);
      if (error) throw error;
      return json({ success: true });
    }

    return json({ success: false, message: "Method not allowed" }, 405);
  } catch (err) {
    console.error("User error:", err);
    return json({ success: false, message: err.message || "Internal server error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
