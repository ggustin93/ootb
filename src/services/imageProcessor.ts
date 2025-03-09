import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import fetch from 'node-fetch';
import type { Event } from '~/types/festival';
import sharp from 'sharp';

// Type étendu pour les événements avec des propriétés supplémentaires
interface ProcessedEvent extends Event {
  imageDownloaded?: boolean;
  speakerImageDownloaded?: boolean;
}

// Répertoire de base pour les images téléchargées
const BASE_IMAGE_DIR = path.join(process.cwd(), 'src', 'assets', 'images', 'events');

// Variable pour suivre la dernière mise à jour du rapport
let lastReportUpdate = 0;
const REPORT_UPDATE_INTERVAL = 10000; // 10 secondes minimum entre les mises à jour
const MAX_LOG_ENTRIES = 100; // Nombre maximum d'entrées à conserver dans le fichier de log
const MAX_LOG_AGE_DAYS = 7; // Durée maximale de conservation des logs en jours

// Cache pour les URLs d'images déjà téléchargées
// Clé: URL de l'image, Valeur: chemin local de l'image téléchargée
const imageUrlCache = new Map<string, string>();

// Cache pour les vérifications d'existence de fichiers
// Clé: chemin du fichier, Valeur: booléen indiquant si le fichier existe
const fileExistsCache = new Map<string, boolean>();

// Fonction pour vérifier si un fichier existe avec mise en cache
const fileExistsWithCache = (filePath: string): boolean => {
  // Vérifier si le résultat est déjà en cache
  if (fileExistsCache.has(filePath)) {
    return fileExistsCache.get(filePath)!;
  }
  
  // Vérifier l'existence du fichier
  const exists = fs.existsSync(filePath);
  
  // Mettre en cache le résultat
  fileExistsCache.set(filePath, exists);
  
  return exists;
};

// Fonction pour vider le cache des vérifications d'existence de fichiers
const clearFileExistsCache = (): void => {
  fileExistsCache.clear();
  console.log('🧹 Cache des vérifications d\'existence de fichiers vidé');
};

// Vider le cache toutes les 5 minutes pour éviter les problèmes de stale cache
setInterval(clearFileExistsCache, 5 * 60 * 1000);

/**
 * Vérifie si une URL d'image est problématique (susceptible de causer des erreurs CORS)
 * @param url L'URL à vérifier
 * @returns true si l'URL est problématique, false sinon
 */
