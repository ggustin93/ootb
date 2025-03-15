import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Initialiser le client Supabase
const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

// Fonction pour extraire les cookies d'une requête
const parseCookies = (cookieHeader) => {
  if (!cookieHeader) return {};
  
  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const [name, value] = cookie.trim().split('=').map(c => c.trim());
    cookies[name] = value;
    return cookies;
  }, {});
};

export const handler = async (event) => {
  // Vérifier si la route est protégée
  const path = event.path;
  
  if (path.startsWith('/dashboard')) {
    console.log('🔒 Route protégée détectée:', path);
    
    // Extraire les cookies
    const cookies = parseCookies(event.headers.cookie);
    const accessToken = cookies['sb-access-token'];
    const refreshToken = cookies['sb-refresh-token'];
    
    // Si aucun token n'est présent, rediriger vers la page de connexion
    if (!accessToken || !refreshToken) {
      console.log('❌ Aucun token trouvé, redirection vers la page de connexion');
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
      // Vérifier la validité du token avec Supabase
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        console.log('❌ Session invalide, redirection vers la page de connexion');
        
        // Supprimer les cookies
        const clearAccessTokenCookie = `sb-access-token=; Path=/; HttpOnly; Max-Age=0`;
        const clearRefreshTokenCookie = `sb-refresh-token=; Path=/; HttpOnly; Max-Age=0`;
        
        return {
          statusCode: 302,
          headers: {
            'Location': '/login',
            'Set-Cookie': [clearAccessTokenCookie, clearRefreshTokenCookie],
            'Cache-Control': 'no-cache'
          },
          body: ''
        };
      }
      
      // Session valide, continuer
      console.log('✅ Session valide, accès autorisé');
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de la session:', error);
      
      return {
        statusCode: 302,
        headers: {
          'Location': '/login?error=auth_error',
          'Cache-Control': 'no-cache'
        },
        body: ''
      };
    }
  }
  
  // Continuer vers la route demandée
  return {
    statusCode: 200,
    body: ''
  };
}; 