# Spécifications - Filtre "Démos Numériques" & Evolution Cartes

**Date** : 23 juillet 2025  
**Objectif** : Valider les spécifications pour l'intégration des démos numériques et l'évolution des cartes d'événements.  
**Statut** : ✅ **IMPLÉMENTÉ ET DÉPLOYÉ** - Prêt pour validation client  
**Dernière mise à jour** : 04/08/2025

---

## 1. Contexte du projet

Les démos numériques constituent une nouvelle catégorie d'événements destinée aux acteurs du digital. Ces événements sont techniquement configurés comme des ateliers dans la base de données et se déroulent dans le nouveau lieu "Village numérique" que vous avez créé.

**Éléments confirmés :**
- Type d'événement : Atelier
- Localisation : Village numérique
- Planification : Sur les trois jours du festival
- Formulaire : Processus de soumission standard des ateliers

---

## 2. Interface actuelle

> **📸 Screenshot du programme**  
> *Insérer ici une capture d'écran de l'interface actuelle des filtres pour référence visuelle*

**État actuel des filtres :**
```
[Tous les types 129] [Conférences 43] [Ateliers 16] [Stands 70]
```

---

## 3. Spécifications fonctionnelles et visuelles

### 3.1 Logique de filtrage

La solution retenue est celle des **filtres séparés** pour garantir une clarté maximale à l'utilisateur.

- Le filtre **"Ateliers"** affichera uniquement les ateliers classiques.
- Le nouveau filtre **"Démos numériques"** affichera uniquement les démos.

### 3.2 Évolution de l'interface de filtrage

- **Ajout du bouton :** Un nouveau bouton de filtre **"Démos numériques"** sera ajouté.
- **Style :** Il conservera le même style visuel que les autres filtres de type pour assurer la cohérence de l'interface.
- **Iconographie :** L'icône 💻 (ordinateur portable) sera utilisée.

### 3.3 Évolution des cartes d'événement (EventCard)

Les cartes des événements seront mises à jour pour inclure deux nouvelles informations :

1.  **Badge pour les démos :**
    - **Solution :** Ajout d'un badge avec le libellé **"DÉMO NUMERIQUE"**.
    - **Position :** Coin supérieur droit de la carte.
    - **Concerne :** Uniquement les événements de type "Démo numérique".

2.  **Heure de fin :**
    - **Solution :** Ajout de l'heure de fin à côté de l'heure de début (ex: `10:00 - 11:00`).
    - **Durées par défaut :** Ateliers normaux et Conférences = 1h, Démos numériques = 30min.
    - **Concerne :** Toutes les cartes d'événements (Ateliers, Conférences, Démos).

---

## 4. Aperçu du résultat

### Interface après modification
```
[Tous les types 129] [Conférences 43] [Ateliers 10] [Démos numériques 6] [Stands 70]
```
*Les nombres seront calculés automatiquement selon les données réelles*

> **📸 Mockup de la nouvelle carte événement**  
> *Insérer ici un visuel de la carte avec le badge et l'heure de fin*

---

## 5. Spécifications techniques

### 5.1 Critère d'identification
```javascript
events.filter(event => 
  event.type === 'Ateliers' && 
  event.location === 'Village numérique'
)
```

### 5.2 Fichiers et données concernés
```
src/utils/eventFilters.js         → Logique de filtrage
src/components/ui/DayFilter.astro → Bouton de filtre
src/components/ui/EventCard.astro → Badge + Heure de fin
src/types/festival.ts            → Types (ajout heure_fin)
Données sources (JSON/NocoDB)      → Ajout du champ `heure_fin`
```

### 5.3 Estimation projet

**Préparation** : 1h (analyse + réunion)  
**Développement** : 4h15 (code + tests + déploiement test)  
**Total** : 5h15

### 5.4 Workflow
1. Branche dédiée → 2. URL test Netlify → 3. Validation Sophie → 4. Production

---

## 6. ✅ IMPLÉMENTATION TERMINÉE - Janvier 2025

### 6.1 Fonctionnalités Développées et Testées

**✅ Filtre "Démos Numériques" :**
- [x] Nouveau bouton de filtre avec icône desktop (💻)
- [x] Filtrage exclusif entre "Ateliers" et "Démos numériques"
- [x] Compteurs précis dans les badges des filtres
- [x] Détection automatique : `type === 'Ateliers' && location === 'Village numérique'`

**✅ Cartes d'Événements Améliorées :**
- [x] Badge violet "Démo numérique" pour les démos (coin supérieur droit)
- [x] Affichage des heures de fin : format "10:00 - 10:30"
- [x] Durées intelligentes : 1h (ateliers/conférences), 30min (démos)
- [x] Compatible avec tous les types d'événements

**✅ Architecture Technique :**
- [x] Logique de filtrage côté serveur et client corrigée
- [x] Calculs de durée automatiques avec fallbacks
- [x] Validation complète et debugging résolu
- [x] Code production-ready sans refactoring nécessaire

### 6.2 Déploiement pour Validation Client

**🚀 Branche de Test Déployée :**
- **Branche :** `feature/digital-demos-filter`
- **Commit :** `c699040` - "feat(festival): implement digital demos filter system"
- **URL Netlify :** Prêt pour validation Sophie
- **Données de test :** Démo "Introduction à l'IA en Classe" incluse

### 6.3 Points de Validation Client

**À valider par Sophie sur l'URL de test :**

- [ ] **Interface de Filtrage :**
  - [ ] Bouton "Démos numériques" visible avec icône desktop
  - [ ] Filtrage exclusif fonctionne (Ateliers vs Démos)
  - [ ] Compteurs corrects dans les badges
  
- [ ] **Cartes d'Événements :**
  - [ ] Badge violet "Démo numérique" sur les démos
  - [ ] Heures de fin affichées (format "10:00 - 10:30")
  - [ ] Positionnement et lisibilité du badge
  
- [ ] **Expérience Utilisateur :**
  - [ ] Navigation fluide entre les filtres
  - [ ] Cohérence visuelle avec l'interface existante
  - [ ] Fonctionnement sur mobile et desktop

### 6.4 Prochaines Étapes

**Après validation client :**
1. **Merge en production** → branche `main`
2. **Déploiement live** → outofthebooks.com
3. **Monitoring** → utilisation des filtres et performance

**Temps total réalisé :** ~9h (vs estimation 5h15 - debugging supplémentaire requis)

---

## 7. Informations Techniques pour le Client

### 7.1 Données de Démonstration
Un événement de test a été ajouté pour la validation :
```
"Démo Numérique: Introduction à l'IA en Classe"
📍 Village numérique
⏰ 10:00 - 10:30 (30 minutes)
🏷️ Badge "Démo numérique"
```

### 7.2 Fonctionnement Automatique
- **Détection intelligente :** Les événements du "Village numérique" sont automatiquement identifiés comme démos
- **Durées par défaut :** Système intelligent avec 1h pour ateliers/conférences, 30min pour démos
- **Mise à jour automatique :** Les compteurs se mettent à jour automatiquement selon les données

---

*Document préparé par Guillaume Pwablo - hello@pwablo.be*  
*Implémentation terminée : Janvier 2025*