# Architecture Festival Out of the Books

## Organisation des fichiers

### Configuration et types
- `src/config/festival.ts` : constantes, types, fonctions utilitaires, données de test
- `src/types/festival.ts` : interface `Event`

### Données
- `src/data/festival/index.ts` : événements fictifs pour le développement (Mercredi, Jeudi, Vendredi)

### Services
- `src/services/events.ts` : récupération et organisation des événements par jour
- `src/services/api/nocodb.ts` : requêtes API NocoDB, conversion en objets Event

### UI
- `src/components/ui/DayFilter.astro` : filtrage par jour/type, pagination, rendu côté client (classe EventRenderer)

## Flux de données

1. `fetchAllEvents()` récupère les événements (API ou données de test)
2. `organizeEventsByDay()` organise par jour
3. `DayFilter.astro` affiche avec pagination
4. `EventRenderer` gère le rendu côté client

## Optimisations de performances

### Cache images
- Cache par session (`imagesProcessedInSession`) : évite retraitement à chaque navigation
- Cache de chemins résolus (`resolvedImagePathsCache`)
- Téléchargement uniquement au premier accès session

### Traitement images
- Compression WebP adaptative (80% conférenciers, 75% standard)
- Cache URLs, existence fichiers, URLs problématiques
- Nettoyage cache toutes les 5 minutes

### Cache NocoDB
- Cache réponses API (validité configurable, défaut 5min)
- Rafraîchissement auto toutes les 15min
- Détection légère des mises à jour toutes les 3min (comptage éléments)

### Logs

- Nettoyage via `npm run clean` (supprime les fichiers `.log`)
- `npm run clean:logs` pour nettoyage manuel

### Chargement images

- `loading="lazy"`, `decoding="async"`, `fetchpriority="low"`

## API développeur

```typescript
import { getImagePath } from '~/services/imageProcessor';
import { getDefaultImage, getDefaultSpeakerImage } from '~/services/events';
import { forceImageProcessing } from '~/services/events';
import { resetImageProcessingSession } from '~/services/imageProcessor';
```

- `getImagePath()` : chemin image spécifique (avec cache)
- `getDefaultImage(event)` / `getDefaultSpeakerImage(event)` : chemins avec fallback
- `forceImageProcessing()` : forcer retéléchargement (après ajout événements)
- `resetImageProcessingSession()` : réinitialiser flag session
