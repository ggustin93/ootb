import type { Event } from '~/types/festival';
import { Api } from 'nocodb-sdk';
import { NOCODB_BASE_URL, NOCODB_CONFIG, getNocoDBToken } from '~/config/nocodb';
import { days, FestivalDay } from '~/services/events';

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
  "Choisissez un titre court": string;
  "À qui s'adresse la conférence ?": string;
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

// Fonction pour récupérer les stands depuis l'API NocoDB en utilisant nocodb-sdk
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

// Fonction pour convertir les stands en événements
export function convertStandsToEvents(stands: NocoDBStand[]): Event[] {
  console.log(`[DEBUG NOCODB] Conversion de ${stands.length} stands en événements`);
  
  const defaultImage = '/images/default-stand.jpg';
  
  return stands.map(stand => {
    // Déterminer le jour en fonction de la valeur de Jours
    let day: FestivalDay;
    
    switch (stand.Jours) {
      case 1:
        day = 'Mercredi';
        break;
      case 2:
        day = 'Jeudi';
        break;
      case 3:
        day = 'Vendredi';
        break;
      case 0:
        // Pour les stands présents les trois jours, on les affiche le premier jour
        day = 'Mercredi';
        console.log(`Stand "${stand["Choisissez un titre court"]}" présent les trois jours, affiché le Mercredi`);
        break;
      default:
        day = 'À définir';
        console.log(`Jour non reconnu pour le stand "${stand["Choisissez un titre court"]}", utilisation de "À définir"`);
    }
    
    // Log pour les événements du vendredi
    if (stand.Jours === 3 || (typeof stand.Jours === 'string' && stand.Jours.toLowerCase().includes('vendredi'))) {
      console.log(`[DEBUG VENDREDI NOCODB] Stand du vendredi détecté: "${stand["Choisissez un titre court"]}" - Jours=${stand.Jours}, day=${day}`);
    }
    
    // Récupérer l'URL de l'image ou utiliser l'image par défaut
    const imageUrl = stand["Envoyez votre logo"]?.length > 0 
      ? stand["Envoyez votre logo"][0].signedUrl 
      : defaultImage;
    
    return {
      id: `stand-${stand.ID}`,
      title: stand["Choisissez un titre court"] || "Stand sans titre",
      description: stand["Décrivez brièvement votre stand pour les visiteurs"] || "Description à venir",
      day,
      time: "Toute la journée", // Les stands sont généralement présents toute la journée
      location: stand.Espaces?.Title || "Emplacement à définir",
      speaker: stand.Prénom && stand.Nom ? `${stand.Prénom} ${stand.Nom}` : "Exposant à définir",
      type: "Stands" as const, // Type d'événement pour les stands
      image: imageUrl,
      url: stand["Site internet"] || "",
      target: stand["À qui s'adresse le stand ?"] || "Public à définir",
      level: stand["Niveau d'enseignement"] || "Niveau à définir",
      teachingType: stand["Type d'enseignement"] || "Type à définir"
    };
  });
}

