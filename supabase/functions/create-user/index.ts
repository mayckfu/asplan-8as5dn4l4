import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

export const onRequest = async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Create a Supabase client with the Auth context of the caller
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      },
    )

    // 2. Check if the caller is logged in
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // 3. Check if the caller is an ADMIN by querying the profiles table
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: 'Forbidden: Admins only' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // 4. Parse the request body
    const {
      email,
      password,
      name,
      cpf,
      role,
      cargo_id,
      unidade,
      status,
      email_confirm,
    } = await req.json()

    if (!email || !password || !name || !role) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields (email, password, name, role)',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    // 5. Initialize Supabase Admin client (Service Role) for privileged operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // 6. Create the User in Supabase Auth
    const { data: authData, error: createUserError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: email_confirm ?? true,
        user_metadata: {
          name,
          role, // Storing role in metadata is good practice for triggers/JWT
        },
      })

    if (createUserError) {
      return new Response(JSON.stringify({ error: createUserError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (!authData.user) {
      return new Response(JSON.stringify({ error: 'Failed to create user' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const newUserId = authData.user.id

    // 7. Create the Profile record in the profiles table
    const { data: newProfile, error: createProfileError } = await supabaseAdmin
      .from('profiles')
      .insert([
        {
          id: newUserId,
          email,
          name,
          cpf,
          role,
          cargo_id,
          unidade,
          status: status || 'ATIVO',
        },
      ])
      .select()
      .single()

    if (createProfileError) {
      // If profile creation fails, we should ideally rollback auth creation
      // For now, we return the error
      console.error('Error creating profile:', createProfileError)

      // Attempt cleanup (optional but recommended)
      await supabaseAdmin.auth.admin.deleteUser(newUserId)

      return new Response(
        JSON.stringify({
          error: `User created but profile failed: ${createProfileError.message}`,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    // 8. Return the created profile data
    return new Response(JSON.stringify(newProfile), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}
