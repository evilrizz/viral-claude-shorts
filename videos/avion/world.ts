// =====================================================================
//  World of "Cómo funciona un avión" (Idio-two): Tico and Dota (same as in motores), the board plane and its parts.
//  Flat 2D with the thick dark-brown outline of the characters' reference (assets/tico-dota.png).
//  Every piece is posed from the timeline (no clocks, no randomness). Names start with "mo".
// =====================================================================
const AVP = { ink: '#0e0f14', paper: '#f2efe6', orange: '#ff6a3d', lime: '#d4ff3a', air: '#5aa9ff', wood: '#c98a4b', woodD: '#8a5a30', wing: '#e9edf3', wingD: '#aeb8c8', dim: '#2a2c35' };
const AV = {
  o: '#2b1a14', bg1: '#fff3d6', bg2: '#ffe6a8', navy: '#1d2a4d', grid: '#2a3a63',
  tB: '#5a3a2b', tC: '#f3d9b1', tC2: '#f8e6c8', tShirt: '#3270e6',
  dB: '#c97b3d', dC: '#f2d2a6', dC2: '#f8e3c4', dShirt: '#ffc83d',
  steel: '#c9d3e0', steelD: '#8e9bb0', steelL: '#e8eef5', iron: '#5d6678', gas: '#7fc8ff', fire: '#ff8a3d', oil: '#f2b632', cool: '#4cc4ff', red: '#ff5a5f',
};
const AV_SW = 8;
// a limb: a rounded bar with the outline (two stacked lines)
function avLimb(x1: number, y1: number, x2: number, y2: number, w: number, c: string) {
  const L = Math.hypot(x2 - x1, y2 - y1) || 1, nx = (y2 - y1) / L, ny = -(x2 - x1) / L, sg = nx + ny >= 0 ? 1 : -1, ox = nx * sg * w * 0.24, oy = ny * sg * w * 0.24;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${AV.o}" stroke-width="${w + AV_SW * 2}" stroke-linecap="round"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<line x1="${(x1 + ox).toFixed(1)}" y1="${(y1 + oy).toFixed(1)}" x2="${(x2 + ox).toFixed(1)}" y2="${(y2 + oy).toFixed(1)}" stroke="#000" stroke-opacity="0.2" stroke-width="${(w * 0.4).toFixed(1)}" stroke-linecap="round"/>`;
}
// a cel-shaded shape: base colour, a darker crescent on the bottom-right, an optional shine, then the outline.
// geom(attrs) returns the shape with the given attributes; the clip id comes from the geometry, so equal shapes share it.
function avHash(t: string) { let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
function avVol(geom: (a: string) => string, fill: string, o: { sx?: number; sy?: number; k?: number; hi?: string; sw?: number } = {}) {
  const { sx = 14, sy = 14, k = 0.2, hi = '', sw = AV_SW } = o, g0 = geom(''), uid = 'cv' + avHash(g0 + fill + sx + sy);
  return `<clipPath id="${uid}">${g0}</clipPath>${geom(`fill="${fill}"`)}<g clip-path="url(#${uid})"><rect x="-4000" y="-4000" width="8000" height="8000" fill="url(#avDots)" opacity="${Math.min(1, k * 3.2)}"/><g transform="translate(${-sx} ${-sy})">${geom(`fill="${fill}"`)}</g>${hi}</g>` +
    (sw ? geom(`fill="none" stroke="${AV.o}" stroke-width="${sw}" stroke-linejoin="round"`) : '');
}
const avShine = (x: number, y: number, rx: number, ry: number, op = 0.35) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity="${op}" transform="rotate(-30 ${x} ${y})"/>`;
const avHand = (x: number, y: number, r: number, c: string) => avVol((a) => `<circle cx="${x}" cy="${y}" r="${r}" ${a}/>`, c, { sx: r * 0.3, sy: r * 0.3 });
const avVis = (on: boolean) => (on ? '' : ' opacity="0"');
function avStar(x: number, y: number, r: number, c = AV.dShirt) {
  let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)} `; }
  return `<path d="${d}Z" fill="${c}" stroke="${AV.o}" stroke-width="6" stroke-linejoin="round"/>`;
}

// ---------------- Tico: tall dark-brown monkey, glasses, blue t-shirt. Feet at (x, y).
type AvTicoPose = 'cross' | 'point' | 'palm' | 'hold';
function avTico(id: string, x: number, y: number, s = 1, pose: AvTicoPose = 'cross', flip = false) {
  const B = AV.tB, C = AV.tC, O = AV.o, sw = AV_SW;
  const armL = avLimb(-92, -320, -112, -175, 40, B) + avHand(-114, -165, 28, B);   // left arm hanging (shoulder -> wrist)
  const circ = (cx: number, cy: number, r: number) => (a: string) => `<circle cx="${cx}" cy="${cy}" r="${r}" ${a}/>`;
  const ell = (cx: number, cy: number, rx: number, ry: number) => (a: string) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${a}/>`;
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
    <ellipse cx="0" cy="0" rx="150" ry="22" fill="#000" opacity="0.16"/>
    <g id="${id}-rig">
    ${avLimb(-36, -140, -38, -30, 40, B)}${avLimb(36, -140, 38, -30, 40, B)}
    ${avVol(ell(-46, -14, 50, 22), C, { sx: 10, sy: 8 })}${avVol(ell(46, -14, 50, 22), C, { sx: 10, sy: 8 })}
    ${avVol((a) => `<rect x="-100" y="-365" width="200" height="240" rx="62" ${a}/>`, AV.tShirt, { sx: 26, sy: 6, k: 0.22, hi: avShine(-60, -320, 18, 34, 0.25) })}
    <path d="M-46 -362 Q0 -330 46 -362" fill="none" stroke="#000" stroke-opacity="0.2" stroke-width="12" stroke-linecap="round"/>
    <g id="${id}-cross"${avVis(pose === 'cross')}>${avLimb(-90, -300, 70, -235, 46, B)}${avLimb(90, -300, -70, -235, 46, B)}${avHand(78, -232, 30, B)}${avHand(-78, -232, 30, B)}</g>
    <g id="${id}-point"${avVis(pose === 'point')}>${armL}${avLimb(92, -320, 175, -390, 40, B)}${avLimb(175, -390, 250, -470, 36, B)}${avHand(258, -478, 28, B)}<rect x="262" y="-530" width="18" height="44" rx="9" fill="${B}" stroke="${O}" stroke-width="6" transform="rotate(30 271 -508)"/></g>
    <g id="${id}-palm"${avVis(pose === 'palm')}>${armL}${avLimb(92, -320, 160, -400, 40, B)}${avLimb(160, -400, 30, -525, 36, B)}</g>
    <g id="${id}-hold"${avVis(pose === 'hold')}>${avLimb(-92, -320, -120, -230, 40, B)}${avLimb(-120, -230, -40, -200, 36, B)}${avLimb(92, -320, 120, -230, 40, B)}${avLimb(120, -230, 40, -200, 36, B)}${avHand(-40, -200, 28, B)}${avHand(40, -200, 28, B)}</g>
    <g id="${id}-head"><g id="${id}-bob"><g id="${id}-nod">
      ${avVol(circ(-130, -475, 48), B, { sx: 12, sy: 12 })}<circle cx="-130" cy="-475" r="26" fill="${C}"/>
      ${avVol(circ(130, -475, 48), B, { sx: 12, sy: 12 })}<circle cx="130" cy="-475" r="26" fill="${C}"/>
      <path d="M-14 -604 Q0 -640 16 -606" fill="${B}" stroke="${O}" stroke-width="${sw}" stroke-linejoin="round"/>
      ${avVol(circ(0, -475, 132), B, { sx: 30, sy: 26, k: 0.25, hi: avShine(-70, -555, 26, 14, 0.3) })}
      <path d="M-100 -470 Q-100 -545 -45 -548 Q0 -520 45 -548 Q100 -545 100 -470 Q100 -360 0 -358 Q-100 -360 -100 -470Z" fill="${C}"/>
      <path d="M100 -470 Q100 -360 0 -358 Q70 -380 86 -440Z" fill="#000" opacity="0.08"/>
      <ellipse cx="0" cy="-398" rx="64" ry="36" fill="${AV.tC2}"/>
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
    <g id="${id}-palmHand"${avVis(pose === 'palm')}>${avVol(ell(10, -535, 62, 34), B, { sx: 12, sy: 10 })}</g>
    <g id="${id}-bulb" opacity="0"><g transform="translate(0 -700)">
      <line x1="-80" y1="0" x2="-60" y2="0" stroke="${O}" stroke-width="8" stroke-linecap="round"/><line x1="60" y1="0" x2="80" y2="0" stroke="${O}" stroke-width="8" stroke-linecap="round"/>
      <line x1="-58" y1="-58" x2="-44" y2="-44" stroke="${O}" stroke-width="8" stroke-linecap="round"/><line x1="58" y1="-58" x2="44" y2="-44" stroke="${O}" stroke-width="8" stroke-linecap="round"/><line x1="0" y1="-84" x2="0" y2="-66" stroke="${O}" stroke-width="8" stroke-linecap="round"/>
      ${avVol(circ(0, 0, 46), AV.dShirt, { sx: 10, sy: 10, hi: avShine(-16, -18, 12, 7, 0.6) })}<path d="M-14 10 L0 -8 L14 10" stroke="${O}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <rect x="-22" y="44" width="44" height="26" rx="6" fill="${AV.steel}" stroke="${O}" stroke-width="7"/></g></g>
    </g>
  </g></g>`;
}
function avTicoPose(tl: gsap.core.Timeline, $: (q: string) => string, id: string, pose: AvTicoPose, t: number) {
  for (const p of ['cross', 'point', 'palm', 'hold']) tl.set($(`#${id}-${p}`), { opacity: p === pose ? 1 : 0 }, t);
  tl.set($(`#${id}-palmHand`), { opacity: pose === 'palm' ? 1 : 0 }, t);
}
// Tico talks between t0 and t1 (mouth opens and closes), then goes back to the smirk
function avTicoTalk(tl: gsap.core.Timeline, $: (q: string) => string, id: string, t0: number, t1: number) {
  const n = Math.max(1, Math.round((t1 - t0) / 0.24));
  tl.set($(`#${id}-smirk`), { opacity: 0 }, t0).set($(`#${id}-talk`), { opacity: 1 }, t0);
  tl.fromTo($(`#${id}-talk`), { scaleY: 1, transformOrigin: '50% 50%' }, { scaleY: 0.25, duration: 0.12, ease: 'sine.inOut', yoyo: true, repeat: n * 2 - 1 }, t0);
  tl.set($(`#${id}-smirk`), { opacity: 1 }, t1).set($(`#${id}-talk`), { opacity: 0 }, t1);
  const m = Math.max(1, Math.round((t1 - t0) / 0.55));
  tl.fromTo($(`#${id}-nod`), { rotation: 0, y: 0, svgOrigin: '0 -360' }, { rotation: -4, y: 6, duration: 0.275, ease: 'sine.inOut', yoyo: true, repeat: m * 2 - 1, immediateRender: false }, t0);
}

