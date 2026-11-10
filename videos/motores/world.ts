// =====================================================================
//  World of "Cómo funcionan los motores" (Idio-two): Tico, Dota, the engine cutaway, the timing belt and props.
//  Flat 2D with the thick dark-brown outline of the characters' reference (assets/tico-dota.png).
//  Every piece is posed from the timeline (no clocks, no randomness). Names start with "mo".
// =====================================================================
const MO = {
  o: '#2b1a14', bg1: '#fff3d6', bg2: '#ffe6a8', navy: '#1d2a4d', grid: '#2a3a63',
  tB: '#5a3a2b', tC: '#f3d9b1', tC2: '#f8e6c8', tShirt: '#3270e6',
  dB: '#c97b3d', dC: '#f2d2a6', dC2: '#f8e3c4', dShirt: '#ffc83d',
  steel: '#c9d3e0', steelD: '#8e9bb0', steelL: '#e8eef5', iron: '#5d6678', gas: '#7fc8ff', fire: '#ff8a3d', oil: '#f2b632', cool: '#4cc4ff', red: '#ff5a5f',
};
const MO_SW = 8;
// a limb: a rounded bar with the outline (two stacked lines)
function moLimb(x1: number, y1: number, x2: number, y2: number, w: number, c: string) {
  const L = Math.hypot(x2 - x1, y2 - y1) || 1, nx = (y2 - y1) / L, ny = -(x2 - x1) / L, sg = nx + ny >= 0 ? 1 : -1, ox = nx * sg * w * 0.24, oy = ny * sg * w * 0.24;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${MO.o}" stroke-width="${w + MO_SW * 2}" stroke-linecap="round"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<line x1="${(x1 + ox).toFixed(1)}" y1="${(y1 + oy).toFixed(1)}" x2="${(x2 + ox).toFixed(1)}" y2="${(y2 + oy).toFixed(1)}" stroke="#000" stroke-opacity="0.2" stroke-width="${(w * 0.4).toFixed(1)}" stroke-linecap="round"/>`;
}
// a cel-shaded shape: base colour, a darker crescent on the bottom-right, an optional shine, then the outline.
// geom(attrs) returns the shape with the given attributes; the clip id comes from the geometry, so equal shapes share it.
function moHash(t: string) { let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
function moVol(geom: (a: string) => string, fill: string, o: { sx?: number; sy?: number; k?: number; hi?: string; sw?: number } = {}) {
  const { sx = 14, sy = 14, k = 0.2, hi = '', sw = MO_SW } = o, g0 = geom(''), uid = 'cv' + moHash(g0 + fill + sx + sy);
  return `<clipPath id="${uid}">${g0}</clipPath>${geom(`fill="${fill}"`)}<g clip-path="url(#${uid})"><rect x="-4000" y="-4000" width="8000" height="8000" fill="#000" opacity="${k}"/><g transform="translate(${-sx} ${-sy})">${geom(`fill="${fill}"`)}</g>${hi}</g>` +
    (sw ? geom(`fill="none" stroke="${MO.o}" stroke-width="${sw}" stroke-linejoin="round"`) : '');
}
const moShine = (x: number, y: number, rx: number, ry: number, op = 0.35) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity="${op}" transform="rotate(-30 ${x} ${y})"/>`;
const moHand = (x: number, y: number, r: number, c: string) => moVol((a) => `<circle cx="${x}" cy="${y}" r="${r}" ${a}/>`, c, { sx: r * 0.3, sy: r * 0.3 });
const moVis = (on: boolean) => (on ? '' : ' opacity="0"');
function moStar(x: number, y: number, r: number, c = MO.dShirt) {
  let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)} `; }
  return `<path d="${d}Z" fill="${c}" stroke="${MO.o}" stroke-width="6" stroke-linejoin="round"/>`;
}

// ---------------- Tico: tall dark-brown monkey, glasses, blue t-shirt. Feet at (x, y).
type MoTicoPose = 'cross' | 'point' | 'palm' | 'hold';
function moTico(id: string, x: number, y: number, s = 1, pose: MoTicoPose = 'cross', flip = false) {
  const B = MO.tB, C = MO.tC, O = MO.o, sw = MO_SW;
  const armL = moLimb(-92, -320, -112, -175, 40, B) + moHand(-114, -165, 28, B);   // left arm hanging (shoulder -> wrist)
  const circ = (cx: number, cy: number, r: number) => (a: string) => `<circle cx="${cx}" cy="${cy}" r="${r}" ${a}/>`;
  const ell = (cx: number, cy: number, rx: number, ry: number) => (a: string) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${a}/>`;
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
    <ellipse cx="0" cy="0" rx="150" ry="22" fill="#000" opacity="0.16"/>
    <g id="${id}-rig">
    ${moLimb(-36, -140, -38, -30, 40, B)}${moLimb(36, -140, 38, -30, 40, B)}
    ${moVol(ell(-46, -14, 50, 22), C, { sx: 10, sy: 8 })}${moVol(ell(46, -14, 50, 22), C, { sx: 10, sy: 8 })}
    ${moVol((a) => `<rect x="-100" y="-365" width="200" height="240" rx="62" ${a}/>`, MO.tShirt, { sx: 26, sy: 6, k: 0.22, hi: moShine(-60, -320, 18, 34, 0.25) })}
    <path d="M-46 -362 Q0 -330 46 -362" fill="none" stroke="#000" stroke-opacity="0.2" stroke-width="12" stroke-linecap="round"/>
    <g id="${id}-cross"${moVis(pose === 'cross')}>${moLimb(-90, -300, 70, -235, 46, B)}${moLimb(90, -300, -70, -235, 46, B)}${moHand(78, -232, 30, B)}${moHand(-78, -232, 30, B)}</g>
    <g id="${id}-point"${moVis(pose === 'point')}>${armL}${moLimb(92, -320, 175, -390, 40, B)}${moLimb(175, -390, 250, -470, 36, B)}${moHand(258, -478, 28, B)}<rect x="262" y="-530" width="18" height="44" rx="9" fill="${B}" stroke="${O}" stroke-width="6" transform="rotate(30 271 -508)"/></g>
    <g id="${id}-palm"${moVis(pose === 'palm')}>${armL}${moLimb(92, -320, 160, -400, 40, B)}${moLimb(160, -400, 30, -525, 36, B)}</g>
    <g id="${id}-hold"${moVis(pose === 'hold')}>${moLimb(-92, -320, -120, -230, 40, B)}${moLimb(-120, -230, -40, -200, 36, B)}${moLimb(92, -320, 120, -230, 40, B)}${moLimb(120, -230, 40, -200, 36, B)}${moHand(-40, -200, 28, B)}${moHand(40, -200, 28, B)}</g>
    <g id="${id}-head"><g id="${id}-bob"><g id="${id}-nod">
      ${moVol(circ(-130, -475, 48), B, { sx: 12, sy: 12 })}<circle cx="-130" cy="-475" r="26" fill="${C}"/>
      ${moVol(circ(130, -475, 48), B, { sx: 12, sy: 12 })}<circle cx="130" cy="-475" r="26" fill="${C}"/>
      <path d="M-14 -604 Q0 -640 16 -606" fill="${B}" stroke="${O}" stroke-width="${sw}" stroke-linejoin="round"/>
      ${moVol(circ(0, -475, 132), B, { sx: 30, sy: 26, k: 0.25, hi: moShine(-70, -555, 26, 14, 0.3) })}
      <path d="M-100 -470 Q-100 -545 -45 -548 Q0 -520 45 -548 Q100 -545 100 -470 Q100 -360 0 -358 Q-100 -360 -100 -470Z" fill="${C}"/>
      <path d="M100 -470 Q100 -360 0 -358 Q70 -380 86 -440Z" fill="#000" opacity="0.08"/>
      <ellipse cx="0" cy="-398" rx="64" ry="36" fill="${MO.tC2}"/>
      <ellipse cx="-78" cy="-410" rx="20" ry="11" fill="#ff8f8f" opacity="0.35"/><ellipse cx="78" cy="-410" rx="20" ry="11" fill="#ff8f8f" opacity="0.35"/>
      <circle cx="-10" cy="-420" r="5" fill="${O}"/><circle cx="10" cy="-420" r="5" fill="${O}"/>
      <path id="${id}-smirk" d="M-36 -386 Q0 -368 38 -394" stroke="${O}" stroke-width="8" fill="none" stroke-linecap="round"/>
      <ellipse id="${id}-talk" cx="0" cy="-384" rx="24" ry="15" fill="#7a1f1f" stroke="${O}" stroke-width="6" opacity="0"/>
      <line x1="-130" y1="-478" x2="-92" y2="-478" stroke="${O}" stroke-width="8"/><line x1="130" y1="-478" x2="92" y2="-478" stroke="${O}" stroke-width="8"/><line x1="-8" y1="-478" x2="8" y2="-478" stroke="${O}" stroke-width="8"/>
      <circle cx="-50" cy="-478" r="42" fill="#e8f0f8" stroke="${O}" stroke-width="9"/><circle cx="50" cy="-478" r="42" fill="#e8f0f8" stroke="${O}" stroke-width="9"/>
      <g id="${id}-eyes"><circle cx="-46" cy="-474" r="13" fill="${O}"/><circle cx="54" cy="-474" r="13" fill="${O}"/></g>
      <path d="M-78 -496 Q-66 -510 -50 -512" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.9"/><path d="M22 -496 Q34 -510 50 -512" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.9"/>
      <g id="${id}-brows"><line x1="-92" y1="-540" x2="-28" y2="-526" stroke="${O}" stroke-width="11" stroke-linecap="round"/><line x1="28" y1="-526" x2="92" y2="-540" stroke="${O}" stroke-width="11" stroke-linecap="round"/></g>
    </g></g></g>
    <g id="${id}-palmHand"${moVis(pose === 'palm')}>${moVol(ell(10, -535, 62, 34), B, { sx: 12, sy: 10 })}</g>
    <g id="${id}-bulb" opacity="0"><g transform="translate(0 -700)">
      <line x1="-80" y1="0" x2="-60" y2="0" stroke="${O}" stroke-width="8" stroke-linecap="round"/><line x1="60" y1="0" x2="80" y2="0" stroke="${O}" stroke-width="8" stroke-linecap="round"/>
      <line x1="-58" y1="-58" x2="-44" y2="-44" stroke="${O}" stroke-width="8" stroke-linecap="round"/><line x1="58" y1="-58" x2="44" y2="-44" stroke="${O}" stroke-width="8" stroke-linecap="round"/><line x1="0" y1="-84" x2="0" y2="-66" stroke="${O}" stroke-width="8" stroke-linecap="round"/>
      ${moVol(circ(0, 0, 46), MO.dShirt, { sx: 10, sy: 10, hi: moShine(-16, -18, 12, 7, 0.6) })}<path d="M-14 10 L0 -8 L14 10" stroke="${O}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <rect x="-22" y="44" width="44" height="26" rx="6" fill="${MO.steel}" stroke="${O}" stroke-width="7"/></g></g>
    </g>
  </g></g>`;
}
function moTicoPose(tl: gsap.core.Timeline, $: (q: string) => string, id: string, pose: MoTicoPose, t: number) {
  for (const p of ['cross', 'point', 'palm', 'hold']) tl.set($(`#${id}-${p}`), { opacity: p === pose ? 1 : 0 }, t);
  tl.set($(`#${id}-palmHand`), { opacity: pose === 'palm' ? 1 : 0 }, t);
}
// Tico talks between t0 and t1 (mouth opens and closes), then goes back to the smirk
function moTicoTalk(tl: gsap.core.Timeline, $: (q: string) => string, id: string, t0: number, t1: number) {
  const n = Math.max(1, Math.round((t1 - t0) / 0.24));
  tl.set($(`#${id}-smirk`), { opacity: 0 }, t0).set($(`#${id}-talk`), { opacity: 1 }, t0);
  tl.fromTo($(`#${id}-talk`), { scaleY: 1, transformOrigin: '50% 50%' }, { scaleY: 0.25, duration: 0.12, ease: 'sine.inOut', yoyo: true, repeat: n * 2 - 1 }, t0);
  tl.set($(`#${id}-smirk`), { opacity: 1 }, t1).set($(`#${id}-talk`), { opacity: 0 }, t1);
  const m = Math.max(1, Math.round((t1 - t0) / 0.55));
  tl.fromTo($(`#${id}-nod`), { rotation: 0, y: 0, svgOrigin: '0 -360' }, { rotation: -4, y: 6, duration: 0.275, ease: 'sine.inOut', yoyo: true, repeat: m * 2 - 1, immediateRender: false }, t0);
}

