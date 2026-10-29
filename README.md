# Umhlanga Bakehouse — Part 3

A responsive bakery website with the original chocolate-and-cream palette, the supplied bakery logo, an updated homepage and working JavaScript interactions.

## Student information

Details retained from the supplied Part 2 README:

- Name: Lusanda Thinga
- Student number: ST10515135
- Module: WEDE5020
- Updated: 28 October 2026

## Open the website

1. Extract the ZIP first.
2. Open the `Umhlanga-Bakehouse` folder in VS Code.
3. Use the **Live Server** extension to open `index.html`.
4. Browse the menu, add items to the bag and try the enquiry and contact forms.

There is no build step and no package installation for normal browsing. The website is HTML, CSS and JavaScript. A local HTTP server is recommended so the bag shares browser storage reliably between pages. Double-clicking `index.html` can preview the design, but `file://` storage behaviour differs between browsers.

For the optional Node server, install Node.js 22.9 or newer and run:

```sh
node server.mjs
```

Then visit `http://localhost:3000`. This server needs no third-party packages. Stop it with Ctrl+C.

## What is included

| Page | Purpose |
| --- | --- |
| `index.html` | Photography-led homepage, floating croissants, featured bakes and story sections |
| `products.html` | Dynamic menu, live search, category filters, price/name sorting and product-detail dialogs |
| `about.html` | Bakery story, values and accessible FAQ accordions |
| `gallery.html` | Six-image gallery with a keyboard-accessible lightbox |
| `contact.html` | General-message form, listed hours and Google Maps integration |
| `enquiry.html` | Separate order/custom cake/catering enquiry with menu estimates |
| `cart.html` | Persistent bag, quantities, removal, clear confirmation and totals |
| `privacy.html` | Browser storage, form delivery and map information |

## Folder organisation

| Location | Contents |
| --- | --- |
| Root HTML files | The eight public website pages, all using lowercase filenames |
| `css/` | Shared layout, responsive styles and local font declarations |
| `js/` | Configuration, catalogue, cart, shared UI, shop, gallery, map and form logic |
| `assets/images/` | Supplied logo, optimised menu images and the three original gallery photos |
| `assets/fonts/` | Local Inter and Playfair Display fonts with their licences |
| `docs/` | Rubric traceability, setup notes and preserved original submission PDFs |
| `tests/` | Automated behaviour checks and a responsive review page |
| `server.mjs` | Optional Node server with validated AJAX email submission |

There are no duplicate website copies, dependency folders or temporary authoring scripts in this project. The other supplied website was used only as an example of folder organisation. Its code, branding and content are not part of this build.

## Cart behaviour

- The three original product names and prices are retained: Chocolate Dream Cake **R250**, Vanilla Bean Loaf **R85**, Butter Croissant Box **R120**.
- All calculations use integer cents. Two cakes plus one loaf total **R585.00**.
- Adding an existing item increases its quantity. Quantities are whole numbers from 1 to 99.
- Removing items, emptying the bag and the empty state all work.
- Product IDs and quantities are saved in local storage. Personal form details are not saved there.
- The bag synchronises across same-origin tabs and survives page refreshes. If storage is blocked, the current page keeps an in-memory bag and displays a warning on the bag page.
- “Enquire about my bag” transfers the current selection into the enquiry form.
- This is an order-enquiry flow. It does not charge a card, reserve stock or claim that an order is confirmed.

## Google map and exact location

The original website and proposal identify **Umhlanga, Durban**, but do not supply a street address. The map uses Google’s own resolution of:

`Umhlanga Rocks, Durban, KwaZulu-Natal, South Africa`

It shows the correct Umhlanga area and is labelled as an area view. No storefront address or latitude/longitude has been invented. The keyless Google map was visually checked, including the Umhlanga coastline, Umhlanga Ridge and lighthouse labels.

The supported **Google Maps Embed API** path is implemented in `js/maps.js`. To activate it:

1. Create a Google Cloud project and follow Google’s Maps Embed API setup instructions, including its account/billing prerequisites.
2. Enable **Maps Embed API**.
3. Create a browser API key. Restrict it to Maps Embed API and your approved website origins, including your development origin if needed.
4. Put that restricted key in `maps.apiKey` in `js/config.js`.
5. Add the verified street address in `business.streetAddress` and set `business.addressConfirmed` to `true` only after confirming it. Use the full address, including Umhlanga and South Africa.
6. Test the pin on the actual hosted site. Do not share an unrestricted key or put server/service-account credentials in browser code.

