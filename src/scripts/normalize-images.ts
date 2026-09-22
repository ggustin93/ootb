/**
 * Script pour normaliser les noms de fichiers d'images
 *
 * Ce script parcourt tous les répertoires d'images et renomme les fichiers
 * pour éliminer les redondances dans les noms (ex: atelier-atelier-XX -> atelier-XX)
 *
 * Usage: npm run normalize-images
 * ou: npx ts-node src/scripts/normalize-images.ts
 */

import { normalizeImageFilenames } from '../services/imageProcessor.js';

async function main() {
  console.log("🔄 Début de la normalisation des noms de fichiers d'images...");

  try {
    const renamedCount = await normalizeImageFilenames();
    console.log(`✅ Normalisation terminée avec succès. ${renamedCount} fichiers renommés.`);
  } catch (error) {
    console.error('❌ Erreur lors de la normalisation des noms de fichiers:', error);
    process.exit(1);
  }
}

main();
