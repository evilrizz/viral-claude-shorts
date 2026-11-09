// Example without voice: how to mix the two levels of the 3D style in one shared set.
// Textured (detail.ts): the critter's fur, the crate's wood grain, the grass around them. Simple (library.ts): ground, trees, boxes, clouds.
const DD: any = {};
// wood with grain along the board and a little relief
const ddWood = () => p3Shader(new THREE.MeshStandardMaterial({ roughness: 0.7 }), 'dd-wood', { bump: 0.02, color: `
  float rings = p3F(vec2(p3Pos.y * 9.0, p3Pos.z * 9.0 + p3Pos.x * 0.3)) * 11.0, line = 0.5 + 0.5 * sin(rings * 6.0), fine = p3N(vec2(p3Pos.y * 60.0, p3Pos.x * 3.0));
  diffuseColor.rgb = mix(vec3(0.2, 0.09, 0.02), vec3(0.58, 0.32, 0.1), line * 0.75 + fine * 0.25); p3Ht = line * 0.5 + fine * 0.35;` });
// the critter: an orange body with fur (colors from math), simple eyes and ears
const ddCritter = () => {
  const body = p3Blob((x, y, z) => [x * 0.75, y * 0.62 + 0.62, z * 0.7], (x, y, z) => { const n = p3Fbm3(x * 4, y * 4, z * 4) - 0.5, belly = p3Smoothstep(0.2, 0.6, z) * p3Smoothstep(0.9, 0.4, y); return [0.86 + n * 0.12 + belly * 0.1, 0.5 + n * 0.1 + belly * 0.32, 0.22 + n * 0.06 + belly * 0.4]; });
  const g = p3Group(p3Fur(body, { ...P3_HAIR, layers: 12, len: 0.06, den: 55 }));
  for (const s of [1, -1]) {
    g.add(p3Mesh(p3Ball(0.16, 16, 12), '#ffffff', { p: [s * 0.26, 0.92, 0.58] }), p3Mesh(p3Ball(0.08, 12, 8), '#1d1f26', { p: [s * 0.27, 0.92, 0.72] }));
    g.add(p3Mesh(p3Cone(0.16, 0.36, 6), '#c96a2a', { p: [s * 0.4, 1.32, 0], r: [0, 0, -s * 0.35] }));
  }
  return g;
};
const ddInit = (w: World) => {
  const st = DD.st = p3Stage(w, { finish: { vignette: 0.45 } }), r = p3Rnd(7);
  st.scene.background = new THREE.Color(P3_SKY); p3Lights(st);
  st.add(p3Ground());                                                                                    // simple
  const patch = new THREE.CircleGeometry(3.2, 48); patch.rotateX(-Math.PI / 2); patch.translate(0, 0.02, 0);
  st.add(p3Fur(patch, { ...P3_GRASS, layers: 10, len: 0.22, den: 13, colors: ['#3a6a24', '#a5cf58'] }));   // textured
  DD.critter = st.add(ddCritter());
  DD.crate = st.add(p3Mesh(new THREE.RoundedBoxGeometry(0.9, 0.9, 0.9, 3, 0.06), ddWood()));
  DD.boxes = [C3.blue, C3.red].map((c, i) => st.add(p3Mesh(p3Box(0.8, 0.8, 0.8), c, { p: [2.6 + i * 1.1, 0.4, -0.4 - i * 0.6], r: [0, 0.3 + i * 0.5, 0] })));
  for (let i = 0; i < 14; i++) { const a = r() * 6.283, d = 6 + r() * 9; st.add(p3Tree([Math.cos(a) * d, 0, Math.sin(a) * d - 4], 0.8 + r() * 0.6)); }
  DD.clouds = [st.add(p3Cloud([-5, 9, -12], 1.4)), st.add(p3Cloud([6, 11, -16], 1.8))];
  return st;
};
const DD_SHOTS = [
  // circling the critter while it breathes
  { id: 'hero', fn(t: number, u: number) { const a = 0.35 - u * 0.7; DD.st.look([Math.sin(a) * 5.8, 2.2, Math.cos(a) * 5.8], [0, 0.55, 0]); } },
  // the crate drops next to the plain boxes
  { id: 'crate', fn(t: number, u: number, s: Scene) { DD.st.look([4.4 - u * 0.6, 2.1, 6.4], [2.1, 0.55, -0.3]); DD.crate.position.y = 0.45 + 3 * (1 - p3Spring(t, (s.keys || [])[0]?.t ?? s.t0)); } },
  // up and back: the whole set
  { id: 'set', fn(t: number, u: number) { DD.st.look([1, 3.2 + u * 3, 8 + u * 5], [0.8, 1.6 + u * 0.8, -0.5]); } },
];
p3Shots(DD_SHOTS, ddInit, (t, u, shot, s) => {
  DD.critter.scale.set(1, 1 + 0.04 * Math.sin(t * 3), 1); DD.critter.rotation.y = Math.sin(t * 0.8) * 0.2;
  DD.crate.position.set(1.7, 0.45, 0.4); DD.crate.rotation.y = 0.5;
  DD.clouds.forEach((c: THREE.Object3D, i: number) => { c.position.x = (i ? 6 : -5) + Math.sin(t * 0.3 + i) * 0.5; });
  shot.fn(t, u, s);
});
