# Configuration de la recherche dans TinaCMS

Ce document explique comment activer et configurer la fonctionnalité de recherche dans TinaCMS pour votre site.

## Prérequis

Pour utiliser la fonctionnalité de recherche, vous devez :

1. Avoir un compte TinaCloud (la recherche n'est pas disponible en mode auto-hébergé)
2. Obtenir un token de recherche depuis le tableau de bord TinaCloud

## Étapes pour activer la recherche

### 1. Obtenir un token de recherche

1. Connectez-vous à votre compte TinaCloud
2. Accédez au projet concerné
3. Dans les paramètres du projet, recherchez la section "Search" ou "Recherche"
4. Copiez le token de recherche fourni

### 2. Configurer les variables d'environnement

Ajoutez le token de recherche à vos variables d'environnement :

```bash
# Dans votre fichier .env
TINA_SEARCH_TOKEN=votre_token_de_recherche
```

### 3. Configuration dans le fichier config.ts

La configuration de recherche a déjà été ajoutée au fichier `tina/config.ts` :

```typescript
export default defineConfig({
  // ... autres configurations ...
  
  search: {
    tina: {
      indexerToken: process.env.TINA_SEARCH_TOKEN,
      stopwordLanguages: ['fra', 'eng'], // Français et anglais
    },
    indexBatchSize: 100,
    maxSearchIndexFieldLength: 200,
  },
  
  // ... autres configurations ...
});
```

### 4. Champs indexés pour la recherche

Dans le fichier `postsCollection.js`, les champs suivants ont été configurés pour être indexés par la recherche :

- `published` (état de publication)
- `category` (type de contenu)
- `title` (titre)
- `description` (résumé)
- `publishDate` (date de publication)
- `tags` (mots-clés)
- Champs spécifiques aux fiches pédagogiques
- `body` (contenu principal)

Pour chaque champ, la propriété `searchable: true` a été ajoutée pour l'inclure dans l'index de recherche.

Pour les champs de texte longs, la propriété `maxSearchIndexFieldLength` a été définie pour limiter la quantité de texte indexée.

## Utilisation de la recherche

Une fois configurée, la fonctionnalité de recherche sera automatiquement disponible dans l'interface d'administration TinaCMS. Vous pourrez rechercher du contenu en utilisant la barre de recherche en haut de l'interface.

### Construction de l'index de recherche

- En développement : l'index de recherche est automatiquement créé au démarrage et mis à jour lors des modifications de contenu
- En production : l'index de recherche est automatiquement créé et téléversé vers TinaCloud lors de la construction du site

## Personnalisation supplémentaire

Si vous souhaitez exclure certains champs de l'index de recherche, vous pouvez définir `searchable: false` pour ces champs.

Pour les champs de texte, vous pouvez ajuster la quantité de texte indexée en modifiant la valeur de `maxSearchIndexFieldLength`.

## Remarques importantes

- Chaque branche Git de votre site possède un index de recherche distinct
- L'index de recherche est "en direct" une fois le site construit, donc tout contenu nouvellement ajouté ou supprimé peut être reflété dans l'index de recherche avant que le site ne soit déployé
- La construction de l'index de recherche peut être ignorée en passant l'option `--skip-search-index` à la commande `build` 