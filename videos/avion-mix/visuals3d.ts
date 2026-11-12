// =====================================================================
//  "Cómo funciona un avión" in 3D (Idio-two): each scene assembles the world of world3d.ts.
//  w.K('key') = when that word is said. Everything is posed from t (absolute seconds).
// =====================================================================
// the camera: a short dolly-in at the cut and a little punch (lens) on the given key times
const m3Cam = (w: World, pos: Vec3, target: Vec3, t: number, fov = 40, punches: number[] = []) => {
  const k = 1 + 0.18 * Math.exp(-(t - w.s.t0) * 5), p = punches.reduce((a, x) => a + (t > x ? Math.exp(-(t - x) * 7) : 0), 0);
  w.look([target[0] + (pos[0] - target[0]) * k, target[1] + (pos[1] - target[1]) * k, target[2] + (pos[2] - target[2]) * k], target, fov * (1 - 0.06 * p));
};
// a character that stays in a corner of the frame (presenter), whatever the camera does
const m3Corner = (w: World, o: THREE.Object3D, side = -1, s = 0.36, dist = 4.6, down = 1.1, across = 0.64) => {
  const cam = w.camera; cam.updateMatrixWorld(); const f = new THREE.Vector3(), r = new THREE.Vector3(), u = new THREE.Vector3();
  cam.getWorldDirection(f); r.crossVectors(f, cam.up).normalize(); u.crossVectors(r, f).normalize();
  o.position.copy(cam.position).addScaledVector(f, dist).addScaledVector(r, side * across).addScaledVector(u, -down);
  o.scale.setScalar(s); o.lookAt(cam.position.x, o.position.y, cam.position.z);
};
// a paper chip with a piece's name (HTML over the 3D), from t for d seconds
const m3Tag = (w: World, text: string, t: number, d = 1.5, y = 560) => {
  const e = document.createElement('div'); e.textContent = text;
  e.style.cssText = `position:absolute;left:540px;top:${y}px;transform:translateX(-50%);background:#f2efe6;color:#14161d;font:900 46px var(--font);letter-spacing:1px;padding:12px 30px 12px 40px;border-left:16px solid #ff6a3d;box-shadow:0 10px 0 rgba(0,0,0,.25);white-space:nowrap;opacity:0`;
  w.titles.appendChild(e);
  w.tl.fromTo(e, { opacity: 0, y: -30, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(2)' }, t).to(e, { opacity: 0, duration: 0.25 }, t + d);
};
const m3Html = (w: World, html: string, css: string) => { const e = document.createElement('div'); e.innerHTML = html; e.style.cssText = `position:absolute;${css}`; w.titles.appendChild(e); return e; };
// smoke puffs (grey balls that grow and fade) at p, from t
const m3Puffs = (w: World, p: Vec3, n = 4) => { const m = new THREE.MeshStandardMaterial({ color: '#8d9099', roughness: 1, transparent: true }); const b = [...Array(n)].map((_, i) => w.add(m3Sph(0.3 + i * 0.08, m, [p[0] - i * 0.3, p[1] + i * 0.2, p[2]]))); return (t: number, t0: number) => b.forEach((s, i) => { const u = t - t0 - i * 0.12; s.visible = u > 0 && u < 1.4; s.scale.setScalar(0.4 + u * 1.2); s.position.y = p[1] + i * 0.2 + u * 0.8; m.opacity = p3Clamp(1 - u / 1.4); }); };
// a 3D "?" card
const m3Question = () => new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 0.2), [m3Mat('#ffd23d'), m3Mat('#ffd23d'), m3Mat('#ffd23d'), m3Mat('#ffd23d'), new THREE.MeshStandardMaterial({ map: p3Paint(256, 288, (c) => { c.fillStyle = '#ffd23d'; c.fillRect(0, 0, 256, 288); c.fillStyle = '#14161d'; c.font = '900 230px Inter, Arial'; c.textAlign = 'center'; c.fillText('?', 128, 228); }) }), m3Mat('#ffd23d')] as unknown as THREE.Material);
// the board plane alone (stage 0) at a small size, for Dota's hands and the table
const m3BoardPlane = (s = 0.16) => { const p = m3Plane(); p.pose(0, {}); p.scale.setScalar(s); return p; };
const M3_ALL = { eng: 1, stab: 1, elev: 1, fin: 1, rud: 1, ail: 1, flap: 1 };

