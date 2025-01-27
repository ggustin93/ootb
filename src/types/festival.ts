export interface Event {
  id: string;
  time: string;
  type: 'Conférences' | 'Ateliers' | 'Stands';
  title: string;
  description: string;
  location: string;
  speaker?: string;
  day: string;
  image?: string;
} 