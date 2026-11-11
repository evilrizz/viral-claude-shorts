// =====================================================================
//  "Cómo funciona un avión" (Idio-two): each scene only assembles the world (world.ts).
//  K('key') = when that word is said; $('#x') = selector inside the scene. Absolute video times.
// =====================================================================
type VaTl = gsap.core.Timeline;
type Va$ = (q: string) => string;
// when each character speaks (from words.json): mouths move only inside these ranges
const VA_TICO: [number, number][] = [[0.1, 9.28], [12.25, 36.19], [38.72, 99.54], [103.44, 104.84], [105.74, 138.32]];
const VA_DOTA: [number, number][] = [[10.02, 11.49], [36.89, 38.23], [100.19, 102.55], [139.09, 143.37]];
function vaTalk(tl: VaTl, $: Va$, id: string, s: Scene, who: 'tico' | 'dota') {
  for (const [a, b] of who === 'tico' ? VA_TICO : VA_DOTA) {
    const t0 = Math.max(a, s.t0 + 0.05), t1 = Math.min(b, s.t1 - 0.05);
    if (t1 - t0 > 0.2) (who === 'tico' ? avTicoTalk : avDotaTalk)(tl, $, id, t0, t1);
  }
}
// small characters in the bottom corners (engine scenes)
const vaTicoC = (pose: AvTicoPose = 'cross') => avTico('tc', 190, 1590, 0.48, pose);
const vaDotaC = (pose: AvDotaPose = 'down') => avDota('dc', 900, 1590, 0.55, pose, true);
// background + camera wrapper
const vaBurst = (body: string, over = '') => svg(`${avPrint()}<g id="cam"><g id="camP"><g id="camZ">${body}</g>${over}</g></g>`, AV_DEFS);
const vaPrint = vaBurst;
// every scene: the set moves (sunburst turns / dust drifts), the camera snaps in and punches on the keys, and the characters are alive
// the backdrop: one colour for the whole video, chosen to contrast with everything on screen
const VA_BG: Record<string, [string, boolean]> = {};   // one backdrop for the whole video (avPrint); a scene can still override it here
// lighten (t > 0) or darken (t < 0) a #rrggbb colour
function vaShade(hex: string, t: number) {
  const n = parseInt(hex.slice(1), 16);
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.round(t > 0 ? c + (255 - c) * t : c * (1 + t)).toString(16).padStart(2, '0')).join('');
}
function vaBackdrop(s: Scene, $: Va$) {
  const sec0 = document.getElementById('sc-' + s.id);   // titles in this style: the key word just changes colour (no box)
  if (sec0) { sec0.style.setProperty('--accent', 'transparent'); sec0.style.setProperty('--accent-text', AVP.orange); sec0.style.setProperty('--label', '#2a2c35'); sec0.style.background = AVP.ink; }
  const bg = VA_BG[s.id]; if (!bg) return;
  const [b, light] = bg, at = (id: string, k: string, val: string) => document.querySelector($('#' + id))?.setAttribute(k, val);
  at('bd0', 'fill', b); at('bd1', 'fill', vaShade(b, light ? 0.25 : 0.14)); at('bd2', 'fill', vaShade(b, light ? 0.45 : 0.24));
  at('bd3', 'stroke', vaShade(b, light ? -0.35 : -0.6)); at('bd3', 'opacity', light ? '0.35' : '0.55');
  at('bd4', 'fill', vaShade(b, light ? -0.18 : -0.35)); at('bd5', 'fill', vaShade(b, light ? -0.3 : 0.18));
  const sec = document.getElementById('sc-' + s.id); if (sec) { sec.style.background = b; if (light) sec.style.setProperty('--ink', AV.navy); }
}
interface VaMark { k: string; dt?: number; x: number; y: number; r: number; z?: number; hold?: number; label?: string }
function vaBase(tl: VaTl, s: Scene, $: Va$, burst = true) {
  vaBackdrop(s, $);
  const marks = (s as unknown as { marks?: VaMark[] }).marks || [], camZ = document.querySelector($('#camZ'));
  marks.forEach((m, i) => {
    const key = (s.keys || []).find((k) => k.id === m.k), t = (key ? key.t : s.t0 + 0.5) + (m.dt || 0), d = m.hold || 1.4;
    camZ?.insertAdjacentHTML('beforeend', avMark(`mk${i}`, m.x, m.y, m.r, m.label || ''));
    if (m.z) avZoom(tl, $, m.x, m.y, m.z, t - 0.05, d);
    avMarkIn(tl, $, `mk${i}`, m.x, m.y, t, d, !!m.label);
  });
  if (burst && document.querySelector($('#bg'))) tl.fromTo($('#bg'), { rotation: 0, svgOrigin: '0 0' }, { rotation: 24, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
  else if (document.querySelector($('.dust'))) avDust(tl, $, s);
  const i = SCENES.scenes.findIndex((x) => x.id === s.id);
  avCamera(tl, $, s, i % 2 ? 1 : -1);
  for (const [id, kind] of [['tk', 'tico'], ['tc', 'tico'], ['d', 'dota'], ['dc', 'dota']] as const) if (document.querySelector($(`#${id}-rig`))) avAlive(tl, $, id, s, kind);
}

// speed streaks (the plane is flying): thin lines that slide left over the scene
const vaStreaks = (n = 9) => `<g id="streaks">${[...Array(n)].map((_, i) => `<line x1="${(i * 263) % 1080}" y1="${560 + ((i * 149) % 900)}" x2="${((i * 263) % 1080) + 120 + (i % 3) * 60}" y2="${560 + ((i * 149) % 900)}" stroke="#e8e6dc" stroke-width="${3 + (i % 2) * 2}" stroke-linecap="round" opacity="0.18"/>`).join('')}</g>`;
const vaStreakRun = (tl: VaTl, $: Va$, s: Scene, speed = 1) => tl.fromTo($('#streaks line'), { x: 0 }, { x: -900 * speed, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
const vaFan = (tl: VaTl, $: Va$, sel: string, t: number, d: number, turns = 6) => tl.fromTo($(sel), { rotation: 0, svgOrigin: '0 0' }, { rotation: 360 * turns, duration: d, ease: 'none' }, t);
// the plane floats in the air: a soft bob and a small pitch wobble
const vaBob = (tl: VaTl, $: Va$, id: string, s: Scene, a = 10) => tl.fromTo($(`#${id}`), { y: -a }, { y: a, duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((s.t1 - s.t0) / 0.9) }, s.t0);
// moves a group along a straight line while turning, by setting its transform from a proxy (deterministic on any seek)
function vaMove(tl: VaTl, $: Va$, sel: string, a: [number, number, number], b: [number, number, number], t: number, d: number, ease = 'sine.inOut') {
  const p = { k: 0 }, set = () => { const e = document.querySelector($(sel)); const x = a[0] + (b[0] - a[0]) * p.k, y = a[1] + (b[1] - a[1]) * p.k, r = a[2] + (b[2] - a[2]) * p.k; e?.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r.toFixed(2)})`); };
  document.querySelector($(sel))?.setAttribute('transform', `translate(${a[0]} ${a[1]}) rotate(${a[2]})`);
  tl.fromTo(p, { k: 0 }, { k: 1, duration: d, ease, onUpdate: set, onStart: set }, t);
}
const vaAll: AvPlaneOpts = { turb: true, stab: true, elev: true, fin: true, rud: true };

defineVisuals({
  hook: {
    html: () => vaBurst(`${avTico('tk', 230, 1590, 0.6)}<g id="dg">${avDota('d', 640, 1580, 0.85, 'hug')}<g id="board">${avPlaneSide('p', 640, 1470, 0.5, { tape: true })}</g></g>`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $);
      avPop(tl, $('#dg'), s.t0 + 0.15, 0.5);
      tl.fromTo($('#p-body'), { rotation: -4, svgOrigin: '0 0' }, { rotation: 4, duration: 0.6, yoyo: true, repeat: 5, ease: 'sine.inOut' }, s.t0 + 0.7);
      tl.fromTo($('#p-body rect'), { opacity: 1 }, { opacity: 0.6, duration: 0.15, yoyo: true, repeat: 3 }, K('alas'));
      avHop(tl, $('#dg'), K('alas') + 0.1, 2, 30);
      vaTalk(tl, $, 'tk', s, 'tico');
    },
  },
  off: {
    html: () => vaBurst(`${vaStreaks()}<g id="pl">${avPlaneSide('p', 560, 1050, 1, vaAll)}</g>${avSmoke('sm', 770, 1110, 0.8, '#5b5e68')}${avQuestion('q', 540, 680, 0.75)}${vaTicoC('point')}`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $); vaStreakRun(tl, $, s, 1.2); vaBob(tl, $, 'pl', s);
      vaFan(tl, $, '#p-turb-fan', s.t0, K('off') - s.t0, 10);
      tl.to($('#p-turb-fan'), { rotation: '+=200', duration: 1.6, ease: 'power3.out' }, K('off'));
      avPuff(tl, $('#sm'), K('off') + 0.1, -120); avPuff(tl, $('#sm'), K('off') + 0.9, -120);
      tl.to($('#p-body'), { rotation: 8, svgOrigin: '0 0', duration: 0.8, ease: 'power2.inOut' }, K('off') + 0.3);
      tl.set($('#q'), { opacity: 0 }, s.t0).set($('#q'), { opacity: 1 }, K('cae') - 0.05); avPop(tl, $('#q'), K('cae') - 0.05, 0.45);
      tl.to($('#q'), { rotation: 6, transformOrigin: '50% 50%', duration: 0.35, yoyo: true, repeat: 5, ease: 'sine.inOut' }, K('cae') + 0.5);
      vaTalk(tl, $, 'tc', s, 'tico');
    },
  },
  obvio: {
    html: () => vaBurst(`${avTico('tk', 280, 1590, 0.62)}<g id="dg">${avDota('d', 720, 1580, 0.9, 'hug')}${avPlaneSide('pb', 720, 1480, 0.5, { tape: true })}</g>`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $);
      avPop(tl, $('#dg'), K('dota') - 0.2, 0.4); avHop(tl, $('#dg'), K('dota') + 0.3, 3, 26);
      vaTalk(tl, $, 'd', s, 'dota');
    },
  },
  idiot: {
    html: () => vaBurst(`${avTico('tk', 280, 1590, 0.62)}<g id="dg">${avDota('d', 720, 1580, 0.9, 'hug')}${avPlaneSide('pb', 720, 1480, 0.5, { tape: true })}</g>`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $);
      avTicoPose(tl, $, 'tk', 'palm', K('palm') + 0.1);
      tl.fromTo($('#d-pupils'), { x: -6 }, { x: 6, duration: 0.25, yoyo: true, repeat: 5, ease: 'sine.inOut' }, K('idiota'));
      vaTalk(tl, $, 'tk', s, 'tico');
    },
  },
  promise: {
    html: () => vaBurst(`<g id="bar"><rect x="140" y="1000" width="800" height="14" rx="7" fill="#2a2c35"/><g id="barFill"><rect x="140" y="1000" width="800" height="14" rx="7" fill="${AVP.orange}"/></g>
      <g id="pin"><g transform="translate(940 1007)"><circle r="26" fill="${AVP.lime}" stroke="${AV.o}" stroke-width="6"/><path d="M-8 -12 L12 0 L-8 12Z" fill="${AV.o}"/></g></g>
      <text x="140" y="960" font-size="30" font-weight="700" fill="#cfcdc4" style="font-family: ui-monospace, monospace; letter-spacing: 3px">00:00</text><text x="940" y="960" text-anchor="end" font-size="30" font-weight="700" fill="${AVP.lime}" style="font-family: ui-monospace, monospace; letter-spacing: 3px">AL FINAL</text></g>
      ${avTico('tk', 300, 1590, 0.62, 'point')}`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $);
      avPopIn(tl, $('#bar'), s.t0 + 0.1);
      tl.fromTo($('#barFill'), { scaleX: 0, svgOrigin: '140 1007' }, { scaleX: 1, duration: s.t1 - s.t0 - 0.4, ease: 'power1.inOut' }, s.t0 + 0.2);
      avPop(tl, $('#pin'), K('bar'), 0.4);
      vaTalk(tl, $, 'tk', s, 'tico');
    },
  },
  fuel: {
    html: () => vaBurst(`${avGauge('gg', 540, 900, 1.6)}<g id="file">${avDossier('ds', 540, 1360, 'ARCHIVO · ███████', 'Un avión sin', '????', 'combustible en pleno vuelo')}</g>${vaTicoC()}`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $);
      avPop(tl, $('#gg'), s.t0 + 0.1, 0.5);
      tl.fromTo($('#gg-needle'), { rotation: 60, svgOrigin: '0 0' }, { rotation: -72, duration: 1.2, ease: 'power2.inOut' }, K('gauge') - 0.6);
      tl.to($('#gg-needle'), { rotation: -66, svgOrigin: '0 0', duration: 0.12, yoyo: true, repeat: 5, ease: 'sine.inOut' }, K('gauge') + 0.6);
      tl.set($('#file'), { opacity: 0 }, s.t0); tl.fromTo($('#file'), { opacity: 0, y: 120 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', immediateRender: false }, K('file'));
      vaTalk(tl, $, 'tc', s, 'tico');
    },
  },
  armo: {
    html: () => vaBurst(`${avTable('tb', 1280, 300, 980)}<g id="boardG">${avPlaneSide('pb', 640, 1230, 0.55, { tape: true })}</g>${avTico('tk', 200, 1590, 0.6, 'point')}`, avSpot(640, 1220, 360)),
    anim(tl, s, K, $) {
      vaBase(tl, s, $);
      tl.fromTo($('#boardG'), { y: -1200 }, { y: 0, duration: 0.45, ease: 'bounce.out' }, K('board') - 0.4);
      avFocus(tl, $, 640, 1220, 1.5, K('board') + 0.15, 1.0);
      vaTalk(tl, $, 'tk', s, 'tico');
    },
  },
  crash: {
    html: () => vaBurst(`<g id="fly"><g id="flyIn">${avPlaneSide('pb', 0, 0, 0.5, { tape: true })}</g></g>${avSmoke('dust', 820, 1500, 1.1, '#5b5e68')}${avBoom('bm', 820, 1480, 0.7)}<g id="dg">${avDota('d', 230, 1580, 0.85, 'up')}</g>`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $);
      const dt = K('crash') - K('throw');
      vaMove(tl, $, '#fly', [300, 1230, 0], [300, 1230, 0], s.t0, 0.05);
      vaMove(tl, $, '#fly', [300, 1230, 0], [540, 1000, -10], K('throw'), dt * 0.45, 'power1.out');
      vaMove(tl, $, '#fly', [540, 1000, -10], [820, 1460, 70], K('throw') + dt * 0.45, dt * 0.55, 'power2.in');
      avDotaPose(tl, $, 'd', 'reach', K('throw'));
      avFlash(tl, $('#bm'), K('crash'), 0.4); avPuff(tl, $('#dust'), K('crash') + 0.05, -110);
      tl.fromTo($('#flyIn'), { rotation: 0, svgOrigin: '0 0' }, { rotation: 12, duration: 0.1, yoyo: true, repeat: 3 }, K('crash'));
      vaTalk(tl, $, 'd', s, 'dota');
    },
  },
  wing: {
    html: () => vaBurst(`${avAirfoil('af', 540, 1120, 1)}${vaTicoC('point')}`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $);
      tl.set($('#af-flow'), { opacity: 1 }, s.t0); avFlow(tl, $, 'af', s.t0, s.t1 - s.t0);
      avPop(tl, $('#af-tilt'), s.t0 + 0.1, 0.5);
      tl.fromTo($('#af-tilt'), { rotation: 0, svgOrigin: '0 0' }, { rotation: 8, duration: 0.5, ease: 'back.out(2)', immediateRender: false }, K('tilt') - 0.2);
      tl.set($('#af-down'), { opacity: 1 }, K('down') - 0.1); avPopIn(tl, $('#af-down'), K('down') - 0.1);
      vaTalk(tl, $, 'tc', s, 'tico');
    },
  },
  lift: {
    html: () => vaBurst(`${avAirfoil('af', 540, 1150, 1)}${vaTicoC('point')}`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $);
      tl.set($('#af-flow'), { opacity: 1 }, s.t0).set($('#af-down'), { opacity: 1 }, s.t0).set($('#af-tilt'), { rotation: 8, svgOrigin: '0 0' }, s.t0); avFlow(tl, $, 'af', s.t0, s.t1 - s.t0);
      tl.set($('#af-lift'), { opacity: 1 }, K('up') - 0.2); tl.fromTo($('#af-lift'), { scaleY: 0, svgOrigin: '0 -110' }, { scaleY: 1, duration: 0.5, ease: 'back.out(1.8)', immediateRender: false }, K('up') - 0.2);
      tl.to($('#af-tilt'), { y: -30, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: 3 }, K('up'));
      vaTalk(tl, $, 'tc', s, 'tico');
    },
  },
  vuela: {
    html: () => vaBurst(`${avAirfoil('af', 560, 1000, 0.75)}${avDota('d', 230, 1580, 0.75, 'up')}${avTico('tk', 860, 1590, 0.55)}`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $);
      tl.set($('#af-flow'), { opacity: 1 }, s.t0).set($('#af-lift'), { opacity: 1 }, s.t0).set($('#af-tilt'), { rotation: 8, svgOrigin: '0 0' }, s.t0);
      avFlow(tl, $, 'af', s.t0, K('fast') - s.t0); avFlow(tl, $, 'af', K('fast'), K('still') - K('fast'), 2.4);
      avHop(tl, $('#d'), K('dota'), 3, 40);
      tl.to($('#af-flow'), { opacity: 0.15, duration: 0.3 }, K('still')); tl.to($('#af-lift'), { scaleY: 0, svgOrigin: '0 -110', duration: 0.4, ease: 'power2.in' }, K('still'));
      vaTalk(tl, $, 'd', s, 'dota'); vaTalk(tl, $, 'tk', s, 'tico');
    },
  },
  turb: {
    html: () => vaBurst(`<g id="pl">${avPlaneSide('p', 600, 1000, 1, {})}</g>${vaTicoC('point')}`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $); vaBob(tl, $, 'pl', s, 6);
      tl.set($('#p-turbG'), { opacity: 1 }, K('turb') - 0.1); avPop(tl, $('#p-turbG'), K('turb') - 0.1, 0.5);
      vaFan(tl, $, '#p-turb-fan', K('turb'), s.t1 - K('turb'), 8);
      vaTalk(tl, $, 'tc', s, 'tico');
    },
  },
  motor: {
    html: () => vaBurst(`${vaStreaks()}<g id="air">${[0, 1, 2, 3].map((i) => avArrow(`ai${i}`, 560 - i * 30, 1060 + i * 10, 300 - i * 40, 1060 + i * 10, AVP.air, 14)).join('')}</g><g id="pl">${avPlaneSide('p', 600, 1000, 1, { turb: true })}</g>
      ${avArrow('fwd', 760, 860, 960, 860, AVP.lime, 22)}<g id="dg">${avDota('d', 180, 1580, 0.7, 'down')}</g>${vaTicoC('point')}`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $); vaBob(tl, $, 'pl', s, 6);
      vaFan(tl, $, '#p-turb-fan', s.t0, s.t1 - s.t0, 14);
      tl.set($('#air'), { opacity: 0 }, s.t0).set($('#air'), { opacity: 1 }, K('blow'));
      tl.fromTo($('#air g'), { x: 40, opacity: 0 }, { x: -60, opacity: 1, duration: 0.5, ease: 'none', repeat: Math.ceil((s.t1 - K('blow')) / 0.5), stagger: 0.12 }, K('blow'));
      tl.to($('#dg'), { x: -500, y: -700, rotation: -540, svgOrigin: '180 1400', duration: 0.7, ease: 'power2.in' }, K('dota') + 0.1);
      avPopIn(tl, $('#fwd'), K('dota') + 0.6); vaStreakRun(tl, $, s, 0.8);
      vaTalk(tl, $, 'tc', s, 'tico');
    },
  },
  pitch: {
    html: () => vaBurst(`${vaStreaks()}<g id="pl">${avPlaneSide('p', 600, 1000, 1, { turb: true })}</g><path id="wave" d="M160 1260 C 300 1160, 420 1360, 560 1260 S 820 1160, 960 1260" fill="none" stroke="${AVP.orange}" stroke-width="6" stroke-dasharray="14 12" opacity="0.8"/>${vaTicoC()}`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $); vaStreakRun(tl, $, s);
      vaFan(tl, $, '#p-turb-fan', s.t0, s.t1 - s.t0, 12);
      tl.fromTo($('#p-body'), { rotation: -14, svgOrigin: '0 0' }, { rotation: 14, duration: 0.55, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((s.t1 - s.t0) / 0.55) }, s.t0);
      tl.fromTo($('#pl'), { y: -30 }, { y: 30, duration: 0.55, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((s.t1 - s.t0) / 0.55) }, s.t0 + 0.27);
      tl.fromTo($('#wave'), { strokeDashoffset: 0 }, { strokeDashoffset: -300, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
      vaTalk(tl, $, 'tc', s, 'tico');
    },
  },
  stab: {
    html: () => vaBurst(`${vaStreaks()}<g id="pl">${avPlaneSide('p', 600, 1000, 1, { turb: true })}</g>${vaTicoC('point')}`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $); vaStreakRun(tl, $, s);
      vaFan(tl, $, '#p-turb-fan', s.t0, s.t1 - s.t0, 12);
      tl.fromTo($('#p-body'), { rotation: -12, svgOrigin: '0 0' }, { rotation: 12, duration: 0.55, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((K('stab') - s.t0) / 0.55) }, s.t0);
      tl.set($('#p-stab'), { opacity: 1 }, K('stab') - 0.1); avPop(tl, $('#p-stab'), K('stab') - 0.1, 0.45);
      tl.to($('#p-body'), { rotation: 0, svgOrigin: '0 0', duration: 0.9, ease: 'elastic.out(1, 0.5)' }, K('stab') + 0.3);
      vaTalk(tl, $, 'tc', s, 'tico');
    },
  },
  elev: {
    html: () => vaBurst(`${vaStreaks()}<g id="pl">${avPlaneSide('p', 600, 1000, 1, { turb: true, stab: true })}</g>${vaTicoC('point')}`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $); vaStreakRun(tl, $, s);
      vaFan(tl, $, '#p-turb-fan', s.t0, s.t1 - s.t0, 12);
      tl.set($('#p-elev'), { opacity: 1 }, s.t0 + 0.2); avPop(tl, $('#p-elev'), s.t0 + 0.2, 0.4);
      tl.to($('#p-elevM'), { rotation: -28, svgOrigin: '-322 0', duration: 0.3, ease: 'power2.out' }, K('up') - 0.1);
      tl.to($('#p-body'), { rotation: -12, svgOrigin: '0 0', duration: 0.5, ease: 'power2.inOut' }, K('up') + 0.1);
      tl.to($('#p-elevM'), { rotation: 28, svgOrigin: '-322 0', duration: 0.3, ease: 'power2.out' }, K('down') - 0.1);
      tl.to($('#p-body'), { rotation: 10, svgOrigin: '0 0', duration: 0.5, ease: 'power2.inOut' }, K('down') + 0.1);
      tl.to($('#p-elevM'), { rotation: 0, svgOrigin: '-322 0', duration: 0.3 }, K('down') + 0.9); tl.to($('#p-body'), { rotation: 0, svgOrigin: '0 0', duration: 0.5 }, K('down') + 0.9);
      vaTalk(tl, $, 'tc', s, 'tico');
    },
  },
  yaw: {
    html: () => vaBurst(`<g id="mud">${[...Array(8)].map((_, i) => `<ellipse cx="${300 + (i * 97) % 480}" cy="${1300 + (i * 61) % 220}" rx="${20 + (i % 3) * 10}" ry="${10 + (i % 2) * 6}" fill="#6b4a2a" opacity="0.7"/>`).join('')}</g>${avPlaneTop('pt', 540, 1020, 0.85, { stab: true })}${vaTicoC()}`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $);
      tl.fromTo($('#pt-body'), { rotation: -14, svgOrigin: '0 0' }, { rotation: 14, duration: 0.42, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((s.t1 - s.t0) / 0.42) }, s.t0);
      tl.fromTo($('#pt-body'), { x: -30 }, { x: 30, duration: 0.42, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((s.t1 - s.t0) / 0.42) }, s.t0 + 0.21);
      tl.fromTo($('#mud ellipse'), { y: 0, opacity: 0.7 }, { y: 180, opacity: 0, duration: 0.8, ease: 'none', repeat: Math.ceil((s.t1 - s.t0) / 0.8), stagger: 0.1 }, s.t0);
      vaTalk(tl, $, 'tc', s, 'tico');
    },
  },
  fin: {
    html: () => vaBurst(`${vaStreaks()}<g id="pl">${avPlaneSide('p', 600, 1000, 1, { turb: true, stab: true, elev: true })}</g>
      <g id="shark" opacity="0"><path d="M770 760 L860 620 L880 760Z" fill="#5b6a80" stroke="${AV.o}" stroke-width="6" stroke-linejoin="round"/><path d="M740 770 q 30 -12 60 0 q 30 12 60 0 q 30 -12 60 0" fill="none" stroke="${AVP.air}" stroke-width="6"/></g>${vaTicoC('point')}`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $); vaStreakRun(tl, $, s);
      vaFan(tl, $, '#p-turb-fan', s.t0, s.t1 - s.t0, 12);
      tl.set($('#p-fin'), { opacity: 1 }, K('fin') - 0.1); avPop(tl, $('#p-fin'), K('fin') - 0.1, 0.45);
      tl.set($('#shark'), { opacity: 1 }, K('fin') + 0.6); tl.fromTo($('#shark'), { x: 200 }, { x: -60, duration: 1.2, ease: 'power1.inOut', immediateRender: false }, K('fin') + 0.6); tl.to($('#shark'), { opacity: 0, duration: 0.3 }, K('fin') + 1.6);
      tl.set($('#p-rud'), { opacity: 1 }, K('rud') - 0.2); avPop(tl, $('#p-rud'), K('rud') - 0.2, 0.35);
      tl.fromTo($('#p-rudM'), { scaleX: 1, svgOrigin: '-326 0' }, { scaleX: 0.3, duration: 0.25, yoyo: true, repeat: 3, ease: 'sine.inOut' }, K('rud') + 0.3);
      vaTalk(tl, $, 'tc', s, 'tico');
    },
  },
  roll: {
    html: () => vaBurst(`${vaStreaks()}<g id="pl">${avPlaneFront('pf', 540, 1000, 1, { turb: true })}</g>${vaTicoC()}`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $); vaStreakRun(tl, $, s); vaBob(tl, $, 'pl', s, 8);
      vaFan(tl, $, '#pf-fan0', s.t0, s.t1 - s.t0, 10); vaFan(tl, $, '#pf-fan1', s.t0, s.t1 - s.t0, 10);
      tl.set($('#pf-ails'), { opacity: 1 }, K('tips') - 0.1); avPopIn(tl, $('#pf-ailR'), K('tips') - 0.1); avPopIn(tl, $('#pf-ailL'), K('tips') - 0.1);
      vaTalk(tl, $, 'tc', s, 'tico');
    },
  },
  ail: {
    html: () => vaBurst(`${vaStreaks()}<g id="pl">${avPlaneFront('pf', 540, 1000, 1, { turb: true, ail: true })}</g>${avArrow('upA', 900, 900, 900, 820, AVP.lime, 14)}${avArrow('dnA', 180, 1100, 180, 1180, AVP.orange, 14)}${vaTicoC('point')}`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $); vaStreakRun(tl, $, s);
      vaFan(tl, $, '#pf-fan0', s.t0, s.t1 - s.t0, 12); vaFan(tl, $, '#pf-fan1', s.t0, s.t1 - s.t0, 12);
      tl.to($('#pf-ailR'), { rotation: -24, svgOrigin: '300 0', duration: 0.3, ease: 'power2.out' }, K('up') - 0.1);
      tl.to($('#pf-ailL'), { rotation: -24, svgOrigin: '-300 0', duration: 0.3, ease: 'power2.out' }, K('up') + 0.6);
      avPopIn(tl, $('#upA'), K('up') + 0.1); avPopIn(tl, $('#dnA'), K('up') + 0.8);
      tl.to($('#pf-body'), { rotation: -22, svgOrigin: '0 0', duration: 0.9, ease: 'power2.inOut' }, K('bank') - 0.2);
      vaTalk(tl, $, 'tc', s, 'tico');
    },
  },
  slow: {
    html: () => vaBurst(`<rect x="0" y="1380" width="1080" height="60" fill="#2a2c35"/>${[...Array(7)].map((_, i) => `<rect x="${60 + i * 160}" y="1404" width="80" height="12" fill="#e8e6dc" opacity="0.7"/>`).join('')}
      <g id="pl">${avPlaneSide('p', 560, 1000, 0.75, vaAll)}</g>${avBar('bv', 730, 820, 'VELOCIDAD', AVP.lime, 260)}${avBar('bl', 910, 820, 'EMPUJE', AVP.air, 260)}${vaTicoC()}`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $);
      vaFan(tl, $, '#p-turb-fan', s.t0, s.t1 - s.t0, 5);
      tl.fromTo($('#pl'), { x: -120, y: -40 }, { x: 60, y: 120, duration: s.t1 - s.t0, ease: 'sine.inOut' }, s.t0);
      avBarTo(tl, $, 'bv', 0.35, K('lento') - 0.1, 0.8, 812); avBarTo(tl, $, 'bl', 0.25, K('weak') - 0.1, 0.6, 812);
      tl.to($('#p-body'), { rotation: 8, svgOrigin: '0 0', duration: 0.5, yoyo: true, repeat: 1 }, K('weak'));
      vaTalk(tl, $, 'tc', s, 'tico');
    },
  },
  flaps: {
    html: () => vaBurst(`${avAirfoil('af', 540, 1100, 1)}${vaTicoC('point')}`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $);
      tl.set($('#af-flow'), { opacity: 1 }, s.t0).set($('#af-tilt'), { rotation: 6, svgOrigin: '0 0' }, s.t0).set($('#af-lift'), { opacity: 1 }, s.t0); avFlow(tl, $, 'af', s.t0, s.t1 - s.t0, 0.6);
      tl.set($('#af-lift'), { scaleY: 0.45, svgOrigin: '0 -110' }, s.t0);
      tl.set($('#af-flap'), { opacity: 1 }, K('flap') - 0.1); tl.fromTo($('#af-flapM'), { x: -130, y: -40, rotation: -20, svgOrigin: '290 14' }, { x: 0, y: 0, rotation: 14, duration: 0.7, ease: 'power2.out', immediateRender: false }, K('flap') - 0.1);
      tl.to($('#af-lift'), { scaleY: 1, svgOrigin: '0 -110', duration: 0.6, ease: 'back.out(2)' }, K('flap') + 0.5);
      vaTalk(tl, $, 'tc', s, 'tico');
    },
  },
  bike: {
    html: () => vaBurst(`${vaStreaks(12)}<g id="rider">${avBike('bk', 600, 1460, 1)}${avDota('d', 600, 1330, 0.75, 'up')}</g>${avTico('tk', 200, 1590, 0.55)}`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $); vaStreakRun(tl, $, s, 1.6);
      tl.fromTo($('#bk-w1, #bk-w2'), { rotation: 0, transformOrigin: '50% 50%' }, { rotation: 1440, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
      tl.fromTo($('#rider'), { y: 0 }, { y: -8, duration: 0.12, yoyo: true, repeat: Math.ceil((s.t1 - s.t0) / 0.12), ease: 'none' }, s.t0);
      tl.fromTo($('#d-nod'), { rotation: -6, svgOrigin: '0 -215' }, { rotation: 6, duration: 0.4, yoyo: true, repeat: 6, ease: 'sine.inOut', immediateRender: false }, K('bike') + 0.3);
      tl.fromTo($('#tk-head'), { rotation: -5, svgOrigin: '0 -360' }, { rotation: 5, duration: 0.25, yoyo: true, repeat: 3, ease: 'sine.inOut' }, K('tico'));
      vaTalk(tl, $, 'd', s, 'dota'); vaTalk(tl, $, 'tk', s, 'tico');
    },
  },
  rock: {
    html: () => vaBurst(`<g id="pl">${avPlaneSide('p', 600, 880, 0.75, vaAll)}</g>${avRock('rk', 250, 700, 0.9)}<line id="rkLine" x1="250" y1="760" x2="250" y2="1500" stroke="#8d8f96" stroke-width="4" stroke-dasharray="12 12" opacity="0"/>${avSmoke('sm', 760, 940, 0.6, '#5b5e68')}${vaTicoC()}`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $); vaBob(tl, $, 'pl', s, 8);
      vaFan(tl, $, '#p-turb-fan', s.t0, K('off') - s.t0, 6); tl.to($('#p-turb-fan'), { rotation: '+=160', duration: 1.4, ease: 'power3.out' }, K('off'));
      avPuff(tl, $('#sm'), K('off') + 0.1, -100);
      tl.set($('#rkLine'), { opacity: 0.6 }, K('rock')); tl.fromTo($('#rk'), { y: 0, rotation: 0 }, { y: 760, rotation: 120, svgOrigin: '250 700', duration: 0.6, ease: 'power2.in', immediateRender: false }, K('rock'));
      vaTalk(tl, $, 'tc', s, 'tico');
    },
  },
  glide: {
    html: () => vaBurst(`<path id="path" d="M140 700 Q 560 860 960 1380" fill="none" stroke="${AVP.lime}" stroke-width="6" stroke-dasharray="16 14" opacity="0.8"/><g id="pl">${avPlaneSide('p', 0, 0, 0.55, vaAll)}</g>${vaTicoC('point')}`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $);
      tl.fromTo($('#path'), { strokeDashoffset: 0 }, { strokeDashoffset: -200, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
      vaMove(tl, $, '#pl', [200, 730, 14], [860, 1250, 26], s.t0, s.t1 - s.t0);
      vaTalk(tl, $, 'tc', s, 'tico');
    },
  },
  trade: {
    html: () => vaBurst(`${avBar('ba', 300, 1300, 'ALTURA', AVP.air, 520)}${avBar('bs', 540, 1300, 'VELOCIDAD', AVP.lime, 520)}<g id="mini">${avPlaneSide('pm', 830, 900, 0.32, vaAll)}${avArrow('liftM', 830, 860, 830, 680, AVP.lime, 16)}</g>${vaTicoC()}`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $);
      tl.set($('#bs-fill'), { scaleY: 0.55, svgOrigin: '0 1292' }, s.t0);
      avBarTo(tl, $, 'ba', 0.35, K('alt') - 0.1, 1.6, 1292); avBarTo(tl, $, 'bs', 0.8, K('vel') - 0.1, 0.8, 1292);
      tl.fromTo($('#mini'), { y: -60 }, { y: 140, duration: s.t1 - s.t0, ease: 'sine.inOut' }, s.t0);
      tl.fromTo($('#liftM'), { scale: 1, transformOrigin: '50% 100%' }, { scale: 1.2, duration: 0.3, yoyo: true, repeat: 3, ease: 'sine.inOut' }, K('lift'));
      vaTalk(tl, $, 'tc', s, 'tico');
    },
  },
  canada: {
    html: () => vaBurst(`${avDossier('ds', 540, 880, 'ARCHIVO · CANADÁ', 'Air Canada', '1983', 'Sin combustible en pleno vuelo')}<path id="gpath" d="M180 1250 Q 560 1330 900 1500" fill="none" stroke="${AVP.lime}" stroke-width="5" stroke-dasharray="14 12" opacity="0.7"/><g id="gp">${avPlaneSide('pg', 0, 0, 0.32, vaAll)}</g><rect x="760" y="1500" width="240" height="16" fill="#2a2c35"/>`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $);
      tl.set($('#ds'), { opacity: 0 }, s.t0); tl.fromTo($('#ds'), { opacity: 0, y: 140, rotation: -3, transformOrigin: '50% 50%' }, { opacity: 1, y: 0, rotation: 0, duration: 0.5, ease: 'power3.out', immediateRender: false }, K('card') - 0.15);
      avPop(tl, $('#ds-year'), K('card') + 0.3, 0.4);
      vaMove(tl, $, '#gp', [180, 1250, 6], [900, 1490, 14], s.t0, K('stamp') - s.t0);
      tl.set($('#ds-stamp'), { opacity: 1 }, K('stamp')); tl.fromTo($('#ds-stamp'), { scale: 2.2, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: 0.25, ease: 'power3.in', immediateRender: false }, K('stamp'));
    },
  },
  turbu: {
    html: () => vaBurst(`<g id="cabin"><rect x="60" y="560" width="960" height="980" rx="60" fill="#1d1f27" stroke="#3a3c46" stroke-width="10"/><rect x="60" y="560" width="960" height="120" rx="60" fill="#2a2c35"/>
      ${[0, 1, 2].map((i) => `<rect x="${170 + i * 300}" y="800" width="120" height="170" rx="56" fill="#5aa9ff" opacity="0.5" stroke="#3a3c46" stroke-width="10"/>`).join('')}</g>
      ${avSeat('st', 380, 1500, 1)}${avTico('tk', 330, 1500, 0.62, 'hold')}<rect x="250" y="1360" width="200" height="34" rx="10" fill="${AVP.orange}" stroke="${AV.o}" stroke-width="5"/><rect x="330" y="1356" width="44" height="42" rx="6" fill="#cfd4dd" stroke="${AV.o}" stroke-width="5"/>
      <g id="dg">${avDota('d', 760, 1520, 0.7, 'up')}</g>${avBoom('bm', 760, 690, 0.5)}`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $);
      tl.fromTo($('#cabin, #st'), { x: -6, y: 0 }, { x: 6, y: 4, duration: 0.07, yoyo: true, repeat: Math.ceil((s.t1 - K('shake')) / 0.07), ease: 'none', immediateRender: false }, K('shake'));
      tl.to($('#dg'), { y: -690, rotation: 180, svgOrigin: '760 1300', duration: 0.45, ease: 'power3.in' }, K('bonk') - 0.45);
      avFlash(tl, $('#bm'), K('bonk'), 0.35);
      tl.set($('#d-bump'), { opacity: 1 }, K('bonk')); avDizzy(tl, $, 'd', K('bonk'), s.t1);
      vaTalk(tl, $, 'tk', s, 'tico');
    },
  },
  belt: {
    html: () => vaBurst(`<rect x="60" y="560" width="960" height="980" rx="60" fill="#1d1f27" stroke="#3a3c46" stroke-width="10"/>
      ${avSeat('st', 380, 1500, 1)}${avTico('tk', 330, 1500, 0.62, 'hold')}<g id="beltL"><rect x="250" y="1360" width="100" height="34" rx="10" fill="${AVP.orange}" stroke="${AV.o}" stroke-width="5"/></g><g id="beltR"><rect x="350" y="1360" width="100" height="34" rx="10" fill="${AVP.orange}" stroke="${AV.o}" stroke-width="5"/><rect x="330" y="1356" width="44" height="42" rx="6" fill="#cfd4dd" stroke="${AV.o}" stroke-width="5"/></g>
      <g id="dg" transform="rotate(180 760 1250)">${avDota('d', 760, 1450, 0.6, 'up')}</g>`, avSpot(350, 1380, 260)),
    anim(tl, s, K, $) {
      vaBase(tl, s, $);
      tl.set($('#d-bump'), { opacity: 1 }, s.t0); avDizzy(tl, $, 'd', s.t0, s.t1);
      tl.fromTo($('#beltL'), { x: -120 }, { x: 0, duration: 0.3, ease: 'power3.out' }, K('click') - 0.3);
      tl.fromTo($('#beltR'), { x: 120 }, { x: 0, duration: 0.3, ease: 'power3.out' }, K('click') - 0.3);
      avFocus(tl, $, 350, 1380, 1.4, K('click') - 0.5, 0.8);
      vaTalk(tl, $, 'tk', s, 'tico');
    },
  },
  sub: {
    bg: AV.bg1, ink: AV.navy,
    // the banner: stars around, "¡SUSCRÍBANSE!" over the Idio-two logo, Tico (idea bulb, arms crossed) and Dota (arms up, dizzy stars)
    html: () => svg(`${avBurst('bg', AV.bg1, AV.bg2, 540, 1000, false)}<g id="cam"><g id="camP"><g id="camZ">
      <g id="stars">${[[150, 560, 34], [930, 520, 30], [250, 760, 20], [860, 780, 22], [130, 1380, 26], [960, 1330, 34], [300, 1560, 22], [820, 1580, 20]].map(([x, y, r], i) => `<g id="st${i}">${avStar(x, y, r)}</g>`).join('')}</g>
      ${avCallout('sub', 540, 600, '¡SUSCRÍBANSE!')}${avLogo('logo', 540, 870, 178)}
      ${avTico('tk', 420, 1560, 0.8, 'cross')}${avDota('d', 680, 1560, 0.95, 'up')}
    </g></g></g>`, AV_DEFS),
    anim(tl, s, K, $) {
      vaBase(tl, s, $);
      tl.set($('#tk-bulb'), { opacity: 1 }, s.t0); avPop(tl, $('#tk-bulb'), s.t0 + 0.15, 0.4);
      avDizzy(tl, $, 'd', s.t0 + 0.1, s.t1);
      avPop(tl, $('#logo'), s.t0 + 0.05, 0.5);
      avPopIn(tl, $('#sub'), s.t0 + 0.3);
      tl.to($('#sub'), { scale: 1.08, transformOrigin: '50% 50%', duration: 0.25, yoyo: true, repeat: 7, ease: 'sine.inOut' }, s.t0 + 1.0);
      for (let i = 0; i < 8; i++) { avPop(tl, $(`#st${i}`), s.t0 + 0.1 + i * 0.07, 0.35); tl.to($(`#st${i}`), { rotation: i % 2 ? 20 : -20, scale: 1.15, transformOrigin: '50% 50%', duration: 0.5, yoyo: true, repeat: Math.floor((s.t1 - s.t0) / 0.5) - 1, ease: 'sine.inOut' }, s.t0 + 0.6 + i * 0.05); }
      avHop(tl, $('#d'), s.t0 + 0.2, 2, 30);
      tl.fromTo($('#tk-head'), { rotation: -6, svgOrigin: '0 -360' }, { rotation: 6, duration: 0.14, yoyo: true, repeat: 3, ease: 'sine.inOut' }, K('tabla'));
      tl.to($('#tk-brows'), { y: -12, duration: 0.15, yoyo: true, repeat: 1 }, K('tabla') + 0.6);
      vaTalk(tl, $, 'd', s, 'dota');
    },
  },  outro: {
    html: () => vaBurst(`${vaStreaks(12)}${[...Array(18)].map((_, i) => vaStarDot(i)).join('')}<g id="surf">${avPlaneSide('ps', 0, 0, 0.7, { tape: true })}${avDota('d', 0, -20, 0.6, 'up')}</g><g id="run">${avTico('tk', 260, 1590, 0.55, 'point')}</g>`),
    anim(tl, s, K, $) {
      vaBase(tl, s, $); vaStreakRun(tl, $, s, 1.4);
      vaMove(tl, $, '#surf', [300, 1300, -8], [1300, 650, -16], s.t0, s.t1 - s.t0, 'power1.in');
      tl.fromTo($('#run'), { x: -260 }, { x: 640, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
      avHop(tl, $('#run'), s.t0, Math.ceil((s.t1 - s.t0) / 0.3), 24);
      vaTalk(tl, $, 'tk', s, 'tico');
    },
  },
});
// a twinkly star dot for the night sky of the ending flight
function vaStarDot(i: number) { return `<circle cx="${(i * 197) % 1080}" cy="${500 + ((i * 263) % 700)}" r="${2 + (i % 3)}" fill="#e8e6dc" opacity="${0.3 + (i % 3) * 0.2}"/>`; }
