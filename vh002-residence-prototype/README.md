# VACAY Homes 002 — Residence prototype

Option B, extended into a cinematic property tour. This folder is self-contained and separate from the existing website in `../dist/`.

## Preview

Requires Node.js 20 or newer. No installation or build step is needed.

```powershell
cd "C:\Users\Admin\Downloads\Gpt. Work\vacay-homes\vh002-residence-prototype"
npm start
```

Open **http://127.0.0.1:4176/**. If preview is already running, open the address directly. On another checkout, enter this folder before running `npm start`. To use another port: `$env:PORT='4177'; npm start`.

Use the mouse wheel or trackpad to see the framed aerial film expand, the entrance appear, and the pool scene reveal. Chapter buttons also move between scenes. The interior and evening sections return to normal page flow. No website deployment has been configured.

## Weekly content changes

Edit `content.js` and refresh the browser:

- `whatsappNumber`: empty by request. When supplied, use the country code and number as digits. A valid value automatically enables every inquiry link. The prototype does not send anything itself.
- `whatsappMessage`: the inquiry text passed to WhatsApp.
- The text fields and `scenes`: property wording, room descriptions, tour captions and closing copy.
- `images`: delivery paths and accessible descriptions. Provide the smaller mobile and larger desktop files together.
- `videos`: short mobile and desktop clips.
- `seasonal.enabled` and `seasonal.message`: hidden by default. Enable only confirmed messaging; there is no published Diwali offer.

Without a number, inquiry buttons open an honest availability message. There are no prices, booking forms, payment flows, invented capacity figures or unverified offers.

## Motion and media

- Desktop: local GSAP/ScrollTrigger controls the framed-to-fullscreen opening and three tour beats. Native scrolling remains the input; there is no scroll hijacking library or mandatory snap.
- Aerial and pool excerpts play once, hold their final frame and offer replay. The evening clip loops with a pause control. Offscreen and hidden-tab playback pauses.
- Mobile: scenes stack vertically. Video plays only after tapping **Play film**, using the 720px rendition. An inquiry button remains accessible at the bottom of the screen.
- Reduced motion: no pinned tour, autoplay or video downloads. The full property story remains available as photographs. OS preference changes are handled live. **Less motion** also offers an optional in-page alternative.
- If JavaScript or the animation library is unavailable, the page remains a readable photo tour.

Only silent, optimized excerpts are included. The 107 MB original drone file is not included. `ASSET-MANIFEST.json` records the source intervals and files. The aerial approach reverses an authentic pull-away shot; no footage was synthesized. The entrance is the approved AI morning-light edit of the real night photograph, identified in the scene and manifest. The unedited entrance is retained separately in `source-reference/` and is not served by the preview server.

## Verification

```powershell
npm run check
npm test
```

Browser checks require Playwright and Chrome. The QA runner uses the bundled runtime on this workstation; elsewhere install Playwright (`npm install --no-save playwright`) and its Chromium browser (`npx playwright install chromium`). Set `CHROME_PATH` to use a different Chrome executable. Use `PREVIEW_URL` if the preview is on another port. The server must already be running. Tests never send a WhatsApp message.

The checks cover desktop forward/reverse tour transitions, chapter controls, pause/replay, room viewers, blank and configured inquiry states, mobile navigation and video selection, 360px/390px phone layouts, landscape and tablet layouts, reduced motion, live preference changes, no-JavaScript content, byte-range media delivery and missing assets. Screenshots and detailed results are written to ignored `qa/`.

`tools/prepare_assets.py` documents the local media conversion. Rebuilding requires the original source asset folders, Pillow and ffmpeg; normal preview does not. It preserves the approved morning edit rather than regenerating it.

See `DESIGN.md` for direction and motion details, and `vendor/THIRD-PARTY.md` for font and library notices.
