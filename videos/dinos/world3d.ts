// =====================================================================
//  World of "Cómo funciona un avión" in 3D (Idio-two): Tico and Dota in 3D, the board plane that turns into the
//  IDIO-TWO light plane piece by piece, the wing in cut, props, the cabin and the sets. Names start with "a3".
//  Everything is posed from t (absolute video seconds): no clocks, no randomness, nothing that accumulates.
// =====================================================================
// a canvas texture in sRGB (the colours of the hex codes, not washed out)
const z3Paint = (W: number, H: number, draw: (c: CanvasRenderingContext2D) => void) => { const t = p3Paint(W, H, draw); t.colorSpace = THREE.SRGBColorSpace; return t; };
const Z3 = { ink: '#14161d', paper: '#f2efe6', lime: '#c8f53a', orange: '#ff6a3d', sky: '#8ec9f0', night: '#10121a', cream: '#fff3d6' };
const z3Mat = (c: string, r = 0.55, e = 0) => new THREE.MeshPhysicalMaterial({ color: c, roughness: r, metalness: 0, clearcoat: r < 0.5 ? 0.6 : 0, clearcoatRoughness: 0.15, sheen: r >= 0.7 ? 0.4 : 0, sheenRoughness: 0.7, sheenColor: new THREE.Color('#ffffff'), emissive: e ? c : '#000000', emissiveIntensity: e });
const z3Sph = (r: number, mat: THREE.Material, p: Vec3, s: Vec3 = [1, 1, 1]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 28), mat); m.position.set(...p); m.scale.set(...s); m.castShadow = m.receiveShadow = true; return m; };
const z3BoxM = (w: number, h: number, d: number, mat: THREE.Material, p: Vec3 = [0, 0, 0], r: Vec3 = [0, 0, 0]) => { const rr = Math.min(w, h, d) * 0.32, m = new THREE.Mesh(rr > 0.004 ? new THREE.RoundedBoxGeometry(w, h, d, 3, rr) : new THREE.BoxGeometry(w, h, d), mat); m.position.set(...p); m.rotation.set(...r); m.castShadow = m.receiveShadow = true; return m; };
const z3Grp = (p: Vec3 = [0, 0, 0], ...kids: THREE.Object3D[]) => { const g = new THREE.Group(); g.position.set(...p); if (kids.length) g.add(...kids); return g; };
// a limb: rod + round joints at both ends

