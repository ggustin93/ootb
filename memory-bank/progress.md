# Progress

<!-- What works. What's left to build. Current status. Known issues. -->

## Current Date: 28/08/2025

## Current Status
- **Asset Pipeline Enhancement**: ✅ COMPLETED - Advanced image processing with PDF conversion capability
    - PDF to WebP conversion using node-poppler and Sharp (203KB → 10KB optimization)
    - Intelligent Netlify build optimization (conditional Poppler installation)
    - Robust fallback system with placeholder generation (98.5% success rate)
    - Comprehensive test suite for asset processing functions
- **Build Optimization**: ✅ COMPLETED - Smart build system for Netlify
    - Conditional dependency installation based on content analysis
    - Automatic PDF detection in NocoDB data (8 PDFs identified)
    - Build time optimization when no PDFs present
- **Image Processing Diagnostics**: ✅ COMPLETED - Advanced failure analysis tools
    - Automated detection of failed image processing (346-byte placeholder identification)
    - Root cause analysis of image failures (expired URLs, unsupported formats)
    - Maintenance tooling for ongoing image quality monitoring
- **E2E Testing Suite**: ✅ COMPLETED - Comprehensive end-to-end testing implementation
    - 10 test scenarios covering all critical user paths (100% pass rate)
    - Desktop browser coverage: Chrome, Firefox, Safari  
    - Mobile tests disabled (different menu structure)
    - Automated validation for badge consistency, navigation, and festival filters
- **README Documentation**: ✅ UPDATED - Enhanced with NocoDB tables, Brevo integration, and testing information
    - Detailed NocoDB database structure documentation
    - Brevo newsletter synchronization documentation
    - "Nos Contenus" content system description
    - Comprehensive E2E testing documentation
- **TinaCMS Ticketing Integration**: ✅ COMPLETED - Complete integration of TinaCMS content management for festival ticketing modal
- **Festival Event Filters UI/UX**: ✅ COMPLETED - UI/UX enhancements for event filters are complete and functional
- **Performance**: All previous performance optimizations maintained and stable

## What Works

### Asset Pipeline System
- **PDF Conversion Pipeline**: 
    - PDF to PNG rasterization using node-poppler with 300 DPI quality
    - PNG to WebP optimization via Sharp (resize to 400x400, 80% quality)
    - Complete pipeline: PDF (121KB) → PNG (203KB) → WebP (10.6KB)
    - Automatic file extension detection and format-specific processing
- **Build Intelligence**: 
    - NocoDB content analysis before Poppler installation
    - Conditional system dependency management in Netlify builds
    - Smart build script (`scripts/smart-build.sh`) with PDF detection
    - Significant build time savings when no PDFs present
- **Robust Error Handling**: 
    - Automatic fallback to placeholder images (346 bytes, white 400x400 WebP)
    - 98.5% success rate for image processing (194/197 images successful)
    - Graceful handling of expired S3 URLs and unsupported formats
    - No broken images in production environment
- **Testing Infrastructure**: 
    - Direct function testing without complex mocking
    - Sample asset validation (`sample-img.jpg`, `sample-pdf-calli.pdf`)
    - Test output generation for visual verification
    - Comprehensive coverage of `getImagePath`, `createPlaceholderImage`, `convertPdfToImageBuffer`
- **Maintenance Tooling**: 
    - Automatic detection of failed images by file size analysis
    - Root cause diagnosis (expired URLs, unsupported formats, network issues)
    - Actionable recommendations for data cleanup
    - Reusable diagnostic script (`scripts/analyze-image-failures.js`)

### E2E Testing Suite
- **Comprehensive Test Coverage**: 10 test scenarios covering all critical user paths
    - Badge consistency validation across pages
    - Navigation and anchor scrolling functionality  
    - Festival page filters and responsive behavior
- **Browser Compatibility**: Desktop Chrome, Firefox, Safari support
- **Test Organization**: Structured test scenarios in `/tests/e2e/scenarios/`
- **CI Integration**: Automated testing with retry logic and HTML reporting
- **Performance**: 100% pass rate on all core functionality tests
- **Configuration**: Mobile tests disabled due to different menu structure

