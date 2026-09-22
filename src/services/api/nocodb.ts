import type { Event, FestivalDay as FestivalDayType } from '~/types/festival';
import { Api } from 'nocodb-sdk';
import { NOCODB_BASE_URL, NOCODB_CONFIG, getNocoDBToken } from '~/config/nocodb';
import fs from 'fs';
import path from 'path';

/** Jour lu depuis NocoDB : « À définir » quand la valeur est absente ou non reconnue. */
type NocoDBEventDay = FestivalDayType | 'À définir';

/** Événement converti depuis NocoDB : jour possiblement indéterminé, pas d'heure de fin. */
export type NocoDBEvent = Omit<Event, 'day' | 'endTime'> & {
  day: NocoDBEventDay;
  endTime?: string;
};

/** Message d'une erreur capturée (la valeur brute si ce n'est pas une Error). */
const errorMessage = (error: unknown): unknown => (error instanceof Error ? error.message : error);

// Configuration du cache
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes
const FORCE_REFRESH = false; // Mettre à true pour forcer le rafraîchissement du cache
const AUTO_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes en millisecondes
const MAX_CACHE_AGE = 60 * 60 * 1000; // 1 heure en millisecondes (durée maximale avant rafraîchissement forcé)
const LIGHT_CHECK_INTERVAL = 3 * 60 * 1000; // 3 minutes en millisecondes (intervalle pour les vérifications légères)

interface CacheData<T> {
  timestamp: number;
  data: T | null;
  count: number;
}

// Cache pour les différentes requêtes
const standsCache: CacheData<NocoDBResponse> = { timestamp: 0, data: null, count: 0 };
const ateliersCache: CacheData<NocoDBSessionsResponse> = { timestamp: 0, data: null, count: 0 };
const conferencesCache: CacheData<NocoDBSessionsResponse> = { timestamp: 0, data: null, count: 0 };
const sessionsCache: CacheData<NocoDBSessionsResponse> = { timestamp: 0, data: null, count: 0 };

// Variables pour suivre les mises à jour
let autoRefreshActive = false;
let lastFullRefresh = 0; // Timestamp du dernier rafraîchissement complet
let lastLightCheck = 0; // Timestamp de la dernière vérification légère
let updateDetected = false; // Indique si une mise à jour a été détectée

/**
 * Vérifie si les données en cache sont encore valides
 * @param cache Objet de cache à vérifier
 * @returns true si le cache est valide, false sinon
 */
function isCacheValid<T>(cache: CacheData<T>): boolean {
  if (FORCE_REFRESH || !cache.data) return false;

  const now = Date.now();
  const age = now - cache.timestamp;

  // Si le cache est trop vieux (plus de MAX_CACHE_AGE), on le considère comme invalide
  if (age > MAX_CACHE_AGE) {
    console.log(`🕒 Cache trop ancien (${Math.round(age / 1000 / 60)} minutes), rafraîchissement forcé`);
    return false;
  }

  // Sinon, on vérifie si le cache est encore valide selon la durée normale
  return age < CACHE_DURATION;
}

/**
 * Met à jour le cache avec de nouvelles données
 * @param cache Objet de cache à mettre à jour
 * @param data Données à stocker en cache
 * @param name Nom du cache pour les logs
 */
function updateCache<T>(cache: CacheData<T>, data: T, name: string): void {
  cache.timestamp = Date.now();
  cache.data = data;
  console.log(`🔄 Cache mis à jour pour "${name}" à ${new Date().toLocaleTimeString()}`);
}

/**
 * Vide tous les caches pour forcer un rafraîchissement des données
 */
export function clearAllCaches(): void {
  standsCache.timestamp = 0;
  standsCache.data = null;
  standsCache.count = 0;

  ateliersCache.timestamp = 0;
  ateliersCache.data = null;
  ateliersCache.count = 0;

  conferencesCache.timestamp = 0;
  conferencesCache.data = null;
  conferencesCache.count = 0;

  sessionsCache.timestamp = 0;
  sessionsCache.data = null;
  sessionsCache.count = 0;

  console.log(`🧹 Tous les caches ont été vidés`);
}

/**
 * Effectue une vérification légère pour détecter les nouvelles données
 * Cette fonction ne récupère que le nombre d'éléments pour chaque type de données
 * et compare avec les valeurs en cache pour détecter les mises à jour
 */
