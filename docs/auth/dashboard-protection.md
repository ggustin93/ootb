# Protection de l'Accès au Tableau de Bord

Ce document détaille l'architecture de sécurité mise en place pour protéger l'accès au tableau de bord administratif d'Out of the Books.

## Architecture d'Authentification

Notre architecture d'authentification exploite Supabase Auth en conjonction avec les fonctions Netlify pour créer un système sécurisé, performant, et facile à maintenir.

![Architecture d'Authentification](../assets/auth-flow.png)

### Composants principaux

L'authentification est structurée autour de trois composants clés :

1. **Fonction d'Authentification** (`netlify/functions/auth.js`)
   - Gère les opérations de connexion et déconnexion
   - Établit les cookies sécurisés pour la session
   - Redirige vers `/dashboard/index.html` après connexion réussie

2. **Middleware de Protection** (`netlify/functions/auth-middleware.js`)
   - Intercepte toutes les requêtes vers les routes protégées (`/dashboard/*`, `/dashboard`, `/dashboard/`)
   - Vérifie la validité des tokens d'authentification via Supabase
   - Redirige vers la page de connexion si nécessaire
   - Adapte intelligemment les chemins de redirection selon l'environnement (dev/prod)

3. **Configuration Netlify** (`netlify.toml`)
   - Définit les règles de redirection pour les routes protégées
   - Configure le middleware pour intercepter les requêtes
   - Permet de servir les fichiers statiques après authentification

## Flux d'Authentification

Le processus d'authentification se déroule comme suit :

1. **Tentative d'accès à une route protégée** (ex: `/dashboard` ou `/dashboard/`)
2. **Interception par le middleware** via la configuration Netlify (`auth-middleware.js`)
3. **Vérification des tokens d'authentification** dans les cookies
4. **Si authentifié :**
   - Le contenu demandé est servi
   - En mode développement: redirection vers `/dashboard/index.html` (URL avec extension)
   - En production: redirection vers `/dashboard/` (URL propre sans extension)
5. **Si non authentifié :**
   - Redirection vers `/login?error=auth_required` avec code d'erreur approprié
   - Effacement des cookies invalides le cas échéant

## Configuration Netlify détaillée

Le fichier `netlify.toml` contient plusieurs règles de redirection qui travaillent ensemble :

```toml
# Protection de la route principale
[[redirects]]
  from = "/dashboard"
  to = "/.netlify/functions/auth-middleware"
  status = 200
  force = true

# Protection de la route avec slash final
[[redirects]]
  from = "/dashboard/"
  to = "/.netlify/functions/auth-middleware"
  status = 200
  force = true

# Protection des sous-pages
[[redirects]]
  from = "/dashboard/*"
  to = "/.netlify/functions/auth-middleware"
  status = 200
  force = true

# Cette règle s'applique APRÈS l'authentification
[[redirects]]
  from = "/dashboard/*"
  to = "/dashboard/:splat"
  status = 200
  force = true
```

## Middleware d'Authentification

Le middleware (`netlify/functions/auth-middleware.js`) gère intelligemment les redirections :

```javascript
// Déterminer le chemin de redirection en tenant compte du mode
const isDevMode = process.env.NODE_ENV !== 'production';
const basePath = '/dashboard/';

// En mode développement, toujours utiliser l'extension .html
// En production, utiliser des URL propres sans extension
let redirectPath = isDevMode ? `${basePath}index.html` : basePath;

// Si on accède à une sous-page spécifique
if (path.startsWith('/dashboard/') && path !== '/dashboard/') {
  // Logique pour gérer les sous-pages...
}
```

Cette détection automatique garantit que :
- En **développement**: les URLs explicites avec `.html` sont utilisées pour éviter les problèmes de routing d'Astro
- En **production**: les URLs propres (sans extension) sont utilisées pour une meilleure SEO et UX

## Différences entre développement et production

### Mode Développement

En mode développement, Astro utilise son propre serveur qui nécessite des URL explicites avec extensions `.html` :

- L'accès à `/dashboard` est redirigé vers `/dashboard/index.html`
- Les sous-pages suivent le même modèle avec extension explicite

Ce comportement est nécessaire car le serveur de développement d'Astro traite différemment les routes dynamiques et les fichiers statiques.

### Mode Production

En production sur Netlify, le système fonctionne avec des URLs propres :

- L'accès à `/dashboard` est servi directement par le fichier statique généré
- Les URLs propres sans extension sont utilisées pour une meilleure expérience utilisateur
- Le middleware adapte automatiquement les chemins pour correspondre à ce comportement

## Sécurité des Sessions

Les sessions utilisent des cookies sécurisés avec les protections suivantes :

- Cookies `HttpOnly` pour empêcher l'accès JavaScript
- Option `Secure` en production pour exiger HTTPS
- Attribut `SameSite=Lax` pour limiter les risques CSRF
- Durée de validité limitée à 7 jours

## Test et Débogage

### Prérequis pour les tests

1. **Configuration Supabase**
   - Projet Supabase actif avec authentification par email/mot de passe
   - Utilisateur de test créé

2. **Variables d'Environnement**
   - Fichier `.env` avec les variables Supabase requises

### Débogage en Développement

Pour diagnostiquer les problèmes en mode développement :

1. **Identifiez l'environnement actuel**
   - Le middleware affiche le mode dans les logs : `Chemin demandé: /dashboard (mode développement)`

2. **Vérifiez les redirections HTTP**
   - Utilisez l'onglet Réseau des DevTools pour suivre les redirections
   - Confirmez que le middleware renvoie `/dashboard/index.html` en développement

3. **Observez les logs du serveur**
   - Les logs affichent des informations détaillées sur le flux d'authentification
   - Les erreurs Supabase sont clairement indiquées

## Déploiement et Considérations

Lors du déploiement en production :

1. **Build Astro complet**
   - Assurez-vous que `npm run build` génère correctement le fichier `dist/dashboard/index.html`

2. **Variables d'environnement Netlify**
   - Configurez `SUPABASE_URL` et `SUPABASE_ANON_KEY` dans les variables d'environnement Netlify

3. **Redémarrer les fonctions Netlify**
   - Après modification des variables, redémarrez les fonctions Netlify

## Considérations de Sécurité Supplémentaires

- Limitez les tentatives de connexion avec un mécanisme de rate limiting
- Envisagez d'activer l'authentification à deux facteurs pour les comptes administratifs
- Effectuez des audits de sécurité réguliers sur les tokens et sessions

---

Pour toute question ou assistance, contactez l'équipe technique à hello@pwablo.be. 