export const isProblematicUrl = (url: string): boolean => {
  // Cas 1: Format CSV de NocoDB - nom_fichier.extension(url...)
  if (url.match(/\.(jpg|jpeg|png|webp|gif|svg)\(/i)) {
    console.log(`⚠️ URL problématique (format CSV): ${url}`);
    return true;
  }
  
  // Cas 2: URL sans extension d'image valide
  const hasImageExtension = /\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i.test(url);
  
  // Les URLs S3 signées sont considérées comme valides même sans extension visible
  if (url.includes('X-Amz-Signature=')) {
    console.log(`✅ URL S3 signée valide: ${url}`);
    return false;
  }
  
  // Cas 3: URL sans extension mais avec "image" dans le chemin
  if (!hasImageExtension && (url.includes('/image/') || url.includes('/images/'))) {
    console.log(`✅ URL sans extension mais avec "image" dans le chemin, considérée valide: ${url}`);
    return false;
  }
  
  if (!hasImageExtension) {
    console.log(`⚠️ URL problématique (sans extension): ${url}`);
    return true;
  }
  
  return false;
};

/**
 * Vérifie si une image est fournie et valide
 * @param img L'URL de l'image à vérifier
 * @returns true si l'image est valide, false sinon
 */
export const isValidImage = (img?: string): boolean => {
  if (!img) return false;
  
  // Vérifier si l'URL est problématique
  if (isProblematicUrl(img)) {
    return false;
  }
  
  // Les URLs S3 signées sont considérées comme valides même sans extension visible
  if (img.includes('X-Amz-Signature=')) {
    return true;
  }
  
  // Pour les autres URLs, vérifier l'extension
  const hasImageExtension = /\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i.test(img);
  return hasImageExtension;
};

/**
 * Crée les répertoires nécessaires pour stocker les images
 */
export const createImageDirectories = async (): Promise<void> => {
  try {
    // Créer le répertoire principal des images s'il n'existe pas
    await fsPromises.mkdir('src/assets/images/events', { recursive: true });
    
    // Créer les sous-répertoires pour chaque type d'événement
    await fsPromises.mkdir('src/assets/images/events/conferences', { recursive: true });
    await fsPromises.mkdir('src/assets/images/events/ateliers', { recursive: true });
    await fsPromises.mkdir('src/assets/images/events/stands', { recursive: true });
    
    // Créer le répertoire pour les images de conférenciers
    await fsPromises.mkdir('src/assets/images/events/speakers', { recursive: true });
    
    // Créer le répertoire pour les logs
    await fsPromises.mkdir('src/assets/images/events/logs', { recursive: true });
    
    console.log('✅ Répertoires d\'images créés avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la création des répertoires d\'images:', error);
  }
};

/**
 * Vérifie si une image a déjà été téléchargée
 * @param eventId Identifiant de l'événement
 * @param eventType Type d'événement (conférences, ateliers, stands)
 * @param isSpeakerImage Indique s'il s'agit d'une image de conférencier
 * @returns Le chemin de l'image si elle existe, null sinon
 */
export const isImageAlreadyDownloaded = (
  eventId: string,
  eventType: string,
  isSpeakerImage: boolean = false
): string | null => {
  try {
    // ⚠️ CORRECTION : S'assurer que le sous-répertoire correspond exactement aux répertoires créés
    let subdir;
    if (isSpeakerImage) {
      subdir = 'speakers';
    } else if (eventType === 'conferences') {
      subdir = 'conferences';
    } else if (eventType === 'ateliers') {
      subdir = 'ateliers';
    } else if (eventType === 'stands') {
      subdir = 'stands';
    } else {
      // Fallback
      subdir = eventType;
    }
    
    // ⚠️ CORRECTION : Extraire le préfixe de base de façon uniforme
    let basePrefix;
    if (eventType === 'conferences') {
      basePrefix = 'conference';
    } else if (eventType === 'ateliers') {
      basePrefix = 'atelier';
    } else if (eventType === 'stands') {
      basePrefix = 'stand';
    } else {
      // Convertir le type en string pour éviter l'erreur "toLowerCase n'existe pas sur le type 'never'"
      const typeStr = String(eventType).toLowerCase();
      basePrefix = typeStr.endsWith('s') 
        ? typeStr.slice(0, -1) 
        : typeStr;
    }
    
    // Log pour le débogage
    console.log(`🔍 Recherche d'images pour l'événement ID: ${eventId}, Type: ${eventType}, Sous-répertoire: ${subdir}`);
    
    // Préparer les noms de fichiers possibles en fonction du type d'image
    const possibleFilenames = [];
    
    if (isSpeakerImage) {
      // Pour les images de conférenciers
      possibleFilenames.push(`speaker-${eventId}.webp`);  // Format standard: speaker-123.webp
      
      // Essayer d'extraire l'ID numérique pour les formats simplifiés
      const idMatch = eventId.match(/(\d+)/);
      if (idMatch && idMatch[1]) {
        possibleFilenames.push(`speaker-${idMatch[1]}.webp`);  // Format simplifié: speaker-123.webp
      }
      
      // Formats legacy pour compatibilité
      possibleFilenames.push(`speaker-${basePrefix}-${eventId}.webp`);  // Format avec type: speaker-conference-123.webp
    } else {
      // Pour les images d'événements normaux
      possibleFilenames.push(`${basePrefix}-${eventId}.webp`);         // Format standard: atelier-123.webp, stand-123.webp
      possibleFilenames.push(`event-${basePrefix}-${eventId}.webp`);   // Format avec préfixe event: event-atelier-123.webp
      
      // POUR LA COMPATIBILITÉ UNIQUEMENT: 
      // Ajouter des formats legacy pour s'assurer qu'on trouve bien les images existantes
      possibleFilenames.push(`${basePrefix}-${basePrefix}-${eventId}.webp`); // Format redondant
      
      // Essayer d'extraire l'ID numérique pour les formats simplifiés
      const idMatch = eventId.match(/(\d+)/);
      if (idMatch && idMatch[1]) {
        possibleFilenames.push(`${basePrefix}-${idMatch[1]}.webp`);  // Format simplifié: atelier-123.webp
      }
  
      // Pour les stands, vérifier aussi les anciennes variantes avec jours (pour rétrocompatibilité)
      if (eventType === 'stands') {
        ['Mercredi', 'Jeudi', 'Vendredi'].forEach(day => {
          // Anciens formats avec jour pour compatibilité uniquement
          possibleFilenames.push(`${basePrefix}-${eventId}-${day}.webp`);
          possibleFilenames.push(`event-${basePrefix}-${eventId}-${day}.webp`);
          possibleFilenames.push(`${basePrefix}-${basePrefix}-${eventId}-${day}.webp`);
          possibleFilenames.push(`${basePrefix}-${basePrefix}-${eventId}-${day}-${day}.webp`);
        });
      }
    }
    
    console.log(`📋 Noms de fichiers à vérifier: ${possibleFilenames.join(', ')}`);
    
    // Vérifier si l'une des variantes existe
    for (const filename of possibleFilenames) {
      const filePath = path.join(BASE_IMAGE_DIR, subdir, filename);
      // Réduire les logs pour améliorer les performances
      // console.log(`🔎 Vérification de l'existence de: ${filePath}`);
      if (fileExistsWithCache(filePath)) {
        console.log(`✅ Image existante trouvée: ${filePath}`);
        return `~/assets/images/events/${subdir}/${filename}`;
      } 
      // Réduire les logs pour améliorer les performances
      // else {
      //   console.log(`❌ Fichier non trouvé: ${filePath}`);
      // }
    }
    
    // Vérifier également les extensions jpg, png, etc. (pour les images non converties en WebP)
    const extensions = ['.jpg', '.jpeg', '.png', '.gif'];
    for (const ext of extensions) {
      // FORMATS STANDARDS UNIQUEMENT
      const baseFilename = `${basePrefix}-${eventId}${ext}`;
      const eventFilename = `event-${basePrefix}-${eventId}${ext}`;
      
      // POUR LA COMPATIBILITÉ UNIQUEMENT
      const duplicatePrefix = `${basePrefix}-${basePrefix}-${eventId}${ext}`; // Format redondant: atelier-atelier-123.jpg
      
      const basePath = path.join(BASE_IMAGE_DIR, subdir, baseFilename);
      const eventPath = path.join(BASE_IMAGE_DIR, subdir, eventFilename);
      const duplicatePath = path.join(BASE_IMAGE_DIR, subdir, duplicatePrefix);
      
      if (fs.existsSync(basePath)) {
        console.log(`✅ Image existante trouvée (non WebP): ${basePath}`);
        return `~/assets/images/events/${subdir}/${baseFilename}`;
      }
      
      if (fs.existsSync(eventPath)) {
        console.log(`✅ Image existante trouvée (non WebP): ${eventPath}`);
        return `~/assets/images/events/${subdir}/${eventFilename}`;
      }
      
      // Vérifier aussi les formats redondants (pour compatibilité)
      if (fs.existsSync(duplicatePath)) {
        console.log(`✅ Image existante trouvée (ancien format): ${duplicatePath}`);
        return `~/assets/images/events/${subdir}/${duplicatePrefix}`;
      }
      
      // Pour les stands, vérifier également les variantes avec les jours
      if (eventType === 'stands') {
        ['Mercredi', 'Jeudi', 'Vendredi'].forEach(day => {
          // FORMATS STANDARDS
          const dayBaseFilename = `${basePrefix}-${eventId}-${day}${ext}`;
          const dayEventFilename = `event-${basePrefix}-${eventId}-${day}${ext}`;
          
          // FORMATS REDONDANTS (pour compatibilité)
          const dayDuplicateFilename = `${basePrefix}-${basePrefix}-${eventId}-${day}${ext}`;
          const dayDuplicateDoubleDayFilename = `${basePrefix}-${basePrefix}-${eventId}-${day}-${day}${ext}`;
          
          const dayBasePath = path.join(BASE_IMAGE_DIR, subdir, dayBaseFilename);
          const dayEventPath = path.join(BASE_IMAGE_DIR, subdir, dayEventFilename);
          const dayDuplicatePath = path.join(BASE_IMAGE_DIR, subdir, dayDuplicateFilename);
          const dayDuplicateDoubleDayPath = path.join(BASE_IMAGE_DIR, subdir, dayDuplicateDoubleDayFilename);
          
          if (fs.existsSync(dayBasePath)) {
            console.log(`✅ Image existante trouvée (non WebP): ${dayBasePath}`);
            return `~/assets/images/events/${subdir}/${dayBaseFilename}`;
          }
          
          if (fs.existsSync(dayEventPath)) {
            console.log(`✅ Image existante trouvée (non WebP): ${dayEventPath}`);
            return `~/assets/images/events/${subdir}/${dayEventFilename}`;
          }
          
          // Vérifier formats redondants
          if (fs.existsSync(dayDuplicatePath)) {
            console.log(`✅ Image existante trouvée (ancien format): ${dayDuplicatePath}`);
            return `~/assets/images/events/${subdir}/${dayDuplicateFilename}`;
          }
          
          if (fs.existsSync(dayDuplicateDoubleDayPath)) {
            console.log(`✅ Image existante trouvée (ancien format double jour): ${dayDuplicateDoubleDayPath}`);
            return `~/assets/images/events/${subdir}/${dayDuplicateDoubleDayFilename}`;
          }
        });
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de l\'image:', error);
    return null;
  }
};

/**
 * Vérifie si un buffer d'image est valide
 * @param buffer Le buffer à vérifier
 * @returns true si l'image est valide, false sinon
 */
export const validateImageBuffer = async (buffer: Buffer): Promise<boolean> => {
  try {
    // Vérifier si le buffer est vide
    if (!buffer || buffer.length === 0) {
      console.error('❌ Buffer d\'image vide');
      return false;
    }
    
    // Vérifier si le buffer est trop petit (moins de 100 octets)
    if (buffer.length < 100) {
      console.error(`❌ Buffer d'image trop petit: ${buffer.length} octets`);
      return false;
    }
    
    // Essayer d'obtenir les métadonnées de l'image avec sharp
    const metadata = await sharp(buffer).metadata();
    
    // Vérifier que l'image a des dimensions valides
    if (!metadata.width || !metadata.height) {
      console.error('❌ Image sans dimensions valides');
      return false;
    }
    
    // Vérifier que l'image a un format reconnu
    if (!metadata.format) {
      console.error('❌ Format d\'image non reconnu');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la validation de l\'image:', error);
    return false;
  }
};

/**
 * Télécharge une image depuis une URL et la sauvegarde localement
 * @param imageUrl URL de l'image à télécharger
 * @param eventType Type d'événement (conférences, ateliers, stands)
 * @param eventId Identifiant de l'événement
 * @param isSpeakerImage Indique s'il s'agit d'une image de conférencier
 * @param eventTitle Titre de l'événement
 * @param eventDay Jour de l'événement
 * @returns Le chemin de l'image téléchargée ou null en cas d'erreur
 */
export const downloadImage = async (
  imageUrl: string,
  eventType: string,
  eventId: string,
  isSpeakerImage: boolean = false,
  eventTitle?: string,
  eventDay?: string
): Promise<string | null> => {
  try {
    // Vérifier que l'URL est valide
    if (!imageUrl || typeof imageUrl !== 'string') {
      console.error('❌ URL d\'image invalide:', imageUrl);
      await logProblematicImage(`URL: ${String(imageUrl)}`, "URL d'image invalide", {
        id: eventId,
        type: eventType,
        title: eventTitle,
        day: eventDay
      });
      return null;
    }
    
    // Vérifier si l'URL est déjà en cache
    if (imageUrlCache.has(imageUrl)) {
      const cachedPath = imageUrlCache.get(imageUrl);
      if (cachedPath) {
        console.log(`🔄 URL déjà téléchargée, utilisation du cache: ${cachedPath}`);
        return cachedPath;
      }
    }

    // Normaliser le type d'événement pour le chemin du fichier
    // Convertir le type en minuscules et supprimer les accents
    const normalizedType = eventType.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // ⚠️ CORRECTION : S'assurer que le sous-répertoire correspond exactement aux répertoires créés par createImageDirectories
    // Cette étape est cruciale pour éviter les problèmes de chemin
    let subdir;
    if (isSpeakerImage) {
      subdir = 'speakers';
    } else if (normalizedType === 'conferences') {
      subdir = 'conferences';
    } else if (normalizedType === 'ateliers') {
      subdir = 'ateliers';
    } else if (normalizedType === 'stands') {
      subdir = 'stands';
    } else {
      // Fallback, ne devrait pas se produire avec les types normaux
      subdir = normalizedType;
    }
    
    // Créer les répertoires nécessaires
    await createImageDirectories();
    
    // Extraire le préfixe de base pour le nom de fichier (sans redondance !)
    // ⚠️ CORRECTION : S'assurer d'obtenir un préfixe sans pluriel et uniforme
    let basePrefix;
    if (normalizedType === 'conferences') {
      basePrefix = 'conference';
    } else if (normalizedType === 'ateliers') {
      basePrefix = 'atelier';
    } else if (normalizedType === 'stands') {
      basePrefix = 'stand';
    } else {
      // Convertir le type en string pour éviter l'erreur "toLowerCase n'existe pas sur le type 'never'"
      const typeStr = String(normalizedType).toLowerCase();
      basePrefix = typeStr.endsWith('s') 
        ? typeStr.slice(0, -1) 
        : typeStr;
    }
    
    // Vérifier si l'image a déjà été téléchargée
    const existingImage = isImageAlreadyDownloaded(eventId, normalizedType, isSpeakerImage);
    if (existingImage) {
      console.log(`✅ Image déjà téléchargée: ${existingImage}`);
      return existingImage;
    }
    
    // Extraire l'extension de fichier de l'URL
    let fileExt = '.jpg'; // Extension par défaut
    
    // Essayer d'extraire l'extension de l'URL
    const urlExtMatch = imageUrl.match(/\.([a-zA-Z0-9]+)($|\?)/);
    if (urlExtMatch && ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(urlExtMatch[1].toLowerCase())) {
      fileExt = `.${urlExtMatch[1].toLowerCase()}`;
    }
    
    // LOGS DÉTAILLÉS
    console.log('------------------------------');
    console.log(`🧩 Génération du nom de fichier pour:`);
    console.log(`   - Type d'événement: ${eventType}`);
    console.log(`   - Type normalisé: ${normalizedType}`);
    console.log(`   - Préfixe de base: ${basePrefix}`);
    console.log(`   - ID: ${eventId}`);
    console.log(`   - Extension: ${fileExt}`);
    console.log(`   - Sous-répertoire: ${subdir}`);
    console.log('------------------------------');
    
    // Format uniforme pour tous les types d'événements, sans distinction de jour
    // ⚠️ CORRECTION : Garantir un nom de fichier sans redondance
    let filename;
    if (isSpeakerImage) {
      // Pour les images de conférenciers, utiliser un format spécifique
      // Extraire l'ID numérique si possible pour éviter la redondance
      const idMatch = eventId.match(/(\d+)/);
      if (idMatch && idMatch[1]) {
        // Utiliser uniquement l'ID numérique avec le préfixe "speaker"
        filename = `speaker-${idMatch[1]}${fileExt}`;
      } else {
        // Fallback au format standard pour les conférenciers
        filename = `speaker-${eventId}${fileExt}`;
      }
      
      console.log(`📝 Nom de fichier de conférencier généré: ${filename} (ID: ${eventId})`);
    } else {
      // Pour les images d'événements normaux
      // Vérifier si l'ID contient déjà le préfixe pour éviter la redondance
      const idWithoutPrefix = eventId.startsWith(`${basePrefix}-`) 
        ? eventId 
        : `${basePrefix}-${eventId}`;
      
      // Extraire l'ID numérique si possible
      const idMatch = idWithoutPrefix.match(new RegExp(`${basePrefix}-(\\d+)`));
      if (idMatch && idMatch[1]) {
        // Utiliser uniquement l'ID numérique
        filename = `${basePrefix}-${idMatch[1]}${fileExt}`;
      } else {
        // Fallback au format standard
        filename = idWithoutPrefix + fileExt;
      }
      
      console.log(`📝 Nom de fichier d'événement généré: ${filename} (type: ${eventType}, ID: ${eventId})`);
    }
    
    // Log pour débogage
    console.log(`📝 Nom de fichier généré: ${filename} (type: ${eventType}, ID: ${eventId})`);
    
    // Chemin complet du fichier
    const filePath = path.join(BASE_IMAGE_DIR, subdir, filename);
    console.log(`📂 Chemin complet du fichier: ${filePath}`);
    
    // Télécharger l'image
    console.log(`🔄 Téléchargement de l'image: ${imageUrl} (${eventType}, ID: ${eventId})`);
    
    // Faire une requête HTTP pour obtenir l'image
    const response = await fetch(imageUrl);
    
    // Vérifier que la requête a réussi
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
    }
    
    // Vérifier le Content-Type pour s'assurer qu'il s'agit bien d'une image
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.startsWith('image/')) {
      console.error(`❌ Le contenu n'est pas une image: ${contentType}`);
      await logProblematicImage(imageUrl, `Le contenu n'est pas une image: ${contentType}`, {
        id: eventId,
        type: eventType,
        title: eventTitle,
        day: eventDay
      });
      return null;
    }
    
    // Obtenir le buffer de l'image
    const buffer = Buffer.from(await response.arrayBuffer());
    
    // Vérifier que l'image est valide
    const isValid = await validateImageBuffer(buffer);
    if (!isValid) {
      console.error(`❌ Image invalide: ${imageUrl}`);
      await logProblematicImage(imageUrl, "Image invalide après téléchargement", {
        id: eventId,
        type: eventType,
        title: eventTitle,
        day: eventDay
      });
      return null;
    }
    
    // Optimiser l'image avant de la sauvegarder
    try {
      // Déterminer les dimensions maximales en fonction du type d'image
      const maxWidth = isSpeakerImage ? 128 : 600;
      const maxHeight = isSpeakerImage ? 128 : 450;
      
      // Obtenir les métadonnées de l'image
      const metadata = await sharp(buffer).metadata();
      
      // Vérifier les dimensions extrêmes
      if (metadata.width && metadata.height) {
        // Images trop petites (moins de 10px dans une dimension)
        if (metadata.width < 10 || metadata.height < 10) {
          console.warn(`⚠️ Image trop petite: ${imageUrl} (${metadata.width}x${metadata.height})`);
          await logProblematicImage(imageUrl, `Image trop petite: ${metadata.width}x${metadata.height}`, {
            id: eventId,
            type: eventType,
            title: eventTitle,
            day: eventDay
          });
        }
        
        // Images trop grandes (plus de 4000px dans une dimension)
        if (metadata.width > 4000 || metadata.height > 4000) {
          console.warn(`⚠️ Image très grande: ${imageUrl} (${metadata.width}x${metadata.height})`);
          await logProblematicImage(imageUrl, `Image très grande: ${metadata.width}x${metadata.height}`, {
            id: eventId,
            type: eventType,
            title: eventTitle,
            day: eventDay
          });
        }
        
        // Images avec ratio extrême (très allongées)
        const ratio = Math.max(metadata.width / metadata.height, metadata.height / metadata.width);
        if (ratio > 3) {
          console.warn(`⚠️ Image avec ratio extrême: ${imageUrl} (${metadata.width}x${metadata.height}, ratio: ${ratio.toFixed(2)})`);
          await logProblematicImage(imageUrl, `Image avec ratio extrême: ${ratio.toFixed(2)}`, {
            id: eventId,
            type: eventType,
            title: eventTitle,
            day: eventDay
          });
        }
      }
      
      // Redimensionner l'image si nécessaire
      let resizedImage = sharp(buffer);
      
      if (metadata.width && metadata.height) {
        // Calculer les nouvelles dimensions en préservant le ratio
        const ratio = Math.min(
          maxWidth / metadata.width,
          maxHeight / metadata.height,
          1 // Ne pas agrandir les petites images
        );
        
        const newWidth = Math.round(metadata.width * ratio);
        const newHeight = Math.round(metadata.height * ratio);
        
        // Redimensionner l'image seulement si nécessaire
        if (ratio < 1) {
          console.log(`🔄 Redimensionnement de l'image: ${imageUrl} (${metadata.width}x${metadata.height} -> ${newWidth}x${newHeight})`);
          resizedImage = resizedImage.resize(newWidth, newHeight);
        }
      }
      
      // Convertir en WebP pour une meilleure compatibilité avec Astro
      const webpFilePath = filePath.replace(/\.[^.]+$/, '.webp');
      
      // Définir la qualité en fonction du type d'image
      const quality = isSpeakerImage ? 80 : 75; // Qualité plus basse pour les images normales
      
      // Sauvegarder l'image optimisée avec des options de compression améliorées
      await resizedImage
        .webp({ 
          quality, 
          effort: 4,       // Niveau d'effort de compression (0-6, 6 étant le plus lent mais le plus efficace)
          lossless: false, // Compression avec perte pour réduire la taille
          nearLossless: false
        })
        .toFile(webpFilePath);
      
      console.log(`✅ Image téléchargée et optimisée: ${webpFilePath}`);
      
      // Chemin relatif pour l'import dans Astro
      const resultPath = `~/assets/images/events/${subdir}/${path.basename(webpFilePath)}`;
      
      // Mettre en cache le résultat
      imageUrlCache.set(imageUrl, resultPath);
      
      return resultPath;
    } catch (optimizeError) {
      console.error(`⚠️ Erreur lors de l'optimisation de l'image, sauvegarde de l'original:`, formatError(optimizeError));
      await logProblematicImage(imageUrl, `Erreur d'optimisation: ${formatError(optimizeError)}`, {
        id: eventId,
        type: eventType,
        title: eventTitle,
        day: eventDay
      });
      
      // En cas d'erreur d'optimisation, sauvegarder l'image originale
      await fsPromises.writeFile(filePath, buffer);
      console.log(`✅ Image originale sauvegardée: ${filePath}`);
      
      // Chemin relatif pour l'import dans Astro
      const resultPath = `~/assets/images/events/${subdir}/${filename}`;
      
      // Mettre en cache le résultat
      imageUrlCache.set(imageUrl, resultPath);
      
      return resultPath;
    }
  } catch (error: unknown) {
    console.error(`❌ Erreur lors du téléchargement de l'image: ${imageUrl}`, formatError(error));
    await logProblematicImage(imageUrl, `Erreur de téléchargement: ${formatError(error)}`, {
      id: eventId,
      type: eventType,
      title: eventTitle,
      day: eventDay
    });
    return null;
  }
};

