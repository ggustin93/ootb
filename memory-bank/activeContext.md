# Active Context

<!-- Current work focus. Recent changes. Next steps. Active decisions and considerations. -->

## Current Primary Focus: Finalizing Staging Tests & Preparing for Review

### 1. Background & Problem Statement:
- The Astro configuration `trailingSlash: true` (in `src/config.yaml`) is active for URL consistency with Netlify's `pretty_urls = true` and to prevent previous GSC 5xx errors.
- This setup interfered with native anchor scrolling and hash-based modal triggering.
- Initial navigation links in `src/content/navigation/index.json` also lacked trailing slashes before hashes.
- The Ticketing modal (`src/components/ui/TicketingButton.tsx`) was not consistently triggered by URL hashes like `/festival/#tickets/`.

### 2. Goals:
- Restore smooth, reliable automatic scrolling to anchor targets.
- Ensure modals can be triggered reliably via specific URL hash patterns.
- Maintain `trailingSlash: true`.
- Ensure correct navigation link behavior in local dev and production.
- Account for the sticky header in scrolling.

### 3. Solution Implemented:
A multi-part solution has been implemented and verified on the `staging` branch:

   **a) Client-Side JavaScript for Anchor Scrolling (`src/components/common/BasicScripts.astro`):**
    - `handleAnchorScroll()` function added, called on page load/swap and `hashchange`.
    - Cleans hash (removes trailing slash) before `getElementById()`.
    - Accounts for sticky header `offsetHeight`.
    - Uses `window.scrollTo()` with `behavior: 'smooth'`.

   **b) Update Navigation Links (`src/content/navigation/index.json`):**
    - Internal navigation links updated to include a trailing slash before the hash (e.g., `"/festival/#programme"`).

   **c) Astro Configuration (`src/config.yaml`):**
    - `trailingSlash: true` remains active.

   **d) Ticketing Modal Hash Handling (`src/components/ui/TicketingButton.tsx`):**
    - `useEffect` hook updated to listen for `hashchange`.
    - `checkHashAndOpenModal` function now correctly identifies `/#tickets/` (and similar variations like `#tickets`, `/#tickets`, `#tickets/`) to trigger the modal.
    - `handleClick` function now sets `window.location.hash = '/#tickets/'` for consistency when the button is clicked.
    - Unused prop `openOnLoad` was prefixed with `_` to satisfy linter.
    - Debugging `console.log` statements were commented out after successful testing.

### 4. Recent Changes & Current Status:
- **`src/components/common/BasicScripts.astro`**: Anchor scrolling scenarios confirmed working on `staging`. Console logs commented out.
- **`src/content/navigation/index.json`**: `href` values updated.
- **`src/components/ui/TicketingButton.tsx`**: Modal triggering via `/festival/#tickets/` (and similar hashes) fixed and confirmed working on `staging`. Logs commented out and linter warning for `_openOnLoad` addressed.
- **`staging` Branch Commits**: 
    - `d1a4263`: Anchor fix log cleanup (also included other pending changes like `.cursorrules` deletion, `package.json` updates, and festival content files).
    - `5dab121`: Ticketing modal hash fix and `TicketingButton.tsx` cleanup.
- **Local & Staging Testing**: Confirmed that anchor scrolling and ticketing modal triggering via hash work reliably in all tested scenarios on `staging`.

### 5. Next Steps:
1.  **External Review on Staging**: Share the `staging` URL with a friend/colleague for independent testing and feedback.
2.  **Address Feedback (if any)**: Implement any necessary changes based on the feedback.
3.  **Merge `staging` Branch to `main`**: Once feedback is positive and any issues are resolved, merge the `staging` branch into the `main` production branch.
4.  **Deploy `main` to Production**: Netlify will automatically deploy `main`.
5.  **Post-Production Testing**: Perform a final round of testing on the live production site.
6.  **Monitor Production**: Monitor site behavior and Google Search Console for any new issues.
7.  **Handle Untracked/Remaining Files**:
    - Decide the fate of the untracked `src/services/api/nocodb/` directory.
    - Address any other outstanding local changes.
8.  **(Future Task - Loader for /festival/#programme)**: Begin work on adding a loading indicator for the programme section after `main` is updated and stable.
9.  **(Future Task - Deferred)** Revisit the renaming of `id="features"` on `/festival/`.
10. **Update `memory-bank/progress.md`** to reflect the completion of these tasks and the current next steps.

### 6. Active Decisions & Considerations:
- The implemented client-side script enhancements and navigation link updates have successfully resolved anchor scrolling and hash-based modal issues while maintaining SEO best practices for URL structure.
- The `staging` branch is considered feature-complete for these fixes and ready for external review before merging to `main`.

## Developer Brief: Fixing Anchor Link Scrolling with Trailing Slashes in Astro
<!-- Retained for technical reference on the implemented solution -->
### 1. Problem Statement:
Our Astro website, with `trailingSlash: true`, had issues with in-page anchor link navigation, especially for subsequent clicks on the same page. The browser often wouldn't scroll to the target section.

### 2. Goal:
Restore reliable automatic scrolling to anchor targets, accounting for the sticky header and maintaining `trailingSlash: true`.

### 3. Reasoning & Chosen Approach:
- **Native Browser Behavior Interruption**: `trailingSlash: true` and client-side effects can disrupt default scroll-to-hash.
- **Client-Side JavaScript Solution**: A script in `src/components/common/BasicScripts.astro` handles scrolling explicitly.
- **Lifecycle Events**: Uses `window.onload`, `astro:after-swap` (via `onLoad` function), and importantly, `window.addEventListener('hashchange', handleAnchorScroll)`.
- **Sticky Header Consideration**: Calculates header height for correct scroll offset.
- **Hash Cleaning**: Removes potential trailing slashes from `window.location.hash` before fetching elements.

### 4. Action Plan (Implemented):
- **Defined `handleAnchorScroll()` function**:
    - Reads `window.location.hash`.
    - Cleans hash (e.g., `#anchor/` to `anchor`).
    - Finds element by ID.
    - Calculates offset for sticky header.
    - Scrolls using `window.scrollTo({ behavior: 'smooth' })`.
- **Called `handleAnchorScroll()`**:
    - From the existing `onLoad` function (triggered by `window.onload` and `astro:after-swap`).
    - From a new `window.addEventListener('hashchange', handleAnchorScroll)`.
- **Navigation Links Updated**: Ensured `href` attributes in `src/content/navigation/index.json` have trailing slashes before anchors (e.g. `/path/#anchor`).

### 5. Testing Steps (Completed on Staging):
- Direct anchor URLs load and scroll correctly.
- In-page menu links to anchors work on initial click.
- **Subsequent in-page menu clicks to different anchors now also work correctly due to the `hashchange` listener.**
- Cross-page links with anchors work.
- Header offset is correctly handled.
- **Ticketing modal (`/festival/#tickets/`) opens correctly via direct URL, menu click, and button click.**