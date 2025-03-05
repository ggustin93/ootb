# Guide de gestion SEO pour Out of the Books

Ce document explique comment gérer les métadonnées SEO du site Out of the Books à travers Tina CMS.

## Configuration globale

Les paramètres SEO globaux sont définis dans le fichier `settings.json` et peuvent être modifiés via la section "⚙️ Paramètres généraux" dans Tina CMS. Ces paramètres s'appliquent à toutes les pages du site par défaut.

### Paramètres globaux disponibles

- **Nom du site** : "Out of the Books"
- **Template de titre** : "%s | Out of the Books" (où %s est remplacé par le titre spécifique de la page)
- **Titre par défaut** : "Out of the Books | Plateforme collaborative pour l'éducation"
- **Description par défaut** : "Out of the Books ASBL : l'éducation et le bien-être de l'enfant au cœur des priorités. Une plateforme collaborative pour transformer l'éducation en Belgique francophone."
- **Langue principale** : "fr"
- **Image sociale par défaut** : Image utilisée pour les partages sociaux

## Métadonnées spécifiques aux pages

Chaque page peut avoir ses propres métadonnées qui surchargent les paramètres globaux. Ces métadonnées sont configurables dans Tina CMS pour chaque page.

### Pages avec métadonnées personnalisables

- **Page d'accueil**
- **À propos** : Présentation de l'équipe et de la mission d'Out of the Books
- **Contact** : Formulaire et informations de contact
- **Blog/Contenus** : Page listant tous les contenus (podcasts, vidéos, fiches, etc.)
- **Appel à projets** : Page de soumission de projets pédagogiques
- **Festival** : Page de présentation du Festival Out of the Books

### Paramètres personnalisables par page

Pour chaque page, vous pouvez personnaliser :

1. **Titre SEO** : Titre spécifique à la page (50-60 caractères recommandés)
   - **Important** : N'incluez PAS "| Out of the Books" dans ce champ, car il sera ajouté automatiquement
   - Exemple : Si vous saisissez "Nos contenus", le titre final sera "Nos contenus | Out of the Books"

2. **Description SEO** : Description spécifique à la page (150-160 caractères recommandés)
   - Cette description apparaît dans les résultats de recherche Google
   - Elle doit résumer clairement le contenu de la page

3. **Image de partage** : Image utilisée lors du partage sur les réseaux sociaux
   - Format recommandé : 1200x630 pixels
   - Cette image apparaîtra lorsque votre page sera partagée sur Facebook, Twitter, etc.

## Valeurs par défaut pour chaque page

Si vous ne spécifiez pas de métadonnées pour une page, les valeurs par défaut suivantes seront utilisées :

### Page À propos
- **Titre** : "À propos"
- **Description** : "Découvrez l'équipe et la mission d'Out of the Books, une ASBL dédiée à l'innovation pédagogique et au bien-être des enfants en Belgique francophone."

### Page Contact
- **Titre** : "Contact"
- **Description** : "Contactez l'équipe d'Out of the Books pour toute question concernant nos événements, nos contenus ou nos partenariats."

### Page Blog/Contenus
- **Titre** : "Nos contenus"
- **Description** : "Découvrez nos podcasts, vidéos pédagogiques, fiches pratiques et contenus premium pour transformer l'éducation"

### Page Appel à projets
- **Titre** : "Appel à projets"
- **Description** : "Partagez votre expérience pédagogique innovante et inspirez vos pairs lors du Festival Out of the Books 2024."

### Page Festival
- **Titre** : "Festival Out of the Books"
- **Description** : "Le Festival Out of the Books est un événement dédié à l'innovation pédagogique avec des conférences, ateliers et rencontres pour repenser l'éducation de demain."

## Bonnes pratiques SEO

1. **Titres** : Incluez des mots-clés pertinents, mais gardez le titre naturel et accrocheur.
2. **Descriptions** : Résumez clairement le contenu de la page et incluez un appel à l'action.
3. **Images** : Utilisez des images de qualité avec un rapport d'aspect 1200x630px pour les partages sociaux.
4. **Cohérence** : Assurez-vous que le titre et la description correspondent au contenu réel de la page.

## Comment modifier les métadonnées

1. Connectez-vous à Tina CMS
2. Naviguez vers la page que vous souhaitez modifier
3. Recherchez la section "Métadonnées SEO"
4. Modifiez les champs selon vos besoins
5. Laissez un champ vide pour utiliser la valeur globale par défaut
6. Enregistrez vos modifications

## Structure technique

Les métadonnées sont stockées dans :
- Fichier de configuration global : `src/content/site/settings.json`
- Fichiers spécifiques aux pages : `src/content/[page-name]/index.json`

Le système utilise ces métadonnées pour générer les balises appropriées dans le `<head>` de chaque page HTML. 