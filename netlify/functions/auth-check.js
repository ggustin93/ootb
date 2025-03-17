import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Initialiser le client Supabase
const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

export const handler = async (event) => {
  // Récupérer le cookie d'authentification
  const cookies = event.headers.cookie || '';
  const accessToken = cookies.match(/sb-access-token=([^;]+)/)?.[1];
  
  console.log('🔒 Vérification d\'authentification pour:', event.path);
  console.log('🍪 Token trouvé:', accessToken ? '✅ Présent' : '❌ Absent');
  
  // Si pas de token, rediriger vers login
  if (!accessToken) {
    console.log('❌ Aucun token, redirection vers login');
    return {
      statusCode: 302,
      headers: { 
        'Location': '/login',
        'Cache-Control': 'no-cache'
      },
      body: ''
    };
  }
  
  try {
    // Vérifier le token avec Supabase
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) {
      console.log('❌ Token invalide:', error?.message);
      return {
        statusCode: 302,
        headers: { 
          'Location': '/login',
          'Cache-Control': 'no-cache'
        },
        body: ''
      };
    }
    
    // Utilisateur authentifié, permettre l'accès
    console.log('✅ Utilisateur authentifié:', data.user.email);
    
    // Retourner le status 200 pour permettre l'accès
    return {
      statusCode: 200,
      body: ''
    };
  } catch (error) {
    console.log('❌ Erreur lors de la vérification:', error);
    return {
      statusCode: 302,
      headers: { 
        'Location': '/login',
        'Cache-Control': 'no-cache'
      },
      body: ''
    };
  }
}; 