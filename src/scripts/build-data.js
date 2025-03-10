// Script de build pour générer les données statiques du festival
// Ce script est exécuté uniquement au moment du build

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import sharp from 'sharp';
import dotenv from 'dotenv';
import { Api } from 'nocodb-sdk';

// Charger les variables d'environnement
dotenv.config();

// Obtenir le chemin du répertoire actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

// Configuration NocoDB (basée sur src/config/nocodb.ts)
const NOCODB_BASE_URL = process.env.NOCODB_BASE_URL || "https://app.nocodb.com";
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN || "";

const NOCODB_CONFIG = {
  // Identifiant du projet
  projectId: "pocv8knemg3rcok",
  
  // Identifiants des tables
  tables: {
    stands: "mbwhou86e9tzqql", // ID de la table des stands
    ateliers: "maiiy35ahod5nnu", // ID de la table des ateliers
    conferences: "mdf8viczcxywoug" // ID de la table des conférences
  },
  
  // Paramètres de requête par défaut
  defaultQueryParams: {
    stands: {
      offset: 0,
      limit: 25,
      where: ""
    },
    ateliers: {
      offset: 0,
      limit: 50,
      where: ""
    },
    conferences: {
      offset: 0,
      limit: 50,
      where: ""
    }
  }
};

// Répertoires pour les images (basés sur src/services/imageProcessor.ts)
const IMAGES_SRC_DIR = path.join(ROOT_DIR, 'src', 'assets', 'images', 'events');
const IMAGES_PUBLIC_DIR = path.join(ROOT_DIR, 'public', 'images', 'events');
const OUTPUT_DIR = path.join(ROOT_DIR, 'src', 'content', 'festival');
const RAW_DATA_DIR = path.join(ROOT_DIR, 'src', 'content', 'festival', 'raw-data');

// Jours du festival
const DAYS = ['Mercredi', 'Jeudi', 'Vendredi'];

/**
 * Initialise l'API NocoDB avec le token d'authentification
 * @returns Instance de l'API NocoDB
 */
function initNocoDBApi() {
  console.log('Initialisation de l\'API NocoDB avec le token:', NOCODB_API_TOKEN ? 'Token présent' : 'Token manquant');
  
  return new Api({
    baseURL: NOCODB_BASE_URL,
    headers: {
      "xc-token": NOCODB_API_TOKEN
    }
  });
}

// Normaliser les valeurs de jour
function normalizeDay(day) {
  if (!day) return 'Mercredi'; // Valeur par défaut
  
  // Gérer le cas où day est un nombre (0 = Les trois jours, 1 = Mercredi, 2 = Jeudi, 3 = Vendredi)
  if (typeof day === 'number') {
    switch (day) {
      case 1: return 'Mercredi';
      case 2: return 'Jeudi';
      case 3: return 'Vendredi';
      case 0: return 'Mercredi'; // Pour les trois jours, on met par défaut Mercredi
      default: return 'Mercredi';
    }
  }
  
  // Gérer le cas où day est un objet (avec Title)
  if (typeof day === 'object' && day !== null) {
    if (day.Title) return normalizeDay(day.Title);
    return 'Mercredi';
  }
  
  // Normaliser les valeurs "À définir" ou similaires
  if (day === 'À définir' || day === 'A définir' || day === 'à définir' || day === 'a définir') {
    return 'Mercredi';
  }
  
  // Vérifier si le jour est valide
  if (DAYS.includes(day)) {
    return day;
  }
  
  // Si le jour n'est pas reconnu, retourner la valeur par défaut
  console.warn(`⚠️ Jour non reconnu: "${day}", utilisation de la valeur par défaut`);
  return 'Mercredi';
}

// Formater l'heure au format HH:mm
function formatTime(time) {
  if (!time) return 'À définir';
  // Si l'heure est au format HH:mm:ss, on enlève les secondes
  return time.substring(0, 5);
}