/**
 * Nettoie les images corrompues du répertoire
 * @param eventId Identifiant de l'événement
 * @param eventType Type d'événement
 * @param isSpeakerImage Indique s'il s'agit d'une image de conférencier
 */
export const cleanupCorruptedImage = async (
  eventId: string,
  eventType: string,
  isSpeakerImage: boolean = false
): Promise<void> => {
  try {
    // Déterminer le sous-répertoire en fonction du type d'événement
    const subDir = isSpeakerImage ? 'speakers' : eventType.toLowerCase();
    const targetDir = path.join(BASE_IMAGE_DIR, subDir);
    
    // Préfixe pour les images de conférenciers
    const prefix = isSpeakerImage ? 'speaker-' : '';
    
    // Vérifier les extensions courantes
    const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    
    for (const ext of extensions) {
      const fileName = `${prefix}${eventId}${ext}`;
      const filePath = path.join(targetDir, fileName);
      
      if (fs.existsSync(filePath)) {
        console.log(`🗑️ Suppression de l'image corrompue: ${filePath}`);
        await fsPromises.unlink(filePath);
      }
    }
  } catch (error) {
    console.error(`❌ Erreur lors du nettoyage de l'image corrompue:`, error);
  }
};

/**
 * Traite les images pour tous les événements
 * @param events Liste des événements à traiter
 * @returns Liste des événements avec les chemins d'images mis à jour
 */