### Documentation System
- **README Enhancement**: Comprehensive project documentation including:
    - NocoDB database tables structure (conferences, workshops, stands)
    - Newsletter integration with Brevo API and subscriber management
    - "Nos Contenus" content system with educational resources
    - Complete E2E testing strategy and configuration
- **Technical Details**: API integrations, content processing pipeline, deployment strategy

### TinaCMS Content Management System
- **Ticketing Content Management**: 
    - Rich text editor for modal content in TinaCMS admin interface
    - Real-time content updates from CMS to live site
    - Flexible support for both string and rich text formats
    - Clean paragraph formatting with proper line spacing
- **Site Settings Integration**: 
    - Centralized content management through `settings.json`
    - Integrated ticketing configuration in site settings structure
    - Seamless data flow: TinaCMS → settings.json → components

### Festival Ticketing Modal System
- **TicketingModal Component (`src/components/ui/TicketingModal.tsx`)**:
    - Dual format support (string/rich text) for maximum flexibility
    - Automatic handling of escaped newlines (`\\\n` → `\n`)
    - Enhanced typography with `prose-base` and `leading-relaxed`
    - Professional text styling and spacing
    - Graceful fallback handling for different content structures
- **Content Rendering**: 
    - Smart paragraph separation for multi-paragraph content
    - Clean text formatting with proper line breaks
    - Dynamic content rendering based on format type
- **Integration Architecture**:
    - Data flow: `FestivalHeroSection.astro` → `TicketingButton` → `TicketingModal`
    - TypeScript interfaces updated for content compatibility
    - Seamless content propagation from CMS to display

### Festival Page (`/festival/`) - Section Programme
- **Advanced Event Filtering**: 
    - Selection by event types (Ateliers, Conférences, Stands) and days
    - Multiple day selection capability
    - Visual button states maintained correctly
- **Dynamic Filter Titles**:
    - "Tous les événements" display when all options selected
    - Proper French grammatical agreement (ex: "Toutes les conférences")
    - Simplified display like "[Event Type] - Tous les jours"
    - Handwritten font and orange color for main filter titles
- **Functional Pagination**: Navigation between event pages with logical positioning
- **Client-Side Event Rendering**: Fast, responsive event list via `EventRenderer.js`
- **Optimized Performance**: Maintained speed and responsiveness

### Technical Infrastructure
- **TinaCMS Schema Configuration**: Proper rich text field setup in `tina/siteSettingsCollection.ts`
- **Component Architecture**: Clean separation between data, logic, and presentation
- **Content Format Flexibility**: Support for future rich text enhancements
- **TypeScript Integration**: Proper type safety across all components
- **Visual Consistency**: Maintained exact UI appearance during optimization
- **Code Refactoring**: Well-structured utility classes for maintainability

## What's Left to Build
- **URL Refresh System**: Automatic refreshing of expired S3 signed URLs for better reliability
- **Format Support Expansion**: Consider supporting additional formats (.ico, .psd) if business requirement emerges
- **Advanced Rich Text Features**: Future enhancements for more complex formatting (currently basic rich text support)
- **Content Versioning**: Potential content history/versioning features in TinaCMS
- **Multi-language Support**: Internationalization for ticketing content (if needed)
- **Test Coverage Expansion**: Consider adding integration tests for API endpoints
- **Performance Monitoring**: Real-world usage metrics and performance tracking

## Known Issues
- **Expired S3 URLs**: 3 images currently fail due to expired signed URLs from NocoDB (403 errors)
- **Unsupported Formats**: Some users upload non-image files (.ico, .psd, .docx) which require placeholder generation
- **TinaCMS Display**: Rich text fields occasionally show `[object Object]` in admin interface (content functions correctly on frontend)
- **Escape Sequence Handling**: Some edge cases with nested escape sequences may need refinement
- **Rich Text Fallback**: Current implementation prioritizes string format; full rich text features could be expanded

