# Architecture du Formulaire de Contact

Ce document décrit le processus de soumission des messages de contact via le formulaire en ligne.

## Architecture

Le processus de soumission est divisé en deux composants principaux :

1. **Composant Astro (`contact.astro`)**
   - Interface utilisateur du formulaire
   - Validation des données côté client
   - Préparation et envoi des données au format JSON
   - Gestion des messages de statut pour l'utilisateur

2. **API Endpoint (`/api/submit-contact.ts`)**
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
NOCODB_PROJECT_ID=pn7128r4idyluf0
NOCODB_TABLE_ID=mza30wqm38wsmib
```

Ces variables sont utilisées exclusivement côté serveur dans l'API endpoint :

```typescript
// Dans submit-contact.ts
const NOCODB_BASE_URL = import.meta.env.NOCODB_BASE_URL || 'https://app.nocodb.com';
const NOCODB_API_TOKEN = import.meta.env.NOCODB_API_TOKEN;
const NOCODB_ORG_ID = import.meta.env.NOCODB_ORG_ID || 'noco';
const NOCODB_PROJECT_ID = import.meta.env.NOCODB_PROJECT_ID || 'pn7128r4idyluf0';
const NOCODB_TABLE_ID = import.meta.env.NOCODB_TABLE_ID || 'mza30wqm38wsmib';
```

## Structure du Formulaire

Le formulaire de contact comprend les champs suivants :

1. **Nom** (`name`) - Obligatoire, minimum 2 caractères
2. **Email** (`email`) - Obligatoire, format email valide
3. **Sujet** (`subject`) - Obligatoire, minimum 3 caractères
4. **Message** (`message`) - Obligatoire, minimum 10 caractères

Chaque champ dispose d'une validation en temps réel avec des messages d'erreur spécifiques.

## Processus de Validation

La validation du formulaire est gérée à deux niveaux :

1. **Côté Client**
   - Attributs HTML5 (`required`, `minlength`, `type="email"`, etc.)
   - Validation à la soumission via `form.checkValidity()`
   - Messages d'erreur visuels pour guider l'utilisateur
   - Styles visuels pour indiquer les champs valides/invalides
   - Validation en temps réel pendant la saisie

2. **Côté Serveur**
   - Validation des données reçues
   - Vérification des champs obligatoires
   - Formatage approprié pour NocoDB

### Validation Visuelle

Le formulaire utilise plusieurs techniques pour indiquer visuellement la validité des champs :

- **Bordures colorées** : Rouge pour les champs invalides, vert pour les champs valides
- **Messages d'erreur** : Apparaissent sous les champs invalides
- **Animations** : Transitions douces pour l'apparition des messages d'erreur

```css
/* Styles pour les champs invalides */
input:invalid:not(:placeholder-shown), 
textarea:invalid:not(:placeholder-shown) {
  @apply border-rose-300 focus:border-rose-500 focus:ring-rose-500/20;
}

/* Styles pour les champs valides */
input:valid:not(:placeholder-shown), 
textarea:valid:not(:placeholder-shown) {
  @apply border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20;
}

/* Styles pour les messages d'erreur sous les champs */
.peer:invalid:not(:placeholder-shown) ~ .validation-message {
  @apply visible opacity-100 translate-y-0;
}
```

## Processus de Soumission

### 1. Préparation des Données (Côté Client)

```javascript
// Dans contact.astro
function handleSubmit() {
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
    
    // Convertir FormData en objet JSON
    const jsonData = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message')
    };
    
    // Envoyer les données à l'API endpoint
    fetch('/api/submit-contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData)
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        // Rediriger vers la page de confirmation
        window.location.href = '/merci-contact';
      } else {
        showError(result.message);
      }
    })
    .catch(error => {
      console.error('❌ Erreur lors de la soumission:', error);
      showError('Une erreur est survenue lors de la communication avec le serveur.');
    });
  } catch (error) {
    console.error('❌ Erreur lors de la soumission:', error);
    showError('Une erreur est survenue lors de la communication avec le serveur.');
  }
}
```

### 2. Traitement par l'API Endpoint (Côté Serveur)

```typescript
// Dans submit-contact.ts
export const POST: APIRoute = async ({ request }) => {
  try {
    // Vérifier si nous sommes en mode test
    const isTestMode = !NOCODB_API_TOKEN || NOCODB_API_TOKEN.trim() === '';
    
    // Récupérer les données JSON
    const data = await request.json();
    
    // Formater les données pour NocoDB selon la structure réelle de la table
    const formattedData = {
      Objet: data.subject || "Contact depuis le site web",
      Message: data.message,
      Auteur: data.email,
      Statut: "En attente de réponse"
    };
    
    // Mode test ou production
    if (isTestMode) {
      // Simuler une soumission réussie
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.',
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
        message: 'Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.',
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
  "name": "Nom de l'utilisateur",
  "email": "email@example.com",
  "subject": "Sujet du message",
  "message": "Contenu du message"
}
```

Puis formatées côté serveur pour NocoDB selon la structure de la table :

```javascript
{
  "Objet": "Sujet du message",
  "Message": "Contenu du message",
  "Auteur": "email@example.com",
  "Statut": "En attente de réponse"
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
  @apply bg-rose-50 text-rose-700 border border-rose-200;
}

#formStatus.processing {
  @apply bg-sky-50 text-sky-700 border border-sky-200;
}
```

### Page de Confirmation

Après une soumission réussie, l'utilisateur est redirigé vers une page de confirmation dédiée (`/merci-contact`). Cette page offre :

- Un message de confirmation clair
- Des liens vers d'autres sections du site
- Une expérience utilisateur cohérente avec le reste du site

## Débogage et Journalisation

Le système inclut une journalisation détaillée pour faciliter le débogage :

- Journalisation des événements côté client (initialisation, validation, soumission)
- Journalisation détaillée côté serveur (réception des données, traitement, réponses API)
- Messages d'erreur explicites pour identifier rapidement les problèmes

## Route de Test

Une route GET est disponible à `/api/submit-contact` pour tester la connexion à NocoDB et vérifier la structure des données. Cette route renvoie :

- En mode test : La structure attendue des données
- En mode production : Un exemple de données réelles et la structure de la table

Cette route est utile pour vérifier la configuration et le mapping des champs sans avoir à soumettre un formulaire complet.

## Maintenance et Évolution

Pour ajouter un nouveau champ au formulaire :

1. Ajouter le HTML dans `contact.astro`
2. Mettre à jour la préparation des données dans le script client
3. Mettre à jour le formatage des données dans `submit-contact.ts`

Pour modifier le comportement de soumission :

1. Modifier uniquement `submit-contact.ts`

Pour ajouter un nouveau mode de fonctionnement :

1. Étendre la logique conditionnelle dans `submit-contact.ts` 