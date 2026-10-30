# Out of the Books Website

A collaborative platform for educational innovation in French-speaking Belgium, built with Astro and Tailwind CSS.

## About

Out of the Books ASBL is a non-profit organization that brings together teachers, experts, and education enthusiasts to foster pedagogical innovation. The organization connects education stakeholders and aims to transform learning experiences in French-speaking Belgium.

## Features

- Fully responsive design for all devices
- Built with Astro 5.0 and Tailwind CSS
- SEO optimization with Open Graph support
- Image optimization via Astro Assets
- Smart event filtering with French language support
- Visual content editing via TinaCMS (Git-based: every save is a commit)
- Password-protected client portal (`/dashboard/`) with a maintenance journal

## Architecture Overview

The Out of the Books platform implements a JAMstack architecture for performance and content management. The system processes educational content and generates static pages.

### Processing Workflow

When content is updated, the system: (1) Fetches data from NocoDB API and TinaCMS, (2) Processes images with optimization, (3) Generates static JSON files for fast access, (4) Builds optimized static pages with Astro, and (5) Deploys to Netlify CDN.

The frontend uses responsive design patterns and updates content through static generation and client-side filtering.

### High-Level Diagram

```
┌─────────────────────────┐      ┌───────────────────────────┐      ┌─────────────────────────┐
│    Astro 5.0 Frontend   │◄──── │     Content Pipeline      │ ───► │   External Services     │
│ (Static Generation)     │ HTTP │  (Data Processing)        │ API  │ (NocoDB & TinaCMS)      │
├─────────────────────────┤      ├───────────────────────────┤      ├─────────────────────────┤
│ - Responsive Components │      │ - NocoDB Data Fetcher     │      │ - Event Management      │
│ - Smart Filtering       │      │ - Image Optimization      │      │ - Content Management    │
│ - Performance Optimized │      │ - JSON Generation         │      │ - Media Storage         │
│ - SEO & Accessibility   │      │ - Static Build Process    │      │ - Email Integration     │
└─────────────────────────┘      └────────────┬──────────────┘      └─────────────────────────┘
                                              │ Build Process
                                              ▼
                               ┌─────────────────────────────┐
                               │     Content Processing      │
                               │                             │
                               │ ┌─────────────────────────┐ │
                               │ │   Data Aggregation      │ │ ──► Festival events, workshops,
                               │ │   (Events, Resources)   │ │     podcasts, resources
                               │ └─────────────────────────┘ │
                               │ ┌─────────────────────────┐ │
                               │ │   Image Optimization    │ │ ──► AVIF, WebP, responsive
                               │ │   (Multi-format)        │ │     sizes with lazy loading
                               │ └─────────────────────────┘ │
                               │ ┌─────────────────────────┐ │
                               │ │   Static Generation     │ │ ──► CDN-ready pages with
                               │ │   (Performance Focus)   │ │     caching headers
                               │ └─────────────────────────┘ │
                               └─────────────────────────────┘
```

## Tech Stack

### Core Technologies

- **Framework**: Astro 5.0+ (Static Site Generation)
- **Styling**: Tailwind CSS (Utility-first CSS)
- **Language**: TypeScript (Strict mode)
- **Deployment**: Netlify (CDN & Functions)

### Content Management

- **Structured Data**: NocoDB (Database API for event data)
- **Git-based CMS**: TinaCMS (Real-time editing for content pages)
- **Media Storage**: Cloudinary (Image optimization and delivery)
- **Newsletter**: Brevo API (Email campaign management and subscriber sync)

### NocoDB Database Tables

The festival programme comes from three main NocoDB tables (IDs are set in the build scripts and environment):

1. **Conferences Table**
   - Festival conference sessions with speakers and descriptions
   - 60-minute duration sessions with detailed speaker information
   - Integrates with festival filtering system

2. **Workshops Table**
   - Interactive workshop sessions for hands-on learning
   - Variable duration workshops with practical activities
   - Filtered separately from digital demos for UX clarity

3. **Stands Table**
   - Exhibition and information stands at the festival
   - Interactive spaces for networking and resource sharing
   - Location and timing information for attendees

### Newsletter Integration

- **Data Collection**: Subscriber information stored in a NocoDB table
- **Brevo Synchronization**: Each subscription is added to the Brevo contact list
- **GDPR Compliance**: Privacy policy acceptance is recorded with each subscription

