import { FestivalDay } from '~/services/events';

export type Event = {
  id: string;
  time: string;
  type: 'Conférences' | 'Ateliers' | 'Stands';
  title: string;
  description: string;
  location: string;
  speaker?: string;
  day: FestivalDay;
  image?: string;
  speakerImage?: string;
  url?: string;
  target?: string;
  level?: string;
  teachingType?: string;
}; 