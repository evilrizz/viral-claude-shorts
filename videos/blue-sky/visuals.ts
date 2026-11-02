// =====================================================================
//  Custom visuals for "¿Por qué el cielo es azul?" (flat 2D, HyperFrames).
//  defineVisuals({ id: { bg, ink (title color on light backgrounds), html(s) -> SVG, anim(tl, s, K, $) } }): K('key') = when it's said; $('#x') = selector inside the scene.
//  Everything is animated on the timeline tl (absolute video times).
// =====================================================================
defineVisuals({
  hook: {
    bg: F2.sky, ink: F2.night,
    html: () => svg(`
      <rect x="0" y="0" width="1080" height="1920" fill="${F2.sky}"/><rect x="0" y="0" width="1080" height="700" fill="${F2.skyD}" opacity="0.35"/>
      ${f2Sun('sun', 790, 820, 95)}
      ${f2Cloud('c1', 300, 880, 0.9)}${f2Cloud('c2', 640, 1080, 0.7)}
      <g id="sea"><path d="M-40 1290 Q 135 1250 270 1290 T 540 1290 T 810 1290 T 1120 1290 L1120 1960 L-40 1960Z" fill="${F2.blue}"/>
        <path id="ripple" d="M-300 1340 Q -165 1310 -30 1340 T 240 1340 T 510 1340 T 780 1340 T 1050 1340 T 1320 1340" stroke="#fff" stroke-width="10" fill="none" opacity="0.5" stroke-linecap="round"/></g>
      <g id="reflection" opacity="0"><path d="M320 1270 C 260 1120, 300 960, 420 880" stroke="#fff" stroke-width="16" fill="none" stroke-dasharray="30 22" stroke-linecap="round"/>
        <path d="M420 880 l-50 4 l28 42z" fill="#fff"/></g>
      <g id="cross" transform="translate(350 1080)"><rect x="-110" y="-22" width="220" height="44" rx="22" fill="${F2.red}" transform="rotate(45)"/><rect x="-110" y="-22" width="220" height="44" rx="22" fill="${F2.red}" transform="rotate(-45)"/></g>`),
    anim(tl, s, K, $) {
      f2Pop(tl, $('#sun'), s.t0 + 0.1, 0.6);
      tl.fromTo($('#sun .rays'), { rotation: 0, transformOrigin: '50% 50%' }, { rotation: 40, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
      tl.fromTo($('#c1'), { x: -60 }, { x: 60, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
      tl.fromTo($('#c2'), { x: 40 }, { x: -50, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
      tl.fromTo($('#ripple'), { x: 0 }, { x: 270, duration: s.t1 - s.t0, ease: 'none' }, s.t0);
      tl.fromTo($('#sea'), { y: 300 }, { y: 0, duration: 0.6, ease: 'power3.out' }, s.t0 + 0.15);
      tl.fromTo($('#reflection'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, K('sea') - 0.6);
      f2Pop(tl, $('#cross'), K('sea') + 0.1, 0.35);
    },
  },
  white: {
    bg: F2.night,
    html: () => svg(`
      ${[...Array(30)].map((_, i) => `<circle cx="${(i * 197) % 1080}" cy="${700 + ((i * 331) % 760)}" r="${2 + (i % 3)}" fill="#fff" opacity="0.35"/>`).join('')}
      ${f2Sun('sunW', 170, 820, 80)}
      <rect id="ray" x="230" y="980" width="290" height="26" rx="13" fill="#fff" transform="rotate(14 230 993)"/>
      <g id="fan">${RAINBOW.map((c, i) => `<path d="M560 1050 L1120 ${880 + i * 70} L1120 ${950 + i * 70} Z" fill="${c}"/>`).join('')}</g>
      <g id="prism"><path d="M560 860 L700 1140 L420 1140 Z" fill="#bfe3ff" opacity="0.9"/><path d="M560 860 L700 1140 L620 1140 Z" fill="#9fd0f7"/></g>`),
    anim(tl, s, K, $) {
      f2Pop(tl, $('#sunW'), s.t0 + 0.05);
      f2Pop(tl, $('#prism'), s.t0 + 0.25);
      tl.fromTo($('#ray'), { scaleX: 0, svgOrigin: '230 993' }, { scaleX: 1, duration: 0.5, ease: 'power2.out' }, K('white') - 0.3);
      tl.fromTo($('#fan'), { scaleX: 0, svgOrigin: '560 1050' }, { scaleX: 1, duration: 0.7, ease: 'power3.out' }, K('colors') - 0.2);
    },
  },
  collision: {
    bg: '#1f3566',
    html: () => svg(`
      ${[[220, 760], [480, 900], [820, 780], [300, 1080], [700, 1060], [520, 1250], [160, 1300], [880, 1280]].map(([x, y], i) => f2Molecule('m' + i, x, y, 36, '#dff2ff', '#9fb6dd')).join('')}
      <g id="waves">${f2Wave('w1', -900, 100, 880, 70, 22, F2.blue)}${f2Wave('w2', -900, 100, 1010, 110, 22, F2.green)}${f2Wave('w3', -900, 100, 1150, 180, 22, F2.red)}</g>`),
    anim(tl, s, K, $) {
      for (let i = 0; i < 8; i++) {
        f2Pop(tl, $('#m' + i), s.t0 + 0.05 + i * 0.06, 0.4);
        tl.to($('#m' + i), { y: (i % 2 ? 1 : -1) * 18, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: Math.ceil((s.t1 - s.t0) / 1.1) }, s.t0 + 0.5);
      }
      tl.fromTo($('#waves'), { x: 0 }, { x: 1150, duration: (K('hit') - K('air')) + 1.6, ease: 'power1.in' }, K('air') - 0.4);
      for (let i = 0; i < 8; i++) tl.to($('#m' + i), { rotation: (i % 2 ? 25 : -25), transformOrigin: '50% 50%', duration: 0.12, yoyo: true, repeat: 3, ease: 'sine.inOut' }, K('hit') + 0.2 + i * 0.05);
    },
  },
  blue: {
    bg: F2.night,
    html: () => svg(`
      ${f2Wave('blueIn', -500, 440, 900, 60, 26, F2.blue, 14)}
      ${f2Wave('redIn', -500, 1600, 1120, 200, 26, F2.red, 14)}
      ${f2Molecule('mol', 505, 900, 60)}
      <g id="bounces">${[...Array(8)].map((_, i) => { const a = i / 8 * Math.PI * 2 + 0.3; return f2Arrow('r' + i, 505 + Math.cos(a) * 110, 900 + Math.sin(a) * 110, 505 + Math.cos(a) * 280, 900 + Math.sin(a) * 280, F2.blue, 14); }).join('')}</g>`),
    anim(tl, s, K, $) {
      f2Pop(tl, $('#mol'), s.t0 + 0.1, 0.5);
      tl.fromTo($('#blueIn'), { x: -600 }, { x: 0, duration: 1.0, ease: 'power2.out' }, K('wave') - 0.6);
      tl.fromTo($('#redIn'), { x: -1100 }, { x: 0, duration: s.t1 - K('wave') + 0.3, ease: 'none' }, K('wave') - 0.3);
      tl.fromTo($('#bounces g'), { scale: 0, svgOrigin: '505 900' }, { scale: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.06 }, K('bounce') - 0.1);
      tl.fromTo($('#bounces'), { scale: 1, svgOrigin: '505 900' }, { scale: 1.08, duration: 0.5, ease: 'sine.inOut', yoyo: true, repeat: 2 }, K('bounce') + 0.6);
      tl.to($('#mol'), { rotation: 360, transformOrigin: '50% 50%', duration: s.t1 - s.t0, ease: 'none' }, s.t0);
    },
  },
  everywhere: {
    bg: F2.sky, ink: F2.night,
    html: () => svg(`
      <rect width="1080" height="1920" fill="${F2.sky}"/>
      <g id="skyArrows">${[...Array(10)].map((_, i) => { const a = Math.PI * (1.05 + i * 0.09), cx = 505, cy = 1180; return f2Arrow('f' + i, cx + Math.cos(a) * 560, cy + Math.sin(a) * 560, cx + Math.cos(a) * 170, cy + Math.sin(a) * 170, F2.blueD, 16); }).join('')}</g>
      ${f2Hill('hill', 1300, F2.green, F2.greenD, 50)}
      ${f2Person('person', 505, 1090, 0.9)}`),
    anim(tl, s, K, $) {
      tl.fromTo($('#hill'), { y: 300 }, { y: 0, duration: 0.6, ease: 'power3.out' }, s.t0 + 0.05);
      f2Pop(tl, $('#person'), s.t0 + 0.3);
      tl.fromTo($('#skyArrows g'), { opacity: 0, scale: 0.6, svgOrigin: '505 1180' }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)', stagger: 0.12 }, K('scatter'));
      tl.to($('#skyArrows'), { scale: 0.94, svgOrigin: '505 1180', duration: 0.3, yoyo: true, repeat: 1, ease: 'sine.inOut' }, K('everywhere') - 0.1);
    },
  },
  sunset: {
    bg: F2.sky, ink: F2.night,
    html: () => svg(`
      <rect id="skyS" width="1080" height="1920" fill="${F2.sky}"/>
      <path id="layer" d="M-200 1500 A 900 900 0 0 1 1280 1500 L1280 1600 A 1000 1000 0 0 0 -200 1600Z" fill="#ffffff" opacity="0.18"/>
      ${f2Sun('sunS', 505, 760, 90)}
      <path id="path" d="M80 1050 C 300 1180, 700 1230, 1000 1310" stroke="#fff" stroke-width="12" fill="none" stroke-dasharray="1200" stroke-dashoffset="1200" stroke-linecap="round"/>
      <g id="blues">${[...Array(7)].map((_, i) => `<circle cx="${200 + i * 110}" cy="${1110 + i * 26}" r="16" fill="${F2.blue}"/>`).join('')}</g>
      ${f2Hill('hillS', 1330, F2.greenD, '#1e7d58', 40)}`),
    anim(tl, s, K, $) {
      tl.fromTo($('#sunS'), { y: 0 }, { y: 540, duration: K('oranges') - s.t0, ease: 'power1.inOut' }, s.t0 + 0.2);
      tl.fromTo($('#sunS .disc'), { fill: F2.yellow }, { fill: F2.orange, duration: 2.5 }, K('cross'));
      tl.fromTo($('#skyS'), { fill: F2.sky }, { fill: '#ff9a5c', duration: K('oranges') - K('cross') + 0.4, ease: 'power1.inOut' }, K('cross'));
      tl.fromTo($('#path'), { strokeDashoffset: 1200 }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, K('cross') - 0.2);
      tl.fromTo($('#blues circle'), { opacity: 0, y: 0 }, { opacity: 1, duration: 0.2, stagger: 0.08 }, K('cross') + 0.6);
      tl.to($('#blues circle'), { y: 260, opacity: 0, duration: 0.9, ease: 'power2.in', stagger: 0.1 }, K('fade'));
    },
  },
});