// Fonction principale
async function main() {
  try {
    console.log('🚀 Démarrage de la génération des données statiques...');
    
    // Vérifier les options de ligne de commande
    const fetchOnly = process.argv.includes('--fetch-only');
    const noReset = process.argv.includes('--no-reset');
    const resetJson = !noReset; // On réinitialise par défaut, sauf si --no-reset est spécifié
    
    // Créer les répertoires nécessaires
    await createDirectories();
    
    // Réinitialiser les fichiers JSON si demandé
    if (resetJson) {
      await resetJsonFiles();
    } else {
      console.log('⏭️ Conservation des fichiers JSON existants (--no-reset)');
    }
    
    // Récupérer les données depuis NocoDB
    console.log('📊 Récupération des données depuis NocoDB...');
    
    // Récupérer les stands
    const standsResponse = await fetchStands();
    const stands = standsResponse && standsResponse.list ? standsResponse.list : [];
    console.log(`Données récupérées avec succès: ${stands.length} stands trouvés`);
    saveRawData(standsResponse, 'stands_response.json');
    
    // Récupérer les ateliers
    const ateliersResponse = await fetchAteliers();
    const ateliers = ateliersResponse && ateliersResponse.list ? ateliersResponse.list : [];
    console.log(`Données récupérées avec succès: ${ateliers.length} ateliers trouvés`);
    saveRawData(ateliersResponse, 'ateliers_response.json');
    
    // Récupérer les conférences
    const conferencesResponse = await fetchConferences();
    const conferences = conferencesResponse && conferencesResponse.list ? conferencesResponse.list : [];
    console.log(`Données récupérées avec succès: ${conferences.length} conférences trouvées`);
    saveRawData(conferencesResponse, 'conferences_response.json');
    
    // Si l'option --fetch-only est présente, arrêter ici
    if (fetchOnly) {
      console.log('✅ Récupération des données terminée (mode fetch-only)');
      return;
    }
    
    // Convertir les données en événements
    console.log('🔄 Conversion des données en événements...');
    
    // Vérifier que les données sont bien des tableaux avant de les convertir
    if (!Array.isArray(stands)) {
      console.error('❌ Les données de stands ne sont pas un tableau:', stands);
      process.exit(1);
    }
    
    if (!Array.isArray(ateliers)) {
      console.error('❌ Les données d\'ateliers ne sont pas un tableau:', ateliers);
      process.exit(1);
    }
    
    if (!Array.isArray(conferences)) {
      console.error('❌ Les données de conférences ne sont pas un tableau:', conferences);
      process.exit(1);
    }
    
    const standsEvents = convertStandsToEvents(stands);
    const ateliersEvents = convertAteliersToEvents(ateliers);
    const conferencesEvents = convertConferencesToEvents(conferences);
    
    // Fusionner tous les événements
    const allEvents = [...standsEvents, ...ateliersEvents, ...conferencesEvents];
    
    // Télécharger et traiter les images
    console.log('🖼️ Téléchargement et traitement des images...');
    const eventsWithImages = await processEventImages(allEvents);
    
    // Organiser les événements par jour
    console.log('📅 Organisation des événements par jour...');
    const eventsByDay = organizeEventsByDay(eventsWithImages);
    
    // Générer le fichier JSON
    console.log('💾 Génération du fichier JSON...');
    await saveEventsToJson(eventsByDay);
    
    console.log('✅ Génération des données statiques terminée !');
  } catch (error) {
    console.error('❌ Erreur lors de la génération des données:', error);
    process.exit(1);
  }
}

// Créer les répertoires nécessaires
async function createDirectories() {
  const dirs = [
    IMAGES_SRC_DIR,
    IMAGES_PUBLIC_DIR,
    path.join(IMAGES_SRC_DIR, 'stands'),
    path.join(IMAGES_SRC_DIR, 'ateliers'),
    path.join(IMAGES_SRC_DIR, 'conferences'),
    path.join(IMAGES_PUBLIC_DIR, 'stands'),
    path.join(IMAGES_PUBLIC_DIR, 'ateliers'),
    path.join(IMAGES_PUBLIC_DIR, 'conferences'),
    OUTPUT_DIR,
    RAW_DATA_DIR
  ];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
      console.log(`📁 Répertoire créé : ${dir}`);
    }
  }
}

