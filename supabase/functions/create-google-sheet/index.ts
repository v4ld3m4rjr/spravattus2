import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  // Manual authentication handling (since verify_jwt is false)
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Unauthorized', { 
      status: 401, 
      headers: corsHeaders 
    })
  }

  // Inicializar o cliente Supabase dentro da Edge Function
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  )

  // Obter o ID do usuário autenticado
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error("[create-google-sheet] Error getting user:", userError?.message);
    return new Response(JSON.stringify({ error: 'Unauthorized: Could not retrieve user' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  console.log("[create-google-sheet] User authenticated:", user.id);

  // Lógica para interagir com a API do Google Sheets virá aqui
  // Por enquanto, apenas um placeholder
  return new Response(JSON.stringify({ message: "Hello from Edge Function! Google Sheet creation logic will go here." }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})