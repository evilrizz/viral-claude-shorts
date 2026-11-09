// =====================================================================
//  3D — library: reusable low-poly Three.js pieces (flat shading, matte materials, soft light) and one generic scene per type.
//  Runs in the browser (the adapter strips the types). Every piece returns a Three.js object, some with a method to pose it.
//  RULE: pose everything from the time t. No Math.random(), no clocks, and nothing that accumulates from frame to frame.
//  9:16 framing: the titles take the top and the apps cover the bottom. Aim the camera so the subject ends up in the
//  middle of the frame, between y 600 and y 1500, and check it on the storyboard (safe zone: x 80–1000, y 160–1600).
// =====================================================================
const P3_SKY = '#8ec9f0';
const C3 = { white: '#f4f6fa', blue: '#2f6fde', gray: '#8a93a6', grayD: '#4a5163', grass: '#7cc46a', grassD: '#5aa452', asphalt: '#3b4150', yellow: '#ffcf4a', red: '#e5484d', air: '#bfe6ff', trunk: '#8a5a3b', night: '#16233d' };

// time helpers (absolute video seconds)
const p3Clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const p3Lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const p3Smooth = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2);
// 0..1 between t0 and t1, smooth in and out
const p3Ramp = (t: number, t0: number, t1: number) => p3Smooth(p3Clamp((t - t0) / (t1 - t0)));
// closed-form spring: 0 -> 1 with a little bounce, from t0
const p3Spring = (t: number, t0: number, k = 170, d = 20) => {
  if (t <= t0) return 0;
  const w0 = Math.sqrt(k), z = Math.min(0.98, d / (2 * w0)), wd = w0 * Math.sqrt(1 - z * z), s = t - t0;
  return 1 - Math.exp(-z * w0 * s) * (Math.cos(wd * s) + (z * w0 / wd) * Math.sin(wd * s));
};

// when word number i of the audio is said (the # column of the analysis), and any scene's key from another scene
const p3Word = (i: number) => WORDS[Math.min(i, WORDS.length - 1)].t0;
const p3Scene = (id: string) => SCENES.scenes.find((s) => s.id === id)!;
const p3Key = (sceneId: string, key: string) => { const s = p3Scene(sceneId); return (s.keys || []).find((k) => k.id === key)?.t ?? s.t0 + 0.5; };

// building blocks
const p3Mat = (c: string, e = 0, r = 0.75) => new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: r, metalness: 0, emissive: c, emissiveIntensity: e });
interface P3MeshOptions { p?: Vec3; r?: Vec3; s?: number | Vec3; e?: number; rough?: number; shadow?: boolean }
const p3Mesh = (g: THREE.BufferGeometry, c: string | THREE.Material, o: P3MeshOptions = {}) => {
  const m = new THREE.Mesh(g, typeof c === 'string' ? p3Mat(c, o.e, o.rough) : c);
  if (o.p) m.position.set(...o.p);
  if (o.r) m.rotation.set(...o.r);
  if (o.s !== undefined) { if (typeof o.s === 'number') m.scale.setScalar(o.s); else m.scale.set(...o.s); }
  m.castShadow = o.shadow !== false;
  return m;
};
const p3Group = (...children: THREE.Object3D[]) => { const g = new THREE.Group(); if (children.length) g.add(...children); return g; };
const p3Box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const p3Cyl = (top: number, bottom: number, h: number, n = 10) => new THREE.CylinderGeometry(top, bottom, h, n);
const p3Cone = (r: number, h: number, n = 8) => new THREE.ConeGeometry(r, h, n);
const p3Ball = (r: number, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);
// a flat shape (list of 2D points) extruded: wings, fins, airfoils
const p3Extruded = (pts: number[][], depth: number) => { const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))), { depth, bevelEnabled: false }); g.translate(0, 0, -depth / 2); return g; };

