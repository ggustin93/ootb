# Rendering — How TinaCMS Content Is Consumed in the Astro Frontend

Reference for editing/building Tina-driven UI. Stack: TinaCMS 2.10.1 / @tinacms/cli 1.12.6, Astro 5 SSG, Tailwind. Tina JSON collections are consumed as **plain static JSON imports at build time** — no Tina runtime/GraphQL client on these pages.

## 1. Importing Tina content into Astro pages

### Pattern A — JSON collection (dominant)

A `format: "json"` collection writes one JSON file (e.g. `src/content/erasmus-plus/index.json`). The page imports it directly and destructures top-level fields. Build-time static data — no async, no GraphQL.

```astro
---
import Image from '~/components/common/Image.astro';
import MediaCard from '~/components/erasmus/MediaCard.astro';
import { resolveVideoThumbnail } from '~/utils/erasmusMedia';
import erasmusData from '~/content/erasmus-plus/index.json';

export const prerender = true;

const { metadata, hero, projet, partenaires, ressources, carnetDeBord } = erasmusData;
---
```

- Destructured names map **1:1 to the top-level `fields[].name`** in `tina/erasmusCollection.ts`. A renamed Tina field breaks the destructure silently (`undefined`).
- `metadata` is conventionally spread into the layout: `<Layout {metadata}>`.
- Same pattern in `a-propos.astro`, `index.astro`, `festival.astro`, `contact.astro`, `appel-a-projets.astro`.

### Pattern B — MDX body collections (blog) — DIFFERENT

The `post` collection (`format: "mdx"`, `rich-text` field `isBody: true`) is **not** imported as JSON. It is consumed through **Astro's native Content Collections** (`getCollection`/`render`) via `src/utils/blog.ts`, and the body is rendered with Astro's `<Content />`, **not** `<TinaMarkdown>`. Do not conflate the two systems.

## 2. Rendering repeatable / list fields (`object` + `list: true`)

A `list: true` object becomes a **JSON array** → render with `.map(...)`. Guard optional/nested lists with `?.length`.

```astro
{volet.podcasts?.length ? (
  <ul class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 list-none p-0">
    {volet.podcasts.map(podcast => (
      <li><MediaCard kind="podcast" title={podcast.titre} href={podcast.url} thumbnail={podcast.cover} /></li>
    ))}
  </ul>
) : null}
```

Doubly-nested (fiches inside categories):

```astro
{volet.fichesCategories.map(cat => (
  <div class="...card...">
    <h4>{cat.categorie}</h4>
    <ul>{cat.fiches.map(fiche => (<li>…</li>))}</ul>
  </div>
))}
```

- Card grids: `grid grid-cols-2 lg:grid-cols-4` (media), `grid-cols-1 md:grid-cols-2` (fiches/partners).
- **Index-based decoration:** the `.map((item, i) => …)` index picks from a parallel array — `voletIcons = ['tabler:robot', 'tabler:dice-5']`, accessed as `voletIcons[i] ?? 'tabler:bulb'`. Couples markup to content order; if Tina list order changes, icons remap. Keep the fallback.

## 3. Image handling — the `<Image>` GOTCHA

`src/components/common/Image.astro` (using `findImage` from `src/utils/images.ts`) is the optimizing image component. **It does not work for every path** — the single most important rendering pitfall.

### When `<Image>` WORKS
1. **Cloudinary URLs** (`res.cloudinary.com`, the Tina media store) — custom transform pipeline, `srcset` widths `[400,800,1200]`. Happy path for Tina-uploaded media (e.g. `hero.heroImage`).
2. **Remote `https://` URLs** (Unpic-compatible, Unsplash, generic) — YouTube thumbnails (`i.ytimg.com/...`) fall here and render fine.
3. **Local `~/assets/images/...` imports** — globbed → `ImageMetadata` → Astro asset optimizer.

### THE GOTCHA — root-relative `public/` paths render NOTHING
For `/images/erasmus/logo.svg` (a `public/` file): `findImage` hits the `startsWith('/')` branch and returns the string unchanged; back in `Image.astro` it is not Cloudinary/Unpic/Unsplash and does **not** start with `http(s)`, so it falls through every branch → `image` stays `undefined` → component renders `<Fragment />` (nothing). **Silent blank — no error, no broken-image icon.**

### THE RULE
> For static brand/UI assets in `public/` (root-relative `/images/...`), use a plain `<img>` — never `<Image>`. Reserve `<Image>` for Cloudinary/remote URLs and `~/assets/...` imports.

