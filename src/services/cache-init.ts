/**
 * Service d'initialisation du cache
 * Ce fichier est responsable de l'initialisation du cache au démarrage de l'application
 * et de son rafraîchissement périodique
 */

import { startAutoRefresh, isDataCached } from './api/nocodb';
import { resetImageProcessingSession } from './imageProcessor';

// Configuration
const ENABLE_AUTO_REFRESH = true; // Activer le rafraîchissement automatique
const AUTO_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes en millisecondes

/**
 * Initialise le cache au démarrage de l'application
 */
export function initCache(): void {
  console.log('🚀 Initialisation du cache...');

  // Réinitialiser le flag de traitement des images
  resetImageProcessingSession();

  if (ENABLE_AUTO_REFRESH) {
    if (!isDataCached()) {
      console.log('📦 Aucune donnée en cache, démarrage du rafraîchissement automatique...');
      startAutoRefresh(AUTO_REFRESH_INTERVAL);
    } else {
      console.log('📦 Données déjà en cache, démarrage du rafraîchissement automatique...');
      startAutoRefresh(AUTO_REFRESH_INTERVAL);
    }
  } else {
    console.log('⚠️ Rafraîchissement automatique désactivé');
  }
}

// Initialiser le cache au chargement du module
initCache();
