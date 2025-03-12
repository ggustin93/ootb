// Script de génération des fichiers MDX pour les lives YouTube
// Ce script peut être exécuté au moment du build ou manuellement

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import slugify from 'slugify';

// Charger les variables d'environnement
dotenv.config();

// Obtenir le chemin du répertoire actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

// Déterminer si nous sommes en mode production
const IS_NETLIFY = process.env.NETLIFY === 'true';
const FORCE_PRODUCTION = process.env.FORCE_PRODUCTION === 'true';
const NODE_ENV_PRODUCTION = process.env.NODE_ENV === 'production';

// Si nous sommes sur Netlify ou si le mode production est forcé ou si NODE_ENV est production
const IS_PRODUCTION = IS_NETLIFY || FORCE_PRODUCTION || NODE_ENV_PRODUCTION;

console.log(`🔧 Environnement de build des lives YouTube:`);
console.log(`   - Netlify: ${IS_NETLIFY ? 'Oui' : 'Non'}`);
console.log(`   - Force Production: ${FORCE_PRODUCTION ? 'Oui' : 'Non'}`);
console.log(`   - NODE_ENV Production: ${NODE_ENV_PRODUCTION ? 'Oui' : 'Non'}`);
console.log(`   - Mode Production: ${IS_PRODUCTION ? 'Oui' : 'Non'}`);

// Répertoire de destination pour les fichiers MDX
const LIVES_DIR = path.join(ROOT_DIR, 'src', 'content', 'post', '3_LIVES');

// Répertoire pour sauvegarder les données brutes
const RAW_DATA_DIR = path.join(ROOT_DIR, 'data', 'raw');

// Fichier où seront stockées les données brutes
const RAW_DATA_FILENAME = 'youtube_lives_raw.json';
const RAW_DATA_PATH = path.join(RAW_DATA_DIR, RAW_DATA_FILENAME);

// Configuration YouTube
const YOUTUBE_PLAYLIST_ID = process.env.YOUTUBE_PLAYLIST_ID || 'PLxxxxxxxx'; // Remplacer par l'ID de votre playlist
const YOUTUBE_VIDEO_URL = process.env.YOUTUBE_VIDEO_URL || ''; // URL d'une vidéo spécifique (optionnel)
const EXPERT_NAME = process.env.EXPERT_NAME || ''; // Nom de l'expert (optionnel)
const MAX_VIDEOS = process.env.MAX_VIDEOS ? parseInt(process.env.MAX_VIDEOS, 10) : null; // Nombre maximum de vidéos à traiter

/**
 * Nettoie le répertoire des lives
 */
function cleanLivesDirectory() {
  try {
    if (fs.existsSync(LIVES_DIR)) {
      // Lire tous les fichiers MDX dans le répertoire (sauf README.md)
      const files = fs.readdirSync(LIVES_DIR)
        .filter(file => file.endsWith('.mdx') && file !== 'README.md');
      
      console.log(`🧹 Nettoyage du répertoire des lives: ${files.length} fichiers à supprimer...`);
      
      // Supprimer chaque fichier
      files.forEach(file => {
        const filePath = path.join(LIVES_DIR, file);
        fs.unlinkSync(filePath);
      });
      
      console.log(`✅ Répertoire nettoyé avec succès.`);
    } else {
      // Si le répertoire n'existe pas, le créer
      fs.mkdirSync(LIVES_DIR, { recursive: true });
      console.log(`📁 Répertoire créé: ${LIVES_DIR}`);
    }
  } catch (error) {
    console.error(`❌ Erreur lors du nettoyage du répertoire:`, error);
  }
}

/**
 * Sauvegarde les données brutes dans un fichier JSON
 */
