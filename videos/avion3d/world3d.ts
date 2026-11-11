// =====================================================================
//  World of "Cómo funciona un avión" in 3D (Idio-two): Tico and Dota in 3D, the board plane that turns into the
//  IDIO-TWO light plane piece by piece, the wing in cut, props, the cabin and the sets. Names start with "a3".
//  Everything is posed from t (absolute video seconds): no clocks, no randomness, nothing that accumulates.
// =====================================================================
const A3 = { ink: '#14161d', paper: '#f2efe6', lime: '#c8f53a', orange: '#ff6a3d', sky: '#8ec9f0', night: '#10121a', cream: '#fff3d6' };
const a3Mat = (c: string, r = 0.55, e = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0, emissive: e ? c : '#000000', emissiveIntensity: e });
const a3Sph = (r: number, mat: THREE.Material, p: Vec3, s: Vec3 = [1, 1, 1]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 18), mat); m.position.set(...p); m.scale.set(...s); m.castShadow = m.receiveShadow = true; return m; };
const a3BoxM = (w: number, h: number, d: number, mat: THREE.Material, p: Vec3 = [0, 0, 0], r: Vec3 = [0, 0, 0]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(...p); m.rotation.set(...r); m.castShadow = m.receiveShadow = true; return m; };
const a3Grp = (p: Vec3 = [0, 0, 0], ...kids: THREE.Object3D[]) => { const g = new THREE.Group(); g.position.set(...p); if (kids.length) g.add(...kids); return g; };
// a limb: rod + round joints at both ends
const a3Limb = (a: number[], b: number[], r: number, mat: THREE.Material) => a3Grp([0, 0, 0], p3Rod(a, b, r, mat, 14), a3Sph(r, mat, [a[0], a[1], a[2]]), a3Sph(r, mat, [b[0], b[1], b[2]]));
// who talks when, and small life helpers
const A3_TICO: [number, number][] = [[0.1, 9.28], [12.25, 36.19], [38.72, 99.54], [103.43, 109.55], [113.5, 146.3]];
const A3_DOTA: [number, number][] = [[10.02, 11.49], [36.88, 38.22], [100.18, 102.54], [110.08, 112.76], [146.93, 151.21]];
const a3Mouth = (t: number, who: 'tico' | 'dota') => (who === 'tico' ? A3_TICO : A3_DOTA).some(([a, b]) => t > a && t < b) ? 0.55 + 0.45 * Math.sin(t * 25) : 0;
const a3Blink = (t: number, seed = 0) => (((t + seed) % 2.7) < 0.11 ? 0.12 : 1);

