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

### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `NOCODB_API_TOKEN manquant` | No `.env` file | `echo "NOCODB_API_TOKEN=xxx" > .env` |
| Test B fails: `401 Unauthorized` | Token expired or invalid | Generate a new token in NocoDB settings |
| Test C fails: `Table not found` | Wrong Table ID | Check `NOCODB_FICHES_TABLE_ID` or `NOCODB_BASE_ID` in `.env` |
| Test C returns `isTestMode: true` | Token not loaded | Ensure `.env` is at project root, not in `__tests__/` |
| Timeout after 30s | NocoDB API unreachable | Check network / NocoDB status |

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
