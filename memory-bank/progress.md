# Progress

<!-- What works. What's left to build. Current status. Known issues. -->

## Current Status
- **Trailing Slash Configuration**: Astro is configured for `trailingSlash: true` (via `src/config.yaml` and Astrowind integration). This was implemented on April 26, 2025, to resolve Google Search Console 5xx errors.
- **Netlify `pretty_urls`**: Active in `netlify.toml`.
- **Anchor Link Scrolling**: A JavaScript fix has been implemented in `src/components/common/BasicScripts.astro` to handle scrolling to hash IDs, considering the sticky header. Full testing is pending resolution of the 404/routing issue.

## Known Issues
- **404 Errors on Non-Trailing Slash URLs**: Accessing pages without a trailing slash (e.g., `/festival`) results in an Astro 404 error page. This is because Astro expects slashed URLs due to `trailingSlash: true`.
- **(Potentially) Asset Loading**: A user observation about assets "not loading well" was made. This needs to be monitored after the 404/routing fix. The Astro 404 page itself seems to load its assets correctly.

## What's Left to Build / Next Steps
- **Implement Netlify Redirect for Trailing Slashes**:
    - **File to Modify**: `netlify.toml`.
    - **Action**: Add a 301 redirect rule to enforce trailing slashes for directory-like paths, ensuring consistency between direct access and Astro's expectations.
    - **Purpose**: Resolve 404 errors for non-slashed URLs and reinforce the GSC 5xx fix from April 26th by providing clear canonical URLs.
- **Testing (Post-Redirect Implementation & Deployment)**:
    - Test 301 redirects from non-slashed to slashed URLs.
    - Test direct access to slashed URLs (should be 200).
    - Re-test anchor link scrolling functionality comprehensively.
    - Verify no impact on direct file asset loading.
    - Monitor GSC for crawl status.
    - Re-evaluate any perceived asset loading issues.

## What Works
- Core website functionality (when accessed with trailing slashes).
- Astro's `trailingSlash: true` setting (via `config.yaml`) is active.
- Previous Google Search Console 5xx errors (related to `trailingSlash: false` vs. Netlify `pretty_urls`) were resolved by setting `trailingSlash: true`.
- Initial Memory Bank structure and content for project understanding have been populated and updated.
- Anchor scroll fix *code* has been implemented (awaiting full testing).

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