export const processEventImages = async (events: Event[]): Promise<Event[]> => {
  // Créer les répertoires nécessaires
  await createImageDirectories();
  
  // NOTE: Nous ne normalisons plus automatiquement les noms à chaque traitement
  // car les nouvelles images seront toujours créées avec le bon format.
  // La fonction normalizeImageFilenames reste disponible pour la migration initiale.
  
  // Traiter chaque événement
  const processedEvents = await Promise.all(
    events.map(async (event) => {
      const eventCopy = { ...event } as ProcessedEvent;
      
      // Traiter l'image principale de l'événement
      if (event.image && typeof event.image === 'string' && isValidImage(event.image)) {
        try {
          // Vérifier si l'image a déjà un chemin local
          if (event.image.startsWith('~/assets/')) {
            // Normaliser le chemin pour éviter les redondances
            const pathParts = event.image.split('/');
            const filename = pathParts.pop() || '';
            const directory = pathParts.join('/');
            
            // Extraire le préfixe de base pour le nom de fichier
            let basePrefix;
            if (event.type === 'Conférences') {
              basePrefix = 'conference';
            } else if (event.type === 'Ateliers') {
              basePrefix = 'atelier';
            } else if (event.type === 'Stands') {
              basePrefix = 'stand';
            } else {
              // Convertir le type en string pour éviter l'erreur "toLowerCase n'existe pas sur le type 'never'"
              const typeStr = String(event.type).toLowerCase();
              basePrefix = typeStr.endsWith('s') 
                ? typeStr.slice(0, -1) 
                : typeStr;
            }
            
            // Vérifier si le nom de fichier contient une redondance
            const redundantPrefix = `${basePrefix}-${basePrefix}-`;
            if (filename.startsWith(redundantPrefix)) {
              // Extraire l'ID numérique si possible
              const idMatch = filename.match(new RegExp(`${redundantPrefix}(\\d+)`));
              if (idMatch && idMatch[1]) {
                // Utiliser uniquement l'ID numérique avec le préfixe correct
                const correctedFilename = `${basePrefix}-${idMatch[1]}${path.extname(filename)}`;
                const correctedPath = `${directory}/${correctedFilename}`;
                
                console.log(`🔄 Correction de redondance de type: ${filename} -> ${correctedFilename}`);
                
                // Vérifier si le fichier existe avec le nouveau nom
                const normalizedPath = correctedPath.replace('~/', 'src/');
                const originalPath = event.image.replace('~/', 'src/');
                
                if (fs.existsSync(normalizedPath)) {
                  // Utiliser le chemin corrigé
                  eventCopy.image = correctedPath;
                  eventCopy.imageDownloaded = true;
                  console.log(`✅ Chemin d'image corrigé: ${correctedPath}`);
                } else if (fs.existsSync(originalPath)) {
                  // Garder le chemin original si le fichier existe
                  eventCopy.image = event.image;
                  eventCopy.imageDownloaded = true;
                  console.log(`⚠️ Fichier trouvé avec l'ancien chemin: ${event.image}`);
                } else {
                  // Aucun fichier trouvé, essayer de télécharger à nouveau
                  console.log(`⚠️ Aucun fichier trouvé, tentative de téléchargement: ${event.image}`);
                  const downloadedImagePath = await downloadImage(
                    event.image,
                    event.type,
                    event.id,
                    false,
                    event.title,
                    event.day
                  );
                  
                  if (downloadedImagePath) {
                    eventCopy.image = downloadedImagePath;
                    eventCopy.imageDownloaded = true;
                  }
                }
              }
            } else {
              // Le chemin est déjà correct
              eventCopy.image = event.image;
              eventCopy.imageDownloaded = true;
            }
          } else {
            // Télécharger l'image si elle n'a pas encore été téléchargée
            const downloadedImagePath = await downloadImage(
              event.image,
              event.type,
              event.id,
              false,
              event.title,
              event.day
            );
            
            if (downloadedImagePath) {
              eventCopy.image = downloadedImagePath;
              eventCopy.imageDownloaded = true;
            }
          }
        } catch (error) {
          console.error(`❌ Erreur lors du traitement de l'image pour ${event.id}:`, error);
          // Nettoyer l'image corrompue si elle existe
          await cleanupCorruptedImage(event.id, event.type, false);
        }
      }
      
      // Traiter l'image du conférencier si présente
      if (event.speakerImage && typeof event.speakerImage === 'string' && isValidImage(event.speakerImage)) {
        try {
          // Vérifier si l'image a déjà un chemin local
          if (event.speakerImage.startsWith('~/assets/')) {
            // Normaliser le chemin pour éviter les redondances
            const pathParts = event.speakerImage.split('/');
            const filename = pathParts.pop() || '';
            const directory = pathParts.join('/');
            
            // Extraire le préfixe de base pour le nom de fichier
            let basePrefix;
            if (event.type === 'Conférences') {
              basePrefix = 'conference';
            } else if (event.type === 'Ateliers') {
              basePrefix = 'atelier';
            } else if (event.type === 'Stands') {
              basePrefix = 'stand';
            } else {
              // Convertir le type en string pour éviter l'erreur "toLowerCase n'existe pas sur le type 'never'"
              const typeStr = String(event.type).toLowerCase();
              basePrefix = typeStr.endsWith('s') 
                ? typeStr.slice(0, -1) 
                : typeStr;
            }
            
            // Vérifier si le nom de fichier contient une redondance
            const redundantPrefix = `${basePrefix}-${basePrefix}-`;
            if (filename.startsWith(redundantPrefix)) {
              // Extraire l'ID numérique si possible
              const idMatch = filename.match(new RegExp(`${redundantPrefix}(\\d+)`));
              if (idMatch && idMatch[1]) {
                // Utiliser uniquement l'ID numérique avec le préfixe correct
                const correctedFilename = `${basePrefix}-${idMatch[1]}${path.extname(filename)}`;
                const correctedPath = `${directory}/${correctedFilename}`;
                
                console.log(`🔄 Correction de redondance de type: ${filename} -> ${correctedFilename}`);
                
                // Vérifier si le fichier existe avec le nouveau nom
                const normalizedPath = correctedPath.replace('~/', 'src/');
                const originalPath = event.speakerImage.replace('~/', 'src/');
                
                if (fs.existsSync(normalizedPath)) {
                  // Utiliser le chemin corrigé
                  eventCopy.speakerImage = correctedPath;
                  eventCopy.speakerImageDownloaded = true;
                  console.log(`✅ Chemin d'image de conférencier corrigé: ${correctedPath}`);
                } else if (fs.existsSync(originalPath)) {
                  // Garder le chemin original si le fichier existe
                  eventCopy.speakerImage = event.speakerImage;
                  eventCopy.speakerImageDownloaded = true;
                  console.log(`⚠️ Fichier de conférencier trouvé avec l'ancien chemin: ${event.speakerImage}`);
                } else {
                  // Aucun fichier trouvé, essayer de télécharger à nouveau
                  console.log(`⚠️ Aucun fichier de conférencier trouvé, tentative de téléchargement: ${event.speakerImage}`);
                  const downloadedSpeakerImagePath = await downloadImage(
                    event.speakerImage,
                    event.type,
                    event.id,
                    true,
                    event.title,
                    event.day
                  );
                  
                  if (downloadedSpeakerImagePath) {
                    eventCopy.speakerImage = downloadedSpeakerImagePath;
                    eventCopy.speakerImageDownloaded = true;
                  }
                }
              }
            } else {
              // Le chemin est déjà correct
              eventCopy.speakerImage = event.speakerImage;
              eventCopy.speakerImageDownloaded = true;
            }
          } else {
            // Télécharger l'image si elle n'a pas encore été téléchargée
            const downloadedSpeakerImagePath = await downloadImage(
              event.speakerImage,
              event.type,
              event.id,
              true,
              event.title,
              event.day
            );
            
            if (downloadedSpeakerImagePath) {
              eventCopy.speakerImage = downloadedSpeakerImagePath;
              eventCopy.speakerImageDownloaded = true;
            }
          }
        } catch (error) {
          console.error(`❌ Erreur lors du traitement de l'image de conférencier pour ${event.id}:`, error);
          // Nettoyer l'image corrompue si elle existe
          await cleanupCorruptedImage(event.id, event.type, true);
        }
      }
      
      return eventCopy;
    })
  );
  
  console.log(`✅ Traitement des images terminé pour ${processedEvents.length} événements`);
  return processedEvents;
};

