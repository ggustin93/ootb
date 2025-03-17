import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Initialiser le client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const handler = async (event) => {
  // Traiter uniquement les requêtes POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Méthode non autorisée' })
    };
  }

  try {
    // Récupérer les données de connexion
    const { email, password, redirectTo = '/dashboard/' } = JSON.parse(event.body);
    
    // Vérifier que les données sont présentes
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Email et mot de passe requis' })
      };
    }
    
    // Connexion avec Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    // Gérer les erreurs de connexion
    if (error) {
      console.error('Erreur de connexion:', error.message);
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Identifiants incorrects' })
      };
    }
    
    // Déterminer l'URL de redirection (dashboard.html en dev, dashboard/ en prod)
    const isDevMode = process.env.NODE_ENV !== 'production';
    const finalRedirectUrl = isDevMode && redirectTo === '/dashboard/' 
      ? '/dashboard.html' 
      : redirectTo;
    
    // Définir les cookies pour l'authentification
    const accessToken = data.session.access_token;
    const refreshToken = data.session.refresh_token;
    
    return {
      statusCode: 302,
      headers: {
        'Location': finalRedirectUrl,
        'Set-Cookie': [
          `sb-access-token=${accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
          `sb-refresh-token=${refreshToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
        ],
        'Cache-Control': 'no-cache'
      },
      body: ''
    };
  } catch (error) {
    console.error('Erreur:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erreur serveur' })
    };
  }
}; 