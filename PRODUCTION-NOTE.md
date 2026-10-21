# Production note

## Direction and source

Built for Vacay Homes using the supplied Vacay Homes Handover Kit and the user's follow-up decisions in this conversation. The source folder's `AGENTS.md.md` was read. The Sites skill informed the implementation and private hosting workflow; the PDF skill was used to read the handover kit.

Approved direction: forest green, warm ivory, generous type and a calm, cinematic journey from arriving to gathering to the city terrace. The user's later pool-area request is implemented as a dedicated section and image slot for Vacay 002.

The primary action is **Explore the stays**. Contact uses phone and email only, both initially blank. No WhatsApp links are present. No fake testimonials, awards, booking counts or customer logos were added. Proposed prices and launch offers were omitted. Food is described as arranged and paid for separately with a catering partner, consistent with the handover.

## Deliverables

- Complete website in `dist/`.
- Editable style tile at `dist/style-tile.html`, sharing live CSS tokens with the site.
- Content Studio at `dist/studio.html`: one logo and eight photo attachment areas, contact fields, scene copy, advanced JSON content, browser-local preview and ZIP export.
- Editable content at `dist/content.js`.
- Asset and pacing manifest at `dist/assets/manifest.json`.
- Local server and validation scripts; browser QA evidence in `qa/`.

## Asset provenance and assumptions

Official logo and property photographs are pending, as explicitly requested by the user. The temporary wordmark is HTML text. The generic favicon and decorative line illustrations are code-native SVG. They are clearly labelled placeholders and do not represent actual property architecture or facilities.

Higgsfield's video model catalog was successfully queried in this conversation. No image or video generation was submitted after the user requested empty attachment areas instead. Generation prompts, jobs, original clips, selected video frames and video posters are therefore not applicable. No credits were spent and no stock property imagery was substituted.

Typeface families: Manrope and DM Sans, loaded from Google Fonts with Arial/system fallbacks. The site remains usable if fonts fail to load.

The attachment editor preserves originals in its exported ZIP and creates browser-ready images no larger than 2,400 px. Its export manifest records actual dimensions, bytes and one frame per still image. Default source files contain no phone number or email address. Test data exists only in ignored local QA artifacts.

## Motion measurements

Four viewport heights of active scroll travel, independent of the visible stage. The sticky navigation uses 96 px desktop, 82 px tablet and 78 px mobile; the stage fills the remaining viewport. Native scrolling is retained.

| Beat | Active interval | Treatment |
| --- | --- | --- |
| Arrive | 0-110 vh | Hero still, gentle scale and readable HTML copy |
| Settle in | 110-145 vh | Crossfade and vertical composition transition |
| Gather | 145-255 vh | Food still and HTML copy |
| Change pace | 255-290 vh | Crossfade into the city-terrace composition |
| Stay your way | 290-400 vh | Terrace still and HTML copy, then ordinary page flow |

Progress is clamped. Scene navigation supports jumps. Reverse scrolling uses the same deterministic mapping. Inactive scenes use `inert` and `aria-hidden`, and cannot intercept clicks. Scroll work uses one requestAnimationFrame per update and listeners are removed on teardown.

No video-frame cache is required in this version. The eight still slots use standard image loading; the first story image is prioritized, remaining images are lazy loaded, and errors restore the inline placeholder. Object URLs and decoded upload bitmaps are released. No unbounded frame prefetch or missing-frame retry loops exist.

Reduced motion, data-saving mode, exposed device memory at or below 2 GB, and short viewports (700 px or less) use ordinary stacked story sections. There is no animation-dependent content or action. JavaScript-disabled visitors receive a short textual overview.

## Verification

Production validation passed: all site JavaScript parsed, content and manifest structure matched, all local HTML references existed, no WhatsApp routing was present.

Browser checks passed in installed Chrome at desktop 1440 x 1000 and mobile 390 x 844: forward/reverse/fast-jump scrolling; 400 vh travel; inactive-scene focus exclusion; property modal and Escape; FAQ expansion; mobile menu and overflow; reduced-motion fallback; the dedicated pool slot; all nine attachment inputs; image upload; browser-local draft preview; activated phone/email links; ZIP export; isolation of drafts from default site content; no JavaScript page errors.

The exported ZIP passed Python's archive integrity check and retained the test image at its actual 800 x 500 dimensions. Browser test data was cleared afterward. Desktop, mobile, pool and style-tile screenshots were visually inspected. A mobile reduced-motion overflow issue found during testing was fixed and the suite rerun successfully.

## Limits and remaining inputs

The current cinematic effect uses photo-frame composition and crossfades. It does not claim to contain real property footage. Photo crop, lighting and visual continuity must be reviewed again after the official images arrive. No public audience was requested; hosting stays private. No booking system, payments, form delivery or live availability is connected.

Content Studio is an editing aid with browser-local persistence, not a multi-user CMS. A content-pack export must be applied and the website redeployed to update the hosted site. No credentials or temporary signed URLs are included in the reusable source or exported content packs.