export async function checkForUpdates(): Promise<boolean> {
  const now = Date.now();

  // Limiter la fréquence des vérifications légères
  if (now - lastLightCheck < LIGHT_CHECK_INTERVAL) {
    console.log(
      `⏱️ Dernière vérification légère il y a ${Math.round((now - lastLightCheck) / 1000)} secondes, attente...`
    );
    return updateDetected;
  }

  lastLightCheck = now;
  console.log('🔍 Vérification légère des mises à jour...');

  try {
    const api = initNocoDBApi();
    let hasUpdates = false;

    // Vérifier les stands
    if (standsCache.data) {
      const standsCount = await getItemCount(api, NOCODB_CONFIG.tables.stands);
      if (standsCount !== standsCache.count) {
        console.log(`🔄 Mise à jour détectée pour les stands: ${standsCache.count} -> ${standsCount}`);
        standsCache.count = standsCount;
        hasUpdates = true;
      }
    }

    // Vérifier les ateliers
    if (ateliersCache.data) {
      const ateliersCount = await getItemCount(api, NOCODB_CONFIG.tables.ateliers);
      if (ateliersCount !== ateliersCache.count) {
        console.log(`🔄 Mise à jour détectée pour les ateliers: ${ateliersCache.count} -> ${ateliersCount}`);
        ateliersCache.count = ateliersCount;
        hasUpdates = true;
      }
    }

    // Vérifier les conférences
    if (conferencesCache.data) {
      const conferencesCount = await getItemCount(api, NOCODB_CONFIG.tables.conferences);
      if (conferencesCount !== conferencesCache.count) {
        console.log(`🔄 Mise à jour détectée pour les conférences: ${conferencesCache.count} -> ${conferencesCount}`);
        conferencesCache.count = conferencesCount;
        hasUpdates = true;
      }
    }

    // Si des mises à jour sont détectées, rafraîchir les données
    if (hasUpdates) {
      console.log('🔄 Mises à jour détectées, rafraîchissement des données...');
      updateDetected = true;

      // Rafraîchir les données avec un délai pour éviter de surcharger l'API
      setTimeout(() => {
        forceRefreshAllData().catch((error) => {
          console.error('❌ Erreur lors du rafraîchissement des données après détection de mises à jour:', error);
        });
      }, 1000);
    } else {
      console.log('✅ Aucune mise à jour détectée');
    }

    return hasUpdates;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des mises à jour:', error);
    return false;
  }
}

/**
 * Récupère le nombre d'éléments pour une table donnée
 * @param api Instance de l'API NocoDB
 * @param table Nom de la table
 * @returns Nombre d'éléments dans la table
 */
async function getItemCount(api: Api<unknown>, table: string): Promise<number> {
  try {
    // Utiliser une requête légère qui ne récupère qu'une seule ligne
    // mais qui renvoie le nombre total d'éléments
    const response = await api.dbTableRow.list('noco', NOCODB_CONFIG.projectId, table, {
      limit: 1,
      offset: 0,
    });

    return response.pageInfo?.totalRows || 0;
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération du nombre d'éléments pour ${table}:`, error);
    return 0;
  }
}

/**
 * Force le rafraîchissement de toutes les données
 * @returns Promise qui se résout lorsque toutes les données sont rafraîchies
 */
export async function forceRefreshAllData(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRefresh = now - lastFullRefresh;

  // Limiter la fréquence des rafraîchissements complets (pas plus d'une fois par minute)
  if (timeSinceLastRefresh < 60 * 1000) {
    console.log(`⏱️ Dernier rafraîchissement il y a ${Math.round(timeSinceLastRefresh / 1000)} secondes, attente...`);
    return;
  }

  console.log('🔄 Forçage du rafraîchissement de toutes les données...');
  lastFullRefresh = now;
  updateDetected = false; // Réinitialiser le drapeau de détection de mise à jour

  // Vider tous les caches
  clearAllCaches();

  try {
    // Récupérer toutes les données en parallèle
    const [stands, ateliers, conferences, sessions] = await Promise.all([
      fetchStands(),
      fetchAteliers(),
      fetchConferences(),
      fetchSessions(),
    ]);

    // Mettre à jour les compteurs
    standsCache.count = stands.list.length;
    ateliersCache.count = ateliers.list.length;
    conferencesCache.count = conferences.list.length;
    sessionsCache.count = sessions.list.length;

    console.log('✅ Toutes les données ont été rafraîchies avec succès');
  } catch (error) {
    console.error('❌ Erreur lors du rafraîchissement des données:', error);
    throw error;
  }
}

/**
 * Démarre le rafraîchissement automatique des données
 * @param interval Intervalle de rafraîchissement en millisecondes (par défaut: 15 minutes)
 */
export function startAutoRefresh(interval: number = AUTO_REFRESH_INTERVAL): void {
  if (autoRefreshActive) {
    console.log('⚠️ Le rafraîchissement automatique est déjà actif');
    return;
  }

  console.log(`🔄 Démarrage du rafraîchissement automatique toutes les ${interval / 60000} minutes`);

  // Rafraîchir immédiatement les données
  forceRefreshAllData().catch((error) => {
    console.error('❌ Erreur lors du rafraîchissement initial des données:', error);
  });

  // Configurer le rafraîchissement périodique complet
  setInterval(() => {
    console.log('⏰ Rafraîchissement automatique des données...');
    forceRefreshAllData().catch((error) => {
      console.error('❌ Erreur lors du rafraîchissement automatique des données:', error);
    });
  }, interval);

  // Configurer les vérifications légères plus fréquentes
  setInterval(() => {
    checkForUpdates().catch((error) => {
      console.error('❌ Erreur lors de la vérification légère des mises à jour:', error);
    });
  }, LIGHT_CHECK_INTERVAL);

  autoRefreshActive = true;
}

/**
 * Vérifie si les données sont déjà en cache
 * @returns true si toutes les données sont en cache, false sinon
 */
export function isDataCached(): boolean {
  return Boolean(standsCache.data && ateliersCache.data && conferencesCache.data && sessionsCache.data);
}