// ---------------- Dota: small light-brown monkey, huge head, three tufts, yellow t-shirt, bandage. Feet at (x, y).
type AvDotaPose = 'up' | 'down' | 'hug' | 'reach';
function avDota(id: string, x: number, y: number, s = 1, pose: AvDotaPose = 'up', flip = false) {
  const B = AV.dB, C = AV.dC, O = AV.o;
  const circ = (cx: number, cy: number, r: number) => (a: string) => `<circle cx="${cx}" cy="${cy}" r="${r}" ${a}/>`;
  const ell = (cx: number, cy: number, rx: number, ry: number) => (a: string) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${a}/>`;
  const tuft = (cx: number, cy: number, r: number) => avVol((a) => `<ellipse cx="${cx}" cy="${cy}" rx="17" ry="32" transform="rotate(${r} ${cx} ${cy})" ${a}/>`, B, { sx: 6, sy: 6 });
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
    <ellipse cx="0" cy="0" rx="120" ry="20" fill="#000" opacity="0.16"/>
    <g id="${id}-rig">
    ${avLimb(-28, -80, -52, -22, 30, B)}${avLimb(28, -80, 52, -22, 30, B)}
    ${avVol(ell(-60, -14, 38, 18), C, { sx: 8, sy: 6 })}${avVol(ell(60, -14, 38, 18), C, { sx: 8, sy: 6 })}
    <g id="${id}-up"${avVis(pose === 'up')}>${avLimb(-55, -175, -105, -230, 30, B)}${avLimb(-105, -230, -135, -290, 28, B)}${avLimb(55, -175, 105, -230, 30, B)}${avLimb(105, -230, 135, -290, 28, B)}${avHand(-138, -298, 24, B)}${avHand(138, -298, 24, B)}</g>
    <g id="${id}-down"${avVis(pose === 'down')}>${avLimb(-60, -180, -82, -95, 30, B)}${avLimb(60, -180, 82, -95, 30, B)}${avHand(-84, -88, 24, B)}${avHand(84, -88, 24, B)}</g>
    <g id="${id}-reach"${avVis(pose === 'reach')}>${avLimb(-60, -180, -82, -95, 30, B)}${avHand(-84, -88, 24, B)}${avLimb(60, -180, 130, -175, 30, B)}${avLimb(130, -175, 205, -185, 28, B)}${avHand(212, -186, 22, B)}<rect x="228" y="-194" width="34" height="14" rx="7" fill="${B}" stroke="${O}" stroke-width="6"/></g>
    ${avVol((a) => `<rect x="-72" y="-215" width="144" height="160" rx="42" ${a}/>`, AV.dShirt, { sx: 20, sy: 6, k: 0.18, hi: avShine(-40, -180, 12, 24, 0.35) })}
    <path d="M-34 -212 Q0 -192 34 -212" fill="none" stroke="#000" stroke-opacity="0.18" stroke-width="10" stroke-linecap="round"/>
    <g id="${id}-hug"${avVis(pose === 'hug')}>${avLimb(-60, -180, -95, -130, 30, B)}${avLimb(-95, -130, -40, -110, 28, B)}${avLimb(60, -180, 95, -130, 30, B)}${avLimb(95, -130, 40, -110, 28, B)}${avHand(-36, -110, 22, B)}${avHand(36, -110, 22, B)}</g>
    <g id="${id}-head"><g id="${id}-bob"><g id="${id}-nod">
      ${tuft(-38, -432, -22)}${tuft(0, -446, 0)}${tuft(38, -432, 22)}
      ${avVol(circ(-112, -318, 42), B, { sx: 10, sy: 10 })}<circle cx="-112" cy="-318" r="22" fill="${C}"/>
      ${avVol(circ(112, -318, 42), B, { sx: 10, sy: 10 })}<circle cx="112" cy="-318" r="22" fill="${C}"/>
      ${avVol(circ(0, -322, 116), B, { sx: 26, sy: 22, k: 0.22, hi: avShine(-60, -395, 22, 12, 0.32) })}
      <path d="M-92 -320 Q-92 -385 -40 -390 Q0 -366 40 -390 Q92 -385 92 -320 Q92 -225 0 -222 Q-92 -225 -92 -320Z" fill="${C}"/>
      <path d="M92 -320 Q92 -225 0 -222 Q66 -244 80 -300Z" fill="#000" opacity="0.08"/>
      <ellipse cx="0" cy="-262" rx="58" ry="36" fill="${AV.dC2}"/>
      <ellipse cx="-70" cy="-276" rx="18" ry="10" fill="#ff8f8f" opacity="0.4"/><ellipse cx="74" cy="-276" rx="18" ry="10" fill="#ff8f8f" opacity="0.4"/>
      <circle id="${id}-black" cx="40" cy="-332" r="44" fill="#6a4a8c" opacity="0"/>
      <circle cx="-38" cy="-332" r="31" fill="#fff" stroke="${O}" stroke-width="7"/><circle cx="40" cy="-332" r="31" fill="#fff" stroke="${O}" stroke-width="7"/>
      <g id="${id}-pupils"><g id="${id}-eyesOk"><circle cx="-34" cy="-330" r="13" fill="${O}"/><circle cx="44" cy="-330" r="13" fill="${O}"/><circle cx="-30" cy="-334" r="4" fill="#fff"/><circle cx="48" cy="-334" r="4" fill="#fff"/></g>
        <g id="${id}-eyesCrazy" opacity="0"><circle cx="-28" cy="-326" r="13" fill="${O}"/><circle cx="48" cy="-342" r="13" fill="${O}"/><circle cx="-24" cy="-330" r="4" fill="#fff"/><circle cx="52" cy="-346" r="4" fill="#fff"/></g></g>
      <line x1="-70" y1="-382" x2="-12" y2="-376" stroke="${O}" stroke-width="9" stroke-linecap="round"/><line x1="12" y1="-372" x2="68" y2="-386" stroke="${O}" stroke-width="9" stroke-linecap="round"/>
      <circle cx="-10" cy="-284" r="4" fill="${O}"/><circle cx="8" cy="-284" r="4" fill="${O}"/>
      <g id="${id}-mouth"><ellipse cx="0" cy="-246" rx="25" ry="26" fill="#6b1a1a" stroke="${O}" stroke-width="7"/><ellipse cx="0" cy="-234" rx="14" ry="8" fill="#ff8fa3"/></g>
      <g transform="rotate(-28 52 -290)"><rect x="18" y="-305" width="72" height="30" rx="13" fill="#f0b088" stroke="${O}" stroke-width="6"/><circle cx="48" cy="-294" r="3" fill="${O}"/><circle cx="60" cy="-294" r="3" fill="${O}"/><circle cx="48" cy="-285" r="3" fill="${O}"/><circle cx="60" cy="-285" r="3" fill="${O}"/></g>
      <g id="${id}-bump" opacity="0">${avVol(circ(-40, -432, 30), '#ff8f8f', { sx: 8, sy: 8, sw: 7, hi: avShine(-50, -444, 9, 6, 0.7) })}</g>
    </g></g></g>
    <g id="${id}-stars" opacity="0">${avStar(-80, -470, 22)}${avStar(0, -500, 26)}${avStar(80, -470, 22)}</g>
    <g id="${id}-screws" opacity="0"><g transform="translate(84 -112)">${[-26, 0, 26].map((dx) => `<g transform="translate(${dx} 0) rotate(${dx})"><rect x="-6" y="-40" width="12" height="40" rx="3" fill="${AV.steel}" stroke="${O}" stroke-width="5"/><rect x="-14" y="-50" width="28" height="12" rx="4" fill="${AV.steelD}" stroke="${O}" stroke-width="5"/></g>`).join('')}</g></g>
    </g>
  </g></g>`;
}
function avDotaPose(tl: gsap.core.Timeline, $: (q: string) => string, id: string, pose: AvDotaPose, t: number) {
  for (const p of ['up', 'down', 'hug', 'reach']) tl.set($(`#${id}-${p}`), { opacity: p === pose ? 1 : 0 }, t);
}
function avDotaTalk(tl: gsap.core.Timeline, $: (q: string) => string, id: string, t0: number, t1: number) {
  const n = Math.max(1, Math.round((t1 - t0) / 0.24));
  tl.fromTo($(`#${id}-mouth`), { scaleY: 1, transformOrigin: '50% 30%' }, { scaleY: 0.45, duration: 0.12, ease: 'sine.inOut', yoyo: true, repeat: n * 2 - 1 }, t0);
  const m = Math.max(1, Math.round((t1 - t0) / 0.36));
  tl.fromTo($(`#${id}-nod`), { y: 0, rotation: 0, svgOrigin: '0 -215' }, { y: -14, rotation: 5, duration: 0.18, ease: 'sine.inOut', yoyo: true, repeat: m * 2 - 1, immediateRender: false }, t0);
}
// a small hop (happy / excited): 0.3 s up and down, n times
// a character is alive for the whole scene: breathing, a slow head bob and blinks (Dota bouncier)
function avAlive(tl: gsap.core.Timeline, $: (q: string) => string, id: string, s: Scene, kind: 'tico' | 'dota') {
  const d = s.t1 - s.t0, br = kind === 'tico' ? 0.95 : 0.55, neck = kind === 'tico' ? '0 -360' : '0 -215';
  tl.fromTo($(`#${id}-rig`), { scaleY: 1, scaleX: 1, svgOrigin: '0 0' }, { scaleY: kind === 'tico' ? 1.02 : 1.035, scaleX: kind === 'tico' ? 0.995 : 0.985, duration: br, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil(d / br) }, s.t0);
  tl.fromTo($(`#${id}-bob`), { rotation: -2.5, svgOrigin: neck }, { rotation: 2.5, duration: br * 1.6, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil(d / (br * 1.6)) }, s.t0);
  const eyes = $(`#${id}-${kind === 'tico' ? 'eyes' : 'pupils'}`);
  for (let t = s.t0 + 0.6 + (id.length % 3) * 0.4; t < s.t1 - 0.3; t += 2.6) tl.fromTo(eyes, { scaleY: 1, transformOrigin: '50% 50%' }, { scaleY: 0.1, duration: 0.07, yoyo: true, repeat: 1, ease: 'none', immediateRender: false }, t);
}
// squash-and-stretch pop: the default entrance
const avPop = (tl: gsap.core.Timeline, sel: string, t: number, d = 0.45) =>
  tl.fromTo(sel, { scaleX: 0, scaleY: 0, transformOrigin: '50% 100%' }, { keyframes: [{ scaleX: 1.25, scaleY: 0.8, duration: d * 0.45, ease: 'power2.out' }, { scaleX: 0.92, scaleY: 1.1, duration: d * 0.3, ease: 'sine.inOut' }, { scaleX: 1, scaleY: 1, duration: d * 0.25, ease: 'sine.out' }] }, t);