// ---------------- Tico: tall dark-brown monkey, round glasses, blue t-shirt. Feet at y = 0, facing +z.
type A3TicoPose = 'cross' | 'point' | 'palm' | 'hold';
function a3Tico() {
  const B = a3Mat('#5a3a2b'), C = a3Mat('#f3d9b1'), C2 = a3Mat('#f8e6c8'), SH = a3Mat('#3270e6', 0.7), O = a3Mat('#1d1410', 0.4), W = a3Mat('#eaf2fb', 0.2), Y = a3Mat('#ffd23d', 0.4, 0.6), G = a3Mat('#c9ced8', 0.4);
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  body.add(a3Limb([-0.13, 0.1, 0], [-0.13, 0.55, 0], 0.1, B), a3Limb([0.13, 0.1, 0], [0.13, 0.55, 0], 0.1, B));
  body.add(a3Sph(0.13, C, [-0.14, 0.05, 0.07], [1, 0.5, 1.5]), a3Sph(0.13, C, [0.14, 0.05, 0.07], [1, 0.5, 1.5]));
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.33, 0.42, 10, 24), SH); torso.position.set(0, 0.96, 0); torso.scale.set(1, 1, 0.8); torso.castShadow = true; body.add(torso);
  const arms: Record<A3TicoPose, THREE.Group> = {
    cross: a3Grp([0, 0, 0], a3Limb([-0.36, 1.2, 0], [-0.3, 0.98, 0.26], 0.085, B), a3Limb([-0.3, 0.98, 0.26], [0.22, 1.05, 0.34], 0.075, B), a3Limb([0.36, 1.2, 0], [0.3, 0.95, 0.24], 0.085, B), a3Limb([0.3, 0.95, 0.24], [-0.22, 1.0, 0.36], 0.075, B)),
    point: a3Grp([0, 0, 0], a3Limb([-0.36, 1.2, 0], [-0.46, 0.92, 0.05], 0.085, B), a3Limb([-0.46, 0.92, 0.05], [-0.5, 0.66, 0.08], 0.075, B), a3Limb([0.36, 1.2, 0], [0.62, 1.42, 0.12], 0.085, B), a3Limb([0.62, 1.42, 0.12], [0.82, 1.7, 0.2], 0.075, B), a3Limb([0.82, 1.7, 0.2], [0.9, 1.84, 0.24], 0.035, B)),
    palm: a3Grp([0, 0, 0], a3Limb([-0.36, 1.2, 0], [-0.46, 0.92, 0.05], 0.085, B), a3Limb([-0.46, 0.92, 0.05], [-0.5, 0.66, 0.08], 0.075, B), a3Limb([0.36, 1.2, 0], [0.5, 1.48, 0.3], 0.085, B), a3Limb([0.5, 1.48, 0.3], [0.05, 1.98, 0.48], 0.075, B), a3Sph(0.13, B, [0.02, 2.0, 0.5], [1.3, 0.8, 0.6])),
    hold: a3Grp([0, 0, 0], a3Limb([-0.36, 1.2, 0], [-0.42, 0.92, 0.2], 0.085, B), a3Limb([-0.42, 0.92, 0.2], [-0.14, 0.86, 0.42], 0.075, B), a3Limb([0.36, 1.2, 0], [0.42, 0.92, 0.2], 0.085, B), a3Limb([0.42, 0.92, 0.2], [0.14, 0.86, 0.42], 0.075, B)),
  };
  for (const k in arms) body.add(arms[k as A3TicoPose]);
  const head = a3Grp([0, 1.74, 0]); body.add(head);
  head.add(a3Sph(0.46, B, [0, 0, 0]), a3Sph(0.16, B, [-0.47, 0, -0.02]), a3Sph(0.16, B, [0.47, 0, -0.02]), a3Sph(0.09, C, [-0.52, 0, 0.05], [1, 1, 0.4]), a3Sph(0.09, C, [0.52, 0, 0.05], [1, 1, 0.4]));
  head.add(a3Sph(0.38, C, [0, -0.06, 0.2], [1, 1, 0.62]), a3Sph(0.2, C2, [0, -0.22, 0.38], [1.15, 0.72, 0.62]), a3Sph(0.024, O, [-0.045, -0.15, 0.5]), a3Sph(0.024, O, [0.045, -0.15, 0.5]));
  const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 12), B); tuft.position.set(0, 0.5, 0.02); head.add(tuft);
  const eyes = a3Grp([0, 0.05, 0]); head.add(eyes);
  for (const sx of [-1, 1]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.026, 12, 32), O); ring.position.set(sx * 0.17, 0.05, 0.47); head.add(ring);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.13, 28), W); lens.position.set(sx * 0.17, 0.05, 0.465); head.add(lens);
    eyes.add(a3Sph(0.045, O, [sx * 0.17 + 0.01, 0.0, 0.49]));
    const brow = a3BoxM(0.2, 0.035, 0.04, O, [sx * 0.18, 0.27, 0.44], [0, 0, -sx * 0.2]); head.add(brow);
  }
  head.add(p3Rod([-0.035, 0.06, 0.48], [0.035, 0.06, 0.48], 0.018, O), p3Rod([-0.31, 0.06, 0.42], [-0.44, 0.06, 0.05], 0.015, O), p3Rod([0.31, 0.06, 0.42], [0.44, 0.06, 0.05], 0.015, O));
  const smirk = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.016, 8, 20, Math.PI), O); smirk.position.set(0, -0.28, 0.5); smirk.rotation.z = Math.PI; head.add(smirk);
  const talk = a3Sph(0.07, a3Mat('#6b1a1a', 0.5), [0, -0.3, 0.49], [1.1, 0.6, 0.5]); head.add(talk);
  const bulb = a3Grp([0, 0.85, 0], a3Sph(0.16, Y, [0, 0.05, 0]), new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 16), G)); (bulb.children[1] as THREE.Mesh).position.y = -0.14; head.add(bulb); bulb.visible = false;
  let pose: A3TicoPose = 'cross';
  const set = (p: A3TicoPose) => { pose = p; for (const k in arms) arms[k as A3TicoPose].visible = k === p; };
  set('cross');
  return Object.assign(g, {
    head, bulb, setPose: set,
    // life at time t: breathing, a slow head bob, blinks, the mouth when he talks, and a nod while talking
    live(t: number, seed = 0) {
      const m = a3Mouth(t, 'tico');
      body.scale.set(1 - 0.01 * Math.sin(t * 6.5 + seed), 1 + 0.02 * Math.sin(t * 6.5 + seed), 1);
      head.rotation.z = 0.05 * Math.sin(t * 2.2 + seed); head.rotation.x = m ? 0.06 * Math.sin(t * 11) : 0;
      eyes.scale.y = a3Blink(t, seed);
      talk.visible = m > 0; smirk.visible = !talk.visible; talk.scale.y = 0.25 + 0.5 * m;
      void pose;
    },
  });
}