defineVisuals({
  hook: {
    bg: M3.night,
    build(w) {
      const n = m3NightSet(w); const tk = w.add(m3Tico()), d = w.add(m3Dota()); tk.position.set(-0.9, -2.5, 0); d.position.set(0.8, -2.5, 0.2); d.setPose('hug');
      const bp = m3BoardPlane(0.17); d.add(bp); bp.position.set(0, 0.55, 0.45); bp.rotation.y = -0.4;
      return (t) => { n.pose(t); m3Cam(w, [1.0, -0.2, 9.5], [0, -1.2, 0], t, 40, [w.K('alas')]); tk.live(t); d.live(t); bp.rotation.z = 0.08 * Math.sin(t * 3); d.position.y = -2.5 + 0.12 * Math.max(0, Math.sin((t - w.K('alas')) * 9)) * (t > w.K('alas') && t < w.K('alas') + 0.7 ? 1 : 0); };
    },
  },
  off: {
    bg: M3.night,
    build(w) {
      const n = m3NightSet(w); const p = w.add(m3Plane()); p.pose(5, M3_ALL); p.position.set(0, 1.8, 0);
      const q = w.add(m3Question()); q.position.set(-0.5, 5.2, 0); const puffs = m3Puffs(w, [3.6, 1.9, 0.6]); const tk = w.add(m3Tico()); tk.setPose('point');
      return (t) => {
        n.pose(t); const a = 0.75, z = p3Smoothstep(0, 1, p3Clamp((t - 7.42) / 0.7)), qp: Vec3 = [-0.5, 5.2, 0];
        const P0: Vec3 = [Math.cos(a) * 25, 5.0, Math.sin(a) * 25], T0: Vec3 = [0.9, 3.2, 0], d = Math.hypot(P0[0] - qp[0], P0[1] - qp[1], P0[2] - qp[2]);
        const P1: Vec3 = [qp[0] + (P0[0] - qp[0]) / d * 7.2, qp[1] + 0.9 + (P0[1] - qp[1]) / d * 7.2, qp[2] + (P0[2] - qp[2]) / d * 7.2];
        if (z <= 0) m3Cam(w, P0, T0, t, 40, [w.K('off'), w.K('cae')]);
        else { const L = (i: number, A: Vec3, B: Vec3) => p3Lerp(A[i], B[i], z); w.look([L(0, P0, P1), L(1, P0, P1), L(2, P0, P1)], [L(0, T0, qp), L(1, T0, qp) + 0.75 * z, L(2, T0, qp)], 40 - 4 * z);
          M3_FOCUS_OVR = p3Lerp(d, 7.3, z); M3_BOTH = z; }
        const off = t > w.K('off'); p.spin(t, off ? Math.max(0, 6 - (t - w.K('off')) * 6) : 6); puffs(t, w.K('off'));
        p.rotation.z = off ? -0.18 * p3Ramp(t, w.K('off'), w.K('off') + 1.5) : 0.03 * Math.sin(t * 2); p.position.y = 1.8 + 0.2 * Math.sin(t * 1.7);
        q.visible = t > w.K('cae') - 0.05; q.scale.setScalar(p3Spring(t, w.K('cae') - 0.05)); q.lookAt(w.camera.position); q.rotateY(0.12 * Math.sin(t * 2));   // the "?" always faces the camera
        const zz = p3Smoothstep(0, 1, p3Clamp((t - 7.42) / 0.7)), dd = p3Lerp(4.6, 10.5, zz); m3Corner(w, tk, -1, 0.36 * dd / 4.6, dd, 1.1 * dd / 4.6, 0.64 * dd / 4.6 * p3Lerp(1, 0.75, zz)); tk.live(t);   // Tico ends up behind the "?"
      };
    },
  },
  obvio: {
    bg: M3.night,
    build(w) {
      const n = m3NightSet(w); const tk = w.add(m3Tico()), d = w.add(m3Dota()); tk.position.set(-0.9, -2.5, 0); d.position.set(0.8, -2.5, 0.2); d.setPose('hug');
      const bp = m3BoardPlane(0.17); d.add(bp); bp.position.set(0, 0.55, 0.45); bp.rotation.y = -0.4;
      return (t) => { n.pose(t); m3Cam(w, [0.8, -0.4, 8.6], [0.3, -1.2, 0], t, 40, [w.K('dota')]); tk.live(t); d.live(t); d.position.y = -2.5 + 0.15 * Math.abs(Math.sin((t - w.s.t0) * 7)); };
    },
  },
  idiot: {
    bg: M3.night,
    build(w) {
      const n = m3NightSet(w); const tk = w.add(m3Tico()), d = w.add(m3Dota()); tk.position.set(-0.9, -2.5, 0); d.position.set(0.8, -2.5, 0.2); d.setPose('hug');
      const bp = m3BoardPlane(0.17); d.add(bp); bp.position.set(0, 0.55, 0.45); bp.rotation.y = -0.4;
      return (t) => { n.pose(t); m3Cam(w, [-0.6, -0.4, 8.8], [-0.2, -1.2, 0], t, 40, [w.K('idiota')]); tk.setPose(t > w.K('palm') + 0.1 ? 'palm' : 'cross', w.K('palm') + 0.1, 'cross'); tk.live(t); d.live(t); d.crazy(t > w.K('idiota')); d.head.rotation.y = t > w.K('idiota') ? 0.15 * Math.sin(t * 8) : 0; };
    },
  },
  promise: {
    bg: M3.night,
    build(w) {
      const n = m3NightSet(w); const bar = w.add(m3BoxM(3.6, 0.12, 0.12, m3Mat('#2a2c35'), [0.1, 1.2, 0])); const fill = w.add(m3Grp([-1.7, 1.2, 0], m3BoxM(3.6, 0.16, 0.16, m3Mat(M3.orange, 0.4, 0.4), [1.8, 0, 0])));
      const pin = w.add(m3Sph(0.28, m3Mat(M3.lime, 0.3, 0.6), [1.9, 1.2, 0])); const tk = w.add(m3Tico()); tk.setPose('point'); tk.position.set(-1.8, -2.5, 0.8);
      m3Html(w, 'AL FINAL', 'left:620px;top:820px;font:700 34px monospace;letter-spacing:4px;color:#d4ff3a');
      return (t) => { n.pose(t); m3Cam(w, [0.5, 0.8, 14], [0, 0.0, 0], t, 40, [w.K('bar')]); fill.scale.x = Math.max(0.01, p3Ramp(t, w.s.t0 + 0.2, w.s.t1 - 0.2)); pin.scale.setScalar(0.4 + 0.6 * p3Spring(t, w.K('bar'))); bar.visible = true; tk.live(t); };
    },
  },
  fuel: {
    bg: M3.night,
    build(w) {
      const n = m3NightSet(w); const g = w.add(m3Gauge()); g.position.set(0, 2.7, 0); g.scale.setScalar(0.85); const card = w.add(m3Card('ARCHIVO · ███████', 'Un avión sin', 'combustible en pleno vuelo', '????')); card.position.set(0, 1.6, 0.5); card.scale.setScalar(0.72);
      const tk = w.add(m3Tico());
      return (t) => {
        n.pose(t); m3Cam(w, [0, 1.6, 10.5], [0, 1.4, 0], t, 40, [w.K('gauge'), w.K('file')]);
        g.needle.rotation.z = p3Lerp(-1.0, 1.15, p3Ramp(t, w.K('gauge') - 0.6, w.K('gauge') + 0.6)) + (t > w.K('gauge') + 0.6 ? 0.06 * Math.sin(t * 20) : 0);
        card.visible = t > w.K('file'); card.position.y = 1.6 - 2 * (1 - p3Spring(t, w.K('file'))); g.scale.setScalar(0.85 * (1 - p3Clamp((t - w.K('file') + 0.1) / 0.25)) + 0.001); card.rotation.x = -0.15;
        m3Corner(w, tk); tk.live(t);
      };
    },
  },
  armo: {
    build(w) {
      p3Lights(w); w.add(p3Ground()); w.add(m3Forest(24, 3, -10, 50)); const tb = w.add(m3Table()); const bp = w.add(m3BoardPlane(0.3)); bp.position.set(0.3, 1.25, 0);
      const tk = w.add(m3Tico()); tk.setPose('point'); tk.position.set(-1.7, 0, 1.6);
      return (t) => {
        const u = p3Ramp(t, w.K('board') + 0.1, w.K('board') + 1.1);
        m3Cam(w, [p3Lerp(2.0, 1.4, u), p3Lerp(3.6, 2.6, u), p3Lerp(13, 5.6, u)], [p3Lerp(-0.6, 0.3, u), p3Lerp(2.2, 1.5, u), 0], t, 40);
        bp.position.y = 1.25 + 6 * (1 - p3Clamp((t - w.K('board') + 0.4) / 0.45)) ** 2; bp.rotation.y = 0.3 * Math.sin(t);
        tk.live(t); void tb;
      };
    },
  },
  crash: {
    build(w) {
      p3Lights(w); w.add(p3Ground()); w.add(m3Forest(24, 4, -10, 50)); const d = w.add(m3Dota()); d.position.set(-1.3, 0, 1.0);
      const bp = w.add(m3BoardPlane(0.28)); const puffs = m3Puffs(w, [2.2, 0.3, 1.1]);
      return (t) => {
        m3Cam(w, [0.6, 2.8, 13], [0.4, 2.0, 0], t, 40, [w.K('crash')]);
        const a = w.K('throw'), b = w.K('crash'), u = p3Clamp((t - a) / (b - a));
        d.setPose(t > a ? 'reach' : 'up', a, 'up'); d.live(t);
        if (t < a) { bp.position.set(-0.8, 1.8, 1.1); bp.rotation.set(0, 0, 0.2); } else if (t < b) { bp.position.set(p3Lerp(-0.8, 2.2, u), 1.8 + Math.sin(u * Math.PI) * 1.4 - u * 1.6, 1.1); bp.rotation.set(u * 0.6, 0, 0.2 - u * 1.4); }
        else { bp.position.set(2.2, 0.25, 1.1); bp.rotation.set(0.6, 0.4, -1.3 + 0.1 * Math.sin((t - b) * 30) * Math.exp(-(t - b) * 4)); }
        puffs(t, b);
      };
    },
  },
  wing: {
    bg: '#1c336f',
    build(w) {
      p3Lights(w); const wg = m3Wing(); w.add(wg.foil); w.add(wg.air); wg.downs.forEach((a) => w.add(a)); w.add(wg.lift);
      const tk = w.add(m3Tico()); tk.setPose('point');
      return (t) => {
        m3Cam(w, [0.6, 0.6, 15], [0.3, 1.0, 0], t, 40, [w.K('curva'), w.K('tilt')]);
        wg.foil.rotation.z = -0.16 * p3Ramp(t, w.K('tilt') - 0.2, w.K('tilt') + 0.5); wg.foil.glow(t > w.K('curva') && t < w.K('curva') + 1.4 ? 0.6 : 0);
        wg.air.pose(t, w.s.t0 - 2, 4, 1.6 * p3Ramp(t, w.K('down') - 0.8, w.K('down') + 0.6));
        wg.downs.forEach((a, i) => a.grow(p3Spring(t, w.K('down') + i * 0.08))); wg.lift.grow(0);
        m3Corner(w, tk); tk.live(t);
      };
    },
  },
  lift: {
    bg: '#1c336f',
    build(w) {
      p3Lights(w); const wg = m3Wing(); w.add(wg.foil); w.add(wg.air); wg.downs.forEach((a) => w.add(a)); w.add(wg.lift);
      m3Tag(w, 'SUSTENTACIÓN', w.K('name'), 1.4); const tk = w.add(m3Tico()); tk.setPose('point');
      return (t) => {
        m3Cam(w, [0, 0.8, 16], [0, 1.4, 0], t, 40, [w.K('up'), w.K('name')]);
        wg.foil.rotation.z = -0.16; wg.foil.position.y = 0.4 * p3Spring(t, w.K('up'));
        wg.air.pose(t, w.s.t0 - 4, 4, 1.6); wg.downs.forEach((a) => a.grow(1));
        wg.lift.grow(p3Spring(t, w.K('up') - 0.2, 180, 14)); wg.lift.scale.setScalar(t > w.K('name') ? 1 + 0.08 * Math.sin((t - w.K('name')) * 9) : 1);
        m3Corner(w, tk); tk.live(t);
      };
    },
  },
  vuela: {
    bg: '#1c336f',
    build(w) {
      p3Lights(w); const wg = m3Wing(); w.add(wg.foil); w.add(wg.air); w.add(wg.lift);
      const d = w.add(m3Dota()), tk = w.add(m3Tico()); d.side(1); tk.side(-1);
      return (t) => {
        m3Cam(w, [0, 1.5, 16], [0, 1.7, 0], t, 40, [w.K('fast'), w.K('still')]);
        wg.foil.rotation.z = -0.16; const still = t > w.K('still');
        wg.air.pose(still ? w.K('still') : t, w.s.t0 - 4, t > w.K('fast') ? 9 : 4, 1.6); wg.air.visible = !still || t < w.K('still') + 0.1;
        wg.lift.grow(still ? 1 - p3Ramp(t, w.K('still'), w.K('still') + 0.4) : 1);
        m3Corner(w, d, -1, 0.5); d.setPose('up'); d.live(t); m3Corner(w, tk, 1, 0.42); tk.live(t);
      };
    },
  },
  turb: {
    build(w) {
      const sky = m3SkySet(w); const p = w.add(m3Plane()); const tk = w.add(m3Tico()); tk.setPose('point');
      return (t) => {
        sky.pose(t); const k = w.K('turb') - 0.1, a = 0.72 + 0.06 * Math.sin(t * 0.5);
        p.pose(p3Ramp(t, k + 0.3, k + 0.8), { eng: p3Spring(t, k) }); p.glow('eng', m3AddGlow(t, k)); p.spin(t, t > k ? 6 : 0);
        p.position.set(0, 1.8 + 0.25 * Math.sin(t * 1.6), 0); p.rotation.x = 0.05 * Math.sin(t * 1.3);
        m3Cam(w, [Math.cos(a) * 25, 6.2, Math.sin(a) * 25], [1.4, 3.6, 0], t, 40, [k]);
        m3Corner(w, tk); tk.live(t);
      };
    },
  },
  motor: {
    build(w) {
      p3Lights(w); w.scene.fog = new THREE.Fog(P3_SKY, 30, 75); w.add(p3Ground()); w.add(p3Ground()).scale.setScalar(6); const rw = w.add(p3Runway()); w.add(m3Forest(26, 6, -14, 70));
      const p = w.add(m3Plane()); p.pose(1, { eng: 1 }); p.position.set(0, 1.0, 0);
      const air = w.add(p3Airflow(5, -0.6, 1.2, 0)); air.position.set(-6, 1.1, 0); air.scale.set(0.8, 0.7, 1);
      const d = w.add(m3Dota()); d.setPose('down'); d.position.set(-6.5, 0, 0.4); d.rotation.y = 0.9;
      m3Tag(w, 'MOTOR', w.K('name'), 1.3); const tk = w.add(m3Tico()); tk.setPose('point');
      return (t) => {
        const go = w.K('dota'), a = 0.95;
        p.spin(t, 7); p.glow('eng', t > w.K('name') && t < w.K('name') + 1.2 ? 0.8 : 0);
        p.position.x = 3 * p3Clamp((t - go - 0.6) / 3) ** 2; rw.advance(0);
        air.pose(t, w.K('blow'), 9, 0); air.visible = t > w.K('blow');
        const u = p3Clamp((t - go - 0.1) / 0.8); d.position.set(-6.5 - u * 9, u * 5 - u * u * 2, 0.4); d.rotation.z = u * 8; d.visible = u < 1; d.live(t);
        m3Cam(w, [Math.cos(a) * 25, 5.4, Math.sin(a) * 25], [-0.3, 2.4, 0], t, 42, [w.K('blow'), w.K('name')]);
        m3Corner(w, tk); tk.live(t);
      };
    },
  },
  pitch: {
    build(w) {
      const sky = m3SkySet(w); const p = w.add(m3Plane()); p.pose(1, { eng: 1 }); const tk = w.add(m3Tico());
      return (t) => {
        sky.pose(t, 1.6); p.spin(t); p.position.set(0, 1.8 + 0.6 * Math.sin((t - w.s.t0) * 5.6 + 1.6), 0); p.rotation.z = 0.32 * Math.sin((t - w.s.t0) * 5.6);
        const a = 0.68; m3Cam(w, [Math.cos(a) * 25, 5.6000000000000005, Math.sin(a) * 25], [1.3, 3.4, 0], t, 40, [w.K('nose')]);
        m3Corner(w, tk); tk.live(t);
      };
    },
  },
  stab: {
    build(w) {
      const sky = m3SkySet(w); const p = w.add(m3Plane()); const tk = w.add(m3Tico()); tk.setPose('point');
      m3Tag(w, 'ESTABILIZADOR', w.K('name'), 1.3);
      return (t) => {
        sky.pose(t, 1.4); const k = w.K('stab') - 0.1;
        p.pose(1 + p3Ramp(t, k + 0.4, k + 0.9), { eng: 1, stab: p3Spring(t, k) }); p.glow('stab', Math.max(m3AddGlow(t, k), t > w.K('name') && t < w.K('name') + 1.2 ? 0.8 : 0)); p.spin(t);
        const damp = t < k + 0.3 ? 1 : Math.exp(-(t - k - 0.3) * 2.5); p.rotation.z = 0.28 * damp * Math.sin((t - w.s.t0) * 5.6); p.position.set(0, 1.8 + 0.4 * damp * Math.sin((t - w.s.t0) * 5.6 + 1.6), 0);
        const a = 1.05; m3Cam(w, [Math.cos(a) * 25, 5.4, Math.sin(a) * 25], [-0.5, 3.0, 0], t, 40, [k, w.K('name')]);
        m3Corner(w, tk); tk.live(t);
      };
    },
  },
  elev: {
    build(w) {
      const sky = m3SkySet(w); const p = w.add(m3Plane()); const tk = w.add(m3Tico()); tk.setPose('point');
      m3Tag(w, 'ELEVADOR', w.K('name'), 1.1);
      return (t) => {
        sky.pose(t, 1.4); const k = w.s.t0 + 0.2;
        p.pose(2 + p3Ramp(t, k + 0.4, k + 0.9), { eng: 1, stab: 1, elev: p3Spring(t, k) }); p.glow('elev', Math.max(m3AddGlow(t, k), t > w.K('name') && t < w.K('name') + 1.1 ? 0.8 : 0)); p.spin(t);
        const e = t < w.K('up') - 0.1 ? 0 : t < w.K('down') - 0.1 ? 0.45 : t < w.K('down') + 0.9 ? -0.45 : 0;
        p.controls({ elev: e }); p.rotation.z += ((e > 0 ? 0.22 : e < 0 ? -0.2 : 0) - p.rotation.z) * 0.0 + 0; p.rotation.z = e > 0 ? 0.22 * p3Ramp(t, w.K('up'), w.K('up') + 0.5) : e < 0 ? 0.22 - 0.42 * p3Ramp(t, w.K('down'), w.K('down') + 0.5) : p3Lerp(-0.2, 0, p3Ramp(t, w.K('down') + 0.9, w.K('down') + 1.4)) * (t > w.K('down') ? 1 : 0);
        p.position.set(0, 1.8 + 0.2 * Math.sin(t * 1.5), 0);
        const a = 1.15; m3Cam(w, [Math.cos(a) * 25, 5.2, Math.sin(a) * 25], [-0.9, 2.9, 0], t, 40, [w.K('up'), w.K('down')]);
        m3Corner(w, tk); tk.live(t);
      };
    },
  },
  yaw: {
    build(w) {
      const sky = m3SkySet(w); const p = w.add(m3Plane()); p.pose(3, { eng: 1, stab: 1, elev: 1 });
      return (t) => {
        sky.pose(t); p.spin(t); p.rotation.y = 0.35 * Math.sin((t - w.s.t0) * 7.5); p.position.set(0, 1.6, 0.6 * Math.sin((t - w.s.t0) * 7.5 + 1.5));
        m3Cam(w, [-3, 27, 9], [0.5, 3.0, 0], t, 42, [w.K('lado')]);
      };
    },
  },
  fin: {
    build(w) {
      const sky = m3SkySet(w); const p = w.add(m3Plane()); const tk = w.add(m3Tico()); tk.setPose('point');
      m3Tag(w, 'DERIVA', w.K('name'), 1.1); m3Tag(w, 'TIMÓN', w.K('rud') + 0.1, 1.0);
      return (t) => {
        sky.pose(t, 1.4); const kf = w.K('fin') - 0.1, kr = w.K('rud') - 0.2;
        p.pose(3 + p3Ramp(t, kf + 0.4, kf + 0.9) + p3Ramp(t, kr + 0.5, kr + 1.0), { eng: 1, stab: 1, elev: 1, fin: p3Spring(t, kf), rud: p3Spring(t, kr) });
        p.glow('fin', Math.max(m3AddGlow(t, kf), t > w.K('name') && t < w.K('name') + 1.1 ? 0.8 : 0)); p.glow('rud', m3AddGlow(t, kr)); p.spin(t);
        p.controls({ rud: t > kr + 0.4 ? 0.4 * Math.sin((t - kr) * 9) * Math.exp(-(t - kr - 0.4) * 1.2) : 0 });
        p.rotation.y = t < kf ? 0.2 * Math.sin((t - w.s.t0) * 7) : 0.2 * Math.sin((t - w.s.t0) * 7) * Math.exp(-(t - kf) * 2);
        p.position.set(0, 1.8 + 0.2 * Math.sin(t * 1.5), 0);
        const a = 1.0; m3Cam(w, [Math.cos(a) * 25, 5.8, Math.sin(a) * 25], [-0.7, 3.3, 0], t, 40, [kf, w.K('name'), kr]);
        m3Corner(w, tk); tk.live(t);
      };
    },
  },
  roll: {
    build(w) {
      const sky = m3SkySet(w); const p = w.add(m3Plane()); const tk = w.add(m3Tico());
      return (t) => {
        sky.pose(t, 1.2); const k = w.K('tips') - 0.1;
        p.pose(5, { eng: 1, stab: 1, elev: 1, fin: 1, rud: 1, ail: p3Spring(t, k) }); p.glow('ail', m3AddGlow(t, k)); p.spin(t); p.position.set(0, 1.8 + 0.2 * Math.sin(t * 1.4), 0);
        m3Cam(w, [21, 3.8, 1.4], [0, 3.3, 0], t, 44, [k]);
        m3Corner(w, tk); tk.live(t);
      };
    },
  },
  ail: {
    build(w) {
      const sky = m3SkySet(w); const p = w.add(m3Plane()); p.pose(5, { eng: 1, stab: 1, elev: 1, fin: 1, rud: 1, ail: 1 }); const tk = w.add(m3Tico()); tk.setPose('point');
      m3Tag(w, 'ALERONES', w.K('name'), 1.1);
      return (t) => {
        sky.pose(t, 1.2); p.spin(t); p.glow('ail', (t > w.K('name') && t < w.K('name') + 1.1) || (t > w.K('up') - 0.1 && t < w.K('bank') + 0.8) ? 0.7 : 0);
        const bk = w.K('bank'), dl = t < w.K('up') - 0.1 ? 0 : t < bk - 0.2 ? 0.6 * Math.sin((t - w.K('up') + 0.1) * 5.5) : 0.48; p.controls({ ailL: -dl, ailR: dl });
        p.rotation.x = 0.5 * p3Ramp(t, bk - 0.2, bk + 0.8); p.position.set(0, 1.8, 0);
        m3Cam(w, [-9.5, 9.5, 14.5], [0, 2.4, 0.3], t, 40, [w.K('up'), bk]);
        m3Corner(w, tk); tk.live(t);
      };
    },
  },
  slow: {
    build(w) {
      p3Lights(w); w.add(p3Ground()); const rw = w.add(p3Runway()); w.add(m3Forest(26, 8, -14, 70)); const p = w.add(m3Plane()); p.pose(5, M3_ALL); const tk = w.add(m3Tico());
      m3Html(w, '<div id="spd" style="font:900 40px monospace;color:#14161d;background:#f2efe6;padding:8px 22px;border-left:14px solid #ff6a3d">VELOCIDAD ▼</div>', 'left:300px;top:560px');
      return (t) => {
        const u = p3Clamp((t - w.s.t0) / (w.s.t1 - w.s.t0)); p.spin(t, 3); rw.advance((t - w.s.t0) * p3Lerp(10, 4, u));
        p.position.set(0, p3Lerp(5, 1.6, u), 0); p.rotation.z = 0.08 + (t > w.K('weak') ? 0.1 * Math.sin((t - w.K('weak')) * 6) * Math.exp(-(t - w.K('weak')) * 2) : 0);
        const a = 0.75; m3Cam(w, [Math.cos(a) * 25, 5.6000000000000005, Math.sin(a) * 25], [1.3, 3.0, 0], t, 40, [w.K('lento'), w.K('weak')]);
        m3Corner(w, tk); tk.live(t);
      };
    },
  },
  flaps: {
    bg: '#1c336f',
    build(w) {
      p3Lights(w); const wg = m3Wing(); w.add(wg.foil); w.add(wg.air); w.add(wg.lift); m3Tag(w, 'FLAPS', w.K('name'), 1.2); const tk = w.add(m3Tico()); tk.setPose('point');
      return (t) => {
        m3Cam(w, [0.4, 0.8, 16], [0.4, 1.2, 0], t, 40, [w.K('flap'), w.K('name')]);
        wg.foil.rotation.z = -0.12; wg.air.pose(t, w.s.t0 - 4, 3, p3Lerp(1.0, 1.9, p3Ramp(t, w.K('flap'), w.K('flap') + 0.7)));
        const f = p3Spring(t, w.K('flap') - 0.1); wg.flap.rotation.z = -0.55 * f; wg.flap.visible = wg.mount.visible = true;
        wg.flapMat.emissive.set(M3.lime); wg.flapMat.emissiveIntensity = t > w.K('name') && t < w.K('name') + 1.2 ? 0.6 : 0;
        wg.lift.grow(p3Lerp(0.45, 1, p3Spring(t, w.K('flap') + 0.4)));
        m3Corner(w, tk); tk.live(t);
      };
    },
  },
  bike: {
    build(w) {
      p3Lights(w); w.add(p3Ground()); const forest = w.add(m3Forest(30, 9, -8, 90)); const road = w.add(p3Runway());
      const bike = w.add(m3Bike()); const d = w.add(m3Dota()); d.setPose('up'); const tk = w.add(m3Tico());
      return (t) => {
        road.advance((t - w.s.t0) * 9); forest.position.x = -((t - w.s.t0) * 3) % 20; bike.roll(t);
        bike.position.set(0, 0.02 * Math.sin(t * 20), 0.8); d.position.set(0.05, 1.12 + 0.03 * Math.sin(t * 20), 0.8); d.live(t);
        m3Cam(w, [1.6, 2.8, 12], [0.2, 2.0, 0], t, 40, [w.K('bike')]);
        m3Corner(w, tk, -1, 0.42); tk.live(t); tk.head.rotation.x = t > w.K('tico') && t < w.K('tico') + 1 ? 0.25 * Math.sin((t - w.K('tico')) * 12) : tk.head.rotation.x;
      };
    },
  },
  felicidades: {
    build(w) {
      p3Lights(w); w.add(p3Ground()); w.add(p3Ground()).scale.setScalar(6); w.add(p3Runway()); w.add(m3Forest(26, 8, -14, 70));
      const p = w.add(m3Plane()); p.pose(5, M3_ALL); p.position.set(0, 1.0, 0); p.rotation.y = 0.35;
      const rays = w.add(m3Rays()); rays.position.set(0, 2.6, -6); const conf = w.add(m3Confetti()); const bow = w.add(m3Bow());
      const tk = w.add(m3Tico()), d = w.add(m3Dota()); tk.setPose('point'); tk.position.set(-2.4, 0, 1.8); d.setPose('up'); d.position.set(3.4, 0, 1.6);
      return (t) => {
        const g0 = w.K('glow'), u = p3Ramp(t, g0 - 0.3, g0 + 0.6), back = p3Ramp(t, w.K('wow') - 0.2, w.K('wow') + 0.6);
        p.spin(t, 5); for (const k of ['eng', 'stab', 'elev', 'fin', 'rud', 'ail', 'flap'] as M3Part[]) p.glow(k, t > g0 - 0.4 && t < g0 + 1.2 ? 0.7 : 0);
        rays.visible = t > g0; rays.rotation.z = (t - g0) * 0.5; rays.scale.setScalar(p3Spring(t, g0) * 1.2);
        conf.pose(t, g0 + 0.1); bow.visible = t > g0 + 0.25; bow.position.set(0.3, 3.25 + 5 * (1 - p3Clamp((t - g0 - 0.25) / 0.45)) ** 2, 0.3); bow.scale.setScalar(1.3); bow.rotation.y = 0.35;
        const zoom = u * (1 - back);
        m3Cam(w, [p3Lerp(5, 3.4, zoom), p3Lerp(4.4, 3.4, zoom), p3Lerp(22, 12.5, zoom)], [0.4, p3Lerp(3.4, 2.6, zoom), 0], t, 40, [g0, w.K('wow')]);
        tk.position.x = p3Lerp(-2.4, -4.2, zoom); d.position.x = p3Lerp(3.4, 5.8, zoom); tk.live(t); d.live(t); d.position.y = t > w.K('wow') ? 0.3 * Math.abs(Math.sin((t - w.K('wow')) * 8)) : 0;
      };
    },
  },
  rock: {
    bg: M3.night,
    build(w) {
      const n = m3NightSet(w); const p = w.add(m3Plane()); p.pose(5, M3_ALL); p.position.set(1.5, 2.5, 0); const r = w.add(m3Rock()); const puffs = m3Puffs(w, [5.0, 2.6, 0.6]); const tk = w.add(m3Tico());
      return (t) => {
        n.pose(t); const off = t > w.K('off'); p.spin(t, off ? Math.max(0, 6 - (t - w.K('off')) * 6) : 6); puffs(t, w.K('off'));
        p.position.y = 2.5 + 0.15 * Math.sin(t * 1.5); r.position.set(-3.2, t > w.K('rock') ? 4.5 - 9.8 * 0.5 * (t - w.K('rock')) ** 2 * 3 : 4.5, 0.5); r.rotation.set(t * 2, t, 0); r.visible = r.position.y > -2.2;
        const a = 0.7; m3Cam(w, [Math.cos(a) * 25, 5.8, Math.sin(a) * 25], [0.9, 3.0, 0], t, 42, [w.K('off'), w.K('rock')]);
        m3Corner(w, tk); tk.live(t);
      };
    },
  },
  glide: {
    bg: M3.night,
    build(w) {
      const n = m3NightSet(w); const p = w.add(m3Plane()); p.pose(5, M3_ALL); p.scale.setScalar(0.7);
      const dots = [...Array(26)].map((_, i) => w.add(m3Sph(0.06, m3Mat(M3.lime, 0.3, 0.8), [-9 + i * 0.75, 6 - (i * 0.75) * 0.42, 0]))); const tk = w.add(m3Tico()); tk.setPose('point');
      return (t) => {
        n.pose(t); const u = p3Clamp((t - w.s.t0) / (w.s.t1 - w.s.t0)); p.position.set(-6 + u * 12, 4.8 - u * 12 * 0.42, 0); p.rotation.z = -0.38; p.spin(t, 0.2);
        dots.forEach((d, i) => { d.visible = -9 + i * 0.75 < p.position.x; });
        const a = 0.6; m3Cam(w, [Math.cos(a) * 20 + p.position.x * 0.4, 3.8, Math.sin(a) * 20], [p.position.x * 0.5, 2.2, 0], t, 42);
        m3Corner(w, tk); tk.live(t);
      };
    },
  },
  trade: {
    bg: M3.night,
    build(w) {
      const n = m3NightSet(w); const ba = w.add(m3Bar(C3.air)), bs = w.add(m3Bar(M3.lime)); ba.position.set(-0.5, -1.8, 0); bs.position.set(0.9, -1.8, 0);
      const p = w.add(m3Plane()); p.pose(5, M3_ALL); p.scale.setScalar(0.32); const lift = w.add(p3Arrow([0, 0, 0], [0, 1, 0], 1.3, M3.lime, 0.1));
      m3Html(w, 'ALTURA', 'left:385px;top:1478px;font:700 30px monospace;color:#cfcdc4;letter-spacing:3px'); m3Html(w, 'VELOCIDAD', 'left:600px;top:1478px;font:700 30px monospace;color:#cfcdc4;letter-spacing:3px');
      const tk = w.add(m3Tico());
      return (t) => {
        n.pose(t); ba.level(p3Lerp(0.95, 0.3, p3Ramp(t, w.K('alt') - 0.1, w.K('alt') + 1.6))); bs.level(p3Lerp(0.55, 0.85, p3Ramp(t, w.K('vel') - 0.1, w.K('vel') + 0.7)));
        const u = p3Clamp((t - w.s.t0) / (w.s.t1 - w.s.t0)); p.position.set(2.1, 3.2 - u * 2.6, 0); p.rotation.z = -0.2; p.spin(t, 0.2); lift.position.set(2.1, 3.5 - u * 2.6, 0); lift.scale.setScalar(1 + (t > w.K('lift') ? 0.15 * Math.sin((t - w.K('lift')) * 9) : 0));
        m3Cam(w, [0.3, 1.4, 16], [0, 1.2, 0], t, 40, [w.K('alt'), w.K('vel')]);
        m3Corner(w, tk); tk.live(t);
      };
    },
  },
  canada: {
    bg: M3.night,
    build(w) {
      const n = m3NightSet(w); const card = w.add(m3Card('ARCHIVO · CANADÁ', 'Air Canada', 'Sin combustible en pleno vuelo', '1983')), card2 = w.add(m3Card('ARCHIVO · CANADÁ', 'Air Canada', 'Sin combustible en pleno vuelo', '1983', 'PLANEÓ'));
      const p = w.add(m3Plane()); p.pose(5, M3_ALL); p.scale.setScalar(0.3); const strip = w.add(m3BoxM(3, 0.05, 0.6, m3Mat('#2a2c35'), [3.4, -1.9, 0]));
      return (t) => {
        n.pose(t); const c = p3Spring(t, w.K('card') - 0.15); [card, card2].forEach((k) => { k.position.set(0, 2.6 - 2 * (1 - c), 0); k.rotation.set(-0.1, 0.15 * (1 - c), 0); });
        card.visible = t < w.K('stamp'); card2.visible = !card.visible; card2.scale.setScalar(t > w.K('stamp') ? 1 + 0.06 * Math.exp(-(t - w.K('stamp')) * 8) : 1);
        const u = p3Clamp((t - w.s.t0) / (w.K('stamp') - w.s.t0)); p.position.set(-4 + u * 7.4, -0.4 - u * 1.3, 0.3); p.rotation.z = -0.15 + u * 0.15; p.spin(t, 0.2);
        m3Cam(w, [0, 1.2, 15.5], [0, 1.2, 0], t, 40, [w.K('card'), w.K('stamp')]); void strip;
      };
    },
  },
  turbu: {
    bg: '#d9d1c2',
    build(w) {
      const cab = m3Cabin(w); const tk = w.add(m3Tico()), d = w.add(m3Dota()); tk.position.set(-0.75, 0.18, 0); tk.scale.setScalar(0.62); tk.setPose('hold'); d.position.set(0.75, 0.2, 0); d.scale.setScalar(0.72); d.setPose('down');
      cab.seatFront(-0.75); cab.seatFront(0.75); const belt = w.add(m3Grp([-0.75, 0.66, 0.22], m3BoxM(0.62, 0.08, 0.05, m3Mat(M3.orange, 0.5)), m3BoxM(0.12, 0.1, 0.06, m3Mat('#cfd4dd', 0.3)))); void belt;
      return (t) => {
        cab.pose(t); const sh = t > w.K('shake') ? 1 : 0, b = w.K('bonk');
        w.look([0.05 * sh * Math.sin(t * 45), 1.75 + 0.04 * sh * Math.sin(t * 38), 4.6], [0, 1.3, -0.6], 50);
        tk.live(t); tk.position.y = 0.18 + 0.03 * sh * Math.sin(t * 40);
        const up = p3Clamp((t - (b - 0.45)) / 0.45) ** 3; d.position.set(0.75, 0.2 + up * 2.25, 0); d.rotation.z = up * Math.PI; d.live(t);
        d.crazy(t > b); d.bump.visible = t > b; d.dizzy(t, t > b);
      };
    },
  },
  belt: {
    bg: '#d9d1c2',
    build(w) {
      const cab = m3Cabin(w); const tk = w.add(m3Tico()), d = w.add(m3Dota()); tk.position.set(-0.75, 0.18, 0); tk.scale.setScalar(0.62); tk.setPose('hold'); d.position.set(0.75, 2.45, 0); d.rotation.z = Math.PI; d.scale.setScalar(0.72); d.setPose('down');
      cab.seatFront(-0.75); cab.seatFront(0.75); const strap = m3Grp([-0.75, 0.66, 0.22], m3BoxM(0.62, 0.08, 0.05, m3Mat(M3.orange, 0.5))), buckle = m3BoxM(0.12, 0.1, 0.06, m3Mat('#cfd4dd', 0.3), [-0.75, 0.66, 0.25]); w.add(strap); w.add(buckle);
      const clic = m3Html(w, '¡CLIC!', 'left:600px;top:980px;font:900 64px var(--font);color:#14161d;background:#ffd23d;padding:6px 24px;border:6px solid #14161d;border-radius:16px;transform:rotate(-8deg);opacity:0');
      w.tl.fromTo(clic, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2.4)' }, w.K('click')).to(clic, { opacity: 0, duration: 0.3 }, w.K('click') + 1.1);
      return (t) => {
        cab.pose(t); const z = p3Ramp(t, w.K('click') - 0.75, w.K('click') - 0.1);
        w.look([p3Lerp(0, -0.62, z), p3Lerp(1.75, 1.5, z), p3Lerp(4.6, 3.4, z)], [p3Lerp(0, -0.72, z), p3Lerp(1.3, 1.05, z), p3Lerp(-0.6, 0, z)], 50);
        tk.live(t); d.live(t); d.crazy(true); d.bump.visible = true; d.dizzy(t, true); d.position.x = 0.75 + 0.04 * Math.sin(t * 3);
        strap.scale.x = t > w.K('click') ? 0.88 : 1; strap.position.y = 0.66 - (t > w.K('click') - 0.2 && t < w.K('click') + 0.15 ? 0.03 : 0); tk.head.rotation.x = t > w.K('click') + 0.3 && t < w.K('click') + 0.8 ? 0.15 : tk.head.rotation.x;
      };
    },
  },
  outro: {
    bg: M3.night,
    build(w) {
      const n = m3NightSet(w); const bp = w.add(m3BoardPlane(0.45)); const d = w.add(m3Dota()); d.setPose('up'); d.scale.setScalar(0.8); const tk = w.add(m3Tico()); tk.setPose('point');
      return (t) => {
        n.pose(t); const u = p3Clamp((t - w.s.t0) / (w.s.t1 - w.s.t0));
        bp.position.set(-4 + u * 9, 0.2 + u * 4.5, 0); bp.rotation.set(0, 0.5, 0.25); d.position.set(bp.position.x, bp.position.y + 0.12, 0.1); d.rotation.y = 0.5; d.live(t);
        tk.position.set(-5 + u * 5.5, -2.5 + 0.3 * Math.abs(Math.sin(t * 9)), 1.5); tk.rotation.y = 0.9; tk.live(t);
        m3Cam(w, [1, 2.0, 17], [0.5, 1.6, 0], t, 42, [w.K('go')]);
      };
    },
  },
  sub: {
    bg: '#fff3d6',
    build(w) {
      p3Lights(w, '#fff6e0', '#e8c27a'); const rays = w.add(m3Rays('#ffe08a', 30)); rays.position.set(0, 2, -6);
      const stars = [[-3.2, 4.4, 0.5], [3.4, 4.6, 0], [-3.6, 0.6, 1], [3.5, 0.2, 1], [-2.4, 2.6, -1], [2.6, 2.8, -1]].map(([x, y, z], i) => { const s = w.add(m3StarMesh(0.3 + (i % 2) * 0.12)); s.position.set(x, y, z); return s; });
      const tk = w.add(m3Tico()), d = w.add(m3Dota()); tk.position.set(-0.8, -2.3, 0); d.position.set(0.8, -2.3, 0.2); d.setPose('up'); tk.bulb.visible = true; d.crazy(true);
      const sub = m3Html(w, '¡SUSCRÍBANSE!', 'left:540px;top:520px;transform:translateX(-50%);font:900 76px var(--font);color:#fff;-webkit-text-stroke:10px #14161d;paint-order:stroke fill;background:#ff5a5f;border:9px solid #14161d;border-radius:60px;padding:6px 44px;white-space:nowrap;opacity:0');
      const logo = m3Html(w, '<span style="color:#3270e6">Idio</span><span style="color:#ff7a3d">-</span><span style="color:#ffc83d">two</span>', 'left:540px;top:650px;transform:translateX(-50%);font:900 170px var(--font);letter-spacing:-4px;-webkit-text-stroke:15px #2b1a14;paint-order:stroke fill;text-shadow:10px 14px 0 rgba(0,0,0,.16);white-space:nowrap;opacity:0');
      w.tl.fromTo(logo, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' }, w.s.t0 + 0.05).fromTo(sub, { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.4)' }, w.s.t0 + 0.3).to(sub, { scale: 1.08, duration: 0.25, yoyo: true, repeat: 7, ease: 'sine.inOut' }, w.s.t0 + 1.0);
      return (t) => {
        rays.rotation.z = t * 0.25; stars.forEach((s, i) => { s.rotation.y = t * 2 + i; s.scale.setScalar(p3Spring(t, w.s.t0 + 0.1 + i * 0.07)); });
        tk.live(t); d.live(t); d.dizzy(t, true); d.position.y = -2.3 + 0.12 * Math.abs(Math.sin((t - w.s.t0) * 6)) * (t < w.s.t0 + 1 ? 1 : 0);
        tk.head.rotation.y = t > w.K('tabla') && t < w.K('tabla') + 0.6 ? 0.25 * Math.sin((t - w.K('tabla')) * 18) : 0;
        w.look([0, 0.2, 11.5], [0, -0.4, 0], 40);
      };
    },
  },
});

