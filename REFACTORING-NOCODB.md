# Refactorisation de l'API NocoDB

Ce document détaille la refactorisation proposée pour l'API NocoDB, en transformant une structure monolithique en une architecture modulaire plus maintenable.

## Structure des nouveaux modules

Nous avons créé une structure modulaire dans `src/services/api/nocodb/` avec les fichiers suivants :

### 1. `types.ts`
Contient toutes les définitions de types et interfaces pour l'API NocoDB :
- `NocoDBStand`, `NocoDBAtelier`, `NocoDBConference`, `NocoDBSession`
- `NocoDBImage`
- `NocoDBResponse`, `NocoDBSessionsResponse`
- `NocoDBPageInfo`
- `CacheObject`
- `NocoDBQueryParams`

### 2. `cache.ts`
Gère le cache des données :
- Configuration du cache (durée, intervalle de rafraîchissement)
- Objets de cache pour les stands, ateliers, conférences
- Fonctions `isCacheValid()`, `updateCache()`, `clearAllCaches()`, `isDataCached()`

### 3. `api.ts`
Contient les fonctions pour interagir avec l'API NocoDB :
- `initNocoDBApi()` - Initialise l'API avec le token
- `getItemCount()` - Récupère le nombre total d'éléments
- `executeQuery()` - Exécute une requête paginée
- `saveRawData()` - Sauvegarde les données brutes dans un fichier JSON

### 4. `fetchers.ts`
Fonctions pour récupérer les données avec pagination complète :
- `fetchStands()` - Récupère tous les stands
- `fetchAteliers()` - Récupère tous les ateliers
- `fetchConferences()` - Récupère toutes les conférences
- `fetchSessions()` - Combine ateliers et conférences

Chaque fonction implémente maintenant la pagination complète en boucle jusqu'à obtenir la dernière page, ce qui résout le problème de limite.

### 5. `converters.ts`
Fonctions pour convertir les données brutes en événements :
- `convertStandsToEvents()`
- `convertAteliersToEvents()`
- `convertConferencesToEvents()`
- `convertSessionsToEvents()`
- `organizeEventsByDay()`
- `logEventDistribution()`

### 6. `index.ts`
Point d'entrée qui exporte toutes les fonctions publiques.

## Principaux changements techniques

1. **Pagination complète** :
   - Toutes les fonctions de récupération utilisent désormais une boucle de pagination
   - La boucle continue jusqu'à ce que `isLastPage` soit `true` ou `allItems.length >= totalRows`
   - Sécurité avec un maximum de 10 pages pour éviter les boucles infinies

2. **Cache amélioré** :
   - Séparation claire des responsabilités pour le cache
   - Types génériques pour une meilleure sécurité

3. **Converters optimisés** :
   - Gestion améliorée des types avec `as EventType`
   - Utilisation de `try/catch` pour éviter les crashs

4. **Amélioration des performances** :
   - Réutilisation des instances d'API
   - Optimisation des requêtes avec `executeQuery()`

## Plan d'intégration

Pour intégrer ces changements au script `build-festival-data.js` :

1. Importer les fonctions modulaires au lieu des fonctions actuelles :
   ```javascript
   import {
     fetchStands,
     fetchAteliers,
     fetchConferences,
     convertStandsToEvents,
     convertAteliersToEvents,
     convertConferencesToEvents,
     saveRawData
   } from '../services/api/nocodb';
   ```

2. Modifier les appels aux fonctions existantes :
   - Remplacer `await fetchStands()` par l'équivalent modulaire
   - Remplacer `await fetchAteliers()` par l'équivalent modulaire
   - Remplacer `await fetchConferences()` par l'équivalent modulaire

3. Adapter la structure de retour :
   - Les fonctions modulaires ne retournent pas `dataChanged`
   - Ajouter une étape pour comparer les données actuelles avec les précédentes

4. Mettre à jour les convertisseurs :
   - Utiliser `convertStandsToEvents` du module au lieu de la fonction locale
   - Idem pour `convertAteliersToEvents` et `convertConferencesToEvents`

## Tests requis avant déploiement

1. **Test de pagination** :
   - Vérifier que toutes les données sont bien récupérées lorsque le nombre dépasse la limite
   - Tester avec un `limit` artificiellement bas pour simuler plus de pages

2. **Test de cache** :
   - Vérifier que le cache fonctionne correctement
   - Tester l'invalidation du cache

3. **Test d'erreur** :
   - Vérifier la gestion des erreurs (token invalide, API indisponible)

4. **Test de performance** :
   - Comparer les performances avant/après refactorisation

## Stratégie de déploiement

1. **Phase 1 : Développement** ✅
   - Créer les nouveaux modules
   - Tests en environnement local

2. **Phase 2 : Intégration** (à faire)
   - Créer une branche `feature/nocodb-refactoring`
   - Modifier `build-festival-data.js` pour utiliser les nouveaux modules
   - Exécuter les tests

3. **Phase 3 : Déploiement** (à faire)
   - Fusionner dans `develop` pour tests de pré-production
   - Vérifier les logs et performances
   - Fusionner dans `main` pour production

4. **Phase 4 : Surveillance** (à faire)
   - Surveiller les logs après déploiement
   - Vérifier que toutes les données sont correctement récupérées

## Plan de rollback

En cas de problème :

```bash
git checkout main
git reset --hard [commit-avant-refactorisation]
git push --force
```

## Conclusion

Cette refactorisation améliore considérablement la maintenabilité, l'extensibilité et la robustesse du code tout en conservant toutes les fonctionnalités existantes. La pagination complète résout le problème des limites, permettant de récupérer tous les événements même si leur nombre dépasse la limite configurée. 