// camera on two nested groups: #cam = the snap-in at the cut + a slow drift; #camP = punches and shakes on the keys
function avCamera(tl: gsap.core.Timeline, $: (q: string) => string, s: Scene, dir: number) {
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
function avFocus(tl: gsap.core.Timeline, $: (q: string) => string, x: number, y: number, z: number, t: number, d = 1.2, ease = 'power3.inOut') {
  tl.to($('#camZ'), { scale: z, svgOrigin: `${x} ${y}`, duration: d, ease }, t);
  tl.fromTo($('#spot'), { opacity: 0 }, { opacity: 0.5, duration: d, ease: 'sine.inOut', immediateRender: false }, t);
}
// the spotlight that dims everything around the focus (place it with the same centre as the zoom)
const avSpot = (x: number, y: number, r = 430) => `<circle id="spot" cx="${x}" cy="${y}" r="${r + 900}" fill="none" stroke="#03161c" stroke-width="1800" opacity="0"/>`;
// marks a new piece: a turning dashed yellow ring, a pulse and an arrow pointing at it (optional label under it)
function avMark(id: string, x: number, y: number, r: number, label = '', c = AVP.lime) {
  const L = Math.max(34, r * 0.32), k = (sx: number, sy: number) => `<path d="M${x + sx * r} ${y + sy * (r - L)} L${x + sx * r} ${y + sy * r} L${x + sx * (r - L)} ${y + sy * r}" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="square"/>`;
  const w = label.length * 25 + 70, cx = Math.min(1000 - w, Math.max(80, x - r)), cy = Math.max(500, y - r - 92);
  return `<g id="${id}" opacity="0">
    <g id="${id}-pulse"><rect x="${x - r}" y="${y - r}" width="${2 * r}" height="${2 * r}" fill="none" stroke="${c}" stroke-width="3" opacity="0.6"/></g>
    <g id="${id}-ring">${k(-1, -1)}${k(1, -1)}${k(1, 1)}${k(-1, 1)}<line x1="${x - 16}" y1="${y}" x2="${x + 16}" y2="${y}" stroke="${c}" stroke-width="3"/><line x1="${x}" y1="${y - 16}" x2="${x}" y2="${y + 16}" stroke="${c}" stroke-width="3"/></g>
    <g id="${id}-arrow"></g>
    ${label ? `<g id="${id}-tag"><rect x="${cx + 6}" y="${cy + 6}" width="${w}" height="66" fill="#000" opacity="0.35"/><rect x="${cx}" y="${cy}" width="${w}" height="66" fill="${AVP.paper}"/><rect x="${cx}" y="${cy}" width="10" height="66" fill="${AVP.orange}"/>
      <text x="${cx + 28}" y="${cy + 44}" font-size="34" font-weight="900" fill="${AVP.ink}" style="font-family: var(--font), system-ui, sans-serif; letter-spacing: 1px">${label}</text></g>` : ''}</g>`;
}
function avMarkIn(tl: gsap.core.Timeline, $: (q: string) => string, id: string, x: number, y: number, t: number, d = 1.4, label = false) {
  const o = `${x} ${y}`;
  tl.set($(`#${id}`), { opacity: 1 }, t);
  tl.fromTo($(`#${id}-ring`), { scale: 1.6, opacity: 0, svgOrigin: o }, { scale: 1, opacity: 1, duration: 0.35, ease: 'power3.out', immediateRender: false }, t);
  tl.to($(`#${id}-ring`), { scale: 1.05, svgOrigin: o, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: Math.max(1, Math.floor((d - 0.4) / 0.3)) }, t + 0.35);
  tl.fromTo($(`#${id}-pulse`), { scale: 1, opacity: 0.6, svgOrigin: o }, { scale: 1.25, opacity: 0, duration: 0.5, ease: 'power1.out', repeat: 1, immediateRender: false }, t + 0.1);
  if (label) tl.fromTo($(`#${id}-tag`), { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: 'power3.out', immediateRender: false }, t + 0.12);
  tl.to($(`#${id}`), { opacity: 0, duration: 0.25 }, t + d);
}
// a short zoom on (x, y): in fast, hold, back out
function avZoom(tl: gsap.core.Timeline, $: (q: string) => string, x: number, y: number, z: number, t: number, hold: number) {
  tl.to($('#camZ'), { scale: z, svgOrigin: `${x} ${y}`, duration: 0.45, ease: 'power3.out' }, t);
  tl.to($('#camZ'), { scale: 1, duration: 0.45, ease: 'power2.inOut' }, t + hold);
}
function avHop(tl: gsap.core.Timeline, sel: string, t: number, n = 2, h = 40) {
  tl.fromTo(sel, { y: 0 }, { y: -h, duration: 0.15, ease: 'power2.out', yoyo: true, repeat: n * 2 - 1 }, t);
}
// dizzy stars: show and spin around the head (loops until t1)
// Dota looks straight ahead; his eyes go crazy only when something happens to him (hit, dizzy, called idiot)
function avDotaEyes(tl: gsap.core.Timeline, $: (q: string) => string, id: string, crazy: boolean, t: number) {
  tl.set($(`#${id}-eyesOk`), { opacity: crazy ? 0 : 1 }, t).set($(`#${id}-eyesCrazy`), { opacity: crazy ? 1 : 0 }, t);
}
function avDizzy(tl: gsap.core.Timeline, $: (q: string) => string, id: string, t0: number, t1: number) {
  avDotaEyes(tl, $, id, true, t0);
  tl.set($(`#${id}-stars`), { opacity: 1 }, t0);
  tl.fromTo($(`#${id}-stars`), { rotation: -12, transformOrigin: '50% 50%' }, { rotation: 12, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: Math.max(1, Math.ceil((t1 - t0) / 0.3)) }, t0);
}

// ---------------- sets
function avBurst(id: string, c1 = AV.bg1, c2 = AV.bg2, cx = 540, cy = 1050, floor = true) {
  let w = ''; for (let i = 0; i < 24; i += 2) { const a = i / 24 * Math.PI * 2, b = (i + 1) / 24 * Math.PI * 2, R = 2400; w += `<path d="M0 0 L${(Math.cos(a) * R).toFixed(0)} ${(Math.sin(a) * R).toFixed(0)} L${(Math.cos(b) * R).toFixed(0)} ${(Math.sin(b) * R).toFixed(0)}Z" fill="${c2}"/>`; }
  return `<rect width="1080" height="1920" fill="${c1}"/><g transform="translate(${cx} ${cy})"><g id="${id}">${w}</g></g>
    <circle cx="540" cy="1000" r="1250" fill="none" stroke="#e7a95a" stroke-width="900" opacity="0.28"/><circle cx="540" cy="1000" r="980" fill="none" stroke="#e7a95a" stroke-width="300" opacity="0.14"/>
    ${floor ? '<rect x="0" y="1520" width="1080" height="400" fill="#f1c98a"/><rect x="0" y="1520" width="1080" height="16" fill="#e2ad6a"/><rect x="0" y="1600" width="1080" height="320" fill="#000" opacity="0.05"/>' : ''}`;
}
function avPrint() {   // the stage: near-black, a fine dot texture, a soft glow behind the subject, dim halftone dunes at the bottom
  const dust = [...Array(22)].map((_, i) => `<circle cx="${(i * 211) % 1080}" cy="${420 + ((i * 337) % 1200)}" r="${2 + (i % 3)}" fill="#e8e6dc" opacity="${0.12 + (i % 3) * 0.08}"/>`).join('');
  return `<rect id="bd0" width="1080" height="1920" fill="#0e0f14"/><rect width="1080" height="1920" fill="url(#avDotsL)" opacity="0.07"/>
    <circle id="bd1" cx="540" cy="1020" r="640" fill="#171922" opacity="0.95"/><circle id="bd2" cx="540" cy="1020" r="420" fill="#1e2029" opacity="0.8"/>
    <path d="M-40 1520 C 200 1440, 420 1500, 640 1460 S 980 1420, 1120 1470 L1120 1960 L-40 1960Z" fill="#17181f"/><path d="M-40 1520 C 200 1440, 420 1500, 640 1460 S 980 1420, 1120 1470 L1120 1960 L-40 1960Z" fill="url(#avDotsL)" opacity="0.12"/>
    <path d="M-40 1600 C 260 1560, 520 1630, 760 1590 S 1000 1570, 1120 1600 L1120 1960 L-40 1960Z" fill="#121318"/>
    <circle id="bd3" cx="540" cy="1000" r="1250" fill="none" stroke="#060608" stroke-width="900" opacity="0.6"/><g class="dust">${dust}</g>`;
}
// the dot patterns every scene needs (pass to svg(body, AV_DEFS))
const AV_DEFS = `<pattern id="avDots" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="4.5" cy="4.5" r="2.3" fill="#000"/></pattern>
  <pattern id="avDotsL" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="1.6" fill="#fff"/></pattern>`;
// dust drifts up slowly in the blueprint set
const avDust = (tl: gsap.core.Timeline, $: (q: string) => string, s: Scene) =>
  tl.fromTo($('.dust circle'), { y: 0, x: 0 }, { y: -140, x: 30, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
const avBurstSpin = (tl: gsap.core.Timeline, $: (q: string) => string, id: string, s: Scene) =>
  tl.fromTo($('#' + id), { rotation: 0, svgOrigin: '0 0' }, { rotation: 10, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
// camera: slow push-in of a wrapper group over the scene
const avCam = (tl: gsap.core.Timeline, sel: string, s: Scene, from = 1, to = 1.04, origin = '540 1100') =>
  tl.fromTo(sel, { scale: from, svgOrigin: origin }, { scale: to, duration: s.t1 - s.t0, ease: 'sine.inOut' }, s.t0);

// ---------------- visual language
function avTag(id: string, x: number, y: number, text: string, c = '#e8622a', fs = 44) {
  const w = text.length * fs * 0.62 + 56;
  return `<g id="${id}"><g transform="translate(${x} ${y})"><rect x="${-w / 2 + 6}" y="-30" width="${w}" height="76" rx="38" fill="#000" opacity="0.25"/>${avVol((a) => `<rect x="${-w / 2}" y="-38" width="${w}" height="76" rx="38" ${a}/>`, c, { sx: 0, sy: 10, k: 0.22, sw: 6, hi: `<rect x="${-w / 2 + 24}" y="-30" width="${w * 0.4}" height="10" rx="5" fill="#fff" opacity="0.35"/>` })}
    <text x="0" y="${fs * 0.36}" text-anchor="middle" font-size="${fs}" font-weight="900" fill="#fff" style="font-family: var(--font), system-ui, sans-serif; letter-spacing: 1px">${text}</text></g></g>`;
}
const avPopIn = (tl: gsap.core.Timeline, sel: string, t: number) => {
  tl.fromTo(sel, { scaleX: 0, scaleY: 0, opacity: 0, rotation: -8, transformOrigin: '50% 50%' }, { keyframes: [{ scaleX: 1.2, scaleY: 0.85, opacity: 1, rotation: 4, duration: 0.16, ease: 'power2.out' }, { scaleX: 0.95, scaleY: 1.06, rotation: -2, duration: 0.12 }, { scaleX: 1, scaleY: 1, rotation: 0, duration: 0.1 }] }, t);
  tl.to(sel, { rotation: 2.5, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: 5 }, t + 0.4);
};
function avQuestion(id: string, x: number, y: number, s = 1) {
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})"><rect x="-98" y="-104" width="220" height="240" rx="36" fill="#000" opacity="0.22"/>${avVol((a) => `<rect x="-110" y="-120" width="220" height="240" rx="36" ${a}/>`, AV.dShirt, { sx: 18, sy: 18, sw: 10, hi: avShine(-60, -80, 30, 14, 0.45) })}
    <text x="0" y="70" text-anchor="middle" font-size="210" font-weight="900" fill="${AV.o}" style="font-family: var(--font), system-ui, sans-serif">?</text></g></g>`;
}
function avSpark(id: string, x: number, y: number, s = 1) {
  let d = ''; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = i % 2 ? 22 : 60; d += `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)} `; }
  return `<g id="${id}" opacity="0"><g transform="translate(${x} ${y}) scale(${s})"><path d="${d}Z" fill="#fff36b" stroke="${AV.o}" stroke-width="6" stroke-linejoin="round"/><circle r="12" fill="#fff"/></g></g>`;
}
function avBoom(id: string, x: number, y: number, s = 1) {
  const burst = (r1: number, r2: number, n: number) => { let d = ''; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2 + 0.2, r = i % 2 ? r2 : r1; d += `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)} `; } return d + 'Z'; };
  return `<g id="${id}" opacity="0"><g transform="translate(${x} ${y}) scale(${s})"><path d="${burst(130, 70, 11)}" fill="${AV.fire}" stroke="${AV.o}" stroke-width="8" stroke-linejoin="round"/><path d="${burst(80, 42, 9)}" fill="#ffd23d"/><circle r="26" fill="#fff6c8"/></g></g>`;
}
// flash a spark (0.25 s) or a boom (0.4 s) at t
const avFlash = (tl: gsap.core.Timeline, sel: string, t: number, d = 0.25) =>
  tl.fromTo(sel, { opacity: 0, scale: 0.2, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1.15, duration: d * 0.5, ease: 'power2.out' }, t).to(sel, { opacity: 0, scale: 1.3, duration: d * 0.5, ease: 'power1.in' }, t + d * 0.5);
function avSmoke(id: string, x: number, y: number, s = 1, c = '#9aa3b2') {
  return `<g id="${id}" opacity="0"><g transform="translate(${x} ${y}) scale(${s})">${avVol((a) => `<circle cx="-34" cy="0" r="34" ${a}/>`, c, { sx: 8, sy: 8, sw: 6 })}${avVol((a) => `<circle cx="20" cy="-22" r="42" ${a}/>`, c, { sx: 10, sy: 10, sw: 6 })}${avVol((a) => `<circle cx="52" cy="10" r="28" ${a}/>`, c, { sx: 7, sy: 7, sw: 6 })}<circle cx="-2" cy="14" r="30" fill="${c}"/></g></g>`;
}
// a puff that rises and fades (0.9 s)
const avPuff = (tl: gsap.core.Timeline, sel: string, t: number, dy = -160) =>
  tl.fromTo(sel, { opacity: 0, y: 0, scale: 0.5, transformOrigin: '50% 50%' }, { keyframes: [{ opacity: 0.95, scale: 0.7, y: dy * 0.1, duration: 0.1 }, { opacity: 0, y: dy, scale: 1.3, duration: 0.8, ease: 'power1.out' }] }, t);
function avArrow(id: string, x1: number, y1: number, x2: number, y2: number, c: string, w = 22) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.2, bx = x2 - Math.cos(a) * h * 0.7, by = y2 - Math.sin(a) * h * 0.7;
  return `<g id="${id}"><line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}" stroke="${AV.o}" stroke-width="${w + 12}" stroke-linecap="round"/>
    <path d="M${x2} ${y2} L${x2 - Math.cos(a - 0.55) * h} ${y2 - Math.sin(a - 0.55) * h} L${x2 - Math.cos(a + 0.55) * h} ${y2 - Math.sin(a + 0.55) * h} Z" fill="${c}" stroke="${AV.o}" stroke-width="6" stroke-linejoin="round"/>
    <line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/></g>`;
}
// a curved "goes around" arrow (for rotation) centred at (cx, cy)
function avSpinArrow(id: string, cx: number, cy: number, r: number, c = AV.dShirt) {
  const p = (a: number) => `${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`, a1 = -2.6, a2 = 0.9;
  const tip = { x: cx + Math.cos(a2) * r, y: cy + Math.sin(a2) * r }, tg = a2 + Math.PI / 2;
  return `<g id="${id}"><path d="M${p(a1)} A${r} ${r} 0 1 1 ${p(a2)}" stroke="${AV.o}" stroke-width="34" fill="none" stroke-linecap="round"/><path d="M${p(a1)} A${r} ${r} 0 1 1 ${p(a2)}" stroke="${c}" stroke-width="20" fill="none" stroke-linecap="round"/>
    <path d="M${(tip.x + Math.cos(tg) * 40).toFixed(1)} ${(tip.y + Math.sin(tg) * 40).toFixed(1)} L${(tip.x + Math.cos(tg + 2.3) * 36).toFixed(1)} ${(tip.y + Math.sin(tg + 2.3) * 36).toFixed(1)} L${(tip.x + Math.cos(tg - 2.3) * 36).toFixed(1)} ${(tip.y + Math.sin(tg - 2.3) * 36).toFixed(1)}Z" fill="${c}" stroke="${AV.o}" stroke-width="6" stroke-linejoin="round"/></g>`;
}

// ---------------- the engine cutaway: everything posed from ONE crank angle a (degrees, 0 = piston at the top, 0–720 = 4 strokes)
const AVE = { cx: 540, cy: 1300, r: 80, L: 250, top: 880, vIn: 470, vEx: 610, camY: 700 };
interface AvEngineOpts { head?: boolean; valves?: boolean; cams?: boolean; plug?: boolean; rod?: boolean; fly?: boolean; pipes?: boolean; a?: number }
function avEngine(id: string, o: AvEngineOpts = {}) {
  const { cx, cy, top, vIn, vEx, camY } = AVE, O = AV.o, sw = AV_SW;
  const valve = (vid: string, x: number) => `<g id="${id}-${vid}"><g id="${id}-${vid}M"><rect x="${x - 7}" y="${camY + 44}" width="14" height="${top - camY - 44}" fill="${AV.steelD}" stroke="${O}" stroke-width="5"/>
    <path d="M${x - 34} ${top + 4} L${x + 34} ${top + 4} L${x + 12} ${top - 12} L${x - 12} ${top - 12}Z" fill="${AV.steel}" stroke="${O}" stroke-width="6" stroke-linejoin="round"/></g></g>`;
  const cam = (cid: string, x: number) => `<g id="${id}-${cid}"><g id="${id}-${cid}M"><path d="M${x - 36} ${camY} A36 36 0 0 1 ${x + 36} ${camY} L${x + 14} ${camY + 72} A16 16 0 0 1 ${x - 14} ${camY + 72}Z" fill="${AV.steel}" stroke="${O}" stroke-width="${sw}" stroke-linejoin="round"/><circle cx="${x}" cy="${camY}" r="10" fill="${O}"/></g></g>`;
  let fly = ''; if (o.fly) { let teeth = ''; for (let i = 0; i < 36; i++) teeth += `<rect x="-7" y="-252" width="14" height="22" fill="${AV.iron}" stroke="${O}" stroke-width="4" transform="rotate(${i * 10})"/>`;
    fly = `<g id="${id}-fly"><g id="${id}-flyM" transform="translate(${cx} ${cy})">${teeth}${avVol((a) => `<circle r="232" ${a}/>`, AV.iron, { sx: 40, sy: 40, k: 0.25 })}<circle r="200" fill="#6f7a8e"/><path d="M-150 -110 A186 186 0 0 1 60 -178" stroke="#fff" stroke-width="12" fill="none" opacity="0.3" stroke-linecap="round"/>${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${Math.cos(i * Math.PI / 3) * 140}" cy="${Math.sin(i * Math.PI / 3) * 140}" r="26" fill="${AV.iron}" stroke="${O}" stroke-width="5"/>`).join('')}</g></g>`; }
  return `<g id="${id}">${fly}
    <g id="${id}-mix" opacity="0"><rect x="430" y="${top}" width="220" height="10" fill="${AV.gas}" opacity="0.75"/></g>
    <g id="${id}-walls"><rect x="398" y="${top}" width="32" height="340" fill="${AV.steel}" stroke="${O}" stroke-width="${sw}"/><rect x="650" y="${top}" width="32" height="340" fill="${AV.steel}" stroke="${O}" stroke-width="${sw}"/>
      <rect x="412" y="${top + 8}" width="10" height="320" fill="${AV.steelL}"/><rect x="664" y="${top + 4}" width="14" height="332" fill="#000" opacity="0.15"/></g>
    <rect x="430" y="${top}" width="220" height="340" fill="#0b1226" opacity="0.18"/>
    <g id="${id}-crank"><g id="${id}-crankM" transform="translate(${cx} ${cy})">${avVol((a) => `<path d="M-105 0 A105 105 0 0 0 105 0 L60 -30 L60 -90 A26 26 0 0 0 -60 -90 L-60 -30Z" ${a}/>`, AV.iron, { sx: 16, sy: 16, k: 0.25, hi: avShine(-55, -40, 18, 8, 0.35) })}
      <circle r="34" fill="${AV.steel}" stroke="${O}" stroke-width="${sw}"/><circle cx="0" cy="-${AVE.r}" r="24" fill="${AV.steelL}" stroke="${O}" stroke-width="6"/></g></g>
    <g id="${id}-rodG"${avVis(o.rod !== false)}><line id="${id}-rodO" x1="${cx}" y1="0" x2="${cx}" y2="0" stroke="${O}" stroke-width="54" stroke-linecap="round"/><line id="${id}-rod" x1="${cx}" y1="0" x2="${cx}" y2="0" stroke="${AV.steelD}" stroke-width="38" stroke-linecap="round"/></g>
    <g id="${id}-piston"><g id="${id}-pistonM">${avVol((a) => `<rect x="434" y="-45" width="212" height="110" rx="10" ${a}/>`, AV.steel, { sx: 30, sy: 14, k: 0.22, hi: `<rect x="450" y="-36" width="70" height="10" rx="5" fill="#fff" opacity="0.6"/>` })}
      <line x1="434" y1="-22" x2="646" y2="-22" stroke="${O}" stroke-width="5"/><line x1="434" y1="-6" x2="646" y2="-6" stroke="${O}" stroke-width="5"/><circle cx="${cx}" cy="0" r="0"/><circle cx="${cx}" cy="25" r="16" fill="${AV.steelL}" stroke="${O}" stroke-width="5"/></g></g>
    <g id="${id}-head"${avVis(o.head !== false)}><path d="M398 ${top} L398 ${top - 80} L682 ${top - 80} L682 ${top} L${vEx + 34} ${top} L${vEx + 22} ${top - 26} L${vEx - 22} ${top - 26} L${vEx - 34} ${top} L${vIn + 34} ${top} L${vIn + 22} ${top - 26} L${vIn - 22} ${top - 26} L${vIn - 34} ${top}Z" fill="#aab6c8" stroke="${O}" stroke-width="${sw}" stroke-linejoin="round"/><rect x="410" y="${top - 72}" width="260" height="12" rx="6" fill="#fff" opacity="0.35"/><rect x="404" y="${top - 30}" width="272" height="10" fill="#000" opacity="0.12"/></g>
    <g id="${id}-pipes"${avVis(!!o.pipes)}><path d="M300 ${top - 46} L${vIn - 26} ${top - 46}" stroke="${O}" stroke-width="56" stroke-linecap="round"/><path d="M300 ${top - 46} L${vIn - 26} ${top - 46}" stroke="#aab6c8" stroke-width="40" stroke-linecap="round"/>
      <path d="M${vEx + 26} ${top - 46} L780 ${top - 46}" stroke="${O}" stroke-width="56" stroke-linecap="round"/><path d="M${vEx + 26} ${top - 46} L780 ${top - 46}" stroke="#aab6c8" stroke-width="40" stroke-linecap="round"/></g>
    <g id="${id}-valves"${avVis(!!o.valves)}>${valve('vIn', vIn)}${valve('vEx', vEx)}</g>
    <g id="${id}-cams"${avVis(!!o.cams)}><line x1="${vIn - 60}" y1="${camY}" x2="${vEx + 60}" y2="${camY}" stroke="${O}" stroke-width="16" stroke-linecap="round"/>${cam('camIn', vIn)}${cam('camEx', vEx)}</g>
    <g id="${id}-plug"${avVis(!!o.plug)}><rect x="${cx - 9}" y="${top - 30}" width="18" height="42" fill="${AV.steelD}" stroke="${O}" stroke-width="5"/><rect x="${cx - 24}" y="${top - 70}" width="48" height="40" rx="6" fill="${AV.iron}" stroke="${O}" stroke-width="6"/>
      ${avVol((a) => `<rect x="${cx - 18}" y="${top - 160}" width="36" height="92" rx="14" ${a}/>`, '#fff', { sx: 10, sy: 0, k: 0.15, sw: 6 })}<rect x="${cx - 8}" y="${top - 186}" width="16" height="28" rx="5" fill="${AV.steelD}" stroke="${O}" stroke-width="5"/></g>
    ${avSpark(`${id}-spark`, cx, top + 26, 0.7)}${avBoom(`${id}-boom`, cx, top + 50, 0.85)}
  </g>`;
}
// valve lift (0..1) for a crank angle: intake opens in 0–180, exhaust in 540–720
const avLift = (a: number, from: number) => { const x = (((a % 720) + 720) % 720 - from) / 180; return x > 0 && x < 1 ? Math.sin(x * Math.PI) : 0; };
function avEnginePose(q: (s: string) => string, id: string, a: number, o: { valves?: boolean; mix?: boolean; stuckEx?: number } = {}) {
  const { cx, cy, r, L } = AVE, th = a * Math.PI / 180;
  const px = cx + r * Math.sin(th), py = cy - r * Math.cos(th), pinY = py - Math.sqrt(L * L - (px - cx) ** 2);
  const el = (s: string) => document.querySelector(q(`#${id}-${s}`));
  el('pistonM')?.setAttribute('transform', `translate(0 ${pinY.toFixed(2)})`);
  for (const n of ['rod', 'rodO']) { const e = el(n); if (e) { e.setAttribute('x1', String(cx)); e.setAttribute('y1', (pinY + 25).toFixed(2)); e.setAttribute('x2', px.toFixed(2)); e.setAttribute('y2', py.toFixed(2)); } }
  el('crankM')?.setAttribute('transform', `translate(${cx} ${cy}) rotate(${a.toFixed(2)})`);
  el('flyM')?.setAttribute('transform', `translate(${cx} ${cy}) rotate(${a.toFixed(2)})`);
  // cams turn at half the crank speed, lobes pointing down when their valve is fully open
  el('camInM')?.setAttribute('transform', `rotate(${(a / 2 - 45).toFixed(2)} ${AVE.vIn} ${AVE.camY})`);
  el('camExM')?.setAttribute('transform', `rotate(${(a / 2 - 315).toFixed(2)} ${AVE.vEx} ${AVE.camY})`);
  if (o.valves !== false) {
    el('vInM')?.setAttribute('transform', `translate(0 ${(avLift(a, 0) * 36).toFixed(2)})`);
    el('vExM')?.setAttribute('transform', `translate(0 ${(o.stuckEx ?? avLift(a, 540) * 36).toFixed(2)})`);
  }
  if (o.mix) {   // the mixture fills the space above the piston; blue going in, compressed, fire, grey going out
    const m = el('mix'), rect = m?.firstElementChild, ph = (((a % 720) + 720) % 720) / 180;
    if (m && rect) { const h = Math.max(0, pinY - 45 - AVE.top); rect.setAttribute('height', h.toFixed(1));
      rect.setAttribute('fill', ph < 2 ? AV.gas : ph < 3 ? AV.fire : '#9aa3b2'); m.setAttribute('opacity', ph < 1 ? String(0.45 + 0.4 * ph) : '0.85'); }
  }
}
// turns the engine from angle a0 to a1 between t and t + d
function avTurn(tl: gsap.core.Timeline, $: (q: string) => string, id: string, a0: number, a1: number, t: number, d: number, ease = 'none', o: { valves?: boolean; mix?: boolean; stuckEx?: number } = {}) {
  const p = { a: a0 };
  tl.fromTo(p, { a: a0 }, { a: a1, duration: d, ease, onUpdate: () => avEnginePose($, id, p.a, o), onStart: () => avEnginePose($, id, p.a, o) }, t);
  if (d > 0.8 && a1 !== a0) tl.fromTo($(`#${id}-walls, #${id}-head, #${id}-plug, #${id}-pipes`), { y: 0 }, { y: -3, duration: 0.05, ease: 'none', yoyo: true, repeat: Math.floor(d / 0.05), immediateRender: false }, t);
}
// sparks every time the angle crosses 360 (+720k) between a0 and a1, over [t, t + d], linear turn
function avSparks(tl: gsap.core.Timeline, $: (q: string) => string, id: string, a0: number, a1: number, t: number, d: number, boom = true) {
  for (let k = Math.ceil((a0 - 360) / 720); 360 + k * 720 <= a1; k++) {
    const ts = t + ((360 + k * 720 - a0) / (a1 - a0)) * d; avFlash(tl, $(`#${id}-spark`), ts - 0.05, 0.2); if (boom) avFlash(tl, $(`#${id}-boom`), ts + 0.03, 0.35);
  }
}

// ---------------- the timing belt, front view: big cam pulley on top, small crank pulley below
const AVT = { cx: 540, cy1: 760, R: 120, cy2: 1320, r: 62 };
function avBeltPath() {
  const { cx, cy1, R, cy2, r } = AVT, d = cy2 - cy1, ph = Math.asin((R - r) / d);
  const p = (x: number, y: number, rad: number, a: number) => `${(x + Math.cos(a) * rad).toFixed(1)} ${(y + Math.sin(a) * rad).toFixed(1)}`;
  const aR = -ph, aL = Math.PI + ph;   // tangent points (right and left)
  return `M${p(cx, cy1, R, aR)} L${p(cx, cy2, r, aR)} A${r} ${r} 0 0 1 ${p(cx, cy2, r, aL)} L${p(cx, cy1, R, aL)} A${R} ${R} 0 0 1 ${p(cx, cy1, R, aR)}Z`;
}
function avPulley(id: string, x: number, y: number, R: number, c = AV.steel) {
  return `<g id="${id}"><g transform="translate(${x} ${y})"><circle r="${R}" cx="10" cy="14" fill="#000" opacity="0.25"/><g id="${id}M">${avVol((a) => `<circle r="${R}" ${a}/>`, c, { sx: R * 0.16, sy: R * 0.16, k: 0.22 })}<circle r="${R * 0.72}" fill="${AV.steelL}" stroke="${AV.o}" stroke-width="5"/>
    ${[0, 1, 2, 3].map((i) => `<circle cx="${Math.cos(i * Math.PI / 2) * R * 0.45}" cy="${Math.sin(i * Math.PI / 2) * R * 0.45}" r="${R * 0.12}" fill="${AV.steelD}" stroke="${AV.o}" stroke-width="4"/>`).join('')}
    <circle r="${R * 0.18}" fill="${AV.iron}" stroke="${AV.o}" stroke-width="5"/><path d="M0 ${-R + 4} L-12 ${-R + 26} L12 ${-R + 26}Z" fill="${AV.red}"/></g></g></g>`;
}
function avTiming(id: string, hidden = false) {
  const { cx, cy1, R, cy2, r } = AVT, belt = avBeltPath();
  return `<g id="${id}">
    <rect x="318" y="622" width="480" height="860" rx="40" fill="#000" opacity="0.3"/>${avVol((a) => `<rect x="300" y="600" width="480" height="860" rx="40" ${a}/>`, '#8e9bb0', { sx: 24, sy: 24, k: 0.22 })}<rect x="330" y="630" width="420" height="800" rx="28" fill="#a7b3c6"/><rect x="350" y="650" width="40" height="760" rx="20" fill="#fff" opacity="0.18"/>
    ${avPulley(`${id}-cam`, cx, cy1, R)}${avPulley(`${id}-crk`, cx, cy2, r, AV.iron)}
    <g id="${id}-belt"><path d="${belt}" fill="none" stroke="${AV.o}" stroke-width="40" stroke-linejoin="round"/><path id="${id}-beltC" d="${belt}" fill="none" stroke="#3b3f4a" stroke-width="26" stroke-linejoin="round"/>
      <path id="${id}-teeth" d="${belt}" fill="none" stroke="#6d7385" stroke-width="12" stroke-dasharray="14 14" stroke-linejoin="round"/></g>
    <g id="${id}-glow" opacity="0"><path d="${belt}" fill="none" stroke="${AV.dShirt}" stroke-width="64" stroke-linejoin="round" opacity="0.55"/></g>
    <g id="${id}-broken" opacity="0"><path d="M${cx + R - 6} ${cy1 + 30} C ${cx + R + 30} ${cy1 + 200}, ${cx + 150} ${cy1 + 330}, ${cx + 200} ${cy1 + 420}" fill="none" stroke="${AV.o}" stroke-width="40" stroke-linecap="round"/><path d="M${cx + R - 6} ${cy1 + 30} C ${cx + R + 30} ${cy1 + 200}, ${cx + 150} ${cy1 + 330}, ${cx + 200} ${cy1 + 420}" fill="none" stroke="#3b3f4a" stroke-width="26" stroke-linecap="round"/>
      <path d="M${cx - r} ${cy2 + 10} C ${cx - r - 60} ${cy2 - 120}, ${cx - 180} ${cy2 - 240}, ${cx - 230} ${cy2 - 300}" fill="none" stroke="${AV.o}" stroke-width="40" stroke-linecap="round"/><path d="M${cx - r} ${cy2 + 10} C ${cx - r - 60} ${cy2 - 120}, ${cx - 180} ${cy2 - 240}, ${cx - 230} ${cy2 - 300}" fill="none" stroke="#3b3f4a" stroke-width="26" stroke-linecap="round"/></g>
    <g id="${id}-qm"${avVis(hidden)}><rect x="330" y="630" width="420" height="800" rx="28" fill="#3d2466" stroke="${AV.o}" stroke-width="${AV_SW}"/>${avQuestion(`${id}-q`, cx, 1040, 1.2)}</g>
  </g>`;
}
// the belt runs (teeth slide) and the pulleys turn: crank 2 turns for every cam turn
function avBeltRun(tl: gsap.core.Timeline, $: (q: string) => string, id: string, t: number, d: number, crankTurns = 2) {
  const len = 2 * Math.PI * AVT.r * crankTurns;
  tl.fromTo($(`#${id}-teeth`), { strokeDashoffset: 0 }, { strokeDashoffset: -len, duration: d, ease: 'none' }, t);
  tl.fromTo($(`#${id}-crkM`), { rotation: 0, svgOrigin: '0 0' }, { rotation: 360 * crankTurns, duration: d, ease: 'none' }, t);
  tl.fromTo($(`#${id}-camM`), { rotation: 0, svgOrigin: '0 0' }, { rotation: 180 * crankTurns, duration: d, ease: 'none' }, t);
}

// ---------------- props
function avWheel(id: string, x: number, y: number, s = 1) {
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})"><circle r="120" fill="none" stroke="${AV.o}" stroke-width="44"/><circle r="120" fill="none" stroke="#3b3f4a" stroke-width="28"/>
    ${avLimb(-110, 10, 110, 10, 22, '#3b3f4a')}${avLimb(0, 10, 0, 112, 22, '#3b3f4a')}<circle r="40" fill="#6d7385" stroke="${AV.o}" stroke-width="${AV_SW}"/><circle r="14" fill="${AV.red}"/></g></g>`;
}
function avTable(id: string, y: number, x0 = 140, x1 = 940) {
  const lh = Math.min(230, 1595 - y - 40);
  return `<g id="${id}"><rect x="${x0 + 40}" y="${y + 40}" width="40" height="${lh}" fill="#8a5a3b" stroke="${AV.o}" stroke-width="${AV_SW}"/><rect x="${x1 - 80}" y="${y + 40}" width="40" height="${lh}" fill="#8a5a3b" stroke="${AV.o}" stroke-width="${AV_SW}"/>
    <rect x="${x0 + 20}" y="${y + 50}" width="${x1 - x0 - 40}" height="18" fill="#000" opacity="0.18"/>${avVol((a) => `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="50" rx="10" ${a}/>`, '#b97a4a', { sx: 0, sy: 14, k: 0.2 })}<rect x="${x0 + 12}" y="${y + 8}" width="${x1 - x0 - 24}" height="10" rx="5" fill="#d79a68"/></g>`;
}
// a plain metal tube standing up (cutaway), base at (x, y)
function avTube(id: string, x: number, y: number, h = 300, w = 220) {
  return `<g id="${id}"><rect x="${x - w / 2 - 32}" y="${y - h}" width="32" height="${h}" fill="${AV.steel}" stroke="${AV.o}" stroke-width="${AV_SW}"/><rect x="${x + w / 2}" y="${y - h}" width="32" height="${h}" fill="${AV.steel}" stroke="${AV.o}" stroke-width="${AV_SW}"/>
    <rect x="${x - w / 2 - 32}" y="${y - h - 30}" width="${w + 64}" height="34" rx="6" fill="#aab6c8" stroke="${AV.o}" stroke-width="${AV_SW}"/><rect x="${x - w / 2 - 22}" y="${y - h + 10}" width="10" height="${h - 20}" fill="${AV.steelL}"/><rect x="${x + w / 2 + 16}" y="${y - h + 4}" width="12" height="${h - 8}" fill="#000" opacity="0.15"/><rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" fill="#000" opacity="0.06"/></g>`;
}
function avDrop(id: string, x: number, y: number, s = 1, c = '#ffb02e') {
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -60 C 30 -20, 44 4, 44 24 A44 44 0 0 1 -44 24 C -44 4, -30 -20, 0 -60Z" fill="${c}" stroke="${AV.o}" stroke-width="7"/><ellipse cx="-14" cy="18" rx="9" ry="14" fill="#fff" opacity="0.6"/></g></g>`;
}
function avHeat(id: string, x: number, y: number, n = 3) {
  return `<g id="${id}" opacity="0">${[...Array(n)].map((_, i) => `<path d="M${x + (i - (n - 1) / 2) * 70} ${y} q 22 -30 0 -60 q -22 -30 0 -60 q 22 -30 0 -60" fill="none" stroke="${AV.red}" stroke-width="14" stroke-linecap="round"/>`).join('')}</g>`;
}
function avRadiator(id: string, x: number, y: number) {
  let fins = ''; for (let i = 0; i < 9; i++) fins += `<line x1="${x - 110 + i * 27.5}" y1="${y - 170}" x2="${x - 110 + i * 27.5}" y2="${y + 170}" stroke="${AV.o}" stroke-width="7"/>`;
  return `<g id="${id}"><rect x="${x - 126}" y="${y - 184}" width="280" height="400" rx="20" fill="#000" opacity="0.28"/>${avVol((a) => `<rect x="${x - 140}" y="${y - 200}" width="280" height="400" rx="20" ${a}/>`, '#9fb0c8', { sx: 18, sy: 18 })}<rect x="${x - 120}" y="${y - 180}" width="240" height="360" fill="#c7d3e2"/>${fins}</g>`;
}
function avManual(id: string, x: number, y: number, s = 1) {
  const lines = (x0: number) => [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${x0}" y="${-110 + i * 42}" width="${i === 3 ? 170 : 150 - (i % 2) * 30}" height="14" rx="7" fill="${AV.steelD}"/>`).join('');
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -170 L-240 -190 L-240 170 L0 190 L240 170 L240 -190Z" fill="${AV.o}"/>
    <path d="M0 -160 L-226 -178 L-226 160 L0 178Z" fill="#fffaf0" stroke="${AV.o}" stroke-width="6"/><path d="M0 -160 L226 -178 L226 160 L0 178Z" fill="#fffaf0" stroke="${AV.o}" stroke-width="6"/>
    <text x="-113" y="-130" text-anchor="middle" font-size="30" font-weight="900" fill="${AV.o}" style="font-family: var(--font), system-ui, sans-serif">MANUAL</text>${lines(-200)}${lines(30)}
    <rect id="${id}-hl" x="22" y="10" width="190" height="34" rx="10" fill="${AV.dShirt}" opacity="0"/><rect x="30" y="16" width="170" height="14" rx="7" fill="${AV.red}"/></g></g>`;
}
function avCar(id: string, x: number, y: number, s = 1) {
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="98" rx="290" ry="18" fill="#000" opacity="0.18"/>${avVol((a) => `<path d="M-260 40 L-260 -40 Q-250 -70 -200 -76 L-120 -80 L-60 -150 L110 -150 L180 -80 L250 -70 Q270 -60 270 -20 L270 40Z" ${a}/>`, AV.red, { sx: 0, sy: 26, k: 0.22, hi: `<rect x="-230" y="-66" width="420" height="10" rx="5" fill="#fff" opacity="0.4"/>` })}
    <path d="M-40 -136 L-90 -84 L10 -84 L10 -136Z M30 -136 L30 -84 L150 -84 L104 -136Z" fill="#bfe3ff" stroke="${AV.o}" stroke-width="6" stroke-linejoin="round"/>
    <g id="${id}-w1"><g transform="translate(-160 40)"><circle r="56" fill="#3b3f4a" stroke="${AV.o}" stroke-width="${AV_SW}"/><circle r="24" fill="${AV.steel}" stroke="${AV.o}" stroke-width="5"/><rect x="-4" y="-50" width="8" height="26" fill="${AV.steel}"/></g></g>
    <g id="${id}-w2"><g transform="translate(170 40)"><circle r="56" fill="#3b3f4a" stroke="${AV.o}" stroke-width="${AV_SW}"/><circle r="24" fill="${AV.steel}" stroke="${AV.o}" stroke-width="5"/><rect x="-4" y="-50" width="8" height="26" fill="${AV.steel}"/></g></g></g></g>`;
}
// the Idio-two convertible: Tico (tid) driving, Dota (did) co-pilot on the far seat, plate on the back. Faces right.
function avCarIdio(id: string, tid: string, did: string, x: number, y: number, s = 1, plate = 'IDIO-TWO') {
  const O = AV.o, wheel = (wid: string, wx: number) => `<g id="${id}-${wid}"><g transform="translate(${wx} 40)">${avVol((a) => `<circle r="56" ${a}/>`, '#3b3f4a', { sx: 10, sy: 10 })}<circle r="24" fill="${AV.steel}" stroke="${O}" stroke-width="5"/><rect x="-4" y="-50" width="8" height="26" fill="${AV.steel}"/></g></g>`;
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="98" rx="290" ry="18" fill="#000" opacity="0.18"/>
    ${avDota(did, -150, 5, 0.42, 'up')}
    ${avTico(tid, 40, 30, 0.45, 'hold')}
    <g transform="translate(150 -92) rotate(-18)"><ellipse rx="14" ry="44" fill="none" stroke="${O}" stroke-width="16"/><ellipse rx="14" ry="44" fill="none" stroke="#3b3f4a" stroke-width="8"/></g>
    <path d="M150 -80 L188 -168 L204 -168 L172 -80Z" fill="#bfe3ff" opacity="0.7" stroke="${O}" stroke-width="6" stroke-linejoin="round"/>
    ${avVol((a) => `<path d="M-260 40 L-260 -40 Q-252 -80 -205 -82 L250 -82 Q272 -70 272 -20 L272 40Z" ${a}/>`, AV.red, { sx: 0, sy: 26, k: 0.22, hi: `<rect x="-232" y="-72" width="440" height="10" rx="5" fill="#fff" opacity="0.4"/>` })}
    <path d="M-20 -78 L-20 30" stroke="${O}" stroke-width="5" opacity="0.6"/><rect x="0" y="-50" width="44" height="12" rx="6" fill="#7a1f1f" stroke="${O}" stroke-width="4"/>
    <circle cx="258" cy="-38" r="14" fill="#fff6c8" stroke="${O}" stroke-width="5"/>
    <g id="${id}-plate"><rect x="-258" y="-74" width="168" height="50" rx="8" fill="#fffaf0" stroke="${O}" stroke-width="6"/>
      <text x="-174" y="-40" text-anchor="middle" font-size="27" font-weight="900" fill="${O}" style="font-family: var(--font), system-ui, sans-serif; letter-spacing: 1px">${plate}</text></g>
    ${wheel('w1', -160)}${wheel('w2', 170)}
  </g></g>`;
}
// the channel logo like the banner: "Idio" blue, "-" orange, "two" yellow, thick dark outline and a soft drop shadow
function avLogo(id: string, x: number, y: number, fs = 200) {
  const t = (fill: string, dx = 0, dy = 0, extra = '') => `<text x="${x + dx}" y="${y + dy}" text-anchor="middle" font-size="${fs}" font-weight="900" letter-spacing="-4" ${extra} style="font-family: var(--font), system-ui, sans-serif">${fill}</text>`;
  const spans = `<tspan fill="${AV.tShirt}">Idio</tspan><tspan fill="#e8622a">-</tspan><tspan fill="${AV.dShirt}">two</tspan>`;
  return `<g id="${id}">${t('Idio-two', 10, 14, `fill="#000" opacity="0.16"`)}${t(spans, 0, 0, `stroke="${AV.o}" stroke-width="${fs * 0.09}" stroke-linejoin="round" paint-order="stroke"`)}</g>`;
}
// a big call-out on a pill (the "¡SUSCRÍBANSE!" above the logo)
function avCallout(id: string, x: number, y: number, text: string, c = AV.red, fs = 74) {
  const w = text.length * fs * 0.66 + 90;
  return `<g id="${id}"><g transform="translate(${x} ${y})"><rect x="${-w / 2 + 8}" y="-50" width="${w}" height="112" rx="56" fill="#000" opacity="0.22"/>
    ${avVol((a) => `<rect x="${-w / 2}" y="-58" width="${w}" height="112" rx="56" ${a}/>`, c, { sx: 0, sy: 14, k: 0.22, sw: 9, hi: `<rect x="${-w / 2 + 34}" y="-46" width="${w * 0.45}" height="14" rx="7" fill="#fff" opacity="0.35"/>` })}
    <text x="0" y="${fs * 0.36}" text-anchor="middle" font-size="${fs}" font-weight="900" fill="#fff" stroke="${AV.o}" stroke-width="10" stroke-linejoin="round" paint-order="stroke" style="font-family: var(--font), system-ui, sans-serif">${text}</text></g></g>`;
}
// one of the 4 strokes: a small card with a mini cylinder and its word
function avStroke(id: string, x: number, y: number, word: string, c: string, pistonUp: boolean) {
  const py = pistonUp ? -40 : 30;
  return `<g id="${id}"><g transform="translate(${x} ${y})"><rect x="-96" y="-136" width="216" height="300" rx="28" fill="#000" opacity="0.25"/>${avVol((a) => `<rect x="-108" y="-150" width="216" height="300" rx="28" ${a}/>`, '#fffaf0', { sx: 14, sy: 14, k: 0.12 })}
    <rect x="-56" y="-110" width="112" height="${py + 110}" fill="${c}" opacity="0.8"/>
    <rect x="-64" y="-110" width="12" height="190" fill="${AV.steel}" stroke="${AV.o}" stroke-width="5"/><rect x="52" y="-110" width="12" height="190" fill="${AV.steel}" stroke="${AV.o}" stroke-width="5"/>
    <rect x="-52" y="${py}" width="104" height="44" rx="6" fill="${AV.steel}" stroke="${AV.o}" stroke-width="6"/>
    <text x="0" y="128" text-anchor="middle" font-size="36" font-weight="900" fill="${AV.o}" style="font-family: var(--font), system-ui, sans-serif">${word}</text></g></g>`;
}


// =====================================================================
//  The board plane (a wooden plank with wings) and what explains it. Nose to the right in the side view.
// =====================================================================
interface AvPlaneOpts { g?: boolean; turb?: boolean; stab?: boolean; elev?: boolean; fin?: boolean; rud?: boolean; flap?: boolean; ail?: boolean; tape?: boolean }
const avAirfoilPath = (k: number) => `M${-70 * k} 0 C ${-62 * k} ${-26 * k}, ${60 * k} ${-30 * k}, ${130 * k} ${2 * k} C ${60 * k} ${10 * k}, ${-40 * k} ${14 * k}, ${-70 * k} 0Z`;
function avPlank(x0: number, x1: number, h: number, fill: string = AVP.wood) {   // the wooden board, with grain
  const grain = [-0.45, -0.1, 0.25].map((f, i) => `<path d="M${x0 + 20} ${f * h} C ${x0 + (x1 - x0) * 0.3} ${f * h - 6}, ${x0 + (x1 - x0) * 0.6} ${f * h + 6}, ${x1 - 20 - i * 30} ${f * h}" stroke="${AVP.woodD}" stroke-width="3" fill="none" opacity="0.6"/>`).join('');
  return avVol((a) => `<rect x="${x0}" y="${-h}" width="${x1 - x0}" height="${2 * h}" rx="8" ${a}/>`, fill, { sx: 0, sy: h * 0.6, k: 0.25, hi: grain + `<rect x="${x0 + 14}" y="${-h + 6}" width="${(x1 - x0) * 0.5}" height="5" rx="2" fill="#fff" opacity="0.3"/>` });
}
function avTurbine(id: string, x: number, y: number, r = 34) {   // a pod with a spinning fan at its mouth
  const blades = [...Array(8)].map((_, i) => `<path d="M0 0 L${(Math.cos(i * Math.PI / 4) * r * 0.85).toFixed(1)} ${(Math.sin(i * Math.PI / 4) * r * 0.85).toFixed(1)} L${(Math.cos(i * Math.PI / 4 + 0.35) * r * 0.85).toFixed(1)} ${(Math.sin(i * Math.PI / 4 + 0.35) * r * 0.85).toFixed(1)}Z" fill="${AVP.wingD}"/>`).join('');
  return `<g id="${id}">${avVol((a) => `<rect x="${x - r * 3.2}" y="${y - r}" width="${r * 3.2}" height="${2 * r}" rx="${r}" ${a}/>`, '#c9ced8', { sx: 0, sy: r * 0.5, k: 0.25 })}
    <g transform="translate(${x} ${y})"><ellipse rx="${r * 0.55}" ry="${r}" fill="#3b3f4a" stroke="${AV.o}" stroke-width="6"/><g transform="scale(0.55 1)"><g id="${id}-fan">${blades}<circle r="${r * 0.22}" fill="${AVP.orange}"/></g></g></g></g>`;
}
function avPlaneSide(id: string, x: number, y: number, s = 1, o: AvPlaneOpts = {}) {
  const O = AV.o;
  const fin = `<g id="${id}-fin"${avVis(!!o.fin)}>${avVol((a) => `<path d="M-250 -20 L-300 -150 L-336 -150 L-326 -20Z" ${a}/>`, AVP.wing, { sx: 10, sy: 0, k: 0.2 })}
    <g id="${id}-rud"${avVis(!!o.rud)}><g id="${id}-rudM">${avVol((a) => `<path d="M-326 -20 L-336 -150 L-366 -150 L-360 -20Z" ${a}/>`, AVP.orange, { sx: 6, sy: 0, k: 0.2 })}</g></g></g>`;
  const stab = `<g id="${id}-stab"${avVis(!!o.stab)}>${avVol((a) => `<path d="M-236 0 C -244 -14, -300 -16, -322 -2 C -300 6, -250 8, -236 0Z" ${a}/>`, AVP.wing, { sx: 0, sy: 6, k: 0.2, sw: 6 })}
    <g id="${id}-elev"${avVis(!!o.elev)}><g id="${id}-elevM">${avVol((a) => `<path d="M-322 -4 L-372 -1 L-322 4Z" ${a}/>`, AVP.orange, { sx: 0, sy: 3, k: 0.2, sw: 6 })}</g></g></g>`;
  const turb = `<g id="${id}-turbG"${avVis(!!o.turb)}>${avTurbine(`${id}-turb`, 190, 74, 40)}<rect x="60" y="22" width="18" height="16" fill="${AVP.wingD}" stroke="${O}" stroke-width="5"/></g>`;
  const flap = `<g id="${id}-flap"${avVis(!!o.flap)}><g id="${id}-flapM">${avVol((a) => `<path d="M-86 4 L-170 30 L-162 40 L-80 14Z" ${a}/>`, AVP.orange, { sx: 0, sy: 4, k: 0.2, sw: 6 })}</g></g>`;
  const tape = o.tape ? `<rect x="10" y="-40" width="26" height="80" fill="#d9d3c0" opacity="0.85" stroke="${O}" stroke-width="4"/><rect x="70" y="-36" width="22" height="72" fill="#d9d3c0" opacity="0.85" stroke="${O}" stroke-width="4"/>` : '';
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})"><g id="${id}-body">
    <g transform="translate(-330 0) scale(1.6) translate(330 0)">${fin}${stab}</g>${avPlank(-330, 330, 30)}
    ${flap}${avVol((a) => `<path d="${avAirfoilPath(1.9)}" transform="translate(40 -6)" ${a}/>`, AVP.wing, { sx: 0, sy: 10, k: 0.22, hi: `<path d="M-80 -30 C 0 -50, 100 -50, 180 -22" transform="translate(40 -6)" stroke="#fff" stroke-width="5" fill="none" opacity="0.7"/>` })}${tape}
    ${turb}</g></g></g>`;
}
// front view: the board's end, the wings left-right, the ailerons at the tips (hinged at x = ±300), the turbines under the wings
function avPlaneFront(id: string, x: number, y: number, s = 1, o: AvPlaneOpts = {}) {
  const O = AV.o, ail = (side: number) => `<g id="${id}-ail${side > 0 ? 'R' : 'L'}"><path d="M${300 * side} -15 L${420 * side} -11 L${420 * side} 11 L${300 * side} 15Z" fill="${AVP.orange}" stroke="${O}" stroke-width="6" stroke-linejoin="round"/></g>`;
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})"><g id="${id}-body">
    <rect x="-4" y="-150" width="8" height="120" fill="${(o.g ? 'url(#gW)' : AVP.wing)}" stroke="${O}" stroke-width="5"/><rect x="-150" y="-36" width="300" height="10" rx="4" fill="${AVP.wingD}" stroke="${O}" stroke-width="5"/>
    ${avVol((a) => `<path d="M-300 -15 L300 -15 L300 15 L-300 15Z" ${a}/>`, (o.g ? 'url(#gW)' : AVP.wing), { sx: 0, sy: 9, k: 0.2 })}
    <g id="${id}-ails"${avVis(!!o.ail)}>${ail(1)}${ail(-1)}</g>
    ${avVol((a) => `<rect x="-30" y="-30" width="60" height="60" rx="8" ${a}/>`, (o.g ? 'url(#gWood)' : AVP.wood), { sx: 12, sy: 12, k: 0.25 })}
    <g${avVis(!!o.turb)}>${[-170, 170].map((tx, i) => `<rect x="${tx - 5}" y="8" width="10" height="18" fill="${AVP.wingD}" stroke="${O}" stroke-width="4"/><g transform="translate(${tx} 54)">${avVol((a) => `<circle r="32" ${a}/>`, '#c9ced8', { sx: 6, sy: 6 })}<circle r="22" fill="#3b3f4a" stroke="${O}" stroke-width="5"/><g id="${id}-fan${i}">${[0, 1, 2, 3, 4, 5].map((k) => `<rect x="-3" y="-20" width="6" height="20" fill="${AVP.wingD}" transform="rotate(${k * 60})"/>`).join('')}</g><circle r="6" fill="${AVP.orange}"/></g>`).join('')}</g>
  </g></g></g>`;
}
// top view (nose up): the board, swept wings, the tail plane and the rudder at the very end (hinged at y = 300)
function avPlaneTop(id: string, x: number, y: number, s = 1, o: AvPlaneOpts = {}) {
  const O = AV.o;
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})"><g id="${id}-body">
    ${avVol((a) => `<path d="M-30 -40 L-400 30 L-400 70 L-30 50 L30 50 L400 70 L400 30 L30 -40Z" ${a}/>`, (o.g ? 'url(#gW)' : AVP.wing), { sx: 0, sy: 14, k: 0.2 })}
    <g${avVis(!!o.stab)}>${avVol((a) => `<path d="M-26 250 L-140 290 L-140 310 L-26 300 L26 300 L140 310 L140 290 L26 250Z" ${a}/>`, (o.g ? 'url(#gW)' : AVP.wing), { sx: 0, sy: 8, k: 0.2 })}</g>
    <g transform="rotate(-90)">${avPlank(-330, 330, 26, o.g ? 'url(#gWood)' : AVP.wood)}</g>
    <g${avVis(!!o.fin)}><rect x="-6" y="190" width="12" height="110" fill="${(o.g ? 'url(#gW)' : AVP.wing)}" stroke="${O}" stroke-width="5"/><g id="${id}-rud"${avVis(!!o.rud)}><g id="${id}-rudM"><rect x="-6" y="300" width="12" height="46" fill="${AVP.orange}" stroke="${O}" stroke-width="5"/></g></g></g>
  </g></g></g>`;
}
// the wing in cut (air flows left to right): curved top, a little tilt (#-tilt), the flap at the trailing edge, flow lines and the lift arrow
function avAirfoil(id: string, x: number, y: number, s = 1) {
  const O = AV.o, wing = 'M-300 10 C -300 -60, -150 -95, 40 -80 C 180 -68, 280 -20, 320 12 C 200 22, -150 50, -270 40 C -300 34, -300 20, -300 10Z';
  const top = [-250, -185, -125].map((y0, i) => `M-560 ${y0} C -380 ${y0}, -220 ${y0 - 70 + i * 20}, 0 ${y0 - 50 + i * 25} S 360 ${y0 + 30 + i * 30}, 560 ${y0 + 150 + i * 30}`);
  const bot = [120, 190].map((y0, i) => `M-560 ${y0} C -300 ${y0}, -100 ${y0 + 10}, 160 ${y0 + 30} S 420 ${y0 + 90 + i * 20}, 560 ${y0 + 130 + i * 20}`);
  const flow = [...top, ...bot].map((d) => `<path d="${d}" fill="none" stroke="${AVP.air}" stroke-width="7" stroke-linecap="round" stroke-dasharray="46 34" opacity="0.9"/>`).join('');
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})">
    <g id="${id}-flow" opacity="0">${flow}</g>
    <g id="${id}-tilt"><g id="${id}-flap" opacity="0"><g id="${id}-flapM">${avVol((a) => `<path d="M286 6 L430 70 L420 86 L276 24Z" ${a}/>`, AVP.orange, { sx: 0, sy: 8, k: 0.2 })}</g></g>
      ${avVol((a) => `<path d="${wing}" ${a}/>`, AVP.wing, { sx: 0, sy: 22, k: 0.24, hi: `<path d="M-250 -40 C -150 -80, 0 -88, 150 -66" stroke="#fff" stroke-width="10" fill="none" opacity="0.6" stroke-linecap="round"/>` })}</g>
    <g id="${id}-down" opacity="0">${[360, 450].map((dx) => avArrow(`${id}-d${dx}`, dx, 120, dx + 30, 260, AVP.air, 16)).join('')}</g>
    <g id="${id}-lift" opacity="0">${avArrow(`${id}-up`, 0, -110, 0, -430, AVP.lime, 34)}</g>
  </g></g>`;
}
// the flow runs (dashes slide) between t and t + d; speed 1 = normal
const avFlow = (tl: gsap.core.Timeline, $: (q: string) => string, id: string, t: number, d: number, speed = 1) =>
  tl.fromTo($(`#${id}-flow path`), { strokeDashoffset: 0 }, { strokeDashoffset: -240 * d * speed, duration: d, ease: 'none' }, t);
