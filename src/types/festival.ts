export type FestivalDay = 'Mercredi' | 'Jeudi' | 'Vendredi';
export type EventType = 'Conférences' | 'Ateliers' | 'Stands';

export interface Event {
  id: string;
  title: string;
  description: string;
  type: EventType;
  day: FestivalDay;
  time: string;
  location: string;
  speaker: string;
  organization: string;
  image: string | null;
  speakerImage: string | null;
  tags: string[];
  target?: string;
  level?: string;
  teachingType?: string;
  url?: string;
  contact?: {
    email: string;
    phone: string;
  };
}

export interface EventsByDay {
  [day: string]: Event[];
} 