// Types pour les données NocoDB
export interface NocoDBStand {
  ID: number;
  Prénom: string;
  Nom: string;
  Email: string;
  GSM: string;
  'Site internet': string;
  'Choisissez un titre court': string;
  "À qui s'adresse le stand ?": string;
  "Niveau d'enseignement": string;
  "Type d'enseignement": string;
  'Décrivez brièvement votre stand pour les visiteurs': string;
  'Envoyez votre logo': Array<{
    id: string;
    url: string;
    title: string;
    mimetype: string;
    size: number;
    width: number;
    height: number;
    thumbnails: {
      tiny: { signedUrl: string };
      small: { signedUrl: string };
      card_cover: { signedUrl: string };
    };
    signedUrl: string;
  }>;
  Statut: string;
  'Thématique liée': { Id: number; Title: string } | null;
  Espaces: { Id: number; Title: string } | null;
  Jours: number; // 0 = Les trois jours, 1 = Mercredi, 2 = Jeudi, 3 = Vendredi
}

// Interface pour les ateliers
export interface NocoDBAtelier {
  ID: number;
  Prénom: string;
  Nom: string;
  Email: string;
  GSM: string;
  'Site internet': string;
  'Choisissez un titre court': string;
  "À qui s'adresse atelier ?": string;
  "Niveau d'enseignement": string;
  "Type d'enseignement": string;
  'Décrivez brièvement votre animation pour les visiteurs': string;
  'À propos de vous': string;
  'Envoyez votre logo': Array<{
    id: string;
    url: string;
    title: string;
    mimetype: string;
    size: number;
    width: number;
    height: number;
    thumbnails: {
      tiny: { signedUrl: string };
      small: { signedUrl: string };
      card_cover: { signedUrl: string };
    };
    signedUrl: string;
  }>;
  Jours: string;
  Heure: string;
  Statut: string;
  Espaces: string;
}

// Interface pour les conférences
export interface NocoDBConference {
  ID: number;
  Prénom: string;
  Nom: string;
  Email: string;
  GSM: string;
  'Site internet': string;
  'Choisissez un titre court'?: string;
  'Choisissez un titre pour la conférence'?: string;
  "À qui s'adresse la conférence ?"?: string;
  "À qui s'adresse conference ?"?: string;
  "Niveau d'enseignement": string;
  "Type d'enseignement": string;
  'Décrivez brièvement votre conférence pour les visiteurs': string;
  'À propos de vous': string;
  'Envoyez votre logo': Array<{
    id: string;
    url: string;
    title: string;
    mimetype: string;
    size: number;
    width: number;
    height: number;
    thumbnails: {
      tiny: { signedUrl: string };
      small: { signedUrl: string };
      card_cover: { signedUrl: string };
    };
    signedUrl: string;
  }>;
  'Envoyez une photo de vous': Array<{
    id: string;
    url: string;
    title: string;
    mimetype: string;
    size: number;
    width: number;
    height: number;
    thumbnails: {
      tiny: { signedUrl: string };
      small: { signedUrl: string };
      card_cover: { signedUrl: string };
    };
    signedUrl: string;
  }>;
  Jours: { Id: number; Title: string } | string;
  Heure: string | null;
  Statut: string;
  Espaces: { Id: number; Title: string } | string;
}

// Type union pour les sessions (ateliers et conférences)
export type NocoDBSession = NocoDBAtelier | NocoDBConference;

export interface NocoDBResponse {
  list: NocoDBStand[];
  pageInfo: {
    totalRows: number;
    page: number;
    pageSize: number;
    isFirstPage: boolean;
    isLastPage: boolean;
  };
  stats: {
    dbQueryTime: string;
  };
}

export interface NocoDBSessionsResponse {
  list: NocoDBSession[];
  pageInfo: {
    totalRows: number;
    page: number;
    pageSize: number;
    isFirstPage: boolean;
    isLastPage: boolean;
  };
  stats: {
    dbQueryTime: string;
  };
}

/**
 * Initialise l'API NocoDB avec le token d'authentification
 * @returns Instance de l'API NocoDB
 */
function initNocoDBApi() {
  const apiToken = getNocoDBToken();

  console.log("Initialisation de l'API NocoDB avec le token:", apiToken ? 'Token présent' : 'Token manquant');

  return new Api({
    baseURL: NOCODB_BASE_URL,
    headers: {
      'xc-token': apiToken,
    },
  });
}

/**
 * Sauvegarde les données brutes dans un fichier JSON pour débogage
 * @param data Les données à sauvegarder
 * @param filename Le nom du fichier
 */
