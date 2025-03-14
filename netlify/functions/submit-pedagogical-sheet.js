import { Api } from 'nocodb-sdk';

// Configuration NocoDB - sécurisée car exécutée côté serveur uniquement
const NOCODB_BASE_URL = process.env.NOCODB_BASE_URL || 'https://app.nocodb.com';
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN;
const NOCODB_ORG_ID = process.env.NOCODB_ORG_ID || 'noco';
const NOCODB_PROJECT_ID = process.env.NOCODB_PROJECT_ID || 'pzafxqd4lr77r0v';
const NOCODB_TABLE_ID = process.env.NOCODB_TABLE_ID || 'mur92i1x276ldbg';

// Initialiser l'API NocoDB
const initNocoDBApi = () => {
  if (!NOCODB_API_TOKEN) {
    console.error('❌ Token API NocoDB manquant');
    return null;
  }
  
  try {
    return new Api({
      baseURL: NOCODB_BASE_URL,
      headers: {
        'xc-token': NOCODB_API_TOKEN
      }
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de l\'API NocoDB:', error);
    return null;
  }
};

// Définir une interface pour les erreurs
const isApiError = (error) => {
  return error && typeof error === 'object' && 'response' in error;
};

export const handler = async (event) => {
  // Vérifier si c'est une requête POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ 
        success: false,
        message: 'Méthode non autorisée',
        error: 'Method Not Allowed'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }

  try {
    // Vérifier si nous sommes en mode test (pour le développement)
    const isTestMode = !NOCODB_API_TOKEN || NOCODB_API_TOKEN.trim() === '';
    
    // Récupérer les données du formulaire (en JSON)
    const data = JSON.parse(event.body);
    
    // Formater les données pour NocoDB
    const formattedData = {
      Title: data.Title,
      Description: data.Description,
      "Type enseignement": JSON.stringify(data.TypeEnseignement),
      Section: JSON.stringify(data.Section),
      Destinataire: data.Destinataire,
      "Thèmes": JSON.stringify(data.Themes),
      Objectifs: data.Objectifs,
      Competences: data.Competences,
      "Prénom": data.prenom,
      "Nom": data.nom,
      "Email": data.email,
      "Téléphone": data.telephone || '',
      "Ecole": data.ecole,
      "Déclinaisons": data.Declinaisons || '',
      "Conseils": data.Conseils || '',
      "Liens": data.Liens || '',
      "LiensVIDEO": data.LiensVIDEO || '',
      "Edition": new Date().getFullYear().toString()
    };
    
    // Mode test - simuler une soumission réussie
    if (isTestMode) {
      console.log('🧪 Mode TEST: simulation de la soumission');
      console.log('📝 Données qui seraient envoyées:', formattedData);
      
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Merci pour votre contribution ! Votre fiche pédagogique a été enregistrée avec succès.',
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
      // Envoyer les données à l'API NocoDB
      await api.dbTableRow.create(
        NOCODB_ORG_ID,
        NOCODB_PROJECT_ID,
        NOCODB_TABLE_ID,
        formattedData
      );
      
      console.log('✅ Soumission réussie');
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Merci pour votre contribution ! Votre fiche pédagogique a été enregistrée avec succès et sera examinée par notre équipe.',
          isTestMode: false
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      };
    } catch (error) {
      console.error('❌ Erreur API lors de la soumission:', error);
      
      const errorMessage = isApiError(error) 
        ? error.response?.data?.msg || error.message || 'Erreur inconnue'
        : error.message || 'Erreur inconnue';
      
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          message: 'Nous n\'avons pas pu enregistrer votre fiche pédagogique. Veuillez vérifier votre connexion internet et réessayer. Si le problème persiste, contactez-nous.',
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
}; 