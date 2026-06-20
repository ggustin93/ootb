# Journal des modifications — Out of the Books (2026)

Toutes les modifications notables du projet sont documentées dans ce fichier.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

---

## [1.3.0] — Non publié (en attente)

### Ajouté

- **Page dédiée « Projet Erasmus+ »** (`/erasmus-plus/`) — Nouvelle page complète remplaçant l'ancien lien vers l'article MDX. Structure éditable de bout en bout via TinaCMS : héro, section « Le projet » (thématiques + objectifs), « Nos partenaires », « Ressources » (organisées en volets à onglets : podcasts et vidéos), et « Carnet de bord ». Nouvelle collection Tina `erasmusPlus` (création/suppression désactivées, page unique).
- **Miniatures vidéo automatiques** — Nouvel utilitaire `src/utils/erasmusMedia.ts` : un rédacteur colle simplement un lien YouTube (formats `watch`, `youtu.be`, `embed`, `shorts`, `live` pris en charge) et la miniature s'affiche automatiquement, sans upload d'image. Override manuel possible ; fallback générique (dégradé + icône) pour les liens non-YouTube.
- **Composant `MediaCard.astro`** — Carte média unifiée pour la page Erasmus+ : dimensions identiques pour podcasts et vidéos, vignette 16:9, accent visuel cohérent (le type de média est distingué par l'icône, pas la couleur).
- **Section « Conseil d'Administration »** (page À propos) — Nouvelle section `#conseil-administration` listant les membres (photo, nom, fonction optionnelle, lien LinkedIn), entièrement éditable via TinaCMS (`aboutCollection`).
- **Icônes dans les menus déroulants** — Champ `icon` optionnel ajouté aux liens de navigation (`navigationCollection`), rendu dans `Header.astro` (menus desktop et méga-menu mobile). Icônes Tabler associées : Billetterie, Podcasts, Émissions TV, Live Facebook, Fiches pédagogiques, Projet Erasmus+, Nous soutenir.
- **Environnement bac à sable TinaCMS (`staging`)** — La branche éditée par Tina est désormais résolue dynamiquement selon le déploiement (`process.env.TINA_BRANCH || process.env.HEAD || "main"`), permettant un bac à sable `staging--outofthebooks.netlify.app/admin` où les éditeurs testent le CMS et prévisualisent le contenu non publié sans impacter la production. `gitProvider.autoMerge` passé à `false` (les éditions staging ne remontent jamais automatiquement vers `main`). Production inchangée (`HEAD=main` → `branch="main"`). Modèle retenu : deux environnements indépendants — édition directe en production, bac à sable jetable côté staging (réinitialisable depuis `main`).

### Modifié

- **Liens « Projet Erasmus+ » mis à jour** — Toutes les occurrences de navigation pointent désormais vers `/erasmus-plus/` au lieu de l'ancien article MDX `/4_actualites/un-projet-erasmus-pour-innover-ensemble-en-ducation-mdx/`.
- **Menu « Qui sommes-nous »** — Ajout du lien « Conseil d'administration » (ancre `/a-propos/#conseil-administration`).
- **Titres de sections À propos paramétrables** — Les titres des sections Missions, Valeurs et de la liste d'actions deviennent éditables via TinaCMS (`missionsTitle`, `valeursTitle`, `actionsTitle`).

### Maintenance

- Enregistrement de la collection `erasmusCollection` dans `tina/config.ts` ; régénération de `tina/tina-lock.json` après modification du schéma (collections Erasmus+, About, Navigation).
- **Skill Claude Code `tinacms-ootb`** — Documentation repo-spécifique des conventions TinaCMS (versions épinglées, régénération obligatoire de `tina-lock.json`, conventions de collections, pièges de rendu d'images) ajoutée sous `.claude/skills/tinacms-ootb/`.
- **`.gitignore`** — Ignore `.claude/settings.local.json` (réglages locaux par utilisateur) et `*.mov` (binaires/tutoriels hors dépôt).

**Fichiers ajoutés** : `src/pages/erasmus-plus.astro`, `src/content/erasmus-plus/index.json`, `src/components/erasmus/MediaCard.astro`, `src/utils/erasmusMedia.ts`, `tina/erasmusCollection.ts`, `public/images/erasmus/` (cats-family, cofinance-union-europeenne, randers-statsskole), `.claude/skills/tinacms-ootb/`

**Fichiers modifiés** : `src/components/widgets/Header.astro`, `src/content/about/index.json`, `src/content/navigation/index.json`, `src/pages/a-propos.astro`, `tina/aboutCollection.ts`, `tina/navigationCollection.ts`, `tina/config.ts`, `tina/tina-lock.json`, `.gitignore`

---

## [1.2.2] — 2026-04-05

### Corrigé

- **Désynchronisation du schéma Tina résolue** — Erreur `checkTinaSchema` : "The local Tina schema doesn't match the remote Tina schema". `tina-lock.json` avait été corrigé manuellement (commits `496d990`, `f8f7655`) mais restait incomplet par rapport à ce que TinaCMS génère depuis les fichiers TypeScript. Solution : `npx tinacms dev --no-server` régénère le lockfile complet sans blocage cloud — ajout de ~6,5 KB de définitions de types manquantes.

### Maintenance

- Documentation mise à jour : `CLAUDE.md` et `memory-bank/troubleshoot.md` — méthode correcte de régénération du lockfile (`dev --no-server` plutôt que `build`)

**Fichiers modifiés** : `tina/tina-lock.json`

---

## [1.2.1] — 2026-04-05

### Corrigé

- **Accès administration TinaCMS rétabli** — Le build TinaCMS est désormais résilient aux désynchronisations de schéma GraphQL grâce à `--skip-cloud-checks`, tout en échouant sur les vraies erreurs. L'interface `/admin` se génère à nouveau correctement à chaque déploiement.
- **Migration complète vers Netlify** — Le site est désormais entièrement hébergé sur Netlify. L'ancien lien Vercel (`outofthebooks.vercel.app`) a été retiré. Lien unique d'administration : `outofthebooks.com/admin`.

### Maintenance

- Suppression des vestiges Vercel (`vercel.json`, `api/cloudinary/[...media].js`) — remplacés par les fonctions Netlify existantes
- Nettoyage de 7 branches Git mergées (local + remote)

**Fichiers modifiés** : `package.json`, `vercel.json` (supprimé), `api/cloudinary/[...media].js` (supprimé)

---

## [1.2.0] — 2026-03-25

### Fiabilité des formulaires

- **Formulaire fiche pédagogique : fiabilité de l'envoi renforcée** — Chaque formulaire dispose désormais de sa propre configuration isolée, ce qui élimine tout risque d'interférence entre les processus. Des journaux de diagnostic ont été ajoutés pour faciliter le suivi côté hébergement.
- **Fiche pédagogique : prise en charge de l'année 2026** — Les années 2026 à 2029 ont été ajoutées dans l'interface d'administration de la base de données. Les fiches de cette année s'enregistrent normalement. 13 tests de validation confirment le bon fonctionnement.
- **Formulaire de contact : même isolation de configuration** — Le formulaire de contact bénéficie de la même amélioration que les fiches pédagogiques : configuration propre à chaque formulaire, sans interférence possible.
- **Newsletter : intégration Brevo stabilisée en production** — La connexion entre le site et Brevo (le service d'envoi d'emails) a été adaptée pour être pleinement compatible avec l'environnement d'hébergement. L'envoi fonctionne de manière fiable en production.
- **Newsletter : enregistrement du consentement RGPD aligné sur la base** — Suite à une évolution de la structure de la base de données, le code a été mis à jour pour correspondre exactement aux colonnes actuelles. Le consentement "Politique de confidentialité acceptée" est désormais correctement enregistré à chaque inscription.
- **Newsletter : mise à jour d'une ré-inscription également corrigée** — La mise à jour du consentement lors d'une ré-inscription bénéficie du même alignement.

### Mis à jour

- **Badge écoconception (pied de page)** — Lien mis à jour vers Website Carbon, score actualisé : note A, plus propre que 93 % des sites web, 0,04 g CO₂ par visite.

### Amélioré

- **Newsletter : messages d'information clairs pour les visiteurs** — Les messages affichés en cas de difficulté technique ont été réécrits en langage courant. Si le service est momentanément indisponible, le visiteur voit *"Le service d'inscription est temporairement indisponible. Veuillez réessayer dans quelques minutes."* Les détails techniques restent consignés dans les journaux internes.

### Ajouté

- **Tests automatisés des 3 formulaires** (45 tests au total) — La suite de tests a été mise à jour pour refléter la structure actuelle de la base de données et vérifier le bon enregistrement du consentement RGPD.
- **Tests de bout en bout avec la vraie base de données** — 3 scripts de test vérifient le cycle complet en conditions réelles : soumission, vérification en base, puis nettoyage automatique des données de test.
- **Documentation de la suite de tests** — Un guide de démarrage rapide a été rédigé pour les formulaires, avec la référence des identifiants de base de données et un tableau d'aide au diagnostic.

### Maintenance

- Nettoyage de la structure du projet : suppression de fichiers de configuration inutilisés et de documentation obsolète.

**Fichiers modifiés** : `netlify/functions/submit-newsletter.js`, `netlify/functions/submit-pedagogical-sheet.js`, `netlify/functions/submit-contact.js`, `netlify/functions/__tests__/all-functions.test.js`, `netlify/functions/__tests__/e2e-submit-newsletter.js`, `README.md`, `CHANGELOG-2026.md`

---

## [1.1.0] — 2026-03-18

### Corrigé
- **Bug récurrent de date "Bulle d'R"** : correction du script `build-fiches-pedagogiques.js` qui réattribuait `publishDate: new Date()` à la fiche "Bulle d'R" à chaque build. La date d'origine (août 2025) est désormais collectée et préservée avant la suppression/recréation des fichiers.
- **Algorithme d'affichage Homepage** : vérification et confirmation de l'algorithme de diversité dans `src/utils/blog.ts` — les 3 dernières publications respectent un plafond souple de 2 contenus max par type (podcast, actualité, etc.)

**Fichiers modifiés** : `src/scripts/build-fiches-pedagogiques.js`, `src/utils/blog.ts`

---

## [1.0.1] — 2026-03-17

### Corrigé
- **Build cassé (HOTFIX)** : remplacement de l'icône invalide `tabler:moojo` (causant le crash Astro) par `tabler:heart` dans la section Premium de `src/content/homepage/index.json`
- **Perte de données TinaCMS** : restauration des champs `color` dans les 7 contentTypes de `src/content/blog/blog.json`, supprimés involontairement par un commit automatique du CMS
- **Script de build Netlify** : correction pour gérer les avertissements TinaCMS sans bloquer le déploiement
- **Libellés section Premium** : mise à jour dans `src/content/navigation/index.json` pour refléter le nouveau positionnement "Nous soutenir"

### Ajouté
- **Protection du schéma Tina** : champ `color` caché ajouté dans `tina/blogCollection.ts` pour empêcher toute suppression future des couleurs de catégories par le CMS
- **Icônes réseaux sociaux** : ajout de `tabler:brand-linkedin` et `tabler:brand-instagram` dans les 4 menus déroulants d'icônes de `tina/homepageCollection.ts`
- **Documentation incident** : ajout de `claudedocs/reponse-alexia-17-03-2026.md` détaillant l'incident et la résolution

### Amélioré
- **UX Éditeur TinaCMS** : remplacement des champs texte libre pour les icônes par des menus déroulants sécurisés dans `tina/homepageCollection.ts`, empêchant définitivement l'erreur "icône invalide"
- **Navigation** : renommage de "Contenu Premium" en "Nous soutenir" dans le menu principal et la page dédiée

### Maintenance
- Condensation de la documentation pour plus de clarté
- Réorganisation et extension du `.gitignore`

**Fichiers modifiés** : `tina/blogCollection.ts`, `tina/homepageCollection.ts`, `src/content/blog/blog.json`, `src/content/homepage/index.json`, `src/content/navigation/index.json`, `.gitignore`, `CHANGELOG-2026.md`

### Contenu éditorial (TinaCMS)
- Mises à jour de contenu via le CMS (14 modifications) : section "Nous soutenir" (crowdfunding MyMoojo), ajout et modification d'articles (podcasts, actualités), mise à jour des événements du festival

---

## [1.0.0] — 2026-01-26

### Ajouté
- **Handler Cloudinary pour Netlify Functions** : gestion complète des médias TinaCMS via `api/cloudinary/[...media].js` (route catch-all conforme à la doc TinaCMS)
- **Configuration Vercel** : ajout de `vercel.json` pour le framework Astro et les routes API

### Corrigé
- **Handler Cloudinary** : réécriture avec l'API Web Standard (`Request`/`Response`) pour compatibilité Vercel + Astro dans `netlify/functions/cloudinary-media.mjs`
- **Boucle de redirection admin** : suppression du fichier `public/_redirects` causant une boucle infinie sur `/admin`
- **Accès Cloudinary en preview** : autorisation de l'accès sur les previews de déploiement Netlify
- **Compatibilité Node.js** : restriction aux versions 18, 20 et 22 dans `package.json` (engines)
- **Playwright sur CI** : désactivation de l'installation automatique de Playwright sur Vercel/Netlify (environnement CI)
- **Logs diagnostic** : ajout de logs pour déboguer les problèmes d'upload Cloudinary

### Maintenance
- Suppression du support de Node.js 18 (conservation de v20 et v22 uniquement)

**Fichiers modifiés** : `api/cloudinary/[...media].js`, `api/cloudinary/media.js`, `astro.config.ts`, `netlify.toml`, `netlify/functions/cloudinary-media.mjs`, `package.json`, `public/_redirects`, `vercel.json`

### Contenu éditorial (TinaCMS)
- Mise à jour de contenu via le CMS (1 modification)

---

## [0.9.0] — 2026-01-21

### Ajouté
- **Dates du festival centralisées depuis TinaCMS** : les éditeurs saisissent les dates dans `src/content/festival/tina/index.json`, les noms de jours et l'année sont calculés automatiquement via `src/config/festival.ts` (Festival 2026 : 30 sept - 2 oct)
- **Tests E2E dates du festival** : ajout de `tests/e2e/scenarios/festival-dates.spec.js` pour vérifier l'affichage correct des dates

### Corrigé
- **Affichage dates TinaCMS** : correction de l'affichage complet des dates dans l'interface d'édition via `tina/festivalCollection.ts`
- **Description des dates** : simplification des descriptions de champs dans le schéma Tina

### Maintenance
- Nettoyage de la configuration Playwright : suppression du doublon `playwright.config.js`, conservation du `.ts` uniquement
- Ajout d'un script `postinstall` dans `package.json` pour l'installation automatique des navigateurs de test
- Correction des violations du mode strict Playwright et tests de badges (`badge-consistency.spec.js`) rendus indépendants du contenu

**Fichiers modifiés** : `src/config/festival.ts`, `src/content/festival/tina/index.json`, `tina/festivalCollection.ts`, `playwright.config.ts`, `package.json`, `tests/e2e/scenarios/festival-dates.spec.js`, `tests/e2e/scenarios/badge-consistency.spec.js`

### Contenu éditorial (TinaCMS)
- Mises à jour de contenu via le CMS (3 modifications)

---

## Contenu éditorial (TinaCMS)

Les mises à jour de contenu réalisées via le CMS sont regroupées ci-dessous par date.

| Date | Modifications | Description |
|------|:---:|-------------|
| 2026-01-22 | 14 | Mises à jour massives de contenu (articles, pages) |
| 2026-01-27 | 10 | Mises à jour de contenu (articles, événements) |
| 2026-01-29 | 14 | Mises à jour de contenu (articles, événements, pages) |

---

## [0.8.0] — 2026-01-01

### Maintenance (effectuée fin décembre 2025)
- Migration de l'infrastructure vers Ubuntu 24.04 suite à la fin du support de la version précédente
- Mise à jour de Node.js et des dépendances critiques pour garantir la stabilité et la sécurité
- Restructuration du support et de la maintenance (packs prédéfinis) pour 2026

---

*Ce fichier couvre les modifications depuis le 1er janvier 2026. Pour l'historique antérieur, consultez le dépôt Git.*