## Testing Recommendations
Before deployment, perform comprehensive testing of:

### TinaCMS Workflow Testing
1. **Content Editing**: Test rich text editor functionality in TinaCMS admin
2. **Content Propagation**: Verify changes in CMS appear correctly in modal
3. **Format Handling**: Test both string and rich text content formats
4. **Special Characters**: Test content with various punctuation and accents

### Modal Display Testing
1. **Cross-Browser**: Test modal display in Chrome, Firefox, Safari, Edge
2. **Device Responsiveness**: Verify modal appearance on mobile/tablet/desktop
3. **Content Formatting**: Check paragraph breaks and text styling
4. **User Interaction**: Test modal open/close functionality

### Integration Testing
1. **Data Flow**: Verify complete CMS → settings.json → modal pipeline
2. **Error Handling**: Test behavior with empty or malformed content
3. **Performance**: Ensure no performance degradation with new content system
4. **Accessibility**: Verify screen reader compatibility and keyboard navigation

---
*Content below concerns previous major phases (event filtering optimization and performance refactoring) and is retained for historical reference.*

## ✅ COMPLETED (26 May 2025): Festival Event Filter UI/UX Enhancements & Final Code Refactor

## ✅ COMPLETED : Festival Page Performance Optimization & Smart Event Filtering
**COMPLETE SUCCESS**: Festival page optimization with smart filtering system and comprehensive refactoring. 
### 📊 Performance Results
- **Before**: 2-second delay before scrolling to `#programme` anchor
- **After**: **Immediate scrolling** with fast, responsive filtering
- **Root Cause Solved**: Large server-side HTML payload eliminated
- **Solution**: Client-side rendering with deferred processing and skeleton UI

### 🎯 Smart Event Filtering Implementation

#### Intelligent Filter Title Generation
1. **Smart Simplification Logic**:
   - When all 3 types selected → "Tous les événements"
   - When all 3 days selected → "Tous les événements"
   - Automatic detection when manual selection equals "all active" state

2. **Proper French Gender Agreement**:
   - "Toutes les conférences" (feminine) ✅
   - "Tous les ateliers" (masculine) ✅
   - "Tous les stands" (masculine) ✅
   - Helper function `getTypeWithArticle()` for correct grammar

3. **Festival Context Logic**:
   - "Ateliers - tous les jours" instead of "Ateliers - Mercredi & Jeudi & Vendredi"
   - Intelligent state management for better UX
   - Context-aware simplification for readability

#### EventFilters Class Synchronization
- **External utility**: `src/utils/eventFilters.js` - Main filtering logic
- **Inline version**: `src/components/ui/DayFilter.astro` - Synchronized implementation
- **Consistent behavior**: Both versions use identical logic for title generation
- **Smart state detection**: Manual selection of all items sets "isAll*Active" flags

### 🚀 Comprehensive Refactoring Achievements

#### Major Performance Boost
- ✅ **Eliminated 2-second delay**: Page scrolls immediately to `#programme`
- ✅ **Optimized image loading**: Skeleton UI with deferred event processing
- ✅ **Fast filtering**: Instant response to filter changes
- ✅ **Smooth pagination**: No UI blocking during page changes
- ✅ **Responsive experience**: Perfect mobile/desktop performance

#### Utility Class Refactoring
- ✅ **Better maintainability**: Clean separation of concerns
- ✅ **Faster development**: Reusable utility classes across components
- ✅ **Consistent code**: Standardized patterns throughout codebase
- ✅ **Improved debugging**: Clear, modular architecture
- ✅ **Future-proof**: Easy to extend and modify

#### UI/UX Enhancements
- ✅ **Handwritten font**: Applied to filter titles for elegant design
- ✅ **Multiple day selection**: Enhanced filter functionality
- ✅ **Centered event images**: Fixed alignment issues
- ✅ **Consistent icons**: Corrected icon names throughout interface
- ✅ **Smart titles**: Logical simplification for better user experience

