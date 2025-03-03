import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Chemin vers le fichier de navigation
const navigationFilePath = path.join(process.cwd(), 'src/content/navigation/index.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vérifier que la méthode est POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    // Récupérer les données de la requête
    const navigationData = req.body;

    // Écrire les données dans le fichier
    fs.writeFileSync(navigationFilePath, JSON.stringify(navigationData, null, 2), 'utf8');

    // Répondre avec succès
    return res.status(200).json({ message: 'Navigation mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la navigation:', error);
    return res.status(500).json({ message: 'Erreur lors de la mise à jour de la navigation' });
  }
} 