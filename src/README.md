# Structure du projet Festival Out of the Books

Ce document explique l'organisation des fichiers liés au festival dans le projet.

## Organisation des fichiers

### Configuration et types

- `src/config/festival.ts` : Configuration centrale du festival
  - Définit les constantes, types et fonctions utilitaires
  - Contient les données de test pour le développement
  - Définit les jours, types d'événements et leurs propriétés

- `src/types/festival.ts` : Définition des types pour le festival
  - Contient l'interface `Event` utilisée dans toute l'application

### Données

- `src/data/festival/index.ts` : Données de test pour le festival
  - Contient des événements fictifs pour le développement
  - Organisés par jour (Mercredi, Jeudi, Vendredi)

### Services

- `src/services/events.ts` : Service de gestion des événements
  - Récupère les événements depuis l'API ou les données de test
  - Organise les événements par jour
  - Fournit des fonctions utilitaires pour les événements

- `src/services/api/nocodb.ts` : Service d'accès à l'API NocoDB
  - Gère les requêtes vers l'API NocoDB
  - Convertit les données de l'API en objets Event

### Composants UI

- `src/components/ui/DayFilter.astro` : Composant de filtrage par jour
  - Permet de filtrer les événements par jour et par type
  - Gère la pagination des événements

- `src/components/ui/EventCard.astro` : Carte d'événement
  - Affiche les détails d'un événement
  - Gère différents types d'événements (Conférences, Ateliers, Stands)

## Flux de données

1. Les événements sont récupérés via `fetchAllEvents()` dans `services/events.ts`
2. En mode test, les événements fictifs de `config/festival.ts` sont utilisés
3. Les événements sont organisés par jour avec `organizeEventsByDay()`
4. Le composant `DayFilter.astro` affiche les événements avec pagination
5. Chaque événement est rendu avec le composant `EventCard.astro`

## Bonnes pratiques

- Utiliser les types définis dans `types/festival.ts`
- Centraliser les configurations dans `config/festival.ts`
- Utiliser les services pour accéder aux données
- Éviter les duplications de code et de configuration

# Optimisations de performances

Ce document décrit les optimisations de performances mises en place pour améliorer la vitesse de chargement et la réactivité de l'application.

## 1. Optimisation du traitement des images

- **Limitation des mises à jour du rapport d'images problématiques** : Ajout d'un intervalle minimum entre les mises à jour pour éviter les écritures de fichiers trop fréquentes.
- **Compression optimisée des images** : Utilisation de paramètres de compression WebP optimisés pour réduire la taille des images tout en maintenant une bonne qualité.
- **Qualité adaptative** : Qualité d'image ajustée en fonction du type d'image (80% pour les images de conférenciers, 75% pour les images normales).

## 2. Système de mise en cache

- **Cache d'URLs d'images** : Évite de télécharger plusieurs fois la même image en mémorisant les URLs déjà traitées.
- **Cache de vérification d'existence de fichiers** : Réduit les opérations de lecture/écriture sur le disque en mémorisant les résultats des vérifications d'existence de fichiers.
- **Nettoyage périodique du cache** : Évite les problèmes de cache obsolète en vidant le cache toutes les 5 minutes.

## 3. Réduction des logs

- **Logs sélectifs** : Réduction des logs non essentiels pour améliorer les performances, en particulier pour les opérations répétitives comme la vérification d'existence de fichiers.
- **Nettoyage automatique des logs** : Limitation du nombre d'entrées dans les fichiers de logs (maximum 100 entrées) et suppression des logs trop anciens (plus de 7 jours).
- **Rotation des logs** : Nettoyage périodique et aléatoire des logs pour éviter qu'ils ne deviennent trop volumineux.

## 4. Optimisation du chargement des images

- **Chargement paresseux (lazy loading)** : Utilisation de l'attribut `loading="lazy"` pour charger les images uniquement lorsqu'elles sont visibles dans la fenêtre.
- **Décodage asynchrone** : Utilisation de l'attribut `decoding="async"` pour permettre au navigateur de décoder les images en parallèle.
- **Priorité basse** : Utilisation de l'attribut `fetchpriority="low"` pour donner une priorité plus basse au chargement des images par rapport aux autres ressources.

## 5. Gestion des images de conférenciers

- **Répertoire dédié** : Stockage des images de conférenciers dans un répertoire dédié pour une meilleure organisation.
- **Format de nom uniforme** : Utilisation d'un format de nom uniforme pour les images de conférenciers pour faciliter leur identification et leur gestion.
- **Détection intelligente** : Système de détection qui prend en compte différents formats de noms de fichiers pour assurer la compatibilité avec les anciens formats.

## 6. Système de cache pour les requêtes NocoDB

- **Cache des données API** : Mise en cache des réponses de l'API NocoDB pour réduire le nombre de requêtes.
- **Durée de validité configurable** : Possibilité de configurer la durée de validité du cache (par défaut : 5 minutes).
- **Rafraîchissement automatique** : Rafraîchissement automatique du cache toutes les 15 minutes.
- **Détection légère des mises à jour** : Vérification périodique (toutes les 3 minutes) du nombre d'éléments dans chaque table pour détecter les nouvelles données sans télécharger l'intégralité des données.
- **Rafraîchissement intelligent** : Rafraîchissement automatique des données uniquement lorsque des modifications sont détectées.
- **Initialisation au démarrage** : Chargement des données au démarrage de l'application pour éviter les temps de chargement lors de la première visite.

## Bonnes pratiques pour maintenir les performances

1. **Éviter les opérations synchrones** : Toujours utiliser des opérations asynchrones pour éviter de bloquer le thread principal.
2. **Limiter les logs** : Utiliser les logs de manière judicieuse, en particulier dans les boucles ou les opérations répétitives.
3. **Optimiser les images** : Toujours optimiser les images avant de les servir, en utilisant des formats modernes comme WebP.
4. **Utiliser la mise en cache** : Mettre en cache les résultats des opérations coûteuses pour éviter de les répéter inutilement.
5. **Nettoyer périodiquement les caches** : Éviter les problèmes de cache obsolète en nettoyant périodiquement les caches. 