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

// Déterminer si nous sommes en mode production
// Vérifier plusieurs variables d'environnement que Netlify pourrait définir
const IS_NETLIFY = process.env.NETLIFY === 'true';
const FORCE_PRODUCTION = process.env.FORCE_PRODUCTION === 'true';
const NODE_ENV_PRODUCTION = process.env.NODE_ENV === 'production';

// Si nous sommes sur Netlify ou si le mode production est forcé ou si NODE_ENV est production
const IS_PRODUCTION = IS_NETLIFY || FORCE_PRODUCTION || NODE_ENV_PRODUCTION;

console.log(`🔧 Environnement de build:`);
console.log(`   - Netlify: ${IS_NETLIFY ? 'Oui' : 'Non'}`);
console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'non défini'}`);
console.log(`   - Force production: ${FORCE_PRODUCTION ? 'Oui' : 'Non'}`);
console.log(`   - Mode final: ${IS_PRODUCTION ? 'PRODUCTION' : 'DÉVELOPPEMENT'}`);

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

// Vérifier si les répertoires existent et les créer si nécessaire
if (!fs.existsSync(IMAGES_SRC_DIR)) {
  fs.mkdirSync(IMAGES_SRC_DIR, { recursive: true });
  console.log(`📁 Répertoire créé : ${IMAGES_SRC_DIR}`);
}

if (!fs.existsSync(IMAGES_PUBLIC_DIR)) {
  fs.mkdirSync(IMAGES_PUBLIC_DIR, { recursive: true });
  console.log(`📁 Répertoire créé : ${IMAGES_PUBLIC_DIR}`);
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`📁 Répertoire créé : ${OUTPUT_DIR}`);
}

if (!fs.existsSync(RAW_DATA_DIR)) {
  fs.mkdirSync(RAW_DATA_DIR, { recursive: true });
  console.log(`📁 Répertoire créé : ${RAW_DATA_DIR}`);
}

// Fonction pour générer le chemin d'image en fonction du mode
function getImagePath(eventType, fileName) {
  // Sur Netlify avec Astro, nous devons utiliser un chemin qui sera accessible
  // après le build. Les fichiers dans public/ sont copiés à la racine du site.
  return `/images/events/${eventType}/${fileName}.webp`;
}

// Afficher un message au démarrage pour indiquer le mode et les chemins d'images
console.log(`🖼️ Chemins d'images en mode ${IS_PRODUCTION ? 'production' : 'développement'}:`);
console.log(`   - Chemin des images dans JSON: ${getImagePath('example', 'example').replace('example/example.webp', '')}`);
console.log(`   - Images source: ${IMAGES_SRC_DIR}`);
console.log(`   - Images public: ${IMAGES_PUBLIC_DIR}`);

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

/**
 * Vérifie si les dossiers d'images des événements sont vides
 * @returns {boolean} - True si au moins un des dossiers d'images est vide, false sinon
 */
function areImageDirectoriesEmpty() {
  try {
    const imageDirectories = [
      path.join(IMAGES_SRC_DIR, 'stands'),
      path.join(IMAGES_SRC_DIR, 'ateliers'),
      path.join(IMAGES_SRC_DIR, 'conferences')
    ];
    
    // Si l'un des dossiers n'existe pas, on considère qu'ils sont vides
    for (const dir of imageDirectories) {
      if (!fs.existsSync(dir)) {
        console.log(`📁 Le répertoire d'images ${dir} n'existe pas. Génération des images requise.`);
        return true;
      }
      
      // Vérifier si le dossier contient des fichiers
      const files = fs.readdirSync(dir);
      if (files.length === 0) {
        console.log(`📁 Le répertoire d'images ${dir} est vide. Génération des images requise.`);
        return true;
      }
    }
    
    console.log(`📁 Tous les répertoires d'images contiennent des fichiers.`);
    return false;
  } catch (error) {
    console.error(`❌ Erreur lors de la vérification des répertoires d'images:`, error);
    // En cas d'erreur, on génère par sécurité
    return true;
  }
}