Without a key, the site uses the working keyless Google map. That fallback is not a claim that the keyed API has been authenticated. The map loads only after a visitor selects “Load interactive map”, supports Google’s pan/zoom/fullscreen controls, and can be unloaded. The direct Google Maps link remains available if an embed is blocked.

## Forms and email delivery

The forms have distinct purposes:

- **Enquiry:** order type, menu/bag selection, quantities, preferred date, occasion and custom requirements. It calculates menu totals or states that a custom quotation is needed. It does not invent stock availability.
- **Contact:** name, email, optional phone, message type and a full message.

Both forms include visible labels, required fields, immediate error feedback, consent, character counts and a review step. Invalid emails, short names/messages, malformed phone numbers, past/impossible dates, invalid quantities and empty-bag enquiries are rejected. Editing the details or changing the bag invalidates the old summary.

### Static hosting / Live Server

The forms validate and generate a useful summary that can be copied or downloaded. Set the bakery’s confirmed `business.email` in `js/config.js` to enable an **Open email draft** link with the correct recipient, subject and message. The visitor sends that draft from their email application. The application does not claim that opening a draft sends mail.

No contact email was provided in the source files. The value is intentionally empty instead of inventing a recipient. Until it is configured, the forms clearly say that the summary has not been sent.

### Optional AJAX email service

The included Node server implements:

| Endpoint | Result |
| --- | --- |
| `GET /api/health` | Reports whether email delivery is configured |
| `POST /api/contact` | Validates a general message and sends it through the configured email provider |
| `POST /api/enquiry` | Validates the request, recalculates the menu total from the catalogue and submits the email |

To enable it:

1. Copy `.env.example` to `.env`.
2. Set `RESEND_API_KEY` to a valid server-side sending key.
3. Set `MAIL_FROM` to a sender on a domain verified with the email provider.
4. Set `CONTACT_EMAIL` to the bakery’s confirmed inbox.
5. Run `npm start`. This loads `.env` and starts the server.

When the health check confirms configuration, the review step offers **Send to the bakery**. A successful provider response creates a reference and says the message was accepted for delivery. An unavailable service or failed request never produces a success message. Provider idempotency keys support safe retries. Successful provider acceptance is not proof that the recipient has read the email or that an order is confirmed.

The server applies the same field rules independently of the browser, limits request size and submission frequency, checks the request origin and serves only approved public assets. No visitor message is written to a local data file. `.env`, source-server files and the original student documents are not exposed by this server. For public use, provide HTTPS, verified business information and an appropriate production hosting/abuse-control setup.

## Accessibility and motion

Navigation has a mobile menu, active-page indicators and Escape handling. Dialogs use native modal behaviour, keyboard navigation and focus restoration. Forms have associated error messages. Images have descriptive alt text, and controls have usable labels. Animations respect the operating system’s reduced-motion setting and can be paused with the top-bar control.

## SEO and publishing

Every public page has a unique title and description, relevant keywords, one main heading, internal links and responsive styling. The homepage includes bakery structured data with the known area only. Local images have descriptive filenames and are compressed as WebP; fonts are served locally. The project includes `robots.txt` and `sitemap.xml`.

Canonical links and the sitemap use the GitHub Pages base URL named in the original proposal:

`https://zime-a11ly.github.io/WEDE5020_UmhlangaBakehouse/`

This is the intended target from the supplied documents, not evidence of a new deployment. If the real host changes, replace that base URL in all eight HTML files, `robots.txt` and `sitemap.xml` before publishing.

For a public static deployment, publish the root HTML files, `css/`, `js/`, `assets/`, `robots.txt` and `sitemap.xml`. `_headers` can be included on a host that supports that file. **Do not publish `docs/`, `tests/`, `.env`, or the student PDFs as website assets.** Keep these in the coursework/source archive as appropriate. Static hosts such as GitHub Pages do not run `server.mjs`; they use the summary/email-draft flow.

