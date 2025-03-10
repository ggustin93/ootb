/**
 * Types pour les événements du festival
 */

export interface Event {
  id: string;
  title: string;
  description: string;
  type: string;
  day: string;
  time: string;
  location: string;
  speaker: string;
  organization: string;
  image: string | null;
  speakerImage: string | null;
  tags: string[];
  website: string;
  contact: {
    email: string;
    phone: string;
  };
}

export type EventsByDay = Record<string, Event[]>; 