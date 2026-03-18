# Journal des modifications — Out of the Books

Toutes les modifications notables du projet sont documentées dans ce fichier.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

---

## [1.1.0] — 2026-03-18

### Corrigé (2026-03-18)
- **Bug récurrent de date ("Bulle d'R")** : correction du script de génération des fiches (`src/scripts/build-fiches-pedagogiques.js`) qui réattribuait la date du jour à la fiche "Bulle d'R" à chaque build. La date d'origine (août 2025) est désormais préservée.
- **Logique d'affichage Homepage** : vérification et confirmation de l'algorithme de diversité (max 2 contenus du même type) pour l'affichage des 3 dernières publications.

### Corrigé (2026-03-17)
- **Build cassé (HOTFIX)** : remplacement de l'icône invalide `tabler:moojo` (causant le crash du site) par `tabler:heart` dans la section Premium.
- **Perte de données TinaCMS** : restauration des champs `color` dans `blog.json`, supprimés involontairement par un commit automatique du CMS.
- **Protection Schéma** : sécurisation du schéma Tina (`blogCollection.ts`) avec un champ `color` caché pour empêcher toute suppression future.
- **Icônes manquantes** : ajout de `tabler:brand-linkedin` et `tabler:brand-instagram` aux 4 menus déroulants d'icônes dans `homepageCollection.ts`.

### Amélioré
- **UX Éditeur** : remplacement des champs texte libre pour les icônes par des menus déroulants sécurisés dans TinaCMS (`homepageCollection.ts`), prévenant définitivement l'erreur "icône invalide".
- **Navigation** : renommage de "Contenu Premium" en "Nous soutenir" dans le menu principal et sur la page dédiée, suite à la demande client.

### Ajouté
- **Documentation** : ajout de `claudedocs/reponse-alexia-17-03-2026.md` détaillant l'incident et la résolution pour le client.

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
