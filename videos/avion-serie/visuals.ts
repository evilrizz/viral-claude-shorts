// =====================================================================
//  "Cómo funciona un avión" (Idio-two): each scene only assembles the world (world.ts).
//  K('key') = when that word is said; $('#x') = selector inside the scene. Absolute video times.
// =====================================================================
type VsTl = gsap.core.Timeline;
type Vs$ = (q: string) => string;
// when each character speaks (from words.json): mouths move only inside these ranges
const VS_TICO: [number, number][] = [[0.1, 9.28], [12.25, 36.19], [38.72, 99.54], [103.43, 109.55], [113.5, 146.3]];
const VS_DOTA: [number, number][] = [[10.02, 11.49], [36.88, 38.22], [100.18, 102.54], [110.08, 112.76], [146.93, 151.21]];
function vsTalk(tl: VsTl, $: Vs$, id: string, s: Scene, who: 'tico' | 'dota') {
  for (const [a, b] of who === 'tico' ? VS_TICO : VS_DOTA) {
    const t0 = Math.max(a, s.t0 + 0.05), t1 = Math.min(b, s.t1 - 0.05);
    if (t1 - t0 > 0.2) (who === 'tico' ? asTicoTalk : asDotaTalk)(tl, $, id, t0, t1);
  }
}
// small characters in the bottom corners (engine scenes)
const vsTicoC = (pose: AsTicoPose = 'cross') => asTico('tc', 190, 1590, 0.48, pose);
const vsDotaC = (pose: AsDotaPose = 'down') => asDota('dc', 900, 1590, 0.55, pose, true);
// background + camera wrapper
const vsBurst = (body: string, over = '') => svg(`${asPrint()}<g id="cam"><g id="camP"><g id="camZ" filter="url(#asBoil)">${body}</g>${over}</g></g><rect width="1080" height="1920" fill="url(#asVig)"/>`, AS_SKY_DEFS);
const vsPrint = vsBurst;
// the building part uses the sky style of the second reference
const VS_SKY = new Set(['armo', 'crash', 'wing', 'lift', 'vuela', 'turb', 'motor', 'pitch', 'stab', 'elev', 'yaw', 'fin', 'roll', 'ail', 'slow', 'flaps', 'bike', 'felicidades']);
const vsSky = (body: string, ground = false, over = '') => svg(`${asSky(ground)}<g id="cam"><g id="camP"><g id="camZ" filter="url(#asBoil)">${body}</g>${over}</g></g><rect width="1080" height="1920" fill="url(#asVig)"/>`, AS_SKY_DEFS);
const vsGrid = (body: string, over = '') => svg(`${asNavyGrid()}<g id="cam"><g id="camP"><g id="camZ" filter="url(#asBoil)">${body}</g>${over}</g></g><rect width="1080" height="1920" fill="url(#asVig)"/>`, AS_SKY_DEFS);
// every scene: the set moves (sunburst turns / dust drifts), the camera snaps in and punches on the keys, and the characters are alive
// the backdrop: one colour for the whole video, chosen to contrast with everything on screen
const VS_BG: Record<string, [string, boolean]> = {};   // one backdrop for the whole video (asPrint); a scene can still override it here
// lighten (t > 0) or darken (t < 0) a #rrggbb colour
function vsShade(hex: string, t: number) {
  const n = parseInt(hex.slice(1), 16);
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.round(t > 0 ? c + (255 - c) * t : c * (1 + t)).toString(16).padStart(2, '0')).join('');
}
function vsBackdrop(s: Scene, $: Vs$) {
  const sec0 = document.getElementById('sc-' + s.id);   // titles in this style: the key word just changes colour (no box)
  if (sec0) { sec0.style.setProperty('--accent', 'transparent'); sec0.style.setProperty('--accent-text', ASP.orange); sec0.style.setProperty('--label', '#2a2c35'); sec0.style.background = ASP.ink; }
  if (sec0 && (s.id === 'turbu' || s.id === 'belt')) { sec0.style.setProperty('--ink', '#10204a'); sec0.style.setProperty('--accent-text', '#e0452a'); }
  if (sec0 && VS_SKY.has(s.id)) {   // captions of the sky style: upper case, italic, white with a dark outline, the key word in lime
    sec0.style.setProperty('--accent-text', '#e6ff3a'); sec0.style.setProperty('--label', '#10204a'); sec0.style.background = '#2a7fd9';
    const t = sec0.querySelector('.title') as HTMLElement | null;
    if (t) { t.style.textTransform = 'uppercase'; t.style.fontStyle = 'italic'; t.style.fontWeight = '900'; t.style.letterSpacing = '0.5px'; t.style.color = '#fff'; t.style.setProperty('-webkit-text-stroke', '7px #10204a'); t.style.paintOrder = 'stroke fill'; t.style.textShadow = '0 6px 0 rgba(16,32,74,0.35)'; }
  }
  const bg = VS_BG[s.id]; if (!bg) return;
  const [b, light] = bg, at = (id: string, k: string, val: string) => document.querySelector($('#' + id))?.setAttribute(k, val);
  at('bd0', 'fill', b); at('bd1', 'fill', vsShade(b, light ? 0.25 : 0.14)); at('bd2', 'fill', vsShade(b, light ? 0.45 : 0.24));
  at('bd3', 'stroke', vsShade(b, light ? -0.35 : -0.6)); at('bd3', 'opacity', light ? '0.35' : '0.55');
  at('bd4', 'fill', vsShade(b, light ? -0.18 : -0.35)); at('bd5', 'fill', vsShade(b, light ? -0.3 : 0.18));
  const sec = document.getElementById('sc-' + s.id); if (sec) { sec.style.background = b; if (light) sec.style.setProperty('--ink', AS.navy); }
}
interface VsMark { k: string; dt?: number; x: number; y: number; r: number; z?: number; hold?: number; label?: string }
function vsBase(tl: VsTl, s: Scene, $: Vs$, burst = true, cam = true) {
  { const bp = { v: s.t0 }, set = () => document.querySelectorAll('feTurbulence[data-boil]').forEach((e) => e.setAttribute('seed', String(1 + (Math.floor(bp.v * 8) % 3)))); tl.fromTo(bp, { v: s.t0 }, { v: s.t1, duration: s.t1 - s.t0, ease: 'none', onUpdate: set, onStart: set }, s.t0); }
  vsBackdrop(s, $);
  const marks = (s as unknown as { marks?: VsMark[] }).marks || [], camZ = document.querySelector($('#camZ'));
  marks.forEach((m, i) => {
    const key = (s.keys || []).find((k) => k.id === m.k), t = (key ? key.t : s.t0 + 0.5) + (m.dt || 0), d = m.hold || 1.4;
    camZ?.insertAdjacentHTML('beforeend', asMark(`mk${i}`, m.x, m.y, m.r, m.label || '', VS_SKY.has(s.id) ? '#10204a' : ASP.lime));
    if (m.z) asZoom(tl, $, m.x, m.y, m.z, t - 0.05, d);
    asMarkIn(tl, $, `mk${i}`, m.x, m.y, t, d, !!m.label);
  });
  if (burst && document.querySelector($('#bg'))) tl.fromTo($('#bg'), { rotation: 0, svgOrigin: '0 0' }, { rotation: 24, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
  else if (document.querySelector($('.dust'))) asDust(tl, $, s);
  const i = SCENES.scenes.findIndex((x) => x.id === s.id);
  if (cam) asCamera(tl, $, s, i % 2 ? 1 : -1);
  if (VS_SKY.has(s.id)) {
    const d = s.t1 - s.t0, dir = i % 2 ? 1 : -1;
    tl.fromTo($('#camP'), { rotation: -2.5 * dir, svgOrigin: '540 1000' }, { rotation: 2.5 * dir, duration: d, ease: 'sine.inOut', immediateRender: false }, s.t0);
    tl.fromTo($('#cam'), { y: 40 * dir }, { y: -40 * dir, duration: d, ease: 'sine.inOut', immediateRender: false }, s.t0);
    if (document.querySelector($('#pl'))) tl.fromTo($('#pl'), { x: -70 }, { x: 70, duration: d, ease: 'sine.inOut', immediateRender: false }, s.t0);
  }
  for (const [id, kind] of [['tk', 'tico'], ['tc', 'tico'], ['d', 'dota'], ['dc', 'dota']] as const) if (document.querySelector($(`#${id}-rig`))) asAlive(tl, $, id, s, kind);
}

// speed streaks (the plane is flying): thin lines that slide left over the scene
const vsStreaks = (n = 9) => `<g id="streaks">${[...Array(n)].map((_, i) => `<line x1="${(i * 263) % 1080}" y1="${560 + ((i * 149) % 900)}" x2="${((i * 263) % 1080) + 120 + (i % 3) * 60}" y2="${560 + ((i * 149) % 900)}" stroke="#e8e6dc" stroke-width="${3 + (i % 2) * 2}" stroke-linecap="round" opacity="0.18"/>`).join('')}</g>`;
const vsStreakRun = (tl: VsTl, $: Vs$, s: Scene, speed = 1) => tl.fromTo($('#streaks line'), { x: 0 }, { x: -900 * speed, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
const vsFan = (tl: VsTl, $: Vs$, sel: string, t: number, d: number, turns = 6) => tl.fromTo($(sel), { rotation: 0, svgOrigin: '0 0' }, { rotation: 360 * turns, duration: d, ease: 'none' }, t);
// the plane floats in the air: a soft bob and a small pitch wobble
const vsBob = (tl: VsTl, $: Vs$, id: string, s: Scene, a = 10) => tl.fromTo($(`#${id}`), { y: -a }, { y: a, duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((s.t1 - s.t0) / 0.9) }, s.t0);
// moves a group along a straight line while turning, by setting its transform from a proxy (deterministic on any seek)
function vsMove(tl: VsTl, $: Vs$, sel: string, a: [number, number, number], b: [number, number, number], t: number, d: number, ease = 'sine.inOut') {
  const p = { k: 0 }, set = () => { const e = document.querySelector($(sel)); const x = a[0] + (b[0] - a[0]) * p.k, y = a[1] + (b[1] - a[1]) * p.k, r = a[2] + (b[2] - a[2]) * p.k; e?.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r.toFixed(2)})`); };
  document.querySelector($(sel))?.setAttribute('transform', `translate(${a[0]} ${a[1]}) rotate(${a[2]})`);
  tl.fromTo(p, { k: 0 }, { k: 1, duration: d, ease, onUpdate: set, onStart: set }, t);
}
// the ailerons of the front view appear painted lime
function asPaintFront(tl: VsTl, $: Vs$, t: number) {
  tl.set($('#pf-ails'), { opacity: 1 }, t); asPopIn(tl, $('#pf-ailR'), t); asPopIn(tl, $('#pf-ailL'), t);
  tl.fromTo($('#pf-ails path'), { fill: '#e6ff3a' }, { fill: '#ff9a5a', duration: 0.6, ease: 'power1.in', immediateRender: false }, t + 1.1);
}
const vsAll: AsPlaneOpts = { turb: true, stab: true, elev: true, fin: true, rud: true };

defineVisuals({
  hook: {
    html: () => vsBurst(`${asTico('tk', 230, 1590, 0.6)}<g id="dg">${asDota('d', 640, 1580, 0.85, 'hug')}<g id="board">${asPlaneSide('p', 640, 1470, 0.5, { tape: true })}</g></g>`),
    anim(tl, s, K, $) {
      vsBase(tl, s, $);
      asPop(tl, $('#dg'), s.t0 + 0.15, 0.5);
      tl.fromTo($('#p-body'), { rotation: -4, svgOrigin: '0 0' }, { rotation: 4, duration: 0.6, yoyo: true, repeat: 5, ease: 'sine.inOut' }, s.t0 + 0.7);
      tl.fromTo($('#p-body rect'), { opacity: 1 }, { opacity: 0.6, duration: 0.15, yoyo: true, repeat: 3 }, K('alas'));
      asHop(tl, $('#dg'), K('alas') + 0.1, 2, 30);
      vsTalk(tl, $, 'tk', s, 'tico');
    },
  },
  off: {
    html: () => vsBurst(`${vsStreaks()}<g id="pl">${asCessna('p', 560, 1050, 0.95, AS_LINER_ALL)}</g>${asSmoke('sm', 430, 1110, 0.8, '#5b5e68')}${asQuestion('q', 540, 680, 0.75)}${vsTicoC('point')}`),
    anim(tl, s, K, $) {
      vsBase(tl, s, $); vsStreakRun(tl, $, s, 1.2); vsBob(tl, $, 'pl', s);
      vsFan(tl, $, '#p-fan, #p-fan2', s.t0, K('off') - s.t0, 10);
      tl.to($('#p-fan, #p-fan2'), { rotation: '+=200', duration: 1.6, ease: 'power3.out' }, K('off'));
      asPuff(tl, $('#sm'), K('off') + 0.1, -120); asPuff(tl, $('#sm'), K('off') + 0.9, -120);
      tl.to($('#p-body'), { rotation: 8, svgOrigin: '0 0', duration: 0.8, ease: 'power2.inOut' }, K('off') + 0.3);
      tl.set($('#q'), { opacity: 0 }, s.t0).set($('#q'), { opacity: 1 }, K('cae') - 0.05); asPop(tl, $('#q'), K('cae') - 0.05, 0.45);
      tl.to($('#q'), { rotation: 6, transformOrigin: '50% 50%', duration: 0.35, yoyo: true, repeat: 5, ease: 'sine.inOut' }, K('cae') + 0.5);
      vsTalk(tl, $, 'tc', s, 'tico');
    },
  },
  obvio: {
    html: () => vsBurst(`${asTico('tk', 280, 1590, 0.62)}<g id="dg">${asDota('d', 720, 1580, 0.9, 'hug')}${asPlaneSide('pb', 720, 1480, 0.5, { tape: true })}</g>`),
    anim(tl, s, K, $) {
      vsBase(tl, s, $);
      asPop(tl, $('#dg'), K('dota') - 0.2, 0.4); asHop(tl, $('#dg'), K('dota') + 0.3, 3, 26);
      vsTalk(tl, $, 'd', s, 'dota');
    },
  },
  idiot: {
    html: () => vsBurst(`${asTico('tk', 280, 1590, 0.62)}<g id="dg">${asDota('d', 720, 1580, 0.9, 'hug')}${asPlaneSide('pb', 720, 1480, 0.5, { tape: true })}</g>`),
    anim(tl, s, K, $) {
      vsBase(tl, s, $);
      asTicoPose(tl, $, 'tk', 'palm', K('palm') + 0.1);
      asDotaEyes(tl, $, 'd', true, K('idiota'));
      tl.fromTo($('#d-pupils'), { x: -6 }, { x: 6, duration: 0.25, yoyo: true, repeat: 5, ease: 'sine.inOut' }, K('idiota'));
      vsTalk(tl, $, 'tk', s, 'tico');
    },
  },
  promise: {
    html: () => vsBurst(`<g id="bar"><rect x="140" y="1000" width="800" height="14" rx="7" fill="#2a2c35"/><g id="barFill"><rect x="140" y="1000" width="800" height="14" rx="7" fill="${ASP.orange}"/></g>
      <g id="pin"><g transform="translate(940 1007)"><circle r="26" fill="${ASP.lime}" stroke="${AS.o}" stroke-width="6"/><path d="M-8 -12 L12 0 L-8 12Z" fill="${AS.o}"/></g></g>
      <text x="140" y="960" font-size="30" font-weight="700" fill="#cfcdc4" style="font-family: ui-monospace, monospace; letter-spacing: 3px">00:00</text><text x="940" y="960" text-anchor="end" font-size="30" font-weight="700" fill="${ASP.lime}" style="font-family: ui-monospace, monospace; letter-spacing: 3px">AL FINAL</text></g>
      ${asTico('tk', 300, 1590, 0.62, 'point')}`),
    anim(tl, s, K, $) {
      vsBase(tl, s, $);
      asPopIn(tl, $('#bar'), s.t0 + 0.1);
      tl.fromTo($('#barFill'), { scaleX: 0, svgOrigin: '140 1007' }, { scaleX: 1, duration: s.t1 - s.t0 - 0.4, ease: 'power1.inOut' }, s.t0 + 0.2);
      asPop(tl, $('#pin'), K('bar'), 0.4);
      vsTalk(tl, $, 'tk', s, 'tico');
    },
  },
  fuel: {
    html: () => vsBurst(`${asGauge('gg', 540, 900, 1.6)}<g id="file">${asDossier('ds', 540, 1360, 'ARCHIVO · ███████', 'Un avión sin', '????', 'combustible en pleno vuelo')}</g>${vsTicoC()}`),
    anim(tl, s, K, $) {
      vsBase(tl, s, $);
      asPop(tl, $('#gg'), s.t0 + 0.1, 0.5);
      tl.fromTo($('#gg-needle'), { rotation: 60, svgOrigin: '0 0' }, { rotation: -72, duration: 1.2, ease: 'power2.inOut' }, K('gauge') - 0.6);
      tl.to($('#gg-needle'), { rotation: -66, svgOrigin: '0 0', duration: 0.12, yoyo: true, repeat: 5, ease: 'sine.inOut' }, K('gauge') + 0.6);
      tl.set($('#file'), { opacity: 0 }, s.t0); tl.fromTo($('#file'), { opacity: 0, y: 120 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', immediateRender: false }, K('file'));
      vsTalk(tl, $, 'tc', s, 'tico');
    },
  },
  armo: {
    html: () => vsSky(`${asTable('tb', 1300, 300, 980)}<g id="boardG">${asPlane3('pb', 640, 1250, 0.5, { tape: true })}</g>${asTico('tk', 200, 1590, 0.6, 'point')}`, true),
    anim(tl, s, K, $) {
      vsBase(tl, s, $); asSkyRun(tl, $, s, 0.3);
      tl.fromTo($('#boardG'), { y: -1200 }, { y: 0, duration: 0.45, ease: 'bounce.out' }, K('board') - 0.4);
      asZoom(tl, $, 640, 1250, 1.6, K('board') + 0.15, 1.2);
      vsTalk(tl, $, 'tk', s, 'tico');
    },
  },

  crash: {
    html: () => vsSky(`<g id="fly"><g id="flyIn">${asPlane3('pb', 0, 0, 0.5, { tape: true })}</g></g>${asSmoke('dust', 820, 1500, 1.1, '#c8b48a')}${asBoom('bm', 820, 1480, 0.7)}<g id="dg">${asDota('d', 230, 1580, 0.85, 'up')}</g>`, true),
    anim(tl, s, K, $) {
      vsBase(tl, s, $); asSkyRun(tl, $, s, 0.3);
      const dt = K('crash') - K('throw');
      vsMove(tl, $, '#fly', [300, 1230, 0], [300, 1230, 0], s.t0, 0.05);
      vsMove(tl, $, '#fly', [300, 1230, 0], [540, 1000, -10], K('throw'), dt * 0.45, 'power1.out');
      vsMove(tl, $, '#fly', [540, 1000, -10], [820, 1460, 70], K('throw') + dt * 0.45, dt * 0.55, 'power2.in');
      asDotaPose(tl, $, 'd', 'reach', K('throw'));
      asFlash(tl, $('#bm'), K('crash'), 0.4); asPuff(tl, $('#dust'), K('crash') + 0.05, -110);
      tl.fromTo($('#flyIn'), { rotation: 0, svgOrigin: '0 0' }, { rotation: 12, duration: 0.1, yoyo: true, repeat: 3 }, K('crash'));
      vsTalk(tl, $, 'd', s, 'dota');
    },
  },

  wing: {
    html: () => vsGrid(`${asAirfoil('af', 540, 1120, 1)}${vsTicoC('point')}`),
    anim(tl, s, K, $) {
      vsBase(tl, s, $);
      tl.set($('#af-flow'), { opacity: 1 }, s.t0); asFlow(tl, $, 'af', s.t0, s.t1 - s.t0);
      asPop(tl, $('#af-tilt'), s.t0 + 0.1, 0.5);
      tl.fromTo($('#af-tilt'), { rotation: 0, svgOrigin: '0 0' }, { rotation: 8, duration: 0.5, ease: 'back.out(2)', immediateRender: false }, K('tilt') - 0.2);
      tl.set($('#af-down'), { opacity: 1 }, K('down') - 0.1); asPopIn(tl, $('#af-down'), K('down') - 0.1);
      vsTalk(tl, $, 'tc', s, 'tico');
    },
  },
  lift: {
    html: () => vsGrid(`${asAirfoil('af', 540, 1150, 1)}${vsTicoC('point')}`),
    anim(tl, s, K, $) {
      vsBase(tl, s, $);
      tl.set($('#af-flow'), { opacity: 1 }, s.t0).set($('#af-down'), { opacity: 1 }, s.t0).set($('#af-tilt'), { rotation: 8, svgOrigin: '0 0' }, s.t0); asFlow(tl, $, 'af', s.t0, s.t1 - s.t0);
      tl.set($('#af-lift'), { opacity: 1 }, K('up') - 0.2); tl.fromTo($('#af-lift'), { scaleY: 0, svgOrigin: '0 -110' }, { scaleY: 1, duration: 0.5, ease: 'back.out(1.8)', immediateRender: false }, K('up') - 0.2);
      tl.to($('#af-tilt'), { y: -30, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: 3 }, K('up'));
      vsTalk(tl, $, 'tc', s, 'tico');
    },
  },
  vuela: {
    html: () => vsGrid(`${asAirfoil('af', 560, 1000, 0.75)}${asDota('d', 230, 1580, 0.75, 'up')}${asTico('tk', 860, 1590, 0.55)}`),
    anim(tl, s, K, $) {
      vsBase(tl, s, $);
      tl.set($('#af-flow'), { opacity: 1 }, s.t0).set($('#af-lift'), { opacity: 1 }, s.t0).set($('#af-tilt'), { rotation: 8, svgOrigin: '0 0' }, s.t0);
      asFlow(tl, $, 'af', s.t0, K('fast') - s.t0); asFlow(tl, $, 'af', K('fast'), K('still') - K('fast'), 2.4);
      asHop(tl, $('#d'), K('dota'), 3, 40);
      tl.to($('#af-flow'), { opacity: 0.15, duration: 0.3 }, K('still')); tl.to($('#af-lift'), { scaleY: 0, svgOrigin: '0 -110', duration: 0.4, ease: 'power2.in' }, K('still'));
      vsTalk(tl, $, 'd', s, 'dota'); vsTalk(tl, $, 'tk', s, 'tico');
    },
  },
  turb: {
    html: () => vsSky(`${asTrail('tr', 140, 1010)}<g id="pl">${asCessna('p', 530, 1000, 0.95, {}, 0)}</g>${vsTicoC('point')}`, true),
    anim(tl, s, K, $) {
      vsBase(tl, s, $); asSkyRun(tl, $, s); vsBob(tl, $, 'pl', s, 8);
      asPaint(tl, $, 'p', 'eng', K('turb') - 0.1); asMorphTo(tl, $, 'p', 1, K('turb') + 0.3);
      tl.fromTo($('#p-fan, #p-fan2'), { rotation: 0, svgOrigin: '0 0' }, { rotation: 3600, duration: s.t1 - K('turb'), ease: 'none' }, K('turb'));
      vsTalk(tl, $, 'tc', s, 'tico');
    },
  },

  motor: {
    html: () => vsSky(`${asTrail('tr', 140, 1010)}<g id="air">${[0, 1, 2, 3].map((i) => asArrow(`ai${i}`, 430 - i * 20, 1040 + i * 18, 220 - i * 30, 1040 + i * 18, '#ffffff', 10)).join('')}</g><g id="pl">${asCessna('p', 530, 1000, 0.95, { eng: true }, 1)}</g>
      ${asArrow('fwd', 700, 820, 940, 820, '#e6ff3a', 20)}<g id="dg">${asDota('d', 160, 1560, 0.6, 'down')}</g>${vsTicoC('point')}`, true),
    anim(tl, s, K, $) {
      vsBase(tl, s, $); asSkyRun(tl, $, s, 1.4); vsBob(tl, $, 'pl', s, 6);
      tl.fromTo($('#p-fan, #p-fan2'), { rotation: 0, svgOrigin: '0 0' }, { rotation: 7200, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
      tl.set($('#air'), { opacity: 0 }, s.t0).set($('#air'), { opacity: 1 }, K('blow'));
      tl.fromTo($('#air g'), { x: 40, opacity: 0 }, { x: -80, opacity: 1, duration: 0.5, ease: 'none', repeat: Math.ceil((s.t1 - K('blow')) / 0.5), stagger: 0.12 }, K('blow'));
      tl.to($('#dg'), { x: -400, y: -700, rotation: -540, svgOrigin: '160 1400', duration: 0.7, ease: 'power2.in' }, K('dota') + 0.1);
      asPopIn(tl, $('#fwd'), K('dota') + 0.6);
      vsTalk(tl, $, 'tc', s, 'tico');
    },
  },

  pitch: {
    html: () => vsSky(`<path id="wave" d="M-40 1010 C 120 920, 240 1100, 380 1010" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="4 16" stroke-linecap="round"/><g id="pl">${asCessna('p', 530, 1000, 0.95, { eng: true }, 1)}</g>${vsTicoC()}`),
    anim(tl, s, K, $) {
      vsBase(tl, s, $); asSkyRun(tl, $, s); tl.fromTo($('#p-fan, #p-fan2'), { rotation: 0, svgOrigin: '0 0' }, { rotation: 7200, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
      tl.fromTo($('#p-body'), { rotation: -14, svgOrigin: '0 0' }, { rotation: 14, duration: 0.55, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((s.t1 - s.t0) / 0.55) }, s.t0);
      tl.fromTo($('#pl'), { y: -40 }, { y: 40, duration: 0.55, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((s.t1 - s.t0) / 0.55) }, s.t0 + 0.27);
      tl.fromTo($('#wave'), { strokeDashoffset: 0 }, { strokeDashoffset: -300, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
      vsTalk(tl, $, 'tc', s, 'tico');
    },
  },

  stab: {
    html: () => vsSky(`${asTrail('tr', 140, 1010)}<g id="pl">${asCessna('p', 530, 1000, 0.95, { eng: true }, 1)}</g>${vsTicoC('point')}`),
    anim(tl, s, K, $) {
      vsBase(tl, s, $); asSkyRun(tl, $, s); tl.fromTo($('#p-fan, #p-fan2'), { rotation: 0, svgOrigin: '0 0' }, { rotation: 7200, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
      tl.fromTo($('#p-body'), { rotation: -12, svgOrigin: '0 0' }, { rotation: 12, duration: 0.55, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((K('stab') - s.t0) / 0.55) }, s.t0);
      asPaint(tl, $, 'p', 'stab', K('stab') - 0.1, ['stabF']); asMorphTo(tl, $, 'p', 2, K('stab') + 0.4);
      tl.to($('#p-body'), { rotation: 0, svgOrigin: '0 0', duration: 0.9, ease: 'elastic.out(1, 0.5)' }, K('stab') + 0.3);
      vsTalk(tl, $, 'tc', s, 'tico');
    },
  },

  elev: {
    html: () => vsSky(`${asTrail('tr', 140, 1010)}<g id="pl">${asCessna('p', 530, 1000, 0.95, { eng: true, stab: true }, 2)}</g>${vsTicoC('point')}`),
    anim(tl, s, K, $) {
      vsBase(tl, s, $); asSkyRun(tl, $, s); tl.fromTo($('#p-fan, #p-fan2'), { rotation: 0, svgOrigin: '0 0' }, { rotation: 7200, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
      asPaint(tl, $, 'p', 'elev', s.t0 + 0.2); asMorphTo(tl, $, 'p', 3, s.t0 + 0.6);
      tl.to($('#p-elevM'), { y: -22, duration: 0.3, ease: 'power2.out' }, K('up') - 0.1); tl.to($('#p-body'), { rotation: -12, svgOrigin: '0 0', duration: 0.5, ease: 'power2.inOut' }, K('up') + 0.1);
      tl.to($('#p-elevM'), { y: 22, duration: 0.3, ease: 'power2.out' }, K('down') - 0.1); tl.to($('#p-body'), { rotation: 10, svgOrigin: '0 0', duration: 0.5, ease: 'power2.inOut' }, K('down') + 0.1);
      tl.to($('#p-elevM'), { y: 0, duration: 0.3 }, K('down') + 0.9); tl.to($('#p-body'), { rotation: 0, svgOrigin: '0 0', duration: 0.5 }, K('down') + 0.9);
      vsTalk(tl, $, 'tc', s, 'tico');
    },
  },

  yaw: {
    html: () => vsSky(`<path id="tw" d="M540 1700 C 440 1600, 640 1500, 540 1400" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="4 16" stroke-linecap="round"/>${asCessnaTop('pt', 540, 1000, 0.8)}${vsTicoC()}`),
    anim(tl, s, K, $) {
      vsBase(tl, s, $); asSkyRun(tl, $, s, 0.6);
      tl.fromTo($('#pt-body'), { rotation: -14, svgOrigin: '0 0' }, { rotation: 14, duration: 0.42, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((s.t1 - s.t0) / 0.42) }, s.t0);
      tl.fromTo($('#pt-body'), { x: -30 }, { x: 30, duration: 0.42, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((s.t1 - s.t0) / 0.42) }, s.t0 + 0.21);
      tl.fromTo($('#tw'), { strokeDashoffset: 0 }, { strokeDashoffset: -300, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
      vsTalk(tl, $, 'tc', s, 'tico');
    },
  },

  fin: {
    html: () => vsSky(`${asTrail('tr', 140, 1010)}<g id="pl">${asCessna('p', 530, 1000, 0.95, { eng: true, stab: true, elev: true }, 3)}</g>
      <g id="shark" opacity="0"><path d="M770 1480 L860 1340 L880 1480Z" fill="#5b6a80" stroke="${AS.o}" stroke-width="6" stroke-linejoin="round"/><path d="M740 1490 q 30 -12 60 0 q 30 12 60 0 q 30 -12 60 0" fill="none" stroke="#fff" stroke-width="6"/></g>${vsTicoC('point')}`),
    anim(tl, s, K, $) {
      vsBase(tl, s, $); asSkyRun(tl, $, s); tl.fromTo($('#p-fan, #p-fan2'), { rotation: 0, svgOrigin: '0 0' }, { rotation: 7200, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
      asPaint(tl, $, 'p', 'fin', K('fin') - 0.1); asMorphTo(tl, $, 'p', 4, K('fin') + 0.4);
      tl.set($('#shark'), { opacity: 1 }, K('fin') + 0.6); tl.fromTo($('#shark'), { x: 200 }, { x: -60, duration: 1.2, ease: 'power1.inOut', immediateRender: false }, K('fin') + 0.6); tl.to($('#shark'), { opacity: 0, duration: 0.3 }, K('fin') + 1.6);
      asPaint(tl, $, 'p', 'rud', K('rud') - 0.2); asMorphTo(tl, $, 'p', 5, K('rud') + 0.6);
      tl.fromTo($('#p-rudM'), { scaleX: 1, svgOrigin: '-338 -110' }, { scaleX: 0.3, duration: 0.25, yoyo: true, repeat: 3, ease: 'sine.inOut' }, K('rud') + 0.3);
      vsTalk(tl, $, 'tc', s, 'tico');
    },
  },

  roll: {
    html: () => vsSky(`<g id="pl">${asCessnaFront('pf', 540, 1000, 1, {})}</g>${vsTicoC()}`),
    anim(tl, s, K, $) {
      vsBase(tl, s, $); asSkyRun(tl, $, s); vsBob(tl, $, 'pl', s, 8);
      vsFan(tl, $, '#pf-fan0', s.t0, s.t1 - s.t0, 10); vsFan(tl, $, '#pf-fan1', s.t0, s.t1 - s.t0, 10);
      tl.set($('#pf-ails'), { opacity: 1 }, K('tips') - 0.1); asPaintFront(tl, $, K('tips') - 0.1);
      vsTalk(tl, $, 'tc', s, 'tico');
    },
  },
  ail: {
    html: () => vsSky(`<g id="pl">${asCessnaFront('pf', 540, 1000, 1, { ail: true })}</g>${asArrow('upA', 930, 930, 930, 850, '#e6ff3a', 14)}${asArrow('dnA', 150, 1030, 150, 1110, ASP.orange, 14)}${vsTicoC('point')}`),
    anim(tl, s, K, $) {
      vsBase(tl, s, $); asSkyRun(tl, $, s);
      vsFan(tl, $, '#pf-fan0', s.t0, s.t1 - s.t0, 12); vsFan(tl, $, '#pf-fan1', s.t0, s.t1 - s.t0, 12);
      tl.to($('#pf-ailR'), { rotation: -24, svgOrigin: '360 -93', duration: 0.3, ease: 'power2.out' }, K('up') - 0.1);
      tl.to($('#pf-ailL'), { rotation: -24, svgOrigin: '-360 -93', duration: 0.3, ease: 'power2.out' }, K('up') + 0.6);
      asPopIn(tl, $('#upA'), K('up') + 0.1); asPopIn(tl, $('#dnA'), K('up') + 0.8);
      tl.to($('#pf-body'), { rotation: -22, svgOrigin: '0 0', duration: 0.9, ease: 'power2.inOut' }, K('bank') - 0.2);
      vsTalk(tl, $, 'tc', s, 'tico');
    },
  },
  slow: {
    html: () => vsSky(`<rect x="0" y="1380" width="1080" height="60" fill="#2a2c35"/>${[...Array(7)].map((_, i) => `<rect x="${60 + i * 160}" y="1404" width="80" height="12" fill="#e8e6dc" opacity="0.7"/>`).join('')}
      <g id="pl">${asCessna('p', 520, 1000, 0.75, AS_LINER_ALL)}</g>${asBar('bv', 730, 820, 'VELOCIDAD', ASP.lime, 260)}${asBar('bl', 910, 820, 'EMPUJE', ASP.air, 260)}${vsTicoC()}`, true),
    anim(tl, s, K, $) {
      vsBase(tl, s, $);
      tl.fromTo($('#p-fan, #p-fan2'), { rotation: 0, svgOrigin: '0 0' }, { rotation: 1800, duration: s.t1 - s.t0, ease: 'none' }, s.t0); asSkyRun(tl, $, s, 0.5);
      tl.fromTo($('#pl'), { x: -120, y: -40 }, { x: 60, y: 120, duration: s.t1 - s.t0, ease: 'sine.inOut' }, s.t0);
      asBarTo(tl, $, 'bv', 0.35, K('lento') - 0.1, 0.8, 812); asBarTo(tl, $, 'bl', 0.25, K('weak') - 0.1, 0.6, 812);
      tl.to($('#p-body'), { rotation: 8, svgOrigin: '0 0', duration: 0.5, yoyo: true, repeat: 1 }, K('weak'));
      vsTalk(tl, $, 'tc', s, 'tico');
    },
  },
  flaps: {
    html: () => vsGrid(`${asAirfoil('af', 540, 1100, 1)}${vsTicoC('point')}`),
    anim(tl, s, K, $) {
      vsBase(tl, s, $);
      tl.set($('#af-flow'), { opacity: 1 }, s.t0).set($('#af-tilt'), { rotation: 6, svgOrigin: '0 0' }, s.t0).set($('#af-lift'), { opacity: 1 }, s.t0); asFlow(tl, $, 'af', s.t0, s.t1 - s.t0, 0.6);
      tl.set($('#af-lift'), { scaleY: 0.45, svgOrigin: '0 -110' }, s.t0);
      tl.set($('#af-flap'), { opacity: 1 }, K('flap') - 0.1); tl.fromTo($('#af-flapM'), { x: -130, y: -40, rotation: -20, svgOrigin: '290 14' }, { x: 0, y: 0, rotation: 14, duration: 0.7, ease: 'power2.out', immediateRender: false }, K('flap') - 0.1);
      tl.to($('#af-lift'), { scaleY: 1, svgOrigin: '0 -110', duration: 0.6, ease: 'back.out(2)' }, K('flap') + 0.5);
      vsTalk(tl, $, 'tc', s, 'tico');
    },
  },
  bike: {
    html: () => vsSky(`<g id="rider">${asBike('bk', 600, 1460, 1)}${asDota('d', 600, 1330, 0.75, 'up')}</g>${asTico('tk', 200, 1590, 0.55)}`, true),
    anim(tl, s, K, $) {
      vsBase(tl, s, $); asSkyRun(tl, $, s, 1.2);
      tl.fromTo($('#bk-w1, #bk-w2'), { rotation: 0, transformOrigin: '50% 50%' }, { rotation: 1440, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
      tl.fromTo($('#rider'), { y: 0 }, { y: -8, duration: 0.12, yoyo: true, repeat: Math.ceil((s.t1 - s.t0) / 0.12), ease: 'none' }, s.t0);
      tl.fromTo($('#d-nod'), { rotation: -6, svgOrigin: '0 -215' }, { rotation: 6, duration: 0.4, yoyo: true, repeat: 6, ease: 'sine.inOut', immediateRender: false }, K('bike') + 0.3);
      tl.fromTo($('#tk-head'), { rotation: -5, svgOrigin: '0 -360' }, { rotation: 5, duration: 0.25, yoyo: true, repeat: 3, ease: 'sine.inOut' }, K('tico'));
      vsTalk(tl, $, 'd', s, 'dota'); vsTalk(tl, $, 'tk', s, 'tico');
    },
  },
  felicidades: {
    // the finished plane is presented like a prize: zoom in, golden rays, confetti and a giant bow; then back to Tico and Dota amazed
    html: () => vsSky(`<rect x="-40" y="1420" width="1160" height="80" fill="#4a4f5c"/>${[...Array(8)].map((_, i) => `<rect x="${i * 150}" y="1452" width="80" height="12" fill="#fff" opacity="0.8"/>`).join('')}
      <g id="rayG" opacity="0">${asRays('rays', 530, 1230)}</g><g id="pl">${asCessna('al', 530, 1260, 0.95, AS_LINER_ALL)}</g><g id="bowG" opacity="0">${asBow('bow', 520, 1150, 1.1)}</g>
      ${asConfetti()}<g id="pz">${asMark('prize', 530, 1230, 300, '', '#ffd84a')}</g>
      ${asTico('tk', 200, 1620, 0.55, 'point')}${asDota('d', 880, 1620, 0.62, 'up')}`, true),
    anim(tl, s, K, $) {
      vsBase(tl, s, $); asSkyRun(tl, $, s, 0.4);
      tl.fromTo($('#al-fan'), { rotation: 0, svgOrigin: '0 0' }, { rotation: 7200, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
      asZoom(tl, $, 530, 1230, 1.55, K('glow') - 0.3, K('wow') - K('glow') + 0.2);
      tl.set($('#rayG'), { opacity: 1 }, K('glow')); tl.fromTo($('#rays'), { rotation: 0, scale: 0.2, svgOrigin: '0 0' }, { rotation: 60, scale: 1, duration: s.t1 - K('glow'), ease: 'power1.out', immediateRender: false }, K('glow'));
      ['eng', 'stab', 'stabF', 'elev', 'fin', 'rud', 'ail', 'flap'].forEach((pp, i) => { tl.set($(`#al-${pp}Hi`), { opacity: 1 }, K('glow') - 0.4 + i * 0.06); tl.to($(`#al-${pp}Hi`), { opacity: 0, duration: 0.5 }, K('glow') + 0.6 + i * 0.05); });
      tl.set($('#bowG'), { opacity: 1 }, K('glow') + 0.25); tl.fromTo($('#bowG'), { y: -700, rotation: -20, svgOrigin: '520 1150' }, { y: 0, rotation: 0, duration: 0.5, ease: 'bounce.out', immediateRender: false }, K('glow') + 0.25);
      tl.fromTo($('#confetti .bit'), { y: -500, opacity: 0 }, { y: 520, opacity: 1, duration: 1.6, ease: 'power1.in', stagger: 0.02, immediateRender: false }, K('glow') + 0.1);
      tl.set($('#confetti .bit'), { opacity: 0 }, s.t0);
      asMarkIn(tl, $, 'prize', 530, 1230, K('glow') + 0.2, 1.4, false);
      tl.fromTo($('#al-body'), { y: 0 }, { y: -16, duration: 0.3, yoyo: true, repeat: 5, ease: 'sine.inOut' }, K('glow') + 0.4);
      asHop(tl, $('#d'), K('wow') - 0.1, 4, 34); asHop(tl, $('#tk'), K('wow'), 2, 18);
      vsTalk(tl, $, 'tk', s, 'tico'); vsTalk(tl, $, 'd', s, 'dota');
    },
  },


  rock: {
    html: () => vsBurst(`<g id="pl">${asCessna('p', 580, 880, 0.7, AS_LINER_ALL)}</g>${asRock('rk', 250, 700, 0.9)}<line id="rkLine" x1="250" y1="760" x2="250" y2="1500" stroke="#8d8f96" stroke-width="4" stroke-dasharray="12 12" opacity="0"/>${asSmoke('sm', 500, 940, 0.6, '#5b5e68')}${vsTicoC()}`),
    anim(tl, s, K, $) {
      vsBase(tl, s, $); vsBob(tl, $, 'pl', s, 8);
      vsFan(tl, $, '#p-fan, #p-fan2', s.t0, K('off') - s.t0, 6); tl.to($('#p-fan, #p-fan2'), { rotation: '+=160', duration: 1.4, ease: 'power3.out' }, K('off'));
      asPuff(tl, $('#sm'), K('off') + 0.1, -100);
      tl.set($('#rkLine'), { opacity: 0.6 }, K('rock')); tl.fromTo($('#rk'), { y: 0, rotation: 0 }, { y: 760, rotation: 120, svgOrigin: '250 700', duration: 0.6, ease: 'power2.in', immediateRender: false }, K('rock'));
      vsTalk(tl, $, 'tc', s, 'tico');
    },
  },
  glide: {
    html: () => vsBurst(`<path id="path" d="M140 700 Q 560 860 960 1380" fill="none" stroke="${ASP.lime}" stroke-width="6" stroke-dasharray="16 14" opacity="0.8"/><g id="pl">${asCessna('p', 0, 0, 0.5, AS_LINER_ALL)}</g>${vsTicoC('point')}`),
    anim(tl, s, K, $) {
      vsBase(tl, s, $);
      tl.fromTo($('#path'), { strokeDashoffset: 0 }, { strokeDashoffset: -200, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
      vsMove(tl, $, '#pl', [200, 730, 14], [860, 1250, 26], s.t0, s.t1 - s.t0);
      vsTalk(tl, $, 'tc', s, 'tico');
    },
  },
  trade: {
    html: () => vsBurst(`${asBar('ba', 300, 1300, 'ALTURA', ASP.air, 520)}${asBar('bs', 540, 1300, 'VELOCIDAD', ASP.lime, 520)}<g id="mini">${asCessna('pm', 830, 900, 0.28, AS_LINER_ALL)}${asArrow('liftM', 830, 860, 830, 680, ASP.lime, 16)}</g>${vsTicoC()}`),
    anim(tl, s, K, $) {
      vsBase(tl, s, $);
      tl.set($('#bs-fill'), { scaleY: 0.55, svgOrigin: '0 1292' }, s.t0);
      asBarTo(tl, $, 'ba', 0.35, K('alt') - 0.1, 1.6, 1292); asBarTo(tl, $, 'bs', 0.8, K('vel') - 0.1, 0.8, 1292);
      tl.fromTo($('#mini'), { y: -60 }, { y: 140, duration: s.t1 - s.t0, ease: 'sine.inOut' }, s.t0);
      tl.fromTo($('#liftM'), { scale: 1, transformOrigin: '50% 100%' }, { scale: 1.2, duration: 0.3, yoyo: true, repeat: 3, ease: 'sine.inOut' }, K('lift'));
      vsTalk(tl, $, 'tc', s, 'tico');
    },
  },
  canada: {
    html: () => vsBurst(`${asDossier('ds', 540, 880, 'ARCHIVO · CANADÁ', 'Air Canada', '1983', 'Sin combustible en pleno vuelo')}<path id="gpath" d="M180 1250 Q 560 1330 900 1500" fill="none" stroke="${ASP.lime}" stroke-width="5" stroke-dasharray="14 12" opacity="0.7"/><g id="gp">${asCessna('pg', 0, 0, 0.3, AS_LINER_ALL)}</g><rect x="760" y="1500" width="240" height="16" fill="#2a2c35"/>`),
    anim(tl, s, K, $) {
      vsBase(tl, s, $);
      tl.set($('#ds'), { opacity: 0 }, s.t0); tl.fromTo($('#ds'), { opacity: 0, y: 140, rotation: -3, transformOrigin: '50% 50%' }, { opacity: 1, y: 0, rotation: 0, duration: 0.5, ease: 'power3.out', immediateRender: false }, K('card') - 0.15);
      asPop(tl, $('#ds-year'), K('card') + 0.3, 0.4);
      vsMove(tl, $, '#gp', [180, 1250, 6], [900, 1490, 14], s.t0, K('stamp') - s.t0);
      tl.set($('#ds-stamp'), { opacity: 1 }, K('stamp')); tl.fromTo($('#ds-stamp'), { scale: 2.2, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: 0.25, ease: 'power3.in', immediateRender: false }, K('stamp'));
    },
  },
  turbu: {
    bg: '#d9d1c2', ink: '#10204a',
    // inside the plane: rows of seats, windows with sky; Tico buckled, Dota sitting without a belt bonks the bins
    html: () => svg(`<g id="cam"><g id="camP"><g id="camZ" filter="url(#asBoil)"><g id="cabin">${asCabin(4)}</g>
      ${asTico('tk', 400, 1420, 0.62, 'hold')}${asSeatFront(1, true, 'beltT')}
      <g id="dg"><g id="dgS">${asDota('d', 670, 1400, 0.68, 'down')}</g></g>${asSeatFront(2, false)}${asBoom('bm', 670, 700, 0.5)}</g></g></g>`, AS_SKY_DEFS),
    anim(tl, s, K, $) {
      vsBase(tl, s, $, false, false);
      tl.fromTo($('.winSky'), { x: 60 }, { x: -120, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
      tl.fromTo($('#cabin, #seatBacks'), { rotation: -1.5, svgOrigin: '540 1200' }, { rotation: 1.5, duration: 0.09, yoyo: true, repeat: 2 * Math.floor((s.t1 - K('shake') - 0.3) / 0.18) - 1, ease: 'none', immediateRender: false }, K('shake'));
      tl.to($('#cabin, #seatBacks'), { rotation: 0, svgOrigin: '540 1200', duration: 0.15 }, s.t1 - 0.2);
      tl.fromTo($('#tk, #dgS'), { y: 0 }, { y: -10, duration: 0.09, yoyo: true, repeat: 2 * Math.floor((K('bonk') - K('shake') - 0.5) / 0.18) - 1, ease: 'none', immediateRender: false }, K('shake'));
      tl.to($('#dg'), { y: -560, rotation: 180, svgOrigin: '670 1240', duration: 0.45, ease: 'power3.in' }, K('bonk') - 0.45);
      asFlash(tl, $('#bm'), K('bonk'), 0.35);
      tl.set($('#d-bump'), { opacity: 1 }, K('bonk')); asDizzy(tl, $, 'd', K('bonk'), s.t1);
      vsTalk(tl, $, 'tk', s, 'tico');
    },
  },

  belt: {
    bg: '#d9d1c2', ink: '#10204a',
    html: () => svg(`<g id="cam"><g id="camP"><g id="camZ" filter="url(#asBoil)">${asCabin(4)}
      ${asTico('tk', 400, 1420, 0.62, 'hold')}${asSeatFront(1, false)}<g id="beltL"><rect x="316" y="1296" width="96" height="26" rx="8" fill="#ff7a3d" stroke="${AS.o}" stroke-width="5"/></g><g id="beltR"><rect x="412" y="1296" width="90" height="26" rx="8" fill="#ff7a3d" stroke="${AS.o}" stroke-width="5"/><rect x="396" y="1292" width="34" height="34" rx="6" fill="#cfd4dd" stroke="${AS.o}" stroke-width="5"/></g>
      <g id="clic" opacity="0"><g transform="translate(470 1210) rotate(-8)"><rect x="-80" y="-34" width="160" height="68" rx="14" fill="#ffd23d" stroke="${AS.o}" stroke-width="6"/><text x="0" y="16" text-anchor="middle" font-size="44" font-weight="900" fill="${AS.o}" style="font-family: var(--font), system-ui, sans-serif">¡CLIC!</text></g></g>
      ${asSeatFront(2, false)}<g id="dg"><g transform="translate(0 -560) rotate(180 670 1240)">${asDota('d', 670, 1400, 0.68, 'down')}</g></g></g></g></g>`, AS_SKY_DEFS),
    anim(tl, s, K, $) {
      vsBase(tl, s, $, false, false);
      tl.fromTo($('.winSky'), { x: -120 }, { x: -260, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
      tl.set($('#d-bump'), { opacity: 1 }, s.t0); asDizzy(tl, $, 'd', s.t0, s.t1);
      tl.fromTo($('#dg'), { x: 0 }, { x: 8, duration: 0.4, yoyo: true, repeat: Math.ceil((s.t1 - s.t0) / 0.4), ease: 'sine.inOut' }, s.t0 + 0.2);
      // close-up on Tico: the two ends come in, CLICK, a tug to tighten it
      // the belt is already on (as in the turbulence): Tico pulls the strap and it tightens with a CLICK
      asZoom(tl, $, 370, 1300, 2.0, K('click') - 0.75, s.t1 - K('click') + 1);
      tl.to($('#dg'), { opacity: 0, duration: 0.3 }, K('click') - 0.75);
      tl.to($('#beltR'), { x: 26, duration: 0.18, ease: 'power2.in' }, K('click') - 0.2);
      tl.to($('#beltL, #beltR'), { scaleX: 0.86, svgOrigin: '410 1309', duration: 0.12, ease: 'power3.out' }, K('click'));
      tl.to($('#beltR'), { x: 0, duration: 0.15, ease: 'power2.out' }, K('click'));
      tl.fromTo($('#tk'), { y: 0 }, { y: 8, duration: 0.1, yoyo: true, repeat: 1 }, K('click'));
      tl.set($('#clic'), { opacity: 1 }, K('click')); asPopIn(tl, $('#clic'), K('click'));
      tl.to($('#clic'), { opacity: 0, duration: 0.3 }, K('click') + 1.1);
      tl.fromTo($('#tk-nod'), { rotation: 0, svgOrigin: '0 -360' }, { rotation: 6, duration: 0.2, yoyo: true, repeat: 1, immediateRender: false }, K('click') + 0.4);
      vsTalk(tl, $, 'tk', s, 'tico');
    },
  },


  sub: {
    bg: AS.bg1, ink: AS.navy,
    // the banner: stars around, "¡SUSCRÍBANSE!" over the Idio-two logo, Tico (idea bulb, arms crossed) and Dota (arms up, dizzy stars)
    html: () => svg(`${asBurst('bg', AS.bg1, AS.bg2, 540, 1000, false)}<g id="cam"><g id="camP"><g id="camZ" filter="url(#asBoil)">
      <g id="stars">${[[150, 560, 34], [930, 520, 30], [250, 760, 20], [860, 780, 22], [130, 1380, 26], [960, 1330, 34], [300, 1560, 22], [820, 1580, 20]].map(([x, y, r], i) => `<g id="st${i}">${asStar(x, y, r)}</g>`).join('')}</g>
      ${asCallout('sub', 540, 600, '¡SUSCRÍBANSE!')}${asLogo('logo', 540, 870, 178)}
      ${asTico('tk', 420, 1560, 0.8, 'cross')}${asDota('d', 680, 1560, 0.95, 'up')}
    </g></g></g>`, AS_DEFS),
    anim(tl, s, K, $) {
      vsBase(tl, s, $);
      tl.set($('#tk-bulb'), { opacity: 1 }, s.t0); asPop(tl, $('#tk-bulb'), s.t0 + 0.15, 0.4);
      asDizzy(tl, $, 'd', s.t0 + 0.1, s.t1);
      asPop(tl, $('#logo'), s.t0 + 0.05, 0.5);
      asPopIn(tl, $('#sub'), s.t0 + 0.3);
      tl.to($('#sub'), { scale: 1.08, transformOrigin: '50% 50%', duration: 0.25, yoyo: true, repeat: 7, ease: 'sine.inOut' }, s.t0 + 1.0);
      for (let i = 0; i < 8; i++) { asPop(tl, $(`#st${i}`), s.t0 + 0.1 + i * 0.07, 0.35); tl.to($(`#st${i}`), { rotation: i % 2 ? 20 : -20, scale: 1.15, transformOrigin: '50% 50%', duration: 0.5, yoyo: true, repeat: Math.floor((s.t1 - s.t0) / 0.5) - 1, ease: 'sine.inOut' }, s.t0 + 0.6 + i * 0.05); }
      asHop(tl, $('#d'), s.t0 + 0.2, 2, 30);
      tl.fromTo($('#tk-head'), { rotation: -6, svgOrigin: '0 -360' }, { rotation: 6, duration: 0.14, yoyo: true, repeat: 3, ease: 'sine.inOut' }, K('tabla'));
      tl.to($('#tk-brows'), { y: -12, duration: 0.15, yoyo: true, repeat: 1 }, K('tabla') + 0.6);
      vsTalk(tl, $, 'd', s, 'dota');
    },
  },  outro: {
    html: () => vsBurst(`${vsStreaks(12)}${[...Array(18)].map((_, i) => vsStarDot(i)).join('')}<g id="surf">${asPlaneSide('ps', 0, 0, 0.7, { tape: true })}${asDota('d', 0, -20, 0.6, 'up')}</g><g id="run">${asTico('tk', 260, 1590, 0.55, 'point')}</g>`),
    anim(tl, s, K, $) {
      vsBase(tl, s, $); vsStreakRun(tl, $, s, 1.4);
      vsMove(tl, $, '#surf', [300, 1300, -8], [1300, 650, -16], s.t0, s.t1 - s.t0, 'power1.in');
      tl.fromTo($('#run'), { x: -260 }, { x: 640, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
      asHop(tl, $('#run'), s.t0, Math.ceil((s.t1 - s.t0) / 0.3), 24);
      vsTalk(tl, $, 'tk', s, 'tico');
    },
  },
});
// a twinkly star dot for the night sky of the ending flight
function vsStarDot(i: number) { return `<circle cx="${(i * 197) % 1080}" cy="${500 + ((i * 263) % 700)}" r="${2 + (i % 3)}" fill="#e8e6dc" opacity="${0.3 + (i % 3) * 0.2}"/>`; }
