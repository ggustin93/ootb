# Composant DayFilter : Documentation Technique

Le composant `DayFilter.astro` est un élément central de l'interface utilisateur du festival, permettant le filtrage et l'affichage des événements. Ce document explique son fonctionnement technique et son intégration dans le flux de données du festival.

## Structure et fonctionnalités

`DayFilter.astro` est composé de trois parties principales :

1. **Frontmatter** : Calculs côté serveur lors du build
2. **Template** : Structure HTML/Astro avec interface responsive
3. **Client-side JavaScript** : Gestion des interactions et du filtrage dynamique

## Flux de données

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ services/events │     │ DayFilter.astro │     │ EventCard.astro │
│   fetchEvents   │ ──► │  Filtrage/tri   │ ──► │  Affichage des  │
│   organizeBy    │     │   Pagination    │     │    événements   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Entrée de données

Le composant reçoit une propriété `events` de type `EventsByDay`, un objet dont les clés sont les jours du festival et les valeurs sont des tableaux d'événements.

```typescript
interface Props {
  events: EventsByDay;
}
```

### Traitement côté serveur

Lors du build, le frontmatter exécute ces opérations :

1. **Calcul du nombre total d'événements** : `allEvents.length`
2. **Comptage par type** : Conférences, Ateliers, Stands
3. **Préparation des données de pagination** : `ITEMS_PER_PAGE = 10`

### Interfaces utilisateur

Le composant propose deux interfaces responsive :

#### Version mobile
- Menus déroulants pour les filtres de jour et de type
- Navigation de pagination simplifiée en bas de page

#### Version desktop 
- Boutons pour chaque jour du festival
- Boutons pour chaque type d'événement
- Navigation de pagination en haut et en bas de la liste

## Système de filtrage côté client

### État interne

Le JavaScript côté client gère plusieurs états :

```javascript
let currentPage = 1;                 // Page actuelle
let filteredEvents = [];             // Événements filtrés selon les critères
let activeDays = [];                 // Jours sélectionnés
let activeTypes = [];                // Types d'événements sélectionnés
let isAllDaysActive = true;          // État du bouton "Tous les jours"
let isAllTypesActive = true;         // État du bouton "Tous les types"
let showDrafts = false;              // Afficher ou non les événements en attente de validation
```

### Fonctions principales

1. **`sortEventsByTime()`** : Trie les événements chronologiquement avec règles de priorité
   - Les stands sont toujours en dernier
   - Les événements avec heure définie passent avant ceux "À définir"
   - Trie par heure pour les événements avec horaires définis

2. **`updatePagination()`** : Fonction centrale qui :
   - Applique les filtres de jour et de type
   - Calcule le nombre total de pages et met à jour les compteurs
   - Gère l'activation/désactivation des boutons de pagination
   - Affiche uniquement les événements de la page courante

3. **`updateActiveFiltersTitle()`** : Met à jour le titre en fonction des filtres actifs

4. **`updateEventCounts()`** : Met à jour les compteurs d'événements dans les badges

5. **`initializeFilters()`** : Initialise les filtres au chargement de la page

6. **`attachEventListeners()`** : Attache les écouteurs d'événements aux éléments d'interface

### Algorithme de filtrage

```javascript
filteredEvents = events.filter(event => {
  const eventType = event.getAttribute('data-type');
  const eventDay = event.getAttribute('data-day');
  const eventStatus = event.getAttribute('data-status');
  
  // Filtrer par statut (n'afficher que les événements publiés par défaut)
  const statusMatch = showDrafts || eventStatus !== 'A valider';
  
  // Logique de filtrage par type et jour
  const typeMatch = isAllTypesActive || (eventType && activeTypes.includes(eventType));
  const dayMatch = isAllDaysActive || (eventDay && activeDays.some(day => 
    normalizeDay(day) === normalizeDay(eventDay)
  ));
  
  return dayMatch && typeMatch && statusMatch;
});
```

## Intégration avec EventCard

Chaque événement filtré est affiché via un composant `EventCard.astro` qui reçoit les données de l'événement :

```astro
<div id="events-container" class="relative space-y-4 md:space-y-6">
  {Object.values(events).flat().map(event => (
    <EventCard event={event} />
  ))}
</div>
```

## Optimisations

1. **Mise en cache du DOM** : Utilisation de `filteredEvents` pour stocker les éléments DOM filtrés
2. **Pagination optimisée** : Affiche uniquement les événements de la page courante
3. **Tri efficace** : Algorithme de tri optimisé pour les différents types d'événements
4. **Gestion responsive** : Interfaces spécifiques pour mobile et desktop

## Interaction avec le build system

Le composant interagit avec le système de build des données du festival :

1. Les données sont générées par `build-festival-data.js`
2. Les événements sont organisés par jour via `organizeEventsByDay()`
3. Les images sont traitées via le système de cache d'images décrit dans `festival.md`

## États visuels et feedback utilisateur

1. **Message "Pas d'événements"** : Affiché si aucun événement ne correspond aux filtres
2. **Badges de comptage** : Affichent le nombre d'événements par type
3. **Titre des filtres actifs** : Indique les filtres sélectionnés (ex: "Conférences - Vendredi")
4. **États des boutons** : Visual feedback pour les filtres actifs/inactifs

## Gestion des erreurs et cas limites

1. **Pas d'événements** : Affichage d'un message personnalisé
2. **Pagination vide** : Reset de la page courante si elle dépasse le total
3. **Désélection de tous les filtres** : Retour automatique à "Tous les jours" ou "Tous les types"

## Initialisation du composant

Le composant s'initialise à deux moments :

```javascript
// Pour la compatibilité avec View Transitions
document.addEventListener('astro:page-load', () => {
  attachEventListeners();
  initializeFilters();
});

// Pour le chargement initial sans ViewTransitions
document.addEventListener('DOMContentLoaded', () => {
  if (!document.body.classList.contains('astro-transition')) {
    attachEventListeners();
    initializeFilters();
  }
});
```

Cette double initialisation assure une compatibilité optimale avec le système de View Transitions d'Astro, permettant des transitions fluides entre les pages tout en maintenant l'état des filtres. 

## Mode administration

Le composant intègre un mode administration accessible via URL pour voir les événements en attente de validation :

1. **Activation** : Ajouter `?admin` ou `?drafts` à l'URL
2. **Bannière d'administration** : Une bannière jaune indique que le mode admin est activé
3. **Événements en attente** : Les événements avec statut "A valider" sont affichés avec une opacité réduite
4. **Indicateur visuel** : Badge "En attente de validation" sur les événements concernés

```javascript
function checkAdminMode() {
  const urlParams = new URLSearchParams(window.location.search);
  showDrafts = urlParams.has('admin') || urlParams.has('drafts');
  
  // Ajouter une bannière d'admin si en mode admin
  if (showDrafts) {
    // Code pour créer et afficher la bannière...
  }
  
  // Mettre à jour la pagination pour appliquer le filtre
  resetPagination();
}
```

## Gestion des attributs supplémentaires

Le composant prend désormais en charge deux attributs supplémentaires :

1. **Statut** : Publié ou À valider (applicable à tous les types d'événements)
   - Les événements "À valider" sont masqués par défaut sauf en mode admin
   - Ils apparaissent avec une opacité réduite et un badge de statut

2. **Thématique** : Pour les stands uniquement
   - Remplace le champ "expert/personne" pour les stands
   - Utilise un affichage approprié avec icône de catégorie

Ces attributs sont extraits des données NocoDB et stockés dans la propriété `events.json` pendant le processus de build. 