// a dossier card: paper, a mono meta line, a big title and a year chip (for real events)
function avDossier(id: string, x: number, y: number, meta: string, title: string, year: string, line2 = '') {
  return `<g id="${id}"><g transform="translate(${x} ${y})"><rect x="-372" y="-212" width="760" height="440" fill="#000" opacity="0.4"/>
    <rect x="-380" y="-220" width="760" height="440" fill="${AVP.paper}"/><rect x="-380" y="-220" width="760" height="440" fill="url(#avDots)" opacity="0.05"/>
    <text x="-340" y="-160" font-size="26" font-weight="700" fill="#6b6a63" style="font-family: ui-monospace, 'DejaVu Sans Mono', monospace; letter-spacing: 3px">${meta}</text><line x1="-340" y1="-140" x2="340" y2="-140" stroke="#c9c5b6" stroke-width="3"/>
    <text x="-340" y="-60" font-size="62" font-weight="900" fill="${AVP.ink}" style="font-family: var(--font), system-ui, sans-serif">${title}</text>
    ${line2 ? `<text x="-340" y="0" font-size="34" font-weight="700" fill="#4a4943" style="font-family: var(--font), system-ui, sans-serif">${line2}</text>` : ''}
    <g id="${id}-year"><rect x="-340" y="60" width="280" height="110" rx="18" fill="${AVP.ink}"/><text x="-200" y="140" text-anchor="middle" font-size="80" font-weight="900" fill="${AVP.lime}" style="font-family: ui-monospace, 'DejaVu Sans Mono', monospace">${year}</text></g>
    <g id="${id}-stamp" opacity="0"><g transform="translate(190 110) rotate(-10)"><rect x="-150" y="-50" width="300" height="100" fill="none" stroke="${AVP.orange}" stroke-width="8"/><text x="0" y="18" text-anchor="middle" font-size="44" font-weight="900" fill="${AVP.orange}" style="font-family: var(--font), system-ui, sans-serif">PLANEÓ</text></g></g></g></g>`;
}
// a level bar with a mono label (altitude, speed, lift)
function avBar(id: string, x: number, y: number, label: string, c: string, h = 360) {
  return `<g id="${id}"><text x="${x}" y="${y + 50}" text-anchor="middle" font-size="26" font-weight="700" fill="#cfcdc4" style="font-family: ui-monospace, 'DejaVu Sans Mono', monospace; letter-spacing: 2px">${label}</text>
    <rect x="${x - 34}" y="${y - h}" width="68" height="${h}" fill="none" stroke="#4a4c56" stroke-width="4"/><g id="${id}-fill"><rect x="${x - 26}" y="${y - h + 8}" width="52" height="${h - 16}" fill="${c}"/><rect x="${x - 26}" y="${y - h + 8}" width="52" height="${h - 16}" fill="url(#avDots)" opacity="0.25"/></g>
    ${[0.25, 0.5, 0.75].map((f) => `<line x1="${x + 40}" y1="${y - h * f}" x2="${x + 56}" y2="${y - h * f}" stroke="#4a4c56" stroke-width="3"/>`).join('')}</g>`;
}
const avBarTo = (tl: gsap.core.Timeline, $: (q: string) => string, id: string, k: number, t: number, d = 0.6, y = 0) => tl.to($(`#${id}-fill`), { scaleY: k, svgOrigin: `0 ${y}`, duration: d, ease: 'power2.inOut' }, t);
function avBike(id: string, x: number, y: number, s = 1) {
  const O = AV.o, wheel = (wx: number) => `<g transform="translate(${wx} 0)"><circle r="70" fill="none" stroke="${O}" stroke-width="16"/><circle r="70" fill="none" stroke="#3b3f4a" stroke-width="8"/>${[0, 1, 2, 3].map((k) => `<line x1="0" y1="0" x2="${Math.cos(k * 0.785) * 66}" y2="${Math.sin(k * 0.785) * 66}" stroke="#9aa3b2" stroke-width="3"/><line x1="0" y1="0" x2="${-Math.cos(k * 0.785) * 66}" y2="${-Math.sin(k * 0.785) * 66}" stroke="#9aa3b2" stroke-width="3"/>`).join('')}<circle r="8" fill="${O}"/></g>`;
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})"><g id="${id}-w1">${wheel(-130)}</g><g id="${id}-w2">${wheel(130)}</g>
    <path d="M-130 0 L-40 -110 L80 -110 L130 0 M-40 -110 L0 0 L80 -110 M-130 0 L0 0" fill="none" stroke="${O}" stroke-width="18" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M-130 0 L-40 -110 L80 -110 L130 0 M-40 -110 L0 0 L80 -110 M-130 0 L0 0" fill="none" stroke="${AVP.orange}" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M80 -110 L95 -160 L130 -165" fill="none" stroke="${O}" stroke-width="10" stroke-linecap="round"/><rect x="-62" y="-130" width="50" height="14" rx="7" fill="${O}"/></g></g>`;
}
function avRock(id: string, x: number, y: number, s = 1) {
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})">${avVol((a) => `<path d="M-60 -20 L-30 -58 L30 -62 L66 -18 L52 44 L-10 60 L-58 36Z" ${a}/>`, '#8d8f96', { sx: 18, sy: 18, k: 0.3 })}</g></g>`;
}
function avGauge(id: string, x: number, y: number, s = 1) {
  const O = AV.o;
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})">${avVol((a) => `<circle r="120" ${a}/>`, '#2a2c35', { sx: 10, sy: 10 })}<circle r="100" fill="#15161c"/>
    <path d="M-80 20 A 85 85 0 0 1 80 20" fill="none" stroke="#4a4c56" stroke-width="14"/><path d="M-80 20 A 85 85 0 0 1 -55 -50" fill="none" stroke="${AVP.orange}" stroke-width="14"/>
    <text x="-74" y="58" text-anchor="middle" font-size="30" font-weight="900" fill="${AVP.orange}" style="font-family: ui-monospace, monospace">E</text><text x="74" y="58" text-anchor="middle" font-size="30" font-weight="900" fill="#cfcdc4" style="font-family: ui-monospace, monospace">F</text>
    <g id="${id}-needle"><line x1="0" y1="0" x2="0" y2="-82" stroke="${AVP.lime}" stroke-width="8" stroke-linecap="round"/></g><circle r="12" fill="${AVP.lime}" stroke="${O}" stroke-width="4"/>
    <text x="0" y="92" text-anchor="middle" font-size="22" font-weight="700" fill="#cfcdc4" style="font-family: ui-monospace, monospace; letter-spacing: 3px">COMBUSTIBLE</text></g></g>`;
}
// a cabin seat seen from the side (the passenger sits behind it), with an optional belt across
function avSeat(id: string, x: number, y: number, s = 1) {
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})">${avVol((a) => `<path d="M-90 0 L-90 -40 Q-90 -60 -70 -60 L60 -60 Q80 -60 80 -40 L80 0Z" ${a}/>`, '#3d6bff', { sx: 10, sy: 10 })}
    ${avVol((a) => `<path d="M-110 -40 L-130 -330 Q-130 -360 -100 -360 L-80 -360 Q-60 -360 -62 -330 L-50 -40Z" ${a}/>`, '#3d6bff', { sx: 10, sy: 0 })}<rect x="-20" y="-20" width="20" height="80" fill="#1d2140"/></g></g>`;
}

