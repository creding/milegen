## Lighthouse Optimization Action List for milegen.us

This list outlines actions to improve the performance and accessibility of `milegen.us` based on the Lighthouse report.

**High Impact / Priority:**

1.  **Optimize Images:** completed
    * **Action:** Convert the large PNG image (`/images/milegen-log.png`, ~535 KiB) identified in the "Serve images in next-gen formats" audit to modern formats like WebP or AVIF. Ensure Next.js's image optimization outputs these formats.
    * **Reason:** Offers the largest potential byte savings (~369 KiB), significantly speeding up load times, especially LCP.
    * **Action:** Review the usage of `next/image` for the image identified in the "Properly size images" audit (`/_next/image?url=%2Fimages%2Fmilegen-log.png&w=1200&q=75`). Ensure the `sizes` prop is correctly configured to match the displayed size across different viewports, or adjust the requested `width` (`w=1200`) if it's unnecessarily large.
    * **Reason:** Reduces unnecessary image download size (~15 KiB potential savings).

2.  **Reduce Unused JavaScript:** complete
    * **Action:** Analyze the JavaScript bundles using `@next/bundle-analyzer` to identify the largest contributors to the 185 KiB of potential savings flagged by the "Reduce unused JavaScript" audit. Pay attention to chunks like `111-*.js`, `152-*.js`, `587-*.js` and the Google Tag Manager script (`gtag/js?...`).
    * **Action:** Identify components or libraries within these large chunks that are not essential for the initial page load or above-the-fold content. Refactor to use dynamic imports (`next/dynamic`) for these components, potentially with `{ ssr: false }`.
    * **Action:** Ensure third-party scripts (like Google Tag Manager) are loaded efficiently using `next/script` with an appropriate `strategy` (e.g., `afterInteractive` or `lazyOnload`).
    * **Reason:** Reduces the amount of JavaScript downloaded, parsed, and executed on initial load, improving TTI and TBT.

**Accessibility:**

3.  **Fix Color Contrast Issues:**
    * **Action:** Identify all elements listed in the "Background and foreground colors do not have a sufficient contrast ratio" audit.
    * **Action:** Adjust the text color and/or background color for these elements to meet the minimum WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text). Use a contrast checker tool if necessary. (Elements identified seem to use `#868e96` on `#ffffff` or `#f1f8fe`, and `#27ae60` on `#ffffff`).
    * **Reason:** Improves readability for users with visual impairments.

4.  **Correct Heading Order:**
    * **Action:** Review the HTML structure of the page, specifically the heading elements (`h1` through `h6`). Ensure they follow a logical, descending order without skipping levels (e.g., an `h4` should not directly follow an `h2` without an intermediate `h3`). The report flagged issues starting with `h4` elements.
    * **Reason:** Improves page structure semantics and navigation for assistive technology users.

**Lower Impact / Minor:**

5.  **Reduce Unused CSS:**
    * **Action:** Investigate the CSS file `/_next/static/css/d5ac4be314f182ee.css` flagged in the "Reduce unused CSS" audit (~29 KiB potential savings). Determine if this is from a component library or global styles.
    * **Action:** If using a component library, ensure tree-shaking or component-level imports are used effectively. If global styles, remove unused rules or consider splitting the CSS.
    * **Reason:** Minor reduction in network payload size.

6.  **Address Render-Blocking CSS:**
    * **Action:** Analyze the same CSS file (`/_next/static/css/d5ac4be314f182ee.css`) flagged by "Eliminate render-blocking resources". While Next.js manages CSS loading, ensure critical, above-the-fold styles are minimal and potentially inlined if this file significantly impacts FCP (potential savings were minor at ~50ms).
    * **Reason:** Minor improvement to FCP.

7.  **Investigate Long Task:**
    * **Action:** Profile the page load using browser developer tools (Performance tab) to understand the single long task (59ms) associated with `app/layout-*.js`. Identify if any specific function call within the layout component is causing this minor delay.
    * **Reason:** Very minor improvement to TBT/INP responsiveness.
