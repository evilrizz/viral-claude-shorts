// =====================================================================
//  "Cómo funcionan los motores" (Idio-two): each scene only assembles the world (world.ts).
//  K('key') = when that word is said; $('#x') = selector inside the scene. Absolute video times.
// =====================================================================
type MvTl = gsap.core.Timeline;
type Mv$ = (q: string) => string;
// when each character speaks (from words.json): mouths move only inside these ranges
const MV_TICO: [number, number][] = [[0.1, 7.27], [9.7, 13.0], [13.66, 17.21], [17.76, 29.0], [31.86, 34.56], [35.2, 61.0], [62.89, 69.47], [70.19, 100.65], [105.45, 118.27], [118.89, 135.25], [135.94, 140.78], [141.53, 144.94]];
const MV_DOTA: [number, number][] = [[7.95, 9.17], [29.59, 31.02], [61.59, 62.21], [101.21, 104.64], [145.66, 150.05]];
function mvTalk(tl: MvTl, $: Mv$, id: string, s: Scene, who: 'tico' | 'dota') {
  for (const [a, b] of who === 'tico' ? MV_TICO : MV_DOTA) {
    const t0 = Math.max(a, s.t0 + 0.05), t1 = Math.min(b, s.t1 - 0.05);
    if (t1 - t0 > 0.2) (who === 'tico' ? moTicoTalk : moDotaTalk)(tl, $, id, t0, t1);
  }
}
// small characters in the bottom corners (engine scenes)
const mvTicoC = (pose: MoTicoPose = 'cross') => moTico('tc', 190, 1590, 0.48, pose);
const mvDotaC = (pose: MoDotaPose = 'down') => moDota('dc', 900, 1590, 0.55, pose, true);
// background + camera wrapper
const mvBurst = (body: string, over = '') => svg(`${moPrint()}<g id="cam"><g id="camP"><g id="camZ">${body}</g>${over}</g></g>`);   // every scene uses the workshop backdrop (only the ending keeps the banner)
const mvPrint = (body: string, over = '') => svg(`${moPrint()}<g id="cam"><g id="camP"><g id="camZ">${body}</g>${over}</g></g>`);
// every scene: the set moves (sunburst turns / dust drifts), the camera snaps in and punches on the keys, and the characters are alive
interface MvMark { k: string; dt?: number; x: number; y: number; r: number; z?: number; hold?: number; label?: string }
function mvBase(tl: MvTl, s: Scene, $: Mv$, burst = true) {
  const marks = (s as unknown as { marks?: MvMark[] }).marks || [], camZ = document.querySelector($('#camZ'));
  marks.forEach((m, i) => {
    const key = (s.keys || []).find((k) => k.id === m.k), t = (key ? key.t : s.t0 + 0.5) + (m.dt || 0), d = m.hold || 1.4;
    camZ?.insertAdjacentHTML('beforeend', moMark(`mk${i}`, m.x, m.y, m.r, m.label || ''));
    if (m.z) moZoom(tl, $, m.x, m.y, m.z, t - 0.05, d);
    moMarkIn(tl, $, `mk${i}`, m.x, m.y, t, d, !!m.label);
  });
  if (burst && document.querySelector($('#bg'))) tl.fromTo($('#bg'), { rotation: 0, svgOrigin: '0 0' }, { rotation: 24, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
  else moDust(tl, $, s);
  const i = SCENES.scenes.findIndex((x) => x.id === s.id);
  moCamera(tl, $, s, i % 2 ? 1 : -1);
  for (const [id, kind] of [['tk', 'tico'], ['tc', 'tico'], ['d', 'dota'], ['dc', 'dota']] as const) if (document.querySelector($(`#${id}-rig`))) moAlive(tl, $, id, s, kind);
}
// the engine set to angle a at the start of the scene
const mvHold = (tl: MvTl, $: Mv$, a: number, s: Scene, o: { valves?: boolean; mix?: boolean; stuckEx?: number } = {}) => moTurn(tl, $, 'e', a, a, s.t0, 0.04, 'none', o);
// a piston lid for the tube scenes (x centred at 540)
const mvLid = (id: string, y: number) => `<g id="${id}"><g transform="translate(0 ${y})"><rect x="434" y="-50" width="212" height="100" rx="10" fill="${MO.steel}" stroke="${MO.o}" stroke-width="${MO_SW}"/><line x1="434" y1="-26" x2="646" y2="-26" stroke="${MO.o}" stroke-width="5"/><line x1="434" y1="-10" x2="646" y2="-10" stroke="${MO.o}" stroke-width="5"/></g></g>`;
// the front view scaled into the hook composition
const mvFront = (hidden: boolean, sc = 0.8, cx = 540, cy = 1000) => `<g transform="translate(${cx - 540 * sc} ${cy - 1030 * sc}) scale(${sc})">${moTiming('t', hidden)}</g>`;

defineVisuals({
  hook: {
    bg: '#0f4a5c',
    html: () => mvBurst(`${mvFront(true, 0.8, 620, 1000)}${moTico('tk', 220, 1590, 0.55)}`, moSpot(620, 1170, 520)),
    anim(tl, s, K, $) {
      mvBase(tl, s, $);
      moPop(tl, $('#t'), s.t0 + 0.1, 0.5);
      moFocus(tl, $, 620, 600, 1.4, s.t0 + 0.7, s.t1 - s.t0 - 0.75, 'power2.inOut');
      tl.fromTo($('#t-q'), { scale: 1, rotation: 0, transformOrigin: '50% 50%' }, { keyframes: [{ scale: 1.3, rotation: -8, duration: 0.18, ease: 'power2.out' }, { scale: 0.95, rotation: 6, duration: 0.16 }, { scale: 1.1, rotation: -3, duration: 0.14 }, { scale: 1, rotation: 0, duration: 0.14 }] }, K('q'));
      tl.to($('#t-q'), { rotation: 4, duration: 0.35, yoyo: true, repeat: Math.ceil((s.t1 - K('q') - 0.7) / 0.35), ease: 'sine.inOut' }, K('q') + 0.62);
      mvTalk(tl, $, 'tk', s, 'tico');
    },
  },
  ruin: {
    bg: '#0f4a5c',
    html: () => mvBurst(`${mvFront(true, 0.8, 620, 1000)}${moSmoke('sm1', 520, 640, 1)}${moSmoke('sm2', 700, 620, 0.8)}${moSmoke('sm3', 610, 600, 1.1, '#6f7685')}${moTico('tk', 220, 1590, 0.55, 'point')}`, moSpot(620, 1170, 520)),
    anim(tl, s, K, $) {
      mvBase(tl, s, $);
      tl.set($('#camZ'), { scale: 1.4, svgOrigin: '620 600' }, s.t0).set($('#spot'), { opacity: 0.5 }, s.t0);
      tl.to($('#camZ'), { scale: 1, duration: 0.7, ease: 'power3.inOut' }, K('entero') - 0.2);
      tl.to($('#spot'), { opacity: 0, duration: 0.7, ease: 'sine.inOut' }, K('entero') - 0.2);
      tl.fromTo($('#t'), { x: -10 }, { x: 10, duration: 0.06, yoyo: true, repeat: 9, ease: 'none' }, K('rompe'));
      moPuff(tl, $('#sm1'), K('rompe') + 0.1); moPuff(tl, $('#sm2'), K('rompe') + 0.4); moPuff(tl, $('#sm3'), K('entero'));
      tl.fromTo($('#t-qm > rect'), { fill: MO.navy }, { fill: '#7a2a2a', duration: 0.4 }, K('entero'));
      mvTalk(tl, $, 'tk', s, 'tico');
    },
  },
  ask: {
    bg: '#0f4a5c',
    html: () => mvBurst(`${mvFront(true, 0.42, 540, 880)}${moTico('tk', 270, 1590, 0.62)}<g id="dg">${moDota('d', 760, 1580, 0.85, 'hug')}${moWheel('wh', 760, 1460, 0.55)}</g>`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $);
      moPop(tl, $('#dg'), K('dota') - 0.25, 0.4);
      tl.fromTo($('#wh'), { rotation: -8, transformOrigin: '50% 50%' }, { rotation: 8, duration: 0.3, yoyo: true, repeat: 3, ease: 'sine.inOut' }, K('dota'));
      mvTalk(tl, $, 'tk', s, 'tico'); mvTalk(tl, $, 'd', s, 'dota');
    },
  },
  idiot: {
    bg: '#0f4a5c',
    html: () => mvBurst(`${mvFront(true, 0.42, 540, 880)}${moTico('tk', 270, 1590, 0.62)}${moDota('d', 760, 1580, 0.85, 'hug')}${moWheel('wh', 760, 1460, 0.55)}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $);
      moTicoPose(tl, $, 'tk', 'palm', K('palm') + 0.1);
      tl.fromTo($('#d-pupils'), { x: -6 }, { x: 6, duration: 0.25, yoyo: true, repeat: 7, ease: 'sine.inOut' }, K('idiota'));
      moHop(tl, $('#d'), K('idiota') + 0.1, 1, 25);
      mvTalk(tl, $, 'tk', s, 'tico');
    },
  },
  armo: {
    bg: '#0f4a5c',
    html: () => mvBurst(`${moTable('tb', 1300, 380, 960)}<g id="tubeG">${moTube('tu', 680, 1300, 300, 180)}</g>${moTag('tg', 680, 880, 'UN TUBO')}${moTico('tk', 230, 1590, 0.62, 'hold')}`, moSpot(680, 1120, 450)),
    anim(tl, s, K, $) {
      mvBase(tl, s, $);
      tl.fromTo($('#tubeG'), { y: -1400 }, { y: 0, duration: 0.45, ease: 'bounce.out' }, K('tube') - 0.2);
      moFocus(tl, $, 680, 1120, 1.6, K('tube') + 0.4, 1.1);
      moPopIn(tl, $('#tg'), K('tube') + 1.0);
      moTicoPose(tl, $, 'tk', 'point', K('tube') + 0.4);
      mvTalk(tl, $, 'tk', s, 'tico');
    },
  },
  tube: {
    bg: '#0f4a5c',
    html: () => mvBurst(`${moTable('tb', 1380, 160, 920)}<g id="tubeG">${moTube('tu', 540, 1380, 380, 240)}</g>${moDrop('drop', 540, 640, 0.9)}${moSpark('sp', 540, 1260, 1.1)}${moBoom('bm', 540, 1190, 1.15)}${moSmoke('sm', 540, 900, 1.2)}${moTico('tk', 170, 1590, 0.45)}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $);
      tl.set($('#drop'), { opacity: 0 }, s.t0).fromTo($('#drop'), { y: -500, opacity: 1 }, { y: 560, duration: 0.6, ease: 'power2.in', immediateRender: false }, K('gas') - 0.2).set($('#drop'), { opacity: 0 }, K('gas') + 0.42);
      moFlash(tl, $('#sp'), K('spark'), 0.3);
      moFlash(tl, $('#bm'), K('boom'), 0.45); moPuff(tl, $('#sm'), K('boom') + 0.15, -220);
      tl.fromTo($('#tubeG'), { x: -12 }, { x: 12, duration: 0.05, yoyo: true, repeat: 7, ease: 'none' }, K('boom'));
      mvTalk(tl, $, 'tk', s, 'tico');
    },
  },
  piston: {
    bg: '#0f4a5c',
    html: () => mvBurst(`${moTable('tb', 1380, 160, 920)}${moTube('tu', 540, 1380, 380, 240)}${mvLid('lid', 1060)}${moBoom('bm', 540, 1050, 0.9)}${moTag('tg', 540, 850, 'PISTÓN')}${moTico('tk', 170, 1590, 0.45, 'point')}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $);
      tl.fromTo($('#lid'), { y: -1500 }, { y: 0, duration: 0.45, ease: 'power2.in' }, K('lid') - 0.35);
      moFlash(tl, $('#bm'), K('push') - 0.05, 0.4);
      tl.to($('#lid'), { y: 270, duration: 0.18, ease: 'power3.in' }, K('push'));
      moPopIn(tl, $('#tg'), K('tag'));
      mvTalk(tl, $, 'tk', s, 'tico');
    },
  },
  stuck: {
    bg: '#0f4a5c',
    html: () => mvBurst(`${moTable('tb', 1380, 300, 780)}${moTube('tu', 540, 1380, 380, 240)}${mvLid('lid', 1060)}${moBoom('bm', 540, 1050, 0.9)}${moTico('tk', 170, 1590, 0.45)}${moDota('d', 900, 1590, 0.55, 'up', true)}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $);
      moHop(tl, $('#d'), K('cheer'), 3, 50);
      moFlash(tl, $('#bm'), K('down') - 0.05, 0.4);
      tl.to($('#lid'), { y: 270, duration: 0.18, ease: 'power3.in' }, K('down'));
      tl.fromTo($('#lid'), { x: -8 }, { x: 8, duration: 0.06, yoyo: true, repeat: 5, ease: 'none' }, K('stuck'));
      moDotaPose(tl, $, 'd', 'down', K('stuck'));
      mvTalk(tl, $, 'tk', s, 'tico'); mvTalk(tl, $, 'd', s, 'dota');
    },
  },
  rod: {
    bg: '#0f4a5c',
    html: () => mvPrint(`${moEngine('e', { head: false })}${mvTicoC('point')}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $, false); mvHold(tl, $, 180, s);
      tl.set($('#e-rodG'), { opacity: 0 }, s.t0).set($('#e-crank'), { opacity: 0 }, s.t0);
      tl.set($('#e-rodG'), { opacity: 1 }, K('rod')); moPop(tl, $('#e-rodG'), K('rod'), 0.35);
      tl.set($('#e-crank'), { opacity: 1 }, K('crank')); moPop(tl, $('#e-crank'), K('crank'), 0.4);
      moTurn(tl, $, 'e', 180, 540, K('crank') + 0.6, s.t1 - K('crank') - 0.8, 'sine.inOut');
      mvTalk(tl, $, 'tc', s, 'tico');
    },
  },
  cycle: {
    bg: '#0f4a5c',
    html: () => mvPrint(`${moEngine('e', { head: false })}${moSpinArrow('sa', 540, 1300, 150)}<g id="ud">${moArrow('ua', 780, 1060, 780, 900, MO.dShirt, 18)}${moArrow('da', 780, 1000, 780, 1160, MO.dShirt, 18)}</g>${mvTicoC('point')}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $, false);
      moTurn(tl, $, 'e', 0, 900, s.t0, s.t1 - s.t0, 'none');
      moPopIn(tl, $('#ud'), K('down') - 0.2); moPopIn(tl, $('#sa'), K('down') + 0.4);
      tl.fromTo($('#sa'), { rotation: 0, svgOrigin: '540 1300' }, { rotation: 40, duration: 0.5, yoyo: true, repeat: 1, ease: 'sine.inOut' }, K('up') - 0.6);
      mvTalk(tl, $, 'tc', s, 'tico');
    },
  },
  names: {
    bg: '#0f4a5c',
    html: () => mvPrint(`${moEngine('e', { head: false })}${moTag('tb', 820, 1150, 'BIELA')}${moTag('tcg', 540, 1500, 'CIGÜEÑAL')}${mvTicoC()}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $, false);
      moTurn(tl, $, 'e', 0, 360, s.t0, s.t1 - s.t0, 'none');
      moPopIn(tl, $('#tb'), K('biela')); moPopIn(tl, $('#tcg'), K('cig'));
      mvTalk(tl, $, 'tc', s, 'tico');
    },
  },
  closed: {
    bg: '#0f4a5c',
    html: () => mvPrint(`${moEngine('e', {})}<rect x="398" y="800" width="284" height="84" fill="#aab6c8" stroke="${MO.o}" stroke-width="${MO_SW}"/>${moSmoke('sm', 540, 950, 0.8)}
      <g id="x"><g transform="translate(540 760)"><rect x="-70" y="-14" width="140" height="28" rx="14" fill="${MO.red}" stroke="${MO.o}" stroke-width="6" transform="rotate(45)"/><rect x="-70" y="-14" width="140" height="28" rx="14" fill="${MO.red}" stroke="${MO.o}" stroke-width="6" transform="rotate(-45)"/></g></g>${mvTicoC('point')}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $, false); mvHold(tl, $, 560, s, { mix: true });
      tl.set($('#e-mix'), { opacity: 0.85 }, s.t0 + 0.05);
      tl.set($('#x'), { opacity: 0 }, s.t0);
      tl.fromTo($('#sm'), { opacity: 0.9, scale: 0.6, transformOrigin: '50% 50%' }, { scale: 0.9, duration: 0.3, yoyo: true, repeat: Math.ceil((s.t1 - s.t0) / 0.3), ease: 'sine.inOut' }, s.t0 + 0.2);
      tl.set($('#x'), { opacity: 1 }, K('smoke')); moPop(tl, $('#x'), K('smoke'), 0.35);
      mvTalk(tl, $, 'tc', s, 'tico');
    },
  },
  valves: {
    bg: '#0f4a5c',
    html: () => mvPrint(`${moEngine('e', { valves: true, pipes: true })}${moArrow('ain', 160, 834, 330, 834, MO.gas)}${moArrow('aout', 760, 834, 930, 834, '#9aa3b2')}${moSmoke('sm', 880, 760, 0.7)}${mvTicoC('point')}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $, false); mvHold(tl, $, 700, s, { mix: true });
      tl.set($('#e-valves'), { opacity: 0 }, s.t0).set($('#ain'), { opacity: 0 }, s.t0).set($('#aout'), { opacity: 0 }, s.t0);
      tl.set($('#e-valves'), { opacity: 1 }, K('holes')); moPop(tl, $('#e-valves'), K('holes'), 0.35);
      moTurn(tl, $, 'e', 720, 900, K('in') - 0.3, 1.6, 'sine.inOut', { mix: true });
      tl.set($('#ain'), { opacity: 1 }, K('in') - 0.3); tl.fromTo($('#ain'), { x: -60 }, { x: 0, duration: 0.4, ease: 'power2.out' }, K('in') - 0.3);
      moTurn(tl, $, 'e', 900, 1440, K('in') + 1.4, K('out') - K('in') - 0.6, 'sine.inOut', { mix: true });
      tl.set($('#aout'), { opacity: 1 }, K('out') - 0.3); tl.fromTo($('#aout'), { x: -60 }, { x: 0, duration: 0.4, ease: 'power2.out' }, K('out') - 0.3);
      moPuff(tl, $('#sm'), K('out'));
      mvTalk(tl, $, 'tc', s, 'tico');
    },
  },
  vname: {
    bg: '#0f4a5c',
    html: () => mvPrint(`${moEngine('e', { valves: true, pipes: true })}${moTag('tg', 540, 640, 'VÁLVULAS')}${mvTicoC()}${mvDotaC('up')}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $, false); mvHold(tl, $, 90, s);
      moPopIn(tl, $('#tg'), K('tag'));
      tl.fromTo($('#e-vInM, #e-vExM'), { opacity: 1 }, { opacity: 0.4, duration: 0.2, yoyo: true, repeat: 3 }, K('tag'));
      tl.set($('#dc'), { opacity: 0 }, s.t0).set($('#dc'), { opacity: 1 }, K('dota') - 0.15); moPop(tl, $('#dc'), K('dota') - 0.15, 0.3);
      tl.fromTo($('#tc-head'), { rotation: -8, svgOrigin: '0 -470' }, { rotation: 8, duration: 0.12, yoyo: true, repeat: 3, ease: 'sine.inOut' }, K('no'));
      mvTalk(tl, $, 'tc', s, 'tico'); mvTalk(tl, $, 'dc', s, 'dota');
    },
  },
  strokes: {
    bg: '#0f4a5c',
    html: () => mvPrint(`${moStroke('s1', 300, 780, 'ENTRA', MO.gas, false)}${moStroke('s2', 780, 780, 'APRIETA', MO.gas, true)}${moStroke('s3', 780, 1190, 'EXPLOTA', MO.fire, false)}${moStroke('s4', 300, 1190, 'SALE', '#9aa3b2', true)}
      ${moArrow('a1', 430, 780, 640, 780, MO.dShirt, 16)}${moArrow('a2', 780, 950, 780, 1030, MO.dShirt, 16)}${moArrow('a3', 640, 1190, 430, 1190, MO.dShirt, 16)}${moArrow('a4', 300, 1030, 300, 950, MO.dShirt, 16)}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $, false);
      moPopIn(tl, $('#s1'), K('s1') - 0.1); moPopIn(tl, $('#s2'), K('s2') - 0.1); moPopIn(tl, $('#s3'), K('s3') - 0.1); moPopIn(tl, $('#s4'), K('s4') - 0.1);
      moPopIn(tl, $('#a1'), K('s2') - 0.25); moPopIn(tl, $('#a2'), K('s3') - 0.25); moPopIn(tl, $('#a3'), K('s4') - 0.25); moPopIn(tl, $('#a4'), K('s4') + 0.35);
    },
  },
  timing: {
    bg: '#0f4a5c',
    html: () => mvPrint(`${moEngine('e', { valves: true, pipes: true })}${moQuestion('q', 540, 620, 0.55)}${mvTicoC()}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $, false); mvHold(tl, $, 0, s);
      tl.set($('#q'), { opacity: 0 }, s.t0).set($('#q'), { opacity: 1 }, K('q') - 0.1); moPop(tl, $('#q'), K('q') - 0.1, 0.35);
      tl.fromTo($('#e-vInM, #e-vExM'), { y: 0 }, { y: 18, duration: 0.25, yoyo: true, repeat: 5, ease: 'sine.inOut', stagger: 0.25 }, s.t0 + 0.4);
      mvTalk(tl, $, 'tc', s, 'tico');
    },
  },
  cams: {
    bg: '#0f4a5c',
    html: () => mvPrint(`${moEngine('e', { valves: true, pipes: true, cams: true })}${moTag('tg', 820, 600, 'ÁRBOL DE LEVAS', undefined, 38)}${mvTicoC('point')}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $, false); mvHold(tl, $, 0, s);
      tl.set($('#e-cams'), { opacity: 0 }, s.t0).set($('#e-cams'), { opacity: 1 }, K('cams')); moPop(tl, $('#e-cams'), K('cams'), 0.35);
      moTurn(tl, $, 'e', 0, 1080, K('cams') + 0.4, s.t1 - K('cams') - 0.4, 'none');
      moPopIn(tl, $('#tg'), K('tag'));
      mvTalk(tl, $, 'tc', s, 'tico');
    },
  },
  ratio: {
    bg: '#0f4a5c',
    html: () => mvPrint(`${moEngine('e', { valves: true, pipes: true, cams: true })}${moTag('t1', 820, 600, 'LEVAS ×1')}${moTag('t2', 540, 1500, 'CIGÜEÑAL ×2')}${moSpinArrow('sa', 540, 1300, 150)}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $, false);
      moTurn(tl, $, 'e', 0, 720, s.t0, s.t1 - s.t0 - 0.1, 'none');
      moPopIn(tl, $('#t1'), K('one')); moPopIn(tl, $('#t2'), K('two')); moPopIn(tl, $('#sa'), K('two') + 0.1);
    },
  },
  plug: {
    bg: '#0f4a5c',
    html: () => mvPrint(`${moEngine('e', { valves: true, pipes: true, cams: true, plug: true })}${mvTicoC()}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $, false); mvHold(tl, $, 180, s);
      tl.set($('#e-plug'), { opacity: 0 }, s.t0).fromTo($('#e-plug'), { y: -500, opacity: 1 }, { y: 0, duration: 0.45, ease: 'bounce.out', immediateRender: false }, K('plug') - 0.3);
      mvTalk(tl, $, 'tc', s, 'tico');
    },
  },
  bujia: {
    bg: '#0f4a5c',
    html: () => mvPrint(`${moEngine('e', { valves: true, pipes: true, cams: true, plug: true })}${moTag('tg', 820, 600, 'BUJÍA')}${mvTicoC('point')}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $, false); mvHold(tl, $, 180, s, { mix: true });
      tl.set($('#e-mix'), { opacity: 1 }, s.t0);
      moTurn(tl, $, 'e', 180, 540, K('squeeze') - 0.8, 1.6, 'none', { mix: true });
      moSparks(tl, $, 'e', 180, 540, K('squeeze') - 0.8, 1.6);
      moPopIn(tl, $('#tg'), K('tag'));
      mvTalk(tl, $, 'tc', s, 'tico');
    },
  },
  onlyone: {
    bg: '#0f4a5c',
    html: () => mvPrint(`<g id="g1">${moStroke('s1', 300, 780, 'ENTRA', MO.gas, false)}</g><g id="g2">${moStroke('s2', 780, 780, 'APRIETA', MO.gas, true)}</g>${moStroke('s3', 780, 1190, 'EXPLOTA', MO.fire, false)}<g id="g4">${moStroke('s4', 300, 1190, 'SALE', '#9aa3b2', true)}</g>
      ${moTag('t3', 780, 1410, 'EMPUJA', MO.red)}${moTag('tg', 300, 1410, 'DE GORRA', '#6f7685')}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $, false);
      tl.fromTo($('#s3'), { scale: 1, transformOrigin: '50% 50%' }, { scale: 1.15, duration: 0.3, ease: 'back.out(2)' }, K('one') - 0.1);
      moPopIn(tl, $('#t3'), K('one'));
      tl.to($('#g1, #g2, #g4'), { opacity: 0.35, duration: 0.3 }, K('gorra')); moPopIn(tl, $('#tg'), K('gorra'));
    },
  },
  disc: {
    bg: '#0f4a5c',
    html: () => mvPrint(`${moEngine('e', { valves: true, pipes: true, cams: true, plug: true, fly: true })}${mvTicoC('point')}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $, false);
      moTurn(tl, $, 'e', 0, 1440, s.t0, s.t1 - s.t0, 'none');
      tl.set($('#e-fly'), { opacity: 0 }, s.t0).set($('#e-fly'), { opacity: 1 }, K('fly') - 0.1);
      tl.fromTo($('#e-fly'), { scale: 0, svgOrigin: '540 1300' }, { scale: 1, duration: 0.45, ease: 'back.out(1.8)' }, K('fly') - 0.1);
      mvTalk(tl, $, 'tc', s, 'tico');
    },
  },
  inercia: {
    bg: '#0f4a5c',
    html: () => mvPrint(`${moEngine('e', { valves: true, pipes: true, cams: true, plug: true, fly: true })}${moTag('tg', 540, 600, 'VOLANTE DE INERCIA')}${mvTicoC()}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $, false);
      moTurn(tl, $, 'e', 0, 900, s.t0, s.t1 - s.t0, 'none');
      moPopIn(tl, $('#tg'), K('tag'));
      mvTalk(tl, $, 'tc', s, 'tico');
    },
  },
  touch: {
    bg: '#0f4a5c',
    html: () => mvBurst(`<g transform="translate(-60 230) scale(0.82)">${moEngine('e', { valves: true, pipes: true, cams: true, plug: true, fly: true })}</g><g id="dg">${moDota('d', 820, 1580, 0.8, 'up', true)}</g>`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $);
      moTurn(tl, $, 'e', 0, 1800, s.t0, s.t1 - s.t0, 'none');
      moHop(tl, $('#d'), s.t0 + 0.2, 2, 40);
      moDotaPose(tl, $, 'd', 'reach', K('reach'));
      tl.to($('#dg'), { x: 500, y: -1200, rotation: 540, svgOrigin: '820 1400', duration: 0.6, ease: 'power2.in' }, K('fly') + 0.2);
      mvTalk(tl, $, 'd', s, 'dota');
    },
  },
  heat: {
    bg: '#0f4a5c',
    html: () => mvPrint(`${moEngine('e', { valves: true, pipes: true, cams: true, plug: true, fly: true })}${moHeat('h1', 330, 900)}${moHeat('h2', 760, 900)}${mvTicoC()}${mvDotaC('down')}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $, false);
      moTurn(tl, $, 'e', 0, 1260, s.t0, K('jam') - s.t0 + 0.2, 'power1.out');
      tl.set($('#h1, #h2'), { opacity: 1 }, K('heat'));
      tl.fromTo($('#h1, #h2'), { y: 0 }, { y: -30, duration: 0.4, yoyo: true, repeat: Math.ceil((s.t1 - K('heat')) / 0.4), ease: 'sine.inOut' }, K('heat'));
      tl.to($('#e-walls rect, #e-pistonM rect, #e-head path'), { fill: '#ff9b7a', duration: 0.6 }, K('heat'));
      tl.fromTo($('#e'), { x: -8 }, { x: 8, duration: 0.05, yoyo: true, repeat: 7, ease: 'none' }, K('jam'));
      tl.set($('#dc-bump'), { opacity: 1 }, s.t0).set($('#dc-black'), { opacity: 0.85 }, s.t0);
      tl.fromTo($('#dc'), { x: 400 }, { x: 0, duration: 0.8, ease: 'power2.out' }, s.t0 + 0.1);
      moDizzy(tl, $, 'dc', s.t0 + 0.1, s.t1);
      mvTalk(tl, $, 'tc', s, 'tico');
    },
  },
  oil: {
    bg: '#0f4a5c',
    html: () => mvPrint(`${moEngine('e', { valves: true, pipes: true, cams: true, plug: true, fly: true })}${[0, 1, 2, 3, 4].map((i) => moDrop('o' + i, 400 + i * 70, 560, 0.5, MO.oil)).join('')}${moTag('tg', 540, 1580, 'ACEITE', '#b8860b')}${mvTicoC('point')}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $, false);
      moTurn(tl, $, 'e', 0, 1080, K('oil') + 0.3, s.t1 - K('oil') - 0.3, 'power1.in');
      for (let i = 0; i < 5; i++) tl.fromTo($('#o' + i), { y: -200, opacity: 0 }, { y: 420 + (i % 2) * 90, opacity: 1, duration: 0.6, ease: 'power2.in' }, K('oil') - 0.3 + i * 0.12);
      tl.to($('#e-walls rect, #e-pistonM rect'), { fill: '#f6d27a', duration: 0.5 }, K('oil') + 0.4);
      moPopIn(tl, $('#tg'), K('oil') + 0.2);
      mvTalk(tl, $, 'tc', s, 'tico');
    },
  },
  rad: {
    bg: '#0f4a5c',
    html: () => mvPrint(`<path id="hose" d="M600 980 C 480 900, 420 880, 330 900 M330 1200 C 430 1230, 520 1220, 600 1180" fill="none" stroke="${MO.o}" stroke-width="44" stroke-linecap="round"/>
      <path id="hoseC" d="M600 980 C 480 900, 420 880, 330 900 M330 1200 C 430 1230, 520 1220, 600 1180" fill="none" stroke="${MO.cool}" stroke-width="26" stroke-linecap="round" stroke-dasharray="30 22"/>
      <g transform="translate(365 418) scale(0.62)">${moEngine('e', { valves: true, pipes: true, cams: true, plug: true, fly: true })}</g>${moRadiator('rd', 230, 1050)}${moTag('tg', 240, 1340, 'RADIADOR')}${moHeat('hh', 230, 820, 2)}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $, false);
      moTurn(tl, $, 'e', 0, 1440, s.t0, s.t1 - s.t0, 'none');
      tl.set($('#hose, #hoseC'), { opacity: 0 }, s.t0).set($('#hose, #hoseC'), { opacity: 1 }, K('liquid') - 0.1);
      tl.fromTo($('#hoseC'), { strokeDashoffset: 0 }, { strokeDashoffset: -520, duration: s.t1 - K('liquid'), ease: 'none' }, K('liquid'));
      tl.set($('#rd'), { opacity: 0 }, s.t0).set($('#rd'), { opacity: 1 }, K('rad') - 0.1); moPop(tl, $('#rd'), K('rad') - 0.1, 0.4);
      tl.set($('#hh'), { opacity: 1 }, K('rad') + 0.3); tl.fromTo($('#hh'), { y: 0 }, { y: -40, duration: 0.5, yoyo: true, repeat: 3, ease: 'sine.inOut' }, K('rad') + 0.3);
      moPopIn(tl, $('#tg'), K('tag'));
    },
  },
  promised: {
    bg: '#0f4a5c',
    html: () => mvPrint(`${mvFront(true, 0.82, 600, 1010)}${moTico('tk', 190, 1590, 0.5, 'point')}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $, false);
      tl.to($('#t-qm'), { opacity: 0, y: 300, duration: 0.4, ease: 'power2.in' }, K('reveal') - 0.2);
      moBeltRun(tl, $, 't', K('reveal'), s.t1 - K('reveal'), 1);
      tl.fromTo($('#t-glow'), { opacity: 0 }, { opacity: 1, duration: 0.3, yoyo: true, repeat: 3 }, K('reveal') + 0.1);
      mvTalk(tl, $, 'tk', s, 'tico');
    },
  },
  links: {
    bg: '#0f4a5c',
    html: () => mvPrint(`${mvFront(false, 0.82, 600, 1010)}${moTag('tl1', 600, 550, 'LEVAS')}${moTag('tl2', 600, 1490, 'CIGÜEÑAL')}${moTico('tk', 190, 1590, 0.5)}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $, false);
      moBeltRun(tl, $, 't', s.t0, s.t1 - s.t0, 3);
      moPopIn(tl, $('#tl2'), K('crk')); moPopIn(tl, $('#tl1'), K('cam'));
      mvTalk(tl, $, 'tk', s, 'tico');
    },
  },
  snap: {
    bg: '#0f4a5c',
    html: () => mvPrint(`<g id="fv">${mvFront(false, 0.82, 600, 1010)}</g><g id="cv" opacity="0">${moPrint()}${moEngine('e', { valves: true, pipes: true, cams: true, plug: true })}${moTag('tg', 820, 600, '¡ABIERTA!', MO.red)}
      <g id="hitStars" opacity="0">${moStar(560, 930, 34)}${moStar(660, 880, 26)}${moStar(470, 900, 22)}</g>${moBoom('hb', 610, 935, 0.6)}</g>`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $, false);
      moBeltRun(tl, $, 't', s.t0, K('snap') - s.t0, 1);
      tl.set($('#t-belt'), { opacity: 0 }, K('snap')).set($('#t-broken'), { opacity: 1 }, K('snap'));
      tl.fromTo($('#t-broken'), { y: -30 }, { y: 0, duration: 0.3, ease: 'bounce.out' }, K('snap'));
      tl.to($('#cv'), { opacity: 1, duration: 0.3 }, K('snap') + 0.9);
      mvHold(tl, $, 180, s, { stuckEx: 36 });
      moPopIn(tl, $('#tg'), K('open'));
      tl.fromTo($('#e-vExM'), { opacity: 1 }, { opacity: 0.4, duration: 0.2, yoyo: true, repeat: 3 }, K('open'));
      moTurn(tl, $, 'e', 180, 352, K('hit') - 1.2, 1.2, 'power2.in', { stuckEx: 36 });
      moFlash(tl, $('#hb'), K('hit'), 0.35);
      tl.set($('#hitStars'), { opacity: 1 }, K('hit') + 0.05); moPop(tl, $('#hitStars'), K('hit') + 0.05, 0.3);
      tl.to($('#e-vEx'), { rotation: 14, svgOrigin: '610 760', duration: 0.12, ease: 'power3.out' }, K('hit'));
      
    },
  },
  dist: {
    bg: '#0f4a5c',
    html: () => mvPrint(`${mvFront(false, 0.82, 600, 1010)}${moTag('tg', 600, 1520, 'DISTRIBUCIÓN', MO.red)}${moTico('tk', 190, 1590, 0.5, 'point')}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $, false);
      moBeltRun(tl, $, 't', s.t0, s.t1 - s.t0, 1);
      tl.fromTo($('#t-glow'), { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out' }, s.t0 + 0.1);
      moPopIn(tl, $('#tg'), K('tag'));
      mvTalk(tl, $, 'tk', s, 'tico');
    },
  },
  manual: {
    bg: '#0f4a5c',
    html: () => mvBurst(`${moManual('mn', 590, 1000, 0.8)}${moTico('tk', 230, 1590, 0.62, 'point')}`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $);
      moPop(tl, $('#mn'), K('man') - 0.2, 0.4);
      tl.fromTo($('#mn-hl'), { opacity: 0 }, { opacity: 1, duration: 0.2, yoyo: true, repeat: 3 }, K('line'));
      tl.set($('#mn-hl'), { opacity: 1 }, K('line') + 0.85);
      mvTalk(tl, $, 'tk', s, 'tico');
    },
  },
  outro: {
    bg: '#0f4a5c',
    html: () => mvBurst(`${f2Hill('hl', 1340, '#17667b', '#0d4252', 30)}${moSmoke('ex1', 230, 1290, 0.7)}${moSmoke('ex2', 180, 1270, 0.9)}<g id="car">${moCarIdio('cr', 'tk', 'd', 540, 1250, 1.1)}${moBoom('bm', 795, 1180, 0.5)}</g>`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $);
      moFlash(tl, $('#bm'), K('boom'), 0.4);
      tl.fromTo($('#car'), { y: 0 }, { y: -6, duration: 0.09, yoyo: true, repeat: Math.floor((K('drive') - s.t0) / 0.09), ease: 'none' }, s.t0);
      tl.to($('#car'), { x: 1100, duration: 1.3, ease: 'power2.in' }, K('drive'));
      tl.to($('#cr-w1, #cr-w2'), { rotation: 900, transformOrigin: '50% 50%', duration: 1.3, ease: 'power2.in' }, K('drive'));
      moPuff(tl, $('#ex1'), K('drive') + 0.05, -80); moPuff(tl, $('#ex2'), K('drive') + 0.3, -100);
      moHop(tl, $('#d'), K('drive') - 0.4, 4, 18);
      mvTalk(tl, $, 'tk', s, 'tico');
    },
  },
  sub: {
    bg: MO.bg1, ink: MO.navy,
    // the banner: stars around, "¡SUSCRÍBANSE!" over the Idio-two logo, Tico (idea bulb, arms crossed) and Dota (arms up, dizzy stars)
    html: () => svg(`${moBurst('bg', MO.bg1, MO.bg2, 540, 1000, false)}<g id="cam"><g id="camP"><g id="camZ">
      <g id="stars">${[[150, 560, 34], [930, 520, 30], [250, 760, 20], [860, 780, 22], [130, 1380, 26], [960, 1330, 34], [300, 1560, 22], [820, 1580, 20]].map(([x, y, r], i) => `<g id="st${i}">${moStar(x, y, r)}</g>`).join('')}</g>
      ${moCallout('sub', 540, 600, '¡SUSCRÍBANSE!')}${moLogo('logo', 540, 870, 178)}
      ${moTico('tk', 420, 1560, 0.8, 'cross')}${moDota('d', 680, 1560, 0.95, 'up')}
    </g></g></g>`),
    anim(tl, s, K, $) {
      mvBase(tl, s, $);
      tl.set($('#tk-bulb'), { opacity: 1 }, s.t0); moPop(tl, $('#tk-bulb'), s.t0 + 0.15, 0.4);
      moDizzy(tl, $, 'd', s.t0 + 0.1, s.t1);
      moPop(tl, $('#logo'), s.t0 + 0.05, 0.5);
      moPopIn(tl, $('#sub'), s.t0 + 0.3);
      tl.to($('#sub'), { scale: 1.08, transformOrigin: '50% 50%', duration: 0.25, yoyo: true, repeat: 7, ease: 'sine.inOut' }, s.t0 + 1.0);
      for (let i = 0; i < 8; i++) { moPop(tl, $(`#st${i}`), s.t0 + 0.1 + i * 0.07, 0.35); tl.to($(`#st${i}`), { rotation: i % 2 ? 20 : -20, scale: 1.15, transformOrigin: '50% 50%', duration: 0.5, yoyo: true, repeat: Math.floor((s.t1 - s.t0) / 0.5) - 1, ease: 'sine.inOut' }, s.t0 + 0.6 + i * 0.05); }
      moHop(tl, $('#d'), s.t0 + 0.2, 2, 30);
      tl.fromTo($('#tk-head'), { rotation: -6, svgOrigin: '0 -360' }, { rotation: 6, duration: 0.14, yoyo: true, repeat: 3, ease: 'sine.inOut' }, K('screws'));
      tl.to($('#tk-brows'), { y: -12, duration: 0.15, yoyo: true, repeat: 1 }, K('screws') + 0.6);
      mvTalk(tl, $, 'd', s, 'dota');
    },
  },
});