/**
 * Convertit une erreur de type unknown en chaîne de caractères
 * @param error L'erreur à convertir
 * @returns La représentation en chaîne de caractères de l'erreur
 */
const formatError = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

/**
 * Vérifie une image existante et journalise les problèmes
 * @param imagePath Chemin de l'image à vérifier
 * @param _isSpeakerImage Indique s'il s'agit d'une image de conférencier (non utilisé)
 * @returns true si l'image est valide, false sinon
 */
export const optimizeExistingImage = async (
  imagePath: string,
  _isSpeakerImage: boolean = false
): Promise<boolean> => {
  try {
    // Vérifier si le fichier existe
    if (!fs.existsSync(imagePath)) {
      console.error(`❌ Image non trouvée: ${imagePath}`);
      return false;
    }
    
    // Vérifier la taille du fichier
    const stats = await fsPromises.stat(imagePath);
    if (stats.size === 0) {
      console.error(`❌ Fichier image vide: ${imagePath}`);
      await logProblematicImage(imagePath, "Fichier image vide (0 octets)", {
        id: '',
        type: '',
        title: '',
        day: ''
      });
      
      // Supprimer le fichier vide
      try {
        await fsPromises.unlink(imagePath);
        console.log(`🗑️ Fichier vide supprimé: ${imagePath}`);
      } catch (deleteError) {
        console.error(`❌ Erreur lors de la suppression du fichier vide: ${imagePath}`, formatError(deleteError));
      }
      
      return false;
    }
    
    if (stats.size < 100) {
      console.warn(`⚠️ Fichier image très petit: ${imagePath} (${stats.size} octets)`);
      await logProblematicImage(imagePath, `Fichier image très petit (${stats.size} octets)`, {
        id: '',
        type: '',
        title: '',
        day: ''
      });
    }
    
    // Lire le fichier
    const buffer = await fsPromises.readFile(imagePath);
    
    // Vérifier que l'image est valide
    const isValid = await validateImageBuffer(buffer);
    if (!isValid) {
      console.error(`❌ Image invalide: ${imagePath}`);
      // Journaliser l'image problématique
      await logProblematicImage(imagePath, "Image invalide", {
        id: '',
        type: '',
        title: '',
        day: ''
      });
      return false;
    }
    
    // Obtenir les métadonnées de l'image pour vérification
    const metadata = await sharp(buffer).metadata();
    
    // Vérifier les dimensions extrêmes (trop grandes ou trop petites)
    if (metadata.width && metadata.height) {
      // Images trop petites (moins de 10px dans une dimension)
      if (metadata.width < 10 || metadata.height < 10) {
        console.warn(`⚠️ Image trop petite: ${imagePath} (${metadata.width}x${metadata.height})`);
        await logProblematicImage(imagePath, `Image trop petite: ${metadata.width}x${metadata.height}`, {
          id: '',
          type: '',
          title: '',
          day: ''
        });
      }
      
      // Images trop grandes (plus de 4000px dans une dimension)
      if (metadata.width > 4000 || metadata.height > 4000) {
        console.warn(`⚠️ Image très grande: ${imagePath} (${metadata.width}x${metadata.height})`);
        await logProblematicImage(imagePath, `Image très grande: ${metadata.width}x${metadata.height}`, {
          id: '',
          type: '',
          title: '',
          day: ''
        });
      }
      
      // Images avec ratio extrême (très allongées)
      const ratio = Math.max(metadata.width / metadata.height, metadata.height / metadata.width);
      if (ratio > 3) {
        console.warn(`⚠️ Image avec ratio extrême: ${imagePath} (${metadata.width}x${metadata.height}, ratio: ${ratio.toFixed(2)})`);
        await logProblematicImage(imagePath, `Image avec ratio extrême: ${ratio.toFixed(2)}`, {
          id: '',
          type: '',
          title: '',
          day: ''
        });
      }
    }
    
    // console.log(`✅ Image vérifiée avec succès: ${imagePath}`);
    return true;
  } catch (error: unknown) {
    console.error(`❌ Erreur lors de la vérification de l'image: ${imagePath}`, formatError(error));
    // Journaliser l'image problématique
    await logProblematicImage(imagePath, `Erreur: ${formatError(error)}`, {
      id: '',
      type: '',
      title: '',
      day: ''
    });
    return false;
  }
};

