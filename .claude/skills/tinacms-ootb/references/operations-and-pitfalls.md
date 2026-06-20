# Operations & Pitfalls — TinaCMS on the Out of the Books repo

> **Version lock — read first.** Pinned stack (confirmed in `node_modules/*/package.json`): `tinacms` **2.10.1**, `@tinacms/cli` **1.12.6**, `@tinacms/schema-tools` **1.10.1**, `@tinacms/graphql` **1.6.3**, `next-tinacms-cloudinary` **16.0.1**. Do **not** assume newer Tina docs/APIs apply. When in doubt, match patterns already present in `tina/*.ts` rather than copying current-docs snippets (which target 3.x). Newer field types / `ui` options / config keys may silently no-op or break the build on this version.

## 1. THE CRITICAL RULE — `tina-lock.json` regeneration

**After ANY change to a `tina/*.ts` file — add / remove / rename a field, collection, or type — regenerate and commit `tina/tina-lock.json` in the same change.**

**Why it's non-negotiable** (source: `CLAUDE.md` § "TinaCMS Schema Rule (CRITICAL)" + `memory-bank/troubleshoot.md`):
- TinaCloud reads `tina/tina-lock.json` **from git** as its schema source of truth. It does **not** re-derive the schema from the TypeScript config.
- The TinaCloud "Re-sync" button only re-indexes **content**, never the schema.
- `tinacms build --skip-cloud-checks` (Netlify builds) reads the existing lock; it does **not** regenerate it.
- Skipping it produces `GraphQL Schema Mismatch. Editing may not work.` — the editor breaks in production while local dev (which reads TS) still passes.

**Real incident on file** (`troubleshoot.md`, resolved 2026-04-05, fix `496d990`): a `color` field added to `blogCollection.ts` (commit `bc9d44f`) was never propagated to the lock, breaking the editor.

### Exact regeneration procedure

Use `dev`, **not** `build` — `npx tinacms build` aborts at the cloud check when already mismatched, whereas `npx tinacms dev --no-server` regenerates the lock from TypeScript **without** that check.

```bash
# clean shell, no other background jobs
npx tinacms dev --no-server &
TINA_PID=$!
sleep 15              # bump to 25-30 on slow machines / cold npm cache
kill $TINA_PID 2>/dev/null
wait $TINA_PID 2>/dev/null

python3 -c "import json; json.load(open('tina/tina-lock.json'))" && echo "JSON valid"

git add tina/tina-lock.json
git commit -m "fix(tina): regenerate tina-lock.json after schema change"
git push origin HEAD          # adjust branch if not main
```

Then **wait ~35 s** for TinaCloud to re-index, and verify:

```bash
sleep 35 && npx tinacms build   # should complete with NO schema-mismatch error
```

If the mismatch persists, the lock wasn't fully written — increase `sleep` to 25–30 and retry.

### ⚠️ The "tiny diff" trap

`tina/tina-lock.json` is a **single minified line**. `git diff --stat` shows "1 file changed" with a trivial line delta **even when the schema changed substantially** — and an *unchanged* lock looks identical. **Do not trust diff size.** Verify by content:

```bash
grep -c '"ambition"' tina/tina-lock.json        # > 0 after adding field `ambition`
grep -c '"thematiques"' tina/tina-lock.json
grep -c '"liens"' tina/tina-lock.json
```

If the field name isn't in the lock, regeneration didn't take — re-run with a longer `sleep`.

## 2. Schema-Mismatch error recovery (summary of `troubleshoot.md`)

When you see `GraphQL Schema Mismatch … Field 'xxx' was added to object type 'YyyZzz'`:

1. **Diagnose** — the error names the field and the object type missing it. Confirm the field exists in the `tina/*.ts` file but **not** in the lock (`grep '"xxx"' tina/tina-lock.json`).
2. **Preferred fix — dev-mode regeneration** (works even when already mismatched): run §1, commit, push, wait ~35 s, re-verify with `npx tinacms build`.
3. **What does NOT fix it:** TinaCloud "Re-sync" (content only); `tinacms build --skip-cloud-checks` (stale lock); pushing an unrelated file.
4. **Emergency manual patch** (only if dev regen is impossible): a single new field on a `contentTypes`-style object can require **3 edits per content type** in the lock — object type, mutation input, filter input. For `blogCollection`'s 7 content types that is 21 edits per field. Insert each in the GraphQL-AST JSON shape, then validate JSON before committing. Error-prone — prefer dev regen.
5. `tina/__generated__/*` is gitignored and must never be committed; only `tina/tina-lock.json` is tracked.

## 3. Repo conventions (match exactly)

- **Singleton pages locked:** `ui: { allowedActions: { create: false, delete: false } }` (erasmus, about, blog, siteSettings…).
- **Fixed path/format:** `path: "src/content/<collection>"`, `format: "json"`, single file `src/content/<collection>/index.json`, imported directly by the Astro page.
- **French + emoji labels:** `label: "📄 Page - Erasmus+"`.
- **All field `label`/`description` in French**, editor-facing, with author guidance (char counts, image dims, "ne pas inclure '| Out of the Books'").
- **`ui.itemProps` on every list field**, French fallback: `ui: { itemProps: (item) => ({ label: item?.nom || "Nouveau partenaire" }) }`.
- **`metadata` SEO block** (title / description-textarea / image, all `required: false`) duplicated across page collections — copy verbatim for new pages.
- **camelCase, French-rooted field `name`** (`sousTitre`, `heroImage`, `lienGoogleDoc`, `fichesCategories`, `lienPdf`); keep `name` identical to the JSON key (the Astro page destructures by it).
- **Multiline** → `ui: { component: "textarea" }`. **Rich content** → `type: "rich-text"`. **Repeatable** → `type: "object", list: true`.

