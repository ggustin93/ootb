# Documentation du formulaire d'inscription à la newsletter

Ce document décrit l'architecture, le fonctionnement et l'intégration du formulaire d'inscription à la newsletter du site Out of the Books.

## Table des matières

1. [Architecture générale](#architecture-générale)
2. [Composants principaux](#composants-principaux)
3. [Flux de données](#flux-de-données)
4. [Configuration NocoDB](#configuration-nocodb)
5. [Intégration avec Brevo](#intégration-avec-brevo)
   - [Installation des dépendances](#installation-des-dépendances)
   - [Configuration de l'API Brevo](#configuration-de-lapi-brevo)
   - [Modification de l'API backend](#modification-de-lapi-backend)
   - [Exemple d'intégration](#exemple-dintégration)
6. [Dépannage](#dépannage)

## Architecture générale

Le système d'inscription à la newsletter est composé de deux parties principales :

1. **Composant frontend** (`NewsletterSection.astro`) : Gère l'affichage du formulaire, la validation des données et l'envoi des données au backend.
2. **API backend** (`submit-newsletter.ts`) : Traite les données reçues et les enregistre dans NocoDB.

Le formulaire est conçu pour être simple et efficace, ne demandant que l'adresse email de l'utilisateur et son acceptation de la politique de confidentialité.

## Composants principaux

### Frontend : NewsletterSection.astro

Le composant frontend est responsable de :
- Afficher le formulaire d'inscription
- Valider les données saisies par l'utilisateur
- Envoyer les données au backend via une requête fetch
- Gérer les messages de statut et les erreurs
- Rediriger l'utilisateur vers une page de confirmation après inscription

### Backend : submit-newsletter.ts

L'API backend est responsable de :
- Recevoir les données du formulaire
- Valider les données côté serveur
- Vérifier si l'email existe déjà dans la base de données
- Formater les données pour NocoDB
- Enregistrer les données dans NocoDB
- Renvoyer une réponse appropriée au frontend

## Flux de données

1. L'utilisateur remplit le formulaire avec son adresse email et accepte la politique de confidentialité
2. Le script JavaScript valide les données et les envoie à l'API via une requête fetch
3. L'API vérifie si l'email existe déjà dans NocoDB
   - Si l'email existe, les informations de l'abonné sont mises à jour
   - Si l'email n'existe pas, un nouvel abonné est créé
4. L'API renvoie une réponse au frontend
5. Le frontend affiche un message de succès et redirige l'utilisateur vers une page de confirmation

## Configuration NocoDB

### Variables d'environnement requises

Pour que le formulaire fonctionne correctement avec NocoDB, les variables d'environnement suivantes doivent être définies dans le fichier `.env` :

```
NOCODB_BASE_URL=https://app.nocodb.com
NOCODB_API_TOKEN=votre_token_api
NOCODB_ORG_ID=noco
NOCODB_PROJECT_ID=votre_project_id
NOCODB_NEWSLETTER_TABLE_ID=votre_table_id
NOCODB_NEWSLETTER_VIEW_ID=votre_view_id
```

### Structure de la table NocoDB

La table NocoDB pour les abonnés à la newsletter doit contenir les colonnes suivantes :

| Nom de colonne | Type | Description |
|---------------|------|-------------|
| Id | AutoNumber | Identifiant unique de l'abonné |
| Email | SingleLineText | Adresse email de l'abonné |
| Source | SingleLineText | Source de l'inscription (ex: website) |
| Tags | SingleLineText | Tags associés à l'abonné |
| Date d'inscription | DateTime | Date et heure de l'inscription (format ISO avec timezone) |
| Politique acceptée | Checkbox | Indique si l'abonné a accepté la politique de confidentialité |
| Statut | SingleSelect | Statut de l'abonné (ex: Actif, Inactif) |

## Intégration avec Brevo

### Installation des dépendances

Pour intégrer Brevo à votre projet, vous devez d'abord installer le SDK officiel :

```bash
# Avec npm
npm install sib-api-v3-sdk

# Avec yarn
yarn add sib-api-v3-sdk

# Avec pnpm
pnpm add sib-api-v3-sdk
```

Assurez-vous également de mettre à jour les types TypeScript en ajoutant une déclaration de module si nécessaire. Créez un fichier `src/types/sib-api-v3-sdk.d.ts` avec le contenu suivant :

```typescript
declare module 'sib-api-v3-sdk' {
  export const ApiClient: {
    instance: {
      authentications: {
        'api-key': {
          apiKey: string;
        };
      };
    };
  };

  export class ContactsApi {
    createContact(createContact: CreateContact): Promise<any>;
    updateContact(email: string, updateContact: UpdateContact): Promise<any>;
    getContactInfo(email: string): Promise<any>;
    getLists(): Promise<any>;
  }

  export class CreateContact {
    email: string;
    attributes?: Record<string, any>;
    listIds?: number[];
  }

  export class UpdateContact {
    attributes?: Record<string, any>;
    listIds?: number[];
  }
}
```

### Configuration de l'API Brevo

Pour intégrer Brevo, vous aurez besoin de :
- Un compte Brevo
- Une clé API Brevo
- L'ID de la liste à laquelle vous souhaitez ajouter les contacts

Ajoutez les variables d'environnement suivantes dans le fichier `.env` :

```
BREVO_API_KEY=votre_cle_api_brevo
BREVO_LIST_ID=2  # Remplacez par l'ID de votre liste
```

### Modification de l'API backend

Pour envoyer les données à Brevo en plus de NocoDB, vous devrez créer un nouveau fichier `submit-newsletter-brevo.ts` qui étend les fonctionnalités de l'API existante pour :
- Initialiser l'API Brevo
- Créer ou mettre à jour le contact dans Brevo
- Ajouter le contact à une liste spécifique

Un exemple complet d'implémentation est fourni dans le fichier `src/pages/api/submit-newsletter-brevo.ts`.

### Exemple d'intégration

Voici un extrait du code pour intégrer Brevo à l'API existante :

```typescript
// Importer le SDK Brevo
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

// Configuration de l'API Brevo
const BREVO_API_KEY = import.meta.env.BREVO_API_KEY;
const BREVO_LIST_ID = parseInt(import.meta.env.BREVO_LIST_ID || '2', 10);

// Initialiser l'API Brevo
const initBrevoApi = () => {
  if (!BREVO_API_KEY) {
    console.error('❌ Clé API Brevo manquante');
    return null;
  }
  
  try {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = BREVO_API_KEY;
    
    const apiInstance = new SibApiV3Sdk.ContactsApi();
    console.log('✅ API Brevo initialisée avec succès');
    return apiInstance;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de l\'API Brevo:', error);
    return null;
  }
};

// Fonction pour ajouter ou mettre à jour un contact dans Brevo
const syncContactWithBrevo = async (email, attributes) => {
  const api = initBrevoApi();
  if (!api) return false;
  
  try {
    // Vérifier si le contact existe déjà
    try {
      const existingContact = await api.getContactInfo(email);
      
      // Mettre à jour le contact existant
      const updateContact = new SibApiV3Sdk.UpdateContact();
      updateContact.attributes = attributes;
      updateContact.listIds = [BREVO_LIST_ID];
      
      await api.updateContact(email, updateContact);
      return true;
    } catch (error) {
      // Le contact n'existe pas, on le crée
      const createContact = new SibApiV3Sdk.CreateContact();
      createContact.email = email;
      createContact.attributes = attributes;
      createContact.listIds = [BREVO_LIST_ID];
      
      await api.createContact(createContact);
      return true;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation avec Brevo:', error);
    return false;
  }
};
```

Pour utiliser cette nouvelle API, modifiez le composant `NewsletterSection.astro` pour envoyer les données à `/api/submit-newsletter-brevo` au lieu de `/api/submit-newsletter`.

## Dépannage

### Problèmes courants et solutions

1. **Le formulaire ne s'affiche pas correctement**
   - Vérifiez que tous les fichiers CSS et JavaScript sont correctement chargés
   - Assurez-vous que le composant `NewsletterSection.astro` est correctement importé

2. **Le bouton d'inscription ne fonctionne pas**
   - Vérifiez les erreurs dans la console du navigateur
   - Assurez-vous que l'événement click est correctement attaché au bouton

3. **Les données ne sont pas enregistrées dans NocoDB**
   - Vérifiez que les variables d'environnement sont correctement définies
   - Assurez-vous que le token API NocoDB est valide
   - Vérifiez les logs du serveur pour identifier les erreurs

4. **Message "Traitement en cours..." qui ne disparaît pas**
   - Vérifiez les erreurs dans la console du navigateur
   - Assurez-vous que la requête fetch est correctement gérée
   - Vérifiez que le serveur renvoie une réponse valide

5. **Erreurs lors de l'intégration avec Brevo**
   - Vérifiez que la dépendance `sib-api-v3-sdk` est correctement installée
   - Assurez-vous que la clé API Brevo est valide
   - Vérifiez que l'ID de liste Brevo existe dans votre compte

### Logs et débogage

Pour faciliter le débogage, des logs détaillés ont été ajoutés à différentes étapes du processus :

- Dans le frontend, les logs sont affichés dans la console du navigateur
- Dans le backend, les logs sont affichés dans la console du serveur

Pour activer des logs supplémentaires, vous pouvez ajouter des `console.log` aux endroits stratégiques du code.

---

Cette documentation sera mise à jour au fur et à mesure que le système d'inscription à la newsletter évolue. 