`erasmus-plus.astro` does both deliberately: `hero.heroImage` (Cloudinary) → `<Image>`; partner `logo` + `logoUE` (`/images/erasmus/*`) → plain `<img>`:

```astro
<img src={partenaire.logo} alt={`Logo ${partenaire.nom}`}
     class="max-h-16 w-auto object-contain" loading="lazy" decoding="async" />
```

When using plain `<img>` for `public/` assets, manually add `loading`, `decoding`, and a meaningful `alt`.

### Cloudinary transform options (`cloudinaryOptions` prop)

| Option | Values | Default |
|---|---|---|
| `quality` | `number \| 'auto'` | `'auto:good'` |
| `format` | `'auto' \| 'webp' \| 'jpg' \| 'avif'` | `'webp'` |
| `crop` | `'fill' \| 'scale' \| 'fit' \| 'limit'` | `'fill'` |
| `dpr` | `'auto' \| 1 \| 2 \| 3` | `'auto'` |
| `gravity` | `'auto' \| 'center' \| 'faces'` | `'auto'` |

Also: `aspectRatio` prop (`"16:9"` or numeric) → Cloudinary `ar_` transform; width hard-capped at 1200px.

## 4. Rich-text fields

### JSON collections → `TinaRichText.astro` + `richTextToHtml()` (NOT `<TinaMarkdown>`)

A `type: "rich-text"` field in a JSON collection imports as a **Tina rich-text AST object** (not a string):

```json
{ "type": "root", "children": [{ "type": "p", "children": [{ "type": "text", "text": "…" }] }] }
```

**Canonical render path for Astro SSG pages** — no Tina/React runtime on static pages:

```astro
---
import TinaRichText from '~/components/ui/TinaRichText.astro';
import { MISSION_PROSE_CLASS } from '~/utils/tinaRichText';
import { renderMissionHtml } from '~/utils/renderMissionHtml';
---

{typeof mission.description === 'string' ? (
  <div set:html={renderMissionHtml(mission.description)} />
) : (
  <TinaRichText content={mission.description} class={MISSION_PROSE_CLASS} />
)}
```