/**
 * Nettoie les fichiers de logs pour éviter qu'ils ne deviennent trop volumineux
 * - Limite le nombre d'entrées dans le fichier de log
 * - Supprime les logs trop anciens
 */
export const cleanupLogs = async (): Promise<void> => {
  try {
    const logDir = path.join(BASE_IMAGE_DIR, 'logs');
    const logFile = path.join(logDir, 'problematic-images.log');
    
    // Vérifier si le fichier de log existe
    if (!fs.existsSync(logFile)) {
      console.log('ℹ️ Aucun fichier de log à nettoyer');
      return;
    }
    
    // Lire le contenu du fichier de log
    const logContent = await fsPromises.readFile(logFile, 'utf-8');
    const logEntries = logContent.split('\n\n').filter(entry => entry.trim() !== '');
    
    // Si le nombre d'entrées est inférieur à la limite, pas besoin de nettoyer
    if (logEntries.length <= MAX_LOG_ENTRIES) {
      console.log(`ℹ️ Le fichier de log contient ${logEntries.length} entrées, pas besoin de nettoyage`);
      return;
    }
    
    console.log(`🧹 Nettoyage du fichier de log (${logEntries.length} entrées -> ${MAX_LOG_ENTRIES} entrées)`);
    
    // Filtrer les entrées pour ne garder que les plus récentes
    const recentEntries = logEntries
      .filter(entry => {
        // Extraire la date de l'entrée
        const timestampMatch = entry.match(/\[(.*?)\]/);
        if (!timestampMatch) return true; // Garder les entrées sans timestamp
        
        const timestamp = new Date(timestampMatch[1]);
        const now = new Date();
        const ageInDays = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
        
        // Garder les entrées de moins de MAX_LOG_AGE_DAYS jours
        return ageInDays <= MAX_LOG_AGE_DAYS;
      })
      .slice(-MAX_LOG_ENTRIES); // Ne garder que les MAX_LOG_ENTRIES plus récentes
    
    // Réécrire le fichier de log avec les entrées filtrées
    const newLogContent = '# Images problématiques\n\n' + recentEntries.join('\n\n') + '\n\n';
    await fsPromises.writeFile(logFile, newLogContent);
    
    console.log(`✅ Fichier de log nettoyé (${recentEntries.length} entrées conservées)`);
    
    // Mettre à jour le rapport HTML
    await updateProblematicImagesReport();
  } catch (error) {
    console.error(`❌ Erreur lors du nettoyage des logs: ${formatError(error)}`);
  }
};