// =====================================================================
//  World test shots (listed in world.json)
// =====================================================================
const avTest = (body: string) => svg(`${avPrint()}${body}`, AV_DEFS);
defineVisuals({
  'test-sky': {
    html: () => svg(`${avSky(true)}${avTrail('tr', 160, 1010)}${avPlane3('p3', 560, 1000, 1.05, { tape: true })}`, AV_SKY_DEFS),
    anim(tl, s, K, $) {
      avSkyRun(tl, $, s);
      avPaint(tl, $, 'p3', 'prop', K('a')); tl.fromTo($('#p3-spin'), { rotation: 0, svgOrigin: '0 0' }, { rotation: 3600, duration: s.t1 - K('a'), ease: 'none' }, K('a'));
      avPaint(tl, $, 'p3', 'stab', K('b'), ['stabF', 'elev']); avPaint(tl, $, 'p3', 'fin', K('c'), ['rud']); avPaint(tl, $, 'p3', 'ail', K('d'), ['flap']);
    },
  },
  'test-sky2': {
    html: () => svg(`${avNavyGrid()}${avAirliner('al', 540, 760, 1)}${avPlaneFront('pf', 540, 1200, 0.9, { g: true, turb: true, ail: true })}${avPlaneTop('pt', 540, 1560, 0.4, { g: true, stab: true, fin: true, rud: true })}`, AV_SKY_DEFS),
    anim() {},
  },
  'test-side': {
    html: () => avTest(`${avPlaneSide('ps', 540, 1000, 1.25, { tape: true })}`),
    anim(tl, s, K, $) {
      tl.set($('#ps-turbG'), { opacity: 1 }, K('turb')); avPop(tl, $('#ps-turbG'), K('turb'));
      tl.fromTo($('#ps-turb-fan'), { rotation: 0, svgOrigin: '0 0' }, { rotation: 1440, duration: s.t1 - K('turb'), ease: 'none' }, K('turb'));
      tl.set($('#ps-stab'), { opacity: 1 }, K('stab')); tl.set($('#ps-elev'), { opacity: 1 }, K('stab'));
      tl.set($('#ps-fin'), { opacity: 1 }, K('fin')); tl.set($('#ps-rud'), { opacity: 1 }, K('fin'));
      tl.set($('#ps-flap'), { opacity: 1 }, K('flap'));
      tl.fromTo($('#ps-elevM'), { rotation: 0, svgOrigin: '-322 0' }, { rotation: 25, duration: 0.3, yoyo: true, repeat: 1 }, K('flap'));
      tl.fromTo($('#ps-flapM'), { rotation: -20, svgOrigin: '-66 8' }, { rotation: 20, duration: 0.4 }, K('flap'));
      tl.fromTo($('#ps-body'), { rotation: 0, svgOrigin: '0 0' }, { rotation: -10, duration: 0.4 }, K('flap') + 0.2);
    },
  },
  'test-views': {
    html: () => avTest(`${avPlaneFront('pf', 540, 760, 1, { turb: true, ail: true })}${avPlaneTop('pt', 540, 1260, 0.55, { stab: true, fin: true, rud: true })}`),
    anim(tl, s, K, $) {
      tl.fromTo($('#pf-ailR'), { rotation: 0, svgOrigin: '300 0' }, { rotation: -22, duration: 0.3 }, K('roll'));
      tl.fromTo($('#pf-ailL'), { rotation: 0, svgOrigin: '-300 0' }, { rotation: -22, duration: 0.3 }, K('roll'));
      tl.fromTo($('#pf-body'), { rotation: 0, svgOrigin: '0 0' }, { rotation: -18, duration: 0.6 }, K('roll') + 0.2);
      tl.fromTo($('#pt-rudM'), { rotation: 0, svgOrigin: '0 300' }, { rotation: 25, duration: 0.3 }, K('roll'));
    },
  },
  'test-airfoil': {
    html: () => avTest(`${avAirfoil('af', 540, 1050, 1)}`),
    anim(tl, s, K, $) {
      tl.set($('#af-flow'), { opacity: 1 }, s.t0); avFlow(tl, $, 'af', s.t0, s.t1 - s.t0);
      tl.fromTo($('#af-tilt'), { rotation: 0, svgOrigin: '0 0' }, { rotation: 8, duration: 0.5 }, s.t0 + 0.3);
      tl.set($('#af-lift'), { opacity: 1 }, K('lift')); tl.set($('#af-down'), { opacity: 1 }, K('lift'));
      tl.set($('#af-flap'), { opacity: 1 }, K('flap')); tl.fromTo($('#af-flapM'), { rotation: -18, svgOrigin: '290 14' }, { rotation: 12, duration: 0.5 }, K('flap'));
    },
  },
  'test-props': {
    html: () => avTest(`${avDossier('ds', 540, 760, 'ARCHIVO · CANADÁ', 'Air Canada', '1983', 'Sin combustible en pleno vuelo')}${avGauge('gg', 300, 1250, 0.9)}${avBar('b1', 700, 1450, 'ALTURA', AVP.air, 300)}${avBar('b2', 880, 1450, 'VELOCIDAD', AVP.lime, 300)}${avRock('rk', 520, 1180, 1)}${avMark('mk', 300, 1250, 130, 'MOTOR')}`),
    anim(tl, s, K, $) {
      tl.set($('#ds-stamp'), { opacity: 1 }, K('m')); avBarTo(tl, $, 'b1', 0.4, K('m'), 0.6, 1442);
      tl.fromTo($('#gg-needle'), { rotation: 60, svgOrigin: '0 0' }, { rotation: -70, duration: 0.6 }, K('m'));
      avMarkIn(tl, $, 'mk', 300, 1250, K('m'), 1.2, true);
    },
  },
  'test-chars': {
    html: () => avTest(`${avBike('bk', 700, 1460, 1)}${avDota('d', 700, 1350, 0.75, 'up')}${avSeat('st', 260, 1500, 1)}${avTico('tk', 330, 1480, 0.7, 'cross')}`),
    anim() {},
  },
});

