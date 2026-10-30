# Journal des modifications — Out of the Books (2026)

Toutes les modifications notables du projet sont documentées dans ce fichier.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

---

## [1.4.3] — 2026-10-30

### Éditeur de pages mieux protégé (#41)

- **Protection supplémentaire de l'éditeur** — Une règle de sécurité ajoutée à l'éditeur de pages (TinaCMS) l'empêche d'afficher un site extérieur dans sa fenêtre d'aperçu (« Content Security Policy »). Elle complète l'éditeur en attendant sa prochaine mise à jour majeure, qui est prévue.
- **Rien ne change pour vous** — Connexion, articles, podcasts, images, aperçu et enregistrement fonctionnent comme avant. Tout a été testé sur la version de test avant la mise en ligne.
- **Le site public n'est pas concerné** — La règle ne s'applique qu'à l'éditeur.

### Contrôles automatiques

- **Mentions légales et politique de confidentialité** — Les modifier depuis l'éditeur ne déclenche plus d'alerte dans les contrôles automatiques du site.

**Fichiers modifiés** : `netlify.toml`, `.prettierignore`

---

## [1.4.2] — 2026-10-29

### Mises à jour de sécurité

- **Médiathèque de l'éditeur** — La brique qui vérifie l'identité des éditrices avant un envoi ou une suppression d'image (`@tinacms/auth`) est à jour. Elle s'assure désormais que la personne connectée appartient bien à votre projet. Rien ne change dans votre façon de travailler.
- **Suppression d'images réparée** — Le bouton « Supprimer » de la médiathèque n'effaçait pas réellement l'image chez Cloudinary. C'est corrigé.
- **Formulaires du site** — La brique qui transmet les envois à la base de données (`axios`, via NocoDB) passe à sa dernière version corrigée.

### Tableau de bord

- **Journal des interventions dans votre tableau de bord** — L'historique des interventions est désormais accessible depuis votre tableau de bord (rubrique « Hébergement et maintenance »).

**Fichiers modifiés** : `netlify/functions/cloudinary-media.mjs`, `netlify.toml`, `src/pages/dashboard.astro`, `src/pages/dashboard/journal.astro` (nouveau), `package.json`, `package-lock.json`

---

## [1.4.1] — 2026-10-29

### Accès au site rétabli et surveillance automatique du certificat (#35)

- **Le site est de nouveau accessible via outofthebooks.com** — Depuis le 26 octobre, les navigateurs bloquaient l'adresse, car la « carte d'identité » du site (le certificat SSL, celui du petit cadenas) avait expiré. Le site lui-même n'a jamais été hors ligne : il restait accessible via `outofthebooks.netlify.app`. Le certificat est renouvelé (valable jusqu'au 27 janvier 2027) et se renouvellera de nouveau automatiquement.
- **Cause** — Fin septembre, la vérification du nom de domaine entre l'hébergeur (Netlify) et OVH a échoué ponctuellement, et Netlify n'a pas retenté le renouvellement. La configuration chez OVH est correcte : rien à changer de votre côté.
- **Nouvelle alerte quotidienne** — Le certificat est maintenant vérifié chaque jour, automatiquement (une « GitHub Action »). En cas de souci, je reçois un e-mail environ trois semaines avant l'échéance, bien avant que le problème se voie. L'alerte s'adapte d'elle-même aux certificats plus courts prévus à partir de 2027.
- **Vérifié** — Aucun signe d'intrusion : le DNS, les certificats émis et les derniers déploiements sont conformes. Le site et ses données sont intacts.

**Fichiers modifiés** : `.github/workflows/ssl-check.yml` (nouveau)

---

## [1.4.0] — 2026-10-23

### Espace administrateur mieux protégé (#34)

