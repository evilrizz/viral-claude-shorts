// =====================================================================
//  3D — detail: what turns a simple piece into a textured one, and the shared set that detailed videos are built on.
//  Runs in the browser after library.ts (the adapter strips the types). Choose per object: the hero of a scene gets
//  texture (p3Shader, p3Fur, p3Blob), the rest stays simple (p3Mesh with p3Mat). Texture costs render time.
//
//  Shared set:  p3Stage(w, ...) one scene + one camera for the whole video, with the image finish (grade, vignette, grain)
//               p3Shots(shots, init, frame) registers one visual per shot that poses that shared set
//  Surfaces:    p3Shader(material, key, { color, vertex, bump, ... }) adds GLSL to a Three.js material (patterns, relief)
//               P3_GLSL noise for shaders: p3H1, p3H2, p3S, p3N, p3F (smooth noise), p3V (cells), p3Bump (relief)
//  Pieces:      p3Fur (hair, grass, moss, leaves in layers) · p3Blob (organic shape colored by math) · p3Swarm (many
//               copies in one draw) · p3Tube (a curve) · p3Rod (a bar between two points) · p3Std · p3Paint (canvas texture)
//  Math:        p3Rnd (seeded random) · p3Noise3 / p3Fbm3 (noise for colors) · p3Smoothstep
//  RULE: as everywhere, pose from the time t. Random values come from p3Rnd(seed), never from Math.random().
// =====================================================================

