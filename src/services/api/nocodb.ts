import type { Event } from '~/types/festival';
import { Api } from 'nocodb-sdk';
import { NOCODB_BASE_URL, NOCODB_CONFIG, getNocoDBToken } from '~/config/nocodb';
import { FestivalDay } from '~/services/events';
import fs from 'fs';
import path from 'path';

// Types pour les données NocoDB
export interface NocoDBStand {
  ID: number;
  Prénom: string;
  Nom: string;
  Email: string;
  GSM: string;
  "Site internet": string;
  "Choisissez un titre court": string;
  "À qui s'adresse le stand ?": string;
  "Niveau d'enseignement": string;
  "Type d'enseignement": string;
  "Décrivez brièvement votre stand pour les visiteurs": string;
  "Envoyez votre logo": Array<{
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
  "Thématique liée": { Id: number; Title: string } | null;
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
  "Site internet": string;
  "Choisissez un titre court": string;
  "À qui s'adresse atelier ?": string;
  "Niveau d'enseignement": string;
  "Type d'enseignement": string;
  "Décrivez brièvement votre animation pour les visiteurs": string;
  "À propos de vous": string;
  "Envoyez votre logo": Array<{
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
  "Site internet": string;
  "Choisissez un titre court"?: string;
  "Choisissez un titre pour la conférence"?: string;
  "À qui s'adresse la conférence ?"?: string;
  "À qui s'adresse conference ?"?: string;
  "Niveau d'enseignement": string;
  "Type d'enseignement": string;
  "Décrivez brièvement votre conférence pour les visiteurs": string;
  "À propos de vous": string;
  "Envoyez votre logo": Array<{
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
  "Envoyez une photo de vous": Array<{
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
  
  console.log('Initialisation de l\'API NocoDB avec le token:', apiToken ? 'Token présent' : 'Token manquant');
  
  return new Api({
    baseURL: NOCODB_BASE_URL,
    headers: {
      "xc-token": apiToken
    }
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
    console.error(`❌ Erreur lors de la sauvegarde des données:`, error);
  }
}

// Fonction pour récupérer les stands depuis l'API NocoDB
export async function fetchStands(): Promise<NocoDBResponse> {
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
    return {
      list: response.list as NocoDBStand[],
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
  } catch (error) {
    console.error('Erreur lors de la récupération des stands:', error);
    return { 
      list: [], 
      pageInfo: { 
        totalRows: 0, 
        page: 1, 
        pageSize: 25, 
        isFirstPage: true, 
        isLastPage: true 
      }, 
      stats: { 
        dbQueryTime: "0" 
      } 
    };
  }
}

// Fonction pour récupérer les ateliers depuis l'API NocoDB
export async function fetchAteliers(): Promise<NocoDBSessionsResponse> {
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
    
    // Formatage de la réponse
    return {
      list: response.list as NocoDBAtelier[],
      pageInfo: {
        totalRows: response.pageInfo?.totalRows || 0,
        page: response.pageInfo?.page || 1,
        pageSize: response.pageInfo?.pageSize || 50,
        isFirstPage: response.pageInfo?.isFirstPage || true,
        isLastPage: response.pageInfo?.isLastPage || true
      },
      stats: { 
        dbQueryTime: "0"
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des ateliers:', error);
    return { 
      list: [], 
      pageInfo: { 
        totalRows: 0, 
        page: 1, 
        pageSize: 50, 
        isFirstPage: true, 
        isLastPage: true 
      }, 
      stats: { 
        dbQueryTime: "0" 
      } 
    };
  }
}

// Fonction pour récupérer les conférences depuis l'API NocoDB
export async function fetchConferences(): Promise<NocoDBSessionsResponse> {
  try {
    console.log('🔍 Début de la récupération des conférences');
    console.log('📋 Configuration NocoDB utilisée:');
    console.log(`   - URL de base: ${NOCODB_BASE_URL}`);
    console.log(`   - ID du projet: ${NOCODB_CONFIG.projectId}`);
    console.log(`   - Table des conférences: ${NOCODB_CONFIG.tables.conferences}`);
    console.log(`   - Paramètres de requête: ${JSON.stringify(NOCODB_CONFIG.defaultQueryParams.conferences, null, 2)}`);

    const api = initNocoDBApi();
    console.log('✅ API NocoDB initialisée avec succès');
    
    console.log('🚀 Appel à l\'API pour récupérer les conférences...');
    const response = await api.dbTableRow.list(
      "noco",
      NOCODB_CONFIG.projectId,
      NOCODB_CONFIG.tables.conferences,
      NOCODB_CONFIG.defaultQueryParams.conferences
    );
    
    console.log(`📊 Résultat de la récupération:`);
    console.log(`   - Nombre total de conférences: ${response.list.length}`);
    console.log(`   - Informations de pagination:`, JSON.stringify(response.pageInfo, null, 2));

    if (response.list.length > 0) {
      console.log('🔬 Détails de la première conférence:');
      const firstConference = response.list[0] as unknown as NocoDBConference;
      Object.entries(firstConference).forEach(([key, value]) => {
        console.log(`   - ${key}: ${JSON.stringify(value)}`);
      });
    } else {
      console.warn('⚠️ Aucune conférence trouvée dans la réponse');
    }
    
    // Sauvegarder la réponse complète
    saveRawData(response, 'conferences_response.json');
    
    // Formatage de la réponse
    return {
      list: response.list as NocoDBConference[],
      pageInfo: {
        totalRows: response.pageInfo?.totalRows || 0,
        page: response.pageInfo?.page || 1,
        pageSize: response.pageInfo?.pageSize || 50,
        isFirstPage: response.pageInfo?.isFirstPage || true,
        isLastPage: response.pageInfo?.isLastPage || true
      },
      stats: { 
        dbQueryTime: "0"
      }
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des conférences:');
    console.error('   - Type d\'erreur:', error instanceof Error ? error.name : 'Unknown error type');
    console.error('   - Message:', error instanceof Error ? error.message : error);
    
    if (error instanceof Error && error.stack) {
      console.error('   - Trace de la pile:');
      console.error(error.stack.split('\n').slice(0, 5).join('\n')); // Limiter à 5 premières lignes de la trace
    }

    return { 
      list: [], 
      pageInfo: { 
        totalRows: 0, 
        page: 1, 
        pageSize: 50, 
        isFirstPage: true, 
        isLastPage: true 
      }, 
      stats: { 
        dbQueryTime: "0" 
      } 
    };
  }
}

// Fonction pour récupérer toutes les sessions (ateliers et conférences)
export async function fetchSessions(): Promise<NocoDBSessionsResponse> {
  try {
    // Récupérer les ateliers et les conférences en parallèle
    const [ateliersResponse, conferencesResponse] = await Promise.all([
      fetchAteliers(),
      fetchConferences()
    ]);
    
    // Combiner les résultats
    const combinedList = [...ateliersResponse.list, ...conferencesResponse.list];
    
    return {
      list: combinedList,
      pageInfo: {
        totalRows: combinedList.length,
        page: 1,
        pageSize: combinedList.length,
        isFirstPage: true,
        isLastPage: true
      },
      stats: { 
        dbQueryTime: "0"
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    return { 
      list: [], 
      pageInfo: { 
        totalRows: 0, 
        page: 1, 
        pageSize: 50, 
        isFirstPage: true, 
        isLastPage: true 
      }, 
      stats: { 
        dbQueryTime: "0" 
      } 
    };
  }
}

/**
 * Détermine le jour de l'événement à partir de la valeur fournie
 * @param jourValue La valeur du jour à traiter
 * @returns Le jour formaté comme FestivalDay
 */
function getEventDay(jourValue: unknown): FestivalDay {
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
  if (typeof jourValue === 'number') {
    if (jourValue === 1) return 'Mercredi';
    if (jourValue === 2) return 'Jeudi';
    if (jourValue === 3) return 'Vendredi';
    
    return 'À définir';
  }
  
  return 'À définir';
}

// Fonction pour convertir les stands en événements (présents tous les jours)
export function convertStandsToEvents(stands: NocoDBStand[]): Event[] {
  console.log(`[DEBUG NOCODB] Conversion de ${stands.length} stands en événements`);
  const defaultImage = '/images/default-stand.jpg';
  
  // Tableau pour stocker tous les événements
  const allEvents: Event[] = [];
  
  // Pour chaque stand, créer trois événements (un pour chaque jour)
  stands.forEach(stand => {
    // Jours du festival
    const festivalDays: FestivalDay[] = ['Mercredi', 'Jeudi', 'Vendredi'];
    
    // Récupérer l'URL de l'image ou utiliser l'image par défaut
    const imageUrl = stand["Envoyez votre logo"]?.length > 0 
      ? stand["Envoyez votre logo"][0].signedUrl 
      : defaultImage;
    
    // Générer un titre plus descriptif si le titre est manquant
    let title = stand["Choisissez un titre court"];
    if (!title || title.trim() === "") {
      // Si le prénom et le nom sont disponibles, utiliser "Stand de [Prénom Nom]"
      if (stand.Prénom && stand.Nom) {
        title = `Stand de ${stand.Prénom} ${stand.Nom}`;
      } 
      // Sinon, si nous avons une description, utiliser les premiers mots
      else if (stand["Décrivez brièvement votre stand pour les visiteurs"]) {
        const description = stand["Décrivez brièvement votre stand pour les visiteurs"];
        // Prendre les 5 premiers mots de la description ou moins si la description est courte
        const words = description.split(' ').slice(0, 5);
        title = words.join(' ') + (words.length === 5 ? '...' : '');
      } 
      // En dernier recours, utiliser un titre générique avec l'ID
      else {
        title = `Stand #${stand.ID}`;
      }
      
      console.log(`⚠️ Titre manquant pour le stand #${stand.ID}, titre généré: "${title}"`);
    }
    
    // Créer un événement pour chaque jour
    festivalDays.forEach(day => {
      allEvents.push({
        id: `stand-${stand.ID}-${day}`,
        title: title,
        description: stand["Décrivez brièvement votre stand pour les visiteurs"] || "Description à venir",
        day,
        time: "Toute la journée",
        location: stand.Espaces?.Title || "Emplacement à définir",
        speaker: stand.Prénom && stand.Nom ? `${stand.Prénom} ${stand.Nom}` : "Exposant à définir",
        type: "Stands" as const,
        image: imageUrl,
        url: stand["Site internet"] || "",
        target: stand["À qui s'adresse le stand ?"] || "Public à définir",
        level: stand["Niveau d'enseignement"] || "Niveau à définir",
        teachingType: stand["Type d'enseignement"] || "Type à définir"
      });
    });
  });
  
  // Analyser la distribution des jours pour les stands
  const standsByDay: Record<FestivalDay, number> = {} as Record<FestivalDay, number>;
  allEvents.forEach(event => {
    if (!standsByDay[event.day]) standsByDay[event.day] = 0;
    standsByDay[event.day]++;
  });
  console.log('📊 Distribution des stands par jour:', standsByDay);
  
  return allEvents;
}

// Fonction pour convertir les ateliers en événements
export function convertAteliersToEvents(ateliers: NocoDBAtelier[]): Event[] {
  const defaultImage = '/images/default-workshop.jpg';
  
  const events = ateliers.map(atelier => {
    // Déterminer le jour
    const day = getEventDay(atelier.Jours);
    
    // Log spécifique pour les événements du vendredi
    if (day === 'Vendredi') {
      console.log(`[DEBUG VENDREDI] Atelier du vendredi trouvé: "${atelier["Choisissez un titre court"] || 'Sans titre'}" - Jours=${JSON.stringify(atelier.Jours)}`);
    }
    
    // Récupérer l'URL de l'image ou utiliser l'image par défaut
    const imageUrl = atelier["Envoyez votre logo"]?.length > 0 
      ? atelier["Envoyez votre logo"][0].signedUrl 
      : defaultImage;
    
    // Générer un titre plus descriptif si le titre est manquant
    let title = atelier["Choisissez un titre court"];
    if (!title || title.trim() === "") {
      // Si le prénom et le nom sont disponibles, utiliser "Atelier de [Prénom Nom]"
      if (atelier.Prénom && atelier.Nom) {
        title = `Atelier de ${atelier.Prénom} ${atelier.Nom}`;
      } 
      // Sinon, si nous avons une description, utiliser les premiers mots
      else if (atelier["Décrivez brièvement votre animation pour les visiteurs"]) {
        const description = atelier["Décrivez brièvement votre animation pour les visiteurs"];
        // Prendre les 5 premiers mots de la description ou moins si la description est courte
        const words = description.split(' ').slice(0, 5);
        title = words.join(' ') + (words.length === 5 ? '...' : '');
      } 
      // En dernier recours, utiliser un titre générique avec l'ID
      else {
        title = `Atelier #${atelier.ID}`;
      }
      
      console.log(`⚠️ Titre manquant pour l'atelier #${atelier.ID}, titre généré: "${title}"`);
    }
    
    return {
      id: `atelier-${atelier.ID}`,
      title: title,
      description: atelier["Décrivez brièvement votre animation pour les visiteurs"] || "Description à venir",
      day,
      time: atelier.Heure || "Horaire à définir",
      location: atelier.Espaces || "Emplacement à définir",
      speaker: atelier.Prénom && atelier.Nom ? `${atelier.Prénom} ${atelier.Nom}` : "Intervenant à définir",
      type: "Ateliers" as const,
      image: imageUrl,
      url: atelier["Site internet"] || "",
      target: atelier["À qui s'adresse atelier ?"] || "Public à définir",
      level: atelier["Niveau d'enseignement"] || "Niveau à définir",
      teachingType: atelier["Type d'enseignement"] || "Type à définir"
    };
  });
  
  // Analyser la distribution des jours pour les ateliers
  const ateliersByDay: Record<FestivalDay, number> = {} as Record<FestivalDay, number>;
  events.forEach(event => {
    if (!ateliersByDay[event.day]) ateliersByDay[event.day] = 0;
    ateliersByDay[event.day]++;
  });
  console.log('📊 Distribution des ateliers par jour:', ateliersByDay);
  
  return events;
}

// Fonction pour convertir les conférences en événements
export function convertConferencesToEvents(conferences: NocoDBConference[]): Event[] {
  const defaultImage = '/images/default-conference.jpg';
  const defaultSpeakerImage = '/images/default-speaker.jpg';
  
  console.log('🔄 Conversion des conférences en événements...');
  
  const events = conferences.map((conference, index) => {
    try {
      // Déterminer le jour
      const day = getEventDay(conference.Jours);
      
      // Log spécifique pour les événements du vendredi
      if (day === 'Vendredi') {
        console.log(`[DEBUG VENDREDI] Conférence du vendredi trouvée: "${conference["Choisissez un titre pour la conférence"] || 'Sans titre'}" - Jours=${JSON.stringify(conference.Jours)}`);
      }
      
      // Image URL extraction
      const imageUrl = conference["Envoyez votre logo"]?.length > 0 
        ? conference["Envoyez votre logo"][0].signedUrl 
        : defaultImage;

      // Speaker image extraction
      const speakerImageUrl = conference["Envoyez une photo de vous"]?.length > 0 
        ? conference["Envoyez une photo de vous"][0].signedUrl 
        : defaultSpeakerImage;

      // Générer un titre plus descriptif si le titre est manquant
      let title = conference["Choisissez un titre pour la conférence"];
      if (!title || title.trim() === "") {
        // Si le prénom et le nom sont disponibles, utiliser "Conférence de [Prénom Nom]"
        if (conference.Prénom && conference.Nom) {
          title = `Conférence de ${conference.Prénom} ${conference.Nom}`;
        } 
        // Sinon, si nous avons une description, utiliser les premiers mots
        else if (conference["Décrivez brièvement votre conférence pour les visiteurs"]) {
          const description = conference["Décrivez brièvement votre conférence pour les visiteurs"];
          // Prendre les 5 premiers mots de la description ou moins si la description est courte
          const words = description.split(' ').slice(0, 5);
          title = words.join(' ') + (words.length === 5 ? '...' : '');
        } 
        // En dernier recours, utiliser un titre générique avec l'ID
        else {
          title = `Conférence #${conference.ID}`;
        }
        
        console.log(`⚠️ Titre manquant pour la conférence #${conference.ID}, titre généré: "${title}"`);
      }

      return {
        id: `conference-${conference.ID}`,
        title: title,
        description: conference["Décrivez brièvement votre conférence pour les visiteurs"] || "Description à venir",
        day,
        time: conference.Heure || "Horaire à définir",
        location: typeof conference.Espaces === 'object' ? conference.Espaces?.Title : conference.Espaces || "Emplacement à définir",
        speaker: conference.Prénom && conference.Nom ? `${conference.Prénom} ${conference.Nom}` : "Intervenant à définir",
        type: "Conférences" as const,
        image: imageUrl,
        speakerImage: speakerImageUrl,
        url: conference["Site internet"] || "",
        target: conference["À qui s'adresse la conférence ?"] || "Public à définir",
        level: conference["Niveau d'enseignement"] || "Niveau à définir",
        teachingType: conference["Type d'enseignement"] || "Type à définir"
      };
    } catch (error) {
      console.error(`❌ Erreur lors de la conversion de la conférence #${index + 1}:`, error);
      return null;
    }
  }).filter(event => event !== null);
  
  // Analyser la distribution des jours pour les conférences
  const conferencesByDay: Record<FestivalDay, number> = {} as Record<FestivalDay, number>;
  events.forEach(event => {
    if (!conferencesByDay[event.day]) conferencesByDay[event.day] = 0;
    conferencesByDay[event.day]++;
  });
  console.log('📊 Distribution des conférences par jour:', conferencesByDay);
  
  return events;
}

// Fonction pour convertir les sessions (ateliers et conférences) en événements
export function convertSessionsToEvents(sessions: NocoDBSession[]): Event[] {
  // Fonction pour déterminer si une session est un atelier
  const isAtelier = (session: NocoDBSession): session is NocoDBAtelier => {
    return (
      // Champs spécifiques aux ateliers
      "À qui s'adresse atelier ?" in session &&
      // Champ de description spécifique aux ateliers
      "Décrivez brièvement votre animation pour les visiteurs" in session
    );
  };

  // Fonction pour déterminer si une session est une conférence
  const isConference = (session: NocoDBSession): session is NocoDBConference => {
    return (
      // Champs spécifiques aux conférences
      (("À qui s'adresse la conférence ?" in session) || 
       ("À qui s'adresse conference ?" in session)) &&
      // Champ de description spécifique aux conférences
      "Décrivez brièvement votre conférence pour les visiteurs" in session
    );
  };

  // Séparer les sessions en ateliers et conférences
  const ateliers = sessions.filter(isAtelier);
  const conferences = sessions.filter(isConference);

  console.log(`🏷️ Sessions détectées:`);
  console.log(`   - Ateliers: ${ateliers.length}`);
  console.log(`   - Conférences: ${conferences.length}`);

  // Afficher des détails sur les sessions non classées
  const unclassifiedSessions = sessions.filter(
    session => !isAtelier(session) && !isConference(session)
  );
  
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
export function organizeEventsByDay(events: Event[]): Record<string, Event[]> {
  const result: Record<string, Event[]> = {};
  
  events.forEach(event => {
    const day = event.day;
    if (!result[day]) {
      result[day] = [];
    }
    result[day].push(event);
  });
  
  return result;
}

// Ajout d'une fonction pour analyser la répartition des événements par jour
export function logEventDistribution(events: Event[]): void {
  const eventsByDay = organizeEventsByDay(events);
  console.log('📊 Répartition des événements par jour:');
  Object.entries(eventsByDay).forEach(([day, dayEvents]) => {
    console.log(`   - ${day}: ${dayEvents.length} événements`);
  });
}