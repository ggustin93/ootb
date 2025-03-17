import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Initialiser le client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const handler = async (event) => {
  // Traiter uniquement les requêtes GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Méthode non autorisée' })
    };
  }

  try {
    // Déconnecter l'utilisateur
    await supabase.auth.signOut();
    
    // Supprimer les cookies
    return {
      statusCode: 302,
      headers: {
        'Location': '/login',
        'Set-Cookie': [
          'sb-access-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
          'sb-refresh-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
        ],
        'Cache-Control': 'no-cache'
      },
      body: ''
    };
  } catch (error) {
    console.error('Erreur de déconnexion:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erreur serveur' })
    };
  }
}; 