function saveRawData(data, filename) {
  try {
    // Création du répertoire s'il n'existe pas
    if (!fs.existsSync(RAW_DATA_DIR)) {
      fs.mkdirSync(RAW_DATA_DIR, { recursive: true });
      console.log(`📁 Répertoire créé: ${RAW_DATA_DIR}`);
    }
    
    const filePath = path.join(RAW_DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Données brutes sauvegardées dans ${filePath}`);
  } catch (error) {
    console.error(`❌ Erreur lors de la sauvegarde des données brutes:`, error);
  }
}

/**
 * Vérifie si les données ont changé par rapport aux données précédemment sauvegardées
 * @param {Array} newData - Les nouvelles données récupérées de l'API
 * @returns {boolean} - True si les données ont changé, false sinon
 */
function checkIfDataChanged(newData) {
  try {
    // Vérifier si le fichier de données existe
    if (!fs.existsSync(RAW_DATA_PATH)) {
      console.log(`📝 Aucun fichier de données précédent trouvé. Génération requise.`);
      return true;
    }
    
    // Lire les anciennes données
    const oldDataRaw = fs.readFileSync(RAW_DATA_PATH, 'utf8');
    const oldData = JSON.parse(oldDataRaw);
    
    // Comparaison simple par nombre d'éléments
    if (oldData.length !== newData.length) {
      console.log(`📊 Différence de nombre d'éléments détectée (${oldData.length} vs ${newData.length}). Génération requise.`);
      return true;
    }
    
    // Vérifier si les identifiants et dates de mise à jour sont identiques
    const newDataMap = new Map(newData.map(item => [item.video_id, JSON.stringify(item)]));
    let hasChanges = false;
    
    for (const oldItem of oldData) {
      if (!oldItem.video_id) continue;
      
      // Si l'élément n'existe plus ou a été modifié
      if (!newDataMap.has(oldItem.video_id) || newDataMap.get(oldItem.video_id) !== JSON.stringify(oldItem)) {
        hasChanges = true;
        break;
      }
    }
    
    if (hasChanges) {
      console.log(`🔄 Modifications détectées dans les données. Génération requise.`);
    } else {
      console.log(`✅ Aucune modification détectée dans les données. Génération non nécessaire.`);
    }
    
    return hasChanges;
  } catch (error) {
    console.error(`❌ Erreur lors de la vérification des données:`, error);
    // En cas d'erreur, on génère par sécurité
    return true;
  }
}

/**
 * Formate la durée en secondes en format lisible (1h30, 45min, etc.)
 * @param {number} seconds - Durée en secondes
 * @returns {string} - Durée formatée
 */