// the scene's light: soft sky plus a sun that casts shadows (w: a scene's World, or a shared set from p3Stage)
const p3Lights = (w: Pick<World, 'add'>, sky = '#dff1ff', floor = '#6b8f5a') => {
  w.add(new THREE.HemisphereLight(sky, floor, 0.9));
  const sun = new THREE.DirectionalLight('#ffffff', 1.6);
  sun.position.set(8, 14, 6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20 });
  w.add(sun);
};
const p3Ground = (color = C3.grass, y = 0) => { const m = p3Mesh(new THREE.PlaneGeometry(400, 400), color, { p: [0, y, 0], r: [-Math.PI / 2, 0, 0], shadow: false }); m.receiveShadow = true; return m; };
// a runway with stripes that run: .advance(meters traveled)
const p3Runway = (length = 300) => {
  const road = p3Mesh(new THREE.PlaneGeometry(length, 7), C3.asphalt, { p: [0, 0.02, 0], r: [-Math.PI / 2, 0, 0], shadow: false }); road.receiveShadow = true;
  const stripes = Array.from({ length: 40 }, () => p3Mesh(new THREE.PlaneGeometry(3, 0.35), '#ffffff', { r: [-Math.PI / 2, 0, 0], shadow: false }));
  const place = (advance: number) => stripes.forEach((m, k) => { m.position.set((((k - 20) * 6 - advance) % 240 + 240) % 240 - 120, 0.03, 0); });
  place(0);
  return Object.assign(p3Group(road, ...stripes), { advance: place });
};
const p3Tree = (p: Vec3, s = 1) => { const g = p3Group(
  p3Mesh(p3Cyl(0.18, 0.24, 1.2, 6), C3.trunk, { p: [0, 0.6, 0] }),
  p3Mesh(p3Cone(1.1, 2.4, 7), C3.grassD, { p: [0, 2.1, 0] }),
  p3Mesh(p3Cone(0.8, 1.8, 7), '#4f9a49', { p: [0, 3.1, 0] }));
  g.position.set(...p); g.scale.setScalar(s); return g; };
const p3Forest = (n = 22, seed = 3, z0 = -14, width = 60) => {
  let s = seed; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647), g = p3Group();
  for (let i = 0; i < n; i++) { const x = p3Lerp(-width / 2, width / 2, r()), z = z0 - r() * 18; g.add(p3Tree([x, 0, z], 0.8 + r() * 0.7)); }
  return g;
};
const p3Cloud = (p: Vec3 = [0, 0, 0], s = 1) => { const g = p3Group(...[[0, 0, 0, 1.4], [1.4, -0.2, 0.2, 1.0], [-1.3, -0.3, 0, 1.0], [0.5, 0.6, -0.3, 0.9]].map(([x, y, z, r]) =>
  p3Mesh(new THREE.IcosahedronGeometry(r, 0), '#ffffff', { p: [x, y, z], e: 0.25, rough: 0.9, shadow: false })));
  g.position.set(...p); g.scale.setScalar(s); return g; };
