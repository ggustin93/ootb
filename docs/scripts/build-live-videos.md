# Build Live Videos

Script `src/scripts/build-live-videos.js` : génère des fichiers MDX depuis des vidéos/playlists YouTube.

## Prérequis

- Node.js v14+
- `yt-dlp` installé (`brew install yt-dlp` / `pip install yt-dlp`)
- Dépendances : `dotenv`, `slugify`

## Configuration

```bash
# .env
YOUTUBE_PLAYLIST_ID=PLxxxxxxxx
```

## Utilisation

```bash
node src/scripts/build-live-videos.js
```

## Sortie

Fichiers MDX dans `src/content/post/3_LIVES/` :

```yaml
---
expert: Nom de l'expert
published: true
title: 'Titre de la vidéo'
publishDate: 2023-01-01T00:00:00.000Z
category: live
tags: [tag1, live, education]
image: 'https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg'
duration: 1h30
media:
  type: youtube
  videoUrl: 'https://www.youtube.com/watch?v=VIDEO_ID'
---
```

## Fonctionnalités

- Extraction auto des métadonnées (titre, description, durée, miniature)
- Détection de l'expert depuis le titre ("avec [Nom]", "par [Nom]")
- Gestion des doublons (suffixe temporel)
- Cache des données brutes (skip si pas de modifications)
- Traitement de playlists complètes

## Dépannage

- **yt-dlp non trouvé** : vérifier installation et PATH
- **Erreur playlist** : vérifier ID dans `.env`, playlist publique/non répertoriée
- **Erreur vidéo** : vidéo privée/supprimée, mettre à jour yt-dlp (`pip install -U yt-dlp`)