- **Un vrai mot de passe, vérifié par le serveur** — Avant, le mot de passe de l'espace administrateur était écrit dans le code de la page, et quelqu'un d'un peu technique pouvait le retrouver et lire la page sans le connaître. Désormais, c'est l'hébergeur (Netlify) qui vérifie le mot de passe avant d'envoyer la page (authentification côté serveur). Sans le bon mot de passe, rien n'est affiché.
- **Nouveau mot de passe** — Il vous est transmis séparément. L'ancien ne fonctionne plus.
- **Connexion** — Votre navigateur ouvre une petite fenêtre : saisissez n'importe quel identifiant et le mot de passe. Si rien ne s'affiche (certains navigateurs intégrés), une page d'aide en français explique quoi faire.
- **Déconnexion** — Nouveau bouton « Se déconnecter » dans le menu. Il fonctionne dans Chrome, Firefox et Edge. Dans Safari, il faut fermer complètement le navigateur.
- **L'ancienne adresse `/ootb` fonctionne toujours** — Elle renvoie directement vers le tableau de bord.
- **La page n'apparaît pas dans Google** (`noindex`).

### Tableau de bord plus clair

- **« Modifier le site » réunit vos deux outils**, avec ce que chacun permet de faire :
  - **Éditeur de pages (TinaCMS)** : textes, images et menus des pages, articles.
  - **Base de données (NocoDB)** : programme du festival, fiches pédagogiques, messages reçus par les formulaires.
  - Un tableau « Je veux… → Allez dans… » indique quel outil ouvrir selon la tâche.
- **Rappel pour NocoDB** — Les changements faits dans NocoDB apparaissent sur le site après un clic sur « Redéployer le site web » (table « Actions spéciales »).
- **Statistiques de visite visibles directement** dans le tableau de bord (Umami), avec un lien pour les ouvrir dans un nouvel onglet.
- **Éco-responsabilité** — Le résultat Website Carbon de la page d'accueil (note A, environ 0,04 g de CO₂ par visite, plus sobre que 93 % des pages web), pourquoi c'est important et les bons gestes pour les images.
- **Plus lisible** — Titres plus petits et mieux hiérarchisés, sections repliées par défaut, utilisables au clavier, et textes raccourcis.
- **Retirés** — Google Search Console (pas utilisé), la prise de rendez-vous Cal.com et un bloc de contact en double.
- **Nouveau numéro de téléphone** pour le support : 0494 87 89 36.

**Fichiers modifiés** : `src/pages/dashboard.astro`, `netlify/edge-functions/portal-auth.ts` (nouveau), `netlify.toml`, `src/pages/ootb.astro` (supprimé)

### Site public un peu plus léger (aucun changement visible)

- **Billetterie du festival** — Les icônes du bouton et de la fenêtre de billetterie sont maintenant intégrées au site. Avant, elles étaient téléchargées à chaque visite auprès de trois services externes. Cela fait 3 requêtes en moins par visite, et l'adresse IP des visiteurs n'est plus envoyée à ces services.
- **Logos allégés** — Le grand logo Out of the Books passe de 37 à 26 Ko, et le fond nuageux de 20 à 14 Ko. Le rendu a été vérifié au pixel près.

**Fichiers modifiés** : `src/components/sections/FestivalHeroSection.astro`, `src/components/ui/TicketingButton.tsx`, `src/assets/images/ootb-logo.svg`, `src/assets/images/clouds_bg.svg`

### Vérifié

- **Testé avant la mise en ligne** — Sur l'environnement de test : accès refusé sans le bon mot de passe, accès accordé avec, déconnexion fonctionnelle, aucune image cassée sur l'accueil et la page festival. Les contrôles automatiques du site sont au vert.

---

## [1.3.3] — 2026-09-22

### Mises à jour de sécurité

- **Traitement des images à jour** — La brique qui prépare les photos envoyées via les formulaires du festival (la librairie « sharp ») passe à sa version corrigée. Sa version précédente commençait à être ciblée par des attaques connues. Les 158 images du festival ont été régénérées et vérifiées une à une.
- **Autres briques techniques mises à jour** — Plusieurs composants utilisés lors de la construction du site passent à leur version corrigée, et un composant inutilisé est supprimé.
- **L'éditeur de pages (TinaCMS) reste inchangé** — Sa mise à jour complète, plus lourde, est prévue dans le cadre de la maintenance préventive. Les points restants ne concernent que l'éditeur, réservé aux personnes connectées.

**Fichiers modifiés** : `package.json`, `package-lock.json`, `.github/workflows/actions.yaml`

---

## [1.3.2] — 2026-09-22

### Fiches pédagogiques : validation avant publication