## 4. Common pitfalls

- **Forgetting lock regeneration** (§1) — most common and most damaging; passes local dev, breaks production CMS.
- **Editing NocoDB table/column structure** — events/workshops/stands flow NocoDB → build scripts → JSON → SSG. Renaming/restructuring NocoDB fields breaks the `src/scripts/` mapping and silently empties pages. Tina does not manage that data; treat NocoDB schema as a contract with `src/services/api/nocodb/`.
- **`public/` image paths don't render through `<Image>`** — actively worked around in `erasmus-plus.astro` (Cloudinary `heroImage` → `<Image>`; `/images/...` logos → plain `<img>`). When content can be a Cloudinary URL OR a `public/` path, render with plain `<img>` or branch on the source.
- **Rich-text layout limits** — on 2.10.1, `rich-text` is for inline/prose content. Don't use it for structured layout (grids, cards, columns) — model those as typed `object`/`list` fields.
- **`<TinaMarkdown>` in `.astro` pages** — renders literal `[object Object]` in some environments and pulls tinacms React into SSG pages. Use `<TinaRichText content={...} />` (`~/components/ui/TinaRichText.astro`) or `richTextToHtml()` instead. In React client islands, use `richTextToHtml()` + `dangerouslySetInnerHTML`.
- **Using a newer Tina API** — `ui.router`, new field types, or config keys from current (3.x) docs may not exist in 2.10.1 / cli 1.12.6. If it's not already used in `tina/*.ts`, verify before relying on it.
- **Media store is Cloudinary, not local** — Tina's image picker uploads to Cloudinary (a Cloudinary URL); legacy/static assets referenced as `/images/...` are hand-authored public paths. Both coexist in the same JSON; account for both when rendering.

## 5. Review record — `erasmusCollection.ts` `projet` + `partenaires[].liens`

The new `projet` object (`thematiques` list + `ambition` textarea) and `partenaires[].liens` list were reviewed against `src/content/erasmus-plus/index.json` and `src/pages/erasmus-plus.astro`. **Verdict: correct and internally consistent** — schema, content, and renderer agree. `itemProps` labels use `item?.titre` / `item?.label` with French fallbacks; the page guards with `projet?.thematiques?.length` / `projet?.ambition`; `partnerLinks()` prefers `liens[]` and falls back to single `lien`. The mixed image rendering (Cloudinary `heroImage` via `<Image>`, `/images/...` logos via `<img>`) is intentional and correct — don't "normalize" them to one component.

Notes: lock regeneration must accompany the change (verify via grep, §1). `liens[].url` has no `required` validation — `partnerLinks()` filters empty URLs via `hasLink`, so the renderer is safe. `voletIcons` is index-positional; reordering/adding a third thematique falls back to a generic icon (acceptable; commented in code).

## 6. Documentation references (TinaCMS 2.x)

- Content modeling / collections — https://tina.io/docs/schema/
- Field reference (types, `ui`, `itemProps`, list) — https://tina.io/docs/reference/fields/
- Object field (nested + `list`) — https://tina.io/docs/reference/types/object/
- Rich-text field (limits, templates) — https://tina.io/docs/reference/types/rich-text/
- Collection reference (`path`, `format`, `ui.allowedActions`, `defaultItem`) — https://tina.io/docs/reference/collections/
- `tina-lock.json` & self-hosting / schema source of truth — https://tina.io/docs/self-hosted/overview/, https://tina.io/docs/tina-cloud/
- Media / custom store (Cloudinary) — https://tina.io/docs/reference/media/cloudinary/
- CLI (`dev`, `build`, flags) — https://tina.io/docs/cli-overview/

> When a doc describes a feature, cross-check it against the installed version. If it isn't already used somewhere in `tina/*.ts`, treat it as unverified on 2.10.1.

## 7. Pre-flight checklist (mirror of SKILL.md)

- [ ] Version-check (2.10.1 / cli 1.12.6) — no newer-only APIs.
- [ ] Match conventions: French labels, camelCase names, `ui.itemProps` on lists, `textarea` multiline, locked `allowedActions`.
- [ ] Field `name` == JSON key (rename → update both `.ts` and `index.json`).
- [ ] Update `src/content/<collection>/index.json` to stay consistent.
- [ ] Regenerate lock: `npx tinacms dev --no-server &` … `sleep 25` … `kill` (dev, not build).
- [ ] Validate JSON: `python3 -c "import json; json.load(open('tina/tina-lock.json'))"`.
- [ ] Verify by content: `grep -c '"<newField>"' tina/tina-lock.json` > 0.
- [ ] Never commit `tina/__generated__/`; do commit `tina/tina-lock.json`.
- [ ] Commit lock + schema together; push; wait ~35 s; `npx tinacms build` → no mismatch.
- [ ] New `public/` image field → plain `<img>`, not `<Image>`.

### Files referenced
`CLAUDE.md` (§ TinaCMS Schema Rule), `memory-bank/troubleshoot.md`, `tina/config.ts`, `tina/erasmusCollection.ts`, `tina/aboutCollection.ts`, `src/content/erasmus-plus/index.json`, `src/pages/erasmus-plus.astro`, `src/pages/a-propos.astro`, `src/components/ui/TinaRichText.astro`, `src/utils/tinaRichText.ts`, `src/components/common/Image.astro`, `package.json`.
