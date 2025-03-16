# Gestion des plans Netlify

## Vue d'ensemble

Ce document décrit les stratégies de gestion des plans Netlify pour notre projet, notamment comment gérer les limitations de minutes de build du plan gratuit et optimiser les coûts.

## Plans disponibles

Netlify propose plusieurs plans avec différentes limites de minutes de build :

| Plan | Minutes de build | Coût |
|------|-----------------|------|
| Starter | 300/mois | Gratuit |
| Pro | 1000/mois | $19/mois |
| Business | 3000/mois | $99/mois |

## Gestion des limitations de minutes

### Surveillance de l'utilisation

1. Vérifiez régulièrement l'utilisation des minutes de build dans le tableau de bord Netlify
2. Configurez des alertes d'utilisation dans les paramètres de notification

### Stratégies d'optimisation

#### 1. Optimisation des builds

- Utilisez le cache de dépendances Netlify
- Limitez les déploiements de preview aux branches principales
- Optimisez les scripts de build pour réduire leur durée

#### 2. Passage temporaire à un plan payant

Lorsque vous approchez la limite des 300 minutes du plan gratuit, vous pouvez :

1. **Passer temporairement à un plan payant** :
   - Accédez à `Team settings > Billing`
   - Sélectionnez le plan "Pro" ou "Business"
   - Votre quota de minutes sera immédiatement augmenté

2. **Revenir au plan gratuit** :
   - Avant la fin du cycle de facturation, retournez aux paramètres de facturation
   - Sélectionnez "Downgrade to Starter"
   - Netlify facturera au prorata uniquement pour la période d'utilisation du plan payant

3. **Points importants** :
   - Aucune interruption de service lors du passage entre les plans
   - Les minutes de build sont réinitialisées au début de chaque cycle de facturation
   - La facturation est calculée au prorata des jours d'utilisation

#### 3. Achat de minutes supplémentaires

Pour des besoins ponctuels sans changer de plan :

- Achetez des packs de minutes additionnelles (100 minutes pour $7)
- Cette option est disponible dans les paramètres de facturation

## Calendrier recommandé

Pour optimiser les coûts :

1. Utilisez le plan gratuit en début de mois
2. Surveillez l'utilisation des minutes vers le milieu du mois
3. Passez au plan payant uniquement lorsque nécessaire
4. Revenez au plan gratuit avant le début du cycle de facturation suivant

## Bonnes pratiques

1. **Planification des déploiements** : Regroupez les déploiements mineurs pour réduire le nombre total de builds
2. **Tests locaux** : Effectuez des tests approfondis en local avant de pousser les modifications
3. **Branches de fonctionnalités** : Utilisez des branches de fonctionnalités et ne fusionnez que lorsque le code est stable
4. **Documentation des changements de plan** : Documentez les changements de plan dans le journal de maintenance du projet

## Ressources

- [Documentation officielle Netlify sur la facturation](https://docs.netlify.com/accounts-and-billing/billing/)
- [Optimisation des builds Netlify](https://docs.netlify.com/configure-builds/manage-dependencies/)
- [Paramètres de notification Netlify](https://docs.netlify.com/monitor-sites/notifications/) 