// Fonction principale
async function main() {
  try {
    console.log('🚀 Début de la génération des données du festival...');
    
    // Créer les répertoires nécessaires
    await createDirectories();
    
    // Réinitialiser les fichiers JSON si l'option reset est activée
    const args = process.argv.slice(2);
    if (args.includes('--reset')) {
      await resetJsonFiles();
      console.log('🗑️ Réinitialisation des fichiers JSON effectuée.');
    }
    
    // Récupérer les données depuis NocoDB
    console.log('📊 Récupération des données depuis NocoDB...');
    
    // Récupérer les stands
    console.log('🏢 Récupération des stands...');
    const standsResponse = await fetchStands();
    
    // Récupérer les ateliers
    console.log('🧪 Récupération des ateliers...');
    const ateliersResponse = await fetchAteliers();
    
    // Récupérer les conférences
    console.log('🎤 Récupération des conférences...');
    const conferencesResponse = await fetchConferences();
    
    // Vérifier si des données ont changé
    const dataChanged = standsResponse.dataChanged || 
                         ateliersResponse.dataChanged || 
                         conferencesResponse.dataChanged;
    
    // Vérifier si les dossiers d'images sont vides
    const imagesEmpty = areImageDirectoriesEmpty();
    
    // Si l'option fetch-only est activée, on s'arrête ici
    if (args.includes('--fetch-only')) {
      console.log('🛑 Option --fetch-only activée. Arrêt du processus.');
      return;
    }
    
    // Si aucune donnée n'a changé, que les dossiers d'images ne sont pas vides
    // et que l'option no-reset n'est pas activée, pas besoin de continuer
    if (!dataChanged && !imagesEmpty && !args.includes('--no-reset')) {
      console.log('✅ Aucune modification détectée dans les données et les images sont déjà présentes. Génération des fichiers non nécessaire.');
      return;
    }
    
    let generationReason = '';
    if (dataChanged) generationReason += 'modifications détectées dans les données';
    if (imagesEmpty) generationReason += (generationReason ? ', ' : '') + 'dossiers d\'images vides';
    if (args.includes('--no-reset')) generationReason += (generationReason ? ', ' : '') + 'option --no-reset activée';
    
    console.log(`🔄 Génération des fichiers nécessaire (${generationReason})...`);
    
    // Convertir les données en événements
    console.log('🔄 Conversion des données en événements...');
    const standsEvents = convertStandsToEvents(standsResponse.list);
    const ateliersEvents = convertAteliersToEvents(ateliersResponse.list);
    const conferencesEvents = convertConferencesToEvents(conferencesResponse.list);
    
    // Fusionner tous les événements
    const allEvents = [
      ...standsEvents,
      ...ateliersEvents,
      ...conferencesEvents
    ];
    
    // Télécharger et traiter les images
    console.log('🖼️ Traitement des images...');
    const eventsWithImages = await processEventImages(allEvents);
    
    // Organiser les événements par jour
    console.log('📅 Organisation des événements par jour...');
    const eventsByDay = organizeEventsByDay(eventsWithImages);
    
    // Générer le fichier JSON
    console.log('💾 Génération du fichier JSON...');
    await saveEventsToJson(eventsByDay);
    
    // Vérifier les chemins d'images
    console.log('🔍 Vérification des chemins d\'images...');
    await verifyProductionImagePaths(eventsByDay);
    
    // Créer un fichier README pour expliquer comment utiliser les images
    await createImagesReadme();
    
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

/**
 * Vérifie si les données ont changé par rapport aux données précédemment sauvegardées
 * @param {Array} newData - Les nouvelles données récupérées de l'API
 * @param {string} dataType - Le type de données (stands, ateliers, conferences)
 * @returns {boolean} - True si les données ont changé, false sinon
 */
function checkIfDataChanged(newData, dataType) {
  try {
    // Définir le chemin du fichier selon le type de données
    const fileName = `${dataType}_response.json`;
    const filePath = path.join(RAW_DATA_DIR, fileName);
    
    // Vérifier si le fichier de données existe
    if (!fs.existsSync(filePath)) {
      console.log(`📝 Aucun fichier de données précédent trouvé pour ${dataType}. Génération requise.`);
      return true;
    }
    
    // Lire les anciennes données
    const oldDataRaw = fs.readFileSync(filePath, 'utf8');
    const oldData = JSON.parse(oldDataRaw);
    
    // Comparaison simple par nombre d'éléments
    if (!oldData.list || oldData.list.length !== newData.length) {
      console.log(`📊 Différence de nombre d'éléments détectée pour ${dataType} (${oldData.list ? oldData.list.length : 0} vs ${newData.length}). Génération requise.`);
      return true;
    }
    
    // Vérifier si les identifiants et le contenu sont identiques
    const newDataMap = new Map(newData.map(item => [item.Id, JSON.stringify(item)]));
    let hasChanges = false;
    
    for (const oldItem of oldData.list) {
      if (!oldItem.Id) continue;
      
      // Si l'élément n'existe plus ou a été modifié
      if (!newDataMap.has(oldItem.Id) || newDataMap.get(oldItem.Id) !== JSON.stringify(oldItem)) {
        hasChanges = true;
        break;
      }
    }
    
    if (hasChanges) {
      console.log(`🔄 Modifications détectées dans les données ${dataType}. Génération requise.`);
    } else {
      console.log(`✅ Aucune modification détectée dans les données ${dataType}. Génération non nécessaire.`);
    }
    
    return hasChanges;
  } catch (error) {
    console.error(`❌ Erreur lors de la vérification des données ${dataType}:`, error);
    // En cas d'erreur, on génère par sécurité
    return true;
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
    
    // Vérifier si les données ont changé
    const dataChanged = checkIfDataChanged(response.list, 'stands');
    
    // Sauvegarder la réponse complète uniquement si les données ont changé
    if (dataChanged) {
      saveRawData(response, 'stands_response.json');
    }
    
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
      },
      dataChanged: dataChanged
    };
    
    return formattedResponse;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des stands:', error);
    return { list: [], dataChanged: true };
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
    
    // Vérifier si les données ont changé
    const dataChanged = checkIfDataChanged(response.list, 'ateliers');
    
    // Sauvegarder la réponse complète uniquement si les données ont changé
    if (dataChanged) {
      saveRawData(response, 'ateliers_response.json');
    }
    
    // Formatage de la réponse
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
        dbQueryTime: "0"
      },
      dataChanged: dataChanged
    };
    
    return formattedResponse;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des ateliers:', error);
    return { list: [], dataChanged: true };
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
    
    // Vérifier si les données ont changé
    const dataChanged = checkIfDataChanged(response.list, 'conferences');
    
    // Sauvegarder la réponse complète uniquement si les données ont changé
    if (dataChanged) {
      saveRawData(response, 'conferences_response.json');
    }
    
    // Formatage de la réponse
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
        dbQueryTime: "0"
      },
      dataChanged: dataChanged
    };
    
    return formattedResponse;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des conférences:', error);
    return { list: [], dataChanged: true };
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
      
      // Générer la version principale (400px) dans le dossier public
      await originalImage
        .resize(400, 400, { 
          fit: fitOption,
          position: positionOption,
          withoutEnlargement: true,
          background: whiteBackground
        })
        .webp({ quality: 80 })
        .toFile(path.join(publicDir, `${fileName}.webp`));
      
      // Générer également une version dans src/assets pour le développement local
      // Cette étape est optionnelle mais peut être utile pour le développement
      if (!IS_PRODUCTION) {
        await originalImage
          .resize(400, 400, { 
            fit: fitOption,
            position: positionOption,
            withoutEnlargement: true,
            background: whiteBackground
          })
          .webp({ quality: 80 })
          .toFile(path.join(srcDir, `${fileName}.webp`));
      }
      
      // Stocker le chemin dans le cache
      const optimizedPath = getImagePath(eventType, fileName);
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
    
    // Toujours sauvegarder dans le dossier public
    await fs.promises.writeFile(path.join(publicDir, `${fileName}.webp`), placeholderImage);
    
    // Optionnellement sauvegarder dans le dossier src pour le développement
    if (!IS_PRODUCTION) {
      await fs.promises.writeFile(path.join(srcDir, `${fileName}.webp`), placeholderImage);
    }
    
    // Stocker le chemin dans le cache
    const fallbackPath = getImagePath(eventType, fileName);
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

