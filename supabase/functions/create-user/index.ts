import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Parse request body
    const { email, password, name, role, status, cargo_id, cpf, unidade } =
      await req.json()

    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    // 1. Create the user in Supabase Auth
    // This triggers the 'on_auth_user_created' trigger in Postgres which creates the initial profile in 'public.profiles'
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email for admin-created users
        user_metadata: { name }, // Pass name so trigger can use it
      })

    if (authError) throw authError
    if (!authData.user) throw new Error('User creation failed')

    const userId = authData.user.id

    // 2. Update the profile with additional details
    // We use 'update' because the trigger should have already inserted the row.
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        role: role || 'CONSULTA',
        status: status || 'PENDENTE',
        cargo_id,
        cpf,
        unidade,
        // We update name again just in case, or to ensure consistency if metadata wasn't used correctly
        name: name || authData.user.user_metadata.name,
      })
      .eq('id', userId)
      .select()
      .single()

    if (profileError) {
      // In the rare race condition where trigger hasn't fired yet (unlikely in same region),
      // or if trigger failed silently, we might get no row updated.
      // However, for this implementation we rely on the trigger.
      throw new Error(`Profile update failed: ${profileError.message}`)
    }

    return new Response(JSON.stringify(profileData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
