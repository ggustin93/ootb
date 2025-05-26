# Progress

<!-- What works. What's left to build. Current status. Known issues. -->

## Current Status
- **URL Handling & SEO**:
    - Astro is configured for `trailingSlash: true` (via `src/config.yaml`).
    - Netlify's `pretty_urls = true` (in `netlify.toml`) ensures canonical URLs are served with trailing slashes.
    - This combined setup resolves previous Google Search Console 5xx errors related to URL inconsistencies.
- **Anchor Link Navigation & Hash-based Modals (Fixed & Verified on Staging)**:
    - **Anchor Scrolling**: Client-side JavaScript solution (`handleAnchorScroll()` in `src/components/common/BasicScripts.astro`), including a `hashchange` event listener, ensures smooth scrolling to anchors in all scenarios. Accounts for sticky header and cleans hash fragments. Debug logs commented out.
    - **Ticketing Modal**: The modal in `src/components/ui/TicketingButton.tsx` is now correctly triggered by URL hash `/#tickets/` (and similar variations) due to updated `useEffect` and `checkHashAndOpenModal` logic. `handleClick` also consistently sets this hash. Debug logs commented out and linter warning for `_openOnLoad` addressed.
    - **Navigation Links**: `src/content/navigation/index.json` updated with trailing slashes before anchors.
- **`staging` Branch Commits**: 
    - `d1a4263`: Anchor fix log cleanup (also included other pending changes).
    - `5dab121`: Ticketing modal hash fix and `TicketingButton.tsx` cleanup.
- **Memory Bank**: Core files (`activeContext.md`, `progress.md`) are being updated to reflect the current project state and next steps (external review before merge).

## Known Issues
- **Linter Warning in `BasicScripts.astro`**: `'e' is defined but never used` in a `catch (e)` block where the `console.warn` using `e` is commented out. This is minor and non-blocking.
- **(Monitor) Asset Loading**: A previous user observation about assets "not loading well" should be kept in mind during final production testing.
- **(Monitor) Linter Errors in `src/pages/festival.astro`**: Pre-existing TypeScript linter errors related to image props in this file should be addressed in a separate effort.

## What's Left to Build / Next Steps
1.  **External Review on Staging**: Share the `staging` URL with a friend/colleague for independent testing and feedback on anchor scrolling and ticketing modal functionality.
2.  **Address Feedback (if any)**: Implement any necessary changes based on the feedback.
3.  **Merge `staging` Branch to `main`**: Once feedback is positive and any issues are resolved, merge the `staging` branch into the `main` production branch.
4.  **Deploy `main` to Production**: Netlify will automatically deploy `main`.
5.  **Post-Production Testing**: Perform a final round of testing on the live production site.
6.  **Monitor Production**: Monitor site behavior and Google Search Console for any new issues.
7.  **Handle Untracked/Remaining Files**:
    - Decide the fate of the untracked `src/services/api/nocodb/` directory.
    - Address any other outstanding local changes.
8.  **(New Task - Loader for /festival/#programme)**: After `main` is updated and stable, begin work on adding a loading indicator for the programme section on the festival page.
9.  **(Future Task - Deferred)** Revisit the renaming of `id="features"` on `/festival/`.

## What Works
- **Consistent URL Structure**: Achieved through `trailingSlash: true` in Astro and Netlify's `pretty_urls`.
- **Resolution of GSC 5xx Errors**: The consistent URL structure fixed previous GSC 5xx errors.
- **Full Anchor Link Scrolling Functionality (Verified on Staging)**.
- **Ticketing Modal Hash Triggering (Verified on Staging)**: The `/festival/#tickets/` modal now opens reliably via direct URL access, menu clicks, and button clicks.
- **Local Development Experience**: Clicking links in the menu now correctly navigates to pages and scrolls/opens modals as expected.
- **Staging Deployment**: The `staging` branch on Netlify reflects the latest fixes and functions as expected.

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