### Development Tools

- **Icons**: Tabler Icons via Iconify
- **Email**: Brevo API (Newsletter integration and campaign management)
- **Testing**: Playwright (E2E), Node's built-in test runner (unit tests)
- **Code Quality**: ESLint, Prettier, TypeScript

## Development

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Data Management

```bash
# Regenerate festival data from NocoDB (--reset)
npm run build:events

# Fetch festival data only (no reset)
npm run fetch:festival

# Regenerate pedagogical sheets from NocoDB
npm run build:fiches

# Clean build artifacts
npm run clean
```

### Code Quality

```bash
# Run all checks
npm run check

# Type checking
npm run check:astro

# Linting
npm run check:eslint

# Fix lint and formatting
npm run fix
```

> `src/content/festival/*.json` and `src/content/post/5_FICHES/*.mdx` are regenerated from NocoDB on every build. Do not edit them by hand: change the source in NocoDB.

### Testing

```bash
# Unit tests (utilities, changelog guard, CMS content integrity)
npm run test:utils

# Media upload tests (TinaCMS image compression and guard)
npm run test:media

# Run E2E tests (desktop browsers only)
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run specific test scenarios
npm run test:e2e -- tests/e2e/scenarios/badge-consistency.spec.js

# Run single browser for faster testing
npm run test:e2e -- --project=chromium
```

### Netlify Functions Testing

```bash
# Unit tests — all 3 form functions (no API token needed, 75 tests)
node netlify/functions/__tests__/all-functions.test.js

# E2E tests with real NocoDB API (requires token)
echo "NOCODB_API_TOKEN=your_token" > .env
node netlify/functions/__tests__/e2e-submit-pedagogical-sheet.js
node netlify/functions/__tests__/e2e-submit-contact.js
node netlify/functions/__tests__/e2e-submit-newsletter.js
```

Unit tests cover all 3 form functions (pedagogical sheet, contact, newsletter): handler modes, data formatting, field mapping, spam filtering, error handling, and env var isolation. E2E tests create test records, verify them in NocoDB, then delete them automatically. See [Netlify Functions Test Documentation](netlify/functions/__tests__/README.md) for details.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components (Image, Button)
│   ├── features/       # Feature-specific components
│   ├── sections/       # Page sections (Hero, Content)
│   └── ui/            # Base interface components
├── content/            # Content files (MDX, JSON)
├── layouts/            # Page layout templates
├── pages/             # Astro pages and routing
├── scripts/           # Build and data processing scripts
├── services/          # Data services (events, image processing, cache)
└── utils/             # Utility functions and helpers

netlify/
├── functions/          # Forms (contact, newsletter, sheets), Cloudinary media API
└── edge-functions/     # Client portal password check (portal-auth.ts)

tina/                   # TinaCMS schema (regenerate tina-lock.json after any change)

tests/
└── e2e/
    └── scenarios/      # E2E test scenarios (Playwright)
```

## Environment Variables

Required variables for full functionality:

```bash
# Content Management
NOCODB_API_TOKEN=your_nocodb_token
TINA_CLIENT_ID=your_tina_client
TINA_TOKEN=your_tina_token
TINA_SEARCH_TOKEN=your_tina_search

# Media Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Client portal (/dashboard/)
PORTAL_PASSWORD=your_portal_password

