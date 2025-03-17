# Système d'authentification

Protection des zones administratives avec Supabase Auth et Netlify Functions.

## Principes clés

1. **Simplicité** : Approche minimaliste avec un seul middleware d'authentification
2. **Sécurité** : Vérification côté serveur des tokens d'authentification
3. **Performance** : Minimum de redirections et de vérifications

## Test local

```bash
# Variables d'environnement nécessaires dans .env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-clé-anon

# Lancer en mode dev avec fonctions Netlify
npm run netlify:dev
```

## Documentation détaillée

- [Système d'authentification simplifié](simplified-auth.md) - Architecture actuelle
- [~~Protection du Tableau de Bord~~](dashboard-protection.md) - Ancienne architecture (déprécié)