Use your existing repository to make genuine, descriptive commits as you review and submit the work. The archive does not fabricate Git history or claim a push/public deployment. Suggestions for real commits include “Organise bakery assets and shared styles”, “Add persistent bag and product search”, and “Add enquiry validation and map integration”.

## Verification

Run the included checks:

```sh
node --test tests/site.test.mjs
```

All **8 test groups passed** on 28 October 2026. Coverage includes authoritative price calculations, bad-input rejection, bag persistence/blocked storage, HTTP endpoint behaviour, protected file paths, origin checks, email-provider success/failure with a test double, retry keys, rate limits, unique page metadata, local links and image alt text. Test doubles do not send real email.

Browser review completed for:

- Desktop homepage, supplied logo and imagery.
- Search, no-results state, reset and ascending price sort.
- Adding items, changing/rejecting quantities, refresh persistence and cart-to-enquiry handoff.
- Required-field and invalid-email errors, valid summaries and summary invalidation after edits.
- The live keyless Google Umhlanga map.
- Lightbox next/previous, arrow keys, Escape and focus restoration.
- Mobile navigation and Escape.
- All eight pages in 320px, 390px, 768px and 1024px review frames, with no horizontal overflow.

For manual responsive review with the Node server, open `http://localhost:3000/tests/responsive.html`. That route is disabled when `NODE_ENV=production`.

Live email delivery, a keyed Google API request, a confirmed storefront pin, payment processing and a public deployment were not performed. These require the relevant confirmed details or credentials. See `docs/PART-3-CHECKLIST.md` for the rubric mapping.

## Changelog

### 28 October 2026 — Part 3

- Replaced the minimal homepage with a food-focused hero and substantial story, featured-bake and occasion sections while preserving the four original palette values.
- Installed the supplied logo in the top-right header, added restrained motion and a pause/reduced-motion option.
- Normalised page filenames to lowercase and moved images, fonts, styles and JavaScript into their respective folders.
- Preserved the three existing menu names and prices; corrected the image-to-product mismatch with illustrative menu images. Preserved the supplied cupcake, banana-loaf and strawberry-cake photos in the gallery.
- Added dynamic product search, filtering, sorting, detail dialogs and a persistent cart with correct totals and enquiry handoff.
- Restored `enquiry.html`, which Part 2 had removed, and gave it a different purpose from `contact.html`.
- Added client/server validation, downloadable summaries, configured-recipient email drafts and optional AJAX email delivery.
- Added the Google area map and configurable official Embed API route without inventing premises details.
- Added unique metadata, structured data, descriptive image names/alt text, local fonts, robots rules and a sitemap.
- Added meaningful automated checks, responsive review, rubric mapping and clear setup/deployment notes.

The supplied archive does not contain detailed lecturer marking feedback, so these changes address the user’s requested updates and the supplied Part 3 requirements. They are not presented as verbatim lecturer comments.

### Earlier Part 2 entries retained from the original README

- **11 April 2026:** Gallery page completed and images linked.
- **13 May 2026:** CSS folder case corrected; missing enquiry link removed; products link case corrected; SVG logo repaired. The original README reported Chrome navigation/image checks. These are historical source notes, separate from the Part 3 checks above.

More detailed changes are recorded in `CHANGELOG.md`.

## References and asset notes

- Supplied Part 2 website, README and proposal PDFs: original content, prices, colour palette, hours and student details.
- Supplied bakery logo: retained as an optimised WebP image and PNG favicon.
- Supplied cookie-site screenshot: visual inspiration for oversized type and layered food imagery.
- Three original bakery photographs: retained in the gallery; original photographer/licensing details were not supplied and should be confirmed before public commercial use.
- Three new illustrative bakery visuals: used for the hero and matching product cards. They do not certify actual product appearance or quantity per box.
- Local fonts: Inter and Playfair Display, with redistribution licences in `assets/fonts/`.
- [Google Maps Embed API guide](https://developers.google.com/maps/documentation/embed/embedding-map), accessed 28 October 2026.
- [Google Maps Embed API setup and restrictions](https://developers.google.com/maps/documentation/embed/get-api-key), accessed 28 October 2026.
- [Resend email API reference](https://resend.com/docs/api-reference/emails/send-email), accessed 28 October 2026.
