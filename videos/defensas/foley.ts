#!/usr/bin/env node
// Cartoon foley for "defensas": a layer of sound effects with their own level, on top of the synthesized music.
//   usage: node videos/defensas/foley.ts            (run it after any change to scenes.json, then render)
//   1) runs core/music.ts -> music.wav (the score with its own sfx), 2) synthesizes foley.wav from the cues below,
//   3) writes own-music.wav = music + foley (+FOLEY_DB). mix.ts puts it 16 dB under the voice, so the foley lands ~4 dB under it (and ducks while someone talks).
//   Deterministic: no clocks, a seeded noise. Explosions are soft (low-passed, short, no clipping).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const V = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(V, '../..');
const r = spawnSync(process.execPath, [path.join(ROOT, 'core', 'music.ts'), V], { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status || 1);

type Sc = { id: string; t0: number; t1: number; keys?: { id: string; t: number }[]; marks?: { k: string; dt?: number; z?: number }[] };
const P: { duration: number; scenes: Sc[] } = JSON.parse(fs.readFileSync(path.join(V, 'scenes.json'), 'utf8'));
const sc = (id: string) => { const s = P.scenes.find((x) => x.id === id); if (!s) throw new Error('no scene ' + id); return s; };
const K = (id: string, k: string) => { const c = sc(id).keys?.find((x) => x.id === k); if (!c) throw new Error(`no key ${id}.${k}`); return c.t; };
const T0 = (id: string) => sc(id).t0, T1 = (id: string) => sc(id).t1;

const SR = 48000, N = Math.ceil(P.duration * SR), TAU = 2 * Math.PI;
const L = new Float32Array(N), R = new Float32Array(N);
let seed = 7654321; const noise = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
function add(t0: number, dur: number, fn: (u: number) => number, vol: number, pan = 0) {
  const a = Math.max(0, Math.floor(t0 * SR)), b = Math.min(N, Math.floor((t0 + dur) * SR));
  const gl = vol * Math.cos((pan + 1) * Math.PI / 4), gr = vol * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = a; i < b; i++) { const v = fn(i / SR - t0); L[i] += v * gl; R[i] += v * gr; }
}
const env = (u: number, a: number, d: number) => Math.min(1, u / a) * Math.exp(-u * d);
const lp = (k: number) => { let y = 0; return (x: number) => (y += k * (x - y)); };   // one-pole low-pass

