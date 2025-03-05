export type Event = {
  id: string;
  time: string;
  type: 'Conférences' | 'Ateliers' | 'Stands';
  title: string;
  description: string;
  location: string;
  speaker?: string;
  day: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi';
  image?: string;
  url?: string;
  target?: string;
  level?: string;
  teachingType?: string;
}; 