// ---- math for colors and placement
const p3Smoothstep = (a: number, b: number, x: number) => { const u = p3Clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const p3Hash3 = (x: number, y: number, z: number) => { const v = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return v - Math.floor(v); };
// smooth value noise in 3D (0..1), and the same with more detail
const p3Noise3 = (x: number, y: number, z: number) => {
  const a = Math.floor(x), b = Math.floor(y), c = Math.floor(z), f = (u: number) => u * u * (3 - 2 * u), u = f(x - a), v = f(y - b), w = f(z - c), L = p3Lerp, h = p3Hash3;
  return L(L(L(h(a, b, c), h(a + 1, b, c), u), L(h(a, b + 1, c), h(a + 1, b + 1, c), u), v), L(L(h(a, b, c + 1), h(a + 1, b, c + 1), u), L(h(a, b + 1, c + 1), h(a + 1, b + 1, c + 1), u), v), w);
};
const p3Fbm3 = (x: number, y: number, z: number) => p3Noise3(x, y, z) * 0.6 + p3Noise3(x * 2.2, y * 2.2, z * 2.2) * 0.28 + p3Noise3(x * 4.4, y * 4.4, z * 4.4) * 0.12;

// ---- shaders
// noise for GLSL: p3H1/p3H2/p3S hashes, p3N smooth noise, p3F the same with detail, p3V cells (x: distance to the nearest
// center, y: to the second one, z: the cell's random id). p3Bump (fragment only) bends the normal with a height.
const P3_GLSL = `
  float p3H1(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  vec2 p3H2(vec2 p) { return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453); }
  float p3S(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float p3N(vec2 p) { vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f); return mix(mix(p3H1(i), p3H1(i + vec2(1, 0)), u.x), mix(p3H1(i + vec2(0, 1)), p3H1(i + vec2(1, 1)), u.x), u.y); }
  float p3F(vec2 p) { return p3N(p) * 0.55 + p3N(p * 2.1) * 0.28 + p3N(p * 4.3) * 0.17; }
  vec3 p3V(vec2 p) { vec2 n = floor(p), f = fract(p); float a = 9.0, b = 9.0, id = 0.0;
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) { vec2 g = vec2(float(x), float(y)), o = p3H2(n + g), r = g + o - f; float d = dot(r, r); if (d < a) { b = a; a = d; id = p3H1(n + g); } else if (d < b) b = d; }
    return vec3(sqrt(a), sqrt(b), id); }
`;
const P3_BUMP = `
  vec3 p3Bump(vec3 N, float h, float k, vec3 v) { vec3 sx = dFdx(-v), sy = dFdy(-v), r1 = cross(sy, N), r2 = cross(N, sx); float d = dot(sx, r1); vec3 g = sign(d) * (dFdx(h) * r1 + dFdy(h) * r2) * k; return normalize(abs(d) * N - g); }
`;
// the video's time for shaders that move (grass in the wind, water): p3Stage sets it on every frame
const P3_T = { value: 0 };
type P3Uniform = { value: number | THREE.Color | THREE.Vector2 | THREE.Vector3 };
interface P3ShaderParts {
  uniforms?: Record<string, P3Uniform>;   // declared for you in both stages (number: float, Color/Vector3: vec3, Vector2: vec2)
  glsl?: string;                          // your own GLSL functions (vertex and fragment)
  vertex?: string;                        // runs after the position is read: change `transformed`; p3Pos is the object position
  normal?: string;                        // replaces how the normal is made (must set `vec3 objectNormal`)
  color?: string;                         // runs after the base color: set diffuseColor.rgb, p3Ht (relief), p3Rough, p3Glow
  roughness?: string;                     // runs after the roughness is read: change roughnessFactor (p3Rough is yours)
  bump?: number;                          // how strong the relief from p3Ht is
  glow?: boolean;                         // add p3Glow as light that doesn't need light (emissive)
}
// In `vertex` and `color` you have p3Pos (object position), p3World (world position, instances included), p3Uv (uv) and P3_GLSL.
// `key` names the shader: two materials with different code need different keys.
const p3GlslType = (v: P3Uniform['value']) => typeof v === 'number' ? 'float' : (v as THREE.Vector2).isVector2 ? 'vec2' : 'vec3';
const p3Shader = <M extends THREE.Material>(m: M, key: string, o: P3ShaderParts): M => {
  m.onBeforeCompile = (sh) => {
    const U = o.uniforms || {}; Object.assign(sh.uniforms, U);
    const head = Object.entries(U).map(([n, u]) => `uniform ${p3GlslType(u.value)} ${n};\n`).join('') + `varying vec3 p3Pos; varying vec3 p3World; varying vec2 p3Uv;\nfloat p3Ht = 0.0; float p3Rough = 1.0; vec3 p3Glow = vec3(0.0);\n${P3_GLSL}\n${o.glsl || ''}\n`;
    let vs = sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
  p3Pos = position; p3Uv = uv; vec4 p3Wp = vec4(position, 1.0);
#ifdef USE_INSTANCING
  p3Wp = instanceMatrix * p3Wp;
#endif
  p3World = (modelMatrix * p3Wp).xyz;
${o.vertex || ''}`);
    if (o.normal) vs = vs.replace('#include <beginnormal_vertex>', o.normal);
    sh.vertexShader = head + vs;
    let fs = sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>\n${o.color || ''}`);
    if (o.roughness) fs = fs.replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>\n${o.roughness}`);
    if (o.bump) fs = fs.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>\n  normal = p3Bump(normal, p3Ht, ${o.bump.toFixed(4)}, vViewPosition);`);
    if (o.glow) fs = fs.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n  totalEmissiveRadiance += p3Glow;');
    sh.fragmentShader = head + P3_BUMP + fs;
  };
  m.customProgramCacheKey = () => 'p3-' + key;
  return m;
};