function saveRawData(data: unknown, filename: string): void {
  try {
    // Créer le dossier logs s'il n'existe pas
    const logsDir = path.resolve(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Écrire les données dans un fichier JSON
    const filePath = path.join(logsDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Données sauvegardées dans ${filePath}`);
  } catch (error) {
    console.error(`❌ Erreur lors de la sauvegarde des données (${filename}):`, errorMessage(error));
  }
}

/**
 * Fonction générique pour récupérer toutes les lignes d'une table NocoDB avec pagination.
 * Gère la pagination et retourne la liste complète des éléments.
 * @param api Instance de l'API NocoDB initialisée.
 * @param tableId ID de la table NocoDB.
 * @param queryParamsBase Paramètres de requête de base (limit, where, etc.).
 * @param dataType Nom du type de données pour les logs (ex: 'stands').
 * @returns Promise résolue avec la liste complète des éléments.
 */
async function fetchAllNocoDBRows<T>(
  api: Api<unknown>,
  tableId: string,
  queryParamsBase: { offset?: number; limit?: number; where?: string },
  dataType: string
): Promise<T[]> {
  let allItems: T[] = [];
  let currentPage = 0;
  let isLastPage = false;
  let totalRows = 0; // Tentative de récupération du total
  const limit = queryParamsBase.limit || 50; // Utiliser la limite fournie ou 50 par défaut

  console.log(`🚀 Démarrage de la récupération de tous les ${dataType}...`);

  while (!isLastPage) {
    const queryParams = {
      ...queryParamsBase,
      offset: currentPage * limit,
      limit: limit,
      where: queryParamsBase.where || '', // S'assurer que 'where' est défini
    };

    console.log(`[${dataType}] Récupération page ${currentPage + 1} (offset: ${queryParams.offset}, limit: ${limit})`);

    try {
      const response = await api.dbTableRow.list('noco', NOCODB_CONFIG.projectId, tableId, queryParams);

      const currentItems = (response.list || []) as T[];
      allItems = [...allItems, ...currentItems];

      // Mettre à jour totalRows depuis la première page si disponible
      if (currentPage === 0 && response.pageInfo?.totalRows) {
        totalRows = response.pageInfo.totalRows;
        console.log(`[${dataType}] Nombre total d'éléments reporté par l'API: ${totalRows}`);
      }

      // Détermination de la dernière page
      const reportedLastPage = response.pageInfo?.isLastPage || false;
      const lessItemsThanLimit = currentItems.length < limit;
      const fetchedAllReportedItems = totalRows > 0 && allItems.length >= totalRows;

      isLastPage = reportedLastPage || lessItemsThanLimit || fetchedAllReportedItems;

      console.log(
        `[${dataType}] Page ${currentPage + 1} récupérée: ${currentItems.length} éléments. (Total Actuel: ${allItems.length} / ${totalRows || '?'}). isLastPage=${isLastPage}`
      );

      currentPage++;

      // Sécurité pour éviter les boucles infinies (ajuster si > 100 pages attendues)
      if (currentPage > 100) {
        console.warn(`⚠️ [${dataType}] Limite de 100 pages atteinte. Arrêt de la récupération par sécurité.`);
        break;
      }

      // Condition d'arrêt supplémentaire si l'API renvoie une page vide après la première
      if (currentItems.length === 0 && currentPage > 1) {
        console.log(`[${dataType}] Réponse vide reçue après la première page. Arrêt de la récupération.`);
        isLastPage = true; // Forcer l'arrêt
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération de la page ${currentPage + 1} pour ${dataType}:`, error);
      // En cas d'erreur sur une page, on arrête pour éviter les données partielles
      throw new Error(`Erreur API NocoDB pour ${dataType} page ${currentPage + 1}: ${errorMessage(error) || error}`);
    }
  }

  console.log(`✅ Récupération terminée pour ${dataType}: ${allItems.length} éléments trouvés.`);
  return allItems;
}

/**
 * Récupère les stands depuis l'API NocoDB avec pagination complète
 * @returns Réponse contenant la liste des stands
 */
export async function fetchStands(): Promise<NocoDBResponse> {
  // Vérifier si les données sont en cache et valides
  if (isCacheValid(standsCache)) {
    console.log('📦 Utilisation des données en cache pour les stands');
    return standsCache.data!;
  }

  try {
    const api = initNocoDBApi();
    const allStands = await fetchAllNocoDBRows<NocoDBStand>(
      api,
      NOCODB_CONFIG.tables.stands,
      NOCODB_CONFIG.defaultQueryParams.stands,
      'stands'
    );

    // Formatage de la réponse finale
    const formattedResponse: NocoDBResponse = {
      // Ensure type
      list: allStands,
      pageInfo: {
        totalRows: allStands.length,
        page: 1,
        pageSize: allStands.length,
        isFirstPage: true,
        isLastPage: true,
      },
      stats: {
        dbQueryTime: '0', // Placeholder, car non fourni par la boucle
      },
    };

    // Sauvegarder la réponse formatée (contenant la liste complète)
    saveRawData(formattedResponse, 'stands_response.json');

    // Mettre à jour le cache
    updateCache(standsCache, formattedResponse, 'stands');
    standsCache.count = allStands.length; // Mettre à jour le compteur

    return formattedResponse;
  } catch (error) {
    console.error('❌ Erreur finale lors de la récupération des stands:', errorMessage(error));
    // En cas d'erreur, retourner une liste vide ou lancer une exception
    // Ici, on lance pour que l'appelant puisse gérer l'erreur
    throw error;
  }
}

/**
 * Récupère les ateliers depuis l'API NocoDB avec pagination complète
 * @returns Réponse contenant la liste des ateliers
 */
