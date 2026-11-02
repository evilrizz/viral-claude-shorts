// =====================================================================
//  Flat 2D — library: reusable flat SVG pieces and one generic scene per type.
//  Runs in the browser (the adapter strips the types). Every piece returns SVG markup (a string). Frame coordinates: 1080 x 1920.
//  Safe zone (TikTok/Reels/Shorts cover the rest with their interface): x 60–940, y 220–1480 (SAFE). Titles sit on top,
//  so the art's usable area is y 660–1270 with a stat card, down to 1480 without one. Only backgrounds go past it.
//  Style rules: flat colors, no outlines, one flat shadow (same color, darker) offset.
//  GSAP NOTE: every piece puts its id on a <g> WITHOUT a transform and the position on an inner <g>; that way GSAP's
//  x/y/scale add to the position instead of replacing it.
// =====================================================================
const F2 = {
  blue: '#4c7dff', blueD: '#2f55c9', sky: '#5fb6f5', skyD: '#3a8fd8', night: '#14213d', yellow: '#ffc83d', orange: '#ff8a3d', red: '#ff5a5f',
  green: '#3ccf91', greenD: '#24a872', purple: '#8b6cff', pink: '#ff7eb6', white: '#ffffff', cream: '#fff4dc', gray: '#c9d3ea',
};
// same numbers as SAFE in core/style.ts (the browser can't import it)
const SAFE = { left: 60, right: 940, top: 220, bottom: 1480 };
const RAINBOW = ['#ff5a5f', '#ff8a3d', '#ffc83d', '#3ccf91', '#4c7dff', '#8b6cff'];
const svg = (body: string, defs = '') => `<svg viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${body}</svg>`;
function f2Sun(id: string, cx: number, cy: number, r: number, c = F2.yellow) {
  let rays = '';
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; rays += `<rect x="${-10}" y="${-r - 70}" width="20" height="44" rx="10" fill="${c}" transform="rotate(${a * 180 / Math.PI})"/>`; }
  return `<g id="${id}"><g transform="translate(${cx} ${cy})"><g class="rays">${rays}</g><circle r="${r + 14}" fill="${c}" opacity="0.35"/><circle class="disc" r="${r}" fill="${c}"/></g></g>`;
}
function f2Cloud(id: string, x: number, y: number, s = 1, c = F2.white) {
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="6" cy="14" rx="130" ry="40" fill="#000" opacity="0.08"/>
    <circle cx="-60" cy="0" r="46" fill="${c}"/><circle cx="0" cy="-26" r="62" fill="${c}"/><circle cx="62" cy="-4" r="48" fill="${c}"/><rect x="-110" y="0" width="220" height="46" rx="23" fill="${c}"/></g></g>`;
}
function f2Hill(id: string, y: number, c: string, c2: string, amp = 60) {
  return `<g id="${id}"><path d="M-40 ${y} C 260 ${y - amp}, 600 ${y + amp}, 1120 ${y - amp * 0.5} L1120 1960 L-40 1960 Z" fill="${c}"/>
    <path d="M-40 ${y + 40} C 300 ${y - amp + 40}, 640 ${y + amp + 50}, 1120 ${y - amp * 0.5 + 40} L1120 1960 L-40 1960 Z" fill="${c2}" opacity="0.5"/></g>`;
}
function f2Molecule(id: string, x: number, y: number, r = 34, c = F2.white, c2 = F2.gray) {   // two joined spheres (N2 / O2), with a flat shine
  return `<g id="${id}"><g transform="translate(${x} ${y})"><circle cx="-${r * 0.7}" cy="6" r="${r}" fill="${c2}"/><circle cx="${r * 0.7}" cy="6" r="${r}" fill="${c2}"/>
    <circle cx="-${r * 0.7}" r="${r}" fill="${c}"/><circle cx="${r * 0.7}" r="${r}" fill="${c}"/><circle cx="-${r * 0.9}" cy="-${r * 0.35}" r="${r * 0.25}" fill="#fff" opacity="0.8"/></g></g>`;
}
// a wave (for light): from x0 to x1 at height y, with wavelength L and amplitude A
function f2Wave(id: string, x0: number, x1: number, y: number, L: number, A: number, c: string, w = 12) {
  let d = `M${x0} ${y}`; for (let x = x0; x <= x1; x += 6) d += ` L${x} ${(y + Math.sin((x - x0) / L * Math.PI * 2) * A).toFixed(1)}`;
  return `<path id="${id}" d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
function f2Arrow(id: string, x1: number, y1: number, x2: number, y2: number, c: string, w = 14) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.4;
  return `<g id="${id}"><line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * h * 0.6}" y2="${y2 - Math.sin(a) * h * 0.6}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>
    <path d="M${x2} ${y2} L${x2 - Math.cos(a - 0.5) * h} ${y2 - Math.sin(a - 0.5) * h} L${x2 - Math.cos(a + 0.5) * h} ${y2 - Math.sin(a + 0.5) * h} Z" fill="${c}"/></g>`;
}
function f2Person(id: string, x: number, y: number, s = 1) {   // a simple person looking up
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})"><rect x="-46" y="0" width="92" height="150" rx="40" fill="${F2.red}"/>
    <rect x="-38" y="130" width="30" height="90" rx="14" fill="${F2.night}"/><rect x="8" y="130" width="30" height="90" rx="14" fill="${F2.night}"/>
    <circle cx="0" cy="-50" r="52" fill="#f2c29b"/><path d="M-52 -60 Q0 -130 52 -60 Q30 -90 0 -88 Q-30 -90 -52 -60Z" fill="#3b2a24"/>
    <circle cx="14" cy="-62" r="7" fill="${F2.night}"/><circle cx="-14" cy="-62" r="7" fill="${F2.night}"/><path d="M-12 -36 Q0 -26 12 -36" stroke="${F2.night}" stroke-width="5" fill="none" stroke-linecap="round"/></g></g>`;
}
// pops an element in (scale 0 -> 1 with a little bounce): the most common entrance
const f2Pop = (tl: gsap.core.Timeline, sel: string, t: number, d = 0.45) => tl.fromTo(sel, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: d, ease: 'back.out(2)' }, t);

// generic scenes by type: { bg?, ink?, html(s), anim(tl, s, K, $) }. On a light background set ink: F2.night.
const LIBRARY: Record<string, Visual> = {
  question: { html: () => svg(`${f2Sun('sun', 540, 1000, 120)}`), anim: (tl, s, K, $) => tl.fromTo($('#sun'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.6, ease: 'back.out(2)' }, s.t0 + 0.2) },
  object: { html: () => svg(`<circle id="obj" cx="505" cy="1000" r="180" fill="${F2.blue}"/>`), anim: (tl, s, K, $) => tl.fromTo($('#obj'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.6, ease: 'back.out(2)' }, s.t0 + 0.2) },
  process: { html: () => svg([0, 1, 2].map((i) => `<circle class="step" cx="${215 + i * 290}" cy="1000" r="110" fill="${RAINBOW[i * 2]}"/>`).join('')), anim: (tl, s, K, $) => tl.fromTo($('.step'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.4 }, s.t0 + 0.2) },
  comparison: { html: () => svg(`<rect id="a" x="140" y="760" width="300" height="500" rx="30" fill="${F2.red}"/><rect id="b" x="600" y="760" width="300" height="500" rx="30" fill="${F2.blue}"/>`), anim: () => {} },
  stat: { html: () => svg(`<circle id="st" cx="505" cy="1000" r="200" fill="${F2.yellow}"/>`), anim: (tl, s, K, $) => tl.fromTo($('#st'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.6, ease: 'back.out(2)' }, K('stat')) },
  map: { html: () => svg(`<circle cx="505" cy="1000" r="300" fill="${F2.sky}"/><path d="M380 900 Q460 820 560 880 T640 1040 Q520 1100 420 1030Z" fill="${F2.green}"/>`), anim: () => {} },
  asset: { html: (s) => svg(`<image href="assets/${s.asset}" x="140" y="700" width="730" height="560" preserveAspectRatio="xMidYMid meet"/>`), anim: () => {} },
  closing: { html: () => svg(`${f2Sun('sunC', 505, 1050, 150)}`), anim: (tl, s, K, $) => tl.fromTo($('#sunC'), { rotation: 0, transformOrigin: '50% 50%' }, { rotation: 90, duration: s.t1 - s.t0, ease: 'none' }, s.t0) },
};

// each video's visuals.ts fills this with defineVisuals({ sceneId: { bg, ink, html, anim }, ... })
const VISUALS: Record<string, Visual> = {};
function defineVisuals(v: Record<string, Visual>) { Object.assign(VISUALS, v); }