- **`~/utils/tinaRichText.ts`** — `richTextToHtml()` walks the AST and returns HTML at build time; exports `TinaRichTextContent` type and hoisted prose class constants.
- **`~/components/ui/TinaRichText.astro`** — thin wrapper: `set:html={richTextToHtml(content)}` inside a `prose` div.
- Wrap in Tailwind `prose`; tune with `prose-*` modifiers (use exported constants, don't inline long class strings).
- Keep the `typeof === 'string'` guard for fields that were historically plain strings (legacy emoji-formatted content may use `renderMissionHtml()` in `~/utils/renderMissionHtml.ts`).
- Same pattern in `src/components/blog/CategoryInfo.astro` (`CATEGORY_PROSE_CLASS`).

**React client components** (interactive islands only):

```tsx
import { richTextToHtml, type TinaRichTextContent } from '~/utils/tinaRichText';

<div
  className="prose prose-sm max-w-none text-gray-600"
  dangerouslySetInnerHTML={{ __html: richTextToHtml(modalText) }}
/>
```

### Why not `<TinaMarkdown>`?

`<TinaMarkdown>` from `tinacms/dist/rich-text` is a React component. Used directly in `.astro` files it can display literal `[object Object]` and ships tinacms React into pages that are otherwise pure SSG. Prefer `TinaRichText.astro` / `richTextToHtml()` — aligns with "plain static JSON imports at build time — no Tina runtime."

### MDX collections → Astro `<Content />` (NOT rich-text renderers)
Blog `post` bodies render through `src/utils/blog.ts` + Astro `<Content />`. Tina is only the editing surface. Never import `TinaMarkdown` for blog bodies.

## 5. Placeholder / conditional rendering (`url: "#"` + `hasLink()`)

Unfinished links are seeded as `"#"` in JSON. The frontend must render a non-clickable fallback.

```ts
const hasLink = (url?: string): boolean => Boolean(url && url !== '#');
```

```astro
{hasLink(fiche.lienPdf) ? (
  <a href={fiche.lienPdf} target="_blank" rel="noopener noreferrer">…</a>
) : (
  <span class="...muted...">…</span>
)}
```

Richer variant `partnerLinks()` normalizes the partner link model — prefers the `liens[]` list (each filtered by `hasLink`), falls back to single `lien` labeled "Visiter le site":

```ts
const partnerLinks = (partenaire) => {
  const list = (partenaire.liens ?? []).filter((l) => hasLink(l?.url));
  if (list.length) return list;
  return hasLink(partenaire.lien) ? [{ label: 'Visiter le site', url: partenaire.lien }] : [];
};
```

`MediaCard.astro` applies it structurally: `const CardTag = linked ? 'a' : 'div';` — the card becomes a non-interactive `<div>` when the href is a placeholder.

**Rule:** gate any Tina URL field with `hasLink()` before using it as an `href`. Default placeholder is `"#"`.

## 6. Trailing-slash gotcha (dev only)

Astro is `trailingSlash: "always"`. In **dev**, `/category/podcast#anchor` redirects to `/category/podcast/` and **loses the anchor**. Production (Netlify `pretty_urls`) normalizes it.

> Rule: put the trailing slash **before** the anchor on internal links — `href="/category/podcast/#category-content"` ✅, not `/category/podcast#category-content` ❌.

Implemented in `src/components/blog/CategoryButton.astro`. Applies to **internal** links only; external links use `target="_blank" rel="noopener noreferrer"`. Same-page `#le-projet` fragments are unaffected.

## 7. End-to-end worked example: `videos[].url` → video card

1. **Schema** (`tina/erasmusCollection.ts`): `ressources.volets[].videos[]` is an object list with `titre`, `url` ("Lien (YouTube/Pédagoscope)"), and optional `miniature` (image override).
2. **Content** (`index.json`): `{ "titre": "Atelier IA", "url": "https://youtu.be/dQw4w9WgXcQ", "miniature": "" }`.
3. **Page maps**: `volet.videos.map(video => <MediaCard kind="video" title={video.titre} href={video.url} thumbnail={resolveVideoThumbnail(video)} />)`.
4. **Auto-derivation** (`src/utils/erasmusMedia.ts`): `resolveVideoThumbnail` = `miniature` override → else `getYouTubeThumbnail(url)` (`getYouTubeId` regex matches `watch?v=`, `youtu.be/`, `/embed/`, `/shorts/`, `/live/` → `https://i.ytimg.com/vi/<id>/hqdefault.jpg`) → else `null`.
5. **`MediaCard.astro` renders**: `hasLink(href)` → `<a>` or inert `<div>`; thumbnail (a remote `https` URL → handled by `<Image>`), `aspectRatio="16:9"`, `object-cover` for video; no thumbnail → gradient + play-icon fallback.

```
tina/erasmusCollection.ts (videos[].url : string)
  → index.json ("url": "https://youtu.be/…")
  → erasmus-plus.astro  volet.videos.map(...)
  → resolveVideoThumbnail(video)  [erasmusMedia.ts]  → i.ytimg.com/vi/<id>/hqdefault.jpg
  → <MediaCard kind="video" href={video.url} thumbnail={…}/>
        → hasLink ? <a> : <div>    (placeholder "#" → inert)
        → thumbnail ? <Image src=remoteUrl/> : gradient+icon
  → <li> card in grid-cols-2 lg:grid-cols-4
```

`partenaires[].liens[].url` follows an analogous chain through `partnerLinks()` into external `<a>` chips, with `partenaire.logo` rendered via plain `<img>` (public path).

## Quick rules

- JSON collections = static import + destructure matching top-level Tina field names (`prerender = true`).
- `list: true` → `.map(...)`; guard nested with `?.length`.
- `<Image>` for Cloudinary + remote `https` + `~/assets/...` ONLY. `public/` `/images/...` → plain `<img>`.
- JSON `rich-text` → `<TinaRichText>` / `richTextToHtml()` in a `prose` wrapper (keep the string guard). MDX bodies → Astro `<Content />`.
- Gate URL fields with `hasLink()` (placeholder `"#"`); render inert fallback.
- Internal links: trailing slash before anchor. External: `target="_blank" rel="noopener noreferrer"`.

### Relevant files
`src/pages/erasmus-plus.astro`, `src/pages/a-propos.astro`, `src/content/erasmus-plus/index.json`, `tina/erasmusCollection.ts`, `tina/aboutCollection.ts`, `src/components/common/Image.astro`, `src/utils/images.ts`, `src/components/erasmus/MediaCard.astro`, `src/utils/erasmusMedia.ts`, `src/components/blog/CategoryButton.astro`, `src/components/blog/CategoryInfo.astro`, `src/components/ui/TinaRichText.astro`, `src/utils/tinaRichText.ts`, `src/utils/renderMissionHtml.ts`, `src/utils/blog.ts`.
