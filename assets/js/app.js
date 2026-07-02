/* =========================================================
   app.js — builds the liturgy, weaves in art, and powers
   the daily-prayer features (progress, resume, sizing).
   ========================================================= */
(function () {
  const D = window.VISHNU_DATA;
  const root = document.getElementById("liturgy");
  if (!D || !root) return;

  const esc = (s) => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");

  // ---- grand verse block (invocation / dhyanam / closing) ----
  function grandVerse(v, i) {
    const b = v.b ? `<em>${esc(v.b)} <span class="danda">॥</span></em>` : "";
    const a = `<em>${esc(v.a)} ${v.b ? '<span class="danda">।</span>' : '<span class="danda">॥</span>'}</em>`;
    return `<div class="verse-grand reveal d${(i % 3) + 1}">${a}${b}</div>`;
  }

  // ---- a dialogue verse, optionally introduced by its speaker ----
  function dialogueVerse(v, i) {
    const head = v.speaker
      ? `<div class="uvacha reveal">${esc(v.speaker)}</div>`
      : "";
    return head + grandVerse(v, i);
  }

  // ---- a single numbered shloka ----
  function shloka(s) {
    return `<div class="shloka reveal" data-n="${s.n}" id="shloka-${s.n}">
      <span class="num">${s.n}</span>
      <div class="line a">${esc(s.a)} <span class="danda">।</span></div>
      <div class="line b">${esc(s.b)} <span class="danda">॥</span></div>
    </div>`;
  }

  // ---- art interstitial ----
  function interstitial(art, caption, gloss, panel) {
    return `<div class="interstitial ${panel ? "panel" : ""} reveal">
      <div class="art-frame">${art()}</div>
      <div class="art-caption">${caption}</div>
      ${gloss ? `<div class="art-gloss">${gloss}</div>` : ""}
    </div>`;
  }

  function sectionHead(kicker, title, note) {
    return `<div class="section-head reveal">
      <div class="section-kicker">${kicker}</div>
      <h2 class="section-title">${title}</h2>
      <div class="ornament"><span></span><i>❉</i><span></span></div>
      ${note ? `<p class="section-note">${note}</p>` : ""}
    </div>`;
  }

  // ---- darshan panel: a framed devotional image of a form of the Lord ----
  function darshanPanel(g, i) {
    return `<figure class="darshan reveal ${g.wide ? "wide" : ""}" data-full="${g.src}" data-name="${esc(g.name)}">
      <div class="darshan-glow"></div>
      <div class="darshan-frame">
        <img src="${g.src}" alt="${esc(g.name)} — ${esc(g.place)}" loading="lazy" />
        <span class="corner tl"></span><span class="corner tr"></span>
        <span class="corner bl"></span><span class="corner br"></span>
        <span class="zoom-hint">⤢</span>
      </div>
      <figcaption>
        <div class="darshan-place">${esc(g.place)}</div>
        <div class="darshan-name">${esc(g.name)}</div>
        <p class="darshan-gloss">${esc(g.gloss)}</p>
      </figcaption>
    </figure>`;
  }

  // The Dhyanam visualization — the reclining Lord, as a real painted darshan.
  const DHYANAM_ART = {
    src: "assets/img/00-ananta-shayana.jpg", name: "Ananta-Shayana", place: "Kshira Sagara · the sea of milk", wide: true,
    gloss: "Vishnu reclines upon Shesha, the serpent of eternity, afloat on the cosmic ocean — Lakshmi at his feet, the worlds dreaming within him.",
    credit: "Sheshashayi Lakshmi-Narayana — M. V. Dhurandhar", lic: "Public domain", href: "https://commons.wikimedia.org/wiki/File:Sheshashayi_-_Laxminarayan_by_DHURANDHAR_MV.jpg",
  };

  // The woven gallery of darshans — famous forms of the Lord, in a rising arc:
  // the great temple murtis, then His mount and consort, then Narasimha, then
  // the cosmic Vishvarupa as the climax. Images are public-domain / CC, bundled.
  const GALLERY = [
    { src: "assets/img/01-venkateswara.jpg", name: "Venkateswara · Balaji", place: "Tirumala · Tirupati",
      gloss: "Lord of the Seven Hills, who in this Kali age stands adorned for the gaze of every seeker.",
      credit: "Lord Venkateswara Swamy", lic: "CC BY-SA 4.0", href: "https://commons.wikimedia.org/wiki/File:Lord_Venkateswara_Swamy.jpg" },
    { src: "assets/img/02-padmanabha.jpg", name: "Anantha Padmanabha", place: "Thiruvananthapuram", wide: true,
      gloss: "He who reclines on the serpent of eternity, the lotus of all creation rising from his navel.",
      credit: "Mattancherry Palace mural, 16–17th c. — Vishnu Anantashayana", lic: "CC BY-SA 4.0", href: "https://commons.wikimedia.org/wiki/File:Mattancherry_Palace-16-17th_Century_mural_paintings-Vishnu_Anantashayana-WUS09329.jpg" },
    { src: "assets/img/03-guruvayurappan.jpg", name: "Guruvayurappan", place: "Guruvayur · Kerala",
      gloss: "The boy-Lord of Guruvayur, four-armed with conch and discus, the Krishna of Bhuloka Vaikuntha.",
      credit: "Guruvayurappan, oil painting by Rajasekharan", lic: "CC BY-SA 4.0", href: "https://commons.wikimedia.org/wiki/File:GURUVAYURAPPAN_-_OIL_PAINTING_BY_RAJASEKHARAN.jpg" },
    { src: "assets/img/04-garuda.jpg", name: "Garudarudha", place: "borne upon the eagle", wide: true,
      gloss: "Vishnu with Sridevi and Bhudevi, riding Garuda — the Vedas themselves made wings.",
      credit: "Lord Garuda — Raja Ravi Varma", lic: "Public domain", href: "https://commons.wikimedia.org/wiki/File:Raja_Ravi_Varma,_Lord_Garuda.jpg" },
    { src: "assets/img/05-lakshminarayana.jpg", name: "Lakshmi-Narayana", place: "the Lord with Sri", wide: true,
      gloss: "Narayana enthroned with Lakshmi — fortune never apart from the one who is fortune's source.",
      credit: "Vishnu & Lakshmi — Ravi Varma Press oleograph", lic: "Public domain", href: "https://commons.wikimedia.org/wiki/File:Vishnu_Laxmi.jpg" },
    { src: "assets/img/06-narasimha-ugra.jpg", name: "Ugra Narasimha", place: "the man-lion · for Prahlada", wide: true,
      gloss: "Neither man nor beast, by day nor night — the fury that tears apart all that threatens the devotee.",
      credit: "Narasimha — Raja Ravi Varma", lic: "Public domain", href: "https://commons.wikimedia.org/wiki/File:Narasimha_by_Raja_Ravi_Varma.jpg" },
    { src: "assets/img/07-narasimha-classical.jpg", name: "Narasimha", place: "the many-armed protector", wide: true,
      gloss: "In a hundred arms he holds his weapons, rending the demon upon the threshold of dusk.",
      credit: "Narasimha, traditional oil painting", lic: "Public domain", href: "https://commons.wikimedia.org/wiki/File:Narasimha_oil_colour.jpg" },
    { src: "assets/img/08-vishvarupa.jpg", name: "Vishvarupa", place: "the Cosmic Form",
      gloss: "Within his body the worlds, the gods, the rivers and the stars — the All seen as a single form.",
      credit: "Vishnu Vishvarupa, the Cosmic Man", lic: "Public domain", href: "https://commons.wikimedia.org/wiki/File:Vishnu_Vishvarupa_cropped.jpg" },
    { src: "assets/img/09-vishvarupa-darshana.jpg", name: "Vishvarupa-Darshana", place: "shown to Arjuna · Gita XI", wide: true,
      gloss: "Faces beyond counting, arms beyond number, blazing like a thousand suns risen at once.",
      credit: "Vishvarupa, the Cosmic Form of Krishna — Brooklyn Museum", lic: "Public domain", href: "https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_Vishvarupa_The_Cosmic_Form_of_Krishna.jpg" },
  ];

  let html = "";

  /* ---------- INVOCATION ---------- */
  html += `<section class="section" id="invocation">`;
  html += sectionHead("Pranava · the opening", "Invocation",
    "Before the thousand names, the heart is stilled and bowed.");
  D.invocation.forEach((v, i) => (html += grandVerse(v, i)));
  html += `</section>`;

  /* ---------- PURVA-BHAGA · the dialogue ---------- */
  if (D.dialogue && D.dialogue.length) {
    html += `<section class="section" id="dialogue">`;
    html += sectionHead("Purva-bhaga · the asking", "Bhishma's Counsel",
      "Upon his bed of arrows, Bhishma answers Yudhishthira — and gives the thousand names that purify all.");
    D.dialogue.forEach((v, i) => (html += dialogueVerse(v, i)));
    html += `</section>`;
  }

  /* ---------- VINIYOGA · the ritual dedication ---------- */
  if (D.viniyoga) {
    html += `<section class="section" id="viniyoga">`;
    html += sectionHead("Viniyoga · the dedication",
      "The Seer, the Metre, the Seed",
      "By whom it was seen, in what metre, with what seed and power it is applied.");
    html += `<p class="viniyoga-prose reveal">${esc(D.viniyoga)}</p>`;
    html += `</section>`;
  }

  /* ---------- DHYANAM ---------- */
  html += `<section class="section" id="dhyanam">`;
  html += sectionHead("Dhyanam · the meditation", "He Who Reclines on the Endless",
    "We picture the Lord — dark as the rain-cloud, serene upon Ananta in the milky sea.");
  html += `</section>`;
  html += darshanPanel(DHYANAM_ART);
  html += `<section class="section">`;
  D.dhyanam.forEach((v, i) => (html += grandVerse(v, i)));
  html += `</section>`;

  /* ---------- THE THOUSAND NAMES ---------- */
  html += `<section class="section" id="names">`;
  html += sectionHead("Sahasranama · the thousand names", "The Thousand Names",
    `One hundred and six verses, each a garland of the names of the All-Pervading. ${D.shlokas.length} shlokas.`);
  html += `</section>`;

  // Distribute the darshan panels evenly through the names so a new form of
  // the Lord appears every ~11 shlokas — a fresh vision to rest the eyes upon.
  const total = D.shlokas.length;
  const stops = {};
  GALLERY.forEach((g, k) => {
    const at = Math.round((total * (k + 1)) / (GALLERY.length + 1));
    stops[at] = g;
  });
  html += `<section class="section names-flow">`;
  D.shlokas.forEach((s, idx) => {
    html += shloka(s);
    const g = stops[idx + 1];
    if (g && idx + 1 < total) {
      html += `</section>`;
      html += darshanPanel(g);
      html += `<section class="section names-flow">`;
    }
  });
  html += `</section>`;

  /* ---------- CLOSING ---------- */
  html += interstitial(ART.sun, "Phala", "What the recitation bestows — fearlessness, fortune, and the nearness of the Lord.");
  html += `<section class="section" id="closing">`;
  html += sectionHead("Uttara-bhaga · the sealing", "The Closing Praise",
    "The fruits of the recitation, the words of the sages, and every act surrendered to Narayana.");
  D.closing.forEach((v, i) => (html += dialogueVerse(v, i)));
  html += `</section>`;

  root.innerHTML = html;

  // footer seal
  const fa = document.getElementById("foot-art");
  if (fa) fa.innerHTML = ART.seal();

  // image credits (attribution for the CC / public-domain darshans)
  const cl = document.getElementById("credits-list");
  if (cl) {
    cl.innerHTML = [DHYANAM_ART, ...GALLERY].map((g) =>
      `<p><a href="${g.href}" target="_blank" rel="noopener">${esc(g.name)}</a>
        — ${esc(g.credit)} · <span class="lic">${esc(g.lic)}</span>, via Wikimedia Commons.</p>`
    ).join("") +
    `<p class="credits-note">All images are public-domain or Creative-Commons works, bundled locally so this shrine never depends on the network. CC BY-SA works are used under their share-alike terms.</p>`;
  }

  /* ---------- darshan lightbox ---------- */
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lb-img");
  const lbCap = document.getElementById("lb-cap");
  function openLB(src, name, place, gloss) {
    if (!lb) return;
    lbImg.src = src; lbImg.alt = name;
    lbCap.innerHTML = `<strong>${esc(name)}</strong><span>${esc(place || "")}</span><em>${esc(gloss || "")}</em>`;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => lb.classList.add("on"));
  }
  function closeLB() {
    if (!lb) return;
    lb.classList.remove("on");
    document.body.style.overflow = "";
    setTimeout(() => { lb.hidden = true; lbImg.src = ""; }, 280);
  }
  const ALL_ART = [DHYANAM_ART, ...GALLERY];
  document.querySelectorAll(".darshan").forEach((fig) => {
    const g = ALL_ART.find((x) => x.src === fig.getAttribute("data-full"));
    fig.querySelector(".darshan-frame").addEventListener("click", () =>
      openLB(fig.getAttribute("data-full"), g.name, g.place, g.gloss));
  });
  if (lb) {
    lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("lb-close")) closeLB(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lb.hidden) closeLB(); });
  }

  /* =========================================================
     Behaviours
     ========================================================= */

  // reveal-on-scroll
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // reading progress + current-shloka tracking
  const bar = document.getElementById("progress-bar");
  const shlokaEls = Array.from(document.querySelectorAll(".shloka"));
  let lastSaved = 0, ticking = false;
  function onScroll() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? h.scrollTop / max : 0;
    if (bar) bar.style.width = (p * 100).toFixed(2) + "%";

    // remember nearest shloka to the viewport centre for "resume"
    const mid = window.innerHeight * 0.42;
    let cur = null;
    for (const el of shlokaEls) {
      const r = el.getBoundingClientRect();
      if (r.top < mid && r.bottom > 0) cur = el;
    }
    if (cur) {
      const n = cur.getAttribute("data-n");
      if (n && +n !== lastSaved) {
        lastSaved = +n;
        try { localStorage.setItem("vsn-last", n); } catch (e) {}
      }
    }
    ticking = false;
  }
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // resume button
  const resumeBtn = document.getElementById("btn-resume");
  let saved = null;
  try { saved = localStorage.getItem("vsn-last"); } catch (e) {}
  if (resumeBtn && saved && +saved > 1) {
    resumeBtn.hidden = false;
    resumeBtn.textContent = "↻ Resume · shloka " + saved;
    resumeBtn.addEventListener("click", () => {
      const t = document.getElementById("shloka-" + saved);
      if (t) { t.scrollIntoView({ behavior: "smooth", block: "center" }); flash(t); }
    });
  }
  function flash(el) {
    el.classList.add("lit");
    setTimeout(() => el.classList.remove("lit"), 2600);
  }

  // reading-size cycle
  const SIZES = [1, 1.12, 1.26, 0.92];
  let si = 0;
  try { si = +(localStorage.getItem("vsn-size") || 0) % SIZES.length; } catch (e) {}
  function applySize() {
    document.documentElement.style.setProperty("--read-scale", SIZES[si]);
    try { localStorage.setItem("vsn-size", si); } catch (e) {}
  }
  applySize();
  const fontBtn = document.getElementById("btn-font");
  if (fontBtn) fontBtn.addEventListener("click", () => { si = (si + 1) % SIZES.length; applySize(); });

  // back to top
  const topBtn = document.getElementById("btn-top");
  if (topBtn) topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
})();
