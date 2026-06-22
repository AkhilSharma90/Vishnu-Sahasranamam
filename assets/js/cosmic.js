/* =========================================================
   cosmic.js — the living cosmos.

   A bloom-lit golden galaxy turning around a glowing Sudarshana
   Chakra, with rising embers, shooting stars and a twinkling
   parallax starfield. The background never dies: as you scroll
   into the prayer the hero recedes but the stars, nebulae and
   embers keep drifting behind the verses.

   Pure progressive enhancement: if THREE / WebGL is unavailable
   the CSS starfield remains and nothing breaks. Bloom is optional —
   if the post-processing passes are missing we render directly.
   ========================================================= */
(function () {
  const canvas = document.getElementById("cosmos");
  if (!canvas || typeof THREE === "undefined") return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    if (!renderer.getContext()) return;
  } catch (e) { return; }

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = innerWidth < 700;
  document.body.classList.add("has-3d");

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05030d, 0.0058);
  const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 700);
  camera.position.set(0, 7, 80);

  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0x000000, 0);

  /* ---------- soft sprite textures ---------- */
  function disc(stops, w = 64, h = 64, draw) {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const g = c.getContext("2d");
    if (draw) draw(g, c);
    else {
      const grd = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      stops.forEach(([o, col]) => grd.addColorStop(o, col));
      g.fillStyle = grd; g.beginPath(); g.arc(w / 2, h / 2, w / 2, 0, 7); g.fill();
    }
    const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
  }
  const softDisc = disc([[0, "rgba(255,255,255,1)"], [0.25, "rgba(255,255,255,.85)"], [0.55, "rgba(255,255,255,.25)"], [1, "rgba(255,255,255,0)"]]);
  const haloTex = disc([[0, "rgba(255,233,168,.95)"], [0.3, "rgba(232,190,99,.45)"], [1, "rgba(232,190,99,0)"]]);
  const blueHalo = disc([[0, "rgba(120,170,255,.55)"], [0.4, "rgba(60,110,210,.22)"], [1, "rgba(40,80,180,0)"]]);
  const violetHalo = disc([[0, "rgba(170,130,255,.5)"], [0.4, "rgba(110,80,200,.2)"], [1, "rgba(80,50,160,0)"]]);
  // horizontal streak for shooting stars
  const streakTex = disc(null, 128, 16, (g) => {
    const grd = g.createLinearGradient(0, 8, 128, 8);
    grd.addColorStop(0, "rgba(255,255,255,0)");
    grd.addColorStop(0.7, "rgba(255,245,210,.85)");
    grd.addColorStop(1, "rgba(255,255,255,1)");
    g.fillStyle = grd; g.fillRect(0, 5, 128, 6);
  });

  /* ---------- spiral galaxy ---------- */
  const galaxy = new THREE.Group(); scene.add(galaxy);
  const COUNT = mobile ? 7000 : 15000;
  const RADIUS = 48, BRANCHES = 5, SPIN = 1.25, RAND = 0.4, RANDPOW = 2.7;
  let galaxyMat;
  (function buildGalaxy() {
    const pos = new Float32Array(COUNT * 3), col = new Float32Array(COUNT * 3);
    const inside = new THREE.Color(0xffe6a6), mid = new THREE.Color(0xe8a23c), outside = new THREE.Color(0x2f63b0);
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      const r = Math.pow(Math.random(), 1.4) * RADIUS;
      const branch = ((i % BRANCHES) / BRANCHES) * Math.PI * 2;
      const spin = r * SPIN * 0.06;
      const rx = Math.pow(Math.random(), RANDPOW) * (Math.random() < 0.5 ? 1 : -1) * RAND * (r + 2);
      const ry = Math.pow(Math.random(), RANDPOW) * (Math.random() < 0.5 ? 1 : -1) * RAND * 1.6;
      const rz = Math.pow(Math.random(), RANDPOW) * (Math.random() < 0.5 ? 1 : -1) * RAND * (r + 2);
      pos[i3] = Math.cos(branch + spin) * r + rx;
      pos[i3 + 1] = ry;
      pos[i3 + 2] = Math.sin(branch + spin) * r + rz;
      const c = inside.clone();
      if (r / RADIUS < 0.5) c.lerp(mid, (r / RADIUS) / 0.5);
      else c.copy(mid).lerp(outside, (r / RADIUS - 0.5) / 0.5);
      col[i3] = c.r; col[i3 + 1] = c.g; col[i3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    galaxyMat = new THREE.PointsMaterial({
      size: 0.72, sizeAttenuation: true, map: softDisc, alphaTest: 0.01,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true, opacity: 1.0,
    });
    galaxy.add(new THREE.Points(geo, galaxyMat));
  })();
  galaxy.rotation.x = -1.02; galaxy.rotation.z = 0.18; galaxy.position.y = -11.5;

  // galactic core + coloured nebulae
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.85, depthWrite: false }));
  core.scale.setScalar(18); core.position.set(0, -11.5, 0); scene.add(core);
  const nebs = [
    sprite(blueHalo, 130, [-34, -6, -42], 0.6),
    sprite(haloTex, 160, [36, 6, -64], 0.26),
    sprite(violetHalo, 150, [10, 28, -54], 0.34),
  ];
  function sprite(tex, scale, p, op) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, opacity: op, depthWrite: false }));
    s.scale.setScalar(scale); s.position.set(p[0], p[1], p[2]); scene.add(s); return s;
  }

  /* ---------- twinkling parallax starfield ---------- */
  function starLayer(count, spread, size, color, opacity) {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.8;
      pos[i * 3 + 2] = -30 - Math.random() * spread * 0.6;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ size, map: softDisc, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity, sizeAttenuation: true });
    const pts = new THREE.Points(geo, mat); scene.add(pts); return pts;
  }
  const starsFar = starLayer(mobile ? 900 : 1900, 360, 0.85, 0xbcd0ff, 0.7);
  const starsNear = starLayer(mobile ? 350 : 650, 260, 1.5, 0xfff0c8, 0.9);

  /* ---------- Sudarshana Chakra ---------- */
  const chakra = new THREE.Group();
  const matGold = new THREE.MeshBasicMaterial({ color: 0xe8be63, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending });
  const matBright = new THREE.MeshBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending });
  const R = 6.4;
  const ringA = new THREE.Group(), ringB = new THREE.Group();   // counter-rotating
  ringA.add(new THREE.Mesh(new THREE.TorusGeometry(R, 0.2, 16, 160), matGold));
  ringA.add(new THREE.Mesh(new THREE.TorusGeometry(R * 1.2, 0.06, 10, 180), matBright));
  ringB.add(new THREE.Mesh(new THREE.TorusGeometry(R * 0.52, 0.11, 12, 120), matGold));
  ringB.add(new THREE.Mesh(new THREE.TorusGeometry(R * 0.34, 0.05, 10, 100), matBright));
  for (let i = 0; i < 16; i++) {                                // fine spokes
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, R * 0.92, 6), matGold);
    const a = (i / 16) * Math.PI * 2;
    s.position.set(Math.cos(a) * R * 0.27, Math.sin(a) * R * 0.27, 0); s.rotation.z = a + Math.PI / 2;
    ringB.add(s);
  }
  for (let i = 0; i < 32; i++) {                                // flaming teeth
    const t = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.7, 5), matBright);
    const a = (i / 32) * Math.PI * 2;
    t.position.set(Math.cos(a) * R * 1.2, Math.sin(a) * R * 1.2, 0); t.rotation.z = a - Math.PI / 2;
    ringA.add(t);
  }
  // ring of orbiting bead-lights
  const beadMat = new THREE.MeshBasicMaterial({ color: 0xfff3cf, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
  for (let i = 0; i < 24; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), beadMat);
    const a = (i / 24) * Math.PI * 2;
    b.position.set(Math.cos(a) * R * 0.78, Math.sin(a) * R * 0.78, 0);
    ringA.add(b);
  }
  chakra.add(ringA, ringB);
  // Om hub
  const omTex = disc(null, 256, 256, (g) => {
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, "rgba(255,243,207,1)"); grd.addColorStop(0.5, "rgba(232,190,99,.5)"); grd.addColorStop(1, "rgba(232,190,99,0)");
    g.fillStyle = grd; g.beginPath(); g.arc(128, 128, 128, 0, 7); g.fill();
    g.fillStyle = "#fff7e0"; g.font = "bold 150px 'Cormorant Garamond', Georgia, serif";
    g.textAlign = "center"; g.textBaseline = "middle"; g.shadowColor = "rgba(255,233,168,.9)"; g.shadowBlur = 26;
    g.fillText("ॐ", 128, 142);
  });
  const om = new THREE.Sprite(new THREE.SpriteMaterial({ map: omTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  om.scale.setScalar(R * 1.05); chakra.add(om);
  const chakraGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.8, depthWrite: false }));
  chakraGlow.scale.setScalar(R * 4); chakra.add(chakraGlow);
  chakra.position.set(0, -8.5, 16); scene.add(chakra);

  /* ---------- rising embers ---------- */
  const EMBERS = mobile ? 90 : 170;
  const eGeo = new THREE.BufferGeometry();
  const ePos = new Float32Array(EMBERS * 3), ePhase = new Float32Array(EMBERS);
  for (let i = 0; i < EMBERS; i++) {
    ePos[i * 3] = (Math.random() - 0.5) * 100;
    ePos[i * 3 + 1] = (Math.random() - 0.5) * 80;
    ePos[i * 3 + 2] = -10 + Math.random() * 46;
    ePhase[i] = Math.random() * 7;
  }
  eGeo.setAttribute("position", new THREE.BufferAttribute(ePos, 3));
  const embers = new THREE.Points(eGeo, new THREE.PointsMaterial({ size: 1.4, map: softDisc, color: 0xffd97d, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9, sizeAttenuation: true }));
  scene.add(embers);

  /* ---------- shooting stars ---------- */
  const meteors = [];
  for (let i = 0; i < 4; i++) {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: streakTex, transparent: true, blending: THREE.AdditiveBlending, opacity: 0, depthWrite: false }));
    m.center.set(1, 0.5);
    scene.add(m);
    meteors.push({ s: m, t: -Math.random() * 8, dur: 0, dir: new THREE.Vector3(), pos: new THREE.Vector3() });
  }
  function launchMeteor(m) {
    m.pos.set((Math.random() - 0.5) * 90, 20 + Math.random() * 28, -10 - Math.random() * 30);
    m.dir.set(-0.6 - Math.random() * 0.5, -0.5 - Math.random() * 0.4, 0).normalize();
    m.dur = 0.9 + Math.random() * 0.7; m.t = 0;
    const ang = Math.atan2(m.dir.y, m.dir.x);
    m.s.material.rotation = ang;
    m.s.scale.set(14 + Math.random() * 10, 0.9, 1);
  }

  /* ---------- bloom post-processing (optional) ---------- */
  let composer = null, bloom = null;
  if (!reduce && THREE.EffectComposer && THREE.RenderPass && THREE.UnrealBloomPass) {
    try {
      composer = new THREE.EffectComposer(renderer);
      composer.addPass(new THREE.RenderPass(scene, camera));
      bloom = new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.9, 0.75, 0.12);
      composer.addPass(bloom);
      composer.setSize(innerWidth, innerHeight);
    } catch (e) { composer = null; }
  }

  /* ---------- interaction ---------- */
  let tx = 0, ty = 0, mx = 0, my = 0, scrollY = 0;
  addEventListener("mousemove", (e) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; }, { passive: true });
  addEventListener("deviceorientation", (e) => {
    if (e.gamma != null) { tx = Math.max(-0.5, Math.min(0.5, e.gamma / 45)); ty = Math.max(-0.5, Math.min(0.5, (e.beta - 45) / 45)); }
  }, { passive: true });
  addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });

  /* ---------- animation ---------- */
  let t0 = 0;
  function frame(t) {
    requestAnimationFrame(frame);
    const dt = Math.min(50, (t - t0) || 16); t0 = t;
    const k = reduce ? 0 : 1;
    const time = t * 0.001;
    const sp = Math.min(1, scrollY / (innerHeight * 0.92));   // hero fade 0..1
    const deep = scrollY / innerHeight;                       // continuous depth

    // camera — parallax + a slow dolly into the field as you scroll
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
    camera.position.x = mx * 16;
    camera.position.y = 7 - my * 9 - Math.min(deep, 4) * 1.5;
    camera.position.z = 80 - Math.min(deep, 5) * 5;
    camera.lookAt(0, 0 - Math.min(deep, 4) * 1.2, 8);

    // galaxy keeps turning; dims but never vanishes
    galaxy.rotation.y += 0.00018 * dt * k;
    galaxyMat.opacity = 1.0 - sp * 0.55;
    core.material.opacity = (0.85 - sp * 0.55) * (0.9 + Math.sin(time * 0.8) * 0.1);
    starsFar.rotation.y += 0.00004 * dt * k;
    starsNear.rotation.y -= 0.00007 * dt * k;
    starsNear.material.opacity = 0.75 + Math.sin(time * 3.0) * 0.15;
    nebs.forEach((n, i) => { n.position.x += Math.sin(time * 0.1 + i) * 0.01 * k; });

    // chakra — counter-rotating rings, bob, pulse; fades after the hero
    const cf = Math.max(0, 1 - sp * 1.15);
    chakra.position.y = -8.5 + Math.sin(time * 0.6) * 0.5 * k;
    ringA.rotation.z += 0.0011 * dt * k;
    ringB.rotation.z -= 0.0018 * dt * k;
    const pulse = 0.85 + Math.sin(time * 1.5) * 0.12;
    matGold.opacity = 0.95 * cf; matBright.opacity = 0.75 * cf; beadMat.opacity = 0.9 * cf;
    chakraGlow.material.opacity = 0.7 * pulse * cf;
    chakraGlow.scale.setScalar(R * (3.8 + Math.sin(time * 1.5) * 0.25));
    om.material.opacity = (0.85 + Math.sin(time * 2.0) * 0.12) * cf;
    chakra.visible = cf > 0.01;

    // embers keep rising (life behind the verses)
    const p = embers.geometry.attributes.position;
    for (let i = 0; i < EMBERS; i++) {
      p.array[i * 3 + 1] += 0.02 * dt * k;
      p.array[i * 3] += Math.sin(time * 0.5 + ePhase[i]) * 0.004 * dt * k;
      if (p.array[i * 3 + 1] > 42) p.array[i * 3 + 1] = -42;
    }
    p.needsUpdate = true;
    embers.material.opacity = (0.7 + Math.sin(time * 2.2) * 0.2);

    // shooting stars
    meteors.forEach((m) => {
      m.t += dt * 0.001 * k;
      if (m.t < 0) { m.s.material.opacity = 0; return; }
      if (m.t > m.dur) { if (Math.random() < 0.012) launchMeteor(m); else { m.s.material.opacity = 0; m.t = -Math.random() * 6; } return; }
      const prog = m.t / m.dur;
      m.s.position.set(m.pos.x + m.dir.x * prog * 70, m.pos.y + m.dir.y * prog * 70, m.pos.z);
      m.s.material.opacity = Math.sin(prog * Math.PI) * 0.9;
    });

    // overall canvas presence — bright in hero, calm (not dead) while reading
    canvas.style.opacity = (0.62 + 0.38 * (1 - sp)).toFixed(3);

    // render — bloom in the hero, plain (cheaper) once scrolled past it
    if (composer && sp < 0.9) {
      bloom.strength = 0.9 * (1 - sp * 0.4);
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
  }
  requestAnimationFrame(frame);

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    if (composer) composer.setSize(innerWidth, innerHeight);
  }, { passive: true });
})();
