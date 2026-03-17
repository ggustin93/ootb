# Recherche TinaCMS

## Prérequis

- Compte TinaCloud (pas disponible en auto-hébergé)
- Token de recherche depuis le tableau de bord TinaCloud

## Configuration

```bash
# .env
TINA_SEARCH_TOKEN=votre_token
```

Configuration dans `tina/config.ts` :

```typescript
search: {
  tina: {
    indexerToken: process.env.TINA_SEARCH_TOKEN,
    stopwordLanguages: ['fra', 'eng'],
  },
  indexBatchSize: 100,
  maxSearchIndexFieldLength: 200,
}
```

## Champs indexés

Les champs principaux indexés : `title`, `description`, `category`, `tags`, `body`, champs fiches pédagogiques.

## Index de recherche

- **Dev** : créé au démarrage, mis à jour en temps réel
- **Prod** : créé et téléversé vers TinaCloud au build
- Chaque branche Git a son propre index
- Option `--skip-search-index` pour ignorer la construction de l'index

## Personnalisation

- Exclure un champ de l'index en le configurant dans la section `search` de `tina/config.ts`
- `maxSearchIndexFieldLength` pour limiter le texte indexé
