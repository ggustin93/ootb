# Journal des modifications — Out of the Books

Toutes les modifications notables du projet sont documentées dans ce fichier.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

---

## [Non publié] — 2026-03-17

### Corrigé
- **Build cassé** : remplacement de l'icône invalide `tabler:moojo` par `tabler:heart` dans la section Premium de la homepage — l'icône inexistante empêchait la construction du site depuis le 17/03
- **Couleurs des catégories** : restauration des champs `color` dans les 7 contentTypes de `blog.json` (supprimés par un commit TinaCMS automatique)
- **Protection Tina** : ajout du champ `color` caché (`component: () => null`) dans le schéma Tina de `blogCollection.ts` pour éviter toute suppression future par TinaCMS
- **Icônes manquantes** : ajout de `tabler:brand-linkedin` et `tabler:brand-instagram` aux 4 menus déroulants d'icônes dans `homepageCollection.ts`

### Modifié
- **Champs icône** : conversion de 4 champs texte libre en menus déroulants dans TinaCMS (`homepageCollection.ts`) — empêche la saisie d'icônes invalides
- **Navigation** : renommage de « Contenu premium » en « Nous soutenir » dans le menu « Nos contenus »

### Ajouté
- **Réponse Alexia** : `claudedocs/reponse-alexia-17-03-2026.md` — communication expliquant le problème de build et les correctifs

---

## 2026-03-17 — Commits TinaCMS

### Modifié
- Mises à jour de contenu via TinaCMS (064dc94, c6642bc, b30c24f, 61de85e, edbabd6, 2e77bb4, 1e424d4)
  - Modifications section Premium (crowdfunding MyMoojo)
  - Ajout/modification d'articles (podcast, actualités)
  - **Note** : le commit `b30c24f` a involontairement supprimé les champs `color` des contentTypes

---

## 2026-03-17 — Maintenance

### Modifié
- `docs`: condensation de la documentation pour plus de clarté (5fb48de)
- `chore`: réorganisation et extension du `.gitignore` (4eeff5d)
