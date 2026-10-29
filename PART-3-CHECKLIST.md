# Part 3 rubric traceability

Prepared against the supplied Part 3 instructions and rubric screenshots. This is a record of implementation and remaining evidence, not a mark prediction.

| Requirement | Implementation / evidence | Status and boundary |
| --- | --- | --- |
| Respond to Part 2 feedback | README changelog, detailed CHANGELOG, responsive redesign and repaired missing enquiry flow | User feedback implemented; detailed lecturer marking notes were not supplied |
| Interactive elements | Mobile menu, product dialogs, FAQ accordions, motion controls and cart actions | Implemented and reviewed |
| Interactive map | `js/maps.js`, contact-page map controls and direct Google link | Keyless Umhlanga area map visually verified; official keyed Embed API route requires a restricted key |
| Location accuracy | Google-resolved Umhlanga Rocks, Durban, KwaZulu-Natal, South Africa query | Correct area; exact premises deliberately unclaimed until confirmed |
| Gallery lightbox | `js/gallery.js`, native modal, next/previous buttons, arrow keys and Escape | Implemented; keyboard navigation and focus return checked |
| Dynamic content | One product catalogue dynamically rendered by `js/shop.js` | Implemented |
| Search, filtering and sorting | Search field, category buttons, price/name sort and reset/empty state | Browser-checked |
| Cart functionality | `js/cart.js`, persistent quantities, correct totals, removal and enquiry handoff | Automated and browser-checked; no card processing |
| Title tags | Unique titles on all eight public pages | Automated check passed |
| Meta keywords | Relevant page keywords including the bakery and area | Present; included to meet the supplied rubric |
| Meta descriptions | Unique descriptions on all eight public pages | Automated check passed |
| Image names and alt text | Descriptive filenames, WebP assets and image descriptions | Checked |
| Headings and links | One H1 per page; semantic sections; shared navigation and contextual links | Local links and H1 counts checked |
| Mobile friendliness | Responsive CSS and `tests/responsive.html` | Eight pages checked in 320/390/768/1024px frames; no horizontal overflow |
| Enquiry controls | `enquiry.html`: name, email, phone, request type, product/quantity, date, occasion, details, consent | Implemented |
| Enquiry validation | `js/validation.js` and `js/forms.js`; reused independently by server | Invalid dates, quantities, empty bags and required fields rejected |
| Enquiry processing / response | Bag or menu estimate; custom quote requirement; availability stated as needing confirmation | Implemented; does not fabricate a stock or booking confirmation |
| Contact controls | `contact.html`: contact details, message topic and complete message | Implemented |
| Contact validation | Inline errors, live checks, length/format validation and consent | Browser and automated checks passed |
| Contact email | Configurable addressed `mailto:` draft; optional AJAX email service | Code implemented; confirmed inbox and provider credentials are still required. Live email was not sent |
| Explicit form action | `api/contact` and `api/enquiry`, POST methods | Present; Node service implements the actions |
| AJAX submission | Fetch, health capability, timeouts, duplicate-click prevention and provider retry keys | Automated with provider test double; real provider remains unverified |
| Robots and sitemap | Root `robots.txt` and `sitemap.xml` | Included; base URL comes from the supplied proposal |
| Page speed | Local fonts, optimised images, lazy offscreen images, deferred scripts and click-to-load map | Implemented; no numerical Lighthouse score claimed |
| Basic security | Text rendering for user input, server validation, payload limits, origin/rate checks and private-path protection | Covered by relevant tests; not a claim of a security audit |
| Local SEO | Area text and bakery structured data with known locality | Implemented; real Business Profile/address verification requires the owner |
| Off-page SEO / social promotion | No invented profiles, reviews or backlinks | Owner action after confirming the live site |
| Multiple descriptive commits | README gives sensible commit scopes | Requires the student’s real repository work; no fake Git history |
| Comprehensive README | Setup, architecture, behaviour, configuration, tests, limitations and references | Included |
| Development changelog | README Changelog plus detailed CHANGELOG | Included; earlier source entries retained |
| Deployment and references | Deployment guide, original submission PDFs and primary API references | Public deployment and live URL verification remain to be done |

## Final submission steps

1. Read the project and understand how the JavaScript works; adapt any business content that needs confirmation.
2. Set the real bakery email and location. Authenticate the Google API if the assessment requires a keyed request demonstration.
3. Decide whether to demonstrate the static email-draft flow or configure the optional AJAX email server. A static GitHub Pages host cannot run the Node server.
4. Re-run the tests and manually review the forms, menu, gallery and cart after configuration changes.
5. Add genuine descriptive commits to the existing repository, publish only public website files, and record the final deployment URL.
6. Provide any additional lecturer feedback, repository evidence or required screenshots from the actual submission process.
