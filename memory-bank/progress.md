# Progress

<!-- What works. What's left to build. Current status. Known issues. -->

## Current Status
- **URL Handling & SEO**:
    - Astro is configured for `trailingSlash: true` (via `src/config.yaml`).
    - Netlify's `pretty_urls = true` (in `netlify.toml`) ensures canonical URLs are served with trailing slashes.
    - This combined setup resolves previous Google Search Console 5xx errors related to URL inconsistencies.
- **Anchor Link Navigation (Fixed & Verified on Staging)**:
    - A client-side JavaScript solution (`handleAnchorScroll()` in `src/components/common/BasicScripts.astro`), including a `hashchange` event listener, ensures smooth scrolling to anchors in all scenarios (initial load, subsequent same-page clicks).
    - The script accounts for the sticky header and potential trailing slashes in hash fragments.
    - Debugging `console.log` statements have been commented out from `BasicScripts.astro`.
    - Navigation links in `src/content/navigation/index.json` have been updated with trailing slashes before anchors (e.g., `/page/#anchor`), resolving local 404s and ensuring consistency.
- **`staging` Branch Commit (d1a4263)**: The latest commit on `staging` includes the anchor fix (with logs removed) and also incorporated other pending changes:
    - Deletion of `.cursorrules`.
    - Modifications to `.gitignore`, `package-lock.json`, `package.json`.
    - Updates to festival content files (`src/content/festival/*` and `src/content/festival/raw-data/*`).
- **Memory Bank**: Core files (`activeContext.md`, `progress.md`) are being updated to reflect the current project state.

## Known Issues
- **Linter Warning in `BasicScripts.astro`**: `'e' is defined but never used` in a `catch (e)` block where the `console.warn` using `e` is commented out. This is minor and non-blocking.
- **(Monitor) Asset Loading**: A previous user observation about assets "not loading well" should be kept in mind during final production testing, though not observed as an issue during recent staging tests related to anchor scrolling.
- **(Monitor) Linter Errors in `src/pages/festival.astro`**: Pre-existing TypeScript linter errors related to image props in this file should be addressed in a separate effort.

## What's Left to Build / Next Steps
1.  **Review and Confirm Changes in Commit `d1a4263`**: Ensure all files included in this commit on the `staging` branch are intended and ready for merging to `main`.
2.  **Merge `staging` Branch to `main`**: Once confirmed, merge the `staging` branch into the `main` production branch.
3.  **Deploy `main` to Production**: Netlify will automatically deploy `main`.
4.  **Post-Production Testing**: Perform a final round of testing on the live production site.
5.  **Monitor Production**: Monitor site behavior and Google Search Console for any new issues.
6.  **Handle Untracked/Remaining Files**:
    - Decide the fate of the untracked `src/services/api/nocodb/` directory (e.g., add to `.gitignore` or commit to `feature/nocodb-refactoring`).
    - Address any other outstanding local changes not part of the `staging` branch.
7.  **(Future Task - Deferred)** Revisit the renaming of `id="features"` on `/festival/`.

## What Works
- **Consistent URL Structure**: Achieved through `trailingSlash: true` in Astro and Netlify's `pretty_urls`.
- **Resolution of GSC 5xx Errors**: The consistent URL structure fixed previous GSC 5xx errors.
- **Full Anchor Link Scrolling Functionality (Verified on Staging)**:
    - Scrolling on initial page load with an anchor.
    - Scrolling when clicking an anchor link on the same page (first time).
    - Scrolling when clicking subsequent anchor links on the same page (due to `hashchange` listener).
    - Sticky header is correctly accounted for.
    - Hash cleaning logic handles potential trailing slashes.
- **Local Development Experience**: Clicking links in the menu now correctly navigates to pages and scrolls to anchors without 404 errors.
- **Staging Deployment**: The `staging` branch on Netlify reflects the latest fixes and functions as expected regarding anchor navigation.

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