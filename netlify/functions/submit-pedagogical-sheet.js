import { Api } from 'nocodb-sdk';

// Configuration NocoDB - sécurisée car exécutée côté serveur uniquement
const NOCODB_BASE_URL = process.env.NOCODB_BASE_URL || 'https://app.nocodb.com';
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN;
const NOCODB_ORG_ID = process.env.NOCODB_ORG_ID || 'noco';
const NOCODB_PROJECT_ID = process.env.NOCODB_PROJECT_ID || 'pzafxqd4lr77r0v';
// IMPORTANT: NOCODB_TABLE_ID env var peut contenir un View ID (utilisé par le build script).
// On utilise NOCODB_FICHES_TABLE_ID ou NOCODB_BASE_ID (qui référence le vrai Table ID) en priorité.
const NOCODB_TABLE_ID = process.env.NOCODB_FICHES_TABLE_ID || process.env.NOCODB_BASE_ID || 'mur92i1x276ldbg';

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

// ─── Garde anti-spam ───────────────────────────────────────────────
const MAX_BODY_BYTES = 20 * 1024;
// Même regex permissive que submit-newsletter
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Miroir des valeurs "Public cible" de ProjectSubmissionForm.astro
const DESTINATAIRES = [
  'Jeunes enfants',
  'Parents et enfants',
  'Parents',
  'Professeurs, parents et enfants',
  'Professeurs',
  'Professionnels'
];
// Miroir des minlength du formulaire
const MIN_LENGTHS = {
  Title: 5,
  Description: 40,
  Objectifs: 10,
  Competences: 10,
  prenom: 2,
  nom: 2,
  ecole: 2
};

const text = (value) => (typeof value === 'string' ? value.trim() : '');
const wordCount = (value) => text(value).split(/\s+/).filter(Boolean).length;

/**
 * Détecte une soumission automatisée ou incohérente.
 * @param {Record<string, unknown>} data - corps JSON parsé
 * @returns {string|null} code de raison du rejet, ou null si la soumission est acceptée
 */
export const isSpam = (data) => {
  if (!data || typeof data !== 'object') return 'invalid_body';
  if (text(data.website) !== '') return 'honeypot';
  for (const [field, min] of Object.entries(MIN_LENGTHS)) {
    if (text(data[field]).length < min) return `too_short:${field}`;
  }
  if (!EMAIL_REGEX.test(text(data.email))) return 'invalid_email';
  if (!DESTINATAIRES.includes(data.Destinataire)) return 'invalid_destinataire';
  if (wordCount(data.Description) < 3 || wordCount(data.Objectifs) < 3) return 'too_few_words';
  return null;
};

const SUCCESS_MESSAGE = 'Merci pour votre contribution ! Votre fiche pédagogique a été enregistrée avec succès et sera examinée par notre équipe.';

// Réponse identique à un vrai succès pour ne donner aucun signal au bot. Aucun appel NocoDB.
const rejectSpam = (reason) => {
  console.warn(`spam rejected: ${reason}`);
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, message: SUCCESS_MESSAGE, isTestMode: false }),
    headers: { 'Content-Type': 'application/json' }
  };
};

const getHeader = (headers, name) =>
  Object.entries(headers || {}).find(([key]) => key.toLowerCase() === name)?.[1] || '';

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

  // Contrôles avant parsing
  if (Buffer.byteLength(event.body || '') > MAX_BODY_BYTES) return rejectSpam('body_too_large');
  if (!getHeader(event.headers, 'content-type').toLowerCase().includes('application/json')) {
    return rejectSpam('invalid_content_type');
  }

  try {
    // Vérifier si nous sommes en mode test (pour le développement)
    const isTestMode = !NOCODB_API_TOKEN || NOCODB_API_TOKEN.trim() === '';
    
    // Récupérer les données du formulaire (en JSON)
    const data = JSON.parse(event.body);

    const spamReason = isSpam(data);
    if (spamReason) return rejectSpam(spamReason);
    
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
      console.log('📝 Champs qui seraient envoyés:', Object.keys(formattedData).join(', '));
      
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
      console.log('📋 NocoDB config:', {
        baseURL: NOCODB_BASE_URL,
        orgId: NOCODB_ORG_ID,
        projectId: NOCODB_PROJECT_ID,
        tableId: NOCODB_TABLE_ID,
        tokenPresent: !!NOCODB_API_TOKEN,
        envTableId: process.env.NOCODB_TABLE_ID || '(non défini)',
        envBaseId: process.env.NOCODB_BASE_ID || '(non défini)',
        envFichesTableId: process.env.NOCODB_FICHES_TABLE_ID || '(non défini)'
      });

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
          message: SUCCESS_MESSAGE,
          isTestMode: false
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      };
    } catch (error) {
      // Pas d'objet error brut ni de response.data : ils peuvent contenir les données soumises (PII)
      console.error('❌ Erreur API lors de la soumission:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        msg: error.response?.data?.msg,
        message: error.message
      });
      console.error('❌ Champs envoyés:', Object.keys(formattedData).join(', '));
      console.error('❌ Si erreur 422 : une colonne a probablement été renommée dans NocoDB.');

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
    // error.message d'un JSON.parse peut citer le corps soumis (PII) : on ne logue que le type
    console.error('❌ Erreur lors du traitement de la requête:', error.name);
    
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