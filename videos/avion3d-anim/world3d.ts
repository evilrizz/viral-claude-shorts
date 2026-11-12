// =====================================================================
//  World of "Cómo funciona un avión" in 3D (Idio-two): Tico and Dota in 3D, the board plane that turns into the
//  IDIO-TWO light plane piece by piece, the wing in cut, props, the cabin and the sets. Names start with "a3".
//  Everything is posed from t (absolute video seconds): no clocks, no randomness, nothing that accumulates.
// =====================================================================
const B3 = { ink: '#14161d', paper: '#f2efe6', lime: '#c8f53a', orange: '#ff6a3d', sky: '#8ec9f0', night: '#10121a', cream: '#fff3d6' };
const b3Mat = (c: string, r = 0.55, e = 0) => new THREE.MeshPhysicalMaterial({ color: c, roughness: r, metalness: 0, clearcoat: r < 0.5 ? 0.6 : 0, clearcoatRoughness: 0.15, sheen: r >= 0.7 ? 0.4 : 0, sheenRoughness: 0.7, sheenColor: new THREE.Color('#ffffff'), emissive: e ? c : '#000000', emissiveIntensity: e });
const b3Sph = (r: number, mat: THREE.Material, p: Vec3, s: Vec3 = [1, 1, 1]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 28), mat); m.position.set(...p); m.scale.set(...s); m.castShadow = m.receiveShadow = true; return m; };
const b3BoxM = (w: number, h: number, d: number, mat: THREE.Material, p: Vec3 = [0, 0, 0], r: Vec3 = [0, 0, 0]) => { const rr = Math.min(w, h, d) * 0.32, m = new THREE.Mesh(rr > 0.004 ? new THREE.RoundedBoxGeometry(w, h, d, 3, rr) : new THREE.BoxGeometry(w, h, d), mat); m.position.set(...p); m.rotation.set(...r); m.castShadow = m.receiveShadow = true; return m; };
const b3Grp = (p: Vec3 = [0, 0, 0], ...kids: THREE.Object3D[]) => { const g = new THREE.Group(); g.position.set(...p); if (kids.length) g.add(...kids); return g; };
// a limb: rod + round joints at both ends

