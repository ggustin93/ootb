import type { Event } from '~/types/festival';
import { fetchStands, fetchSessions, convertStandsToEvents, convertSessionsToEvents } from './api/nocodb';
import {
  TEST_MODE,
  events as dummyEvents,
  FESTIVAL_DAYS,
  type FestivalDay as ConfigFestivalDay,
} from '~/config/festival';
import { NOCODB_CONFIG, calculateSimilarity } from '~/config/nocodb';
import {
  processEventImages,
  optimizeAllExistingImages,
  resetImageProcessingSession,
  getImagePath,
} from './imageProcessor';

// Jours du festival avec leurs dates - CENTRALISÉ depuis TinaCMS via festival.ts
export const days = FESTIVAL_DAYS.days;
export type FestivalDay = ConfigFestivalDay;

export const dayDates = FESTIVAL_DAYS.dayDates as Record<(typeof days)[number], string>;

// Types d'événements
export const eventTypes = ['Conférences', 'Ateliers', 'Stands'];

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

// Variable pour suivre si les images ont déjà été optimisées dans cette session
let imagesOptimizedInSession = false;

/**
 * Récupère l'image par défaut pour un événement
 * @param event L'événement
 * @returns Le chemin de l'image par défaut
 */
export function getDefaultImage(event: Event): string {
  // Si l'événement a déjà une image, la retourner
  if (event.image && typeof event.image === 'string') {
    return event.image;
  }

  // Essayer de trouver une image existante pour cet événement
  const cachedImagePath = getImagePath(event.id, event.type, false);
  if (cachedImagePath) {
    return cachedImagePath;
  }

  // Sinon, retourner une image par défaut en fonction du type d'événement
  if (event.type === 'Conférences') {
    return '~/assets/images/defaults/conference-default.webp';
  } else if (event.type === 'Ateliers') {
    return '~/assets/images/defaults/atelier-default.webp';
  } else if (event.type === 'Stands') {
    return '~/assets/images/defaults/stand-default.webp';
  }

  // Image par défaut générique
  return '~/assets/images/defaults/event-default.webp';
}

/**
 * Récupère l'image du conférencier par défaut pour un événement
 * @param event L'événement
 * @returns Le chemin de l'image du conférencier par défaut
 */
export function getDefaultSpeakerImage(event: Event): string {
  // Si l'événement a déjà une image de conférencier, la retourner
  if (event.speakerImage && typeof event.speakerImage === 'string') {
    return event.speakerImage;
  }

  // Essayer de trouver une image existante pour ce conférencier
  const cachedImagePath = getImagePath(event.id, event.type, true);
  if (cachedImagePath) {
    return cachedImagePath;
  }

  // Image par défaut pour les conférenciers
  return '~/assets/images/defaults/speaker-default.webp';
}

/**
 * Élimine les doublons dans une liste d'événements
 * Un doublon est défini comme un événement ayant des titres similaires, le même jour et le même type
 */
