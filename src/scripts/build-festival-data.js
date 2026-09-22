// Script de build pour générer les données statiques du festival
// Ce script est exécuté uniquement au moment du build

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import sharp from 'sharp';
import dotenv from 'dotenv';
import { Api } from 'nocodb-sdk';
import { Poppler } from 'node-poppler';

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

// Détecter la branche avec plusieurs variables possibles
const BRANCH =
  process.env.BRANCH ||
  process.env.NETLIFY_BRANCH ||
  process.env.HEAD ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  'unknown';

// Si nous sommes sur Netlify ou si le mode production est forcé ou si NODE_ENV est production
const IS_PRODUCTION = IS_NETLIFY || FORCE_PRODUCTION || NODE_ENV_PRODUCTION;
const IS_MAIN_BRANCH = BRANCH === 'main' || BRANCH === 'master';

// Ajouter un log de débogage pour vérifier toutes les variables de branche
console.log(`🔍 Variables de branche détectées:`);
console.log(`   - BRANCH: ${process.env.BRANCH || 'non définie'}`);
console.log(`   - NETLIFY_BRANCH: ${process.env.NETLIFY_BRANCH || 'non définie'}`);
console.log(`   - HEAD: ${process.env.HEAD || 'non définie'}`);
console.log(`   - VERCEL_GIT_COMMIT_REF: ${process.env.VERCEL_GIT_COMMIT_REF || 'non définie'}`);
console.log(`   - Branche finale utilisée: ${BRANCH}`);
console.log(`   - Est-ce main/master?: ${IS_MAIN_BRANCH ? 'OUI' : 'NON'}`);

// Charger les settings pour vérifier showUnpublishedEvents
let showUnpublishedEvents = true; // Par défaut, on montre tout (sécurité pour le dev)
try {
  const settingsPath = path.join(ROOT_DIR, 'src/content/site/settings.json');
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  showUnpublishedEvents = settings?.festival?.showUnpublishedEvents ?? true;
} catch (error) {
  console.warn('⚠️ Impossible de charger settings.json, utilisation des valeurs par défaut:', error.message);
}

// GARDE-FOU DE SÉCURITÉ: En production sur main, on ne montre JAMAIS les événements non publiés
if (IS_PRODUCTION && IS_MAIN_BRANCH) {
  showUnpublishedEvents = false;
  console.log('🔒 SÉCURITÉ: Branche main en production - événements non publiés masqués');
}

