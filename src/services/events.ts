import type { Event } from '~/types/festival';
import { 
  fetchStands, 
  fetchSessions, 
  convertStandsToEvents, 
  convertSessionsToEvents 
} from './api/nocodb';
import { TEST_MODE, events as dummyEvents } from '~/config/festival';
import { NOCODB_CONFIG, calculateSimilarity } from '~/config/nocodb';

// Jours du festival avec leurs dates
export const days = ['Mercredi', 'Jeudi', 'Vendredi'] as const;
export type FestivalDay = typeof days[number] | 'À définir';

export const dayDates: Record<typeof days[number], string> = {
  'Mercredi': '01/10',
  'Jeudi': '02/10',
  'Vendredi': '03/10'
};

// Types d'événements
export const eventTypes = ['Conférences', 'Ateliers', 'Stands'];

// Images par défaut pour chaque type d'événement
const defaultImages = {
  'Conférences': '/images/default-conference.jpg',
  'Ateliers': '/images/default-workshop.jpg',
  'Stands': '/images/default-stand.jpg'
};

// Couleurs par défaut pour chaque type d'événement - commenté car non utilisé pour l'instant
// const typeColors = {
//   'Conférences': '#3b82f6', // blue-500
//   'Ateliers': '#8b5cf6',    // violet-500
//   'Stands': '#10b981'       // emerald-500
// };

// Icônes par défaut pour chaque type d'événement - commenté car non utilisé pour l'instant
// const typeIcons = {
//   'Conférences': 'tabler:presentation',
//   'Ateliers': 'tabler:tool',
//   'Stands': 'tabler:building-store'
// };

/**
 * Génère une URL d'image par défaut pour un événement
 * Cette fonction peut être utilisée pour générer des images dynamiques via un service comme Cloudinary
 * ou pour retourner des chemins d'images statiques
 * @param event L'événement pour lequel générer une image par défaut
 * @returns L'URL de l'image par défaut
 */
export function getDefaultImage(event: Event): string {
  // Pour l'instant, on retourne simplement les images statiques par défaut
  return defaultImages[event.type];
  
  // Exemple d'implémentation future avec Cloudinary ou un service similaire:
  /*
  const eventType = encodeURIComponent(event.type);
  const eventTitle = encodeURIComponent(event.title);
  const color = typeColors[event.type].replace('#', '');
  const icon = typeIcons[event.type].replace('tabler:', '');
  
  return `https://res.cloudinary.com/your-cloud-name/image/upload/w_800,h_450,c_fill,q_auto,f_auto/l_text:Montserrat_48_bold:${eventTitle},co_white,g_center,y_-50/l_text:Montserrat_32:${eventType},co_white,g_center,y_50/b_rgb:${color},o_80/l_icon:${icon},w_120,g_center,y_-80,co_white/v1/festival-backgrounds/bg-${event.type.toLowerCase()}`;
  */
}

/**
 * Génère une URL d'image par défaut pour un conférencier
 * @param _event L'événement pour lequel générer une image de conférencier par défaut (non utilisé pour l'instant)
 * @returns L'URL de l'image par défaut du conférencier
 */
export function getDefaultSpeakerImage(_event: Event): string {
  return '/images/default-speaker.jpg';
}

/**
 * Élimine les doublons dans une liste d'événements
 * Un doublon est défini comme un événement ayant des titres similaires, le même jour et le même type
 */
