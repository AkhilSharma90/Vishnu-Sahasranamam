# Vishnu Sahasranamam

A self-contained, celestial website for the **Sri Vishnu Sahasranamam** — the
thousand names of Lord Vishnu — made for daily prayer. It works offline, loses
nothing, and is yours to keep.

॥ Om Namo Bhagavate Vasudevaya ॥

---

## Running it

Just open `index.html` in a browser — no server or build step needed.
(For the local dev server: `python3 -m http.server 8777` then visit
`http://127.0.0.1:8777/`.)

## Editing the prayer text

**All the verses live in [`CONTENT.md`](CONTENT.md)** — that is the one place to
read and fix the text. After editing it, run:

```bash
node tools/build-content.js
```

This syncs your edits into `assets/js/data.js` (the file the website actually
loads). **Do not edit `data.js` by hand** — it is auto-generated and will be
overwritten.

**CONTENT.md format**

- Sections are marked `## invocation`, `## dhyanam`, `## shlokas`, `## closing`,
  plus a `## meta` block for the title and source.
- A **blank line** separates one verse from the next.
- Within a verse, the **first line** is the first half and the **second line**
  is the second half. A verse with only one line has no second half.
- In `## shlokas`, each verse is preceded by its number on its own line. These
  **renumber automatically** on sync, so you can freely split or merge verses.

## Project structure

```
index.html              the page
CONTENT.md              ← editable prayer text (source of truth)
tools/build-content.js  CONTENT.md  ->  assets/js/data.js
assets/
  css/style.css         celestial theme
  js/
    data.js             AUTO-GENERATED prayer data (do not edit)
    art.js              hand-drawn SVG emblems
    app.js              builds the page, daily-prayer features
    cosmic.js           the animated cosmic background (Three.js)
  img/                  bundled darshan images (public-domain / CC)
  vendor/               Three.js + bloom, vendored locally for offline use
```

## Art & images

The famous-form darshan images woven through the names are public-domain or
Creative-Commons works (Raja Ravi Varma and Wikimedia Commons), **downloaded and
bundled locally** so the site never depends on the network. Full attribution is
in the footer under *Image credits & licences*.

The cosmic background is rendered with [Three.js](https://threejs.org/) (vendored
locally). It is pure progressive enhancement — if WebGL is unavailable the site
falls back to a CSS starfield and remains fully readable.
