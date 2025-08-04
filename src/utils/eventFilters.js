export class EventFilters {
  constructor() {
    this.activeDays = [];
    this.activeTypes = [];
    this.isAllDaysActive = true;
    this.isAllTypesActive = true;
  }

  normalizeDay(day) {
    if (!day) return '';
    return day.trim().toLowerCase();
  }

  sortEventsByTime(events) {
    const dayOrder = { 'Mercredi': 1, 'Jeudi': 2, 'Vendredi': 3 };
    
    return [...events].sort((a, b) => {
      const aType = a.getAttribute('data-type');
      const bType = b.getAttribute('data-type');
      
      if (aType === 'Stands' && bType !== 'Stands') return 1;
      if (aType !== 'Stands' && bType === 'Stands') return -1;

      const aDay = a.getAttribute('data-day') || 'Mercredi';
      const bDay = b.getAttribute('data-day') || 'Mercredi';
      
      if (aDay !== bDay) {
        return (dayOrder[aDay] || 0) - (dayOrder[bDay] || 0);
      }

      const aTime = a.getAttribute('data-time') || '';
      const bTime = b.getAttribute('data-time') || '';
      
      if (aTime !== 'À définir' && bTime === 'À définir') return -1;
      if (aTime === 'À définir' && bTime !== 'À définir') return 1;
      
      return aTime.localeCompare(bTime);
    });
  }

  filterEvents() {
    const events = Array.from(document.querySelectorAll('.event-card'));

    return events.filter(event => {
      const eventType = event.getAttribute('data-type');
      const eventDay = event.getAttribute('data-day');
      const eventLocation = event.getAttribute('data-location');

      // Logique pour déterminer si un événement est une démo numérique
      const isDigitalDemo = eventType === 'Ateliers' && eventLocation === 'Village numérique';
      
      let typeMatch = false;
      if (this.isAllTypesActive) {
        typeMatch = true;
      } else {
        // Pour les ateliers, on vérifie s'il s'agit d'une démo numérique
        if (eventType === 'Ateliers') {
          if (this.activeTypes.includes('Ateliers') && !isDigitalDemo) {
            typeMatch = true;
          } else if (this.activeTypes.includes('Démos numériques') && isDigitalDemo) {
            typeMatch = true;
          }
        } else {
          typeMatch = this.activeTypes.includes(eventType);
        }
      }

      let dayMatch = false;
      if (this.isAllDaysActive) {
        dayMatch = true;
      } else {
        if (eventType === 'Stands') {
          dayMatch = this.activeDays.length > 0;
        } else {
          dayMatch = this.activeDays.some(activeDay => 
            this.normalizeDay(activeDay) === this.normalizeDay(eventDay)
          );
        }
      }

      return typeMatch && dayMatch;
    });
  }

  updateEventCounts() {
    // This method would be called with the current events data
    // For now, we'll implement a basic version that updates the badges
    // The actual counting logic should be passed from the main component
    console.log('updateEventCounts called - implement with actual data');
  }

  updateActiveFiltersTitle() {
    const titleElement = document.getElementById('active-filters-title');
    if (!titleElement) return;

    let title = '';
    
    // Helper function to get correct article and agreement for event types
    const getTypeWithArticle = (type) => {
      switch (type) {
        case 'Conférences':
          return 'Toutes les conférences';
        case 'Ateliers':
          return 'Tous les ateliers';
        case 'Démos numériques':
          return 'Toutes les démos numériques';
        case 'Stands':
          return 'Tous les stands';
        default:
          return `Tous les ${type}`;
      }
    };

    if (this.isAllDaysActive && this.isAllTypesActive) {
      title = 'Tous les événements';
    } else if (this.isAllDaysActive && !this.isAllTypesActive) {
      if (this.activeTypes.length === 1) {
        title = getTypeWithArticle(this.activeTypes[0]);
      } else if (this.activeTypes.length >= 3) {
        // Si 3 types ou plus sont sélectionnés, simplifier en "Tous les événements"
        title = 'Tous les événements';
      } else {
        title = `${this.activeTypes.join(' & ')}`;
      }
    } else if (!this.isAllDaysActive && this.isAllTypesActive) {
      if (this.activeDays.length === 1) {
        title = `Événements du ${this.activeDays[0]}`;
      } else if (this.activeDays.length >= 3) {
        // Si 3 jours ou plus sont sélectionnés, simplifier en "Tous les événements"
        title = 'Tous les événements';
      } else {
        title = `Événements - ${this.activeDays.join(' & ')}`;
      }
    } else {
      // Both days and types are filtered
      const dayText = this.activeDays.length === 1 ? this.activeDays[0] : 
                     this.activeDays.length === 3 ? 'tous les jours' : `${this.activeDays.join(' & ')}`;
      const typeText = this.activeTypes.length === 1 ? this.activeTypes[0] : 
                      this.activeTypes.length === 3 ? 'tous types' : `${this.activeTypes.join(' & ')}`;
      
      // Si on a une sélection très large, simplifier
      if ((this.activeDays.length === 3 && this.activeTypes.length >= 2) || 
          (this.activeDays.length >= 2 && this.activeTypes.length === 3)) {
        title = 'Tous les événements';
      } else {
        title = `${typeText} - ${dayText}`;
      }
    }

    titleElement.textContent = title;
  }
} 