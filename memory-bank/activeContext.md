# Active Context

<!-- Current work focus. Recent changes. Next steps. Active decisions and considerations. -->

## Current Primary Focus: Ensuring Reliable Anchor Link Scrolling with `trailingSlash: true`

### 1. Background & Problem Statement:
- The Astro configuration `trailingSlash: true` (in `src/config.yaml`) is active to ensure URL consistency with Netlify's `pretty_urls = true` setting and to prevent GSC 5xx errors previously encountered (see `private-notes/fix_2025-04-26_google-search-console.md`).
- This setup, while good for SEO and URL canonicalization, can interfere with the browser's native scroll-to-anchor behavior. When a URL with a hash (e.g., `/festival#programme`) is accessed, Netlify ensures the page is served from its trailing-slashed version (e.g., `/festival/#programme`). This implicit redirect or direct serving of the slashed URL can cause the browser to "lose" the scroll instruction for the anchor.
- Additionally, initial links in `src/content/navigation/index.json` did not include a trailing slash before the hash (e.g., `/festival#programme`), leading to 404 errors in the local development environment because the Astro dev server (with `trailingSlash: true`) expects paths like `/festival/`.

### 2. Goals:
- Restore smooth and reliable automatic scrolling to anchor targets (e.g., `#section-id`) across the site.
- Maintain the `trailingSlash: true` configuration for SEO and platform compatibility.
- Ensure navigation links work correctly in both local development and production (Netlify) environments without 404 errors.
- The solution must account for the site's sticky header to prevent target sections from being obscured post-scroll.

### 3. Solution Implemented:
A multi-part solution has been implemented:

   **a) Client-Side JavaScript for Anchor Scrolling (`src/components/common/BasicScripts.astro`):**
    - A `handleAnchorScroll()` JavaScript function was added.
    - This function is called on page load (`onLoad` and via `astro:after-swap`).
    - It reads `window.location.hash`.
    - If a hash is present, it attempts to find the corresponding element by ID.
    - **Key Logic**: It cleans the hash by removing any trailing slash (e.g., `#myanchor/` becomes `myanchor`) before attempting `document.getElementById()`. This handles cases where the `trailingSlash: true` logic might add a slash to the hash fragment.
    - It calculates the correct scroll position, accounting for the `offsetHeight` of the sticky header (`#header[data-aw-sticky-header]`).
    - It uses `window.scrollTo()` with `behavior: 'smooth'` to perform the scroll.

   **b) Update Navigation Links (`src/content/navigation/index.json`):**
    - All internal navigation links, especially those pointing to anchors, were updated to include a trailing slash in the path segment before the hash.
    - Example: `"/festival#programme"` was changed to `"/festival/#programme"`.
    - This ensures that links directly target the canonical URL structure expected by Astro (with `trailingSlash: true`) and served by Netlify, resolving 404 errors in the local development environment.

   **c) Astro Configuration (`src/config.yaml`):**
    - `trailingSlash: true` remains active.

### 4. Recent Changes & Current Status:
- **`src/components/common/BasicScripts.astro`**: Modified to include `handleAnchorScroll()` and call it appropriately. Console logs used for debugging will be commented out shortly before creating the staging branch.
- **`src/content/navigation/index.json`**: All relevant `href` values updated to include trailing slashes before anchors.
- **Local Testing**: Confirmed that:
    - Clicking menu links navigates to the correct slashed URLs (e.g., `/page/#anchor`).
    - No 404 errors occur.
    - Anchor scrolling works as expected.
- **Next Step**: Create a `staging` branch, deploy to a Netlify test URL, and conduct thorough testing in a production-like environment.

### 5. Next Steps (Post-Staging Branch Creation & Deployment):
1.  **Thorough Testing on Netlify Staging URL**:
    - Verify all navigation links (pages and anchors) work correctly.
    - Confirm smooth anchor scrolling on various pages and browsers.
    - Check for any console errors.
    - Monitor GSC (long-term) after merging to production to ensure no new crawl issues.