console.log(`🔧 Environnement de build:`);
console.log(`   - Netlify: ${IS_NETLIFY ? 'Oui' : 'Non'}`);
console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'non défini'}`);
console.log(`   - Branche: ${BRANCH}`);
console.log(`   - Force production: ${FORCE_PRODUCTION ? 'Oui' : 'Non'}`);
console.log(`   - Mode final: ${IS_PRODUCTION ? 'PRODUCTION' : 'DÉVELOPPEMENT'}`);
console.log(`   - Afficher événements non publiés: ${showUnpublishedEvents ? 'Oui' : 'Non'}`);

// Configuration NocoDB (basée sur src/config/nocodb.ts)
const NOCODB_BASE_URL = process.env.NOCODB_BASE_URL || 'https://app.nocodb.com';
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN || '';

const NOCODB_CONFIG = {
  // Identifiant du projet
  projectId: 'pocv8knemg3rcok',

  // Identifiants des tables
  tables: {
    stands: 'mbwhou86e9tzqql', // ID de la table des stands
    ateliers: 'maiiy35ahod5nnu', // ID de la table des ateliers
    conferences: 'mdf8viczcxywoug', // ID de la table des conférences
  },

  // Paramètres de requête par défaut
  defaultQueryParams: {
    stands: {
      offset: 0,
      limit: 100,
      where: '',
    },
    ateliers: {
      offset: 0,
      limit: 50,
      where: '',
    },
    conferences: {
      offset: 0,
      limit: 50,
      where: '',
    },
  },
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
console.log(
  `   - Chemin des images dans JSON: ${getImagePath('example', 'example').replace('example/example.webp', '')}`
);
console.log(`   - Images source: ${IMAGES_SRC_DIR}`);
console.log(`   - Images public: ${IMAGES_PUBLIC_DIR}`);

// Jours du festival - chargement depuis TinaCMS avec fallback défensif
/**
 * Load festival days from TinaCMS with fallback.
 * NEVER breaks the build - always returns valid array.
 */
function loadFestivalDays() {
  const TINA_PATH = path.join(ROOT_DIR, 'src/content/festival/tina/index.json');
  const DEFAULT_DAYS = ['Mercredi', 'Jeudi', 'Vendredi'];

  try {
    if (!fs.existsSync(TINA_PATH)) {
      console.warn(`[WARN] Tina config not found at ${TINA_PATH}, using defaults`);
      return DEFAULT_DAYS;
    }

    const tinaContent = JSON.parse(fs.readFileSync(TINA_PATH, 'utf8'));

    if (!tinaContent.festivalDates || !Array.isArray(tinaContent.festivalDates)) {
      console.warn('[WARN] Invalid festivalDates in Tina config, using defaults');
      return DEFAULT_DAYS;
    }

    // Calculer les noms de jours depuis les dates ISO (timezone-safe)
    const days = tinaContent.festivalDates
      .map((d) => {
        const date = new Date(d.date);
        // CRITICAL: explicit timezone pour éviter décalage de jour
        const dayName = new Intl.DateTimeFormat('fr-FR', {
          weekday: 'long',
          timeZone: 'Europe/Brussels',
        }).format(date);
        return dayName.charAt(0).toUpperCase() + dayName.slice(1);
      })
      .filter(Boolean);

    if (days.length === 0) {
      console.warn('[WARN] No valid days found in Tina config, using defaults');
      return DEFAULT_DAYS;
    }

    console.log(`[INFO] Loaded ${days.length} festival days from TinaCMS: ${days.join(', ')}`);
    return days;
  } catch (error) {
    console.error(`[ERROR] Failed to load festival days: ${error.message}`);
    return DEFAULT_DAYS;
  }
}

const DAYS = loadFestivalDays();

/**
 * Initialise l'API NocoDB avec le token d'authentification
 * @returns Instance de l'API NocoDB
 */
function initNocoDBApi() {
  console.log("Initialisation de l'API NocoDB avec le token:", NOCODB_API_TOKEN ? 'Token présent' : 'Token manquant');

  return new Api({
    baseURL: NOCODB_BASE_URL,
    headers: {
      'xc-token': NOCODB_API_TOKEN,
    },
  });
}

// Normaliser les valeurs de jour
function normalizeDay(day) {
  if (!day) return 'Mercredi'; // Valeur par défaut

  // Gérer le cas où day est un nombre (0 = Les trois jours, 1 = Mercredi, 2 = Jeudi, 3 = Vendredi)
  if (typeof day === 'number') {
    switch (day) {
      case 1:
        return 'Mercredi';
      case 2:
        return 'Jeudi';
      case 3:
        return 'Vendredi';
      case 0:
        return 'Mercredi'; // Pour les trois jours, on met par défaut Mercredi
      default:
        return 'Mercredi';
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
  if (typeof time === 'string' && time.length > 5) {
    return time.substring(0, 5);
  }
  return time;
}

/**
 * Calcule l'heure de fin à partir d'une heure de début et d'une durée.
 * @param {string} startTime - L'heure de début au format "HH:mm".
 * @param {number} durationInMinutes - La durée en minutes.
 * @returns {string} L'heure de fin au format "HH:mm".
 */
function calculateEndTime(startTime, durationInMinutes) {
  if (!startTime || typeof startTime !== 'string' || !startTime.includes(':') || durationInMinutes == null) {
    return '';
  }

  const [hours, minutes] = startTime.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    return '';
  }

  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);

  const endDate = new Date(startDate.getTime() + durationInMinutes * 60000);

  const endHours = endDate.getHours().toString().padStart(2, '0');
  const endMinutes = endDate.getMinutes().toString().padStart(2, '0');

  return `${endHours}:${endMinutes}`;
}

/**
 * Tests automatiques pour la fonction calculateEndTime
 */
function testCalculateEndTime() {
  const tests = [
    { start: '09:00', duration: 60, expected: '10:00' },
    { start: '09:30', duration: 30, expected: '10:00' },
    { start: '14:45', duration: 90, expected: '16:15' },
    { start: '23:30', duration: 60, expected: '00:30' },
  ];

  let allPassed = true;

  tests.forEach((test) => {
    const result = calculateEndTime(test.start, test.duration);
    if (result !== test.expected) {
      console.error(`❌ Test failed: ${test.start} + ${test.duration}min = ${result} (expected ${test.expected})`);
      allPassed = false;
    }
  });

  if (allPassed) {
    console.log('✅ calculateEndTime function tests passed');
  }
  return allPassed;
}

/**
 * Détermine la durée d'un événement selon son type et données
 * @param {Object} event - L'événement à analyser
 * @returns {number} Durée en minutes
 *
 * Logique de priorité :
 * 1. Champ "Durée" explicite dans NocoDB (en minutes)
 * 2. Démos numériques (Village numérique) = 30 minutes
 * 3. Ateliers normaux et conférences = 60 minutes (1h)
 */
function getEventDuration(event) {
  // Priorité 1: champ Durée explicite (en minutes)
  if (event.Durée && !isNaN(parseInt(event.Durée))) {
    return parseInt(event.Durée);
  }

  // Priorité 2: démos numériques (Village numérique) = 30 minutes
  // Gérer le cas où Espaces peut être un objet ou une chaîne de caractères
  const espacesTitle = event.Espaces && typeof event.Espaces === 'object' ? event.Espaces.Title : event.Espaces;

  if (espacesTitle === 'Village numérique') {
    return 30;
  }

  // Priorité 3: ateliers normaux et conférences par défaut = 60 minutes (1h)
  return 60;
}

// Exécuter les tests au chargement
testCalculateEndTime();

/**
 * Vérifie si les dossiers d'images des événements sont vides
 * @returns {boolean} - True si au moins un des dossiers d'images est vide, false sinon
 */
function areImageDirectoriesEmpty() {
  try {
    const imageDirectories = [
      path.join(IMAGES_SRC_DIR, 'stands'),
      path.join(IMAGES_SRC_DIR, 'ateliers'),
      path.join(IMAGES_SRC_DIR, 'conferences'),
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

    // Lancer l'auto-test au début du build
    testCalculateEndTime();

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
    const dataChanged = standsResponse.dataChanged || ateliersResponse.dataChanged || conferencesResponse.dataChanged;

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
      console.log(
        '✅ Aucune modification détectée dans les données et les images sont déjà présentes. Génération des fichiers non nécessaire.'
      );
      return;
    }

    let generationReason = '';
    if (dataChanged) generationReason += 'modifications détectées dans les données';
    if (imagesEmpty) generationReason += (generationReason ? ', ' : '') + "dossiers d'images vides";
    if (args.includes('--no-reset')) generationReason += (generationReason ? ', ' : '') + 'option --no-reset activée';

    console.log(`🔄 Génération des fichiers nécessaire (${generationReason})...`);

    // Convertir les données en événements
    console.log('🔄 Conversion des données en événements...');
    const standsEvents = convertStandsToEvents(standsResponse.list);
    const ateliersEvents = convertAteliersToEvents(ateliersResponse.list);
    const conferencesEvents = convertConferencesToEvents(conferencesResponse.list);

    // Fusionner tous les événements
    const allEvents = [...standsEvents, ...ateliersEvents, ...conferencesEvents];

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
    console.log("🔍 Vérification des chemins d'images...");
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
    RAW_DATA_DIR,
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
      console.log(`📁 Répertoire créé : ${dir}`);
    }
  }
}

// Sauvegarder les données brutes dans un fichier JSON pour référence
function saveRawData(dataList, filename) {
  try {
    const filePath = path.join(RAW_DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(dataList, null, 2));
    console.log(`✅ Données brutes sauvegardées dans ${filePath}`);
  } catch (error) {
    console.error(`❌ Erreur lors de la sauvegarde des données (${filename}):`, error);
  }
}

/**
 * Charge les données depuis le cache local
 * @param {string} dataType - Le type de données (stands, ateliers, conferences)
 * @returns {Promise<Array>} - Les données du cache ou null si erreur
 */
async function loadCachedData(dataType) {
  const cacheFile = path.join(RAW_DATA_DIR, `${dataType}_raw.json`);

  try {
    if (!fs.existsSync(cacheFile)) {
      console.warn(`⚠️ Fichier de cache non trouvé: ${cacheFile}`);
      return null;
    }

    const cacheData = await fs.promises.readFile(cacheFile, 'utf8');
    const parsedData = JSON.parse(cacheData);

    // Valider la structure du cache
    if (!Array.isArray(parsedData)) {
      console.error(`❌ Format de cache invalide pour ${dataType}: attendu array, reçu ${typeof parsedData}`);
      return null;
    }

    // Vérifier l'âge du cache
    const stats = fs.statSync(cacheFile);
    const ageHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
    const ageDays = Math.floor(ageHours / 24);

    if (ageDays > 0) {
      console.warn(`⚠️ Cache de ${dataType} date de ${ageDays} jour(s)`);
    }

    console.log(`✅ ${parsedData.length} ${dataType} chargés depuis le cache`);
    return parsedData;
  } catch (error) {
    console.error(`❌ Erreur lors du chargement du cache ${dataType}:`, error.message);
    return null;
  }
}

/**
 * Vérifie si les données ont changé par rapport aux données précédemment sauvegardées
 * @param {Array} newDataList - La nouvelle liste d'éléments récupérée de l'API
 * @param {string} dataType - Le type de données (stands, ateliers, conferences)
 * @returns {boolean} - True si les données ont changé, false sinon
 */
function checkIfDataChanged(newDataList, dataType) {
  const rawFileName = `${dataType}_raw.json`;
  const filePath = path.join(RAW_DATA_DIR, rawFileName);

  try {
    // Vérifier si le fichier de données précédent existe
    if (!fs.existsSync(filePath)) {
      console.log(
        `📝 Aucun fichier de données précédent trouvé pour ${dataType} (${rawFileName}). Sauvegarde initiale.`
      );
      saveRawData(newDataList, rawFileName);
      return true;
    }

    // Lire les anciennes données
    const oldDataRaw = fs.readFileSync(filePath, 'utf8');
    const oldDataList = JSON.parse(oldDataRaw);

    // Comparaison par nombre d'éléments
    if (!Array.isArray(oldDataList) || oldDataList.length !== newDataList.length) {
      console.log(
        `📊 Différence de nombre d'éléments détectée pour ${dataType} (${oldDataList ? oldDataList.length : 0} vs ${newDataList.length}).`
      );
      saveRawData(newDataList, rawFileName);
      return true;
    }

    // Comparaison plus détaillée (basée sur les ID et la sérialisation)
    // Crée des maps pour une recherche rapide par ID
    const oldDataMap = new Map(oldDataList.map((item) => [item.ID || item.Id, JSON.stringify(item)]));
    const newDataMap = new Map(newDataList.map((item) => [item.ID || item.Id, JSON.stringify(item)]));

    // Vérifie si tous les anciens éléments existent et sont identiques dans les nouvelles données
    for (const [id, oldJson] of oldDataMap.entries()) {
      if (!newDataMap.has(id) || newDataMap.get(id) !== oldJson) {
        console.log(`🔄 Modification détectée pour ${dataType} (élément ID: ${id} modifié ou supprimé).`);
        saveRawData(newDataList, rawFileName);
        return true;
      }
    }

    // Vérifie si de nouveaux éléments ont été ajoutés
    for (const [id] of newDataMap.entries()) {
      if (!oldDataMap.has(id)) {
        console.log(`🔄 Modification détectée pour ${dataType} (nouvel élément ID: ${id} ajouté).`);
        saveRawData(newDataList, rawFileName);
        return true;
      }
    }

    console.log(`✅ Aucune modification détectée dans les données ${dataType}.`);
    return false;
  } catch (error) {
    console.error(`❌ Erreur lors de la vérification des données ${dataType}:`, error);
    // En cas d'erreur (ex: fichier JSON corrompu), considérer comme modifié pour forcer la regénération
    saveRawData(newDataList, rawFileName); // Sauvegarde la nouvelle version par sécurité
    return true;
  }
}

