# 🎓 Out of the Books Website

A collaborative platform dedicated to educational innovation in French-speaking Belgium, built with Astro and Tailwind CSS.

## 🌟 About

Out of the Books ASBL (non-profit organization) brings together teachers, experts, and education enthusiasts to transform education in French-speaking Belgium. Our mission is to build bridges between all education stakeholders and promote pedagogical innovation.

### Key Features

- ✅ Fully responsive design optimized for all devices
- ✅ Built with Astro 5.0 and Tailwind CSS
- ✅ Dark mode support
- ✅ SEO-friendly with Open Graph tags
- ✅ High performance and accessibility scores
- ✅ Image optimization using Astro Assets

## 🚀 Main Sections

- **About Us**: Our vision, mission, and values
- **Team**: Meet our dedicated team members
- **Events**: Upcoming educational events and workshops
- **Resources**: Educational tools and materials
- **Blog**: Latest news and pedagogical insights

## 💻 Tech Stack

- **Framework**: [Astro](https://astro.build/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **CMS**: [Tina CMS](https://tina.io/) for content management
- **Deployment & Hosting**: [Netlify](https://netlify.com)
- **Icons**: [Tabler Icons](https://tabler-icons.io/)
- **Media Storage**: Cloudinary integration via Tina CMS
- **Version Control**: GitHub with automated deployments

## 🏗️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Environment Variables Configuration

To ensure all features work correctly, you need to configure the following environment variables:

### Brevo API (Newsletter)

To connect the newsletter form to Brevo:

```bash
# Brevo API key for newsletter subscriptions
BREVO_API_KEY=your_brevo_api_key
```

#### How to obtain a Brevo API key
1. Log in to your Brevo account
2. Go to SMTP & API > API Keys > Generate a new API key
3. Copy the generated key

#### Configuration on Netlify
1. Go to Netlify dashboard > Site > Settings > Environment variables
2. Add a variable named `BREVO_API_KEY` with your Brevo API key

> **Important note**: With this configuration, you do **NOT** need n8n. The integrated API sends data directly to Brevo.

### n8n Variables (OPTIONAL)

n8n is a workflow automation tool that supports HTTP requests and can be used as an intermediary for form processing. While the direct Brevo API integration is simpler and recommended, you may choose to use n8n for more complex automation workflows:

```bash
# n8n webhook URL for forms
PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/...
```

#### Configuration on Netlify
1. Go to Netlify dashboard > Site > Settings > Environment variables
2. Add a variable named `PUBLIC_N8N_WEBHOOK_URL` with your n8n webhook URL

### Local Development Variables

For local development, create a `.env` file at the project root with the necessary variables:

```bash
# Brevo API key (recommended)
BREVO_API_KEY=your_brevo_api_key

# n8n webhook URL (optional - not recommended)
PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/...
```

**Important**: Make sure the `.env` file is included in your `.gitignore` to avoid exposing your API keys.

## 🙏 Credits

This website was developed by [Guillaume Gustin](https://pwablo.be) using **AstroWind** as a starting template. While AstroWind provided the initial foundation, the website has been extensively customized and rebuilt to meet Out of the Books' specific needs, including custom components, unique design elements, and specialized features for educational content management.

### About AstroWind

AstroWind is a free and open-source template originally created by [onWidget](https://onwidget.com) and maintained by a community of [contributors](https://github.com/onwidget/astrowind/graphs/contributors). It was the most starred & forked Astro theme in 2022 & 2023.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE.md) file for details.

## Processus de build

### Génération des données statiques

Le projet utilise un processus de build en deux étapes :

1. **Génération des données statiques** : Le script `src/scripts/build-data.js` est exécuté avant le build Astro pour :
   - Récupérer les données depuis l'API NocoDB
   - Télécharger et optimiser les images des événements
   - Générer un fichier JSON statique dans `src/content/festival/events.json`

2. **Build Astro** : Astro utilise les données statiques générées pour construire le site.

Ce processus permet :
- Une meilleure performance (pas de requêtes API au runtime)
- Une fiabilité accrue (pas de dépendance à l'API en production)
- Une optimisation des images (redimensionnement, conversion en WebP)

### Commandes

```bash
# Exécuter uniquement la génération des données
node src/scripts/build-data.js

# Build complet (génération des données + build Astro)
npm run build
```

# Out of the Books - Festival

Ce projet est le site web du festival Out of the Books, développé avec Astro et TailwindCSS.

## Architecture des données

Le site utilise une architecture statique pour les données du festival, ce qui permet d'optimiser les performances et la fiabilité. Voici comment les données sont gérées :

### Génération des données statiques

1. **Source des données** : Les données proviennent de NocoDB (stands, ateliers, conférences)
2. **Processus de génération** : Un script Node.js (`src/scripts/build-data.js`) récupère les données et génère des fichiers JSON statiques
3. **Stockage** : Les fichiers JSON sont stockés dans `src/content/festival/`

### Fichiers JSON générés

- `events.json` : Tous les événements organisés par jour
- `stands.json` : Liste des stands uniquement
- `ateliers.json` : Liste des ateliers uniquement
- `conferences.json` : Liste des conférences uniquement

### Tri des événements

Les événements sont triés selon une logique précise dans la fonction `compareEvents` du script `build-data.js` :

1. **Priorité par type** : Les stands sont toujours placés après les ateliers et conférences
2. **Priorité par heure** : 
   - Les événements avec une heure définie (ex: "10:00") apparaissent en premier, triés chronologiquement
   - Les événements marqués "À définir" apparaissent ensuite
   - Les stands marqués "Tous les jours" apparaissent en dernier
3. **Priorité par catégorie** : À heure égale, les conférences sont affichées avant les ateliers

Cette logique de tri est appliquée lors de la génération des données et ne nécessite pas de tri supplémentaire côté client, ce qui améliore les performances du site, particulièrement avec un grand nombre d'événements.

> **Optimisation importante** : La fonction de tri a été déplacée du composant `DayFilter.astro` vers le script de pré-build `build-data.js`. Cette modification permet d'éviter un tri redondant côté client, réduisant ainsi la charge de travail du navigateur et améliorant significativement les performances, surtout sur les appareils mobiles.

## Commandes disponibles

```bash
# Récupérer les données depuis NocoDB et générer les fichiers JSON
npm run build:events

# Récupérer uniquement les données sans traitement d'images
npm run fetch:events

# Tester la génération des données d'événements
npm run test:events
```

## Script de génération des données

Le script `build-data.js` est responsable de la récupération et du traitement des données du festival. Voici ses principales fonctionnalités :

### Fonctionnalités principales

1. **Récupération des données** : Connexion à l'API NocoDB pour récupérer les stands, ateliers et conférences
2. **Conversion en événements** : Transformation des données brutes en format unifié d'événements
3. **Traitement des images** : Téléchargement, optimisation et stockage des images des événements et des conférenciers
4. **Organisation par jour** : Regroupement des événements par jour pour faciliter l'affichage
5. **Génération de JSON** : Création de fichiers JSON statiques pour l'utilisation dans le site

### Options du script

- `--reset` : Réinitialise les fichiers JSON avant de générer de nouvelles données
- `--fetch-only` : Récupère uniquement les données sans traiter les images
- `--no-images` : Génère les données sans télécharger ni traiter les images

### Traitement des images

Le script télécharge et optimise automatiquement les images :
- Redimensionnement à 400px max pour les grandes images
- Création de thumbnails de 200px pour les affichages mobiles
- Fond blanc pour les images avec transparence
- Traitement spécial pour les images des conférenciers (cadrage optimisé pour les visages)
- Stockage dans `public/assets/images/events/` et `src/assets/images/events/`

## État du projet

Le script de pré-build des données est désormais pleinement opérationnel et optimisé. Les principales améliorations incluent :

1. **Tri optimisé des événements** : Implémentation d'une logique de tri robuste dans le script de pré-build, éliminant le besoin de tri côté client
2. **Gestion efficace des images** : Téléchargement, optimisation et mise en cache automatiques des images
3. **Performances améliorées** : Réduction significative du temps de chargement et de la consommation de ressources côté client
4. **Fiabilité accrue** : Meilleure gestion des erreurs et des cas particuliers (données manquantes, formats d'images non supportés)

Ces optimisations permettent au site de gérer efficacement un grand nombre d'événements tout en maintenant d'excellentes performances, même sur des appareils à faibles ressources.

## Structure des composants

Les principaux composants pour l'affichage des événements sont :

- `src/pages/festival.astro` : Page principale du festival
- `src/components/festival/EventsByDay.astro` : Affichage des événements par jour
- `src/components/ui/EventCard.astro` : Carte d'événement individuelle

## Workflow de développement

1. Modifier les données dans NocoDB
2. Exécuter `npm run build:events` pour générer les fichiers JSON
3. Les modifications sont automatiquement reflétées dans le site

## Maintenance

Pour mettre à jour les données du festival :
1. Mettre à jour les entrées dans NocoDB
2. Exécuter `npm run build:events --reset` pour régénérer complètement les données
3. Vérifier que les images sont correctement téléchargées et optimisées
4. Construire le site avec `npm run build`

# Fiches pédagogiques

## Génération des fiches pédagogiques

Le site utilise un script de génération automatique des fiches pédagogiques à partir des données NocoDB. Ce processus permet de :
- Récupérer les fiches pédagogiques depuis la base de données NocoDB
- Convertir ces fiches au format MDX pour l'affichage sur le site
- Générer des fichiers statiques pour une performance optimale

### Fonctionnalités principales

1. **Vérification intelligente des modifications** : Le script ne régénère les fichiers MDX que si des modifications ont été détectées dans les données
2. **Comparaison automatique** : Comparaison des données récupérées avec les données précédentes pour éviter les générations inutiles
3. **Optimisation de la performance** : Réduction des temps de build en évitant les régénérations redondantes
4. **Sauvegarde des données brutes** : Conservation des données JSON pour référence et comparaisons futures

### Processus de génération

Le script `build-fiches-pedagogiques.js` suit les étapes suivantes :
1. Récupération des fiches pédagogiques depuis l'API NocoDB
2. Vérification des modifications par rapport aux données précédemment sauvegardées
3. Sauvegarde des nouvelles données brutes pour référence future
4. Si des modifications sont détectées :
   - Nettoyage du répertoire des fiches
   - Conversion des fiches au format MDX
   - Sauvegarde des fiches en fichiers MDX
5. Si aucune modification n'est détectée, aucune action n'est effectuée

### Commandes

```bash
# Générer les fiches pédagogiques
node src/scripts/build-fiches-pedagogiques.js

# Build complet (incluant les fiches pédagogiques)
npm run build
```

### Configuration

Le script utilise les variables d'environnement suivantes pour se connecter à NocoDB :
- `NOCODB_BASE_URL` : URL de base de l'API NocoDB
- `NOCODB_API_TOKEN` : Token d'API pour NocoDB
- `NOCODB_ORG_ID` : ID de l'organisation dans NocoDB
- `NOCODB_PROJECT_ID` : ID du projet dans NocoDB
- `NOCODB_BASE_ID` : ID de la base dans NocoDB
- `NOCODB_TABLE_ID` : ID de la table des fiches pédagogiques

Ces variables peuvent être définies dans un fichier `.env` à la racine du projet pour le développement local.

## Maintenance des fiches pédagogiques

Pour mettre à jour les fiches pédagogiques :
1. Mettre à jour les entrées dans NocoDB
2. Exécuter `node src/scripts/build-fiches-pedagogiques.js` pour générer les fiches
3. Les modifications seront automatiquement détectées et les fiches seront régénérées uniquement si nécessaire
4. Construire le site avec `npm run build`

### Conseils d'optimisation

- Effectuez des mises à jour par lots dans NocoDB plutôt que des modifications individuelles fréquentes
- Utilisez le script dans le cadre du processus de build plutôt que manuellement pour maintenir la cohérence
- Vérifiez les messages du script pour vous assurer que les fiches ont été correctement générées

## Dépendances

- Node.js pour l'exécution du script
- Sharp pour le traitement des images
- Fetch pour les requêtes API
- fs-extra pour la manipulation de fichiers