2.  **(If Staging Tests Pass)** Merge changes to the main production branch.
3.  **(Future Task - Deferred)** Revisit the renaming of `id="features"` on `/festival/` to something more descriptive like `#apropos-festival` or `#activites-cles` and update the corresponding menu link if necessary.

### 6. Active Decisions & Considerations:
- The current solution balances SEO requirements (consistent trailing slashes), developer experience (working links in local dev), and user experience (smooth anchor scrolling).
- The `handleAnchorScroll` script's robustness in cleaning potential trailing slashes from hash fragments is key to its success with the `trailingSlash:true` Astro setting.

## Current Primary Task: Resolving 404 Errors for Non-Trailing Slash URLs

### 1. Problem Statement:
Following a previous fix on April 26, 2025, where `trailingSlash` was set to `true` in `src/config.yaml` (via Astrowind integration) to resolve Google Search Console 5xx errors, a new issue has emerged:
- Accessing URLs *without* a trailing slash (e.g., `/festival`) now results in an Astro-generated 404 "Not found" page.
- The 404 page correctly indicates: "Your site is configured with `trailingSlash` set to `always`."
- This occurs because Astro, configured for `trailingSlash: true`, builds and expects URLs with trailing slashes (e.g., `/festival/index.html` served at `/festival/`). Direct requests to non-slashed paths are not found.
- Netlify's `build.processing.html.pretty_urls = true` setting serves existing slashed URLs cleanly but doesn't automatically redirect non-slashed requests to their slashed counterparts for Astro's routing to pick up.

### 2. Goal:
Eliminate 404 errors for non-trailing slash URLs by ensuring they are consistently redirected to their canonical, trailing-slashed versions. This must be done while preserving the `trailingSlash: true` setting in Astro (which resolved earlier GSC 5xx errors) and ensuring the fix for anchor link scrolling remains effective.

### 3. Reasoning & Chosen Approach:
- **Consistency is Key**: The `trailingSlash: true` setting in Astro (via `src/config.yaml` processed by the Astrowind integration) is beneficial for consistency and resolved previous GSC 5xx errors. This setting should be maintained.
- **Netlify Redirect for Canonicalization**: The most robust solution is to implement a 301 (permanent) redirect at the Netlify level. This will guide any user agents (browsers, search engine bots) requesting a non-slashed URL to the correct, trailing-slashed version that Astro expects.
- **Compatibility with Previous Fixes**: This approach reinforces the April 26th fix for GSC 5xx errors by ensuring that Googlebot is consistently presented with a single, canonical (slashed) URL for each page. It avoids the ambiguity that previously led to problematic redirects.

### 4. Action Plan:
1.  **Implement Netlify Redirect Rule**:
    - Add a 301 redirect rule to `netlify.toml`.
    - The rule will redirect paths missing a trailing slash to their slashed equivalent, specifically for directory-like paths (avoiding direct file links).
    - Proposed rule:
      ```toml
      # =====================================
      # TRAILING SLASH ENFORCEMENT
      # =====================================
      [[redirects]]
        from = "/:page"
        to = "/:page/"
        status = 301
        force = false
        conditions = {path = ["^/([^.]*[^/])$"]}
      ```
2.  **Testing (Post-Deployment)**:
    - Verify that non-slashed URLs (e.g., `/festival`) 301 redirect to their slashed versions (e.g., `/festival/`) and load correctly.
    - Verify that slashed URLs (e.g., `/festival/`) load directly with a 200 status.
    - Re-test anchor link functionality (e.g., `/festival/#programme`) to ensure it works with the enforced slashed URLs.
    - Confirm that direct file assets (e.g., `/favicon.ico`, `/assets/images/some.jpg`) are not affected by the redirect.
    - Monitor Google Search Console for any new crawl issues (none expected; this should improve crawlability).