// ---- the sounds
const boing = (t: number, v = 0.35, f = 330, pan = 0) => { let ph = 0; add(t, 0.45, (u) => { ph += TAU * (f * (1 + 0.35 * Math.sin(TAU * 18 * u) * Math.exp(-u * 6)) * (1 + u * 0.6)) / SR; return Math.sin(ph) * env(u, 0.004, 7); }, v, pan); };
const slide = (t: number, d = 0.6, f0 = 380, f1 = 1700, v = 0.22) => { let ph = 0; add(t, d, (u) => { ph += TAU * (f0 + (f1 - f0) * Math.max(0, u / d) ** 1.4) / SR; return (Math.sin(ph) + 0.25 * Math.sin(2 * ph)) * Math.min(1, u / 0.02) * Math.min(1, (d - u) / 0.05); }, v); };
const whoosh = (t: number, d = 0.4, v = 0.3, pan = 0) => { const f = lp(0.12); add(t, d, (u) => f(noise()) * Math.sin(Math.PI * u / d) ** 2 * 3, v, pan); };
const bonk = (t: number, v = 0.4) => { add(t, 0.25, (u) => (Math.sin(TAU * 780 * u) * 0.7 + Math.sin(TAU * 1240 * u) * 0.4) * env(u, 0.001, 28), v); add(t, 0.2, (u) => Math.sin(TAU * (140 - 200 * u) * u) * env(u, 0.002, 20), v * 0.9); };
const clank = (t: number, v = 0.3, base = 520, pan = 0) => { const fr = [1, 2.51, 4.23, 6.07].map((k) => k * base); add(t, 0.5, (u) => fr.reduce((a, f, j) => a + Math.sin(TAU * f * u) * Math.exp(-u * (9 + j * 6)) / (j + 1), 0) * Math.min(1, u / 0.001) + noise() * Math.exp(-u * 120) * 0.4, v, pan); };
const boom = (t: number, v = 0.4) => {   // soft cartoon explosion: low-passed noise puff + a falling sub, 3 ms attack
  const f1 = lp(0.06), f2 = lp(0.25);
  add(t, 0.75, (u) => f2(f1(noise()) * 3) * env(u, 0.003, 5.5), v * 1.6);
  add(t, 0.5, (u) => Math.sin(TAU * (70 * u - 40 * u * u)) * env(u, 0.004, 7), v * 0.8);
};
const crackle = (t: number, d = 0.25, v = 0.18) => { for (let i = 0; i < 9; i++) { const ti = t + (i * 0.37 % 1) * d; add(ti, 0.02, (u) => noise() * Math.exp(-u * 300), v * (0.5 + (i % 3) * 0.25), (i % 2 ? 0.3 : -0.3)); } };
const plip = (t: number, v = 0.22, f = 900) => add(t, 0.12, (u) => Math.sin(TAU * (f * u - 2800 * u * u)) * env(u, 0.002, 30), v);
const puff = (t: number, v = 0.2) => { const f = lp(0.08); add(t, 0.35, (u) => f(noise()) * 3 * env(u, 0.02, 9), v); };
const slap = (t: number, v = 0.3) => { const f = lp(0.4); add(t, 0.08, (u) => f(noise()) * Math.exp(-u * 70), v); add(t, 0.1, (u) => Math.sin(TAU * 220 * u) * Math.exp(-u * 50), v * 0.5); };
const step = (t: number, v = 0.18) => add(t, 0.08, (u) => Math.sin(TAU * (160 - 400 * u) * u) * Math.exp(-u * 50), v);
const twinkle = (t: number, v = 0.06) => [0, 0.09, 0.18].forEach((dt, j) => add(t + dt, 0.3, (u) => Math.sin(TAU * [2093, 2637, 3136][j] * u) * env(u, 0.002, 14), v, j - 1));
const hiss = (t: number, d: number, v = 0.05) => { let y = 0; add(t, d, (u) => { const n = noise(); y += 0.6 * (n - y); return (n - y) * Math.min(1, u / 0.2) * Math.min(1, (d - u) / 0.3); }, v); };
const gurgle = (t: number, d: number, v = 0.12) => { for (let ti = t; ti < t + d; ti += 0.17) plip(ti + ((ti * 7.3) % 0.06), v * 0.6, 420 + ((ti * 113) % 260)); };
const snap = (t: number, v = 0.35) => { add(t, 0.03, () => noise(), v); let ph = 0; add(t + 0.01, 0.5, (u) => { ph += TAU * (220 - 120 * u) / SR; return (2 * ((ph / TAU) % 1) - 1) * env(u, 0.002, 7); }, v * 0.35); };
const flip = (t: number, v = 0.12) => { const f = lp(0.3); add(t, 0.22, (u) => f(noise()) * Math.sin(Math.PI * u / 0.22) * (1 + Math.sin(TAU * 40 * u)) * 0.5, v); };
const ratchet = (t: number, n = 5, v = 0.12) => { for (let i = 0; i < n; i++) add(t + i * 0.06, 0.03, (u) => (Math.sin(TAU * 2400 * u) + noise() * 0.5) * Math.exp(-u * 160), v); };
const jingle = (t: number, v = 0.12) => [0, 0.07, 0.15].forEach((dt, j) => clank(t + dt, v, 1300 + j * 210, j - 1));
const honk = (t: number, v = 0.12) => [0, 0.22].forEach((dt) => { let ph = 0; add(t + dt, 0.16, (u) => { ph += TAU * 330 / SR; return (Math.sin(ph) > 0 ? 0.6 : -0.6) * Math.min(1, u / 0.01) * Math.min(1, (0.16 - u) / 0.02); }, v); });
const vroom = (t: number, d = 1.2, v = 0.16) => { let ph = 0; const f = lp(0.2); add(t, d, (u) => { ph += TAU * (70 + 110 * (u / d)) / SR; return f(2 * ((ph / TAU) % 1) - 1) * (0.7 + 0.3 * Math.sin(TAU * 22 * u)) * Math.min(1, u / 0.05) * Math.min(1, (d - u) / 0.15); }, v); };
// a running engine: soft low "putt" pulses and light valve ticks
const engine = (t0: number, t1: number, rate = 6, v = 0.07) => { for (let t = t0; t < t1 - 0.05; t += 1 / rate) { add(t, 0.1, (u) => Math.sin(TAU * 58 * u) * env(u, 0.004, 30), v); add(t + 0.5 / rate, 0.03, (u) => (Math.sin(TAU * 3100 * u) + noise() * 0.4) * Math.exp(-u * 200), v * 0.25); } };
const whirr = (t0: number, d: number, v = 0.06) => { let ph = 0; add(t0, d, (u) => { ph += TAU * (90 + 70 * Math.min(1, u / 0.8)) / SR; return (Math.sin(ph) + 0.3 * Math.sin(3 * ph)) * Math.min(1, u / 0.3) * Math.min(1, (d - u) / 0.2); }, v); };

