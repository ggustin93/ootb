import type { APIRoute } from 'astro';

/**
 * Endpoint API pour gérer les inscriptions à la newsletter
 * 
 * Cet endpoint permet d'envoyer directement les données à Brevo sans passer par n8n
 * Il suffit de configurer la variable d'environnement BREVO_API_KEY
 * 
 * === CONFIGURATION DES VARIABLES D'ENVIRONNEMENT ===
 * 
 * 1. Pour Netlify:
 *    - Allez dans l'interface Netlify > Site > Settings > Environment variables
 *    - Ajoutez une variable nommée BREVO_API_KEY avec votre clé API Brevo
 * 
 * 2. Pour le développement local:
 *    - Créez un fichier .env à la racine du projet
 *    - Ajoutez: BREVO_API_KEY=votre_clé_api_brevo
 *    - Assurez-vous que .env est dans .gitignore pour ne pas exposer votre clé
 * 
 * 3. Pour obtenir une clé API Brevo:
 *    - Connectez-vous à votre compte Brevo
 *    - Allez dans SMTP & API > API Keys > Generate a new API key
 *    - Copiez la clé générée
 * 
 * Note: Si la variable n'est pas configurée, l'API fonctionnera en mode test
 * et n'enverra pas réellement les données à Brevo.
 * 
 * IMPORTANT: n8n n'est PAS nécessaire avec cette implémentation.
 * Cette API remplace complètement le besoin d'utiliser n8n comme intermédiaire.
 */
export const post: APIRoute = async ({ request, redirect }) => {
  try {
    // Récupérer les données du formulaire
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const listId = formData.get('list_id') as string;
    const source = formData.get('source') as string;
    const tags = formData.get('tags') as string;
    const redirectUrl = formData.get('redirect_url') as string;
    
    // Vérifier que l'email est présent
    if (!email) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email requis'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Vérifier si la clé API Brevo est configurée
    const BREVO_API_KEY = import.meta.env.BREVO_API_KEY;
    if (!BREVO_API_KEY) {
      console.warn('BREVO_API_KEY non configurée, inscription non transmise à Brevo');
      
      // Rediriger même si l'API n'est pas configurée (pour les tests)
      if (redirectUrl) {
        return redirect(redirectUrl);
      }
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Inscription enregistrée (mode test)'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Préparer les données pour Brevo
    const brevoData: {
      email: string;
      attributes: Record<string, string | string[]>;
      listIds: number[];
      updateEnabled: boolean;
    } = {
      email,
      attributes: {
        SOURCE: source || 'website',
        INSCRIPTION_DATE: new Date().toISOString()
      },
      listIds: listId ? [parseInt(listId)] : [1],
      updateEnabled: true
    };
    
    // Ajouter les tags si présents
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      if (tagArray.length > 0) {
        brevoData.attributes.TAGS = tagArray.join(',');
      }
    }
    
    // Envoyer les données à Brevo
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify(brevoData)
    });
    
    // Vérifier la réponse de Brevo
    if (response.ok) {
      console.log('Contact ajouté à Brevo avec succès');
      
      // Rediriger vers la page de succès si spécifiée
      if (redirectUrl) {
        return redirect(redirectUrl);
      }
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Inscription enregistrée avec succès'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      // Gérer les erreurs de l'API Brevo
      const errorData = await response.json();
      console.error('Erreur Brevo:', errorData);
      
      // Si le contact existe déjà, considérer comme un succès
      if (response.status === 400 && errorData.code === 'duplicate_parameter') {
        if (redirectUrl) {
          return redirect(redirectUrl);
        }
        
        return new Response(JSON.stringify({
          success: true,
          message: 'Email déjà inscrit'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      
      return new Response(JSON.stringify({
        success: false,
        message: 'Erreur lors de l\'inscription',
        error: errorData
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('Erreur serveur:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Erreur serveur'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 