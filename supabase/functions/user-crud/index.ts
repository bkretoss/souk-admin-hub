import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

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

    // GET /user-crud/:id
    if (req.method === "GET" && id) {
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return json({ success: true, data });
    }

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

      // Required field validation
      if (!body.first_name?.trim()) return json({ success: false, message: "First name is required" }, 400);
      if (body.first_name.trim().length < 2) return json({ success: false, message: "First name must be at least 2 characters" }, 400);
      if (!body.last_name?.trim()) return json({ success: false, message: "Last name is required" }, 400);
      if (body.last_name.trim().length < 2) return json({ success: false, message: "Last name must be at least 2 characters" }, 400);
      if (!body.email?.trim()) return json({ success: false, message: "Email is required" }, 400);
      if (!EMAIL_RE.test(body.email)) return json({ success: false, message: "Invalid email format" }, 400);
      if (!body.password) return json({ success: false, message: "Password is required" }, 400);
      if (body.password.length < 6) return json({ success: false, message: "Password must be at least 6 characters" }, 400);
      if (!body.role) return json({ success: false, message: "Role is required" }, 400);

      // Unique email check
      const { data: existing } = await client.from("profiles").select("id").eq("email", body.email.trim()).maybeSingle();
      if (existing) return json({ success: false, message: "Email already exists" }, 409);

      // Create auth user with password, then use their ID for the profile FK
      const { data: authData, error: authError } = await client.auth.admin.createUser({
        email: body.email.trim(),
        password: body.password,
        email_confirm: true,
      });
      if (authError) {
        if (authError.message?.toLowerCase().includes("already")) {
          return json({ success: false, message: "Email already exists" }, 409);
        }
        throw authError;
      }

      const { data, error } = await client
        .from("profiles")
        .insert({
          first_name: body.first_name.trim(),
          last_name: body.last_name.trim(),
          email: body.email.trim(),
          phone_number: body.phone_number ?? null,
          username: body.username ?? null,
          role: body.role ?? "user",
          date_of_birth: body.date_of_birth ?? null,
          country_code: body.country_code ?? null,
          gender: body.gender ?? null,
          user_id: authData.user.id,
          is_active: body.is_active ?? true,
        })
        .select()
        .single();

      if (error) {
        // Roll back the auth user if profile insert fails
        await client.auth.admin.deleteUser(authData.user.id).catch(() => {});
        throw error;
      }
      return json({ success: true, data }, 201);
    }

    // PUT /user-crud/:id
    if (req.method === "PUT" && id) {
      const body = await req.json();

      // Validate editable name fields if provided
      if (body.first_name !== undefined) {
        if (!body.first_name.trim()) return json({ success: false, message: "First name is required" }, 400);
        if (body.first_name.trim().length < 2) return json({ success: false, message: "First name must be at least 2 characters" }, 400);
      }
      if (body.last_name !== undefined) {
        if (!body.last_name.trim()) return json({ success: false, message: "Last name is required" }, 400);
        if (body.last_name.trim().length < 2) return json({ success: false, message: "Last name must be at least 2 characters" }, 400);
      }
      if (body.role !== undefined && !body.role) return json({ success: false, message: "Role is required" }, 400);

      // Optional password update
      if (body.password !== undefined) {
        if (body.password.length < 6) return json({ success: false, message: "Password must be at least 6 characters" }, 400);
        // Get user_id from profile
        const { data: profile } = await client.from("profiles").select("user_id").eq("id", id).single();
        if (profile?.user_id) {
          const { error: pwError } = await client.auth.admin.updateUserById(profile.user_id, { password: body.password });
          if (pwError) throw pwError;
        }
      }

      const allowed = ["first_name", "last_name", "phone_number", "username", "role", "gender", "is_active"];
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
