// Fonction Netlify pour gérer les requêtes Tina
import { createMediaHandler } from 'next-tinacms-cloudinary/dist/handlers';

// Créer le gestionnaire de médias Cloudinary
const mediaHandler = createMediaHandler({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  authorized: async () => {
    // Vérifier l'autorisation ici si nécessaire
    return true;
  },
});

exports.handler = async function(event, context) {
  // Extraire le chemin de la requête
  const segments = event.path.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  // Log pour le débogage
  console.log('Tina function called with path:', event.path);
  console.log('Method:', event.httpMethod);
  console.log('Segments:', segments);

  try {
    // Gérer les requêtes de médias
    if (lastSegment === 'media' || segments.includes('media')) {
      console.log('Handling media request');
      return await mediaHandler(event, context);
    }

    // Gérer d'autres requêtes Tina si nécessaire
    // ...

    // Réponse par défaut
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Route non trouvée', path: event.path }),
    };
  } catch (error) {
    console.error('Error in Tina function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erreur interne du serveur', message: error.message }),
    };
  }
}; 