# Email Integration
BREVO_API_KEY=your_brevo_key
BREVO_LIST_ID=your_brevo_list
```

**Netlify Setup**:

1. Navigate to Site Settings > Environment variables
2. Add variables with corresponding production values
3. Redeploy to apply changes

## Performance & Environmental Impact

### Eco-Design

Website Carbon rating A: cleaner than 93% of web pages tested, about 0.04 g of CO₂ per visit (homepage, test of 2026-03-25, [report](https://www.websitecarbon.com/website/outofthebooks-com/)).

### Optimization Strategy

- Static generation for reduced server load
- Image optimization with multiple formats (AVIF, WebP, JPG)
- CDN distribution for global delivery
- Component-level code splitting
- Optimized bundle sizes

### Content Processing

The platform processes content in multiple stages:

1. **Data Fetching**: Retrieves structured event data from NocoDB API and editorial content from TinaCMS
2. **Content Transformation**: Processes markdown content, optimizes images, and enriches metadata
3. **Static Generation**: Creates SEO-optimized HTML pages with proper meta tags and Open Graph data
4. **Asset Optimization**: Compresses images into multiple formats (AVIF, WebP, JPG) with responsive sizing
5. **CDN Distribution**: Deploys static assets to Netlify's global edge locations for fast delivery

### "Nos Contenus" Content System

The platform features a comprehensive content management system for educational resources:

- **Podcasts**: Educational podcast episodes with transcripts and show notes
- **TV Shows**: Video content from "Pédagoscope" educational television series
- **News Articles**: Latest updates from the educational innovation community
- **Educational Resources**: "Fiches pédagogiques" (pedagogical sheets) for practical classroom implementation
- **Festival Content**: Conference recordings, workshop materials, and presentation slides

Editorial content is edited in TinaCMS (each save is a Git commit that triggers a new build); structured data comes from NocoDB.

## Testing Strategy

### E2E Test Scenarios (Playwright)

- **Badge Consistency**: Validates content labeling and filter consistency across pages
- **Navigation & Anchors**: Tests menu navigation, anchor scrolling, and SEO-friendly URLs
- **Festival Filters**: Event type filtering, day filters, and responsive behavior
- **Festival Dates**: Dates entered in TinaCMS are displayed correctly across the site

### Netlify Functions Tests

- **Unit tests** (`netlify/functions/__tests__/all-functions.test.js`): data formatting, client-server field mapping, spam filtering, error handling. No API token needed.
- **E2E tests** (`netlify/functions/__tests__/e2e-submit-*.js`): Real NocoDB API calls — submission via handler, record verification, automatic cleanup. Requires `NOCODB_API_TOKEN` in `.env`.

### Unit Tests (`npm run test:utils`)

- **Rich text and CMS content**: TinaCMS rich-text rendering and a guard against corrupted CMS placeholders
- **Client journal**: the portal changelog must never show developer-only details (file lists, ticket numbers, paths)

### Test Configuration

- **Browsers**: Chrome, Firefox, Safari (desktop only - mobile uses different menu structure)
- **Test Files**: 4 scenario files in `/tests/e2e/scenarios/`
- **Retries**: Configured in `playwright.config.ts` for stability

### Quality Assurance

- **Quality gate**: `npm run check` (Astro type check, ESLint, Prettier) must pass before merging
- **Cross-browser testing**: Chrome, Firefox, Safari (desktop only)
- **Manual accessibility testing**: Screen readers and keyboard navigation

## Deployment Pipeline

### Build Process

```bash
# Production build with optimizations
npm run build:netlify

# Includes:
# - Content generation from APIs
# - Image optimization and compression
# - Static page generation
# - Asset bundling and minification
```

### Continuous Integration

- **CI (GitHub Actions)**: on every PR to `main`, build on Node 20 and 22, `npm run check`, the offline unit suites, and Playwright E2E (Chromium) against the built site
- **Branch protection**: `main` requires a PR and passing `build (20)`, `build (22)` and `check`; no force-push or deletion. The TinaCMS app commits content edits directly to `main`.
- **Security**: Dependabot alerts and GitGuardian secret scanning on PRs
- **Monitoring**: a daily workflow (`ssl-check.yml`) fails, and emails the owner, if the HTTPS certificate is invalid or close to expiry

## Contributing

### Development Workflow

1. Work on `staging` (or a feature branch merged into it). Netlify deploys it to `staging--outofthebooks.netlify.app`, including a TinaCMS sandbox at `/admin`.
2. Run quality checks: `npm run check` and the relevant tests
3. Check the change on the staging deploy
4. Open a PR `staging` → `main` with a clear description, and merge once CI is green. `main` is production.
5. Add a client-facing entry to [CHANGELOG-2026.md](./CHANGELOG-2026.md): it is shown to the client in the portal journal.

> **TinaCMS schema rule**: after any change in `tina/*.ts` (field, collection or type), regenerate and commit `tina/tina-lock.json`, otherwise TinaCloud reports a schema mismatch. See `CLAUDE.md`.

### Code Standards

- TypeScript strict mode with proper typing
- Atomic design principles for components
- E2E test coverage for critical user paths
- Consistent code formatting with Prettier and ESLint

## Credits

Developed by [Guillaume Gustin](https://pwablo.be) using a customized version of AstroWind by [onWidget](https://onwidget.com).

## License

This project is licensed under the MIT License – see the [LICENSE](./LICENSE.md) file for details.
