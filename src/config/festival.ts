/**
 * Configuration centrale du festival
 * Ce fichier regroupe toutes les constantes et configurations importantes
 * pour l'application du festival.
 */

import { events as eventsRecord } from '~/data/festival/index';

// Mode test pour le développement
export const TEST_MODE = false;

// Transformer l'objet events en tableau plat pour les tests
export const events = Object.values(eventsRecord).flat();

// Jours du festival
export const FESTIVAL_DAYS = {
  // Jours du festival (ordre chronologique)
  days: ['Mercredi', 'Jeudi', 'Vendredi'] as const,
  
  // Mapping des valeurs numériques vers les jours (utilisé dans la conversion des données NocoDB)
  dayMapping: {
    0: 'Les trois jours',
    1: 'Mercredi',
    2: 'Jeudi',
    3: 'Vendredi'
  },
  
  // Dates associées à chaque jour
  dayDates: {
    'Mercredi': '01/10',
    'Jeudi': '02/10',
    'Vendredi': '03/10'
  },
  
  // Valeur par défaut pour les jours non définis
  defaultDay: 'À définir'
};

// Types d'événements
export const EVENT_TYPES = {
  types: ['Conférences', 'Ateliers', 'Stands'] as const,
  
  // Images par défaut pour chaque type d'événement
  defaultImages: {
    'Conférences': '/images/default-conference.jpg',
    'Ateliers': '/images/default-workshop.jpg',
    'Stands': '/images/default-stand.jpg'
  },
  
  // Icônes pour chaque type d'événement
  icons: {
    'Conférences': 'tabler:presentation',
    'Ateliers': 'tabler:tool',
    'Stands': 'tabler:building-store'
  },
  
  // Couleurs pour chaque type d'événement
  colors: {
    'Conférences': {
      bg: 'rgba(228, 69, 30, 0.15)',
      text: '#e4451e',
      border: 'rgba(228, 69, 30, 0.3)'
    },
    'Ateliers': {
      bg: 'rgba(37, 99, 235, 0.15)',
      text: '#2563eb',
      border: 'rgba(37, 99, 235, 0.3)'
    },
    'Stands': {
      bg: 'rgba(22, 163, 74, 0.15)',
      text: '#16a34a',
      border: 'rgba(22, 163, 74, 0.3)'
    }
  }
};

// Configuration par défaut pour le composant DayFilter
export const DAY_FILTER_CONFIG = {
  allDaysLabel: 'Tous les jours',
  globalViewLabel: 'Vue globale',
  allEventsLabel: 'Tous les événements',
  pdfButtonLabel: 'Télécharger le PDF',
  pdfLink: '/programme-festival.pdf',
  prevLabel: 'Précédent',
  nextLabel: 'Suivant',
  pageLabel: 'Page',
  onLabel: 'sur',
  days: [
    { name: 'Mercredi', date: '01/10' },
    { name: 'Jeudi', date: '02/10' },
    { name: 'Vendredi', date: '03/10' }
  ],
  eventTypes: [
    { name: 'Conférences', icon: 'tabler:presentation' },
    { name: 'Ateliers', icon: 'tabler:tool' },
    { name: 'Stands', icon: 'tabler:building-store' }
  ]
};

// Configuration complète du festival
export const FESTIVAL_CONFIG = {
  // Informations générales
  name: 'Festival Out of the Books',
  edition: '2025',
  dates: '1-3 octobre 2025',
  location: 'Bruxelles, Belgique',
  
  // Configuration des composants
  programme: {
    title: 'Programme du festival',
    description: 'Découvrez toutes les activités du festival',
    dayFilter: DAY_FILTER_CONFIG
  },
  
  // Paramètres de pagination
  pagination: {
    eventsPerPage: 10
  },
  
  // Paramètres de détection des doublons
  duplicateDetection: {
    similarityThreshold: 0.9,
    fields: ['title', 'day', 'type']
  }
};

// Types pour les jours et types d'événements
export type FestivalDay = typeof FESTIVAL_DAYS.days[number] | 'À définir' | 'Les trois jours';
export type EventType = typeof EVENT_TYPES.types[number];

/**
 * Normalise un jour pour garantir la cohérence
 * @param day Jour à normaliser (peut être une chaîne, un nombre ou un objet)
 * @returns Jour normalisé au format FestivalDay
 */
export function normalizeDay(day: string | number | { Title?: string } | null | undefined): FestivalDay {
  if (!day) return FESTIVAL_DAYS.defaultDay as FestivalDay;
  
  // Si c'est un nombre, utiliser le mapping
  if (typeof day === 'number') {
    return (FESTIVAL_DAYS.dayMapping[day as keyof typeof FESTIVAL_DAYS.dayMapping] as FestivalDay) || (FESTIVAL_DAYS.defaultDay as FestivalDay);
  }
  
  // Si c'est un objet avec un Title (format NocoDB)
  if (typeof day === 'object' && day !== null) {
    if ('Title' in day && day.Title) {
      return normalizeDay(day.Title);
    }
    return FESTIVAL_DAYS.defaultDay as FestivalDay;
  }
  
  // Si c'est une chaîne
  const dayStr = String(day).trim().toLowerCase();
  
  if (dayStr.includes('trois') || dayStr.includes('all') || dayStr === '0') {
    return 'Les trois jours';
  } else if (dayStr.includes('mercredi') || dayStr === '1') {
    return 'Mercredi';
  } else if (dayStr.includes('jeudi') || dayStr === '2') {
    return 'Jeudi';
  } else if (dayStr.includes('vendredi') || dayStr === '3') {
    return 'Vendredi';
  }
  
  return FESTIVAL_DAYS.defaultDay as FestivalDay;
}

/**
 * Obtient l'image par défaut pour un type d'événement
 * @param type Type d'événement
 * @returns URL de l'image par défaut
 */
export function getDefaultImageForType(type: EventType): string {
  return EVENT_TYPES.defaultImages[type] || EVENT_TYPES.defaultImages['Conférences'];
}

/**
 * Obtient l'icône pour un type d'événement
 * @param type Type d'événement
 * @returns Nom de l'icône
 */
export function getIconForType(type: EventType): string {
  return EVENT_TYPES.icons[type] || EVENT_TYPES.icons['Conférences'];
}

/**
 * Obtient les couleurs pour un type d'événement
 * @param type Type d'événement
 * @returns Objet contenant les couleurs
 */
export function getColorsForType(type: EventType): { bg: string; text: string; border: string } {
  return EVENT_TYPES.colors[type] || EVENT_TYPES.colors['Conférences'];
} 