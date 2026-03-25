# Journal des modifications — Out of the Books (2026)

Toutes les modifications notables du projet sont documentées dans ce fichier.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

---

## [1.2.0] — 2026-03-25

### Corrigé

- **Formulaire fiche pédagogique : erreur au moment de l'envoi** — Le formulaire échouait silencieusement lors de la transmission des données à la base. Cause identifiée : un conflit de configuration interne entre deux processus qui utilisaient le même paramètre pour des besoins différents. Résolu en attribuant à chaque formulaire sa propre configuration isolée. Des journaux de diagnostic ont été ajoutés pour faciliter l'identification de toute erreur future côté hébergement.
- **Fiche pédagogique : l'année 2026 était rejetée à l'enregistrement** — La liste des années valides dans la base de données ne contenait pas encore 2026. Résolu en ajoutant manuellement les années 2026 à 2029 dans l'interface d'administration de la base. Aucune modification du code nécessaire. 13 tests de validation passent avec succès après correction.
- **Formulaire de contact : même problème de configuration isolée** — Le formulaire de contact partageait des paramètres de configuration génériques avec les autres formulaires, alors que chacun pointe vers un espace de données distinct. Chaque formulaire dispose désormais de sa propre configuration dédiée, sans risque d'interférence.
- **Newsletter : le service d'envoi Brevo ne démarrait pas en production** — L'intégration avec Brevo (le service d'envoi d'emails) plantait au lancement sans message d'erreur explicite. Cause : une incompatibilité technique entre la version du module Brevo utilisée et l'environnement d'exécution du site. Résolu par une adaptation du mode de chargement du module.
- **Newsletter : le consentement RGPD n'était jamais enregistré** — La structure de la base de données avait évolué (3 colonnes au lieu de 6 attendues) et le nom exact d'un champ avait changé. Résultat : la case "Politique de confidentialité acceptée" était transmise sous un nom que la base ne reconnaissait pas, et la valeur n'était donc jamais sauvegardée. Alignement du code sur la structure réelle de la base. Validation renforcée pour s'assurer que la valeur reçue est bien un consentement explicite.
- **Newsletter : même désalignement lors d'une ré-inscription** — Quand un utilisateur déjà inscrit soumettait à nouveau le formulaire, la mise à jour de son enregistrement souffrait du même décalage. Corrigé de la même façon.

### Mis à jour

- **Badge écoconception (pied de page)** — Lien mis à jour vers Website Carbon, score actualisé : note A, plus propre que 93 % des sites web, 0,04 g CO₂ par visite.

### Amélioré

- **Newsletter : messages d'erreur compréhensibles pour les visiteurs** — Les messages d'erreur affichés aux utilisateurs en cas de problème ont été réécrits en langage courant. Auparavant, des messages techniques pouvaient apparaître. Désormais : si le service est indisponible, le visiteur voit *"Le service d'inscription est temporairement indisponible. Veuillez réessayer dans quelques minutes."* ; si l'enregistrement échoue, *"Nous n'avons pas pu enregistrer votre inscription. Veuillez réessayer ou nous contacter si le problème persiste."* Les détails techniques restent consignés dans les journaux internes.

### Ajouté

- **Tests automatisés des 3 formulaires** (45 tests au total) — La suite de tests unitaires a été mise à jour pour refléter la structure réelle de la base de données : vérification du nom exact du champ de consentement RGPD, confirmation de l'absence des anciens champs supprimés.
- **Tests de bout en bout avec la vraie base de données** — 3 scripts de test effectuent un cycle complet réel : soumission du formulaire, vérification que les données ont bien été enregistrées dans NocoDB, puis suppression automatique des données de test. Des garde-fous sont en place pour éviter toute pollution de la base : les entrées de test sont préfixées `[E2E-TEST]`, le nettoyage est garanti même en cas d'erreur, et les tests refusent de s'exécuter sans les autorisations nécessaires.
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