### Recently Implemented (Pending Full Testing Post-Routing Fix):
- **Anchor Link Scrolling Fix**:
    - **File Modified**: `src/components/common/BasicScripts.astro`.
    - **Action**: Integrated a client-side JavaScript solution (`handleAnchorScroll()` function) into the existing `onLoad` function to handle smooth scrolling to hash IDs, accounting for the sticky header. This fix needs re-testing once the 404/routing issue is resolved.

## Developer Brief: Fixing Anchor Link Scrolling with Trailing Slashes in Astro

### 1. Problem Statement:

Our Astro website recently had its `trailingSlash` configuration changed to `true` (in `src/config.yaml` or `astro.config.mjs`) to align with Netlify's `pretty_urls = true` setting. This successfully resolved Google Search Console 5xx errors related to URL inconsistencies.

However, this change has introduced an issue with in-page anchor link navigation. Links that point to sections within a page (e.g., `/festival/#programme`) are no longer reliably scrolling the user to the target section (`<section id="programme">...</section>`) upon page load or after client-side navigation (if Astro View Transitions were active). The browser seems to "lose" or not act upon the hash part of the URL after the potential redirect to the trailing slash version (e.g., `festival#programme` -> `festival/#programme`).

The user in the screenshot (Benoît) specifically reports that clicking a menu item like "programme sur festival" takes them to the "home page" of the festival (i.e., `/festival/`) but doesn't automatically scroll down to the "programme" section on that page.

### 2. Goal:

Restore smooth and reliable automatic scrolling to anchor targets when a URL contains a hash (e.g., `#section-id`), while maintaining the `trailingSlash: true` configuration for SEO and platform compatibility. The solution should also account for the site's fixed/sticky header to prevent the target section from being obscured.

### 3. Reasoning & Chosen Approach:

- **Native Browser Behavior Interruption**: The combination of `trailingSlash: true` (potentially causing an implicit redirect if a non-slashed URL with a hash is accessed) and client-side JavaScript effects (common in modern frameworks like Astro, even without full View Transitions) can interfere with the browser's default scroll-to-hash behavior.
- **Client-Side JavaScript Solution**: The most robust way to address this is with a small client-side JavaScript utility that explicitly handles the scroll after the page has loaded and the DOM is ready.
- **Integration with Existing Scripts**: The project uses Astrowind, which has a `src/components/common/BasicScripts.astro` file. This file already manages various onload and page lifecycle events (like `window.onload` and `astro:after-swap`). To avoid conflicts and keep the codebase clean, the new anchor scrolling logic should be integrated into this existing script, specifically within its `onLoad` function.
- **Astro Lifecycle Events**: The solution leverages `window.onload` (via the existing `onLoad` function in `BasicScripts.astro`) and is compatible with `astro:after-swap` (for future-proofing if View Transitions are enabled) to trigger the scroll logic at the appropriate times.
- **Fixed Header Consideration**: The site has a sticky header. The scroll script must calculate the header's height and offset the scroll position accordingly to ensure the target section is fully visible.

### 4. Action Plan: Modifying `src/components/common/BasicScripts.astro`

The following changes need to be made to `src/components/common/BasicScripts.astro`:

- **Define `handleAnchorScroll()` function**:
    - This function will:
        - Read `window.location.hash`.
        - If a hash exists, use `document.getElementById()` to find the target element.
        - Query the DOM for the sticky header (e.g., using `document.querySelector('#header[data-aw-sticky-header]')`).
        - Get the `offsetHeight` of the header.
        - Calculate the correct scroll position: `element.getBoundingClientRect().top + window.pageYOffset - headerHeight`.
        - Use `window.scrollTo({ top: offsetPosition, behavior: 'smooth' })` to perform the scroll.
        - Wrap the DOM interaction part in `requestAnimationFrame()` for better performance and to ensure the element is ready.
