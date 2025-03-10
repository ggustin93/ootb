# Script de génération des fiches pédagogiques

Ce document décrit le script `build-fiches-pedagogiques.js` utilisé pour générer automatiquement les fiches pédagogiques à partir de NocoDB.

## Fonctionnalités

- Connexion à l'API NocoDB pour récupérer les fiches pédagogiques
- Sauvegarde des données brutes pour analyse (JSON)
- Conversion des données en format MDX compatible avec Astro
- Génération de fichiers avec un nommage incluant l'année d'édition
- Nettoyage automatique du répertoire avant génération

## Processus d'exécution

Le script suit les étapes suivantes :

1. Nettoyage du répertoire des fiches pédagogiques
2. Connexion à l'API NocoDB et récupération des fiches
3. Sauvegarde des données brutes en JSON pour analyse
4. Conversion des données en format MDX
5. Génération des fichiers dans le répertoire `src/content/post/5_FICHES`

## Structure des données

### Données d'entrée (NocoDB)

Les données récupérées de NocoDB contiennent les champs suivants :

- `Id` : Identifiant unique de la fiche
- `Thèmes` : Thèmes associés à la fiche (au format JSON)
- `Title` : Titre de la fiche
- `Nom`, `Prénom`, `Email` : Informations sur le responsable
- `Destinataire` : Public cible de la fiche
- `Objectifs` : Objectifs pédagogiques
- `Ecole` : Établissement scolaire
- `Description` : Description détaillée
- `Competences` : Compétences développées
- `Liens`, `LiensVIDEO` : Ressources complémentaires
- `Déclinaisons`, `Conseils` : Conseils d'utilisation
- `Edition` : Année d'édition (par exemple "2020", "2021", etc.)
- `Type enseignement`, `Section` : Informations sur le niveau

### Données de sortie (MDX)

Les fichiers MDX générés suivent cette structure :

```yaml
---
published: true
title: "Titre de la fiche"
description: "Description courte"
publishDate: 2023-05-15T00:00:00.000Z
category: "fiche"
image: "URL d'une image"
tags: ["année", "thème", "section"]
pedagogicalSheet:
  enseignement: "Type d'enseignement"
  section: "Section"
  responsable:
    prenom: "Prénom"
    nom: "Nom"
    email: "email@example.com"
  description: "Description détaillée"
  destinataire: "Public cible"
  objectifs: ["Objectif 1", "Objectif 2"]
  competences: ["Compétence 1", "Compétence 2"]
  references: [
    {
      "type": "site",
      "url": "https://example.com",
      "description": "Description"
    }
  ]
  declinaisons: "Déclinaisons possibles"
  conseils: "Conseils pratiques"
}
---
```

## Configuration

Le script utilise les variables d'environnement suivantes :

- `NOCODB_BASE_URL` : URL de base de l'API NocoDB
- `NOCODB_API_TOKEN` : Token d'authentification pour l'API
- `NOCODB_ORG_ID` : ID de l'organisation NocoDB
- `NOCODB_PROJECT_ID` : ID du projet NocoDB
- `NOCODB_BASE_ID` : ID de la base NocoDB
- `NOCODB_TABLE_ID` : ID de la table des fiches pédagogiques

## Exécution

Pour exécuter le script manuellement :

```bash
npm run build:fiches
```

Le script est également exécuté automatiquement lors du build du site :

```bash
npm run build
```

## Gestion des erreurs

Le script inclut une gestion des erreurs pour :

- Connexion à NocoDB échouée
- Problèmes de parsing JSON
- Échecs d'écriture de fichiers

## Notes techniques

- Le script gère correctement les chaînes multilignes dans le YAML en utilisant le format bloc (`>-`).
- Les booléens et les dates sont correctement typés pour éviter les erreurs de validation.
- Les champs comme les objectifs et les compétences sont convertis en tableaux en séparant sur les retours à la ligne.
- Les références sont analysées pour détecter automatiquement les URLs et les classer en types "site", "document" ou "video". 