/**
 * Journalise une image problématique dans un fichier de log
 * @param imagePath Chemin de l'image ou URL problématique
 * @param reason Raison pour laquelle l'image est problématique
 * @param eventInfo Informations supplémentaires sur l'événement associé
 */
export const logProblematicImage = async (
  imagePath: string, 
  reason: string,
  eventInfo?: { 
    id?: string; 
    title?: string; 
    type?: string;
    day?: string;
  }
): Promise<void> => {
  try {
    const logDir = path.join(BASE_IMAGE_DIR, 'logs');
    const logFile = path.join(logDir, 'problematic-images.log');
    
    // Créer le répertoire de logs s'il n'existe pas
    if (!fs.existsSync(logDir)) {
      await fsPromises.mkdir(logDir, { recursive: true });
    }
    
    // Créer le fichier de log s'il n'existe pas
    if (!fs.existsSync(logFile)) {
      await fsPromises.writeFile(logFile, '# Images problématiques\n\n');
    }
    
    // Ajouter l'entrée au fichier de log
    const timestamp = new Date().toISOString();
    let logEntry = `[${timestamp}] ${imagePath} - ${reason}`;
    
    // Ajouter les informations sur l'événement si disponibles
    if (eventInfo) {
      logEntry += '\nInfos événement:';
      if (eventInfo.id) logEntry += `\n  - ID: ${eventInfo.id}`;
      if (eventInfo.title) logEntry += `\n  - Titre: ${eventInfo.title}`;
      if (eventInfo.type) logEntry += `\n  - Type: ${eventInfo.type}`;
      if (eventInfo.day) logEntry += `\n  - Jour: ${eventInfo.day}`;
    }
    
    logEntry += '\n\n';
    
    await fsPromises.appendFile(logFile, logEntry);
    console.log(`📝 Image problématique journalisée: ${imagePath}`);
    
    // Nettoyer les logs si nécessaire (une fois sur 10 pour éviter de le faire trop souvent)
    if (Math.random() < 0.1) {
      await cleanupLogs();
    } else {
      // Mettre à jour le rapport HTML
      await updateProblematicImagesReport();
    }
  } catch (error: unknown) {
    console.error(`❌ Erreur lors de la journalisation de l'image problématique: ${formatError(error)}`);
  }
};

/**
 * Crée ou met à jour un rapport HTML des images problématiques
 */
