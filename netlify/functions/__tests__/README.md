# Netlify Functions Tests

## Quick Start

```bash
# Unit tests — toutes les fonctions (no token needed, runs offline)
node netlify/functions/__tests__/all-functions.test.js

# E2E tests avec vrai NocoDB (requires token)
echo "NOCODB_API_TOKEN=your_token" > .env
node netlify/functions/__tests__/e2e-submit-pedagogical-sheet.js
node netlify/functions/__tests__/e2e-submit-contact.js
node netlify/functions/__tests__/e2e-submit-newsletter.js
```

## Test Files

| File | Type | Token | Scope |
|---|---|---|---|
| `all-functions.test.js` | Unit | No | **Les 3 fonctions** : pedagogical-sheet, contact, newsletter (44 tests) |
| `e2e-submit-pedagogical-sheet.js` | E2E | **Yes** | Fiche pédagogique : round-trip NocoDB API, vérification, cleanup |
| `e2e-submit-contact.js` | E2E | **Yes** | Contact : round-trip NocoDB API, vérification, cleanup |
| `e2e-submit-newsletter.js` | E2E | **Yes** | Newsletter : round-trip NocoDB API, gestion doublons, cleanup |

## Unit Tests (`all-functions.test.js`)

44 tests couvrant les 3 fonctions Netlify :

### Tests transversaux
1. **Isolation des env vars** — Vérifie que les 3 fonctions utilisent des project/table IDs différents
2. **Résolution Table ID** — Vérifie le fix du conflit `NOCODB_TABLE_ID` (Table vs View ID)

### submit-pedagogical-sheet
3. POST mode test (sans token) → 200, `isTestMode=true`
4. Méthode GET → 405
5. JSON invalide → 500 avec message user-friendly
6. Formatage : arrays stringifiés, pas de `undefined`, mapping 17 champs client ↔ serveur

### submit-contact
7. POST mode test → 200
8. GET diagnostic → structure attendue
9. DELETE → 405
10. JSON invalide → 500
11. Formatage : `subject→Objet`, `email→Auteur`, `message→Message`
12. Cohérence client ↔ serveur : champ `name` envoyé mais non utilisé (documenté)

### submit-newsletter
13. POST mode test → 200, `mode=test`
14. POST sans email → 400 (validation)
15. GET diagnostic → structure
16. PUT → 405
17. Formatage : `email→Email`, `source→Source`, `privacyAccepted→Politique acceptée`

## E2E Test (`e2e-submit-pedagogical-sheet.js`)

Full round-trip avec la vraie API NocoDB :

| Step | What | Safety |
|---|---|---|
| A. Prerequisites | Token present, Table ID != View ID | Exits if no token |
| B. Connectivity | Lists 1 row, validates table column structure | Read-only |
| C. Submission | Calls the actual Netlify handler (same code path as production) | Data prefixed `[E2E-TEST]` |
| D. Verification | Reads record back, checks every field value | Read-only |
| Cleanup | Deletes ALL `[E2E-TEST]` records | Runs in `finally` block (always) |

### Safety guarantees

- **Refuses to run** without `NOCODB_API_TOKEN`
- **All test data** prefixed with `[E2E-TEST]` — easy to find and identify
- **Always cleans up** via `finally` block, even if a test crashes
- **Preventive cleanup** at start (catches orphaned records from previous failed runs)
- **30s timeout** — never hangs

### Diagnostic : identifier la cause d'une erreur de soumission

Quand un formulaire retourne **"Nous n'avons pas pu enregistrer votre fiche pédagogique"** (ou une erreur similaire pour contact/newsletter), les causes possibles sont les suivantes, classées par probabilité. Le test e2e permet de les identifier :

#### 1. Colonne renommée ou supprimée dans NocoDB (cause la plus probable)