export async function fetchAteliers(): Promise<NocoDBSessionsResponse> {
  // Vérifier si les données sont en cache et valides
  if (isCacheValid(ateliersCache)) {
    console.log('📦 Utilisation des données en cache pour les ateliers');
    return ateliersCache.data!;
  }

  try {
    const api = initNocoDBApi();
    // Ensure the generic type matches expected Session type (NocoDBAtelier)
    const allAteliers = await fetchAllNocoDBRows<NocoDBAtelier>(
      api,
      NOCODB_CONFIG.tables.ateliers,
      NOCODB_CONFIG.defaultQueryParams.ateliers,
      'ateliers'
    );

    // Formatage de la réponse finale
    const formattedResponse: NocoDBSessionsResponse = {
      // Cast might be needed if NocoDBSession is a union and T was specific
      list: allAteliers as NocoDBSession[],
      pageInfo: {
        totalRows: allAteliers.length,
        page: 1,
        pageSize: allAteliers.length,
        isFirstPage: true,
        isLastPage: true,
      },
      stats: {
        dbQueryTime: '0',
      },
    };

    // Sauvegarder la réponse complète
    saveRawData(formattedResponse, 'ateliers_response.json');

    // Mettre à jour le cache
    updateCache(ateliersCache, formattedResponse, 'ateliers');
    ateliersCache.count = allAteliers.length; // Mettre à jour le compteur

    return formattedResponse;
  } catch (error) {
    console.error('❌ Erreur finale lors de la récupération des ateliers:', errorMessage(error));
    throw error;
  }
}

/**
 * Récupère les conférences depuis l'API NocoDB avec pagination complète
 * @returns Réponse contenant la liste des conférences
 */
export async function fetchConferences(): Promise<NocoDBSessionsResponse> {
  // Vérifier si les données sont en cache et valides
  if (isCacheValid(conferencesCache)) {
    console.log('📦 Utilisation des données en cache pour les conférences');
    return conferencesCache.data!;
  }

  try {
    const api = initNocoDBApi();
    // Ensure the generic type matches expected Session type (NocoDBConference)
    const allConferences = await fetchAllNocoDBRows<NocoDBConference>(
      api,
      NOCODB_CONFIG.tables.conferences,
      NOCODB_CONFIG.defaultQueryParams.conferences,
      'conferences'
    );

    // Formatage de la réponse finale
    const formattedResponse: NocoDBSessionsResponse = {
      // Cast might be needed if NocoDBSession is a union and T was specific
      list: allConferences as NocoDBSession[],
      pageInfo: {
        totalRows: allConferences.length,
        page: 1,
        pageSize: allConferences.length,
        isFirstPage: true,
        isLastPage: true,
      },
      stats: {
        dbQueryTime: '0',
      },
    };

    // Sauvegarder la réponse complète
    saveRawData(formattedResponse, 'conferences_response.json');

    // Mettre à jour le cache
    updateCache(conferencesCache, formattedResponse, 'conferences');
    conferencesCache.count = allConferences.length; // Mettre à jour le compteur

    return formattedResponse;
  } catch (error) {
    console.error('❌ Erreur finale lors de la récupération des conférences:', errorMessage(error));
    throw error;
  }
}

/**
 * Récupère toutes les sessions (ateliers et conférences) depuis l'API NocoDB
 * @returns Réponse contenant la liste des sessions
 */
export async function fetchSessions(): Promise<NocoDBSessionsResponse> {
  // Vérifier si les données sont en cache et valides
  if (isCacheValid(sessionsCache)) {
    console.log('📦 Utilisation des données en cache pour les sessions');
    return sessionsCache.data!;
  }

  try {
    // Récupérer les ateliers et les conférences (utilisent maintenant la pagination)
    const ateliersResponse = await fetchAteliers();
    const conferencesResponse = await fetchConferences();

    // Combiner les résultats des listes
    const combinedList = [...ateliersResponse.list, ...conferencesResponse.list];

    console.log(
      `Sessions combinées: ${combinedList.length} sessions au total (${ateliersResponse.list.length} ateliers + ${conferencesResponse.list.length} conférences)`
    );

    // Formatage de la réponse pour correspondre à l'interface NocoDBSessionsResponse
    const formattedResponse: NocoDBSessionsResponse = {
      // Ensure type
      list: combinedList,
      pageInfo: {
        totalRows: combinedList.length,
        page: 1,
        pageSize: combinedList.length,
        isFirstPage: true,
        isLastPage: true,
      },
      stats: {
        dbQueryTime: '0',
      },
    };

    // Mettre à jour le cache global des sessions
    updateCache(sessionsCache, formattedResponse, 'sessions');
    sessionsCache.count = combinedList.length; // Mettre à jour le compteur global

    return formattedResponse;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération combinée des sessions:', errorMessage(error));
    throw error;
  }
}

/**
 * Détermine le jour de l'événement à partir de la valeur fournie
 * @param jourValue La valeur du jour à traiter
 * @returns Le jour formaté comme FestivalDayType (alias de ~/types/festival.FestivalDay)
 */
