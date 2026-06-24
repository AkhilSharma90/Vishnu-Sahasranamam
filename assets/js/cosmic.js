/* =========================================================
   cosmic.js — the hero cosmos.
   A rotating golden galaxy (the Kshira Sagara of stars) turning
   around a glowing Sudarshana Chakra, with rising embers and a
   twinkling parallax starfield. All soft, round, additive light.

   Pure progressive enhancement: if THREE / WebGL is unavailable
   the CSS starfield remains and nothing breaks.
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
  document.body.classList.add("has-3d");

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05030d, 0.0065);
  const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 600);
  camera.position.set(0, 7, 78);

  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);

  /* ---------- soft round sprite textures ---------- */
  function discTexture(stops) {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d");
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    stops.forEach(([o, col]) => grd.addColorStop(o, col));
    g.fillStyle = grd; g.beginPath(); g.arc(32, 32, 32, 0, 7); g.fill();
    const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
  }
  const softDisc = discTexture([[0, "rgba(255,255,255,1)"], [0.25, "rgba(255,255,255,.85)"], [0.55, "rgba(255,255,255,.25)"], [1, "rgba(255,255,255,0)"]]);
  const haloTex = discTexture([[0, "rgba(255,233,168,.9)"], [0.3, "rgba(232,190,99,.45)"], [1, "rgba(232,190,99,0)"]]);
  const blueHalo = discTexture([[0, "rgba(120,170,255,.5)"], [0.4, "rgba(60,110,210,.22)"], [1, "rgba(40,80,180,0)"]]);

  /* ---------- the galaxy ---------- */
  const galaxy = new THREE.Group();
  scene.add(galaxy);
  const COUNT = Math.min(14000, innerWidth < 700 ? 7000 : 14000);
  const RADIUS = 48, BRANCHES = 5, SPIN = 1.25, RAND = 0.4, RANDPOW = 2.7;
  (function buildGalaxy() {
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const inside = new THREE.Color(0xffe6a6);
    const mid = new THREE.Color(0xe8a23c);
    const outside = new THREE.Color(0x2f63b0);
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      const r = Math.pow(Math.random(), 1.4) * RADIUS;
      const branch = ((i % BRANCHES) / BRANCHES) * Math.PI * 2;
      const spin = r * SPIN * 0.06;
      const rx = Math.pow(Math.random(), RANDPOW) * (Math.random() < 0.5 ? 1 : -1) * RAND * (r + 2);
      const ry = Math.pow(Math.random(), RANDPOW) * (Math.random() < 0.5 ? 1 : -1) * RAND * 1.6;
      const rz = Math.pow(Math.random(), RANDPOW) * (Math.random() < 0.5 ? 1 : -1) * RAND * (r + 2);
      pos[i3]     = Math.cos(branch + spin) * r + rx;
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
    const mat = new THREE.PointsMaterial({
      size: 0.72, sizeAttenuation: true, map: softDisc, alphaTest: 0.01,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true, opacity: 1.0,
    });
    galaxy.add(new THREE.Points(geo, mat));
  })();
  galaxy.rotation.x = -1.02;   // tilt toward the viewer
  galaxy.rotation.z = 0.18;
  galaxy.position.y = -9;      // sink the disc into the lower third

  // luminous galactic core
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.9, depthWrite: false }));
  core.scale.setScalar(19); core.position.set(0, -9, 0); scene.add(core);
  // two coloured nebula clouds for depth
  const neb1 = new THREE.Sprite(new THREE.SpriteMaterial({ map: blueHalo, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.6, depthWrite: false }));
  neb1.scale.setScalar(120); neb1.position.set(-30, -6, -40); scene.add(neb1);
  const neb2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.28, depthWrite: false }));
  neb2.scale.setScalar(150); neb2.position.set(34, 4, -60); scene.add(neb2);

  /* ---------- twinkling parallax starfield ---------- */
  function starLayer(count, spread, size, color, opacity) {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.7;
      pos[i * 3 + 2] = -40 - Math.random() * spread * 0.5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ size, map: softDisc, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity, sizeAttenuation: true });
    const pts = new THREE.Points(geo, mat); scene.add(pts); return pts;
  }
  const starsFar = starLayer(1600, 320, 0.8, 0xbcd0ff, 0.65);
  const starsNear = starLayer(550, 240, 1.5, 0xfff0c8, 0.85);

  /* ---------- Sudarshana Chakra at the heart ---------- */
  const chakra = new THREE.Group();
  const gold = 0xe8be63, brightGold = 0xffe9a8;
  const matGold = new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending });
  const matBright = new THREE.MeshBasicMaterial({ color: brightGold, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending });
  const R = 6.2;
  chakra.add(new THREE.Mesh(new THREE.TorusGeometry(R, 0.22, 14, 140), matGold));
  chakra.add(new THREE.Mesh(new THREE.TorusGeometry(R * 1.22, 0.07, 10, 160), matBright));
  chakra.add(new THREE.Mesh(new THREE.TorusGeometry(R * 0.5, 0.12, 12, 120), matGold));
  // fine spokes
  for (let i = 0; i < 16; i++) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, R * 0.92, 6), matGold);
    const a = (i / 16) * Math.PI * 2;
    s.position.set(Math.cos(a) * R * 0.27, Math.sin(a) * R * 0.27, 0);
    s.rotation.z = a + Math.PI / 2;
    chakra.add(s);
  }
  // flaming teeth around the rim
  for (let i = 0; i < 32; i++) {
    const t = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.7, 5), matBright);
    const a = (i / 32) * Math.PI * 2;
    t.position.set(Math.cos(a) * R * 1.22, Math.sin(a) * R * 1.22, 0);
    t.rotation.z = a - Math.PI / 2;
    chakra.add(t);
  }
  // Om hub sprite
  const omTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const g = c.getContext("2d");
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, "rgba(255,243,207,1)"); grd.addColorStop(0.5, "rgba(232,190,99,.5)"); grd.addColorStop(1, "rgba(232,190,99,0)");
    g.fillStyle = grd; g.beginPath(); g.arc(128, 128, 128, 0, 7); g.fill();
    g.fillStyle = "#fff3cf"; g.font = "bold 150px 'Cormorant Garamond', Georgia, serif";
    g.textAlign = "center"; g.textBaseline = "middle";
    g.shadowColor = "rgba(255,233,168,.9)"; g.shadowBlur = 24;
    g.fillText("ॐ", 128, 140);
    const t = new THREE.CanvasTexture(c); return t;
  })();
  const om = new THREE.Sprite(new THREE.SpriteMaterial({ map: omTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  om.scale.setScalar(R * 1.1); chakra.add(om);
  // chakra aura
  const chakraGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.8, depthWrite: false }));
  chakraGlow.scale.setScalar(R * 4.2); chakra.add(chakraGlow);

  chakra.position.set(0, -6, 16);
  scene.add(chakra);

  /* ---------- rising golden embers ---------- */
  const EMBERS = 160;
  const eGeo = new THREE.BufferGeometry();
  const ePos = new Float32Array(EMBERS * 3);
  const ePhase = new Float32Array(EMBERS);
  for (let i = 0; i < EMBERS; i++) {
    ePos[i * 3] = (Math.random() - 0.5) * 90;
    ePos[i * 3 + 1] = (Math.random() - 0.5) * 70;
    ePos[i * 3 + 2] = -10 + Math.random() * 40;
    ePhase[i] = Math.random() * 7;
  }
  eGeo.setAttribute("position", new THREE.BufferAttribute(ePos, 3));
  const embers = new THREE.Points(eGeo, new THREE.PointsMaterial({
    size: 1.4, map: softDisc, color: 0xffd97d, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, opacity: 0.9, sizeAttenuation: true,
  }));
  scene.add(embers);

  /* ---------- interaction + animation ---------- */
  let tx = 0, ty = 0, mx = 0, my = 0, scrollY = 0;
  addEventListener("mousemove", (e) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; }, { passive: true });
  addEventListener("deviceorientation", (e) => {
    if (e.gamma != null) { tx = Math.max(-0.5, Math.min(0.5, e.gamma / 45)); ty = Math.max(-0.5, Math.min(0.5, (e.beta - 45) / 45)); }
  }, { passive: true });
  addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });

  let t0 = 0;
  function frame(t) {
    requestAnimationFrame(frame);
    const dt = Math.min(50, (t - t0) || 16); t0 = t;
    const k = reduce ? 0 : 1;
    const time = t * 0.001;

    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
    camera.position.x = mx * 16;
    camera.position.y = 7 - my * 9;
    camera.lookAt(0, 0, 8);

    galaxy.rotation.y += 0.00018 * dt * k;
    starsFar.rotation.y += 0.00004 * dt * k;
    starsNear.rotation.y -= 0.00007 * dt * k;

    // chakra slow spin + gentle bob + glow pulse
    chakra.rotation.z += 0.0010 * dt * k;
    chakra.position.y = -6 + Math.sin(time * 0.6) * 0.5 * k;
    const pulse = 0.85 + Math.sin(time * 1.5) * 0.12;
    chakraGlow.material.opacity = 0.7 * pulse;
    chakraGlow.scale.setScalar(R * (4.0 + Math.sin(time * 1.5) * 0.25));
    om.material.opacity = 0.85 + Math.sin(time * 2.0) * 0.12;
    core.material.opacity = 0.8 * (0.9 + Math.sin(time * 0.8) * 0.1);

    // twinkle: subtly modulate star sizes via opacity
    starsNear.material.opacity = 0.7 + Math.sin(time * 3.0) * 0.15;

    // embers drift up and twinkle
    const p = embers.geometry.attributes.position;
    for (let i = 0; i < EMBERS; i++) {
      p.array[i * 3 + 1] += 0.02 * dt * k;
      p.array[i * 3] += Math.sin(time * 0.5 + ePhase[i]) * 0.004 * dt * k;
      if (p.array[i * 3 + 1] > 40) p.array[i * 3 + 1] = -40;
    }
    p.needsUpdate = true;
    embers.material.opacity = 0.7 + Math.sin(time * 2.2) * 0.2;

    // fade the whole cosmos as the hero scrolls away
    const fade = Math.max(0, 1 - scrollY / (innerHeight * 0.92));
    canvas.style.opacity = (0.12 + 0.88 * fade).toFixed(3);
    chakra.visible = fade > 0.03;

    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  }, { passive: true });
})();