// ---------------- Tico: tall dark-brown monkey, round glasses, blue t-shirt. Feet at y = 0, facing +z.
type Z3Part = 'eng' | 'stab' | 'elev' | 'fin' | 'rud' | 'ail' | 'flap';
const z3Label = (text: string, w = 1024, h = 220, fg = '#1b3fb0', bg = '') => z3Paint(w, h, (c) => { if (bg) { c.fillStyle = bg; c.fillRect(0, 0, w, h); } c.font = `italic 900 ${h * 0.62}px Inter, Arial, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = h * 0.08; c.strokeStyle = '#ffffff'; c.strokeText(text, w / 2, h / 2); c.fillStyle = fg; c.fillText(text, w / 2, h / 2); });
function z3Plane() {
  const white = z3Mat('#f4f6fa', 0.45), wood = z3Mat('#c98a4b', 0.8), balsa = z3Mat('#ead0a0', 0.8), orange = z3Mat('#ff7a3d', 0.5), blue = z3Mat('#1b3fb0', 0.5), dark = z3Mat('#22334f', 0.25), glass = z3Mat('#7cc0f5', 0.15, 0.25), metal = z3Mat('#b8c0cf', 0.4), tire = z3Mat('#2b2f3a', 0.8);
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const L: Record<string, THREE.Object3D> = {}, P: Record<Z3Part, THREE.Group> = {} as Record<Z3Part, THREE.Group>, PM: Record<Z3Part, THREE.MeshStandardMaterial[]> = {} as Record<Z3Part, THREE.MeshStandardMaterial[]>;
  const part = (k: Z3Part, mats: THREE.MeshStandardMaterial[], ...kids: THREE.Object3D[]) => { const gg = z3Grp([0, 0, 0], ...kids); P[k] = gg; PM[k] = mats; body.add(gg); return gg; };
  // stage 0: the plank and the balsa board wing
  L.plank = z3BoxM(7, 0.3, 0.5, wood, [0, 0, 0]); body.add(L.plank);
  L.boardW = z3BoxM(1.4, 0.07, 8.4, balsa, [0.5, 0.25, 0]); body.add(L.boardW);
  // stage 1: real high wing with orange tips and struts
  const wing = z3Grp([0.6, 0.72, 0], z3BoxM(1.5, 0.1, 9.6, white), z3BoxM(1.5, 0.11, 0.5, orange, [0, 0, 4.6]), z3BoxM(1.5, 0.11, 0.5, orange, [0, 0, -4.6]));
  L.wing = wing; body.add(wing);
  L.strut = z3Grp([0, 0, 0], p3Rod([0.4, -0.2, 0.5], [0.6, 0.66, 2.3], 0.04, metal), p3Rod([0.4, -0.2, -0.5], [0.6, 0.66, -2.3], 0.04, metal)); body.add(L.strut);
  // stage 2: the fuselage (a lathe, nose +x)
  const prof = [[0.001, -3.6], [0.14, -3.5], [0.3, -2.4], [0.5, -1.0], [0.58, 0.2], [0.6, 1.4], [0.56, 2.4], [0.5, 2.9], [0.001, 2.95]].map(([r, y]) => new THREE.Vector2(r, y));
  const fus = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), white); fus.rotation.z = -Math.PI / 2; fus.castShadow = fus.receiveShadow = true;
  L.fus = z3Grp([0, 0.12, 0], fus); body.add(L.fus);
  // stage 3: windshield and side windows
  L.wins = z3Grp([0, 0.12, 0], z3BoxM(0.5, 0.34, 1.0, glass, [2.15, 0.38, 0], [0, 0, 0.75]), z3BoxM(0.55, 0.28, 1.2, glass, [1.3, 0.34, 0]), z3BoxM(0.5, 0.26, 1.18, glass, [0.6, 0.32, 0])); body.add(L.wins);
  // stage 4: stripe and landing gear
  L.stripe = z3Grp([0, 0.12, 0], z3BoxM(5.6, 0.1, 1.22, orange, [0.1, -0.12, 0]), z3BoxM(5.2, 0.05, 1.2, blue, [0.3, -0.26, 0])); body.add(L.stripe);
  const wheel = (x: number, z: number, r: number) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.16, 20), tire); m.rotation.x = Math.PI / 2; m.position.set(x, -0.95, z); m.castShadow = true; return m; };
  L.gear = z3Grp([0, 0, 0], p3Rod([1.0, -0.3, 0.3], [1.0, -0.9, 0.75], 0.05, metal), p3Rod([1.0, -0.3, -0.3], [1.0, -0.9, -0.75], 0.05, metal), p3Rod([2.6, -0.3, 0], [2.7, -0.95, 0], 0.05, metal), wheel(1.0, 0.82, 0.24), wheel(1.0, -0.82, 0.24), wheel(2.7, 0, 0.18)); body.add(L.gear);
  // stage 5: the IDIO-TWO livery on both sides and the logo on the fin
  const name = z3Label('IDIO-TWO'), logo = z3Paint(256, 256, (c) => { c.fillStyle = '#ff7a3d'; c.beginPath(); c.arc(128, 128, 118, 0, 7); c.fill(); c.lineWidth = 16; c.strokeStyle = '#fff'; c.stroke(); c.fillStyle = '#fff'; c.font = '900 140px Inter, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('i2', 128, 136); });
  const decal = (tex: THREE.Texture, w: number, h: number, p: Vec3, ry: number) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.5 })); m.position.set(...p); m.rotation.y = ry; return m; };
  L.livery = z3Grp([0, 0, 0], decal(name, 2.4, 0.52, [-1.0, 0.22, 0.56], 0), decal(name, 2.4, 0.52, [-1.0, 0.22, -0.56], Math.PI), decal(logo, 0.55, 0.55, [-3.25, 0.95, 0.06], 0), decal(logo, 0.55, 0.55, [-3.25, 0.95, -0.06], Math.PI)); body.add(L.livery);
  // the parts that get added (each with its own materials so it can glow lime)
  const eMats = [z3Mat('#ff7a3d', 0.5), z3Mat('#2b2f3a', 0.6)];
  const cowl = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.42, 0.7, 28), eMats[0]); cowl.rotation.z = Math.PI / 2; cowl.position.set(3.25, 0.12, 0);
  const spinner = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.4, 20), eMats[0]); spinner.rotation.z = -Math.PI / 2; spinner.position.set(3.82, 0.12, 0);
  const prop = z3Grp([3.68, 0.12, 0], z3BoxM(0.06, 2.6, 0.2, eMats[1]), z3BoxM(0.06, 0.2, 2.6, eMats[1])); (prop.children[1] as THREE.Mesh).visible = false;
  part('eng', eMats, cowl, spinner, prop);
  const sMats = [z3Mat('#f4f6fa', 0.45)], eM = [z3Mat('#ff7a3d', 0.5)], fMats = [z3Mat('#f4f6fa', 0.45)], rM = [z3Mat('#ff7a3d', 0.5)], aM = [z3Mat('#ff7a3d', 0.5)], flM = [z3Mat('#ff7a3d', 0.5)];
  part('stab', sMats, z3BoxM(0.9, 0.07, 3.4, sMats[0], [-3.0, 0.22, 0]));
  const elev = z3Grp([-3.45, 0.22, 0], z3BoxM(0.4, 0.06, 3.3, eM[0], [-0.2, 0, 0])); part('elev', eM, elev);
  const finShape = p3Extruded([[0.0, 0], [-0.9, 0], [-1.1, 1.45], [-0.6, 1.45]], 0.09); const fin = new THREE.Mesh(finShape, fMats[0]); fin.position.set(-2.55, 0.25, 0); fin.castShadow = true; part('fin', fMats, fin);
  const rud = z3Grp([-3.45, 0.25, 0], z3BoxM(0.32, 1.42, 0.07, rM[0], [-0.16, 0.71, 0])); part('rud', rM, rud);
  const ailL = z3Grp([-0.15, 0.72, 3.9], z3BoxM(0.36, 0.08, 1.4, aM[0], [-0.18, 0, 0])), ailR = z3Grp([-0.15, 0.72, -3.9], z3BoxM(0.36, 0.08, 1.4, aM[0], [-0.18, 0, 0])); part('ail', aM, ailL, ailR);
  const flapL = z3Grp([-0.15, 0.7, 2.0], z3BoxM(0.36, 0.07, 1.6, flM[0], [-0.18, 0, 0])), flapR = z3Grp([-0.15, 0.7, -2.0], z3BoxM(0.36, 0.07, 1.6, flM[0], [-0.18, 0, 0])); part('flap', flM, flapL, flapR);
  const lime = new THREE.Color(Z3.lime);
  const base = new Map<THREE.MeshStandardMaterial, THREE.Color>(); for (const k in PM) for (const m of PM[k as Z3Part]) base.set(m, m.color.clone());
  const show = (o: THREE.Object3D, f: number) => { o.visible = f > 0.01; o.scale.setScalar(Math.max(0.001, f)); };
  return Object.assign(g, {
    body, parts: P,
    // which parts are on (0..1 grow) and how far the board has turned into the plane
    pose(stage: number, on: Partial<Record<Z3Part, number>>) {
      const f = (k: number) => p3Clamp(stage - (k - 1));
      show(L.boardW, 1 - f(1)); show(L.wing, f(1)); show(L.strut, f(1));
      show(L.plank, 1 - f(2)); L.fus.visible = f(2) > 0.01; L.fus.scale.set(1, Math.max(0.001, f(2)), Math.max(0.001, f(2)));
      show(L.wins, f(3)); show(L.stripe, f(4)); show(L.gear, f(4)); show(L.livery, f(5));
      for (const k of ['eng', 'stab', 'elev', 'fin', 'rud', 'ail', 'flap'] as Z3Part[]) show(P[k], on[k] ?? 0);
    },
    glow(k: Z3Part, u: number) { for (const m of PM[k]) { m.color.copy(base.get(m)!).lerp(lime, u); m.emissive.copy(lime); m.emissiveIntensity = u * 0.55; } },
    spin(t: number, rps = 6) { prop.rotation.x = t * rps * Math.PI * 2; (prop.children[1] as THREE.Mesh).visible = rps > 2; },
    controls(c: { elev?: number; rud?: number; ailL?: number; ailR?: number; flap?: number }) {
      elev.rotation.z = c.elev ?? 0; rud.rotation.y = c.rud ?? 0; ailL.rotation.z = c.ailL ?? 0; ailR.rotation.z = c.ailR ?? 0;
      flapL.rotation.z = -(c.flap ?? 0); flapR.rotation.z = -(c.flap ?? 0);
    },
  });
}
// paints a part lime for a moment when it is added (k: ramp in 0..1 over ~0.3 s, then fades)
const z3AddGlow = (t: number, t0: number) => (t < t0 ? 0 : t < t0 + 1.0 ? 1 : 1 - p3Clamp((t - t0 - 1.0) / 0.6));

// ---------------- the wing in cut (p3Airfoil) with a flap and the lift arrow; air with p3Airflow
function z3Wing() {
  const foil = p3Airfoil(), flapMat = z3Mat('#ff7a3d', 0.5);
  const fp: number[][] = [[0, 0.075], [1.05, 0.006], [1.05, -0.012], [0, -0.075]]; for (let i = 1; i < 12; i++) { const a = -Math.PI / 2 - i / 12 * Math.PI; fp.push([Math.cos(a) * 0.075, Math.sin(a) * 0.075]); }
  const flapM = new THREE.Mesh(p3Extruded(fp, 2.96), flapMat); flapM.castShadow = true;
  const flap = z3Grp([1.93, 0.0, 0], flapM); foil.add(flap);   // hinged right at the trailing edge: it swings down, it never leaves the wing
  const bracket = z3Mat('#3a3f4d', 0.5), mount = new THREE.Group(); for (const z of [-0.95, 0.95]) mount.add(z3BoxM(0.42, 0.1, 0.07, bracket, [1.82, -0.06, z])); foil.add(mount); flap.visible = mount.visible = false;   // only the flaps scene shows them
  const lift = p3Arrow([0, 0.6, 1.7], [0, 1, 0], 2.6, Z3.lime, 0.28);
  const downs = [0.8, 1.9, 3.0].map((x) => p3Arrow([x, -0.6, 1.7], [0.25, -1, 0], 1.5, C3.air, 0.15));
  return { foil, flap, mount, flapMat, lift, downs, air: p3Airflow(7, -1.8, 2.1, 1.6) };
}

// ---------------- props
function z3Table() { const w = z3Mat('#b97a4a', 0.75); return z3Grp([0, 0, 0], z3BoxM(4, 0.15, 1.6, w, [0, 1.0, 0]), ...[[-1.8, -0.65], [1.8, -0.65], [-1.8, 0.65], [1.8, 0.65]].map(([x, z]) => z3BoxM(0.14, 1.0, 0.14, w, [x, 0.5, z]))); }
function z3Gauge() {
  const face = z3Paint(512, 512, (c) => { c.fillStyle = '#15161c'; c.beginPath(); c.arc(256, 256, 250, 0, 7); c.fill(); c.lineWidth = 28; c.strokeStyle = '#4a4c56'; c.beginPath(); c.arc(256, 300, 170, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); c.strokeStyle = '#ff6a3d'; c.beginPath(); c.arc(256, 300, 170, Math.PI * 1.15, Math.PI * 1.35); c.stroke(); c.fillStyle = '#ff6a3d'; c.font = '900 60px monospace'; c.textAlign = 'center'; c.fillText('E', 110, 300); c.fillStyle = '#cfcdc4'; c.fillText('F', 402, 300); c.font = '700 34px monospace'; c.fillText('COMBUSTIBLE', 256, 430); });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.2, 48), z3Mat('#2a2c35', 0.4)); disc.rotation.x = Math.PI / 2;
  const dial = new THREE.Mesh(new THREE.CircleGeometry(1.4, 64), new THREE.MeshStandardMaterial({ map: face, roughness: 0.5 })); dial.position.y = 0.101; disc.add(dial); dial.rotation.x = -Math.PI / 2;
  const needle = z3Grp([0, -0.25, 0.14], z3BoxM(0.07, 1.0, 0.04, z3Mat(Z3.lime, 0.3, 0.5), [0, 0.5, 0])), hub = z3Sph(0.12, z3Mat(Z3.lime, 0.3, 0.5), [0, -0.25, 0.16]);
  return Object.assign(z3Grp([0, 0, 0], disc, needle, hub), { needle });
}
function z3Card(meta: string, title: string, line: string, year: string, stamp = '') {
  const tex = z3Paint(1024, 640, (c) => { c.fillStyle = '#f2efe6'; c.fillRect(0, 0, 1024, 640); c.fillStyle = '#6b6a63'; c.font = '700 34px monospace'; c.fillText(meta, 56, 80); c.fillStyle = '#c9c5b6'; c.fillRect(56, 104, 912, 4); c.fillStyle = '#14161d'; c.font = '900 92px Inter, Arial'; c.fillText(title, 56, 230); c.fillStyle = '#4a4943'; c.font = '700 46px Inter, Arial'; c.fillText(line, 56, 310); c.fillStyle = '#14161d'; c.fillRect(56, 380, 380, 160); c.fillStyle = '#d4ff3a'; c.font = '900 120px monospace'; c.fillText(year, 80, 506);
    if (stamp) { c.save(); c.translate(740, 470); c.rotate(-0.17); c.strokeStyle = '#ff6a3d'; c.lineWidth = 12; c.strokeRect(-190, -66, 380, 132); c.fillStyle = '#ff6a3d'; c.font = '900 72px Inter, Arial'; c.textAlign = 'center'; c.fillText(stamp, 0, 26); c.restore(); } });
  return new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.25, 0.06), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }));
}
function z3Bar(color: string) { const frame = z3BoxM(0.9, 4, 0.5, new THREE.MeshStandardMaterial({ color: '#4a4c56', transparent: true, opacity: 0.35 }), [0, 2, 0]); const fill = z3Grp([0, 0, 0], z3BoxM(0.7, 3.9, 0.4, z3Mat(color, 0.4, 0.3), [0, 1.95, 0])); return Object.assign(z3Grp([0, 0, 0], frame, fill), { level(u: number) { fill.scale.y = Math.max(0.01, u); } }); }
function z3Bike() {
  const O = z3Mat('#1d1410', 0.5), F = z3Mat('#ff6a3d', 0.4);
  const wheel = (x: number) => { const w = z3Grp([x, 0.62, 0], new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.06, 12, 40), O)); for (let i = 0; i < 6; i++) { const s = z3BoxM(0.02, 1.12, 0.02, z3Mat('#9aa3b2', 0.4)); s.rotation.z = i * Math.PI / 6; w.add(s); } return w; };
  const w1 = wheel(-0.95), w2 = wheel(0.95);
  const frame = z3Grp([0, 0, 0], p3Rod([-0.95, 0.62, 0], [-0.25, 1.35, 0], 0.06, F), p3Rod([-0.25, 1.35, 0], [0.6, 1.35, 0], 0.06, F), p3Rod([0.6, 1.35, 0], [0.95, 0.62, 0], 0.06, F), p3Rod([-0.25, 1.35, 0], [0.05, 0.62, 0], 0.06, F), p3Rod([0.05, 0.62, 0], [0.6, 1.35, 0], 0.06, F), p3Rod([-0.95, 0.62, 0], [0.05, 0.62, 0], 0.06, F), p3Rod([0.6, 1.35, 0], [0.7, 1.7, 0], 0.05, O), p3Rod([0.6, 1.7, -0.3], [0.8, 1.7, 0.3], 0.04, O));
  return Object.assign(z3Grp([0, 0, 0], w1, w2, frame), { roll(t: number) { w1.rotation.z = w2.rotation.z = -t * 9; } });
}
const z3Rock = () => new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 0), z3Mat('#8d8f96', 0.9));
// stars and drifting specks for the dark sets
function z3Specks(n = 120, spread = 30) { const r = p3Rnd(7), sw = p3Swarm(n, new THREE.IcosahedronGeometry(0.05, 0), new THREE.MeshBasicMaterial({ color: '#e8e6dc' })); const P = [...Array(n)].map(() => [r() * spread - spread / 2, r() * 14, -r() * 20]); return Object.assign(sw, { pose(t: number) { P.forEach(([x, y, z], i) => sw.put(i, x - ((t * 0.3) % 2), y + Math.sin(t + i) * 0.1, z, 0.6 + (i % 3) * 0.4)); sw.done(); } }); }
// confetti (prize): falls from start, deterministic
function z3Confetti(n = 90) { const r = p3Rnd(11), sw = p3Swarm(n, new THREE.BoxGeometry(0.16, 0.08, 0.02), new THREE.MeshBasicMaterial({ color: '#ffffff' })); const cols = ['#ff5a5f', '#ffd23d', '#3ccf91', '#4c7dff', '#ff8a3d', '#8b6cff'].map((c) => new THREE.Color(c)); const P = [...Array(n)].map(() => [r() * 10 - 5, 6 + r() * 3, r() * 4 - 2, r() * 6]); P.forEach((_, i) => sw.setColorAt(i, cols[i % 6])); return Object.assign(sw, { pose(t: number, t0: number) { P.forEach(([x, y, z, ph], i) => { const u = t - t0; if (u < 0) { sw.hide(i); return; } sw.put(i, x + Math.sin(u * 2 + ph) * 0.4, y - u * 2.6, z, 1, 1, 1, u * 3 + ph, u * 2, ph); }); sw.done(); } }); }
// prize rays: a disc of wedges that faces the camera (rotate .rotation.z to spin)
function z3Rays(c1 = '#ffd84a', r = 14) { const g = new THREE.Group(); for (let i = 0; i < 16; i++) { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(Math.cos(i * Math.PI / 8) * r, Math.sin(i * Math.PI / 8) * r); s.lineTo(Math.cos(i * Math.PI / 8 + 0.12) * r, Math.sin(i * Math.PI / 8 + 0.12) * r); g.add(new THREE.Mesh(new THREE.ShapeGeometry(s), new THREE.MeshBasicMaterial({ color: c1, transparent: true, opacity: 0.55 }))); } return g; }
// a ribbon: a flat satin strip along a smooth curve (width along wdir), optionally with a V cut at the end
function z3Ribbon(ctrl: Vec3[], width: number, wdir: Vec3, mat: THREE.Material, notch = 0, closed = false) {
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
function z3Bow() {
  const sat = new THREE.MeshPhysicalMaterial({ color: '#e8203a', roughness: 0.35, sheen: 1, sheenColor: new THREE.Color('#ff9aa8'), sheenRoughness: 0.35, clearcoat: 0.4, clearcoatRoughness: 0.3, side: THREE.DoubleSide });
  const g = new THREE.Group();
  for (const s of [-1, 1]) {
    const loop = z3Ribbon([[0, 0, 0], [s * 0.35, 0.32, 0.05], [s * 0.85, 0.5, 0], [s * 1.12, 0.22, -0.05], [s * 1.0, -0.12, 0], [s * 0.55, -0.16, 0.05], [s * 0.12, -0.04, 0]], 0.5, [0, 0.35, 1], sat, 0, true);
    loop.rotation.set(-0.25, s * -0.35, s * 0.18); g.add(loop);
    const tail = z3Ribbon([[s * 0.05, -0.05, 0.15], [s * 0.22, -0.38, 0.22], [s * 0.32, -0.68, 0.14], [s * 0.5, -0.95, 0.24], [s * 0.62, -1.15, 0.16]], 0.34, [1, s * 0.35, 0.25], sat, 0.16);
    g.add(tail);
  }
  const knot = new THREE.Mesh(new THREE.RoundedBoxGeometry(0.34, 0.4, 0.42, 4, 0.12), sat); knot.position.z = 0.06; knot.castShadow = true; g.add(knot);
  const fold = z3Ribbon([[-0.17, 0.12, 0.28], [0, 0.16, 0.3], [0.17, 0.12, 0.28]], 0.06, [0, 1, 0], new THREE.MeshPhysicalMaterial({ color: '#b5122a', roughness: 0.5, side: THREE.DoubleSide })); g.add(fold);
  return g;
}
// a 3D star (banner)
const z3StarMesh = (r: number, c = '#ffd23d') => { const m = new THREE.Mesh(p3Extruded([...Array(10)].map((_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; return [Math.cos(a) * rr, Math.sin(a) * rr]; }), r * 0.35), z3Mat(c, 0.4, 0.25)); m.castShadow = true; return m; };

// ---------------- sets
// the sky set: soft light, grass, trees far away, clouds in layers (.pose(t) drifts them), optional runway
function z3SkySet(w: World, o: { runway?: boolean; ground?: boolean } = {}) {
  p3Lights(w); w.scene.fog = new THREE.Fog(P3_SKY, 40, 130);
  if (o.ground !== false) { w.add(p3Ground(C3.grass, -6)); w.add(z3Forest(30, 5, -30, 120)).position.y = -6; }
  const runway = o.runway ? w.add(p3Runway()) : null; if (runway) runway.position.y = -5.97;
  const clouds = [[-12, 6, -14, 1.6], [10, 9, -20, 2], [-4, 12, -26, 1.8], [16, 3, -10, 1.2], [-18, 2, -8, 1.3], [4, -2, -18, 1.5]].map(([x, y, z, s]) => w.add(z3Cloud([x, y, z], s)));
  return { runway, pose(t: number, speed = 1) { clouds.forEach((c, i) => { const x0 = [-12, 10, -4, 16, -18, 4][i]; c.position.x = ((x0 - t * speed * (1.2 + i * 0.25) + 60) % 60 + 60) % 60 - 30; }); } };
}
// the dark set: near-black, a soft rim of light, specks drifting, dark ground
function z3NightSet(w: World) {
  w.add(new THREE.HemisphereLight('#c8d4ff', '#1a1c24', 0.8));
  const key = new THREE.DirectionalLight('#ffffff', 1.5); key.position.set(6, 10, 8); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15 }); w.add(key);
  const rim = new THREE.DirectionalLight(Z3.orange, 0.6); rim.position.set(-8, 4, -6); w.add(rim);
  w.add(p3Ground('#1b1d26', -2.5));
  // a warm stage spot: a pool of light on the floor where the characters stand, with their shadows in it
  const spot = new THREE.SpotLight('#ffe2b8', 150, 40, 0.42, 0.85, 1.6); spot.position.set(1.5, 9, 7); spot.target.position.set(0, -2.5, 0); spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); spot.shadow.bias = -0.0004; spot.shadow.radius = 5; w.add(spot); w.add(spot.target);
  const sp = w.add(z3Specks());
  return { pose(t: number) { sp.pose(t); } };
}
// the cabin, seen from the front of the plane looking back: rows of seats facing the camera, windows on both walls,
// overhead bins. Seats of the front row at x = -1.45, -0.75 | 0.75, 1.45 (z = 0). .seatFront(x) covers a sitter's legs.
function z3Cabin(w: World) {
  w.add(new THREE.HemisphereLight('#fff6e8', '#5a5f70', 1.1));
  const lamp = new THREE.DirectionalLight('#ffffff', 0.9); lamp.position.set(0, 6, 6); lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048); w.add(lamp);
  const wall = z3Mat('#e8e1d3', 0.8), seatM = z3Mat('#2f5fd9', 0.85), head = z3Mat('#e9eef5', 0.8), floor = z3Mat('#3d4a6b', 0.95), bin = z3Mat('#f4efe6', 0.6), arm = z3Mat('#b8c0cf', 0.6);
  w.add(z3BoxM(6, 0.1, 14, floor, [0, -0.05, -5]));
  const skyTex = z3Paint(512, 512, (c) => { const gr = c.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#2a7fd9'); gr.addColorStop(1, '#bfe3ff'); c.fillStyle = gr; c.fillRect(0, 0, 512, 512); c.fillStyle = '#ffffff'; for (const [x, y, r] of [[90, 300, 50], [140, 280, 64], [200, 305, 46], [360, 180, 40], [410, 165, 52], [460, 185, 38]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } });
  skyTex.wrapS = THREE.RepeatWrapping;
  const winMat = new THREE.MeshBasicMaterial({ map: skyTex });
  for (const sx of [-1, 1]) {
    const side = w.add(z3BoxM(0.12, 3.4, 14, wall, [sx * 2.3, 1.7, -5]));
    side.receiveShadow = true;
    for (let k = 0; k < 6; k++) {
      const z = 0.5 - k * 1.6;
      const frame = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.3, 6, 18), z3Mat('#cfc8b8', 0.5)); frame.position.set(sx * 2.22, 1.55, z); frame.scale.set(0.3, 1, 1); w.add(frame);
      const pane = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.26, 6, 18), winMat); pane.position.set(sx * 2.17, 1.55, z); pane.scale.set(0.2, 1, 1); w.add(pane);
    }
    w.add(z3BoxM(0.9, 0.5, 14, bin, [sx * 1.8, 2.55, -5]));
    w.add(z3BoxM(0.9, 0.05, 14, z3Mat('#fff6d8', 0.4, 0.5), [sx * 1.8, 2.28, -5]));
  }
  w.add(z3BoxM(4.8, 0.1, 14, wall, [0, 3.2, -5]));
  const seat = (x: number, z: number) => z3Grp([x, 0, z], z3BoxM(0.62, 1.05, 0.14, seatM, [0, 0.95, -0.32], [-0.08, 0, 0]), z3BoxM(0.5, 0.22, 0.1, head, [0, 1.45, -0.36]), z3BoxM(0.62, 0.16, 0.58, seatM, [0, 0.5, -0.02]), z3BoxM(0.08, 0.3, 0.5, arm, [0.33, 0.62, -0.05]), z3BoxM(0.08, 0.3, 0.5, arm, [-0.33, 0.62, -0.05]));
  for (let row = 0; row < 6; row++) for (const x of [-1.45, -0.75, 0.75, 1.45]) w.add(seat(x, -row * 1.25));
  return {
    seatFront: (x: number) => w.add(z3Grp([x, 0, 0], z3BoxM(0.62, 0.42, 0.06, seatM, [0, 0.33, 0.27]))),
    pose(t: number) { skyTex.offset.x = -t * 0.08; },
  };
}


// =====================================================================
//  ANIMATED 3D CHARACTERS: organic one-piece heads with short fur, a soft cloth body, bendy limbs (a tube along a curve
//  through an IK elbow, rebuilt every frame), eyelids that blink, pupils that look and jump, brows and a mouth that act,
//  squash & stretch, poses reached with anticipation and overshoot, a head that lags the body and ears/tufts that follow.
//  Same API as before: setPose(pose, at?, from?), live(t), head, bulb, bump, black, crazy(on), dizzy(t, on).
// =====================================================================
type Z3TicoPose = 'cross' | 'point' | 'palm' | 'hold';
type Z3DotaPose = 'up' | 'down' | 'hug' | 'reach';
const z3Back = (u: number) => { const c = 1.7; u = p3Clamp(u); return 1 + (c + 1) * (u - 1) ** 3 + c * (u - 1) ** 2; };
const z3Hash = (n: number) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const z3Skin = (c: string, rough = 0.85) => new THREE.MeshPhysicalMaterial({ color: c, roughness: rough, sheen: 0.6, sheenColor: new THREE.Color('#ffffff'), sheenRoughness: 0.8 });
const z3Cloth = (c: string) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.9, sheen: 1, sheenColor: new THREE.Color(c).lerp(new THREE.Color('#ffffff'), 0.5), sheenRoughness: 0.5 });
const z3Gloss = (c: string, r = 0.15) => new THREE.MeshPhysicalMaterial({ color: c, roughness: r, clearcoat: 1, clearcoatRoughness: 0.08 });
// IK in 3D: elbow from shoulder s to target t with segments a, b, bending towards the pole direction
function z3IK(s: THREE.Vector3, t: THREE.Vector3, a: number, b: number, pole: THREE.Vector3) {
  const d = t.clone().sub(s), L0 = d.length() || 1e-4, L = Math.min(L0, (a + b) * 0.995), dir = d.clone().divideScalar(L0);
  const cosA = p3Clamp((a * a + L * L - b * b) / (2 * a * L), -1, 1), A = Math.acos(cosA);
  const perp = pole.clone().sub(dir.clone().multiplyScalar(pole.dot(dir))).normalize();
  const e = s.clone().add(dir.clone().multiplyScalar(Math.cos(A) * a)).add(perp.multiplyScalar(Math.sin(A) * a));
  return { e, h: s.clone().add(dir.multiplyScalar(L)) };
}
// a limb mesh that is rebuilt every frame along shoulder -> elbow -> hand, tapering from r0 to r1
function z3Limb(mat: THREE.Material, r0: number, r1: number) {
  const m = new THREE.Mesh(new THREE.BufferGeometry(), mat); m.castShadow = m.receiveShadow = true;
  return Object.assign(m, { set(s: THREE.Vector3, e: THREE.Vector3, h: THREE.Vector3) {
    const c = e.clone().multiplyScalar(2).sub(s.clone().add(h).multiplyScalar(0.5)), curve = new THREE.QuadraticBezierCurve3(s, c, h);
    const g = new THREE.TubeGeometry(curve, 18, 1, 14, false), pos = g.attributes.position, nrm = g.attributes.normal;
    for (let i = 0; i <= 18; i++) { const u = i / 18, r = r0 + (r1 - r0) * u, p = curve.getPoint(u); for (let j = 0; j <= 14; j++) { const k = i * 15 + j; pos.setXYZ(k, p.x + nrm.getX(k) * r, p.y + nrm.getY(k) * r, p.z + nrm.getZ(k) * r); } }
    pos.needsUpdate = true; m.geometry.dispose(); m.geometry = g; for (const ch of m.children) (ch as THREE.Mesh).geometry = g;
  } });
}
// a head: an organic skull with a face mask painted in, covered by short fur
function z3Head(R: number, fur: string, face: string, furLen: number) {
  const hx = (h: string) => new THREE.Color(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255), F = hx(fur), C = hx(face);
  const geo = p3Blob((x, y, z) => [x * R * 1.02, y * R * (y > 0 ? 0.98 : 0.9) - (z > 0 && y < 0 ? z * y * R * 0.08 : 0), z * R * 0.96],
    (x, y, z) => { const mask = p3Smoothstep(0.1, 0.32, z / R) * p3Smoothstep(0.95, 0.55, Math.hypot(x / R * 1.15, (y / R + 0.12) * 1.05)); const n = p3Fbm3(x * 6, y * 6, z * 6) - 0.5; const c = F.clone().lerp(C, mask); return [c.r + n * 0.06, c.g + n * 0.05, c.b + n * 0.04]; }, 64, 48);
  const g = new THREE.Group();
  const base = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.8, sheen: 0.5, sheenRoughness: 0.7, sheenColor: new THREE.Color('#ffffff') })); base.castShadow = true; g.add(base);
  g.add(p3Fur(geo, { ...P3_HAIR, layers: 7, len: furLen, den: 150, droop: [0, -0.4, 0], shade: [0.75, 1.15] }));
  return g;
}
function z3Eye(r: number, lidColor: string) {
  const white = z3Gloss('#ffffff', 0.12), dark = z3Gloss('#1d1410', 0.2), lidM = z3Skin(lidColor);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), white);
  const pupil = new THREE.Group(); const iris = new THREE.Mesh(new THREE.SphereGeometry(r * 0.48, 24, 16), dark); iris.position.z = r * 0.86; iris.scale.z = 0.38;
  const spark = new THREE.Mesh(new THREE.SphereGeometry(r * 0.12, 12, 8), new THREE.MeshBasicMaterial({ color: '#ffffff' })); spark.position.set(r * 0.16, r * 0.16, r * 1.03); pupil.add(iris, spark);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(r * 1.06, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), lidM); lid.castShadow = true;
  const g = new THREE.Group(); g.add(ball, pupil, lid);
  return Object.assign(g, { pupil, lid, pose(lookX: number, lookY: number, closed: number) { pupil.rotation.set(-lookY, lookX, 0); lid.rotation.x = p3Lerp(-1.15, Math.PI / 2 + 0.05, closed); } });
}
function z3Brow(w: number, mat: THREE.Material) { const m = new THREE.Mesh(new THREE.CapsuleGeometry(w * 0.14, w * 0.8, 6, 12), mat); m.rotation.z = Math.PI / 2; const g = new THREE.Group(); g.add(m); m.castShadow = true; return g; }
// mouth: a dark inner shape and a tongue; set(width, open) every frame (lip sync from the words), shape(k) for fixed shapes
function z3Mouth(w: number) {
  const inner = new THREE.Mesh(new THREE.SphereGeometry(w, 24, 16), new THREE.MeshStandardMaterial({ color: '#4a1212', roughness: 0.6 })), tongue = new THREE.Mesh(new THREE.SphereGeometry(w * 0.6, 16, 12), new THREE.MeshStandardMaterial({ color: '#ff7f95', roughness: 0.5 }));
  tongue.position.set(0, -w * 0.45, w * 0.2); const g = new THREE.Group(); g.add(inner, tongue); inner.scale.z = 0.4; tongue.scale.z = 0.4;
  const set = (sx: number, sy: number) => { g.scale.set(sx, Math.max(0.05, sy), 1); tongue.visible = sy > 0.3; };
  return Object.assign(g, { set, shape(k: number) { const S = [[0.9, 0.08], [1.0, 0.9], [0.62, 0.85], [1.25, 0.45], [0.6, 0.35]][k]; set(S[0], S[1]); } });
}
interface Z3Spec { kind: 'tico' | 'dota'; fur: string; face: string; shirt: string; headY: number; R: number; sh: [number, number]; arm: [number, number]; armR: number; hip: [number, number]; legR: number; torso: [number, number, number]; hands: Record<string, [Vec3, Vec3]> }
const Z3_TICO: Z3Spec = { kind: 'tico', fur: '#5a3a2b', face: '#f3d9b1', shirt: '#3270e6', headY: 1.76, R: 0.46, sh: [0.32, 1.24], arm: [0.42, 0.4], armR: 0.075, hip: [0.13, 0.56], legR: 0.09, torso: [0.36, 0.44, 0.3],
  hands: { cross: [[0.22, 1.02, 0.36], [-0.22, 1.06, 0.34]], point: [[-0.42, 0.62, 0.12], [0.86, 1.86, 0.26]], palm: [[-0.42, 0.62, 0.12], [0.06, 2.0, 0.5]], hold: [[-0.15, 0.88, 0.42], [0.15, 0.88, 0.42]],
    explain: [[-0.36, 1.02, 0.46], [0.36, 1.08, 0.48]], shrug: [[-0.66, 1.08, 0.22], [0.66, 1.08, 0.22]], count: [[-0.14, 0.98, 0.44], [0.44, 1.56, 0.42]], chin: [[-0.1, 0.98, 0.4], [0.08, 1.42, 0.5]],
    glasses: [[-0.22, 1.0, 0.38], [0.06, 1.8, 0.58]], big: [[-0.74, 1.62, 0.2], [0.74, 1.62, 0.2]], hips: [[-0.44, 0.7, 0.05], [0.44, 0.7, 0.05]] } };
const Z3_DOTA: Z3Spec = { kind: 'dota', fur: '#c97b3d', face: '#f2d2a6', shirt: '#ffc83d', headY: 1.12, R: 0.5, sh: [0.23, 0.72], arm: [0.29, 0.27], armR: 0.06, hip: [0.1, 0.33], legR: 0.07, torso: [0.27, 0.27, 0.24],
  hands: { up: [[-0.5, 1.18, 0.08], [0.5, 1.18, 0.08]], down: [[-0.32, 0.3, 0.1], [0.32, 0.3, 0.1]], hug: [[-0.1, 0.5, 0.36], [0.1, 0.5, 0.36]], reach: [[-0.32, 0.3, 0.1], [0.8, 0.72, 0.2]],
    explain: [[-0.3, 0.78, 0.36], [0.3, 0.78, 0.36]], shrug: [[-0.52, 0.8, 0.12], [0.52, 0.8, 0.12]], cheer: [[-0.46, 1.2, 0.1], [0.46, 1.2, 0.1]], scratch: [[-0.32, 0.3, 0.1], [0.52, 1.08, 0.02]],
    wave: [[-0.32, 0.3, 0.1], [0.6, 1.15, 0.2]], point: [[-0.32, 0.3, 0.1], [0.76, 0.95, 0.3]] } };

// ---------------- acting from the voice: phrases, stressed words (beats) and lip sync, all from WORDS
type Z3Phrase = { t0: number; t1: number; q: boolean; ex: boolean; i: number };
let Z3_PH: Z3Phrase[] | null = null; const Z3_BEAT: number[] = [], Z3_LET: string[] = [];
let Z3_KEYS: number[] = [];   // the key times of the scene being drawn (set by the wrapper at the end of visuals3d.ts)
function z3Phrases() {
  if (Z3_PH) return Z3_PH; Z3_PH = []; const W = typeof WORDS !== 'undefined' ? WORDS : []; let cur: Z3Phrase | null = null;
  W.forEach((x, j) => {
    Z3_LET.push(x.w.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-zñ]/g, ''));
    if (!cur) { cur = { t0: x.t0, t1: x.t1, q: false, ex: false, i: Z3_PH!.length }; Z3_BEAT.push(x.t0); }
    else if (Z3_LET[j].length >= 6) Z3_BEAT.push(x.t0);
    cur.t1 = x.t1; if (/[¿?]/.test(x.w)) cur.q = true; if (/[¡!]/.test(x.w)) cur.ex = true;
    const nx = W[j + 1]; if (!nx || /[.,;:!?…]$/.test(x.w) || nx.t0 - x.t1 > 0.35) { Z3_PH!.push(cur); cur = null; }
  });
  return Z3_PH;
}
// index of the last item whose start (via get) is <= t, or -1
function z3Find<T>(a: T[], t: number, get: (x: T) => number) { let lo = 0, hi = a.length - 1, r = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (get(a[m]) <= t) { r = m; lo = m + 1; } else hi = m - 1; } return r; }
const Z3_VIS: Record<string, [number, number]> = { a: [1.15, 1], e: [1.2, 0.55], i: [1.25, 0.4], o: [0.75, 0.85], u: [0.6, 0.6], m: [0.9, 0.06], b: [0.9, 0.06], p: [0.9, 0.06], f: [0.95, 0.22], v: [0.95, 0.22] };
// mouth [width, open] at t from the letters of the word being said, or null between words
function z3Lip(t: number): [number, number] | null {
  z3Phrases(); const W = typeof WORDS !== 'undefined' ? WORDS : [], j = z3Find(W, t, (x) => x.t0); if (j < 0) return null; const x = W[j]; if (t > x.t1 + 0.05) return null;
  const L = Z3_LET[j] || 'a', n = L.length, f = p3Clamp((t - x.t0) / Math.max(0.05, x.t1 - x.t0)) * n - 0.5, i0 = p3Clamp(Math.floor(f), 0, n - 1), i1 = Math.min(n - 1, i0 + 1), u = p3Smoothstep(0, 1, f - Math.floor(f));
  const a = Z3_VIS[L[i0]] || [1.0, 0.32], b = Z3_VIS[L[i1]] || [1.0, 0.32], amp = p3Clamp(Math.min((t - x.t0) / 0.05, (x.t1 + 0.05 - t) / 0.07));
  return [p3Lerp(a[0], b[0], u), p3Lerp(a[1], b[1], u) * amp];
}
const z3Imp = (dt: number) => (dt > 0 && dt < 0.9 ? dt * 9 * Math.exp(1 - dt * 9) : 0);   // a quick kick that peaks 0.11 s after dt = 0
// the spring that every pose change goes through: rises in ~0.2 s, overshoots ~20 %, settles by 0.6 s
const Z3_KER = (() => { const k = [...Array(20)].map((_, j) => { const u = (j + 0.5) / 30; return Math.exp(-6.3 * u) * Math.sin(12.5 * u); }); const s = k.reduce((a, b) => a + b, 0); return k.map((x) => x / s); })();
// what each gesture does besides the hands: [lean, curlL, curlR, palmUpL, palmUpR, brow, eyesWide, lookX, lookY, headYaw, pointR]
const Z3_GP: Record<string, number[]> = {
  cross: [0, 1, 1, 0, 0, -0.1, 0, 0, 0, 0, 0], point: [0.05, 0.6, 1, 0, 0, 0.3, 0.15, 0.35, 0.2, 0.35, 1], palm: [-0.03, 0.6, 0, 0, 1, 0.4, 0.1, 0, 0.15, 0, 0], hold: [0.04, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  explain: [0.08, 0.2, 0.2, 0.6, 0.6, 0.35, 0.05, 0, 0, 0, 0], shrug: [-0.06, 0, 0, 1, 1, 0.8, 0.15, 0, 0.1, 0, 0], count: [0.04, 0.8, 0.5, 0, 0, 0.4, 0, 0, 0, 0, 1], chin: [0.02, 0.8, 0.7, 0, 0, -0.3, -0.25, 0.25, 0.25, 0.15, 0],
  glasses: [0, 0.8, 0.6, 0, 0, 0.2, -0.1, 0, 0, 0, 1], big: [-0.1, 0, 0, 0.5, 0.5, 1, 0.3, 0, 0.15, 0, 0], hips: [-0.03, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  up: [-0.05, 0, 0, 0.4, 0.4, 0.5, 0.2, 0, 0.1, 0, 0], down: [0, 0.5, 0.5, 0, 0, 0, 0, 0, 0, 0, 0], hug: [0.03, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], reach: [0.08, 0.5, 0.1, 0, 0, 0.3, 0.1, 0.3, 0, 0.2, 0],
  cheer: [-0.08, 0, 0, 0.6, 0.6, 1, 0.35, 0, 0.2, 0, 0], scratch: [0.03, 0.5, 0.7, 0, 0, -0.4, -0.2, -0.3, 0.3, -0.2, 0], wave: [0, 0.5, 0, 0, 0, 0.5, 0.2, 0, 0, 0, 0],
};

// =====================================================================
//  z3Char: Tico and Dota DRAWN IN 2D (flat colours, thick dark outline, the Idio-two series look) living inside the 3D world.
//  Each one is a paper cut-out: a plane that always faces the camera (the wrapper in visuals3d.ts turns it), with a canvas
//  that is redrawn every frame. The acting brain is the same as the 3D actor: what it would be doing at each moment (gesture
//  of the phrase, listening, idle business, reactions to the scene's beats) goes through a spring (anticipation, overshoot,
//  settle); on top: a nod, a dip and a hand flick on stressed words, lip sync from the letters, a head that lags, knees that bend.
//  Same API as the 3D one: setPose(pose, at?, from?), live(t), head, bulb, bump, black, crazy(on), dizzy(t, on), side(s).
// =====================================================================
const Z3_O = '#2b1a14', Z3_U = 0.00366, Z3_PX = 1.25, Z3_X0 = -400, Z3_Y0 = -830, Z3_W = 800, Z3_H = 880;
const Z3_K = {
  tico: { sh: 92, shY: -320, a: 128, b: 122, arm: 40, hand: 28, hip: 36, hipY: -140, foot: 44, leg: 40, top: -368, bot: -122, w: 200, neck: -360, skin: '#5a3a2b', shirt: '#3270e6', shirtD: '#2453b8', face: '#f3d9b1' },
  dota: { sh: 62, shY: -182, a: 82, b: 76, arm: 30, hand: 24, hip: 28, hipY: -80, foot: 56, leg: 30, top: -218, bot: -52, w: 146, neck: -215, skin: '#c97b3d', shirt: '#ffc83d', shirtD: '#e8a21c', face: '#f2d2a6' },
};
// where the hands go for each gesture, in drawing units (feet at 0, up is negative): [left, right]
const Z3_H2: Record<'tico' | 'dota', Record<string, [number, number][]>> = {
  tico: { cross: [[78, -236], [-78, -230]], point: [[-122, -110], [262, -482]], palm: [[-122, -110], [24, -536]], hold: [[-44, -204], [44, -204]],
    explain: [[-160, -300], [160, -292]], shrug: [[-250, -330], [250, -330]], count: [[-70, -236], [196, -474]], chin: [[-70, -236], [34, -372]],
    glasses: [[-70, -236], [14, -490]], big: [[-262, -548], [262, -548]], hips: [[-122, -170], [122, -170]], pinch: [[-70, -236], [300, -285]], sneeze: [[-40, -380], [40, -380]], cover: [[-46, -470], [46, -470]] },
  dota: { up: [[-138, -300], [138, -300]], down: [[-92, -62], [92, -62]], hug: [[-38, -112], [38, -112]], reach: [[-92, -62], [214, -188]],
    explain: [[-124, -196], [124, -190]], shrug: [[-182, -204], [182, -204]], cheer: [[-190, -290], [190, -290]], scratch: [[-92, -62], [150, -300]],
    wave: [[-92, -62], [184, -300]], point: [[-92, -62], [218, -232]], itch: [[-140, -150], [150, -300]], finger: [[-92, -62], [150, -250]], sick: [[-60, -120], [60, -120]], pose: [[-150, -150], [120, -330]], hugR: [[150, -170], [205, -215]], claws: [[-70, -230], [70, -230]], shh: [[-92, -62], [24, -262]] },
};
// the paper cut-outs of the current page; the wrapper turns each one to face the camera after posing
const Z3_SPRITES: { mesh: THREE.Mesh; g: THREE.Object3D }[] = [];
function z3IK2(ax: number, ay: number, tx: number, ty: number, la: number, lb: number, sgn: number) {
  let dx = tx - ax, dy = ty - ay; const d0 = Math.hypot(dx, dy) || 1, d = Math.min(d0, (la + lb) * 0.995); dx = dx / d0 * d; dy = dy / d0 * d;
  const A = Math.acos(p3Clamp((la * la + d * d - lb * lb) / (2 * la * d), -1, 1)), ang = Math.atan2(dy, dx) + sgn * A;
  return [ax + Math.cos(ang) * la, ay + Math.sin(ang) * la, ax + dx, ay + dy];
}
function z3Star2(c: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number) {
  c.beginPath(); for (let i = 0; i < 10; i++) { const a = rot - Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath();
  c.fillStyle = '#ffc83d'; c.fill(); c.lineWidth = 6; c.strokeStyle = Z3_O; c.stroke();
}
// a face/head path from an SVG path string, cached
const Z3_P = new Map<string, Path2D>(); const z3P = (d: string) => { let p = Z3_P.get(d); if (!p) { p = new Path2D(d); Z3_P.set(d, p); } return p; };

function z3Char(S: Z3Spec) {
  const tico = S.kind === 'tico', K = Z3_K[S.kind], H2 = Z3_H2[S.kind];
  const g = new THREE.Group();
  const cv = document.createElement('canvas'); cv.width = Z3_W * Z3_PX; cv.height = Z3_H * Z3_PX; const c = cv.getContext('2d')!;
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.04, toneMapped: false, side: THREE.DoubleSide, fog: false });
  const card = new THREE.Mesh(new THREE.PlaneGeometry(Z3_W * Z3_U, Z3_H * Z3_U), mat); card.castShadow = true; card.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5, side: THREE.DoubleSide }); card.position.y = -(Z3_Y0 + Z3_H / 2) * Z3_U;
  const pivot = new THREE.Group(); g.add(pivot); pivot.add(card); Z3_SPRITES.push({ mesh: card, g: pivot });
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(tico ? 0.5 : 0.4, 32), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.22, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.012; shadow.scale.y = 0.5; g.add(shadow);
  // things the scenes switch on and off or turn (read back when drawing)
  const head = new THREE.Group(), bulb = new THREE.Group(), bump = new THREE.Group(), black = new THREE.Group(); bulb.visible = bump.visible = black.visible = false;
  let starsOn = false, starsA = 0;

  // ---------------- the acting brain (same as the 3D actor), hands in drawing units
  const mine = tico ? Z3_TICO_T : Z3_DOTA_T, theirs = tico ? Z3_DOTA_T : Z3_TICO_T, seed = tico ? 0 : 1.3;
  const inR = (R: [number, number][], s: number) => R.some(([a, b]) => s > a && s < b);
  const LOCK = new Set(['hold', 'hug']), N = 28;
  let pose = tico ? 'cross' : 'up', from = pose, at = -99, crazyOn = false, other = tico ? 1 : -1, forced: string | null = null;
  // extra looks the scenes switch per frame: chickenpox spots, a hurt (red, swollen) finger, a thermometer in the mouth, a sneeze (0..1: inhale, achoo), a sad face
  const fx = { spots: 0, hurt: 0, thermo: 0, sneeze: 0, sad: 0, rex: 0, frill: 0, sweat: 0, freeze: 0 };
  const myPhrase = (s: number) => { const P = z3Phrases(), j = z3Find(P, s + 0.15, (x) => x.t0); for (let k = j; k >= Math.max(0, j - 1); k--) { const p = P[k]; if (s < p.t1 + 0.45 && inR(mine, (p.t0 + p.t1) / 2)) return p; } return null; };
  const lastKey = (s: number) => { let b = -99; for (const k of Z3_KEYS) if (k <= s && k > b) b = k; return b; };
  const raw = (s: number) => {
    const P = new Array(N).fill(0), base = s < at ? from : pose, talk = inR(mine, s), recent = at > -90 && s > at - 0.2 && s < at + 1.6;
    const locked = LOCK.has(base) || recent || crazyOn, ph = myPhrase(s), h = z3Hash;
    let gs = base;
    if (forced) gs = forced;
    else if (!locked && ph) {
      const list = tico ? ['explain', 'point', 'palm', 'count', 'explain', 'chin', 'shrug'] : ['explain', 'point', 'cheer', 'shrug'];
      gs = ph.q ? 'shrug' : ph.ex ? (tico ? 'big' : 'cheer') : list[Math.floor(h(ph.i * 1.7 + 0.3) * list.length)];
    } else if (!locked && !talk) {
      const Wd = tico ? 4.2 : 3.0, q = s + seed * 7, n = Math.floor(q / Wd), u = q - n * Wd, r = h(n * 9.1 + seed);
      if (tico && (base === 'cross' || base === 'point')) { if (r > 0.35 && r < 0.6 && u < 1.0) gs = 'glasses'; else if (r >= 0.6 && r < 0.8 && u < 1.8) gs = 'chin'; }
      if (!tico && (base === 'up' || base === 'down')) { if (r > 0.3 && r < 0.55 && u < 1.5) gs = 'scratch'; else if (r >= 0.55 && r < 0.75 && u < 1.2) gs = 'wave'; }
    }
    const kd = s - lastKey(s);
    if (!forced && !locked && kd >= 0) { if (tico && base === 'point' && kd < 1.3) gs = 'point'; if (!tico && !ph && kd < 0.9) { gs = 'cheer'; P[27] = 1; } }
    const hs = H2[gs] || H2[base] || H2[tico ? 'cross' : 'up'], gp = Z3_GP[gs] || Z3_GP.cross;
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
    for (let j = 0; j < Z3_KER.length; j++) { const r = raw(t - j / 30), w = Z3_KER[j]; for (let i = 0; i < N; i++) A[i] += w * r[i]; }
    const f = raw(t + 0.13), n = raw(t); for (let i = 0; i < 13; i++) A[i] -= 0.22 * (f[i] - n[i]);
    return A;
  };

  // ---------------- the drawing
  const fs = (p: Path2D, fill: string | null, lw = 8) => { if (fill) { c.fillStyle = fill; c.fill(p); } if (lw) { c.lineWidth = lw; c.strokeStyle = Z3_O; c.stroke(p); } };
  const ell = (x: number, y: number, rx: number, ry: number, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); return p; };
  const noodle = (ax: number, ay: number, ex: number, ey: number, hx: number, hy: number, w: number, col: string) => {
    const p = new Path2D(); p.moveTo(ax, ay); p.quadraticCurveTo(2 * ex - (ax + hx) / 2, 2 * ey - (ay + hy) / 2, hx, hy);
    c.lineCap = 'round'; c.lineWidth = w + 15; c.strokeStyle = Z3_O; c.stroke(p); c.lineWidth = w; c.strokeStyle = col; c.stroke(p);
    c.save(); c.translate(-w * 0.18, -w * 0.18); c.lineWidth = w * 0.28; c.strokeStyle = 'rgba(255,255,255,0.18)'; c.stroke(p); c.restore();
  };
  const bodyPath = (w: number, top: number, bot: number, lean: number, belly: number) => {
    const h = w / 2; return new Path2D(`M${-h + lean} ${top + 52} C${-h + lean} ${top + 8} ${-h * 0.45 + lean} ${top} ${lean} ${top} C${h * 0.45 + lean} ${top} ${h + lean} ${top + 8} ${h + lean} ${top + 52} C${h * 1.06 + belly} ${(top + bot) / 2} ${h * 1.04} ${bot - 30} ${h * 0.86} ${bot - 8} C${h * 0.5} ${bot + 10} ${-h * 0.5} ${bot + 10} ${-h * 0.86} ${bot - 8} C${-h * 1.04} ${bot - 30} ${-h * 1.06 - belly} ${(top + bot) / 2} ${-h + lean} ${top + 52}Z`.replace(/(\d+\.\d)\d+/g, '$1'));
  };
  const E = tico ? [[-50, -478, 36], [50, -478, 36]] : [[-38, -332, 28], [40, -332, 28]];
  const draw = (t: number) => {
    const P = smooth(t), Pl = smooth(t - 0.1), talking = inR(mine, t);
    z3Phrases(); let beat = 0; const bj = z3Find(Z3_BEAT, t, (x) => x); for (let k = bj; k >= Math.max(0, bj - 3); k--) if (inR(mine, Z3_BEAT[k])) beat += z3Imp(t - Z3_BEAT[k] + 0.04);
    beat = Math.min(1.2, beat);
    let hop = 0, hsq = 0;
    if (!tico && !crazyOn && !LOCK.has(pose)) {
      const evs = [lastKey(t + 0.1)]; const Wd = 3.0, q = t + seed * 7, n = Math.floor(q / Wd); if (z3Hash(n * 9.1 + seed) > 0.85) evs.push(n * Wd - seed * 7 + 0.3);
      for (const e of evs) { const dt = t - e; if (dt > -0.12 && dt < 0) hsq -= 0.1 * Math.sin((dt + 0.12) / 0.12 * Math.PI); else if (dt >= 0 && dt < 0.42) { const u = dt / 0.42; hop += 4 * u * (1 - u) * 60; hsq += 0.08 * Math.cos(u * Math.PI); } else if (dt >= 0.42 && dt < 0.6) hsq -= 0.12 * Math.sin((dt - 0.42) / 0.18 * Math.PI); }
    }
    const br = Math.sin(t * (tico ? 2.6 : 3.6) + seed), sq = 0.012 * br + 0.025 * beat + hsq + (talking ? 0.012 * Math.abs(Math.sin(t * 7.5)) : 0);
    const tk = talking ? 1 : 0, dip = 14 * beat + Math.max(0, -hsq) * 60;
    const lean = P[9] * 260 + P[7] * 40 + 8 * Math.sin(t * 1.3 + seed) + (tk ? 5 * Math.sin(t * 3.1) : 0);
    const yaw = P[10] + 0.04 * Math.sin(t * 0.7 + seed) + tk * 0.09 * Math.sin(t * 1.7 + seed) + head.rotation.y, dx = yaw * 70;
    const tilt = P[11] + tk * 0.07 * Math.sin(t * 2.1 + 1) + (Pl[11] - P[11]) * 0.9 + (Pl[9] - P[9]) * 2.5 - head.rotation.z;
    const snz = fx.sneeze, inh = snz > 0 && snz < 0.75 ? snz / 0.75 : 0, ach = snz >= 0.75 ? 1 : 0;
    const nodY = (P[12] + 0.13 * beat + tk * 0.04 * Math.sin(t * 3.3) + head.rotation.x + (Pl[12] - P[12]) * 0.8) * 60 - 28 * inh + 30 * ach;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
    c.setTransform(Z3_PX, 0, 0, Z3_PX, -Z3_X0 * Z3_PX, -Z3_Y0 * Z3_PX); c.lineJoin = 'round';
    c.translate(0, -hop); c.scale(1 - sq * 0.5, 1 + sq);
    // legs from the hips (that dip) to feet planted on the floor: the knees bend
    for (const sx of [-1, 1]) {
      const hx = sx * K.hip + lean * 0.15, hy = K.hipY + dip, fx = sx * K.foot, fy = -24, L = (fy - K.hipY) * 0.52, [ex, ey] = z3IK2(hx, hy, fx, fy, L, L, sx > 0 ? -1 : 1);
      noodle(hx, hy, ex + sx * 6, ey, fx, fy, K.leg, K.skin);
    }
    const tap = tico && !talking && z3Hash(Math.floor(t / 2.5)) > 0.5 ? Math.max(0, Math.sin(t * 8)) : 0;
    for (const sx of [-1, 1]) { c.save(); c.translate(sx * (K.foot + 4), -14); if (sx > 0) c.rotate(-0.3 * tap); fs(ell(0, 0, tico ? 50 : 38, tico ? 22 : 18), K.face, 7); c.restore(); }
    // body: the t-shirt sack, leaning
    const top = K.top + dip, bot = K.bot + dip * 0.5;
    fs(bodyPath(K.w, top, bot, lean, 4 * Math.sin(t * 2)), K.shirtD); c.fillStyle = K.shirt; c.fill(bodyPath(K.w * 0.84, top + 12, bot - 14, lean - 10, 0));
    c.lineWidth = 12; c.strokeStyle = 'rgba(0,0,0,0.2)'; c.beginPath(); c.moveTo(-K.w * 0.22 + lean, top + 8); c.quadraticCurveTo(lean, top + 34, K.w * 0.22 + lean, top + 8); c.stroke();
    // head (lagging tilt, nod, turn: the face slides over the skull)
    c.save(); c.translate(lean, dip + 16 * P[23]); c.translate(0, K.neck); c.rotate(tilt * 0.8 * (1 - fx.freeze)); c.translate(0, -K.neck); c.translate(0, nodY * 0.25 * (1 - fx.freeze));
    const HC = tico ? [0, -478, 140] : [0, -322, 125];
    if (fx.frill > 0) {   // a cardboard frill behind the head (Dota's costume)
      c.save(); c.translate(HC[0], HC[1]); c.scale(fx.frill, fx.frill); const fr = new Path2D(); for (let i = 0; i <= 14; i++) { const a = Math.PI * (0.05 + 0.9 * i / 14) + Math.PI, rr = i % 2 ? HC[2] * 1.55 : HC[2] * 1.85; fr.lineTo(Math.cos(a) * rr * 1.1, Math.sin(a) * rr * 0.95 + 40); } for (let i = 14; i >= 0; i--) { const a = Math.PI * (0.05 + 0.9 * i / 14) + Math.PI; fr.lineTo(Math.cos(a) * HC[2] * 0.6, Math.sin(a) * HC[2] * 0.5 + 40); } fr.closePath();
      fs(fr, '#c99a5e', 8); c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 5; for (let i = 0; i < 7; i++) { const a = Math.PI * (0.12 + 0.76 * i / 6) + Math.PI; c.beginPath(); c.moveTo(Math.cos(a) * HC[2] * 0.7, Math.sin(a) * HC[2] * 0.55 + 40); c.lineTo(Math.cos(a) * HC[2] * 1.6, Math.sin(a) * HC[2] * 1.45 + 40); c.stroke(); }
      c.fillStyle = '#e8a53a'; c.fill(ell(-HC[2] * 1.2, -HC[2] * 0.6, 14, 14)); c.fill(ell(HC[2] * 1.2, -HC[2] * 0.6, 14, 14)); c.restore();
    }
    const sw = (tilt - P[11]) * 3 + 0.12 * beat + 0.04 * Math.sin(t * 2.3 + seed) + hop * 0.004;
    const ear = (x: number, y: number, R: number, r: number, s: number) => { c.save(); c.translate(x - dx * 0.35, y); c.rotate(s * sw * 0.6); fs(ell(0, 0, R, R), K.skin); c.fillStyle = K.face; c.fill(ell(0, 0, r, r)); c.restore(); };
    if (tico) {
      ear(-130, -475, 48, 25, -1); ear(130, -475, 48, 25, 1);
      c.save(); c.translate(0, -606); c.rotate(sw * 2); c.translate(0, 606); fs(z3P('M-12 -604 Q2 -646 18 -604'), K.skin); c.restore();
      fs(z3P('M0 -607 C 80 -607 133 -560 133 -478 C 133 -400 78 -346 0 -346 C -78 -346 -133 -400 -133 -478 C -133 -560 -80 -607 0 -607Z'), K.skin);
      c.fillStyle = 'rgba(0,0,0,0.15)'; c.fill(z3P('M60 -590 C 112 -566 132 -520 130 -470 C 120 -540 90 -575 60 -590Z'));
    } else {
      [[-38, -432, -22], [0, -446, 0], [38, -432, 22]].forEach(([x, y, r], i) => { c.save(); c.translate((i - 1) * 38, -420); c.rotate(sw * (1.6 + i * 0.4) * (i === 1 ? 1 : 0.8) * 0.017 * 57); c.translate(-(i - 1) * 38, 420); fs(ell(x, y, 17, 33, r * Math.PI / 180), K.skin); c.restore(); });
      ear(-112, -318, 42, 22, -1); ear(112, -318, 42, 22, 1);
      fs(z3P('M0 -440 C 72 -440 118 -396 118 -322 C 118 -250 70 -204 0 -204 C -70 -204 -118 -250 -118 -322 C -118 -396 -72 -440 0 -440Z'), K.skin);
      c.fillStyle = 'rgba(0,0,0,0.14)'; c.fill(z3P('M55 -425 C 100 -404 118 -370 116 -322 C 108 -380 85 -410 55 -425Z'));
    }
    // the face, slid by the head turn and clipped to the skull
    c.save(); c.clip(tico ? z3P('M0 -607 C 80 -607 133 -560 133 -478 C 133 -400 78 -346 0 -346 C -78 -346 -133 -400 -133 -478 C -133 -560 -80 -607 0 -607Z') : z3P('M0 -440 C 72 -440 118 -396 118 -322 C 118 -250 70 -204 0 -204 C -70 -204 -118 -250 -118 -322 C -118 -396 -72 -440 0 -440Z'));
    c.translate(dx, nodY * 0.2);
    c.fillStyle = K.face; c.fill(z3P(tico ? 'M-100 -470 Q-100 -545 -45 -548 Q0 -520 45 -548 Q100 -545 100 -470 Q100 -360 0 -358 Q-100 -360 -100 -470Z' : 'M-92 -320 Q-92 -385 -40 -390 Q0 -366 40 -390 Q92 -385 92 -320 Q92 -225 0 -222 Q-92 -225 -92 -320Z'));
    c.fillStyle = tico ? '#f8e6c8' : '#f8e3c4'; c.fill(tico ? ell(0, -398, 64, 36) : ell(0, -262, 58, 36));
    c.fillStyle = 'rgba(255,143,143,0.42)'; c.fill(tico ? ell(-78, -410, 20, 11) : ell(-70, -276, 18, 10)); c.fill(tico ? ell(78, -410, 20, 11) : ell(74, -276, 18, 10));
    c.fillStyle = Z3_O; c.fill(tico ? ell(-10, -420, 5, 5) : ell(-10, -284, 4, 4)); c.fill(tico ? ell(10, -420, 5, 5) : ell(8, -284, 4, 4));
    if (!tico && black.visible) { c.fillStyle = '#6a4a8c'; c.fill(ell(40, -332, 44, 44)); }
    // eyes: whites, pupils (looking, saccades, crazy), lids (blinks, wide, squint)
    const bt = (t + seed) % 3.3, dbl = z3Hash(Math.floor((t + seed) / 3.3)) > 0.6, ph = myPhrase(t);
    const closed = bt < 0.1 || (dbl && bt > 0.2 && bt < 0.3) || (ph && Math.abs(t - ph.t0) < 0.05) || Math.abs(Pl[10] - P[10]) > 0.12;
    const lidC = fx.freeze > 0.5 ? 0 : closed || ach ? 1 : p3Clamp((tico ? 0.18 : 0.12) - P[20] * 0.15 + 0.08 * beat + 0.45 * inh + 0.12 * fx.sad, 0, 0.75);
    const sac = Math.floor((t + seed) / 1.4), sx0 = (z3Hash(sac) - 0.5) * 0.2, sy0 = (z3Hash(sac + 7) - 0.5) * 0.15, lk = tico ? 1 : 0.35;
    E.forEach(([ex, ey, r], i) => {
      const eye = ell(ex, ey, r, r); c.fillStyle = '#fff'; c.fill(eye); if (!tico) { c.lineWidth = 7; c.strokeStyle = Z3_O; c.stroke(eye); }
      c.save(); c.clip(eye);
      const px = crazyOn ? ex + (i ? 8 : -6) + 4 * Math.sin(t * 9 + i * 2) : ex + (P[13] + sx0) * lk * 26, py = crazyOn ? ey + (i ? -10 : 6) + 4 * Math.cos(t * 9 + i) : ey - (P[14] + sy0) * lk * 20;
      c.fillStyle = Z3_O; c.fill(ell(px, py, 13, 13)); c.fillStyle = '#fff'; c.fill(ell(px + 4, py - 4, 4, 4));
      const yb = ey - r + 2 * r * lidC, lid = new Path2D(`M${ex - r - 4} ${ey - r - 6} L${ex + r + 4} ${ey - r - 6} L${ex + r + 4} ${yb.toFixed(1)} Q${ex} ${(yb + r * 0.35 * (1 - lidC * 0.6)).toFixed(1)} ${ex - r - 4} ${yb.toFixed(1)}Z`);
      c.fillStyle = K.face; c.fill(lid); c.lineWidth = 6; c.strokeStyle = Z3_O; c.stroke(lid); c.restore();
    });
    if (tico) {
      c.lineWidth = 8; c.strokeStyle = Z3_O; c.beginPath(); c.moveTo(-130, -478); c.lineTo(-92, -478); c.moveTo(130, -478); c.lineTo(92, -478); c.moveTo(-8, -478); c.lineTo(8, -478); c.stroke();
      c.lineWidth = 9; c.stroke(ell(-50, -478, 42, 42)); c.stroke(ell(50, -478, 42, 42));
      c.lineWidth = 7; c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineCap = 'round'; c.beginPath(); c.moveTo(-78, -496); c.quadraticCurveTo(-66, -510, -50, -512); c.moveTo(22, -496); c.quadraticCurveTo(34, -510, 50, -512); c.stroke();
    }
    // brows: lifted by the gesture and on stressed words; Tico's "told you so" asymmetry, Dota's worried look
    const lift = P[19] * 10 + beat * 9; c.lineWidth = tico ? 11 : 9; c.strokeStyle = Z3_O; c.lineCap = 'round'; c.beginPath();
    if (tico) { c.moveTo(-92, -542 - lift); c.quadraticCurveTo(-60, -552 - lift, -28, -530 - lift); const b2 = lift * 1.4 + (P[19] > 0.3 ? 0 : 6); c.moveTo(28, -532 - b2); c.quadraticCurveTo(60, -556 - b2, 92, -546 - lift); }
    else { const wo = crazyOn ? 8 : -12 * fx.sad; c.moveTo(-70, -384 - lift - wo); c.quadraticCurveTo(-40, -394 - lift, -12, -376 - lift + wo); c.moveTo(12, -372 - lift + wo); c.quadraticCurveTo(40, -394 - lift, 68, -388 - lift - wo); }
    c.stroke();
    // mouth: lip sync from the words; a little "oh" when surprised; the resting face otherwise
    const lip = talking ? z3Lip(t) : null, mw = lip ? lip[0] : P[27] > 0.2 ? 0.7 : tico ? 0.8 : 0.6, mo = lip ? lip[1] : P[27] > 0.2 ? 0.8 * P[27] : tico ? 0 : 0.3;
    const mx = 0, my = tico ? -386 : -248, k = tico ? 1 : 1.05; let mw2 = mw, mo2 = mo;
    if (snz > 0) { mw2 = ach ? 1.35 : 0.7; mo2 = ach ? 1.05 : 0.35 + 0.55 * inh; } else if (fx.thermo) { mw2 = 0.5; mo2 = Math.max(mo, 0.15); } else if (fx.sad && !lip) mo2 = 0;
    if (mo2 < 0.12) { c.lineWidth = 8; c.beginPath(); c.moveTo(mx - 34 * k, my); c.quadraticCurveTo(mx, my + 16 * k * (fx.sad ? -1.3 : tico ? 1 : -0.4), mx + 36 * k, my - 8 * k * (fx.sad ? -1 : 1)); c.stroke(); }
    else {
      const W = 26 * mw2 * k, Hh = 30 * mo2 * k, m = new Path2D(`M${(mx - W).toFixed(1)} ${(my - Hh * 0.2).toFixed(1)} Q${mx} ${(my - Hh * 0.55).toFixed(1)} ${(mx + W).toFixed(1)} ${(my - Hh * 0.2).toFixed(1)} Q${(mx + W * 0.9).toFixed(1)} ${(my + Hh).toFixed(1)} ${mx} ${(my + Hh * 1.1).toFixed(1)} Q${(mx - W * 0.9).toFixed(1)} ${(my + Hh).toFixed(1)} ${(mx - W).toFixed(1)} ${(my - Hh * 0.2).toFixed(1)}Z`);
      c.fillStyle = '#6b1a1a'; c.fill(m); if (mo2 > 0.3) { c.save(); c.clip(m); c.fillStyle = '#ff8fa3'; c.fill(ell(mx, my + Hh * 0.95, W * 0.6, Hh * 0.45)); c.restore(); } c.lineWidth = 6; c.strokeStyle = Z3_O; c.stroke(m);
    }
    if (!tico) { c.save(); c.translate(52, -290); c.rotate(-28 * Math.PI / 180); c.translate(-52, 290); const band = new Path2D(); band.roundRect(18, -305, 72, 30, 13); fs(band, '#f0b088', 6); c.fillStyle = Z3_O; for (const [x, y] of [[48, -294], [60, -294], [48, -285], [60, -285]]) c.fill(ell(x, y, 3, 3)); c.restore(); }
    if (fx.spots > 0) { c.globalAlpha = Math.min(1, fx.spots); for (const [x, y, r] of (tico ? [] : [[-62, -360, 9], [70, -372, 8], [-30, -410, 7], [26, -228, 7], [-74, -250, 8], [82, -300, 7], [0, -392, 6], [-90, -300, 6]])) { fs(ell(x, y, r, r), '#e8453c', 3); c.fillStyle = 'rgba(255,255,255,0.6)'; c.fill(ell(x - r * 0.3, y - r * 0.3, r * 0.3, r * 0.3)); } c.globalAlpha = 1; }
    c.restore(); // face clip
    if (fx.rex > 0) {   // a plush T. rex hood (Dota's costume): green dome with spikes, the upper jaw and its felt teeth over the forehead
      c.save(); c.translate(HC[0], HC[1]); const R = HC[2];
      for (let i = 0; i < 5; i++) { const a = -Math.PI * (0.2 + 0.6 * i / 4); const sp = new Path2D(); sp.moveTo(Math.cos(a - 0.12) * R * 1.02, Math.sin(a - 0.12) * R * 1.02); sp.lineTo(Math.cos(a) * R * 1.32, Math.sin(a) * R * 1.32); sp.lineTo(Math.cos(a + 0.12) * R * 1.02, Math.sin(a + 0.12) * R * 1.02); sp.closePath(); fs(sp, '#f2a33a', 6); }
      const hood = new Path2D(); hood.moveTo(-R * 1.1, R * 0.15); hood.bezierCurveTo(-R * 1.2, -R * 1.25, R * 1.2, -R * 1.25, R * 1.1, R * 0.15); hood.quadraticCurveTo(R * 0.9, -R * 0.35, 0, -R * 0.38); hood.quadraticCurveTo(-R * 0.9, -R * 0.35, -R * 1.1, R * 0.15); hood.closePath(); fs(hood, '#5cbf4a');
      c.fillStyle = 'rgba(0,0,0,0.14)'; c.fill(ell(R * 0.5, -R * 0.8, R * 0.35, R * 0.18, 0.4));
      c.fillStyle = '#fff'; for (let i = 0; i < 7; i++) { const x = -R * 0.75 + i * R * 0.25, y = -R * 0.36 - Math.abs(x) * 0.12; const th = new Path2D(); th.moveTo(x - 12, y); th.lineTo(x, y + 26); th.lineTo(x + 12, y); th.closePath(); fs(th, '#ffffff', 4); }
      for (const s of [-1, 1]) { fs(ell(s * R * 0.42, -R * 0.82, 20, 20), '#fff', 5); c.fillStyle = Z3_O; c.fill(ell(s * R * 0.42 + 3, -R * 0.8, 9, 9)); }
      c.restore();
    }
    if (fx.sweat > 0) { for (let i = 0; i < 3; i++) { const u = ((t * 1.3 + i * 0.37) % 1); const x = HC[0] + (i - 1) * HC[2] * 0.9 + (i === 1 ? HC[2] * 1.1 : 0), y = HC[1] - HC[2] * 0.5 + u * HC[2] * 0.9; c.globalAlpha = fx.sweat * (1 - u); const d = new Path2D(); d.moveTo(x, y - 18); d.quadraticCurveTo(x + 13, y + 6, x, y + 12); d.quadraticCurveTo(x - 13, y + 6, x, y - 18); fs(d, '#9fdcff', 4); c.globalAlpha = 1; } }
    if (fx.thermo) { c.save(); c.translate(dx, nodY * 0.2); const x0 = 10, y0 = my + 2, x1 = 120, y1 = my - 46; c.lineCap = 'round'; c.lineWidth = 26; c.strokeStyle = Z3_O; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.lineWidth = 16; c.strokeStyle = '#eef3f8'; c.stroke(); c.lineWidth = 6; c.strokeStyle = '#e8303a'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + (x1 - x0) * Math.min(1, fx.thermo), y0 + (y1 - y0) * Math.min(1, fx.thermo)); c.stroke(); c.restore(); }
    if (!tico && bump.visible) { fs(ell(-40, -432, 30, 30), '#ff8f8f', 7); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fill(ell(-48, -442, 8, 8)); }
    if (tico && bulb.visible) {
      c.save(); c.translate(0, -700); c.lineWidth = 8; c.strokeStyle = Z3_O; c.beginPath(); c.moveTo(-80, 0); c.lineTo(-60, 0); c.moveTo(60, 0); c.lineTo(80, 0); c.moveTo(0, -84); c.lineTo(0, -66); c.stroke();
      fs(ell(0, 0, 46, 46), '#ffc83d'); c.beginPath(); c.moveTo(-14, 10); c.lineTo(0, -8); c.lineTo(14, 10); c.lineWidth = 7; c.stroke(); const cap = new Path2D(); cap.roundRect(-22, 44, 44, 26, 6); fs(cap, '#c9d3e0', 7); c.restore();
    }
    if (starsOn) for (let i = 0; i < 3; i++) { const a = starsA + i * 2.1; z3Star2(c, Math.cos(a) * 110, (tico ? -640 : -470) + Math.sin(a) * 22, 24, a); }
    c.restore(); // head
    // arms and hands: spring-smoothed targets + flick on stressed words + waving / scratching; elbows out and down
    for (const side of [0, 1]) {
      const sxs = side ? 1 : -1; let tx = P[side * 3], ty = P[side * 3 + 1] + dip * 0.6;
      const fl = P[26] * tk * (side === 1 ? 1 : 0.5) * beat; ty += 18 * fl; const gw = P[26] * tk * (side === 1 ? 1 : 0.6);
      tx += gw * 14 * Math.sin(t * 3.1 + side * 2); ty += gw * 14 * Math.sin(t * 2.3 + side) + 3 * br;
      if (side === 1) { tx += P[24] * 22 * Math.sin(t * 14); ty += P[25] * 10 * Math.sin(t * 18); }
      const shx = sxs * K.sh + lean * 0.8, shy = K.shY + dip + 4 * br - 18 * P[23];
      const s1 = z3IK2(shx, shy, tx, ty, K.a, K.b, sxs), s2 = z3IK2(shx, shy, tx, ty, K.a, K.b, -sxs), pick = (s: number[]) => Math.abs(s[0]) * 1.2 + s[1] * 0.6, [ex, ey, hx, hy] = pick(s1) > pick(s2) ? s1 : s2;
      noodle(shx, shy, ex, ey, hx, hy, K.arm, K.skin);
      const ang = Math.atan2(hy - ey, hx - ex), curl = p3Clamp(P[15 + side]), pt = side === 1 ? p3Clamp(P[21]) : 0, r = K.hand;
      c.save(); c.translate(hx, hy); c.rotate(ang);
      if (pt > 0.5) { const f = new Path2D(); f.roundRect(r * 0.7, -8, r * 1.5, 16, 8); fs(f, K.skin, 6); }
      else if (curl < 0.45) for (const a of [-0.55, 0, 0.55]) { c.save(); c.rotate(a); const f = new Path2D(); f.roundRect(r * 0.6, -7, r * 0.95, 14, 7); fs(f, K.skin, 6); c.restore(); }
      const hr = side === 1 ? fx.hurt : 0; if (hr > 0) { const s = 1 + 0.3 * hr * (1 + 0.25 * Math.sin(t * 12)); c.scale(s, s); c.strokeStyle = '#e8303a'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); for (const a of [-0.9, 0, 0.9]) { c.moveTo(Math.cos(a) * r * 1.6, Math.sin(a) * r * 1.6 - r * 0.6); c.lineTo(Math.cos(a) * r * 2.1, Math.sin(a) * r * 2.1 - r * 0.8); } c.stroke(); }
      fs(ell(0, 0, r * 1.12, r), hr > 0 ? (hr > 0.5 ? '#d9463a' : '#c95a3a') : K.skin, 7); c.fillStyle = 'rgba(255,255,255,0.18)'; c.fill(ell(-r * 0.35, -r * 0.3, r * 0.4, r * 0.25)); c.restore();
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
    force(g: string | null) { forced = g; },
    fx,
    live(t: number) { draw(t); },
  });
}
const Z3_TICO_T: [number, number][] = [[3.56, 10.05], [10.48, 29.99], [32.88, 42.52], [46.37, 48.35], [48.85, 52.7], [53.36, 66.73], [71.53, 87.12], [90.56, 104.08], [104.56, 119.91], [123.06, 138.01], [138.58, 159.56], [163.63, 186.58], [189.92, 195.01], [198.73, 222.67], [227.76, 233.34], [233.85, 256.67], [259.52, 266.61], [267.06, 275.98], [277.99, 290.56], [291.05, 300.74], [304.66, 306.03], [306.71, 325.47], [328.01, 346.85], [349.26, 352.75], [353.37, 366.78], [369.72, 373.41], [374.08, 383.62]];
const Z3_DOTA_T: [number, number][] = [[-0.05, 2.95], [30.56, 32.3], [42.97, 45.72], [67.25, 70.95], [87.77, 90.13], [120.47, 122.44], [160.1, 163.0], [187.12, 189.32], [195.48, 198.11], [223.21, 227.06], [257.22, 258.89], [276.57, 277.5], [301.3, 304.07], [325.96, 327.44], [347.35, 348.68], [367.51, 369.06], [384.31, 389.09]];
function z3Tico() { const c = z3Char(Z3_TICO); c.setPose('cross'); return c; }
function z3Dota() { const c = z3Char(Z3_DOTA); c.setPose('up'); return c; }

// ---------------- soft, smooth scenery (no faceted low-poly): puffy clouds and round trees
function z3Cloud(p: Vec3, s = 1) { const m = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 1, sheen: 1, sheenColor: new THREE.Color('#dfefff'), emissive: '#ffffff', emissiveIntensity: 0.18 }); const g = new THREE.Group(); for (const [x, y, z, r] of [[0, 0, 0, 1.4], [1.4, -0.2, 0.2, 1.0], [-1.3, -0.3, 0, 1.0], [0.5, 0.6, -0.3, 0.95], [-0.6, 0.4, 0.3, 0.8]]) { const b = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), m); b.position.set(x, y, z); g.add(b); } g.position.set(...p); g.scale.setScalar(s); return g; }
function z3Tree(p: Vec3, s = 1, seed = 1) { const r = p3Rnd(seed), trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 1.4, 16), z3Mat('#8a5a3b', 0.9)); trunk.position.y = 0.7; const g = new THREE.Group(); g.add(trunk); const leaf = new THREE.MeshPhysicalMaterial({ color: '#4caf50', roughness: 0.85, sheen: 0.6, sheenColor: new THREE.Color('#bff5a0') }); for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(p3Blob((x, y, z) => { const n = p3Fbm3(x * 2 + seed, y * 2, z * 2) * 0.35; return [x * (0.9 + n), y * (0.85 + n), z * (0.9 + n)]; }, undefined, 32, 24), leaf); b.position.set((r() - 0.5) * 0.8, 1.9 + r() * 0.8, (r() - 0.5) * 0.6); b.scale.setScalar(0.7 + r() * 0.4); b.castShadow = true; g.add(b); } g.position.set(...p); g.scale.setScalar(s); Z3_TREES.push(g); return g; }
function z3Forest(n = 22, seed = 3, z0 = -14, width = 60) { const r = p3Rnd(seed), g = new THREE.Group(); for (let i = 0; i < n; i++) g.add(z3Tree([p3Lerp(-width / 2, width / 2, r()), 0, z0 - r() * 18], 0.8 + r() * 0.7, i + seed)); return g; }
// the image finish shared by every scene: studio reflections, ACES colour, a soft grade, vignette and a little grain
// depth of field that only softens what is far behind the subject (the foreground and the characters stay sharp)
const Z3_DOF = {
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
let Z3_FIN: { composer: THREE.EffectComposer; pass: THREE.RenderPass; dof: THREE.ShaderPass; grade: THREE.ShaderPass; depthRT: THREE.WebGLRenderTarget; depthM: THREE.MeshDepthMaterial } | null = null;
// floating dust in the light: tiny warm specks drifting through the shot (parallax = depth)
function z3Dust(n = 170) {
  const r = p3Rnd(77), base = new Float32Array(n * 3), pos = new Float32Array(n * 3); for (let i = 0; i < n * 3; i++) base[i] = r();
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dot = z3Paint(64, 64, (c) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 64); });
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.095, map: dot, color: '#fff3d6', transparent: true, opacity: 0.65, depthWrite: false, sizeAttenuation: true, fog: false }));
  return Object.assign(pts, { pose(t: number, c: THREE.Vector3, span = 9) {
    for (let i = 0; i < n; i++) { const bx = base[i * 3], by = base[i * 3 + 1], bz = base[i * 3 + 2];
      pos[i * 3] = c.x + (((bx * span + t * 0.12 + 0.3 * Math.sin(t * 0.7 + i)) % span + span) % span - span / 2);
      pos[i * 3 + 1] = c.y + (((by * span * 0.7 + t * 0.06 + 0.2 * Math.sin(t * 0.9 + i * 1.7)) % (span * 0.7)) - span * 0.35);
      pos[i * 3 + 2] = c.z + bz * span - span / 2; }
    g.attributes.position.needsUpdate = true; } });
}
// the trees of the page, swayed by the wrapper
const Z3_TREES: THREE.Object3D[] = [];
function z3Finish(w: World) {
  const r = w.renderer; w.scene.environment = p3Env(r); (w.scene as THREE.Scene & { environmentIntensity: number }).environmentIntensity = 0.35; r.toneMappingExposure = 1.0;
  if (!Z3_FIN) {
    const FW = r.domElement.width, FH = r.domElement.height;   // 1920x1080 for this horizontal video
    const composer = new THREE.EffectComposer(r, new THREE.WebGLRenderTarget(FW, FH, { type: THREE.HalfFloatType, samples: 4 })); composer.setSize(FW, FH);
    const pass = new THREE.RenderPass(w.scene, w.camera); composer.addPass(pass);
    const dof = new THREE.ShaderPass(Z3_DOF); dof.uniforms.uRes.value = new THREE.Vector2(FW, FH); composer.addPass(dof); composer.addPass(new THREE.OutputPass());
    const grade = new THREE.ShaderPass({ ...P3_GRADE, uniforms: { tDiffuse: { value: null }, uT: { value: 0 }, uSat: { value: 1.12 }, uCurve: { value: 0.45 }, uVig: { value: 0.7 }, uGrain: { value: 0.012 }, uRed: { value: 0 }, uGray: { value: 0 } } }); composer.addPass(grade);
    const depthRT = new THREE.WebGLRenderTarget(FW / 2, FH / 2), depthM = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
    Z3_FIN = { composer, pass, dof, grade, depthRT, depthM };
  }
  w.present = () => {
    const f = Z3_FIN!, cam = w.camera, swap: [THREE.Mesh, THREE.Material | THREE.Material[]][] = [], hid: THREE.Object3D[] = [];
    // depth pass (alpha-tested for the paper cut-outs) for the depth of field
    w.scene.traverse((o) => { if (!o.visible) return; const m = o as THREE.Mesh; if ((o as THREE.Points).isPoints || (o as THREE.Line).isLine) { hid.push(o); o.visible = false; return; }
      if (m.isMesh) { const mt = m.material as THREE.Material; if (mt.transparent && !(m.customDepthMaterial)) { if ((mt as THREE.MeshBasicMaterial).opacity < 0.5) { hid.push(o); o.visible = false; return; } } swap.push([m, m.material]); m.material = m.customDepthMaterial || f.depthM; } });
    const bg = w.scene.background, fog = w.scene.fog, cc = new THREE.Color(); r.getClearColor(cc); const ca = r.getClearAlpha();
    w.scene.background = null; w.scene.fog = null; r.setClearColor(0xffffff, 1); r.setRenderTarget(f.depthRT); r.clear(); r.render(w.scene, cam); r.setRenderTarget(null); r.setClearColor(cc, ca);
    w.scene.background = bg; w.scene.fog = fog; for (const [m, mt] of swap) m.material = mt; for (const o of hid) o.visible = true;
    const u = f.dof.uniforms; u.tDepth.value = f.depthRT.texture; u.uNear.value = cam.near; u.uFar.value = cam.far; u.uFocus.value = Z3_FOCUS; u.uBoth.value = Z3_BOTH;
    f.pass.scene = w.scene; f.pass.camera = cam; f.grade.uniforms.uT.value = Math.round(P3_T.value * 30); f.grade.uniforms.uRed.value = Z3_HEAT * 0.3; f.composer.render();
  };
}
let Z3_FOCUS = 10, Z3_BOTH = 0, Z3_FOCUS_OVR = -1, Z3_HEAT = 0;   // Z3_HEAT: the fever's warm tint (0..1), set by a scene   // a scene can force the focus (and blur in front too) by setting Z3_FOCUS_OVR / Z3_BOTH in its pose

// =====================================================================
//  DEFENSAS: the world of "Cómo tu cuerpo combate virus y bacterias". Two places: Tico and Dota's room (outside, warm)
//  and the microscopic world inside Dota's finger (deep red, soft and blurry far away). The body's cast is 3D and
//  cartoon: bacteria (green capsules), viruses (purple spiky balls), the macrophage (a big white blob that swallows),
//  body cells (pink, see-through), the T cell (blue, with a helmet), the B cell (orange) and the antibodies (yellow Y).
// =====================================================================
const ZF = { tissue: '#c64a5e', deep: '#4a0c18', bac: '#7cc84a', vir: '#9152e0', varicela: '#ff5a6e', mac: '#f6f2ea', cell: '#ff9db0', nuc: '#c2486a', tcell: '#3f8cff', helmet: '#4f7a3a', bcell: '#ffad4a', ab: '#ffd23d', rbc: '#d8323f', skinCell: '#f3c3a8', mucus: '#b8e06a' };
// a simple cartoon face on a round body: two eyes (with lids), brows and a mouth that smiles (+), is flat (0) or frowns (-)
function z3Face(r: number, lid: string, o: { sep?: number; brow?: number; mouth?: number; grin?: number } = {}) {
  const { sep = 0.42, brow = 0, mouth = 1, grin = 0.5 } = o, g = new THREE.Group(), er = r * 0.26, dark = z3Gloss('#1d1410', 0.3);
  const eyes = [-1, 1].map((s) => { const e = z3Eye(er, lid); e.position.set(s * r * sep, r * 0.18, r * 0.86); g.add(e); return e; });
  const brows = [-1, 1].map((s) => { const b = z3Brow(er * 1.5, dark); b.position.set(s * r * sep, r * 0.18 + er * 1.45, r * 0.9); b.rotation.z = -s * brow; g.add(b); return b; });
  const mo = new THREE.Mesh(new THREE.TorusGeometry(r * 0.22 * (0.6 + grin), r * 0.045, 8, 24, Math.PI), dark); mo.position.set(0, -r * 0.22, r * 0.93); mo.rotation.z = mouth >= 0 ? Math.PI : 0; g.add(mo);
  const open = new THREE.Mesh(new THREE.SphereGeometry(r * 0.2, 20, 14), new THREE.MeshStandardMaterial({ color: '#4a1212', roughness: 0.6 })); open.position.set(0, -r * 0.3, r * 0.88); open.scale.set(1.2, 0.01, 0.4); g.add(open);
  return Object.assign(g, { eyes, brows, mo, open, set(lookX: number, lookY: number, lidC: number, openU = 0) { eyes.forEach((e) => e.pose(lookX, lookY, lidC)); open.scale.y = Math.max(0.01, openU); mo.visible = openU < 0.15; } });
}
// a bacterium: green capsule, darker spots, three whip tails, a mean grin. live(t, o): wiggles and swims; o.sweat shows drops, o.scared
function z3Bact(seed = 1, color = ZF.bac) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const mat = z3Gloss(color, 0.35), dk = z3Skin(new THREE.Color(color).multiplyScalar(0.7).getStyle()), r = p3Rnd(seed);
  const cap = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.5, 10, 24), mat); cap.rotation.z = Math.PI / 2; cap.castShadow = true; body.add(cap);
  for (let i = 0; i < 5; i++) { const a = r() * 6.28; body.add(z3Sph(0.05 + r() * 0.03, dk, [(r() - 0.5) * 0.7, Math.cos(a) * 0.25, Math.sin(a) * 0.25 - 0.02])); }
  const face = z3Face(0.28, color, { sep: 0.5, brow: 0.35, grin: 0.7 }); face.position.x = 0.12; body.add(face);
  const tails = [0, 1, 2].map(() => { const l = z3Limb(dk, 0.035, 0.012); body.add(l); return l; });
  const drops = [0, 1].map((i) => { const d = z3Sph(0.05, z3Gloss('#9fdcff', 0.1), [0.25 - i * 0.4, 0.32, 0.2], [0.8, 1.2, 0.8]); d.visible = false; body.add(d); return d; });
  return Object.assign(g, { body, face, live(t: number, o: { sweat?: boolean; scared?: number; speed?: number } = {}) {
    const sp = o.speed ?? 1, ph = seed * 1.7;
    body.scale.set(1 + 0.06 * Math.sin(t * 6 * sp + ph), 1 - 0.05 * Math.sin(t * 6 * sp + ph), 1); body.rotation.z = 0.12 * Math.sin(t * 3 * sp + ph);
    tails.forEach((l, i) => { const y = (i - 1) * 0.12, w = Math.sin(t * 10 * sp + i + ph); l.set(new THREE.Vector3(-0.5, y, 0), new THREE.Vector3(-0.72, y + 0.1 * w, 0.03), new THREE.Vector3(-0.95, y - 0.12 * w, 0)); });
    const sc = o.scared ?? 0; face.set(0.15 * Math.sin(t * 1.3 + ph), 0, 0.15 + 0.1 * Math.sin(t + ph) - 0.15 * sc, sc * 0.8); face.brows.forEach((b, i) => (b.rotation.z = (i ? -1 : 1) * (0.35 - 0.8 * sc)));
    drops.forEach((d, i) => { d.visible = !!o.sweat; const u = ((t * 1.2 + i * 0.5) % 1); d.position.y = 0.32 - u * 0.35; d.scale.setScalar(1 - u * 0.4); });
  } });
}
// a virus: a purple ball covered in knobbed spikes, a sneaky half-closed look and a wide grin. live(t, laugh)
function z3Virus(color = ZF.vir, seed = 2) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const mat = z3Gloss(color, 0.3), knob = z3Gloss(new THREE.Color(color).lerp(new THREE.Color('#ff6fa8'), 0.6).getStyle(), 0.25), stalk = z3Skin(new THREE.Color(color).multiplyScalar(0.75).getStyle());
  body.add(z3Sph(0.3, mat, [0, 0, 0]));
  const n = 16; for (let i = 0; i < n; i++) { const y = 1 - (i + 0.5) / n * 2, rr = Math.sqrt(1 - y * y), a = i * 2.39996, d = new THREE.Vector3(Math.cos(a) * rr, y, Math.sin(a) * rr); if (d.z > 0.55 && Math.abs(d.y) < 0.6) continue; body.add(p3Rod([d.x * 0.28, d.y * 0.28, d.z * 0.28], [d.x * 0.42, d.y * 0.42, d.z * 0.42], 0.025, stalk)); body.add(z3Sph(0.055, knob, [d.x * 0.44, d.y * 0.44, d.z * 0.44])); }
  const face = z3Face(0.3, color, { sep: 0.42, brow: -0.25, grin: 0.9 }); body.add(face);
  return Object.assign(g, { body, face, live(t: number, laugh = 0) {
    body.rotation.y = 0.25 * Math.sin(t * 0.8 + seed); body.rotation.z = 0.1 * Math.sin(t * 1.1 + seed);
    const l = laugh * Math.abs(Math.sin(t * 14)); body.scale.set(1 + 0.05 * l, 1 - 0.06 * l + 0.03 * Math.sin(t * 3 + seed), 1); face.set(0.1 * Math.sin(t + seed), -0.05, 0.42 + 0.2 * laugh, laugh * (0.4 + 0.4 * l));
  } });
}
// the macrophage: a big soft white blob with feelers, kind eyes; .live(t, open) opens its mouth wide to swallow, .gulp() bulges
function z3Macro() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const mat = new THREE.MeshPhysicalMaterial({ color: ZF.mac, roughness: 0.45, sheen: 1, sheenColor: new THREE.Color('#ffd9e6'), clearcoat: 0.6, clearcoatRoughness: 0.3 });
  const blob = new THREE.Mesh(p3Blob((x, y, z) => { const n = p3Fbm3(x * 1.8, y * 1.8, z * 1.8) * 0.18; return [x * (0.95 + n), y * (0.85 + n), z * (0.9 + n)]; }, undefined, 56, 40), mat); blob.castShadow = true; body.add(blob);
  const feet = [[-0.95, -0.35, 0.1], [0.98, -0.25, -0.1], [-0.6, 0.62, -0.2], [0.55, -0.78, 0.25]].map(([x, y, z], i) => { const f = z3Sph(0.28 - i * 0.03, mat, [x, y, z], [1.3, 0.8, 0.9]); body.add(f); return f; });
  for (let i = 0; i < 6; i++) body.add(z3Sph(0.07, z3Skin('#e9c9d9'), [Math.cos(i) * 0.5, Math.sin(i * 2.1) * 0.4 + 0.1, -0.45]));
  const face = z3Face(0.85, ZF.mac, { sep: 0.34, brow: -0.1, grin: 0.6 }); face.position.z = 0.2; body.add(face);
  return Object.assign(g, { body, face, live(t: number, open = 0, gulp = 0) {
    const wb = Math.sin(t * 2.2); body.scale.set(1 + 0.04 * wb + 0.12 * gulp, 1 - 0.04 * wb + 0.06 * gulp, 1 + 0.08 * gulp);
    feet.forEach((f, i) => { f.position.x += 0; f.scale.set(1.3 + 0.2 * Math.sin(t * 2.6 + i * 1.7), 0.8, 0.9); });
    face.set(0.12 * Math.sin(t * 0.9), 0.05, open > 0.3 ? 0.05 : 0.12, open * 1.6); face.open.scale.x = 1.2 + open * 0.6;
  } });
}
// a body cell: see-through pink skin, a nucleus and a face; .live(t, o): o.copies = how many viruses inside (0..12), o.flag 0..1, o.pop 0..1 (bursts), o.scared
function z3Cell(seed = 3) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const r = p3Rnd(seed);
  const memb = new THREE.Mesh(new THREE.SphereGeometry(0.8, 48, 32), new THREE.MeshPhysicalMaterial({ color: ZF.cell, roughness: 0.35, transparent: true, opacity: 0.45, clearcoat: 1, clearcoatRoughness: 0.2, depthWrite: false })); body.add(memb);
  const nuc = z3Sph(0.3, z3Skin(ZF.nuc, 0.6), [-0.15, -0.1, -0.2]); body.add(nuc);
  const face = z3Face(0.8, ZF.cell, { sep: 0.36, grin: 0.4 }); body.add(face);
  const copies = [...Array(12)].map((_, i) => { const v = z3Virus(ZF.vir, i); v.scale.setScalar(0.38); v.position.set((r() - 0.5) * 0.9, (r() - 0.5) * 0.8, (r() - 0.5) * 0.6 - 0.1); v.visible = false; body.add(v); return v; });
  const flag = new THREE.Group(); flag.position.set(0.1, 0.72, 0.1); flag.add(p3Rod([0, 0, 0], [0, 0.9, 0], 0.025, z3Mat('#c9c3b6', 0.4)));
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.36, 10, 1), new THREE.MeshPhysicalMaterial({ color: '#e8303a', roughness: 0.6, side: THREE.DoubleSide, sheen: 0.5 })); cloth.position.set(0.29, 0.72, 0); flag.add(cloth);
  const piece = z3Sph(0.07, z3Gloss(ZF.vir, 0.3), [0.29, 0.72, 0.03]); flag.add(piece); flag.scale.setScalar(0.01); body.add(flag);
  const cpos = cloth.geometry.attributes.position, cx0 = Float32Array.from(cpos.array as Float32Array);
  const bits = [...Array(10)].map((_, i) => { const b = z3Sph(0.16, z3Skin('#e86a88', 0.6), [0, 0, 0], [1, 0.6, 1]); b.visible = false; g.add(b); return { b, d: new THREE.Vector3(Math.cos(i * 0.63) * (0.6 + r()), Math.sin(i * 1.7) * 0.8 + 0.3, Math.sin(i * 0.63) * 0.6) }; });
  return Object.assign(g, { body, face, flag, live(t: number, o: { copies?: number; flag?: number; pop?: number; scared?: number } = {}) {
    const pop = o.pop ?? 0, n = o.copies ?? 0, fl = o.flag ?? 0, sc = o.scared ?? 0;
    body.visible = pop < 0.15; const sw = 1 + 0.03 * Math.sin(t * 2 + seed) + 0.04 * Math.min(1, n / 12) * Math.sin(t * 9); body.scale.setScalar(sw * (1 + pop * 0.6));
    copies.forEach((v, i) => { v.visible = i < n; if (v.visible) { v.live(t, 0.3); v.position.y += 0.002 * Math.sin(t * 5 + i); } });
    face.set(0.1 * Math.sin(t * 0.7 + seed), 0, 0.15 + 0.25 * sc, sc * 0.6); face.brows.forEach((b, i) => (b.rotation.z = (i ? 1 : -1) * 0.35 * sc));
    flag.scale.setScalar(Math.max(0.01, fl)); for (let i = 0; i < cpos.count; i++) { const x = cx0[i * 3]; cpos.setZ(i, 0.06 * Math.sin(t * 7 - x * 9) * (x + 0.28)); } cpos.needsUpdate = true;
    bits.forEach(({ b, d }) => { b.visible = pop >= 0.15 && pop < 1; b.position.copy(d).multiplyScalar(pop * 1.6); b.position.y -= pop * pop * 0.8; b.scale.setScalar(1 - pop * 0.5); });
  } });
}
// the T cell: a blue blob with a helmet, determined eyes and two little fists; .live(t, punch 0..1)
function z3TCell() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const mat = z3Gloss(ZF.tcell, 0.35), hel = z3Mat(ZF.helmet, 0.55);
  body.add(z3Sph(0.55, mat, [0, 0, 0], [1, 0.95, 0.95]));
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.6, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2.1), hel); helmet.position.y = 0.12; helmet.castShadow = true; body.add(helmet);
  const brim = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.05, 10, 40), hel); brim.rotation.x = Math.PI / 2; brim.position.y = 0.14; body.add(brim);
  body.add(z3Sph(0.07, z3Gloss('#ffd23d', 0.2), [0, 0.5, 0.36]));
  const face = z3Face(0.55, ZF.tcell, { sep: 0.38, brow: 0.45, grin: 0.4, mouth: 0 }); face.position.y = -0.06; body.add(face);
  const fists = [-1, 1].map((s) => { const f = z3Sph(0.16, mat, [s * 0.62, -0.22, 0.2]); body.add(f); return f; });
  return Object.assign(g, { body, face, live(t: number, punch = 0) {
    body.position.y = 0.04 * Math.abs(Math.sin(t * 5)); face.set(0, 0, 0.32, 0);
    fists.forEach((f, i) => { const p = i ? punch : punch * 0.4; f.position.set((i ? 0.62 : -0.62) - (i ? 0 : 0) , -0.22 + 0.04 * Math.sin(t * 6 + i), 0.2 + p * 0.7); });
  } });
}
// the B cell: an orange blob with a little nozzle on top that fires antibodies
function z3BCell() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const mat = z3Gloss(ZF.bcell, 0.35);
  body.add(z3Sph(0.55, mat, [0, 0, 0])); const noz = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.25, 20), z3Mat('#c9c3b6', 0.35)); noz.position.y = 0.6; body.add(noz);
  const face = z3Face(0.55, ZF.bcell, { sep: 0.38, grin: 0.6 }); body.add(face);
  return Object.assign(g, { body, face, live(t: number, fire = 0) { body.scale.set(1 + 0.08 * fire, 1 - 0.1 * fire, 1); face.set(0.1 * Math.sin(t), 0.2, 0.15, 0.3 * fire); } });
}
// an antibody: a yellow Y with red pincer tips
function z3Y() {
  const m = z3Gloss(ZF.ab, 0.3), tip = z3Gloss('#ff5a5f', 0.25), g = new THREE.Group();
  g.add(p3Rod([0, -0.32, 0], [0, 0, 0], 0.06, m), p3Rod([0, 0, 0], [-0.22, 0.26, 0], 0.06, m), p3Rod([0, 0, 0], [0.22, 0.26, 0], 0.06, m), z3Sph(0.075, m, [0, 0, 0]));
  for (const s of [-1, 1]) { g.add(z3Sph(0.07, tip, [s * 0.25, 0.3, 0])); }
  return g;
}
// a red blood cell: a squashed disc with a dimple
function z3RBC() { const m = z3Gloss(ZF.rbc, 0.35), g = new THREE.Group(); const t = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.12, 16, 32), m); g.add(t); const c = z3Sph(0.2, m, [0, 0, 0], [1, 1, 0.35]); g.add(c); t.castShadow = true; return g; }
// the skin as a wall of cells (two layers of rounded bricks) with a mucus layer on top; .crack(u) opens a gap in the middle
function z3SkinWall(w = 9) {
  const g = new THREE.Group(), L = new THREE.Group(), R = new THREE.Group(); g.add(L, R); const m = z3Skin(ZF.skinCell, 0.7), nuc = z3Skin('#d98a7a', 0.7), r = p3Rnd(5);
  for (let row = 0; row < 4; row++) for (let i = 0; i < 14; i++) {
    const x = -w / 2 + i * 0.68 + (row % 2) * 0.34, y = -row * 0.44; if (x > w / 2) continue; const b = z3BoxM(0.64, 0.4, 0.9, m, [x, y, 0]); (x < 0 ? L : R).add(b);
    (x < 0 ? L : R).add(z3Sph(0.07, nuc, [x + (r() - 0.5) * 0.2, y, 0.44]));
  }
  const muc = new THREE.MeshPhysicalMaterial({ color: ZF.mucus, roughness: 0.15, transparent: true, opacity: 0.7, clearcoat: 1 });
  for (const s of [-1, 1]) { const mu = new THREE.Mesh(p3Blob((x, y, z) => [x * w * 0.25, y * 0.1 + 0.02 * Math.sin(x * 9), z * 0.5]), muc); mu.position.set(s * w * 0.25, 0.24, 0); (s < 0 ? L : R).add(mu); }
  return Object.assign(g, { crack(u: number) { L.position.x = -0.5 * u; R.position.x = 0.5 * u; L.rotation.z = 0.06 * u; R.rotation.z = -0.06 * u; } });
}
// an alarm siren on top of a cell: a red dome that glows and a turning beam; .on(t, u)
function z3Siren() {
  const g = new THREE.Group(), dm = new THREE.MeshPhysicalMaterial({ color: '#ff2a2a', emissive: '#ff2a2a', emissiveIntensity: 0, roughness: 0.2, clearcoat: 1, transparent: true, opacity: 0.92 });
  g.add(z3BoxM(0.5, 0.12, 0.5, z3Mat('#c9c3b6', 0.4), [0, 0, 0])); const dome = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), dm); dome.position.y = 0.05; g.add(dome);
  const beam = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.2, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#ff5050', transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false })); beam.rotation.z = Math.PI / 2; beam.position.set(1.1, 0.15, 0); const piv = new THREE.Group(); piv.add(beam); g.add(piv);
  const light = new THREE.PointLight('#ff3030', 0, 6); light.position.y = 0.3; g.add(light);
  return Object.assign(g, { on(t: number, u: number) { const p = 0.5 + 0.5 * Math.sin(t * 16); dm.emissiveIntensity = u * (0.6 + 1.2 * p); piv.rotation.y = t * 9; piv.visible = u > 0.05; light.intensity = u * 6 * p; } });
}
// a blood vessel seen from the side: a see-through red tube with red cells flowing; .live(t, wide 0..1)
function z3Vessel(len = 14) {
  const g = new THREE.Group(), tube = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, len, 48, 1, true), new THREE.MeshPhysicalMaterial({ color: '#ff7b8a', roughness: 0.3, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false, clearcoat: 1 }));
  tube.rotation.z = Math.PI / 2; g.add(tube); const r = p3Rnd(9);
  const cells = [...Array(26)].map(() => { const c = z3RBC(); g.add(c); return { c, x0: r() * len, y: (r() - 0.5) * 1.2, z: (r() - 0.5) * 1.2, s: 0.8 + r() * 0.4, sp: r() }; });
  return Object.assign(g, { live(t: number, wide = 0) {
    const R = 0.75 + 0.55 * wide; tube.scale.set(R, 1, R); const speed = 1.2 + 3 * wide;
    cells.forEach(({ c, x0, y, z, s, sp }, i) => { c.position.set(((x0 + t * speed * (0.8 + sp * 0.4)) % len) - len / 2, y * R, z * R); c.rotation.set(t * 2 + i, t + i, 0); c.scale.setScalar(s * 0.9); });
  } });
}
// a padlock with a "?" on its face; .open(u) lifts and turns the shackle
function z3Lock() {
  const g = new THREE.Group(), gold = z3Gloss('#f2b632', 0.25), steel = z3Gloss('#c9d3e0', 0.15);
  const face = z3Paint(256, 256, (c) => { c.fillStyle = '#f2b632'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#14161d'; c.font = '900 190px Inter, Arial'; c.textAlign = 'center'; c.fillText('?', 128, 196); });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.1, 0.5), [gold, gold, gold, gold, new THREE.MeshPhysicalMaterial({ map: face, roughness: 0.3, clearcoat: 1 }), gold] as unknown as THREE.Material); body.castShadow = true; g.add(body);
  const sh = new THREE.Group(); sh.position.set(-0.38, 0.55, 0); const arc = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.09, 16, 32, Math.PI), steel); arc.position.set(0.38, 0.3, 0); sh.add(arc, p3Rod([0, 0, 0], [0, 0.3, 0], 0.09, steel), p3Rod([0.76, 0, 0], [0.76, 0.3, 0], 0.09, steel)); g.add(sh);
  return Object.assign(g, { open(u: number) { sh.position.y = 0.55 + 0.3 * u; sh.rotation.y = -1.2 * Math.max(0, u - 0.4) / 0.6; } });
}
// a photo card of a germ (bacteria, virus or chickenpox), drawn flat
function z3Photo(kind: 'bac' | 'vir' | 'var') {
  const tex = z3Paint(256, 300, (c) => {
    c.fillStyle = '#fbf8f0'; c.fillRect(0, 0, 256, 300); c.fillStyle = kind === 'bac' ? '#d8f2c8' : kind === 'vir' ? '#e6dcfa' : '#ffe0e4'; c.fillRect(18, 18, 220, 220);
    c.lineWidth = 8; c.strokeStyle = '#2b1a14'; const col = kind === 'bac' ? ZF.bac : kind === 'vir' ? ZF.vir : ZF.varicela;
    if (kind === 'bac') { c.fillStyle = col; c.beginPath(); c.roundRect(48, 98, 160, 70, 35); c.fill(); c.stroke(); }
    else { for (let i = 0; i < 10; i++) { const a = i * 0.628; c.beginPath(); c.moveTo(128 + Math.cos(a) * 50, 128 + Math.sin(a) * 50); c.lineTo(128 + Math.cos(a) * 84, 128 + Math.sin(a) * 84); c.stroke(); c.fillStyle = '#ff7fb0'; c.beginPath(); c.arc(128 + Math.cos(a) * 86, 128 + Math.sin(a) * 86, 10, 0, 7); c.fill(); c.stroke(); } c.fillStyle = col; c.beginPath(); c.arc(128, 128, 56, 0, 7); c.fill(); c.stroke(); }
    c.fillStyle = '#fff'; for (const x of [108, 148]) { c.beginPath(); c.arc(x, 124, 12, 0, 7); c.fill(); } c.fillStyle = '#14161d'; for (const x of [110, 150]) { c.beginPath(); c.arc(x, 126, 6, 0, 7); c.fill(); }
    c.fillStyle = '#2b1a14'; c.font = '700 30px Inter, Arial'; c.textAlign = 'center'; c.fillText(kind === 'bac' ? 'BACTERIA' : kind === 'vir' ? 'VIRUS' : 'VARICELA', 128, 280);
  });
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.05, 0.03), [z3Mat('#fbf8f0'), z3Mat('#fbf8f0'), z3Mat('#fbf8f0'), z3Mat('#fbf8f0'), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }), z3Mat('#fbf8f0')] as unknown as THREE.Material); m.castShadow = true; return m;
}
// a photo album: two covers and three photos inside; .open(u)
function z3Album() {
  const g = new THREE.Group(), cov = z3Mat('#7a3fb0', 0.5), page = z3Mat('#fbf8f0', 0.8);
  g.add(z3BoxM(2.0, 1.4, 0.08, cov, [0, 0, -0.06])); g.add(z3BoxM(1.9, 1.3, 0.05, page, [0, 0, 0]));
  const photos = (['bac', 'vir', 'var'] as const).map((k, i) => { const p = z3Photo(k); p.scale.setScalar(0.62); p.position.set(-0.6 + i * 0.6, 0.02, 0.05); p.rotation.z = (i - 1) * 0.08; g.add(p); return p; });
  const lid = new THREE.Group(); lid.position.set(-1.0, 0, 0.06); const lc = z3BoxM(2.0, 1.4, 0.08, cov, [1.0, 0, 0]); lid.add(lc); g.add(lid);
  return Object.assign(g, { photos, open(u: number) { lid.rotation.y = -Math.PI * 0.95 * u; } });
}
// a big thermometer: glass tube, red bulb and a red column that rises; .level(u)
function z3Thermo() {
  const g = new THREE.Group(), glass = new THREE.MeshPhysicalMaterial({ color: '#eaf6ff', roughness: 0.05, transparent: true, opacity: 0.45, clearcoat: 1, depthWrite: false }), red = z3Gloss('#e8303a', 0.2);
  const tube = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 2.6, 10, 24), glass); tube.position.y = 1.5; g.add(tube); g.add(z3Sph(0.36, red, [0, 0, 0]));
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1, 20), red); col.position.y = 0.5; const cg = new THREE.Group(); cg.add(col); g.add(cg);
  for (let i = 0; i < 9; i++) g.add(z3BoxM(i % 2 ? 0.12 : 0.22, 0.03, 0.03, z3Mat('#2b1a14'), [0.3, 0.5 + i * 0.3, 0]));
  return Object.assign(g, { level(u: number) { cg.scale.y = 0.3 + 2.4 * u; } });
}
// a vaccine: a syringe with blue liquid and a little photo flag
function z3Syringe() {
  const g = new THREE.Group(), glass = new THREE.MeshPhysicalMaterial({ color: '#eaf6ff', roughness: 0.05, transparent: true, opacity: 0.5, clearcoat: 1, depthWrite: false });
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.6, 32, 1, true), glass); g.add(barrel); g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.0, 24), z3Gloss('#4cc4ff', 0.2)));
  g.add(z3BoxM(0.7, 0.08, 0.3, z3Mat('#c9d3e0', 0.3), [0, 0.8, 0])); g.add(p3Rod([0, 0.8, 0], [0, 1.3, 0], 0.05, z3Mat('#c9d3e0', 0.3))); g.add(z3BoxM(0.36, 0.06, 0.36, z3Mat('#c9d3e0', 0.3), [0, 1.32, 0]));
  g.add(p3Rod([0, -0.8, 0], [0, -1.35, 0], 0.02, z3Gloss('#e8eef5', 0.1))); const ph = z3Photo('var'); ph.scale.setScalar(0.7); ph.position.set(0.75, 0.2, 0); g.add(ph);
  return Object.assign(g, { photo: ph });
}
// an antibiotic pill: red and white capsule with angry eyes
function z3Pill() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const red = z3Gloss('#e8303a', 0.2), white = z3Gloss('#f6f2ea', 0.2);
  const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.45, 10, 24), red); a.rotation.z = Math.PI / 2; a.position.x = 0.22; const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.45, 10, 24), white); b.rotation.z = Math.PI / 2; b.position.x = -0.22;
  const clipA = new THREE.Group(); clipA.add(a); body.add(clipA, b); a.scale.set(1.01, 1.01, 1.01);
  const face = z3Face(0.3, '#e8303a', { sep: 0.5, brow: 0.5, grin: 0.3, mouth: 0 }); face.position.x = 0.32; body.add(face);
  return Object.assign(g, { body, face, live(t: number) { body.rotation.z = 0.15 * Math.sin(t * 8); face.set(0.3, 0, 0.3, 0); } });
}
// a prescription card ("RECETA")
function z3Rx() {
  const tex = z3Paint(400, 520, (c) => { c.fillStyle = '#fbf8f0'; c.fillRect(0, 0, 400, 520); c.fillStyle = '#2f7ad9'; c.fillRect(0, 0, 400, 90); c.fillStyle = '#fff'; c.font = '900 52px Inter, Arial'; c.textAlign = 'center'; c.fillText('RECETA', 200, 64);
    c.fillStyle = '#2f7ad9'; c.fillRect(40, 120, 70, 22); c.fillRect(64, 96, 22, 70); c.strokeStyle = '#9aa3b2'; c.lineWidth = 6; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(140, 130 + i * 50); c.lineTo(360, 130 + i * 50); c.stroke(); }
    c.strokeStyle = '#14161d'; c.lineWidth = 5; c.beginPath(); c.moveTo(200, 470); c.bezierCurveTo(240, 420, 260, 500, 300, 450); c.bezierCurveTo(320, 430, 330, 480, 360, 455); c.stroke(); });
  const m = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.08, 0.03), [z3Mat('#fbf8f0'), z3Mat('#fbf8f0'), z3Mat('#fbf8f0'), z3Mat('#fbf8f0'), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }), z3Mat('#fbf8f0')] as unknown as THREE.Material); m.castShadow = true; return m;
}
// a sheet of paper
const z3Paper = () => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.01), z3Mat('#fbfbf7', 0.7)); m.castShadow = true; return m; };
// a bed (for the fever): frame, mattress, pillow and blanket
function z3Bed() { const wood = z3Mat('#a8703f', 0.6); return z3Grp([0, 0, 0], z3BoxM(3.2, 0.5, 1.6, wood, [0, 0.25, 0]), z3BoxM(0.18, 1.3, 1.6, wood, [-1.6, 0.65, 0]), z3BoxM(3.0, 0.3, 1.5, z3Mat('#f6f2ea', 0.8), [0, 0.65, 0]), z3BoxM(0.8, 0.22, 1.0, z3Mat('#ffffff', 0.8), [-1.05, 0.9, 0]), z3BoxM(2.0, 0.16, 1.56, z3Mat('#4f8de0', 0.75), [0.45, 0.86, 0])); }

// ---------------- the two places
// the room: wooden floor, a pastel wall with a window (sky outside) and a framed picture, warm light from the window
function z3Room(w: World) {
  w.add(new THREE.HemisphereLight('#fff1dc', '#8a6a52', 0.9));
  const sun = new THREE.DirectionalLight('#ffe4bf', 1.7); sun.position.set(-6, 9, 7); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 }); w.add(sun);
  const planks = z3Paint(512, 512, (c) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#c48a58' : '#b97d4c'; c.fillRect(0, i * 64, 512, 64); c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(0, i * 64, 512, 3); c.fillRect((i * 173) % 512, i * 64, 3, 64); } });
  planks.wrapS = planks.wrapT = THREE.RepeatWrapping; planks.repeat.set(4, 4);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ map: planks, roughness: 0.7 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; w.add(floor);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), z3Mat('#bfe0d4', 0.9)); wall.position.set(0, 7, -4); wall.receiveShadow = true; w.add(wall);
  w.add(z3BoxM(30, 0.3, 0.12, z3Mat('#f6f2ea', 0.6), [0, 0.15, -3.95]));
  const sky = z3Paint(256, 256, (c) => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#8ec9f0'); g.addColorStop(1, '#dff1ff'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); c.fillStyle = '#fff'; for (const [x, y, r] of [[60, 70, 26], [90, 64, 30], [120, 74, 22], [190, 150, 20], [210, 146, 24]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } c.fillStyle = '#7cc84a'; c.fillRect(0, 210, 256, 46); });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.2), new THREE.MeshBasicMaterial({ map: sky, toneMapped: false })); win.position.set(-2.6, 3.6, -3.97); w.add(win);
  const fr = z3Mat('#f6f2ea', 0.5); w.add(z3Grp([0, 0, 0], z3BoxM(2.9, 0.16, 0.16, fr, [-2.6, 4.75, -3.9]), z3BoxM(2.9, 0.16, 0.16, fr, [-2.6, 2.45, -3.9]), z3BoxM(0.16, 2.4, 0.16, fr, [-4.05, 3.6, -3.9]), z3BoxM(0.16, 2.4, 0.16, fr, [-1.15, 3.6, -3.9]), z3BoxM(2.9, 0.08, 0.1, fr, [-2.6, 3.6, -3.9]), z3BoxM(0.08, 2.4, 0.1, fr, [-2.6, 3.6, -3.9])));
  const pic = z3Paint(256, 200, (c) => { c.fillStyle = '#ffd23d'; c.fillRect(0, 0, 256, 200); c.fillStyle = '#ff6a3d'; c.beginPath(); c.arc(128, 100, 60, 0, 7); c.fill(); });
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 0.06), [fr, fr, fr, fr, new THREE.MeshStandardMaterial({ map: pic }), fr] as unknown as THREE.Material); frame.position.set(2.6, 4.0, -3.95); w.add(frame);
  const shaft = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 8), new THREE.MeshBasicMaterial({ color: '#fff3d6', transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide })); shaft.position.set(-1.6, 2.3, -1.4); shaft.rotation.set(-0.9, 0.5, 0.35); w.add(shaft);
  return { pose(_t: number) { /* the light shaft and dust (the wrapper) do the ambient motion */ } };
}
// the microscopic world inside the body: a deep red space, soft cells floating far away, a bumpy tissue floor; hot = 0..1 for the fever (oranger, hazier)
function z3Micro(w: World, floorY = -2.2) {
  const hemi = new THREE.HemisphereLight('#ffd0d8', '#5a0f1f', 1.0); w.add(hemi);
  const key = new THREE.DirectionalLight('#fff0e6', 1.4); key.position.set(4, 9, 7); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 }); w.add(key);
  const rim = new THREE.DirectionalLight('#ff8fb0', 0.8); rim.position.set(-6, 3, -6); w.add(rim);
  w.scene.fog = new THREE.Fog('#5a1426', 12, 42);
  const back = new THREE.Mesh(new THREE.SphereGeometry(60, 32, 16), new THREE.MeshBasicMaterial({ map: z3Paint(64, 256, (c) => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#2a0610'); g.addColorStop(0.5, '#7a1c34'); g.addColorStop(1, '#3a0a16'); c.fillStyle = g; c.fillRect(0, 0, 64, 256); }), side: THREE.BackSide, fog: false, toneMapped: false })); w.add(back);
  const floorM = z3Skin('#b23a54', 0.7), floor = new THREE.Group(), r = p3Rnd(11);
  for (let i = 0; i < 120; i++) { const b = z3Sph(0.6 + r() * 0.5, floorM, [(r() - 0.5) * 30, floorY - 0.3, -r() * 26 + 6], [1.3, 0.45, 1.1]); b.castShadow = false; floor.add(b); } w.add(floor);
  const flt = new THREE.MeshPhysicalMaterial({ color: '#ff8fa8', roughness: 0.5, transparent: true, opacity: 0.55, depthWrite: false });
  const far = [...Array(22)].map(() => { const s = z3Sph(0.5 + r() * 1.2, flt, [(r() - 0.5) * 34, floorY + 1 + r() * 9, -8 - r() * 18]); s.castShadow = false; w.add(s); return { s, x0: s.position.x, y0: s.position.y, ph: r() * 6 }; });
  return { pose(t: number, hot = 0) {
    far.forEach(({ s, x0, y0, ph }) => { s.position.x = x0 + Math.sin(t * 0.15 + ph) * 1.5; s.position.y = y0 + Math.sin(t * 0.3 + ph) * 0.6; });
    (w.scene.fog as THREE.Fog).color.set('#5a1426').lerp(new THREE.Color('#c8501a'), hot); back.material.color.set('#ffffff').lerp(new THREE.Color('#ffb070'), hot); hemi.color.set('#ffd0d8').lerp(new THREE.Color('#ffc080'), hot); key.color.set('#fff0e6').lerp(new THREE.Color('#ffb060'), hot);
  } };
}

// =====================================================================
//  PRIMOS: "¿Venimos del chango?". The extra cast is drawn in 2D like Tico and Dota (paper cut-outs that face the camera):
//  "tú" (a kid in a red hoodie), your cousin (blue striped sweater), the grandpa (bald, glasses), the chimp, the gorilla,
//  the common ancestor (a purple ape that is neither) and Darwin (bald, white beard, black suit, a green book).
//  The things are 3D: the evolution stairs, arrows and crosses, the family-tree frame, the two branches, the DNA helix,
//  letter tiles, chromosomes with yellow caps, a shoelace, a magnifier, the magazine, the desert and the skull.
// =====================================================================
type Z3FigKind = 'tu' | 'primo' | 'abuelito' | 'darwin' | 'chimp' | 'gorila' | 'abuelo' | 'caveman';
const Z3_FS: Record<Z3FigKind, { skin: string; top: string; pants?: string; hair?: string; ape?: boolean; fur?: string; face?: string; scale: number }> = {
  tu: { skin: '#c98d5e', top: '#ff4b2b', pants: '#2f3e66', hair: '#1d1410', scale: 1 },
  caveman: { skin: '#d49a6a', top: '#c8843a', pants: '#a8642a', hair: '#3a2416', scale: 1 },
  primo: { skin: '#b97a4f', top: '#3a5bd9', pants: '#4a4f5e', hair: '#4a2e1e', scale: 1 },
  abuelito: { skin: '#f0c9a8', top: '#8a7a68', pants: '#3d3d48', scale: 1.05 },
  darwin: { skin: '#f0c9a8', top: '#1f2230', pants: '#1f2230', scale: 1.12 },
  chimp: { skin: '#d9a77a', top: '#4a2e1e', ape: true, fur: '#4a2e1e', face: '#d9a77a', scale: 0.95 },
  gorila: { skin: '#5a5a66', top: '#2c2c34', ape: true, fur: '#2c2c34', face: '#5a5a66', scale: 1.2 },
  abuelo: { skin: '#b9b0ff', top: '#6a5fd0', ape: true, fur: '#6a5fd0', face: '#c9c2ff', scale: 1.0 },
};
const Z3F_X0 = -280, Z3F_Y0 = -700, Z3F_W = 560, Z3F_H = 740, Z3F_PX = 1.4;
type Z3FigO = { arms?: 'down' | 'up' | 'wave' | 'book' | 'hold' | 'shrug'; look?: number; mood?: 'ok' | 'happy' | 'uneasy' | 'shock'; alpha?: number; talk?: boolean; portrait?: boolean };
function z3Fig(kind: Z3FigKind) {
  const F = Z3_FS[kind], O = Z3_O, g = new THREE.Group(), ape = !!F.ape;
  const cv = document.createElement('canvas'); cv.width = Z3F_W * Z3F_PX; cv.height = Z3F_H * Z3F_PX; const c = cv.getContext('2d')!;
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.04, toneMapped: false, side: THREE.DoubleSide, fog: false });
  const card = new THREE.Mesh(new THREE.PlaneGeometry(Z3F_W * Z3_U, Z3F_H * Z3_U), mat); card.position.y = -(Z3F_Y0 + Z3F_H / 2) * Z3_U; card.castShadow = true;
  card.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5, side: THREE.DoubleSide });
  const pivot = new THREE.Group(); g.add(pivot); pivot.add(card); Z3_SPRITES.push({ mesh: card, g: pivot }); g.scale.setScalar(F.scale);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.45, 32), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.2, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.012; shadow.scale.y = 0.5; g.add(shadow);
  const E = (x: number, y: number, rx: number, ry = rx, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); return p; };
  const fs = (p: Path2D, fill: string | null, lw = 8) => { if (fill) { c.fillStyle = fill; c.fill(p); } if (lw) { c.lineWidth = lw; c.strokeStyle = O; c.stroke(p); } };
  const noodle = (ax: number, ay: number, bx: number, by: number, w: number, col: string, bend = 0) => { const p = new Path2D(); p.moveTo(ax, ay); p.quadraticCurveTo((ax + bx) / 2 + bend, (ay + by) / 2, bx, by); c.lineCap = 'round'; c.lineWidth = w + 15; c.strokeStyle = O; c.stroke(p); c.lineWidth = w; c.strokeStyle = col; c.stroke(p); };
  const draw = (t: number, o: Z3FigO) => {
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height); c.setTransform(Z3F_PX, 0, 0, Z3F_PX, -Z3F_X0 * Z3F_PX, -Z3F_Y0 * Z3F_PX); c.lineJoin = 'round';
    const br = Math.sin(t * 2.4 + kind.length), bob = 4 * br, sw = 6 * Math.sin(t * 1.3 + kind.length), look = o.look ?? 0, mood = o.mood ?? 'ok';
    const hipY = ape ? -160 : -175, shY = ape ? -360 : -370, headY = ape ? -470 : -485, R = ape ? 92 : 92, bw = ape ? 250 : 190;
    const pt = !!o.portrait;
    // legs and feet
    if (!pt) for (const s of [-1, 1]) { noodle(s * 34, hipY, s * (ape ? 52 : 40), -18, ape ? 46 : 40, ape ? F.fur! : F.pants!, s * 10); fs(E(s * (ape ? 60 : 46), -14, ape ? 46 : 40, 18), ape ? F.face! : '#f6f2ea', 7); }
    // body
    const top = shY - 20 + bob, bot = hipY + 20; const body = new Path2D(); body.roundRect(-bw / 2 + sw * 0.3, top, bw, bot - top, ape ? 90 : 60); if (!pt) fs(body, F.top);
    if (!pt && kind === 'primo') { c.save(); c.clip(body); c.fillStyle = '#9fb4ff'; for (let y = top + 30; y < bot; y += 38) c.fillRect(-200, y, 400, 14); c.restore(); c.lineWidth = 8; c.strokeStyle = O; c.stroke(body); }
    if (!pt && kind === 'tu') { c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(-50, top + 110, 100, 40); c.lineWidth = 5; c.strokeStyle = O; c.beginPath(); c.moveTo(-14, top + 20); c.lineTo(-18, top + 80); c.moveTo(14, top + 20); c.lineTo(18, top + 80); c.stroke(); }
    if (!pt && kind === 'darwin') { c.fillStyle = '#f6f2ea'; c.beginPath(); c.moveTo(-28, top); c.lineTo(0, top + 90); c.lineTo(28, top); c.fill(); c.lineWidth = 6; c.strokeStyle = O; c.beginPath(); c.moveTo(-60, top); c.lineTo(0, top + 140); c.lineTo(60, top); c.stroke(); }
    if (!pt && ape) { c.fillStyle = F.face!; c.fill(E(sw * 0.3, top + 120, bw * 0.28, 70)); }
    // arms
    const A = o.arms ?? 'down', armW = ape ? 40 : 34, hc = ape ? F.face! : F.skin;
    const tg: Record<string, [number, number][]> = { down: [[-bw / 2 - 30, ape ? -120 : -200], [bw / 2 + 30, ape ? -120 : -200]], up: [[-160, -600], [160, -600]], wave: [[-bw / 2 - 30, -200], [180, -560 + 20 * Math.sin(t * 14)]], book: [[-bw / 2 - 30, -200], [110, -300]], hold: [[-90, -280], [90, -280]], shrug: [[-190, -330], [190, -330]] };
    const hands = tg[A] || tg.down;
    if (!pt) hands.forEach(([hx, hy], i) => { const s = i ? 1 : -1; noodle(s * (bw / 2 - 18) + sw * 0.3, shY + bob, hx, hy + bob * 0.5, armW, ape ? F.fur! : F.top, s * 30); fs(E(hx, hy + bob * 0.5, ape ? 30 : 24), hc, 7); });
    if (!pt && A === 'book') { const b = new Path2D(); b.roundRect(70, -390 + bob, 110, 150, 10); fs(b, '#2f6b3a', 7); c.fillStyle = '#d9c27a'; c.font = '700 22px Inter, Arial'; c.textAlign = 'center'; c.fillText('1871', 125, -300 + bob); c.fillRect(90, -360 + bob, 70, 6); }
    // head
    const hx = sw * 0.6 + look * 6, hy = headY + bob;
    if (ape) {
      for (const s of [-1, 1]) { fs(E(hx + s * (R + 12), hy, 34, 40), F.fur!); c.fillStyle = F.face!; c.fill(E(hx + s * (R + 12), hy, 18, 22)); }
      fs(E(hx, hy, R + 6, R), F.fur!); if (kind === 'gorila') fs(E(hx, hy - R + 4, 40, 34), F.fur!, 0);
      const face = new Path2D(); face.moveTo(hx, hy - 50); face.bezierCurveTo(hx + 70, hy - 80, hx + 90, hy + 10, hx + 60, hy + 60); face.bezierCurveTo(hx + 30, hy + 90, hx - 30, hy + 90, hx - 60, hy + 60); face.bezierCurveTo(hx - 90, hy + 10, hx - 70, hy - 80, hx, hy - 50); c.fillStyle = F.face!; c.fill(face);
      fs(E(hx, hy + 48, 46, 30), F.face!, 6); c.fillStyle = O; c.fill(E(hx - 10, hy + 38, 5, 4)); c.fill(E(hx + 10, hy + 38, 5, 4));
      c.lineWidth = 9; c.strokeStyle = O; c.beginPath(); c.moveTo(hx - 56, hy - 28); c.quadraticCurveTo(hx - 30, hy - 40, hx - 6, hy - 26); c.moveTo(hx + 6, hy - 26); c.quadraticCurveTo(hx + 30, hy - 40, hx + 56, hy - 28); c.stroke();
    } else {
      for (const s of [-1, 1]) fs(E(hx + s * R, hy + 6, 18, 24), F.skin, 7);
      fs(E(hx, hy, R, R * 1.02), F.skin);
      if (kind === 'tu') { const h = new Path2D(); h.moveTo(hx - R - 2, hy - 6); h.bezierCurveTo(hx - R, hy - R * 1.3, hx + R, hy - R * 1.3, hx + R + 2, hy - 6); h.quadraticCurveTo(hx + 30, hy - 60, hx - 40, hy - 46); h.closePath(); fs(h, F.hair!); }
      if (kind === 'primo' || kind === 'caveman') for (let i = 0; i < 9; i++) { const a = Math.PI + i * Math.PI / 8; fs(E(hx + Math.cos(a) * R * 0.88, hy + Math.sin(a) * R * 0.88 - 6, 28), F.hair!, 6); }
      if (kind === 'darwin' || kind === 'abuelito') { for (const s of [-1, 1]) fs(E(hx + s * (R - 10), hy - 10, 22, 34), '#f2efe8', 6); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fill(E(hx - 30, hy - 60, 26, 14, -0.4)); }
      if (kind === 'darwin') { const b = new Path2D(); b.moveTo(hx - R + 8, hy + 10); b.quadraticCurveTo(hx - R, hy + 150, hx, hy + 190); b.quadraticCurveTo(hx + R, hy + 150, hx + R - 8, hy + 10); b.quadraticCurveTo(hx, hy + 60, hx - R + 8, hy + 10); fs(b, '#f2efe8', 7); }
      if (kind === 'abuelito') { c.lineWidth = 12; c.strokeStyle = '#e8e4dc'; c.beginPath(); c.moveTo(hx - 34, hy + 32); c.quadraticCurveTo(hx, hy + 22, hx + 34, hy + 32); c.stroke(); }
    }
    // eyes (blink, look, moods), mouth
    const bl = (t + kind.length * 0.37) % 3.1 < 0.1, ex = 32, ey = hy - (ape ? 6 : 8), er = ape ? 15 : 16;
    for (const s of [-1, 1]) {
      fs(E(hx + s * ex, ey, er, bl ? 2 : er), '#fff', 6);
      if (!bl) { c.fillStyle = O; c.fill(E(hx + s * ex + look * 6 + (mood === 'uneasy' ? 6 : 0), ey + (mood === 'shock' ? -2 : 2), mood === 'shock' ? 5 : 8)); }
      if (kind === 'darwin' || kind === 'abuelito') { c.lineWidth = 6; c.strokeStyle = O; c.stroke(E(hx + s * ex, ey, er + 8)); }
    }
    if (kind === 'darwin' || kind === 'abuelito') { c.beginPath(); c.moveTo(hx - 16, ey); c.lineTo(hx + 16, ey); c.stroke(); }
    const my = hy + (ape ? 56 : 40); c.lineWidth = 7; c.strokeStyle = O; c.beginPath();
    if (mood === 'happy' || o.talk) { const op = o.talk ? 10 + 10 * Math.abs(Math.sin(t * 12)) : 14; const m = new Path2D(); m.moveTo(hx - 22, my); m.quadraticCurveTo(hx, my + op * 2, hx + 22, my); m.closePath(); fs(m, '#6b1a1a', 6); }
    else if (mood === 'uneasy') { c.moveTo(hx - 20, my + 4); c.lineTo(hx - 6, my - 2); c.lineTo(hx + 8, my + 4); c.lineTo(hx + 20, my - 2); c.stroke(); c.fillStyle = '#9fdcff'; c.fill(E(hx + R - 10, hy - 30 + ((t * 30) % 30), 9, 13)); }
    else if (mood === 'shock') fs(E(hx, my + 6, 12, 16), '#6b1a1a', 6);
    else if (kind !== 'darwin') { c.moveTo(hx - 18, my); c.quadraticCurveTo(hx, my + 10, hx + 18, my); c.stroke(); }
    // light on the paper (same as Tico and Dota)
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-atop'; const gr = c.createLinearGradient(cv.width * 0.2, cv.height * 0.1, cv.width * 0.8, cv.height); gr.addColorStop(0, 'rgba(255,248,230,0.10)'); gr.addColorStop(0.55, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(20,10,40,0.22)'); c.fillStyle = gr; c.fillRect(0, 0, cv.width, cv.height); c.globalCompositeOperation = 'source-over';
    tex.needsUpdate = true; mat.opacity = o.alpha ?? 1; mat.alphaTest = (o.alpha ?? 1) < 1 ? 0.0 : 0.04; shadow.visible = (o.alpha ?? 1) > 0.5 && !pt;
  };
  return Object.assign(g, { live(t: number, o: Z3FigO = {}) { draw(t, o); } });
}

// ---------------- 3D things
const ZC = { blue: '#3a6bff', red: '#ff3b2b', lime: '#d4ff3a', cream: '#efe9dc', ink: '#14161d', purple: '#7a6cff' };
// a red X (two crossed rounded bars); .pop(u) springs it in
function z3Cross(s = 1) { const m = z3Gloss('#ff3b3b', 0.25), g = new THREE.Group(); g.add(z3BoxM(1.0 * s, 0.2 * s, 0.14 * s, m, [0, 0, 0], [0, 0, Math.PI / 4]), z3BoxM(1.0 * s, 0.2 * s, 0.14 * s, m, [0, 0, 0], [0, 0, -Math.PI / 4])); return g; }
// an arrow along +x of length L (shaft + head), colour c
function z3Arrow(L = 1.4, col = ZC.blue) { const m = z3Gloss(col, 0.25), g = new THREE.Group(); const sh = z3BoxM(L - 0.3, 0.14, 0.14, m, [(L - 0.3) / 2, 0, 0]); const hd = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.36, 24), m); hd.rotation.z = -Math.PI / 2; hd.position.x = L - 0.18; g.add(sh, hd); return g; }
// the evolution stairs: three white blocks with labels; .fall(u) knocks them over
function z3Stairs(labels = ['CHANGO', 'GORILA', 'HUMANO']) {
  const g = new THREE.Group(), m = z3Mat('#f2efe8', 0.6), blocks = labels.map((l, i) => {
    const h = 0.8 + i * 0.8, ph = Math.round(256 * h / 1.5); const tex = z3Paint(256, ph, (c) => { c.fillStyle = '#f2efe8'; c.fillRect(0, 0, 256, ph); c.fillStyle = '#ff3b2b'; c.fillRect(0, 0, 256, 62); c.fillStyle = '#ffffff'; c.font = '900 40px Inter, Arial'; c.fillText(l, 16, 46); });
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.5, h, 1.4), [m, m, m, m, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }), m] as unknown as THREE.Material); b.castShadow = b.receiveShadow = true; b.position.set(-1.5 + i * 1.5, h / 2, 0); g.add(b); return { b, h, i };
  });
  return Object.assign(g, { tops: blocks.map(({ b, h }) => new THREE.Vector3(b.position.x, h, 0)), fall(u: number) { blocks.forEach(({ b, h, i }) => { const v = p3Clamp(u * 1.4 - i * 0.2); b.rotation.z = -v * (1.2 + i * 0.2); b.position.set(-1.5 + i * 1.5 + v * (0.8 + i * 0.3), h / 2 - v * v * h * 0.4, 0); }); } });
}
// a round portrait frame (lime ring with a dark disc) and the lines that hang from it to two people below (family tree)
function z3Frame(r = 0.75) { const g = new THREE.Group(); const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.07, 16, 64), z3Gloss(ZC.lime, 0.3)); const disc = new THREE.Mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshStandardMaterial({ color: '#23263a', roughness: 0.9 })); disc.position.z = -0.45; g.add(disc, ring); return g; }
function z3FamLines(w = 2.4, drop = 1.0) { const m = z3Mat(ZC.lime, 0.4), g = new THREE.Group(); g.add(z3BoxM(0.06, drop * 0.5, 0.06, m, [0, -drop * 0.25, 0]), z3BoxM(w, 0.06, 0.06, m, [0, -drop * 0.5, 0]), z3BoxM(0.06, drop * 0.5, 0.06, m, [-w / 2, -drop * 0.75, 0]), z3BoxM(0.06, drop * 0.5, 0.06, m, [w / 2, -drop * 0.75, 0])); return g; }
// a growing branch (a tube from a to b) in a colour; .grow(u)
function z3Branch(a: Vec3, b: Vec3, col: string, r = 0.11) {
  const curve = new THREE.LineCurve3(new THREE.Vector3(...a), new THREE.Vector3(...b)), geo = new THREE.TubeGeometry(curve, 40, r, 16, false), m = new THREE.Mesh(geo, z3Gloss(col, 0.3)); m.castShadow = true;
  const cap = z3Sph(r, m.material as THREE.Material, a); const g = new THREE.Group(); g.add(m, cap); const n = geo.index!.count;
  return Object.assign(g, { tip: curve, grow(u: number) { const k = Math.max(0, Math.min(1, u)); geo.setDrawRange(0, Math.floor(n * k / 6) * 6); cap.position.copy(curve.getPoint(k)); g.visible = k > 0.001; } });
}
// a DNA double helix (red and white backbones, coloured rungs); turns on its own
function z3Helix(h = 3.2, r = 0.55, turns = 2.2) {
  const g = new THREE.Group(), s1 = z3Gloss('#ff4b3b', 0.25), s2 = z3Gloss('#f2efe8', 0.25), cols = ['#3a6bff', '#d4ff3a', '#ff9f1c', '#c87dff'];
  const n = 42; for (let i = 0; i < n; i++) { const u = i / (n - 1), a = u * turns * Math.PI * 2, y = (u - 0.5) * h; const p1: Vec3 = [Math.cos(a) * r, y, Math.sin(a) * r], p2: Vec3 = [-Math.cos(a) * r, y, -Math.sin(a) * r];
    g.add(z3Sph(0.1, s1, p1), z3Sph(0.1, s2, p2)); if (i % 2 === 0) g.add(p3Rod(p1, [0, y, 0], 0.035, z3Mat(cols[i % 4], 0.4)), p3Rod([0, y, 0], p2, 0.035, z3Mat(cols[(i + 2) % 4], 0.4))); }
  for (const [mat, ph] of [[s1, 0], [s2, Math.PI]] as [THREE.Material, number][]) { const pts = [...Array(80)].map((_, i) => { const u = i / 79, a = u * turns * Math.PI * 2 + ph; return new THREE.Vector3(Math.cos(a) * r, (u - 0.5) * h, Math.sin(a) * r); }); const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.06, 10), mat); m.castShadow = true; g.add(m); }
  return g;
}
// a white card with a title and two lines (a label for a fact)
function z3Fact(title: string, l1: string, l2 = '', w = 2.2, h = 0.8, accent = '#ff3b2b') {
  const tex = z3Paint(560, 200, (c) => { c.fillStyle = '#fbf8f0'; c.fillRect(0, 0, 560, 200); c.fillStyle = accent; c.fillRect(0, 0, 14, 200); c.fillStyle = '#14161d'; c.font = '900 50px Inter, Arial'; c.fillText(title, 36, 66); c.fillStyle = '#3a3a44'; c.font = '800 32px Inter, Arial'; c.fillText(l1, 36, 122); c.fillText(l2, 36, 166); });
  const fr = z3Mat('#fbf8f0', 0.6); const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.04), [fr, fr, fr, fr, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }), fr] as unknown as THREE.Material); m.castShadow = true; return m;
}
// a letter tile (A C G T) — the textures are shared
const Z3_LT = new Map<string, THREE.Texture>();
function z3Tile(L: string, hot = false) {
  const key = L + (hot ? '!' : ''); let tex = Z3_LT.get(key); if (!tex) { tex = z3Paint(128, 128, (c) => { c.fillStyle = hot ? '#ff3b2b' : '#eef0f6'; c.fillRect(0, 0, 128, 128); c.fillStyle = hot ? '#fff' : '#22263a'; c.font = '900 84px monospace'; c.textAlign = 'center'; c.fillText(L, 64, 94); }); Z3_LT.set(key, tex); }
  const side = z3Mat(hot ? '#ff3b2b' : '#d7dbe6', 0.5); const m = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.1), [side, side, side, side, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }), side] as unknown as THREE.Material); m.castShadow = true; return m;
}
// a chromosome: two sister arms joined at the middle (an X with a waist), banded, with yellow caps (telomeres) at the four ends.
// fused = true: the long human chromosome 2 with two caps stuck together in the middle (shown as a yellow band)
function z3Chromo(col: string, len = 1.2, fused = false, simple = false) {
  const g = new THREE.Group(), m = z3Gloss(col, 0.35), dark = z3Gloss(new THREE.Color(col).multiplyScalar(0.7).getStyle(), 0.4), cap = z3Gloss('#e8ff3a', 0.25);
  for (const s of [-1, 1]) { const arm = new THREE.Group(); arm.position.x = s * 0.13; arm.rotation.z = -s * 0.08;
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, len, 10, 20), m); body.castShadow = true; arm.add(body);
    if (!simple) for (const k of [-0.3, 0.12, 0.34]) arm.add(z3Sph(0.135, dark, [0, k * len, 0], [1, 0.25, 1]));
    for (const e of [-1, 1]) arm.add(z3Sph(0.14, cap, [0, e * (len / 2 + 0.06), 0], [1, 0.55, 1]));
    if (fused) arm.add(z3Sph(0.142, cap, [0, 0.02, 0], [1, 0.35, 1]));
    g.add(arm); }
  return g;
}
// a magnifier: lime ring, glass and a handle
function z3Lens(r = 0.7) { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.TorusGeometry(r, 0.06, 16, 64), z3Gloss(ZC.lime, 0.25))); const gl = new THREE.Mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshPhysicalMaterial({ color: '#eaf6ff', transparent: true, opacity: 0.15, roughness: 0.05, depthWrite: false })); g.add(gl); g.add(p3Rod([r * 0.7, -r * 0.7, 0], [r * 1.5, -r * 1.5, 0], 0.07, z3Mat('#2b2f3a', 0.4))); return g; }
// a shoelace with its two plastic tips (aglets)
function z3Lace() { const pts = [...Array(30)].map((_, i) => new THREE.Vector3(0.12 * Math.sin(i * 0.5), (i / 29 - 0.5) * 2.4, 0)); const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.05, 10), z3Mat('#e9e4d8', 0.8))); for (const e of [-1, 1]) g.add(new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.28, 8, 16), z3Gloss('#e8ff3a', 0.2))).position.set(0, e * 1.32, 0); return g; }
// a clock (for Dota waiting): face, hands that turn
function z3Clock() { const g = new THREE.Group(); const face = z3Paint(128, 128, (c) => { c.fillStyle = '#fbf8f0'; c.beginPath(); c.arc(64, 64, 62, 0, 7); c.fill(); c.fillStyle = '#14161d'; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; c.fillRect(64 + Math.cos(a) * 50 - 3, 64 + Math.sin(a) * 50 - 3, 6, 6); } }); const fm = z3Mat('#ff6a3d', 0.4); const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.14, 40), [fm, new THREE.MeshStandardMaterial({ map: face }), fm] as unknown as THREE.Material); body.rotation.x = Math.PI / 2; g.add(body); const hh = z3BoxM(0.04, 0.22, 0.03, z3Mat('#14161d'), [0, 0.1, 0.09]), mh = z3BoxM(0.03, 0.32, 0.03, z3Mat('#14161d'), [0, 0.15, 0.1]); const p1 = new THREE.Group(), p2 = new THREE.Group(); p1.add(hh); p2.add(mh); g.add(p1, p2); return Object.assign(g, { tick(t: number) { p2.rotation.z = -t * 6; p1.rotation.z = -t * 0.5; } }); }
// the magazine: a cover with the joke drawing (Darwin's head on a chimp's body)
function z3Magazine(year = '1871') {
  const tex = z3Paint(400, 520, (c) => {
    c.fillStyle = '#f4efe2'; c.fillRect(0, 0, 400, 520); c.lineWidth = 10; c.strokeStyle = '#2b2f3a'; c.strokeRect(5, 5, 390, 510); c.fillStyle = '#14161d'; c.font = '900 52px Georgia, serif'; c.textAlign = 'center'; c.fillText('LA REVISTA', 200, 66); c.fillRect(30, 84, 340, 5); c.font = '600 20px monospace'; c.fillText('MARZO ' + year, 200, 112);
    c.fillStyle = '#4a2e1e'; c.beginPath(); c.ellipse(200, 360, 95, 110, 0, 0, 7); c.fill(); c.lineWidth = 6; c.strokeStyle = '#14161d'; c.stroke(); c.beginPath(); c.moveTo(120, 330); c.quadraticCurveTo(60, 420, 90, 480); c.moveTo(280, 330); c.quadraticCurveTo(340, 420, 310, 480); c.lineWidth = 34; c.strokeStyle = '#4a2e1e'; c.stroke();
    c.fillStyle = '#f0c9a8'; c.beginPath(); c.arc(200, 210, 62, 0, 7); c.fill(); c.lineWidth = 6; c.strokeStyle = '#14161d'; c.stroke(); c.fillStyle = '#f2efe8'; c.beginPath(); c.moveTo(150, 220); c.quadraticCurveTo(150, 320, 200, 330); c.quadraticCurveTo(250, 320, 250, 220); c.quadraticCurveTo(200, 250, 150, 220); c.fill(); c.stroke();
    c.fillStyle = '#14161d'; c.beginPath(); c.arc(180, 205, 6, 0, 7); c.arc(220, 205, 6, 0, 7); c.fill();
  });
  const fr = z3Mat('#2b2f3a', 0.7); const m = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.08, 0.03), [fr, fr, fr, fr, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }), fr] as unknown as THREE.Material); m.castShadow = true; return m;
}
// a fossil skull (cranium with a heavy brow, dark eye holes, no lower jaw), sand coloured and pitted
function z3Skull() {
  const g = new THREE.Group(), bone = new THREE.MeshPhysicalMaterial({ color: '#d9c49a', roughness: 0.85, sheen: 0.3 });
  const geo = p3Blob((x, y, z) => { const n = p3Fbm3(x * 4, y * 4, z * 4) * 0.08; return [x * (1.0 + n), y * (0.72 + n) + (y < 0 && z > 0.3 ? -0.15 * z : 0), z * (1.15 + n)]; }, (x, y, z) => { const n = p3Fbm3(x * 9, y * 9, z * 9); const v = 0.75 + n * 0.35; return [0.85 * v, 0.75 * v, 0.56 * v]; }, 64, 48);
  const cr = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.85 })); cr.castShadow = true; g.add(cr);
  const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.9, 8, 20), bone); brow.rotation.z = Math.PI / 2; brow.position.set(0, -0.06, 1.08); brow.scale.set(1, 1, 0.8); g.add(brow);
  for (const s of [-1, 1]) { const eye = z3Sph(0.24, new THREE.MeshStandardMaterial({ color: '#1d140c', roughness: 1 }), [s * 0.34, -0.3, 1.06], [1, 0.85, 0.45]); g.add(eye); } g.add(z3Sph(0.1, new THREE.MeshStandardMaterial({ color: '#2a1d12', roughness: 1 }), [0, -0.55, 1.12], [1, 1.3, 0.4]));
  g.add(z3Sph(0.36, bone, [0, -0.6, 0.95], [1.1, 0.7, 0.8]));
  return g;
}

// ---------------- sets
// the studio: a dark backdrop that curves into a cream floor (like a photo studio), a soft key and a rim light
function z3Studio(w: World, floor = '#ece6d6', back = '#15161d') {
  w.add(new THREE.HemisphereLight('#fff3e0', '#5a5040', 0.9));
  const key = new THREE.DirectionalLight('#ffe9c9', 1.6); key.position.set(-5, 9, 8); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 }); w.add(key);
  const rim = new THREE.DirectionalLight('#8fa8ff', 0.7); rim.position.set(6, 4, -6); w.add(rim);
  const prof = [...Array(24)].map((_, i) => { const a = i / 23 * Math.PI / 2; return new THREE.Vector2(0, 0).set(-4 + Math.cos(Math.PI / 2 - a) * 0, 0); });
  void prof; const fl = z3Paint(256, 256, (c) => { const g = c.createRadialGradient(128, 110, 10, 128, 128, 150); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#c9c1ae'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); }); const cyc = new THREE.Mesh(new THREE.PlaneGeometry(60, 30, 1, 1), new THREE.MeshStandardMaterial({ color: floor, map: fl, roughness: 0.9 })); cyc.rotation.x = -Math.PI / 2; cyc.position.z = 6; cyc.receiveShadow = true; w.add(cyc);
  const backM = new THREE.Mesh(new THREE.PlaneGeometry(80, 40), new THREE.MeshBasicMaterial({ map: z3Paint(64, 256, (c) => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#0d0e14'); g.addColorStop(0.6, back); g.addColorStop(1, '#2a2b36'); c.fillStyle = g; c.fillRect(0, 0, 64, 256); }), fog: false, toneMapped: false })); backM.position.set(0, 12, -9); w.add(backM);
  w.scene.fog = new THREE.Fog(back, 18, 40);
  // a soft hill line where floor meets the dark (the reference look), with a halo behind the subject
  const halo = new THREE.Mesh(new THREE.CircleGeometry(4, 48), new THREE.MeshBasicMaterial({ map: z3Paint(128, 128, (c) => { const g = c.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(90,100,200,0.35)'); g.addColorStop(1, 'rgba(90,100,200,0)'); c.fillStyle = g; c.fillRect(0, 0, 128, 128); }), transparent: true, depthWrite: false, fog: false })); halo.position.set(0, 3.2, -8.5); w.add(halo);
  const pool = new THREE.SpotLight('#ffe6c0', 120, 30, 0.5, 0.9, 1.4); pool.position.set(0.5, 10, 6); pool.target.position.set(0.3, 0, -0.5); w.add(pool); w.add(pool.target);
  const r = p3Rnd(31), cols = ['#3a5cff', '#ffc83d', '#2a3a8a', '#6a7cff', '#ffb02e'];
  const bok = [...Array(16)].map((_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.25 + r() * 0.55, 20, 14), new THREE.MeshBasicMaterial({ color: cols[i % 5], transparent: true, opacity: 0.2, fog: false, toneMapped: false, depthWrite: false })); m.scale.setScalar(0.7); m.position.set((r() - 0.5) * 16, 1 + r() * 8, -5 - r() * 3); w.add(m); return { m, x: m.position.x, y: m.position.y, p: r() * 6 }; });
  return { pose(t: number) { bok.forEach(({ m, x, y, p }) => { m.position.x = x + 0.6 * Math.sin(t * 0.25 + p); m.position.y = y + 0.4 * Math.sin(t * 0.35 + p * 2); }); } };
}
// the desert at sunset: dunes, a warm low sun, purple sky
function z3Desert(w: World) {
  w.add(new THREE.HemisphereLight('#ffcf9a', '#8a5a2a', 0.9)); const sun = new THREE.DirectionalLight('#ffb070', 2.0); sun.position.set(-8, 4, -6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 }); w.add(sun);
  const fill = new THREE.DirectionalLight('#ffe0c0', 0.8); fill.position.set(4, 6, 8); w.add(fill);
  const geo = new THREE.PlaneGeometry(80, 60, 120, 90); geo.rotateX(-Math.PI / 2); const pos = geo.attributes.position; for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i); pos.setY(i, 0.6 * Math.sin(x * 0.25 + z * 0.1) + 0.35 * Math.sin(x * 0.6 - z * 0.3) + (z < -8 ? (-z - 8) * 0.08 * (1 + Math.sin(x * 0.15)) : 0)); } geo.computeVertexNormals();
  const sand = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: '#e0a860', roughness: 0.95, sheen: 0.5, sheenColor: new THREE.Color('#ffd9a0') })); sand.receiveShadow = true; w.add(sand);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(70, 32, 16), new THREE.MeshBasicMaterial({ map: z3Paint(64, 256, (c) => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#1e1838'); g.addColorStop(0.42, '#6a3a6a'); g.addColorStop(0.5, '#ff8a4a'); g.addColorStop(0.56, '#ffc070'); g.addColorStop(1, '#ffc070'); c.fillStyle = g; c.fillRect(0, 0, 64, 256); }), side: THREE.BackSide, fog: false, toneMapped: false })); w.add(sky);
  const sunD = new THREE.Mesh(new THREE.CircleGeometry(3, 48), new THREE.MeshBasicMaterial({ color: '#ffd38a', fog: false, toneMapped: false })); sunD.position.set(-14, 2.2, -40); w.add(sunD);
  w.scene.fog = new THREE.Fog('#d98a5a', 25, 70);
  return { pose(_t: number) {} };
}
// the paper set (Darwin's scenes): a cream sheet with a fine dot texture, soft light
function z3PaperSet(w: World) {
  w.add(new THREE.HemisphereLight('#fff6e8', '#b8ab90', 1.1)); const key = new THREE.DirectionalLight('#fff0dc', 1.2); key.position.set(-4, 8, 8); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); w.add(key);
  const tex = z3Paint(256, 256, (c) => { c.fillStyle = '#efe9dc'; c.fillRect(0, 0, 256, 256); c.fillStyle = 'rgba(0,0,0,0.05)'; for (let y = 0; y < 256; y += 8) for (let x = (y / 8) % 2 * 4; x < 256; x += 8) c.fillRect(x, y, 2, 2); }); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(10, 10);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 })); back.position.set(0, 10, -6); back.receiveShadow = true; w.add(back);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 })); fl.rotation.x = -Math.PI / 2; fl.position.z = 6; fl.receiveShadow = true; w.add(fl);
  return { pose(_t: number) {} };
}

// =====================================================================
//  DINOS: "Los dinosaurios no eran como en las películas" (horizontal 16:9). Things in 3D, people drawn in 2D.
//  z3Dino(spec): ONE rig for every dinosaur (and the other prehistoric animals): an organic torso, a neck and a tail that
//  are tapered tubes rebuilt every frame (they sway and follow), a head with a jaw that opens, eyes that blink, legs with
//  knees (IK) that walk, little arms, and the extras each species needs (feathers, crests, frill, horns, plates, sail).
//  The animal faces +x. live(t, o) poses it: walk, jaw, look, tail swing, standing upright (the old, wrong posture).
// =====================================================================
interface Z3DinoSpec {
  col: string; belly: string; dark?: string;
  body: Vec3; hip: number; leg: number; legR: number;
  quad?: boolean; sprawl?: number; arm?: number; armR?: number;
  neck: [number, number, number];            // length, radius, angle up from horizontal (degrees)
  head: Vec3; teeth?: boolean; beak?: boolean; eyeR?: number;
  tail: [number, number]; tailUp?: number;   // length, radius at the base; how much it rises
  feathers?: number; featherCol?: string; armFeathers?: boolean; stripes?: string;
  crests?: boolean; frill?: 'fake' | 'trike'; horns?: boolean; plates?: boolean; sail?: number; thumbSpike?: boolean; spikes?: boolean;
  mane?: string; spots?: string; bands?: string; nb?: number;
}
type Z3DinoPose = { walk?: number; jaw?: number; yaw?: number; pitch?: number; tail?: number; upright?: number; frill?: number; blink?: boolean; sniff?: number; shake?: number; red?: boolean };
// a tube along points, tapering from r0 to r1, rebuilt with set(points)
function z3Tube(mat: THREE.Material, r0: number, r1: number, seg = 24, rad = 14) {
  const m = new THREE.Mesh(new THREE.BufferGeometry(), mat); m.castShadow = m.receiveShadow = true;
  return Object.assign(m, { set(pts: THREE.Vector3[]) {
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal'), g = new THREE.TubeGeometry(curve, seg, 1, rad, false), pos = g.attributes.position, nrm = g.attributes.normal;
    for (let i = 0; i <= seg; i++) { const u = i / seg, r = r0 + (r1 - r0) * Math.pow(u, 0.9), p = curve.getPoint(u); for (let j = 0; j <= rad; j++) { const k = i * (rad + 1) + j; pos.setXYZ(k, p.x + nrm.getX(k) * r, p.y + nrm.getY(k) * r, p.z + nrm.getZ(k) * r); } }
    pos.needsUpdate = true; g.computeVertexNormals(); m.geometry.dispose(); m.geometry = g; for (const ch of m.children) (ch as THREE.Mesh).geometry = g; return curve;
  } });
}
// a scaly skin texture (little rounded cells) tinted by the material colour
// feathers as an illustration: overlapping scallops (light edges), tinted by the material colour
const Z3_FEATHERS = (() => { let t: THREE.Texture | null = null; return () => { if (t) return t; t = z3Paint(256, 256, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 256, 256); for (let y = -16; y < 272; y += 22) for (let x = -16; x < 272; x += 28) { const ox = (Math.round(y / 22) % 2) * 14; c.fillStyle = 'rgba(0,0,0,0.16)'; c.beginPath(); c.arc(x + ox, y, 15, 0, Math.PI); c.fill(); c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 3; c.beginPath(); c.arc(x + ox, y, 14, 0.15, Math.PI - 0.15); c.stroke(); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return t; }; })();
const z3FSkin = (c: string) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.8, map: Z3_FEATHERS() });
const Z3_SCALES = (() => { let t: THREE.Texture | null = null; return () => { if (t) return t; t = z3Paint(256, 256, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 256, 256); const r = p3Rnd(5); for (let i = 0; i < 900; i++) { const x = r() * 256, y = r() * 256, s = 3 + r() * 5; c.fillStyle = `rgba(0,0,0,${0.02 + r() * 0.05})`; c.beginPath(); c.arc(x, y, s, 0, 7); c.fill(); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); return t; }; })();
const z3DSkin = (c: string, rough = 0.62) => new THREE.MeshPhysicalMaterial({ color: c, roughness: rough, map: Z3_SCALES(), sheen: 0.4, sheenColor: new THREE.Color('#ffffff'), sheenRoughness: 0.6, clearcoat: 0.25, clearcoatRoughness: 0.5 });
function z3Dino(S: Z3DinoSpec) {
  const g = new THREE.Group(), hips = new THREE.Group(); g.add(hips); g.userData.ink = true; hips.position.y = S.hip;
  const hx = (h: string) => new THREE.Color(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
  const C = hx(S.col), B = hx(S.belly), D = hx(S.dark || S.col).multiplyScalar(S.dark ? 1 : 0.7), skin = z3DSkin(S.col), bellyM = z3DSkin(S.belly), dark = z3Gloss('#1d1410', 0.3);
  const [bx, by, bz] = S.body;
  // torso: an egg, deeper at the chest, belly painted lighter, a darker back, spots
  const tr = S.tail[1] / Math.max(by, bz);
  const torsoGeo = p3Blob((x, y, z) => { const f = x >= 0 ? 1 - 0.08 * x : 1 + (1 - Math.max(tr * 1.15, 0.35)) * x; return [x * bx * (x < 0 ? 1.25 : 1) + bx * 0.35, y * by * f * (y < 0 ? 1.06 : 0.94) + (x < 0 ? x * by * 0.12 : 0), z * bz * f]; },
    (x, y, z) => { const n = p3Fbm3(x * 3, y * 3, z * 3) - 0.5; const bel = p3Smoothstep(0.1, -0.5, y / by), back = p3Smoothstep(0.4, 0.95, y / by); let c = C.clone().lerp(B, p3Smoothstep(0.35, 0.65, bel)).lerp(D, p3Smoothstep(0.4, 0.6, back) * 0.6); if (S.spots && n > 0.12) c = c.lerp(hx(S.spots), 0.5); if (S.bands && bel < 0.5 && Math.sin((x / bx) * (S.nb ?? 7) * Math.PI + y * 2) > 0.35) c = hx(S.bands).lerp(c, bel); return [c.r + n * 0.02, c.g + n * 0.02, c.b + n * 0.015]; }, 48, 36);
  const torso = new THREE.Mesh(torsoGeo, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.62, map: Z3_SCALES(), sheen: 0.4, sheenRoughness: 0.6, clearcoat: 0.2 })); torso.castShadow = torso.receiveShadow = true;
  const chest = new THREE.Group(); chest.add(torso); hips.add(chest);
  if (S.feathers) (torso.material as THREE.MeshPhysicalMaterial).map = Z3_FEATHERS();
  // neck, head and tail: tubes
  const neckM = S.feathers && S.featherCol ? z3FSkin(S.featherCol) : skin, tailM = S.bands ? new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.6, map: z3Paint(512, 64, (c) => { for (let i = 0; i < 12; i++) { c.fillStyle = i % 2 ? S.bands! : S.col; c.fillRect(i * 43, 0, 43, 64); } }) }) : S.stripes ? new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.8, map: z3Paint(512, 64, (c) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? S.stripes! : S.col; c.fillRect(i * 32, 0, 32, 64); } }) }) : (S.feathers && S.featherCol ? z3FSkin(S.featherCol) : skin);
  const neck = z3Tube(neckM, S.neck[1], S.neck[1] * 0.7), tail = z3Tube(tailM, S.tail[1], S.tail[1] * 0.08, 28); hips.add(neck, tail);
  const tuft: THREE.Mesh[] = []; const furT = false && S.feathers && !S.stripes ? p3Fur(new THREE.BufferGeometry(), { ...P3_HAIR, layers: 8, len: 0.09 * S.tail[1] * (S.feathers ?? 0) + 0.01, den: 60, droop: [-0.6, -0.4, 0], colors: [S.featherCol || S.col, new THREE.Color(S.featherCol || S.col).lerp(new THREE.Color('#ffffff'), 0.25).getStyle()] }) : null; if (furT) hips.add(furT);
  const furN = false && S.feathers ? p3Fur(new THREE.BufferGeometry(), { ...P3_HAIR, layers: 8, len: 0.1 * S.neck[1] * (S.feathers ?? 0) + 0.008, den: 70, droop: [-0.4, -0.5, 0], colors: [S.featherCol || S.col, new THREE.Color(S.featherCol || S.col).lerp(new THREE.Color('#ffffff'), 0.2).getStyle()] }) : null; if (furN) hips.add(furN);
  const head = new THREE.Group(); hips.add(head);
  const [hx0, hy0, hz0] = S.head;
  const skull = new THREE.Mesh(p3Blob((x, y, z) => { const sn = x > 0 ? 1 - 0.35 * x : 1; return [x * hx0 + hx0 * 0.45, y * hy0 * sn + (x > 0 && y > 0 ? -x * hy0 * 0.2 : 0), z * hz0 * sn]; },
    (x, y) => { const c = C.clone().lerp(D, p3Smoothstep(0, 1, y / hy0) * 0.5); return [c.r, c.g, c.b]; }, 40, 30), new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.55, map: Z3_SCALES(), clearcoat: 0.25 })); skull.castShadow = true; head.add(skull);
  const jawP = new THREE.Group(); jawP.position.set(-hx0 * 0.1, -hy0 * 0.45, 0); head.add(jawP);
  const jaw = new THREE.Mesh(p3Blob((x, y, z) => [x * hx0 * 0.78 + hx0 * 0.68, y * hy0 * 0.3, z * hz0 * 0.72], (x, y) => { const c = C.clone().lerp(B, p3Smoothstep(0.05, -0.2, y)); return [c.r, c.g, c.b]; }), new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.6, map: Z3_SCALES() })); jaw.castShadow = true; jawP.add(jaw);
  const mouthIn = new THREE.Mesh(p3Blob((x, y, z) => [x * hx0 * 0.7 + hx0 * 0.68, y * hy0 * 0.05 + hy0 * 0.22, z * hz0 * 0.55]), new THREE.MeshStandardMaterial({ color: '#7a1f2a', roughness: 0.6 })); jawP.add(mouthIn);
  if (S.teeth) for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { const th = new THREE.Mesh(new THREE.ConeGeometry(hz0 * 0.07, hy0 * 0.28, 6), z3Mat('#fbf6e6', 0.4)); th.rotation.x = Math.PI; th.position.set(hx0 * (0.45 + i * 0.16), -hy0 * 0.36, s * hz0 * (0.6 - i * 0.07)); head.add(th); }
  if (S.beak) { const bk = new THREE.Mesh(new THREE.ConeGeometry(hy0 * 0.45, hx0 * 0.7, 16), z3Gloss('#e8a93a', 0.3)); bk.rotation.z = -Math.PI / 2; bk.position.set(hx0 * 1.55, -hy0 * 0.1, 0); head.add(bk); }
  const er = S.eyeR ?? hy0 * 0.32, eyes = [-1, 1].map((s) => { const e = z3Eye(er, S.col); e.position.set(hx0 * 0.35, hy0 * 0.32, s * hz0 * 0.72); e.rotation.y = s * 0.9; head.add(e); return e; });
  const red = new THREE.MeshBasicMaterial({ color: '#ff2a2a' }), redEyes = eyes.map((e) => { const m = new THREE.Mesh(new THREE.SphereGeometry(er * 0.5, 16, 10), red); m.position.z = er * 0.85; m.visible = false; e.add(m); return m; });
  if (S.crests) for (const s of [-1, 1]) { const cr = new THREE.Mesh(new THREE.CylinderGeometry(hx0 * 0.9, hx0 * 0.9, hz0 * 0.12, 32, 1, false, 0, Math.PI), z3DSkin(S.dark || '#d8692e', 0.5)); cr.rotation.x = Math.PI / 2; cr.scale.set(1, 1, 0.55); cr.position.set(hx0 * 0.7, hy0 * 0.75, s * hz0 * 0.22); head.add(cr); }
  if (S.horns) { const hm = z3Mat('#f2e8cf', 0.45); for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.ConeGeometry(hy0 * 0.16, hy0 * 1.6, 16), hm); h.position.set(hx0 * 0.35, hy0 * 1.05, s * hz0 * 0.5); h.rotation.z = -0.9; head.add(h); } const nh = new THREE.Mesh(new THREE.ConeGeometry(hy0 * 0.12, hy0 * 0.6, 12), hm); nh.position.set(hx0 * 1.45, hy0 * 0.35, 0); nh.rotation.z = -0.5; head.add(nh); }
  let frill: THREE.Object3D | null = null;
  if (S.frill === 'trike') { const sh = new THREE.Shape(), R = hy0 * 1.55; for (let i = 0; i <= 40; i++) { const a = -Math.PI * 0.62 + i / 40 * Math.PI * 1.24, rr = R * (1 + 0.06 * Math.cos(i * Math.PI / 2)); const p: [number, number] = [Math.sin(a) * rr, Math.cos(a) * rr]; if (i === 0) sh.moveTo(...p); else sh.lineTo(...p); } sh.lineTo(0, -R * 0.2); sh.closePath();
    const fm = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: hz0 * 0.12, bevelEnabled: true, bevelSize: hz0 * 0.05, bevelThickness: hz0 * 0.05, bevelSegments: 3 }), z3DSkin(S.dark || '#c8743a', 0.55)); fm.castShadow = true; fm.rotation.y = Math.PI / 2; const fp = new THREE.Group(); fp.add(fm); fp.position.set(-hx0 * 0.15, hy0 * 0.35, 0); fp.rotation.z = 1.0; head.add(fp); frill = fp;
    for (let i = 0; i < 7; i++) { const a = -Math.PI * 0.55 + i / 6 * Math.PI * 1.1, k = new THREE.Mesh(new THREE.ConeGeometry(hz0 * 0.09, hy0 * 0.3, 8), z3Mat('#f2e8cf', 0.45)); k.position.set(0, Math.cos(a) * R * 1.02, Math.sin(a) * R * 1.02); k.rotation.x = -a; fp.add(k); } }
  if (S.frill === 'fake') { const fp = new THREE.Group(); const colors = ['#ff5a3d', '#ffd23d', '#3ad4a8']; for (let i = 0; i < 11; i++) { const a = -Math.PI * 0.85 + i * Math.PI * 1.7 / 10, rib = new THREE.Mesh(new THREE.ConeGeometry(hy0 * 0.7, hy0 * 4.2, 3), z3DSkin(colors[i % 3], 0.5)); rib.scale.set(1, 1, 0.12); rib.position.set(0, Math.cos(a) * hy0 * 2.0, Math.sin(a) * hy0 * 2.0); rib.rotation.x = a; fp.add(rib); } fp.position.set(-hx0 * 0.2, 0, 0); head.add(fp); frill = fp; }
  // legs, feet, arms
  const legM = skin, legs = [0, 1, 2, 3].slice(0, S.quad ? 4 : 2).map(() => { const l = z3Limb(legM, S.legR * (S.quad ? 1.1 : 1.7), S.legR * 0.55); hips.add(l); return l; });
  const feet = legs.map(() => { const f = new THREE.Mesh(p3Blob((x, y, z) => [x * S.legR * 1.5 + S.legR * 0.6, y * S.legR * 0.5, z * S.legR * 1.1]), z3DSkin(S.dark || S.col)); f.castShadow = true; g.add(f); return f; });
  const arms = !S.quad && S.arm ? [-1, 1].map(() => { const a = z3Limb(skin, S.armR || 0.05, (S.armR || 0.05) * 0.6); hips.add(a); return a; }) : [];
  const hands = arms.map(() => { const h = new THREE.Group(); const p = new THREE.Mesh(new THREE.SphereGeometry((S.armR || 0.05) * 1.1, 12, 8), skin); h.add(p); for (let k = 0; k < (S.feathers ? 3 : 2); k++) { const cl = new THREE.Mesh(new THREE.ConeGeometry((S.armR || 0.05) * 0.35, (S.armR || 0.05) * 2.2, 6), z3Mat('#2b2622', 0.4)); cl.position.set((S.armR || 0.05) * 1.2, -(S.armR || 0.05) * (0.4 + k * 0.5), (k - 0.5) * (S.armR || 0.05) * 0.8); cl.rotation.z = -1.9; h.add(cl); } hips.add(h); return h; });
  const armFeathers = S.armFeathers ? arms.map(() => { const f = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshPhysicalMaterial({ color: S.featherCol || S.col, roughness: 0.8, side: THREE.DoubleSide, map: z3Paint(128, 64, (c) => { c.fillStyle = '#ffffff'; for (let i = 0; i < 9; i++) { const x = 6 + i * 13; c.beginPath(); c.ellipse(x, 30 + i * 1.5, 8, 26 + i * 1.2, 0.2, 0, 7); c.fill(); } c.strokeStyle = 'rgba(0,0,0,0.22)'; c.lineWidth = 2; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(6 + i * 13, 6); c.lineTo(8 + i * 13, 60); c.stroke(); } }), transparent: true, alphaTest: 0.3 })); f.castShadow = true; hips.add(f); return f; }) : [];
  // back: plates, a sail, spikes on the tail
  const back: THREE.Object3D[] = [];
  if (S.plates) for (let i = 0; i < 9; i++) { const u = i / 8, h = 0.25 + 0.55 * Math.sin(u * Math.PI); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.0, h * bx * 0.6, h * bx * 0.9, 4), z3DSkin(i % 2 ? '#d86a3a' : '#e8903a', 0.5)); p.scale.set(1, 1, 0.18); p.position.set(bx * (1.0 - u * 1.9) + bx * 0.35, by * 0.92 + h * bx * 0.3, (i % 2 ? 0.12 : -0.12) * bz); p.rotation.z = (u - 0.5) * 0.5; chest.add(p); back.push(p); }
  if (S.sail) { const sh = new THREE.Shape(); const L = bx * 1.8; sh.moveTo(-L / 2, 0); for (let i = 0; i <= 16; i++) { const u = i / 16; sh.lineTo(-L / 2 + u * L, S.sail * Math.sin(u * Math.PI) * (0.95 + 0.05 * Math.sin(u * 40))); } sh.lineTo(L / 2, 0); sh.closePath();
    const sail = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: false }), new THREE.MeshPhysicalMaterial({ color: '#d8573a', roughness: 0.55, side: THREE.DoubleSide, map: z3Paint(256, 128, (c) => { c.fillStyle = '#fff'; c.fillRect(0, 0, 256, 128); c.fillStyle = 'rgba(80,20,10,0.35)'; for (let i = 0; i < 17; i++) c.fillRect(i * 15, 0, 3, 128); }) })); sail.position.set(bx * 0.35, by * 0.8, -0.01); sail.castShadow = true; chest.add(sail); back.push(sail); }
  const tspikes = S.spikes ? [0, 1, 2, 3].map((i) => { const s = new THREE.Mesh(new THREE.ConeGeometry(S.tail[1] * 0.25, S.tail[1] * 2.2, 10), z3Mat('#f2e8cf', 0.45)); hips.add(s); return s; }) : [];
  const mane = S.mane ? [...Array(8)].map(() => { const m = new THREE.Mesh(new THREE.ConeGeometry(S.neck[1] * 0.4, S.neck[1] * 1.2, 6), z3Mat(S.mane!, 0.8)); hips.add(m); return m; }) : [];
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  return Object.assign(g, { head, frill, spec: S, live(t: number, o: Z3DinoPose = {}) {
    const walk = o.walk ?? 0, ph = t * (S.quad ? 5 : 6) * Math.max(0.5, walk), up = o.upright ?? 0, br = Math.sin(t * 2.2);
    // the body: bob with the steps, breathe, pitch up when standing upright (the old pose), a shake
    hips.rotation.z = up * 0.95 + 0.02 * br + (o.shake ? 0.08 * Math.sin(t * 28) * o.shake : 0); hips.position.y = S.hip * (1 + up * 0.35) + walk * 0.04 * S.hip * Math.abs(Math.sin(ph)); hips.rotation.x = o.shake ? 0.1 * Math.sin(t * 23) * o.shake : 0;
    chest.scale.set(1, 1 + 0.025 * br, 1 + 0.03 * br);
    // neck and head
    const na = (S.neck[2] - up * 50) * Math.PI / 180, nb = V(bx * 1.15, by * 0.25, 0), sw = 0.08 * Math.sin(t * 0.9) + (o.yaw ?? 0);
    const nEnd = nb.clone().add(V(Math.cos(na) * S.neck[0], Math.sin(na) * S.neck[0] + 0.03 * S.neck[0] * Math.sin(t * 1.7) + (o.sniff ? -0.15 * S.neck[0] * o.sniff : 0), Math.sin(sw) * S.neck[0] * 0.4));
    const nMid = nb.clone().lerp(nEnd, 0.5).add(V(0, S.neck[0] * 0.12, 0)); neck.set([nb, nMid, nEnd]);
    head.position.copy(nEnd); head.rotation.set(0, -sw * 0.8 - (o.yaw ?? 0) * 0.5, (o.pitch ?? 0) - up * 0.75 + 0.05 * Math.sin(t * 1.3) + (o.sniff ? 0.2 * Math.sin(t * 9) * o.sniff : 0));
    jawP.rotation.z = -(o.jaw ?? 0) * 0.75; mouthIn.visible = (o.jaw ?? 0) > 0.05;
    const blink = (t * 0.9 + S.hip) % 3.6 < 0.12; eyes.forEach((e) => e.pose(0.1 * Math.sin(t * 0.7), 0, o.blink === false ? 0 : blink ? 1 : 0.15)); redEyes.forEach((m) => (m.visible = !!o.red));
    if (frill) { const f = o.frill ?? (S.frill === 'trike' ? 1 : 0); frill.scale.setScalar(Math.max(0.001, f)); frill.visible = f > 0.01; if (S.frill === 'fake') frill.rotation.x = 0.1 * Math.sin(t * 12) * f; }
    // tail: from the hips back, rising (contrapeso) or dragging on the ground (upright)
    const ta = (o.tail ?? 1) * 0.25, tl = S.tail[0], tu = (S.tailUp ?? 0.05) * tl, tp: THREE.Vector3[] = [];
    for (let i = 0; i <= 5; i++) { const u = i / 5, wv = Math.sin(t * 2.2 - u * 2.5 + walk * ph * 0.3) * ta * u * tl * 0.5; tp.push(V(-bx * 0.35 - u * tl, (tu * u * (1 - u * 0.4)) * (1 - up) + (-S.hip * 1.2 * u * u) * up * 1.0, wv)); }
    if (up > 0) tp.forEach((p) => { const wy = p.clone().applyAxisAngle(V(0, 0, 1), hips.rotation.z).y + hips.position.y; if (wy < S.tail[1] * 0.6) p.y += (S.tail[1] * 0.6 - wy) * 0.9; });
    const tc = tail.set(tp); if (furT) furT.children.forEach((m) => ((m as THREE.Mesh).geometry = tail.geometry)); if (furN) furN.children.forEach((m) => ((m as THREE.Mesh).geometry = neck.geometry)); tuft.forEach((f, i) => { const u = 0.3 + i * 0.1, p = tc.getPoint(u), d = tc.getTangent(u); f.position.copy(p).add(V(0, S.tail[1] * (1 - u) * 0.9, 0)); f.quaternion.setFromUnitVectors(V(0, 1, 0), V(-d.x * 0.5, 1, 0).normalize()); });
    tspikes.forEach((s, i) => { const p = tc.getPoint(0.88 + i * 0.03); s.position.copy(p).add(V(0, S.tail[1] * 0.3, (i % 2 ? 1 : -1) * S.tail[1] * 0.3)); s.rotation.set((i % 2 ? 1 : -1) * 0.9, 0, 0.5); });
    mane.forEach((m, i) => { const u = i / 7, p = nb.clone().lerp(nEnd, u); m.position.copy(p).add(V(-S.neck[1] * 0.3, S.neck[1] * 0.85, 0)); m.rotation.z = 0.6; });
    // legs: hips to feet that step; quadrupeds add front legs under the chest
    const stride = S.leg * 0.35 * walk, nl = legs.length;
    for (let i = 0; i < nl; i++) {
      const front = i >= 2, side = i % 2 ? 1 : -1, phase = ph + (i % 2 ? Math.PI : 0) + (front ? Math.PI / 2 : 0);
      const root = front ? V(bx * 1.05, -by * 0.35, side * bz * 0.55) : V(0, -by * 0.2, side * bz * 0.55);
      const rootW = root.clone().applyAxisAngle(V(0, 0, 1), hips.rotation.z).add(hips.position);
      const fx = (front ? bx * 1.05 : 0) * Math.cos(hips.rotation.z) + stride * Math.sin(phase) + up * bx * 0.1, lift = walk > 0 ? Math.max(0, Math.cos(phase)) * S.leg * 0.12 * walk : 0;
      const foot = V(fx, S.legR * 0.5 + lift, side * bz * (0.55 + (S.sprawl ?? 0)));
      const L = S.leg * (front ? 0.85 : 1) / 2, pole = front ? V(-1, 0, side * 0.2) : V(1, 0.2, side * 0.2);
      const loc = (p: THREE.Vector3) => p.clone().sub(hips.position).applyAxisAngle(V(0, 0, 1), -hips.rotation.z);
      const r = z3IK(rootW, foot, L, L, pole); legs[i].set(loc(rootW), loc(r.e), loc(r.h)); feet[i].position.copy(foot); feet[i].position.y = S.legR * 0.35 + lift;
    }
    arms.forEach((a, i) => { const s = i ? 1 : -1, sh = V(bx * 1.2, -by * 0.05, s * bz * 0.6), hand = V(bx * 1.2 + (S.arm || 0) * 0.55, -by * 0.05 - (S.arm || 0) * 0.55 + 0.03 * Math.sin(t * 2 + i), s * bz * 0.75); const r = z3IK(sh, hand, (S.arm || 0) * 0.5, (S.arm || 0) * 0.5, V(-1, -0.3, s)); a.set(sh, r.e, r.h); hands[i].position.copy(r.h); hands[i].rotation.z = -0.4;
      if (armFeathers[i]) { const f = armFeathers[i]; f.position.copy(sh.clone().lerp(r.h, 0.5)).add(V(-(S.arm || 0) * 0.15, -(S.arm || 0) * 0.25, s * 0.02)); f.scale.set((S.arm || 0) * 1.1, (S.arm || 0) * 0.55, 1); f.rotation.set(0, 0, -0.75); } });
  } });
}
// the species (proportions in meters; spots and colours chosen for the series look, not as fact)
const Z3_SP: Record<string, Z3DinoSpec> = {
  raptorMovie: { col: '#3f8a5a', belly: '#e8e0b8', dark: '#24563a', body: [0.45, 0.32, 0.26], hip: 1.0, leg: 1.05, legR: 0.08, arm: 0.42, armR: 0.045, neck: [0.42, 0.12, 40], head: [0.28, 0.14, 0.12], teeth: true, tail: [1.5, 0.15], tailUp: 0.12, bands: '#24563a', nb: 8 },
  raptor: { col: '#e07a2e', belly: '#f6e6c4', dark: '#8a3e1a', body: [0.2, 0.13, 0.11], hip: 0.38, leg: 0.4, legR: 0.03, arm: 0.2, armR: 0.02, neck: [0.18, 0.05, 45], head: [0.11, 0.055, 0.05], teeth: true, tail: [0.6, 0.06], tailUp: 0.15, feathers: 1, featherCol: '#e07a2e', armFeathers: true },
  deino: { col: '#2f5fd8', belly: '#f2e6c8', dark: '#1a3a8a', body: [0.5, 0.34, 0.28], hip: 1.0, leg: 1.05, legR: 0.08, arm: 0.5, armR: 0.05, neck: [0.42, 0.13, 40], head: [0.3, 0.15, 0.13], teeth: true, tail: [1.6, 0.16], tailUp: 0.12, feathers: 1, featherCol: '#2f5fd8', armFeathers: true },
  rex: { col: '#2f5fd8', belly: '#f2e6c8', dark: '#1c3a94', body: [1.6, 1.0, 0.9], hip: 2.4, leg: 2.5, legR: 0.3, arm: 0.6, armR: 0.09, neck: [0.9, 0.45, 25], head: [0.85, 0.45, 0.38], teeth: true, eyeR: 0.11, tail: [4.6, 0.6], tailUp: 0.08, bands: '#f2b632', nb: 6 },
  yuty: { col: '#e8a03a', belly: '#f6e8c8', dark: '#a8601e', body: [1.4, 0.9, 0.8], hip: 2.1, leg: 2.2, legR: 0.27, arm: 0.8, armR: 0.1, neck: [0.8, 0.42, 28], head: [0.75, 0.38, 0.32], teeth: true, eyeR: 0.1, tail: [4.0, 0.55], tailUp: 0.08, feathers: 1.6, featherCol: '#e8a03a' },
  diloFake: { col: '#d8c24a', belly: '#f2ecc2', dark: '#3a6a5a', body: [0.32, 0.22, 0.18], hip: 0.7, leg: 0.75, legR: 0.06, arm: 0.3, armR: 0.035, neck: [0.4, 0.09, 50], head: [0.2, 0.1, 0.09], teeth: false, tail: [1.0, 0.11], tailUp: 0.1, frill: 'fake', spots: '#3a6a5a' },
  dilo: { col: '#3a7ad8', belly: '#f0e6c8', dark: '#ff6a3d', body: [1.1, 0.62, 0.55], hip: 1.6, leg: 1.7, legR: 0.2, arm: 0.7, armR: 0.08, neck: [0.95, 0.26, 35], head: [0.55, 0.24, 0.2], teeth: true, eyeR: 0.07, tail: [3.0, 0.4], tailUp: 0.08, crests: true, bands: '#f2b632', nb: 7 },
  sino: { col: '#e07a2e', belly: '#f6e6c4', dark: '#8a3e1a', body: [0.17, 0.11, 0.09], hip: 0.28, leg: 0.3, legR: 0.025, arm: 0.1, armR: 0.018, neck: [0.15, 0.04, 40], head: [0.09, 0.045, 0.04], teeth: true, tail: [0.75, 0.05], tailUp: 0.08, feathers: 1.2, stripes: '#f4ead2' },
  maia: { col: '#2fa88a', belly: '#f0ead0', dark: '#1a6a56', body: [1.5, 1.0, 0.85], hip: 1.8, leg: 1.8, legR: 0.3, arm: 0.9, armR: 0.14, neck: [0.8, 0.4, 30], head: [0.6, 0.26, 0.22], beak: false, eyeR: 0.08, tail: [3.4, 0.55], tailUp: 0.05, bands: '#f2e6a8', nb: 5 },
  croc: { col: '#3a8a5a', belly: '#e8e4b8', dark: '#1e5a36', body: [0.9, 0.3, 0.38], hip: 0.32, leg: 0.36, legR: 0.08, quad: true, sprawl: 0.4, neck: [0.2, 0.22, 0], head: [0.75, 0.16, 0.2], teeth: true, eyeR: 0.05, tail: [2.0, 0.28], tailUp: -0.02, spots: '#2e3a1e' },
  maiaBaby: { col: '#5ac8a8', belly: '#f6f0dc', dark: '#2a8a6e', body: [0.22, 0.17, 0.15], hip: 0.22, leg: 0.24, legR: 0.05, arm: 0.12, armR: 0.03, neck: [0.12, 0.08, 35], head: [0.13, 0.09, 0.08], eyeR: 0.04, tail: [0.35, 0.08], tailUp: 0.05 },
  bronto: { col: '#6a5ad8', belly: '#ece4d4', dark: '#3a2e94', body: [2.2, 1.5, 1.3], hip: 3.0, leg: 3.0, legR: 0.45, quad: true, neck: [6.0, 0.55, 55], head: [0.55, 0.3, 0.26], eyeR: 0.07, tail: [8.0, 0.75], tailUp: 0.04, bands: '#f2b632', nb: 5 },
  stego: { col: '#3a9a5a', belly: '#ece6c4', dark: '#1e6a3a', body: [1.8, 1.1, 0.95], hip: 2.0, leg: 1.8, legR: 0.32, quad: true, neck: [0.6, 0.35, 5], head: [0.45, 0.22, 0.2], eyeR: 0.06, tail: [3.0, 0.5], tailUp: 0.15, plates: true, spikes: true },
  trike: { col: '#e8803a', belly: '#f6e6c8', dark: '#2f5fd8', body: [1.9, 1.2, 1.05], hip: 1.7, leg: 1.6, legR: 0.36, quad: true, neck: [0.4, 0.5, 0], head: [0.9, 0.55, 0.45], beak: true, eyeR: 0.08, tail: [2.2, 0.55], tailUp: 0.05, horns: true, frill: 'trike', bands: '#2f5fd8', nb: 5 },
  spino: { col: '#2f4fb8', belly: '#ece6d4', dark: '#1a2e7a', body: [1.5, 0.85, 0.7], hip: 2.0, leg: 1.9, legR: 0.26, arm: 1.0, armR: 0.13, neck: [1.0, 0.36, 30], head: [1.0, 0.3, 0.25], teeth: true, eyeR: 0.08, tail: [4.5, 0.5], tailUp: 0.06, sail: 1.6, bands: '#f2b632', nb: 6 },
  dimetro: { col: '#c86a3a', belly: '#f0dcc4', dark: '#7a3a1a', body: [0.8, 0.35, 0.38], hip: 0.45, leg: 0.5, legR: 0.09, quad: true, sprawl: 0.35, neck: [0.15, 0.2, 10], head: [0.35, 0.18, 0.16], teeth: true, eyeR: 0.05, tail: [1.4, 0.2], tailUp: -0.02, sail: 0.9 },
  horse: { col: '#8a5a32', belly: '#a8784a', dark: '#5a3a1e', body: [1.0, 0.55, 0.42], hip: 1.15, leg: 1.2, legR: 0.08, quad: true, neck: [0.85, 0.2, 55], head: [0.42, 0.16, 0.13], eyeR: 0.04, tail: [0.6, 0.12], tailUp: -0.4, mane: '#2b1a12' },
  gray: { col: '#9a9a9a', belly: '#c8c8c8', dark: '#6a6a6a', body: [0.5, 0.34, 0.28], hip: 1.0, leg: 1.05, legR: 0.08, arm: 0.45, armR: 0.05, neck: [0.42, 0.13, 40], head: [0.3, 0.15, 0.13], teeth: true, tail: [1.6, 0.16], tailUp: 0.12 },
};
const z3Sp = (k: string) => z3Dino(Z3_SP[k]);

// ---------------- other animals
// birds: hen (the grandma's chicken), pigeon, turkey. live(t, o): peck, look, flap (angry), run
function z3Bird(kind: 'hen' | 'pigeon' | 'turkey') {
  const P = { hen: { body: '#c8783e', belly: '#e8b47a', head: '#c8783e', tail: '#4a3426', s: 0.32 }, pigeon: { body: '#a8acbc', belly: '#c4c8d4', head: '#8a8ea0', tail: '#6a6e80', s: 0.2 }, turkey: { body: '#5a3a2a', belly: '#7a523a', head: '#c8504a', tail: '#6a4a32', s: 0.45 } }[kind];
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); g.userData.ink = true; const s = P.s;
  const hx = (h: string) => new THREE.Color(h), Cb = hx(P.body), Cl = hx(P.belly);
  const bGeo = p3Blob((x, y, z) => { const f = x < 0 ? 1 + x * 0.45 : 1; return [x * s * 1.15, y * s * 0.85 * f + (x < 0 ? -x * s * 0.35 : 0), z * s * 0.78 * f]; }, (x, y) => { const c = Cb.clone().lerp(Cl, p3Smoothstep(0, -0.6, y / s)); return [c.r, c.g, c.b]; }, 40, 30);
  const bm = new THREE.Mesh(bGeo, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.8, sheen: 0.6 })); bm.castShadow = true; body.add(bm);
  (bm.material as THREE.MeshPhysicalMaterial).map = Z3_FEATHERS(); body.add(z3Sph(s * 0.45, z3Skin(P.head, 0.75), [s * 0.82, s * 0.62, 0], [0.9, 1.25, 0.85]));
  if (kind === 'pigeon') { const nk = new THREE.Mesh(new THREE.SphereGeometry(s * 0.55, 24, 16), new THREE.MeshPhysicalMaterial({ color: '#4f8a7a', roughness: 0.4, iridescence: 1, iridescenceIOR: 1.6, sheen: 1, sheenColor: new THREE.Color('#c86ad8') })); nk.position.set(s * 0.8, s * 0.55, 0); nk.scale.set(1, 1.1, 0.9); body.add(nk); }
  const head = new THREE.Group(); head.position.set(s * 1.05, s * 1.12, 0); body.add(head);
  const hm = new THREE.Mesh(new THREE.SphereGeometry(s * 0.48, 28, 20), z3Skin(P.head, 0.7)); hm.castShadow = true; head.add(hm);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(s * 0.12, s * 0.38, 12), z3Gloss(kind === 'pigeon' ? '#3a3a3a' : '#f2b232', 0.35)); beak.rotation.z = -Math.PI / 2; beak.position.set(s * 0.52, -s * 0.05, 0); head.add(beak);
  const eyes = [-1, 1].map((sd) => { const e = z3Eye(s * 0.1, P.head); e.position.set(s * 0.22, s * 0.1, sd * s * 0.32); e.rotation.y = sd * 1.1; head.add(e); return e; });
  const brows = [-1, 1].map((sd) => { const b = z3Brow(s * 0.2, z3Gloss('#1d1410', 0.3)); b.position.set(s * 0.25, s * 0.26, sd * s * 0.33); b.rotation.y = sd * 1.1; b.visible = false; head.add(b); return b; });
  if (kind === 'hen') { for (let i = 0; i < 3; i++) head.add(z3Sph(s * (0.13 - i * 0.015), z3Gloss('#e8303a', 0.35), [s * (0.15 - i * 0.14), s * (0.42 - i * 0.03), 0], [1, 1.2, 0.5])); head.add(z3Sph(s * 0.09, z3Gloss('#e8303a', 0.35), [s * 0.42, -s * 0.28, 0], [0.6, 1.3, 0.5])); }
  if (kind === 'turkey') { head.add(z3Sph(s * 0.1, z3Gloss('#e8303a', 0.35), [s * 0.4, -s * 0.3, 0], [0.5, 1.6, 0.5])); }
  const tail = new THREE.Group(); tail.position.set(-s * 1.0, s * 0.35, 0); body.add(tail);
  const nT = kind === 'turkey' ? 13 : kind === 'hen' ? 7 : 6;
  for (let i = 0; i < nT; i++) { const a = kind === 'turkey' ? -Math.PI * 0.5 + i / (nT - 1) * Math.PI : -0.4 + i * 0.12; const f = new THREE.Mesh(new THREE.CapsuleGeometry(s * (kind === 'turkey' ? 0.13 : 0.08), s * (kind === 'turkey' ? 1.3 : kind === 'hen' ? 0.8 : 0.5), 6, 10), z3Skin(i % 2 && kind === 'turkey' ? '#8a6a42' : P.tail, 0.6));
    if (kind === 'turkey') { f.position.set(-s * 0.1, Math.cos(a) * s * 0.75, Math.sin(a) * s * 0.75); f.rotation.x = a; f.scale.z = 0.3; } else { f.position.set(-s * 0.3 * Math.cos(a + 0.6), s * 0.35 + i * s * 0.03, (i - nT / 2) * s * 0.06); f.rotation.z = 0.9 + a; f.scale.z = 0.35; }
    f.castShadow = true; tail.add(f); }
  const wings = [-1, 1].map((sd) => { const wg = new THREE.Group(); wg.position.set(s * 0.1, s * 0.25, sd * s * 0.72); const m = new THREE.Mesh(p3Blob((x, y, z) => [x * s * 0.62, y * s * 0.36, z * s * 0.12]), z3Skin(kind === 'pigeon' ? '#767a8c' : P.body, 0.7)); m.position.x = -s * 0.25; m.castShadow = true; wg.add(m); body.add(wg); return wg; });
  const legs = [-1, 1].map((sd) => { const l = new THREE.Group(); l.position.set(0, -s * 0.7, sd * s * 0.3); l.add(p3Rod([0, 0, 0], [0, -s * 0.75, 0], s * 0.05, z3Mat(kind === 'pigeon' ? '#d86a6a' : '#e8b03a', 0.5))); for (const a of [-0.5, 0, 0.5]) l.add(p3Rod([0, -s * 0.75, 0], [Math.cos(a) * s * 0.3, -s * 0.78, Math.sin(a) * s * 0.3], s * 0.03, z3Mat(kind === 'pigeon' ? '#d86a6a' : '#e8b03a', 0.5))); body.add(l); return l; });
  body.position.y = s * 1.45;
  return Object.assign(g, { head, live(t: number, o: { peck?: number; look?: number; flap?: number; run?: number; angry?: boolean; turn?: number } = {}) {
    const run = o.run ?? 0, ph = t * 14 * Math.max(0.4, run), pk = o.peck ?? 0, pp = pk > 0 ? Math.max(0, Math.sin(t * 7)) ** 6 * pk : 0;
    body.position.y = s * 1.45 + (run ? Math.abs(Math.sin(ph)) * s * 0.25 : 0.01 * Math.sin(t * 3)); body.rotation.z = -pp * 0.9 - run * 0.15;
    head.rotation.set(0, (o.look ?? 0) + (o.turn ?? 0) + 0.25 * Math.sin(Math.floor(t * 1.7) * 2.3) * (1 - (o.turn ? 1 : 0)), 0.1 * Math.sin(t * 2)); head.position.x = s * 1.05 + pp * s * 0.2;
    const fl = o.flap ?? 0; wings.forEach((wg, i) => { wg.rotation.x = (i ? -1 : 1) * fl * (0.4 + 0.9 * Math.abs(Math.sin(t * 18))); });
    legs.forEach((l, i) => { l.rotation.z = run ? 0.6 * Math.sin(ph + i * Math.PI) : 0; });
    brows.forEach((b, i) => { b.visible = !!o.angry; b.rotation.x = (i ? 1 : -1) * 0.5; });
    eyes.forEach((e) => e.pose(0, 0, o.angry ? 0.35 : (t * 0.8 % 3.1 < 0.1 ? 1 : 0.1)));
    tail.rotation.z = 0.05 * Math.sin(t * 3) + (kind === 'turkey' ? 0 : 0);
  } });
}
// a pterosaur: a slim body, a long head with a crest, membrane wings that flap; live(t, flapPhase)
function z3Ptero(col = '#b8945e') {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); g.userData.ink = true; const sk = z3DSkin(col, 0.6);
  body.add(new THREE.Mesh(p3Blob((x, y, z) => [x * 0.45, y * 0.16, z * 0.15]), sk));
  const head = new THREE.Group(); head.position.set(0.5, 0.1, 0); body.add(head); head.add(new THREE.Mesh(p3Blob((x, y, z) => [x * 0.42 + 0.3, y * 0.08 * (1 - x * 0.6), z * 0.07 * (1 - x * 0.6)]), sk));
  const crest = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.5, 3), z3DSkin('#d8572e', 0.5)); crest.scale.z = 0.2; crest.position.set(-0.15, 0.2, 0); crest.rotation.z = 1.2; head.add(crest);
  const e = z3Eye(0.04, col); e.position.set(0.12, 0.05, 0.06); head.add(e); const e2 = z3Eye(0.04, col); e2.position.set(0.12, 0.05, -0.06); head.add(e2);
  const memb = new THREE.MeshPhysicalMaterial({ color: '#c8a070', roughness: 0.6, side: THREE.DoubleSide, transmission: 0.0, sheen: 0.5, map: z3Paint(128, 64, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 128, 64); c.strokeStyle = 'rgba(90,50,20,0.35)'; c.lineWidth = 2; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(0, 32); c.lineTo(128, i * 9); c.stroke(); } }) });
  const wings = [-1, 1].map((s) => { const sh = new THREE.Shape(); sh.moveTo(0.35, 0); sh.lineTo(-0.3, 0); sh.quadraticCurveTo(-0.1, 0.9, 0.1, 1.9); sh.lineTo(0.35, 0); const m = new THREE.Mesh(new THREE.ShapeGeometry(sh, 12), memb); m.castShadow = true; const p = new THREE.Group(); m.rotation.x = s * Math.PI / 2; p.add(m); p.position.z = s * 0.1; body.add(p); return { p, s }; });
  return Object.assign(g, { live(t: number, ph = 0) { const f = Math.sin(t * 6 + ph); wings.forEach(({ p, s }) => (p.rotation.x = s * (0.15 + 0.55 * f))); body.position.y = -0.12 * f; head.rotation.z = 0.08 * Math.sin(t * 2 + ph); } });
}
// a mosasaur (sea reptile): a long body with flippers and a tail fin, big jaws; and a shark
function z3Mosa() {
  const g = new THREE.Group(); g.userData.ink = true; const _g0 = g,  sk = z3DSkin('#4a6a7a', 0.5), bel = z3DSkin('#d8dccc', 0.6);
  const body = new THREE.Mesh(p3Blob((x, y, z) => [x * 2.2, y * 0.42 * (1 - 0.35 * Math.max(0, -x)), z * 0.4 * (1 - 0.35 * Math.max(0, -x))], (x, y) => { const c = new THREE.Color('#4a6a7a').lerp(new THREE.Color('#d8dccc'), p3Smoothstep(0, -0.3, y)); return [c.r, c.g, c.b]; }), new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.45, map: Z3_SCALES(), clearcoat: 0.6 })); body.castShadow = true; g.add(body);
  const tail = z3Tube(sk, 0.32, 0.05, 20); g.add(tail); const fin = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.0, 3), sk); fin.scale.z = 0.12; g.add(fin);
  const head = new THREE.Group(); head.position.set(2.0, 0.05, 0); g.add(head); head.add(new THREE.Mesh(p3Blob((x, y, z) => [x * 0.8 + 0.55, y * 0.22, z * 0.25 * (1 - x * 0.3)]), sk));
  const jaw = new THREE.Group(); jaw.position.set(0.1, -0.18, 0); head.add(jaw); jaw.add(new THREE.Mesh(p3Blob((x, y, z) => [x * 0.75 + 0.55, y * 0.1, z * 0.22]), bel));
  for (const s of [-1, 1]) for (let i = 0; i < 7; i++) { const th = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.12, 6), z3Mat('#fbf6e6', 0.4)); th.rotation.x = Math.PI; th.position.set(0.3 + i * 0.13, -0.17, s * 0.17); head.add(th); }
  const e = z3Eye(0.06, '#4a6a7a'); e.position.set(0.35, 0.12, 0.2); head.add(e);
  const flips = [[0.9, 1], [0.9, -1], [-0.8, 1], [-0.8, -1]].map(([x, s]) => { const f = new THREE.Mesh(p3Blob((xx, y, z) => [xx * 0.4, y * 0.05, z * 0.18]), sk); f.position.set(x, -0.25, s * 0.42); g.add(f); return { f, s }; });
  return Object.assign(g, { live(t: number, bite = 0) { const pts = [...Array(6)].map((_, i) => new THREE.Vector3(-1.8 - i * 0.5, 0.05 * i * Math.sin(t * 3), 0.3 * Math.sin(t * 3 - i * 0.6) * i / 5)); const c = tail.set(pts); const p = c.getPoint(1); fin.position.copy(p); fin.rotation.z = Math.PI / 2; fin.rotation.y = 0.4 * Math.sin(t * 3); jaw.rotation.z = -bite * 0.7; flips.forEach(({ f, s }, i) => (f.rotation.x = s * 0.4 * Math.sin(t * 3 + i))); } });
}
function z3Shark() { const g = new THREE.Group(), m = z3DSkin('#8a96a6', 0.5); g.add(new THREE.Mesh(p3Blob((x, y, z) => [x * 0.9, y * 0.22 * (1 - Math.abs(x) * 0.4), z * 0.2 * (1 - Math.abs(x) * 0.4)]), m)); const df = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 3), m); df.scale.z = 0.15; df.position.set(0, 0.28, 0); g.add(df); const tf = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.45, 3), m); tf.scale.z = 0.15; tf.rotation.z = Math.PI / 2; tf.position.set(-0.95, 0.05, 0); g.add(tf); const e = z3Eye(0.03, '#8a96a6'); e.position.set(0.62, 0.05, 0.12); g.add(e); return g; }
// a raccoon (3D, for comparing tails): grey body, black mask, ringed tail
function z3Raccoon() {
  const g = new THREE.Group(); g.userData.ink = true; const _g1 = g,  gm = z3Skin('#8a8a8e', 0.8);
  const bGeo = p3Blob((x, y, z) => [x * 0.38 + 0.0, y * 0.24, z * 0.22], (x, y) => { const c = new THREE.Color('#8a8a8e').lerp(new THREE.Color('#c8c4bc'), p3Smoothstep(0, -0.2, y)); return [c.r, c.g, c.b]; });
  const b = new THREE.Mesh(bGeo, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.85 })); b.position.y = 0.32; b.castShadow = true; g.add(b); 
  const head = new THREE.Group(); head.position.set(0.42, 0.45, 0); g.add(head); head.add(new THREE.Mesh(p3Blob((x, y, z) => [x * 0.17 + 0.03, y * 0.14, z * 0.15]), gm)); head.add(z3Sph(0.05, z3Gloss('#1d1410', 0.3), [0.22, -0.02, 0]));
  for (const s of [-1, 1]) { head.add(z3Sph(0.075, z3Skin('#1d1d22', 0.7), [0.09, 0.03, s * 0.08], [0.6, 0.7, 1])); const e = z3Eye(0.035, '#1d1d22'); e.position.set(0.13, 0.04, s * 0.075); e.rotation.y = s * 0.6; head.add(e); head.add(z3Sph(0.05, gm, [-0.02, 0.14, s * 0.09], [0.6, 1, 0.5])); }
  for (const [x, z] of [[0.25, 0.12], [0.25, -0.12], [-0.22, 0.12], [-0.22, -0.12]]) g.add(p3Rod([x, 0.25, z], [x, 0.0, z], 0.035, z3Skin('#3a3a40', 0.8)));
  const tail = z3Tube(new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.85, map: z3Paint(512, 64, (c) => { for (let i = 0; i < 12; i++) { c.fillStyle = i % 2 ? '#2a2a30' : '#a8a6a0'; c.fillRect(i * 43, 0, 43, 64); } }) }), 0.09, 0.05, 20); g.add(tail);
  return Object.assign(g, { live(t: number) { const pts = [...Array(5)].map((_, i) => new THREE.Vector3(-0.35 - i * 0.14, 0.4 + 0.06 * i + 0.03 * Math.sin(t * 2 - i), 0.05 * Math.sin(t * 2.4 - i * 0.7))); tail.set(pts); head.rotation.y = 0.2 * Math.sin(t * 0.9); } });
}
// a silhouette: turns every mesh of an object into flat dark ink (and back)
function z3Silhouette(o: THREE.Object3D, on: boolean, col = '#1a1420') { const ink = new THREE.MeshBasicMaterial({ color: col }); o.traverse((m) => { const mm = m as THREE.Mesh & { userData: { mat0?: THREE.Material | THREE.Material[] } }; if (!mm.isMesh) return; if (on) { if (!mm.userData.mat0) mm.userData.mat0 = mm.material; mm.material = ink; } else if (mm.userData.mat0) mm.material = mm.userData.mat0; }); }

// ---------------- props
function z3Lamp() { const g = new THREE.Group(), m = z3Gloss('#2b2f3a', 0.3); g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.06, 32), m)); g.add(p3Rod([0, 0, 0], [0, 1.4, 0], 0.025, m)); const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.32, 0.36, 32, 1, true), new THREE.MeshPhysicalMaterial({ color: '#ffd88a', roughness: 0.7, side: THREE.DoubleSide, emissive: '#ffcf70', emissiveIntensity: 0.5 })); sh.position.y = 1.45; g.add(sh); const l = new THREE.PointLight('#ffcf80', 3, 4); l.position.y = 1.35; g.add(l); return Object.assign(g, { light: l }); }
function z3Door() { const g = new THREE.Group(), fr = z3Mat('#f2efe6', 0.6); g.add(z3BoxM(0.12, 2.3, 0.15, fr, [-0.56, 1.15, 0]), z3BoxM(0.12, 2.3, 0.15, fr, [0.56, 1.15, 0]), z3BoxM(1.24, 0.12, 0.15, fr, [0, 2.3, 0])); const hinge = new THREE.Group(); hinge.position.set(-0.5, 0, 0); g.add(hinge); const panel = z3BoxM(1.0, 2.2, 0.06, z3Mat('#a8703f', 0.6), [0.5, 1.1, 0]); hinge.add(panel); for (const [x, y] of [[0.5, 1.6], [0.5, 0.6]]) hinge.add(z3BoxM(0.7, 0.7, 0.02, z3Mat('#94602f', 0.6), [x, y, 0.04])); hinge.add(z3Sph(0.05, z3Gloss('#e8c26a', 0.2), [0.88, 1.05, 0.07])); return Object.assign(g, { open(u: number) { hinge.rotation.y = -1.6 * u; } }); }
// an arm bone (forearm) with the row of little bumps where the feathers were anchored (quill knobs); .glow(u) lights them
function z3Bone() { const g = new THREE.Group(), bone = new THREE.MeshPhysicalMaterial({ color: '#e8dcc0', roughness: 0.7, sheen: 0.4 }); const shaft = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 2.2, 10, 24), bone); shaft.rotation.z = Math.PI / 2; shaft.castShadow = true; g.add(shaft); for (const s of [-1, 1]) { g.add(z3Sph(0.22, bone, [s * 1.2, 0.04, 0], [1, 0.9, 0.85])); g.add(z3Sph(0.16, bone, [s * 1.25, -0.12, 0.08])); }
  const knobM = new THREE.MeshPhysicalMaterial({ color: '#e8dcc0', roughness: 0.6, emissive: '#d4ff3a', emissiveIntensity: 0 }); for (let i = 0; i < 9; i++) g.add(z3Sph(0.045, knobM, [-0.8 + i * 0.2, 0.1, 0.09], [1, 0.8, 0.7]));
  return Object.assign(g, { glow(u: number) { knobM.emissiveIntensity = u * 1.4; } }); }
function z3Truck() { const g = new THREE.Group(), red = z3Gloss('#d8432e', 0.3), wh = z3Mat('#f2efe6', 0.6), tire = z3Mat('#22252c', 0.8); g.add(z3BoxM(4.6, 2.2, 2.2, wh, [-0.9, 1.6, 0]), z3BoxM(1.8, 1.8, 2.2, red, [2.4, 1.4, 0]), z3BoxM(0.9, 0.8, 2.0, z3Gloss('#8ec9f0', 0.1), [2.8, 1.9, 0])); for (const x of [-2.5, -0.6, 2.4]) for (const z of [-1.05, 1.05]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.35, 24), tire); t.rotation.x = Math.PI / 2; t.position.set(x, 0.45, z); t.castShadow = true; g.add(t); } return g; }
// a toy city (blocks with windows) for the giant monster
function z3ToyCity(n = 16, seed = 4) { const r = p3Rnd(seed), g = new THREE.Group(); const win = z3Paint(64, 128, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 64, 128); c.fillStyle = '#3a4a6a'; for (let y = 8; y < 128; y += 18) for (let x = 8; x < 64; x += 18) c.fillRect(x, y, 10, 10); }); const cols = ['#e8b84a', '#5ab0e8', '#e8664a', '#8ad46a', '#c88ae8'];
  for (let i = 0; i < n; i++) { const h = 0.6 + r() * 1.8, b = new THREE.Mesh(new THREE.BoxGeometry(0.6 + r() * 0.4, h, 0.6 + r() * 0.4), new THREE.MeshPhysicalMaterial({ color: cols[i % 5], map: win, roughness: 0.5 })); b.position.set((r() - 0.5) * 9, h / 2, (r() - 0.5) * 4); b.castShadow = b.receiveShadow = true; g.add(b); } return g; }
// a puddle with ripples (.ripple(t, t0) sends rings out)
function z3Puddle() { const g = new THREE.Group(); const w = new THREE.Mesh(new THREE.CircleGeometry(1.4, 48), new THREE.MeshPhysicalMaterial({ color: '#5aa0d8', roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.85 })); w.rotation.x = -Math.PI / 2; w.position.y = 0.02; g.add(w); const rings = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.0, 48), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0 })); m.rotation.x = -Math.PI / 2; m.position.y = 0.03; g.add(m); return m; });
  return Object.assign(g, { ripple(t: number, t0: number) { rings.forEach((m, i) => { const u = ((t - t0) * 1.6 - i * 0.33) % 1; const on = t > t0; m.visible = on; m.scale.setScalar(0.1 + u * 1.3); (m.material as THREE.MeshBasicMaterial).opacity = on ? (1 - u) * 0.8 : 0; }); } }); }
// a paintbrush
function z3Brush(col = '#4caf50') { const g = new THREE.Group(); g.add(p3Rod([0, 0, 0], [0, 1.0, 0], 0.04, z3Mat('#c8843a', 0.5))); g.add(z3BoxM(0.12, 0.14, 0.06, z3Gloss('#c9d3e0', 0.2), [0, -0.05, 0])); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 16), z3Mat(col, 0.6)); tip.rotation.x = Math.PI; tip.position.y = -0.22; g.add(tip); return Object.assign(g, { tip }); }
// microscope view: a round lens with the tiny colour capsules (melanosomes)
function z3Microscope() { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.12, 16, 64), z3Gloss('#2b2f3a', 0.3))); const bg = new THREE.Mesh(new THREE.CircleGeometry(1.6, 64), new THREE.MeshBasicMaterial({ color: '#f2e6c8', toneMapped: false })); bg.position.z = -0.05; g.add(bg); const r = p3Rnd(9), caps: THREE.Mesh[] = []; for (let i = 0; i < 36; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 1.35, m = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.16, 6, 10), z3Gloss(i % 3 ? '#5a3220' : '#a86a3a', 0.4)); m.position.set(Math.cos(a) * d, Math.sin(a) * d, 0.05); m.rotation.z = r() * 6.28; g.add(m); caps.push(m); } return Object.assign(g, { live(t: number) { caps.forEach((m, i) => (m.rotation.z += 0) || (m.position.z = 0.05 + 0.02 * Math.sin(t * 2 + i))); } }); }
// a nest: a mud ring with eggs
function z3Nest(eggs = 4, seed = 1) { const r = p3Rnd(seed), g = new THREE.Group(); const mud = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.28, 16, 32), new THREE.MeshPhysicalMaterial({ color: '#8a6a4a', roughness: 0.95 })); mud.rotation.x = Math.PI / 2; mud.scale.z = 0.6; mud.position.y = 0.12; mud.receiveShadow = true; g.add(mud); g.add(z3BoxM(1.2, 0.05, 1.2, z3Mat('#6a4e34', 0.95), [0, 0.03, 0])); const E = [...Array(eggs)].map((_, i) => { const a = i / eggs * 6.28 + r(), e = z3Sph(0.17, z3Mat('#f2e8d6', 0.5), [Math.cos(a) * 0.3, 0.2, Math.sin(a) * 0.3], [0.85, 1.15, 0.85]); g.add(e); return e; }); return Object.assign(g, { eggs: E }); }
function z3Bowl() { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), z3Gloss('#f2efe6', 0.2)); b.rotation.x = Math.PI; g.add(b); const soup = new THREE.Mesh(new THREE.CircleGeometry(0.23, 32), z3Mat('#e8a83a', 0.4)); soup.rotation.x = -Math.PI / 2; soup.position.y = -0.02; g.add(soup); return g; }
// a lake (water you can stand in) with reeds
function z3Lake(r = 9) { const g = new THREE.Group(); const w = new THREE.Mesh(new THREE.CircleGeometry(r, 64), new THREE.MeshPhysicalMaterial({ color: '#3a7ab8', roughness: 0.08, clearcoat: 1, transparent: true, opacity: 0.88 })); w.rotation.x = -Math.PI / 2; w.position.y = 1.6; g.add(w); const rr = p3Rnd(2); for (let i = 0; i < 40; i++) { const a = rr() * 6.28; g.add(p3Rod([Math.cos(a) * r, 0, Math.sin(a) * r], [Math.cos(a) * r + (rr() - 0.5) * 0.3, 2.2 + rr(), Math.sin(a) * r], 0.04, z3Mat('#5a8a3a', 0.8))); } return Object.assign(g, { water: w }); }
// a card with a name (ID) that can be crossed out and stamped
function z3IdCard(name: string) { const tex = z3Paint(640, 400, (c) => { c.fillStyle = '#fbf8f0'; c.fillRect(0, 0, 640, 400); c.fillStyle = '#2f7ad9'; c.fillRect(0, 0, 640, 80); c.fillStyle = '#fff'; c.font = '900 44px Inter, Arial'; c.fillText('CREDENCIAL', 30, 56); c.fillStyle = '#d8d2c2'; c.fillRect(30, 110, 180, 240); c.fillStyle = '#8a8270'; c.beginPath(); c.ellipse(120, 250, 70, 50, 0, 0, 7); c.fill(); c.fillRect(150, 150, 22, 110); c.fillStyle = '#14161d'; c.font = '900 50px Inter, Arial'; c.fillText(name, 236, 210); c.fillStyle = '#6a6a72'; c.font = '700 30px Inter, Arial'; c.fillText('Dinosaurio · cuello largo', 236, 262); });
  const fr = z3Mat('#fbf8f0', 0.6), m = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.0, 0.05), [fr, fr, fr, fr, new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, color: '#e8e4dc', fog: false }), fr] as unknown as THREE.Material); m.castShadow = true; const g = new THREE.Group(); g.add(m);
  const line = z3BoxM(2.6, 0.12, 0.04, z3Gloss('#e8303a', 0.3), [0.55, 0.0, 0.06]); g.add(line);
  const stamp = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.9), new THREE.MeshBasicMaterial({ map: z3Paint(440, 180, (c) => { c.strokeStyle = '#1fa64a'; c.lineWidth = 14; c.strokeRect(10, 10, 420, 160); c.fillStyle = '#1fa64a'; c.font = '900 64px Inter, Arial'; c.textAlign = 'center'; c.fillText('REGRESÓ', 220, 92); c.font = '900 50px Inter, Arial'; c.fillText('2015', 220, 150); }), transparent: true, toneMapped: false })); stamp.position.set(0.5, -0.25, 0.08); stamp.rotation.z = 0.18; g.add(stamp);
  return Object.assign(g, { cross(u: number) { line.scale.x = Math.max(0.001, u); line.position.x = 0.55 - 1.3 * (1 - u); line.visible = u > 0.01; }, stamp(u: number) { stamp.visible = u > 0.01; stamp.scale.setScalar(Math.max(0.001, u)); } }); }
// the giant measuring tape of time: three coloured stretches with their names (lengths ~ millions of years)
const Z3_ERAS: [string, string, number][] = [['TRIÁSICO', '#e8a03a', 51], ['JURÁSICO', '#3ab07a', 56], ['CRETÁCICO', '#3a7ad8', 79]];
function z3Tape(L = 14) { const g = new THREE.Group(), tot = Z3_ERAS.reduce((a, e) => a + e[2], 0); let x = -L / 2; const segs = Z3_ERAS.map(([name, col, my]) => { const w = L * my / tot, tex = z3Paint(512, 96, (c) => { c.fillStyle = col; c.fillRect(0, 0, 512, 96); c.fillStyle = 'rgba(0,0,0,0.25)'; for (let i = 0; i < 512; i += 16) c.fillRect(i, 0, 3, i % 64 ? 22 : 40); c.fillStyle = '#ffffff'; c.font = '900 46px Inter, Arial'; c.textAlign = 'center'; c.fillText(name, 256, 78); });
    const side = z3Mat(col, 0.5), m = new THREE.Mesh(new THREE.BoxGeometry(w - 0.06, 0.1, 1.0), [side, side, new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, color: '#dcdcdc', fog: false }), side, side, side] as unknown as THREE.Material); m.position.set(x + w / 2, 0.05, 0); m.receiveShadow = true; g.add(m); const c = x + w / 2; x += w; return { c, w, m }; }); return Object.assign(g, { segs }); }
// a world map on the floor (rough continents) and Mexico with the impact point
function z3WorldMap() { const tex = z3Paint(1024, 512, (c) => { c.fillStyle = '#3a78b8'; c.fillRect(0, 0, 1024, 512); c.fillStyle = '#8ac46a'; const poly = (p: number[][]) => { c.beginPath(); p.forEach(([lo, la], i) => { const x = (lo + 180) / 360 * 1024, y = (90 - la) / 180 * 512; if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.closePath(); c.fill(); c.strokeStyle = '#2b4a2a'; c.lineWidth = 3; c.stroke(); };
    poly([[-165, 65], [-140, 70], [-95, 72], [-75, 62], [-55, 52], [-70, 44], [-76, 35], [-81, 25], [-90, 29], [-97, 26], [-97, 19], [-87, 21], [-88, 15], [-83, 9], [-80, 8], [-92, 15], [-105, 20], [-112, 30], [-118, 34], [-124, 40], [-125, 48], [-135, 57], [-150, 60], [-165, 60]]);
    poly([[-80, 9], [-75, 11], [-62, 10], [-50, 0], [-35, -6], [-40, -22], [-48, -28], [-58, -38], [-66, -55], [-73, -50], [-71, -30], [-70, -18], [-77, -12], [-81, -3]]);
    poly([[-17, 21], [-5, 36], [10, 37], [20, 32], [32, 31], [43, 12], [51, 11], [40, -15], [35, -25], [20, -35], [15, -27], [12, -5], [8, 4], [-8, 4], [-17, 14]]);
    poly([[-10, 36], [-9, 43], [-2, 44], [0, 50], [8, 55], [20, 58], [30, 70], [60, 70], [100, 75], [140, 70], [170, 65], [140, 50], [122, 40], [120, 23], [108, 12], [100, 2], [90, 22], [78, 8], [70, 22], [57, 25], [50, 30], [35, 36], [28, 41], [12, 38], [3, 42], [-5, 36]]);
    poly([[114, -22], [122, -18], [136, -12], [146, -18], [153, -28], [150, -38], [140, -38], [130, -32], [116, -35]]); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 })); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m; }
const Z3_MX: [number, number][] = [[-117.1, 32.5], [-114.8, 32.5], [-111, 31.3], [-108.2, 31.3], [-106.5, 31.8], [-104.7, 30], [-103.3, 29], [-102, 29.8], [-100.6, 28.5], [-99.5, 27], [-97.4, 25.9], [-97.7, 24], [-97.4, 22.5], [-97.2, 20.6], [-96.2, 19.2], [-94.8, 18.5], [-92.5, 18.6], [-91.4, 18.9], [-90.7, 19.8], [-90.4, 21], [-88.2, 21.6], [-86.8, 21.4], [-87.4, 19.5], [-87.8, 18.3], [-88.9, 17.9], [-90.9, 17.8], [-91.4, 16.1], [-92.2, 14.5], [-93.9, 15.9], [-96.5, 15.7], [-98.7, 16.5], [-101, 17.5], [-103.4, 18.4], [-105.3, 20.3], [-105.2, 21.5], [-106.4, 23.2], [-108, 25], [-109.4, 26.6], [-110.6, 27.9], [-112.2, 29.3], [-113.1, 31], [-114.7, 31.7], [-114.2, 30.4], [-112.8, 28.5], [-112.2, 27.1], [-110.4, 24.2], [-109.4, 23.2], [-110.3, 23.6], [-111.5, 24.8], [-112.2, 26], [-113.4, 27.6], [-114.5, 29.6], [-115.9, 30.4]];
function z3Mexico() { const g = new THREE.Group(), sc = 0.25, cx = -102, cy = 23, sh = new THREE.Shape(); Z3_MX.forEach(([lo, la], i) => { const x = (lo - cx) * sc, y = (la - cy) * sc; if (i) sh.lineTo(x, y); else sh.moveTo(x, y); });
  const land = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.25, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2 }), z3Mat('#8ac46a', 0.7)); land.rotation.x = -Math.PI / 2; land.castShadow = land.receiveShadow = true; g.add(land);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), new THREE.MeshPhysicalMaterial({ color: '#3a78b8', roughness: 0.2, clearcoat: 0.8 })); sea.rotation.x = -Math.PI / 2; sea.position.y = -0.02; sea.receiveShadow = true; g.add(sea);
  const p = new THREE.Vector3((-89.5 - cx) * sc, 0.32, -(21.3 - cy) * sc); const dot = z3Sph(0.13, new THREE.MeshBasicMaterial({ color: '#ff3b2b' }), [p.x, p.y, p.z]); g.add(dot); const glow = new THREE.PointLight('#ff6a3d', 0, 3); glow.position.copy(p).add(new THREE.Vector3(0, 0.3, 0)); g.add(glow);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.26, 40), new THREE.MeshBasicMaterial({ color: '#ff3b2b', transparent: true })); ring.rotation.x = -Math.PI / 2; ring.position.copy(p); g.add(ring);
  return Object.assign(g, { yuc: p, pulse(t: number, on: number) { dot.scale.setScalar(Math.max(0.001, on * (1 + 0.2 * Math.sin(t * 8)))); glow.intensity = on * 4; ring.visible = on > 0.1; const u = (t * 1.2) % 1; ring.scale.setScalar(1 + u * 4); (ring.material as THREE.MeshBasicMaterial).opacity = (1 - u) * on; } }); }
// an asteroid: a rocky lump with a glowing tail
function z3Asteroid() { const g = new THREE.Group(); const rock = new THREE.Mesh(p3Blob((x, y, z) => { const n = 1 + p3Fbm3(x * 2, y * 2, z * 2) * 0.5; return [x * n, y * n, z * n]; }, (x, y, z) => { const n = p3Fbm3(x * 5, y * 5, z * 5); return [0.35 + n * 0.25, 0.3 + n * 0.2, 0.28 + n * 0.18]; }), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 })); g.add(rock);
  const fire = new THREE.Mesh(new THREE.ConeGeometry(1.1, 6, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#ff8a3a', transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false, toneMapped: false })); fire.rotation.z = Math.PI / 2; fire.position.x = -3.2; g.add(fire);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(1.3, 24, 16), new THREE.MeshBasicMaterial({ color: '#ffb060', transparent: true, opacity: 0.35, depthWrite: false, toneMapped: false })); g.add(glow); return Object.assign(g, { rock }); }
// prehistoric plants: ferns and cycads
function z3Fern(p: Vec3, s = 1, seed = 1) { const r = p3Rnd(seed), g = new THREE.Group(), m = new THREE.MeshPhysicalMaterial({ color: '#4a8a3a', roughness: 0.8, sheen: 0.5, side: THREE.DoubleSide }); for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28 + r(), f = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 1.1, 1, 4), m); const pos = f.geometry.attributes.position; for (let k = 0; k < pos.count; k++) { const y = pos.getY(k) + 0.55; pos.setZ(k, y * y * 0.35); pos.setX(k, pos.getX(k) * (1 - y * 0.7)); } f.geometry.translate(0, 0.55, 0); f.geometry.computeVertexNormals(); f.rotation.set(-0.5, a, 0, 'YXZ'); f.castShadow = true; g.add(f); } g.position.set(...p); g.scale.setScalar(s); Z3_TREES.push(g); return g; }
function z3Cycad(p: Vec3, s = 1, seed = 1) { const r = p3Rnd(seed), g = new THREE.Group(); const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 1.6, 12), new THREE.MeshPhysicalMaterial({ color: '#7a5a3a', roughness: 0.9, map: Z3_SCALES() })); trunk.position.y = 0.8; trunk.castShadow = true; g.add(trunk); const m = new THREE.MeshPhysicalMaterial({ color: '#3a7a3a', roughness: 0.8, side: THREE.DoubleSide }); for (let i = 0; i < 11; i++) { const a = i / 11 * 6.28 + r(), f = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 1.6, 1, 5), m); const pos = f.geometry.attributes.position; for (let k = 0; k < pos.count; k++) { const y = pos.getY(k) + 0.8; pos.setZ(k, y * y * 0.4); pos.setX(k, pos.getX(k) * (1 - y * 0.55)); } f.geometry.translate(0, 0.8, 0); f.geometry.computeVertexNormals(); f.rotation.set(-0.9, a, 0, 'YXZ'); f.position.y = 1.6; f.castShadow = true; g.add(f); } g.position.set(...p); g.scale.setScalar(s); Z3_TREES.push(g); return g; }

// ---------------- sets
// prehistoric land: warm sky, a volcano far away, ferns, cycads, soft hills; ash = 0..1 darkens it (the impact)
function z3Prehist(w: World, o: { dense?: number; seed?: number } = {}) {
  const hemi = new THREE.HemisphereLight('#ffe8c8', '#6a5a3a', 1.0); w.add(hemi); const sun = new THREE.DirectionalLight('#ffe0b0', 1.8); sun.position.set(-8, 12, 9); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18 }); w.add(sun);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(90, 32, 16), new THREE.MeshBasicMaterial({ map: z3Paint(64, 256, (c) => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#6aa8d8'); g.addColorStop(0.45, '#bfe0e8'); g.addColorStop(0.5, '#f2d8a8'); g.addColorStop(1, '#f2d8a8'); c.fillStyle = g; c.fillRect(0, 0, 64, 256); }), side: THREE.BackSide, fog: false, toneMapped: false })); w.add(sky);
  const geo = new THREE.PlaneGeometry(160, 120, 80, 60); geo.rotateX(-Math.PI / 2); const pos = geo.attributes.position; for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i); pos.setY(i, z < -6 ? (0.4 * Math.sin(x * 0.12) + 0.3 * Math.sin(x * 0.31 + z * 0.2)) * Math.min(1, (-z - 6) / 10) * 2 : 0); } geo.computeVertexNormals();
  const ground = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: '#8aa45a', roughness: 0.95, sheen: 0.5, sheenColor: new THREE.Color('#d8f0a0'), map: Z3_SCALES() })); ground.receiveShadow = true; w.add(ground);
  const vol = new THREE.Mesh(new THREE.ConeGeometry(14, 16, 32, 1, true), new THREE.MeshStandardMaterial({ color: '#6a5a5a', roughness: 1 })); vol.position.set(18, 6, -60); w.add(vol); const smoke = [0, 1, 2].map((i) => { const s = z3Sph(3 + i, new THREE.MeshStandardMaterial({ color: '#c8c0b8', transparent: true, opacity: 0.6, roughness: 1 }), [18 + i * 2, 15 + i * 4, -60]); w.add(s); return s; });
  const r = p3Rnd(o.seed ?? 3), n = Math.round(30 * (o.dense ?? 1)); for (let i = 0; i < n; i++) { const x = (r() - 0.5) * 50, z = -4 - r() * 30; w.add(r() > 0.45 ? z3Fern([x, 0, z], 0.9 + r() * 1.2, i) : z3Cycad([x, 0, z], 0.9 + r() * 1.3, i)); }
  for (let i = 0; i < 8; i++) w.add(z3Fern([(r() - 0.5) * 16, 0, 2 + r() * 3], 0.7 + r() * 0.5, 50 + i));
  w.scene.fog = new THREE.Fog('#e8d8b8', 28, 95);
  return { sun, hemi, pose(t: number, ash = 0) { smoke.forEach((s, i) => { s.position.y = 15 + i * 4 + Math.sin(t * 0.3 + i) * 0.5; }); (w.scene.fog as THREE.Fog).color.set('#e8d8b8').lerp(new THREE.Color('#2a2420'), ash); (w.scene.fog as THREE.Fog).near = 28 - ash * 24; (w.scene.fog as THREE.Fog).far = 95 - ash * 70; sun.intensity = 1.8 * (1 - ash * 0.85); hemi.intensity = 1.0 * (1 - ash * 0.7); (sky.material as THREE.MeshBasicMaterial).color.set('#ffffff').lerp(new THREE.Color('#2a2420'), ash); } };
}
// the park (today): grass, trees, a bench, a path
function z3Park(w: World) {
  w.add(new THREE.HemisphereLight('#e8f4ff', '#6a8a4a', 1.0)); const sun = new THREE.DirectionalLight('#fff0d8', 1.7); sun.position.set(-6, 10, 8); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 }); w.add(sun);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(80, 32, 16), new THREE.MeshBasicMaterial({ map: z3Paint(64, 256, (c) => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#5aa8e8'); g.addColorStop(0.5, '#cfe8f8'); g.addColorStop(1, '#cfe8f8'); c.fillStyle = g; c.fillRect(0, 0, 64, 256); }), side: THREE.BackSide, fog: false, toneMapped: false })); w.add(sky);
  w.add(p3Ground('#7ab84a', 0)); const path = new THREE.Mesh(new THREE.PlaneGeometry(60, 2.4), z3Mat('#d8c8a8', 0.9)); path.rotation.x = -Math.PI / 2; path.position.set(0, 0.01, 1.5); path.receiveShadow = true; w.add(path);
  w.add(z3Forest(18, 5, -9, 50)); const wood = z3Mat('#a8703f', 0.6), iron = z3Gloss('#2b2f3a', 0.3); w.add(z3Grp([2.8, 0, -1.4], z3BoxM(2.2, 0.08, 0.5, wood, [0, 0.55, 0]), z3BoxM(2.2, 0.5, 0.07, wood, [0, 0.9, -0.24]), z3BoxM(0.08, 0.55, 0.5, iron, [-1.0, 0.28, 0]), z3BoxM(0.08, 0.55, 0.5, iron, [1.0, 0.28, 0])));
  w.scene.fog = new THREE.Fog('#cfe8f8', 25, 80); return { pose(_t: number) {} };
}
// the sea (for the mosasaur): a waving surface and sky
function z3Sea(w: World) {
  w.add(new THREE.HemisphereLight('#e8f4ff', '#2a5a7a', 1.0)); const sun = new THREE.DirectionalLight('#fff0d8', 1.8); sun.position.set(-6, 10, 8); w.add(sun);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(80, 32, 16), new THREE.MeshBasicMaterial({ map: z3Paint(64, 256, (c) => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#4a98d8'); g.addColorStop(0.5, '#d8eef8'); g.addColorStop(1, '#2a6a9a'); c.fillStyle = g; c.fillRect(0, 0, 64, 256); }), side: THREE.BackSide, fog: false, toneMapped: false })); w.add(sky);
  const geo = new THREE.PlaneGeometry(120, 80, 120, 80); geo.rotateX(-Math.PI / 2); const sea = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: '#2a78b0', roughness: 0.12, clearcoat: 1, transparent: true, opacity: 0.92 })); w.add(sea); const pos = geo.attributes.position, base = Float32Array.from(pos.array as Float32Array);
  w.scene.fog = new THREE.Fog('#bfe0f0', 30, 90);
  return { pose(t: number) { for (let i = 0; i < pos.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; pos.setY(i, 0.18 * Math.sin(x * 0.5 + t * 1.6) + 0.12 * Math.sin(z * 0.7 + t * 1.2)); } pos.needsUpdate = true; geo.computeVertexNormals(); } };
}
// a dark "map table" for the maps (Mexico, world), lit from above
function z3MapSet(w: World) { w.add(new THREE.HemisphereLight('#e8f0ff', '#2a3040', 1.0)); const key = new THREE.DirectionalLight('#fff4e0', 1.6); key.position.set(-4, 10, 6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 }); w.add(key); w.scene.fog = new THREE.Fog('#10121a', 20, 50); return { pose(_t: number) {} }; }
// a seesaw (subibaja) to show the balance of the T. rex
function z3Seesaw() { const g = new THREE.Group(); const tri = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.6, 3), z3Mat('#e8a03a', 0.5)); tri.position.y = 0.3; g.add(tri); const plank = new THREE.Group(); plank.position.y = 0.62; g.add(plank); plank.add(z3BoxM(3.0, 0.1, 0.5, z3Mat('#3a7ad8', 0.5)), z3Sph(0.22, z3Gloss('#ff3b2b', 0.3), [-1.35, 0.25, 0]), z3Sph(0.22, z3Gloss('#ff3b2b', 0.3), [1.35, 0.25, 0])); return Object.assign(g, { tilt(a: number) { plank.rotation.z = a; } }); }
// three-toed footprints in mud, pressed along a path (n prints)
function z3Prints(n = 6, step = 1.6) { const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: '#5a4430', roughness: 1 }); const toe = (x: number, z: number, a: number) => { const t = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.45, 6, 10), m); t.rotation.set(-Math.PI / 2, 0, a); t.position.set(x, 0.015, z); t.scale.z = 0.15; return t; };
  const prints = [...Array(n)].map((_, i) => { const p = new THREE.Group(); const s = i % 2 ? 1 : -1; p.position.set(-((n - 1) * step) / 2 + i * step, 0, s * 0.35); for (const a of [-0.45, 0, 0.45]) p.add(toe(Math.cos(a) * 0.3, Math.sin(a) * 0.3, -Math.PI / 2 + a)); const heel = new THREE.Mesh(new THREE.CircleGeometry(0.18, 20), m); heel.rotation.x = -Math.PI / 2; heel.position.set(-0.05, 0.016, 0); p.add(heel); g.add(p); return p; }); return Object.assign(g, { prints }); }
// leaves held in a mouth (food for the babies)
function z3Leaves() { const g = new THREE.Group(), m = new THREE.MeshPhysicalMaterial({ color: '#4a9a3a', roughness: 0.7, side: THREE.DoubleSide }); for (let i = 0; i < 6; i++) { const l = new THREE.Mesh(new THREE.CircleGeometry(0.16, 12), m); l.scale.set(1, 0.45, 1); l.position.set(0.05 * i, 0.03 * Math.sin(i), (i - 3) * 0.05); l.rotation.set(i, i * 2, i * 0.5); g.add(l); } return g; }
// a spit blob (the invented venom)
function z3Spit() { const m = new THREE.MeshPhysicalMaterial({ color: '#9ae84a', roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.9 }); const g = new THREE.Group(); for (let i = 0; i < 6; i++) g.add(z3Sph(0.06 + i * 0.012, m, [-i * 0.08, 0, 0])); return g; }
// vision cones from the eyes (what the T. rex sees, both eyes overlap: depth)
function z3Vision(L = 6) { const g = new THREE.Group(); for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.ConeGeometry(L * 0.35, L, 32, 1, true), new THREE.MeshBasicMaterial({ color: '#d4ff3a', transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false, toneMapped: false })); c.rotation.z = Math.PI / 2; c.position.set(L / 2, 0, s * 0.12); c.rotation.y = s * 0.1; g.add(c); } return g; }
// a timeline bar (left = old, right = today) on the floor
function z3Timeline(L = 22) { const g = new THREE.Group(); g.add(z3BoxM(L, 0.12, 0.6, z3Mat('#2b2f3a', 0.5), [0, 0.06, 0])); for (let i = 0; i <= 22; i++) g.add(z3BoxM(0.04, 0.14, 0.62, z3Mat('#d4ff3a', 0.4), [-L / 2 + i * L / 22, 0.07, 0])); return g; }

// =====================================================================
//  ILLUSTRATED LOOK (from the user's reference): every 3D thing gets flat toon shading in three tones, halftone dots in
//  its shadows, a soft rim of light and a cream outline around its silhouette. z3Ink(root) converts a built scene once.
// =====================================================================
const Z3_TONES = (() => { const d = new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 3, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
function z3ToonMat(src: THREE.Material) {
  const s = src as THREE.MeshStandardMaterial;
  const m = new THREE.MeshToonMaterial({ color: s.color ? s.color.clone() : new THREE.Color('#ffffff'), map: s.map || null, vertexColors: !!s.vertexColors, gradientMap: Z3_TONES, transparent: s.transparent, opacity: s.opacity, side: s.side, emissive: (s as THREE.MeshStandardMaterial).emissive ? (s as THREE.MeshStandardMaterial).emissive.clone() : new THREE.Color('#000000'), emissiveIntensity: (s as THREE.MeshStandardMaterial).emissiveIntensity ?? 1 });
  if (m.map) { m.map = m.map.clone(); m.map.needsUpdate = true; m.color.multiplyScalar(1.0); }
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>', `
      { float base = max(0.02, dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114))), lin = dot(outgoingLight, vec3(0.299, 0.587, 0.114)) / base;
        vec2 q = mat2(0.7071, -0.7071, 0.7071, 0.7071) * gl_FragCoord.xy / 7.0; float dd = length(fract(q) - 0.5), rad = clamp((0.95 - lin) * 0.75, 0.0, 0.5);
        outgoingLight = mix(outgoingLight, outgoingLight * 0.62, 1.0 - smoothstep(rad - 0.04, rad + 0.04, dd));
        float rim = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), 3.0); outgoingLight += diffuseColor.rgb * rim * 0.35; }
      #include <opaque_fragment>`);
  };
  m.customProgramCacheKey = () => 'z3toon'; return m;
}
const Z3_OUTLINE = new THREE.MeshBasicMaterial({ color: '#f6efe0', side: THREE.BackSide, toneMapped: false });
Z3_OUTLINE.onBeforeCompile = (sh) => { sh.uniforms.uW = { value: 0.02 }; sh.vertexShader = 'uniform float uW;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n transformed += normalize(normal) * uW * (1.0 + length((modelViewMatrix * vec4(transformed, 1.0)).xyz) * 0.06);'); };
// convert every lit material under root; add the outline to meshes of things marked ink (animals, dinosaurs, props)
function z3Ink(root: THREE.Object3D) {
  const done = new Map<THREE.Material, THREE.Material>();
  root.traverse((o) => {
    const m = o as THREE.Mesh; if (!m.isMesh || m.userData.z3ink) return; m.userData.z3ink = true; const mat = m.material as THREE.Material;
    if (Array.isArray(m.material) || !mat || Object.prototype.hasOwnProperty.call(mat, 'onBeforeCompile')) return;   // multi-material cards, fur shells: keep
    if (!(mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) return;
    let nm = done.get(mat); if (!nm) { nm = z3ToonMat(mat); done.set(mat, nm); } m.material = nm;
    let p: THREE.Object3D | null = m, ink = false; while (p) { if (p.userData.ink) { ink = true; break; } p = p.parent; }
    if (ink && !mat.transparent && m.geometry && (m.geometry.attributes.position?.count ?? 0) > 20) { const ol = new THREE.Mesh(m.geometry, Z3_OUTLINE); ol.userData.z3ink = true; ol.castShadow = false; ol.renderOrder = -1; m.add(ol); }
  });
}
