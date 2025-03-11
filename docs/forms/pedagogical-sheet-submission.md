# Soumission des Fiches Pédagogiques

Ce document décrit le processus de soumission des fiches pédagogiques via le formulaire en ligne.

## Architecture

Le processus de soumission est divisé en deux composants principaux :

1. **Composant Astro (`ProjectSubmissionForm.astro`)**
   - Interface utilisateur du formulaire
   - Validation des données côté client
   - Préparation et envoi des données au format JSON
   - Gestion des messages de statut pour l'utilisateur

2. **API Endpoint (`/api/submit-pedagogical-sheet.ts`)**
   - Exécuté exclusivement côté serveur
   - Gestion sécurisée des variables d'environnement
   - Communication avec l'API NocoDB
   - Support des modes test et production
   - Traitement des données et gestion des erreurs

## Modes de Fonctionnement

L'API endpoint prend en charge deux modes de fonctionnement :

### Mode Test

Activé automatiquement lorsque la clé API NocoDB est absente ou invalide.

- Simule une soumission réussie sans appel réel à l'API
- Affiche un message d'avertissement dans l'interface
- Journalise les données qui auraient été envoyées
- Idéal pour le développement et les tests

### Mode Production

Activé lorsque la clé API NocoDB est présente et valide.

- Utilise les données réelles saisies par l'utilisateur
- Effectue un appel réel à l'API NocoDB
- Enregistre les données dans la base de données
- Affiche des messages de succès/erreur basés sur la réponse de l'API

## Configuration

### Variables d'Environnement

Le système utilise les variables d'environnement suivantes :

```env
NOCODB_BASE_URL=https://app.nocodb.com
NOCODB_API_TOKEN=votre_clé_api
NOCODB_ORG_ID=noco
NOCODB_PROJECT_ID=pzafxqd4lr77r0v
NOCODB_TABLE_ID=mur92i1x276ldbg
```

Ces variables sont utilisées exclusivement côté serveur dans l'API endpoint :

```typescript
// Dans submit-pedagogical-sheet.ts
const NOCODB_BASE_URL = import.meta.env.NOCODB_BASE_URL || 'https://app.nocodb.com';
const NOCODB_API_TOKEN = import.meta.env.NOCODB_API_TOKEN;
const NOCODB_ORG_ID = import.meta.env.NOCODB_ORG_ID || 'noco';
const NOCODB_PROJECT_ID = import.meta.env.NOCODB_PROJECT_ID || 'pzafxqd4lr77r0v';
const NOCODB_TABLE_ID = import.meta.env.NOCODB_TABLE_ID || 'mur92i1x276ldbg';
```

## Processus de Validation

La validation du formulaire est gérée à deux niveaux :

1. **Côté Client**
   - Attributs HTML5 (`required`, `minlength`, `type="email"`, etc.)
   - Validation à la soumission via `form.checkValidity()`
   - Validation personnalisée pour les thématiques
   - Messages d'erreur natifs du navigateur

2. **Côté Serveur**
   - Validation des données reçues
   - Vérification des champs obligatoires
   - Formatage approprié pour NocoDB

## Processus de Soumission

### 1. Préparation des Données (Côté Client)

```javascript
// Dans ProjectSubmissionForm.astro
submitButton.addEventListener('click', async () => {
  // Validation du formulaire
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  try {
    // Afficher le message de traitement
    showStatus('Traitement en cours...', 'processing');
    
    // Préparer les données au format JSON
    const formData = new FormData(form);
    
    // Récupérer les thèmes sélectionnés
    const themes = Array.from(
      form.querySelectorAll('input[name="Thèmes"]:checked')
    ).map(checkbox => checkbox.value);
    
    // Convertir FormData en objet JSON
    const jsonData = {
      Title: formData.get('Title'),
      // ... autres champs
      Themes: themes
    };
    
    // Envoyer les données à l'API endpoint
    const response = await fetch('/api/submit-pedagogical-sheet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData)
    });
    
    // Traiter la réponse
    const result = await response.json();
    
    if (result.success) {
      // Rediriger vers la page de confirmation
      window.location.href = '/merci-soumission';
    } else {
      showError(result.message);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la soumission:', error);
    showError('Une erreur est survenue lors de la communication avec le serveur.');
  }
});
```

### 2. Traitement par l'API Endpoint (Côté Serveur)

```typescript
// Dans submit-pedagogical-sheet.ts
export const POST: APIRoute = async ({ request }) => {
  try {
    // Vérifier si nous sommes en mode test
    const isTestMode = !NOCODB_API_TOKEN || NOCODB_API_TOKEN.trim() === '';
    
    // Récupérer les données JSON
    const data = await request.json();
    
    // Formater les données pour NocoDB
    const formattedData = {
      Title: data.Title,
      Description: data.Description,
      "Type enseignement": JSON.stringify([data.TypeEnseignement]),
      // ... autres champs
    };
    
    // Mode test ou production
    if (isTestMode) {
      // Simuler une soumission réussie
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Simulation réussie ! (mode test)',
          isTestMode: true
        }),
        { status: 200 }
      );
    }
    
    // Mode production - envoyer à NocoDB
    const api = initNocoDBApi();
    
    await api.dbTableRow.create(
      NOCODB_ORG_ID,
      NOCODB_PROJECT_ID,
      NOCODB_TABLE_ID,
      formattedData
    );
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Votre fiche pédagogique a été soumise avec succès !',
        isTestMode: false
      }),
      { status: 200 }
    );
  } catch (error) {
    // Gestion des erreurs
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Erreur lors de la soumission.',
        error: error.message
      }),
      { status: 500 }
    );
  }
};
```

