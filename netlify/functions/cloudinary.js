// Fonction Netlify dédiée pour gérer les requêtes Cloudinary
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
  // Log pour le débogage
  console.log('Cloudinary function called with path:', event.path);
  console.log('Method:', event.httpMethod);

  try {
    // Traiter toutes les requêtes avec le gestionnaire de médias Cloudinary
    return await mediaHandler(event, context);
  } catch (error) {
    console.error('Error in Cloudinary function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erreur interne du serveur', message: error.message }),
    };
  }
}; 