// ---------------- Dota: small light-brown monkey, huge head, three tufts, yellow t-shirt, bandage. Feet at y = 0, facing +z.
type A3DotaPose = 'up' | 'down' | 'hug' | 'reach';
function a3Dota() {
  const B = a3Mat('#c97b3d'), C = a3Mat('#f2d2a6'), C2 = a3Mat('#f8e3c4'), SH = a3Mat('#ffc83d', 0.65), O = a3Mat('#1d1410', 0.4), W = a3Mat('#ffffff', 0.3), BA = a3Mat('#f0b088', 0.7), MO = a3Mat('#6b1a1a', 0.5), PK = a3Mat('#ff8fa3', 0.5), BU = a3Mat('#ff8f8f', 0.4), ST = a3Mat('#ffd23d', 0.4, 0.5), BL = a3Mat('#5a3d7a', 0.6);
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  body.add(a3Limb([-0.1, 0.08, 0], [-0.1, 0.32, 0], 0.075, B), a3Limb([0.1, 0.08, 0], [0.1, 0.32, 0], 0.075, B), a3Sph(0.11, C, [-0.12, 0.04, 0.06], [1, 0.5, 1.5]), a3Sph(0.11, C, [0.12, 0.04, 0.06], [1, 0.5, 1.5]));
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 0.2, 10, 24), SH); torso.position.set(0, 0.55, 0); torso.scale.set(1, 1, 0.85); torso.castShadow = true; body.add(torso);
  const arms: Record<A3DotaPose, THREE.Group> = {
    up: a3Grp([0, 0, 0], a3Limb([-0.24, 0.7, 0], [-0.42, 0.92, 0.04], 0.065, B), a3Limb([-0.42, 0.92, 0.04], [-0.5, 1.16, 0.06], 0.06, B), a3Limb([0.24, 0.7, 0], [0.42, 0.92, 0.04], 0.065, B), a3Limb([0.42, 0.92, 0.04], [0.5, 1.16, 0.06], 0.06, B)),
    down: a3Grp([0, 0, 0], a3Limb([-0.25, 0.68, 0], [-0.32, 0.46, 0.04], 0.065, B), a3Limb([-0.32, 0.46, 0.04], [-0.33, 0.3, 0.08], 0.06, B), a3Limb([0.25, 0.68, 0], [0.32, 0.46, 0.04], 0.065, B), a3Limb([0.32, 0.46, 0.04], [0.33, 0.3, 0.08], 0.06, B)),
    hug: a3Grp([0, 0, 0], a3Limb([-0.25, 0.68, 0], [-0.3, 0.52, 0.22], 0.065, B), a3Limb([-0.3, 0.52, 0.22], [-0.1, 0.5, 0.36], 0.06, B), a3Limb([0.25, 0.68, 0], [0.3, 0.52, 0.22], 0.065, B), a3Limb([0.3, 0.52, 0.22], [0.1, 0.5, 0.36], 0.06, B)),
    reach: a3Grp([0, 0, 0], a3Limb([-0.25, 0.68, 0], [-0.32, 0.46, 0.04], 0.065, B), a3Limb([-0.32, 0.46, 0.04], [-0.33, 0.3, 0.08], 0.06, B), a3Limb([0.24, 0.7, 0], [0.52, 0.72, 0.1], 0.065, B), a3Limb([0.52, 0.72, 0.1], [0.8, 0.7, 0.18], 0.06, B)),
  };
  for (const k in arms) body.add(arms[k as A3DotaPose]);
  const head = a3Grp([0, 1.12, 0]); body.add(head);
  head.add(a3Sph(0.5, B, [0, 0, 0]), a3Sph(0.17, B, [-0.5, 0, 0]), a3Sph(0.17, B, [0.5, 0, 0]), a3Sph(0.09, C, [-0.55, 0, 0.06], [1, 1, 0.4]), a3Sph(0.09, C, [0.55, 0, 0.06], [1, 1, 0.4]));
  for (const [x, rz] of [[-0.16, 0.4], [0, 0], [0.16, -0.4]]) { const tf = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.24, 12), B); tf.position.set(x, 0.52, 0.05); tf.rotation.z = rz; head.add(tf); }
  head.add(a3Sph(0.4, C, [0, -0.06, 0.24], [1, 0.95, 0.6]), a3Sph(0.22, C2, [0, -0.24, 0.42], [1.1, 0.7, 0.6]));
  const black = a3Sph(0.16, BL, [0.17, 0.08, 0.4], [1, 1, 0.4]); head.add(black); black.visible = false;
  head.add(a3Sph(0.13, W, [-0.17, 0.08, 0.44], [1, 1, 0.55]), a3Sph(0.13, W, [0.17, 0.08, 0.44], [1, 1, 0.55]));
  const ok = a3Grp([0, 0, 0], a3Sph(0.055, O, [-0.17, 0.07, 0.52]), a3Sph(0.055, O, [0.17, 0.07, 0.52]));
  const crazy = a3Grp([0, 0, 0], a3Sph(0.055, O, [-0.13, 0.04, 0.52]), a3Sph(0.055, O, [0.2, 0.14, 0.51])); crazy.visible = false;
  const eyes = a3Grp([0, 0, 0], ok, crazy); head.add(eyes);
  head.add(a3BoxM(0.18, 0.03, 0.04, O, [-0.18, 0.27, 0.46], [0, 0, 0.1]), a3BoxM(0.18, 0.03, 0.04, O, [0.18, 0.28, 0.46], [0, 0, -0.25]));
  head.add(a3BoxM(0.24, 0.08, 0.05, BA, [0.06, -0.08, 0.6], [0, 0, -0.5]));
  const mouth = a3Grp([0, -0.3, 0.52], a3Sph(0.09, MO, [0, 0, 0], [1, 1.1, 0.4]), a3Sph(0.05, PK, [0, -0.04, 0.03], [1.1, 0.6, 0.4])); head.add(mouth);
  const bump = a3Sph(0.12, BU, [-0.18, 0.45, 0.15]); head.add(bump); bump.visible = false;
  const starGeo = p3Extruded([...Array(10)].map((_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.045 : 0.1; return [Math.cos(a) * r, Math.sin(a) * r]; }), 0.04);
  const stars = a3Grp([0, 0.7, 0], ...[0, 1, 2].map((i) => { const m = new THREE.Mesh(starGeo, ST); m.position.set(Math.cos(i * 2.1) * 0.45, 0, Math.sin(i * 2.1) * 0.45); return m; })); head.add(stars); stars.visible = false;
  const set = (p: A3DotaPose) => { for (const k in arms) arms[k as A3DotaPose].visible = k === p; };
  set('up');
  return Object.assign(g, {
    head, bump, black, setPose: set,
    crazy(on: boolean) { ok.visible = !on; crazy.visible = on; },
    dizzy(t: number, on: boolean) { stars.visible = on; stars.rotation.y = t * 3; },
    live(t: number, seed = 1.3) {
      const m = a3Mouth(t, 'dota');
      body.scale.set(1 - 0.015 * Math.sin(t * 9 + seed), 1 + 0.03 * Math.sin(t * 9 + seed), 1);
      head.rotation.z = 0.07 * Math.sin(t * 2.6 + seed); head.position.y = 1.12 + (m ? 0.03 * Math.abs(Math.sin(t * 9)) : 0);
      eyes.scale.y = a3Blink(t, seed);
      mouth.scale.y = 0.85 + 0.6 * m;
    },
  });
}

