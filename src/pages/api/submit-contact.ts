import type { APIRoute } from 'astro';
import { Api } from 'nocodb-sdk';

// Forcer le rendu côté serveur
export const prerender = false;

// Configuration NocoDB - sécurisée car exécutée côté serveur uniquement
const NOCODB_BASE_URL = import.meta.env.NOCODB_BASE_URL || 'https://app.nocodb.com';
const NOCODB_API_TOKEN = import.meta.env.NOCODB_API_TOKEN;
const NOCODB_ORG_ID = import.meta.env.NOCODB_ORG_ID || 'noco';
const NOCODB_PROJECT_ID = import.meta.env.NOCODB_PROJECT_ID || 'pn7128r4idyluf0';
const NOCODB_TABLE_ID = import.meta.env.NOCODB_TABLE_ID || 'mza30wqm38wsmib';

console.log('🔄 API endpoint submit-contact chargé');
console.log('📝 Configuration:', {
  NOCODB_BASE_URL,
  hasToken: !!NOCODB_API_TOKEN,
  NOCODB_ORG_ID,
  NOCODB_PROJECT_ID,
  NOCODB_TABLE_ID
});

// Initialiser l'API NocoDB
const initNocoDBApi = () => {
  console.log('🔄 Initialisation de l\'API NocoDB...');
  
  if (!NOCODB_API_TOKEN) {
    console.error('❌ Token API NocoDB manquant');
    return null;
  }
  
  try {
    const api = new Api({
      baseURL: NOCODB_BASE_URL,
      headers: {
        'xc-token': NOCODB_API_TOKEN
      }
    });
    
    console.log('✅ API NocoDB initialisée avec succès');
    return api;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de l\'API NocoDB:', error);
    return null;
  }
};

// Définir une interface pour les erreurs
interface ApiError extends Error {
  response?: {
    status?: number;
    data?: {
      msg?: string;
    };
  };
}

// Route GET pour tester la connexion et récupérer la structure
export const GET: APIRoute = async () => {
  console.log('🔄 Requête GET reçue à /api/submit-contact (test)');
  
  try {
    // Vérifier si nous sommes en mode test
    const isTestMode = !NOCODB_API_TOKEN || NOCODB_API_TOKEN.trim() === '';
    console.log(`🔍 Mode détecté: ${isTestMode ? 'TEST' : 'PRODUCTION'}`);
    
    if (isTestMode) {
      console.log('🧪 Mode TEST: simulation de la structure');
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Mode test activé. Voici la structure attendue:',
          expectedStructure: {
            Objet: "Sujet du message",
            Message: "Contenu du message",
            Auteur: "adresse@email.com",
            Statut: "En attente de réponse"
          },
          isTestMode: true
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Mode production - tester la connexion à NocoDB
    console.log('🚀 Mode PRODUCTION: test de connexion à NocoDB');
    
    // Initialiser l'API NocoDB
    const api = initNocoDBApi();
    if (!api) {
      console.error('❌ Échec de l\'initialisation de l\'API NocoDB');
      
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Échec de connexion à NocoDB. Vérifiez les variables d\'environnement.',
          error: 'API NocoDB non initialisée'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    try {
      console.log('🔄 Récupération d\'un exemple de données depuis NocoDB...');
      
      // Récupérer un exemple de ligne pour comprendre la structure
      const result = await api.dbTableRow.list(
        NOCODB_ORG_ID,
        NOCODB_PROJECT_ID,
        NOCODB_TABLE_ID,
        { limit: 1 }
      );
      
      console.log('✅ Récupération réussie depuis NocoDB:', result);
      
      // Créer un exemple de structure basé sur les données réelles
      const exampleStructure = {
        Objet: "Sujet du message",
        Message: "Contenu du message",
        Auteur: "adresse@email.com",
        Statut: "En attente de réponse"
      };
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Connexion à NocoDB réussie. Voici la structure attendue et un exemple de données:',
          expectedStructure: exampleStructure,
          sampleData: result.list && result.list.length > 0 ? result.list[0] : null,
          tableStructure: result.list && result.list.length > 0 ? Object.keys(result.list[0]) : [],
          isTestMode: false
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error: unknown) {
      console.error('❌ Erreur API lors de la récupération des données:', error);
      
      const apiError = error as ApiError;
      
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Erreur lors de la récupération des données depuis NocoDB.',
          error: apiError.message || 'Erreur inconnue'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  } catch (error: unknown) {
    console.error('❌ Erreur lors du traitement de la requête GET:', error);
    
    const apiError = error as ApiError;
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Une erreur s\'est produite lors du traitement de votre demande.',
        error: apiError.message || 'Erreur inconnue'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  console.log('🔄 Requête POST reçue à /api/submit-contact');
  
  try {
    // Vérifier si nous sommes en mode test
    const isTestMode = !NOCODB_API_TOKEN || NOCODB_API_TOKEN.trim() === '';
    console.log(`🔍 Mode détecté: ${isTestMode ? 'TEST' : 'PRODUCTION'}`);
    
    // Récupérer les données du formulaire (en JSON)
    const data = await request.json();
    console.log('📝 Données reçues:', data);
    
    // Formater les données pour NocoDB selon la structure réelle de la table
    const formattedData = {
      Objet: data.subject || "Contact depuis le site web",
      Message: data.message,
      Auteur: data.email,
      Statut: "En attente de réponse"
    };
    
    console.log('📝 Données formatées:', formattedData);
    
    // Mode test - simuler une soumission réussie
    if (isTestMode) {
      console.log('🧪 Mode TEST: simulation de la soumission');
      console.log('📝 Données qui seraient envoyées:', formattedData);
      
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('✅ Simulation réussie, envoi de la réponse');
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.',
          isTestMode: true
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Mode production - envoyer les données à NocoDB
    console.log('🚀 Mode PRODUCTION: envoi des données à NocoDB');
    
    // Initialiser l'API NocoDB
    const api = initNocoDBApi();
    if (!api) {
      console.error('❌ Échec de l\'initialisation de l\'API NocoDB');
      
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Nous rencontrons actuellement un problème technique. Notre équipe a été informée et travaille à résoudre ce problème. Veuillez réessayer ultérieurement.',
          error: 'API NocoDB non initialisée'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    try {
      console.log('🔄 Envoi des données à NocoDB...');
      console.log('📝 Paramètres:', {
        NOCODB_ORG_ID,
        NOCODB_PROJECT_ID,
        NOCODB_TABLE_ID,
        data: formattedData
      });
      
      // Envoyer les données à l'API NocoDB
      const result = await api.dbTableRow.create(
        NOCODB_ORG_ID,
        NOCODB_PROJECT_ID,
        NOCODB_TABLE_ID,
        formattedData
      );
      
      console.log('✅ Soumission réussie à NocoDB:', result);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.',
          isTestMode: false
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error: unknown) {
      console.error('❌ Erreur API lors de la soumission:', error);
      
      const apiError = error as ApiError;
      
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Nous n\'avons pas pu envoyer votre message. Veuillez vérifier votre connexion internet et réessayer. Si le problème persiste, contactez-nous par email.',
          error: apiError.message || 'Erreur inconnue'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  } catch (error: unknown) {
    console.error('❌ Erreur lors du traitement de la requête:', error);
    
    const apiError = error as ApiError;
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Une erreur s\'est produite lors du traitement de votre demande. Veuillez vérifier les informations saisies et réessayer.',
        error: apiError.message || 'Erreur inconnue'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}; 