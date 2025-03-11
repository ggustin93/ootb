# Architecture du Système de Formulaire

Ce document explique l'architecture et la séparation des responsabilités dans le système de formulaire utilisé pour la soumission des fiches pédagogiques.

## Architecture du système

Le système de formulaire est conçu selon une architecture sécurisée client-serveur :

1. **Client (Navigateur)** : Le formulaire HTML avec validation côté client
2. **API Endpoint (Serveur)** : Point d'entrée sécurisé qui traite les données et communique avec NocoDB

### Composants principaux

#### ProjectSubmissionForm.astro
- Responsable de l'affichage du formulaire et de la validation côté client
- Envoie les données au format JSON à l'endpoint API sécurisé
- Ne contient aucune logique d'accès à la base de données ou clé API

```astro
// Exemple de soumission du formulaire
const response = await fetch('/api/submit-pedagogical-sheet', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(jsonData)
});
```

#### API Endpoint (/api/submit-pedagogical-sheet.ts)
- Exécuté exclusivement côté serveur (prerender = false)
- Gère l'authentification et la communication avec NocoDB
- Traite les données reçues au format JSON
- Stocke les clés API de manière sécurisée

```typescript
// Exemple d'endpoint API
export const POST: APIRoute = async ({ request }) => {
  // Récupérer les données JSON
  const data = await request.json();
  
  // Traitement sécurisé des données
  // ...
  
  // Communication avec NocoDB
  await api.dbTableRow.create(
    NOCODB_ORG_ID,
    NOCODB_PROJECT_ID,
    NOCODB_TABLE_ID,
    formattedData
  );
};
```

## Modes de fonctionnement

Le système prend en charge deux modes de fonctionnement, déterminés automatiquement par la présence d'une clé API NocoDB valide :

### Mode Test
- Activé automatiquement lorsque la clé API NocoDB n'est pas configurée
- Simule les soumissions sans appels API réels
- Fournit des messages de succès conviviaux à l'utilisateur
- Utile pour le développement et les tests

### Mode Production
- Activé lorsqu'une clé API NocoDB valide est configurée
- Enregistre réellement les données dans la base NocoDB
- Fournit des messages de confirmation détaillés

> **Note importante** : Les indicateurs visuels de mode ont été supprimés de l'interface utilisateur pour une expérience plus fluide. Le mode est déterminé côté serveur sans affecter l'expérience utilisateur.

## Expérience utilisateur

### Messages de statut

Le système utilise deux types de messages de statut pour informer l'utilisateur pendant le processus de soumission :

1. **Traitement** : Affiche une animation de chargement pendant le traitement de la soumission
2. **Erreur** : Affiche un message d'erreur convivial avec des suggestions de résolution

Les messages sont conçus pour être :
- **Informatifs** : Fournissent des informations claires sur le résultat
- **Conviviaux** : Utilisent un langage accessible et non technique
- **Utiles** : Offrent des suggestions concrètes en cas d'erreur
- **Visuellement attrayants** : Utilisent des icônes et des animations subtiles

```javascript
// Exemple de message d'erreur
showError('Nous n\'avons pas pu enregistrer votre fiche pédagogique. Veuillez vérifier votre connexion internet et réessayer.');
```

### Page de confirmation

Après une soumission réussie, l'utilisateur est redirigé vers une page de confirmation dédiée (`/merci-soumission`).

```javascript
// Redirection après une soumission réussie
if (result.success) {
  window.location.href = '/merci-soumission';
}
```

Cette page de confirmation offre plusieurs avantages :
- **Confirmation claire** : Message de succès visible et distinct
- **Expérience cohérente** : Design harmonisé avec le reste du site
- **Navigation facilitée** : Liens vers d'autres sections pertinentes du site
- **Prévention des soumissions multiples** : Évite les soumissions accidentelles répétées
- **Séparation des préoccupations** : Sépare clairement le formulaire de la confirmation

## Flux de Données

1. L'utilisateur remplit le formulaire
2. L'utilisateur soumet le formulaire
3. Le navigateur effectue une validation native
4. Si valide, les données sont envoyées à l'endpoint API
5. L'endpoint API détermine le mode (test ou production)
6. En mode test :
   - Une soumission réussie est simulée
   - Une réponse de succès est renvoyée au client
7. En mode production :
   - Les données du formulaire sont préparées
   - Un appel à l'API NocoDB est effectué
   - Une réponse de succès ou d'erreur est renvoyée au client
8. Si la soumission est réussie :
   - L'utilisateur est redirigé vers la page de confirmation
9. Si une erreur survient :
   - Un message d'erreur est affiché dans le formulaire

## Avantages de cette architecture

1. **Sécurité renforcée** : Les clés API ne sont jamais exposées côté client
2. **Séparation des responsabilités** : Interface utilisateur séparée de la logique métier
3. **Facilité de maintenance** : Modifications possibles de l'API sans impacter l'interface
4. **Testabilité améliorée** : Mode test intégré pour le développement
5. **Performance optimisée** : Utilisation de JSON pour des échanges de données efficaces

## Bonnes pratiques

### Sécurité
- Ne jamais exposer les clés API dans le code client
- Utiliser HTTPS pour toutes les communications
- Valider les données côté client ET côté serveur

### Gestion des erreurs
- Capturer et journaliser toutes les erreurs côté serveur
- Fournir des messages d'erreur utiles mais sans détails techniques sensibles
- Implémenter des mécanismes de retry pour les opérations critiques

### Documentation
- Maintenir cette documentation à jour lors des modifications
- Documenter clairement les formats de données attendus
- Inclure des exemples pour faciliter la compréhension

## Modes de Fonctionnement

### Mode Test

Activé automatiquement lorsque la clé API NocoDB est absente.

- Simule une soumission réussie sans appel réel à l'API
- Affiche un message d'avertissement dans l'interface
- Utile pour le développement et les tests
- Géré entièrement côté serveur

### Mode Production

Activé lorsque la clé API NocoDB est présente.

- Utilise les données réelles saisies par l'utilisateur
- Effectue un appel réel à l'API NocoDB
- Enregistre les données dans la base de données
- Affiche des messages de succès/erreur basés sur la réponse de l'API

## Maintenance et Évolution

Pour ajouter un nouveau champ au formulaire :

1. Ajouter le HTML dans `ProjectSubmissionForm.astro`
2. Mettre à jour la préparation des données dans `submit-pedagogical-sheet.ts`

Pour modifier le comportement de soumission :

1. Modifier uniquement `submit-pedagogical-sheet.ts`

Pour ajouter un nouveau mode de fonctionnement :

1. Étendre la logique conditionnelle dans `submit-pedagogical-sheet.ts`
2. Ajouter les indicateurs visuels appropriés dans `ProjectSubmissionForm.astro` 