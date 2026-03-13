import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Check if admin already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers()
    const adminExists = existingUsers?.users?.some(u => u.email === 'admin@soukit.com')

    if (adminExists) {
      // Find the user and ensure they have admin role
      const adminUser = existingUsers?.users?.find(u => u.email === 'admin@soukit.com')
      if (adminUser) {
        const { data: existingRole } = await adminClient
          .from('user_roles')
          .select('id')
          .eq('user_id', adminUser.id)
          .eq('role', 'admin')
          .maybeSingle()

        if (!existingRole) {
          await adminClient.from('user_roles').insert({
            user_id: adminUser.id,
            role: 'admin'
          })
        }
      }
      return new Response(JSON.stringify({ message: 'Admin user already exists' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create admin user
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: 'admin@soukit.com',
      password: 'Admin@123',
      email_confirm: true,
      user_metadata: {
        first_name: 'Admin',
        last_name: 'Souk IT',
        date_of_birth: '1990-01-01',
        country_code: '+1',
        phone_number: '0000000000',
      }
    })

    if (createError) throw createError

    // Assign admin role
    if (newUser?.user) {
      await adminClient.from('user_roles').insert({
        user_id: newUser.user.id,
        role: 'admin'
      })
    }

    return new Response(JSON.stringify({ message: 'Admin user created successfully', userId: newUser?.user?.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