- **Seules les fiches « Publié » sont en ligne** — Une fiche reçue reste en « A valider » et n'apparaît pas sur le site. Pour la publier, l'équipe passe son statut à « Publié » dans NocoDB, puis clique sur « Redéployer le site web ».
  - À savoir : repasser en « A valider » une fiche déjà en ligne ne la retire pas du site. Pour la retirer, il suffit de me prévenir.
- **Aucune fiche perdue en cas de panne** — Si la base de données ne répond pas, la mise à jour du site s'arrête sans rien modifier. Avant, une panne pouvait faire disparaître toutes les fiches du site.
- **Toutes les fiches récupérées** — Le site récupère désormais toutes les fiches, au-delà des 100 premières.
- **Journaux plus discrets** — En cas d'erreur, les journaux techniques n'affichent plus que le message utile, sans aucun identifiant de connexion.

### Nouvelles vues dans NocoDB

- **« Fiches - Vue par statut »** — Toutes les fiches, groupées en « A valider » et « Publié ».
- **« Fiches - À valider »** — La file de modération : uniquement les fiches en attente. Vide = rien à traiter.
- **« Fiches - Vue table »** — Inchangée, c'est toujours la vue par défaut.

### Contrôles automatiques au vert

- Les contrôles automatiques qui accompagnent chaque mise à jour du site (intégration continue) passent à nouveau.

**Fichiers modifiés** : `src/scripts/build-fiches-pedagogiques.js`, `.github/workflows/actions.yaml`

---

## [1.3.1] — 2026-09-22

### Anti-spam du formulaire « Appel à projets »

- **Les fausses fiches n'arrivent plus dans NocoDB** — Le site vérifie chaque envoi avant de l'enregistrer (validation côté serveur) et écarte tout ce qui est incohérent : textes au hasard, adresse e-mail invalide, champs manquants ou trop courts.
- **Un champ piège invisible** — Seuls les robots le remplissent (un « honeypot »). Il reste invisible pour les visiteurs, au clavier comme avec un lecteur d'écran.
- **Rien ne change pour les enseignants** — Ni captcha, ni étape en plus. En cas d'oubli dans le formulaire, l'enseignant voit un message clair.
- **Respect de la vie privée** — Les envois refusés sont consignés sans aucune donnée personnelle (RGPD).

### Base NocoDB des fiches pédagogiques

- **Fausses fiches supprimées** — Les 5 fiches créées par le robot sont supprimées. Les 85 fiches restantes ont été vérifiées une à une.
- **Nouveau champ « Statut »** (« A valider » ou « Publié ») — Le même que pour le festival. Les 85 fiches existantes sont passées en « Publié ».
- **Bouton « Redéployer le site web »** — Dans la table « Actions spéciales », comme pour le festival : il met en ligne une fiche validée sans attendre.

**Fichiers modifiés** : `netlify/functions/submit-pedagogical-sheet.js`, `src/components/forms/ProjectSubmissionForm.astro`, `netlify/functions/__tests__/all-functions.test.js`, `netlify/functions/__tests__/README.md`

---

## [1.3.0] — 2026-07-08

### Nouveautés

- **Page « Projet Erasmus+ »** (`/erasmus-plus/`) — Une page complète remplace l'ancien article : présentation du projet et de ses deux volets, partenaires, ressources (podcasts et vidéos) et carnet de bord. Tout est modifiable dans l'éditeur de pages (TinaCMS).
- **Miniatures vidéo automatiques** — Il suffit de coller un lien YouTube : la miniature s'affiche seule, sans envoyer d'image.
- **Podcasts via Ausha** — Il suffit de coller le lien de partage Ausha (« smartlink »). Un podcast pas encore publié affiche « Bientôt disponible » plutôt qu'un lien mort.
- **Une couleur par volet** — Intelligence artificielle en bleu, ludopédagogie en violet, de la présentation du projet jusqu'aux ressources.
- **Section « Conseil d'administration »** (page À propos) — Photo, nom, fonction et lien LinkedIn de chaque membre, modifiables dans l'éditeur.
- **Icônes dans les menus** — Billetterie, podcasts, émissions, fiches pédagogiques, Erasmus+ et « Nous soutenir » ont désormais leur icône.
- **Environnement de test pour l'éditeur** — Une copie du site (`staging`) permet d'essayer l'éditeur et de prévisualiser un contenu sans toucher au site en ligne.
- **Affiche partenaire EduSpark** (page Festival) — Une affiche cliquable, placée sous la rétrospective, renvoie vers le programme EduSpark.

