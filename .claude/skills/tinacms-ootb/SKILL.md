---
name: tinacms-ootb
description: This skill should be used for ANY work involving TinaCMS on the Out of the Books (ootb) Astro repo — when the user asks to "add a Tina field", "create/edit a Tina collection", "add a CMS-editable section", "edit tina/*.ts", "regenerate tina-lock", fix a "Tina Schema Mismatch", wire Tina content into an Astro page, or work with `src/content/<collection>/index.json`. It pins the exact installed (older) Tina versions, encodes the repo's collection conventions, the critical tina-lock.json regeneration rule, image-rendering pitfalls, and documentation references.
version: 1.0.0
---

# TinaCMS on the Out of the Books repo

Use this skill whenever touching TinaCMS in this repo: editing `tina/*.ts` collections, adding CMS-editable fields/sections, wiring Tina JSON into Astro pages, or debugging schema mismatches. It captures repo-specific conventions and the operational rules that are NOT obvious from the TinaCMS docs (which target a newer version than the one installed here).

## ⚠️ Version lock — read first

This repo runs an **older, pinned** Tina stack. Target these EXACT versions; do **not** copy APIs from current tina.io docs (3.x) without verifying they exist here. If a feature is not already used somewhere in `tina/*.ts`, treat it as unverified on this version.

| Package | Version |
|---|---|
| `tinacms` | **2.10.1** |
| `@tinacms/cli` | **1.12.6** |
| `@tinacms/schema-tools` | **1.10.1** |
| `@tinacms/graphql` | **1.6.3** |
| `next-tinacms-cloudinary` | **16.0.1** |

Rule of thumb: **mirror existing collections** (`tina/erasmusCollection.ts`, `tina/aboutCollection.ts`) rather than inventing config from docs.

## 🔴 The one rule you must never skip

**After ANY change to a `tina/*.ts` file (add / remove / rename a field, collection, or type), regenerate AND commit `tina/tina-lock.json` in the same change.**

TinaCloud reads `tina/tina-lock.json` **from git** as its schema source of truth — it does NOT re-derive the schema from the TypeScript files. Skipping this produces `GraphQL Schema Mismatch` and breaks the CMS editor in production. Dev passes anyway (dev reads the TS), so the breakage only shows up live.

Regenerate with `dev`, not `build` (`build` aborts at the cloud check when already mismatched):

```bash
# clean shell, no other background jobs
npx tinacms dev --no-server &
TINA_PID=$!
sleep 25                       # 15 on a warm cache; 25-30 on cold/slow
kill $TINA_PID 2>/dev/null
wait $TINA_PID 2>/dev/null

# validate (it's a single minified line)
python3 -c "import json; json.load(open('tina/tina-lock.json'))" && echo "JSON OK"
```

**The lock is one minified line — `git diff --stat` lies.** A real schema change shows as "1 file changed, 1 insertion(1)" and an unchanged lock looks identical. **Verify by content, not diff size:**

```bash
grep -c '"ambition"' tina/tina-lock.json   # must be > 0 after adding field `ambition`
```

Then commit the lock WITH the schema change, push, wait ~35 s for TinaCloud to re-index, and confirm with `npx tinacms build` (no mismatch error). Never commit `tina/__generated__/` (gitignored); always commit `tina/tina-lock.json`.

## Architecture in one minute

- **Editing pipeline:** editor opens `/admin` → edits → **Save** commits straight to `main` (`gitProvider` has `autoCommit: true`, `autoMerge: true`) → Netlify rebuilds. Images upload to **Cloudinary** via `netlify/functions/cloudinary-media.mjs` (the media store is `next-tinacms-cloudinary`, not git-based).
- **Collections:** one collection per `tina/*Collection.ts`, all registered in `tina/config.ts` → `schema.collections`. Page collections are JSON singletons: `format: "json"`, `path: "src/content/<collection>"`, one file `src/content/<collection>/index.json`, `ui.allowedActions: { create: false, delete: false }`. The blog `post` collection is the exception (MDX, multi-document).
- **Consumption:** Astro pages **directly import** the JSON (`import data from '~/content/<collection>/index.json'`) and destructure top-level fields by their exact Tina `name`. `export const prerender = true`. (Blog MDX bodies instead go through Astro content collections + `<Content />`.)
- **Force redeploy** (editor, no content change): Tina admin → ⚙️ Paramètres généraux → Actions système → "Forcer le redéploiement" → Save. A `beforeSubmit` stamps a hidden timestamp → commit → Netlify rebuild.
- A **separate** NocoDB → build-scripts → JSON pipeline feeds festival/fiches data. Tina does not manage it; editing NocoDB column structure breaks `src/scripts/` mappings.

