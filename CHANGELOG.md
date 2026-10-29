# Changelog

## 3.0.0 — 28 October 2026

### Design and content

- Preserved chocolate `#3E2723`, paper `#FFF8F0`, cream `#E8DCC6` and soft accent `#D7CCC8` from Part 2.
- Added a large “BAKED” hero, floating croissant imagery, introductory copy, featured products, a bakery-story section and a custom-order call to action.
- Placed the supplied Umhlanga Bakehouse logo at the top right on desktop and mobile, preserving its proportions and adding gentle sway.
- Kept the original product names and prices. The previous cupcake/chocolate-cake, banana-loaf/vanilla-loaf and strawberry-cake/croissant image mismatches are resolved with matching illustrative menu assets.
- Retained the three original photos in the enlarged gallery with accurate image descriptions.

### File cleanup

- Consolidated the bakery into one `Umhlanga-Bakehouse` folder.
- Standardised root page names to lowercase to avoid cross-platform link case errors.
- Moved visual assets to `assets/images/`, fonts and licences to `assets/fonts/`, shared styles to `css/`, and functionality to `js/`.
- Removed repeated inline page styling and the old placeholder SVG logo from the active build.
- Kept the two original PDFs separately under `docs/original-submissions/` instead of mixing them with website assets.
- Excluded temporary generation helpers, preview infrastructure, dependency folders and test output from the deliverable.

### Functionality

- Added data-driven catalogue rendering, live search, category filters, sorting, empty results and product dialogs.
- Implemented persistent bag quantities, removal, an empty-bag confirmation, live totals, cross-tab updates and blocked-storage handling.
- Added a separate cart page and transfer to a preselected enquiry.
- Restored the missing enquiry page with bag/menu/custom cake/catering flows and calculated menu estimates.
- Added contact and enquiry validation, per-field error messages, live character counts, summary review, downloads and copying.
- Added configurable email drafts and a dependency-free Node server for validated AJAX email delivery when credentials are configured.
- Added accessible FAQ accordions and a six-image lightbox with keyboard controls and restored focus.
- Added a working Google area map for Umhlanga and a configurable Maps Embed API path.
- Added mobile navigation, a motion toggle and reduced-motion support.

### SEO and quality

- Added unique titles, descriptions, page keywords, canonical URLs and social sharing metadata.
- Added bakery structured data using the known area without inventing a street address.
- Added descriptive image filenames, alt text, local fonts and WebP compression.
- Included robots rules, a sitemap and deployment instructions based on the repository URL supplied in the original proposal.
- Tested eight automated groups and eight pages at four responsive review widths.
- Fixed a scrolling interaction that could make automated form clicks occur before the page settled.

### Configuration still required

- Confirm the bakery’s street address before enabling a storefront pin.
- Supply a restricted Google Maps Embed API key to authenticate the keyed API route.
- Supply a confirmed business email; configure a sending provider for direct AJAX email.
- Review original-photo rights, box sizes, product dimensions and final business information.
- Make real repository commits and deploy the reviewed project. No remote push, public deployment or genuine email was performed as part of this file update.

## Part 2 history

The original README recorded gallery completion on 11 April 2026 and CSS/link/logo corrections on 13 May 2026. Those entries are retained in the new README for continuity; Part 3 supersedes the earlier decision to omit an enquiry page.