### 🎨 UI Consistency Achievement
- ✅ **Exact Visual Match**: Client-rendered cards identical to `EventCard.astro`
- ✅ **Complete Feature Parity**: All original functionality preserved
- ✅ **Interactive Elements**: Description toggles, mobile details, animations
- ✅ **Responsive Design**: Perfect mobile/desktop experience
- ✅ **Event Listeners**: Proper attachment after DOM rendering

### 🏗️ Technical Implementation

#### Final Architecture
```
Server (Astro) → Minimal Event Data → Client (JavaScript) → Full HTML Rendering
```

#### EventRenderer Class (Complete Rewrite)
The `EventRenderer` in `DayFilter.astro` generates **exactly the same HTML structure** as `EventCard.astro`:

1. **Identical Layout**:
   - Image positioning (left on desktop, top on mobile)
   - Typography, colors, spacing
   - Badge styling with proper icons
   - Speaker photo integration

2. **Complete Features**:
   - Event type badges with colors/icons
   - Speaker photos for conferences  
   - Expandable descriptions (desktop)
   - Mobile detail toggles
   - Status indicators ("A valider")
   - External website links
   - All metadata (target, level, teachingType, theme)

3. **Interactive Functionality**:
   - Description expand/collapse buttons
   - Mobile details toggle with animations
   - Icon rotations and transitions
   - Proper event listener attachment

#### Performance Optimizations
- **Deferred Processing**: 100ms setTimeout for immediate scrolling
- **Batch Rendering**: 5 events per batch to prevent UI blocking
- **Minimal Server Data**: Only essential data passed to client
- **Event Listener Management**: Attached after complete rendering

### 📁 Files Modified (Final State)
- ✅ `src/utils/eventFilters.js`: Smart filtering with gender agreement
- ✅ `src/components/ui/DayFilter.astro`: Synchronized EventFilters implementation
- ✅ `src/components/ui/EventCard.astro`: Performance optimizations
- ✅ `src/utils/eventPagination.js`: Pagination utility class
- ✅ `src/utils/eventRenderer.js`: Rendering optimizations
- ✅ `src/types.ts`: Interface improvements and CallToAction export fix
- ✅ Multiple component files: Comprehensive utility class refactoring

### 🔧 Key Technical Decisions
1. **Client-Side Rendering**: Better perceived performance than server-side
2. **Utility Classes**: Clean separation of concerns for maintainability
3. **Exact HTML Replication**: Ensures perfect UI consistency
4. **Event Listener Strategy**: Attach after batch rendering completion
5. **Data Structure**: Minimal but complete event information
6. **Smart State Management**: Automatic detection of "all active" states
7. **French Grammar Logic**: Proper gender agreement implementation

### 📈 Performance Metrics
- **Page Load**: Immediate scrolling capability
- **Filter Response**: Instant filter application
- **Pagination**: Smooth page transitions
- **Memory Usage**: Efficient batch rendering
- **User Experience**: Seamless interaction
- **Code Quality**: Maintainable, modular architecture

## 🚀 What Works Now

### Festival Page (`/festival/`)
- ✅ **Immediate Scrolling**: No delay when navigating to `#programme`
- ✅ **Smart Filtering**: Intelligent title generation with proper French grammar
- ✅ **Fast Response**: Instant filter application and pagination
- ✅ **Perfect UI**: Identical to original `EventCard.astro` design
- ✅ **Mobile Responsive**: Excellent mobile experience
- ✅ **Interactive Elements**: All buttons and toggles working smoothly

### Event Display System
- ✅ **Event Cards**: Complete visual and functional parity
- ✅ **Speaker Photos**: Proper display for conferences
- ✅ **Event Badges**: Correct colors and icons by type
- ✅ **Status Indicators**: "A valider" events properly marked
- ✅ **External Links**: Website links working correctly
- ✅ **Metadata Display**: All event details shown appropriately