const ding = (t: number, v = 0.13) => [[1568, 0], [2349, 0.05]].forEach(([f, dt]) => add(t + dt, 0.6, (u) => (Math.sin(TAU * f * u) + 0.3 * Math.sin(TAU * f * 2.76 * u) * Math.exp(-u * 8)) * env(u, 0.002, 6), v));
// ---- extra sounds for the plane
const jet = (t0: number, d: number, v = 0.08, f0 = 220, f1 = 260) => { let ph = 0; const lpf = lp(0.15); add(t0, d, (u) => { ph += TAU * (f0 + (f1 - f0) * Math.min(1, u / d)) / SR; return (Math.sin(ph) * 0.5 + Math.sin(ph * 2.01) * 0.25 + lpf(noise()) * 1.4) * Math.min(1, u / 0.25) * Math.min(1, (d - u) / 0.25); }, v); };
const spindown = (t: number, v = 0.1) => { let ph = 0; add(t, 1.6, (u) => { ph += TAU * (260 * Math.exp(-u * 1.6) + 40) / SR; return Math.sin(ph) * Math.exp(-u * 1.4); }, v); };
const wind = (t0: number, d: number, v = 0.06) => { const f = lp(0.05); add(t0, d, (u) => f(noise()) * 4 * (0.7 + 0.3 * Math.sin(TAU * 0.7 * u)) * Math.min(1, u / 0.3) * Math.min(1, (d - u) / 0.3), v); };
const click = (t: number, v = 0.3) => { add(t, 0.04, (u) => (Math.sin(TAU * 2600 * u) + noise() * 0.5) * Math.exp(-u * 150), v); add(t + 0.06, 0.05, (u) => (Math.sin(TAU * 1800 * u) + noise() * 0.4) * Math.exp(-u * 120), v * 0.8); };
const bell = (t: number, v = 0.12) => [0, 0.18].forEach((dt) => add(t + dt, 0.6, (u) => (Math.sin(TAU * 2200 * u) + 0.5 * Math.sin(TAU * 3300 * u)) * env(u, 0.002, 7), v));
const thud = (t: number, v = 0.35) => add(t, 0.25, (u) => Math.sin(TAU * (90 - 60 * u) * u) * env(u, 0.002, 18) + noise() * Math.exp(-u * 60) * 0.3, v);
const paper = (t: number, v = 0.12) => { const f = lp(0.5); add(t, 0.35, (u) => f(noise()) * Math.sin(Math.PI * u / 0.35), v); };

