# Netlify Functions Tests

## Quick Start

```bash
# Unit tests (no token needed, runs offline)
node netlify/functions/__tests__/submit-pedagogical-sheet.test.cjs

# E2E test (requires NocoDB token)
echo "NOCODB_API_TOKEN=your_token" > .env
node netlify/functions/__tests__/e2e-submit-pedagogical-sheet.js
```

## Test Files

| File | Type | Token needed | What it tests |
|---|---|---|---|
| `submit-pedagogical-sheet.test.cjs` | Unit | No | Table ID resolution, data formatting, handler modes, error handling |
| `e2e-submit-pedagogical-sheet.js` | E2E | **Yes** | Real NocoDB API: connectivity, submission, record verification, cleanup |

## Unit Tests (`submit-pedagogical-sheet.test.cjs`)

6 tests covering:

1. **Table ID resolution** — Verifies the fix for the `NOCODB_TABLE_ID` env var conflict (Table ID `mur92i1x276ldbg` vs View ID `vwp6ybxaurqxfimt`)
2. **Test mode** — Handler returns `isTestMode: true` when no API token
3. **HTTP method rejection** — GET/PUT/DELETE return 405
4. **Invalid JSON** — Malformed body returns 500 with user-friendly message
5. **Data formatting** — Arrays stringified, no undefined fields, correct field mapping
6. **Client-server consistency** — All 17 form fields match between frontend and backend

## E2E Test (`e2e-submit-pedagogical-sheet.js`)

Full round-trip against the real NocoDB API:

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

| ID | Type | Used by |
|---|---|---|
| `pzafxqd4lr77r0v` | Project/Base ID | All API calls (arg 2) |
| `mur92i1x276ldbg` | **Table ID** (fiches pédagogiques) | `dbTableRow.create()` — form submission |
| `vwp6ybxaurqxfimt` | **View ID** | `dbViewRow.list()` — build script only |

### Env var priority for Table ID (submit function)

```
NOCODB_FICHES_TABLE_ID  →  NOCODB_BASE_ID  →  'mur92i1x276ldbg' (hardcoded)
```

This avoids the conflict where `NOCODB_TABLE_ID` may contain the View ID (used by the build script).