### Smart Filtering System
- ✅ **Gender Agreement**: Proper French grammar throughout
- ✅ **Context Awareness**: Festival-specific logic and terminology
- ✅ **Smart Simplification**: "Tous les événements" for complete selections
- ✅ **State Synchronization**: Manual and "all active" states aligned
- ✅ **User-Friendly**: Logical, readable filter titles

### Performance Infrastructure
- ✅ **Utility Classes**: Clean, maintainable code architecture
- ✅ **Batch Rendering**: Prevents UI blocking
- ✅ **Event Management**: Proper listener attachment/cleanup
- ✅ **Data Flow**: Efficient server-to-client data transfer
- ✅ **Skeleton UI**: Immediate feedback while content loads

## 🧠 Key Learnings

### Performance Optimization
- **Server-side rendering** can block browser scrolling with large datasets
- **Client-side rendering** with skeleton UI provides better perceived performance
- **Deferred processing** allows critical UI operations (scrolling) to happen first
- **Batch rendering** prevents browser blocking during heavy operations

### Code Architecture
- **Utility classes** make complex JavaScript much more maintainable
- **Separation of concerns** improves debugging and testing
- **Event listener management** is crucial for dynamic content
- **Consistent patterns** across codebase improve development speed

### User Experience
- **Immediate response** is more important than complete content loading
- **Visual consistency** must be maintained during performance optimizations
- **Progressive enhancement** allows core functionality while features load
- **Context awareness** improves filter logic and user understanding

### French Language Implementation
- **Gender agreement** is critical for professional French applications
- **Context-specific logic** enhances user experience in domain-specific apps
- **Smart simplification** reduces cognitive load for users
- **Automatic state detection** improves interface intelligence

## 🎯 Next Phase Opportunities

### Monitoring & Maintenance
1. **Performance Tracking**: Monitor real-world usage metrics
2. **User Feedback**: Collect feedback on new filtering experience
3. **Code Maintenance**: Keep utility classes updated and optimized

### Potential Future Enhancements
1. **Search Functionality**: Text search across events
2. **Advanced Filters**: More granular filtering options (theme, level, etc.)
3. **Favorites System**: User bookmarking capability
4. **Calendar Integration**: Export events to calendar apps
5. **Offline Support**: Service worker for offline functionality

### Code Quality Improvements
1. **Testing**: Add unit tests for utility classes
2. **Documentation**: Update technical documentation
3. **Optimization**: Further performance tuning if needed
4. **Accessibility**: Enhanced WCAG compliance

## 📋 Current Status: READY FOR NEXT PROJECT

The festival page optimization and smart filtering implementation is **100% complete** and successful. All goals achieved:
- ✅ **Performance**: 2-second delay eliminated, instant filtering
- ✅ **Maintainability**: Comprehensive utility class refactoring
- ✅ **UX**: Smart filter titles with proper French grammar
- ✅ **Visual Consistency**: Exact match with original design
- ✅ **Code Quality**: Clean, modular, well-documented architecture
- ✅ **User Experience**: Fast, responsive, intuitive interaction

**Ready for commit, deployment, and next development phase.**

