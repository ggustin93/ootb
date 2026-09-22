/**
 * Script pour vérifier toutes les images existantes et générer un rapport des images problématiques
 *
 * Usage: npm run check-images
 * ou: npx ts-node src/scripts/check-images.ts
 */

import { optimizeAllExistingImages } from '../services/imageProcessor';

async function main() {
  console.log('🖼️ Début de la vérification de toutes les images existantes...');

  try {
    await optimizeAllExistingImages();
    console.log('✅ Vérification terminée avec succès');
    console.log('📊 Un rapport HTML des images problématiques a été généré dans src/assets/images/events/logs/');
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des images:', error);
    process.exit(1);
  }
}

main();
