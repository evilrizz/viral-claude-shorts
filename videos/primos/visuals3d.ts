// the camera: a short dolly-in at the cut and a little punch (lens) on the given key times
const q3Cam = (w: World, pos: Vec3, target: Vec3, t: number, fov = 40, punches: number[] = []) => {
  const k = 1 + 0.18 * Math.exp(-(t - w.s.t0) * 5), p = punches.reduce((a, x) => a + (t > x ? Math.exp(-(t - x) * 7) : 0), 0);
  w.look([target[0] + (pos[0] - target[0]) * k, target[1] + (pos[1] - target[1]) * k, target[2] + (pos[2] - target[2]) * k], target, fov * (1 - 0.06 * p));
};
// a character that stays in a corner of the frame (presenter), whatever the camera does
const q3Corner = (w: World, o: THREE.Object3D, side = -1, s = 0.36, dist = 4.6, down = 1.1, across = 0.64) => {
  const cam = w.camera; cam.updateMatrixWorld(); const f = new THREE.Vector3(), r = new THREE.Vector3(), u = new THREE.Vector3();
  cam.getWorldDirection(f); r.crossVectors(f, cam.up).normalize(); u.crossVectors(r, f).normalize();
  o.position.copy(cam.position).addScaledVector(f, dist).addScaledVector(r, side * across).addScaledVector(u, -down);
  o.scale.setScalar(s); o.lookAt(cam.position.x, o.position.y, cam.position.z);
};
// a paper chip with a piece's name (HTML over the 3D), from t for d seconds
const q3Tag = (w: World, text: string, t: number, d = 1.5, y = 560) => {
  const e = document.createElement('div'); e.textContent = text;
  e.style.cssText = `position:absolute;left:540px;top:${y}px;transform:translateX(-50%);background:#f2efe6;color:#14161d;font:900 46px var(--font);letter-spacing:1px;padding:12px 30px 12px 40px;border-left:16px solid #ff6a3d;box-shadow:0 10px 0 rgba(0,0,0,.25);white-space:nowrap;opacity:0`;
  w.titles.appendChild(e);
  w.tl.fromTo(e, { opacity: 0, y: -30, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(2)' }, t).to(e, { opacity: 0, duration: 0.25 }, t + d);
};
const q3Html = (w: World, html: string, css: string) => { const e = document.createElement('div'); e.innerHTML = html; e.style.cssText = `position:absolute;${css}`; w.titles.appendChild(e); return e; };
// smoke puffs (grey balls that grow and fade) at p, from t
const q3Puffs = (w: World, p: Vec3, n = 4) => { const m = new THREE.MeshStandardMaterial({ color: '#8d9099', roughness: 1, transparent: true }); const b = [...Array(n)].map((_, i) => w.add(q3Sph(0.3 + i * 0.08, m, [p[0] - i * 0.3, p[1] + i * 0.2, p[2]]))); return (t: number, t0: number) => b.forEach((s, i) => { const u = t - t0 - i * 0.12; s.visible = u > 0 && u < 1.4; s.scale.setScalar(0.4 + u * 1.2); s.position.y = p[1] + i * 0.2 + u * 0.8; m.opacity = p3Clamp(1 - u / 1.4); }); };

// ---------------- shared stagings
const qCam = (w: World, t: number, pos: Vec3, tg: Vec3, punches: number[] = [], fov = 40) => q3Cam(w, pos, tg, t, fov, punches);
const qTico = (w: World, tk: ReturnType<typeof q3Tico>, t: number, side = -1, s = 0.31) => { q3Corner(w, tk, side, s, 4.6, 1.22, 0.72); tk.live(t); };
const qdots = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
// a big lime number with a small caption under it (counters); set .set(text) every frame
const qNum = (w: World, x: number, y: number, cap: string) => { const e = q3Html(w, `<div class="n" style="font:700 78px monospace;color:#d4ff3a;text-shadow:0 5px 0 rgba(0,0,0,.45)">0</div><div style="font:700 26px monospace;color:#d4ff3a;letter-spacing:3px">${cap}</div>`, `left:${x}px;top:${y}px;transform:translateX(-50%);text-align:center;white-space:nowrap;opacity:0`); return Object.assign(e, { set(txt: string, op = 1) { (e.querySelector('.n') as HTMLElement).textContent = txt; e.style.opacity = String(op); } }); };
// a lime chip label (like ÁFRICA, OTRA ESPECIE) that pops at t
const qChip = (w: World, text: string, t: number, x: number, y: number, d = 99) => { const e = q3Html(w, text, `left:${x}px;top:${y}px;transform:translateX(-50%);background:#d4ff3a;color:#14161d;font:900 44px var(--font);padding:6px 22px;border:5px solid #14161d;white-space:nowrap;opacity:0`); w.tl.fromTo(e, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.5)' }, t); if (d < 99) w.tl.to(e, { opacity: 0, duration: 0.25 }, t + d); return e; };
// a small caption under a figure (TÚ, TU PRIMO, CHIMPANCÉ)
const qCap = (w: World, text: string, x: number, y: number, t = 0) => { const e = q3Html(w, text, `left:${x}px;top:${y}px;transform:translateX(-50%);font:700 30px monospace;color:#2b2f3a;letter-spacing:3px;white-space:nowrap;opacity:0`); w.tl.to(e, { opacity: 1, duration: 0.3 }, Math.max(0, t)); return e; };
// a frame with a portrait (the head of a figure) at p
const qPortrait = (w: World, kind: Q3FigKind, p: Vec3, r = 0.75) => { const fr = w.add(q3Frame(r)); fr.position.set(...p); const f = w.add(q3Fig(kind)); const s = r * 1.9; f.scale.setScalar(s); f.position.set(p[0], p[1] - 1.78 * s, p[2] + 0.06); return { fr, f, s }; };
// a "?" plate (in a frame, for the unknown grandpa)
const qQ = () => { const m = new THREE.Mesh(new THREE.CircleGeometry(0.62, 40), new THREE.MeshBasicMaterial({ map: p3Paint(128, 128, (c) => { c.fillStyle = '#23263a'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#d4ff3a'; c.font = '900 96px Inter, Arial'; c.textAlign = 'center'; c.fillText('?', 64, 98); }), toneMapped: false })); return m; };
const qsp = (t: number, k: number) => p3Spring(t, k);
const qPop = (o: THREE.Object3D, t: number, k: number, s = 1) => { const v = qsp(t, k); o.visible = t > k - 0.02; o.scale.setScalar(Math.max(0.001, v * s)); };

// the evolution stairs scene (hook, guapo, idiota, nunca) with Dota on the first step, a gorilla, a human
const qStairsScene = (w: World) => {
  q3Studio(w); const st = w.add(q3Stairs()); st.position.set(0.3, 0, -0.3); const d = w.add(q3Dota()); d.setPose('up'); const go = w.add(q3Fig('gorila')), hu = w.add(q3Fig('tu')); const tk = w.add(q3Tico()); tk.setPose('point');
  const put = (o: THREE.Object3D, i: number, fall: number) => { const tp = st.tops[i]; const v = p3Clamp(fall * 1.4 - i * 0.2); o.position.set(0.3 + tp.x + v * (0.8 + i * 0.3), tp.y * (1 - v * v * 0.9) - (v > 0 ? v * v * 0.3 : 0), -0.1); o.rotation.z = -v * (1.1 + i * 0.2); };
  return { st, d, go, hu, tk, pose(t: number, fall = 0) { st.fall(fall); put(d, 0, fall); put(go, 1, fall); put(hu, 2, fall); go.live(t, { mood: fall > 0.1 ? 'shock' : 'ok' }); hu.live(t, { mood: fall > 0.1 ? 'shock' : 'happy', arms: fall > 0.1 ? 'up' : 'down' }); } };
};
const qStairsCam = (w: World, t: number, punches: number[] = [], z = 0) => qCam(w, t, [0.6 - z * 1.6, 3.0 - z * 0.6, 12 - z * 5.5], [0.3 - z * 1.0, 2.6 - z * 1.0, 0], punches);
// the two branches from the ancestor (ramas … tampoco)
const qBranches = (w: World, len = 1) => { const b = w.add(q3Branch([0, 2.1, -0.2], [-1.55 * len, 2.1 + 1.75 * len, -0.2], QC.blue)), r = w.add(q3Branch([0, 2.1, -0.2], [1.55 * len, 2.1 + 1.75 * len, -0.2], QC.red)); return { b, r }; };
const qTreeCam = (w: World, t: number, punches: number[] = []) => qCam(w, t, [0.4, 3.5, 13.5], [0.3, 3.3, 0], punches);

defineVisuals({
  hook: {
    build(w) { const S = qStairsScene(w); return (t) => { qStairsCam(w, t, [w.K('ch'), w.K('dota')]); S.pose(t); S.d.live(t); qTico(w, S.tk, t, 1); }; },
  },
  guapo: {
    build(w) { const S = qStairsScene(w); return (t) => { const k = w.K('pose'); qStairsCam(w, t, [k], p3Smoothstep(0, 1, p3Clamp((t - w.s.t0) / 1.2)) * 0.5); S.pose(t); S.d.force(t > k - 0.4 ? 'pose' : null); S.d.live(t); qTico(w, S.tk, t, 1); }; },
  },
  idiota: {
    build(w) { const S = qStairsScene(w); return (t) => { const k = w.K('palm'); qStairsCam(w, t, [k]); S.pose(t); S.d.crazy(t > k + 0.1); S.d.live(t); S.tk.setPose(t > k ? 'palm' : 'point', k, 'point'); qTico(w, S.tk, t, 1); }; },
  },
  nunca: {
    build(w) { const S = qStairsScene(w); return (t) => { const k = w.K('break'); qStairsCam(w, t, [k]); const f = p3Clamp((t - k) / 1.1); S.pose(t, f); S.d.crazy(f > 0.2); S.d.dizzy(t, f > 0.6); S.d.live(t); qTico(w, S.tk, t, 1); }; },
  },
  promesa: {
    build(w) {
      q3Studio(w); const fr = w.add(q3Frame(0.9)); fr.position.set(0.6, 2.95, 0); const q = w.add(qQ()); q.position.set(0.6, 2.95, 0.03); q.scale.setScalar(1.4); const tk = w.add(q3Tico()); tk.position.set(-0.9, 0, 0.6); tk.force('point');
      return (t) => { const k = w.K('cara'); qCam(w, t, [0.2, 2.6, 9.5], [0, 2.3, 0], [k]); fr.scale.setScalar(1 + 0.15 * Math.exp(-Math.max(0, t - k) * 3) * (t > k ? 1 : 0)); fr.rotation.y = 0.15 * Math.sin(t * 1.2); q.rotation.y = fr.rotation.y; tk.live(t); };
    },
  },
  primo: {
    build(w) {
      q3Studio(w); const pr = w.add(q3Fig('primo')), tu = w.add(q3Fig('tu')); pr.position.set(-0.4, 0, 0); tu.position.set(1.42, 0, 0); const ar = w.add(q3Arrow(1.0, QC.blue)); ar.position.set(0.12, 1.35, 0.3); const x = w.add(q3Cross(0.6)); x.position.set(0.6, 1.35, 0.4); const tk = w.add(q3Tico()); tk.setPose('point');
      qCap(w, 'TU PRIMO', 430, 1430, w.s.t0 + 0.2); qCap(w, 'TÚ', 760, 1430, w.s.t0 + 0.2);
      return (t) => { const a = w.K('primo'), n = w.K('no'); qCam(w, t, [0.65, 1.9, 8.6], [0.6, 1.55, 0], [a, n]); pr.live(t, {}); tu.live(t, { look: -1 }); qPop(ar, t, a); qPop(x, t, n); x.rotation.z = 0.1 * Math.sin(t * 6); qTico(w, tk, t); };
    },
  },
  mismo: {
    build(w) {
      q3Studio(w); const pr = w.add(q3Fig('primo')), tu = w.add(q3Fig('tu')); pr.position.set(-0.4, 0, 0); tu.position.set(1.42, 0, 0); const P = qPortrait(w, 'abuelito', [0.5, 3.7, 0], 0.7); const ln = w.add(q3FamLines(1.82, 1.0)); ln.position.set(0.5, 3.0, 0); const tk = w.add(q3Tico()); tk.setPose('point');
      return (t) => { const k = w.K('ab'); qCam(w, t, [0.65, 3.0, 10.5], [0.6, 2.75, 0], [k]); pr.live(t, { look: 1 }); tu.live(t, { look: -1 }); const v = qsp(t, k - 0.3); P.fr.scale.setScalar(v + 0.001); P.f.visible = v > 0.3; P.f.live(t, { portrait: true, mood: 'happy' }); ln.scale.set(1, Math.max(0.001, p3Clamp((t - k) / 0.4)), 1); qTico(w, tk, t); };
    },
  },
  igual: {
    build(w) {
      q3Studio(w); const pr = w.add(q3Fig('primo')), ch = w.add(q3Fig('chimp')), tu = w.add(q3Fig('tu')); for (const o of [pr, ch]) o.position.set(-0.4, 0, 0); tu.position.set(1.42, 0, 0); const P = qPortrait(w, 'abuelito', [0.5, 3.7, 0], 0.7); const ln = w.add(q3FamLines(1.82, 1.0)); ln.position.set(0.5, 3.0, 0); const tk = w.add(q3Tico()); tk.setPose('point');
      qCap(w, 'CHIMPANCÉ', 440, 1470, w.K('ch')); qCap(w, 'TÚ', 760, 1470, w.s.t0);
      return (t) => { const k = w.K('ch'); qCam(w, t, [0.65, 3.0, 10.5], [0.6, 2.75, 0], [k]); const s = p3Clamp((t - k) / 0.25); pr.scale.setScalar(Math.max(0.001, 1 - s)); pr.visible = s < 1; ch.scale.setScalar(Math.max(0.001, 0.95 * qsp(t, k + 0.1))); ch.visible = t > k; pr.live(t, {}); ch.live(t, { mood: 'happy' }); tu.live(t, { look: -1 }); P.f.live(t, { portrait: true, mood: 'happy' }); qTico(w, tk, t); };
    },
  },
  hace: {
    build(w) {
      q3Studio(w); const ch = w.add(q3Fig('chimp')), tu = w.add(q3Fig('tu')); ch.position.set(-0.4, 0, 0); tu.position.set(1.42, 0, 0); const P = qPortrait(w, 'abuelito', [0.5, 3.7, 0], 0.7), A = w.add(q3Fig('abuelo')); A.scale.setScalar(P.s); A.position.copy(P.f.position); const ln = w.add(q3FamLines(1.82, 1.0)); ln.position.set(0.5, 3.0, 0); const tk = w.add(q3Tico()); tk.setPose('point');
      const num = qNum(w, 850, 760, 'AÑOS ATRÁS'); qChip(w, 'ÁFRICA', w.K('africa'), 290, 640);
      return (t) => {
        const s7 = w.K('siete'), ab = w.K('ab'); qCam(w, t, [0.65, 3.0, 10.5], [0.6, 2.75, 0], [s7, ab]); ch.live(t, { look: 1 }); tu.live(t, { look: -1 });
        num.set(qdots(7000000 * p3Smoothstep(0, 1, p3Clamp((t - w.s.t0) / (s7 + 0.6 - w.s.t0)))), 1);
        const sw = t > ab; P.f.visible = !sw; A.visible = sw; P.f.live(t, { portrait: true }); A.live(t, { portrait: true }); P.fr.scale.setScalar(1 + (sw ? 0.2 * Math.exp(-(t - ab) * 4) : 0)); qTico(w, tk, t);
      };
    },
  },
  ramas: {
    build(w) {
      q3Studio(w); const A = w.add(q3Fig('abuelo')); A.position.set(0, 0, -0.2); const B = qBranches(w); const tk = w.add(q3Tico()); tk.setPose('point');
      return (t) => { const k = w.K('split'); qTreeCam(w, t, [k]); A.live(t, { arms: 'up', mood: 'happy' }); const g = p3Smoothstep(0, 1, p3Clamp((t - k + 0.2) / 0.8)); B.b.grow(g); B.r.grow(g); qTico(w, tk, t); };
    },
  },
  una: {
    build(w) {
      q3Studio(w); const A = w.add(q3Fig('abuelo')); A.position.set(0, 0, -0.2); const B = qBranches(w); const ch = w.add(q3Fig('chimp')); ch.position.set(-1.55, 3.85, -0.2); const tk = w.add(q3Tico()); tk.setPose('point');
      return (t) => { const k = w.K('ch'); qTreeCam(w, t, [k]); A.live(t, { arms: 'up' }); B.b.grow(1); B.r.grow(1); ch.scale.setScalar(Math.max(0.001, 0.68 * qsp(t, k - 0.2))); ch.live(t, { mood: 'happy' }); qTico(w, tk, t); };
    },
  },
  otra: {
    build(w) {
      q3Studio(w); const A = w.add(q3Fig('abuelo')); A.position.set(0, 0, -0.2); const B = qBranches(w); const ch = w.add(q3Fig('chimp')); ch.position.set(-1.55, 3.85, -0.2); ch.scale.setScalar(0.68); const tu = w.add(q3Fig('tu')); tu.position.set(1.55, 3.85, -0.2); const tk = w.add(q3Tico()); tk.setPose('point');
      const num = qNum(w, 800, 1120, 'GENERACIONES');
      return (t) => { const g = w.K('gen'), k = w.K('ti'); qTreeCam(w, t, [g, k]); A.live(t, { arms: 'up' }); B.b.grow(1); B.r.grow(1); ch.live(t, {}); num.set(qdots(280000 * p3Smoothstep(0, 1, p3Clamp((t - w.s.t0) / (k + 0.4 - w.s.t0)))), 1); tu.scale.setScalar(Math.max(0.001, 0.68 * qsp(t, k - 0.2))); tu.live(t, { mood: 'happy', arms: 'wave' }); qTico(w, tk, t); };
    },
  },
  otraesp: {
    build(w) {
      q3Studio(w); const A = w.add(q3Fig('abuelo')); A.position.set(0.25, 0, -0.4); A.scale.setScalar(1.45); const ch = w.add(q3Fig('chimp')), tu = w.add(q3Fig('tu')); ch.position.set(-0.6, 0, 0.6); ch.scale.setScalar(0.7); tu.position.set(1.5, 0, 0.6); tu.scale.setScalar(0.7);
      const xs = [w.add(q3Cross(0.7)), w.add(q3Cross(0.7))]; xs[0].position.set(-0.6, 0.85, 0.9); xs[1].position.set(1.5, 0.85, 0.9); const tk = w.add(q3Tico()); tk.setPose('point'); qChip(w, 'OTRA ESPECIE', w.K('esp'), 600, 1460);
      return (t) => { const k = w.K('x'); qCam(w, t, [0.6, 2.3, 9.9], [0.55, 1.95, 0], [k, w.K('esp')]); A.live(t, { mood: 'happy' }); ch.live(t, { look: 1 }); tu.live(t, { look: -1 }); xs.forEach((x, i) => qPop(x, t, k + i * 0.15)); qTico(w, tk, t); };
    },
  },
  existe: {
    build(w) {
      q3Studio(w); const A = w.add(q3Fig('abuelo')); A.position.set(0.25, 0, -0.4); A.scale.setScalar(1.45); const ring = new THREE.Group(); for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; ring.add(q3BoxM(0.18, 0.05, 0.05, q3Mat('#c9c2ff', 0.5), [Math.cos(a) * 1.6, Math.sin(a) * 1.6, 0], [0, 0, a + Math.PI / 2])); } w.add(ring); ring.position.set(0.25, 1.7, 0); const tk = w.add(q3Tico()); tk.setPose('point');
      return (t) => { const k = w.K('fade'); qCam(w, t, [0.6, 2.3, 9.9], [0.55, 1.95, 0]); const f = p3Clamp((t - k + 0.5) / 0.6); A.live(t, { alpha: 1 - 0.75 * f, mood: 'ok' }); ring.visible = f > 0.1; ring.rotation.z = t * 0.3; ring.scale.setScalar(0.8 + 0.2 * f); qTico(w, tk, t); };
    },
  },
  esperando: {
    build(w) {
      q3Studio(w); const A = w.add(q3Fig('abuelo')); A.position.set(0, 0, -0.2); const B = qBranches(w); const ch = w.add(q3Fig('chimp')); ch.position.set(-1.55, 3.85, -0.2); ch.scale.setScalar(0.68); const tu = w.add(q3Fig('tu')); tu.position.set(1.55, 3.85, -0.2); tu.scale.setScalar(0.68);
      const d = w.add(q3Dota()); d.position.set(-0.75, 2.95, 0.1); d.scale.setScalar(0.65); d.setPose('down'); const ck = w.add(q3Clock()); ck.position.set(-0.05, 3.55, 0.3); ck.scale.setScalar(0.6);
      return (t) => { qTreeCam(w, t, [w.K('dota')]); A.live(t, { alpha: 0.35 }); B.b.grow(1); B.r.grow(1); ch.live(t, {}); tu.live(t, {}); d.live(t); ck.tick(t); ck.rotation.z = 0.1 * Math.sin(t * 2); };
    },
  },
  tampoco: {
    build(w) {
      q3Studio(w); const A = w.add(q3Fig('abuelo')); A.position.set(0, 0, -0.2); const B = qBranches(w, 1.15); const ch = w.add(q3Fig('chimp')), tu = w.add(q3Fig('tu')); ch.scale.setScalar(0.62); tu.scale.setScalar(0.62); const tk = w.add(q3Tico()); tk.setPose('point');
      const l1 = qNum(w, 260, 980, 'AÑOS'), l2 = qNum(w, 820, 980, 'AÑOS');
      return (t) => {
        const k = w.K('siete'), g = 0.87 + 0.13 * p3Smoothstep(0, 1, p3Clamp((t - w.s.t0) / (w.s.t1 - w.s.t0))); qCam(w, t, [0.4, 3.6, 14.5], [0.3, 3.4, 0], [k]); A.live(t, { alpha: 0.35 }); B.b.grow(g); B.r.grow(g);
        const pb = B.b.tip.getPoint(g), pr = B.r.tip.getPoint(g); ch.position.set(pb.x, pb.y, -0.2); tu.position.set(pr.x, pr.y, -0.2); ch.live(t, {}); tu.live(t, {});
        const v = qdots(7000000 * p3Clamp((t - k + 0.3) / 0.6)); l1.set(v, t > k - 0.3 ? 1 : 0); l2.set(v, t > k - 0.3 ? 1 : 0); qTico(w, tk, t);
      };
    },
  },
  prueba: {
    bg: '#121318',
    build(w) {
      q3Studio(w); const h = w.add(q3Helix()); h.position.set(0.3, 2.6, 0); const tk = w.add(q3Tico()); tk.setPose('point');
      return (t) => { const k = w.K('adn'); qCam(w, t, [0.3, 2.6, 8.5], [0.3, 2.5, 0], [k]); h.rotation.y = t * 0.9; h.scale.setScalar(qsp(t, w.s.t0 + 0.05) * (1 + 0.1 * Math.exp(-Math.max(0, t - k) * 4) * (t > k ? 1 : 0)) + 0.001); qTico(w, tk, t); };
    },
  },
  genoma: {
    bg: '#121318',
    build(w) {
      q3Studio(w); const h = w.add(q3Helix()); h.position.set(-0.9, 2.6, -0.4); const card = w.add(q3Fact('Genoma del chimpancé', 'Consorcio internacional', 'Nature · 2005', 2.4, 0.9)); card.position.set(0.5, 3.15, 0.5); card.scale.setScalar(0.82);
      const A = 'TCCGGCGA', rowA = [...A].map((L) => w.add(q3Tile(L))), rowB = [...A].map((L) => w.add(q3Tile(L))); const tk = w.add(q3Tico()); tk.setPose('point');
      return (t) => {
        const y = w.K('year'), s = w.K('strip'); qCam(w, t, [0.3, 2.6, 8.5], [0.3, 2.5, 0], [y, s]); h.rotation.y = t * 0.9; qPop(card, t, y); card.rotation.y = 0.1 * Math.sin(t);
        rowA.forEach((m, i) => { const u = p3Clamp((t - s - i * 0.04) / 0.4); m.position.set(-1.3 + i * 0.46 - (1 - u) * 3, 1.85, 0.8); m.visible = u > 0; }); rowB.forEach((m, i) => { const u = p3Clamp((t - s - 0.5 - i * 0.04) / 0.4); m.position.set(-1.3 + i * 0.46 + (1 - u) * 3, 1.3, 0.8); m.visible = u > 0; }); qTico(w, tk, t);
      };
    },
  },
  letras: {
    bg: '#121318',
    build(w) {
      q3Studio(w); const A = 'CCGGCGAT', B = 'CCAGCGAT', rowA = [...A].map((L) => w.add(q3Tile(L))), rowB = [...B].map((L, i) => w.add(q3Tile(L, i === 2))); qCap(w, 'CHIMPANCÉ', 330, 700, 0); qCap(w, 'TÚ', 330, 1150, 0); const tk = w.add(q3Tico()); tk.setPose('point');
      return (t) => { const k = w.K('diff'); qCam(w, t, [0.5, 2.3, 10], [0.45, 2.1, 0], [k]); rowA.forEach((m, i) => m.position.set(-1.25 + i * 0.46, 2.55, 0.3)); rowB.forEach((m, i) => { m.position.set(-1.25 + i * 0.46, 1.95, 0.3); const hot = i === 2; m.scale.setScalar(hot ? 1 + 0.4 * qsp(t, k) : 1); m.position.z = hot ? 0.3 + 0.3 * qsp(t, k) : 0.3; }); qTico(w, tk, t); };
    },
  },
  cien: {
    bg: '#1c3fb0',
    build(w) {
      q3Studio(w, '#ece6d6', '#1c3fb0'); const L = 'ACGT'; const tiles = [...Array(100)].map((_, i) => { const m = w.add(i === 57 ? q3Tile('G', true) : q3Tile(L[(i * 7 + (i >> 3)) % 4])); m.position.set(-1.8 + (i % 10) * 0.46, 4.3 - Math.floor(i / 10) * 0.46, 0); return m; }); const lbl = qNum(w, 560, 1440, '');
      const tk = w.add(q3Tico()); tk.setPose('point');
      return (t) => { const u = w.K('uno'), c = w.K('cien'); qCam(w, t, [0.3, 2.4, 13], [0.27, 2.2, 0], [u, c]); tiles.forEach((m, i) => { const a = p3Clamp((t - w.s.t0 - i * 0.012) / 0.25); m.scale.setScalar(Math.max(0.001, a * (i === 57 ? 1 + 0.5 * qsp(t, u) - 0.5 * (t > u ? 0 : 0) : 1))); m.position.z = i === 57 ? 0.5 * qsp(t, u) : 0; }); lbl.set('1 DE CADA 100', t > c - 0.2 ? 1 : 0); qTico(w, tk, t); };
    },
  },
  gemelos: {
    build(w) {
      q3Studio(w); const d = w.add(q3Dota()), ch = w.add(q3Fig('chimp')); d.position.set(-0.5, 0, 0.3); d.setPose('up'); ch.position.set(0.85, 0, 0); ch.scale.setScalar(0.85);
      return (t) => { qCam(w, t, [0.3, 1.8, 7.5], [0.2, 1.5, 0], [w.K('dota')]); d.live(t); ch.live(t, { mood: 'happy', arms: 'up', look: -1 }); };
    },
  },
  raro: {
    bg: '#121318',
    build(w) {
      q3Studio(w); const mk = (n: number, col: string, y0: number) => [...Array(n)].map((_, i) => { const c = w.add(q3Chromo(col, 0.5, false, true)); c.scale.setScalar(0.55); c.position.set(-1.7 + (i % 8) * 0.48, y0 - Math.floor(i / 8) * 0.62, 0); return c; });
      const B = mk(24, QC.blue, 5.1), R = mk(23, QC.red, 2.9); const gap = w.add(q3BoxM(0.42, 0.52, 0.05, new THREE.MeshBasicMaterial({ color: '#d4ff3a', wireframe: true }), [-1.7 + 7 * 0.48, 2.9 - 2 * 0.62, 0])); const tk = w.add(q3Tico()); tk.setPose('point');
      const n1 = qNum(w, 900, 600, 'PARES'), n2 = qNum(w, 900, 1100, 'PARES'); qCap(w, 'CHIMPANCÉ', 330, 600, 0); qCap(w, 'TÚ', 330, 1090, w.K('v24'));
      return (t) => { const a = w.K('v24'), b = w.K('v23'); qCam(w, t, [0.3, 3.5, 11.5], [0.1, 3.75, 0], [a, b]); B.forEach((c, i) => { c.scale.setScalar(0.55 * p3Clamp((t - w.s.t0 - i * 0.04) / 0.2) + 0.001); c.rotation.z = 0.05 * Math.sin(t * 2 + i); }); R.forEach((c, i) => { c.scale.setScalar(0.55 * p3Clamp((t - a - i * 0.04) / 0.2) + 0.001); c.rotation.z = 0.05 * Math.sin(t * 2 + i); }); n1.set('24', t > a - 0.3 ? 1 : 0); n2.set('23', t > b - 0.3 ? 1 : 0); gap.visible = t > b; qTico(w, tk, t); };
    },
  },
  falta: {
    bg: '#121318',
    build(w) {
      q3Studio(w); const R = [...Array(23)].map((_, i) => { const c = w.add(q3Chromo(QC.red, 0.5, false, true)); c.scale.setScalar(0.55); c.position.set(-1.7 + (i % 8) * 0.48, 2.9 - Math.floor(i / 8) * 0.62, 0); return c; }); const gp: Vec3 = [-1.7 + 7 * 0.48, 2.9 - 2 * 0.62, 0.1];
      const gap = w.add(q3BoxM(0.42, 0.52, 0.05, new THREE.MeshBasicMaterial({ color: '#d4ff3a', wireframe: true }), gp)); const q = w.add(qQ()); q.position.set(gp[0], gp[1], 0.15); q.scale.setScalar(0.35); const tk = w.add(q3Tico()); tk.setPose('point');
      return (t) => { const k = w.K('q'); qCam(w, t, [1.0, 2.1, 5.2], [1.0, 1.95, 0], [k]); R.forEach((c, i) => (c.rotation.z = 0.05 * Math.sin(t * 2 + i))); const p = 1 + 0.25 * Math.abs(Math.sin(t * 5)); gap.scale.setScalar(p); q.scale.setScalar(0.35 * p); qTico(w, tk, t); };
    },
  },
  dentro: {
    bg: '#121318',
    build(w) {
      q3Studio(w); const R = [...Array(23)].map((_, i) => { const c = w.add(q3Chromo(QC.red, 0.5, i === 1, true)); c.scale.setScalar(0.55); c.position.set(-1.7 + (i % 8) * 0.48, 2.9 - Math.floor(i / 8) * 0.62, 0); return c; }); const ring = w.add(new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.025, 12, 48), q3Gloss(QC.lime, 0.3))); ring.position.set(-1.7 + 0.48, 2.9, 0.15); const tk = w.add(q3Tico()); tk.setPose('point');
      return (t) => { const k = w.K('c2'), z = p3Smoothstep(0, 1, p3Clamp((t - k + 0.3) / 0.8)); qCam(w, t, [p3Lerp(0.6, -1.22, z), p3Lerp(2.4, 2.9, z), p3Lerp(6, 2.6, z)], [p3Lerp(0.6, -1.22, z), p3Lerp(2.1, 2.9, z), 0], [k]); Q3_FOCUS_OVR = z > 0 ? p3Lerp(6, 2.6, z) : -1; Q3_BOTH = z; qPop(ring, t, k); R.forEach((c, i) => (c.rotation.z = 0.05 * Math.sin(t * 2 + i))); qTico(w, tk, t); };
    },
  },
  tapita: {
    bg: '#121318',
    build(w) {
      q3Studio(w); const c = w.add(q3Chromo(QC.red, 1.7)); c.position.set(-0.3, 2.4, 0); const lace = w.add(q3Lace()); lace.position.set(1.3, 2.4, 0.2); lace.scale.setScalar(0.8); const rings = [-1, 1].map((e) => { const r = w.add(new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.03, 12, 48), q3Gloss(QC.lime, 0.3))); r.position.set(-0.3, 2.4 + e * 0.96, 0.3); return r; }); const tk = w.add(q3Tico()); tk.setPose('point');
      return (t) => { const a = w.K('tap'), l = w.K('lace'); qCam(w, t, [0.4, 2.7, 8], [0.45, 2.6, 0], [a, l]); c.rotation.y = 0.3 * Math.sin(t * 0.8); rings.forEach((r) => qPop(r, t, a)); lace.scale.setScalar(Math.max(0.001, 0.8 * qsp(t, l - 0.3))); lace.rotation.z = 0.1 * Math.sin(t * 1.5); qTico(w, tk, t); };
    },
  },
  mitad: {
    bg: '#121318',
    build(w) {
      q3Studio(w); const c = w.add(q3Chromo(QC.red, 1.9, true)); c.position.set(-0.2, 2.4, 0); const lens = w.add(q3Lens(0.75)); const tk = w.add(q3Tico()); tk.setPose('point'); const band = new THREE.PointLight('#e8ff3a', 0, 3); band.position.set(-0.2, 2.42, 0.8); w.add(band);
      return (t) => { const m = w.K('mid'), p = w.K('peg'); qCam(w, t, [0.4, 2.7, 8], [0.4, 2.6, 0], [m, p]); const u = p3Smoothstep(0, 1, p3Clamp((t - m + 0.3) / 0.7)); lens.position.set(p3Lerp(2.0, -0.2, u), p3Lerp(3.8, 2.42, u), 0.5); lens.scale.setScalar(0.9); band.intensity = t > p ? 6 * (0.6 + 0.4 * Math.sin(t * 8)) : 0; c.rotation.y = 0.15 * Math.sin(t * 0.8); qTico(w, tk, t); };
    },
  },
  fundieron: {
    bg: '#121318',
    build(w) {
      q3Studio(w); const a = w.add(q3Chromo(QC.purple, 0.85)), b = w.add(q3Chromo(QC.purple, 0.85)), f = w.add(q3Chromo(QC.red, 1.9, true)); f.position.set(0.3, 2.4, 0); const fl = new THREE.PointLight('#ffffff', 0, 6); fl.position.set(0.3, 2.6, 1); w.add(fl);
      qCap(w, 'DEL ABUELO', 760, 760, w.s.t0 + 0.3); const tk = w.add(q3Tico()); tk.setPose('point');
      return (t) => { const k = w.K('fuse'), u = p3Smoothstep(0, 1, p3Clamp((t - k + 0.8) / 0.8)); qCam(w, t, [0.4, 2.7, 8], [0.4, 2.6, 0], [k]); a.position.set(0.3, p3Lerp(3.7, 2.95, u), 0); b.position.set(0.3, p3Lerp(1.1, 1.85, u), 0); a.visible = b.visible = t < k; f.visible = t >= k; f.scale.setScalar(1 + 0.15 * (t > k ? Math.exp(-(t - k) * 5) : 0)); fl.intensity = t > k ? 30 * Math.exp(-(t - k) * 4) : 0; qTico(w, tk, t); };
    },
  },
  darwin: {
    bg: '#efe9dc',
    build(w) {
      q3PaperSet(w); const dw = w.add(q3Fig('darwin')); dw.position.set(-0.4, 0, 0); const card = w.add(q3Fact('Charles Darwin', 'El origen del hombre', '1871', 2.2, 0.8)); card.position.set(1.0, 2.9, 0.5); card.scale.setScalar(0.8); const tk = w.add(q3Tico()); tk.setPose('point');
      return (t) => { const k = w.K('yr'); qCam(w, t, [0.3, 2.2, 8], [0.3, 2.0, 0], [k]); dw.live(t, { arms: 'book' }); qPop(card, t, k); qTico(w, tk, t, 1); };
    },
  },
  ningun: {
    bg: '#efe9dc',
    build(w) {
      q3PaperSet(w); const dw = w.add(q3Fig('darwin')); dw.position.set(-0.55, 0, 0); const P = [qPortrait(w, 'abuelo', [1.0, 3.25, 0], 0.42), qPortrait(w, 'gorila', [1.0, 2.15, 0], 0.42), qPortrait(w, 'chimp', [1.0, 1.05, 0], 0.42)];
      const neq = [2.7, 1.6].map((y) => { const g = new THREE.Group(); const m = q3Gloss('#ff3b2b', 0.3); g.add(q3BoxM(0.36, 0.07, 0.06, m, [0, 0.08, 0]), q3BoxM(0.36, 0.07, 0.06, m, [0, -0.08, 0]), q3BoxM(0.07, 0.42, 0.06, m, [0, 0, 0], [0, 0, -0.5])); g.position.set(1.0, y, 0.1); w.add(g); return g; });
      return (t) => { const k = w.K('ne'); qCam(w, t, [0.3, 2.5, 8.5], [0.2, 2.3, 0], [k]); dw.live(t, { arms: 'book', mood: 'shock' }); P.forEach((p, i) => { p.fr.scale.setScalar(qsp(t, w.s.t0 + i * 0.25) + 0.001); p.f.visible = t > w.s.t0 + i * 0.25 + 0.1; p.f.live(t, { portrait: true }); }); neq.forEach((n) => qPop(n, t, k)); };
    },
  },
  revista: {
    bg: '#efe9dc',
    build(w) { q3PaperSet(w); const mg = w.add(q3Magazine()); mg.position.set(0.3, 2.4, 0.2); const tk = w.add(q3Tico()); tk.setPose('point'); return (t) => { const k = w.K('mag'); qCam(w, t, [0.3, 2.4, 7], [0.3, 2.3, 0], [k]); mg.scale.setScalar(Math.max(0.001, qsp(t, k - 0.3))); mg.rotation.set(0, 0.15 * Math.sin(t * 0.9), 0.03 * Math.sin(t * 1.4)); qTico(w, tk, t); }; },
  },
  hoy: {
    bg: '#efe9dc',
    build(w) {
      q3PaperSet(w); const ms = [...Array(7)].map((_, i) => { const m = w.add(q3Magazine(String(1871 + i * 25))); m.position.set(0.3, 2.4, 0.2 - i * 0.02); return m; }); const yr = q3Html(w, '1871', 'left:560px;top:1420px;transform:translateX(-50%);background:#14161d;color:#fff;font:900 64px monospace;padding:4px 22px;opacity:1'); const tk = w.add(q3Tico()); tk.setPose('point');
      return (t) => { const c = w.K('copies'), h = w.K('hoy'); qCam(w, t, [0.3, 2.4, 8.2], [0.3, 2.3, 0], [h]); ms.forEach((m, i) => { const u = p3Clamp((t - c - i * 0.08) / 0.4); m.position.x = 0.3 + (i - 3) * 0.32 * u; m.rotation.z = (i - 3) * 0.12 * u; m.position.z = 0.2 + (i === 0 ? 0.05 : -i * 0.02); }); yr.textContent = String(Math.round(1871 + (2026 - 1871) * p3Smoothstep(0, 1, p3Clamp((t - c) / (h + 0.4 - c))))); qTico(w, tk, t); };
    },
  },
  pobre: {
    bg: '#efe9dc',
    build(w) { q3PaperSet(w); const dw = w.add(q3Fig('darwin')); dw.position.set(0.9, 0, 0); const d = w.add(q3Dota()); d.position.set(-0.6, 0, 0.3); d.setPose('down'); return (t) => { qCam(w, t, [0.3, 1.9, 7.8], [0.2, 1.7, 0]); dw.live(t, { arms: 'book', mood: 'uneasy', look: -1 }); d.fx.sad = 1; d.live(t); }; },
  },
  prometi: {
    build(w) {
      q3Studio(w); const fr = w.add(q3Frame(0.9)); fr.position.set(0.6, 2.95, 0); const q = w.add(qQ()); q.position.set(0.6, 2.95, 0.03); q.scale.setScalar(1.4); const tk = w.add(q3Tico()); tk.position.set(-0.9, 0, 0.6); tk.force('point'); const gl = new THREE.PointLight('#d4ff3a', 0, 4); gl.position.set(0.6, 3.4, 1); w.add(gl);
      return (t) => { const k = w.K('p'); qCam(w, t, [0.2, 2.6, 9.5], [0, 2.3, 0], [k]); fr.rotation.y = 0.15 * Math.sin(t * 1.2); q.rotation.y = fr.rotation.y; gl.intensity = t > k ? 6 * (0.6 + 0.4 * Math.sin(t * 6)) : 0; tk.live(t); };
    },
  },
  cara: {
    bg: '#1e1838',
    build(w) { q3Desert(w); const sk = w.add(q3Skull()); sk.rotation.y = 0.5; const tk = w.add(q3Tico()); tk.setPose('point'); return (t) => { const k = w.K('skull'); qCam(w, t, [1.2, 2.3, 8.2], [0.3, 1.2, 0], [k]); sk.position.set(0.3, p3Lerp(-1.4, 0.75, p3Smoothstep(0, 1, p3Clamp((t - k + 0.6) / 1.0))), 0); sk.rotation.y = 0.15 + 0.1 * Math.sin(t * 0.5); qTico(w, tk, t); }; },
  },
  toumai: {
    bg: '#1e1838',
    build(w) { q3Desert(w); const sk = w.add(q3Skull()); sk.position.set(0.3, 0.75, 0); sk.rotation.y = 0.15; const card = w.add(q3Fact('Toumaï', 'Sahelanthropus tchadensis', 'Desierto del Chad · 2001', 2.4, 0.9)); card.position.set(0.5, 2.25, 0.9); card.scale.setScalar(0.75); const tk = w.add(q3Tico()); tk.setPose('point'); return (t) => { const k = w.K('name'); qCam(w, t, [1.2, 2.4, 8.2], [0.35, 1.45, 0], [k]); qPop(card, t, k - 0.2); card.rotation.y = 0.12 * Math.sin(t); qTico(w, tk, t); }; },
  },
  craneo: {
    bg: '#1e1838',
    build(w) {
      q3Desert(w); const sk = w.add(q3Skull()); sk.position.set(0.3, 0.75, 0); sk.rotation.y = 0.15; const card = w.add(q3Fact('Toumaï', 'Sahelanthropus tchadensis', 'Desierto del Chad · 2001', 2.4, 0.9)); card.position.set(0.5, 2.25, 0.9); card.scale.setScalar(0.75); const num = qNum(w, 640, 1330, 'AÑOS, CASI'); qChip(w, 'CHAD', w.K('chad'), 300, 620); const tk = w.add(q3Tico()); tk.setPose('point');
      return (t) => { const k = w.K('siete'); qCam(w, t, [1.2, 2.4, 8.2], [0.35, 1.45, 0], [k]); card.rotation.y = 0.12 * Math.sin(t); num.set(qdots(7000000 * p3Smoothstep(0, 1, p3Clamp((t - w.s.t0) / (k + 0.8 - w.s.t0)))), 1); qTico(w, tk, t); };
    },
  },
  primos: {
    bg: '#1c3fb0',
    build(w) {
      q3Studio(w, '#ece6d6', '#1c3fb0'); const ch = w.add(q3Fig('chimp')), tu = w.add(q3Fig('tu')); ch.position.set(-0.4, 0, 0); tu.position.set(1.42, 0, 0); const ar = w.add(q3Arrow(1.0, QC.blue)); ar.position.set(0.12, 1.35, 0.3); const x = w.add(q3Cross(0.6)); x.position.set(0.6, 1.35, 0.4);
      const br = w.add(q3FamLines(1.9, 0.8)); br.position.set(0.5, 3.1, 0); br.rotation.x = 0; qChip(w, 'PRIMOS', w.K('pr'), 560, 640); const tk = w.add(q3Tico()); tk.setPose('point');
      return (t) => { const a = w.K('x'), p = w.K('pr'); qCam(w, t, [0.65, 2.2, 9], [0.6, 1.95, 0], [a, p]); ch.live(t, { mood: 'happy' }); tu.live(t, { mood: 'happy' }); ar.visible = true; qPop(x, t, a); br.scale.set(1, Math.max(0.001, p3Clamp((t - p + 0.3) / 0.4)), 1); qTico(w, tk, t); };
    },
  },
  sub: {
    bg: '#fff3d6',
    build(w) {
      p3Lights(w, '#fff6e0', '#e8c27a'); const rays = w.add(q3Rays('#ffe08a', 30)); rays.position.set(0, 2, -6);
      const tk = w.add(q3Tico()), d = w.add(q3Dota()), tu = w.add(q3Fig('tu')); tk.position.set(-1.05, -2.3, 0); d.position.set(0.15, -2.3, 0.15); tu.position.set(0.95, -2.3, 0); tu.scale.setScalar(0.9);
      const sub = q3Html(w, '¡SUSCRÍBANSE!', 'left:540px;top:520px;transform:translateX(-50%);font:900 76px var(--font);color:#fff;-webkit-text-stroke:10px #14161d;paint-order:stroke fill;background:#ff5a5f;border:9px solid #14161d;border-radius:60px;padding:6px 44px;white-space:nowrap;opacity:0');
      const logo = q3Html(w, '<span style="color:#3270e6">Idio</span><span style="color:#ff7a3d">-</span><span style="color:#ffc83d">two</span>', 'left:540px;top:650px;transform:translateX(-50%);font:900 170px var(--font);letter-spacing:-4px;-webkit-text-stroke:15px #2b1a14;paint-order:stroke fill;text-shadow:10px 14px 0 rgba(0,0,0,.16);white-space:nowrap;opacity:0');
      w.tl.fromTo(logo, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' }, w.s.t0 + 0.05).fromTo(sub, { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.4)' }, w.s.t0 + 0.3).to(sub, { scale: 1.08, duration: 0.25, yoyo: true, repeat: 5, ease: 'sine.inOut' }, w.s.t0 + 1.0);
      return (t) => { const k = w.K('hug'); rays.rotation.z = t * 0.25; d.force('hugR'); d.live(t); tu.live(t, { mood: 'uneasy', look: -1 }); tk.force(t > k - 0.5 ? 'cover' : null); tk.live(t); w.look([0, 0.2, 11.5], [0, -0.4, 0], 40); };
    },
  },
});

// every scene of this video gets the finish (reflections, grade, vignette) and the fur clock
for (const id of Object.keys(VISUALS)) { const V = VISUALS[id], b = V.build; V.build = (w) => {
  q3Finish(w); let tgt = new THREE.Vector3(0, 1, 0); const look0 = w.look.bind(w); w.look = (p, q, f) => { tgt = new THREE.Vector3(...q); look0(p, q, f); };
  const pose = b(w), keys = (w.s.keys || []).map((k) => w.K(k.id)); let q0: THREE.Quaternion | null = null;
  const dust = q3Dust(); w.scene.add(dust); const tint = new THREE.Color('#ffffff');
  w.scene.traverse((o) => {   // softer, warmer key light with cleaner shadows; the characters take a little of the sky colour
    const l = o as THREE.DirectionalLight; if (l.isDirectionalLight && l.castShadow) { l.shadow.bias = -0.0004; l.shadow.normalBias = 0.03; l.shadow.mapSize.set(2048, 2048); l.shadow.radius = 4; l.intensity *= 1.15; if (w.s.id !== 'belt' && w.s.id !== 'turb2') l.color.lerp(new THREE.Color('#ffe9c9'), 0.5); }
    const h = o as THREE.HemisphereLight; if (h.isHemisphereLight) tint.copy(new THREE.Color('#ffffff').lerp(h.color, 0.35));
  });
  return (t) => {
    P3_T.value = t; Q3_KEYS = keys; Q3_FOCUS_OVR = -1; Q3_BOTH = 0; if (q0) w.camera.quaternion.copy(q0); pose(t); q0 = w.camera.quaternion.clone();
    // a hand-held camera: a slow, small drift so no shot is ever frozen
    const n = (a: number, b: number) => Math.sin(t * a + b); w.camera.rotateX(0.004 * (n(0.9, 1) + 0.6 * n(2.3, 4))); w.camera.rotateY(0.004 * (n(0.7, 2) + 0.6 * n(1.9, 5))); w.camera.rotateZ(0.0025 * n(0.5, 3)); w.camera.updateMatrixWorld(true);
    // depth of field focused on what the camera looks at; dust drifting in the light; trees swaying; character tint from the scene's light
    Q3_FOCUS = w.camera.position.distanceTo(tgt); const wp = new THREE.Vector3();
    for (const s of Q3_SPRITES) { let root: THREE.Object3D = s.g; while (root.parent) root = root.parent; if (root !== w.scene || !s.g.parent!.visible) continue; s.mesh.getWorldPosition(wp); Q3_FOCUS = Math.max(Q3_FOCUS, w.camera.position.distanceTo(wp)); }
    if (Q3_FOCUS_OVR > 0) Q3_FOCUS = Q3_FOCUS_OVR;
    dust.pose(t, tgt, Math.max(8, w.camera.position.distanceTo(tgt)));
    for (const tr of Q3_TREES) if (tr.parent && tr.parent.parent === w.scene || tr.parent === w.scene) { tr.rotation.z = 0.025 * Math.sin(t * 1.1 + tr.position.x * 0.7); tr.rotation.x = 0.015 * Math.sin(t * 0.8 + tr.position.z); }
    for (const s of Q3_SPRITES) (s.mesh.material as THREE.MeshBasicMaterial).color.copy(tint);
    // the 2D characters are paper cut-outs: turn each one of this scene to face the camera (keeping its own roll)
    const qc = w.camera.quaternion, qg = new THREE.Quaternion(), rz = new THREE.Quaternion(), Z = new THREE.Vector3(0, 0, 1);
    for (const s of Q3_SPRITES) {
      let root: THREE.Object3D = s.g; while (root.parent) root = root.parent; if (root !== w.scene) continue;
      const ch = s.g.parent!; ch.updateMatrixWorld(true); ch.getWorldQuaternion(qg); const up = new THREE.Vector3(0, 1, 0).applyQuaternion(qg), cr = new THREE.Vector3(1, 0, 0).applyQuaternion(qc), cu = new THREE.Vector3(0, 1, 0).applyQuaternion(qc); rz.setFromAxisAngle(Z, Math.atan2(-up.dot(cr), up.dot(cu)));
      s.g.quaternion.copy(qg.invert().multiply(qc.clone().multiply(rz)));
    }
  };
}; }