function formatDuration(seconds) {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}min`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (minutes > 0) {
      return `${hours}h${minutes}`;
    } else {
      return `${hours}h`;
    }
  }
}

/**
 * Récupère les informations d'une vidéo YouTube
 * @param {string} videoUrl - URL de la vidéo YouTube
 * @returns {Object} - Informations de la vidéo
 */
async function getVideoInfo(videoUrl) {
  try {
    console.log(`🔄 Récupération des informations pour ${videoUrl}...`);
    
    // Utiliser youtube-dl-exec pour récupérer les informations de la vidéo
    const command = `yt-dlp --dump-json --skip-download "${videoUrl}"`;
    const output = execSync(command, { encoding: 'utf8' });
    const info = JSON.parse(output);
    
    // Formatage de la date de publication
    let publishedAt = '';
    
    // Essayer d'abord d'utiliser release_date qui est plus fiable
    if (info.release_date && /^\d{8}$/.test(info.release_date)) {
      const releaseDate = info.release_date;
      publishedAt = `${releaseDate.substring(0, 4)}-${releaseDate.substring(4, 6)}-${releaseDate.substring(6, 8)}`;
    } 
    // Sinon, utiliser upload_date
    else if (info.upload_date && /^\d{8}$/.test(info.upload_date)) {
      const uploadDate = info.upload_date;
      publishedAt = `${uploadDate.substring(0, 4)}-${uploadDate.substring(4, 6)}-${uploadDate.substring(6, 8)}`;
    }
    // Si aucune date valide n'est trouvée, utiliser la date actuelle
    else {
      const now = new Date();
      publishedAt = now.toISOString().split('T')[0];
      console.warn(`⚠️ Aucune date valide trouvée pour ${videoUrl}, utilisation de la date actuelle: ${publishedAt}`);
    }
    
    // Vérifier que la date est valide
    try {
      const testDate = new Date(publishedAt);
      if (isNaN(testDate.getTime())) {
        // Si la date n'est pas valide, utiliser la date actuelle
        const now = new Date();
        publishedAt = now.toISOString().split('T')[0];
        console.warn(`⚠️ Date invalide pour ${videoUrl}, utilisation de la date actuelle: ${publishedAt}`);
      }
    } catch {
      // En cas d'erreur, utiliser la date actuelle
      const now = new Date();
      publishedAt = now.toISOString().split('T')[0];
      console.warn(`⚠️ Erreur lors de la validation de la date pour ${videoUrl}, utilisation de la date actuelle: ${publishedAt}`);
    }
    
    // Formatage de la durée
    const duration = formatDuration(info.duration || 0);
    
    // Récupération des tags
    const tags = info.tags || [];
    
    // Récupération de la miniature de taille intermédiaire
    let thumbnail = '';
    
    // Préférer une miniature de taille intermédiaire (sddefault) plutôt que trop petite ou trop grande
    if (info.id) {
      thumbnail = `https://i.ytimg.com/vi/${info.id}/sddefault.jpg`;
    } else if (info.thumbnails && info.thumbnails.length > 0) {
      // Chercher une miniature de taille intermédiaire (environ 640p)
      const mediumThumbnails = info.thumbnails.filter(t => 
        (t.width && t.width >= 480 && t.width <= 800) || 
        t.url.includes('sddefault') || 
        t.url.includes('mqdefault')
      );
      
      if (mediumThumbnails.length > 0) {
        // Trier par taille pour prendre la meilleure qualité dans la plage intermédiaire
        const sortedMedium = [...mediumThumbnails].sort((a, b) => (b.width || 0) - (a.width || 0));
        thumbnail = sortedMedium[0].url;
      } else {
        // Si pas de miniature intermédiaire, prendre une miniature disponible
        // en évitant les très grandes résolutions
        const availableThumbnails = [...info.thumbnails].filter(t => 
          !t.url.includes('maxresdefault') || !(t.width && t.width > 1000)
        );
        
        if (availableThumbnails.length > 0) {
          thumbnail = availableThumbnails[0].url;
        } else {
          thumbnail = info.thumbnails[0].url;
        }
      }
    }
    
    // Si toujours pas de miniature, utiliser l'URL standard en qualité intermédiaire
    if (!thumbnail) {
      thumbnail = `https://i.ytimg.com/vi/${info.id}/sddefault.jpg`;
    }
    
    return {
      title: info.title || 'Titre inconnu',
      video_id: info.id,
      video_url: videoUrl,
      thumbnail: thumbnail,
      description: info.description || '',
      published_at: publishedAt,
      channel_title: info.uploader || 'Chaîne inconnue',
      duration: duration,
      tags: tags
    };
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération des informations pour ${videoUrl}:`, error);
    return null;
  }
}

/**
 * Récupère les URLs de toutes les vidéos d'une playlist YouTube
 * @param {string} playlistId - ID de la playlist YouTube
 * @param {number} maxResults - Nombre maximum de vidéos à récupérer
 * @returns {Array} - Liste des URLs des vidéos
 */
async function getPlaylistVideos(playlistId, maxResults = null) {
  try {
    console.log(`🔄 Récupération des vidéos de la playlist ${playlistId}...`);
    
    // Utiliser youtube-dl-exec pour récupérer les informations de la playlist
    const command = `yt-dlp --dump-json --flat-playlist --skip-download "https://www.youtube.com/playlist?list=${playlistId}"`;
    const output = execSync(command, { encoding: 'utf8' });
    
    // Chaque ligne est un objet JSON
    const entries = output.trim().split('\n').map(line => JSON.parse(line));
    
    // Limiter le nombre de résultats si nécessaire
    const limitedEntries = maxResults ? entries.slice(0, maxResults) : entries;
    
    // Extraire les URLs des vidéos
    const videoUrls = limitedEntries.map(entry => `https://www.youtube.com/watch?v=${entry.id}`);
    
    console.log(`✅ ${videoUrls.length} vidéos récupérées de la playlist.`);
    
    return videoUrls;
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération des vidéos de la playlist:`, error);
    return [];
  }
}

/**
 * Détecte automatiquement l'expert à partir du titre de la vidéo
 * @param {string} title - Titre de la vidéo
 * @returns {string} - Nom de l'expert ou chaîne vide
 */
function detectExpert(title) {
  // Recherche de motifs comme "avec [Nom]" ou "par [Nom]" dans le titre
  const avecMatch = title.match(/avec\s+([^-|:]+)/i);
  if (avecMatch) {
    return avecMatch[1].trim();
  }
  
  const parMatch = title.match(/par\s+([^-|:]+)/i);
  if (parMatch) {
    return parMatch[1].trim();
  }
  
  return '';
}

/**
 * Génère le contenu MDX à partir des informations de la vidéo
 * @param {Object} videoInfo - Informations de la vidéo
 * @param {string} expertName - Nom de l'expert (optionnel)
 * @returns {Object} - Contenu MDX et slug
 */
function generateMdxContent(videoInfo, expertName = '') {
  try {
    // Extraction du titre principal
    const title = videoInfo.title;
    
    // S'assurer que expertName est toujours une chaîne, jamais null
    // Si expertName est null, undefined ou vide, essayer de le détecter automatiquement
    if (!expertName) {
      expertName = detectExpert(title) || ''; // Garantir une chaîne vide si la détection échoue
    }
    
    // Échapper les guillemets dans les chaînes pour éviter les problèmes YAML
    const escapedTitle = title.replace(/"/g, '');
    const escapedExpertName = expertName.replace(/"/g, '');
    
    // Génération de la description si elle est vide
    let description = videoInfo.description.trim();
    if (!description) {
      if (expertName) {
        description = `Découvrez notre live avec ${escapedExpertName}. Une session riche en conseils et informations pour vous aider dans votre parcours.`;
      } else {
        description = `Découvrez notre live sur ${escapedTitle}. Une session riche en conseils et informations pour vous aider dans votre parcours.`;
      }
    }
    
    // Limiter la description à la première phrase ou aux 160 premiers caractères
    let shortDescription = description.split('.')[0].trim();
    if (shortDescription.length > 160) {
      shortDescription = shortDescription.substring(0, 157) + '...';
    }
    
    // Échapper les guillemets dans la description
    shortDescription = shortDescription.replace(/"/g, '');
    
    // Formatage des tags
    let tags = [...(videoInfo.tags || [])]; // Garantir que tags est un tableau, même si videoInfo.tags est undefined
    
    // Ajouter des tags par défaut si nécessaire
    const defaultTags = ['live', 'education'];
    for (const tag of defaultTags) {
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }
    
    // Limiter à 5 tags maximum
    tags = tags.slice(0, 5);
    
    // Création du slug à partir du titre
    const slug = slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    }).substring(0, 50);
    
    // S'assurer que la date est valide
    const publishDate = videoInfo.published_at || new Date().toISOString().split('T')[0];
    
    // Construction du contenu MDX
    const mdxContent = `---