// Sauvegarder les données brutes dans un fichier JSON pour référence
function saveRawData(data, filename) {
  try {
    const filePath = path.join(RAW_DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Données brutes sauvegardées dans ${filePath}`);
  } catch (error) {
    console.error(`❌ Erreur lors de la sauvegarde des données:`, error);
  }
}

// Récupérer les stands depuis NocoDB
async function fetchStands() {
  try {
    const api = initNocoDBApi();
    
    console.log('Appel à l\'API NocoDB pour récupérer les stands...');
    
    // Appel à l'API pour récupérer les données
    const response = await api.dbTableRow.list(
      "noco",
      NOCODB_CONFIG.projectId,
      NOCODB_CONFIG.tables.stands,
      NOCODB_CONFIG.defaultQueryParams.stands
    );
    
    console.log(`Données récupérées avec succès: ${response.list.length} stands trouvés`);
    
    // Sauvegarder la réponse complète
    saveRawData(response, 'stands_response.json');
    
    // Formatage de la réponse pour correspondre à l'interface NocoDBResponse
    const formattedResponse = {
      list: response.list,
      pageInfo: {
        totalRows: response.pageInfo?.totalRows || 0,
        page: response.pageInfo?.page || 1,
        pageSize: response.pageInfo?.pageSize || 25,
        isFirstPage: response.pageInfo?.isFirstPage || true,
        isLastPage: response.pageInfo?.isLastPage || true
      },
      stats: { 
        dbQueryTime: "0" // Valeur par défaut car stats n'existe pas dans la réponse
      }
    };
    
    return formattedResponse;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des stands:', error);
    return { list: [] };
  }
}

// Récupérer les ateliers depuis NocoDB
async function fetchAteliers() {
  try {
    const api = initNocoDBApi();
    
    console.log('Appel à l\'API NocoDB pour récupérer les ateliers...');
    
    // Appel à l'API pour récupérer les données
    const response = await api.dbTableRow.list(
      "noco",
      NOCODB_CONFIG.projectId,
      NOCODB_CONFIG.tables.ateliers,
      NOCODB_CONFIG.defaultQueryParams.ateliers
    );
    
    console.log(`Données récupérées avec succès: ${response.list.length} ateliers trouvés`);
    
    // Sauvegarder la réponse complète
    saveRawData(response, 'ateliers_response.json');
    
    // Formatage de la réponse pour correspondre à l'interface NocoDBSessionsResponse
    const formattedResponse = {
      list: response.list,
      pageInfo: {
        totalRows: response.pageInfo?.totalRows || 0,
        page: response.pageInfo?.page || 1,
        pageSize: response.pageInfo?.pageSize || 25,
        isFirstPage: response.pageInfo?.isFirstPage || true,
        isLastPage: response.pageInfo?.isLastPage || true
      },
      stats: { 
        dbQueryTime: "0" // Valeur par défaut car stats n'existe pas dans la réponse
      }
    };
    
    return formattedResponse;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des ateliers:', error);
    return { list: [] };
  }
}

// Récupérer les conférences depuis NocoDB
async function fetchConferences() {
  try {
    const api = initNocoDBApi();
    
    console.log('Appel à l\'API NocoDB pour récupérer les conférences...');
    
    // Appel à l'API pour récupérer les données
    const response = await api.dbTableRow.list(
      "noco",
      NOCODB_CONFIG.projectId,
      NOCODB_CONFIG.tables.conferences,
      NOCODB_CONFIG.defaultQueryParams.conferences
    );
    
    console.log(`Données récupérées avec succès: ${response.list.length} conférences trouvées`);
    
    // Sauvegarder la réponse complète
    saveRawData(response, 'conferences_response.json');
    
    // Formatage de la réponse pour correspondre à l'interface NocoDBSessionsResponse
    const formattedResponse = {
      list: response.list,
      pageInfo: {
        totalRows: response.pageInfo?.totalRows || 0,
        page: response.pageInfo?.page || 1,
        pageSize: response.pageInfo?.pageSize || 25,
        isFirstPage: response.pageInfo?.isFirstPage || true,
        isLastPage: response.pageInfo?.isLastPage || true
      },
      stats: { 
        dbQueryTime: "0" // Valeur par défaut car stats n'existe pas dans la réponse
      }
    };
    
    return formattedResponse;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des conférences:', error);
    return { list: [] };
  }
}

// Convertir les stands en événements
function convertStandsToEvents(stands) {
  return stands.map(stand => {
    // Extraire le logo
    const logo = stand["Envoyez votre logo"]?.[0]?.signedUrl || null;
    
    // Normaliser le jour
    const normalizedDay = normalizeDay(stand.Jours);
    
    // Gérer le cas où Espaces peut être null
    let location = 'À définir';
    if (stand.Espaces && typeof stand.Espaces === 'object') {
      location = stand.Espaces.Title || 'À définir';
    }
    
    // Extraire les informations supplémentaires
    const target = stand["À qui s'adresse le stand ?"] || '';
    const level = stand["Niveau d'enseignement"] || '';
    const teachingType = stand["Type d'enseignement"] || '';
    const website = stand["Site internet"] || '';
    
    return {
      id: `stand-${stand.ID}`,
      title: stand["Choisissez un titre court"] || `Stand ${stand.ID}`,
      description: stand["Décrivez brièvement votre stand pour les visiteurs"] || '',
      type: 'Stands',
      day: normalizedDay,
      time: 'Toute la journée',
      location,
      speaker: `${stand.Prénom || ''} ${stand.Nom || ''}`.trim() || 'Anonyme',
      organization: '',
      image: logo,
      speakerImage: null,
      tags: [
        target,
        level,
        teachingType
      ].filter(Boolean),
      target,
      level,
      teachingType,
      url: website,
      contact: {
        email: stand.Email || '',
        phone: stand.GSM || ''
      }
    };
  });
}

// Convertir les ateliers en événements
function convertAteliersToEvents(ateliers) {
  return ateliers.map(atelier => {
    // Extraire le logo
    const logo = atelier["Envoyez votre logo"]?.[0]?.signedUrl || null;
    const speakerImage = atelier["Envoyez une photo de vous"]?.[0]?.signedUrl || null;
    
    // Normaliser le jour
    const normalizedDay = normalizeDay(atelier.Jours);
    
    // Gérer les cas où les champs peuvent être null
    const time = formatTime(atelier.Heure);
    const location = atelier.Espaces || 'À définir';
    
    // Extraire les informations supplémentaires
    const target = atelier["À qui s'adresse atelier ?"] || '';
    const level = atelier["Niveau d'enseignement"] || '';
    const teachingType = atelier["Type d'enseignement"] || '';
    const website = atelier["Site internet"] || '';
    
    return {
      id: `atelier-${atelier.ID}`,
      title: atelier["Choisissez un titre court"] || `Atelier ${atelier.ID}`,
      description: atelier["Décrivez brièvement votre animation pour les visiteurs"] || '',
      type: 'Ateliers',
      day: normalizedDay,
      time,
      location,
      speaker: `${atelier.Prénom || ''} ${atelier.Nom || ''}`.trim() || 'Anonyme',
      organization: atelier.Organisation || '',
      image: logo,
      speakerImage,
      tags: [
        target,
        level,
        teachingType
      ].filter(Boolean),
      target,
      level,
      teachingType,
      url: website,
      contact: {
        email: atelier.Email || '',
        phone: atelier.GSM || ''
      }
    };
  });
}

// Convertir les conférences en événements
function convertConferencesToEvents(conferences) {
  return conferences.map(conference => {
    // Extraire les images
    const logo = conference["Envoyez votre logo"]?.[0]?.signedUrl || null;
    const speakerImage = conference["Envoyez une photo de vous"]?.[0]?.signedUrl || null;
    
    // Normaliser le jour
    const normalizedDay = normalizeDay(conference.Jours);
    
    // Déterminer le titre
    let title = '';
    
    // Essayer d'abord "Choisissez un titre pour la conférence"
    if (conference["Choisissez un titre pour la conférence"]) {
      title = conference["Choisissez un titre pour la conférence"];
    } 
    // Ensuite essayer "Choisissez un titre court"
    else if (conference["Choisissez un titre court"]) {
      title = conference["Choisissez un titre court"];
    }
    // Ensuite essayer le champ Titre
    else if (conference.Titre) {
      if (typeof conference.Titre === 'object' && conference.Titre !== null) {
        title = conference.Titre.Title || '';
      } else {
        title = conference.Titre;
      }
    }
    
    // Si toujours pas de titre, utiliser le numéro de conférence
    if (!title || title.trim() === '') {
      title = `Conférence ${conference.ID}`;
    }
    
    // Gérer les cas où Espaces peut être null
    let location = 'À définir';
    if (conference.Espaces) {
      location = typeof conference.Espaces === 'object' && conference.Espaces !== null ? 
                conference.Espaces.Title || 'À définir' : 
                conference.Espaces;
    }
    
    // Extraire les informations supplémentaires
    const target = conference["À qui s'adresse conference ?"] || '';
    const level = conference["Niveau d'enseignement"] || '';
    const teachingType = conference["Type d'enseignement"] || '';
    const website = conference["Site internet"] || '';
    
    return {
      id: `conference-${conference.ID}`,
      title: title || `Conférence ${conference.ID}`,
      description: conference["Décrivez brièvement votre conférence pour les visiteurs"] || '',
      type: 'Conférences',
      day: normalizedDay,
      time: formatTime(conference.Heure),
      location,
      speaker: `${conference.Prénom || ''} ${conference.Nom || ''}`.trim() || 'Anonyme',
      organization: conference.Organisation || '',
      image: logo,
      speakerImage,
      tags: [
        target,
        level,
        teachingType
      ].filter(Boolean),
      target,
      level,
      teachingType,
      url: website,
      contact: {
        email: conference.Email || '',
        phone: conference.GSM || ''
      }
    };
  });
}

// Télécharger et traiter les images des événements
async function processEventImages(events) {
  // Créer un cache pour éviter de télécharger plusieurs fois la même image
  const imageUrlCache = new Map();
  // Compteur pour les images téléchargées
  let downloadCount = 0;
  let totalImages = 0;
  
  // Compter le nombre total d'images à télécharger
  events.forEach(event => {
    if (event.image) totalImages++;
    if (event.speakerImage) totalImages++;
  });
  
  console.log(`🖼️ Téléchargement de ${totalImages} images...`);
  
  // Traiter chaque événement
  for (const event of events) {
    // Traiter l'image principale de l'événement
    if (event.image) {
      downloadCount++;
      const optimizedImagePath = await downloadAndOptimizeImage(
        event.image,
        event.type.toLowerCase().replace(/é/g, 'e').replace(/è/g, 'e').replace(/ê/g, 'e').replace(/ç/g, 'c'),
        event.id,
        false,
        event.title,
        event.day,
        imageUrlCache
      );
      
      if (optimizedImagePath) {
        event.image = optimizedImagePath;
        
        // Afficher le progrès toutes les 5 images ou à la fin
        if (downloadCount % 5 === 0 || downloadCount === totalImages) {
          console.log(`📥 Progression: ${downloadCount}/${totalImages} images téléchargées (${Math.round(downloadCount/totalImages*100)}%)`);
        }
      }
    }
    
    // Traiter l'image du conférencier
    if (event.speakerImage) {
      downloadCount++;
      const optimizedSpeakerImagePath = await downloadAndOptimizeImage(
        event.speakerImage,
        event.type.toLowerCase().replace(/é/g, 'e').replace(/è/g, 'e').replace(/ê/g, 'e').replace(/ç/g, 'c'),
        event.id,
        true,
        event.title,
        event.day,
        imageUrlCache
      );
      
      if (optimizedSpeakerImagePath) {
        event.speakerImage = optimizedSpeakerImagePath;
        
        // Afficher le progrès toutes les 5 images ou à la fin
        if (downloadCount % 5 === 0 || downloadCount === totalImages) {
          console.log(`📥 Progression: ${downloadCount}/${totalImages} images téléchargées (${Math.round(downloadCount/totalImages*100)}%)`);
        }
      }
    }
  }
  
  console.log(`✅ Téléchargement terminé: ${downloadCount} images traitées`);
  
  return events;
}

// Télécharger et optimiser une image
async function downloadAndOptimizeImage(
  imageUrl,
  eventType,
  eventId,
  isSpeakerImage = false,
  eventTitle,
  eventDay,
  imageUrlCache
) {
  // Si l'URL est déjà dans le cache, retourner le chemin déjà optimisé
  if (imageUrlCache.has(imageUrl)) {
    return imageUrlCache.get(imageUrl);
  }
  
  try {
    // Vérifier si l'URL est valide
    if (!imageUrl || !imageUrl.startsWith('http')) {
      return null;
    }
    
    // Créer un nom de fichier unique basé sur l'ID de l'événement
    const filePrefix = isSpeakerImage ? 'speaker-' : '';
    const fileName = `${filePrefix}${eventId}`;
    
    // Déterminer les chemins de destination
    const srcDir = path.join(IMAGES_SRC_DIR, eventType);
    const publicDir = path.join(IMAGES_PUBLIC_DIR, eventType);
    
    // S'assurer que les répertoires existent
    await fs.promises.mkdir(srcDir, { recursive: true });
    await fs.promises.mkdir(publicDir, { recursive: true });
    
    // Télécharger l'image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`⚠️ Erreur lors du téléchargement de l'image pour ${eventId}: ${response.status} ${response.statusText}`);
      return await createPlaceholderImage(srcDir, publicDir, fileName, eventType, imageUrlCache, imageUrl);
    }
    
    const buffer = await response.buffer();
    
    try {
      // Créer un fond blanc pour toutes les images
      const whiteBackground = {
        r: 255, g: 255, b: 255, alpha: 1
      };
      
      // Charger l'image originale
      const originalImage = sharp(buffer);
      
      // Utiliser un fit différent pour les images de conférenciers
      const fitOption = isSpeakerImage ? 'cover' : 'inside';
      const positionOption = isSpeakerImage ? 'north' : 'center';
      
      // Générer la version principale (400px)
      await originalImage
        .resize(400, 400, { 
          fit: fitOption,
          position: positionOption,
          withoutEnlargement: true,
          background: whiteBackground
        })
        .webp({ quality: 80 })
        .toFile(path.join(srcDir, `${fileName}.webp`));
      
      // Générer la version thumbnail (200px)
      await originalImage
        .resize(200, 200, { 
          fit: fitOption,
          position: positionOption,
          withoutEnlargement: true,
          background: whiteBackground
        })
        .webp({ quality: 80 })
        .toFile(path.join(publicDir, `${fileName}.webp`));
      
      // Stocker le chemin dans le cache
      const optimizedPath = `/assets/images/events/${eventType}/${fileName}.webp`;
      imageUrlCache.set(imageUrl, optimizedPath);
      
      return optimizedPath;
      
    } catch (error) {
      console.error(`⚠️ Erreur lors de l'optimisation de l'image pour ${eventId}: ${error.message}`);
      
      // Si l'erreur concerne un format non supporté, créer une image de remplacement
      return await createPlaceholderImage(srcDir, publicDir, fileName, eventType, imageUrlCache, imageUrl);
    }
  } catch (error) {
    console.error(`⚠️ Erreur lors du traitement de l'image pour ${eventId}: ${error.message}`);
    return null;
  }
}