// ---- materials and pieces
const p3Std = (color: string, rough = 0.6, metal = 0, emissive = 0) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, emissive: emissive ? color : '#000000', emissiveIntensity: emissive });
const p3Rnd = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; };
// many copies of one piece in a single draw (stones, rain, planks): .put(i, position, scale, rotation), .hide(i), then .done()
const p3Swarm = (n: number, geo: THREE.BufferGeometry, mat: THREE.Material, shadow = false) => {
  const m = new THREE.InstancedMesh(geo, mat, n), o = new THREE.Object3D(); m.frustumCulled = false; m.castShadow = m.receiveShadow = shadow;
  return Object.assign(m, {
    put(i: number, x: number, y: number, z: number, sx: number, sy = sx, sz = sx, rx = 0, ry = 0, rz = 0) { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.scale.set(Math.max(0.0001, sx), Math.max(0.0001, sy), Math.max(0.0001, sz)); o.updateMatrix(); m.setMatrixAt(i, o.matrix); },
    hide(i: number) { o.position.set(0, -60, 0); o.scale.setScalar(0.0001); o.updateMatrix(); m.setMatrixAt(i, o.matrix); },
    done() { m.instanceMatrix.needsUpdate = true; },
  });
};
// a smooth tube along points (legs, antennas, branches) and a straight bar between two points (canes, rails)
const p3Tube = (pts: number[][], r: number, mat: THREE.Material, seg = 14) => p3Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2]))), seg, r, 6), mat);
const p3Rod = (a: number[], b: number[], r: number, mat: THREE.Material, seg = 12) => {
  const va = new THREE.Vector3(a[0], a[1], a[2]), vb = new THREE.Vector3(b[0], b[1], b[2]), d = vb.clone().sub(va), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat);
  m.position.copy(va).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = m.receiveShadow = true; return m;
};
// an organic shape: shape(direction) moves each point of a sphere, color(point) paints it ([r, g, b] from 0 to 1).
// Without color it keeps the material's color. Use it for bodies, buns, rocks, skulls.
const p3Blob = (shape: (x: number, y: number, z: number) => Vec3, color?: (x: number, y: number, z: number) => Vec3, w = 48, h = 36) => {
  const g = new THREE.SphereGeometry(1, w, h), pos = g.attributes.position, colors = new Float32Array(pos.count * 3), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const l = Math.hypot(pos.getX(i), pos.getY(i), pos.getZ(i)), p = shape(pos.getX(i) / l, pos.getY(i) / l, pos.getZ(i) / l); pos.setXYZ(i, p[0], p[1], p[2]);
    if (color) { const k = color(p[0], p[1], p[2]); c.setRGB(k[0], k[1], k[2], THREE.SRGBColorSpace); colors.set([c.r, c.g, c.b], i * 3); }
  }
  if (color) g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  g.computeVertexNormals();
  // the seam of the sphere: average the normals of the two rows that share a place
  const n = g.attributes.normal, row = w + 1;
  for (let j = 0; j <= h; j++) { const a = j * row, b = a + w, x = n.getX(a) + n.getX(b), y = n.getY(a) + n.getY(b), z = n.getZ(a) + n.getZ(b), L = Math.hypot(x, y, z) || 1; n.setXYZ(a, x / L, y / L, z / L); n.setXYZ(b, x / L, y / L, z / L); }
  return g;
};
// a texture painted with the 2D canvas (signs, labels, soft spots of light)
const p3Paint = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d')!); return new THREE.CanvasTexture(cv); };

