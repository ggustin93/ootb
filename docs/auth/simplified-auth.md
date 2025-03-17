# Système d'Authentification Simplifié

Ce document décrit l'approche simplifiée utilisée pour protéger le tableau de bord administratif d'Out of the Books.

## Architecture

Notre système d'authentification utilise une approche minimaliste avec Supabase Auth et Netlify Functions :

```
┌─────────────┐     ┌───────────────┐     ┌──────────────┐
│ Utilisateur │────▶│ /dashboard*   │────▶│ auth-check.js│
└─────────────┘     └───────────────┘     └──────────────┘
                           │                      │
                           │                      ▼
                           │               ┌──────────────┐
                           │               │  Supabase    │
                           │               │    Auth      │
                           │               └──────────────┘
                           │                      │
                           ▼                      ▼
                    ┌──────────────┐      ┌──────────────┐
                    │   Dashboard   │◀─────│  Authentifié │
                    └──────────────┘      └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │     Login    │
                                          └──────────────┘
```

## Composants

### 1. Middleware d'Authentification (`auth-check.js`)

Fonction serverless légère qui :
- Vérifie la présence et la validité du token dans les cookies
- Permet l'accès au dashboard si l'utilisateur est authentifié
- Redirige vers `/login` en cas d'échec

```javascript
// Extrait simplifié
if (!accessToken) {
  return { statusCode: 302, headers: { 'Location': '/login' }, body: '' };
}

// Vérification avec Supabase
const { data, error } = await supabase.auth.getUser();
if (error) {
  return { statusCode: 302, headers: { 'Location': '/login' }, body: '' };
}

// Utilisateur authentifié, permettre l'accès
return { statusCode: 200, body: '' };
```

### 2. API de Connexion/Déconnexion

Endpoints simples pour gérer l'authentification utilisateur :

- **Connexion** (`api/login.js`) : Authentifie via Supabase et définit les cookies de session
- **Déconnexion** (`api/logout.js`) : Supprime les cookies et déconnecte la session Supabase

### 3. Configuration Netlify

Une seule règle dans `netlify.toml` :

```toml
[[redirects]]
  from = "/dashboard*"
  to = "/.netlify/functions/auth-check"
  status = 200
  force = true
```

## Avantages

Cette approche est :

1. **Simple** : Seulement 3 fichiers nécessaires (vs 10+ avant)
2. **Rapide** : Minimum de redirections et de vérifications
3. **Fiable** : Moins de points de défaillance
4. **Maintenable** : Code facile à comprendre et à modifier

## Sécurité

- Cookies HttpOnly avec SameSite=Lax
- Vérification côté serveur avec Supabase Auth
- Redirections sécurisées
- Tokens d'authentification stockés de manière sécurisée 