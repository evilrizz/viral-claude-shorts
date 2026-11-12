// =====================================================================
//  World of "Cómo funciona un avión" in 3D (Idio-two): Tico and Dota in 3D, the board plane that turns into the
//  IDIO-TWO light plane piece by piece, the wing in cut, props, the cabin and the sets. Names start with "a3".
//  Everything is posed from t (absolute video seconds): no clocks, no randomness, nothing that accumulates.
// =====================================================================
const M3 = { ink: '#14161d', paper: '#f2efe6', lime: '#c8f53a', orange: '#ff6a3d', sky: '#8ec9f0', night: '#10121a', cream: '#fff3d6' };
const m3Mat = (c: string, r = 0.55, e = 0) => new THREE.MeshPhysicalMaterial({ color: c, roughness: r, metalness: 0, clearcoat: r < 0.5 ? 0.6 : 0, clearcoatRoughness: 0.15, sheen: r >= 0.7 ? 0.4 : 0, sheenRoughness: 0.7, sheenColor: new THREE.Color('#ffffff'), emissive: e ? c : '#000000', emissiveIntensity: e });
const m3Sph = (r: number, mat: THREE.Material, p: Vec3, s: Vec3 = [1, 1, 1]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 28), mat); m.position.set(...p); m.scale.set(...s); m.castShadow = m.receiveShadow = true; return m; };
const m3BoxM = (w: number, h: number, d: number, mat: THREE.Material, p: Vec3 = [0, 0, 0], r: Vec3 = [0, 0, 0]) => { const rr = Math.min(w, h, d) * 0.32, m = new THREE.Mesh(rr > 0.004 ? new THREE.RoundedBoxGeometry(w, h, d, 3, rr) : new THREE.BoxGeometry(w, h, d), mat); m.position.set(...p); m.rotation.set(...r); m.castShadow = m.receiveShadow = true; return m; };
const m3Grp = (p: Vec3 = [0, 0, 0], ...kids: THREE.Object3D[]) => { const g = new THREE.Group(); g.position.set(...p); if (kids.length) g.add(...kids); return g; };
// a limb: rod + round joints at both ends

