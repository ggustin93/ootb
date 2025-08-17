# Out of the Books Website

A collaborative platform for educational innovation in French-speaking Belgium, built with Astro and Tailwind CSS.

## About

Out of the Books ASBL is a non-profit organization that brings together teachers, experts, and education enthusiasts to foster pedagogical innovation. The organization connects education stakeholders and aims to transform learning experiences in French-speaking Belgium.

## Features

- Fully responsive design for all devices
- Dark mode support
- Built with Astro 5.0 and Tailwind CSS
- SEO optimization with Open Graph support
- Image optimization via Astro Assets
- Smart event filtering with French language support
- Real-time content management via TinaCMS

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
                               ┌───────────────────────────┐
                               │   Content Processing      │
                               │                           │
                               │ ┌─────────────────────────┐ │
                               │ │   Data Aggregation      │ │ ──► Festival events, workshops
                               │ │   (Events, Resources)   │ │     podcasts, resources
                               │ └─────────────────────────┘ │
                               │ ┌─────────────────────────┐ │
                               │ │   Image Optimization    │ │ ──► AVIF, WebP, responsive
                               │ │   (Multi-format)        │ │     sizes with lazy loading
                               │ └─────────────────────────┘ │
                               │ ┌─────────────────────────┐ │
                               │ │   Static Generation     │ │ ──► CDN-ready pages with
                               │ │   (Performance Focus)   │ │     optimal caching headers
                               │ └─────────────────────────┘ │
                               └───────────────────────────┘
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
The platform uses three main NocoDB tables for structured content management:

1. **Conferences Table** (`mdf8viczcxywoug`)
   - Festival conference sessions with speakers and descriptions
   - 60-minute duration sessions with detailed speaker information
   - Integrates with festival filtering system

2. **Workshops Table** (`maiiy35ahod5nnu`) 
   - Interactive workshop sessions for hands-on learning
   - Variable duration workshops with practical activities
   - Filtered separately from digital demos for UX clarity

3. **Stands Table** (`mbwhou86e9tzqql`)
   - Exhibition and information stands at the festival
   - Interactive spaces for networking and resource sharing
   - Location and timing information for attendees

### Newsletter Integration
- **Data Collection**: Subscriber information stored in NocoDB table `m6hnpjey4laav0z`
- **Brevo Synchronization**: Automatic sync with email campaigns and subscriber management
- **GDPR Compliance**: Privacy policy acceptance and data processing transparency
- **Double Opt-in**: Confirmation process for newsletter subscriptions

### Development Tools
- **Icons**: Tabler Icons via Iconify
- **Email**: Brevo API (Newsletter integration and campaign management)
- **Testing**: Playwright (E2E testing)
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
# Generate event data from NocoDB
npm run build:events

# Fetch latest content updates
npm run fetch:events

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

# Format code
npm run fix
```

### Testing

```bash
# Run E2E tests (desktop browsers only)
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run specific test scenarios
npm run test:e2e -- tests/e2e/scenarios/badge-consistency.spec.js

# Run single browser for faster testing
npm run test:e2e -- --project=chromium
```

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
├── services/          # API integrations (NocoDB, Brevo)
└── utils/             # Utility functions and helpers

tests/
└── e2e/
    └── scenarios/      # Organized E2E test scenarios
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
Site écoconçu et optimisé - Plus écologique que 91% des sites web testés ([EcoGrader Report](https://ecograder.com/report/kdlM0TtLWQa0oT3UWTZlEzJT))

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

Content is managed through TinaCMS for real-time editing and automatically synchronized with the static site generation pipeline.

## Testing Strategy

### E2E Test Scenarios
- **Badge Consistency**: Validates content labeling and filter consistency across pages
- **Navigation & Anchors**: Tests menu navigation, anchor scrolling, and SEO-friendly URLs
- **Festival Filters**: Comprehensive testing of event type filtering, day filters, and responsive behavior

### Test Configuration
- **Browsers**: Chrome, Firefox, Safari (desktop only - mobile uses different menu structure)
- **Test Files**: Organized in `/tests/e2e/scenarios/` with specific test scenarios
- **CI Integration**: Automated testing with retry logic for stability

### Quality Assurance
- **Cross-browser testing**: Chrome, Firefox, Safari (desktop only)
- **E2E Test Coverage**: 10 comprehensive test scenarios covering all critical user paths
- **Responsive testing**: Mobile and desktop viewports with automated validation
- **Manual accessibility testing**: Screen readers and keyboard navigation
- **Test Status**: 100% pass rate on all core functionality tests

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
- Branch protection: Main branch requires PR approval
- Automated testing: E2E tests run on all PRs
- Security scanning: Regular dependency vulnerability checks

## Contributing

### Development Workflow
1. Create feature branch from `main`
2. Implement changes with proper testing
3. Run quality checks: `npm run check`
4. Submit PR with clear description
5. Address review feedback
6. Merge after approval

### Code Standards
- TypeScript strict mode with proper typing
- Atomic design principles for components
- E2E test coverage for critical user paths
- Consistent code formatting with Prettier and ESLint

## Credits

Developed by [Guillaume Gustin](https://pwablo.be) using a customized version of AstroWind by [onWidget](https://onwidget.com).

## License

This project is licensed under the MIT License – see the [LICENSE](./LICENSE.md) file for details.