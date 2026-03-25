import { Api } from 'nocodb-sdk';

// Configuration NocoDB - sécurisée car exécutée côté serveur uniquement
const NOCODB_BASE_URL = process.env.NOCODB_BASE_URL || 'https://app.nocodb.com';
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN;
const NOCODB_ORG_ID = process.env.NOCODB_ORG_ID || 'noco';
// IMPORTANT: Utiliser des env vars dédiées pour éviter les conflits entre fonctions.
// Chaque fonction Netlify pointe vers un projet/table NocoDB différent.
const NOCODB_PROJECT_ID = process.env.NOCODB_CONTACT_PROJECT_ID || 'pn7128r4idyluf0';
const NOCODB_TABLE_ID = process.env.NOCODB_CONTACT_TABLE_ID || 'mza30wqm38wsmib';

console.log('🔄 Fonction Netlify submit-contact chargée');
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

// Vérifier si un objet est une erreur API
const isApiError = (error) => {
  return error && typeof error === 'object' && 'response' in error;
};

export const handler = async (event) => {
  // Gérer les requêtes GET (test de connexion)
  if (event.httpMethod === 'GET') {
    console.log('🔄 Requête GET reçue à /api/submit-contact (test)');
    
    try {
      // Vérifier si nous sommes en mode test
      const isTestMode = !NOCODB_API_TOKEN || NOCODB_API_TOKEN.trim() === '';
      console.log(`🔍 Mode détecté: ${isTestMode ? 'TEST' : 'PRODUCTION'}`);
      
      if (isTestMode) {
        console.log('🧪 Mode TEST: simulation de la structure');
        
        return {
          statusCode: 200,
          body: JSON.stringify({
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
          headers: {
            'Content-Type': 'application/json'
          }
        };
      }
      
      // Mode production - tester la connexion à NocoDB
      console.log('🚀 Mode PRODUCTION: test de connexion à NocoDB');
      
      // Initialiser l'API NocoDB
      const api = initNocoDBApi();
      if (!api) {
        console.error('❌ Échec de l\'initialisation de l\'API NocoDB');
        
        return {
          statusCode: 500,
          body: JSON.stringify({
            success: false,
            message: 'Échec de connexion à NocoDB. Vérifiez les variables d\'environnement.',
            error: 'API NocoDB non initialisée'
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        };
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
        
        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            message: 'Connexion à NocoDB réussie. Voici la structure attendue et un exemple de données:',
            expectedStructure: exampleStructure,
            sampleData: result.list && result.list.length > 0 ? result.list[0] : null,
            tableStructure: result.list && result.list.length > 0 ? Object.keys(result.list[0]) : [],
            isTestMode: false
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        };
      } catch (error) {
        console.error('❌ Erreur API lors de la récupération des données:', error);
        
        const statusCode = isApiError(error) && error.response?.status ? error.response.status : 500;
        const errorMessage = isApiError(error) && error.response?.data?.msg 
          ? error.response.data.msg 
          : (error.message || 'Erreur inconnue');
        
        return {
          statusCode,
          body: JSON.stringify({
            success: false,
            message: 'Erreur lors de la récupération des données depuis NocoDB.',
            error: errorMessage
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        };
      }
    } catch (error) {
      console.error('❌ Erreur lors du traitement de la requête GET:', error);
      
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          message: 'Une erreur s\'est produite lors du traitement de votre demande.',
          error: error.message || 'Erreur inconnue'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }
  }
  
  // Gérer les requêtes POST (soumission d'un message de contact)
  if (event.httpMethod === 'POST') {
    console.log('🔄 Requête POST reçue à /api/submit-contact');
    
    try {
      // Vérifier si nous sommes en mode test
      const isTestMode = !NOCODB_API_TOKEN || NOCODB_API_TOKEN.trim() === '';
      console.log(`🔍 Mode détecté: ${isTestMode ? 'TEST' : 'PRODUCTION'}`);
      
      // Récupérer les données du formulaire (en JSON)
      const data = JSON.parse(event.body);
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
        
        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            message: 'Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.',
            isTestMode: true
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        };
      }
      
      // Mode production - envoyer les données à NocoDB
      console.log('🚀 Mode PRODUCTION: envoi des données à NocoDB');
      
      // Initialiser l'API NocoDB
      const api = initNocoDBApi();
      if (!api) {
        console.error('❌ Échec de l\'initialisation de l\'API NocoDB');
        
        return {
          statusCode: 500,
          body: JSON.stringify({
            success: false,
            message: 'Nous rencontrons actuellement un problème technique. Notre équipe a été informée et travaille à résoudre ce problème. Veuillez réessayer ultérieurement.',
            error: 'API NocoDB non initialisée'
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        };
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
        
        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            message: 'Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.',
            isTestMode: false
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        };
      } catch (error) {
        console.error('❌ Erreur API lors de la soumission:', error);
        
        const statusCode = isApiError(error) && error.response?.status ? error.response.status : 500;
        const errorMessage = isApiError(error) && error.response?.data?.msg 
          ? error.response.data.msg 
          : (error.message || 'Erreur inconnue');
        
        return {
          statusCode,
          body: JSON.stringify({
            success: false,
            message: 'Nous n\'avons pas pu envoyer votre message. Veuillez vérifier votre connexion internet et réessayer. Si le problème persiste, contactez-nous par email.',
            error: errorMessage
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
          message: 'Une erreur s\'est produite lors du traitement de votre demande. Veuillez vérifier les informations saisies et réessayer.',
          error: error.message || 'Erreur inconnue'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }
  }
  
  // Méthode non supportée
  return {
    statusCode: 405,
    body: JSON.stringify({
      success: false,
      message: 'Méthode non supportée'
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  };
}; 