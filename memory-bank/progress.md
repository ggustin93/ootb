# Progress

<!-- What works. What's left to build. Current status. Known issues. -->

## Current Status
- **URL Handling & SEO**:
    - Astro is configured for `trailingSlash: true` (via `src/config.yaml`).
    - Netlify's `pretty_urls = true` (in `netlify.toml`) ensures canonical URLs are served with trailing slashes.
    - This combined setup resolves previous Google Search Console 5xx errors related to URL inconsistencies.
- **Anchor Link Navigation**:
    - A client-side JavaScript solution (`handleAnchorScroll()` in `src/components/common/BasicScripts.astro`) has been implemented to ensure smooth scrolling to anchors, accounting for the sticky header and potential modifications to the URL hash by the `trailingSlash:true` behavior.
    - Navigation links in `src/content/navigation/index.json` have been updated to use trailing slashes in paths before the hash (e.g., `/page/#anchor`), resolving 404 errors in local development and ensuring consistency.
- **Local Development**: Navigation and anchor scrolling are now working correctly.
- **Memory Bank**: Core files have been reviewed and updated to reflect the current project state and recent fixes.

## Known Issues
- **(Monitor) Asset Loading**: A previous user observation about assets "not loading well" needs to be kept in mind during staging and production testing. This is currently not confirmed as an active issue related to recent changes.
- **(Monitor) Linter Errors**: `src/pages/festival.astro` has some TypeScript linter errors related to image props that should be addressed in a separate effort.

## What's Left to Build / Next Steps
1.  **Clean Up `BasicScripts.astro`**: Comment out or remove debugging `console.log` statements from the `handleAnchorScroll` function.
2.  **Create Staging Branch**:
    - Create a new Git branch (e.g., `staging` or `feat/anchor-scroll-fix`).
    - Commit all changes:
        - `src/config.yaml` (ensure `trailingSlash: true` is active).
        - `src/components/common/BasicScripts.astro` (with `handleAnchorScroll` fix and cleaned logs).
        - `src/content/navigation/index.json` (updated `href` values).
        - `memory-bank/activeContext.md` (updated).
        - `memory-bank/progress.md` (this updated version).
        - (Potentially `memory-bank/systemPatterns.md` if changes were agreed upon).
    - Push the branch to the remote repository.
3.  **Deploy Staging Branch to Netlify**: Configure Netlify to deploy this branch to a test URL.
4.  **Thorough Testing on Staging URL**:
    - Verify all navigation links (pages and anchors).
    - Confirm smooth and accurate anchor scrolling across different pages and browsers.
    - Check for any console errors.
    - Perform general regression testing of site functionality.
5.  **(If Staging Tests Pass)** Merge the staging branch into the main production branch.
6.  **Monitor Production**: After live deployment, monitor site behavior and Google Search Console.
7.  **(Future Task - Deferred)** Revisit the renaming of `id="features"` on `/festival/`.

## What Works
- **Consistent URL Structure**: Achieved through `trailingSlash: true` in Astro and Netlify's `pretty_urls`.
- **Resolution of GSC 5xx Errors**: The consistent URL structure fixed previous GSC 5xx errors.
- **Anchor Link Scrolling**: Now functional in local development due to:
    - `handleAnchorScroll()` in `BasicScripts.astro` (handles sticky header and cleans hash).
    - Updated `href` values in `navigation.json` (prevents 404s in local dev).
- **Local Development Experience**: Clicking links in the menu now correctly navigates to pages and scrolls to anchors without 404 errors.
- **Memory Bank**: Updated to reflect recent fixes and current project status.

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