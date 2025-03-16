import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Chemin vers le dossier de cache
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, '..', '..', '.cache');
const POSTS_CACHE_FILE = path.join(CACHE_DIR, 'all-posts.json');

// Durée de validité du cache en millisecondes (1 heure par défaut)
const CACHE_TTL = 60 * 60 * 1000;

// Désactiver le cache en mode développement (optionnel)
const DEV_MODE = process.env.NODE_ENV === 'development';
const CACHE_ENABLED = !DEV_MODE; // Mettre à true pour activer le cache même en développement

/**
 * S'assure que le dossier de cache existe
 */
function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    try {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    } catch (error) {
      console.error(`Erreur lors de la création du dossier de cache: ${error}`);
    }
  }
}

/**
 * Vérifie si le cache est valide
 */
function isCacheValid(cachePath: string): boolean {
  if (!CACHE_ENABLED || !fs.existsSync(cachePath)) {
    return false;
  }

  try {
    const stats = fs.statSync(cachePath);
    const now = new Date().getTime();
    const modifiedTime = stats.mtime.getTime();

    // Le cache est valide si sa dernière modification est plus récente que CACHE_TTL
    return now - modifiedTime < CACHE_TTL;
  } catch (error) {
    console.error(`Erreur lors de la vérification du cache: ${error}`);
    return false;
  }
}

/**
 * Récupère les données du cache
 */
export function getFromCache<T>(cachePath: string): T | null {
  if (!isCacheValid(cachePath)) {
    return null;
  }

  try {
    const data = fs.readFileSync(cachePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Erreur lors de la lecture du cache: ${error}`);
    // Si le fichier est corrompu, le supprimer
    try {
      fs.unlinkSync(cachePath);
    } catch (e) {
      // Ignorer les erreurs de suppression
    }
    return null;
  }
}

/**
 * Enregistre des données dans le cache
 */
export function saveToCache<T>(cachePath: string, data: T): void {
  if (!CACHE_ENABLED) return;
  
  ensureCacheDir();
  
  try {
    fs.writeFileSync(cachePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Erreur lors de l'écriture dans le cache: ${error}`);
  }
}

/**
 * Invalide manuellement le cache
 */
export function invalidateCache(cachePath: string = POSTS_CACHE_FILE): void {
  if (fs.existsSync(cachePath)) {
    try {
      fs.unlinkSync(cachePath);
      console.log(`Cache invalidé: ${cachePath}`);
    } catch (error) {
      console.error(`Erreur lors de l'invalidation du cache: ${error}`);
    }
  }
}

/**
 * Récupère tous les posts avec mise en cache
 */
export async function getCachedPosts<T>(fetchFunction: () => Promise<T>): Promise<T> {
  // Vérifier si le cache est valide
  const cachedPosts = getFromCache<T>(POSTS_CACHE_FILE);
  if (cachedPosts) {
    return cachedPosts;
  }

  // Si le cache n'est pas valide, récupérer les données fraîches
  try {
    const posts = await fetchFunction();
    
    // Sauvegarder dans le cache
    saveToCache(POSTS_CACHE_FILE, posts);
    
    return posts;
  } catch (error) {
    console.error(`Erreur lors de la récupération des posts: ${error}`);
    // En cas d'erreur, retourner un cache expiré si disponible
    const expiredCache = fs.existsSync(POSTS_CACHE_FILE) 
      ? JSON.parse(fs.readFileSync(POSTS_CACHE_FILE, 'utf-8')) as T 
      : null;
    
    if (expiredCache) {
      console.log('Utilisation du cache expiré comme fallback');
      return expiredCache;
    }
    
    // Si pas de cache du tout, retourner un tableau vide ou rethrow
    throw error;
  }
} 