// the low-poly plane: long axis on X (nose towards +X). .glow(0..1) lights up the wings
const p3Plane = () => {
  const wing = p3Extruded([[0.9, 0], [-0.6, 0], [-1.9, 3.6], [-1.3, 3.6]], 0.14), stabilizer = p3Extruded([[0.3, 0], [-0.4, 0], [-1.0, 1.4], [-0.6, 1.4]], 0.08), fin = p3Extruded([[0.2, 0], [-1.1, 0], [-1.6, 1.7], [-1.0, 1.7]], 0.1);
  const wingMat = p3Mat(C3.white), white = new THREE.Color(C3.white), yellow = new THREE.Color(C3.yellow);
  const g = p3Group(
    p3Mesh(p3Cyl(0.55, 0.55, 5.2, 12), C3.white, { r: [0, 0, Math.PI / 2] }),
    p3Mesh(p3Ball(0.55, 12, 8), C3.white, { p: [2.6, 0, 0], s: [1.4, 1, 1] }),
    p3Mesh(p3Cyl(0.55, 0.18, 1.6, 12), C3.white, { p: [-3.2, 0.15, 0], r: [0, 0, Math.PI / 2 + 0.12] }),
    p3Mesh(p3Ball(0.55, 8, 6), '#26324a', { p: [3.1, 0.2, 0], s: [0.5, 0.25, 0.7], rough: 0.3 }),
    p3Mesh(p3Box(1, 1, 1), C3.blue, { p: [0.2, 0.05, 0.56], s: [4.4, 0.14, 0.02] }),
    p3Mesh(p3Box(1, 1, 1), C3.blue, { p: [0.2, 0.05, -0.56], s: [4.4, 0.14, 0.02] }),
    p3Mesh(fin, C3.blue, { p: [-2.7, 0.4, 0] }));
  for (const l of [1, -1]) g.add(
    p3Mesh(wing, wingMat, { p: [0.3, -0.25, 0], r: [l * Math.PI / 2, 0, 0] }),
    p3Mesh(p3Cyl(0.28, 0.24, 1.1, 10), C3.gray, { p: [0.4, -0.55, l * 1.5], r: [0, 0, Math.PI / 2] }),
    p3Mesh(stabilizer, C3.white, { p: [-3.0, 0.3, 0], r: [l * Math.PI / 2, 0, 0] }));
  return Object.assign(g, { glow(u: number) { wingMat.color.copy(white).lerp(yellow, u); wingMat.emissive.copy(wingMat.color); wingMat.emissiveIntensity = u * 0.35; } });
};
// the wing's airfoil (a cross-section): curved on top, flat below; chord 4 along X. .glow(0..1), rotation.z = -angle of attack
const p3Airfoil = () => {
  const camber = (x: number) => 0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1015 * x ** 4, P: number[][] = [];
  for (let i = 0; i <= 24; i++) { const x = i / 24; P.push([x * 4 - 2, 0.6 * camber(x) / 0.12 * 0.5 + 0.35 * Math.sin(Math.PI * x) * 0.5]); }
  for (let i = 24; i >= 0; i--) { const x = i / 24; P.push([x * 4 - 2, -0.25 * camber(x) / 0.12 * 0.5 + 0.12 * Math.sin(Math.PI * x)]); }
  const mat = p3Mat(C3.white), white = new THREE.Color(C3.white), yellow = new THREE.Color(C3.yellow);
  return Object.assign(p3Mesh(p3Extruded(P, 3), mat), { glow(u: number) { mat.color.copy(white).lerp(yellow, u); mat.emissive.copy(mat.color); mat.emissiveIntensity = u * 0.3; } });
};
// air currents: little balls traveling left to right that drop `deflect` meters behind the wing. .pose(t, start, speed, deflect)
const p3Airflow = (rows = 6, y0 = -1.5, y1 = 1.8, z = 1.6, color = C3.air) => {
  const mesh = new THREE.InstancedMesh(p3Ball(0.055, 6, 4), new THREE.MeshBasicMaterial({ color }), rows * 49), o = new THREE.Object3D();
  mesh.frustumCulled = false;
  return Object.assign(mesh, { pose(t: number, start: number, speed = 4, deflect = 0) {
    mesh.visible = t >= start; if (!mesh.visible) return;
    for (let f = 0; f < rows; f++) for (let k = 0; k < 49; k++) {
      const x = (((t - start) * speed + k * 0.4 + f * 0.17) % 19.6) - 9.8, yb = p3Lerp(y0, y1, f / (rows - 1));
      const over = Math.exp(-(x * x) / 3) * (yb > 0 ? 0.5 : -0.2) * Math.exp(-Math.abs(yb) * 0.6);
      const drop = deflect * p3Clamp((x + 1) / 5) * Math.exp(-Math.abs(yb) * 0.25);
      o.position.set(x, yb + over - drop, z);
      o.scale.setScalar(p3Clamp((t - start) * 2) * p3Clamp((9.8 - Math.abs(x)) / 1.5));   // they fade in by growing
      o.updateMatrix(); mesh.setMatrixAt(f * 49 + k, o.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  } });
};
// a 3D arrow from p in direction dir, length L. .grow(0..1)
const p3Arrow = (p: Vec3, dir: Vec3 = [0, 1, 0], L = 3, color = C3.yellow, thickness = 0.22) => {
  const stickGeo = p3Cyl(thickness, thickness, 1); stickGeo.translate(0, 0.5, 0);
  const stick = p3Mesh(stickGeo, color, { e: 0.15 }), head = p3Mesh(p3Cone(thickness * 2.4, thickness * 3.6, 12), color, { e: 0.15 }), g = p3Group(stick, head);
  g.position.set(...p); g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...dir).normalize());
  const grow = (u: number) => { g.visible = u > 0.01; const l = Math.max(0.001, L * u); stick.scale.y = l; head.position.y = l + thickness * 1.6; };
  grow(1);
  return Object.assign(g, { grow });
};

