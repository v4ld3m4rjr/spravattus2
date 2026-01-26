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
  
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Unauthorized', { 
      status: 401, 
      headers: corsHeaders 
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error("[create-google-sheet] Error getting user:", userError?.message);
    return new Response(JSON.stringify({ error: 'Unauthorized: Could not retrieve user' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  console.log("[create-google-sheet] User authenticated:", user.id);

  try {
    const { sheetName } = await req.json(); // Espera sheetName do cliente

    if (!sheetName) {
      return new Response(JSON.stringify({ error: 'Sheet name is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    if (!GOOGLE_API_KEY) {
      console.error("[create-google-sheet] GOOGLE_API_KEY is not set.");
      return new Response(JSON.stringify({ error: 'Server configuration error: Google API Key missing.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Criar Planilha do Google
    const createSheetResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: sheetName,
        },
      }),
    });

    if (!createSheetResponse.ok) {
      const errorData = await createSheetResponse.json();
      console.error("[create-google-sheet] Error creating Google Sheet:", errorData);
      return new Response(JSON.stringify({ error: `Failed to create Google Sheet: ${errorData.error.message}` }), {
        status: createSheetResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sheetData = await createSheetResponse.json();
    const spreadsheetId = sheetData.spreadsheetId;
    const spreadsheetUrl = sheetData.spreadsheetUrl;
    console.log(`[create-google-sheet] Google Sheet created: ${spreadsheetId}`);

    // 2. Inserir na tabela user_sheets do Supabase
    const { data, error: dbError } = await supabase
      .from('user_sheets')
      .insert([
        { user_id: user.id, sheet_id: spreadsheetId, sheet_name: sheetName }
      ])
      .select();

    if (dbError) {
      console.error("[create-google-sheet] Error inserting sheet into Supabase:", dbError.message);
      // Opcionalmente, tentar deletar a Planilha do Google criada se a inserção no DB falhar
      return new Response(JSON.stringify({ error: `Failed to save sheet details: ${dbError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      message: "Google Sheet created and saved successfully!", 
      spreadsheetId, 
      spreadsheetUrl,
      userSheetId: data[0].id // Retorna o ID da nossa tabela user_sheets
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("[create-google-sheet] Unexpected error:", error.message);
    return new Response(JSON.stringify({ error: `An unexpected error occurred: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});