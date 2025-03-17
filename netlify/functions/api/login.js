import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Initialiser le client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const handler = async (event) => {
  console.log('🔄 API Login : Requête reçue', {
    method: event.httpMethod,
    path: event.path,
    headers: Object.keys(event.headers),
    host: event.headers.host
  });
  
  // Traiter uniquement les requêtes POST
  if (event.httpMethod !== 'POST') {
    console.log('❌ API Login : Méthode non autorisée', event.httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Méthode non autorisée' })
    };
  }

  try {
    // Récupérer les données de connexion
    const body = JSON.parse(event.body || '{}');
    const { email, password, redirectTo = '/dashboard/' } = body;
    
    console.log('📝 API Login : Données reçues', { 
      email: email ? email.substring(0, 3) + '...' : 'non défini',
      hasPassword: !!password,
      redirectTo
    });
    
    // Vérifier que les données sont présentes
    if (!email || !password) {
      console.log('❌ API Login : Données manquantes');
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Email et mot de passe requis' })
      };
    }
    
    // Connexion avec Supabase
    console.log('🔄 API Login : Tentative de connexion avec Supabase');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    // Gérer les erreurs de connexion
    if (error) {
      console.error('❌ API Login : Erreur connexion', error.message);
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Identifiants incorrects' })
      };
    }
    
    console.log('✅ API Login : Connexion réussie pour', data.user.email);
    
    // Déterminer si nous sommes en mode développement
    // Plusieurs méthodes pour détecter l'environnement
    const isLocalhost = event.headers.host && (
      event.headers.host.includes('localhost') || 
      event.headers.host.includes('127.0.0.1')
    );
    const isNetlifyDev = process.env.NETLIFY_DEV === 'true';
    const isNotProduction = process.env.NODE_ENV !== 'production';
    
    const isDevMode = isLocalhost || isNetlifyDev || isNotProduction;
    
    // Adapter l'URL de redirection selon l'environnement
    let finalRedirectUrl = redirectTo;
    
    if (isDevMode && redirectTo === '/dashboard/') {
      finalRedirectUrl = '/dashboard.html';
      console.log('🔄 API Login : Mode DEV détecté, redirection vers', finalRedirectUrl);
    } else {
      console.log('🔄 API Login : Redirection vers', finalRedirectUrl);
    }
    
    // Définir les cookies pour l'authentification
    // Utiliser des jetons plus courts pour éviter les problèmes de troncature
    const accessToken = data.session.access_token;
    const refreshToken = data.session.refresh_token;
    
    console.log('🍪 API Login : Génération cookies et redirection');
    
    return {
      statusCode: 302,
      headers: {
        'Location': finalRedirectUrl,
        'Set-Cookie': [
          `sb-access-token=${accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
          `sb-refresh-token=${refreshToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
        ],
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: ''
    };
  } catch (error) {
    console.error('❌ API Login : Erreur générale', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erreur serveur' })
    };
  }
}; 