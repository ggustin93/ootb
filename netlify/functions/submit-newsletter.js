import { Api } from 'nocodb-sdk';

// Configuration NocoDB - sécurisée car exécutée côté serveur uniquement
const NOCODB_BASE_URL = process.env.NOCODB_BASE_URL || 'https://app.nocodb.com';
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN;
const NOCODB_ORG_ID = process.env.NOCODB_ORG_ID || 'noco';
const NOCODB_PROJECT_ID = process.env.NOCODB_PROJECT_ID || 'p41z6qweidro6nu';
const NOCODB_NEWSLETTER_TABLE_ID = process.env.NOCODB_NEWSLETTER_TABLE_ID || 'm6hnpjey4laav0z';
const NOCODB_NEWSLETTER_VIEW_ID = process.env.NOCODB_NEWSLETTER_VIEW_ID || 'vwcs0f92mc8rh0s5';

console.log('🔄 Fonction Netlify submit-newsletter chargée');
console.log('📝 Configuration:', {
  NOCODB_BASE_URL,
  hasToken: !!NOCODB_API_TOKEN,
  NOCODB_ORG_ID,
  NOCODB_PROJECT_ID,
  NOCODB_NEWSLETTER_TABLE_ID,
  NOCODB_NEWSLETTER_VIEW_ID
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

// Fonction pour formater la date au format ISO avec timezone
function formatDateForNocoDB(date) {
  // Format ISO avec timezone (YYYY-MM-DD HH:MM:SS+00:00)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  // Calculer le décalage horaire en heures et minutes
  const timezoneOffset = -date.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
  const offsetMinutes = Math.abs(timezoneOffset) % 60;
  const timezoneString = `${timezoneOffset >= 0 ? '+' : '-'}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}${timezoneString}`;
}

export const handler = async (event) => {
  // Gérer les requêtes GET (test de connexion)
  if (event.httpMethod === 'GET') {
    console.log('🔄 Requête GET reçue pour tester la connexion');
    
    // Récupérer les paramètres de l'URL
    const url = new URL(event.rawUrl);
    const params = url.searchParams;
    const testEmail = params.get('email');
    const showRecords = params.get('records') === 'true';
    
    console.log('📝 Paramètres de requête:', { testEmail, showRecords });
    
    // Vérifier si le token API est disponible
    if (!NOCODB_API_TOKEN) {
      console.log('⚠️ Mode TEST détecté (pas de token API)');
      
      // Renvoyer une réponse simulée en mode test
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          mode: 'test',
          message: 'API en mode test - Connexion simulée réussie',
          data: {
            structure: {
              fields: [
                { id: 'Email', title: 'Email', type: 'SingleLineText' },
                { id: 'Source', title: 'Source', type: 'SingleLineText' },
                { id: 'Tags', title: 'Tags', type: 'SingleLineText' },
                { id: 'Date d\'inscription', title: 'Date d\'inscription', type: 'DateTime' },
                { id: 'Politique acceptée', title: 'Politique acceptée', type: 'Checkbox' },
                { id: 'Statut', title: 'Statut', type: 'SingleSelect' }
              ]
            }
          }
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }
    
    // Initialiser l'API NocoDB
    const api = initNocoDBApi();
    
    if (!api) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          message: 'Erreur d\'initialisation de l\'API NocoDB'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }
    
    try {
      // Récupérer les données selon les paramètres
      if (showRecords) {
        console.log('🔄 Récupération des enregistrements...');
        
        // Construire la condition where si un email est spécifié
        const whereCondition = testEmail ? `(Email,eq,${testEmail})` : '';
        
        // Récupérer les enregistrements
        const records = await api.dbTableRow.list(
          NOCODB_ORG_ID,
          NOCODB_PROJECT_ID,
          NOCODB_NEWSLETTER_TABLE_ID,
          { 
            where: whereCondition,
            limit: 10
          }
        );
        
        console.log('✅ Enregistrements récupérés avec succès');
        console.log('📝 Format des données récupérées:', records.list?.[0]);
        
        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            mode: 'production',
            message: 'Enregistrements récupérés avec succès',
            data: {
              records: records.list || [],
              count: records.pageInfo?.totalRows || 0
            }
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        };
      }
      
      console.log('🔄 Récupération de la structure de la table...');
      
      // Pour les fonctions Netlify, nous ne pouvons pas utiliser dbTableColumn.list
      // Récupérons plutôt un échantillon de données pour comprendre la structure
      const sampleData = await api.dbTableRow.list(
        NOCODB_ORG_ID,
        NOCODB_PROJECT_ID,
        NOCODB_NEWSLETTER_TABLE_ID,
        { limit: 1 }
      );
      
      console.log('✅ Structure de la table récupérée avec succès');
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          mode: 'production',
          message: 'Connexion réussie à l\'API NocoDB',
          data: {
            structure: {
              fields: sampleData.list && sampleData.list.length > 0 
                ? Object.keys(sampleData.list[0]).map(key => ({ id: key, title: key }))
                : []
            }
          }
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des données:', error);
      
      const statusCode = isApiError(error) && error.response?.status ? error.response.status : 500;
      const errorMessage = isApiError(error) && error.response?.data?.msg 
        ? error.response.data.msg 
        : (error.message || 'Erreur inconnue');
      
      return {
        statusCode,
        body: JSON.stringify({
          success: false,
          message: `Erreur lors de la récupération des données: ${errorMessage}`
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }
  }
  
  // Gérer les requêtes POST (soumission d'un nouvel abonné)
  if (event.httpMethod === 'POST') {
    console.log('🔄 Requête POST reçue pour soumettre un nouvel abonné');
    
    try {
      // Récupérer les données du formulaire
      const data = JSON.parse(event.body);
      console.log('📝 Données reçues:', data);
      
      // Vérifier si les données essentielles sont présentes
      if (!data.email) {
        console.error('❌ Données invalides: email manquant');
        return {
          statusCode: 400,
          body: JSON.stringify({
            success: false,
            message: 'L\'adresse email est requise'
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        };
      }
      
      // Utiliser les valeurs fournies dans la requête ou les valeurs par défaut
      const orgId = data.nocodb_org_id || NOCODB_ORG_ID;
      const projectId = data.nocodb_project_id || NOCODB_PROJECT_ID;
      const tableId = data.nocodb_table_id || NOCODB_NEWSLETTER_TABLE_ID;
      const viewId = data.nocodb_view_id || NOCODB_NEWSLETTER_VIEW_ID;
      
      console.log('📝 Paramètres NocoDB:', {
        orgId,
        projectId,
        tableId,
        viewId
      });
      
      // Formater les données pour NocoDB
      const formattedData = {
        Email: data.email,
        Source: data.source || 'website',
        Tags: data.tags || 'site-web,newsletter',
        "Date d'inscription": data["Date d'inscription"] || formatDateForNocoDB(new Date()),
        "Politique acceptée": data.privacyAccepted || false,
        Statut: "Actif"
      };
      
      console.log('📝 Données formatées pour NocoDB:', formattedData);
      
      // Vérifier si le token API est disponible
      if (!NOCODB_API_TOKEN) {
        console.log('⚠️ Mode TEST détecté (pas de token API)');
        
        // Simuler un délai de traitement
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Renvoyer une réponse simulée en mode test
        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            mode: 'test',
            message: 'Inscription simulée réussie en mode test',
            data: {
              email: data.email,
              timestamp: new Date().toISOString()
            }
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        };
      }
      
      // Initialiser l'API NocoDB
      const api = initNocoDBApi();
      
      if (!api) {
        return {
          statusCode: 500,
          body: JSON.stringify({
            success: false,
            message: 'Erreur d\'initialisation de l\'API NocoDB'
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        };
      }
      
      // Vérifier si l'email existe déjà
      console.log(`🔍 Vérification si l'email ${data.email} existe déjà...`);
      
      try {
        // Vérifier si l'email existe déjà
        const existingSubscribers = await api.dbTableRow.list(
          orgId,
          projectId,
          tableId,
          { 
            where: `(Email,eq,${data.email})`,
            limit: 1
          }
        );
        
        if (existingSubscribers.list && existingSubscribers.list.length > 0) {
          console.log('⚠️ Email déjà inscrit:', data.email);
          
          // Mettre à jour l'abonné existant
          const existingSubscriber = existingSubscribers.list[0];
          const existingId = existingSubscriber.Id || existingSubscriber.id;
          
          if (!existingId) {
            console.error('❌ Impossible de trouver l\'ID de l\'abonné existant');
            throw new Error('ID de l\'abonné non trouvé');
          }
          
          await api.dbTableRow.update(
            orgId,
            projectId,
            tableId,
            existingId,
            {
              Tags: formattedData.Tags,
              "Date d'inscription": formattedData["Date d'inscription"],
              "Politique acceptée": formattedData["Politique acceptée"],
              Statut: "Actif"
            }
          );
          
          console.log('✅ Abonné existant mis à jour avec succès');
          
          return {
            statusCode: 200,
            body: JSON.stringify({
              success: true,
              message: 'Votre inscription a été mise à jour avec succès',
              data: {
                email: data.email,
                updated: true,
                timestamp: new Date().toISOString(),
                formattedDate: formattedData["Date d'inscription"]
              }
            }),
            headers: {
              'Content-Type': 'application/json'
            }
          };
        }
        
        // Créer un nouvel abonné
        console.log('🔄 Création d\'un nouvel abonné...');
        console.log('📝 Données envoyées à NocoDB:', formattedData);
        
        const result = await api.dbTableRow.create(
          orgId,
          projectId,
          tableId,
          formattedData
        );
        
        console.log('✅ Nouvel abonné créé avec succès:', result);
        
        return {
          statusCode: 201,
          body: JSON.stringify({
            success: true,
            message: 'Votre inscription a été enregistrée avec succès',
            data: {
              email: data.email,
              created: true,
              timestamp: new Date().toISOString(),
              formattedDate: formattedData["Date d'inscription"]
            }
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        };
      } catch (error) {
        console.error('❌ Erreur lors de la soumission à NocoDB:', error);
        
        const statusCode = isApiError(error) && error.response?.status ? error.response.status : 500;
        const errorMessage = isApiError(error) && error.response?.data?.msg 
          ? error.response.data.msg 
          : (error.message || 'Erreur inconnue');
        
        return {
          statusCode,
          body: JSON.stringify({
            success: false,
            message: `Erreur lors de l'inscription: ${errorMessage}`
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