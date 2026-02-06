import { createClient } from '@supabase/supabase-js';

// On récupère les clés API dans les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// On crée et on EXPORTE le client pour l'utiliser ailleurs
export const supabase = createClient(supabaseUrl, supabaseAnonKey);