function removeDuplicates(events: Event[]): Event[] {
  const uniqueEvents = new Map<string, Event>();
  const similarityGroups: Record<string, Event[]> = {};
  const duplicates: Record<string, { count: number, ids: string[] }> = {};
  
  // Trier les événements pour privilégier les événements réels (non fictifs)
  // Les événements avec des IDs numériques sont considérés comme réels
  const sortedEvents = [...events].sort((a, b) => {
    const aIsNumeric = /^\d+$/.test(a.id.replace(/^(stand|atelier|conference)-/, ''));
    const bIsNumeric = /^\d+$/.test(b.id.replace(/^(stand|atelier|conference)-/, ''));
    
    if (aIsNumeric && !bIsNumeric) return -1;
    if (!aIsNumeric && bIsNumeric) return 1;
    return 0;
  });
  
  console.log(`Tri des événements: ${sortedEvents.length} événements au total`);
  
  // Première passe : regrouper les événements par jour et type
  sortedEvents.forEach(event => {
    const dayTypeKey = `${event.day}-${event.type}`;
    if (!similarityGroups[dayTypeKey]) {
      similarityGroups[dayTypeKey] = [];
    }
    similarityGroups[dayTypeKey].push(event);
  });
  
  // Deuxième passe : traiter chaque groupe pour détecter les doublons par similarité
  Object.entries(similarityGroups).forEach(([_dayTypeKey, eventsInGroup]) => {
    // Pour chaque événement dans le groupe
    eventsInGroup.forEach(event => {
      // Vérifier s'il existe déjà un événement similaire
      let isDuplicate = false;
      let existingKey = '';
      
      // Parcourir les événements déjà ajoutés
      for (const [key, existingEvent] of uniqueEvents.entries()) {
        // Vérifier si l'événement existant est du même jour et type
        if (existingEvent.day === event.day && existingEvent.type === event.type) {
          // Calculer la similarité entre les titres
          const similarity = calculateSimilarity(existingEvent.title, event.title);
          
          // Si la similarité est supérieure au seuil, considérer comme un doublon
          if (similarity >= NOCODB_CONFIG.duplicateDetection.similarityThreshold) {
            isDuplicate = true;
            existingKey = key;
            break;
          }
        }
      }
      
      // Si c'est un doublon, l'ajouter aux statistiques
      if (isDuplicate && existingKey) {
        // Enregistrer le doublon pour les logs
        if (!duplicates[existingKey]) {
          duplicates[existingKey] = { 
            count: 1, 
            ids: [uniqueEvents.get(existingKey)!.id] 
          };
        }
        
        duplicates[existingKey].count++;
        duplicates[existingKey].ids.push(event.id);
        
        console.log(`Doublon détecté: "${event.title}" (${event.day}, ${event.type}, ID: ${event.id})`);
        console.log(`  → Similaire à: "${uniqueEvents.get(existingKey)!.title}"`);
        console.log(`  → Conservé: ID ${uniqueEvents.get(existingKey)!.id}`);
      } else {
        // Sinon, ajouter l'événement à la liste des événements uniques
        const key = `${event.title}-${event.day}-${event.type}`;
        uniqueEvents.set(key, event);
        console.log(`Ajout de l'événement: "${event.title}" (${event.day}, ${event.type}, ID: ${event.id})`);
      }
    });
  });
  
  // Afficher les statistiques sur les doublons
  const totalDuplicates = Object.values(duplicates).reduce((sum, info) => sum + info.count, 0);
  if (totalDuplicates > 0) {
    console.log(`\n=== RAPPORT DE DOUBLONS ===`);
    console.log(`Doublons détectés et ignorés: ${totalDuplicates} événements`);
    Object.entries(duplicates).forEach(([key, info]) => {
      console.log(`  - "${key}": ${info.count} occurrences`);
      console.log(`    IDs impliqués: ${info.ids.join(', ')}`);
    });
    console.log(`=========================\n`);
  } else {
    console.log('Aucun doublon détecté');
  }
  
  return Array.from(uniqueEvents.values());
}

/**
 * Récupère tous les événements (stands, conférences et ateliers) depuis NocoDB
 * et les convertit au format Event
 */
export async function fetchAllEvents(): Promise<Event[]> {
  try {
    // Récupération parallèle des stands et des sessions
    const [standsResponse, sessionsResponse] = await Promise.all([
      fetchStands(),
      fetchSessions()
    ]);

    // Conversion des données en événements
    const standEvents = convertStandsToEvents(standsResponse.list);
    const sessionEvents = convertSessionsToEvents(sessionsResponse.list);

    // Combinaison des deux types d'événements
    let allEvents = [...standEvents, ...sessionEvents];

    // En mode test, ajouter les données fictives
    if (TEST_MODE) {
      console.log('Mode test activé : ajout des données fictives');
      allEvents = [...allEvents, ...dummyEvents];
      
      // Éliminer les doublons potentiels
      allEvents = removeDuplicates(allEvents);
      console.log(`Nombre total d'événements après déduplication : ${allEvents.length}`);
    }

    // Ajout des images par défaut si nécessaire
    return allEvents.map(event => {
      if (!event.image) {
        event.image = getDefaultImage(event);
      }
      
      // Ajouter une image de conférencier par défaut si nécessaire
      if (event.type === 'Conférences' && event.speaker && !event.speakerImage) {
        event.speakerImage = getDefaultSpeakerImage(event);
      }
      
      return event;
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    
    // En cas d'erreur, retourner au moins les données fictives en mode test
    if (TEST_MODE) {
      console.log('Mode test activé : utilisation des données fictives uniquement suite à une erreur');
      return dummyEvents;
    }
    
    return [];
  }
}

/**
 * Organise les événements par jour
 */
export function organizeEventsByDay(events: Event[]): Record<string, Event[]> {
  return events.reduce((acc, event) => {
    const day = event.day;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(event);
    return acc;
  }, {} as Record<string, Event[]>);
}

/**
 * Filtre les événements par type
 */
export function filterEventsByType(events: Event[], type: string): Event[] {
  if (type === 'all') {
    return events;
  }
  return events.filter(event => event.type === type);
}

/**
 * Récupère tous les événements et les organise par jour
 */
export async function getEventsByDay(): Promise<Record<string, Event[]>> {
  const events = await fetchAllEvents();
  return organizeEventsByDay(events);
} 