export const updateProblematicImagesReport = async (): Promise<void> => {
  try {
    // Vérifier si une mise à jour est nécessaire (éviter les mises à jour trop fréquentes)
    const now = Date.now();
    if (now - lastReportUpdate < REPORT_UPDATE_INTERVAL) {
      console.log(`⏱️ Mise à jour du rapport ignorée (dernière mise à jour il y a ${Math.floor((now - lastReportUpdate) / 1000)}s)`);
      return;
    }
    
    // Lire le fichier de log
    const logPath = path.join(BASE_IMAGE_DIR, 'logs', 'problematic-images.log');
    if (!fs.existsSync(logPath)) {
      console.log('⚠️ Aucun fichier de log trouvé, création d\'un rapport vide');
      return;
    }
    
    const logContent = await fsPromises.readFile(logPath, 'utf-8');
    const logEntries = logContent.split('\n\n').filter(entry => entry.trim() !== '');
    
    // Créer le contenu HTML
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rapport d'images problématiques</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #e4451e;
          border-bottom: 2px solid #e4451e;
          padding-bottom: 10px;
        }
        .entry {
          background-color: #f9f9f9;
          border-left: 4px solid #e4451e;
          margin-bottom: 20px;
          padding: 15px;
          border-radius: 0 4px 4px 0;
        }
        .entry h3 {
          margin-top: 0;
          color: #e4451e;
        }
        .entry p {
          margin: 5px 0;
        }
        .entry .url {
          word-break: break-all;
          font-family: monospace;
          background-color: #f0f0f0;
          padding: 5px;
          border-radius: 3px;
        }
        .entry .reason {
          font-weight: bold;
          color: #d32f2f;
        }
        .entry .info {
          color: #555;
        }
        .summary {
          background-color: #fff5f2;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <h1>Rapport d'images problématiques</h1>
      <div class="summary">
        <p><strong>Nombre total d'images problématiques :</strong> ${logEntries.length}</p>
        <p><strong>Dernière mise à jour :</strong> ${new Date().toLocaleString('fr-FR')}</p>
      </div>
      ${logEntries.map(entry => {
        // Extraire les informations de l'entrée
        const urlMatch = entry.match(/\[.*?\] (.*?) -/);
        const reasonMatch = entry.match(/- (.*?)(\n|$)/);
        const infoMatch = entry.match(/Infos événement:([\s\S]*?)(\n\n|$)/);
        
        const url = urlMatch ? urlMatch[1] : 'URL inconnue';
        const reason = reasonMatch ? reasonMatch[1] : 'Raison inconnue';
        const info = infoMatch ? infoMatch[1].trim() : '';
        
        return `
        <div class="entry">
          <h3>${reason}</h3>
          <p class="url">${url}</p>
          <div class="info">
            <pre>${info}</pre>
          </div>
        </div>
        `;
      }).join('')}
    </body>
    </html>
    `;
    
    // Écrire le fichier HTML
    const reportPath = path.join(BASE_IMAGE_DIR, 'logs', 'problematic-images-report.html');
    await fsPromises.writeFile(reportPath, htmlContent);
    
    // Mettre à jour le timestamp de la dernière mise à jour
    lastReportUpdate = now;
    
    console.log(`✅ Rapport HTML généré: ${reportPath}`);
  } catch (error) {
    console.error('❌ Erreur lors de la génération du rapport HTML:', error);
  }
};

/**
 * Optimise toutes les images existantes
 */
export const optimizeAllExistingImages = async (): Promise<void> => {
  try {
    console.log('🔄 Début de l\'optimisation des images existantes...');
    
    // NOTE: Nous ne normalisons plus automatiquement les noms à chaque optimisation
    // Cette normalisation peut être exécutée manuellement via le script de migration
    // ou une commande dédiée si nécessaire.
    
    // Répertoires des différents types d'événements
    const eventDirs = [
      path.join(BASE_IMAGE_DIR, 'conferences'),
      path.join(BASE_IMAGE_DIR, 'ateliers'),
      path.join(BASE_IMAGE_DIR, 'stands')
    ];
    
    // Récupérer tous les fichiers d'images
    let optimizedCount = 0;
    
    for (const eventDir of eventDirs) {
      try {
        const files = await fsPromises.readdir(eventDir);
        
        for (const file of files) {
          if (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png') || file.endsWith('.webp')) {
            const filePath = path.join(eventDir, file);
            const success = await optimizeExistingImage(filePath);
            
            if (success) {
              optimizedCount++;
            }
          }
        }
      } catch (error) {
        // Si le répertoire n'existe pas, on le crée simplement et on continue
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          await fsPromises.mkdir(eventDir, { recursive: true });
        } else {
          console.error(`❌ Erreur lors de la lecture du répertoire ${eventDir}:`, error);
        }
      }
    }
    
    console.log(`✅ Optimisation des images existantes terminée. ${optimizedCount} images optimisées.`);
  } catch (error) {
    console.error("❌ Erreur lors de l'optimisation des images existantes:", error);
  }
};

/**
 * Renomme les fichiers d'images pour uniformiser les noms
 * @returns Le nombre de fichiers renommés
 */
export const normalizeImageFilenames = async (): Promise<number> => {
  try {
    console.log("🔄 Début de la normalisation des noms de fichiers d'images...");
    
    // Créer les répertoires nécessaires
    await createImageDirectories();
    
    // Types d'événements
    const eventTypes = ['conferences', 'ateliers', 'stands'];
    let renamedCount = 0;
    const standsMap = new Map(); // Pour regrouper les fichiers des stands par ID
    
    // Parcourir tous les types d'événements
    for (const type of eventTypes) {
      const typeDir = path.join(BASE_IMAGE_DIR, type);
      
      // Vérifier si le répertoire existe
      if (!fs.existsSync(typeDir)) {
        console.log(`⚠️ Le répertoire ${typeDir} n'existe pas, création...`);
        await fsPromises.mkdir(typeDir, { recursive: true });
        continue;
      }
      
      // Lire tous les fichiers du répertoire
      const files = await fsPromises.readdir(typeDir);
      console.log(`📂 Traitement de ${files.length} fichiers dans ${typeDir}`);
      
      // Extraire le préfixe du type d'événement (atelier, conference, stand)
      const basePrefix = type.slice(0, -1); // 'conference', 'atelier', 'stand'
      
      // Pour les stands, d'abord regrouper tous les fichiers par ID de stand
      if (type === 'stands') {
        for (const file of files) {
          // Ignorer les fichiers qui ne sont pas des images
          if (!file.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
            continue;
          }
          
          // Extraire l'ID du stand du nom de fichier
          let standId = '';
          const idMatch = file.match(new RegExp(`${basePrefix}(-${basePrefix})?-(\\d+)`));
          
          if (idMatch && idMatch[2]) {
            standId = idMatch[2];
            
            // Si c'est la première fois qu'on voit ce stand, l'ajouter à la map
            if (!standsMap.has(standId)) {
              standsMap.set(standId, {
                files: [],
                sizes: []
              });
            }
            
            // Ajouter ce fichier à la liste des fichiers pour ce stand
            const filePath = path.join(typeDir, file);
            const stats = await fsPromises.stat(filePath);
            standsMap.get(standId).files.push(file);
            standsMap.get(standId).sizes.push(stats.size);
          }
        }
        
        // Maintenant, pour chaque stand, ne garder que le plus grand fichier
        for (const [standId, data] of standsMap.entries()) {
          // S'il n'y a qu'un seul fichier, le renommer directement
          if (data.files.length === 1) {
            const oldName = data.files[0];
            const newName = `${basePrefix}-${standId}.webp`;
            
            // Si le nom est déjà correct, passer au suivant
            if (oldName === newName) {
              continue;
            }
            
            const oldPath = path.join(typeDir, oldName);
            const newPath = path.join(typeDir, newName);
            
            console.log(`🔄 Renommage de ${oldName} en ${newName}`);
            await fsPromises.rename(oldPath, newPath);
            renamedCount++;
          } 
          // S'il y a plusieurs fichiers, garder le plus grand
          else if (data.files.length > 1) {
            // Trouver l'index du plus grand fichier
            const maxSizeIndex = data.sizes.indexOf(Math.max(...data.sizes));
            const bestFile = data.files[maxSizeIndex];
            const newName = `${basePrefix}-${standId}.webp`;
            
            // Renommer le meilleur fichier
            const bestFilePath = path.join(typeDir, bestFile);
            const newPath = path.join(typeDir, newName);
            
            // S'il existe déjà un fichier avec le nouveau nom et que ce n'est pas le meilleur
            if (fs.existsSync(newPath) && bestFile !== newName) {
              await fsPromises.unlink(newPath); // Supprimer l'ancien
            }
            
            if (bestFile !== newName) {
              console.log(`🔄 Renommage de ${bestFile} (plus grand) en ${newName}`);
              await fsPromises.rename(bestFilePath, newPath);
              renamedCount++;
            }
            
            // Supprimer tous les autres fichiers
            for (let i = 0; i < data.files.length; i++) {
              if (i !== maxSizeIndex) {
                const filePath = path.join(typeDir, data.files[i]);
                console.log(`🗑️ Suppression de ${data.files[i]} (doublon de ${newName})`);
                await fsPromises.unlink(filePath);
              }
            }
          }
        }
      } 
      // Pour les ateliers et conférences, correction simple des redondances
      else {
        // Traiter chaque fichier
        for (const file of files) {
          // Ignorer les fichiers qui ne sont pas des images
          if (!file.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
            continue;
          }
          
          let newFilename = file;
          
          // 1. Corriger les redondances de type (atelier-atelier-XX -> atelier-XX)
          const redundantPrefix = `${basePrefix}-${basePrefix}-`;
          if (file.startsWith(redundantPrefix)) {
            // Extraire l'ID numérique si possible
            const idMatch = file.match(new RegExp(`${redundantPrefix}(\\d+)`));
            if (idMatch && idMatch[1]) {
              // Utiliser uniquement l'ID numérique avec le préfixe correct
              newFilename = `${basePrefix}-${idMatch[1]}${path.extname(file)}`;
            } else {
              // Fallback à la méthode simple de remplacement
              newFilename = file.replace(redundantPrefix, `${basePrefix}-`);
            }
            console.log(`👉 Correction de redondance de type: ${file} -> ${newFilename}`);
          }
          
          // Si le nom n'a pas changé, passer au fichier suivant
          if (file === newFilename) {
            continue;
          }
          
          // Renommer le fichier
          const oldPath = path.join(typeDir, file);
          const newPath = path.join(typeDir, newFilename);
          
          // Vérifier si le nouveau fichier existe déjà
          if (fs.existsSync(newPath)) {
            console.warn(`⚠️ Le fichier ${newFilename} existe déjà, comparaison des tailles...`);
            
            // Comparer les tailles des fichiers
            const oldStats = await fsPromises.stat(oldPath);
            const newStats = await fsPromises.stat(newPath);
            
            if (oldStats.size > newStats.size) {
              // L'ancien fichier est plus grand, le garder et remplacer le nouveau
              console.log(`🔄 Remplacement de ${newFilename} par ${file} (plus grand)`);
              await fsPromises.unlink(newPath);
              await fsPromises.rename(oldPath, newPath);
              renamedCount++;
            } else {
              // Le nouveau fichier est plus grand ou de même taille, supprimer l'ancien
              console.log(`🗑️ Suppression de ${file} (${newFilename} est plus grand ou identique)`);
              await fsPromises.unlink(oldPath);
            }
          } else {
            // Renommer simplement le fichier
            console.log(`🔄 Renommage de ${file} en ${newFilename}`);
            await fsPromises.rename(oldPath, newPath);
            renamedCount++;
          }
        }
      }
    }
    
    console.log(`✅ Normalisation des noms de fichiers terminée. ${renamedCount} fichiers renommés.`);
    return renamedCount;
  } catch (error: unknown) {
    console.error("❌ Erreur lors de la normalisation des noms de fichiers:", formatError(error));
    return 0;
  }
}; 