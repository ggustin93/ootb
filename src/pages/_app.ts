/**
 * Fichier d'initialisation de l'application
 * Ce fichier est exécuté au démarrage de l'application Astro
 */

// Importer le service d'initialisation du cache
import '../services/cache-init';

// Exporter une fonction vide pour éviter les erreurs
export function onRequest() {
  // Cette fonction est nécessaire pour que le fichier soit considéré comme un middleware Astro
  return;
} 