// Vérifier que les chemins d'images en production sont corrects
async function verifyProductionImagePaths(eventsByDay) {
  let imageCount = 0;
  let missingCount = 0;
  
  console.log('🔍 Vérification des chemins d\'images...');
  
  // Parcourir tous les événements
  for (const day in eventsByDay) {
    for (const event of eventsByDay[day]) {
      // Vérifier l'image principale
      if (event.image) {
        imageCount++;
        
        // Extraire le chemin relatif de l'image (sans le / initial)
        const relativePath = event.image.startsWith('/') ? event.image.substring(1) : event.image;
        
        // Vérifier si l'image existe dans le dossier public
        const publicPath = path.join(ROOT_DIR, 'public', relativePath);
        if (!fs.existsSync(publicPath)) {
          console.error(`⚠️ Image manquante: ${publicPath}`);
          missingCount++;
        }
      }
      
      // Vérifier l'image du conférencier
      if (event.speakerImage) {
        imageCount++;
        
        // Extraire le chemin relatif de l'image (sans le / initial)
        const relativePath = event.speakerImage.startsWith('/') ? event.speakerImage.substring(1) : event.speakerImage;
        
        // Vérifier si l'image existe dans le dossier public
        const publicPath = path.join(ROOT_DIR, 'public', relativePath);
        if (!fs.existsSync(publicPath)) {
          console.error(`⚠️ Image de conférencier manquante: ${publicPath}`);
          missingCount++;
        }
      }
    }
  }
  
  console.log(`📊 Vérification des images terminée: ${imageCount} images vérifiées, ${missingCount} manquantes`);
  
  if (missingCount > 0) {
    console.warn(`⚠️ Attention: ${missingCount} images sont manquantes dans le dossier public. Les chemins dans le JSON pourraient être incorrects.`);
  } else {
    console.log('✅ Toutes les images sont présentes dans le dossier public.');
  }
  
  // Afficher un rappel important
  console.log('\n🔔 RAPPEL IMPORTANT:');
  console.log('   Les chemins d\'images dans le JSON sont définis comme:');
  console.log(`   ${getImagePath('example', 'example').replace('example/example.webp', '')}`);
  console.log('   Assurez-vous que ces chemins sont accessibles sur Netlify.');
  console.log('\n⚠️ NOTE POUR ASTRO:');
  console.log('   Si vous utilisez ces images dans des composants Astro, vous avez deux options:');
  console.log('   1. Utiliser la balise <img> standard avec le chemin exact du JSON:');
  console.log('      <img src="/images/events/stands/stand-123.webp" alt="..." />');
  console.log('   2. Utiliser le composant Image d\'Astro avec une URL absolue:');
  console.log('      <Image src="/images/events/stands/stand-123.webp" width="400" height="400" alt="..." />');
  console.log('   Évitez d\'importer ces images avec import car Astro les traiterait différemment.');
}

