// =====================================================================
//  "Los dinosaurios no eran como en las películas" (Idio-two, horizontal 16:9): each scene assembles the world of world3d.ts.
//  w.K('key') = when that word is said. Everything is posed from t (absolute seconds).
// =====================================================================
// the camera: a short dolly-in at the cut, a lens punch on key times, a slow truck so no shot is still
const z3Cam = (w: World, t: number, pos: Vec3, tg: Vec3, punches: number[] = [], fov = 40, truck = 0.9) => {
  const u = p3Clamp((t - w.s.t0) / Math.max(0.5, w.s.t1 - w.s.t0)) - 0.5, d = (1 - 0.08 * (u + 0.5)) * (1 + 0.16 * Math.exp(-(t - w.s.t0) * 5));
  const p = punches.reduce((a, x) => a + (t > x ? Math.exp(-(t - x) * 7) : 0), 0);
  w.look([tg[0] + (pos[0] - tg[0]) * d + u * truck, tg[1] + (pos[1] - tg[1]) * d + 0.12 * Math.sin(t * 0.6), tg[2] + (pos[2] - tg[2]) * d], [tg[0] + u * truck * 0.3, tg[1], tg[2]], fov * (1 - 0.06 * p));
};
// a character held at a place of the SCREEN (nx, ny from -1 to 1, its feet there), at a distance from the camera
const z3Screen = (w: World, o: THREE.Object3D, nx: number, ny: number, s: number, dist = 4.6) => {
  const cam = w.camera; cam.updateMatrixWorld(); const f = new THREE.Vector3(), r = new THREE.Vector3(), u = new THREE.Vector3();
  cam.getWorldDirection(f); r.crossVectors(f, cam.up).normalize(); u.crossVectors(r, f).normalize();
  const H = dist * Math.tan(cam.fov * Math.PI / 360), W = H * cam.aspect;
  o.position.copy(cam.position).addScaledVector(f, dist).addScaledVector(r, nx * W).addScaledVector(u, ny * H);
  o.scale.setScalar(s); o.lookAt(cam.position.x, o.position.y, cam.position.z);
};
// Tico presenting from the lower left (Dota from the lower right)
// a presenter is drawn on top of the set (never hidden by the floor or plants) and casts no shadow
const zFront = (o: THREE.Object3D) => { if (o.userData.front) return; o.userData.front = true; o.traverse((m) => { const mm = m as THREE.Mesh; if (!mm.isMesh) return; if (mm.geometry.type === 'CircleGeometry') { mm.visible = false; return; } mm.castShadow = false; mm.renderOrder = 990; (mm.material as THREE.Material).depthTest = false; }); };
const zTicoP = (w: World, tk: ReturnType<typeof z3Char>, t: number, nx = -0.8, s = 0.6) => { zFront(tk); z3Screen(w, tk, nx, -1.0, s); tk.live(t); };
const zDotaP = (w: World, d: ReturnType<typeof z3Char>, t: number, nx = 0.8, s = 0.6) => { zFront(d); z3Screen(w, d, nx, -1.0, s); d.live(t); };
const z3Html = (w: World, html: string, css: string) => { const e = document.createElement('div'); e.innerHTML = html; e.style.cssText = `position:absolute;${css}`; w.titles.appendChild(e); return e; };
const zsp = (t: number, k: number) => p3Spring(t, k);
const zPop = (o: THREE.Object3D, t: number, k: number, s = 1) => { const v = zsp(t, k); o.visible = t > k - 0.02; o.scale.setScalar(Math.max(0.001, v * s)); };
const zDots = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
// screen labels drawn INSIDE the WebGL frame, at screen pixel (x, y) of the 1920x1080 frame; the wrapper places them
const ZHUD: { w: World; place: (t: number) => void }[] = [];
function zHud(w: World, wpx: number, hpx: number, x: number, y: number, paint: (c: CanvasRenderingContext2D, txt: string) => void, pop = -1, until = 1e9) {
  const cv = document.createElement('canvas'); cv.width = wpx; cv.height = hpx; const c = cv.getContext('2d')!; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, fog: false, depthTest: false, depthWrite: false })); m.renderOrder = 999; m.visible = false; w.scene.add(m);
  const st = { txt: '\u0000', op: pop >= 0 ? 1 : 0, s: 1, rot: 0 }; let last = '';
  ZHUD.push({ w, place(t: number) {
    const sc = pop >= 0 ? p3Spring(t, pop) : 1, op = pop >= 0 ? (t > pop - 0.02 && t < until ? 1 : 0) : st.op; m.visible = op > 0.01 && sc > 0.01; if (!m.visible) return;
    if (st.txt !== last) { c.clearRect(0, 0, wpx, hpx); paint(c, st.txt); tex.needsUpdate = true; last = st.txt; }
    const cam = w.camera, FW = w.renderer.domElement.width, FH = w.renderer.domElement.height, D = 2, H = 2 * D * Math.tan(cam.fov * Math.PI / 360), W = H * FW / FH, f = new THREE.Vector3(), r = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion), u = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion); cam.getWorldDirection(f);
    m.position.copy(cam.position).addScaledVector(f, D).addScaledVector(r, (x - FW / 2) / FW * W).addScaledVector(u, -(y + hpx / 2 - FH / 2) / FH * H); m.quaternion.copy(cam.quaternion); m.rotateZ(st.rot); m.scale.set(wpx / FW * W * sc * st.s, hpx / FH * H * sc * st.s, 1); (m.material as THREE.MeshBasicMaterial).opacity = op;
  } });
  return { set(txt: string, op = 1, s = 1, rot = 0) { st.txt = txt; st.op = op; st.s = s; st.rot = rot; } };
}
const zFont = (c: CanvasRenderingContext2D, px: number) => { c.font = `900 ${px}px Inter, Arial, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; };
// a big lime number with its caption pill (counters)
const zNum = (w: World, x: number, y: number, cap: string) => zHud(w, 900, 250, x, y, (c, txt) => {
  zFont(c, 124); c.lineWidth = 20; c.strokeStyle = '#14161d'; c.strokeText(txt, 450, 76); c.fillStyle = '#d4ff3a'; c.fillText(txt, 450, 76);
  if (cap) { zFont(c, 46); const wd = c.measureText(cap).width + 44; c.fillStyle = '#14161d'; c.fillRect(450 - wd / 2 - 5, 160, wd + 10, 72); c.fillStyle = '#d4ff3a'; c.fillRect(450 - wd / 2, 165, wd, 62); c.fillStyle = '#14161d'; c.fillText(cap, 450, 197); }
});
// a chip label (a name) that pops at t; colour lime by default
const zChip = (w: World, text: string, t: number, x: number, y: number, bg = '#d4ff3a', fg = '#14161d', until = 1e9) => { const mc = document.createElement('canvas').getContext('2d')!; zFont(mc, 58); const CW = Math.ceil(mc.measureText(text).width + 90); const h = zHud(w, CW, 112, x, y, (c) => { zFont(c, 58); const wd = CW - 20; c.fillStyle = '#14161d'; c.fillRect(4, 4, wd + 12, 104); c.fillStyle = bg; c.fillRect(10, 10, wd, 92); c.fillStyle = fg; c.fillText(text, CW / 2, 58); }, t, until); h.set(text); return h; };
// a rubber stamp (INVENTADO, SE CREE, SE DISCUTE): a tilted framed word that slams in
const zStamp = (w: World, text: string, t: number, x: number, y: number, col = '#ff3b2b') => { const h = zHud(w, 760, 200, x, y, (c) => { c.strokeStyle = col; c.lineWidth = 14; c.strokeRect(12, 12, 736, 176); c.lineWidth = 5; c.strokeRect(28, 28, 704, 144); zFont(c, 92); c.fillStyle = col; c.fillText(text, 380, 104); }, t); h.set(text, 1, 1, -0.12); return h; };
// a big green check / red X drawn flat (HUD)
const zMark = (w: World, ok: boolean, t: number, x: number, y: number) => { const h = zHud(w, 240, 240, x, y, (c) => { c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#14161d'; c.lineWidth = 56; c.beginPath(); if (ok) { c.moveTo(40, 130); c.lineTo(100, 190); c.lineTo(205, 55); } else { c.moveTo(50, 50); c.lineTo(190, 190); c.moveTo(190, 50); c.lineTo(50, 190); } c.stroke(); c.strokeStyle = ok ? '#2fd46a' : '#ff3b2b'; c.lineWidth = 36; c.stroke(); }, t); h.set(ok ? 'ok' : 'x'); return h; };
// a round frame with a "?" (the promise)
const zQ = () => { const g = new THREE.Group(); const fr = z3Frame(0.9); g.add(fr); const m = new THREE.Mesh(new THREE.CircleGeometry(0.75, 40), new THREE.MeshBasicMaterial({ map: z3Paint(128, 128, (c) => { c.fillStyle = '#23263a'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#d4ff3a'; c.font = '900 96px Inter, Arial'; c.textAlign = 'center'; c.fillText('?', 64, 98); }), toneMapped: false })); m.position.z = 0.03; g.add(m); return g; };
// puffs of smoke/dust at p from t0
const zPuffs = (w: World, p: Vec3, n = 5, col = '#d8cfc0') => { const m = new THREE.MeshStandardMaterial({ color: col, roughness: 1, transparent: true }); const b = [...Array(n)].map((_, i) => w.add(z3Sph(0.3 + i * 0.08, m, [p[0] - i * 0.3, p[1] + i * 0.15, p[2] + (i % 2 ? 0.3 : -0.3)]))); return (t: number, t0: number) => b.forEach((s, i) => { const u = t - t0 - i * 0.08; s.visible = u > 0 && u < 1.2; s.scale.setScalar(0.5 + u * 1.4); s.position.y = p[1] + i * 0.15 + u * 0.6; m.opacity = p3Clamp(1 - u / 1.2); }); };
// a whole shake of the camera for a stomp at k
const zShake = (w: World, t: number, k: number, a = 0.06) => { if (t < k || t > k + 0.7) return; const e = Math.exp(-(t - k) * 6) * a; w.camera.position.x += Math.sin(t * 61) * e; w.camera.position.y += Math.cos(t * 53) * e; };

// ---------------- stagings
// the room: Tico (left) and Dota (right), camera on both
const zRoom = (w: World) => { const room = z3Room(w); const tk = w.add(z3Tico()), d = w.add(z3Dota()); tk.position.set(-1.0, 0, 0.2); d.position.set(0.9, 0, 0.45); d.setPose('down'); tk.side(1); d.side(-1); return { room, tk, d }; };
const zRoomCam = (w: World, t: number, punches: number[] = [], dx = 0, z = 6.4) => z3Cam(w, t, [0.1 + dx, 1.65, z], [dx, 1.3, 0], punches);
// the studio (dark backdrop, cream floor, coloured lights) with Tico presenting
const zStudio = (w: World, back = '#15161d') => { const STU = z3Studio(w, '#ece6d6', back); const tk = w.add(z3Tico()); tk.setPose('point'); return { STU, tk }; };
// the prehistoric land with Tico presenting
const zPre = (w: World, dense = 1, seed = 3) => { const P = z3Prehist(w, { dense, seed }); const tk = w.add(z3Tico()); tk.setPose('point'); return { P, tk }; };
// a dino that walks in place and turns slowly, sized by a camera framing its length
const zLen = (S: Z3DinoSpec) => S.body[0] * 2 + S.tail[0] * 0.8 + S.neck[0] * 0.5;
const zFrame = (w: World, t: number, S: Z3DinoSpec, k: number[] = [], sc = 1, x = 0, yaw = 0.35) => { const L = zLen(S) * sc; z3Cam(w, t, [x + L * 0.3 * Math.sin(yaw), S.hip * sc * 1.05 + L * 0.1, L * 0.95 + 1.2], [x, S.hip * sc * 0.85, 0], k); };

defineVisuals({
  // ===== 0:00 hook
  hook: {
    build(w) {
      const { tk, d } = zRoom(w); const lamp = w.add(z3Lamp()); lamp.position.set(2.2, 0, -0.6);
      return (t) => {
        const r = w.K('rawr'), l = w.K('lamp'); zRoomCam(w, t, [r, l], 0.3); tk.live(t); d.fx.rex = 1; d.force('claws'); d.live(t);
        d.position.y = t > r - 0.1 && t < r + 0.5 ? 0.25 * Math.sin((t - r + 0.1) / 0.6 * Math.PI) : 0;
        const f = p3Clamp((t - l) / 0.55); lamp.rotation.z = -f * f * 1.45; lamp.light.intensity = 3 * (1 - f) + (f >= 1 ? 0.6 * Math.max(0, Math.sin(t * 30)) : 0); zShake(w, t, l + 0.55, 0.05);
      };
    },
  },
  mintieron: {
    build(w) { const { tk, d } = zRoom(w); const lamp = w.add(z3Lamp()); lamp.position.set(2.2, 0, -0.6); lamp.rotation.z = -1.45; lamp.light.intensity = 0.3; return (t) => { zRoomCam(w, t, [w.K('mint')], -0.4, 5.6); tk.live(t); d.fx.rex = 1; d.live(t); }; },
  },
  promesa: {
    build(w) {
      const { tk, d } = zRoom(w); const q = w.add(zQ()); q.position.set(2.5, 2.1, -0.3); tk.force('point');
      return (t) => { const k = w.K('vivo'); zRoomCam(w, t, [k]); q.rotation.y = 0.2 * Math.sin(t * 1.2); q.scale.setScalar(zsp(t, w.s.t0 + 0.2) * (1 + 0.15 * (t > k ? Math.exp(-(t - k) * 3) : 0)) + 0.001); tk.live(t); d.fx.rex = 1; d.live(t); };
    },
  },
  // ===== 0:07 the Velociraptor
  famoso: {
    build(w) {
      const { STU, tk } = zStudio(w); const r = w.add(z3Sp('raptorMovie')); const door = w.add(z3Door()); door.position.set(1.6, 0, -0.6); door.rotation.y = -0.3; zChip(w, 'VELOCIRAPTOR DE PELÍCULA', w.K('name'), 1060, 840);
      return (t) => {
        STU.pose(t); const dk = w.K('door'), u = p3Smoothstep(0, 1, p3Clamp((t - w.s.t0) / (dk - w.s.t0 - 0.6)));
        r.position.set(p3Lerp(-2.4, 0.4, u), 0, 0.2); r.rotation.y = 0.15; r.live(t, { walk: u < 1 ? 0.8 : 0, jaw: 0.15 + 0.15 * Math.sin(t * 3), yaw: u >= 1 ? 0.3 : 0 }); door.open(p3Smoothstep(0, 1, p3Clamp((t - dk + 0.3) / 0.6)));
        z3Cam(w, t, [0.6, 1.6, 6.4], [0.2, 1.15, 0], [w.K('name'), dk]); zTicoP(w, tk, t);
      };
    },
  },
  pavo: {
    build(w) {
      const { STU, tk } = zStudio(w); const big = w.add(z3Sp('raptorMovie')), small = w.add(z3Sp('raptor')), tur = w.add(z3Bird('turkey')), d = w.add(z3Dota()); d.position.set(-1.1, 0, 0.2); d.scale.setScalar(0.6); d.setPose('down'); const puff = zPuffs(w, [0.4, 0.3, 0.3], 4, '#f2efe6');
      return (t) => {
        STU.pose(t); const sh = w.K('shrink'), pv = w.K('pavo'); z3Cam(w, t, [0.3, 1.1, 5.0], [0.15, 0.62, 0], [sh, pv]); void puff;
        const u = p3Smoothstep(0, 1, p3Clamp((t - sh) / 0.35)); big.visible = u < 0.5; small.visible = !big.visible; big.scale.setScalar(1 - u * 0.6); big.position.set(0.3, 0, 0.2); big.live(t, {}); small.position.set(0.25, 0, 0.3); small.rotation.y = 0.2; small.scale.setScalar(Math.max(0.001, zsp(t, sh + 0.17))); small.live(t, { jaw: 0.2 * Math.max(0, Math.sin(t * 4)) });
        tur.position.set(1.25, 0, 0.2); tur.rotation.y = -0.4; zPop(tur, t, pv - 0.3); tur.live(t, { look: -0.5 }); d.live(t); zTicoP(w, tk, t);
      };
    },
  },
  hueso: {
    build(w) {
      const { STU, tk } = zStudio(w); const scaly = w.add(z3Sp('raptorMovie')), feat = w.add(z3Sp('raptor')); scaly.scale.setScalar(0.4); feat.scale.setScalar(1.0); const bone = w.add(z3Bone()); bone.position.set(5.2, 1.05, 0); bone.rotation.set(0.2, -0.3, 0.15);
      const tw = [...Array(14)].map((_, i) => { const s = w.add(z3StarMesh(0.05)); s.position.set(-0.2 + (i % 7) * 0.12, 0.35 + Math.floor(i / 7) * 0.2, 0.3); return s; });
      zChip(w, 'PUNTITOS DE PLUMAS', w.K('knobs'), 1060, 830);
      return (t) => {
        STU.pose(t); const p = w.K('plumas'), b = w.K('bone'), kn = w.K('knobs'), z = p3Smoothstep(0, 1, p3Clamp((t - b + 0.4) / 0.9));
        scaly.visible = t < p; feat.visible = !scaly.visible; scaly.position.set(0, 0, 0); feat.position.set(0, 0, 0); scaly.live(t, {}); feat.live(t, { jaw: 0.1 }); tw.forEach((s, i) => { const u = (t - p - i * 0.02) / 0.6; s.visible = u > 0 && u < 1; s.scale.setScalar(Math.sin(Math.PI * p3Clamp(u))); s.rotation.y = t * 4; });
        bone.glow(t > kn ? 0.5 + 0.5 * Math.sin(t * 6) : 0); bone.rotation.y = -0.3 + 0.2 * Math.sin(t * 0.7);
        w.look([p3Lerp(0.2, 5.3, z), p3Lerp(0.75, 1.45, z), p3Lerp(2.6, 3.2, z)], [p3Lerp(0.1, 5.2, z), p3Lerp(0.42, 1.05, z), 0], 40); Z3_FOCUS_OVR = z > 0.05 ? p3Lerp(2.6, 3.2, z) : -1; zTicoP(w, tk, t);
      };
    },
  },
  pollo: {
    build(w) { const { STU } = zStudio(w); const r = w.add(z3Sp('raptor')), d = w.add(z3Dota()); r.position.set(0.55, 0, 0); r.rotation.y = -0.3; d.position.set(-0.5, 0, 0.2); d.scale.setScalar(0.6); d.setPose('down'); d.side(1);
      return (t) => { STU.pose(t); z3Cam(w, t, [0.2, 0.9, 3.6], [0.05, 0.55, 0], [w.K('dota')]); r.live(t, { jaw: 0.3 * Math.max(0, Math.sin(t * 5)), sniff: 0.5 + 0.5 * Math.sin(t * 3), yaw: -0.4 }); d.live(t); }; },
  },
  deino: {
    build(w) {
      const { P, tk } = zPre(w, 0.8, 5); const dn = w.add(z3Sp('deino')), r = w.add(z3Sp('raptor')); dn.position.set(-0.6, 0, 0); r.position.set(1.4, 0, 0.6); r.rotation.y = -0.3;
      const horse = w.add(z3Sp('horse')), rap = w.add(z3Sp('raptorMovie')), rider = w.add(z3Fig('tu')); rider.scale.setScalar(0.55);
      zChip(w, 'DEINONYCHUS', w.K('deino'), 760, 830); zChip(w, 'VELOCIRAPTOR', w.K('name'), 1340, 900);
      return (t) => {
        P.pose(t); z3Cam(w, t, [0.6, 1.6, 7.6], [0.4, 1.0, 0], [w.K('deino'), w.K('name')]); dn.live(t, { jaw: 0.2 + 0.2 * Math.sin(t * 2.5), yaw: 0.2 }); r.live(t, { jaw: 0.15 });
        // a rider gallops far behind and, in a blink, the horse is a raptor
        const u = (t - w.s.t0) / (w.s.t1 - w.s.t0), x = p3Lerp(-14, 14, u), flip = u > 0.5; horse.visible = !flip; rap.visible = flip;
        for (const m of [horse, rap]) { m.position.set(x, 0, -9); m.rotation.y = 0; m.live(t, { walk: 1 }); } rider.position.set(x + 0.3, (flip ? 1.25 : 1.35) + 0.08 * Math.abs(Math.sin(t * 12)), -9); rider.live(t, { arms: 'up', mood: 'happy' });
        zTicoP(w, tk, t);
      };
    },
  },
  chido: {
    build(w) { const { tk, d } = zRoom(w); return (t) => { zRoomCam(w, t, [w.K('dota')], 0.5, 5.4); tk.live(t); d.force('cheer'); d.live(t); }; },
  },
  mereces: {
    build(w) { const { tk, d } = zRoom(w); return (t) => { const k = w.K('palm'); zRoomCam(w, t, [k], -0.2, 5.8); tk.setPose(t > k - 0.2 ? 'palm' : 'cross', k - 0.2, 'cross'); tk.live(t); d.fx.sad = t > k ? 1 : 0; d.live(t); }; },
  },
  peor: {
    build(w) {
      const { P, tk } = zPre(w, 1, 7); const rex = w.add(z3Sp('rex')); const puff = zPuffs(w, [1.5, 0.3, 1.5], 6);
      return (t) => { P.pose(t); const k = w.K('rex'), u = p3Smoothstep(0, 1, p3Clamp((t - w.s.t0) / (k - w.s.t0))); rex.position.set(p3Lerp(14, 3.0, u), 0, -1.5); rex.rotation.y = Math.PI * 0.92; rex.live(t, { walk: u < 1 ? 0.7 : 0, jaw: t > k ? 0.5 * Math.exp(-(t - k) * 2) : 0.1 }); z3Silhouette(rex, t < k - 0.4);
        z3Cam(w, t, [-0.5, 3.0, 13.5], [1.5, 2.6, 0], [k]); zShake(w, t, k, 0.12); puff(t, k); zTicoP(w, tk, t); };
    },
  },
  // ===== 0:52 the Dilophosaurus
  dilofake: {
    build(w) {
      const { STU, tk } = zStudio(w); const df = w.add(z3Sp('diloFake')); df.position.set(0.2, 0, 0); df.rotation.y = 0.35; const spit = w.add(z3Spit());
      return (t) => { STU.pose(t); const s = w.K('spit'), f = w.K('frill'); z3Cam(w, t, [0.6, 1.3, 4.6], [0.4, 1.0, 0], [s, f]);
        df.live(t, { frill: zsp(t, f - 0.15) * 1.05, jaw: (t > s - 0.1 && t < s + 0.5 ? 0.9 : 0.15), yaw: 0 }); const u = p3Clamp((t - s) / 0.6); spit.visible = u > 0 && u < 1; spit.position.set(p3Lerp(1.0, 3.2, u), p3Lerp(1.45, 1.1, u) + Math.sin(u * Math.PI) * 0.3, 0.6); zTicoP(w, tk, t); };
    },
  },
  inventado: {
    build(w) { const { STU, tk } = zStudio(w); const df = w.add(z3Sp('diloFake')); df.position.set(0.2, 0, 0); df.rotation.y = 0.35; zStamp(w, 'INVENTADO', w.K('stamp'), 1380, 300);
      return (t) => { STU.pose(t); z3Cam(w, t, [0.6, 1.3, 4.8], [0.4, 1.0, 0], [w.K('stamp')]); df.live(t, { frill: 1, jaw: 0.1 }); zTicoP(w, tk, t); }; },
  },
  dilo: {
    build(w) { const { P, tk } = zPre(w, 0.8, 9); const dl = w.add(z3Sp('dilo')), tr = w.add(z3Truck()); dl.position.set(-1.5, 0, 0); tr.position.set(4.5, 0, -0.8); tr.rotation.y = -0.15; zChip(w, 'DILOFOSAURIO · 7 METROS', w.K('big'), 960, 860);
      return (t) => { P.pose(t); z3Cam(w, t, [1.0, 2.4, 11], [1.3, 1.7, 0], [w.K('big'), w.K('truck')]); dl.live(t, { walk: 0.3, jaw: 0.1, yaw: -0.2 }); zPop(tr, t, w.K('truck') - 0.3); zTicoP(w, tk, t); }; },
  },
  disfraz: {
    build(w) { const { tk, d } = zRoom(w); return (t) => { const k = w.K('frill'); zRoomCam(w, t, [k], 0.5, 5.4); tk.live(t); d.fx.frill = zsp(t, k - 0.2); d.force('cheer'); d.live(t); }; },
  },
  // ===== 1:12 the T. rex: posture
  rey: {
    build(w) { const { STU, tk } = zStudio(w); const city = w.add(z3ToyCity(18, 4)); const rex = w.add(z3Sp('rex')); rex.scale.setScalar(0.55); zChip(w, 'ASÍ LO DIBUJABAN', w.K('rey'), 1060, 830);
      return (t) => { STU.pose(t); const u = (t - w.s.t0) / (w.s.t1 - w.s.t0); rex.position.set(p3Lerp(-2.2, 1.2, u), 0, -0.4); rex.rotation.y = 0.25; rex.live(t, { walk: 0.5, upright: 1, jaw: 0.3 + 0.3 * Math.max(0, Math.sin(t * 2)), tail: 0.4 }); z3Cam(w, t, [0.5, 2.4, 9.6], [0.3, 1.8, 0], [w.K('rey'), w.K('cola')]); const st = Math.floor(t * 3); zShake(w, t, st / 3, 0.02); zTicoP(w, tk, t); }; },
  },
  huellas: {
    build(w) { const { P, tk } = zPre(w, 0.6, 11); const pr = w.add(z3Prints(7, 1.7)); pr.position.set(0.5, 0.02, 1.0); const ghost = w.add(z3Sp('rex')); ghost.scale.setScalar(0.38); ghost.position.set(3.2, 0, -2.5); const x = w.add(z3Cross(1.6)); x.position.set(3.4, 2.0, -2.0);
      zChip(w, 'NO HAY MARCA DE COLA', w.K('x') + 0.2, 1060, 830);
      return (t) => { P.pose(t); z3Cam(w, t, [0.4, 4.6, 8.8], [0.6, 0.6, 0], [w.K('x')]); ghost.live(t, { upright: 1, tail: 0.3 }); zPop(x, t, w.K('x')); pr.prints.forEach((p, i) => (p.visible = t > w.s.t0 + i * 0.18)); zTicoP(w, tk, t); }; },
  },
  subibaja: {
    build(w) { const { P, tk } = zPre(w, 0.8, 13); const rex = w.add(z3Sp('rex')); rex.position.set(-0.5, 0, -1); rex.rotation.y = 0.3; const ss = w.add(z3Seesaw()); ss.position.set(4.6, 0, 1.2); zChip(w, 'CONTRAPESO', w.K('sube'), 1260, 860);
      return (t) => { P.pose(t); const h = w.K('horiz'), up = 1 - p3Smoothstep(0, 1, p3Clamp((t - h + 0.1) / 0.9)); rex.live(t, { upright: up, tail: 0.6, jaw: 0.1 }); zPop(ss, t, w.K('sube') - 0.5); ss.tilt(0.18 * Math.sin(t * 2.2)); z3Cam(w, t, [1.2, 3.4, 15], [1.2, 2.6, 0], [h, w.K('sube')]); zTicoP(w, tk, t); }; },
  },
  quieto: {
    build(w) { const { P } = zPre(w, 0.8, 15); const rex = w.add(z3Sp('rex')); rex.position.set(2.6, 0, -2.0); rex.rotation.y = Math.PI * 0.85; const d = w.add(z3Dota()); d.position.set(-0.6, 0, 1.5); d.setPose('down');
      return (t) => { P.pose(t); const k = w.K('freeze'); rex.live(t, { jaw: 0.1, yaw: -0.2, pitch: -0.15 }); d.fx.freeze = t > k ? 1 : 0; d.force(t > k ? 'down' : 'explain'); d.live(t); z3Cam(w, t, [-0.6, 2.4, 9.5], [0.8, 2.0, 0], [k]); }; },
  },
  ojos: {
    build(w) { const { P, tk } = zPre(w, 0.8, 17); const rex = w.add(z3Sp('rex')); rex.position.set(-1.5, 0, 0); rex.rotation.y = 0.0; const vis = new THREE.Group(); const vc = z3Vision(7); vis.add(vc); w.add(vis); zChip(w, 'VEÍA CON PROFUNDIDAD', w.K('bien'), 1060, 860);
      return (t) => { P.pose(t); rex.live(t, { jaw: 0.05, pitch: -0.05 }); rex.head.updateMatrixWorld(true); const hp = new THREE.Vector3(); rex.head.getWorldPosition(hp); vis.position.copy(hp).add(new THREE.Vector3(0.6, 0.15, 0)); vis.visible = t > w.K('ojos'); vis.scale.setScalar(zsp(t, w.K('ojos')) + 0.001);
        z3Cam(w, t, [hp.x + 1.6, hp.y + 0.6, 4.8], [hp.x + 1.2, hp.y + 0.1, 0], [w.K('ojos'), w.K('bien')]); zTicoP(w, tk, t); }; },
  },
  mejor: {
    build(w) { const { P, tk } = zPre(w, 0.8, 15); const rex = w.add(z3Sp('rex')); rex.position.set(3.4, 0, -1.4); rex.rotation.y = Math.PI * 0.9; const d = w.add(z3Dota()); d.position.set(-0.4, 0, 1.2); d.setPose('down');
      return (t) => { P.pose(t); const k = w.K('sniff'), s = p3Smoothstep(0, 1, p3Clamp((t - k + 0.6) / 0.8)); rex.position.x = p3Lerp(3.4, 2.2, s); rex.live(t, { sniff: s, pitch: -0.35 * s, yaw: -0.3 }); d.fx.freeze = 1; d.fx.sweat = s; d.live(t); z3Cam(w, t, [-0.4, 2.6, 9.0], [0.9, 2.0, 0], [k]); zTicoP(w, tk, t); }; },
  },
  // ===== 1:49 the roar
  rugido: {
    build(w) { const { P, tk } = zPre(w, 0.8, 19); const rex = w.add(z3Sp('rex')); rex.position.set(-0.5, 0, -0.8); rex.rotation.y = 0.35; const hen = w.add(z3Bird('hen')), croc = w.add(z3Sp('croc')); hen.position.set(4.2, 0, 1.6); hen.rotation.y = -0.5; croc.position.set(2.6, 0, 2.6); croc.rotation.y = -0.2; zChip(w, 'SUS PARIENTES VIVOS', w.K('aves'), 1180, 860);
      return (t) => { P.pose(t); const r = w.K('roar'); rex.live(t, { jaw: t > r - 0.2 && t < r + 1.5 ? 0.95 : 0.1, pitch: t > r && t < r + 1.5 ? 0.15 : 0 }); zPop(hen, t, w.K('aves') - 0.1); hen.live(t, { peck: 1 }); zPop(croc, t, w.K('aves') + 0.25); croc.live(t, { jaw: 0.2 + 0.2 * Math.sin(t) }); z3Cam(w, t, [1.0, 3.0, 13], [1.3, 2.1, 0], [r, w.K('aves')]); zTicoP(w, tk, t); }; },
  },
  retumbo: {
    build(w) { const { P, tk } = zPre(w, 0.8, 21); const rex = w.add(z3Sp('rex')); rex.position.set(-1.5, 0, -1); rex.rotation.y = 0.35; const pd = w.add(z3Puddle()); pd.position.set(2.6, 0.02, 2.2); zStamp(w, 'SE CREE', w.K('cree'), 1300, 470, '#2fa8ff');
      return (t) => { P.pose(t); const b = w.K('boom'); rex.live(t, { jaw: 0, shake: t > b && t < b + 2.2 ? 0.5 : 0 }); pd.ripple(t, b); z3Cam(w, t, [1.4, 3.0, 12], [1.2, 1.6, 0], [b, w.K('agua')]); zShake(w, t, b, 0.03); zTicoP(w, tk, t); }; },
  },
  plumasrex: {
    build(w) { const { P } = zPre(w, 0.8, 23); const rex = w.add(z3Sp('rex')); rex.position.set(2.4, 0, -1.2); rex.rotation.y = Math.PI * 0.85; const d = w.add(z3Dota()); d.position.set(-0.6, 0, 1.2); d.setPose('down');
      return (t) => { P.pose(t); rex.live(t, { jaw: 0.1, yaw: -0.2 }); d.force('shrug'); d.live(t); z3Cam(w, t, [-0.4, 2.3, 8.6], [0.8, 1.9, 0], [w.K('dota')]); }; },
  },
  yuty: {
    build(w) { const { P, tk } = zPre(w, 0.8, 25); const yu = w.add(z3Sp('yuty')), rex = w.add(z3Sp('rex')); yu.position.set(-3.0, 0, -0.5); yu.rotation.y = 0.3; rex.position.set(4.6, 0, -2.0); rex.rotation.y = Math.PI * 0.85; zChip(w, 'YUTYRANNUS · 9 METROS', w.K('name'), 700, 860); zChip(w, 'T. REX', w.K('name') + 0.4, 1350, 860, '#ffffff');
      return (t) => { P.pose(t); yu.live(t, { walk: 0.3, jaw: 0.15 }); rex.live(t, { jaw: 0.1 }); z3Cam(w, t, [0.6, 3.6, 17], [0.6, 2.4, 0], [w.K('name')]); zTicoP(w, tk, t); }; },
  },
  escamas: {
    build(w) { const { P, tk } = zPre(w, 0.8, 27); const rex = w.add(z3Sp('rex')); rex.position.set(0.6, 0, -1.2); rex.rotation.y = 0.2; const d = w.add(z3Dota()); d.position.set(-2.5, 0, 0.8); d.setPose('up');
      const tufts = [...Array(7)].map((_, i) => { const f = new THREE.Group(); const m = z3Skin('#ff9a3a', 0.8); for (let k = 0; k < 4; k++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.6, 6), m); c.rotation.z = -0.6 + k * 0.4; c.position.y = 0.2; f.add(c); } f.add(z3BoxM(0.5, 0.14, 0.03, z3Mat('#f2efe6', 0.6), [0, 0, 0.2])); w.add(f); return { f, p: new THREE.Vector3(1.6 - i * 0.6, 3.0 + 0.6 * Math.sin(i), 1.0), v: new THREE.Vector3(-0.8 + i * 0.3, 3 + i * 0.4, 1.5) }; });
      zChip(w, 'ESCAMITAS', w.K('esc'), 1180, 860); zStamp(w, 'SE DISCUTE', w.K('shake') + 0.8, 1280, 470, '#ffb02e');
      return (t) => { P.pose(t); const tp = w.K('tape'), sh = w.K('shake'); rex.live(t, { shake: t > sh && t < sh + 1.2 ? 1 : 0, jaw: 0.1 }); d.force(t < sh ? 'reach' : 'shrug'); d.live(t);
        tufts.forEach(({ f, p, v }, i) => { const on = t > tp + i * 0.12; f.visible = on; const fly = Math.max(0, t - sh - 0.15); f.position.copy(p).addScaledVector(v, fly).add(new THREE.Vector3(0, -4.9 * fly * fly, 0)); f.rotation.set(fly * 6, 0, fly * 4); f.scale.setScalar(on ? zsp(t, tp + i * 0.12) : 0.001); });
        z3Cam(w, t, [0.2, 3.0, 13], [0.4, 2.2, 0], [w.K('esc'), tp, sh]); zTicoP(w, tk, t); }; },
  },
  // ===== 2:25 colours
  colores: {
    build(w) { const { STU, tk } = zStudio(w); const g = w.add(z3Sp('gray')); g.position.set(0, 0, 0); g.rotation.y = 0.3; const br = w.add(z3Brush('#4caf50')); const mats: THREE.MeshPhysicalMaterial[] = []; g.traverse((o) => { const m = (o as THREE.Mesh).material as THREE.MeshPhysicalMaterial; if (m && m.color && !mats.includes(m)) mats.push(m); });
      return (t) => { STU.pose(t); const k = w.K('paint'), u = p3Clamp((t - k + 0.4) / 1.6); g.live(t, { jaw: 0.1 }); mats.forEach((m, i) => m.color.set('#ffffff').lerp(new THREE.Color(i % 3 ? '#7ac25a' : '#a8784a'), u)); br.position.set(p3Lerp(-0.8, 1.6, u), 1.3 + 0.2 * Math.sin(t * 9), 0.55); br.rotation.z = 0.5 + 0.3 * Math.sin(t * 9); br.visible = t > k - 0.6; z3Cam(w, t, [0.6, 1.4, 5.6], [0.4, 1.0, 0], [k]); zTicoP(w, tk, t); }; },
  },
  bolsitas: {
    build(w) { const { STU, tk } = zStudio(w); const m = w.add(z3Microscope()); m.position.set(0.3, 1.6, 0); zChip(w, 'BOLSITAS DE COLOR', w.K('micro'), 1060, 880);
      return (t) => { STU.pose(t); const k = w.K('micro'); m.scale.setScalar(zsp(t, w.s.t0 + 0.15) * (1 + 0.2 * (t > k ? Math.exp(-(t - k) * 3) : 0)) + 0.001); m.rotation.z = t * 0.1; m.live(t); z3Cam(w, t, [0.3, 1.6, 5.6], [0.3, 1.55, 0], [k]); zTicoP(w, tk, t); }; },
  },
  sino: {
    build(w) { const { STU, tk } = zStudio(w); const s = w.add(z3Sp('sino')), rc = w.add(z3Raccoon()); s.position.set(-0.5, 0, 0); s.scale.setScalar(1.6); s.rotation.y = 0.35; rc.position.set(1.0, 0, 0.3); rc.rotation.y = -Math.PI * 0.85; zChip(w, 'SINOSAUROPTERYX', w.K('name'), 760, 860); zChip(w, 'MAPACHE', w.K('mapache'), 1300, 860, '#ffffff');
      return (t) => { STU.pose(t); s.live(t, { jaw: 0.15 * Math.max(0, Math.sin(t * 3)), tail: 1.2 }); zPop(rc, t, w.K('mapache') - 0.4); rc.live(t); z3Cam(w, t, [0.2, 1.0, 4.2], [0.25, 0.55, 0], [w.K('name'), w.K('mapache')]); zTicoP(w, tk, t); }; },
  },
  dientes: {
    build(w) { const { STU } = zStudio(w); const rc = w.add(z3Raccoon()), d = w.add(z3Dota()); rc.position.set(0.6, 0, 0); rc.rotation.y = -Math.PI * 0.8; d.position.set(-0.5, 0, 0.2); d.scale.setScalar(0.6); d.setPose('down'); d.side(1);
      return (t) => { STU.pose(t); rc.live(t); d.force('cheer'); d.live(t); z3Cam(w, t, [0.2, 0.85, 3.4], [0.05, 0.5, 0], [w.K('dota')]); }; },
  },
  // ===== 2:47 mums
  monstruos: {
    build(w) { const { STU, tk } = zStudio(w); const city = w.add(z3ToyCity(18, 8)); city.position.z = -2.2; const rex = w.add(z3Sp('rex')); rex.scale.setScalar(0.5); rex.position.set(-1.2, 0, 1.2); rex.rotation.y = 0.25; const victim = city.children[3] as THREE.Mesh; const v0 = victim.position.clone();
      return (t) => { STU.pose(t); const k = w.K('smash'); rex.live(t, { walk: 0.4, jaw: t > k - 0.3 && t < k + 0.6 ? 0.9 : 0.2 }); const f = Math.max(0, t - k); victim.position.set(v0.x + f * 2, v0.y + f * 4 - 4.9 * f * f, v0.z + f); victim.rotation.set(f * 5, f * 3, 0); z3Cam(w, t, [0.5, 2.6, 9.6], [0.3, 1.6, 0], [k]); zShake(w, t, k, 0.06); zTicoP(w, tk, t); }; },
  },
  nidos: {
    build(w) { const { P, tk } = zPre(w, 0.7, 31); const N = [[-3, -1], [-0.5, -2.2], [2, -1.2], [4.4, -2.4], [0.8, 0.8]].map(([x, z], i) => { const n = w.add(z3Nest(4, i)); n.position.set(x, 0, z); return n; });
      const babies = [...Array(6)].map((_, i) => { const b = w.add(z3Sp('maiaBaby')); b.position.set(-3.2 + i * 1.4, 0, -0.3 + (i % 2) * 1.2); b.rotation.y = (i % 2 ? -1 : 1) * 0.6; return b; }); const bigB = [0, 1].map((i) => { const b = w.add(z3Sp('maiaBaby')); b.scale.setScalar(1.8); b.position.set(1.0 + i * 2.6, 0, 1.8); b.rotation.y = -0.4; return b; });
      zChip(w, 'MONTANA, ESTADOS UNIDOS', w.K('montana'), 960, 860);
      return (t) => { P.pose(t); const ne = w.K('nidos'), cr = w.K('crias'); N.forEach((n, i) => { zPop(n, t, ne - 0.2 + i * 0.08); n.eggs.forEach((e, j) => (e.rotation.z = t > ne + 0.5 && (i + j) % 3 === 0 ? 0.15 * Math.sin(t * 20 + j) : 0)); });
        babies.forEach((b, i) => { zPop(b, t, cr + i * 0.1); b.live(t + i, { jaw: 0.3 * Math.max(0, Math.sin(t * 6 + i)), pitch: 0.4 }); }); bigB.forEach((b, i) => { zPop(b, t, cr + 0.5 + i * 0.15, 1.8); b.live(t + i, { walk: 0.3 }); });
        z3Cam(w, t, [0.6, 4.6, 11], [0.6, 0.6, -0.5], [w.K('montana'), ne, cr]); zTicoP(w, tk, t); }; },
  },
  madre: {
    build(w) { const { P, tk } = zPre(w, 0.7, 31); const n = w.add(z3Nest(0, 2)); n.position.set(1.2, 0, 0.8); const babies = [0, 1, 2].map((i) => { const b = w.add(z3Sp('maiaBaby')); b.position.set(0.8 + i * 0.4, 0.15, 0.6 + (i % 2) * 0.4); b.rotation.y = -Math.PI * 0.7; return b; });
      const mum = w.add(z3Sp('maia')); const lv = z3Leaves(); mum.head.add(lv); lv.position.set(0.9, -0.15, 0); zChip(w, 'MAIASAURA: «LAGARTO BUENA MADRE»', w.K('name'), 960, 860);
      return (t) => { P.pose(t); const c = w.K('comer'), u = p3Smoothstep(0, 1, p3Clamp((t - w.s.t0) / (c - w.s.t0))); mum.position.set(p3Lerp(-7, -2.2, u), 0, -0.6); mum.rotation.y = 0.15; mum.live(t, { walk: u < 1 ? 0.6 : 0, pitch: u >= 1 ? -0.5 * p3Clamp((t - c) / 0.5) : 0, yaw: 0 }); lv.visible = t < c + 0.8;
        babies.forEach((b, i) => { b.live(t + i, { jaw: 0.5 * Math.max(0, Math.sin(t * 8 + i)), pitch: 0.6 }); b.position.y = 0.15 + 0.06 * Math.abs(Math.sin(t * 8 + i)); }); z3Cam(w, t, [0.4, 3.6, 10.5], [0.0, 1.4, 0], [c, w.K('name')]); zTicoP(w, tk, t); }; },
  },
  enfermo: {
    build(w) { z3Room(w); const bed = w.add(z3Bed()); bed.position.set(0.7, 0, 0); const d = w.add(z3Dota()); d.position.set(1.15, 0.95, 0.85); d.rotation.z = Math.PI / 2; const mum = w.add(z3Sp('maia')); mum.scale.setScalar(0.42); mum.position.set(-2.0, 0, 1.4); const bowl = z3Bowl(); mum.head.add(bowl); bowl.position.set(1.2, -0.4, 0); bowl.scale.setScalar(1 / 0.42 * 0.8);
      return (t) => { const k = w.K('dota'); d.force('sick'); d.fx.thermo = 1; d.fx.sad = 0; d.live(t); mum.live(t, { walk: 0.2, pitch: -0.2 }); z3Cam(w, t, [-0.5, 2.5, 7.4], [-0.3, 1.1, 0], [k]); }; },
  },
  toneladas: {
    build(w) { z3Room(w); const bed = w.add(z3Bed()); bed.position.set(0.7, 0, 0); const d = w.add(z3Dota()); d.position.set(1.15, 0.95, 0.85); d.rotation.z = Math.PI / 2; const mum = w.add(z3Sp('maia')); mum.scale.setScalar(0.42); mum.position.set(-1.9, 0, 1.4); const tk = w.add(z3Tico()); tk.setPose('point'); zChip(w, 'VARIAS TONELADAS', w.K('ton'), 1200, 860);
      return (t) => { const k = w.K('ton'); d.force('sick'); d.fx.thermo = 1; d.fx.sad = 0; d.live(t); mum.live(t, { pitch: -0.2 }); bed.rotation.z = t > k && t < k + 0.8 ? 0.03 * Math.sin(t * 40) * Math.exp(-(t - k) * 3) : 0; z3Cam(w, t, [-0.3, 2.5, 7.4], [-0.1, 1.1, 0], [k]); zShake(w, t, k, 0.04); zTicoP(w, tk, t); }; },
  },
  shh: {
    build(w) { z3Room(w); const bed = w.add(z3Bed()); bed.position.set(0.7, 0, 0); const d = w.add(z3Dota()); d.position.set(1.15, 0.95, 0.85); d.rotation.z = Math.PI / 2; const mum = w.add(z3Sp('maia')); mum.scale.setScalar(0.42); mum.position.set(-1.9, 0, 1.4);
      return (t) => { d.force('shh'); d.fx.sweat = 0.6; d.live(t); mum.live(t, { pitch: -0.2, yaw: 0.3 }); z3Cam(w, t, [-0.2, 2.1, 5.8], [0.0, 1.1, 0], [w.K('shh')]); }; },
  },
  // ===== 3:19 the long necks
  lago: {
    bg: '#efe9dc',
    build(w) { z3PaperSet(w); const lk = w.add(z3Lake(7)); lk.position.set(0, 0, -2); const br = w.add(z3Sp('bronto')); br.scale.setScalar(0.5); br.position.set(-0.5, -0.4, -2); br.rotation.y = 0.4; const tk = w.add(z3Tico()); tk.setPose('point'); zChip(w, 'DIBUJO VIEJO', w.K('name'), 1200, 860, '#ffffff'); zChip(w, 'BRONTOSAURIO', w.K('lago'), 1200, 960);
      return (t) => { br.live(t, { jaw: 0.05 }); br.position.y = -0.4 + 0.05 * Math.sin(t * 1.3); z3Cam(w, t, [0.6, 3.6, 13], [0.4, 2.2, -2], [w.K('name'), w.K('lago')]); zTicoP(w, tk, t); }; },
  },
  tierra: {
    build(w) { const { P, tk } = zPre(w, 0.6, 35); const herd = [0, 1, 2].map((i) => { const b = w.add(z3Sp('bronto')); b.scale.setScalar(0.5 - i * 0.06); b.position.set(-2 - i * 4, 0, -2 - i * 2.5); b.rotation.y = 0.15; return b; }); zChip(w, 'EN TIERRA FIRME', w.K('sale'), 1100, 860);
      return (t) => { P.pose(t); herd.forEach((b, i) => { b.position.x = -2 - i * 4 + (t - w.s.t0) * 0.6; b.live(t + i, { walk: 0.6 }); }); z3Cam(w, t, [1.0, 4.6, 19], [0.0, 3.0, -2], [w.K('sale'), w.K('manada')]); zTicoP(w, tk, t); }; },
  },
  borrado: {
    build(w) { const { STU, tk } = zStudio(w); const id = w.add(z3IdCard('BRONTOSAURIO')); id.position.set(0.3, 1.8, 0); const yr = zHud(w, 420, 150, 1640, 640, (c, txt) => { c.fillStyle = '#14161d'; c.fillRect(10, 10, 400, 130); zFont(c, 80); c.fillStyle = '#fff'; c.fillText(txt, 210, 78); });
      return (t) => { STU.pose(t); const x = w.K('x'), s = w.K('stamp'); id.cross(p3Clamp((t - x) / 0.35)); id.stamp(t > s ? zsp(t, s) : 0); id.rotation.y = 0.15 * Math.sin(t * 0.7); const y = t < x ? 1903 : t < s ? Math.round(1903 + (2015 - 1903) * p3Clamp((t - x) / (s - x))) : 2015; yr.set(String(y), t > x - 0.3 ? 1 : 0); z3Cam(w, t, [0.1, 1.9, 6.2], [0.1, 1.75, 0], [x, s]); zTicoP(w, tk, t); }; },
  },
  contratar: {
    build(w) { const { STU } = zStudio(w); const id = w.add(z3IdCard('BRONTOSAURIO')); id.position.set(0.9, 1.8, -0.4); id.cross(1); id.stamp(1); const d = w.add(z3Dota()); d.position.set(-1.0, 0, 0.6); d.scale.setScalar(0.8); d.setPose('up'); const conf = w.add(z3Confetti());
      return (t) => { STU.pose(t); conf.pose(t, w.s.t0 + 0.3); d.force('cheer'); d.live(t); z3Cam(w, t, [0.1, 1.5, 5.0], [0.1, 1.2, 0], [w.K('dota')]); }; },
  },
  cuando: {
    build(w) { const { STU, tk } = zStudio(w); const ck = w.add(z3Clock()); ck.position.set(0.3, 1.9, 0); ck.scale.setScalar(2.4);
      return (t) => { STU.pose(t); const k = w.K('cuando'); ck.tick((t - w.s.t0) * (t > k ? 30 : 4)); ck.rotation.z = t > k ? 0.06 * Math.sin(t * 30) * Math.exp(-(t - k) * 2) : 0; z3Cam(w, t, [0.3, 2.0, 6.4], [0.3, 1.9, 0], [k]); zTicoP(w, tk, t); }; },
  },
  // ===== 3:56 not all at the same time
  vecinos: {
    build(w) { const { P, tk } = zPre(w, 0.6, 41); const all = [['rex', -3.5, -2, 0.6], ['trike', 1.0, -1.6, 0.7], ['stego', 4.5, -3.0, 0.7], ['bronto', -0.5, -7, 0.45], ['dilo', 6.5, -1.0, 0.8], ['spino', -6.5, -3.5, 0.6], ['raptor', 0.5, 1.0, 2.0]].map(([k, x, z, s], i) => { const d = w.add(z3Sp(k as string)); d.scale.setScalar(s as number); d.position.set(x as number, 0, z as number); d.rotation.y = (i % 2 ? -1 : 1) * 0.4; return d; });
      zChip(w, '¿VECINOS?', w.K('vec'), 960, 860);
      return (t) => { P.pose(t); all.forEach((d, i) => d.live(t + i, { jaw: 0.15 * Math.max(0, Math.sin(t * 2 + i)), yaw: 0.2 * Math.sin(t * 0.8 + i) })); z3Cam(w, t, [0.4, 5.0, 19], [0.2, 2.0, -2], [w.K('vec')]); zTicoP(w, tk, t); }; },
  },
  tres: {
    build(w) { const { STU, tk } = zStudio(w); const tape = w.add(z3Tape(14)); tape.position.set(0.3, 0.02, 0.6); const num = zNum(w, 960, 300, 'MILLONES DE AÑOS');
      return (t) => { STU.pose(t); const n = w.K('n160'), keys = [w.K('tri'), w.K('jur'), w.K('cre')]; tape.segs.forEach(({ m }, i) => { const v = zsp(t, keys[i] - 0.3); m.scale.set(Math.max(0.001, v), 1, 1); m.visible = t > keys[i] - 0.35; }); num.set(zDots(160 * p3Smoothstep(0, 1, p3Clamp((t - w.s.t0) / (n + 0.5 - w.s.t0)))), 1);
        z3Cam(w, t, [0.3, 4.4, 10.5], [0.3, 0.3, 0.6], [n, ...keys], 40, 0.4); zTicoP(w, tk, t); }; },
  },
  cretacico: {
    build(w) { const { STU, tk } = zStudio(w); const tape = w.add(z3Tape(14)); tape.position.set(0.3, 0.02, 0.6); const cre = tape.segs[2]; const minis = [['rex', 0.16, 'rex'], ['raptor', 0.9, 'raptor'], ['trike', 0.2, 'trike']].map(([k, s], i) => { const d = w.add(z3Sp(k as string)); d.scale.setScalar(s as number); return { d, i }; });
      return (t) => { STU.pose(t); const ks = [w.K('rex'), w.K('raptor'), w.K('trike')]; minis.forEach(({ d, i }) => { const u = p3Smoothstep(0, 1, p3Clamp((t - ks[i] + 0.6) / 0.9)); d.position.set(p3Lerp(-7 + i, cre.c + 0.3 + (i - 1) * 1.4, u), 0.1, 0.6 + (i - 1) * 0.15); d.rotation.y = 0; d.live(t, { walk: u < 1 ? 0.8 : 0 }); d.visible = t > ks[i] - 0.6; });
        z3Cam(w, t, [3.6, 3.0, 7.5], [3.2, 0.4, 0.6], ks, 40, 0.4); zTicoP(w, tk, t); }; },
  },
  escupe: {
    build(w) { const { STU } = zStudio(w); const tape = w.add(z3Tape(14)); tape.position.set(0.3, 0.02, 0.6); const dl = w.add(z3Sp('dilo')); dl.scale.setScalar(0.3); dl.position.set(-1.0, 0.1, 0.6); const d = w.add(z3Dota()); d.position.set(-0.2, 0.1, 1.0); d.scale.setScalar(0.7); d.setPose('down');
      return (t) => { STU.pose(t); dl.live(t, { jaw: 0.1 }); d.force('point'); d.live(t); z3Cam(w, t, [-0.4, 1.9, 5.5], [-0.4, 0.8, 0.6], [w.K('dota')]); }; },
  },
  jurasico: {
    build(w) { const { STU, tk } = zStudio(w); const tape = w.add(z3Tape(14)); tape.position.set(0.3, 0.02, 0.6); const jur = tape.segs[1], cre = tape.segs[2]; const dl = w.add(z3Sp('dilo')); dl.scale.setScalar(0.3); const rex = w.add(z3Sp('rex')); rex.scale.setScalar(0.16); rex.position.set(cre.c + 0.3, 0.1, 0.6); const d = w.add(z3Dota()); d.scale.setScalar(0.6); d.setPose('down');
      zChip(w, '+100 MILLONES DE AÑOS ANTES', w.K('jur') + 0.5, 960, 860);
      return (t) => { STU.pose(t); const g = w.K('tug'), pull = p3Smoothstep(0, 1, p3Clamp((t - w.s.t0 - 0.3) / (g - w.s.t0 - 0.3))), back = t > g ? 1 - Math.exp(-(t - g) * 4) * Math.cos((t - g) * 9) : 0;
        const x = p3Lerp(jur.c + 0.3, cre.c - 0.9, pull * (1 - back)); dl.position.set(x, 0.1, 0.6); dl.live(t, { walk: 0.3 }); d.position.set(x + 0.6, 0.1, 1.0); d.force(t < g ? 'reach' : 'shrug'); d.crazy(t > g + 0.2 && t < g + 1.6); d.live(t); rex.live(t, { jaw: 0.1 }); rex.rotation.y = Math.PI;
        z3Cam(w, t, [1.0, 3.0, 8.0], [1.4, 0.4, 0.6], [w.K('jur'), g], 40, 0.4); zTicoP(w, tk, t); }; },
  },
  pelea: {
    build(w) { const { P, tk } = zPre(w, 0.7, 45); const st = w.add(z3Sp('stego')), rex = w.add(z3Sp('rex')); st.position.set(-3.6, 0, -0.5); st.rotation.y = 0; rex.position.set(4.0, 0, -0.8); rex.rotation.y = Math.PI; zChip(w, 'EN LAS PELÍCULAS', w.s.t0 + 0.3, 960, 860, '#ffffff');
      return (t) => { P.pose(t); const k = w.K('fight'); rex.position.x = 4.0 - 1.4 * p3Smoothstep(0, 1, p3Clamp((t - k + 0.6) / 0.5)); rex.live(t, { jaw: t > k - 0.5 ? 0.9 : 0.3, walk: 0.3 }); st.live(t, { tail: t > k ? 3 : 1, yaw: 0.2 }); z3Cam(w, t, [0.3, 3.2, 15], [0.3, 2.0, 0], [k]); zShake(w, t, k, 0.05); zTicoP(w, tk, t); }; },
  },
  linea: {
    build(w) { const { STU, tk } = zStudio(w); const tl = w.add(z3Timeline(12)); tl.position.set(0, 0.02, 0.6); const st = w.add(z3Sp('stego')), rex = w.add(z3Sp('rex')), tu = w.add(z3Fig('tu')); st.scale.setScalar(0.3); rex.scale.setScalar(0.22); tu.scale.setScalar(0.6); st.position.set(-4.6, 0.12, 0.6); rex.position.set(2.2, 0.12, 0.6); rex.rotation.y = Math.PI; tu.position.set(5.0, 0.12, 0.6);
      const a1 = zNum(w, 620, 300, 'MILLONES DE AÑOS'), a2 = zNum(w, 1300, 300, 'MILLONES DE AÑOS');
      return (t) => { STU.pose(t); const s = w.K('stego'), ti = w.K('ti'); st.live(t, {}); rex.live(t, {}); tu.live(t, { mood: 'happy', arms: t > ti ? 'up' : 'down' }); zPop(tu, t, ti - 0.3, 0.6); a1.set('~80', t > s + 0.3 ? 1 : 0); a2.set('66', t > ti - 0.2 ? 1 : 0); const u = p3Smoothstep(0, 1, p3Clamp((t - w.s.t0) / (w.s.t1 - w.s.t0)));
        z3Cam(w, t, [0.3, 2.4, 9.5], [0.3, 0.8, 0.6], [s, ti], 40, 0.2); zTicoP(w, tk, t); void u; }; },
  },
  mas: {
    build(w) { const { STU } = zStudio(w); const d = w.add(z3Dota()); d.position.set(0, 0, 0.3); d.setPose('up'); return (t) => { STU.pose(t); d.force('shrug'); d.live(t); z3Cam(w, t, [0.1, 1.1, 4.6], [0.0, 0.8, 0], [w.K('dota')]); }; },
  },
  espino: {
    build(w) { z3MapSet(w); const mp = w.add(z3WorldMap()); const sp = w.add(z3Sp('spino')), rex = w.add(z3Sp('rex')); sp.scale.setScalar(0.14); rex.scale.setScalar(0.14); sp.position.set(0.6, 0, -0.5); rex.position.set(-4.4, 0, -2.1); const tk = w.add(z3Tico()); tk.setPose('point'); zChip(w, 'ÁFRICA', w.K('spino') + 0.3, 1180, 640); zChip(w, 'NORTEAMÉRICA', w.K('cont'), 560, 470);
      return (t) => { zPop(sp, t, w.K('spino'), 0.14); zPop(rex, t, w.K('cont'), 0.14); sp.live(t, {}); rex.live(t, {}); z3Cam(w, t, [-1.2, 8.5, 6.5], [-1.2, 0, -1.0], [w.K('spino'), w.K('cont')], 40, 0.4); zTicoP(w, tk, t); void mp; }; },
  },
  trike: {
    build(w) { const { P, tk } = zPre(w, 0.7, 47); const tr = w.add(z3Sp('trike')), rex = w.add(z3Sp('rex')); tr.position.set(-3.6, 0, -0.5); rex.position.set(4.2, 0, -0.8); rex.rotation.y = Math.PI; zMark(w, true, w.K('check'), 960, 380);
      return (t) => { P.pose(t); const f = w.K('face'); tr.live(t, { yaw: 0.1 * Math.sin(t * 2) }); rex.live(t, { jaw: t > f - 0.2 && t < f + 1 ? 0.8 : 0.2 }); z3Cam(w, t, [0.3, 3.0, 15], [0.3, 1.9, 0], [f, w.K('check')]); zShake(w, t, f, 0.04); zTicoP(w, tk, t); }; },
  },
  humanos: {
    build(w) { const { P, tk } = zPre(w, 0.6, 49); const br = w.add(z3Sp('bronto')); br.scale.setScalar(0.4); const cv = w.add(z3Fig('caveman')); cv.scale.setScalar(0.8);
      const tl = zHud(w, 1400, 230, 960, 760, (c) => { c.fillStyle = 'rgba(20,22,29,0.85)'; c.fillRect(0, 0, 1400, 230); c.fillStyle = '#3ab07a'; c.fillRect(40, 70, 420, 40); c.fillStyle = '#ff6a3d'; c.fillRect(1250, 70, 110, 40); c.setLineDash([16, 14]); c.strokeStyle = '#d4ff3a'; c.lineWidth = 8; c.beginPath(); c.moveTo(470, 90); c.lineTo(1240, 90); c.stroke(); c.setLineDash([]); zFont(c, 40); c.fillStyle = '#fff'; c.fillText('DINOSAURIOS', 250, 165); c.fillText('HUMANOS', 1305, 165); c.fillStyle = '#d4ff3a'; c.fillText('+60 MILLONES DE AÑOS', 855, 165); }, w.K('gap'));
      const pz = zHud(w, 200, 200, 1680, 230, (c) => { c.fillStyle = 'rgba(20,22,29,0.85)'; c.beginPath(); c.arc(100, 100, 90, 0, 7); c.fill(); c.fillStyle = '#fff'; c.fillRect(62, 55, 26, 90); c.fillRect(112, 55, 26, 90); }, w.K('pausa')); tl.set('t'); pz.set('p');
      return (t) => { P.pose(t); const pa = w.K('pausa'), tf = Math.min(t, pa), u = (tf - w.s.t0) / (w.s.t1 - w.s.t0); br.position.set(p3Lerp(-8, 6, u), 0, -5); br.live(tf, { walk: 1 }); const hp = new THREE.Vector3(); br.updateMatrixWorld(true); cv.position.set(br.position.x + 0.2, 1.95 + 0.05 * Math.abs(Math.sin(tf * 6)), -5); cv.live(tf, { arms: 'up', mood: 'happy' }); void hp;
        z3Cam(w, t, [0.5, 3.2, 12], [0.5, 2.2, -2], [pa, w.K('gap')], 40, t > pa ? 0 : 0.9); zTicoP(w, tk, t); }; },
  },
  nadie: {
    build(w) { const { STU } = zStudio(w); const d = w.add(z3Dota()), tk = w.add(z3Tico()); d.position.set(0.6, 0, 0.3); d.setPose('down'); tk.position.set(-0.8, 0, 0); tk.setPose('cross'); tk.side(1); d.side(-1);
      return (t) => { STU.pose(t); d.fx.sad = t > w.K('nadie') ? 1 : 0; d.live(t); tk.live(t); z3Cam(w, t, [0.0, 1.45, 5.2], [-0.1, 1.15, 0], [w.K('nadie')]); }; },
  },
  // ===== 5:07 not everything prehistoric is a dinosaur
  ptero: {
    build(w) { const { P, tk } = zPre(w, 0.6, 51); const ps = [0, 1, 2, 3].map((i) => { const p = w.add(z3Ptero(i === 2 ? '#a88a6e' : '#b8945e')); p.scale.setScalar(1.6 - i * 0.25); return p; }); zChip(w, 'PTEROSAURIOS', w.K('ptero'), 960, 840); zStamp(w, 'NO SON DINOSAURIOS', w.K('no'), 1250, 450);
      return (t) => { P.pose(t); ps.forEach((p, i) => { const u = ((t - w.s.t0) * 0.12 + i * 0.27) % 1; p.position.set(p3Lerp(-12, 12, u), 5.5 + i * 0.9 + 0.4 * Math.sin(t + i), -3 - i * 2.5); p.live(t, i * 1.3); }); z3Cam(w, t, [0.4, 1.8, 12], [0.4, 5.6, -3], [w.K('ptero'), w.K('no')]); zTicoP(w, tk, t); }; },
  },
  mosa: {
    build(w) { const S = z3Sea(w); const ms = w.add(z3Mosa()), sh = w.add(z3Shark()); const tk = w.add(z3Tico()); tk.setPose('point'); const spl = zPuffs(w, [0.8, 0.2, 0], 7, '#ffffff'); zChip(w, 'MOSASAURIO', w.K('jump'), 960, 840); zChip(w, 'PARIENTE DE LAS LAGARTIJAS', w.K('eat') + 0.9, 960, 940, '#ffffff');
      return (t) => { S.pose(t); const j = w.K('jump'), e = w.K('eat'), u = p3Clamp((t - j + 0.3) / 1.6); ms.position.set(p3Lerp(-4, 4, u), -2.2 + 5.2 * Math.sin(u * Math.PI), 0); ms.rotation.z = p3Lerp(0.9, -0.9, u); ms.live(t, t > e - 0.35 && t < e ? 1 : 0.15); sh.visible = t < e; sh.position.set(1.1, 1.5 + 0.2 * Math.sin(t * 3), 0); sh.rotation.z = 0.3 * Math.sin(t * 4); spl(t, j - 0.1);
        z3Cam(w, t, [0.4, 2.4, 13], [0.4, 1.8, 0], [j, e]); zTicoP(w, tk, t); }; },
  },
  dimetro: {
    build(w) { const { P } = zPre(w, 0.7, 53); const dm = w.add(z3Sp('dimetro')), tk = w.add(z3Tico()); dm.position.set(0.9, 0, 0); dm.rotation.y = Math.PI * 0.95; tk.position.set(-1.2, 0, 0.4); tk.side(1); zChip(w, 'DIMETRODON · ANTES DE LOS DINOSAURIOS', w.K('name'), 960, 860);
      return (t) => { P.pose(t); const m = w.K('mano'); dm.live(t, { walk: t < m - 0.8 ? 0.4 : 0, jaw: 0.1, pitch: t > m ? 0.3 : 0 }); dm.position.x = p3Lerp(2.6, 0.8, p3Smoothstep(0, 1, p3Clamp((t - w.s.t0) / (m - w.s.t0 - 0.6)))); tk.force(t > m - 0.4 ? 'explain' : null); tk.live(t); z3Cam(w, t, [-0.1, 1.7, 6.2], [-0.1, 1.0, 0], [w.K('name'), m]); }; },
  },
  primo: {
    build(w) { const { P } = zPre(w, 0.7, 53); const dm = w.add(z3Sp('dimetro')), d = w.add(z3Dota()); dm.position.set(0.7, 0, 0); dm.rotation.y = Math.PI * 0.95; d.position.set(-0.3, 0, 0.5); d.scale.setScalar(0.7); d.side(1);
      return (t) => { P.pose(t); dm.live(t, { jaw: 0.2 }); d.force('hugR'); d.live(t); z3Cam(w, t, [0.1, 1.2, 4.2], [0.1, 0.75, 0], [w.K('dota')]); }; },
  },
  // ===== 5:29 the end of the dinosaurs
  acabaron: {
    build(w) { const { P, tk } = zPre(w, 0.7, 57); const d = w.add(z3Dota()); d.position.set(0.8, 0, 1.0); d.setPose('down'); const sh = w.add(z3Sp('deino')); sh.scale.setScalar(2.2); sh.position.set(2.6, 0, -3.5); sh.rotation.y = Math.PI * 0.8; z3Silhouette(sh, true, '#2a2430'); const num = zNum(w, 1300, 300, 'AÑOS ATRÁS');
      return (t) => { P.pose(t); const s = w.K('shadow'), n = w.K('n66'); const peek = t > s - 0.2 && t < s + 1.1; sh.visible = peek; sh.live(t, { jaw: 0.3, pitch: -0.2 }); sh.position.x = 2.6 + (peek ? -0.6 * Math.sin(p3Clamp((t - s + 0.2) / 1.3) * Math.PI) : 0); d.force(t > s + 1.0 && t < s + 2.5 ? 'scratch' : null); d.live(t);
        num.set(zDots(66000000 * p3Smoothstep(0, 1, p3Clamp((t - n + 0.8) / 1.0))), t > n - 0.8 ? 1 : 0); z3Cam(w, t, [0.4, 2.0, 8.0], [0.8, 1.5, 0], [s, n]); zTicoP(w, tk, t); }; },
  },
  asteroide: {
    build(w) { z3MapSet(w); const mx = w.add(z3Mexico()); const ast = w.add(z3Asteroid()); ast.scale.setScalar(0.5); const tk = w.add(z3Tico()); tk.setPose('point'); const fl = new THREE.PointLight('#ffb070', 0, 20); w.add(fl); zChip(w, 'YUCATÁN', w.K('yuc'), 1240, 660); zChip(w, 'CRÁTER DE CHICXULUB', w.K('chic'), 1240, 760, '#ffffff');
      return (t) => { const a = w.K('ast'), y = w.K('yuc'), u = p3Clamp((t - a + 0.6) / 1.4); const Y = mx.yuc; ast.position.set(p3Lerp(Y.x - 9, Y.x, u), p3Lerp(9, Y.y + 0.2, u), p3Lerp(Y.z - 4, Y.z, u)); ast.rotation.z = -0.6; ast.rotation.y = 0.4; ast.visible = u < 1; fl.position.copy(Y).add(new THREE.Vector3(0, 1, 0)); fl.intensity = u >= 1 ? 60 * Math.exp(-(t - a - 0.8) * 2) : 0;
        mx.pulse(t, t > y - 0.3 ? 1 : 0); z3Cam(w, t, [Y.x - 0.5, 7.0, Y.z + 6.5], [Y.x - 1.5, 0, Y.z - 0.3], [a, y, w.K('chic')], 40, 0.5); zShake(w, t, a + 0.8, 0.08); zTicoP(w, tk, t); }; },
  },
  polvo: {
    build(w) { const P = z3Prehist(w, { dense: 1, seed: 59 }); const tk = w.add(z3Tico()); tk.setPose('point'); const ds = [['rex', -4, -3, 0.6], ['trike', 3.4, -2.6, 0.7], ['bronto', -1, -9, 0.4], ['stego', 7, -5, 0.6]].map(([k, x, z, s]) => { const d = w.add(z3Sp(k as string)); d.scale.setScalar(s as number); d.position.set(x as number, 0, z as number); return d; }); const tiny = w.add(z3Sp('raptor')); tiny.position.set(0.6, 0, 1.6); tiny.scale.setScalar(1.6); tiny.rotation.y = 0.3;
      const glow = new THREE.PointLight('#ffd88a', 0, 3); w.add(glow);
      return (t) => { const pk = w.K('polvo'), pl = w.K('plantas'), dk = w.K('dinos'), ash = p3Smoothstep(0, 1, p3Clamp((t - pk + 0.2) / 2.2)); P.pose(t, ash * 0.9); for (const tr of Z3_TREES) if (tr.parent === w.scene) tr.scale.y = Math.max(0.15, 1 - p3Clamp((t - pl) / 1.5) * 0.7) * (tr.userData.s0 ?? (tr.userData.s0 = tr.scale.x));
        ds.forEach((d, i) => { const f = p3Clamp((t - dk + 1.6 - i * 0.35) / 0.5); d.visible = f < 1; d.scale.setScalar(Math.max(0.001, (d.userData.s0 ?? (d.userData.s0 = d.scale.x)) * (1 - f))); d.live(t, { walk: 0.3 }); }); tiny.live(t, { jaw: 0.1 }); glow.position.set(0.8, 1.2, 2.2); glow.intensity = ash * 4;
        z3Cam(w, t, [0.4, 2.6, 11], [0.4, 1.6, -1], [pk, pl, dk]); zTicoP(w, tk, t); }; },
  },
  casi: {
    build(w) { const P = z3Prehist(w, { dense: 0.6, seed: 59 }); const tiny = w.add(z3Sp('raptor')); tiny.position.set(0.4, 0, 0.6); tiny.scale.setScalar(1.8); tiny.rotation.y = 0.3; const tk = w.add(z3Tico()); tk.setPose('point'); const d = w.add(z3Dota()); const glow = new THREE.PointLight('#ffd88a', 6, 4); glow.position.set(0.8, 1.4, 1.6); w.add(glow);
      return (t) => { P.pose(t, 0.85); tiny.live(t, { jaw: 0.1, yaw: 0.2 * Math.sin(t) }); z3Cam(w, t, [0.4, 1.2, 4.6], [0.4, 0.75, 0], [w.K('casi')]); zTicoP(w, tk, t); zDotaP(w, d, t); }; },
  },
  // ===== 5:52 the promised answer
  aves: {
    build(w) { const { STU, tk } = zStudio(w); const stages = [w.add(z3Sp('raptor')), w.add(z3Sp('sino')), w.add(z3Bird('pigeon')), w.add(z3Bird('hen'))]; stages[0].scale.setScalar(2.2); stages[1].scale.setScalar(2.4); stages[2].scale.setScalar(2.6); stages[3].scale.setScalar(2.4); const flash = zPuffs(w, [0.3, 0.8, 0.4], 6, '#ffffff'); zChip(w, 'LAS AVES SON DINOSAURIOS', w.K('son'), 960, 860);
      return (t) => { STU.pose(t); const ks = [w.K('vivo'), w.K('aves'), w.K('son')]; let st = 0; ks.forEach((k) => { if (t > k) st++; }); stages.forEach((m, i) => { m.visible = i === st; m.position.set(0.2, 0, 0); m.rotation.y = 0.35; }); const s0 = stages[st] as THREE.Object3D & { live: (t: number, o?: object) => void }; s0.live(t, {}); const lk = ks.filter((k) => t > k).pop(); if (lk) flash(t, lk);
        z3Cam(w, t, [0.3, 1.5, 5.0], [0.3, 1.0, 0], ks); zTicoP(w, tk, t); }; },
  },
  rama: {
    build(w) { const { STU, tk } = zStudio(w); const trunk = w.add(z3Branch([0, 0.2, -0.2], [0, 1.8, -0.2], '#8a6a4a', 0.14)); const ends: [number, number][] = [[-2.6, 3.6], [-1.4, 4.0], [1.4, 4.0], [2.6, 3.6]]; const br = ends.map(([x, y]) => w.add(z3Branch([0, 1.8, -0.2], [x, y, -0.2], '#8a6a4a', 0.09))); const live = w.add(z3Branch([0, 1.8, -0.2], [0, 4.6, -0.2], '#d4ff3a', 0.12)); const hen = w.add(z3Bird('hen')); hen.position.set(0, 4.6, -0.2); hen.scale.setScalar(1.3);
      const xs = ends.map(([x, y]) => { const c = w.add(z3Cross(0.5)); c.position.set(x, y + 0.2, 0); return c; }); zChip(w, 'SOBREVIVIÓ', w.K('rama') + 0.6, 1340, 330);
      return (t) => { STU.pose(t); trunk.grow(1); br.forEach((b) => b.grow(1)); xs.forEach((x) => (x.visible = true)); const k = w.K('rama'); live.grow(p3Smoothstep(0, 1, p3Clamp((t - k) / 0.8))); zPop(hen, t, k + 0.7, 1.3); hen.live(t, { peck: 0.5 }); z3Cam(w, t, [0.3, 2.8, 9.5], [0.2, 2.6, 0], [k]); zTicoP(w, tk, t); }; },
  },
  gallina: {
    build(w) { z3Park(w); const hen = w.add(z3Bird('hen')); hen.position.set(0.3, 0, 0.8); hen.scale.setScalar(1.4); hen.rotation.y = 0.4; const tk = w.add(z3Tico()); tk.setPose('point'); const d = w.add(z3Dota());
      return (t) => { const v = w.K('voltea'); const turn = p3Smoothstep(0, 1, p3Clamp((t - v + 0.2) / 0.3)); hen.rotation.y = 0.4 + turn * 1.15; hen.live(t, { peck: t < v - 0.3 ? 1 : 0, angry: t > v, turn: 0 }); z3Cam(w, t, [0.3, 1.2, 4.2], [0.3, 0.95, 0.8], [w.K('gallina'), v], 40, t > v ? 0 : 0.6); zShake(w, t, v, 0.07); zTicoP(w, tk, t); zDotaP(w, d, t); }; },
  },
  consejo: {
    build(w) { z3Park(w); const tk = w.add(z3Tico()), d = w.add(z3Dota()); tk.position.set(-0.8, 0, 1.4); d.position.set(0.8, 0, 1.6); tk.side(1); d.side(-1); const pig = w.add(z3Bird('pigeon')); pig.position.set(2.4, 0, 2.2);
      return (t) => { tk.live(t); d.live(t); pig.live(t, { peck: 1 }); z3Cam(w, t, [0.2, 1.6, 7.6], [0.2, 1.2, 1.4], [w.K('creas')]); }; },
  },
  palomas: {
    build(w) { z3Park(w); const pig = w.add(z3Bird('pigeon')); pig.position.set(0.9, 0, 1.8); pig.scale.setScalar(1.5); pig.rotation.y = Math.PI * 0.85; const d = w.add(z3Dota()); d.position.set(-0.5, 0, 1.8); d.scale.setScalar(0.65); d.side(1); const tk = w.add(z3Tico());
      return (t) => { const k = w.K('paloma'); pig.live(t, { angry: t > k, look: t > k ? 0.3 : 0 }); d.force(t > k ? 'shh' : 'explain'); d.position.y = 0; d.rotation.z = t > k ? -0.15 : 0; d.live(t); z3Cam(w, t, [0.2, 1.0, 5.0], [0.2, 0.7, 1.8], [k]); zTicoP(w, tk, t); }; },
  },
  sub: {
    bg: '#fff3d6',
    build(w) {
      p3Lights(w, '#fff6e0', '#e8c27a'); const rays = w.add(z3Rays('#ffe08a', 30)); rays.position.set(0, 2, -6);
      const tk = w.add(z3Tico()), d = w.add(z3Dota()), hen = w.add(z3Bird('hen')); tk.position.set(-2.4, -2.3, 0); hen.scale.setScalar(1.3);
      const sub = z3Html(w, '¡SUSCRÍBANSE!', 'left:960px;top:250px;transform:translateX(-50%);font:900 76px var(--font);color:#fff;-webkit-text-stroke:10px #14161d;paint-order:stroke fill;background:#ff5a5f;border:9px solid #14161d;border-radius:60px;padding:6px 44px;white-space:nowrap;opacity:0');
      const logo = z3Html(w, '<span style="color:#3270e6">Idio</span><span style="color:#ff7a3d">-</span><span style="color:#ffc83d">two</span>', 'left:960px;top:360px;transform:translateX(-50%);font:900 150px var(--font);letter-spacing:-4px;-webkit-text-stroke:15px #2b1a14;paint-order:stroke fill;text-shadow:10px 14px 0 rgba(0,0,0,.16);white-space:nowrap;opacity:0');
      w.tl.fromTo(logo, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' }, w.s.t0 + 0.05).fromTo(sub, { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.4)' }, w.s.t0 + 0.3).to(sub, { scale: 1.08, duration: 0.25, yoyo: true, repeat: 5, ease: 'sine.inOut' }, w.s.t0 + 1.0);
      return (t) => { rays.rotation.z = t * 0.25; const k = w.K('pollo'), run = t > k - 0.6, x = run ? p3Lerp(0.4, 3.6, p3Clamp((t - k + 0.6) / 2.6)) : 0.4; d.position.set(x, -2.3 + (run ? 0.12 * Math.abs(Math.sin(t * 14)) : 0), 0.2); d.crazy(run); d.force(run ? 'cheer' : null); d.live(t); hen.position.set(x - 1.4, -2.3, 0.1); hen.rotation.y = 0; hen.live(t, { run: run ? 1 : 0, angry: true, flap: run ? 1 : 0.3 }); tk.force(t > k - 0.3 ? 'cover' : null); tk.live(t); w.look([0, 0.6, 11.5], [0, -0.1, 0], 40); };
    },
  },
});

// every scene: the finish (depth of field, grade), dust in the light, swaying plants, key bursts, 2D cut-outs facing the camera
for (const id of Object.keys(VISUALS)) { const V = VISUALS[id], b = V.build; V.build = (w) => {
  z3Finish(w); let tgt = new THREE.Vector3(0, 1, 0); const look0 = w.look.bind(w); w.look = (p, q, f) => { tgt = new THREE.Vector3(...q); look0(p, q, f); };
  const pose = b(w), keys = (w.s.keys || []).map((k) => w.K(k.id)); let q0: THREE.Quaternion | null = null;
  const dust = z3Dust(); w.scene.add(dust);
  const bursts = (w.s.keys || []).filter((k) => k.sfx && /pop|hit|impact|shimmer/.test(k.sfx)).map((k) => w.K(k.id));
  const rings = [0, 1].map((i) => { const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 64), new THREE.MeshBasicMaterial({ color: i ? '#ffffff' : '#d4ff3a', transparent: true, opacity: 0, depthWrite: false, toneMapped: false, fog: false, side: THREE.DoubleSide })); w.scene.add(m); return m; }); const tint = new THREE.Color('#ffffff');
  w.scene.traverse((o) => {
    const l = o as THREE.DirectionalLight; if (l.isDirectionalLight && l.castShadow) { l.shadow.bias = -0.0004; l.shadow.normalBias = 0.03; l.shadow.mapSize.set(2048, 2048); l.shadow.radius = 4; l.intensity *= 1.1; l.color.lerp(new THREE.Color('#ffe9c9'), 0.4); }
    const h = o as THREE.HemisphereLight; if (h.isHemisphereLight) tint.copy(new THREE.Color('#ffffff').lerp(h.color, 0.3));
  });
  return (t) => {
    P3_T.value = t; Z3_KEYS = keys; Z3_FOCUS_OVR = -1; Z3_BOTH = 0; Z3_HEAT = 0; if (q0) w.camera.quaternion.copy(q0); pose(t); q0 = w.camera.quaternion.clone();
    const n = (a: number, c: number) => Math.sin(t * a + c); w.camera.rotateX(0.004 * (n(0.9, 1) + 0.6 * n(2.3, 4))); w.camera.rotateY(0.004 * (n(0.7, 2) + 0.6 * n(1.9, 5))); w.camera.rotateZ(0.0025 * n(0.5, 3)); w.camera.updateMatrixWorld(true);
    Z3_FOCUS = w.camera.position.distanceTo(tgt); const wp = new THREE.Vector3();
    for (const s of Z3_SPRITES) { let root: THREE.Object3D = s.g; while (root.parent) root = root.parent; if (root !== w.scene || !s.g.parent!.visible) continue; s.mesh.getWorldPosition(wp); Z3_FOCUS = Math.max(Z3_FOCUS, w.camera.position.distanceTo(wp)); }
    for (const h of ZHUD) if (h.w === w) h.place(t);
    if (Z3_FOCUS_OVR > 0) Z3_FOCUS = Z3_FOCUS_OVR;
    { let kb = -99; for (const k of bursts) if (k <= t && k > kb) kb = k; const u = (t - kb) / 0.5; const dir = new THREE.Vector3().subVectors(tgt, w.camera.position).normalize();
      rings.forEach((m, i) => { const ui = u - i * 0.12; const on = ui > 0 && ui < 1; m.visible = on; if (!on) return; m.position.copy(tgt).addScaledVector(dir, 1.2); m.quaternion.copy(w.camera.quaternion); m.scale.setScalar(0.4 + ui * (i ? 2.6 : 3.4)); (m.material as THREE.MeshBasicMaterial).opacity = (1 - ui) * (i ? 0.5 : 0.85); }); }
    dust.pose(t, tgt, Math.max(8, w.camera.position.distanceTo(tgt)));
    for (const tr of Z3_TREES) if (tr.parent && tr.parent.parent === w.scene || tr.parent === w.scene) { tr.rotation.z = 0.025 * Math.sin(t * 1.1 + tr.position.x * 0.7); tr.rotation.x = 0.015 * Math.sin(t * 0.8 + tr.position.z); }
    for (const s of Z3_SPRITES) (s.mesh.material as THREE.MeshBasicMaterial).color.copy(tint);
    const qc = w.camera.quaternion, qg = new THREE.Quaternion(), rz = new THREE.Quaternion(), Z = new THREE.Vector3(0, 0, 1);
    for (const s of Z3_SPRITES) {
      let root: THREE.Object3D = s.g; while (root.parent) root = root.parent; if (root !== w.scene) continue;
      const ch = s.g.parent!; ch.updateMatrixWorld(true); ch.getWorldQuaternion(qg); const up = new THREE.Vector3(0, 1, 0).applyQuaternion(qg), cr = new THREE.Vector3(1, 0, 0).applyQuaternion(qc), cu = new THREE.Vector3(0, 1, 0).applyQuaternion(qc); rz.setFromAxisAngle(Z, Math.atan2(-up.dot(cr), up.dot(cu)));
      s.g.quaternion.copy(qg.invert().multiply(qc.clone().multiply(rz)));
    }
  };
}; }