// Fonction pour créer une image de remplacement
async function createPlaceholderImage(srcDir, publicDir, fileName, eventType, imageUrlCache, imageUrl) {
  try {
    console.log(`🔄 Création d'une image de remplacement pour ${fileName}`);
    
    // Créer une image de remplacement avec un fond blanc
    const placeholderImage = await sharp({
      create: {
        width: 400,
        height: 400,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .webp({ quality: 80 })
    .toBuffer();
    
    // Sauvegarder l'image de remplacement
    await fs.promises.writeFile(path.join(srcDir, `${fileName}.webp`), placeholderImage);
    await fs.promises.writeFile(path.join(publicDir, `${fileName}.webp`), placeholderImage);
    
    // Stocker le chemin dans le cache
    const fallbackPath = `/assets/images/events/${eventType}/${fileName}.webp`;
    imageUrlCache.set(imageUrl, fallbackPath);
    
    console.log(`✅ Image de remplacement créée pour ${fileName}`);
    return fallbackPath;
  } catch (error) {
    console.error(`❌ Erreur lors de la création de l'image de remplacement: ${error.message}`);
    return null;
  }
}

// Organiser les événements par jour
function organizeEventsByDay(events) {
  const eventsByDay = {};
  
  // Initialiser les jours
  for (const day of DAYS) {
    eventsByDay[day] = [];
  }
  
  // Créer des ensembles pour suivre les IDs déjà ajoutés par jour
  const addedEventIdsByDay = {};
  for (const day of DAYS) {
    addedEventIdsByDay[day] = new Set();
  }
  
  // Fonction de comparaison pour le tri
  const compareEvents = (a, b) => {
    // Les stands sont toujours en dernier
    if (a.type === 'Stands' && b.type !== 'Stands') return 1;
    if (a.type !== 'Stands' && b.type === 'Stands') return -1;

    // Si un événement a une heure définie et l'autre non, celui avec l'heure définie passe en premier
    if (a.time !== 'À définir' && b.time === 'À définir') return -1;
    if (a.time === 'À définir' && b.time !== 'À définir') return 1;

    // Si les deux événements ont une heure définie et différente de "À définir"
    if (a.time !== 'À définir' && b.time !== 'À définir' && 
        a.time !== 'Tous les jours' && b.time !== 'Tous les jours') {
      return a.time.localeCompare(b.time);
    }

    // Si les deux sont "À définir", trier par type
    if (a.type === b.type) return 0;
    if (a.type === 'Conférences') return -1;
    if (b.type === 'Conférences') return 1;
    if (a.type === 'Ateliers') return -1;
    if (b.type === 'Ateliers') return 1;
    return 0;
  };
  
  // Ajouter les événements aux jours correspondants
  for (const event of events) {
    // Pour les stands, les ajouter à tous les jours
    if (event.type === 'Stands') {
      for (const day of DAYS) {
        if (!addedEventIdsByDay[day].has(event.id)) {
          eventsByDay[day].push({
            ...event,
            day,
            time: 'Tous les jours'
          });
          addedEventIdsByDay[day].add(event.id);
        }
      }
    } else {
      // Pour les autres types d'événements, comportement normal
      const normalizedDay = normalizeDay(event.day);
      if (DAYS.includes(normalizedDay)) {
        if (!addedEventIdsByDay[normalizedDay].has(event.id)) {
          eventsByDay[normalizedDay].push({
            ...event,
            day: normalizedDay
          });
          addedEventIdsByDay[normalizedDay].add(event.id);
        } else {
          console.warn(`⚠️ Doublon détecté et ignoré: ${event.id} (${event.title}) pour le jour ${normalizedDay}`);
        }
      } else {
        console.warn(`⚠️ Jour non reconnu ignoré: ${event.day} pour l'événement ${event.id} (${event.title})`);
      }
    }
  }
  
  // Trier les événements de chaque jour
  for (const day of DAYS) {
    eventsByDay[day].sort(compareEvents);
  }
  
  // Compter les événements par type et par jour pour le débogage
  const counts = {
    total: 0,
    stands: 0,
    ateliers: 0,
    conferences: 0,
    byDay: {}
  };
  
  // Initialiser les compteurs par jour
  for (const day of DAYS) {
    counts.byDay[day] = {
      total: eventsByDay[day].length,
      stands: eventsByDay[day].filter(e => e.type === 'Stands').length,
      ateliers: eventsByDay[day].filter(e => e.type === 'Ateliers').length,
      conferences: eventsByDay[day].filter(e => e.type === 'Conférences').length
    };
  }
  
  // Compter les événements uniques
  const uniqueEvents = new Set();
  const uniqueStands = new Set();
  const uniqueAteliers = new Set();
  const uniqueConferences = new Set();
  
  Object.values(eventsByDay).flat().forEach(event => {
    const eventKey = `${event.type}-${event.id}`;
    uniqueEvents.add(eventKey);
    
    if (event.type === 'Stands') {
      uniqueStands.add(event.id);
    } else if (event.type === 'Ateliers') {
      uniqueAteliers.add(event.id);
    } else if (event.type === 'Conférences') {
      uniqueConferences.add(event.id);
    }
  });
  
  counts.stands = uniqueStands.size;
  counts.ateliers = uniqueAteliers.size;
  counts.conferences = uniqueConferences.size;
  counts.total = counts.stands + counts.ateliers + counts.conferences;
  
  // Afficher les statistiques
  console.log('\n📊 Statistiques des événements :');
  console.log(`Total: ${counts.total} événements uniques`);
  console.log(`Stands: ${counts.stands}`);
  console.log(`Ateliers: ${counts.ateliers}`);
  console.log(`Conférences: ${counts.conferences}`);
  
  console.log('\nRépartition par jour:');
  for (const day of DAYS) {
    console.log(`${day}: ${counts.byDay[day].total} événements (${counts.byDay[day].stands} stands, ${counts.byDay[day].ateliers} ateliers, ${counts.byDay[day].conferences} conférences)`);
  }
  
  return eventsByDay;
}

// Sauvegarder les événements dans un fichier JSON
async function saveEventsToJson(eventsByDay) {
  // Sauvegarder le fichier principal des événements par jour
  const outputPath = path.join(OUTPUT_DIR, 'events.json');
  
  await fs.promises.writeFile(
    outputPath,
    JSON.stringify(eventsByDay, null, 2),
    'utf8'
  );
  
  console.log(`📄 Fichier JSON principal généré : ${outputPath}`);
  
  // Sauvegarder également les événements par type pour référence
  const eventTypes = {
    stands: [],
    ateliers: [],
    conferences: []
  };
  
  // Regrouper les événements par type
  Object.values(eventsByDay).forEach(events => {
    events.forEach(event => {
      if (event.type === 'Stands') {
        // Éviter les doublons pour les stands (qui peuvent apparaître plusieurs jours)
        if (!eventTypes.stands.some(s => s.id === event.id)) {
          eventTypes.stands.push(event);
        }
      } else if (event.type === 'Ateliers') {
        eventTypes.ateliers.push(event);
      } else if (event.type === 'Conférences') {
        eventTypes.conferences.push(event);
      }
    });
  });
  
  // Sauvegarder chaque type dans un fichier séparé
  for (const [type, events] of Object.entries(eventTypes)) {
    const typePath = path.join(OUTPUT_DIR, `${type}.json`);
    await fs.promises.writeFile(
      typePath,
      JSON.stringify(events, null, 2),
      'utf8'
    );
    console.log(`📄 Fichier JSON pour ${type} généré : ${typePath}`);
  }
}

// Réinitialiser les fichiers JSON
async function resetJsonFiles() {
  console.log('🗑️ Réinitialisation des fichiers JSON...');
  
  const jsonFiles = [
    path.join(OUTPUT_DIR, 'events.json'),
    path.join(OUTPUT_DIR, 'stands.json'),
    path.join(OUTPUT_DIR, 'ateliers.json'),
    path.join(OUTPUT_DIR, 'conferences.json')
  ];
  
  for (const file of jsonFiles) {
    if (fs.existsSync(file)) {
      try {
        await fs.promises.unlink(file);
        console.log(`✅ Fichier supprimé: ${file}`);
      } catch (error) {
        console.error(`❌ Erreur lors de la suppression du fichier ${file}:`, error);
      }
    }
  }
}

// Exécuter la fonction principale
main().catch(error => {
  console.error('❌ Erreur lors de la génération des données statiques:', error);
  process.exit(1);
}); 