import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL ou Clé Anon manquante. Le client Supabase ne sera pas initialisé correctement.');
}

// On exporte le client uniquement si les variables sont là, sinon on exporte un objet vide ou null
// pour éviter que Vercel ne crash pendant la phase de "prerender" (compilation).
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {} as any; // Trick pour ne pas bloquer la compilation

