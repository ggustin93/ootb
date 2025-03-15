import { createClient } from '@supabase/supabase-js';

// Configuration Supabase - sécurisée car exécutée côté serveur uniquement
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

console.log('🔄 Fonction Netlify auth chargée');
console.log('📝 Configuration:', {
  hasSupabaseUrl: !!SUPABASE_URL,
  hasSupabaseKey: !!SUPABASE_ANON_KEY
});

// Initialiser le client Supabase
const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

// Fonction pour générer un cookie sécurisé
const generateSecureCookie = (name, value, maxAge) => {
  const isProduction = process.env.NODE_ENV === 'production';
  return `${name}=${value}; Path=/; HttpOnly; ${isProduction ? 'Secure; ' : ''}SameSite=Lax; Max-Age=${maxAge}`;
};

export const handler = async (event) => {
  // Gérer les requêtes OPTIONS (CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  // Gérer les requêtes POST (connexion)
  if (event.httpMethod === 'POST' && event.path === '/.netlify/functions/auth/login') {
    console.log('🔄 Requête POST reçue pour la connexion');
    
    try {
      // Récupérer les données du formulaire
      const data = JSON.parse(event.body);
      console.log('📝 Données reçues:', { email: data.email, hasPassword: !!data.password });
      
      // Vérifier si les données essentielles sont présentes
      if (!data.email || !data.password) {
        console.error('❌ Données invalides: email ou mot de passe manquant');
        return {
          statusCode: 400,
          body: JSON.stringify({
            success: false,
            message: 'Email et mot de passe requis'
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        };
      }
      
      // Tenter de se connecter avec Supabase
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });
      
      if (error) {
        console.error('❌ Erreur de connexion:', error.message);
        return {
          statusCode: 401,
          body: JSON.stringify({
            success: false,
            message: 'Email ou mot de passe incorrect'
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        };
      }
      
      // Connexion réussie
      console.log('✅ Connexion réussie pour:', data.email);
      
      // Générer les cookies pour stocker les tokens
      const accessTokenCookie = generateSecureCookie(
        'sb-access-token', 
        authData.session.access_token, 
        60 * 60 * 24 * 7 // 1 semaine
      );
      
      const refreshTokenCookie = generateSecureCookie(
        'sb-refresh-token', 
        authData.session.refresh_token, 
        60 * 60 * 24 * 7 // 1 semaine
      );
      
      // Rediriger vers le tableau de bord
      return {
        statusCode: 302,
        headers: {
          'Location': '/dashboard',
          'Set-Cookie': [accessTokenCookie, refreshTokenCookie],
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          success: true,
          message: 'Connexion réussie'
        })
      };
    } catch (error) {
      console.error('❌ Erreur lors du traitement de la requête:', error);
      
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          message: `Erreur lors du traitement de la requête: ${error.message || 'Erreur inconnue'}`
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }
  }
  
  // Gérer les requêtes GET (déconnexion)
  if (event.httpMethod === 'GET' && event.path === '/.netlify/functions/auth/logout') {
    console.log('🔄 Requête GET reçue pour la déconnexion');
    
    try {
      // Déconnecter l'utilisateur de Supabase
      await supabase.auth.signOut();
      
      // Supprimer les cookies
      const clearAccessTokenCookie = generateSecureCookie('sb-access-token', '', 0);
      const clearRefreshTokenCookie = generateSecureCookie('sb-refresh-token', '', 0);
      
      // Rediriger vers la page de connexion
      return {
        statusCode: 302,
        headers: {
          'Location': '/login',
          'Set-Cookie': [clearAccessTokenCookie, clearRefreshTokenCookie],
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          success: true,
          message: 'Déconnexion réussie'
        })
      };
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          message: `Erreur lors de la déconnexion: ${error.message || 'Erreur inconnue'}`
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }
  }
  
  // Méthode ou chemin non supporté
  return {
    statusCode: 404,
    body: JSON.stringify({
      success: false,
      message: 'Endpoint non trouvé'
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  };
}; 