// the type-checked way to write a video's visuals
const defineVisuals = (v: Record<string, Visual>) => { Object.assign(VISUALS, v); };
const VISUALS: Record<string, Visual> = {};

// ---- generic scenes per type (whatever has no custom visual). The camera aims high so the subject sits mid-frame, under the titles.
const p3Generic = (w: World, cam: [Vec3, Vec3] = [[0, 5, 18], [0, 4.2, 0]]) => { p3Lights(w); w.look(...cam); w.add(p3Ground()); };
const LIBRARY: Record<string, Visual> = {
  question: { build(w) { p3Generic(w); const c = w.add(p3Cloud([0, 3, 0], 1.3)); w.add(p3Forest()); return (t) => { c.position.y = 3 + Math.sin(t) * 0.2; }; } },
  object: { build(w) { p3Generic(w); const b = w.add(p3Mesh(p3Box(2, 2, 2), C3.blue)); w.add(p3Forest()); return (t) => { b.position.y = 1.2 * p3Spring(t, w.s.t0 + 0.2); b.rotation.y = t * 0.5; }; } },
  process: { build(w) { p3Generic(w); const b = [C3.red, C3.yellow, C3.blue].map((c, i) => w.add(p3Mesh(p3Box(1.6, 1.6, 1.6), c, { p: [-3 + i * 3, 1, 0] }))); return (t) => { b.forEach((m, i) => { m.position.y = p3Spring(t, w.s.t0 + 0.2 + i * 0.3); }); }; } },
  comparison: { build(w) { p3Generic(w); const a = w.add(p3Mesh(p3Box(2, 2, 2), C3.red, { p: [-2.5, 1, 0] })), b = w.add(p3Mesh(p3Box(2, 2, 2), C3.blue, { p: [2.5, 1, 0] })); return (t) => { a.scale.y = 0.5 + p3Spring(t, w.s.t0 + 0.3); b.scale.y = 0.5 + 2 * p3Spring(t, w.s.t0 + 0.5); }; } },
  stat: { build(w) { p3Generic(w); const a = w.add(p3Arrow([0, 0, 0], [0, 1, 0], 5)); return (t) => { a.grow(p3Spring(t, w.K('stat'))); }; } },
  map: { build(w) { p3Generic(w, [[0, 14, 14], [0, 3.5, 0]]); const e = w.add(p3Mesh(new THREE.IcosahedronGeometry(2.5, 1), C3.blue, { p: [0, 2.5, 0] })); return (t) => { e.rotation.y = t * 0.3; }; } },
  asset: { build(w) { p3Generic(w); return () => {}; } },
  closing: { build(w) { p3Generic(w); const p = w.add(p3Plane()); p.position.y = 3; w.add(p3Forest()); return (t) => { p.rotation.y = t * 0.4; }; } },
};
