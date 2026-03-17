# Système d'authentification

Protection des zones administratives avec Supabase Auth et Netlify Functions.

## Principes

- **Simplicité** : un seul middleware d'authentification
- **Sécurité** : vérification côté serveur des tokens
- **Performance** : minimum de redirections

## Test local

```bash
# .env requis
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-clé-anon

npm run netlify:dev
```

## Documentation

- [Architecture simplifiée](simplified-auth.md) - Système actuel