// Fonction générique pour récupérer toutes les lignes d'une table avec pagination
async function fetchAllTableRows(api, tableId, queryParamsBase, dataType) {
  let allItems = [];
  let currentPage = 0;
  let isLastPage = false;
  let totalRows = 0;
  const limit = queryParamsBase.limit || 50; // Utiliser la limite définie ou 50 par défaut

  console.log(`Appel à l'API NocoDB pour récupérer les ${dataType}...`);

  while (!isLastPage) {
    const queryParams = {
      ...queryParamsBase,
      offset: currentPage * limit,
      limit: limit,
      where: queryParamsBase.where || '', // Assurer que where est défini
    };

    console.log(
      `${dataType}: Requête page ${currentPage + 1} avec offset ${queryParams.offset}, limit ${queryParams.limit}`
    );

    try {
      const response = await api.dbTableRow.list('noco', NOCODB_CONFIG.projectId, tableId, queryParams);

      const currentItems = response.list || [];
      allItems = [...allItems, ...currentItems];
      totalRows = response.pageInfo?.totalRows || totalRows; // Conserver le total si déjà connu

      // Détermination plus fiable de la dernière page
      isLastPage =
        response.pageInfo?.isLastPage || currentItems.length < limit || (allItems.length >= totalRows && totalRows > 0);

      console.log(
        `${dataType}: Page ${currentPage + 1} récupérée: ${currentItems.length} éléments (Total: ${allItems.length}/${totalRows || 'inconnu'})`
      );

      currentPage++;

      // Sécurité anti-boucle infinie
      if (currentPage > 100) {
        console.warn(`⚠️ Nombre maximum de pages (100) atteint pour ${dataType}, arrêt de la boucle par sécurité.`);
        break;
      }

      // Si la dernière réponse était vide et ce n'est pas la première page, on arrête
      if (currentItems.length === 0 && currentPage > 1) {
        console.log(`${dataType}: Réponse vide reçue pour la page ${currentPage}, fin de la récupération.`);
        isLastPage = true; // Forcer la sortie
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération de la page ${currentPage + 1} pour ${dataType}:`, error);
      // Décider s'il faut arrêter ou continuer en cas d'erreur sur une page
      // Pour l'instant, on arrête pour éviter des données partielles non détectées
      throw new Error(`Erreur API NocoDB pour ${dataType} page ${currentPage + 1}: ${error.message}`);
    }
  }

  console.log(`Données récupérées pour ${dataType}: ${allItems.length} éléments trouvés au total`);
  return allItems;
}

// Récupérer les stands depuis NocoDB avec pagination complète
async function fetchStands() {
  try {
    const api = initNocoDBApi();
    const allStands = await fetchAllTableRows(
      api,
      NOCODB_CONFIG.tables.stands,
      NOCODB_CONFIG.defaultQueryParams.stands,
      'stands'
    );
    const dataChanged = checkIfDataChanged(allStands, 'stands');
    return { list: allStands, dataChanged: dataChanged };
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des stands depuis l'API:", error.message);

    // Fallback: utiliser les données en cache si disponibles
    console.warn('⚠️ Tentative de chargement depuis le cache...');
    const cachedData = await loadCachedData('stands');

    if (cachedData && cachedData.length > 0) {
      console.warn('⚠️ ATTENTION: Utilisation des données en CACHE pour les stands');
      console.warn("⚠️ Vérifiez le token NocoDB dans les variables d'environnement");
      return { list: cachedData, dataChanged: false }; // Pas de changement, on utilise le cache
    }

    console.error('❌ Aucune donnée disponible pour les stands (ni API, ni cache)');
    return { list: [], dataChanged: true }; // Indiquer un changement en cas d'erreur pour forcer la regénération
  }
}

// Récupérer les ateliers depuis NocoDB avec pagination complète
async function fetchAteliers() {
  try {
    const api = initNocoDBApi();
    const allAteliers = await fetchAllTableRows(
      api,
      NOCODB_CONFIG.tables.ateliers,
      NOCODB_CONFIG.defaultQueryParams.ateliers,
      'ateliers'
    );
    const dataChanged = checkIfDataChanged(allAteliers, 'ateliers');
    return { list: allAteliers, dataChanged: dataChanged };
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des ateliers depuis l'API:", error.message);

    // Fallback: utiliser les données en cache si disponibles
    console.warn('⚠️ Tentative de chargement depuis le cache...');
    const cachedData = await loadCachedData('ateliers');

    if (cachedData && cachedData.length > 0) {
      console.warn('⚠️ ATTENTION: Utilisation des données en CACHE pour les ateliers');
      console.warn("⚠️ Vérifiez le token NocoDB dans les variables d'environnement");
      return { list: cachedData, dataChanged: false }; // Pas de changement, on utilise le cache
    }

    console.error('❌ Aucune donnée disponible pour les ateliers (ni API, ni cache)');
    return { list: [], dataChanged: true };
  }
}

// Récupérer les conférences depuis NocoDB avec pagination complète
async function fetchConferences() {
  try {
    const api = initNocoDBApi();
    const allConferences = await fetchAllTableRows(
      api,
      NOCODB_CONFIG.tables.conferences,
      NOCODB_CONFIG.defaultQueryParams.conferences,
      'conferences'
    );
    const dataChanged = checkIfDataChanged(allConferences, 'conferences');
    return { list: allConferences, dataChanged: dataChanged };
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des conférences depuis l'API:", error.message);

    // Fallback: utiliser les données en cache si disponibles
    console.warn('⚠️ Tentative de chargement depuis le cache...');
    const cachedData = await loadCachedData('conferences');

    if (cachedData && cachedData.length > 0) {
      console.warn('⚠️ ATTENTION: Utilisation des données en CACHE pour les conférences');
      console.warn("⚠️ Vérifiez le token NocoDB dans les variables d'environnement");
      return { list: cachedData, dataChanged: false }; // Pas de changement, on utilise le cache
    }

    console.error('❌ Aucune donnée disponible pour les conférences (ni API, ni cache)');
    return { list: [], dataChanged: true };
  }
}

// Convertir les stands en événements
function convertStandsToEvents(stands) {
  return stands
    .map((stand) => {
      // Extraire le logo (prendre le plus récent si plusieurs fichiers)
      const logoFiles = stand['Envoyez votre logo'] || [];
      const logo = logoFiles.length > 0 ? logoFiles[logoFiles.length - 1]?.signedUrl : null;

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
      const website = stand['Site internet'] || '';

      // Extraire le statut et la thématique
      const status = stand['Statut'] === 'Publié' ? 'Publié' : 'A valider';
      const theme = stand['Thématique liée'] && stand['Thématique liée'].Title ? stand['Thématique liée'].Title : '';

      // GARDE-FOU: Filtrer les événements non publiés si nécessaire
      if (!showUnpublishedEvents && status === 'A valider') {
        return null; // Cet événement sera filtré
      }

      return {
        id: `stand-${stand.ID}`,
        title: stand['Choisissez un titre court'] || `Stand ${stand.ID}`,
        description: stand['Décrivez brièvement votre stand pour les visiteurs'] || '',
        type: 'Stands',
        day: normalizedDay,
        time: 'Toute la journée',
        endTime: '',
        location,
        speaker: `${stand.Prénom || ''} ${stand.Nom || ''}`.trim() || 'Anonyme',
        organization: '',
        image: logo,
        speakerImage: null,
        tags: [target, level, teachingType].filter(Boolean),
        target,
        level,
        teachingType,
        url: website,
        contact: {
          email: stand.Email || '',
          phone: stand.GSM || '',
        },
        status,
        theme,
      };
    })
    .filter(Boolean); // Filtrer les valeurs null
}

// Convertir les ateliers en événements
function convertAteliersToEvents(ateliers) {
  return ateliers
    .map((atelier) => {
      // Extraire le logo (prendre le plus récent si plusieurs fichiers)
      const logoFiles = atelier['Envoyez votre logo'] || [];
      const logo = logoFiles.length > 0 ? logoFiles[logoFiles.length - 1]?.signedUrl : null;
      const speakerImage = atelier['Envoyez une photo de vous']?.[0]?.signedUrl || null;

      // Normaliser le jour
      const normalizedDay = normalizeDay(atelier.Jours);

      // Gérer les cas où les champs peuvent être null
      const time = formatTime(atelier.Heure);
      const formattedEndTime = formatTime(atelier['Heure de fin']);
      const endTime =
        formattedEndTime && formattedEndTime !== 'À définir'
          ? formattedEndTime
          : calculateEndTime(time, getEventDuration(atelier));

      // Gérer le cas où Espaces peut être un objet ou une chaîne de caractères
      let location = 'À définir';
      if (atelier.Espaces) {
        location =
          typeof atelier.Espaces === 'object' && atelier.Espaces !== null
            ? atelier.Espaces.Title || 'À définir'
            : atelier.Espaces;
      }

      // Extraire les informations supplémentaires
      const target = atelier["À qui s'adresse atelier ?"] || '';
      const level = atelier["Niveau d'enseignement"] || '';
      const teachingType = atelier["Type d'enseignement"] || '';
      const website = atelier['Site internet'] || '';

      // Extraire le statut
      const status = atelier['Statut'] === 'Publié' ? 'Publié' : 'A valider';

      // GARDE-FOU: Filtrer les événements non publiés si nécessaire
      if (!showUnpublishedEvents && status === 'A valider') {
        return null; // Cet événement sera filtré
      }

      return {
        id: `atelier-${atelier.ID}`,
        title: atelier['Choisissez un titre court'] || `Atelier ${atelier.ID}`,
        description: atelier['Décrivez brièvement votre animation pour les visiteurs'] || '',
        type: 'Ateliers',
        day: normalizedDay,
        time,
        endTime,
        location,
        speaker: `${atelier.Prénom || ''} ${atelier.Nom || ''}`.trim() || 'Anonyme',
        organization: atelier.Organisation || '',
        image: logo,
        speakerImage,
        tags: [target, level, teachingType].filter(Boolean),
        target,
        level,
        teachingType,
        url: website,
        contact: {
          email: atelier.Email || '',
          phone: atelier.GSM || '',
        },
        status,
      };
    })
    .filter(Boolean); // Filtrer les valeurs null
}

// Convertir les conférences en événements
function convertConferencesToEvents(conferences) {
  return conferences
    .map((conference) => {
      // Extraire les images (prendre le plus récent si plusieurs fichiers)
      const logoFiles = conference['Envoyez votre logo'] || [];
      const logo = logoFiles.length > 0 ? logoFiles[logoFiles.length - 1]?.signedUrl : null;
      const speakerImage = conference['Envoyez une photo de vous']?.[0]?.signedUrl || null;

      // Normaliser le jour
      const normalizedDay = normalizeDay(conference.Jours);

      // Déterminer le titre
      let title = '';

      // Essayer d'abord "Choisissez un titre pour la conférence"
      if (conference['Choisissez un titre pour la conférence']) {
        title = conference['Choisissez un titre pour la conférence'];
      }
      // Ensuite essayer "Choisissez un titre court"
      else if (conference['Choisissez un titre court']) {
        title = conference['Choisissez un titre court'];
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

      // Gérer le cas où Espaces peut être null
      let location = 'À définir';
      if (conference.Espaces) {
        location =
          typeof conference.Espaces === 'object' && conference.Espaces !== null
            ? conference.Espaces.Title || 'À définir'
            : conference.Espaces;
      }

      // Extraire les informations supplémentaires
      const target = conference["À qui s'adresse conference ?"] || '';
      const level = conference["Niveau d'enseignement"] || '';
      const teachingType = conference["Type d'enseignement"] || '';
      const website = conference['Site internet'] || '';

      // Extraire le statut
      const status = conference['Statut'] === 'Publié' ? 'Publié' : 'A valider';

      // GARDE-FOU: Filtrer les événements non publiés si nécessaire
      if (!showUnpublishedEvents && status === 'A valider') {
        return null; // Cet événement sera filtré
      }

      // Logique de durée
      const duration = conference.Durée || 60; // 60min (1h) par défaut pour les conférences
      const formattedEndTime = formatTime(conference['Heure de fin']);
      const endTime =
        formattedEndTime && formattedEndTime !== 'À définir'
          ? formattedEndTime
          : calculateEndTime(formatTime(conference.Heure), duration);

      return {
        id: `conference-${conference.ID}`,
        title: title || `Conférence ${conference.ID}`,
        description: conference['Décrivez brièvement votre conférence pour les visiteurs'] || '',
        type: 'Conférences',
        day: normalizedDay,
        time: formatTime(conference.Heure),
        endTime,
        location,
        speaker: `${conference.Prénom || ''} ${conference.Nom || ''}`.trim() || 'Anonyme',
        organization: conference.Organisation || '',
        image: logo,
        speakerImage,
        tags: [target, level, teachingType].filter(Boolean),
        target,
        level,
        teachingType,
        url: website,
        contact: {
          email: conference.Email || '',
          phone: conference.GSM || '',
        },
        status,
      };
    })
    .filter(Boolean); // Filtrer les valeurs null
}

// Télécharger et traiter les images des événements
async function processEventImages(events) {
  // Créer un cache pour éviter de télécharger plusieurs fois la même image
  const imageUrlCache = new Map();
  // Compteur pour les images téléchargées
  let downloadCount = 0;
  let totalImages = 0;

  // Compter le nombre total d'images à télécharger
  events.forEach((event) => {
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
          console.log(
            `📥 Progression: ${downloadCount}/${totalImages} images téléchargées (${Math.round((downloadCount / totalImages) * 100)}%)`
          );
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
          console.log(
            `📥 Progression: ${downloadCount}/${totalImages} images téléchargées (${Math.round((downloadCount / totalImages) * 100)}%)`
          );
        }
      }
    }
  }

  console.log(`✅ Téléchargement terminé: ${downloadCount} images traitées`);

  return events;
}

/**
 * Converts a PDF buffer to a PNG image buffer using node-poppler
 * @param {Buffer} pdfBuffer - The PDF file buffer
 * @param {string} eventId - Event ID for logging purposes
 * @returns {Promise<Buffer|null>} PNG image buffer or null on failure
 */
async function convertPdfToImageBuffer(pdfBuffer, eventId) {
  // Vérifier si la conversion PDF est désactivée (environnement Netlify sans Poppler)
  if (process.env.PDF_CONVERSION_DISABLED === 'true') {
    console.log(`⚠️ Conversion PDF désactivée pour ${eventId} (environnement sans Poppler)`);
    return null;
  }

  const tempDir = path.join(ROOT_DIR, 'temp', `pdf-conversion-${eventId}-${Date.now()}`);
  const tempPdfPath = path.join(tempDir, 'input.pdf');
  const outputPngPath = path.join(tempDir, 'output'); // Sans extension, pdfToCairo l'ajoute

  try {
    // Créer le répertoire temporaire
    await fs.promises.mkdir(tempDir, { recursive: true });

    // Écrire le PDF buffer dans un fichier temporaire
    await fs.promises.writeFile(tempPdfPath, pdfBuffer);

    // Initialiser l'instance Poppler
    const poppler = new Poppler();

    // Configuration pour la conversion PDF vers PNG haute qualité
    const options = {
      firstPageToConvert: 1,
      lastPageToConvert: 1,
      pngFile: true,
      resolutionXYAxis: 300, // 300 DPI pour une haute qualité
      singleFile: true, // Un seul fichier de sortie
    };

    // Convertir le PDF en PNG avec pdfToCairo
    await poppler.pdfToCairo(tempPdfPath, outputPngPath, options);

    // Vérifier que le fichier PNG a été créé (pdfToCairo ajoute automatiquement .png)
    const actualPngPath = `${outputPngPath}.png`;
    if (!fs.existsSync(actualPngPath)) {
      // Lister les fichiers créés pour le débogage
      const files = fs.readdirSync(tempDir);
      throw new Error(
        `Fichier PNG converti non trouvé. Attendu: ${actualPngPath}, Fichiers créés: ${files.join(', ')}`
      );
    }

    // Lire l'image PNG convertie
    const pngBuffer = await fs.promises.readFile(actualPngPath);
    console.log(`✅ PDF converti avec succès pour ${eventId} (${pngBuffer.length} bytes)`);

    return pngBuffer;
  } catch (error) {
    console.error(`❌ Erreur lors de la conversion PDF pour ${eventId}:`, error.message);
    return null;
  } finally {
    // Nettoyage : supprimer le répertoire temporaire
    try {
      if (fs.existsSync(tempDir)) {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
      }
    } catch (cleanupError) {
      console.warn(`⚠️ Erreur lors du nettoyage pour ${eventId}:`, cleanupError.message);
    }
  }
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
    const publicFilePath = path.join(publicDir, `${fileName}.webp`);

    // Vérifier si l'image existe déjà, sauf si l'option --force-images est activée
    const args = process.argv.slice(2);
    if (fs.existsSync(publicFilePath) && !args.includes('--force-images')) {
      // Mettre en cache et retourner le chemin existant
      const optimizedPath = getImagePath(eventType, fileName);
      imageUrlCache.set(imageUrl, optimizedPath);
      return optimizedPath;
    }

    // S'assurer que les répertoires existent
    await fs.promises.mkdir(srcDir, { recursive: true });
    await fs.promises.mkdir(publicDir, { recursive: true });

    // Télécharger l'image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(
        `⚠️ Erreur lors du téléchargement de l'image pour ${eventId}: ${response.status} ${response.statusText}`
      );
      return await createPlaceholderImage(srcDir, publicDir, fileName, eventType, imageUrlCache, imageUrl);
    }

    const buffer = await response.buffer();

    try {
      // Créer un fond blanc pour toutes les images
      const whiteBackground = {
        r: 255,
        g: 255,
        b: 255,
        alpha: 1,
      };

      // Détecter et convertir les PDFs et ICOs si nécessaire
      const contentType = response.headers.get('content-type') || '';
      const urlLower = imageUrl.toLowerCase();
      let imageBuffer = buffer;
      let wasConverted = false;

      if (contentType === 'application/pdf' || urlLower.endsWith('.pdf')) {
        console.log(`📄 Conversion PDF détectée pour ${eventId}`);
        imageBuffer = await convertPdfToImageBuffer(buffer, eventId);
        wasConverted = true;
        if (!imageBuffer) {
          console.error(`⚠️ Échec de la conversion PDF pour ${eventId}, utilisation d'une image de remplacement`);
          return await createPlaceholderImage(srcDir, publicDir, fileName, eventType, imageUrlCache, imageUrl);
        }
      } else if (
        contentType === 'image/x-icon' ||
        contentType === 'image/vnd.microsoft.icon' ||
        urlLower.endsWith('.ico')
      ) {
        console.log(`🔮 Conversion ICO détectée pour ${eventId}`);
        // Sharp supporte nativement les fichiers .ico, pas besoin de conversion spéciale
        // Mais on log pour la traçabilité
        wasConverted = true;
      }

      // Charger l'image (originale ou convertie depuis PDF)
      const originalImage = sharp(imageBuffer);

      // Utiliser un fit différent pour les images de conférenciers
      const fitOption = isSpeakerImage ? 'cover' : 'inside';
      const positionOption = isSpeakerImage ? 'north' : 'center';

      // Configuration WebP optimisée selon le type de fichier source
      let webpOptions = { quality: 80 };

      if (urlLower.endsWith('.ico')) {
        // Optimisation spéciale pour les fichiers ICO (souvent des logos)
        webpOptions = {
          quality: 85, // Qualité plus élevée pour les logos
          alphaQuality: 100, // Préserver la transparence à 100%
          preset: 'icon', // Preset optimisé pour les icônes
          effort: 6, // Effort maximal pour la compression
          lossless: false, // Mode lossy mais haute qualité
        };
      } else if (urlLower.endsWith('.pdf')) {
        // Configuration pour les PDFs convertis
        webpOptions = {
          quality: 82, // Légèrement plus haute pour les PDFs vectoriels
          alphaQuality: 95, // Bonne qualité alpha
          smartSubsample: true, // Optimisation du sous-échantillonnage
          effort: 4, // Effort équilibré
        };
      }

      // Générer la version principale (400px) dans le dossier public
      await originalImage
        .resize(400, 400, {
          fit: fitOption,
          position: positionOption,
          withoutEnlargement: true,
          background: whiteBackground,
        })
        .webp(webpOptions)
        .toFile(path.join(publicDir, `${fileName}.webp`));

      // Générer également une version dans src/assets pour le développement local
      // Cette étape est optionnelle mais peut être utile pour le développement
      if (!IS_PRODUCTION) {
        await originalImage
          .resize(400, 400, {
            fit: fitOption,
            position: positionOption,
            withoutEnlargement: true,
            background: whiteBackground,
          })
          .webp(webpOptions)
          .toFile(path.join(srcDir, `${fileName}.webp`));
      }

      // Stocker le chemin dans le cache
      const optimizedPath = getImagePath(eventType, fileName);
      imageUrlCache.set(imageUrl, optimizedPath);

      // Log de succès avec indication du type de conversion
      if (wasConverted) {
        const conversionType = urlLower.endsWith('.pdf') ? 'PDF' : 'ICO';
        console.log(`✅ ${conversionType} converti et optimisé pour ${eventId} → ${optimizedPath}`);
      }

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
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
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

  // Séparer les stands des autres événements
  const stands = events.filter((event) => event.type === 'Stands');
  const otherEvents = events.filter((event) => event.type !== 'Stands');

  // Fonction de comparaison pour le tri
  const compareEvents = (a, b) => {
    // Si un événement a une heure définie et l'autre non, celui avec l'heure définie passe en premier
    if (a.time !== 'À définir' && b.time === 'À définir') return -1;
    if (a.time === 'À définir' && b.time !== 'À définir') return 1;

    // Si les deux événements ont une heure définie et différente de "À définir"
    if (
      a.time !== 'À définir' &&
      b.time !== 'À définir' &&
      a.time !== 'Tous les jours' &&
      b.time !== 'Tous les jours'
    ) {
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

  // Ajouter les événements (hors stands) aux jours correspondants
  for (const event of otherEvents) {
    const normalizedDay = normalizeDay(event.day);
    if (DAYS.includes(normalizedDay)) {
      if (!addedEventIdsByDay[normalizedDay].has(event.id)) {
        eventsByDay[normalizedDay].push({
          ...event,
          day: normalizedDay,
        });
        addedEventIdsByDay[normalizedDay].add(event.id);
      } else {
        console.warn(`⚠️ Doublon détecté et ignoré: ${event.id} (${event.title}) pour le jour ${normalizedDay}`);
      }
    }
  }

  // Ajouter une propriété shared aux stands pour indiquer qu'ils sont partagés entre les jours
  const standsWithSharedFlag = stands.map((stand) => ({
    ...stand,
    time: 'Tous les jours',
    shared: true, // Indicateur que l'événement est partagé entre les jours
  }));

  // Ajouter les stands seulement au jour "Mercredi" (le premier jour)
  // On les ajoutera aux autres jours dans l'interface via DayFilter.astro
  if (standsWithSharedFlag.length > 0) {
    eventsByDay['Mercredi'] = [...eventsByDay['Mercredi'], ...standsWithSharedFlag];
    console.log(`📊 ${standsWithSharedFlag.length} stands ajoutés uniquement au jour Mercredi`);
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
    byDay: {},
  };

  // Initialiser les compteurs par jour
  for (const day of DAYS) {
    counts.byDay[day] = {
      total: eventsByDay[day].length,
      stands: eventsByDay[day].filter((e) => e.type === 'Stands').length,
      ateliers: eventsByDay[day].filter((e) => e.type === 'Ateliers').length,
      conferences: eventsByDay[day].filter((e) => e.type === 'Conférences').length,
    };
  }

  // Compter les événements uniques
  const uniqueEvents = new Set();
  const uniqueStands = new Set();
  const uniqueAteliers = new Set();
  const uniqueConferences = new Set();

  Object.values(eventsByDay)
    .flat()
    .forEach((event) => {
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
    console.log(
      `${day}: ${counts.byDay[day].total} événements (${counts.byDay[day].stands} stands, ${counts.byDay[day].ateliers} ateliers, ${counts.byDay[day].conferences} conférences)`
    );
  }

  return eventsByDay;
}

// Sauvegarder les événements dans un fichier JSON
async function saveEventsToJson(eventsByDay) {
  // Sauvegarder le fichier principal des événements par jour
  const outputPath = path.join(OUTPUT_DIR, 'events.json');

  await fs.promises.writeFile(outputPath, JSON.stringify(eventsByDay, null, 2), 'utf8');

  console.log(`📄 Fichier JSON principal généré : ${outputPath}`);

  // Sauvegarder également les événements par type pour référence
  const eventTypes = {
    stands: [],
    ateliers: [],
    conferences: [],
  };

  // Regrouper les événements par type
  Object.values(eventsByDay).forEach((events) => {
    events.forEach((event) => {
      if (event.type === 'Stands') {
        // Éviter les doublons pour les stands (qui peuvent apparaître plusieurs jours)
        if (!eventTypes.stands.some((s) => s.id === event.id)) {
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
    await fs.promises.writeFile(typePath, JSON.stringify(events, null, 2), 'utf8');
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
    path.join(OUTPUT_DIR, 'conferences.json'),
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

  console.log("🔍 Vérification des chemins d'images...");

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
    console.warn(
      `⚠️ Attention: ${missingCount} images sont manquantes dans le dossier public. Les chemins dans le JSON pourraient être incorrects.`
    );
  } else {
    console.log('✅ Toutes les images sont présentes dans le dossier public.');
  }

  // Afficher un rappel important
  console.log('\n🔔 RAPPEL IMPORTANT:');
  console.log("   Les chemins d'images dans le JSON sont définis comme:");
  console.log(`   ${getImagePath('example', 'example').replace('example/example.webp', '')}`);
  console.log('   Assurez-vous que ces chemins sont accessibles sur Netlify.');
  console.log('\n⚠️ NOTE POUR ASTRO:');
  console.log('   Si vous utilisez ces images dans des composants Astro, vous avez deux options:');
  console.log('   1. Utiliser la balise <img> standard avec le chemin exact du JSON:');
  console.log('      <img src="/images/events/stands/stand-123.webp" alt="..." />');
  console.log("   2. Utiliser le composant Image d'Astro avec une URL absolue:");
  console.log('      <Image src="/images/events/stands/stand-123.webp" width="400" height="400" alt="..." />');
  console.log("   Évitez d'importer ces images avec import car Astro les traiterait différemment.");
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
main().catch((error) => {
  console.error('❌ Erreur lors de la génération des données statiques:', error);
  process.exit(1);
});

// Exporter les fonctions pour les tests
export { downloadAndOptimizeImage, createPlaceholderImage, getImagePath, convertPdfToImageBuffer };