function getEventDay(jourValue: unknown): NocoDBEventDay {
  // Gérer les valeurs nulles ou undefined
  if (jourValue === null || jourValue === undefined) {
    return 'À définir';
  }

  // Si c'est un objet avec un champ Title
  if (typeof jourValue === 'object' && jourValue !== null && 'Title' in jourValue) {
    const title = (jourValue as { Title: string }).Title;

    // Normaliser le titre pour extraire le jour
    const titleLower = title.toLowerCase();
    if (titleLower.includes('mercredi')) return 'Mercredi';
    if (titleLower.includes('jeudi')) return 'Jeudi';
    if (titleLower.includes('vendredi')) return 'Vendredi';

    return 'À définir';
  }

  // Si c'est une chaîne de caractères
  if (typeof jourValue === 'string') {
    const jourLower = jourValue.toLowerCase();
    if (jourLower.includes('mercredi')) return 'Mercredi';
    if (jourLower.includes('jeudi')) return 'Jeudi';
    if (jourLower.includes('vendredi')) return 'Vendredi';

    return 'À définir';
  }

  // Si c'est un nombre (0 = Les trois jours, 1 = Mercredi, 2 = Jeudi, 3 = Vendredi)
  // Mapping NocoDB (ajusté selon la spec): 1=Mer, 2=Jeu, 3=Ven
  if (typeof jourValue === 'number') {
    if (jourValue === 1) return 'Mercredi';
    if (jourValue === 2) return 'Jeudi';
    if (jourValue === 3) return 'Vendredi';
    // Cas 0 pour 'Les trois jours' - affecté à Mercredi par défaut dans la conversion stand
    // Ou considérer comme 'À définir' ici ? Optons pour À définir
    return 'À définir';
  }

  console.warn(`[getEventDay] Valeur de jour non reconnue: ${JSON.stringify(jourValue)}, retournant 'À définir'.`);
  return 'À définir';
}

// Fonction pour convertir les stands en événements (présents tous les jours)
export function convertStandsToEvents(stands: NocoDBStand[]): NocoDBEvent[] {
  console.log(`[DEBUG NOCODB] Conversion de ${stands.length} stands en événements`);
  const defaultImage = '/images/default-stand.jpg';

  // Tableau pour stocker tous les événements
  const allEvents: NocoDBEvent[] = [];

  // Pour chaque stand, créer trois événements (un pour chaque jour)
  stands.forEach((stand) => {
    // Jours du festival - Utiliser le type FestivalDayType
    const festivalDays: FestivalDayType[] = ['Mercredi', 'Jeudi', 'Vendredi'];

    // Récupérer l'URL de l'image ou utiliser l'image par défaut
    const imageUrl = stand['Envoyez votre logo']?.length > 0 ? stand['Envoyez votre logo'][0].signedUrl : defaultImage;

    // Générer un titre plus descriptif si le titre est manquant
    let title = stand['Choisissez un titre court'];
    if (!title || title.trim() === '') {
      if (stand.Prénom && stand.Nom) {
        title = `Stand de ${stand.Prénom} ${stand.Nom}`;
      } else if (stand['Décrivez brièvement votre stand pour les visiteurs']) {
        const description = stand['Décrivez brièvement votre stand pour les visiteurs'];
        const words = description.split(' ').slice(0, 5);
        title = words.join(' ') + (words.length === 5 ? '...' : '');
      } else {
        title = `Stand #${stand.ID}`;
      }
      console.log(`⚠️ Titre manquant pour le stand #${stand.ID}, titre généré: "${title}"`);
    }

    // Extract tags
    const tags = [
      stand["À qui s'adresse le stand ?"],
      stand["Niveau d'enseignement"],
      stand["Type d'enseignement"],
      stand['Thématique liée']?.Title,
    ].filter(Boolean) as string[]; // Filter out null/undefined and assert as string[]

    // Créer un événement pour chaque jour
    festivalDays.forEach((day) => {
      allEvents.push({
        id: `stand-${stand.ID}-${day}`, // Ensure unique ID per day instance
        title: title,
        description: stand['Décrivez brièvement votre stand pour les visiteurs'] || 'Description à venir',
        day, // FestivalDayType from the loop
        time: 'Toute la journée',
        location: stand.Espaces?.Title || 'Emplacement à définir',
        speaker: stand.Prénom && stand.Nom ? `${stand.Prénom} ${stand.Nom}` : 'Exposant à définir',
        organization: '', // Add missing property
        type: 'Stands' as const,
        image: imageUrl,
        speakerImage: null, // Add missing property
        url: stand['Site internet'] || '',
        target: stand["À qui s'adresse le stand ?"] || 'Public à définir',
        level: stand["Niveau d'enseignement"] || 'Niveau à définir',
        teachingType: stand["Type d'enseignement"] || 'Type à définir',
        tags: tags, // Add missing property
      });
    });
  });

  // Analyser la distribution des jours pour les stands
  const standsByDay: Record<string, number> = {}; // Use string for keys
  allEvents.forEach((event) => {
    const dayKey = event.day as string; // Cast to string for key access
    if (!standsByDay[dayKey]) standsByDay[dayKey] = 0;
    standsByDay[dayKey]++;
  });
  console.log('📊 Distribution des stands par jour:', standsByDay);

  return allEvents;
}

