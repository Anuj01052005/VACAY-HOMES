# Pre-publication audit — 29 October 2026

Scope: vh-rebuild, repository Anuj01052005/VACAY-HOMES, branch prototype/vh002-residence-local.

## Verified
- Production build and TypeScript passed again after the two approved hardening changes.
- npm audit: zero known vulnerabilities across the locked dependency tree.
- Source and build credential-pattern scan: no matching credentials. Active-site Git-history pattern scan: no matches. This is a heuristic check, not proof that a credential can never exist.
- Production browser checks: Home, Properties, Farm and Dining at 390, 768 and 1440 pixels. No observed page errors, HTTP errors, broken loaded images or horizontal overflow.
- Automated axe WCAG A/AA checks in reduced-motion mode: no violations in the checked states. Manual screenshots inspected for Dining desktop and mobile footer. Automated checks do not establish full WCAG compliance.
- Inquiry and Rules dialogs open and close; Day 2 can be selected.

- Normal-motion carousel advance, selected desktop/mobile tour source, buffered playback and Close Tour passed at 390 and 1440 pixels with the approved CSP enabled.

## Approved changes
- Malformed URL fragment decoding now falls back safely rather than throwing URIError.
- Vercel response headers define a same-origin content security policy, block framing and MIME sniffing, limit referrer data, and disable unused camera/microphone/geolocation access. CSS inline styles remain enabled for the animation library. Hosting enforcement was checked successfully on the live Cloudflare deployment.

## Publication approval
The user explicitly approved proceeding to publication using the completed audits without a paid Strix pentest. No Strix scan was run and no scan credits were spent.

## Live deployment — verified
- Permanent public URL: https://vacay-homes.pages.dev/
- Checked deployment: https://8a689de2.vacay-homes.pages.dev/
- Both URLs return HTTP 200 in a fresh unauthenticated browser and serve the same application bundle.
- Live Home, Properties, Farm and Dining passed checks at 390, 768 and 1440 pixels: no observed page errors, failed page requests, broken loaded images, overflow or axe violations in the checked reduced-motion states.
- Normal-motion carousel advance, tour playback with correct mobile/desktop video, and Close Tour passed at 390 and 1440 pixels.
- Live CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy and Permissions-Policy headers were verified.
- Cloudflare rejects the default Python HTTP client with error 1010; normal unauthenticated browser access succeeded. No protection was weakened.

## Deployment settings
Selected host: Cloudflare Pages (user-approved free hosting alternative). Root directory: vh-rebuild. Framework: Vite. Build: npm run build. Output: build. No website runtime API key is required. The same approved security headers are provided in public/_headers.

- Production runtime verification: malformed UTF-8 URL fragment navigation completed with no page errors; the configured response headers were present. No failed page requests were observed in the confirming run.

## Observations
No browser favicon is configured; an explicit /favicon.ico request returns 404. This is a cosmetic omission, not a broken property image. It was reported and left unchanged.

The build contains older optimized clips alongside the current clips (~65 MB total). They are not all downloaded by each visitor. Removing unused copies is optional housekeeping and was not performed during the audit.

No audit can guarantee the absence of every security threat or future fault. No confirmed exploit was found by the completed checks. The optional paid Strix scan was explicitly waived by the user; no Strix pentest result is claimed.

## Navigation and playback regression fixes — 30 October 2026

- Reproduced the live tour readiness deadlocks, lost footer Back position, covered Terrace heading and overlapping call tooltip at 390 and 1440 pixels.
- A persistent Lenis instance now owns desktop scrolling. Route changes stop outgoing momentum, mount at the top behind a dark fade, refresh measurements, then restore the destination. Browser history saves a separate scroll position per entry; Back also works when requested during a transition.
- Removed whole-page transform/filter transitions, which created an unnecessary compositing context around sticky content. Footer light, letter movement and Dining parallax remain unchanged.
- Video reveals after a decoded frame and successful playback, without requiring canplaythrough or a callback from an invisible video. Failed playback has a retry and close path.
- SVG brush masks start hidden in markup and paint with forward scrolling; previous marks stay painted on reverse scrolling. Footer call tooltip is removed; accessible link labels remain.
- Normal-motion regression suite: 18 checks passed across 390 and 1440 pixels. Footer scroll samples on Home, Dining and Farm showed no backward jumps, changing document height or horizontal overflow.
- Production preview: 8 confirming checks passed, including mobile/desktop tour playback, first-click footer links, browser and navigation Back restoration, and Dining brush entry. TypeScript and Vite production build passed.
- These are browser-emulated device checks, not a claim of testing every physical phone or guaranteeing a particular frame rate.
