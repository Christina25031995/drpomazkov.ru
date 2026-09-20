# Pomazkov site — production build

Plain static HTML/CSS/JS (no framework, no build step, no CDN runtime
dependency). Drop this `production/` folder on any static host
(Vercel/Netlify/nginx/S3+CDN/etc.) as the site root.

## Files
- `index.html` — the whole one-page site (desktop long-scroll +
  mobile app-shell views, both in the same document).
- `styles.css` — all styles, ported 1:1 from the approved design.
- `app.js` — hero video, Block 02 scrollytelling, before/after
  slider, explains accordion, mobile journey pager, cookie consent,
  and the mobile router (view switching + hash back/forward).
- `booking.js` — the shared date → time → topic → Telegram booking
  flow used by both the desktop panel and the mobile sheet.
- `availability.js` — **edit this to set real bookable dates/times.**
- `ap5-figure.js` — the Block 05 particle animation (unchanged).
- `legal/privacy.html`, `legal/cookie-policy.html` — standalone
  legal pages, linked from the footer and the mobile Contacts tab.
- `robots.txt`, `sitemap.xml`.

## Current staging state

This build is **not launched**. It is deliberately locked down until
you say otherwise:
- Every page has `<meta name="robots" content="noindex, nofollow">`.
- `robots.txt` disallows all crawling.
- The base URL everywhere is the placeholder
  `https://SET-DOMAIN-BEFORE-LAUNCH.invalid` — an intentionally
  non-resolvable address (nobody can typo their way into it), never a
  guessed real domain.

## Before launch — things that need real input from you

1. **Domain.** The base URL lives in exactly one place to edit,
   `site.config.json` — but don't hand-edit it. Once a real domain is
   bought, run:
   ```
   scripts/set-domain.sh pomazkov.ru
   ```
   That updates `site.config.json`, `index.html` (canonical, Open
   Graph, Twitter card, JSON-LD), `sitemap.xml` and `robots.txt` in
   one step, and leaves the site `noindex` until you're actually ready
   to go live. When you are, re-run with `--go-live` to flip
   `robots.txt`/meta robots to allow indexing:
   ```
   scripts/set-domain.sh pomazkov.ru --go-live
   ```
2. **Availability.** `availability.js` currently generates fake demo
   dates/slots (clearly marked `DEMO / PLACEHOLDER DATA` at the top of
   the file, plus a `window.POMAZKOV_AVAILABILITY_IS_DEMO` flag) so the
   booking flow has something to click through. Replace
   `POMAZKOV_AVAILABILITY` with Filipp's real schedule — it's a plain
   `{ "YYYY-MM-DD": ["HH:MM", ...] }` object, safe for a non-developer
   to edit directly. Nothing else needs to change.
3. **Prices** (Блок 08). No numbers were invented. Every row currently
   reads "по консультации" (matches the wording already used in the
   mobile price tab) instead of a bare "от ₽". When real figures are
   confirmed, swap that text for the actual price in `index.html`
   (`.pr-value` spans) and `renderPriceTab` in `app.js`.
4. **Before/after photos** (Блок 03 «Результат», Блок 04 «Кейсы»).
   No real patient photos were found anywhere in the project (only AI
   concept art, which was correctly not used as medical results) —
   these sections show a neutral "photo will be added" placeholder,
   not an editor/upload widget. Replace the placeholder `<div>`s with
   real `<img>` tags once photos are cleared for publication; the
   layout doesn't need to change.
5. **"Филипп объясняет" video** (Блок 09). The preview panel is
   currently a clean, empty dark panel (no placeholder video/text was
   invented) — swap in a real `<video>`/embed once that content exists.
6. **Analytics.** The cookie banner is fully wired (necessary vs.
   analytics consent, stored in `localStorage['pmz-cookie']`), but no
   tracker is installed and none will be added without an explicit
   counter ID. To add Yandex Metrica (or similar) later, define
   `window.pomazkovLoadAnalytics = function(){ /* snippet */ }` before
   `app.js` loads — it only fires after explicit consent.
7. Double-check the clinic/contact facts baked into the page (name,
   address, license number, Telegram/Instagram handles) are still
   current — they were carried over verbatim from the approved copy.

## What changed structurally vs. the old prototype
- Dropped the `dc-runtime`/`support.js`/`image-slot.js` authoring
  tool entirely — that stack loads React from `unpkg.com` at runtime,
  fetches every section over HTTP by filename, and `eval`s each
  block's script. Fine for prototyping inside the design tool, not
  something to ship. Everything is now plain markup/CSS/JS.
- Removed all editor-only artifacts: `data-screen-label` attributes,
  the empty `<image-slot>` upload widgets, the unused hero
  variant-exploration file, and 7 unused reference/mood-board images.
- The old mobile "router" worked by one file (`Мобильная запись.dc.html`)
  reaching into every other file's CSS via `body[data-mview]`
  selectors. That coupling is now centralized in `app.js`'s single
  router, with real `#/results` `#/works` `#/approach` `#/booking`
  hash routes and working Back/Forward.
- The booking flow's dead "step 4" contact-form code (disabled on
  both desktop and mobile, unreachable either way) was deleted rather
  than ported — the site never collected name/phone, which already
  matches what `legal/privacy.html` says. Both surfaces now share one
  `booking.js` state machine instead of duplicating the logic.
