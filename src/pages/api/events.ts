import type { APIRoute } from 'astro';
import { fetchStands, convertStandsToEvents, organizeEventsByDay } from '~/services/api/nocodb';

export const GET: APIRoute = async () => {
  try {
    console.log('API: Récupération des stands depuis NocoDB...');
    const standsData = await fetchStands();
    console.log(`API: ${standsData.list.length} stands récupérés`);
    
    // Convertir les stands en événements
    const events = convertStandsToEvents(standsData.list);
    console.log(`API: ${events.length} événements créés`);
    
    // Organiser les événements par jour
    const eventsByDay = organizeEventsByDay(events);
    console.log(`API: Événements organisés par jour: ${Object.keys(eventsByDay).join(', ')}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          events: events,
          eventsByDay: eventsByDay
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur lors de la récupération des événements'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 