// Fonction pour convertir les ateliers en événements
export function convertAteliersToEvents(ateliers: NocoDBAtelier[]): NocoDBEvent[] {
  const defaultImage = '/images/default-workshop.jpg';

  const events = ateliers.map((atelier) => {
    // Déterminer le jour
    const day = getEventDay(atelier.Jours); // Returns FestivalDayType

    // Récupérer l'URL de l'image ou utiliser l'image par défaut
    const imageUrl =
      atelier['Envoyez votre logo']?.length > 0 ? atelier['Envoyez votre logo'][0].signedUrl : defaultImage;

    // Générer un titre plus descriptif si le titre est manquant
    let title = atelier['Choisissez un titre court'];
    if (!title || title.trim() === '') {
      if (atelier.Prénom && atelier.Nom) {
        title = `Atelier de ${atelier.Prénom} ${atelier.Nom}`;
      } else if (atelier['Décrivez brièvement votre animation pour les visiteurs']) {
        const description = atelier['Décrivez brièvement votre animation pour les visiteurs'];
        const words = description.split(' ').slice(0, 5);
        title = words.join(' ') + (words.length === 5 ? '...' : '');
      } else {
        title = `Atelier #${atelier.ID}`;
      }
      console.log(`⚠️ Titre manquant pour l'atelier #${atelier.ID}, titre généré: "${title}"`);
    }

    // Extract tags
    const tags = [
      atelier["À qui s'adresse atelier ?"],
      atelier["Niveau d'enseignement"],
      atelier["Type d'enseignement"],
    ].filter(Boolean) as string[];

    return {
      id: `atelier-${atelier.ID}`,
      title: title,
      description: atelier['Décrivez brièvement votre animation pour les visiteurs'] || 'Description à venir',
      day, // FestivalDayType
      time: atelier.Heure || 'Horaire à définir',
      location: atelier.Espaces || 'Emplacement à définir',
      speaker: atelier.Prénom && atelier.Nom ? `${atelier.Prénom} ${atelier.Nom}` : 'Intervenant à définir',
      organization: '', // Add missing property
      type: 'Ateliers' as const,
      image: imageUrl,
      speakerImage: null, // Add missing property
      url: atelier['Site internet'] || '',
      target: atelier["À qui s'adresse atelier ?"] || 'Public à définir',
      level: atelier["Niveau d'enseignement"] || 'Niveau à définir',
      teachingType: atelier["Type d'enseignement"] || 'Type à définir',
      tags: tags, // Add missing property
    };
  });

  // Analyser la distribution des jours pour les ateliers
  const ateliersByDay: Record<string, number> = {}; // Use string for keys
  events.forEach((event) => {
    const dayKey = event.day as string; // Cast to string for key access
    if (!ateliersByDay[dayKey]) ateliersByDay[dayKey] = 0;
    ateliersByDay[dayKey]++;
  });
  console.log('📊 Distribution des ateliers par jour:', ateliersByDay);

  return events;
}

// Fonction pour convertir les conférences en événements
export function convertConferencesToEvents(conferences: NocoDBConference[]): NocoDBEvent[] {
  const defaultImage = '/images/default-conference.jpg';
  const defaultSpeakerImage = '/images/default-speaker.jpg';

  console.log(`🔄 Conversion de ${conferences.length} conférences en événements...`);

  const events = conferences
    .map((conference, index) => {
      try {
        // Déterminer le jour
        const day = getEventDay(conference.Jours); // Returns FestivalDayType

        // Image URL extraction
        const imageUrl =
          conference['Envoyez votre logo']?.length > 0 ? conference['Envoyez votre logo'][0].signedUrl : defaultImage;

        // Speaker image extraction
        const speakerImageUrl =
          conference['Envoyez une photo de vous']?.length > 0
            ? conference['Envoyez une photo de vous'][0].signedUrl
            : defaultSpeakerImage;

        // Générer un titre plus descriptif si le titre est manquant
        let title = conference['Choisissez un titre pour la conférence'] || conference['Choisissez un titre court'];
        if (!title || title.trim() === '') {
          if (conference.Prénom && conference.Nom) {
            title = `Conférence de ${conference.Prénom} ${conference.Nom}`;
          } else if (conference['Décrivez brièvement votre conférence pour les visiteurs']) {
            const description = conference['Décrivez brièvement votre conférence pour les visiteurs'];
            const words = description.split(' ').slice(0, 5);
            title = words.join(' ') + (words.length === 5 ? '...' : '');
          } else {
            title = `Conférence #${conference.ID}`;
          }
          console.log(`⚠️ Titre manquant pour la conférence #${conference.ID}, titre généré: "${title}"`);
        }

        // Extract target audience robustly
        const targetAudience =
          conference["À qui s'adresse la conférence ?"] ||
          conference["À qui s'adresse conference ?"] ||
          'Public à définir';

        // Extract tags
        const tags = [targetAudience, conference["Niveau d'enseignement"], conference["Type d'enseignement"]].filter(
          Boolean
        ) as string[];

        return {
          id: `conference-${conference.ID}`,
          title: title,
          description: conference['Décrivez brièvement votre conférence pour les visiteurs'] || 'Description à venir',
          day, // FestivalDayType
          time: conference.Heure || 'Horaire à définir',
          location:
            typeof conference.Espaces === 'object' && conference.Espaces !== null
              ? conference.Espaces.Title
              : conference.Espaces || 'Emplacement à définir',
          speaker:
            conference.Prénom && conference.Nom ? `${conference.Prénom} ${conference.Nom}` : 'Intervenant à définir',
          organization: '', // Add missing property
          type: 'Conférences' as const,
          image: imageUrl,
          speakerImage: speakerImageUrl, // Correctly assigned
          url: conference['Site internet'] || '',
          target: targetAudience,
          level: conference["Niveau d'enseignement"] || 'Niveau à définir',
          teachingType: conference["Type d'enseignement"] || 'Type à définir',
          tags: tags, // Add missing property
        };
      } catch (error) {
        console.error(
          `❌ Erreur lors de la conversion de la conférence #${index + 1} (ID: ${conference.ID}):`,
          errorMessage(error)
        );
        return null; // Return null for failed conversions
      }
    })
    .filter((event): event is NonNullable<typeof event> => event !== null); // Filter out nulls

  // Analyser la distribution des jours pour les conférences
  const conferencesByDay: Record<string, number> = {}; // Use string for keys
  events.forEach((event) => {
    const dayKey = event.day as string; // Cast to string for key access
    if (!conferencesByDay[dayKey]) conferencesByDay[dayKey] = 0;
    conferencesByDay[dayKey]++;
  });
  console.log('📊 Distribution des conférences par jour:', conferencesByDay);

  return events;
}

