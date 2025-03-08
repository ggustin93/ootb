# Structure du projet Festival Out of the Books

Ce document explique l'organisation des fichiers liés au festival dans le projet.

## Organisation des fichiers

### Configuration et types

- `src/config/festival.ts` : Configuration centrale du festival
  - Définit les constantes, types et fonctions utilitaires
  - Contient les données de test pour le développement
  - Définit les jours, types d'événements et leurs propriétés

- `src/types/festival.ts` : Définition des types pour le festival
  - Contient l'interface `Event` utilisée dans toute l'application

### Données

- `src/data/festival/index.ts` : Données de test pour le festival
  - Contient des événements fictifs pour le développement
  - Organisés par jour (Mercredi, Jeudi, Vendredi)

### Services

- `src/services/events.ts` : Service de gestion des événements
  - Récupère les événements depuis l'API ou les données de test
  - Organise les événements par jour
  - Fournit des fonctions utilitaires pour les événements

- `src/services/api/nocodb.ts` : Service d'accès à l'API NocoDB
  - Gère les requêtes vers l'API NocoDB
  - Convertit les données de l'API en objets Event

### Composants UI

- `src/components/ui/DayFilter.astro` : Composant de filtrage par jour
  - Permet de filtrer les événements par jour et par type
  - Gère la pagination des événements

- `src/components/ui/EventCard.astro` : Carte d'événement
  - Affiche les détails d'un événement
  - Gère différents types d'événements (Conférences, Ateliers, Stands)

## Flux de données

1. Les événements sont récupérés via `fetchAllEvents()` dans `services/events.ts`
2. En mode test, les événements fictifs de `config/festival.ts` sont utilisés
3. Les événements sont organisés par jour avec `organizeEventsByDay()`
4. Le composant `DayFilter.astro` affiche les événements avec pagination
5. Chaque événement est rendu avec le composant `EventCard.astro`

## Bonnes pratiques

- Utiliser les types définis dans `types/festival.ts`
- Centraliser les configurations dans `config/festival.ts`
- Utiliser les services pour accéder aux données
- Éviter les duplications de code et de configuration 