expert: "${escapedExpertName}"
metadata:
  title: "${escapedTitle} - Out of the Books"
  description: >-
    ${shortDescription}
  robots:
    index: true
    follow: true
published: true
title: "${escapedTitle}"
description: >-
  ${shortDescription}
publishDate: ${publishDate}T00:00:00.000Z
category: live
tags:
${tags.map(tag => `  - ${tag}`).join('\n')}
image: "${videoInfo.thumbnail}"
duration: "${videoInfo.duration}"
media:
  type: "youtube"
  videoUrl: "${videoInfo.video_url}"
---`;
    
    return {
      slug: `live-${slug}`,
      content: mdxContent
    };
  } catch (error) {
    console.error(`❌ Erreur lors de la génération du contenu MDX:`, error);
    return null;
  }
}

/**
 * Sauvegarde un fichier MDX
 * @param {Object} mdxData - Données MDX (slug et contenu)
 * @returns {string} - Chemin du fichier créé
 */
function saveMdxFile(mdxData) {
  try {
    // Création du répertoire des lives s'il n'existe pas
    if (!fs.existsSync(LIVES_DIR)) {
      fs.mkdirSync(LIVES_DIR, { recursive: true });
      console.log(`📁 Répertoire créé: ${LIVES_DIR}`);
    }
    
    const filePath = path.join(LIVES_DIR, `${mdxData.slug}.mdx`);
    
    // Vérifier si le fichier existe déjà
    if (fs.existsSync(filePath)) {
      console.log(`⚠️ Le fichier ${mdxData.slug}.mdx existe déjà. Ajout d'un suffixe.`);
      const timestamp = Date.now();
      mdxData.slug = `${mdxData.slug}-${timestamp}`;
      return saveMdxFile(mdxData);
    }
    
    fs.writeFileSync(filePath, mdxData.content, 'utf8');
    console.log(`✅ Fichier MDX créé: ${filePath}`);
    
    return filePath;
  } catch (error) {
    console.error(`❌ Erreur lors de la sauvegarde du fichier MDX:`, error);
    return null;
  }
}