// =====================================================================
//  SKY STYLE (the building part, from the user's second reference): bright sky, puffy clouds, grass,
//  soft shading (gradients) for a 3D feel, new parts painted lime first, a dotted trail behind the plane.
// =====================================================================
const AV_SKY_DEFS = `${AV_DEFS}
  <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a7fd9"/><stop offset="0.65" stop-color="#7cc0f5"/><stop offset="1" stop-color="#c4e6ff"/></linearGradient>
  <linearGradient id="gCloud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d6e8f7"/></linearGradient>
  <linearGradient id="gW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#bfc9d9"/></linearGradient>
  <linearGradient id="gWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e3bb"/><stop offset="1" stop-color="#c39252"/></linearGradient>
  <linearGradient id="gWoodTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3d6"/><stop offset="1" stop-color="#ead1a0"/></linearGradient>
  <linearGradient id="gOr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9a5a"/><stop offset="1" stop-color="#d9441a"/></linearGradient>
  <linearGradient id="gLime" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0ff7a"/><stop offset="1" stop-color="#a9d61c"/></linearGradient>
  <linearGradient id="gMetal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2f5f9"/><stop offset="1" stop-color="#8f99aa"/></linearGradient>
  <linearGradient id="gGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86d35f"/><stop offset="1" stop-color="#3b8f37"/></linearGradient>
  <linearGradient id="gNavy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c336f"/><stop offset="1" stop-color="#0c1838"/></linearGradient>
  <linearGradient id="gBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#e9eef5"/><stop offset="1" stop-color="#9aa6b8"/></linearGradient>
  <linearGradient id="gTail" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3f7bff"/><stop offset="1" stop-color="#1b3fb0"/></linearGradient>`;