// ---- fur: the same surface drawn in thin layers that keep fewer strands the higher they go (hair, grass, moss, leaves)
interface P3FurOptions {
  layers?: number; len?: number; den?: number;   // how many layers, how long the strands, how many per unit
  colors?: [string, string];                     // root and tip colors; without them the geometry's own colors are shaded
  droop?: Vec3; sway?: number; swaySpeed?: number; swayAt?: Vec3;   // the tips fall towards droop and sway with the time
  jitter?: number; strand?: number; thin?: number; shade?: [number, number]; vary?: number; pow?: number;
  rough?: number; env?: number; dry?: { value: number };   // dry (0..1) turns the color to dry straw
}
// presets: P3_HAIR for bodies (its geometry needs colors: p3Blob with a color function), P3_GRASS for the ground and
// tree crowns (give it colors: [root, tip])
const P3_HAIR: P3FurOptions = { droop: [-0.35, -0.3, 0], jitter: 0.5, strand: 0.28, thin: 0.78, shade: [0.52, 1.1], pow: 0.7, rough: 0.78, env: 0.8 };
const P3_GRASS: P3FurOptions = { sway: 0.14, swaySpeed: 1.6, swayAt: [0.8, 0, 1], strand: 0.3, thin: 0.8, vary: 0.28, pow: 0.8, rough: 0.94, env: 0.55 };
const P3_FUR_MATS = new Map<string, THREE.MeshStandardMaterial>();
const p3FurMat = (layer: number, o: P3FurOptions) => {
  const key = JSON.stringify([layer, o, o.dry ? 1 : 0]); let m = P3_FUR_MATS.get(key); if (m) return m;
  const col = !!o.colors, v = (a: Vec3 | undefined) => new THREE.Vector3(...(a || [0, 0, 0]));
  m = p3Shader(new THREE.MeshStandardMaterial({ vertexColors: !col, roughness: o.rough ?? 0.9, envMapIntensity: o.env ?? 0.6 }), 'fur-' + (col ? 'c' : 'v'), {
    uniforms: { uL: { value: layer }, uLen: { value: o.len ?? 0.03 }, uDen: { value: o.den ?? 120 }, uDroop: { value: v(o.droop) }, uSway: { value: o.sway ?? 0 }, uSwaySpeed: { value: o.swaySpeed ?? 1.5 }, uSwayAt: { value: v(o.swayAt) },
      uJit: { value: o.jitter ?? 0 }, uStrand: { value: o.strand ?? 0.3 }, uThin: { value: o.thin ?? 0.8 }, uShadeA: { value: (o.shade || [0.5, 1.1])[0] }, uShadeB: { value: (o.shade || [0.5, 1.1])[1] }, uVary: { value: o.vary ?? 0 }, uPow: { value: o.pow ?? 0.8 },
      uRoot: { value: new THREE.Color((o.colors || ['#000', '#000'])[0]) }, uTip: { value: new THREE.Color((o.colors || ['#000', '#000'])[1]) }, uT: P3_T, uDry: o.dry || { value: 0 } },
    vertex: 'transformed += normal * uLen * uL + (uDroop + vec3(sin(uT * uSwaySpeed + dot(position, uSwayAt)) * uSway, 0.0, 0.0)) * uLen * uL * uL;',
    color: `vec3 q = p3Pos * uDen, c = floor(q), f = fract(q) - 0.5 - (vec3(p3S(c + 1.3), p3S(c + 2.7), p3S(c + 4.1)) - 0.5) * uJit; float tall = uStrand + (1.0 - uStrand) * p3S(c);
      if (uL > 0.0) { if (uL > tall) discard; if (length(f) > (1.0 - uL / tall) * uThin) discard; }
      float vary = 1.0 - uVary * 0.5 + uVary * p3S(c + 3.0);
      ${col ? 'vec3 col = mix(uRoot, uTip, pow(uL, uPow)) * vary; diffuseColor.rgb = mix(col, vec3(0.5, 0.33, 0.13) * (0.7 + 0.5 * p3S(c + 5.0)), uDry);' : 'diffuseColor.rgb *= mix(uShadeA, uShadeB, pow(uL, uPow)) * vary;'}`,
  });
  P3_FUR_MATS.set(key, m); return m;
};
const p3Fur = (geo: THREE.BufferGeometry, o: P3FurOptions) => {
  const g = p3Group(), n = o.layers ?? 10;
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(geo, p3FurMat(i / (n - 1), o)); m.receiveShadow = true; m.castShadow = i === 0; g.add(m); }
  return g;
};

