#!/usr/bin/env node
/* =========================================================
   build-content.js — sync the editable prayer text into the site.

   Reads  CONTENT.md   (the human-editable source of truth)
   Writes assets/js/data.js   (what index.html actually loads)

   Run after editing CONTENT.md:
       node tools/build-content.js

   Format of CONTENT.md:
     ## meta            -> "key: value" lines (title, source)
     ## invocation      -> verses
     ## dhyanam         -> verses
     ## shlokas         -> verses, auto-numbered
     ## closing         -> verses
   A blank line separates verses. Within a verse the first line is the
   first half ("a") and the second line the second half ("b"); a verse with
   only one line has an empty "b". In shlokas, a bare number line (e.g. "12.")
   is just a label and is ignored — verses renumber automatically.
   ========================================================= */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const SRC = path.join(root, "CONTENT.md");
const OUT = path.join(root, "assets", "js", "data.js");

const text = fs.readFileSync(SRC, "utf8");
const lines = text.split(/\r?\n/);

// split into "## section" buckets
const sections = {};
let cur = null;
for (let raw of lines) {
  const line = raw.replace(/\s+$/, "");
  const h = line.match(/^##\s+(.+?)\s*$/);
  if (h) { cur = h[1].toLowerCase(); sections[cur] = []; continue; }
  if (line.startsWith("#")) continue;           // the H1 title / stray headers
  if (cur) sections[cur].push(line);
}

// meta: "key: value"
const meta = {};
(sections.meta || []).forEach((l) => {
  const m = l.match(/^([a-zA-Z_]+):\s*(.*)$/);
  if (m) meta[m[1].trim()] = m[2].trim();
});

// parse a verse section into [{a,b}] (drops blank lines + bare number labels)
function parseVerses(name) {
  const arr = sections[name] || [];
  const verses = [];
  let block = [];
  const flush = () => {
    const ls = block
      .map((s) => s.trim())
      .filter((s) => s.length && !/^\[?\d+[.)\]]?$/.test(s)); // drop "12." / "[12]" labels
    if (ls.length) verses.push({ a: ls[0], b: ls[1] || "" });
    block = [];
  };
  for (const l of arr) {
    if (l.trim() === "") flush();
    else block.push(l);
  }
  flush();
  return verses;
}

const data = {
  title: meta.title || "Sri Vishnu Sahasranamam",
  source: meta.source || "",
  invocation: parseVerses("invocation"),
  dhyanam: parseVerses("dhyanam"),
  shlokas: parseVerses("shlokas").map((v, i) => ({ n: i + 1, a: v.a, b: v.b })),
  closing: parseVerses("closing"),
};

const banner =
  "/* AUTO-GENERATED from CONTENT.md by tools/build-content.js — do not edit by hand.\n" +
  "   Edit CONTENT.md and re-run `node tools/build-content.js` instead. */\n";
fs.writeFileSync(OUT, banner + "window.VISHNU_DATA = " + JSON.stringify(data, null, 1) + ";\n");

console.log(
  `synced CONTENT.md -> assets/js/data.js  |  invocation ${data.invocation.length}` +
  `, dhyanam ${data.dhyanam.length}, shlokas ${data.shlokas.length}, closing ${data.closing.length}`
);