// every scene of this video gets the finish (reflections, grade, vignette) and the fur clock
for (const id of Object.keys(VISUALS)) { const V = VISUALS[id], b = V.build; V.build = (w) => {
  m3Finish(w); let tgt = new THREE.Vector3(0, 1, 0); const look0 = w.look.bind(w); w.look = (p, q, f) => { tgt = new THREE.Vector3(...q); look0(p, q, f); };
  const pose = b(w), keys = (w.s.keys || []).map((k) => w.K(k.id)); let q0: THREE.Quaternion | null = null;
  const dust = m3Dust(); w.scene.add(dust); const tint = new THREE.Color('#ffffff');
  w.scene.traverse((o) => {   // softer, warmer key light with cleaner shadows; the characters take a little of the sky colour
    const l = o as THREE.DirectionalLight; if (l.isDirectionalLight && l.castShadow) { l.shadow.bias = -0.0004; l.shadow.normalBias = 0.03; l.shadow.mapSize.set(2048, 2048); l.shadow.radius = 4; l.intensity *= 1.15; if (w.s.id !== 'belt' && w.s.id !== 'turb2') l.color.lerp(new THREE.Color('#ffe9c9'), 0.5); }
    const h = o as THREE.HemisphereLight; if (h.isHemisphereLight) tint.copy(new THREE.Color('#ffffff').lerp(h.color, 0.35));
  });
  return (t) => {
    P3_T.value = t; M3_KEYS = keys; M3_FOCUS_OVR = -1; M3_BOTH = 0; if (q0) w.camera.quaternion.copy(q0); pose(t); q0 = w.camera.quaternion.clone();
    // a hand-held camera: a slow, small drift so no shot is ever frozen
    const n = (a: number, b: number) => Math.sin(t * a + b); w.camera.rotateX(0.004 * (n(0.9, 1) + 0.6 * n(2.3, 4))); w.camera.rotateY(0.004 * (n(0.7, 2) + 0.6 * n(1.9, 5))); w.camera.rotateZ(0.0025 * n(0.5, 3)); w.camera.updateMatrixWorld(true);
    // depth of field focused on what the camera looks at; dust drifting in the light; trees swaying; character tint from the scene's light
    M3_FOCUS = w.camera.position.distanceTo(tgt); const wp = new THREE.Vector3();
    for (const s of M3_SPRITES) { let root: THREE.Object3D = s.g; while (root.parent) root = root.parent; if (root !== w.scene || !s.g.parent!.visible) continue; s.mesh.getWorldPosition(wp); M3_FOCUS = Math.max(M3_FOCUS, w.camera.position.distanceTo(wp)); }
    if (M3_FOCUS_OVR > 0) M3_FOCUS = M3_FOCUS_OVR;
    dust.pose(t, tgt, Math.max(8, w.camera.position.distanceTo(tgt)));
    for (const tr of M3_TREES) if (tr.parent && tr.parent.parent === w.scene || tr.parent === w.scene) { tr.rotation.z = 0.025 * Math.sin(t * 1.1 + tr.position.x * 0.7); tr.rotation.x = 0.015 * Math.sin(t * 0.8 + tr.position.z); }
    for (const s of M3_SPRITES) (s.mesh.material as THREE.MeshBasicMaterial).color.copy(tint);
    // the 2D characters are paper cut-outs: turn each one of this scene to face the camera (keeping its own roll)
    const qc = w.camera.quaternion, qg = new THREE.Quaternion(), rz = new THREE.Quaternion(), Z = new THREE.Vector3(0, 0, 1);
    for (const s of M3_SPRITES) {
      let root: THREE.Object3D = s.g; while (root.parent) root = root.parent; if (root !== w.scene) continue;
      const ch = s.g.parent!; ch.updateMatrixWorld(true); ch.getWorldQuaternion(qg); const up = new THREE.Vector3(0, 1, 0).applyQuaternion(qg), cr = new THREE.Vector3(1, 0, 0).applyQuaternion(qc), cu = new THREE.Vector3(0, 1, 0).applyQuaternion(qc); rz.setFromAxisAngle(Z, Math.atan2(-up.dot(cr), up.dot(cu)));
      s.g.quaternion.copy(qg.invert().multiply(qc.clone().multiply(rz)));
    }
  };
}; }