// Fonction pour convertir les ateliers en événements
export function convertAteliersToEvents(ateliers: NocoDBAtelier[]): Event[] {
  const defaultImage = '/images/default-workshop.jpg';
  
  return ateliers.map(atelier => {
    // Récupérer l'URL de l'image ou utiliser l'image par défaut
    const imageUrl = atelier["Envoyez votre logo"]?.length > 0 
      ? atelier["Envoyez votre logo"][0].signedUrl 
      : defaultImage;
    
    // Gérer le jour de manière plus robuste
    // Si le jour est vide ou invalide, utiliser "À définir"
    let day: FestivalDay;
    
    if (!atelier.Jours || atelier.Jours === '') {
      day = 'À définir';
      console.log(`Jour manquant pour l'atelier "${atelier["Choisissez un titre court"]}", utilisation de "À définir"`);
    } else if (days.includes(atelier.Jours as typeof days[number])) {
      day = atelier.Jours as FestivalDay;
    } else if (atelier.Jours === 'Lundi') {
      // Convertir "Lundi" en "Mercredi" pour la compatibilité
      day = 'Mercredi';
      console.log(`Jour "Lundi" converti en "Mercredi" pour l'atelier "${atelier["Choisissez un titre court"]}"`);
    } else if (atelier.Jours === 'Mardi') {
      // Convertir "Mardi" en "Mercredi" pour la compatibilité
      day = 'Mercredi';
      console.log(`Jour "Mardi" converti en "Mercredi" pour l'atelier "${atelier["Choisissez un titre court"]}"`);
    } else {
      // Pour tout autre jour non reconnu
      day = 'À définir';
      console.log(`Jour non reconnu "${atelier.Jours}" pour l'atelier "${atelier["Choisissez un titre court"]}", utilisation de "À définir"`);
    }
    
    return {
      id: `atelier-${atelier.ID}`,
      title: atelier["Choisissez un titre court"] || "Atelier sans titre",
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
}

// Fonction pour convertir les conférences en événements
export function convertConferencesToEvents(conferences: NocoDBConference[]): Event[] {
  const defaultImage = '/images/default-conference.jpg';
  const defaultSpeakerImage = '/images/default-speaker.jpg';
  
  console.log('🔄 Conversion des conférences en événements...');
  console.log(`📊 Nombre de conférences à convertir: ${conferences.length}`);
  
  const convertedConferences = conferences.map((conference, index) => {
    try {
      // Extensive logging for each conference
      console.log(`\n🏷️ Traitement de la conférence #${index + 1}:`);
      console.log('   Données brutes:', JSON.stringify(conference, null, 2));

      // Vérification des champs critiques
      const criticalFields = [
        "Choisissez un titre pour la conférence",
        "Décrivez brièvement votre conférence pour les visiteurs",
        "À qui s'adresse conference ?",
        "Niveau d'enseignement",
        "Type d'enseignement"
      ];

      let missingFields = criticalFields.filter(field => !conference[field]);
      if (missingFields.length > 0) {
        console.warn(`⚠️ Champs manquants: ${missingFields.join(', ')}`);
      }

      // Image URL extraction with extensive logging
      const imageUrl = (() => {
        const logoFields = ["Envoyez votre logo", "Envoyez un logo"];
        for (let field of logoFields) {
          if (conference[field]?.length > 0) {
            console.log(`   🖼️ Logo trouvé dans le champ: ${field}`);
            return conference[field][0].signedUrl;
          }
        }
        console.log('   🖼️ Utilisation de l\'image par défaut');
        return defaultImage;
      })();

      // Speaker image extraction
      const speakerImageUrl = (() => {
        const photoFields = ["Envoyez une photo de vous", "Photo"];
        for (let field of photoFields) {
          if (conference[field]?.length > 0) {
            console.log(`   👤 Photo de speaker trouvée dans le champ: ${field}`);
            return conference[field][0].signedUrl;
          }
        }
        console.log('   👤 Utilisation de l\'image de speaker par défaut');
        return defaultSpeakerImage;
      })();

      // Jour (Day) extraction with detailed logging
      const day = (() => {
        const jourFields = [
          conference.Jours?.Title, 
          conference.Jours_id, 
          conference.Jours
        ];

        for (let jourValue of jourFields) {
          console.log(`   🕒 Test valeur de jour: ${JSON.stringify(jourValue)}`);
          
          if (!jourValue) continue;

          const dayMapping = {
            1: 'Mercredi',
            2: 'Jeudi',
            3: 'Vendredi',
            'Mercredi': 'Mercredi',
            'Jeudi': 'Jeudi',
            'Vendredi': 'Vendredi'
          };

          if (typeof jourValue === 'object' && jourValue.Title) {
            console.log(`   ✅ Jour trouvé depuis objet: ${jourValue.Title}`);
            return dayMapping[jourValue.Title] || 'À définir';
          }

          if (dayMapping[jourValue]) {
            console.log(`   ✅ Jour trouvé: ${dayMapping[jourValue]}`);
            return dayMapping[jourValue];
          }
        }

        console.warn('   ⚠️ Aucun jour valide trouvé');
        return 'À définir';
      })();

      const eventData = {
        id: `conference-${conference.ID}`,
        title: (conference["Choisissez un titre pour la conférence"] || "Conférence sans titre"),
        description: (conference["Décrivez brièvement votre conférence pour les visiteurs"] || "Description à venir"),
        day,
        time: conference.Heure || "Horaire à définir",
        location: conference.Espaces?.Title || conference.Espaces_id || "Emplacement à définir",
        speaker: conference.Prénom && conference.Nom ? `${conference.Prénom} ${conference.Nom}` : "Intervenant à définir",
        type: "Conférences" as const,  // Ensure type is exactly 'Conférences'
        image: imageUrl,
        speakerImage: speakerImageUrl,
        url: (conference["Site internet"] || ""),
        target: (conference["À qui s'adresse conference ?"] || "Public à définir"),
        level: (conference["Niveau d'enseignement"] || "Niveau à définir"),
        teachingType: (conference["Type d'enseignement"] || "Type à définir")
      };
      
      console.log(`✨ Événement créé: ${eventData.id} - ${eventData.title} (${eventData.day})`);
      
      return eventData;
    } catch (error) {
      console.error(`❌ Erreur lors de la conversion de la conférence #${index + 1}:`, error);
      return null;
    }
  }).filter(event => event !== null);

  console.log(`📊 Nombre de conférences converties: ${convertedConferences.length}`);
  
  return convertedConferences;
}

// Fonction pour convertir les sessions (ateliers et conférences) en événements
export function convertSessionsToEvents(sessions: NocoDBSession[]): Event[] {
  console.log(`[DEBUG NOCODB] Conversion de ${sessions.length} sessions en événements`);
  
  // Type guards plus précis pour distinguer les ateliers et les conférences
  const isAtelier = (session: NocoDBSession): session is NocoDBAtelier => {
    return (
      // Champs spécifiques aux ateliers
      session.hasOwnProperty("À qui s'adresse atelier ?") &&
      // Champ de description spécifique aux ateliers
      session.hasOwnProperty("Décrivez brièvement votre animation pour les visiteurs")
    );
  };

  const isConference = (session: NocoDBSession): session is NocoDBConference => {
    return (
      // Champs spécifiques aux conférences
      (session.hasOwnProperty("À qui s'adresse la conférence ?") || 
       session.hasOwnProperty("À qui s'adresse conference ?")) &&
      // Champ de description spécifique aux conférences
      session.hasOwnProperty("Décrivez brièvement votre conférence pour les visiteurs")
    );
  };

  // Séparation des sessions
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