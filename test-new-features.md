# Test des nouvelles fonctionnalités

## ✅ Fonctionnalités implémentées

### 1. Liens partenaires cliquables

#### Sur la page Festival (`/festival/#partenaires`)
- [x] Composant `PartnerGrid.astro` mis à jour avec support URL
- [x] Collection TinaCMS festival étendue avec champs `nom` et `url`
- [x] Page festival mise à jour pour rendre les logos cliquables
- [x] Données festival enrichies avec noms et URLs de partenaires

#### Sur la page À propos (`/a-propos/#partenaires`)
- [x] Liens conditionnels (pas de lien si URL = '#')
- [x] Meilleure accessibilité avec `aria-label`

### 2. Système de toggle pour bouton header

#### Configuration TinaCMS
- [x] Collection navigation étendue avec système de toggle
- [x] Deux modes : `festival` et `community`
- [x] Configuration pré-définie pour chaque mode

#### Fonctionnalité
- [x] Toggle dans TinaCMS pour basculer entre:
  - 🎪 **Mode Festival**: "Prendre votre ticket" → billetterie
  - 🤝 **Mode Communauté**: "Rejoindre la communauté" → ancre

#### Composant Header
- [x] Logique de rendu conditionnelle
- [x] Rétrocompatibilité avec ancienne structure
- [x] Types TypeScript mis à jour

## 🧪 Tests à effectuer

1. **Test des partenaires**:
   - [ ] Accéder à `/festival/#partenaires`
   - [ ] Vérifier que les logos avec URL sont cliquables
   - [ ] Vérifier que les logos sans URL ne sont pas cliquables
   - [ ] Tester l'ouverture des liens en nouvel onglet

2. **Test du toggle bouton**:
   - [ ] Accéder à TinaCMS Admin
   - [ ] Aller dans Navigation → header → actions
   - [ ] Basculer entre mode Festival et Communauté
   - [ ] Vérifier que le bouton change dans le header

3. **Test responsive**:
   - [ ] Vérifier sur mobile
   - [ ] Vérifier sur desktop

## 🎯 Prochaines étapes

Alexia peut maintenant :
1. **Gérer les liens partenaires** dans TinaCMS :
   - Ajouter des URLs aux partenaires existants
   - Les logos deviennent automatiquement cliquables

2. **Basculer facilement le bouton header** :
   - Un simple dropdown dans TinaCMS
   - Passage instantané entre "billetterie" et "communauté"
   - URLs pré-configurées pour chaque mode

## 📋 URLs configurées

### Partenaires Festival
- Fédération Wallonie-Bruxelles: https://www.federation-wallonie-bruxelles.be/
- Ville de Wavre: https://www.wavre.be/
- Daoust: https://www.daoust.be/
- IFPC: https://www.ifpc.be/
- TV Com: https://www.tvcom.be/

### Boutons Header
- **Festival**: https://billetterie-festival-ootb.com
- **Communauté**: /#rejoindre