// ---------------- Dota: small light-brown monkey, huge head, three tufts, yellow t-shirt, bandage. Feet at (x, y).
type MoDotaPose = 'up' | 'down' | 'hug' | 'reach';
function moDota(id: string, x: number, y: number, s = 1, pose: MoDotaPose = 'up', flip = false) {
  const B = MO.dB, C = MO.dC, O = MO.o;
  const circ = (cx: number, cy: number, r: number) => (a: string) => `<circle cx="${cx}" cy="${cy}" r="${r}" ${a}/>`;
  const ell = (cx: number, cy: number, rx: number, ry: number) => (a: string) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${a}/>`;
  const tuft = (cx: number, cy: number, r: number) => moVol((a) => `<ellipse cx="${cx}" cy="${cy}" rx="17" ry="32" transform="rotate(${r} ${cx} ${cy})" ${a}/>`, B, { sx: 6, sy: 6 });
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
    <ellipse cx="0" cy="0" rx="120" ry="20" fill="#000" opacity="0.16"/>
    <g id="${id}-rig">
    ${moLimb(-28, -80, -52, -22, 30, B)}${moLimb(28, -80, 52, -22, 30, B)}
    ${moVol(ell(-60, -14, 38, 18), C, { sx: 8, sy: 6 })}${moVol(ell(60, -14, 38, 18), C, { sx: 8, sy: 6 })}
    <g id="${id}-up"${moVis(pose === 'up')}>${moLimb(-55, -175, -105, -230, 30, B)}${moLimb(-105, -230, -135, -290, 28, B)}${moLimb(55, -175, 105, -230, 30, B)}${moLimb(105, -230, 135, -290, 28, B)}${moHand(-138, -298, 24, B)}${moHand(138, -298, 24, B)}</g>
    <g id="${id}-down"${moVis(pose === 'down')}>${moLimb(-60, -180, -82, -95, 30, B)}${moLimb(60, -180, 82, -95, 30, B)}${moHand(-84, -88, 24, B)}${moHand(84, -88, 24, B)}</g>
    <g id="${id}-reach"${moVis(pose === 'reach')}>${moLimb(-60, -180, -82, -95, 30, B)}${moHand(-84, -88, 24, B)}${moLimb(60, -180, 130, -175, 30, B)}${moLimb(130, -175, 205, -185, 28, B)}${moHand(212, -186, 22, B)}<rect x="228" y="-194" width="34" height="14" rx="7" fill="${B}" stroke="${O}" stroke-width="6"/></g>
    ${moVol((a) => `<rect x="-72" y="-215" width="144" height="160" rx="42" ${a}/>`, MO.dShirt, { sx: 20, sy: 6, k: 0.18, hi: moShine(-40, -180, 12, 24, 0.35) })}
    <path d="M-34 -212 Q0 -192 34 -212" fill="none" stroke="#000" stroke-opacity="0.18" stroke-width="10" stroke-linecap="round"/>
    <g id="${id}-hug"${moVis(pose === 'hug')}>${moLimb(-60, -180, -95, -130, 30, B)}${moLimb(-95, -130, -40, -110, 28, B)}${moLimb(60, -180, 95, -130, 30, B)}${moLimb(95, -130, 40, -110, 28, B)}${moHand(-36, -110, 22, B)}${moHand(36, -110, 22, B)}</g>
    <g id="${id}-head"><g id="${id}-bob"><g id="${id}-nod">
      ${tuft(-38, -432, -22)}${tuft(0, -446, 0)}${tuft(38, -432, 22)}
      ${moVol(circ(-112, -318, 42), B, { sx: 10, sy: 10 })}<circle cx="-112" cy="-318" r="22" fill="${C}"/>
      ${moVol(circ(112, -318, 42), B, { sx: 10, sy: 10 })}<circle cx="112" cy="-318" r="22" fill="${C}"/>
      ${moVol(circ(0, -322, 116), B, { sx: 26, sy: 22, k: 0.22, hi: moShine(-60, -395, 22, 12, 0.32) })}
      <path d="M-92 -320 Q-92 -385 -40 -390 Q0 -366 40 -390 Q92 -385 92 -320 Q92 -225 0 -222 Q-92 -225 -92 -320Z" fill="${C}"/>
      <path d="M92 -320 Q92 -225 0 -222 Q66 -244 80 -300Z" fill="#000" opacity="0.08"/>
      <ellipse cx="0" cy="-262" rx="58" ry="36" fill="${MO.dC2}"/>
      <ellipse cx="-70" cy="-276" rx="18" ry="10" fill="#ff8f8f" opacity="0.4"/><ellipse cx="74" cy="-276" rx="18" ry="10" fill="#ff8f8f" opacity="0.4"/>
      <circle id="${id}-black" cx="40" cy="-332" r="44" fill="#6a4a8c" opacity="0"/>
      <circle cx="-38" cy="-332" r="31" fill="#fff" stroke="${O}" stroke-width="7"/><circle cx="40" cy="-332" r="31" fill="#fff" stroke="${O}" stroke-width="7"/>
      <g id="${id}-pupils"><circle cx="-28" cy="-326" r="13" fill="${O}"/><circle cx="48" cy="-342" r="13" fill="${O}"/><circle cx="-24" cy="-330" r="4" fill="#fff"/><circle cx="52" cy="-346" r="4" fill="#fff"/></g>
      <line x1="-70" y1="-382" x2="-12" y2="-376" stroke="${O}" stroke-width="9" stroke-linecap="round"/><line x1="12" y1="-372" x2="68" y2="-386" stroke="${O}" stroke-width="9" stroke-linecap="round"/>
      <circle cx="-10" cy="-284" r="4" fill="${O}"/><circle cx="8" cy="-284" r="4" fill="${O}"/>
      <g id="${id}-mouth"><ellipse cx="0" cy="-246" rx="25" ry="26" fill="#6b1a1a" stroke="${O}" stroke-width="7"/><ellipse cx="0" cy="-234" rx="14" ry="8" fill="#ff8fa3"/></g>
      <g transform="rotate(-28 52 -290)"><rect x="18" y="-305" width="72" height="30" rx="13" fill="#f0b088" stroke="${O}" stroke-width="6"/><circle cx="48" cy="-294" r="3" fill="${O}"/><circle cx="60" cy="-294" r="3" fill="${O}"/><circle cx="48" cy="-285" r="3" fill="${O}"/><circle cx="60" cy="-285" r="3" fill="${O}"/></g>
      <g id="${id}-bump" opacity="0">${moVol(circ(-40, -432, 30), '#ff8f8f', { sx: 8, sy: 8, sw: 7, hi: moShine(-50, -444, 9, 6, 0.7) })}</g>
    </g></g></g>
    <g id="${id}-stars" opacity="0">${moStar(-80, -470, 22)}${moStar(0, -500, 26)}${moStar(80, -470, 22)}</g>
    <g id="${id}-screws" opacity="0"><g transform="translate(84 -112)">${[-26, 0, 26].map((dx) => `<g transform="translate(${dx} 0) rotate(${dx})"><rect x="-6" y="-40" width="12" height="40" rx="3" fill="${MO.steel}" stroke="${O}" stroke-width="5"/><rect x="-14" y="-50" width="28" height="12" rx="4" fill="${MO.steelD}" stroke="${O}" stroke-width="5"/></g>`).join('')}</g></g>
    </g>
  </g></g>`;
}
function moDotaPose(tl: gsap.core.Timeline, $: (q: string) => string, id: string, pose: MoDotaPose, t: number) {
  for (const p of ['up', 'down', 'hug', 'reach']) tl.set($(`#${id}-${p}`), { opacity: p === pose ? 1 : 0 }, t);
}
function moDotaTalk(tl: gsap.core.Timeline, $: (q: string) => string, id: string, t0: number, t1: number) {
  const n = Math.max(1, Math.round((t1 - t0) / 0.24));
  tl.fromTo($(`#${id}-mouth`), { scaleY: 1, transformOrigin: '50% 30%' }, { scaleY: 0.45, duration: 0.12, ease: 'sine.inOut', yoyo: true, repeat: n * 2 - 1 }, t0);
  const m = Math.max(1, Math.round((t1 - t0) / 0.36));
  tl.fromTo($(`#${id}-nod`), { y: 0, rotation: 0, svgOrigin: '0 -215' }, { y: -14, rotation: 5, duration: 0.18, ease: 'sine.inOut', yoyo: true, repeat: m * 2 - 1, immediateRender: false }, t0);
}
// a small hop (happy / excited): 0.3 s up and down, n times
// a character is alive for the whole scene: breathing, a slow head bob and blinks (Dota bouncier)
function moAlive(tl: gsap.core.Timeline, $: (q: string) => string, id: string, s: Scene, kind: 'tico' | 'dota') {
  const d = s.t1 - s.t0, br = kind === 'tico' ? 0.95 : 0.55, neck = kind === 'tico' ? '0 -360' : '0 -215';
  tl.fromTo($(`#${id}-rig`), { scaleY: 1, scaleX: 1, svgOrigin: '0 0' }, { scaleY: kind === 'tico' ? 1.02 : 1.035, scaleX: kind === 'tico' ? 0.995 : 0.985, duration: br, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil(d / br) }, s.t0);
  tl.fromTo($(`#${id}-bob`), { rotation: -2.5, svgOrigin: neck }, { rotation: 2.5, duration: br * 1.6, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil(d / (br * 1.6)) }, s.t0);
  const eyes = $(`#${id}-${kind === 'tico' ? 'eyes' : 'pupils'}`);
  for (let t = s.t0 + 0.6 + (id.length % 3) * 0.4; t < s.t1 - 0.3; t += 2.6) tl.fromTo(eyes, { scaleY: 1, transformOrigin: '50% 50%' }, { scaleY: 0.1, duration: 0.07, yoyo: true, repeat: 1, ease: 'none', immediateRender: false }, t);
}
// squash-and-stretch pop: the default entrance
const moPop = (tl: gsap.core.Timeline, sel: string, t: number, d = 0.45) =>
  tl.fromTo(sel, { scaleX: 0, scaleY: 0, transformOrigin: '50% 100%' }, { keyframes: [{ scaleX: 1.25, scaleY: 0.8, duration: d * 0.45, ease: 'power2.out' }, { scaleX: 0.92, scaleY: 1.1, duration: d * 0.3, ease: 'sine.inOut' }, { scaleX: 1, scaleY: 1, duration: d * 0.25, ease: 'sine.out' }] }, t);
