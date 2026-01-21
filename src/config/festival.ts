/**
 * Configuration centrale du festival
 * Ce fichier regroupe toutes les constantes et configurations importantes
 * pour l'application du festival.
 */

import { events as eventsRecord } from '~/data/festival/index';
import festivalContent from '~/content/festival/tina/index.json';

// Type pour les dates du festival depuis Tina (simplifié - dayNumber supprimé)
interface FestivalDateEntry {
  date: string;
}

// Utilitaire de formatage centralisé (timezone-safe)
function formatFestivalDate(isoDate: string) {
  const date = new Date(isoDate);
  const options = { timeZone: 'Europe/Brussels' } as const;
  const dayName = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', ...options }).format(date);
  const displayDate = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', ...options }).format(date);

  return {
    dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
    displayDate
  };
}

// Construire la config des jours depuis Tina avec fallback défensif
const buildDayConfig = () => {
  const dates = (festivalContent as { festivalDates?: FestivalDateEntry[] }).festivalDates || [];
  const dayDates: Record<string, string> = {};
  const days: string[] = [];

  if (dates.length === 0) {
    // Fallback défensif - ne jamais casser le build
    console.warn('[festival.ts] festivalDates manquant dans Tina, utilisation des valeurs par défaut');
    return {
      days: ['Mercredi', 'Jeudi', 'Vendredi'] as const,
      dayDates: { 'Mercredi': '30/09', 'Jeudi': '01/10', 'Vendredi': '02/10' }
    };
  }

  dates.forEach((d) => {
    const { dayName, displayDate } = formatFestivalDate(d.date);
    days.push(dayName);
    dayDates[dayName] = displayDate;
  });

  return { days: days as unknown as readonly ['Mercredi', 'Jeudi', 'Vendredi'], dayDates };
};

const { days: festivalDays, dayDates: festivalDayDates } = buildDayConfig();

// Mode test pour le développement
export const TEST_MODE = false;

// Transformer l'objet events en tableau plat pour les tests
export const events = Object.values(eventsRecord).flat();

// Jours du festival (dynamique depuis TinaCMS)
export const FESTIVAL_DAYS = {
  // Jours du festival (ordre chronologique) - calculés depuis TinaCMS
  days: festivalDays,

  // Mapping des valeurs numériques vers les jours (utilisé dans la conversion des données NocoDB)
  // Note: Ce mapping reste stable car NocoDB stocke des IDs numériques, pas des dates
  dayMapping: {
    0: 'Les trois jours',
    1: festivalDays[0] || 'Mercredi',
    2: festivalDays[1] || 'Jeudi',
    3: festivalDays[2] || 'Vendredi'
  },

  // Dates associées à chaque jour - calculées depuis TinaCMS
  dayDates: festivalDayDates,

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

// Configuration par défaut pour le composant DayFilter (dynamique depuis TinaCMS)
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
  // Générer les jours dynamiquement depuis TinaCMS
  days: festivalDays.map((name) => ({
    name,
    date: festivalDayDates[name] || ''
  })),
  eventTypes: [
    { name: 'Conférences', icon: 'tabler:presentation' },
    { name: 'Ateliers', icon: 'tabler:tool' },
    { name: 'Stands', icon: 'tabler:building-store' }
  ]
};

// Calculer l'année de l'édition depuis la première date du festival
const computeEditionYear = (): number => {
  const dates = (festivalContent as { festivalDates?: FestivalDateEntry[] }).festivalDates || [];
  if (dates.length > 0 && dates[0]?.date) {
    return new Date(dates[0].date).getFullYear();
  }
  return 2026; // Fallback défensif
};
const editionYear = computeEditionYear();

// Configuration complète du festival (dynamique depuis TinaCMS)
export const FESTIVAL_CONFIG = {
  // Informations générales
  name: 'Festival Out of the Books',
  edition: String(editionYear),
  dates: (festivalContent as { hero?: { date?: string } }).hero?.date || `30 septembre - 2 octobre ${editionYear}`,
  location: 'La Sucrerie - Wavre, Belgique',
  
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