// ---------------- the IDIO-TWO light plane (nose +x, wings along z) that grows out of the board plane.
// stage (can be fractional while it changes): 0 board · 1 real wings + struts · 2 fuselage · 3 windows · 4 stripe + gear · 5 livery
// parts: eng (cowling + prop), stab, elev, fin, rud, ail, flap. .glow(part, u) paints a part lime.
type A3Part = 'eng' | 'stab' | 'elev' | 'fin' | 'rud' | 'ail' | 'flap';
const a3Label = (text: string, w = 1024, h = 220, fg = '#1b3fb0', bg = '') => p3Paint(w, h, (c) => { if (bg) { c.fillStyle = bg; c.fillRect(0, 0, w, h); } c.font = `italic 900 ${h * 0.62}px Inter, Arial, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = h * 0.08; c.strokeStyle = '#ffffff'; c.strokeText(text, w / 2, h / 2); c.fillStyle = fg; c.fillText(text, w / 2, h / 2); });
function a3Plane() {
  const white = a3Mat('#f4f6fa', 0.45), wood = a3Mat('#c98a4b', 0.8), balsa = a3Mat('#ead0a0', 0.8), orange = a3Mat('#ff7a3d', 0.5), blue = a3Mat('#1b3fb0', 0.5), dark = a3Mat('#22334f', 0.25), glass = a3Mat('#7cc0f5', 0.15, 0.25), metal = a3Mat('#b8c0cf', 0.4), tire = a3Mat('#2b2f3a', 0.8);
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const L: Record<string, THREE.Object3D> = {}, P: Record<A3Part, THREE.Group> = {} as Record<A3Part, THREE.Group>, PM: Record<A3Part, THREE.MeshStandardMaterial[]> = {} as Record<A3Part, THREE.MeshStandardMaterial[]>;
  const part = (k: A3Part, mats: THREE.MeshStandardMaterial[], ...kids: THREE.Object3D[]) => { const gg = a3Grp([0, 0, 0], ...kids); P[k] = gg; PM[k] = mats; body.add(gg); return gg; };
  // stage 0: the plank and the balsa board wing
  L.plank = a3BoxM(7, 0.3, 0.5, wood, [0, 0, 0]); body.add(L.plank);
  L.boardW = a3BoxM(1.4, 0.07, 8.4, balsa, [0.5, 0.25, 0]); body.add(L.boardW);
  // stage 1: real high wing with orange tips and struts
  const wing = a3Grp([0.6, 0.72, 0], a3BoxM(1.5, 0.1, 9.6, white), a3BoxM(1.5, 0.11, 0.5, orange, [0, 0, 4.6]), a3BoxM(1.5, 0.11, 0.5, orange, [0, 0, -4.6]));
  L.wing = wing; body.add(wing);
  L.strut = a3Grp([0, 0, 0], p3Rod([0.4, -0.2, 0.5], [0.6, 0.66, 2.3], 0.04, metal), p3Rod([0.4, -0.2, -0.5], [0.6, 0.66, -2.3], 0.04, metal)); body.add(L.strut);
  // stage 2: the fuselage (a lathe, nose +x)
  const prof = [[0.001, -3.6], [0.14, -3.5], [0.3, -2.4], [0.5, -1.0], [0.58, 0.2], [0.6, 1.4], [0.56, 2.4], [0.5, 2.9], [0.001, 2.95]].map(([r, y]) => new THREE.Vector2(r, y));
  const fus = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), white); fus.rotation.z = -Math.PI / 2; fus.castShadow = fus.receiveShadow = true;
  L.fus = a3Grp([0, 0.12, 0], fus); body.add(L.fus);
  // stage 3: windshield and side windows
  L.wins = a3Grp([0, 0.12, 0], a3BoxM(0.5, 0.34, 1.0, glass, [2.15, 0.38, 0], [0, 0, 0.75]), a3BoxM(0.55, 0.28, 1.2, glass, [1.3, 0.34, 0]), a3BoxM(0.5, 0.26, 1.18, glass, [0.6, 0.32, 0])); body.add(L.wins);
  // stage 4: stripe and landing gear
  L.stripe = a3Grp([0, 0.12, 0], a3BoxM(5.6, 0.1, 1.22, orange, [0.1, -0.12, 0]), a3BoxM(5.2, 0.05, 1.2, blue, [0.3, -0.26, 0])); body.add(L.stripe);
  const wheel = (x: number, z: number, r: number) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.16, 20), tire); m.rotation.x = Math.PI / 2; m.position.set(x, -0.95, z); m.castShadow = true; return m; };
  L.gear = a3Grp([0, 0, 0], p3Rod([1.0, -0.3, 0.3], [1.0, -0.9, 0.75], 0.05, metal), p3Rod([1.0, -0.3, -0.3], [1.0, -0.9, -0.75], 0.05, metal), p3Rod([2.6, -0.3, 0], [2.7, -0.95, 0], 0.05, metal), wheel(1.0, 0.82, 0.24), wheel(1.0, -0.82, 0.24), wheel(2.7, 0, 0.18)); body.add(L.gear);
  // stage 5: the IDIO-TWO livery on both sides and the logo on the fin
  const name = a3Label('IDIO-TWO'), logo = p3Paint(256, 256, (c) => { c.fillStyle = '#ff7a3d'; c.beginPath(); c.arc(128, 128, 118, 0, 7); c.fill(); c.lineWidth = 16; c.strokeStyle = '#fff'; c.stroke(); c.fillStyle = '#fff'; c.font = '900 140px Inter, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('i2', 128, 136); });
  const decal = (tex: THREE.Texture, w: number, h: number, p: Vec3, ry: number) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.5 })); m.position.set(...p); m.rotation.y = ry; return m; };
  L.livery = a3Grp([0, 0, 0], decal(name, 2.4, 0.52, [-1.0, 0.22, 0.56], 0), decal(name, 2.4, 0.52, [-1.0, 0.22, -0.56], Math.PI), decal(logo, 0.55, 0.55, [-3.25, 0.95, 0.06], 0), decal(logo, 0.55, 0.55, [-3.25, 0.95, -0.06], Math.PI)); body.add(L.livery);
  // the parts that get added (each with its own materials so it can glow lime)
  const eMats = [a3Mat('#ff7a3d', 0.5), a3Mat('#2b2f3a', 0.6)];
  const cowl = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.42, 0.7, 28), eMats[0]); cowl.rotation.z = Math.PI / 2; cowl.position.set(3.25, 0.12, 0);
  const spinner = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.4, 20), eMats[0]); spinner.rotation.z = -Math.PI / 2; spinner.position.set(3.82, 0.12, 0);
  const prop = a3Grp([3.68, 0.12, 0], a3BoxM(0.06, 2.6, 0.2, eMats[1]), a3BoxM(0.06, 0.2, 2.6, eMats[1])); (prop.children[1] as THREE.Mesh).visible = false;
  part('eng', eMats, cowl, spinner, prop);
  const sMats = [a3Mat('#f4f6fa', 0.45)], eM = [a3Mat('#ff7a3d', 0.5)], fMats = [a3Mat('#f4f6fa', 0.45)], rM = [a3Mat('#ff7a3d', 0.5)], aM = [a3Mat('#ff7a3d', 0.5)], flM = [a3Mat('#ff7a3d', 0.5)];
  part('stab', sMats, a3BoxM(0.9, 0.07, 3.4, sMats[0], [-3.0, 0.22, 0]));
  const elev = a3Grp([-3.45, 0.22, 0], a3BoxM(0.4, 0.06, 3.3, eM[0], [-0.2, 0, 0])); part('elev', eM, elev);
  const finShape = p3Extruded([[0.0, 0], [-0.9, 0], [-1.1, 1.45], [-0.6, 1.45]], 0.09); const fin = new THREE.Mesh(finShape, fMats[0]); fin.position.set(-2.55, 0.25, 0); fin.castShadow = true; part('fin', fMats, fin);
  const rud = a3Grp([-3.45, 0.25, 0], a3BoxM(0.32, 1.42, 0.07, rM[0], [-0.16, 0.71, 0])); part('rud', rM, rud);
  const ailL = a3Grp([-0.15, 0.72, 3.9], a3BoxM(0.36, 0.08, 1.4, aM[0], [-0.18, 0, 0])), ailR = a3Grp([-0.15, 0.72, -3.9], a3BoxM(0.36, 0.08, 1.4, aM[0], [-0.18, 0, 0])); part('ail', aM, ailL, ailR);
  const flapL = a3Grp([-0.15, 0.7, 2.0], a3BoxM(0.36, 0.07, 1.6, flM[0], [-0.18, 0, 0])), flapR = a3Grp([-0.15, 0.7, -2.0], a3BoxM(0.36, 0.07, 1.6, flM[0], [-0.18, 0, 0])); part('flap', flM, flapL, flapR);
  const lime = new THREE.Color(A3.lime);
  const base = new Map<THREE.MeshStandardMaterial, THREE.Color>(); for (const k in PM) for (const m of PM[k as A3Part]) base.set(m, m.color.clone());
  const show = (o: THREE.Object3D, f: number) => { o.visible = f > 0.01; o.scale.setScalar(Math.max(0.001, f)); };
  return Object.assign(g, {
    body, parts: P,
    // which parts are on (0..1 grow) and how far the board has turned into the plane
    pose(stage: number, on: Partial<Record<A3Part, number>>) {
      const f = (k: number) => p3Clamp(stage - (k - 1));
      show(L.boardW, 1 - f(1)); show(L.wing, f(1)); show(L.strut, f(1));
      show(L.plank, 1 - f(2)); L.fus.visible = f(2) > 0.01; L.fus.scale.set(1, Math.max(0.001, f(2)), Math.max(0.001, f(2)));
      show(L.wins, f(3)); show(L.stripe, f(4)); show(L.gear, f(4)); show(L.livery, f(5));
      for (const k of ['eng', 'stab', 'elev', 'fin', 'rud', 'ail', 'flap'] as A3Part[]) show(P[k], on[k] ?? 0);
    },
    glow(k: A3Part, u: number) { for (const m of PM[k]) { m.color.copy(base.get(m)!).lerp(lime, u); m.emissive.copy(lime); m.emissiveIntensity = u * 0.55; } },
    spin(t: number, rps = 6) { prop.rotation.x = t * rps * Math.PI * 2; (prop.children[1] as THREE.Mesh).visible = rps > 2; },
    controls(c: { elev?: number; rud?: number; ailL?: number; ailR?: number; flap?: number }) {
      elev.rotation.z = c.elev ?? 0; rud.rotation.y = c.rud ?? 0; ailL.rotation.z = c.ailL ?? 0; ailR.rotation.z = c.ailR ?? 0;
      flapL.rotation.z = -(c.flap ?? 0); flapR.rotation.z = -(c.flap ?? 0);
    },
  });
}
// paints a part lime for a moment when it is added (k: ramp in 0..1 over ~0.3 s, then fades)
const a3AddGlow = (t: number, t0: number) => (t < t0 ? 0 : t < t0 + 1.0 ? 1 : 1 - p3Clamp((t - t0 - 1.0) / 0.6));

// ---------------- the wing in cut (p3Airfoil) with a flap and the lift arrow; air with p3Airflow
function a3Wing() {
  const foil = p3Airfoil(), flapMat = a3Mat('#ff7a3d', 0.5);
  const flap = a3Grp([2.0, 0.05, 0], a3BoxM(1.1, 0.12, 2.9, flapMat, [0.55, 0, 0])); foil.add(flap); flap.visible = false;
  const lift = p3Arrow([0, 0.6, 1.7], [0, 1, 0], 2.6, A3.lime, 0.28);
  const downs = [0.8, 1.9, 3.0].map((x) => p3Arrow([x, -0.6, 1.7], [0.25, -1, 0], 1.5, C3.air, 0.15));
  return { foil, flap, flapMat, lift, downs, air: p3Airflow(7, -1.8, 2.1, 1.6) };
}

// ---------------- props
function a3Table() { const w = a3Mat('#b97a4a', 0.75); return a3Grp([0, 0, 0], a3BoxM(4, 0.15, 1.6, w, [0, 1.0, 0]), ...[[-1.8, -0.65], [1.8, -0.65], [-1.8, 0.65], [1.8, 0.65]].map(([x, z]) => a3BoxM(0.14, 1.0, 0.14, w, [x, 0.5, z]))); }
function a3Gauge() {
  const face = p3Paint(512, 512, (c) => { c.fillStyle = '#15161c'; c.beginPath(); c.arc(256, 256, 250, 0, 7); c.fill(); c.lineWidth = 28; c.strokeStyle = '#4a4c56'; c.beginPath(); c.arc(256, 300, 170, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); c.strokeStyle = '#ff6a3d'; c.beginPath(); c.arc(256, 300, 170, Math.PI * 1.15, Math.PI * 1.35); c.stroke(); c.fillStyle = '#ff6a3d'; c.font = '900 60px monospace'; c.textAlign = 'center'; c.fillText('E', 110, 300); c.fillStyle = '#cfcdc4'; c.fillText('F', 402, 300); c.font = '700 34px monospace'; c.fillText('COMBUSTIBLE', 256, 430); });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.2, 48), [a3Mat('#2a2c35', 0.4), new THREE.MeshStandardMaterial({ map: face, roughness: 0.5 }), a3Mat('#2a2c35', 0.4)] as unknown as THREE.Material); disc.rotation.x = Math.PI / 2;
  const needle = a3Grp([0, -0.25, 0.14], a3BoxM(0.07, 1.0, 0.04, a3Mat(A3.lime, 0.3, 0.5), [0, 0.5, 0])), hub = a3Sph(0.12, a3Mat(A3.lime, 0.3, 0.5), [0, -0.25, 0.16]);
  return Object.assign(a3Grp([0, 0, 0], disc, needle, hub), { needle });
}
function a3Card(meta: string, title: string, line: string, year: string, stamp = '') {
  const tex = p3Paint(1024, 640, (c) => { c.fillStyle = '#f2efe6'; c.fillRect(0, 0, 1024, 640); c.fillStyle = '#6b6a63'; c.font = '700 34px monospace'; c.fillText(meta, 56, 80); c.fillStyle = '#c9c5b6'; c.fillRect(56, 104, 912, 4); c.fillStyle = '#14161d'; c.font = '900 92px Inter, Arial'; c.fillText(title, 56, 230); c.fillStyle = '#4a4943'; c.font = '700 46px Inter, Arial'; c.fillText(line, 56, 310); c.fillStyle = '#14161d'; c.fillRect(56, 380, 380, 160); c.fillStyle = '#d4ff3a'; c.font = '900 120px monospace'; c.fillText(year, 80, 506);
    if (stamp) { c.save(); c.translate(740, 470); c.rotate(-0.17); c.strokeStyle = '#ff6a3d'; c.lineWidth = 12; c.strokeRect(-190, -66, 380, 132); c.fillStyle = '#ff6a3d'; c.font = '900 72px Inter, Arial'; c.textAlign = 'center'; c.fillText(stamp, 0, 26); c.restore(); } });
  return new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.25, 0.06), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }));
}
function a3Bar(color: string) { const frame = a3BoxM(0.9, 4, 0.5, new THREE.MeshStandardMaterial({ color: '#4a4c56', transparent: true, opacity: 0.35 }), [0, 2, 0]); const fill = a3Grp([0, 0, 0], a3BoxM(0.7, 3.9, 0.4, a3Mat(color, 0.4, 0.3), [0, 1.95, 0])); return Object.assign(a3Grp([0, 0, 0], frame, fill), { level(u: number) { fill.scale.y = Math.max(0.01, u); } }); }
function a3Bike() {
  const O = a3Mat('#1d1410', 0.5), F = a3Mat('#ff6a3d', 0.4);
  const wheel = (x: number) => { const w = a3Grp([x, 0.62, 0], new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.06, 12, 40), O)); for (let i = 0; i < 6; i++) { const s = a3BoxM(0.02, 1.12, 0.02, a3Mat('#9aa3b2', 0.4)); s.rotation.z = i * Math.PI / 6; w.add(s); } return w; };
  const w1 = wheel(-0.95), w2 = wheel(0.95);
  const frame = a3Grp([0, 0, 0], p3Rod([-0.95, 0.62, 0], [-0.25, 1.35, 0], 0.06, F), p3Rod([-0.25, 1.35, 0], [0.6, 1.35, 0], 0.06, F), p3Rod([0.6, 1.35, 0], [0.95, 0.62, 0], 0.06, F), p3Rod([-0.25, 1.35, 0], [0.05, 0.62, 0], 0.06, F), p3Rod([0.05, 0.62, 0], [0.6, 1.35, 0], 0.06, F), p3Rod([-0.95, 0.62, 0], [0.05, 0.62, 0], 0.06, F), p3Rod([0.6, 1.35, 0], [0.7, 1.7, 0], 0.05, O), p3Rod([0.6, 1.7, -0.3], [0.8, 1.7, 0.3], 0.04, O));
  return Object.assign(a3Grp([0, 0, 0], w1, w2, frame), { roll(t: number) { w1.rotation.z = w2.rotation.z = -t * 9; } });
}
const a3Rock = () => new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 0), a3Mat('#8d8f96', 0.9));
// stars and drifting specks for the dark sets
function a3Specks(n = 120, spread = 30) { const r = p3Rnd(7), sw = p3Swarm(n, new THREE.IcosahedronGeometry(0.05, 0), new THREE.MeshBasicMaterial({ color: '#e8e6dc' })); const P = [...Array(n)].map(() => [r() * spread - spread / 2, r() * 14, -r() * 20]); return Object.assign(sw, { pose(t: number) { P.forEach(([x, y, z], i) => sw.put(i, x - ((t * 0.3) % 2), y + Math.sin(t + i) * 0.1, z, 0.6 + (i % 3) * 0.4)); sw.done(); } }); }
// confetti (prize): falls from start, deterministic
function a3Confetti(n = 90) { const r = p3Rnd(11), sw = p3Swarm(n, new THREE.BoxGeometry(0.16, 0.08, 0.02), new THREE.MeshBasicMaterial({ color: '#ffffff' })); const cols = ['#ff5a5f', '#ffd23d', '#3ccf91', '#4c7dff', '#ff8a3d', '#8b6cff'].map((c) => new THREE.Color(c)); const P = [...Array(n)].map(() => [r() * 10 - 5, 6 + r() * 3, r() * 4 - 2, r() * 6]); P.forEach((_, i) => sw.setColorAt(i, cols[i % 6])); return Object.assign(sw, { pose(t: number, t0: number) { P.forEach(([x, y, z, ph], i) => { const u = t - t0; if (u < 0) { sw.hide(i); return; } sw.put(i, x + Math.sin(u * 2 + ph) * 0.4, y - u * 2.6, z, 1, 1, 1, u * 3 + ph, u * 2, ph); }); sw.done(); } }); }
// prize rays: a disc of wedges that faces the camera (rotate .rotation.z to spin)
function a3Rays(c1 = '#ffd84a', r = 14) { const g = new THREE.Group(); for (let i = 0; i < 16; i++) { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(Math.cos(i * Math.PI / 8) * r, Math.sin(i * Math.PI / 8) * r); s.lineTo(Math.cos(i * Math.PI / 8 + 0.12) * r, Math.sin(i * Math.PI / 8 + 0.12) * r); g.add(new THREE.Mesh(new THREE.ShapeGeometry(s), new THREE.MeshBasicMaterial({ color: c1, transparent: true, opacity: 0.55 }))); } return g; }
function a3Bow() { const R = a3Mat('#ff3d57', 0.4); const loop = (sx: number) => { const m = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.13, 14, 30), R); m.position.set(sx * 0.42, 0, 0); m.scale.set(1, 0.7, 0.6); m.rotation.y = sx * 0.3; return m; }; return a3Grp([0, 0, 0], loop(1), loop(-1), a3Sph(0.2, R, [0, 0, 0.05]), a3BoxM(0.18, 0.8, 0.06, R, [-0.25, -0.5, 0], [0, 0, -0.35]), a3BoxM(0.18, 0.8, 0.06, R, [0.25, -0.5, 0], [0, 0, 0.35])); }
// a 3D star (banner)
const a3StarMesh = (r: number, c = '#ffd23d') => { const m = new THREE.Mesh(p3Extruded([...Array(10)].map((_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; return [Math.cos(a) * rr, Math.sin(a) * rr]; }), r * 0.35), a3Mat(c, 0.4, 0.25)); m.castShadow = true; return m; };

// ---------------- sets
// the sky set: soft light, grass, trees far away, clouds in layers (.pose(t) drifts them), optional runway
function a3SkySet(w: World, o: { runway?: boolean; ground?: boolean } = {}) {
  p3Lights(w); w.scene.fog = new THREE.Fog(P3_SKY, 40, 130);
  if (o.ground !== false) { w.add(p3Ground(C3.grass, -6)); w.add(p3Forest(30, 5, -30, 120)).position.y = -6; }
  const runway = o.runway ? w.add(p3Runway()) : null; if (runway) runway.position.y = -5.97;
  const clouds = [[-12, 6, -14, 1.6], [10, 9, -20, 2], [-4, 12, -26, 1.8], [16, 3, -10, 1.2], [-18, 2, -8, 1.3], [4, -2, -18, 1.5]].map(([x, y, z, s]) => w.add(p3Cloud([x, y, z], s)));
  return { runway, pose(t: number, speed = 1) { clouds.forEach((c, i) => { const x0 = [-12, 10, -4, 16, -18, 4][i]; c.position.x = ((x0 - t * speed * (1.2 + i * 0.25) + 60) % 60 + 60) % 60 - 30; }); } };
}
// the dark set: near-black, a soft rim of light, specks drifting, dark ground
function a3NightSet(w: World) {
  w.add(new THREE.HemisphereLight('#c8d4ff', '#1a1c24', 0.8));
  const key = new THREE.DirectionalLight('#ffffff', 1.5); key.position.set(6, 10, 8); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15 }); w.add(key);
  const rim = new THREE.DirectionalLight(A3.orange, 0.6); rim.position.set(-8, 4, -6); w.add(rim);
  w.add(p3Ground('#1b1d26', -2.5));
  const sp = w.add(a3Specks());
  return { pose(t: number) { sp.pose(t); } };
}
// the cabin, seen from the front of the plane looking back: rows of seats facing the camera, windows on both walls,
// overhead bins. Seats of the front row at x = -1.45, -0.75 | 0.75, 1.45 (z = 0). .seatFront(x) covers a sitter's legs.
function a3Cabin(w: World) {
  w.add(new THREE.HemisphereLight('#fff6e8', '#5a5f70', 1.1));
  const lamp = new THREE.DirectionalLight('#ffffff', 0.9); lamp.position.set(0, 6, 6); lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048); w.add(lamp);
  const wall = a3Mat('#e8e1d3', 0.8), seatM = a3Mat('#2f5fd9', 0.85), head = a3Mat('#e9eef5', 0.8), floor = a3Mat('#3d4a6b', 0.95), bin = a3Mat('#f4efe6', 0.6), arm = a3Mat('#b8c0cf', 0.6);
  w.add(a3BoxM(6, 0.1, 14, floor, [0, -0.05, -5]));
  const skyTex = p3Paint(512, 512, (c) => { const gr = c.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#2a7fd9'); gr.addColorStop(1, '#bfe3ff'); c.fillStyle = gr; c.fillRect(0, 0, 512, 512); c.fillStyle = '#ffffff'; for (const [x, y, r] of [[90, 300, 50], [140, 280, 64], [200, 305, 46], [360, 180, 40], [410, 165, 52], [460, 185, 38]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } });
  skyTex.wrapS = THREE.RepeatWrapping;
  const winMat = new THREE.MeshBasicMaterial({ map: skyTex });
  for (const sx of [-1, 1]) {
    const side = w.add(a3BoxM(0.12, 3.4, 14, wall, [sx * 2.3, 1.7, -5]));
    side.receiveShadow = true;
    for (let k = 0; k < 6; k++) {
      const z = 0.5 - k * 1.6;
      const frame = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.3, 6, 18), a3Mat('#cfc8b8', 0.5)); frame.position.set(sx * 2.22, 1.55, z); frame.scale.set(0.3, 1, 1); w.add(frame);
      const pane = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.26, 6, 18), winMat); pane.position.set(sx * 2.17, 1.55, z); pane.scale.set(0.2, 1, 1); w.add(pane);
    }
    w.add(a3BoxM(0.9, 0.5, 14, bin, [sx * 1.8, 2.55, -5]));
    w.add(a3BoxM(0.9, 0.05, 14, a3Mat('#fff6d8', 0.4, 0.5), [sx * 1.8, 2.28, -5]));
  }
  w.add(a3BoxM(4.8, 0.1, 14, wall, [0, 3.2, -5]));
  const seat = (x: number, z: number) => a3Grp([x, 0, z], a3BoxM(0.62, 1.05, 0.14, seatM, [0, 0.95, -0.32], [-0.08, 0, 0]), a3BoxM(0.5, 0.22, 0.1, head, [0, 1.45, -0.36]), a3BoxM(0.62, 0.16, 0.58, seatM, [0, 0.5, -0.02]), a3BoxM(0.08, 0.3, 0.5, arm, [0.33, 0.62, -0.05]), a3BoxM(0.08, 0.3, 0.5, arm, [-0.33, 0.62, -0.05]));
  for (let row = 0; row < 6; row++) for (const x of [-1.45, -0.75, 0.75, 1.45]) w.add(seat(x, -row * 1.25));
  return {
    seatFront: (x: number) => w.add(a3Grp([x, 0, 0], a3BoxM(0.62, 0.42, 0.06, seatM, [0, 0.33, 0.27]))),
    pose(t: number) { skyTex.offset.x = -t * 0.08; },
  };
}

// =====================================================================
//  World test shots (world.json)
// =====================================================================
defineVisuals({
  'test-chars': {
    bg: '#8ec9f0',
    build(w) {
      p3Lights(w); w.add(p3Ground());
      const tk = w.add(a3Tico()), d = w.add(a3Dota()); tk.position.x = -0.8; d.position.x = 0.8;
      w.look([0, 1.6, 7.5], [0, 1.25, 0], 36);
      return (t) => {
        const u = t - w.s.t0; tk.setPose((['cross', 'point', 'palm', 'hold'] as A3TicoPose[])[Math.min(3, Math.floor(u))]); d.setPose((['up', 'down', 'hug', 'reach'] as A3DotaPose[])[Math.min(3, Math.floor(u))]);
        d.crazy(u > 2); d.bump.visible = u > 2; d.dizzy(t, u > 2); tk.bulb.visible = u > 3; tk.live(t); d.live(t);
      };
    },
  },
  'test-plane': {
    build(w) {
      const sky = a3SkySet(w); const p = w.add(a3Plane()); p.position.y = 1.5;
      return (t) => {
        const u = t - w.s.t0; sky.pose(t);
        p.pose(Math.min(5, u * 1.25), { eng: p3Clamp(u - 0.5), stab: p3Clamp(u - 1.5), elev: p3Clamp(u - 1.5), fin: p3Clamp(u - 2.5), rud: p3Clamp(u - 2.5), ail: p3Clamp(u - 3.2), flap: p3Clamp(u - 3.2) });
        p.glow('eng', a3AddGlow(t, w.s.t0 + 0.5)); p.spin(t); p.controls({ elev: 0.3 * Math.sin(t * 3), rud: 0.3 * Math.sin(t * 2), ailL: 0.3, ailR: -0.3, flap: 0.3 });
        const a = 0.9; w.look([Math.cos(a) * 14, 4.5, Math.sin(a) * 14], [0, 2.4, 0], 40);
      };
    },
  },
  'test-props': {
    bg: A3.night,
    build(w) {
      const n = a3NightSet(w); const card = w.add(a3Card('ARCHIVO · CANADÁ', 'Air Canada', 'Sin combustible en pleno vuelo', '1983', 'PLANEÓ')); card.position.set(0, 4.2, 0);
      const g = w.add(a3Gauge()); g.position.set(-2.2, 1.2, 0); g.scale.setScalar(0.8);
      const b1 = w.add(a3Bar(C3.air)), b2 = w.add(a3Bar(A3.lime)); b1.position.set(1.5, -0.4, 0); b2.position.set(2.7, -0.4, 0); b1.scale.setScalar(0.6); b2.scale.setScalar(0.6);
      const bike = w.add(a3Bike()); bike.position.set(0, -2.5, 1); const r = w.add(a3Rock()); r.position.set(-1, -1.5, 1);
      const bow = w.add(a3Bow()); bow.position.set(2.4, 2.2, 1);
      w.look([0, 2.0, 13], [0, 2.4, 0], 40);
      return (t) => { n.pose(t); g.needle.rotation.z = Math.sin(t) * 1.1; b1.level(0.4); b2.level(0.8); bike.roll(t); };
    },
  },
  'test-cabin': {
    bg: '#d9d1c2',
    build(w) {
      const cab = a3Cabin(w); const tk = w.add(a3Tico()), d = w.add(a3Dota());
      tk.position.set(-0.75, 0.18, 0); tk.scale.setScalar(0.62); d.position.set(0.75, 0.2, 0); d.scale.setScalar(0.72); cab.seatFront(-0.75); cab.seatFront(0.75); tk.setPose('hold'); d.setPose('down');
      w.look([0, 1.7, 4.6], [0, 1.25, -0.6], 50);
      return (t) => { cab.pose(t); tk.live(t); d.live(t); };
    },
  },
  'test-wing': {
    bg: '#1c336f',
    build(w) {
      p3Lights(w); const wg = a3Wing(); w.add(wg.foil); w.add(wg.lift); wg.downs.forEach((a) => w.add(a)); w.add(wg.air); wg.flap.visible = true;
      w.look([0, 0.8, 15], [0, 0.6, 0], 40);
      return (t) => { wg.foil.rotation.z = -0.14; wg.air.pose(t, w.s.t0 - 2, 4, 1.4); wg.lift.grow(1); wg.flap.rotation.z = -0.4; };
    },
  },
});