// Fonction pour convertir les sessions (ateliers et conférences) en événements
export function convertSessionsToEvents(sessions: NocoDBSession[]): NocoDBEvent[] {
  // Fonction pour déterminer si une session est un atelier
  const isAtelier = (session: NocoDBSession): session is NocoDBAtelier => {
    return (
      // Champs spécifiques aux ateliers
      "À qui s'adresse atelier ?" in session &&
      // Champ de description spécifique aux ateliers
      'Décrivez brièvement votre animation pour les visiteurs' in session
    );
  };

  // Fonction pour déterminer si une session est une conférence
  const isConference = (session: NocoDBSession): session is NocoDBConference => {
    return (
      // Champs spécifiques aux conférences
      ("À qui s'adresse la conférence ?" in session || "À qui s'adresse conference ?" in session) &&
      // Champ de description spécifique aux conférences
      'Décrivez brièvement votre conférence pour les visiteurs' in session
    );
  };

  // Séparer les sessions en ateliers et conférences
  const ateliers = sessions.filter(isAtelier);
  const conferences = sessions.filter(isConference);

  console.log(`🏷️ Sessions détectées:`);
  console.log(`   - Ateliers: ${ateliers.length}`);
  console.log(`   - Conférences: ${conferences.length}`);

  // Afficher des détails sur les sessions non classées
  const unclassifiedSessions = sessions.filter((session) => !isAtelier(session) && !isConference(session));

  if (unclassifiedSessions.length > 0) {
    console.warn('⚠️ Sessions non classées:');
    unclassifiedSessions.forEach((session, index) => {
      console.warn(`   Session #${index + 1} - Champs disponibles:`, Object.keys(session));
      console.warn(`   Détails de la session:`, JSON.stringify(session, null, 2));
    });
  }

  // Convertir les ateliers
  const atelierEvents = convertAteliersToEvents(ateliers);

  // Convertir les conférences
  const conferenceEvents = convertConferencesToEvents(conferences);

  // Combiner les événements
  const allEvents = [...atelierEvents, ...conferenceEvents];

  // Analyser la répartition des événements par jour
  const eventsByDay = organizeEventsByDay(allEvents);
  console.log('📊 Répartition des événements par jour après conversion:');
  Object.entries(eventsByDay).forEach(([day, events]) => {
    console.log(`   - ${day}: ${events.length} événements`);
  });

  // Vérifier spécifiquement les événements du vendredi
  console.log('🔍 Vérification des événements du vendredi:');
  const vendrediEvents = eventsByDay['Vendredi'] || [];
  if (vendrediEvents.length === 0) {
    console.warn('⚠️ Aucun événement trouvé pour vendredi!');
  } else {
    console.log(`   Nombre d'événements du vendredi: ${vendrediEvents.length}`);
    vendrediEvents.forEach((event, index) => {
      console.log(`   Événement #${index + 1}: ${event.title} (${event.type})`);
    });
  }

  console.log(`✨ Total d'événements convertis: ${allEvents.length}`);

  return allEvents;
}

// Fonction pour organiser les événements par jour
export function organizeEventsByDay<T extends NocoDBEvent>(events: T[]): Record<string, T[]> {
  const result: Record<string, T[]> = {};

  events.forEach((event) => {
    const day = event.day;
    if (!result[day]) {
      result[day] = [];
    }
    result[day].push(event);
  });

  return result;
}

// Ajout d'une fonction pour analyser la répartition des événements par jour
export function logEventDistribution(events: NocoDBEvent[]): void {
  const eventsByDay = organizeEventsByDay(events);
  console.log('📊 Répartition des événements par jour:');
  Object.entries(eventsByDay).forEach(([day, dayEvents]) => {
    console.log(`   - ${day}: ${dayEvents.length} événements`);
  });
}