// ---------------- Tico: tall dark-brown monkey, round glasses, blue t-shirt. Feet at y = 0, facing +z.
type M3Part = 'eng' | 'stab' | 'elev' | 'fin' | 'rud' | 'ail' | 'flap';
const m3Label = (text: string, w = 1024, h = 220, fg = '#1b3fb0', bg = '') => p3Paint(w, h, (c) => { if (bg) { c.fillStyle = bg; c.fillRect(0, 0, w, h); } c.font = `italic 900 ${h * 0.62}px Inter, Arial, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = h * 0.08; c.strokeStyle = '#ffffff'; c.strokeText(text, w / 2, h / 2); c.fillStyle = fg; c.fillText(text, w / 2, h / 2); });
function m3Plane() {
  const white = m3Mat('#f4f6fa', 0.45), wood = m3Mat('#c98a4b', 0.8), balsa = m3Mat('#ead0a0', 0.8), orange = m3Mat('#ff7a3d', 0.5), blue = m3Mat('#1b3fb0', 0.5), dark = m3Mat('#22334f', 0.25), glass = m3Mat('#7cc0f5', 0.15, 0.25), metal = m3Mat('#b8c0cf', 0.4), tire = m3Mat('#2b2f3a', 0.8);
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const L: Record<string, THREE.Object3D> = {}, P: Record<M3Part, THREE.Group> = {} as Record<M3Part, THREE.Group>, PM: Record<M3Part, THREE.MeshStandardMaterial[]> = {} as Record<M3Part, THREE.MeshStandardMaterial[]>;
  const part = (k: M3Part, mats: THREE.MeshStandardMaterial[], ...kids: THREE.Object3D[]) => { const gg = m3Grp([0, 0, 0], ...kids); P[k] = gg; PM[k] = mats; body.add(gg); return gg; };
  // stage 0: the plank and the balsa board wing
  L.plank = m3BoxM(7, 0.3, 0.5, wood, [0, 0, 0]); body.add(L.plank);
  L.boardW = m3BoxM(1.4, 0.07, 8.4, balsa, [0.5, 0.25, 0]); body.add(L.boardW);
  // stage 1: real high wing with orange tips and struts
  const wing = m3Grp([0.6, 0.72, 0], m3BoxM(1.5, 0.1, 9.6, white), m3BoxM(1.5, 0.11, 0.5, orange, [0, 0, 4.6]), m3BoxM(1.5, 0.11, 0.5, orange, [0, 0, -4.6]));
  L.wing = wing; body.add(wing);
  L.strut = m3Grp([0, 0, 0], p3Rod([0.4, -0.2, 0.5], [0.6, 0.66, 2.3], 0.04, metal), p3Rod([0.4, -0.2, -0.5], [0.6, 0.66, -2.3], 0.04, metal)); body.add(L.strut);
  // stage 2: the fuselage (a lathe, nose +x)
  const prof = [[0.001, -3.6], [0.14, -3.5], [0.3, -2.4], [0.5, -1.0], [0.58, 0.2], [0.6, 1.4], [0.56, 2.4], [0.5, 2.9], [0.001, 2.95]].map(([r, y]) => new THREE.Vector2(r, y));
  const fus = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), white); fus.rotation.z = -Math.PI / 2; fus.castShadow = fus.receiveShadow = true;
  L.fus = m3Grp([0, 0.12, 0], fus); body.add(L.fus);
  // stage 3: windshield and side windows
  L.wins = m3Grp([0, 0.12, 0], m3BoxM(0.5, 0.34, 1.0, glass, [2.15, 0.38, 0], [0, 0, 0.75]), m3BoxM(0.55, 0.28, 1.2, glass, [1.3, 0.34, 0]), m3BoxM(0.5, 0.26, 1.18, glass, [0.6, 0.32, 0])); body.add(L.wins);
  // stage 4: stripe and landing gear
  L.stripe = m3Grp([0, 0.12, 0], m3BoxM(5.6, 0.1, 1.22, orange, [0.1, -0.12, 0]), m3BoxM(5.2, 0.05, 1.2, blue, [0.3, -0.26, 0])); body.add(L.stripe);
  const wheel = (x: number, z: number, r: number) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.16, 20), tire); m.rotation.x = Math.PI / 2; m.position.set(x, -0.95, z); m.castShadow = true; return m; };
  L.gear = m3Grp([0, 0, 0], p3Rod([1.0, -0.3, 0.3], [1.0, -0.9, 0.75], 0.05, metal), p3Rod([1.0, -0.3, -0.3], [1.0, -0.9, -0.75], 0.05, metal), p3Rod([2.6, -0.3, 0], [2.7, -0.95, 0], 0.05, metal), wheel(1.0, 0.82, 0.24), wheel(1.0, -0.82, 0.24), wheel(2.7, 0, 0.18)); body.add(L.gear);
  // stage 5: the IDIO-TWO livery on both sides and the logo on the fin
  const name = m3Label('IDIO-TWO'), logo = p3Paint(256, 256, (c) => { c.fillStyle = '#ff7a3d'; c.beginPath(); c.arc(128, 128, 118, 0, 7); c.fill(); c.lineWidth = 16; c.strokeStyle = '#fff'; c.stroke(); c.fillStyle = '#fff'; c.font = '900 140px Inter, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('i2', 128, 136); });
  const decal = (tex: THREE.Texture, w: number, h: number, p: Vec3, ry: number) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.5 })); m.position.set(...p); m.rotation.y = ry; return m; };
  L.livery = m3Grp([0, 0, 0], decal(name, 2.4, 0.52, [-1.0, 0.22, 0.56], 0), decal(name, 2.4, 0.52, [-1.0, 0.22, -0.56], Math.PI), decal(logo, 0.55, 0.55, [-3.25, 0.95, 0.06], 0), decal(logo, 0.55, 0.55, [-3.25, 0.95, -0.06], Math.PI)); body.add(L.livery);
  // the parts that get added (each with its own materials so it can glow lime)
  const eMats = [m3Mat('#ff7a3d', 0.5), m3Mat('#2b2f3a', 0.6)];
  const cowl = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.42, 0.7, 28), eMats[0]); cowl.rotation.z = Math.PI / 2; cowl.position.set(3.25, 0.12, 0);
  const spinner = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.4, 20), eMats[0]); spinner.rotation.z = -Math.PI / 2; spinner.position.set(3.82, 0.12, 0);
  const prop = m3Grp([3.68, 0.12, 0], m3BoxM(0.06, 2.6, 0.2, eMats[1]), m3BoxM(0.06, 0.2, 2.6, eMats[1])); (prop.children[1] as THREE.Mesh).visible = false;
  part('eng', eMats, cowl, spinner, prop);
  const sMats = [m3Mat('#f4f6fa', 0.45)], eM = [m3Mat('#ff7a3d', 0.5)], fMats = [m3Mat('#f4f6fa', 0.45)], rM = [m3Mat('#ff7a3d', 0.5)], aM = [m3Mat('#ff7a3d', 0.5)], flM = [m3Mat('#ff7a3d', 0.5)];
  part('stab', sMats, m3BoxM(0.9, 0.07, 3.4, sMats[0], [-3.0, 0.22, 0]));
  const elev = m3Grp([-3.45, 0.22, 0], m3BoxM(0.4, 0.06, 3.3, eM[0], [-0.2, 0, 0])); part('elev', eM, elev);
  const finShape = p3Extruded([[0.0, 0], [-0.9, 0], [-1.1, 1.45], [-0.6, 1.45]], 0.09); const fin = new THREE.Mesh(finShape, fMats[0]); fin.position.set(-2.55, 0.25, 0); fin.castShadow = true; part('fin', fMats, fin);
  const rud = m3Grp([-3.45, 0.25, 0], m3BoxM(0.32, 1.42, 0.07, rM[0], [-0.16, 0.71, 0])); part('rud', rM, rud);
  const ailL = m3Grp([-0.15, 0.72, 3.9], m3BoxM(0.36, 0.08, 1.4, aM[0], [-0.18, 0, 0])), ailR = m3Grp([-0.15, 0.72, -3.9], m3BoxM(0.36, 0.08, 1.4, aM[0], [-0.18, 0, 0])); part('ail', aM, ailL, ailR);
  const flapL = m3Grp([-0.15, 0.7, 2.0], m3BoxM(0.36, 0.07, 1.6, flM[0], [-0.18, 0, 0])), flapR = m3Grp([-0.15, 0.7, -2.0], m3BoxM(0.36, 0.07, 1.6, flM[0], [-0.18, 0, 0])); part('flap', flM, flapL, flapR);
  const lime = new THREE.Color(M3.lime);
  const base = new Map<THREE.MeshStandardMaterial, THREE.Color>(); for (const k in PM) for (const m of PM[k as M3Part]) base.set(m, m.color.clone());
  const show = (o: THREE.Object3D, f: number) => { o.visible = f > 0.01; o.scale.setScalar(Math.max(0.001, f)); };
  return Object.assign(g, {
    body, parts: P,
    // which parts are on (0..1 grow) and how far the board has turned into the plane
    pose(stage: number, on: Partial<Record<M3Part, number>>) {
      const f = (k: number) => p3Clamp(stage - (k - 1));
      show(L.boardW, 1 - f(1)); show(L.wing, f(1)); show(L.strut, f(1));
      show(L.plank, 1 - f(2)); L.fus.visible = f(2) > 0.01; L.fus.scale.set(1, Math.max(0.001, f(2)), Math.max(0.001, f(2)));
      show(L.wins, f(3)); show(L.stripe, f(4)); show(L.gear, f(4)); show(L.livery, f(5));
      for (const k of ['eng', 'stab', 'elev', 'fin', 'rud', 'ail', 'flap'] as M3Part[]) show(P[k], on[k] ?? 0);
    },
    glow(k: M3Part, u: number) { for (const m of PM[k]) { m.color.copy(base.get(m)!).lerp(lime, u); m.emissive.copy(lime); m.emissiveIntensity = u * 0.55; } },
    spin(t: number, rps = 6) { prop.rotation.x = t * rps * Math.PI * 2; (prop.children[1] as THREE.Mesh).visible = rps > 2; },
    controls(c: { elev?: number; rud?: number; ailL?: number; ailR?: number; flap?: number }) {
      elev.rotation.z = c.elev ?? 0; rud.rotation.y = c.rud ?? 0; ailL.rotation.z = c.ailL ?? 0; ailR.rotation.z = c.ailR ?? 0;
      flapL.rotation.z = -(c.flap ?? 0); flapR.rotation.z = -(c.flap ?? 0);
    },
  });
}
// paints a part lime for a moment when it is added (k: ramp in 0..1 over ~0.3 s, then fades)
const m3AddGlow = (t: number, t0: number) => (t < t0 ? 0 : t < t0 + 1.0 ? 1 : 1 - p3Clamp((t - t0 - 1.0) / 0.6));

// ---------------- the wing in cut (p3Airfoil) with a flap and the lift arrow; air with p3Airflow
function m3Wing() {
  const foil = p3Airfoil(), flapMat = m3Mat('#ff7a3d', 0.5);
  const fp: number[][] = [[0, 0.075], [1.05, 0.006], [1.05, -0.012], [0, -0.075]]; for (let i = 1; i < 12; i++) { const a = -Math.PI / 2 - i / 12 * Math.PI; fp.push([Math.cos(a) * 0.075, Math.sin(a) * 0.075]); }
  const flapM = new THREE.Mesh(p3Extruded(fp, 2.96), flapMat); flapM.castShadow = true;
  const flap = m3Grp([1.93, 0.0, 0], flapM); foil.add(flap);   // hinged right at the trailing edge: it swings down, it never leaves the wing
  const bracket = m3Mat('#3a3f4d', 0.5), mount = new THREE.Group(); for (const z of [-0.95, 0.95]) mount.add(m3BoxM(0.42, 0.1, 0.07, bracket, [1.82, -0.06, z])); foil.add(mount); flap.visible = mount.visible = false;   // only the flaps scene shows them
  const lift = p3Arrow([0, 0.6, 1.7], [0, 1, 0], 2.6, M3.lime, 0.28);
  const downs = [0.8, 1.9, 3.0].map((x) => p3Arrow([x, -0.6, 1.7], [0.25, -1, 0], 1.5, C3.air, 0.15));
  return { foil, flap, mount, flapMat, lift, downs, air: p3Airflow(7, -1.8, 2.1, 1.6) };
}

// ---------------- props
function m3Table() { const w = m3Mat('#b97a4a', 0.75); return m3Grp([0, 0, 0], m3BoxM(4, 0.15, 1.6, w, [0, 1.0, 0]), ...[[-1.8, -0.65], [1.8, -0.65], [-1.8, 0.65], [1.8, 0.65]].map(([x, z]) => m3BoxM(0.14, 1.0, 0.14, w, [x, 0.5, z]))); }
function m3Gauge() {
  const face = p3Paint(512, 512, (c) => { c.fillStyle = '#15161c'; c.beginPath(); c.arc(256, 256, 250, 0, 7); c.fill(); c.lineWidth = 28; c.strokeStyle = '#4a4c56'; c.beginPath(); c.arc(256, 300, 170, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); c.strokeStyle = '#ff6a3d'; c.beginPath(); c.arc(256, 300, 170, Math.PI * 1.15, Math.PI * 1.35); c.stroke(); c.fillStyle = '#ff6a3d'; c.font = '900 60px monospace'; c.textAlign = 'center'; c.fillText('E', 110, 300); c.fillStyle = '#cfcdc4'; c.fillText('F', 402, 300); c.font = '700 34px monospace'; c.fillText('COMBUSTIBLE', 256, 430); });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.2, 48), m3Mat('#2a2c35', 0.4)); disc.rotation.x = Math.PI / 2;
  const dial = new THREE.Mesh(new THREE.CircleGeometry(1.4, 64), new THREE.MeshStandardMaterial({ map: face, roughness: 0.5 })); dial.position.y = 0.101; disc.add(dial); dial.rotation.x = -Math.PI / 2;
  const needle = m3Grp([0, -0.25, 0.14], m3BoxM(0.07, 1.0, 0.04, m3Mat(M3.lime, 0.3, 0.5), [0, 0.5, 0])), hub = m3Sph(0.12, m3Mat(M3.lime, 0.3, 0.5), [0, -0.25, 0.16]);
  return Object.assign(m3Grp([0, 0, 0], disc, needle, hub), { needle });
}
function m3Card(meta: string, title: string, line: string, year: string, stamp = '') {
  const tex = p3Paint(1024, 640, (c) => { c.fillStyle = '#f2efe6'; c.fillRect(0, 0, 1024, 640); c.fillStyle = '#6b6a63'; c.font = '700 34px monospace'; c.fillText(meta, 56, 80); c.fillStyle = '#c9c5b6'; c.fillRect(56, 104, 912, 4); c.fillStyle = '#14161d'; c.font = '900 92px Inter, Arial'; c.fillText(title, 56, 230); c.fillStyle = '#4a4943'; c.font = '700 46px Inter, Arial'; c.fillText(line, 56, 310); c.fillStyle = '#14161d'; c.fillRect(56, 380, 380, 160); c.fillStyle = '#d4ff3a'; c.font = '900 120px monospace'; c.fillText(year, 80, 506);
    if (stamp) { c.save(); c.translate(740, 470); c.rotate(-0.17); c.strokeStyle = '#ff6a3d'; c.lineWidth = 12; c.strokeRect(-190, -66, 380, 132); c.fillStyle = '#ff6a3d'; c.font = '900 72px Inter, Arial'; c.textAlign = 'center'; c.fillText(stamp, 0, 26); c.restore(); } });
  return new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.25, 0.06), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }));
}
function m3Bar(color: string) { const frame = m3BoxM(0.9, 4, 0.5, new THREE.MeshStandardMaterial({ color: '#4a4c56', transparent: true, opacity: 0.35 }), [0, 2, 0]); const fill = m3Grp([0, 0, 0], m3BoxM(0.7, 3.9, 0.4, m3Mat(color, 0.4, 0.3), [0, 1.95, 0])); return Object.assign(m3Grp([0, 0, 0], frame, fill), { level(u: number) { fill.scale.y = Math.max(0.01, u); } }); }
function m3Bike() {
  const O = m3Mat('#1d1410', 0.5), F = m3Mat('#ff6a3d', 0.4);
  const wheel = (x: number) => { const w = m3Grp([x, 0.62, 0], new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.06, 12, 40), O)); for (let i = 0; i < 6; i++) { const s = m3BoxM(0.02, 1.12, 0.02, m3Mat('#9aa3b2', 0.4)); s.rotation.z = i * Math.PI / 6; w.add(s); } return w; };
  const w1 = wheel(-0.95), w2 = wheel(0.95);
  const frame = m3Grp([0, 0, 0], p3Rod([-0.95, 0.62, 0], [-0.25, 1.35, 0], 0.06, F), p3Rod([-0.25, 1.35, 0], [0.6, 1.35, 0], 0.06, F), p3Rod([0.6, 1.35, 0], [0.95, 0.62, 0], 0.06, F), p3Rod([-0.25, 1.35, 0], [0.05, 0.62, 0], 0.06, F), p3Rod([0.05, 0.62, 0], [0.6, 1.35, 0], 0.06, F), p3Rod([-0.95, 0.62, 0], [0.05, 0.62, 0], 0.06, F), p3Rod([0.6, 1.35, 0], [0.7, 1.7, 0], 0.05, O), p3Rod([0.6, 1.7, -0.3], [0.8, 1.7, 0.3], 0.04, O));
  return Object.assign(m3Grp([0, 0, 0], w1, w2, frame), { roll(t: number) { w1.rotation.z = w2.rotation.z = -t * 9; } });
}
const m3Rock = () => new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 0), m3Mat('#8d8f96', 0.9));
// stars and drifting specks for the dark sets
function m3Specks(n = 120, spread = 30) { const r = p3Rnd(7), sw = p3Swarm(n, new THREE.IcosahedronGeometry(0.05, 0), new THREE.MeshBasicMaterial({ color: '#e8e6dc' })); const P = [...Array(n)].map(() => [r() * spread - spread / 2, r() * 14, -r() * 20]); return Object.assign(sw, { pose(t: number) { P.forEach(([x, y, z], i) => sw.put(i, x - ((t * 0.3) % 2), y + Math.sin(t + i) * 0.1, z, 0.6 + (i % 3) * 0.4)); sw.done(); } }); }
// confetti (prize): falls from start, deterministic
function m3Confetti(n = 90) { const r = p3Rnd(11), sw = p3Swarm(n, new THREE.BoxGeometry(0.16, 0.08, 0.02), new THREE.MeshBasicMaterial({ color: '#ffffff' })); const cols = ['#ff5a5f', '#ffd23d', '#3ccf91', '#4c7dff', '#ff8a3d', '#8b6cff'].map((c) => new THREE.Color(c)); const P = [...Array(n)].map(() => [r() * 10 - 5, 6 + r() * 3, r() * 4 - 2, r() * 6]); P.forEach((_, i) => sw.setColorAt(i, cols[i % 6])); return Object.assign(sw, { pose(t: number, t0: number) { P.forEach(([x, y, z, ph], i) => { const u = t - t0; if (u < 0) { sw.hide(i); return; } sw.put(i, x + Math.sin(u * 2 + ph) * 0.4, y - u * 2.6, z, 1, 1, 1, u * 3 + ph, u * 2, ph); }); sw.done(); } }); }
// prize rays: a disc of wedges that faces the camera (rotate .rotation.z to spin)
function m3Rays(c1 = '#ffd84a', r = 14) { const g = new THREE.Group(); for (let i = 0; i < 16; i++) { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(Math.cos(i * Math.PI / 8) * r, Math.sin(i * Math.PI / 8) * r); s.lineTo(Math.cos(i * Math.PI / 8 + 0.12) * r, Math.sin(i * Math.PI / 8 + 0.12) * r); g.add(new THREE.Mesh(new THREE.ShapeGeometry(s), new THREE.MeshBasicMaterial({ color: c1, transparent: true, opacity: 0.55 }))); } return g; }
// a ribbon: a flat satin strip along a smooth curve (width along wdir), optionally with a V cut at the end
function m3Ribbon(ctrl: Vec3[], width: number, wdir: Vec3, mat: THREE.Material, notch = 0, closed = false) {
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
function m3Bow() {
  const sat = new THREE.MeshPhysicalMaterial({ color: '#e8203a', roughness: 0.35, sheen: 1, sheenColor: new THREE.Color('#ff9aa8'), sheenRoughness: 0.35, clearcoat: 0.4, clearcoatRoughness: 0.3, side: THREE.DoubleSide });
  const g = new THREE.Group();
  for (const s of [-1, 1]) {
    const loop = m3Ribbon([[0, 0, 0], [s * 0.35, 0.32, 0.05], [s * 0.85, 0.5, 0], [s * 1.12, 0.22, -0.05], [s * 1.0, -0.12, 0], [s * 0.55, -0.16, 0.05], [s * 0.12, -0.04, 0]], 0.5, [0, 0.35, 1], sat, 0, true);
    loop.rotation.set(-0.25, s * -0.35, s * 0.18); g.add(loop);
    const tail = m3Ribbon([[s * 0.05, -0.05, 0.15], [s * 0.22, -0.38, 0.22], [s * 0.32, -0.68, 0.14], [s * 0.5, -0.95, 0.24], [s * 0.62, -1.15, 0.16]], 0.34, [1, s * 0.35, 0.25], sat, 0.16);
    g.add(tail);
  }
  const knot = new THREE.Mesh(new THREE.RoundedBoxGeometry(0.34, 0.4, 0.42, 4, 0.12), sat); knot.position.z = 0.06; knot.castShadow = true; g.add(knot);
  const fold = m3Ribbon([[-0.17, 0.12, 0.28], [0, 0.16, 0.3], [0.17, 0.12, 0.28]], 0.06, [0, 1, 0], new THREE.MeshPhysicalMaterial({ color: '#b5122a', roughness: 0.5, side: THREE.DoubleSide })); g.add(fold);
  return g;
}
// a 3D star (banner)
const m3StarMesh = (r: number, c = '#ffd23d') => { const m = new THREE.Mesh(p3Extruded([...Array(10)].map((_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; return [Math.cos(a) * rr, Math.sin(a) * rr]; }), r * 0.35), m3Mat(c, 0.4, 0.25)); m.castShadow = true; return m; };

// ---------------- sets
// the sky set: soft light, grass, trees far away, clouds in layers (.pose(t) drifts them), optional runway
function m3SkySet(w: World, o: { runway?: boolean; ground?: boolean } = {}) {
  p3Lights(w); w.scene.fog = new THREE.Fog(P3_SKY, 40, 130);
  if (o.ground !== false) { w.add(p3Ground(C3.grass, -6)); w.add(m3Forest(30, 5, -30, 120)).position.y = -6; }
  const runway = o.runway ? w.add(p3Runway()) : null; if (runway) runway.position.y = -5.97;
  const clouds = [[-12, 6, -14, 1.6], [10, 9, -20, 2], [-4, 12, -26, 1.8], [16, 3, -10, 1.2], [-18, 2, -8, 1.3], [4, -2, -18, 1.5]].map(([x, y, z, s]) => w.add(m3Cloud([x, y, z], s)));
  return { runway, pose(t: number, speed = 1) { clouds.forEach((c, i) => { const x0 = [-12, 10, -4, 16, -18, 4][i]; c.position.x = ((x0 - t * speed * (1.2 + i * 0.25) + 60) % 60 + 60) % 60 - 30; }); } };
}
// the dark set: near-black, a soft rim of light, specks drifting, dark ground
function m3NightSet(w: World) {
  w.add(new THREE.HemisphereLight('#c8d4ff', '#1a1c24', 0.8));
  const key = new THREE.DirectionalLight('#ffffff', 1.5); key.position.set(6, 10, 8); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15 }); w.add(key);
  const rim = new THREE.DirectionalLight(M3.orange, 0.6); rim.position.set(-8, 4, -6); w.add(rim);
  w.add(p3Ground('#1b1d26', -2.5));
  // a warm stage spot: a pool of light on the floor where the characters stand, with their shadows in it
  const spot = new THREE.SpotLight('#ffe2b8', 150, 40, 0.42, 0.85, 1.6); spot.position.set(1.5, 9, 7); spot.target.position.set(0, -2.5, 0); spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); spot.shadow.bias = -0.0004; spot.shadow.radius = 5; w.add(spot); w.add(spot.target);
  const sp = w.add(m3Specks());
  return { pose(t: number) { sp.pose(t); } };
}
// the cabin, seen from the front of the plane looking back: rows of seats facing the camera, windows on both walls,
// overhead bins. Seats of the front row at x = -1.45, -0.75 | 0.75, 1.45 (z = 0). .seatFront(x) covers a sitter's legs.
function m3Cabin(w: World) {
  w.add(new THREE.HemisphereLight('#fff6e8', '#5a5f70', 1.1));
  const lamp = new THREE.DirectionalLight('#ffffff', 0.9); lamp.position.set(0, 6, 6); lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048); w.add(lamp);
  const wall = m3Mat('#e8e1d3', 0.8), seatM = m3Mat('#2f5fd9', 0.85), head = m3Mat('#e9eef5', 0.8), floor = m3Mat('#3d4a6b', 0.95), bin = m3Mat('#f4efe6', 0.6), arm = m3Mat('#b8c0cf', 0.6);
  w.add(m3BoxM(6, 0.1, 14, floor, [0, -0.05, -5]));
  const skyTex = p3Paint(512, 512, (c) => { const gr = c.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#2a7fd9'); gr.addColorStop(1, '#bfe3ff'); c.fillStyle = gr; c.fillRect(0, 0, 512, 512); c.fillStyle = '#ffffff'; for (const [x, y, r] of [[90, 300, 50], [140, 280, 64], [200, 305, 46], [360, 180, 40], [410, 165, 52], [460, 185, 38]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } });
  skyTex.wrapS = THREE.RepeatWrapping;
  const winMat = new THREE.MeshBasicMaterial({ map: skyTex });
  for (const sx of [-1, 1]) {
    const side = w.add(m3BoxM(0.12, 3.4, 14, wall, [sx * 2.3, 1.7, -5]));
    side.receiveShadow = true;
    for (let k = 0; k < 6; k++) {
      const z = 0.5 - k * 1.6;
      const frame = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.3, 6, 18), m3Mat('#cfc8b8', 0.5)); frame.position.set(sx * 2.22, 1.55, z); frame.scale.set(0.3, 1, 1); w.add(frame);
      const pane = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.26, 6, 18), winMat); pane.position.set(sx * 2.17, 1.55, z); pane.scale.set(0.2, 1, 1); w.add(pane);
    }
    w.add(m3BoxM(0.9, 0.5, 14, bin, [sx * 1.8, 2.55, -5]));
    w.add(m3BoxM(0.9, 0.05, 14, m3Mat('#fff6d8', 0.4, 0.5), [sx * 1.8, 2.28, -5]));
  }
  w.add(m3BoxM(4.8, 0.1, 14, wall, [0, 3.2, -5]));
  const seat = (x: number, z: number) => m3Grp([x, 0, z], m3BoxM(0.62, 1.05, 0.14, seatM, [0, 0.95, -0.32], [-0.08, 0, 0]), m3BoxM(0.5, 0.22, 0.1, head, [0, 1.45, -0.36]), m3BoxM(0.62, 0.16, 0.58, seatM, [0, 0.5, -0.02]), m3BoxM(0.08, 0.3, 0.5, arm, [0.33, 0.62, -0.05]), m3BoxM(0.08, 0.3, 0.5, arm, [-0.33, 0.62, -0.05]));
  for (let row = 0; row < 6; row++) for (const x of [-1.45, -0.75, 0.75, 1.45]) w.add(seat(x, -row * 1.25));
  return {
    seatFront: (x: number) => w.add(m3Grp([x, 0, 0], m3BoxM(0.62, 0.42, 0.06, seatM, [0, 0.33, 0.27]))),
    pose(t: number) { skyTex.offset.x = -t * 0.08; },
  };
}


// =====================================================================
//  ANIMATED 3D CHARACTERS: organic one-piece heads with short fur, a soft cloth body, bendy limbs (a tube along a curve
//  through an IK elbow, rebuilt every frame), eyelids that blink, pupils that look and jump, brows and a mouth that act,
//  squash & stretch, poses reached with anticipation and overshoot, a head that lags the body and ears/tufts that follow.
//  Same API as before: setPose(pose, at?, from?), live(t), head, bulb, bump, black, crazy(on), dizzy(t, on).
// =====================================================================
type M3TicoPose = 'cross' | 'point' | 'palm' | 'hold';
type M3DotaPose = 'up' | 'down' | 'hug' | 'reach';
const m3Back = (u: number) => { const c = 1.7; u = p3Clamp(u); return 1 + (c + 1) * (u - 1) ** 3 + c * (u - 1) ** 2; };
const m3Hash = (n: number) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const m3Skin = (c: string, rough = 0.85) => new THREE.MeshPhysicalMaterial({ color: c, roughness: rough, sheen: 0.6, sheenColor: new THREE.Color('#ffffff'), sheenRoughness: 0.8 });
const m3Cloth = (c: string) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.9, sheen: 1, sheenColor: new THREE.Color(c).lerp(new THREE.Color('#ffffff'), 0.5), sheenRoughness: 0.5 });
const m3Gloss = (c: string, r = 0.15) => new THREE.MeshPhysicalMaterial({ color: c, roughness: r, clearcoat: 1, clearcoatRoughness: 0.08 });
// IK in 3D: elbow from shoulder s to target t with segments a, b, bending towards the pole direction
function m3IK(s: THREE.Vector3, t: THREE.Vector3, a: number, b: number, pole: THREE.Vector3) {
  const d = t.clone().sub(s), L0 = d.length() || 1e-4, L = Math.min(L0, (a + b) * 0.995), dir = d.clone().divideScalar(L0);
  const cosA = p3Clamp((a * a + L * L - b * b) / (2 * a * L), -1, 1), A = Math.acos(cosA);
  const perp = pole.clone().sub(dir.clone().multiplyScalar(pole.dot(dir))).normalize();
  const e = s.clone().add(dir.clone().multiplyScalar(Math.cos(A) * a)).add(perp.multiplyScalar(Math.sin(A) * a));
  return { e, h: s.clone().add(dir.multiplyScalar(L)) };
}
// a limb mesh that is rebuilt every frame along shoulder -> elbow -> hand, tapering from r0 to r1
function m3Limb(mat: THREE.Material, r0: number, r1: number) {
  const m = new THREE.Mesh(new THREE.BufferGeometry(), mat); m.castShadow = m.receiveShadow = true;
  return Object.assign(m, { set(s: THREE.Vector3, e: THREE.Vector3, h: THREE.Vector3) {
    const c = e.clone().multiplyScalar(2).sub(s.clone().add(h).multiplyScalar(0.5)), curve = new THREE.QuadraticBezierCurve3(s, c, h);
    const g = new THREE.TubeGeometry(curve, 18, 1, 14, false), pos = g.attributes.position, nrm = g.attributes.normal;
    for (let i = 0; i <= 18; i++) { const u = i / 18, r = r0 + (r1 - r0) * u, p = curve.getPoint(u); for (let j = 0; j <= 14; j++) { const k = i * 15 + j; pos.setXYZ(k, p.x + nrm.getX(k) * r, p.y + nrm.getY(k) * r, p.z + nrm.getZ(k) * r); } }
    pos.needsUpdate = true; m.geometry.dispose(); m.geometry = g;
  } });
}
// a head: an organic skull with a face mask painted in, covered by short fur
function m3Head(R: number, fur: string, face: string, furLen: number) {
  const hx = (h: string) => new THREE.Color(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255), F = hx(fur), C = hx(face);
  const geo = p3Blob((x, y, z) => [x * R * 1.02, y * R * (y > 0 ? 0.98 : 0.9) - (z > 0 && y < 0 ? z * y * R * 0.08 : 0), z * R * 0.96],
    (x, y, z) => { const mask = p3Smoothstep(0.1, 0.32, z / R) * p3Smoothstep(0.95, 0.55, Math.hypot(x / R * 1.15, (y / R + 0.12) * 1.05)); const n = p3Fbm3(x * 6, y * 6, z * 6) - 0.5; const c = F.clone().lerp(C, mask); return [c.r + n * 0.06, c.g + n * 0.05, c.b + n * 0.04]; }, 64, 48);
  const g = new THREE.Group();
  const base = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.8, sheen: 0.5, sheenRoughness: 0.7, sheenColor: new THREE.Color('#ffffff') })); base.castShadow = true; g.add(base);
  g.add(p3Fur(geo, { ...P3_HAIR, layers: 7, len: furLen, den: 150, droop: [0, -0.4, 0], shade: [0.75, 1.15] }));
  return g;
}
function m3Eye(r: number, lidColor: string) {
  const white = m3Gloss('#ffffff', 0.12), dark = m3Gloss('#1d1410', 0.2), lidM = m3Skin(lidColor);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), white);
  const pupil = new THREE.Group(); const iris = new THREE.Mesh(new THREE.SphereGeometry(r * 0.48, 24, 16), dark); iris.position.z = r * 0.86; iris.scale.z = 0.38;
  const spark = new THREE.Mesh(new THREE.SphereGeometry(r * 0.12, 12, 8), new THREE.MeshBasicMaterial({ color: '#ffffff' })); spark.position.set(r * 0.16, r * 0.16, r * 1.03); pupil.add(iris, spark);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(r * 1.06, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), lidM); lid.castShadow = true;
  const g = new THREE.Group(); g.add(ball, pupil, lid);
  return Object.assign(g, { pupil, lid, pose(lookX: number, lookY: number, closed: number) { pupil.rotation.set(-lookY, lookX, 0); lid.rotation.x = p3Lerp(-1.15, Math.PI / 2 + 0.05, closed); } });
}
function m3Brow(w: number, mat: THREE.Material) { const m = new THREE.Mesh(new THREE.CapsuleGeometry(w * 0.14, w * 0.8, 6, 12), mat); m.rotation.z = Math.PI / 2; const g = new THREE.Group(); g.add(m); m.castShadow = true; return g; }
// mouth: a dark inner shape and a tongue; set(width, open) every frame (lip sync from the words), shape(k) for fixed shapes
function m3Mouth(w: number) {
  const inner = new THREE.Mesh(new THREE.SphereGeometry(w, 24, 16), new THREE.MeshStandardMaterial({ color: '#4a1212', roughness: 0.6 })), tongue = new THREE.Mesh(new THREE.SphereGeometry(w * 0.6, 16, 12), new THREE.MeshStandardMaterial({ color: '#ff7f95', roughness: 0.5 }));
  tongue.position.set(0, -w * 0.45, w * 0.2); const g = new THREE.Group(); g.add(inner, tongue); inner.scale.z = 0.4; tongue.scale.z = 0.4;
  const set = (sx: number, sy: number) => { g.scale.set(sx, Math.max(0.05, sy), 1); tongue.visible = sy > 0.3; };
  return Object.assign(g, { set, shape(k: number) { const S = [[0.9, 0.08], [1.0, 0.9], [0.62, 0.85], [1.25, 0.45], [0.6, 0.35]][k]; set(S[0], S[1]); } });
}
interface M3Spec { kind: 'tico' | 'dota'; fur: string; face: string; shirt: string; headY: number; R: number; sh: [number, number]; arm: [number, number]; armR: number; hip: [number, number]; legR: number; torso: [number, number, number]; hands: Record<string, [Vec3, Vec3]> }
const M3_TICO: M3Spec = { kind: 'tico', fur: '#5a3a2b', face: '#f3d9b1', shirt: '#3270e6', headY: 1.76, R: 0.46, sh: [0.32, 1.24], arm: [0.42, 0.4], armR: 0.075, hip: [0.13, 0.56], legR: 0.09, torso: [0.36, 0.44, 0.3],
  hands: { cross: [[0.22, 1.02, 0.36], [-0.22, 1.06, 0.34]], point: [[-0.42, 0.62, 0.12], [0.86, 1.86, 0.26]], palm: [[-0.42, 0.62, 0.12], [0.06, 2.0, 0.5]], hold: [[-0.15, 0.88, 0.42], [0.15, 0.88, 0.42]],
    explain: [[-0.36, 1.02, 0.46], [0.36, 1.08, 0.48]], shrug: [[-0.66, 1.08, 0.22], [0.66, 1.08, 0.22]], count: [[-0.14, 0.98, 0.44], [0.44, 1.56, 0.42]], chin: [[-0.1, 0.98, 0.4], [0.08, 1.42, 0.5]],
    glasses: [[-0.22, 1.0, 0.38], [0.06, 1.8, 0.58]], big: [[-0.74, 1.62, 0.2], [0.74, 1.62, 0.2]], hips: [[-0.44, 0.7, 0.05], [0.44, 0.7, 0.05]] } };
const M3_DOTA: M3Spec = { kind: 'dota', fur: '#c97b3d', face: '#f2d2a6', shirt: '#ffc83d', headY: 1.12, R: 0.5, sh: [0.23, 0.72], arm: [0.29, 0.27], armR: 0.06, hip: [0.1, 0.33], legR: 0.07, torso: [0.27, 0.27, 0.24],
  hands: { up: [[-0.5, 1.18, 0.08], [0.5, 1.18, 0.08]], down: [[-0.32, 0.3, 0.1], [0.32, 0.3, 0.1]], hug: [[-0.1, 0.5, 0.36], [0.1, 0.5, 0.36]], reach: [[-0.32, 0.3, 0.1], [0.8, 0.72, 0.2]],
    explain: [[-0.3, 0.78, 0.36], [0.3, 0.78, 0.36]], shrug: [[-0.52, 0.8, 0.12], [0.52, 0.8, 0.12]], cheer: [[-0.46, 1.2, 0.1], [0.46, 1.2, 0.1]], scratch: [[-0.32, 0.3, 0.1], [0.52, 1.08, 0.02]],
    wave: [[-0.32, 0.3, 0.1], [0.6, 1.15, 0.2]], point: [[-0.32, 0.3, 0.1], [0.76, 0.95, 0.3]] } };

// ---------------- acting from the voice: phrases, stressed words (beats) and lip sync, all from WORDS
type M3Phrase = { t0: number; t1: number; q: boolean; ex: boolean; i: number };
let M3_PH: M3Phrase[] | null = null; const M3_BEAT: number[] = [], M3_LET: string[] = [];
let M3_KEYS: number[] = [];   // the key times of the scene being drawn (set by the wrapper at the end of visuals3d.ts)
function m3Phrases() {
  if (M3_PH) return M3_PH; M3_PH = []; const W = typeof WORDS !== 'undefined' ? WORDS : []; let cur: M3Phrase | null = null;
  W.forEach((x, j) => {
    M3_LET.push(x.w.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-zñ]/g, ''));
    if (!cur) { cur = { t0: x.t0, t1: x.t1, q: false, ex: false, i: M3_PH!.length }; M3_BEAT.push(x.t0); }
    else if (M3_LET[j].length >= 6) M3_BEAT.push(x.t0);
    cur.t1 = x.t1; if (/[¿?]/.test(x.w)) cur.q = true; if (/[¡!]/.test(x.w)) cur.ex = true;
    const nx = W[j + 1]; if (!nx || /[.,;:!?…]$/.test(x.w) || nx.t0 - x.t1 > 0.35) { M3_PH!.push(cur); cur = null; }
  });
  return M3_PH;
}
// index of the last item whose start (via get) is <= t, or -1
function m3Find<T>(a: T[], t: number, get: (x: T) => number) { let lo = 0, hi = a.length - 1, r = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (get(a[m]) <= t) { r = m; lo = m + 1; } else hi = m - 1; } return r; }
const M3_VIS: Record<string, [number, number]> = { a: [1.15, 1], e: [1.2, 0.55], i: [1.25, 0.4], o: [0.75, 0.85], u: [0.6, 0.6], m: [0.9, 0.06], b: [0.9, 0.06], p: [0.9, 0.06], f: [0.95, 0.22], v: [0.95, 0.22] };
// mouth [width, open] at t from the letters of the word being said, or null between words
function m3Lip(t: number): [number, number] | null {
  m3Phrases(); const W = typeof WORDS !== 'undefined' ? WORDS : [], j = m3Find(W, t, (x) => x.t0); if (j < 0) return null; const x = W[j]; if (t > x.t1 + 0.05) return null;
  const L = M3_LET[j] || 'a', n = L.length, f = p3Clamp((t - x.t0) / Math.max(0.05, x.t1 - x.t0)) * n - 0.5, i0 = p3Clamp(Math.floor(f), 0, n - 1), i1 = Math.min(n - 1, i0 + 1), u = p3Smoothstep(0, 1, f - Math.floor(f));
  const a = M3_VIS[L[i0]] || [1.0, 0.32], b = M3_VIS[L[i1]] || [1.0, 0.32], amp = p3Clamp(Math.min((t - x.t0) / 0.05, (x.t1 + 0.05 - t) / 0.07));
  return [p3Lerp(a[0], b[0], u), p3Lerp(a[1], b[1], u) * amp];
}
const m3Imp = (dt: number) => (dt > 0 && dt < 0.9 ? dt * 9 * Math.exp(1 - dt * 9) : 0);   // a quick kick that peaks 0.11 s after dt = 0
// the spring that every pose change goes through: rises in ~0.2 s, overshoots ~20 %, settles by 0.6 s
const M3_KER = (() => { const k = [...Array(20)].map((_, j) => { const u = (j + 0.5) / 30; return Math.exp(-6.3 * u) * Math.sin(12.5 * u); }); const s = k.reduce((a, b) => a + b, 0); return k.map((x) => x / s); })();
// what each gesture does besides the hands: [lean, curlL, curlR, palmUpL, palmUpR, brow, eyesWide, lookX, lookY, headYaw, pointR]
const M3_GP: Record<string, number[]> = {
  cross: [0, 1, 1, 0, 0, -0.1, 0, 0, 0, 0, 0], point: [0.05, 0.6, 1, 0, 0, 0.3, 0.15, 0.35, 0.2, 0.35, 1], palm: [-0.03, 0.6, 0, 0, 1, 0.4, 0.1, 0, 0.15, 0, 0], hold: [0.04, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  explain: [0.08, 0.2, 0.2, 0.6, 0.6, 0.35, 0.05, 0, 0, 0, 0], shrug: [-0.06, 0, 0, 1, 1, 0.8, 0.15, 0, 0.1, 0, 0], count: [0.04, 0.8, 0.5, 0, 0, 0.4, 0, 0, 0, 0, 1], chin: [0.02, 0.8, 0.7, 0, 0, -0.3, -0.25, 0.25, 0.25, 0.15, 0],
  glasses: [0, 0.8, 0.6, 0, 0, 0.2, -0.1, 0, 0, 0, 1], big: [-0.1, 0, 0, 0.5, 0.5, 1, 0.3, 0, 0.15, 0, 0], hips: [-0.03, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  up: [-0.05, 0, 0, 0.4, 0.4, 0.5, 0.2, 0, 0.1, 0, 0], down: [0, 0.5, 0.5, 0, 0, 0, 0, 0, 0, 0, 0], hug: [0.03, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], reach: [0.08, 0.5, 0.1, 0, 0, 0.3, 0.1, 0.3, 0, 0.2, 0],
  cheer: [-0.08, 0, 0, 0.6, 0.6, 1, 0.35, 0, 0.2, 0, 0], scratch: [0.03, 0.5, 0.7, 0, 0, -0.4, -0.2, -0.3, 0.3, -0.2, 0], wave: [0, 0.5, 0, 0, 0, 0.5, 0.2, 0, 0, 0, 0],
};

// =====================================================================
//  m3Char: Tico and Dota DRAWN IN 2D (flat colours, thick dark outline, the Idio-two series look) living inside the 3D world.
//  Each one is a paper cut-out: a plane that always faces the camera (the wrapper in visuals3d.ts turns it), with a canvas
//  that is redrawn every frame. The acting brain is the same as the 3D actor: what it would be doing at each moment (gesture
//  of the phrase, listening, idle business, reactions to the scene's beats) goes through a spring (anticipation, overshoot,
//  settle); on top: a nod, a dip and a hand flick on stressed words, lip sync from the letters, a head that lags, knees that bend.
//  Same API as the 3D one: setPose(pose, at?, from?), live(t), head, bulb, bump, black, crazy(on), dizzy(t, on), side(s).
// =====================================================================
const M3_O = '#2b1a14', M3_U = 0.00366, M3_PX = 1.25, M3_X0 = -400, M3_Y0 = -830, M3_W = 800, M3_H = 880;
const M3_K = {
  tico: { sh: 92, shY: -320, a: 128, b: 122, arm: 40, hand: 28, hip: 36, hipY: -140, foot: 44, leg: 40, top: -368, bot: -122, w: 200, neck: -360, skin: '#5a3a2b', shirt: '#3270e6', shirtD: '#2453b8', face: '#f3d9b1' },
  dota: { sh: 62, shY: -182, a: 82, b: 76, arm: 30, hand: 24, hip: 28, hipY: -80, foot: 56, leg: 30, top: -218, bot: -52, w: 146, neck: -215, skin: '#c97b3d', shirt: '#ffc83d', shirtD: '#e8a21c', face: '#f2d2a6' },
};
// where the hands go for each gesture, in drawing units (feet at 0, up is negative): [left, right]
const M3_H2: Record<'tico' | 'dota', Record<string, [number, number][]>> = {
  tico: { cross: [[78, -236], [-78, -230]], point: [[-122, -110], [262, -482]], palm: [[-122, -110], [24, -536]], hold: [[-44, -204], [44, -204]],
    explain: [[-160, -300], [160, -292]], shrug: [[-250, -330], [250, -330]], count: [[-70, -236], [196, -474]], chin: [[-70, -236], [34, -372]],
    glasses: [[-70, -236], [14, -490]], big: [[-262, -548], [262, -548]], hips: [[-122, -170], [122, -170]] },
  dota: { up: [[-138, -300], [138, -300]], down: [[-92, -62], [92, -62]], hug: [[-38, -112], [38, -112]], reach: [[-92, -62], [214, -188]],
    explain: [[-124, -196], [124, -190]], shrug: [[-182, -204], [182, -204]], cheer: [[-190, -290], [190, -290]], scratch: [[-92, -62], [150, -300]],
    wave: [[-92, -62], [184, -300]], point: [[-92, -62], [218, -232]] },
};
// the paper cut-outs of the current page; the wrapper turns each one to face the camera after posing
const M3_SPRITES: { mesh: THREE.Mesh; g: THREE.Object3D }[] = [];
function m3IK2(ax: number, ay: number, tx: number, ty: number, la: number, lb: number, sgn: number) {
  let dx = tx - ax, dy = ty - ay; const d0 = Math.hypot(dx, dy) || 1, d = Math.min(d0, (la + lb) * 0.995); dx = dx / d0 * d; dy = dy / d0 * d;
  const A = Math.acos(p3Clamp((la * la + d * d - lb * lb) / (2 * la * d), -1, 1)), ang = Math.atan2(dy, dx) + sgn * A;
  return [ax + Math.cos(ang) * la, ay + Math.sin(ang) * la, ax + dx, ay + dy];
}
function m3Star2(c: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number) {
  c.beginPath(); for (let i = 0; i < 10; i++) { const a = rot - Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath();
  c.fillStyle = '#ffc83d'; c.fill(); c.lineWidth = 6; c.strokeStyle = M3_O; c.stroke();
}
// a face/head path from an SVG path string, cached
const M3_P = new Map<string, Path2D>(); const m3P = (d: string) => { let p = M3_P.get(d); if (!p) { p = new Path2D(d); M3_P.set(d, p); } return p; };

function m3Char(S: M3Spec) {
  const tico = S.kind === 'tico', K = M3_K[S.kind], H2 = M3_H2[S.kind];
  const g = new THREE.Group();
  const cv = document.createElement('canvas'); cv.width = M3_W * M3_PX; cv.height = M3_H * M3_PX; const c = cv.getContext('2d')!;
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.04, toneMapped: false, side: THREE.DoubleSide, fog: false });
  const card = new THREE.Mesh(new THREE.PlaneGeometry(M3_W * M3_U, M3_H * M3_U), mat); card.castShadow = true; card.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5, side: THREE.DoubleSide }); card.position.y = -(M3_Y0 + M3_H / 2) * M3_U;
  const pivot = new THREE.Group(); g.add(pivot); pivot.add(card); M3_SPRITES.push({ mesh: card, g: pivot });
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(tico ? 0.5 : 0.4, 32), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.22, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.012; shadow.scale.y = 0.5; g.add(shadow);
  // things the scenes switch on and off or turn (read back when drawing)
  const head = new THREE.Group(), bulb = new THREE.Group(), bump = new THREE.Group(), black = new THREE.Group(); bulb.visible = bump.visible = black.visible = false;
  let starsOn = false, starsA = 0;

  // ---------------- the acting brain (same as the 3D actor), hands in drawing units
  const mine = tico ? M3_TICO_T : M3_DOTA_T, theirs = tico ? M3_DOTA_T : M3_TICO_T, seed = tico ? 0 : 1.3;
  const inR = (R: [number, number][], s: number) => R.some(([a, b]) => s > a && s < b);
  const LOCK = new Set(['hold', 'hug']), N = 28;
  let pose = tico ? 'cross' : 'up', from = pose, at = -99, crazyOn = false, other = tico ? 1 : -1;
  const myPhrase = (s: number) => { const P = m3Phrases(), j = m3Find(P, s + 0.15, (x) => x.t0); for (let k = j; k >= Math.max(0, j - 1); k--) { const p = P[k]; if (s < p.t1 + 0.45 && inR(mine, (p.t0 + p.t1) / 2)) return p; } return null; };
  const lastKey = (s: number) => { let b = -99; for (const k of M3_KEYS) if (k <= s && k > b) b = k; return b; };
  const raw = (s: number) => {
    const P = new Array(N).fill(0), base = s < at ? from : pose, talk = inR(mine, s), recent = at > -90 && s > at - 0.2 && s < at + 1.6;
    const locked = LOCK.has(base) || recent || crazyOn, ph = myPhrase(s), h = m3Hash;
    let gs = base;
    if (!locked && ph) {
      const list = tico ? ['explain', 'point', 'palm', 'count', 'explain', 'chin', 'shrug'] : ['explain', 'point', 'cheer', 'shrug'];
      gs = ph.q ? 'shrug' : ph.ex ? (tico ? 'big' : 'cheer') : list[Math.floor(h(ph.i * 1.7 + 0.3) * list.length)];
    } else if (!locked && !talk) {
      const Wd = tico ? 4.2 : 3.0, q = s + seed * 7, n = Math.floor(q / Wd), u = q - n * Wd, r = h(n * 9.1 + seed);
      if (tico && (base === 'cross' || base === 'point')) { if (r > 0.35 && r < 0.6 && u < 1.0) gs = 'glasses'; else if (r >= 0.6 && r < 0.8 && u < 1.8) gs = 'chin'; }
      if (!tico && (base === 'up' || base === 'down')) { if (r > 0.3 && r < 0.55 && u < 1.5) gs = 'scratch'; else if (r >= 0.55 && r < 0.75 && u < 1.2) gs = 'wave'; }
    }
    const kd = s - lastKey(s);
    if (!locked && kd >= 0) { if (tico && base === 'point' && kd < 1.3) gs = 'point'; if (!tico && !ph && kd < 0.9) { gs = 'cheer'; P[27] = 1; } }
    const hs = H2[gs] || H2[base] || H2[tico ? 'cross' : 'up'], gp = M3_GP[gs] || M3_GP.cross;
    P.splice(0, 6, hs[0][0], hs[0][1], 0, hs[1][0], hs[1][1], 0);
    [P[6], P[15], P[16], P[17], P[18], P[19], P[20], P[13], P[14], P[10], P[21]] = gp;
    P[23] = gs === 'shrug' ? 1 : 0; P[24] = gs === 'wave' ? 1 : 0; P[25] = gs === 'scratch' ? 1 : 0; P[26] = locked ? 0 : 1;
    if (ph) {
      P[9] = (h(ph.i * 3.1) - 0.5) * 0.12; P[11] += (h(ph.i + 3.7) - 0.5) * 0.3 + (ph.q ? 0.2 : 0); P[7] += (h(ph.i + 5.3) - 0.5) * 0.3; P[12] = ph.ex ? -0.06 : 0.03;
      if (!locked) { P[0] += (h(ph.i * 7) - 0.5) * 30; P[1] += (h(ph.i * 7 + 1) - 0.5) * 30; P[3] += (h(ph.i * 7 + 3) - 0.5) * 30; P[4] += (h(ph.i * 7 + 4) - 0.5) * 30; }
    }
    if (!talk && inR(theirs, s)) { P[10] += 0.38 * other; P[13] += 0.35 * other; P[7] += 0.15 * other; P[11] += 0.1 * other; }
    return P;
  };
  const smooth = (t: number) => {
    const A = new Array(N).fill(0);
    for (let j = 0; j < M3_KER.length; j++) { const r = raw(t - j / 30), w = M3_KER[j]; for (let i = 0; i < N; i++) A[i] += w * r[i]; }
    const f = raw(t + 0.13), n = raw(t); for (let i = 0; i < 13; i++) A[i] -= 0.22 * (f[i] - n[i]);
    return A;
  };

  // ---------------- the drawing
  const fs = (p: Path2D, fill: string | null, lw = 8) => { if (fill) { c.fillStyle = fill; c.fill(p); } if (lw) { c.lineWidth = lw; c.strokeStyle = M3_O; c.stroke(p); } };
  const ell = (x: number, y: number, rx: number, ry: number, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); return p; };
  const noodle = (ax: number, ay: number, ex: number, ey: number, hx: number, hy: number, w: number, col: string) => {
    const p = new Path2D(); p.moveTo(ax, ay); p.quadraticCurveTo(2 * ex - (ax + hx) / 2, 2 * ey - (ay + hy) / 2, hx, hy);
    c.lineCap = 'round'; c.lineWidth = w + 15; c.strokeStyle = M3_O; c.stroke(p); c.lineWidth = w; c.strokeStyle = col; c.stroke(p);
    c.save(); c.translate(-w * 0.18, -w * 0.18); c.lineWidth = w * 0.28; c.strokeStyle = 'rgba(255,255,255,0.18)'; c.stroke(p); c.restore();
  };
  const bodyPath = (w: number, top: number, bot: number, lean: number, belly: number) => {
    const h = w / 2; return new Path2D(`M${-h + lean} ${top + 52} C${-h + lean} ${top + 8} ${-h * 0.45 + lean} ${top} ${lean} ${top} C${h * 0.45 + lean} ${top} ${h + lean} ${top + 8} ${h + lean} ${top + 52} C${h * 1.06 + belly} ${(top + bot) / 2} ${h * 1.04} ${bot - 30} ${h * 0.86} ${bot - 8} C${h * 0.5} ${bot + 10} ${-h * 0.5} ${bot + 10} ${-h * 0.86} ${bot - 8} C${-h * 1.04} ${bot - 30} ${-h * 1.06 - belly} ${(top + bot) / 2} ${-h + lean} ${top + 52}Z`.replace(/(\d+\.\d)\d+/g, '$1'));
  };
  const E = tico ? [[-50, -478, 36], [50, -478, 36]] : [[-38, -332, 28], [40, -332, 28]];
  const draw = (t: number) => {
    const P = smooth(t), Pl = smooth(t - 0.1), talking = inR(mine, t);
    m3Phrases(); let beat = 0; const bj = m3Find(M3_BEAT, t, (x) => x); for (let k = bj; k >= Math.max(0, bj - 3); k--) if (inR(mine, M3_BEAT[k])) beat += m3Imp(t - M3_BEAT[k] + 0.04);
    beat = Math.min(1.2, beat);
    let hop = 0, hsq = 0;
    if (!tico && !crazyOn && !LOCK.has(pose)) {
      const evs = [lastKey(t + 0.1)]; const Wd = 3.0, q = t + seed * 7, n = Math.floor(q / Wd); if (m3Hash(n * 9.1 + seed) > 0.85) evs.push(n * Wd - seed * 7 + 0.3);
      for (const e of evs) { const dt = t - e; if (dt > -0.12 && dt < 0) hsq -= 0.1 * Math.sin((dt + 0.12) / 0.12 * Math.PI); else if (dt >= 0 && dt < 0.42) { const u = dt / 0.42; hop += 4 * u * (1 - u) * 60; hsq += 0.08 * Math.cos(u * Math.PI); } else if (dt >= 0.42 && dt < 0.6) hsq -= 0.12 * Math.sin((dt - 0.42) / 0.18 * Math.PI); }
    }
    const br = Math.sin(t * (tico ? 2.6 : 3.6) + seed), sq = 0.012 * br + 0.025 * beat + hsq + (talking ? 0.012 * Math.abs(Math.sin(t * 7.5)) : 0);
    const tk = talking ? 1 : 0, dip = 14 * beat + Math.max(0, -hsq) * 60;
    const lean = P[9] * 260 + P[7] * 40 + 8 * Math.sin(t * 1.3 + seed) + (tk ? 5 * Math.sin(t * 3.1) : 0);
    const yaw = P[10] + 0.04 * Math.sin(t * 0.7 + seed) + tk * 0.09 * Math.sin(t * 1.7 + seed) + head.rotation.y, dx = yaw * 70;
    const tilt = P[11] + tk * 0.07 * Math.sin(t * 2.1 + 1) + (Pl[11] - P[11]) * 0.9 + (Pl[9] - P[9]) * 2.5 - head.rotation.z;
    const nodY = (P[12] + 0.13 * beat + tk * 0.04 * Math.sin(t * 3.3) + head.rotation.x + (Pl[12] - P[12]) * 0.8) * 60;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
    c.setTransform(M3_PX, 0, 0, M3_PX, -M3_X0 * M3_PX, -M3_Y0 * M3_PX); c.lineJoin = 'round';
    c.translate(0, -hop); c.scale(1 - sq * 0.5, 1 + sq);
    // legs from the hips (that dip) to feet planted on the floor: the knees bend
    for (const sx of [-1, 1]) {
      const hx = sx * K.hip + lean * 0.15, hy = K.hipY + dip, fx = sx * K.foot, fy = -24, L = (fy - K.hipY) * 0.52, [ex, ey] = m3IK2(hx, hy, fx, fy, L, L, sx > 0 ? -1 : 1);
      noodle(hx, hy, ex + sx * 6, ey, fx, fy, K.leg, K.skin);
    }
    const tap = tico && !talking && m3Hash(Math.floor(t / 2.5)) > 0.5 ? Math.max(0, Math.sin(t * 8)) : 0;
    for (const sx of [-1, 1]) { c.save(); c.translate(sx * (K.foot + 4), -14); if (sx > 0) c.rotate(-0.3 * tap); fs(ell(0, 0, tico ? 50 : 38, tico ? 22 : 18), K.face, 7); c.restore(); }
    // body: the t-shirt sack, leaning
    const top = K.top + dip, bot = K.bot + dip * 0.5;
    fs(bodyPath(K.w, top, bot, lean, 4 * Math.sin(t * 2)), K.shirtD); c.fillStyle = K.shirt; c.fill(bodyPath(K.w * 0.84, top + 12, bot - 14, lean - 10, 0));
    c.lineWidth = 12; c.strokeStyle = 'rgba(0,0,0,0.2)'; c.beginPath(); c.moveTo(-K.w * 0.22 + lean, top + 8); c.quadraticCurveTo(lean, top + 34, K.w * 0.22 + lean, top + 8); c.stroke();
    // head (lagging tilt, nod, turn: the face slides over the skull)
    c.save(); c.translate(lean, dip + 16 * P[23]); c.translate(0, K.neck); c.rotate(tilt * 0.8); c.translate(0, -K.neck); c.translate(0, nodY * 0.25);
    const sw = (tilt - P[11]) * 3 + 0.12 * beat + 0.04 * Math.sin(t * 2.3 + seed) + hop * 0.004;
    const ear = (x: number, y: number, R: number, r: number, s: number) => { c.save(); c.translate(x - dx * 0.35, y); c.rotate(s * sw * 0.6); fs(ell(0, 0, R, R), K.skin); c.fillStyle = K.face; c.fill(ell(0, 0, r, r)); c.restore(); };
    if (tico) {
      ear(-130, -475, 48, 25, -1); ear(130, -475, 48, 25, 1);
      c.save(); c.translate(0, -606); c.rotate(sw * 2); c.translate(0, 606); fs(m3P('M-12 -604 Q2 -646 18 -604'), K.skin); c.restore();
      fs(m3P('M0 -607 C 80 -607 133 -560 133 -478 C 133 -400 78 -346 0 -346 C -78 -346 -133 -400 -133 -478 C -133 -560 -80 -607 0 -607Z'), K.skin);
      c.fillStyle = 'rgba(0,0,0,0.15)'; c.fill(m3P('M60 -590 C 112 -566 132 -520 130 -470 C 120 -540 90 -575 60 -590Z'));
    } else {
      [[-38, -432, -22], [0, -446, 0], [38, -432, 22]].forEach(([x, y, r], i) => { c.save(); c.translate((i - 1) * 38, -420); c.rotate(sw * (1.6 + i * 0.4) * (i === 1 ? 1 : 0.8) * 0.017 * 57); c.translate(-(i - 1) * 38, 420); fs(ell(x, y, 17, 33, r * Math.PI / 180), K.skin); c.restore(); });
      ear(-112, -318, 42, 22, -1); ear(112, -318, 42, 22, 1);
      fs(m3P('M0 -440 C 72 -440 118 -396 118 -322 C 118 -250 70 -204 0 -204 C -70 -204 -118 -250 -118 -322 C -118 -396 -72 -440 0 -440Z'), K.skin);
      c.fillStyle = 'rgba(0,0,0,0.14)'; c.fill(m3P('M55 -425 C 100 -404 118 -370 116 -322 C 108 -380 85 -410 55 -425Z'));
    }
    // the face, slid by the head turn and clipped to the skull
    c.save(); c.clip(tico ? m3P('M0 -607 C 80 -607 133 -560 133 -478 C 133 -400 78 -346 0 -346 C -78 -346 -133 -400 -133 -478 C -133 -560 -80 -607 0 -607Z') : m3P('M0 -440 C 72 -440 118 -396 118 -322 C 118 -250 70 -204 0 -204 C -70 -204 -118 -250 -118 -322 C -118 -396 -72 -440 0 -440Z'));
    c.translate(dx, nodY * 0.2);
    c.fillStyle = K.face; c.fill(m3P(tico ? 'M-100 -470 Q-100 -545 -45 -548 Q0 -520 45 -548 Q100 -545 100 -470 Q100 -360 0 -358 Q-100 -360 -100 -470Z' : 'M-92 -320 Q-92 -385 -40 -390 Q0 -366 40 -390 Q92 -385 92 -320 Q92 -225 0 -222 Q-92 -225 -92 -320Z'));
    c.fillStyle = tico ? '#f8e6c8' : '#f8e3c4'; c.fill(tico ? ell(0, -398, 64, 36) : ell(0, -262, 58, 36));
    c.fillStyle = 'rgba(255,143,143,0.42)'; c.fill(tico ? ell(-78, -410, 20, 11) : ell(-70, -276, 18, 10)); c.fill(tico ? ell(78, -410, 20, 11) : ell(74, -276, 18, 10));
    c.fillStyle = M3_O; c.fill(tico ? ell(-10, -420, 5, 5) : ell(-10, -284, 4, 4)); c.fill(tico ? ell(10, -420, 5, 5) : ell(8, -284, 4, 4));
    if (!tico && black.visible) { c.fillStyle = '#6a4a8c'; c.fill(ell(40, -332, 44, 44)); }
    // eyes: whites, pupils (looking, saccades, crazy), lids (blinks, wide, squint)
    const bt = (t + seed) % 3.3, dbl = m3Hash(Math.floor((t + seed) / 3.3)) > 0.6, ph = myPhrase(t);
    const closed = bt < 0.1 || (dbl && bt > 0.2 && bt < 0.3) || (ph && Math.abs(t - ph.t0) < 0.05) || Math.abs(Pl[10] - P[10]) > 0.12;
    const lidC = closed ? 1 : p3Clamp((tico ? 0.18 : 0.12) - P[20] * 0.15 + 0.08 * beat, 0, 0.6);
    const sac = Math.floor((t + seed) / 1.4), sx0 = (m3Hash(sac) - 0.5) * 0.2, sy0 = (m3Hash(sac + 7) - 0.5) * 0.15, lk = tico ? 1 : 0.35;
    E.forEach(([ex, ey, r], i) => {
      const eye = ell(ex, ey, r, r); c.fillStyle = '#fff'; c.fill(eye); if (!tico) { c.lineWidth = 7; c.strokeStyle = M3_O; c.stroke(eye); }
      c.save(); c.clip(eye);
      const px = crazyOn ? ex + (i ? 8 : -6) + 4 * Math.sin(t * 9 + i * 2) : ex + (P[13] + sx0) * lk * 26, py = crazyOn ? ey + (i ? -10 : 6) + 4 * Math.cos(t * 9 + i) : ey - (P[14] + sy0) * lk * 20;
      c.fillStyle = M3_O; c.fill(ell(px, py, 13, 13)); c.fillStyle = '#fff'; c.fill(ell(px + 4, py - 4, 4, 4));
      const yb = ey - r + 2 * r * lidC, lid = new Path2D(`M${ex - r - 4} ${ey - r - 6} L${ex + r + 4} ${ey - r - 6} L${ex + r + 4} ${yb.toFixed(1)} Q${ex} ${(yb + r * 0.35 * (1 - lidC * 0.6)).toFixed(1)} ${ex - r - 4} ${yb.toFixed(1)}Z`);
      c.fillStyle = K.face; c.fill(lid); c.lineWidth = 6; c.strokeStyle = M3_O; c.stroke(lid); c.restore();
    });
    if (tico) {
      c.lineWidth = 8; c.strokeStyle = M3_O; c.beginPath(); c.moveTo(-130, -478); c.lineTo(-92, -478); c.moveTo(130, -478); c.lineTo(92, -478); c.moveTo(-8, -478); c.lineTo(8, -478); c.stroke();
      c.lineWidth = 9; c.stroke(ell(-50, -478, 42, 42)); c.stroke(ell(50, -478, 42, 42));
      c.lineWidth = 7; c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineCap = 'round'; c.beginPath(); c.moveTo(-78, -496); c.quadraticCurveTo(-66, -510, -50, -512); c.moveTo(22, -496); c.quadraticCurveTo(34, -510, 50, -512); c.stroke();
    }
    // brows: lifted by the gesture and on stressed words; Tico's "told you so" asymmetry, Dota's worried look
    const lift = P[19] * 10 + beat * 9; c.lineWidth = tico ? 11 : 9; c.strokeStyle = M3_O; c.lineCap = 'round'; c.beginPath();
    if (tico) { c.moveTo(-92, -542 - lift); c.quadraticCurveTo(-60, -552 - lift, -28, -530 - lift); const b2 = lift * 1.4 + (P[19] > 0.3 ? 0 : 6); c.moveTo(28, -532 - b2); c.quadraticCurveTo(60, -556 - b2, 92, -546 - lift); }
    else { const wo = crazyOn ? 8 : 0; c.moveTo(-70, -384 - lift - wo); c.quadraticCurveTo(-40, -394 - lift, -12, -376 - lift + wo); c.moveTo(12, -372 - lift + wo); c.quadraticCurveTo(40, -394 - lift, 68, -388 - lift - wo); }
    c.stroke();
    // mouth: lip sync from the words; a little "oh" when surprised; the resting face otherwise
    const lip = talking ? m3Lip(t) : null, mw = lip ? lip[0] : P[27] > 0.2 ? 0.7 : tico ? 0.8 : 0.6, mo = lip ? lip[1] : P[27] > 0.2 ? 0.8 * P[27] : tico ? 0 : 0.3;
    const mx = 0, my = tico ? -386 : -248, k = tico ? 1 : 1.05;
    if (mo < 0.12) { c.lineWidth = 8; c.beginPath(); c.moveTo(mx - 34 * k, my); c.quadraticCurveTo(mx, my + 16 * k * (tico ? 1 : -0.4), mx + 36 * k, my - 8 * k); c.stroke(); }
    else {
      const W = 26 * mw * k, Hh = 30 * mo * k, m = new Path2D(`M${(mx - W).toFixed(1)} ${(my - Hh * 0.2).toFixed(1)} Q${mx} ${(my - Hh * 0.55).toFixed(1)} ${(mx + W).toFixed(1)} ${(my - Hh * 0.2).toFixed(1)} Q${(mx + W * 0.9).toFixed(1)} ${(my + Hh).toFixed(1)} ${mx} ${(my + Hh * 1.1).toFixed(1)} Q${(mx - W * 0.9).toFixed(1)} ${(my + Hh).toFixed(1)} ${(mx - W).toFixed(1)} ${(my - Hh * 0.2).toFixed(1)}Z`);
      c.fillStyle = '#6b1a1a'; c.fill(m); if (mo > 0.3) { c.save(); c.clip(m); c.fillStyle = '#ff8fa3'; c.fill(ell(mx, my + Hh * 0.95, W * 0.6, Hh * 0.45)); c.restore(); } c.lineWidth = 6; c.strokeStyle = M3_O; c.stroke(m);
    }
    if (!tico) { c.save(); c.translate(52, -290); c.rotate(-28 * Math.PI / 180); c.translate(-52, 290); const band = new Path2D(); band.roundRect(18, -305, 72, 30, 13); fs(band, '#f0b088', 6); c.fillStyle = M3_O; for (const [x, y] of [[48, -294], [60, -294], [48, -285], [60, -285]]) c.fill(ell(x, y, 3, 3)); c.restore(); }
    c.restore(); // face clip
    if (!tico && bump.visible) { fs(ell(-40, -432, 30, 30), '#ff8f8f', 7); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fill(ell(-48, -442, 8, 8)); }
    if (tico && bulb.visible) {
      c.save(); c.translate(0, -700); c.lineWidth = 8; c.strokeStyle = M3_O; c.beginPath(); c.moveTo(-80, 0); c.lineTo(-60, 0); c.moveTo(60, 0); c.lineTo(80, 0); c.moveTo(0, -84); c.lineTo(0, -66); c.stroke();
      fs(ell(0, 0, 46, 46), '#ffc83d'); c.beginPath(); c.moveTo(-14, 10); c.lineTo(0, -8); c.lineTo(14, 10); c.lineWidth = 7; c.stroke(); const cap = new Path2D(); cap.roundRect(-22, 44, 44, 26, 6); fs(cap, '#c9d3e0', 7); c.restore();
    }
    if (starsOn) for (let i = 0; i < 3; i++) { const a = starsA + i * 2.1; m3Star2(c, Math.cos(a) * 110, (tico ? -640 : -470) + Math.sin(a) * 22, 24, a); }
    c.restore(); // head
    // arms and hands: spring-smoothed targets + flick on stressed words + waving / scratching; elbows out and down
    for (const side of [0, 1]) {
      const sxs = side ? 1 : -1; let tx = P[side * 3], ty = P[side * 3 + 1] + dip * 0.6;
      const fl = P[26] * tk * (side === 1 ? 1 : 0.5) * beat; ty += 18 * fl; const gw = P[26] * tk * (side === 1 ? 1 : 0.6);
      tx += gw * 14 * Math.sin(t * 3.1 + side * 2); ty += gw * 14 * Math.sin(t * 2.3 + side) + 3 * br;
      if (side === 1) { tx += P[24] * 22 * Math.sin(t * 14); ty += P[25] * 10 * Math.sin(t * 18); }
      const shx = sxs * K.sh + lean * 0.8, shy = K.shY + dip + 4 * br - 18 * P[23];
      const s1 = m3IK2(shx, shy, tx, ty, K.a, K.b, sxs), s2 = m3IK2(shx, shy, tx, ty, K.a, K.b, -sxs), pick = (s: number[]) => Math.abs(s[0]) * 1.2 + s[1] * 0.6, [ex, ey, hx, hy] = pick(s1) > pick(s2) ? s1 : s2;
      noodle(shx, shy, ex, ey, hx, hy, K.arm, K.skin);
      const ang = Math.atan2(hy - ey, hx - ex), curl = p3Clamp(P[15 + side]), pt = side === 1 ? p3Clamp(P[21]) : 0, r = K.hand;
      c.save(); c.translate(hx, hy); c.rotate(ang);
      if (pt > 0.5) { const f = new Path2D(); f.roundRect(r * 0.7, -8, r * 1.5, 16, 8); fs(f, K.skin, 6); }
      else if (curl < 0.45) for (const a of [-0.55, 0, 0.55]) { c.save(); c.rotate(a); const f = new Path2D(); f.roundRect(r * 0.6, -7, r * 0.95, 14, 7); fs(f, K.skin, 6); c.restore(); }
      fs(ell(0, 0, r * 1.12, r), K.skin, 7); c.fillStyle = 'rgba(255,255,255,0.18)'; c.fill(ell(-r * 0.35, -r * 0.3, r * 0.4, r * 0.25)); c.restore();
    }
    // light on the paper: brighter from the upper left, a soft shade towards the lower right and the feet (the volume of the world's light)
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-atop'; const gr = c.createLinearGradient(cv.width * 0.2, cv.height * 0.1, cv.width * 0.8, cv.height); gr.addColorStop(0, 'rgba(255,248,230,0.10)'); gr.addColorStop(0.55, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(20,10,40,0.22)'); c.fillStyle = gr; c.fillRect(0, 0, cv.width, cv.height); c.globalCompositeOperation = 'source-over';
    tex.needsUpdate = true;
    shadow.visible = Math.abs(g.rotation.z) < 0.1 && Math.abs(g.rotation.x) < 0.1; shadow.scale.set(1 - hop * 0.004, 0.5 - hop * 0.002, 1);
  };
  return Object.assign(g, {
    head, bulb, bump, black,
    setPose(p: string, when = -99, prev?: string) { pose = p; at = when; from = prev ?? p; },
    crazy(on: boolean) { crazyOn = on; },
    dizzy(t: number, on: boolean) { starsOn = on; starsA = t * 3; },
    side(s: number) { other = s; },
    live(t: number) { draw(t); },
  });
}
const M3_TICO_T: [number, number][] = [[0.1, 9.28], [12.25, 36.19], [38.72, 99.54], [103.43, 109.55], [113.5, 146.3]];
const M3_DOTA_T: [number, number][] = [[10.02, 11.49], [36.88, 38.22], [100.18, 102.54], [110.08, 112.76], [146.93, 151.21]];
function m3Tico() { const c = m3Char(M3_TICO); c.setPose('cross'); return c; }
function m3Dota() { const c = m3Char(M3_DOTA); c.setPose('up'); return c; }

// ---------------- soft, smooth scenery (no faceted low-poly): puffy clouds and round trees
function m3Cloud(p: Vec3, s = 1) { const m = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 1, sheen: 1, sheenColor: new THREE.Color('#dfefff'), emissive: '#ffffff', emissiveIntensity: 0.18 }); const g = new THREE.Group(); for (const [x, y, z, r] of [[0, 0, 0, 1.4], [1.4, -0.2, 0.2, 1.0], [-1.3, -0.3, 0, 1.0], [0.5, 0.6, -0.3, 0.95], [-0.6, 0.4, 0.3, 0.8]]) { const b = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), m); b.position.set(x, y, z); g.add(b); } g.position.set(...p); g.scale.setScalar(s); return g; }
function m3Tree(p: Vec3, s = 1, seed = 1) { const r = p3Rnd(seed), trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 1.4, 16), m3Mat('#8a5a3b', 0.9)); trunk.position.y = 0.7; const g = new THREE.Group(); g.add(trunk); const leaf = new THREE.MeshPhysicalMaterial({ color: '#4caf50', roughness: 0.85, sheen: 0.6, sheenColor: new THREE.Color('#bff5a0') }); for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(p3Blob((x, y, z) => { const n = p3Fbm3(x * 2 + seed, y * 2, z * 2) * 0.35; return [x * (0.9 + n), y * (0.85 + n), z * (0.9 + n)]; }, undefined, 32, 24), leaf); b.position.set((r() - 0.5) * 0.8, 1.9 + r() * 0.8, (r() - 0.5) * 0.6); b.scale.setScalar(0.7 + r() * 0.4); b.castShadow = true; g.add(b); } g.position.set(...p); g.scale.setScalar(s); M3_TREES.push(g); return g; }
function m3Forest(n = 22, seed = 3, z0 = -14, width = 60) { const r = p3Rnd(seed), g = new THREE.Group(); for (let i = 0; i < n; i++) g.add(m3Tree([p3Lerp(-width / 2, width / 2, r()), 0, z0 - r() * 18], 0.8 + r() * 0.7, i + seed)); return g; }
// the image finish shared by every scene: studio reflections, ACES colour, a soft grade, vignette and a little grain
// depth of field that only softens what is far behind the subject (the foreground and the characters stay sharp)
const M3_DOF = {
  uniforms: { tDiffuse: { value: null }, tDepth: { value: null }, uFocus: { value: 10 }, uNear: { value: 0.1 }, uFar: { value: 200 }, uMax: { value: 7 }, uBoth: { value: 0 }, uRes: { value: new THREE.Vector2(1080, 1920) } },
  vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `#include <packing>
    uniform sampler2D tDiffuse; uniform sampler2D tDepth; uniform float uFocus, uNear, uFar, uMax, uBoth; uniform vec2 uRes; varying vec2 vUv;
    float dist(vec2 uv) { return -perspectiveDepthToViewZ(unpackRGBAToDepth(texture2D(tDepth, uv)), uNear, uFar); }
    float coc(float d) { float far = smoothstep(uFocus * 1.35, uFocus * 3.2 + 6.0, d); float both = smoothstep(uFocus * 0.05, uFocus * 0.28, abs(d - uFocus)); return mix(far, both, uBoth) * uMax * (1.0 + uBoth * 0.6); }
    void main() {
      float c0 = coc(dist(vUv)); vec4 col = texture2D(tDiffuse, vUv); if (c0 < 0.3) { gl_FragColor = col; return; }
      vec4 acc = col; float wsum = 1.0;
      for (int i = 0; i < 16; i++) {
        float a = float(i) * 2.39996, r = sqrt((float(i) + 0.5) / 16.0) * c0; vec2 uv = vUv + vec2(cos(a), sin(a)) * r / uRes;
        float w = step(0.3, coc(dist(uv))); acc += texture2D(tDiffuse, uv) * w; wsum += w;
      }
      gl_FragColor = acc / wsum;
    }`,
};
let M3_FIN: { composer: THREE.EffectComposer; pass: THREE.RenderPass; dof: THREE.ShaderPass; grade: THREE.ShaderPass; depthRT: THREE.WebGLRenderTarget; depthM: THREE.MeshDepthMaterial } | null = null;
// floating dust in the light: tiny warm specks drifting through the shot (parallax = depth)
function m3Dust(n = 170) {
  const r = p3Rnd(77), base = new Float32Array(n * 3), pos = new Float32Array(n * 3); for (let i = 0; i < n * 3; i++) base[i] = r();
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dot = p3Paint(64, 64, (c) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 64); });
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.095, map: dot, color: '#fff3d6', transparent: true, opacity: 0.65, depthWrite: false, sizeAttenuation: true, fog: false }));
  return Object.assign(pts, { pose(t: number, c: THREE.Vector3, span = 9) {
    for (let i = 0; i < n; i++) { const bx = base[i * 3], by = base[i * 3 + 1], bz = base[i * 3 + 2];
      pos[i * 3] = c.x + (((bx * span + t * 0.12 + 0.3 * Math.sin(t * 0.7 + i)) % span + span) % span - span / 2);
      pos[i * 3 + 1] = c.y + (((by * span * 0.7 + t * 0.06 + 0.2 * Math.sin(t * 0.9 + i * 1.7)) % (span * 0.7)) - span * 0.35);
      pos[i * 3 + 2] = c.z + bz * span - span / 2; }
    g.attributes.position.needsUpdate = true; } });
}
// the trees of the page, swayed by the wrapper
const M3_TREES: THREE.Object3D[] = [];
function m3Finish(w: World) {
  const r = w.renderer; w.scene.environment = p3Env(r); (w.scene as THREE.Scene & { environmentIntensity: number }).environmentIntensity = 0.35; r.toneMappingExposure = 1.0;
  if (!M3_FIN) {
    const composer = new THREE.EffectComposer(r, new THREE.WebGLRenderTarget(1080, 1920, { type: THREE.HalfFloatType, samples: 4 })); composer.setSize(1080, 1920);
    const pass = new THREE.RenderPass(w.scene, w.camera); composer.addPass(pass);
    const dof = new THREE.ShaderPass(M3_DOF); composer.addPass(dof); composer.addPass(new THREE.OutputPass());
    const grade = new THREE.ShaderPass({ ...P3_GRADE, uniforms: { tDiffuse: { value: null }, uT: { value: 0 }, uSat: { value: 1.12 }, uCurve: { value: 0.45 }, uVig: { value: 0.7 }, uGrain: { value: 0.012 }, uRed: { value: 0 }, uGray: { value: 0 } } }); composer.addPass(grade);
    const depthRT = new THREE.WebGLRenderTarget(540, 960), depthM = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
    M3_FIN = { composer, pass, dof, grade, depthRT, depthM };
  }
  w.present = () => {
    const f = M3_FIN!, cam = w.camera, swap: [THREE.Mesh, THREE.Material | THREE.Material[]][] = [], hid: THREE.Object3D[] = [];
    // depth pass (alpha-tested for the paper cut-outs) for the depth of field
    w.scene.traverse((o) => { if (!o.visible) return; const m = o as THREE.Mesh; if ((o as THREE.Points).isPoints || (o as THREE.Line).isLine) { hid.push(o); o.visible = false; return; }
      if (m.isMesh) { const mt = m.material as THREE.Material; if (mt.transparent && !(m.customDepthMaterial)) { if ((mt as THREE.MeshBasicMaterial).opacity < 0.5) { hid.push(o); o.visible = false; return; } } swap.push([m, m.material]); m.material = m.customDepthMaterial || f.depthM; } });
    const bg = w.scene.background, fog = w.scene.fog, cc = new THREE.Color(); r.getClearColor(cc); const ca = r.getClearAlpha();
    w.scene.background = null; w.scene.fog = null; r.setClearColor(0xffffff, 1); r.setRenderTarget(f.depthRT); r.clear(); r.render(w.scene, cam); r.setRenderTarget(null); r.setClearColor(cc, ca);
    w.scene.background = bg; w.scene.fog = fog; for (const [m, mt] of swap) m.material = mt; for (const o of hid) o.visible = true;
    const u = f.dof.uniforms; u.tDepth.value = f.depthRT.texture; u.uNear.value = cam.near; u.uFar.value = cam.far; u.uFocus.value = M3_FOCUS; u.uBoth.value = M3_BOTH;
    f.pass.scene = w.scene; f.pass.camera = cam; f.grade.uniforms.uT.value = Math.round(P3_T.value * 30); f.composer.render();
  };
}
let M3_FOCUS = 10, M3_BOTH = 0, M3_FOCUS_OVR = -1;   // a scene can force the focus (and blur in front too) by setting M3_FOCUS_OVR / M3_BOTH in its pose