function removeDuplicates(events: Event[]): Event[] {
  const uniqueEvents = new Map<string, Event>();
  const similarityGroups: Record<string, Event[]> = {};
  const duplicates: Record<string, { count: number; ids: string[] }> = {};

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
  sortedEvents.forEach((event) => {
    const dayTypeKey = `${event.day}-${event.type}`;
    if (!similarityGroups[dayTypeKey]) {
      similarityGroups[dayTypeKey] = [];
    }
    similarityGroups[dayTypeKey].push(event);
  });

  // Deuxième passe : traiter chaque groupe pour détecter les doublons par similarité
  Object.entries(similarityGroups).forEach(([_dayTypeKey, eventsInGroup]) => {
    // Pour chaque événement dans le groupe
    eventsInGroup.forEach((event) => {
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
            ids: [uniqueEvents.get(existingKey)!.id],
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
 * Nettoie les images problématiques connues
 */
export async function cleanupKnownProblematicImages(): Promise<void> {
  // Liste des images problématiques connues avec leurs IDs simples
  // Note: Utiliser le format normalisé (sans redondance) pour les IDs

  console.log('✅ Nettoyage terminé');
}

/**
 * Récupère tous les événements (stands, conférences et ateliers) depuis NocoDB
 * et les convertit au format Event
 */
export async function fetchAllEvents(): Promise<Event[]> {
  try {
    // Nettoyer les images problématiques connues seulement si nécessaire
    if (!imagesOptimizedInSession) {
      console.log('🔄 Première exécution dans cette session, nettoyage et optimisation des images...');
      await cleanupKnownProblematicImages();

      // Optimiser les images existantes (seulement la première fois)
      await optimizeAllExistingImages();

      // Marquer les images comme optimisées pour cette session
      imagesOptimizedInSession = true;
    } else {
      console.log('ℹ️ Images déjà optimisées dans cette session, optimisation ignorée');
    }

    // Récupération parallèle des stands et des sessions
    const [standsResponse, sessionsResponse] = await Promise.all([fetchStands(), fetchSessions()]);

    // Conversion des données en événements
    const standEvents = convertStandsToEvents(standsResponse.list);
    const sessionEvents = convertSessionsToEvents(sessionsResponse.list);

    // Combinaison des deux types d'événements
    // Les événements NocoDB n'ont pas d'heure de fin et peuvent avoir le jour « À définir » :
    // ce pipeline historique les traite comme des Event (comportement inchangé).
    let allEvents = [...standEvents, ...sessionEvents] as Event[];

    // En mode test, ajouter les données fictives
    if (TEST_MODE) {
      console.log('Mode test activé : ajout des données fictives');

      // Convertir les événements fictifs au format Event de types/festival
      const convertedDummyEvents = dummyEvents.map((dummyEvent) => {
        // Extraire le jour à partir de la clé de l'événement ou utiliser une valeur par défaut
        let day: FestivalDay = 'Mercredi';

        // Essayer de déterminer le jour à partir du titre ou d'autres propriétés
        if ('time' in dummyEvent) {
          // Chercher des indices dans les propriétés disponibles
          const eventStr = JSON.stringify(dummyEvent).toLowerCase();
          if (eventStr.includes('vendredi')) {
            day = 'Vendredi';
          } else if (eventStr.includes('jeudi')) {
            day = 'Jeudi';
          } else if (eventStr.includes('mercredi')) {
            day = 'Mercredi';
          }
        }

        return {
          id: `dummy-${Math.random().toString(36).substring(2, 9)}`,
          time: dummyEvent.time,
          type: dummyEvent.type,
          title: dummyEvent.title,
          description: dummyEvent.description,
          location: dummyEvent.location,
          speaker: dummyEvent.speaker || '',
          day, // Utiliser le jour déterminé
          image: dummyEvent.image,
          url: '',
          target: 'Tous publics',
          level: 'Tous niveaux',
          teachingType: 'Général',
        } as Event;
      });

      allEvents = [...allEvents, ...convertedDummyEvents];

      // Éliminer les doublons potentiels
      allEvents = removeDuplicates(allEvents);
      console.log(`Nombre total d'événements après déduplication : ${allEvents.length}`);
    }

    // Ajout des images par défaut si nécessaire
    let processedEvents = allEvents.map((event) => {
      if (!event.image) {
        event.image = getDefaultImage(event);
      }

      // Ajouter une image de conférencier par défaut si nécessaire
      if (event.type === 'Conférences' && event.speaker && !event.speakerImage) {
        event.speakerImage = getDefaultSpeakerImage(event);
      }

      return event;
    });

    // Traitement et téléchargement des images
    try {
      console.log('🔄 Début du traitement des images...');
      processedEvents = await processEventImages(processedEvents);
      console.log('✅ Traitement des images terminé avec succès');
    } catch (imageError) {
      console.error('❌ Erreur lors du traitement des images:', imageError);
      // Continuer avec les événements non traités en cas d'erreur
    }

    return processedEvents;
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);

    // En cas d'erreur, retourner au moins les données fictives en mode test
    if (TEST_MODE) {
      console.log('Mode test activé : utilisation des données fictives uniquement suite à une erreur');

      // Convertir les événements fictifs au format Event de types/festival
      const convertedDummyEvents = dummyEvents.map((dummyEvent) => {
        // Extraire le jour à partir de la clé de l'événement ou utiliser une valeur par défaut
        let day: FestivalDay = 'Mercredi';

        // Essayer de déterminer le jour à partir du titre ou d'autres propriétés
        if ('time' in dummyEvent) {
          // Chercher des indices dans les propriétés disponibles
          const eventStr = JSON.stringify(dummyEvent).toLowerCase();
          if (eventStr.includes('vendredi')) {
            day = 'Vendredi';
          } else if (eventStr.includes('jeudi')) {
            day = 'Jeudi';
          } else if (eventStr.includes('mercredi')) {
            day = 'Mercredi';
          }
        }

        return {
          id: `dummy-${Math.random().toString(36).substring(2, 9)}`,
          time: dummyEvent.time,
          type: dummyEvent.type,
          title: dummyEvent.title,
          description: dummyEvent.description,
          location: dummyEvent.location,
          speaker: dummyEvent.speaker || '',
          day, // Utiliser le jour déterminé
          image: dummyEvent.image,
          url: '',
          target: 'Tous publics',
          level: 'Tous niveaux',
          teachingType: 'Général',
        } as Event;
      });

      return convertedDummyEvents;
    }

    return [];
  }
}

/**
 * Organise les événements par jour
 */
export function organizeEventsByDay(events: Event[]): Record<string, Event[]> {
  return events.reduce(
    (acc, event) => {
      const day = event.day;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(event);
      return acc;
    },
    {} as Record<string, Event[]>
  );
}

/**
 * Filtre les événements par type
 */
export function filterEventsByType(events: Event[], type: string): Event[] {
  if (type === 'all') {
    return events;
  }
  return events.filter((event) => event.type === type);
}

/**
 * Récupère tous les événements et les organise par jour
 */
export async function getEventsByDay(): Promise<Record<string, Event[]>> {
  const events = await fetchAllEvents();
  return organizeEventsByDay(events);
}

/**
 * Force le traitement des images en réinitialisant le flag de session
 */
export async function forceImageProcessing(): Promise<void> {
  console.log('🔄 Forçage du traitement des images...');
  resetImageProcessingSession();
  await fetchAllEvents();
  console.log('✅ Traitement forcé des images terminé');
}

/**
 * Réinitialise le flag d'optimisation des images pour forcer une nouvelle optimisation
 */
export function resetImageOptimizationFlag(): void {
  imagesOptimizedInSession = false;
  console.log("🔄 Flag d'optimisation des images réinitialisé");
}