### Corrections

- **Page À propos** — La section « Nos missions » affichait « [object Object] » à la place du texte. Le contenu est restauré, et un garde-fou empêche ce problème de revenir.

### Améliorations

- **Liens « Projet Erasmus+ »** — Tous pointent désormais vers la nouvelle page.
- **Menu « Qui sommes-nous »** — Nouveau lien « Conseil d'administration ».
- **Titres de la page À propos modifiables** dans l'éditeur.
- **Page Erasmus+ plus lisible** — Sections mieux séparées et titres mieux hiérarchisés (accessibilité et référencement).
- **Interrupteurs « Publier » de l'éditeur plus clairs** — « Désactivé, le contenu reste enregistré et réaffichable à tout moment ».
- **Accueil** — Le trio « À l'affiche » ne montre plus les fiches pédagogiques, qui ont leur propre rubrique.

### Qualité du code

- **Contrôle qualité de nouveau au vert** — Plusieurs centaines d'erreurs accumulées sont corrigées à la source, sans être masquées. Toute nouvelle erreur se voit désormais immédiatement.
- **Code inutilisé supprimé**, et le lien du bouton de don s'ouvre désormais de façon sécurisée.
- **Aucune régression** — Le site produit les mêmes pages qu'avant.

**Fichiers ajoutés** : `src/pages/erasmus-plus.astro`, `src/content/erasmus-plus/index.json`, `src/components/erasmus/MediaCard.astro`, `src/utils/erasmusMedia.ts`, `src/utils/tinaRichText.ts`, `src/utils/renderMissionHtml.ts`, `src/components/ui/TinaRichText.astro`, `src/utils/__tests__/tinaRichText.test.js`, `tina/erasmusCollection.ts`, `public/images/erasmus/`, `.claude/skills/tinacms-ootb/`

**Fichiers modifiés** : `src/components/widgets/Header.astro`, `src/components/blog/CategoryInfo.astro`, `src/components/ui/TicketingModal.tsx`, `src/components/ui/TicketingButton.tsx`, `src/components/sections/FestivalHeroSection.astro`, `src/components/sections/EduSparkSection.astro`, `src/pages/festival.astro`, `src/utils/blog.ts`, `src/content/about/index.json`, `src/content/navigation/index.json`, `src/content/festival/tina/index.json`, `src/pages/a-propos.astro`, `tina/aboutCollection.ts`, `tina/navigationCollection.ts`, `tina/festivalCollection.ts`, `tina/config.ts`, `tina/tina-lock.json`, `package.json`, `.gitignore`

---

## [1.2.2] — 2026-04-05

### Corrections

- **Éditeur de pages de nouveau accessible** — L'éditeur (TinaCMS) refusait de s'ouvrir, car sa description interne du site n'était plus à jour. Elle est régénérée et complète.

**Fichiers modifiés** : `tina/tina-lock.json`

---

## [1.2.1] — 2026-04-05

### Corrections

- **Accès à l'éditeur fiabilisé** — L'éditeur se génère désormais correctement à chaque mise à jour du site.
- **Hébergement unifié chez Netlify** — L'ancienne adresse Vercel est retirée. Adresse unique de l'éditeur : `outofthebooks.com/admin`.

**Fichiers modifiés** : `package.json`, `vercel.json` (supprimé), `api/cloudinary/[...media].js` (supprimé)

---

## [1.2.0] — 2026-03-25

### Formulaires plus fiables

- **Fiches pédagogiques et contact** — Chaque formulaire fonctionne désormais de façon indépendante, sans risque d'interférence entre eux.
- **Fiches de 2026** — Les années 2026 à 2029 sont ajoutées dans la base de données. Les fiches de cette année s'enregistrent normalement.
- **Newsletter (Brevo)** — L'inscription fonctionne de manière fiable en production, et le consentement « Politique de confidentialité acceptée » est bien enregistré, y compris lors d'une réinscription.
- **Messages clairs pour les visiteurs** — En cas de difficulté, le visiteur lit « Le service d'inscription est temporairement indisponible. Veuillez réessayer dans quelques minutes. »
- **Tests automatiques** — Les trois formulaires sont testés automatiquement, y compris dans des conditions réelles.

