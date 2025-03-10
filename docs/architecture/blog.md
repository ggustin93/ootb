# Guide du Blog Out of the Books

Ce document explique la structure, l'architecture et les fonctionnalités du blog Out of the Books.

## Structure des articles

Chaque article (post) doit être créé dans le dossier `src/content/post` au format MDX ou MD.

### Format du Frontmatter

```yaml
---
title: "Titre de l'article"
description: "Description détaillée de l'article (sera utilisée pour les meta et les aperçus)"
publishDate: 2024-03-21  # Format YYYY-MM-DD
published: true         # true pour publier, false pour masquer
category: live          # Une des catégories autorisées
image: "URL de l'image principale"
videoUrl: "URL YouTube" # Optionnel, format: https://youtu.be/XXXX
tags:                   # Liste des tags
  - tag1
  - tag2
expert: "Nom Expert"    # Optionnel, nom de l'expert/auteur
duration: "1h30"       # Optionnel, durée du contenu
metadata:              # Optionnel, pour le SEO
  title: "Titre SEO personnalisé"
  description: "Description SEO personnalisée"
  robots:
    index: true
    follow: true
---
```

### Catégories Disponibles

- `actualite` : Actualités de l'éducation
- `fiche` : Fiches pédagogiques
- `live` : Lives Facebook
- `podcast` : Podcasts
- `tv` : Émissions TV
- `premium` : Contenus Premium

Chaque catégorie a son propre style et icône définis dans `src/config/content-types.ts`.

### Médias

#### Images
- Formats recommandés : AVIF, WebP (avec fallback JPG/PNG)
- Sources approuvées : Unsplash, Pexels, Freepik
- Ratio recommandé : 16:9
- Tailles : [400, 900] pixels

**Note pour les Lives Facebook** : Si aucune image personnalisée n'est fournie (`image`) mais qu'une URL YouTube est présente (`videoUrl`), la miniature officielle de la vidéo YouTube sera automatiquement utilisée comme image principale.

#### Vidéos
- Hébergement sur YouTube uniquement
- Format d'URL accepté : `https://youtu.be/XXXX` ou `https://www.youtube.com/watch?v=XXXX`
- Intégration automatique avec le bon ratio et les contrôles
- Miniatures haute qualité disponibles automatiquement

### Bonnes Pratiques

1. **Structure du contenu**
   - Utilisez les titres de manière hiérarchique (h2, h3, h4)
   - Incluez une introduction claire
   - Structurez le contenu en sections logiques

2. **SEO**
   - Remplissez toujours la description
   - Utilisez des tags pertinents
   - Optimisez les titres des images (alt text)

3. **Métadonnées**
   - Le champ `title` doit être concis et accrocheur
   - La `description` doit résumer le contenu en 2-3 phrases
   - Les `tags` doivent être cohérents avec le contenu

4. **Médias**
   - Optimisez les images avant l'upload
   - Vérifiez que les vidéos YouTube sont publiques ou non listées
   - Respectez les droits d'auteur des médias

## Architecture Technique

### Système de Types et Configuration

Le blog utilise une architecture TypeScript stricte avec trois fichiers clés :

#### 1. Types Principaux (`src/types.ts`)
```typescript
// Types de base pour tout le blog
export type PostCategory = 'actualite' | 'fiche' | 'live' | 'podcast' | 'tv' | 'premium';

export interface Post {
  // Métadonnées essentielles
  id: string;
  title: string;
  description: string;
  // ... autres propriétés
}
```
- Définit les interfaces et types principaux
- Source unique de vérité pour le typage
- Utilisé par les composants et fonctions

#### 2. Validation du Contenu (`src/content/config.ts`)
```typescript
const post = defineCollection({
  schema: z.object({
    title: z.string(),
    category: z.enum(['actualite', 'fiche', 'live', 'podcast', 'tv', 'premium']),
    // ... validation
  })
});
```
- Utilise Zod pour la validation des données
- Assure l'intégrité des fichiers MDX/MD
- Définit les champs requis et optionnels

#### 3. Configuration UI (`src/config/content-types.ts`)
```typescript
export const CONTENT_TYPES = {
  actualite: {
    label: 'ACTUALITÉ',
    color: '#4B5563',
    icon: 'tabler:news',
    badgeClass: 'bg-gray-600'
  },
  // ... autres types
};
```
- Configure l'apparence de chaque type de contenu
- Définit les styles, icônes et labels
- Utilisé par les composants d'interface

### Bonnes Pratiques

1. **Modification des Types**
   - Toujours mettre à jour `types.ts` en premier
   - Synchroniser les changements avec `config.ts`
   - Adapter la configuration UI si nécessaire

2. **Ajout de Contenu**
   - Vérifier la conformité avec le schéma Zod
   - Utiliser les types disponibles dans `PostCategory`
   - Respecter la structure du frontmatter

3. **Développement de Composants**
   - Importer les types depuis `~/types`
   - Utiliser les configurations UI depuis `~/config/content-types`
   - Suivre le typage strict TypeScript

### Workflow de Développement

1. **Création d'un Nouveau Type de Contenu**
   ```typescript
   // 1. Ajouter le type dans src/types.ts
   export type PostCategory = 'actualite' | 'fiche' | 'nouveau-type';

   // 2. Mettre à jour la validation dans src/content/config.ts
   category: z.enum(['actualite', 'fiche', 'nouveau-type'])

   // 3. Ajouter la configuration UI dans src/config/content-types.ts
   nouveau-type: {
     label: 'NOUVEAU TYPE',
     color: '#HEXCODE',
     icon: 'tabler:icon-name'
   }
   ```

2. **Modification d'un Type Existant**
   - Mettre à jour les interfaces dans `types.ts`
   - Adapter le schéma de validation si nécessaire
   - Vérifier la rétrocompatibilité

3. **Tests et Validation**
   - Vérifier la compilation TypeScript
   - Tester la validation du contenu
   - Contrôler le rendu UI

## Développement

### Types et Validation

Le système utilise un typage strict avec TypeScript et une validation via Zod :
- Les types sont définis dans `src/types.ts`
- Le schéma de validation est dans `src/content/config.ts`
- La transformation des données est gérée dans `src/utils/blog.ts`

### Composants Disponibles

- `<VideoPlayer url="..." />` : Pour intégrer une vidéo
- `<CalloutBox type="info|warning|tip" title="...">` : Pour les encadrés d'information
- Autres composants MDX disponibles dans `src/components/mdx/`

## Workflow de Publication

1. Créez le fichier MDX dans `src/content/post/`
2. Remplissez le frontmatter avec les champs requis
3. Écrivez le contenu en utilisant le Markdown et les composants disponibles
4. Mettez `published: true` quand le contenu est prêt
5. Commitez avec le format : `feat(content): add [titre-court]` 