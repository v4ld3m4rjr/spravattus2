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
    console.error("[delete-google-sheet] Error getting user:", userError?.message);
    return new Response(JSON.stringify({ error: 'Unauthorized: Could not retrieve user' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  console.log("[delete-google-sheet] User authenticated:", user.id);

  try {
    const { sheetId, userSheetId } = await req.json(); // Espera sheetId do Google e userSheetId do Supabase

    if (!sheetId || !userSheetId) {
      return new Response(JSON.stringify({ error: 'Sheet ID and User Sheet ID are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    if (!GOOGLE_API_KEY) {
      console.error("[delete-google-sheet] GOOGLE_API_KEY is not set.");
      return new Response(JSON.stringify({ error: 'Server configuration error: Google API Key missing.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Deletar Planilha do Google
    console.log(`[delete-google-sheet] Attempting to delete Google Sheet: ${sheetId}`);
    const deleteSheetResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${GOOGLE_API_KEY}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!deleteSheetResponse.ok) {
      const errorData = await deleteSheetResponse.json();
      console.error("[delete-google-sheet] Error deleting Google Sheet:", errorData);
      // Se a planilha já não existir, ainda podemos prosseguir para deletar do Supabase
      if (deleteSheetResponse.status !== 404) { // 404 Not Found é aceitável, significa que já foi deletada
        return new Response(JSON.stringify({ error: `Failed to delete Google Sheet: ${errorData.error.message}` }), {
          status: deleteSheetResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.warn(`[delete-google-sheet] Google Sheet ${sheetId} not found or already deleted, proceeding to delete from Supabase.`);
    } else {
      console.log(`[delete-google-sheet] Google Sheet deleted: ${sheetId}`);
    }

    // 2. Deletar da tabela user_sheets do Supabase
    const { error: dbError } = await supabase
      .from('user_sheets')
      .delete()
      .eq('id', userSheetId)
      .eq('user_id', user.id); // Garantir que o usuário só pode deletar suas próprias planilhas

    if (dbError) {
      console.error("[delete-google-sheet] Error deleting sheet from Supabase:", dbError.message);
      return new Response(JSON.stringify({ error: `Failed to remove sheet details from database: ${dbError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      message: "Google Sheet and database entry deleted successfully!"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("[delete-google-sheet] Unexpected error:", error.message);
    return new Response(JSON.stringify({ error: `An unexpected error occurred: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});