- **Call `handleAnchorScroll()` from the existing `onLoad` function**:
    - Locate the `onLoad` function within `BasicScripts.astro`.
    - Add a call to `handleAnchorScroll();` towards the end of this function. This ensures it runs after other initial setup and is triggered by both `window.onload` and `astro:after-swap` (as `onLoad` is called by both).
- **Ensure Intersection Observer (`Observer.start()`) is correctly managed**:
    - The existing `BasicScripts.astro` has two `<script is:inline>` blocks. The second one defines an `Observer` for scroll animations.
    - Calls to `Observer.start()` should be consolidated within the `window.onload` and `astro:after-swap` event handlers in the first script block to ensure it's initialized/re-initialized correctly alongside other page setup logic.
    - The `Observer.start()` method should be made idempotent by adding `this.observer.disconnect();` and resetting `this.animationCounter` at its beginning, in case it's called multiple times.
- **Review Script Guards**: The script uses `window.basic_script_executed`. Ensure this guard allows necessary parts of the script (like `handleAnchorScroll` and event listener re-attachment if Astrowind relies on it) to run appropriately after page navigations/swaps. The current integration of `handleAnchorScroll` into `onLoad` (which is called on swaps) should suffice.

### 5. Code Snippet (Illustrative - Refer to the fully integrated version previously provided):

```javascript
// Inside the first <script is:inline> block in BasicScripts.astro

// ... (Astrowind's existing initTheme, attachEvent functions) ...

// NEW ANCHOR SCROLLING FUNCTION
function handleAnchorScroll() {
  const hash = window.location.hash;
  if (hash) {
    requestAnimationFrame(() => {
      try {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          const header = document.querySelector('#header[data-aw-sticky-header]'); // Verify this selector
          let headerHeight = 0;
          if (header) {
            headerHeight = header.offsetHeight;
          }
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      } catch (e) {
        console.warn(`Could not scroll to element with ID: ${hash.substring(1)}`, e);
      }
    });
  }
}

// MODIFIED ASTROWIND'S onLoad FUNCTION
const onLoad = function () {
  // ... (Existing Astrowind onLoad logic for menu, theme, scroll, etc.) ...

  // CALL THE NEW ANCHOR SCROLLING LOGIC
  handleAnchorScroll(); // <<< ADD THIS CALL
};

// ASTROWIND'S LIFECYCLE HOOKS (ensure onLoad and Observer.start are called)
initTheme(); // Call once for immediate effect

window.onload = () => {
  onLoad(); // Includes handleAnchorScroll()
  if (window.Observer && typeof window.Observer.start === 'function') { // Check if Observer is defined
    Observer.start();
  }
};
window.onpageshow = onPageShow; // Astrowind's existing onPageShow

document.addEventListener('astro:after-swap', () => {
  initTheme();
  onLoad(); // Includes handleAnchorScroll()
  onPageShow();
  if (window.Observer && typeof window.Observer.start === 'function') { // Check if Observer is defined
    Observer.start();
  }
});

// --- Ensure the Observer object is defined in the second script block ---
// and its start method handles re-initialization properly.
```
*(Note to Developer: The above snippet is illustrative. Please use the complete, merged `BasicScripts.astro` content provided in the previous detailed responses for the full implementation.)*

### 6. Testing Steps:

- Implement the changes in `src/components/common/BasicScripts.astro`.
- Perform a hard reload in the browser (Cmd+Shift+R or Ctrl+Shift+R).
- Open the developer console to monitor for errors.
- Test Direct Anchor URLs: Manually enter URLs like `yourdomain.com/festival/#programme` into the address bar. Verify correct scrolling and header offset.
- Test In-Page Menu Links: Click navigation items that link to sections on the current page.
- Test Cross-Page Links with Anchors: If a link from Page A goes to `PageB/#section`, test this.
- Verify Header Offset: Ensure the scrolled-to section is not hidden under the sticky header. Adjust the header selector or height calculation in `handleAnchorScroll`