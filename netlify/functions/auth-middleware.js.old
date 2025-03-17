import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Initialiser le client Supabase
const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

// Fonction pour extraire les cookies d'une requête
const parseCookies = (cookieHeader) => {
  if (!cookieHeader) {
    console.log('❌ Aucun cookie trouvé dans les headers');
    return {};
  }
  
  console.log('🍪 Headers de cookies reçus:', cookieHeader);
  
  // Diviser les cookies par point-virgule
  const cookies = {};
  const cookieParts = cookieHeader.split(';');
  
  console.log(`🍪 Nombre de parties de cookies: ${cookieParts.length}`);
  
  cookieParts.forEach((part, index) => {
    const [name, value] = part.trim().split('=').map(c => c.trim());
    if (name && value) {
      cookies[name] = value;
      console.log(`🍪 Cookie #${index + 1}: ${name}=${value.substring(0, 10)}...`);
    } else {
      console.log(`⚠️ Partie de cookie invalide #${index + 1}: "${part}"`);
    }
  });
  
  console.log('🍪 Cookies extraits:', Object.keys(cookies));
  
  return cookies;
};

export const handler = async (event) => {
  try {
    // Récupérer le chemin demandé
    const path = event.path;
    console.log(`🔒 Middleware d'authentification pour: ${path}`);
    
    // Vérifier si la requête a déjà le header X-Bypass-Auth
    // Si oui, laisser passer sans vérification pour éviter les boucles
    if (event.headers['x-bypass-auth'] === 'true') {
      console.log("🔓 Bypass d'authentification détecté, accès autorisé");
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: "Bypass d'authentification, accès autorisé" 
        })
      };
    }
    
    // Récupérer les cookies
    const cookies = event.headers.cookie || '';
    const accessToken = parseCookies(cookies)['sb-access-token'];
    const refreshToken = parseCookies(cookies)['sb-refresh-token'];
    
    console.log('🔑 Tokens trouvés:', { 
      accessToken: accessToken ? '✅ Présent' : '❌ Absent',
      refreshToken: refreshToken ? '✅ Présent' : '❌ Absent',
      path: path,
      headers: Object.keys(event.headers)
    });
    
    // Déterminer si nous sommes en mode développement
    const isDevMode = process.env.NODE_ENV !== 'production';
    console.log(`🛠️ Mode: ${isDevMode ? 'DEV' : 'PROD'}`);
    
    // En mode DEV, accepter les tokens fake pour faciliter les tests
    if (isDevMode && accessToken === 'fake-token' && refreshToken === 'fake-token') {
      console.log('🧪 Mode DEV: Tokens fake acceptés pour les tests');
      
      // Si l'utilisateur est déjà sur /dashboard/ ou /dashboard/index.html, ne pas rediriger
      if (path === '/dashboard/' || path === '/dashboard/index.html') {
        console.log('🔄 Déjà sur page dashboard, pas de redirection pour éviter une boucle');
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache'
          },
          body: '' // Le corps vide permet à Netlify de servir le contenu original
        };
      }
      
      // Sinon, laisser Netlify servir la page directement
      console.log(`🔄 Mode DEV avec tokens fake: Redirection vers dashboard.html`);
      return {
        statusCode: 302,
        headers: {
          'Location': '/dashboard.html',
          'Cache-Control': 'no-cache',
          'X-Bypass-Auth': 'true'  // Ajouter ce header pour éviter les boucles
        },
        body: ''
      };
    }
    
    // Si aucun token n'est présent, rediriger vers la page de connexion
    if (!accessToken || !refreshToken || accessToken === 'undefined' || refreshToken === 'undefined' || accessToken === '' || refreshToken === '') {
      console.log('❌ Tokens invalides ou absents, redirection vers la page de connexion');
      return {
        statusCode: 302,
        headers: {
          'Location': '/login?error=auth_required',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: ''
      };
    }
    
    try {
      // Définir les tokens dans le client Supabase
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      if (sessionError) {
        console.log('❌ Erreur lors de la définition de la session:', sessionError.message);
        // Supprimer les cookies invalides
        const clearAccessTokenCookie = `sb-access-token=; Path=/; HttpOnly; Max-Age=0`;
        const clearRefreshTokenCookie = `sb-refresh-token=; Path=/; HttpOnly; Max-Age=0`;
        
        return {
          statusCode: 302,
          headers: {
            'Location': '/login?error=session_expired',
            'Set-Cookie': [clearAccessTokenCookie, clearRefreshTokenCookie],
            'Cache-Control': 'no-cache'
          },
          body: ''
        };
      }
      
      // Vérifier la validité du token avec Supabase
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data.user) {
        console.log('❌ Utilisateur non authentifié:', error?.message);
        
        // Supprimer les cookies
        const clearAccessTokenCookie = `sb-access-token=; Path=/; HttpOnly; Max-Age=0`;
        const clearRefreshTokenCookie = `sb-refresh-token=; Path=/; HttpOnly; Max-Age=0`;
        
        return {
          statusCode: 302,
          headers: {
            'Location': '/login?error=auth_error',
            'Set-Cookie': [clearAccessTokenCookie, clearRefreshTokenCookie],
            'Cache-Control': 'no-cache'
          },
          body: ''
        };
      }
      
      // Session valide, continuer vers la page protégée
      console.log('✅ Session valide pour:', data.user.email);
      console.log('🔍 Détails de la session:', {
        userId: data.user.id,
        email: data.user.email,
        path: path
      });
      
      // Éviter la redirection si on est déjà sur /dashboard/ pour éviter les boucles infinies
      if (path === '/dashboard/' || path === '/dashboard/index.html') {
        console.log('🔄 Déjà sur page dashboard, pas de redirection pour éviter une boucle');
        
        // Au lieu de rediriger, on laisse passer la requête
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache'
          },
          body: '' // Le corps vide permet à Netlify de servir le contenu original
        };
      }
      
      // L'utilisateur est authentifié mais n'est pas encore sur une page dashboard
      // On le redirige vers le dashboard directement
      console.log('🔄 Utilisateur authentifié, redirection vers le dashboard');
      
      // Déterminer le chemin de redirection
      const isDevMode = process.env.NODE_ENV !== 'production';
      console.log(`🛠️ Mode: ${isDevMode ? 'DEV' : 'PROD'}`);
      
      // Si l'utilisateur essaie d'accéder à une sous-page spécifique du dashboard
      if (path.startsWith('/dashboard/') && path !== '/dashboard/' && path !== '/dashboard/index.html') {
        // On préserve cette sous-page dans la redirection
        console.log(`🔍 Accès à une sous-page du dashboard: ${path}`);
        return {
          statusCode: 302,
          headers: {
            'Location': path,
            'Cache-Control': 'no-cache',
            'X-Bypass-Auth': 'true'  // Ajouter ce header pour éviter les boucles
          },
          body: ''
        };
      }
      
      // Sinon, redirection vers la page principale du dashboard
      const basePath = '/dashboard/';
      
      // Logique adaptée selon l'environnement
      if (isDevMode) {
        // En mode DEV, rediriger vers /dashboard/ qui sera servi par Astro
        console.log(`🔄 Mode DEV: Redirection vers ${basePath}`);
        return {
          statusCode: 302,
          headers: {
            'Location': basePath,
            'Cache-Control': 'no-cache',
            'X-Bypass-Auth': 'true'
          },
          body: ''
        };
      } else {
        // En mode PROD, rediriger vers /dashboard/index.html
        const redirectPath = `${basePath}index.html`;
        console.log(`🎯 Mode PROD: Redirection vers ${redirectPath}`);
        
        return {
          statusCode: 302,
          headers: {
            'Location': redirectPath,
            'Cache-Control': 'no-cache',
            'X-Bypass-Auth': 'true'
          },
          body: ''
        };
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la vérification:', error);
      
      return {
        statusCode: 302,
        headers: {
          'Location': '/login?error=auth_error',
          'Cache-Control': 'no-cache'
        },
        body: ''
      };
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    
    return {
      statusCode: 302,
      headers: {
        'Location': '/login?error=auth_error',
        'Cache-Control': 'no-cache'
      },
      body: ''
    };
  }
}; 