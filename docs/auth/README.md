# Système d'authentification

Ce document décrit le système d'authentification utilisé dans Out of the Books.

## Architecture

Le système d'authentification est basé sur les fonctions Netlify et compatible avec le mode statique d'Astro.

### Composants principaux

1. **`netlify/functions/auth.js`** - Gère les opérations de connexion et déconnexion
2. **`netlify/functions/auth-middleware.js`** - Protège les routes du tableau de bord

### Flux d'authentification

1. L'utilisateur accède à la page de connexion (`/login`)
2. Après soumission du formulaire, la requête est envoyée à `/.netlify/functions/auth/login`
3. La fonction Netlify vérifie les identifiants et crée une session
4. L'utilisateur est redirigé vers le tableau de bord (`/dashboard`)
5. Toutes les routes protégées sont vérifiées par `auth-middleware.js`

## Interface utilisateur

La page de connexion (`src/pages/login.astro`) utilise le composant `Button.astro` pour un style cohérent avec le reste de l'application.

```astro
<Button 
  type="submit"
  variant="blue"
  size="lg"
  icon="tabler:login"
  iconPosition="left"
  fullWidth={true}
  id="login-button"
>
  Se connecter
</Button>
```

## Développement local

Pour tester l'authentification en développement local :

1. Installez la CLI Netlify si ce n'est pas déjà fait :
   ```bash
   npm install -g netlify-cli
   ```

2. Lancez le serveur de développement Netlify :
   ```bash
   netlify dev
   ```

3. Accédez à `http://localhost:8888/login` pour tester l'authentification

> **Important** : Utilisez `netlify dev` pour tester l'authentification localement.

## Variables d'environnement requises

- `JWT_SECRET` - Clé secrète pour signer les tokens JWT
- `ADMIN_EMAIL` - Email de l'administrateur
- `ADMIN_PASSWORD` - Mot de passe de l'administrateur
