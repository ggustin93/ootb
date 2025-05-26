# Tech Context

<!-- Technologies used. Development setup. Technical constraints. Dependencies. -->

## 1. Core Technologies & Frameworks
- **Framework**: Astro (v5.0 or later) - For building a fast, content-focused website with a strong emphasis on SSG (Static Site Generation).
- **Styling**: Tailwind CSS - Utility-first CSS framework for rapid UI development. Custom Tailwind config likely present.
    - Additional handwritten CSS in `src/assets/styles/handwritten.css`.
- **UI Components**: Primarily Astro components (`.astro`). React components (`.tsx`) are used for dynamic/interactive elements, particularly within MDX content (e.g., `src/components/mdx/react/`).
- **Language**: TypeScript - For type safety and improved developer experience (strict configuration as per `.cursorrules`). JavaScript for some scripts and client-side interactions.

## 2. Content Management & Data
- **Primary Data Source (Events, Workshops, etc.)**: NocoDB - An open-source Airtable alternative. Data is fetched via an API.
    - API Token: `NOCODB_API_TOKEN` (environment variable).
    - Structured API interaction layer in `src/services/api/nocodb/`.
- **Git-based CMS**: Tina CMS - Used for managing and editing content stored in the Git repository (likely Markdown/MDX and JSON files).
    - Environment Variables: `TINA_SEARCH_TOKEN`, `TINA_CLIENT_ID`, `TINA_TOKEN`.
- **Content Storage**:
    - Markdown (`.md`) and MDX (`.mdx`) for blog posts, articles, and rich text content (e.g., `src/content/post/`). MDX allows for embedding interactive components.
    - JSON (`.json`) for structured data, configurations, and fetched data caching (e.g., `src/content/festival/`, `src/data/`).
- **Data Handling Workflow**:
    - Data fetched from NocoDB during pre-build steps (e.g., `npm run build:events`, `npm run fetch:events`).
    - Data is processed and often stored as JSON files within `src/content/` or `src/data/` for Astro to consume during static site generation. This minimizes runtime API calls.

## 3. Asset Management
- **Image Optimization**: Astro Assets (`astro:assets`) for optimizing images.
    - Guidelines for image usage in `.cursorrules` (formats: AVIF, WebP, JPG/PNG fallback; component: `Image.astro`; lazy loading; aspect ratios).
    - Images stored in `src/assets/images/`, with subfolders for specific content types like `events/` (ateliers, conferences, stands).
- **Favicons**: Located in `src/assets/favicons/`.
- **Icons**: Tabler Icons, used via `@iconify-json/tabler` and `astro-icon/components`.
    - Usage: `import { Icon } from 'astro-icon/components'; <Icon name="tabler:arrow-right" />`
- **Media Storage (External)**: Cloudinary - Integrated with Tina CMS for media asset storage.
    - Environment Variables: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`.

## 4. Development Environment & Workflow
- **Package Manager**: npm
- **Key Scripts** (from `package.json` and `.cursorrules`):
    - `npm install`: Install dependencies.
    - `npm run dev`: Start development server.
    - `npm run build`: Build for production.
    - `npm run preview`: Preview production build.
    - `npm run build:events`: Generate event data (likely from NocoDB).
    - `npm run fetch:events`: Fetch latest content (likely NocoDB sync).
    - Custom scripts also mentioned in `.cursorrules` (likely aliases for linting, component generation etc. but not directly in `package.json`): `/commit`, `/generate-component`, `/lint`, `/optimize-performance`.
- **Build Scripts**: Custom Node.js scripts in `src/scripts/` (e.g., `build-festival-data.js`, `build-fiches-pedagogiques.js`) for data processing and preparation.
- **Version Control**: Git
- **Commit Conventions**: Conventional Commits enforced (`[type][(scope)]: [description]`). Examples in `.cursorrules`.

## 5. Code Quality & Standards
- **Linting & Formatting**: ESLint and Prettier.
- **TypeScript**: Strict configuration.
- **Styling Approach**: Tailwind CSS utility classes only, mobile-first.
- **Component Design**: Atomic and reusable components. Clear prop documentation (TypeScript & JSDoc).
- **Performance & Accessibility**: High targets (>90 Lighthouse, EcoIndex optimization, WCAG compliance). Details in `.cursorrules`.
- **DOM Structure**: Minimize DOM depth (<800 nodes).
- **HTTP Requests**: Reduce requests (<40 per page).
- **Resource Weight**: Optimize (<500KB per page).
- **Animations**: Use Tailwind transitions, respect `prefers-reduced-motion`.

## 6. Deployment & Hosting
- **Platform**: Netlify
- **Environment Variables Configuration**: Managed via Netlify dashboard.
    - `NOCODB_API_TOKEN`
    - `TINA_SEARCH_TOKEN`, `TINA_CLIENT_ID`, `TINA_TOKEN`
    - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`
    - `BREVO_API_KEY`, `BREVO_LIST_ID`

## 7. Third-Party Services & Integrations
- **Email Marketing/Transactional**: Brevo (formerly Sendinblue) - API key and list ID in environment variables.
- **Analytics**: `src/components/common/Analytics.astro`, `SplitbeeAnalytics.astro` (Splitbee might be used or was used).
- **Video Hosting**: YouTube (embedded via `YouTubePlayer.astro`).
- **Podcasts**: Likely external hosting, embedded via player components (`PodcastPlayer.astro`, `Podcast.tsx`).
- **Database Backend (potential/speculative)**: `src/lib/supabase.ts` exists, suggesting Supabase might have been considered or used for features not covered by NocoDB/TinaCMS. Currently confirmed as **not in active use**.

## 8. Project Structure (Key `src/` Directories)
- `src/assets/`: Static assets (images, favicons, styles).
- `src/components/`: Reusable Astro and React components (common, features, ui, blog, etc.).
- `src/config/`: Project-specific configurations (e.g., `festival.ts`, `nocodb.ts`).
- `src/content/`: Markdown, MDX, and JSON content files. Managed by TinaCMS and populated by build scripts.
- `src/data/`: Additional structured data, often pre-processed or static.
- `src/layouts/`: Base page layouts for Astro.
- `src/lib/`: Utility functions, helper modules (e.g., `posts.ts`, `utils.ts`). Note: `supabase.ts` is present but Supabase is not currently in use.
- `src/pages/`: Defines the site's routes. Includes API endpoints (`src/pages/api/`).
- `src/scripts/`: Node.js scripts for build processes, data fetching/massaging.
- `src/services/`: Integration layers for external APIs (e.g., NocoDB).
- `src/types/`: TypeScript type definitions.
- `src/utils/`: General utility functions.

## 9. Credits
- Developed by Guillaume Gustin (pwablo.be).
- Based on a customized version of AstroWind by onWidget.com.

## 10. License
- MIT License. 