/**
 * Traite une vidéo YouTube et génère un fichier MDX
 * @param {string} videoUrl - URL de la vidéo YouTube
 * @param {string} expertName - Nom de l'expert (optionnel)
 * @returns {boolean} - True si le traitement a réussi, False sinon
 */
async function processVideo(videoUrl, expertName = null) {
  try {
    console.log(`🔄 Traitement de la vidéo: ${videoUrl}`);
    
    // Récupérer les informations de la vidéo
    const videoInfo = await getVideoInfo(videoUrl);
    if (!videoInfo) {
      console.error(`❌ Impossible de récupérer les informations pour ${videoUrl}`);
      return false;
    }
    
    // Générer le contenu MDX
    const mdxData = generateMdxContent(videoInfo, expertName);
    if (!mdxData) {
      console.error(`❌ Impossible de générer le contenu MDX pour ${videoUrl}`);
      return false;
    }
    
    // Sauvegarder le fichier MDX
    const filePath = saveMdxFile(mdxData);
    if (!filePath) {
      console.error(`❌ Impossible de sauvegarder le fichier MDX pour ${videoUrl}`);
      return false;
    }
    
    console.log(`✅ Vidéo traitée avec succès: ${videoUrl}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de la vidéo ${videoUrl}:`, error);
    return false;
  }
}

/**
 * Traite toutes les vidéos d'une playlist YouTube
 * @param {string} playlistId - ID de la playlist YouTube
 * @param {string} expertName - Nom de l'expert (optionnel)
 * @param {number} maxResults - Nombre maximum de vidéos à traiter
 * @returns {Array} - Liste des informations des vidéos traitées
 */