// ---- the shared set: one scene and one camera for the whole video, and the image finish
interface P3FinishOptions { sat?: number; curve?: number; vignette?: number; grain?: number }
interface P3StageOptions { ratio?: number; near?: number; far?: number; finish?: P3FinishOptions | false }
interface P3Stage {
  scene: THREE.Scene; cam: THREE.PerspectiveCamera;
  view: THREE.Scene;                     // the scene that gets drawn (a video can switch to a second one, for close-ups)
  add<T extends THREE.Object3D>(object: T): T;   // puts a piece in the set and returns it (so p3Lights(st) works too)
  grade: THREE.ShaderPass | null;        // the finish: its uniforms uRed (alarm tint) and uGray (no color) can be animated
  look(pos: Vec3, target: Vec3, fov?: number, roll?: number): void;   // the camera: where it stands, what it looks at (lands in the center), lens, tilt
  render(): void; tick(t: number): void;
}
const P3_ENV = new Map<THREE.WebGLRenderer, THREE.Texture>();
// soft studio light for reflections, made once per renderer
const p3Env = (r: THREE.WebGLRenderer) => { let e = P3_ENV.get(r); if (!e) { e = new THREE.PMREMGenerator(r).fromScene(new THREE.RoomEnvironment(), 0.04).texture; P3_ENV.set(r, e); } return e; };
const P3_GRADE = {
  vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uT, uSat, uCurve, uVig, uGrain, uRed, uGray; varying vec2 vUv; float n(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() { vec3 c = texture2D(tDiffuse, vUv).rgb; float g = dot(c, vec3(0.299, 0.587, 0.114)); c = mix(vec3(g), c, uSat * (1.0 - uGray)); c = c * c * (3.0 - 2.0 * c) * uCurve + c * (1.0 - uCurve);
      vec2 d = vUv - vec2(0.5); c *= 1.0 - dot(d, d) * (uVig - uRed * 0.2); c += vec3(0.32, 0.0, 0.0) * uRed * dot(d, d) * 1.9; c += (n(vUv * 917.0 + uT * 13.0) - 0.5) * uGrain; gl_FragColor = vec4(c, 1.0); }`,
};
// ratio > 1 renders bigger and scales down (sharper fur and edges, slower). finish: false draws the scene as it is.
const p3Stage = (w: World, o: P3StageOptions = {}): P3Stage => {
  const ratio = o.ratio ?? 1, r = w.renderer; r.setPixelRatio(ratio); r.setSize(1080, 1920, false);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(40, 1080 / 1920, o.near ?? 0.1, o.far ?? 1200); scene.environment = p3Env(r);
  let composer: THREE.EffectComposer | null = null, pass: THREE.RenderPass | null = null, grade: THREE.ShaderPass | null = null;
  if (o.finish !== false) {
    const f = o.finish || {};
    composer = new THREE.EffectComposer(r, new THREE.WebGLRenderTarget(1080 * ratio, 1920 * ratio, { type: THREE.HalfFloatType, samples: 4 })); composer.setPixelRatio(ratio); composer.setSize(1080, 1920);
    pass = new THREE.RenderPass(scene, cam); composer.addPass(pass); composer.addPass(new THREE.OutputPass());
    grade = new THREE.ShaderPass({ ...P3_GRADE, uniforms: { tDiffuse: { value: null }, uT: { value: 0 }, uSat: { value: f.sat ?? 1.12 }, uCurve: { value: f.curve ?? 0.32 }, uVig: { value: f.vignette ?? 0.5 }, uGrain: { value: f.grain ?? 0.012 }, uRed: { value: 0 }, uGray: { value: 0 } } });
    composer.addPass(grade);
  }
  const st: P3Stage = { scene, cam, view: scene, grade, add: (object) => { scene.add(object); return object; },
    look(pos, target, fov = 40, roll = 0) { cam.position.set(...pos); cam.fov = fov; cam.updateProjectionMatrix(); cam.lookAt(...target); if (roll) cam.rotateZ(roll); cam.updateMatrixWorld(true); },
    render() { if (!composer || !pass) { r.render(st.view, cam); return; } pass.scene = st.view; pass.camera = cam; composer.render(); },
    tick(t) { P3_T.value = t; if (grade) { grade.uniforms.uT.value = Math.round(t * 30); grade.uniforms.uRed.value = 0; grade.uniforms.uGray.value = 0; } },
  };
  return st;
};
// one visual per shot over the same set: init builds the set once (the first time any shot is drawn),
// frame(t, u, shot, scene) resets what changes and calls the shot (u goes 0 -> 1 through the scene)
const p3Shots = <S extends { id: string }>(shots: S[], init: (w: World) => P3Stage, frame: (t: number, u: number, shot: S, s: Scene) => void) => {
  let st: P3Stage | null = null; const V: Record<string, Visual> = {};
  for (const shot of shots) V[shot.id] = { build(w) { const stage = st = st || init(w); w.present = () => stage.render(); return (t) => { stage.tick(t); frame(t, p3Clamp((t - w.s.t0) / (w.s.t1 - w.s.t0)), shot, w.s); }; } };
  defineVisuals(V);
};
