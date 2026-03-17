# Guide Blog Out of the Books

## Frontmatter des articles

Fichiers MDX/MD dans `src/content/post/` :

```yaml
---
title: "Titre de l'article"
description: "Description (meta + aperçus)"
publishDate: 2024-03-21
published: true
category: live          # actualite | fiche | live | podcast | tv | premium
image: "URL image"
videoUrl: "https://youtu.be/XXXX"  # Optionnel
tags: [tag1, tag2]
expert: "Nom Expert"    # Optionnel
duration: "1h30"        # Optionnel
metadata:               # Optionnel, SEO
  title: "Titre SEO"
  description: "Description SEO"
---
```

## Catégories

Styles et icônes définis dans `src/config/content-types.ts` :
`actualite`, `fiche`, `live`, `podcast`, `tv`, `premium`

## Médias

- **Images** : AVIF/WebP (fallback JPG/PNG), ratio 16:9, tailles [400, 900]px
- **Lives Facebook** : si pas d'image mais `videoUrl` YouTube, miniature auto
- **Vidéos** : YouTube uniquement (`youtu.be/XXXX` ou `youtube.com/watch?v=XXXX`)

## Architecture technique

3 fichiers clés synchronisés :

1. **`src/types.ts`** : types principaux (`PostCategory`, `Post`)
2. **`src/content/config.ts`** : validation Zod du frontmatter
3. **`src/config/content-types.ts`** : configuration UI (labels, couleurs, icônes)

### Ajout d'un nouveau type de contenu

```typescript
// 1. src/types.ts
export type PostCategory = '...' | 'nouveau-type';

// 2. src/content/config.ts
category: z.enum(['...', 'nouveau-type'])

// 3. src/config/content-types.ts
'nouveau-type': { label: 'NOUVEAU TYPE', shortLabel: 'Nouveau', titlePrefix: 'Nos nouveaux', color: '#HEX', icon: 'tabler:icon', variant: 'default' }
```

## Composants MDX disponibles

- `<Podcast />` (lecteur audio pour les épisodes de podcast)
- `<VideoPlayer />` (lecteur vidéo YouTube intégré)
- `<CalloutBox type="info|warning|tip" title="...">`
- Autres dans `src/components/mdx/`

## Workflow de publication

1. Créer MDX dans `src/content/post/`
2. Remplir frontmatter
3. `published: true` quand prêt
4. Commit : `feat(content): add [titre-court]`