const avCloud = (x: number, y: number, k: number, op = 1) => `<g transform="translate(${x} ${y}) scale(${k})" opacity="${op}"><ellipse cx="0" cy="40" rx="190" ry="40" fill="#b9d6ef"/><circle cx="-90" cy="10" r="62" fill="url(#gCloud)"/><circle cx="0" cy="-30" r="88" fill="url(#gCloud)"/><circle cx="95" cy="5" r="66" fill="url(#gCloud)"/><rect x="-150" y="10" width="300" height="56" rx="28" fill="url(#gCloud)"/></g>`;
// the sky set: gradient sky, three layers of clouds (#cl1 far … #cl3 near, for parallax) and an optional green ground
function avSky(ground = false) {
  return `<rect width="1080" height="1920" fill="url(#gSky)"/>
    <g id="cl1">${avCloud(160, 620, 0.55, 0.8)}${avCloud(860, 760, 0.45, 0.8)}${avCloud(560, 1380, 0.5, 0.75)}${avCloud(1240, 1150, 0.5, 0.8)}</g>
    <g id="cl2">${avCloud(380, 900, 0.8)}${avCloud(1000, 1240, 0.75)}${avCloud(1500, 650, 0.8)}</g>
    ${ground ? `<path d="M-40 1500 C 300 1440, 700 1480, 1120 1430 L1120 1960 L-40 1960Z" fill="url(#gGround)"/><path d="M-40 1560 C 260 1520, 640 1560, 1120 1520" stroke="#2f7a2c" stroke-width="6" fill="none" opacity="0.5"/>` : ''}
    <g id="cl3">${avCloud(-60, 1650, 1.0)}${avCloud(1180, 520, 0.9)}</g>`;
}
// clouds drift (far slow, near fast) — the plane flies right
function avSkyRun(tl: gsap.core.Timeline, $: (q: string) => string, s: Scene, speed = 1) {
  const d = s.t1 - s.t0;
  tl.fromTo($('#cl1'), { x: 0 }, { x: -120 * speed * d / 3, duration: d, ease: 'none' }, s.t0);
  tl.fromTo($('#cl2'), { x: 0 }, { x: -300 * speed * d / 3, duration: d, ease: 'none' }, s.t0);
  tl.fromTo($('#cl3'), { x: 0 }, { x: -600 * speed * d / 3, duration: d, ease: 'none' }, s.t0);
}
// the wing-cut set of the reference: navy with a faint grid and streaks of wind
function avNavyGrid() {
  let g = ''; for (let x = 0; x <= 1080; x += 72) g += `<line x1="${x}" y1="0" x2="${x}" y2="1920" stroke="#2b4590" stroke-width="2" opacity="0.5"/>`;
  for (let y = 0; y <= 1920; y += 72) g += `<line x1="0" y1="${y}" x2="1080" y2="${y}" stroke="#2b4590" stroke-width="2" opacity="0.5"/>`;
  const streaks = [...Array(26)].map((_, i) => `<line x1="${(i * 173) % 1080}" y1="${520 + ((i * 89) % 1100)}" x2="${((i * 173) % 1080) + 90}" y2="${520 + ((i * 89) % 1100)}" stroke="#c9dcff" stroke-width="4" stroke-linecap="round" opacity="0.35"/>`).join('');
  return `<rect width="1080" height="1920" fill="url(#gNavy)"/>${g}<g id="cl1"><g id="streaks">${streaks}</g></g><g id="cl2"></g><g id="cl3"></g>`;
}
// the board plane in 3/4 view (nose right, seen a bit from above): plank with a top face, wings in perspective
// (far half behind the plank, near half in front), and parts that can appear: prop (nose), stab + elev, fin + rud, ail, flap.
// Each part has a lime "Hi" twin to paint it lime when it is added.
interface AvP3 { prop?: boolean; stab?: boolean; elev?: boolean; fin?: boolean; rud?: boolean; ail?: boolean; flap?: boolean; tape?: boolean }
function avPlane3(id: string, x: number, y: number, s = 1, o: AvP3 = {}) {
  const O = AV.o, poly = (pts: number[][], fill: string, extra = '') => `<path d="M${pts.map((p) => p.join(' ')).join(' L')}Z" fill="${fill}" stroke="${O}" stroke-width="5" stroke-linejoin="round" ${extra}/>`;
  const part = (pid: string, on: boolean, pts: number[][], fill: string) => `<g id="${id}-${pid}"${avVis(on)}><g id="${id}-${pid}M">${poly(pts, fill)}<g id="${id}-${pid}Hi" opacity="0">${poly(pts, 'url(#gLime)')}</g></g></g>`;
  const farW = [[170, -160], [80, -160], [-4, 0], [86, 0]], nearW = [[86, 0], [-4, 0], [-100, 200], [-10, 200]];
  const farS = [[-246, -70], [-292, -70], [-316, 0], [-270, 0]], nearS = [[-270, 0], [-316, 0], [-346, 84], [-300, 84]];
  const fin = [[-250, -22], [-298, -170], [-330, -170], [-322, -22]], rud = [[-322, -22], [-330, -170], [-360, -170], [-356, -22]];
  const elev = [[-316, 0], [-346, 84], [-368, 84], [-336, 0]], ail = [[-46, 104], [-90, 196], [-112, 196], [-68, 104]], flap = [[-2, 6], [-40, 86], [-66, 86], [-28, 6]];
  const blade = `<path d="M-10 0 C -12 -40, -4 -96, 0 -110 C 6 -96, 12 -40, 10 0Z" fill="#3b3f4a"/>`;
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})"><g id="${id}-body">
    ${part('stabF', !!o.stab, farS, 'url(#gW)')}${poly(farW, 'url(#gW)')}
    ${part('fin', !!o.fin, fin, 'url(#gW)')}${part('rud', !!o.rud, rud, 'url(#gOr)')}
    ${poly([[-330, -12], [330, -12], [346, -26], [-314, -26]], 'url(#gWoodTop)')}${poly([[-330, -12], [330, -12], [330, 20], [-330, 20]], 'url(#gWood)')}${poly([[330, -12], [346, -26], [346, 6], [330, 20]], '#b5874a')}
    <path d="M-300 2 C -100 -2, 100 6, 300 0" stroke="#a87a3e" stroke-width="3" fill="none" opacity="0.6"/>
    ${o.tape ? `<rect x="20" y="-30" width="22" height="54" fill="#e3dccb" stroke="${O}" stroke-width="4" opacity="0.9"/><rect x="62" y="-30" width="20" height="54" fill="#e3dccb" stroke="${O}" stroke-width="4" opacity="0.9"/>` : ''}
    ${poly(nearW, 'url(#gW)')}<path d="M86 0 L-10 200" stroke="#fff" stroke-width="6" opacity="0.7"/>
    ${part('flap', !!o.flap, flap, 'url(#gOr)')}${part('ail', !!o.ail, ail, 'url(#gOr)')}
    ${part('stab', !!o.stab, nearS, 'url(#gW)')}${part('elev', !!o.elev, elev, 'url(#gOr)')}
    <g id="${id}-prop"${avVis(!!o.prop)}><g id="${id}-propM">${poly([[346, -26], [346, 20], [392, 6], [400, -6]], 'url(#gOr)')}<g id="${id}-propHi" opacity="0">${poly([[346, -26], [346, 20], [392, 6], [400, -6]], 'url(#gLime)')}</g>
      <g transform="translate(404 -2) scale(0.28 1)"><g id="${id}-spin">${blade}<g transform="rotate(180)">${blade}</g></g></g><ellipse cx="404" cy="-2" rx="9" ry="12" fill="#ff9a5a" stroke="${O}" stroke-width="4"/></g></g>
  </g></g></g>`;
}
// a new part appears painted lime and then takes its colour
function avPaint(tl: gsap.core.Timeline, $: (q: string) => string, id: string, part: string, t: number, also: string[] = []) {
  for (const p of [part, ...also]) { tl.set($(`#${id}-${p}`), { opacity: 1 }, t); avPop(tl, $(`#${id}-${p}M`), t, 0.45); tl.set($(`#${id}-${p}Hi`), { opacity: 1 }, t); tl.to($(`#${id}-${p}Hi`), { opacity: 0, duration: 0.6, ease: 'power1.in' }, t + 1.1); }
}
// dotted trail behind a flying plane (from its tail to the left edge)
const avTrail = (id: string, x: number, y: number) => `<path id="${id}" d="M${x} ${y} C ${x - 200} ${y + 10}, ${x - 400} ${y - 20}, -60 ${y + 30}" fill="none" stroke="#ffffff" stroke-width="6" stroke-dasharray="4 16" stroke-linecap="round" opacity="0.85"/>`;
// a real-looking airliner (side view, nose right): body, belly stripe, windows, swept wing, engines, blue tail, gear
function avAirliner(id: string, x: number, y: number, s = 1) {
  const O = '#22252e';
  const wins = [...Array(16)].map((_, i) => `<rect x="${-240 + i * 30}" y="-34" width="14" height="20" rx="6" fill="#203050"/>`).join('');
  return `<g id="${id}"><g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-60 10 L-180 -150 L-140 -150 L60 6Z" fill="#b8c2d2" stroke="${O}" stroke-width="4"/>
    <path d="M-330 -20 L-420 -200 L-370 -200 L-280 -24Z" fill="url(#gTail)" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M-360 -10 L-460 -36 L-440 -46 L-330 -26Z" fill="#c9d1de" stroke="${O}" stroke-width="4"/>
    <path d="M-400 -30 C -380 -60, -300 -64, -200 -64 L 300 -64 C 380 -64, 430 -40, 450 -10 C 440 20, 400 40, 300 44 L -260 44 C -340 44, -390 10, -400 -30Z" fill="url(#gBody)" stroke="${O}" stroke-width="5"/>
    <path d="M-380 0 C -300 30, 300 34, 440 0" stroke="#1b3fb0" stroke-width="12" fill="none"/>${wins}
    <path d="M392 -46 L428 -30 L420 -22 L384 -36Z" fill="#203050"/>
    <path d="M-60 10 L120 6 L-120 150 L-170 150Z" fill="url(#gMetal)" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <g transform="translate(-40 70)"><rect x="-70" y="-22" width="150" height="48" rx="24" fill="url(#gMetal)" stroke="${O}" stroke-width="4"/><ellipse cx="80" cy="2" rx="10" ry="22" fill="#2b2f3a"/></g>
    <g id="${id}-gear"><line x1="300" y1="44" x2="300" y2="80" stroke="${O}" stroke-width="8"/><circle cx="300" cy="86" r="14" fill="#2b2f3a"/><line x1="-20" y1="44" x2="-20" y2="84" stroke="${O}" stroke-width="10"/><circle cx="-34" cy="92" r="16" fill="#2b2f3a"/><circle cx="-4" cy="92" r="16" fill="#2b2f3a"/></g>
  </g></g>`;
}
