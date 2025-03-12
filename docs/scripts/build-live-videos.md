# Documentation du script de génération des fichiers MDX pour les lives YouTube

Ce document explique comment utiliser le script `build-live-videos.js` pour générer automatiquement des fichiers MDX à partir de vidéos YouTube ou de playlists.

## Table des matières

1. [Présentation](#présentation)
2. [Prérequis](#prérequis)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Utilisation](#utilisation)
6. [Structure des fichiers générés](#structure-des-fichiers-générés)
7. [Fonctionnalités](#fonctionnalités)
8. [Dépannage](#dépannage)

## Présentation

Le script `build-live-videos.js` permet de générer automatiquement des fichiers MDX pour les lives YouTube, soit à partir d'une vidéo individuelle, soit à partir d'une playlist complète. Il extrait les métadonnées des vidéos (titre, description, durée, miniature, etc.) et les formate dans un fichier MDX prêt à être utilisé par le site Out of the Books.

Ce script peut être exécuté manuellement ou intégré dans le processus de build du site.

## Prérequis

Pour utiliser ce script, vous aurez besoin de :

- Node.js (v14 ou supérieur)
- npm ou pnpm
- yt-dlp (outil en ligne de commande pour télécharger des vidéos YouTube)

## Installation

1. Assurez-vous que le script est présent dans le répertoire `src/scripts/` de votre projet.

2. Installez les dépendances nécessaires :

```bash
npm install dotenv slugify
# ou
pnpm add dotenv slugify
```

3. Installez yt-dlp :

```bash
# Sur macOS avec Homebrew
brew install yt-dlp

# Sur Linux
sudo apt install yt-dlp

# Avec pip (Python)
pip install yt-dlp

# Avec npm (global)
npm install -g yt-dlp
```

4. Rendez le script exécutable (si nécessaire) :

```bash
chmod +x src/scripts/build-live-videos.js
```

## Configuration

1. Créez ou modifiez votre fichier `.env` à la racine du projet pour ajouter la variable suivante :

```
YOUTUBE_PLAYLIST_ID=PLxxxxxxxx
```

Remplacez `PLxxxxxxxx` par l'ID de votre playlist YouTube. Vous pouvez trouver cet ID dans l'URL de votre playlist (par exemple, dans `https://www.youtube.com/playlist?list=PLxxxxxxxx`).

2. Si vous souhaitez modifier le répertoire de destination des fichiers MDX, vous pouvez éditer la constante `LIVES_DIR` dans le script.

## Utilisation

### Exécution manuelle

Pour exécuter le script manuellement :

```bash
node src/scripts/build-live-videos.js
```

### Intégration au processus de build

Pour intégrer le script au processus de build, ajoutez la commande suivante à votre script de build dans `package.json` :

```json
"scripts": {
  "build": "node src/scripts/build-live-videos.js && astro build",
  "build:lives": "node src/scripts/build-live-videos.js"
}
```

Vous pouvez ensuite exécuter `npm run build` ou `npm run build:lives` selon vos besoins.

## Structure des fichiers générés

Les fichiers MDX générés sont placés dans le répertoire `src/content/post/3_LIVES/` et suivent la structure suivante :

```markdown
---
expert: Nom de l'expert
metadata:
  title: Titre de la vidéo - Out of the Books
  description: >-
    Description courte de la vidéo
  robots:
    index: true
    follow: true
published: true
title: 'Titre de la vidéo'
description: >-
  Description courte de la vidéo
publishDate: 2023-01-01T00:00:00.000Z
category: live
tags:
  - tag1
  - tag2
  - live
  - education
image: 'https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg'
duration: 1h30
media:
  type: youtube
  videoUrl: 'https://www.youtube.com/watch?v=VIDEO_ID'
---

## Titre de la vidéo

Description complète de la vidéo
```

## Fonctionnalités

Le script offre les fonctionnalités suivantes :

- **Extraction automatique des métadonnées** : titre, description, durée, date de publication, miniature, etc.
- **Détection automatique de l'expert** : le script tente de détecter le nom de l'expert à partir du titre de la vidéo (motifs comme "avec [Nom]" ou "par [Nom]").
- **Formatage des tags** : le script extrait les tags de la vidéo et ajoute des tags par défaut comme "live" et "education".
- **Gestion des doublons** : si un fichier avec le même nom existe déjà, un suffixe temporel est ajouté pour éviter les conflits.
- **Mise en cache des données** : les données brutes sont sauvegardées pour éviter de régénérer les fichiers si aucune modification n'a été détectée.
- **Traitement de playlists complètes** : le script peut traiter toutes les vidéos d'une playlist YouTube en une seule exécution.

## Dépannage

### Problèmes courants

1. **yt-dlp n'est pas installé ou n'est pas dans le PATH**

   ```
   ❌ yt-dlp n'est pas installé. Veuillez l'installer avant d'exécuter ce script.
   ```

   Solution : Installez yt-dlp comme indiqué dans la section [Installation](#installation).

2. **Erreur lors de la récupération des vidéos de la playlist**

   ```
   ❌ Erreur lors de la récupération des vidéos de la playlist: ...
   ```

   Solutions possibles :
   - Vérifiez que l'ID de la playlist est correct dans le fichier `.env`.
   - Assurez-vous que la playlist est publique ou non répertoriée.
   - Vérifiez votre connexion Internet.

3. **Erreur lors de la récupération des informations pour une vidéo**

   ```
   ❌ Impossible de récupérer les informations pour https://www.youtube.com/watch?v=...
   ```

   Solutions possibles :
   - La vidéo peut être privée ou supprimée.
   - YouTube peut avoir modifié son API ou sa structure HTML.
   - Mettez à jour yt-dlp à la dernière version : `pip install -U yt-dlp`.

### Personnalisation

Si vous souhaitez personnaliser le format des fichiers MDX générés, vous pouvez modifier la fonction `generateMdxContent` dans le script.

---

Pour toute question ou problème non résolu, veuillez consulter la documentation de [yt-dlp](https://github.com/yt-dlp/yt-dlp) ou ouvrir une issue sur le dépôt du projet. 