See `references/architecture.md` for the full config breakdown, collection registry, env vars, and build commands.

## Conventions to match (every new/edited collection)

- French, emoji-prefixed `label` (`📄 Page - …`); French `label`/`description` on every field (descriptions carry editor guidance: char counts, image dimensions).
- camelCase field `name`, French-rooted (`sousTitre`, `heroImage`, `lienPdf`). **Field `name` must equal the JSON key** — the Astro page destructures by it.
- `ui.itemProps` on EVERY `list: true` field, with a French fallback label:
  `ui: { itemProps: (item) => ({ label: item?.nom || "Nouveau partenaire" }) }`
- Singletons stay locked: `ui.allowedActions: { create: false, delete: false }`.
- Multiline text → `ui: { component: "textarea" }`. Prose/inline-formatted content → `type: "rich-text"`. Repeatable groups → `type: "object", list: true`.
- Copy the shared SEO `metadata` object block (title / description-textarea / image, all `required: false`) for new pages.

See `references/operations-and-pitfalls.md` for the full convention list, the schema-mismatch recovery procedure, and the pre-flight checklist.

## Rendering rules (Tina content → Astro)

- `list: true` → `.map(...)`; guard optional/nested lists with `?.length`.
- **Image gotcha (high impact):** the custom `~/components/common/Image.astro` renders **nothing** (silent blank) for root-relative `public/` paths like `/images/erasmus/logo.svg`. Use `<Image>` ONLY for Cloudinary URLs, remote `https` URLs (incl. YouTube thumbnails), and `~/assets/...` imports. For `public/` brand assets use a plain `<img>` (add `loading`, `decoding`, `alt` manually). `erasmus-plus.astro` does both deliberately: hero (Cloudinary) → `<Image>`, partner/EU logos (`/images/...`) → `<img>`.
- JSON `rich-text` field → `<TinaMarkdown content={...}/>` from `tinacms/dist/rich-text`, inside a Tailwind `prose` wrapper; keep a `typeof === 'string'` guard if the field was historically a plain string. MDX post bodies → Astro `<Content />`, never `TinaMarkdown`.
- Gate every URL-bearing field with `hasLink(url)` (`Boolean(url && url !== '#')`); placeholder value is `"#"`; render an inert `<span>`/`<div>` fallback so unfinished content isn't a dead link.
- Internal links: trailing slash BEFORE the anchor (`/path/#anchor`) — `trailingSlash: "always"` drops the anchor in dev otherwise. External links: `target="_blank" rel="noopener noreferrer"`.

See `references/rendering.md` for the import patterns, the `<Image>` decision table, Cloudinary transform options, and a full field→render worked example.

## Pre-flight checklist for Tina schema changes

- [ ] Version-check: pinned to `tinacms@2.10.1` / `@tinacms/cli@1.12.6` — no newer-only APIs.
- [ ] Match conventions: French labels, camelCase names, `ui.itemProps` on lists, `textarea` for multiline, locked `allowedActions` on singletons.
- [ ] Keep field `name` == JSON key (rename = update BOTH `tina/*.ts` and `src/content/<collection>/index.json`).
- [ ] Update `src/content/<collection>/index.json` to stay consistent (no orphan/missing keys).
- [ ] **Regenerate the lock**: `npx tinacms dev --no-server &` … `sleep 25` … `kill`. Use `dev`, not `build`.
- [ ] Validate JSON: `python3 -c "import json; json.load(open('tina/tina-lock.json'))"`.
- [ ] Verify by content: `grep -c '"<newField>"' tina/tina-lock.json` > 0 (diff size is meaningless).
- [ ] Commit lock + schema together; never commit `tina/__generated__/`.
- [ ] Push, wait ~35 s, then `npx tinacms build` → no schema mismatch.
- [ ] New `public/` image field → render with plain `<img>`, not `<Image>`.

## Reference files

- **`references/architecture.md`** — `tina/config.ts` breakdown, collection registry, definition patterns, data flow + mermaid, env vars, build/deploy commands, redeploy mechanism, doc links.
- **`references/rendering.md`** — importing JSON into Astro, list rendering, the `<Image>` gotcha + decision table, rich-text, placeholder convention, trailing-slash rule, end-to-end worked example.
- **`references/operations-and-pitfalls.md`** — the tina-lock rule in depth, schema-mismatch recovery, repo conventions, common pitfalls, and the doc reference list (Tina 2.x).
