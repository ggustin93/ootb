import { useQuery } from '@tanstack/react-query';
import type { Event } from '~/data/festival';

interface EventsResponse {
  [key: string]: Event[];
}

export function useEvents(day: string) {
  return useQuery<EventsResponse>({
    queryKey: ['events', day],
    queryFn: async () => {
      // Simuler un délai de chargement pour la démo
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remplacer par votre vraie API
      const response = await fetch(`/api/events/${day}`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des événements');
      }
      return response.json();
    },
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
} 