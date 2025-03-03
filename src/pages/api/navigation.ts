import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

// Chemin vers le fichier de navigation
const navigationFilePath = path.join(process.cwd(), 'src/content/navigation/index.json');

export const post: APIRoute = async ({ request }) => {
  try {
    // Récupérer les données de la requête
    const navigationData = await request.json();

    // Écrire les données dans le fichier
    fs.writeFileSync(navigationFilePath, JSON.stringify(navigationData, null, 2), 'utf8');

    // Répondre avec succès
    return new Response(
      JSON.stringify({
        message: 'Navigation mise à jour avec succès',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la navigation:', error);
    
    return new Response(
      JSON.stringify({
        message: 'Erreur lors de la mise à jour de la navigation',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}; 