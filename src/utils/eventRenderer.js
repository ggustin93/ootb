export class EventRenderer {
  constructor() {
    this.container = null;
  }

  setContainer(container) {
    this.container = container;
  }

  renderEventCard(eventData) {
    const { event, eventImage } = eventData;
    
    // Créer l'élément principal avec les mêmes classes que EventCard.astro
    const eventCard = document.createElement('div');
    eventCard.className = 'event-card bg-white shadow-lg rounded-xl overflow-hidden flex flex-col md:flex-row group transition-all duration-300 hover:shadow-2xl';
    eventCard.setAttribute('data-type', event.type || '');
    eventCard.setAttribute('data-day', event.day || '');
    eventCard.setAttribute('data-time', event.time || '');

    // Générer un slug à partir du titre pour les liens
    const slug = event.title ? event.title.toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') : '';

    // Image de l'événement (même structure que EventCard.astro)
    let imageHtml = '';
    if (eventImage) {
      imageHtml = `
        <a href="/festival/events/${slug}/" class="block md:w-1/3 relative overflow-hidden group/image">
          <img 
            src="${eventImage}" 
            alt="${event.title || ''}"
            class="w-full h-48 md:h-full object-cover transition-transform duration-500 ease-in-out group-hover/image:scale-105"
            loading="lazy"
            width="400"
            height="225"
          />
        </a>
      `;
    } else {
      imageHtml = `
        <div class="md:w-1/3 bg-gray-100 flex items-center justify-center h-48 md:h-auto">
          <span class="text-gray-400 text-sm">Pas d'image</span>
        </div>
      `;
    }

    // Contenu de la carte (même structure que EventCard.astro)
    const contentHtml = `
      ${imageHtml}
      <div class="p-4 md:p-6 md:w-2/3 flex flex-col justify-between">
        <div>
          <div class="flex flex-wrap items-center gap-2 md:gap-4 text-sm text-gray-500 mb-2 md:mb-3">
            ${event.type ? `<span class="font-medium text-primary-500">${event.type}</span>` : ''}
            ${event.day && event.time && event.time !== 'À définir' ? `
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clip-rule="evenodd"></path>
                </svg>
                ${event.day} - ${event.time}
              </span>
            ` : ''}
          </div>
          
          <h3 class="text-xl md:text-2xl font-bold text-gray-800 mb-2 hover:text-primary-600 leading-tight">
            <a href="/festival/events/${slug}/">${event.title || ''}</a>
          </h3>
          
          ${event.description ? `
            <p class="text-gray-600 text-sm md:text-base line-clamp-3 mb-3 md:mb-4">${event.description}</p>
          ` : ''}
        </div>
        
        <div class="mt-auto">
          <a href="/festival/events/${slug}/" class="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium group/arrow">
            Voir les détails
            <svg class="w-4 h-4 ml-1.5 transition-transform duration-300 ease-in-out group-hover/arrow:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </a>
        </div>
      </div>
    `;

    eventCard.innerHTML = contentHtml;
    return eventCard;
  }

  renderEvents(eventsData) {
    if (!this.container) {
      console.error('Container not set for EventRenderer');
      return;
    }

    // Vider le conteneur
    this.container.innerHTML = '';

    // Rendu par batch pour éviter les blocages
    let startIndex = 0;
    const renderBatch = () => {
      const batchSize = 5; // Rendre 5 événements à la fois
      const batchEnd = Math.min(startIndex + batchSize, eventsData.length);
      
      for (let i = startIndex; i < batchEnd; i++) {
        const eventCard = this.renderEventCard(eventsData[i]);
        this.container.appendChild(eventCard);
      }
      
      startIndex = batchEnd;
      
      if (startIndex < eventsData.length) {
        requestAnimationFrame(renderBatch);
      }
    };
    
    requestAnimationFrame(renderBatch);
  }

  clearContainer() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
} 