## Format des Données

Les données sont envoyées au format JSON du client vers le serveur :

```javascript
{
  "Title": "Titre du projet",
  "Description": "Description détaillée",
  "TypeEnseignement": "Ordinaire",
  "Section": "Primaire",
  "Destinataire": "Public cible",
  "Themes": ["Thème 1", "Thème 2"],
  "Objectifs": "- Objectif 1\n- Objectif 2",
  "Competences": "- Compétence 1\n- Compétence 2",
  "prenom": "Prénom",
  "nom": "Nom",
  "email": "email@example.com",
  "telephone": "+32 123 45 67 89",
  "Declinaisons": "Déclinaisons possibles",
  "Conseils": "Conseils d'implémentation",
  "Liens": "https://example.com"
}
```

Puis formatées côté serveur pour NocoDB :

```javascript
{
  "Title": "Titre du projet",
  "Description": "Description détaillée",
  "Type enseignement": JSON.stringify(["Ordinaire"]), // Format JSON pour les tableaux
  "Section": JSON.stringify(["Primaire"]),
  "Destinataire": "Public cible",
  "Thèmes": JSON.stringify(["Thème 1", "Thème 2"]), // Tableau des thèmes sélectionnés
  "Objectifs": "- Objectif 1\n- Objectif 2",
  "Competences": "- Compétence 1\n- Compétence 2",
  "Prénom": "Prénom",
  "Nom": "Nom",
  "Email": "email@example.com",
  "Téléphone": "+32 123 45 67 89",
  "Déclinaisons": "Déclinaisons possibles",
  "Conseils": "Conseils d'implémentation",
  "Liens": "https://example.com",
  "Edition": "2024" // Année courante
}
```

## Gestion des Erreurs

Le système gère différents types d'erreurs :

- **Erreurs de validation** : Données manquantes ou invalides
- **Erreurs d'authentification** (401) : Clé API invalide
- **Erreurs de ressource** (404) : Table ou projet introuvable
- **Erreurs serveur** (500+) : Problème côté serveur
- **Erreurs réseau** : Problème de connexion

Chaque type d'erreur génère un message spécifique pour l'utilisateur.

## Interface Utilisateur

### Messages de Statut

Le système utilise deux types de messages de statut pour informer l'utilisateur :

- **Messages d'erreur** : Explications conviviales des problèmes et suggestions pour les résoudre
- **Indicateur de traitement** : Animation pendant le traitement de la soumission

```css
/* Styles des messages de statut */
#formStatus.error {
  @apply bg-rose-50 text-rose-700 border-rose-200;
}

#formStatus.processing {
  @apply bg-sky-50 text-sky-700 border-sky-200;
}
```

Les messages sont affichés avec des icônes appropriées et des animations subtiles pour améliorer l'expérience utilisateur :

- ❌ Erreur : Messages d'erreur contextuels avec suggestions de résolution
- ⏳ Traitement : "Traitement en cours..." avec animation de pulsation

### Page de Confirmation

Après une soumission réussie, l'utilisateur est redirigé vers une page de confirmation dédiée (`/merci-soumission`) qui :

- Affiche un message de remerciement
- Confirme que la soumission a été enregistrée
- Propose des liens pour naviguer vers d'autres sections du site
- Offre une expérience utilisateur cohérente et professionnelle

Cette approche améliore l'expérience utilisateur en :
- Fournissant une confirmation claire et visible du succès de l'opération
- Évitant les problèmes de double soumission
- Offrant une transition fluide vers d'autres contenus du site

## Maintenance

### Ajout de Nouveaux Champs

1. Ajouter le champ HTML dans `ProjectSubmissionForm.astro`
2. Mettre à jour l'objet JSON dans le script client
3. Mettre à jour le formatage des données dans l'API endpoint

### Modification du Mode Test

1. Modifier la logique de détection du mode test dans l'API endpoint
2. Ajuster les messages affichés à l'utilisateur

### Mise à Jour de l'API

1. Vérifier la compatibilité avec le SDK NocoDB
2. Mettre à jour les configurations dans `.env`
3. Tester la soumission en mode production

## Dépannage

### Problèmes Courants

1. **Mode Test Activé Involontairement**
   - Vérifier que la variable `NOCODB_API_TOKEN` est correctement définie dans `.env`
   - Vérifier que les variables d'environnement sont correctement chargées
   - Vérifier que le token ne contient pas d'espaces ou caractères invalides

2. **Échec de Soumission en Mode Production**
   - Vérifier la validité de la clé API
   - Contrôler les identifiants de la table et du projet
   - Vérifier les logs serveur pour des erreurs détaillées

3. **Erreurs de Format de Données**
   - Vérifier que les données JSON sont correctement formatées
   - S'assurer que les champs obligatoires sont présents
   - Vérifier que les tableaux sont correctement traités

## Tests

Pour tester le formulaire :

1. **Test de Validation**
   ```bash
   npm run test:validation
   ```

2. **Test de Soumission**
   ```bash
   npm run test:submission
   ```

3. **Test d'Intégration**
   ```bash
   npm run test:integration
   ``` 