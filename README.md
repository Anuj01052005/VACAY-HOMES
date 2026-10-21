# Vacay Homes

A complete, editable website with a three-scene native scroll story, two property sections, a dedicated pool area, dining, gathering ideas, FAQs and direct-contact spaces.

## Open the website

Run `npm start` from this folder, then open `http://127.0.0.1:4173`.

No package installation is required. Node.js 18 or newer is sufficient.

- Website: `/index.html`
- Visual editor: `/studio.html`
- Editable style tile: `/style-tile.html`

The `dist` folder is also a ready-to-serve static website. The main page works when opened as a file, but use the local server for reliable browser storage and editing.

## Add your logo, photographs and contact details

1. Open Content Studio.
2. Enter a phone number and email, or leave either field empty. Empty fields show "coming soon" and are not clickable.
3. Choose or drop images into the nine attachment areas: one official logo and eight photo spaces, including the pool.
4. Add accurate image descriptions for accessibility.
5. Choose **Save & preview**. Drafts are stored only in this browser and this website origin. They are not uploaded or published.
6. Choose **Download content pack**. Unzip it and copy `content.js` and `assets/` into `dist/`, replacing the old content file. Keep the `originals` folder for your records. Refresh the website.

For the privately hosted website, send the exported pack in this conversation so it can be applied to the project and redeployed. Local drafts do not sync between devices or between the local and hosted sites. Export before clearing browser storage.

Accepted uploads: JPG, PNG and WebP, up to 15 MB per file. Web copies are limited to 2,400 pixels on the longest edge. The original supplied image is preserved in the exported pack. Transparent PNG is recommended for the logo. The current wordmark is a temporary HTML placeholder, not an official logo master.

## Edit directly

- `dist/content.js`: all story copy, property descriptions, features, FAQs, image references and contact details.
- `dist/styles.css`: shared colour, spacing and typography tokens, plus website layout.
- `dist/studio.css`: editor and style-tile layout.
- `dist/app.js`: native scrolling and interactions.
- `dist/assets/manifest.json`: asset status and scroll timings.

Example contact fields:

```js
contact: {
  phone: '+91 YOUR NUMBER', // replace with a real 7-15 digit phone number
  email: 'your-real-address@example.com',
  heading: 'Your next get-together starts here.',
  note: 'For stays, gatherings and a little time away, get in touch directly.'
}
```

Example photo entry:

```js
pool: {
  src: 'assets/pool.jpg',
  alt: 'Describe the actual pool photograph here',
  label: 'The pool area',
  hint: 'Poolside afternoons at Vacay 002.',
  ratio: 'Landscape · 16:9',
  tone: 'water',
  kind: 'pool'
}
```

Place the corresponding file in `dist/assets/`. Prefer a wide view with the main subject near the centre; the story photo is cropped into an arch on desktop and mobile. Preview both sizes before applying a new photograph.

## Checks

`npm run build` or `npm run check` validates JavaScript syntax, local file references, content structure and the media manifest. The production output is `dist`; there is no compilation step.

`qa.cjs` records the browser interaction suite used in this environment. Its Playwright and Chrome paths are specific to this computer; update them before running elsewhere. `qa/results.json` and screenshots retain the local evidence. Test-upload images and test contact details were never written into the website's default content.

## Scope

There is no WhatsApp routing, reservation form, payment flow or invented availability. Phone and email links activate when valid details are supplied. The site currently uses clearly labelled photo frames, with scroll-driven composition changes, instead of generated video. No generation credits were spent.

Do not add internal financial, operational, proposed-pricing or unapproved launch details from the handover kit to the public copy. Confirm changing property information before a public launch.
