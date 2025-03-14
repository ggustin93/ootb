# ToDo List pour l'intégration Brevo

Voici les étapes à suivre pour mettre en place l'intégration avec Brevo :

## 1. Préparation du compte Brevo

- [ ] Créer un compte sur [Brevo](https://www.brevo.com/) si vous n'en avez pas déjà un
- [ ] Générer une clé API dans les paramètres de votre compte Brevo
- [ ] Créer une liste de contacts dédiée pour les abonnés à la newsletter
- [ ] Noter l'ID de cette liste (visible dans l'URL ou les paramètres de la liste)

## 2. Installation des dépendances

- [ ] Installer le SDK Brevo avec la commande :
  ```bash
  npm install sib-api-v3-sdk
  ```
- [ ] Créer le fichier de déclaration de types `src/types/sib-api-v3-sdk.d.ts`

## 3. Configuration de l'environnement

- [ ] Ajouter les variables d'environnement dans le fichier `.env` :
  ```
  BREVO_API_KEY=votre_cle_api_brevo
  BREVO_LIST_ID=id_de_votre_liste
  ```
- [ ] Vérifier que ces variables sont correctement chargées dans l'application

## 4. Implémentation technique (approche simplifiée)

- [ ] Modifier le fichier `src/pages/api/submit-newsletter.ts` pour ajouter l'intégration Brevo :
  ```typescript
  // Ajouter les imports nécessaires
  import * as SibApiV3Sdk from 'sib-api-v3-sdk';
  
  // Ajouter la configuration Brevo
  const BREVO_API_KEY = import.meta.env.BREVO_API_KEY;
  const BREVO_LIST_ID = parseInt(import.meta.env.BREVO_LIST_ID || '2', 10);
  
  // Ajouter la fonction d'initialisation de l'API Brevo
  const initBrevoApi = () => {
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
  
  // Ajouter la fonction pour ajouter un contact à une liste Brevo
  const addContactToBrevoList = async (email) => {
    const api = initBrevoApi();
    if (!api) return false;
    
    try {
      const contactEmails = new SibApiV3Sdk.AddContactToList();
      contactEmails.emails = [email];
      
      await api.addContactToList(BREVO_LIST_ID, contactEmails);
      console.log(`✅ Contact ${email} ajouté à la liste ${BREVO_LIST_ID}`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de l'ajout du contact ${email} à la liste:`, error);
      return false;
    }
  };
  
  // Dans la route POST, après avoir enregistré le contact dans NocoDB avec succès
  if (result) {
    // Ajouter le contact à la liste Brevo
    await addContactToBrevoList(data.email);
  }
  ```
- [ ] Tester l'intégration en soumettant le formulaire avec une adresse email de test

## 5. Validation et tests

- [ ] Vérifier que les contacts apparaissent bien dans votre compte Brevo
- [ ] Vérifier que les contacts sont bien ajoutés à la liste spécifiée
- [ ] Tester avec une adresse email déjà existante pour vérifier le comportement

## 6. Optimisations futures

- [ ] Configurer des modèles d'emails dans Brevo
- [ ] Mettre en place des workflows d'automatisation
- [ ] Implémenter une segmentation avancée des abonnés
- [ ] Ajouter des attributs supplémentaires selon les besoins (prénom, intérêts, etc.)
- [ ] Mettre en place un système de désabonnement conforme au RGPD 