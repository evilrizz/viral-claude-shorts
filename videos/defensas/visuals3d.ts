// the camera: a short dolly-in at the cut and a little punch (lens) on the given key times
const d3Cam = (w: World, pos: Vec3, target: Vec3, t: number, fov = 40, punches: number[] = []) => {
  const k = 1 + 0.18 * Math.exp(-(t - w.s.t0) * 5), p = punches.reduce((a, x) => a + (t > x ? Math.exp(-(t - x) * 7) : 0), 0);
  w.look([target[0] + (pos[0] - target[0]) * k, target[1] + (pos[1] - target[1]) * k, target[2] + (pos[2] - target[2]) * k], target, fov * (1 - 0.06 * p));
};
// a character that stays in a corner of the frame (presenter), whatever the camera does
const d3Corner = (w: World, o: THREE.Object3D, side = -1, s = 0.36, dist = 4.6, down = 1.1, across = 0.64) => {
  const cam = w.camera; cam.updateMatrixWorld(); const f = new THREE.Vector3(), r = new THREE.Vector3(), u = new THREE.Vector3();
  cam.getWorldDirection(f); r.crossVectors(f, cam.up).normalize(); u.crossVectors(r, f).normalize();
  o.position.copy(cam.position).addScaledVector(f, dist).addScaledVector(r, side * across).addScaledVector(u, -down);
  o.scale.setScalar(s); o.lookAt(cam.position.x, o.position.y, cam.position.z);
};
// a paper chip with a piece's name (HTML over the 3D), from t for d seconds
const d3Tag = (w: World, text: string, t: number, d = 1.5, y = 560) => {
  const e = document.createElement('div'); e.textContent = text;
  e.style.cssText = `position:absolute;left:540px;top:${y}px;transform:translateX(-50%);background:#f2efe6;color:#14161d;font:900 46px var(--font);letter-spacing:1px;padding:12px 30px 12px 40px;border-left:16px solid #ff6a3d;box-shadow:0 10px 0 rgba(0,0,0,.25);white-space:nowrap;opacity:0`;
  w.titles.appendChild(e);
  w.tl.fromTo(e, { opacity: 0, y: -30, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(2)' }, t).to(e, { opacity: 0, duration: 0.25 }, t + d);
};
const d3Html = (w: World, html: string, css: string) => { const e = document.createElement('div'); e.innerHTML = html; e.style.cssText = `position:absolute;${css}`; w.titles.appendChild(e); return e; };
// smoke puffs (grey balls that grow and fade) at p, from t
const d3Puffs = (w: World, p: Vec3, n = 4) => { const m = new THREE.MeshStandardMaterial({ color: '#8d9099', roughness: 1, transparent: true }); const b = [...Array(n)].map((_, i) => w.add(d3Sph(0.3 + i * 0.08, m, [p[0] - i * 0.3, p[1] + i * 0.2, p[2]]))); return (t: number, t0: number) => b.forEach((s, i) => { const u = t - t0 - i * 0.12; s.visible = u > 0 && u < 1.4; s.scale.setScalar(0.4 + u * 1.2); s.position.y = p[1] + i * 0.2 + u * 0.8; m.opacity = p3Clamp(1 - u / 1.4); }); };

// ---------------- shared stagings
// the room with Tico (left) and Dota (right); the camera frames both
const dRoom = (w: World) => { const room = d3Room(w); const tk = w.add(d3Tico()), d = w.add(d3Dota()); tk.position.set(-0.85, 0, 0.2); d.position.set(0.85, 0, 0.45); d.setPose('down'); return { room, tk, d }; };
const dRoomCam = (w: World, t: number, punches: number[] = [], dx = 0) => d3Cam(w, [0.2 + dx, 2.0, 8.4], [dx, 1.75, 0], t, 40, punches);
// the microscopic world with Tico presenting from the corner
const dMicro = (w: World) => { const m = d3Micro(w); const tk = w.add(d3Tico()); tk.setPose('point'); return { m, tk }; };
const dMicroCam = (w: World, t: number, punches: number[] = [], tg: Vec3 = [0, 0.4, 0], dist = 9) => d3Cam(w, [tg[0] + 0.3, tg[1] + 1.2, tg[2] + dist], tg, t, 40, punches);
const dTico = (w: World, tk: ReturnType<typeof d3Tico>, t: number, side = -1) => { d3Corner(w, tk, side, 0.36); tk.live(t); };
// a swarm of bacteria: positions are given per frame by the scene
const dBacts = (w: World, n: number, seed = 1) => [...Array(n)].map((_, i) => w.add(d3Bact(seed + i)));
const dVirs = (w: World, n: number, color = DF.vir) => [...Array(n)].map((_, i) => w.add(d3Virus(color, i + 3)));
// a red flash that covers the frame (to dive into the finger)
const dFlash = (w: World, t: number, d = 0.35) => { const e = d3Html(w, '', 'left:0;top:0;width:1080px;height:1920px;background:radial-gradient(circle at 50% 50%, #ff8fa3 0%, #8a1630 70%);opacity:0'); w.tl.fromTo(e, { opacity: 0 }, { opacity: 1, duration: d, ease: 'power2.in' }, t); };
const dFlashOut = (w: World, t: number, d = 0.4) => { const e = d3Html(w, '', 'left:0;top:0;width:1080px;height:1920px;background:radial-gradient(circle at 50% 50%, #ff8fa3 0%, #8a1630 70%);opacity:1'); w.tl.fromTo(e, { opacity: 1 }, { opacity: 0, duration: d, ease: 'power2.out' }, t); };
const sp = (t: number, k: number) => p3Spring(t, k);
const ramp = (t: number, a: number, b: number) => p3Ramp(t, a, b);

defineVisuals({
  hook: {
    build(w) {
      const { tk, d } = dRoom(w); const b = w.add(d3Bact(1)); b.scale.setScalar(0.01);
      return (t) => {
        const k = w.K('bac'); dRoomCam(w, t, [k]); tk.live(t); d.fx.spots = 1; d.force(Math.floor(t / 1.6) % 2 ? 'itch' : 'scratch'); d.live(t);
        const s = sp(t, k) * (1 - ramp(t, k + 1.6, k + 2.0)); b.scale.setScalar(Math.max(0.01, 0.75 * s)); b.position.set(-0.05, 2.35 + 0.1 * Math.sin(t * 3), 0.8); b.rotation.y = -0.5 + (t > k + 1.6 ? (t - k - 1.6) * 12 : 0); b.live(t, { scared: t > k + 1.2 ? 1 : 0 });
      };
    },
  },
  varicela: {
    build(w) {
      const { tk, d } = dRoom(w); const lock = w.add(d3Lock()); lock.scale.setScalar(0.55);
      return (t) => {
        const k = w.K('var'); dRoomCam(w, t, [k, w.K('dos')]); tk.live(t); d.fx.spots = 1; d.force(Math.floor(t / 1.4) % 2 ? 'itch' : 'scratch'); d.live(t);
        lock.position.set(0, 2.85 + 4 * (1 - p3Clamp((t - k + 0.3) / 0.4)) ** 2, -0.4); lock.rotation.set(0, 0.25 * Math.sin(t * 1.5), 0.08 * Math.sin(t * 2.3)); lock.open(0);
      };
    },
  },
  flojera: {
    build(w) {
      const { tk, d } = dRoom(w); const lock = w.add(d3Lock()); lock.scale.setScalar(0.55); lock.position.set(0, 2.7, -0.4);
      return (t) => { dRoomCam(w, t, [w.K('dota')], 0.3); tk.live(t); d.fx.spots = 1; d.live(t); lock.rotation.y = 0.25 * Math.sin(t * 1.5); };
    },
  },
  idiota: {
    build(w) {
      const { tk, d } = dRoom(w); const lock = w.add(d3Lock()); lock.scale.setScalar(0.55); lock.position.set(0, 2.7, -0.4);
      return (t) => {
        const k = w.K('palm'); dRoomCam(w, t, [k], -0.2); tk.setPose(t > k ? 'palm' : 'cross', k, 'cross'); tk.live(t); d.fx.spots = 1; d.crazy(t > k + 0.1); d.live(t); lock.rotation.y = 0.25 * Math.sin(t * 1.5);
      };
    },
  },
  promesa: {
    build(w) {
      const { tk, d } = dRoom(w); const lock = w.add(d3Lock()); lock.scale.setScalar(0.55); lock.position.set(0, 2.7, -0.4); const glow = new THREE.PointLight('#ffd23d', 0, 4); w.add(glow); glow.position.set(0, 2.7, 0.5);
      return (t) => {
        const k = w.K('lock'); dRoomCam(w, t, [k]); tk.force('point'); tk.live(t); d.fx.spots = 1; d.live(t);
        const s = 1 + 0.25 * sp(t, k) * Math.exp(-Math.max(0, t - k - 0.4) * 2); lock.scale.setScalar(0.55 * s); lock.rotation.y = 0.25 * Math.sin(t * 1.5); glow.intensity = t > k ? 8 * (0.6 + 0.4 * Math.sin(t * 6)) : 0;
      };
    },
  },
  adentro: {
    build(w) {
      const { tk, d } = dRoom(w); const paper = w.add(d3Paper());
      return (t) => {
        dRoomCam(w, t, [w.K('corta')]); tk.force('point'); tk.live(t); d.fx.spots = 1; d.force('finger'); d.live(t);
        paper.position.set(1.42, 0.95, 0.55); paper.rotation.set(-0.2, -0.3, 0.3 + 0.05 * Math.sin(t * 2));
      };
    },
  },
  auch: {
    build(w) {
      const { tk, d } = dRoom(w); const paper = w.add(d3Paper()); dFlash(w, w.s.t1 - 0.35);
      return (t) => {
        const c = w.K('cut'), z = p3Smoothstep(0, 1, p3Clamp((t - w.K('zoom')) / (w.s.t1 - w.K('zoom')))), hand: Vec3 = [1.4, 0.95, 0.6];
        if (z <= 0) dRoomCam(w, t, [c], 0.3); else w.look([p3Lerp(0.5, hand[0], z), p3Lerp(1.75, hand[1] + 0.05, z), p3Lerp(7.4, hand[2] + 0.8, z)], [p3Lerp(0.3, hand[0], z), p3Lerp(1.3, hand[1], z), p3Lerp(0, hand[2], z)], 40);
        D3_FOCUS_OVR = z > 0 ? p3Lerp(7, 0.9, z) : -1; D3_BOTH = z;
        tk.live(t); d.fx.spots = 1; d.fx.hurt = sp(t, c); d.fx.sad = t > c ? 1 : 0; d.force('finger'); d.live(t);
        paper.position.set(t > c ? 1.7 : 1.42, t > c ? 0.3 + 0.6 * Math.exp(-(t - c) * 3) : 0.95, 0.55); paper.rotation.set(-0.2, -0.3, t > c ? (t - c) * 3 : 0.3);
      };
    },
  },
  piel: {
    build(w) {
      const { m, tk } = dMicro(w); dFlashOut(w, w.s.t0); const wall = w.add(d3SkinWall()); wall.position.set(0, -0.6, 0); const bs = dBacts(w, 5, 11);
      return (t) => {
        m.pose(t); dMicroCam(w, t, [w.K('moco'), w.K('bichos')], [0, 0.6, 0], 9.5); wall.crack(0); dTico(w, tk, t);
        bs.forEach((b, i) => { const ph = ((t - w.s.t0) * 0.7 + i * 0.23) % 1, x = -2.6 + i * 1.3; b.position.set(x, -0.25 + 2.3 * Math.abs(Math.sin(ph * Math.PI)), 0.3); b.rotation.z = -Math.PI / 2 + 0.3 * Math.sin(ph * 6); b.scale.setScalar(0.8); b.live(t, { scared: ph < 0.12 || ph > 0.88 ? 1 : 0 }); });
      };
    },
  },
  puerta: {
    build(w) {
      const { m, tk } = dMicro(w); const wall = w.add(d3SkinWall()); wall.position.set(0, -0.6, 0); const bs = dBacts(w, 6, 21);
      return (t) => {
        m.pose(t); const c = w.K('crack'), e = w.K('entran'); dMicroCam(w, t, [c, e], [0, 0.4, 0], 9.5); wall.crack(sp(t, c)); dTico(w, tk, t);
        bs.forEach((b, i) => { const u = t - e + 0.6 - i * 0.28; let x = 3.2 - i * 0.9, y = 0.0, rz = 0; if (u > 0) { x = Math.max(0, x - u * 2.2); if (x <= 0.001) { y = -Math.min(3.5, (u - (3.2 - i * 0.9) / 2.2) * 2.5); rz = -Math.PI / 2; } } b.position.set(x, y + 0.04 * Math.sin(t * 8 + i), 0.3); b.rotation.z = rz + (u > 0 && rz === 0 ? Math.PI : 0); b.scale.setScalar(0.7); b.live(t, { speed: 1.5 }); });
      };
    },
  },
  alarma: {
    build(w) {
      const { m, tk } = dMicro(w); const cell = w.add(d3Cell(4)); cell.position.set(0.3, 0.4, 0); const sir = d3Siren(); sir.position.set(0, 0.76, 0); cell.body.add(sir); const bs = dBacts(w, 2, 31);
      return (t) => {
        m.pose(t); const k = w.K('alarm'); dMicroCam(w, t, [k], [0.2, 0.7, 0], 7); sir.on(t, t > k ? 1 : 0); cell.live(t, { scared: t > k ? 0.6 : 0 }); dTico(w, tk, t);
        bs.forEach((b, i) => { b.position.set(-1.6 + i * 3.4, -0.9 + 0.2 * Math.sin(t * 2 + i), 0.5); b.rotation.y = i ? Math.PI : 0; b.scale.setScalar(0.7); b.live(t); });
      };
    },
  },
  vasos: {
    build(w) {
      const { m, tk } = dMicro(w); const v = w.add(d3Vessel()); v.position.set(0, 0.3, -0.5);
      return (t) => { m.pose(t); const k = w.K('open'); dMicroCam(w, t, [k, w.K('ref')], [0, 0.8, 0], 8); v.live(t, sp(t, k)); dTico(w, tk, t); };
    },
  },
  roja: {
    build(w) {
      const { tk, d } = dRoom(w);
      return (t) => {
        const hand: Vec3 = [1.4, 0.95, 0.6]; w.look([1.0, 1.35, 3.6], [1.15, 1.05, 0.4], 40); D3_FOCUS_OVR = 3.2;
        tk.live(t); d.fx.spots = 1; d.fx.hurt = 1 + 0.3 * (sp(t, w.K('roja')) - 1) + 0.25 * Math.exp(-Math.max(0, t - w.K('hinchada')) * 3) * (t > w.K('hinchada') ? 1 : 0); d.fx.sad = 1; d.force('finger'); d.live(t); void hand;
      };
    },
  },
  inflam: {
    build(w) {
      const { tk, d } = dRoom(w); d3Tag(w, 'INFLAMACIÓN', w.K('name'), 1.6, 1520);
      return (t) => { w.look([0.9, 1.4, 4.4], [0.9, 1.1, 0.4], 40); D3_FOCUS_OVR = 4; tk.live(t); d.fx.spots = 1; d.fx.hurt = 1; d.fx.sad = 1; d.force('finger'); d.live(t); };
    },
  },
  comelones: {
    build(w) {
      const { m, tk } = dMicro(w); const mac = w.add(d3Macro()); const bs = dBacts(w, 3, 41);
      return (t) => {
        m.pose(t); const a = w.K('mac'), e = w.K('eat'), p = w.K('pop'), u = p3Clamp((t - a + 1.0) / (p - a + 1.6));
        const mx = p3Lerp(-5, 1.6, u); mac.position.set(mx, 0.3 + 0.1 * Math.sin(t * 3), 0); mac.rotation.y = 0.35;
        const eatT = [e, p, p + 0.35]; let open = 0, gulp = 0;
        bs.forEach((b, i) => { const ti = eatT[i]; const bx = 1.2 + i * 1.1 + 0.3 * Math.sin(t * 2 + i), by = 0.3 + 0.4 * Math.sin(t * 3 + i * 2); const g = p3Clamp((t - ti) / 0.3);
          b.position.set(p3Lerp(bx, mx + 0.4, g), p3Lerp(by, 0.2, g), p3Lerp(0.4, 0.9, g)); b.scale.setScalar(0.62 * (1 - g) + 0.001); b.rotation.y = Math.PI; b.live(t, { scared: t > ti - 1.2 ? 1 : 0, speed: 1.6 });
          open = Math.max(open, p3Clamp(1 - Math.abs(t - ti) / 0.35)); gulp = Math.max(gulp, t > ti + 0.25 ? Math.exp(-(t - ti - 0.25) * 6) : 0); });
        mac.live(t, open, gulp); dMicroCam(w, t, [e, p], [p3Lerp(-1.5, 1.4, u), 0.5, 0], 8.5); dTico(w, tk, t);
      };
    },
  },
  macro: {
    build(w) {
      const { m, tk } = dMicro(w); const mac = w.add(d3Macro()); mac.position.set(0.2, 0.4, 0); d3Tag(w, 'MACRÓFAGO', w.K('name'), 1.4);
      return (t) => { m.pose(t); dMicroCam(w, t, [w.K('name')], [0.2, 0.5, 0], 5.5); mac.rotation.y = 0.15 * Math.sin(t); mac.live(t, 0, 0); dTico(w, tk, t); };
    },
  },
  provecho: {
    build(w) {
      const { m } = dMicro(w); const mac = w.add(d3Macro()); mac.position.set(0.3, 0.5, 0); const d = w.add(d3Dota()); d.setPose('up');
      return (t) => { m.pose(t); const k = w.K('dota'); dMicroCam(w, t, [k], [0.3, 0.6, 0], 6); mac.live(t, t > k + 0.5 && t < k + 1.0 ? 0.6 : 0, t > k + 0.5 ? Math.exp(-(t - k - 0.5) * 4) : 0); d3Corner(w, d, -1, 0.42); d.live(t); };
    },
  },
  virus: {
    build(w) {
      const { tk, d } = dRoom(w); const v = w.add(d3Virus()); const drops = [...Array(14)].map((_, i) => { const s = d3Sph(0.025 + (i % 3) * 0.012, new THREE.MeshPhysicalMaterial({ color: '#eaf6ff', roughness: 0.1, transparent: true, opacity: 0.8, clearcoat: 1 }), [0, 0, 0]); w.add(s); return s; });
      return (t) => {
        const k = w.K('sneeze'); dRoomCam(w, t, [k]); tk.fx.sneeze = t < k ? p3Clamp((t - w.s.t0 + 0.2) / (k - w.s.t0 + 0.2)) * 0.74 : t < k + 0.6 ? 1 : 0; tk.live(t); d.live(t); d.fx.sad = t > k + 0.6 ? 1 : 0;
        drops.forEach((s, i) => { const u = (t - k) / 0.6; s.visible = u > 0 && u < 1; const a = (i / 14 - 0.5) * 0.9; s.position.set(-0.45 + u * 1.3 * Math.cos(a), 1.75 + u * 1.3 * Math.sin(a) - u * u * 0.3, 0.7 + (i % 4) * 0.08); });
        const u = p3Clamp((t - k) / 0.7); v.visible = t > k && u < 1; v.position.set(p3Lerp(-0.4, 0.85, u), p3Lerp(1.95, 1.08, u) + 0.3 * Math.sin(u * Math.PI), p3Lerp(0.5, 0.9, u)); v.scale.setScalar(0.4 * (1 - u * 0.6)); v.live(t, 1);
      };
    },
  },
  fabrica: {
    build(w) {
      const { m, tk } = dMicro(w); const cell = w.add(d3Cell(5)); cell.position.set(0.2, 0.4, 0); const v = w.add(d3Virus());
      return (t) => {
        m.pose(t); const i = w.K('in'), f = w.K('fab'), mo = w.K('more'); dMicroCam(w, t, [i, mo], [0.2, 0.6, 0], 7);
        const u = p3Clamp((t - i + 0.6) / 0.8); v.visible = u < 1; v.position.set(p3Lerp(-2.6, 0.2, u), p3Lerp(1.6, 0.5, u), p3Lerp(0.6, 0, u)); v.scale.setScalar(0.7 * (1 - u * 0.5)); v.live(t, 0.6);
        const n = t < i + 0.2 ? 0 : t < f ? 1 : Math.round(p3Lerp(1, 12, p3Clamp((t - f) / (mo - f + 0.3)))); cell.live(t, { copies: n, scared: t > i ? 0.8 : 0 }); dTico(w, tk, t);
      };
    },
  },
  escondido: {
    build(w) {
      const { m, tk } = dMicro(w); const cell = w.add(d3Cell(5)); cell.position.set(0.9, 0.2, -0.6); const mac = w.add(d3Macro()); mac.scale.setScalar(0.7);
      return (t) => {
        m.pose(t); const k = w.K('nolove'), u = p3Clamp((t - w.s.t0) / (w.s.t1 - w.s.t0)); dMicroCam(w, t, [k], [0.2, 0.5, 0], 8);
        cell.live(t, { copies: 12 }); cell.face.set(0, 0, 0.45, 0); mac.position.set(p3Lerp(-3.4, -0.2, Math.min(1, u * 1.6)), 1.25 + 0.08 * Math.sin(t * 3), -1.6); mac.live(t, 0, 0);
        mac.face.set(0.5 * Math.sin(t * 2.5), 0.1, 0.12, t > k ? 0.25 : 0); mac.rotation.z = t > k ? 0.12 * Math.sin((t - k) * 6) * Math.exp(-(t - k) * 2) : 0; dTico(w, tk, t);
      };
    },
  },
  bandera: {
    build(w) {
      const { m, tk } = dMicro(w); const cell = w.add(d3Cell(5)); cell.position.set(0.2, 0.2, 0);
      return (t) => { m.pose(t); const k = w.K('flag'); dMicroCam(w, t, [k], [0.2, 0.8, 0], 6.8); cell.live(t, { copies: 12, flag: sp(t, k), scared: 0.5 }); dTico(w, tk, t); };
    },
  },
  asesinos: {
    build(w) {
      const { m, tk } = dMicro(w); const cell = w.add(d3Cell(5)); cell.position.set(-0.3, 0.2, 0); const tc = w.add(d3TCell());
      return (t) => {
        m.pose(t); const a = w.K('tcell'), b = w.K('boom'); dMicroCam(w, t, [a, b], [0.1, 0.6, 0], 7.2);
        const u = p3Clamp((t - a + 0.4) / (b - a + 0.2)); tc.position.set(p3Lerp(4.2, 0.9, p3Smoothstep(0, 1, u)), 0.25 + 0.1 * Math.abs(Math.sin(t * 9)) * (1 - u), 0.4); tc.rotation.y = -0.7; tc.live(t, p3Clamp(1 - Math.abs(t - b) / 0.25));
        cell.live(t, { copies: t < b ? 12 : 0, flag: t < b ? 1 : 0, pop: p3Clamp((t - b) / 0.5), scared: 1 }); dTico(w, tk, t);
      };
    },
  },
  linfo: {
    build(w) {
      const { m, tk } = dMicro(w); const tc = w.add(d3TCell()); tc.position.set(0.55, 0.45, 0); d3Tag(w, 'LINFOCITO T', w.K('name'), 1.2);
      return (t) => { m.pose(t); dMicroCam(w, t, [w.K('name')], [0.2, 0.55, 0], 4.6); tc.rotation.y = 0.2 * Math.sin(t * 1.3); tc.live(t, 0); dTico(w, tk, t); };
    },
  },
  anticuerpos: {
    build(w) {
      const { m, tk } = dMicro(w); const bc = w.add(d3BCell()); bc.position.set(-0.1, 0.5, 0); const ys = [...Array(5)].map(() => w.add(d3Y())); const vs = dVirs(w, 3);
      return (t) => {
        m.pose(t); const k = w.K('fire'); dMicroCam(w, t, [k], [0.4, 0.8, 0], 8); bc.live(t, ys.reduce((a, _, i) => Math.max(a, p3Clamp(1 - Math.abs(t - (k + i * 0.18)) / 0.12)), 0));
        vs.forEach((v, i) => { v.position.set(1.6 + i * 0.4, 1.6 - i * 0.9 + 0.2 * Math.sin(t * 2 + i), -0.3 + i * 0.3); v.scale.setScalar(0.8); v.live(t, 0); });
        ys.forEach((y, i) => { const u = p3Clamp((t - k - i * 0.18) / 1.2); y.visible = t > k + i * 0.18; y.position.set(-0.1 + u * (1.3 + i * 0.5), 1.2 + u * (1.2 - i * 0.55) + Math.sin(u * Math.PI) * 0.6, 0.3); y.rotation.z = -1.2 * u + i; y.scale.setScalar(0.7); });
        dTico(w, tk, t);
      };
    },
  },
  pinzas: {
    build(w) {
      const { m, tk } = dMicro(w); const cell = w.add(d3Cell(7)); cell.position.set(-1.0, 0.0, -0.3); const vs = dVirs(w, 3); const ys = vs.map(() => w.add(d3Y()));
      return (t) => {
        m.pose(t); const s = w.K('stick'), b = w.K('bounce'); dMicroCam(w, t, [s, b], [0, 0.4, 0], 8); cell.live(t, { scared: 0.3 });
        vs.forEach((v, i) => { const bt = b + i * 0.25, ap = p3Clamp((t - (s + 0.4)) / (bt - s - 0.4)), back = t > bt ? Math.min(1, (t - bt) * 2.5) : 0;
          const x = p3Lerp(2.6 + i * 0.5, 0.0, ap) + back * 1.8, y = 1.5 - i * 1.0 + 0.15 * Math.sin(t * 2 + i); v.position.set(x, y, 0.4); v.scale.setScalar(0.85); v.rotation.z = back * 6; v.live(t, 0); v.face.set(0, 0, 0.2, back > 0 ? 0.6 : 0);
          const y0 = ys[i], st = p3Clamp((t - s - i * 0.2) / 0.4); y0.visible = t > s - 0.5 + i * 0.2; y0.position.set(p3Lerp(x + 2.4, x - 0.05, st), p3Lerp(y + 1.2, y + 0.42, st), 0.4); y0.rotation.z = Math.PI; y0.scale.setScalar(0.55); });
        dTico(w, tk, t);
      };
    },
  },
  pobre: {
    build(w) {
      const { m } = dMicro(w); const cell = w.add(d3Cell(5)); cell.position.set(0.3, 0.3, 0); const d = w.add(d3Dota()); d.setPose('down');
      return (t) => { m.pose(t); dMicroCam(w, t, [], [0.3, 0.5, 0], 7); cell.live(t, { pop: 0.6 + 0.15 * Math.sin(t) }); d3Corner(w, d, -1, 0.42); d.fx.sad = 1; d.live(t); };
    },
  },
  ella: {
    build(w) {
      const { tk, d } = dRoom(w);
      return (t) => { dRoomCam(w, t, [w.K('tu')]); tk.force(t > w.K('tu') - 0.3 ? 'point' : null); tk.live(t); d.fx.sad = t < w.K('tu') ? 1 : 0; d.live(t); };
    },
  },
  fiebre: {
    build(w) {
      d3Room(w); const bed = w.add(d3Bed()); bed.position.set(0.5, 0, 0); const tk = w.add(d3Tico()), d = w.add(d3Dota()); tk.position.set(-1.7, 0, 1.0); d.position.set(0.95, 0.95, 0.85); d.rotation.z = Math.PI / 2; d.setPose('sick');
      return (t) => { const k = w.K('temp'); d3Cam(w, [-0.3, 2.9, 8.8], [-0.3, 1.45, 0], t, 40, [k]); tk.live(t); d.force('sick'); d.fx.spots = 0.6; d.fx.sad = 1; d.fx.thermo = 0.35 + 0.65 * p3Ramp(t, k - 0.3, k + 0.6); d.live(t); };
    },
  },
  noesvirus: {
    build(w) {
      const { tk, d } = dRoom(w); const th = w.add(d3Thermo()); th.position.set(0.0, 0.35, 1.1); th.scale.setScalar(0.6); const v = w.add(d3Virus()); v.position.set(0.75, 2.45, 0.6); v.scale.setScalar(0.5);
      return (t) => { dRoomCam(w, t, [w.K('no')]); th.level(0.4 + 0.5 * p3Ramp(t, w.s.t0, w.s.t1)); tk.force('point'); tk.live(t); d.fx.thermo = 0; d.live(t); v.live(t, 0.5); v.visible = t > w.K('no') - 0.2; v.scale.setScalar(0.5 * sp(t, w.K('no') - 0.2) + 0.001); };
    },
  },
  calor: {
    build(w) {
      const { m, tk } = dMicro(w); const bs = dBacts(w, 3, 51); const vs = dVirs(w, 2);
      return (t) => {
        const k = w.K('hot'), hot = p3Ramp(t, k - 0.2, k + 0.8); m.pose(t, hot); dMicroCam(w, t, [k], [0, 0.5, 0], 8.5); D3_HEAT = hot;
        bs.forEach((b, i) => { b.position.set(-1.8 + i * 1.6, -0.3 + i * 0.7 + 0.15 * Math.sin(t * 2 + i), 0.2); b.scale.setScalar(0.7); b.live(t, { sweat: hot > 0.5, scared: hot }); });
        vs.forEach((v, i) => { v.position.set(-0.8 + i * 2.2, 1.6 + 0.2 * Math.sin(t * 1.5 + i), -0.4); v.scale.setScalar(0.8); v.live(t, 0); v.face.set(0, 0, 0.3, hot * 0.5); });
        dTico(w, tk, t);
      };
    },
  },
  sudan: {
    build(w) {
      const { m, tk } = dMicro(w); const bs = dBacts(w, 3, 61); const mac = w.add(d3Macro()); mac.scale.setScalar(0.6); const tc = w.add(d3TCell()); tc.scale.setScalar(0.8);
      return (t) => {
        m.pose(t, 1); D3_HEAT = 1; const a = w.K('apuran'); dMicroCam(w, t, [w.K('bichos'), a], [0, 0.4, 0], 8.5);
        bs.forEach((b, i) => { b.position.set(-1.6 + i * 1.5 + 0.1 * Math.sin(t * 0.8 + i), -0.6 + i * 0.6, 0.2); b.rotation.z = -0.3; b.scale.setScalar(0.7); b.live(t, { sweat: true, scared: 0.7, speed: 0.35 }); });
        const u = (t - w.s.t0) * 1.4; mac.position.set(((u * 3) % 10) - 5, 1.8, -0.6); mac.live(t * 2, 0, 0); tc.position.set(5 - ((u * 3.6 + 4) % 10), 0.9, 0.9); tc.rotation.y = -1.2; tc.live(t * 2, 0);
        dTico(w, tk, t);
      };
    },
  },
  prometi: {
    build(w) {
      const { tk, d } = dRoom(w); const lock = w.add(d3Lock()); lock.scale.setScalar(0.6); lock.position.set(0, 2.7, -0.4);
      return (t) => { const k = w.K('open'); dRoomCam(w, t, [k]); lock.open(p3Ramp(t, k - 0.2, k + 0.4)); lock.rotation.y = 0.2 * Math.sin(t * 1.5); tk.force('point'); tk.live(t); d.live(t); };
    },
  },
  foto: {
    build(w) {
      const { m, tk } = dMicro(w); const al = w.add(d3Album()); al.position.set(0.3, 0.9, 0.2); const mc = w.add(d3BCell()); mc.position.set(1.1, -0.5, 0.6); mc.scale.setScalar(0.75);
      return (t) => {
        m.pose(t); const a = w.K('album'), f = w.K('foto'); dMicroCam(w, t, [a, f], [0.2, 0.6, 0], 7); al.scale.setScalar(sp(t, a - 0.3) * 1.1 + 0.001); al.open(p3Ramp(t, a, a + 0.6)); al.rotation.set(-0.15, 0.15 * Math.sin(t * 0.8), 0);
        al.photos.forEach((p, i) => { const g = i === 2 ? sp(t, f) : 0; p.position.z = 0.05 + 0.4 * g; p.scale.setScalar(0.62 * (1 + 0.5 * g)); }); mc.live(t, 0); dTico(w, tk, t);
      };
    },
  },
  memoria: {
    build(w) {
      const { m, tk } = dMicro(w); const mc = w.add(d3BCell()); mc.position.set(0.35, 0.2, 0); const ph = d3Photo('var'); w.add(ph); d3Tag(w, 'CÉLULAS DE MEMORIA', w.K('name'), 1.3);
      return (t) => { m.pose(t); dMicroCam(w, t, [w.K('name')], [0.3, 0.5, 0], 5.5); mc.live(t, 0); ph.position.set(1.1, 0.6 + 0.05 * Math.sin(t * 2), 0.5); ph.rotation.z = -0.15; dTico(w, tk, t); };
    },
  },
  regresa: {
    build(w) {
      const { m, tk } = dMicro(w); const mc = w.add(d3BCell()); mc.position.set(-1.0, 0.0, 0.2); mc.scale.setScalar(0.8); const ph = d3Photo('var'); w.add(ph); const v = w.add(d3Virus(DF.varicela)); const tc = w.add(d3TCell()); tc.scale.setScalar(0.8);
      return (t) => {
        m.pose(t); const b = w.K('back'), kn = w.K('know'), o = w.K('out'); dMicroCam(w, t, [kn, o], [0, 0.5, 0], 7.5); mc.live(t, 0);
        ph.position.set(-0.6, 0.7 + 0.5 * sp(t, kn), 0.6); ph.scale.setScalar(0.6 * (1 + 0.4 * sp(t, kn))); ph.rotation.z = 0.1 * Math.sin(t * 3);
        const inU = p3Clamp((t - b + 0.4) / 0.9), out = p3Clamp((t - o) / 0.8); v.position.set(p3Lerp(4, 1.2, p3Smoothstep(0, 1, inU)) + out * 4, 0.6 + out * 3, 0.3); v.rotation.z = out * 10; v.scale.setScalar(0.85); v.live(t, 0); v.face.set(0, 0, out > 0 ? 1 : 0.4, out * 0.8);
        tc.position.set(p3Lerp(-3.5, 0.5, p3Ramp(t, o - 0.7, o)), 0.2, 0.6); tc.rotation.y = 0.8; tc.live(t, p3Clamp(1 - Math.abs(t - o) / 0.25)); dTico(w, tk, t);
      };
    },
  },
  dosveces: {
    build(w) {
      const { tk, d } = dRoom(w);
      return (t) => { const k = w.K('dos'); dRoomCam(w, t, [k]); tk.live(t); d.fx.spots = 1 - p3Ramp(t, w.s.t0, w.s.t0 + 0.8); d.force(t > k - 0.3 ? 'cheer' : null); d.live(t); };
    },
  },
  vacuna: {
    build(w) {
      const { m, tk } = dMicro(w); const sy = w.add(d3Syringe()); sy.position.set(0.4, 0.3, 0); const mc = w.add(d3BCell()); mc.position.set(0.9, -1.1, 0.8); mc.scale.setScalar(0.7);
      return (t) => { m.pose(t); const a = w.K('vac'), f = w.K('foto'); dMicroCam(w, t, [a, f], [0.3, 0.6, 0], 7); sy.scale.setScalar(0.8 * sp(t, a - 0.2) + 0.001); sy.rotation.set(0, 0.4 * Math.sin(t * 0.7), -0.5); const g = sp(t, f); sy.photo.scale.setScalar(0.7 * (1 + 0.5 * g)); mc.live(t, 0); mc.face.set(0.4, 0.4, 0.05, 0.3 * g); dTico(w, tk, t); };
    },
  },
  antibio: {
    build(w) {
      const { m, tk } = dMicro(w); const pill = w.add(d3Pill()); const b = w.add(d3Bact(71)); const v = w.add(d3Virus());
      return (t) => {
        m.pose(t); const p = w.K('pill'), vk = w.K('virus'); dMicroCam(w, t, [p, vk], [0, 0.5, 0], 8);
        const hitB = p + 0.7, u = (t - w.s.t0) / (w.s.t1 - w.s.t0); b.position.set(-1.0, 0.0, 0.3); b.scale.setScalar(0.7 * (1 - p3Clamp((t - hitB) / 0.25)) + 0.001); b.live(t, { scared: 1 });
        const px = t < hitB ? p3Lerp(2.6, -0.8, p3Clamp((t - p + 0.5) / 1.2)) : p3Lerp(-0.8, 1.0, p3Clamp((t - hitB) / 0.8)); pill.position.set(px, t < hitB ? 0.1 : p3Lerp(0.1, 1.2, p3Clamp((t - hitB) / 0.8)), 0.4); pill.rotation.y = t < hitB ? Math.PI : 0; pill.live(t);
        v.position.set(1.3 + (t > vk ? 0.6 * Math.sin((t - vk) * 6) : 0), 1.3 + (t > vk ? 0.6 * Math.abs(Math.sin((t - vk) * 4)) : 0), 0.2); v.scale.setScalar(0.85); v.live(t, t > vk - 0.3 ? 1 : 0.2); dTico(w, tk, t); void u;
      };
    },
  },
  receta: {
    build(w) {
      const { tk, d } = dRoom(w); const rx = w.add(d3Rx()); rx.scale.setScalar(0.6);
      return (t) => { const k = w.K('rx'); dRoomCam(w, t, [k]); rx.position.set(0, 2.9 - 4 * (1 - sp(t, k - 0.2)), 0.2); rx.rotation.set(0, 0.2 * Math.sin(t), -0.06); rx.visible = t > k - 0.4; tk.force(t > k ? 'point' : null); tk.live(t); d.live(t); };
    },
  },
  guerras: {
    build(w) {
      const { m, tk } = dMicro(w); const mac = w.add(d3Macro()); mac.position.set(-0.5, 0.4, -0.6); mac.scale.setScalar(0.7); const tc = w.add(d3TCell()); tc.position.set(1.0, 0.0, 0.3); const bc = w.add(d3BCell()); bc.position.set(0.35, -0.7, 0.8); bc.scale.setScalar(0.8);
      return (t) => { m.pose(t); const k = w.K('win'); dMicroCam(w, t, [k], [0, 0.3, 0], 7.5); [mac, tc, bc].forEach((o, i) => { o.position.y = [0.4, 0.0, -0.7][i] + (t > k ? 0.3 * Math.abs(Math.sin((t - k) * 7 + i)) : 0); }); mac.live(t, t > k ? 0.3 : 0, 0); tc.live(t, 0); bc.live(t, t > k ? 0.4 : 0); dTico(w, tk, t); };
    },
  },
  sub: {
    bg: '#fff3d6',
    build(w) {
      p3Lights(w, '#fff6e0', '#e8c27a'); const rays = w.add(d3Rays('#ffe08a', 30)); rays.position.set(0, 2, -6);
      const tk = w.add(d3Tico()), d = w.add(d3Dota()); tk.position.set(-0.75, -2.3, 0.15); d.position.set(0.35, -2.3, 0);
      const sub = d3Html(w, '¡SUSCRÍBANSE!', 'left:540px;top:520px;transform:translateX(-50%);font:900 76px var(--font);color:#fff;-webkit-text-stroke:10px #14161d;paint-order:stroke fill;background:#ff5a5f;border:9px solid #14161d;border-radius:60px;padding:6px 44px;white-space:nowrap;opacity:0');
      const logo = d3Html(w, '<span style="color:#3270e6">Idio</span><span style="color:#ff7a3d">-</span><span style="color:#ffc83d">two</span>', 'left:540px;top:650px;transform:translateX(-50%);font:900 170px var(--font);letter-spacing:-4px;-webkit-text-stroke:15px #2b1a14;paint-order:stroke fill;text-shadow:10px 14px 0 rgba(0,0,0,.16);white-space:nowrap;opacity:0');
      w.tl.fromTo(logo, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' }, w.s.t0 + 0.05).fromTo(sub, { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.4)' }, w.s.t0 + 0.3).to(sub, { scale: 1.08, duration: 0.25, yoyo: true, repeat: 5, ease: 'sine.inOut' }, w.s.t0 + 1.0);
      return (t) => {
        const k = w.K('achoo'); rays.rotation.z = t * 0.25; d.fx.sneeze = t < k ? p3Clamp((t - w.s.t0) / (k - w.s.t0)) * 0.74 : 0.74 + 0.1 * Math.sin(t * 9);
        tk.force(t > k - 0.7 ? 'pinch' : null); tk.live(t); d.live(t); w.look([0, 0.2, 11.5], [0, -0.4, 0], 40);
      };
    },
  },
});

// every scene of this video gets the finish (reflections, grade, vignette) and the fur clock
for (const id of Object.keys(VISUALS)) { const V = VISUALS[id], b = V.build; V.build = (w) => {
  d3Finish(w); let tgt = new THREE.Vector3(0, 1, 0); const look0 = w.look.bind(w); w.look = (p, q, f) => { tgt = new THREE.Vector3(...q); look0(p, q, f); };
  const pose = b(w), keys = (w.s.keys || []).map((k) => w.K(k.id)); let q0: THREE.Quaternion | null = null;
  const dust = d3Dust(); w.scene.add(dust); const tint = new THREE.Color('#ffffff');
  w.scene.traverse((o) => {   // softer, warmer key light with cleaner shadows; the characters take a little of the sky colour
    const l = o as THREE.DirectionalLight; if (l.isDirectionalLight && l.castShadow) { l.shadow.bias = -0.0004; l.shadow.normalBias = 0.03; l.shadow.mapSize.set(2048, 2048); l.shadow.radius = 4; l.intensity *= 1.15; if (w.s.id !== 'belt' && w.s.id !== 'turb2') l.color.lerp(new THREE.Color('#ffe9c9'), 0.5); }
    const h = o as THREE.HemisphereLight; if (h.isHemisphereLight) tint.copy(new THREE.Color('#ffffff').lerp(h.color, 0.35));
  });
  return (t) => {
    P3_T.value = t; D3_KEYS = keys; D3_FOCUS_OVR = -1; D3_BOTH = 0; D3_HEAT = 0; if (q0) w.camera.quaternion.copy(q0); pose(t); q0 = w.camera.quaternion.clone();
    // a hand-held camera: a slow, small drift so no shot is ever frozen
    const n = (a: number, b: number) => Math.sin(t * a + b); w.camera.rotateX(0.004 * (n(0.9, 1) + 0.6 * n(2.3, 4))); w.camera.rotateY(0.004 * (n(0.7, 2) + 0.6 * n(1.9, 5))); w.camera.rotateZ(0.0025 * n(0.5, 3)); w.camera.updateMatrixWorld(true);
    // depth of field focused on what the camera looks at; dust drifting in the light; trees swaying; character tint from the scene's light
    D3_FOCUS = w.camera.position.distanceTo(tgt); const wp = new THREE.Vector3();
    for (const s of D3_SPRITES) { let root: THREE.Object3D = s.g; while (root.parent) root = root.parent; if (root !== w.scene || !s.g.parent!.visible) continue; s.mesh.getWorldPosition(wp); D3_FOCUS = Math.max(D3_FOCUS, w.camera.position.distanceTo(wp)); }
    if (D3_FOCUS_OVR > 0) D3_FOCUS = D3_FOCUS_OVR;
    dust.pose(t, tgt, Math.max(8, w.camera.position.distanceTo(tgt)));
    for (const tr of D3_TREES) if (tr.parent && tr.parent.parent === w.scene || tr.parent === w.scene) { tr.rotation.z = 0.025 * Math.sin(t * 1.1 + tr.position.x * 0.7); tr.rotation.x = 0.015 * Math.sin(t * 0.8 + tr.position.z); }
    for (const s of D3_SPRITES) (s.mesh.material as THREE.MeshBasicMaterial).color.copy(tint);
    // the 2D characters are paper cut-outs: turn each one of this scene to face the camera (keeping its own roll)
    const qc = w.camera.quaternion, qg = new THREE.Quaternion(), rz = new THREE.Quaternion(), Z = new THREE.Vector3(0, 0, 1);
    for (const s of D3_SPRITES) {
      let root: THREE.Object3D = s.g; while (root.parent) root = root.parent; if (root !== w.scene) continue;
      const ch = s.g.parent!; ch.updateMatrixWorld(true); ch.getWorldQuaternion(qg); const up = new THREE.Vector3(0, 1, 0).applyQuaternion(qg), cr = new THREE.Vector3(1, 0, 0).applyQuaternion(qc), cu = new THREE.Vector3(0, 1, 0).applyQuaternion(qc); rz.setFromAxisAngle(Z, Math.atan2(-up.dot(cr), up.dot(cu)));
      s.g.quaternion.copy(qg.invert().multiply(qc.clone().multiply(rz)));
    }
  };
}; }