// Créer un fichier README pour expliquer comment utiliser les images
async function createImagesReadme() {
  const readmePath = path.join(IMAGES_PUBLIC_DIR, 'README.md');
  
  const readmeContent = `# Images des événements

Ce dossier contient les images optimisées pour les événements du festival.

## Structure

Les images sont organisées par type d'événement :
- \`/stands\` : Images des stands
- \`/ateliers\` : Images des ateliers
- \`/conferences\` : Images des conférences

## Utilisation dans Astro

### Option 1 : Balise HTML standard (recommandé)

\`\`\`astro
---
// Importer les données JSON
import events from '../content/festival/events.json';
---

{events.Mercredi.map(event => (
  <div>
    <h2>{event.title}</h2>
    {event.image && <img src={event.image} alt={event.title} />}
  </div>
))}
\`\`\`

### Option 2 : Composant Image d'Astro avec URL

\`\`\`astro
---
// Importer les données JSON et le composant Image
import { Image } from 'astro:assets';
import events from '../content/festival/events.json';
---

{events.Mercredi.map(event => (
  <div>
    <h2>{event.title}</h2>
    {event.image && (
      <Image 
        src={event.image} 
        width={400} 
        height={400} 
        alt={event.title} 
      />
    )}
  </div>
))}
\`\`\`

### ⚠️ Important

- N'essayez PAS d'importer ces images avec \`import\` car Astro les traiterait différemment
- Les chemins dans le JSON sont déjà optimisés pour fonctionner en production sur Netlify
- Utilisez toujours les chemins exacts fournis dans le JSON
`;

  await fs.promises.writeFile(readmePath, readmeContent, 'utf8');
  console.log(`📝 Fichier README créé : ${readmePath}`);
}

// Exécuter la fonction principale
main().catch(error => {
  console.error('❌ Erreur lors de la génération des données statiques:', error);
  process.exit(1);
}); 