// ---------------- Tico: tall dark-brown monkey, round glasses, blue t-shirt. Feet at y = 0, facing +z.
type B3Part = 'eng' | 'stab' | 'elev' | 'fin' | 'rud' | 'ail' | 'flap';
const b3Label = (text: string, w = 1024, h = 220, fg = '#1b3fb0', bg = '') => p3Paint(w, h, (c) => { if (bg) { c.fillStyle = bg; c.fillRect(0, 0, w, h); } c.font = `italic 900 ${h * 0.62}px Inter, Arial, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = h * 0.08; c.strokeStyle = '#ffffff'; c.strokeText(text, w / 2, h / 2); c.fillStyle = fg; c.fillText(text, w / 2, h / 2); });
function b3Plane() {
  const white = b3Mat('#f4f6fa', 0.45), wood = b3Mat('#c98a4b', 0.8), balsa = b3Mat('#ead0a0', 0.8), orange = b3Mat('#ff7a3d', 0.5), blue = b3Mat('#1b3fb0', 0.5), dark = b3Mat('#22334f', 0.25), glass = b3Mat('#7cc0f5', 0.15, 0.25), metal = b3Mat('#b8c0cf', 0.4), tire = b3Mat('#2b2f3a', 0.8);
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const L: Record<string, THREE.Object3D> = {}, P: Record<B3Part, THREE.Group> = {} as Record<B3Part, THREE.Group>, PM: Record<B3Part, THREE.MeshStandardMaterial[]> = {} as Record<B3Part, THREE.MeshStandardMaterial[]>;
  const part = (k: B3Part, mats: THREE.MeshStandardMaterial[], ...kids: THREE.Object3D[]) => { const gg = b3Grp([0, 0, 0], ...kids); P[k] = gg; PM[k] = mats; body.add(gg); return gg; };
  // stage 0: the plank and the balsa board wing
  L.plank = b3BoxM(7, 0.3, 0.5, wood, [0, 0, 0]); body.add(L.plank);
  L.boardW = b3BoxM(1.4, 0.07, 8.4, balsa, [0.5, 0.25, 0]); body.add(L.boardW);
  // stage 1: real high wing with orange tips and struts
  const wing = b3Grp([0.6, 0.72, 0], b3BoxM(1.5, 0.1, 9.6, white), b3BoxM(1.5, 0.11, 0.5, orange, [0, 0, 4.6]), b3BoxM(1.5, 0.11, 0.5, orange, [0, 0, -4.6]));
  L.wing = wing; body.add(wing);
  L.strut = b3Grp([0, 0, 0], p3Rod([0.4, -0.2, 0.5], [0.6, 0.66, 2.3], 0.04, metal), p3Rod([0.4, -0.2, -0.5], [0.6, 0.66, -2.3], 0.04, metal)); body.add(L.strut);
  // stage 2: the fuselage (a lathe, nose +x)
  const prof = [[0.001, -3.6], [0.14, -3.5], [0.3, -2.4], [0.5, -1.0], [0.58, 0.2], [0.6, 1.4], [0.56, 2.4], [0.5, 2.9], [0.001, 2.95]].map(([r, y]) => new THREE.Vector2(r, y));
  const fus = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), white); fus.rotation.z = -Math.PI / 2; fus.castShadow = fus.receiveShadow = true;
  L.fus = b3Grp([0, 0.12, 0], fus); body.add(L.fus);
  // stage 3: windshield and side windows
  L.wins = b3Grp([0, 0.12, 0], b3BoxM(0.5, 0.34, 1.0, glass, [2.15, 0.38, 0], [0, 0, 0.75]), b3BoxM(0.55, 0.28, 1.2, glass, [1.3, 0.34, 0]), b3BoxM(0.5, 0.26, 1.18, glass, [0.6, 0.32, 0])); body.add(L.wins);
  // stage 4: stripe and landing gear
  L.stripe = b3Grp([0, 0.12, 0], b3BoxM(5.6, 0.1, 1.22, orange, [0.1, -0.12, 0]), b3BoxM(5.2, 0.05, 1.2, blue, [0.3, -0.26, 0])); body.add(L.stripe);
  const wheel = (x: number, z: number, r: number) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.16, 20), tire); m.rotation.x = Math.PI / 2; m.position.set(x, -0.95, z); m.castShadow = true; return m; };
  L.gear = b3Grp([0, 0, 0], p3Rod([1.0, -0.3, 0.3], [1.0, -0.9, 0.75], 0.05, metal), p3Rod([1.0, -0.3, -0.3], [1.0, -0.9, -0.75], 0.05, metal), p3Rod([2.6, -0.3, 0], [2.7, -0.95, 0], 0.05, metal), wheel(1.0, 0.82, 0.24), wheel(1.0, -0.82, 0.24), wheel(2.7, 0, 0.18)); body.add(L.gear);
  // stage 5: the IDIO-TWO livery on both sides and the logo on the fin
  const name = b3Label('IDIO-TWO'), logo = p3Paint(256, 256, (c) => { c.fillStyle = '#ff7a3d'; c.beginPath(); c.arc(128, 128, 118, 0, 7); c.fill(); c.lineWidth = 16; c.strokeStyle = '#fff'; c.stroke(); c.fillStyle = '#fff'; c.font = '900 140px Inter, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('i2', 128, 136); });
  const decal = (tex: THREE.Texture, w: number, h: number, p: Vec3, ry: number) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.5 })); m.position.set(...p); m.rotation.y = ry; return m; };
  L.livery = b3Grp([0, 0, 0], decal(name, 2.4, 0.52, [-1.0, 0.22, 0.56], 0), decal(name, 2.4, 0.52, [-1.0, 0.22, -0.56], Math.PI), decal(logo, 0.55, 0.55, [-3.25, 0.95, 0.06], 0), decal(logo, 0.55, 0.55, [-3.25, 0.95, -0.06], Math.PI)); body.add(L.livery);
  // the parts that get added (each with its own materials so it can glow lime)
  const eMats = [b3Mat('#ff7a3d', 0.5), b3Mat('#2b2f3a', 0.6)];
  const cowl = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.42, 0.7, 28), eMats[0]); cowl.rotation.z = Math.PI / 2; cowl.position.set(3.25, 0.12, 0);
  const spinner = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.4, 20), eMats[0]); spinner.rotation.z = -Math.PI / 2; spinner.position.set(3.82, 0.12, 0);
  const prop = b3Grp([3.68, 0.12, 0], b3BoxM(0.06, 2.6, 0.2, eMats[1]), b3BoxM(0.06, 0.2, 2.6, eMats[1])); (prop.children[1] as THREE.Mesh).visible = false;
  part('eng', eMats, cowl, spinner, prop);
  const sMats = [b3Mat('#f4f6fa', 0.45)], eM = [b3Mat('#ff7a3d', 0.5)], fMats = [b3Mat('#f4f6fa', 0.45)], rM = [b3Mat('#ff7a3d', 0.5)], aM = [b3Mat('#ff7a3d', 0.5)], flM = [b3Mat('#ff7a3d', 0.5)];
  part('stab', sMats, b3BoxM(0.9, 0.07, 3.4, sMats[0], [-3.0, 0.22, 0]));
  const elev = b3Grp([-3.45, 0.22, 0], b3BoxM(0.4, 0.06, 3.3, eM[0], [-0.2, 0, 0])); part('elev', eM, elev);
  const finShape = p3Extruded([[0.0, 0], [-0.9, 0], [-1.1, 1.45], [-0.6, 1.45]], 0.09); const fin = new THREE.Mesh(finShape, fMats[0]); fin.position.set(-2.55, 0.25, 0); fin.castShadow = true; part('fin', fMats, fin);
  const rud = b3Grp([-3.45, 0.25, 0], b3BoxM(0.32, 1.42, 0.07, rM[0], [-0.16, 0.71, 0])); part('rud', rM, rud);
  const ailL = b3Grp([-0.15, 0.72, 3.9], b3BoxM(0.36, 0.08, 1.4, aM[0], [-0.18, 0, 0])), ailR = b3Grp([-0.15, 0.72, -3.9], b3BoxM(0.36, 0.08, 1.4, aM[0], [-0.18, 0, 0])); part('ail', aM, ailL, ailR);
  const flapL = b3Grp([-0.15, 0.7, 2.0], b3BoxM(0.36, 0.07, 1.6, flM[0], [-0.18, 0, 0])), flapR = b3Grp([-0.15, 0.7, -2.0], b3BoxM(0.36, 0.07, 1.6, flM[0], [-0.18, 0, 0])); part('flap', flM, flapL, flapR);
  const lime = new THREE.Color(B3.lime);
  const base = new Map<THREE.MeshStandardMaterial, THREE.Color>(); for (const k in PM) for (const m of PM[k as B3Part]) base.set(m, m.color.clone());
  const show = (o: THREE.Object3D, f: number) => { o.visible = f > 0.01; o.scale.setScalar(Math.max(0.001, f)); };
  return Object.assign(g, {
    body, parts: P,
    // which parts are on (0..1 grow) and how far the board has turned into the plane
    pose(stage: number, on: Partial<Record<B3Part, number>>) {
      const f = (k: number) => p3Clamp(stage - (k - 1));
      show(L.boardW, 1 - f(1)); show(L.wing, f(1)); show(L.strut, f(1));
      show(L.plank, 1 - f(2)); L.fus.visible = f(2) > 0.01; L.fus.scale.set(1, Math.max(0.001, f(2)), Math.max(0.001, f(2)));
      show(L.wins, f(3)); show(L.stripe, f(4)); show(L.gear, f(4)); show(L.livery, f(5));
      for (const k of ['eng', 'stab', 'elev', 'fin', 'rud', 'ail', 'flap'] as B3Part[]) show(P[k], on[k] ?? 0);
    },
    glow(k: B3Part, u: number) { for (const m of PM[k]) { m.color.copy(base.get(m)!).lerp(lime, u); m.emissive.copy(lime); m.emissiveIntensity = u * 0.55; } },
    spin(t: number, rps = 6) { prop.rotation.x = t * rps * Math.PI * 2; (prop.children[1] as THREE.Mesh).visible = rps > 2; },
    controls(c: { elev?: number; rud?: number; ailL?: number; ailR?: number; flap?: number }) {
      elev.rotation.z = c.elev ?? 0; rud.rotation.y = c.rud ?? 0; ailL.rotation.z = c.ailL ?? 0; ailR.rotation.z = c.ailR ?? 0;
      flapL.rotation.z = -(c.flap ?? 0); flapR.rotation.z = -(c.flap ?? 0);
    },
  });
}
// paints a part lime for a moment when it is added (k: ramp in 0..1 over ~0.3 s, then fades)
const b3AddGlow = (t: number, t0: number) => (t < t0 ? 0 : t < t0 + 1.0 ? 1 : 1 - p3Clamp((t - t0 - 1.0) / 0.6));

// ---------------- the wing in cut (p3Airfoil) with a flap and the lift arrow; air with p3Airflow
function b3Wing() {
  const foil = p3Airfoil(), flapMat = b3Mat('#ff7a3d', 0.5);
  const flap = b3Grp([2.0, 0.05, 0], b3BoxM(1.1, 0.12, 2.9, flapMat, [0.55, 0, 0])); foil.add(flap); flap.visible = false;
  const lift = p3Arrow([0, 0.6, 1.7], [0, 1, 0], 2.6, B3.lime, 0.28);
  const downs = [0.8, 1.9, 3.0].map((x) => p3Arrow([x, -0.6, 1.7], [0.25, -1, 0], 1.5, C3.air, 0.15));
  return { foil, flap, flapMat, lift, downs, air: p3Airflow(7, -1.8, 2.1, 1.6) };
}

// ---------------- props
function b3Table() { const w = b3Mat('#b97a4a', 0.75); return b3Grp([0, 0, 0], b3BoxM(4, 0.15, 1.6, w, [0, 1.0, 0]), ...[[-1.8, -0.65], [1.8, -0.65], [-1.8, 0.65], [1.8, 0.65]].map(([x, z]) => b3BoxM(0.14, 1.0, 0.14, w, [x, 0.5, z]))); }
function b3Gauge() {
  const face = p3Paint(512, 512, (c) => { c.fillStyle = '#15161c'; c.beginPath(); c.arc(256, 256, 250, 0, 7); c.fill(); c.lineWidth = 28; c.strokeStyle = '#4a4c56'; c.beginPath(); c.arc(256, 300, 170, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); c.strokeStyle = '#ff6a3d'; c.beginPath(); c.arc(256, 300, 170, Math.PI * 1.15, Math.PI * 1.35); c.stroke(); c.fillStyle = '#ff6a3d'; c.font = '900 60px monospace'; c.textAlign = 'center'; c.fillText('E', 110, 300); c.fillStyle = '#cfcdc4'; c.fillText('F', 402, 300); c.font = '700 34px monospace'; c.fillText('COMBUSTIBLE', 256, 430); });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.2, 48), b3Mat('#2a2c35', 0.4)); disc.rotation.x = Math.PI / 2;
  const dial = new THREE.Mesh(new THREE.CircleGeometry(1.4, 64), new THREE.MeshStandardMaterial({ map: face, roughness: 0.5 })); dial.position.y = 0.101; disc.add(dial); dial.rotation.x = -Math.PI / 2;
  const needle = b3Grp([0, -0.25, 0.14], b3BoxM(0.07, 1.0, 0.04, b3Mat(B3.lime, 0.3, 0.5), [0, 0.5, 0])), hub = b3Sph(0.12, b3Mat(B3.lime, 0.3, 0.5), [0, -0.25, 0.16]);
  return Object.assign(b3Grp([0, 0, 0], disc, needle, hub), { needle });
}
function b3Card(meta: string, title: string, line: string, year: string, stamp = '') {
  const tex = p3Paint(1024, 640, (c) => { c.fillStyle = '#f2efe6'; c.fillRect(0, 0, 1024, 640); c.fillStyle = '#6b6a63'; c.font = '700 34px monospace'; c.fillText(meta, 56, 80); c.fillStyle = '#c9c5b6'; c.fillRect(56, 104, 912, 4); c.fillStyle = '#14161d'; c.font = '900 92px Inter, Arial'; c.fillText(title, 56, 230); c.fillStyle = '#4a4943'; c.font = '700 46px Inter, Arial'; c.fillText(line, 56, 310); c.fillStyle = '#14161d'; c.fillRect(56, 380, 380, 160); c.fillStyle = '#d4ff3a'; c.font = '900 120px monospace'; c.fillText(year, 80, 506);
    if (stamp) { c.save(); c.translate(740, 470); c.rotate(-0.17); c.strokeStyle = '#ff6a3d'; c.lineWidth = 12; c.strokeRect(-190, -66, 380, 132); c.fillStyle = '#ff6a3d'; c.font = '900 72px Inter, Arial'; c.textAlign = 'center'; c.fillText(stamp, 0, 26); c.restore(); } });
  return new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.25, 0.06), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }));
}
function b3Bar(color: string) { const frame = b3BoxM(0.9, 4, 0.5, new THREE.MeshStandardMaterial({ color: '#4a4c56', transparent: true, opacity: 0.35 }), [0, 2, 0]); const fill = b3Grp([0, 0, 0], b3BoxM(0.7, 3.9, 0.4, b3Mat(color, 0.4, 0.3), [0, 1.95, 0])); return Object.assign(b3Grp([0, 0, 0], frame, fill), { level(u: number) { fill.scale.y = Math.max(0.01, u); } }); }
function b3Bike() {
  const O = b3Mat('#1d1410', 0.5), F = b3Mat('#ff6a3d', 0.4);
  const wheel = (x: number) => { const w = b3Grp([x, 0.62, 0], new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.06, 12, 40), O)); for (let i = 0; i < 6; i++) { const s = b3BoxM(0.02, 1.12, 0.02, b3Mat('#9aa3b2', 0.4)); s.rotation.z = i * Math.PI / 6; w.add(s); } return w; };
  const w1 = wheel(-0.95), w2 = wheel(0.95);
  const frame = b3Grp([0, 0, 0], p3Rod([-0.95, 0.62, 0], [-0.25, 1.35, 0], 0.06, F), p3Rod([-0.25, 1.35, 0], [0.6, 1.35, 0], 0.06, F), p3Rod([0.6, 1.35, 0], [0.95, 0.62, 0], 0.06, F), p3Rod([-0.25, 1.35, 0], [0.05, 0.62, 0], 0.06, F), p3Rod([0.05, 0.62, 0], [0.6, 1.35, 0], 0.06, F), p3Rod([-0.95, 0.62, 0], [0.05, 0.62, 0], 0.06, F), p3Rod([0.6, 1.35, 0], [0.7, 1.7, 0], 0.05, O), p3Rod([0.6, 1.7, -0.3], [0.8, 1.7, 0.3], 0.04, O));
  return Object.assign(b3Grp([0, 0, 0], w1, w2, frame), { roll(t: number) { w1.rotation.z = w2.rotation.z = -t * 9; } });
}
const b3Rock = () => new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 0), b3Mat('#8d8f96', 0.9));
// stars and drifting specks for the dark sets
function b3Specks(n = 120, spread = 30) { const r = p3Rnd(7), sw = p3Swarm(n, new THREE.IcosahedronGeometry(0.05, 0), new THREE.MeshBasicMaterial({ color: '#e8e6dc' })); const P = [...Array(n)].map(() => [r() * spread - spread / 2, r() * 14, -r() * 20]); return Object.assign(sw, { pose(t: number) { P.forEach(([x, y, z], i) => sw.put(i, x - ((t * 0.3) % 2), y + Math.sin(t + i) * 0.1, z, 0.6 + (i % 3) * 0.4)); sw.done(); } }); }
// confetti (prize): falls from start, deterministic
function b3Confetti(n = 90) { const r = p3Rnd(11), sw = p3Swarm(n, new THREE.BoxGeometry(0.16, 0.08, 0.02), new THREE.MeshBasicMaterial({ color: '#ffffff' })); const cols = ['#ff5a5f', '#ffd23d', '#3ccf91', '#4c7dff', '#ff8a3d', '#8b6cff'].map((c) => new THREE.Color(c)); const P = [...Array(n)].map(() => [r() * 10 - 5, 6 + r() * 3, r() * 4 - 2, r() * 6]); P.forEach((_, i) => sw.setColorAt(i, cols[i % 6])); return Object.assign(sw, { pose(t: number, t0: number) { P.forEach(([x, y, z, ph], i) => { const u = t - t0; if (u < 0) { sw.hide(i); return; } sw.put(i, x + Math.sin(u * 2 + ph) * 0.4, y - u * 2.6, z, 1, 1, 1, u * 3 + ph, u * 2, ph); }); sw.done(); } }); }
// prize rays: a disc of wedges that faces the camera (rotate .rotation.z to spin)
function b3Rays(c1 = '#ffd84a', r = 14) { const g = new THREE.Group(); for (let i = 0; i < 16; i++) { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(Math.cos(i * Math.PI / 8) * r, Math.sin(i * Math.PI / 8) * r); s.lineTo(Math.cos(i * Math.PI / 8 + 0.12) * r, Math.sin(i * Math.PI / 8 + 0.12) * r); g.add(new THREE.Mesh(new THREE.ShapeGeometry(s), new THREE.MeshBasicMaterial({ color: c1, transparent: true, opacity: 0.55 }))); } return g; }
// a ribbon: a flat satin strip along a smooth curve (width along wdir), optionally with a V cut at the end
function b3Ribbon(ctrl: Vec3[], width: number, wdir: Vec3, mat: THREE.Material, notch = 0, closed = false) {
  const c = new THREE.CatmullRomCurve3(ctrl.map((p) => new THREE.Vector3(...p)), closed, 'centripetal'), n = 64, W = new THREE.Vector3(...wdir).normalize(), pos: number[] = [], idx: number[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, p = c.getPoint(u), tg = c.getTangent(u), w = W.clone().sub(tg.clone().multiplyScalar(W.dot(tg))).normalize().multiplyScalar(width / 2);
    const mid = i === n && notch ? p.clone().sub(tg.clone().multiplyScalar(notch)) : p;
    pos.push(p.x - w.x, p.y - w.y, p.z - w.z, mid.x, mid.y, mid.z, p.x + w.x, p.y + w.y, p.z + w.z);
    if (i < n) for (let k = 0; k < 2; k++) { const a = i * 3 + k, b = a + 3; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.castShadow = true; return m;
}
// a gift bow: two puffy satin loops, a wrapped knot and two tails with V-cut ends
function b3Bow() {
  const sat = new THREE.MeshPhysicalMaterial({ color: '#e8203a', roughness: 0.35, sheen: 1, sheenColor: new THREE.Color('#ff9aa8'), sheenRoughness: 0.35, clearcoat: 0.4, clearcoatRoughness: 0.3, side: THREE.DoubleSide });
  const g = new THREE.Group();
  for (const s of [-1, 1]) {
    const loop = b3Ribbon([[0, 0, 0], [s * 0.35, 0.32, 0.05], [s * 0.85, 0.5, 0], [s * 1.12, 0.22, -0.05], [s * 1.0, -0.12, 0], [s * 0.55, -0.16, 0.05], [s * 0.12, -0.04, 0]], 0.5, [0, 0.35, 1], sat, 0, true);
    loop.rotation.set(-0.25, s * -0.35, s * 0.18); g.add(loop);
    const tail = b3Ribbon([[s * 0.05, -0.05, 0.15], [s * 0.22, -0.38, 0.22], [s * 0.32, -0.68, 0.14], [s * 0.5, -0.95, 0.24], [s * 0.62, -1.15, 0.16]], 0.34, [1, s * 0.35, 0.25], sat, 0.16);
    g.add(tail);
  }
  const knot = new THREE.Mesh(new THREE.RoundedBoxGeometry(0.34, 0.4, 0.42, 4, 0.12), sat); knot.position.z = 0.06; knot.castShadow = true; g.add(knot);
  const fold = b3Ribbon([[-0.17, 0.12, 0.28], [0, 0.16, 0.3], [0.17, 0.12, 0.28]], 0.06, [0, 1, 0], new THREE.MeshPhysicalMaterial({ color: '#b5122a', roughness: 0.5, side: THREE.DoubleSide })); g.add(fold);
  return g;
}
// a 3D star (banner)
const b3StarMesh = (r: number, c = '#ffd23d') => { const m = new THREE.Mesh(p3Extruded([...Array(10)].map((_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; return [Math.cos(a) * rr, Math.sin(a) * rr]; }), r * 0.35), b3Mat(c, 0.4, 0.25)); m.castShadow = true; return m; };

// ---------------- sets
// the sky set: soft light, grass, trees far away, clouds in layers (.pose(t) drifts them), optional runway
function b3SkySet(w: World, o: { runway?: boolean; ground?: boolean } = {}) {
  p3Lights(w); w.scene.fog = new THREE.Fog(P3_SKY, 40, 130);
  if (o.ground !== false) { w.add(p3Ground(C3.grass, -6)); w.add(b3Forest(30, 5, -30, 120)).position.y = -6; }
  const runway = o.runway ? w.add(p3Runway()) : null; if (runway) runway.position.y = -5.97;
  const clouds = [[-12, 6, -14, 1.6], [10, 9, -20, 2], [-4, 12, -26, 1.8], [16, 3, -10, 1.2], [-18, 2, -8, 1.3], [4, -2, -18, 1.5]].map(([x, y, z, s]) => w.add(b3Cloud([x, y, z], s)));
  return { runway, pose(t: number, speed = 1) { clouds.forEach((c, i) => { const x0 = [-12, 10, -4, 16, -18, 4][i]; c.position.x = ((x0 - t * speed * (1.2 + i * 0.25) + 60) % 60 + 60) % 60 - 30; }); } };
}
// the dark set: near-black, a soft rim of light, specks drifting, dark ground
function b3NightSet(w: World) {
  w.add(new THREE.HemisphereLight('#c8d4ff', '#1a1c24', 0.8));
  const key = new THREE.DirectionalLight('#ffffff', 1.5); key.position.set(6, 10, 8); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15 }); w.add(key);
  const rim = new THREE.DirectionalLight(B3.orange, 0.6); rim.position.set(-8, 4, -6); w.add(rim);
  w.add(p3Ground('#1b1d26', -2.5));
  const sp = w.add(b3Specks());
  return { pose(t: number) { sp.pose(t); } };
}
// the cabin, seen from the front of the plane looking back: rows of seats facing the camera, windows on both walls,
// overhead bins. Seats of the front row at x = -1.45, -0.75 | 0.75, 1.45 (z = 0). .seatFront(x) covers a sitter's legs.
function b3Cabin(w: World) {
  w.add(new THREE.HemisphereLight('#fff6e8', '#5a5f70', 1.1));
  const lamp = new THREE.DirectionalLight('#ffffff', 0.9); lamp.position.set(0, 6, 6); lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048); w.add(lamp);
  const wall = b3Mat('#e8e1d3', 0.8), seatM = b3Mat('#2f5fd9', 0.85), head = b3Mat('#e9eef5', 0.8), floor = b3Mat('#3d4a6b', 0.95), bin = b3Mat('#f4efe6', 0.6), arm = b3Mat('#b8c0cf', 0.6);
  w.add(b3BoxM(6, 0.1, 14, floor, [0, -0.05, -5]));
  const skyTex = p3Paint(512, 512, (c) => { const gr = c.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#2a7fd9'); gr.addColorStop(1, '#bfe3ff'); c.fillStyle = gr; c.fillRect(0, 0, 512, 512); c.fillStyle = '#ffffff'; for (const [x, y, r] of [[90, 300, 50], [140, 280, 64], [200, 305, 46], [360, 180, 40], [410, 165, 52], [460, 185, 38]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } });
  skyTex.wrapS = THREE.RepeatWrapping;
  const winMat = new THREE.MeshBasicMaterial({ map: skyTex });
  for (const sx of [-1, 1]) {
    const side = w.add(b3BoxM(0.12, 3.4, 14, wall, [sx * 2.3, 1.7, -5]));
    side.receiveShadow = true;
    for (let k = 0; k < 6; k++) {
      const z = 0.5 - k * 1.6;
      const frame = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.3, 6, 18), b3Mat('#cfc8b8', 0.5)); frame.position.set(sx * 2.22, 1.55, z); frame.scale.set(0.3, 1, 1); w.add(frame);
      const pane = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.26, 6, 18), winMat); pane.position.set(sx * 2.17, 1.55, z); pane.scale.set(0.2, 1, 1); w.add(pane);
    }
    w.add(b3BoxM(0.9, 0.5, 14, bin, [sx * 1.8, 2.55, -5]));
    w.add(b3BoxM(0.9, 0.05, 14, b3Mat('#fff6d8', 0.4, 0.5), [sx * 1.8, 2.28, -5]));
  }
  w.add(b3BoxM(4.8, 0.1, 14, wall, [0, 3.2, -5]));
  const seat = (x: number, z: number) => b3Grp([x, 0, z], b3BoxM(0.62, 1.05, 0.14, seatM, [0, 0.95, -0.32], [-0.08, 0, 0]), b3BoxM(0.5, 0.22, 0.1, head, [0, 1.45, -0.36]), b3BoxM(0.62, 0.16, 0.58, seatM, [0, 0.5, -0.02]), b3BoxM(0.08, 0.3, 0.5, arm, [0.33, 0.62, -0.05]), b3BoxM(0.08, 0.3, 0.5, arm, [-0.33, 0.62, -0.05]));
  for (let row = 0; row < 6; row++) for (const x of [-1.45, -0.75, 0.75, 1.45]) w.add(seat(x, -row * 1.25));
  return {
    seatFront: (x: number) => w.add(b3Grp([x, 0, 0], b3BoxM(0.62, 0.42, 0.06, seatM, [0, 0.33, 0.27]))),
    pose(t: number) { skyTex.offset.x = -t * 0.08; },
  };
}


// =====================================================================
//  ANIMATED 3D CHARACTERS: organic one-piece heads with short fur, a soft cloth body, bendy limbs (a tube along a curve
//  through an IK elbow, rebuilt every frame), eyelids that blink, pupils that look and jump, brows and a mouth that act,
//  squash & stretch, poses reached with anticipation and overshoot, a head that lags the body and ears/tufts that follow.
//  Same API as before: setPose(pose, at?, from?), live(t), head, bulb, bump, black, crazy(on), dizzy(t, on).
// =====================================================================
type B3TicoPose = 'cross' | 'point' | 'palm' | 'hold';
type B3DotaPose = 'up' | 'down' | 'hug' | 'reach';
const b3Back = (u: number) => { const c = 1.7; u = p3Clamp(u); return 1 + (c + 1) * (u - 1) ** 3 + c * (u - 1) ** 2; };
const b3Hash = (n: number) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const b3Skin = (c: string, rough = 0.85) => new THREE.MeshPhysicalMaterial({ color: c, roughness: rough, sheen: 0.6, sheenColor: new THREE.Color('#ffffff'), sheenRoughness: 0.8 });
const b3Cloth = (c: string) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.9, sheen: 1, sheenColor: new THREE.Color(c).lerp(new THREE.Color('#ffffff'), 0.5), sheenRoughness: 0.5 });
const b3Gloss = (c: string, r = 0.15) => new THREE.MeshPhysicalMaterial({ color: c, roughness: r, clearcoat: 1, clearcoatRoughness: 0.08 });
// IK in 3D: elbow from shoulder s to target t with segments a, b, bending towards the pole direction
function b3IK(s: THREE.Vector3, t: THREE.Vector3, a: number, b: number, pole: THREE.Vector3) {
  const d = t.clone().sub(s), L0 = d.length() || 1e-4, L = Math.min(L0, (a + b) * 0.995), dir = d.clone().divideScalar(L0);
  const cosA = p3Clamp((a * a + L * L - b * b) / (2 * a * L), -1, 1), A = Math.acos(cosA);
  const perp = pole.clone().sub(dir.clone().multiplyScalar(pole.dot(dir))).normalize();
  const e = s.clone().add(dir.clone().multiplyScalar(Math.cos(A) * a)).add(perp.multiplyScalar(Math.sin(A) * a));
  return { e, h: s.clone().add(dir.multiplyScalar(L)) };
}
// a limb mesh that is rebuilt every frame along shoulder -> elbow -> hand, tapering from r0 to r1
function b3Limb(mat: THREE.Material, r0: number, r1: number) {
  const m = new THREE.Mesh(new THREE.BufferGeometry(), mat); m.castShadow = m.receiveShadow = true;
  return Object.assign(m, { set(s: THREE.Vector3, e: THREE.Vector3, h: THREE.Vector3) {
    const c = e.clone().multiplyScalar(2).sub(s.clone().add(h).multiplyScalar(0.5)), curve = new THREE.QuadraticBezierCurve3(s, c, h);
    const g = new THREE.TubeGeometry(curve, 18, 1, 14, false), pos = g.attributes.position, nrm = g.attributes.normal;
    for (let i = 0; i <= 18; i++) { const u = i / 18, r = r0 + (r1 - r0) * u, p = curve.getPoint(u); for (let j = 0; j <= 14; j++) { const k = i * 15 + j; pos.setXYZ(k, p.x + nrm.getX(k) * r, p.y + nrm.getY(k) * r, p.z + nrm.getZ(k) * r); } }
    pos.needsUpdate = true; m.geometry.dispose(); m.geometry = g;
  } });
}
// a head: an organic skull with a face mask painted in, covered by short fur
function b3Head(R: number, fur: string, face: string, furLen: number) {
  const hx = (h: string) => new THREE.Color(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255), F = hx(fur), C = hx(face);
  const geo = p3Blob((x, y, z) => [x * R * 1.02, y * R * (y > 0 ? 0.98 : 0.9) - (z > 0 && y < 0 ? z * y * R * 0.08 : 0), z * R * 0.96],
    (x, y, z) => { const mask = p3Smoothstep(0.1, 0.32, z / R) * p3Smoothstep(0.95, 0.55, Math.hypot(x / R * 1.15, (y / R + 0.12) * 1.05)); const n = p3Fbm3(x * 6, y * 6, z * 6) - 0.5; const c = F.clone().lerp(C, mask); return [c.r + n * 0.06, c.g + n * 0.05, c.b + n * 0.04]; }, 64, 48);
  const g = new THREE.Group();
  const base = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.8, sheen: 0.5, sheenRoughness: 0.7, sheenColor: new THREE.Color('#ffffff') })); base.castShadow = true; g.add(base);
  g.add(p3Fur(geo, { ...P3_HAIR, layers: 7, len: furLen, den: 150, droop: [0, -0.4, 0], shade: [0.75, 1.15] }));
  return g;
}
function b3Eye(r: number, lidColor: string) {
  const white = b3Gloss('#ffffff', 0.12), dark = b3Gloss('#1d1410', 0.2), lidM = b3Skin(lidColor);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), white);
  const pupil = new THREE.Group(); const iris = new THREE.Mesh(new THREE.SphereGeometry(r * 0.48, 24, 16), dark); iris.position.z = r * 0.86; iris.scale.z = 0.38;
  const spark = new THREE.Mesh(new THREE.SphereGeometry(r * 0.12, 12, 8), new THREE.MeshBasicMaterial({ color: '#ffffff' })); spark.position.set(r * 0.16, r * 0.16, r * 1.03); pupil.add(iris, spark);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(r * 1.06, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), lidM); lid.castShadow = true;
  const g = new THREE.Group(); g.add(ball, pupil, lid);
  return Object.assign(g, { pupil, lid, pose(lookX: number, lookY: number, closed: number) { pupil.rotation.set(-lookY, lookX, 0); lid.rotation.x = p3Lerp(-1.15, Math.PI / 2 + 0.05, closed); } });
}
function b3Brow(w: number, mat: THREE.Material) { const m = new THREE.Mesh(new THREE.CapsuleGeometry(w * 0.14, w * 0.8, 6, 12), mat); m.rotation.z = Math.PI / 2; const g = new THREE.Group(); g.add(m); m.castShadow = true; return g; }
// mouth: a dark inner shape and a tongue; set(width, open) every frame (lip sync from the words), shape(k) for fixed shapes
function b3Mouth(w: number) {
  const inner = new THREE.Mesh(new THREE.SphereGeometry(w, 24, 16), new THREE.MeshStandardMaterial({ color: '#4a1212', roughness: 0.6 })), tongue = new THREE.Mesh(new THREE.SphereGeometry(w * 0.6, 16, 12), new THREE.MeshStandardMaterial({ color: '#ff7f95', roughness: 0.5 }));
  tongue.position.set(0, -w * 0.45, w * 0.2); const g = new THREE.Group(); g.add(inner, tongue); inner.scale.z = 0.4; tongue.scale.z = 0.4;
  const set = (sx: number, sy: number) => { g.scale.set(sx, Math.max(0.05, sy), 1); tongue.visible = sy > 0.3; };
  return Object.assign(g, { set, shape(k: number) { const S = [[0.9, 0.08], [1.0, 0.9], [0.62, 0.85], [1.25, 0.45], [0.6, 0.35]][k]; set(S[0], S[1]); } });
}
interface B3Spec { kind: 'tico' | 'dota'; fur: string; face: string; shirt: string; headY: number; R: number; sh: [number, number]; arm: [number, number]; armR: number; hip: [number, number]; legR: number; torso: [number, number, number]; hands: Record<string, [Vec3, Vec3]> }
const B3_TICO: B3Spec = { kind: 'tico', fur: '#5a3a2b', face: '#f3d9b1', shirt: '#3270e6', headY: 1.76, R: 0.46, sh: [0.32, 1.24], arm: [0.42, 0.4], armR: 0.075, hip: [0.13, 0.56], legR: 0.09, torso: [0.36, 0.44, 0.3],
  hands: { cross: [[0.22, 1.02, 0.36], [-0.22, 1.06, 0.34]], point: [[-0.42, 0.62, 0.12], [0.86, 1.86, 0.26]], palm: [[-0.42, 0.62, 0.12], [0.06, 2.0, 0.5]], hold: [[-0.15, 0.88, 0.42], [0.15, 0.88, 0.42]],
    explain: [[-0.36, 1.02, 0.46], [0.36, 1.08, 0.48]], shrug: [[-0.66, 1.08, 0.22], [0.66, 1.08, 0.22]], count: [[-0.14, 0.98, 0.44], [0.44, 1.56, 0.42]], chin: [[-0.1, 0.98, 0.4], [0.08, 1.42, 0.5]],
    glasses: [[-0.22, 1.0, 0.38], [0.06, 1.8, 0.58]], big: [[-0.74, 1.62, 0.2], [0.74, 1.62, 0.2]], hips: [[-0.44, 0.7, 0.05], [0.44, 0.7, 0.05]] } };
const B3_DOTA: B3Spec = { kind: 'dota', fur: '#c97b3d', face: '#f2d2a6', shirt: '#ffc83d', headY: 1.12, R: 0.5, sh: [0.23, 0.72], arm: [0.29, 0.27], armR: 0.06, hip: [0.1, 0.33], legR: 0.07, torso: [0.27, 0.27, 0.24],
  hands: { up: [[-0.5, 1.18, 0.08], [0.5, 1.18, 0.08]], down: [[-0.32, 0.3, 0.1], [0.32, 0.3, 0.1]], hug: [[-0.1, 0.5, 0.36], [0.1, 0.5, 0.36]], reach: [[-0.32, 0.3, 0.1], [0.8, 0.72, 0.2]],
    explain: [[-0.3, 0.78, 0.36], [0.3, 0.78, 0.36]], shrug: [[-0.52, 0.8, 0.12], [0.52, 0.8, 0.12]], cheer: [[-0.46, 1.2, 0.1], [0.46, 1.2, 0.1]], scratch: [[-0.32, 0.3, 0.1], [0.52, 1.08, 0.02]],
    wave: [[-0.32, 0.3, 0.1], [0.6, 1.15, 0.2]], point: [[-0.32, 0.3, 0.1], [0.76, 0.95, 0.3]] } };

// ---------------- acting from the voice: phrases, stressed words (beats) and lip sync, all from WORDS
type B3Phrase = { t0: number; t1: number; q: boolean; ex: boolean; i: number };
let B3_PH: B3Phrase[] | null = null; const B3_BEAT: number[] = [], B3_LET: string[] = [];
let B3_KEYS: number[] = [];   // the key times of the scene being drawn (set by the wrapper at the end of visuals3d.ts)
function b3Phrases() {
  if (B3_PH) return B3_PH; B3_PH = []; const W = typeof WORDS !== 'undefined' ? WORDS : []; let cur: B3Phrase | null = null;
  W.forEach((x, j) => {
    B3_LET.push(x.w.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-zñ]/g, ''));
    if (!cur) { cur = { t0: x.t0, t1: x.t1, q: false, ex: false, i: B3_PH!.length }; B3_BEAT.push(x.t0); }
    else if (B3_LET[j].length >= 6) B3_BEAT.push(x.t0);
    cur.t1 = x.t1; if (/[¿?]/.test(x.w)) cur.q = true; if (/[¡!]/.test(x.w)) cur.ex = true;
    const nx = W[j + 1]; if (!nx || /[.,;:!?…]$/.test(x.w) || nx.t0 - x.t1 > 0.35) { B3_PH!.push(cur); cur = null; }
  });
  return B3_PH;
}
// index of the last item whose start (via get) is <= t, or -1
function b3Find<T>(a: T[], t: number, get: (x: T) => number) { let lo = 0, hi = a.length - 1, r = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (get(a[m]) <= t) { r = m; lo = m + 1; } else hi = m - 1; } return r; }
const B3_VIS: Record<string, [number, number]> = { a: [1.15, 1], e: [1.2, 0.55], i: [1.25, 0.4], o: [0.75, 0.85], u: [0.6, 0.6], m: [0.9, 0.06], b: [0.9, 0.06], p: [0.9, 0.06], f: [0.95, 0.22], v: [0.95, 0.22] };
// mouth [width, open] at t from the letters of the word being said, or null between words
function b3Lip(t: number): [number, number] | null {
  b3Phrases(); const W = typeof WORDS !== 'undefined' ? WORDS : [], j = b3Find(W, t, (x) => x.t0); if (j < 0) return null; const x = W[j]; if (t > x.t1 + 0.05) return null;
  const L = B3_LET[j] || 'a', n = L.length, f = p3Clamp((t - x.t0) / Math.max(0.05, x.t1 - x.t0)) * n - 0.5, i0 = p3Clamp(Math.floor(f), 0, n - 1), i1 = Math.min(n - 1, i0 + 1), u = p3Smoothstep(0, 1, f - Math.floor(f));
  const a = B3_VIS[L[i0]] || [1.0, 0.32], b = B3_VIS[L[i1]] || [1.0, 0.32], amp = p3Clamp(Math.min((t - x.t0) / 0.05, (x.t1 + 0.05 - t) / 0.07));
  return [p3Lerp(a[0], b[0], u), p3Lerp(a[1], b[1], u) * amp];
}
const b3Imp = (dt: number) => (dt > 0 && dt < 0.9 ? dt * 9 * Math.exp(1 - dt * 9) : 0);   // a quick kick that peaks 0.11 s after dt = 0
// the spring that every pose change goes through: rises in ~0.2 s, overshoots ~20 %, settles by 0.6 s
const B3_KER = (() => { const k = [...Array(20)].map((_, j) => { const u = (j + 0.5) / 30; return Math.exp(-6.3 * u) * Math.sin(12.5 * u); }); const s = k.reduce((a, b) => a + b, 0); return k.map((x) => x / s); })();
// what each gesture does besides the hands: [lean, curlL, curlR, palmUpL, palmUpR, brow, eyesWide, lookX, lookY, headYaw, pointR]
const B3_GP: Record<string, number[]> = {
  cross: [0, 1, 1, 0, 0, -0.1, 0, 0, 0, 0, 0], point: [0.05, 0.6, 1, 0, 0, 0.3, 0.15, 0.35, 0.2, 0.35, 1], palm: [-0.03, 0.6, 0, 0, 1, 0.4, 0.1, 0, 0.15, 0, 0], hold: [0.04, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  explain: [0.08, 0.2, 0.2, 0.6, 0.6, 0.35, 0.05, 0, 0, 0, 0], shrug: [-0.06, 0, 0, 1, 1, 0.8, 0.15, 0, 0.1, 0, 0], count: [0.04, 0.8, 0.5, 0, 0, 0.4, 0, 0, 0, 0, 1], chin: [0.02, 0.8, 0.7, 0, 0, -0.3, -0.25, 0.25, 0.25, 0.15, 0],
  glasses: [0, 0.8, 0.6, 0, 0, 0.2, -0.1, 0, 0, 0, 1], big: [-0.1, 0, 0, 0.5, 0.5, 1, 0.3, 0, 0.15, 0, 0], hips: [-0.03, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  up: [-0.05, 0, 0, 0.4, 0.4, 0.5, 0.2, 0, 0.1, 0, 0], down: [0, 0.5, 0.5, 0, 0, 0, 0, 0, 0, 0, 0], hug: [0.03, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], reach: [0.08, 0.5, 0.1, 0, 0, 0.3, 0.1, 0.3, 0, 0.2, 0],
  cheer: [-0.08, 0, 0, 0.6, 0.6, 1, 0.35, 0, 0.2, 0, 0], scratch: [0.03, 0.5, 0.7, 0, 0, -0.4, -0.2, -0.3, 0.3, -0.2, 0], wave: [0, 0.5, 0, 0, 0, 0.5, 0.2, 0, 0, 0, 0],
};

// =====================================================================
//  b3Char: an ACTOR, not a puppet. Every frame it works out what it would be doing at that moment (gesture of the phrase it
//  is saying, listening to the other one, idle business like pushing up the glasses or scratching, reacting to the scene's
//  beats) and gets there through a spring (anticipation, overshoot, settle). On top: a nod, a dip and a hand flick on every
//  stressed word, lip sync from the letters of each word, a head that lags the body, knees that bend, fingers that curl.
//  Same API as before: setPose(pose, at?, from?), live(t), head, bulb, bump, black, crazy(on), dizzy(t, on); plus side(s).
// =====================================================================
function b3Char(S: B3Spec) {
  const tico = S.kind === 'tico', skin = b3Skin(S.fur), faceM = b3Skin(S.face), dark = b3Gloss('#1d1410', 0.3);
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  // torso: a soft cloth sack (wider at the bottom) and the t-shirt collar
  const [tw, th, td] = S.torso, torsoGeo = p3Blob((x, y, z) => [x * tw * (1 + 0.12 * (0.5 - y)), y * th, z * td * (1 + 0.1 * (0.5 - y))], undefined, 40, 30);
  const torso = new THREE.Mesh(torsoGeo, b3Cloth(S.shirt)); torso.position.y = S.sh[1] - th * 0.62; torso.castShadow = torso.receiveShadow = true; body.add(torso);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(tw * 0.42, tw * 0.07, 10, 28), b3Cloth(new THREE.Color(S.shirt).multiplyScalar(0.8).getStyle())); collar.rotation.x = Math.PI / 2; collar.position.y = S.sh[1] + th * 0.28; body.add(collar);
  // legs and feet stay on the ground (in g) while the body dips, leans and twists above them: the knees bend
  const legs = [b3Limb(skin, S.legR, S.legR * 0.85), b3Limb(skin, S.legR, S.legR * 0.85)]; g.add(...legs);
  const feet = [-1, 1].map(() => { const f = new THREE.Group(), m = new THREE.Mesh(p3Blob((x, y, z) => [x * S.legR * 1.7, y * S.legR * 0.8, z * S.legR * 2.4 + S.legR * 0.9]), faceM); m.castShadow = true; m.position.z = -S.legR * 0.6; f.add(m); g.add(f); return f; });
  // arms and hands: a mitten palm, a thumb and three fingers that curl
  const arms = [b3Limb(skin, S.armR * 1.05, S.armR * 0.8), b3Limb(skin, S.armR * 1.05, S.armR * 0.8)]; body.add(...arms);
  const hands = [0, 1].map(() => {
    const h = new THREE.Group(); const palm = new THREE.Mesh(p3Blob((x, y, z) => [x * S.armR * 1.45, y * S.armR * 1.15, z * S.armR * 0.95]), skin); palm.castShadow = true;
    const thumb = new THREE.Group(); thumb.position.set(-S.armR * 0.95, S.armR * 0.2, S.armR * 0.35); const tm = new THREE.Mesh(new THREE.CapsuleGeometry(S.armR * 0.36, S.armR * 0.75, 6, 10), skin); tm.position.y = S.armR * 0.5; thumb.add(tm); thumb.rotation.z = 0.8;
    const fingers = [-0.6, 0, 0.6].map((fx, k) => { const p = new THREE.Group(); p.position.set(fx * S.armR, S.armR * 0.85, 0); p.rotation.z = -fx * 0.25; const len = S.armR * (k === 1 ? 1.15 : 1.0); const c = new THREE.Mesh(new THREE.CapsuleGeometry(S.armR * 0.32, len, 6, 10), skin); c.position.y = len / 2 + S.armR * 0.25; c.castShadow = true; p.add(c); h.add(p); return p; });
    h.add(palm, thumb); body.add(h); return Object.assign(h, { fingers, thumb });
  });
  // head
  const neck = new THREE.Group(); neck.position.y = S.headY - S.R * 0.85; body.add(neck);
  const head = new THREE.Group(); head.position.y = S.R * 0.85; neck.add(head);
  const lag = new THREE.Group(); head.add(lag);
  lag.add(b3Head(S.R, S.fur, S.face, tico ? 0.02 : 0.026));
  const muzzle = new THREE.Mesh(p3Blob((x, y, z) => [x * S.R * 0.42, y * S.R * 0.27, z * S.R * 0.3], undefined, 32, 24), faceM); muzzle.position.set(0, -S.R * 0.44, S.R * 0.8); lag.add(muzzle);
  for (const sx of [-1, 1]) { const n = new THREE.Mesh(new THREE.SphereGeometry(S.R * 0.05, 12, 8), dark); n.position.set(sx * S.R * 0.09, -S.R * 0.3, S.R * 1.04); lag.add(n); }
  const ears = [-1, 1].map((sx) => { const e = new THREE.Group(); e.position.set(sx * S.R * 0.98, 0, -S.R * 0.05); const outer = new THREE.Mesh(p3Blob((x, y, z) => [x * S.R * 0.32 * 0.6, y * S.R * 0.34, z * S.R * 0.34]), skin), inner = new THREE.Mesh(new THREE.SphereGeometry(S.R * 0.2, 20, 14), faceM); outer.position.x = sx * S.R * 0.12; inner.position.set(sx * S.R * 0.18, 0, S.R * 0.03); inner.scale.set(0.35, 1, 1); e.add(outer, inner); lag.add(e); return e; });
  // eyes, glasses, brows, mouth
  const er = tico ? S.R * 0.24 : S.R * 0.27, ex = tico ? S.R * 0.36 : S.R * 0.33, ey = tico ? S.R * 0.1 : S.R * 0.14;
  const eyes = [-1, 1].map((sx) => { const e = b3Eye(er, S.face); e.position.set(sx * ex, ey, S.R * 0.78); lag.add(e); return e; });
  if (tico) for (const sx of [-1, 1]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(er * 1.32, er * 0.18, 16, 48), dark); ring.position.set(sx * ex, ey, S.R * 0.98); lag.add(ring); const lens = new THREE.Mesh(new THREE.CircleGeometry(er * 1.3, 40), new THREE.MeshPhysicalMaterial({ color: '#dfefff', transparent: true, opacity: 0.18, roughness: 0.05, clearcoat: 1 })); lens.position.set(sx * ex, ey, S.R * 0.97); lag.add(lens); }
  if (tico) { const bridge = p3Rod([-ex + er * 1.3, ey, S.R * 0.99], [ex - er * 1.3, ey, S.R * 0.99], er * 0.15, dark); lag.add(bridge, p3Rod([-ex - er * 1.3, ey, S.R * 0.96], [-S.R * 0.96, ey, S.R * 0.15], er * 0.12, dark), p3Rod([ex + er * 1.3, ey, S.R * 0.96], [S.R * 0.96, ey, S.R * 0.15], er * 0.12, dark)); }
  const browY = ey + er * (tico ? 1.75 : 1.55);
  const brows = [-1, 1].map((sx) => { const b = b3Brow(er * 1.4, dark); b.position.set(sx * ex, browY, S.R * 0.92); lag.add(b); return b; });
  const mouth = b3Mouth(S.R * 0.13); mouth.position.set(0, -S.R * 0.56, S.R * 1.02); lag.add(mouth);
  // character extras
  const tufts: THREE.Object3D[] = [];
  if (tico) { const t0 = new THREE.Mesh(new THREE.ConeGeometry(S.R * 0.12, S.R * 0.36, 16), skin); t0.position.set(0, S.R * 1.05, 0.02); lag.add(t0); tufts.push(t0); }
  else for (const [x, rz] of [[-0.32, 0.45], [0, 0], [0.32, -0.45]]) { const tf = new THREE.Mesh(p3Blob((xx, y, z) => [xx * S.R * 0.14 * (1 - y * 0.5), y * S.R * 0.3 + S.R * 0.18, z * S.R * 0.14 * (1 - y * 0.5)]), skin); const p = new THREE.Group(); p.position.set(x * S.R, S.R * 0.88, 0.04); p.rotation.z = rz; p.add(tf); lag.add(p); tufts.push(p); }
  let bump: THREE.Object3D = new THREE.Group(), black: THREE.Object3D = new THREE.Group(), stars = new THREE.Group(), bulb = new THREE.Group();
  if (!tico) {
    const band = new THREE.Mesh(new THREE.RoundedBoxGeometry(S.R * 0.5, S.R * 0.17, S.R * 0.08, 3, S.R * 0.03), b3Skin('#f0b088', 0.7)); band.position.set(S.R * 0.12, -S.R * 0.18, S.R * 1.0); band.rotation.z = -0.5; lag.add(band);
    bump = new THREE.Mesh(new THREE.SphereGeometry(S.R * 0.24, 24, 16), b3Gloss('#ff8f8f', 0.3)); bump.position.set(-S.R * 0.36, S.R * 0.9, S.R * 0.3); lag.add(bump); bump.visible = false;
    black = new THREE.Mesh(new THREE.SphereGeometry(er * 1.35, 24, 16), b3Skin('#5a3d7a')); black.position.set(ex, ey, S.R * 0.72); black.scale.z = 0.5; lag.add(black); black.visible = false;
    for (let i = 0; i < 3; i++) { const s = b3StarMesh(0.1); s.position.set(Math.cos(i * 2.1) * S.R * 0.95, 0, Math.sin(i * 2.1) * S.R * 0.95); stars.add(s); } stars.position.y = S.R * 1.35; lag.add(stars); stars.visible = false;
  } else {
    const glow = b3Gloss('#ffd23d', 0.2); (glow as THREE.MeshPhysicalMaterial).emissive = new THREE.Color('#ffb800'); (glow as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.6;
    bulb.add(new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), glow)); const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 16), b3Gloss('#c9ced8', 0.3)); cap.position.y = -0.17; bulb.add(cap); bulb.position.y = S.R * 1.85; lag.add(bulb); bulb.visible = false;
  }

  // ---------------- the acting
  const mine = tico ? B3_TICO_T : B3_DOTA_T, theirs = tico ? B3_DOTA_T : B3_TICO_T, seed = tico ? 0 : 1.3;
  const inR = (R: [number, number][], s: number) => R.some(([a, b]) => s > a && s < b);
  const LOCK = new Set(['hold', 'hug']), N = 28;
  let pose = tico ? 'cross' : 'up', from = pose, at = -99, crazyOn = false, other = tico ? 1 : -1;
  const myPhrase = (s: number) => { const P = b3Phrases(), j = b3Find(P, s + 0.15, (x) => x.t0); for (let k = j; k >= Math.max(0, j - 1); k--) { const p = P[k]; if (s < p.t1 + 0.45 && inR(mine, (p.t0 + p.t1) / 2)) return p; } return null; };
  const lastKey = (s: number) => { let b = -99; for (const k of B3_KEYS) if (k <= s && k > b) b = k; return b; };
  // what the character would be doing at s (no smoothing): P = [hands x6, lean, twist, roll, shift, yaw, tilt, pitch, lookX, lookY, curlL, curlR, palmL, palmR, brow, wide, pointR, crouch, shrug, wave, scratch, free, oh]
  const raw = (s: number) => {
    const P = new Array(N).fill(0), base = s < at ? from : pose, talk = inR(mine, s), recent = at > -90 && s > at - 0.2 && s < at + 1.6;
    const locked = LOCK.has(base) || recent || crazyOn, ph = myPhrase(s), h = b3Hash;
    let gs = base;
    if (!locked && ph) {
      const list = tico ? ['explain', 'point', 'palm', 'count', 'explain', 'chin', 'shrug'] : ['explain', 'point', 'cheer', 'shrug'];
      gs = ph.q ? 'shrug' : ph.ex ? (tico ? 'big' : 'cheer') : list[Math.floor(h(ph.i * 1.7 + 0.3) * list.length)];
    } else if (!locked && !talk) {   // idle business
      const Wd = tico ? 4.2 : 3.0, q = s + seed * 7, n = Math.floor(q / Wd), u = q - n * Wd, r = h(n * 9.1 + seed);
      if (tico && (base === 'cross' || base === 'point')) { if (r > 0.35 && r < 0.6 && u < 1.0) gs = 'glasses'; else if (r >= 0.6 && r < 0.8 && u < 1.8) gs = 'chin'; }
      if (!tico && (base === 'up' || base === 'down')) { if (r > 0.3 && r < 0.55 && u < 1.5) gs = 'scratch'; else if (r >= 0.55 && r < 0.75 && u < 1.2) gs = 'wave'; }
    }
    const kd = s - lastKey(s);
    if (!locked && kd >= 0) { if (tico && base === 'point' && kd < 1.3) gs = 'point'; if (!tico && !ph && kd < 0.9) { gs = 'cheer'; P[27] = 1; } }
    const hs = S.hands[gs] || S.hands[base] || S.hands[tico ? 'cross' : 'up'], gp = B3_GP[gs] || B3_GP.cross;
    P.splice(0, 6, ...hs[0], ...hs[1]);
    [P[6], P[15], P[16], P[17], P[18], P[19], P[20], P[13], P[14], P[10], P[21]] = gp;
    P[23] = gs === 'shrug' ? 1 : 0; P[24] = gs === 'wave' ? 1 : 0; P[25] = gs === 'scratch' ? 1 : 0; P[26] = locked ? 0 : 1;
    if (ph) {
      P[9] = (h(ph.i * 3.1) - 0.5) * 0.12; P[11] += (h(ph.i + 3.7) - 0.5) * 0.3 + (ph.q ? 0.2 : 0); P[7] += (h(ph.i + 5.3) - 0.5) * 0.3; P[12] = ph.ex ? -0.06 : 0.03;
      if (!locked) for (let i = 0; i < 6; i++) P[i] += (h(ph.i * 7 + i) - 0.5) * 0.08;
    }
    if (!talk && inR(theirs, s)) { P[10] += 0.38 * other; P[13] += 0.35 * other; P[7] += 0.15 * other; P[11] += 0.1 * other; }
    return P;
  };
  const smooth = (t: number) => {
    const A = new Array(N).fill(0);
    for (let j = 0; j < B3_KER.length; j++) { const r = raw(t - j / 30), w = B3_KER[j]; for (let i = 0; i < N; i++) A[i] += w * r[i]; }
    const f = raw(t + 0.13), n = raw(t); for (let i = 0; i < 13; i++) A[i] -= 0.22 * (f[i] - n[i]);   // anticipation: pull back before a move
    return A;
  };
  const V = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
  return Object.assign(g, {
    head, bulb, bump, black,
    setPose(p: string, when = -99, prev?: string) { pose = p; at = when; from = prev ?? p; },
    crazy(on: boolean) { crazyOn = on; },
    dizzy(t: number, on: boolean) { stars.visible = on; stars.rotation.y = t * 3; },
    side(s: number) { other = s; },
    live(t: number) {
      const P = smooth(t), Pl = smooth(t - 0.1), talking = inR(mine, t);
      // beats: stressed words of my lines kick a nod, a dip and a hand flick
      b3Phrases(); let beat = 0; const bj = b3Find(B3_BEAT, t, (x) => x); for (let k = bj; k >= Math.max(0, bj - 3); k--) if (inR(mine, B3_BEAT[k])) beat += b3Imp(t - B3_BEAT[k] + 0.04);
      beat = Math.min(1.2, beat);
      // hops (Dota): when something happens in the scene and he is free, and now and then on his own
      let hop = 0, hsq = 0;
      if (!tico && !crazyOn && !LOCK.has(pose)) {
        const evs = [lastKey(t + 0.1)]; const Wd = 3.0, q = t + seed * 7, n = Math.floor(q / Wd); if (b3Hash(n * 9.1 + seed) > 0.85) evs.push(n * Wd - seed * 7 + 0.3);
        for (const e of evs) { const dt = t - e; if (dt > -0.12 && dt < 0) hsq -= 0.1 * Math.sin((dt + 0.12) / 0.12 * Math.PI); else if (dt >= 0 && dt < 0.42) { const u = dt / 0.42; hop += 4 * u * (1 - u) * 0.22; hsq += 0.08 * Math.cos(u * Math.PI); } else if (dt >= 0.42 && dt < 0.6) hsq -= 0.12 * Math.sin((dt - 0.42) / 0.18 * Math.PI); }
      }
      // body: breathing, squash & stretch, dip on beats, lean, twist, weight shift
      const br = Math.sin(t * (tico ? 2.6 : 3.6) + seed), sq = 0.012 * br + 0.025 * beat + hsq + (talking ? 0.012 * Math.abs(Math.sin(t * 7.5)) : 0);
      body.scale.set(1 - sq * 0.5, 1 + sq, 1 - sq * 0.5);
      body.position.set(P[9], -0.04 * beat - Math.max(0, -hsq) * 0.3 + hop, 0);
      body.rotation.set(P[6] + 0.05 * beat, P[7] + 0.03 * Math.sin(t * 0.9 + seed), -P[9] * 1.2 + 0.025 * Math.sin(t * 1.3 + seed));
      // head: yaw, tilt, a nod per beat; the inner head lags behind and the ears and tufts follow through
      neck.position.y = S.headY - S.R * 0.85 - 0.04 * P[23];
      const tk = talking ? 1 : 0;
      neck.rotation.set(P[12] - P[6] * 0.5 + 0.13 * beat + 0.02 * Math.sin(t * 1.1 + seed) + tk * 0.04 * Math.sin(t * 3.3), P[10] + 0.04 * Math.sin(t * 0.7 + seed) + tk * 0.09 * Math.sin(t * 1.7 + seed), P[11] + tk * 0.07 * Math.sin(t * 2.1 + 1));
      const lx = (Pl[12] - P[12]) * 0.8, ly = (Pl[10] - P[10]) * 0.6, lz = (Pl[11] - P[11]) * 0.9 + (Pl[9] - P[9]) * 2.5;
      lag.rotation.set(lx, ly, lz);
      const sw = lz * 3 + ly * 1.5 + 0.12 * beat + 0.04 * Math.sin(t * 2.3 + seed);
      ears.forEach((e, i) => { e.rotation.z = (i ? 1 : -1) * sw; e.rotation.y = 0.05 * Math.sin(t * 2 + i) + (i ? -1 : 1) * 0.2 * hop; });
      tufts.forEach((tf, i) => { tf.rotation.z = (tico ? 0 : [0.45, 0, -0.45][i]) + sw * (1.8 + i * 0.3); tf.rotation.x = -hop * 2 - beat * 0.2; });
      // mouth: lip sync from the words while I talk; a little "oh" when surprised; my resting face otherwise
      const lip = talking ? b3Lip(t) : null, rest: [number, number] = tico ? [0.8, 0.08] : [0.6, 0.35];
      const mo: [number, number] = lip ? [lip[0], Math.max(0.05, lip[1])] : P[27] > 0.2 ? [p3Lerp(rest[0], 0.7, P[27]), p3Lerp(rest[1], 0.8, P[27])] : rest;
      mouth.set(mo[0], mo[1]); lag.scale.set(1 - mo[1] * 0.02, 1 + (lip ? mo[1] * 0.04 : 0) + hsq * 0.5, 1);
      // eyes: blinks (also at the start of each phrase and on big head turns), wider on surprise, a squint on stressed words
      const bt = (t + seed) % 3.3, dbl = b3Hash(Math.floor((t + seed) / 3.3)) > 0.6, ph = myPhrase(t);
      const closed = bt < 0.1 || (dbl && bt > 0.2 && bt < 0.3) || (ph && t - ph.t0 > -0.05 && t - ph.t0 < 0.05) || Math.abs(Pl[10] - P[10]) > 0.12;
      const lidRest = (tico ? 0.3 : 0.2) - P[20] * 0.35 + 0.12 * beat;
      const sac = Math.floor((t + seed) / 1.4), sx = (b3Hash(sac) - 0.5) * 0.2, sy = (b3Hash(sac + 7) - 0.5) * 0.15;
      eyes.forEach((e, i) => e.pose(crazyOn ? (i ? 0.45 : -0.35) + 0.15 * Math.sin(t * 9 + i) : (P[13] + sx) * (tico ? 1 : 0.35), crazyOn ? (i ? 0.3 : -0.2) + 0.15 * Math.cos(t * 9 + i) : (P[14] + sy) * (tico ? 1 : 0.35), closed ? 1 : p3Clamp(lidRest, -0.15, 0.6)));
      // brows: up with the gesture, on stressed words and in questions; Tico keeps his "told you so" tilt
      brows.forEach((b, i) => { b.position.y = browY + er * (0.35 * P[19] + 0.3 * beat); b.rotation.z = tico ? (i ? -0.18 : 0.1) * (1 - 0.6 * Math.max(0, P[19])) : (i ? 0.22 : -0.22) * (crazyOn ? -1 : 1) * (1 - 0.5 * Math.max(0, P[19])); });
      // legs: from the hips (wherever the body went) down to feet planted on the ground, knees bend forward
      body.updateMatrix(); const tap = tico && !talking ? 0.35 * Math.max(0, Math.sin(t * 8)) * (b3Hash(Math.floor(t / 2.5)) > 0.5 ? 1 : 0) : 0;
      [-1, 1].forEach((s, i) => {
        const hp = new THREE.Vector3(s * S.hip[0], S.hip[1], 0).applyMatrix4(body.matrix), ft = new THREE.Vector3(s * S.hip[0] * 1.1 + P[9] * 0.3, S.legR * 0.9 + hop * 0.9, 0.02);
        const r = b3IK(hp, ft, (S.hip[1] - S.legR) * 0.56, (S.hip[1] - S.legR) * 0.56, new THREE.Vector3(s * 0.3, 0, 1)); legs[i].set(hp, r.e, r.h);
        feet[i].position.set(ft.x, S.legR * 0.7 + hop * 0.9, S.legR * 0.6); feet[i].rotation.set(i === 1 ? -tap : 0, 0, 0); feet[i].rotation.x += hop * 1.2;
      });
      // arms: spring-smoothed targets + a flick on stressed words + waving / scratching; hands turn palm-up and fingers curl
      [0, 1].forEach((i) => {
        const s = i ? 1 : -1, tg = new THREE.Vector3(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]);
        const fl = P[26] * (talking ? 1 : 0) * (i === 1 ? 1 : 0.5) * beat; tg.y -= 0.07 * fl; tg.z += 0.05 * fl;
        tg.y += 0.012 * br; const gw = P[26] * tk * (i === 1 ? 1 : 0.6); tg.x += gw * 0.05 * Math.sin(t * 3.1 + i * 2); tg.y += gw * 0.05 * Math.sin(t * 2.3 + i); tg.z += gw * 0.03 * Math.sin(t * 2.7 + i); if (i === 1) { tg.x += P[24] * 0.07 * Math.sin(t * 14); tg.y += P[25] * 0.04 * Math.sin(t * 18); tg.z += P[25] * 0.03 * Math.cos(t * 18); }
        const sh = new THREE.Vector3(s * S.sh[0], S.sh[1] + 0.01 * br + 0.06 * P[23], 0);
        const r = b3IK(sh, tg, S.arm[0], S.arm[1], new THREE.Vector3(s * 0.8, -0.6, -0.5)); arms[i].set(sh, r.e, r.h);
        const hd = hands[i]; hd.position.copy(r.h); hd.quaternion.setFromUnitVectors(Y, V.copy(r.h).sub(r.e).normalize()); hd.rotateY(s * (P[17 + i] * 1.4 - 0.2));
        const curl = p3Clamp(P[15 + i]), pt = i === 1 ? p3Clamp(P[21]) : 0;
        hd.fingers.forEach((f, k) => { f.rotation.x = 1.5 * curl * (k === 1 ? 1 - pt : 1) + (P[24] && i === 1 ? 0.15 * Math.sin(t * 14 + k) : 0); });
        hd.thumb.rotation.x = 0.9 * curl;
      });
    },
  });
}
const B3_TICO_T: [number, number][] = [[0.1, 9.28], [12.25, 36.19], [38.72, 99.54], [103.43, 109.55], [113.5, 146.3]];
const B3_DOTA_T: [number, number][] = [[10.02, 11.49], [36.88, 38.22], [100.18, 102.54], [110.08, 112.76], [146.93, 151.21]];
function b3Tico() { const c = b3Char(B3_TICO); c.setPose('cross'); return c; }
function b3Dota() { const c = b3Char(B3_DOTA); c.setPose('up'); return c; }

// ---------------- soft, smooth scenery (no faceted low-poly): puffy clouds and round trees
function b3Cloud(p: Vec3, s = 1) { const m = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 1, sheen: 1, sheenColor: new THREE.Color('#dfefff'), emissive: '#ffffff', emissiveIntensity: 0.18 }); const g = new THREE.Group(); for (const [x, y, z, r] of [[0, 0, 0, 1.4], [1.4, -0.2, 0.2, 1.0], [-1.3, -0.3, 0, 1.0], [0.5, 0.6, -0.3, 0.95], [-0.6, 0.4, 0.3, 0.8]]) { const b = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), m); b.position.set(x, y, z); g.add(b); } g.position.set(...p); g.scale.setScalar(s); return g; }
function b3Tree(p: Vec3, s = 1, seed = 1) { const r = p3Rnd(seed), trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 1.4, 16), b3Mat('#8a5a3b', 0.9)); trunk.position.y = 0.7; const g = new THREE.Group(); g.add(trunk); const leaf = new THREE.MeshPhysicalMaterial({ color: '#4caf50', roughness: 0.85, sheen: 0.6, sheenColor: new THREE.Color('#bff5a0') }); for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(p3Blob((x, y, z) => { const n = p3Fbm3(x * 2 + seed, y * 2, z * 2) * 0.35; return [x * (0.9 + n), y * (0.85 + n), z * (0.9 + n)]; }, undefined, 32, 24), leaf); b.position.set((r() - 0.5) * 0.8, 1.9 + r() * 0.8, (r() - 0.5) * 0.6); b.scale.setScalar(0.7 + r() * 0.4); b.castShadow = true; g.add(b); } g.position.set(...p); g.scale.setScalar(s); return g; }
function b3Forest(n = 22, seed = 3, z0 = -14, width = 60) { const r = p3Rnd(seed), g = new THREE.Group(); for (let i = 0; i < n; i++) g.add(b3Tree([p3Lerp(-width / 2, width / 2, r()), 0, z0 - r() * 18], 0.8 + r() * 0.7, i + seed)); return g; }
// the image finish shared by every scene: studio reflections, ACES colour, a soft grade, vignette and a little grain
let B3_FIN: { composer: THREE.EffectComposer; pass: THREE.RenderPass; grade: THREE.ShaderPass } | null = null;
function b3Finish(w: World) {
  const r = w.renderer; w.scene.environment = p3Env(r); (w.scene as THREE.Scene & { environmentIntensity: number }).environmentIntensity = 0.3; r.toneMappingExposure = 0.95;
  if (!B3_FIN) {
    const composer = new THREE.EffectComposer(r, new THREE.WebGLRenderTarget(1080, 1920, { type: THREE.HalfFloatType, samples: 4 })); composer.setSize(1080, 1920);
    const pass = new THREE.RenderPass(w.scene, w.camera); composer.addPass(pass); composer.addPass(new THREE.OutputPass());
    const grade = new THREE.ShaderPass({ ...P3_GRADE, uniforms: { tDiffuse: { value: null }, uT: { value: 0 }, uSat: { value: 1.1 }, uCurve: { value: 0.4 }, uVig: { value: 0.55 }, uGrain: { value: 0.01 }, uRed: { value: 0 }, uGray: { value: 0 } } }); composer.addPass(grade);
    B3_FIN = { composer, pass, grade };
  }
  w.present = () => { const f = B3_FIN!; f.pass.scene = w.scene; f.pass.camera = w.camera; f.grade.uniforms.uT.value = Math.round(P3_T.value * 30); f.composer.render(); };
}
