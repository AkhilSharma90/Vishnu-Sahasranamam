/* =========================================================
   ART — hand-crafted celestial SVG illustrations.
   Pure vector + gold gradients. Scales forever, never breaks,
   works fully offline. Each returns an SVG string.
   ========================================================= */
(function (global) {

  // Shared <defs>: gold gradients + soft glow, injected once per SVG.
  const DEFS = (id) => `
   <defs>
    <radialGradient id="gold-${id}" cx="42%" cy="38%" r="75%">
      <stop offset="0%" stop-color="#fff3cf"/>
      <stop offset="38%" stop-color="#f0cd76"/>
      <stop offset="72%" stop-color="#d4a64a"/>
      <stop offset="100%" stop-color="#9c6f25"/>
    </radialGradient>
    <linearGradient id="goldline-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffe9a8"/>
      <stop offset="50%" stop-color="#d4a64a"/>
      <stop offset="100%" stop-color="#8a5e1f"/>
    </linearGradient>
    <radialGradient id="blue-${id}" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#4a82c8"/>
      <stop offset="55%" stop-color="#234a86"/>
      <stop offset="100%" stop-color="#0d1d44"/>
    </radialGradient>
    <radialGradient id="halo-${id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffe9a8" stop-opacity=".7"/>
      <stop offset="40%" stop-color="#e8be63" stop-opacity=".25"/>
      <stop offset="100%" stop-color="#e8be63" stop-opacity="0"/>
    </radialGradient>
    <filter id="glow-${id}" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="3.2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
   </defs>`;

  // small helper: ring of N petals/teeth around centre
  function radial(n, cx, cy, fn) {
    let s = "";
    for (let i = 0; i < n; i++) s += fn((i * 360) / n, i);
    return s;
  }

  const ART = {};

  /* ---------- Sudarshana Chakra ---------- */
  ART.chakra = function () {
    const id = "ck";
    const cx = 200, cy = 200;
    // outer flame tongues
    const flames = radial(24, cx, cy, (a) =>
      `<path transform="rotate(${a} ${cx} ${cy})"
         d="M${cx} 18 q7 16 0 34 q-7 -18 0 -34 Z"
         fill="url(#goldline-${id})" opacity=".9"/>`);
    // serrated disc teeth
    const teeth = radial(36, cx, cy, (a) =>
      `<path transform="rotate(${a} ${cx} ${cy})"
         d="M${cx} 52 l6 12 l-12 0 Z" fill="url(#gold-${id})"/>`);
    // spokes
    const spokes = radial(12, cx, cy, (a) =>
      `<line transform="rotate(${a} ${cx} ${cy})"
         x1="${cx}" y1="92" x2="${cx}" y2="150"
         stroke="url(#goldline-${id})" stroke-width="3" stroke-linecap="round"/>`);
    // filigree dots
    const dots = radial(24, cx, cy, (a) =>
      `<circle transform="rotate(${a} ${cx} ${cy})" cx="${cx}" cy="78" r="2.4" fill="#ffe9a8"/>`);
    return `<svg viewBox="0 0 400 400" role="img" aria-label="Sudarshana Chakra">
      ${DEFS(id)}
      <circle cx="${cx}" cy="${cy}" r="190" fill="url(#halo-${id})"/>
      <g filter="url(#glow-${id})" class="spin-slow" style="transform-box:fill-box">
        ${flames}
        <circle cx="${cx}" cy="${cy}" r="150" fill="none" stroke="url(#goldline-${id})" stroke-width="3"/>
        ${teeth}
        <circle cx="${cx}" cy="${cy}" r="118" fill="none" stroke="var(--gold)" stroke-width="1.5" opacity=".7"/>
        ${dots}
      </g>
      <g class="spin-rev" style="transform-box:fill-box">
        ${spokes}
        <circle cx="${cx}" cy="${cy}" r="90" fill="none" stroke="url(#goldline-${id})" stroke-width="2"/>
      </g>
      <circle cx="${cx}" cy="${cy}" r="44" fill="url(#blue-${id})" stroke="url(#goldline-${id})" stroke-width="3"/>
      <circle cx="${cx}" cy="${cy}" r="44" fill="url(#halo-${id})"/>
      <text x="${cx}" y="${cy + 16}" text-anchor="middle"
        font-family="'Cormorant Garamond',serif" font-size="46" fill="#ffe9a8"
        filter="url(#glow-${id})">ॐ</text>
    </svg>`;
  };

  /* ---------- Panchajanya — the conch ---------- */
  ART.shankha = function () {
    const id = "sk";
    return `<svg viewBox="0 0 400 400" role="img" aria-label="Panchajanya, the divine conch">
      ${DEFS(id)}
      <ellipse cx="200" cy="210" rx="150" ry="150" fill="url(#halo-${id})"/>
      <g filter="url(#glow-${id})">
        <path d="M120 300
          C70 300 70 230 110 210
          C140 195 150 240 185 235
          C150 200 150 130 200 96
          C262 54 320 92 322 168
          C324 232 280 300 196 322
          C170 329 140 320 120 300 Z"
          fill="url(#gold-${id})" stroke="url(#goldline-${id})" stroke-width="3"/>
        <path d="M200 110 C160 150 165 205 205 240 C175 205 178 158 215 124 Z"
          fill="#fff6da" opacity=".55"/>
        <path d="M250 120 C300 130 305 200 270 260 C260 280 235 296 210 304"
          fill="none" stroke="#fff6da" stroke-width="2" opacity=".5"/>
        <path d="M130 270 C120 250 132 228 150 226"
          fill="none" stroke="#9c6f25" stroke-width="2" opacity=".6"/>
        <circle cx="206" cy="240" r="4" fill="#fff6da"/>
      </g>
    </svg>`;
  };

  /* ---------- Padma — the lotus ---------- */
  ART.lotus = function () {
    const id = "lt";
    const petal = (a, scale, fill) =>
      `<path transform="rotate(${a} 200 220) scale(${scale})" transform-origin="200 220"
        d="M200 220 C176 180 176 120 200 78 C224 120 224 180 200 220 Z"
        fill="${fill}" stroke="url(#goldline-${id})" stroke-width="1.5"/>`;
    let back = "", front = "";
    [0, 40, 80, -40, -80, 120, -120, 160, -160].forEach((a) => {
      back += petal(a, 1, "url(#blue-" + id + ")");
    });
    [0, 36, 72, -36, -72, 108, -108].forEach((a) => {
      front += petal(a, 0.74, "url(#gold-" + id + ")");
    });
    return `<svg viewBox="0 0 400 360" role="img" aria-label="Padma, the lotus">
      ${DEFS(id)}
      <ellipse cx="200" cy="200" rx="170" ry="150" fill="url(#halo-${id})"/>
      <g filter="url(#glow-${id})">
        ${back}${front}
        <circle cx="200" cy="208" r="20" fill="url(#gold-${id})" stroke="url(#goldline-${id})" stroke-width="2"/>
        ${radial(8, 200, 208, (a) => `<circle transform="rotate(${a} 200 208)" cx="200" cy="194" r="2.6" fill="#7a5418"/>`)}
      </g>
    </svg>`;
  };

  /* ---------- Kaumodaki — the mace (gada) & lotus, paired emblem ---------- */
  ART.gada = function () {
    const id = "gd";
    return `<svg viewBox="0 0 400 400" role="img" aria-label="Kaumodaki, the mace">
      ${DEFS(id)}
      <ellipse cx="200" cy="200" rx="120" ry="170" fill="url(#halo-${id})"/>
      <g filter="url(#glow-${id})" transform="rotate(18 200 200)">
        <rect x="190" y="150" width="20" height="180" rx="9" fill="url(#goldline-${id})"/>
        ${radial(12, 200, 120, (a) => `<ellipse transform="rotate(${a} 200 120)" cx="200" cy="78" rx="13" ry="22" fill="url(#gold-${id})" stroke="url(#goldline-${id})" stroke-width="1.5"/>`)}
        <circle cx="200" cy="120" r="50" fill="url(#gold-${id})" stroke="url(#goldline-${id})" stroke-width="3"/>
        <circle cx="200" cy="120" r="30" fill="none" stroke="#7a5418" stroke-width="2" opacity=".6"/>
        <circle cx="200" cy="120" r="14" fill="url(#blue-${id})"/>
        <ellipse cx="200" cy="338" rx="20" ry="10" fill="url(#gold-${id})"/>
      </g>
    </svg>`;
  };

  /* ---------- Garuda — the divine eagle, vahana ---------- */
  ART.garuda = function () {
    const id = "gr";
    const feathers = (sx, dir) => {
      let s = "";
      for (let i = 0; i < 7; i++) {
        const len = 120 - i * 9, off = i * 22;
        s += `<path d="M${sx} 200
          q ${dir * (40 + off)} ${-30 - i * 6} ${dir * (len)} ${-10 - i * 4}
          q ${-dir * (len - 30)} ${24} ${-dir * (40 + off)} ${30}"
          fill="url(#gold-${id})" stroke="url(#goldline-${id})" stroke-width="1.2" opacity="${0.95 - i * 0.06}"/>`;
      }
      return s;
    };
    return `<svg viewBox="0 0 400 360" role="img" aria-label="Garuda, the divine eagle">
      ${DEFS(id)}
      <ellipse cx="200" cy="190" rx="190" ry="120" fill="url(#halo-${id})"/>
      <g filter="url(#glow-${id})">
        ${feathers(170, -1)}${feathers(230, 1)}
        <path d="M200 120 C188 120 182 132 184 146 C176 150 174 168 184 176
          L184 250 C184 280 196 300 200 312 C204 300 216 280 216 250
          L216 176 C226 168 224 150 216 146 C218 132 212 120 200 120 Z"
          fill="url(#blue-${id})" stroke="url(#goldline-${id})" stroke-width="2.5"/>
        <path d="M200 120 q-10 -16 0 -30 q10 14 0 30 Z" fill="url(#gold-${id})"/>
        <path d="M190 150 q10 8 20 0" fill="none" stroke="#ffe9a8" stroke-width="2"/>
        <circle cx="193" cy="140" r="2.4" fill="#ffe9a8"/><circle cx="207" cy="140" r="2.4" fill="#ffe9a8"/>
        ${radial(5, 200, 312, (a) => a > 200 || a < 160 ? `<path transform="rotate(${a} 200 300)" d="M200 300 q-6 30 0 54 q6 -24 0 -54Z" fill="url(#gold-${id})" opacity=".85"/>` : "")}
      </g>
    </svg>`;
  };

  /* ---------- Vishnupada — the lotus feet ---------- */
  ART.feet = function () {
    const id = "ft";
    const foot = (x, flip) => `
      <g transform="translate(${x} 0) ${flip ? "scale(-1,1) translate(-400,0)" : ""}">
        <path d="M170 250 C150 250 142 224 150 196 C158 168 172 120 196 112
          C214 106 224 124 222 150 C220 186 214 224 206 244 C200 258 184 250 170 250 Z"
          fill="url(#gold-${id})" stroke="url(#goldline-${id})" stroke-width="2.5"/>
        <circle cx="200" cy="98" r="10" fill="url(#gold-${id})" stroke="url(#goldline-${id})" stroke-width="2"/>
        <circle cx="186" cy="104" r="7" fill="url(#gold-${id})" stroke="url(#goldline-${id})" stroke-width="1.5"/>
        <circle cx="174" cy="114" r="6" fill="url(#gold-${id})" stroke="url(#goldline-${id})" stroke-width="1.5"/>
        <circle cx="164" cy="126" r="5" fill="url(#gold-${id})" stroke="url(#goldline-${id})" stroke-width="1.5"/>
        <circle cx="180" cy="180" r="13" fill="none" stroke="#7a5418" stroke-width="2"/>
        <path d="M180 167 l3 9 9 0 -7 6 3 9 -8 -5 -8 5 3 -9 -7 -6 9 0 Z" fill="url(#goldline-${id})"/>
        <path d="M168 220 q14 10 28 0" fill="none" stroke="#7a5418" stroke-width="1.8" opacity=".6"/>
      </g>`;
    return `<svg viewBox="0 0 460 300" role="img" aria-label="The lotus feet of Vishnu">
      ${DEFS(id)}
      <ellipse cx="230" cy="180" rx="220" ry="120" fill="url(#halo-${id})"/>
      <g filter="url(#glow-${id})">${foot(0, false)}${foot(60, true)}</g>
    </svg>`;
  };

  /* ---------- Surya / radiant aura with Om ---------- */
  ART.sun = function () {
    const id = "sn";
    const rays = radial(32, 200, 200, (a, i) =>
      `<path transform="rotate(${a} 200 200)"
        d="M200 ${i % 2 ? 40 : 60} l5 ${i % 2 ? 60 : 40} l-10 0 Z"
        fill="url(#goldline-${id})" opacity="${i % 2 ? 1 : 0.7}"/>`);
    return `<svg viewBox="0 0 400 400" role="img" aria-label="The radiant Lord">
      ${DEFS(id)}
      <circle cx="200" cy="200" r="195" fill="url(#halo-${id})"/>
      <g filter="url(#glow-${id})" class="spin-slow" style="transform-box:fill-box">${rays}</g>
      <circle cx="200" cy="200" r="74" fill="url(#gold-${id})" stroke="url(#goldline-${id})" stroke-width="3"/>
      <circle cx="200" cy="200" r="74" fill="url(#halo-${id})"/>
      <text x="200" y="224" text-anchor="middle" font-family="'Cormorant Garamond',serif"
        font-size="78" fill="#5a3d12">ॐ</text>
    </svg>`;
  };

  /* ---------- Ananta-shayana — the grand reclining panel ---------- */
  ART.reclining = function () {
    const id = "rc";
    // coils of Shesha
    const coils = `
      <path d="M40 300 Q120 250 200 285 T360 280 T520 300 Q600 312 660 296"
        fill="none" stroke="url(#goldline-${id})" stroke-width="22" stroke-linecap="round" opacity=".9"/>
      <path d="M40 320 Q120 272 200 305 T360 300 T520 320 Q600 332 660 316"
        fill="none" stroke="url(#blue-${id})" stroke-width="14" stroke-linecap="round" opacity=".8"/>`;
    // serpent hoods over the lord
    const hoods = radial(7, 360, 150, (a) => Math.abs(a - 180) < 92 ? "" :
      `<path transform="rotate(${(a) - 180} 360 168)"
        d="M360 168 q-13 -46 0 -74 q13 28 0 74 Z"
        fill="url(#gold-${id})" stroke="url(#goldline-${id})" stroke-width="1.5"/>`);
    // gentle ocean waves
    let waves = "";
    for (let r = 0; r < 3; r++) {
      waves += `<path d="M0 ${360 + r * 16} q40 -14 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0"
        fill="none" stroke="#234a86" stroke-width="2" opacity="${0.5 - r * 0.12}"/>`;
    }
    return `<svg viewBox="0 0 720 420" role="img" aria-label="Vishnu reclining on Ananta-Shesha upon the cosmic ocean">
      ${DEFS(id)}
      <ellipse cx="360" cy="230" rx="350" ry="180" fill="url(#halo-${id})"/>
      ${waves}
      ${coils}
      <g filter="url(#glow-${id})">
        <!-- hoods -->
        <g>${hoods}<ellipse cx="360" cy="150" rx="58" ry="40" fill="url(#blue-${id})" stroke="url(#goldline-${id})" stroke-width="2"/></g>
        <!-- reclining body -->
        <path d="M150 270 C220 250 300 252 360 250 C440 248 520 252 560 244
          C540 230 470 234 360 234 C260 234 200 232 150 246 Z"
          fill="url(#blue-${id})" stroke="url(#goldline-${id})" stroke-width="2.5"/>
        <!-- chest / torso -->
        <ellipse cx="300" cy="244" rx="92" ry="34" fill="url(#blue-${id})" stroke="url(#goldline-${id})" stroke-width="2"/>
        <!-- head resting near hoods -->
        <circle cx="372" cy="214" r="26" fill="url(#gold-${id})" stroke="url(#goldline-${id})" stroke-width="2"/>
        <path d="M372 190 q-6 -14 0 -22 q6 8 0 22Z" fill="url(#gold-${id})"/>
        <!-- crown line -->
        <path d="M352 200 q20 -10 40 0" fill="none" stroke="#ffe9a8" stroke-width="2"/>
        <!-- Srivatsa mark + kaustubha on chest -->
        <circle cx="300" cy="244" r="6" fill="#ffe9a8"/>
        <!-- navel lotus rising -->
        <path d="M250 244 q-4 -40 0 -70" fill="none" stroke="url(#goldline-${id})" stroke-width="3"/>
        <g transform="translate(250 150) scale(.5)" transform-origin="0 0">
          ${radial(7, 0, 0, (a) => `<path transform="rotate(${a} 0 0)" d="M0 0 C-22 -34 -22 -82 0 -116 C22 -82 22 -34 0 0Z" fill="url(#gold-${id})" stroke="url(#goldline-${id})" stroke-width="2"/>`)}
          <circle r="14" fill="url(#blue-${id})" stroke="url(#goldline-${id})" stroke-width="2"/>
        </g>
        <!-- four-arm hint with attributes -->
        <circle cx="430" cy="250" r="9" fill="none" stroke="url(#goldline-${id})" stroke-width="2"/>
        <circle cx="200" cy="252" r="7" fill="url(#gold-${id})"/>
      </g>
    </svg>`;
  };

  /* ---------- small Om seal for footer ---------- */
  ART.seal = function () {
    const id = "sl";
    return `<svg viewBox="0 0 160 160" role="img" aria-label="Om">
      ${DEFS(id)}
      <circle cx="80" cy="80" r="72" fill="url(#halo-${id})"/>
      <circle cx="80" cy="80" r="60" fill="none" stroke="url(#goldline-${id})" stroke-width="2"/>
      ${radial(36, 80, 80, (a) => `<circle transform="rotate(${a} 80 80)" cx="80" cy="20" r="1.6" fill="var(--gold)"/>`)}
      <text x="80" y="104" text-anchor="middle" font-family="'Cormorant Garamond',serif"
        font-size="64" fill="#ffe9a8" filter="url(#glow-${id})">ॐ</text>
    </svg>`;
  };

  global.ART = ART;
})(window);