## Development Guidelines
- **Trailing Slash Configuration**: Successfully changed to `true` (aligning with Netlify's `pretty_urls = true`), resolving Google Search Console 5xx errors.
- **Website Functionality**: Core website features are operational.
- **Development Guidelines**: Initial Memory Bank populated with project brief, product context, tech context, and system patterns.

## Known Issues
- **Broken Anchor Link Scrolling**: The change to `trailingSlash: true` has broken in-page anchor link navigation (e.g., `/festival/#programme`). Links to sections do not reliably scroll the user to the target section. The browser seems to lose or not act upon the hash part of the URL after a potential redirect to the trailing slash version.
- **User Report (Benoît)**: Clicking menu items like "programme sur festival" navigates to `/festival/` but does not scroll to the `#programme` section.

## What's Left to Build / Next Steps
- **Implement Anchor Scroll Fix**:
    - **File to Modify**: `src/components/common/BasicScripts.astro`.
    - **Action**: Integrate a client-side JavaScript solution (`handleAnchorScroll()` function) into the existing `onLoad` function within `BasicScripts.astro`.
    - **Details**: The script must account for the fixed/sticky header height to ensure correct scroll offset. It should use `window.location.hash`, `document.getElementById()`, and `window.scrollTo()`.
    - **Integration**: Ensure the new logic is compatible with existing script lifecycle events (`window.onload`, `astro:after-swap`) and doesn't conflict with other scripts like the Intersection Observer (`Observer.start()`).
- **Testing**:
    - Test direct anchor URLs.
    - Test in-page menu links.
    - Test cross-page links with anchors.
    - Verify header offset.
    - Regression test other JS features (theme toggle, mobile menu, scroll animations, social sharing).

## What Works
- Core website functionality.
- Netlify `pretty_urls` and `trailingSlash: true` are active.
- Resolution of previous Google Search Console 5xx errors related to URL inconsistencies.

## Progression du Projet - 19/07/2024

**Ce qui fonctionne / Ce qui est terminé (sur la branche `staging`):**

1.  **Configuration de Base du Projet Astro (Out of the Box):**
    *   Structure du projet initialisée.
    *   Configuration `trailingSlash: true` et `build.format: 'file'` appliquée dans `astro.config.mjs` (via `src/config.yaml`).
    *   Netlify `pretty_urls = true` configuré dans `netlify.toml`.

2.  **Défilement des Ancres (Anchor Scrolling):**
    *   **CORRIGÉ & VALIDÉ:** Le défilement vers les ancres (ex: `/festival/#themes`) fonctionne correctement, y compris après la redirection automatique vers une URL avec slash final (ex: `/festival/#themes/`).
    *   La logique dans `src/components/common/BasicScripts.astro` gère les slashs dans `window.location.hash` et écoute les `hashchange` pour les navigations sur la même page.
    *   Les URLs dans `src/content/navigation/index.json` ont été mises à jour pour inclure un slash final avant l'ancre (ex: `/a-propos/#equipe`).

3.  **Déclenchement de la Modale de Billetterie via Hash URL:**
    *   **CORRIGÉ & VALIDÉ:** La navigation vers `/festival/#tickets/` (ou variations proches comme `/#tickets`, `#tickets`) ouvre automatiquement la modale de billetterie.
    *   La logique se trouve dans `src/components/ui/TicketingButton.tsx` et utilise un `useEffect` avec un écouteur `hashchange`.

4.  **Loader pour la Section Programme du Festival:**
    *   **IMPLÉMENTÉ (Fonctionnel):** Un loader subtil s'affiche pour la section `/festival/#programme` pendant le chargement/rendu initial de ses événements.
    *   Le composant `src/components/ui/DayFilter.astro` gère l'affichage de ce loader de manière autonome.
    *   Un nouveau composant `src/components/ui/SectionLoader.astro` a été créé pour l'animation.
    *   L'idée d'un spinner/loader plus complexe a été abandonnée au profit de l'optimisation du chargement des données.

5.  **Gestion des Erreurs GSC (5xx):**
    *   L'application cohérente des slashes finaux (`trailingSlash: true` et `pretty_urls = true`) devrait résoudre les erreurs 5xx liées aux inconsistances d'URL sur GSC. À surveiller après le déploiement de `main`.

**Ce qui reste à faire / En cours:**

1.  **Optimisation des Performances et Correction de Bugs (Branche `staging`):**
    *   **Optimisation `events.json`**: Analyse et refonte du chargement de `events.json` pour éviter les chargements multiples et améliorer la performance de `festival.astro` et `DayFilter.astro`.
    *   **Correction Taille Images Conférenciers**: Investiguer et corriger l'affichage des images des conférenciers dans `EventCard.astro` et `SpeakerImage.astro`.
    *   **Correction Erreurs Linter**: Résoudre les erreurs TypeScript dans `DayFilter.astro`.

2.  **Tests et Validation (Branche `staging`):**
    *   L'utilisateur doit effectuer des tests complets sur l'URL de prévisualisation Netlify pour la branche `staging` afin de valider :
        *   Le défilement des ancres sur toutes les pages concernées.
        *   L'ouverture de la modale de billetterie via différents moyens (URL directe, clic menu).
        *   L'affichage correct du loader pour la section programme (et sa pertinence après optimisation).
        *   Les performances de chargement de la page `/festival/`.
        *   L'affichage correct des images des conférenciers.

3.  **Fusion et Déploiement:**
    *   Si tous les tests sont concluants, fusionner la branche `staging` dans `main`.
    *   Déployer `main` en production.

4.  **Surveillance Post-Déploiement:**
    *   Surveiller Google Search Console pour s'assurer que les erreurs 5xx sont résolues.
    *   Vérifier le comportement général du site en production.

**Problèmes Connus / Points de vigilance:**

*   Aucun problème bloquant identifié sur la branche `staging` actuellement.
*   **Performance `events.json`**: Potentiel ralentissement dû au chargement/traitement de `events.json`.
*   **Taille Images Conférenciers**: Affichage potentiellement incorrect des images des conférenciers.

**Objectifs Futurs (Hors Scope Immédiat):**

*   Revue générale du SEO technique.
*   Optimisation des performances (autres que le loader déjà ajouté).

**Note:** Toutes les modifications récentes ont été poussées sur la branche `staging`.

## What Works
- **Consistent URL Structure**: Achieved through `trailingSlash: true` in Astro and Netlify's `pretty_urls`.
- **Resolution of GSC 5xx Errors**: The consistent URL structure fixed previous GSC 5xx errors.
- **Full Anchor Link Scrolling Functionality (Verified on Staging)**.
- **Ticketing Modal Hash Triggering (Verified on Staging)**: The `/festival/#tickets/` modal now opens reliably via direct URL access, menu clicks, and button clicks.
- **Local Development Experience**: Clicking links in the menu now correctly navigates to pages and scrolls/opens modals as expected.
- **Staging Deployment**: The `staging` branch on Netlify reflects the latest fixes and functions as expected.
- **Loader for Festival Programme**: A basic loader is functional in `DayFilter.astro`.

## Development Guidelines
- **Trailing Slash Configuration**: Successfully changed to `true` (aligning with Netlify's `pretty_urls = true`), resolving Google Search Console 5xx errors.
- **Website Functionality**: Core website features are operational.
- **Development Guidelines**: Initial Memory Bank populated with project brief, product context, tech context, and system patterns.

## Known Issues
- **Broken Anchor Link Scrolling**: The change to `trailingSlash: true` has broken in-page anchor link navigation (e.g., `/festival/#programme`). Links to sections do not reliably scroll the user to the target section. The browser seems to lose or not act upon the hash part of the URL after a potential redirect to the trailing slash version.
- **User Report (Benoît)**: Clicking menu items like "programme sur festival" navigates to `/festival/` but does not scroll to the `#programme` section.

## What's Left to Build / Next Steps
- **Implement Anchor Scroll Fix**:
    - **File to Modify**: `src/components/common/BasicScripts.astro`.
    - **Action**: Integrate a client-side JavaScript solution (`handleAnchorScroll()` function) into the existing `onLoad` function within `BasicScripts.astro`.
    - **Details**: The script must account for the fixed/sticky header height to ensure correct scroll offset. It should use `window.location.hash`, `document.getElementById()`, and `window.scrollTo()`.
    - **Integration**: Ensure the new logic is compatible with existing script lifecycle events (`window.onload`, `astro:after-swap`) and doesn't conflict with other scripts like the Intersection Observer (`Observer.start()`).
- **Testing**:
    - Test direct anchor URLs.
    - Test in-page menu links.
    - Test cross-page links with anchors.
    - Verify header offset.
    - Regression test other JS features (theme toggle, mobile menu, scroll animations, social sharing).

## What Works
- Core website functionality.
- Netlify `pretty_urls` and `trailingSlash: true` are active.
- Resolution of previous Google Search Console 5xx errors related to URL inconsistencies.
<!-- What works. What's left to build. Current status. Known issues. --> 