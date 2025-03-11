# Images des événements

Ce dossier contient les images optimisées pour les événements du festival.

## Structure

Les images sont organisées par type d'événement :
- `/stands` : Images des stands
- `/ateliers` : Images des ateliers
- `/conferences` : Images des conférences

## Utilisation dans Astro

### Option 1 : Balise HTML standard (recommandé)

```astro
---
// Importer les données JSON
import events from '../content/festival/events.json';
---

{events.Mercredi.map(event => (
  <div>
    <h2>{event.title}</h2>
    {event.image && <img src={event.image} alt={event.title} />}
  </div>
))}
```

### Option 2 : Composant Image d'Astro avec URL

```astro
---
// Importer les données JSON et le composant Image
import { Image } from 'astro:assets';
import events from '../content/festival/events.json';
---

{events.Mercredi.map(event => (
  <div>
    <h2>{event.title}</h2>
    {event.image && (
      <Image 
        src={event.image} 
        width={400} 
        height={400} 
        alt={event.title} 
      />
    )}
  </div>
))}
```

### ⚠️ Important

- N'essayez PAS d'importer ces images avec `import` car Astro les traiterait différemment
- Les chemins dans le JSON sont déjà optimisés pour fonctionner en production sur Netlify
- Utilisez toujours les chemins exacts fournis dans le JSON