// ---- the cues, scene by scene (times match the animation in visuals3d.ts)
const sneeze = (t: number, v = 0.3) => { hiss(t - 0.9, 0.85, 0.05); const f = lp(0.35); add(t, 0.45, (u) => f(noise()) * 2.5 * env(u, 0.01, 7), v); add(t, 0.25, (u) => Math.sin(TAU * (520 - 300 * u) * u) * env(u, 0.005, 12), v * 0.4); };
const siren = (t0: number, t1: number, v = 0.05) => { let ph = 0; add(t0, t1 - t0, (u) => { ph += TAU * (Math.floor(u * 4) % 2 ? 660 : 880) / SR; return Math.sin(ph) * Math.min(1, u / 0.05) * Math.min(1, (t1 - t0 - u) / 0.1); }, v); };
const chomp = (t: number, v = 0.25) => { slap(t, v); plip(t + 0.12, v * 0.6, 260); };
const burp = (t: number, v = 0.18) => { let ph = 0; add(t, 0.5, (u) => { ph += TAU * (95 + 30 * Math.sin(TAU * 7 * u)) / SR; return (2 * ((ph / TAU) % 1) - 1) * env(u, 0.03, 5); }, v); };
boing(T0('hook') + 0.15, 0.18, 300); twinkle(K('hook', 'bac'), 0.05); puff(K('hook', 'bac') + 1.6, 0.12); plip(K('hook', 'bac') + 1.62, 0.12, 1200);
thud(K('varicela', 'var') + 0.1, 0.25); clank(K('varicela', 'var') + 0.1, 0.12, 700);
boing(K('flojera', 'dota') - 0.1, 0.2, 340); slap(K('idiota', 'palm') + 0.12); twinkle(K('promesa', 'lock'), 0.06);
whoosh(K('adentro', 'corta') - 0.1, 0.4, 0.14); paper(K('auch', 'cut') - 0.15, 0.16); slap(K('auch', 'cut'), 0.25); whoosh(K('auch', 'zoom'), T1('auch') - K('auch', 'zoom') + 0.3, 0.22);
for (let t = T0('piel') + 0.4; t < T1('piel') - 0.2; t += 0.29) boing(t, 0.07, 420 + ((t * 97) % 160));
crackle(K('puerta', 'crack'), 0.3, 0.16); thud(K('puerta', 'crack'), 0.25); for (let t = K('puerta', 'entran') - 0.6; t < T1('puerta') - 0.1; t += 0.18) step(t, 0.08);
siren(K('alarma', 'alarm'), T1('alarma') + 0.3);
whoosh(K('vasos', 'open'), 0.8, 0.18); gurgle(T0('vasos'), T1('vasos') - T0('vasos'), 0.08);
boing(K('roja', 'roja'), 0.12, 200); boing(K('roja', 'hinchada'), 0.14, 180); twinkle(K('inflam', 'name'), 0.05);
chomp(K('comelones', 'eat')); chomp(K('comelones', 'pop')); chomp(K('comelones', 'pop') + 0.35); twinkle(K('macro', 'name'), 0.05);
burp(K('provecho', 'dota') + 0.5);
sneeze(K('virus', 'sneeze')); plip(K('virus', 'sneeze') + 0.7, 0.14, 700);
whoosh(K('fabrica', 'in') - 0.5, 0.6, 0.14); for (let t = K('fabrica', 'fab'); t < K('fabrica', 'more') + 0.3; t += 0.12) plip(t, 0.07, 900 + ((t * 300) % 500));
flip(K('bandera', 'flag'), 0.14); whoosh(K('asesinos', 'tcell') - 0.3, 0.6, 0.18); boom(K('asesinos', 'boom'), 0.3); crackle(K('asesinos', 'boom') + 0.05, 0.3, 0.12); twinkle(K('linfo', 'name'), 0.05);
for (let i = 0; i < 5; i++) plip(K('anticuerpos', 'fire') + i * 0.18, 0.12, 1100);
for (let i = 0; i < 3; i++) { click(K('pinzas', 'stick') + i * 0.2, 0.12); boing(K('pinzas', 'bounce') + i * 0.25, 0.14, 360); }
slide(K('fiebre', 'temp') - 0.3, 0.9, 300, 900, 0.1); plip(K('noesvirus', 'no'), 0.1, 800);
hiss(K('calor', 'hot') - 0.2, T1('calor') - K('calor', 'hot'), 0.04); for (let t = T0('sudan') + 0.2; t < T1('sudan'); t += 0.7) { whoosh(t, 0.3, 0.1); plip(t + 0.35, 0.05, 500); }
click(K('prometi', 'open'), 0.2); twinkle(K('prometi', 'open') + 0.1, 0.06);
flip(K('foto', 'album'), 0.14); ding(K('foto', 'foto') + 0.1, 0.12); twinkle(K('memoria', 'name'), 0.05);
whoosh(K('regresa', 'back') - 0.4, 0.6, 0.14); ding(K('regresa', 'know') + 0.1, 0.12); bonk(K('regresa', 'out'), 0.3); slide(K('regresa', 'out') + 0.05, 0.6, 900, 1800, 0.1);
twinkle(K('dosveces', 'dos'), 0.06); boing(K('dosveces', 'dos') + 0.1, 0.16, 400); twinkle(K('vacuna', 'foto'), 0.06);
whoosh(K('antibio', 'pill') - 0.4, 0.8, 0.14); puff(K('antibio', 'pill') + 0.7, 0.14); for (let i = 0; i < 6; i++) plip(K('antibio', 'virus') + i * 0.09, 0.07, 700 + (i % 2) * 200);
paper(K('receta', 'rx') - 0.1, 0.16); for (let i = 0; i < 3; i++) boing(K('guerras', 'win') + i * 0.14, 0.12, 380 + i * 60);
boing(T0('sub') + 0.05, 0.22, 260); ding(T0('sub') + 0.35, 0.14); sneeze(K('sub', 'achoo'), 0.22);

