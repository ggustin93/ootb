import { createClient } from '@supabase/supabase-js';

// Vérifier que les variables d'environnement sont définies
const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Les variables d\'environnement SUPABASE_URL et SUPABASE_ANON_KEY doivent être définies');
}

// Créer le client Supabase avec gestion d'erreur
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
); 