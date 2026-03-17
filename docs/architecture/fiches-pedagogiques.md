# Fiches Pédagogiques

Fiches générées automatiquement depuis NocoDB. **Ne pas modifier les fichiers directement** (écrasés au prochain build).

## Processus de génération

Script : `src/scripts/build-fiches-pedagogiques.js`

1. Connexion API NocoDB
2. Récupération des fiches + sauvegarde données brutes (JSON)
3. Détection des modifications (comparaison avec données précédentes)
4. Conversion en MDX si changements détectés
5. Génération dans `src/content/post/5_FICHES/`

## Données NocoDB (entrée)

Champs principaux : `Id`, `Title`, `Thèmes` (JSON), `Nom`/`Prénom`/`Email`, `Destinataire`, `Objectifs`, `Competences`, `Description`, `Ecole`, `Liens`/`LiensVIDEO`, `Déclinaisons`, `Conseils`, `Edition`, `Type enseignement`, `Section`.

## Structure MDX (sortie)

```yaml
---
published: true
title: Titre de la fiche
description: Description courte
publishDate: 2023-05-15T00:00:00.000Z
category: fiche
tags: ["2023-2024", "primaire", "mathématiques"]
pedagogicalSheet:
  enseignement: Ordinaire/Spécialisé
  section: Primaire/Secondaire
  responsable: { prenom, nom, email }
  description: Description détaillée
  destinataire: Public cible
  objectifs: [...]
  competences: [...]
  references: [{ type, url, description }]
  declinaisons: Adaptations possibles
  conseils: Conseils d'implémentation
---
```

## Configuration

Variables d'environnement : `NOCODB_BASE_URL`, `NOCODB_API_TOKEN`, `NOCODB_ORG_ID`, `NOCODB_PROJECT_ID`, `NOCODB_BASE_ID`, `NOCODB_TABLE_ID`.

## Exécution

```bash
node src/scripts/build-fiches-pedagogiques.js  # Manuel
npm run build:fiches                            # Via npm
```

## Notes techniques

- Gestion multilignes YAML via format bloc (`>-`)
- Objectifs/compétences convertis en tableaux (split sur retours ligne)
- Références auto-classées : site, document ou video
- Gestion d'erreurs : connexion NocoDB, parsing JSON, écriture fichiers