**Pourquoi ?** NocoDB a une interface spreadsheet : un simple clic sur un en-tête de colonne permet de le renommer. Si quelqu'un renomme `Prénom` en `Prenom` ou `Type enseignement` en `Type d'enseignement`, l'API rejette la soumission car le nom de champ ne correspond plus.

**Symptôme e2e** : Test B affiche `❌ FAIL: Colonne "Xxx" MANQUANTE` avec la liste exacte des colonnes problématiques. Ou bien Test B passe (colonnes OK en lecture) mais Test C échoue avec `422 Unprocessable Entity`.

**Colonnes avec accents/espaces (les plus fragiles)** :
- `Prénom` (pas `Prenom`)
- `Téléphone` (pas `Telephone`)
- `Thèmes` (pas `Themes`)
- `Déclinaisons` (pas `Declinaisons`)
- `Type enseignement` (avec espace, pas `TypeEnseignement`)

**Vérification** :
- Ouvrir la table des fiches pédagogiques dans NocoDB
- Vérifier que les 18 colonnes existent avec les noms **exacts** : `Title`, `Description`, `Type enseignement`, `Section`, `Destinataire`, `Thèmes`, `Objectifs`, `Competences`, `Prénom`, `Nom`, `Email`, `Téléphone`, `Ecole`, `Déclinaisons`, `Conseils`, `Liens`, `LiensVIDEO`, `Edition`
- Le test e2e liste les colonnes trouvées vs attendues pour faciliter la comparaison

**Fix** : soit renommer la colonne dans NocoDB pour retrouver le nom original, soit mettre à jour le mapping dans `netlify/functions/submit-pedagogical-sheet.js` (lignes 61-78) pour utiliser le nouveau nom.

#### 2. Token NocoDB expiré ou révoqué

**Symptôme e2e** : Test B échoue avec `401 Unauthorized`

**Vérification** :
- Aller dans NocoDB → Team & Settings → API Tokens
- Vérifier que le token est toujours actif
- Si expiré : générer un nouveau token et le mettre à jour dans Netlify → Site settings → Environment variables → `NOCODB_API_TOKEN`

**Vérification rapide via Netlify** : Function logs → chercher `❌ Erreur API` → le status HTTP de NocoDB y sera logué.

#### 3. NocoDB a changé son API (migration v1 → v2)

**Symptôme e2e** : Test B échoue avec `404 Not Found` ou `400 Bad Request`

**Vérification** :
- Aller sur `https://app.nocodb.com` et vérifier si l'interface a changé
- Vérifier la version de NocoDB (visible dans les settings)
- Le SDK `nocodb-sdk@0.262.x` utilise l'API v1 (`/api/v1/db/data/...`). Si NocoDB a migré vers v2, le SDK doit être mis à jour dans `package.json`
- Tester manuellement : ouvrir la table des fiches dans NocoDB et vérifier qu'elle est accessible

**Fix** : mettre à jour `nocodb-sdk` dans `package.json` vers la dernière version compatible.

#### 4. Conflit de variables d'environnement

**Symptôme e2e** : Test B passe (connectivité OK) mais Test C échoue avec `404` ou `Table not found`

**Vérification** :
- Dans Netlify → Site settings → Environment variables, vérifier si `NOCODB_TABLE_ID` est défini
- Si oui : cette valeur est partagée entre le build script (qui attend un View ID `vwp6ybxaurqxfimt`) et la fonction de soumission (qui attend un Table ID `mur92i1x276ldbg`)
- Le fix appliqué dans cette PR utilise des env vars dédiées, mais il faut que le déploiement soit fait après le merge

**Fix** : merger cette PR et redéployer, OU ajouter `NOCODB_FICHES_TABLE_ID=mur92i1x276ldbg` dans les env vars Netlify.

#### 5. Problème réseau ou NocoDB indisponible

**Symptôme e2e** : Timeout après 30s, ou Test B échoue avec `ECONNREFUSED` / `ENOTFOUND`

**Vérification** :
- Vérifier que `https://app.nocodb.com` est accessible depuis un navigateur
- Vérifier le status page de NocoDB (si disponible)
- Si auto-hébergé : vérifier que le serveur NocoDB est en ligne

### Troubleshooting rapide (tests e2e)

| Symptôme du test | Cause probable | Action |
|---|---|---|
| `NOCODB_API_TOKEN manquant` | Pas de `.env` | `echo "NOCODB_API_TOKEN=xxx" > .env` |
| Test B : `Colonne "Xxx" MANQUANTE` | **Colonne renommée dans NocoDB** | Renommer dans NocoDB ou aligner le code |
| Test B : `401 Unauthorized` | Token expiré/révoqué | Régénérer dans NocoDB → mettre à jour Netlify env vars |
| Test B : `404 Not Found` | API NocoDB v2 migration ou projet supprimé | Vérifier NocoDB, mettre à jour `nocodb-sdk` |
| Test B passe, Test C : `422` | Colonne renommée (nom OK en lecture, rejeté en écriture) | Vérifier les noms exacts dans NocoDB |
| Test B passe, Test C : `404` | Conflit env var Table/View ID | Merger cette PR ou ajouter `NOCODB_FICHES_TABLE_ID` |
| Test C : `isTestMode: true` | Token non chargé par dotenv | `.env` doit être à la racine, pas dans `__tests__/` |
| Timeout 30s | NocoDB injoignable | Vérifier réseau / status NocoDB |

## NocoDB ID Reference

Chaque fonction pointe vers un projet/table NocoDB **distinct** :

| Fonction | Project ID | Table ID | Env vars dédiées |
|---|---|---|---|
| Fiche pédagogique | `pzafxqd4lr77r0v` | `mur92i1x276ldbg` | `NOCODB_FICHES_TABLE_ID` |
| Contact | `pn7128r4idyluf0` | `mza30wqm38wsmib` | `NOCODB_CONTACT_PROJECT_ID`, `NOCODB_CONTACT_TABLE_ID` |
| Newsletter | `p41z6qweidro6nu` | `m6hnpjey4laav0z` | `NOCODB_NEWSLETTER_TABLE_ID` |
| Build (fiches, View) | `pzafxqd4lr77r0v` | `vwp6ybxaurqxfimt` | `NOCODB_TABLE_ID` (View ID!) |

### Env var priority for Table ID (submit-pedagogical-sheet)

```
NOCODB_FICHES_TABLE_ID  →  NOCODB_BASE_ID  →  'mur92i1x276ldbg' (hardcoded)
```

This avoids the conflict where `NOCODB_TABLE_ID` may contain the View ID (used by the build script).