// every piece marker (scenes.json "marks"): a bright "ding" as the ring lands, and a whoosh when the camera zooms to it
for (const s of P.scenes) for (const m of s.marks || []) { const t = K(s.id, m.k) + (m.dt || 0); ding(t + 0.12); if (m.z) whoosh(t + 0.15, 0.35, 0.18); }

// ---- foley.wav (float), then own-music.wav = music + foley
const FOLEY_DB = 12;
const wav = (file: string, a: Float32Array, b: Float32Array) => {
  const n = a.length, buf = Buffer.alloc(44 + n * 8);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 8, 4); buf.write('WAVE', 8); buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(3, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 8, 28); buf.writeUInt16LE(8, 32); buf.writeUInt16LE(32, 34); buf.write('data', 36); buf.writeUInt32LE(n * 8, 40);
  for (let i = 0; i < n; i++) { buf.writeFloatLE(a[i], 44 + i * 8); buf.writeFloatLE(b[i], 48 + i * 8); }
  fs.writeFileSync(file, buf);
};
const fw = path.join(V, 'foley.wav'); wav(fw, L, R);
let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
const f = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', path.join(V, 'music.wav'), '-i', fw, '-filter_complex',
  `[1:a]volume=${FOLEY_DB}dB[f];[0:a][f]amix=inputs=2:normalize=0:duration=first`, '-c:a', 'pcm_f32le', path.join(V, 'own-music.wav')], { stdio: 'inherit' });
if (f.status !== 0) process.exit(1);
console.log(`foley.wav: peak ${(20 * Math.log10(pk)).toFixed(1)} dBFS, mixed at +${FOLEY_DB} dB into own-music.wav (render now: node core/render.ts videos/defensas)`);
