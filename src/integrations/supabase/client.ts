// Este arquivo é gerado automaticamente. Não o edite diretamente.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ficxxugpqfvhbsjuuixe.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpY3h4dWdwcWZ2aGJzanV1aXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NzMxOTgsImV4cCI6MjA4NDM0OTE5OH0.CTtwTRCmDgAyvAWPII2SjxHx5ZIxGEUobmxx6aHIwUM";

// Importe o cliente supabase assim:
// import { supabase } from "@/src/integrations/supabase/client";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);