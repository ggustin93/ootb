# Spécifications - Filtre "Démos Numériques" & Evolution Cartes

**Date** : 23 juillet 2025  
**Objectif** : Valider les spécifications pour l'intégration des démos numériques et l'évolution des cartes d'événements.

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

## 6. Points de validation pour le déploiement test

- [ ] Le filtre "Démos numériques" est présent avec la bonne icône (💻).
- [ ] Le filtre "Ateliers" exclut bien les démos numériques.
- [ ] Le filtre "Démos numériques" affiche uniquement les démos.
- [ ] Le badge "DÉMO NUMERIQUE" est visible sur les cartes des démos.
- [ ] L'heure de fin apparaît correctement sur toutes les cartes d'événement.
- [ ] Les compteurs sur les filtres sont exacts.

---

*Document préparé par Guillaume Pwablo - hello@pwablo.be*