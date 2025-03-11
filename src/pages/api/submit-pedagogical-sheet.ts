import type { APIRoute } from 'astro';
import { Api } from 'nocodb-sdk';

// Forcer le rendu côté serveur
export const prerender = false;

// Configuration NocoDB - sécurisée car exécutée côté serveur uniquement
const NOCODB_BASE_URL = import.meta.env.NOCODB_BASE_URL || 'https://app.nocodb.com';
const NOCODB_API_TOKEN = import.meta.env.NOCODB_API_TOKEN;
const NOCODB_ORG_ID = import.meta.env.NOCODB_ORG_ID || 'noco';
const NOCODB_PROJECT_ID = import.meta.env.NOCODB_PROJECT_ID || 'pzafxqd4lr77r0v';
const NOCODB_TABLE_ID = import.meta.env.NOCODB_TABLE_ID || 'mur92i1x276ldbg';

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
interface ApiError extends Error {
  response?: {
    status?: number;
    data?: {
      msg?: string;
    };
  };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Vérifier si nous sommes en mode test (pour le développement)
    const isTestMode = !NOCODB_API_TOKEN || NOCODB_API_TOKEN.trim() === '';
    
    // Récupérer les données du formulaire (en JSON)
    const data = await request.json();
    
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
      "École": data.ecole,
      "Déclinaisons": data.Declinaisons || '',
      "Conseils": data.Conseils || '',
      "Liens": data.Liens || '',
      "Edition": new Date().getFullYear().toString()
    };
    
    // Mode test - simuler une soumission réussie
    if (isTestMode) {
      console.log('🧪 Mode TEST: simulation de la soumission');
      console.log('📝 Données qui seraient envoyées:', formattedData);
      
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Merci pour votre contribution ! Votre fiche pédagogique a été enregistrée avec succès.',
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
      // Envoyer les données à l'API NocoDB
      await api.dbTableRow.create(
        NOCODB_ORG_ID,
        NOCODB_PROJECT_ID,
        NOCODB_TABLE_ID,
        formattedData
      );
      
      console.log('✅ Soumission réussie');
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Merci pour votre contribution ! Votre fiche pédagogique a été enregistrée avec succès et sera examinée par notre équipe.',
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
          message: 'Nous n\'avons pas pu enregistrer votre fiche pédagogique. Veuillez vérifier votre connexion internet et réessayer. Si le problème persiste, contactez-nous.',
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