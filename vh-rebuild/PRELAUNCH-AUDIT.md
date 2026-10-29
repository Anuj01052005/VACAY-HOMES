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
- Vercel response headers define a same-origin content security policy, block framing and MIME sniffing, limit referrer data, and disable unused camera/microphone/geolocation access. CSS inline styles remain enabled for the animation library. Hosting enforcement must be checked after deployment.

## Publication approval
The user explicitly approved proceeding to publication using the completed audits without a paid Strix pentest. No Strix scan was run and no scan credits were spent.

## Pending launch gates
- Vercel deployment and live verification of pages, assets and security headers.

## Deployment settings
Root directory: vh-rebuild. Framework: Vite. Build: npm run build. Output: build. No website runtime API key is required.

- Production runtime verification: malformed UTF-8 URL fragment navigation completed with no page errors; the configured response headers were present. No failed page requests were observed in the confirming run.

## Observations
No browser favicon is configured; an explicit /favicon.ico request returns 404. This is a cosmetic omission, not a broken property image. It was reported and left unchanged.

The build contains older optimized clips alongside the current clips (~65 MB total). They are not all downloaded by each visitor. Removing unused copies is optional housekeeping and was not performed during the audit.

No audit can guarantee the absence of every security threat or future fault. No confirmed exploit has been found by the checks completed here; Strix results remain pending.
