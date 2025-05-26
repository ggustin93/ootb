export class EventPagination {
  constructor(itemsPerPage = 10) {
    this.currentPage = 1;
    this.itemsPerPage = itemsPerPage;
    this.filteredEvents = [];
  }

  setEvents(events) {
    this.filteredEvents = events;
  }

  getTotalPages() {
    return Math.max(1, Math.ceil(this.filteredEvents.length / this.itemsPerPage));
  }

  getCurrentPageEvents() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredEvents.length);
    return this.filteredEvents.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      return true;
    }
    return false;
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      return true;
    }
    return false;
  }

  resetPage() {
    this.currentPage = 1;
  }

  updatePaginationUI() {
    const totalPages = this.getTotalPages();
    
    // Update page numbers
    document.querySelectorAll('#current-page, #current-page-mobile, #current-page-bottom').forEach(el => {
      el.textContent = this.currentPage.toString();
    });
    
    document.querySelectorAll('#total-pages, #total-pages-mobile, #total-pages-bottom').forEach(el => {
      el.textContent = totalPages.toString();
    });
    
    // Update button states
    document.querySelectorAll('#prev-page, #prev-page-mobile, #prev-page-bottom').forEach(button => {
      button.disabled = this.currentPage === 1;
    });
    
    document.querySelectorAll('#next-page, #next-page-mobile, #next-page-bottom').forEach(button => {
      button.disabled = this.currentPage === totalPages || this.filteredEvents.length === 0;
    });
  }

  renderEvents() {
    // Masquer tous les événements d'abord
    const allEvents = document.querySelectorAll('.event-card');
    allEvents.forEach(event => {
      event.style.display = 'none';
    });

    // Afficher seulement ceux de la page actuelle
    const pageEvents = this.getCurrentPageEvents();
    
    // Rendu par batch pour éviter les blocages
    let startIndex = 0;
    const renderBatch = () => {
      const batchSize = 3; // Afficher 3 événements à la fois
      const batchEnd = Math.min(startIndex + batchSize, pageEvents.length);
      
      for (let i = startIndex; i < batchEnd; i++) {
        pageEvents[i].style.display = 'block';
      }
      
      startIndex = batchEnd;
      
      if (startIndex < pageEvents.length) {
        requestAnimationFrame(renderBatch);
      }
    };
    
    requestAnimationFrame(renderBatch);
  }
} 