### Pied de page

- **Badge d'écoconception mis à jour** — Note A sur Website Carbon, plus sobre que 93 % des sites web (0,04 g de CO₂ par visite).

**Fichiers modifiés** : `netlify/functions/submit-newsletter.js`, `netlify/functions/submit-pedagogical-sheet.js`, `netlify/functions/submit-contact.js`, `netlify/functions/__tests__/all-functions.test.js`, `netlify/functions/__tests__/e2e-submit-newsletter.js`, `README.md`, `CHANGELOG-2026.md`

---

## [1.1.0] — 2026-03-18

### Corrections

- **Date de la fiche « Bulle d'R »** — Elle changeait à chaque mise à jour du site. Sa date d'origine (août 2025) est désormais conservée.
- **Accueil** — Vérifié : les 3 dernières publications mélangent bien les types de contenus (pas plus de 2 du même type).

**Fichiers modifiés** : `src/scripts/build-fiches-pedagogiques.js`, `src/utils/blog.ts`

---

## [1.0.1] — 2026-03-17

### Corrections

- **Site de nouveau en ligne** — Une icône invalide saisie dans l'éditeur bloquait la mise à jour du site. Elle est remplacée.
- **Couleurs des catégories restaurées** — Elles avaient été effacées par une sauvegarde automatique de l'éditeur.
- **Section « Nous soutenir »** — Le menu reflète le nouveau nom (anciennement « Contenu Premium »).

### Prévention

- **Choix d'icônes sécurisé** — Dans l'éditeur, les icônes se choisissent désormais dans une liste (dont LinkedIn et Instagram) au lieu d'être saisies à la main. L'erreur ne peut plus se reproduire.
- **Couleurs des catégories protégées** — L'éditeur ne peut plus les effacer.

**Fichiers modifiés** : `tina/blogCollection.ts`, `tina/homepageCollection.ts`, `src/content/blog/blog.json`, `src/content/homepage/index.json`, `src/content/navigation/index.json`, `.gitignore`, `CHANGELOG-2026.md`

---

## [1.0.0] — 2026-01-26

### Médiathèque et hébergement

- **Médiathèque de l'éditeur** — L'envoi d'images (Cloudinary) fonctionne depuis l'éditeur, y compris sur les versions de test.
- **Accès à l'éditeur rétabli** — Une redirection en boucle empêchait d'ouvrir `/admin`. C'est corrigé.
- **Versions techniques à jour** — Le site fonctionne sur les versions de Node.js 20 et 22.

### Contenu éditorial (TinaCMS)

- De nombreuses mises à jour de contenu via l'éditeur fin janvier (articles, événements, pages).

**Fichiers modifiés** : `api/cloudinary/[...media].js`, `api/cloudinary/media.js`, `astro.config.ts`, `netlify.toml`, `netlify/functions/cloudinary-media.mjs`, `package.json`, `public/_redirects`, `vercel.json`

---

## [0.9.0] — 2026-01-21

### Dates du festival centralisées

- **Une seule saisie** — Les dates du festival se saisissent une fois dans l'éditeur. Les noms des jours et l'année s'affichent automatiquement partout sur le site (Festival 2026 : du 30 septembre au 2 octobre).
- **Affichage des dates corrigé** dans l'éditeur.
- **Tests automatiques** — L'affichage des dates est vérifié automatiquement.

**Fichiers modifiés** : `src/config/festival.ts`, `src/content/festival/tina/index.json`, `tina/festivalCollection.ts`, `playwright.config.ts`, `package.json`, `tests/e2e/scenarios/festival-dates.spec.js`, `tests/e2e/scenarios/badge-consistency.spec.js`

---

## [0.8.0] — 2026-01-01

### Maintenance (fin décembre 2025)

- Mise à jour du serveur et des briques techniques essentielles, pour la stabilité et la sécurité du site.
- Mise en place des formules de support et de maintenance pour 2026.

---

_Ce fichier couvre les modifications depuis le 1er janvier 2026._