// camera on two nested groups: #cam = the snap-in at the cut + a slow drift; #camP = punches and shakes on the keys
function moCamera(tl: gsap.core.Timeline, $: (q: string) => string, s: Scene, dir: number) {
  const d = s.t1 - s.t0;
  tl.fromTo($('#cam'), { scale: 1.12, rotation: 2 * dir, x: 70 * dir, svgOrigin: '540 1050' }, { scale: 1.0, rotation: 0, x: 0, duration: 0.45, ease: 'power3.out' }, s.t0);
  tl.to($('#cam'), { scale: 1.045, rotation: -0.8 * dir, duration: Math.max(0.5, d - 0.45), ease: 'sine.inOut' }, s.t0 + 0.45);
  for (const k of s.keys || []) {
    if (k.t < s.t0 + 0.3 || k.t > s.t1 - 0.35) continue;
    const big = k.sfx === 'impact' || k.sfx === 'hit' || k.sfx === 'scratch';
    tl.fromTo($('#camP'), { scale: 1, svgOrigin: '540 1050' }, { scale: big ? 1.07 : 1.035, duration: 0.11, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, k.t);
    if (big) tl.fromTo($('#camP'), { x: 0, y: 0 }, { keyframes: [{ x: -16, y: 8, duration: 0.04 }, { x: 14, y: -10, duration: 0.04 }, { x: -9, y: 6, duration: 0.04 }, { x: 5, y: -3, duration: 0.04 }, { x: 0, y: 0, duration: 0.05 }], immediateRender: false }, k.t);
  }
}
function moFocus(tl: gsap.core.Timeline, $: (q: string) => string, x: number, y: number, z: number, t: number, d = 1.2, ease = 'power3.inOut') {
  tl.to($('#camZ'), { scale: z, svgOrigin: `${x} ${y}`, duration: d, ease }, t);
  tl.fromTo($('#spot'), { opacity: 0 }, { opacity: 0.5, duration: d, ease: 'sine.inOut', immediateRender: false }, t);
}
// the spotlight that dims everything around the focus (place it with the same centre as the zoom)
const moSpot = (x: number, y: number, r = 430) => `<circle id="spot" cx="${x}" cy="${y}" r="${r + 900}" fill="none" stroke="#03161c" stroke-width="1800" opacity="0"/>`;
// marks a new piece: a turning dashed yellow ring, a pulse and an arrow pointing at it (optional label under it)
function moMark(id: string, x: number, y: number, r: number, label = '') {
  const side = x + r * 0.7 + 170 > 1000 ? -1 : 1, ex = x + side * r * 0.78, ey = y - r * 0.78, sx = ex + side * 120, sy = ey - 120;
  return `<g id="${id}" opacity="0">
    <g id="${id}-pulse"><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#ffd23d" stroke-width="8"/></g>
    <g id="${id}-ring"><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${MO.o}" stroke-width="24"/><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#ffd23d" stroke-width="13" stroke-dasharray="36 22" stroke-linecap="round"/></g>
    <g id="${id}-arrow">${moArrow(`${id}-a`, sx, sy, ex, ey, '#ffd23d', 20)}</g>
    ${label ? moTag(`${id}-tag`, x, y + r + 64, label) : ''}</g>`;
}
function moMarkIn(tl: gsap.core.Timeline, $: (q: string) => string, id: string, x: number, y: number, t: number, d = 1.4, label = false) {
  const o = `${x} ${y}`;
  tl.set($(`#${id}`), { opacity: 1 }, t);
  tl.fromTo($(`#${id}-ring`), { scale: 0, rotation: -120, svgOrigin: o }, { scale: 1, rotation: 0, duration: 0.4, ease: 'back.out(2.2)', immediateRender: false }, t);
  tl.to($(`#${id}-ring`), { rotation: 70, svgOrigin: o, duration: d - 0.4, ease: 'none' }, t + 0.4);
  tl.fromTo($(`#${id}-pulse`), { scale: 1, opacity: 0.9, svgOrigin: o }, { scale: 1.4, opacity: 0, duration: 0.6, ease: 'power1.out', repeat: Math.max(0, Math.floor((d - 0.2) / 0.6) - 1), immediateRender: false }, t + 0.15);
  tl.fromTo($(`#${id}-arrow`), { opacity: 0, x: 60, y: -60 }, { opacity: 1, x: 0, y: 0, duration: 0.3, ease: 'back.out(2)', immediateRender: false }, t + 0.1);
  tl.to($(`#${id}-arrow`), { x: 14, y: -14, duration: 0.22, ease: 'sine.inOut', yoyo: true, repeat: Math.max(1, Math.floor((d - 0.5) / 0.22)) }, t + 0.4);
  if (label) moPopIn(tl, $(`#${id}-tag`), t + 0.2);
  tl.to($(`#${id}`), { opacity: 0, duration: 0.25 }, t + d);
}
// a short zoom on (x, y): in fast, hold, back out
function moZoom(tl: gsap.core.Timeline, $: (q: string) => string, x: number, y: number, z: number, t: number, hold: number) {
  tl.to($('#camZ'), { scale: z, svgOrigin: `${x} ${y}`, duration: 0.45, ease: 'power3.out' }, t);
  tl.to($('#camZ'), { scale: 1, duration: 0.45, ease: 'power2.inOut' }, t + hold);
}
function moHop(tl: gsap.core.Timeline, sel: string, t: number, n = 2, h = 40) {
  tl.fromTo(sel, { y: 0 }, { y: -h, duration: 0.15, ease: 'power2.out', yoyo: true, repeat: n * 2 - 1 }, t);
}
// dizzy stars: show and spin around the head (loops until t1)
function moDizzy(tl: gsap.core.Timeline, $: (q: string) => string, id: string, t0: number, t1: number) {
  tl.set($(`#${id}-stars`), { opacity: 1 }, t0);
  tl.fromTo($(`#${id}-stars`), { rotation: -12, transformOrigin: '50% 50%' }, { rotation: 12, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: Math.max(1, Math.ceil((t1 - t0) / 0.3)) }, t0);
}

// ---------------- sets
function moBurst(id: string, c1 = MO.bg1, c2 = MO.bg2, cx = 540, cy = 1050, floor = true) {
  let w = ''; for (let i = 0; i < 24; i += 2) { const a = i / 24 * Math.PI * 2, b = (i + 1) / 24 * Math.PI * 2, R = 2400; w += `<path d="M0 0 L${(Math.cos(a) * R).toFixed(0)} ${(Math.sin(a) * R).toFixed(0)} L${(Math.cos(b) * R).toFixed(0)} ${(Math.sin(b) * R).toFixed(0)}Z" fill="${c2}"/>`; }
  return `<rect width="1080" height="1920" fill="${c1}"/><g transform="translate(${cx} ${cy})"><g id="${id}">${w}</g></g>
    <circle cx="540" cy="1000" r="1250" fill="none" stroke="#e7a95a" stroke-width="900" opacity="0.28"/><circle cx="540" cy="1000" r="980" fill="none" stroke="#e7a95a" stroke-width="300" opacity="0.14"/>
    ${floor ? '<rect x="0" y="1520" width="1080" height="400" fill="#f1c98a"/><rect x="0" y="1520" width="1080" height="16" fill="#e2ad6a"/><rect x="0" y="1600" width="1080" height="320" fill="#000" opacity="0.05"/>' : ''}`;
}
function moPrint() {   // the plain backdrop (its colours are set per scene in visuals.ts, MV_BG): plain (no lines), a soft spotlight behind the pieces, dark corners and a floor
  const dust = [...Array(18)].map((_, i) => `<circle cx="${(i * 211) % 1080}" cy="${520 + ((i * 337) % 1100)}" r="${3 + (i % 3) * 2}" fill="#bff0f7" opacity="${0.2 + (i % 3) * 0.1}"/>`).join('');
  return `<rect id="bd0" width="1080" height="1920" fill="#2b8394"/><circle id="bd1" cx="540" cy="1050" r="600" fill="#3a97a8" opacity="0.8"/><circle id="bd2" cx="540" cy="1050" r="400" fill="#4aa7b6" opacity="0.6"/>
    <circle id="bd3" cx="540" cy="1000" r="1250" fill="none" stroke="#124e5c" stroke-width="900" opacity="0.45"/>
    <rect id="bd4" x="0" y="1540" width="1080" height="380" fill="#1f6878"/><rect id="bd5" x="0" y="1540" width="1080" height="12" fill="#57b4c2"/><g class="dust">${dust}</g>`;
}
// dust drifts up slowly in the blueprint set
const moDust = (tl: gsap.core.Timeline, $: (q: string) => string, s: Scene) =>
  tl.fromTo($('.dust circle'), { y: 0, x: 0 }, { y: -140, x: 30, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
const moBurstSpin = (tl: gsap.core.Timeline, $: (q: string) => string, id: string, s: Scene) =>
  tl.fromTo($('#' + id), { rotation: 0, svgOrigin: '0 0' }, { rotation: 10, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
// camera: slow push-in of a wrapper group over the scene
const moCam = (tl: gsap.core.Timeline, sel: string, s: Scene, from = 1, to = 1.04, origin = '540 1100') =>
  tl.fromTo(sel, { scale: from, svgOrigin: origin }, { scale: to, duration: s.t1 - s.t0, ease: 'sine.inOut' }, s.t0);

// ---------------- visual language
function moTag(id: string, x: number, y: number, text: string, c = '#e8622a', fs = 44) {
  const w = text.length * fs * 0.62 + 56;
  return `<g id="${id}"><g transform="translate(${x} ${y})"><rect x="${-w / 2 + 6}" y="-30" width="${w}" height="76" rx="38" fill="#000" opacity="0.25"/>${moVol((a) => `<rect x="${-w / 2}" y="-38" width="${w}" height="76" rx="38" ${a}/>`, c, { sx: 0, sy: 10, k: 0.22, sw: 6, hi: `<rect x="${-w / 2 + 24}" y="-30" width="${w * 0.4}" height="10" rx="5" fill="#fff" opacity="0.35"/>` })}
    <text x="0" y="${fs * 0.36}" text-anchor="middle" font-size="${fs}" font-weight="900" fill="#fff" style="font-family: var(--font), system-ui, sans-serif; letter-spacing: 1px">${text}</text></g></g>`;
}
const moPopIn = (tl: gsap.core.Timeline, sel: string, t: number) => {
  tl.fromTo(sel, { scaleX: 0, scaleY: 0, opacity: 0, rotation: -8, transformOrigin: '50% 50%' }, { keyframes: [{ scaleX: 1.2, scaleY: 0.85, opacity: 1, rotation: 4, duration: 0.16, ease: 'power2.out' }, { scaleX: 0.95, scaleY: 1.06, rotation: -2, duration: 0.12 }, { scaleX: 1, scaleY: 1, rotation: 0, duration: 0.1 }] }, t);
  tl.to(sel, { rotation: 2.5, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: 5 }, t + 0.4);
};
function moQuestion(id: string, x: number, y: number, s = 1) {
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})"><rect x="-98" y="-104" width="220" height="240" rx="36" fill="#000" opacity="0.22"/>${moVol((a) => `<rect x="-110" y="-120" width="220" height="240" rx="36" ${a}/>`, MO.dShirt, { sx: 18, sy: 18, sw: 10, hi: moShine(-60, -80, 30, 14, 0.45) })}
    <text x="0" y="70" text-anchor="middle" font-size="210" font-weight="900" fill="${MO.o}" style="font-family: var(--font), system-ui, sans-serif">?</text></g></g>`;
}
function moSpark(id: string, x: number, y: number, s = 1) {
  let d = ''; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = i % 2 ? 22 : 60; d += `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)} `; }
  return `<g id="${id}" opacity="0"><g transform="translate(${x} ${y}) scale(${s})"><path d="${d}Z" fill="#fff36b" stroke="${MO.o}" stroke-width="6" stroke-linejoin="round"/><circle r="12" fill="#fff"/></g></g>`;
}
function moBoom(id: string, x: number, y: number, s = 1) {
  const burst = (r1: number, r2: number, n: number) => { let d = ''; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2 + 0.2, r = i % 2 ? r2 : r1; d += `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)} `; } return d + 'Z'; };
  return `<g id="${id}" opacity="0"><g transform="translate(${x} ${y}) scale(${s})"><path d="${burst(130, 70, 11)}" fill="${MO.fire}" stroke="${MO.o}" stroke-width="8" stroke-linejoin="round"/><path d="${burst(80, 42, 9)}" fill="#ffd23d"/><circle r="26" fill="#fff6c8"/></g></g>`;
}
// flash a spark (0.25 s) or a boom (0.4 s) at t
const moFlash = (tl: gsap.core.Timeline, sel: string, t: number, d = 0.25) =>
  tl.fromTo(sel, { opacity: 0, scale: 0.2, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1.15, duration: d * 0.5, ease: 'power2.out' }, t).to(sel, { opacity: 0, scale: 1.3, duration: d * 0.5, ease: 'power1.in' }, t + d * 0.5);
function moSmoke(id: string, x: number, y: number, s = 1, c = '#9aa3b2') {
  return `<g id="${id}" opacity="0"><g transform="translate(${x} ${y}) scale(${s})">${moVol((a) => `<circle cx="-34" cy="0" r="34" ${a}/>`, c, { sx: 8, sy: 8, sw: 6 })}${moVol((a) => `<circle cx="20" cy="-22" r="42" ${a}/>`, c, { sx: 10, sy: 10, sw: 6 })}${moVol((a) => `<circle cx="52" cy="10" r="28" ${a}/>`, c, { sx: 7, sy: 7, sw: 6 })}<circle cx="-2" cy="14" r="30" fill="${c}"/></g></g>`;
}
// a puff that rises and fades (0.9 s)
const moPuff = (tl: gsap.core.Timeline, sel: string, t: number, dy = -160) =>
  tl.fromTo(sel, { opacity: 0, y: 0, scale: 0.5, transformOrigin: '50% 50%' }, { keyframes: [{ opacity: 0.95, scale: 0.7, y: dy * 0.1, duration: 0.1 }, { opacity: 0, y: dy, scale: 1.3, duration: 0.8, ease: 'power1.out' }] }, t);
function moArrow(id: string, x1: number, y1: number, x2: number, y2: number, c: string, w = 22) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.2, bx = x2 - Math.cos(a) * h * 0.7, by = y2 - Math.sin(a) * h * 0.7;
  return `<g id="${id}"><line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}" stroke="${MO.o}" stroke-width="${w + 12}" stroke-linecap="round"/>
    <path d="M${x2} ${y2} L${x2 - Math.cos(a - 0.55) * h} ${y2 - Math.sin(a - 0.55) * h} L${x2 - Math.cos(a + 0.55) * h} ${y2 - Math.sin(a + 0.55) * h} Z" fill="${c}" stroke="${MO.o}" stroke-width="6" stroke-linejoin="round"/>
    <line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/></g>`;
}
// a curved "goes around" arrow (for rotation) centred at (cx, cy)
function moSpinArrow(id: string, cx: number, cy: number, r: number, c = MO.dShirt) {
  const p = (a: number) => `${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`, a1 = -2.6, a2 = 0.9;
  const tip = { x: cx + Math.cos(a2) * r, y: cy + Math.sin(a2) * r }, tg = a2 + Math.PI / 2;
  return `<g id="${id}"><path d="M${p(a1)} A${r} ${r} 0 1 1 ${p(a2)}" stroke="${MO.o}" stroke-width="34" fill="none" stroke-linecap="round"/><path d="M${p(a1)} A${r} ${r} 0 1 1 ${p(a2)}" stroke="${c}" stroke-width="20" fill="none" stroke-linecap="round"/>
    <path d="M${(tip.x + Math.cos(tg) * 40).toFixed(1)} ${(tip.y + Math.sin(tg) * 40).toFixed(1)} L${(tip.x + Math.cos(tg + 2.3) * 36).toFixed(1)} ${(tip.y + Math.sin(tg + 2.3) * 36).toFixed(1)} L${(tip.x + Math.cos(tg - 2.3) * 36).toFixed(1)} ${(tip.y + Math.sin(tg - 2.3) * 36).toFixed(1)}Z" fill="${c}" stroke="${MO.o}" stroke-width="6" stroke-linejoin="round"/></g>`;
}

// ---------------- the engine cutaway: everything posed from ONE crank angle a (degrees, 0 = piston at the top, 0–720 = 4 strokes)
const MOE = { cx: 540, cy: 1300, r: 80, L: 250, top: 880, vIn: 470, vEx: 610, camY: 700 };
interface MoEngineOpts { head?: boolean; valves?: boolean; cams?: boolean; plug?: boolean; rod?: boolean; fly?: boolean; pipes?: boolean; a?: number }
function moEngine(id: string, o: MoEngineOpts = {}) {
  const { cx, cy, top, vIn, vEx, camY } = MOE, O = MO.o, sw = MO_SW;
  const valve = (vid: string, x: number) => `<g id="${id}-${vid}"><g id="${id}-${vid}M"><rect x="${x - 7}" y="${camY + 44}" width="14" height="${top - camY - 44}" fill="${MO.steelD}" stroke="${O}" stroke-width="5"/>
    <path d="M${x - 34} ${top + 4} L${x + 34} ${top + 4} L${x + 12} ${top - 12} L${x - 12} ${top - 12}Z" fill="${MO.steel}" stroke="${O}" stroke-width="6" stroke-linejoin="round"/></g></g>`;
  const cam = (cid: string, x: number) => `<g id="${id}-${cid}"><g id="${id}-${cid}M"><path d="M${x - 36} ${camY} A36 36 0 0 1 ${x + 36} ${camY} L${x + 14} ${camY + 72} A16 16 0 0 1 ${x - 14} ${camY + 72}Z" fill="${MO.steel}" stroke="${O}" stroke-width="${sw}" stroke-linejoin="round"/><circle cx="${x}" cy="${camY}" r="10" fill="${O}"/></g></g>`;
  let fly = ''; if (o.fly) { let teeth = ''; for (let i = 0; i < 36; i++) teeth += `<rect x="-7" y="-252" width="14" height="22" fill="${MO.iron}" stroke="${O}" stroke-width="4" transform="rotate(${i * 10})"/>`;
    fly = `<g id="${id}-fly"><g id="${id}-flyM" transform="translate(${cx} ${cy})">${teeth}${moVol((a) => `<circle r="232" ${a}/>`, MO.iron, { sx: 40, sy: 40, k: 0.25 })}<circle r="200" fill="#6f7a8e"/><path d="M-150 -110 A186 186 0 0 1 60 -178" stroke="#fff" stroke-width="12" fill="none" opacity="0.3" stroke-linecap="round"/>${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${Math.cos(i * Math.PI / 3) * 140}" cy="${Math.sin(i * Math.PI / 3) * 140}" r="26" fill="${MO.iron}" stroke="${O}" stroke-width="5"/>`).join('')}</g></g>`; }
  return `<g id="${id}">${fly}
    <g id="${id}-mix" opacity="0"><rect x="430" y="${top}" width="220" height="10" fill="${MO.gas}" opacity="0.75"/></g>
    <g id="${id}-walls"><rect x="398" y="${top}" width="32" height="340" fill="${MO.steel}" stroke="${O}" stroke-width="${sw}"/><rect x="650" y="${top}" width="32" height="340" fill="${MO.steel}" stroke="${O}" stroke-width="${sw}"/>
      <rect x="412" y="${top + 8}" width="10" height="320" fill="${MO.steelL}"/><rect x="664" y="${top + 4}" width="14" height="332" fill="#000" opacity="0.15"/></g>
    <rect x="430" y="${top}" width="220" height="340" fill="#0b1226" opacity="0.18"/>
    <g id="${id}-crank"><g id="${id}-crankM" transform="translate(${cx} ${cy})">${moVol((a) => `<path d="M-105 0 A105 105 0 0 0 105 0 L60 -30 L60 -90 A26 26 0 0 0 -60 -90 L-60 -30Z" ${a}/>`, MO.iron, { sx: 16, sy: 16, k: 0.25, hi: moShine(-55, -40, 18, 8, 0.35) })}
      <circle r="34" fill="${MO.steel}" stroke="${O}" stroke-width="${sw}"/><circle cx="0" cy="-${MOE.r}" r="24" fill="${MO.steelL}" stroke="${O}" stroke-width="6"/></g></g>
    <g id="${id}-rodG"${moVis(o.rod !== false)}><line id="${id}-rodO" x1="${cx}" y1="0" x2="${cx}" y2="0" stroke="${O}" stroke-width="54" stroke-linecap="round"/><line id="${id}-rod" x1="${cx}" y1="0" x2="${cx}" y2="0" stroke="${MO.steelD}" stroke-width="38" stroke-linecap="round"/></g>
    <g id="${id}-piston"><g id="${id}-pistonM">${moVol((a) => `<rect x="434" y="-45" width="212" height="110" rx="10" ${a}/>`, MO.steel, { sx: 30, sy: 14, k: 0.22, hi: `<rect x="450" y="-36" width="70" height="10" rx="5" fill="#fff" opacity="0.6"/>` })}
      <line x1="434" y1="-22" x2="646" y2="-22" stroke="${O}" stroke-width="5"/><line x1="434" y1="-6" x2="646" y2="-6" stroke="${O}" stroke-width="5"/><circle cx="${cx}" cy="0" r="0"/><circle cx="${cx}" cy="25" r="16" fill="${MO.steelL}" stroke="${O}" stroke-width="5"/></g></g>
    <g id="${id}-head"${moVis(o.head !== false)}><path d="M398 ${top} L398 ${top - 80} L682 ${top - 80} L682 ${top} L${vEx + 34} ${top} L${vEx + 22} ${top - 26} L${vEx - 22} ${top - 26} L${vEx - 34} ${top} L${vIn + 34} ${top} L${vIn + 22} ${top - 26} L${vIn - 22} ${top - 26} L${vIn - 34} ${top}Z" fill="#aab6c8" stroke="${O}" stroke-width="${sw}" stroke-linejoin="round"/><rect x="410" y="${top - 72}" width="260" height="12" rx="6" fill="#fff" opacity="0.35"/><rect x="404" y="${top - 30}" width="272" height="10" fill="#000" opacity="0.12"/></g>
    <g id="${id}-pipes"${moVis(!!o.pipes)}><path d="M300 ${top - 46} L${vIn - 26} ${top - 46}" stroke="${O}" stroke-width="56" stroke-linecap="round"/><path d="M300 ${top - 46} L${vIn - 26} ${top - 46}" stroke="#aab6c8" stroke-width="40" stroke-linecap="round"/>
      <path d="M${vEx + 26} ${top - 46} L780 ${top - 46}" stroke="${O}" stroke-width="56" stroke-linecap="round"/><path d="M${vEx + 26} ${top - 46} L780 ${top - 46}" stroke="#aab6c8" stroke-width="40" stroke-linecap="round"/></g>
    <g id="${id}-valves"${moVis(!!o.valves)}>${valve('vIn', vIn)}${valve('vEx', vEx)}</g>
    <g id="${id}-cams"${moVis(!!o.cams)}><line x1="${vIn - 60}" y1="${camY}" x2="${vEx + 60}" y2="${camY}" stroke="${O}" stroke-width="16" stroke-linecap="round"/>${cam('camIn', vIn)}${cam('camEx', vEx)}</g>
    <g id="${id}-plug"${moVis(!!o.plug)}><rect x="${cx - 9}" y="${top - 30}" width="18" height="42" fill="${MO.steelD}" stroke="${O}" stroke-width="5"/><rect x="${cx - 24}" y="${top - 70}" width="48" height="40" rx="6" fill="${MO.iron}" stroke="${O}" stroke-width="6"/>
      ${moVol((a) => `<rect x="${cx - 18}" y="${top - 160}" width="36" height="92" rx="14" ${a}/>`, '#fff', { sx: 10, sy: 0, k: 0.15, sw: 6 })}<rect x="${cx - 8}" y="${top - 186}" width="16" height="28" rx="5" fill="${MO.steelD}" stroke="${O}" stroke-width="5"/></g>
    ${moSpark(`${id}-spark`, cx, top + 26, 0.7)}${moBoom(`${id}-boom`, cx, top + 50, 0.85)}
  </g>`;
}
// valve lift (0..1) for a crank angle: intake opens in 0–180, exhaust in 540–720
const moLift = (a: number, from: number) => { const x = (((a % 720) + 720) % 720 - from) / 180; return x > 0 && x < 1 ? Math.sin(x * Math.PI) : 0; };
function moEnginePose(q: (s: string) => string, id: string, a: number, o: { valves?: boolean; mix?: boolean; stuckEx?: number } = {}) {
  const { cx, cy, r, L } = MOE, th = a * Math.PI / 180;
  const px = cx + r * Math.sin(th), py = cy - r * Math.cos(th), pinY = py - Math.sqrt(L * L - (px - cx) ** 2);
  const el = (s: string) => document.querySelector(q(`#${id}-${s}`));
  el('pistonM')?.setAttribute('transform', `translate(0 ${pinY.toFixed(2)})`);
  for (const n of ['rod', 'rodO']) { const e = el(n); if (e) { e.setAttribute('x1', String(cx)); e.setAttribute('y1', (pinY + 25).toFixed(2)); e.setAttribute('x2', px.toFixed(2)); e.setAttribute('y2', py.toFixed(2)); } }
  el('crankM')?.setAttribute('transform', `translate(${cx} ${cy}) rotate(${a.toFixed(2)})`);
  el('flyM')?.setAttribute('transform', `translate(${cx} ${cy}) rotate(${a.toFixed(2)})`);
  // cams turn at half the crank speed, lobes pointing down when their valve is fully open
  el('camInM')?.setAttribute('transform', `rotate(${(a / 2 - 45).toFixed(2)} ${MOE.vIn} ${MOE.camY})`);
  el('camExM')?.setAttribute('transform', `rotate(${(a / 2 - 315).toFixed(2)} ${MOE.vEx} ${MOE.camY})`);
  if (o.valves !== false) {
    el('vInM')?.setAttribute('transform', `translate(0 ${(moLift(a, 0) * 36).toFixed(2)})`);
    el('vExM')?.setAttribute('transform', `translate(0 ${(o.stuckEx ?? moLift(a, 540) * 36).toFixed(2)})`);
  }
  if (o.mix) {   // the mixture fills the space above the piston; blue going in, compressed, fire, grey going out
    const m = el('mix'), rect = m?.firstElementChild, ph = (((a % 720) + 720) % 720) / 180;
    if (m && rect) { const h = Math.max(0, pinY - 45 - MOE.top); rect.setAttribute('height', h.toFixed(1));
      rect.setAttribute('fill', ph < 2 ? MO.gas : ph < 3 ? MO.fire : '#9aa3b2'); m.setAttribute('opacity', ph < 1 ? String(0.45 + 0.4 * ph) : '0.85'); }
  }
}
// turns the engine from angle a0 to a1 between t and t + d
function moTurn(tl: gsap.core.Timeline, $: (q: string) => string, id: string, a0: number, a1: number, t: number, d: number, ease = 'none', o: { valves?: boolean; mix?: boolean; stuckEx?: number } = {}) {
  const p = { a: a0 };
  tl.fromTo(p, { a: a0 }, { a: a1, duration: d, ease, onUpdate: () => moEnginePose($, id, p.a, o), onStart: () => moEnginePose($, id, p.a, o) }, t);
  if (d > 0.8 && a1 !== a0) tl.fromTo($(`#${id}-walls, #${id}-head, #${id}-plug, #${id}-pipes`), { y: 0 }, { y: -3, duration: 0.05, ease: 'none', yoyo: true, repeat: Math.floor(d / 0.05), immediateRender: false }, t);
}
// sparks every time the angle crosses 360 (+720k) between a0 and a1, over [t, t + d], linear turn
function moSparks(tl: gsap.core.Timeline, $: (q: string) => string, id: string, a0: number, a1: number, t: number, d: number, boom = true) {
  for (let k = Math.ceil((a0 - 360) / 720); 360 + k * 720 <= a1; k++) {
    const ts = t + ((360 + k * 720 - a0) / (a1 - a0)) * d; moFlash(tl, $(`#${id}-spark`), ts - 0.05, 0.2); if (boom) moFlash(tl, $(`#${id}-boom`), ts + 0.03, 0.35);
  }
}

// ---------------- the timing belt, front view: big cam pulley on top, small crank pulley below
const MOT = { cx: 540, cy1: 760, R: 120, cy2: 1320, r: 62 };
function moBeltPath() {
  const { cx, cy1, R, cy2, r } = MOT, d = cy2 - cy1, ph = Math.asin((R - r) / d);
  const p = (x: number, y: number, rad: number, a: number) => `${(x + Math.cos(a) * rad).toFixed(1)} ${(y + Math.sin(a) * rad).toFixed(1)}`;
  const aR = -ph, aL = Math.PI + ph;   // tangent points (right and left)
  return `M${p(cx, cy1, R, aR)} L${p(cx, cy2, r, aR)} A${r} ${r} 0 0 1 ${p(cx, cy2, r, aL)} L${p(cx, cy1, R, aL)} A${R} ${R} 0 0 1 ${p(cx, cy1, R, aR)}Z`;
}
function moPulley(id: string, x: number, y: number, R: number, c = MO.steel) {
  return `<g id="${id}"><g transform="translate(${x} ${y})"><circle r="${R}" cx="10" cy="14" fill="#000" opacity="0.25"/><g id="${id}M">${moVol((a) => `<circle r="${R}" ${a}/>`, c, { sx: R * 0.16, sy: R * 0.16, k: 0.22 })}<circle r="${R * 0.72}" fill="${MO.steelL}" stroke="${MO.o}" stroke-width="5"/>
    ${[0, 1, 2, 3].map((i) => `<circle cx="${Math.cos(i * Math.PI / 2) * R * 0.45}" cy="${Math.sin(i * Math.PI / 2) * R * 0.45}" r="${R * 0.12}" fill="${MO.steelD}" stroke="${MO.o}" stroke-width="4"/>`).join('')}
    <circle r="${R * 0.18}" fill="${MO.iron}" stroke="${MO.o}" stroke-width="5"/><path d="M0 ${-R + 4} L-12 ${-R + 26} L12 ${-R + 26}Z" fill="${MO.red}"/></g></g></g>`;
}
function moTiming(id: string, hidden = false) {
  const { cx, cy1, R, cy2, r } = MOT, belt = moBeltPath();
  return `<g id="${id}">
    <rect x="318" y="622" width="480" height="860" rx="40" fill="#000" opacity="0.3"/>${moVol((a) => `<rect x="300" y="600" width="480" height="860" rx="40" ${a}/>`, '#8e9bb0', { sx: 24, sy: 24, k: 0.22 })}<rect x="330" y="630" width="420" height="800" rx="28" fill="#a7b3c6"/><rect x="350" y="650" width="40" height="760" rx="20" fill="#fff" opacity="0.18"/>
    ${moPulley(`${id}-cam`, cx, cy1, R)}${moPulley(`${id}-crk`, cx, cy2, r, MO.iron)}
    <g id="${id}-belt"><path d="${belt}" fill="none" stroke="${MO.o}" stroke-width="40" stroke-linejoin="round"/><path id="${id}-beltC" d="${belt}" fill="none" stroke="#3b3f4a" stroke-width="26" stroke-linejoin="round"/>
      <path id="${id}-teeth" d="${belt}" fill="none" stroke="#6d7385" stroke-width="12" stroke-dasharray="14 14" stroke-linejoin="round"/></g>
    <g id="${id}-glow" opacity="0"><path d="${belt}" fill="none" stroke="${MO.dShirt}" stroke-width="64" stroke-linejoin="round" opacity="0.55"/></g>
    <g id="${id}-broken" opacity="0"><path d="M${cx + R - 6} ${cy1 + 30} C ${cx + R + 30} ${cy1 + 200}, ${cx + 150} ${cy1 + 330}, ${cx + 200} ${cy1 + 420}" fill="none" stroke="${MO.o}" stroke-width="40" stroke-linecap="round"/><path d="M${cx + R - 6} ${cy1 + 30} C ${cx + R + 30} ${cy1 + 200}, ${cx + 150} ${cy1 + 330}, ${cx + 200} ${cy1 + 420}" fill="none" stroke="#3b3f4a" stroke-width="26" stroke-linecap="round"/>
      <path d="M${cx - r} ${cy2 + 10} C ${cx - r - 60} ${cy2 - 120}, ${cx - 180} ${cy2 - 240}, ${cx - 230} ${cy2 - 300}" fill="none" stroke="${MO.o}" stroke-width="40" stroke-linecap="round"/><path d="M${cx - r} ${cy2 + 10} C ${cx - r - 60} ${cy2 - 120}, ${cx - 180} ${cy2 - 240}, ${cx - 230} ${cy2 - 300}" fill="none" stroke="#3b3f4a" stroke-width="26" stroke-linecap="round"/></g>
    <g id="${id}-qm"${moVis(hidden)}><rect x="330" y="630" width="420" height="800" rx="28" fill="#3d2466" stroke="${MO.o}" stroke-width="${MO_SW}"/>${moQuestion(`${id}-q`, cx, 1040, 1.2)}</g>
  </g>`;
}
// the belt runs (teeth slide) and the pulleys turn: crank 2 turns for every cam turn
function moBeltRun(tl: gsap.core.Timeline, $: (q: string) => string, id: string, t: number, d: number, crankTurns = 2) {
  const len = 2 * Math.PI * MOT.r * crankTurns;
  tl.fromTo($(`#${id}-teeth`), { strokeDashoffset: 0 }, { strokeDashoffset: -len, duration: d, ease: 'none' }, t);
  tl.fromTo($(`#${id}-crkM`), { rotation: 0, svgOrigin: '0 0' }, { rotation: 360 * crankTurns, duration: d, ease: 'none' }, t);
  tl.fromTo($(`#${id}-camM`), { rotation: 0, svgOrigin: '0 0' }, { rotation: 180 * crankTurns, duration: d, ease: 'none' }, t);
}

// ---------------- props
function moWheel(id: string, x: number, y: number, s = 1) {
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})"><circle r="120" fill="none" stroke="${MO.o}" stroke-width="44"/><circle r="120" fill="none" stroke="#3b3f4a" stroke-width="28"/>
    ${moLimb(-110, 10, 110, 10, 22, '#3b3f4a')}${moLimb(0, 10, 0, 112, 22, '#3b3f4a')}<circle r="40" fill="#6d7385" stroke="${MO.o}" stroke-width="${MO_SW}"/><circle r="14" fill="${MO.red}"/></g></g>`;
}
function moTable(id: string, y: number, x0 = 140, x1 = 940) {
  const lh = Math.min(230, 1595 - y - 40);
  return `<g id="${id}"><rect x="${x0 + 40}" y="${y + 40}" width="40" height="${lh}" fill="#8a5a3b" stroke="${MO.o}" stroke-width="${MO_SW}"/><rect x="${x1 - 80}" y="${y + 40}" width="40" height="${lh}" fill="#8a5a3b" stroke="${MO.o}" stroke-width="${MO_SW}"/>
    <rect x="${x0 + 20}" y="${y + 50}" width="${x1 - x0 - 40}" height="18" fill="#000" opacity="0.18"/>${moVol((a) => `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="50" rx="10" ${a}/>`, '#b97a4a', { sx: 0, sy: 14, k: 0.2 })}<rect x="${x0 + 12}" y="${y + 8}" width="${x1 - x0 - 24}" height="10" rx="5" fill="#d79a68"/></g>`;
}
// a plain metal tube standing up (cutaway), base at (x, y)
function moTube(id: string, x: number, y: number, h = 300, w = 220) {
  return `<g id="${id}"><rect x="${x - w / 2 - 32}" y="${y - h}" width="32" height="${h}" fill="${MO.steel}" stroke="${MO.o}" stroke-width="${MO_SW}"/><rect x="${x + w / 2}" y="${y - h}" width="32" height="${h}" fill="${MO.steel}" stroke="${MO.o}" stroke-width="${MO_SW}"/>
    <rect x="${x - w / 2 - 32}" y="${y - h - 30}" width="${w + 64}" height="34" rx="6" fill="#aab6c8" stroke="${MO.o}" stroke-width="${MO_SW}"/><rect x="${x - w / 2 - 22}" y="${y - h + 10}" width="10" height="${h - 20}" fill="${MO.steelL}"/><rect x="${x + w / 2 + 16}" y="${y - h + 4}" width="12" height="${h - 8}" fill="#000" opacity="0.15"/><rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" fill="#000" opacity="0.06"/></g>`;
}
function moDrop(id: string, x: number, y: number, s = 1, c = '#ffb02e') {
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -60 C 30 -20, 44 4, 44 24 A44 44 0 0 1 -44 24 C -44 4, -30 -20, 0 -60Z" fill="${c}" stroke="${MO.o}" stroke-width="7"/><ellipse cx="-14" cy="18" rx="9" ry="14" fill="#fff" opacity="0.6"/></g></g>`;
}
function moHeat(id: string, x: number, y: number, n = 3) {
  return `<g id="${id}" opacity="0">${[...Array(n)].map((_, i) => `<path d="M${x + (i - (n - 1) / 2) * 70} ${y} q 22 -30 0 -60 q -22 -30 0 -60 q 22 -30 0 -60" fill="none" stroke="${MO.red}" stroke-width="14" stroke-linecap="round"/>`).join('')}</g>`;
}
function moRadiator(id: string, x: number, y: number) {
  let fins = ''; for (let i = 0; i < 9; i++) fins += `<line x1="${x - 110 + i * 27.5}" y1="${y - 170}" x2="${x - 110 + i * 27.5}" y2="${y + 170}" stroke="${MO.o}" stroke-width="7"/>`;
  return `<g id="${id}"><rect x="${x - 126}" y="${y - 184}" width="280" height="400" rx="20" fill="#000" opacity="0.28"/>${moVol((a) => `<rect x="${x - 140}" y="${y - 200}" width="280" height="400" rx="20" ${a}/>`, '#9fb0c8', { sx: 18, sy: 18 })}<rect x="${x - 120}" y="${y - 180}" width="240" height="360" fill="#c7d3e2"/>${fins}</g>`;
}
function moManual(id: string, x: number, y: number, s = 1) {
  const lines = (x0: number) => [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${x0}" y="${-110 + i * 42}" width="${i === 3 ? 170 : 150 - (i % 2) * 30}" height="14" rx="7" fill="${MO.steelD}"/>`).join('');
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -170 L-240 -190 L-240 170 L0 190 L240 170 L240 -190Z" fill="${MO.o}"/>
    <path d="M0 -160 L-226 -178 L-226 160 L0 178Z" fill="#fffaf0" stroke="${MO.o}" stroke-width="6"/><path d="M0 -160 L226 -178 L226 160 L0 178Z" fill="#fffaf0" stroke="${MO.o}" stroke-width="6"/>
    <text x="-113" y="-130" text-anchor="middle" font-size="30" font-weight="900" fill="${MO.o}" style="font-family: var(--font), system-ui, sans-serif">MANUAL</text>${lines(-200)}${lines(30)}
    <rect id="${id}-hl" x="22" y="10" width="190" height="34" rx="10" fill="${MO.dShirt}" opacity="0"/><rect x="30" y="16" width="170" height="14" rx="7" fill="${MO.red}"/></g></g>`;
}
function moCar(id: string, x: number, y: number, s = 1) {
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="98" rx="290" ry="18" fill="#000" opacity="0.18"/>${moVol((a) => `<path d="M-260 40 L-260 -40 Q-250 -70 -200 -76 L-120 -80 L-60 -150 L110 -150 L180 -80 L250 -70 Q270 -60 270 -20 L270 40Z" ${a}/>`, MO.red, { sx: 0, sy: 26, k: 0.22, hi: `<rect x="-230" y="-66" width="420" height="10" rx="5" fill="#fff" opacity="0.4"/>` })}
    <path d="M-40 -136 L-90 -84 L10 -84 L10 -136Z M30 -136 L30 -84 L150 -84 L104 -136Z" fill="#bfe3ff" stroke="${MO.o}" stroke-width="6" stroke-linejoin="round"/>
    <g id="${id}-w1"><g transform="translate(-160 40)"><circle r="56" fill="#3b3f4a" stroke="${MO.o}" stroke-width="${MO_SW}"/><circle r="24" fill="${MO.steel}" stroke="${MO.o}" stroke-width="5"/><rect x="-4" y="-50" width="8" height="26" fill="${MO.steel}"/></g></g>
    <g id="${id}-w2"><g transform="translate(170 40)"><circle r="56" fill="#3b3f4a" stroke="${MO.o}" stroke-width="${MO_SW}"/><circle r="24" fill="${MO.steel}" stroke="${MO.o}" stroke-width="5"/><rect x="-4" y="-50" width="8" height="26" fill="${MO.steel}"/></g></g></g></g>`;
}
// the Idio-two convertible: Tico (tid) driving, Dota (did) co-pilot on the far seat, plate on the back. Faces right.
function moCarIdio(id: string, tid: string, did: string, x: number, y: number, s = 1, plate = 'IDIO-TWO') {
  const O = MO.o, wheel = (wid: string, wx: number) => `<g id="${id}-${wid}"><g transform="translate(${wx} 40)">${moVol((a) => `<circle r="56" ${a}/>`, '#3b3f4a', { sx: 10, sy: 10 })}<circle r="24" fill="${MO.steel}" stroke="${O}" stroke-width="5"/><rect x="-4" y="-50" width="8" height="26" fill="${MO.steel}"/></g></g>`;
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="98" rx="290" ry="18" fill="#000" opacity="0.18"/>
    ${moDota(did, -150, 5, 0.42, 'up')}
    ${moTico(tid, 40, 30, 0.45, 'hold')}
    <g transform="translate(150 -92) rotate(-18)"><ellipse rx="14" ry="44" fill="none" stroke="${O}" stroke-width="16"/><ellipse rx="14" ry="44" fill="none" stroke="#3b3f4a" stroke-width="8"/></g>
    <path d="M150 -80 L188 -168 L204 -168 L172 -80Z" fill="#bfe3ff" opacity="0.7" stroke="${O}" stroke-width="6" stroke-linejoin="round"/>
    ${moVol((a) => `<path d="M-260 40 L-260 -40 Q-252 -80 -205 -82 L250 -82 Q272 -70 272 -20 L272 40Z" ${a}/>`, MO.red, { sx: 0, sy: 26, k: 0.22, hi: `<rect x="-232" y="-72" width="440" height="10" rx="5" fill="#fff" opacity="0.4"/>` })}
    <path d="M-20 -78 L-20 30" stroke="${O}" stroke-width="5" opacity="0.6"/><rect x="0" y="-50" width="44" height="12" rx="6" fill="#7a1f1f" stroke="${O}" stroke-width="4"/>
    <circle cx="258" cy="-38" r="14" fill="#fff6c8" stroke="${O}" stroke-width="5"/>
    <g id="${id}-plate"><rect x="-258" y="-74" width="168" height="50" rx="8" fill="#fffaf0" stroke="${O}" stroke-width="6"/>
      <text x="-174" y="-40" text-anchor="middle" font-size="27" font-weight="900" fill="${O}" style="font-family: var(--font), system-ui, sans-serif; letter-spacing: 1px">${plate}</text></g>
    ${wheel('w1', -160)}${wheel('w2', 170)}
  </g></g>`;
}
// the channel logo like the banner: "Idio" blue, "-" orange, "two" yellow, thick dark outline and a soft drop shadow
function moLogo(id: string, x: number, y: number, fs = 200) {
  const t = (fill: string, dx = 0, dy = 0, extra = '') => `<text x="${x + dx}" y="${y + dy}" text-anchor="middle" font-size="${fs}" font-weight="900" letter-spacing="-4" ${extra} style="font-family: var(--font), system-ui, sans-serif">${fill}</text>`;
  const spans = `<tspan fill="${MO.tShirt}">Idio</tspan><tspan fill="#e8622a">-</tspan><tspan fill="${MO.dShirt}">two</tspan>`;
  return `<g id="${id}">${t('Idio-two', 10, 14, `fill="#000" opacity="0.16"`)}${t(spans, 0, 0, `stroke="${MO.o}" stroke-width="${fs * 0.09}" stroke-linejoin="round" paint-order="stroke"`)}</g>`;
}
// a big call-out on a pill (the "¡SUSCRÍBANSE!" above the logo)
function moCallout(id: string, x: number, y: number, text: string, c = MO.red, fs = 74) {
  const w = text.length * fs * 0.66 + 90;
  return `<g id="${id}"><g transform="translate(${x} ${y})"><rect x="${-w / 2 + 8}" y="-50" width="${w}" height="112" rx="56" fill="#000" opacity="0.22"/>
    ${moVol((a) => `<rect x="${-w / 2}" y="-58" width="${w}" height="112" rx="56" ${a}/>`, c, { sx: 0, sy: 14, k: 0.22, sw: 9, hi: `<rect x="${-w / 2 + 34}" y="-46" width="${w * 0.45}" height="14" rx="7" fill="#fff" opacity="0.35"/>` })}
    <text x="0" y="${fs * 0.36}" text-anchor="middle" font-size="${fs}" font-weight="900" fill="#fff" stroke="${MO.o}" stroke-width="10" stroke-linejoin="round" paint-order="stroke" style="font-family: var(--font), system-ui, sans-serif">${text}</text></g></g>`;
}
// one of the 4 strokes: a small card with a mini cylinder and its word
function moStroke(id: string, x: number, y: number, word: string, c: string, pistonUp: boolean) {
  const py = pistonUp ? -40 : 30;
  return `<g id="${id}"><g transform="translate(${x} ${y})"><rect x="-96" y="-136" width="216" height="300" rx="28" fill="#000" opacity="0.25"/>${moVol((a) => `<rect x="-108" y="-150" width="216" height="300" rx="28" ${a}/>`, '#fffaf0', { sx: 14, sy: 14, k: 0.12 })}
    <rect x="-56" y="-110" width="112" height="${py + 110}" fill="${c}" opacity="0.8"/>
    <rect x="-64" y="-110" width="12" height="190" fill="${MO.steel}" stroke="${MO.o}" stroke-width="5"/><rect x="52" y="-110" width="12" height="190" fill="${MO.steel}" stroke="${MO.o}" stroke-width="5"/>
    <rect x="-52" y="${py}" width="104" height="44" rx="6" fill="${MO.steel}" stroke="${MO.o}" stroke-width="6"/>
    <text x="0" y="128" text-anchor="middle" font-size="36" font-weight="900" fill="${MO.o}" style="font-family: var(--font), system-ui, sans-serif">${word}</text></g></g>`;
}

// =====================================================================
//  World test shots (listed in world.json)
// =====================================================================
defineVisuals({
  'test-tico': {
    bg: MO.bg1, ink: MO.navy,
    html: () => svg(`${moBurst('tbBurst')}${moTico('tt', 540, 1500, 1)}`),
    anim(tl, s, K, $) {
      moTicoPose(tl, $, 'tt', 'point', K('point')); moTicoTalk(tl, $, 'tt', K('point'), K('palm') - 0.2);
      moTicoPose(tl, $, 'tt', 'palm', K('palm')); moTicoPose(tl, $, 'tt', 'hold', K('hold'));
      tl.set($('#tt-bulb'), { opacity: 1 }, K('hold')); moPop(tl, $('#tt-bulb'), K('hold'));
    },
  },
  'test-dota': {
    bg: MO.bg1, ink: MO.navy,
    html: () => svg(`${moBurst('tdBurst')}${moWheel('tdWheel', 540, 1370, 0.75)}${moDota('td', 540, 1500, 1.25, 'up')}`),
    anim(tl, s, K, $) {
      tl.set($('#tdWheel'), { opacity: 0 }, s.t0);
      moHop(tl, $('#td'), s.t0 + 0.2);
      moDotaPose(tl, $, 'td', 'hug', K('hug')); tl.set($('#tdWheel'), { opacity: 1 }, K('hug'));
      moDotaPose(tl, $, 'td', 'reach', K('reach')); tl.set($('#tdWheel'), { opacity: 0 }, K('reach'));
      moDotaPose(tl, $, 'td', 'down', K('hurt')); tl.set($('#td-bump'), { opacity: 1 }, K('hurt')); tl.set($('#td-black'), { opacity: 0.85 }, K('hurt')); moDizzy(tl, $, 'td', K('hurt'), s.t1);
      tl.set($('#td-screws'), { opacity: 1 }, K('screws')); moDotaTalk(tl, $, 'td', K('screws'), s.t1);
    },
  },
  'test-engine': {
    bg: MO.navy,
    html: () => svg(`${moPrint()}${moEngine('te', { valves: true, cams: true, plug: true, fly: true })}`),
    anim(tl, s, K, $) {
      tl.set($('#te-mix'), { opacity: 1 }, s.t0);
      moTurn(tl, $, 'te', 0, 720, s.t0, s.t1 - s.t0 - 0.2, 'none', { mix: true });
      moSparks(tl, $, 'te', 0, 720, s.t0, s.t1 - s.t0 - 0.2);
    },
  },
  'test-timing': {
    bg: MO.navy,
    html: () => svg(`${moPrint()}${moTiming('tm', true)}`),
    anim(tl, s, K, $) {
      tl.to($('#tm-qm'), { opacity: 0, duration: 0.3 }, K('reveal'));
      moBeltRun(tl, $, 'tm', s.t0, K('snap') - s.t0);
      tl.fromTo($('#tm-glow'), { opacity: 0 }, { opacity: 1, duration: 0.25, yoyo: true, repeat: 3 }, K('reveal') + 0.3);
      tl.set($('#tm-belt'), { opacity: 0 }, K('snap')); tl.set($('#tm-broken'), { opacity: 1 }, K('snap'));
    },
  },
  'test-props': {
    bg: MO.bg1, ink: MO.navy,
    html: () => svg(`${moBurst('tpBurst')}${moTable('tpTable', 1380)}${moTube('tpTube', 340, 1380, 260, 160)}${moDrop('tpDrop', 340, 900, 1)}
      ${moRadiator('tpRad', 760, 1100)}${moManual('tpMan', 540, 720, 0.7)}${moCar('tpCar', 560, 1560, 0.7)}${moSpark('tpSpark', 340, 1250)}${moBoom('tpBoom', 340, 1180)}${moSmoke('tpSmoke', 760, 820)}${moHeat('tpHeat', 760, 900)}
      ${moTag('tpTag', 540, 1000, 'PISTÓN')}${moQuestion('tpQ', 180, 700, 0.6)}${moArrow('tpA', 200, 1000, 380, 1000, MO.gas)}${moSpinArrow('tpSpin', 880, 640, 70)}`),
    anim(tl, s, K, $) {
      moFlash(tl, $('#tpSpark'), K('boom') - 0.1); moFlash(tl, $('#tpBoom'), K('boom'), 0.5);
      moPuff(tl, $('#tpSmoke'), K('boom')); tl.set($('#tpHeat'), { opacity: 1 }, K('boom'));
      tl.set($('#tpMan-hl'), { opacity: 1 }, K('boom'));
    },
  },
  'test-strokes': {
    bg: MO.navy,
    html: () => svg(`${moPrint()}${moStroke('ts1', 300, 800, 'ENTRA', MO.gas, false)}${moStroke('ts2', 780, 800, 'APRIETA', MO.gas, true)}${moStroke('ts3', 780, 1220, 'EXPLOTA', MO.fire, false)}${moStroke('ts4', 300, 1220, 'SALE', '#9aa3b2', true)}`),
    anim(tl, s, K, $) { for (let i = 1; i <= 4; i++) moPopIn(tl, $(`#ts${i}`), s.t0 + 0.1 + i * 0.3); },
  },
});
