import { createClient } from '@supabase/supabase-js';

// Configuration Supabase - sécurisée car exécutée côté serveur uniquement
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

console.log('🔄 Fonction Netlify auth chargée');
console.log('📝 Configuration:', {
  hasSupabaseUrl: !!SUPABASE_URL,
  hasSupabaseKey: !!SUPABASE_ANON_KEY,
  supabaseUrlPrefix: SUPABASE_URL ? SUPABASE_URL.substring(0, 10) + '...' : 'non défini'
});

// Initialiser le client Supabase
const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

// Fonction pour générer un cookie sécurisé
const generateSecureCookie = (name, value, maxAge) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookie = `${name}=${value}; Path=/; HttpOnly; ${isProduction ? 'Secure; ' : ''}SameSite=Lax; Max-Age=${maxAge}`;
  console.log(`🍪 Génération du cookie ${name}: ${value ? 'valeur définie' : 'valeur vide'}, maxAge=${maxAge}`);
  return cookie;
};

export const handler = async (event) => {
  console.log('📥 Requête reçue:', {
    method: event.httpMethod,
    path: event.path,
    headers: Object.keys(event.headers),
    hasBody: !!event.body
  });

  // Gérer les requêtes OPTIONS (CORS)
  if (event.httpMethod === 'OPTIONS') {
    console.log('🔄 Traitement d\'une requête OPTIONS (CORS)');
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
  if (event.httpMethod === 'POST' && (event.path === '/.netlify/functions/auth/login' || event.path === '/api/auth/login')) {
    console.log('🔄 Requête POST reçue pour la connexion');
    console.log('📝 Headers reçus:', JSON.stringify(event.headers));
    console.log('📝 Path complet:', event.path);
    
    try {
      // Récupérer les données du formulaire
      const data = JSON.parse(event.body);
      console.log('📝 Données reçues complètes:', JSON.stringify(data));
      console.log('📝 Données reçues:', { 
        email: data.email ? `${data.email.substring(0, 3)}...` : 'non défini', 
        hasPassword: !!data.password,
        redirectTo: data.redirectTo || '/dashboard/'
      });
      
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
      console.log('🔄 Tentative de connexion avec Supabase...');
      console.log('📝 URL Supabase:', SUPABASE_URL ? 'Définie' : 'Non définie');
      console.log('📝 Clé Supabase:', SUPABASE_ANON_KEY ? 'Définie' : 'Non définie');
      
      try {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password
        });
        
        if (error) {
          console.error('❌ Erreur de connexion Supabase:', error.message);
          console.error('❌ Détails de l\'erreur:', JSON.stringify(error));
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
        
        // Connexion réussie, créer les cookies et rediriger
        console.log('✅ Connexion réussie pour:', authData.user.email);
        console.log('✅ Détails de la session:', JSON.stringify({
          userId: authData.user.id,
          email: authData.user.email,
          hasAccessToken: !!authData.session.access_token,
          hasRefreshToken: !!authData.session.refresh_token
        }));
        
        // Récupérer l'URL de redirection depuis les paramètres ou utiliser une valeur par défaut
        const redirectTo = data.redirectTo || '/dashboard/';
        console.log('🔄 Redirection vers:', redirectTo);
        
        // Créer les cookies pour stocker les tokens
        const accessTokenCookie = generateSecureCookie('sb-access-token', authData.session.access_token, 60 * 60 * 24 * 7);
        const refreshTokenCookie = generateSecureCookie('sb-refresh-token', authData.session.refresh_token, 60 * 60 * 24 * 7);
        
        // Déterminer si nous sommes en mode développement
        const isDevMode = process.env.NODE_ENV !== 'production';
        console.log(`🛠️ Mode: ${isDevMode ? 'DEV' : 'PROD'}`);
        
        // Adapter l'URL de redirection en fonction du mode
        // En mode DEV, rediriger vers /dashboard.html au lieu de /dashboard/
        let finalRedirectUrl = redirectTo;
        if (isDevMode && redirectTo === '/dashboard/') {
          finalRedirectUrl = '/dashboard.html';
          console.log(`🔄 Mode DEV: Redirection adaptée vers ${finalRedirectUrl}`);
        }
        
        console.log(`🎯 URL finale de redirection: ${finalRedirectUrl}`);
        console.log(`🍪 Cookies générés: ${accessTokenCookie.substring(0, 20)}... et ${refreshTokenCookie.substring(0, 20)}...`);
        
        // Revenir à une approche où le serveur définit les cookies et effectue la redirection
        // Mais en utilisant un tableau pour Set-Cookie pour définir correctement les cookies
        return {
          statusCode: 302,
          headers: {
            'Location': finalRedirectUrl,
            'Set-Cookie': [accessTokenCookie, refreshTokenCookie],
            'Cache-Control': 'no-cache'
          },
          body: ''
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
  if (event.httpMethod === 'GET' && (event.path === '/.netlify/functions/auth/logout' || event.path === '/api/auth/logout')) {
    console.log('🔄 Requête GET reçue pour la déconnexion, path:', event.path);
    
    try {
      // Déconnecter l'utilisateur de Supabase
      console.log('🔄 Déconnexion de Supabase...');
      await supabase.auth.signOut();
      console.log('✅ Déconnexion Supabase réussie');
      
      // Supprimer les cookies
      const clearAccessTokenCookie = generateSecureCookie('sb-access-token', '', 0);
      const clearRefreshTokenCookie = generateSecureCookie('sb-refresh-token', '', 0);
      
      // Rediriger vers la page de connexion
      console.log('➡️ Redirection vers la page de connexion');
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
  console.log('❌ Endpoint non trouvé:', event.path);
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