async function processPlaylist(playlistId, expertName = null, maxResults = null) {
  try {
    console.log(`🔄 Traitement de la playlist: ${playlistId}`);
    
    // Récupérer les URLs des vidéos de la playlist
    const videoUrls = await getPlaylistVideos(playlistId, maxResults);
    if (videoUrls.length === 0) {
      console.error(`❌ Aucune vidéo trouvée dans la playlist ${playlistId}`);
      return [];
    }
    
    console.log(`📝 ${videoUrls.length} vidéos à traiter...`);
    
    // Traiter chaque vidéo séquentiellement
    const videoInfos = [];
    let successCount = 0;
    
    for (let i = 0; i < videoUrls.length; i++) {
      const videoUrl = videoUrls[i];
      console.log(`🔄 Traitement de la vidéo ${i + 1}/${videoUrls.length}: ${videoUrl}`);
      
      // Récupérer les informations de la vidéo
      const videoInfo = await getVideoInfo(videoUrl);
      if (!videoInfo) {
        console.error(`❌ Impossible de récupérer les informations pour ${videoUrl}`);
        continue;
      }
      
      videoInfos.push(videoInfo);
      
      // Générer le contenu MDX
      const mdxData = generateMdxContent(videoInfo, expertName);
      if (!mdxData) {
        console.error(`❌ Impossible de générer le contenu MDX pour ${videoUrl}`);
        continue;
      }
      
      // Sauvegarder le fichier MDX
      const filePath = saveMdxFile(mdxData);
      if (!filePath) {
        console.error(`❌ Impossible de sauvegarder le fichier MDX pour ${videoUrl}`);
        continue;
      }
      
      successCount++;
      
      // Pause pour éviter les limitations de l'API
      if (i < videoUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`✅ ${successCount}/${videoUrls.length} vidéos traitées avec succès.`);
    return videoInfos;
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de la playlist ${playlistId}:`, error);
    return [];
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Démarrage de la génération des fichiers MDX pour les lives YouTube...');
  
  try {
    // Vérifier si yt-dlp est installé
    try {
      execSync('yt-dlp --version', { stdio: 'ignore' });
    } catch (err) {
      console.error(`❌ yt-dlp n'est pas installé. Erreur: ${err.message}`);
      console.error('   Veuillez l\'installer avant d\'exécuter ce script.');
      console.error('   Vous pouvez l\'installer avec: npm install -g yt-dlp');
      return;
    }
    
    // Nettoyer le répertoire des lives si nécessaire
    if (process.env.CLEAN_DIRECTORY === 'true') {
      cleanLivesDirectory();
    }
    
    let videoInfos = [];
    
    // Si une URL de vidéo spécifique est fournie, traiter cette vidéo uniquement
    if (YOUTUBE_VIDEO_URL) {
      console.log(`🎬 Traitement d'une vidéo spécifique: ${YOUTUBE_VIDEO_URL}`);
      const success = await processVideo(YOUTUBE_VIDEO_URL, EXPERT_NAME);
      
      if (success) {
        const videoInfo = await getVideoInfo(YOUTUBE_VIDEO_URL);
        if (videoInfo) {
          videoInfos.push(videoInfo);
        }
      }
    } 
    // Sinon, traiter la playlist
    else if (YOUTUBE_PLAYLIST_ID && YOUTUBE_PLAYLIST_ID !== 'PLxxxxxxxx') {
      console.log(`🎬 Traitement de la playlist: ${YOUTUBE_PLAYLIST_ID}`);
      
      // Vérifier si les données ont changé
      const shouldProcess = process.env.FORCE_REGENERATE === 'true' || !fs.existsSync(RAW_DATA_PATH);
      
      if (shouldProcess) {
        videoInfos = await processPlaylist(YOUTUBE_PLAYLIST_ID, EXPERT_NAME, MAX_VIDEOS);
      } else {
        // Récupérer les données brutes pour vérifier si elles ont changé
        const videoUrls = await getPlaylistVideos(YOUTUBE_PLAYLIST_ID, MAX_VIDEOS);
        const tempInfos = [];
        
        for (const url of videoUrls) {
          const info = await getVideoInfo(url);
          if (info) {
            tempInfos.push(info);
          }
        }
        
        // Vérifier si les données ont changé
        if (checkIfDataChanged(tempInfos)) {
          videoInfos = await processPlaylist(YOUTUBE_PLAYLIST_ID, EXPERT_NAME, MAX_VIDEOS);
        } else {
          console.log('💤 Aucune modification détectée, aucune action nécessaire.');
          return;
        }
      }
    } else {
      console.error('❌ Aucune URL de vidéo ou ID de playlist valide n\'a été fourni.');
      console.error('   Veuillez définir YOUTUBE_VIDEO_URL ou YOUTUBE_PLAYLIST_ID dans le fichier .env');
      return;
    }
    
    if (videoInfos.length === 0) {
      console.log('⚠️ Aucune vidéo traitée, fin du processus.');
      return;
    }
    
    // Sauvegarder les données brutes pour comparaison future
    saveRawData(videoInfos, RAW_DATA_FILENAME);
    
    console.log('✨ Génération des fichiers MDX pour les lives YouTube terminée avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de la génération des fichiers MDX:', error);
    process.exit(1);
  }
}

// Exécution du script
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
}); 