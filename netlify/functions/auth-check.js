import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Initialiser le client Supabase
const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

export const handler = async (event) => {
  console.log('🔒 Auth-Check : Requête reçue', {
    method: event.httpMethod,
    path: event.path,
    host: event.headers.host,
    cookies: event.headers.cookie ? 'présent' : 'absent'
  });
  
  // Récupérer le cookie d'authentification
  const cookies = event.headers.cookie || '';
  const accessToken = cookies.match(/sb-access-token=([^;]+)/)?.[1];
  const refreshToken = cookies.match(/sb-refresh-token=([^;]+)/)?.[1];
  
  console.log('🍪 Auth-Check : Tokens trouvés:', {
    accessToken: accessToken ? '✅ Présent' : '❌ Absent',
    refreshToken: refreshToken ? '✅ Présent' : '❌ Absent'
  });
  
  // Si pas de token, rediriger vers login
  if (!accessToken) {
    console.log('❌ Auth-Check : Aucun token d\'accès, redirection vers login');
    return {
      statusCode: 302,
      headers: { 
        'Location': '/login?error=auth_required',
        'Cache-Control': 'no-cache'
      },
      body: ''
    };
  }
  
  try {
    // 1. Définir la session explicitement si nous avons les deux tokens
    if (refreshToken) {
      console.log('🔄 Auth-Check : Tentative de définition explicite de la session');
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      if (sessionError) {
        console.log('❌ Auth-Check : Erreur lors de la définition de la session:', sessionError.message);
        return {
          statusCode: 302,
          headers: { 
            'Location': '/login?error=session_expired',
            'Cache-Control': 'no-cache'
          },
          body: ''
        };
      }
      console.log('✅ Auth-Check : Session définie avec succès');
    }
    
    // 2. Vérifier le token avec getUser() en passant explicitement le token
    console.log('🔄 Auth-Check : Vérification du token utilisateur');
    const { data, error } = await supabase.auth.getUser(accessToken);
    
    if (error) {
      console.log('❌ Auth-Check : Erreur vérification token:', error.message);
      return {
        statusCode: 302,
        headers: { 
          'Location': '/login?error=invalid_token',
          'Cache-Control': 'no-cache'
        },
        body: ''
      };
    }
    
    if (!data || !data.user) {
      console.log('❌ Auth-Check : Aucun utilisateur trouvé');
      return {
        statusCode: 302,
        headers: { 
          'Location': '/login?error=user_not_found',
          'Cache-Control': 'no-cache'
        },
        body: ''
      };
    }
    
    // Utilisateur authentifié, permettre l'accès
    console.log('✅ Auth-Check : Utilisateur authentifié:', data.user.email);
    
    // Retourner le status 200 pour permettre l'accès
    return {
      statusCode: 200,
      body: ''
    };
  } catch (error) {
    console.log('❌ Auth-Check : Erreur générale:', error);
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