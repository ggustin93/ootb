# Système d'Authentification Simplifié

## Architecture

```text
Utilisateur → /dashboard* → auth-check.js → Supabase Auth
                                ↓
                          Authentifié → Dashboard
                          Non auth.  → /login
```

## Composants

### 1. Middleware (`auth-check.js`)

- Vérifie token dans les cookies
- Valide avec `supabase.auth.getUser()`
- Redirige vers `/login` si échec

### 2. API Login/Logout

- `api/login.js` : authentifie via Supabase, définit cookies session
- `api/logout.js` : supprime cookies, déconnecte session

### 3. Configuration Netlify

```toml
[[redirects]]
  from = "/dashboard*"
  to = "/.netlify/functions/auth-check"
  status = 200
  force = true
```

## Sécurité

- Cookies HttpOnly + SameSite=Lax
- Vérification côté serveur avec Supabase Auth
- Seulement 3 fichiers nécessaires
