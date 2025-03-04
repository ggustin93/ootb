import type { Event } from '~/types/festival';
import { Api } from 'nocodb-sdk';

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
  Jours: number;
}

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

// Fonction pour récupérer les stands depuis l'API NocoDB en utilisant nocodb-sdk
export async function fetchStands(): Promise<NocoDBResponse> {
  const apiToken = import.meta.env.NOCODB_API_TOKEN;
  
  try {
    console.log('Initialisation de l\'API NocoDB avec le token:', apiToken ? 'Token présent' : 'Token manquant');
    
    // Initialisation de l'API NocoDB avec le SDK
    const api = new Api({
      baseURL: "https://app.nocodb.com",
      headers: {
        "xc-token": apiToken
      }
    });
    
    console.log('Appel à l\'API NocoDB pour récupérer les stands...');
    
    // Appel à l'API pour récupérer les données
    const response = await api.dbTableRow.list(
      "noco",
      "pocv8knemg3rcok",
      "mbwhou86e9tzqql",
      {
        offset: 0,
        limit: 25,
        where: ""
      }
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

// Fonction pour convertir les stands en événements
export function convertStandsToEvents(stands: NocoDBStand[]): Event[] {
  const defaultImage = '/images/default-stand.jpg'; // Image par défaut pour les stands
  
  return stands.map(stand => {
    // Déterminer le jour en fonction de la valeur Jours
    // 1 = Vendredi, 2 = Samedi, 0 = Les deux jours
    let day: 'Vendredi' | 'Samedi';
    switch(stand.Jours) {
      case 1:
        day = 'Vendredi';
        break;
      case 2:
        day = 'Samedi';
        break;
      default:
        day = 'Vendredi'; // Par défaut, on met Vendredi si la valeur n'est pas reconnue
    }
    
    // Récupérer l'URL de l'image ou utiliser l'image par défaut
    const imageUrl = stand["Envoyez votre logo"]?.length > 0 
      ? stand["Envoyez votre logo"][0].signedUrl 
      : defaultImage;
    
    return {
      id: `stand-${stand.ID}`,
      title: stand["Choisissez un titre court"],
      description: stand["Décrivez brièvement votre stand pour les visiteurs"],
      day,
      time: "Toute la journée", // Les stands sont généralement présents toute la journée
      location: stand.Espaces?.Title || "Emplacement à définir",
      speaker: `${stand.Prénom} ${stand.Nom}`,
      type: "Stands" as const, // Type d'événement pour les stands
      image: imageUrl,
      url: stand["Site internet"] || "",
      target: stand["À qui s'adresse le stand ?"],
      level: stand["Niveau d'enseignement"],
      teachingType: stand["Type d'enseignement"]
    };
  });
}

// Fonction pour organiser les événements par jour
export function organizeEventsByDay(events: Event[]): Record<string, Event[]> {
  const result: Record<string, Event[]> = {};
  
  events.forEach(event => {
    if (!result[event.day]) {
      result[event.day] = [];
    }
    result[event.day].push(event);
  });
  
  return result;
} 