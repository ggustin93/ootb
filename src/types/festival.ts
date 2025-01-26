export interface Event {
  id?: string;
  time: string;
  type: 'Stands' | 'Conferences' | 'Workshops';
  title: string;
  description: string;
  location?: string;
  speaker?: string;
  day: '1' | '2' | '3';
} 